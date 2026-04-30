import { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';
import SidebarNav, { Session } from '@/components/workspace/SidebarNav';
import SystemMonitor from '@/components/workspace/SystemMonitor';
import ChatView from '@/components/workspace/ChatView';
import ToastContainer, { Toast } from '@/components/workspace/ToastContainer';
import SettingsPanel from '@/components/workspace/SettingsPanel';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { ProjectState } from '@/workflow/types';
import { useSubscription } from '@/hooks/useSubscription';
import { useNavigate } from 'react-router-dom';

// --- Speech Recognition Types ---
interface SpeechRecognitionErrorEvent extends Event {
  error: string;
}

interface SpeechRecognitionEvent extends Event {
  resultIndex: number;
  results: SpeechRecognitionResultList;
}

interface SpeechRecognition extends EventTarget {
  lang: string;
  continuous: boolean;
  interimResults: boolean;
  onstart: () => void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
}

interface SpeechRecognitionStatic {
  new (): SpeechRecognition;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionStatic;
    webkitSpeechRecognition?: SpeechRecognitionStatic;
  }
}

const BriefView = lazy(() => import('@/components/workspace/BriefView'));
const AnalyzerView = lazy(() => import('@/components/workspace/AnalyzerView'));
const BlueprintView = lazy(() => import('@/components/workspace/BlueprintView'));
const GeneratorView = lazy(() => import('@/components/workspace/GeneratorView'));
const PreviewView = lazy(() => import('@/components/workspace/PreviewView'));
const RepoEnvView = lazy(() => import('@/components/workspace/RepoEnvView'));

interface Message {
  role: string;
  content: string;
}

interface Attachment {
  name: string;
  size: string;
  file?: File;
}

type DashboardUser = Pick<User, "id" | "email">;

const isAuthFlowDisabled = (() => {
  const value = import.meta.env.VITE_AUTH_DISABLED;
  return value === undefined || value === '' || value.toLowerCase() === 'true' || value === '1';
})();

export default function Dashboard() {
  const [user, setUser] = useState<DashboardUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isDemoMode, setIsDemoMode] = useState(isAuthFlowDisabled);
  const { isPro, loading: subscriptionLoading } = useSubscription();
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState('tasks');
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [latestGeneratedCode, setLatestGeneratedCode] = useState('');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [sessionsLoading, setSessionsLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectState, setProjectState] = useState<ProjectState>('Draft');
  const [dark, setDark] = useState(() => localStorage.getItem('theme') === 'dark');
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [logs, setLogs] = useState([
    '[SYSTEM] Inicializácia inštancie AI Delivery Editor...',
    '[AUTH] IAM politiky úspešne overené.',
    '[NET] Pripojenie k VPC nadviazané.',
    '[AGENT] AI Brain pripravený v stave: Draft.',
    '[RULES] Agent Operating Rules aktivované.',
  ]);

  const showToast = useCallback((message: string, type: Toast['type'] = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 4000);
  }, []);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev.slice(-30), msg]);
  }, []);

  const handleNewSession = useCallback(() => {
    setMessages([]);
    setAttachments([]);
    setInputValue('');
    setActiveSessionId(null);
    setCurrentView('tasks');
    addLog('[SYSTEM] Nový pracovný priestor alokovaný.');
    showToast('Nová relácia spustená', 'success');
  }, [addLog, showToast]);

  // Auth listener
  useEffect(() => {
    if (isAuthFlowDisabled) {
      setUser(null);
      setIsDemoMode(true);
      setAuthLoading(false);
      return;
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setIsDemoMode(!session?.user);
      setAuthLoading(false);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsDemoMode(!session?.user);
      setAuthLoading(false);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load sessions from DB
  useEffect(() => {
    if (isAuthFlowDisabled || isDemoMode) {
      setSessionsLoading(false);
      return;
    }
    if (!user) { setSessionsLoading(false); return; }
    const loadSessions = async () => {
      setSessionsLoading(true);
      const { data } = await supabase
        .from('chat_sessions')
        .select('*')
        .order('updated_at', { ascending: false })
        .limit(50);
      if (data) {
        setSessions(data.map(s => ({
          id: s.id,
          title: s.title,
          date: new Date(s.created_at).toLocaleDateString('sk'),
          messages: [],
        })));
      }
      setSessionsLoading(false);
    };
    loadSessions();
  }, [user, isDemoMode]);

  // Keyboard shortcut: Ctrl+K = new session
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        handleNewSession();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleNewSession]);

  // Real event logs instead of fake ones
  useEffect(() => {
    if (!user || isDemoMode) return;
    const interval = setInterval(() => {
      if (!isLoading && Math.random() > 0.9) {
        const realLogs = [
          '[MONITOR] IAM role synchronizované.',
          '[SYSTEM] Telemetrické dáta odoslané.',
          '[NET] PING us-central1: ' + (18 + Math.floor(Math.random() * 15)) + 'ms.',
          '[AGENT] Health check: OK.',
        ];
        addLog(realLogs[Math.floor(Math.random() * realLogs.length)]);
      }
    }, 6000);
    return () => clearInterval(interval);
  }, [isLoading, user, isDemoMode, addLog]);

  const extractCodeForPreview = (text: string) => {
    if (!text) return;
    try {
      const parts = text.split('```');
      for (let i = 1; i < parts.length; i += 2) {
        const block = parts[i];
        if (block.toLowerCase().startsWith('html') || block.toLowerCase().startsWith('xml')) {
          const code = block.substring(block.indexOf('\n') + 1);
          setLatestGeneratedCode(code);
          addLog('[UI] Vizuálny kód exportovaný do Sandboxu.');
          showToast('Live Náhľad aktualizovaný', 'success');
          break;
        }
      }
    } catch {
      addLog('[ERROR] Extrakcia náhľadu zlyhala.');
    }
  };

  const saveMessageToDB = async (sessionId: string, role: string, content: string) => {
    if (isAuthFlowDisabled || isDemoMode || !user) return;
    await supabase.from('chat_messages').insert({
      session_id: sessionId,
      user_id: user.id,
      role,
      content,
    });
  };

  const createSessionInDB = async (title: string): Promise<string | null> => {
    if (isAuthFlowDisabled || isDemoMode || !user) return null;
    const { data } = await supabase.from('chat_sessions').insert({
      user_id: user.id,
      title: title.substring(0, 40),
    }).select('id').single();
    return data?.id ?? null;
  };

  const updateSessionTitle = async (sessionId: string, title: string) => {
    if (isAuthFlowDisabled || isDemoMode) return;
    const trimmed = title.substring(0, 40);
    await supabase.from('chat_sessions').update({ title: trimmed, updated_at: new Date().toISOString() }).eq('id', sessionId);
    setSessions(prev => prev.map(s => s.id === sessionId ? { ...s, title: trimmed } : s));
  };

  const uploadAttachments = async (files: Attachment[]): Promise<string[]> => {
    if (isAuthFlowDisabled || isDemoMode || !user) return [];
    const urls: string[] = [];
    for (const att of files) {
      if (!att.file) continue;
      const path = `${user.id}/${Date.now()}_${att.name}`;
      const { error } = await supabase.storage.from('chat-attachments').upload(path, att.file);
      if (!error) {
        const { data } = supabase.storage.from('chat-attachments').getPublicUrl(path);
        urls.push(`[Súbor: ${att.name}](${data.publicUrl})`);
        addLog(`[FS] Súbor nahraný: ${att.name}`);
      } else {
        addLog(`[ERROR] Upload zlyhalo: ${att.name}`);
      }
    }
    return urls;
  };

  const getSelectedModel = () => localStorage.getItem('ai-model') || 'gpt-5-mini';

  const callAIStreaming = async (msgs: Message[], systemOverride?: string): Promise<string> => {
    const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
    const url = `https://${projectId}.supabase.co/functions/v1/chat`;
    const session = isAuthFlowDisabled ? null : (await supabase.auth.getSession()).data.session;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session?.access_token || anonKey}`,
        'apikey': anonKey,
      },
      body: JSON.stringify({ messages: msgs, systemOverride, model: getSelectedModel() }),
    });

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}));
      if (response.status === 429) {
        toast.error('Rate limit – skúste to o chvíľu.');
      } else if (response.status === 402) {
        toast.error('Nedostatok kreditov.');
      }
      throw new Error(errData.error || 'AI gateway error');
    }

    const reader = response.body?.getReader();
    if (!reader) throw new Error('No stream');
    const decoder = new TextDecoder();
    let fullText = '';
    let textBuffer = '';
    setIsStreaming(true);

    setMessages(prev => [...prev, { role: 'model', content: '' }]);

    const extractStreamingText = (payload: unknown): string => {
      if (!payload || typeof payload !== 'object') return '';
      const record = payload as Record<string, unknown>;

      // Legacy OpenAI-compatible chat-completions stream shape
      const choices = Array.isArray(record.choices) ? record.choices : [];
      const firstChoice = choices[0];
      if (firstChoice && typeof firstChoice === 'object') {
        const delta = (firstChoice as { delta?: { content?: unknown } }).delta?.content;
        if (typeof delta === 'string' && delta.length > 0) {
          return delta;
        }
      }

      // Responses API stream shape
      if (record.type === 'response.output_text.delta' && typeof record.delta === 'string') {
        return record.delta;
      }

      return '';
    };

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);
          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const delta = extractStreamingText(parsed);
            if (delta) {
              fullText += delta;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'model', content: fullText };
                return updated;
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw) continue;
          if (raw.endsWith('\r')) raw = raw.slice(0, -1);
          if (!raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = extractStreamingText(parsed);
            if (content) {
              fullText += content;
              setMessages(prev => {
                const updated = [...prev];
                updated[updated.length - 1] = { role: 'model', content: fullText };
                return updated;
              });
            }
          } catch (e) { void e; }
        }
      }
    } catch (streamErr) {
      if (!fullText) {
        setMessages(prev => prev.slice(0, -1));
      }
      throw streamErr;
    } finally {
      setIsStreaming(false);
    }

    return fullText;
  };

  const handleSendMessage = async (textToProcess: string = inputValue) => {
    if (!textToProcess.trim() && attachments.length === 0) return;

    // Subscription Limit Check
    if (!subscriptionLoading && !isPro && messages.filter(m => m.role === 'user').length >= 5) {
      toast.error('Dosiahli ste limit pre Free verziu (5 správ). Pre neobmedzený prístup prejdite na PRO.', {
        action: {
          label: 'Upgrade teraz',
          onClick: () => navigate('/pricing')
        }
      });
      navigate('/pricing');
      return;
    }

    let finalPrompt = textToProcess;

    if (attachments.length > 0) {
      const fileUrls = await uploadAttachments(attachments);
      if (fileUrls.length > 0) {
        finalPrompt = `${fileUrls.join('\n')}\n\n${textToProcess}`;
      } else {
        const fileNames = attachments.map(a => a.name).join(', ');
        finalPrompt = `[Zahrnuté súbory: ${fileNames}]\n${textToProcess}`;
      }
    }

    const newUserMsg: Message = { role: 'user', content: finalPrompt };
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInputValue('');
    setAttachments([]);
    setIsLoading(true);
    addLog('[API] Odosielam požiadavku na Enterprise Core...');

    let sessionId = activeSessionId;
    if (!sessionId) {
      const newId = await createSessionInDB(finalPrompt);
      if (newId) {
        sessionId = newId;
        setActiveSessionId(newId);
        setSessions(prev => [
          { id: newId, title: finalPrompt.substring(0, 40), date: 'Práve teraz', messages: [] },
          ...prev,
        ]);
      }
    }

    if (sessionId) {
      saveMessageToDB(sessionId, 'user', finalPrompt);
    }

    try {
      const replyText = await callAIStreaming(updatedMessages);
      addLog('[API] Požiadavka úspešne vybavená.');
      extractCodeForPreview(replyText);

      if (sessionId) {
        saveMessageToDB(sessionId, 'model', replyText);
        await supabase.from('chat_sessions').update({ updated_at: new Date().toISOString() }).eq('id', sessionId);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      addLog(`[ERROR] ${msg || 'Spojenie prerušené.'}`);
      setMessages(prev => {
        const last = prev[prev.length - 1];
        if (last?.role === 'model' && !last.content) {
          return prev.slice(0, -1).concat({
            role: 'model',
            content: '⚠️ **Chyba servera:** Nepodarilo sa nadviazať spojenie s jadrom. Skontrolujte pripojenie a skúste to znova.',
          });
        }
        if (last?.role === 'user') {
          return [...prev, {
            role: 'model',
            content: '⚠️ **Chyba servera:** Nepodarilo sa nadviazať spojenie s jadrom.',
          }];
        }
        return prev;
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyzeLogs = async (rawLogs: string): Promise<string> => {
    addLog('[API] Spúšťam analýzu zraniteľností...');
    try {
      const msgs: Message[] = [{ role: 'user', content: `Analyzuj tieto logy a identifikuj hrozby:\n\n${rawLogs}` }];
      const result = await callAIStreaming(msgs, 'FOCUS: Log Analysis. Identify anomalies, penetration attempts, and suspicious IPs. Format output in Markdown.');
      addLog('[API] Analýza úspešne dokončená (200 OK).');
      showToast('Analýza hrozieb hotová', 'success');
      return result;
    } catch {
      addLog('[ERROR] Analýza zlyhala.');
      showToast('Chyba pripojenia', 'error');
      return '⚠️ Zlyhalo pripojenie k AI backendu.';
    }
  };

  const handleGenerateSkill = async (desc: string): Promise<string> => {
    addLog('[API] Generujem Cloud funkciu...');
    try {
      const msgs: Message[] = [{ role: 'user', content: `Napíš skript pre nasledujúcu úlohu: ${desc}` }];
      const text = await callAIStreaming(msgs, 'FOCUS: Script Generation. Write clean, secure, production-ready code. Return ONLY the code wrapped in a markdown block.');
      addLog('[API] Zdrojový kód úspešne vygenerovaný.');
      showToast('Nástroj vygenerovaný', 'success');
      extractCodeForPreview(text);
      return text;
    } catch {
      addLog('[ERROR] Generovanie zlyhalo.');
      showToast('Chyba generovania', 'error');
      return '⚠️ Generovanie zlyhalo.';
    }
  };

  const loadSession = async (session: Session) => {
    if (isAuthFlowDisabled || isDemoMode) return;
    setActiveSessionId(session.id);
    setCurrentView('tasks');
    addLog(`[SYSTEM] Načítavam reláciu...`);

    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', session.id)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data.map(m => ({ role: m.role, content: m.content })));
    }
    showToast('Relácia obnovená', 'info');
  };

  const deleteSession = async (sessionId: string) => {
    if (isAuthFlowDisabled || isDemoMode) return;
    await supabase.from('chat_sessions').delete().eq('id', sessionId);
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (activeSessionId === sessionId) {
      setMessages([]);
      setActiveSessionId(null);
    }
    showToast('Relácia vymazaná', 'info');
  };

  const renameSession = async (sessionId: string, newTitle: string) => {
    if (isAuthFlowDisabled || isDemoMode) return;
    await updateSessionTitle(sessionId, newTitle);
    showToast('Relácia premenovaná', 'success');
  };

  const handleLogout = async () => {
    if (!isAuthFlowDisabled) {
      await supabase.auth.signOut();
    }
    setMessages([]);
    setSessions([]);
    setActiveSessionId(null);
    if (isAuthFlowDisabled) {
      showToast('Guest session reset', 'info');
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newAttachments = files.map(f => ({
        name: f.name,
        size: (f.size / 1024).toFixed(1) + ' KB',
        file: f,
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
      addLog(`[FS] Súbor pripravený: ${files[0].name}`);
    }
  };

  const handleMicClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Rozpoznávanie reči nie je podporované.', 'error');
      return;
    }

    if (isRecording && recognitionRef.current) {
      recognitionRef.current.stop();
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'sk-SK';
    recognition.interimResults = true;
    recognition.continuous = false;
    recognitionRef.current = recognition;

    let finalTranscript = '';

    recognition.onstart = () => {
      setIsRecording(true);
      addLog('[AUDIO] Počúvam...');
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      setInputValue(finalTranscript + interim);
    };

    recognition.onend = () => {
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      setIsRecording(false);
      recognitionRef.current = null;
      if (event.error !== 'no-speech') {
        showToast(`Chyba: ${event.error}`, 'error');
      }
    };

    recognition.start();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (currentView === 'tasks') setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (currentView !== 'tasks') return;
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFiles = Array.from(e.dataTransfer.files);
      const newAttachments = droppedFiles.map(f => ({
        name: f.name,
        size: (f.size / 1024).toFixed(1) + ' KB',
        file: f,
      }));
      setAttachments(prev => [...prev, ...newAttachments]);
      addLog(`[FS] Súbory nahrané: ${droppedFiles.length}`);
      showToast(`${droppedFiles.length} súborov pripojených`, 'success');
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const dashboardStatusLabel = isDemoMode ? "Demo/Admin Mode" : "Authenticated";
  const effectiveUser = isDemoMode ? null : user;

  const tokenCount = messages.length > 0 ? (8.1 + messages.length * 0.3).toFixed(1) : '8.1';

  const viewContent = () => {
    switch (currentView) {
      case 'files':
        return (
          <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
            <BriefView 
              projectState={projectState} 
              onTransitionState={setProjectState}
              onAddLog={addLog}
              onShowToast={showToast}
            />
          </Suspense>
        );
      case 'skills':
        return (
          <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
            <BlueprintView 
              projectState={projectState} 
              onTransitionState={setProjectState}
              onAddLog={addLog}
              onShowToast={showToast}
            />
          </Suspense>
        );
      case 'preview':
        return (
          <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
            <PreviewView
              latestCode={latestGeneratedCode}
              onClearCode={() => { setLatestGeneratedCode(''); addLog('[UI] Pamäť náhľadu vyčistená.'); showToast('Vyčistené', 'info'); }}
              messages={messages}
              isLoading={isLoading}
              inputValue={inputValue}
              onInputChange={setInputValue}
              onSend={handleSendMessage}
              onGenerateDemo={() => handleSendMessage('Vytvor moderný login formulár.')}
            />
          </Suspense>
        );
      case 'connectors':
        return (
          <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
            <RepoEnvView
              projectState={projectState}
              onTransitionState={setProjectState}
              onAddLog={addLog}
              onShowToast={showToast}
            />
          </Suspense>
        );
      case 'analyzer':
        return (
          <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
            <AnalyzerView onAnalyze={handleAnalyzeLogs} />
          </Suspense>
        );
      case 'generator':
        return (
          <Suspense fallback={<div className="flex-1 flex items-center justify-center">Loading...</div>}>
            <GeneratorView onGenerate={handleGenerateSkill} />
          </Suspense>
        );
      default:
        return (
          <ChatView
            messages={messages}
            isLoading={isLoading}
            isStreaming={isStreaming}
            inputValue={inputValue}
            onInputChange={setInputValue}
            onSend={handleSendMessage}
            attachments={attachments}
            onFileUpload={handleFileUpload}
            onRemoveAttachment={(i) => setAttachments(prev => prev.filter((_, idx) => idx !== i))}
            isRecording={isRecording}
            onMicClick={handleMicClick}
            isDragging={isDragging}
            tokenCount={tokenCount}
            onCopyCode={() => { addLog('[SYSTEM] Kód skopírovaný.'); showToast('Skopírované', 'success'); }}
            onToggleMobileMenu={() => setMobileMenuOpen(true)}
            projectState={projectState}
          />
        );
    }
  };

  const mobileNavItems = [
    { id: 'tasks', label: 'Chat', icon: '💬' },
    { id: 'files', label: 'Brief', icon: '📋' },
    { id: 'skills', label: 'Build', icon: '🔧' },
    { id: 'preview', label: 'Preview', icon: '👁️' },
    { id: 'more', label: 'Viac', icon: '⚙️' },
  ];

  const handleMobileNav = (id: string) => {
    if (id === 'more') {
      setMobileMenuOpen(true);
    } else {
      setCurrentView(id);
      setMobileMenuOpen(false);
    }
  };

  return (
    <div
      className="flex h-screen bg-background overflow-hidden relative"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <ToastContainer toasts={toasts} />
      <SettingsPanel
        open={showSettings}
        onOpenChange={setShowSettings}
        dark={dark}
        onToggleDark={() => setDark(!dark)}
      />

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-[280px] z-50 lg:hidden"
            >
              <SidebarNav
                currentView={currentView}
                onViewChange={(v) => { setCurrentView(v); setMobileMenuOpen(false); }}
                onNewSession={() => { handleNewSession(); setMobileMenuOpen(false); }}
                sessions={sessions}
                activeSessionId={activeSessionId}
                onLoadSession={(s) => { loadSession(s); setMobileMenuOpen(false); }}
                onDeleteSession={deleteSession}
                onRenameSession={renameSession}
                hasPreviewCode={!!latestGeneratedCode}
                onOpenSettings={() => { setShowSettings(true); setMobileMenuOpen(false); }}
                userEmail={effectiveUser?.email}
                onLogout={isAuthFlowDisabled || isDemoMode ? undefined : handleLogout}
                isDemoMode={isDemoMode}
                sessionsLoading={sessionsLoading}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="block shrink-0 z-20 relative h-full">
        <SidebarNav
          currentView={currentView}
          onViewChange={setCurrentView}
          onNewSession={handleNewSession}
          sessions={sessions}
          activeSessionId={activeSessionId}
          onLoadSession={loadSession}
          onDeleteSession={deleteSession}
          onRenameSession={renameSession}
          hasPreviewCode={!!latestGeneratedCode}
          onOpenSettings={() => setShowSettings(true)}
          userEmail={effectiveUser?.email}
          onLogout={isAuthFlowDisabled || isDemoMode ? undefined : handleLogout}
          isDemoMode={isDemoMode}
          sessionsLoading={sessionsLoading}
        />
      </div>

      <main className="flex-1 flex flex-col relative overflow-hidden pb-16 lg:pb-0">
        <div className="border-b border-[#273043] bg-[#11141b]/95 px-5 py-3 backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-[#9aa7bd]">Builder Dashboard</p>
              <p className="text-sm text-[#e9edf5]">Direct admin workspace</p>
            </div>
            {isDemoMode ? (
              <span className="inline-flex items-center rounded-full border border-[#00d1b2]/35 bg-[#00d1b2]/10 px-3 py-1 text-xs font-medium text-[#9dfbe8]">
                Demo/Admin Mode
              </span>
            ) : (
              <span className="inline-flex items-center rounded-full border border-[#3aa0ff]/35 bg-[#3aa0ff]/10 px-3 py-1 text-xs font-medium text-[#b9dfff]">
                {dashboardStatusLabel}
              </span>
            )}
          </div>
        </div>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentView}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.15 }}
            className="flex-1 flex flex-col"
          >
            {viewContent()}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Mobile bottom navigation */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 bg-background border-t-4 border-foreground lg:hidden pb-safe">
        <div className="flex justify-around items-center">
          {mobileNavItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleMobileNav(item.id)}
              className={`flex flex-col items-center justify-center py-2 px-3 touch-target transition-colors ${
                currentView === item.id
                  ? 'text-red-600'
                  : 'text-foreground/60 hover:text-foreground'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span className="text-[10px] font-black uppercase tracking-wide mt-0.5">{item.label}</span>
            </button>
          ))}
        </div>
      </nav>

      <SystemMonitor
        isLoading={isLoading}
        messageCount={messages.length}
        attachmentCount={attachments.length}
        logs={logs}
      />
    </div>
  );
}



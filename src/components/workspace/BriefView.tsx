import { useState } from 'react';
import { 
  FileText, 
  StickyNote, 
  Paperclip, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ClipboardList,
  Loader2,
  X
} from 'lucide-react';
import { ProjectState } from '@/workflow/types';

interface BriefViewProps {
  projectState: ProjectState;
  onTransitionState: (newState: ProjectState) => void;
  onAddLog: (msg: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function BriefView({ 
  projectState, 
  onTransitionState, 
  onAddLog,
  onShowToast
}: BriefViewProps) {
  const [briefText, setBriefText] = useState('');
  const [projectNotes, setProjectNotes] = useState('');
  const [attachments, setAttachments] = useState<string[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Transition Draft -> Inputs Ready
  const handleMarkInputsReady = () => {
    if (!briefText.trim()) {
      onShowToast('Project Brief je povinný pre pokračovanie.', 'error');
      return;
    }
    setIsAnalyzing(true);
    
    // Simulating "Analysis" before marking as ready
    setTimeout(() => {
      onTransitionState('Inputs Ready');
      onAddLog('[WORKFLOW] Projektové vstupy boli overené a pripravené.');
      onShowToast('Vstupy pripravené – Workflow prechádza do fázy: Inputs Ready', 'success');
      setIsAnalyzing(false);
    }, 1500);
  };

  const isReady = briefText.trim().length > 10;
  const isInputsReady = projectState !== 'Draft';

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-10 overflow-y-auto w-full relative z-10 scrollbar-hide bg-background/50 m-4 rounded-2xl shadow-sm border border-border/50">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content: Input Areas */}
        <div className="lg:col-span-2 space-y-6">
          <div className="mb-4">
            <h2 className="text-2xl font-normal text-foreground flex items-center gap-2">
              <ClipboardList size={24} className="text-primary" />
              Brief & Požiadavky
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Definujte rozsah projektu, ciele a dôležité technické parametre.
            </p>
          </div>

          {/* Project Brief Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <FileText size={18} className="text-primary" />
              <h3 className="font-medium text-foreground">Project Brief</h3>
              {!briefText && <span className="text-[10px] bg-destructive/10 text-destructive px-2 py-0.5 rounded-full uppercase font-bold ml-auto">Povinné</span>}
            </div>
            <textarea
              value={briefText}
              onChange={(e) => setBriefText(e.target.value)}
              disabled={isInputsReady}
              placeholder="Vložte text projektového briefu (Wordpress FSE, Headless, Agency špecifikácie)..."
              className="w-full h-48 bg-accent/30 border border-border rounded-xl p-4 text-[14px] leading-relaxed text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none transition-all disabled:opacity-70"
            />
          </div>

          {/* Project Notes Card */}
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-4">
              <StickyNote size={18} className="text-primary" />
              <h3 className="font-medium text-foreground">Doplňujúce Poznámky</h3>
            </div>
            <textarea
              value={projectNotes}
              onChange={(e) => setProjectNotes(e.target.value)}
              disabled={isInputsReady}
              placeholder="Špecifické požiadavky na integrácie, pluginy, farebných formáty..."
              className="w-full h-32 bg-accent/30 border border-border rounded-xl p-4 text-[14px] leading-relaxed text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none resize-none transition-all disabled:opacity-70"
            />
          </div>

          {/* File Upload Placeholder */}
          <div className="bg-card border border-border/50 border-dashed rounded-2xl p-8 text-center bg-accent/10">
            <Paperclip size={24} className="text-muted-foreground mx-auto mb-2 opacity-50" />
            <p className="text-sm font-medium text-foreground">Priložiť súbory (PDF, TXT, DOCX)</p>
            <p className="text-xs text-muted-foreground mt-1">Nahrajte si dokumentáciu k webu, wireframy alebo grafické manuály.</p>
            <button className="mt-4 px-4 py-1.5 border border-border rounded-full text-xs font-medium hover:bg-accent transition-all text-muted-foreground" disabled={isInputsReady}>
              Vybrať súbory
            </button>
          </div>
        </div>

        {/* Sidebar: Summary & Readiness */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-0">
            <h3 className="font-medium text-foreground mb-6 text-lg">Zhrnutie Pripravenosti</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <FileText size={14} /> Project Brief
                </span>
                {briefText.length > 10 ? <CheckCircle2 size={16} className="text-success" /> : <AlertCircle size={16} className="text-muted-foreground/30" />}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <StickyNote size={14} /> Poznámky
                </span>
                {projectNotes ? <CheckCircle2 size={16} className="text-success" /> : <X size={16} className="text-muted-foreground/30" />}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Paperclip size={14} /> Prílohy
                </span>
                <span className="text-xs font-medium text-foreground bg-accent px-2 py-0.5 rounded-md">0</span>
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-foreground">Celkový stav:</span>
                <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                  isInputsReady 
                    ? 'bg-success/10 text-success' 
                    : isReady ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {isInputsReady ? 'Inputs Ready' : isReady ? 'Pripravené na analýzu' : 'Čaká sa na Brief'}
                </span>
              </div>

              {!isInputsReady ? (
                <button
                  onClick={handleMarkInputsReady}
                  disabled={!isReady || isAnalyzing}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-google-blue-hover transition-all flex items-center justify-center gap-2 font-medium shadow-md disabled:opacity-50 disabled:bg-muted"
                >
                  {isAnalyzing ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                  Mark Inputs Ready
                </button>
              ) : (
                <div className="p-4 bg-success/5 border border-success/20 rounded-xl">
                  <p className="text-xs text-success font-medium flex items-center gap-2">
                    <CheckCircle2 size={14} /> Workflow postúpil do ďalšej fázy.
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-2 text-center">
                    Teraz môžete pokračovať v sekcii <strong>Blueprint & Orchestration</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>

          {!isInputsReady && (
            <div className="p-5 border border-border border-dashed rounded-xl bg-accent/5">
              <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5">
                <AlertCircle size={10} /> Pravidlá pre AI Braine
              </h4>
              <p className="text-[11px] text-muted-foreground leading-relaxed italic">
                "Agent Operating Rules: Inspect first, modify second. Do not transition until requirements are clear."
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

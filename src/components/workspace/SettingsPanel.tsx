import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Sun, Moon, Cpu, Rocket } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AI_MODELS = [
  { id: 'gpt-5-mini', label: 'GPT-5 Mini', desc: 'Rýchly a nákladovo efektívny' },
  { id: 'gpt-5', label: 'GPT-5', desc: 'Silný všeobecný model pre kód a analýzu' },
  { id: 'gpt-5.4-mini', label: 'GPT-5.4 Mini', desc: 'Novšia mini verzia pre rýchle iterácie' },
  { id: 'gpt-5.4', label: 'GPT-5.4', desc: 'Najvyššia presnosť pre náročné tasky' },
  { id: 'o4-mini', label: 'o4-mini', desc: 'Rozumový model vhodný na technické úlohy' },
];

interface SettingsPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dark: boolean;
  onToggleDark: () => void;
}

export default function SettingsPanel({ open, onOpenChange, dark, onToggleDark }: SettingsPanelProps) {
  const [selectedModel, setSelectedModel] = useState(() => {
    const raw = localStorage.getItem('ai-model') || 'gpt-5-mini';
    if (raw.startsWith('openai/')) {
      return raw.slice('openai/'.length);
    }
    if (raw.startsWith('google/')) {
      return 'gpt-5-mini';
    }
    return raw;
  });

  useEffect(() => {
    localStorage.setItem('ai-model', selectedModel);
  }, [selectedModel]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[360px] sm:w-[400px] bg-card border-border">
        <SheetHeader>
          <SheetTitle className="text-foreground">Nastavenia</SheetTitle>
        </SheetHeader>

        <div className="mt-6 space-y-8">
          {/* Theme */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Vzhľad</h3>
            <div className="flex gap-3">
              <button
                onClick={() => { if (dark) onToggleDark(); }}
                className={`flex-1 flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${!dark ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:bg-accent'}`}
              >
                <Sun size={16} /> Svetlý
              </button>
              <button
                onClick={() => { if (!dark) onToggleDark(); }}
                className={`flex-1 flex items-center gap-2 p-3 rounded-xl border text-sm font-medium transition-all ${dark ? 'border-primary bg-primary/5 text-primary' : 'border-border text-muted-foreground hover:bg-accent'}`}
              >
                <Moon size={16} /> Tmavý
              </button>
            </div>
          </div>

          {/* AI Model */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Cpu size={16} /> AI Model
            </h3>
            <div className="space-y-2 text-left">
              {AI_MODELS.map(model => (
                <button
                  key={model.id}
                  onClick={() => setSelectedModel(model.id)}
                  className={`w-full text-left p-3 rounded-xl border text-sm transition-all ${
                    selectedModel === model.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-accent'
                  }`}
                >
                  <div className="font-medium text-foreground">{model.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{model.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Subscription */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <Sun size={16} /> Predplatné
            </h3>
            <div className="p-4 rounded-xl border border-border bg-accent/30">
              <div className="flex justify-between items-center mb-4 text-left">
                <div>
                  <div className="text-xs text-muted-foreground uppercase tracking-wider font-bold">Váš plán</div>
                  <div className="text-lg font-bold text-foreground">Free</div>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Rocket size={20} />
                </div>
              </div>
              <button
                onClick={async () => {
                   const { data: { session } } = await supabase.auth.getSession();
                   if (!session) return;
                   const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-portal`, {
                     method: 'POST',
                     headers: { Authorization: `Bearer ${session.access_token}` }
                   });
                   const { url } = await res.json();
                   if (url) window.location.href = url;
                }}
                className="w-full py-2 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover:bg-primary/90 transition-all active:scale-95"
              >
                Spravovať billing
              </button>
            </div>
          </div>

          {/* Keyboard shortcuts */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Klávesové skratky</h3>
            <div className="space-y-2 text-sm">
              {[
                ['Ctrl + K', 'Nová relácia'],
                ['Ctrl + /', 'Focus na vstup'],
                ['Enter', 'Odoslať správu'],
                ['Shift + Enter', 'Nový riadok'],
              ].map(([key, desc]) => (
                <div key={key} className="flex items-center justify-between py-1.5">
                  <span className="text-muted-foreground">{desc}</span>
                  <kbd className="px-2 py-1 bg-muted text-foreground rounded text-xs font-mono">{key}</kbd>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

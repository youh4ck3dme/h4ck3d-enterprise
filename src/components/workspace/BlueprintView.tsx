import { useState } from 'react';
import { 
  Code2, 
  Layout, 
  Layers, 
  Activity, 
  CheckCircle2, 
  Settings, 
  Play, 
  FileCode,
  Loader2,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { ProjectState } from '@/workflow/types';
import { MarkdownRenderer } from '@/lib/formatMarkdown';

interface BlueprintViewProps {
  projectState: ProjectState;
  onTransitionState: (newState: ProjectState) => void;
  onAddLog: (msg: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function BlueprintView({ 
  projectState, 
  onTransitionState, 
  onAddLog,
  onShowToast
}: BlueprintViewProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [blueprint, setBlueprint] = useState('');

  const isBlueprintReady = projectState !== 'Draft' && projectState !== 'Inputs Ready';
  const isApproved = ['Blueprint Approved', 'Phase In Progress', 'Testing', 'Passed', 'Failed', 'Review Pending', 'Ready for Deploy', 'Deployed'].includes(projectState);

  const handleGenerateBlueprint = () => {
    setIsGenerating(true);
    onAddLog('[AI] Spúšťam analýzu Briefu a Repozitára...');
    
    // Simulate complex AI blueprint generation
    setTimeout(() => {
      const mockBlueprint = `
# Technický Blueprint: AI Delivery Project

## 1. Architektúra Systému
- **Frontend**: React 18 + Vite (Tailwind CSS)
- **Backend**: Supabase Edge Functions (Deno)
- **Data**: PostgreSQL + Realtime Subscription
- **Auth**: Supabase Auth (JWT)

## 2. Implementačné Fázy
- **Fáza 1**: Core Setup & Data Schema
- **Fáza 2**: Workflow Engine & Components
- **Fáza 3**: AI Integration & Streaming
- **Fáza 4**: Testing & Hardening

## 3. Bezpečnostné Pravidlá
- RLS (Row Level Security) pre všetky tabuľky.
- Enforced Non-blocking shell operations.
- Gated Deployments via Approval.

## 4. Infraštruktúra
- Deployment Target: VPS via Docker Compose
- CI/CD: GitHub Actions (develop -> main)
      `;
      setBlueprint(mockBlueprint);
      onAddLog('[AI] Technický Blueprint vygenerovaný (98.4% confidence).');
      showToast('Blueprint pripravený na schválenie', 'success');
      setIsGenerating(false);
    }, 2500);
  };

  const handleApprove = () => {
    onTransitionState('Blueprint Approved');
    onAddLog('[WORKFLOW] Blueprint schválený. Pripravujem implementačné fázy...');
    onShowToast('Blueprint schválený – Prechádzam do fázy Orchestrácie.', 'success');
  };

  const showToast = (msg: string, type: 'success' | 'info' | 'error') => onShowToast(msg, type);

  return (
    <div className="flex-1 flex flex-col p-4 lg:p-8 overflow-y-auto w-full relative z-10 scrollbar-hide bg-background">
      <div className="max-w-5xl mx-auto w-full space-y-6 animate-fade-in">
        
        {/* Header section */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-2">
          <div>
            <h2 className="text-2xl font-normal text-foreground flex items-center gap-2">
              <Layers size={24} className="text-primary" />
              Blueprint & Orchestration
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Transformácia požiadaviek na technickú architektúru a plán realizácie.
            </p>
          </div>
          
          <div className="flex items-center gap-3">
             {blueprint && !isApproved && (
               <button 
                 onClick={handleApprove}
                 className="px-5 py-2 bg-success text-success-foreground rounded-full text-sm font-medium hover:bg-success/90 transition-all shadow-lg flex items-center gap-2"
               >
                 <CheckCircle2 size={16} /> Schváliť Blueprint
               </button>
             )}
             {!blueprint && isBlueprintReady && (
               <button 
                 onClick={handleGenerateBlueprint}
                 disabled={isGenerating}
                 className="px-5 py-2 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-google-blue-hover transition-all shadow-lg flex items-center gap-2"
               >
                 {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                 Generovať Blueprint
               </button>
             )}
          </div>
        </div>

        {!isBlueprintReady ? (
          <div className="bg-card border border-border border-dashed rounded-2xl p-12 text-center">
            <Layout size={40} className="text-muted-foreground/30 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-foreground">Blueprint je uzamknutý</h3>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto mt-2">
              Musíte dokončiť konfiguráciu <strong>Briefu</strong> a <strong>Repozitára</strong> predtým, než AI vygeneruje technický plán.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            
            {/* Main Blueprint View */}
            <div className="lg:col-span-3 space-y-6">
              {blueprint ? (
                <div className="bg-card border border-border rounded-2xl overflow-hidden shadow-sm animate-fade-in">
                  <div className="bg-muted/50 px-6 py-3 border-b border-border flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground uppercase tracking-widest">
                      <FileCode size={14} /> System Blueprint v1.0
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      <span className="text-[10px] font-bold text-success uppercase">Validované AI Brainom</span>
                    </div>
                  </div>
                  <div className="p-8 prose prose-invert max-w-none text-sm">
                    <MarkdownRenderer content={blueprint} />
                  </div>
                </div>
              ) : (
                <div className="bg-card border border-border rounded-2xl p-16 text-center shadow-sm">
                  {isGenerating ? (
                    <div className="space-y-6">
                      <div className="relative w-20 h-20 mx-auto">
                         <div className="absolute inset-0 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
                         <Sparkles size={30} className="absolute inset-0 m-auto text-primary animate-pulse" />
                      </div>
                      <div className="space-y-2">
                        <p className="text-lg font-medium text-foreground">Analyzujem technický kontext...</p>
                        <p className="text-sm text-muted-foreground animate-pulse">Skladám sub-systémy a bezpečnostné protokoly</p>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                       <Activity size={40} className="text-primary/40 mx-auto opacity-50" />
                       <h3 className="text-lg font-medium text-foreground">Pripravené na analýzu</h3>
                       <p className="text-sm text-muted-foreground max-w-md mx-auto">
                         Spustite generovanie Blueprintu. AI analyzuje váš Brief, Repository a Environment dáta pre vytvorenie optimálneho plánu.
                       </p>
                    </div>
                  )}
                </div>
              )}

              {/* Execution Phases (Mock) */}
              {isApproved && (
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm animate-fade-in">
                  <h3 className="font-medium text-foreground mb-4 flex items-center gap-2">
                    <Play size={18} className="text-success fill-success" />
                    Aktívna Orchestrácia: Fáza 1
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-success/5 border border-success/10 rounded-xl">
                      <div className="w-6 h-6 rounded-full bg-success text-success-foreground flex items-center justify-center text-[10px] font-bold">1</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground">Scaffolding Project Structure</p>
                        <p className="text-[11px] text-muted-foreground">Inicializácia repozitára a základných priečinkov</p>
                      </div>
                      <span className="text-[10px] font-bold text-success">DONE</span>
                    </div>
                    <div className="flex items-center gap-3 p-3 bg-primary/5 border border-primary/10 rounded-xl animate-pulse">
                      <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">2</div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-foreground text-primary">Database Schema Injection</p>
                        <p className="text-[11px] text-muted-foreground">Generovanie SQL migrácií podľa Blueprintu</p>
                      </div>
                      <Loader2 size={14} className="text-primary animate-spin" />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar / Stats */}
            <div className="space-y-6">
               <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                 <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4">Metriky Plánu</h4>
                 <div className="space-y-4">
                   <div className="flex justify-between items-center">
                     <span className="text-sm text-muted-foreground">Náročnosť</span>
                     <span className="text-sm font-medium text-foreground">Stredná</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-sm text-muted-foreground">Risk Score</span>
                     <span className="text-[10px] bg-success/10 text-success px-2 py-0.5 rounded-full font-bold uppercase">Nízky</span>
                   </div>
                   <div className="flex justify-between items-center">
                     <span className="text-sm text-muted-foreground">Odhadovaný čas</span>
                     <span className="text-sm font-medium text-foreground">4 hodiny</span>
                   </div>
                 </div>
               </div>

               <div className="bg-card border border-border rounded-2xl p-6 shadow-sm">
                 <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-widest mb-4 flex items-center gap-2">
                   <Settings size={14} /> Konfigurácia AI
                 </h4>
                 <div className="space-y-4">
                    <div className="p-3 bg-accent/30 rounded-xl">
                       <p className="text-[11px] font-bold text-foreground">Mode: Architect</p>
                       <p className="text-[10px] text-muted-foreground mt-1">Optimalizované pre stabilitu a bezpečnosť.</p>
                    </div>
                    <div className="flex items-center gap-2 px-3">
                       <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                       <span className="text-[11px] text-muted-foreground">Analyzátor v reálnom čase</span>
                    </div>
                 </div>
               </div>

               <button 
                 disabled={!isApproved}
                 className="w-full py-4 bg-accent/50 border border-border rounded-2xl text-muted-foreground text-sm font-medium hover:bg-accent transition-all flex items-center justify-center gap-2 group"
               >
                 <Layers size={18} className="group-hover:text-primary transition-colors" />
                 Open Phase Orchestrator
                 <ChevronRight size={16} />
               </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

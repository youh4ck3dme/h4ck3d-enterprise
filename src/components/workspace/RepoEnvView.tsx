import { useState } from 'react';
import { 
  Github, 
  GitBranch, 
  Globe, 
  Server, 
  Terminal, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Loader2,
  GitPullRequest
} from 'lucide-react';
import { ProjectState } from '@/workflow/types';

interface RepoEnvViewProps {
  projectState: ProjectState;
  onTransitionState: (newState: ProjectState) => void;
  onAddLog: (msg: string) => void;
  onShowToast: (msg: string, type?: 'success' | 'info' | 'error') => void;
}

export default function RepoEnvView({ 
  projectState, 
  onTransitionState, 
  onAddLog,
  onShowToast
}: RepoEnvViewProps) {
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [provider, setProvider] = useState<'github' | 'gitlab' | 'other' | null>(null);
  const [envTarget, setEnvTarget] = useState<'docker' | 'vps' | 'staging' | null>(null);
  const [isValidating, setIsValidating] = useState(false);

  const isInputsReady = projectState !== 'Draft';
  const isBlueprintPending = ['Blueprint Pending', 'Blueprint Approved', 'Phase In Progress', 'Testing', 'Passed', 'Failed', 'Review Pending', 'Ready for Deploy', 'Deployed'].includes(projectState);

  // Validation
  const isReady = repoUrl.trim().length > 5 && branch.trim().length > 0 && provider !== null && envTarget !== null;

  const handleMarkBlueprintPending = () => {
    if (!isReady) {
      onShowToast('Všetky povinné polia musia byť vyplnené.', 'error');
      return;
    }
    setIsValidating(true);
    
    // Simulating "Repo Analysis" before marking as blueprint pending
    setTimeout(() => {
      onTransitionState('Blueprint Pending');
      onAddLog(`[WORKFLOW] Repozitár (${branch}) a cieľové prostredie pripravené na generovanie Blueprintu.`);
      onShowToast('Technický kontext pripravený – Fáza: Blueprint Pending', 'success');
      setIsValidating(false);
    }, 1500);
  };

  return (
    <div className="flex-1 flex flex-col p-6 lg:p-10 overflow-y-auto w-full relative z-10 scrollbar-hide bg-background/50 m-4 rounded-2xl shadow-sm border border-border/50">
      <div className="max-w-6xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Main Content: Repo & Env Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="mb-4">
            <h2 className="text-2xl font-normal text-foreground flex items-center gap-2">
              <ShieldCheck size={24} className="text-primary" />
              Repo & Cieľové Prostredie
            </h2>
            <p className="text-muted-foreground text-sm mt-1">
              Konfigurujte zdrojový kód a infraštruktúrny cieľ pre automatizovanú analýzu.
            </p>
          </div>

          {!isInputsReady && (
            <div className="p-4 bg-warning/5 border border-warning/20 rounded-xl mb-6">
              <p className="text-sm text-warning font-medium flex items-center gap-2">
                <AlertCircle size={14} /> Workflow Blocked
              </p>
              <p className="text-xs text-muted-foreground leading-relaxed mt-1">
                Pred konfiguráciou repozitára musíte dokončiť fázu <strong>Brief & Requirements</strong>.
              </p>
            </div>
          )}

          {/* Repository Card */}
          <div className={`bg-card border border-border rounded-2xl p-6 shadow-sm transition-all ${!isInputsReady ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-2 mb-6">
              <GitPullRequest size={18} className="text-primary" />
              <h3 className="font-medium text-foreground">Konfigurácia Repozitára</h3>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Repository URL</label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    <Globe size={16} />
                  </div>
                  <input
                    type="text"
                    value={repoUrl}
                    onChange={(e) => setRepoUrl(e.target.value)}
                    disabled={isBlueprintPending}
                    placeholder="https://github.com/org/repo"
                    className="w-full bg-accent/30 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Branch</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      <GitBranch size={16} />
                    </div>
                    <input
                      type="text"
                      value={branch}
                      onChange={(e) => setBranch(e.target.value)}
                      disabled={isBlueprintPending}
                      placeholder="main"
                      className="w-full bg-accent/30 border border-border rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground outline-none focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-muted-foreground mb-1.5 uppercase tracking-wider">Git Provider</label>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setProvider('github')}
                      disabled={isBlueprintPending}
                      className={`flex-1 py-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all ${provider === 'github' ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'bg-accent/30 border-border text-muted-foreground hover:bg-accent'}`}
                    >
                      <Github size={16} /> <span className="text-xs font-medium">GitHub</span>
                    </button>
                    <button 
                      onClick={() => setProvider('gitlab')}
                      disabled={isBlueprintPending}
                      className={`flex-1 py-2.5 rounded-xl border flex items-center justify-center gap-2 transition-all ${provider === 'gitlab' ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'bg-accent/30 border-border text-muted-foreground hover:bg-accent'}`}
                    >
                      <GitPullRequest size={16} /> <span className="text-xs font-medium">GitLab</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Environment Card */}
          <div className={`bg-card border border-border rounded-2xl p-6 shadow-sm transition-all ${!isInputsReady ? 'opacity-50 pointer-events-none' : ''}`}>
            <div className="flex items-center gap-2 mb-6">
              <Server size={18} className="text-primary" />
              <h3 className="font-medium text-foreground">Cieľová Infraštruktúra</h3>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <button 
                onClick={() => setEnvTarget('docker')}
                disabled={isBlueprintPending}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${envTarget === 'docker' ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'bg-accent/30 border-border text-muted-foreground hover:bg-accent hover:border-primary/30'}`}
              >
                <Terminal size={20} />
                <span className="text-xs font-medium tracking-tight">Docker/Local</span>
              </button>
              <button 
                onClick={() => setEnvTarget('vps')}
                disabled={isBlueprintPending}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${envTarget === 'vps' ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'bg-accent/30 border-border text-muted-foreground hover:bg-accent hover:border-primary/30'}`}
              >
                <Server size={20} />
                <span className="text-xs font-medium tracking-tight">VPS / Cloud</span>
              </button>
              <button 
                onClick={() => setEnvTarget('staging')}
                disabled={isBlueprintPending}
                className={`flex flex-col items-center gap-2 p-4 rounded-xl border transition-all ${envTarget === 'staging' ? 'bg-primary/10 border-primary text-primary shadow-sm' : 'bg-accent/30 border-border text-muted-foreground hover:bg-accent hover:border-primary/30'}`}
              >
                <Globe size={20} />
                <span className="text-xs font-medium tracking-tight">Staging API</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar: Summary & Readiness */}
        <div className="space-y-6">
          <div className="bg-card border border-border rounded-2xl p-6 shadow-sm sticky top-0">
            <h3 className="font-medium text-foreground mb-6 text-lg">Konfiguračný Status</h3>
            
            <div className="space-y-4 mb-8">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Github size={14} /> Provider & Repo
                </span>
                {repoUrl.length > 5 && provider ? <CheckCircle2 size={16} className="text-success" /> : <AlertCircle size={16} className="text-muted-foreground/30" />}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <GitBranch size={14} /> Branch Selected
                </span>
                {branch.length > 0 ? <CheckCircle2 size={16} className="text-success" /> : <AlertCircle size={16} className="text-muted-foreground/30" />}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground flex items-center gap-2">
                  <Server size={14} /> Target Environment
                </span>
                {envTarget ? <CheckCircle2 size={16} className="text-success" /> : <AlertCircle size={16} className="text-muted-foreground/30" />}
              </div>
            </div>

            <div className="pt-6 border-t border-border">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-foreground">Readiness:</span>
                <span className={`text-xs px-2 py-1 rounded-full font-bold uppercase tracking-wider ${
                  isBlueprintPending 
                    ? 'bg-success/10 text-success' 
                    : isReady ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                }`}>
                  {isBlueprintPending ? 'Blueprint Pending' : isReady ? 'Ready for Blueprint' : 'Incomplete'}
                </span>
              </div>

              {!isBlueprintPending ? (
                <button
                  onClick={handleMarkBlueprintPending}
                  disabled={!isReady || isValidating || !isInputsReady}
                  className="w-full py-3 bg-primary text-primary-foreground rounded-xl hover:bg-google-blue-hover transition-all flex items-center justify-center gap-2 font-medium shadow-md disabled:opacity-50 disabled:bg-muted"
                >
                  {isValidating ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                  Mark Blueprint Pending
                </button>
              ) : (
                <div className="p-4 bg-success/5 border border-success/20 rounded-xl">
                  <p className="text-xs text-success font-medium flex items-center gap-2">
                    <CheckCircle2 size={14} /> Technický kontext overený.
                  </p>
                  <p className="text-[11px] text-muted-foreground leading-relaxed mt-2 text-center">
                    Systém je pripravený na generovanie technického <strong>Blueprintu</strong>.
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="p-5 border border-border border-dashed rounded-xl bg-accent/5">
            <h4 className="text-[11px] font-bold text-muted-foreground uppercase tracking-widest mb-2 flex items-center gap-1.5 hover:text-foreground cursor-help transition-all">
              <AlertCircle size={10} /> Safe Execution Policy
            </h4>
            <p className="text-[11px] text-muted-foreground leading-relaxed italic">
              "Environment target selection enforces isolation rules. All analysis must be non-blocking and safe."
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

import { Activity } from 'lucide-react';
import { useRef, useEffect } from 'react';

interface SystemMonitorProps {
  isLoading: boolean;
  messageCount: number;
  attachmentCount: number;
  logs: string[];
}

const logProgressColors = [
  '#ff3b30',
  '#ff5a1f',
  '#ff8a00',
  '#ffb020',
  '#ffd84d',
  '#9be15d',
  '#21c77a',
];

function getLogProgressColor(index: number, total: number): string {
  if (total <= 1) return logProgressColors[logProgressColors.length - 1];
  const progress = index / (total - 1);
  const colorIndex = Math.min(
    logProgressColors.length - 1,
    Math.floor(progress * (logProgressColors.length - 1))
  );
  return logProgressColors[colorIndex];
}

export default function SystemMonitor({ isLoading, messageCount, attachmentCount, logs }: SystemMonitorProps) {
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  return (
    <aside className="w-[300px] h-full min-h-0 overflow-hidden bg-card border-l border-border flex flex-col hidden xl:flex shrink-0 z-10">
      <div className="p-6 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Activity size={16} className="text-primary" /> Stav Služieb
        </h3>
      </div>

      <div className="p-6 space-y-8 border-b border-border">
        <div>
          <div className="flex justify-between text-xs mb-2 font-medium text-muted-foreground">
            <span>Vyťaženie AI</span>
            <span className="text-foreground">{isLoading ? 'Aktívne' : 'Nečinné'}</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div className={`h-full bg-primary transition-all duration-1000 ease-out ${isLoading ? 'w-full' : 'w-[15%]'}`} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-xs mb-2 font-medium text-muted-foreground">
            <span>Pamäť Kontextu</span>
            <span className="text-foreground">{(2.4 + messageCount * 0.15 + attachmentCount * 1.2).toFixed(1)} GB</span>
          </div>
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-success transition-all duration-500"
              style={{ width: `${Math.min(10 + messageCount * 2 + attachmentCount * 10, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Console */}
      <div className="flex-1 min-h-0 flex flex-col bg-console m-4 rounded-xl shadow-inner overflow-hidden border border-console-border">
        <div className="px-4 py-2 bg-console-header border-b border-console-border flex items-center">
          <span className="text-[10px] font-mono text-console-text uppercase tracking-widest">Cloud Shell</span>
        </div>
        <div className="p-4 font-mono text-[11px] overflow-y-auto flex flex-col flex-1 scrollbar-hide">
          <div className="mt-auto">
            {logs.map((log, i) => (
              <div
                key={i}
                className="mb-1.5 leading-relaxed transition-colors"
                style={{ color: getLogProgressColor(i, logs.length) }}
              >
                {log}
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </div>
      </div>
    </aside>
  );
}

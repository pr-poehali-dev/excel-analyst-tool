import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { HistoryEntry, sampleHistory } from '@/store/spreadsheetStore';

export default function HistoryPanel() {
  const [history] = useState<HistoryEntry[]>(sampleHistory);
  const [selectedEntry, setSelectedEntry] = useState<string | null>(null);

  const formatTime = (d: Date) => {
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return 'только что';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`;
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
  };

  const groupByDate = () => {
    const groups: { label: string; entries: HistoryEntry[] }[] = [];
    const today: HistoryEntry[] = [];
    const older: HistoryEntry[] = [];
    const now = Date.now();

    history.forEach(entry => {
      if (now - entry.timestamp.getTime() < 86400000) today.push(entry);
      else older.push(entry);
    });

    if (today.length) groups.push({ label: 'Сегодня', entries: today });
    if (older.length) groups.push({ label: 'Ранее', entries: older });
    return groups;
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <h3 className="font-semibold text-sm mb-1">История изменений</h3>
        <p className="text-xs text-muted-foreground">Все изменения автоматически сохраняются</p>
      </div>

      <div className="flex-1 overflow-auto p-2">
        {groupByDate().map(group => (
          <div key={group.label} className="mb-3">
            <div className="text-xs font-medium text-muted-foreground px-2 py-1 mb-1">{group.label}</div>
            <div className="space-y-1">
              {group.entries.map((entry, idx) => (
                <button
                  key={entry.id}
                  onClick={() => setSelectedEntry(selectedEntry === entry.id ? null : entry.id)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all ${
                    selectedEntry === entry.id
                      ? 'border-primary/40 bg-primary/5'
                      : 'border-transparent hover:border-border hover:bg-secondary/50'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    <div className="relative flex flex-col items-center flex-shrink-0">
                      <div className={`w-2 h-2 rounded-full mt-1 ${idx === 0 ? 'bg-primary' : 'bg-muted-foreground/50'}`} />
                      {idx < group.entries.length - 1 && (
                        <div className="w-px flex-1 bg-border mt-1 min-h-[20px]" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-medium">{entry.author}</span>
                        {entry.cellRef && (
                          <span className="font-mono text-xs text-primary/70">{entry.cellRef}</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">{entry.description}</div>
                      <div className="text-xs text-muted-foreground/70 mt-0.5">{formatTime(entry.timestamp)}</div>

                      {selectedEntry === entry.id && entry.oldValue && (
                        <div className="mt-2 space-y-1 animate-fade-in">
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">Было:</span>
                            <span className="font-mono bg-destructive/10 text-destructive px-1.5 py-0.5 rounded">
                              {entry.oldValue}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-xs">
                            <span className="text-muted-foreground">Стало:</span>
                            <span className="font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded">
                              {entry.newValue}
                            </span>
                          </div>
                          <button className="mt-1 text-xs text-accent hover:text-accent/80 flex items-center gap-1 transition-colors">
                            <Icon name="RotateCcw" size={11} />
                            Восстановить эту версию
                          </button>
                        </div>
                      )}
                    </div>
                    <Icon
                      name={selectedEntry === entry.id ? 'ChevronUp' : 'ChevronDown'}
                      size={12}
                      className="text-muted-foreground mt-1 flex-shrink-0"
                    />
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t border-border">
        <button className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-lg bg-secondary text-muted-foreground hover:text-foreground text-xs transition-colors">
          <Icon name="Download" size={13} />
          Скачать версию
        </button>
      </div>
    </div>
  );
}

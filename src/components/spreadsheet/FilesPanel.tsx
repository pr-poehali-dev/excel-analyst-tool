import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { SpreadsheetFile, sampleFiles } from '@/store/spreadsheetStore';

interface Props {
  activeFileId: string;
  files: SpreadsheetFile[];
  onSelectFile: (file: SpreadsheetFile) => void;
  onCreateFile: () => void;
}

export default function FilesPanel({ activeFileId, files, onSelectFile, onCreateFile }: Props) {
  const [search, setSearch] = useState('');

  const filtered = files.filter(f =>
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d: Date) => {
    const now = new Date();
    const diff = now.getTime() - d.getTime();
    if (diff < 60000) return 'Только что';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин назад`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)} ч назад`;
    return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-sm">Мои файлы</h3>
          <button
            onClick={onCreateFile}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary text-primary-foreground text-xs font-medium hover:bg-primary/90 transition-colors"
          >
            <Icon name="Plus" size={12} />
            Новый
          </button>
        </div>
        <div className="relative">
          <Icon name="Search" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-secondary rounded-lg outline-none border border-transparent focus:border-primary/50 transition-colors"
            placeholder="Поиск файлов..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2 space-y-1">
        {filtered.map(file => (
          <button
            key={file.id}
            onClick={() => onSelectFile(file)}
            className={`w-full text-left p-2.5 rounded-xl transition-all group ${
              file.id === activeFileId
                ? 'bg-primary/10 border border-primary/30'
                : 'hover:bg-secondary border border-transparent'
            }`}
          >
            <div className="flex items-start gap-2">
              <div
                className={`mt-0.5 p-1.5 rounded-lg ${file.id === activeFileId ? 'bg-primary/20' : 'bg-secondary group-hover:bg-muted'}`}
              >
                <Icon name="Sheet" size={14} className={file.id === activeFileId ? 'text-primary' : 'text-muted-foreground'} fallback="FileSpreadsheet" />
              </div>
              <div className="flex-1 min-w-0">
                <div className={`text-xs font-medium truncate ${file.id === activeFileId ? 'text-primary' : 'text-foreground'}`}>
                  {file.name}
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">
                  {formatDate(file.updatedAt)} · {file.sheets.length} {file.sheets.length === 1 ? 'лист' : 'листа'}
                </div>
              </div>
              {file.id === activeFileId && (
                <Icon name="ChevronRight" size={12} className="text-primary mt-1" />
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="p-3 border-t border-border">
        <button className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors text-xs">
          <Icon name="Upload" size={14} />
          Импортировать файл
        </button>
        <button className="w-full flex items-center gap-2 p-2 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors text-xs">
          <Icon name="HardDrive" size={14} />
          Облачное хранилище
        </button>
      </div>
    </div>
  );
}

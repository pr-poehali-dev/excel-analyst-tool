import { useState, useCallback } from 'react';
import Icon from '@/components/ui/icon';
import Sidebar from '@/components/spreadsheet/Sidebar';
import SpreadsheetGrid from '@/components/spreadsheet/SpreadsheetGrid';
import FilesPanel from '@/components/spreadsheet/FilesPanel';
import TemplatesPanel from '@/components/spreadsheet/TemplatesPanel';
import CollabPanel from '@/components/spreadsheet/CollabPanel';
import HistoryPanel from '@/components/spreadsheet/HistoryPanel';
import ChartsPanel from '@/components/spreadsheet/ChartsPanel';
import {
  CellData,
  SpreadsheetFile,
  Sheet,
  sampleFiles,
} from '@/store/spreadsheetStore';

type SidebarTab = 'files' | 'templates' | 'collab' | 'history' | 'charts';

let fileCounter = sampleFiles.length + 1;
let sheetCounter = 2;

function createNewFile(name: string): SpreadsheetFile {
  const sheet: Sheet = { id: `sheet-${Date.now()}`, name: 'Лист 1', cells: {} };
  return {
    id: `file-${Date.now()}`,
    name,
    createdAt: new Date(),
    updatedAt: new Date(),
    sheets: [sheet],
    activeSheetId: sheet.id,
  };
}

export default function Index() {
  const [files, setFiles] = useState<SpreadsheetFile[]>(sampleFiles);
  const [activeFileId, setActiveFileId] = useState(sampleFiles[0].id);
  const [sidebarTab, setSidebarTab] = useState<SidebarTab>('files');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [saving, setSaving] = useState(false);

  const activeFile = files.find(f => f.id === activeFileId) || files[0];

  const handleCellChange = useCallback(
    (sheetId: string, cellRef: string, data: Partial<CellData>) => {
      setFiles(prev =>
        prev.map(file => {
          if (file.id !== activeFileId) return file;
          return {
            ...file,
            updatedAt: new Date(),
            sheets: file.sheets.map(sheet => {
              if (sheet.id !== sheetId) return sheet;
              const existing = sheet.cells[cellRef] || { value: '', type: 'text' as const };
              return {
                ...sheet,
                cells: {
                  ...sheet.cells,
                  [cellRef]: { ...existing, ...data } as CellData,
                },
              };
            }),
          };
        })
      );
    },
    [activeFileId]
  );

  const handleAddSheet = useCallback(() => {
    setFiles(prev =>
      prev.map(file => {
        if (file.id !== activeFileId) return file;
        const newSheet: Sheet = {
          id: `sheet-${Date.now()}`,
          name: `Лист ${sheetCounter++}`,
          cells: {},
        };
        return { ...file, sheets: [...file.sheets, newSheet], activeSheetId: newSheet.id };
      })
    );
  }, [activeFileId]);

  const handleSelectSheet = useCallback(
    (sheetId: string) => {
      setFiles(prev =>
        prev.map(file =>
          file.id === activeFileId ? { ...file, activeSheetId: sheetId } : file
        )
      );
    },
    [activeFileId]
  );

  const handleCreateFile = () => {
    const newFile = createNewFile(`Новая книга ${fileCounter++}`);
    setFiles(prev => [newFile, ...prev]);
    setActiveFileId(newFile.id);
  };

  const handleSelectFile = (file: SpreadsheetFile) => {
    setActiveFileId(file.id);
  };

  const handleUseTemplate = (templateId: string) => {
    const newFile = createNewFile(`Шаблон ${templateId}`);
    setFiles(prev => [newFile, ...prev]);
    setActiveFileId(newFile.id);
    setSidebarTab('files');
  };

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1200);
  };

  const panelContent: Record<SidebarTab, React.ReactNode> = {
    files: (
      <FilesPanel
        activeFileId={activeFileId}
        files={files}
        onSelectFile={handleSelectFile}
        onCreateFile={handleCreateFile}
      />
    ),
    templates: <TemplatesPanel onUseTemplate={handleUseTemplate} />,
    collab: <CollabPanel />,
    history: <HistoryPanel />,
    charts: <ChartsPanel />,
  };

  return (
    <div className="flex flex-col h-screen bg-background overflow-hidden">
      {/* Top nav */}
      <header className="flex items-center gap-3 px-4 py-2 border-b border-border bg-card/80 backdrop-blur z-40 flex-shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_12px_rgba(0,245,160,0.4)]">
            <Icon name="FileSpreadsheet" size={15} className="text-primary-foreground" />
          </div>
          <span className="font-bold text-sm neon-text hidden sm:block">GridFlow</span>
        </div>

        <div className="w-px h-5 bg-border" />

        <div className="flex items-center gap-1">
          {(['Файл', 'Правка', 'Вид', 'Вставка', 'Формат', 'Данные'] as const).map(item => (
            <button
              key={item}
              className="px-2.5 py-1 rounded text-xs text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
            >
              {item}
            </button>
          ))}
        </div>

        <div className="flex-1 flex items-center justify-center">
          <input
            className="text-sm font-medium bg-transparent text-center outline-none border-b border-transparent focus:border-primary/50 transition-colors pb-0.5 max-w-xs w-full"
            defaultValue={activeFile.name}
            key={activeFile.id}
          />
        </div>

        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1">
            <div className="w-6 h-6 rounded-full bg-[#00f5a0] flex items-center justify-center text-xs font-bold text-black">
              АК
            </div>
            <div className="w-6 h-6 rounded-full bg-[#a855f7] flex items-center justify-center text-xs font-bold text-black">
              МС
            </div>
          </div>

          <button
            onClick={handleSave}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              saving
                ? 'bg-primary/20 text-primary'
                : 'bg-primary text-primary-foreground hover:bg-primary/90 hover-glow'
            }`}
          >
            <Icon name={saving ? 'Check' : 'Save'} size={13} />
            {saving ? 'Сохранено' : 'Сохранить'}
          </button>

          <button className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="Share2" size={15} />
          </button>

          <button className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="Settings" size={15} />
          </button>
        </div>
      </header>

      {/* Main area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Icon sidebar */}
        <Sidebar activeTab={sidebarTab} onTabChange={tab => {
          if (tab === sidebarTab && sidebarOpen) {
            setSidebarOpen(false);
          } else {
            setSidebarTab(tab);
            setSidebarOpen(true);
          }
        }} />

        {/* Panel */}
        {sidebarOpen && (
          <div className="w-64 flex-shrink-0 border-r border-border bg-card/30 flex flex-col overflow-hidden animate-fade-in">
            {panelContent[sidebarTab]}
          </div>
        )}

        {/* Spreadsheet */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <SpreadsheetGrid
            file={activeFile}
            onCellChange={handleCellChange}
            onAddSheet={handleAddSheet}
            onSelectSheet={handleSelectSheet}
          />
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center gap-4 px-4 py-1 border-t border-border bg-card/50 text-xs text-muted-foreground flex-shrink-0">
        <span className="flex items-center gap-1">
          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
          Автосохранение включено
        </span>
        <span>2 пользователя онлайн</span>
        <span className="ml-auto">
          {activeFile.sheets.length} {activeFile.sheets.length === 1 ? 'лист' : 'листа'}
        </span>
        <span>Масштаб 100%</span>
      </div>
    </div>
  );
}

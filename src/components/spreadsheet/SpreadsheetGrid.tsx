import { useState, useRef, useCallback, useEffect } from 'react';
import Icon from '@/components/ui/icon';
import {
  CellData,
  CellType,
  Sheet,
  SpreadsheetFile,
  generateCellRef,
  isVideoUrl,
  getVideoEmbedUrl,
  COLS,
  ROWS,
} from '@/store/spreadsheetStore';

interface Props {
  file: SpreadsheetFile;
  onCellChange: (sheetId: string, cellRef: string, data: Partial<CellData>) => void;
  onAddSheet: () => void;
  onSelectSheet: (sheetId: string) => void;
}

const COL_WIDTH = 120;
const ROW_HEIGHT = 32;
const HEADER_HEIGHT = 32;

interface VideoModalProps {
  url: string;
  cellRef: string;
  onClose: () => void;
}

function VideoModal({ url, cellRef, onClose }: VideoModalProps) {
  const embedUrl = getVideoEmbedUrl(url);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="glass rounded-2xl p-4 w-[700px] max-w-[95vw]">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-muted-foreground">
            Видео из ячейки <span className="text-primary font-mono">{cellRef}</span>
          </span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="X" size={16} />
          </button>
        </div>
        {embedUrl ? (
          <iframe
            src={embedUrl}
            className="w-full rounded-xl"
            style={{ aspectRatio: '16/9' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : (
          <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
            Не удалось встроить видео
          </div>
        )}
      </div>
    </div>
  );
}

export default function SpreadsheetGrid({ file, onCellChange, onAddSheet, onSelectSheet }: Props) {
  const activeSheet = file.sheets.find(s => s.id === file.activeSheetId) || file.sheets[0];
  const [activeCell, setActiveCell] = useState<string | null>('A1');
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [videoModal, setVideoModal] = useState<{ url: string; cellRef: string } | null>(null);
  const [bold, setBold] = useState(false);
  const [italic, setItalic] = useState(false);
  const [align, setAlign] = useState<'left' | 'center' | 'right'>('left');
  const inputRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const getCell = (ref: string): CellData =>
    activeSheet.cells[ref] || { value: '', type: 'text' };

  const startEdit = useCallback(
    (ref: string) => {
      const cell = getCell(ref);
      setEditingCell(ref);
      setEditValue(cell.value);
      setBold(cell.bold || false);
      setItalic(cell.italic || false);
      setAlign(cell.align || 'left');
      setTimeout(() => inputRef.current?.focus(), 0);
    },
    [activeSheet]
  );

  const commitEdit = useCallback(() => {
    if (!editingCell) return;
    const val = editValue.trim();
    let type: CellType = 'text';
    if (val && !isNaN(Number(val))) type = 'number';
    if (val.startsWith('=')) type = 'formula';
    if (isVideoUrl(val)) type = 'video';
    else if (val.startsWith('http')) type = 'link';

    onCellChange(activeSheet.id, editingCell, { value: val, type, bold, italic, align });
    setEditingCell(null);
  }, [editingCell, editValue, bold, italic, align, activeSheet.id, onCellChange]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (editingCell) {
        if (e.key === 'Enter') { commitEdit(); }
        if (e.key === 'Escape') { setEditingCell(null); }
        return;
      }
      if (!activeCell) return;
      const parts = activeCell.match(/^([A-Z]+)(\d+)$/);
      if (!parts) return;
      const col = parts[1].charCodeAt(0) - 65;
      const row = parseInt(parts[2]) - 1;

      if (e.key === 'ArrowRight' && col < COLS - 1) setActiveCell(generateCellRef(row, col + 1));
      if (e.key === 'ArrowLeft' && col > 0) setActiveCell(generateCellRef(row, col - 1));
      if (e.key === 'ArrowDown' && row < ROWS - 1) setActiveCell(generateCellRef(row + 1, col));
      if (e.key === 'ArrowUp' && row > 0) setActiveCell(generateCellRef(row - 1, col));
      if (e.key === 'Enter' || e.key === 'F2') { e.preventDefault(); startEdit(activeCell); }
      if (e.key === 'Delete' || e.key === 'Backspace') {
        onCellChange(activeSheet.id, activeCell, { value: '', type: 'text' });
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [activeCell, editingCell, commitEdit, startEdit, onCellChange, activeSheet.id]);

  const formatNumber = (val: string) => {
    const n = Number(val);
    if (isNaN(n)) return val;
    return n.toLocaleString('ru-RU');
  };

  const activeFormatCell = activeCell ? getCell(activeCell) : null;

  return (
    <div className="flex flex-col h-full">
      {/* Formula bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 border-b border-border bg-card/50">
        <div className="flex items-center gap-1 mr-2">
          <button
            onClick={() => {
              if (activeCell) onCellChange(activeSheet.id, activeCell, { bold: !activeFormatCell?.bold });
            }}
            className={`px-2 py-0.5 rounded text-xs font-bold transition-colors ${activeFormatCell?.bold ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'}`}
          >
            B
          </button>
          <button
            onClick={() => {
              if (activeCell) onCellChange(activeSheet.id, activeCell, { italic: !activeFormatCell?.italic });
            }}
            className={`px-2 py-0.5 rounded text-xs italic transition-colors ${activeFormatCell?.italic ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'}`}
          >
            I
          </button>
          <div className="w-px h-4 bg-border mx-1" />
          {(['left', 'center', 'right'] as const).map(a => (
            <button
              key={a}
              onClick={() => {
                if (activeCell) onCellChange(activeSheet.id, activeCell, { align: a });
              }}
              className={`p-1 rounded transition-colors ${activeFormatCell?.align === a ? 'bg-primary text-primary-foreground' : 'hover:bg-secondary text-muted-foreground'}`}
            >
              <Icon name={a === 'left' ? 'AlignLeft' : a === 'center' ? 'AlignCenter' : 'AlignRight'} size={12} />
            </button>
          ))}
        </div>
        <div className="font-mono text-xs text-primary bg-primary/10 px-2 py-1 rounded w-14 text-center">
          {activeCell || '—'}
        </div>
        <div className="w-px h-4 bg-border" />
        <Icon name="FunctionSquare" size={14} className="text-accent" />
        <input
          className="flex-1 bg-transparent text-sm outline-none text-foreground placeholder:text-muted-foreground"
          value={editingCell ? editValue : (activeCell ? getCell(activeCell).value : '')}
          onChange={e => {
            if (editingCell) setEditValue(e.target.value);
          }}
          onFocus={() => {
            if (activeCell && !editingCell) startEdit(activeCell);
          }}
          onBlur={commitEdit}
          onKeyDown={e => {
            if (e.key === 'Enter') commitEdit();
            if (e.key === 'Escape') setEditingCell(null);
          }}
          placeholder="Введите данные или формулу..."
        />
        {activeCell && getCell(activeCell).type === 'video' && (
          <button
            onClick={() => {
              const cell = getCell(activeCell);
              setVideoModal({ url: cell.value, cellRef: activeCell });
            }}
            className="flex items-center gap-1 px-2 py-1 rounded bg-accent/20 text-accent text-xs hover:bg-accent/30 transition-colors"
          >
            <Icon name="Play" size={12} />
            Смотреть
          </button>
        )}
      </div>

      {/* Grid */}
      <div ref={gridRef} className="flex-1 overflow-auto">
        <table className="border-collapse" style={{ tableLayout: 'fixed', width: (COLS + 1) * COL_WIDTH }}>
          <thead>
            <tr>
              <th
                className="sticky top-0 left-0 z-30 bg-card border-b border-r border-border"
                style={{ width: 50, minWidth: 50, height: HEADER_HEIGHT }}
              />
              {Array.from({ length: COLS }, (_, i) => (
                <th
                  key={i}
                  className="sticky top-0 z-20 bg-card border-b border-r border-border text-xs text-muted-foreground font-medium select-none"
                  style={{ width: COL_WIDTH, minWidth: COL_WIDTH, height: HEADER_HEIGHT }}
                >
                  {String.fromCharCode(65 + i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: ROWS }, (_, row) => (
              <tr key={row}>
                <td
                  className="sticky left-0 z-10 bg-card border-b border-r border-border text-xs text-muted-foreground text-center select-none"
                  style={{ width: 50, minWidth: 50, height: ROW_HEIGHT }}
                >
                  {row + 1}
                </td>
                {Array.from({ length: COLS }, (_, col) => {
                  const ref = generateCellRef(row, col);
                  const cell = getCell(ref);
                  const isActive = activeCell === ref;
                  const isEditing = editingCell === ref;

                  return (
                    <td
                      key={col}
                      className={`border-b border-r border-border relative cursor-cell select-none transition-colors ${isActive ? 'cell-active' : 'hover:bg-secondary/30'}`}
                      style={{
                        width: COL_WIDTH,
                        minWidth: COL_WIDTH,
                        height: ROW_HEIGHT,
                        backgroundColor: cell.bgColor || undefined,
                      }}
                      onClick={() => {
                        setActiveCell(ref);
                        if (editingCell && editingCell !== ref) commitEdit();
                      }}
                      onDoubleClick={() => startEdit(ref)}
                    >
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          className="absolute inset-0 w-full h-full px-2 bg-card/90 text-foreground text-xs outline-none border-2 border-primary z-10"
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={e => {
                            if (e.key === 'Enter') commitEdit();
                            if (e.key === 'Escape') setEditingCell(null);
                          }}
                        />
                      ) : (
                        <div
                          className={`px-2 h-full flex items-center overflow-hidden text-xs whitespace-nowrap ${cell.bold ? 'font-bold' : ''} ${cell.italic ? 'italic' : ''}`}
                          style={{
                            justifyContent: cell.align === 'center' ? 'center' : cell.align === 'right' ? 'flex-end' : 'flex-start',
                            color: cell.textColor || undefined,
                          }}
                        >
                          {cell.type === 'video' && cell.value ? (
                            <button
                              className="flex items-center gap-1 text-accent hover:text-accent/80 transition-colors w-full"
                              onClick={e => {
                                e.stopPropagation();
                                setVideoModal({ url: cell.value, cellRef: ref });
                              }}
                            >
                              <Icon name="Play" size={11} />
                              <span className="truncate text-xs">{cell.value.replace(/https?:\/\/(www\.)?/, '').split('/')[0]}</span>
                            </button>
                          ) : cell.type === 'link' && cell.value ? (
                            <a
                              href={cell.value}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-primary hover:underline truncate"
                              onClick={e => e.stopPropagation()}
                            >
                              {cell.value}
                            </a>
                          ) : (
                            <span className={`truncate ${cell.type === 'number' ? 'text-right w-full' : ''}`}>
                              {cell.type === 'number' ? formatNumber(cell.value) : cell.value}
                            </span>
                          )}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Sheet tabs */}
      <div className="flex items-center gap-1 px-3 py-2 border-t border-border bg-card/30">
        {file.sheets.map(sheet => (
          <button
            key={sheet.id}
            onClick={() => onSelectSheet(sheet.id)}
            className={`px-3 py-1 rounded-t text-xs font-medium transition-all ${sheet.id === file.activeSheetId ? 'tab-active text-primary' : 'text-muted-foreground hover:text-foreground hover:bg-secondary'}`}
          >
            {sheet.name}
          </button>
        ))}
        <button
          onClick={onAddSheet}
          className="p-1 rounded text-muted-foreground hover:text-primary hover:bg-secondary transition-colors"
        >
          <Icon name="Plus" size={14} />
        </button>
      </div>

      {videoModal && (
        <VideoModal
          url={videoModal.url}
          cellRef={videoModal.cellRef}
          onClose={() => setVideoModal(null)}
        />
      )}
    </div>
  );
}

import { useState, useCallback, useRef, useEffect } from "react";
import Icon from "@/components/ui/icon";

// ─── Types ───────────────────────────────────────────────────────────────────
type CellValue = string | number;
type GridData = CellValue[][];
type Tab = "editor" | "files" | "templates" | "collab" | "history" | "chart";

interface Comment {
  id: string;
  author: string;
  text: string;
  cell: string;
  time: string;
}

interface HistoryEntry {
  id: string;
  action: string;
  author: string;
  time: string;
  version: string;
}

interface FileItem {
  id: string;
  name: string;
  size: string;
  modified: string;
  type: "xlsx" | "csv" | "table";
}

interface Template {
  id: string;
  name: string;
  desc: string;
  color: string;
  icon: string;
  rows: number;
  cols: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────
const COLS = 10;
const ROWS = 20;
const COL_LETTERS = "ABCDEFGHIJ".split("");

const makeGrid = (): GridData =>
  Array.from({ length: ROWS }, () => Array(COLS).fill(""));

const INITIAL_DATA: GridData = (() => {
  const g = makeGrid();
  g[0] = ["Продукт", "Янв", "Фев", "Мар", "Апр", "Май", "Июн", "Июл", "Авг", "Сен"];
  g[1] = ["Продажи A", 120, 145, 98, 167, 203, 188, 221, 195, 178];
  g[2] = ["Продажи B", 85, 92, 110, 134, 121, 156, 143, 167, 189];
  g[3] = ["Расходы", 45, 52, 48, 61, 55, 67, 72, 65, 58];
  g[4] = ["Прибыль", 75, 93, 50, 106, 148, 121, 149, 130, 120];
  return g;
})();

const FILES: FileItem[] = [
  { id: "1", name: "Финансовый отчёт Q1.xlsx", size: "245 КБ", modified: "Сегодня, 14:32", type: "xlsx" },
  { id: "2", name: "Продажи 2025.xlsx", size: "1.2 МБ", modified: "Вчера, 09:15", type: "xlsx" },
  { id: "3", name: "Клиентская база.csv", size: "88 КБ", modified: "01.03.2026", type: "csv" },
  { id: "4", name: "Бюджет проекта.table", size: "56 КБ", modified: "28.02.2026", type: "table" },
  { id: "5", name: "KPI команды.xlsx", size: "134 КБ", modified: "25.02.2026", type: "xlsx" },
];

const TEMPLATES: Template[] = [
  { id: "1", name: "Финансовый отчёт", desc: "Доходы, расходы, прибыль по месяцам", color: "from-emerald-500/20 to-teal-500/10", icon: "TrendingUp", rows: 24, cols: 13 },
  { id: "2", name: "CRM Клиентская база", desc: "Контакты, сделки, статусы", color: "from-violet-500/20 to-purple-500/10", icon: "Users", rows: 50, cols: 12 },
  { id: "3", name: "Планировщик задач", desc: "Задачи, исполнители, дедлайны", color: "from-sky-500/20 to-blue-500/10", icon: "CheckSquare", rows: 30, cols: 8 },
  { id: "4", name: "Складской учёт", desc: "Товары, количество, цены", color: "from-orange-500/20 to-amber-500/10", icon: "Package", rows: 40, cols: 10 },
  { id: "5", name: "Бюджет проекта", desc: "Статьи расходов, лимиты, факт", color: "from-rose-500/20 to-pink-500/10", icon: "DollarSign", rows: 20, cols: 9 },
  { id: "6", name: "Учёт рабочего времени", desc: "Сотрудники, часы, проекты", color: "from-lime-500/20 to-green-500/10", icon: "Clock", rows: 35, cols: 11 },
];

const COMMENTS: Comment[] = [
  { id: "1", author: "Анна К.", text: "Нужно уточнить данные за февраль", cell: "B2", time: "14:45" },
  { id: "2", author: "Дмитрий П.", text: "Обновил цифры по расходам", cell: "B4", time: "12:20" },
  { id: "3", author: "Елена С.", text: "Почему здесь такое падение?", cell: "C3", time: "10:05" },
];

const HISTORY: HistoryEntry[] = [
  { id: "1", action: "Изменено значение C2: 145 → 152", author: "Вы", time: "15:02", version: "v1.8" },
  { id: "2", action: "Добавлена строка 5 (Прибыль)", author: "Анна К.", time: "14:45", version: "v1.7" },
  { id: "3", action: "Изменён формат столбца A", author: "Вы", time: "13:30", version: "v1.6" },
  { id: "4", action: "Файл создан", author: "Вы", time: "09:00", version: "v1.0" },
];

const ONLINE_USERS = [
  { name: "АК", color: "#00f5a0" },
  { name: "ДП", color: "#a855f7" },
  { name: "ЕС", color: "#38bdf8" },
];

// ─── Mini Bar Chart ───────────────────────────────────────────────────────────
function BarChart({ data }: { data: GridData }) {
  const dataRows = data.slice(1, 5).filter(r => r[0]);
  const labels = data[0]?.slice(1, 9) ?? [];
  const colors = ["#00f5a0", "#a855f7", "#38bdf8", "#fb923c"];
  const maxVal = Math.max(...dataRows.flatMap(r => r.slice(1, 9).map(v => Number(v) || 0)));

  return (
    <div className="h-full flex flex-col gap-4 p-2">
      <div className="flex items-center gap-4 flex-wrap">
        {dataRows.map((row, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ background: colors[i] }} />
            <span className="text-muted-foreground">{String(row[0])}</span>
          </div>
        ))}
      </div>
      <div className="flex-1 flex items-end gap-1 overflow-x-auto pb-6 relative">
        <div className="absolute left-0 right-0 bottom-6 h-px bg-border" />
        {labels.map((label, ci) => (
          <div key={ci} className="flex flex-col items-center gap-1 flex-1 min-w-[36px]">
            <div className="w-full flex gap-px items-end" style={{ height: 160 }}>
              {dataRows.map((row, ri) => {
                const val = Number(row[ci + 1]) || 0;
                const pct = maxVal > 0 ? (val / maxVal) * 100 : 0;
                return (
                  <div
                    key={ri}
                    className="flex-1 rounded-t-sm transition-all duration-500 hover:opacity-80 cursor-pointer relative group"
                    style={{ height: `${pct}%`, background: colors[ri], minWidth: 6 }}
                  >
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-card border border-border rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                      {val}
                    </div>
                  </div>
                );
              })}
            </div>
            <span className="text-xs text-muted-foreground truncate w-full text-center">{String(label)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Line Chart ───────────────────────────────────────────────────────────────
function LineChart({ data }: { data: GridData }) {
  const rows = data.slice(1, 3).filter(r => r[0]);
  const colors = ["#00f5a0", "#a855f7"];
  const vals = rows.map(r => r.slice(1, 9).map(v => Number(v) || 0));
  const allVals = vals.flat();
  const minV = Math.min(...allVals);
  const maxV = Math.max(...allVals);
  const W = 580, H = 160, PAD = 20;

  const toY = (v: number) => PAD + ((maxV - v) / (maxV - minV || 1)) * (H - PAD * 2);
  const toX = (i: number, total: number) => PAD + (i / (total - 1)) * (W - PAD * 2);

  return (
    <div className="h-full flex flex-col gap-4 p-2">
      <div className="flex items-center gap-4">
        {rows.map((r, i) => (
          <div key={i} className="flex items-center gap-2 text-sm">
            <div className="w-6 h-0.5" style={{ background: colors[i] }} />
            <span className="text-muted-foreground">{String(r[0])}</span>
          </div>
        ))}
      </div>
      <div className="flex-1 overflow-hidden">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-full">
          {[0, 25, 50, 75, 100].map(p => {
            const y = PAD + (p / 100) * (H - PAD * 2);
            return <line key={p} x1={PAD} x2={W - PAD} y1={y} y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />;
          })}
          {vals.map((series, si) => {
            const points = series.map((v, i) => `${toX(i, series.length)},${toY(v)}`).join(" ");
            const area = `M${toX(0, series.length)},${H - PAD} L${series.map((v, i) => `${toX(i, series.length)},${toY(v)}`).join(" L")} L${toX(series.length - 1, series.length)},${H - PAD} Z`;
            return (
              <g key={si}>
                <path d={area} fill={colors[si]} fillOpacity="0.08" />
                <polyline points={points} fill="none" stroke={colors[si]} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                {series.map((v, i) => (
                  <circle key={i} cx={toX(i, series.length)} cy={toY(v)} r="3.5" fill={colors[si]} className="cursor-pointer">
                    <title>{v}</title>
                  </circle>
                ))}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────
function Toolbar({ onFormat }: { onFormat: (f: string) => void }) {
  const groups = [
    [
      { icon: "Bold", label: "Жирный", f: "bold" },
      { icon: "Italic", label: "Курсив", f: "italic" },
      { icon: "Underline", label: "Подчёркнутый", f: "underline" },
    ],
    [
      { icon: "AlignLeft", label: "По левому краю", f: "left" },
      { icon: "AlignCenter", label: "По центру", f: "center" },
      { icon: "AlignRight", label: "По правому краю", f: "right" },
    ],
    [
      { icon: "Plus", label: "Добавить строку", f: "addRow" },
      { icon: "Columns", label: "Добавить столбец", f: "addCol" },
      { icon: "Trash2", label: "Удалить", f: "delete" },
    ],
    [
      { icon: "Download", label: "Экспорт", f: "export" },
      { icon: "Share2", label: "Поделиться", f: "share" },
    ],
  ];

  return (
    <div className="flex items-center gap-1 px-3 py-2 border-b border-border bg-card/50 flex-wrap">
      {groups.map((group, gi) => (
        <div key={gi} className="flex items-center gap-0.5">
          {group.map(btn => (
            <button
              key={btn.f}
              onClick={() => onFormat(btn.f)}
              title={btn.label}
              className="p-1.5 rounded hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
            >
              <Icon name={btn.icon as any} size={15} />
            </button>
          ))}
          {gi < groups.length - 1 && <div className="w-px h-5 bg-border mx-1" />}
        </div>
      ))}

      <div className="ml-auto flex items-center gap-2">
        <select className="text-xs bg-secondary border-0 rounded px-2 py-1 text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary">
          <option>Golos Text</option>
          <option>JetBrains Mono</option>
        </select>
        <select className="text-xs bg-secondary border-0 rounded px-2 py-1 text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary">
          <option>12</option>
          <option>14</option>
          <option>16</option>
          <option>18</option>
        </select>
      </div>
    </div>
  );
}

// ─── Spreadsheet Grid ─────────────────────────────────────────────────────────
function Spreadsheet({
  data,
  onDataChange,
}: {
  data: GridData;
  onDataChange: (d: GridData) => void;
}) {
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [editing, setEditing] = useState<[number, number] | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) inputRef.current.focus();
  }, [editing]);

  const startEdit = (r: number, c: number) => {
    setEditing([r, c]);
    setEditValue(String(data[r][c]));
  };

  const commitEdit = () => {
    if (!editing) return;
    const [r, c] = editing;
    const next = data.map(row => [...row]);
    next[r][c] = isNaN(Number(editValue)) || editValue === "" ? editValue : Number(editValue);
    onDataChange(next);
    setEditing(null);
  };

  const cellLabel = selected ? `${COL_LETTERS[selected[1]]}${selected[0] + 1}` : "";
  const cellVal = selected ? String(data[selected[0]][selected[1]]) : "";

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center gap-3 px-3 py-2 border-b border-border bg-card/30">
        <div className="px-3 py-1 bg-secondary rounded text-sm font-mono text-primary min-w-[52px] text-center">
          {cellLabel || "—"}
        </div>
        <div className="flex-1 px-3 py-1 bg-secondary rounded text-sm font-mono text-foreground">
          {cellVal}
        </div>
        <div className="flex items-center gap-1">
          {ONLINE_USERS.map(u => (
            <div
              key={u.name}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold text-background"
              style={{ background: u.color }}
              title={u.name}
            >
              {u.name}
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="border-collapse text-sm" style={{ minWidth: "max-content" }}>
          <thead>
            <tr>
              <th className="sticky top-0 left-0 z-30 w-10 bg-muted border-b border-r border-border" />
              {COL_LETTERS.map((l, ci) => (
                <th
                  key={ci}
                  className="sticky top-0 z-20 px-2 py-1.5 text-xs font-semibold text-muted-foreground text-center bg-muted border-b border-r border-border min-w-[110px]"
                >
                  {l}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, ri) => (
              <tr key={ri} className="group">
                <td className="sticky left-0 z-10 w-10 text-center text-xs text-muted-foreground bg-muted border-b border-r border-border font-mono py-1.5">
                  {ri + 1}
                </td>
                {row.map((cell, ci) => {
                  const isSelected = selected?.[0] === ri && selected?.[1] === ci;
                  const isEditing = editing?.[0] === ri && editing?.[1] === ci;
                  const isHeader = ri === 0 || ci === 0;

                  return (
                    <td
                      key={ci}
                      onClick={() => { setSelected([ri, ci]); setEditing(null); }}
                      onDoubleClick={() => startEdit(ri, ci)}
                      className={[
                        "border-b border-r border-border px-2 py-1.5 cursor-cell transition-colors relative",
                        isSelected ? "cell-active" : "hover:bg-secondary/40",
                        isHeader ? "font-semibold text-foreground" : "text-muted-foreground",
                        ri === 0 ? "text-primary text-xs uppercase tracking-wide" : "",
                      ].join(" ")}
                    >
                      {isEditing ? (
                        <input
                          ref={inputRef}
                          value={editValue}
                          onChange={e => setEditValue(e.target.value)}
                          onBlur={commitEdit}
                          onKeyDown={e => {
                            if (e.key === "Enter" || e.key === "Tab") commitEdit();
                            if (e.key === "Escape") setEditing(null);
                          }}
                          className="w-full bg-transparent outline-none font-mono text-sm text-foreground"
                        />
                      ) : (
                        <span className="font-mono">{String(cell)}</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Files Panel ──────────────────────────────────────────────────────────────
function FilesPanel() {
  const [active, setActive] = useState<string | null>(null);
  const icons: Record<string, string> = { xlsx: "FileSpreadsheet", csv: "FileText", table: "Table" };
  const colors: Record<string, string> = { xlsx: "text-emerald-400", csv: "text-sky-400", table: "text-violet-400" };

  return (
    <div className="flex flex-col gap-4 p-4 h-full animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Мои файлы</h2>
        <button className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover-glow transition-all">
          <Icon name="Upload" size={14} />
          Загрузить
        </button>
      </div>

      <div className="relative">
        <Icon name="Search" size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          placeholder="Поиск файлов..."
          className="w-full pl-8 pr-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
        />
      </div>

      <div className="flex-1 flex flex-col gap-2 overflow-y-auto">
        {FILES.map(f => (
          <div
            key={f.id}
            onClick={() => setActive(f.id)}
            className={[
              "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all group",
              active === f.id
                ? "border-primary/50 bg-primary/5 neon-border"
                : "border-border hover:border-border/70 hover:bg-secondary/50",
            ].join(" ")}
          >
            <div className={`${colors[f.type]} shrink-0`}>
              <Icon name={icons[f.type]} size={22} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-foreground truncate">{f.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{f.size} · {f.modified}</div>
            </div>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground">
                <Icon name="Pencil" size={13} />
              </button>
              <button className="p-1.5 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground">
                <Icon name="Trash2" size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <button className="flex items-center justify-center gap-2 p-3 border-2 border-dashed border-border rounded-xl text-muted-foreground hover:border-primary/50 hover:text-primary transition-all text-sm">
        <Icon name="Plus" size={16} />
        Создать новый файл
      </button>
    </div>
  );
}

// ─── Templates Panel ──────────────────────────────────────────────────────────
function TemplatesPanel() {
  return (
    <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto animate-fade-in">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Шаблоны</h2>
        <span className="text-xs text-muted-foreground">{TEMPLATES.length} шаблонов</span>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {TEMPLATES.map(t => (
          <div
            key={t.id}
            className={`bg-gradient-to-br ${t.color} border border-border rounded-xl p-4 cursor-pointer hover:border-primary/40 transition-all group hover-glow`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="p-2 bg-background/40 rounded-lg">
                <Icon name={t.icon as any} size={18} className="text-foreground" />
              </div>
              <span className="text-xs text-muted-foreground">{t.rows}×{t.cols}</span>
            </div>
            <div className="font-semibold text-foreground text-sm mb-1">{t.name}</div>
            <div className="text-xs text-muted-foreground leading-relaxed">{t.desc}</div>
            <button className="mt-3 w-full py-1.5 bg-background/30 hover:bg-primary/20 rounded-lg text-xs text-foreground transition-all opacity-0 group-hover:opacity-100">
              Использовать →
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Collab Panel ─────────────────────────────────────────────────────────────
function CollabPanel() {
  const [newComment, setNewComment] = useState("");

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground mb-3">Совместная работа</h2>
        <div className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl">
          <div className="flex -space-x-2">
            {ONLINE_USERS.map(u => (
              <div
                key={u.name}
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-background border-2 border-card"
                style={{ background: u.color }}
              >
                {u.name}
              </div>
            ))}
          </div>
          <div>
            <div className="text-sm font-medium text-foreground">3 участника онлайн</div>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-primary rounded-full inline-block animate-pulse" />
              Редактируют сейчас
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Комментарии</div>
        {COMMENTS.map(c => (
          <div key={c.id} className="bg-secondary/40 rounded-xl p-3 border border-border">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
                  {c.author[0]}
                </div>
                <span className="text-sm font-medium text-foreground">{c.author}</span>
                <span className="text-xs text-muted-foreground px-1.5 py-0.5 bg-background/50 rounded font-mono">{c.cell}</span>
              </div>
              <span className="text-xs text-muted-foreground">{c.time}</span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{c.text}</p>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <input
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            placeholder="Добавить комментарий..."
            className="flex-1 px-3 py-2 bg-secondary border border-border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-primary placeholder:text-muted-foreground"
          />
          <button
            onClick={() => setNewComment("")}
            className="px-3 py-2 bg-primary text-primary-foreground rounded-lg hover:opacity-90 transition-opacity"
          >
            <Icon name="Send" size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── History Panel ────────────────────────────────────────────────────────────
function HistoryPanel() {
  const [selected, setSelected] = useState<string | null>("1");

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="p-4 border-b border-border">
        <h2 className="text-lg font-semibold text-foreground">История изменений</h2>
        <p className="text-xs text-muted-foreground mt-1">Все правки сохраняются автоматически</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2 relative">
        <div className="absolute left-[2.35rem] top-6 bottom-6 w-px bg-border" />
        {HISTORY.map((h, i) => (
          <div
            key={h.id}
            onClick={() => setSelected(h.id)}
            className={[
              "flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all pl-4",
              selected === h.id ? "bg-primary/8 border border-primary/20" : "hover:bg-secondary/40",
            ].join(" ")}
          >
            <div className={[
              "w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 z-10",
              i === 0 ? "border-primary bg-primary/20" : "border-border bg-card",
            ].join(" ")}>
              {i === 0 && <div className="w-2 h-2 rounded-full bg-primary" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-mono text-primary">{h.version}</span>
                <span className="text-xs text-muted-foreground">{h.time}</span>
              </div>
              <div className="text-sm text-foreground leading-relaxed">{h.action}</div>
              <div className="text-xs text-muted-foreground mt-1">{h.author}</div>
            </div>
          </div>
        ))}
      </div>
      <div className="p-4 border-t border-border flex gap-2">
        <button className="flex-1 py-2 bg-secondary rounded-lg text-sm text-foreground hover:bg-secondary/70 transition-colors">
          Восстановить версию
        </button>
        <button className="px-3 py-2 bg-secondary rounded-lg text-sm text-muted-foreground hover:bg-secondary/70 transition-colors">
          <Icon name="Download" size={15} />
        </button>
      </div>
    </div>
  );
}

// ─── Chart Panel ─────────────────────────────────────────────────────────────
function ChartPanel({ data }: { data: GridData }) {
  const [chartType, setChartType] = useState<"bar" | "line">("bar");

  return (
    <div className="flex flex-col h-full animate-fade-in">
      <div className="p-4 border-b border-border flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Диаграммы</h2>
        <div className="flex bg-secondary rounded-lg p-0.5">
          {(["bar", "line"] as const).map(t => (
            <button
              key={t}
              onClick={() => setChartType(t)}
              className={[
                "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm transition-all",
                chartType === t ? "bg-card text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground",
              ].join(" ")}
            >
              <Icon name={t === "bar" ? "BarChart3" : "TrendingUp"} size={14} />
              {t === "bar" ? "Столбцы" : "Линия"}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 p-4 overflow-hidden">
        <div className="h-full bg-card/50 rounded-xl border border-border p-4">
          {chartType === "bar" ? <BarChart data={data} /> : <LineChart data={data} />}
        </div>
      </div>

      <div className="p-4 border-t border-border">
        <div className="grid grid-cols-3 gap-2">
          {[
            { label: "Макс. продажи", val: "221", color: "text-primary" },
            { label: "Средн. расходы", val: "58", color: "text-violet-400" },
            { label: "Общая прибыль", val: "942", color: "text-sky-400" },
          ].map(s => (
            <div key={s.label} className="bg-secondary/50 rounded-xl p-3 text-center">
              <div className={`text-xl font-bold font-mono ${s.color}`}>{s.val}</div>
              <div className="text-xs text-muted-foreground mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main App ─────────────────────────────────────────────────────────────────
export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("editor");
  const [data, setData] = useState<GridData>(INITIAL_DATA);
  const [sideOpen, setSideOpen] = useState(true);

  const handleFormat = useCallback((f: string) => {
    console.log("Format:", f);
  }, []);

  const tabs: { id: Tab; icon: string; label: string }[] = [
    { id: "editor", icon: "Table2", label: "Редактор" },
    { id: "files", icon: "FolderOpen", label: "Файлы" },
    { id: "templates", icon: "LayoutTemplate", label: "Шаблоны" },
    { id: "collab", icon: "Users", label: "Команда" },
    { id: "history", icon: "History", label: "История" },
    { id: "chart", icon: "BarChart3", label: "Графики" },
  ];

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-2.5 border-b border-border bg-card/60 backdrop-blur-sm shrink-0 z-50">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-primary/20 flex items-center justify-center neon-border">
            <Icon name="Table2" size={15} className="text-primary" />
          </div>
          <span className="font-bold text-foreground text-base tracking-tight">GridFlow</span>
        </div>

        <div className="w-px h-5 bg-border mx-1" />

        <div className="flex items-center gap-1">
          <Icon name="FileSpreadsheet" size={14} className="text-muted-foreground" />
          <span className="text-sm text-muted-foreground">Финансовый отчёт Q1</span>
          <div className="ml-2 px-1.5 py-0.5 bg-primary/15 rounded text-xs text-primary font-medium">Авто-сохранение</div>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-secondary rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/70 transition-all">
            <Icon name="Download" size={14} />
            Экспорт
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-primary text-primary-foreground rounded-lg text-sm font-medium hover-glow transition-all">
            <Icon name="Share2" size={14} />
            Поделиться
          </button>
          <div className="w-8 h-8 rounded-full bg-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-300">
            ВЫ
          </div>
        </div>
      </header>

      {/* Nav */}
      <nav className="flex items-center gap-0.5 px-4 py-1.5 border-b border-border bg-card/40 shrink-0">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={[
              "flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm transition-all",
              activeTab === t.id
                ? "bg-primary/10 text-primary font-medium"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50",
            ].join(" ")}
          >
            <Icon name={t.icon as any} size={14} />
            {t.label}
          </button>
        ))}
      </nav>

      {/* Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor view */}
        {activeTab === "editor" && (
          <>
            <div className="flex-1 flex flex-col overflow-hidden">
              <Toolbar onFormat={handleFormat} />
              <div className="flex-1 overflow-hidden">
                <Spreadsheet data={data} onDataChange={setData} />
              </div>
            </div>

            {/* Side: Charts */}
            <div className={[
              "border-l border-border bg-card/40 transition-all duration-300 overflow-hidden flex flex-col",
              sideOpen ? "w-80" : "w-0",
            ].join(" ")}>
              {sideOpen && (
                <div className="w-80 h-full flex flex-col">
                  <div className="p-3 border-b border-border flex items-center justify-between">
                    <span className="text-sm font-semibold text-foreground">Визуализация</span>
                    <button onClick={() => setSideOpen(false)} className="text-muted-foreground hover:text-foreground">
                      <Icon name="PanelRightClose" size={15} />
                    </button>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <ChartPanel data={data} />
                  </div>
                </div>
              )}
            </div>

            {!sideOpen && (
              <button
                onClick={() => setSideOpen(true)}
                className="shrink-0 w-8 bg-card/40 border-l border-border flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
              >
                <Icon name="PanelRightOpen" size={15} />
              </button>
            )}
          </>
        )}

        {activeTab === "files" && (
          <div className="flex-1 overflow-hidden">
            <FilesPanel />
          </div>
        )}
        {activeTab === "templates" && (
          <div className="flex-1 overflow-hidden">
            <TemplatesPanel />
          </div>
        )}
        {activeTab === "collab" && (
          <div className="flex-1 overflow-hidden">
            <CollabPanel />
          </div>
        )}
        {activeTab === "history" && (
          <div className="flex-1 overflow-hidden">
            <HistoryPanel />
          </div>
        )}
        {activeTab === "chart" && (
          <div className="flex-1 overflow-hidden">
            <ChartPanel data={data} />
          </div>
        )}
      </div>

      {/* Status bar */}
      <footer className="flex items-center gap-4 px-4 py-1.5 border-t border-border bg-card/40 text-xs text-muted-foreground shrink-0">
        <span>{ROWS} строк · {COLS} столбцов</span>
        <div className="w-px h-3 bg-border" />
        <span className="flex items-center gap-1">
          <span className="w-1.5 h-1.5 bg-primary rounded-full" />
          Сохранено
        </span>
        <div className="ml-auto flex items-center gap-3">
          <span>Масштаб 100%</span>
          <span>UTF-8</span>
          <span className="neon-text font-medium">GridFlow v1.0</span>
        </div>
      </footer>
    </div>
  );
}
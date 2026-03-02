import { useState } from 'react';
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from 'recharts';
import Icon from '@/components/ui/icon';

const CHART_DATA = [
  { name: 'Телефоны', Янв: 1250000, Фев: 1380000, Мар: 1520000 },
  { name: 'Ноутбуки', Янв: 2100000, Фев: 1950000, Мар: 2300000 },
  { name: 'Планшеты', Янв: 890000, Фев: 920000, Мар: 1100000 },
  { name: 'Аксессуары', Янв: 340000, Фев: 410000, Мар: 380000 },
];

const PIE_DATA = [
  { name: 'Телефоны', value: 4150000 },
  { name: 'Ноутбуки', value: 6350000 },
  { name: 'Планшеты', value: 2910000 },
  { name: 'Аксессуары', value: 1130000 },
];

const COLORS = ['#00f5a0', '#a855f7', '#38bdf8', '#fb923c'];

type ChartType = 'bar' | 'line' | 'pie';

const formatM = (v: number) => `${(v / 1000000).toFixed(1)}М`;

export default function ChartsPanel() {
  const [chartType, setChartType] = useState<ChartType>('bar');

  const chartTypes: { id: ChartType; icon: string; label: string }[] = [
    { id: 'bar', icon: 'BarChart2', label: 'Столбчатая' },
    { id: 'line', icon: 'TrendingUp', label: 'Линейная' },
    { id: 'pie', icon: 'PieChart', label: 'Круговая' },
  ];

  const customTooltip = ({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="glass rounded-xl p-2 shadow-xl border border-border">
        <div className="text-xs font-medium text-foreground mb-1">{label}</div>
        {payload.map((p, i: number) => (
          <div key={i} className="text-xs" style={{ color: p.color }}>
            {p.name}: {formatM(p.value)}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <h3 className="font-semibold text-sm mb-3">Диаграммы и графики</h3>
        <div className="flex gap-1 p-1 bg-secondary rounded-xl">
          {chartTypes.map(t => (
            <button
              key={t.id}
              onClick={() => setChartType(t.id)}
              className={`flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg text-xs transition-all ${
                chartType === t.id
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Icon name={t.icon} size={12} />
              <span className="hidden sm:inline">{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-4">
        <div>
          <div className="text-xs font-medium text-foreground mb-2">Продажи по категориям</div>
          <div className="rounded-xl border border-border p-3 bg-card/50" style={{ height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'bar' ? (
                <BarChart data={CHART_DATA} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={formatM} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={customTooltip} />
                  <Bar dataKey="Янв" fill="#00f5a0" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Фев" fill="#a855f7" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Мар" fill="#38bdf8" radius={[3, 3, 0, 0]} />
                </BarChart>
              ) : chartType === 'line' ? (
                <LineChart data={CHART_DATA} margin={{ top: 5, right: 5, bottom: 5, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={formatM} tick={{ fill: '#6b7280', fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip content={customTooltip} />
                  <Line type="monotone" dataKey="Янв" stroke="#00f5a0" strokeWidth={2} dot={{ r: 3, fill: '#00f5a0' }} />
                  <Line type="monotone" dataKey="Фев" stroke="#a855f7" strokeWidth={2} dot={{ r: 3, fill: '#a855f7' }} />
                  <Line type="monotone" dataKey="Мар" stroke="#38bdf8" strokeWidth={2} dot={{ r: 3, fill: '#38bdf8' }} />
                </LineChart>
              ) : (
                <PieChart>
                  <Pie data={PIE_DATA} cx="50%" cy="50%" outerRadius={70} dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false} fontSize={9}>
                    {PIE_DATA.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(v: number) => formatM(v)} />
                </PieChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        <div>
          <div className="text-xs font-medium text-foreground mb-2">Сводка за квартал</div>
          <div className="grid grid-cols-2 gap-2">
            {PIE_DATA.map((item, i) => {
              const total = PIE_DATA.reduce((s, d) => s + d.value, 0);
              const pct = ((item.value / total) * 100).toFixed(1);
              return (
                <div key={item.name} className="p-2.5 rounded-xl border border-border bg-card/50">
                  <div className="flex items-center gap-1.5 mb-1">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                    <span className="text-xs text-muted-foreground truncate">{item.name}</span>
                  </div>
                  <div className="text-sm font-bold" style={{ color: COLORS[i] }}>
                    {formatM(item.value)}
                  </div>
                  <div className="text-xs text-muted-foreground">{pct}% от итого</div>
                </div>
              );
            })}
          </div>
        </div>

        <button className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl border border-dashed border-border text-muted-foreground hover:border-primary/40 hover:text-primary text-xs transition-all">
          <Icon name="Plus" size={13} />
          Добавить новый график
        </button>
      </div>
    </div>
  );
}
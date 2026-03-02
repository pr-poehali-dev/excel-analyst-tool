import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { TEMPLATES } from '@/store/spreadsheetStore';

interface Props {
  onUseTemplate: (templateId: string) => void;
}

const categories = ['Все', 'Финансы', 'Продажи', 'Управление', 'Склад', 'HR', 'Маркетинг'];

export default function TemplatesPanel({ onUseTemplate }: Props) {
  const [activeCategory, setActiveCategory] = useState('Все');
  const [search, setSearch] = useState('');

  const filtered = TEMPLATES.filter(t => {
    const matchCat = activeCategory === 'Все' || t.category === activeCategory;
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) ||
      t.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <h3 className="font-semibold text-sm mb-3">Библиотека шаблонов</h3>
        <div className="relative mb-2">
          <Icon name="Search" size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-secondary rounded-lg outline-none border border-transparent focus:border-primary/50 transition-colors"
            placeholder="Поиск шаблонов..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap gap-1">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-2 py-0.5 rounded-full text-xs transition-colors ${
                activeCategory === cat
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-muted-foreground hover:text-foreground'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-2 space-y-2">
        {filtered.map(template => (
          <div
            key={template.id}
            className="p-3 rounded-xl border border-border hover:border-primary/30 bg-card/50 hover:bg-card transition-all group"
          >
            <div className="flex items-start gap-2.5">
              <div
                className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
                style={{ backgroundColor: `${template.color}20`, border: `1px solid ${template.color}40` }}
              >
                {template.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-foreground">{template.name}</div>
                <div className="text-xs text-muted-foreground mb-1">{template.description}</div>
                <span
                  className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{ backgroundColor: `${template.color}20`, color: template.color }}
                >
                  {template.category}
                </span>
              </div>
            </div>
            <button
              onClick={() => onUseTemplate(template.id)}
              className="w-full mt-2 py-1.5 rounded-lg text-xs font-medium transition-all opacity-0 group-hover:opacity-100 bg-primary/10 text-primary hover:bg-primary/20"
            >
              Использовать шаблон
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

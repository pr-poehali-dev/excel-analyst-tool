import Icon from '@/components/ui/icon';

type SidebarTab = 'files' | 'templates' | 'collab' | 'history' | 'charts';

interface Props {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
}

const tabs: { id: SidebarTab; icon: string; label: string }[] = [
  { id: 'files', icon: 'FolderOpen', label: 'Файлы' },
  { id: 'templates', icon: 'LayoutTemplate', label: 'Шаблоны' },
  { id: 'charts', icon: 'BarChart2', label: 'Графики' },
  { id: 'collab', icon: 'Users', label: 'Совместно' },
  { id: 'history', icon: 'History', label: 'История' },
];

export default function Sidebar({ activeTab, onTabChange }: Props) {
  return (
    <div className="flex flex-col items-center gap-1 py-3 w-14 border-r border-border bg-card/50">
      {tabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          title={tab.label}
          className={`relative group flex flex-col items-center justify-center w-10 h-10 rounded-xl transition-all ${
            activeTab === tab.id
              ? 'bg-primary/20 text-primary shadow-[0_0_12px_rgba(0,245,160,0.2)]'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
          }`}
        >
          <Icon name={tab.icon} size={18} />
          <span className="absolute left-full ml-2 px-2 py-1 text-xs bg-popover border border-border rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50 shadow-xl">
            {tab.label}
          </span>
          {activeTab === tab.id && (
            <span className="absolute right-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-primary rounded-l" />
          )}
        </button>
      ))}
    </div>
  );
}

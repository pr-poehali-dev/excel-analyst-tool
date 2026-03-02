import { useState } from 'react';
import Icon from '@/components/ui/icon';
import { Comment, Collaborator, sampleComments, sampleCollaborators } from '@/store/spreadsheetStore';

export default function CollabPanel() {
  const [comments, setComments] = useState<Comment[]>(sampleComments);
  const [collaborators] = useState<Collaborator[]>(sampleCollaborators);
  const [newComment, setNewComment] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'unresolved'>('unresolved');

  const filtered = comments.filter(c => activeFilter === 'all' || !c.resolved);

  const formatTime = (d: Date) => {
    const diff = Date.now() - d.getTime();
    if (diff < 60000) return 'только что';
    if (diff < 3600000) return `${Math.floor(diff / 60000)} мин`;
    return `${Math.floor(diff / 3600000)} ч`;
  };

  const resolveComment = (id: string) => {
    setComments(prev => prev.map(c => c.id === id ? { ...c, resolved: true } : c));
  };

  const addComment = () => {
    if (!newComment.trim()) return;
    const comment: Comment = {
      id: `c${Date.now()}`,
      cellRef: 'A1',
      author: 'Вы',
      avatar: 'ВЫ',
      text: newComment,
      timestamp: new Date(),
      resolved: false,
    };
    setComments(prev => [comment, ...prev]);
    setNewComment('');
  };

  return (
    <div className="flex flex-col h-full">
      <div className="p-3 border-b border-border">
        <h3 className="font-semibold text-sm mb-3">Совместная работа</h3>

        <div className="mb-3">
          <div className="text-xs text-muted-foreground mb-2">Сейчас в документе</div>
          <div className="space-y-2">
            {collaborators.map(c => (
              <div key={c.id} className="flex items-center gap-2">
                <div
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold text-black flex-shrink-0"
                  style={{ backgroundColor: c.color }}
                >
                  {c.avatar}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-medium truncate">{c.name}</div>
                  {c.activeCellRef && (
                    <div className="text-xs text-muted-foreground">Ячейка {c.activeCellRef}</div>
                  )}
                </div>
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        <button className="w-full flex items-center gap-2 py-1.5 px-3 rounded-lg bg-primary/10 border border-primary/30 text-primary text-xs font-medium hover:bg-primary/20 transition-colors">
          <Icon name="Link" size={13} />
          Скопировать ссылку доступа
        </button>
      </div>

      <div className="flex items-center gap-1 p-2 border-b border-border">
        {(['unresolved', 'all'] as const).map(f => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-3 py-1 rounded-full text-xs transition-colors ${
              activeFilter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {f === 'unresolved' ? 'Открытые' : 'Все'}
          </button>
        ))}
        <span className="ml-auto text-xs text-muted-foreground">{filtered.length} комментариев</span>
      </div>

      <div className="flex-1 overflow-auto p-2 space-y-2">
        {filtered.map(comment => (
          <div
            key={comment.id}
            className={`p-3 rounded-xl border transition-all ${
              comment.resolved ? 'border-border opacity-50' : 'border-border hover:border-primary/20'
            } bg-card/50`}
          >
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-accent/20 text-accent flex items-center justify-center text-xs font-bold flex-shrink-0">
                {comment.avatar}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1 mb-0.5">
                  <span className="text-xs font-medium">{comment.author}</span>
                  <span className="text-xs text-muted-foreground">· {formatTime(comment.timestamp)}</span>
                  <span className="ml-auto font-mono text-xs text-primary/70">{comment.cellRef}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{comment.text}</p>
              </div>
            </div>
            {!comment.resolved && (
              <button
                onClick={() => resolveComment(comment.id)}
                className="mt-2 text-xs text-muted-foreground hover:text-primary transition-colors flex items-center gap-1"
              >
                <Icon name="Check" size={11} />
                Закрыть
              </button>
            )}
          </div>
        ))}
      </div>

      <div className="p-2 border-t border-border">
        <div className="flex gap-1">
          <input
            className="flex-1 px-2.5 py-1.5 text-xs bg-secondary rounded-lg outline-none border border-transparent focus:border-primary/50 transition-colors"
            placeholder="Добавить комментарий..."
            value={newComment}
            onChange={e => setNewComment(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addComment()}
          />
          <button
            onClick={addComment}
            className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Icon name="Send" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';
import Badge from '../shared/Badge';
import Avatar from '../shared/Avatar';

export default function BoardCard({ board, onDelete }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  const memberAvatars = (board.members || []).slice(0, 3);
  const extra = Math.max(0, (board.members || []).length - 3);

  return (
    <div
      className="card-surface border-t-[3px] border-t-tw-red rounded-lg p-4 min-h-[100px] cursor-pointer
                 transition-all duration-200 relative group"
      style={hovered ? {
        backgroundColor: '#21262D',
        borderColor: '#F22F46',
        transform: 'translateY(-2px)',
        boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
        borderTopColor: '#F22F46',
      } : {}}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/boards/${board.id}`)}
    >
      <p className="text-base font-semibold text-tw-text-primary mb-4">{board.name}</p>

      <div className="flex items-end justify-between">
        <Badge label={board.privacy} />

        <div className="flex items-center">
          {memberAvatars.map((m, i) => (
            <Avatar key={m.id} name={m.name} stacked={i > 0} />
          ))}
          {extra > 0 && (
            <span className="text-xs text-tw-text-muted -ml-2 bg-tw-bg-surface border-2 border-tw-bg-surface rounded-full w-7 h-7 flex items-center justify-center">
              +{extra}
            </span>
          )}
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete(board.id);
        }}
        className="absolute top-3 right-3 text-tw-text-muted hover:text-tw-red transition-all"
        style={{ opacity: hovered ? 1 : 0, transition: 'opacity 150ms' }}
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
}

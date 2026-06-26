import { useState } from 'react';
import { AlignLeft } from 'lucide-react';
import Avatar from '../shared/Avatar';

export default function CardItem({ card, members, onClick, dragListeners, isDragging }) {
  const [hovered, setHovered] = useState(false);

  const assignees = (card.assignees || [])
    .map(a => members?.find(m => m.id === a.id))
    .filter(Boolean);

  return (
    <div
      className={`bg-tw-bg-raised border border-tw-border rounded-md p-2.5 transition-all duration-150 relative border-l-[2px] ${
        hovered && !isDragging ? 'border-l-tw-red' : 'border-l-transparent'
      }`}
      style={{
        ...(hovered && !isDragging ? { backgroundColor: '#2D333B' } : {}),
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Drag handle — thin left strip */}
      <div
        className="absolute left-0 top-0 bottom-0 w-3 z-10 rounded-l-md"
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
        {...dragListeners}
        onClick={(e) => e.stopPropagation()}
      />

      <p
        className="text-sm mb-2 pr-4 transition-colors duration-150"
        style={{ color: hovered && !isDragging ? '#E6EDF3' : '#8B949E' }}
      >
        {card.name}
      </p>

      <div className="flex items-end justify-between">
        {card.description ? (
          <AlignLeft size={14} className="text-tw-text-muted" />
        ) : (
          <span />
        )}
        {assignees.length > 0 && (
          <div className="flex items-center">
            {assignees.map((a, i) => (
              <Avatar key={a.id} name={a.name} stacked={i > 0} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

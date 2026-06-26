import { AlignLeft } from 'lucide-react';
import Avatar from '../shared/Avatar';

export default function CardGhost({ card }) {
  return (
    <div className="bg-tw-bg-raised border border-tw-border rounded-md p-2.5 shadow-drag border-l-[2px] border-l-tw-red opacity-95 rotate-[1.5deg] scale-[1.04] w-[calc(280px-1.5rem)]">
      <p className="text-sm text-tw-text-primary truncate">{card.name}</p>
    </div>
  );
}

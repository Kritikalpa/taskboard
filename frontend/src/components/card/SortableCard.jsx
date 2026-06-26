import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import CardItem from './CardItem';

export default function SortableCard({ card, members, onClick, isDragging }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({
    id: card.id,
    data: { type: 'card', card, listId: card.board_list_id },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging || isDragging ? 0.3 : 1,
  };

  const active = isSortableDragging || isDragging;

  return (
    <div ref={setNodeRef} style={style} {...attributes}>
      {active && (
        <div className="border-[1.5px] border-dashed border-tw-red bg-tw-red-muted rounded-md opacity-60 min-h-[60px]" />
      )}
      <CardItem
        card={card}
        members={members}
        onClick={onClick}
        dragListeners={listeners}
        isDragging={active}
      />
    </div>
  );
}

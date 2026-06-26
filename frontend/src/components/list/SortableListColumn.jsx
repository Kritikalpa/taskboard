import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import ListColumn from './ListColumn';

export default function SortableListColumn({ list, isDragOver, onRename, onDelete, children }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: list.id,
    data: { type: 'list', list },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <ListColumn
        list={list}
        isDragOver={isDragOver}
        onRename={onRename}
        onDelete={onDelete}
        dragHandle={listeners}
        dragAttributes={attributes}
      >
        {children}
      </ListColumn>
    </div>
  );
}

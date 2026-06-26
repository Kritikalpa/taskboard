import { useDroppable } from '@dnd-kit/core';
import ListHeader from './ListHeader';

export default function ListColumn({ list, isDragOver, onRename, onDelete, children, dragHandle, dragAttributes }) {
  const { setNodeRef } = useDroppable({
    id: `list-${list.id}`,
    data: { type: 'list', listId: list.id },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex-shrink-0 w-[280px] bg-tw-bg-surface rounded-lg p-3 max-h-[calc(100vh-120px)] overflow-y-auto transition-all duration-150 ${
        isDragOver
          ? 'border border-tw-red shadow-[0_0_0_2px_rgba(242,47,70,0.25)]'
          : 'border border-tw-border shadow-column'
      }`}
    >
      <ListHeader
        name={list.name}
        onRename={(val) => onRename(list.id, val)}
        onDelete={() => onDelete(list.id)}
        dragHandle={dragHandle}
      />
      {children}
    </div>
  );
}

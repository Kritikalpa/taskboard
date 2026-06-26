import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { MoreHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { BoardProvider, useBoardContext } from '../context/BoardContext';
import { getBoard, updateBoard, deleteBoard, addMember, removeMember } from '../api/boards';
import { createList, updateList, deleteList } from '../api/boardlists';
import { createCard, updateCard, deleteCard, assignCard, unassignCard, getCard } from '../api/cards';
import { getAllUsers } from '../api/users';
import Badge from '../components/shared/Badge';
import Avatar from '../components/shared/Avatar';
import Spinner from '../components/shared/Spinner';
import BoardForm from '../components/board/BoardForm';
import BoardMemberPanel from '../components/board/BoardMemberPanel';
import ConfirmDialog from '../components/shared/ConfirmDialog';
import SortableListColumn from '../components/list/SortableListColumn';
import AddListButton from '../components/list/AddListButton';
import SortableCard from '../components/card/SortableCard';
import ListColumn from '../components/list/ListColumn';
import CardAddForm from '../components/card/CardAddForm';
import CardModal from '../components/card/CardModal';
import CardGhost from '../components/card/CardGhost';
import CardInsertZone from '../components/card/CardInsertZone';

function BoardShell() {
  const { id } = useParams();
  const { state, dispatch } = useBoardContext();
  const { board, lists, loading } = state;

  // --- local state ---
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleValue, setTitleValue] = useState('');
  const [menuOpen, setMenuOpen] = useState(false);
  const [showEditBoard, setShowEditBoard] = useState(false);
  const [showMemberPanel, setShowMemberPanel] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [addFormListId, setAddFormListId] = useState(null);
  const [insertingAt, setInsertingAt] = useState(null);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showCardModal, setShowCardModal] = useState(false);
  const menuRef = useRef(null);

  // --- dnd state ---
  const [activeCard, setActiveCard] = useState(null);
  const [dragOverListId, setDragOverListId] = useState(null);
  const prevStateRef = useRef(null);
  const movedRef = useRef(null); // prevent infinite onDragOver loops

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  // --- data fetching ---
  useEffect(() => {
    const fetchBoard = async () => {
      dispatch({ type: 'SET_LOADING', payload: true });
      try {
        const { data } = await getBoard(id);
        dispatch({ type: 'SET_BOARD', payload: data });
        setTitleValue(data.name);
      } catch (_) {
        dispatch({ type: 'SET_ERROR', payload: 'Failed to load board' });
      }
    };
    fetchBoard();
  }, [id, dispatch]);

  useEffect(() => {
    if (!showMemberPanel) return;
    const fetchUsers = async () => {
      try {
        const { data } = await getAllUsers();
        setAllUsers(data);
      } catch (_) {}
    };
    fetchUsers();
  }, [showMemberPanel]);

  useEffect(() => {
    const handler = (e) => {
      if (menuOpen && menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [menuOpen]);

  // --- title ---
  const handleTitleSave = async () => {
    if (!titleValue.trim() || titleValue === board?.name) {
      setTitleValue(board?.name || '');
      setEditingTitle(false);
      return;
    }
    try {
      await updateBoard(id, { name: titleValue });
      dispatch({ type: 'SET_BOARD', payload: { ...board, members: board?.members, lists, name: titleValue } });
      toast.success('Board renamed');
      setEditingTitle(false);
    } catch (_) {}
  };

  const handleTitleKey = (e) => {
    if (e.key === 'Enter') handleTitleSave();
    if (e.key === 'Escape') { setTitleValue(board?.name || ''); setEditingTitle(false); }
  };

  // --- board ---
  const handleEditBoard = async (form) => {
    try {
      await updateBoard(id, form);
      toast.success('Board updated');
      setShowEditBoard(false);
      const { data } = await getBoard(id);
      dispatch({ type: 'SET_BOARD', payload: data });
      setTitleValue(data.name);
    } catch (_) {}
  };

  const handleDeleteBoard = async () => {
    try {
      await deleteBoard(id);
      toast.success('Board deleted');
      window.location.href = '/';
    } catch (_) {}
  };

  // --- members ---
  const handleAddMember = async (userId) => {
    try {
      await addMember(id, { user_id: userId });
      const user = allUsers.find(u => u.id === userId);
      toast.success(`${user?.name || 'User'} added`);
      dispatch({ type: 'ADD_MEMBER', payload: user });
    } catch (_) {}
  };

  const handleRemoveMember = async (userId) => {
    try {
      await removeMember(id, userId);
      toast.success('Member removed');
      dispatch({ type: 'REMOVE_MEMBER', payload: userId });
    } catch (_) {}
  };

  // --- lists ---
  const handleAddList = async (name) => {
    try {
      const { data } = await createList(id, { name });
      toast.success('List created');
      dispatch({ type: 'ADD_LIST', payload: data });
    } catch (_) {}
  };

  const handleRenameList = async (listId, name) => {
    try {
      await updateList(listId, { name });
      dispatch({ type: 'UPDATE_LIST', payload: { id: listId, name } });
    } catch (_) {}
  };

  const handleDeleteList = async (listId) => {
    try {
      await deleteList(listId);
      toast.success('List deleted');
      dispatch({ type: 'DELETE_LIST', payload: listId });
    } catch (_) {}
  };

  // --- card CRUD ---
  const handleAddCard = (listId) => async (data) => {
    try {
      const { data: card } = await createCard(listId, data);
      toast.success('Card added');
      dispatch({ type: 'ADD_CARD', payload: { listId, card } });
      setAddFormListId(null);
    } catch (_) {}
  };

  const handleAddCardAt = (listId, index) => async (data) => {
    try {
      const { data: card } = await createCard(listId, { ...data, position: index });
      toast.success('Card added');
      dispatch({ type: 'ADD_CARD', payload: { listId, card } });
      setInsertingAt(null);
    } catch (_) {}
  };

  const handleUpdateCard = async (cardId, data) => {
    try {
      const { data: updated } = await updateCard(cardId, data);
      dispatch({ type: 'UPDATE_CARD', payload: { id: cardId, ...updated } });
      setSelectedCard(updated);
    } catch (_) {}
  };

  const handleDeleteCard = async (cardId) => {
    try {
      await deleteCard(cardId);
      toast.success('Card deleted');
      dispatch({ type: 'DELETE_CARD', payload: cardId });
      setShowCardModal(false);
      setSelectedCard(null);
    } catch (_) {}
  };

  const handleAssignCard = async (cardId, userId) => {
    try {
      const { data: updated } = await assignCard(cardId, { user_id: userId });
      dispatch({ type: 'UPDATE_CARD', payload: { id: cardId, ...updated } });
      setSelectedCard(updated);
    } catch (_) {}
  };

  const handleUnassignCard = async (cardId, userId) => {
    try {
      const { data: updated } = await unassignCard(cardId, userId);
      dispatch({ type: 'UPDATE_CARD', payload: { id: cardId, ...updated } });
      setSelectedCard(updated);
    } catch (_) {}
  };

  const handleClickCard = async (card) => {
    try {
      const { data } = await getCard(card.id);
      setSelectedCard(data);
      setShowCardModal(true);
    } catch (_) {}
  };

  // ===================================================================
  // Drag and Drop
  // ===================================================================

  const onDragStart = (event) => {
    const { active } = event;
    movedRef.current = null;
    prevStateRef.current = JSON.parse(JSON.stringify(state.lists));

    if (active.data.current?.type === 'card') {
      setActiveCard(active.data.current.card);
    } else if (active.data.current?.type === 'list') {
      // list drag — handled entirely in onDragOver/onDragEnd by active.data type
    }
  };

  const onDragOver = (event) => {
    const { active, over } = event;
    if (!over) return;

    const activeType = active.data.current?.type;
    const overType = over.data.current?.type;

    // Card drags — just update visual indicator, don't mutate state
    if (activeType === 'card') {
      if (!activeCard) return;
      let overListId = null;
      if (overType === 'card') {
        overListId = over.data.current.listId;
      } else if (overType === 'list') {
        overListId = over.data.current.listId;
      }
      if (!overListId) return;

      setDragOverListId(overListId !== active.data.current?.listId ? overListId : null);
    }

    // List drags — just update visual indicator, don't mutate state
    if (activeType === 'list' && overType === 'list') {
      // visual feedback handled by the sortable strategy and DragOverlay
    }
  };

  const onDragEnd = async (event) => {
    const { active, over } = event;
    const activeType = active.data.current?.type;

    if (activeType === 'card') {
      setActiveCard(null);
      setDragOverListId(null);
      movedRef.current = null;

      if (!over || !prevStateRef.current) { prevStateRef.current = null; return; }

      const overData = over.data.current;
      let overListId = null;
      if (overData?.type === 'card') overListId = overData.listId;
      else if (overData?.type === 'list') overListId = overData.listId;

      if (!overListId) { prevStateRef.current = null; return; }

      const activeListId = active.data.current?.listId;
      if (!activeListId) { prevStateRef.current = null; return; }

      try {
        if (activeListId === overListId) {
          // Same-list reorder
          const fromIndex = active.data.current?.sortable?.index;
          const toIndex = over.data.current?.sortable?.index;
          if (fromIndex != null && toIndex != null && fromIndex !== toIndex) {
            dispatch({ type: 'REORDER_CARDS', payload: { listId: activeListId, fromIndex, toIndex } });
            // Persist all card positions in the list
            const list = state.lists.find(l => l.id === activeListId);
            if (list) {
              const reordered = [...list.cards];
              const [moved] = reordered.splice(fromIndex, 1);
              reordered.splice(toIndex, 0, moved);
              await Promise.all(reordered.map((c, i) => updateCard(c.id, { position: i })));
            }
          }
        } else {
          // Cross-list move
          const overIndex = overData?.type === 'card'
            ? (state.lists.find(l => l.id === overListId)?.cards.findIndex(c => c.id === over.id) ?? 0)
            : (state.lists.find(l => l.id === overListId)?.cards.length ?? 0);

          const sourceList = state.lists.find(l => l.id === activeListId);
          const targetList = state.lists.find(l => l.id === overListId);

          dispatch({ type: 'MOVE_CARD', payload: { cardId: activeCard.id, fromListId: activeListId, toListId: overListId, newIndex: overIndex } });

          // Persist positions for all cards in both lists
          const apiCalls = [];
          if (sourceList) {
            sourceList.cards
              .filter(c => c.id !== activeCard.id)
              .forEach((c, i) => apiCalls.push(updateCard(c.id, { position: i })));
          }
          if (targetList) {
            const targetCards = [...targetList.cards];
            targetCards.splice(overIndex, 0, activeCard);
            targetCards.forEach((c, i) => {
              if (c.id === activeCard.id) {
                apiCalls.push(updateCard(c.id, { board_list_id: overListId, position: i }));
              } else {
                apiCalls.push(updateCard(c.id, { position: i }));
              }
            });
          }
          await Promise.all(apiCalls);

          if (targetList) toast.success(`Card moved to ${targetList.name}`);
        }
      } catch (_) {
        if (prevStateRef.current) {
          dispatch({ type: 'SET_BOARD', payload: { ...state.board, members: state.board?.members, lists: prevStateRef.current } });
        }
      }
      prevStateRef.current = null;
    }

    if (activeType === 'list') {
      if (!over || active.id === over.id) return;

      const reordered = [...state.lists];
      const fromIndex = reordered.findIndex(l => l.id === active.id);
      const overListId = over.data.current?.listId ?? over.id;
      const toIndex = reordered.findIndex(l => l.id === overListId);
      if (fromIndex === -1 || toIndex === -1) return;

      const [moved] = reordered.splice(fromIndex, 1);
      reordered.splice(toIndex, 0, moved);

      dispatch({ type: 'SET_BOARD', payload: { ...state.board, members: state.board?.members, lists: reordered } });

      try {
        await Promise.all(reordered.map((l, i) => updateList(l.id, { position: i })));
      } catch (_) {}
    }
  };

  // ===================================================================

  if (loading) return (
    <div className="h-[calc(100%-3.5rem)] flex flex-col">
      <div className="h-16 bg-tw-bg-surface border-b border-tw-border px-6 flex items-center gap-3">
        <div className="h-5 w-32 bg-shimmer bg-[length:200%_100%] animate-shimmer rounded" />
        <div className="h-4 w-16 bg-shimmer bg-[length:200%_100%] animate-shimmer rounded-full" />
      </div>
      <div className="flex-1 flex gap-3 p-5 px-6 items-start">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex-shrink-0 w-[280px] bg-tw-bg-surface border border-tw-border rounded-lg p-3 animate-pulse">
            <div className="h-4 w-24 bg-shimmer bg-[length:200%_100%] animate-shimmer rounded mb-3" />
            <div className="space-y-2">
              {[1, 2, 3].map(j => (
                <div key={j} className="h-16 bg-shimmer bg-[length:200%_100%] animate-shimmer rounded-md" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
  if (!board) return <p className="p-12 text-tw-text-muted text-center">Board not found.</p>;

  return (
    <div className="h-[calc(100%-3.5rem)] flex flex-col">
      {/* Board Header */}
      <div className="flex items-center justify-between px-6 py-4 bg-tw-bg-surface border-b border-tw-border shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/" className="text-tw-text-muted hover:text-tw-text-primary text-sm transition-colors">&larr;</Link>
          {editingTitle ? (
            <input
              type="text"
              value={titleValue}
              onChange={e => setTitleValue(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKey}
              className="input-base py-1 text-xl font-bold w-auto min-w-[200px]"
              autoFocus
            />
          ) : (
            <h1
              className="text-xl font-bold text-tw-text-primary cursor-pointer hover:text-tw-red transition-colors"
              onClick={() => setEditingTitle(true)}
            >
              {board.name}
            </h1>
          )}
          <Badge label={board.privacy} />
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center">
            {(board.members || []).slice(0, 4).map((m, i) => (
              <Avatar key={m.id} name={m.name} stacked={i > 0} />
            ))}
            {(board.members || []).length > 4 && (
              <span className="text-xs text-tw-text-muted -ml-2 bg-tw-bg-surface border-2 border-tw-bg-surface rounded-full w-7 h-7 flex items-center justify-center">
                +{board.members.length - 4}
              </span>
            )}
          </div>

          <div className="relative" ref={menuRef}>
            <button onClick={() => setMenuOpen(!menuOpen)} className="btn-ghost p-1.5">
              <MoreHorizontal size={18} />
            </button>
            <AnimatePresence>
              {menuOpen && (
                <motion.div
                  className="absolute right-0 mt-1 w-44 bg-tw-bg-raised border border-tw-border rounded-lg shadow-modal py-1 z-50"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
                >
                  <button onClick={() => { setMenuOpen(false); setShowEditBoard(true); }} className="w-full text-left px-4 py-2 text-sm text-tw-text-secondary hover:bg-tw-bg-hover hover:text-tw-text-primary transition-colors">Edit board</button>
                  <button onClick={() => { setMenuOpen(false); setShowMemberPanel(true); }} className="w-full text-left px-4 py-2 text-sm text-tw-text-secondary hover:bg-tw-bg-hover hover:text-tw-text-primary transition-colors">Manage members</button>
                  <div className="border-t border-tw-border my-1" />
                  <button onClick={() => { setMenuOpen(false); setShowDeleteConfirm(true); }} className="w-full text-left px-4 py-2 text-sm text-tw-red hover:bg-tw-red-muted transition-colors">Delete board</button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Columns container — DndContext wraps only this section */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex-1 flex gap-3 overflow-x-auto p-5 px-6 items-start">
          <SortableContext
            items={(lists || []).map(l => l.id)}
            strategy={horizontalListSortingStrategy}
          >
            {(lists || []).map((list, i) => (
              <motion.div
                key={list.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.28, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
              >
                <SortableListColumn
                  list={list}
                  isDragOver={dragOverListId === list.id}
                  onRename={handleRenameList}
                  onDelete={handleDeleteList}
                >
              <SortableContext
                items={(list.cards || []).map(c => c.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="flex flex-col gap-0">
                  {(list.cards || []).length === 0 ? (
                    <p className="text-xs text-tw-text-muted text-center py-2">No cards yet</p>
                  ) : (
                    (list.cards || []).flatMap((card, i) => [
                      insertingAt?.listId === list.id && insertingAt?.index === i ? (
                        <CardAddForm key={`form-${card.id}`} onSubmit={handleAddCardAt(list.id, i)} onCancel={() => setInsertingAt(null)} />
                      ) : (
                        <CardInsertZone key={`zone-${card.id}`} onAdd={() => setInsertingAt({ listId: list.id, index: i })} />
                      ),
                      <SortableCard key={card.id} card={card} members={board.members || []} onClick={() => handleClickCard(card)} isDragging={activeCard?.id === card.id} />,
                    ]).concat(
                      insertingAt?.listId === list.id && insertingAt?.index === (list.cards || []).length ? (
                        <CardAddForm key={`form-${list.id}-last`} onSubmit={handleAddCardAt(list.id, (list.cards || []).length)} onCancel={() => setInsertingAt(null)} />
                      ) : (
                        <CardInsertZone key={`zone-${list.id}-last`} onAdd={() => setInsertingAt({ listId: list.id, index: (list.cards || []).length })} />
                      )
                    )
                  )}
                </div>
              </SortableContext>

              <div className="mt-2">
                <AnimatePresence>
                  {addFormListId === list.id && (
                    <CardAddForm
                      onSubmit={handleAddCard(list.id)}
                      onCancel={() => setAddFormListId(null)}
                    />
                  )}
                </AnimatePresence>

                {addFormListId !== list.id && (
                  <button
                    onClick={() => setAddFormListId(list.id)}
                    className="w-full text-left text-sm text-tw-text-muted hover:text-tw-text-secondary hover:bg-tw-bg-hover rounded-md px-2 py-1.5 transition-colors"
                  >
                    + Add a card
                  </button>
                )}
              </div>
            </SortableListColumn>
            </motion.div>
          ))}
          </SortableContext>

          <AddListButton onAdd={handleAddList} />
        </div>

        <DragOverlay dropAnimation={null}>
          {activeCard ? <CardGhost card={activeCard} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Modals */}
      <BoardForm open={showEditBoard} onClose={() => setShowEditBoard(false)} onSubmit={handleEditBoard}
        initialData={{ name: board.name, privacy: board.privacy }} />
      <BoardMemberPanel open={showMemberPanel} onClose={() => setShowMemberPanel(false)}
        members={board.members || []} allUsers={allUsers}
        onAddMember={handleAddMember} onRemoveMember={handleRemoveMember} />
      <ConfirmDialog open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)}
        title="Delete Board"
        message={`Are you sure you want to delete "${board.name}"? This will remove all lists and cards.`}
        confirmLabel="Delete" onConfirm={handleDeleteBoard} />
      {selectedCard && (
        <CardModal card={selectedCard} members={board.members || []} lists={lists || []}
          open={showCardModal} onClose={() => { setShowCardModal(false); setSelectedCard(null); }}
          onUpdate={(data) => handleUpdateCard(selectedCard.id, data)}
          onDelete={() => handleDeleteCard(selectedCard.id)}
          onAssign={(uid) => handleAssignCard(selectedCard.id, uid)}
          onUnassign={(uid) => handleUnassignCard(selectedCard.id, uid)}
          onMove={async (lid) => {
            const fromListId = selectedCard.board_list_id;
            const toListId = lid;
            if (fromListId === toListId) return;
            const targetList = lists.find(l => l.id === toListId);
            const newIndex = targetList?.cards.length ?? 0;
            dispatch({ type: 'MOVE_CARD', payload: { cardId: selectedCard.id, fromListId, toListId, newIndex } });
            const { data: updated } = await updateCard(selectedCard.id, { board_list_id: lid });
            setSelectedCard(updated);
          }}
        />
      )}
    </div>
  );
}

export default function BoardPage() {
  const { id } = useParams();
  return (
    <BoardProvider key={id}>
      <BoardShell />
    </BoardProvider>
  );
}

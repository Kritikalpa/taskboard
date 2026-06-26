import { useState, useRef, useEffect } from 'react';
import { X, ChevronDown } from 'lucide-react';
import Avatar from '../shared/Avatar';
import ConfirmDialog from '../shared/ConfirmDialog';

export default function CardModal({ card, members, lists, open, onClose, onUpdate, onDelete, onAssign, onUnassign, onMove }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [changed, setChanged] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editingTitle, setEditingTitle] = useState(false);
  const titleInputRef = useRef(null);
  const descRef = useRef(null);

  useEffect(() => {
    if (card) {
      setName(card.name);
      setDescription(card.description || '');
      setChanged(false);
    }
  }, [card]);

  useEffect(() => {
    if (editingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [editingTitle]);

  const markChanged = () => setChanged(true);

  const handleSave = () => {
    if (changed) onUpdate({ name: name.trim(), description: description.trim() || null });
  };

  const handleMove = (e) => {
    const lid = Number(e.target.value);
    if (lid) onMove(lid);
  };

  const autoExpand = (el) => {
    el.style.height = 'auto';
    el.style.height = el.scrollHeight + 'px';
  };

  if (!card) return null;

  return (
    <>
      {/* Backdrop + panel — using similar pattern as Modal but custom layout */}
      <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
        <div className="absolute inset-0 bg-black/60" />
        <div
          className="relative bg-tw-bg-raised border border-tw-border rounded-xl shadow-modal p-7 w-full max-w-[560px] max-h-[85vh] overflow-y-auto"
          onClick={e => e.stopPropagation()}
        >
          {/* Close button */}
          <button onClick={onClose} className="absolute top-5 right-5 text-tw-text-muted hover:text-tw-text-primary transition-colors">
            <X size={18} />
          </button>

          {/* Move dropdown */}
          {lists && lists.length > 0 && (
            <div className="relative mt-8 mb-4">
              <label className="block text-sm font-medium text-tw-text-secondary mb-2">Move to List</label>
              <select
                value={card.board_list_id}
                onChange={handleMove}
                className="input-base appearance-none pr-8 cursor-pointer"
              >
                {lists.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-2 top-12 -translate-y-1/2 w-3.5 h-3.5 text-tw-text-muted pointer-events-none" />
            </div>
          )}

          {/* Title */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-tw-text-secondary mb-2">Title</label>
            {editingTitle ? (
              <input
                ref={titleInputRef}
                type="text"
                value={name}
                onChange={e => { setName(e.target.value); markChanged(); }}
                onBlur={() => {
                  setEditingTitle(false);
                  if (!name.trim()) setName(card.name);
                }}
                onKeyDown={e => { if (e.key === 'Enter') setEditingTitle(false); if (e.key === 'Escape') { setName(card.name); setEditingTitle(false); } }}
                className="text-xl font-bold text-tw-text-primary bg-transparent border-b border-tw-red w-full outline-none pb-1"
              />
            ) : (
              <h2
                className="text-xl font-bold text-tw-text-primary cursor-pointer hover:text-tw-red transition-colors"
                onClick={() => setEditingTitle(true)}
              >
                {name}
              </h2>
            )}
          </div>

          {/* Description */}
          <div className="mb-5">
            <label className="block text-sm font-medium text-tw-text-secondary mb-2">Description</label>
            <textarea
              ref={descRef}
              value={description}
              onChange={e => { setDescription(e.target.value); markChanged(); autoExpand(e.target); }}
              className="input-base resize-none"
              rows={3}
              placeholder="Add a description…"
              onFocus={e => autoExpand(e.target)}
            />
          </div>

          {/* Assignment */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-tw-text-secondary mb-2">Assigned to</label>
            <div className="space-y-2">
              {(card.assignees || []).map(a => (
                <div key={a.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Avatar name={a.name} />
                    <span className="text-sm text-tw-text-primary">{a.name}</span>
                  </div>
                  <button onClick={() => onUnassign(a.id)} className="text-xs text-tw-text-muted hover:text-tw-red transition-colors">Remove</button>
                </div>
              ))}
            </div>
            {members && members.length > 0 && (
              <div className="mt-3 border-t border-tw-border pt-3">
                <p className="text-xs font-medium text-tw-text-muted uppercase tracking-wider mb-2">Add Member</p>
                <div className="space-y-1">
                  {members
                    .filter(m => !(card.assignees || []).some(a => a.id === m.id))
                    .map(m => (
                      <button
                        key={m.id}
                        onClick={() => onAssign(m.id)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-tw-bg-hover text-left transition-colors"
                      >
                        <Avatar name={m.name} />
                        <span className="text-sm text-tw-text-primary">{m.name}</span>
                      </button>
                    ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className={`btn-primary ${changed ? '' : 'opacity-40 cursor-not-allowed'}`}
              disabled={!changed}
            >
              Save changes
            </button>
            <button
              onClick={() => setConfirmOpen(true)}
              className="btn-danger"
            >
              Delete card
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete Card"
        message={`Are you sure you want to delete "${card.name}"?`}
        confirmLabel="Delete"
        onConfirm={() => { setConfirmOpen(false); onDelete(); }}
      />
    </>
  );
}

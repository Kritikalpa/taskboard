import { useState, useRef } from 'react';
import { MoreHorizontal, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ConfirmDialog from '../shared/ConfirmDialog';

export default function ListHeader({ name, onRename, onDelete, dragHandle }) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(name);
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const menuRef = useRef(null);

  const save = () => {
    if (value.trim() && value !== name) {
      onRename(value.trim());
    } else {
      setValue(name);
    }
    setEditing(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') save();
    if (e.key === 'Escape') { setValue(name); setEditing(false); }
  };

  return (
    <div className="flex items-center justify-between mb-3">
      {editing ? (
        <input
          type="text"
          value={value}
          onChange={e => setValue(e.target.value)}
          onBlur={save}
          onKeyDown={handleKey}
          className="bg-tw-bg-deep border border-tw-border rounded px-2 py-1 text-sm text-tw-text-primary w-full focus:outline-none focus:border-tw-red"
          autoFocus
          onFocus={e => e.target.select()}
        />
      ) : (
        <h3
          className="text-base font-semibold text-tw-text-primary cursor-pointer hover:text-tw-red transition-colors truncate"
          {...dragHandle}
          style={{ cursor: dragHandle ? 'grab' : 'pointer' }}
          onClick={(e) => {
            if (dragHandle) e.stopPropagation();
            setEditing(true);
          }}
        >
          {name}
        </h3>
      )}

      <div className="flex items-center gap-1 shrink-0 ml-1">
        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="text-tw-text-muted hover:text-tw-text-primary transition-colors p-0.5"
          >
            <MoreHorizontal size={16} />
          </button>
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                className="absolute right-0 top-full mt-1 w-36 bg-tw-bg-raised border border-tw-border rounded-lg shadow-modal py-1 z-40"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
              >
                <button
                  onClick={() => { setMenuOpen(false); setEditing(true); }}
                  className="w-full text-left px-3 py-1.5 text-sm text-tw-text-secondary hover:bg-tw-bg-hover hover:text-tw-text-primary transition-colors"
                >
                  Rename
                </button>
                <button
                  onClick={() => { setMenuOpen(false); setConfirmOpen(true); }}
                  className="w-full text-left px-3 py-1.5 text-sm text-tw-red hover:bg-tw-red-muted transition-colors"
                >
                  Delete list
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Delete List"
        message={`Are you sure you want to delete "${name}"?`}
        confirmLabel="Delete"
        onConfirm={() => { setConfirmOpen(false); onDelete(); }}
      />
    </div>
  );
}

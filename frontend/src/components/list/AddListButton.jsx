import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function AddListButton({ onAdd }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const inputRef = useRef(null);

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setName('');
    setOpen(false);
  };

  const handleKey = (e) => {
    if (e.key === 'Enter') submit();
    if (e.key === 'Escape') { setName(''); setOpen(false); }
  };

  return (
    <div className="flex-shrink-0 w-[280px]">
      <AnimatePresence mode="wait">
        {!open ? (
          <motion.button
            key="trigger"
            layoutId="add-list-container"
            onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
            className="w-full rounded-lg border border-tw-border/40 bg-tw-bg-surface/60 backdrop-blur-sm px-4 py-3 text-left cursor-pointer hover:bg-tw-bg-surface/80 transition-colors"
          >
            <span className="text-sm text-tw-text-muted">+ Add another list</span>
          </motion.button>
        ) : (
          <motion.div
            key="form"
            layoutId="add-list-container"
            className="w-full rounded-lg border border-tw-border bg-tw-bg-surface p-3"
            transition={{ layout: { duration: 0.3, ease: [0.34, 1.56, 0.64, 1] } }}
          >
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              onKeyDown={handleKey}
              className="input-base mb-2"
              placeholder="Enter list name…"
            />
            <div className="flex gap-2">
              <button onClick={submit} className="btn-primary text-xs px-3 py-1.5" disabled={!name.trim()}>
                Add list
              </button>
              <button
                onClick={() => { setName(''); setOpen(false); }}
                className="text-tw-text-muted hover:text-tw-text-primary transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

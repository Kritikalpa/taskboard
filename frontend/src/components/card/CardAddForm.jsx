import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

export default function CardAddForm({ onSubmit, onCancel }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const textareaRef = useRef(null);

  const submit = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    onSubmit({ name: trimmed, description: description.trim() || null });
    setName('');
    setDescription('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
    if (e.key === 'Escape') onCancel();
  };

  return (
    <motion.div
      className="space-y-2 mt-1 overflow-hidden"
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 'auto', opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <textarea
        ref={textareaRef}
        value={name}
        onChange={e => setName(e.target.value)}
        onKeyDown={handleKeyDown}
        className="input-base resize-none"
        placeholder="Enter card name…"
        rows={2}
        autoFocus
      />
      <textarea
        value={description}
        onChange={e => setDescription(e.target.value)}
        onKeyDown={handleKeyDown}
        className="input-base resize-none"
        placeholder="Description (optional)"
        rows={2}
      />
      <div className="flex gap-2 items-center">
        <button onClick={submit} className="btn-primary text-xs px-3 py-1.5" disabled={!name.trim()}>
          Add card
        </button>
        <button onClick={onCancel} className="text-tw-text-muted hover:text-tw-text-primary transition-colors">
          <X size={18} />
        </button>
      </div>
    </motion.div>
  );
}

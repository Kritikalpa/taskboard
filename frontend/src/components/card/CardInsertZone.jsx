import { useState } from 'react';
import { motion } from 'framer-motion';

export default function CardInsertZone({ onAdd }) {
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="w-full flex items-center justify-center overflow-hidden cursor-pointer transition-all duration-200 ease-out-expo"
      style={{ height: hovered ? '32px' : '4px' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <motion.button
        className="w-full text-sm text-tw-red bg-tw-red-muted border border-dashed border-tw-red rounded px-3 py-1 text-left h-full flex items-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: hovered ? 1 : 0, scale: hovered ? 1 : 0.8 }}
        transition={{ duration: 0.15, ease: [0.34, 1.56, 0.64, 1] }}
        onClick={onAdd}
      >
        + Add card
      </motion.button>
    </div>
  );
}

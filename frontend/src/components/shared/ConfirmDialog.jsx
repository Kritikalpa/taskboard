import { motion } from 'framer-motion';
import Modal from './Modal';

const shakeVariants = {
  hidden: { x: 0 },
  visible: {
    x: [0, -6, 6, -4, 4, 0],
    transition: { duration: 0.3 },
  },
};

export default function ConfirmDialog({ open, onClose, title, message, confirmLabel = 'Delete', onConfirm }) {
  return (
    <Modal open={open} onClose={onClose} title={title} width="max-w-xs">
      <motion.div variants={shakeVariants} initial="hidden" animate="visible">
        <p className="text-sm text-tw-text-secondary mb-5">{message}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="btn-ghost">Cancel</button>
          <button
            onClick={onConfirm}
            className="btn-danger animate-[pulse_0.4s_ease-out_1]"
          >
            {confirmLabel}
          </button>
        </div>
      </motion.div>
    </Modal>
  );
}

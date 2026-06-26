import { motion } from 'framer-motion';
import BoardCard from './BoardCard';

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
};

function SkeletonCard() {
  return (
    <div className="card-surface rounded-lg p-4 min-h-[100px] animate-pulse">
      <div className="h-5 w-3/4 rounded mb-4 bg-shimmer bg-[length:200%_100%] animate-shimmer" />
      <div className="flex items-end justify-between">
        <div className="h-4 w-14 rounded-full bg-shimmer bg-[length:200%_100%] animate-shimmer" />
        <div className="h-7 w-7 rounded-full bg-shimmer bg-[length:200%_100%] animate-shimmer" />
      </div>
    </div>
  );
}

export default function BoardGrid({ boards, loading, onDelete }) {
  if (loading) {
    return (
      <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4">
        <SkeletonCard />
        <SkeletonCard />
        <SkeletonCard />
      </div>
    );
  }

  if (!boards || boards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-20 h-20 rounded-full bg-tw-red-muted flex items-center justify-center mb-5">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F22F46" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1" />
            <rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" />
            <rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        </div>
        <p className="text-tw-text-secondary text-sm mb-4">No boards yet. Create one to get started.</p>
      </div>
    );
  }

  return (
    <motion.div
      className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-4"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {boards.map((board) => (
        <motion.div key={board.id} variants={itemVariants}>
          <BoardCard board={board} onDelete={onDelete} />
        </motion.div>
      ))}
    </motion.div>
  );
}

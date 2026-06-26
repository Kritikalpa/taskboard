import { motion, AnimatePresence } from 'framer-motion';
import { X, Trash2 } from 'lucide-react';
import Avatar from '../shared/Avatar';

export default function BoardMemberPanel({ open, onClose, members, allUsers, onAddMember, onRemoveMember }) {
  const available = allUsers.filter(u => !members.some(m => m.id === u.id));

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-40 bg-black/40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed top-0 right-0 z-50 h-full w-[300px] bg-tw-bg-raised border-l border-tw-border overflow-y-auto"
            initial={{ x: 300 }}
            animate={{ x: 0 }}
            exit={{ x: 300 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
          >
            <div className="p-5">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-base font-semibold text-tw-text-primary">Board Members</h3>
                <button onClick={onClose} className="text-tw-text-muted hover:text-tw-text-primary transition-colors">
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3 mb-6">
                {members.map(m => (
                  <div key={m.id} className="flex items-center gap-3 group">
                    <Avatar name={m.name} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-tw-text-primary truncate">{m.name}</p>
                      <p className="text-xs text-tw-text-muted truncate">{m.email}</p>
                    </div>
                    <button
                      onClick={() => onRemoveMember(m.id)}
                      className="text-xs text-tw-text-muted hover:text-tw-red opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>

              <div className="border-t border-tw-border pt-5">
                <p className="text-xs font-medium text-tw-text-muted uppercase tracking-wider mb-3">Add Member</p>
                {available.length === 0 ? (
                  <p className="text-xs text-tw-text-muted">No more users to add.</p>
                ) : (
                  <div className="space-y-2">
                    {available.map(u => (
                      <button
                        key={u.id}
                        onClick={() => onAddMember(u.id)}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-md hover:bg-tw-bg-hover text-left transition-colors"
                      >
                        <Avatar name={u.name} />
                        <div className="min-w-0">
                          <p className="text-sm text-tw-text-primary truncate">{u.name}</p>
                          <p className="text-xs text-tw-text-muted truncate">{u.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

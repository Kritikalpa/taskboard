import { useState, useEffect } from 'react';
import { getAllBoards, createBoard, deleteBoard } from '../api/boards';
import toast from 'react-hot-toast';
import BoardGrid from '../components/board/BoardGrid';
import BoardForm from '../components/board/BoardForm';
import ConfirmDialog from '../components/shared/ConfirmDialog';

export default function HomePage() {
  const [boards, setBoards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');

  const fetchBoards = async () => {
    try {
      const { data } = await getAllBoards();
      setBoards(data);
    } catch (_) {
      // error handled by interceptor
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBoards(); }, []);

  const handleCreate = async (form) => {
    try {
      await createBoard(form);
      toast.success('Board created');
      setShowForm(false);
      fetchBoards();
    } catch (_) {}
  };

  const handleDeleteClick = (id) => {
    const board = boards.find(b => b.id === id);
    setDeleteTargetId(id);
    setDeleteTargetName(board?.name || '');
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTargetId) return;
    try {
      await deleteBoard(deleteTargetId);
      toast.success('Board deleted');
      setDeleteTargetId(null);
      fetchBoards();
    } catch (_) {}
  };

  return (
    <div className="px-12 py-10">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-extrabold text-tw-text-primary">Your Boards</h1>
        <button onClick={() => setShowForm(true)} className="btn-primary">+ New Board</button>
      </div>

      <BoardGrid boards={boards} loading={loading} onDelete={handleDeleteClick} />

      <BoardForm
        open={showForm}
        onClose={() => setShowForm(false)}
        onSubmit={handleCreate}
      />

      <ConfirmDialog
        open={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        title="Delete Board"
        message={`Are you sure you want to delete "${deleteTargetName}"? This will remove all lists and cards.`}
        confirmLabel="Delete"
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

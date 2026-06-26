import { useState, useEffect } from 'react';
import Modal from '../shared/Modal';
import { getAllUsers, createUser } from '../../api/users';
import toast from 'react-hot-toast';

export default function UserForm({ open, onClose }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const { data } = await getAllUsers();
      setUsers(data);
    } catch (_) {}
  };

  useEffect(() => { if (open) fetchUsers(); }, [open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) return;
    try {
      await createUser({ name: name.trim(), email: email.trim() });
      toast.success('User created');
      setName('');
      setEmail('');
      fetchUsers();
    } catch (_) {}
  };

  return (
    <Modal open={open} onClose={onClose} title="Users" width="max-w-sm">
      <form onSubmit={handleSubmit} className="space-y-3 mb-5">
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="input-base"
          placeholder="Name"
          required
        />
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="input-base"
          placeholder="Email"
          required
        />
        <button type="submit" className="btn-primary w-full text-xs">Create User</button>
      </form>

      <div className="border-t border-tw-border pt-4 max-h-48 overflow-y-auto">
        {users.length === 0 ? (
          <p className="text-xs text-tw-text-muted text-center">No users yet</p>
        ) : (
          <div className="space-y-2">
            {users.map(u => (
              <div key={u.id} className="flex items-center gap-2 text-sm">
                <div className="w-6 h-6 rounded-full bg-tw-red flex items-center justify-center text-xs font-bold text-white shrink-0">
                  {u.name[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-tw-text-primary truncate text-xs">{u.name}</p>
                  <p className="text-tw-text-muted truncate text-xs">{u.email}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Modal>
  );
}

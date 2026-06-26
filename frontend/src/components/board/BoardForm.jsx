import { useState } from 'react';
import { motion } from 'framer-motion';
import Modal from '../shared/Modal';

const initial = { name: '', privacy: 'PUBLIC' };

export default function BoardForm({ open, onClose, onSubmit, initialData }) {
  const [form, setForm] = useState(initialData || initial);
  const isEdit = !!initialData;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const setPrivacy = (val) => setForm({ ...form, privacy: val });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name.trim()) return;
    onSubmit(form);
    if (!isEdit) setForm(initial);
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? 'Edit Board' : 'Create Board'}>
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-tw-text-secondary mb-1.5">Board Name</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            className="input-base"
            placeholder="Enter board name"
            required
            autoFocus
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-tw-text-secondary mb-1.5">Privacy</label>
          <div className="flex rounded-md border border-tw-border overflow-hidden">
            <button
              type="button"
              onClick={() => setPrivacy('PUBLIC')}
              className={`flex-1 py-2 text-sm font-medium transition-colors duration-200 ${
                form.privacy === 'PUBLIC'
                  ? 'bg-tw-red text-white'
                  : 'bg-tw-bg-deep text-tw-text-secondary'
              }`}
            >
              PUBLIC
            </button>
            <button
              type="button"
              onClick={() => setPrivacy('PRIVATE')}
              className={`flex-1 py-2 text-sm font-medium transition-colors duration-200 ${
                form.privacy === 'PRIVATE'
                  ? 'bg-tw-red text-white'
                  : 'bg-tw-bg-deep text-tw-text-secondary'
              }`}
            >
              PRIVATE
            </button>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">Cancel</button>
          <button type="submit" className="btn-primary flex-1">
            {isEdit ? 'Save Changes' : 'Create Board'}
          </button>
        </div>
      </form>
    </Modal>
  );
}

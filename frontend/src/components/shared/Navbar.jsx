import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import BoardForm from '../board/BoardForm';
import { createBoard } from '../../api/boards';
import { getAllUsers } from '../../api/users';
import UserForm from '../board/UserForm';
import toast from 'react-hot-toast';

export default function Navbar() {
  const [searchFocused, setSearchFocused] = useState(false);
  const [showBoardForm, setShowBoardForm] = useState(false);
  const [showUserForm, setShowUserForm] = useState(false);
  const searchRef = useRef(null);
  const navigate = useNavigate();

  const handleNewBoard = async (form) => {
    try {
      const { data } = await createBoard(form);
      toast.success('Board created');
      setShowBoardForm(false);
      navigate(`/boards/${data.id}`);
    } catch (_) {
      // error handled by interceptor
    }
  };

  return (
    <>
      <nav className="h-14 bg-tw-bg-surface border-b border-tw-border flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-6 h-6 bg-tw-red rounded-sm" />
            <span className="text-base font-bold text-tw-text-primary tracking-tight">TaskBoard</span>
          </Link>
        </div>

        <div className={`relative transition-all duration-300 ${searchFocused ? 'w-[400px]' : 'w-[200px]'}`}>
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-tw-text-muted pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            className="input-base pl-8"
            placeholder="Search boards…"
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowUserForm(true)}
            className="btn-primary text-xs"
          >
            + New User
          </button>
        </div>
      </nav>

      {showBoardForm && (
        <BoardForm
          open={showBoardForm}
          onClose={() => setShowBoardForm(false)}
          onSubmit={handleNewBoard}
        />
      )}

      <UserForm
        open={showUserForm}
        onClose={() => setShowUserForm(false)}
      />
    </>
  );
}

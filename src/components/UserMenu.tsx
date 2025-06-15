
import React from 'react';
import { Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';

interface UserMenuProps {
  session: Session | null;
  onLogout: () => void;
  loading: boolean;
}

const UserMenu: React.FC<UserMenuProps> = ({ session, onLogout, loading }) => {
  const navigate = useNavigate();

  return (
    <div className="absolute top-4 right-4 z-10">
      {session ? (
        <div className="flex items-center gap-4">
          <span className="text-gray-700 dark:text-gray-300 text-sm hidden sm:block font-medium">
            {session.user.email}
          </span>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-lg shadow-md hover:from-red-600 hover:to-orange-600 transition-all text-sm font-semibold"
            disabled={loading}
          >
            {loading ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      ) : (
        <button
          onClick={() => navigate('/auth')}
          className="px-4 py-2 bg-gradient-to-r from-green-500 to-blue-500 text-white rounded-lg shadow-md hover:from-green-600 hover:to-blue-600 transition-all text-sm font-semibold"
        >
          Login / Sign Up
        </button>
      )}
    </div>
  );
};

export default UserMenu;

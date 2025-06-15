
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { LogIn, LogOut, User as UserIcon } from 'lucide-react';

const AuthStatus = () => {
  const { user, signOut } = useAuth();

  return (
    <div className="absolute top-4 right-4 flex items-center gap-4 z-10">
      {user ? (
        <>
          <span className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-2">
            <UserIcon className="h-4 w-4" />
            {user.email}
          </span>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </>
      ) : (
        <Button asChild variant="ghost" size="sm">
          <Link to="/auth">
            <LogIn className="mr-2 h-4 w-4" />
            Login
          </Link>
        </Button>
      )}
    </div>
  );
};

export default AuthStatus;

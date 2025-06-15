
import React from 'react';
import { Session } from '@supabase/supabase-js';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User } from 'lucide-react';

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
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="rounded-full focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
              <Avatar className="h-9 w-9">
                <AvatarFallback>
                  <User className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">My Account</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {session.user.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onLogout} disabled={loading} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>{loading ? 'Logging out...' : 'Logout'}</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
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

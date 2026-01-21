import { Users, Wifi, WifiOff } from 'lucide-react';
import type { UserPresence } from '@/types/canvas';

interface UsersListProps {
  users: UserPresence[];
  currentUser: { name: string; color: string };
  isConnected: boolean;
}

export function UsersList({ users, currentUser, isConnected }: UsersListProps) {
  const allUsers = [
    { id: 'current', name: `${currentUser.name} (You)`, color: currentUser.color },
    ...users,
  ];

  return (
    <div className="fixed top-4 right-4 z-50 flex items-center gap-3 p-3 rounded-2xl bg-canvas-sidebar-bg shadow-2xl">
      {/* Connection Status */}
      <div className="flex items-center gap-2 pr-3 border-r border-canvas-sidebar-border">
        {isConnected ? (
          <Wifi className="w-4 h-4 text-green-400" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-400" />
        )}
        <span className="text-xs text-canvas-sidebar-fg font-medium">
          {isConnected ? 'Connected' : 'Connecting...'}
        </span>
      </div>

      {/* Users */}
      <div className="flex items-center gap-2">
        <Users className="w-4 h-4 text-canvas-sidebar-fg" />
        <div className="flex -space-x-2">
          {allUsers.slice(0, 5).map((user) => (
            <div
              key={user.id}
              className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-2 border-canvas-sidebar-bg"
              style={{ backgroundColor: user.color, color: '#FFFFFF' }}
              title={user.name}
            >
              {user.name.charAt(0).toUpperCase()}
            </div>
          ))}
          {allUsers.length > 5 && (
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold bg-canvas-sidebar-muted text-canvas-sidebar-fg border-2 border-canvas-sidebar-bg">
              +{allUsers.length - 5}
            </div>
          )}
        </div>
        <span className="text-sm text-canvas-sidebar-fg font-medium ml-1">
          {allUsers.length} online
        </span>
      </div>
    </div>
  );
}

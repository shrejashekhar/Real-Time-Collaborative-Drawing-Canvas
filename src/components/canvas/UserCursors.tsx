import { MousePointer2 } from 'lucide-react';
import type { UserPresence } from '@/types/canvas';

interface UserCursorsProps {
  users: UserPresence[];
  canvasRect: DOMRect | null;
  canvasWidth: number;
  canvasHeight: number;
}

export function UserCursors({ users, canvasRect, canvasWidth, canvasHeight }: UserCursorsProps) {
  if (!canvasRect) return null;

  const scaleX = canvasRect.width / canvasWidth;
  const scaleY = canvasRect.height / canvasHeight;

  return (
    <>
      {users.map(user => {
        if (!user.cursor) return null;

        const x = user.cursor.x * scaleX;
        const y = user.cursor.y * scaleY;

        return (
          <div
            key={user.id}
            className="user-cursor"
            style={{
              left: x,
              top: y,
              transform: 'translate(-2px, -2px)',
            }}
          >
            <MousePointer2
              className="w-5 h-5 drop-shadow-md"
              style={{ color: user.color, fill: user.color }}
            />
            <div
              className="absolute left-4 top-4 px-2 py-0.5 text-xs font-medium rounded-md whitespace-nowrap shadow-sm"
              style={{
                backgroundColor: user.color,
                color: '#FFFFFF',
              }}
            >
              {user.name}
              {user.isDrawing && (
                <span className="ml-1 opacity-75">✏️</span>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}

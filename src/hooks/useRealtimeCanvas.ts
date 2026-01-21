import { useEffect, useCallback, useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { DrawOperation, Point, UserPresence, USER_COLORS } from '@/types/canvas';

interface UseRealtimeCanvasProps {
  roomId: string;
  userId: string;
  userName: string;
  userColor: string;
  onRemoteOperation: (operation: DrawOperation) => void;
  onRemoteUndo: (operationId: string) => void;
  onRemoteRedo: (operationId: string) => void;
  onRemoteClear: () => void;
}

export function useRealtimeCanvas({
  roomId,
  userId,
  userName,
  userColor,
  onRemoteOperation,
  onRemoteUndo,
  onRemoteRedo,
  onRemoteClear,
}: UseRealtimeCanvasProps) {
  const [users, setUsers] = useState<Map<string, UserPresence>>(new Map());
  const [isConnected, setIsConnected] = useState(false);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);

  useEffect(() => {
    const channel = supabase.channel(`canvas:${roomId}`, {
      config: {
        presence: { key: userId },
        broadcast: { self: false },
      },
    });

    channelRef.current = channel;

    // Handle presence sync
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      const newUsers = new Map<string, UserPresence>();

      Object.entries(state).forEach(([key, presences]) => {
        const presence = (presences as any[])[0];
        if (presence && key !== userId) {
          newUsers.set(key, {
            id: key,
            name: presence.name || `User ${key.slice(0, 4)}`,
            color: presence.color || userColor,
            cursor: presence.cursor || null,
            isDrawing: presence.isDrawing || false,
          });
        }
      });

      setUsers(newUsers);
    });

    // Handle broadcast messages
    channel.on('broadcast', { event: 'draw' }, ({ payload }) => {
      if (payload.userId !== userId) {
        onRemoteOperation(payload.operation);
      }
    });

    channel.on('broadcast', { event: 'cursor' }, ({ payload }) => {
      if (payload.userId !== userId) {
        setUsers(prev => {
          const newUsers = new Map(prev);
          const user = newUsers.get(payload.userId);
          if (user) {
            newUsers.set(payload.userId, {
              ...user,
              cursor: payload.cursor,
              isDrawing: payload.isDrawing,
            });
          }
          return newUsers;
        });
      }
    });

    channel.on('broadcast', { event: 'undo' }, ({ payload }) => {
      if (payload.userId !== userId) {
        onRemoteUndo(payload.operationId);
      }
    });

    channel.on('broadcast', { event: 'redo' }, ({ payload }) => {
      if (payload.userId !== userId) {
        onRemoteRedo(payload.operationId);
      }
    });

    channel.on('broadcast', { event: 'clear' }, ({ payload }) => {
      if (payload.userId !== userId) {
        onRemoteClear();
      }
    });

    // Subscribe to channel
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        setIsConnected(true);
        await channel.track({
          name: userName,
          color: userColor,
          cursor: null,
          isDrawing: false,
        });
      }
    });

    return () => {
      channel.unsubscribe();
      channelRef.current = null;
    };
  }, [roomId, userId, userName, userColor, onRemoteOperation, onRemoteUndo, onRemoteRedo, onRemoteClear]);

  const broadcastOperation = useCallback((operation: DrawOperation) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'draw',
      payload: { userId, operation },
    });
  }, [userId]);

  const broadcastCursor = useCallback((cursor: Point, isDrawing: boolean) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'cursor',
      payload: { userId, cursor, isDrawing },
    });
  }, [userId]);

  const broadcastUndo = useCallback((operationId: string) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'undo',
      payload: { userId, operationId },
    });
  }, [userId]);

  const broadcastRedo = useCallback((operationId: string) => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'redo',
      payload: { userId, operationId },
    });
  }, [userId]);

  const broadcastClear = useCallback(() => {
    channelRef.current?.send({
      type: 'broadcast',
      event: 'clear',
      payload: { userId },
    });
  }, [userId]);

  return {
    users: Array.from(users.values()),
    isConnected,
    broadcastOperation,
    broadcastCursor,
    broadcastUndo,
    broadcastRedo,
    broadcastClear,
  };
}

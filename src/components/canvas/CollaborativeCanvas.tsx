import { useState, useCallback, useEffect, useRef } from 'react';
import { useCanvas } from '@/hooks/useCanvas';
import { useDrawingState } from '@/hooks/useDrawingState';
import { useRealtimeCanvas } from '@/hooks/useRealtimeCanvas';
import { CanvasRenderer } from './CanvasRenderer';
import { UserCursors } from './UserCursors';
import { Toolbar } from './Toolbar';
import { UsersList } from './UsersList';
import type { Tool, DrawOperation, Point, USER_COLORS } from '@/types/canvas';

const CANVAS_WIDTH = 1920;
const CANVAS_HEIGHT = 1080;

interface CollaborativeCanvasProps {
  roomId: string;
  userId: string;
  userName: string;
  userColor: string;
}

export function CollaborativeCanvas({ roomId, userId, userName, userColor }: CollaborativeCanvasProps) {
  const [tool, setTool] = useState<Tool>('brush');
  const [color, setColor] = useState('#000000');
  const [strokeWidth, setStrokeWidth] = useState(4);
  const [canvasRect, setCanvasRect] = useState<DOMRect | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const {
    operations,
    addOperation,
    updateOperation,
    undo,
    redo,
    applyRemoteOperation,
    applyRemoteUndo,
    applyRemoteRedo,
    clearCanvas,
    getVisibleOperations,
    getLastOperationId,
    getFirstUndoneOperationId,
    canUndo,
    canRedo,
  } = useDrawingState();

  const {
    users,
    isConnected,
    broadcastOperation,
    broadcastCursor,
    broadcastUndo,
    broadcastRedo,
    broadcastClear,
  } = useRealtimeCanvas({
    roomId,
    userId,
    userName,
    userColor,
    onRemoteOperation: applyRemoteOperation,
    onRemoteUndo: applyRemoteUndo,
    onRemoteRedo: applyRemoteRedo,
    onRemoteClear: clearCanvas,
  });

  const handleDrawStart = useCallback((operation: DrawOperation) => {
    addOperation(operation);
    broadcastOperation(operation);
    broadcastCursor(operation.points[0], true);
  }, [addOperation, broadcastOperation, broadcastCursor]);

  const handleDrawUpdate = useCallback((operationId: string, point: Point) => {
    updateOperation(operationId, point);
    
    // Find the updated operation and broadcast it
    const op = operations.find(o => o.id === operationId);
    if (op) {
      broadcastOperation({ ...op, points: [...op.points, point] });
    }
  }, [updateOperation, operations, broadcastOperation]);

  const handleDrawEnd = useCallback((operationId: string) => {
    broadcastCursor({ x: 0, y: 0 }, false);
  }, [broadcastCursor]);

  const handleCursorMove = useCallback((point: Point) => {
    broadcastCursor(point, false);
  }, [broadcastCursor]);

  const handleUndo = useCallback(() => {
    const lastOpId = getLastOperationId();
    if (lastOpId) {
      undo();
      broadcastUndo(lastOpId);
    }
  }, [undo, getLastOperationId, broadcastUndo]);

  const handleRedo = useCallback(() => {
    const firstUndoneId = getFirstUndoneOperationId();
    if (firstUndoneId) {
      redo();
      broadcastRedo(firstUndoneId);
    }
  }, [redo, getFirstUndoneOperationId, broadcastRedo]);

  const handleClear = useCallback(() => {
    clearCanvas();
    broadcastClear();
  }, [clearCanvas, broadcastClear]);

  const { canvasRef } = useCanvas({
    onDrawStart: handleDrawStart,
    onDrawUpdate: handleDrawUpdate,
    onDrawEnd: handleDrawEnd,
    onCursorMove: handleCursorMove,
    tool,
    color,
    strokeWidth,
    userId,
  });

  // Update canvas rect on resize
  useEffect(() => {
    const updateRect = () => {
      if (canvasRef.current) {
        setCanvasRect(canvasRef.current.getBoundingClientRect());
      }
    };

    updateRect();
    window.addEventListener('resize', updateRect);
    return () => window.removeEventListener('resize', updateRect);
  }, [canvasRef]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'b' || e.key === 'B') {
        setTool('brush');
      } else if (e.key === 'e' || e.key === 'E') {
        setTool('eraser');
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'z' && e.shiftKey) {
        e.preventDefault();
        handleRedo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        e.preventDefault();
        handleRedo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleUndo, handleRedo]);

  const visibleOperations = getVisibleOperations();

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-screen overflow-hidden bg-muted"
    >
      {/* Toolbar */}
      <Toolbar
        tool={tool}
        color={color}
        strokeWidth={strokeWidth}
        canUndo={canUndo}
        canRedo={canRedo}
        onToolChange={setTool}
        onColorChange={setColor}
        onStrokeWidthChange={setStrokeWidth}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onClear={handleClear}
      />

      {/* Users List */}
      <UsersList
        users={users}
        currentUser={{ name: userName, color: userColor }}
        isConnected={isConnected}
      />

      {/* Canvas Container */}
      <div className="absolute inset-0 flex items-center justify-center p-20 pl-24">
        <div className="relative w-full h-full max-w-[1920px] max-h-[1080px] shadow-2xl rounded-lg overflow-hidden">
          <canvas
            ref={canvasRef}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
            className={`w-full h-full bg-white ${tool === 'brush' ? 'canvas-cursor-brush' : 'canvas-cursor-eraser'}`}
            style={{ touchAction: 'none' }}
          />
          
          {/* Canvas Renderer (handles drawing) */}
          <CanvasRenderer
            canvasRef={canvasRef}
            operations={visibleOperations}
            width={CANVAS_WIDTH}
            height={CANVAS_HEIGHT}
          />

          {/* User Cursors */}
          <UserCursors
            users={users}
            canvasRect={canvasRect}
            canvasWidth={CANVAS_WIDTH}
            canvasHeight={CANVAS_HEIGHT}
          />
        </div>
      </div>
    </div>
  );
}

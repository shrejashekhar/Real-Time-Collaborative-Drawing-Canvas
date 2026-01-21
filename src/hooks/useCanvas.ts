import { useRef, useCallback, useEffect, useState } from 'react';
import type { Point, DrawOperation, Tool } from '@/types/canvas';

interface UseCanvasProps {
  onDrawStart: (operation: DrawOperation) => void;
  onDrawUpdate: (operationId: string, point: Point) => void;
  onDrawEnd: (operationId: string) => void;
  onCursorMove: (point: Point) => void;
  tool: Tool;
  color: string;
  strokeWidth: number;
  userId: string;
}

export function useCanvas({
  onDrawStart,
  onDrawUpdate,
  onDrawEnd,
  onCursorMove,
  tool,
  color,
  strokeWidth,
  userId,
}: UseCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const currentOperationId = useRef<string | null>(null);
  const lastPoint = useRef<Point | null>(null);

  const getPoint = useCallback((e: MouseEvent | TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;

    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    if ('touches' in e) {
      const touch = e.touches[0];
      if (!touch) return null;
      return {
        x: (touch.clientX - rect.left) * scaleX,
        y: (touch.clientY - rect.top) * scaleY,
      };
    }

    return {
      x: (e.clientX - rect.left) * scaleX,
      y: (e.clientY - rect.top) * scaleY,
    };
  }, []);

  const startDrawing = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const point = getPoint(e);
      if (!point) return;

      isDrawing.current = true;
      const operationId = `${userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      currentOperationId.current = operationId;
      lastPoint.current = point;

      const operation: DrawOperation = {
        id: operationId,
        userId,
        tool,
        color: tool === 'eraser' ? '#FFFFFF' : color,
        strokeWidth: tool === 'eraser' ? strokeWidth * 2 : strokeWidth,
        points: [point],
        timestamp: Date.now(),
      };

      onDrawStart(operation);
    },
    [getPoint, userId, tool, color, strokeWidth, onDrawStart]
  );

  const draw = useCallback(
    (e: MouseEvent | TouchEvent) => {
      const point = getPoint(e);
      if (!point) return;

      // Always send cursor position
      onCursorMove(point);

      if (!isDrawing.current || !currentOperationId.current) return;

      // Smooth interpolation for fast movements
      if (lastPoint.current) {
        const dx = point.x - lastPoint.current.x;
        const dy = point.y - lastPoint.current.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        // Only add point if it's far enough from the last point
        if (distance > 2) {
          onDrawUpdate(currentOperationId.current, point);
          lastPoint.current = point;
        }
      }
    },
    [getPoint, onDrawUpdate, onCursorMove]
  );

  const stopDrawing = useCallback(() => {
    if (isDrawing.current && currentOperationId.current) {
      onDrawEnd(currentOperationId.current);
    }
    isDrawing.current = false;
    currentOperationId.current = null;
    lastPoint.current = null;
  }, [onDrawEnd]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleMouseDown = (e: MouseEvent) => {
      e.preventDefault();
      startDrawing(e);
    };

    const handleMouseMove = (e: MouseEvent) => {
      draw(e);
    };

    const handleMouseUp = () => {
      stopDrawing();
    };

    const handleMouseLeave = () => {
      stopDrawing();
    };

    const handleTouchStart = (e: TouchEvent) => {
      e.preventDefault();
      startDrawing(e);
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      draw(e);
    };

    const handleTouchEnd = () => {
      stopDrawing();
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mouseleave', handleMouseLeave);
    canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
    canvas.addEventListener('touchend', handleTouchEnd);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('mouseleave', handleMouseLeave);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [startDrawing, draw, stopDrawing]);

  return { canvasRef };
}

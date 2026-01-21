import { useEffect, useRef, useCallback } from 'react';
import type { DrawOperation, Point } from '@/types/canvas';

interface CanvasRendererProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  operations: DrawOperation[];
  width: number;
  height: number;
}

export function CanvasRenderer({ canvasRef, operations, width, height }: CanvasRendererProps) {
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);

  const drawPath = useCallback((ctx: CanvasRenderingContext2D, operation: DrawOperation) => {
    if (operation.points.length < 2) {
      // Draw a dot for single point
      const point = operation.points[0];
      ctx.fillStyle = operation.color;
      ctx.beginPath();
      ctx.arc(point.x, point.y, operation.strokeWidth / 2, 0, Math.PI * 2);
      ctx.fill();
      return;
    }

    ctx.strokeStyle = operation.color;
    ctx.lineWidth = operation.strokeWidth;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (operation.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
    } else {
      ctx.globalCompositeOperation = 'source-over';
    }

    ctx.beginPath();
    ctx.moveTo(operation.points[0].x, operation.points[0].y);

    // Use quadratic curves for smoother lines
    for (let i = 1; i < operation.points.length - 1; i++) {
      const current = operation.points[i];
      const next = operation.points[i + 1];
      const midX = (current.x + next.x) / 2;
      const midY = (current.y + next.y) / 2;
      ctx.quadraticCurveTo(current.x, current.y, midX, midY);
    }

    // Draw to the last point
    const lastPoint = operation.points[operation.points.length - 1];
    ctx.lineTo(lastPoint.x, lastPoint.y);
    ctx.stroke();

    ctx.globalCompositeOperation = 'source-over';
  }, []);

  const renderCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas with white background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);

    // Draw all operations
    operations.forEach(operation => {
      drawPath(ctx, operation);
    });
  }, [canvasRef, operations, width, height, drawPath]);

  useEffect(() => {
    renderCanvas();
  }, [renderCanvas]);

  return null;
}

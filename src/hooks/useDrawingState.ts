import { useState, useCallback, useRef } from 'react';
import type { DrawOperation, Point, CanvasState } from '@/types/canvas';

export function useDrawingState() {
  const [operations, setOperations] = useState<DrawOperation[]>([]);
  const [undoneOperations, setUndoneOperations] = useState<Set<string>>(new Set());
  const operationsRef = useRef<Map<string, DrawOperation>>(new Map());

  const addOperation = useCallback((operation: DrawOperation) => {
    operationsRef.current.set(operation.id, operation);
    setOperations(prev => [...prev, operation]);
    // Clear redo stack when new operation is added
    setUndoneOperations(new Set());
  }, []);

  const updateOperation = useCallback((operationId: string, point: Point) => {
    const operation = operationsRef.current.get(operationId);
    if (operation) {
      operation.points.push(point);
      setOperations(prev => 
        prev.map(op => op.id === operationId ? { ...operation } : op)
      );
    }
  }, []);

  const undo = useCallback(() => {
    setOperations(prev => {
      // Find the last visible operation (not undone)
      const visibleOps = prev.filter(op => !undoneOperations.has(op.id));
      if (visibleOps.length === 0) return prev;

      const lastOp = visibleOps[visibleOps.length - 1];
      setUndoneOperations(prevUndone => new Set([...prevUndone, lastOp.id]));
      return prev;
    });
  }, [undoneOperations]);

  const redo = useCallback(() => {
    setUndoneOperations(prev => {
      if (prev.size === 0) return prev;
      
      // Find the earliest undone operation
      const undoneIds = Array.from(prev);
      const undoneOps = operations.filter(op => prev.has(op.id));
      if (undoneOps.length === 0) return prev;

      const earliestUndone = undoneOps.sort((a, b) => a.timestamp - b.timestamp)[0];
      const newSet = new Set(prev);
      newSet.delete(earliestUndone.id);
      return newSet;
    });
  }, [operations]);

  const applyRemoteOperation = useCallback((operation: DrawOperation) => {
    if (!operationsRef.current.has(operation.id)) {
      operationsRef.current.set(operation.id, operation);
      setOperations(prev => [...prev, operation].sort((a, b) => a.timestamp - b.timestamp));
    } else {
      // Update existing operation with new points
      const existing = operationsRef.current.get(operation.id)!;
      existing.points = operation.points;
      setOperations(prev => 
        prev.map(op => op.id === operation.id ? { ...existing } : op)
      );
    }
  }, []);

  const applyRemoteUndo = useCallback((operationId: string) => {
    setUndoneOperations(prev => new Set([...prev, operationId]));
  }, []);

  const applyRemoteRedo = useCallback((operationId: string) => {
    setUndoneOperations(prev => {
      const newSet = new Set(prev);
      newSet.delete(operationId);
      return newSet;
    });
  }, []);

  const clearCanvas = useCallback(() => {
    operationsRef.current.clear();
    setOperations([]);
    setUndoneOperations(new Set());
  }, []);

  const getVisibleOperations = useCallback(() => {
    return operations.filter(op => !undoneOperations.has(op.id));
  }, [operations, undoneOperations]);

  const getLastOperationId = useCallback(() => {
    const visibleOps = operations.filter(op => !undoneOperations.has(op.id));
    return visibleOps.length > 0 ? visibleOps[visibleOps.length - 1].id : null;
  }, [operations, undoneOperations]);

  const getFirstUndoneOperationId = useCallback(() => {
    const undoneOps = operations
      .filter(op => undoneOperations.has(op.id))
      .sort((a, b) => a.timestamp - b.timestamp);
    return undoneOps.length > 0 ? undoneOps[0].id : null;
  }, [operations, undoneOperations]);

  return {
    operations,
    undoneOperations,
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
    canUndo: operations.filter(op => !undoneOperations.has(op.id)).length > 0,
    canRedo: undoneOperations.size > 0,
  };
}

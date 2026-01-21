export type Tool = 'brush' | 'eraser';

export interface Point {
  x: number;
  y: number;
}

export interface DrawOperation {
  id: string;
  userId: string;
  tool: Tool;
  color: string;
  strokeWidth: number;
  points: Point[];
  timestamp: number;
}

export interface UserPresence {
  id: string;
  name: string;
  color: string;
  cursor: Point | null;
  isDrawing: boolean;
}

export interface CanvasState {
  operations: DrawOperation[];
  undoStack: string[]; // operation IDs that have been undone
}

export interface BroadcastPayload {
  type: 'draw' | 'cursor' | 'undo' | 'redo' | 'clear';
  data: DrawOperation | Point | string | null;
  userId: string;
  timestamp: number;
}

export const USER_COLORS = [
  'hsl(220, 90%, 56%)',  // Blue
  'hsl(340, 82%, 52%)',  // Pink
  'hsl(142, 71%, 45%)',  // Green
  'hsl(38, 92%, 50%)',   // Orange
  'hsl(262, 83%, 58%)',  // Purple
  'hsl(199, 89%, 48%)',  // Cyan
];

export const BRUSH_COLORS = [
  '#000000', // Black
  '#FFFFFF', // White
  '#EF4444', // Red
  '#F97316', // Orange
  '#EAB308', // Yellow
  '#22C55E', // Green
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#EC4899', // Pink
];

export const STROKE_WIDTHS = [2, 4, 8, 12, 20];

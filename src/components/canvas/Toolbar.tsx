import { 
  Paintbrush, 
  Eraser, 
  Undo2, 
  Redo2, 
  Trash2,
  Minus,
  Plus,
} from 'lucide-react';
import type { Tool } from '@/types/canvas';
import { BRUSH_COLORS, STROKE_WIDTHS } from '@/types/canvas';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Slider } from '@/components/ui/slider';

interface ToolbarProps {
  tool: Tool;
  color: string;
  strokeWidth: number;
  canUndo: boolean;
  canRedo: boolean;
  onToolChange: (tool: Tool) => void;
  onColorChange: (color: string) => void;
  onStrokeWidthChange: (width: number) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
}

export function Toolbar({
  tool,
  color,
  strokeWidth,
  canUndo,
  canRedo,
  onToolChange,
  onColorChange,
  onStrokeWidthChange,
  onUndo,
  onRedo,
  onClear,
}: ToolbarProps) {
  return (
    <div className="fixed left-4 top-1/2 -translate-y-1/2 z-50 flex flex-col gap-2 p-3 rounded-2xl bg-canvas-sidebar-bg shadow-2xl">
      {/* Drawing Tools */}
      <div className="flex flex-col gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onToolChange('brush')}
              className={`tool-btn ${tool === 'brush' ? 'tool-btn-active' : ''}`}
            >
              <Paintbrush className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Brush (B)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={() => onToolChange('eraser')}
              className={`tool-btn ${tool === 'eraser' ? 'tool-btn-active' : ''}`}
            >
              <Eraser className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Eraser (E)</TooltipContent>
        </Tooltip>
      </div>

      {/* Separator */}
      <div className="h-px bg-canvas-sidebar-border my-1" />

      {/* Color Palette */}
      <div className="flex flex-col gap-2 py-2">
        <div className="grid grid-cols-3 gap-1.5">
          {BRUSH_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => onColorChange(c)}
              className={`color-swatch ${color === c ? 'color-swatch-active' : ''}`}
              style={{ backgroundColor: c }}
              title={c}
            />
          ))}
        </div>
      </div>

      {/* Separator */}
      <div className="h-px bg-canvas-sidebar-border my-1" />

      {/* Stroke Width */}
      <div className="flex flex-col gap-2 py-2 px-1">
        <div className="flex items-center justify-between text-canvas-sidebar-fg text-xs">
          <Minus className="w-3 h-3" />
          <span className="font-mono">{strokeWidth}px</span>
          <Plus className="w-3 h-3" />
        </div>
        <Slider
          value={[strokeWidth]}
          onValueChange={([value]) => onStrokeWidthChange(value)}
          min={1}
          max={40}
          step={1}
          className="w-full"
        />
      </div>

      {/* Separator */}
      <div className="h-px bg-canvas-sidebar-border my-1" />

      {/* Actions */}
      <div className="flex flex-col gap-1">
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className={`tool-btn ${!canUndo ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <Undo2 className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Undo (Ctrl+Z)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className={`tool-btn ${!canRedo ? 'opacity-40 cursor-not-allowed' : ''}`}
            >
              <Redo2 className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Redo (Ctrl+Shift+Z)</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <button
              onClick={onClear}
              className="tool-btn hover:text-destructive"
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="right">Clear Canvas</TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';

interface DraggablePanelProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  defaultWidth?: number;
  defaultHeight?: number;
  defaultX?: number;
  defaultY?: number;
}

export default function DraggablePanel({
  title,
  children,
  onClose,
  defaultWidth = 400,
  defaultHeight = 300,
  defaultX = 0,
  defaultY = 0,
}: DraggablePanelProps) {
  const [position, setPosition] = useState({ x: defaultX, y: defaultY });
  const [size, setSize] = useState({ width: defaultWidth, height: defaultHeight });
  const [isMaximized, setIsMaximized] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  // 处理拖拽
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMaximized) return;
    if ((e.target as HTMLElement).closest('[data-no-drag]')) return;

    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // 处理调整大小
  const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMaximized) return;
    e.preventDefault();
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    });
  };

  // 处理鼠标移动
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isMaximized) {
        setPosition({
          x: e.clientX - dragStart.x,
          y: e.clientY - dragStart.y,
        });
      }

      if (isResizing && !isMaximized) {
        const deltaX = e.clientX - resizeStart.x;
        const deltaY = e.clientY - resizeStart.y;

        setSize({
          width: Math.max(300, resizeStart.width + deltaX),
          height: Math.max(200, resizeStart.height + deltaY),
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      setIsResizing(false);
    };

    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart]);

  // 最大化/还原
  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  if (isMaximized) {
    return (
      <div className="fixed inset-0 bg-card/90 backdrop-blur-sm border border-border rounded-none flex flex-col shadow-2xl z-50">
        {/* 标题栏 */}
        <div
          className="bg-card border-b border-border px-4 py-3 flex items-center justify-between cursor-move"
          onMouseDown={handleMouseDown}
          data-no-drag="false"
        >
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <div className="flex items-center gap-2" data-no-drag="true">
            <button
              onClick={toggleMaximize}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              title="还原"
            >
              ⊟
            </button>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
              title="关闭"
            >
              ✕
            </button>
          </div>
        </div>

        {/* 内容 */}
        <div className="flex-1 overflow-auto px-4 py-4">
          {children}
        </div>
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      className="fixed bg-card/90 backdrop-blur-sm border border-border rounded-lg shadow-2xl flex flex-col z-50"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
      }}
    >
      {/* 标题栏 */}
      <div
        className="bg-card border-b border-border px-4 py-3 flex items-center justify-between cursor-move flex-shrink-0"
        onMouseDown={handleMouseDown}
        data-no-drag="false"
      >
        <h3 className="text-base font-semibold text-foreground truncate">{title}</h3>
        <div className="flex items-center gap-2 flex-shrink-0" data-no-drag="true">
          <button
            onClick={toggleMaximize}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            title="最大化"
          >
            ⊞
          </button>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1"
            title="关闭"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 内容 */}
      <div className="flex-1 overflow-auto px-4 py-4 text-sm">
        {children}
      </div>

      {/* 调整大小把手 */}
      <div
        className="absolute bottom-0 right-0 w-4 h-4 bg-primary/50 hover:bg-primary cursor-se-resize rounded-tl"
        onMouseDown={handleResizeMouseDown}
        title="拖拽调整大小"
      />
    </div>
  );
}

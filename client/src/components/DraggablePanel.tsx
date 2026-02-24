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
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  // 处理标题栏鼠标按下 - 拖拽
  const handleHeaderMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMaximized) return;
    
    // 检查是否点击了按钮
    if ((e.target as HTMLElement).closest('button')) return;

    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  // 处理调整大小 - 右下角把手
  const handleResizeMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMaximized) return;
    e.preventDefault();
    e.stopPropagation();
    
    setIsResizing(true);
    setResizeStart({
      x: e.clientX,
      y: e.clientY,
      width: size.width,
      height: size.height,
    });
  };

  // 全局鼠标移动和释放事件
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && !isMaximized) {
        setPosition({
          x: e.clientX - dragOffset.x,
          y: e.clientY - dragOffset.y,
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
  }, [isDragging, isResizing, dragOffset, resizeStart]);

  // 最大化/还原
  const toggleMaximize = () => {
    setIsMaximized(!isMaximized);
  };

  if (isMaximized) {
    return (
      <div className="fixed inset-0 bg-card/95 backdrop-blur-sm border border-border flex flex-col shadow-2xl" style={{ zIndex: 9999 }}>
        {/* 标题栏 */}
        <div
          ref={headerRef}
          className="bg-card border-b border-border px-4 py-3 flex items-center justify-between cursor-move"
          onMouseDown={handleHeaderMouseDown}
        >
          <h3 className="text-base font-semibold text-foreground">{title}</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleMaximize}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-secondary rounded"
              title="还原"
            >
              ⊟
            </button>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-secondary rounded"
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
      </div>
    );
  }

  return (
    <div
      ref={panelRef}
      className="fixed bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-2xl flex flex-col"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        width: `${size.width}px`,
        height: `${size.height}px`,
        userSelect: isDragging ? 'none' : 'auto',
        zIndex: 9999,
      }}
    >
      {/* 标题栏 - 可拖拽 */}
      <div
        ref={headerRef}
        className="bg-card border-b border-border px-4 py-3 flex items-center justify-between cursor-move flex-shrink-0 hover:bg-card/80 transition-colors"
        onMouseDown={handleHeaderMouseDown}
      >
        <h3 className="text-base font-semibold text-foreground truncate">{title}</h3>
        <div className="flex items-center gap-1 flex-shrink-0">
          <button
            onClick={toggleMaximize}
            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 hover:bg-secondary rounded"
            title="最大化"
          >
            ⊞
          </button>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-colors p-1.5 hover:bg-secondary rounded"
            title="关闭"
          >
            ✕
          </button>
        </div>
      </div>

      {/* 内容 - 可滚动 */}
      <div className="flex-1 overflow-auto px-4 py-4 text-sm">
        {children}
      </div>

      {/* 调整大小把手 - 右下角 */}
      <div
        className="absolute bottom-0 right-0 w-5 h-5 bg-gradient-to-tl from-primary/60 to-primary/20 hover:from-primary hover:to-primary/40 cursor-se-resize rounded-tl transition-colors"
        onMouseDown={handleResizeMouseDown}
        title="拖拽调整大小"
        style={{
          backgroundImage: 'linear-gradient(135deg, rgba(217, 119, 6, 0.6) 0%, rgba(217, 119, 6, 0.2) 100%)',
        }}
      />
    </div>
  );
}

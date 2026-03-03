import { useEffect, useRef } from 'react';
import type { Node } from '../../../types/network';
import { NodeRenderer } from '../renderers/NodeRenderer';

interface InteractionHandlers {
  onPan: (pan: { x: number; y: number }) => void;
  onZoom: (scale: number) => void;
  onNodeClick: (nodeId: string | null) => void;
  onNodeHover: (nodeId: string | null) => void;
  onNodeDragStart: (nodeId: string, position: { x: number; y: number }) => void;
  onNodeDragEnd: () => void;
}

export function useCanvasInteraction(
  canvasRef: React.RefObject<HTMLCanvasElement>,
  nodes: Node[],
  handlers: InteractionHandlers,
  scale: number,
  pan: { x: number; y: number }
) {
  const panStartRef = useRef<{ x: number; y: number } | null>(null);
  const currentPanRef = useRef(pan);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // 鼠标按下
    const handleMouseDown = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;

      // 转换为世界坐标
      const worldX = (canvasX - rect.width / 2) / scale - pan.x;
      const worldY = (canvasY - rect.height / 2) / scale - pan.y;

      // 检查是否点击了节点
      const clickedNode = NodeRenderer.getNodeAtPosition(nodes, worldX, worldY, 20);

      if (clickedNode) {
        handlers.onNodeClick(clickedNode.id);
        handlers.onNodeDragStart(clickedNode.id, { x: canvasX, y: canvasY });
      } else {
        handlers.onNodeClick(null);
        panStartRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    // 鼠标移动
    const handleMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const canvasX = e.clientX - rect.left;
      const canvasY = e.clientY - rect.top;

      // 转换为世界坐标
      const worldX = (canvasX - rect.width / 2) / scale - pan.x;
      const worldY = (canvasY - rect.height / 2) / scale - pan.y;

      // 检查悬停的节点
      const hoveredNode = NodeRenderer.getNodeAtPosition(nodes, worldX, worldY, 20);
      handlers.onNodeHover(hoveredNode?.id || null);

      // 处理平移
      if (panStartRef.current) {
        const dx = (e.clientX - panStartRef.current.x) / scale;
        const dy = (e.clientY - panStartRef.current.y) / scale;
        currentPanRef.current = {
          x: currentPanRef.current.x + dx / 100,
          y: currentPanRef.current.y + dy / 100,
        };
        handlers.onPan(currentPanRef.current);
        panStartRef.current = { x: e.clientX, y: e.clientY };
      }
    };

    // 鼠标抬起
    const handleMouseUp = () => {
      panStartRef.current = null;
      handlers.onNodeDragEnd();
    };

    // 滚轮缩放
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      const newScale = Math.min(Math.max(scale * delta, 0.1), 5);
      handlers.onZoom(newScale);
    };

    // 触摸事件处理
    let touchStartDistance = 0;
    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // 双指缩放
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        touchStartDistance = Math.sqrt(dx * dx + dy * dy);
      } else if (e.touches.length === 1) {
        // 单指拖拽
        panStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStartDistance > 0) {
        // 双指缩放
        const dx = e.touches[0].clientX - e.touches[1].clientX;
        const dy = e.touches[0].clientY - e.touches[1].clientY;
        const currentDistance = Math.sqrt(dx * dx + dy * dy);
        const delta = currentDistance / touchStartDistance;
        const newScale = Math.min(Math.max(scale * delta, 0.1), 5);
        handlers.onZoom(newScale);
        touchStartDistance = currentDistance;
      } else if (e.touches.length === 1 && panStartRef.current) {
        // 单指拖拽
        const dx = (e.touches[0].clientX - panStartRef.current.x) / scale;
        const dy = (e.touches[0].clientY - panStartRef.current.y) / scale;
        currentPanRef.current = {
          x: currentPanRef.current.x + dx / 100,
          y: currentPanRef.current.y + dy / 100,
        };
        handlers.onPan(currentPanRef.current);
        panStartRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    const handleTouchEnd = () => {
      panStartRef.current = null;
      touchStartDistance = 0;
      handlers.onNodeDragEnd();
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });
    canvas.addEventListener('touchstart', handleTouchStart, { passive: true });
    canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
    canvas.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
      canvas.removeEventListener('touchstart', handleTouchStart);
      canvas.removeEventListener('touchmove', handleTouchMove);
      canvas.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handlers, nodes, scale, pan]);
}

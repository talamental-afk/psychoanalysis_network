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
        handlers.onNodeDragStart(clickedNode.id, { x: canvasX, y: canvasY });
      } else {
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

    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      canvas.removeEventListener('mousemove', handleMouseMove);
      canvas.removeEventListener('mouseup', handleMouseUp);
      canvas.removeEventListener('wheel', handleWheel);
    };
  }, [handlers, nodes, scale, pan]);
}

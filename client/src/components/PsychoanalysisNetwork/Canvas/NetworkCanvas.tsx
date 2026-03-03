import { useRef, useEffect, useCallback } from 'react';
import { useNetworkStore } from '../../../store/networkStore';
import { useLearningStore } from '../../../store/learningStore';
import { conceptNodes } from '../../../psychoanalysis_data';
import { NodeRenderer } from '../renderers/NodeRenderer';
import { LinkRenderer } from '../renderers/LinkRenderer';
import { LabelRenderer } from '../renderers/LabelRenderer';
import { useCanvasInteraction } from '../hooks/useCanvasInteraction';

export default function NetworkCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const {
    scale,
    pan,
    selectedNode,
    hoveredNode,
    highlightedNodes,
    setCanvasSize,
    setPan,
    setScale,
    selectNode,
    hoverNode,
    startDragging,
    stopDragging,
  } = useNetworkStore();

  const { completedNodes } = useLearningStore();

  // 处理画布交互
  useCanvasInteraction(canvasRef, conceptNodes, {
    onPan: setPan,
    onZoom: setScale,
    onNodeClick: selectNode,
    onNodeHover: hoverNode,
    onNodeDragStart: startDragging,
    onNodeDragEnd: stopDragging,
  }, scale, pan);

  // 渲染循环
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置画布大小
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    setCanvasSize({ width: canvas.width, height: canvas.height });

    // 清空画布
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 保存上下文状态
    ctx.save();

    // 应用缩放和平移
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(scale, scale);
    ctx.translate(pan.x, pan.y);

    // 渲染连线
    LinkRenderer.render(ctx, conceptNodes, {
      scale,
      selectedNode,
      highlightedNodes,
    });

    // 渲染节点
    NodeRenderer.render(ctx, conceptNodes, {
      scale,
      selectedNode,
      hoveredNode,
      highlightedNodes,
      completedNodes,
    });

    // 渲染标签
    LabelRenderer.render(ctx, conceptNodes, {
      scale,
      selectedNode,
      hoveredNode,
    });

    ctx.restore();
  }, [scale, pan, selectedNode, hoveredNode, highlightedNodes, completedNodes, setCanvasSize]);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full cursor-grab active:cursor-grabbing"
      style={{ display: 'block' }}
    />
  );
}

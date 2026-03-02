import type { Node } from '../../../types/network';

interface RenderOptions {
  scale: number;
  selectedNode: string | null;
  hoveredNode: string | null;
  highlightedNodes: string[];
  completedNodes: string[];
}

export class NodeRenderer {
  private static readonly NODE_RADIUS = 15;
  private static readonly SELECTED_RADIUS = 20;
  private static readonly HOVERED_RADIUS = 18;

  static render(
    ctx: CanvasRenderingContext2D,
    nodes: Node[],
    options: RenderOptions
  ) {
    nodes.forEach((node) => {
      this.renderNode(ctx, node, options);
    });
  }

  private static renderNode(
    ctx: CanvasRenderingContext2D,
    node: Node,
    options: RenderOptions
  ) {
    const { selectedNode, hoveredNode, highlightedNodes, completedNodes } = options;
    const isSelected = node.id === selectedNode;
    const isHovered = node.id === hoveredNode;
    const isHighlighted = highlightedNodes.includes(node.id);
    const isCompleted = completedNodes.includes(node.id);

    // 确定节点半径
    let radius = this.NODE_RADIUS;
    if (isSelected) radius = this.SELECTED_RADIUS;
    else if (isHovered) radius = this.HOVERED_RADIUS;

    // 绘制节点背景
    ctx.beginPath();
    ctx.arc(node.x, node.y, radius, 0, Math.PI * 2);
    ctx.fillStyle = node.color;
    ctx.fill();

    // 绘制选中/高亮效果
    if (isSelected || isHighlighted) {
      ctx.strokeStyle = '#FFD700';
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    // 绘制完成标记
    if (isCompleted) {
      ctx.fillStyle = '#00FF00';
      ctx.font = 'bold 12px Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('✓', node.x, node.y);
    }

    // 绘制循环论证标记
    if (node.hasCircularLogic) {
      ctx.strokeStyle = '#FF0000';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(node.x, node.y, radius + 3, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  static getNodeAtPosition(
    nodes: Node[],
    x: number,
    y: number,
    radius: number = 20
  ): Node | null {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const node = nodes[i];
      const dx = node.x - x;
      const dy = node.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance <= radius) {
        return node;
      }
    }
    return null;
  }
}

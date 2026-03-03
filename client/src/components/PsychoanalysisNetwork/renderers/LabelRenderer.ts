import type { Node } from '../../../types/network';

interface RenderOptions {
  scale: number;
  selectedNode: string | null;
  hoveredNode: string | null;
}

export class LabelRenderer {
  static render(
    ctx: CanvasRenderingContext2D,
    nodes: Node[],
    options: RenderOptions
  ) {
    const { selectedNode, hoveredNode } = options;

    nodes.forEach((node) => {
      const isSelected = node.id === selectedNode;
      const isHovered = node.id === hoveredNode;

      if (isSelected || isHovered) {
        this.renderLabel(ctx, node, isSelected);
      }
    });
  }

  private static renderLabel(
    ctx: CanvasRenderingContext2D,
    node: Node,
    isSelected: boolean
  ) {
    const fontSize = isSelected ? 14 : 12;
    ctx.font = `${fontSize}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // 背景
    const text = node.name;
    const metrics = ctx.measureText(text);
    const width = metrics.width + 10;
    const height = fontSize + 6;

    ctx.fillStyle = 'rgba(30, 41, 59, 0.9)';
    ctx.fillRect(node.x - width / 2, node.y + 25, width, height);

    // 文字
    ctx.fillStyle = '#F0F9FF';
    ctx.fillText(text, node.x, node.y + 28);
  }
}

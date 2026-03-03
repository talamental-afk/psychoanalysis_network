import type { Node } from '../../../types/network';
import { conceptLinks } from '../../../psychoanalysis_data';

interface RenderOptions {
  scale: number;
  selectedNode: string | null;
  highlightedNodes: string[];
}

export class LinkRenderer {
  static render(
    ctx: CanvasRenderingContext2D,
    nodes: Node[],
    options: RenderOptions
  ) {
    const { selectedNode, highlightedNodes } = options;
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));

    conceptLinks.forEach((link) => {
      const sourceNode = nodeMap.get(link.source);
      const targetNode = nodeMap.get(link.target);

      if (!sourceNode || !targetNode) return;

      const isRelated =
        link.source === selectedNode ||
        link.target === selectedNode ||
        highlightedNodes.includes(link.source) ||
        highlightedNodes.includes(link.target);

      this.renderLink(ctx, sourceNode, targetNode, isRelated);
    });
  }

  private static renderLink(
    ctx: CanvasRenderingContext2D,
    sourceNode: Node,
    targetNode: Node,
    isRelated: boolean
  ) {
    ctx.beginPath();
    ctx.moveTo(sourceNode.x, sourceNode.y);
    ctx.lineTo(targetNode.x, targetNode.y);
    ctx.strokeStyle = isRelated ? '#A78BFA' : '#475569';
    ctx.lineWidth = isRelated ? 2 : 1;
    ctx.stroke();

    // 绘制箭头
    if (isRelated) {
      this.drawArrow(ctx, sourceNode, targetNode);
    }
  }

  private static drawArrow(
    ctx: CanvasRenderingContext2D,
    from: Node,
    to: Node
  ) {
    const headlen = 15;
    const angle = Math.atan2(to.y - from.y, to.x - from.x);

    // 箭头尖端
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - headlen * Math.cos(angle - Math.PI / 6), to.y - headlen * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(to.x - headlen * Math.cos(angle + Math.PI / 6), to.y - headlen * Math.sin(angle + Math.PI / 6));
    ctx.closePath();
    ctx.fillStyle = '#A78BFA';
    ctx.fill();
  }
}

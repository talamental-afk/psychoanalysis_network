import React, { useEffect, useRef, useState } from 'react';
import { conceptNodes, conceptLinks, categoryLabels } from '../../../psychoanalysis_data';

interface Node {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  category: string;
  level: number;
  color: string;
  x: number;
  y: number;
}

export default function PsychoanalysisNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Node[]>([]);

  // 初始化节点位置
  useEffect(() => {
    const initialNodes: Node[] = (conceptNodes as any[]).map((node, index) => {
      const angle = (index / conceptNodes.length) * Math.PI * 2;
      const radius = 100 + node.level * 60;
      return {
        ...node,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      };
    });
    setNodes(initialNodes);
  }, []);

  // 绘制网络图
  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置canvas大小
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 清空画布
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 绘制网格背景
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.1)';
    ctx.lineWidth = 0.5;
    for (let i = 0; i < canvas.width; i += 50) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, canvas.height);
      ctx.stroke();
    }
    for (let i = 0; i < canvas.height; i += 50) {
      ctx.beginPath();
      ctx.moveTo(0, i);
      ctx.lineTo(canvas.width, i);
      ctx.stroke();
    }

    // 绘制连接线
    conceptLinks.forEach((link) => {
      const sourceNode = nodes.find((n) => n.id === link.source);
      const targetNode = nodes.find((n) => n.id === link.target);
      if (!sourceNode || !targetNode) return;

      const x1 = centerX + sourceNode.x;
      const y1 = centerY + sourceNode.y;
      const x2 = centerX + targetNode.x;
      const y2 = centerY + targetNode.y;

      // 计算线的透明度
      const isRelated =
        hoveredNode === link.source ||
        hoveredNode === link.target ||
        selectedNode === link.source ||
        selectedNode === link.target;

      ctx.strokeStyle = isRelated
        ? 'rgba(167, 139, 250, 0.8)'
        : `rgba(167, 139, 250, ${0.2 + link.strength * 0.2})`;
      ctx.lineWidth = isRelated ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // 绘制箭头
      if (isRelated) {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const arrowSize = 8;
        const arrowX = x2 - Math.cos(angle) * 15;
        const arrowY = y2 - Math.sin(angle) * 15;

        ctx.fillStyle = 'rgba(217, 119, 6, 0.6)';
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(
          arrowX - Math.cos(angle - Math.PI / 6) * arrowSize,
          arrowY - Math.sin(angle - Math.PI / 6) * arrowSize
        );
        ctx.lineTo(
          arrowX - Math.cos(angle + Math.PI / 6) * arrowSize,
          arrowY - Math.sin(angle + Math.PI / 6) * arrowSize
        );
        ctx.closePath();
        ctx.fill();
      }
    });

    // 绘制节点
    nodes.forEach((node) => {
      const x = centerX + node.x;
      const y = centerY + node.y;

      // 绘制光晕效果
      if (hoveredNode === node.id || selectedNode === node.id) {
        const glowRadius = node.id === 'unconscious' ? 35 : 25;
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
        gradient.addColorStop(0, 'rgba(217, 119, 6, 0.4)');
        gradient.addColorStop(1, 'rgba(217, 119, 6, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 绘制节点圆圈
      const nodeRadius = node.id === 'unconscious' ? (hoveredNode === node.id || selectedNode === node.id ? 16 : 14) : (hoveredNode === node.id || selectedNode === node.id ? 10 : 7);
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
      ctx.fill();

      // 绘制节点边框
      ctx.strokeStyle = hoveredNode === node.id || selectedNode === node.id ? '#FEF3C7' : node.color;
      ctx.lineWidth = hoveredNode === node.id || selectedNode === node.id ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
      ctx.stroke();

      // 绘制中心节点的特殊效果
      if (node.id === 'unconscious') {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, 20);
        gradient.addColorStop(0, 'rgba(217, 119, 6, 0.8)');
        gradient.addColorStop(1, 'rgba(217, 119, 6, 0.2)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, 20, 0, Math.PI * 2);
        ctx.fill();
      }
    });
  }, [nodes, hoveredNode, selectedNode]);

  // 处理鼠标移动
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    let foundNode: string | null = null;
    nodes.forEach((node) => {
      const nodeX = centerX + node.x;
      const nodeY = centerY + node.y;
      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      const hitRadius = node.id === 'unconscious' ? 18 : 12;
      if (distance < hitRadius) {
        foundNode = node.id;
      }
    });

    setHoveredNode(foundNode);
  };

  // 处理点击
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    nodes.forEach((node) => {
      const nodeX = centerX + node.x;
      const nodeY = centerY + node.y;
      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      const hitRadius = node.id === 'unconscious' ? 18 : 12;
      if (distance < hitRadius) {
        setSelectedNode(selectedNode === node.id ? null : node.id);
      }
    });
  };

  const selectedNodeData = selectedNode ? conceptNodes.find((n) => n.id === selectedNode) : null;

  return (
    <div className="w-full h-full flex flex-col bg-background">
      <div className="flex-1 relative">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-pointer"
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          onMouseLeave={() => setHoveredNode(null)}
        />

        {/* 图例 */}
        <div className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm border border-border rounded-lg p-3 max-w-xs text-sm">
          <h3 className="text-sm font-semibold text-foreground mb-3">图例</h3>
          <div className="space-y-2 text-xs">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <div key={key} className="flex items-center gap-2">
                <div
                  className="w-2 h-2 rounded-full"
                  style={{
                    backgroundColor:
                      key === 'core'
                        ? '#D97706'
                        : key === 'personality'
                          ? '#A78BFA'
                          : key === 'defense'
                            ? '#A78BFA'
                            : key === 'therapy'
                              ? '#34D399'
                              : key === 'phenomena'
                                ? '#F472B6'
                                : '#FBBF24',
                  }}
                />
                <span className="text-muted-foreground">{label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 信息面板 */}
        {selectedNodeData && (
          <div className="absolute bottom-4 right-4 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-4 max-w-md shadow-lg animate-fade-in">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h3 className="text-base font-semibold text-foreground">{selectedNodeData.name}</h3>
                <p className="text-xs text-muted-foreground">{selectedNodeData.nameEn}</p>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="text-muted-foreground hover:text-foreground transition-colors text-lg leading-none"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-foreground leading-relaxed mb-3">{selectedNodeData.description}</p>
            <div className="flex items-center gap-2">
              <div
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: selectedNodeData.color }}
              />
              <span className="text-xs text-muted-foreground">
                {categoryLabels[selectedNodeData.category as keyof typeof categoryLabels]}
              </span>
            </div>
          </div>
        )}

        {/* 悬停提示 */}
        {hoveredNode && !selectedNode && (
          <div className="absolute top-4 right-4 bg-card/80 backdrop-blur-sm border border-border rounded-lg p-2 max-w-xs">
            <p className="text-xs text-foreground font-medium">
              {conceptNodes.find((n) => n.id === hoveredNode)?.name}
            </p>
            <p className="text-xs text-muted-foreground">点击查看详情</p>
          </div>
        )}
      </div>

      {/* 底部说明 */}
      <div className="bg-card/50 border-t border-border px-4 py-3 text-xs text-muted-foreground">
        <p>💡 提示：将鼠标悬停在节点上查看概念，点击节点查看详细信息。节点之间的连线表示理论关系。</p>
      </div>
    </div>
  );
}

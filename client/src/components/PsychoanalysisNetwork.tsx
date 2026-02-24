import React, { useEffect, useRef, useState } from 'react';
import { conceptNodes, conceptLinks, categoryLabels } from '../../../psychoanalysis_data';
import DraggablePanel from './DraggablePanel';
import { Search, X } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<string[]>([]);

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

  // 搜索功能
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    const query = searchQuery.toLowerCase();
    const results = (conceptNodes as any[])
      .filter(
        (node) =>
          node.name.toLowerCase().includes(query) ||
          node.nameEn.toLowerCase().includes(query) ||
          node.description.toLowerCase().includes(query)
      )
      .map((node) => node.id);

    setSearchResults(results);

    // 自动选中第一个搜索结果
    if (results.length > 0) {
      setSelectedNode(results[0]);
    }
  }, [searchQuery]);

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
        selectedNode === link.target ||
        searchResults.includes(link.source) ||
        searchResults.includes(link.target);

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

      // 检查是否是搜索结果
      const isSearchResult = searchResults.includes(node.id);

      // 绘制光晕效果
      if (hoveredNode === node.id || selectedNode === node.id || isSearchResult) {
        const glowRadius = node.id === 'unconscious' ? 35 : 25;
        const glowColor = isSearchResult ? 'rgba(34, 197, 94, 0.4)' : 'rgba(217, 119, 6, 0.4)';
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
        gradient.addColorStop(0, glowColor);
        gradient.addColorStop(1, glowColor.replace('0.4', '0'));
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 绘制节点圆圈
      const nodeRadius = node.id === 'unconscious' ? (hoveredNode === node.id || selectedNode === node.id || isSearchResult ? 16 : 14) : (hoveredNode === node.id || selectedNode === node.id || isSearchResult ? 10 : 7);
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
      ctx.fill();

      // 绘制节点边框
      const borderColor = isSearchResult ? '#22C55E' : (hoveredNode === node.id || selectedNode === node.id ? '#FEF3C7' : node.color);
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = hoveredNode === node.id || selectedNode === node.id || isSearchResult ? 2.5 : 1.5;
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
  }, [nodes, hoveredNode, selectedNode, searchResults]);

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

  // 清空搜索
  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  return (
    <div className="w-full h-full flex flex-col bg-background">
      {/* 搜索栏 */}
      <div className="bg-card/80 backdrop-blur-sm border-b border-border px-4 py-3 flex items-center gap-2">
        <div className="flex-1 flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2">
          <Search className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <input
            type="text"
            placeholder="搜索概念（如：防御机制、俄狄浦斯情结...）"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="flex-1 bg-transparent outline-none text-sm text-foreground placeholder-muted-foreground"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="text-muted-foreground hover:text-foreground transition-colors p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
        {searchResults.length > 0 && (
          <div className="text-xs text-muted-foreground whitespace-nowrap">
            找到 {searchResults.length} 个结果
          </div>
        )}
      </div>

      <div className="flex-1 relative overflow-hidden">
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
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-xs">
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-muted-foreground">搜索结果</span>
            </div>
          </div>
        </div>

        {/* 可拖拽信息面板 */}
        {selectedNodeData && (
          <DraggablePanel
            title={selectedNodeData.name}
            onClose={() => setSelectedNode(null)}
            defaultWidth={420}
            defaultHeight={280}
            defaultX={typeof window !== 'undefined' ? window.innerWidth - 450 : 0}
            defaultY={100}
          >
            <div>
              <p className="text-xs text-muted-foreground mb-3">{selectedNodeData.nameEn}</p>
              <p className="text-xs text-foreground leading-relaxed mb-4">{selectedNodeData.description}</p>
              <div className="flex items-center gap-2 pt-3 border-t border-border">
                <div
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: selectedNodeData.color }}
                />
                <span className="text-xs text-muted-foreground">
                  {categoryLabels[selectedNodeData.category as keyof typeof categoryLabels]}
                </span>
              </div>
            </div>
          </DraggablePanel>
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
        <p>💡 提示：使用搜索框快速定位概念。搜索结果会以绿色高亮显示。点击节点查看详细信息，面板可拖拽、调整大小和最大化。</p>
      </div>
    </div>
  );
}

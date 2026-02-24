import React, { useEffect, useRef, useState } from 'react';
import { conceptNodes, conceptLinks, categoryLabels } from '../../../psychoanalysis_data';
import DraggablePanel from './DraggablePanel';
import { Search, X, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';

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
  const [scale, setScale] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });

  // 初始化节点位置
  useEffect(() => {
    const initialNodes: Node[] = (conceptNodes as any[]).map((node, index) => {
      const angle = (index / conceptNodes.length) * Math.PI * 2;
      const radius = 120 + node.level * 80;
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

    if (results.length > 0) {
      setSelectedNode(results[0]);
    }
  }, [searchQuery]);

  // 处理滚轮缩放
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // 计算缩放因子
    const zoomFactor = 0.1;
    const newScale = Math.max(0.5, Math.min(3, scale + (e.deltaY > 0 ? -zoomFactor : zoomFactor)));

    // 计算缩放中心点（鼠标位置）
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 调整平移以保持鼠标位置不变
    const scaleDiff = newScale - scale;
    const mouseRelX = x - centerX;
    const mouseRelY = y - centerY;

    setPan({
      x: pan.x - (mouseRelX * scaleDiff) / scale,
      y: pan.y - (mouseRelY * scaleDiff) / scale,
    });

    setScale(newScale);
  };

  // 处理鼠标按下（平移）
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 2 || e.ctrlKey || e.metaKey) {
      // 右键或Ctrl+左键用于平移
      setIsPanning(true);
      setPanStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  // 处理鼠标释放
  useEffect(() => {
    const handleMouseUp = () => {
      setIsPanning(false);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (isPanning) {
        setPan({
          x: e.clientX - panStart.x,
          y: e.clientY - panStart.y,
        });
      }
    };

    if (isPanning) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPanning, panStart]);

  // 重置视图
  const resetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  // 绘制网络图
  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 清空画布
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // 应用缩放和平移变换
    ctx.save();
    ctx.translate(centerX + pan.x, centerY + pan.y);
    ctx.scale(scale, scale);
    ctx.translate(-centerX, -centerY);

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

      const isSearchResult = searchResults.includes(node.id);

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

      const nodeRadius = node.id === 'unconscious' ? (hoveredNode === node.id || selectedNode === node.id || isSearchResult ? 16 : 14) : (hoveredNode === node.id || selectedNode === node.id || isSearchResult ? 10 : 7);
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
      ctx.fill();

      const borderColor = isSearchResult ? '#22C55E' : (hoveredNode === node.id || selectedNode === node.id ? '#FEF3C7' : node.color);
      ctx.strokeStyle = borderColor;
      ctx.lineWidth = hoveredNode === node.id || selectedNode === node.id || isSearchResult ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
      ctx.stroke();

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

    ctx.restore();
  }, [nodes, hoveredNode, selectedNode, searchResults, scale, pan]);

  // 处理鼠标移动
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || isPanning) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const canvasX = (x - centerX - pan.x) / scale + centerX;
    const canvasY = (y - centerY - pan.y) / scale + centerY;

    let foundNode: string | null = null;
    nodes.forEach((node) => {
      const nodeX = centerX + node.x;
      const nodeY = centerY + node.y;
      const distance = Math.sqrt((canvasX - nodeX) ** 2 + (canvasY - nodeY) ** 2);
      const hitRadius = node.id === 'unconscious' ? 18 : 12;
      if (distance < hitRadius) {
        foundNode = node.id;
      }
    });

    setHoveredNode(foundNode);
  };

  // 处理点击
  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || isPanning) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const canvasX = (x - centerX - pan.x) / scale + centerX;
    const canvasY = (y - centerY - pan.y) / scale + centerY;

    nodes.forEach((node) => {
      const nodeX = centerX + node.x;
      const nodeY = centerY + node.y;
      const distance = Math.sqrt((canvasX - nodeX) ** 2 + (canvasY - nodeY) ** 2);
      const hitRadius = node.id === 'unconscious' ? 18 : 12;
      if (distance < hitRadius) {
        setSelectedNode(selectedNode === node.id ? null : node.id);
      }
    });
  };

  const selectedNodeData = selectedNode ? conceptNodes.find((n) => n.id === selectedNode) : null;

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
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onMouseMove={handleMouseMove}
          onClick={handleClick}
          onMouseLeave={() => setHoveredNode(null)}
          onWheel={handleWheel}
          onMouseDown={handleCanvasMouseDown}
          onContextMenu={(e) => e.preventDefault()}
        />

        {/* 缩放控制按钮 */}
        <div className="absolute bottom-4 right-4 flex flex-col gap-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg p-2">
          <button
            onClick={() => setScale(Math.min(3, scale + 0.2))}
            className="p-2 hover:bg-secondary rounded transition-colors text-foreground"
            title="放大 (Ctrl + 滚轮)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => setScale(Math.max(0.5, scale - 0.2))}
            className="p-2 hover:bg-secondary rounded transition-colors text-foreground"
            title="缩小 (Ctrl + 滚轮)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="h-px bg-border" />
          <button
            onClick={resetView}
            className="p-2 hover:bg-secondary rounded transition-colors text-foreground"
            title="重置视图"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>

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
            defaultWidth={600}
            defaultHeight={400}
            defaultX={typeof window !== 'undefined' ? window.innerWidth - 650 : 0}
            defaultY={80}
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


    </div>
  );
}

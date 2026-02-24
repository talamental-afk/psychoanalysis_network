import { useRef, useState, useEffect } from 'react';
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
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });
  const [visibleCategories, setVisibleCategories] = useState<Set<string>>(new Set(Object.keys(categoryLabels)));
  const [hoveredLink, setHoveredLink] = useState<{source: string; target: string; type: string} | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // 关系类型描述
  const relationshipDescriptions: Record<string, string> = {
    relates: '相关联',
    influences: '影响',
    contains: '包含',
    treats: '治疗',
    manifests: '表现为',
  };

  // 切换分类可见性
  const toggleCategory = (category: string) => {
    const newVisible = new Set(visibleCategories);
    if (newVisible.has(category)) {
      newVisible.delete(category);
    } else {
      newVisible.add(category);
    }
    setVisibleCategories(newVisible);
  };

  // 初始化节点位置 - 使用更优化的分布算法
  useEffect(() => {
    const initialNodes: Node[] = (conceptNodes as any[]).map((node, index) => {
      const angle = (index / conceptNodes.length) * Math.PI * 2;
      // 根据节点层级调整半径，确保所有节点都在可见范围内
      const baseRadius = 80;
      const levelRadius = node.level * 50;
      const radius = baseRadius + levelRadius;
      
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
    const results = conceptNodes
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

  // 绘制网络图
  useEffect(() => {
    if (!canvasRef.current || nodes.length === 0) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 设置canvas尺寸
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasSize({ width: canvas.width, height: canvas.height });

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

    // 绘制网格
    ctx.strokeStyle = 'rgba(167, 139, 250, 0.05)';
    ctx.lineWidth = 1;
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
      
      // 检查两个节点是否都可见
      if (!visibleCategories.has(sourceNode.category) || !visibleCategories.has(targetNode.category)) return;

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
        searchResults.includes(link.target) ||
        (hoveredLink && hoveredLink.source === link.source && hoveredLink.target === link.target);

      ctx.strokeStyle = isRelated
        ? 'rgba(167, 139, 250, 0.8)'
        : `rgba(167, 139, 250, ${0.2 + link.strength * 0.2})`;
      ctx.lineWidth = isRelated ? 2.5 : 1.5;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();

      // 绘制箭头
      if (link.type === 'influences' || link.type === 'treats' || link.type === 'manifests') {
        const angle = Math.atan2(y2 - y1, x2 - x1);
        const arrowSize = 8;
        const arrowX = x2 - Math.cos(angle) * 15;
        const arrowY = y2 - Math.sin(angle) * 15;

        ctx.fillStyle = isRelated ? 'rgba(167, 139, 250, 0.8)' : `rgba(167, 139, 250, ${0.3 + link.strength * 0.2})`;
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
      // 检查节点是否可见
      if (!visibleCategories.has(node.category)) return;
      
      const x = centerX + node.x;
      const y = centerY + node.y;

      const isSearchResult = searchResults.includes(node.id);

      if (hoveredNode === node.id || selectedNode === node.id || isSearchResult) {
        const glowRadius = node.id === 'unconscious' ? 35 : 25;
        const glowColor = isSearchResult ? 'rgba(34, 197, 94, 0.4)' : 'rgba(217, 119, 6, 0.4)';
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
        gradient.addColorStop(0, glowColor);
        gradient.addColorStop(1, 'rgba(217, 119, 6, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      // 绘制节点
      const radius = node.id === 'unconscious' ? 16 : node.level === 1 ? 12 : node.level === 2 ? 9 : 7;
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      // 绘制边框
      ctx.strokeStyle = hoveredNode === node.id ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = hoveredNode === node.id ? 2 : 1;
      ctx.stroke();
    });

    ctx.restore();
  }, [nodes, hoveredNode, selectedNode, searchResults, scale, pan, visibleCategories, hoveredLink]);

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
    let foundLink: {source: string; target: string; type: string} | null = null;
    
    // 检查节点悬停
    nodes.forEach((node) => {
      const nodeX = centerX + node.x;
      const nodeY = centerY + node.y;
      const distance = Math.sqrt((canvasX - nodeX) ** 2 + (canvasY - nodeY) ** 2);
      const hitRadius = node.id === 'unconscious' ? 18 : 12;
      if (distance < hitRadius) {
        foundNode = node.id;
      }
    });

    // 检查连接线悬停
    if (!foundNode) {
      conceptLinks.forEach((link) => {
        const sourceNode = nodes.find((n) => n.id === link.source);
        const targetNode = nodes.find((n) => n.id === link.target);
        if (!sourceNode || !targetNode) return;
        if (!visibleCategories.has(sourceNode.category) || !visibleCategories.has(targetNode.category)) return;
        
        const x1 = centerX + sourceNode.x;
        const y1 = centerY + sourceNode.y;
        const x2 = centerX + targetNode.x;
        const y2 = centerY + targetNode.y;
        
        // 计算点到线段的距离
        const dx = x2 - x1;
        const dy = y2 - y1;
        const len = Math.sqrt(dx * dx + dy * dy);
        if (len === 0) return;
        
        const t = Math.max(0, Math.min(1, ((canvasX - x1) * dx + (canvasY - y1) * dy) / (len * len)));
        const closestX = x1 + t * dx;
        const closestY = y1 + t * dy;
        const distance = Math.sqrt((canvasX - closestX) ** 2 + (canvasY - closestY) ** 2);
        
        if (distance < 8) {
          foundLink = { source: link.source, target: link.target, type: link.type };
          setTooltipPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
        }
      });
    }

    setHoveredNode(foundNode);
    setHoveredLink(foundLink);
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
  const hoveredLinkData = hoveredLink ? {
    source: conceptNodes.find((n) => n.id === hoveredLink.source),
    target: conceptNodes.find((n) => n.id === hoveredLink.target),
    type: hoveredLink.type,
  } : null;

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  // 缩放控制
  const handleZoom = (direction: 'in' | 'out') => {
    const zoomFactor = direction === 'in' ? 1.2 : 0.8;
    const newScale = Math.max(0.5, Math.min(3, scale * zoomFactor));
    setScale(newScale);
  };

  const resetView = () => {
    setScale(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="relative w-full h-full bg-background">
      {/* 搜索框 */}
      <div className="absolute top-4 right-4 z-10">
        <div className="relative w-80">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="搜索概念（如：防御机制、弗洛伊德...）"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {searchResults.length > 0 && (
            <div className="absolute top-full mt-2 left-0 right-0 bg-card/90 backdrop-blur-sm border border-border rounded-lg p-2 text-xs text-muted-foreground">
              找到 {searchResults.length} 个结果
            </div>
          )}
        </div>
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-grab active:cursor-grabbing"
        onMouseMove={(e) => {
          if (isPanning) {
            const dx = e.clientX - panStart.x;
            const dy = e.clientY - panStart.y;
            setPan({ x: pan.x + dx, y: pan.y + dy });
            setPanStart({ x: e.clientX, y: e.clientY });
          }
          handleMouseMove(e);
        }}
        onClick={handleClick}
        onMouseDown={(e) => {
          if (e.button === 2 || (e.button === 0 && e.ctrlKey)) {
            setIsPanning(true);
            setPanStart({ x: e.clientX, y: e.clientY });
          }
        }}
        onMouseUp={() => setIsPanning(false)}
        onMouseLeave={() => {
          setIsPanning(false);
          setHoveredNode(null);
          setHoveredLink(null);
        }}
        onWheel={(e) => {
          e.preventDefault();
          handleZoom(e.deltaY < 0 ? 'in' : 'out');
        }}
        onContextMenu={(e) => e.preventDefault()}
      />

      {/* 缩放控制 */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-2 z-10">
        <button
          onClick={() => handleZoom('in')}
          className="p-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg hover:bg-secondary transition-colors"
          title="放大"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          onClick={() => handleZoom('out')}
          className="p-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg hover:bg-secondary transition-colors"
          title="缩小"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          onClick={resetView}
          className="p-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg hover:bg-secondary transition-colors"
          title="重置视图"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* 图例 - 可交互筛选 */}
      <div className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm border border-border rounded-lg p-3 max-w-xs text-sm z-10">
        <h3 className="text-sm font-semibold text-foreground mb-3">图例（点击筛选）</h3>
        <div className="space-y-1 text-xs">
          {Object.entries(categoryLabels).map(([key, label]) => {
            const isVisible = visibleCategories.has(key);
            const categoryColor = key === 'core' ? '#D97706' : key === 'personality' ? '#A78BFA' : key === 'defense' ? '#A78BFA' : key === 'therapy' ? '#34D399' : key === 'phenomena' ? '#F472B6' : key === 'theorist' ? '#FBBF24' : key === 'lacan' ? '#EC4899' : key === 'self_psychology' ? '#06B6D4' : '#8B5CF6';
            return (
              <button key={key} onClick={() => toggleCategory(key)} className={`flex items-center gap-2 w-full px-2 py-1 rounded transition-colors ${isVisible ? 'bg-secondary/50 hover:bg-secondary' : 'bg-muted/30 hover:bg-muted/50 opacity-50'}`}>
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{backgroundColor: categoryColor, opacity: isVisible ? 1 : 0.5}} />
                <span className="text-muted-foreground text-xs">{label}</span>
              </button>
            );
          })}
        </div>
        <div className="mt-3 pt-3 border-t border-border">
          <div className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-full bg-green-500" />
            <span className="text-muted-foreground">搜索结果</span>
          </div>
        </div>
      </div>

      {/* 可拖拽信息面板 */}
      {selectedNodeData && (
        <DraggablePanel
          title={`${selectedNodeData.name} (${selectedNodeData.nameEn})`}
          onClose={() => setSelectedNode(null)}
          defaultWidth={600}
          defaultHeight={window.innerHeight - 160}
        >
          <div className="text-sm text-muted-foreground mb-3">{selectedNodeData.description}</div>
          <div className="text-xs text-muted-foreground">
            <div className="mb-2"><span className="font-medium">分类：</span>{categoryLabels[selectedNodeData.category as keyof typeof categoryLabels]}</div>
          </div>
        </DraggablePanel>
      )}

      {/* 连接线信息提示 */}
      {hoveredLinkData && (
        <div
          className="fixed bg-card/90 backdrop-blur-sm border border-border rounded-lg p-3 text-sm z-20 pointer-events-none"
          style={{
            left: `${tooltipPos.x + 10}px`,
            top: `${tooltipPos.y + 10}px`,
            maxWidth: '300px',
          }}
        >
          <div className="font-semibold text-foreground mb-2">
            {hoveredLinkData.source?.name} → {hoveredLinkData.target?.name}
          </div>
          <div className="text-xs text-muted-foreground">
            <div className="mb-1">
              <span className="font-medium">关系：</span>
              {relationshipDescriptions[hoveredLinkData.type] || hoveredLinkData.type}
            </div>
            <div>
              <span className="font-medium">来源：</span>
              {hoveredLinkData.source?.nameEn}
            </div>
            <div>
              <span className="font-medium">目标：</span>
              {hoveredLinkData.target?.nameEn}
            </div>
          </div>
        </div>
      )}

      {/* 底部版权 */}
      <div className="absolute bottom-4 left-4 text-xs text-muted-foreground">
        © 2026
      </div>
    </div>
  );
}

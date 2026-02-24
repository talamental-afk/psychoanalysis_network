import { useRef, useState, useEffect } from 'react';
import { conceptNodes, conceptLinks, categoryLabels } from '../../../psychoanalysis_data';
import { Search, X, ZoomIn, ZoomOut, RotateCcw, ChevronRight } from 'lucide-react';

interface Node {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  definition?: string;
  example?: string;
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAutoClosing, setIsAutoClosing] = useState(true);
  const [activeLearningPath, setActiveLearningPath] = useState<string | null>(null);
  const [highlightedNodes, setHighlightedNodes] = useState<Set<string>>(new Set());

  // 学习路径定义
  const learningPaths: Record<string, {name: string; description: string; nodes: string[]}> = {
    beginner: {
      name: '精神分析入门',
      description: '从基础概念开始，理解精神分析的核心理论',
      nodes: ['unconscious', 'id', 'ego', 'superego', 'defense_mechanisms', 'repression', 'free_association', 'freud']
    },
    dreams: {
      name: '梦的分析',
      description: '深入理解梦的工作机制和分析方法',
      nodes: ['unconscious', 'dream_analysis', 'condensation', 'displacement', 'manifest_content', 'latent_content', 'wish_fulfillment']
    },
    defense: {
      name: '防御机制探索',
      description: '全面了解自我的防御机制',
      nodes: ['ego', 'defense_mechanisms', 'repression', 'denial', 'projection', 'rationalization', 'sublimation', 'displacement']
    },
    lacan: {
      name: '拉康理论入门',
      description: '理解拉康对精神分析的重新解释',
      nodes: ['unconscious', 'symbolic_order', 'imaginary_order', 'real_order', 'mirror_stage', 'lack', 'desire', 'lacan']
    },
    selfpsych: {
      name: '自体心理学',
      description: '探索科胡特的自体心理学理论',
      nodes: ['self', 'self_object', 'mirroring', 'idealization', 'twinship', 'empathy', 'kohut']
    },
    objectrel: {
      name: '客体关系理论',
      description: '理解客体关系如何塑造人格',
      nodes: ['object_relations', 'internal_object', 'projective_identification', 'introjection', 'good_bad_object', 'transitional_object', 'klein']
    }
  };

  // 处理学习路径选择
  const selectLearningPath = (pathKey: string) => {
    if (activeLearningPath === pathKey) {
      setActiveLearningPath(null);
      setHighlightedNodes(new Set());
    } else {
      setActiveLearningPath(pathKey);
      setHighlightedNodes(new Set(learningPaths[pathKey].nodes));
    }
  };

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

  // 初始化节点位置
  useEffect(() => {
    const initialNodes: Node[] = (conceptNodes as any[]).map((node, index) => {
      const angle = (index / conceptNodes.length) * Math.PI * 2;
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

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasSize({ width: canvas.width, height: canvas.height });

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

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
      if (!visibleCategories.has(node.category)) return;
      
      const x = centerX + node.x;
      const y = centerY + node.y;

      const isSearchResult = searchResults.includes(node.id);
      const isHighlighted = highlightedNodes.has(node.id);

      if (hoveredNode === node.id || selectedNode === node.id || isSearchResult) {
        const glowRadius = node.id === 'unconscious' ? 35 : 25;
        let glowColor = 'rgba(217, 119, 6, 0.4)';
        if (isSearchResult) glowColor = 'rgba(34, 197, 94, 0.4)';
        if (isHighlighted) glowColor = 'rgba(59, 130, 246, 0.4)';
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
        gradient.addColorStop(0, glowColor);
        gradient.addColorStop(1, 'rgba(217, 119, 6, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      }

      const radius = node.id === 'unconscious' ? 16 : node.level === 1 ? 12 : node.level === 2 ? 9 : 7;
      ctx.fillStyle = node.color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = hoveredNode === node.id ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = hoveredNode === node.id ? 2 : 1;
      ctx.stroke();
    });

    ctx.restore();
  }, [nodes, hoveredNode, selectedNode, searchResults, scale, pan, visibleCategories, hoveredLink, highlightedNodes]);

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
    
    nodes.forEach((node) => {
      const nodeX = centerX + node.x;
      const nodeY = centerY + node.y;
      const distance = Math.sqrt((canvasX - nodeX) ** 2 + (canvasY - nodeY) ** 2);
      const hitRadius = node.id === 'unconscious' ? 18 : 12;
      if (distance < hitRadius) {
        foundNode = node.id;
      }
    });

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

  // 自动打开/关闭侧边栏
  useEffect(() => {
    if (isAutoClosing) {
      if (selectedNode) {
        setSidebarOpen(true);
      } else {
        setSidebarOpen(false);
      }
    }
  }, [selectedNode, isAutoClosing]);

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
    <div className="relative w-full h-full bg-background flex">
      {/* 主要网络图区域 */}
      <div className="flex-1 relative">
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

        {/* 图例 */}
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
          <div className="mt-3 pt-3 border-t border-border">
            <div className="flex items-center gap-2 text-xs mb-2">
              <div className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-muted-foreground">学习路径</span>
            </div>
            <div className="space-y-1">
              {Object.entries(learningPaths).map(([key, path]) => (
                <button
                  key={key}
                  onClick={() => selectLearningPath(key)}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                    activeLearningPath === key
                      ? 'bg-primary/50 text-primary-foreground'
                      : 'bg-secondary/30 hover:bg-secondary/50 text-muted-foreground'
                  }`}
                  title={path.description}
                >
                  {path.name}
                </button>
              ))}
            </div>
          </div>
        </div>

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

      {/* 右侧侧边栏 */}
      {selectedNode && (
        <div className={`relative bg-card border-l border-border flex flex-col ${selectedNode ? 'w-96' : 'w-0'} overflow-hidden transition-all duration-300`}>
          {/* 侧边栏头部 */}
          <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
          <h2 className="text-lg font-semibold text-foreground">
            {selectedNodeData ? selectedNodeData.name : '选择概念'}
          </h2>
          <button
            onClick={() => setSelectedNode(null)}
            className="p-1 hover:bg-secondary rounded transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

          {/* 侧边栏内容 */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {selectedNodeData ? (
            <>
              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">英文名</div>
                <div className="text-sm text-foreground">{selectedNodeData.nameEn}</div>
              </div>

              <div>
                <div className="text-xs font-medium text-muted-foreground mb-1">简述</div>
                <div className="text-sm text-foreground">{selectedNodeData.description}</div>
              </div>

              {selectedNodeData.definition && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">详细定义</div>
                  <div className="text-sm text-foreground leading-relaxed">{selectedNodeData.definition}</div>
                </div>
              )}

              {selectedNodeData.example && (
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-1">案例说明</div>
                  <div className="text-sm text-foreground leading-relaxed italic">{selectedNodeData.example}</div>
                </div>
              )}

              <div className="pt-2 border-t border-border">
                <div className="text-xs font-medium text-muted-foreground mb-1">分类</div>
                <div className="text-sm text-foreground">{categoryLabels[selectedNodeData.category as keyof typeof categoryLabels]}</div>
              </div>

              {(() => {
                const relatedNodes = conceptLinks
                  .filter(link => link.source === selectedNode || link.target === selectedNode)
                  .map(link => link.source === selectedNode ? link.target : link.source);
                
                if (relatedNodes.length > 0) {
                  return (
                    <div className="pt-2 border-t border-border">
                      <div className="text-xs font-medium text-muted-foreground mb-2">相关概念</div>
                      <div className="flex flex-wrap gap-2">
                        {relatedNodes.map(nodeId => {
                          const relatedNode = conceptNodes.find(n => n.id === nodeId);
                          if (!relatedNode) return null;
                          return (
                            <button
                              key={nodeId}
                              onClick={() => setSelectedNode(nodeId)}
                              className="px-2 py-1 text-xs bg-secondary/50 hover:bg-secondary text-foreground rounded transition-colors border border-border/50 hover:border-border"
                            >
                              {relatedNode.name}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                }
                return null;
              })()}
            </>
          ) : (
            <div className="text-center text-muted-foreground text-sm py-8">
              点击网络图中的节点查看详细信息
            </div>
          )}
          </div>
        </div>
      )}
    </div>
  );
}

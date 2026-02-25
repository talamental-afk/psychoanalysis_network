import React, { useRef, useState, useEffect, useCallback } from 'react';
import { conceptNodes, conceptLinks, categoryLabels, references, nodeReferences, Reference } from '../../../psychoanalysis_data';
import { Search, X, ZoomIn, ZoomOut, RotateCcw, ChevronRight , Trophy, Medal } from 'lucide-react';
import { Link } from 'wouter';


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
  hasCircularLogic?: boolean;
  circularLogicExplanation?: string;
}

// 头像映射
const portraitMap: Record<string, string> = {
  freud: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663376544081/QhNfjWjPSHcZuguU.png',
  jung: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663376544081/DQwEGuhKtYmBpHsR.png',
  lacan: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663376544081/ocvvqMjwViCJUDvw.png',
  kohut: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663376544081/XzkXegVpDcRFKmqp.png',
  klein: 'https://files.manuscdn.com/user_upload_by_module/session_file/310519663376544081/vLTUhZDdyceomXmO.png'
};

export default function PsychoanalysisNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const portraitImagesRef = useRef<Map<string, HTMLImageElement>>(new Map());
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
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [portraitsLoaded, setPortraitsLoaded] = useState(0);
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());
  const [completedPaths, setCompletedPaths] = useState<Set<string>>(new Set());
  const [celebrationPath, setCelebrationPath] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [nodeOffsets, setNodeOffsets] = useState<Record<string, {x: number; y: number}>>({});
  const [language, setLanguage] = useState<'zh' | 'en'>('zh');
  const [sidebarTab, setSidebarTab] = useState<'achievements' | 'details'>('details');

  // 标签翻译
  const labelTranslations = {
    circularLogic: {
      zh: '循环论证',
      en: 'Circular Logic'
    }
  };

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

  // 计算学习路径的完成度
  const getPathProgress = (pathKey: string): number => {
    const path = learningPaths[pathKey];
    if (!path || path.nodes.length === 0) return 0;
    const completedCount = path.nodes.filter(nodeId => completedNodes.has(nodeId)).length;
    return Math.round((completedCount / path.nodes.length) * 100);
  };

  // 关系类型描述
  const relationshipDescriptions: Record<string, string> = {
    'theoretical_foundation': '理论基础',
    'related_concept': '相关概念',
    'application': '应用',
    'contrast': '对比',
    'extension': '扩展',
    'criticism': '批评'
  };

  // 初始化节点
  useEffect(() => {
    const initialNodes: Node[] = conceptNodes.map(node => ({
      id: node.id,
      name: node.name,
      nameEn: node.nameEn,
      description: node.description,
      definition: node.definition,
      example: node.example,
      category: node.category,
      level: node.level,
      color: node.color,
      x: (node as any).x || 0,
      y: (node as any).y || 0,
      hasCircularLogic: node.hasCircularLogic,
      circularLogicExplanation: node.circularLogicExplanation
    }));
    setNodes(initialNodes);

    // 加载头像
    Object.entries(portraitMap).forEach(([key, url]) => {
      const img = new Image();
      img.src = url;
      img.onload = () => {
        portraitImagesRef.current.set(key, img);
        setPortraitsLoaded(prev => prev + 1);
      };
    });
  }, []);

  // 处理窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const rect = canvasRef.current.parentElement?.getBoundingClientRect();
        if (rect) {
          canvasRef.current.width = rect.width;
          canvasRef.current.height = rect.height;
        }
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 搜索功能
  const handleSearch = useCallback((query: string) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    const results = conceptNodes
      .filter(node => 
        node.name.toLowerCase().includes(query.toLowerCase()) ||
        node.nameEn.toLowerCase().includes(query.toLowerCase())
      )
      .map(node => node.id);
    setSearchResults(results);
  }, []);

  const clearSearch = () => {
    setSearchQuery('');
    setSearchResults([]);
  };

  // 计算自动缩放
  const calculateAutoScale = (nodes: Node[], width: number, height: number): number => {
    if (nodes.length === 0) return 1;
    const maxX = Math.max(...nodes.map(n => Math.abs(n.x)));
    const maxY = Math.max(...nodes.map(n => Math.abs(n.y)));
    const maxDist = Math.max(maxX, maxY);
    if (maxDist === 0) return 1;
    const padding = 100;
    const scaleX = (width - padding) / (maxDist * 2);
    const scaleY = (height - padding) / (maxDist * 2);
    return Math.min(scaleX, scaleY, 2);
  };

  // Canvas 绘制
  const drawCanvas = useCallback(() => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const autoScale = calculateAutoScale(nodes, canvas.width, canvas.height);
    const finalScale = scale || autoScale;

    // 清空画布
    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(centerX + pan.x, centerY + pan.y);
    ctx.scale(finalScale, finalScale);

    // 绘制连接线
    conceptLinks.forEach(link => {
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);
      if (!sourceNode || !targetNode) return;

      const isVisible = visibleCategories.has(sourceNode.category) && visibleCategories.has(targetNode.category);
      if (!isVisible) return;

      const isRelated = hoveredNode && (link.source === hoveredNode || link.target === hoveredNode);
      const isInSearch = searchResults.includes(link.source) && searchResults.includes(link.target);

      ctx.strokeStyle = isRelated ? 'rgba(167, 139, 250, 0.8)' : `rgba(167, 139, 250, ${0.3 + link.strength * 0.2})`;
      ctx.lineWidth = isRelated ? 2 : 1;
      ctx.beginPath();
      ctx.moveTo(sourceNode.x, sourceNode.y);
      ctx.lineTo(targetNode.x, targetNode.y);
      ctx.stroke();
    });

    // 绘制节点
    nodes.forEach(node => {
      if (!visibleCategories.has(node.category)) return;

      const x = node.x;
      const y = node.y;
      const isHovered = hoveredNode === node.id;
      const isSelected = selectedNode === node.id;
      const isInSearch = searchResults.includes(node.id);
      const radius = isSelected ? 20 : isHovered ? 18 : 15;

      // 计算节点透明度
      const nodeOpacity = searchResults.length > 0 ? (isInSearch ? 1 : 0.3) : 1;

      // 绘制阴影
      if (isSelected || isHovered) {
        ctx.shadowColor = 'rgba(168, 85, 247, 0.5)';
        ctx.shadowBlur = 20;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      }

      ctx.fillStyle = node.color;
      ctx.globalAlpha = nodeOpacity;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;

      ctx.strokeStyle = hoveredNode === node.id ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = hoveredNode === node.id ? 2 : 1;
      ctx.globalAlpha = nodeOpacity;
      ctx.stroke();
      ctx.globalAlpha = 1;

      // 绘制头像
      if (portraitMap[node.id]) {
        const portraitImage = portraitImagesRef.current.get(node.id);
        if (portraitImage) {
          ctx.globalAlpha = nodeOpacity;
          ctx.save();
          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);
          ctx.clip();
          ctx.drawImage(portraitImage, x - radius, y - radius, radius * 2, radius * 2);
          ctx.restore();
          ctx.globalAlpha = 1;
        }
      }

      // 绘制节点文字标签 - 从圆心向外径向排列
      ctx.fillStyle = '#E0E7FF';
      ctx.font = '11px Inter';
      ctx.globalAlpha = nodeOpacity;
      
      // 计算从圆心到节点的角度
      const angle = Math.atan2(node.y, node.x);
      
      // 计算文字起始位置（从半径外侧开始）
      const textDistance = radius + 8;
      const textStartX = x + Math.cos(angle) * textDistance;
      const textStartY = y + Math.sin(angle) * textDistance;
      
      // 计算文字的总宽度
      const textMetrics = ctx.measureText(node.name);
      const textWidth = textMetrics.width;
      
      // 文字中心位置（从圆心向外延伸）
      const textCenterX = textStartX + Math.cos(angle) * (textWidth / 2);
      const textCenterY = textStartY + Math.sin(angle) * 6;
      
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(node.name, textCenterX, textCenterY);
      
      // 绘制循环论证标签（节点名字下一行）
      const conceptNode = conceptNodes.find(cn => cn.id === node.id);
      if (conceptNode && conceptNode.hasCircularLogic) {
        const labelText = labelTranslations.circularLogic[language];
        ctx.font = 'bold 8px Inter';
        ctx.fillStyle = 'rgba(239, 68, 68, 0.9)';
        
        // 标签位置（节点名字下一行）
        const labelY = textCenterY + 12;
        
        // 绘制标签背景
        const labelMetrics = ctx.measureText(labelText);
        const labelWidth = labelMetrics.width + 4;
        const labelHeight = 12;
        
        ctx.beginPath();
        ctx.moveTo(textCenterX - labelWidth / 2 + 2, labelY - labelHeight / 2);
        ctx.lineTo(textCenterX + labelWidth / 2 - 2, labelY - labelHeight / 2);
        ctx.quadraticCurveTo(textCenterX + labelWidth / 2, labelY - labelHeight / 2, textCenterX + labelWidth / 2, labelY - labelHeight / 2 + 2);
        ctx.lineTo(textCenterX + labelWidth / 2, labelY + labelHeight / 2 - 2);
        ctx.quadraticCurveTo(textCenterX + labelWidth / 2, labelY + labelHeight / 2, textCenterX + labelWidth / 2 - 2, labelY + labelHeight / 2);
        ctx.lineTo(textCenterX - labelWidth / 2 + 2, labelY + labelHeight / 2);
        ctx.quadraticCurveTo(textCenterX - labelWidth / 2, labelY + labelHeight / 2, textCenterX - labelWidth / 2, labelY + labelHeight / 2 - 2);
        ctx.lineTo(textCenterX - labelWidth / 2, labelY - labelHeight / 2 + 2);
        ctx.quadraticCurveTo(textCenterX - labelWidth / 2, labelY - labelHeight / 2, textCenterX - labelWidth / 2 + 2, labelY - labelHeight / 2);
        ctx.fill();
        
        // 绘制标签文字
        ctx.fillStyle = '#FFFFFF';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(labelText, textCenterX, labelY);
      }
      
      ctx.globalAlpha = 1;
    });

    // 绘制学习路径的数字标记
    if (highlightedNodes.size > 0) {
      const highlightedArray = Array.from(highlightedNodes);
      highlightedArray.forEach((nodeId, index) => {
        const node = nodes.find(n => n.id === nodeId);
        if (!node) return;
        
        const x = centerX + node.x;
        const y = centerY + node.y;
        
        // 绘制数字背景圆
        ctx.fillStyle = 'rgba(255, 193, 7, 0.9)';
        ctx.beginPath();
        ctx.arc(x, y - 12, 10, 0, Math.PI * 2);
        ctx.fill();
        
        // 绘制数字
        ctx.fillStyle = '#000000';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText((index + 1).toString(), x, y - 12);
      });
    }

    ctx.restore();
  }, [nodes, hoveredNode, selectedNode, searchResults, scale, pan, visibleCategories, hoveredLink, highlightedNodes, portraitsLoaded, language, labelTranslations]);

  // 处理鼠标移动
  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current || isPanning) return;

    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;

    // 自动计算缩放以确保所有节点可见
    const autoScale = calculateAutoScale(nodes, canvas.width, canvas.height);
    const finalScale = scale || autoScale;
    const canvasX = (x - centerX - pan.x) / scale + centerX;
    const canvasY = (y - centerY - pan.y) / scale + centerY;

    // 检查鼠标是否在节点上
    let hoveredNodeId: string | null = null;
    for (const node of nodes) {
      if (!visibleCategories.has(node.category)) continue;
      const nodeX = centerX + node.x * finalScale + pan.x;
      const nodeY = centerY + node.y * finalScale + pan.y;
      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      if (distance < 20 * finalScale) {
        hoveredNodeId = node.id;
        break;
      }
    }
    setHoveredNode(hoveredNodeId);

    // 检查鼠标是否在连接线上
    let hoveredLinkData: {source: typeof conceptNodes[0]; target: typeof conceptNodes[0]; type: string} | null = null;
    for (const link of conceptLinks) {
      const sourceNode = nodes.find(n => n.id === link.source);
      const targetNode = nodes.find(n => n.id === link.target);
      if (!sourceNode || !targetNode) continue;

      const sourceX = centerX + sourceNode.x * finalScale + pan.x;
      const sourceY = centerY + sourceNode.y * finalScale + pan.y;
      const targetX = centerX + targetNode.x * finalScale + pan.x;
      const targetY = centerY + targetNode.y * finalScale + pan.y;

      const distToLine = Math.abs(
        (targetY - sourceY) * x - (targetX - sourceX) * y + targetX * sourceY - targetY * sourceX
      ) / Math.sqrt((targetY - sourceY) ** 2 + (targetX - sourceX) ** 2);

      if (distToLine < 5) {
        const sourceConceptNode = conceptNodes.find(n => n.id === link.source);
        const targetConceptNode = conceptNodes.find(n => n.id === link.target);
        if (sourceConceptNode && targetConceptNode) {
          hoveredLinkData = {
            source: sourceConceptNode,
            target: targetConceptNode,
            type: link.type
          };
          setTooltipPos({ x, y });
          break;
        }
      }
    }
    setHoveredLink(hoveredLinkData ? { source: hoveredLinkData.source.id, target: hoveredLinkData.target.id, type: hoveredLinkData.type } : null);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    handleMouseMove(e);
  };

  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (e.button === 0 && !e.ctrlKey) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const autoScale = calculateAutoScale(nodes, canvas.width, canvas.height);
      const finalScale = scale || autoScale;

      for (const node of nodes) {
        if (!visibleCategories.has(node.category)) continue;
        const nodeX = centerX + node.x * finalScale + pan.x;
        const nodeY = centerY + node.y * finalScale + pan.y;
        const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
        if (distance < 20 * finalScale) {
          setDraggingNode(node.id);
          setDragStart({ x: node.x, y: node.y });
          break;
        }
      }
    }
  };

  const handleCanvasMouseUp = () => {
    setDraggingNode(null);
  };

  const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || isPanning) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const autoScale = calculateAutoScale(nodes, canvas.width, canvas.height);
    const finalScale = scale || autoScale;

    for (const node of nodes) {
      if (!visibleCategories.has(node.category)) continue;
      const nodeX = centerX + node.x * finalScale + pan.x;
      const nodeY = centerY + node.y * finalScale + pan.y;
      const distance = Math.sqrt((x - nodeX) ** 2 + (y - nodeY) ** 2);
      if (distance < 20 * finalScale) {
        setSelectedNode(node.id);
        setSidebarTab('details');
        return;
      }
    }
  };

  const handleZoom = (direction: 'in' | 'out') => {
    const zoomFactor = 1.2;
    setScale(prev => direction === 'in' ? prev * zoomFactor : prev / zoomFactor);
  };

  const resetView = () => {
    setScale(0);
    setPan({ x: 0, y: 0 });
  };

  // 获取选中节点的数据
  const selectedNodeData = selectedNode ? conceptNodes.find(n => n.id === selectedNode) : null;
  const selectedNodeRefData = selectedNode ? nodeReferences[selectedNode as keyof typeof nodeReferences] || [] : [];

  // 获取悬停连接线的数据
  const hoveredLinkData = hoveredLink
    ? {
        source: conceptNodes.find(n => n.id === hoveredLink.source),
        target: conceptNodes.find(n => n.id === hoveredLink.target),
        type: hoveredLink.type
      }
    : null;

  // 绘制 canvas
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // 处理搜索
  useEffect(() => {
    handleSearch(searchQuery);
  }, [searchQuery, handleSearch]);

  // 处理键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') handleZoom('in');
      if (e.key === '-' || e.key === '_') handleZoom('out');
      if (e.key === '0') resetView();
      if (e.key === 'Escape') setSelectedNode(null);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className="flex h-screen w-screen bg-background text-foreground overflow-hidden">
      {/* 主画布区域 */}
      <div className="flex-1 flex flex-col relative">
        {/* 顶部菜单栏 */}
        <div className="flex items-center justify-between gap-4 px-4 py-3 bg-card/80 backdrop-blur-sm border-b border-border">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-foreground">精神分析概念网络图</h1>
          </div>

          <div className="flex items-center gap-3">
            {/* 排行榜入口 */}
            <a
            href="/leaderboard"
            className="flex items-center justify-center p-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg hover:bg-secondary transition-colors"
            title="查看排行榜"
          >
            <Medal className="w-4 h-4" />
          </a>
          {/* 我的成就按黿 */}
          <a
            href="/achievements"
            className="flex items-center justify-center p-2 bg-primary/10 backdrop-blur-sm border border-primary/30 rounded-lg hover:bg-primary/20 transition-colors text-primary"
            title="查看我的成就"
          >
            <Trophy className="w-4 h-4" />
          </a>
          <button
            onClick={() => setLanguage(language === 'zh' ? 'en' : 'zh')}
            className="px-3 py-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg hover:bg-secondary transition-colors text-sm font-medium text-foreground"
            title="Switch Language"
          >
            {language === 'zh' ? 'EN' : 'ZH'}
          </button>
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
        </div>

        {/* Canvas */}
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
          onMouseMove={(e) => {
            handleCanvasMouseMove(e);
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
            handleCanvasMouseDown(e);
            if (e.button === 2 || (e.button === 0 && e.ctrlKey)) {
              setIsPanning(true);
              setPanStart({ x: e.clientX, y: e.clientY });
            }
          }}
          onMouseUp={() => {
            setIsPanning(false);
            handleCanvasMouseUp();
          }}
          onMouseLeave={() => {
            setIsPanning(false);
            setHoveredNode(null);
            setHoveredLink(null);
            handleCanvasMouseUp();
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
            title="放大 (快捷键: + 或 =)"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={() => handleZoom('out')}
            className="p-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg hover:bg-secondary transition-colors"
            title="缩小 (快捷键: - 或 _)"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={resetView}
            className="p-2 bg-card/80 backdrop-blur-sm border border-border rounded-lg hover:bg-secondary transition-colors"
            title="重置视图 (快捷键: 0)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <div className="text-xs text-muted-foreground text-center px-2 py-1">
            缩放: {Math.round(scale * 100)}%
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

      {/* 右侧侧边栏 - 分离成就和详情 */}
      {selectedNode && (
        <div className={`relative bg-card border-l border-border flex flex-col ${selectedNode ? 'w-96' : 'w-0'} overflow-hidden transition-all duration-300`}>
          {/* 选项卡头部 */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 flex-shrink-0 bg-secondary/30">
            <div className="flex gap-2">
              <button
                onClick={() => setSidebarTab('achievements')}
                className={`px-3 py-2 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                  sidebarTab === 'achievements'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                <Trophy className="w-3 h-3" />
                成就
              </button>
              <button
                onClick={() => setSidebarTab('details')}
                className={`px-3 py-2 text-xs font-medium rounded transition-colors ${
                  sidebarTab === 'details'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground hover:bg-secondary/80'
                }`}
              >
                详情
              </button>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="p-1 hover:bg-secondary rounded transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 成就标签页 */}
          {sidebarTab === 'achievements' && (
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              <div className="space-y-3">
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">学习路径完成</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${(completedPaths.size / Object.keys(learningPaths).length) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{completedPaths.size}/{Object.keys(learningPaths).length}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">学习节点数</div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{
                          width: `${(completedNodes.size / conceptNodes.length) * 100}%`
                        }}
                      />
                    </div>
                    <span className="text-sm font-semibold text-foreground">{completedNodes.size}/{conceptNodes.length}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs font-medium text-muted-foreground mb-2">整体进度</div>
                  <div className="text-2xl font-bold text-primary">{Math.round((completedNodes.size / conceptNodes.length) * 100)}%</div>
                </div>
              </div>
              <Link href="/leaderboard" className="block w-full mt-4">
                <button className="w-full px-3 py-2 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">
                  查看完整排行榜
                </button>
              </Link>
            </div>
          )}

          {/* 概念详情标签页 */}
          {sidebarTab === 'details' && (
            <>
              {/* 侧边栏头部 */}
              <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
                <h2 className="text-lg font-semibold text-foreground">
                  {selectedNodeData ? selectedNodeData.name : '选择概念'}
                </h2>
              </div>

              {/* 侧边栏内容 */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedNodeData ? (
                  <>
                    {portraitImagesRef.current.has(selectedNode) && (
                      <div className="flex justify-center">
                        <img
                          src={portraitMap[selectedNode as keyof typeof portraitMap]}
                          alt={selectedNodeData.name}
                          className="w-32 h-32 rounded-lg object-cover border border-border"
                        />
                      </div>
                    )}
                    
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

                    {selectedNodeData.hasCircularLogic && selectedNodeData.circularLogicExplanation && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded p-3">
                        <div className="text-xs font-medium text-red-500 mb-2">循环论证警示</div>
                        <div className="text-xs text-red-400/90 leading-relaxed">{selectedNodeData.circularLogicExplanation}</div>
                      </div>
                    )}

                    {selectedNodeRefData.length > 0 && (
                      <div>
                        <div className="text-xs font-medium text-muted-foreground mb-2">参考文献</div>
                        <div className="space-y-2">
                          {selectedNodeRefData.map((ref: any) => (
                            <div key={ref.id} className="text-xs bg-secondary/30 rounded p-2 border border-border/50 hover:bg-secondary/50 transition-colors">
                              {ref.url ? (
                                <a
                                  href={ref.url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-primary hover:underline block"
                                >
                                  {ref.title}
                                </a>
                              ) : (
                                <div className="text-foreground">{ref.title}</div>
                              )}
                              {ref.author && (
                                <div className="text-muted-foreground text-xs mt-1">{ref.author}</div>
                              )}
                              {ref.year && (
                                <div className="text-muted-foreground text-xs">{ref.year}</div>
                              )}
                            </div>
                          ))}
                        </div>
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
            </>
          )}
        </div>
      )}
    </div>
  );
}

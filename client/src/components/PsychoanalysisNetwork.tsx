import React, { useState, useRef, useEffect, useCallback } from 'react';
import { conceptNodes, conceptLinks, categoryLabels, references, nodeReferences, Reference, schoolLabels, schoolColors } from '../../../psychoanalysis_data';
import { Search, X, ZoomIn, ZoomOut, RotateCcw, ChevronRight , Trophy, Medal, ChevronDown } from 'lucide-react';
import { Link } from 'wouter';
import { RecommendedReading } from './RecommendedReading';
import { RatingPanel } from './RatingPanel';
import { AssumptionChainTracer } from './AssumptionChainTracer';
import { SchoolPerspectives } from './SchoolPerspectives';
import { CollapsiblePanel } from './CollapsiblePanel';


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
  alternativeNames?: string[];
  translationNotes?: string;
  school?: string;
  falsifiability?: number;
  logical_coherence?: number;
  userRatings?: {
    falsifiability?: number;
    logical_coherence?: number;
  };
  argumentProcess?: string;
  logicalProblem?: string;
  circularChain?: string[];
  academicSignificance?: string;
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
  const [highlightedPath, setHighlightedPath] = useState<string[]>([]);
  const [highlightedLinks, setHighlightedLinks] = useState<Set<string>>(new Set());
  const [portraitsLoaded, setPortraitsLoaded] = useState(0);
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());
  const [completedPaths, setCompletedPaths] = useState<Set<string>>(new Set());
  const [celebrationPath, setCelebrationPath] = useState<string | null>(null);
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [nodeOffsets, setNodeOffsets] = useState<Record<string, {x: number; y: number}>>({});
  const [sidebarTab, setSidebarTab] = useState<'achievements' | 'details'>('details');
  const [expandedPanels, setExpandedPanels] = useState<Set<string>>(new Set(['school', 'assumption', 'chain', 'rating', 'reading']));
  const [expandedCircularLogic, setExpandedCircularLogic] = useState<Set<string>>(new Set());

  const togglePanel = (panelId: string) => {
    const newExpanded = new Set(expandedPanels);
    if (newExpanded.has(panelId)) {
      newExpanded.delete(panelId);
    } else {
      newExpanded.add(panelId);
    }
    setExpandedPanels(newExpanded);
  };

  const isPanelExpanded = (panelId: string) => expandedPanels.has(panelId);

  const toggleCircularLogic = (conceptId: string) => {
    const newExpanded = new Set(expandedCircularLogic);
    if (newExpanded.has(conceptId)) {
      newExpanded.delete(conceptId);
    } else {
      newExpanded.add(conceptId);
    }
    setExpandedCircularLogic(newExpanded);
  };

  const isCircularLogicExpanded = (conceptId: string) => expandedCircularLogic.has(conceptId);

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

  // 检测学习路径完成并触发庆祝
  useEffect(() => {
    if (completedNodes.size > 0) {
      Object.entries(learningPaths).forEach(([pathKey, path]) => {
        const progress = getPathProgress(pathKey);
        if (progress === 100 && !completedPaths.has(pathKey)) {
          // 标记为已完成
          setCompletedPaths(prev => {
            const newSet = new Set(prev);
            newSet.add(pathKey);
            return newSet;
          });
          // 触发庆祝动画
          setCelebrationPath(pathKey);
          // 3秒后关闭庆祝弹窗
          setTimeout(() => setCelebrationPath(null), 3000);
        }
      });
    }
  }, [completedNodes]);


  // 处理假设链路径高亮
  const handlePathHighlight = (path: string[]) => {
    setHighlightedPath(path);
    // 构建路径中的所有连接
    const links = new Set<string>();
    for (let i = 0; i < path.length - 1; i++) {
      links.add(`${path[i]}-${path[i + 1]}`);
    }
    setHighlightedLinks(links);
  };

  // 处理学习路径选择
  const selectLearningPath = (pathKey: string) => {
    if (activeLearningPath === pathKey) {
      setActiveLearningPath(null);
      setHighlightedNodes(new Set());
      setVisibleCategories(new Set(Object.keys(categoryLabels)));
    } else {
      setActiveLearningPath(pathKey);
      setHighlightedNodes(new Set(learningPaths[pathKey].nodes));
      // 只显示该学习路径相关的分类
      const pathNodes = learningPaths[pathKey].nodes;
      const relatedCategories = new Set<string>();
      conceptNodes.forEach(node => {
        if (pathNodes.includes(node.id)) {
          relatedCategories.add(node.category);
        }
      });
      setVisibleCategories(relatedCategories);
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
    // 清除学习路径选择
    setActiveLearningPath(null);
    
    if (activeCategory === category) {
      // 取消选择该分类
      setActiveCategory(null);
      setHighlightedNodes(new Set());
      setVisibleCategories(new Set(Object.keys(categoryLabels)));
    } else {
      // 选择该分类
      setActiveCategory(category);
      
      // 显示所有分类，但高亮该分类的节点
      setVisibleCategories(new Set(Object.keys(categoryLabels)));
      
      const categoryNodes = new Set<string>();
      conceptNodes.forEach(node => {
        if (node.category === category) {
          categoryNodes.add(node.id);
        }
      });
      setHighlightedNodes(categoryNodes);
    }
  }; // 移除依赖数组，这个函数在其他地方调用

  // 计算动态间距
  const calculateDynamicSpacing = (node: any) => {
    const nameLength = node.name.length;
    const lengthBonus = Math.max(0, (nameLength - 3) * 8);
    return lengthBonus;
  };
  // 计算视口以确保所有节点可见
  const calculateViewport = (nodes: Node[], canvasWidth: number, canvasHeight: number) => {
    if (nodes.length === 0) return { minX: -200, maxX: 200, minY: -200, maxY: 200 };
    
    let minX = nodes[0].x;
    let maxX = nodes[0].x;
    let minY = nodes[0].y;
    let maxY = nodes[0].y;

    for (const node of nodes) {
      minX = Math.min(minX, node.x);
      maxX = Math.max(maxX, node.x);
      minY = Math.min(minY, node.y);
      maxY = Math.max(maxY, node.y);
    }

    // 添加边距
    const padding = 100;
    minX -= padding;
    maxX += padding;
    minY -= padding;
    maxY += padding;

    return { minX, maxX, minY, maxY };
  };

  // 计算自动缩放比例
  const calculateAutoScale = (nodes: Node[], canvasWidth: number, canvasHeight: number) => {
    const viewport = calculateViewport(nodes, canvasWidth, canvasHeight);
    const viewportWidth = viewport.maxX - viewport.minX;
    const viewportHeight = viewport.maxY - viewport.minY;

    const scaleX = canvasWidth / viewportWidth;
    const scaleY = canvasHeight / viewportHeight;

    return Math.min(scaleX, scaleY) * 0.9;
  };

  // 碰撞检测函数
  const detectAndResolveCollisions = (nodes: Node[]) => {
    const minDistance = 60;
    const maxIterations = 10;
    let iterations = 0;
    let hasCollisions = true;

    while (hasCollisions && iterations < maxIterations) {
      hasCollisions = false;
      iterations++;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const node1 = nodes[i];
          const node2 = nodes[j];
          const dx = node2.x - node1.x;
          const dy = node2.y - node1.y;
          const distance = Math.hypot(dx, dy);

          if (distance < minDistance) {
            hasCollisions = true;
            const angle = Math.atan2(dy, dx);
            const moveDistance = (minDistance - distance) / 2;
            const adjustFactor1 = 1 / (1 + node1.level * 0.2);
            const adjustFactor2 = 1 / (1 + node2.level * 0.2);
            
            node1.x -= Math.cos(angle) * moveDistance * adjustFactor1;
            node1.y -= Math.sin(angle) * moveDistance * adjustFactor1;
            node2.x += Math.cos(angle) * moveDistance * adjustFactor2;
            node2.y += Math.sin(angle) * moveDistance * adjustFactor2;
          }
        }
      }
    }

    return nodes;
  };


  // 初始化节点位置
  useEffect(() => {
    const initialNodes: Node[] = (conceptNodes as any[]).map((node, index) => {
      // 人物节点（理论家）放在左侧
      if (node.category === 'theorist') {
        const theoristIndex = (conceptNodes as any[]).filter((n: any) => n.category === 'theorist').indexOf(node);
        const theoristCount = (conceptNodes as any[]).filter((n: any) => n.category === 'theorist').length;
        const theoristAngle = (theoristIndex / Math.max(theoristCount, 1)) * Math.PI - Math.PI / 2;
        const theoristRadius = 200;
        return {
          ...node,
          x: Math.cos(theoristAngle) * theoristRadius - 400,
          y: Math.sin(theoristAngle) * theoristRadius,
        };
      }
      
      // 概念节点放在中心和右侧
      const angle = (index / conceptNodes.length) * Math.PI * 2;
      const baseRadius = 140;
      const levelRadius = node.level * 85;
      const dynamicSpacing = calculateDynamicSpacing(node);
      const radius = baseRadius + levelRadius + dynamicSpacing;
      
      return {
        ...node,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      };
    });
    const adjustedNodes = detectAndResolveCollisions(initialNodes);
    setNodes(adjustedNodes);
  }, []);

  // 加载头像图片
  useEffect(() => {
    let loadedCount = 0;
    const totalPortraits = Object.keys(portraitMap).length;
    
    const loadPortraits = async () => {
      for (const [nodeId, imageUrl] of Object.entries(portraitMap)) {
        try {
          const img = new Image();
          img.onload = () => {
            portraitImagesRef.current.set(nodeId, img);
            console.log(`Loaded portrait: ${nodeId}`);
            loadedCount++;
            if (loadedCount === totalPortraits) {
              setPortraitsLoaded(prev => prev + 1);
            }
          };
          img.onerror = () => {
            console.warn(`Failed to load portrait for ${nodeId}`);
            loadedCount++;
            if (loadedCount === totalPortraits) {
              setPortraitsLoaded(prev => prev + 1);
            }
          };
          img.src = imageUrl;
        } catch (error) {
          console.error(`Error loading portrait for ${nodeId}:`, error);
        }
      }
    };
    loadPortraits();
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

    // 自动计算缩放以确保所有节点可见
    const autoScale = calculateAutoScale(nodes, canvas.width, canvas.height);
    const finalScale = scale || autoScale;

    
    // 设置光标样式
    if (draggingNode) {
      ctx.canvas.style.cursor = 'grabbing';
    } else {
      ctx.canvas.style.cursor = 'default';
    }

    ctx.fillStyle = '#0F172A';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.translate(centerX + pan.x, centerY + pan.y);
    ctx.scale(finalScale, finalScale);
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

      const isPathHighlighted = highlightedLinks.has(`${link.source}-${link.target}`);
      const isRelated =
        hoveredNode === link.source ||
        hoveredNode === link.target ||
        selectedNode === link.source ||
        selectedNode === link.target ||
        searchResults.includes(link.source) ||
        searchResults.includes(link.target) ||
        (hoveredLink && hoveredLink.source === link.source && hoveredLink.target === link.target) ||
        isPathHighlighted;

      ctx.strokeStyle = isPathHighlighted
        ? 'rgba(34, 197, 94, 0.9)'
        : isRelated
        ? 'rgba(167, 139, 250, 0.8)'
        : `rgba(167, 139, 250, ${0.2 + link.strength * 0.2})`;
      ctx.lineWidth = isPathHighlighted ? 3.5 : isRelated ? 2.5 : 1.5;
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
      if (node.category === 'theorist') return; // 隐藏人物节点
      
      const x = centerX + node.x;
      const y = centerY + node.y;

      const isSearchResult = searchResults.includes(node.id);
      const isHighlighted = highlightedNodes.has(node.id);
      const hasHighlightedNodes = highlightedNodes.size > 0;

      // 如果有高亮节点，非高亮节点透明度降低
      let nodeOpacity = 1;
      if (hasHighlightedNodes && !isHighlighted && !isSearchResult && hoveredNode !== node.id && selectedNode !== node.id) {
        nodeOpacity = 0.2;
      }

      if (hoveredNode === node.id || selectedNode === node.id || isSearchResult) {
        const glowRadius = node.id === 'unconscious' ? 35 : 25;
        let glowColor = 'rgba(217, 119, 6, 0.4)';
        let gradientEndColor = 'rgba(217, 119, 6, 0)';
        
        if (isSearchResult) {
          glowColor = 'rgba(34, 197, 94, 0.6)';
          gradientEndColor = 'rgba(34, 197, 94, 0)';
        }
        if (hoveredNode === node.id) {
          glowColor = 'rgba(255, 255, 255, 0.6)';
          gradientEndColor = 'rgba(255, 255, 255, 0)';
        }
        
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, glowRadius);
        gradient.addColorStop(0, glowColor);
        gradient.addColorStop(1, gradientEndColor);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
        ctx.fill();
      
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;

      }

      // 计算节点半径，高亮节点放大
      let radius = node.id === 'unconscious' ? 16 : node.level === 1 ? 12 : node.level === 2 ? 9 : 7;
      if (isHighlighted) {
        radius = radius * 1.5;
      }
      // 选中节点放大
      if (selectedNode === node.id) {
        radius = radius * 2;
      }

      
      // 如果是拖拽中的节点，添加发光效果
      if (node.id === draggingNode) {
        ctx.shadowColor = 'rgba(168, 85, 247, 0.8)';
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

      const isPathNode = highlightedPath.includes(node.id);
      ctx.strokeStyle = isPathNode ? '#22C55E' : hoveredNode === node.id ? '#FFFFFF' : 'rgba(255, 255, 255, 0.3)';
      ctx.lineWidth = isPathNode ? 3 : hoveredNode === node.id ? 2 : 1;
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
        const labelText = '循环论证';
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
  }, [nodes, hoveredNode, selectedNode, searchResults, scale, pan, visibleCategories, hoveredLink, highlightedNodes, portraitsLoaded]);

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

    // 自动计算缩放以确保所有节点可见
    const autoScale = calculateAutoScale(nodes, canvas.width, canvas.height);
    const finalScale = scale || autoScale;
    const canvasX = (x - centerX - pan.x) / scale + centerX;
    const canvasY = (y - centerY - pan.y) / scale + centerY;

    nodes.forEach((node) => {
      const nodeX = centerX + node.x;
      const nodeY = centerY + node.y;
      const distance = Math.sqrt((canvasX - nodeX) ** 2 + (canvasY - nodeY) ** 2);
      const hitRadius = node.id === 'unconscious' ? 18 : 12;
      if (distance < hitRadius) {
        setSelectedNode(selectedNode === node.id ? null : node.id);
        // 标记节点为已学习
        if (selectedNode !== node.id) {
          setCompletedNodes(prev => {
            const newSet = new Set(prev);
            newSet.add(node.id);
            return newSet;
          });
        }
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

  // 拉康概念的循环论证信息
  const lacanCircularLogic: Record<string, any> = {
    'imaginary_order': {
      argumentProcess: '1. 想象界是自我形成的基础 → 2. 自我通过与他人的镜像关系形成 → 3. 镜像关系本身就是想象界的一部分 → 4. 因此自我是由想象界定义的 → 5. 但想象界又由自我的幻想构成 → 回到第1步',
      logicalProblem: '想象界和自我形成循环定义：想象界产生自我，但自我的幻想又构成想象界。这使得两个概念都无法独立定义。',
      circularChain: ['想象界', '自我形成', '镜像关系', '自我幻想', '回到想象界'],
      academicSignificance: '这个循环反映了拉康理论的自反性特征，但也暴露了其在逻辑上的困境。'
    },
    'real_order': {
      argumentProcess: '1. 实在界是超越象征秩序的 → 2. 我们只能通过象征秩序来讨论实在界 → 3. 因此我们讨论的实在界实际上是象征化的 → 4. 这与"实在界超越象征"的定义矛盾 → 5. 所以实在界是不可言说的 → 6. 但这本身就是对实在界的言说',
      logicalProblem: '实在界的定义本身就包含了一个悖论：它被定义为超越语言，但这个定义本身就是语言。',
      circularChain: ['实在界定义', '超越象征秩序', '通过语言讨论', '象征化的实在', '回到定义'],
      academicSignificance: '这个悖论是拉康理论的核心特征，反映了语言与现实之间的根本张力。'
    },
    'mirror_stage': {
      argumentProcess: '1. 婴儿通过镜像识别自己 → 2. 这种识别需要一个观看者（母亲或他人） → 3. 观看者的认可使婴儿形成自我 → 4. 但婴儿必须已经有某种自我意识才能理解镜像 → 5. 所以自我既是镜像的结果，又是镜像的前提',
      logicalProblem: '镜像阶段的解释存在因果循环：自我需要通过镜像形成，但理解镜像又需要已经存在的自我。',
      circularChain: ['镜像识别', '他人认可', '自我形成', '自我意识前提', '回到镜像'],
      academicSignificance: '这个循环反映了身份形成的复杂性，但也表明拉康的解释可能不够严谨。'
    },
    'desire': {
      argumentProcess: '1. 欲望是对缺乏的追求 → 2. 缺乏是由象征秩序产生的 → 3. 象征秩序通过禁止产生缺乏 → 4. 禁止本身产生欲望 → 5. 因此欲望产生缺乏，缺乏产生欲望',
      logicalProblem: '欲望和缺乏形成因果循环：欲望追求缺乏，但缺乏又产生欲望。这使得两者都无法作为独立的原因。',
      circularChain: ['欲望', '追求缺乏', '象征禁止', '缺乏产生', '回到欲望'],
      academicSignificance: '这个循环体现了拉康对欲望本质的深刻洞察，但也暴露了其理论的自反性困境。'
    },
    'lack': {
      argumentProcess: '1. 缺乏是人类主体性的基础 → 2. 主体性通过认识到缺乏而形成 → 3. 但缺乏的存在需要一个主体来感知它 → 4. 因此主体和缺乏互相定义 → 5. 无法确定哪个是原因，哪个是结果',
      logicalProblem: '缺乏和主体性形成循环定义：缺乏产生主体，主体感知缺乏。这使得两者都无法独立解释。',
      circularChain: ['缺乏', '主体形成', '缺乏感知', '主体性确立', '回到缺乏'],
      academicSignificance: '这个循环反映了主体性的复杂性，但也表明拉康的理论框架可能需要进一步的逻辑澄清。'
    },
    'jouissance': {
      argumentProcess: '1. 享乐是超越快乐原则的 → 2. 快乐原则是象征秩序的一部分 → 3. 享乐是对象征秩序的超越 → 4. 但享乐只能通过与快乐原则的对比来定义 → 5. 因此享乐依赖于它试图超越的东西',
      logicalProblem: '享乐的定义包含了一个悖论：它被定义为超越快乐原则，但这个定义本身就依赖于快乐原则。',
      circularChain: ['享乐定义', '超越快乐原则', '象征秩序对比', '依赖快乐原则', '回到定义'],
      academicSignificance: '这个悖论体现了拉康对主体经验的复杂理解，但也表明某些概念可能无法完全逻辑化。'
    },
    'objet_petit_a': {
      argumentProcess: '1. 小客体a是欲望的对象 → 2. 欲望追求小客体a → 3. 但小客体a本身是由欲望产生的 → 4. 因此小客体a既是欲望的原因，又是欲望的结果 → 5. 两者互相定义',
      logicalProblem: '小客体a和欲望形成因果循环：小客体a是欲望的对象，但欲望又产生小客体a。这使得因果关系不清。',
      circularChain: ['小客体a', '欲望对象', '欲望追求', '产生小客体a', '回到开始'],
      academicSignificance: '这个循环反映了拉康对欲望结构的深刻理解，但也表明其理论的自反性特征。'
    },
    'big_other': {
      argumentProcess: '1. 大他者代表象征秩序 → 2. 象征秩序通过大他者的法则维持 → 3. 大他者的权威来自象征秩序 → 4. 因此大他者和象征秩序互相维持 → 5. 无法确定哪个是基础',
      logicalProblem: '大他者和象征秩序形成循环维持：大他者维持象征秩序，象征秩序赋予大他者权威。',
      circularChain: ['大他者', '象征秩序代表', '秩序维持', '权威来源', '回到大他者'],
      academicSignificance: '这个循环反映了权力和秩序的相互构成关系，但也暴露了拉康理论的逻辑困境。'
    },
    'small_other': {
      argumentProcess: '1. 小他者是想象界中的他人 → 2. 想象界通过与小他者的镜像关系形成 → 3. 但小他者本身也是想象界的产物 → 4. 因此想象界和小他者互相定义',
      logicalProblem: '小他者和想象界形成循环定义：小他者形成想象界，想象界又定义小他者。',
      circularChain: ['小他者', '想象界形成', '镜像关系', '他者定义', '回到小他者'],
      academicSignificance: '这个循环反映了主体间性的复杂性，但也表明拉康的理论框架需要进一步的逻辑澄清。'
    },
    'signifier': {
      argumentProcess: '1. 能指代表所指 → 2. 所指是能指所指向的意义 → 3. 但所指只能通过能指来表达 → 4. 因此所指是由能指产生的 → 5. 能指既代表所指，又产生所指',
      logicalProblem: '能指和所指形成循环关系：能指代表所指，但所指又由能指产生。这使得两者的关系不清。',
      circularChain: ['能指', '代表所指', '所指意义', '能指产生', '回到能指'],
      academicSignificance: '这个循环反映了语言的自反性特征，但也表明拉康的符号理论可能需要进一步的澄清。'
    },
    'signified': {
      argumentProcess: '1. 所指是能指的意义 → 2. 意义由使用方式决定 → 3. 使用方式由象征秩序规定 → 4. 象征秩序由能指系统构成 → 5. 因此所指由能指决定，能指又由所指的使用决定',
      logicalProblem: '所指和能指形成循环：所指由能指决定，但能指的使用又由所指的意义决定。',
      circularChain: ['所指', '能指意义', '使用方式', '象征秩序', '回到所指'],
      academicSignificance: '这个循环体现了语言的相互依赖性，但也暴露了拉康理论的自反性困境。'
    },
    'symbolic_chain': {
      argumentProcess: '1. 象征链是能指的连锁 → 2. 每个能指的意义由其在链中的位置决定 → 3. 链的结构由所有能指的相互关系决定 → 4. 但每个能指的意义又依赖于整个链 → 5. 因此能指和链互相定义',
      logicalProblem: '象征链中的能指形成循环定义：每个能指的意义由链决定，但链又由能指构成。',
      circularChain: ['象征链', '能指连锁', '位置意义', '链结构', '回到能指'],
      academicSignificance: '这个循环反映了语言系统的整体性特征，但也表明其逻辑基础可能需要进一步澄清。'
    },
    'subjectivity': {
      argumentProcess: '1. 主体性是对象征秩序的认同 → 2. 象征秩序通过主体的认同维持 → 3. 主体的认同来自象征秩序 → 4. 因此主体性和象征秩序互相维持 → 5. 无法确定哪个是基础',
      logicalProblem: '主体性和象征秩序形成循环维持：主体通过认同秩序而存在，秩序通过主体的认同而维持。',
      circularChain: ['主体性', '象征认同', '秩序维持', '认同来源', '回到主体性'],
      academicSignificance: '这个循环反映了主体和结构的相互构成关系，但也暴露了拉康理论的逻辑困境。'
    }
  };

  let selectedNodeData = selectedNode ? conceptNodes.find((n) => n.id === selectedNode) : null;
  
  // 为拉康概念添加循环论证信息
  if (selectedNodeData && lacanCircularLogic[selectedNode!]) {
    selectedNodeData = {
      ...selectedNodeData,
      hasCircularLogic: true,
      circularLogicExplanation: selectedNodeData.circularLogicExplanation || '该概念存在循环论证问题。',
      ...lacanCircularLogic[selectedNode!]
    };
  }
  const selectedNodeReferences = selectedNode && nodeReferences[selectedNode] ? nodeReferences[selectedNode] : [];
  const selectedNodeRefData = selectedNodeReferences.map(refId => references.find(r => r.id === refId)).filter(Boolean) as Reference[];
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

  // 处理Canvas鼠标按下事件
  const handleCanvasMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - (canvasSize.width / 2 + pan.x)) / scale;
    const y = (e.clientY - rect.top - (canvasSize.height / 2 + pan.y)) / scale;

    // 检查是否点击了节点
    const clickedNode = nodes.find(node => {
      const dx = node.x - x;
      const dy = node.y - y;
      return Math.hypot(dx, dy) < 25; // 节点半径
    });

    if (clickedNode && e.button === 0) { // 左键
      setDraggingNode(clickedNode.id);
      setDragStart({ x: clickedNode.x, y: clickedNode.y });
      e.preventDefault();
    }
  };

  // 处理Canvas鼠标移动事件
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!draggingNode) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = (e.clientX - rect.left - (canvasSize.width / 2 + pan.x)) / scale;
    const y = (e.clientY - rect.top - (canvasSize.height / 2 + pan.y)) / scale;

    // 更新节点位置
    setNodes(prevNodes =>
      prevNodes.map(node =>
        node.id === draggingNode
          ? { ...node, x, y }
          : node
      )
    );
  };

  // 处理Canvas鼠标抬起事件
  const handleCanvasMouseUp = () => {
    setDraggingNode(null);
  };

  
      {/* 庆祝弹窗 */}
      {celebrationPath && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          {/* 背景模糊 */}
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm animate-fadeIn" />
          
          {/* 庆祝弹窗 */}
          <div className="relative bg-gradient-to-br from-primary/20 via-primary/10 to-transparent border-2 border-primary/50 rounded-2xl p-8 text-center max-w-md animate-scaleIn pointer-events-auto">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-2xl font-bold text-foreground mb-2">恭喜完成！</h2>
            <p className="text-lg text-foreground mb-4">
              你已完成 <span className="font-semibold text-primary">{learningPaths[celebrationPath as keyof typeof learningPaths]?.name}</span> 学习路径
            </p>
            <div className="flex justify-center gap-2 mb-4">
              <span className="text-3xl animate-spin">⭐</span>
              <span className="text-3xl animate-pulse">✨</span>
              <span className="text-3xl animate-spin">⭐</span>
            </div>
            <p className="text-sm text-muted-foreground">继续探索更多精神分析理论吧！</p>
          </div>
        </div>
      )}


      return (
    <div className="relative w-full h-full bg-background flex">
      {/* 主要网络图区域 */}
      <div className="flex-1 relative">
        {/* 左侧图例 */}
        <div className="absolute top-4 left-4 bg-card/80 backdrop-blur-sm border border-border rounded-lg z-10">
          <details className="group">
            <summary className="cursor-pointer font-semibold text-sm text-foreground hover:text-primary transition-colors flex items-center gap-2 px-4 py-3 select-none">
              <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
              分类
            </summary>
            <div className="px-4 pb-4 space-y-1 text-xs border-t border-border pt-3">
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
          </details>
          
          {/* 学习路径 */}
          <details className="group border-t border-border">
            <summary className="cursor-pointer font-semibold text-sm text-foreground hover:text-primary transition-colors flex items-center gap-2 px-4 py-3 select-none">
              <ChevronRight className="w-4 h-4 group-open:rotate-90 transition-transform" />
              学习路径
            </summary>
            <div className="px-4 pb-4 space-y-1 text-xs border-t border-border pt-3">
              {Object.entries(learningPaths).map(([key, path]) => (
                <div key={key} className="space-y-1">
                  <div className="flex items-center justify-between gap-2">
                    <button
                      onClick={() => selectLearningPath(key)}
                      className={`flex-1 text-left px-2 py-1 rounded text-xs transition-colors ${
                        activeLearningPath === key
                          ? 'bg-primary/50 text-primary-foreground'
                          : 'bg-secondary/30 hover:bg-secondary/50 text-muted-foreground'
                      }`}
                      title={path.description}
                    >
                      {path.name}
                    </button>
                    {getPathProgress(key) === 100 && (
                      <div className="relative group">
                        <div className="text-lg animate-bounce">🏆</div>
                        <div className="absolute right-0 bottom-full mb-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          已完成
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="px-2 flex items-center gap-2">
                    <div className="flex-1 h-1.5 bg-secondary/30 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary transition-all duration-300"
                        style={{ width: `${getPathProgress(key)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">{getPathProgress(key)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </details>

        </div>

        {/* 搜索框和成就按钮 */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
          {/* 排行榜按黿 */}
          <a
            href="/leaderboard"
            className="flex items-center justify-center p-2 bg-primary/10 backdrop-blur-sm border border-primary/30 rounded-lg hover:bg-primary/20 transition-colors text-primary"
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
            // 左键点击空白区域可以拖拽，右键也可以拖拽
            if (e.button === 2 || (e.button === 0 && !nodes.some(node => {
              const rect = canvasRef.current?.getBoundingClientRect();
              if (!rect) return false;
              const x = (e.clientX - rect.left - (canvasSize.width / 2 + pan.x)) / scale;
              const y = (e.clientY - rect.top - (canvasSize.height / 2 + pan.y)) / scale;
              const dx = node.x - x;
              const dy = node.y - y;
              return Math.hypot(dx, dy) < 25;
            }))) {
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


      </div>

      {/* 右侧侧边栏 */}
      {selectedNode && (
        <div className={`relative bg-card border-l border-border flex flex-col ${selectedNode ? 'w-96' : 'w-0'} overflow-hidden transition-all duration-300`}>
          {/* 选项卡头部 - 仅在选中节点时显示 */}
          {selectedNode && (
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 flex-shrink-0 gap-2">
              <div className="flex gap-2">
                <button
                  onClick={() => setSidebarTab('achievements')}
                  className={`px-3 py-2 text-xs font-medium rounded transition-colors flex items-center gap-1 ${
                    sidebarTab === 'achievements'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-secondary/50 text-foreground hover:bg-secondary'
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
                      : 'bg-secondary/50 text-foreground hover:bg-secondary'
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
          )}

          {/* 悬停预览 - 仅作为tooltip显示，不改变panel宽度 */}
          {hoveredNode && !selectedNode && (() => {
            const hoveredNodeData = conceptNodes.find(n => n.id === hoveredNode);
            return hoveredNodeData ? (
              <div className="fixed bg-card/95 backdrop-blur-sm border border-border rounded-lg p-4 z-20 pointer-events-none shadow-lg" 
                   style={{
                     left: '50%',
                     top: '50%',
                     transform: 'translate(-50%, -50%)',
                     maxWidth: '320px',
                     maxHeight: '400px',
                     overflowY: 'auto'
                   }}>
                <div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{hoveredNodeData.name}</h3>
                  <div className="text-xs font-medium text-muted-foreground mb-2">英文名</div>
                  <div className="text-sm text-foreground mb-4">{hoveredNodeData.nameEn}</div>
                </div>
                
                <div className="border-t border-border pt-4">
                  <div className="text-xs font-medium text-muted-foreground mb-2">简要定义</div>
                  <div className="text-sm text-foreground leading-relaxed">{hoveredNodeData.description}</div>
                </div>

                {hoveredNodeData.definition && (
                  <div className="border-t border-border pt-4">
                    <div className="text-xs font-medium text-muted-foreground mb-2">详细定义</div>
                    <div className="text-sm text-foreground leading-relaxed">{hoveredNodeData.definition}</div>
                  </div>
                )}

                {hoveredNodeData.hasCircularLogic && hoveredNodeData.circularLogicExplanation && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded p-3 mt-4">
                    <div className="text-xs font-medium text-red-500 mb-2">⚠️ 循环论证警示</div>
                    <div className="text-xs text-red-400/90 leading-relaxed">{hoveredNodeData.circularLogicExplanation}</div>
                  </div>
                )}
              </div>
            ) : null;
          })()}

          {/* 成就标签页 */}
          {selectedNode && sidebarTab === 'achievements' && (
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

          {/* 详情标签页 */}
          {selectedNode && sidebarTab === 'details' && (
            <>
              {/* 详情头部 */}
              <div className="flex items-center justify-between p-4 border-b border-border flex-shrink-0">
                <h2 className="text-lg font-semibold text-foreground">
                  {selectedNodeData ? selectedNodeData.name : '选择概念'}
                </h2>
              </div>

              {/* 详情内容 */}
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
              
              <div className="bg-secondary/30 rounded-lg p-3 border border-border/50">
                <div className="text-xs font-medium text-muted-foreground mb-1">英文名</div>
                <div className="text-sm text-foreground italic">{selectedNodeData.nameEn}</div>
                {selectedNodeData.alternativeNames && selectedNodeData.alternativeNames.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-border/30">
                    <div className="text-xs font-medium text-blue-500 mb-1">替代翻译</div>
                    <div className="text-xs text-foreground space-y-1">
                      {selectedNodeData.alternativeNames.map((altName, idx) => (
                        <div key={idx}>• {altName}</div>
                      ))}
                    </div>
                  </div>
                )}
                {selectedNodeData.translationNotes && (
                  <div className="mt-2 pt-2 border-t border-border/30">
                    <div className="text-xs font-medium text-amber-600 mb-1">翻译注记</div>
                    <div className="text-xs text-foreground leading-relaxed">{selectedNodeData.translationNotes}</div>
                  </div>
                )}
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
                <div className="bg-red-500/10 border border-red-500/30 rounded p-4">
                  <button
                    onClick={() => toggleCircularLogic(selectedNode)}
                    className="w-full flex items-center justify-between hover:opacity-80 transition-opacity"
                  >
                    <div className="text-xs font-medium text-red-500 flex items-center gap-2">
                      <span>⚠️ 循环论证警示</span>
                    </div>
                    <span className="text-red-500">{isCircularLogicExpanded(selectedNode) ? '▼' : '▶'}</span>
                  </button>
                  
                  {isCircularLogicExpanded(selectedNode) && (
                    <div className="mt-3 space-y-3">
                      <div className="text-xs text-red-400/90 leading-relaxed">{selectedNodeData.circularLogicExplanation}</div>
                      
                      {/* 论证过程 */}
                      {selectedNodeData.argumentProcess && (
                        <div className="border-t border-red-500/20 pt-3">
                          <div className="text-xs font-medium text-red-500 mb-2">📋 论证过程</div>
                          <div className="text-xs text-red-400/80 leading-relaxed">{selectedNodeData.argumentProcess}</div>
                        </div>
                      )}
                      
                      {/* 逻辑问题 */}
                      {selectedNodeData.logicalProblem && (
                        <div className="border-t border-red-500/20 pt-3">
                          <div className="text-xs font-medium text-red-500 mb-2">🔴 逻辑问题</div>
                          <div className="text-xs text-red-400/80 leading-relaxed">{selectedNodeData.logicalProblem}</div>
                        </div>
                      )}
                      
                      {/* 循环链 */}
                      {selectedNodeData.circularChain && selectedNodeData.circularChain.length > 0 && (
                        <div className="border-t border-red-500/20 pt-3">
                          <div className="text-xs font-medium text-red-500 mb-2">🔄 循环链</div>
                          <div className="flex flex-col gap-2">
                            {selectedNodeData.circularChain.map((step, idx) => (
                              <div key={idx} className="flex items-start gap-2">
                                <span className="text-red-500 font-bold mt-0.5">{idx + 1}.</span>
                                <span className="text-xs text-red-400/80">{step}</span>
                                {idx < selectedNodeData.circularChain.length - 1 && (
                                  <span className="text-red-500 ml-auto">↓</span>
                                )}
                              </div>
                            ))}
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-red-500 font-bold">↻</span>
                              <span className="text-xs text-red-400/80 italic">回到第1步</span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      {/* 学术意义 */}
                      {selectedNodeData.academicSignificance && (
                        <div className="border-t border-red-500/20 pt-3">
                          <div className="text-xs font-medium text-red-500 mb-2">💡 学术意义</div>
                          <div className="text-xs text-red-400/80 leading-relaxed">{selectedNodeData.academicSignificance}</div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* 学派对标 - 可折叠 */}
              {selectedNodeData.schoolPerspectives && Object.keys(selectedNodeData.schoolPerspectives).length > 0 && (
                <CollapsiblePanel
                  id="school"
                  title="学派对标"
                  icon="🏫"
                  isExpanded={isPanelExpanded('school')}
                  onToggle={togglePanel}
                >
                  <SchoolPerspectives concept={selectedNodeData} />
                </CollapsiblePanel>
              )}

              {/* 核心假设 - 可折叠 */}
              {/* 核心假设 - 始终显示 */}
              {selectedNodeData.coreAssumption && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span>💡</span>
                    <span>核心假设</span>
                  </h3>
                  <p className="text-sm text-gray-400 leading-relaxed">{selectedNodeData.coreAssumption}</p>
                </div>
              )}

              {/* 假设链追踪 - 可折叠 */}
              <CollapsiblePanel
                id="chain"
                title="假设链追踪"
                icon="🔗"
                isExpanded={isPanelExpanded('chain')}
                onToggle={togglePanel}
              >
                <AssumptionChainTracer conceptId={selectedNodeData.id} onConceptClick={setSelectedNode} onPathHighlight={handlePathHighlight} />
              </CollapsiblePanel>

              {/* 理论评估 - 始终显示 */}
              {selectedNodeData.falsifiability !== undefined && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span>⭐</span>
                    <span>理论评估</span>
                  </h3>
                  <RatingPanel concept={selectedNodeData} />
                </div>
              )}

              {/* 推荐阅读 - 始终显示 */}
              {selectedNodeRefData.length > 0 && (
                <div className="space-y-2">
                  <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                    <span>📚</span>
                    <span>推荐阅读</span>
                  </h3>
                  <RecommendedReading references={selectedNodeRefData} />
                </div>
              )}

              <div className="pt-2 border-t border-border">
                <div className="text-xs font-medium text-muted-foreground mb-2">分类</div>
                <div className="flex flex-wrap gap-2">
                  <span className="inline-block px-2 py-1 text-xs rounded bg-secondary/50 text-foreground">
                    {categoryLabels[selectedNodeData.category as keyof typeof categoryLabels]}
                  </span>
                  {selectedNodeData.school && (
                    <span 
                      className="inline-block px-2 py-1 text-xs rounded text-white font-medium"
                      style={{
                        backgroundColor: schoolColors[selectedNodeData.school as keyof typeof schoolColors] || '#666'
                      }}
                    >
                      {schoolLabels[selectedNodeData.school as keyof typeof schoolLabels] || selectedNodeData.school}
                    </span>
                  )}
                </div>
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

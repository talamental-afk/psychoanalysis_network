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
  const [userAchievements, setUserAchievements] = useState<Set<string>>(new Set());
  const [userLevel, setUserLevel] = useState(1);
  const [leaderboard, setLeaderboard] = useState<Array<{name: string; level: number; completedPaths: number; achievements: number}>>([])
  const [showAchievementNotification, setShowAchievementNotification] = useState(false);

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

  // 成就定义
  const achievements: Record<string, {name: string; description: string; icon: string; condition: () => boolean}> = {
    first_path: {
      name: '初学者',
      description: '完成第一个学习路径',
      icon: '🌱',
      condition: () => completedPaths.size >= 1
    },
    three_paths: {
      name: '学者',
      description: '完成三个学习路径',
      icon: '📚',
      condition: () => completedPaths.size >= 3
    },
    all_paths: {
      name: '大师',
      description: '完成所有学习路径',
      icon: '👑',
      condition: () => completedPaths.size === 6
    },
    fifty_nodes: {
      name: '探索者',
      description: '学习50个概念',
      icon: '🔍',
      condition: () => completedNodes.size >= 50
    },
    hundred_nodes: {
      name: '精通者',
      description: '学习100个概念',
      icon: '🧠',
      condition: () => completedNodes.size >= 100
    },
    all_nodes: {
      name: '知识之王',
      description: '学习所有概念',
      icon: '👸',
      condition: () => completedNodes.size === conceptNodes.length
    }
  };

  // 计算用户等级
  const calculateUserLevel = () => {
    const pathsCompleted = completedPaths.size;
    const nodesCompleted = completedNodes.size;
    const achievementsCount = Object.keys(achievements).filter(key => achievements[key].condition()).length;
    return Math.floor(1 + (pathsCompleted * 2 + nodesCompleted * 0.1 + achievementsCount * 5) / 10);
  };

  // 更新用户等级
  useEffect(() => {
    setUserLevel(calculateUserLevel());
  }, [completedPaths, completedNodes]);

  // 追踪新解锁的成就
  const [newUnlockedAchievements, setNewUnlockedAchievements] = useState<string[]>([]);

  // 更新成就
  useEffect(() => {
    const newAchievements = new Set<string>();
    const unlockedThisUpdate: string[] = [];
    Object.keys(achievements).forEach(key => {
      if (achievements[key].condition()) {
        newAchievements.add(key);
        if (!userAchievements.has(key)) {
          unlockedThisUpdate.push(key);
        }
      }
    });
    if (unlockedThisUpdate.length > 0) {
      setNewUnlockedAchievements(unlockedThisUpdate);
      setTimeout(() => setNewUnlockedAchievements([]), 3000);
    }
    setUserAchievements(newAchievements);
  }, [completedPaths, completedNodes, userAchievements]);

  // 更新排行榜（模拟数据）
  useEffect(() => {
    const mockLeaderboard = [
      { name: '当前用户', level: userLevel, completedPaths: completedPaths.size, achievements: userAchievements.size },
      { name: '李明', level: 8, completedPaths: 5, achievements: 4 },
      { name: '王芳', level: 7, completedPaths: 4, achievements: 3 },
      { name: '张三', level: 6, completedPaths: 3, achievements: 2 },
      { name: '刘四', level: 5, completedPaths: 2, achievements: 2 },
      { name: '陈五', level: 4, completedPaths: 2, achievements: 1 },
      { name: '周六', level: 3, completedPaths: 1, achievements: 1 },
      { name: '吴七', level: 2, completedPaths: 1, achievements: 0 }
    ].sort((a, b) => b.level - a.level);
    setLeaderboard(mockLeaderboard);
  }, [userLevel, completedPaths, userAchievements]);

  // 标记学习路径为完成
  const completePathHandler = (pathKey: string) => {
    const newCompletedPaths = new Set(completedPaths);
    newCompletedPaths.add(pathKey);
    setCompletedPaths(newCompletedPaths);
  };

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

  // 学习路径定义  // 显示成就解锁通知
  useEffect(() => {
    if (newUnlockedAchievements.length > 0) {
      setShowAchievementNotification(true);
    }
  }, [newUnlockedAchievements]);

  const learningPaths: Record<string, {name: string; description: string; nodes: string[]; difficulty: 'simple' | 'moderate' | 'complex'; badge: string; badgeColor: string}> = {
    beginner: {
      name: '精神分析入门',
      description: '从弗洛伊德的核心概念开始，深入理解人类心理的根本原理',
      difficulty: 'simple',
      badge: '🎓',
      badgeColor: 'from-blue-500 to-blue-600',
      nodes: ['unconscious', 'id', 'ego', 'superego', 'defense_mechanisms', 'repression', 'free_association', 'freud']
    },
    dreams: {
      name: '梦的分析与详解',
      description: '探索梦的神秘世界，深入理解梦的符号体系与潜意欲求',
      difficulty: 'moderate',
      badge: '🌙',
      badgeColor: 'from-purple-500 to-purple-600',
      nodes: ['unconscious', 'dream_analysis', 'condensation', 'displacement', 'manifest_content', 'latent_content', 'wish_fulfillment']
    },
    defense: {
      name: '防御机制学习',
      description: '探索自我的保护机制，理解人体如何需抗内心冲突',
      difficulty: 'simple',
      badge: '🛡️',
      badgeColor: 'from-amber-500 to-amber-600',
      nodes: ['ego', 'defense_mechanisms', 'repression', 'denial', 'projection', 'rationalization', 'sublimation', 'displacement']
    },
    lacan: {
      name: '拉康的符号世界',
      description: '探索拉康的三界理论，重新理解主体性与欲望',
      difficulty: 'complex',
      badge: '✨',
      badgeColor: 'from-pink-500 to-pink-600',
      nodes: ['unconscious', 'symbolic_order', 'imaginary_order', 'real_order', 'mirror_stage', 'lack', 'desire', 'lacan']
    },
    selfpsych: {
      name: '自体心理学探索',
      description: '从自体客体到香莎体，理解人的自我结构与成长',
      difficulty: 'moderate',
      badge: '💎',
      badgeColor: 'from-cyan-500 to-cyan-600',
      nodes: ['self', 'self_object', 'mirroring', 'idealization', 'twinship', 'empathy', 'kohut']
    },
    objectrel: {
      name: '客体关系理论',
      description: '从克莱因到费尔贝恩，探索客体如何塑造人的人格与关系',
      difficulty: 'complex',
      badge: '👑',
      badgeColor: 'from-orange-500 to-orange-600',
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
      
      // 循环论证标签已移除
      
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


  // 弗洛伊德概念的循环论证信息
  const freudCircularLogic: Record<string, any> = {
    'unconscious': {
      argumentProcess: '1. 无意识是不可直接观察的 → 2. 我们通过其效果推断无意识存在 → 3. 但无意识的效果是由无意识本身产生的 → 4. 我们不能独立地验证无意识 → 5. 因此无意识是不可验证的',
      logicalProblem: '无意识是不可直接观察的，但其存在不可验证。我们只能通过推断来认识它，但这个推断本身也是不可验证的。',
      circularChain: ['无意识定义', '不可直接观察', '推断效果', '效果验证', '回到定义'],
      academicSignificance: '这个循环反映了无意识概念的核心困境：它是不可验证的，但我们却不能放弃对它的研究。'
    },
    'id': {
      argumentProcess: '1. 本我是原始的欲望源泉 → 2. 本我由本我的需求驱动 → 3. 需求是本我的效果 → 4. 效果应该来自本我 → 5. 回到第1步',
      logicalProblem: '本我的定义是循环的：本我是欲望的源泉，但欲望本身也是本我的表现。',
      circularChain: ['本我', '原始欲望', '需求源泉', '本我效果', '回到本我'],
      academicSignificance: '这个循环反映了本我概念的核心问题：它是一个自我引用的概念。'
    },
    'ego': {
      argumentProcess: '1. 自我是理性的中介 → 2. 自我平衡本我和超我 → 3. 自我的平衡能力是自我的特性 → 4. 但自我的平衡需要自我已经存在 → 5. 自我既是原因也是结果',
      logicalProblem: '自我的定义是循环的：自我平衡本我和超我，但自我的平衡能力本身需要自我来提供。',
      circularChain: ['自我', '理性中介', '平衡能力', '自我特性', '回到自我'],
      academicSignificance: '这个循环反映了自我概念的核心问题：它是一个自我引用的概念。'
    },
    'superego': {
      argumentProcess: '1. 超我是道德标准的内化 → 2. 道德标准来自社会和父母 → 3. 超我通过内化社会价值而形成 → 4. 但社会价值是由超我的个体上表现 → 5. 超我既是原因也是结果',
      logicalProblem: '超我的形成是循环的：超我是社会价值的内化，但社会价值本身也是由超我的个体上表现的。',
      circularChain: ['超我', '道德内化', '社会价值', '超我表现', '回到超我'],
      academicSignificance: '这个循环反映了道德发展理论的核心问题：超我的根源是不清楚的。'
    },
    'oedipus_complex': {
      argumentProcess: '1. 俄狄浦斯情结是男孩对母亲的欲望 → 2. 这种欲望会导致对父亲的惧怕 → 3. 这种惧怕会不可一世地不存在 → 4. 但不可一世的惧怕是由欲望产生的 → 5. 回到第1步',
      logicalProblem: '俄狄浦斯情结的解释是循环的：惧怕是欲望的结果，但欲望本身也是由惧怕产生的。',
      circularChain: ['欲望', '惧怕产生', '惧怕不可一世', '欲望结果', '回到欲望'],
      academicSignificance: '这个循环反映了俄狄浦斯情结理论的核心问题：它的验证是不可验证的。'
    },
    'defense_mechanisms': {
      argumentProcess: '1. 防御机制是自我保护的方式 → 2. 自我会不自觉地使用防御机制 → 3. 但防御机制是不可觉的 → 4. 我们只能通过其效果推断其存在 → 5. 效果本身也是防御机制的表现',
      logicalProblem: '防御机制的定义是循环的：防御机制是不可觉的，但我们只能通过其不可觉的效果来认识它。',
      circularChain: ['防御机制', '自我保护', '不可觉效果', '效果推断', '回到防御'],
      academicSignificance: '这个循环反映了防御机制概念的核心困境：它是不可直接观察的。'
    },
    'libido': {
      argumentProcess: '1. 力比多是精神能量 → 2. 力比多驱动所有人类行为 → 3. 但力比多是不可直接测量的 → 4. 我们只能通过不同行为来推断力比多 → 5. 行为本身也是力比多的表现',
      logicalProblem: '力比多的定义是循环的：力比多驱动行为，但行为本身也是力比多的表现。',
      circularChain: ['力比多', '精神能量', '行为驱动', '行为表现', '回到力比多'],
      academicSignificance: '这个循环反映了力比多概念的核心问题：它是一个不可验证的概念。'
    }
  };

  // 克莱因概念的循环论证信息
  const kleinCircularLogic: Record<string, any> = {
    'internal_object': {
      argumentProcess: '1. 内部客体是内化的他人形象 → 2. 内部客体通过内摄形成 → 3. 内摄是将外部客体内化的过程 → 4. 但内部客体的存在本身只能通过内摄来推断 → 5. 因此内部客体和内摄相互定义',
      logicalProblem: '内部客体的存在是不可直接观察的。我们通过推断来认识它，但这个推断本身也是基于内部客体的假设。',
      circularChain: ['内化过程', '假设内部客体', '内摄定义', '客体形成', '回到内化'],
      academicSignificance: '这个循环论证反映了客体关系理论中内部心理结构的不可观察性。'
    },
    'good_bad_object': {
      argumentProcess: '1. 婴儿将客体分裂为好或坏 → 2. 这种分裂是防御机制 → 3. 防御机制保护婴儿免受焦虑 → 4. 但焦虑的存在本身只能通过分裂来推断 → 5. 因此分裂既是原因也是结果',
      logicalProblem: '好坏客体的分裂是无法直接观察的。婴儿的行为可能有多种解释，不一定是分裂的证据。',
      circularChain: ['观察到两极化行为', '假设存在分裂', '定义为防御机制', '用行为证明分裂'],
      academicSignificance: '这个循环论证说明了婴儿心理的推断性质，我们无法直接验证内部心理过程。'
    },
    'introjection': {
      argumentProcess: '1. 内摄是将外部客体内化的过程 → 2. 内摄导致内部客体的形成 → 3. 内部客体的存在证明了内摄发生 → 4. 但内部客体是不可观察的 → 5. 因此内摄的存在也是不可验证的',
      logicalProblem: '内摄的过程是无法直接观察的。我们只能通过推断来确认，但这个推断本身就依赖于内摄的假设。',
      circularChain: ['假设内摄过程', '推断内部客体', '客体形成假设', '用客体证明内摄'],
      academicSignificance: '这个循环论证反映了克莱因理论中心理过程的推断性质。'
    },
    'depressive_position': {
      argumentProcess: '1. 抑郁位置是整合好坏客体的阶段 → 2. 整合导致内疚感和修复冲动 → 3. 内疚感证明了整合的发生 → 4. 但内疚感也可能有其他原因 → 5. 因此抑郁位置的存在是不可验证的',
      logicalProblem: '抑郁位置是无法直接观察的。婴儿的行为改变可能有多种解释。',
      circularChain: ['假设抑郁位置', '观察到整合行为', '推断内疚感', '用内疚证明位置'],
      academicSignificance: '这个循环论证说明了克莱因发展阶段理论的推断性质。'
    }
  };

  // 温尼科特概念的循环论证信息
  const winnicottCircularLogic: Record<string, any> = {
    'transitional_object': {
      argumentProcess: '1. 过渡客体帮助儿童从依赖过渡到独立 → 2. 过渡客体既代表母亲又是独立的 → 3. 但这种双重性本身就是循环的 → 4. 我们无法独立验证过渡功能 → 5. 因此过渡客体的功能是推断性的',
      logicalProblem: '过渡客体的存在和功能是无法直接观察的。儿童对物体的依恋可能有多种解释。',
      circularChain: ['观察儿童依恋物体', '假设过渡功能', '定义为过渡客体', '用依恋证明功能'],
      academicSignificance: '这个循环论证反映了温尼科特理论中对儿童心理发展的推断。'
    },
    'true_self': {
      argumentProcess: '1. 真实自体是个体的真实本质 → 2. 真实自体通过抱持环境得到发展 → 3. 但真实自体的存在本身只能通过其表现来推断 → 4. 真实自体和虚假自体的区分是主观的 → 5. 因此真实自体是一个推断性的概念',
      logicalProblem: '真实自体是无法直接观察的。任何自体表现都可能被解释为真实或虚假。',
      circularChain: ['假设真实自体', '观察自体表现', '推断环境影响', '用表现证明真实'],
      academicSignificance: '这个循环论证反映了真实与虚假自体区分的主观性。'
    }
  };

  // 比昂概念的循环论证信息
  const bionCircularLogic: Record<string, any> = {
    'alpha_function': {
      argumentProcess: '1. α功能将β元素转化为可思考的内容 → 2. 这种转化是心理健康的基础 → 3. 但α功能的过程本身是无法直接观察的 → 4. 我们只能通过结果来推断α功能 → 5. 因此α功能是一个推断性的概念',
      logicalProblem: 'α功能的转化过程是无法直接观察的。心理改善可能有多种原因。',
      circularChain: ['假设α功能', '观察心理改善', '推断转化过程', '用改善证明功能'],
      academicSignificance: '这个循环论证反映了比昂理论中心理过程的推断性质。'
    },
    'beta_elements': {
      argumentProcess: '1. β元素是未经消化的原始感受 → 2. β元素导致创伤性反应 → 3. 创伤性反应证明了β元素的存在 → 4. 但创伤性反应也可能有其他原因 → 5. 因此β元素的存在是不可验证的',
      logicalProblem: 'β元素是无法直接观察的。创伤反应可能有多种心理学解释。',
      circularChain: ['观察创伤反应', '假设β元素', '定义为未消化', '用反应证明元素'],
      academicSignificance: '这个循环论证反映了比昂理论中对无法思考内容的推断。'
    },
    'reverie': {
      argumentProcess: '1. 遐想是分析师的无意识共情状态 → 2. 遐想使分析师能够理解患者 → 3. 但遐想的发生本身是无法直接验证的 → 4. 我们只能通过分析效果来推断遐想 → 5. 因此遐想是一个推断性的概念',
      logicalProblem: '遐想的发生是无法直接观察的。分析的有效性可能来自其他因素。',
      circularChain: ['假设遐想状态', '观察分析效果', '推断共情过程', '用效果证明遐想'],
      academicSignificance: '这个循环论证反映了分析师主观体验的推断性质。'
    }
  };

  // 荣格概念的循环论证信息
  const jungCircularLogic: Record<string, any> = {
    'individuation': {
      argumentProcess: '1. 自性化是个体化的过程 → 2. 自性化是了解真实的自我 → 3. 真实的自我是由自性化实现的 → 4. 自性化是自我实现的过程 → 5. 回到第1步',
      logicalProblem: '自性化的定义是循环的：自性化是了解真实的自我，但真实的自我本身也是由自性化定义的。',
      circularChain: ['自性化', '个体化过程', '真实自我', '自我实现', '回到自性化'],
      academicSignificance: '这个循环反映了自性化概念的核心问题：它是一个自我引用的概念。'
    },
    'persona': {
      argumentProcess: '1. 人格面具是社会面具 → 2. 社会面具是个体与社会的协商 → 3. 个体的真实自我是由人格面具所隐藏的 → 4. 但真实自我是由人格面具定义的 → 5. 回到第1步',
      logicalProblem: '人格面具的定义是循环的：人格面具是真实自我的隐藏，但真实自我本身也是由人格面具定义的。',
      circularChain: ['人格面具', '社会面具', '真实自我', '隐藏关系', '回到人格'],
      academicSignificance: '这个循环反映了人格面具概念的核心问题：它是一个自我引用的概念。'
    },
    'shadow': {
      argumentProcess: '1. 阴影是被抱弃的自我部分 → 2. 阴影是个体不接受的 → 3. 个体不接受的部分是由阴影定义的 → 4. 阴影是个体的一部分 → 5. 回到第1步',
      logicalProblem: '阴影的定义是循环的：阴影是被抱弃的部分，但被抱弃的定义本身也是由阴影定义的。',
      circularChain: ['阴影', '被抱弃部分', '个体不接受', '阴影定义', '回到阴影'],
      academicSignificance: '这个循环反映了阴影概念的核心问题：它是一个自我引用的概念。'
    },
    'anima_animus': {
      argumentProcess: '1. 阿尼玛/阿尼姆斯是性别的对立面 → 2. 性别是社会构造的 → 3. 社会构造的性别是由阿尼玛/阿尼姆斯定义的 → 4. 阿尼玛/阿尼姆斯是个体的一部分 → 5. 回到第1步',
      logicalProblem: '阿尼玛/阿尼姆斯的定义是循环的：它们是性别的对立面，但性别本身也是由它们定义的。',
      circularChain: ['阿尼玛/阿尼姆斯', '性别对立', '社会构造', '对立定义', '回到阿尼玛'],
      academicSignificance: '这个循环反映了性别概念的核心问题：它是一个社会构造的概念。'
    },
    'collective_unconscious': {
      argumentProcess: '1. 集体无意识是不可直接观察的 → 2. 我们通过各种文化中的相似性推断其存在 → 3. 但文化相似性也可能来自其他因素 → 4. 我们不能根据相似性验证集体无意识 → 5. 回到第1步',
      logicalProblem: '集体无意识是不可验证的：它是不可直接观察的，但我们却不能放弃对它的研究。',
      circularChain: ['集体无意识', '不可直接观察', '相似性推断', '验证不了', '回到不可观察'],
      academicSignificance: '这个循环反映了集体无意识概念的核心问题：它是一个不可验证的概念。'
    }
  };

  // 费尔贝恩概念的循环论证信息
  const fairbairnCircularLogic: Record<string, any> = {
    'internal_objects_fairbairn': {
      argumentProcess: '1. 内部客体是内化的他人形象 → 2. 内部客体通过内摄形成 → 3. 内摄是将外部客体内化的过程 → 4. 但内部客体的存在本身只能通过内摄来推断 → 5. 因此内部客体和内摄相互定义',
      logicalProblem: '内部客体的存在是不可直接观察的。我们通过推断来认识它，但这个推断本身也是基于内部客体的假设。',
      circularChain: ['内化过程', '假设内部客体', '内摄定义', '客体形成', '回到内化'],
      academicSignificance: '这个循环反映了费尔贝恩理论中，内部客体是一个难以独立验证的概念。'
    },
    'libidinal_object': {
      argumentProcess: '1. 力比多客体是引发渴望的客体 → 2. 渴望是由力比多客体产生的 → 3. 力比多客体的定义就是引发渴望 → 4. 但渴望本身也可能来自其他因素 → 5. 我们无法独立验证力比多客体',
      logicalProblem: '力比多客体的定义是循环的：力比多客体引发渴望，但渴望本身也是力比多客体的定义。',
      circularChain: ['力比多客体', '引发渴望', '渴望产生', '客体定义', '回到客体'],
      academicSignificance: '这个循环反映了费尔贝恩理论中，力比多客体是一个自我引用的概念。'
    },
    'exciting_object': {
      argumentProcess: '1. 激发客体承诺满足 → 2. 但激发客体实际上无法完全满足 → 3. 这种承诺与现实的矛盾产生心理冲突 → 4. 但心理冲突本身就是激发客体的定义 → 5. 激发客体既是原因也是结果',
      logicalProblem: '激发客体的定义是循环的：激发客体承诺满足但无法满足，但这种矛盾本身就是激发客体的特性。',
      circularChain: ['激发客体', '代表承诺', '无法满足', '心理冲突', '回到客体'],
      academicSignificance: '这个循环反映了费尔贝恩理论中，激发客体概念的复杂性。'
    },
    'rejecting_object': {
      argumentProcess: '1. 拒绝客体代表拒绝和排斥 → 2. 拒绝客体通过内化形成 → 3. 内化的拒绝导致自我批评 → 4. 但自我批评本身也是拒绝客体的表现 → 5. 拒绝客体既是原因也是结果',
      logicalProblem: '拒绝客体的定义是循环的：拒绝客体产生自我批评，但自我批评本身也是拒绝客体的效果。',
      circularChain: ['拒绝客体', '代表拒绝', '内化形成', '自我批评', '回到客体'],
      academicSignificance: '这个循环反映了费尔贝恩理论中，拒绝客体与自我批评之间的循环关系。'
    }
  };

  // 科胡特概念的循环论证信息
  const kohutCircularLogic: Record<string, any> = {
    'self_kohut': {
      argumentProcess: '1. 自体是个体的中心结构 → 2. 自体通过自体客体的功能发展 → 3. 自体客体是维持自体的功能 → 4. 但自体客体的存在只能通过自体的需要来推断 → 5. 自体和自体客体相互定义',
      logicalProblem: '自体的定义是循环的：自体通过自体客体发展，但自体客体本身也是由自体的需要定义的。',
      circularChain: ['自体', '需要自体客体', '自体客体功能', '自体发展', '回到自体'],
      academicSignificance: '这个循环反映了科胡特理论中，自体和自体客体之间的相互依赖关系。'
    },
    'selfobject': {
      argumentProcess: '1. 自体客体是自体的延伸 → 2. 自体客体提供必要的心理功能 → 3. 这些功能维持自体的凝聚 → 4. 但自体客体的功能定义本身就是维持自体 → 5. 自体客体既是原因也是结果',
      logicalProblem: '自体客体的定义是循环的：自体客体维持自体，但自体客体的定义就是维持自体。',
      circularChain: ['自体客体', '提供功能', '维持自体', '功能定义', '回到客体'],
      academicSignificance: '这个循环反映了科胡特理论中，自体客体概念的自我引用性。'
    },
    'idealization': {
      argumentProcess: '1. 理想化是将他人理想化 → 2. 理想化提供安全感和方向 → 3. 安全感和方向来自理想化的对象 → 4. 但理想化对象的价值本身就是提供安全感 → 5. 理想化既是原因也是结果',
      logicalProblem: '理想化的定义是循环的：理想化对象提供安全感，但理想化对象的定义就是提供安全感。',
      circularChain: ['理想化', '理想化对象', '提供安全感', '安全感来源', '回到理想化'],
      academicSignificance: '这个循环反映了科胡特理论中，理想化概念的自我引用性。'
    },
    'twinship': {
      argumentProcess: '1. 孪生关系是与他人的相似性 → 2. 相似性产生被理解的感受 → 3. 被理解的感受来自孪生关系 → 4. 但孪生关系的定义就是产生被理解的感受 → 5. 孪生关系既是原因也是结果',
      logicalProblem: '孪生关系的定义是循环的：孪生关系产生被理解的感受，但孪生关系的定义就是产生这种感受。',
      circularChain: ['孪生关系', '相似性', '被理解感受', '关系定义', '回到孪生'],
      academicSignificance: '这个循环反映了科胡特理论中，孪生关系概念的自我引用性。'
    },
    'empathy': {
      argumentProcess: '1. 共情是理解他人内心体验 → 2. 共情是精神分析的基本工具 → 3. 精神分析的有效性来自共情 → 4. 但共情的有效性本身就是通过精神分析来验证的 → 5. 共情和精神分析相互验证',
      logicalProblem: '共情的定义是循环的：共情是精神分析的基础，但共情的有效性又需要通过精神分析来验证。',
      circularChain: ['共情', '精神分析工具', '治疗有效', '共情验证', '回到共情'],
      academicSignificance: '这个循环反映了科胡特理论中，共情作为治疗工具的验证问题。'
    }
  };

  let selectedNodeData = selectedNode ? conceptNodes.find((n) => n.id === selectedNode) : null;
  
  // 为拉康、弗洛伊德、荣格、克莱因、温尼科特、比昂、费尔贝恩、科胡特概念添加循环论证信息
  const circularLogicData = lacanCircularLogic[selectedNode!] || freudCircularLogic[selectedNode!] || jungCircularLogic[selectedNode!] || kleinCircularLogic[selectedNode!] || winnicottCircularLogic[selectedNode!] || bionCircularLogic[selectedNode!] || fairbairnCircularLogic[selectedNode!] || kohutCircularLogic[selectedNode!];
  if (selectedNodeData && circularLogicData) {
    selectedNodeData = {
      ...selectedNodeData,
      hasCircularLogic: true,
      circularLogicExplanation: selectedNodeData.circularLogicExplanation || '该概念存在循环论证问题。',
      argumentProcess: circularLogicData.argumentProcess,
      logicalProblem: circularLogicData.logicalProblem,
      circularChain: circularLogicData.circularChain,
      academicSignificance: circularLogicData.academicSignificance
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
                      <div className="flex items-center gap-2">
                        <span>{path.name}</span>
                        <span className={`px-1.5 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                          path.difficulty === 'simple' ? 'bg-green-500/20 text-green-600' :
                          path.difficulty === 'moderate' ? 'bg-yellow-500/20 text-yellow-600' :
                          'bg-red-500/20 text-red-600'
                        }`}>
                          {path.difficulty === 'simple' ? '简单' :
                           path.difficulty === 'moderate' ? '中等' :
                           '复杂'}
                        </span>
                      </div>
                    </button>
                    {getPathProgress(key) === 100 && (
                      <div className="relative group">
                        <div className={`text-2xl animate-bounce bg-gradient-to-r ${path.badgeColor} bg-clip-text text-transparent drop-shadow-lg`}>
                          {path.badge}
                        </div>
                        <div className="absolute right-0 bottom-full mb-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          已完成
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="px-2 flex items-center gap-2 w-full">
                    <div className="flex-1 h-2 bg-secondary/30 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${path.badgeColor} transition-all duration-300`}
                        style={{ width: `${getPathProgress(key)}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap font-semibold">{getPathProgress(key)}%</span>
                  </div>
                </div>
              ))}
            </div>
          </details>

        </div>

        {/* 搜索框和成就按钮 */}
        <div className="absolute top-4 right-4 z-10 flex items-center gap-3">
          {/* 排行榜按钮 */}
          <button
            onClick={() => setSidebarTab('achievements')}
            className="flex items-center justify-center p-2 bg-primary/10 backdrop-blur-sm border border-primary/30 rounded-lg hover:bg-primary/20 transition-colors text-primary relative group"
            title="查看排行榜"
          >
            <Medal className="w-4 h-4" />
            <div className="absolute right-0 bottom-full mb-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              排行榜
            </div>
          </button>
          {/* 我的成就按钮 */}
          <button
            onClick={() => setSidebarTab('achievements')}
            className="flex items-center justify-center p-2 bg-primary/10 backdrop-blur-sm border border-primary/30 rounded-lg hover:bg-primary/20 transition-colors text-primary relative group"
            title="查看我的成就"
          >
            <Trophy className="w-4 h-4" />
            {userAchievements.size > 0 && (
              <span className="absolute top-0 right-0 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-semibold">
                {userAchievements.size}
              </span>
            )}
            <div className="absolute right-0 bottom-full mb-2 px-2 py-1 bg-primary text-primary-foreground text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
              我的成就
            </div>
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

          {/* 成就和排行榜面板 */}
          {sidebarTab === 'achievements' && (
            <div className="absolute top-16 right-4 w-96 bg-card/95 backdrop-blur-sm border border-border rounded-lg shadow-lg p-4 z-50 max-h-96 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-foreground">我的成就</h3>
                <button
                  onClick={() => setSidebarTab('details')}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              {/* 用户等级和统计 */}
              <div className="bg-primary/10 rounded-lg p-3 mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-semibold text-foreground">用户等级</span>
                  <span className="text-2xl font-bold text-primary">{userLevel}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div className="text-center">
                    <div className="font-semibold text-foreground">{completedPaths.size}</div>
                    <div>完成路径</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-foreground">{completedNodes.size}</div>
                    <div>学习概念</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold text-foreground">{userAchievements.size}</div>
                    <div>获得成就</div>
                  </div>
                </div>
              </div>

              {/* 成就列表 */}
              <div className="space-y-2 mb-4">
                <h4 className="text-sm font-semibold text-foreground">成就</h4>
                {Object.entries(achievements).map(([key, achievement]) => {
                  const isUnlocked = userAchievements.has(key);
                  return (
                    <div
                      key={key}
                      className={`p-2 rounded-lg border transition-all ${
                        isUnlocked
                          ? 'bg-primary/10 border-primary/30'
                          : 'bg-secondary/10 border-secondary/30 opacity-50'
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <span className="text-lg">{achievement.icon}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-xs text-foreground">{achievement.name}</div>
                          <div className="text-xs text-muted-foreground">{achievement.description}</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* 排行榜 */}
              <div>
                <h4 className="text-sm font-semibold text-foreground mb-2">排行榜</h4>
                <div className="space-y-1 text-xs">
                  {leaderboard.map((user, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2 rounded-lg ${
                        user.name === '当前用户'
                          ? 'bg-primary/20 border border-primary/30'
                          : 'bg-secondary/10'
                      }`}
                    >
                      <div className="flex items-center gap-2 flex-1">
                        <span className="font-semibold text-primary w-6 text-center">{index + 1}</span>
                        <span className="text-foreground flex-1">{user.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">Lv.{user.level}</span>
                        <span className="text-muted-foreground text-xs">({user.achievements})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
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
                                {selectedNodeData.circularChain && idx < selectedNodeData.circularChain.length - 1 && (
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

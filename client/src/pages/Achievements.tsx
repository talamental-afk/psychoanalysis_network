import React, { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ChevronLeft, Trophy, BookOpen, Target, Zap } from 'lucide-react';

interface AchievementStats {
  totalPathsCompleted: number;
  totalNodesLearned: number;
  completionPercentage: number;
  averageTimePerPath: string;
}

interface PathAchievement {
  id: string;
  name: string;
  description: string;
  completedAt: string;
  nodesCount: number;
}

export default function Achievements() {
  const [completedPaths, setCompletedPaths] = useState<Set<string>>(new Set());
  const [completedNodes, setCompletedNodes] = useState<Set<string>>(new Set());
  const [stats, setStats] = useState<AchievementStats>({
    totalPathsCompleted: 0,
    totalNodesLearned: 0,
    completionPercentage: 0,
    averageTimePerPath: '0 分钟',
  });

  // 学习路径定义
  const learningPaths: Record<string, { name: string; description: string; nodes: string[] }> = {
    beginner: {
      name: '精神分析入门',
      description: '从基础概念开始，理解精神分析的核心理论',
      nodes: ['unconscious', 'id', 'ego', 'superego', 'defense_mechanisms', 'repression', 'free_association', 'freud'],
    },
    dreams: {
      name: '梦的分析',
      description: '深入理解梦的工作机制和分析方法',
      nodes: ['unconscious', 'dream_analysis', 'condensation', 'displacement', 'manifest_content', 'latent_content', 'wish_fulfillment'],
    },
    defense: {
      name: '防御机制探索',
      description: '全面了解自我的防御机制',
      nodes: ['ego', 'defense_mechanisms', 'repression', 'denial', 'projection', 'rationalization', 'sublimation', 'displacement'],
    },
    lacan: {
      name: '拉康理论入门',
      description: '理解拉康对精神分析的重新解释',
      nodes: ['unconscious', 'symbolic_order', 'imaginary_order', 'real_order', 'mirror_stage', 'lack', 'desire', 'lacan'],
    },
    selfpsych: {
      name: '自体心理学',
      description: '探索科胡特的自体心理学理论',
      nodes: ['self', 'self_object', 'mirroring', 'idealization', 'twinship', 'empathy', 'kohut'],
    },
    objectrel: {
      name: '客体关系理论',
      description: '理解客体关系如何塑造人格',
      nodes: ['object_relations', 'internal_object', 'projective_identification', 'introjection', 'good_bad_object', 'transitional_object', 'klein'],
    },
  };

  // 从localStorage加载数据
  useEffect(() => {
    const savedCompletedPaths = localStorage.getItem('completedPaths');
    const savedCompletedNodes = localStorage.getItem('completedNodes');

    if (savedCompletedPaths) {
      setCompletedPaths(new Set(JSON.parse(savedCompletedPaths)));
    }
    if (savedCompletedNodes) {
      setCompletedNodes(new Set(JSON.parse(savedCompletedNodes)));
    }
  }, []);

  // 计算统计数据
  useEffect(() => {
    const totalCompleted = completedPaths.size;
    const totalLearned = completedNodes.size;
    const totalPaths = Object.keys(learningPaths).length;
    const completionPercentage = Math.round((totalCompleted / totalPaths) * 100);

    setStats({
      totalPathsCompleted: totalCompleted,
      totalNodesLearned: totalLearned,
      completionPercentage,
      averageTimePerPath: totalCompleted > 0 ? `${Math.round(totalLearned / totalCompleted)} 个概念` : '0 个概念',
    });
  }, [completedPaths, completedNodes]);

  // 获取已完成的路径列表
  const getCompletedPathsList = (): PathAchievement[] => {
    return Array.from(completedPaths).map((pathKey) => {
      const path = learningPaths[pathKey as keyof typeof learningPaths];
      return {
        id: pathKey,
        name: path.name,
        description: path.description,
        completedAt: new Date().toLocaleDateString('zh-CN'),
        nodesCount: path.nodes.length,
      };
    });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <a className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
              <ChevronLeft className="w-5 h-5" />
              <span>返回网络图</span>
            </a>
          </Link>
        </div>
      </div>

      {/* 主要内容 */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        {/* 页面标题 */}
        <div className="mb-12">
          <div className="flex items-center gap-3 mb-4">
            <Trophy className="w-8 h-8 text-primary" />
            <h1 className="text-4xl font-bold text-foreground">我的成就</h1>
          </div>
          <p className="text-lg text-muted-foreground">
            追踪你的精神分析学习之旅，展示你已完成的学习路径和掌握的概念
          </p>
        </div>

        {/* 统计卡片 */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          {/* 完成路径数 */}
          <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">完成的学习路径</h3>
              <Trophy className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.totalPathsCompleted}</div>
            <p className="text-xs text-muted-foreground mt-2">共 {Object.keys(learningPaths).length} 条路径</p>
          </div>

          {/* 学习的概念数 */}
          <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">学习的概念</h3>
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.totalNodesLearned}</div>
            <p className="text-xs text-muted-foreground mt-2">个精神分析概念</p>
          </div>

          {/* 完成度 */}
          <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">学习进度</h3>
              <Target className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.completionPercentage}%</div>
            <p className="text-xs text-muted-foreground mt-2">学习路径完成度</p>
          </div>

          {/* 平均概念数 */}
          <div className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-muted-foreground">平均每条路径</h3>
              <Zap className="w-5 h-5 text-primary" />
            </div>
            <div className="text-3xl font-bold text-foreground">{stats.averageTimePerPath.split(' ')[0]}</div>
            <p className="text-xs text-muted-foreground mt-2">个概念</p>
          </div>
        </div>

        {/* 已完成的学习路径 */}
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-6">已完成的学习路径</h2>
          
          {completedPaths.size === 0 ? (
            <div className="bg-card border border-dashed border-border rounded-lg p-12 text-center">
              <Trophy className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
              <h3 className="text-lg font-semibold text-foreground mb-2">还没有完成任何学习路径</h3>
              <p className="text-muted-foreground mb-6">
                返回精神分析网络图，点击节点学习概念，完成学习路径后会在这里显示
              </p>
              <Link href="/">
                <a className="inline-flex items-center gap-2 px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                  <span>开始学习</span>
                </a>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {getCompletedPathsList().map((achievement) => (
                <div
                  key={achievement.id}
                  className="bg-card border border-border rounded-lg p-6 hover:border-primary/50 hover:shadow-lg transition-all"
                >
                  {/* 徽章 */}
                  <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4 mx-auto">
                    <Trophy className="w-8 h-8 text-primary" />
                  </div>

                  {/* 路径名称 */}
                  <h3 className="text-lg font-semibold text-foreground text-center mb-2">
                    {achievement.name}
                  </h3>

                  {/* 路径描述 */}
                  <p className="text-sm text-muted-foreground text-center mb-4">
                    {achievement.description}
                  </p>

                  {/* 统计信息 */}
                  <div className="flex items-center justify-between text-sm mb-4 pt-4 border-t border-border">
                    <span className="text-muted-foreground">包含概念数</span>
                    <span className="font-semibold text-foreground">{achievement.nodesCount}</span>
                  </div>

                  {/* 完成日期 */}
                  <div className="text-xs text-muted-foreground text-center">
                    完成于 {achievement.completedAt}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 未完成的学习路径 */}
        {completedPaths.size < Object.keys(learningPaths).length && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-foreground mb-6">继续探索</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(learningPaths)
                .filter(([key]) => !completedPaths.has(key))
                .map(([key, path]) => (
                  <div
                    key={key}
                    className="bg-card/50 border border-dashed border-border rounded-lg p-6 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-muted rounded-full mb-4">
                      <BookOpen className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-semibold text-foreground mb-2">{path.name}</h3>
                    <p className="text-sm text-muted-foreground mb-4">{path.description}</p>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">{path.nodes.length} 个概念</span>
                      <Link href="/">
                        <a className="text-primary hover:text-primary/80 transition-colors font-medium">
                          开始学习 →
                        </a>
                      </Link>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

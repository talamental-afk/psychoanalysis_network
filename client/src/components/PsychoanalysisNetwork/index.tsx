import { useEffect } from 'react';
import { useNetworkStore } from '../../store/networkStore';
import { useLearningStore } from '../../store/learningStore';
import NetworkCanvas from './Canvas/NetworkCanvas';
import Toolbar from './Toolbar';
import { SidebarContainer } from './Sidebar';

/**
 * 精神分析网络主容器组件
 * 
 * 这是重构后的核心组件，采用了以下优化：
 * 1. 使用 Zustand 进行状态管理，替代原生 useState
 * 2. 将 Canvas 渲染逻辑拆分为独立的渲染器模块
 * 3. 提取交互逻辑为自定义 Hook
 * 4. 创建专业的服务层处理业务逻辑
 * 
 * 该组件现在专注于容器职责，大幅简化了代码复杂度。
 */
export default function PsychoanalysisNetwork() {
  const networkState = useNetworkStore();
  const learningState = useLearningStore();

  // 计算用户等级
  useEffect(() => {
    const level = learningState.calculateUserLevel();
    if (level !== learningState.userLevel) {
      learningState.setUserLevel(level);
    }
  }, [learningState.completedPaths, learningState.completedNodes, learningState.userAchievements]);

  return (
    <div className="flex flex-col h-screen w-screen bg-background">
      {/* 工具栏 */}
      <Toolbar />

      {/* 主容器 */}
      <div className="flex flex-1 overflow-hidden">
        {/* 主画布 */}
        <div className="flex-1 overflow-hidden">
          <NetworkCanvas />
        </div>

        {/* 侧边栏 */}
        <SidebarContainer />
      </div>

      {/* 调试信息（开发环境） */}
      {process.env.NODE_ENV === 'development' && (
        <div className="text-xs text-muted-foreground p-2 border-t border-border">
          <div>缩放: {networkState.scale.toFixed(2)}x | 平移: ({networkState.pan.x.toFixed(1)}, {networkState.pan.y.toFixed(1)})</div>
          <div>选中节点: {networkState.selectedNode || '无'} | 已完成: {learningState.completedNodes.length}</div>
        </div>
      )}
    </div>
  );
}

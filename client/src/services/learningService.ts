import { useLearningStore } from '../store/learningStore';

class LearningService {
  getProgress() {
    const store = useLearningStore.getState();
    return {
      completedNodes: store.completedNodes,
      completedPaths: store.completedPaths,
      userLevel: store.userLevel,
      userAchievements: store.userAchievements,
    };
  }

  completeNode(nodeId: string) {
    const store = useLearningStore.getState();
    store.completeNode(nodeId);
  }

  completePath(pathId: string) {
    const store = useLearningStore.getState();
    store.completePath(pathId);
    // 更新用户等级
    const newLevel = store.calculateUserLevel();
    store.setUserLevel(newLevel);
  }

  unlockAchievement(achievementId: string) {
    const store = useLearningStore.getState();
    store.unlockAchievement(achievementId);
  }

  rateNode(nodeId: string, falsifiability?: number, logical_coherence?: number) {
    const store = useLearningStore.getState();
    store.rateNode(nodeId, falsifiability, logical_coherence);
  }

  getCompletionPercentage(totalConcepts: number = 99): number {
    const store = useLearningStore.getState();
    return Math.round((store.completedNodes.length / totalConcepts) * 100);
  }

  getPathCompletionPercentage(pathNodes: string[]): number {
    const store = useLearningStore.getState();
    const completed = pathNodes.filter((n) => store.completedNodes.includes(n)).length;
    return pathNodes.length > 0 ? Math.round((completed / pathNodes.length) * 100) : 0;
  }

  resetProgress() {
    const store = useLearningStore.getState();
    store.resetProgress();
  }

  getUserStats() {
    const store = useLearningStore.getState();
    return {
      level: store.userLevel,
      completedNodes: store.completedNodes.length,
      completedPaths: store.completedPaths.length,
      achievements: store.userAchievements.length,
    };
  }
}

export const learningService = new LearningService();

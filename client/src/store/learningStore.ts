import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export interface LearningState {
  // 学习进度
  completedNodes: string[];
  completedPaths: string[];
  userLevel: number;
  userAchievements: string[];

  // 用户评分
  nodeRatings: Record<string, { falsifiability?: number; logical_coherence?: number }>;

  // 操作方法
  completeNode: (nodeId: string) => void;
  completePath: (pathId: string) => void;
  unlockAchievement: (achievementId: string) => void;
  rateNode: (nodeId: string, falsifiability?: number, logical_coherence?: number) => void;
  calculateUserLevel: () => number;
  resetProgress: () => void;
  setUserLevel: (level: number) => void;
}

export const useLearningStore = create<LearningState>()(
  devtools(
    persist(
      (set, get) => ({
        // 初始状态
        completedNodes: [],
        completedPaths: [],
        userLevel: 1,
        userAchievements: [],
        nodeRatings: {},

        // 操作方法
        completeNode: (nodeId) =>
          set((state) => {
            if (!state.completedNodes.includes(nodeId)) {
              return {
                completedNodes: [...state.completedNodes, nodeId],
              };
            }
            return state;
          }),

        completePath: (pathId) =>
          set((state) => {
            if (!state.completedPaths.includes(pathId)) {
              return {
                completedPaths: [...state.completedPaths, pathId],
              };
            }
            return state;
          }),

        unlockAchievement: (achievementId) =>
          set((state) => {
            if (!state.userAchievements.includes(achievementId)) {
              return {
                userAchievements: [...state.userAchievements, achievementId],
              };
            }
            return state;
          }),

        rateNode: (nodeId, falsifiability, logical_coherence) =>
          set((state) => ({
            nodeRatings: {
              ...state.nodeRatings,
              [nodeId]: {
                falsifiability,
                logical_coherence,
              },
            },
          })),

        calculateUserLevel: () => {
          const state = get();
          const pathsCompleted = state.completedPaths.length;
          const nodesCompleted = state.completedNodes.length;
          const achievementsCount = state.userAchievements.length;
          return Math.floor(
            1 + (pathsCompleted * 2 + nodesCompleted * 0.1 + achievementsCount * 5) / 10
          );
        },

        setUserLevel: (level) => set({ userLevel: level }),

        resetProgress: () =>
          set({
            completedNodes: [],
            completedPaths: [],
            userLevel: 1,
            userAchievements: [],
            nodeRatings: {},
          }),
      }),
      {
        name: 'learning-store',
      }
    ),
    { name: 'LearningStore' }
  )
);

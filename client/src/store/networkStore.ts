import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { useSidebarStore } from './sidebarStore';

export interface NetworkState {
  // 网络图视图状态
  scale: number;
  pan: { x: number; y: number };
  canvasSize: { width: number; height: number };

  // 交互状态
  selectedNode: string | null;
  hoveredNode: string | null;
  hoveredLink: { source: string; target: string } | null;
  highlightedNodes: string[];
  highlightedLinks: string[];

  // 拖拽状态
  isDragging: boolean;
  draggedNodeId: string | null;
  dragStart: { x: number; y: number };

  // 搜索和过滤
  searchQuery: string;
  searchResults: string[];
  visibleCategories: string[];

  // 操作方法
  setScale: (scale: number) => void;
  setPan: (pan: { x: number; y: number }) => void;
  setCanvasSize: (size: { width: number; height: number }) => void;
  selectNode: (nodeId: string | null) => void;
  hoverNode: (nodeId: string | null) => void;
  hoverLink: (link: { source: string; target: string } | null) => void;
  highlightNodes: (nodeIds: string[]) => void;
  highlightLinks: (linkIds: string[]) => void;
  startDragging: (nodeId: string, position: { x: number; y: number }) => void;
  stopDragging: () => void;
  setSearchQuery: (query: string) => void;
  setSearchResults: (results: string[]) => void;
  toggleCategory: (category: string) => void;
  resetView: () => void;
  clearHighlights: () => void;
}

export const useNetworkStore = create<NetworkState>()(
  devtools(
    persist(
      (set) => ({
        // 初始状态
        scale: 1,
        pan: { x: 0, y: 0 },
        canvasSize: { width: 0, height: 0 },
        selectedNode: null,
        hoveredNode: null,
        hoveredLink: null,
        highlightedNodes: [],
        highlightedLinks: [],
        isDragging: false,
        draggedNodeId: null,
        dragStart: { x: 0, y: 0 },
        searchQuery: '',
        searchResults: [],
        visibleCategories: [
          'core',
          'personality',
          'defense',
          'therapy',
          'phenomena',
          'theorist',
          'lacan',
          'self_psychology',
          'object_relations',
        ],

        // 操作方法
        setScale: (scale) => set({ scale }),
        setPan: (pan) => set({ pan }),
        setCanvasSize: (size) => set({ canvasSize: size }),
        selectNode: (nodeId) => {
          set({ selectedNode: nodeId });
          if (nodeId) {
            // 当选中节点时，自动切换到推导链标签页并确保侧边栏打开
            useSidebarStore.getState().setActiveTab('derivation');
            useSidebarStore.getState().setSidebarOpen(true);
          }
        },
        hoverNode: (nodeId) => set({ hoveredNode: nodeId }),
        hoverLink: (link) => set({ hoveredLink: link }),
        highlightNodes: (nodeIds) => set({ highlightedNodes: nodeIds }),
        highlightLinks: (linkIds) => set({ highlightedLinks: linkIds }),

        startDragging: (nodeId, position) =>
          set({
            isDragging: true,
            draggedNodeId: nodeId,
            dragStart: position,
          }),

        stopDragging: () =>
          set({
            isDragging: false,
            draggedNodeId: null,
          }),

        setSearchQuery: (query) => set({ searchQuery: query }),
        setSearchResults: (results) => set({ searchResults: results }),

        toggleCategory: (category) =>
          set((state) => ({
            visibleCategories: state.visibleCategories.includes(category)
              ? state.visibleCategories.filter((c) => c !== category)
              : [...state.visibleCategories, category],
          })),

        resetView: () =>
          set({
            scale: 1,
            pan: { x: 0, y: 0 },
            selectedNode: null,
            highlightedNodes: [],
          }),

        clearHighlights: () =>
          set({
            highlightedNodes: [],
            highlightedLinks: [],
          }),
      }),
      {
        name: 'network-store',
      }
    ),
    { name: 'NetworkStore' }
  )
);

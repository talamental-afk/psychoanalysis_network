import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

interface SidebarState {
  // 侧边栏标签页
  activeTab: 'details' | 'derivation' | 'achievements';
  setActiveTab: (tab: 'details' | 'derivation' | 'achievements') => void;

  // 侧边栏展开/收起
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // 展开的面板
  expandedPanels: Set<string>;
  togglePanel: (panelId: string) => void;
  isPanelExpanded: (panelId: string) => boolean;
}

export const useSidebarStore = create<SidebarState>()(
  devtools(
    persist(
      (set, get) => ({
        activeTab: 'details',
        setActiveTab: (tab) => set({ activeTab: tab }),

        sidebarOpen: true,
        setSidebarOpen: (open) => set({ sidebarOpen: open }),

        expandedPanels: new Set(['school', 'assumption', 'chain', 'rating', 'reading']),
        togglePanel: (panelId) => {
          const current = get().expandedPanels;
          const newPanels = new Set(current);
          if (newPanels.has(panelId)) {
            newPanels.delete(panelId);
          } else {
            newPanels.add(panelId);
          }
          set({ expandedPanels: newPanels });
        },
        isPanelExpanded: (panelId) => get().expandedPanels.has(panelId),
      }),
      {
        name: 'sidebar-store',
        partialize: (state) => ({
          activeTab: state.activeTab,
          sidebarOpen: state.sidebarOpen,
          expandedPanels: Array.from(state.expandedPanels),
        }),
        merge: (persistedState: any, currentState) => ({
          ...currentState,
          ...persistedState,
          expandedPanels: new Set(persistedState.expandedPanels || []),
        }),
      }
    ),
    { name: 'SidebarStore' }
  )
);

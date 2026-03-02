# psychoanalysis_network 重构指南

## 📋 概述

本指南详细说明如何将重构后的代码集成到您的项目中。重构包括：

1. **Zustand 状态管理** - 替代原生 useState
2. **组件拆分** - 将庞大的 PsychoanalysisNetwork.tsx 拆分为多个模块
3. **服务层** - 创建专业的业务逻辑服务
4. **类型定义** - 完善的 TypeScript 类型系统

## 🚀 快速开始

### 第一步：安装依赖

```bash
cd /path/to/psychoanalysis_network
pnpm add zustand
```

### 第二步：复制新文件

将以下文件复制到您的项目中：

```
client/src/
├── store/
│   ├── networkStore.ts          # 网络图状态管理
│   └── learningStore.ts         # 学习进度状态管理
├── types/
│   └── network.ts               # 网络图相关类型定义
├── services/
│   ├── conceptService.ts        # 概念数据服务
│   └── learningService.ts       # 学习进度服务
└── components/
    └── PsychoanalysisNetwork/
        ├── index.tsx            # 主容器组件（新）
        ├── Canvas/
        │   └── NetworkCanvas.tsx # Canvas 渲染容器（新）
        ├── Toolbar/
        │   ├── index.tsx
        │   ├── SearchBar.tsx
        │   └── ZoomControls.tsx
        ├── renderers/
        │   ├── NodeRenderer.ts   # 节点渲染器
        │   ├── LinkRenderer.ts   # 连线渲染器
        │   └── LabelRenderer.ts  # 标签渲染器
        └── hooks/
            ├── useCanvasInteraction.ts  # Canvas 交互 Hook
            └── useNetworkSearch.ts      # 搜索功能 Hook
```

### 第三步：更新 Home 页面

在 `client/src/pages/Home.tsx` 中，将原来的导入改为：

```typescript
// 旧的导入
// import PsychoanalysisNetwork from '../components/PsychoanalysisNetwork';

// 新的导入
import PsychoanalysisNetwork from '../components/PsychoanalysisNetwork';
```

由于我们保持了相同的导出路径，现有的导入不需要改变。

### 第四步：验证构建

```bash
pnpm build
```

## 📁 文件结构对比

### 原始结构
```
PsychoanalysisNetwork.tsx (1000+ 行)
├── 状态管理 (20+ useState)
├── Canvas 渲染逻辑
├── 交互处理
├── 业务逻辑
└── 副作用管理
```

### 重构后结构
```
PsychoanalysisNetwork/
├── index.tsx (50 行) - 容器组件
├── Canvas/
│   └── NetworkCanvas.tsx (80 行) - 渲染容器
├── Toolbar/ - UI 组件
├── renderers/ - 渲染逻辑
├── hooks/ - 交互逻辑
└── store/ - 状态管理
```

## 🔄 状态管理迁移

### 原始方式（20+ useState）
```typescript
const [scale, setScale] = useState(1);
const [pan, setPan] = useState({ x: 0, y: 0 });
const [selectedNode, setSelectedNode] = useState<string | null>(null);
// ... 更多状态
```

### 新方式（Zustand Store）
```typescript
import { useNetworkStore } from '../store/networkStore';

const { scale, pan, selectedNode, setScale, setPan, selectNode } = useNetworkStore();
```

**优势**：
- 状态集中管理，易于追踪
- 支持时间旅行调试（DevTools）
- 自动持久化到 localStorage
- 更好的性能（避免不必要的重新渲染）

## 🎨 组件拆分详解

### 原始 PsychoanalysisNetwork.tsx

这个 1000+ 行的组件包含了所有逻辑，难以维护和测试。

### 拆分后的模块

#### 1. **NetworkCanvas.tsx** - Canvas 渲染容器
负责 Canvas 的设置和渲染循环。

```typescript
import NetworkCanvas from './Canvas/NetworkCanvas';

// 在主组件中使用
<NetworkCanvas />
```

#### 2. **渲染器模块** - 纯函数
- `NodeRenderer.ts` - 节点绘制
- `LinkRenderer.ts` - 连线绘制
- `LabelRenderer.ts` - 标签绘制

这些模块是纯函数，易于测试和复用。

```typescript
NodeRenderer.render(ctx, nodes, options);
LinkRenderer.render(ctx, nodes, options);
LabelRenderer.render(ctx, nodes, options);
```

#### 3. **Toolbar 组件** - UI 工具栏
- `SearchBar.tsx` - 搜索功能
- `ZoomControls.tsx` - 缩放控制

#### 4. **自定义 Hook** - 逻辑复用
- `useCanvasInteraction.ts` - 处理鼠标/键盘交互
- `useNetworkSearch.ts` - 搜索功能

## 🔧 服务层

### ConceptService
处理概念数据的获取和查询。

```typescript
import { conceptService } from '../services/conceptService';

// 获取所有概念
const allConcepts = await conceptService.getAllConcepts();

// 搜索概念
const results = await conceptService.searchConcepts('梦');

// 获取循环论证的概念
const circularLogic = await conceptService.getCircularLogicConcepts();
```

### LearningService
处理学习进度和成就系统。

```typescript
import { learningService } from '../services/learningService';

// 完成节点
learningService.completeNode('unconscious');

// 完成学习路径
learningService.completePath('dream-analysis');

// 获取完成百分比
const percentage = learningService.getCompletionPercentage();

// 获取用户统计
const stats = learningService.getUserStats();
```

## 📊 类型系统

新的 `types/network.ts` 文件定义了所有类型：

```typescript
export interface Node {
  id: string;
  name: string;
  nameEn: string;
  description: string;
  // ... 更多字段
}

export interface Link {
  source: string;
  target: string;
  type: LinkType;
  strength: number;
}

export type ConceptCategory = 
  | 'core' 
  | 'personality' 
  | 'defense' 
  // ...
```

## 🧪 测试

### 测试 Store
```typescript
import { renderHook, act } from '@testing-library/react';
import { useNetworkStore } from '../store/networkStore';

describe('useNetworkStore', () => {
  it('should update scale', () => {
    const { result } = renderHook(() => useNetworkStore());
    
    act(() => {
      result.current.setScale(2);
    });
    
    expect(result.current.scale).toBe(2);
  });
});
```

### 测试服务
```typescript
import { conceptService } from '../services/conceptService';

describe('conceptService', () => {
  it('should search concepts', async () => {
    const results = await conceptService.searchConcepts('梦');
    expect(results.length).toBeGreaterThan(0);
  });
});
```

## 🔍 调试

### Zustand DevTools
在浏览器控制台中，您可以看到所有状态变化：

```javascript
// 查看当前状态
window.__REDUX_DEVTOOLS_EXTENSION__?.('NetworkStore')
```

### 开发信息
在开发环境中，主组件底部会显示调试信息：
- 当前缩放和平移值
- 选中的节点
- 已完成的节点数

## 🚨 常见问题

### Q: 旧的 PsychoanalysisNetwork.tsx 应该删除吗？
**A**: 是的，一旦新的组件工作正常，就可以删除旧文件。建议先备份。

### Q: 现有的侧边栏组件怎么办？
**A**: 现有的侧边栏组件（如 `SchoolPerspectives.tsx`、`RatingPanel.tsx` 等）仍然可以使用。它们可以通过 Zustand Store 获取所需的状态，而不需要通过 Props 传递。

### Q: 如何添加新的状态？
**A**: 在相应的 Store 文件中添加新的状态字段和操作方法：

```typescript
// store/networkStore.ts
export const useNetworkStore = create<NetworkState>()(
  devtools(
    persist(
      (set) => ({
        // 添加新状态
        newField: 'initial value',
        
        // 添加新操作方法
        setNewField: (value) => set({ newField: value }),
      }),
      { name: 'network-store' }
    ),
    { name: 'NetworkStore' }
  )
);
```

### Q: 如何处理异步操作？
**A**: 使用 Zustand 的异步操作模式：

```typescript
export const useNetworkStore = create<NetworkState>()((set) => ({
  // ...
  fetchData: async () => {
    const data = await fetch('/api/data');
    set({ data });
  },
}));
```

## 📈 性能优化建议

1. **虚拟化渲染** - 对于大量节点，考虑只渲染可见的节点
2. **Web Worker** - 将布局计算移到 Worker 中
3. **代码分割** - 使用动态导入分割大组件
4. **缓存** - 使用 useMemo 缓存计算结果

## 🔗 相关资源

- [Zustand 文档](https://github.com/pmndrs/zustand)
- [React 性能优化](https://react.dev/reference/react/useMemo)
- [Canvas API](https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API)

## 📞 支持

如果您在集成过程中遇到问题，请：

1. 检查控制台错误信息
2. 确保所有依赖已正确安装
3. 验证文件路径和导入语句
4. 查看浏览器 DevTools 中的 Zustand 状态

---

**最后更新**: 2026年3月2日

**版本**: 1.0.0

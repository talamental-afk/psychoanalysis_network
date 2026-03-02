# 推导链视图功能指南

## 📋 功能概述

推导链视图是一个全新的功能模块，用于展示精神分析概念的推导来源和推导过程。它帮助用户理解每个概念是由哪些前置概念推导出来的，形成完整的推导链条。

## 🎯 核心功能

### 1. 直接推导来源
显示直接指向该概念的所有前置概念，包括：
- 概念名称和英文名
- 关系类型（包含、影响、相关、治疗、表现）
- 关系强度（0-1，表示关系的紧密程度）
- 关系描述

### 2. 间接推导来源
显示通过其他概念间接推导出来的前置概念，包括：
- 通过多层推导关系得到的概念
- 随着推导深度增加而递减的关系强度
- 最多显示 10 个最强的间接来源

### 3. 推导路径
展示从基础概念到目标概念的所有可能路径，包括：
- 完整的推导链条（从基础到目标）
- 路径强度（所有关系强度的乘积）
- 路径描述（用箭头连接的概念序列）
- 最多显示 5 个最强的路径

### 4. 推导深度
显示从基础概念到目标概念的最短路径长度，用视觉化的深度条表示。

### 5. 依赖关系
列出该概念依赖的所有其他概念，以网格形式展示。

## 🏗️ 架构设计

### 类型定义 (`types/derivation.ts`)

```typescript
// 推导来源
interface DerivationSource {
  conceptId: string;
  conceptName: string;
  conceptNameEn: string;
  relationshipType: 'contains' | 'influences' | 'relates' | 'treats' | 'manifests';
  relationshipDescription: string;
  strength: number;
}

// 推导链
interface DerivationChain {
  conceptId: string;
  conceptName: string;
  directSources: DerivationSource[];
  indirectSources: DerivationSource[];
  derivationDepth: number;
  derivationPaths: DerivationPath[];
  dependencies: string[];
}

// 推导路径
interface DerivationPath {
  path: string[];
  pathNames: string[];
  strength: number;
  description: string;
}
```

### 服务层 (`services/derivationService.ts`)

提供以下主要方法：

| 方法 | 功能 | 返回值 |
|:---|:---|:---|
| `getDerivationChain()` | 获取完整的推导链信息 | `DerivationChain` |
| `getDerivationTree()` | 获取推导树（用于可视化） | `DerivationTreeNode` |
| `getDerivationAnalysis()` | 获取推导分析统计 | `DerivationAnalysis` |
| `compareDerivations()` | 比较两个概念的推导关系 | 相似度和差异分析 |

### UI 组件

#### DerivationChainViewer (`components/DerivationChain/`)
主要的推导链展示组件，包含：
- 概念头部信息（名称、颜色、描述）
- 核心假设展示
- 推导深度指示
- 可展开/收起的推导来源部分
- 可展开/收起的推导路径部分
- 可展开/收起的依赖关系部分

#### SidebarContainer (`components/PsychoanalysisNetwork/Sidebar/`)
侧边栏容器组件，包含：
- 三个标签页：详情、推导链、成就
- 展开/收起功能
- 响应式设计

#### sidebarStore (`store/sidebarStore.ts`)
侧边栏状态管理，包括：
- 当前活跃标签页
- 侧边栏展开/收起状态
- 展开的面板列表

## 🎨 UI 设计

### 色彩方案
- 背景：深蓝黑色（#0F172A）
- 主色：紫色（#A78BFA）
- 文字：浅色（#F0F9FF）
- 边框：半透明灰色（rgba(148, 163, 184, 0.2)）

### 布局
- 左侧：主画布（精神分析网络图）
- 右侧：侧边栏（推导链视图）
- 侧边栏宽度：400px（可响应式调整）
- 支持展开/收起功能

### 交互
- 点击节点时自动打开侧边栏
- 标签页切换时保留状态
- 可展开/收起各个推导部分
- 鼠标悬停时显示额外信息

## 📊 数据流

```
用户点击节点
    ↓
NetworkStore 更新 selectedNode
    ↓
SidebarContainer 检测到 selectedNode 变化
    ↓
DerivationChainViewer 调用 derivationService.getDerivationChain()
    ↓
Service 分析数据结构，计算推导关系
    ↓
返回 DerivationChain 对象
    ↓
UI 组件渲染推导链信息
```

## 🔧 使用示例

### 在组件中使用推导链服务

```typescript
import { derivationService } from '@/services/derivationService';

// 获取推导链
const chain = await derivationService.getDerivationChain('unconscious');

// 获取推导分析
const analysis = await derivationService.getDerivationAnalysis('unconscious');

// 比较两个概念
const comparison = await derivationService.compareDerivations('id', 'ego');

// 获取推导树
const tree = await derivationService.getDerivationTree('unconscious');
```

### 在 React 组件中使用

```typescript
import { DerivationChainViewer } from '@/components/DerivationChain';

export function MyComponent() {
  const selectedNode = 'unconscious';

  return (
    <DerivationChainViewer 
      conceptId={selectedNode}
      onClose={() => console.log('关闭')}
    />
  );
}
```

## 📈 性能优化

### 优化策略

1. **深度限制**
   - 间接推导来源的深度限制为 3 层
   - 推导路径的深度限制为 10 层

2. **数量限制**
   - 间接来源最多显示 10 个
   - 推导路径最多显示 5 个

3. **缓存机制**
   - 推导链信息可以缓存以避免重复计算
   - 考虑使用 React Query 或 SWR 进行数据缓存

4. **虚拟化渲染**
   - 对于大量依赖关系，考虑使用虚拟滚动

## 🧪 测试

### 单元测试

```typescript
import { derivationService } from '@/services/derivationService';

describe('derivationService', () => {
  it('should get derivation chain', async () => {
    const chain = await derivationService.getDerivationChain('unconscious');
    expect(chain).toBeDefined();
    expect(chain.conceptId).toBe('unconscious');
    expect(chain.directSources).toBeInstanceOf(Array);
  });

  it('should calculate derivation depth', async () => {
    const chain = await derivationService.getDerivationChain('id');
    expect(chain.derivationDepth).toBeGreaterThanOrEqual(0);
  });
});
```

### 集成测试

```typescript
import { render, screen } from '@testing-library/react';
import { DerivationChainViewer } from '@/components/DerivationChain';

describe('DerivationChainViewer', () => {
  it('should render derivation chain', async () => {
    render(<DerivationChainViewer conceptId="unconscious" />);
    
    // 等待加载完成
    const heading = await screen.findByText('无意识');
    expect(heading).toBeInTheDocument();
  });
});
```

## 🚀 扩展功能建议

### 短期（1-2 周）
1. 添加推导链的可视化图表
2. 实现推导链的导出功能（PDF、图片）
3. 添加推导链的搜索和过滤

### 中期（1-3 个月）
1. 实现推导链的对比功能
2. 添加推导链的学习路径推荐
3. 创建推导链的交互式可视化

### 长期（3-6 个月）
1. 支持自定义推导关系
2. 实现推导链的协作编辑
3. 创建推导链的版本历史

## 📚 相关文件

| 文件 | 说明 |
|:---|:---|
| `types/derivation.ts` | 推导链类型定义 |
| `services/derivationService.ts` | 推导链服务层 |
| `components/DerivationChain/` | 推导链 UI 组件 |
| `components/PsychoanalysisNetwork/Sidebar/` | 侧边栏组件 |
| `store/sidebarStore.ts` | 侧边栏状态管理 |

## 🔗 相关资源

- [Zustand 文档](https://github.com/pmndrs/zustand)
- [React 官方文档](https://react.dev)
- [TypeScript 官方文档](https://www.typescriptlang.org)

## 📞 常见问题

### Q: 推导链是如何计算的？
A: 推导链通过分析 `conceptLinks` 数据中的关系来计算。对于每个概念，我们找到所有指向它的链接（直接来源），然后递归地找到这些来源的来源（间接来源）。

### Q: 为什么有些概念没有推导来源？
A: 这些概念是基础概念，不依赖于其他概念而存在。例如，"无意识"是精神分析的基础概念。

### Q: 推导强度是什么意思？
A: 推导强度（0-1）表示两个概念之间关系的紧密程度。1 表示完全依赖，0 表示没有关系。

### Q: 如何添加新的推导关系？
A: 在 `psychoanalysis_data.ts` 的 `conceptLinks` 数组中添加新的链接对象即可。

## 🎓 学习路径

如果您想深入学习推导链功能的实现，建议按以下顺序阅读：

1. `types/derivation.ts` - 了解数据结构
2. `services/derivationService.ts` - 理解计算逻辑
3. `components/DerivationChain/DerivationChainViewer.tsx` - 学习 UI 实现
4. `store/sidebarStore.ts` - 理解状态管理

---

**最后更新**: 2026 年 3 月 2 日

**版本**: 1.0.0

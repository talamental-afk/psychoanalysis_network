/**
 * 推导链相关类型定义
 * 用于展示概念的推导来源和推导过程
 */

export interface DerivationSource {
  conceptId: string;
  conceptName: string;
  conceptNameEn: string;
  relationshipType: 'contains' | 'influences' | 'relates' | 'treats' | 'manifests';
  relationshipDescription: string;
  strength: number; // 0-1，表示关系强度
}

export interface DerivationChain {
  conceptId: string;
  conceptName: string;
  conceptNameEn: string;
  description: string;
  definition?: string;
  category: string;
  level: number;
  color: string;
  
  // 直接推导来源
  directSources: DerivationSource[];
  
  // 间接推导来源（通过其他概念推导）
  indirectSources: DerivationSource[];
  
  // 推导链的深度（从基础概念到该概念的最短路径长度）
  derivationDepth: number;
  
  // 完整的推导路径（从基础概念到该概念的所有可能路径）
  derivationPaths: DerivationPath[];
  
  // 该概念的基础假设
  coreAssumption?: string;
  
  // 该概念依赖的其他概念
  dependencies: string[];
}

export interface DerivationPath {
  path: string[]; // 概念 ID 的数组，从基础概念到目标概念
  pathNames: string[]; // 对应的概念名称
  strength: number; // 整条路径的强度（所有关系强度的乘积）
  description: string; // 路径描述
}

export interface DerivationTreeNode {
  id: string;
  name: string;
  nameEn: string;
  color: string;
  level: number;
  relationshipType?: string;
  relationshipStrength?: number;
  children: DerivationTreeNode[];
}

export interface DerivationAnalysis {
  conceptId: string;
  conceptName: string;
  
  // 推导来源的统计
  totalSources: number;
  directSourceCount: number;
  indirectSourceCount: number;
  
  // 推导强度分析
  averageStrength: number;
  strongestSource: DerivationSource | null;
  
  // 推导路径分析
  shortestPath: number; // 从基础概念到该概念的最短路径长度
  longestPath: number; // 最长路径长度
  totalPaths: number; // 总路径数
  
  // 推导的复杂性
  complexity: 'simple' | 'moderate' | 'complex'; // 基于路径数和深度
}

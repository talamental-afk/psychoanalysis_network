import { conceptNodes, conceptLinks } from '../psychoanalysis_data';
import type {
  DerivationChain,
  DerivationSource,
  DerivationPath,
  DerivationTreeNode,
  DerivationAnalysis,
} from '../types/derivation';

class DerivationService {
  /**
   * 获取概念的推导链信息
   */
  async getDerivationChain(conceptId: string): Promise<DerivationChain | null> {
    const concept = conceptNodes.find((c) => c.id === conceptId);
    if (!concept) return null;

    const directSources = this.getDirectSources(conceptId);
    const indirectSources = this.getIndirectSources(conceptId, directSources);
    const derivationPaths = this.getDerivationPaths(conceptId);
    const derivationDepth = this.calculateDerivationDepth(conceptId);
    const dependencies = this.getDependencies(conceptId);

    return {
      conceptId: concept.id,
      conceptName: concept.name,
      conceptNameEn: concept.nameEn,
      description: concept.description,
      definition: concept.definition,
      category: concept.category,
      level: concept.level,
      color: concept.color,
      directSources,
      indirectSources,
      derivationDepth,
      derivationPaths,
      coreAssumption: concept.coreAssumption,
      dependencies,
    };
  }

  /**
   * 获取直接推导来源（直接指向该概念的链接）
   */
  private getDirectSources(conceptId: string): DerivationSource[] {
    const sources: DerivationSource[] = [];
    const sourceMap = new Map<string, DerivationSource>();
    const currentConcept = conceptNodes.find((c) => c.id === conceptId);
    const currentLevel = currentConcept?.level || 99;

    conceptLinks.forEach((link) => {
      if (link.target === conceptId) {
        const sourceConcept = conceptNodes.find((c) => c.id === link.source);
        // 只有当来源层级更低或相等时才视为推导源（基础推导高级）
        if (sourceConcept && sourceConcept.level <= currentLevel) {
          const key = link.source;
          if (!sourceMap.has(key)) {
            sourceMap.set(key, {
              conceptId: sourceConcept.id,
              conceptName: sourceConcept.name,
              conceptNameEn: sourceConcept.nameEn,
              relationshipType: link.type,
              relationshipDescription: this.getRelationshipDescription(
                link.type,
                sourceConcept.name,
                currentConcept?.name || ''
              ),
              strength: link.strength,
            });
          }
        }
      }
    });

    return Array.from(sourceMap.values()).sort((a, b) => b.strength - a.strength);
  }

  /**
   * 获取间接推导来源（通过其他概念间接推导）
   */
  private getIndirectSources(
    conceptId: string,
    directSources: DerivationSource[]
  ): DerivationSource[] {
    const indirectSources: DerivationSource[] = [];
    const directSourceIds = new Set(directSources.map((s) => s.conceptId));
    const visited = new Set<string>();
    visited.add(conceptId);
    directSourceIds.forEach((id) => visited.add(id));

    const queue: { id: string; depth: number }[] = Array.from(directSourceIds).map((id) => ({
      id,
      depth: 1,
    }));

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;

      if (depth > 3) continue; // 限制间接推导的深度

      const currentConcept = conceptNodes.find((c) => c.id === id);
      const currentLevel = currentConcept?.level || 99;

      conceptLinks.forEach((link) => {
        if (link.target === id && !visited.has(link.source)) {
          const sourceConcept = conceptNodes.find((c) => c.id === link.source);
          // 只有当来源层级更低或相等时才视为推导源
          if (sourceConcept && sourceConcept.level <= currentLevel) {
            visited.add(link.source);
            indirectSources.push({
              conceptId: sourceConcept.id,
              conceptName: sourceConcept.name,
              conceptNameEn: sourceConcept.nameEn,
              relationshipType: link.type,
              relationshipDescription: this.getRelationshipDescription(
                link.type,
                sourceConcept.name,
                conceptNodes.find((c) => c.id === conceptId)?.name || ''
              ),
              strength: link.strength * Math.pow(0.8, depth), // 随着深度增加，强度递减
            });
            queue.push({ id: link.source, depth: depth + 1 });
          }
        }
      });
    }

    return indirectSources
      .filter((s) => !directSourceIds.has(s.conceptId))
      .sort((a, b) => b.strength - a.strength)
      .slice(0, 10); // 限制间接来源的数量
  }

  /**
   * 获取推导路径（从基础概念到目标概念的所有路径）
   */
  private getDerivationPaths(conceptId: string): DerivationPath[] {
    const paths: DerivationPath[] = [];
    const visited = new Set<string>();

    const dfs = (currentId: string, path: string[], pathNames: string[], strength: number) => {
      if (path.length > 10) return; // 限制路径长度

      const currentConcept = conceptNodes.find((c) => c.id === currentId);
      const currentLevel = currentConcept?.level || 99;

      const directSources = conceptLinks
        .filter((link) => {
          if (link.target !== currentId) return false;
          const sourceConcept = conceptNodes.find((c) => c.id === link.source);
          // 基础推导高级：Level 较小的推导 Level 较大的
          return sourceConcept && sourceConcept.level <= currentLevel;
        })
        .map((link) => ({
          sourceId: link.source,
          strength: link.strength,
          type: link.type,
        }));

      if (directSources.length === 0) {
        // 到达基础概念
        paths.push({
          path: path.reverse(),
          pathNames: pathNames.reverse(),
          strength,
          description: this.generatePathDescription(pathNames.reverse()),
        });
        return;
      }

      directSources.forEach(({ sourceId, strength: linkStrength, type }) => {
        if (!visited.has(sourceId) || path.length < 3) {
          const sourceConcept = conceptNodes.find((c) => c.id === sourceId);
          if (sourceConcept) {
            visited.add(sourceId);
            dfs(
              sourceId,
              [...path, sourceId],
              [...pathNames, sourceConcept.name],
              strength * linkStrength
            );
            visited.delete(sourceId);
          }
        }
      });
    };

    const targetConcept = conceptNodes.find((c) => c.id === conceptId);
    if (targetConcept) {
      dfs(conceptId, [conceptId], [targetConcept.name], 1);
    }

    return paths.sort((a, b) => b.strength - a.strength).slice(0, 5);
  }

  /**
   * 计算推导深度（从基础概念到目标概念的最短路径长度）
   */
  private calculateDerivationDepth(conceptId: string): number {
    const visited = new Map<string, number>();
    const queue: { id: string; depth: number }[] = [{ id: conceptId, depth: 0 }];
    visited.set(conceptId, 0);

    while (queue.length > 0) {
      const { id, depth } = queue.shift()!;

      const sources = conceptLinks
        .filter((link) => link.target === id)
        .map((link) => link.source);

      if (sources.length === 0) {
        return depth; // 到达基础概念
      }

      sources.forEach((sourceId) => {
        if (!visited.has(sourceId)) {
          visited.set(sourceId, depth + 1);
          queue.push({ id: sourceId, depth: depth + 1 });
        }
      });
    }

    return 0;
  }

  /**
   * 获取概念的依赖关系
   */
  private getDependencies(conceptId: string): string[] {
    const dependencies = new Set<string>();
    const visited = new Set<string>();

    const dfs = (id: string, depth: number) => {
      if (depth > 5 || visited.has(id)) return;
      visited.add(id);

      conceptLinks.forEach((link) => {
        if (link.target === id) {
          dependencies.add(link.source);
          dfs(link.source, depth + 1);
        }
      });
    };

    dfs(conceptId, 0);
    return Array.from(dependencies);
  }

  /**
   * 获取推导树（用于可视化）
   */
  async getDerivationTree(conceptId: string): Promise<DerivationTreeNode | null> {
    const concept = conceptNodes.find((c) => c.id === conceptId);
    if (!concept) return null;

    const buildTree = (id: string, depth: number): DerivationTreeNode => {
      const node = conceptNodes.find((c) => c.id === id);
      if (!node) {
        return {
          id,
          name: '',
          nameEn: '',
          color: '#000',
          level: 0,
          children: [],
        };
      }

      const children: DerivationTreeNode[] = [];

      if (depth > 0) {
        const sources = conceptLinks
          .filter((link) => link.target === id)
          .sort((a, b) => b.strength - a.strength)
          .slice(0, 3); // 只显示前 3 个最强的来源

        sources.forEach((link) => {
          const sourceNode = conceptNodes.find((c) => c.id === link.source);
          if (sourceNode) {
            children.push({
              ...buildTree(link.source, depth - 1),
              relationshipType: link.type,
              relationshipStrength: link.strength,
            });
          }
        });
      }

      return {
        id: node.id,
        name: node.name,
        nameEn: node.nameEn,
        color: node.color,
        level: node.level,
        children,
      };
    };

    return buildTree(conceptId, 3);
  }

  /**
   * 获取推导分析
   */
  async getDerivationAnalysis(conceptId: string): Promise<DerivationAnalysis | null> {
    const chain = await this.getDerivationChain(conceptId);
    if (!chain) return null;

    const allSources = [...chain.directSources, ...chain.indirectSources];
    const strengths = allSources.map((s) => s.strength);
    const averageStrength = strengths.length > 0 ? strengths.reduce((a, b) => a + b) / strengths.length : 0;

    const paths = chain.derivationPaths;
    const pathLengths = paths.map((p) => p.path.length);

    return {
      conceptId: chain.conceptId,
      conceptName: chain.conceptName,
      totalSources: allSources.length,
      directSourceCount: chain.directSources.length,
      indirectSourceCount: chain.indirectSources.length,
      averageStrength,
      strongestSource: chain.directSources[0] || null,
      shortestPath: pathLengths.length > 0 ? Math.min(...pathLengths) : 0,
      longestPath: pathLengths.length > 0 ? Math.max(...pathLengths) : 0,
      totalPaths: paths.length,
      complexity:
        paths.length > 5 || chain.derivationDepth > 3
          ? 'complex'
          : paths.length > 2
            ? 'moderate'
            : 'simple',
    };
  }

  /**
   * 获取关系描述
   */
  private getRelationshipDescription(
    type: string,
    sourceName: string,
    targetName: string
  ): string {
    const descriptions: Record<string, string> = {
      contains: `${sourceName}包含${targetName}`,
      influences: `${sourceName}影响${targetName}`,
      relates: `${sourceName}与${targetName}相关`,
      treats: `${sourceName}用于治疗${targetName}`,
      manifests: `${sourceName}表现为${targetName}`,
    };
    return descriptions[type] || `${sourceName}与${targetName}有关`;
  }

  /**
   * 生成路径描述
   */
  private generatePathDescription(pathNames: string[]): string {
    if (pathNames.length === 0) return '';
    if (pathNames.length === 1) return pathNames[0];
    return pathNames.join(' → ');
  }

  /**
   * 比较两个概念的推导关系
   */
  async compareDerivations(conceptId1: string, conceptId2: string) {
    const chain1 = await this.getDerivationChain(conceptId1);
    const chain2 = await this.getDerivationChain(conceptId2);

    if (!chain1 || !chain2) return null;

    const commonSources = chain1.dependencies.filter((id) => chain2.dependencies.includes(id));
    const uniqueToFirst = chain1.dependencies.filter((id) => !chain2.dependencies.includes(id));
    const uniqueToSecond = chain2.dependencies.filter((id) => !chain1.dependencies.includes(id));

    return {
      concept1: {
        id: chain1.conceptId,
        name: chain1.conceptName,
      },
      concept2: {
        id: chain2.conceptId,
        name: chain2.conceptName,
      },
      commonSources: commonSources.map((id) => conceptNodes.find((c) => c.id === id)?.name || ''),
      uniqueToFirst: uniqueToFirst.map((id) => conceptNodes.find((c) => c.id === id)?.name || ''),
      uniqueToSecond: uniqueToSecond.map((id) => conceptNodes.find((c) => c.id === id)?.name || ''),
      similarity: commonSources.length / Math.max(chain1.dependencies.length, chain2.dependencies.length),
    };
  }
}

export const derivationService = new DerivationService();

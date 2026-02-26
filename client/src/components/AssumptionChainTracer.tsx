import React, { useMemo } from 'react';
import { conceptNodes, conceptLinks } from '../../../psychoanalysis_data';
import { ChevronRight } from 'lucide-react';

interface AssumptionNode {
  id: string;
  name: string;
  depth: number;
  relationshipType: string;
}

interface AssumptionChainTracerProps {
  conceptId: string;
  onConceptClick?: (conceptId: string) => void;
  onPathHighlight?: (path: string[]) => void;
}

export function AssumptionChainTracer({ conceptId, onConceptClick, onPathHighlight }: AssumptionChainTracerProps) {
  // 构建路径映射，用于追踪从根到任意节点的路径
  const pathMap = useMemo(() => {
    if (!conceptId) return new Map<string, string[]>();

    const paths = new Map<string, string[]>();
    paths.set(conceptId, [conceptId]);

    const visited = new Set<string>();
    const queue: string[] = [conceptId];

    while (queue.length > 0) {
      const id = queue.shift()!;
      if (visited.has(id)) continue;
      visited.add(id);

      const outgoingLinks = conceptLinks.filter(link => link.source === id);
      for (const link of outgoingLinks) {
        if (!paths.has(link.target)) {
          const currentPath = paths.get(id) || [id];
          paths.set(link.target, [...currentPath, link.target]);
          queue.push(link.target);
        }
      }
    }

    return paths;
  }, [conceptId]);

  const assumptionChain = useMemo(() => {
    if (!conceptId) return [];

    const visited = new Set<string>();
    const chain: AssumptionNode[] = [];
    const queue: Array<{ id: string; depth: number; relationshipType: string }> = [
      { id: conceptId, depth: 0, relationshipType: 'root' }
    ];

    while (queue.length > 0) {
      const { id, depth, relationshipType } = queue.shift()!;

      if (visited.has(id) || depth > 3) continue;
      visited.add(id);

      const node = conceptNodes.find(n => n.id === id);
      if (node) {
        chain.push({
          id,
          name: node.name,
          depth,
          relationshipType
        });
      }

      // 找到所有从该概念出发的连接
      const outgoingLinks = conceptLinks.filter(link => link.source === id);
      for (const link of outgoingLinks) {
        if (!visited.has(link.target)) {
          queue.push({
            id: link.target,
            depth: depth + 1,
            relationshipType: link.type || 'related'
          });
        }
      }
    }

    return chain;
  }, [conceptId]);

  if (assumptionChain.length === 0) {
    return null;
  }

  // 按深度分组
  const groupedByDepth = useMemo(() => {
    const groups: Record<number, AssumptionNode[]> = {};
    for (const node of assumptionChain) {
      if (!groups[node.depth]) {
        groups[node.depth] = [];
      }
      groups[node.depth].push(node);
    }
    return groups;
  }, [assumptionChain]);

  const getDepthLabel = (depth: number): string => {
    switch (depth) {
      case 0:
        return '核心假设';
      case 1:
        return '直接推导';
      case 2:
        return '间接推导';
      case 3:
        return '深层推导';
      default:
        return '相关概念';
    }
  };

  const getRelationshipColor = (type: string): string => {
    switch (type) {
      case 'contains':
        return 'from-blue-500/20 to-blue-600/20 border-blue-500/30';
      case 'manifests':
        return 'from-purple-500/20 to-purple-600/20 border-purple-500/30';
      case 'influences':
        return 'from-green-500/20 to-green-600/20 border-green-500/30';
      case 'relates':
        return 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
      case 'root':
        return 'from-amber-500/20 to-amber-600/20 border-amber-500/30';
      case 'treats':
        return 'from-red-500/20 to-red-600/20 border-red-500/30';
      default:
        return 'from-gray-500/20 to-gray-600/20 border-gray-500/30';
    }
  };

  const getRelationshipLabel = (type: string): string => {
    switch (type) {
      case 'contains':
        return '包含';
      case 'manifests':
        return '表现为';
      case 'influences':
        return '影响';
      case 'relates':
        return '相关';
      case 'root':
        return '根源';
      case 'treats':
        return '治疗';
      default:
        return '相关';
    }
  };

  return (
    <div className="space-y-4">
      <div className="text-xs font-semibold text-gray-300 mb-3">🔗 假设链追踪</div>

      {/* 追踪路径可视化 */}
      <div className="space-y-3">
        {Object.entries(groupedByDepth)
          .sort(([a], [b]) => parseInt(a) - parseInt(b))
          .map(([depth, nodes]) => (
            <div key={depth}>
              {/* 深度标签 */}
              <div className="flex items-center gap-2 mb-2">
                <div className="text-xs font-semibold text-gray-400">
                  {getDepthLabel(parseInt(depth))}
                </div>
                {parseInt(depth) > 0 && (
                  <div className="flex-1 h-px bg-gradient-to-r from-gray-600 to-transparent" />
                )}
              </div>

              {/* 该深度的所有概念 */}
              <div className="space-y-2 pl-2">
                {nodes.map((node, idx) => (
                  <div key={node.id} className="flex items-start gap-2">
                    {/* 连接线 */}
                    {parseInt(depth) > 0 && (
                      <div className="flex flex-col items-center pt-1">
                        <div className="w-2 h-2 rounded-full bg-gray-500" />
                        {idx < nodes.length - 1 && (
                          <div className="w-px h-6 bg-gray-600" />
                        )}
                      </div>
                    )}

                    {/* 概念卡片 */}
                    <button
                      onClick={() => {
                        const path = pathMap.get(node.id) || [];
                        onPathHighlight?.(path);
                        onConceptClick?.(node.id);
                      }}
                      className={`flex-1 text-left px-3 py-2 rounded border transition-all hover:scale-105 ${getRelationshipColor(
                        node.relationshipType
                      )} hover:shadow-lg`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-xs font-medium text-gray-200 truncate">
                            {node.name}
                          </div>
                          {parseInt(depth) > 0 && (
                            <div className="text-xs text-gray-500 mt-0.5">
                              {getRelationshipLabel(node.relationshipType)}
                            </div>
                          )}
                        </div>
                        <ChevronRight className="w-3 h-3 text-gray-500 flex-shrink-0" />
                      </div>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
      </div>

      {/* 统计信息 */}
      <div className="text-xs text-gray-500 border-t border-gray-700 pt-2 mt-3">
        <div className="flex justify-between">
          <span>总概念数: {assumptionChain.length}</span>
          <span>最大深度: {Math.max(...Object.keys(groupedByDepth).map(Number))}</span>
        </div>
      </div>

      {/* 说明 */}
      <div className="text-xs text-gray-600 bg-gray-900/30 rounded p-2 border border-gray-800">
        <p>💡 点击任何概念可快速定位到网络图中，追踪深度最多3层</p>
      </div>
    </div>
  );
}

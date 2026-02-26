import React, { useMemo } from 'react';
import { conceptNodes } from '../../../psychoanalysis_data';

interface ConceptQuality {
  id: string;
  name: string;
  falsifiability: number;
  logical_coherence: number;
  avgScore: number;
}

interface TheoryQualityHeatmapProps {
  onConceptClick?: (conceptId: string) => void;
}

export function TheoryQualityHeatmap({ onConceptClick }: TheoryQualityHeatmapProps) {
  const conceptQualities = useMemo(() => {
    return conceptNodes
      .map(node => ({
        id: node.id,
        name: node.name,
        falsifiability: node.falsifiability || 0,
        logical_coherence: node.logical_coherence || 0,
        avgScore: ((node.falsifiability || 0) + (node.logical_coherence || 0)) / 2,
      }))
      .sort((a, b) => b.avgScore - a.avgScore);
  }, []);

  const getHeatmapColor = (score: number): string => {
    // 1-5分映射到颜色
    // 1分（最差）: 深红色
    // 2分: 红色
    // 3分（中等）: 黄色
    // 4分: 浅绿色
    // 5分（最好）: 深绿色
    if (score <= 1.5) return 'bg-red-900';
    if (score <= 2.5) return 'bg-red-700';
    if (score <= 3.5) return 'bg-yellow-600';
    if (score <= 4.5) return 'bg-green-600';
    return 'bg-green-800';
  };

  const getScoreLabel = (score: number): string => {
    if (score <= 1.5) return '极差';
    if (score <= 2.5) return '较差';
    if (score <= 3.5) return '中等';
    if (score <= 4.5) return '较好';
    return '优秀';
  };

  // 按评分分组统计
  const groupedByQuality = useMemo(() => {
    const groups = {
      excellent: conceptQualities.filter(c => c.avgScore > 4),
      good: conceptQualities.filter(c => c.avgScore > 3 && c.avgScore <= 4),
      medium: conceptQualities.filter(c => c.avgScore > 2 && c.avgScore <= 3),
      poor: conceptQualities.filter(c => c.avgScore > 1 && c.avgScore <= 2),
      veryPoor: conceptQualities.filter(c => c.avgScore <= 1),
    };
    return groups;
  }, [conceptQualities]);

  return (
    <div className="space-y-4">
      {/* 统计摘要 */}
      <div className="grid grid-cols-2 gap-2 text-xs">
        <div className="bg-green-900/30 border border-green-700/50 rounded p-2">
          <div className="text-green-400 font-semibold">{groupedByQuality.excellent.length}</div>
          <div className="text-green-300 text-xs">优秀 (&gt;4.0)</div>
        </div>
        <div className="bg-yellow-900/30 border border-yellow-700/50 rounded p-2">
          <div className="text-yellow-400 font-semibold">{groupedByQuality.good.length}</div>
          <div className="text-yellow-300 text-xs">较好 (3-4)</div>
        </div>
        <div className="bg-orange-900/30 border border-orange-700/50 rounded p-2">
          <div className="text-orange-400 font-semibold">{groupedByQuality.medium.length}</div>
          <div className="text-orange-300 text-xs">中等 (2-3)</div>
        </div>
        <div className="bg-red-900/30 border border-red-700/50 rounded p-2">
          <div className="text-red-400 font-semibold">{groupedByQuality.poor.length + groupedByQuality.veryPoor.length}</div>
          <div className="text-red-300 text-xs">较差 (&lt;2)</div>
        </div>
      </div>

      {/* 热力图图例 */}
      <div className="space-y-1">
        <div className="text-xs font-semibold text-gray-300 mb-2">评分分布</div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 bg-red-900 rounded" />
          <span className="text-gray-400">极差 (≤1.5)</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 bg-red-700 rounded" />
          <span className="text-gray-400">较差 (1.5-2.5)</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 bg-yellow-600 rounded" />
          <span className="text-gray-400">中等 (2.5-3.5)</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 bg-green-600 rounded" />
          <span className="text-gray-400">较好 (3.5-4.5)</span>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <div className="w-4 h-4 bg-green-800 rounded" />
          <span className="text-gray-400">优秀 (&gt;4.5)</span>
        </div>
      </div>

      {/* 热力图网格 */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {/* 优秀 */}
        {groupedByQuality.excellent.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-green-400 mb-1">优秀理论</div>
            <div className="space-y-1">
              {groupedByQuality.excellent.map(concept => (
                <button
                  key={concept.id}
                  onClick={() => onConceptClick?.(concept.id)}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-all hover:scale-105 ${getHeatmapColor(concept.avgScore)} hover:opacity-80 text-white`}
                  title={`可证伪性: ${concept.falsifiability}/5, 逻辑自洽性: ${concept.logical_coherence}/5`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{concept.name}</span>
                    <span className="text-xs font-semibold ml-1">{concept.avgScore.toFixed(1)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 较好 */}
        {groupedByQuality.good.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-yellow-400 mb-1">较好理论</div>
            <div className="space-y-1">
              {groupedByQuality.good.map(concept => (
                <button
                  key={concept.id}
                  onClick={() => onConceptClick?.(concept.id)}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-all hover:scale-105 ${getHeatmapColor(concept.avgScore)} hover:opacity-80 text-white`}
                  title={`可证伪性: ${concept.falsifiability}/5, 逻辑自洽性: ${concept.logical_coherence}/5`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{concept.name}</span>
                    <span className="text-xs font-semibold ml-1">{concept.avgScore.toFixed(1)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 中等 */}
        {groupedByQuality.medium.length > 0 && (
          <div>
            <div className="text-xs font-semibold text-orange-400 mb-1">中等理论</div>
            <div className="space-y-1">
              {groupedByQuality.medium.map(concept => (
                <button
                  key={concept.id}
                  onClick={() => onConceptClick?.(concept.id)}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-all hover:scale-105 ${getHeatmapColor(concept.avgScore)} hover:opacity-80 text-white`}
                  title={`可证伪性: ${concept.falsifiability}/5, 逻辑自洽性: ${concept.logical_coherence}/5`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{concept.name}</span>
                    <span className="text-xs font-semibold ml-1">{concept.avgScore.toFixed(1)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 较差 */}
        {(groupedByQuality.poor.length > 0 || groupedByQuality.veryPoor.length > 0) && (
          <div>
            <div className="text-xs font-semibold text-red-400 mb-1">较差理论</div>
            <div className="space-y-1">
              {[...groupedByQuality.poor, ...groupedByQuality.veryPoor].map(concept => (
                <button
                  key={concept.id}
                  onClick={() => onConceptClick?.(concept.id)}
                  className={`w-full text-left px-2 py-1 rounded text-xs transition-all hover:scale-105 ${getHeatmapColor(concept.avgScore)} hover:opacity-80 text-white`}
                  title={`可证伪性: ${concept.falsifiability}/5, 逻辑自洽性: ${concept.logical_coherence}/5`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{concept.name}</span>
                    <span className="text-xs font-semibold ml-1">{concept.avgScore.toFixed(1)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 说明 */}
      <div className="text-xs text-gray-500 border-t border-gray-700 pt-2 mt-2">
        <p>💡 点击概念快速定位到网络图中</p>
        <p>📊 综合评分 = (可证伪性 + 逻辑自洽性) / 2</p>
      </div>
    </div>
  );
}

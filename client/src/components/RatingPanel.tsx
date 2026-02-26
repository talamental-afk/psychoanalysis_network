import React from 'react';
import { ConceptNode } from '../../../psychoanalysis_data';

interface RatingPanelProps {
  concept: ConceptNode | null;
}

export function RatingPanel({ concept }: RatingPanelProps) {
  if (!concept) {
    return null;
  }

  const renderProgressBar = (value: number | undefined, color: string) => {
    const score = value || 0;
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <div key={star} className="flex-1">
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all ${color}`}
                style={{
                  width: `${star <= score ? 100 : 0}%`,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    );
  };

  const getInterpretation = (dimension: 'falsifiability' | 'logical_coherence', score: number | undefined) => {
    if (!score) return '';
    
    if (dimension === 'falsifiability') {
      switch (score) {
        case 1:
          return '该概念无法被证伪，属于非科学理论';
        case 2:
          return '该概念难以被证伪，可证伪性较低';
        case 3:
          return '该概念具有中等的可证伪性';
        case 4:
          return '该概念相对容易被证伪';
        case 5:
          return '该概念容易被证伪，具有高度的科学性';
        default:
          return '';
      }
    } else {
      switch (score) {
        case 1:
          return '该概念存在严重的逻辑矛盾';
        case 2:
          return '该概念存在一定的逻辑矛盾';
        case 3:
          return '该概念逻辑基本自洽';
        case 4:
          return '该概念逻辑较为自洽';
        case 5:
          return '该概念逻辑完全自洽';
        default:
          return '';
      }
    }
  };

  return (
    <div className="p-4 border-t border-gray-700 space-y-4">
      <h4 className="text-sm font-semibold text-gray-300">理论评估</h4>

      {/* 可证伪性 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-300">
            可证伪性
            <span className="text-xs text-gray-500 ml-2">
              (5=易被证伪, 1=无法证伪)
            </span>
          </label>
          <span className="text-sm font-semibold text-yellow-400">
            {concept.falsifiability || 0}/5
          </span>
        </div>
        {renderProgressBar(concept.falsifiability, 'bg-yellow-400')}
        <p className="text-xs text-gray-400">
          {getInterpretation('falsifiability', concept.falsifiability)}
        </p>
      </div>

      {/* 逻辑自洽性 */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-sm text-gray-300">
            逻辑自洽性
            <span className="text-xs text-gray-500 ml-2">
              (5=完全自洽, 1=逻辑混乱)
            </span>
          </label>
          <span className="text-sm font-semibold text-blue-400">
            {concept.logical_coherence || 0}/5
          </span>
        </div>
        {renderProgressBar(concept.logical_coherence, 'bg-blue-400')}
        <p className="text-xs text-gray-400">
          {getInterpretation('logical_coherence', concept.logical_coherence)}
        </p>
      </div>


    </div>
  );
}

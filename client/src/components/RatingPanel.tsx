import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import { ConceptNode } from '../../../psychoanalysis_data';

interface RatingPanelProps {
  concept: ConceptNode | null;
  onRatingChange?: (conceptId: string, ratings: { falsifiability: number; logical_coherence: number }) => void;
}

export function RatingPanel({ concept, onRatingChange }: RatingPanelProps) {
  const [userRatings, setUserRatings] = useState<{
    falsifiability: number;
    logical_coherence: number;
  }>({
    falsifiability: 0,
    logical_coherence: 0,
  });

  const [hoveredFalsifiability, setHoveredFalsifiability] = useState(0);
  const [hoveredCoherence, setHoveredCoherence] = useState(0);

  // 从localStorage加载用户评分
  useEffect(() => {
    if (concept) {
      const savedRatings = localStorage.getItem(`ratings_${concept.id}`);
      if (savedRatings) {
        try {
          const parsed = JSON.parse(savedRatings);
          setUserRatings(parsed);
        } catch {
          setUserRatings({ falsifiability: 0, logical_coherence: 0 });
        }
      } else {
        setUserRatings({ falsifiability: 0, logical_coherence: 0 });
      }
    }
  }, [concept]);

  const handleRatingChange = (dimension: 'falsifiability' | 'logical_coherence', value: number) => {
    if (!concept) return;

    const newRatings = {
      ...userRatings,
      [dimension]: value === userRatings[dimension] ? 0 : value, // 点击相同的星级取消评分
    };

    setUserRatings(newRatings);
    localStorage.setItem(`ratings_${concept.id}`, JSON.stringify(newRatings));

    if (onRatingChange) {
      onRatingChange(concept.id, newRatings);
    }
  };

  const renderStars = (
    currentRating: number,
    hovered: number,
    dimension: 'falsifiability' | 'logical_coherence'
  ) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRatingChange(dimension, star)}
            onMouseEnter={() =>
              dimension === 'falsifiability'
                ? setHoveredFalsifiability(star)
                : setHoveredCoherence(star)
            }
            onMouseLeave={() =>
              dimension === 'falsifiability'
                ? setHoveredFalsifiability(0)
                : setHoveredCoherence(0)
            }
            className="transition-all hover:scale-110"
            title={`评分 ${star}/5`}
          >
            <Star
              size={20}
              className={`${
                star <= (dimension === 'falsifiability' ? hoveredFalsifiability || currentRating : hoveredCoherence || currentRating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'text-gray-400'
              } transition-colors`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (!concept) {
    return (
      <div className="p-4 text-center text-gray-400">
        <p>选择一个概念节点查看评分</p>
      </div>
    );
  }

  return (
    <div className="p-4 border-t border-gray-700">
      <h3 className="text-lg font-semibold mb-4 text-white">{concept.name}</h3>

      {/* 系统评分 */}
      <div className="mb-6 p-3 bg-gray-800 rounded-lg">
        <h4 className="text-sm font-semibold text-gray-300 mb-3">系统评分</h4>

        {/* 可证伪性 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
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
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <div key={star} className="flex-1">
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-yellow-400 transition-all"
                    style={{
                      width: `${star <= (concept.falsifiability || 0) ? 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {concept.falsifiability === 1 && '该概念无法被证伪，属于非科学理论'}
            {concept.falsifiability === 2 && '该概念难以被证伪，可证伪性较低'}
            {concept.falsifiability === 3 && '该概念具有中等的可证伪性'}
            {concept.falsifiability === 4 && '该概念相对容易被证伪'}
            {concept.falsifiability === 5 && '该概念容易被证伪，具有高度的科学性'}
          </p>
        </div>

        {/* 逻辑自洽性 */}
        <div>
          <div className="flex items-center justify-between mb-2">
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
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <div key={star} className="flex-1">
                <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-400 transition-all"
                    style={{
                      width: `${star <= (concept.logical_coherence || 0) ? 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 mt-2">
            {concept.logical_coherence === 1 && '该概念存在严重的逻辑矛盾'}
            {concept.logical_coherence === 2 && '该概念存在一定的逻辑矛盾'}
            {concept.logical_coherence === 3 && '该概念逻辑基本自洽'}
            {concept.logical_coherence === 4 && '该概念逻辑较为自洽'}
            {concept.logical_coherence === 5 && '该概念逻辑完全自洽'}
          </p>
        </div>
      </div>

      {/* 用户评分 */}
      <div className="p-3 bg-gray-900 rounded-lg border border-gray-700">
        <h4 className="text-sm font-semibold text-gray-300 mb-4">您的评分</h4>

        {/* 用户评可证伪性 */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-300">可证伪性</label>
            {userRatings.falsifiability > 0 && (
              <span className="text-sm font-semibold text-yellow-400">
                {userRatings.falsifiability}/5
              </span>
            )}
          </div>
          {renderStars(userRatings.falsifiability, hoveredFalsifiability, 'falsifiability')}
        </div>

        {/* 用户评逻辑自洽性 */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm text-gray-300">逻辑自洽性</label>
            {userRatings.logical_coherence > 0 && (
              <span className="text-sm font-semibold text-blue-400">
                {userRatings.logical_coherence}/5
              </span>
            )}
          </div>
          {renderStars(userRatings.logical_coherence, hoveredCoherence, 'logical_coherence')}
        </div>

        <p className="text-xs text-gray-500 mt-3">
          💡 点击星级进行评分，再次点击相同星级可取消评分
        </p>
      </div>

      {/* 循环论证提示 */}
      {concept.hasCircularLogic && (
        <div className="mt-4 p-3 bg-red-900/20 border border-red-700/50 rounded-lg">
          <p className="text-sm text-red-300 font-semibold mb-2">⚠️ 循环论证警告</p>
          <p className="text-xs text-red-200">{concept.circularLogicExplanation}</p>
        </div>
      )}
    </div>
  );
}

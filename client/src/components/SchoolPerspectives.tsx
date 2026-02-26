import React, { useState } from 'react';
import { ConceptNode } from '../../../psychoanalysis_data';

interface SchoolPerspectivesProps {
  concept: ConceptNode | null;
}

const schoolLabels: Record<string, string> = {
  'freud': '弗洛伊德',
  'lacan': '拉康',
  'jung': '荣格',
  'klein': '克莱因',
  'kohut': '科胡特',
  'winnicott': '温尼科特',
  'bion': '比昂',
  'fairbairn': '费尔贝恩',
  'saussure': '索绪尔'
};

const schoolColors: Record<string, string> = {
  'freud': '#FF6B6B',
  'lacan': '#4ECDC4',
  'jung': '#95E1D3',
  'klein': '#F38181',
  'kohut': '#AA96DA',
  'winnicott': '#FCBAD3',
  'bion': '#A8D8EA',
  'fairbairn': '#FFD3B6',
  'saussure': '#FFAAA5'
};

export function SchoolPerspectives({ concept }: SchoolPerspectivesProps) {
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);

  if (!concept || !concept.schoolPerspectives || Object.keys(concept.schoolPerspectives).length === 0) {
    return null;
  }

  const perspectives = concept.schoolPerspectives;

  return (
    <div className="p-4 border-t border-gray-700 space-y-3">
      <h4 className="text-sm font-semibold text-gray-300">🏫 学派对标</h4>
      <div className="space-y-2">
        {Object.entries(perspectives).map(([school, perspective]) => (
          <div key={school} className="space-y-1">
            <button
              onClick={() => setExpandedSchool(expandedSchool === school ? null : school)}
              className="w-full flex items-center justify-between px-3 py-2 rounded bg-gray-800/50 hover:bg-gray-800 transition-colors"
              style={{
                borderLeft: `3px solid ${schoolColors[school] || '#666'}`
              }}
            >
              <span className="text-sm font-medium text-gray-200">
                {schoolLabels[school] || school}
              </span>
              <span className="text-xs text-gray-400">
                {expandedSchool === school ? '▼' : '▶'}
              </span>
            </button>
            
            {expandedSchool === school && (
              <div className="px-3 py-2 bg-gray-900/50 rounded text-xs text-gray-300 leading-relaxed">
                {perspective}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

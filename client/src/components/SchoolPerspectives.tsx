import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

interface SchoolPerspectivesProps {
  concept: {
    name: string;
    schoolPerspectives?: Record<string, string>;
  };
}

export function SchoolPerspectives({ concept }: SchoolPerspectivesProps) {
  const [expandedSchools, setExpandedSchools] = useState<Set<string>>(new Set());

  if (!concept.schoolPerspectives || Object.keys(concept.schoolPerspectives).length === 0) {
    return null;
  }

  const toggleSchool = (school: string) => {
    const newExpanded = new Set(expandedSchools);
    if (newExpanded.has(school)) {
      newExpanded.delete(school);
    } else {
      newExpanded.add(school);
    }
    setExpandedSchools(newExpanded);
  };

  const schoolLabels: Record<string, string> = {
    freud: '弗洛伊德',
    lacan: '拉康',
    jung: '荣格',
    klein: '克莱因',
    winnicott: '温尼科特',
    bion: '比昂',
    fairbairn: '费尔贝恩',
    kohut: '科胡特'
  };

  return (
    <div className="p-4 border-t border-gray-700 space-y-2">
      <h4 className="text-sm font-semibold text-gray-300">🎓 学派对标</h4>
      <div className="space-y-2">
        {Object.entries(concept.schoolPerspectives).map(([school, perspective]) => (
          <div key={school} className="border border-gray-600/30 rounded">
            <button
              onClick={() => toggleSchool(school)}
              className="w-full flex items-center justify-between p-2 hover:bg-gray-800/30 transition-colors"
            >
              <span className="text-xs font-medium text-gray-300">
                {schoolLabels[school] || school}
              </span>
              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  expandedSchools.has(school) ? 'rotate-180' : ''
                }`}
              />
            </button>
            {expandedSchools.has(school) && (
              <div className="px-3 py-2 bg-gray-800/20 border-t border-gray-600/30 text-xs text-gray-300 leading-relaxed">
                {perspective}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

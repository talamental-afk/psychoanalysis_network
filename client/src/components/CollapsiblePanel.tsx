import React from 'react';
import { ChevronDown } from 'lucide-react';

interface CollapsiblePanelProps {
  id: string;
  title: string;
  icon?: string;
  isExpanded: boolean;
  onToggle: (id: string) => void;
  children: React.ReactNode;
  className?: string;
}

export function CollapsiblePanel({
  id,
  title,
  icon,
  isExpanded,
  onToggle,
  children,
  className = ''
}: CollapsiblePanelProps) {
  return (
    <div className={`border-t border-gray-700 ${className}`}>
      <button
        onClick={() => onToggle(id)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-gray-800/50 transition-colors"
      >
        <h4 className="text-sm font-semibold text-gray-300">
          {icon && <span className="mr-2">{icon}</span>}
          {title}
        </h4>
        <ChevronDown
          size={16}
          className={`text-gray-400 transition-transform ${
            isExpanded ? 'rotate-0' : '-rotate-90'
          }`}
        />
      </button>
      {isExpanded && (
        <div className="px-4 pb-4">
          {children}
        </div>
      )}
    </div>
  );
}

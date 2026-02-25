import React from 'react';

interface Reference {
  id: string;
  title: string;
  author?: string;
  year?: number;
  url?: string;
  type: 'book' | 'paper' | 'website' | 'article';
  doubanUrl?: string;
  scholarUrl?: string;
}

interface RecommendedReadingProps {
  references: Reference[];
}

export const RecommendedReading: React.FC<RecommendedReadingProps> = ({ references }) => {
  if (references.length === 0) return null;

  return (
    <div className="pt-2 border-t border-border">
      <div className="text-xs font-medium text-muted-foreground mb-3">推荐阅读</div>
      <div className="space-y-1.5">
        {references.map(ref => (
          <div key={ref.id} className="text-xs leading-relaxed">
            <div className="flex items-start gap-2">
              <span className="text-blue-400 mt-0.5 flex-shrink-0">•</span>
              <div className="flex-1 min-w-0">
                {ref.url ? (
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 hover:underline break-words"
                  >
                    {ref.title}
                  </a>
                ) : (
                  <span className="text-foreground">{ref.title}</span>
                )}
                <div className="text-muted-foreground text-xs mt-0.5">
                  {ref.author && <span>{ref.author}</span>}
                  {ref.author && ref.year && <span> • </span>}
                  {ref.year && <span>{ref.year}年</span>}
                  {ref.type && (
                    <span className="ml-2 inline-block px-1.5 py-0.5 bg-secondary/50 rounded text-xs">
                      {ref.type === 'book' ? '书籍' : ref.type === 'paper' ? '论文' : '其他'}
                    </span>
                  )}
                </div>
                {(ref.doubanUrl || ref.scholarUrl) && (
                  <div className="flex gap-2 mt-1.5 flex-wrap">
                    {ref.doubanUrl && (
                      <a
                        href={ref.doubanUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-2 py-1 text-xs bg-green-500/20 text-green-400 hover:text-green-300 hover:bg-green-500/30 rounded transition-colors"
                      >
                        豆瓣
                      </a>
                    )}
                    {ref.scholarUrl && (
                      <a
                        href={ref.scholarUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block px-2 py-1 text-xs bg-blue-500/20 text-blue-400 hover:text-blue-300 hover:bg-blue-500/30 rounded transition-colors"
                      >
                        Google Scholar
                      </a>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import { useState, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useNetworkStore } from '../../../store/networkStore';
import { useNetworkSearch } from '../hooks/useNetworkSearch';
import { conceptNodes } from '../../../psychoanalysis_data';

export function SearchBar() {
  const { searchQuery, setSearchQuery, setSearchResults, selectNode } = useNetworkStore();
  const searchResults = useNetworkSearch(searchQuery, conceptNodes);

  const handleSearch = useCallback(
    (query: string) => {
      setSearchQuery(query);
      setSearchResults(useNetworkSearch(query, conceptNodes));
    },
    [setSearchQuery, setSearchResults]
  );

  const handleClear = useCallback(() => {
    setSearchQuery('');
    setSearchResults([]);
  }, [setSearchQuery, setSearchResults]);

  const handleSelectResult = useCallback(
    (nodeId: string) => {
      selectNode(nodeId);
      handleClear();
    },
    [selectNode, handleClear]
  );

  return (
    <div className="relative flex-1 max-w-md">
      <div className="flex items-center bg-card border border-border rounded-lg">
        <Search className="w-4 h-4 ml-3 text-muted-foreground" />
        <input
          type="text"
          placeholder="搜索概念..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          className="flex-1 px-3 py-2 bg-transparent text-foreground placeholder-muted-foreground outline-none"
        />
        {searchQuery && (
          <button
            onClick={handleClear}
            className="mr-2 p-1 hover:bg-secondary rounded"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 搜索结果下拉 */}
      {searchResults.length > 0 && (
        <div className="absolute top-full mt-2 w-full bg-card border border-border rounded-lg shadow-lg z-50">
          {searchResults.slice(0, 5).map((nodeId) => {
            const node = conceptNodes.find((n) => n.id === nodeId);
            return (
              <button
                key={nodeId}
                onClick={() => handleSelectResult(nodeId)}
                className="w-full px-3 py-2 text-left hover:bg-secondary text-foreground text-sm"
              >
                <div className="font-medium">{node?.name}</div>
                <div className="text-xs text-muted-foreground">{node?.nameEn}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

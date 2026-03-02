import { useCallback, useMemo } from 'react';
import type { Node } from '../../../types/network';

export function useNetworkSearch(query: string, nodes: Node[]) {
  const results = useMemo(() => {
    if (!query.trim()) return [];

    const q = query.toLowerCase();
    return nodes
      .filter(
        (node) =>
          node.name.toLowerCase().includes(q) ||
          node.nameEn.toLowerCase().includes(q) ||
          node.description.toLowerCase().includes(q)
      )
      .map((node) => node.id);
  }, [query, nodes]);

  return results;
}

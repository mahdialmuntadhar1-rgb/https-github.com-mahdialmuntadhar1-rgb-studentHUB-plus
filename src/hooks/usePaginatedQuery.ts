import { useState, useEffect, useCallback } from 'react';

export interface PaginatedResponse<T> {
  data: T[];
  hasMore: boolean;
  nextCursor?: string;
}

export function usePaginatedQuery<T>(
  fetchFn: (cursor?: string, limit?: number) => Promise<PaginatedResponse<T>>,
  limit = 10
) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<string | undefined>(undefined);

  const fetchNextPage = useCallback(async (reset = false) => {
    if (isLoading) return;
    if (!reset && !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const currentCursor = reset ? undefined : nextCursor;
      const result = await fetchFn(currentCursor, limit);
      
      setData((prev) => (reset ? result.data : [...prev, ...result.data]));
      setHasMore(result.hasMore);
      setNextCursor(result.nextCursor);
    } catch (err: any) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [fetchFn, limit, nextCursor, hasMore, isLoading]);

  const refresh = useCallback(async () => {
    setData([]);
    setHasMore(true);
    setNextCursor(undefined);
    await fetchNextPage(true);
  }, [fetchNextPage]);

  // Initial load
  useEffect(() => {
    refresh();
  }, [limit]); // note: intentionally omitted refresh from dependency to avoid loop, user will call refresh manually if fetchFn changes.

  return {
    data,
    setData,
    isLoading,
    error,
    hasMore,
    fetchNextPage,
    refresh,
  };
}

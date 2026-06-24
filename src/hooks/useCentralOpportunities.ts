import { useEffect, useState } from 'react';
import { fetchOpportunities, type Opportunity, type OpportunityCategory } from '../lib/apiClient';

export function useCentralOpportunities(category?: OpportunityCategory, limit = 20) {
  const [items, setItems] = useState<Opportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let alive = true;

    setLoading(true);
    setError('');

    fetchOpportunities({ category, limit })
      .then((nextItems) => {
        if (!alive) return;
        setItems(nextItems);
      })
      .catch((err) => {
        if (!alive) return;
        setError(err instanceof Error ? err.message : String(err));
        setItems([]);
      })
      .finally(() => {
        if (!alive) return;
        setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [category, limit]);

  return { items, loading, error };
}

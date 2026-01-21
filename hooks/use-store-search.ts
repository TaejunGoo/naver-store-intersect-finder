import useSWRMutation from 'swr/mutation';

import { SearchResponse } from '@/types';

interface SearchArgs {
  keywords: string[]
  display?: number
}

async function searchStores(
  url: string,
  { arg }: { arg: SearchArgs },
): Promise<SearchResponse> {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(arg),
  });

  if (!response.ok) {
    const data = await response.json();
    throw new Error(data.error || 'Search failed');
  }

  return response.json();
}

export function useStoreSearch() {
  const { trigger, data, error, isMutating, reset } = useSWRMutation(
    '/api/search',
    searchStores,
  );

  const search = async (keywords: string[]) => {
    return trigger({ keywords });
  };

  return {
    search,
    data,
    error: error?.message || null,
    isLoading: isMutating,
    reset,
  };
}

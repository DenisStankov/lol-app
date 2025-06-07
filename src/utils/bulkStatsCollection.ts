interface BulkCollectionParams {
  patches?: string[];
  ranks?: string[];
  regions?: string[];
}

interface CollectionStatus {
  total: number;
  completed: number;
  failed: number;
  inProgress: number;
  errors: string[];
}

interface BulkCollectionResponse {
  message: string;
  status: CollectionStatus;
}

export async function collectBulkChampionStats(params: BulkCollectionParams = {}): Promise<BulkCollectionResponse> {
  try {
    const response = await fetch('/api/bulk-champion-stats', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to collect bulk stats');
    }

    return response.json();
  } catch (error) {
    console.error('Error collecting bulk stats:', error);
    throw error;
  }
}

// Example usage:
/*
import { collectBulkChampionStats } from '@/utils/bulkStatsCollection';

// Collect all stats (all patches, ranks, and regions)
await collectBulkChampionStats();

// Collect specific stats
await collectBulkChampionStats({
  ranks: ['CHALLENGER', 'DIAMOND'],
  regions: ['na', 'euw'],
  patches: ['14.4.1']
});
*/ 
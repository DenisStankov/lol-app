'use client';

import { useState } from 'react';
import { collectBulkChampionStats } from '@/utils/bulkStatsCollection';

interface BulkCollectionButtonProps {
  patches?: string[];
  ranks?: string[];
  regions?: string[];
  className?: string;
}

export function BulkCollectionButton({
  patches,
  ranks,
  regions,
  className = ''
}: BulkCollectionButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [status, setStatus] = useState<{
    total: number;
    completed: number;
    failed: number;
    inProgress: number;
    errors: string[];
  } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleCollection = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await collectBulkChampionStats({
        patches,
        ranks,
        regions
      });
      
      setStatus(response.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to collect stats');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <button
        onClick={handleCollection}
        disabled={isLoading}
        className={`px-4 py-2 font-semibold text-white bg-blue-500 rounded-lg hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed ${className}`}
      >
        {isLoading ? 'Collecting...' : 'Collect Champion Stats'}
      </button>

      {status && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h3 className="font-semibold">Collection Status:</h3>
          <div className="mt-2 space-y-1">
            <p>Total: {status.total}</p>
            <p>Completed: {status.completed}</p>
            <p>Failed: {status.failed}</p>
            <p>In Progress: {status.inProgress}</p>
            {status.errors.length > 0 && (
              <div className="mt-2">
                <p className="font-semibold">Errors:</p>
                <ul className="list-disc list-inside">
                  {status.errors.map((error, index) => (
                    <li key={index} className="text-red-600">{error}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded-lg">
          {error}
        </div>
      )}
    </div>
  );
} 
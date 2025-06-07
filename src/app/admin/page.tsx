'use client';

import { BulkCollectionButton } from '@/components/BulkCollectionButton';

export default function AdminPage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      
      <div className="space-y-6">
        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Collect All Champion Stats</h2>
          <p className="text-gray-600 mb-4">
            This will collect stats for all ranks and regions. It may take several minutes to complete.
          </p>
          <BulkCollectionButton />
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Collect High ELO Stats</h2>
          <p className="text-gray-600 mb-4">
            Collect stats for high ELO (Challenger, Grandmaster, Master) in major regions.
          </p>
          <BulkCollectionButton 
            ranks={['CHALLENGER', 'GRANDMASTER', 'MASTER']}
            regions={['na', 'euw', 'kr']}
          />
        </div>

        <div className="p-6 bg-white rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Collect NA Stats</h2>
          <p className="text-gray-600 mb-4">
            Collect stats for all ranks in NA region only.
          </p>
          <BulkCollectionButton 
            regions={['na']}
          />
        </div>
      </div>
    </div>
  );
} 
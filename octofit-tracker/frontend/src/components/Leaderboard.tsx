import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Ranking = { teamName: string; totalPoints: number; rank: number };

export default function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState<Ranking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<{ leaderboard: Ranking[] }>('/api/leaderboard')
      .then((data) => setLeaderboard(data.leaderboard))
      .catch(() => setError('Unable to load leaderboard'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CapabilityCard title="Leaderboard" description="Compare team point totals." state={{ loading, error, empty: leaderboard.length === 0, emptyText: 'No leaderboard rankings yet' }}>
      {leaderboard.map((entry) => (
        <div className="mb-2" key={entry.rank}>
          <strong>{entry.rank}. {entry.teamName}</strong>: {entry.totalPoints} points
        </div>
      ))}
    </CapabilityCard>
  );
}

import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Team = { name: string; members: string[] };

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<{ teams: Team[] }>('/api/teams')
      .then((data) => setTeams(data.teams))
      .catch(() => setError('Unable to load teams'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CapabilityCard title="Teams" description="Manage teams and members." state={{ loading, error, empty: teams.length === 0, emptyText: 'No teams yet' }}>
      {teams.map((team, index) => (
        <div className="mb-2" key={index}>
          <strong>{team.name}</strong>{team.members?.length ? ` (${team.members.length} members)` : ''}
        </div>
      ))}
    </CapabilityCard>
  );
}

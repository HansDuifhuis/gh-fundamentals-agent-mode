import { useEffect, useState } from 'react';
import { getJson } from '../api/client.js';
import { CapabilityCard } from './CapabilityCard.js';

type Activity = { type: string; minutes: number; points: number };

export default function Activities() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    getJson<{ activities: Activity[] }>('/api/activities')
      .then((data) => setActivities(data.activities))
      .catch(() => setError('Unable to load activities'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <CapabilityCard title="Activities" description="Track student activity minutes and points." state={{ loading, error, empty: activities.length === 0, emptyText: 'No activities yet' }}>
      {activities.map((activity, index) => (
        <div className="mb-2" key={index}>
          <strong>{activity.type}</strong>: {activity.minutes} minutes, {activity.points} points
        </div>
      ))}
    </CapabilityCard>
  );
}

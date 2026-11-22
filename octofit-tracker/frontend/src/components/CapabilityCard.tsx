import type { ReactNode } from 'react';

type Props = {
  title: string;
  description: string;
  state: { loading: boolean; error: string; empty: boolean; emptyText: string };
  children: ReactNode;
};

export function CapabilityCard({ title, description, state, children }: Props) {
  return (
    <section className="card h-100">
      <div className="card-body">
        <h2 className="h4">{title}</h2>
        <p>{description}</p>
        {state.loading && <p role="status">Loading {title.toLowerCase()}...</p>}
        {!state.loading && state.error && <p role="alert">Error: {state.error}</p>}
        {!state.loading && !state.error && state.empty && <p>No {title === 'Activities' ? 'activities' : title === 'Teams' ? 'teams' : title === 'Leaderboard' ? 'leaderboard rankings' : 'workout suggestions'} found. {state.emptyText}</p>}
        {!state.loading && !state.error && !state.empty && children}
      </div>
    </section>
  );
}

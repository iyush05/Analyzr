'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EventTimeline from '@/components/EventTimeline';
import { getSessionEvents } from '@/lib/api';

export default function SessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await getSessionEvents(sessionId);
        setEvents(data.events);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (sessionId) fetchEvents();
  }, [sessionId]);

  const pageViews = events.filter((e) => e.eventType === 'page_view').length;
  const clicks = events.filter((e) => e.eventType === 'click').length;

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
        <button
          className="btn btn-ghost"
          onClick={() => router.push('/sessions')}
          style={{ marginTop: '0.125rem', flexShrink: 0 }}
        >
          ← Back
        </button>
        <div>
          <h1>Session Detail</h1>
          <p style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', marginTop: '0.25rem' }}>
            {sessionId}
          </p>
        </div>
      </div>

      {!loading && !error && events.length > 0 && (
        <div className="stats-grid" style={{ marginBottom: '1.5rem' }}>
          <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>📊</span>
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Total Events</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{events.length}</div>
            </div>
          </div>
          <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>👁</span>
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Page Views</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{pageViews}</div>
            </div>
          </div>
          <div className="card" style={{ padding: '1rem 1.25rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.5rem' }}>🖱</span>
            <div>
              <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>Clicks</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>{clicks}</div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading session events...</p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <h3>Unable to load session</h3>
          <p>{error}</p>
        </div>
      ) : (
        <div className="animate-fade-in">
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1.25rem', color: 'var(--text-primary)' }}>
            🗺 User Journey
          </h2>
          <EventTimeline events={events} />
        </div>
      )}
    </div>
  );
}

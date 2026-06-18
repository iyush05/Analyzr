'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSessions } from '@/lib/api';

function formatDate(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatDuration(first, last) {
  const ms = new Date(last) - new Date(first);
  const secs = Math.floor(ms / 1000);
  if (secs < 60) return `${secs}s`;
  const mins = Math.floor(secs / 60);
  if (mins < 60) return `${mins}m ${secs % 60}s`;
  const hours = Math.floor(mins / 60);
  return `${hours}h ${mins % 60}m`;
}

export default function SessionsPage() {
  const router = useRouter();
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchSessions() {
      setLoading(true);
      try {
        const data = await getSessions(undefined, page, 15);
        setSessions(data.sessions);
        setPagination(data.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchSessions();
  }, [page]);

  return (
    <div>
      <div className="page-header">
        <h1>Sessions</h1>
        <p>Browse user sessions and explore individual user journeys</p>
      </div>

      {loading ? (
        <div className="loading-container">
          <div className="spinner" />
          <p>Loading sessions...</p>
        </div>
      ) : error ? (
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <h3>Unable to load sessions</h3>
          <p>{error}</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📭</div>
          <h3>No sessions found</h3>
          <p>Start tracking events by adding the SDK to your website.</p>
        </div>
      ) : (
        <>
          <div className="table-container animate-fade-in">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>First Seen</th>
                  <th>Duration</th>
                  <th>Page Views</th>
                  <th>Clicks</th>
                  <th>Total Events</th>
                  <th>Last Page</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session, i) => (
                  <tr
                    key={session.sessionId}
                    onClick={() => router.push(`/sessions/${session.sessionId}`)}
                    style={{ animationDelay: `${i * 30}ms` }}
                    className="animate-fade-in"
                  >
                    <td>
                      <span className="mono" style={{ color: 'var(--accent-tertiary)' }}>
                        {session.sessionId.substring(0, 8)}...
                      </span>
                    </td>
                    <td style={{ color: 'var(--text-secondary)' }}>
                      {formatDate(session.firstSeen)}
                    </td>
                    <td>
                      <span className="badge badge-indigo">
                        {formatDuration(session.firstSeen, session.lastSeen)}
                      </span>
                    </td>
                    <td>
                      <span className="badge badge-indigo">👁 {session.pageViews}</span>
                    </td>
                    <td>
                      <span className="badge badge-purple">🖱 {session.clicks}</span>
                    </td>
                    <td>
                      <span style={{ fontWeight: 600 }}>{session.totalEvents}</span>
                    </td>
                    <td>
                      <span className="truncate" style={{ display: 'block', color: 'var(--text-secondary)', fontSize: '0.8125rem' }}>
                        {session.lastPageUrl}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {pagination.totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                ← Previous
              </button>
              <span className="page-info">
                Page {pagination.page} of {pagination.totalPages} ({pagination.total} sessions)
              </span>
              <button
                onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                disabled={page >= pagination.totalPages}
              >
                Next →
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

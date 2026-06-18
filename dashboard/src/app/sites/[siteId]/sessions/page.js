'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getSessions } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Loader2, AlertTriangle, SearchX, MousePointerClick, Eye, ArrowLeft, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

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

export default function SiteSessionsPage() {
  const router = useRouter();
  const params = useParams();
  const siteId = params.siteId;

  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function fetchSessions() {
      setLoading(true);
      try {
        const data = await getSessions(siteId, page, 15);
        setSessions(data.sessions);
        setPagination(data.pagination);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (siteId) fetchSessions();
  }, [siteId, page]);

  return (
    <div className="mx-auto max-w-6xl py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)] relative">
      <div className="pointer-events-none absolute top-0 right-0 h-[500px] w-[500px] rounded-full bg-accent/[0.03] blur-[120px]" />
      
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <Badge variant="accent" dot pulsing>Sessions</Badge>
          <h1 className="font-display text-4xl sm:text-5xl font-normal tracking-tight text-foreground relative inline-block">
            User <span className="gradient-text">Journeys</span>
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Browse individual user sessions and explore how they interact with your website.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-accent mb-4" />
          <p className="text-lg font-medium">Loading sessions...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center rounded-3xl border border-dashed border-border bg-card/50">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">Unable to load sessions</h3>
          <p className="text-muted-foreground max-w-md">{error}</p>
        </div>
      ) : sessions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 px-4 text-center rounded-3xl border border-dashed border-border bg-card/50">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 mb-6">
            <SearchX className="h-10 w-10 text-accent" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">No sessions found</h3>
          <p className="text-muted-foreground max-w-md">
            Start tracking events by adding the tracking code to your website.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-md">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-muted/50 border-b border-border text-xs uppercase tracking-wider text-muted-foreground font-mono">
                  <tr>
                    <th className="px-6 py-4 font-medium">Session ID</th>
                    <th className="px-6 py-4 font-medium">First Seen</th>
                    <th className="px-6 py-4 font-medium">Duration</th>
                    <th className="px-6 py-4 font-medium">Engagement</th>
                    <th className="px-6 py-4 font-medium">Last Page</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {sessions.map((session, i) => (
                    <motion.tr
                      key={session.sessionId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.05 }}
                      onClick={() => router.push(`/sites/${siteId}/sessions/${session.sessionId}`)}
                      className="group cursor-pointer hover:bg-accent/[0.02] transition-colors"
                    >
                      <td className="px-6 py-4">
                        <span className="font-mono text-accent">
                          {session.sessionId.substring(0, 8)}...
                        </span>
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {formatDate(session.firstSeen)}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {formatDuration(session.firstSeen, session.lastSeen)}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1.5 text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-md">
                            <Eye size={14} /> {session.pageViews}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-medium text-purple-600 bg-purple-50 px-2 py-1 rounded-md">
                            <MousePointerClick size={14} /> {session.clicks}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="block max-w-[200px] truncate text-muted-foreground text-xs">
                          {session.lastPageUrl}
                        </span>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between pt-4">
              <p className="text-sm text-muted-foreground">
                Showing page <span className="font-medium text-foreground">{pagination.page}</span> of{' '}
                <span className="font-medium text-foreground">{pagination.totalPages}</span>
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                >
                  <ArrowLeft size={16} className="mr-2" />
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                  disabled={page >= pagination.totalPages}
                >
                  Next
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

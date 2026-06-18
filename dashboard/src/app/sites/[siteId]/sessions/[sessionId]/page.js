'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import EventTimeline from '@/components/EventTimeline';
import { getSessionEvents } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card, CardContent } from '@/components/ui/Card';
import { ArrowLeft, Loader2, AlertTriangle, Map, BarChart2, Eye, MousePointerClick } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SiteSessionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { siteId, sessionId } = params;

  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchEvents() {
      try {
        const data = await getSessionEvents(sessionId, siteId);
        setEvents(data.events);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (sessionId && siteId) fetchEvents();
  }, [sessionId, siteId]);

  const pageViews = events.filter((e) => e.eventType === 'page_view').length;
  const clicks = events.filter((e) => e.eventType === 'click').length;

  return (
    <div className="mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)] relative">
      <div className="pointer-events-none absolute top-0 left-0 h-[400px] w-[400px] rounded-full bg-accent/[0.03] blur-[120px]" />
      
      <div className="mb-10 flex items-start gap-4 relative z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(`/sites/${siteId}/sessions`)}
          className="mt-1 flex-shrink-0"
        >
          <ArrowLeft size={16} className="mr-2" /> Back
        </Button>
        <div>
          <div className="flex items-center gap-4 mb-3">
            <Badge variant="accent" dot pulsing>Session Detail</Badge>
            <h1 className="font-display text-3xl sm:text-4xl font-normal tracking-tight text-foreground">
              User <span className="gradient-text">Activity</span>
            </h1>
          </div>
          <p className="font-mono text-sm text-muted-foreground mt-2 bg-muted/50 px-2 py-1 rounded-md inline-block">
            {sessionId}
          </p>
        </div>
      </div>

      {!loading && !error && events.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10"
        >
          <Card className="border-border bg-card/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <BarChart2 size={24} />
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Total Events</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border bg-card/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-500">
                <Eye size={24} />
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Page Views</p>
                <p className="text-2xl font-bold">{pageViews}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border bg-card/50 shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500">
                <MousePointerClick size={24} />
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Clicks</p>
                <p className="text-2xl font-bold">{clicks}</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 text-muted-foreground">
          <Loader2 className="h-10 w-10 animate-spin text-accent mb-4" />
          <p className="text-lg font-medium">Loading session events...</p>
        </div>
      ) : error ? (
        <div className="flex flex-col items-center justify-center py-24 px-4 text-center rounded-3xl border border-dashed border-border bg-card/50">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-2xl font-semibold mb-2">Unable to load session</h3>
          <p className="text-muted-foreground">{error}</p>
        </div>
      ) : (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="flex items-center gap-2 mb-6 border-b border-border pb-4">
            <Map size={20} className="text-muted-foreground" />
            <h2 className="text-xl font-display font-medium text-foreground">
              Journey Timeline
            </h2>
          </div>
          <EventTimeline events={events} />
        </motion.div>
      )}
    </div>
  );
}

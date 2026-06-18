'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import StatsCard from '@/components/StatsCard';
import { getStats, getSiteDetails } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Loader2, AlertTriangle, Users, BarChart2, Eye, MousePointerClick, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

export default function SiteOverviewPage() {
  const params = useParams();
  const siteId = params.siteId;

  const [stats, setStats] = useState(null);
  const [site, setSite] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsData, siteData] = await Promise.all([
          getStats(siteId),
          getSiteDetails(siteId),
        ]);
        setStats(statsData);
        setSite(siteData.site);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    if (siteId) fetchData();
  }, [siteId]);

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8">
        <Loader2 className="h-10 w-10 animate-spin text-accent mb-4" />
        <p className="text-muted-foreground font-medium">Loading site analytics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center p-8">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
          <AlertTriangle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-2xl font-semibold mb-2">Unable to load data</h3>
        <p className="text-muted-foreground">{error}</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-6xl py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)] relative">
      {/* Background Glow Texture */}
      <div className="pointer-events-none absolute -top-40 -left-40 h-[600px] w-[600px] rounded-full bg-accent/[0.04] blur-[150px]" />

      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <Badge variant="accent" dot pulsing>Dashboard</Badge>
          <h1 className="font-display text-4xl sm:text-5xl font-normal tracking-tight text-foreground relative inline-block">
            {site?.name || 'Overview'}
            {/* Gradient Underline */}
            <div className="gradient-underline" />
          </h1>
        </div>
        <div className="flex items-center gap-3 pt-2">
          <span className="text-lg text-muted-foreground">{site?.domain}</span>
          <span className="rounded-md bg-muted px-2 py-1 font-mono text-xs text-muted-foreground">
            ID: {siteId}
          </span>
        </div>
      </div>

      <div className="rounded-3xl border border-border bg-card p-8 sm:p-12 shadow-md bg-dot-pattern relative overflow-hidden">
        <div className="pointer-events-none absolute -top-20 -right-20 h-64 w-64 rounded-full bg-accent/[0.05] blur-[100px]" />
        
        <h3 className="font-display text-3xl mb-8 relative z-10 text-foreground">
          Key Metrics
        </h3>

        <motion.div 
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 relative z-10"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: {},
            visible: { transition: { staggerChildren: 0.1 } }
          }}
        >
          {[
            { icon: <Users size={20} />, label: "Total Sessions", value: stats?.totalSessions?.toLocaleString() || '0' },
            { icon: <BarChart2 size={20} />, label: "Total Events", value: stats?.totalEvents?.toLocaleString() || '0' },
            { icon: <Eye size={20} />, label: "Page Views", value: stats?.totalPageViews?.toLocaleString() || '0' },
            { icon: <MousePointerClick size={20} />, label: "Clicks", value: stats?.totalClicks?.toLocaleString() || '0' },
            { icon: <FileText size={20} />, label: "Unique Pages", value: stats?.uniquePages?.toLocaleString() || '0' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
              }}
            >
              <StatsCard
                icon={stat.icon}
                label={stat.label}
                value={stat.value}
                className="bg-background/80 backdrop-blur-sm border-border/50 hover:bg-background transition-colors h-full"
              />
            </motion.div>
          ))}
        </motion.div>
      </div>

      <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        <a 
          href={`/sites/${siteId}/sessions`}
          className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md hover:border-accent/30"
        >
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-accent/[0.03] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative z-10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/10 text-blue-600">
              <Users size={24} />
            </div>
            <h3 className="font-display text-2xl font-semibold text-foreground mb-2">User Sessions</h3>
            <p className="text-muted-foreground text-sm">
              Watch step-by-step timelines of how users navigate and interact with your site.
            </p>
          </div>
        </a>

        <a 
          href={`/sites/${siteId}/heatmap`}
          className="group relative overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-sm transition-all hover:shadow-md hover:border-accent/30"
        >
          <div className="absolute right-0 top-0 h-full w-1/2 bg-gradient-to-l from-purple-500/[0.03] to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
          <div className="relative z-10">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-600">
              <MousePointerClick size={24} />
            </div>
            <h3 className="font-display text-2xl font-semibold text-foreground mb-2">Click Heatmap</h3>
            <p className="text-muted-foreground text-sm">
              Visualize exactly where your users are clicking and identify high-engagement areas.
            </p>
          </div>
        </a>
      </div>
    </div>
  );
}

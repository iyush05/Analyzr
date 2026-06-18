'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import HeatmapCanvas from '@/components/HeatmapCanvas';
import { getPages, getHeatmapData } from '@/lib/api';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Loader2, AlertTriangle, Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function SiteHeatmapPage() {
  const params = useParams();
  const siteId = params.siteId;

  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState('');
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchPages() {
      try {
        const data = await getPages(siteId);
        setPages(data.pages || []);
        if (data.pages?.length > 0) {
          setSelectedPage(data.pages[0]);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setPagesLoading(false);
      }
    }
    if (siteId) fetchPages();
  }, [siteId]);

  useEffect(() => {
    if (!selectedPage || !siteId) return;

    async function fetchHeatmap() {
      setLoading(true);
      try {
        const data = await getHeatmapData(selectedPage, siteId);
        setPoints(data.points || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHeatmap();
  }, [selectedPage, siteId]);

  return (
    <div className="mx-auto max-w-6xl py-12 px-4 sm:px-6 lg:px-8 min-h-[calc(100vh-4rem)] relative">
      <div className="pointer-events-none absolute top-20 right-20 h-[400px] w-[400px] rounded-full bg-accent/[0.04] blur-[100px]" />
      
      <div className="mb-12">
        <div className="flex items-center gap-4 mb-4">
          <Badge variant="accent" dot pulsing>Heatmap</Badge>
          <h1 className="font-display text-4xl sm:text-5xl font-normal tracking-tight text-foreground relative inline-block">
            Click <span className="gradient-text">Patterns</span>
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Visualize click patterns and discover what areas of your page get the most attention.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-center gap-4 rounded-2xl border border-border bg-card p-6 shadow-sm">
        <label className="text-sm font-medium text-muted-foreground">
          Target Page:
        </label>
        {pagesLoading ? (
          <span className="text-sm text-muted-foreground flex items-center">
            <Loader2 className="mr-2 h-4 w-4 animate-spin text-accent" /> Loading pages...
          </span>
        ) : pages.length === 0 ? (
          <span className="text-sm text-muted-foreground">No pages tracked yet</span>
        ) : (
          <div className="relative">
            <select
              className="appearance-none rounded-xl border border-border bg-muted/30 py-2.5 pl-4 pr-10 text-sm font-medium text-foreground outline-none transition-all focus:border-accent focus:ring-2 focus:ring-accent/20 hover:border-accent/30 w-full sm:w-[320px]"
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
            >
              {pages.map((page) => (
                <option key={page} value={page}>
                  {page}
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}
      </div>

      {selectedPage && !loading && points.length > 0 && (
        <Card className="mb-6 overflow-visible border-accent/20 bg-accent/5">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4">
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="bg-accent/10 text-accent font-medium text-sm gap-1.5 px-3">
                <Flame size={14} /> {points.length} clicks
              </Badge>
              <span className="text-sm text-muted-foreground">
                on <span className="font-mono text-accent">{selectedPage}</span>
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-medium text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-indigo-500 opacity-60" />
                Recent
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-red-500 opacity-60" />
                Older
              </span>
            </div>
          </div>
        </Card>
      )}

      {error && (
        <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border border-dashed border-border bg-card/50">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Unable to load heatmap</h3>
          <p className="text-muted-foreground max-w-md">{error}</p>
        </div>
      )}

      {loading && (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-border bg-card/50">
          <Loader2 className="h-10 w-10 animate-spin text-accent mb-4" />
          <p className="text-muted-foreground font-medium">Rendering heatmap data...</p>
        </div>
      )}

      {!loading && !error && (
        <div className="animate-in fade-in duration-700 relative z-10">
          <HeatmapCanvas points={points} pageUrl={selectedPage} />
        </div>
      )}
    </div>
  );
}

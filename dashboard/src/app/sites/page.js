'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '@/components/ProtectedRoute';
import AddSiteModal from '@/components/AddSiteModal';
import TrackingCodeModal from '@/components/TrackingCodeModal';
import { useSites } from '@/context/SiteContext';
import { createSite, deleteSite } from '@/lib/api';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Globe, Plus, Code, LayoutDashboard, Trash2, Loader2, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

function formatDate(dateStr) {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function SitesPage() {
  const router = useRouter();
  const { sites, loading, refreshSites } = useSites();
  const [showAddModal, setShowAddModal] = useState(false);
  const [trackingSite, setTrackingSite] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  async function handleCreateSite(name, domain) {
    await createSite(name, domain);
    await refreshSites();
  }

  async function handleDeleteSite(e, siteId) {
    e.stopPropagation();
    if (!confirm('Are you sure you want to remove this site? Events data will be preserved.')) return;
    setDeletingId(siteId);
    try {
      await deleteSite(siteId);
      await refreshSites();
    } finally {
      setDeletingId(null);
    }
  }

  function handleShowCode(e, site) {
    e.stopPropagation();
    setTrackingSite(site);
  }

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-6xl py-12 px-4 sm:px-6 lg:px-8 bg-dot-pattern min-h-[calc(100vh-4rem)]">
        {/* Header Section */}
        <div className="mb-12 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="space-y-4">
            <Badge variant="accent" dot pulsing>Overview</Badge>
            <h1 className="font-display text-5xl font-normal tracking-tight text-foreground">
              My <span className="gradient-text">Websites</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Manage and track analytics for your websites.
            </p>
          </div>
          <Button onClick={() => setShowAddModal(true)} className="group sm:w-auto w-full">
            <Plus size={18} className="mr-2" />
            Add Website
          </Button>
        </div>

        {/* Content Section */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 text-muted-foreground">
            <Loader2 className="h-10 w-10 animate-spin mb-4 text-accent" />
            <p className="text-lg font-medium">Loading your sites...</p>
          </div>
        ) : sites.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 px-4 text-center rounded-3xl border border-dashed border-border bg-card/50">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-accent/10 mb-6">
              <Globe className="h-10 w-10 text-accent" />
            </div>
            <h3 className="text-2xl font-semibold mb-2">No websites yet</h3>
            <p className="text-muted-foreground mb-8 max-w-md">
              Add your first website to start tracking user interactions, sessions, and heatmaps.
            </p>
            <Button onClick={() => setShowAddModal(true)} size="lg">
              <Plus size={18} className="mr-2" />
              Add your first website
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sites.map((site, i) => (
              <motion.div
                key={site.siteId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1, ease: [0.16, 1, 0.3, 1] }}
                onClick={() => router.push(`/sites/${site.siteId}`)}
                className="cursor-pointer h-full"
              >
                <Card className="h-full flex flex-col group/card hover:border-accent/30 transition-colors">
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent/10 to-accent-secondary/10 text-accent font-display text-xl shadow-sm ring-1 ring-accent/20">
                          {site.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <CardTitle className="mb-1 truncate max-w-[180px]">{site.name}</CardTitle>
                          <p className="text-sm text-muted-foreground truncate max-w-[180px]">{site.domain}</p>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-6 flex-1">
                    <div className="grid grid-cols-2 gap-4 rounded-xl bg-muted/40 p-4">
                      <div>
                        <p className="text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wider">Sessions</p>
                        <p className="text-xl font-bold">{site.totalSessions?.toLocaleString() || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs font-mono text-muted-foreground mb-1 uppercase tracking-wider">Events</p>
                        <p className="text-xl font-bold">{site.totalEvents?.toLocaleString() || 0}</p>
                      </div>
                    </div>
                  </CardContent>

                  <CardFooter className="pt-0 justify-between">
                    <div className="flex items-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs"
                        onClick={(e) => handleShowCode(e, site)}
                      >
                        <Code size={14} className="mr-1.5" />
                        Code
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 text-xs hover:text-red-600 hover:bg-red-50"
                        onClick={(e) => handleDeleteSite(e, site.siteId)}
                        disabled={deletingId === site.siteId}
                      >
                        {deletingId === site.siteId ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Trash2 size={14} />
                        )}
                      </Button>
                    </div>
                    
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 group-hover/card:bg-accent/5 group-hover/card:text-accent"
                      onClick={() => router.push(`/sites/${site.siteId}`)}
                    >
                      Dashboard
                      <ArrowRight size={14} className="ml-1.5 transition-transform group-hover/card:translate-x-1" />
                    </Button>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        {showAddModal && (
          <AddSiteModal
            onClose={() => setShowAddModal(false)}
            onSubmit={handleCreateSite}
          />
        )}

        {trackingSite && (
          <TrackingCodeModal
            site={trackingSite}
            onClose={() => setTrackingSite(null)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}

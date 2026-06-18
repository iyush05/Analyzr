'use client';

import { useEffect, useState } from 'react';
import HeatmapCanvas from '@/components/HeatmapCanvas';
import { getPages, getHeatmapData } from '@/lib/api';

export default function HeatmapPage() {
  const [pages, setPages] = useState([]);
  const [selectedPage, setSelectedPage] = useState('');
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagesLoading, setPagesLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch available pages
  useEffect(() => {
    async function fetchPages() {
      try {
        const data = await getPages();
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
    fetchPages();
  }, []);

  // Fetch heatmap data when page is selected
  useEffect(() => {
    if (!selectedPage) return;

    async function fetchHeatmap() {
      setLoading(true);
      try {
        const data = await getHeatmapData(selectedPage);
        setPoints(data.points || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchHeatmap();
  }, [selectedPage]);

  return (
    <div>
      <div className="page-header">
        <h1>Heatmap</h1>
        <p>Visualize click patterns across your pages</p>
      </div>

      {/* Page selector */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
        <label style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
          Select page:
        </label>
        {pagesLoading ? (
          <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>Loading pages...</span>
        ) : pages.length === 0 ? (
          <span style={{ fontSize: '0.875rem', color: 'var(--text-tertiary)' }}>No pages tracked yet</span>
        ) : (
          <div className="select-wrapper">
            <select
              className="select-input"
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
            >
              {pages.map((page) => (
                <option key={page} value={page}>
                  {page}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Heatmap info bar */}
      {selectedPage && !loading && points.length > 0 && (
        <div className="card animate-fade-in" style={{ marginBottom: '1rem' }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.875rem 1.25rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <span className="badge badge-purple">🔥 {points.length} clicks</span>
              <span style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
                on <span className="mono" style={{ color: 'var(--accent-tertiary)' }}>{selectedPage}</span>
              </span>
            </div>
            <div className="heatmap-legend">
              <span>
                <span className="legend-dot" style={{ background: 'rgba(99, 102, 241, 0.6)' }} />
                Recent
              </span>
              <span>
                <span className="legend-dot" style={{ background: 'rgba(255, 42, 41, 0.6)' }} />
                Older
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="empty-state">
          <div className="empty-icon">⚠️</div>
          <h3>Unable to load heatmap data</h3>
          <p>{error}</p>
        </div>
      )}

      {/* Loading state */}
      {loading && (
        <div className="loading-container" style={{ minHeight: '400px' }}>
          <div className="spinner" />
          <p>Loading heatmap data...</p>
        </div>
      )}

      {/* Heatmap canvas */}
      {!loading && !error && (
        <div className="animate-fade-in">
          <HeatmapCanvas points={points} />
        </div>
      )}
    </div>
  );
}

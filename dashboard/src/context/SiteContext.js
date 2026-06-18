'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getSites as apiGetSites } from '@/lib/api';
import { useAuth } from './AuthContext';

const SiteContext = createContext(null);

export function SiteProvider({ children }) {
  const { isAuthenticated } = useAuth();
  const [sites, setSites] = useState([]);
  const [activeSiteId, setActiveSiteId] = useState(null);
  const [loading, setLoading] = useState(false);

  const refreshSites = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      const data = await apiGetSites();
      setSites(data.sites || []);
    } catch (err) {
      console.error('Failed to fetch sites:', err);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch sites when auth state changes
  useEffect(() => {
    if (isAuthenticated) {
      refreshSites();
    } else {
      setSites([]);
      setActiveSiteId(null);
    }
  }, [isAuthenticated, refreshSites]);

  // Restore active site from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('ua_active_site');
      if (stored) setActiveSiteId(stored);
    }
  }, []);

  const switchSite = useCallback((siteId) => {
    setActiveSiteId(siteId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('ua_active_site', siteId);
    }
  }, []);

  const activeSite = sites.find((s) => s.siteId === activeSiteId) || null;

  return (
    <SiteContext.Provider
      value={{
        sites,
        activeSiteId,
        activeSite,
        loading,
        switchSite,
        refreshSites,
      }}
    >
      {children}
    </SiteContext.Provider>
  );
}

export function useSites() {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSites must be used within SiteProvider');
  return ctx;
}

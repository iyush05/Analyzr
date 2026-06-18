'use client';

import { useParams } from 'next/navigation';
import { useEffect } from 'react';
import { useSites } from '@/context/SiteContext';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function SiteLayout({ children }) {
  const params = useParams();
  const siteId = params.siteId;
  const { switchSite } = useSites();

  useEffect(() => {
    if (siteId) {
      switchSite(siteId);
    }
  }, [siteId, switchSite]);

  return <ProtectedRoute>{children}</ProtectedRoute>;
}

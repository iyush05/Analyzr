'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function HomePage() {
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading) {
      if (isAuthenticated) {
        router.replace('/sites');
      } else {
        router.replace('/login');
      }
    }
  }, [loading, isAuthenticated, router]);

  return (
    <div className="loading-container" style={{ minHeight: '80vh' }}>
      <div className="spinner" />
      <p>Redirecting...</p>
    </div>
  );
}

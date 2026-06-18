'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { X, Globe, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AddSiteModal({ onClose, onSubmit }) {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await onSubmit(name, domain);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={onClose} 
        />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: "spring", duration: 0.5, bounce: 0.3 }}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Globe size={24} />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Add a website</h2>
                <p className="text-sm text-muted-foreground mt-1">Register a website to start tracking user interactions.</p>
              </div>
            </div>
            <button 
              className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" 
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 border border-red-100 flex gap-2">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="site-name" className="text-sm font-medium text-foreground">Site name</label>
              <input
                id="site-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="My Portfolio"
                required
                className="flex h-12 w-full rounded-xl border border-border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="site-domain" className="text-sm font-medium text-foreground">Website URL or domain</label>
              <input
                id="site-domain"
                type="text"
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="https://myportfolio.com"
                required
                className="flex h-12 w-full rounded-xl border border-border bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50"
              />
              <p className="text-xs text-muted-foreground">Any URL — public website, localhost, staging, etc.</p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2 mt-8">
              <Button type="button" variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Creating...' : 'Add website'}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

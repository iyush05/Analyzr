'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { X, Code, Check, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export default function TrackingCodeModal({ site, onClose }) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('html');
  const [frontendUrl, setFrontendUrl] = useState('');

  // Get the frontend origin for the script tag when component mounts
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setFrontendUrl(window.location.origin);
    }
  }, []);

  const backendUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

  const htmlSnippet = `<!-- User Analytics Tracking Code -->
<script src="${frontendUrl}/tracker.umd.js"></script>
<script>
  UserAnalytics.init({
    endpoint: '${backendUrl}',
    siteId: '${site.siteId}'
  });
</script>`;

  const npmSnippet = `// 1. Install the package
// npm install @iyush05/analyzr

// 2. Initialize it in your app entry point (e.g., App.js, index.js, or layout.js)
import UserAnalytics from '@user-analytics/tracker';

UserAnalytics.init({
  endpoint: '${backendUrl}',
  siteId: '${site.siteId}'
});`;

  const currentSnippet = activeTab === 'html' ? htmlSnippet : npmSnippet;

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(currentSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = currentSnippet;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
          className="relative w-full max-w-2xl overflow-hidden rounded-3xl border border-border bg-card p-8 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mb-6 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                <Code size={24} />
              </div>
              <div>
                <h2 className="font-display text-2xl font-bold tracking-tight text-foreground">Tracking Code</h2>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary" className="font-medium text-xs">{site.name}</Badge>
                  <span className="text-xs text-muted-foreground">{site.domain}</span>
                </div>
              </div>
            </div>
            <button 
              className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" 
              onClick={onClose}
            >
              <X size={20} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-6 border-b border-border mb-6">
            <button
              onClick={() => setActiveTab('html')}
              className={cn(
                "pb-3 text-sm font-medium transition-colors relative",
                activeTab === 'html' ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              HTML Snippet
              {activeTab === 'html' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('npm')}
              className={cn(
                "pb-3 text-sm font-medium transition-colors relative",
                activeTab === 'npm' ? "text-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              NPM / React / Vue
              {activeTab === 'npm' && (
                <motion.div layoutId="activeTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent rounded-t-full" />
              )}
            </button>
          </div>

          <div className="mb-6">
            {activeTab === 'html' ? (
              <p className="text-sm text-muted-foreground">
                Add this snippet to your website's HTML, just before the closing <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-accent">&lt;/body&gt;</code> tag.
              </p>
            ) : (
              <p className="text-sm text-muted-foreground">
                For modern applications, install the package and initialize it in your root component.
              </p>
            )}
          </div>

          <div className="relative mb-8 rounded-xl border border-border bg-[#0d1117] p-4 overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-8 bg-white/5 border-b border-white/5 flex items-center px-4">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/80" />
                <div className="w-2.5 h-2.5 rounded-full bg-green-500/80" />
              </div>
            </div>
            <pre className="mt-6 overflow-x-auto text-xs text-gray-300 font-mono leading-relaxed">
              {currentSnippet}
            </pre>
          </div>

          <div className="flex items-center justify-between">
            <p className="font-mono text-xs text-muted-foreground">
              Site ID: <span className="text-foreground">{site.siteId}</span>
            </p>
            <div className="flex gap-3">
              <Button type="button" variant="ghost" onClick={onClose}>
                Close
              </Button>
              <Button type="button" onClick={handleCopy} className="min-w-[120px]">
                {copied ? <Check size={16} className="mr-2" /> : <Copy size={16} className="mr-2" />}
                {copied ? 'Copied!' : 'Copy code'}
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

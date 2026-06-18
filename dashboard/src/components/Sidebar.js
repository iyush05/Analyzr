'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useSites } from '@/context/SiteContext';
import { Activity, CircleDashed, LogOut, LayoutDashboard, Map, PanelLeftClose, PanelRightClose } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const { activeSite } = useSites();
  const [collapsed, setCollapsed] = useState(false);

  // Don't show sidebar on auth pages
  if (!isAuthenticated || pathname === '/login' || pathname === '/signup') {
    return null;
  }

  // Determine if we're inside a site context
  const siteMatch = pathname.match(/^\/sites\/([^/]+)/);
  const currentSiteId = siteMatch ? siteMatch[1] : null;

  const isActive = (href) => {
    if (href === '/sites' && pathname === '/sites') return true;
    if (currentSiteId && href.includes(currentSiteId)) {
      if (href === `/sites/${currentSiteId}` && pathname === `/sites/${currentSiteId}`) return true;
      if (href !== `/sites/${currentSiteId}` && pathname.startsWith(href)) return true;
    }
    return false;
  };

  const navItems = [
    {
      label: 'My Websites',
      href: '/sites',
      icon: <LayoutDashboard size={20} strokeWidth={1.5} />,
    },
  ];

  if (currentSiteId) {
    navItems.push(
      { divider: true, label: activeSite?.name || 'Site' },
      {
        label: 'Overview',
        href: `/sites/${currentSiteId}`,
        icon: <Activity size={20} strokeWidth={1.5} />,
      },
      {
        label: 'Sessions',
        href: `/sites/${currentSiteId}/sessions`,
        icon: <CircleDashed size={20} strokeWidth={1.5} />,
      },
      {
        label: 'Heatmap',
        href: `/sites/${currentSiteId}/heatmap`,
        icon: <Map size={20} strokeWidth={1.5} />,
      }
    );
  }

  return (
    <aside 
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex flex-col border-r border-border bg-card transition-all duration-300 ease-out",
        collapsed ? "w-[72px]" : "w-[260px] hidden md:flex"
      )}
    >
      {/* Logo */}
      <div className="flex h-20 shrink-0 items-center px-6">
        <Link href="/sites" className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-secondary text-white shadow-accent">
            <Activity size={18} strokeWidth={2.5} />
          </div>
          {!collapsed && <span className="font-display text-xl font-bold tracking-tight">Analytics</span>}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
        {navItems.map((item, i) => {
          if (item.divider) {
            return (
              <div key={`divider-${i}`} className="mt-8 mb-4 px-3">
                {!collapsed && (
                  <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    {item.label}
                  </span>
                )}
                {collapsed && <div className="mx-auto h-[1px] w-8 bg-border" />}
              </div>
            );
          }
          
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                active 
                  ? "bg-accent/5 text-accent" 
                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
              )}
              title={item.label}
            >
              <span className={cn("transition-colors", active ? "text-accent" : "group-hover:text-foreground")}>
                {item.icon}
              </span>
              {!collapsed && <span>{item.label}</span>}
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-accent" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User */}
      <div className="border-t border-border p-4">
        {!collapsed && user && (
          <div className="mb-4 flex items-center gap-3 px-2">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted font-medium text-foreground">
              {user.name?.charAt(0).toUpperCase() || '?'}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="truncate text-sm font-semibold">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
          </div>
        )}
        <button
          onClick={logout}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-all hover:bg-red-50 hover:text-red-600",
            collapsed && "justify-center px-0"
          )}
          title="Log out"
        >
          <LogOut size={18} strokeWidth={1.5} />
          {!collapsed && <span>Log out</span>}
        </button>
      </div>

      {/* Collapse Toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute -right-3 top-24 flex h-6 w-6 items-center justify-center rounded-full border border-border bg-card text-muted-foreground shadow-sm hover:text-foreground hidden md:flex"
      >
        {collapsed ? <PanelRightClose size={14} /> : <PanelLeftClose size={14} />}
      </button>
    </aside>
  );
}

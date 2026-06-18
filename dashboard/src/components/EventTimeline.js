import { Badge } from '@/components/ui/Badge';
import { Eye, MousePointerClick, SearchX, MapPin, Tag, CornerUpLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

function formatTime(timestamp) {
  const d = new Date(timestamp);
  return d.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

function formatDate(timestamp) {
  const d = new Date(timestamp);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export default function EventTimeline({ events = [] }) {
  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-3xl border border-dashed border-border bg-card/50">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent/10 mb-6">
          <SearchX className="h-8 w-8 text-accent" />
        </div>
        <h3 className="text-xl font-semibold mb-2">No events found</h3>
        <p className="text-muted-foreground">This session has no recorded events.</p>
      </div>
    );
  }

  return (
    <div className="relative pl-8 sm:pl-10 pb-8">
      {/* Vertical connector line */}
      <div className="absolute left-[15px] sm:left-[23px] top-4 bottom-0 w-px bg-border/80" />

      {events.map((event, i) => {
        const isPageView = event.eventType === 'page_view';
        
        return (
          <motion.div
            key={event._id || i}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.05 }}
            className="relative mb-8 last:mb-0 group"
          >
            {/* Timeline Dot */}
            <div className={cn(
              "absolute -left-8 sm:-left-10 mt-1.5 flex h-7 w-7 items-center justify-center rounded-full border-2 border-background shadow-sm",
              isPageView ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
            )}>
              {isPageView ? <Eye size={12} /> : <MousePointerClick size={12} />}
            </div>

            {/* Event Content */}
            <div className="rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-border/80 hover:shadow-md group-hover:bg-accent/[0.02]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                <Badge 
                  variant="secondary" 
                  className={cn(
                    "font-medium text-xs gap-1.5",
                    isPageView ? "bg-blue-50 text-blue-700" : "bg-purple-50 text-purple-700"
                  )}
                >
                  {isPageView ? (
                    <><Eye size={12} /> Page View</>
                  ) : (
                    <><MousePointerClick size={12} /> Click</>
                  )}
                </Badge>
                <span className="text-xs font-mono text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-md">
                  {formatTime(event.timestamp)}
                </span>
              </div>

              <div className="text-sm font-medium text-foreground truncate mb-3" title={event.pageUrl}>
                {event.pageUrl}
              </div>

              {event.eventType === 'click' && event.data && (
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border border-dashed">
                  <span className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-muted/30 px-2 py-1 rounded">
                    <MapPin size={12} /> ({event.data.x}, {event.data.y})
                  </span>
                  {event.data.elementTag && (
                    <span className="flex items-center gap-1.5 text-xs font-mono text-muted-foreground bg-muted/30 px-2 py-1 rounded">
                      <Tag size={12} /> {'<'}{event.data.elementTag.toLowerCase()}{'>'}
                    </span>
                  )}
                  {event.data.elementText && (
                    <span className="text-xs font-medium text-accent italic bg-accent/5 px-2 py-1 rounded truncate max-w-[200px]" title={event.data.elementText}>
                      "{event.data.elementText}"
                    </span>
                  )}
                </div>
              )}

              {event.eventType === 'page_view' && event.data?.referrer && (
                <div className="flex flex-wrap items-center gap-3 pt-3 border-t border-border border-dashed">
                  <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CornerUpLeft size={14} className="text-accent" /> from: 
                    <span className="font-mono text-foreground">{event.data.referrer}</span>
                  </span>
                </div>
              )}

              {i === 0 && (
                <div className="absolute -top-10 left-0 right-0 flex justify-center">
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-3 py-1 rounded-full border border-border">
                    {formatDate(event.timestamp)}
                  </span>
                </div>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}

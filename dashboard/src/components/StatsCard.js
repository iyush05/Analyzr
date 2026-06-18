import { Card, CardContent } from './ui/Card';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCard({ icon, label, value, trend, className }) {
  return (
    <Card className={cn("overflow-hidden border-border bg-card shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1", className)}>
      <CardContent className="p-5 flex flex-col items-start gap-4">
        <div className="flex w-full items-center justify-between">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-accent/10 to-accent-secondary/10 text-accent shadow-sm ring-1 ring-accent/20">
            {icon}
          </div>
          {trend !== undefined && (
            <span className={cn(
              "flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full",
              trend >= 0 ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"
            )}>
              {trend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />} {Math.abs(trend)}%
            </span>
          )}
        </div>
        <div>
          <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">{label}</p>
          <h4 className="text-3xl font-display font-bold tracking-tight text-foreground">{value ?? '—'}</h4>
        </div>
      </CardContent>
    </Card>
  );
}

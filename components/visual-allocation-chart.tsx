'use client';

import { useMemo } from 'react';
import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip } from 'recharts';
import type { PortfolioMetrics } from '@/lib/portfolio';
import { formatCurrency, formatPercent } from '@/lib/format';

const COLORS = ['#3d8bff', '#67d9ff', '#7f5dff', '#2ed3b7', '#ff8f6b', '#f5c86c', '#f14668'];

interface AllocationChartProps {
  metrics: PortfolioMetrics;
}

export default function AllocationChart({ metrics }: AllocationChartProps) {
  const data = useMemo(() => {
    if (!metrics.allocation.length || metrics.totalValue === 0) return [];
    return metrics.allocation
      .map((entry) => ({
        name: `${entry.symbol}`,
        value: entry.value,
        label: entry.label
      }))
      .sort((a, b) => b.value - a.value);
  }, [metrics]);

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.04] p-5">
      <header className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-sky-400/80">Allocation</p>
          <h3 className="mt-1 text-lg font-semibold text-white">Capital distribution</h3>
        </div>
        <p className="text-xs text-white/50">Weighted by live market prices</p>
      </header>

      {data.length === 0 ? (
        <div className="flex h-60 flex-col items-center justify-center gap-2 text-white/50">
          <span className="text-2xl">📊</span>
          <p className="text-sm">Add holdings to visualize capital allocation.</p>
        </div>
      ) : (
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Tooltip content={<AllocationTooltip />} />
              <Pie
                data={data}
                innerRadius={70}
                outerRadius={110}
                paddingAngle={4}
                dataKey="value"
                blendStroke
              >
                {data.map((entry, index) => (
                  <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      )}

      {data.length > 0 && (
        <div className="mt-5 space-y-2 text-xs text-white/60">
          {data.slice(0, 5).map((entry, index) => {
            const allocationPct = metrics.totalValue > 0 ? (entry.value / metrics.totalValue) * 100 : 0;
            return (
              <div key={entry.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="inline-block h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: COLORS[index % COLORS.length] }}
                  />
                  <span className="font-medium text-white">{entry.label}</span>
                </div>
                <div className="font-mono text-white/70">
                  {formatCurrency(entry.value)} · {allocationPct.toFixed(1)}%
                </div>
              </div>
            );
          })}
          {data.length > 5 && <p className="pt-2 text-[11px] uppercase tracking-[0.4em] text-white/30">+{data.length - 5} more positions</p>}
        </div>
      )}
    </section>
  );
}

const AllocationTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const { name, payload: item } = payload[0];
  return (
    <div className="rounded-2xl border border-white/10 bg-[#0c121f]/90 px-4 py-3 text-xs text-white/80 shadow-lg">
      <p className="text-sm font-semibold text-white">{item.label}</p>
      <p className="mt-1 text-white/70">{formatCurrency(item.value)}</p>
      <p className="text-white/40">{name}</p>
    </div>
  );
};

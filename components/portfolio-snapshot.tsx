'use client';

import type { PortfolioMetrics } from '@/lib/portfolio';
import { formatCurrency, formatPercent } from '@/lib/format';

interface SnapshotProps {
  metrics: PortfolioMetrics;
}

const metricCards = [
  {
    key: 'totalValue',
    title: 'Portfolio equity'
  },
  {
    key: 'totalProfit',
    title: 'Unrealised P/L'
  },
  {
    key: 'dailyChange',
    title: 'Daily delta'
  }
] as const;

export default function PortfolioSnapshot({ metrics }: SnapshotProps) {
  const { bestPerformer, worstPerformer, highestExposure } = metrics;

  const profitColor = metrics.totalProfit >= 0 ? 'text-emerald-300' : 'text-red-300';
  const profitBg = metrics.totalProfit >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10';

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.04] to-white/[0.01] p-6 shadow-[0_18px_45px_rgba(5,17,38,0.48)]">
      <div className="mb-6 flex flex-wrap justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.4em] text-sky-400/80">Mission Dashboard</p>
          <h2 className="mt-2 text-2xl font-semibold text-white md:text-3xl">Live portfolio intelligence</h2>
          <p className="mt-2 text-sm text-white/60">
            Aggregated value powered by live pricing. Profit analytics, drawdown resilience, and risk diagnostics refresh with every market snapshot.
          </p>
        </div>
        <div className="flex flex-col items-end text-sm text-white/60">
          <span className="uppercase tracking-[0.3em]">Risk profile</span>
          <p className="mt-1 text-lg font-semibold text-white">{metrics.riskCategory}</p>
          <p className="text-xs text-white/40">{metrics.volatilityScore.toFixed(1)}% avg 24h volatility</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="rounded-3xl border border-white/10 bg-white/[0.05] p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Portfolio equity</p>
          <p className="mt-3 text-3xl font-semibold text-white">{formatCurrency(metrics.totalValue)}</p>
          <p className={`mt-2 inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs ${profitBg} ${profitColor}`}>
            {formatPercent(metrics.totalProfitPct, { sign: 'always' })} overall
          </p>
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">Unrealised P/L</p>
          <p className={`mt-3 text-3xl font-semibold ${profitColor}`}>
            {formatCurrency(metrics.totalProfit)}
          </p>
          <p className="mt-2 text-xs text-white/60">
            Cost basis: <strong className="text-white/80">{formatCurrency(metrics.totalCost)}</strong>
          </p>
        </article>

        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <p className="text-xs uppercase tracking-[0.3em] text-white/40">24h delta</p>
          <p className={`mt-3 text-3xl font-semibold ${metrics.dailyChangeValue >= 0 ? 'text-sky-200' : 'text-orange-200'}`}>
            {formatCurrency(metrics.dailyChangeValue)}
          </p>
          <p className="mt-2 text-xs text-white/60">
            {formatPercent(metrics.dailyChangePct, { sign: 'always' })} weighted daily change
          </p>
        </article>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <MiniPerformanceCard
          title="Best performer"
          value={bestPerformer?.roi ?? 0}
          label={bestPerformer?.label ?? 'Awaiting data'}
          subtitle={bestPerformer ? `${formatCurrency(bestPerformer.value)} / cost ${formatCurrency(bestPerformer.cost)}` : 'Add holdings to unlock performance ranks.'}
        />
        <MiniPerformanceCard
          title="Worst performer"
          value={worstPerformer?.roi ?? 0}
          label={worstPerformer?.label ?? 'Awaiting data'}
          subtitle={worstPerformer ? `${formatCurrency(worstPerformer.value)} / cost ${formatCurrency(worstPerformer.cost)}` : 'We will flag laggards once data is available.'}
          negative
        />
        <MiniPerformanceCard
          title="Largest exposure"
          value={highestExposure?.value ?? 0}
          label={highestExposure?.label ?? 'Pending positions'}
          subtitle={highestExposure ? `${formatCurrency(highestExposure.value)} at ${highestExposure.symbol}` : 'Add multiple assets to map exposure drift.'}
          isCurrency
        />
      </div>
    </section>
  );
}

interface MiniPerformanceCardProps {
  title: string;
  value: number;
  label: string;
  subtitle: string;
  negative?: boolean;
  isCurrency?: boolean;
}

function MiniPerformanceCard({ title, value, label, subtitle, negative, isCurrency }: MiniPerformanceCardProps) {
  const formatted = isCurrency ? formatCurrency(value) : formatPercent(value, { sign: negative ? 'always' : 'auto' });
  const tone = negative ? (value < 0 ? 'text-red-300' : 'text-white') : value >= 0 ? 'text-emerald-200' : 'text-white';
  return (
    <article className="rounded-3xl border border-white/10 bg-[#0c121f]/80 p-5">
      <p className="text-xs uppercase tracking-[0.3em] text-white/40">{title}</p>
      <p className={`mt-3 text-2xl font-semibold ${tone}`}>{formatted}</p>
      <p className="mt-1 text-sm font-medium text-white">{label}</p>
      <p className="mt-1 text-xs text-white/50">{subtitle}</p>
    </article>
  );
}

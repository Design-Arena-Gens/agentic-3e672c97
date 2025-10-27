'use client';

import type { PortfolioMetrics } from '@/lib/portfolio';

interface InsightsPanelProps {
  metrics: PortfolioMetrics;
}

export default function InsightsPanel({ metrics }: InsightsPanelProps) {
  const { insights } = metrics;

  return (
    <section className="rounded-3xl border border-white/10 bg-gradient-to-br from-[#0f172a]/70 to-[#050b17]/85 p-5">
      <header className="mb-4">
        <p className="text-xs uppercase tracking-[0.35em] text-sky-400/80">Signal stream</p>
        <h3 className="mt-1 text-lg font-semibold text-white">Strategic insights</h3>
        <p className="text-xs text-white/50">Curated observations grounded in performance and volatility analytics.</p>
      </header>
      <div className="space-y-3">
        {insights.map((insight, index) => (
          <article
            key={`${insight.title}-${index}`}
            className={`rounded-2xl border px-4 py-3 text-sm shadow-inner ${toneVariants[insight.tone]}`}
          >
            <p className="text-xs uppercase tracking-[0.25em] text-white/40">{insight.title}</p>
            <p className="mt-1 text-[13px] text-white/80">{insight.detail}</p>
          </article>
        ))}
      </div>
    </section>
  );
}

const toneVariants: Record<string, string> = {
  positive: 'border-emerald-500/20 bg-emerald-500/5',
  neutral: 'border-white/10 bg-white/5',
  warning: 'border-orange-500/20 bg-orange-500/5'
};

'use client';

import type { CoinMarket, HoldingWithMarket } from '@/lib/portfolio';
import { formatCurrency, formatPercent, formatCompact } from '@/lib/format';

interface MarketPulseProps {
  coins: CoinMarket[];
  portfolio: HoldingWithMarket[];
  status: 'idle' | 'loading' | 'error';
  errorMessage: string;
}

export default function MarketPulse({ coins, portfolio, status, errorMessage }: MarketPulseProps) {
  const gainers = [...coins]
    .filter((coin) => typeof coin.price_change_percentage_24h_in_currency === 'number')
    .sort((a, b) => (b.price_change_percentage_24h_in_currency ?? 0) - (a.price_change_percentage_24h_in_currency ?? 0))
    .slice(0, 3);

  const decliners = [...coins]
    .filter((coin) => typeof coin.price_change_percentage_24h_in_currency === 'number')
    .sort((a, b) => (a.price_change_percentage_24h_in_currency ?? 0) - (b.price_change_percentage_24h_in_currency ?? 0))
    .slice(0, 3);

  const volumeLeaders = [...coins]
    .filter((coin) => typeof coin.total_volume === 'number')
    .sort((a, b) => (b.total_volume ?? 0) - (a.total_volume ?? 0))
    .slice(0, 3);

  const coverage = portfolio.length
    ? portfolio.map((holding) => ({
        id: holding.id,
        symbol: holding.symbol,
        delta: holding.market?.price_change_percentage_24h_in_currency ?? 0,
        price: holding.market?.current_price ?? 0
      }))
    : [];

  return (
    <section className="rounded-3xl border border-white/10 bg-[#071027]/80 p-5">
      <header className="mb-4">
        <p className="text-xs uppercase tracking-[0.35em] text-sky-400/80">Market pulse</p>
        <h3 className="mt-1 text-lg font-semibold text-white">Signal radar</h3>
        <p className="text-xs text-white/50">Top movers, liquidity surges, and portfolio delta in the last 24 hours.</p>
      </header>

      {status === 'error' && (
        <div className="mb-4 rounded-2xl border border-orange-500/30 bg-orange-500/10 px-3 py-2 text-xs text-orange-200">
          {errorMessage}
        </div>
      )}

      <div className="space-y-5 text-xs">
        <MarketList title="Momentum leaders" coins={gainers} positive />
        <MarketList title="Under pressure" coins={decliners} />
        <MarketList title="Liquidity spotlight" coins={volumeLeaders} showVolume />
      </div>

      {coverage.length > 0 && (
        <div className="mt-5 rounded-2xl border border-white/10 bg-white/5 p-4">
          <p className="text-[11px] uppercase tracking-[0.4em] text-white/40">Your portfolio coverage</p>
          <div className="mt-3 grid gap-3">
            {coverage.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between text-sm text-white/70">
                <div className="font-semibold text-white">{asset.symbol.toUpperCase()}</div>
                <div className={asset.delta >= 0 ? 'text-emerald-300' : 'text-red-300'}>
                  {formatCurrency(asset.price)} · {formatPercent(asset.delta, { sign: 'always' })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

interface MarketListProps {
  title: string;
  coins: CoinMarket[];
  showVolume?: boolean;
  positive?: boolean;
}

function MarketList({ title, coins, showVolume, positive }: MarketListProps) {
  if (!coins.length) {
    return null;
  }
  return (
    <div>
      <p className="mb-2 text-[11px] uppercase tracking-[0.35em] text-white/30">{title}</p>
      <div className="space-y-2">
        {coins.map((coin) => (
          <div
            key={coin.id}
            className="flex items-center justify-between rounded-2xl border border-white/5 bg-white/[0.04] px-3 py-2 text-white/80"
          >
            <div className="flex items-center gap-2">
              <img src={coin.image} alt={coin.name} className="h-6 w-6 rounded-full" />
              <div>
                <p className="font-medium text-white">{coin.name}</p>
                <p className="text-[11px] uppercase tracking-[0.3em] text-white/40">{coin.symbol}</p>
              </div>
            </div>
            <div className="text-right font-mono text-xs">
              <p>{formatCurrency(coin.current_price)}</p>
              <p className={coin.price_change_percentage_24h_in_currency && coin.price_change_percentage_24h_in_currency >= 0 ? 'text-emerald-300' : 'text-red-300'}>
                {formatPercent(coin.price_change_percentage_24h_in_currency ?? 0, { sign: 'always' })}
              </p>
              {showVolume && (
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">
                  vol {formatCompact(coin.total_volume ?? 0)}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

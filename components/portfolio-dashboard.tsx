'use client';

import { useEffect, useMemo, useState } from 'react';
import { clsx } from 'clsx';
import AllocationChart from './visual-allocation-chart';
import AddAssetForm from './add-asset-form';
import HoldingsTable from './portfolio-table';
import InsightsPanel from './strategic-insights';
import PortfolioSnapshot from './portfolio-snapshot';
import MarketPulse from './market-pulse';
import type { CoinMarket, PortfolioHolding, HoldingWithMarket } from '@/lib/portfolio';
import { calculatePortfolioMetrics } from '@/lib/portfolio';

const STORAGE_KEY = 'cipherfolio::portfolio';

type FetchState = 'idle' | 'loading' | 'error';

const skeletonCards = Array.from({ length: 3 });

export default function PortfolioDashboard() {
  const [portfolio, setPortfolio] = useState<PortfolioHolding[]>([]);
  const [coins, setCoins] = useState<CoinMarket[]>([]);
  const [status, setStatus] = useState<FetchState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // load portfolio from local storage
  useEffect(() => {
    try {
      const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
      if (stored) {
        const parsed = JSON.parse(stored) as PortfolioHolding[];
        setPortfolio(parsed);
      }
    } catch (error) {
      console.error('Failed to restore portfolio from storage', error);
    }
  }, []);

  // persist portfolio to local storage
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
    } catch (error) {
      console.error('Failed to persist portfolio', error);
    }
  }, [portfolio]);

  useEffect(() => {
    const controller = new AbortController();
    const loadCoins = async () => {
      setStatus('loading');
      setErrorMessage('');
      try {
        const response = await fetch('/api/coins', { signal: controller.signal });
        if (!response.ok) throw new Error('Failed to reach market data endpoint');
        const payload = (await response.json()) as CoinMarket[];
        setCoins(payload);
        setStatus('idle');
      } catch (error) {
        if (controller.signal.aborted) return;
        console.error(error);
        setErrorMessage('Unable to sync with live market data. Retry in a few moments.');
        setStatus('error');
      }
    };

    loadCoins();
    const interval = setInterval(loadCoins, 1000 * 60 * 2); // refresh every 2 minutes
    return () => {
      controller.abort();
      clearInterval(interval);
    };
  }, []);

  const coinsById = useMemo(() => {
    return coins.reduce<Record<string, CoinMarket>>((acc, item) => {
      acc[item.id] = item;
      return acc;
    }, {});
  }, [coins]);

  const enrichedHoldings = useMemo<HoldingWithMarket[]>(() => {
    return portfolio.map((holding) => ({
      ...holding,
      market: coinsById[holding.id]
    }));
  }, [portfolio, coinsById]);

  const metrics = useMemo(() => calculatePortfolioMetrics(enrichedHoldings), [enrichedHoldings]);

  const handleAddHolding = (holding: PortfolioHolding) => {
    setPortfolio((prev) => {
      const existing = prev.find((item) => item.id === holding.id);
      if (existing) {
        const existingCost = existing.amount * existing.purchasePrice;
        const incomingCost = holding.amount * holding.purchasePrice;
        const totalAmount = existing.amount + holding.amount;
        const nextAmount = Number(totalAmount.toFixed(8));
        const averagedPrice = totalAmount > 0 ? (existingCost + incomingCost) / totalAmount : 0;
        return prev.map((item) =>
          item.id === holding.id
            ? {
                ...item,
                amount: nextAmount,
                purchasePrice: Number(averagedPrice.toFixed(4)),
                note: holding.note || item.note,
                addedAt: holding.addedAt
              }
            : item
        );
      }
      return [...prev, holding];
    });
  };

  const handleUpdateHolding = (id: string, updates: Partial<PortfolioHolding>) => {
    setPortfolio((prev) =>
      prev.map((item) =>
        item.id === id
          ? {
              ...item,
              ...updates,
              amount: updates.amount ?? item.amount,
              purchasePrice: updates.purchasePrice ?? item.purchasePrice
            }
          : item
      )
    );
  };

  const handleRemoveHolding = (id: string) => {
    setPortfolio((prev) => prev.filter((item) => item.id !== id));
  };

  const handleReset = () => {
    setPortfolio([]);
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col gap-10 px-6 pb-16 pt-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-semibold uppercase tracking-[0.35em] text-[11px] text-sky-400/80">
            Cipherfolio
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-white md:text-4xl">
            Autonomous Crypto Portfolio Command Center
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/70">
            Monitor performance, surface actionable insights, and stay in sync with real-time market
            dynamics. Your data stays local while live pricing fuels the analytics.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm text-white/60">
          <span
            className={clsx(
              'inline-flex items-center gap-2 rounded-full px-3 py-1',
              status === 'loading' && 'bg-sky-500/10 text-sky-300',
              status === 'error' && 'bg-red-500/10 text-red-300',
              status === 'idle' && 'bg-emerald-500/10 text-emerald-300'
            )}
          >
            <span className="relative flex h-2 w-2">
              <span
                className={clsx(
                  'absolute inline-flex h-full w-full animate-ping rounded-full',
                  status === 'loading' && 'bg-sky-400',
                  status === 'error' && 'bg-red-400',
                  status === 'idle' && 'bg-emerald-400'
                )}
              />
              <span
                className={clsx(
                  'relative inline-flex h-2 w-2 rounded-full',
                  status === 'loading' && 'bg-sky-400',
                  status === 'error' && 'bg-red-400',
                  status === 'idle' && 'bg-emerald-400'
                )}
              />
            </span>
            {status === 'loading' && 'Refreshing market feed'}
            {status === 'idle' && 'Live market feed online'}
            {status === 'error' && 'Market sync unavailable'}
          </span>
          {portfolio.length > 0 && (
            <button
              type="button"
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 font-medium text-white transition hover:border-white/20 hover:bg-white/10"
              onClick={handleReset}
            >
              Clear portfolio
            </button>
          )}
        </div>
      </header>

      <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-6">
          <PortfolioSnapshot metrics={metrics} />
          <HoldingsTable
            holdings={enrichedHoldings}
            metrics={metrics}
            onUpdate={handleUpdateHolding}
            onRemove={handleRemoveHolding}
          />
        </div>
        <div className="flex flex-col gap-6">
          <AddAssetForm coins={coins} onSubmit={handleAddHolding} />
          <AllocationChart metrics={metrics} />
          <MarketPulse coins={coins} portfolio={enrichedHoldings} status={status} errorMessage={errorMessage} />
          <InsightsPanel metrics={metrics} />
        </div>
      </section>

      {status === 'error' && (
        <div className="rounded-2xl border border-red-500/20 bg-red-500/5 px-6 py-4 text-sm text-red-200">
          {errorMessage}
        </div>
      )}

      {status === 'loading' && coins.length === 0 && (
        <section className="grid gap-4 md:grid-cols-3">
          {skeletonCards.map((_, index) => (
            <div
              key={index}
              className="h-32 animate-pulse rounded-2xl border border-white/5 bg-white/5"
            />
          ))}
        </section>
      )}
    </div>
  );
}

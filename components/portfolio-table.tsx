'use client';

import { useState } from 'react';
import type { HoldingWithMarket, PortfolioMetrics, PortfolioHolding } from '@/lib/portfolio';
import { formatCurrency, formatPercent } from '@/lib/format';

interface HoldingsTableProps {
  holdings: HoldingWithMarket[];
  metrics: PortfolioMetrics;
  onUpdate: (id: string, updates: Partial<PortfolioHolding>) => void;
  onRemove: (id: string) => void;
}

export default function HoldingsTable({ holdings, metrics, onUpdate, onRemove }: HoldingsTableProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draftAmount, setDraftAmount] = useState('');
  const [draftPrice, setDraftPrice] = useState('');
  const [draftNote, setDraftNote] = useState('');

  const startEditing = (holding: HoldingWithMarket) => {
    setEditingId(holding.id);
    setDraftAmount(String(holding.amount));
    setDraftPrice(String(holding.purchasePrice));
    setDraftNote(holding.note ?? '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setDraftAmount('');
    setDraftPrice('');
    setDraftNote('');
  };

  const commitEditing = (id: string) => {
    const amount = Number.parseFloat(draftAmount);
    const purchasePrice = Number.parseFloat(draftPrice);
    if (Number.isNaN(amount) || Number.isNaN(purchasePrice)) return;
    onUpdate(id, {
      amount: Number(amount.toFixed(8)),
      purchasePrice: Number(purchasePrice.toFixed(4)),
      note: draftNote.trim() || undefined
    });
    cancelEditing();
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-[#050b17]/70 backdrop-blur">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-white/5 px-6 py-5">
        <div>
          <p className="text-xs uppercase tracking-[0.35em] text-sky-400/80">Holdings</p>
          <h3 className="text-lg font-semibold text-white">Active allocations</h3>
        </div>
        <p className="text-xs text-white/50">{holdings.length} assets tracked</p>
      </header>
      <div className="overflow-x-auto">
        <table className="min-w-full table-fixed border-collapse text-sm text-white/70">
          <thead className="text-xs uppercase tracking-[0.3em] text-white/30">
            <tr>
              <th className="px-6 py-4 text-left">Asset</th>
              <th className="px-4 py-4 text-right">Amount</th>
              <th className="px-4 py-4 text-right">Avg cost</th>
              <th className="px-4 py-4 text-right">Value</th>
              <th className="px-4 py-4 text-right">P/L</th>
              <th className="px-4 py-4 text-right">24h</th>
              <th className="px-4 py-4 text-right">Allocation</th>
              <th className="px-4 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {holdings.length === 0 && (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-sm text-white/50">
                  Build your first position to activate live tracking, ROI analytics, and intelligence.
                </td>
              </tr>
            )}

            {holdings.map((holding) => {
              const price = holding.market?.current_price ?? 0;
              const cost = holding.amount * holding.purchasePrice;
              const value = holding.amount * price;
              const profit = value - cost;
              const roi = cost > 0 ? (profit / cost) * 100 : 0;
              const dailyPct = holding.market?.price_change_percentage_24h_in_currency ?? 0;
              const dailyChange = value * (dailyPct / 100);
              const allocation = metrics.totalValue > 0 ? (value / metrics.totalValue) * 100 : 0;

              const isEditing = editingId === holding.id;

              return (
                <tr
                  key={holding.id}
                  className="border-t border-white/5 bg-white/[0.02] transition hover:bg-white/[0.05]"
                >
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-3">
                      {holding.image && (
                        <img src={holding.image} alt={holding.name} className="h-8 w-8 rounded-full" />
                      )}
                      <div>
                        <p className="font-medium text-white">{holding.name}</p>
                        <p className="text-xs uppercase tracking-[0.2em] text-white/40">{holding.symbol}</p>
                        {holding.note && <p className="mt-1 text-xs text-white/40">{holding.note}</p>}
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-5 text-right font-mono text-sm text-white">
                    {isEditing ? (
                      <input
                        value={draftAmount}
                        onChange={(event) => setDraftAmount(event.target.value)}
                        className="w-24 rounded-xl border border-white/10 bg-white/10 px-2 py-1 text-right text-sm text-white"
                      />
                    ) : (
                      holding.amount
                    )}
                  </td>

                  <td className="px-4 py-5 text-right font-mono text-sm text-white/80">
                    {isEditing ? (
                      <input
                        value={draftPrice}
                        onChange={(event) => setDraftPrice(event.target.value)}
                        className="w-24 rounded-xl border border-white/10 bg-white/10 px-2 py-1 text-right text-sm text-white"
                      />
                    ) : (
                      formatCurrency(holding.purchasePrice)
                    )}
                  </td>

                  <td className="px-4 py-5 text-right font-mono text-sm text-white">
                    {formatCurrency(value)}
                  </td>

                  <td
                    className={`px-4 py-5 text-right font-mono text-sm ${profit >= 0 ? 'text-emerald-300' : 'text-red-300'}`}
                  >
                    {formatCurrency(profit)}
                    <span className="ml-2 text-xs">{formatPercent(roi, { sign: 'always' })}</span>
                  </td>

                  <td className={`px-4 py-5 text-right font-mono text-sm ${dailyChange >= 0 ? 'text-sky-200' : 'text-orange-200'}`}>
                    {formatCurrency(dailyChange)}
                    <span className="ml-2 text-xs">{formatPercent(dailyPct, { sign: 'always' })}</span>
                  </td>

                  <td className="px-4 py-5 text-right font-mono text-sm text-white/80">
                    {metrics.totalValue === 0 ? '—' : `${allocation.toFixed(1)}%`}
                  </td>

                  <td className="px-4 py-5 text-right text-xs">
                    {isEditing ? (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="rounded-full border border-white/10 px-3 py-1 text-white/70 hover:border-white/20 hover:text-white"
                          onClick={cancelEditing}
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          className="rounded-full bg-emerald-500/80 px-3 py-1 text-white hover:bg-emerald-400/90"
                          onClick={() => commitEditing(holding.id)}
                        >
                          Save
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          className="rounded-full border border-white/10 px-3 py-1 text-white/70 transition hover:border-white/20 hover:text-white"
                          onClick={() => startEditing(holding)}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-white/10 px-3 py-1 text-red-300 transition hover:border-red-400/60"
                          onClick={() => onRemove(holding.id)}
                        >
                          Remove
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

'use client';

import { useMemo, useState } from 'react';
import type { CoinMarket, PortfolioHolding } from '@/lib/portfolio';

interface AddAssetFormProps {
  coins: CoinMarket[];
  onSubmit: (holding: PortfolioHolding) => void;
}

const sanitizeNumber = (value: string) => value.replace(/[^0-9.]/g, '');

export default function AddAssetForm({ coins, onSubmit }: AddAssetFormProps) {
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string>('');
  const [amount, setAmount] = useState('');
  const [price, setPrice] = useState('');
  const [note, setNote] = useState('');
  const [expanded, setExpanded] = useState(false);

  const selectedCoin = useMemo(() => coins.find((coin) => coin.id === selectedId), [coins, selectedId]);

  const suggestions = useMemo(() => {
    if (!query) {
      return coins.slice(0, 6);
    }
    const lowered = query.toLowerCase();
    return coins
      .filter((coin) => coin.name.toLowerCase().includes(lowered) || coin.symbol.toLowerCase().startsWith(lowered))
      .slice(0, 8);
  }, [coins, query]);

  const handleSelectCoin = (coin: CoinMarket) => {
    setQuery(`${coin.name} (${coin.symbol.toUpperCase()})`);
    setSelectedId(coin.id);
    if (!price) {
      setPrice(String(coin.current_price));
    }
    setExpanded(false);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (event) => {
    event.preventDefault();
    if (!selectedCoin) return;

    const parsedAmount = parseFloat(amount);
    const parsedPrice = parseFloat(price);

    if (Number.isNaN(parsedAmount) || Number.isNaN(parsedPrice)) return;
    if (parsedAmount <= 0 || parsedPrice <= 0) return;

    const holding: PortfolioHolding = {
      id: selectedCoin.id,
      symbol: selectedCoin.symbol,
      name: selectedCoin.name,
      image: selectedCoin.image,
      amount: Number(parsedAmount.toFixed(8)),
      purchasePrice: Number(parsedPrice.toFixed(4)),
      note: note.trim() || undefined,
      addedAt: new Date().toISOString()
    };

    onSubmit(holding);
    setAmount('');
    setPrice('');
    setNote('');
    setQuery('');
    setSelectedId('');
  };

  return (
    <section className="rounded-3xl border border-white/10 bg-white/[0.06] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)] backdrop-blur">
      <header className="mb-4">
        <p className="text-xs uppercase tracking-[0.4em] text-sky-400/80">Add Transaction</p>
        <h2 className="mt-2 text-xl font-semibold text-white">Capture a new position</h2>
        <p className="text-sm text-white/60">
          Select a crypto asset, record the unit count and cost basis. We&apos;ll handle performance tracking and analytics.
        </p>
      </header>
      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <div className="relative">
          <label className="text-xs uppercase tracking-[0.3em] text-white/40">Asset</label>
          <input
            value={query}
            onFocus={() => setExpanded(true)}
            onChange={(event) => {
              setQuery(event.target.value);
              setExpanded(true);
              setSelectedId('');
            }}
            placeholder="Search by name or symbol"
            className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/60 focus:bg-white/[0.08]"
          />
          {expanded && suggestions.length > 0 && (
            <div className="absolute z-20 mt-2 max-h-60 w-full overflow-y-auto rounded-2xl border border-white/10 bg-[#0c121f]/95 backdrop-blur">
              {suggestions.map((coin) => (
                <button
                  key={coin.id}
                  type="button"
                  className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left text-sm text-white/80 transition hover:bg-white/5"
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => handleSelectCoin(coin)}
                >
                  <div className="flex items-center gap-3">
                    <img src={coin.image} alt={coin.name} className="h-6 w-6 rounded-full" />
                    <div>
                      <p className="font-medium text-white">{coin.name}</p>
                      <p className="text-xs uppercase text-white/40">{coin.symbol}</p>
                    </div>
                  </div>
                  <p className="text-xs text-white/60">${coin.current_price.toLocaleString()}</p>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-white/40">Quantity</label>
            <input
              inputMode="decimal"
              value={amount}
              onChange={(event) => setAmount(sanitizeNumber(event.target.value))}
              placeholder="e.g. 1.5"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/60 focus:bg-white/[0.08]"
              required
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-[0.3em] text-white/40">Purchase price (USD)</label>
            <input
              inputMode="decimal"
              value={price}
              onChange={(event) => setPrice(sanitizeNumber(event.target.value))}
              placeholder={selectedCoin ? selectedCoin.current_price.toLocaleString() : 'Entry price'}
              className="mt-2 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/60 focus:bg-white/[0.08]"
              required
            />
          </div>
        </div>

        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-white/40">Strategy note (optional)</label>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            placeholder="Capture context or targets for this position"
            className="mt-2 w-full rounded-3xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none transition focus:border-sky-400/60 focus:bg-white/[0.08]"
          />
        </div>

        <button
          type="submit"
          disabled={!selectedCoin}
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-transparent bg-sky-500/90 px-6 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-sky-400/90 disabled:cursor-not-allowed disabled:bg-slate-500/40"
        >
          Add position
        </button>
      </form>
    </section>
  );
}

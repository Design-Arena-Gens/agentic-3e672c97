import { NextResponse } from 'next/server';

const COINGECKO_ENDPOINT =
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=250&page=1&sparkline=false&price_change_percentage=1h,24h,7d';

export const revalidate = 60;

export async function GET() {
  try {
    const response = await fetch(COINGECKO_ENDPOINT, {
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json'
      },
      next: { revalidate: 60 }
    });

    if (!response.ok) {
      throw new Error('Market data provider responded with non-ok status');
    }

    const data = await response.json();
    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });
  } catch (error) {
    console.error('[coins-api]', error);
    return NextResponse.json({ message: 'Failed to fetch market data' }, { status: 503 });
  }
}

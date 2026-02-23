import axios from 'axios';
import crypto from 'crypto';

const BASE_URL = 'https://api.mexc.com';

function sign(queryString: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(queryString).digest('hex');
}

export interface Candle {
    openTime: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export interface OrderResult {
    orderId: string;
    symbol: string;
    side: string;
    price: number;
    qty: number;
    status: string;
}

/** Fetch OHLCV candles from MEXC */
export async function getCandles(
    symbol: string,
    interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' = '15m',
    limit = 100
): Promise<Candle[]> {
    const res = await axios.get(`${BASE_URL}/api/v3/klines`, {
        params: { symbol, interval, limit }
    });
    // MEXC kline format: [openTime, open, high, low, close, volume, ...]
    return (res.data as any[]).map((k: any) => ({
        openTime: Number(k[0]),
        open: parseFloat(k[1]),
        high: parseFloat(k[2]),
        low: parseFloat(k[3]),
        close: parseFloat(k[4]),
        volume: parseFloat(k[5])
    }));
}

/** Get current ticker price */
export async function getPrice(symbol: string): Promise<number> {
    const res = await axios.get(`${BASE_URL}/api/v3/ticker/price`, {
        params: { symbol }
    });
    return parseFloat((res.data as any).price);
}

/** Get account balance (requires API key + secret) */
export async function getBalance(apiKey: string, secret: string): Promise<Record<string, number>> {
    const timestamp = Date.now();
    const queryString = `timestamp=${timestamp}`;
    const signature = sign(queryString, secret);

    const res = await axios.get(`${BASE_URL}/api/v3/account`, {
        params: { timestamp, signature },
        headers: { 'X-MEXC-APIKEY': apiKey }
    });

    const balances: Record<string, number> = {};
    for (const b of (res.data as any).balances ?? []) {
        const free = parseFloat(b.free);
        if (free > 0) balances[b.asset] = free;
    }
    return balances;
}

/** Get USDT balance specifically */
export async function getUsdtBalance(apiKey: string, secret: string): Promise<number> {
    const balances = await getBalance(apiKey, secret);
    return balances['USDT'] ?? 0;
}

/** Place a market order */
export async function placeOrder(
    symbol: string,
    side: 'BUY' | 'SELL',
    quoteQty: number, // in USDT
    apiKey: string,
    secret: string,
    paperTrade = true
): Promise<OrderResult> {
    if (paperTrade) {
        const price = await getPrice(symbol);
        console.log(`[MEXC][PAPER] ${side} ${symbol} | notional: $${quoteQty.toFixed(2)} | price: ${price}`);
        return {
            orderId: 'paper-' + Date.now(),
            symbol,
            side,
            price,
            qty: quoteQty / price,
            status: 'FILLED'
        };
    }

    const timestamp = Date.now();
    const params: Record<string, string | number> = {
        symbol,
        side,
        type: 'MARKET',
        quoteOrderQty: quoteQty.toFixed(2),
        timestamp
    };
    const queryString = new URLSearchParams(params as any).toString();
    const signature = sign(queryString, secret);

    const res = await axios.post(
        `${BASE_URL}/api/v3/order`,
        null,
        { params: { ...params, signature }, headers: { 'X-MEXC-APIKEY': apiKey } }
    );

    const d = res.data as any;
    return {
        orderId: d.orderId,
        symbol: d.symbol,
        side: d.side,
        price: parseFloat(d.fills?.[0]?.price ?? d.price ?? '0'),
        qty: parseFloat(d.executedQty),
        status: d.status
    };
}

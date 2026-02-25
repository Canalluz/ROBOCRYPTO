import axios from 'axios';
import crypto from 'crypto';

const BASE_URL = 'https://api.mexc.com';
const FUTURES_BASE_URL = 'https://contract.mexc.com';

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
    interval: '1m' | '5m' | '15m' | '1h' | '4h' | '1d' | '1D' | string = '15m',
    limit = 100
): Promise<Candle[]> {
    try {
        const intervalMap: Record<string, string> = {
            '1m': '1m', '5m': '5m', '15m': '15m', '30m': '30m',
            '1h': '60m', '4h': '4h', '1d': '1d', '1w': '1W', '1M': '1M'
        };
        const mexcInterval = intervalMap[interval] || interval;

        const res = await axios.get(`${BASE_URL}/api/v3/klines`, {
            params: { symbol, interval: mexcInterval, limit }
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
    } catch (e: any) {
        console.error(`[MEXC getCandles Error] interval: ${interval} -`, e.response?.data || e.message);
        throw e;
    }
}

/** Get current ticker price */
export async function getPrice(symbol: string): Promise<number> {
    const res = await axios.get(`${BASE_URL}/api/v3/ticker/price`, {
        params: { symbol }
    });
    return parseFloat((res.data as any).price);
}

/** Get MEXC server time to avoid clock drift issues */
async function getServerTime(): Promise<number> {
    try {
        const res = await axios.get(`${BASE_URL}/api/v3/time`);
        return (res.data as any).serverTime;
    } catch {
        return Date.now();
    }
}

/** Get account balance (requires API key + secret) */
export async function getBalance(apiKey: string, secret: string): Promise<Record<string, number>> {
    const timestamp = await getServerTime();
    const recvWindow = 60000;
    // MEXC requires: all params except signature joined into query string, then signed
    const queryString = `recvWindow=${recvWindow}&timestamp=${timestamp}`;
    const signature = sign(queryString, secret);

    const res = await axios.get(`${BASE_URL}/api/v3/account`, {
        params: { recvWindow, timestamp, signature },
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

/** Place a market order — routes to SPOT or FUTURES based on marketMode */
export async function placeOrder(
    symbol: string,
    side: 'BUY' | 'SELL',
    quoteQty: number, // in USDT
    apiKey: string,
    secret: string,
    paperTrade = true,
    marketMode: 'SPOT' | 'FUTURES' = 'SPOT',
    leverage = 1
): Promise<OrderResult> {
    if (paperTrade) {
        const price = await getPrice(symbol);
        console.log(`[MEXC][PAPER][${marketMode}] ${side} ${symbol} | notional: $${quoteQty.toFixed(2)} | price: ${price}`);
        return {
            orderId: 'paper-' + Date.now(),
            symbol,
            side,
            price,
            qty: quoteQty / price,
            status: 'FILLED'
        };
    }

    if (marketMode === 'FUTURES') {
        return placeFuturesOrder(symbol, side, quoteQty, apiKey, secret, leverage);
    }

    // --- SPOT order ---
    const timestamp = await getServerTime();

    // The MEXC API is very strict about signature payloads
    // We add recvWindow to prevent timestamp drifting errors
    const paramsMap: Record<string, string> = {
        quoteOrderQty: quoteQty.toFixed(2),
        recvWindow: '10000',
        side,
        symbol,
        timestamp: timestamp.toString(),
        type: 'MARKET'
    };

    const queryString = Object.keys(paramsMap)
        .sort()
        .map(k => `${k}=${paramsMap[k]}`)
        .join('&');

    const signature = sign(queryString, secret);
    const finalUrl = `${BASE_URL}/api/v3/order?${queryString}&signature=${signature}`;

    // Some environments strip POST headers if body is null/empty. We use application/json with {} body
    const res = await fetch(finalUrl, {
        method: 'POST',
        headers: {
            'X-MEXC-APIKEY': apiKey,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({}) // Force a body payload to ensure POST integrity on strict proxies
    });

    if (!res.ok) {
        let errStr = '';
        try {
            const errObj = await res.json();
            errStr = errObj.msg || JSON.stringify(errObj);
        } catch {
            errStr = await res.text();
        }
        throw new Error(errStr || `HTTP Error ${res.status}`);
    }

    const d = await res.json();
    return {
        orderId: d.orderId,
        symbol: d.symbol,
        side: d.side,
        price: parseFloat(d.fills?.[0]?.price ?? d.price ?? '0'),
        qty: parseFloat(d.executedQty),
        status: d.status
    };
}

/** Place a FUTURES/contracts order on MEXC contract API */
async function placeFuturesOrder(
    symbol: string,
    side: 'BUY' | 'SELL',
    quoteQty: number,
    apiKey: string,
    secret: string,
    leverage = 1
): Promise<OrderResult> {
    // MEXC Futures uses _USDT suffix and different side codes: 1=open long, 2=close short, 3=open short, 4=close long
    const futuresSymbol = symbol.endsWith('_USDT') ? symbol : symbol.replace('USDT', '_USDT');
    const openType = 1; // 1=CROSS margin
    const orderSide = side === 'BUY' ? 1 : 3; // 1=open long, 3=open short

    const timestamp = await getServerTime();
    const price = await getPrice(symbol); // needed to compute vol
    const vol = Math.floor((quoteQty * leverage) / price * 10000) / 10000; // contracts

    const body: Record<string, any> = {
        symbol: futuresSymbol,
        side: orderSide,
        openType,
        type: 5, // 5 = market order in MEXC futures
        vol,
        leverage,
        timestamp
    };

    const bodyStr = JSON.stringify(body);
    const signStr = apiKey + timestamp + bodyStr;
    const signature = crypto.createHmac('sha256', secret).update(signStr).digest('hex');

    const res = await axios.post(
        `${FUTURES_BASE_URL}/api/v1/private/order/submit`,
        body,
        {
            headers: {
                'Content-Type': 'application/json',
                'ApiKey': apiKey,
                'Request-Time': String(timestamp),
                'Signature': signature
            }
        }
    );

    const d = res.data as any;
    const orderId = d?.data ?? ('futures-' + Date.now());
    console.log(`[MEXC][FUTURES] ${side} ${futuresSymbol} | vol: ${vol} | leverage: ${leverage}x | orderId: ${orderId}`);
    return {
        orderId: String(orderId),
        symbol: futuresSymbol,
        side,
        price,
        qty: vol,
        status: d?.success ? 'FILLED' : 'REJECTED'
    };
}

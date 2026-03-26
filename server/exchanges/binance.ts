import axios from 'axios';
import crypto from 'crypto';

const BASE_URL = 'https://api.binance.com';

function sign(queryString: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(queryString).digest('hex');
}

/** Get Binance server time to avoid clock drift issues */
async function getServerTime(): Promise<number> {
    try {
        const res = await axios.get(`${BASE_URL}/api/v3/time`);
        return (res.data as any).serverTime;
    } catch {
        return Date.now();
    }
}

export async function getBalance(apiKey: string, secret: string): Promise<Record<string, number>> {
    const timestamp = await getServerTime();
    const queryString = `timestamp=${timestamp}`;
    const signature = sign(queryString, secret);

    const res = await axios.get(`${BASE_URL}/api/v3/account`, {
        params: { timestamp, signature },
        headers: { 'X-MBX-APIKEY': apiKey }
    });

    const balances: Record<string, number> = {};
    for (const b of (res.data as any).balances ?? []) {
        const free = parseFloat(b.free);
        if (free > 0) balances[b.asset] = free;
    }
    return balances;
}

export async function getUsdtBalance(apiKey: string, secret: string): Promise<number> {
    const balances = await getBalance(apiKey, secret);
    return balances['USDT'] ?? balances['USDC'] ?? balances['BUSD'] ?? 0;
}

/** Get total account value in USDT (Stablecoins + positions) */
export async function getAccountTotalValue(apiKey: string, secret: string): Promise<number> {
    try {
        const balances = await getBalance(apiKey, secret);
        const allPricesRes = await axios.get(`${BASE_URL}/api/v3/ticker/price`);
        const priceMap: Record<string, number> = {};
        for (const p of allPricesRes.data as any[]) {
            priceMap[p.symbol] = parseFloat(p.price);
        }

        let total = 0;
        for (const [asset, qty] of Object.entries(balances)) {
            if (asset === 'USDT' || asset === 'USDC' || asset === 'BUSD' || asset === 'TUSD') {
                total += qty;
            } else {
                const price = priceMap[asset + 'USDT'] || 0;
                total += qty * price;
            }
        }
        return total;
    } catch (e) {
        console.error('[BINANCE] Error calculating total value:', e);
        return getUsdtBalance(apiKey, secret);
    }
}

/** Place a market order on Binance */
export async function placeOrder(
    symbol: string,
    side: 'BUY' | 'SELL',
    amount: number, // USDT for BUY, Asset quantity for SELL
    apiKey: string,
    secret: string,
    paperTrade = true
): Promise<any> {
    if (paperTrade) {
        return { orderId: 'paper-' + Date.now(), symbol, side, status: 'FILLED' };
    }

    const timestamp = await getServerTime();
    const params: Record<string, any> = {
        symbol,
        side,
        type: 'MARKET',
        timestamp
    };

    if (side === 'BUY') {
        params.quoteOrderQty = amount.toFixed(2);
    } else {
        params.quantity = amount.toFixed(6);
    }

    const queryString = Object.keys(params).map(k => `${k}=${params[k]}`).join('&');
    const signature = sign(queryString, secret);

    const res = await axios.post(`${BASE_URL}/api/v3/order?${queryString}&signature=${signature}`, null, {
        headers: { 'X-MBX-APIKEY': apiKey }
    });

    return res.data;
}

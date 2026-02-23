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
    return balances['USDT'] ?? 0;
}

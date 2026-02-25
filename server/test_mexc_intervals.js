import axios from 'axios';
const BASE_URL = 'https://api.mexc.com';

async function testIntervals() {
    const intervals = ['1m', '5m', '15m', '30m', '60m', '1h', '4h', '1d', '1D', '1W', '1w', '1M'];
    for (const interval of intervals) {
        try {
            await axios.get(`${BASE_URL}/api/v3/klines`, {
                params: { symbol: 'BTCUSDT', interval, limit: 10 }
            });
            console.log(`Interval ${interval} is VALID`);
        } catch (e) {
            console.log(`Interval ${interval} is INVALID: ${e.response?.data?.msg || e.message}`);
        }
    }
}

testIntervals();

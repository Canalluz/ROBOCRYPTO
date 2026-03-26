import { getCandles } from './server/exchanges/mexc.js';

async function test() {
    try {
        console.log("Fetching candles for TAIUSDT...");
        const candles = await getCandles('TAIUSDT', '1h', 200);
        console.log(`Success! Fetched ${candles.length} candles.`);
        if (candles.length > 0) {
            console.log("Last candle:", candles[candles.length - 1]);
        }
    } catch (e) {
        console.error("Failed to fetch candles:", e.message);
    }
}

test();

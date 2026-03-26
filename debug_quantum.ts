import { getCandles } from './server/exchanges/mexc.js';
import { quantumEdge } from './server/strategies/quantum-edge.js';

async function debug() {
    try {
        const symbol = 'TAIUSDT';
        const candles = await getCandles(symbol, '1h', 200);
        const config = { minConfidence: 60 };
        const ctx = { candles, symbol, config };
        
        const signal = quantumEdge(ctx as any);
        console.log(`DEBUG SIGNAL for ${symbol}:`, signal);
    } catch (e) {
        console.error("Debug failed:", e.message);
    }
}

debug();

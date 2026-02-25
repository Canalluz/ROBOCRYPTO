import { TradeSignal, StrategyContext } from '../types.js';

function calculateSMA(prices: number[], period: number): number {
    const slice = prices.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / slice.length;
}

function calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;
    const changes = prices.slice(-period - 1).map((p, i, arr) => i === 0 ? 0 : p - arr[i - 1]).slice(1);
    const gains = changes.filter(c => c > 0);
    const losses = changes.filter(c => c < 0).map(c => Math.abs(c));
    const avgGain = gains.length ? gains.reduce((a, b) => a + b, 0) / period : 0;
    const avgLoss = losses.length ? losses.reduce((a, b) => a + b, 0) / period : 1;
    return 100 - (100 / (1 + avgGain / avgLoss));
}

/**
 * Simple MA Cross Strategy
 * Classic dual moving average crossover (SMA9/SMA21) + RSI confirmation
 * Simple, reliable, fewer false signals than aggressive scalp
 */
export const simpleMaCross = ({ candles, symbol, config }: StrategyContext): TradeSignal => {
    if (candles.length < 30) {
        return { symbol, action: 'HOLD', reason: 'Not enough candles (need 30+)' };
    }

    const closes = candles.map(c => c.close);
    const currentPrice = closes[closes.length - 1];

    const sma9 = calculateSMA(closes, 9);
    const sma21 = calculateSMA(closes, 21);
    const sma9prev = calculateSMA(closes.slice(0, -1), 9);
    const sma21prev = calculateSMA(closes.slice(0, -1), 21);
    const rsi = calculateRSI(closes);

    const bullishCross = sma9prev <= sma21prev && sma9 > sma21;
    const bearishCross = sma9prev >= sma21prev && sma9 < sma21;

    // Crossover signals
    if (bullishCross && rsi < 72) {
        return { symbol, action: 'BUY', price: currentPrice, reason: `SMA9 crossed SMA21 (bullish) | RSI: ${rsi.toFixed(1)}`, stopLoss: currentPrice * (1 - (config.stopLossPct ?? 1) / 100), takeProfit: currentPrice * (1 + (config.takeProfitPct ?? 1.5) / 100) };
    }
    if (bearishCross && rsi > 28) {
        return { symbol, action: 'SELL', price: currentPrice, reason: `SMA9 crossed SMA21 (bearish) | RSI: ${rsi.toFixed(1)}`, stopLoss: currentPrice * (1 + (config.stopLossPct ?? 1) / 100), takeProfit: currentPrice * (1 - (config.takeProfitPct ?? 1.5) / 100) };
    }

    // Momentum: SMA aligned + RSI extreme
    if (sma9 > sma21 && rsi < 40) {
        return { symbol, action: 'BUY', price: currentPrice, reason: `MA aligned bullish + RSI oversold: ${rsi.toFixed(1)}`, stopLoss: currentPrice * (1 - (config.stopLossPct ?? 1) / 100), takeProfit: currentPrice * (1 + (config.takeProfitPct ?? 1.5) / 100) };
    }
    if (sma9 < sma21 && rsi > 60) {
        return { symbol, action: 'SELL', price: currentPrice, reason: `MA aligned bearish + RSI overbought: ${rsi.toFixed(1)}`, stopLoss: currentPrice * (1 + (config.stopLossPct ?? 1) / 100), takeProfit: currentPrice * (1 - (config.takeProfitPct ?? 1.5) / 100) };
    }

    return { symbol, action: 'HOLD', reason: `Simple MA/HOLD | SMA9:${sma9.toFixed(2)} SMA21:${sma21.toFixed(2)} RSI:${rsi.toFixed(1)}` };
};

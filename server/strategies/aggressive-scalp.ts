import { TradeSignal, StrategyContext } from '../types.js';

// Calculate Exponential Moving Average
function calculateEMA(prices: number[], period: number): number[] {
    const k = 2 / (period + 1);
    const ema = [prices[0]];
    for (let i = 1; i < prices.length; i++) {
        ema.push(prices[i] * k + ema[i - 1] * (1 - k));
    }
    return ema;
}

// Calculate RSI
function calculateRSI(prices: number[], period: number = 14): number {
    if (prices.length < period + 1) return 50;
    const changes = prices.slice(-period - 1).map((p, i, arr) => i === 0 ? 0 : p - arr[i - 1]).slice(1);
    const gains = changes.filter(c => c > 0);
    const losses = changes.filter(c => c < 0).map(c => Math.abs(c));
    const avgGain = gains.length ? gains.reduce((a, b) => a + b, 0) / period : 0;
    const avgLoss = losses.length ? losses.reduce((a, b) => a + b, 0) / period : 1;
    return 100 - (100 / (1 + avgGain / avgLoss));
}

// Aggressive Scalp Strategy
// Fires on:
//   1. EMA 9/21 crossover (classic signal)
//   2. Strong EMA separation alignment with RSI confirmation (momentum entry)
export const aggressiveScalp = ({ candles, symbol, config }: StrategyContext): TradeSignal => {
    if (candles.length < 50) {
        return { symbol, action: 'HOLD', reason: 'Not enough candles (need 50+)' };
    }

    const closes = candles.map(c => c.close);
    const currentPrice = closes[closes.length - 1];
    const minCandles = Math.min(candles.length, 200);
    const recentCloses = closes.slice(-minCandles);

    const ema9 = calculateEMA(recentCloses, 9);
    const ema21 = calculateEMA(recentCloses, 21);
    const ema200 = recentCloses.length >= 200 ? calculateEMA(recentCloses, 200) : null;
    const rsi = calculateRSI(recentCloses);

    const currentEma9 = ema9[ema9.length - 1];
    const currentEma21 = ema21[ema21.length - 1];
    const currentEma200 = ema200 ? ema200[ema200.length - 1] : null;

    const prevEma9 = ema9[ema9.length - 2];
    const prevEma21 = ema21[ema21.length - 2];

    // Price relative to EMA 200 trend filter (fallback: use EMA 21 if not enough data)
    const inUptrend = currentEma200 ? currentPrice > currentEma200 : currentPrice > currentEma21;
    const inDowntrend = currentEma200 ? currentPrice < currentEma200 : currentPrice < currentEma21;

    // === SIGNAL 1: EMA 9/21 Crossover (classic) ===
    const bullishCross = prevEma9 <= prevEma21 && currentEma9 > currentEma21;
    const bearishCross = prevEma9 >= prevEma21 && currentEma9 < currentEma21;

    if (bullishCross && inUptrend && rsi < 75) {
        return {
            symbol,
            action: 'BUY',
            price: currentPrice,
            reason: `EMA 9 crossed above EMA 21 | RSI: ${rsi.toFixed(1)}`,
            stopLoss: currentPrice * (1 - (config.stopLossPct ?? 1) / 100),
            takeProfit: currentPrice * (1 + (config.takeProfitPct ?? 1.5) / 100)
        };
    }

    if (bearishCross && inDowntrend && rsi > 25) {
        return {
            symbol,
            action: 'SELL',
            price: currentPrice,
            reason: `EMA 9 crossed below EMA 21 | RSI: ${rsi.toFixed(1)}`,
            stopLoss: currentPrice * (1 + (config.stopLossPct ?? 1) / 100),
            takeProfit: currentPrice * (1 - (config.takeProfitPct ?? 1.5) / 100)
        };
    }

    // === SIGNAL 2: Momentum confirmation (EMA aligned + RSI oversold/overbought) ===
    const ema9AboveEma21 = currentEma9 > currentEma21;
    const ema9BelowEma21 = currentEma9 < currentEma21;
    const separation = Math.abs(currentEma9 - currentEma21) / currentEma21 * 100; // % separation

    // Strong bullish momentum: EMA aligned in uptrend, RSI just came out of oversold
    if (ema9AboveEma21 && inUptrend && rsi >= 40 && rsi <= 60 && separation > 0.05) {
        return {
            symbol,
            action: 'BUY',
            price: currentPrice,
            reason: `Strong uptrend momentum | EMA sep: ${separation.toFixed(3)}% | RSI: ${rsi.toFixed(1)}`,
            stopLoss: currentPrice * (1 - (config.stopLossPct ?? 1) / 100),
            takeProfit: currentPrice * (1 + (config.takeProfitPct ?? 1.5) / 100)
        };
    }

    // Strong bearish momentum: EMA aligned in downtrend, RSI in neutral-to-overbought
    if (ema9BelowEma21 && inDowntrend && rsi >= 40 && rsi <= 60 && separation > 0.05) {
        return {
            symbol,
            action: 'SELL',
            price: currentPrice,
            reason: `Strong downtrend momentum | EMA sep: ${separation.toFixed(3)}% | RSI: ${rsi.toFixed(1)}`,
            stopLoss: currentPrice * (1 + (config.stopLossPct ?? 1) / 100),
            takeProfit: currentPrice * (1 - (config.takeProfitPct ?? 1.5) / 100)
        };
    }

    return {
        symbol,
        action: 'HOLD',
        reason: `No signal | EMA9:${currentEma9.toFixed(2)} / EMA21:${currentEma21.toFixed(2)} / RSI:${rsi.toFixed(1)}`
    };
};

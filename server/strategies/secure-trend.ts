import { TradeSignal, StrategyContext } from '../types.js';

function calculateEMA(prices: number[], period: number): number[] {
    const k = 2 / (period + 1);
    const ema = [prices[0]];
    for (let i = 1; i < prices.length; i++) {
        ema.push(prices[i] * k + ema[i - 1] * (1 - k));
    }
    return ema;
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
 * Secure Trend Strategy – Conservative
 * Uses EMA 20/50 rejection + RSI confirmation in RSI 40-60 range
 * Requires strong trend alignment with EMA200 before entering
 */
export const secureTrend = ({ candles, symbol, config }: StrategyContext): TradeSignal => {
    if (candles.length < 60) {
        return { symbol, action: 'HOLD', reason: 'Not enough candles (need 60+)' };
    }

    const closes = candles.map(c => c.close);
    const currentPrice = closes[closes.length - 1];
    const recentCloses = closes.slice(-200);

    const ema20 = calculateEMA(recentCloses, 20);
    const ema50 = calculateEMA(recentCloses, 50);
    const ema200 = recentCloses.length >= 200 ? calculateEMA(recentCloses, 200) : null;
    const rsi = calculateRSI(recentCloses);

    const curEma20 = ema20[ema20.length - 1];
    const curEma50 = ema50[ema50.length - 1];
    const prevEma20 = ema20[ema20.length - 2];
    const prevEma50 = ema50[ema50.length - 2];
    const curEma200 = ema200 ? ema200[ema200.length - 1] : curEma50;

    const inUptrend = currentPrice > curEma200 && curEma20 > curEma50;
    const inDowntrend = currentPrice < curEma200 && curEma20 < curEma50;

    // Bullish EMA rejection: price near EMA20, RSI in neutral zone
    if (inUptrend && currentPrice > curEma20 * 0.998 && rsi >= 40 && rsi <= 62) {
        return {
            symbol,
            action: 'BUY',
            price: currentPrice,
            reason: `Secure trend BUY | EMA20: ${curEma20.toFixed(2)} | RSI: ${rsi.toFixed(1)}`,
            stopLoss: currentPrice * (1 - (config.stopLossPct ?? 1) / 100),
            takeProfit: currentPrice * (1 + (config.takeProfitPct ?? 2) / 100)
        };
    }

    if (inDowntrend && currentPrice < curEma20 * 1.002 && rsi >= 38 && rsi <= 60) {
        return {
            symbol,
            action: 'SELL',
            price: currentPrice,
            reason: `Secure trend SELL | EMA20: ${curEma20.toFixed(2)} | RSI: ${rsi.toFixed(1)}`,
            stopLoss: currentPrice * (1 + (config.stopLossPct ?? 1) / 100),
            takeProfit: currentPrice * (1 - (config.takeProfitPct ?? 2) / 100)
        };
    }

    // Crossover signal
    const bullishCross = prevEma20 <= prevEma50 && curEma20 > curEma50;
    const bearishCross = prevEma20 >= prevEma50 && curEma20 < curEma50;

    if (bullishCross && currentPrice > curEma200) {
        return { symbol, action: 'BUY', price: currentPrice, reason: `EMA20 crossed EMA50 (bullish) | RSI: ${rsi.toFixed(1)}`, stopLoss: currentPrice * (1 - (config.stopLossPct ?? 1) / 100), takeProfit: currentPrice * (1 + (config.takeProfitPct ?? 2) / 100) };
    }
    if (bearishCross && currentPrice < curEma200) {
        return { symbol, action: 'SELL', price: currentPrice, reason: `EMA20 crossed EMA50 (bearish) | RSI: ${rsi.toFixed(1)}`, stopLoss: currentPrice * (1 + (config.stopLossPct ?? 1) / 100), takeProfit: currentPrice * (1 - (config.takeProfitPct ?? 2) / 100) };
    }

    return { symbol, action: 'HOLD', reason: `Secure/HOLD | EMA20:${curEma20.toFixed(2)} EMA50:${curEma50.toFixed(2)} RSI:${rsi.toFixed(1)}` };
};

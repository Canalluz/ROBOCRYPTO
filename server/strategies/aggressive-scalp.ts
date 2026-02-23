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

// Aggressive Scalp: EMA 9 crosses EMA 21 while above EMA 200
export const aggressiveScalp = ({ candles, symbol, config }: StrategyContext): TradeSignal => {
    if (candles.length < 200) {
        return { symbol, action: 'HOLD', reason: 'Not enough data for EMA 200' };
    }

    const closes = candles.map(c => c.close);
    const currentPrice = closes[closes.length - 1];

    const ema9 = calculateEMA(closes, 9);
    const ema21 = calculateEMA(closes, 21);
    const ema200 = calculateEMA(closes, 200);

    const currentEma9 = ema9[ema9.length - 1];
    const currentEma21 = ema21[ema21.length - 1];
    const currentEma200 = ema200[ema200.length - 1];

    const prevEma9 = ema9[ema9.length - 2];
    const prevEma21 = ema21[ema21.length - 2];

    // Logic: Uptrend + Bullish Crossover
    if (currentPrice > currentEma200 && prevEma9 <= prevEma21 && currentEma9 > currentEma21) {
        return {
            symbol,
            action: 'BUY',
            price: currentPrice,
            reason: 'EMA 9 crossed above EMA 21 in uptrend (Price > EMA 200)',
            stopLoss: currentPrice * (1 - config.stopLossPct / 100),
            takeProfit: currentPrice * (1 + config.takeProfitPct / 100)
        };
    }

    // Logic: Downtrend + Bearish Crossover
    if (currentPrice < currentEma200 && prevEma9 >= prevEma21 && currentEma9 < currentEma21) {
        return {
            symbol,
            action: 'SELL',
            price: currentPrice,
            reason: 'EMA 9 crossed below EMA 21 in downtrend (Price < EMA 200)',
            stopLoss: currentPrice * (1 + config.stopLossPct / 100),
            takeProfit: currentPrice * (1 - config.takeProfitPct / 100)
        };
    }

    return { symbol, action: 'HOLD' };
};

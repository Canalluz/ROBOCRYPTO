import { TradeSignal, StrategyContext } from '../types.js';

// Helper: Calculate EMA
function calculateEMA(prices: number[], period: number): number[] {
    const k = 2 / (period + 1);
    const ema = [prices[0]];
    for (let i = 1; i < prices.length; i++) {
        ema.push(prices[i] * k + ema[i - 1] * (1 - k));
    }
    return ema;
}

// Helper: Calculate RSI
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
 * ROBO IA Strategy
 * ported from user's Python script logic
 */
export const roboIa = ({ candles, symbol, config }: StrategyContext): TradeSignal => {
    if (candles.length < 50) {
        return { symbol, action: 'HOLD', reason: 'Not enough candles (need 50+)' };
    }

    const closes = candles.map(c => c.close);
    const currentPrice = closes[closes.length - 1];

    // Technical Features
    const ema9 = calculateEMA(closes, 9).pop()!;
    const ema21 = calculateEMA(closes, 21).pop()!;
    const ema200 = calculateEMA(closes, 200).pop()!;
    const rsi = calculateRSI(closes, 14);
    const returns = (currentPrice - closes[closes.length - 2]) / closes[closes.length - 2];

    // Classification Logic (Simulated RandomForest bias)
    // 1 = BUY, 0 = SELL
    let buyScore = 0;
    if (currentPrice > ema9) buyScore += 1;
    if (ema9 > ema21) buyScore += 1;
    if (currentPrice > ema200) buyScore += 1;
    if (rsi < 70 && rsi > 40) buyScore += 1;
    if (returns > 0) buyScore += 1;

    const isBuy = buyScore >= 4;
    const isSell = buyScore <= 1;

    if (isBuy) {
        return {
            symbol,
            action: 'BUY',
            price: currentPrice,
            reason: `ROBO IA Signal | Score: ${buyScore}/5 | EMA Over/Crossed`,
            stopLoss: currentPrice * (1 - (config.stopLossPct ?? 1) / 100),
            takeProfit: currentPrice * (1 + (config.takeProfitPct ?? 2) / 100)
        };
    }

    if (isSell) {
        return {
            symbol,
            action: 'SELL',
            price: currentPrice,
            reason: `ROBO IA Signal | Score: ${buyScore}/5 | EMA Under/Crossed`,
            stopLoss: currentPrice * (1 + (config.stopLossPct ?? 1) / 100),
            takeProfit: currentPrice * (1 - (config.takeProfitPct ?? 2) / 100)
        };
    }

    return { symbol, action: 'HOLD', reason: `Neutral bias (Score: ${buyScore})` };
};

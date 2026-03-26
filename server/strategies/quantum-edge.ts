import { TradeSignal, StrategyContext } from '../types.js';
import { Indicators } from './indicators.js';

/**
 * SUPERBOT 3V Strategy (formerly Quantum Edge)
 * Institutional-grade ensemble using 5 hybrid strategies.
 */
export const quantumEdge = ({ candles, symbol, config }: StrategyContext): TradeSignal => {
    const minConfidence = (config as any).minConfidence || 60;
    
    if (candles.length < 200) {
        return { symbol, action: 'HOLD', reason: 'Not enough history for Quantum Core (200+ candles required)' };
    }

    const closes = candles.map(c => c.close);
    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const volumes = candles.map(c => c.volume);
    const currentPrice = closes[closes.length - 1];

    // --- 1. Alpha Momentum (Weight: 0.30) ---
    const ema9 = Indicators.ema(closes, 9).pop()!;
    const ema21 = Indicators.ema(closes, 21).pop()!;
    const ema50 = Indicators.ema(closes, 50).pop()!;
    const rsi = Indicators.rsi(closes, 14).pop()!;
    
    let momentumScore = 50;
    if (currentPrice > ema9 && ema9 > ema21) momentumScore += 20;
    if (currentPrice > ema50) momentumScore += 10;
    if (rsi > 50 && rsi < 70) momentumScore += 15;
    if (rsi > 75) momentumScore -= 20; // Overbought

    // --- 2. Mean Reversion (Weight: 0.20) ---
    const bb = Indicators.liquitidyBands(candles, 2.0); // Using BB logic
    const upper = bb.upper.pop()!;
    const lower = bb.lower.pop()!;
    const media = bb.media.pop()!;
    const zScore = (currentPrice - media) / (upper - media); // Simple Z-Score proxy
    
    let meanRevScore = 50;
    if (currentPrice < lower) meanRevScore += 30; // Deep oversold
    else if (currentPrice > upper) meanRevScore -= 30; // Deep overbought

    // --- 3. Smart Money (Weight: 0.25) ---
    const smi = Indicators.smartMoneyIndex(candles, 20, 10).pop()!;
    const cvd = Indicators.cumulativeVolumeDelta(candles, 14).pop()!;
    
    let smScore = 50;
    if (smi > 0.1) smScore += 25;
    if (cvd > 0) smScore += 15;
    if (smi < -0.1) smScore -= 25;

    // --- 4. Order Flow (Weight: 0.10) ---
    // Simple imbalance proxy using volume and candle body
    const lastCandle = candles[candles.length - 1];
    const body = Math.abs(lastCandle.close - lastCandle.open);
    const range = lastCandle.high - lastCandle.low || 0.01;
    const imbalance = (body / range) > 0.7; // Strong body = imbalance
    
    let ofScore = 50;
    if (imbalance && lastCandle.close > lastCandle.open) ofScore += 20;
    if (imbalance && lastCandle.close < lastCandle.open) ofScore -= 20;

    // --- 5. Statistical Bias (Weight: 0.15) ---
    const returns = (currentPrice - closes[closes.length - 2]) / closes[closes.length - 2];
    let statScore = 50;
    if (returns > 0.01) statScore += 10;
    if (returns < -0.01) statScore -= 10;

    // --- Ensemble Integration ---
    const weights = { mom: 0.30, rev: 0.20, sm: 0.25, of: 0.10, stat: 0.15 };
    const ensembleScore = (
        (momentumScore * weights.mom) +
        (meanRevScore * weights.rev) +
        (smScore * weights.sm) +
        (ofScore * weights.of) +
        (statScore * weights.stat)
    );

    // --- Risk Management (ATR Based SL/TP) ---
    const highArr = candles.map(c => c.high);
    const lowArr = candles.map(c => c.low);
    const closeArr = candles.map(c => c.close);
    
    // Simple ATR calculation
    let totalRange = 0;
    for (let i = closeArr.length - 14; i < closeArr.length; i++) {
        totalRange += (highArr[i] - lowArr[i]);
    }
    const atr = totalRange / 14;

    // --- Final Signal ---
    // Final check against minimum confidence threshold
    if (ensembleScore < minConfidence && !(config as any).ignoreConfidence) {
        return {
            symbol,
            action: 'HOLD',
            reason: `Confidence (${ensembleScore.toFixed(1)}%) below threshold (${minConfidence}%)`
        };
    }

    if (ensembleScore >= minConfidence) {
        return {
            symbol,
            action: 'BUY',
            price: currentPrice,
            reason: `Quantum Ensemble: High Confidence (${ensembleScore.toFixed(1)}%) | SM Index: ${smi.toFixed(2)} | Momentum: Positive`,
            stopLoss: currentPrice - (atr * 2), // v3.0 logic: ATR * 2
            takeProfit: currentPrice + (atr * 4) // v3.0 logic: ATR * 4 (Average TP)
        };
    }

    if (ensembleScore <= (100 - minConfidence)) {
        return {
            symbol,
            action: 'SELL',
            price: currentPrice,
            reason: `Quantum Ensemble: Bearish Pattern (${ensembleScore.toFixed(1)}%) | BB Deviation: ${zScore.toFixed(2)}`,
            stopLoss: currentPrice + (atr * 2),
            takeProfit: currentPrice - (atr * 4)
        };
    }

    return { 
        symbol, 
        action: 'HOLD', 
        reason: `Quantum Matrix: Neural score ${ensembleScore.toFixed(1)}% (Threshold: ${minConfidence}%)` 
    };
};

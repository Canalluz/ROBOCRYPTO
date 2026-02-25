import { TradeSignal, StrategyContext } from '../types.js';

/**
 * ZigZag++ Strategy — adapted from Pine Script ZigZag++ [LD] by DevLucem
 *
 * Parameters (from bot config):
 *   depth    = 12  — minimum bars to look for a pivot
 *   deviation = 5  — minimum % move to confirm a new pivot (integer percentage / 10 for precision)
 *   backstep = 2   — minimum bars between pivots
 *
 * Signal logic:
 *   BUY  → direction changes to Bullish, or new HL (Higher Low) detected in uptrend
 *   SELL → direction changes to Bearish, or new LH (Lower High) detected in downtrend
 *   HOLD → HH/LL continuation or no confirmed pivot
 */

type Pivot = {
    index: number;
    price: number;
    isHigh: boolean; // true = swing high, false = swing low
};

type PivotLabel = 'HH' | 'HL' | 'LH' | 'LL' | '';

/**
 * Core ZigZag pivot detection algorithm.
 * Finds alternating swing highs and swing lows in candle data.
 * Mirrors the DevLucem ZigLib logic used in the Pine Script.
 */
function detectPivots(
    highs: number[],
    lows: number[],
    depth: number,
    deviationPct: number,
    backstep: number
): Pivot[] {
    const pivots: Pivot[] = [];
    const n = highs.length;

    for (let i = depth; i < n - backstep; i++) {
        // --- Pivot High check: highs[i] is highest in [i-depth, i+backstep] ---
        let isPivotHigh = true;
        for (let j = Math.max(0, i - depth); j <= Math.min(n - 1, i + backstep); j++) {
            if (j !== i && highs[j] >= highs[i]) { isPivotHigh = false; break; }
        }

        // --- Pivot Low check: lows[i] is lowest in [i-depth, i+backstep] ---
        let isPivotLow = true;
        for (let j = Math.max(0, i - depth); j <= Math.min(n - 1, i + backstep); j++) {
            if (j !== i && lows[j] <= lows[i]) { isPivotLow = false; break; }
        }

        const lastPivot = pivots[pivots.length - 1];

        if (isPivotHigh) {
            if (!lastPivot || !lastPivot.isHigh) {
                // New swing high — check minimum deviation from last swing low
                const devOk = !lastPivot || Math.abs(highs[i] - lastPivot.price) / lastPivot.price * 100 >= deviationPct;
                if (devOk) {
                    pivots.push({ index: i, price: highs[i], isHigh: true });
                }
            } else if (highs[i] > lastPivot.price) {
                // Update to a higher swing high (continuation)
                pivots[pivots.length - 1] = { index: i, price: highs[i], isHigh: true };
            }
        }

        if (isPivotLow) {
            if (!lastPivot || lastPivot.isHigh) {
                // New swing low — check minimum deviation from last swing high
                const devOk = !lastPivot || Math.abs(lastPivot.price - lows[i]) / lastPivot.price * 100 >= deviationPct;
                if (devOk) {
                    pivots.push({ index: i, price: lows[i], isHigh: false });
                }
            } else if (lows[i] < lastPivot.price) {
                // Update to a lower swing low (continuation)
                pivots[pivots.length - 1] = { index: i, price: lows[i], isHigh: false };
            }
        }
    }

    return pivots;
}

/**
 * Classify a pivot point as HH, HL, LH, or LL
 * by comparing it to the previous pivot of the same type.
 * Mirrors the Pine Script nowPoint logic.
 */
function classifyPivot(pivots: Pivot[], idx: number): PivotLabel {
    if (idx < 2) return '';
    const current = pivots[idx];

    // Find the previous pivot of the same type
    for (let i = idx - 2; i >= 0; i -= 2) {
        const prev = pivots[i];
        if (prev.isHigh === current.isHigh) {
            if (current.isHigh) {
                return current.price > prev.price ? 'HH' : 'LH'; // swing high comparison
            } else {
                return current.price > prev.price ? 'HL' : 'LL'; // swing low comparison
            }
        }
    }
    return '';
}

export const zigzagPro = ({ candles, symbol, config }: StrategyContext): TradeSignal => {
    if (candles.length < 50) {
        return { symbol, action: 'HOLD', reason: 'Not enough candles (need 50+)' };
    }

    // Read ZigZag parameters from bot config (or use defaults matching Pine Script)
    const cfg = config as any;
    const depth: number = cfg.depth ?? 12;
    const deviation: number = cfg.deviation ?? 5;  // % (Pine Script default: 5)
    const backstep: number = cfg.backstep ?? 2;

    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const closes = candles.map(c => c.close);
    const currentPrice = closes[closes.length - 1];

    const pivots = detectPivots(highs, lows, depth, deviation, backstep);

    if (pivots.length < 4) {
        return { symbol, action: 'HOLD', reason: 'ZigZag: not enough pivots detected yet' };
    }

    // Current ZigZag state
    const last = pivots[pivots.length - 1];
    const prev = pivots[pivots.length - 2];

    // Direction: > 0 means last segment goes UP (last pivot was a HIGH), < 0 goes DOWN
    const lastDirection = last.isHigh ? 1 : -1;
    const prevDirection = prev.isHigh ? 1 : -1;
    const directionChanged = lastDirection !== prevDirection;

    // Classify the last pivot
    const lastLabel = classifyPivot(pivots, pivots.length - 1);

    // ===== BUY Signals =====
    // 1. Direction changed to Bullish (same as Pine Script "Bullish Direction" alert)
    if (directionChanged && lastDirection > 0) {
        return {
            symbol,
            action: 'BUY',
            price: currentPrice,
            reason: `ZigZag++ Bullish Direction Change | last pivot: ${lastLabel || 'HL'} @ ${last.price.toFixed(4)}`,
            stopLoss: currentPrice * (1 - (config.stopLossPct ?? 1) / 100),
            takeProfit: currentPrice * (1 + (config.takeProfitPct ?? 1.5) / 100)
        };
    }

    // 2. Higher Low detected (uptrend continuation — "New Higher Low" alert)
    if (!directionChanged && lastLabel === 'HL') {
        return {
            symbol,
            action: 'BUY',
            price: currentPrice,
            reason: `ZigZag++ Higher Low (HL) — uptrend continuation @ ${last.price.toFixed(4)}`,
            stopLoss: last.price * (1 - (config.stopLossPct ?? 1) / 100), // SL below the HL pivot
            takeProfit: currentPrice * (1 + (config.takeProfitPct ?? 1.5) / 100)
        };
    }

    // ===== SELL Signals =====
    // 1. Direction changed to Bearish (same as Pine Script "Bearish Direction" alert)
    if (directionChanged && lastDirection < 0) {
        return {
            symbol,
            action: 'SELL',
            price: currentPrice,
            reason: `ZigZag++ Bearish Direction Change | last pivot: ${lastLabel || 'LH'} @ ${last.price.toFixed(4)}`,
            stopLoss: currentPrice * (1 + (config.stopLossPct ?? 1) / 100),
            takeProfit: currentPrice * (1 - (config.takeProfitPct ?? 1.5) / 100)
        };
    }

    // 2. Lower High detected (downtrend continuation — "New Lower High" alert)
    if (!directionChanged && lastLabel === 'LH') {
        return {
            symbol,
            action: 'SELL',
            price: currentPrice,
            reason: `ZigZag++ Lower High (LH) — downtrend continuation @ ${last.price.toFixed(4)}`,
            stopLoss: last.price * (1 + (config.stopLossPct ?? 1) / 100), // SL above the LH pivot
            takeProfit: currentPrice * (1 - (config.takeProfitPct ?? 1.5) / 100)
        };
    }

    // No actionable signal — HH or LL continuation
    return {
        symbol,
        action: 'HOLD',
        reason: `ZigZag++ HOLD | label: ${lastLabel || 'none'} | direction: ${lastDirection > 0 ? '▲UP' : '▼DOWN'} | pivots: ${pivots.length}`
    };
};

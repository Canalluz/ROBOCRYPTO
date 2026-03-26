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

function getSMA(values: number[], period: number): number {
    if (values.length < period) return 0;
    const slice = values.slice(-period);
    return slice.reduce((a, b) => a + b, 0) / period;
}

function getATR(highs: number[], lows: number[], closes: number[], period: number): number {
    if (closes.length < period + 1) return 0;
    const trs: number[] = [];
    for (let i = Math.max(1, closes.length - period); i < closes.length; i++) {
        const h = highs[i];
        const l = lows[i];
        const pc = closes[i - 1];
        trs.push(Math.max(h - l, Math.abs(h - pc), Math.abs(l - pc)));
    }
    return trs.reduce((a, b) => a + b, 0) / period;
}

export const zigzagPro = ({ candles, symbol, config }: StrategyContext): TradeSignal => {
    if (candles.length < 50) {
        return { symbol, action: 'HOLD', reason: 'Not enough candles (need 50+)' };
    }

    // Read ZigZag parameters from bot config
    const cfg = config as any;
    const depth: number = cfg.depth ?? 12;
    const deviation: number = cfg.deviation ?? 5;
    const backstep: number = cfg.backstep ?? 2;
    const tradeStyle: string = cfg.tradeStyle ?? 'SWING';
    const marketType: string = cfg.marketType ?? 'CRYPTO';

    const highs = candles.map(c => c.high);
    const lows = candles.map(c => c.low);
    const closes = candles.map(c => c.close);
    const volumes = candles.map(c => c.volume);
    const currentPrice = closes[closes.length - 1];

    // --- Market Hours Filter ---
    const now = new Date();
    const currentMinute = now.getHours() * 60 + now.getMinutes();
    const isTradingHours = (): boolean => {
        if (marketType === 'CRYPTO') {
            // High liquidity hours: 13-17 (NY/London) or 20-05 (Asia)
            return (currentMinute >= 13 * 60 && currentMinute <= 17 * 60) ||
                   (currentMinute >= 20 * 60 || currentMinute <= 5 * 60);
        }
        if (marketType === 'STOCKS_BR') {
            return currentMinute >= 10 * 60 && currentMinute <= 17 * 60;
        }
        if (marketType === 'STOCKS_US') {
            return currentMinute >= 10 * 60 + 30 && currentMinute <= 17 * 60;
        }
        if (marketType === 'FOREX') {
            const day = now.getDay();
            if (day === 0 || day === 6) return false; // Weekend
            return currentMinute >= 3 * 60 && currentMinute <= 17 * 60;
        }
        return true;
    };

    if (!isTradingHours()) {
        return { symbol, action: 'HOLD', reason: `Outside trading hours for ${marketType}` };
    }

    // --- Liquidity Filter ---
    if (cfg.liquidityFilter) {
        const avgVolume = getSMA(volumes, 20);
        const minVol = avgVolume * (cfg.minVolumeRatio ?? 0.5);
        if (volumes[volumes.length - 1] < minVol) {
            return { symbol, action: 'HOLD', reason: 'Low liquidity detected' };
        }
    }

    // --- Volatility Filter ---
    if (cfg.volatilityFilter) {
        const atr14 = getATR(highs, lows, closes, 14);
        const avgAtr = getSMA(candles.map((_, i) => getATR(highs.slice(0, i+1), lows.slice(0, i+1), closes.slice(0, i+1), 14)), 20);
        if (atr14 < avgAtr * (cfg.minVolatility ?? 0.3)) {
            return { symbol, action: 'HOLD', reason: 'Low volatility detected' };
        }
    }

    const pivots = detectPivots(highs, lows, depth, deviation, backstep);

    if (pivots.length < 4) {
        return { symbol, action: 'HOLD', reason: 'ZigZag: not enough pivots detected yet' };
    }

    const last = pivots[pivots.length - 1];
    const prev = pivots[pivots.length - 2];
    const lastDirection = last.isHigh ? 1 : -1;
    const prevDirection = prev.isHigh ? 1 : -1;
    const directionChanged = lastDirection !== prevDirection;
    const lastLabel = classifyPivot(pivots, pivots.length - 1);

    const calculateConfidence = (): number => {
        let score = 40; // Base score for a pivot detection
        
        if (directionChanged) score += 20;
        if (lastLabel !== '') score += 20; // Confirmed HH, LL, HL, or LH
        
        // Volume confirmation
        const avgVolume = getSMA(volumes, 20);
        if (volumes[volumes.length - 1] > avgVolume) score += 10;
        
        // Volatility confirmation
        const atr14 = getATR(highs, lows, closes, 14);
        const avgAtr = getSMA(candles.map((_, i) => getATR(highs.slice(0, i+1), lows.slice(0, i+1), closes.slice(0, i+1), 14)), 20);
        if (atr14 > avgAtr) score += 10;

        return Math.min(score, 100);
    };

    const confidenceScore = calculateConfidence();
    const minConf = cfg.minConfidence ?? 70;

    if (directionChanged && confidenceScore >= minConf) {
        const action = lastDirection > 0 ? 'BUY' : 'SELL';
        return {
            symbol,
            action,
            price: currentPrice,
            reason: `ZigZag++ ${tradeStyle} | Reversal ${action === 'BUY' ? 'Bullish' : 'Bearish'} | pivot: ${lastLabel || 'HL'} (${confidenceScore.toFixed(0)}%)`
        };
    }

    return {
        symbol,
        action: 'HOLD',
        reason: `ZigZag++ ${tradeStyle} | direction: ${lastDirection > 0 ? '▲UP' : '▼DOWN'} | score: ${confidenceScore.toFixed(0)}% (min: ${minConf}%)`
    };
};

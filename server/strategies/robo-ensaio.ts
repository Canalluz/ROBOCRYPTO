import { TradeSignal, StrategyContext } from '../types.js';

/**
 * ROBO ENSAIO Strategy
 * Highly aggressive testing strategy that fires a BUY or SELL signal
 * interchangeably on almost every tick to verify exchange connectivity.
 */

// We store a volatile flip state in memory just to alternate BUYS and SELLS
let lastAction: 'BUY' | 'SELL' = 'SELL';

export const roboEnsaio = ({ candles, symbol, config }: StrategyContext): TradeSignal => {
    // Only needs 1 candle to get current price
    if (candles.length < 1) {
        return { symbol, action: 'HOLD', reason: 'Waiting for price data' };
    }

    const currentPrice = candles[candles.length - 1].close;

    // Alternate action every tick
    const actionToSend = lastAction === 'SELL' ? 'BUY' : 'SELL';
    lastAction = actionToSend;

    return {
        symbol,
        action: actionToSend,
        price: currentPrice,
        reason: `Robo Ensaio Test Execution`,
        stopLoss: currentPrice * (1 - (actionToSend === 'BUY' ? 0.05 : -0.05)), // Wide 5% Sl/TP just for testing
        takeProfit: currentPrice * (1 + (actionToSend === 'BUY' ? 0.05 : -0.05))
    };
};

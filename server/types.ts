export interface BotConfig {
    id: string;
    name: string;
    strategyId: string;
    exchangeId: string;
    assets: string[];
    leverage: number;
    stopLossPct: number;
    takeProfitPct: number;
    riskPerTrade: number;
    paperTrade: boolean;
    status: 'ACTIVE' | 'PAUSED' | 'TEST';
    marketMode?: 'SPOT' | 'FUTURES';
    maxConsecutiveLosses?: number;  // pause bot after N consecutive losses
    maxDailyLossPct?: number;       // pause bot if daily loss exceeds this %
    timeframe?: string;             // manual timeframe selection (e.g. '1m', '5m', '15m')
}

export interface TradeSignal {
    symbol: string;
    action: 'BUY' | 'SELL' | 'HOLD';
    price?: number;
    reason?: string;
    stopLoss?: number;
    takeProfit?: number;
}

export interface StrategyContext {
    candles: import('./exchanges/mexc.js').Candle[];
    config: BotConfig;
    symbol: string;
}

export type StrategyFunction = (context: StrategyContext) => TradeSignal;

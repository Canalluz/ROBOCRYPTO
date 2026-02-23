import { BotConfig, StrategyContext } from './types.js';
import { aggressiveScalp } from './strategies/aggressive-scalp.js';
import { getCandles, placeOrder, getUsdtBalance } from './exchanges/mexc.js';

type BotState = {
    config: BotConfig;
    interval?: NodeJS.Timeout;
    lastRun?: number;
    trades: number;
    winRate: number;
    todayPnl: number;
    consecutiveLosses: number;
};

const bots = new Map<string, BotState>();

// Mock listener for WS broadcasts
export let onTradeExecuted: (botId: string, trade: any) => void = () => { };
export let onBotStatus: (botId: string, status: any) => void = () => { };

export function registerWsBroadcaster(tradeCb: any, statusCb: any) {
    onTradeExecuted = tradeCb;
    onBotStatus = statusCb;
}

export function deployBot(config: BotConfig, apiKey: string, secret: string) {
    if (bots.has(config.id)) pauseBot(config.id);

    console.log(`[ENGINE] Deploying bot ${config.name} (${config.strategyId}) -> ${config.exchangeId}`);

    const state: BotState = {
        config,
        trades: 0,
        winRate: 0,
        todayPnl: 0,
        consecutiveLosses: 0,
    };

    bots.set(config.id, state);
    resumeBot(config.id, apiKey, secret);
}

export function pauseBot(id: string) {
    const bot = bots.get(id);
    if (!bot || !bot.interval) return;
    clearInterval(bot.interval);
    bot.interval = undefined;
    bot.config.status = 'PAUSED';
    onBotStatus(id, { status: 'PAUSED' });
    console.log(`[ENGINE] Bot ${id} paused.`);
}

export function stopBot(id: string) {
    pauseBot(id);
    bots.delete(id);
    console.log(`[ENGINE] Bot ${id} deleted.`);
}

export function resumeBot(id: string, apiKey: string, secret: string) {
    const bot = bots.get(id);
    if (!bot) return;

    bot.config.status = bot.config.paperTrade ? 'TEST' : 'ACTIVE';
    onBotStatus(id, { status: bot.config.status });

    // Tick interval based on strategy type
    const tickMs = bot.config.strategyId.includes('SCALP') ? 15000 : 60000;

    bot.interval = setInterval(() => tickEngine(id, apiKey, secret), tickMs);
    console.log(`[ENGINE] Bot ${id} active (${tickMs}ms tick). PaperTrade: ${bot.config.paperTrade}`);

    // Run immediately once
    tickEngine(id, apiKey, secret);
}

async function tickEngine(id: string, apiKey: string, secret: string) {
    const bot = bots.get(id);
    if (!bot || bot.config.status === 'PAUSED') return;

    try {
        for (const asset of bot.config.assets) {
            const candles = await getCandles(asset, '15m', 200);

            const ctx: StrategyContext = { candles, config: bot.config, symbol: asset };

            // Select strategy (for now, aggressively route all to scalp as PoC)
            let signal = { action: 'HOLD' } as any;
            if (bot.config.strategyId === 'AGGRESSIVE_SCALP' || true) {
                signal = aggressiveScalp(ctx);
            }

            if (signal.action !== 'HOLD') {
                const balance = await getUsdtBalance(apiKey, secret);
                const positionSizeUsdt = balance * (bot.config.riskPerTrade / 100) * bot.config.leverage;

                console.log(`[ENGINE] ${bot.config.name} | SIGNAL: ${signal.action} ${asset} at ${signal.price}`);

                const result = await placeOrder(
                    asset,
                    signal.action as 'BUY' | 'SELL',
                    positionSizeUsdt,
                    apiKey,
                    secret,
                    bot.config.paperTrade
                );

                // Record pseudo trade result for monitoring (paper or real)
                const profitUsd = (Math.random() * 20 - 5); // Mocked PnL outcome
                bot.todayPnl += profitUsd;
                bot.trades += 1;
                if (profitUsd > 0) {
                    bot.consecutiveLosses = 0;
                    bot.winRate = ((bot.winRate * (bot.trades - 1)) + 100) / bot.trades;
                } else {
                    bot.consecutiveLosses += 1;
                    bot.winRate = (bot.winRate * (bot.trades - 1)) / bot.trades;
                }

                const tradeData = {
                    id: result.orderId,
                    botId: bot.config.id,
                    asset,
                    type: result.side,
                    price: result.price,
                    amount: result.qty.toFixed(4),
                    result_usd: profitUsd,
                    profit: profitUsd > 0,
                    timestamp: new Date().toLocaleTimeString(),
                    paper: bot.config.paperTrade
                };

                onTradeExecuted(bot.config.id, tradeData);
                onBotStatus(id, {
                    todayPnl: bot.todayPnl,
                    trades: bot.trades,
                    winRate: bot.winRate,
                    consecutiveLosses: bot.consecutiveLosses
                });
            }
        }
        bot.lastRun = Date.now();
    } catch (err: any) {
        console.error(`[ENGINE] Tick error for bot ${bot.config.name}:`, err.message);
    }
}

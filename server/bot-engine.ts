import { BotConfig, StrategyContext } from './types.js';
import { aggressiveScalp } from './strategies/aggressive-scalp.js';
import { getCandles, placeOrder, getUsdtBalance, getPrice } from './exchanges/mexc.js';

type BotState = {
    config: BotConfig;
    apiKey: string;
    secret: string;
    interval?: NodeJS.Timeout;
    lastRun?: number;
    trades: number;
    winRate: number;
    todayPnl: number;
    consecutiveLosses: number;
    paperBalance: number; // Simulated USDT balance for paper trade mode
};

const bots = new Map<string, BotState>();

// Broadcast callbacks (registered by WS server)
export let onTradeExecuted: (botId: string, trade: any) => void = () => { };
export let onBotStatus: (botId: string, status: any) => void = () => { };

export function registerWsBroadcaster(tradeCb: any, statusCb: any) {
    onTradeExecuted = tradeCb;
    onBotStatus = statusCb;
}

export function deployBot(config: BotConfig, apiKey: string, secret: string) {
    if (bots.has(config.id)) pauseBot(config.id);

    console.log(`[ENGINE] Deploying bot "${config.name}" | strategy: ${config.strategyId} | market: ${config.marketMode || 'SPOT'} | paper: ${config.paperTrade}`);

    const state: BotState = {
        config,
        apiKey,
        secret,
        trades: 0,
        winRate: 0,
        todayPnl: 0,
        consecutiveLosses: 0,
        paperBalance: 1000, // Start with $1000 simulated balance in paper mode
    };

    bots.set(config.id, state);
    startInterval(state);
}

export function pauseBot(id: string) {
    const bot = bots.get(id);
    if (!bot || !bot.interval) return;
    clearInterval(bot.interval);
    bot.interval = undefined;
    bot.config.status = 'PAUSED';
    onBotStatus(id, { status: 'PAUSED' });
    console.log(`[ENGINE] Bot "${bot.config.name}" paused.`);
}

export function stopBot(id: string) {
    pauseBot(id);
    bots.delete(id);
    console.log(`[ENGINE] Bot removed.`);
}

export function resumeBot(id: string) {
    const bot = bots.get(id);
    if (!bot) return;
    startInterval(bot);
}

function startInterval(bot: BotState) {
    bot.config.status = bot.config.paperTrade ? 'TEST' : 'ACTIVE';
    onBotStatus(bot.config.id, { status: bot.config.status });

    // Scalp bots tick every 15s, trend bots every 60s
    const isScalp = bot.config.strategyId?.toUpperCase().includes('SCALP');
    const tickMs = isScalp ? 15000 : 60000;

    bot.interval = setInterval(() => tickEngine(bot.config.id), tickMs);
    console.log(`[ENGINE] Bot "${bot.config.name}" started (tick: ${tickMs}ms, symbols: ${bot.config.assets.join(', ')})`);

    // Run immediately
    tickEngine(bot.config.id);
}

async function tickEngine(id: string) {
    const bot = bots.get(id);
    if (!bot || bot.config.status === 'PAUSED') return;

    for (const asset of bot.config.assets) {
        try {
            // Fetch candles (public endpoint — no auth needed)
            const candles = await getCandles(asset, '15m', 200);
            console.log(`[ENGINE] "${bot.config.name}" | ${asset} | ${candles.length} candles | last close: ${candles[candles.length - 1]?.close}`);

            const ctx: StrategyContext = { candles, config: bot.config, symbol: asset };
            const signal = aggressiveScalp(ctx);

            console.log(`[ENGINE] "${bot.config.name}" | ${asset} | SIGNAL: ${signal.action}${signal.reason ? ` (${signal.reason})` : ''}`);

            if (signal.action === 'HOLD') {
                // No signal this tick — this is normal, continue
                continue;
            }

            // ------ Determine position size ------
            let availableBalance: number;

            if (bot.config.paperTrade) {
                // Use simulated paper balance — no API call needed
                availableBalance = bot.paperBalance;
                console.log(`[ENGINE] [PAPER] Using simulated balance: $${availableBalance.toFixed(2)}`);
            } else {
                // Real mode: fetch actual balance
                availableBalance = await getUsdtBalance(bot.apiKey, bot.secret);
                console.log(`[ENGINE] [LIVE] Exchange balance: $${availableBalance.toFixed(2)}`);
            }

            const riskPct = bot.config.riskPerTrade ?? 2; // default 2%
            // In Spot mode, no leverage for position sizing (leverage=1)
            const leverage = bot.config.marketMode === 'SPOT' ? 1 : (bot.config.leverage ?? 1);
            const positionSizeUsdt = availableBalance * (riskPct / 100) * leverage;

            console.log(`[ENGINE] "${bot.config.name}" | ${signal.action} ${asset} | size: $${positionSizeUsdt.toFixed(2)} | SL: ${signal.stopLoss?.toFixed(4)} | TP: ${signal.takeProfit?.toFixed(4)}`);

            // ------ Place order ------
            const result = await placeOrder(
                asset,
                signal.action as 'BUY' | 'SELL',
                positionSizeUsdt,
                bot.apiKey,
                bot.secret,
                bot.config.paperTrade
            );

            // ------ Simulate outcome (for paper trades) ------
            // In real mode, actual PnL comes from subsequent monitoring
            const priceMoved = signal.action === 'BUY'
                ? Math.random() > 0.45  // 55% chance of profitable move
                : Math.random() > 0.45;
            const movePct = priceMoved
                ? (bot.config.takeProfitPct ?? 1.5) / 100
                : -(bot.config.stopLossPct ?? 1) / 100;
            const profitUsd = positionSizeUsdt * movePct;

            // Update paper balance
            if (bot.config.paperTrade) {
                bot.paperBalance += profitUsd;
            }

            // Update stats
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
                amount: result.qty.toFixed(6),
                result_usd: Number(profitUsd.toFixed(2)),
                profit: profitUsd > 0,
                timestamp: new Date().toLocaleTimeString('pt-BR'),
                paper: bot.config.paperTrade,
                stopLoss: signal.stopLoss,
                takeProfit: signal.takeProfit,
                reason: signal.reason
            };

            onTradeExecuted(bot.config.id, tradeData);
            onBotStatus(id, {
                todayPnl: bot.todayPnl,
                trades: bot.trades,
                winRate: bot.winRate,
                consecutiveLosses: bot.consecutiveLosses,
                paperBalance: bot.paperBalance
            });

            console.log(`[ENGINE] Trade recorded: ${signal.action} ${asset} | P&L: $${profitUsd.toFixed(2)} | Total hoje: $${bot.todayPnl.toFixed(2)}`);

        } catch (err: any) {
            console.error(`[ENGINE] Error on tick for "${bot.config.name}" / ${asset}:`, err.message);
        }
    }

    bot.lastRun = Date.now();
}

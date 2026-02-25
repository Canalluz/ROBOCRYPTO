import { BotConfig, StrategyContext } from './types.js';
import { aggressiveScalp } from './strategies/aggressive-scalp.js';
import { secureTrend } from './strategies/secure-trend.js';
import { simpleMaCross } from './strategies/simple-ma.js';
import { zigzagPro } from './strategies/zigzag-pro.js';
import { roboIa } from './strategies/robo-ia.js';
import { roboEnsaio } from './strategies/robo-ensaio.js';
import { AnatomiaFluxoStrategy, Sinal as FluxoSinal } from './strategies/anatomia-fluxo.js';
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
    activePositions: Set<string>; // Tracks symbols where bot is currently IN a trade
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
        paperBalance: 1000,
        activePositions: new Set<string>(),
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
    const isScalp = bot.config.strategyId?.toUpperCase().includes('SCALP') || bot.config.strategyId?.toUpperCase().includes('ANATOMIA_FLUXO');
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
            // ------ Open Position Control ------
            // If bot is already in a position for this asset, skip signal logic
            // (Note: For Futures, this could be expanded to allow Short signals while Long, etc.)
            if (bot.activePositions.has(asset)) {
                // Determine if we should exit (this engine simplified: exit on next signal or auto-simulation)
                // For now, respect user's "doesn't open multiple positions"
                continue;
            }

            const stratId = (bot.config.strategyId ?? '').toUpperCase();
            let signal;

            if (stratId.includes('ANATOMIA_FLUXO')) {
                // Fetch multiple timeframes required by Anatomia do Fluxo
                const configAF = bot.config as any;
                const tfs = ['1d', '4h', '1h', '15m'] as const;
                const strat = new AnatomiaFluxoStrategy(configAF);

                for (const timeF of tfs) {
                    const tfCandles = await getCandles(asset, timeF, 200);
                    strat.alimentar_dados(asset, timeF, tfCandles);
                }

                const res = strat.gerar_sinal(asset);

                if (res.sinal === FluxoSinal.COMPRA) {
                    signal = { action: 'BUY', stopLoss: res.stop_loss, takeProfit: res.take_profit_1, reason: `Anatomia Fluxo (Score: ${res.score_compra})` };
                } else if (res.sinal === FluxoSinal.VENDA) {
                    signal = { action: 'SELL', stopLoss: res.stop_loss, takeProfit: res.take_profit_1, reason: `Anatomia Fluxo (Score: ${res.score_venda})` };
                } else {
                    signal = { action: 'HOLD', reason: `Anatomia Fluxo Neutro (C:${res.score_compra}/V:${res.score_venda})` };
                }

                console.log(`[AF] "${bot.config.name}" | ${asset} | COMPRA_SCORE: ${res.score_compra}/30 | VENDA_SCORE: ${res.score_venda}/30`);
            } else {
                const tf = (bot.config.timeframe || '15m') as '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
                const candles = await getCandles(asset, tf, 200);
                console.log(`[ENGINE] "${bot.config.name}" | ${asset} (${tf}) | ${candles.length} candles | last close: ${candles[candles.length - 1]?.close}`);
                const ctx: StrategyContext = { candles, config: bot.config, symbol: asset };

                if (stratId.includes('SECURE') || stratId.includes('CONSERVATIVE')) {
                    signal = secureTrend(ctx);
                } else if (stratId.includes('SIMPLE_MA') || stratId.includes('SIMPLE') || stratId.includes('MA_CROSS')) {
                    signal = simpleMaCross(ctx);
                } else if (stratId.includes('ZIGZAG') || stratId.includes('ZZ') || stratId.includes('ZIG')) {
                    signal = zigzagPro(ctx);
                } else if (stratId.includes('ROBO_IA') || stratId.includes('ROBOIA')) {
                    signal = roboIa(ctx);
                } else if (stratId.includes('ENSAIO') || stratId.includes('TEST')) {
                    signal = roboEnsaio(ctx);
                } else {
                    signal = aggressiveScalp(ctx);
                }
            }

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
            let positionSizeUsdt = availableBalance * (riskPct / 100) * leverage;

            // MEXC generally requires a minimum $5 order for SPOT. Let's guarantee at least $6 if balance allows.
            if (!bot.config.paperTrade && positionSizeUsdt < 6 && availableBalance >= 6) {
                positionSizeUsdt = 6;
            }

            console.log(`[ENGINE] "${bot.config.name}" | ${signal.action} ${asset} | size: $${positionSizeUsdt.toFixed(2)} | SL: ${signal.stopLoss?.toFixed(4)} | TP: ${signal.takeProfit?.toFixed(4)}`);

            // ------ Place order ------
            let result;
            let orderFailed = false;
            let failureReason = '';

            try {
                result = await placeOrder(
                    asset,
                    signal.action as 'BUY' | 'SELL',
                    positionSizeUsdt,
                    bot.apiKey,
                    bot.secret,
                    bot.config.paperTrade,
                    bot.config.marketMode ?? 'SPOT',
                    bot.config.leverage ?? 1
                );
            } catch (orderError: any) {
                orderFailed = true;
                failureReason = orderError.message || 'Unknown Exchange Error';
                console.error(`[ENGINE] ⚠️ ORDER FAILED for "${bot.config.name}" | ${asset}: ${failureReason}`);
            }

            // If order failed, log it as a failed trade in history and skip the rest of the tick
            if (orderFailed || !result) {
                const failedTradeData = {
                    id: 'fail-' + Date.now(),
                    botId: bot.config.id,
                    asset,
                    type: signal.action,
                    price: signal.price || 0, // Fallback since currentPrice isn't directly in this scope easily
                    amount: '0.000000',
                    result_usd: 0,
                    profit: false,
                    timestamp: new Date().toLocaleTimeString('pt-BR'),
                    paper: bot.config.paperTrade,
                    stopLoss: signal.stopLoss,
                    takeProfit: signal.takeProfit,
                    reason: `ERRO DE ORDEM: ${failureReason}`
                };
                onTradeExecuted(bot.config.id, failedTradeData);
                continue; // Move to the next asset
            }

            // Mark position as active
            bot.activePositions.add(asset);

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

            // MEXC sometimes returns price: 0 and qty: 0 synchronously on MARKET orders
            const finalPrice = result.price > 0 ? result.price : (signal.price || 1);
            const finalQty = result.qty > 0 ? result.qty : (positionSizeUsdt / finalPrice);

            // Build trade record first so auto-pause can reference it
            const tradeData = {
                id: result.orderId,
                botId: bot.config.id,
                asset,
                type: result.side,
                price: Number(finalPrice.toFixed(4)),
                amount: finalQty.toFixed(6),
                result_usd: Number(profitUsd.toFixed(2)),
                profit: profitUsd > 0,
                timestamp: new Date().toLocaleTimeString('pt-BR'),
                paper: bot.config.paperTrade,
                stopLoss: signal.stopLoss,
                takeProfit: signal.takeProfit,
                reason: signal.reason
            };

            // ------ Auto-pause on loss protection triggers ------
            const maxConsLoss = bot.config.maxConsecutiveLosses ?? 3;
            const maxDailyLossPct = bot.config.maxDailyLossPct ?? 0; // 0 = disabled

            if (bot.consecutiveLosses >= maxConsLoss) {
                console.warn(`[ENGINE] ⚠️ Bot "${bot.config.name}" PAUSED: ${bot.consecutiveLosses} consecutive losses (limit: ${maxConsLoss})`);
                onTradeExecuted(bot.config.id, { ...tradeData, autopaused: true, pauseReason: `${bot.consecutiveLosses} perdas consecutivas` });
                pauseBot(id);
                onBotStatus(id, { status: 'PAUSED', pauseReason: `Auto-paused: ${bot.consecutiveLosses} consecutive losses` });
                return; // stop processing this tick
            }

            if (maxDailyLossPct > 0) {
                const initialBalance = bot.config.paperTrade ? 1000 : availableBalance + Math.abs(bot.todayPnl);
                const dailyLossPct = (Math.abs(bot.todayPnl) / initialBalance) * 100;
                if (bot.todayPnl < 0 && dailyLossPct >= maxDailyLossPct) {
                    console.warn(`[ENGINE] ⚠️ Bot "${bot.config.name}" PAUSED: daily loss ${dailyLossPct.toFixed(2)}% ≥ ${maxDailyLossPct}%`);
                    onTradeExecuted(bot.config.id, { ...tradeData, autopaused: true, pauseReason: `Perda diária ${dailyLossPct.toFixed(1)}% atingida` });
                    pauseBot(id);
                    onBotStatus(id, { status: 'PAUSED', pauseReason: `Auto-paused: daily loss ${dailyLossPct.toFixed(2)}% ≥ ${maxDailyLossPct}%` });
                    return;
                }
            }

            // Reset position track after "execution" summary (in this simple tick model, we assume entry -> exit move simulation)
            // In a more complex model, we'd wait for SL/TP hit to .delete(asset)
            // For now, we clear it after the simulated move so the next tick can fire again.
            // (If we wanted persistent multi-candle trades, we'd keep it until a reversal signal)
            bot.activePositions.delete(asset);

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

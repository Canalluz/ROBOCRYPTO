import { BotConfig, StrategyContext, EquityPoint } from './types.js';
import { aggressiveScalp } from './strategies/aggressive-scalp.js';
import { secureTrend } from './strategies/secure-trend.js';
import { simpleMaCross } from './strategies/simple-ma.js';
import { zigzagPro } from './strategies/zigzag-pro.js';
import { roboIa } from './strategies/robo-ia.js';
import { roboEnsaio } from './strategies/robo-ensaio.js';
import { AnatomiaFluxoStrategy, Sinal as FluxoSinal } from './strategies/anatomia-fluxo.js';
import { matrixNeural } from './strategies/matrix-neural.js';
import { quantumEdge } from './strategies/quantum-edge.js';
import { getCandles, placeOrder, getUsdtBalance, getPrice, getBalance } from './exchanges/mexc.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const STORAGE_PATH = path.join(__dirname, 'bots_state.json');




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
let equityHistory: EquityPoint[] = [];
let tradeHistory: any[] = [];
let externalBalance = 0;

export function updateExternalBalance(bal: number) {
    externalBalance = bal;
    console.log(`[ENGINE] External Balance updated to: $${bal.toFixed(4)}`);
}

// Broadcast callbacks (registered by WS server)
export let onTradeExecuted: (botId: string, trade: any) => void = () => { };
export let onBotStatus: (botId: string, status: any) => void = () => { };
export let onEquityUpdate: (history: EquityPoint[]) => void = () => { };

export function registerWsBroadcaster(tradeCb: any, statusCb: any, equityCb?: any) {
    onTradeExecuted = tradeCb;
    onBotStatus = statusCb;
    if (equityCb) onEquityUpdate = equityCb;
}

export function getTradeHistory() {
    return tradeHistory;
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
    saveBots();
    recordEquityPoint(); // Immediate snapshot
    startInterval(state);
}

function saveBots() {
    try {
        const botData = Array.from(bots.values()).map(b => ({
            config: b.config,
            apiKey: b.apiKey,
            secret: b.secret,
            trades: b.trades,
            winRate: b.winRate,
            todayPnl: b.todayPnl,
            consecutiveLosses: b.consecutiveLosses,
            paperBalance: b.paperBalance,
            activePositions: Array.from(b.activePositions)
        }));
        const fullState = {
            bots: botData,
            equityHistory,
            tradeHistory: tradeHistory.slice(-200) // Keep last 200
        };
        fs.writeFileSync(STORAGE_PATH, JSON.stringify(fullState, null, 2));
    } catch (e) {
        console.error('[ENGINE] Failed to save bots:', e);
    }
}

export function recordManualTrade(botId: string, trade: any) {
    if (botId && botId !== 'MANUAL') {
        const bot = bots.get(botId);
        if (bot) {
            bot.trades += 1;
            // For manual trades, we don't have a reliable way to calculate PnL 
            // without knowing the corresponding BUY order, so we just increment count.
            console.log(`[ENGINE] Manual trade recorded for bot "${bot.config.name}"`);
        }
    }

    tradeHistory.unshift(trade);
    if (tradeHistory.length > 200) tradeHistory.pop();

    onTradeExecuted(botId, trade);
    saveBots();
}

export function loadBots() {
    try {
        if (!fs.existsSync(STORAGE_PATH)) return;
        const data = fs.readFileSync(STORAGE_PATH, 'utf-8');
        const parsed = JSON.parse(data);
        
        let botData = [];
        if (Array.isArray(parsed)) {
            botData = parsed; // Legacy format
        } else {
            botData = parsed.bots || [];
            equityHistory = parsed.equityHistory || [];
            tradeHistory = parsed.tradeHistory || [];
            
            // Auto-cleanup for legacy example data (10k baseline or 1k initial paper balance)
            const hasLegacyData = equityHistory.some(p => (p.value >= 9000 && p.value <= 11000) || (p.value >= 900 && p.value <= 1100));
            if (equityHistory.length > 0 && hasLegacyData) {
                console.log("[ENGINE] Detected legacy example data (1k or 10k baseline). Clearing for a fresh start...");
                equityHistory = [];
            }
        }
        
        console.log(`[ENGINE] Restoring ${botData.length} bots from storage...`);
        
        for (const b of botData) {
            const state: BotState = {
                config: b.config,
                apiKey: b.apiKey,
                secret: b.secret,
                trades: b.trades || 0,
                winRate: b.winRate || 0,
                todayPnl: b.todayPnl || 0,
                consecutiveLosses: b.consecutiveLosses || 0,
                paperBalance: b.paperBalance || (b.config.paperTrade ? 1000 : 0),
                activePositions: new Set(b.activePositions || []),
            };
            bots.set(b.config.id, state);
            
            if (state.config.status === 'ACTIVE' || state.config.status === 'TEST') {
                startInterval(state);
            }
        }
    } catch (e) {
        console.error('[ENGINE] Failed to load bots:', e);
    }
}

export function pauseBot(id: string) {
    const bot = bots.get(id);
    if (!bot || !bot.interval) return;
    clearInterval(bot.interval);
    bot.interval = undefined;
    bot.config.status = 'PAUSED';
    saveBots();
    onBotStatus(id, { status: 'PAUSED' });
    console.log(`[ENGINE] Bot "${bot.config.name}" paused.`);
}

export function stopBot(id: string) {
    pauseBot(id);
    bots.delete(id);
    saveBots();
    console.log(`[ENGINE] Bot removed.`);
}

export function getAllBots() {
    return Array.from(bots.values()).map(b => ({
        id: b.config.id,
        name: b.config.name,
        strategyId: b.config.strategyId,
        status: b.config.status,
        config: b.config,
        performance: {
            todayPnl: b.todayPnl,
            totalPnl: b.todayPnl, // Using todayPnl as totalPnl for now
            trades: b.trades,
            winRate: b.winRate,
            consecutiveLosses: b.consecutiveLosses,
            paperBalance: b.paperBalance
        },
        lastActivity: new Date().toISOString()
    }));
}

export function resumeBot(id: string) {
    const bot = bots.get(id);
    if (!bot) return;
    startInterval(bot);
}

export function getEquityHistory() {
    return equityHistory;
}

export async function recordEquityPoint() {
    console.log('[ENGINE] Recording equity snapshot...');
    let totalPnl = 0;
    for (const bot of bots.values()) {
        totalPnl += bot.todayPnl;
    }

    const timeStr = new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    // Calculate total value as sum of paper balances (only for PAPER bots) + the real external exchange balance
    const value = Array.from(bots.values()).reduce((acc, b) => {
        return acc + (b.config.paperTrade ? (b.paperBalance || 0) : 0);
    }, 0) + externalBalance;

    // Detect if we have legacy 1k or 10k data points while the current real value is much lower (< 100)
    const hasLegacyData = equityHistory.some(p => (p.value >= 9000 && p.value <= 11000) || (p.value >= 900 && p.value <= 1100));
    if (hasLegacyData && value < 100) {
        console.log("[ENGINE] Force clearing legacy 1k/10k equity history for a clean start.");
        equityHistory = [];
    }

    equityHistory.push({ 
        time: timeStr, 
        value, 
        timestamp: Date.now() 
    });
    
    // Keep last 3000 points (e.g., ~1 month of 15-min data)
    if (equityHistory.length > 3000) {
        equityHistory.shift();
    }

    saveBots();
    onEquityUpdate(equityHistory);
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
            // ------ Wallet Sync: Sync activePositions with real wallet balance ------
            // If the user already has the asset in their wallet, the bot should know so it can SELL if signaled
            if (!bot.config.paperTrade) {
                const balances = await getBalance(bot.apiKey, bot.secret);
                const assetQty = balances[asset] || 0;
                
                // If we have a significant amount (> 0.0001), consider it an active position
                if (assetQty > 0.0001) {
                    if (!bot.activePositions.has(asset)) {
                        console.log(`[ENGINE] Wallet Sync: Found ${assetQty} ${asset} in wallet. Mark as active position for "${bot.config.name}".`);
                        bot.activePositions.add(asset);
                    }
                } else {
                    // If balance is zero but we thought we had a position, clear it (it was sold elsewhere)
                    if (bot.activePositions.has(asset)) {
                        console.log(`[ENGINE] Wallet Sync: ${asset} no longer in wallet. Clearing position for "${bot.config.name}".`);
                        bot.activePositions.delete(asset);
                    }
                }
            }

            // ------ Open Position Control ------
            const hasPosition = bot.activePositions.has(asset);

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
                const tf = (bot.config.timeframe === 'AUTO' || !bot.config.timeframe ? '15m' : bot.config.timeframe) as '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
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
                } else if (stratId.includes('MATRIX_NEURAL') || stratId.includes('MATRIX')) {
                    signal = matrixNeural(ctx);
                } else if (stratId.includes('QUANTUM_EDGE') || stratId.includes('QUANTUM')) {
                    signal = quantumEdge(ctx);
                } else if (stratId.includes('ENSAIO') || stratId.includes('TEST')) {
                    signal = roboEnsaio(ctx);
                } else {
                    signal = aggressiveScalp(ctx);
                }
            }

            // ------ Order Execution Logic ------
            console.log(`[ENGINE] "${bot.config.name}" | ${asset} | SIGNAL: ${signal.action}${signal.reason ? ` (${signal.reason})` : ''}`);

            if (signal.action === 'HOLD') continue;

            // Skip BUY if already in position, skip SELL if no position
            if (signal.action === 'BUY' && hasPosition) {
                console.log(`[ENGINE] "${bot.config.name}" | ${asset} | Already in position, skipping BUY.`);
                continue;
            }
            if (signal.action === 'SELL' && !hasPosition) {
                console.log(`[ENGINE] "${bot.config.name}" | ${asset} | No position to SELL, skipping signal.`);
                continue;
            }

            // ------ Determine position size dynamically ------
            let tradeAmount = 0; // quoteOrderQty for BUY, quantity for SELL
            let riskPct = bot.config.positionSizePct ?? bot.config.riskPerTrade ?? 2;
            const leverage = bot.config.marketMode === 'SPOT' ? 1 : (bot.config.leverage ?? 1);

            console.log(`[ENGINE] "${bot.config.name}" | Position Size: ${riskPct}% | Leverage: ${leverage}x | Market: ${bot.config.marketMode || 'SPOT'}`);

            if (signal.action === 'BUY') {
                let availableStable: number;
                if (bot.config.paperTrade) {
                    availableStable = bot.paperBalance;
                } else {
                    const balances = await getBalance(bot.apiKey, bot.secret);
                    availableStable = (balances['USDT'] || 0) + (balances['USDC'] || 0) + (balances['BUSD'] || 0);
                    console.log(`[ENGINE] "${bot.config.name}" | Balances detected: USDT: ${balances['USDT']?.toFixed(2) || '0'}, USDC: ${balances['USDC']?.toFixed(2) || '0'}, BUSD: ${balances['BUSD']?.toFixed(2) || '0'}`);
                }
                
                // If 100% position size, use 99.5% for BUY to avoid Insufficient Balance due to exchange fees/slippage
                const effectiveRisk = riskPct >= 100 ? 99.5 : riskPct;
                tradeAmount = availableStable * (effectiveRisk / 100) * leverage;
                
                console.log(`[ENGINE] "${bot.config.name}" | Available $: ${availableStable.toFixed(2)} | Calculated Trade Amount: $${tradeAmount.toFixed(2)}`);

                // Minimum order limit
                if (!bot.config.paperTrade && tradeAmount < 6 && availableStable >= 6) {
                    tradeAmount = 6;
                    console.log(`[ENGINE] "${bot.config.name}" | Adjusting to minimum order: $6`);
                }

                if (availableStable < 6) {
                    console.log(`[ENGINE] "${bot.config.name}" | Insufficient stablecoin balance ($${availableStable.toFixed(2)}) for BUY.`);
                    continue;
                }
            } else if (signal.action === 'SELL') {
                let assetBalance: number;
                if (bot.config.paperTrade) {
                    // For paper trade, calculate quantity from notional
                    const currentPrice = await getPrice(asset);
                    assetBalance = bot.paperBalance / currentPrice; // Approximation
                } else {
                    const balances = await getBalance(bot.apiKey, bot.secret);
                    assetBalance = balances[asset] || 0;
                    console.log(`[ENGINE] "${bot.config.name}" | Asset balance detected: ${assetBalance.toFixed(6)} ${asset}`);
                }
                
                tradeAmount = assetBalance * (riskPct / 100);
                console.log(`[ENGINE] "${bot.config.name}" | Available Asset: ${assetBalance.toFixed(6)} | Calculated Trade Quantity: ${tradeAmount.toFixed(6)}`);
                
                if (tradeAmount <= 0) {
                    console.log(`[ENGINE] "${bot.config.name}" | No ${asset} balance to SELL.`);
                    continue;
                }
            }

            console.log(`[ENGINE] "${bot.config.name}" | ${signal.action} ${asset} | amount: ${tradeAmount.toFixed(6)} | SL: ${signal.stopLoss?.toFixed(4)} | TP: ${signal.takeProfit?.toFixed(4)}`);

            // ------ Place order ------
            let result;
            let orderFailed = false;
            let failureReason = '';

            try {
                result = await placeOrder(
                    asset,
                    signal.action as 'BUY' | 'SELL',
                    tradeAmount,
                    bot.apiKey,
                    bot.secret,
                    bot.config.paperTrade ?? false,
                    bot.config.marketMode ?? 'SPOT',
                    bot.config.leverage ?? 1
                );
            } catch (orderError: any) {
                orderFailed = true;
                failureReason = orderError.message || 'Unknown Exchange Error';
                console.error(`[ENGINE] ⚠️ ORDER FAILED for "${bot.config.name}" | ${asset}: ${failureReason}`);
            }

            if (orderFailed || !result) continue;

            // Compute actual trade notional for history tracking
            const price = result.price || await getPrice(asset);
            const notional = signal.action === 'BUY' ? tradeAmount : (tradeAmount * price);
            const profitUsd = signal.action === 'BUY' ? 0 : (tradeAmount * (price - (signal.price || price))); // VERY simple PnL for logs

            // Update internal position tracking
            if (signal.action === 'BUY') {
                bot.activePositions.add(asset);
            } else if (signal.action === 'SELL') {
                bot.activePositions.delete(asset);
            }

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

            const finalPrice = price > 0 ? price : (signal.price || 1);
            const finalQty = result.qty > 0 ? result.qty : (tradeAmount / finalPrice);

            if (finalQty <= 0) {
                console.warn(`[ENGINE] Skipping trade history for "${bot.config.name}": Zero quantity calculated.`);
                continue;
            }

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
                const currentAvailable = bot.config.paperTrade ? bot.paperBalance : await getUsdtBalance(bot.apiKey, bot.secret);
                const initialBalance = currentAvailable + Math.abs(bot.todayPnl);
                const dailyLossPct = (Math.abs(bot.todayPnl) / initialBalance) * 100;
                if (bot.todayPnl < 0 && dailyLossPct >= maxDailyLossPct) {
                    console.warn(`[ENGINE] ⚠️ Bot "${bot.config.name}" PAUSED: daily loss ${dailyLossPct.toFixed(2)}% ≥ ${maxDailyLossPct}%`);
                    onTradeExecuted(bot.config.id, { ...tradeData, autopaused: true, pauseReason: `Perda diária ${dailyLossPct.toFixed(1)}% atingida` });
                    pauseBot(id);
                    onBotStatus(id, { status: 'PAUSED', pauseReason: `Auto-paused: daily loss ${dailyLossPct.toFixed(2)}% ≥ ${maxDailyLossPct}%` });
                    return;
                }
            }

            // In a more complex model, we'd wait for SL/TP hit to .delete(asset)
            // For now, we clear it after the simulated move so the next tick can fire again.
            // (If we wanted persistent multi-candle trades, we'd keep it until a reversal signal)
            // bot.activePositions.delete(asset); // REMOVED for persistent tracking

            // Persist trade in history (max 200 entries)
            tradeHistory.unshift(tradeData);
            if (tradeHistory.length > 200) tradeHistory.pop();

            onTradeExecuted(bot.config.id, tradeData);
            onBotStatus(id, {
                todayPnl: bot.todayPnl,
                trades: bot.trades,
                winRate: bot.winRate,
                consecutiveLosses: bot.consecutiveLosses,
                paperBalance: bot.paperBalance,
                activePositions: Array.from(bot.activePositions)
            });

            console.log(`[ENGINE] Trade recorded: ${signal.action} ${asset} | P&L: $${profitUsd.toFixed(2)} | Total hoje: $${bot.todayPnl.toFixed(2)}`);
            saveBots(); // Update persistence with new stats

        } catch (err: any) {
            console.error(`[ENGINE] Error on tick for "${bot.config.name}" / ${asset}:`, err.message);
        }
    }

    bot.lastRun = Date.now();
}

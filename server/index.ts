import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import { deployBot, pauseBot, stopBot, registerWsBroadcaster, loadBots, getAllBots, getEquityHistory, getTradeHistory, recordEquityPoint, updateExternalBalance } from './bot-engine.js';

import { getUsdtBalance, getBalance, getAccountTotalValue, placeOrder } from './exchanges/mexc.js';
import { getUsdtBalance as getBinanceUsdtBalance, getAccountTotalValue as getBinanceTotalValue } from './exchanges/binance.js';

const app = express();
app.use(cors());
app.use(express.json());

const server = createServer(app);
const wss = new WebSocketServer({ server });

// Active WS connections array
const clients = new Set<WebSocket>();

wss.on('connection', (ws) => {
    console.log('[WS] Client connected');
    clients.add(ws);

    // Sync current bots state with the newly connected client
    const currentBots = getAllBots();
    ws.send(JSON.stringify({ type: 'SYNC_BOTS', payload: currentBots }));

    // Sync equity history
    const history = getEquityHistory();
    ws.send(JSON.stringify({ type: 'SYNC_EQUITY', payload: history }));

    // Sync trade history
    const trades = getTradeHistory();
    ws.send(JSON.stringify({ type: 'SYNC_TRADES', payload: trades }));

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            console.log('[WS] Received:', data.type);

            if (data.type === 'DEPLOY_BOT') {
                const { bot, apiKey, secret } = data.payload;
                const finalKey = apiKey || 'mx0vglx73gnNfwgSE7';
                const finalSecret = secret || '6e19dfc6a212425883a5cb5676edb10c';
                deployBot(bot, finalKey, finalSecret);
            } else if (data.type === 'PAUSE_BOT') {
                pauseBot(data.payload.id);
            } else if (data.type === 'STOP_BOT') {
                stopBot(data.payload.id);
            } else if (data.type === 'SYNC_BALANCE') {
                const { balance } = data.payload;
                updateExternalBalance(Number(balance) || 0);
            }
        } catch (e) {
            console.error('[WS] Error processing message:', e);
        }
    });

    ws.on('close', () => {
        console.log('[WS] Client disconnected');
        clients.delete(ws);
    });
});

// Broadcast handlers from Bot Engine
registerWsBroadcaster(
    (botId: string, trade: any) => {
        clients.forEach(c => c.send(JSON.stringify({ type: 'TRADE_EXECUTED', payload: { botId, trade } })));
    },
    (botId: string, status: any) => {
        clients.forEach(c => c.send(JSON.stringify({ type: 'BOT_STATUS', payload: { botId, status } })));
    },
    (history: any) => {
        clients.forEach(c => c.send(JSON.stringify({ type: 'SYNC_EQUITY', payload: history })));
    }
);

// REST API
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', server: 'Robo Crypto Trading Engine' });
});

app.post('/api/balance/mexc', async (req, res) => {
    try {
        console.log('[MEXC] Balance request received. Body:', req.body);
        const apiKey = req.body.apiKey || 'mx0vglx73gnNfwgSE7';
        const secret = req.body.secret || '6e19dfc6a212425883a5cb5676edb10c';

        const { getUsdtBalance, getBalance, getAccountTotalValue } = await import('./exchanges/mexc.js');
        const balance = await getUsdtBalance(apiKey, secret);
        const assets = await getBalance(apiKey, secret);
        const totalValue = await getAccountTotalValue(apiKey, secret);
        res.json({ balance, assets, totalValue });
    } catch (e: any) {
        console.error('[MEXC] API Error:', e.response?.data || e.message);
        res.status(500).json({ error: e.response?.data || e.message || 'Failed to fetch balance' });
    }
});

app.post('/api/balance/binance', async (req, res) => {
    try {
        console.log('[BINANCE] Balance request received. Body:', req.body);
        const { apiKey, secret } = req.body;
        if (!apiKey || !secret) return res.status(400).json({ error: 'Missing credentials', bodyReceived: req.body });
        const { getUsdtBalance, getBalance, getAccountTotalValue } = await import('./exchanges/binance.js');
        const balance = await getUsdtBalance(apiKey, secret);
        const assets = await getBalance(apiKey, secret);
        const totalValue = await getAccountTotalValue(apiKey, secret);
        res.json({ balance, assets, totalValue });
    } catch (e: any) {
        console.error('[BINANCE] API Error:', e.response?.data || e.message);
        res.status(500).json({ error: e.response?.data || e.message || 'Failed to fetch balance' });
    }
});

// Manual Trade endpoint — for testing buy/sell directly from the UI
app.post('/api/manual-trade', async (req, res) => {
    try {
        const { symbol, side, quoteQty, apiKey, secret, paperTrade, marketMode, botId } = req.body;
        if (!symbol || !side || !quoteQty) {
            return res.status(400).json({ error: 'Missing required fields: symbol, side, quoteQty' });
        }
        if (!paperTrade && (!apiKey || !secret)) {
            return res.status(400).json({ error: 'API Key and Secret required for live orders' });
        }

        console.log(`[MANUAL] ${paperTrade ? '[PAPER]' : '[LIVE]'} ${side} ${symbol} ${quoteQty} USDT ${botId ? `(Bot: ${botId})` : ''}`);

        const result = await placeOrder(
            symbol,
            side as 'BUY' | 'SELL',
            Number(quoteQty),
            apiKey || 'mx0vglx73gnNfwgSE7',
            secret || '6e19dfc6a212425883a5cb5676edb10c',
            !!paperTrade,
            (marketMode as 'SPOT' | 'FUTURES') ?? 'SPOT',
            1
        );

        console.log(`[MANUAL] Order result:`, result);

        // Record the trade in the engine history and bot stats
        const { recordManualTrade } = await import('./bot-engine.js');
        const { getPrice } = await import('./exchanges/mexc.js');
        
        recordManualTrade(botId || 'MANUAL', {
            id: result.orderId,
            botId: botId || 'MANUAL',
            asset: symbol.toUpperCase().includes('USDT') ? symbol.toUpperCase() : symbol.toUpperCase() + 'USDT',
            type: side,
            price: Number((result.price > 0 ? result.price : (await getPrice(symbol))).toFixed(4)),
            amount: Number(result.qty).toFixed(6),
            result_usd: 0, // Manual trades don't have simulated exit PnL
            profit: false,
            timestamp: new Date().toLocaleTimeString('pt-BR'),
            paper: !!paperTrade,
            reason: 'Manual Execution'
        });

        res.json({ success: true, order: result });
    } catch (e: any) {
        console.error('[MANUAL] Trade error:', e.response?.data || e.message);
        res.status(500).json({ error: e.response?.data || e.message || 'Order failed' });
    }
});

// For deploying to Render: Serve static frontend files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../dist');

app.use(express.static(distPath));
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Robô Crypto Backend Engine running on port ${PORT}`);
    loadBots();
    recordEquityPoint(); 

    // Record equity point every 15 minutes (900000ms)
    setInterval(() => {
        recordEquityPoint();
    }, 900000);

    // Initial record if empty
    setTimeout(() => {
        if (getEquityHistory().length === 0) {
            recordEquityPoint();
        }
    }, 10000);
});

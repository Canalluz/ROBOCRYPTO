import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { deployBot, pauseBot, stopBot, registerWsBroadcaster } from './bot-engine.js';
import { getUsdtBalance, placeOrder } from './exchanges/mexc.js';
import { getUsdtBalance as getBinanceUsdtBalance } from './exchanges/binance.js';

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

    ws.on('message', (message) => {
        try {
            const data = JSON.parse(message.toString());
            console.log('[WS] Received:', data.type);

            if (data.type === 'DEPLOY_BOT') {
                const { bot, apiKey, secret } = data.payload;
                deployBot(bot, apiKey, secret);
            } else if (data.type === 'PAUSE_BOT') {
                pauseBot(data.payload.id);
            } else if (data.type === 'STOP_BOT') {
                stopBot(data.payload.id);
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
    }
);

// REST API
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', server: 'Robo Crypto Trading Engine' });
});

app.post('/api/balance/mexc', async (req, res) => {
    try {
        console.log('[MEXC] Balance request received. Body:', req.body);
        const { apiKey, secret } = req.body;
        if (!apiKey || !secret) return res.status(400).json({ error: 'Missing credentials', bodyReceived: req.body });
        const balance = await getUsdtBalance(apiKey, secret);
        res.json({ balance });
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
        const balance = await getBinanceUsdtBalance(apiKey, secret);
        res.json({ balance });
    } catch (e: any) {
        console.error('[BINANCE] API Error:', e.response?.data || e.message);
        res.status(500).json({ error: e.response?.data || e.message || 'Failed to fetch balance' });
    }
});

// Manual Trade endpoint — for testing buy/sell directly from the UI
app.post('/api/manual-trade', async (req, res) => {
    try {
        const { symbol, side, quoteQty, apiKey, secret, paperTrade, marketMode } = req.body;
        if (!symbol || !side || !quoteQty) {
            return res.status(400).json({ error: 'Missing required fields: symbol, side, quoteQty' });
        }
        if (!paperTrade && (!apiKey || !secret)) {
            return res.status(400).json({ error: 'API Key and Secret required for live orders' });
        }

        console.log(`[MANUAL] ${paperTrade ? '[PAPER]' : '[LIVE]'} ${side} ${symbol} ${quoteQty} USDT`);

        const result = await placeOrder(
            symbol,
            side as 'BUY' | 'SELL',
            Number(quoteQty),
            apiKey || '',
            secret || '',
            !!paperTrade,
            (marketMode as 'SPOT' | 'FUTURES') ?? 'SPOT',
            1
        );

        console.log(`[MANUAL] Order result:`, result);
        res.json({ success: true, order: result });
    } catch (e: any) {
        console.error('[MANUAL] Trade error:', e.response?.data || e.message);
        res.status(500).json({ error: e.response?.data || e.message || 'Order failed' });
    }
}
});

// For deploying to Render: Serve static frontend files
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.join(__dirname, '../../dist');

app.use(express.static(distPath));
app.get('*', (req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Robô Crypto Backend Engine running on port ${PORT}`);
});

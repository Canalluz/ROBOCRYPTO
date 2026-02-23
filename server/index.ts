import express from 'express';
import cors from 'cors';
import { WebSocketServer, WebSocket } from 'ws';
import { createServer } from 'http';
import { deployBot, pauseBot, stopBot, registerWsBroadcaster } from './bot-engine.js';
import { getUsdtBalance } from './exchanges/mexc.js';
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

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
    console.log(`🚀 Robô Crypto Backend Engine running on port ${PORT}`);
});

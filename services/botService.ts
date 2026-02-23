export class BotService {
    private ws: WebSocket | null = null;
    private onTradeCb?: (trade: any) => void;
    private onStatusCb?: (botId: string, status: any) => void;
    private pendingQueue: string[] = []; // Messages waiting for WS to open

    connect() {
        try {
            // Connect via Vite's dev proxy (/ws → ws://localhost:3001)
            const wsUrl = window.location.hostname === 'localhost'
                ? `ws://${window.location.host}/ws`
                : 'ws://localhost:3001';

            this.ws.onopen = () => {
                console.log('[Frontend] Connected to Bot Engine');
                // Flush any queued messages
                while (this.pendingQueue.length > 0) {
                    const msg = this.pendingQueue.shift();
                    if (msg) this.ws?.send(msg);
                }
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);
                    if (data.type === 'TRADE_EXECUTED' && this.onTradeCb) {
                        this.onTradeCb(data.payload.trade);
                    } else if (data.type === 'BOT_STATUS' && this.onStatusCb) {
                        this.onStatusCb(data.payload.botId, data.payload.status);
                    }
                } catch (e) {
                    console.error('[Frontend] Error parsing WS message', e);
                }
            };

            this.ws.onclose = () => {
                console.log('[Frontend] Disconnected from Bot Engine. Reconnecting in 5s...');
                setTimeout(() => this.connect(), 5000);
            };

            this.ws.onerror = (err) => {
                console.warn('[Frontend] WS error — backend may not be running on port 3001');
            };
        } catch (e) {
            console.warn('[Frontend] Could not connect to bot engine, retrying in 5s...');
            setTimeout(() => this.connect(), 5000);
        }
    }

    /** Send immediately if connected, or queue for next connection */
    private send(msg: object) {
        const raw = JSON.stringify(msg);
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(raw);
        } else {
            // Queue the message — it will be sent on next open
            this.pendingQueue.push(raw);
            console.log('[Frontend] WS not ready, queued message:', (msg as any).type);
        }
    }

    onTrade(cb: (trade: any) => void) { this.onTradeCb = cb; }
    onStatus(cb: (botId: string, status: any) => void) { this.onStatusCb = cb; }

    deployBot(bot: any, exchange: any) {
        this.send({ type: 'DEPLOY_BOT', payload: { bot, apiKey: exchange.apiKey, secret: exchange.apiSecret } });
        console.log('[Frontend] DEPLOY_BOT queued/sent:', bot.name, bot.strategyId);
    }

    pauseBot(id: string) {
        this.send({ type: 'PAUSE_BOT', payload: { id } });
    }

    stopBot(id: string) {
        this.send({ type: 'STOP_BOT', payload: { id } });
    }
}

export const botService = new BotService();

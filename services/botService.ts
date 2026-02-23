export class BotService {
    private ws: WebSocket | null = null;
    private onTradeCb?: (trade: any) => void;
    private onStatusCb?: (botId: string, status: any) => void;

    connect() {
        this.ws = new WebSocket('ws://localhost:3001');
        this.ws.onopen = () => console.log('[Frontend] Connected to Bot Engine');

        this.ws.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'TRADE_EXECUTED' && this.onTradeCb) {
                this.onTradeCb(data.payload.trade);
            } else if (data.type === 'BOT_STATUS' && this.onStatusCb) {
                this.onStatusCb(data.payload.botId, data.payload.status);
            }
        };

        this.ws.onclose = () => {
            console.log('[Frontend] Disconnected from Bot Engine. Reconnecting in 5s...');
            setTimeout(() => this.connect(), 5000);
        };
    }

    onTrade(cb: (trade: any) => void) {
        this.onTradeCb = cb;
    }

    onStatus(cb: (botId: string, status: any) => void) {
        this.onStatusCb = cb;
    }

    deployBot(bot: any, exchange: any) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({
                type: 'DEPLOY_BOT',
                payload: { bot, apiKey: exchange.apiKey, secret: exchange.apiSecret }
            }));
        }
    }

    pauseBot(id: string) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'PAUSE_BOT', payload: { id } }));
        }
    }

    stopBot(id: string) {
        if (this.ws?.readyState === WebSocket.OPEN) {
            this.ws.send(JSON.stringify({ type: 'STOP_BOT', payload: { id } }));
        }
    }
}

export const botService = new BotService();

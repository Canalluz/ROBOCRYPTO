import WebSocket from 'ws';
const ws = new WebSocket('ws://localhost:3001');

const payload = {
    type: 'DEPLOY_BOT',
    payload: {
        bot: {
            id: 'af-test1',
            name: 'Robo AF Test',
            strategyId: 'ANATOMIA_FLUXO',
            status: 'TEST',
            exchangeId: 'mexc',
            assets: ['BTCUSDT'],
            timeframes: { '1d': '1d', '4h': '4h', '1h': '1h', '15m': '15m' },
            paperTrade: true,
            marketMode: 'SPOT',
            leverage: 1,
            stopLossPct: 2,
            takeProfitPct: 4,
            riskPerTrade: 2,
            ema_curta: 21,
            ema_media: 50,
            ema_longa: 200,
            volume_profile_dias: 180,
            smi_periodo_acum: 20,
            smi_periodo_dist: 10,
            smi_threshold: 0.3,
            cvd_suavizacao: 14,
            bandas_desvio: 2,
            rsi_periodo: 14,
            rsi_sobrevendido: 30,
            rsi_sobrecomprado: 70,
            estocastico_k: 14,
            estocastico_d: 3,
            trailing_stop_distancia: 1.5,
            max_ativos_simultaneos: 3,
            performance: { totalPnl: 0, todayPnl: 0, trades: 0, winRate: 0, consecutiveLosses: 0, avgTradeDuration: '0m' }
        },
        apiKey: 'foo',
        secret: 'bar'
    }
};

ws.on('open', () => {
    ws.send(JSON.stringify(payload));
    setTimeout(() => { ws.close(); process.exit(); }, 1000);
});

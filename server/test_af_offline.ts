import { AnatomiaFluxoStrategy } from './strategies/anatomia-fluxo.js';
import { getCandles } from './exchanges/mexc.js';

async function testAF() {
    console.log("Starting AF test...");
    const config = {
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
        max_ativos_simultaneos: 3
    };

    const strat = new AnatomiaFluxoStrategy(config as any);
    const tfs = ['1d', '4h', '1h', '15m'];

    for (const timeF of tfs) {
        console.log("Fetching ", timeF);
        const tfCandles = await getCandles('BTCUSDT', timeF, 200);
        strat.alimentar_dados('BTCUSDT', timeF, tfCandles);
    }

    console.log("Generating signal...");
    const res = strat.gerar_sinal('BTCUSDT');
    console.log(JSON.stringify(res, null, 2));
}

testAF().catch(console.error);

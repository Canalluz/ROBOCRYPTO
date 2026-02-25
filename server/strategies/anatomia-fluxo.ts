import { Indicators, Candle } from './indicators.js';
import { AnatomiaFluxoConfig } from '../../types.js';

export enum Sinal {
    COMPRA = "COMPRA",
    VENDA = "VENDA",
    NADA = "NADA",
    ERRO = "ERRO"
}

export class AnatomiaFluxoStrategy {
    config: AnatomiaFluxoConfig;
    dados: Record<string, Record<string, Candle[]>> = {};

    constructor(config: AnatomiaFluxoConfig) {
        this.config = config;
    }

    alimentar_dados(ativo: string, timeframe: string, df: Candle[]) {
        if (!this.dados[ativo]) this.dados[ativo] = {};
        this.dados[ativo][timeframe] = df;
    }

    painel1_estrutura_macro(ativo: string): any {
        try {
            const df = this.dados[ativo] && this.dados[ativo]['1d'];
            if (!df || df.length === 0) throw new Error("Sem dados 1d");

            const closePrices = df.map(c => c.close);
            const ema_21 = Indicators.ema(closePrices, this.config.ema_curta);
            const ema_50 = Indicators.ema(closePrices, this.config.ema_media);
            const ema_200 = Indicators.ema(closePrices, this.config.ema_longa);

            const atualIdx = df.length - 1;
            const preco = df[atualIdx].close;
            const val_ema_200 = ema_200[atualIdx];

            let vies = "NEUTRO";
            if (preco > val_ema_200 * 1.05) vies = "COMPRA_FORTE";
            else if (preco > val_ema_200) vies = "COMPRA";
            else if (preco < val_ema_200 * 0.95) vies = "VENDA_FORTE";
            else if (preco < val_ema_200) vies = "VENDA";

            const df_6m = df.slice(Math.max(0, df.length - this.config.volume_profile_dias));
            const vp = Indicators.volumeProfile(df_6m);

            const dist_ema = ((preco / val_ema_200) - 1) * 100;

            return {
                vies,
                preco,
                ema_200: val_ema_200,
                ema_50: ema_50[atualIdx],
                ema_21: ema_21[atualIdx],
                distancia_ema200: dist_ema,
                poc: vp.poc,
                zona_valor_min: vp.valor_min,
                zona_valor_max: vp.valor_max,
            };
        } catch (e: any) {
            console.error(`Erro Painel 1 ${ativo}: ${e.message}`);
            return { vies: 'ERRO', erro: Object.prototype.toString.call(e) === '[object Error]' ? e.message : String(e) };
        }
    }

    painel2_fluxo_institucional(ativo: string): any {
        try {
            const df = this.dados[ativo] && this.dados[ativo]['4h'];
            if (!df || df.length < 2) throw new Error("Sem dados 4h");

            const smiArray = Indicators.smartMoneyIndex(df, this.config.smi_periodo_acum, this.config.smi_periodo_dist);
            const cvdArray = Indicators.cumulativeVolumeDelta(df, this.config.cvd_suavizacao);
            const bands = Indicators.liquitidyBands(df, this.config.bandas_desvio);

            const idx = df.length - 1;
            const ultimo = { close: df[idx].close, smi: smiArray[idx], cvd: cvdArray[idx] };
            const anterior = { close: df[idx - 1].close, smi: smiArray[idx - 1] };

            const banda_inf_atual = bands.lower[idx];
            const banda_sup_atual = bands.upper[idx];

            const acumulacao = (ultimo.smi > anterior.smi && ultimo.close < anterior.close && ultimo.smi > 0.3);
            const distribuicao = (ultimo.smi < anterior.smi && ultimo.close > anterior.close && ultimo.smi < -0.3);

            const na_banda_inf = Math.abs(ultimo.close - banda_inf_atual) / ultimo.close < 0.01;
            const na_banda_sup = Math.abs(ultimo.close - banda_sup_atual) / ultimo.close < 0.01;

            return {
                smi: ultimo.smi,
                cvd: ultimo.cvd,
                acumulacao,
                distribuicao,
                cvd_positivo: ultimo.cvd > 0,
                na_banda_inferior: na_banda_inf,
                na_banda_superior: na_banda_sup,
                banda_inferior: banda_inf_atual,
                banda_superior: banda_sup_atual,
                preco: ultimo.close
            };
        } catch (e: any) {
            console.error(`Erro Painel 2 ${ativo}:`, e);
            return { erro: e?.message || e };
        }
    }

    painel3_gatilhos_entrada(ativo: string): any {
        try {
            const df = this.dados[ativo] && this.dados[ativo]['1h'];
            if (!df || df.length < 20) throw new Error("Sem dados 1h suficientes");

            const closePrices = df.map(c => c.close);
            const rsiArray = Indicators.rsi(closePrices, this.config.rsi_periodo);
            const { k: stoch_k, d: stoch_d } = Indicators.stochastic(df, this.config.estocastico_k, this.config.estocastico_d);
            const { fvg_suporte, fvg_resistencia } = Indicators.fairValueGaps(df);

            const idx = df.length - 1;
            const ultimo = { close: df[idx].close, low: df[idx].low, rsi: rsiArray[idx], stoch_k: stoch_k[idx], stoch_d: stoch_d[idx] };

            const sobrevendido = ultimo.rsi < this.config.rsi_sobrevendido;
            const sobrecomprado = ultimo.rsi > this.config.rsi_sobrecomprado;

            const est_cruzou_cima = (stoch_k[idx - 1] < stoch_d[idx - 1] && ultimo.stoch_k > ultimo.stoch_d);
            const est_cruzou_baixo = (stoch_k[idx - 1] > stoch_d[idx - 1] && ultimo.stoch_k < ultimo.stoch_d);

            const last20 = df.slice(-20);
            let minLow = Infinity;
            let minIdx = 0;
            for (let i = 0; i < last20.length; i++) {
                if (last20[i].low < minLow) { minLow = last20[i].low; minIdx = i; }
            }
            const rsi_no_min = rsiArray[df.length - 20 + minIdx] || ultimo.rsi;

            const divergencia_alta = (ultimo.low > minLow && ultimo.rsi < rsi_no_min);
            const divergencia_baixa = (ultimo.low < minLow && ultimo.rsi > rsi_no_min);

            return {
                rsi: ultimo.rsi,
                sobrevendido,
                sobrecomprado,
                stoch_k: ultimo.stoch_k,
                stoch_d: ultimo.stoch_d,
                est_cruzou_cima,
                est_cruzou_baixo,
                divergencia_alta,
                divergencia_baixa,
                fvg_suporte,
                fvg_resistencia,
                preco: ultimo.close
            };
        } catch (e: any) {
            console.error(`Erro Painel 3 ${ativo}:`, e);
            return { erro: e?.message || e };
        }
    }

    painel4_micro_estrutura(ativo: string): any {
        try {
            const df = this.dados[ativo] && this.dados[ativo]['15m'];
            if (!df || df.length < 5) throw new Error("Sem dados 15m");

            const df_24h = df.slice(Math.max(0, df.length - 96));
            const vp = Indicators.volumeProfile(df_24h);

            const ultimos_5 = df.slice(-5);
            let exaustao_vendedores = false;
            let exaustao_compradores = false;

            for (const candle of ultimos_5) {
                const corpo = Math.abs(candle.close - candle.open);
                const range_total = candle.high - candle.low;

                if (range_total > 0) {
                    const delta = (candle.close - candle.open) / range_total * candle.volume;
                    if (Math.abs(delta) > candle.volume * 0.7 && corpo / range_total < 0.3) {
                        if (delta > 0) exaustao_compradores = true;
                        else exaustao_vendedores = true;
                    }
                }
            }

            const preco = df[df.length - 1].close;
            const dist_poc = ((preco / vp.poc) - 1) * 100;

            return {
                poc: vp.poc,
                zona_valor_min: vp.valor_min,
                zona_valor_max: vp.valor_max,
                distancia_poc: dist_poc,
                exaustao_vendedores,
                exaustao_compradores,
                preco
            };
        } catch (e: any) {
            console.error(`Erro Painel 4 ${ativo}:`, e);
            return { erro: e?.message || e };
        }
    }

    gerar_sinal(ativo: string): any {
        try {
            const p1 = this.painel1_estrutura_macro(ativo);
            const p2 = this.painel2_fluxo_institucional(ativo);
            const p3 = this.painel3_gatilhos_entrada(ativo);
            const p4 = this.painel4_micro_estrutura(ativo);

            if (p1.erro || p2.erro || p3.erro || p4.erro) {
                return { sinal: Sinal.ERRO, confianca: 0, erro: "Erro em um dos painéis." };
            }

            let score_compra = 0;
            let score_venda = 0;
            let max_score = 0;

            // Painel 1 (Vies Macro) - Weight: 3
            max_score += 3;
            if (p1.vies === 'COMPRA' || p1.vies === 'COMPRA_FORTE') score_compra += 3;
            else if (p1.vies === 'VENDA' || p1.vies === 'VENDA_FORTE') score_venda += 3;

            // Painel 2 (Fluxo Institucional) - Weight: 5
            max_score += 5;
            if (p2.acumulacao) score_compra += 3;
            if (p2.distribuicao) score_venda += 3;
            if (p2.na_banda_inferior) score_compra += 1;
            if (p2.na_banda_superior) score_venda += 1;

            // Painel 3 (Gatilhos) - Weight: 6
            max_score += 6;
            if (p3.sobrevendido) score_compra += 1;
            if (p3.sobrecomprado) score_venda += 1;
            if (p3.est_cruzou_cima) score_compra += 1;
            if (p3.est_cruzou_baixo) score_venda += 1;
            if (p3.divergencia_alta) score_compra += 2;
            if (p3.divergencia_baixa) score_venda += 2;

            // Painel 4 (Micro-Estrutura) - Weight: 5
            max_score += 5;
            if (p4.exaustao_vendedores) score_compra += 2;
            if (p4.exaustao_compradores) score_venda += 2;
            if (Math.abs(p4.distancia_poc || 100) < 1) {
                if (p4.preco < p4.poc) score_compra += 1;
                else score_venda += 1;
            }

            const confianca = (Math.max(score_compra, score_venda) / max_score) * 100;

            // LOGGING SCORES
            console.log(`[AF-DEBUG] ${ativo} | SCORES -> COMPRA: ${score_compra}, VENDA: ${score_venda} | MAX: ${max_score} | CONF: ${confianca.toFixed(1)}%`);
            if (p1.vies === 'ERRO' || p2.erro || p3.erro || p4.erro) {
                console.warn(`[AF-DEBUG] ${ativo} | Errors: P1:${p1.vies} P2:${p2.erro || 'OK'} P3:${p3.erro || 'OK'} P4:${p4.erro || 'OK'}`);
            }

            let sinal = Sinal.NADA;
            let stop = 0, tp1 = 0, tp2 = 0;

            if (score_compra > score_venda * 1.5 && confianca > 40) {
                sinal = Sinal.COMPRA;
                stop = p2.banda_inferior * 0.99;
                tp1 = p1.ema_50 > p1.preco ? p1.ema_50 : p1.preco * 1.03;
                tp2 = p1.ema_21 > p1.preco ? p1.ema_21 : p1.preco * 1.06;
            } else if (score_venda > score_compra * 1.5 && confianca > 40) {
                sinal = Sinal.VENDA;
                stop = p2.banda_superior * 1.01;
                tp1 = p1.ema_50 < p1.preco ? p1.ema_50 : p1.preco * 0.97;
                tp2 = p1.ema_21 < p1.preco ? p1.ema_21 : p1.preco * 0.94;
            }

            return {
                sinal,
                confianca: Number(confianca.toFixed(1)),
                score_compra,
                score_venda,
                max_score,
                preco_entrada: p1.preco,
                stop_loss: stop,
                take_profit_1: tp1,
                take_profit_2: tp2,
                painel1: p1,
                painel2: p2,
                painel3: p3,
                painel4: p4
            };
        } catch (e: any) {
            console.error(`Erro ao gerar sinal ${ativo}:`, e);
            return { sinal: Sinal.ERRO, confianca: 0, erro: e?.message || String(e) };
        }
    }
}

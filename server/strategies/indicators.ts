export interface Candle {
    openTime: number;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
}

export class Indicators {
    static ema(prices: number[], period: number): number[] {
        const k = 2 / (period + 1);
        const emaArray = new Array(prices.length).fill(0);

        // Initialize first EMA with SMA
        let sum = 0;
        for (let i = 0; i < Math.min(period, prices.length); i++) {
            sum += prices[i];
        }
        emaArray[Math.min(period - 1, prices.length - 1)] = sum / Math.min(period, prices.length);

        for (let i = period; i < prices.length; i++) {
            emaArray[i] = (prices[i] * k) + (emaArray[i - 1] * (1 - k));
        }
        // Pad the beginning with the first calculated value or 0
        for (let i = 0; i < period - 1; i++) {
            emaArray[i] = emaArray[period - 1] || prices[i];
        }
        return emaArray;
    }

    static rsi(prices: number[], period: number = 14): number[] {
        const rsiArray = new Array(prices.length).fill(0);
        if (prices.length < period + 1) return rsiArray;

        let gains = 0, losses = 0;
        for (let i = 1; i <= period; i++) {
            const diff = prices[i] - prices[i - 1];
            if (diff > 0) gains += diff;
            else losses -= diff;
        }

        let avgGain = gains / period;
        let avgLoss = losses / period;

        rsiArray[period] = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));

        for (let i = period + 1; i < prices.length; i++) {
            const diff = prices[i] - prices[i - 1];
            const gain = diff > 0 ? diff : 0;
            const loss = diff < 0 ? -diff : 0;

            avgGain = ((avgGain * (period - 1)) + gain) / period;
            avgLoss = ((avgLoss * (period - 1)) + loss) / period;

            rsiArray[i] = avgLoss === 0 ? 100 : 100 - (100 / (1 + avgGain / avgLoss));
        }

        // Pad beginning
        for (let i = 0; i < period; i++) rsiArray[i] = 50;
        return rsiArray;
    }

    static stochastic(candles: Candle[], kPeriod: number = 14, dPeriod: number = 3): { k: number[], d: number[] } {
        const kArray = new Array(candles.length).fill(50);
        const dArray = new Array(candles.length).fill(50);

        for (let i = kPeriod - 1; i < candles.length; i++) {
            const slice = candles.slice(i - kPeriod + 1, i + 1);
            const highestHigh = Math.max(...slice.map(c => c.high));
            const lowestLow = Math.min(...slice.map(c => c.low));
            const currentClose = candles[i].close;

            if (highestHigh - lowestLow === 0) {
                kArray[i] = 50;
            } else {
                kArray[i] = 100 * ((currentClose - lowestLow) / (highestHigh - lowestLow));
            }
        }

        // Calculate D (SMA of K)
        for (let i = kPeriod - 1 + dPeriod - 1; i < candles.length; i++) {
            let sum = 0;
            for (let j = 0; j < dPeriod; j++) {
                sum += kArray[i - j];
            }
            dArray[i] = sum / dPeriod;
        }

        return { k: kArray, d: dArray };
    }

    static smartMoneyIndex(candles: Candle[], periodAcum: number = 20, periodDist: number = 10): number[] {
        const smiArray = new Array(candles.length).fill(0);
        if (candles.length < Math.max(periodAcum, periodDist, 20)) return smiArray;

        const volumeMA = new Array(candles.length).fill(0);
        for (let i = 19; i < candles.length; i++) {
            let sum = 0;
            for (let j = 0; j < 20; j++) sum += candles[i - j].volume;
            volumeMA[i] = sum / 20;
        }

        const rawSMI = new Array(candles.length).fill(0);

        let currentAcum = 0;
        let currentDist = 0;
        const acums = new Array(candles.length).fill(0);
        const dists = new Array(candles.length).fill(0);

        for (let i = 1; i < candles.length; i++) {
            const c = candles[i];
            const prevC = candles[i - 1];
            const volAlto = c.volume > (volumeMA[i] * 1.5);

            const comprasAgressivas = c.close > c.open && volAlto;
            const vendasAgressivas = c.close < c.open && volAlto;

            const flagAcum = (c.close < prevC.close && comprasAgressivas) ? 1 : 0;
            const flagDist = (c.close > prevC.close && vendasAgressivas) ? 1 : 0;

            acums[i] = flagAcum;
            dists[i] = flagDist;
        }

        for (let i = 20; i < candles.length; i++) {
            let sumAcum = 0;
            let sumDist = 0;
            for (let j = 0; j < periodAcum; j++) sumAcum += acums[i - j] || 0;
            for (let j = 0; j < periodDist; j++) sumDist += dists[i - j] || 0;

            const total = sumAcum + sumDist;
            rawSMI[i] = total > 0 ? (sumAcum - sumDist) / total : 0;
        }

        // EWM smoothing span 5
        return this.ema(rawSMI, 5);
    }

    static cumulativeVolumeDelta(candles: Candle[], smooth: number = 14): number[] {
        const delta = new Array(candles.length).fill(0);
        for (let i = 0; i < candles.length; i++) {
            const c = candles[i];
            const corpo = Math.abs(c.close - c.open);
            let rangeTotal = c.high - c.low;
            if (rangeTotal < 0.01) rangeTotal = 0.01;

            if (c.close > c.open) {
                delta[i] = c.volume * (corpo / rangeTotal);
            } else if (c.close < c.open) {
                delta[i] = -c.volume * (corpo / rangeTotal);
            } else {
                delta[i] = 0;
            }
        }

        const cvd = new Array(candles.length).fill(0);
        let sum = 0;
        for (let i = 0; i < delta.length; i++) {
            sum += delta[i];
            cvd[i] = sum;
        }

        return this.ema(cvd, smooth);
    }

    static liquitidyBands(candles: Candle[], deviation: number = 2.0): { media: number[], upper: number[], lower: number[] } {
        const mediaA = new Array(candles.length).fill(0);
        const upperA = new Array(candles.length).fill(0);
        const lowerA = new Array(candles.length).fill(0);

        const typicalPrices = candles.map(c => (c.high + c.low + c.close) / 3);

        // VWAP like 20 period
        const volumeMA20 = new Array(candles.length).fill(0);
        for (let i = 19; i < candles.length; i++) {
            volumeMA20[i] = candles.slice(i - 19, i + 1).reduce((acc, c) => acc + c.volume, 0) / 20;
        }

        const volWeights = candles.map((c, i) => volumeMA20[i] === 0 ? 1 : c.volume / volumeMA20[i]);

        for (let i = 19; i < candles.length; i++) {
            let sumTpVol = 0;
            let sumVolWeight = 0;
            for (let j = 0; j < 20; j++) {
                sumTpVol += typicalPrices[i - j] * volWeights[i - j];
                sumVolWeight += volWeights[i - j];
            }
            mediaA[i] = sumVolWeight === 0 ? typicalPrices[i] : sumTpVol / sumVolWeight;

            // Weighted std dev
            let sumSqDiff = 0;
            for (let j = 0; j < 20; j++) {
                sumSqDiff += volWeights[i - j] * Math.pow(typicalPrices[i - j] - mediaA[i], 2);
            }
            const desvioPonderado = Math.sqrt(sumSqDiff / sumVolWeight);

            // Volatility modifier
            let retornos = [];
            for (let j = 1; j <= 20; j++) {
                const curIdx = i - 20 + j;
                const prevIdx = i - 20 + j - 1;
                if (curIdx >= 0 && prevIdx >= 0) {
                    retornos.push((candles[curIdx].close - candles[prevIdx].close) / candles[prevIdx].close);
                }
            }

            const meanRet = retornos.length > 0 ? retornos.reduce((a, b) => a + b, 0) / retornos.length : 0;
            const stdRet = Math.sqrt(retornos.reduce((sq, n) => sq + Math.pow(n - meanRet, 2), 0) / (retornos.length - 1)) || 0;
            const volatilidade = stdRet * Math.sqrt(24);

            const desvioAjustado = desvioPonderado * (1 + volatilidade);
            upperA[i] = mediaA[i] + (desvioAjustado * deviation);
            lowerA[i] = mediaA[i] - (desvioAjustado * deviation);
        }

        // Pad beginning
        for (let i = 0; i < 19; i++) {
            mediaA[i] = typicalPrices[i];
            upperA[i] = typicalPrices[i] * 1.01;
            lowerA[i] = typicalPrices[i] * 0.99;
        }

        return { media: mediaA, upper: upperA, lower: lowerA };
    }

    static fairValueGaps(candles: Candle[]): { fvg_suporte: number, fvg_resistencia: number } {
        let fvg_suporte = 0;
        let fvg_resistencia = 0;
        if (candles.length < 5) return { fvg_suporte, fvg_resistencia };

        // Search backwards (simulating Python's iloc[-i])
        for (let i = 2; i < Math.min(10, candles.length); i++) {
            const c1 = candles[candles.length - i - 2];
            const c3 = candles[candles.length - i];

            if (!c1 || !c3) continue;

            // Gap de alta (suporte)
            if (c3.low > c1.high && fvg_suporte === 0) {
                fvg_suporte = (c3.low + c1.high) / 2;
            }

            // Gap de baixa (resistência)
            if (c3.high < c1.low && fvg_resistencia === 0) {
                fvg_resistencia = (c3.high + c1.low) / 2;
            }

            if (fvg_suporte !== 0 && fvg_resistencia !== 0) break;
        }

        return { fvg_suporte, fvg_resistencia };
    }

    static volumeProfile(candles: Candle[], numBins: number = 24): { poc: number, hvn: number[], valor_precos: number[], valor_min: number, valor_max: number } {
        if (candles.length < 10) {
            const lastClose = candles.length > 0 ? candles[candles.length - 1].close : 0;
            return { poc: lastClose, hvn: [], valor_precos: [], valor_min: lastClose * 0.95, valor_max: lastClose * 1.05 };
        }

        let preco_min = Math.min(...candles.map(c => c.low));
        let preco_max = Math.max(...candles.map(c => c.high));
        const margem = (preco_max - preco_min) * 0.02;
        preco_min -= margem;
        preco_max += margem;

        const binSize = (preco_max - preco_min) / numBins;
        const bins = Array.from({ length: numBins + 1 }, (_, i) => preco_min + (i * binSize));
        const volumeBins = new Array(numBins).fill(0);

        for (const candle of candles) {
            for (let j = 0; j < numBins; j++) {
                if (candle.high >= bins[j] && candle.low <= bins[j + 1]) {
                    const overlap = Math.min(candle.high, bins[j + 1]) - Math.max(candle.low, bins[j]);
                    if (overlap > 0) {
                        const range = candle.high - candle.low;
                        const proporcao = range > 0 ? overlap / range : 1;
                        volumeBins[j] += candle.volume * proporcao;
                    }
                }
            }
        }

        let poc_idx = 0;
        let max_vol = 0;
        for (let i = 0; i < numBins; i++) {
            if (volumeBins[i] > max_vol) {
                max_vol = volumeBins[i];
                poc_idx = i;
            }
        }
        const poc_preco = (bins[poc_idx] + bins[poc_idx + 1]) / 2;

        const media_vol = volumeBins.reduce((a, b) => a + b, 0) / numBins;
        const desvio_vol = Math.sqrt(volumeBins.reduce((sq, n) => sq + Math.pow(n - media_vol, 2), 0) / numBins);

        const hvn_precos = [];
        for (let i = 0; i < numBins; i++) {
            if (volumeBins[i] > media_vol + desvio_vol) {
                hvn_precos.push((bins[i] + bins[i + 1]) / 2);
            }
        }

        const volEntries = volumeBins.map((v, i) => ({ vol: v, idx: i })).sort((a, b) => b.vol - a.vol);
        let vol_acumulado = 0;
        const vol_total = volumeBins.reduce((a, b) => a + b, 0);
        const valor_precos = [];

        for (const entry of volEntries) {
            vol_acumulado += entry.vol;
            valor_precos.push((bins[entry.idx] + bins[entry.idx + 1]) / 2);
            if (vol_acumulado / vol_total >= 0.7) break;
        }

        valor_precos.sort((a, b) => a - b);
        const valor_min = valor_precos.length > 0 ? valor_precos[0] : poc_preco * 0.95;
        const valor_max = valor_precos.length > 0 ? valor_precos[valor_precos.length - 1] : poc_preco * 1.05;

        return { poc: poc_preco, hvn: hvn_precos, valor_precos, valor_min, valor_max };
    }
}

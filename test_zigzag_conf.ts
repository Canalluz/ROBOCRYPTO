import { zigzagPro } from './server/strategies/zigzag-pro.js';

const mockCandles = Array.from({ length: 100 }, (_, i) => ({
    time: i,
    open: 100 + Math.sin(i / 10) * 10,
    high: 105 + Math.sin(i / 10) * 10,
    low: 95 + Math.sin(i / 10) * 10,
    close: 100 + Math.sin(i / 10) * 10,
    volume: 1000 + Math.random() * 500
}));

const config = {
    depth: 12,
    deviation: 5,
    backstep: 2,
    minConfidence: 75,
    tradeStyle: 'SWING',
    marketType: 'AUTO'
};

const result = zigzagPro({
    candles: mockCandles as any,
    symbol: 'BTCUSDT',
    config: config as any
});

console.log('Result with 75% threshold:', JSON.stringify(result, null, 2));

const configLow = { ...config, minConfidence: 40 };
const resultLow = zigzagPro({
    candles: mockCandles as any,
    symbol: 'BTCUSDT',
    config: configLow as any
});

console.log('Result with 40% threshold:', JSON.stringify(resultLow, null, 2));

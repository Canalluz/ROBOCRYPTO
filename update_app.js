const fs = require('fs');
let App = fs.readFileSync('App.tsx', 'utf8');

// 1. mask
App = App.replace(/\u00e2\u20ac\u00a2/g, '\u2022');
App = App.replace(/â€¢/g, '\u2022'); // just in case

// 2. isFakeKey
const oldIsFakeKey = "const isFakeKey = (k: any) => typeof k === 'string' && (k.includes('****') || k.includes('\\u2022\\u2022\\u2022\\u2022'));";
const newIsFakeKey = "const isFakeKey = (k: any) => typeof k === 'string' && (k.includes('****') || k.includes('\\u2022\\u2022\\u2022\\u2022') || k.includes('\\u00e2\\u20ac\\u00a2') || k.includes('â€¢'));";
App = App.replace(
    "const isFakeKey = (k: any) => typeof k === 'string' && (k.includes('****') || k.includes('\u2022\u2022\u2022\u2022'));",
    "const isFakeKey = (k: any) => typeof k === 'string' && (k.includes('****') || k.includes('\u2022\u2022\u2022\u2022') || k.includes('\u00e2\u20ac\u00a2'));"
);

// 3. adding Refs
App = App.replace(
    "  useEffect(() => {\n    localStorage.setItem('tradepro_trade_history', JSON.stringify(tradeHistory));\n  }, [tradeHistory]);",
    "  useEffect(() => {\n    localStorage.setItem('tradepro_trade_history', JSON.stringify(tradeHistory));\n  }, [tradeHistory]);\n\n  const botsRef = useRef(bots);\n  useEffect(() => { botsRef.current = bots; }, [bots]);\n\n  const exchangesRef = useRef(exchanges);\n  useEffect(() => { exchangesRef.current = exchanges; }, [exchanges]);"
);

App = App.replace(
    "  useEffect(() => {\r\n    localStorage.setItem('tradepro_trade_history', JSON.stringify(tradeHistory));\r\n  }, [tradeHistory]);",
    "  useEffect(() => {\r\n    localStorage.setItem('tradepro_trade_history', JSON.stringify(tradeHistory));\r\n  }, [tradeHistory]);\r\n\r\n  const botsRef = useRef(bots);\r\n  useEffect(() => { botsRef.current = bots; }, [bots]);\r\n\r\n  const exchangesRef = useRef(exchanges);\r\n  useEffect(() => { exchangesRef.current = exchanges; }, [exchanges]);"
);

// 4. Updating useEffect
const oldEffect = `  // Hydrate stateless backend with active/test bots restored from local storage
  useEffect(() => {
    bots.forEach(bot => {
      if (bot.status === 'ACTIVE' || bot.status === 'TEST') {
        const ex = exchanges.find(e => e.id === bot.config.exchangeId);
        if (ex && ex.apiKey) {
          console.log('[Frontend] Redeploying restored bot:', bot.name);
          botService.deployBot({
            id: bot.id,
            name: bot.name,
            strategyId: bot.strategyId,
            exchangeId: bot.config.exchangeId,
            assets: bot.config.assets,
            leverage: bot.config.leverage,
            stopLossPct: bot.config.stopLossPct,
            takeProfitPct: bot.config.takeProfitPct,
            riskPerTrade: bot.config.riskPerTrade,
            marketMode: (bot.config as any).marketMode ?? 'SPOT',
            paperTrade: bot.status === 'TEST',
            status: bot.status
          }, ex);
        }
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);`;

const newEffect = `  // Hydrate stateless backend with active/test bots restored from local storage
  useEffect(() => {
    botService.onConnect(() => {
      botsRef.current.forEach(bot => {
        if (bot.status === 'ACTIVE' || bot.status === 'TEST') {
          const ex = exchangesRef.current.find(e => e.id === bot.config.exchangeId);
          const isFakeKey = (k: any) => typeof k === 'string' && (k.includes('****') || k.includes('\\u2022\\u2022\\u2022\\u2022') || k.includes('\\u00e2\\u20ac\\u00a2'));
          if (ex && ex.apiKey && !isFakeKey(ex.apiKey)) {
            console.log('[Frontend] Redeploying restored bot:', bot.name);
            botService.deployBot({
              id: bot.id,
              name: bot.name,
              strategyId: bot.strategyId,
              exchangeId: bot.config.exchangeId,
              assets: bot.config.assets,
              leverage: bot.config.leverage,
              stopLossPct: bot.config.stopLossPct,
              takeProfitPct: bot.config.takeProfitPct,
              riskPerTrade: bot.config.riskPerTrade,
              marketMode: (bot.config as any).marketMode ?? 'SPOT',
              paperTrade: bot.status === 'TEST',
              status: bot.status
            }, ex);
          }
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);`;

App = App.replace(oldEffect, newEffect);
App = App.replace(oldEffect.replace(/\n/g, '\r\n'), newEffect.replace(/\n/g, '\r\n'));

fs.writeFileSync('App.tsx', App, 'utf8');
console.log('Done script!');

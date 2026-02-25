import fs from 'fs';

let App = fs.readFileSync('App.tsx', 'utf8');

// 1. mask
App = App.replaceAll('\u00e2\u20ac\u00a2', '\u2022');
App = App.replaceAll('â€¢', '\u2022');

// 2. isFakeKey -> we will just replace the whole text
App = App.replace(
    "const isFakeKey = (k: any) => typeof k === 'string' && (k.includes('****') || k.includes('\\u2022\\u2022\\u2022\\u2022'));",
    "const isFakeKey = (k: any) => typeof k === 'string' && (k.includes('****') || k.includes('\\u2022\\u2022\\u2022\\u2022') || k.includes('\\u00e2\\u20ac\\u00a2'));"
);

// Second attempt for the unicode bullet
App = App.replace(
    "const isFakeKey = (k: any) => typeof k === 'string' && (k.includes('****') || k.includes('••••'));",
    "const isFakeKey = (k: any) => typeof k === 'string' && (k.includes('****') || k.includes('••••') || k.includes('â€¢'));"
);


// 3. adding Refs after local storage save trade_history
// Deal with \n or \r\n
const searchStr = "  useEffect(() => {\r\n    localStorage.setItem('tradepro_trade_history', JSON.stringify(tradeHistory));\r\n  }, [tradeHistory]);";
const searchStr2 = "  useEffect(() => {\n    localStorage.setItem('tradepro_trade_history', JSON.stringify(tradeHistory));\n  }, [tradeHistory]);";
const replaceStr = searchStr2 + "\n\n  const botsRef = useRef(bots);\n  useEffect(() => { botsRef.current = bots; }, [bots]);\n\n  const exchangesRef = useRef(exchanges);\n  useEffect(() => { exchangesRef.current = exchanges; }, [exchanges]);";

if (App.includes(searchStr)) {
    App = App.replace(searchStr, replaceStr.replace(/\n/g, '\r\n'));
} else {
    App = App.replace(searchStr2, replaceStr);
}

// 4. Updating useEffect
const oldEffect = `  // Hydrate stateless backend with active/test bots restored from local storage\r
  useEffect(() => {\r
    bots.forEach(bot => {\r
      if (bot.status === 'ACTIVE' || bot.status === 'TEST') {\r
        const ex = exchanges.find(e => e.id === bot.config.exchangeId);\r
        if (ex && ex.apiKey) {\r
          console.log('[Frontend] Redeploying restored bot:', bot.name);\r
          botService.deployBot({\r
            id: bot.id,\r
            name: bot.name,\r
            strategyId: bot.strategyId,\r
            exchangeId: bot.config.exchangeId,\r
            assets: bot.config.assets,\r
            leverage: bot.config.leverage,\r
            stopLossPct: bot.config.stopLossPct,\r
            takeProfitPct: bot.config.takeProfitPct,\r
            riskPerTrade: bot.config.riskPerTrade,\r
            marketMode: (bot.config as any).marketMode ?? 'SPOT',\r
            paperTrade: bot.status === 'TEST',\r
            status: bot.status\r
          }, ex);\r
        }\r
      }\r
    });\r
    // eslint-disable-next-line react-hooks/exhaustive-deps\r
  }, []);`;

const oldEffect2 = `  // Hydrate stateless backend with active/test bots restored from local storage
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
          const isFakeKey = (k) => typeof k === 'string' && (k.includes('****') || k.includes('••••') || k.includes('â€¢'));
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
              marketMode: (bot.config || {}).marketMode ?? 'SPOT',
              paperTrade: bot.status === 'TEST',
              status: bot.status
            }, ex);
          }
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);`;

if (App.includes(oldEffect)) {
    App = App.replace(oldEffect, newEffect.replace(/\n/g, '\r\n'));
} else {
    App = App.replace(oldEffect2, newEffect);
}

fs.writeFileSync('App.tsx', App, 'utf8');
console.log('Update successful!');


import { SystemData } from './types';

export const INITIAL_DATA: SystemData = {
  timestamp: new Date().toISOString(),
  portfolio: {
    current_positions: [],
    cash_available: 0,
    daily_pnl: 0,
    var_95: 0
  },
  market_data: {
    btc: {
      price: 43500,
      "24h_change": 2.4,
      volume: 2850000000,
      order_book: { bid_depth: 125000000, ask_depth: 98000000, spread: 0.02 },
      indicators: { rsi_14: 62.3, macd: { value: 150, signal: 120 }, bb_width: 4.2, atr_14: 850 }
    },
    eth: {
      price: 2400,
      "24h_change": 1.8,
      volume: 1250000000,
      order_book: { bid_depth: 85000000, ask_depth: 72000000, spread: 0.03 },
      indicators: { rsi_14: 58.1, macd: { value: 45, signal: 32 }, bb_width: 3.8, atr_14: 120 }
    },
    sol: {
      price: 102,
      "24h_change": 4.5,
      volume: 850000000,
      order_book: { bid_depth: 45000000, ask_depth: 42000000, spread: 0.04 },
      indicators: { rsi_14: 68.5, macd: { value: 2.1, signal: 1.8 }, bb_width: 5.1, atr_14: 6 }
    }
  },
  on_chain_metrics: {
    exchange_flows: { binance: -1200, coinbase: 800 },
    whale_transactions: 45,
    miner_supply: 1800
  },
  sentiment_scores: { twitter: 0.42, reddit: 0.38, news: 0.25, overall: 0.35 },
  market_context: {
    btc_dominance: 52.3,
    fear_greed_index: 68,
    funding_rates: { btc: 0.008, eth: 0.012 },
    upcoming_events: ["FOMC meeting: 2024-01-17"]
  },
  neural_core: {
    provider: 'GEMINI',
    deepseek_model: 'deepseek-chat',
    gemini_model: 'gemini-2.0-flash',
    geminiKey: '',
    deepseekKey: '',
    openaiKey: '',
    anthropicKey: '',
    temperature: 0.3,
    max_tokens: 1000,
    confidence_threshold: 0.6
  }
};

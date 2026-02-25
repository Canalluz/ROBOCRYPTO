
export interface ExchangeConfig {
  id: string;
  name: string;
  status: 'CONNECTED' | 'DISCONNECTED';
  lastSync: string;
  balance: number;
  apiKey: string;
  apiSecret: string;
}

export interface Position {
  asset: string;
  size: number;
  entry: number;
  current: number;
  target?: number;
  volatility?: number;
  beta?: number;
  unrealized_pnl?: number;
}

export interface Portfolio {
  current_positions: Position[];
  cash_available: number;
  daily_pnl: number;
  var_95: number;
}

export interface Indicator {
  rsi_14: number;
  macd: { value: number; signal: number };
  bb_width: number;
  atr_14: number;
}

export interface MarketData {
  price: number;
  "24h_change": number;
  volume: number;
  order_book: {
    bid_depth: number;
    ask_depth: number;
    spread: number;
  };
  indicators: Indicator;
}

export interface MarketMetrics {
  [key: string]: MarketData;
}

export interface SystemData {
  timestamp: string;
  portfolio: Portfolio;
  market_data: MarketMetrics;
  on_chain_metrics: {
    exchange_flows: { [key: string]: number };
    whale_transactions: number;
    miner_supply: number;
  };
  sentiment_scores: {
    twitter: number;
    reddit: number;
    news: number;
    overall: number;
  };
  market_context: {
    btc_dominance: number;
    fear_greed_index: number;
    funding_rates: { [key: string]: number };
    upcoming_events: string[];
  };
  neural_core: NeuralCoreConfig;
}

export interface NeuralCoreConfig {
  provider: 'GEMINI' | 'DEEPSEEK' | 'MOCK' | 'OPENAI' | 'ANTHROPIC';
  deepseek_model: 'deepseek-chat' | 'deepseek-reasoner';
  gemini_model: string;
  geminiKey: string;
  deepseekKey: string;
  openaiKey: string;
  anthropicKey: string;

  temperature: number;
  max_tokens: number;
  confidence_threshold: number;
}

export interface Recommendation {
  id: string;
  asset: string;
  timeframe: string;
  action: 'COMPRA' | 'VENDA' | 'HEDGE';
  type: 'SPOT' | 'MARGEM' | 'FUTUROS';
  confidence: number;
  entry_main: number;
  entry_secondary?: number;
  stop_loss: number;
  take_profit_1: number;
  take_profit_2: number;
  take_profit_3: number;
  position_size: string;
  risk_per_trade: string;
  risk_reward_ratio: string;
  technical_justification: string[];
  quantitative_justification: {
    expected_value: string;
    success_probability: string;
    var_impact: string;
  };
  catalysts: string[];
  monitoring_metrics: string[];
  validity_hours: number;
}

export interface RiskAlert {
  level?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  action: string;
  type?: string;
  asset?: string;
  current?: number;
  limit?: number;
  threshold?: number;
  value?: number;
  recommendation?: string;
}

export interface AnalysisResponse {
  timestamp_analysis: string;
  portfolio_assessment: {
    health_score: number;
    required_actions: string[];
    current_var: number;
    projected_var: number;
  };
  recommendations: Recommendation[];
  risk_alerts: RiskAlert[];
  executive_summary: string;
  next_review: string;
}

export interface RebalancingTrade {
  asset: string;
  action: 'SELL' | 'BUY';
  amount_usd: number;
  units: number;
  reason: string;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  execution_window: string;
  limit_price: number;
  impact_pnl: number;
}

export interface PerformanceMetrics {
  total_return_ytd: number;
  sharpe_ratio: number;
  max_drawdown_30d: number;
  var_95_1d: number;
  correlation_to_benchmark: number;
  alpha: number;
}

export interface PortfolioAnalysis {
  report_id: string;
  executive_summary: {
    portfolio_health: number;
    risk_level: string;
    recommended_actions: number;
    urgent_alerts: number;
  };
  performance_metrics: PerformanceMetrics;
  rebalancing_trades: RebalancingTrade[];
  risk_alerts: RiskAlert[];
  projections: {
    base_case_30d_return: number;
    confidence_interval: [number, number];
    expected_max_drawdown: number;
    liquidity_profile: string;
  };
  optimization_score: {
    diversification: number;
    risk_adjusted_return: number;
    liquidity: number;
    tax_efficiency: number;
    overall_score: number;
  };
  next_review: {
    scheduled_time: string;
    triggers: string[];
  };
}

export interface RiskAnalysis {
  timestamp: string;
  risk_score: number;
  status: 'OK' | 'ALERTA' | 'CRÍTICO';
  primary_metrics: {
    var_95_1d_usd: number;
    var_percentage: number;
    expected_shortfall: number;
    current_drawdown: number;
    liquidity_score: number;
  };
  critical_alerts: RiskAlert[];
  mitigation_actions: Array<{
    action: string;
    asset: string;
    amount_usd: number;
    reason: string;
  }>;
  stress_scenarios: {
    market_down_20: number;
    volatility_spike_50: number;
    liquidity_crisis: number;
  };
  next_check: string;
}

export interface BotStrategy {
  id: string;
  name: string;
  description: string;
  type: 'AGGRESSIVE_SCALPING' | 'CONSERVATIVE_TREND' | 'NEURAL_ARBITRAGE';
}

export interface AggressiveConfig {
  exchangeId: string;
  useFutures: boolean;
  assets: string[];
  leverage: number;
  timeframeFilter: string;
  timeframeExecution: string;
  emaFast: number;
  emaSlow: number;
  emaTrend: number;
  rsiLong: [number, number];
  rsiShort: [number, number];
  riskPerTrade: number;
  maxTradesPerDay: number;
  maxConsecutiveLosses: number;
  maxDailyLoss: number;
  tpPartial: number;
  tpFinal: number;
  stopLossRange: [number, number];
  atrThreshold: number;
  takeProfitPct?: number;
  stopLossPct?: number;
  positionSizePct?: number;
  tradingHours?: { start: string; end: string; use24h?: boolean };
  aiProvider?: 'GEMINI' | 'DEEPSEEK' | 'OPENAI' | 'ANTHROPIC' | 'MOCK';
  marginMode?: 'CROSS' | 'ISOLATED';
  marketMode?: 'SPOT' | 'FUTURES';
  timeframe?: '5m' | '15m' | '1h' | '2h' | '4h' | '1D' | 'AUTO';
}


export interface ConservativeConfig {
  exchangeId: string;
  mode: 'SPOT' | 'FUTURES';
  assets: string[];
  leverage: number;
  timeframeTrend: string;
  timeframeDecision: string;
  timeframeExecution: string;
  emaTrend: number;
  emaFast: number;
  emaSlow: number;
  rsiRange: [number, number];
  riskPerTrade: number;
  maxTradesPerDay: number;
  maxConsecutiveLosses: number;
  maxDailyLoss: number;
  rrRatio: number;
  tpPartial: number;
  atrThreshold: [number, number];
  useEmaTrend: boolean;
  useEmaRejection: boolean;
  useStructureFilter: boolean;
  useRsiCheck: boolean;
  takeProfitPct?: number;
  stopLossPct?: number;
  positionSizePct?: number;
  tradingHours?: { start: string; end: string; use24h?: boolean };
  aiProvider?: 'GEMINI' | 'DEEPSEEK' | 'OPENAI' | 'ANTHROPIC' | 'MOCK';
  marginMode?: 'CROSS' | 'ISOLATED';
  marketMode?: 'SPOT' | 'FUTURES';
  timeframe?: '5m' | '15m' | '1h' | '2h' | '4h' | '1D' | 'AUTO';
}


export interface SimpleMAConfig {
  exchangeId: string;
  mode: 'SPOT' | 'FUTURES';
  assets: string[];
  leverage: number;
  fastMa: number;
  slowMa: number;
  trendMa: number;
  volMultiplier: number;
  rsiRange: [number, number];
  rsiPeriod: number;
  capitalPerTrade: number;
  riskPerTrade: number;
  maxOpenTrades: number;
  maxDailyTrades: number;
  stopLossPct: number;
  tpRatios: number[];
  emergencyStopPct: number;
  cooldownTrades: number;
  maxConsecutiveLosses: number;
  maxDailyLoss: number;
  takeProfitPct?: number;
  positionSizePct?: number;
  tradingHours?: { start: string; end: string; use24h?: boolean };
  aiProvider?: 'GEMINI' | 'DEEPSEEK' | 'OPENAI' | 'ANTHROPIC' | 'MOCK';
  marginMode?: 'CROSS' | 'ISOLATED';
  marketMode?: 'SPOT' | 'FUTURES';
  timeframe?: '5m' | '15m' | '1h' | '2h' | '4h' | '1D' | 'AUTO';
}

export interface ZigZagConfig {
  exchangeId: string;
  mode: 'SPOT' | 'FUTURES';
  assets: string[];
  leverage: number;
  depth: number;
  deviation: number;
  backstep: number;
  riskPerTrade: number;
  profitTarget: number;
  stopLoss: number;
  maxDailyLoss: number;
  maxTradesPerDay?: number;
  takeProfitPct?: number;
  stopLossPct?: number;
  positionSizePct?: number;
  tradingHours?: { start: string; end: string; use24h?: boolean };
  aiProvider?: 'GEMINI' | 'DEEPSEEK' | 'OPENAI' | 'ANTHROPIC' | 'MOCK';
  marginMode?: 'CROSS' | 'ISOLATED';
  marketMode?: 'SPOT' | 'FUTURES';
  timeframe?: '5m' | '15m' | '1h' | '2h' | '4h' | '1D' | 'AUTO';
}

export interface MatrixScalpConfig {
  exchangeId: string;
  assets: string[];
  leverage: number;
  positionSizePct: number;
  maxDailyTrades: number;
  dailyLossLimit: number;
  stopLossPct: number;
  takeProfitPct: number;
  riskPerTrade: number;
  slType: 'ATR' | 'FIXED';
  fixedSlPct: number;
  atrMultiplier: number;
  tpLevels: Array<{ percent: number; size_percent: number }>;
  trailingStop: {
    enabled: boolean;
    activation: number;
    distance: number;
  };
  filters: {
    trendFilter: {
      enabled: boolean;
      fastEma: number;
      slowEma: number;
      timeframe: string;
    };
    volumeFilter: {
      enabled: boolean;
      minVolumeRatio: number;
      periods: number;
    };
    avoidHours: number[];
  };
  strategy: {
    minSignalStrength: number;
    maxSpread: number;
  };
  tradingHours?: { start: string; end: string; use24h?: boolean };
  aiProvider?: 'GEMINI' | 'DEEPSEEK' | 'OPENAI' | 'ANTHROPIC' | 'MOCK';
  marginMode?: 'CROSS' | 'ISOLATED';
  marketMode?: 'SPOT' | 'FUTURES';
  timeframe?: '5m' | '15m' | '1h' | '2h' | '4h' | '1D' | 'AUTO';
}

export interface MatrixNeuralConfig {
  exchangeId: string;
  assets: string[];
  leverage: number;
  stopLossPct: number;
  takeProfitPct: number;
  riskPerTrade: number;
  positionSizePct: number;
  maxDailyTrades: number;
  dailyLossLimit: number;
  minConfidence: number;
  models: {
    dnn: boolean;
    lstm: boolean;
    transformer: boolean;
    randomForest: boolean;
    gradientBoosting: boolean;
  };
  filters: {
    sentiment: boolean;
    orderBook: boolean;
    socialMetrics: boolean;
    regimeFiltering: boolean;
  };
  allowedRegimes: Array<'TRENDING_BULL' | 'TRENDING_BEAR' | 'RANGING' | 'HIGH_VOLATILITY' | 'LOW_VOLATILITY' | 'BREAKOUT' | 'REVERSAL'>;
  tradingHours?: { start: string; end: string; use24h?: boolean };
  aiProvider?: 'GEMINI' | 'DEEPSEEK' | 'OPENAI' | 'ANTHROPIC' | 'MOCK';
  marginMode?: 'CROSS' | 'ISOLATED';
  marketMode?: 'SPOT' | 'FUTURES';
  timeframe?: '5m' | '15m' | '1h' | '2h' | '4h' | '1D' | 'AUTO';
}

export interface AnatomiaFluxoConfig {
  exchangeId: string;
  assets: string[];
  leverage: number;
  ema_curta: number;
  ema_media: number;
  ema_longa: number;
  volume_profile_dias: number;
  smi_periodo_acum: number;
  smi_periodo_dist: number;
  smi_threshold: number;
  cvd_suavizacao: number;
  bandas_desvio: number;
  rsi_periodo: number;
  rsi_sobrevendido: number;
  rsi_sobrecomprado: number;
  estocastico_k: number;
  estocastico_d: number;
  risco_por_operacao: number;
  alavancagem_maxima: number;
  trailing_stop_distancia: number;
  max_ativos_simultaneos: number;
  timeframes: {
    '1d': string;
    '4h': string;
    '1h': string;
    '15m': string;
  };
  takeProfitPct?: number;
  stopLossPct?: number;
  positionSizePct?: number;
  tradingHours?: { start: string; end: string; use24h?: boolean };
  aiProvider?: 'GEMINI' | 'DEEPSEEK' | 'OPENAI' | 'ANTHROPIC' | 'MOCK';
  marginMode?: 'CROSS' | 'ISOLATED';
  marketMode?: 'SPOT' | 'FUTURES';
  timeframe?: '5m' | '15m' | '1h' | '2h' | '4h' | '1D' | 'AUTO';
}

export interface AutomationRule {
  id: string;
  asset: string;
  fastMA: number;
  slowMA: number;
  maType: 'EMA' | 'SMA' | 'WMA';
  direction: 'BUY' | 'SELL';
  status: 'ARMED' | 'TRIGGERED' | 'ZZZ';
  createdAt: string;
  indicator?: string;
  indicatorParams?: any;
}

export interface TradingBot {
  id: string;
  name: string;
  strategyId: 'AGGRESSIVE_SCALP' | 'CONSERVATIVE_TREND' | 'SIMPLE_MA' | 'ZIGZAG_PRO' | 'MATRIX_SCALP' | 'MATRIX_NEURAL' | 'ANATOMIA_FLUXO' | 'ROBO_IA' | 'ROBO_ENSAIO';
  status: 'ACTIVE' | 'PAUSED' | 'STOPPED' | 'TEST';
  config: AggressiveConfig | ConservativeConfig | SimpleMAConfig | ZigZagConfig | MatrixScalpConfig | MatrixNeuralConfig | AnatomiaFluxoConfig;
  performance: {
    totalPnl: number;
    todayPnl: number;
    winRate: number;
    trades: number;
    consecutiveLosses: number;
    avgTradeDuration: string;
  };
  lastActivity: string;
}

export interface Trade {
  id: string;
  botId: string;
  timestamp: string;
  asset: string;
  type: 'BUY' | 'SELL';
  price: number;
  amount: number;
  result_usd?: number;
  profit?: boolean;
}

export interface EquityPoint {
  time: string;
  value: number;
}

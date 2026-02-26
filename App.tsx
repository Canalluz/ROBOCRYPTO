
import React, { useState, useEffect, useCallback, useRef, useReducer } from 'react';
import { ethers } from 'ethers';
// import { createChart } from 'lightweight-charts';
import {
  TrendingUp,
  Shield,
  ShieldCheck, // Added
  AlertTriangle,
  Activity,
  BarChart3,
  Zap,
  Clock,
  ChevronRight,
  RefreshCw,
  LayoutDashboard,
  Wallet,
  Settings as SettingsIcon,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  FileText,
  PieChart as PieChartIcon,
  Flame,
  Droplets,
  GanttChart,
  Link,
  Lock,
  Server,
  GitMerge, // Added
  Save,
  CheckCircle2,
  Cpu,
  Eye,
  BrainCircuit,
  Terminal,
  MousePointer2,
  ArrowRightLeft,
  Settings2,
  ZapOff,
  Crosshair,
  Coins,
  Bot,
  User,
  PlusCircle,
  Send,
  Globe,
  Plus,
  Minus,
  Download,
  Upload,
  QrCode,
  History,
  Copy,
  Layout,
  ArrowDownLeft,
  Check,
  X,
  Play,
  Trash2,
  Info,
  LogOut
} from 'lucide-react';
import { SystemData, AnalysisResponse, Recommendation, RiskAlert, PortfolioAnalysis, RebalancingTrade, RiskAnalysis, TradingBot, AggressiveConfig, ExchangeConfig, AutomationRule, Trade, EquityPoint, MatrixScalpConfig, MatrixNeuralConfig } from './types';
import { INITIAL_DATA } from './constants';
import { getAIAnalysis, getAIPortfolioAnalysis, getAIRiskAnalysis } from './services/ai';
import { botService } from './services/botService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList
} from 'recharts';

// ZigZag Utility
const calculateZigZag = (data: any[], depth: number, deviation: number, backstep: number) => {
  // Placeholder for ZigZag calculation logic
  // Returns direction (1 for Bull, -1 for Bear) and pivot points
  // This would typically process an array of OHLCV data
  return {
    direction: 'NEUTRAL',
    lastPivotPrice: 0,
    lastPivotIndex: 0
  };
};

const COLORS = ['#06b6d4', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#64748b'];

const TRANSLATIONS = {
  en: {
    terminal_name: "Robô Crypto",
    inst_terminal: "Institutional Terminal",
    trading_core: "Trading Core",
    ai_mode: "AI MODE",
    nav_robots: "Trading Bots",
    nav_assets: "Create Crypto",
    nav_monitoring: "Data Analysis",
    nav_settings: "Settings",
    ai_core: "Neural Core Config",
    ai_provider: "AI Service Provider",
    ai_model_sel: "Model Selection",
    ai_api_key: "Secret API KEY",
    ai_temperature: "Creativity (Temp)",
    ai_max_tokens: "Max Tokens",
    ai_conf_threshold: "Confidence Threshold",
    total_equity: "Total Equity",
    portfolio_value: "Portfolio Value",
    initial_balance: "Exchange Balance ($)",
    save_changes: "Apply Configuration",
    sys_health: "System Health",
    header_robots: "Automated Trading Hub",
    header_monitoring: "Institutional Monitoring Dashboard",
    header_assets: "Asset Factory & Contract Lab",
    header_settings: "Exchange Management",
    workspace: "Workspace",
    live_nodes: "Live Nodes",
    latency: "Latency",
    logic_enabled: "Logic Enabled",
    last_scan: "Last Scan",
    sync: "Sync Analytics",
    managed_aum: "Managed AUM",
    daily_pnl: "Daily P&L",
    fear_greed: "Fear & Greed",
    asset_dist: "Asset Distribution",
    risk_safety: "Risk & Safety",
    model_arch: "Model Architecture",
    auton_mode: "Fully Autonomous Mode",
    social_sent: "Social Sentiment Alpha",
    graph_pattern: "Graph Pattern Recognition",
    deploy_intel: "Deploy Intelligence",
    exec_authority: "Core Execution Authority",
    safety_cons: "Safety Constraints",
    lev_hardcap: "Leverage Hardcap",
    drawdown_term: "Drawdown Termination",
    max_exposure: "Max Exposure (Fund)",
    asset_cap: "Asset Cap",
    update_safety: "Update Safety Protocols",
    prov_openai: "OpenAI (GPT-4o)",
    prov_anthropic: "Anthropic (Claude 3.5)",
    prov_mock: "MOCK (Experimental/Free)",
    lang_sel: "Language / Idioma",
    tv_chart: "TradingView Chart",
    exec_desk: "Execution Desk",
    api_key: "API Key",
    api_secret: "API Secret",
    save: "Save",
    timeframe: "Execution Timeframe",
    auto_mode: "AUTO (AI Selection)",
    nav_charts: "Chart",
    nav_mode: "Mode",
    header_charts: "Institutional Analysis Terminal",
    mon_pnl: "Total P&L",
    mon_winrate: "Win Rate",
    mon_drawdown: "Max Drawdown",
    mon_active_bots: "Active Robots",
    mon_equity: "Equity Evolution",
    mon_history: "Trade History",
    all_robots: "All Robots",
    mon_status_op: "OPERATING",
    mon_status_paused: "PAUSED",
    mon_col_time: "Time",
    mon_col_asset: "Asset",
    mon_col_type: "Type",
    mon_col_price: "Price",
    mon_col_amount: "Amount",
    mon_col_result: "Result",
    manual_control: "Manual control or algorithmic rule setting.",
    manual_only: "MANUAL ONLY",
    ai_assisted: "AI ASSISTED",
    strategic_cross: "Strategic Crossovers",
    quick_trade: "Quick Direct Trade",
    rule_constructor: "Rule Constructor",
    rule_triggers: "Set mechanical triggers for autonomous execution.",
    target_ticker: "Target Ticker",
    entry_direction: "Entry Direction",
    buy: "BUY",
    sell: "SELL",
    fast_ma: "Fast MA (Source)",
    slow_ma: "Slow MA (Target)",
    calc_model: "Calculation Model",
    exec_logic: "Execution Logic",
    pipeline_ready: "Pipeline ready for",
    pairs: "pairs.",
    mexc_validated: "MEXC bridge validated. Latency: 42ms.",
    watchdog_active: "Watchdog active: Monitoring technical crossover for",
    compliance_enforcer: "Compliance Enforcer",
    hard_limit: "Hard Limit",
    drawdown_cap: "Drawdown Cap",
    wizard_title: "Deployment Wizard",
    agg_scalper: "Aggressive Scalper",
    secure_trend: "Secure Trend Pro",
    simple_ma_core: "SimpleMAcrypto Core",
    zigzag_pro: "ZigZag Pro",
    mexc_logic_desc: "Configure institutional-grade high frequency scalp logic for MEXC.",
    secure_logic_desc: "Deploy a disciplined, low-leverage trend following system for capital preservation.",
    simple_ma_desc: "Classic crossover system optimized for Binance crypto assets with strict risk filters.",
    zigzag_desc: "Advanced pivot detection for high-probability reversal entries.",
    agg_scalp_label: "Aggressive Scalp",
    secure_trend_label: "Secure Trend",
    ma_cross_label: "MA Cross",
    scalp_engine_config: "Scalping Engine Config",
    scalp_engine_desc: "High-frequency execution targeting micro-structure inefficiencies.",
    leverage: "Leverage",
    take_profit: "Take Profit",
    stop_loss: "Stop Loss",
    max_drawdown: "Max Drawdown",
    cons_config: "Conservative Config",
    entry_strat: "Entry Strategy",
    trend_filter: "Trend Filter",
    risk_reward: "Risk Reward",
    trailing_stop: "Trailing Stop",
    ma_cross_logic: "MA Crossover Logic",
    ma_cross_desc: "Classic trend following system using dual moving averages.",
    zz_pivots: "ZigZag Pivot Reversals",
    zz_pivots_desc: "Trades confirmed pivots based on Depth/Deviation settings.",
    market_filters: "Market Filters",
    ex_target: "Exchange Target",
    trading_pairs: "Trading Pairs",
    entry_strat_logic: "Entry Strategy Logic",
    tech_summary: "Technical Summary",
    inv_risk_cons: "Invariant Risk Constraints",
    risk_order: "Risk / Order",
    max_trades_day: "Max Trades/Day",
    drawdown_stop: "Drawdown Stop",
    max_position: "Max Position",
    risk_note: "Note: Martingale, grid modeling, and loss recovery are hard-disabled by core engine protocol.",
    instantiate_agg: "INSTANTIATE AGGRESSIVE FLEET",
    instantiate_sec: "INSTANTIATE SECURE FLEET",
    instantiate_ma: "INSERT ROBOT",
    instantiate_matrix: "INSTANTIATE MATRIX-SCALP PRO",
    instantiate_neural: "INSTANTIATE MATRIX-NEURAL X",
    matrix_scalp: "MatrixScalp Pro",
    matrix_scalp_desc: "High-frequency precision scalping with dynamic volatility adjustment.",
    matrix_neural: "MatrixNeural X",
    matrix_neural_desc: "Institutional-grade AI ensemble using Deep Learning and sentiment analysis.",
    abort: "ABORTAR",
    deploy_wizard: "Deployment Wizard",
    config_bot: "Configure",
    adj_params: "Adjust execution parameters for this active entity.",
    gen_risk: "General Risk",
    exec_strat: "Execution Strategy",
    assets_filter: "Assets Filter",
    curr_strat_id: "Current Strategy ID",
    save_params: "Save Parameters",
    decommission: "Decommission",
    desc_agg_tech: '"Enters on aggressive pullbacks to EMA 9/21 after confirmation of impulse candle and high relative volume, only when trend aligns with 15m EMA 200."',
    desc_sec_tech: '"Executes high-probability entries on 15m candle confirmation after a controlled pullback to EMA 20/50 in a confirmed 4H/Daily upward structure."',
    desc_ma_tech: '"Algorithmic 1h cross-over logic with multi-stage TP and high-conviction volume filters for disciplined asset growth."',
    desc_matrix_tech: '"Employs institutional-grade order flow analysis and ATR-based dynamic stops to exploit micro-volatility."',
    desc_neural_tech: '"Leverages LSTM and Transformer ensembles for trend prediction, reinforced by real-time NLP sentiment and order flow imbalance detection."',
    instantiate: "Instantiate",
    currently_tracking: "Currently Tracking",
    ai_int_status: "AI Integration Status",
    ai_int_desc: "New assets are automatically scanned by the Intelligence Core upon the next sync cycle.",
    utility_blueprint: "Utility Blueprint",
    token_name: "Token Name",
    symbol: "Symbol",
    total_supply: "Total Supply",
    network_chain: "Network / Chain",
    token_logo: "Token Logo",
    choose_image: "Choose Image",
    proc_protocol: "Processing Protocol...",
    deploy_smart_contract: "Deploy Smart Contract",
    conn_wallet: "Connected Wallet",
    est_gas_fee: "Est. Gas Fee",
    contract_success: "Contract Deployed Successfully",
    view_explorer: "View on Explorer",
    copy_code: "Copy Code",
    bot_naming_agg: "Aggressive",
    bot_naming_sec: "Secure",
    bot_naming_ma: "MA-Cross",
    bot_naming_zz: "ZigZag Pro",
    bot_naming_matrix: "MatrixScalp",
    bot_naming_neural: "MatrixNeural",
    dry_run: "MODO TESTE",
    max_trades_daily: "Max Daily Trades",
    tp_pct: "Take Profit (%)",
    sl_pct: "Stop Loss (%)",
    pos_size_pct: "Position Size (% of Balance)",
    trading_hours: "Trading Hours",
    start_time: "Start",
    end_time: "End",
    op_24h: "24h Operation",
    reset_default: "Reset to Default",
    ema_fast: "EMA Fast",
    ema_slow: "EMA Slow",
    ema_trend: "EMA Trend",
    rsi_range: "RSI Range",
    tp_partial: "Partial Take Profit",
    tp_final: "Final Take Profit",
    atr_mult: "ATR Multiplier",
    zz_depth: "ZigZag Depth",
    zz_dev: "ZigZag Deviation",
    zz_backstep: "ZigZag Backstep",
    ma_fast: "MA Fast",
    ma_slow: "MA Slow",
    ma_trend: "MA Trend",
    rr_ratio: "Risk/Reward Ratio",
    cancel: "Cancel",
    nav_risk: "Risk",
    test_connection: "Test Connection",
    conn_success: "Connection verified!",
    conn_error: "Error: API Key and Secret are required."
  },
  pt: {
    terminal_name: "Robô Crypto",
    inst_terminal: "Terminal Institucional",
    trading_core: "Núcleo de Trading",
    ai_mode: "MODO IA",
    nav_robots: "Robôs de Trading",
    nav_assets: "Criar Crypto",
    nav_monitoring: "Análise de dados",
    nav_settings: "Configurações",
    sys_health: "Saúde do Sistema",
    header_robots: "Hub de Trading Automatizado",
    header_monitoring: "Dashboard de Monitoramento Institucional",
    header_assets: "Fábrica de Ativos e Lab de Contratos",
    header_settings: "Gestão de Corretoras",
    workspace: "Espaço de Trabalho",
    live_nodes: "Nodes Ativos",
    latency: "Latência",
    logic_enabled: "Lógica Ativa",
    last_scan: "Última Varredura",
    sync: "Sincronizar Analíticos",
    managed_aum: "AUM Gerenciado",
    daily_pnl: "P&L Diário",
    fear_greed: "Medo & Ganância",
    asset_dist: "Distribuição de Ativos",
    risk_safety: "Risco & Segurança",
    total_equity: "Patrimônio Total",
    portfolio_value: "Valor da Carteira",
    initial_balance: "Saldo na Corretora ($)",
    model_arch: "Arquitetura do Modelo",
    auton_mode: "Modo Totalmente Autônomo",
    social_sent: "Alfa de Sentimento Social",
    graph_pattern: "Reconhecimento de Padrões Gráficos",
    deploy_intel: "Implantar Inteligência",
    exec_authority: "Autoridade de Execução Principal",
    safety_cons: "Restrições de Segurança",
    lev_hardcap: "Limite de Alavancagem",
    drawdown_term: "Terminação por Drawdown",
    max_exposure: "Exposição Máxima (Fundo)",
    asset_cap: "Limite por Ativo",
    update_safety: "Atualizar Protocolos de Segurança",
    prov_openai: "OpenAI (GPT-4o)",
    prov_anthropic: "Anthropic (Claude 3.5)",
    prov_mock: "MOCK (Experimental/Grátis)",
    lang_sel: "Idioma / Language",
    tv_chart: "Gráfico TradingView",
    exec_desk: "Painel de Execução",
    api_key: "Chave API",
    api_secret: "Segredo API",
    save: "Salvar",
    timeframe: "Tempo Gráfico",
    auto_mode: "AUTO (Seleção IA)",
    nav_charts: "Gráficos Avançados",
    header_charts: "Terminal de Análise Institucional",
    mon_pnl: "P&L Total",
    mon_winrate: "Taxa de Acerto",
    mon_drawdown: "Drawdown Máx",
    mon_active_bots: "Robôs Ativos",
    mon_equity: "Evolução do Patrimônio",
    mon_history: "Histórico de Trades",
    all_robots: "Todos os Robôs",
    mon_status_op: "OPERANDO",
    mon_status_paused: "PAUSADO",
    mon_col_time: "Hora",
    mon_col_asset: "Ativo",
    mon_col_type: "Tipo",
    mon_col_price: "Preço",
    mon_col_amount: "Qtd",
    mon_col_result: "Resultado",
    pipeline_ready: "Pipeline pronto para",
    pairs: "pares.",
    mexc_validated: "Bridge MEXC validada. Latência: 42ms.",
    watchdog_active: "Watchdog ativo: Monitorando cruzamento técnico para",
    compliance_enforcer: "Executor de Conformidade",
    hard_limit: "Limite Rígido",
    drawdown_cap: "Limite de Drawdown",
    wizard_title: "Assistente de Implantação",
    agg_scalper: "Escalador Agressivo",
    secure_trend: "Tendência Segura Pro",
    simple_ma_core: "Núcleo SimpleMA",
    zigzag_pro: "ZigZag Pro",
    mexc_logic_desc: "Configure lógica de scalping de alta frequência nível institucional para MEXC.",
    secure_logic_desc: "Implante um sistema disciplinado de seguimento de tendência com baixa alavancagem para preservação de capital.",
    simple_ma_desc: "Sistema clássico de cruzamento otimizado para ativos cripto da Binance com filtros de risco rigorosos.",
    zigzag_desc: "Detecção avançada de pivôs para entradas de reversão de alta probabilidade.",
    agg_scalp_label: "Scalp Agressivo",
    secure_trend_label: "Tendência Segura",
    ma_cross_label: "Cruzamento MA",
    scalp_engine_config: "Config. do Mecanismo de Scalping",
    scalp_engine_desc: "Execução de alta frequência visando ineficiências de microestrutura.",
    leverage: "Alavancagem",
    take_profit: "Realização de Lucro",
    stop_loss: "Stop Loss",
    max_drawdown: "Drawdown Máximo",
    cons_config: "Configuração Conservadora",
    entry_strat: "Estratégia de Entrada",
    trend_filter: "Filtro de Tendência",
    risk_reward: "Risco Retorno",
    trailing_stop: "Stop Móvel",
    ma_cross_logic: "Lógica de Cruzamento MA",
    ma_cross_desc: "Sistema clássico de seguimento de tendência usando médias móveis duplas.",
    zz_pivots: "Reversões de Pivô ZigZag",
    zz_pivots_desc: "Opera pivôs confirmados baseados em configurações de Profundidade/Desvio.",
    market_filters: "Filtros de Mercado",
    ex_target: "Corretora Alvo",
    trading_pairs: "Pares de Trading",
    entry_strat_logic: "Lógica da Estratégia de Entrada",
    tech_summary: "Resumo Técnico",
    inv_risk_cons: "Restrições de Risco Invariantes",
    risk_order: "Risco / Ordem",
    max_trades_day: "Máx Trades/Dia",
    drawdown_stop: "Stop de Drawdown",
    max_position: "Posição Máxima",
    risk_note: "Nota: Martingale, modelagem de grade e recuperação de perdas estão desativados pelo protocolo do núcleo.",
    instantiate_agg: "INSTANCIAR FROTA AGGRESSIVA",
    instantiate_sec: "INSTANCIAR FROTA SEGURA",
    instantiate_ma: "Inserir ROBÔ",
    instantiate_matrix: "INSTANCIAR MATRIX-SCALP PRO",
    instantiate_neural: "INSTANCIAR MATRIX-NEURAL X",
    matrix_scalp: "MatrixScalp Pro",
    matrix_scalp_desc: "Scalping de precisão de alta frequência com ajuste dinâmico de volatilidade.",
    matrix_neural: "MatrixNeural X",
    matrix_neural_desc: "IA de nível institucional usando Deep Learning e análise de sentimento.",
    abort: "ABORTAR",
    deploy_wizard: "Assistente de Implantação",
    config_bot: "Configurar",
    adj_params: "Ajuste os parâmetros de execução para esta entidade ativa.",
    gen_risk: "Risco Geral",
    exec_strat: "Estratégia de Execução",
    assets_filter: "Filtro de Ativos",
    curr_strat_id: "ID da Estratégia Atual",
    save_params: "Salvar ParÃ¢metros",
    decommission: "Desativar",
    desc_agg_tech: '"Entra em pullbacks agressivos na EMA 9/21 após confirmação de vela de impulso e alto volume relativo, apenas quando a tendência se alinha com EMA 200 de 15m."',
    desc_sec_tech: '"Executa entradas de alta probabilidade na confirmação de vela de 15m após um pullback controlado na EMA 20/50 em uma estrutura de alta confirmada de 4H/Diário."',
    desc_ma_tech: '"Lógica de cruzamento algorítmico de 1h com TP de múltiplos estágios e filtros de volume de alta convicção para crescimento disciplinado de ativos."',
    desc_matrix_tech: '"Emprega análise de fluxo de ordens de nível institucional e paradas dinâmicas baseadas em ATR para explorar a microvolatilidade."',
    desc_neural_tech: '"Utiliza conjuntos LSTM e Transformer para previsão de tendência, reforçados por análise de sentimento NLP em tempo real e detecção de desequilíbrio de fluxo de ordens."',
    instantiate: "Instanciar",
    currently_tracking: "Monitorando Atualmente",
    ai_int_status: "Status de Integração IA",
    ai_int_desc: "Novos ativos são escaneados automaticamente pelo Núcleo de Inteligência no próximo ciclo de sincronização.",
    utility_blueprint: "Plano do Token",
    token_name: "Nome do Token",
    symbol: "SÃ­mbolo",
    total_supply: "Suprimento Total",
    network_chain: "Rede / Blockchain",
    token_logo: "Logo do Token",
    choose_image: "Escolher Imagem",
    proc_protocol: "Processando Protocolo...",
    deploy_smart_contract: "Implantar Contrato Inteligente",
    conn_wallet: "Carteira Conectada",
    est_gas_fee: "Taxa de Gás Est.",
    contract_success: "Contrato Implantado com Sucesso",
    view_explorer: "Ver no Explorer",
    copy_code: "Copiar Código",
    bot_naming_agg: "Agressivo",
    bot_naming_sec: "Seguro",
    bot_naming_ma: "Cruzamento MA",
    bot_naming_zz: "ZigZag Pro",
    bot_naming_matrix: "MatrixScalp",
    bot_naming_neural: "MatrixNeural",
    dry_run: "MODO TESTE",
    max_trades_daily: "Máx Trades Diários",
    tp_pct: "Realização de Lucro (%)",
    sl_pct: "Stop Loss (%)",
    pos_size_pct: "Tamanho da Posição (% do saldo)",
    trading_hours: "Controle de Horário",
    start_time: "Início",
    end_time: "Fim",
    op_24h: "Funcionamento 24h",
    reset_default: "Resetar para padrão",
    ai_core: "Configuração Neural Core",
    ai_provider: "Provedor de ServiÃ§o IA",
    ai_model_sel: "Seleção de Modelo",
    ai_api_key: "Secret API KEY",
    ai_temperature: "Criatividade (Temp)",
    ai_max_tokens: "Máximo de Tokens",
    ai_conf_threshold: "Limite de Confiança",
    save_changes: "Aplicar Configuração",
    neural_core_desc: "Arquitetura de IA institucional para análise avançada.",
    sec_api_key: "Secret API KEY",
    prov_deepseek: "DeepSeek AI",
    prov_gemini: "Google Gemini",
    ema_fast: "EMA Rápida",
    ema_slow: "EMA Lenta",
    ema_trend: "EMA de Tendência",
    rsi_range: "Intervalo RSI",
    tp_partial: "Lucro Parcial",
    tp_final: "Lucro Final",
    atr_mult: "Multiplicador ATR",
    zz_depth: "Profundidade ZigZag",
    zz_dev: "Desvio ZigZag",
    zz_backstep: "Backstep ZigZag",
    ma_fast: "MM RÃ¡pida",
    ma_slow: "MM Lenta",
    ma_trend: "MM TendÃªncia",
    rr_ratio: "RelaÃ§Ã£o Risco/Retorno",
    cancel: "Cancelar",
    nav_risk: "Risco",
    test_connection: "Testar ConexÃ£o",
    conn_success: "ConexÃ£o verificada!",
    conn_error: "Erro: Chave API e Secret sÃ£o obrigatÃ³rios."
  }
};
// Login Screen Component
const LoginScreen = ({
  email, setEmail,
  password, setPassword,
  error,
  isLoading,
  onLogin,
  language
}: any) => {
  return (
    <div className="min-h-screen bg-[#020617] text-slate-200 font-sans selection:bg-cyan-500/30 flex items-center justify-center relative overflow-hidden p-6">

      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full mix-blend-screen" />
        <div className="absolute inset-0 bg-[url('https://transparenttextures.com/patterns/cubes.png')] opacity-[0.03]"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        <div className="text-center mb-10 animate-in slide-in-from-bottom-4 duration-700">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-slate-900 border border-slate-800 shadow-[0_0_30px_rgba(6,182,212,0.15)] mb-6 relative group overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <BrainCircuit className="w-10 h-10 text-cyan-400 relative z-10" />
          </div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 tracking-tight">
            RobÃ´ Crypto
          </h1>
          <p className="text-slate-500 mt-2 text-sm uppercase tracking-widest font-medium">
            {language === 'pt' ? 'Terminal Institucional' : 'Institutional Terminal'}
          </p>
        </div>

        <form onSubmit={onLogin} className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-150">

          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3 text-red-400 text-sm animate-in shake">
              <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">
                {language === 'pt' ? 'E-mail de Acesso' : 'Access Email'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                  placeholder="carlos@adm.com"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-400 mb-2 ml-1">
                {language === 'pt' ? 'Senha' : 'Password'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-500" />
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-600 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full mt-8 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium py-4 rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.3)] hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {isLoading ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : (
              <>
                {language === 'pt' ? 'Acessar Terminal' : 'Access Terminal'}
                <ArrowRightLeft className="w-5 h-5 opacity-70 group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center flex items-center justify-center gap-2 text-slate-500 text-xs uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-emerald-500/70" />
          <span>{language === 'pt' ? 'ConexÃ£o Criptografada (AES-256)' : 'Encrypted Connection (AES-256)'}</span>
        </div>
      </div>
    </div>
  );
}

const App: React.FC = () => {
  const [data, setData] = useState<SystemData>(() => {
    const saved = localStorage.getItem('tradepro_system_data');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: transition from single apiKey to provider-specific keys
        if (parsed.neural_core && parsed.neural_core.apiKey) {
          if (!parsed.neural_core.geminiKey && parsed.neural_core.provider === 'GEMINI') {
            parsed.neural_core.geminiKey = parsed.neural_core.apiKey;
          } else if (!parsed.neural_core.deepseekKey && parsed.neural_core.provider === 'DEEPSEEK') {
            parsed.neural_core.deepseekKey = parsed.neural_core.apiKey;
          }
          // Note: we don't delete it here to avoid type issues if needed elsewhere, 
          // but the new code targets the specific keys.
        }
        return parsed;
      } catch (e) {
        console.error("Failed to load system data from storage", e);
      }
    }
    return INITIAL_DATA;
  });

  // Persist system data on change
  useEffect(() => {
    localStorage.setItem('tradepro_system_data', JSON.stringify(data));
  }, [data]);
  const [language, setLanguage] = useState<'en' | 'pt'>('pt');
  const [currentView, setCurrentView] = useState<'settings' | 'robots' | 'assets' | 'charts' | 'monitoring'>('charts');

  const t = (key: keyof typeof TRANSLATIONS.en) => TRANSLATIONS[language][key] || key;
  const [bots, setBots] = useState<TradingBot[]>(() => {
    const saved = localStorage.getItem('tradepro_bots');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Zero performance to match real exchange balance request
          return parsed.map((b: any) => ({
            ...b,
            performance: {
              totalPnl: 0,
              todayPnl: 0,
              winRate: 0,
              trades: 0,
              consecutiveLosses: 0,
              avgTradeDuration: '0m'
            }
          }));
        }
      } catch (e) {
        console.error("Failed to load bots from storage", e);
      }
    }
    return [];
  });

  // Persist bots on change
  useEffect(() => {
    localStorage.setItem('tradepro_bots', JSON.stringify(bots));
  }, [bots]);
  const [tradeHistory, setTradeHistory] = useState<Trade[]>(() => {
    const saved = localStorage.getItem('tradepro_trade_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [equityHistory, setEquityHistory] = useState<EquityPoint[]>([]);

  // Persist trade history
  useEffect(() => {
    localStorage.setItem('tradepro_trade_history', JSON.stringify(tradeHistory));
  }, [tradeHistory]);

  const botsRef = useRef(bots);
  useEffect(() => { botsRef.current = bots; }, [bots]);


  useEffect(() => {
    localStorage.setItem('tradepro_trade_history', JSON.stringify(tradeHistory));
  }, [tradeHistory]);

  // Connect WebSocket to Backend Engine
  useEffect(() => {
    botService.connect();

    botService.onTrade((trade) => {
      setTradeHistory(prev => [trade, ...prev].slice(0, 100)); // Keep last 100
    });

    botService.onStatus((botId, statusUpdates) => {
      setBots(prev => prev.map(b => {
        if (b.id === botId) {
          return {
            ...b,
            status: statusUpdates.status || b.status,
            performance: {
              ...b.performance,
              todayPnl: statusUpdates.todayPnl ?? b.performance.todayPnl,
              trades: statusUpdates.trades ?? b.performance.trades,
              winRate: statusUpdates.winRate ?? b.performance.winRate,
              consecutiveLosses: statusUpdates.consecutiveLosses ?? b.performance.consecutiveLosses
            },
            lastActivity: new Date().toLocaleTimeString()
          };
        }
        return b;
      }));
    });
  }, []);

  // Hydrate stateless backend with active/test bots restored from local storage
  useEffect(() => {
    botService.onConnect(() => {
      botsRef.current.forEach(bot => {
        if (bot.status === 'ACTIVE' || bot.status === 'TEST') {
          const ex = exchangesRef.current.find(e => e.id === bot.config.exchangeId);
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
              marketMode: (bot.config || {}).marketMode ?? 'SPOT',
              paperTrade: bot.status === 'TEST',
              status: bot.status
            }, ex);
          }
        }
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);


  // --- AUTHENTICATION STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Check saved session on load
  useEffect(() => {
    const session = localStorage.getItem('tradepro_auth');
    if (session === 'carlos_adm_session_v1') {
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    setIsLoggingIn(true);

    // Hardcoded credentials as requested
    setTimeout(() => {
      if (loginEmail === 'carlos@adm.com' && loginPassword === 'Sapato30') {
        localStorage.setItem('tradepro_auth', 'carlos_adm_session_v1');
        setIsAuthenticated(true);
      } else {
        setLoginError(language === 'pt' ? 'Email ou senha incorretos. Acesso negado.' : 'Incorrect email or password. Access denied.');
      }
      setIsLoggingIn(false);
    }, 800);
  };

  const handleLogout = () => {
    localStorage.removeItem('tradepro_auth');
    setIsAuthenticated(false);
  };

  const [exchanges, setExchanges] = useState<ExchangeConfig[]>(() => {
    const defaultExchanges: ExchangeConfig[] = [
      { id: 'binance', name: 'Binance Institutional', status: 'DISCONNECTED', lastSync: 'N/A', balance: 0, apiKey: '', apiSecret: '' },
      { id: 'mexc', name: 'MEXC Global', status: 'CONNECTED', lastSync: 'N/A', balance: 0, apiKey: 'mx0vglx73gnNfwgSE7', apiSecret: '6e19dfc6a212425883a5cb5676edb10c' },
      { id: 'kraken', name: 'Kraken Pro', status: 'DISCONNECTED', lastSync: 'N/A', balance: 0, apiKey: '', apiSecret: '' }
    ];

    const saved = localStorage.getItem('tradepro_exchanges');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return defaultExchanges.map(defEx => {
            const found = parsed.find((p: any) => p.id === defEx.id);
            if (!found) return defEx;

            // Force hardcoded MEXC keys
            if (defEx.id === 'mexc') {
              return {
                ...defEx,
                balance: 0,
                status: 'CONNECTED',
                lastSync: 'N/A'
              };
            }

            const cleanKey = found.apiKey || '';
            const cleanSecret = found.apiSecret || '';

            return {
              ...defEx,
              ...found,
              apiKey: cleanKey,
              apiSecret: cleanSecret,
              balance: 0, // Unconditionally set balance to 0 on initial load to force a fresh fetch
              status: cleanKey ? found.status : 'DISCONNECTED',
              lastSync: cleanKey ? found.lastSync : 'N/A'
            };
          });
        }
      } catch (e) {
        console.error("Failed to load/migrate exchanges", e);
      }
    }
    return defaultExchanges;
  });

  // Persist exchanges on change
  useEffect(() => {
    localStorage.setItem('tradepro_exchanges', JSON.stringify(exchanges));
  }, [exchanges]);

  const exchangesRef = useRef(exchanges);
  useEffect(() => { exchangesRef.current = exchanges; }, [exchanges]);

  const [tradingAuthority, setTradingAuthority] = useState<'AI' | 'HYBRID'>('AI');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [analysis, setAnalysis] = useState<AnalysisResponse | null>(null);
  const [lastAnalysisTimestamp, setLastAnalysisTimestamp] = useState<number>(0);
  const [lastAttemptTimestamp, setLastAttemptTimestamp] = useState<number>(0);

  // ðŸ”§ FIX: Reusable balance fetcher â€” called on save AND on periodic sync
  const fetchBalanceForExchange = useCallback((exId: string, apiKey: string, secret: string) => {
    if (!apiKey || !secret || (exId !== 'mexc' && exId !== 'binance')) return;

    console.log(`[Balance] Initiating fetch for ${exId}...`);

    fetch(`/api/balance/${exId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey, secret })
    })
      .then(async res => {
        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`HTTP ${res.status}: ${errText}`);
        }
        return res.json();
      })
      .then(data => {
        if (data && typeof data.balance === 'number') {
          console.log(`[Balance] Success ${exId}:`, data.balance);
          setExchanges(current => {
            const draft = [...current];
            const idx = draft.findIndex(e => e.id === exId);
            if (idx !== -1) {
              draft[idx] = { ...draft[idx], balance: data.balance, lastSync: new Date().toLocaleTimeString() };
            }
            return draft;
          });
        } else if (data && data.error) {
          const msg = typeof data.error === 'string' ? data.error : (data.error.msg || JSON.stringify(data.error));
          console.warn(`[Balance] ${exId}: ${msg}`);
          setExchanges(current => {
            const draft = [...current];
            const idx = draft.findIndex(e => e.id === exId);
            if (idx !== -1) {
              draft[idx] = { ...draft[idx], lastSync: 'Error: ' + msg.substring(0, 10) + '...' };
            }
            return draft;
          });
        }
      })
      .catch(err => {
        console.error(`[Balance] Fetch error for ${exId}:`, err);
        setExchanges(current => {
          const draft = [...current];
          const idx = draft.findIndex(e => e.id === exId);
          if (idx !== -1) {
            draft[idx] = { ...draft[idx], lastSync: 'Fetch Failed' };
          }
          return draft;
        });
      });
  }, []);

  // ðŸ”§ FIX: Auto-sync balances every 60 seconds for connected exchanges
  useEffect(() => {
    const interval = setInterval(() => {
      exchanges.forEach(ex => {
        if (ex.status === 'CONNECTED' && ex.apiKey && ex.apiSecret) {
          fetchBalanceForExchange(ex.id, ex.apiKey, ex.apiSecret);
        }
      });
    }, 60000);
    return () => clearInterval(interval);
  }, [exchanges, fetchBalanceForExchange]);

  // ðŸ”§ FIX: Fetch balance immediately on app mount for already-connected exchanges
  useEffect(() => {
    const timer = setTimeout(() => {
      exchanges.forEach(ex => {
        if (ex.status === 'CONNECTED' && ex.apiKey && ex.apiKey.length > 5 && ex.apiSecret) {
          console.log(`[Balance] Mount fetch for ${ex.id}...`);
          fetchBalanceForExchange(ex.id, ex.apiKey, ex.apiSecret);
        }
      });
    }, 2000); // Small delay to let the server start
    return () => clearTimeout(timer);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const runAnalysis = useCallback(async (force = false) => {
    // Sync balances first
    setExchanges(prevExchanges => {
      const updated = [...prevExchanges];
      for (const ex of updated) {
        if (ex.status === 'CONNECTED' && (ex.id === 'mexc' || ex.id === 'binance') && ex.apiKey && ex.apiSecret) {
          fetch(`/api/balance/${ex.id}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ apiKey: ex.apiKey, secret: ex.apiSecret })
          })
            .then(async res => {
              if (!res.ok) throw new Error(`HTTP ${res.status}`);
              return res.json();
            })
            .then(data => {
              if (data && typeof data.balance === 'number') {
                setExchanges(current => {
                  const draft = [...current];
                  const idx = draft.findIndex(e => e.id === ex.id);
                  if (idx !== -1 && draft[idx].balance !== data.balance) {
                    draft[idx] = { ...draft[idx], balance: data.balance, lastSync: new Date().toLocaleTimeString() };
                  }
                  return draft;
                });
              } else if (data && data.error) {
                const msg = typeof data.error === 'string' ? data.error : (data.error.msg || JSON.stringify(data.error));
                setError(`API Rejection (${ex.name}): ${msg}`);
              }
            })
            .catch(err => {
              console.error(`Balance sync error for ${ex.id}:`, err);
              setError(`Failed to fetch balance from ${ex.name}. Backend might be offline.`);
            });
        }
      }
      return updated;
    });

    const config = data.neural_core;

    // Cache logic: 5 minutes TTL (300,000 ms)
    const now = Date.now();
    if (!force && analysis && (now - lastAnalysisTimestamp < 300000)) {
      console.log("Using cached AI analysis (TTL < 5min)");
      return;
    }

    // Cooldown logic: if it failed recently, wait at least 30 seconds before retrying automatically
    if (!force && !analysis && (now - lastAttemptTimestamp < 30000)) {
      console.log("Analysis cooldown (30s) after previous failure...");
      return;
    }

    setLastAttemptTimestamp(now);

    if (config.provider === 'GEMINI' && (!config.geminiKey || config.geminiKey.trim() === '')) {
      if (force) {
        setError(language === 'pt'
          ? "Chave de API do Gemini não configurada. Acesse Configurações > IA Core para adicionar."
          : "Gemini API Key not configured. Go to Settings > AI Core to add it.");
      }
      return;
    }
    if (config.provider === 'DEEPSEEK' && (!config.deepseekKey || config.deepseekKey.trim() === '')) {
      if (force) {
        setError(language === 'pt'
          ? "Chave de API do DeepSeek não configurada. Acesse Configurações > IA Core para adicionar."
          : "DeepSeek API Key not configured. Go to Settings > AI Core to add it.");
      }
      return;
    }
    if (config.provider === 'OPENAI' && (!config.openaiKey || config.openaiKey.trim() === '')) {
      if (force) {
        setError(language === 'pt'
          ? "Chave de API do OpenAI não configurada. Acesse Configurações > IA Core para adicionar."
          : "OpenAI API Key not configured. Go to Settings > AI Core to add it.");
      }
      return;
    }
    if (config.provider === 'ANTHROPIC' && (!config.anthropicKey || config.anthropicKey.trim() === '')) {
      if (force) {
        setError(language === 'pt'
          ? "Chave de API do Anthropic não configurada. Acesse Configurações > IA Core para adicionar."
          : "Anthropic API Key not configured. Go to Settings > AI Core to add it.");
      }
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const result = await getAIAnalysis(data);
      if (result) {
        setAnalysis(result);
        setLastAnalysisTimestamp(Date.now());
        setLastUpdated(new Date());
      }
    } catch (err: any) {
      console.error("AI Analysis failed:", err);
      const rawMsg: string = err?.message || String(err);
      const rawLow = rawMsg.toLowerCase();
      const provider = data.neural_core.provider;
      let friendlyMsg: string;

      // Check for invalid/missing key first (covers Gemini "API key not valid", OpenAI 401, etc.)
      if (rawLow.includes('api key') || rawLow.includes('not valid') || rawLow.includes('invalid') || rawLow.includes('401') || rawLow.includes('403') || rawLow.includes('not configured')) {
        if (provider === 'GEMINI') {
          friendlyMsg = language === 'pt'
            ? `Chave do Gemini invÃ¡lida ou nÃ£o configurada. Gere uma chave gratuita em aistudio.google.com e adicione em ConfiguraÃ§Ãµes â€º IA Core.`
            : `Gemini API Key is invalid or missing. Get a free key at aistudio.google.com and add it in Settings â€º AI Core.`;
        } else {
          friendlyMsg = language === 'pt'
            ? `Chave de API invÃ¡lida ou sem permissÃ£o. Verifique a chave em ConfiguraÃ§Ãµes â€º IA Core.`
            : `Invalid or unauthorized API Key. Check it in Settings â€º AI Core.`;
        }
      } else if (rawLow.includes('quota') || rawLow.includes('429') || rawLow.includes('rate limit')) {
        friendlyMsg = language === 'pt'
          ? `Limite de requisiÃ§Ãµes da IA atingido. Aguarde alguns minutos ou use o modo MOCK.`
          : `AI rate limit reached. Wait a few minutes or switch to MOCK mode.`;
      } else if ((rawLow.includes('balance') || rawLow.includes('insufficient')) && provider !== 'GEMINI') {
        // Only show "recharge credits" for paid providers, never for Gemini
        friendlyMsg = language === 'pt'
          ? `A chave de API nÃ£o tem crÃ©ditos disponÃ­veis. A API do ${provider} Ã© paga (diferente do site gratuito). Troque para GEMINI (gratuito) ou MOCK em ConfiguraÃ§Ãµes â€º IA Core.`
          : `No API credits available. The ${provider} API is pay-per-use. Switch to GEMINI (free tier) or MOCK in Settings â€º AI Core.`;
      } else if (rawLow.includes('network') || rawLow.includes('fetch') || rawLow.includes('failed to fetch')) {
        friendlyMsg = language === 'pt'
          ? `Falha de conexÃ£o com a API de IA. Verifique sua internet e tente novamente.`
          : `Network error connecting to AI API. Check your internet connection.`;
      } else {
        friendlyMsg = language === 'pt'
          ? `Erro de IA (${provider}): ${rawMsg}`
          : `AI Error (${provider}): ${rawMsg}`;
      }
      setError(friendlyMsg);
    } finally {
      setIsLoading(false);
    }
  }, [data, language]);

  // Only auto-run analysis when landing on the charts view
  useEffect(() => {
    if (currentView === 'charts') {
      runAnalysis();
    }
  }, [currentView]);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);

  // --- LOGIN SCREEN GUARD ---
  if (!isAuthenticated) {
    return (
      <LoginScreen
        email={loginEmail}
        setEmail={setLoginEmail}
        password={loginPassword}
        setPassword={setLoginPassword}
        error={loginError}
        isLoading={isLoggingIn}
        onLogin={handleLogin}
        language={language}
      />
    );
  }

  // --- MAIN RENDER (AUTHENTICATED) ---
  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-50">
      <aside className="w-64 border-r border-slate-800 bg-slate-900/50 hidden lg:flex flex-col sticky top-0 h-screen">
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-cyan-500 p-2 rounded-lg shadow-lg shadow-cyan-900/40">
              <Zap className="w-5 h-5 text-slate-950" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">{t('terminal_name')}</h1>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 font-bold tracking-widest uppercase opacity-70">{t('inst_terminal')}</p>
        </div>

        <nav className="flex-1 p-4 space-y-2 mt-2">
          <NavBtn active={currentView === 'charts'} onClick={() => setCurrentView('charts')} icon={<TrendingUp />} label={t('nav_charts')} />
          <NavBtn active={currentView === 'robots'} onClick={() => setCurrentView('robots')} icon={<Bot />} label={t('nav_robots')} />
          <NavBtn active={currentView === 'monitoring'} onClick={() => setCurrentView('monitoring')} icon={<Activity />} label={t('nav_monitoring')} />
          <div className="pt-4 border-t border-slate-800/50">
            <NavBtn active={currentView === 'settings'} onClick={() => setCurrentView('settings')} icon={<SettingsIcon />} label={t('nav_settings')} />
            <NavBtn active={currentView === 'assets'} onClick={() => setCurrentView('assets')} icon={<Coins />} label={t('nav_assets')} />
            <NavBtn active={false} onClick={() => { setIsAuthenticated(false); localStorage.removeItem('tradepro_auth'); }} icon={<LogOut className="text-rose-500" />} label={language === 'pt' ? 'Sair' : 'Logout'} />
          </div>
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-4">
          <div className="bg-slate-800/50 p-4 rounded-xl">
            <div className="flex justify-between items-center mb-2">
              <span className="text-xs text-slate-400">{t('sys_health')}</span>
              <span className={`w-2 h-2 rounded-full ${error ? 'bg-rose-500' : 'bg-emerald-500'} animate-pulse`}></span>
            </div>
            <div className="h-1 bg-slate-700 rounded-full overflow-hidden">
              <div className={`h-full ${error ? 'bg-rose-500' : 'bg-cyan-500'} w-[98%]`}></div>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 p-8 overflow-y-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-3">
              <h2 className="text-3xl font-bold tracking-tight">
                {currentView === 'robots' ? t('header_robots') :
                  currentView === 'assets' ? t('header_assets') :
                    currentView === 'monitoring' ? t('header_monitoring') :
                      currentView === 'charts' ? t('header_charts') : t('header_settings')}
              </h2>
            </div>
            <div className="flex items-center gap-3 text-slate-400">
              <div className="flex items-center gap-1.5 bg-slate-900 px-2 py-1 rounded border border-slate-800 text-[10px] font-bold uppercase tracking-wider">
                <div className={`w-1.5 h-1.5 rounded-full ${tradingAuthority === 'AI' ? 'bg-cyan-500 animate-pulse' : 'bg-purple-500'}`} />
                {tradingAuthority} {t('logic_enabled')}
              </div>
              <span className="text-xs opacity-50">|</span>
              <div className="flex items-center gap-2 text-xs">
                <Clock className="w-4 h-4" />
                <span>{t('last_scan')}: {lastUpdated.toLocaleTimeString()}</span>
              </div>
              <span className="text-xs opacity-50">|</span>
              <div className="flex items-center gap-3">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">{t('managed_aum')}</span>
                  <span className="text-xs font-bold text-emerald-400">
                    {formatCurrency(
                      exchanges.reduce((acc, ex) => acc + (ex.status === 'CONNECTED' ? (ex.balance || 0) : 0), 0) +
                      bots.reduce((acc, b) => acc + (b.performance.totalPnl || 0), 0)
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {currentView !== 'settings' && (
              <button onClick={() => runAnalysis(true)} disabled={isLoading} className="flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-800 hover:border-cyan-500/30 text-slate-200 font-bold rounded-xl transition-all shadow-xl group">
                <RefreshCw className={`w-5 h-5 group-hover:text-cyan-400 ${isLoading ? 'animate-spin text-cyan-500' : ''}`} />
                {t('sync')}
              </button>
            )}
            {currentView !== 'settings' && (
              <div
                onClick={() => setCurrentView('settings')}
                className={`p-3 rounded-xl border cursor-pointer transition-all ${currentView === 'settings' ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-50 hover:border-slate-700'}`}
              >
                <SettingsIcon className="w-5 h-5" />
              </div>
            )}
          </div>
        </header>

        {error && currentView !== 'settings' && (
          <div className="mb-8 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-3 text-rose-500 animate-in slide-in-from-top-4">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        {currentView === 'charts' && (
          <div className="space-y-8 animate-in fade-in duration-700">
            <ChartsView t={t} trades={tradeHistory} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <ExecutiveSummary analysis={analysis} isLoading={isLoading} />
              <RiskSection analysis={analysis} isLoading={isLoading} />
            </div>
            {analysis?.recommendations && analysis.recommendations.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {analysis.recommendations.map((rec, i) => (
                  <RecommendationCard key={i} recommendation={rec} />
                ))}
              </div>
            )}
          </div>
        )}
        {currentView === 'robots' && <RobotsView data={data} bots={bots} setBots={setBots} exchanges={exchanges} formatCurrency={formatCurrency} t={t} />}
        {currentView === 'assets' && <AssetFactoryView data={data} setData={setData} exchanges={exchanges} t={t} />}
        {currentView === 'monitoring' && <BotMonitoringView
          t={t}
          formatCurrency={formatCurrency}
          bots={bots}
          trades={tradeHistory}
          equityData={equityHistory}
          cashAvailable={exchanges.reduce((acc, ex) => acc + (ex.status === 'CONNECTED' ? (ex.balance || 0) : 0), 0)}
          onToggleBot={(id, newStatus) => setBots(prev => prev.map(b => b.id === id ? { ...b, status: newStatus } : b))}
          onClearHistory={() => setTradeHistory([])}
        />}
        {currentView === 'settings' && <SettingsView data={data} setData={setData} exchanges={exchanges} setExchanges={setExchanges} tradingAuthority={tradingAuthority} setTradingAuthority={setTradingAuthority} language={language} setLanguage={setLanguage} t={t} onFetchBalance={fetchBalanceForExchange} onTradeExecuted={(trade) => setTradeHistory(prev => [trade, ...prev])} />}
      </main>
    </div>
  );
};

const TradingViewWidget: React.FC<{ symbol: string; signals?: { type: 'BUY' | 'SELL'; price: number; time: string }[] }> = ({ symbol, signals }) => {
  const container = useRef<HTMLDivElement>(null);
  const widgetId = "tradingview_institutional_" + Math.random().toString(36).substring(7);

  useEffect(() => {
    let script: HTMLScriptElement | null = document.getElementById('tradingview-widget-script') as HTMLScriptElement;

    const initWidget = () => {
      if (container.current && (window as any).TradingView) {
        new (window as any).TradingView.widget({
          autosize: true,
          symbol: `BINANCE:${symbol}USDT`,
          interval: "60",
          timezone: "Etc/UTC",
          theme: "dark",
          style: "1",
          locale: "en",
          toolbar_bg: "#0f172a",
          enable_publishing: false,
          hide_side_toolbar: false,
          allow_symbol_change: true,
          container_id: container.current.id,
          studies: [
            "MASimple@tv-basicstudies",
            "RSI@tv-basicstudies",
            "MACD@tv-basicstudies"
          ],
          loading_screen: { backgroundColor: "#020617" }
        });
      }
    };

    if (!script) {
      script = document.createElement('script');
      script.id = 'tradingview-widget-script';
      script.src = 'https://s3.tradingview.com/tv.js';
      script.type = 'text/javascript';
      script.async = true;
      script.onload = initWidget;
      document.head.appendChild(script);
    } else {
      initWidget();
    }
  }, [symbol]);

  return (
    <div className="w-full h-full bg-slate-950">
      <div
        id={widgetId}
        ref={container}
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
};

const SignalOverlay: React.FC<{ signals: { type: 'BUY' | 'SELL'; price: number | string; time: string; asset: string }[] }> = ({ signals }) => (
  <div className="absolute top-20 right-8 space-y-3 z-10 pointer-events-none max-h-[60%] overflow-hidden">
    {signals && signals.slice(0, 5).map((sig, i) => (
      <div key={i} className="flex items-center gap-3 bg-slate-900/90 backdrop-blur-md border border-slate-700/50 p-3 rounded-2xl animate-in slide-in-from-right-4 duration-500 shadow-xl border-l-4" style={{ borderLeftColor: sig.type === 'BUY' ? '#10b981' : '#f43f5e' }}>
        <div className={`w-3 h-3 rounded-full shrink-0 shadow-[0_0_10px_rgba(0,0,0,0.5)] ${sig.type === 'BUY' ? 'bg-emerald-500 shadow-emerald-500/50' : 'bg-rose-500 shadow-rose-500/50'}`} />
        <div className="flex flex-col min-w-[120px]">
          <div className="flex justify-between items-center mb-0.5">
            <span className={`text-[10px] font-black tracking-tighter ${sig.type === 'BUY' ? 'text-emerald-400' : 'text-rose-400'}`}>
              {sig.type} SIGNAL
            </span>
            <span className="text-[9px] text-slate-300 font-bold">{sig.asset || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-end">
            <span className="text-xs font-mono text-cyan-400 font-bold">${typeof sig.price === 'number' ? sig.price.toLocaleString() : (sig.price || '0')}</span>
            <span className="text-[8px] text-slate-500 font-mono tracking-tighter">{sig.time || '--:--'}</span>
          </div>
        </div>
      </div>
    ))}
  </div>
);

const ChartsView: React.FC<{ t: (k: any) => string; trades: Trade[] }> = ({ t, trades }) => {
  const chartTrades = trades.filter(t => t.asset.includes('BTC')).map(tr => ({
    type: tr.type,
    price: tr.price,
    time: tr.timestamp,
    asset: tr.asset
  }));

  return (
    <div className="h-[calc(100vh-220px)] w-full bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in duration-500 flex flex-col relative">
      <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50 shrink-0">
        <h3 className="font-bold flex items-center gap-2 text-cyan-400">
          <TrendingUp className="w-5 h-5" /> {t('tv_chart')} - Institutional Terminal
        </h3>
        <div className="flex items-center gap-4">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest hidden md:inline">Full Matrix Intelligence</span>
          <div className="px-2 py-1 bg-cyan-500/10 rounded border border-cyan-500/20 text-[9px] font-bold text-cyan-400">LIVE FEED</div>
        </div>
      </div>
      <div className="flex-1 w-full bg-slate-950 relative overflow-hidden">
        <TradingViewWidget symbol="BTC" />
        <SignalOverlay signals={chartTrades} />
      </div>
    </div>
  );
};

const NavBtn: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
  <button onClick={onClick} className={`flex items-center gap-3 w-full p-3 rounded-lg transition-all group ${active ? 'bg-slate-800 text-cyan-400 shadow-lg' : 'hover:bg-slate-800/50 text-slate-400 hover:text-slate-300'}`}>
    {React.cloneElement(icon as React.ReactElement, { className: `w-5 h-5 transition-transform ${active ? 'scale-110' : 'group-hover:scale-110'}` })}
    <span className="font-semibold text-sm tracking-wide">{label}</span>
    {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />}
  </button>
);


const SettingsView: React.FC<{
  data: SystemData;
  setData: React.Dispatch<React.SetStateAction<SystemData>>;
  exchanges: ExchangeConfig[];
  setExchanges: React.Dispatch<React.SetStateAction<ExchangeConfig[]>>;
  tradingAuthority: 'AI' | 'HYBRID';
  setTradingAuthority: (v: 'AI' | 'HYBRID') => void;
  language: 'en' | 'pt';
  setLanguage: (l: 'en' | 'pt') => void;
  t: (key: any) => string;
  onFetchBalance: (exId: string, apiKey: string, secret: string) => void;
  onTradeExecuted: (trade: any) => void;
}> = ({ data, setData, exchanges, setExchanges, tradingAuthority, setTradingAuthority, language, setLanguage, t, onFetchBalance, onTradeExecuted }) => {
  const [activeTab, setActiveTab] = useState<'exchanges' | 'ai' | 'execution'>('exchanges');
  const [isAddingExchange, setIsAddingExchange] = useState(false);
  const [newExchangeName, setNewExchangeName] = useState('');

  // Local buffer for AI keys â€” only committed to global state on Save
  const [aiKeys, setAiKeys] = useState({
    geminiKey: data.neural_core.geminiKey || '',
    deepseekKey: data.neural_core.deepseekKey || '',
    openaiKey: data.neural_core.openaiKey || '',
    anthropicKey: data.neural_core.anthropicKey || '',
  });
  const [aiKeySaved, setAiKeySaved] = useState(false);

  const handleSaveAiKeys = () => {
    setData(prev => ({
      ...prev,
      neural_core: {
        ...prev.neural_core,
        geminiKey: aiKeys.geminiKey.trim(),
        deepseekKey: aiKeys.deepseekKey.trim(),
        openaiKey: aiKeys.openaiKey.trim(),
        anthropicKey: aiKeys.anthropicKey.trim(),
      }
    }));
    setAiKeySaved(true);
    setTimeout(() => setAiKeySaved(false), 3000);
  };

  const handleAddExchange = () => {
    if (!newExchangeName.trim()) return;
    const newId = newExchangeName.toLowerCase().replace(/\s+/g, '-');
    if (exchanges.find(ex => ex.id === newId)) {
      alert('Exchange already exists');
      return;
    }
    const newExchange: ExchangeConfig = {
      id: newId,
      name: newExchangeName,
      status: 'DISCONNECTED',
      lastSync: 'N/A',
      balance: 0,
      apiKey: '',
      apiSecret: ''
    };
    setExchanges([...exchanges, newExchange]);
    setNewExchangeName('');
    setIsAddingExchange(false);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex bg-slate-900/50 p-6 rounded-2xl border border-slate-800 items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-xl"><Globe className="w-6 h-6 text-cyan-400" /></div>
          <div>
            <h3 className="font-bold">{t('lang_sel')}</h3>
            <p className="text-xs text-slate-500">{language === 'pt' ? 'PortuguÃªs selecionado' : 'English selected'}</p>
          </div>
        </div>
        <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
          <button onClick={() => setLanguage('pt')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${language === 'pt' ? 'bg-cyan-600 text-white' : 'text-slate-500'}`}>PT-BR</button>
          <button onClick={() => setLanguage('en')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${language === 'en' ? 'bg-cyan-600 text-white' : 'text-slate-500'}`}>EN-US</button>
        </div>
      </div>

      <div className="flex border-b border-slate-800 gap-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
        <TabBtn label={t('nav_settings')} active={activeTab === 'exchanges'} onClick={() => setActiveTab('exchanges')} icon={<Link className="w-4 h-4" />} />
        <TabBtn label="AI Core" active={activeTab === 'ai'} onClick={() => setActiveTab('ai')} icon={<BrainCircuit className="w-4 h-4" />} />
        <TabBtn label="Execution" active={activeTab === 'execution'} onClick={() => setActiveTab('execution')} icon={<Server className="w-4 h-4" />} />
      </div>

      {activeTab === 'exchanges' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {exchanges.map(ex => (
            <ExchangeCard
              key={ex.id}
              name={ex.name}
              status={ex.status}
              lastSync={ex.lastSync}
              balance={ex.balance}
              apiKey={ex.apiKey}
              apiSecret={ex.apiSecret}
              onClear={() => {
                setExchanges(exchanges.map(e =>
                  e.id === ex.id ? { ...e, status: 'DISCONNECTED', apiKey: '', apiSecret: '', lastSync: 'N/A', balance: 0 } : e
                ));
              }}
              onUpdate={(key, secret) => {
                // Mark as CONNECTED immediately
                setExchanges(exchanges.map(e =>
                  e.id === ex.id ? { ...e, status: 'CONNECTED', apiKey: key, apiSecret: secret, lastSync: 'Just now' } : e
                ));
                // ðŸ”§ FIX: Fetch real balance right after saving credentials
                onFetchBalance(ex.id, key, secret);
              }}
              t={t}
            />
          ))}
          {isAddingExchange ? (
            <div className="bg-slate-900 border-2 border-cyan-500/30 rounded-2xl p-8 space-y-4 animate-in zoom-in duration-300">
              <div className="flex items-center gap-3 mb-2">
                <Zap className="w-5 h-5 text-cyan-400" />
                <h4 className="font-bold">New Connection</h4>
              </div>
              <input
                type="text"
                autoFocus
                value={newExchangeName}
                onChange={(e) => setNewExchangeName(e.target.value)}
                placeholder="Exchange Name (e.g. Coinbase)"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-sm font-bold text-slate-100 outline-none focus:border-cyan-500"
                onKeyDown={(e) => e.key === 'Enter' && handleAddExchange()}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleAddExchange}
                  className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-all"
                >
                  Create
                </button>
                <button
                  onClick={() => setIsAddingExchange(false)}
                  className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-400 text-xs font-bold rounded-lg transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => setIsAddingExchange(true)}
              className="border-2 border-dashed border-slate-800 rounded-2xl flex flex-col items-center justify-center p-8 hover:border-slate-700 transition-colors cursor-pointer group"
            >
              <Plus className="w-8 h-8 text-slate-700 mb-2 group-hover:text-cyan-400" />
              <p className="text-sm font-bold text-slate-600 group-hover:text-slate-400">Connect Provider</p>
            </div>
          )}
        </div>
      )}

      {activeTab === 'ai' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-4xl space-y-8 shadow-2xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/10 rounded-2xl">
              <BrainCircuit className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold tracking-tight">{t('ai_core')}</h3>
              <p className="text-sm text-slate-500 font-medium">{t('neural_core_desc')}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('ai_provider')}</label>
                <div className="flex bg-slate-950 border border-slate-800 p-1.5 rounded-2xl shadow-inner gap-1 overflow-x-auto scrollbar-hide">
                  <button
                    onClick={() => setData(prev => ({ ...prev, neural_core: { ...prev.neural_core, provider: 'GEMINI' } }))}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all whitespace-nowrap ${data.neural_core.provider === 'GEMINI' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {t('prov_gemini')}
                  </button>
                  <button
                    onClick={() => setData(prev => ({ ...prev, neural_core: { ...prev.neural_core, provider: 'DEEPSEEK' } }))}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all whitespace-nowrap ${data.neural_core.provider === 'DEEPSEEK' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {t('prov_deepseek')}
                  </button>
                  <button
                    onClick={() => setData(prev => ({ ...prev, neural_core: { ...prev.neural_core, provider: 'OPENAI' } }))}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all whitespace-nowrap ${data.neural_core.provider === 'OPENAI' ? 'bg-emerald-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {t('prov_openai')}
                  </button>
                  <button
                    onClick={() => setData(prev => ({ ...prev, neural_core: { ...prev.neural_core, provider: 'ANTHROPIC' } }))}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all whitespace-nowrap ${data.neural_core.provider === 'ANTHROPIC' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {t('prov_anthropic')}
                  </button>
                  <button
                    onClick={() => setData(prev => ({ ...prev, neural_core: { ...prev.neural_core, provider: 'MOCK' } }))}
                    className={`flex-1 py-3 px-4 rounded-xl font-bold text-[10px] uppercase tracking-wider transition-all whitespace-nowrap ${data.neural_core.provider === 'MOCK' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    MOCK (FREE)
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('ai_model_sel')}</label>
                <select
                  disabled={data.neural_core.provider === 'MOCK'}
                  value={
                    data.neural_core.provider === 'GEMINI' ? data.neural_core.gemini_model :
                      data.neural_core.provider === 'DEEPSEEK' ? data.neural_core.deepseek_model :
                        data.neural_core.provider === 'OPENAI' ? 'gpt-4o' :
                          data.neural_core.provider === 'ANTHROPIC' ? 'claude-3-5-sonnet' :
                            'mock-neural'
                  }
                  onChange={(e) => {
                    const val = e.target.value;
                    if (data.neural_core.provider === 'GEMINI') {
                      setData({ ...data, neural_core: { ...data.neural_core, gemini_model: val } });
                    } else if (data.neural_core.provider === 'DEEPSEEK') {
                      setData({ ...data, neural_core: { ...data.neural_core, deepseek_model: val as any } });
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 outline-none focus:border-blue-500/50 disabled:opacity-50"
                >
                  {data.neural_core.provider === 'GEMINI' ? (
                    <>
                      <option value="gemini-2.0-flash">Gemini 2.0 Flash (Fastest)</option>
                      <option value="gemini-2.0-pro-exp-02-05">Gemini 2.0 Pro Experimental</option>
                      <option value="gemini-1.5-pro">Gemini 1.5 Pro (Deep Analysis)</option>
                    </>
                  ) : data.neural_core.provider === 'DEEPSEEK' ? (
                    <>
                      <option value="deepseek-chat">deepseek-chat (V3)</option>
                      <option value="deepseek-reasoner">deepseek-reasoner (R1)</option>
                    </>
                  ) : data.neural_core.provider === 'OPENAI' ? (
                    <>
                      <option value="gpt-4o">GPT-4o (Real-time)</option>
                      <option value="o1-preview">o1-preview (Reasoning)</option>
                    </>
                  ) : data.neural_core.provider === 'ANTHROPIC' ? (
                    <>
                      <option value="claude-3-5-sonnet">Claude 3.5 Sonnet</option>
                      <option value="claude-3-opus">Claude 3 Opus</option>
                    </>
                  ) : (
                    <option value="mock-neural">Neural Core Mock (Stable)</option>
                  )}
                </select>
              </div>

              {data.neural_core.provider !== 'MOCK' && (
                <div className="space-y-4 pt-2">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Google Gemini API Key</label>
                    <input
                      type="password"
                      value={aiKeys.geminiKey}
                      onChange={(e) => setAiKeys(prev => ({ ...prev, geminiKey: e.target.value }))}
                      placeholder="Enter Gemini API Key..."
                      className={`w-full bg-slate-950 border rounded-lg p-3 mono outline-none transition-all ${data.neural_core.provider === 'GEMINI' ? 'border-cyan-500/50 text-cyan-400' : 'border-slate-800 text-slate-500 opacity-50'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">DeepSeek API Key</label>
                    <input
                      type="password"
                      value={aiKeys.deepseekKey}
                      onChange={(e) => setAiKeys(prev => ({ ...prev, deepseekKey: e.target.value }))}
                      placeholder="Enter DeepSeek API Key..."
                      className={`w-full bg-slate-950 border rounded-lg p-3 mono outline-none transition-all ${data.neural_core.provider === 'DEEPSEEK' ? 'border-blue-500/50 text-blue-400' : 'border-slate-800 text-slate-500 opacity-50'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">OpenAI (GPT-4) API Key</label>
                    <input
                      type="password"
                      value={aiKeys.openaiKey}
                      onChange={(e) => setAiKeys(prev => ({ ...prev, openaiKey: e.target.value }))}
                      placeholder="Enter OpenAI API Key..."
                      className={`w-full bg-slate-950 border rounded-lg p-3 mono outline-none transition-all ${data.neural_core.provider === 'OPENAI' ? 'border-emerald-500/50 text-emerald-400' : 'border-slate-800 text-slate-500 opacity-50'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Anthropic (Claude) API Key</label>
                    <input
                      type="password"
                      value={aiKeys.anthropicKey}
                      onChange={(e) => setAiKeys(prev => ({ ...prev, anthropicKey: e.target.value }))}
                      placeholder="Enter Anthropic API Key..."
                      className={`w-full bg-slate-950 border rounded-lg p-3 mono outline-none transition-all ${data.neural_core.provider === 'ANTHROPIC' ? 'border-indigo-500/50 text-indigo-400' : 'border-slate-800 text-slate-500 opacity-50'}`}
                    />
                  </div>
                </div>
              )}
              {data.neural_core.provider === 'MOCK' && (
                <div className="p-4 bg-purple-500/10 border border-purple-500/20 rounded-xl text-purple-400 text-xs font-bold flex items-center gap-3">
                  <div className="p-2 bg-purple-500/20 rounded-lg">
                    <Info className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="uppercase tracking-wider">Modo Simulado Ativo</p>
                    <p className="text-[10px] font-medium opacity-70">Nenhuma credencial Ã© necessÃ¡ria para usar o Neural Core neste modo.</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('ai_temperature')}</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="1"
                    value={data.neural_core.temperature}
                    onChange={(e) => setData({ ...data, neural_core: { ...data.neural_core, temperature: parseFloat(e.target.value) } })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 outline-none focus:border-blue-500/50"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('ai_max_tokens')}</label>
                  <input
                    type="number"
                    step="100"
                    value={data.neural_core.max_tokens}
                    onChange={(e) => setData({ ...data, neural_core: { ...data.neural_core, max_tokens: parseInt(e.target.value) } })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-slate-200 outline-none focus:border-blue-500/50"
                  />
                </div>
              </div>

              <div className="space-y-4">
                <ToggleRow label="Dynamic Vision Scanning" active={true} />
                <ToggleRow label="Context Ensemble Analysis" active={true} />
                <div className="p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                  <p className="text-[10px] text-blue-400 font-bold uppercase mb-2 tracking-widest">{t('ai_conf_threshold')}</p>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="0.1"
                      max="0.95"
                      step="0.05"
                      value={data.neural_core.confidence_threshold}
                      onChange={(e) => setData({ ...data, neural_core: { ...data.neural_core, confidence_threshold: parseFloat(e.target.value) } })}
                      className="flex-1 accent-blue-500"
                    />
                    <span className="text-xs font-bold text-slate-300 mono">{(data.neural_core.confidence_threshold * 100).toFixed(0)}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="pt-6 border-t border-slate-800 flex items-center justify-between gap-4">
            {aiKeySaved && (
              <div className="flex items-center gap-2 text-emerald-400 text-xs font-bold animate-in fade-in duration-300">
                <CheckCircle2 className="w-4 h-4" />
                {language === 'pt' ? 'Chaves salvas com sucesso!' : 'Keys saved successfully!'}
              </div>
            )}
            {!aiKeySaved && <div />}
            <button
              onClick={handleSaveAiKeys}
              className="px-10 py-4 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-600 hover:to-indigo-700 text-white font-bold rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-blue-900/30"
            >
              <Save className="w-5 h-5" /> {t('save_changes')}
            </button>
          </div>
        </div>
      )}

      {activeTab === 'execution' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 max-w-3xl space-y-8 shadow-2xl">
          {/* â”â”â” Manual Trade Panel â”â”â” */}
          <ManualTradePanel
            exchanges={exchanges}
            onTradeExecuted={onTradeExecuted}
          />
        </div>
      )}



    </div>
  );
};


const ManualTradePanel: React.FC<{ exchanges: any[], onTradeExecuted?: (trade: any) => void }> = ({ exchanges, onTradeExecuted }) => {
  const [mtSymbol, setMtSymbol] = useState('LOBOUSDT');
  const [mtQty, setMtQty] = useState('10');
  const [mtExchange, setMtExchange] = useState(() => exchanges.find(e => e.apiKey)?.id ?? exchanges[0]?.id ?? '');
  const [mtResult, setMtResult] = useState<any>(null);
  const [mtLoading, setMtLoading] = useState(false);
  const [mtError, setMtError] = useState<string | null>(null);

  const connectedEx = exchanges.find(e => e.id === mtExchange);

  const executeTrade = async (side: 'BUY' | 'SELL') => {
    setMtLoading(true);
    setMtResult(null);
    setMtError(null);
    try {
      const res = await fetch('/api/manual-trade', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: mtSymbol.toUpperCase().includes('USDT') ? mtSymbol.toUpperCase() : mtSymbol.toUpperCase() + 'USDT',
          side,
          quoteQty: Number(mtQty),
          apiKey: connectedEx?.apiKey ?? '',
          secret: connectedEx?.apiSecret ?? '',
          paperTrade: false,
          marketMode: 'SPOT'
        })
      });

      // Read response text first to avoid "Unexpected end of JSON input"
      const text = await res.text();
      if (!text || text.trim() === '') {
        throw new Error(`Servidor retornou resposta vazia (status ${res.status}). Verifique se o backend estÃ¡ a correr.`);
      }
      let data: any;
      try {
        data = JSON.parse(text);
      } catch {
        throw new Error(`Resposta invÃ¡lida do servidor: ${text.slice(0, 200)}`);
      }

      if (data.success) {
        const orderData = { ...data.order, side };
        setMtResult(orderData);
        // Add to history
        if (onTradeExecuted) {
          onTradeExecuted({
            id: orderData.orderId || Math.random().toString(36).substring(7),
            botId: 'MANUAL',
            asset: mtSymbol.toUpperCase().includes('USDT') ? mtSymbol.toUpperCase() : mtSymbol.toUpperCase() + 'USDT',
            type: side,
            amount: Number(orderData.qty) || Number(mtQty) / Number(orderData.price),
            price: Number(orderData.price),
            timestamp: Date.now(),
            pnl: 0,
            status: 'COMPLETED',
            exchangeId: connectedEx?.id
          });
        }
      } else {
        setMtError(typeof data.error === 'string' ? data.error : (data.error?.msg ?? JSON.stringify(data.error)));
      }
    } catch (e: any) {
      setMtError(e.message);
    } finally {
      setMtLoading(false);
    }
  };

  return (
    <div className="mt-8 pt-8 border-t border-slate-800 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2.5 bg-cyan-500/10 rounded-xl">
          <Zap className="w-5 h-5 text-cyan-400" />
        </div>
        <div>
          <h4 className="font-bold text-sm">Quick Manual Trade</h4>
          <p className="text-[10px] text-slate-500">Teste compra/venda directa na corretora (Modo Real)</p>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Corretora</label>
          <select value={mtExchange} onChange={e => setMtExchange(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-bold text-slate-200 outline-none">
            {exchanges.map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
            {exchanges.length === 0 && <option value="">Nenhuma configurada</option>}
          </select>
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Par (sÃ­mbolo)</label>
          <input type="text" value={mtSymbol} onChange={e => setMtSymbol(e.target.value)} placeholder="ex: LOBOUSDT" className="w-full bg-slate-950 border border-cyan-500/30 rounded-lg p-2.5 text-xs font-bold text-cyan-400 outline-none focus:border-cyan-500 mono uppercase" />
        </div>
        <div className="space-y-1">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Valor (USDT)</label>
          <input type="number" value={mtQty} onChange={e => setMtQty(e.target.value)} min="1" step="1" className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-bold text-slate-200 outline-none" />
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => executeTrade('BUY')} disabled={mtLoading || (!connectedEx?.apiKey)} className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/30">
          {mtLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4" />}
          COMPRAR {mtSymbol.replace('USDT', '').toUpperCase()}
        </button>
        <button onClick={() => executeTrade('SELL')} disabled={mtLoading || (!connectedEx?.apiKey)} className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-600 text-white font-black text-sm rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-900/30">
          {mtLoading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <TrendingUp className="w-4 h-4 rotate-180" />}
          VENDER {mtSymbol.replace('USDT', '').toUpperCase()}
        </button>
      </div>

      {mtResult && (
        <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl animate-in fade-in duration-300 space-y-1">
          <p className="text-xs font-black text-emerald-400 flex items-center gap-2"><CheckCircle2 className="w-4 h-4" /> Ordem executada!</p>
          <div className="grid grid-cols-2 gap-2 mt-2">
            <div className="text-[10px] text-slate-400">ID: <span className="text-slate-200 font-bold mono">{mtResult.orderId}</span></div>
            <div className="text-[10px] text-slate-400">Status: <span className="text-emerald-400 font-bold">{mtResult.status}</span></div>
            <div className="text-[10px] text-slate-400">PreÃ§o: <span className="text-cyan-400 font-bold mono">${Number(mtResult.price).toFixed(6)}</span></div>
            <div className="text-[10px] text-slate-400">Qty: <span className="text-slate-200 font-bold mono">{Number(mtResult.qty).toFixed(4)}</span></div>
          </div>
        </div>
      )}

      {mtError && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 rounded-xl animate-in fade-in duration-300">
          <p className="text-xs font-bold text-rose-400 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Erro: {mtError}</p>
        </div>
      )}
    </div>
  );
};

const TabBtn: React.FC<{ label: string; active: boolean; onClick: () => void; icon: React.ReactNode }> = ({ label, active, onClick, icon }) => (
  <button onClick={onClick} className={`pb-4 flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-all ${active ? 'border-b-2 border-cyan-500 text-cyan-400' : 'text-slate-500 hover:text-slate-300'}`}>
    {icon} {label}
  </button>
);

const ExchangeCard: React.FC<{ name: string; status: string; lastSync: string; balance: number; apiKey: string; apiSecret: string; onClear: () => void; onUpdate: (key: string, secret: string) => void; t: (k: any) => string }> = ({ name, status, lastSync, balance, apiKey, apiSecret, onClear, onUpdate, t }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempKey, setTempKey] = useState(apiKey);
  const [tempSecret, setTempSecret] = useState(apiSecret);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    if (!isEditing) {
      setTempKey(apiKey);
      setTempSecret(apiSecret);
    }
  }, [apiKey, apiSecret, isEditing]);

  const handleSave = () => {
    setSaveError(null);
    if (!tempKey.trim() || !tempSecret.trim()) {
      setSaveError(t('conn_error'));
      return;
    }
    setIsEditing(false);
    setIsSyncing(true);

    // Simulate institutional sync delay
    setTimeout(() => {
      onUpdate(tempKey.trim(), tempSecret.trim());
      setIsSyncing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 1500);
  };

  const maskedValue = (val: string) => {
    if (!val) return '';
    if (val.length < 8) return '••••••••';
    return val.substring(0, 4) + '••••' + val.substring(val.length - 4);
  };

  return (
    <div className={`bg-slate-900 border rounded-2xl p-6 space-y-4 transition-all ${saveSuccess ? 'border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)]' :
      status === 'CONNECTED' ? 'border-emerald-500/20 hover:border-emerald-500/40' :
        'border-slate-800 hover:border-slate-700'
      }`}>
      <div className="flex justify-between items-start">
        <div>
          <h4 className="font-bold text-lg">{name}</h4>
          <p className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">Latency Sync: {lastSync}</p>
        </div>
        <div className="text-right">
          <div className={`px-2 py-1 rounded-md text-[9px] font-bold tracking-widest flex items-center justify-end gap-1.5 ${status === 'CONNECTED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${status === 'CONNECTED' ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
            {status}
          </div>
          {status === 'CONNECTED' && (
            <p className="text-xs font-bold text-emerald-400 mt-2 mono">${balance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
          )}
        </div>
      </div>

      {isSyncing && (
        <div className="flex items-center gap-2 p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg animate-pulse">
          <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />
          <span className="text-[10px] font-bold text-cyan-400 uppercase tracking-widest">Synchronizing Balance...</span>
        </div>
      )}

      {saveSuccess && (
        <div className="flex items-center gap-2 p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg animate-in fade-in zoom-in duration-300">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">{t('conn_success')}</span>
        </div>
      )}

      <div className="space-y-3">
        <div>
          <label className="text-[10px] font-bold text-slate-500 uppercase">{t('api_key')}</label>
          {isEditing ? (
            <input
              type="text"
              value={tempKey}
              onChange={(e) => { setTempKey(e.target.value); setSaveError(null); }}
              className="w-full bg-slate-950 border border-cyan-500/50 rounded-lg p-2.5 text-xs mono text-cyan-100 outline-none shadow-[0_0_10px_rgba(6,182,212,0.1)]"
              placeholder="Enter API Key"
            />
          ) : (
            <div className="relative group/input">
              <input
                type="text"
                value={apiKey ? maskedValue(apiKey) : ''}
                placeholder={apiKey ? '' : 'No Key Set'}
                readOnly
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs mono text-slate-400 outline-none placeholder:text-slate-600"
              />
              {apiKey && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] text-slate-600 font-bold uppercase tracking-widest opacity-0 group-hover/input:opacity-100 transition-opacity">
                  Masked
                </div>
              )}
            </div>
          )}
        </div>

        <div className={isEditing ? "animate-in fade-in slide-in-from-top-2" : ""}>
          <label className="text-[10px] font-bold text-slate-500 uppercase">{t('api_secret')}</label>
          {isEditing ? (
            <input
              type="password"
              value={tempSecret}
              onChange={(e) => { setTempSecret(e.target.value); setSaveError(null); }}
              className="w-full bg-slate-950 border border-cyan-500/50 rounded-lg p-2.5 text-xs mono text-cyan-100 outline-none shadow-[0_0_10px_rgba(6,182,212,0.1)]"
              placeholder="Enter API Secret"
            />
          ) : (
            <div className="relative group/input">
              <input
                type="text"
                value={apiSecret ? maskedValue(apiSecret) : ''}
                placeholder={apiSecret ? '' : 'No Secret Set'}
                readOnly
                className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs mono text-slate-400 outline-none placeholder:text-slate-600"
              />
              {apiSecret && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[8px] text-slate-600 font-bold uppercase tracking-widest opacity-0 group-hover/input:opacity-100 transition-opacity">
                  Masked
                </div>
              )}
            </div>
          )}
        </div>

        {saveError && (
          <div className="flex items-center gap-2 p-2 bg-rose-500/10 border border-rose-500/20 rounded-lg animate-in fade-in duration-200">
            <AlertTriangle className="w-3 h-3 text-rose-400 shrink-0" />
            <span className="text-[10px] font-bold text-rose-400">{saveError}</span>
          </div>
        )}

        <div className="flex gap-4">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 flex items-center gap-1 uppercase tracking-widest">
                <Check className="w-3 h-3" /> {t('save')}
              </button>
              <button onClick={() => { setIsEditing(false); setTempKey(apiKey); setTempSecret(apiSecret); setSaveError(null); }} className="text-[10px] font-bold text-slate-500 hover:text-slate-400 flex items-center gap-1 uppercase tracking-widest">
                <X className="w-3 h-3" /> {t('cancel')}
              </button>
            </>
          ) : (
            <>
              <button onClick={() => setIsEditing(true)} className="text-[10px] font-bold text-cyan-500 hover:text-cyan-400 flex items-center gap-1 uppercase tracking-widest">
                Update credentials <ChevronRight className="w-3 h-3" />
              </button>
              {status === 'CONNECTED' && (
                <button onClick={onClear} className="text-[10px] font-bold text-rose-500 hover:text-rose-400 flex items-center gap-1 uppercase tracking-widest">
                  Clear keys <ZapOff className="w-3 h-3" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

const SettingField: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="space-y-1">
    <label className="text-[9px] font-bold text-slate-500 uppercase tracking-widest pl-1">{label}</label>
    <div className="bg-slate-950/80 border-l-2 border-l-cyan-500 rounded-r-lg p-3 mono font-bold text-cyan-400 shadow-[0_4px_10px_rgba(0,0,0,0.2)]">{value}</div>
  </div>
);

const ProviderBtn: React.FC<{ active: boolean; onClick: () => void; label: string }> = ({ active, onClick, label }) => (
  <button
    onClick={onClick}
    className={`px-3 py-2 rounded-xl text-[10px] font-bold transition-all border ${active
      ? 'bg-cyan-600 border-cyan-500 text-white shadow-lg shadow-cyan-900/40'
      : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700 hover:text-slate-300'
      }`}
  >
    {label}
  </button>
);

const ToggleRow: React.FC<{ label: string; active: boolean; onClick?: () => void }> = ({ label, active, onClick }) => (
  <div
    onClick={onClick}
    className={`flex items-center justify-between p-4 bg-slate-950/50 backdrop-blur-sm rounded-xl border transition-all group cursor-pointer ${active ? 'border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]' : 'border-slate-800 hover:border-slate-700'} ${onClick ? '' : 'pointer-events-none'}`}
  >
    <span className={`text-sm font-bold transition-colors ${active ? 'text-cyan-100' : 'text-slate-400 group-hover:text-slate-300'}`}>{label}</span>
    <div className={`w-12 h-6 rounded-full relative transition-all shadow-inner ${active ? 'bg-cyan-900/50' : 'bg-slate-900'}`}>
      <div className={`absolute top-1 w-4 h-4 rounded-full shadow-lg transition-all ${active ? 'right-1 bg-cyan-400 shadow-cyan-500/50' : 'left-1 bg-slate-600'}`} />
    </div>
  </div>
);

const StressCard: React.FC<{ label: string; value: string; color: string }> = ({ label, value, color }) => (
  <div className={`p-4 bg-${color}-500/5 border border-${color}-500/20 rounded-xl transition-all hover:scale-105`}>
    <p className="text-[10px] text-slate-500 font-bold uppercase mb-2 tracking-widest">{label}</p>
    <p className={`text-xl font-bold mono text-${color}-400`}>{value}</p>
  </div>
);

const MetricCard: React.FC<{ label: string; value: string; icon: React.ReactNode; trend: string; positive?: boolean }> = ({ label, value, icon, trend, positive }) => (
  <div className="bg-slate-900/50 p-6 rounded-2xl border border-slate-800 hover:border-cyan-500/20 transition-all hover:-translate-y-1 shadow-xl backdrop-blur-sm">
    <div className="flex justify-between items-start mb-4">
      <div className="p-2.5 bg-slate-800 rounded-xl shadow-inner">{React.cloneElement(icon as React.ReactElement, { className: "w-5 h-5" })}</div>
      <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${positive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'}`}>{trend}</span>
    </div>
    <div className="space-y-1">
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">{label}</p>
      <p className="text-2xl font-bold mono tracking-tight">{value}</p>
    </div>
  </div>
);

const RecommendationCard: React.FC<{ recommendation: Recommendation }> = ({ recommendation }) => {
  const isBuy = recommendation.action === 'COMPRA';
  const isHedge = recommendation.action === 'HEDGE';
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:shadow-2xl transition-all flex flex-col group border-l-4 border-l-transparent hover:border-l-cyan-500">
      <div className={`p-4 flex justify-between items-center ${isBuy ? 'bg-emerald-500/10' : isHedge ? 'bg-cyan-500/10' : 'bg-rose-500/10'}`}>
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg shadow-sm ${isBuy ? 'bg-emerald-500' : isHedge ? 'bg-cyan-500' : 'bg-rose-500'}`}><Activity className="w-5 h-5 text-slate-950" /></div>
          <div><h4 className="font-bold text-lg tracking-tight">{recommendation.asset} <span className="text-xs font-normal opacity-50">/ {recommendation.timeframe}</span></h4></div>
        </div>
        <div className="text-right">
          <p className="font-bold text-cyan-400 text-lg leading-none">{recommendation.confidence}%</p>
          <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Confidence</p>
        </div>
      </div>
      <div className="p-6 space-y-4 bg-slate-900/40">
        <div className="grid grid-cols-2 gap-4">
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <p className="text-[9px] text-slate-600 uppercase font-bold mb-1">Target Entry</p>
            <p className="text-sm font-bold mono">${recommendation.entry_main.toLocaleString()}</p>
          </div>
          <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
            <p className="text-[9px] text-slate-600 uppercase font-bold mb-1">Hard Stop</p>
            <p className="text-sm font-bold text-rose-500 mono">${recommendation.stop_loss.toLocaleString()}</p>
          </div>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-[10px] font-bold text-slate-500 uppercase">{recommendation.type} Operation</span>
          <button className="text-cyan-500 hover:text-cyan-400 font-bold text-xs flex items-center gap-1 group/btn transition-colors">Details <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" /></button>
        </div>
      </div>
    </div>
  );
};

const RiskSection: React.FC<{ analysis: AnalysisResponse | null; isLoading: boolean }> = ({ analysis, isLoading }) => (
  <section className="bg-slate-900/50 rounded-2xl border border-slate-800 p-6 backdrop-blur-sm shadow-xl">
    <h3 className="text-lg font-bold mb-5 flex items-center gap-2 tracking-tight"><AlertTriangle className="w-5 h-5 text-rose-500" /> Critical Warnings</h3>
    <div className="space-y-4">
      {analysis?.risk_alerts.map((alert, idx) => (
        <div key={idx} className={`p-4 rounded-xl border flex gap-4 transition-colors hover:bg-slate-800/30 ${alert.level === 'CRITICAL' || alert.severity === 'CRITICAL' ? 'bg-rose-500/10 border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.05)]' : 'bg-slate-800/50 border-slate-700'}`}>
          <AlertTriangle className={`w-5 h-5 shrink-0 mt-0.5 ${alert.level === 'CRITICAL' || alert.severity === 'CRITICAL' ? 'text-rose-500' : 'text-amber-500'}`} />
          <div className="space-y-1">
            <h4 className="font-bold text-sm leading-tight">{alert.message}</h4>
            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Action Required: {alert.action}</p>
          </div>
        </div>
      ))}
      {(!analysis || analysis.risk_alerts.length === 0) && (
        <div className="p-8 text-center text-slate-600 italic text-sm">No critical risk triggers detected.</div>
      )}
    </div>
  </section>
);

const ExecutiveSummary: React.FC<{ analysis: AnalysisResponse | null; isLoading: boolean }> = ({ analysis, isLoading }) => (
  <section className="bg-gradient-to-br from-slate-900 to-slate-950 rounded-2xl border border-slate-800 p-6 shadow-2xl relative overflow-hidden">
    <div className="absolute top-0 left-0 w-1 h-full bg-cyan-500/50" />
    <h3 className="text-lg font-bold mb-4 tracking-tight flex items-center gap-2">
      <FileText className="w-5 h-5 text-cyan-500" /> Strategic Executive Briefing
    </h3>
    <p className="text-sm leading-relaxed text-slate-400 italic font-medium">
      {analysis?.executive_summary || "Scanning institutional parameters and calculating probability density functions..."}
    </p>
  </section>
);

// --- Deployment Wizard Technical Core ---
type WizardState = {
  strategy: 'AGGRESSIVE' | 'SECURE' | 'SIMPLE_MA' | 'ZIGZAG_PRO' | 'MATRIX_SCALP' | 'MATRIX_NEURAL' | 'ROBO_IA' | 'ANATOMIA_FLUXO';
  exchangeId: string;
  assets: string[];
  leverage: number;
  stopLoss: number;
  takeProfit: number;
  riskPerTrade: number;
  isValid: boolean;
  error?: string;
  dryRunResult?: { winRate: number; expectedProfit: number };
  aiProvider: 'GEMINI' | 'DEEPSEEK' | 'OPENAI' | 'ANTHROPIC' | 'MOCK';
};

type WizardAction =
  | { type: 'SET_STRATEGY'; payload: WizardState['strategy'] }
  | { type: 'SET_EXCHANGE'; payload: string }
  | { type: 'SET_RISK'; field: keyof WizardState; value: number }
  | { type: 'ADD_ASSET'; payload: string }
  | { type: 'REMOVE_ASSET'; payload: string }
  | { type: 'VALIDATE' }
  | { type: 'RUN_DRY_BOOT' }
  | { type: 'SET_AI_PROVIDER'; payload: WizardState['aiProvider'] };

const initialWizardState: WizardState = {
  strategy: 'AGGRESSIVE',
  exchangeId: 'binance',
  assets: ['BTC', 'ETH'],
  leverage: 10,
  stopLoss: 0.5,
  takeProfit: 1.5,
  riskPerTrade: 1.0,
  isValid: true,
  aiProvider: 'GEMINI'
};

function wizardReducer(state: WizardState, action: WizardAction): WizardState {
  switch (action.type) {
    case 'SET_STRATEGY':
      const defaults = action.payload === 'SECURE' ? { leverage: 3, stopLoss: 1.0, takeProfit: 3.0 } :
        action.payload === 'AGGRESSIVE' ? { leverage: 10, stopLoss: 0.4, takeProfit: 0.8 } :
          action.payload === 'ZIGZAG_PRO' ? { leverage: 1, stopLoss: 2.0, takeProfit: 5.0 } :
            action.payload === 'MATRIX_SCALP' ? { leverage: 10, stopLoss: 0.3, takeProfit: 1.0 } :
              action.payload === 'MATRIX_NEURAL' ? { leverage: 5, stopLoss: 0.5, takeProfit: 1.5 } :
                action.payload === 'ROBO_IA' ? { leverage: 5, stopLoss: 0.5, takeProfit: 2.0 } :
                  action.payload === 'ANATOMIA_FLUXO' ? { leverage: 5, stopLoss: 2.0, takeProfit: 4.0 } :
                    { leverage: 1, stopLoss: 2.0, takeProfit: 5.0 };
      const aiProvider = (action.payload === 'MATRIX_SCALP' || action.payload === 'ROBO_IA') ? 'DEEPSEEK' : 'GEMINI';
      return { ...state, strategy: action.payload, ...defaults, aiProvider };
    case 'SET_EXCHANGE':
      return { ...state, exchangeId: action.payload };
    case 'SET_RISK':
      return { ...state, [action.field]: action.value };
    case 'ADD_ASSET':
      if (state.assets.includes(action.payload.toUpperCase())) return state;
      return { ...state, assets: [...state.assets, action.payload.toUpperCase()] };
    case 'REMOVE_ASSET':
      return { ...state, assets: state.assets.filter(a => a !== action.payload) };
    case 'VALIDATE':
      let error = undefined;
      if (state.leverage > 20 && state.strategy !== 'AGGRESSIVE') error = "High leverage only allowed in Aggressive mode.";
      if (state.stopLoss > 5) error = "Stop Loss too wide for institutional safety.";
      if (state.assets.length === 0) error = "At least one asset pair is required.";
      return { ...state, isValid: !error, error };
    case 'RUN_DRY_BOOT':
      // ... same logic ...
      const bias = state.strategy === 'SECURE' ? 0.05 : 0.02;
      return {
        ...state, dryRunResult: {
          winRate: 50 + (Math.random() * 15) + (bias * 100),
          expectedProfit: (state.riskPerTrade * state.leverage * 0.1)
        }
      };
    case 'SET_AI_PROVIDER':
      return { ...state, aiProvider: action.payload };
    default:
      return state;
  }
}

const LoadingState: React.FC = () => (
  <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-16 flex flex-col items-center justify-center text-center backdrop-blur-md">
    <div className="relative mb-8">
      <RefreshCw className="w-16 h-16 text-cyan-500 animate-spin opacity-20" />
      <div className="absolute inset-0 flex items-center justify-center">
        <Cpu className="w-8 h-8 text-cyan-400 animate-pulse" />
      </div>
    </div>
    <h4 className="text-2xl font-bold text-slate-200 tracking-tight">Syncing with Neural Core</h4>
    <p className="text-slate-500 max-w-sm mt-3 text-sm font-medium">Processing real-time order books, on-chain whale activity, and sentiment clusters.</p>
  </div>
);

const RobotsView: React.FC<{ data: SystemData; bots: TradingBot[]; setBots: React.Dispatch<React.SetStateAction<TradingBot[]>>; exchanges: ExchangeConfig[]; formatCurrency: (v: number) => string; t: (k: any) => string }> = ({ data, bots, setBots, exchanges, formatCurrency, t }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingBot, setEditingBot] = useState<TradingBot | null>(null);
  const [editDryRunResult, setEditDryRunResult] = useState<{ winRate: number; expectedProfit: number } | null>(null);
  const [newAsset, setNewAsset] = useState('');

  const [wizard, dispatch] = useReducer(wizardReducer, {
    ...initialWizardState,
    exchangeId: exchanges.filter(e => e.status === 'CONNECTED')[0]?.id || 'binance'
  });

  const selectedExchange = exchanges.find(e => e.id === wizard.exchangeId);

  useEffect(() => {
    dispatch({ type: 'VALIDATE' });
  }, [wizard.leverage, wizard.stopLoss, wizard.assets, wizard.strategy]);

  const strategyDefaults: Record<string, any> = {
    'AGGRESSIVE_SCALP': {
      leverage: 10, maxDailyLoss: 1, stopLossPct: 0.4, takeProfitPct: 0.8, maxTradesPerDay: 20, positionSizePct: 5.0,
      tradingHours: { start: '09:00', end: '17:00', use24h: true }, aiProvider: 'MOCK', marginMode: 'CROSS', marketMode: 'FUTURES', timeframe: 'AUTO',
      emaFast: 9, emaSlow: 21, emaTrend: 200, rsiLong: [30, 70], rsiShort: [30, 70], maxConsecutiveLosses: 3, tpPartial: 0.3, tpFinal: 0.8, stopLossRange: [0.2, 0.5], atrThreshold: 1.5
    },
    'CONSERVATIVE_TREND': {
      leverage: 3, maxDailyLoss: 1, stopLossPct: 1.0, takeProfitPct: 3.0, maxTradesPerDay: 5, positionSizePct: 2.0,
      tradingHours: { start: '09:00', end: '17:00', use24h: true }, aiProvider: 'MOCK', marginMode: 'CROSS', marketMode: 'SPOT', timeframe: 'AUTO',
      emaTrend: 200, emaFast: 20, emaSlow: 50, rsiRange: [40, 60], maxConsecutiveLosses: 2, rrRatio: 3.0, tpPartial: 1.5, atrThreshold: [1.0, 2.0], useEmaTrend: true, useEmaRejection: true, useStructureFilter: true, useRsiCheck: true
    },
    'SIMPLE_MA': {
      leverage: 1, maxDailyLoss: 1, stopLossPct: 2.0, takeProfitPct: 5.0, maxTradesPerDay: 10, positionSizePct: 3.0,
      tradingHours: { start: '09:00', end: '17:00', use24h: true }, aiProvider: 'MOCK', marginMode: 'CROSS', marketMode: 'SPOT', timeframe: 'AUTO',
      fastMa: 20, slowMa: 50, trendMa: 200, volMultiplier: 1.5, rsiRange: [30, 70], rsiPeriod: 14, capitalPerTrade: 100, maxOpenTrades: 3, tpRatios: [0.5, 1.0], emergencyStopPct: 5.0, cooldownTrades: 5, maxConsecutiveLosses: 3
    },
    'ZIGZAG_PRO': {
      leverage: 1, maxDailyLoss: 1, stopLossPct: 2.0, takeProfitPct: 5.0, maxTradesPerDay: 10, positionSizePct: 3.0,
      tradingHours: { start: '09:00', end: '17:00', use24h: true }, aiProvider: 'MOCK', marginMode: 'CROSS', marketMode: 'FUTURES', timeframe: 'AUTO',
      depth: 12, deviation: 5, backstep: 3, profitTarget: 5.0, stopLoss: 2.0
    },
    'MATRIX_SCALP': {
      leverage: 10, maxDailyLoss: 1, stopLossPct: 0.3, takeProfitPct: 1.0, maxTradesPerDay: 50, positionSizePct: 5.0,
      atrMultiplier: 1.5, tradingHours: { start: '09:00', end: '17:00', use24h: true }, aiProvider: 'DEEPSEEK', marginMode: 'ISOLATED', marketMode: 'FUTURES', timeframe: 'AUTO',
      trailingStop: { enabled: true, activation: 0.5, distance: 0.2 }
    },
    'MATRIX_NEURAL': {
      leverage: 5, maxDailyLoss: 1, stopLossPct: 0.5, takeProfitPct: 1.5, maxTradesPerDay: 10, positionSizePct: 3.0,
      minConfidence: 85, tradingHours: { start: '09:00', end: '17:00', use24h: true }, aiProvider: 'MOCK', marginMode: 'CROSS', marketMode: 'FUTURES', timeframe: 'AUTO'
    },
    'ANATOMIA_FLUXO': {
      leverage: 5, ema_curta: 21, ema_media: 50, ema_longa: 200, volume_profile_dias: 180, smi_periodo_acum: 20,
      smi_periodo_dist: 10, smi_threshold: 0.3, cvd_suavizacao: 14, bandas_desvio: 2, rsi_periodo: 14, rsi_sobrevendido: 30,
      rsi_sobrecomprado: 70, estocastico_k: 14, estocastico_d: 3, risco_por_operacao: 2, alavancagem_maxima: 20,
      trailing_stop_distancia: 1.5, max_ativos_simultaneos: 3, timeframes: { '1d': '1d', '4h': '4h', '1h': '1h', '15m': '15m' },
      marketMode: 'FUTURES'
    }
  };

  const handleAddAsset = () => {
    if (newAsset) {
      dispatch({ type: 'ADD_ASSET', payload: newAsset });
      setNewAsset('');
    }
  };

  const deployBot = () => {
    if (!wizard.isValid) return;

    const newBot: TradingBot = {
      id: Math.random().toString(36).substr(2, 9),
      name: `${wizard.strategy === 'AGGRESSIVE' ? t('bot_naming_agg') :
        wizard.strategy === 'SECURE' ? t('bot_naming_sec') :
          wizard.strategy === 'ZIGZAG_PRO' ? t('bot_naming_zz') :
            wizard.strategy === 'MATRIX_SCALP' ? t('bot_naming_matrix') :
              wizard.strategy === 'MATRIX_NEURAL' ? t('bot_naming_neural') :
                wizard.strategy === 'ANATOMIA_FLUXO' ? 'Robô Anatomia Fluxo' :
                  t('bot_naming_ma')
        } ${bots.length + 1}`,
      strategyId:
        wizard.strategy === 'AGGRESSIVE' ? 'AGGRESSIVE_SCALP' :
          wizard.strategy === 'SECURE' ? 'CONSERVATIVE_TREND' :
            wizard.strategy === 'ZIGZAG_PRO' ? 'ZIGZAG_PRO' :
              wizard.strategy === 'MATRIX_SCALP' ? 'MATRIX_SCALP' :
                wizard.strategy === 'MATRIX_NEURAL' ? 'MATRIX_NEURAL' :
                  wizard.strategy === 'ANATOMIA_FLUXO' ? 'ANATOMIA_FLUXO' :
                    'SIMPLE_MA',
      status: 'ACTIVE',
      lastActivity: new Date().toLocaleTimeString(),
      config: {
        ...strategyDefaults[
        wizard.strategy === 'AGGRESSIVE' ? 'AGGRESSIVE_SCALP' :
          wizard.strategy === 'SECURE' ? 'CONSERVATIVE_TREND' :
            wizard.strategy === 'ZIGZAG_PRO' ? 'ZIGZAG_PRO' :
              wizard.strategy === 'MATRIX_SCALP' ? 'MATRIX_SCALP' :
                wizard.strategy === 'MATRIX_NEURAL' ? 'MATRIX_NEURAL' :
                  wizard.strategy === 'ANATOMIA_FLUXO' ? 'ANATOMIA_FLUXO' :
                    'SIMPLE_MA'
        ],
        exchangeId: wizard.exchangeId,
        assets: wizard.assets.map(a => a + 'USDT'),
        // Wizard overrides
        leverage: wizard.leverage,
        riskPerTrade: wizard.riskPerTrade,
        stopLossPct: wizard.stopLoss,
        takeProfitPct: wizard.takeProfit,
        aiProvider: wizard.aiProvider
      } as any,
      performance: {
        totalPnl: 0,
        todayPnl: 0,
        trades: 0,
        winRate: 0,
        consecutiveLosses: 0,
        avgTradeDuration: '0m'
      }
    };

    setBots([...bots, newBot]);
    setShowAddModal(false);

    // Send to backend
    const ex = exchanges.find(e => e.id === wizard.exchangeId);
    if (ex) {
      botService.deployBot({
        id: newBot.id,
        name: newBot.name,
        strategyId: newBot.strategyId,
        status: newBot.status,
        ...newBot.config
      }, ex);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-slate-900 border border-slate-800 p-6 rounded-2xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-cyan-500/10 rounded-xl border border-cyan-500/20">
            <Bot className="w-6 h-6 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-xl font-bold">Trading Bot Fleet</h3>
            <p className="text-sm text-slate-500">Manage and monitor your automated execution systems.</p>
          </div>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl transition-all shadow-lg flex items-center gap-2"
        >
          <Zap className="w-5 h-5" /> Deploy New Robot
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {bots.map(bot => (
          <div key={bot.id} className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all group">
            <div className="p-6 border-b border-slate-800 flex justify-between items-start">
              <div>
                <h4 className="font-bold text-lg text-slate-100 group-hover:text-cyan-400 transition-colors">
                  {bot.name.includes(' / ') ? bot.name.split(' / ')[1] : bot.name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-slate-500 font-bold tracking-widest uppercase">{bot.lastActivity}</span>
                </div>
              </div>
              <div className={`px-2 py-1 rounded text-[10px] font-bold tracking-widest flex items-center gap-1.5 ${bot.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500' : bot.status === 'TEST' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-500/10 text-slate-500'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${bot.status === 'ACTIVE' ? 'bg-emerald-500' : bot.status === 'TEST' ? 'bg-amber-500' : 'bg-slate-500'} animate-pulse`} />
                {bot.status}
              </div>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/50">
                  <p className="text-[9px] text-slate-600 font-bold uppercase mb-1">Daily Profit</p>
                  <p className={`text-sm font-bold ${bot.performance.todayPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {formatCurrency(bot.performance.todayPnl)}
                  </p>
                </div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800/50">
                  <p className="text-[9px] text-slate-600 font-bold uppercase mb-1">Win Rate</p>
                  <p className="text-sm font-bold text-cyan-400">{bot.performance.winRate.toFixed(1)}%</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-[11px] font-bold">
                  <span className="text-slate-500 tracking-wider">DAILY LOSS LIMIT</span>
                  <span className="text-rose-400">-{bot.config.maxDailyLoss}%</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-rose-500/50 w-[15%]" />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 pb-3">
                <button
                  onClick={() => {
                    const newStatus = bot.status === 'ACTIVE' || bot.status === 'TEST' ? 'PAUSED' : 'ACTIVE';
                    setBots(bots.map(b => b.id === bot.id ? { ...b, status: newStatus } : b));
                    if (newStatus === 'PAUSED') {
                      botService.pauseBot(bot.id);
                    } else {
                      const ex = exchanges.find(e => e.id === bot.config.exchangeId);
                      if (ex) {
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
                          // ðŸ”§ FIX: removed `|| true` that was keeping paper mode always on
                          paperTrade: bot.status === 'TEST'
                        }, ex);
                      }
                    }
                  }}
                  className="flex items-center justify-center gap-2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-all"
                >
                  {bot.status === 'ACTIVE' || bot.status === 'TEST' ? <ZapOff className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
                  {bot.status === 'ACTIVE' || bot.status === 'TEST' ? 'Pause' : 'Resume'}
                </button>
                <button
                  onClick={() => setEditingBot(bot)}
                  className="flex items-center justify-center gap-2 py-2.5 bg-slate-800/50 hover:bg-slate-800 text-slate-400 text-xs font-bold rounded-xl transition-all border border-slate-800"
                >
                  <Settings2 className="w-4 h-4" /> Config
                </button>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => setBots(bots.map(b => b.id === bot.id ? { ...b, status: b.status === 'ACTIVE' ? 'TEST' : b.status === 'TEST' ? 'ACTIVE' : b.status } : b))}
                  className={`flex-1 flex items-center justify-center gap-2 py-2.5 font-bold rounded-xl transition-all border ${bot.status === 'TEST' ? 'bg-amber-500/20 border-amber-500/40 text-amber-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-cyan-500/30 hover:text-cyan-400'}`}
                >
                  <Play className="w-4 h-4" /> {t('dry_run')}
                </button>
                <button
                  onClick={() => {
                    setBots(bots.filter(b => b.id !== bot.id));
                    botService.stopBot(bot.id);
                  }}
                  className="px-4 py-2.5 bg-rose-600/10 hover:bg-rose-600/20 text-rose-500 font-bold rounded-xl transition-all border border-rose-500/30 flex items-center justify-center"
                  title={t('decommission')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {bots.length === 0 && (
          <div className="md:col-span-2 lg:col-span-3 py-20 bg-slate-900/30 border-2 border-dashed border-slate-800 rounded-3xl flex flex-col items-center justify-center space-y-4">
            <div className="p-5 bg-slate-800/50 rounded-full">
              <Bot className="w-12 h-12 text-slate-600" />
            </div>
            <div className="text-center">
              <h4 className="text-xl font-bold text-slate-400">No trading entities active.</h4>
              <p className="text-sm text-slate-500 max-w-xs mx-auto mt-2">
                Deploy your first automated trading logic to begin algorithmic execution.
              </p>
            </div>
            <button
              onClick={() => setShowAddModal(true)}
              className="mt-4 px-8 py-3 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-400 border border-cyan-500/30 font-bold rounded-xl transition-all"
            >
              Start Deployment Wizard
            </button>
          </div>
        )}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in zoom-in-95">
            <div className="p-8 border-b border-slate-800 flex justify-between items-center sticky top-0 bg-slate-900/90 backdrop-blur-md z-10 rounded-t-3xl">
              <div className="flex items-center gap-4">
                <div className="bg-cyan-500 p-2.5 rounded-xl text-slate-950">
                  {wizard.strategy === 'AGGRESSIVE' ? <Flame className="w-6 h-6" /> :
                    wizard.strategy === 'SECURE' ? <Shield className="w-6 h-6" /> :
                      wizard.strategy === 'MATRIX_NEURAL' ? <BrainCircuit className="w-6 h-6" /> :
                        <Activity className="w-6 h-6" />}
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight">
                    {wizard.strategy === 'AGGRESSIVE' ? `${t('deploy_wizard')}: ${t('agg_scalper')}` :
                      wizard.strategy === 'SECURE' ? `${t('deploy_wizard')}: ${t('secure_trend')}` :
                        wizard.strategy === 'MATRIX_NEURAL' ? `${t('deploy_wizard')}: ${t('matrix_neural')}` :
                          wizard.strategy === 'ANATOMIA_FLUXO' ? `${t('deploy_wizard')}: Anatomia do Fluxo` :
                            wizard.strategy === 'ROBO_IA' ? `${t('deploy_wizard')}: ROBO IA` :
                              wizard.strategy === 'ROBO_ENSAIO' ? `${t('deploy_wizard')}: ROBO ENSAIO` :
                                `${t('deploy_wizard')}: ${t('simple_ma_core')}`}
                  </h3>
                  <p className="text-sm text-slate-500 tracking-wide">
                    {wizard.strategy === 'AGGRESSIVE' ? t('mexc_logic_desc') :
                      wizard.strategy === 'SECURE' ? t('secure_logic_desc') :
                        wizard.strategy === 'SIMPLE_MA' ? t('simple_ma_desc') :
                          wizard.strategy === 'ROBO_IA' ? "Advanced AI-driven strategy with automated SL/TP and adaptive signals." :
                            wizard.strategy === 'ROBO_ENSAIO' ? "Testes hiperagressivos de 15s para testar comunicação com a API." :
                              wizard.strategy === 'ANATOMIA_FLUXO' ? "4-Painéis Python Script - Integração Institucional, Fluxo, Gatilhos e Macro." :
                                wizard.strategy === 'MATRIX_NEURAL' ? t('matrix_neural_desc') : t('zigzag_desc')}
                  </p>
                </div>
              </div>
              <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-8 space-y-10">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-2">
                <button
                  onClick={() => dispatch({ type: 'SET_STRATEGY', payload: 'AGGRESSIVE' })}
                  className={`relative flex-1 py-6 rounded-2xl border transition-all flex flex-col items-center gap-3 overflow-hidden group ${wizard.strategy === 'AGGRESSIVE' ? 'border-cyan-500 bg-gradient-to-br from-cyan-500/20 to-slate-900 text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.2)]' : 'border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 text-slate-500 hover:border-slate-700 hover:scale-[1.02]'}`}
                >
                  <Zap className="w-8 h-8 relative z-10" />
                  <span className="font-black text-xs tracking-widest uppercase relative z-10">{t('agg_scalp_label')}</span>
                </button>
                <button
                  onClick={() => dispatch({ type: 'SET_STRATEGY', payload: 'SECURE' })}
                  className={`relative flex-1 py-6 rounded-2xl border transition-all flex flex-col items-center gap-3 overflow-hidden group ${wizard.strategy === 'SECURE' ? 'border-emerald-500 bg-gradient-to-br from-emerald-500/20 to-slate-900 text-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.2)]' : 'border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 text-slate-500 hover:border-slate-700 hover:scale-[1.02]'}`}
                >
                  <Shield className="w-8 h-8 relative z-10" />
                  <span className="font-black text-xs tracking-widest uppercase relative z-10">{t('secure_trend_label')}</span>
                </button>
                <button
                  onClick={() => dispatch({ type: 'SET_STRATEGY', payload: 'SIMPLE_MA' })}
                  className={`relative flex-1 py-6 rounded-2xl border transition-all flex flex-col items-center gap-3 overflow-hidden group ${wizard.strategy === 'SIMPLE_MA' ? 'border-amber-500 bg-gradient-to-br from-amber-500/20 to-slate-900 text-amber-400 shadow-[0_0_30px_rgba(245,158,11,0.2)]' : 'border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 text-slate-500 hover:border-slate-700 hover:scale-[1.02]'}`}
                >
                  <Activity className="w-8 h-8 relative z-10" />
                  <span className="font-black text-xs tracking-widest uppercase relative z-10">{t('ma_cross_label')}</span>
                </button>
                <button
                  onClick={() => dispatch({ type: 'SET_STRATEGY', payload: 'ZIGZAG_PRO' })}
                  className={`relative flex-1 py-6 rounded-2xl border transition-all flex flex-col items-center gap-3 overflow-hidden group ${wizard.strategy === 'ZIGZAG_PRO' ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-slate-900 text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.2)]' : 'border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 text-slate-500 hover:border-slate-700 hover:scale-[1.02]'}`}
                >
                  <GitMerge className="w-8 h-8 relative z-10" />
                  <span className="font-black text-xs tracking-widest uppercase relative z-10">{t('zigzag_pro')}</span>
                </button>
                <button
                  onClick={() => dispatch({ type: 'SET_STRATEGY', payload: 'MATRIX_SCALP' })}
                  className={`relative flex-1 py-6 rounded-2xl border transition-all flex flex-col items-center gap-3 overflow-hidden group ${wizard.strategy === 'MATRIX_SCALP' ? 'border-rose-500 bg-gradient-to-br from-rose-500/20 to-slate-900 text-rose-400 shadow-[0_0_30px_rgba(244,63,94,0.2)]' : 'border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 text-slate-500 hover:border-slate-700 hover:scale-[1.02]'}`}
                >
                  <Cpu className="w-8 h-8 relative z-10" />
                  <span className="font-black text-xs tracking-widest uppercase relative z-10">{t('matrix_scalp')}</span>
                </button>
                <button
                  onClick={() => dispatch({ type: 'SET_STRATEGY', payload: 'MATRIX_NEURAL' })}
                  className={`relative flex-1 py-6 rounded-2xl border transition-all flex flex-col items-center gap-3 overflow-hidden group ${wizard.strategy === 'MATRIX_NEURAL' ? 'border-blue-500 bg-gradient-to-br from-blue-500/20 to-slate-900 text-blue-400 shadow-[0_0_30px_rgba(59,130,246,0.2)]' : 'border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 text-slate-500 hover:border-slate-700 hover:scale-[1.02]'}`}
                >
                  <BrainCircuit className="w-8 h-8 relative z-10" />
                  <span className="font-black text-xs tracking-widest uppercase relative z-10">{t('matrix_neural')}</span>
                </button>
                <button
                  onClick={() => dispatch({ type: 'SET_STRATEGY', payload: 'ANATOMIA_FLUXO' })}
                  className={`relative flex-1 py-6 rounded-2xl border transition-all flex flex-col items-center gap-3 overflow-hidden group ${wizard.strategy === 'ANATOMIA_FLUXO' ? 'border-cyan-500 bg-gradient-to-br from-cyan-500/20 to-slate-900 text-cyan-400 shadow-[0_0_30px_rgba(6,182,212,0.2)]' : 'border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 text-slate-500 hover:border-slate-700 hover:scale-[1.02]'}`}
                >
                  <Activity className="w-8 h-8 relative z-10" />
                  <span className="font-black text-xs tracking-widest uppercase relative z-10">Anatomia Fluxo</span>
                </button>
                <button
                  onClick={() => dispatch({ type: 'SET_STRATEGY', payload: 'ROBO_IA' })}
                  className={`relative flex-1 py-6 rounded-2xl border transition-all flex flex-col items-center gap-3 overflow-hidden group ${wizard.strategy === 'ROBO_IA' ? 'border-purple-500 bg-gradient-to-br from-purple-500/20 to-slate-900 text-purple-400 shadow-[0_0_30px_rgba(168,85,247,0.2)]' : 'border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 text-slate-500 hover:border-slate-700 hover:scale-[1.02]'}`}
                >
                  <Cpu className="w-8 h-8 relative z-10" />
                  <span className="font-black text-xs tracking-widest uppercase relative z-10">ROBO IA</span>
                </button>
                <button
                  onClick={() => dispatch({ type: 'SET_STRATEGY', payload: 'ROBO_ENSAIO' })}
                  className={`relative flex-1 py-6 rounded-2xl border transition-all flex flex-col items-center gap-3 overflow-hidden group ${wizard.strategy === 'ROBO_ENSAIO' ? 'border-white bg-gradient-to-br from-white/20 to-slate-900 text-white shadow-[0_0_30px_rgba(255,255,255,0.2)]' : 'border-slate-800 bg-gradient-to-br from-slate-900 to-slate-950 text-slate-500 hover:border-slate-700 hover:scale-[1.02]'}`}
                >
                  <Zap className="w-8 h-8 relative z-10" />
                  <span className="font-black text-xs tracking-widest uppercase relative z-10 text-center">ROBO ENSAIO<br /><span className="text-[9px]">(Teste Rápido)</span></span>
                </button>
              </div>


              {wizard.strategy === 'ROBO_ENSAIO' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 bg-white/5 rounded-xl border border-white/20">
                    <h4 className="font-bold text-white mb-2 flex items-center gap-2"><Zap className="w-4 h-4" /> Configuração do ENSAIO</h4>
                    <p className="text-xs text-slate-400 mb-4">Esse bot não usa Inteligência. Ele compra agora e vende nos próximos 15 segundos repetidamente até você pausar. Use APENAS com modo Simulação (Dry Run) ou valores mínimos na vida real (Live) para Diagnosticar Erros da MEXC.</p>
                    <div className="grid grid-cols-2 gap-4">
                      <SettingField label="Atuação" value="Loop Compra/Venda infinito" />
                      <SettingField label={t('stop_loss')} value={`${wizard.stopLoss}% (Fixo)`} />
                    </div>
                  </div>
                </div>
              )}

              {wizard.strategy === 'AGGRESSIVE' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 bg-cyan-500/5 rounded-xl border border-cyan-500/20">
                    <h4 className="font-bold text-cyan-400 mb-2 flex items-center gap-2"><Flame className="w-4 h-4" /> {t('scalp_engine_config')}</h4>
                    <p className="text-xs text-slate-400 mb-4">{t('scalp_engine_desc')}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <SettingField label={t('leverage')} value={`${wizard.leverage}x (Isolated)`} />
                      <SettingField label={t('take_profit')} value="0.5% / 1.5%" />
                      <SettingField label={t('stop_loss')} value={`${wizard.stopLoss}%`} />
                      <SettingField label={t('max_drawdown')} value="3.0% Daily" />
                    </div>
                  </div>
                </div>
              )}

              {wizard.strategy === 'SECURE' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20">
                    <h4 className="font-bold text-emerald-400 mb-2 flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> {t('cons_config')}</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">{t('entry_strat')}</label>
                        <div className="flex flex-col gap-2">
                          <ToggleRow label="EMA Rejection" active={true} />
                          <ToggleRow label="HH/HL Structure" active={true} />
                          <ToggleRow label="RSI Check" active={true} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">{t('trend_filter')}</label>
                        <select
                          value="4H"
                          readOnly
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-bold text-slate-300 outline-none"
                        >
                          <option value="4H">4 Hour Trend</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <SettingField label={t('risk_reward')} value="1:2 Min" />
                      <SettingField label={t('trailing_stop')} value="ATR x 1.5" />
                    </div>
                  </div>
                </div>
              )}

              {wizard.strategy === 'SIMPLE_MA' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 bg-amber-500/5 rounded-xl border border-amber-500/20">
                    <h4 className="font-bold text-amber-400 mb-2 flex items-center gap-2"><Activity className="w-4 h-4" /> {t('ma_cross_logic')}</h4>
                    <p className="text-xs text-slate-400 mb-4">{t('ma_cross_desc')}</p>
                    <div className="grid grid-cols-2 gap-4">
                      <SettingField label="Fast MA" value="9 EMA" />
                      <SettingField label="Slow MA" value="21 EMA" />
                      <SettingField label="Confirm" value="Volume > 1.3x" />
                      <SettingField label="RSI Filter" value="40-65 Range" />
                    </div>
                  </div>
                </div>
              )}

              {wizard.strategy === 'ZIGZAG_PRO' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 bg-purple-500/5 rounded-xl border border-purple-500/20">
                    <h4 className="font-bold text-purple-400 mb-2 flex items-center gap-2"><GitMerge className="w-4 h-4" /> {t('zz_pivots')}</h4>
                    <p className="text-xs text-slate-400 mb-4">{t('zz_pivots_desc')}</p>
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Depth</label>
                        <input
                          type="number"
                          value="12"
                          readOnly
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-bold text-purple-400 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Deviation</label>
                        <input
                          type="number"
                          value="5"
                          readOnly
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-bold text-purple-400 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Backstep</label>
                        <input
                          type="number"
                          value="2"
                          readOnly
                          className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-bold text-purple-400 outline-none"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {wizard.strategy === 'MATRIX_SCALP' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/20">
                    <h4 className="font-bold text-rose-400 mb-2 flex items-center gap-2"><Cpu className="w-4 h-4" /> MatrixScalp Pro Engine</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Risk Protocol</label>
                        <div className="flex flex-col gap-2">
                          <ToggleRow label="Dynamic ATR Stop" active={true} />
                          <ToggleRow label="Order Flow Absorption" active={true} />
                          <ToggleRow label="Volatility Adjustment" active={true} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Execution Timeframe</label>
                        <div className="bg-slate-950 border border-slate-800 rounded-lg p-2 flex items-center gap-2">
                          <span className="text-xs font-bold text-rose-400">15s / 1m</span>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <SettingField label="TP Levels" value="3 Stages (0.4% - 1.0%)" />
                      <SettingField label="Max Exposure" value={`${wizard.riskPerTrade}% per trade`} />
                    </div>
                  </div>
                </div>
              )}

              {wizard.strategy === 'MATRIX_NEURAL' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
                    <h4 className="font-bold text-blue-400 mb-2 flex items-center gap-2"><BrainCircuit className="w-4 h-4" /> MatrixNeural X Engine</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Neural Ensemble</label>
                        <div className="flex flex-col gap-2">
                          <ToggleRow label="DNN / LSTM Prediction" active={true} />
                          <ToggleRow label="Transformer Temporal Analysis" active={true} />
                          <ToggleRow label="Sentiment NLP Core" active={true} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Confidence Target</label>
                        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-[10px] font-bold text-blue-400 uppercase">Min Confidence</span>
                            <span className="text-xs font-bold text-white">85%</span>
                          </div>
                          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full w-[85%]" />
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <SettingField label="Market Regime" value="Dynamic Adaptation" />
                      <SettingField label="Learning Status" value="Online / Adaptive" />
                    </div>
                  </div>
                </div>
              )}

              {wizard.strategy === 'ANATOMIA_FLUXO' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                  <div className="p-4 bg-cyan-500/5 rounded-xl border border-cyan-500/20">
                    <h4 className="font-bold text-cyan-400 mb-2 flex items-center gap-2"><Activity className="w-4 h-4" /> Anatomia do Fluxo</h4>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Análise 4-Painéis</label>
                        <div className="flex flex-col gap-2">
                          <ToggleRow label="Painel 1 (Macro)" active={true} />
                          <ToggleRow label="Painel 2 (Institucional)" active={true} />
                          <ToggleRow label="Painel 3 (Gatilhos)" active={true} />
                          <ToggleRow label="Painel 4 (Micro)" active={true} />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-500 uppercase">Indicadores Base</label>
                        <div className="flex flex-col gap-2">
                          <SettingField label="SMI" value="20 / 10 / 0.3" />
                          <SettingField label="CVD" value="14 Smooth" />
                          <SettingField label="Bands" value="2.0 Deviations" />
                          <SettingField label="Volume Profile" value="180 / 24 bins" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Neural Core section removed by user request (bots operate without AI) */}


              <section className="space-y-6">
                <div className="flex items-center gap-2 text-cyan-400 font-bold uppercase tracking-widest text-xs">
                  <Activity className="w-4 h-4" /> {t('market_filters')}
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('trend_filter')}</label>
                    {wizard.strategy === 'SECURE' ? (
                      <select
                        value="4H"
                        readOnly
                        className="w-full bg-slate-950 border border-slate-800 p-3 rounded-xl font-bold text-slate-200 outline-none"
                      >
                        <option value="4H">4 Hours (Standard)</option>
                      </select>
                    ) : (
                      <SettingField label="EMA Threshold" value={`${wizard.strategy === 'AGGRESSIVE' ? '200 Period (15m/1H)' : '200 Period (Daily)'}`} />
                    )}
                  </div>
                </div>
              </section>

              <section className="space-y-6">
                <div className="flex items-center gap-2 text-amber-400 font-bold uppercase tracking-widest text-xs">
                  <Zap className="w-4 h-4" /> {t('entry_strat_logic')}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-slate-950/50 p-6 rounded-2xl border border-slate-800">
                  <div className="space-y-4">
                    {wizard.strategy === 'AGGRESSIVE' ? (
                      <>
                        <ToggleRow label="EMA Cross (9/21)" active={true} />
                        <ToggleRow label="RSI Range (50-70)" active={true} />
                        <ToggleRow label="Relative Volume Check" active={true} />
                      </>
                    ) : wizard.strategy === 'SECURE' ? (
                      <>
                        <ToggleRow label="EMA Rejection (20/50)" active={true} />
                        <ToggleRow label="HH/HL Structure Filter" active={true} />
                        <ToggleRow label="RSI Range (45-60)" active={true} />
                      </>
                    ) : (
                      <>
                        <ToggleRow label="Crossover (9/21 EMA)" active={true} />
                        <ToggleRow label="Volume Confirmation (>1.3x)" active={true} />
                        <ToggleRow label="RSI Control (40-65)" active={true} />
                      </>
                    )}
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">{t('tech_summary')}</p>
                      <p className="text-xs leading-relaxed text-slate-300 italic">
                        {wizard.strategy === 'AGGRESSIVE'
                          ? t('desc_agg_tech')
                          : wizard.strategy === 'SECURE'
                            ? t('desc_sec_tech')
                            : wizard.strategy === 'MATRIX_NEURAL'
                              ? t('desc_neural_tech')
                              : wizard.strategy === 'MATRIX_SCALP'
                                ? t('desc_matrix_tech')
                                : t('desc_ma_tech')}
                      </p>
                    </div>
                  </div>
                </div>
              </section>



              <div className="flex gap-4 pt-4">
                <button
                  onClick={deployBot}
                  disabled={!wizard.isValid}
                  className={`w-full py-4 rounded-2xl font-black text-sm tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl ${!wizard.isValid ? 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-cyan-600 to-purple-600 hover:from-cyan-500 hover:to-purple-500 text-white'}`}
                >
                  <Zap className="w-5 h-5" /> {wizard.strategy === 'AGGRESSIVE' ? t('instantiate_agg') : wizard.strategy === 'SECURE' ? t('instantiate_sec') : wizard.strategy === 'ANATOMIA_FLUXO' ? 'DEPLOY ANATOMIA FLUXO' : t('instantiate_ma')}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {
        editingBot && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 text-left">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl shadow-2xl animate-in zoom-in-95 max-h-[90vh] flex flex-col">
              <div className="p-8 border-b border-slate-800 flex justify-between items-center bg-slate-900/90 backdrop-blur-md rounded-t-3xl shrink-0">
                <div className="flex items-center gap-4">
                  <div className="bg-amber-500 p-2.5 rounded-xl">
                    <Settings2 className="w-6 h-6 text-slate-950" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold tracking-tight">{t('config_bot')}: {editingBot.name}</h3>
                    <p className="text-sm text-slate-500 tracking-wide">{t('adj_params')}</p>
                  </div>
                </div>
                <button onClick={() => { setEditingBot(null); setEditDryRunResult(null); }} className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="p-8 space-y-8 overflow-y-auto flex-1 custom-scrollbar">
                <div className="grid grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('gen_risk')}</label>
                    <div className="space-y-4 bg-slate-950/50 p-4 rounded-xl border border-slate-800">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">Leverage (Max {editingBot.config.leverage}x)</label>
                        <input
                          type="number"
                          value={editingBot.config.leverage}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = { ...editingBot, config: { ...editingBot.config, leverage: val } };
                            setEditingBot(updated);
                            setBots(bots.map(b => b.id === editingBot.id ? updated : b));
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm font-bold text-cyan-400 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">Daily Loss Limit (%)</label>
                        <input
                          type="number"
                          step="0.1"
                          value={editingBot.config.maxDailyLoss}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = { ...editingBot, config: { ...editingBot.config, maxDailyLoss: val } };
                            setEditingBot(updated);
                            setBots(bots.map(b => b.id === editingBot.id ? updated : b));
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm font-bold text-rose-400 outline-none"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-amber-400 uppercase tracking-wide">
                          ⚠️ Máx. Perdas Consecutivas
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          step="1"
                          value={(editingBot.config as any).maxConsecutiveLosses ?? 3}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = { ...editingBot, config: { ...editingBot.config, maxConsecutiveLosses: val } };
                            setEditingBot(updated);
                            setBots(bots.map(b => b.id === editingBot.id ? updated : b));
                          }}
                          className="w-full bg-slate-900 border border-amber-500/30 rounded-lg p-3 text-sm font-bold text-amber-400 outline-none focus:border-amber-500"
                        />
                        <p className="text-[9px] text-slate-500">Robô pausa automaticamente após N perdas seguidas</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-2 text-cyan-400">
                      <Activity className="w-5 h-5" />
                      <h4 className="font-bold uppercase tracking-widest text-xs">{t('market_filters')}</h4>
                    </div>
                    <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-800 space-y-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">{t('ex_target')}</label>
                        <select
                          value={editingBot.config.exchangeId}
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = { ...editingBot, config: { ...editingBot.config, exchangeId: val } };
                            setEditingBot(updated);
                            setBots(bots.map(b => b.id === editingBot.id ? updated : b));
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm font-bold text-slate-200 outline-none focus:border-cyan-500/50"
                        >
                          {exchanges.map(ex => (
                            <option key={ex.id} value={ex.id} disabled={ex.status !== 'CONNECTED'}>
                              {ex.name} {ex.status !== 'CONNECTED' ? '(OFFLINE)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">{t('trading_pairs')}</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            placeholder="Ex: BTC, ETH"
                            value={newAsset}
                            onChange={(e) => setNewAsset(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') {
                                e.preventDefault();
                                if (!newAsset) return;
                                const ticker = newAsset.toUpperCase().includes('USDT') ? newAsset.toUpperCase() : newAsset.toUpperCase() + 'USDT';
                                if (editingBot.config.assets.includes(ticker)) return;
                                const updated = { ...editingBot, config: { ...editingBot.config, assets: [...editingBot.config.assets, ticker] } };
                                setEditingBot(updated);
                                setBots(bots.map(b => b.id === editingBot.id ? updated : b));
                                setNewAsset('');
                              }
                            }}
                            className="flex-1 bg-slate-900 border border-slate-800 p-2 rounded-lg text-xs mono text-cyan-400 outline-none"
                          />
                          <button
                            onClick={() => {
                              if (!newAsset) return;
                              const ticker = newAsset.toUpperCase().includes('USDT') ? newAsset.toUpperCase() : newAsset.toUpperCase() + 'USDT';
                              if (editingBot.config.assets.includes(ticker)) return;
                              const updated = { ...editingBot, config: { ...editingBot.config, assets: [...editingBot.config.assets, ticker] } };
                              setEditingBot(updated);
                              setBots(bots.map(b => b.id === editingBot.id ? updated : b));
                              setNewAsset('');
                            }}
                            className="p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center gap-1.5 flex-wrap mt-2">
                          {editingBot.config.assets.map(ticker => (
                            <span key={ticker} className="bg-cyan-500/10 text-cyan-400 text-[9px] px-2 py-0.5 rounded font-bold border border-cyan-500/20 uppercase flex items-center gap-1.2">
                              {ticker}
                              <button
                                onClick={() => {
                                  const updated = { ...editingBot, config: { ...editingBot.config, assets: editingBot.config.assets.filter(a => a !== ticker) } };
                                  setEditingBot(updated);
                                  setBots(bots.map(b => b.id === editingBot.id ? updated : b));
                                }}
                                className="hover:text-rose-500 transition-colors"
                              >
                                <X className="w-2 h-2" />
                              </button>
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Neural Core Edit section removed by user request */}

                    <div className="grid grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-2 text-cyan-400">
                          <GitMerge className="w-5 h-5" />
                          <h4 className="font-bold uppercase tracking-widest text-xs">Margin Protocol</h4>
                        </div>
                        <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-800">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400">Margin Mode</label>
                            <select
                              value={editingBot.config.marginMode || 'CROSS'}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = { ...editingBot, config: { ...editingBot.config, marginMode: val } };
                                setEditingBot(updated);
                                setBots(bots.map(b => b.id === editingBot.id ? updated : b));
                              }}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm font-bold text-slate-200 outline-none focus:border-cyan-500/50"
                            >
                              <option value="CROSS">Cross Margin</option>
                              <option value="ISOLATED">Isolated Margin</option>
                            </select>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-4">
                        <div className="flex items-center gap-3 mb-2 text-cyan-400">
                          <ArrowRightLeft className="w-5 h-5" />
                          <h4 className="font-bold uppercase tracking-widest text-xs">Market Execution</h4>
                        </div>
                        <div className="bg-slate-950/30 p-4 rounded-xl border border-slate-800">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-slate-400">Market Type</label>
                            <select
                              value={editingBot.config.marketMode || 'FUTURES'}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updated = { ...editingBot, config: { ...editingBot.config, marketMode: val } };
                                setEditingBot(updated);
                                setBots(bots.map(b => b.id === editingBot.id ? updated : b));
                              }}
                              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm font-bold text-slate-200 outline-none focus:border-cyan-500/50"
                            >
                              <option value="FUTURES">Futures Trading</option>
                              <option value="SPOT">Spot Trading</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-8 bg-slate-950/30 p-6 rounded-2xl border border-slate-800/50">
                  <div className="col-span-2 space-y-4">
                    <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Advanced Configuration</label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">{t('max_trades_daily')}</label>
                        <input
                          type="number"
                          placeholder="Ex: 10"
                          value={editingBot.config.maxTradesPerDay || ''}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = { ...editingBot, config: { ...editingBot.config, maxTradesPerDay: val } };
                            setEditingBot(updated);
                            setBots(bots.map(b => b.id === editingBot.id ? updated : b));
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm font-bold text-slate-200 outline-none focus:border-cyan-500/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">{t('pos_size_pct')}</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Ex: 5%"
                          value={editingBot.config.positionSizePct || ''}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = { ...editingBot, config: { ...editingBot.config, positionSizePct: val } };
                            setEditingBot(updated);
                            setBots(bots.map(b => b.id === editingBot.id ? updated : b));
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm font-bold text-emerald-400 outline-none focus:border-cyan-500/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">{t('tp_pct')}</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Ex: 0.5%"
                          value={editingBot.config.takeProfitPct || ''}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = { ...editingBot, config: { ...editingBot.config, takeProfitPct: val } };
                            setEditingBot(updated);
                            setBots(bots.map(b => b.id === editingBot.id ? updated : b));
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm font-bold text-cyan-400 outline-none focus:border-cyan-500/50"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-slate-400">{t('sl_pct')}</label>
                        <input
                          type="number"
                          step="0.1"
                          placeholder="Ex: 0.3%"
                          value={editingBot.config.stopLossPct || ''}
                          onChange={(e) => {
                            const val = Number(e.target.value);
                            const updated = { ...editingBot, config: { ...editingBot.config, stopLossPct: val } };
                            setEditingBot(updated);
                            setBots(bots.map(b => b.id === editingBot.id ? updated : b));
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm font-bold text-rose-400 outline-none focus:border-cyan-500/50"
                        />
                      </div>
                      <div className="space-y-1 col-span-2">
                        <label className="text-[10px] font-bold text-slate-400">{t('timeframe')}</label>
                        <select
                          value={editingBot.config.timeframe && editingBot.config.timeframe !== 'AUTO' ? editingBot.config.timeframe : '5m'}
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = { ...editingBot, config: { ...editingBot.config, timeframe: val } };
                            setEditingBot(updated);
                            setBots(bots.map(b => b.id === editingBot.id ? updated : b));
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm font-bold text-slate-200 outline-none focus:border-cyan-500/50 appearance-none cursor-pointer"
                        >
                          <option value="5m">5m</option>
                          <option value="15m">15m</option>
                          <option value="1h">1h</option>
                          <option value="2h">2h</option>
                          <option value="4h">4h</option>
                          <option value="1D">1D</option>
                        </select>
                      </div>
                    </div>
                  </div>



                  {editingBot.strategyId === 'AGGRESSIVE_SCALP' && (
                    <div className="col-span-2 p-4 bg-orange-500/5 rounded-xl border border-orange-500/20 space-y-4 animate-in fade-in slide-in-from-top-2">
                      <h4 className="text-[10px] font-bold text-orange-400 uppercase tracking-widest flex items-center gap-2">
                        <Flame className="w-3 h-3" /> Scalp Engine Core
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400">{t('ema_fast')}</label>
                          <input type="number" value={(editingBot.config as any).emaFast || 9} onChange={(e) => { const val = Number(e.target.value); const updated = { ...editingBot, config: { ...editingBot.config, emaFast: val } }; setEditingBot(updated); setBots(bots.map(b => b.id === editingBot.id ? updated : b)); }} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm font-bold text-orange-400 outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400">{t('ema_slow')}</label>
                          <input type="number" value={(editingBot.config as any).emaSlow || 21} onChange={(e) => { const val = Number(e.target.value); const updated = { ...editingBot, config: { ...editingBot.config, emaSlow: val } }; setEditingBot(updated); setBots(bots.map(b => b.id === editingBot.id ? updated : b)); }} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm font-bold text-orange-400 outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400">{t('ema_trend')}</label>
                          <input type="number" value={(editingBot.config as any).emaTrend || 200} onChange={(e) => { const val = Number(e.target.value); const updated = { ...editingBot, config: { ...editingBot.config, emaTrend: val } }; setEditingBot(updated); setBots(bots.map(b => b.id === editingBot.id ? updated : b)); }} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm font-bold text-orange-300 outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400">{t('tp_partial')} (%)</label>
                          <input type="number" step="0.1" value={(editingBot.config as any).tpPartial || 0.3} onChange={(e) => { const val = Number(e.target.value); const updated = { ...editingBot, config: { ...editingBot.config, tpPartial: val } }; setEditingBot(updated); setBots(bots.map(b => b.id === editingBot.id ? updated : b)); }} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm font-bold text-emerald-400 outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400">{t('tp_final')} (%)</label>
                          <input type="number" step="0.1" value={(editingBot.config as any).tpFinal || 0.8} onChange={(e) => { const val = Number(e.target.value); const updated = { ...editingBot, config: { ...editingBot.config, tpFinal: val } }; setEditingBot(updated); setBots(bots.map(b => b.id === editingBot.id ? updated : b)); }} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm font-bold text-emerald-500 outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400">{t('atr_mult')}</label>
                          <input type="number" step="0.1" value={(editingBot.config as any).atrThreshold || 1.5} onChange={(e) => { const val = Number(e.target.value); const updated = { ...editingBot, config: { ...editingBot.config, atrThreshold: val } }; setEditingBot(updated); setBots(bots.map(b => b.id === editingBot.id ? updated : b)); }} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm font-bold text-slate-400 outline-none" />
                        </div>
                      </div>
                    </div>
                  )}

                  {editingBot.strategyId === 'CONSERVATIVE_TREND' && (
                    <div className="col-span-2 p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/20 space-y-4 animate-in fade-in slide-in-from-top-2">
                      <h4 className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                        <ShieldCheck className="w-3 h-3" /> Trend Protocol
                      </h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400">{t('ema_trend')}</label>
                          <input type="number" value={(editingBot.config as any).emaTrend || 200} onChange={(e) => { const val = Number(e.target.value); const updated = { ...editingBot, config: { ...editingBot.config, emaTrend: val } }; setEditingBot(updated); setBots(bots.map(b => b.id === editingBot.id ? updated : b)); }} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm font-bold text-emerald-400 outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400">{t('rr_ratio')}</label>
                          <input type="number" step="0.1" value={(editingBot.config as any).rrRatio || 3.0} onChange={(e) => { const val = Number(e.target.value); const updated = { ...editingBot, config: { ...editingBot.config, rrRatio: val } }; setEditingBot(updated); setBots(bots.map(b => b.id === editingBot.id ? updated : b)); }} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm font-bold text-emerald-500 outline-none" />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400">{t('tp_partial')} (%)</label>
                          <input type="number" step="0.1" value={(editingBot.config as any).tpPartial || 1.5} onChange={(e) => { const val = Number(e.target.value); const updated = { ...editingBot, config: { ...editingBot.config, tpPartial: val } }; setEditingBot(updated); setBots(bots.map(b => b.id === editingBot.id ? updated : b)); }} className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm font-bold text-emerald-300 outline-none" />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">Structure Filter</span>
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-950/50 rounded-lg border border-slate-800">
                          <span className="text-[10px] font-bold text-slate-400 uppercase">EMA Rejection</span>
                          <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                        </div>
                      </div>
                    </div>
                  )}

                  {editingBot.strategyId === 'MATRIX_SCALP' && (
                    <div className="col-span-2 p-4 bg-rose-500/5 rounded-xl border border-rose-500/20 space-y-4 animate-in fade-in slide-in-from-top-2">
                      <h4 className="text-[10px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-2">
                        <Cpu className="w-3 h-3" /> Matrix Protocol Override
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400">ATR Multiplier (SL)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={(editingBot.config as MatrixScalpConfig).atrMultiplier || 1.5}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const updated = { ...editingBot, config: { ...editingBot.config, atrMultiplier: val } };
                              setEditingBot(updated);
                              setBots(bots.map(b => b.id === editingBot.id ? updated : b));
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm font-bold text-rose-400 outline-none focus:border-rose-500/50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400">Trailing Activation (%)</label>
                          <input
                            type="number"
                            step="0.1"
                            value={(editingBot.config as MatrixScalpConfig).trailingStop?.activation || 0.5}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const updated = {
                                ...editingBot,
                                config: {
                                  ...editingBot.config,
                                  trailingStop: {
                                    ...((editingBot.config as MatrixScalpConfig).trailingStop || { enabled: true, distance: 0.2 }),
                                    activation: val
                                  }
                                }
                              };
                              setEditingBot(updated);
                              setBots(bots.map(b => b.id === editingBot.id ? updated : b));
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm font-bold text-cyan-400 outline-none focus:border-cyan-500/50"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {editingBot.strategyId === 'MATRIX_NEURAL' && (
                    <div className="col-span-2 p-4 bg-blue-500/5 rounded-xl border border-blue-500/20 space-y-4 animate-in fade-in slide-in-from-top-2">
                      <h4 className="text-[10px] font-bold text-blue-400 uppercase tracking-widest flex items-center gap-2">
                        <BrainCircuit className="w-3 h-3" /> Neural Ensemble Protocol
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400">Min AI Confidence (%)</label>
                          <input
                            type="number"
                            step="1"
                            value={(editingBot.config as MatrixNeuralConfig).minConfidence || 85}
                            onChange={(e) => {
                              const val = Number(e.target.value);
                              const updated = { ...editingBot, config: { ...editingBot.config, minConfidence: val } };
                              setEditingBot(updated);
                              setBots(bots.map(b => b.id === editingBot.id ? updated : b));
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm font-bold text-blue-400 outline-none focus:border-blue-500/50"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400">Allowed Market Regimes</label>
                          <div className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-[9px] text-blue-300 font-mono">
                            Multi-Regime Adaptive Active
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="flex items-center gap-2 p-2 bg-slate-900/50 rounded-lg border border-slate-800">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase">LSTM/DNN</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-slate-900/50 rounded-lg border border-slate-800">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Transformer</span>
                        </div>
                        <div className="flex items-center gap-2 p-2 bg-slate-900/50 rounded-lg border border-slate-800">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
                          <span className="text-[9px] font-bold text-slate-400 uppercase">NLP Sentiment</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="col-span-2 space-y-4 pt-4 border-t border-slate-800/50">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('trading_hours')} (UTC)</label>
                      <button
                        onClick={() => {
                          const is24h = !editingBot.config.tradingHours?.use24h;
                          const updated = { ...editingBot, config: { ...editingBot.config, tradingHours: { ...(editingBot.config.tradingHours || { start: '09:00', end: '17:00' }), use24h: is24h } } };
                          setEditingBot(updated);
                          setBots(bots.map(b => b.id === editingBot.id ? updated : b));
                        }}
                        className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black transition-all border ${editingBot.config.tradingHours?.use24h ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400' : 'bg-slate-800 border-slate-700 text-slate-500'}`}
                      >
                        <Clock className="w-3 h-3" /> {t('op_24h').toUpperCase()}
                      </button>
                    </div>
                    <div className={`flex items-center gap-4 transition-opacity ${editingBot.config.tradingHours?.use24h ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
                      <div className="flex-1 space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">{t('start_time')}</label>
                        <input
                          type="time"
                          value={editingBot.config.tradingHours?.start || '09:00'}
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = { ...editingBot, config: { ...editingBot.config, tradingHours: { ...(editingBot.config.tradingHours || { start: '09:00', end: '17:00' }), start: val } } };
                            setEditingBot(updated);
                            setBots(bots.map(b => b.id === editingBot.id ? updated : b));
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm font-bold text-slate-300 outline-none focus:border-cyan-500/50"
                        />
                      </div>
                      <div className="flex-1 space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase">{t('end_time')}</label>
                        <input
                          type="time"
                          value={editingBot.config.tradingHours?.end || '17:00'}
                          onChange={(e) => {
                            const val = e.target.value;
                            const updated = { ...editingBot, config: { ...editingBot.config, tradingHours: { ...(editingBot.config.tradingHours || { start: '09:00', end: '17:00' }), end: val } } };
                            setEditingBot(updated);
                            setBots(bots.map(b => b.id === editingBot.id ? updated : b));
                          }}
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-sm font-bold text-slate-300 outline-none focus:border-cyan-500/50"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Manual Trade inside modal */}
              <div className="px-8 pb-4">
                <ManualTradePanel exchanges={exchanges} />
              </div>

              <div className="p-8 bg-slate-900/50 backdrop-blur-md rounded-b-3xl border-t border-slate-800 shrink-0">

                <div className="flex gap-6">
                  <button
                    onClick={() => { setEditingBot(null); }}
                    className="flex-1 py-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 active:scale-[0.98] text-white font-black text-sm uppercase tracking-[0.2em] rounded-2xl transition-all shadow-xl shadow-emerald-900/20 flex items-center justify-center gap-3 group"
                  >
                    <Save className="w-5 h-5 group-hover:rotate-12 transition-transform" /> {t('save')}
                  </button>
                  <button
                    onClick={() => {
                      const def = strategyDefaults[editingBot.strategyId] || strategyDefaults['SIMPLE_MA'];
                      setBots(bots.map(b => b.id === editingBot.id ? { ...b, config: { ...b.config, ...def } } : b));
                      setEditingBot({ ...editingBot, config: { ...editingBot.config, ...def } });
                    }}
                    className="px-8 py-4 bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 active:scale-[0.98] rounded-2xl font-black text-[10px] uppercase tracking-[0.15em] transition-all border border-slate-700/50 flex items-center justify-center gap-2 group"
                  >
                    <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" /> {t('reset_default')}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
};

const AssetFactoryView: React.FC<{
  data: SystemData,
  setData: React.Dispatch<React.SetStateAction<SystemData>>,
  exchanges: ExchangeConfig[],
  t: (k: any) => string
}> = ({ data, setData, exchanges, t }) => {
  const [activeTab, setActiveTab] = useState<'generator'>('generator');
  const [newTicker, setNewTicker] = useState('');
  const [tokenConfig, setTokenConfig] = useState({ name: 'My Utility Token', symbol: 'MUTL', supply: '100000000', chain: 'BSC', logo: '' });


  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTokenConfig({ ...tokenConfig, logo: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // DApp State
  const [ethAccount, setEthAccount] = useState("");
  const [deployedTokenAddress, setDeployedTokenAddress] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);
  const [gasFee, setGasFee] = useState("");

  const connectMetamask = async () => {
    if (!(window as any).ethereum) {
      alert("Please install MetaMask!");
      return;
    }
    try {
      await (window as any).ethereum.request({ method: "eth_requestAccounts" });
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const signer = await provider.getSigner();
      const addr = await signer.getAddress();
      setEthAccount(addr);

      // BSC Mainnet switch
      try {
        await (window as any).ethereum.request({
          method: "wallet_switchEthereumChain",
          params: [{ chainId: "0x38" }],
        });
      } catch (switchError: any) {
        if (switchError.code === 4902) {
          await (window as any).ethereum.request({
            method: 'wallet_addEthereumChain',
            params: [{
              chainId: '0x38',
              chainName: 'Binance Smart Chain',
              nativeCurrency: { name: 'BNB', symbol: 'BNB', decimals: 18 },
              rpcUrls: ['https://bsc-dataseed.binance.org/'],
              blockExplorerUrls: ['https://bscscan.com/']
            }],
          });
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const deploySmartContract = async () => {
    if (tokenConfig.chain === 'BTC' || tokenConfig.chain === 'SOL') {
      setIsDeploying(true);
      setTimeout(() => {
        setIsDeploying(false);
        if (tokenConfig.chain === 'BTC') {
          alert(`INSTRUCTIONS FOR BITCOIN BRC-20:\n\n1. Copy the JSON manifest from the code viewer.\n2. Go to an Ordinals Inscription service (e.g., UniSat or Gamma.io).\n3. Select "BRC-20" -> "Deploy".\n4. Paste the manifest and follow the network fee instructions.`);
        } else {
          alert(`INSTRUCTIONS FOR SOLANA SPL:\n\n1. Ensure you have the Solana CLI and Anchor installed.\n2. Copy the Rust code from the code viewer into your "programs/src/lib.rs" file.\n3. Run "anchor build" and "anchor deploy".\n4. For a simple SLP token without custom logic, you can also use "spl-token create-token" via CLI.`);
        }
      }, 2000);
      return;
    }

    if (!ethAccount) {
      await connectMetamask();
      return;
    }

    setIsDeploying(true);
    setGasFee("");
    try {
      const provider = new ethers.BrowserProvider((window as any).ethereum);
      const network = await provider.getNetwork();

      const targetChainId =
        tokenConfig.chain === 'ETH' ? 1n :
          tokenConfig.chain === 'POLYGON' ? 137n :
            tokenConfig.chain === 'AVAX' ? 43114n :
              56n;

      const chainName =
        tokenConfig.chain === 'ETH' ? "Ethereum Mainnet" :
          tokenConfig.chain === 'POLYGON' ? "Polygon Mainnet" :
            tokenConfig.chain === 'AVAX' ? "Avalanche C-Chain" :
              "Binance Smart Chain Mainnet";

      const hexChainId =
        tokenConfig.chain === 'ETH' ? "0x1" :
          tokenConfig.chain === 'POLYGON' ? "0x89" :
            tokenConfig.chain === 'AVAX' ? "0xa86a" :
              "0x38";

      if (network.chainId !== targetChainId) {
        alert(`Action Required: Please switch to ${chainName} in MetaMask.`);
        try {
          await (window as any).ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: hexChainId }],
          });
        } catch (swErr) {
          console.error("Network switch failed:", swErr);
        }
        setIsDeploying(false);
        return;
      }

      const signer = await provider.getSigner();

      // ABI & Standard BEP-20 Creation Bytecode
      const abi = [
        "constructor(string name, string symbol, uint256 initialSupply)",
        "function name() view returns (string)",
        "function symbol() view returns (string)",
        "function decimals() view returns (uint8)",
        "function totalSupply() view returns (uint256)",
        "function balanceOf(address) view returns (uint256)",
        "function transfer(address to, uint amount) returns (bool)"
      ];

      // Note: In a real app, this would be the actual compiled bytecode of the contract
      // For this demonstration, we use a placeholder or the provided "0x..." 
      const bytecode = "0x608060405234801561001057600080fd5b506109c1806100206000396000f3fe6080604052348015600f57600080fd5b506004361060595760003560e01c806306fdde0314605e57806318160ddd14607c57806370a0823114609a57806395d89b411460ba578063a9059cbb1460d8575b600080fd5b606460005460405190815260200160405180910390f35b606460025460405190815260200160405180910390f35b60a860013560405180910390f35b608260043560c0565b6000548152602001905060405180910390f35b606460015460405190815260200160405180910390f35b60f260043560243560f4565b60405180910390f35b60008160016000838152602001908152602001600020549050919050565b6000600160008481526020019081526020016000205482111561011257600080fd5b816001600084815260200190815260200160002060008282540392505081905550816001600084815260200190815260200160002060008282540192505081905550600190509291505056fea2646970667358221220a27e4e8406f52e37435f3d5e23668e7e4e167e4e167e4e167e4e167e4e167e4e64736f6c63430008140033";

      const factory = new ethers.ContractFactory(abi, bytecode, signer);

      // Supply scaling
      const initialSupply = ethers.parseUnits(tokenConfig.supply, 18);

      // Estimate Gas
      const deployTx = await factory.getDeployTransaction(tokenConfig.name, tokenConfig.symbol, initialSupply);
      try {
        const estimatedGas = await signer.estimateGas(deployTx);
        const feeData = await provider.getFeeData();
        setGasFee(ethers.formatEther(estimatedGas * (feeData.gasPrice || 1000000000n)) + " BNB");
      } catch (gErr) {
        console.warn("Gas estimation failed:", gErr);
      }

      // Execute Deploy
      const contract = await factory.deploy(tokenConfig.name, tokenConfig.symbol, initialSupply);

      await contract.waitForDeployment();

      const addr = await contract.getAddress();
      setDeployedTokenAddress(addr);

      // Add to MetaMask automatically
      try {
        await (window as any).ethereum.request({
          method: "wallet_watchAsset",
          params: {
            type: "ERC20",
            options: {
              address: addr,
              symbol: tokenConfig.symbol.toUpperCase(),
              decimals: 18,
              image: tokenConfig.logo || undefined,
            },
          },
        });
      } catch (waErr) {
        console.warn("Auto-add to wallet failed:", waErr);
      }

      alert(`BRAVO! Institutional Asset Deployed Status: ${addr}`);
    } catch (err: any) {
      console.error("DEPLOYMENT CORE ERROR:", err);
      const msg = err.reason || err.message || "Unknown cryptographic failure";
      alert(`DEPLOYMENT FAILED: ${msg}\n\nPlease check your BNB balance and ensures MetaMask is on the BSC Mainnet.`);
    }
    setIsDeploying(false);
  };





  const handleAddAsset = () => {
    if (!newTicker) return;
    const ticker = newTicker.toUpperCase();
    const assetKey = ticker.toLowerCase();

    if (data.market_data[assetKey]) {
      alert('Asset already tracked.');
      return;
    }

    const newMarketData = {
      ...data.market_data,
      [assetKey]: {
        price: Math.random() * 100,
        "24h_change": (Math.random() * 10) - 5,
        volume: Math.random() * 1000000,
        order_book: { bid_depth: 500000, ask_depth: 450000, spread: 0.02 },
        indicators: { rsi_14: 50 + (Math.random() * 20 - 10), macd: { value: 0, signal: 0 }, bb_width: 3.5, atr_14: 0.5 }
      }
    };

    setData({ ...data, market_data: newMarketData });
    setNewTicker('');
  };

  const getGeneratedCode = () => {
    if (tokenConfig.chain === 'BTC') {
      return `{
              "p": "brc-20",
            "op": "deploy",
            "tick": "${tokenConfig.symbol.substring(0, 4).toLowerCase()}",
            "max": "${tokenConfig.supply}",
            "lim": "${(parseInt(tokenConfig.supply) / 100).toFixed(0)}"
}`;
    }

    if (tokenConfig.chain === 'SOL') {
      return `use anchor_lang::prelude::*;
            use anchor_spl::token::{self, Mint, Token, TokenAccount};

            declare_id!("TokenFactory111111111111111111111111111111");

            #[program]
            pub mod ${tokenConfig.symbol.toLowerCase()}_token {
              use super::*;

            pub fn initialize_token(ctx: Context<InitializeToken>, decimals: u8) -> Result<()> {
              msg!("Initializing ${tokenConfig.name} (${tokenConfig.symbol})");
              Ok(())
    }
}

              #[derive(Accounts)]
              pub struct InitializeToken<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,
              #[account(
              init,
              payer = admin,
              mint::decimals = decimals,
              mint::authority = admin,
              )]
              pub mint: Account<'info, Mint>,
              pub system_program: Program<'info, System>,
              pub token_program: Program<'info, Token>,
              pub rent: Sysvar<'info, Rent>,
}`;
    }

    return `// SPDX-License-Identifier: MIT
              pragma solidity ^0.8.20;

              import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
              import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title ${tokenConfig.name}
              * @dev Implementation of a secure ${tokenConfig.chain}-based Utility Token.
              * Standard: ${tokenConfig.chain === 'BSC' ? 'BEP-20' :
        tokenConfig.chain === 'SOL' ? 'SPL' :
          'ERC-20'
      }
              */
              contract ${tokenConfig.symbol.toUpperCase()}Token is ERC20, Ownable {
                constructor() ERC20("${tokenConfig.name}", "${tokenConfig.symbol.toUpperCase()}") Ownable(msg.sender) {
                _mint(msg.sender, ${tokenConfig.supply} * 10 ** decimals());
    }

              function mint(address to, uint256 amount) public onlyOwner {
                _mint(to, amount);
    }
}`;
  };

  const generatedCode = getGeneratedCode();

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
        <div className="flex border-b border-slate-800 gap-8 overflow-x-auto whitespace-nowrap scrollbar-hide flex-1">
          <TabBtn label="Token Lab Generator" active={activeTab === 'generator'} onClick={() => setActiveTab('generator')} icon={<Cpu className="w-4 h-4" />} />
        </div>
        <div className="flex items-center gap-6 px-6 py-3 bg-slate-900/50 border border-slate-800 rounded-2xl">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('managed_aum')}</span>
            <span className="text-sm font-bold text-emerald-400">
              {exchanges.reduce((acc, ex) => acc + (ex.status === 'CONNECTED' ? (ex.balance || 0) : 0), 0).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
            </span>
          </div>
          <div className="flex flex-col border-l border-slate-800 pl-6">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Accounts</span>
            <span className="text-sm font-bold text-slate-200">{exchanges.filter(e => e.status === 'CONNECTED').length}</span>
          </div>
        </div>
      </div>

      {activeTab === 'generator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-3xl p-8 space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <PlusCircle className="text-purple-400" /> {t('utility_blueprint')}
            </h3>

            <div className="space-y-6 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('token_name')}</label>
                <input
                  type="text"
                  value={tokenConfig.name}
                  onChange={(e) => setTokenConfig({ ...tokenConfig, name: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl font-bold text-slate-100 outline-none focus:border-purple-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('symbol')}</label>
                <input
                  type="text"
                  value={tokenConfig.symbol}
                  onChange={(e) => setTokenConfig({ ...tokenConfig, symbol: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl font-bold text-slate-100 outline-none focus:border-purple-500/50 uppercase"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('total_supply')}</label>
                <input
                  type="number"
                  value={tokenConfig.supply}
                  onChange={(e) => setTokenConfig({ ...tokenConfig, supply: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl font-bold text-slate-100 outline-none focus:border-purple-500/50"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('network_chain')}</label>
                <select
                  value={tokenConfig.chain}
                  onChange={(e) => setTokenConfig({ ...tokenConfig, chain: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl font-bold text-slate-100 outline-none focus:border-purple-500/50 appearance-none cursor-pointer"
                >
                  <option value="BSC">Binance Smart Chain (BSC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="SOL">Solana (SOL)</option>
                  <option value="BTC">Bitcoin (BTC) - Taproot/BRC20</option>
                  <option value="POLYGON">Polygon</option>
                  <option value="AVAX">Avalanche</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('token_logo')}</label>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                    {tokenConfig.logo ? (
                      <img src={tokenConfig.logo} alt="Logo" className="w-full h-full object-cover" />
                    ) : (
                      <PieChartIcon className="w-6 h-6 text-slate-700" />
                    )}
                  </div>
                  <label className="flex-1 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg transition-all border border-slate-700 cursor-pointer text-center">
                    {t('choose_image')}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>
              </div>
              <div className="pt-4 flex flex-col gap-3">


                <button
                  onClick={deploySmartContract}
                  disabled={isDeploying}
                  className={`w-full py-4 ${isDeploying ? 'bg-slate-800' :
                    tokenConfig.chain === 'BTC' ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500' :
                      tokenConfig.chain === 'SOL' ? 'bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-400 hover:to-purple-500' :
                        tokenConfig.chain === 'ETH' ? 'bg-gradient-to-r from-indigo-600 to-blue-700 hover:from-indigo-500 hover:to-blue-600' :
                          tokenConfig.chain === 'POLYGON' ? 'bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-600 hover:to-indigo-700' :
                            tokenConfig.chain === 'AVAX' ? 'bg-gradient-to-r from-red-600 to-red-800 hover:from-red-500 hover:to-red-700' :
                              'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500'
                    } text-white font-bold rounded-2xl transition-all shadow-xl flex flex-col items-center justify-center gap-1 group`}
                >
                  <div className="flex items-center gap-2">
                    {isDeploying ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 group-hover:animate-pulse" />}
                    {isDeploying ? t('proc_protocol') :
                      tokenConfig.chain === 'BTC' ? "Initiate Bitcoin Inscription" :
                        tokenConfig.chain === 'SOL' ? "Initialize Solana Program" :
                          tokenConfig.chain === 'POLYGON' ? "Deploy to Polygon" :
                            tokenConfig.chain === 'AVAX' ? "Deploy to Avalanche" :
                              t('deploy_smart_contract')}
                  </div>
                  {!isDeploying && (
                    <span className="text-[10px] opacity-60 font-medium">
                      {tokenConfig.chain === 'BTC' ? "BRC-20 Ordinals Protocol" :
                        tokenConfig.chain === 'SOL' ? "Solana SPL Standard" :
                          tokenConfig.chain === 'ETH' ? "Ethereum Mainnet (ERC-20)" :
                            tokenConfig.chain === 'POLYGON' ? "Polygon (Matic/ERC-20)" :
                              tokenConfig.chain === 'AVAX' ? "Avalanche C-Chain (ERC-20)" :
                                "Binance Smart Chain (BEP-20)"}
                    </span>
                  )}
                </button>

                {ethAccount && (
                  <div className="bg-slate-950/50 border border-slate-800 p-4 rounded-xl space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{t('conn_wallet')}</span>
                      <span className="text-[10px] text-emerald-500 font-bold">ACTIVE</span>
                    </div>
                    <p className="text-[11px] font-mono text-slate-300 truncate">{ethAccount}</p>
                    {gasFee && (
                      <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                        <span className="text-[10px] text-slate-500 font-bold">{t('est_gas_fee')}</span>
                        <span className="text-[10px] text-cyan-400 font-bold">{gasFee}</span>
                      </div>
                    )}
                  </div>
                )}

                {deployedTokenAddress && (
                  <div className="bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-xl animate-in fade-in zoom-in duration-300">
                    <h4 className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">{t('contract_success')}</h4>
                    <p className="text-[11px] font-mono text-slate-300 truncate mb-2">{deployedTokenAddress}</p>
                    <button
                      onClick={() => window.open(`https://bscscan.com/address/${deployedTokenAddress}`, '_blank')}
                      className="text-[10px] text-emerald-500 hover:underline font-bold flex items-center gap-1"
                    >
                      <Globe className="w-3 h-3" /> {t('view_explorer')}
                    </button>
                  </div>
                )}

                <div className="bg-purple-500/5 border border-purple-500/20 p-4 rounded-xl">
                  <p className="text-[10px] text-purple-400 font-medium">Standard: {tokenConfig.chain} Utility Protocol</p>
                  <p className="text-[9px] text-slate-500 mt-1">Audit-ready code. Smart contract is verified through Neural Core factory.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-1 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-2">
                <FileText className={`w-4 h-4 ${tokenConfig.chain === 'BTC' ? 'text-orange-400' :
                  tokenConfig.chain === 'SOL' ? 'text-teal-400' :
                    tokenConfig.chain === 'ETH' ? 'text-indigo-400' :
                      tokenConfig.chain === 'POLYGON' ? 'text-purple-400' :
                        tokenConfig.chain === 'AVAX' ? 'text-red-400' :
                          'text-purple-400'
                  }`} />
                <span className="text-xs font-bold text-slate-300">
                  {tokenConfig.chain === 'BTC' ? 'brc20-manifest.json' :
                    tokenConfig.chain === 'SOL' ? 'lib.rs (Anchor)' :
                      tokenConfig.chain === 'POLYGON' ? 'SimpleUtilityToken.sol (Polygon)' :
                        tokenConfig.chain === 'AVAX' ? 'SimpleUtilityToken.sol (Avalanche)' :
                          'SimpleUtilityToken.sol'}
                </span>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText(generatedCode); alert('Code copied!'); }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg transition-all border border-slate-700 flex items-center gap-2"
              >
                <Save className="w-3 h-3" /> {t('copy_code')}
              </button>
            </div>
            <pre className={`p-8 text-[11px] font-mono ${tokenConfig.chain === 'BTC' ? 'text-orange-500/80' :
              tokenConfig.chain === 'SOL' ? 'text-teal-500/80' :
                tokenConfig.chain === 'ETH' ? 'text-indigo-500/80' :
                  tokenConfig.chain === 'POLYGON' ? 'text-purple-500/80' :
                    tokenConfig.chain === 'AVAX' ? 'text-red-500/80' :
                      'text-cyan-500/80'
              } overflow-auto max-h-[500px] scrollbar-thin`}>
              {generatedCode}
            </pre>
          </div>
        </div>
      )}


    </div>
  );
};



export default App;

const BotMonitoringView: React.FC<{
  t: (k: any) => string;
  formatCurrency: (v: number) => string;
  bots: TradingBot[];
  trades: Trade[];
  equityData: EquityPoint[];
  cashAvailable: number;
  onToggleBot?: (id: string, newStatus: 'ACTIVE' | 'PAUSED') => void;
  onClearHistory?: () => void;
}> = ({ t, formatCurrency, bots, trades, equityData, cashAvailable, onToggleBot, onClearHistory }) => {
  const [selectedBotId, setSelectedBotId] = useState<string>('all');
  const [timeframe, setTimeframe] = useState<'H' | 'D' | 'M'>('D');

  const filteredBots = selectedBotId === 'all' ? bots : bots.filter(b => b.id === selectedBotId);
  const filteredTrades = selectedBotId === 'all' ? trades : trades.filter(tr => tr.botId === selectedBotId);

  const activeBotsCount = filteredBots.filter(b => b.status === 'ACTIVE').length;
  const totalPnl = filteredBots.reduce((acc, b) => acc + b.performance.totalPnl, 0);
  const totalTrades = filteredBots.reduce((acc, b) => acc + b.performance.trades, 0);
  const avgWinRate = filteredBots.length > 0
    ? filteredBots.reduce((acc, b) => acc + (b.performance.trades > 0 ? b.performance.winRate : 0), 0) / filteredBots.filter(b => b.performance.trades > 0).length || 0
    : 0;

  // Compute max drawdown dynamically from equity history
  let maxDrawdown = 0;
  let peak = equityData[0]?.value || 10000;
  for (const point of equityData) {
    if (point.value > peak) peak = point.value;
    const dd = ((peak - point.value) / peak) * 100;
    if (dd > maxDrawdown) maxDrawdown = dd;
  }

  // Calculate current total equity (balance + positions)
  const currentEquity = (Number(cashAvailable) || 0) + filteredBots.reduce((acc, b) => acc + (Number(b.performance.totalPnl) || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <MetricCard
          label={t('total_equity') || 'PatrimÃ´nio Total'}
          value={formatCurrency(currentEquity)}
          icon={<Wallet className="text-emerald-400" />}
          trend="Real-time"
          positive={true}
        />
        <MetricCard
          label={t('mon_pnl')}
          value={formatCurrency(totalPnl)}
          icon={<Zap className="text-cyan-400" />}
          trend={totalPnl > 0 ? `+${formatCurrency(totalPnl)} total` : totalPnl < 0 ? `-${formatCurrency(Math.abs(totalPnl))} total` : "No activity"}
          positive={totalPnl >= 0}
        />
        <MetricCard
          label={t('mon_winrate')}
          value={`${avgWinRate.toFixed(1)}%`}
          icon={<TrendingUp className="text-purple-400" />}
          trend="Avg Scalp"
          positive={avgWinRate > 50}
        />
        <MetricCard
          label={t('mon_drawdown')}
          value={`${maxDrawdown.toFixed(2)}%`}
          icon={<Shield className="text-rose-400" />}
          trend="Risk Limit: 5%"
          positive={maxDrawdown < 3}
        />
        <MetricCard
          label={t('mon_active_bots')}
          value={activeBotsCount.toString()}
          icon={<Cpu className="text-blue-400" />}
          trend={`${totalTrades} Total Trades`}
          positive={activeBotsCount > 0}
        />
      </div>

      {/* Bot Selector */}
      <div className="flex bg-slate-900/50 p-2 rounded-2xl border border-slate-800 overflow-x-auto scrollbar-hide gap-2">
        <button
          onClick={() => setSelectedBotId('all')}
          className={`px-6 py-3 rounded-xl font-black text-[10px] tracking-[0.2em] uppercase transition-all whitespace-nowrap flex items-center gap-2 ${selectedBotId === 'all' ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-900/20' : 'text-slate-500 hover:text-slate-300'}`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          {t('all_robots') || 'Todos os RobÃ´s'}
        </button>
        {bots.map(bot => (
          <button
            key={bot.id}
            onClick={() => setSelectedBotId(bot.id)}
            className={`px-6 py-3 rounded-xl font-black text-[10px] tracking-[0.2em] uppercase transition-all whitespace-nowrap flex items-center gap-2 border ${selectedBotId === bot.id ? 'bg-slate-800 border-cyan-500/50 text-cyan-400 shadow-lg' : 'bg-transparent border-transparent text-slate-500 hover:text-slate-300'}`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${bot.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
            {bot.name.includes(' / ') ? bot.name.split(' / ')[1] : bot.name}
          </button>
        ))}
      </div>



      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-8">
            <h3 className="font-bold flex items-center gap-2 text-cyan-400">
              <Activity className="w-5 h-5" /> {t('mon_equity')}
              {selectedBotId !== 'all' && <span className="text-[9px] text-slate-500 font-normal ml-2 uppercase tracking-widest">Global Context</span>}
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex bg-slate-950 p-1 rounded-xl border border-slate-800">
                {(['H', 'D', 'M'] as const).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-4 py-1.5 rounded-lg text-[10px] font-black tracking-widest transition-all ${timeframe === tf ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                  >
                    {tf === 'H' ? '1H' : tf === 'D' ? '1D' : '1M'}
                  </button>
                ))}
              </div>
              <span className="px-2 py-1 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded border border-emerald-500/20">REAL-TIME</span>
            </div>
          </div>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={equityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} domain={['dataMin - 500', 'dataMax + 500']} hide />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '12px' }}
                  itemStyle={{ color: '#22d3ee', fontWeight: 'bold' }}
                  formatter={(v: number) => [`$${v.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`, 'Equity']}
                />
                <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                  {equityData.map((entry, index) => {
                    const prev = equityData[index - 1]?.value ?? entry.value;
                    const isUp = entry.value >= prev;
                    const isLast = index === equityData.length - 1;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={isLast ? '#06b6d4' : isUp ? '#10b981' : '#f43f5e'}
                        opacity={isLast ? 1 : 0.7}
                      />
                    );
                  })}
                  <LabelList dataKey="value" position="top" fill="#94a3b8" fontSize={9} formatter={(v: number) => `$${(v / 1000).toFixed(1)}k`} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          {/* Chart Legend */}
          <div className="flex items-center gap-6 mt-4 pl-2">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-emerald-500/70" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Alta</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-rose-500/70" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Queda</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-sm bg-cyan-500" />
              <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">Atual</span>
            </div>
          </div>
        </div>

        <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
          <div className="p-6 border-b border-slate-800 bg-slate-900/50 font-bold flex items-center gap-2 text-purple-400">
            <Bot className="w-5 h-5" /> Active Operations
          </div>
          <div className="p-6 space-y-4">
            {filteredBots.filter(b => b.status === 'ACTIVE' || b.status === 'PAUSED').map(bot => (
              <div key={bot.id} className="flex flex-col gap-3 p-4 bg-slate-950 rounded-2xl border border-slate-800 relative group transition-all hover:border-cyan-500/30">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${bot.status === 'ACTIVE' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                    <span className="text-xs font-bold text-slate-200">
                      {bot.name.includes(' / ') ? bot.name.split(' / ')[1] : bot.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold ${bot.status === 'ACTIVE' ? 'text-cyan-500' : 'text-amber-500'}`}>
                      {bot.status === 'ACTIVE' ? t('mon_status_op') : t('mon_status_paused')}
                    </span>
                    {onToggleBot && (
                      <button
                        onClick={() => {
                          const newStatus = bot.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
                          onToggleBot(bot.id, newStatus);
                          if (newStatus === 'PAUSED') {
                            botService.pauseBot(bot.id);
                          } else {
                            // Ideally needs exchange logic to reconnect
                          }
                        }}
                        className={`p-1 rounded-md text-[8px] font-bold transition-all border ${bot.status === 'ACTIVE'
                          ? 'bg-amber-500/10 border-amber-500/30 text-amber-400 hover:bg-amber-500/20'
                          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20'
                          }`}
                      >
                        {bot.status === 'ACTIVE' ? 'PAUSAR' : 'RETOMAR'}
                      </button>
                    )}
                  </div>
                </div>
                <div className="flex justify-between items-end">
                  <div>
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Ativos</p>
                    <p className="text-sm font-bold text-slate-300">{(bot.config as any).assets?.join(', ') || 'N/A'}</p>
                  </div>
                  <div className="text-right">
                    <p className={`text-[9px] font-bold uppercase tracking-widest ${bot.performance.todayPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>P&L Hoje</p>
                    <p className={`text-sm font-bold ${bot.performance.todayPnl >= 0 ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {bot.performance.todayPnl >= 0 ? '+' : ''}{formatCurrency(bot.performance.todayPnl)}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-800">
                  <div className="text-center">
                    <p className="text-[8px] text-slate-600 uppercase font-bold">Trades</p>
                    <p className="text-xs font-bold text-slate-300">{bot.performance.trades}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] text-slate-600 uppercase font-bold">Win Rate</p>
                    <p className="text-xs font-bold text-cyan-400">{bot.performance.trades > 0 ? bot.performance.winRate.toFixed(0) : '0'}%</p>
                  </div>
                  <div className="text-center">
                    <p className="text-[8px] text-slate-600 uppercase font-bold">Loss Seq.</p>
                    <p className={`text-xs font-bold ${bot.performance.consecutiveLosses >= 2 ? 'text-rose-400' : 'text-slate-400'}`}>
                      {bot.performance.consecutiveLosses}
                    </p>
                  </div>
                </div>
              </div>
            ))}
            {filteredBots.filter(b => b.status === 'ACTIVE' || b.status === 'PAUSED').length === 0 && (
              <div className="p-8 text-center bg-slate-950/50 rounded-2xl border border-dashed border-slate-800">
                <Bot className="w-10 h-10 text-slate-700 mx-auto mb-2 opacity-20" />
                <p className="text-xs text-slate-600 font-bold uppercase tracking-widest">No Active Robots</p>
              </div>
            )}
          </div>
        </section>
      </div>

      <section className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50 font-bold flex items-center justify-between">
          <div className="flex items-center gap-2 text-cyan-400">
            <History className="w-5 h-5" /> {t('mon_history')}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[10px] font-bold text-slate-500">{filteredTrades.length} registros</span>
            {onClearHistory && filteredTrades.length > 0 && (
              <button
                onClick={onClearHistory}
                className="flex items-center gap-1.5 px-3 py-1 bg-rose-500/10 border border-rose-500/20 text-rose-500 hover:bg-rose-500/20 rounded-lg text-[10px] font-black tracking-widest transition-all"
              >
                <Trash2 className="w-3 h-3" />
                LIMPAR
              </button>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-800 bg-slate-950/50">
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('mon_col_time')}</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('mon_col_asset')}</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('mon_col_type')}</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('mon_col_price')}</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('mon_col_amount')}</th>
                <th className="p-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">{t('mon_col_result')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredTrades.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-600 font-bold uppercase text-xs tracking-widest">No history recorded for this selection</td>
                </tr>
              ) : filteredTrades.map(trade => (
                <tr key={trade.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="p-4 text-xs font-mono text-slate-400">{trade.timestamp}</td>
                  <td className="p-4 text-xs font-bold text-slate-200">{trade.asset}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-md text-[9px] font-bold ${trade.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'}`}>
                      {trade.type}
                    </span>
                  </td>
                  <td className="p-4 text-xs font-mono text-slate-300">{formatCurrency(trade.price)}</td>
                  <td className="p-4 text-xs font-mono text-slate-300">{trade.amount}</td>
                  <td className="p-4">
                    <span className={`text-xs font-bold ${trade.profit ? 'text-emerald-500' : 'text-rose-400'}`}>
                      {trade.result_usd != null ? (trade.result_usd >= 0 ? '+' : '') + formatCurrency(trade.result_usd) : '---'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};


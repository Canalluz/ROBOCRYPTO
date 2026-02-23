
import { SystemData, AnalysisResponse, PortfolioAnalysis, RiskAnalysis, NeuralCoreConfig } from "../types";
import { getAnalysis as getGeminiAnalysis, getPortfolioAnalysis as getGeminiPortfolioAnalysis, getRiskAnalysis as getGeminiRiskAnalysis } from "./gemini";

/**
 * Unified AI Analysis Service
 * Dispatches requests to the selected provider (Gemini or DeepSeek)
 */

export const getAIAnalysis = async (data: SystemData): Promise<AnalysisResponse> => {
    const config = data.neural_core;

    if (config.provider === 'MOCK') {
        return getMockAnalysis();
    }

    if (config.provider === 'GEMINI') {
        if (!config.geminiKey) throw new Error("Gemini API Key not configured. Please set it in Settings > Neural Core.");
        return getGeminiAnalysis(data, config.geminiKey);
    } else if (config.provider === 'OPENAI') {
        if (!config.openaiKey) throw new Error("OpenAI API Key not configured. Please set it in Settings > Neural Core.");
        return getOpenAIAnalysis(data, config);
    } else if (config.provider === 'ANTHROPIC') {
        if (!config.anthropicKey) throw new Error("Anthropic API Key not configured. Please set it in Settings > Neural Core.");
        return getAnthropicAnalysis(data, config);
    } else {
        if (!config.deepseekKey) throw new Error("DeepSeek API Key not configured. Please set it in Settings > Neural Core.");
        return getDeepSeekAnalysis(data, config);
    }
};

export const getAIPortfolioAnalysis = async (data: SystemData): Promise<PortfolioAnalysis> => {
    const config = data.neural_core;

    if (config.provider === 'MOCK') {
        return getMockPortfolioAnalysis();
    }

    if (config.provider === 'GEMINI') {
        if (!config.geminiKey) throw new Error("Gemini API Key not configured. Please set it in Settings > Neural Core.");
        return getGeminiPortfolioAnalysis(data, config.geminiKey);
    } else if (config.provider === 'OPENAI') {
        if (!config.openaiKey) throw new Error("OpenAI API Key not configured. Please set it in Settings > Neural Core.");
        return getOpenAIPortfolioAnalysis(data, config);
    } else if (config.provider === 'ANTHROPIC') {
        if (!config.anthropicKey) throw new Error("Anthropic API Key not configured. Please set it in Settings > Neural Core.");
        return getAnthropicPortfolioAnalysis(data, config);
    } else {
        if (!config.deepseekKey) throw new Error("DeepSeek API Key not configured. Please set it in Settings > Neural Core.");
        return getDeepSeekPortfolioAnalysis(data, config);
    }
};

export const getAIRiskAnalysis = async (data: SystemData): Promise<RiskAnalysis> => {
    const config = data.neural_core;

    if (config.provider === 'MOCK') {
        return getMockRiskAnalysis();
    }

    if (config.provider === 'GEMINI') {
        if (!config.geminiKey) throw new Error("Gemini API Key not configured. Please set it in Settings > Neural Core.");
        return getGeminiRiskAnalysis(data, config.geminiKey);
    } else if (config.provider === 'OPENAI') {
        if (!config.openaiKey) throw new Error("OpenAI API Key not configured. Please set it in Settings > Neural Core.");
        return getOpenAIRiskAnalysis(data, config);
    } else if (config.provider === 'ANTHROPIC') {
        if (!config.anthropicKey) throw new Error("Anthropic API Key not configured. Please set it in Settings > Neural Core.");
        return getAnthropicRiskAnalysis(data, config);
    } else {
        if (!config.deepseekKey) throw new Error("DeepSeek API Key not configured. Please set it in Settings > Neural Core.");
        return getDeepSeekRiskAnalysis(data, config);
    }
};

// --- MOCK Implementation (Simulated AI) ---

const getMockAnalysis = async (): Promise<AnalysisResponse> => {
    return {
        timestamp_analysis: new Date().toISOString(),
        portfolio_assessment: {
            health_score: 85,
            required_actions: ["Manter posições atuais", "Aguardar confirmação de tendência em SOL"],
            current_var: 1.5,
            projected_var: 1.4
        },
        recommendations: [
            {
                id: "mock-1",
                asset: "LOBOUSDT",
                timeframe: "1H",
                action: "COMPRA",
                type: "SPOT",
                confidence: 0.82,
                entry_main: 0.85,
                stop_loss: 0.80,
                take_profit_1: 0.92,
                take_profit_2: 0.98,
                take_profit_3: 1.10,
                position_size: "5%",
                risk_per_trade: "1%",
                risk_reward_ratio: "1:3",
                technical_justification: ["RSI em zona de acumulação", "Suporte testado com volume"],
                quantitative_justification: { expected_value: "+15%", success_probability: "68%", var_impact: "Baixo" },
                catalysts: ["Aumento de volume social"],
                monitoring_metrics: ["Volume 24h", "Order flow"],
                validity_hours: 12
            }
        ],
        risk_alerts: [],
        executive_summary: "Análise simulada (MOCK). O mercado apresenta viés de alta para os ativos monitorados. Recomenda-se cautela em resistências próximas.",
        next_review: new Date(Date.now() + 3600000).toISOString()
    };
};

const getMockPortfolioAnalysis = async (): Promise<PortfolioAnalysis> => {
    return {
        report_id: "mock-p-1",
        executive_summary: { portfolio_health: 80, risk_level: "Médio", recommended_actions: 1, urgent_alerts: 0 },
        performance_metrics: { total_return_ytd: 12, sharpe_ratio: 1.8, max_drawdown_30d: 4, var_95_1d: 1.2, correlation_to_benchmark: 0.85, alpha: 0.05 },
        rebalancing_trades: [],
        risk_alerts: [],
        projections: { base_case_30d_return: 5, confidence_interval: [2, 8], expected_max_drawdown: 3, liquidity_profile: "Alta" },
        optimization_score: { diversification: 85, risk_adjusted_return: 78, liquidity: 90, tax_efficiency: 95, overall_score: 87 },
        next_review: { scheduled_time: new Date().toISOString(), triggers: ["Volatilidade > 5%"] }
    };
};

const getMockRiskAnalysis = async (): Promise<RiskAnalysis> => {
    return {
        timestamp: new Date().toISOString(),
        risk_score: 35,
        status: 'OK',
        primary_metrics: { var_95_1d_usd: 1500, var_percentage: 1.5, expected_shortfall: 2200, current_drawdown: 1.2, liquidity_score: 92 },
        critical_alerts: [],
        mitigation_actions: [],
        stress_scenarios: { market_down_20: -15000, volatility_spike_50: -5000, liquidity_crisis: -8000 },
        next_check: new Date().toISOString()
    };
};

// --- DeepSeek Implementation (REST API) ---

const DEEPSEEK_BASE_URL = "https://api.deepseek.com/v1";

const callDeepSeek = async (prompt: string, config: NeuralCoreConfig, systemPrompt: string) => {
    const response = await fetch(`${DEEPSEEK_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${config.deepseekKey}`
        },
        body: JSON.stringify({
            model: config.deepseek_model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            temperature: config.temperature,
            max_tokens: config.max_tokens,
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`DeepSeek Error: ${err.error?.message || response.statusText}`);
    }

    const result = await response.json();
    return JSON.parse(result.choices[0].message.content);
};

const getDeepSeekAnalysis = async (data: SystemData, config: NeuralCoreConfig): Promise<AnalysisResponse> => {
    const systemPrompt = `Você é o sistema central de inteligência artificial "Neural Core".
    Analise os dados de mercado e gere recomendações de trading rigorosas.
    Regras: Sharpe max, drawdown < 8%, alavancagem max 3x, exposição liquida max 60%.
    Retorne JSON estrito formato AnalysisResponse.`;

    const prompt = `Analise os dados: ${JSON.stringify(data)}.`;
    return callDeepSeek(prompt, config, systemPrompt);
};

const getDeepSeekPortfolioAnalysis = async (data: SystemData, config: NeuralCoreConfig): Promise<PortfolioAnalysis> => {
    const systemPrompt = `Você é o módulo de Gestão de Portfólio. 
    Analise alocação, rebalanceamento e vulnerabilidades. 
    VAR < 2.5%, alocação max 20% por ativo, liquidez min 10%.
    Retorne JSON estrito formato PortfolioAnalysis.`;

    const prompt = `Analise o portfólio: ${JSON.stringify(data)}.`;
    return callDeepSeek(prompt, config, systemPrompt);
};

const getDeepSeekRiskAnalysis = async (data: SystemData, config: NeuralCoreConfig): Promise<RiskAnalysis> => {
    const systemPrompt = `Você é o sistema de Risk Analytics institucional. 
    Seu objetivo é quantificar riscos críticos: VaR, Expected Shortfall, Stress Tests.
    Alertar concentrações > 15%, Beta > 1.5, Correlação > 0.8.
    Retorne JSON estrito formato RiskAnalysis.`;

    const prompt = `Analise o risco para: ${JSON.stringify(data)}.`;
    return callDeepSeek(prompt, config, systemPrompt);
};

// --- OpenAI Implementation ---

const callOpenAI = async (prompt: string, config: NeuralCoreConfig, systemPrompt: string) => {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${config.openaiKey}`
        },
        body: JSON.stringify({
            model: "gpt-4o", // Defaulting to 4o
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: prompt }
            ],
            temperature: config.temperature,
            max_tokens: config.max_tokens,
            response_format: { type: "json_object" }
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`OpenAI Error: ${err.error?.message || response.statusText}`);
    }

    const result = await response.json();
    return JSON.parse(result.choices[0].message.content);
};

const getOpenAIAnalysis = async (data: SystemData, config: NeuralCoreConfig): Promise<AnalysisResponse> => {
    const systemPrompt = `You are the central AI system "Neural Core". Analyze market data and generate rigorous trading recommendations. Rules: Max Sharpe, drawdown < 8%, max 3x leverage, max 60% net exposure. Return strictly JSON in AnalysisResponse format.`;
    const prompt = `Analyze data: ${JSON.stringify(data)}.`;
    return callOpenAI(prompt, config, systemPrompt);
};

const getOpenAIPortfolioAnalysis = async (data: SystemData, config: NeuralCoreConfig): Promise<PortfolioAnalysis> => {
    const systemPrompt = `You are the Portfolio Management module. Analyze allocation, rebalancing, and vulnerabilities. VAR < 2.5%, max 20% allocation per asset, min 10% liquidity. Return strictly JSON in PortfolioAnalysis format.`;
    const prompt = `Analyze portfolio: ${JSON.stringify(data)}.`;
    return callOpenAI(prompt, config, systemPrompt);
};

const getOpenAIRiskAnalysis = async (data: SystemData, config: NeuralCoreConfig): Promise<RiskAnalysis> => {
    const systemPrompt = `You are the institutional Risk Analytics system. Quantify critical risks: VaR, Expected Shortfall, Stress Tests. Alert on concentrations > 15%, Beta > 1.5, Correlation > 0.8. Return strictly JSON in RiskAnalysis format.`;
    const prompt = `Analyze risk for: ${JSON.stringify(data)}.`;
    return callOpenAI(prompt, config, systemPrompt);
};

// --- Anthropic Implementation ---

const callAnthropic = async (prompt: string, config: NeuralCoreConfig, systemPrompt: string) => {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "x-api-key": config.anthropicKey,
            "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
            model: "claude-3-5-sonnet-20240620",
            max_tokens: config.max_tokens || 1000,
            system: systemPrompt,
            messages: [
                { role: "user", content: prompt + " Respond ONLY with a JSON object." }
            ],
            temperature: config.temperature
        })
    });

    if (!response.ok) {
        const err = await response.json();
        throw new Error(`Anthropic Error: ${err.error?.message || response.statusText}`);
    }

    const result = await response.json();
    const content = result.content[0].text;
    return JSON.parse(content);
};

const getAnthropicAnalysis = async (data: SystemData, config: NeuralCoreConfig): Promise<AnalysisResponse> => {
    const systemPrompt = `You are the central AI system "Neural Core". Analyze market data and generate rigorous trading recommendations. Rules: Max Sharpe, drawdown < 8%, max 3x leverage, max 60% net exposure. Return strictly JSON in AnalysisResponse format.`;
    const prompt = `Analyze data: ${JSON.stringify(data)}.`;
    return callAnthropic(prompt, config, systemPrompt);
};

const getAnthropicPortfolioAnalysis = async (data: SystemData, config: NeuralCoreConfig): Promise<PortfolioAnalysis> => {
    const systemPrompt = `You are the Portfolio Management module. Analyze allocation, rebalancing, and vulnerabilities. VAR < 2.5%, max 20% allocation per asset, min 10% liquidity. Return strictly JSON in PortfolioAnalysis format.`;
    const prompt = `Analyze portfolio: ${JSON.stringify(data)}.`;
    return callAnthropic(prompt, config, systemPrompt);
};

const getAnthropicRiskAnalysis = async (data: SystemData, config: NeuralCoreConfig): Promise<RiskAnalysis> => {
    const systemPrompt = `You are the institutional Risk Analytics system. Quantify critical risks: VaR, Expected Shortfall, Stress Tests. Alert on concentrations > 15%, Beta > 1.5, Correlation > 0.8. Return strictly JSON in RiskAnalysis format.`;
    const prompt = `Analyze risk for: ${JSON.stringify(data)}.`;
    return callAnthropic(prompt, config, systemPrompt);
};

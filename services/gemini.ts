
import { GoogleGenAI, Type } from "@google/genai";
import { SystemData, AnalysisResponse, PortfolioAnalysis, RiskAnalysis } from "../types";

const getAIClient = (apiKey: string) => new GoogleGenAI({ apiKey });

export const getAnalysis = async (data: SystemData, apiKey: string): Promise<AnalysisResponse> => {
  if (!apiKey) throw new Error("API Key not configured. Please set your Gemini API Key in Settings > AI Core.");
  const ai = getAIClient(apiKey);
  const systemInstruction = `
    Você é o sistema central de inteligência artificial do fundo institucional "Quantum Capital".
    Analise os dados de mercado e gere recomendações de trading rigorosas.
    Regras: Sharpe max, drawdown < 8%, alavancagem max 3x, exposição liquida max 60%.
    Retorne JSON estrito.
  `;

  const prompt = `Analise os dados: ${JSON.stringify(data)}. Retorne um AnalysisResponse JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: { systemInstruction, responseMimeType: "application/json", temperature: 0.1 },
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Analysis Error:", error);
    throw error;
  }
};

export const getPortfolioAnalysis = async (data: SystemData, apiKey: string): Promise<PortfolioAnalysis> => {
  if (!apiKey) throw new Error("API Key not configured. Please set your Gemini API Key in Settings > AI Core.");
  const ai = getAIClient(apiKey);
  const systemInstruction = `
    Você é o módulo de Gestão de Portfólio do CryptoQuantum. 
    Analise alocação, rebalanceamento e vulnerabilidades. 
    VAR < 2.5%, alocação max 20% por ativo, liquidez min 10%.
    Retorne JSON estrito.
  `;

  const prompt = `Analise o portfólio: ${JSON.stringify(data)}. Retorne um PortfolioAnalysis JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: { systemInstruction, responseMimeType: "application/json", temperature: 0.1 },
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Portfolio Error:", error);
    throw error;
  }
};

export const getRiskAnalysis = async (data: SystemData, apiKey: string): Promise<RiskAnalysis> => {
  if (!apiKey) throw new Error("API Key not configured. Please set your Gemini API Key in Settings > AI Core.");
  const ai = getAIClient(apiKey);
  const systemInstruction = `
    Você é o sistema de Risk Analytics institucional. 
    Seu objetivo é quantificar riscos críticos: VaR, Expected Shortfall, Stress Tests.
    Alertar concentrações > 15%, Beta > 1.5, Correlação > 0.8.
    Retorne JSON estrito no formato RiskAnalysis.
  `;

  const prompt = `Analise o risco para: ${JSON.stringify(data)}. Retorne um RiskAnalysis JSON.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
      config: { systemInstruction, responseMimeType: "application/json", temperature: 0.1 },
    });
    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Risk Error:", error);
    throw error;
  }
};

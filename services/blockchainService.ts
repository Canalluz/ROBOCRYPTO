
import { WalletTrace, TraceabilityTransaction, NeuralCoreConfig } from '../types';

export const blockchainService = {
  /**
   * Mock Wallets for the "Wow" factor
   */
  getMockWallets: (): WalletTrace[] => [
    {
      id: 'mock-1',
      address: '0x742d35Cc6634C0532925a3b844Bc454e4438f44e',
      blockchain: 'Ethereum',
      age: '4 anos, 2 meses',
      type: 'Whale',
      score: 92,
      performance: {
        totalRoi: 482.5,
        netProfitUsd: 1245000,
        roi7d: 12.4,
        roi30d: 34.2,
        roi90d: 112.5,
        winRate: 78.5,
        profitFactor: 3.4
      },
      risk: {
        maxDrawdown: 14.5,
        volatility: 9.2,
        maxLossTrade: 4500,
        exposureAssets: { 'ETH': 45, 'LINK': 20, 'WBTC': 35 }
      },
      activity: {
        tradesPerDay: 2.4,
        frequency: 'Swing',
        avgPositionTime: '12 dias',
        lastActivity: '7 min atrás'
      },
      assets: {
        topTokens: ['ETH', 'LINK', 'WBTC', 'AAVE', 'UNI'],
        profitPerToken: { 'ETH': 450000, 'LINK': 120000, 'WBTC': 320000, 'USDT': 15000 },
        frequencyPerToken: { 'ETH': 142, 'LINK': 56, 'WBTC': 24, 'USDC': 128 }
      },
      behavior: {
        buyTopBottom: 'Fundo',
        dca: true,
        trendFollower: true,
        earlyEntry: true
      },
      transactions: [
        { id: 'tx-1', timestamp: new Date().toISOString(), token: 'ETH', type: 'BUY', priceEntry: 3240.5, amount: '45.2', resultUsd: 0, profit: true },
        { id: 'tx-2', timestamp: new Date(Date.now() - 3600000).toISOString(), token: 'LINK', type: 'SELL', priceEntry: 18.2, priceExit: 22.4, amount: '1250', resultUsd: 5250, profit: true },
        { id: 'tx-3', timestamp: new Date(Date.now() - 86400000).toISOString(), token: 'WBTC', type: 'BUY', priceEntry: 64200, amount: '1.2', resultUsd: 0, profit: true }
      ]
    },
    {
      id: 'mock-2',
      address: '0x1ce4e3752f984ca3508492040d662781d265d3a0',
      blockchain: 'Ethereum',
      age: '1 ano, 6 meses',
      type: 'Trader Ativo',
      score: 85,
      performance: {
        totalRoi: 215.8,
        netProfitUsd: 458000,
        roi7d: -2.1,
        roi30d: 14.5,
        roi90d: 45.8,
        winRate: 64.2,
        profitFactor: 2.1
      },
      risk: {
        maxDrawdown: 22.4,
        volatility: 14.8,
        maxLossTrade: 12000,
        exposureAssets: { 'PEPE': 15, 'SHIB': 10, 'ETH': 75 }
      },
      activity: {
        tradesPerDay: 18.2,
        frequency: 'Scalper',
        avgPositionTime: '45 min',
        lastActivity: '14 seg atrás'
      },
      assets: {
        topTokens: ['PEPE', 'SHIB', 'ETH', 'MOG', 'FLOKI'],
        profitPerToken: { 'PEPE': 185000, 'SHIB': 45000, 'ETH': 142000, 'MOG': 12000 },
        frequencyPerToken: { 'PEPE': 1240, 'SHIB': 850, 'ETH': 420, 'USDT': 1800 }
      },
      behavior: {
        buyTopBottom: 'Neutro',
        dca: false,
        trendFollower: true,
        earlyEntry: true
      },
      transactions: [
        { id: 'tx-4', timestamp: new Date().toISOString(), token: 'PEPE', type: 'SELL', priceEntry: 0.0000142, priceExit: 0.0000158, amount: '450000000', resultUsd: 720, profit: true },
        { id: 'tx-5', timestamp: new Date(Date.now() - 600000).toISOString(), token: 'SHIB', type: 'BUY', priceEntry: 0.0000284, amount: '120000000', resultUsd: 0, profit: false }
      ]
    },
    {
      id: 'mock-3',
      address: '0x00000000219ab540356cbb839cbe05303d7705fa', // Beacon Deposit
      blockchain: 'Multi-Chain',
      age: '3 anos, 11 meses',
      type: 'Institutional',
      score: 98,
      performance: {
        totalRoi: 1240.2,
        netProfitUsd: 42500000,
        roi7d: 0.5,
        roi30d: 4.2,
        roi90d: 18.4,
        winRate: 94.2,
        profitFactor: 8.5
      },
      risk: {
        maxDrawdown: 4.2,
        volatility: 2.1,
        maxLossTrade: 500000,
        exposureAssets: { 'ETH': 100 }
      },
      activity: {
        tradesPerDay: 0.1,
        frequency: 'Position',
        avgPositionTime: 'Indeterminado',
        lastActivity: '2 dias atrás'
      },
      assets: {
        topTokens: ['ETH'],
        profitPerToken: { 'ETH': 42500000 },
        frequencyPerToken: { 'ETH': 1 }
      },
      behavior: {
        buyTopBottom: 'Fundo',
        dca: false,
        trendFollower: false,
        earlyEntry: true
      },
      transactions: [
        { id: 'tx-inst-1', timestamp: new Date().toISOString(), token: 'ETH', type: 'BUY', priceEntry: 15.2, amount: '1000000', resultUsd: 0, profit: true }
      ]
    }
  ],

  /**
   * Real API Fetch Logic (Placeholders for now)
   */
  fetchWalletTrace: async (address: string, config: NeuralCoreConfig): Promise<WalletTrace> => {
    // Determine if keys are present
    const hasEtherscan = !!config.etherscanKey;
    const hasCovalent = !!config.covalentKey;

    if (!hasEtherscan && !hasCovalent) {
      // Fallback to mock for development
      console.warn("Using mock data: No API keys configured for Traceability.");
      return blockchainService.getMockWallets()[0];
    }

    try {
      // Logic for Etherscan (Transactions & Balance)
      // Logic for Covalent (Portfolio & Historical Analytics)
      
      // For now, return a mock that matches the address
      const mock = blockchainService.getMockWallets().find(w => w.address.toLowerCase() === address.toLowerCase());
      return mock || blockchainService.getMockWallets()[0];
    } catch (error) {
      console.error("Blockchain Service Error:", error);
      throw error;
    }
  },

  calculateScore: (wallet: WalletTrace): number => {
    // Scoring logic (0-100)
    // Performance: 40% (Winrate, ROI)
    // Risk: 30% (Drawdown, Volatility)
    // Activity: 20% (Consistency, Frequency)
    // Behavior: 10% (Pattern Recognition)
    
    const perfScore = (wallet.performance.winRate * 0.4) + (Math.min(wallet.performance.roi30d, 100) * 0.4);
    const riskScore = (100 - wallet.risk.maxDrawdown) * 0.3;
    const actScore = (wallet.activity.tradesPerDay > 0 ? 20 : 0);
    
    return Math.min(Math.round(perfScore + riskScore + actScore), 100);
  }
};


const fs = require('fs');
const path = 'c:/Users/User/Documents/APP SOFTWARE/APPPC/TRADE/App.tsx';

let content = fs.readFileSync(path, 'utf8');

// The strategy here is to find the AssetFactoryView component and replace its entire return statement correctly.
// We'll search for the start of the return statement in AssetFactoryView and the end of the component.

const componentStart = content.indexOf('const AssetFactoryView');
const returnStart = content.indexOf('return (', componentStart);
const componentEnd = content.indexOf('export default App;', componentStart);

// We need to find the last }; before export default App;
const closingBrace = content.lastIndexOf('};', componentEnd);

if (componentStart !== -1 && returnStart !== -1 && closingBrace !== -1) {
    const head = content.substring(0, returnStart);
    const tail = content.substring(closingBrace);

    const newReturn = `return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col md:flex-row gap-6 items-start justify-between">
        <div className="flex border-b border-slate-800 gap-8 overflow-x-auto whitespace-nowrap scrollbar-hide flex-1">
          <TabBtn label="Token Lab Generator" active={activeTab === 'generator'} onClick={() => setActiveTab('generator')} icon={<Cpu className="w-4 h-4" />} />
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
                  className="w-full bg-slate-950 border border-slate-800 px-4 py-3 rounded-xl font-bold text-slate-100 outline-none focus:border-purple-500/50"
                >
                  <option value="BSC">Binance Smart Chain (BSC)</option>
                  <option value="ETH">Ethereum (ETH)</option>
                  <option value="BTC">Bitcoin (BTC) - Taproot/BRC20</option>
                  <option value="POLYGON">Polygon</option>
                  <option value="AVAX">Avalanche</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{t('token_logo')}</label>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-center overflow-hidden">
                    {tokenConfig.logo ? <img src={tokenConfig.logo} className="w-full h-full object-cover" /> : <Plus className="w-5 h-5 text-slate-700" />}
                  </div>
                  <label className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-center text-xs font-bold transition-all border border-slate-700 cursor-pointer">
                    {t('choose_image')}
                    <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                  </label>
                </div>
              </div>

              <div className="pt-4 flex flex-col gap-3">
                <button
                  onClick={deploySmartContract}
                  disabled={isDeploying}
                  className={\`w-full py-4 rounded-xl font-black text-slate-950 transition-all flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] \${isDeploying
                    ? 'bg-slate-700 cursor-not-allowed opacity-50'
                    : 'bg-gradient-to-r from-cyan-400 to-purple-400 hover:from-cyan-300 hover:to-purple-300 shadow-cyan-900/30'
                    }\`}
                >
                  {isDeploying ? (
                    <>
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      DIGITALIZANDO...
                    </>
                  ) : (
                    <>
                      <Zap className="w-5 h-5 fill-current" />
                      {tokenConfig.chain === 'BTC' ? 'Initiate Bitcoin Inscription' :
                        tokenConfig.chain === 'SOL' ? 'Initiate Solana Deployment' :
                          'Deploy Smart Contract'}
                    </>
                  )}
                </button>

                {gasFee && (
                  <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-500 uppercase tracking-widest">Est. Gas Fee</span>
                    <span className="text-sm font-black text-emerald-400">{gasFee}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-slate-950 border border-slate-800 rounded-3xl p-1 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
              <div className="flex items-center gap-2">
                <FileCode className={\`w-4 h-4 \${tokenConfig.chain === 'BTC' ? 'text-orange-400' :
                  tokenConfig.chain === 'SOL' ? 'text-teal-400' :
                    tokenConfig.chain === 'ETH' ? 'text-indigo-400' :
                      tokenConfig.chain === 'POLYGON' ? 'text-purple-400' :
                        'text-purple-400'
                  }\`} />
                <span className="text-xs font-bold text-slate-300">
                  {tokenConfig.chain === 'BTC' ? 'brc20-manifest.json' :
                    tokenConfig.chain === 'SOL' ? 'lib.rs (Anchor)' :
                      tokenConfig.chain === 'POLYGON' ? 'SimpleUtilityToken.sol (Polygon)' :
                        tokenConfig.chain === 'AVAX' ? 'SimpleUtilityToken.sol (Avalanche)' :
                          'SimpleUtilityToken.sol'}
                </span>
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(generatedCode);
                  showModal('SUCCESS',
                    language === 'pt' ? 'Código Copiado' : 'Code Copied',
                    language === 'pt' ? 'O código fonte foi copiado para a área de transferência.' : 'The source code has been copied to the clipboard.'
                  );
                }}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-bold rounded-lg transition-all border border-slate-700 flex items-center gap-2"
              >
                <Save className="w-3 h-3" /> {t('copy_code')}
              </button>
            </div>
            <pre className={\`p-8 text-[11px] font-mono \${tokenConfig.chain === 'BTC' ? 'text-orange-500/80' :
              tokenConfig.chain === 'SOL' ? 'text-teal-500/80' :
                tokenConfig.chain === 'ETH' ? 'text-indigo-500/80' :
                  tokenConfig.chain === 'POLYGON' ? 'text-purple-500/80' :
                    tokenConfig.chain === 'AVAX' ? 'text-red-500/80' :
                      'text-cyan-500/80'
              } overflow-auto max-h-[500px] scrollbar-thin\`}>
              {generatedCode}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
`;

    fs.writeFileSync(path, head + newReturn + tail, 'utf8');
    console.log('Successfully repaired App.tsx');
} else {
    console.error('Could not find markers', { componentStart, returnStart, closingBrace });
}

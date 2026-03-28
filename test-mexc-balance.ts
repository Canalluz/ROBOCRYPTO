import { getBalance } from './server/exchanges/mexc.js';

async function testBalance() {
   try {
      const bal = await getBalance("mx0vglx73gnNfwgSE7", "6e19dfc6a212425883a5cb5676edb10c");
      console.log('Balance:', bal);
   } catch(e: any) {
      console.log('Error:', e.message, e.response?.data);
   }
}
testBalance();

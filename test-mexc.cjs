const axios = require('axios');
const crypto = require('crypto');

const apiKey = 'mx0vglx73gnNfwgSE7';
const secret = '6e19dfc6a212425883a5cb5676edb10c';

async function test() {
    try {
        const resTSStr = await axios.get('https://api.mexc.com/api/v3/time');
        const ts = resTSStr.data.serverTime;
        const q = 'recvWindow=60000&timestamp=' + ts;
        const sig = crypto.createHmac('sha256', secret).update(q).digest('hex');
        const res = await axios.get('https://api.mexc.com/api/v3/account', {
            params: { recvWindow: 60000, timestamp: ts, signature: sig },
            headers: { 'X-MEXC-APIKEY': apiKey }
        });
        console.log(JSON.stringify(res.data, null, 2));
    } catch (e) {
        console.error(e.response?.data || e.message);
    }
}
test();

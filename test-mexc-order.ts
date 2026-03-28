import axios from 'axios';
import crypto from 'crypto';

const BASE_URL = 'https://api.mexc.com';

function sign(queryString: string, secret: string): string {
    return crypto.createHmac('sha256', secret).update(queryString).digest('hex');
}

async function testOrder() {
    const apiKey = "mx0vglx73gnNfwgSE7";
    const secret = "6e19dfc6a212425883a5cb5676edb10c";
    const symbol = "TAIUSDT";
    
    try {
        const timeRes = await axios.get(`${BASE_URL}/api/v3/time`);
        const timestamp = timeRes.data.serverTime.toString();
        
        const paramsMap: Record<string, string> = {
            recvWindow: '10000',
            side: 'BUY',
            symbol,
            timestamp,
            type: 'MARKET',
            quoteOrderQty: '6.00'
        };

        const queryString = Object.keys(paramsMap)
            .sort()
            .map(k => `${k}=${paramsMap[k]}`)
            .join('&');

        const signature = sign(queryString, secret);
        // USE /api/v3/order/test for dry run
        const finalUrl = `${BASE_URL}/api/v3/order/test?${queryString}&signature=${signature}`;

        const res = await fetch(finalUrl, {
            method: 'POST',
            headers: {
                'X-MEXC-APIKEY': apiKey,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({})
        });

        if (!res.ok) {
            let errStr = '';
            try {
                const errObj = await res.json();
                errStr = errObj.msg || JSON.stringify(errObj);
            } catch {
                errStr = await res.text();
            }
            throw new Error(errStr || `HTTP Error ${res.status}`);
        }

        console.log("Dry run success:", await res.json());

    } catch (e: any) {
        console.error("Order error:", e.message);
    }
}
testOrder();

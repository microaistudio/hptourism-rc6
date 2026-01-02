
import express from 'express';
import { CCAvenueUtil } from '../utils/ccavenue';
import { logger } from '../logger';

export function createCCAvenueTestRouter() {
    const router = express.Router();
    const testLog = logger.child({ module: 'ccavenue-test' });

    // Endpoint to encrypt data (for form submission or API calls)
    router.post('/encrypt', (req, res) => {
        try {
            const { workingKey, data } = req.body;
            if (!workingKey || !data) {
                return res.status(400).json({ error: 'Missing workingKey or data' });
            }

            // If data is an object, convert to query string (standard for CCAvenue)
            let plainText = data;
            if (typeof data === 'object') {
                plainText = CCAvenueUtil.jsonToQueryString(data);
            }

            const encRequest = CCAvenueUtil.encrypt(plainText, workingKey);
            res.json({ encRequest });
        } catch (error: any) {
            testLog.error('Encryption failed', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Endpoint to decrypt data
    router.post('/decrypt', (req, res) => {
        try {
            const { workingKey, encResponse } = req.body;
            if (!workingKey || !encResponse) {
                return res.status(400).json({ error: 'Missing workingKey or encResponse' });
            }

            const decrypted = CCAvenueUtil.decrypt(encResponse, workingKey);
            // Try to parse if it looks like JSON or QueryString
            let parsed = decrypted;
            try {
                if (decrypted.trim().startsWith('{') || decrypted.trim().startsWith('[')) {
                    parsed = JSON.parse(decrypted);
                } else if (decrypted.includes('=')) {
                    parsed = CCAvenueUtil.queryStringToJson(decrypted) as any;
                }
            } catch (e) {
                // Keep as string
            }

            res.json({ decrypted, parsed });
        } catch (error: any) {
            testLog.error('Decryption failed', error);
            res.status(500).json({ error: error.message });
        }
    });

    // Handle Callback from CCAvenue (Form Post)
    // The frontend should provide a redirect_url pointing here: /api/ccavenue/test/callback?workingKey=...
    // Note: Passing workingKey in URL is not secure for prod, but handy for this dev tool.
    // Ideally, we store the pending transaction in DB/Session to retrieve the key.
    router.post('/callback', (req, res) => {
        try {
            const { encResp, orderNo } = req.body; // CCAvenue posts 'encResp' and sometimes 'orderNo'
            const { workingKey, frontendUrl } = req.query;

            testLog.info({ body: req.body, query: req.query }, "Received CCAvenue Callback");

            if (!encResp || !workingKey) {
                return res.status(400).send('Missing encResp or workingKey');
            }

            const decrypted = CCAvenueUtil.decrypt(encResp, String(workingKey));

            // Redirect back to frontend with the result
            // We'll base64 encode the result to pass it locally
            const resultBase64 = Buffer.from(decrypted).toString('base64');
            const targetUrl = (frontendUrl as string) || '/payment/ccavenue-test';

            res.redirect(`${targetUrl}?response=${resultBase64}`);
        } catch (error: any) {
            testLog.error('Callback processing failed', error);
            res.status(500).send('Callback Error: ' + error.message);
        }
    });

    return router;
}

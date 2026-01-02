
import crypto from 'crypto';

export class CCAvenueUtil {
    // CCAvenue standard IV
    private static IV = Buffer.from('\x00\x01\x02\x03\x04\x05\x06\x07\x08\x09\x0a\x0b\x0c\x0d\x0e\x0f', 'binary');

    static encrypt(plainText: string, workingKey: string): string {
        try {
            const key = crypto.createHash('md5').update(workingKey).digest();
            const cipher = crypto.createCipheriv('aes-128-cbc', key, CCAvenueUtil.IV);
            let encoded = cipher.update(plainText, 'utf8', 'hex');
            encoded += cipher.final('hex');
            return encoded;
        } catch (error) {
            console.error('CCAvenue Encryption Error:', error);
            throw new Error('Encryption failed');
        }
    }

    static decrypt(encryptedText: string, workingKey: string): string {
        try {
            const key = crypto.createHash('md5').update(workingKey).digest();
            const decipher = crypto.createDecipheriv('aes-128-cbc', key, CCAvenueUtil.IV);
            let decoded = decipher.update(encryptedText, 'hex', 'utf8');
            decoded += decipher.final('utf8');
            return decoded;
        } catch (error) {
            console.error('CCAvenue Decryption Error:', error);
            throw new Error('Decryption failed');
        }
    }

    // Helper to format query string for CCAvenue
    static jsonToQueryString(json: Record<string, string | number>): string {
        return Object.keys(json)
            .map(key => `${key}=${json[key]}`)
            .join('&');
    }

    // Helper to parse response string (k=v&k2=v2)
    static queryStringToJson(qs: string): Record<string, string> {
        const result: Record<string, string> = {};
        const pairs = qs.split('&');
        for (const pair of pairs) {
            const [key, value] = pair.split('=');
            if (key) {
                result[key] = value || '';
            }
        }
        return result;
    }
}

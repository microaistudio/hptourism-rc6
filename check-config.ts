
import { himkoshConfig, getHimKoshConfig } from '../server/himkosh/config';
import { config } from '@shared/config';

console.log('--- Raw Config from @shared/config ---');
console.log('HIMKOSH_PAYMENT_URL:', config.himkosh.paymentUrl);

console.log('--- Resolved HimKosh Config ---');
const resolved = getHimKoshConfig();
console.log('Payment URL:', resolved.paymentUrl);
console.log('Merchant Code:', resolved.merchantCode);

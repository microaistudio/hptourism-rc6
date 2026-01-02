
import { config } from './shared/config';

console.log('--- Config Check RC5DEV1 ---');
console.log('HIMKOSH_PAYMENT_URL:', config.himkosh.paymentUrl);
console.log('HIMKOSH_RETURN_URL:', config.himkosh.returnUrl);
console.log('HIMKOSH_TEST_MODE:', config.himkosh.testMode);

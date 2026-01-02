# CCAvenue Integration Notes

## Test Interface
A test interface has been created at: `[Your Domain]/payment/ccavenue-test`

Features:
- **Encryption Tool**: Generates `encRequest` for initiating payments.
- **Decryption Tool**: Decrypts `encResponse` from CCAvenue.
- **Payment Launcher**: Simulates a form POST to CCAvenue Sandbox/Production.
- **Callback Handler**: Automatically decrypts responses sent to the callback URL.

## What is Needed for Full Integration

1.  **Credentials**:
    You must obtain the following from the CCAvenue Merchant Dashboard (Settings -> API Keys):
    - **Merchant ID**
    - **Access Code**
    - **Working Key** (Warning: Keep this secret!)

2.  **IP Whitelisting (Critical)**:
    - The documentation states: *"Merchant must provide CCAvenue with the public IP address from where the API calls will be initiated."*
    - You must whitelist the IP address of your production/staging server in the CCAvenue panel.
    - Without this, Server-to-Server API calls (Status, Confirm, Cancel, Refund) **will fail**.

3.  **Domain Whitelisting**:
    - Ensure your domain (e.g., `hptourism.osipl.dev`) is registered with CCAvenue.
    - If testing on localhost, check if CCAvenue Sandbox allows `localhost` return URLs. If not, use `ngrok` or similar to expose your local server.

4.  **Standard Checkout vs API**:
    - The provided documentation (`temp_kotak_doc.txt`) covers **API Calls** (Status, Refund, etc.).
    - For **Initiating Payments**, we assumed the standard Form POST integration.
    - API URL: `https://test.ccavenue.com/transaction/transaction.do?command=initiateTransaction`
    - Verify if your account supports "Standard Checkout".

5.  **Environment Variables**:
    Once tested, add these credentials to your `.env` file:
    ```bash
    CCAVENUE_MERCHANT_ID=your_id
    CCAVENUE_ACCESS_CODE=your_code
    CCAVENUE_WORKING_KEY=your_key
    CCAVENUE_ENV=test # or prod
    ```

6.  **Return & Cancel URLs**:
    The test interface dynamically generates these, but if you need to register them or whitelist them explicitly:
    -   **Domain**: `dev1.osipl.dev` (or your production domain)
    -   **Return URL (Redirect)**: `https://dev1.osipl.dev/api/ccavenue/test/callback`
    -   **Cancel URL**: `https://dev1.osipl.dev/api/ccavenue/test/callback`
    
    *Note: The system handles both success and failure at the same endpoint.*

## Usage
1. Go to `/payment/ccavenue-test`.
2. Enter your Sandbox Credentials.
3. Click "Encrypt Request".
4. Click "Pay Now" to open CCAvenue Payment Page.
5. Complete payment (use Test Card credentials provided by CCAvenue).
6. Upon redirection, the result will be decrypted and shown on the page.

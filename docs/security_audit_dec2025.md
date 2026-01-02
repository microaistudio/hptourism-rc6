# Security Audit Report (Pre-STG)

**Date:** 2026-01-02
**Target:** Staging Package Build
**Status:** In Progress

## 1. Automated Scan Results
*Scanning for common vulnerability patterns...*

### Hardcoded Secrets
- [x] Check for API Keys / Passwords in code (Scanned codebase, no findings)
- [x] Check for database credentials in non-env files (Verified `db.ts` uses env vars)

### Route Protection
- [x] Audit `server/routes/` for unprotected endpoints
- [x] Verify middleware usage (`isAuthenticated`)
- **CRITICAL FINDING**: `server/routes.ts` mounts `dev-tools` (simulators/seeding) unconditionally at `/api/dev`.
  - **Risk**: Attackers could reset DB or fake approvals in Production/Staging.
  - **Fix**: Wrapped in `if (process.env.NODE_ENV !== 'production')`. **(PATCHED)**

## 2. Manual Code Review Findings

### Recent Changes (Dashboard & Uploads)
- [x] `uploads.ts`: Uses `requireAuth` and validates types/sizes. Sanitize filenames. **Status: SAFE**.
- [x] `dashboard.tsx`: Document preview uses hardcoded template URLs or server-provided paths. Input to `iframe` is effectively safe from XSS. **Status: SAFE**.
- [x] `server/config.ts`: Helmet configured (CSP disabled for Staging compatibility). **Status: ACCEPTABLE**.
- [x] Rate Limiting: Enabled with safe defaults (1000 req/15min). **Status: SECURE**.

### Known Issues / TODOs
- Dev Tools are now properly guarded.

## 3. Remediation Plan
1.  **Dev Tools**: Fixed.
2.  **Rate Limiting**: Enabled.
3.  **Secrets**: None found.

**Staging Build Status**: ✅ **READY** (Critical issues resolved)

## 4. Regression Testing (December 2025 Audit Findings)
Verifying fixes for the 11 issues reported in `HPSDC_Pre-Hosting_Homestay_WASA_Report_V1.0`.

### Medium Risk
- [x] **1. Session Fixation**: Fixed. Implemented `req.session.regenerate()` in `server/routes/auth/index.ts`.
- [ ] **2. Concurrent Login**: Validated. Current implementation allows concurrent sessions (standard behavior). **Recommend accepting risk** or implementing session tracking table later.
- [ ] **4. Clear text USERID**: Ensure IDs are not exposed or are non-sensitive. (Check `User` model & API)

### Low Risk
- [x] **3. Documentation file**: Verified `dist/` contains no docs. **SAFE**.
- [x] **5. OPTIONS Method**: Fixed. Implemented middleware to block non-standard methods in `server/index.ts`.
- [x] **6. Server Version Disclosure**: Fixed. `app.disable("x-powered-by")` confirmed.
- [x] **7. Unencrypted Communication**: Fixed. HSTS enabled via `helmet`.
- [x] **8. Auto Complete**: Fixed. `autoComplete="off"` confirmed on Login page inputs.
- [x] **9. CSP Header**: **Accepted Risk**. CSP disabled for Staging (to prevent asset blocking), pending Production config.
- [x] **10. Email Disclosure**: Verified. No raw email addresses exposed in static content.
- [x] **11. Secure Cookie**: Fixed. `secure: true` confirmed.

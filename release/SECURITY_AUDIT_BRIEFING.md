# HP Tourism Portal - Security Audit Briefing

**Application:** Himachal Pradesh Homestay & B&B Registration Portal  
**Version:** 0.6.1  
**Audit Date:** December 2024  
**Environment:** Staging (dev2.osipl.dev)

---

## Application Overview

**Purpose:** Online registration and certification system for homestays and bed & breakfast properties in Himachal Pradesh.

**Technology Stack:**
- Frontend: React + TypeScript + Vite
- Backend: Node.js + Express + TypeScript
- Database: PostgreSQL 16
- Process Manager: PM2
- Web Server: Nginx
- Authentication: Session-based (PostgreSQL session store)

---

## Test Environment Access

**URL:** https://dev2.osipl.dev  
**Server IP:** 34.131.118.25  
**OS:** Ubuntu 24.04 LTS

### Test Accounts

| Role | Username | Password | Purpose |
|------|----------|----------|---------|
| Super Admin | `superadmin` | `Ulan@2025` | Full system access, user management |
| Admin | `admin` | `Admin@2025` | Application management, approvals |
| Property Owner | `9876543210` | `Owner@2024` | Submit homestay applications |
| DA (Dealing Assistant) | `9418012345` | `DA@2024` | Review applications (Shimla) |
| DTDO (District Officer) | `9418012346` | `DTDO@2024` | Final approval (Shimla) |

**Note:** Additional district staff accounts available for all 12 districts.

---

## Audit Scope

### In-Scope Components

1. **Authentication & Authorization**
   - Session management
   - Role-based access control (RBAC)
   - Password policies
   - OTP verification

2. **Data Security**
   - Aadhaar number encryption
   - Document upload validation
   - Database encryption (pgcrypto)
   - Session storage security

3. **API Security**
   - Input validation
   - SQL injection prevention
   - XSS protection
   - CSRF protection
   - Rate limiting

4. **File Upload Security**
   - File type validation
   - Size limits
   - Malware scanning (ClamAV integration)
   - Secure storage

5. **Payment Integration**
   - HimKosh gateway integration
   - Transaction security
   - Payment verification

6. **Infrastructure**
   - Nginx configuration
   - SSL/TLS setup
   - Database access controls
   - Server hardening

### Out-of-Scope

- Third-party services (HimKosh payment gateway, HP SSO)
- Network infrastructure beyond application server
- Physical security

---

## Key Security Features Implemented

✅ **Helmet.js** - Security headers (CSP, HSTS, X-Frame-Options)  
✅ **Rate Limiting** - API endpoint protection  
✅ **Input Sanitization** - Zod schema validation  
✅ **Parameterized Queries** - SQL injection prevention (Drizzle ORM)  
✅ **Session Security** - Secure cookies, idle timeout  
✅ **File Validation** - Type checking, size limits  
✅ **Audit Logging** - User actions tracked  
✅ **Password Hashing** - bcrypt with salt  
✅ **Aadhaar Encryption** - AES-256 encryption at rest  

---

## Critical Areas for Review

1. **Aadhaar Data Handling** - UIDAI compliance
2. **Document Storage** - PII in uploaded files
3. **Session Management** - Timeout, fixation, hijacking
4. **Payment Flow** - HimKosh integration security
5. **Admin Privileges** - Super admin access controls
6. **Database Access** - Connection string security, privilege separation

---

## Testing Guidelines

### Allowed Activities
- Penetration testing on staging environment
- Automated vulnerability scanning
- Manual code review
- Load testing (reasonable limits)
- Test data creation/modification

### Prohibited Activities
- Production environment testing
- DoS attacks
- Social engineering of staff
- Physical access attempts
- Data exfiltration beyond test accounts

---

## Server Access (If Required)

**SSH Access:** Available upon request  
**Database Access:** Read-only credentials available  
**Log Access:** `/opt/hptourism/data/logs/`

**Contact for Access:**  
[Your Name]  
[Email/Phone]

---

## Reporting

**Report Delivery:** Within 15 days of audit completion  
**Format:** Detailed report with CVSS scores  
**Include:**
- Executive summary
- Vulnerability findings (Critical/High/Medium/Low)
- Proof of concept (where applicable)
- Remediation recommendations
- Compliance assessment (UIDAI, IT Act 2000)

---

## Support Contacts

**Technical Lead:** [Name/Email]  
**Security Officer:** [Name/Email]  
**Project Manager:** [Name/Email]

---

## Compliance Requirements

- **UIDAI Guidelines** - Aadhaar data handling
- **IT Act 2000** - Data protection
- **CERT-In Guidelines** - Security best practices
- **OWASP Top 10** - Web application security

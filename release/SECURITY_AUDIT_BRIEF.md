# Security Audit - HP Tourism Portal

**Application:** HP Homestay Registration Portal  
**Version:** 0.6.1  
**Environment:** https://dev2.osipl.dev  
**Date:** December 2024

---

## Test Accounts

| Role | Username | Password |
|------|----------|----------|
| Super Admin | `superadmin` | `Ulan@2025` |
| Admin | `admin` | `Admin@2025` |
| Property Owner | `9876543210` | `Owner@2024` |
| DA (Shimla) | `9418012345` | `DA@2024` |
| DTDO (Shimla) | `9418012346` | `DTDO@2024` |

---

## Technology Stack

- **Frontend:** React + TypeScript
- **Backend:** Node.js + Express
- **Database:** PostgreSQL 16
- **Server:** Ubuntu 24.04, Nginx

---

## Audit Focus Areas

1. Authentication & session management
2. Aadhaar data encryption (UIDAI compliance)
3. File upload security
4. SQL injection & XSS protection
5. Payment gateway integration (HimKosh)
6. API rate limiting & input validation

---

## Deliverables

- Vulnerability report with CVSS scores
- Compliance assessment (UIDAI, IT Act 2000)
- Remediation recommendations

**Timeline:** 15 days from audit start

---

**Contact:** [Your Name/Email]

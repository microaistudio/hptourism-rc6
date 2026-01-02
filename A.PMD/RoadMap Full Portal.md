# HP Tourism Full Portal Roadmap
## Version R.1.0 | December 2025

---

## 🎯 Vision Statement

A **unified, multi-service eGovernance portal** for Himachal Pradesh Tourism Department that streamlines the registration, approval, and management of all tourism-related licenses and permits through a single, elegant interface.

---

## 🏗️ Architecture Overview

### Unified Pipeline Approach

Instead of building 8 separate applications, we implement **ONE unified system** with service-specific configurations:

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        HP TOURISM eSERVICES PORTAL                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    ENTERPRISE DASHBOARD                                  │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐                        │ │
│  │  │Homestay │ │Adventure│ │ Travel  │ │ Hotels  │ ...+4 more            │ │
│  │  │  B&B    │ │ Sports  │ │ Agents  │ │         │                        │ │
│  │  │  (45)   │ │  (12)   │ │  (8)    │ │  (3)    │                        │ │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘                        │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                              ↓ Click to Enter                                │
│  ┌─────────────────────────────────────────────────────────────────────────┐ │
│  │                    SERVICE-SPECIFIC DASHBOARD                            │ │
│  │  ┌──────────────┐  ┌─────────────────────────────────────────────────┐  │ │
│  │  │ LEFT SIDEBAR │  │ Applications │ Inspections │ Grievances │ ...  │  │ │
│  │  │              │  │                                                 │  │ │
│  │  │ [Service ▼]  │  │ ┌─────────────────────────────────────────────┐ │  │ │
│  │  │              │  │ │ Unified Queue with Tabs & Filters           │ │  │ │
│  │  │ Dashboard    │  │ │                                             │ │  │ │
│  │  │ Applications │  │ │ All | Registrations | Amendments | Renewals │ │  │ │
│  │  │ Inspections  │  │ │                                             │ │  │ │
│  │  │ Grievances   │  │ │ [Application List with Actions]             │ │  │ │
│  │  │ Reports      │  │ └─────────────────────────────────────────────┘ │  │ │
│  │  └──────────────┘  └─────────────────────────────────────────────────┘  │ │
│  └─────────────────────────────────────────────────────────────────────────┘ │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📦 The 8 Service Pipelines

| # | Service Type | Description | Status |
|---|--------------|-------------|--------|
| 1 | **Homestay B&B** | Bed & Breakfast registration | 🟢 Active |
| 2 | **Adventure Sports** | Paragliding, trekking operators | 🟡 In Progress |
| 3 | **Travel Agents** | Tour operators, travel agencies | 📋 Planned |
| 4 | **Hotels** | Hotel registration & star rating | 📋 Planned |
| 5 | **Rafting Operators** | River rafting permits | 📋 Planned |
| 6 | **Camping Sites** | Tent/camping site registration | 📋 Planned |
| 7 | **Tour Guides** | Licensed guide registration | 📋 Planned |
| 8 | **Transport Services** | Tourism vehicle permits | 📋 Planned |

---

## 👥 User Roles & Hierarchies

### Role Structure

```
                    ┌──────────────────┐
                    │  STATE ADMIN     │
                    │  (HP Tourism HQ) │
                    └────────┬─────────┘
                             │
            ┌────────────────┼────────────────┐
            ▼                ▼                ▼
     ┌──────────┐     ┌──────────┐     ┌──────────┐
     │  DTDO    │     │  DTDO    │     │  DTDO    │
     │ Shimla   │     │  Kullu   │     │  Kangra  │  ... (12 Districts)
     └────┬─────┘     └────┬─────┘     └────┬─────┘
          │                │                │
     ┌────┴────┐      ┌────┴────┐      ┌────┴────┐
     ▼         ▼      ▼         ▼      ▼         ▼
  ┌─────┐  ┌─────┐ ┌─────┐  ┌─────┐ ┌─────┐  ┌─────┐
  │ DA  │  │ DA  │ │ DA  │  │ DA  │ │ DA  │  │ DA  │
  └─────┘  └─────┘ └─────┘  └─────┘ └─────┘  └─────┘
```

### Role Permissions

| Role | Responsibilities |
|------|------------------|
| **Property Owner** | Submit applications, track status, raise grievances |
| **DA (Dealing Assistant)** | Verify documents, conduct inspections, submit reports |
| **DTDO (District Officer)** | Schedule inspections, review reports, approve/reject |
| **State Admin** | Analytics, policy management, escalation handling |
| **Helpdesk** | First-level support, ticket routing (Future) |

---

## 🔄 Application Workflow

### New Registration Flow

```
OWNER                    DA                      DTDO
  │                       │                        │
  │  Submit Application   │                        │
  │──────────────────────>│                        │
  │                       │  Verify Documents      │
  │                       │  & Payment             │
  │                       │                        │
  │  Correction Request   │                        │
  │<──────────────────────│                        │
  │                       │                        │
  │  Resubmit             │                        │
  │──────────────────────>│                        │
  │                       │  Mark Verified         │
  │                       │───────────────────────>│
  │                       │                        │  Schedule Inspection
  │                       │  Conduct Inspection    │
  │                       │<───────────────────────│
  │                       │                        │
  │                       │  Submit Report         │
  │                       │───────────────────────>│
  │                       │                        │  Review & Approve
  │  Certificate Issued   │                        │
  │<──────────────────────────────────────────────│
```

### Amendment Types (Homestay)

| Amendment | Workflow |
|-----------|----------|
| **Add Rooms** | Submit → DA Verify → DTDO Inspection → Approve |
| **Delete Rooms** | Submit → DA Verify → DTDO Approve (No inspection) |
| **Cancel RC** | Submit → DA Verify → DTDO Approve → Certificate revoked |
| **Category Upgrade** | Cancel Current → New Application → Full workflow |
| **Renewal** | 90 days before expiry → Submit → DA Verify → DTDO Approve |

---

## 📊 Dashboard Modules

### 1. Unified Applications Queue

**For DA & DTDO** - Single queue with tabs and filters:

- **Tabs**: All | Registrations | Amendments | Renewals
- **Sub-filters**: For Amendments (Add Rooms, Delete Rooms, Cancel RC)
- **Features**:
  - Color-coded application types
  - Priority indicators
  - Contextual information (+2 rooms, -1 room, etc.)
  - Quick actions on hover
  - Bulk operations

### 2. Inspections Management

- Scheduled inspections calendar
- Overdue alerts
- Report submission
- Photo/document upload

### 3. Grievance & Support Module

**Three-table architecture**:

```sql
support_tickets     → Main ticket record
ticket_messages     → Conversation thread
ticket_actions      → Full audit trail
```

**Features**:
- Ticket number: GRV-{YEAR}-{SEQUENCE}
- Categories: delay, payment, document, inspection, technical, general
- Priority levels: low, medium, high, urgent
- SLA tracking with breach alerts
- Escalation workflow (DA → DTDO → Admin)
- Internal notes (officer-only)
- Complete audit trail

### 4. Analytics & Reports (Future)

- **Live Pipeline Dashboard**: Real-time application status
- **Historical Analysis**: Trends, SLA compliance, officer performance
- **Export Capabilities**: PDF, Excel, CSV downloads

---

## 🔮 Future Enhancements

### Phase 1: Homestay Pipeline Complete (Current)
- [x] Application form with stepper
- [x] Document upload & verification
- [x] Payment integration (HimKosh)
- [ ] **Unified DA Dashboard** ← IN PROGRESS
- [ ] Unified DTDO Dashboard
- [ ] Grievance module implementation

### Phase 2: Multi-Service Foundation
- [ ] Service configuration system
- [ ] Adventure Sports pipeline
- [ ] Service selector in dashboards
- [ ] Enterprise dashboard (all 8 services summary)

### Phase 3: Advanced Features
- [ ] Live pipeline visualization
- [ ] Historical reports & analytics
- [ ] Helpdesk integration
- [ ] Mobile app (PWA)
- [ ] SMS/WhatsApp notifications
- [ ] AI-powered document verification

### Phase 4: Optimization
- [ ] Application audit trail cleanup
- [ ] Performance optimization
- [ ] Caching improvements
- [ ] Load testing

---

## 🗃️ Database Schema Summary

### Core Tables

| Table | Purpose |
|-------|---------|
| `users` | All user accounts with roles |
| `homestay_applications` | Application data |
| `application_actions` | Application audit trail |
| `himkosh_transactions` | Payment records |
| `notifications` | Push/email/SMS notifications |

### Grievance System

| Table | Purpose |
|-------|---------|
| `support_tickets` | Ticket records |
| `ticket_messages` | Conversation threads |
| `ticket_actions` | Ticket audit trail |

### Service Configuration (Future)

```sql
service_configurations (
  service_type,
  application_types,    -- JSON: available kinds
  form_schema,          -- JSON: field definitions
  fee_structure,        -- JSON: pricing rules
  inspection_criteria,  -- JSON: checklist items
  certificate_template  -- Template ID
)
```

---

## 🎨 Design Principles

1. **Visual Excellence**: Premium, modern UI with gradients, animations
2. **Consistency**: Same patterns across all services
3. **Efficiency**: Minimize clicks, maximize information density
4. **Responsiveness**: Mobile-first approach
5. **Accessibility**: WCAG compliance

---

## 📝 Notes

- **Classic View Toggle**: Keep old layouts accessible during transition
- **Sandbox First**: Test new designs in `/sandbox/` before production
- **Incremental Rollout**: Feature flags for gradual deployment

---

## 📅 Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| R.1.0 | Dec 25, 2025 | AI Assistant | Initial roadmap based on design discussion |

---

*This document captures the high-level vision and architecture decisions. Detailed implementation specifications will be added as features are developed.*

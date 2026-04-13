# Team 13 – Medical Clinic Database Project
> CLAUDE.md — auto-read at session start. Use this to scope your focus.

---

## Quick Orientation

**Project:** Full-stack web app for a medical clinic. Patients, physicians, and staff each have their own login portal.

**Stack:**
- **Backend:** Node.js + Express (`server.js`)
- **Database:** MySQL via `mysql2` connection pool — credentials in `.env`
- **Frontend:** Vanilla HTML/CSS/JS (no framework)
- **Auth:** bcrypt password hashing (`bcryptjs`)
- **Dev tool:** `nodemon` for auto-restart

**Current branch:** `TinaT2` (active development)
**Other branches:** `TinaT` (cleanup branch), `main` (stable)

**Live database:** Railway MySQL (used for demo)
**Submission plan:** Export from Railway → import to local MySQL before submission

---

## Folder Structure

```
project root
├── server.js                        ← Express entry point
├── .env                             ← DB credentials (never commit)
├── .env.example
├── railway.toml
├── package.json
│
├── client/                          ← All frontend files
│   ├── pages/
│   │   ├── home_page.html
│   │   ├── about.html
│   │   └── locations/locations.html
│   ├── auth/
│   │   ├── patient_login.html
│   │   ├── staff_login.html
│   │   └── register.html
│   ├── portals/
│   │   ├── patient_dashboard.html
│   │   ├── physician_dashboard.html
│   │   └── staff_dashboard.html
│   ├── scripts/
│   │   ├── auth/        ← login/register JS
│   │   ├── portals/     ← dashboard JS per role
│   │   └── pages/       ← sidebar.js, search.js
│   └── styles/
│       ├── dashboard.css            ← shared portal styles (dark mode here)
│       ├── auth/
│       └── pages/
│
├── server/                          ← All backend files
│   ├── db.js                        ← MySQL connection pool
│   ├── controllers/
│   │   ├── authController.js        ← register, login
│   │   ├── patientController.js     ← patient data + care team
│   │   ├── staffController.js       ← staff/physician actions
│   │   └── locationsController.js
│   └── routes/
│       ├── authRoutes.js
│       ├── patientRoutes.js
│       ├── staffRoutes.js
│       └── locationsRoutes.js
│
├── database/
│   ├── Team_13_Medical_Clinic_DB.sql  ← Full schema (CREATE TABLE)
│   ├── seed.sql                       ← Sample data
│   ├── migrate_nullable_care.sql      ← ALTER TABLE migrations
│   └── fix_phones.js                  ← One-time phone format migration + triggers
│
└── images/
```

---

## API Routes Summary

| Method | Route | Controller | What it does |
|--------|-------|------------|--------------|
| POST | `/api/auth/register` | authController | Create user + patient row |
| POST | `/api/auth/login` | authController | Login, returns role |
| GET | `/api/patient/profile` | patientController | Load patient dashboard data |
| PUT | `/api/patient/profile` | patientController | Save profile edits |
| GET | `/api/patient/appointments` | patientController | Patient's appointments |
| GET | `/api/patient/care/cities` | patientController | City list for care setup |
| GET | `/api/patient/care/physicians` | patientController | Physicians by city |
| GET | `/api/patient/care/insurance` | patientController | Insurance options |
| PUT | `/api/patient/care/assign` | patientController | Assign physician + insurance |
| GET | `/api/staff/dashboard` | staffController | Physician/staff dashboard data |
| POST | `/api/staff/physician/note` | staffController | Add clinical note to patient |
| GET | `/api/locations` | locationsController | Office locations |

---

## Database Schema (Tables & Relationships)

**Creation order matters — FKs require this order:**

```
clinic → department → office → physician → work_schedule
→ insurance → staff → users → patient
→ appointment_status → appointment
→ medical_history → diagnosis → treatment
→ referral_status → referral → billing
```

### Table Summaries

| Table | Key Columns | Notes |
|-------|-------------|-------|
| `clinic` | clinic_id, clinic_name | Top-level org |
| `department` | department_id, clinic_id | Belongs to clinic |
| `office` | office_id, clinic_id, city, state | Physical locations — city used for care team selection |
| `physician` | physician_id, specialty, department_id | All doctors (primary + specialist) |
| `work_schedule` | physician_id, office_id, day_of_week, start/end_time | Links physician to office location |
| `insurance` | insurance_id, provider_name, policy_number, coverage_percentage | Plan-level only (not patient-specific yet) |
| `staff` | staff_id, role, department_id | Admin, nurse, receptionist etc. |
| `users` | user_id, username, password_hash, role, physician_id, staff_id | Login accounts. role = 'patient'/'physician'/'staff' |
| `patient` | patient_id, user_id, primary_physician_id, insurance_id | user_id links to login. FK nullable. |
| `appointment_status` | status_id, status_name | Lookup: Scheduled, Completed, Cancelled, No-Show |
| `appointment` | appointment_id, patient_id, physician_id, office_id, date, time, status_id | Unique on (physician_id, date, time) |
| `medical_history` | patient_id, condition, diagnosis_date, status, notes | Ongoing conditions + physician notes |
| `diagnosis` | appointment_id, physician_id, diagnosis_code, severity | Per-visit diagnosis |
| `treatment` | diagnosis_id, treatment_plan, medication, follow_up_date | Linked to diagnosis |
| `referral_status` | referral_status_id, referral_status_name | Lookup: Requested, Issued, Accepted, Rejected, Scheduled, Completed, Expired |
| `referral` | patient_id, primary_physician_id, specialist_id, referral_status_id | PCP → Specialist flow |
| `billing` | appointment_id, patient_id, insurance_id, total_amount, payment_status | Per-appointment bill |

### Key Relationships
- `users.physician_id` → `physician.physician_id` (physician login)
- `users.staff_id` → `staff.staff_id` (staff login)
- `patient.user_id` → `users.user_id` (patient login link)
- `patient.primary_physician_id` → `physician.physician_id` (nullable)
- `patient.insurance_id` → `insurance.insurance_id` (nullable)
- `referral.primary_physician_id` + `referral.specialist_id` → both FK to `physician`

---

## Auth & Session Flow

1. User registers → `users` row created (bcrypt hashed password) + blank `patient` row auto-created
2. User logs in → server returns `{ role, userId, patientId / physicianId / staffId }`
3. Frontend stores in `localStorage`, appends to every API call as query param or body
4. Role determines which portal to redirect to:
   - `patient` → `/client/portals/patient_dashboard.html`
   - `physician` → `/client/portals/physician_dashboard.html`
   - `staff` → `/client/portals/staff_dashboard.html`

---

## Known Pending Work

### Must-Have (Professor Requirements)
- [ ] **Appointment scheduling** in patient portal (book by physician/date/time)
- [ ] **3 data reports:** patient billing statement, physician activity report, daily appointment schedule
- [ ] **Triggers** (meaningful business logic — not just phone formatting):
  - Auto-create billing row when appointment marked Completed
  - Prevent double-booking (patient can't have 2 appointments same time)
  - Log no-shows to medical_history
- [ ] **Referral flow** fully implemented: Requested → Issued → Accepted → Scheduled → Completed
- [ ] **Billing math** fields: `insurance_paid_amount`, `patient_owed`, `copay_amount`, `processed_by`, `due_date`

### Schema Gaps To Fix
- [ ] Add `physician_type ENUM('primary','specialist')` to `physician` table
- [ ] Add `physician_id` to `medical_history` (who wrote the note)
- [ ] Add `appointment_type` and `duration_minutes` to `appointment`
- [ ] Add `slot_duration_minutes` to `work_schedule` (for booking UI)
- [ ] Add `staff_type` / `office_id` to `staff`
- [ ] Redesign `insurance` to separate provider plans from patient policies

### App Features To Build
- [ ] Auto-populate registration name/email into patient profile on first login
- [ ] 18+ age validation on registration + no future birthdates
- [ ] Patient appointment booking UI
- [ ] Referral card on patient dashboard (view referral status)
- [ ] Billing statement view for patients

### Database Migration Still Needed on Railway
```sql
-- Run these on Railway if not already done:
ALTER TABLE patient MODIFY primary_physician_id INT NULL DEFAULT NULL;
ALTER TABLE patient MODIFY insurance_id INT NULL DEFAULT NULL;
ALTER TABLE patient ADD COLUMN user_id INT UNIQUE AFTER patient_id;

-- Link existing seed patients to their user accounts:
UPDATE patient SET user_id = 1 WHERE patient_id = 1;
UPDATE patient SET user_id = 2 WHERE patient_id = 2;
-- etc. for patients 3–5
```

---

## .env Format

```env
DB_HOST=your-host
DB_PORT=3306
DB_USER=your-user
DB_PASSWORD=your-password
DB_NAME=team_13_medical_clinic_db
PORT=3000
```

---

## How To Run Locally

```bash
npm install
npm run dev     # nodemon auto-restart on changes
# or
npm start       # plain node
```

App runs at: `http://localhost:3000`

---

## Session Focus Guide

Start a session with one of these prompts to scope it:

- **"Schema/DB session"** → Focus on `database/` folder, SQL design, triggers, migrations
- **"Backend session"** → Focus on `server/controllers/`, `server/routes/`, `server/db.js`
- **"Frontend session"** → Focus on `client/portals/`, `client/scripts/`, `client/styles/`
- **"Feature session: [feature name]"** → Full-stack work on one specific feature

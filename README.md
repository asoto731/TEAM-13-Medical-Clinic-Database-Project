# Team 13 — Audit Trail Health

A full-stack medical clinic management system with role-based portals for patients, physicians, staff, and administrators. Built with **Node.js / Express**, **vanilla HTML/CSS/JS**, and a **MySQL** database hosted on Railway.

**Live URL:** https://team-13-medical-clinic-database-project-production.up.railway.app

---

## Team Members

| Branch | Member | Contributions |
|--------|--------|---------------|
| `TinaT2` | Tina T. | Frontend, dashboards, CSS, project structure, API integration, deployment |
| `MaxC` | Max C. | Backend auth, patient login/register, DB queries |
| `Timi-A` | Timi A. | Database schema, seed data, triggers |
| `main` | All | Stable merged branch — always deployable |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML, CSS, JavaScript (no framework) |
| Backend | Node.js + Express |
| Database | MySQL hosted on Railway |
| DB Driver | mysql2 (connection pool, parameterized queries) |
| Auth | bcryptjs password hashing, localStorage session |
| Charts | Chart.js 4 via CDN (admin insurance analytics) |
| Deployment | Railway (auto-deploys from `main` branch) |

---

## Local Setup

### 1. Clone the repo
```bash
git clone https://github.com/xinaxm4/TEAM-13-Medical-Clinic-Database-Project.git
cd TEAM-13-Medical-Clinic-Database-Project
```

### 2. Install dependencies
```bash
npm install
```

### 3. Create your `.env` file
```bash
cp .env.example .env
```

Fill in the credentials (get from a teammate — do not commit):
```
DB_HOST=caboose.proxy.rlwy.net
DB_USER=root
DB_PORT=55239
DB_PASSWORD=<ask teammate>
DB_NAME=railway
PORT=3000
```

> `.env` is gitignored and never committed. The database is shared on Railway — no local MySQL needed.

### 4. Start the server
```bash
npm run dev     # nodemon auto-restart
# or
npm start       # plain node
```

### 5. Open in browser
```
http://localhost:3000
```

---

## Demo Login Credentials

### Patient Portal
**URL:** `/auth/patient_login.html`

| Email | Password |
|-------|----------|
| `alex.smith@email.com` | `Patient@123` |
| `taylor.jones@email.com` | `Patient@123` |
| `morgan.w@email.com` | `Patient@123` |
| `jordan.brown@email.com` | `Patient@123` |
| `casey.davis@email.com` | `Patient@123` |

New patients can register at `/auth/register.html` (3-step flow — no insurance step at registration).

### Physician & Staff Portal
**URL:** `/auth/staff_login.html`

| Username | Password | Role | Location |
|----------|----------|------|----------|
| `dr.johnson` | `Doctor@123` | Physician (primary) | Dallas |
| `dr.moore` | `Doctor@123` | Physician (primary) | Houston |
| `dr.davis` | `Doctor@123` | Physician (primary) | Austin |
| `dr.garcia` | `Doctor@123` | Physician (specialist) | Dallas |
| `dr.white` | `Doctor@123` | Physician (specialist) | Houston |
| `dr.foster` | `Doctor@123` | Physician (specialist) | Austin |
| `dr.allen` | `Doctor@123` | Physician (specialist, Cardiology) | Dallas |
| `dr.vasquez` | `Doctor@123` | Physician (specialist, Cardiology) | New York |
| `dr.huang` | `Doctor@123` | Physician (specialist, Oncology) | Houston |
| `staff.adams` | `Staff@123` | Staff | Dallas |
| `staff.brooks` | `Staff@123` | Staff | Houston |
| `staff.taylor` | `Staff@123` | Staff | Austin |

### Admin Portal
**URL:** `/auth/staff_login.html` (same login, role `admin` redirects to admin dashboard)

| Username | Password | Role |
|----------|----------|------|
| `admin` | `Admin@123` | Admin |

---

## Pages & Portals

### Public Pages
| URL | Description |
|-----|-------------|
| `/` | Home page |
| `/pages/about.html` | About the clinic |
| `/pages/locations/locations.html` | All clinic locations |

### Authentication
| URL | Description |
|-----|-------------|
| `/auth/patient_login.html` | Patient login |
| `/auth/register.html` | New patient registration (3 steps) |
| `/auth/staff_login.html` | Physician, staff & admin login |

### Dashboards (login required)
| URL | Role | Features |
|-----|------|---------|
| `/portals/patient_dashboard.html` | Patient | Overview, book/cancel appointments, medical history, billing statement, referral tracking, profile edit |
| `/portals/physician_dashboard.html` | Physician | Schedule, appointments (update status), patient notes, create & manage referrals, activity report |
| `/portals/staff_dashboard.html` | Staff | Appointments, onboard patients, book for patients, billing queue (mark paid), daily schedule report with location filter |
| `/portals/admin_dashboard.html` | Admin | Clinic overview, manage physicians/staff (add/edit/delete), appointments report by date & location, insurance analytics dashboard |

---

## API Endpoints

### Auth — `/api/auth`
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/auth/register` | Register a new patient |
| `POST` | `/api/auth/login` | Patient portal login |
| `GET` | `/api/auth/insurance-plans` | All insurance plans (public — used by registration & staff onboarding) |

### Patient — `/api/patient`
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/patient/dashboard` | Full patient dashboard data |
| `PUT` | `/api/patient/profile` | Update patient profile |
| `GET` | `/api/patient/appointments` | Patient's appointments |
| `GET` | `/api/patient/appointments/slots` | Available time slots for booking |
| `POST` | `/api/patient/appointments/book` | Book a new appointment |
| `PUT` | `/api/patient/appointments/:id/cancel` | Cancel an appointment |
| `GET` | `/api/patient/care/cities` | City list for care team setup |
| `GET` | `/api/patient/care/physicians` | Primary physicians by city |
| `GET` | `/api/patient/care/insurance` | Insurance options (patient role only) |
| `PUT` | `/api/patient/care/assign` | Assign physician + insurance |
| `GET` | `/api/patient/referral/specialists` | Available specialists by city |
| `POST` | `/api/patient/referral/request` | Request a specialist referral |

### Staff & Physician — `/api/staff`
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/staff/login` | Physician or staff login |
| `GET` | `/api/staff/physician/dashboard` | Physician dashboard data |
| `GET` | `/api/staff/staff/dashboard` | Staff dashboard data |
| `GET` | `/api/staff/all-schedules` | All physician schedules |
| `GET` | `/api/staff/physician/referrals` | Incoming referrals for physician |
| `PUT` | `/api/staff/referral/:id/status` | Accept or reject a referral |
| `POST` | `/api/staff/physician/note` | Add clinical note to patient |
| `PUT` | `/api/staff/appointment/:id/status` | Update appointment status |
| `PUT` | `/api/staff/appointment/:id/undo-status` | Undo last appointment status change |
| `DELETE` | `/api/staff/medical-history/:id` | Delete a medical history note |
| `POST` | `/api/staff/appointments/book` | Staff books appointment for patient |
| `PUT` | `/api/staff/billing/:id/pay` | Mark billing record as paid |
| `GET` | `/api/staff/patients` | All patients list |
| `GET` | `/api/staff/physicians` | All physicians list |
| `POST` | `/api/staff/patients/onboard` | Onboard a new patient (creates user + patient + first appointment) |
| `GET` | `/api/staff/physicians/accepting` | Physicians currently accepting new patients |
| `GET` | `/api/staff/specialists` | All specialist physicians |
| `POST` | `/api/staff/referral/create` | Physician creates a new referral (PCP-initiated) |

### Admin — `/api/admin`
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/admin/login` | Admin login |
| `GET` | `/api/admin/dashboard` | Admin overview stats |
| `GET` | `/api/admin/clinic-report` | Clinic financial report (grouped by location) |
| `GET` | `/api/admin/physicians` | All physicians |
| `GET` | `/api/admin/staff-members` | All staff members |
| `GET` | `/api/admin/departments` | All departments |
| `GET` | `/api/admin/offices` | All offices |
| `POST` | `/api/admin/add-physician` | Add a new physician |
| `POST` | `/api/admin/add-staff` | Add a new staff member |
| `PUT` | `/api/admin/physician/:id` | Edit physician details |
| `DELETE` | `/api/admin/physician/:id` | Delete a physician |
| `PUT` | `/api/admin/staff/:id` | Edit staff member details |
| `DELETE` | `/api/admin/staff/:id` | Delete a staff member |
| `GET` | `/api/admin/insurance/scorecard` | Payer performance scorecard (Charts A + B queries) |
| `GET` | `/api/admin/insurance/payer-detail` | Single payer detail |
| `GET` | `/api/admin/insurance/accepted` | Accepted insurance plans per clinic |
| `POST` | `/api/admin/insurance/accept` | Add insurance plan to clinic |
| `PUT` | `/api/admin/insurance/:id/deactivate` | Deactivate an accepted insurance plan |
| `GET` | `/api/admin/insurance/alerts` | Unread payer alerts (below-threshold claims) |
| `PUT` | `/api/admin/insurance/alerts/:id/read` | Mark alert as read |

### Reports — `/api/reports`
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/reports/billing-statement` | Patient billing statement (`?patient_id=X`) |
| `GET` | `/api/reports/daily-schedule` | Daily appointment schedule (`?date=YYYY-MM-DD&clinic_id=X`) — `clinic_id` optional |
| `GET` | `/api/reports/physician-activity` | Physician 90-day activity report (`?physician_id=X`) |

### Locations — `/api/locations`
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/locations` | All clinic offices |

---

## Database

Fully hosted on Railway — all team members connect to the same live instance.

### Current Data

| Table | Records |
|-------|---------|
| `clinic` | 8 (Dallas, Houston, Austin, New York, Chicago, Los Angeles, Phoenix, Seattle) |
| `department` | 46 |
| `office` | 8 (one per city) |
| `physician` | 65 (38 primary, 27 specialist) |
| `work_schedule` | 138 |
| `insurance` | 12 providers |
| `staff` | 8 (one per city) |
| `users` | 78+ |
| `patient` | 5 |
| `appointment` | 12 (includes today's appointments for demo) |
| `medical_history` | 6 |
| `diagnosis` | 3 |
| `treatment` | 3 |
| `billing` | 5 |
| `referral` | 2 |
| `clinic_accepted_insurance` | 7 (seeded contractual terms per clinic) |
| `payer_alert` | auto-populated by trigger |

### Specialist Coverage by City

| City | Specialties Available |
|------|-----------------------|
| **New York** | Cardiology, Gastroenterology, Neurology, Oncology, Rheumatology |
| **Los Angeles** | Dermatology, Endocrinology, Rheumatology, Orthopedics, Urology |
| **Dallas** | Cardiology, Dermatology, Orthopedics |
| **Houston** | Cardiology, Oncology, Gastroenterology |
| **Chicago** | Cardiology, Pulmonology, Gastroenterology, Dermatology |
| **Austin** | Neurology, Geriatrics |
| **Phoenix** | Neurology, Endocrinology, Pulmonology |
| **Seattle** | Pulmonology, Oncology, Neurology |

> Patients requiring rare specialties not available at their local clinic are referred and may need to travel to a hub city.

### Key Tables

| Table | Description |
|-------|-------------|
| `users` | Login credentials. `role` (`patient`/`physician`/`staff`/`admin`) controls portal access |
| `patient` | Demographics, primary physician, insurance |
| `physician` | Doctor info, specialty, `physician_type` (primary/specialist) |
| `staff` | Non-physician staff with role and department |
| `appointment` | Visits linking patient, physician, office, and status |
| `work_schedule` | Physician availability per office per day |
| `referral` | Specialist referrals — PCP → specialist flow with status tracking |
| `medical_history` | Long-term conditions and physician notes per patient |
| `diagnosis` | ICD-10 coded diagnoses linked to appointments |
| `treatment` | Treatment plans, medications, follow-up dates |
| `billing` | Payment records — auto-created by trigger on appointment completion |
| `clinic_accepted_insurance` | Which insurance plans each clinic accepts, with contracted reimbursement thresholds |
| `payer_alert` | Auto-populated by trigger when a claim falls below contracted reimbursement % |
| `audit_log` | HIPAA audit trail for data access |

### Referral Status Flow
```
Requested → Issued → Accepted → Scheduled → Completed
                   ↘ Rejected
                   ↘ Expired
```

---

## Database Triggers

4 triggers are live in the Railway database:

| Trigger | Event | Table | Purpose |
|---------|-------|-------|---------|
| `after_appointment_completed` | `AFTER UPDATE` | `appointment` | Auto-creates billing record with insurance math when appointment marked Completed |
| `after_appointment_noshow` | `AFTER UPDATE` | `appointment` | Auto-logs a No-Show entry to patient's medical history |
| `before_appointment_double_book` | `BEFORE INSERT` | `appointment` | Blocks a patient from booking two appointments at the same date and time |
| `after_billing_insert_check_threshold` | `AFTER INSERT` | `billing` | Inserts a `payer_alert` row if claim reimbursement % falls below the clinic's contracted threshold for that payer |

To re-run triggers: `database/triggers.sql` — run in MySQL Workbench (do not use Railway query editor for multi-statement triggers).

---

## SQL Queries

3 parameterized queries in `database/queries.sql` (used by report endpoints):

| Query | Description |
|-------|-------------|
| Patient Billing Statement | 5-table join — per-appointment breakdown with insurance coverage, billed amount, insurance paid, and patient balance |
| Daily Appointment Schedule | All appointments for a given date across all offices, with optional `clinic_id` filter |
| Physician Activity Report | 90-day window — completion rate, revenue, no-shows via `CASE WHEN` conditional aggregation |

---

## Data Entry Forms (Professor Requirements)

| Portal | Add | Modify | Delete |
|--------|-----|--------|--------|
| Patient | Book appointment (4-step modal) | Edit profile | Cancel appointment |
| Physician | Add clinical note, create referral | Update appointment status, accept/reject referral | Delete own medical history note |
| Staff | Onboard new patient, create appointment for any patient | Mark billing as paid, update appointment status | Cancel appointment |
| Admin | Add physician, add staff member, add insurance plan to clinic | Edit physician, edit staff member | Delete physician, delete staff member, deactivate insurance plan |

---

## Database Migrations

Idempotent migration files (safe to re-run — use `INSERT IGNORE`):

| File | Purpose |
|------|---------|
| `database/triggers.sql` | All 4 triggers — run in MySQL Workbench |
| `database/queries.sql` | Reference SQL for the 3 report queries |
| `database/add_today_appointments.sql` | Adds 4 appointments for today's date (demo data) |
| `database/add_insurance_plans.sql` | Expands insurance from 5 → 12 providers |
| `database/add_admin.sql` | Adds admin department / office rows |
| `database/add_admin_user.sql` | Adds admin user account |

---

## Access Control

| Role | Login Page | Blocked From |
|------|-----------|--------------|
| `patient` | `/auth/patient_login.html` | Staff, physician & admin portals |
| `physician` | `/auth/staff_login.html` | Patient & admin portals |
| `staff` | `/auth/staff_login.html` | Patient & admin portals |
| `admin` | `/auth/staff_login.html` | Patient portal |

Role enforced at both frontend redirect and server-side `requireRole()` middleware on every API route.

---

## Project Structure

```
TEAM-13-Medical-Clinic-Database-Project/
│
├── server.js                        # Express app entry point
├── .env                             # DB credentials (gitignored)
├── .env.example
├── railway.toml
├── package.json
│
├── server/
│   ├── db.js                        # MySQL connection pool
│   ├── middleware/
│   │   └── auth.js                  # requireRole() middleware
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── patientController.js
│   │   ├── staffController.js
│   │   ├── adminController.js       # Admin CRUD + insurance analytics
│   │   ├── reportController.js
│   │   └── locationsController.js
│   └── routes/
│       ├── authRoutes.js
│       ├── patientRoutes.js
│       ├── staffRoutes.js
│       ├── adminRoutes.js
│       ├── reportRoutes.js
│       └── locationsRoutes.js
│
├── client/
│   ├── pages/
│   │   ├── home_page.html
│   │   ├── about.html
│   │   └── locations/locations.html
│   ├── auth/
│   │   ├── patient_login.html
│   │   ├── staff_login.html
│   │   └── register.html            # 3-step registration (no insurance step)
│   ├── portals/
│   │   ├── patient_dashboard.html
│   │   ├── physician_dashboard.html
│   │   ├── staff_dashboard.html
│   │   └── admin_dashboard.html     # Insurance analytics + staff/physician CRUD
│   ├── scripts/
│   │   ├── auth/
│   │   └── portals/
│   └── styles/
│       ├── dashboard.css
│       ├── auth/
│       └── pages/
│
├── database/
│   ├── Team_13_Medical_Clinic_DB.sql  # Full schema (CREATE TABLE)
│   ├── seed.sql                       # All seed data (INSERT IGNORE — safe to re-run)
│   ├── triggers.sql                   # All 4 triggers (run in MySQL Workbench)
│   ├── queries.sql                    # Reference SQL for the 3 report queries
│   ├── add_today_appointments.sql     # Railway migration: 4 appointments for today
│   ├── add_insurance_plans.sql        # Railway migration: expand to 12 insurance providers
│   ├── add_admin.sql                  # Railway migration: admin dept/office rows
│   ├── add_admin_user.sql             # Railway migration: admin user account
│   └── backups/                       # Auto-timestamped backups (gitignored)
│
└── images/
```

---

## Security Notes

- Passwords hashed with **bcryptjs** (10 salt rounds) — no plain text ever stored
- All queries use parameterized `?` placeholders — protected against SQL injection
- Role-based middleware on every API route
- Sessions stored in `localStorage` — role checked on every page load
- `.env` credentials never committed to source control
- Insurance plan endpoint (`/api/auth/insurance-plans`) is intentionally public — used by both patient registration and staff onboarding (staff role would be blocked by patient-only endpoints)

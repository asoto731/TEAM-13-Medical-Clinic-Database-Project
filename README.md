# Team 13 — Palantir Clinic

A full-stack medical clinic web application with role-based portals for patients, physicians, and staff. Built with **Node.js / Express**, **vanilla HTML/CSS/JS**, and a **MySQL** database hosted on Railway.

**Live database:** hosted on Railway — no local MySQL setup needed.

---

## Team Members & Branches

| Branch | Member | Contributions |
|--------|--------|---------------|
| `TinaT` | Tina T. | Frontend, dashboards, CSS, project structure, API integration |
| `MaxC` | Max C. | Backend auth, patient login/register, DB queries |
| `Timi-A` | Timi A. | Database schema, seed data, triggers |
| `main` | Everyone | Stable merged code — always deployable |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Vanilla HTML, CSS, JavaScript |
| Backend | Node.js + Express |
| Database | MySQL (hosted on Railway) |
| ORM | mysql2 (raw queries, connection pool) |
| Deployment | Railway |

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
Copy the example and fill in the credentials shared by your team:
```bash
cp .env.example .env
```

Your `.env` should look like this (get credentials from a teammate):
```
DB_HOST=<railway_host>
DB_USER=root
DB_PORT=<railway_port>
DB_PASSWORD=<railway_password>
DB_NAME=railway
PORT=3000
```

> **Note:** `.env` is gitignored and never committed. Do not share credentials publicly.

### 4. Start the server
```bash
node server.js
```

### 5. Open in browser
```
http://localhost:3000
```

---

## Demo Login Credentials

### Patient Portal — `/auth/patient_login.html`

| Email | Password |
|-------|----------|
| `alex.smith@email.com` | `password123` |
| `taylor.jones@email.com` | `password123` |
| `morgan.w@email.com` | `password123` |

New patients can self-register at `/auth/register.html`.

### Staff & Physician Portal — `/auth/staff_login.html`

| Username | Password | Role |
|----------|----------|------|
| `dr.garcia` | `clinic123` | Physician |
| `dr.turner` | `clinic123` | Physician |
| `dr.johnson` | `clinic123` | Physician |
| `staff.adams` | `staff123` | Staff |
| `staff.brooks` | `staff123` | Staff |

---

## Pages & Portals

### Public pages (no login required)
| URL | Description |
|-----|-------------|
| `/` | Home page — hero, smart search bar |
| `/pages/about.html` | About Palantir Clinic — mission, specialties, locations |
| `/pages/locations/locations.html` | All 7 clinic locations |
| `/pages/locations/<city>.html` | Individual clinic detail page |

### Auth
| URL | Description |
|-----|-------------|
| `/auth/patient_login.html` | Patient login |
| `/auth/register.html` | New patient registration |
| `/auth/staff_login.html` | Physician & staff login |

### Dashboards (login required)
| URL | Role | Features |
|-----|------|---------|
| `/portals/patient_dashboard.html` | Patient | Appointments, medical history, billing, profile completion |
| `/portals/physician_dashboard.html` | Physician | Weekly schedule, patient list, referrals, appointments |
| `/portals/staff_dashboard.html` | Staff | Department appointments, billing queue, profile |

---

## API Endpoints

### Auth — `/api/auth`
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/auth/register` | Register a new patient account |
| `POST` | `/api/auth/login` | Patient login |

### Patient — `/api/patient`
| Method | Route | Description |
|--------|-------|-------------|
| `GET` | `/api/patient/dashboard?user_id=X` | Full patient portal data |
| `PUT` | `/api/patient/profile` | Update patient profile info |

### Staff & Physician — `/api/staff`
| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/staff/login` | Physician or staff login |
| `GET` | `/api/staff/physician/dashboard?user_id=X` | Physician portal data |
| `GET` | `/api/staff/staff/dashboard?user_id=X` | Staff portal data |
| `GET` | `/api/staff/all-schedules` | All physicians' weekly schedules |

---

## Database Schema

The database is hosted on Railway and shared by all team members. The full schema is in `database/Team_13_Medical_Clinic_DB.sql`.

### Key Tables

| Table | Description |
|-------|-------------|
| `users` | Login credentials for all roles. Links to `physician` or `staff` via FK. `role` column determines portal access. |
| `patient` | Demographics, DOB, contact info, emergency contact, primary physician, insurance. Has `user_id` FK to `users`. |
| `physician` | Doctor info, specialty, department. Has `user_id` FK to `users`. |
| `staff` | Non-physician employees, shift hours, department. Has `user_id` FK to `users`. |
| `appointment` | All scheduled visits — links patient, physician, and office. |
| `work_schedule` | Which office a physician works at on each day of the week. |
| `referral` | Specialist referrals issued by a primary physician. |
| `diagnosis` | ICD-10 coded diagnoses linked to appointments. |
| `treatment` | Treatment plans and medications linked to appointments. |
| `medical_history` | Long-term conditions on record for each patient. |
| `billing` | Payment records — auto-generated by trigger when appointment is completed. |
| `office` | Physical clinic locations with address and phone number. |
| `insurance` | Insurance providers and coverage info. |
| `department` | Clinical departments (Cardiology, Neurology, etc.) linked to a clinic. |

### Entity Relationships
- `users` → `patient` via `patient.user_id`
- `users` → `physician` via `physician.user_id` and `users.physician_id`
- `users` → `staff` via `staff.user_id` and `users.staff_id`
- `patient` → `physician` via `patient.primary_physician_id`
- `appointment` → `patient`, `physician`, `office`, `appointment_status`
- `work_schedule` → `physician`, `office`
- `referral` → `patient`, primary `physician`, specialist `physician`
- `billing` → `appointment`, `patient`, `insurance`

---

## MySQL Triggers

Three triggers are implemented in the Railway database:

| Trigger | Event | Purpose |
|---------|-------|---------|
| `trg_auto_billing_on_complete` | `AFTER UPDATE` on `appointment` | Automatically creates a billing record (status: Unpaid) when an appointment status changes to `Completed` |
| `trg_prevent_past_appointments` | `BEFORE INSERT` on `appointment` | Rejects any appointment booked with a date in the past |
| `trg_validate_referral_dates` | `BEFORE INSERT` on `referral` | Rejects referrals where the expiration date is on or before the issue date |

---

## User Roles & Access Control

| Role | Login Page | Redirect After Login | Account Created By |
|------|-----------|---------------------|-------------------|
| `patient` | `/auth/patient_login.html` | Patient dashboard | Self-registration |
| `physician` | `/auth/staff_login.html` | Physician dashboard | Admin (inserted directly to DB) |
| `staff` | `/auth/staff_login.html` | Staff dashboard | Admin (inserted directly to DB) |

- Patients who try to log in through the Staff Portal are blocked with an error message.
- Staff/physicians who try to log in through the Patient Portal are blocked.
- Session is stored in `localStorage` as `patientUser` (patients) or `clinicUser` (physician/staff).

---

## Project Structure

```
TEAM-13-Medical-Clinic-Database-Project/
│
├── server.js                        # Express server, route registration, static file serving
├── db.js                            # MySQL connection pool (reads credentials from .env)
├── .env                             # Local environment variables — NOT committed (gitignored)
├── .env.example                     # Template showing required environment variables
├── package.json
│
├── pages/                           # Public marketing pages
│   ├── home_page.html               # Landing page with hero and smart search
│   ├── about.html                   # About page (mission, specialties, locations)
│   └── locations/                   # Clinic location pages
│       ├── locations.html           # All locations grid
│       └── <city>.html              # Individual location detail pages
│
├── auth/                            # Login & registration pages
│   ├── patient_login.html
│   ├── register.html
│   └── staff_login.html
│
├── portals/                         # Role-based dashboard pages
│   ├── patient_dashboard.html
│   ├── physician_dashboard.html
│   └── staff_dashboard.html
│
├── styles/                          # CSS
│   ├── dashboard.css                # Shared dashboard styles (all 3 portals)
│   ├── home_page.css
│   ├── about.css
│   ├── locations.css
│   ├── location_detail.css
│   ├── patient_login.css
│   ├── staff_login.css
│   └── register.css
│
├── scripts/                         # JavaScript
│   ├── search.js                    # Smart search on home page
│   ├── sidebar.js                   # Login drawer on public pages
│   ├── auth/
│   │   ├── patient_login.js
│   │   ├── register.js
│   │   └── staff_login.js
│   └── portals/
│       ├── patient_dashboard.js
│       ├── physician_dashboard.js
│       └── staff_dashboard.js
│
├── controllers/                     # Express route handlers
│   ├── authController.js            # register, login
│   ├── staffController.js           # physician/staff dashboard, all-schedules
│   └── patientController.js         # patient dashboard, profile update
│
├── routes/                          # Route definitions
│   ├── authRoutes.js
│   ├── staffRoutes.js
│   └── patientRoutes.js
│
├── database/                        # Schema and seed scripts
│   ├── Team_13_Medical_Clinic_DB.sql  # Full CREATE TABLE schema
│   └── seed_clinical.js               # Seeds diagnosis, treatment, referral tables
│
└── images/                          # Static image assets
    ├── medical_homepage_image.jpg
    ├── locations.jpg
    └── about.jpg
```

---

## Security Notes

- Passwords are stored as **plain text** in `password_hash` — acceptable for a class demo; production would use `bcrypt`
- Database credentials are stored in `.env` (gitignored) and set as environment variables on Railway
- Role-based access is enforced server-side — patients cannot hit physician/staff endpoints and vice versa
- SQL injection is mitigated via parameterized queries (`?` placeholders with `mysql2`)
- No rate limiting or JWT — acceptable for demo scope

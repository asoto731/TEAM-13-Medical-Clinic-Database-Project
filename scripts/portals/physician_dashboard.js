/* ── Auth check ── */
const user = JSON.parse(localStorage.getItem("clinicUser") || "null");

if (!user || user.role !== "physician") {
    window.location.href = "/auth/staff_login.html";
}

/* ── Logout ── */
document.getElementById("logoutBtn").addEventListener("click", () => {
    localStorage.removeItem("clinicUser");
    window.location.href = "/auth/staff_login.html";
});

/* ── Section nav ── */
function showSection(name) {
    document.querySelectorAll(".page-section").forEach(s => s.classList.add("hidden"));
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    const sec = document.getElementById("sec-" + name);
    if (sec) sec.classList.remove("hidden");
    const btn = document.querySelector(`.nav-item[onclick*="'${name}'"]`);
    if (btn) btn.classList.add("active");
    const labels = { overview:"Overview", appointments:"Appointments", patients:"My Patients", schedule:"Work Schedule", referrals:"Referrals" };
    document.getElementById("currentSection").textContent = labels[name] || name;
}

/* ── Helpers ── */
document.getElementById("todayDate").textContent = new Date().toLocaleDateString("en-US", { weekday:"long", year:"numeric", month:"long", day:"numeric" });

function fmt(d) { return d ? new Date(d).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }) : "—"; }
function timeFmt(t) {
    if (!t) return "—";
    const [h, m] = t.toString().split(":");
    const hr = parseInt(h);
    return `${hr % 12 || 12}:${m} ${hr < 12 ? "AM" : "PM"}`;
}
function pill(status) {
    if (!status) return '<span class="pill pill-pending">Unknown</span>';
    const s = status.toLowerCase().replace(/\s+/g, "-");
    const cls = { scheduled:"scheduled", completed:"completed", cancelled:"cancelled", pending:"pending", approved:"approved", rejected:"cancelled", expired:"cancelled" }[s] || "pending";
    return `<span class="pill pill-${cls}">${status}</span>`;
}

/* ── Weekly Calendar Builder ── */
function buildWeekCalendar(schedule, appointments) {
    const body = document.getElementById("wcBody");
    if (!body) return;

    if (!schedule || schedule.length === 0) {
        body.innerHTML = '<p class="loading-msg">No schedule on record</p>';
        return;
    }

    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const START_HOUR = 7;   // 7 AM
    const END_HOUR   = 20;  // 8 PM (exclusive, so last row is 7 PM–8 PM)
    const ROW_HEIGHT = 52;  // px — must match .wc-row min-height

    // Index schedule entries by day name
    const schedByDay = {};
    days.forEach(d => { schedByDay[d] = []; });
    (schedule || []).forEach(s => {
        const dayKey = s.day_of_week;
        if (schedByDay[dayKey] !== undefined) {
            schedByDay[dayKey].push(s);
        }
    });

    // Index appointments by (day-of-week name → hour)
    // appointment_date is an ISO string; appointment_time is "HH:MM:SS"
    const apptByDayHour = {}; // key: "Monday_9" → array of appts
    (appointments || []).forEach(a => {
        if (!a.appointment_date || !a.appointment_time) return;
        const dateStr = a.appointment_date.slice(0, 10);
        const d = new Date(dateStr + 'T00:00:00');
        const jsDay = d.getDay(); // 0=Sun,1=Mon,...,6=Sat
        const dayName = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'][jsDay];
        const hour = parseInt(a.appointment_time.toString().split(':')[0], 10);
        const key = dayName + '_' + hour;
        if (!apptByDayHour[key]) apptByDayHour[key] = [];
        apptByDayHour[key].push(a);
    });

    let html = '';
    for (let h = START_HOUR; h < END_HOUR; h++) {
        const label = h === 12 ? '12 PM' : (h < 12 ? h + ' AM' : (h - 12) + ' PM');
        let rowHtml = `<div class="wc-row"><div class="wc-time-label">${label}</div>`;

        days.forEach(dayName => {
            let cellContent = '';

            // Check if this day+hour falls within a work_schedule entry
            const dayEntries = schedByDay[dayName] || [];
            dayEntries.forEach(s => {
                const startH = parseInt(s.start_time.toString().split(':')[0], 10);
                const endH   = parseInt(s.end_time.toString().split(':')[0], 10);
                if (h >= startH && h < endH) {
                    const loc = s.city ? s.city + (s.state ? ', ' + s.state : '') : 'Office';
                    cellContent += `<div class="wc-block available" title="${s.street_address || ''}, ${s.city || ''}, ${s.state || ''}">
                        ${h === startH ? loc : ''}
                    </div>`;
                }
            });

            // Check appointments for this day+hour
            const apptKey = dayName + '_' + h;
            const appts = apptByDayHour[apptKey] || [];
            appts.forEach(a => {
                const pt = a.patient_first ? (a.patient_first + ' ' + a.patient_last) : 'Patient';
                cellContent += `<div class="wc-block appointment" title="${pt}${a.reason_for_visit ? ' – ' + a.reason_for_visit : ''}">
                    ${pt}
                </div>`;
            });

            rowHtml += `<div class="wc-cell">${cellContent}</div>`;
        });

        rowHtml += '</div>';
        html += rowHtml;
    }

    body.innerHTML = html;
}

/* ── Load data ── */
async function loadDashboard() {
    try {
        const res  = await fetch(`/api/staff/physician/dashboard?user_id=${user.id}`);
        const data = await res.json();

        if (!res.ok) {
            document.getElementById("greetSub").textContent = data.message || "Could not load data.";
            return;
        }

        const { physician, appointments, patients, schedule, referrals } = data;

        /* Greeting */
        const docName = physician ? `Dr. ${physician.last_name}` : "Doctor";
        document.getElementById("greetName").textContent     = docName;
        document.getElementById("greetSub").textContent      = `${physician?.department_name || "Department"} · Hire date: ${fmt(physician?.hire_date)}`;
        document.getElementById("sidebarName").textContent   = docName;
        document.getElementById("sidebarSpec").textContent   = physician?.specialty || "Physician";
        document.getElementById("specialtyBadge").textContent = physician?.specialty || "Physician";
        document.getElementById("avatarInitials").textContent = physician ? physician.first_name[0] + physician.last_name[0] : "Dr";

        /* Stats */
        const uniqueOffices = new Set((schedule || []).map(s => s.city)).size;
        document.getElementById("statAppts").textContent    = appointments.length;
        document.getElementById("statPatients").textContent = patients.length;
        document.getElementById("statOffices").textContent  = uniqueOffices;
        document.getElementById("statReferrals").textContent = referrals.length;

        /* Overview: today's schedule (upcoming) */
        const today = new Date().toISOString().slice(0, 10);
        const todayAppts = appointments.filter(a => a.appointment_date && a.appointment_date.slice(0, 10) >= today).slice(0, 6);
        const oBody = document.getElementById("overviewApptBody");
        oBody.innerHTML = todayAppts.length
            ? todayAppts.map(a => `<tr>
                <td class="primary">${timeFmt(a.appointment_time)}</td>
                <td>${a.patient_first} ${a.patient_last}</td>
                <td>${a.reason_for_visit || "—"}</td>
                <td>${pill(a.status_name)}</td>
            </tr>`).join("")
            : `<tr><td colspan="4" class="table-empty">No upcoming appointments</td></tr>`;

        /* Overview: referrals */
        const rBody = document.getElementById("overviewRefBody");
        rBody.innerHTML = referrals.slice(0, 5).length
            ? referrals.slice(0, 5).map(r => `<tr>
                <td class="primary">${r.patient_first} ${r.patient_last}</td>
                <td>Dr. ${r.spec_last}</td>
                <td>${pill(r.referral_status_name)}</td>
            </tr>`).join("")
            : `<tr><td colspan="3" class="table-empty">No referrals on record</td></tr>`;

        /* Appointments table */
        document.getElementById("apptBody").innerHTML = appointments.length
            ? appointments.map(a => `<tr>
                <td class="primary">${fmt(a.appointment_date)}</td>
                <td>${timeFmt(a.appointment_time)}</td>
                <td>${a.patient_first} ${a.patient_last}</td>
                <td>${a.city || "—"}</td>
                <td>${a.reason_for_visit || "—"}</td>
                <td>${pill(a.status_name)}</td>
            </tr>`).join("")
            : `<tr><td colspan="6" class="table-empty">No appointments found</td></tr>`;

        /* Patients table */
        document.getElementById("patientsBody").innerHTML = patients.length
            ? patients.map(p => `<tr>
                <td class="primary">${p.first_name} ${p.last_name}</td>
                <td>${fmt(p.date_of_birth)}</td>
                <td style="text-transform:capitalize">${p.gender || "—"}</td>
                <td>${p.phone_number || "—"}</td>
                <td>${p.email || "—"}</td>
                <td>${p.provider_name || "—"}</td>
            </tr>`).join("")
            : `<tr><td colspan="6" class="table-empty">No patients found</td></tr>`;

        /* Work schedule — weekly calendar */
        buildWeekCalendar(schedule, appointments);

        /* Referrals table */
        document.getElementById("referralsBody").innerHTML = referrals.length
            ? referrals.map(r => `<tr>
                <td class="primary">${r.patient_first} ${r.patient_last}</td>
                <td>Dr. ${r.spec_first} ${r.spec_last}</td>
                <td>${r.specialty || "—"}</td>
                <td>${r.referral_reason || "—"}</td>
                <td>${fmt(r.date_issued)}</td>
                <td>${fmt(r.expiration_date)}</td>
                <td>${pill(r.referral_status_name)}</td>
            </tr>`).join("")
            : `<tr><td colspan="7" class="table-empty">No referrals on record</td></tr>`;

    } catch (err) {
        console.error("Physician dashboard error:", err);
        document.getElementById("greetSub").textContent = "Could not connect to server.";
    }
}

loadDashboard();

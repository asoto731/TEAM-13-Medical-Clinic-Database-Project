/* ── Auth guard ── */
const user = JSON.parse(localStorage.getItem("clinicUser") || "null");
if (!user || user.role !== "admin") {
    window.location.href = "/client/auth/admin_login.html";
}

/* ── Sidebar name ── */
document.getElementById("sidebarName").textContent = user?.username || "Administrator";

/* ── Logout ── */
function logoutUser() {
    localStorage.removeItem("clinicUser");
    window.location.href = "/client/auth/admin_login.html";
}
document.getElementById("logoutBtn").addEventListener("click", logoutUser);

/* ── HIPAA: idle logout after 15 minutes ── */
(function setupIdleLogout() {
    const IDLE_MS = 15 * 60 * 1000;
    let idleTimer = setTimeout(logoutUser, IDLE_MS);
    function resetTimer() { clearTimeout(idleTimer); idleTimer = setTimeout(logoutUser, IDLE_MS); }
    ["mousemove","mousedown","keydown","touchstart","scroll","click"].forEach(e =>
        document.addEventListener(e, resetTimer, { passive: true })
    );
})();

/* ── Section nav ── */
const sectionLabels = {
    overview:"Overview", physicians:"Physicians", staff:"Staff Members",
    reports:"Clinic Reports", settings:"Settings"
};

function showSection(name) {
    document.querySelectorAll(".page-section").forEach(s => s.classList.add("hidden"));
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    const sec = document.getElementById("sec-" + name);
    if (sec) sec.classList.remove("hidden");
    const btn = document.querySelector(`.nav-item[onclick*="'${name}'"]`);
    if (btn) btn.classList.add("active");
    document.getElementById("currentSection").textContent = sectionLabels[name] || name;

    // Lazy-load section data
    if (name === "physicians") loadPhysicians();
    if (name === "staff")      loadStaff();
    if (name === "reports")    loadClinicReport();
}

/* ── Theme ── */
function syncThemeButtons() {
    const dark = localStorage.getItem("theme") === "dark";
    document.getElementById("themeLight")?.classList.toggle("active", !dark);
    document.getElementById("themeDark")?.classList.toggle("active",  dark);
}
function setTheme(theme) {
    if (theme === "dark") {
        document.documentElement.setAttribute("data-theme","dark");
        localStorage.setItem("theme","dark");
    } else {
        document.documentElement.removeAttribute("data-theme");
        localStorage.setItem("theme","light");
    }
    syncThemeButtons();
}
function switchSettingsTab(tab, btn) {
    document.querySelectorAll(".settings-tab").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".settings-tab-content").forEach(c => c.classList.add("hidden"));
    if (btn) btn.classList.add("active");
    const content = document.getElementById("stab-" + tab);
    if (content) content.classList.remove("hidden");
}
syncThemeButtons();

/* ── Helpers ── */
document.getElementById("todayDate").textContent = new Date().toLocaleDateString("en-US", {
    weekday:"long", year:"numeric", month:"long", day:"numeric"
});
function fmt(d) { return d ? new Date(d).toLocaleDateString("en-US", { month:"short", day:"numeric", year:"numeric" }) : "—"; }
function timeFmt(t) {
    if (!t) return "—";
    const [h, m] = t.toString().split(":");
    const hr = parseInt(h);
    return `${hr % 12 || 12}:${m} ${hr < 12 ? "AM" : "PM"}`;
}
function pill(status) {
    if (!status) return '<span class="pill pill-pending">Unknown</span>';
    const s = status.toLowerCase().replace(/\s+/g,"-");
    const cls = { scheduled:"scheduled", completed:"completed", cancelled:"cancelled",
                  "no-show":"cancelled", pending:"pending", paid:"paid", unpaid:"unpaid" }[s] || "pending";
    return `<span class="pill pill-${cls}">${status}</span>`;
}
function money(v) { return "$" + parseFloat(v || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g,","); }

/* ══════════════════════════════════════
   OVERVIEW — load dashboard stats
══════════════════════════════════════ */
async function loadOverview() {
    try {
        const res  = await fetch(`/api/admin/dashboard?user_id=${user.id}`);
        const data = await res.json();
        if (!res.ok) { document.getElementById("greetSub").textContent = data.message || "Could not load data."; return; }

        const { stats, clinics, recentAppts } = data;

        document.getElementById("greetSub").textContent = `Managing ${clinics.length} clinic location(s) · Audit Trail Health`;
        document.getElementById("statPhysicians").textContent = stats?.total_physicians ?? "—";
        document.getElementById("statStaff").textContent      = stats?.total_staff      ?? "—";
        document.getElementById("statPatients").textContent   = stats?.total_patients   ?? "—";
        document.getElementById("statAppts").textContent      = stats?.upcoming_appointments ?? "—";

        // Clinic summary table
        document.getElementById("clinicSummaryBody").innerHTML = clinics.length
            ? clinics.map(c => `<tr>
                <td class="primary">${c.clinic_name}</td>
                <td>${c.city}, ${c.state}</td>
                <td>${c.departments}</td>
                <td>${c.physicians}</td>
                <td>${c.appointments_this_month}</td>
            </tr>`).join("")
            : `<tr><td colspan="5" class="table-empty">No clinics found</td></tr>`;

        // Recent appointments
        document.getElementById("recentApptBody").innerHTML = recentAppts.length
            ? recentAppts.map(a => `<tr>
                <td class="primary">${fmt(a.appointment_date)}</td>
                <td>${timeFmt(a.appointment_time)}</td>
                <td>${a.patient_name}</td>
                <td>${a.physician_name}</td>
                <td>${a.city}</td>
                <td>${pill(a.status_name)}</td>
            </tr>`).join("")
            : `<tr><td colspan="6" class="table-empty">No appointments found</td></tr>`;

    } catch(e) {
        document.getElementById("greetSub").textContent = "Could not connect to server.";
    }
}

/* ══════════════════════════════════════
   PHYSICIANS
══════════════════════════════════════ */
let _departmentsLoaded = false;

async function loadDepartments() {
    if (_departmentsLoaded) return;
    try {
        const r = await fetch(`/api/admin/departments?user_id=${user.id}`);
        const rows = await r.json();
        const opts = '<option value="">— Select Department —</option>' +
            rows.map(d => `<option value="${d.department_id}">${d.clinic_name} → ${d.department_name}</option>`).join("");
        document.getElementById("ph_dept").innerHTML = opts;
        document.getElementById("st_dept").innerHTML = opts;
        _departmentsLoaded = true;
    } catch(e) {}
}

async function loadOfficesForSchedule() {
    try {
        const r = await fetch(`/api/admin/offices?user_id=${user.id}`);
        return await r.json();
    } catch(e) { return []; }
}

async function loadPhysicians() {
    loadDepartments();
    try {
        const r    = await fetch(`/api/admin/physicians?user_id=${user.id}`);
        const rows = await r.json();
        document.getElementById("physicianListBody").innerHTML = rows.length
            ? rows.map(p => `<tr>
                <td class="primary">Dr. ${p.first_name} ${p.last_name}</td>
                <td>${p.specialty || "—"}</td>
                <td style="text-transform:capitalize">${p.physician_type || "—"}</td>
                <td>${p.department_name || "—"}</td>
                <td>${p.clinic_name || "—"}</td>
                <td>${p.email || "—"}</td>
                <td>${fmt(p.hire_date)}</td>
            </tr>`).join("")
            : `<tr><td colspan="7" class="table-empty">No physicians found</td></tr>`;
    } catch(e) {
        document.getElementById("physicianListBody").innerHTML = `<tr><td colspan="7" class="table-empty">Could not load data</td></tr>`;
    }
}

/* ── Schedule builder ── */
let _offices = [];
async function addScheduleRow() {
    if (!_offices.length) _offices = await loadOfficesForSchedule();
    const officeOpts = _offices.map(o => `<option value="${o.office_id}">${o.clinic_name} — ${o.city}</option>`).join("");
    const days = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];
    const dayOpts = days.map(d => `<option value="${d}">${d}</option>`).join("");
    const idx = Date.now();
    const row = document.createElement("div");
    row.className = "schedule-row";
    row.id = "srow-" + idx;
    row.innerHTML = `
        <button class="remove-sched-btn" onclick="this.parentElement.remove()">×</button>
        <select style="padding:7px 10px;border:1px solid #e0e3ed;border-radius:7px;font-size:12px;font-family:inherit" class="srow-office">${officeOpts}</select>
        <select style="padding:7px 10px;border:1px solid #e0e3ed;border-radius:7px;font-size:12px;font-family:inherit" class="srow-day">${dayOpts}</select>
        <div style="display:flex;gap:6px;align-items:center">
            <input type="time" class="srow-start" style="padding:7px;border:1px solid #e0e3ed;border-radius:7px;font-size:12px;font-family:inherit">
            <span style="font-size:11px;color:#aaa">to</span>
            <input type="time" class="srow-end" style="padding:7px;border:1px solid #e0e3ed;border-radius:7px;font-size:12px;font-family:inherit">
        </div>`;
    document.getElementById("scheduleRows").appendChild(row);
}

async function submitAddPhysician() {
    const errEl = document.getElementById("phError");
    errEl.style.display = "none";

    const first_name    = document.getElementById("ph_first").value.trim();
    const last_name     = document.getElementById("ph_last").value.trim();
    const email         = document.getElementById("ph_email").value.trim();
    const phone_number  = document.getElementById("ph_phone").value.trim();
    const specialty     = document.getElementById("ph_specialty").value.trim();
    const physician_type = document.getElementById("ph_type").value;
    const department_id = document.getElementById("ph_dept").value;
    const hire_date     = document.getElementById("ph_hire").value;
    const username      = document.getElementById("ph_user").value.trim();
    const password      = document.getElementById("ph_pass").value;

    if (!first_name || !last_name || !username || !password) {
        errEl.textContent = "First name, last name, username, and password are required.";
        errEl.style.display = "block";
        return;
    }

    // Collect schedule rows
    const schedule = [];
    document.querySelectorAll("#scheduleRows .schedule-row").forEach(row => {
        const office_id  = row.querySelector(".srow-office")?.value;
        const day_of_week = row.querySelector(".srow-day")?.value;
        const start_time = row.querySelector(".srow-start")?.value;
        const end_time   = row.querySelector(".srow-end")?.value;
        if (office_id && day_of_week && start_time && end_time)
            schedule.push({ office_id, day_of_week, start_time, end_time });
    });

    try {
        const r = await fetch("/api/admin/add-physician", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: user.id, first_name, last_name, email, phone_number,
                specialty, physician_type, department_id: department_id || null,
                hire_date: hire_date || null, username, password, schedule })
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.message);

        // Reset form
        ["ph_first","ph_last","ph_email","ph_phone","ph_specialty","ph_hire","ph_user","ph_pass"]
            .forEach(id => document.getElementById(id).value = "");
        document.getElementById("scheduleRows").innerHTML = "";
        document.getElementById("ph_type").value = "primary";
        document.getElementById("ph_dept").value = "";

        // Show success and reload list
        errEl.style.color = "#0d7a60";
        errEl.textContent = `✓ Dr. ${first_name} ${last_name} added successfully!`;
        errEl.style.display = "block";
        setTimeout(() => { errEl.style.display = "none"; errEl.style.color = "#e05c5c"; }, 4000);
        loadPhysicians();
    } catch(err) {
        errEl.textContent = err.message || "Could not add physician.";
        errEl.style.display = "block";
    }
}

/* ══════════════════════════════════════
   STAFF
══════════════════════════════════════ */
async function loadStaff() {
    loadDepartments();
    try {
        const r    = await fetch(`/api/admin/staff-members?user_id=${user.id}`);
        const rows = await r.json();
        document.getElementById("staffListBody").innerHTML = rows.length
            ? rows.map(s => `<tr>
                <td class="primary">${s.first_name} ${s.last_name}</td>
                <td>${s.role || "—"}</td>
                <td>${s.department_name || "—"}</td>
                <td>${s.clinic_name || "—"}</td>
                <td>${s.email || "—"}</td>
                <td>${s.shift_start ? timeFmt(s.shift_start) + " – " + timeFmt(s.shift_end) : "—"}</td>
                <td>${fmt(s.hire_date)}</td>
            </tr>`).join("")
            : `<tr><td colspan="7" class="table-empty">No staff members found</td></tr>`;
    } catch(e) {
        document.getElementById("staffListBody").innerHTML = `<tr><td colspan="7" class="table-empty">Could not load data</td></tr>`;
    }
}

async function submitAddStaff() {
    const errEl = document.getElementById("stError");
    errEl.style.display = "none";

    const first_name   = document.getElementById("st_first").value.trim();
    const last_name    = document.getElementById("st_last").value.trim();
    const email        = document.getElementById("st_email").value.trim();
    const phone_number = document.getElementById("st_phone").value.trim();
    const role         = document.getElementById("st_role").value;
    const department_id = document.getElementById("st_dept").value;
    const hire_date    = document.getElementById("st_hire").value;
    const shift_start  = document.getElementById("st_shift_start").value;
    const shift_end    = document.getElementById("st_shift_end").value;
    const username     = document.getElementById("st_user").value.trim();
    const password     = document.getElementById("st_pass").value;

    if (!first_name || !last_name || !username || !password) {
        errEl.textContent = "First name, last name, username, and password are required.";
        errEl.style.display = "block";
        return;
    }

    try {
        const r = await fetch("/api/admin/add-staff", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ user_id: user.id, first_name, last_name, email, phone_number,
                role, department_id: department_id || null,
                hire_date: hire_date || null,
                shift_start: shift_start || null, shift_end: shift_end || null,
                username, password })
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.message);

        ["st_first","st_last","st_email","st_phone","st_hire","st_shift_start","st_shift_end","st_user","st_pass"]
            .forEach(id => document.getElementById(id).value = "");
        document.getElementById("st_role").value = "Receptionist";
        document.getElementById("st_dept").value = "";

        errEl.style.color = "#0d7a60";
        errEl.textContent = `✓ ${first_name} ${last_name} added successfully!`;
        errEl.style.display = "block";
        setTimeout(() => { errEl.style.display = "none"; errEl.style.color = "#e05c5c"; }, 4000);
        loadStaff();
    } catch(err) {
        errEl.textContent = err.message || "Could not add staff member.";
        errEl.style.display = "block";
    }
}

/* ══════════════════════════════════════
   CLINIC REPORTS
══════════════════════════════════════ */
async function loadClinicReport() {
    document.getElementById("clinicReportCards").innerHTML = '<p style="color:#aaa;padding:20px">Loading clinic reports…</p>';
    try {
        const res  = await fetch(`/api/admin/clinic-report?user_id=${user.id}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);

        const { clinics } = data;

        // Update revenue stats
        const totalBilled   = clinics.reduce((s,c) => s + parseFloat(c.total_billed || 0), 0);
        const totalOutstanding = clinics.reduce((s,c) => s + parseFloat(c.outstanding_balance || 0), 0);
        document.getElementById("rptTotalBilled").textContent   = money(totalBilled);
        document.getElementById("rptOutstanding").textContent   = money(totalOutstanding);

        // Render per-clinic cards
        document.getElementById("clinicReportCards").innerHTML = clinics.map(c => {
            const completionRate = c.total_appointments
                ? Math.round((c.completed / c.total_appointments) * 100)
                : 0;
            return `
            <div class="clinic-report-card">
                <h4>${c.clinic_name}</h4>
                <p class="sub">${c.city}, ${c.state}</p>
                <div class="report-stats">
                    <div class="report-stat">
                        <div class="val">${c.total_physicians}</div>
                        <div class="lbl">Physicians</div>
                    </div>
                    <div class="report-stat">
                        <div class="val">${c.total_staff}</div>
                        <div class="lbl">Staff</div>
                    </div>
                    <div class="report-stat">
                        <div class="val">${c.total_appointments}</div>
                        <div class="lbl">Total Appts</div>
                    </div>
                    <div class="report-stat">
                        <div class="val">${completionRate}%</div>
                        <div class="lbl">Completion</div>
                    </div>
                    <div class="report-stat">
                        <div class="val">${c.completed}</div>
                        <div class="lbl">Completed</div>
                    </div>
                    <div class="report-stat">
                        <div class="val">${c.no_shows}</div>
                        <div class="lbl">No-Shows</div>
                    </div>
                    <div class="report-stat">
                        <div class="val">${c.cancelled}</div>
                        <div class="lbl">Cancelled</div>
                    </div>
                    <div class="report-stat">
                        <div class="val" style="font-size:16px">${money(c.total_collected)}</div>
                        <div class="lbl">Collected</div>
                    </div>
                    <div class="report-stat">
                        <div class="val" style="font-size:16px;color:#e74c3c">${money(c.outstanding_balance)}</div>
                        <div class="lbl">Outstanding</div>
                    </div>
                    <div class="report-stat">
                        <div class="val" style="font-size:16px">${money(c.total_billed)}</div>
                        <div class="lbl">Total Billed</div>
                    </div>
                </div>
            </div>`;
        }).join("") || '<p style="color:#aaa;padding:20px">No clinic data found.</p>';

    } catch(e) {
        document.getElementById("clinicReportCards").innerHTML = `<p style="color:#e05c5c;padding:20px">Could not load reports: ${e.message}</p>`;
    }
}

/* ── Bootstrap ── */
loadOverview();

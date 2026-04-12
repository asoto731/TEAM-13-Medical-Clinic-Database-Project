/* ── Auth check ── */
const user = JSON.parse(localStorage.getItem("clinicUser") || "null");

if (!user || user.role !== "physician") {
    window.location.href = "/client/auth/staff_login.html";
}

/* ── Logout ── */
function logoutUser() {
    localStorage.removeItem("clinicUser");
    window.location.href = "/client/auth/staff_login.html";
}
document.getElementById("logoutBtn").addEventListener("click", logoutUser);

/* ── HIPAA: Idle auto-logout after 15 minutes ── */
(function setupIdleLogout() {
    const IDLE_MS = 15 * 60 * 1000;
    let idleTimer = setTimeout(logoutUser, IDLE_MS);
    function resetTimer() {
        clearTimeout(idleTimer);
        idleTimer = setTimeout(logoutUser, IDLE_MS);
    }
    ["mousemove", "mousedown", "keydown", "touchstart", "scroll", "click"].forEach(evt =>
        document.addEventListener(evt, resetTimer, { passive: true })
    );
})();

/* ── Section nav ── */
function showSection(name) {
    document.querySelectorAll(".page-section").forEach(s => s.classList.add("hidden"));
    document.querySelectorAll(".nav-item").forEach(n => n.classList.remove("active"));
    const sec = document.getElementById("sec-" + name);
    if (sec) sec.classList.remove("hidden");
    const btn = document.querySelector(`.nav-item[onclick*="'${name}'"]`);
    if (btn) btn.classList.add("active");
    const labels = { overview:"Overview", appointments:"Appointments", patients:"My Patients", schedule:"Work Schedule", referrals:"Referrals", incoming:"Incoming Referrals" };
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
    const cls = { scheduled:"scheduled", completed:"completed", cancelled:"cancelled", pending:"pending", approved:"approved", rejected:"cancelled", expired:"cancelled", accepted:"completed" }[s] || "pending";
    return `<span class="pill pill-${cls}">${status}</span>`;
}

/* ── Member Schedule Builder (Hubstaff-style: people as rows) ── */
async function buildMemberCalendar(currentPhysicianId, ownSchedule, officeId) {
    const container = document.getElementById("memberSchedule");
    if (!container) return;

    let physicians = [];
    try {
        const url = officeId
            ? `/api/staff/all-schedules?office_id=${officeId}`
            : `/api/staff/all-schedules`;
        const r = await fetch(url);
        if (r.ok) {
            physicians = await r.json();
        }
    } catch (e) { /* endpoint not yet available — use fallback */ }

    // Fallback: build a single-row view from the current physician's own schedule
    if (!physicians || physicians.length === 0) {
        if (ownSchedule && ownSchedule.length > 0 && currentPhysicianId) {
            physicians = [{
                physician_id: currentPhysicianId,
                first_name: document.getElementById("greetName")?.textContent.replace("Dr. ","") || "You",
                last_name: "",
                specialty: document.getElementById("specialtyBadge")?.textContent || "Physician",
                schedule: ownSchedule
            }];
        } else {
            container.innerHTML = '<p class="loading-msg">No schedule on record</p>';
            return;
        }
    }

    const days = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
    const dayShort = { Monday:'Mon', Tuesday:'Tue', Wednesday:'Wed', Thursday:'Thu', Friday:'Fri', Saturday:'Sat', Sunday:'Sun' };

    function timeFmt12(t) {
        if (!t) return '';
        const parts = t.toString().split(':');
        const h = parseInt(parts[0]);
        const m = parts[1] || '00';
        return `${h % 12 || 12}:${m} ${h < 12 ? 'AM' : 'PM'}`;
    }

    let html = `<table class="ms-table">
      <thead>
        <tr>
          <th>Physician</th>
          ${days.map(d => `<th>${dayShort[d]}</th>`).join('')}
        </tr>
      </thead>
      <tbody>`;

    physicians.forEach(ph => {
        const isMe = ph.physician_id === currentPhysicianId;
        const schedByDay = {};
        days.forEach(d => { schedByDay[d] = []; });
        (ph.schedule || []).forEach(s => {
            if (schedByDay[s.day_of_week]) schedByDay[s.day_of_week].push(s);
        });

        html += `<tr class="${isMe ? 'ms-me' : ''}">
          <td class="ms-name-cell">
            <div class="ms-name">Dr. ${ph.first_name} ${ph.last_name}${isMe ? ' ✦' : ''}</div>
            <div class="ms-spec">${ph.specialty || 'Physician'}</div>
          </td>`;

        days.forEach(day => {
            const shifts = schedByDay[day];
            if (shifts.length > 0) {
                const cellContent = shifts.map(s => {
                    const loc = s.city ? s.city + (s.state ? ', ' + s.state : '') : '';
                    return `<div class="ms-shift">
                        <span class="ms-shift-time">${timeFmt12(s.start_time)} – ${timeFmt12(s.end_time)}</span>
                        ${loc ? `<span class="ms-shift-loc">${loc}</span>` : ''}
                    </div>`;
                }).join('');
                html += `<td class="ms-day-cell">${cellContent}</td>`;
            } else {
                html += `<td class="ms-day-cell"><div class="ms-off">—</div></td>`;
            }
        });

        html += `</tr>`;
    });

    html += `</tbody></table>`;
    container.innerHTML = html;
}

/* ── Clinical Note Modal ── */
let _notePatientId = null;

function openNoteModal(patient_id, patient_name) {
    _notePatientId = patient_id;
    document.getElementById("noteModalPatientName").textContent = "Patient: " + patient_name;
    document.getElementById("note_condition").value = "";
    document.getElementById("note_status").value = "Active";
    document.getElementById("note_notes").value = "";
    const msg = document.getElementById("noteSaveMsg");
    msg.style.display = "none"; msg.textContent = "";
    const modal = document.getElementById("noteModal");
    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeNoteModal() {
    document.getElementById("noteModal").style.display = "none";
    document.body.style.overflow = "";
    _notePatientId = null;
}

async function submitNote() {
    const msg = document.getElementById("noteSaveMsg");
    const condition = document.getElementById("note_condition").value.trim();
    const status    = document.getElementById("note_status").value;
    const notes     = document.getElementById("note_notes").value.trim();

    if (!condition) {
        msg.style.cssText = "display:block;padding:8px 12px;border-radius:6px;font-size:12px;font-weight:700;background:#fee2e2;color:#991b1b";
        msg.textContent = "Please enter a condition or diagnosis.";
        return;
    }

    msg.style.cssText = "display:block;padding:8px 12px;border-radius:6px;font-size:12px;font-weight:700;background:#f0f2f8;color:#555";
    msg.textContent = "Saving…";

    try {
        const r = await fetch("/api/staff/physician/note", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ patient_id: _notePatientId, condition, status, notes })
        });
        const data = await r.json();
        if (!r.ok) throw new Error(data.message || "Failed to save note");
        msg.style.cssText = "display:block;padding:8px 12px;border-radius:6px;font-size:12px;font-weight:700;background:#d1fae5;color:#065f46";
        msg.textContent = "Note saved! Patient's medical history has been updated.";
        setTimeout(closeNoteModal, 1500);
    } catch(err) {
        msg.style.cssText = "display:block;padding:8px 12px;border-radius:6px;font-size:12px;font-weight:700;background:#fee2e2;color:#991b1b";
        msg.textContent = err.message || "Could not save note.";
    }
}

/* ── Referral Modal ── */
function openReferralModal(referral) {
    document.getElementById("refModalPatient").textContent   = `${referral.patient_first} ${referral.patient_last}`;
    document.getElementById("refModalPrimary").textContent   = `Dr. ${referral.primary_first} ${referral.primary_last} (${referral.primary_specialty || "—"})`;
    document.getElementById("refModalReason").textContent    = referral.referral_reason || "—";
    document.getElementById("refModalIssued").textContent    = fmt(referral.date_issued);
    document.getElementById("refModalExpires").textContent   = fmt(referral.expiration_date);
    document.getElementById("refModalStatus").innerHTML      = pill(referral.referral_status_name);

    const acceptBtn = document.getElementById("refModalAccept");
    const rejectBtn = document.getElementById("refModalReject");

    acceptBtn.onclick = () => updateReferralStatus(referral.referral_id, "Approved");
    rejectBtn.onclick = () => updateReferralStatus(referral.referral_id, "Rejected");

    document.getElementById("referralModal").classList.remove("hidden");
}

function closeReferralModal() {
    document.getElementById("referralModal").classList.add("hidden");
}

async function updateReferralStatus(referral_id, status_name) {
    try {
        const res = await fetch(`/api/staff/referral/${referral_id}/status`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ status_name })
        });
        const data = await res.json();
        if (res.ok) {
            closeReferralModal();
            loadIncomingReferrals(window._currentPhysicianId);
        } else {
            alert("Failed to update status: " + (data.message || "Unknown error"));
        }
    } catch (err) {
        alert("Network error updating referral status");
    }
}

async function loadIncomingReferrals(physician_id) {
    const container = document.getElementById("incomingReferralCards");
    if (!container) return;
    container.innerHTML = '<p class="loading-msg">Loading incoming referrals…</p>';
    try {
        const res = await fetch(`/api/staff/physician/referrals?physician_id=${physician_id}`);
        const referrals = await res.json();

        if (!referrals || referrals.length === 0) {
            container.innerHTML = '<p class="loading-msg">No incoming referrals</p>';
            return;
        }

        container.innerHTML = referrals.map(r => `
            <div class="referral-card" onclick="openReferralModal(${JSON.stringify(r).replace(/"/g, '&quot;')})">
                <div class="referral-card-header">
                    <span class="referral-card-patient">${r.patient_first} ${r.patient_last}</span>
                    ${pill(r.referral_status_name)}
                </div>
                <div class="referral-card-meta">Referred by Dr. ${r.primary_first} ${r.primary_last}</div>
                <div class="referral-card-reason">${r.referral_reason || "—"}</div>
                <div class="referral-card-dates">Issued: ${fmt(r.date_issued)} &bull; Expires: ${fmt(r.expiration_date)}</div>
            </div>
        `).join('');
    } catch (err) {
        container.innerHTML = '<p class="loading-msg">Error loading referrals</p>';
    }
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

        /* Store physician_id globally for referral reload */
        window._currentPhysicianId = physician ? physician.physician_id : null;

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
                <td><button onclick='openNoteModal(${a.patient_id},"${a.patient_first} ${a.patient_last}")' style="padding:5px 12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:6px;font-size:11px;font-weight:700;color:#15803d;cursor:pointer;font-family:inherit">+ Note</button></td>
            </tr>`).join("")
            : `<tr><td colspan="7" class="table-empty">No appointments found</td></tr>`;

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

        /* Work schedule — member roster calendar filtered by office */
        const officeId = schedule && schedule.length > 0 ? schedule[0].office_id : null;
        buildMemberCalendar(physician ? physician.physician_id : null, schedule, officeId);

        /* Referrals table (issued by this physician) */
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

        /* Load incoming referrals (where this physician is the specialist) */
        if (physician) {
            loadIncomingReferrals(physician.physician_id);
        }

    } catch (err) {
        console.error("Physician dashboard error:", err);
        document.getElementById("greetSub").textContent = "Could not connect to server.";
    }
}

loadDashboard();

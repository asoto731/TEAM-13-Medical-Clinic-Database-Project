/* ─────────────────────────────────────────────
   Multi-Step Patient Registration
   Steps: 1 Personal → 2 Security → 3 Insurance → 4 Review
─────────────────────────────────────────────── */

/* ── Global state ── */
let _currentStep = 1;
let _insurancePlans = [];    // loaded from /api/auth/insurance-plans
let _selectedInsuranceId = null;   // null = self-pay

/* ── DOB constraints ── */
(function () {
    const dob = document.getElementById("s1_dob");
    if (!dob) return;
    const today = new Date().toISOString().split("T")[0];
    const minDate = new Date();
    minDate.setFullYear(minDate.getFullYear() - 130);
    dob.max = today;
    dob.min = minDate.toISOString().split("T")[0];
})();

/* ── Phone formatter ── */
function formatPhone(e) {
    let raw = e.target.value.replace(/\D/g, "").slice(0, 10);
    if (raw.length <= 3)      e.target.value = raw.length ? "(" + raw : "";
    else if (raw.length <= 6) e.target.value = "(" + raw.slice(0,3) + ") " + raw.slice(3);
    else                      e.target.value = "(" + raw.slice(0,3) + ") " + raw.slice(3,6) + "-" + raw.slice(6);
}
document.getElementById("s1_phone")?.addEventListener("input", formatPhone);

/* ── Password strength ── */
function checkStrength(pw) {
    return {
        len:   pw.length >= 8,
        upper: /[A-Z]/.test(pw),
        num:   /[0-9]/.test(pw),
        spec:  /[^A-Za-z0-9]/.test(pw)
    };
}

document.getElementById("s2_password")?.addEventListener("focus", () => {
    document.getElementById("pwStrengthBox").style.display = "block";
});

document.getElementById("s2_password")?.addEventListener("input", function () {
    const s = checkStrength(this.value);
    const set = (id, pass) => {
        const el = document.getElementById(id);
        if (el) el.className = "pw-rule" + (pass ? " pass" : "");
    };
    set("pw-len",   s.len);
    set("pw-upper", s.upper);
    set("pw-num",   s.num);
    set("pw-spec",  s.spec);
});

/* ── Step navigation ── */
function goStep(n) {
    _currentStep = n;
    for (let i = 1; i <= 4; i++) {
        const panel = document.getElementById("step" + i);
        if (panel) panel.classList.toggle("hidden", i !== n);
    }
    updateLeftPanel(n);
    window.scrollTo({ top: 0, behavior: "smooth" });
}

function updateLeftPanel(current) {
    for (let i = 1; i <= 4; i++) {
        const bubble = document.getElementById("lbubble-" + i);
        const title  = document.getElementById("ltitle-"  + i);
        const desc   = document.getElementById("ldesc-"   + i);
        const line   = document.getElementById("lline-"   + i);

        if (!bubble) continue;

        if (i < current) {
            bubble.className = "reg-step-bubble done";
            bubble.textContent = "✓";
            if (title) { title.className = "reg-step-title done"; }
            if (desc)  { desc.className  = "reg-step-desc done"; }
            if (line)  { line.className  = "reg-step-line done"; }
        } else if (i === current) {
            bubble.className = "reg-step-bubble active";
            bubble.textContent = i;
            if (title) { title.className = "reg-step-title active"; }
            if (desc)  { desc.className  = "reg-step-desc active"; }
            if (line)  { line.className  = "reg-step-line"; }
        } else {
            bubble.className = "reg-step-bubble";
            bubble.textContent = i;
            if (title) { title.className = "reg-step-title"; }
            if (desc)  { desc.className  = "reg-step-desc"; }
            if (line)  { line.className  = "reg-step-line"; }
        }
    }
}

function showError(stepNum, msg) {
    const el = document.getElementById("step" + stepNum + "-error");
    if (!el) return;
    el.textContent = msg;
    el.style.display = "block";
}

function clearError(stepNum) {
    const el = document.getElementById("step" + stepNum + "-error");
    if (el) el.style.display = "none";
}

/* ── Step 1 validation ── */
function step1Next() {
    clearError(1);
    const fname  = document.getElementById("s1_fname").value.trim();
    const lname  = document.getElementById("s1_lname").value.trim();
    const dob    = document.getElementById("s1_dob").value;
    const gender = document.getElementById("s1_gender").value;
    const phone  = document.getElementById("s1_phone").value.trim();

    if (!fname || !lname) { showError(1, "Please enter your first and last name."); return; }

    const phoneDigits = phone.replace(/\D/g, "");
    if (!phone || phoneDigits.length !== 10) { showError(1, "Please enter a valid 10-digit phone number."); return; }

    if (!dob) { showError(1, "Please enter your date of birth."); return; }
    const dobObj = new Date(dob);
    const ageYrs = (new Date() - dobObj) / (365.25 * 24 * 60 * 60 * 1000);
    if (dobObj > new Date() || ageYrs < 18 || ageYrs > 130) {
        showError(1, "You must be at least 18 years old to register.");
        return;
    }

    if (!gender) { showError(1, "Please select a gender."); return; }

    goStep(2);
}

/* ── Step 2 validation ── */
function step2Next() {
    clearError(2);
    const email    = document.getElementById("s2_email").value.trim();
    const password = document.getElementById("s2_password").value;
    const confirm  = document.getElementById("s2_confirm").value;

    if (!email || !email.includes("@")) { showError(2, "Please enter a valid email address."); return; }

    const s = checkStrength(password);
    if (!s.len || !s.upper || !s.num || !s.spec) {
        document.getElementById("pwStrengthBox").style.display = "block";
        showError(2, "Your password must meet all the requirements shown above.");
        return;
    }

    if (password !== confirm) { showError(2, "Passwords do not match. Please re-enter them."); return; }

    // Step 3: load insurance plans if not loaded yet
    if (_insurancePlans.length === 0) loadInsurancePlans();
    goStep(3);
}

/* ── Insurance plans ── */
async function loadInsurancePlans() {
    const container = document.getElementById("insCards");
    try {
        const r = await fetch("/api/auth/insurance-plans");
        _insurancePlans = await r.json();
        renderInsuranceCards();
    } catch (e) {
        container.innerHTML = '<div style="color:#e05c5c;font-size:13px">Could not load insurance plans. You can skip this step and update from your profile later.</div>';
    }
}

function renderInsuranceCards() {
    const container = document.getElementById("insCards");
    const info = {
        "BlueCross BlueShield": {
            sub: "One of the largest health insurance networks in the US.",
            general: "$30–$50",
            specialist: "$60–$90",
            notes: "Accepted at all Audit Trail Health clinics. Covers preventive care at 100% in-network. No referral required for most specialists."
        },
        "Aetna": {
            sub: "Nationwide coverage with strong primary care benefits.",
            general: "$35–$55",
            specialist: "$65–$100",
            notes: "Accepted at all locations. Includes telehealth visits at reduced cost. Strong mental health coverage included."
        },
        "UnitedHealthcare": {
            sub: "Comprehensive coverage with the largest provider network.",
            general: "$25–$45",
            specialist: "$55–$85",
            notes: "Highest coverage percentage of all accepted plans. Includes vision and dental add-ons. Prescription coverage included."
        }
    };

    let html = _insurancePlans.map(plan => {
        const planInfo = info[plan.provider_name] || {
            sub: "Accepted insurance plan.",
            general: "Varies",
            specialist: "Varies",
            notes: "Coverage details depend on your specific policy."
        };
        const cov = plan.coverage_percentage;
        const isSelected = _selectedInsuranceId === plan.insurance_id;

        return `
        <div class="ins-card${isSelected ? " selected" : ""}" id="ins-card-${plan.insurance_id}" onclick="selectInsurance(${plan.insurance_id})">
            <div class="ins-card-top">
                <div>
                    <div class="ins-card-name">${plan.provider_name}</div>
                    <div class="ins-card-sub">${planInfo.sub}</div>
                </div>
                <div class="ins-coverage-badge">${cov}% covered</div>
            </div>
            <div class="ins-card-bottom">
                <button class="ins-learn-btn" onclick="event.stopPropagation(); showInsPopup(${plan.insurance_id})">
                    What&apos;s covered? Learn more &#8599;
                </button>
                <div class="ins-select-indicator"></div>
            </div>
        </div>`;
    }).join("");

    // Self-pay option
    const selfSelected = _selectedInsuranceId === null && _selfPayChosen;
    html += `
    <div class="ins-card ins-card-selfpay${selfSelected ? " selected" : ""}" id="ins-card-selfpay" onclick="selectSelfPay()">
        <div class="ins-card-top">
            <div>
                <div class="ins-card-name">No Insurance / Self-Pay</div>
                <div class="ins-card-sub">Pay full price per visit. Average primary visit: $150–$250.</div>
            </div>
            <div style="font-size:20px">💳</div>
        </div>
        <div class="ins-card-bottom">
            <div style="font-size:12px;color:#aaa">You can add insurance later from your profile. Some providers offer 30–50% cash discounts.</div>
            <div class="ins-select-indicator"></div>
        </div>
    </div>`;

    container.innerHTML = html;
}

let _selfPayChosen = false;

function selectInsurance(id) {
    _selectedInsuranceId = id;
    _selfPayChosen = false;
    renderInsuranceCards();
}

function selectSelfPay() {
    _selectedInsuranceId = null;
    _selfPayChosen = true;
    renderInsuranceCards();
}

function showInsPopup(insuranceId) {
    const plan = _insurancePlans.find(p => p.insurance_id === insuranceId);
    if (!plan) return;

    const cov = plan.coverage_percentage;
    const generalVisit = 150;
    const specialistVisit = 200;
    const generalYouPay = Math.round(generalVisit * (1 - cov / 100));
    const specialistYouPay = Math.round(specialistVisit * (1 - cov / 100));

    const infoMap = {
        "BlueCross BlueShield": "BlueCross BlueShield is accepted at all Audit Trail Health clinic locations. Preventive care visits (annual physicals, screenings) are covered at 100% in-network. Emergency care is covered at the in-network rate regardless of provider. No referral required for most specialist visits.",
        "Aetna": "Aetna provides nationwide coverage with a strong emphasis on primary and preventive care. Telehealth visits are available at a reduced copay. Mental health and behavioral health services are included. Prescription drug coverage is included in most tiers.",
        "UnitedHealthcare": "UnitedHealthcare offers the highest coverage percentage of any plan we accept. Access to the largest provider network in the country. Includes vision and dental add-on options. Prescription coverage with preferred pharmacy network discounts."
    };

    document.getElementById("insPopupName").textContent = plan.provider_name;
    document.getElementById("insPopupCoverage").textContent = cov + "%";
    document.getElementById("insPopupSub").textContent = `Your insurance covers ${cov}% of covered services.`;
    document.getElementById("insPopupGeneral").textContent = "$" + generalYouPay;
    document.getElementById("insPopupSpecialist").textContent = "$" + specialistYouPay;
    document.getElementById("insPopupNotes").textContent = infoMap[plan.provider_name] || "Coverage details vary by policy. Contact your insurance provider for your specific plan details.";

    document.getElementById("insPopupOverlay").style.display = "flex";
}

function closeInsPopup(e) {
    if (!e || e.target === document.getElementById("insPopupOverlay") || e.target.classList.contains("ins-popup-close")) {
        document.getElementById("insPopupOverlay").style.display = "none";
    }
}

/* ── Step 3 validation ── */
function step3Next() {
    clearError(3);
    if (!_selfPayChosen && _selectedInsuranceId === null) {
        showError(3, "Please select an insurance plan, or choose 'No Insurance / Self-Pay' to continue.");
        return;
    }
    buildReview();
    goStep(4);
}

/* ── Step 4: build review ── */
function buildReview() {
    const fname  = document.getElementById("s1_fname").value.trim();
    const lname  = document.getElementById("s1_lname").value.trim();
    const dob    = document.getElementById("s1_dob").value;
    const gender = document.getElementById("s1_gender").value;
    const phone  = document.getElementById("s1_phone").value.trim();
    const email  = document.getElementById("s2_email").value.trim();

    // Format DOB nicely
    const [y, m, d] = dob.split("-").map(Number);
    const dobDisplay = new Date(y, m-1, d).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" });

    // Insurance display
    let insDisplay = "No Insurance / Self-Pay";
    let insBadge = "";
    if (_selectedInsuranceId !== null) {
        const plan = _insurancePlans.find(p => p.insurance_id === _selectedInsuranceId);
        if (plan) {
            insDisplay = plan.provider_name;
            insBadge = `<div class="review-insurance-card" style="margin-top:10px">
                <div>${plan.provider_name}</div>
                <div>${plan.coverage_percentage}% coverage</div>
            </div>`;
        }
    }

    document.getElementById("reviewContent").innerHTML = `
        <div class="review-card">
            <div class="review-section-title">Personal Information</div>
            <div class="review-row"><span class="review-label">Full Name</span><span class="review-value">${fname} ${lname}</span></div>
            <div class="review-row"><span class="review-label">Date of Birth</span><span class="review-value">${dobDisplay}</span></div>
            <div class="review-row"><span class="review-label">Gender</span><span class="review-value">${gender}</span></div>
            <div class="review-row"><span class="review-label">Phone</span><span class="review-value">${phone}</span></div>
        </div>
        <div class="review-card">
            <div class="review-section-title">Account</div>
            <div class="review-row"><span class="review-label">Email / Username</span><span class="review-value">${email}</span></div>
            <div class="review-row"><span class="review-label">Password</span><span class="review-value">••••••••••</span></div>
        </div>
        <div class="review-card">
            <div class="review-section-title">Insurance &amp; Billing</div>
            ${insBadge || `<div style="color:#888;font-size:13px">No Insurance — you will pay full price per visit. You can add insurance anytime from your profile.</div>`}
            <div style="font-size:11px;color:#aaa;margin-top:10px;line-height:1.6">
                Medical professional services are not subject to sales tax. Billing is per-appointment (fee-for-service).
                Your primary physician will be chosen after your account is created.
            </div>
        </div>
        <div style="background:#fef9ec;border:1px solid #f59e0b44;border-radius:10px;padding:14px 18px;font-size:13px;color:#92400e;line-height:1.6;margin-bottom:4px">
            By creating an account you confirm all information above is accurate. Your date of birth cannot be changed after registration and is used to verify your identity.
        </div>`;
}

/* ── Submit ── */
async function submitRegistration() {
    clearError(4);
    const btn = document.getElementById("createBtn");
    btn.disabled = true;
    btn.textContent = "Creating account…";

    const fname  = document.getElementById("s1_fname").value.trim();
    const lname  = document.getElementById("s1_lname").value.trim();
    const dob    = document.getElementById("s1_dob").value;
    const phone  = document.getElementById("s1_phone").value.trim();
    const email  = document.getElementById("s2_email").value.trim();
    const password = document.getElementById("s2_password").value;

    try {
        const r = await fetch("/api/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                name: fname + " " + lname,
                email,
                password,
                phone_number: phone,
                date_of_birth: dob,
                insurance_id: _selectedInsuranceId || null,
                role: "patient"
            })
        });

        const data = await r.json();

        if (r.ok) {
            // Success — show confirmation then redirect
            document.getElementById("reviewContent").innerHTML = `
                <div style="text-align:center;padding:32px 0">
                    <div style="font-size:56px;margin-bottom:16px">✓</div>
                    <h2 style="color:#10b981;font-size:22px;margin-bottom:8px">Account Created!</h2>
                    <p style="color:#888;font-size:14px;line-height:1.6">Welcome to Audit Trail Health, ${fname}.<br>Redirecting you to sign in…</p>
                </div>`;
            document.querySelector(".reg-nav").style.display = "none";
            setTimeout(() => {
                window.location.href = "/client/auth/patient_login.html";
            }, 2000);
        } else {
            showError(4, data.error || "Registration failed. Please go back and check your information.");
            btn.disabled = false;
            btn.textContent = "Create My Account ✓";
        }
    } catch (err) {
        showError(4, "Server error. Please make sure the server is running and try again.");
        btn.disabled = false;
        btn.textContent = "Create My Account ✓";
    }
}

/* ── Load insurance plans on page load (preload for faster Step 3) ── */
loadInsurancePlans();

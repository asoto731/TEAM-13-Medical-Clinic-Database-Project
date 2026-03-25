// Seed script: adds completed appointments, then inserts
// diagnosis, treatment, and referral data.
// Run with: node database/seed_clinical.js

const db = require('../db');

function formatDate(val) {
  if (!val) return null;
  if (val instanceof Date) return val.toISOString().split('T')[0];
  return String(val).split('T')[0];
}

function run() {
  // Step 1: Insert additional completed appointments (future dates so trigger doesn't block)
  // Physician constraint: one location per day so pick distinct (physician_id, date) combos
  const additionalAppointments = [
    { patient_id: 3, physician_id: 9,  office_id: 3, appointment_date: '2026-10-15', appointment_time: '09:00:00', reason: 'Headaches and dizziness' },
    { patient_id: 4, physician_id: 6,  office_id: 4, appointment_date: '2026-10-22', appointment_time: '10:30:00', reason: 'Fatigue and weight gain' },
    { patient_id: 5, physician_id: 7,  office_id: 3, appointment_date: '2026-11-05', appointment_time: '08:00:00', reason: 'Chest tightness and shortness of breath' },
    { patient_id: 1, physician_id: 14, office_id: 3, appointment_date: '2026-11-12', appointment_time: '11:00:00', reason: 'Persistent cough and wheezing' },
    { patient_id: 2, physician_id: 23, office_id: 2, appointment_date: '2026-11-18', appointment_time: '14:00:00', reason: 'Persistent sadness and low energy' },
    { patient_id: 3, physician_id: 1,  office_id: 1, appointment_date: '2026-12-01', appointment_time: '09:30:00', reason: 'Lower back pain' },
  ];

  let insertedAppointmentIds = [];

  function insertAppointment(idx) {
    if (idx >= additionalAppointments.length) {
      fetchCompletedAppointments();
      return;
    }
    const a = additionalAppointments[idx];
    const sql = `INSERT INTO appointment (patient_id, physician_id, office_id, appointment_date, appointment_time, status_id, booking_method, reason_for_visit)
                 VALUES (?, ?, ?, ?, ?, 2, 'in-person', ?)`;
    db.query(sql, [a.patient_id, a.physician_id, a.office_id, a.appointment_date, a.appointment_time, a.reason], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          console.log(`Skipping duplicate appointment for physician ${a.physician_id} on ${a.appointment_date}`);
        } else {
          console.error(`Error inserting appointment ${idx + 1}:`, err.message);
        }
      } else {
        insertedAppointmentIds.push(result.insertId);
        console.log(`Inserted appointment ${idx + 1} with ID ${result.insertId}`);
      }
      insertAppointment(idx + 1);
    });
  }

  let completedAppointments = [];

  function fetchCompletedAppointments() {
    db.query(
      'SELECT appointment_id, patient_id, physician_id, appointment_date FROM appointment WHERE status_id = 2 ORDER BY appointment_id LIMIT 8',
      (err, rows) => {
        if (err) { console.error('Error fetching completed appointments:', err.message); process.exit(1); }
        completedAppointments = rows;
        console.log(`\nFound ${rows.length} completed appointments: [${rows.map(r => r.appointment_id).join(', ')}]`);
        seedDiagnoses();
      }
    );
  }

  function seedDiagnoses() {
    const diagnosisData = [
      { icd: 'M54.5',  desc: 'Low back pain',                  severity: 'Mild',     notes: 'Patient reports lumbar pain radiating to left leg. No neurological deficits.' },
      { icd: 'J06.9',  desc: 'Upper respiratory infection',     severity: 'Mild',     notes: 'Viral URI, no bacterial signs. Symptomatic treatment recommended.' },
      { icd: 'E11.9',  desc: 'Type 2 diabetes mellitus',        severity: 'Moderate', notes: 'HbA1c elevated at 8.2%. Dietary counseling provided.' },
      { icd: 'I10',    desc: 'Essential hypertension',           severity: 'Moderate', notes: 'BP 148/92. Lifestyle modifications and medication adjustment required.' },
      { icd: 'K21.0',  desc: 'GERD with esophagitis',           severity: 'Mild',     notes: 'Heartburn and regurgitation for 3 months. PPI therapy initiated.' },
      { icd: 'M79.3',  desc: 'Panniculitis',                    severity: 'Mild',     notes: 'Tender subcutaneous nodules on lower legs. Biopsy deferred.' },
      { icd: 'J45.20', desc: 'Mild intermittent asthma',        severity: 'Mild',     notes: 'Occasional wheezing with exercise. Peak flow normal at rest.' },
      { icd: 'F32.1',  desc: 'Major depressive disorder',       severity: 'Moderate', notes: 'PHQ-9 score 14. Two-week history of depressed mood and anhedonia.' },
    ];

    const insertedDiagnosisIds = [];
    let diagIdx = 0;

    function insertNextDiagnosis() {
      if (diagIdx >= completedAppointments.length || diagIdx >= diagnosisData.length) {
        console.log(`\nInserted ${insertedDiagnosisIds.length} diagnoses`);
        seedTreatments(insertedDiagnosisIds);
        return;
      }
      const appt = completedAppointments[diagIdx];
      const diag = diagnosisData[diagIdx];
      const diagDateStr = formatDate(appt.appointment_date);

      const sql = `INSERT INTO diagnosis (appointment_id, physician_id, diagnosis_code, diagnosis_description, diagnosis_date, severity, notes)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
      db.query(sql, [appt.appointment_id, appt.physician_id, diag.icd, diag.desc, diagDateStr, diag.severity, diag.notes], (err, result) => {
        if (err) {
          console.error(`Error inserting diagnosis ${diagIdx + 1} for appt ${appt.appointment_id}:`, err.message);
        } else {
          insertedDiagnosisIds.push(result.insertId);
          console.log(`Inserted diagnosis ${diagIdx + 1}: ${diag.icd} "${diag.desc}" (ID ${result.insertId})`);
        }
        diagIdx++;
        insertNextDiagnosis();
      });
    }
    insertNextDiagnosis();
  }

  function seedTreatments(diagnosisIds) {
    const treatmentData = [
      {
        plan: 'Physical therapy 3x/week for 6 weeks. Core strengthening exercises. Avoid heavy lifting.',
        medication: 'Ibuprofen 400mg TID with food; Cyclobenzaprine 5mg QHS PRN',
        followUp: '2026-12-15',
        notes: 'Reassess in 6 weeks. MRI if no improvement.'
      },
      {
        plan: 'Rest, hydration, and symptomatic relief. Saline nasal irrigation. Avoid antibiotic use.',
        medication: 'Pseudoephedrine 60mg Q6H PRN; Guaifenesin 400mg Q4H PRN',
        followUp: '2026-12-10',
        notes: 'Return if fever persists >3 days or symptoms worsen.'
      },
      {
        plan: 'Low-carb diet plan provided. Daily 30-min walks. Blood glucose monitoring at home.',
        medication: 'Metformin 500mg BID with meals; Atorvastatin 10mg QD',
        followUp: '2027-01-15',
        notes: 'Refer to diabetes educator. Recheck HbA1c in 3 months.'
      },
      {
        plan: 'DASH diet counseling. Reduce sodium intake. Aerobic exercise 150 min/week.',
        medication: 'Lisinopril 10mg QD; Amlodipine 5mg QD',
        followUp: '2027-01-20',
        notes: 'Monitor BP at home daily. Repeat BMP in 1 month.'
      },
      {
        plan: 'Elevate head of bed. Avoid trigger foods (spicy, fatty, citrus). Small frequent meals.',
        medication: 'Omeprazole 20mg QD before breakfast; Calcium carbonate 500mg PRN',
        followUp: '2027-02-01',
        notes: 'Upper endoscopy if no response in 8 weeks.'
      },
      {
        plan: 'Compression bandaging to lower legs. Avoid prolonged standing.',
        medication: 'Hydroxychloroquine 200mg BID; Naproxen 500mg BID with food',
        followUp: '2027-02-10',
        notes: 'Dermatology referral for biopsy consideration.'
      },
      {
        plan: 'Short-acting beta-agonist rescue inhaler as needed. Trigger identification and avoidance.',
        medication: 'Albuterol MDI 2 puffs Q4-6H PRN; Fluticasone 44mcg 1 puff BID',
        followUp: '2027-03-15',
        notes: 'Pulmonary function testing in 3 months. Asthma action plan given.'
      },
      {
        plan: 'Cognitive behavioral therapy (CBT) referral. Sleep hygiene counseling. Social support network.',
        medication: 'Sertraline 50mg QD; Lorazepam 0.5mg PRN for anxiety (short-term)',
        followUp: '2027-02-28',
        notes: 'PHQ-9 reassessment at follow-up. Safety plan reviewed.'
      },
    ];

    let tIdx = 0;

    function insertNextTreatment() {
      if (tIdx >= diagnosisIds.length || tIdx >= treatmentData.length) {
        console.log(`\nInserted ${tIdx} treatments`);
        seedReferrals();
        return;
      }
      const t = treatmentData[tIdx];
      const diagId = diagnosisIds[tIdx];
      const sql = `INSERT INTO treatment (diagnosis_id, treatment_plan, prescribed_medication, follow_up_date, notes)
                   VALUES (?, ?, ?, ?, ?)`;
      db.query(sql, [diagId, t.plan, t.medication, t.followUp, t.notes], (err, result) => {
        if (err) {
          console.error(`Error inserting treatment ${tIdx + 1}:`, err.message);
        } else {
          console.log(`Inserted treatment ${tIdx + 1} (ID ${result.insertId}) for diagnosis ${diagId}`);
        }
        tIdx++;
        insertNextTreatment();
      });
    }
    insertNextTreatment();
  }

  function seedReferrals() {
    // referral_status_id: 1=Pending, 2=Approved, 3=Rejected, 4=Expired
    const referrals = [
      {
        patient_id: 1, primary_physician_id: 3, specialist_id: 1,
        date_issued: '2026-04-01', expiration_date: '2026-10-01',
        referral_status_id: 2,
        reason: 'Persistent low back pain unresponsive to conservative treatment; orthopedic evaluation needed'
      },
      {
        patient_id: 2, primary_physician_id: 5, specialist_id: 23,
        date_issued: '2026-04-05', expiration_date: '2026-10-05',
        referral_status_id: 1,
        reason: 'New onset hypertension with cardiac risk factors; psychiatry consult for anxiety co-morbidity'
      },
      {
        patient_id: 3, primary_physician_id: 9, specialist_id: 14,
        date_issued: '2026-04-10', expiration_date: '2026-10-10',
        referral_status_id: 2,
        reason: 'Chronic headaches with suspected migraine; pulmonology evaluation for co-existing cough'
      },
      {
        patient_id: 4, primary_physician_id: 6, specialist_id: 8,
        date_issued: '2026-04-12', expiration_date: '2026-10-12',
        referral_status_id: 1,
        reason: 'Type 2 diabetes with early signs of neuropathy; cardiology consult for cardiovascular risk'
      },
      {
        patient_id: 5, primary_physician_id: 7, specialist_id: 21,
        date_issued: '2026-04-15', expiration_date: '2026-10-15',
        referral_status_id: 3,
        reason: 'Persistent asthma with recurrent exacerbations; oncology screening to rule out underlying malignancy'
      },
    ];

    let rIdx = 0;

    function insertNextReferral() {
      if (rIdx >= referrals.length) {
        console.log(`\nInserted ${rIdx} referrals`);
        console.log('\n✓ Seed complete! All clinical data inserted successfully.');
        process.exit(0);
        return;
      }
      const r = referrals[rIdx];
      const sql = `INSERT INTO referral (patient_id, primary_physician_id, specialist_id, date_issued, expiration_date, referral_status_id, referral_reason)
                   VALUES (?, ?, ?, ?, ?, ?, ?)`;
      db.query(sql, [r.patient_id, r.primary_physician_id, r.specialist_id, r.date_issued, r.expiration_date, r.referral_status_id, r.reason], (err, result) => {
        if (err) {
          console.error(`Error inserting referral ${rIdx + 1}:`, err.message);
        } else {
          console.log(`Inserted referral ${rIdx + 1} (ID ${result.insertId}): patient ${r.patient_id} → specialist ${r.specialist_id}`);
        }
        rIdx++;
        insertNextReferral();
      });
    }
    insertNextReferral();
  }

  // Start the chain
  insertAppointment(0);
}

run();

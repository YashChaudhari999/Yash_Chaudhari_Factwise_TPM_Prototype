(() => {
  'use strict';

  const STORAGE_KEY = 'caretrack_v2_state';
  const CAPACITY = 74;

  const $ = (id) => document.getElementById(id);

  const ICONS = {
    alert: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>',
    close: '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>'
  };

  function localDateStr(date = new Date()) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function daysAgo(n) {
    const d = new Date();
    d.setHours(12, 0, 0, 0);
    d.setDate(d.getDate() - n);
    return localDateStr(d);
  }

  function daysBetween(startDateStr, endDateStr) {
    const s = new Date(`${startDateStr}T12:00:00`);
    const e = new Date(`${endDateStr}T12:00:00`);
    return Math.max(1, Math.round((e - s) / 86400000) + 1);
  }

  function esc(str) {
    return String(str ?? '').replace(/[&<>"']/g, (ch) => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    }[ch]));
  }

  function roomLabel(num) {
    return `Room ${String(num).padStart(2, '0')}`;
  }

  function parseRoomNum(roomStr) {
    const m = String(roomStr || '').match(/(\d+)/);
    return m ? Number(m[1]) : 999;
  }

  function createSeedState() {
    const today = localDateStr();
    const firstNames = [
      'Aarav', 'Priya', 'Kabir', 'Anaya', 'Vihaan', 'Diya', 'Rohan', 'Meera',
      'Aditya', 'Sanya', 'Ishaan', 'Kavya', 'Arjun', 'Nisha', 'Dev', 'Tara',
      'Siddharth', 'Rhea', 'Karan', 'Pooja', 'Nikhil', 'Shreya', 'Rahul', 'Neha',
      'Vikram', 'Aditi', 'Manav', 'Swati', 'Pranav', 'Ira', 'Harsh', 'Sneha',
      'Yash', 'Tanvi', 'Rishi', 'Manya', 'Varun', 'Zoya'
    ];
    const lastNames = [
      'Mehta', 'Shah', 'Joshi', 'Patel', 'Desai', 'Nair', 'Kulkarni', 'Sharma',
      'Verma', 'Iyer', 'Gupta', 'Reddy', 'Kapoor', 'Malhotra', 'Bose', 'Menon',
      'Rao', 'Chawla', 'Sinha', 'Bansal'
    ];

    const patients = [];
    for (let r = 1; r <= CAPACITY; r++) {
      const id = `P-${String(100 + r)}`;
      const name = `${firstNames[(r - 1) % firstNames.length]} ${lastNames[(r * 3) % lastNames.length]}`;
      const room = roomLabel(r);
      let admitDays = 4 + (r % 6);
      const temps = [];
      const visits = [];
      let dischargeApproved = false;
      let dischargeApprovedBy = null;
      let dischargeApprovedAt = null;

      if (r <= 3) {
        admitDays = 7 + r;
        temps.push(
          { date: daysAgo(4), value: 38.4, note: 'Initial ward fever', by: 'Nurse', at: `${daysAgo(4)}T09:10:00` },
          { date: daysAgo(3), value: 37.1, note: 'Fever subsiding', by: 'Nurse', at: `${daysAgo(3)}T09:05:00` },
          { date: daysAgo(2), value: 36.8, note: 'Afebrile', by: 'Nurse', at: `${daysAgo(2)}T09:15:00` },
          { date: daysAgo(1), value: 36.7, note: 'Stable normal temp', by: 'Nurse', at: `${daysAgo(1)}T09:00:00` },
          { date: today, value: 36.6, note: 'Day 3+ afebrile check', by: 'Nurse', at: `${today}T08:40:00` }
        );
        visits.push(
          { date: daysAgo(1), outcome: 'Continue supportive care', treatment: 'Hydration & vitals watch', note: 'Improving steadily', by: 'Dr. Rao', at: `${daysAgo(1)}T11:30:00` },
          { date: today, outcome: 'Cleared for discharge', treatment: 'Discontinue isolation protocol', note: 'Meets 3-day no-fever rule; forwarded to Admin', by: 'Dr. Rao', at: `${today}T10:15:00` }
        );
        dischargeApproved = true;
        dischargeApprovedBy = 'Dr. Rao';
        dischargeApprovedAt = `${today}T10:16:00`;
      } else if (r <= 5) {
        admitDays = 6 + r;
        temps.push(
          { date: daysAgo(3), value: 38.2, note: 'Mild evening spike', by: 'Nurse', at: `${daysAgo(3)}T10:00:00` },
          { date: daysAgo(2), value: 37.0, note: 'Afebrile', by: 'Nurse', at: `${daysAgo(2)}T09:00:00` },
          { date: daysAgo(1), value: 36.9, note: 'Normal reading', by: 'Nurse', at: `${daysAgo(1)}T09:10:00` },
          { date: today, value: 36.7, note: '3rd consecutive normal day', by: 'Nurse', at: `${today}T08:50:00` }
        );
        visits.push(
          { date: daysAgo(1), outcome: 'Stable, monitor 24h', treatment: 'Oral fluids, rest', note: 'One more normal day needed', by: 'Dr. Sen', at: `${daysAgo(1)}T12:00:00` }
        );
      } else if (r <= 12) {
        admitDays = 5;
        temps.push(
          { date: daysAgo(3), value: 38.5, note: 'Moderate fever', by: 'Nurse', at: `${daysAgo(3)}T09:00:00` },
          { date: daysAgo(2), value: 37.3, note: 'Afebrile', by: 'Nurse', at: `${daysAgo(2)}T09:00:00` },
          { date: daysAgo(1), value: 36.9, note: 'Afebrile', by: 'Nurse', at: `${daysAgo(1)}T09:00:00` }
        );
        visits.push(
          { date: daysAgo(1), outcome: 'Responding to care', treatment: 'Continue antipyretics PRN', note: 'Check Day 3 temp tomorrow', by: 'Dr. Rao', at: `${daysAgo(1)}T13:15:00` }
        );
      } else if (r <= 27) {
        const hasFever = r % 3 === 0;
        const tToday = hasFever ? Number((38.2 + (r % 4) * 0.4).toFixed(1)) : Number((36.8 + (r % 4) * 0.2).toFixed(1));
        temps.push(
          { date: daysAgo(2), value: 38.7, note: 'Persistent fever', by: 'Nurse', at: `${daysAgo(2)}T09:20:00` },
          { date: daysAgo(1), value: hasFever ? 38.5 : 37.4, note: hasFever ? 'Elevated temp' : 'Settling', by: 'Nurse', at: `${daysAgo(1)}T09:20:00` },
          { date: today, value: tToday, note: hasFever ? 'Fever persists on morning check' : 'Morning vitals logged', by: 'Nurse', at: `${today}T08:30:00` }
        );
        visits.push(
          { date: daysAgo(1), outcome: hasFever ? 'Escalate monitoring' : 'Continue supportive care', treatment: hasFever ? 'Antipyretics + IV hydration' : 'Standard quarantine care', note: 'Daily review', by: 'Dr. Sen', at: `${daysAgo(1)}T14:00:00` }
        );
      } else if (r <= 42) {
        const hasFever = r % 5 === 0;
        const tToday = hasFever ? 38.4 : 37.1;
        temps.push(
          { date: daysAgo(2), value: 38.6, note: 'Initial admission check', by: 'Nurse', at: `${daysAgo(2)}T08:45:00` },
          { date: daysAgo(1), value: hasFever ? 38.8 : 37.6, note: 'Routine check', by: 'Nurse', at: `${daysAgo(1)}T08:45:00` },
          { date: today, value: tToday, note: 'Morning vitals complete', by: 'Nurse', at: `${today}T08:15:00` }
        );
        visits.push(
          { date: today, outcome: hasFever ? 'Monitor closely' : 'Reviewed, continue care', treatment: hasFever ? 'Oxygen watch + antipyretic' : 'Oral hydration', note: 'Same-day round completed', by: 'Dr. Rao', at: `${today}T10:30:00` }
        );
      } else {
        const prevTemp = r % 4 === 0 ? 38.9 : 37.5;
        temps.push(
          { date: daysAgo(2), value: 38.3, note: 'Admitted with fever', by: 'Nurse', at: `${daysAgo(2)}T09:10:00` },
          { date: daysAgo(1), value: prevTemp, note: 'Yesterday vitals', by: 'Nurse', at: `${daysAgo(1)}T09:10:00` }
        );
        visits.push(
          { date: daysAgo(1), outcome: 'Continue supportive care', treatment: 'Standard quarantine protocol', note: 'Awaiting next-day temp', by: 'Dr. Sen', at: `${daysAgo(1)}T15:00:00` }
        );
      }

      patients.push({
        id,
        name,
        room,
        admitDate: daysAgo(admitDays),
        status: 'Active',
        closedDate: null,
        outcomeNote: '',
        dischargeApproved,
        dischargeApprovedBy,
        dischargeApprovedAt,
        temps,
        visits
      });
    }

    for (let c = 1; c <= 20; c++) {
      const isDeceased = c === 6 || c === 13 || c === 19;
      const admitOff = 12 + (c % 5);
      const closeOff = 2 + (c % 4);
      const id = `P-0${String(70 + c).padStart(2, '0')}`;
      const name = `${firstNames[(c + 7) % firstNames.length]} ${lastNames[(c + 5) % lastNames.length]}`;
      patients.push({
        id,
        name,
        room: roomLabel(((c * 3) % CAPACITY) + 1),
        admitDate: daysAgo(admitOff),
        status: isDeceased ? 'Deceased' : 'Discharged',
        closedDate: daysAgo(closeOff),
        outcomeNote: isDeceased
          ? 'Severe respiratory complications with persistent high fever'
          : 'Completed 3 consecutive fever-free days; discharged',
        dischargeApproved: !isDeceased,
        dischargeApprovedBy: isDeceased ? null : 'Dr. Rao',
        dischargeApprovedAt: isDeceased ? null : `${daysAgo(closeOff)}T10:00:00`,
        temps: isDeceased
          ? [{ date: daysAgo(closeOff + 1), value: 39.8, note: 'Critical fever', by: 'Nurse', at: `${daysAgo(closeOff + 1)}T09:00:00` }]
          : [
            { date: daysAgo(closeOff + 2), value: 36.8, note: 'Afebrile', by: 'Nurse', at: `${daysAgo(closeOff + 2)}T09:00:00` },
            { date: daysAgo(closeOff + 1), value: 36.7, note: 'Afebrile', by: 'Nurse', at: `${daysAgo(closeOff + 1)}T09:00:00` },
            { date: daysAgo(closeOff), value: 36.6, note: 'Cleared', by: 'Nurse', at: `${daysAgo(closeOff)}T09:00:00` }
          ],
        visits: []
      });
    }

    return {
      role: 'Nurse',
      activeTab: 'overview',
      queueFilter: 'all',
      queueSearch: '',
      queueSort: 'priority',
      selectedPatientId: null,
      prefillRoom: '',
      settings: {
        feverThreshold: 38.0,
        requiredNoFeverDays: 3,
        maxMortalityPercent: 15.0
      },
      patients,
      activity: [
        { at: new Date().toISOString(), type: 'good', text: 'Dr. Rao approved P-101, P-102, P-103 for Admin discharge (3+ days afebrile)' },
        { at: `${daysAgo(0)}T08:50:00`, type: 'info', text: 'Morning nurse shift logged 35/74 daily temperatures' },
        { at: `${daysAgo(1)}T16:30:00`, type: 'info', text: 'Ward reached 74 / 74 full bed occupancy' }
      ]
    };
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return createSeedState();
      const parsed = JSON.parse(raw);
      if (!parsed || !Array.isArray(parsed.patients)) return createSeedState();
      return parsed;
    } catch {
      return createSeedState();
    }
  }

  let state = loadState();
  let toastTimer = null;
  let toastRemaining = 0;
  let toastStartedAt = 0;
  let toastPaused = false;
  let lastDrawerPatientId = null;
  let lastDrawerTrigger = null;

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function scheduleToastDismiss(delay) {
    clearTimeout(toastTimer);
    toastRemaining = delay;
    if (toastPaused || (typeof document !== 'undefined' && document.hidden)) return;
    toastStartedAt = Date.now();
    toastTimer = setTimeout(() => {
      const el = $('toast');
      el.classList.remove('is-open');
      el.setAttribute('aria-hidden', 'true');
      toastRemaining = 0;
    }, delay);
  }

  function pauseToastTimer() {
    if (!toastRemaining) return;
    clearTimeout(toastTimer);
    toastRemaining = Math.max(400, toastRemaining - (Date.now() - toastStartedAt));
  }

  function showToast(msg, tone = 'info') {
    const el = $('toast');
    el.textContent = msg;
    el.className = `toast is-open ${tone === 'bad' ? 'bad' : tone === 'good' ? 'good' : ''}`;
    el.setAttribute('aria-hidden', 'false');
    scheduleToastDismiss(3800);
  }

  const toastEl = $('toast');
  if (toastEl && typeof toastEl.addEventListener === 'function') {
    toastEl.addEventListener('mouseenter', () => {
      toastPaused = true;
      pauseToastTimer();
    });
    toastEl.addEventListener('mouseleave', () => {
      toastPaused = false;
      if (toastRemaining > 0) scheduleToastDismiss(toastRemaining);
    });
  }
  if (typeof document !== 'undefined' && typeof document.addEventListener === 'function') {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) pauseToastTimer();
      else if (!toastPaused && toastRemaining > 0) scheduleToastDismiss(toastRemaining);
    });
  }

  function addActivity(text, type = 'info') {
    state.activity.unshift({
      at: new Date().toISOString(),
      type,
      text
    });
    state.activity = state.activity.slice(0, 25);
  }

  function todayStr() {
    return localDateStr();
  }

  function latestTemp(p) {
    if (!p.temps.length) return null;
    return [...p.temps].sort((a, b) => (b.date + (b.at || '')).localeCompare(a.date + (a.at || '')))[0];
  }

  function hasTempOnDate(p, dateStr) {
    return p.temps.some((t) => t.date === dateStr);
  }

  function hasVisitOnDate(p, dateStr) {
    return p.visits.some((v) => v.date === dateStr);
  }

  function feverFreeDays(p) {
    if (p.status !== 'Active') return 0;
    const threshold = Number(state.settings.feverThreshold);
    const today = todayStr();
    const startOffset = hasTempOnDate(p, today) ? 0 : 1;
    let streak = 0;
    for (let i = startOffset; i < 60; i++) {
      const d = daysAgo(i);
      const dayTemps = p.temps.filter((t) => t.date === d);
      if (!dayTemps.length) break;
      if (dayTemps.some((t) => Number(t.value) >= threshold)) break;
      streak++;
    }
    return streak;
  }

  function isDischargeEligible(p) {
    return p.status === 'Active' && feverFreeDays(p) >= Number(state.settings.requiredNoFeverDays);
  }

  function isFever(tempObj) {
    return tempObj && Number(tempObj.value) >= Number(state.settings.feverThreshold);
  }

  function activePatients() {
    return state.patients.filter((p) => p.status === 'Active');
  }

  function closedPatients() {
    return state.patients.filter((p) => p.status === 'Discharged' || p.status === 'Deceased');
  }

  function qualityMetrics() {
    const closed = closedPatients();
    const cured = closed.filter((p) => p.status === 'Discharged').length;
    const deceased = closed.filter((p) => p.status === 'Deceased').length;
    const total = closed.length;
    const cureRate = total ? (cured / total) * 100 : 100;
    const mortalityRate = total ? (deceased / total) * 100 : 0;
    const avgLos = total
      ? closed.reduce((acc, p) => acc + daysBetween(p.admitDate, p.closedDate || todayStr()), 0) / total
      : 0;
    return { total, cured, deceased, cureRate, mortalityRate, avgLos };
  }

  function vacantRooms() {
    const occupied = new Set(activePatients().map((p) => p.room));
    const list = [];
    for (let r = 1; r <= CAPACITY; r++) {
      const label = roomLabel(r);
      if (!occupied.has(label)) list.push(label);
    }
    return list;
  }

  function canRecordTemp(role) {
    return role === 'Nurse';
  }

  function canDoctorAct(role) {
    return role === 'Doctor' || role === 'Head Doctor';
  }

  function canAdminAct(role) {
    return role === 'Admin';
  }

  function canEditSettings(role) {
    return role === 'Head Doctor';
  }

  function renderAfebrileTrack(streak, reqDays) {
    const cells = Array.from({ length: reqDays }, (_, idx) =>
      `<span class="afebrile-cell ${idx < streak ? 'filled' : ''}"></span>`
    ).join('');
    return `<div class="afebrile-track" title="${streak} of ${reqDays} consecutive fever-free days">${cells}<span class="tnum subtext" style="margin-left:4px">${streak}/${reqDays}</span></div>`;
  }

  // Mutation Actions
  function recordTemperature(patientId, { value, date, note }) {
    if (!canRecordTemp(state.role)) {
      return showToast('Permission denied: Only Nurses can record temperature readings', 'bad');
    }
    const p = state.patients.find((x) => x.id === patientId);
    if (!p || p.status !== 'Active') {
      return showToast('Cannot record temperature for an inactive or closed patient', 'bad');
    }

    const today = todayStr();
    const num = Number(value);
    if (!Number.isFinite(num) || num < 30 || num > 45) {
      return showToast('Invalid temperature: Enter a value between 30.0°C and 45.0°C', 'bad');
    }
    if (!date || date > today) {
      return showToast('Invalid date: Future temperature records are not allowed', 'bad');
    }
    if (date < p.admitDate) {
      return showToast(`Invalid date: Cannot record before admission date (${p.admitDate})`, 'bad');
    }

    if (hasTempOnDate(p, date)) {
      const ok = window.confirm(
        `Warning: ${p.name} (${p.id}) already has a temperature reading on ${date}. Record an additional clinical re-check?`
      );
      if (!ok) return;
    }

    p.temps.push({
      date,
      value: Number(num.toFixed(1)),
      note: (note || '').trim() || 'Routine ward reading',
      by: state.role,
      at: new Date().toISOString()
    });

    const threshold = Number(state.settings.feverThreshold);
    let activityType = 'info';
    let msg = `Nurse logged ${num.toFixed(1)}°C for ${p.name} (${p.room}) on ${date}`;

    if (num >= threshold) {
      activityType = 'alert';
      if (p.dischargeApproved) {
        p.dischargeApproved = false;
        p.dischargeApprovedBy = null;
        p.dischargeApprovedAt = null;
        msg += ' — Fever spike revoked prior discharge approval';
      }
      if (num >= 40.0) {
        showToast(`Critical high fever (${num.toFixed(1)}°C) recorded for ${p.name}`, 'bad');
      } else {
        showToast(`Fever recorded (${num.toFixed(1)}°C >= ${threshold}°C) for ${p.name}. Streak reset to 0`, 'bad');
      }
    } else if (num < 35.0) {
      activityType = 'alert';
      showToast(`Critical low temperature (${num.toFixed(1)}°C) recorded for ${p.name}`, 'bad');
    } else {
      const streak = feverFreeDays(p);
      if (streak >= Number(state.settings.requiredNoFeverDays)) {
        activityType = 'good';
        msg += ` — Reached ${streak}/${state.settings.requiredNoFeverDays} fever-free days`;
        showToast(`${p.name} reached ${streak} fever-free days and is ready for Doctor approval`, 'good');
      } else {
        showToast(`Saved ${num.toFixed(1)}°C for ${p.name} (${streak}/${state.settings.requiredNoFeverDays} afebrile days)`, 'good');
      }
    }

    addActivity(msg, activityType);
    saveState();
    render();
  }

  function recordDoctorVisit(patientId, { outcome, treatment, note }) {
    if (!canDoctorAct(state.role)) {
      return showToast('Permission denied: Only a Doctor or Head Doctor can record visits', 'bad');
    }
    const p = state.patients.find((x) => x.id === patientId);
    if (!p || p.status !== 'Active') {
      return showToast('Cannot log visit for a closed patient', 'bad');
    }

    const today = todayStr();
    if (!hasTempOnDate(p, today)) {
      return showToast('Blocked: Nurse must record today’s temperature before the Doctor visit', 'bad');
    }
    if (hasVisitOnDate(p, today)) {
      return showToast('Blocked: Today’s doctor visit has already been recorded', 'bad');
    }

    p.visits.push({
      date: today,
      outcome: outcome || 'Reviewed, continue care',
      treatment: (treatment || '').trim() || 'Continue standard protocol',
      note: (note || '').trim(),
      by: state.role === 'Head Doctor' ? 'Head Doctor' : 'Doctor',
      at: new Date().toISOString()
    });

    addActivity(`${state.role} completed visit for ${p.name} (${p.room}): ${outcome}`, 'info');
    showToast(`Doctor visit recorded for ${p.name}`, 'good');
    saveState();
    render();
  }

  function approveDischarge(patientId) {
    if (!canDoctorAct(state.role)) {
      return showToast('Permission denied: Only a Doctor or Head Doctor can approve discharge', 'bad');
    }
    const p = state.patients.find((x) => x.id === patientId);
    if (!p || p.status !== 'Active') return;
    if (!isDischargeEligible(p)) {
      return showToast(
        `Blocked: ${p.name} has ${feverFreeDays(p)}/${state.settings.requiredNoFeverDays} consecutive fever-free days`,
        'bad'
      );
    }
    if (p.dischargeApproved) {
      return showToast(`${p.name} is already in the Admin discharge queue`, 'info');
    }

    p.dischargeApproved = true;
    p.dischargeApprovedBy = state.role === 'Head Doctor' ? 'Head Doctor' : 'Doctor';
    p.dischargeApprovedAt = new Date().toISOString();

    addActivity(`${p.dischargeApprovedBy} approved ${p.name} (${p.room}) for Admin discharge`, 'good');
    showToast(`Discharge approved for ${p.name}. Admin notified to release ${p.room}`, 'good');
    saveState();
    render();
  }

  function completeDischarge(patientId) {
    if (!canAdminAct(state.role)) {
      return showToast('Permission denied: Only Admin Staff can finalize discharge and release beds', 'bad');
    }
    const p = state.patients.find((x) => x.id === patientId);
    if (!p || p.status !== 'Active') return;
    if (!isDischargeEligible(p)) {
      return showToast('Discharge blocked: Patient does not meet the 3-day no-fever rule', 'bad');
    }
    if (!p.dischargeApproved) {
      return showToast('Blocked: Awaiting Doctor discharge approval before bed release', 'bad');
    }

    p.status = 'Discharged';
    p.closedDate = todayStr();
    p.outcomeNote = 'Completed 3 consecutive fever-free days; Doctor approved and Admin discharged';

    addActivity(`Admin discharged ${p.name} (${p.id}) — ${p.room} now vacant`, 'good');
    showToast(`${p.name} discharged. ${p.room} is now vacant`, 'good');
    saveState();
    render();
  }

  function recordMortality(patientId, note) {
    if (!canDoctorAct(state.role)) {
      return showToast('Permission denied: Only a Doctor or Head Doctor can log mortality outcomes', 'bad');
    }
    const p = state.patients.find((x) => x.id === patientId);
    if (!p || p.status !== 'Active') return;

    const ok = window.confirm(`Confirm recording mortality outcome for ${p.name} (${p.id}, ${p.room})? This frees the bed and updates facility mortality metrics.`);
    if (!ok) return;

    p.status = 'Deceased';
    p.closedDate = todayStr();
    p.outcomeNote = (note || '').trim() || 'Clinical mortality logged by physician';
    p.dischargeApproved = false;

    const m = qualityMetrics();
    addActivity(`Mortality recorded for ${p.name} (${p.id}, ${p.room}) — mortality ${m.mortalityRate.toFixed(1)}%`, 'alert');
    showToast(`Outcome logged for ${p.name}. Mortality rate is ${m.mortalityRate.toFixed(1)}%`, 'bad');
    saveState();
    render();
  }

  function admitPatient({ id, name, room, admitDate }) {
    if (!canAdminAct(state.role)) {
      return showToast('Permission denied: Only Admin Staff can admit new patients', 'bad');
    }
    const active = activePatients();
    if (active.length >= CAPACITY) {
      return showToast('Facility at 74/74 capacity. Complete a discharge before admitting a patient', 'bad');
    }

    const cleanId = (id || '').trim();
    const cleanName = (name || '').trim();
    const cleanRoom = (room || '').trim();
    const today = todayStr();

    if (!cleanId || !cleanName || !cleanRoom || !admitDate) {
      return showToast('Complete all admission fields', 'bad');
    }
    if (admitDate > today) {
      return showToast('Invalid admission date: Future dates are not allowed', 'bad');
    }
    if (state.patients.some((p) => p.id.toLowerCase() === cleanId.toLowerCase())) {
      return showToast(`Duplicate Patient ID "${cleanId}". Choose a unique ID`, 'bad');
    }
    if (active.some((p) => p.room === cleanRoom)) {
      return showToast(`${cleanRoom} is already occupied by an active patient`, 'bad');
    }

    state.patients.unshift({
      id: cleanId,
      name: cleanName,
      room: cleanRoom,
      admitDate,
      status: 'Active',
      closedDate: null,
      outcomeNote: '',
      dischargeApproved: false,
      dischargeApprovedBy: null,
      dischargeApprovedAt: null,
      temps: [],
      visits: []
    });

    state.prefillRoom = '';
    addActivity(`Admin admitted ${cleanName} (${cleanId}) into ${cleanRoom}`, 'info');
    showToast(`Admitted ${cleanName} to ${cleanRoom}. Nurse reading is pending`, 'good');
    saveState();
    render();
  }

  // Rendering
  function renderHeaderAndAlerts() {
    $('todayLabel').textContent = new Date().toLocaleDateString(undefined, {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
    $('roleSelect').value = state.role;

    const roleDescriptions = {
      Nurse: 'Daily temperature capture and fever alerts',
      Doctor: 'Journal review, same-day visits after temp, discharge approval',
      Admin: '74-bed capacity, admissions, and approved discharges',
      'Head Doctor': 'Quality benchmark (85% cure / 15% max mortality) and policy'
    };
    $('roleSummary').innerHTML = `<span class="role-label">${esc(state.role)}</span><span>${esc(roleDescriptions[state.role])}</span>`;

    const active = activePatients();
    const today = todayStr();
    const pendingTemp = active.filter((p) => !hasTempOnDate(p, today)).length;
    const readyDoctor = active.filter((p) => hasTempOnDate(p, today) && !hasVisitOnDate(p, today)).length;
    const dischargeQueue = active.filter((p) => isDischargeEligible(p)).length;
    const approvedDischarges = active.filter((p) => isDischargeEligible(p) && p.dischargeApproved).length;
    const m = qualityMetrics();

    $('badgeQueue').textContent = state.role === 'Nurse'
      ? pendingTemp
      : state.role === 'Doctor'
        ? readyDoctor
        : state.role === 'Admin'
          ? approvedDischarges
          : active.length;
    $('badgeRooms').textContent = `${active.length}/${CAPACITY}`;
    $('badgeQuality').textContent = `${m.cureRate.toFixed(0)}%`;

    document.querySelectorAll('.tab-btn').forEach((btn) => {
      const isActive = btn.dataset.tab === state.activeTab;
      btn.classList.toggle('active', isActive);
      btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      btn.setAttribute('aria-current', isActive ? 'page' : 'false');
    });
    document.querySelectorAll('.tab-panel').forEach((panel) => {
      panel.classList.toggle('hidden', panel.id !== `tab-${state.activeTab}`);
    });

    const alerts = [];
    if (m.total > 0 && m.mortalityRate > state.settings.maxMortalityPercent) {
      alerts.push(`
        <div class="alert-strip danger">
          <div class="alert-lead">
            ${ICONS.alert}
            <span><strong>Clinical quality alert:</strong> Mortality rate is <span class="tnum">${m.mortalityRate.toFixed(1)}%</span> (${m.deceased}/${m.total} closed cases), above the <span class="tnum">${state.settings.maxMortalityPercent}%</span> ceiling (cure rate <span class="tnum">${m.cureRate.toFixed(1)}%</span> vs 85% target).</span>
          </div>
          <button type="button" class="danger sm" data-goto-tab="quality">Inspect metrics</button>
        </div>
      `);
    }
    if (active.length >= CAPACITY) {
      alerts.push(`
        <div class="alert-strip warn">
          <div class="alert-lead">
            ${ICONS.alert}
            <span><strong>Capacity full (${active.length}/${CAPACITY} beds):</strong> No vacant rooms for admission. ${dischargeQueue} patient(s) meet the ${state.settings.requiredNoFeverDays}-day no-fever rule.</span>
          </div>
          <button type="button" class="secondary sm" data-goto-filter="discharge">Review discharge queue</button>
        </div>
      `);
    }
    $('globalAlerts').innerHTML = alerts.join('');
  }

  function nursePatientOptions(active, today) {
    const sorted = [...active].sort((a, b) => parseRoomNum(a.room) - parseRoomNum(b.room));
    const pending = sorted.filter((p) => !hasTempOnDate(p, today));
    const logged = sorted.filter((p) => hasTempOnDate(p, today));
    const fmt = (p) => `<option value="${esc(p.id)}">${esc(p.room)} · ${esc(p.name)} (${esc(p.id)})</option>`;
    let html = '';
    if (pending.length) html += `<optgroup label="Pending today (${pending.length})">${pending.map(fmt).join('')}</optgroup>`;
    if (logged.length) html += `<optgroup label="Already logged today (${logged.length})">${logged.map(fmt).join('')}</optgroup>`;
    return html;
  }

  function renderOverview() {
    const active = activePatients();
    const today = todayStr();
    const needsTemp = active.filter((p) => !hasTempOnDate(p, today));
    const readyDoctor = active.filter((p) => hasTempOnDate(p, today) && !hasVisitOnDate(p, today));
    const careDone = active.filter((p) => hasTempOnDate(p, today) && hasVisitOnDate(p, today));
    const eligible = active.filter((p) => isDischargeEligible(p));
    const approvedQueue = eligible.filter((p) => p.dischargeApproved);
    const awaitingDoctorApproval = eligible.filter((p) => !p.dischargeApproved);
    const m = qualityMetrics();
    const isMortalityBad = m.total > 0 && m.mortalityRate > state.settings.maxMortalityPercent;

    $('kpiGrid').innerHTML = `
      <button type="button" class="stat-cell" data-goto-tab="rooms">
        <span class="stat-label">Bed occupancy</span>
        <span class="stat-val ${active.length >= CAPACITY ? 'alert' : ''}">${active.length}/${CAPACITY}</span>
        <span class="stat-meta">${CAPACITY - active.length} vacant rooms</span>
      </button>
      <button type="button" class="stat-cell" data-goto-filter="needs-temp">
        <span class="stat-label">Temps pending</span>
        <span class="stat-val">${needsTemp.length}</span>
        <span class="stat-meta">Nurse checks today</span>
      </button>
      <button type="button" class="stat-cell" data-goto-filter="ready-doctor">
        <span class="stat-label">Ready for Doctor</span>
        <span class="stat-val">${readyDoctor.length}</span>
        <span class="stat-meta">${needsTemp.length} waiting on temp</span>
      </button>
      <button type="button" class="stat-cell" data-goto-tab="quality">
        <span class="stat-label">Cure / mortality</span>
        <span class="stat-val ${isMortalityBad ? 'alert' : 'accent'}">${m.cureRate.toFixed(1)}%</span>
        <span class="stat-meta">${m.mortalityRate.toFixed(1)}% mortality vs 15% max</span>
      </button>
    `;

    $('pipelineSteps').innerHTML = `
      <div class="pipe-step">
        <span class="pipe-step-num">1 · Nurse</span>
        <strong>${needsTemp.length}</strong>
        <p>Pending temp</p>
      </div>
      <div class="pipe-step">
        <span class="pipe-step-num">2 · Doctor</span>
        <strong>${readyDoctor.length}</strong>
        <p>Ready for round</p>
      </div>
      <div class="pipe-step">
        <span class="pipe-step-num">3 · MD clearance</span>
        <strong>${awaitingDoctorApproval.length}</strong>
        <p>Awaiting sign-off</p>
      </div>
      <div class="pipe-step">
        <span class="pipe-step-num">4 · Admin release</span>
        <strong>${approvedQueue.length}</strong>
        <p>${careDone.length} rounds done</p>
      </div>
    `;

    // Moment 1: Live 74-bed floor status strip
    const floorMeta = $('overviewFloorMeta');
    if (floorMeta) {
      floorMeta.textContent = `${active.length} / ${CAPACITY} occupied`;
      floorMeta.className = `mono-badge ${active.length >= CAPACITY ? 'bad' : 'accent'}`;
    }
    const stripEl = $('overviewWardStrip');
    if (stripEl) {
      const byRoom = new Map(active.map((p) => [p.room, p]));
      const cells = [];
      for (let r = 1; r <= CAPACITY; r++) {
        const label = roomLabel(r);
        const p = byRoom.get(label);
        if (!p) {
          cells.push(`
            <button type="button" class="ward-cell vacant" data-pick-vacant="${esc(label)}" title="${label}: Vacant">
              <span>${String(r).padStart(2, '0')}</span>
              <span class="ward-dot"></span>
            </button>
          `);
        } else {
          const t = latestTemp(p);
          const tDone = hasTempOnDate(p, today);
          const vDone = hasVisitOnDate(p, today);
          const elig = isDischargeEligible(p);
          let cls = 'done';
          if (elig) cls = 'discharge';
          else if (isFever(t)) cls = 'fever';
          else if (!tDone) cls = 'needs-temp';
          else if (!vDone) cls = 'ready-doc';
          cells.push(`
            <button type="button" class="ward-cell ${cls}" data-open-patient="${esc(p.id)}" title="${esc(label)} · ${esc(p.name)}${t ? ` (${Number(t.value).toFixed(1)}°C)` : ''}">
              <span>${String(r).padStart(2, '0')}</span>
              <span class="ward-dot"></span>
            </button>
          `);
        }
      }
      stripEl.innerHTML = cells.join('');
    }

    // Role Workspace
    if (state.role === 'Nurse') {
      $('quickPanelTitle').textContent = 'Record daily temperature';
      $('quickPanelSub').textContent = `${needsTemp.length} patients still need today’s reading`;
      const options = nursePatientOptions(active, today);
      $('roleWorkspace').innerHTML = `
        <form id="quickTempForm">
          <div class="form-grid">
            <div class="field full">
              <label for="qtPatient">Patient</label>
              <select id="qtPatient" required>${options}</select>
            </div>
            <div class="field">
              <label for="qtValue">Temperature (°C)</label>
              <input id="qtValue" type="number" inputmode="decimal" enterkeyhint="done" min="30" max="45" step="0.1" required placeholder="36.8">
            </div>
            <div class="field">
              <label for="qtDate">Date</label>
              <input id="qtDate" type="date" value="${today}" max="${today}" required>
            </div>
            <div class="field full">
              <label for="qtNote">Clinical note</label>
              <input id="qtNote" placeholder="Optional note">
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="primary">Save reading</button>
            <button type="button" class="secondary" data-goto-filter="needs-temp">Pending list (${needsTemp.length})</button>
          </div>
        </form>
        <div class="notice">Duplicate readings on the same date require confirmation. Readings at or above ${state.settings.feverThreshold}°C reset the 3-day afebrile track.</div>
      `;
    } else if (state.role === 'Doctor' || state.role === 'Head Doctor') {
      $('quickPanelTitle').textContent = `${state.role} — ready for round`;
      $('quickPanelSub').textContent = 'Filtered to patients whose Nurse temperature is recorded today';
      const priorityList = [...awaitingDoctorApproval, ...readyDoctor.filter((p) => !awaitingDoctorApproval.includes(p))].slice(0, 6);
      const reqDays = Number(state.settings.requiredNoFeverDays);
      $('roleWorkspace').innerHTML = priorityList.length
        ? `
          <div class="table-wrap">
            <table>
              <thead><tr><th>Room / Patient</th><th>Latest temp</th><th>Afebrile track</th><th>Actions</th></tr></thead>
              <tbody>
                ${priorityList.map((p) => {
          const t = latestTemp(p);
          const streak = feverFreeDays(p);
          const elig = isDischargeEligible(p);
          return `
                    <tr>
                      <td>
                        <button type="button" class="patient-link" data-open-patient="${esc(p.id)}">${esc(p.room)} · ${esc(p.name)}</button>
                        <div class="subtext tnum">${esc(p.id)}</div>
                      </td>
                      <td class="tnum">${t ? `<span class="mono-badge ${isFever(t) ? 'bad' : 'accent'}">${Number(t.value).toFixed(1)}°C</span>` : '—'}</td>
                      <td>${renderAfebrileTrack(streak, reqDays)}</td>
                      <td class="actions-cell">
                        <button type="button" class="secondary sm" data-open-patient="${esc(p.id)}">Review</button>
                        ${elig && !p.dischargeApproved ? `<button type="button" class="success sm" data-approve-discharge="${esc(p.id)}">Approve</button>` : ''}
                      </td>
                    </tr>
                  `;
        }).join('')}
              </tbody>
            </table>
          </div>
        `
        : '<div class="empty">All patients with recorded temperatures have been visited today</div>';
    } else {
      $('quickPanelTitle').textContent = 'Admin — bed turnover & admissions';
      $('quickPanelSub').textContent = `${CAPACITY - active.length} vacant beds · ${approvedQueue.length} Doctor-approved discharges`;
      $('roleWorkspace').innerHTML = `
        <div class="notice ${active.length >= CAPACITY ? 'warn' : ''}">
          ${active.length >= CAPACITY
          ? `All 74 rooms are occupied. Finalize one of the ${approvedQueue.length} Doctor-approved discharges to open a bed for admission.`
          : `${CAPACITY - active.length} room(s) vacant and ready for admission.`}
        </div>
        <div class="form-actions">
          <button type="button" class="primary" data-goto-tab="rooms">Open room map &amp; admit</button>
          <button type="button" class="secondary" data-goto-filter="discharge">View discharge queue</button>
        </div>
      `;
    }

    // Handoff List
    $('handoffCountPill').textContent = `${approvedQueue.length} ready`;
    $('handoffList').innerHTML = approvedQueue.length
      ? approvedQueue.map((p) => `
          <div class="journal-entry" style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
            <div>
              <button type="button" class="patient-link" data-open-patient="${esc(p.id)}">${esc(p.room)} · ${esc(p.name)}</button>
              <div class="subtext">Approved by ${esc(p.dischargeApprovedBy || 'Doctor')} · <span class="tnum">${feverFreeDays(p)}</span> afebrile days</div>
            </div>
            ${canAdminAct(state.role)
          ? `<button type="button" class="success sm" data-complete-discharge="${esc(p.id)}">Complete discharge</button>`
          : `<span class="status-tag good"><span class="status-dot"></span>Queued for Admin</span>`}
          </div>
        `).join('')
      : '<div class="empty" style="padding:16px">No Doctor-approved discharges waiting in queue</div>';

    // Activity Feed
    $('activityFeed').innerHTML = state.activity.slice(0, 6).map((a) => `
      <div class="feed-item ${a.type === 'alert' ? 'alert' : a.type === 'good' ? 'good' : ''}">
        <strong>${esc(a.text)}</strong>
        <span class="feed-meta">${new Date(a.at).toLocaleString()}</span>
      </div>
    `).join('');
  }

  function renderQueue() {
    const active = activePatients();
    const today = todayStr();
    const counts = {
      all: active.length,
      'needs-temp': active.filter((p) => !hasTempOnDate(p, today)).length,
      'ready-doctor': active.filter((p) => hasTempOnDate(p, today) && !hasVisitOnDate(p, today)).length,
      discharge: active.filter((p) => isDischargeEligible(p)).length,
      fever: active.filter((p) => isFever(latestTemp(p))).length,
      closed: closedPatients().length
    };

    const filters = [
      { id: 'all', label: `All active (${counts.all})` },
      { id: 'needs-temp', label: `1. Needs temp (${counts['needs-temp']})` },
      { id: 'ready-doctor', label: `2. Ready for Doctor (${counts['ready-doctor']})` },
      { id: 'discharge', label: `3. Discharge queue (${counts.discharge})` },
      { id: 'fever', label: `Fever (${counts.fever})` },
      { id: 'closed', label: `Closed (${counts.closed})` }
    ];

    $('queueFilterPills').innerHTML = filters.map((f) => `
      <button type="button" class="filter-pill ${state.queueFilter === f.id ? 'active' : ''}" data-queue-filter="${f.id}">
        ${esc(f.label)}
      </button>
    `).join('');

    $('queueSearch').value = state.queueSearch;
    $('queueSort').value = state.queueSort;

    const q = state.queueSearch.trim().toLowerCase();
    const list = state.patients.filter((p) => {
      if (state.queueFilter === 'closed') {
        if (p.status === 'Active') return false;
      } else {
        if (p.status !== 'Active') return false;
        if (state.queueFilter === 'needs-temp' && hasTempOnDate(p, today)) return false;
        if (state.queueFilter === 'ready-doctor' && (!hasTempOnDate(p, today) || hasVisitOnDate(p, today))) return false;
        if (state.queueFilter === 'discharge' && !isDischargeEligible(p)) return false;
        if (state.queueFilter === 'fever' && !isFever(latestTemp(p))) return false;
      }
      if (!q) return true;
      return (
        p.name.toLowerCase().includes(q) ||
        p.id.toLowerCase().includes(q) ||
        p.room.toLowerCase().includes(q)
      );
    });

    list.sort((a, b) => {
      if (state.queueSort === 'room') return parseRoomNum(a.room) - parseRoomNum(b.room);
      if (state.queueSort === 'streak') return feverFreeDays(b) - feverFreeDays(a);
      if (state.queueSort === 'temp') return (latestTemp(b)?.value ?? 0) - (latestTemp(a)?.value ?? 0);
      const score = (p) => {
        if (p.dischargeApproved) return 5;
        if (isDischargeEligible(p)) return 4;
        if (isFever(latestTemp(p))) return 3;
        if (hasTempOnDate(p, today) && !hasVisitOnDate(p, today)) return 2;
        if (!hasTempOnDate(p, today)) return 1;
        return 0;
      };
      return score(b) - score(a) || parseRoomNum(a.room) - parseRoomNum(b.room);
    });

    const reqDays = Number(state.settings.requiredNoFeverDays);
    $('queueTableBody').innerHTML = list.map((p) => {
      const t = latestTemp(p);
      const tDone = hasTempOnDate(p, today);
      const vDone = hasVisitOnDate(p, today);
      const streak = feverFreeDays(p);
      const elig = isDischargeEligible(p);

      let flowHtml = '<span class="subtext">Closed</span>';
      if (p.status === 'Active') {
        const tempPart = `<span class="status-tag ${tDone ? 'good' : 'warn'}"><span class="status-dot"></span>Temp ${tDone ? 'done' : 'pending'}</span>`;
        const docPart = vDone
          ? '<span class="status-tag good"><span class="status-dot"></span>MD done</span>'
          : tDone
            ? '<span class="status-tag"><span class="status-dot"></span>MD ready</span>'
            : '<span class="subtext">MD blocked</span>';
        flowHtml = `<div style="display:flex;gap:12px;flex-wrap:wrap">${tempPart}${docPart}</div>`;
      }

      let statusHtml = '';
      if (p.status === 'Discharged') statusHtml = '<span class="status-tag good"><span class="status-dot"></span>Discharged</span>';
      else if (p.status === 'Deceased') statusHtml = '<span class="status-tag bad"><span class="status-dot"></span>Deceased</span>';
      else if (p.dischargeApproved) statusHtml = '<span class="status-tag good"><span class="status-dot"></span>Approved for Admin</span>';
      else if (elig) statusHtml = '<span class="status-tag good"><span class="status-dot"></span>Eligible (needs MD)</span>';
      else if (isFever(t)) statusHtml = '<span class="status-tag bad"><span class="status-dot"></span>Fever active</span>';
      else statusHtml = '<span class="status-tag"><span class="status-dot"></span>In care</span>';

      let actionBtns = `<button type="button" class="secondary sm" data-open-patient="${esc(p.id)}">Journal</button>`;
      if (p.status === 'Active') {
        if (canRecordTemp(state.role)) {
          actionBtns += ` <button type="button" class="primary sm" data-select-temp="${esc(p.id)}">Temp</button>`;
        }
        if (canDoctorAct(state.role)) {
          if (tDone && !vDone) {
            actionBtns += ` <button type="button" class="primary sm" data-select-visit="${esc(p.id)}">Visit</button>`;
          }
          if (elig && !p.dischargeApproved) {
            actionBtns += ` <button type="button" class="success sm" data-approve-discharge="${esc(p.id)}">Approve</button>`;
          }
        }
        if (canAdminAct(state.role) && elig && p.dischargeApproved) {
          actionBtns += ` <button type="button" class="success sm" data-complete-discharge="${esc(p.id)}">Discharge</button>`;
        }
      }

      return `
        <tr>
          <td>
            <button type="button" class="patient-link" data-open-patient="${esc(p.id)}">${esc(p.room)} · ${esc(p.name)}</button>
            <div class="subtext tnum">${esc(p.id)} · Day ${daysBetween(p.admitDate, p.closedDate || today)}</div>
          </td>
          <td class="tnum">
            ${t ? `<span style="color:${isFever(t) ? 'var(--bad)' : 'var(--ink)'};font-weight:500">${Number(t.value).toFixed(1)}°C</span>` : '<span class="subtext">None</span>'}
            <div class="subtext">${t ? esc(t.date) : ''}</div>
          </td>
          <td>${p.status === 'Active' ? renderAfebrileTrack(streak, reqDays) : '<span class="subtext">—</span>'}</td>
          <td>${flowHtml}</td>
          <td>${statusHtml}</td>
          <td><div class="actions-cell">${actionBtns}</div></td>
        </tr>
      `;
    }).join('');

    $('queueEmpty').classList.toggle('hidden', list.length > 0);
    renderQueueSidebar(active);
  }

  function renderQueueSidebar(active) {
    const today = todayStr();
    const patientOptions = nursePatientOptions(active, today);

    if (canRecordTemp(state.role)) {
      $('queueActionSidebar').innerHTML = `
        <section class="panel">
          <div class="panel-head">
            <h2>Record temperature</h2>
            <span class="mono-badge">Nurse</span>
          </div>
          <form id="sideTempForm">
            <div class="form-grid">
              <div class="field full">
                <label for="stPatient">Patient</label>
                <select id="stPatient" required>${patientOptions}</select>
              </div>
              <div class="field">
                <label for="stValue">Temp (°C)</label>
                <input id="stValue" type="number" inputmode="decimal" enterkeyhint="done" min="30" max="45" step="0.1" required placeholder="36.8">
              </div>
              <div class="field">
                <label for="stDate">Date</label>
                <input id="stDate" type="date" value="${today}" max="${today}" required>
              </div>
              <div class="field full">
                <label for="stNote">Observation</label>
                <input id="stNote" placeholder="Optional note">
              </div>
            </div>
            <div class="form-actions">
              <button type="submit" class="primary">Save temperature</button>
            </div>
          </form>
          <div class="notice">Same-day duplicate readings require explicit confirmation. Future or pre-admission dates are blocked.</div>
        </section>
      `;
    } else if (canDoctorAct(state.role)) {
      const readyOpts = active
        .filter((p) => hasTempOnDate(p, today) && !hasVisitOnDate(p, today))
        .map((p) => `<option value="${esc(p.id)}">${esc(p.room)} · ${esc(p.name)} (${Number(latestTemp(p).value).toFixed(1)}°C)</option>`)
        .join('');
      $('queueActionSidebar').innerHTML = `
        <section class="panel">
          <div class="panel-head">
            <h2>Record doctor visit</h2>
            <span class="mono-badge">${esc(state.role)}</span>
          </div>
          ${readyOpts
          ? `
              <form id="sideVisitForm">
                <div class="form-grid">
                  <div class="field full">
                    <label for="svPatient">Ready patients (today’s temp logged)</label>
                    <select id="svPatient" required>${readyOpts}</select>
                  </div>
                  <div class="field full">
                    <label for="svOutcome">Assessment</label>
                    <select id="svOutcome">
                      <option value="Reviewed, continue care">Reviewed, continue care</option>
                      <option value="Monitor closely">Monitor closely</option>
                      <option value="Escalate treatment">Escalate treatment</option>
                      <option value="Cleared for discharge">Cleared for discharge</option>
                    </select>
                  </div>
                  <div class="field full">
                    <label for="svTreatment">Treatment plan</label>
                    <input id="svTreatment" placeholder="Antipyretics, hydration">
                  </div>
                  <div class="field full">
                    <label for="svNote">Doctor note</label>
                    <input id="svNote" placeholder="Optional note">
                  </div>
                </div>
                <div class="form-actions">
                  <button type="submit" class="primary">Log doctor visit</button>
                </div>
              </form>
            `
          : '<div class="empty">No patients waiting for a Doctor visit with today’s temperature logged</div>'}
          <div class="notice">Patients missing today’s Nurse reading are excluded so Doctors never make wasted visits.</div>
        </section>
      `;
    } else {
      $('queueActionSidebar').innerHTML = `
        <section class="panel">
          <div class="panel-head">
            <h2>Admin role scope</h2>
            <span class="mono-badge">Admin</span>
          </div>
          <div class="notice">
            Admin Staff cannot enter clinical temperatures or doctor visits. Use Discharge on Doctor-approved patients, or switch to Rooms &amp; admissions to admit into vacant beds.
          </div>
          <div class="form-actions">
            <button type="button" class="primary" data-goto-tab="rooms">Rooms &amp; admissions</button>
          </div>
        </section>
      `;
    }
  }

  function renderRooms() {
    const active = activePatients();
    const today = todayStr();
    const byRoom = new Map(active.map((p) => [p.room, p]));

    $('roomCapacityPill').textContent = `${active.length} / ${CAPACITY} occupied`;
    $('roomCapacityPill').className = `mono-badge ${active.length >= CAPACITY ? 'bad' : 'accent'}`;

    const tiles = [];
    for (let r = 1; r <= CAPACITY; r++) {
      const label = roomLabel(r);
      const p = byRoom.get(label);
      if (!p) {
        tiles.push(`
          <button type="button" class="room-tile vacant" data-pick-vacant="${esc(label)}" title="${label}: Vacant">
            <strong>${String(r).padStart(2, '0')}</strong>
            <span>Vacant</span>
          </button>
        `);
      } else {
        const t = latestTemp(p);
        const tDone = hasTempOnDate(p, today);
        const vDone = hasVisitOnDate(p, today);
        const elig = isDischargeEligible(p);
        let cls = 'done';
        let statusText = t ? `${Number(t.value).toFixed(1)}°C` : 'No temp';
        if (elig) {
          cls = 'discharge';
          statusText = p.dischargeApproved ? 'Approved' : '3/3 ready';
        } else if (isFever(t)) {
          cls = 'fever';
        } else if (!tDone) {
          cls = 'needs-temp';
          statusText = 'Needs temp';
        } else if (!vDone) {
          cls = 'ready-doc';
          statusText = 'Ready MD';
        }

        tiles.push(`
          <button type="button" class="room-tile ${cls}" data-open-patient="${esc(p.id)}" title="${esc(label)}: ${esc(p.name)} (${esc(statusText)})">
            <strong>${String(r).padStart(2, '0')}</strong>
            <span>${esc(p.name.split(' ')[0])}</span>
            <span class="tnum">${esc(statusText)}</span>
          </button>
        `);
      }
    }
    $('roomGrid').innerHTML = tiles.join('');

    const vacant = vacantRooms();
    if (!canAdminAct(state.role)) {
      $('admitContainer').innerHTML = `
        <div class="notice">Switch role to Admin Staff to admit patients. ${vacant.length} vacant room(s) available.</div>
      `;
    } else if (vacant.length === 0) {
      $('admitContainer').innerHTML = `
        <div class="notice bad">
          <strong>Admission blocked — 74/74 beds occupied</strong><br>
          Complete a Doctor-approved discharge below to free a room before admitting a new patient.
        </div>
      `;
    } else {
      const maxNum = state.patients.reduce((mx, p) => {
        const m = String(p.id).match(/(\d+)/);
        return m ? Math.max(mx, Number(m[1])) : mx;
      }, 174);
      const nextNum = maxNum + 1;
      const roomOpts = vacant.map((rm) => `<option value="${esc(rm)}" ${state.prefillRoom === rm ? 'selected' : ''}>${esc(rm)}</option>`).join('');
      $('admitContainer').innerHTML = `
        <form id="admitForm">
          <div class="form-grid">
            <div class="field">
              <label for="admitId">Patient ID</label>
              <input id="admitId" required autocapitalize="characters" autocorrect="off" value="P-${nextNum}" placeholder="P-175">
            </div>
            <div class="field">
              <label for="admitRoom">Vacant room</label>
              <select id="admitRoom" required>${roomOpts}</select>
            </div>
            <div class="field full">
              <label for="admitName">Full name</label>
              <input id="admitName" required placeholder="Full name">
            </div>
            <div class="field full">
              <label for="admitDate">Admission date</label>
              <input id="admitDate" type="date" value="${today}" max="${today}" required>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="primary">Admit patient</button>
          </div>
        </form>
      `;
    }

    const eligible = active.filter((p) => isDischargeEligible(p));
    $('adminQueueBadge').textContent = `${eligible.filter((p) => p.dischargeApproved).length} ready`;
    $('adminDischargePanel').innerHTML = eligible.length
      ? eligible.map((p) => `
          <div class="journal-entry" style="margin-bottom:8px;display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap">
            <div>
              <button type="button" class="patient-link" data-open-patient="${esc(p.id)}">${esc(p.room)} · ${esc(p.name)}</button>
              <div class="subtext">${p.dischargeApproved ? `Approved by ${esc(p.dischargeApprovedBy)}` : 'Awaiting Doctor approval'}</div>
            </div>
            ${p.dischargeApproved
          ? (canAdminAct(state.role)
            ? `<button type="button" class="success sm" data-complete-discharge="${esc(p.id)}">Free bed</button>`
            : '<span class="status-tag good"><span class="status-dot"></span>Admin action</span>')
          : '<span class="status-tag warn"><span class="status-dot"></span>Needs MD sign-off</span>'}
          </div>
        `).join('')
      : '<div class="empty" style="padding:16px">No patients currently meet the 3-day no-fever criterion</div>';
  }

  function renderQuality() {
    const m = qualityMetrics();
    const closed = closedPatients().sort((a, b) => (b.closedDate || '').localeCompare(a.closedDate || ''));
    const overLimit = m.total > 0 && m.mortalityRate > state.settings.maxMortalityPercent;

    $('qualityKpis').innerHTML = `
      <div class="kpi-card ${overLimit ? 'alert' : 'good'}">
        <div class="kpi-label">Cure rate</div>
        <div class="kpi-val">${m.cureRate.toFixed(1)}%</div>
        <div class="kpi-sub">Target &ge; 85.0% (${m.cured} cured)</div>
      </div>
      <div class="kpi-card ${overLimit ? 'alert' : ''}">
        <div class="kpi-label">Mortality rate</div>
        <div class="kpi-val">${m.mortalityRate.toFixed(1)}%</div>
        <div class="kpi-sub">Ceiling &le; ${state.settings.maxMortalityPercent}% (${m.deceased} deceased)</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Closed cases</div>
        <div class="kpi-val">${m.total}</div>
        <div class="kpi-sub">${m.cured} cured · ${m.deceased} deceased</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Avg length of stay</div>
        <div class="kpi-val">${m.avgLos.toFixed(1)}d</div>
        <div class="kpi-sub">Across closed stays</div>
      </div>
    `;

    $('benchmarkDetail').innerHTML = `
      <div class="subtext">Outcome distribution (<span class="tnum">${m.cured}</span> cured vs <span class="tnum">${m.deceased}</span> deceased)</div>
      <div class="bench-wrap">
        <div class="bench-bar" aria-label="Cure vs mortality ratio">
          <div class="bench-cured" style="width:${m.total ? (m.cured / m.total) * 100 : 100}%"></div>
          <div class="bench-deceased" style="width:${m.total ? (m.deceased / m.total) * 100 : 0}%"></div>
        </div>
        <div class="bench-target" aria-hidden="true"></div>
        <div class="bench-target-label">85% target</div>
      </div>
      <div class="notice ${overLimit ? 'bad' : ''}">
        ${overLimit
        ? `<strong>Action required:</strong> Mortality rate (${m.mortalityRate.toFixed(1)}%) exceeds the 15.0% ceiling. Review fever escalation protocols.`
        : `<strong>On benchmark:</strong> Cure rate (${m.cureRate.toFixed(1)}%) meets the 85.0% target (mortality ${m.mortalityRate.toFixed(1)}% &le; 15.0%).`}
      </div>
    `;

    const editable = canEditSettings(state.role);
    $('settingsContainer').innerHTML = `
      <form id="settingsForm">
        <div class="form-grid">
          <div class="field">
            <label for="setFever">Fever threshold (°C)</label>
            <input id="setFever" type="number" inputmode="decimal" enterkeyhint="done" step="0.1" min="36.5" max="40" value="${state.settings.feverThreshold}" ${editable ? '' : 'disabled'}>
          </div>
          <div class="field">
            <label for="setDays">Consecutive afebrile days</label>
            <input id="setDays" type="number" inputmode="numeric" enterkeyhint="done" step="1" min="1" max="14" value="${state.settings.requiredNoFeverDays}" ${editable ? '' : 'disabled'}>
          </div>
        </div>
        <div class="form-actions">
          <button type="submit" class="primary" ${editable ? '' : 'disabled'}>Update thresholds</button>
        </div>
      </form>
      <div class="notice">${editable ? 'Updating thresholds immediately recalculates patient cure tracks.' : 'Switch role to Head Doctor to adjust clinical thresholds.'}</div>
    `;

    $('outcomesTableBody').innerHTML = closed.map((p) => `
      <tr>
        <td><strong>${esc(p.name)}</strong> <span class="subtext tnum">(${esc(p.id)})</span></td>
        <td class="tnum">${esc(p.room)}</td>
        <td class="tnum">${esc(p.admitDate)}</td>
        <td class="tnum">${esc(p.closedDate || '—')}</td>
        <td class="tnum">${daysBetween(p.admitDate, p.closedDate || todayStr())}d</td>
        <td><span class="status-tag ${p.status === 'Discharged' ? 'good' : 'bad'}"><span class="status-dot"></span>${esc(p.status === 'Discharged' ? 'Cured' : 'Deceased')}</span></td>
        <td class="subtext">${esc(p.outcomeNote)}</td>
      </tr>
    `).join('');
  }

  // Moment 2: Bedside Fever Journal SVG Chart
  function renderFeverSvg(temps) {
    if (!temps.length) {
      return '<div class="empty" style="padding:16px">No temperature measurements recorded yet</div>';
    }
    const sorted = [...temps].sort((a, b) => (a.date + (a.at || '')).localeCompare(b.date + (b.at || '')));
    const w = 540;
    const h = 176;
    const padL = 44;
    const padR = 16;
    const padT = 16;
    const padB = 28;
    const minT = 36.0;
    const maxT = Math.max(40.0, ...sorted.map((t) => Math.ceil((Number(t.value) + 0.2) * 2) / 2));
    const threshold = Number(state.settings.feverThreshold);

    const xAt = (i) => sorted.length === 1
      ? padL + (w - padL - padR) / 2
      : padL + (i / (sorted.length - 1)) * (w - padL - padR);
    const yAt = (val) => padT + ((maxT - val) / (maxT - minT)) * (h - padT - padB);

    const gridLines = [36, 37, 38, 39, 40]
      .filter((v) => v >= minT && v <= maxT)
      .map((v) => {
        const y = yAt(v).toFixed(1);
        return `
          <line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="rgba(17,24,39,0.08)" stroke-width="1" />
          <text x="${padL - 8}" y="${Number(y) + 4}" text-anchor="end" font-family="'SF Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="11" fill="#6b7487">${v.toFixed(0)}°</text>
        `;
      }).join('');

    const threshY = yAt(threshold).toFixed(1);
    const points = sorted.map((t, i) => `${xAt(i).toFixed(1)},${yAt(Number(t.value)).toFixed(1)}`).join(' ');
    const circles = sorted.map((t, i) => {
      const cx = xAt(i).toFixed(1);
      const cy = yAt(Number(t.value)).toFixed(1);
      const fill = Number(t.value) >= threshold ? '#dc2626' : '#0f766e';
      return `
        <circle cx="${cx}" cy="${cy}" r="4.5" fill="${fill}" stroke="#ffffff" stroke-width="1.5">
          <title>${esc(t.date)}: ${Number(t.value).toFixed(1)}°C</title>
        </circle>
        <text x="${cx}" y="${h - 6}" text-anchor="middle" font-family="'SF Mono', ui-monospace, SFMono-Regular, Menlo, Consolas, monospace" font-size="11" fill="#6b7487">${esc(t.date.slice(5))}</text>
      `;
    }).join('');

    return `
      <svg viewBox="0 0 ${w} ${h}" width="100%" height="176" role="img" aria-label="Patient temperature history chart">
        ${gridLines}
        <line x1="${padL}" y1="${threshY}" x2="${w - padR}" y2="${threshY}" stroke="#dc2626" stroke-dasharray="4 4" stroke-width="1.2" />
        ${sorted.length > 1 ? `<polyline fill="none" stroke="#4b5565" stroke-width="1.8" points="${points}" />` : ''}
        ${circles}
      </svg>
    `;
  }

  function renderJournalDrawer() {
    const backdrop = $('journalBackdrop');
    if (!state.selectedPatientId) {
      backdrop.classList.remove('is-open');
      backdrop.setAttribute('aria-hidden', 'true');
      lastDrawerPatientId = null;
      return;
    }
    const p = state.patients.find((x) => x.id === state.selectedPatientId);
    if (!p) {
      backdrop.classList.remove('is-open');
      backdrop.setAttribute('aria-hidden', 'true');
      lastDrawerPatientId = null;
      return;
    }
    const isNewOpen = lastDrawerPatientId !== p.id;
    lastDrawerPatientId = p.id;
    backdrop.classList.add('is-open');
    backdrop.setAttribute('aria-hidden', 'false');

    const today = todayStr();
    const streak = feverFreeDays(p);
    const reqDays = Number(state.settings.requiredNoFeverDays);
    const elig = isDischargeEligible(p);
    const tDone = hasTempOnDate(p, today);
    const vDone = hasVisitOnDate(p, today);

    const historyItems = [
      ...p.temps.map((t) => ({
        sort: t.date + (t.at || ''),
        kind: 'temp',
        title: `Temperature ${Number(t.value).toFixed(1)}°C`,
        meta: `${t.date} · ${t.by || 'Nurse'}`,
        note: t.note,
        isBad: Number(t.value) >= Number(state.settings.feverThreshold)
      })),
      ...p.visits.map((v) => ({
        sort: v.date + (v.at || 'Z'),
        kind: 'visit',
        title: `Doctor visit: ${v.outcome}`,
        meta: `${v.date} · ${v.by || 'Doctor'}`,
        note: `${v.treatment ? `Treatment: ${v.treatment}. ` : ''}${v.note || ''}`,
        isBad: false
      }))
    ].sort((a, b) => b.sort.localeCompare(a.sort));

    let actionBlock = '';
    if (p.status !== 'Active') {
      actionBlock = `<div class="notice">${esc(p.status)} on <span class="tnum">${esc(p.closedDate || '—')}</span> — ${esc(p.outcomeNote)}</div>`;
    } else {
      actionBlock = `
        <div class="panel" style="padding:16px;background:var(--bg)">
          <h3>Actions (${esc(state.role)})</h3>
          ${canRecordTemp(state.role) ? `
            <form id="drawerTempForm">
              <div class="form-grid">
                <div class="field">
                  <label for="dtVal">Temperature (°C)</label>
                  <input id="dtVal" type="number" inputmode="decimal" enterkeyhint="done" min="30" max="45" step="0.1" required placeholder="36.8">
                </div>
                <div class="field">
                  <label for="dtDate">Date</label>
                  <input id="dtDate" type="date" value="${today}" max="${today}" required>
                </div>
                <div class="field full">
                  <label for="dtNote">Observation</label>
                  <input id="dtNote" placeholder="Optional note">
                </div>
              </div>
              <div class="form-actions">
                <button type="submit" class="primary">Save temperature</button>
              </div>
            </form>
          ` : ''}

          ${canDoctorAct(state.role) ? `
            <div>
              ${!tDone
            ? '<div class="notice warn"><strong>Doctor Visit Blocked:</strong> Nurse must record today’s temperature before a Doctor visit can be logged.</div>'
            : vDone
              ? '<div class="notice">Today’s Doctor visit is already logged.</div>'
              : `
                    <form id="drawerVisitForm">
                      <div class="form-grid">
                        <div class="field full">
                          <label for="dvOutcome">Visit outcome</label>
                          <select id="dvOutcome">
                            <option value="Reviewed, continue care">Reviewed, continue care</option>
                            <option value="Monitor closely">Monitor closely</option>
                            <option value="Escalate treatment">Escalate treatment</option>
                            <option value="Cleared for discharge">Cleared for discharge</option>
                          </select>
                        </div>
                        <div class="field full">
                          <label for="dvTreat">Treatment plan</label>
                          <input id="dvTreat" placeholder="Medication, hydration">
                        </div>
                        <div class="field full">
                          <label for="dvNote">Clinical note</label>
                          <input id="dvNote" placeholder="Optional note">
                        </div>
                      </div>
                      <div class="form-actions">
                        <button type="submit" class="primary">Record doctor visit</button>
                      </div>
                    </form>
                  `}
              <div class="form-actions" style="border-top:1px solid var(--line);padding-top:12px">
                <button type="button" class="success" id="drawerApproveBtn" ${elig && !p.dischargeApproved ? '' : 'disabled'}>
                  ${p.dischargeApproved ? 'Approved for Admin' : `Approve discharge (${streak}/${reqDays}d)`}
                </button>
                <button type="button" class="danger" id="drawerMortalityBtn">Record mortality</button>
              </div>
            </div>
          ` : ''}

          ${canAdminAct(state.role) ? `
            <div>
              ${p.dischargeApproved && elig
            ? `<button type="button" class="success" id="drawerCompleteBtn">Complete discharge &amp; free ${esc(p.room)}</button>`
            : `<div class="notice">Discharge is locked until ${reqDays} fever-free days are met and a Doctor approves discharge.</div>`}
            </div>
          ` : ''}
        </div>
      `;
    }

    $('journalDrawer').innerHTML = `
      <div class="drawer-head">
        <div>
          <span class="status-tag ${p.status === 'Active' ? 'good' : p.status === 'Discharged' ? 'good' : 'bad'}"><span class="status-dot"></span>${esc(p.status)}</span>
          <h2 id="journalPatientName" style="margin:4px 0">${esc(p.name)}</h2>
          <div class="subtext tnum">${esc(p.id)} · ${esc(p.room)} · Admitted ${esc(p.admitDate)} (${daysBetween(p.admitDate, p.closedDate || today)} days)</div>
        </div>
        <button type="button" class="secondary sm" id="closeDrawerBtn" aria-label="Close bedside journal">
          ${ICONS.close}
          Close
        </button>
      </div>

      <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;padding:12px;border:1px solid var(--line);border-radius:var(--r-card)">
        <div>
          <div style="font-weight:500">Afebrile day track</div>
          <div class="subtext">Threshold &lt; <span class="tnum">${state.settings.feverThreshold}°C</span> for ${reqDays} consecutive days</div>
        </div>
        ${renderAfebrileTrack(streak, reqDays)}
      </div>

      <div class="chart-box">
        <div style="font-size:13px;font-weight:500;margin-bottom:8px">Bedside fever chart</div>
        ${renderFeverSvg(p.temps)}
      </div>

      ${actionBlock}

      <div>
        <h3>Chronological journal (${historyItems.length})</h3>
        <div class="journal-list">
          ${historyItems.length
        ? historyItems.map((item) => `
                <div class="journal-entry" style="border-left:3px solid ${item.kind === 'visit' ? 'var(--ink)' : item.isBad ? 'var(--bad)' : 'var(--accent)'}">
                  <div style="display:flex;justify-content:space-between;gap:8px;flex-wrap:wrap">
                    <strong style="font-weight:500">${esc(item.title)}</strong>
                    <span class="subtext tnum">${esc(item.meta)}</span>
                  </div>
                  ${item.note ? `<div class="subtext" style="margin-top:4px">${esc(item.note)}</div>` : ''}
                </div>
              `).join('')
        : '<div class="empty">No readings or visits recorded yet</div>'}
        </div>
      </div>
    `;
    if (isNewOpen) {
      $('journalDrawer').scrollTop = 0;
      $('closeDrawerBtn')?.focus?.();
    }
  }

  function closeJournalDrawer() {
    state.selectedPatientId = null;
    renderJournalDrawer();
    lastDrawerTrigger?.focus?.();
    lastDrawerTrigger = null;
  }

  function render() {
    renderHeaderAndAlerts();
    if (state.activeTab === 'overview') renderOverview();
    if (state.activeTab === 'queue') renderQueue();
    if (state.activeTab === 'rooms') renderRooms();
    if (state.activeTab === 'quality') renderQuality();
    renderJournalDrawer();
  }

  // Event Wiring
  $('roleSelect').addEventListener('change', (e) => {
    state.role = e.target.value;
    saveState();
    render();
    showToast(`Active role switched to ${state.role}`);
  });

  $('resetBtn').addEventListener('click', () => {
    if (!window.confirm('Reset CareTrack to the 74-bed full-occupancy demo dataset?')) return;
    state = createSeedState();
    saveState();
    render();
    showToast('Demo facility reset to 74/74 occupied beds and 85.0% cure rate', 'info');
  });

  $('navTabs').addEventListener('click', (e) => {
    const btn = e.target.closest('[data-tab]');
    if (!btn) return;
    state.activeTab = btn.dataset.tab;
    saveState();
    render();
  });

  $('jumpToRoleQueueBtn').addEventListener('click', () => {
    state.activeTab = 'queue';
    state.queueFilter = state.role === 'Nurse'
      ? 'needs-temp'
      : state.role === 'Doctor'
        ? 'ready-doctor'
        : state.role === 'Admin'
          ? 'discharge'
          : 'all';
    saveState();
    render();
  });

  $('queueSearch').addEventListener('input', (e) => {
    state.queueSearch = e.target.value;
    saveState();
    renderQueue();
  });

  $('queueSort').addEventListener('change', (e) => {
    state.queueSort = e.target.value;
    saveState();
    renderQueue();
  });

  document.addEventListener('click', (e) => {
    const tabBtn = e.target.closest('[data-goto-tab]');
    if (tabBtn) {
      state.activeTab = tabBtn.dataset.gotoTab;
      saveState();
      render();
      return;
    }

    const filterJump = e.target.closest('[data-goto-filter]');
    if (filterJump) {
      state.activeTab = 'queue';
      state.queueFilter = filterJump.dataset.gotoFilter;
      saveState();
      render();
      return;
    }

    const qf = e.target.closest('[data-queue-filter]');
    if (qf) {
      state.queueFilter = qf.dataset.queueFilter;
      saveState();
      renderQueue();
      return;
    }

    const openP = e.target.closest('[data-open-patient]');
    if (openP) {
      lastDrawerTrigger = openP;
      state.selectedPatientId = openP.dataset.openPatient;
      renderJournalDrawer();
      return;
    }

    const selTemp = e.target.closest('[data-select-temp]');
    if (selTemp) {
      const sel = $('stPatient');
      if (sel) {
        sel.value = selTemp.dataset.selectTemp;
        $('sideTempForm')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        $('stValue')?.focus();
      }
      return;
    }

    const selVisit = e.target.closest('[data-select-visit]');
    if (selVisit) {
      const sel = $('svPatient');
      if (sel) {
        sel.value = selVisit.dataset.selectVisit;
        $('sideVisitForm')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        $('svTreatment')?.focus();
      }
      return;
    }

    const appBtn = e.target.closest('[data-approve-discharge]');
    if (appBtn) {
      approveDischarge(appBtn.dataset.approveDischarge);
      return;
    }

    const compBtn = e.target.closest('[data-complete-discharge]');
    if (compBtn) {
      completeDischarge(compBtn.dataset.completeDischarge);
      return;
    }

    const vacantBtn = e.target.closest('[data-pick-vacant]');
    if (vacantBtn) {
      state.prefillRoom = vacantBtn.dataset.pickVacant;
      state.activeTab = 'rooms';
      saveState();
      render();
      $('admitName')?.focus();
      return;
    }

    if (e.target.closest('#closeDrawerBtn') || e.target.id === 'journalBackdrop') {
      closeJournalDrawer();
      return;
    }

    if (e.target.id === 'drawerApproveBtn' && state.selectedPatientId) {
      approveDischarge(state.selectedPatientId);
      return;
    }

    if (e.target.id === 'drawerCompleteBtn' && state.selectedPatientId) {
      completeDischarge(state.selectedPatientId);
      return;
    }

    if (e.target.id === 'drawerMortalityBtn' && state.selectedPatientId) {
      const note = window.prompt('Optional mortality note:', 'Refractory fever / respiratory complications');
      if (note !== null) recordMortality(state.selectedPatientId, note);
    }
  });

  document.addEventListener('submit', (e) => {
    if (e.target.id === 'quickTempForm') {
      e.preventDefault();
      recordTemperature($('qtPatient').value, {
        value: $('qtValue').value,
        date: $('qtDate').value,
        note: $('qtNote').value
      });
    } else if (e.target.id === 'sideTempForm') {
      e.preventDefault();
      recordTemperature($('stPatient').value, {
        value: $('stValue').value,
        date: $('stDate').value,
        note: $('stNote').value
      });
    } else if (e.target.id === 'drawerTempForm' && state.selectedPatientId) {
      e.preventDefault();
      recordTemperature(state.selectedPatientId, {
        value: $('dtVal').value,
        date: $('dtDate').value,
        note: $('dtNote').value
      });
    } else if (e.target.id === 'sideVisitForm') {
      e.preventDefault();
      recordDoctorVisit($('svPatient').value, {
        outcome: $('svOutcome').value,
        treatment: $('svTreatment').value,
        note: $('svNote').value
      });
    } else if (e.target.id === 'drawerVisitForm' && state.selectedPatientId) {
      e.preventDefault();
      recordDoctorVisit(state.selectedPatientId, {
        outcome: $('dvOutcome').value,
        treatment: $('dvTreat').value,
        note: $('dvNote').value
      });
    } else if (e.target.id === 'admitForm') {
      e.preventDefault();
      admitPatient({
        id: $('admitId').value,
        name: $('admitName').value,
        room: $('admitRoom').value,
        admitDate: $('admitDate').value
      });
    } else if (e.target.id === 'settingsForm') {
      e.preventDefault();
      if (!canEditSettings(state.role)) return;
      const fever = Number($('setFever').value);
      const days = parseInt($('setDays').value, 10);
      if (!Number.isFinite(fever) || fever < 36.5 || fever > 40) {
        return showToast('Enter a valid fever threshold between 36.5°C and 40.0°C', 'bad');
      }
      if (!Number.isInteger(days) || days < 1 || days > 14) {
        return showToast('Consecutive afebrile days must be between 1 and 14', 'bad');
      }
      state.settings.feverThreshold = Number(fever.toFixed(1));
      state.settings.requiredNoFeverDays = days;
      addActivity(`Head Doctor updated clinical policy: Fever >= ${state.settings.feverThreshold}°C, Cure rule = ${days} days`, 'info');
      showToast('Clinical thresholds updated', 'good');
      saveState();
      render();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && state.selectedPatientId) {
      closeJournalDrawer();
    }
  });

  render();
})();

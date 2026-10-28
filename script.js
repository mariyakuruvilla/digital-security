/* =========================================================
   DIGITAL HAVEN — script.js
   Full interactivity, localStorage persistence, personalization
   ========================================================= */

'use strict';

// ─── SVG Gradient for Score Ring ────────────────────────────────────────────
(function setupScoreGradient() {
  const ring = document.querySelector('.score-ring');
  if (ring && !document.getElementById('ringGradient')) {
    ring.insertAdjacentHTML('afterbegin', `
      <defs>
        <linearGradient id="ringGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%"   stop-color="#5A7A59"/>
          <stop offset="100%" stop-color="#344536"/>
        </linearGradient>
      </defs>
    `);
  }
})();

// ─── Sample Demo Data ────────────────────────────────────────────────────────
const DEMO_ACCOUNTS = [
  { id: 'acc_1', name: 'ProtonMail',    category: 'Email',        twoFA: 'Enabled',  recovery: 'Backup Codes',      notes: 'Primary encrypted mailbox' },
  { id: 'acc_2', name: 'Instagram',     category: 'Social Media', twoFA: 'Disabled', recovery: 'Email',             notes: 'Personal portfolio page' },
  { id: 'acc_3', name: 'Zerodha Kite',  category: 'Banking',      twoFA: 'Enabled',  recovery: 'Authenticator App', notes: 'Trading and equity investments' },
  { id: 'acc_4', name: 'Amazon India',  category: 'Shopping',     twoFA: 'Disabled', recovery: 'Phone',             notes: 'Online storefront and order history' },
  { id: 'acc_5', name: 'GitHub Pro',    category: 'Work',         twoFA: 'Enabled',  recovery: 'Backup Codes',      notes: 'Code repositories and SSH keys' },
  { id: 'acc_6', name: 'Coursera',      category: 'Education',    twoFA: 'Enabled',  recovery: 'Email',             notes: 'Academic certifications' },
  { id: 'acc_7', name: 'LinkedIn',      category: 'Social Media', twoFA: 'Unknown',  recovery: 'None',              notes: 'Professional contact network' },
];

const DEMO_SUBSCRIPTIONS = [
  { id: 'sub_1', name: 'Netflix 4K',      cost: 649,  freq: 'monthly',  category: 'Entertainment', renewal: '2026-11-05' },
  { id: 'sub_2', name: 'Spotify Premium', cost: 119,  freq: 'monthly',  category: 'Music',         renewal: '2026-10-22' },
  { id: 'sub_3', name: 'Google One 2TB',  cost: 6500, freq: 'yearly',   category: 'Cloud Storage', renewal: '2026-12-15' },
  { id: 'sub_4', name: 'Adobe Creative',  cost: 3675, freq: 'monthly',  category: 'Productivity',  renewal: '2026-10-28' },
  { id: 'sub_5', name: 'Bitwarden Family',cost: 3200, freq: 'yearly',   category: 'Security',      renewal: '2026-11-30' },
  { id: 'sub_6', name: 'GitHub Copilot',  cost: 850,  freq: 'monthly',  category: 'Education',     renewal: '2026-11-12' },
];

const DEFAULT_RECOVERY_ITEMS = [
  { id: 'backup_codes',     category: 'Account Access',     title: 'Saved backup and recovery codes',          desc: 'Download and store one-time emergency bypass codes in an encrypted offline vault.' },
  { id: 'recovery_email',   category: 'Account Access',     title: 'Verified secondary recovery email',        desc: 'Confirm that linked fallback emails across critical services remain active and monitored.' },
  { id: 'phone_number',     category: 'Recovery Contacts',  title: 'Up-to-date recovery phone number',         desc: 'Ensure mobile numbers tied to SMS verification or SIM accounts are currently active.' },
  { id: 'trusted_contacts', category: 'Recovery Contacts',  title: 'Configured trusted and legacy contacts',   desc: 'Designate emergency contacts for account recovery within Apple ID or Google Inactive Account.' },
  { id: 'data_backup',      category: 'Backup Preparation', title: 'Automated 3-2-1 data backups',             desc: 'Maintain regular off-site and local backup copies of essential documents and device states.' },
  { id: 'offline_storage',  category: 'Backup Preparation', title: 'Encrypted offline hardware storage',       desc: 'Keep an encrypted USB drive or physical emergency dossier in a secure fire-safe box.' },
  { id: 'password_manager', category: 'Security Settings',  title: 'Dedicated password manager vault',         desc: 'Generate unique, complex passphrases for all accounts and record your master key securely.' },
  { id: 'device_lock',      category: 'Security Settings',  title: 'Device full-disk encryption active',       desc: 'Verify that BitLocker, FileVault, or mobile encryption is enabled with strong biometric locks.' },
];

const STATIC_FINDINGS = [
  { id: 'f1', title: 'Accounts Without Two-Factor Authentication', severity: 'High',   category: 'Authentication', explanation: 'Accounts without 2FA are significantly more vulnerable to unauthorised access and credential stuffing.', action: 'Enable 2FA on all critical accounts, prioritising email, financial services, and primary cloud storage.' },
  { id: 'f2', title: 'Missing Recovery Methods',                   severity: 'High',   category: 'Recovery',       explanation: 'Without an independent recovery channel, you risk permanent lockout should your primary credential fail.', action: 'Add a verified secondary email, dedicated phone number, or printed backup codes to each account.' },
  { id: 'f3', title: 'Subscriptions Renewing Soon',                severity: 'Medium', category: 'Financial',      explanation: 'Subscriptions renewing in the next 30 days require attention to avoid unexpected charges or service disruption.', action: 'Review upcoming renewals and cancel any services you no longer actively use.' },
  { id: 'f4', title: 'Recovery Checklist Incomplete',              severity: 'Medium', category: 'Recovery',       explanation: 'An incomplete recovery checklist leaves gaps in your digital emergency preparedness during incidents.', action: 'Complete all baseline items in the Recovery Centre checklist to guarantee access continuity.' },
  { id: 'f5', title: 'Weak Password Practices (Simulated)',        severity: 'Low',    category: 'Authentication', explanation: 'Without a password manager, users frequently reuse predictable passphrases across multiple web portals.', action: 'Consider using a reputable password manager such as Bitwarden or 1Password to generate unique passphrases.' },
  { id: 'f6', title: 'No Offline Data Backup (Simulated)',         severity: 'Low',    category: 'Backup',         explanation: 'Relying solely on cloud storage creates a single point of failure should an account become suspended.', action: 'Set up an offline backup on an encrypted external drive following the 3-2-1 backup principle.' },
];

// ─── Utility Helpers ────────────────────────────────────────────────────────
function uid() {
  return 'id_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
}

function fmtCurrency(n) {
  const num = Number(n) || 0;
  return '\u20B9' + num.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function fmtDate(dateStr) {
  if (!dateStr) return '\u2014';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '\u2014';
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function daysUntil(dateStr) {
  if (!dateStr) return Infinity;
  const now = new Date(); now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  if (isNaN(target.getTime())) return Infinity;
  return Math.ceil((target - now) / 86400000);
}

function escapeHtml(str) {
  return String(str || '')
    .replace(/&/g,  '&amp;')
    .replace(/</g,  '&lt;')
    .replace(/>/g,  '&gt;')
    .replace(/"/g,  '&quot;')
    .replace(/'/g,  '&#39;');
}

function toMonthly(cost, freq) {
  const c = Number(cost) || 0;
  const f = (freq || 'monthly').toLowerCase();
  if (f === 'weekly')    return c * (52 / 12);
  if (f === 'quarterly') return c / 3;
  if (f === 'yearly')    return c / 12;
  return c;
}

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 17) return 'Good afternoon';
  return 'Good evening';
}

function getInitials(name) {
  if (!name || !name.trim()) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

function categoryBg(cat) {
  const COLORS = {
    'Email':         '#D0E1FD',
    'Social Media':  '#E5D8FD',
    'Banking':       '#C9DCC8',
    'Shopping':      '#FCE7C8',
    'Work':          '#C7EAE5',
    'Education':     '#FDE2E4',
    'Entertainment': '#F8D7DA',
    'Health':        '#FAD2E1',
    'Music':         '#E2DCFC',
    'Cloud Storage': '#D1ECF1',
    'Productivity':  '#FFF0C2',
    'News':          '#DFE7D2',
    'Gaming':        '#F0DCF5',
    'Security':      '#C9DCC8',
    'Other':         '#EAE6DF',
  };
  return COLORS[cat] || '#EAE6DF';
}

function categoryInitial(cat) {
  if (!cat || typeof cat !== 'string') return 'O';
  return cat.trim().charAt(0).toUpperCase() || 'O';
}

// ─── LocalStorage Keys ────────────────────────────────────────────────────────
const LS = {
  accounts:   'dh_accounts',
  subs:       'dh_subs',
  recovery:   'dh_recovery',
  init:       'dh_init',
  motion:     'dh_reduce_motion',
  profile:    'dh_profile',      // { displayName, workspaceName }
  theme:      'dh_theme',        // 'sage' | 'lavender' | 'blush'
  activity:   'dh_activity',     // array of activity log entries
};

function lsGet(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; }
  catch { return null; }
}
function lsSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); }
  catch (e) { console.error('localStorage write failed:', e); }
}

// ─── App State ────────────────────────────────────────────────────────────────
const state = {
  accounts: [],
  subs:     [],
  recovery: { checks: {}, custom: [] },
  recoveryFilter: 'all',
  currentSection: 'dashboard',
  profile: { displayName: '', workspaceName: 'Personal Space' },
  theme:   'sage',
  activity: [],
};

// ─── Activity Log ─────────────────────────────────────────────────────────────
function logActivity(icon, text) {
  const entry = { icon, text, ts: Date.now() };
  state.activity.unshift(entry);
  if (state.activity.length > 20) state.activity = state.activity.slice(0, 20);
  lsSet(LS.activity, state.activity);
}

function fmtActivityTime(ts) {
  const diff = Date.now() - ts;
  const mins = Math.floor(diff / 60000);
  if (mins < 1)   return 'just now';
  if (mins < 60)  return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)   return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

// ─── State Initialization ─────────────────────────────────────────────────────
function initState() {
  const firstRun = !localStorage.getItem(LS.init);

  if (firstRun) {
    state.accounts = JSON.parse(JSON.stringify(DEMO_ACCOUNTS));
    state.subs     = JSON.parse(JSON.stringify(DEMO_SUBSCRIPTIONS));
    state.recovery = {
      checks: {
        backup_codes:     true,
        recovery_email:   true,
        phone_number:     false,
        trusted_contacts: false,
        data_backup:      true,
        offline_storage:  false,
        password_manager: true,
        device_lock:      true,
      },
      custom: []
    };
    state.activity = [
      { icon: 'star', text: 'Welcome to Digital Haven — your sample data has been loaded.', ts: Date.now() - 300000 },
    ];
    persistAll();
    lsSet(LS.activity, state.activity);
    localStorage.setItem(LS.init, '1');
  } else {
    state.accounts = lsGet(LS.accounts) || [];
    const savedSubs = lsGet(LS.subs) || [];
    state.subs = savedSubs.map(s => ({ ...s, freq: s.freq || 'monthly' }));

    const savedRec = lsGet(LS.recovery);
    if (savedRec && savedRec.checks) {
      state.recovery = { checks: savedRec.checks || {}, custom: Array.isArray(savedRec.custom) ? savedRec.custom : [] };
    } else if (savedRec && typeof savedRec === 'object') {
      state.recovery = { checks: { ...savedRec }, custom: [] };
    } else {
      state.recovery = { checks: {}, custom: [] };
    }

    state.activity = lsGet(LS.activity) || [];
  }

  // Profile
  const savedProfile = lsGet(LS.profile);
  if (savedProfile) {
    state.profile.displayName   = savedProfile.displayName   || '';
    state.profile.workspaceName = savedProfile.workspaceName || 'Personal Space';
  }

  // Theme
  state.theme = lsGet(LS.theme) || 'sage';
  applyTheme(state.theme);
  syncThemeSwatches(state.theme);

  // Motion preference
  const reduceMotion = localStorage.getItem(LS.motion) === 'true';
  const toggle = document.getElementById('reduceMotionToggle');
  if (toggle) toggle.checked = reduceMotion;
  if (reduceMotion) document.body.classList.add('reduce-motion');
  else              document.body.classList.remove('reduce-motion');

  // Populate settings fields
  const nameField = document.getElementById('settingDisplayName');
  const wsField   = document.getElementById('settingWorkspaceName');
  if (nameField) nameField.value = state.profile.displayName;
  if (wsField)   wsField.value   = state.profile.workspaceName;

  // Update sidebar profile
  updateSidebarProfile();
}

function persistAll() {
  lsSet(LS.accounts, state.accounts);
  lsSet(LS.subs,     state.subs);
  lsSet(LS.recovery, state.recovery);
}

// ─── Profile & Theme ─────────────────────────────────────────────────────────
function updateSidebarProfile() {
  const nameEl      = document.getElementById('sidebarName');
  const wsEl        = document.getElementById('sidebarWorkspace');
  const avatarEl    = document.getElementById('sidebarAvatar');

  const name = state.profile.displayName || 'Your Name';
  const ws   = state.profile.workspaceName || 'Personal Space';

  if (nameEl)   nameEl.textContent   = name;
  if (wsEl)     wsEl.textContent     = ws;
  if (avatarEl) avatarEl.textContent = getInitials(name);
}

function saveProfile() {
  const nameField = document.getElementById('settingDisplayName');
  const name = (nameField ? nameField.value.trim() : '') || '';
  state.profile.displayName = name;
  lsSet(LS.profile, state.profile);
  updateSidebarProfile();
  renderDashboard();
  toast('Display name saved.', 'success');
  logActivity('user', `Display name updated to "${name || 'unnamed'}".`);
}

function saveWorkspace() {
  const wsField = document.getElementById('settingWorkspaceName');
  const ws = (wsField ? wsField.value.trim() : '') || 'Personal Space';
  state.profile.workspaceName = ws;
  lsSet(LS.profile, state.profile);
  updateSidebarProfile();
  toast('Workspace label saved.', 'success');
  logActivity('briefcase', `Workspace renamed to "${ws}".`);
}

function applyTheme(theme) {
  document.body.classList.remove('theme-sage', 'theme-lavender', 'theme-blush');
  if (theme === 'lavender') document.body.classList.add('theme-lavender');
  else if (theme === 'blush') document.body.classList.add('theme-blush');
  // sage is default (no class needed)
}

function syncThemeSwatches(theme) {
  document.querySelectorAll('.theme-swatch').forEach(s => {
    s.classList.toggle('active', s.dataset.theme === theme);
  });
}

function switchTheme(theme) {
  state.theme = theme;
  lsSet(LS.theme, theme);
  applyTheme(theme);
  syncThemeSwatches(theme);
  toast('Theme updated.', 'success');
}

// ─── Navigation ───────────────────────────────────────────────────────────────
function navigateTo(section) {
  document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));

  const sectionEl = document.getElementById('section-' + section);
  const navEl     = document.querySelector(`.nav-item[data-section="${section}"]`);

  if (sectionEl) sectionEl.classList.add('active');
  if (navEl)     navEl.classList.add('active');

  state.currentSection = section;

  if (section === 'dashboard')     renderDashboard();
  if (section === 'accounts')      renderAccounts();
  if (section === 'subscriptions') renderSubscriptions();
  if (section === 'risk')          renderRisk();
  if (section === 'recovery')      renderRecovery();

  lucide.createIcons();

  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.remove('open');
}

// ─── Toast Notifications ──────────────────────────────────────────────────────
function toast(message, type = 'success') {
  const container = document.getElementById('toastContainer');
  if (!container) return;
  const icons = { success: 'check-circle', error: 'alert-circle', info: 'info' };
  const t = document.createElement('div');
  t.className = `toast ${type}`;
  t.innerHTML = `<i data-lucide="${icons[type] || 'info'}"></i><span>${escapeHtml(message)}</span>`;
  container.appendChild(t);
  lucide.createIcons();
  setTimeout(() => t.remove(), 3600);
}

// ─── Confirmation Modal ───────────────────────────────────────────────────────
function confirmAction(title, message, iconName, onConfirm) {
  const overlay    = document.getElementById('modalOverlay');
  const titleEl    = document.getElementById('modalTitle');
  const msgEl      = document.getElementById('modalMessage');
  const iconEl     = document.getElementById('modalIcon');
  const confirmBtn = document.getElementById('modalConfirm');

  if (!overlay) return;

  titleEl.textContent = title;
  msgEl.textContent   = message;
  iconEl.innerHTML    = `<i data-lucide="${iconName || 'alert-triangle'}"></i>`;

  overlay.classList.add('active');
  lucide.createIcons();

  confirmBtn.onclick = () => {
    closeModal();
    if (typeof onConfirm === 'function') onConfirm();
  };
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  if (overlay) overlay.classList.remove('active');
}

// ─── DASHBOARD ────────────────────────────────────────────────────────────────
function renderDashboard() {
  const totalAccounts = state.accounts.length;
  const twoFaAccounts  = state.accounts.filter(a => a.twoFA === 'Enabled').length;
  const noTfa          = state.accounts.filter(a => a.twoFA !== 'Enabled').length;
  const noRecovery     = state.accounts.filter(a => a.recovery === 'None').length;

  const totalRecoveryItems = DEFAULT_RECOVERY_ITEMS.length + (state.recovery.custom || []).length;
  const completedDefaults  = DEFAULT_RECOVERY_ITEMS.filter(item => !!state.recovery.checks[item.id]).length;
  const completedCustoms   = (state.recovery.custom || []).filter(item => item.done).length;
  const recoveryPct        = totalRecoveryItems > 0 ? Math.round(((completedDefaults + completedCustoms) / totalRecoveryItems) * 100) : 0;

  const monthlySpend = state.subs.reduce((sum, s) => sum + toMonthly(s.cost, s.freq), 0);

  const expiringSubs = state.subs.filter(s => { const d = daysUntil(s.renewal); return d >= 0 && d <= 30; });

  // Safety Score
  let score = 100;
  score -= noTfa * 8;
  score -= noRecovery * 12;
  score -= Math.round((100 - recoveryPct) * 0.25);
  if (expiringSubs.length > 2) score -= 5;
  score = Math.max(0, Math.min(100, score));

  // Personalized greeting
  const name = state.profile.displayName;
  const greetingEl   = document.getElementById('dashGreeting');
  const titleEl      = document.getElementById('dashWelcomeTitle');
  if (greetingEl) greetingEl.textContent = name ? `${getGreeting()}, ${name}` : getGreeting();
  if (titleEl)    titleEl.textContent    = name ? `${name}'s Digital Wellness` : 'Your Digital Wellness Overview';

  // Update stats
  const el = id => document.getElementById(id);
  if (el('dashTotalAccounts'))  el('dashTotalAccounts').textContent  = totalAccounts;
  if (el('dashTwoFAAccounts'))  el('dashTwoFAAccounts').textContent  = twoFaAccounts;
  if (el('dashRecovery'))       el('dashRecovery').textContent       = recoveryPct + '%';
  if (el('dashSpending'))       el('dashSpending').textContent       = fmtCurrency(monthlySpend);
  if (el('dashRenewalsCount'))  el('dashRenewalsCount').textContent  = expiringSubs.length;
  if (el('dashSafetyScore'))    el('dashSafetyScore').textContent    = score;

  // Ring animation
  const ringFill = document.getElementById('scoreRingFill');
  if (ringFill) {
    const offset = 314 - (score / 100) * 314;
    ringFill.style.strokeDashoffset = offset;
  }

  // Score title + tags
  let stitle = 'Strong Security Posture';
  let sdesc  = 'This illustrative score is based on your saved demo information — not a real security scan.';
  let stags  = [{ label: 'Good 2FA Coverage', cls: 'good' }, { label: 'Recovery Plan Ready', cls: 'good' }];

  if (score < 55) {
    stitle = 'High Risk Exposure Detected';
    sdesc  = 'Critical security gaps identified. Prioritize enabling 2FA and establishing recovery options.';
    stags  = [{ label: 'Significant 2FA Gaps', cls: 'danger' }, { label: 'Incomplete Recovery Plan', cls: 'danger' }];
  } else if (score < 80) {
    stitle = 'Moderate Risk Detected';
    sdesc  = 'A few security gaps need attention. Address unprotected accounts to strengthen your posture.';
    stags  = [{ label: 'Partial 2FA Coverage', cls: 'warn' }, { label: 'Review Recovery Methods', cls: 'warn' }];
  }

  if (el('scoreTitle')) el('scoreTitle').textContent = stitle;
  if (el('scoreDesc'))  el('scoreDesc').textContent  = sdesc;
  if (el('scoreTags'))  el('scoreTags').innerHTML    = stags.map(t =>
    `<span class="score-tag ${t.cls}">${escapeHtml(t.label)}</span>`).join('');

  // Security insights alerts
  const alerts = [];
  if (noTfa > 0)       alerts.push({ type: 'danger', icon: 'shield-off',      msg: `${noTfa} account(s) do not have Two-Factor Authentication enabled.` });
  if (noRecovery > 0)  alerts.push({ type: 'danger', icon: 'alert-triangle',  msg: `${noRecovery} account(s) have no recovery channel configured.` });
  if (expiringSubs.length > 0) alerts.push({ type: 'warn', icon: 'calendar-clock', msg: `${expiringSubs.length} subscription(s) renew within the next 30 days.` });
  if (recoveryPct < 75) alerts.push({ type: 'info', icon: 'life-buoy',        msg: `Recovery readiness is at ${recoveryPct}%. Complete outstanding checklist items.` });
  if (alerts.length === 0) alerts.push({ type: 'success', icon: 'check-circle', msg: 'No critical security gaps detected. Your digital posture is resilient.' });

  const dashAlertsEl = el('dashAlerts');
  if (dashAlertsEl) {
    dashAlertsEl.innerHTML = alerts.map(a =>
      `<div class="alert-item ${a.type}"><i data-lucide="${a.icon}"></i><span>${escapeHtml(a.msg)}</span></div>`
    ).join('');
  }

  // Upcoming renewals list
  const renewalsEl = el('dashRenewalsList');
  if (renewalsEl) {
    const upcoming = state.subs
      .filter(s => { const d = daysUntil(s.renewal); return d >= 0 && d <= 60; })
      .sort((a, b) => daysUntil(a.renewal) - daysUntil(b.renewal))
      .slice(0, 5);

    if (upcoming.length === 0) {
      renewalsEl.innerHTML = `<div class="empty-state" style="padding: 2rem 1rem;"><i data-lucide="calendar-check"></i><p>No upcoming renewals in the next 60 days.</p></div>`;
    } else {
      renewalsEl.innerHTML = upcoming.map(s => {
        const d = daysUntil(s.renewal);
        const badgeCls = d <= 7 ? 'badge-blush' : d <= 30 ? 'badge-amber' : 'badge-sage';
        return `<div class="renewal-item">
          <span class="renewal-name">${escapeHtml(s.name)}</span>
          <span class="badge ${badgeCls}">${d === 0 ? 'Today' : `${d}d`}</span>
          <span class="renewal-date">${fmtDate(s.renewal)}</span>
        </div>`;
      }).join('');
    }
  }

  // Recent activity
  const activityEl = el('dashActivity');
  if (activityEl) {
    const recent = state.activity.slice(0, 6);
    if (recent.length === 0) {
      activityEl.innerHTML = `<div class="empty-state" style="padding: 2rem 1rem;"><i data-lucide="activity"></i><p>No activity recorded yet.</p></div>`;
    } else {
      activityEl.innerHTML = recent.map(a =>
        `<div class="activity-item"><i data-lucide="${escapeHtml(a.icon)}"></i><span>${escapeHtml(a.text)}</span><span class="activity-time">${fmtActivityTime(a.ts)}</span></div>`
      ).join('');
    }
  }

  lucide.createIcons();
}

// ─── DIGITAL ACCOUNTS ─────────────────────────────────────────────────────────
function renderAccounts() {
  const list = document.getElementById('accountsList');
  if (!list) return;

  const searchQuery = (document.getElementById('accSearch')?.value || '').trim().toLowerCase();
  const selectedCat = document.getElementById('accCatFilter')?.value || '';
  const selectedTfa = document.getElementById('accTfaFilter')?.value || '';

  let accounts = state.accounts;
  if (searchQuery)  accounts = accounts.filter(a => a.name.toLowerCase().includes(searchQuery) || a.category.toLowerCase().includes(searchQuery) || (a.notes && a.notes.toLowerCase().includes(searchQuery)));
  if (selectedCat)  accounts = accounts.filter(a => a.category === selectedCat);
  if (selectedTfa)  accounts = accounts.filter(a => a.twoFA === selectedTfa);

  if (accounts.length === 0) {
    list.innerHTML = `<div class="empty-state"><i data-lucide="user-x"></i><p>${searchQuery || selectedCat || selectedTfa ? 'No accounts match your filter criteria.' : 'No accounts recorded yet. Add your first account above.'}</p></div>`;
    lucide.createIcons();
    return;
  }

  list.innerHTML = accounts.map(a => {
    const tfaCls   = a.twoFA === 'Enabled' ? 'badge-sage' : a.twoFA === 'Disabled' ? 'badge-blush' : 'badge-amber';
    const tfaLabel = a.twoFA === 'Enabled' ? '2FA On' : a.twoFA === 'Disabled' ? '2FA Off' : '2FA Unknown';
    const recCls   = a.recovery === 'None' ? 'badge-blush' : 'badge-lavender';
    const recLabel = a.recovery === 'None' ? 'No Recovery' : a.recovery;

    return `
      <div class="item-card" id="acc-${a.id}">
        <div class="item-initial-avatar" style="background: ${categoryBg(a.category)};">${categoryInitial(a.category)}</div>
        <div class="item-details">
          <div class="item-name">${escapeHtml(a.name)}</div>
          <div class="item-meta">
            <span class="badge badge-gray">${escapeHtml(a.category)}</span>
            <span class="badge ${tfaCls}">${escapeHtml(tfaLabel)}</span>
            <span class="badge ${recCls}">${escapeHtml(recLabel)}</span>
            ${a.notes ? `<span class="badge badge-gray">${escapeHtml(a.notes)}</span>` : ''}
          </div>
        </div>
        <div class="item-actions">
          <button class="btn-icon edit-btn" onclick="editAccount('${a.id}')" title="Edit account" aria-label="Edit ${escapeHtml(a.name)}">
            <i data-lucide="edit-3"></i>
          </button>
          <button class="btn-icon" onclick="deleteAccount('${a.id}')" title="Delete account" aria-label="Delete ${escapeHtml(a.name)}">
            <i data-lucide="trash-2"></i>
          </button>
        </div>
      </div>`;
  }).join('');

  lucide.createIcons();
}

function addAccount(e) {
  e.preventDefault();
  const form     = document.getElementById('accountForm');
  const nameEl   = document.getElementById('accName');
  const catEl    = document.getElementById('accCategory');
  const tfaEl    = document.getElementById('acc2FA');
  const recEl    = document.getElementById('accRecovery');
  const notesEl  = document.getElementById('accNotes');
  const editIdEl = document.getElementById('accEditId');

  [nameEl, catEl].forEach(el => el.classList.remove('error'));

  let isValid = true;
  if (!nameEl.value.trim()) { nameEl.classList.add('error'); isValid = false; }
  if (!catEl.value)         { catEl.classList.add('error');  isValid = false; }
  if (!isValid) { toast('Please provide an account name and select a category.', 'error'); return; }

  const isEditing = form.dataset.mode === 'edit';
  const targetId  = editIdEl.value;

  if (isEditing && targetId) {
    const idx = state.accounts.findIndex(a => a.id === targetId);
    if (idx !== -1) {
      const oldName = state.accounts[idx].name;
      state.accounts[idx] = { id: targetId, name: nameEl.value.trim(), category: catEl.value, twoFA: tfaEl.value, recovery: recEl.value, notes: notesEl.value.trim() };
      persistAll();
      cancelAccountEdit();
      renderAccounts();
      renderDashboard();
      logActivity('edit-3', `Account "${state.accounts[idx].name}" updated.`);
      toast('Account updated successfully.', 'success');
      return;
    }
  }

  const acc = { id: uid(), name: nameEl.value.trim(), category: catEl.value, twoFA: tfaEl.value, recovery: recEl.value, notes: notesEl.value.trim() };
  state.accounts.push(acc);
  persistAll();
  form.reset();
  renderAccounts();
  renderDashboard();
  logActivity('user-plus', `Account "${acc.name}" added.`);
  toast(`Account "${acc.name}" added.`, 'success');
}

function editAccount(id) {
  const acc = state.accounts.find(a => a.id === id);
  if (!acc) return;
  const form = document.getElementById('accountForm');
  if (!form) return;

  form.dataset.mode = 'edit';
  document.getElementById('accEditId').value     = acc.id;
  document.getElementById('accName').value        = acc.name;
  document.getElementById('accCategory').value    = acc.category;
  document.getElementById('acc2FA').value         = acc.twoFA;
  document.getElementById('accRecovery').value    = acc.recovery;
  document.getElementById('accNotes').value       = acc.notes || '';

  const titleEl  = document.getElementById('accFormTitle');
  const labelEl  = document.getElementById('accSubmitLabel');
  const cancelEl = document.getElementById('accCancelEditBtn');
  if (titleEl)  titleEl.textContent = 'Edit Account';
  if (labelEl)  labelEl.textContent = 'Save Changes';
  if (cancelEl) cancelEl.style.display = 'inline-flex';

  form.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  document.getElementById('accName').focus();
}

function cancelAccountEdit() {
  const form = document.getElementById('accountForm');
  if (!form) return;
  form.reset();
  form.dataset.mode = 'add';
  document.getElementById('accEditId').value     = '';

  const titleEl  = document.getElementById('accFormTitle');
  const labelEl  = document.getElementById('accSubmitLabel');
  const cancelEl = document.getElementById('accCancelEditBtn');
  if (titleEl)  titleEl.textContent = 'Add New Account';
  if (labelEl)  labelEl.textContent = 'Add Account';
  if (cancelEl) cancelEl.style.display = 'none';
}

function deleteAccount(id) {
  const acc = state.accounts.find(a => a.id === id);
  if (!acc) return;
  confirmAction('Delete Account', `Remove "${acc.name}" from your accounts? This cannot be undone.`, 'trash-2', () => {
    state.accounts = state.accounts.filter(a => a.id !== id);
    persistAll();
    renderAccounts();
    renderDashboard();
    logActivity('trash-2', `Account "${acc.name}" deleted.`);
    toast(`Account "${acc.name}" removed.`, 'info');
  });
}

// ─── SUBSCRIPTIONS ────────────────────────────────────────────────────────────
function renderCategoryChart(subs) {
  const container = document.getElementById('subCategoryChart');
  if (!container) return;
  if (!subs || subs.length === 0) {
    container.innerHTML = '<p style="text-align:center; padding:1.5rem 0; color:var(--muted); font-size:0.9rem;">No subscriptions to analyse.</p>';
    return;
  }
  const catTotals = {};
  subs.forEach(s => {
    const cat = s.category || 'Other';
    catTotals[cat] = (catTotals[cat] || 0) + toMonthly(s.cost, s.freq);
  });
  const sorted  = Object.entries(catTotals).sort((a, b) => b[1] - a[1]);
  const maxVal  = sorted[0] ? sorted[0][1] : 1;
  container.innerHTML = sorted.map(([cat, amount]) => {
    const pct = Math.max(6, Math.round((amount / maxVal) * 100));
    return `
      <div class="cat-bar-item">
        <div class="cat-bar-header">
          <span class="cat-bar-title">${escapeHtml(cat)}</span>
          <span class="cat-bar-amount">${fmtCurrency(amount)}/mo</span>
        </div>
        <div class="cat-bar-track">
          <div class="cat-bar-fill" style="width:${pct}%; background:${categoryBg(cat)}; border:1px solid rgba(52,69,54,.08);"></div>
        </div>
      </div>`;
  }).join('');
}

function renderSubscriptions() {
  const list = document.getElementById('subList');
  if (!list) return;

  const searchQuery = (document.getElementById('subSearch')?.value || '').trim().toLowerCase();
  const selectedCat = document.getElementById('subCatFilter')?.value || '';

  let subs = state.subs;
  if (searchQuery) subs = subs.filter(s => s.name.toLowerCase().includes(searchQuery) || s.category.toLowerCase().includes(searchQuery));
  if (selectedCat) subs = subs.filter(s => s.category === selectedCat);

  const totalMonthly = state.subs.reduce((sum, s) => sum + toMonthly(s.cost, s.freq), 0);
  const totalAnnual  = totalMonthly * 12;

  const totalEl  = document.getElementById('subTotal');
  const annualEl = document.getElementById('subAnnual');
  if (totalEl)  totalEl.textContent  = fmtCurrency(totalMonthly);
  if (annualEl) annualEl.textContent = fmtCurrency(totalAnnual);

  renderCategoryChart(state.subs);

  if (subs.length === 0) {
    list.innerHTML = `<div class="empty-state"><i data-lucide="credit-card"></i><p>${searchQuery || selectedCat ? 'No subscriptions match your filter.' : 'No subscriptions yet. Add your recurring services above.'}</p></div>`;
    lucide.createIcons();
    return;
  }

  list.innerHTML = subs.map(s => {
    const days = daysUntil(s.renewal);
    let rdCls = 'badge-sage';
    let rdLabel = s.renewal ? `Renews: ${fmtDate(s.renewal)}` : '';
    if (days < 0)       { rdCls = 'badge-blush'; rdLabel = `Overdue (${Math.abs(days)}d ago)`; }
    else if (days <= 7) { rdCls = 'badge-blush'; rdLabel = `Renews in ${days}d`; }
    else if (days <= 30){ rdCls = 'badge-amber'; rdLabel = `Renews in ${days}d`; }

    const freqLabel = (s.freq || 'monthly').charAt(0).toUpperCase() + (s.freq || 'monthly').slice(1);
    const monthlyEq = toMonthly(s.cost, s.freq);

    return `
      <div class="item-card" id="sub-${s.id}">
        <div class="item-initial-avatar" style="background: ${categoryBg(s.category)};">${categoryInitial(s.category)}</div>
        <div class="item-details">
          <div class="item-name">${escapeHtml(s.name)}</div>
          <div class="item-meta">
            <span class="badge badge-gray">${escapeHtml(s.category)}</span>
            <span class="badge badge-lavender">${escapeHtml(freqLabel)}</span>
            ${s.renewal ? `<span class="badge ${rdCls}">${escapeHtml(rdLabel)}</span>` : ''}
          </div>
        </div>
        <div class="sub-cost-wrap">
          <span class="sub-cost-main">${fmtCurrency(s.cost)} <span style="font-size:.72rem;font-weight:500;color:var(--muted);">/ ${s.freq || 'mo'}</span></span>
          ${s.freq && s.freq !== 'monthly' ? `<span class="sub-cost-eq">${fmtCurrency(monthlyEq)}/mo equiv.</span>` : ''}
        </div>
        <button class="btn-icon" onclick="deleteSubscription('${s.id}')" title="Delete" aria-label="Delete ${escapeHtml(s.name)}">
          <i data-lucide="trash-2"></i>
        </button>
      </div>`;
  }).join('');

  lucide.createIcons();
}

function addSubscription(e) {
  e.preventDefault();
  const nameEl = document.getElementById('subName');
  const costEl = document.getElementById('subCost');
  const freqEl = document.getElementById('subFrequency');
  const catEl  = document.getElementById('subCategory');
  const renEl  = document.getElementById('subRenewal');

  [nameEl, costEl].forEach(el => el.classList.remove('error'));
  let isValid = true;
  if (!nameEl.value.trim())                                               { nameEl.classList.add('error'); isValid = false; }
  if (!costEl.value || isNaN(Number(costEl.value)) || Number(costEl.value) <= 0) { costEl.classList.add('error'); isValid = false; }
  if (!isValid) { toast('Please enter a service name and a valid cost.', 'error'); return; }

  const sub = {
    id: uid(),
    name:     nameEl.value.trim(),
    cost:     Number(costEl.value),
    freq:     freqEl.value || 'monthly',
    category: catEl.value || 'Other',
    renewal:  renEl.value || '',
  };
  state.subs.push(sub);
  persistAll();
  document.getElementById('subForm').reset();
  renderSubscriptions();
  renderDashboard();
  logActivity('credit-card', `Subscription "${sub.name}" added (${fmtCurrency(sub.cost)}/${sub.freq}).`);
  toast(`Subscription "${sub.name}" added.`, 'success');
}

function deleteSubscription(id) {
  const sub = state.subs.find(s => s.id === id);
  if (!sub) return;
  confirmAction('Remove Subscription', `Remove "${sub.name}" from your subscriptions?`, 'trash-2', () => {
    state.subs = state.subs.filter(s => s.id !== id);
    persistAll();
    renderSubscriptions();
    renderDashboard();
    logActivity('trash-2', `Subscription "${sub.name}" removed.`);
    toast(`Subscription "${sub.name}" removed.`, 'info');
  });
}

// ─── RISK ASSESSMENT ──────────────────────────────────────────────────────────
function renderRisk() {
  const noTfa      = state.accounts.filter(a => a.twoFA !== 'Enabled');
  const noRecovery = state.accounts.filter(a => a.recovery === 'None');
  const expiring   = state.subs.filter(s => { const d = daysUntil(s.renewal); return d >= 0 && d <= 30; });

  const totalRec       = DEFAULT_RECOVERY_ITEMS.length + (state.recovery.custom || []).length;
  const completedDef   = DEFAULT_RECOVERY_ITEMS.filter(item => !!state.recovery.checks[item.id]).length;
  const completedCust  = (state.recovery.custom || []).filter(item => item.done).length;
  const recoveryPct    = totalRec > 0 ? Math.round(((completedDef + completedCust) / totalRec) * 100) : 0;

  const el = id => document.getElementById(id);
  if (el('rNoTfa'))      el('rNoTfa').textContent      = noTfa.length;
  if (el('rNoRecovery')) el('rNoRecovery').textContent = noRecovery.length;
  if (el('rExpiring'))   el('rExpiring').textContent   = expiring.length;

  let riskScore = 0;
  riskScore += noTfa.length * 14;
  riskScore += noRecovery.length * 18;
  riskScore += expiring.length * 6;
  if (recoveryPct < 70) riskScore += Math.round((70 - recoveryPct) * 0.4);
  riskScore = Math.max(4, Math.min(100, riskScore));

  const riskBar = el('riskBar');
  if (riskBar) riskBar.style.left = `calc(${riskScore}% - 11px)`;

  let levelText = 'Low Risk Exposure'; let levelColor = '#5A7A59';
  if (riskScore >= 75)      { levelText = 'Critical Risk Detected'; levelColor = '#C0392B'; }
  else if (riskScore >= 45) { levelText = 'High Risk Detected';     levelColor = '#A0750A'; }
  else if (riskScore >= 20) { levelText = 'Moderate Risk Exposure'; levelColor = '#8A6E1E'; }

  const riskLevelEl = el('riskLevelText');
  if (riskLevelEl) { riskLevelEl.textContent = levelText; riskLevelEl.style.color = levelColor; }

  // Findings with severity filter
  const severityFilter = el('riskSeverityFilter')?.value || 'all';
  let findings = STATIC_FINDINGS;
  if (severityFilter !== 'all') findings = findings.filter(f => f.severity.toLowerCase() === severityFilter.toLowerCase());

  const findingsContainer = el('riskFindingsList');
  if (findingsContainer) {
    findingsContainer.innerHTML = findings.map(f => {
      let isResolved = false;
      let statusLabel = 'Action Required';
      let statusBadge = 'badge-blush';

      if (f.id === 'f1') {
        isResolved = noTfa.length === 0;
        statusLabel = isResolved ? 'Resolved' : `${noTfa.length} Affected`;
        statusBadge = isResolved ? 'badge-sage' : 'badge-blush';
      } else if (f.id === 'f2') {
        isResolved = noRecovery.length === 0;
        statusLabel = isResolved ? 'Resolved' : `${noRecovery.length} Affected`;
        statusBadge = isResolved ? 'badge-sage' : 'badge-blush';
      } else if (f.id === 'f3') {
        isResolved = expiring.length === 0;
        statusLabel = isResolved ? 'Resolved' : `${expiring.length} Due Soon`;
        statusBadge = isResolved ? 'badge-sage' : 'badge-amber';
      } else if (f.id === 'f4') {
        isResolved = recoveryPct === 100;
        statusLabel = isResolved ? '100% Prepared' : `${recoveryPct}% Complete`;
        statusBadge = isResolved ? 'badge-sage' : 'badge-amber';
      } else {
        statusLabel = 'Simulated Advisory';
        statusBadge = 'badge-lavender';
      }

      const sevCls = f.severity === 'High' ? 'badge-blush' : f.severity === 'Medium' ? 'badge-amber' : 'badge-lavender';
      return `
        <div class="finding-card">
          <div class="finding-header">
            <span class="finding-title">${escapeHtml(f.title)}</span>
            <div class="finding-badges">
              <span class="badge ${sevCls}">${escapeHtml(f.severity)} Severity</span>
              <span class="badge ${statusBadge}">${escapeHtml(statusLabel)}</span>
            </div>
          </div>
          <p class="finding-explanation">${escapeHtml(f.explanation)}</p>
          <div class="finding-action-box">
            <i data-lucide="${isResolved ? 'check-circle' : 'arrow-right-circle'}"></i>
            <span><strong>Recommended Action:</strong> ${escapeHtml(f.action)}</span>
          </div>
        </div>`;
    }).join('');
  }

  const recos = [
    'Enable Two-Factor Authentication with an authenticator app on all critical accounts (email, banking, cloud).',
    'Store master recovery codes in a secure, encrypted offline location — never in plain text.',
    'Use an audited password manager to eliminate credential reuse across sites.',
    'Regularly review active subscriptions and cancel dormant services to avoid unexpected charges.',
    'Maintain a secondary recovery email from a different provider for critical accounts.',
    'Schedule quarterly access audits to verify recovery methods, devices, and linked emails.',
  ];
  const recoContainer = el('riskRecommendations');
  if (recoContainer) {
    recoContainer.innerHTML = recos.map(r =>
      `<div class="reco-item"><i data-lucide="shield-check"></i><span>${escapeHtml(r)}</span></div>`
    ).join('');
  }

  lucide.createIcons();
}

// ─── RECOVERY CENTRE ──────────────────────────────────────────────────────────
function renderRecovery() {
  const container = document.getElementById('recoveryChecklist');
  if (!container) return;

  const totalItems     = DEFAULT_RECOVERY_ITEMS.length + (state.recovery.custom || []).length;
  const completedDef   = DEFAULT_RECOVERY_ITEMS.filter(item => !!state.recovery.checks[item.id]).length;
  const completedCust  = (state.recovery.custom || []).filter(item => item.done).length;
  const completedTotal = completedDef + completedCust;
  const recoveryPct    = totalItems > 0 ? Math.round((completedTotal / totalItems) * 100) : 0;

  const el = id => document.getElementById(id);
  if (el('recoveryPct'))  el('recoveryPct').textContent  = recoveryPct + '%';
  if (el('recoveryBar'))  el('recoveryBar').style.width  = recoveryPct + '%';

  const notes = [
    'Plan initiated — complete the baseline tasks below.',
    'Good progress — keep building your recovery plan.',
    'Substantial progress — your readiness is taking shape.',
    'Almost there — a few more steps to go.',
    'Comprehensive readiness — your contingency plan is complete.',
  ];
  if (el('recoveryNote')) el('recoveryNote').textContent = notes[Math.min(4, Math.floor(recoveryPct / 21))];

  const allItems = [
    ...DEFAULT_RECOVERY_ITEMS.map(item => ({ ...item, isCustom: false, done: !!state.recovery.checks[item.id] })),
    ...(state.recovery.custom || []).map(item => ({ ...item, title: item.text, desc: 'Custom contingency task', isCustom: true, done: !!item.done })),
  ];

  let filtered = allItems;
  if (state.recoveryFilter === 'pending')   filtered = allItems.filter(i => !i.done);
  if (state.recoveryFilter === 'completed') filtered = allItems.filter(i =>  i.done);

  if (filtered.length === 0) {
    container.innerHTML = `<div class="empty-state"><i data-lucide="clipboard-check"></i><p>No items match the "${escapeHtml(state.recoveryFilter)}" filter.</p></div>`;
    lucide.createIcons();
    return;
  }

  const categories = ['Account Access', 'Recovery Contacts', 'Backup Preparation', 'Security Settings'];
  const grouped = {};
  categories.forEach(c => { grouped[c] = []; });
  filtered.forEach(item => {
    const cat = grouped[item.category] ? item.category : 'Security Settings';
    grouped[cat].push(item);
  });

  let html = '';
  categories.forEach(cat => {
    if (grouped[cat] && grouped[cat].length > 0) {
      html += `
        <div class="checklist-category-group">
          <div class="checklist-cat-title">${escapeHtml(cat)}</div>
          ${grouped[cat].map(item => `
            <label class="checklist-item ${item.done ? 'checked' : ''}" data-id="${item.id}" data-custom="${item.isCustom}">
              <input type="checkbox" class="recovery-check-input" data-id="${item.id}" data-custom="${item.isCustom}" ${item.done ? 'checked' : ''} />
              <div class="check-custom"></div>
              <div class="check-content">
                <span class="check-title">${escapeHtml(item.title)}</span>
                <span class="check-desc">${escapeHtml(item.desc)}</span>
              </div>
              ${item.isCustom ? `<button type="button" class="custom-item-delete" onclick="deleteCustomChecklistItem('${item.id}', event)" title="Delete" aria-label="Delete custom item"><i data-lucide="trash-2"></i></button>` : ''}
            </label>
          `).join('')}
        </div>`;
    }
  });

  container.innerHTML = html;
  lucide.createIcons();
}

function handleRecoveryToggle(e) {
  const target = e.target;
  if (!target.classList.contains('recovery-check-input')) return;

  const id       = target.dataset.id;
  const isCustom = target.dataset.custom === 'true';
  const isChecked = target.checked;

  if (isCustom) {
    const item = (state.recovery.custom || []).find(c => c.id === id);
    if (item) item.done = isChecked;
  } else {
    state.recovery.checks[id] = isChecked;
  }

  persistAll();
  renderRecovery();
  renderDashboard();
  if (isChecked) {
    logActivity('check-circle', 'Recovery checklist item marked complete.');
    toast('Checklist item completed.', 'success');
  }
}

function addCustomChecklistItem(e) {
  e.preventDefault();
  const textEl = document.getElementById('customItemText');
  const catEl  = document.getElementById('customItemCat');

  if (!textEl || !textEl.value.trim()) {
    toast('Please enter a task description.', 'error');
    if (textEl) textEl.focus();
    return;
  }

  const newItem = { id: uid(), category: catEl.value || 'Security Settings', text: textEl.value.trim(), done: false };
  if (!state.recovery.custom) state.recovery.custom = [];
  state.recovery.custom.push(newItem);
  persistAll();
  textEl.value = '';
  renderRecovery();
  renderDashboard();
  logActivity('plus-circle', `Custom recovery task added: "${newItem.text}".`);
  toast('Custom task added.', 'success');
}

function deleteCustomChecklistItem(id, event) {
  if (event) { event.stopPropagation(); event.preventDefault(); }
  state.recovery.custom = (state.recovery.custom || []).filter(c => c.id !== id);
  persistAll();
  renderRecovery();
  renderDashboard();
  toast('Custom task removed.', 'info');
}

function resetChecklist() {
  confirmAction('Reset Checklist', 'This will uncheck all tasks and remove custom items. Proceed?', 'rotate-ccw', () => {
    state.recovery.checks = {};
    state.recovery.custom = [];
    persistAll();
    renderRecovery();
    renderDashboard();
    logActivity('rotate-ccw', 'Recovery checklist reset.');
    toast('Checklist reset.', 'info');
  });
}

// ─── SETTINGS ────────────────────────────────────────────────────────────────
function toggleReduceMotion(e) {
  const on = e.target.checked;
  on ? document.body.classList.add('reduce-motion') : document.body.classList.remove('reduce-motion');
  localStorage.setItem(LS.motion, String(on));
  toast(on ? 'Reduce motion enabled.' : 'Motion effects restored.', 'info');
}

function exportData() {
  const payload = {
    app: 'Digital Haven',
    exportedAt: new Date().toISOString(),
    version: '3.0',
    accounts:  state.accounts,
    subscriptions: state.subs,
    recovery:  state.recovery,
    profile:   state.profile,
    preferences: { reduceMotion: document.body.classList.contains('reduce-motion'), theme: state.theme },
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `digital-haven-backup-${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
  logActivity('download', 'Data exported as JSON backup.');
  toast('Data exported successfully.', 'success');
}

function importData(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (e) => {
    let parsed;
    try { parsed = JSON.parse(e.target.result); }
    catch { toast('Invalid JSON file — could not parse.', 'error'); return; }

    confirmAction('Import Data', 'Replace all current data with the imported backup? This cannot be undone.', 'upload', () => {
      if (Array.isArray(parsed.accounts))      state.accounts = parsed.accounts;
      if (Array.isArray(parsed.subscriptions)) state.subs     = parsed.subscriptions.map(s => ({ ...s, freq: s.freq || 'monthly' }));
      if (parsed.recovery && parsed.recovery.checks) {
        state.recovery = { checks: parsed.recovery.checks, custom: Array.isArray(parsed.recovery.custom) ? parsed.recovery.custom : [] };
      }
      if (parsed.profile) {
        state.profile.displayName   = parsed.profile.displayName   || '';
        state.profile.workspaceName = parsed.profile.workspaceName || 'Personal Space';
        lsSet(LS.profile, state.profile);
      }
      persistAll();
      localStorage.setItem(LS.init, '1');
      updateSidebarProfile();
      logActivity('upload', 'Data imported from JSON backup.');
      toast('Data imported successfully.', 'success');
      navigateTo('dashboard');
    });
  };
  reader.readAsText(file);
  // reset input so same file can be re-imported
  document.getElementById('importFileInput').value = '';
}

function resetData() {
  confirmAction('Reset to Sample Data', 'Restore original curated records? Custom entries will be replaced.', 'rotate-ccw', () => {
    state.accounts = JSON.parse(JSON.stringify(DEMO_ACCOUNTS));
    state.subs     = JSON.parse(JSON.stringify(DEMO_SUBSCRIPTIONS));
    state.recovery = {
      checks: { backup_codes: true, recovery_email: true, phone_number: false, trusted_contacts: false, data_backup: true, offline_storage: false, password_manager: true, device_lock: true },
      custom: []
    };
    state.accounts.forEach(a => { a.id = uid(); });
    state.subs.forEach(s => { s.id = uid(); });
    state.activity = [{ icon: 'rotate-ccw', text: 'Data reset to sample records.', ts: Date.now() }];
    persistAll();
    lsSet(LS.activity, state.activity);
    toast('Sample data restored.', 'success');
    navigateTo('dashboard');
  });
}

function clearAllData() {
  confirmAction('Clear All Data', 'Erase all accounts, subscriptions, and checklist data? The page will reload empty.', 'trash-2', () => {
    Object.values(LS).forEach(k => localStorage.removeItem(k));
    toast('All data cleared. Reloading…', 'info');
    setTimeout(() => window.location.reload(), 700);
  });
}

// ─── Helper ───────────────────────────────────────────────────────────────────
function id(selector) { return document.getElementById(selector); }

// ─── Event Listeners ──────────────────────────────────────────────────────────
function attachEvents() {
  // Navigation
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', e => { e.preventDefault(); const s = item.dataset.section; if (s) navigateTo(s); });
  });

  // Mobile sidebar
  const menuBtn = id('menuBtn');
  const sidebar  = id('sidebar');
  if (menuBtn && sidebar) menuBtn.addEventListener('click', () => sidebar.classList.toggle('open'));
  document.addEventListener('click', e => {
    if (window.innerWidth <= 860 && sidebar && sidebar.classList.contains('open')) {
      if (!sidebar.contains(e.target) && (!menuBtn || !menuBtn.contains(e.target))) sidebar.classList.remove('open');
    }
  });

  // Quick actions
  id('qaAddAccount')?.addEventListener('click', () => { navigateTo('accounts'); setTimeout(() => id('accName')?.focus(), 100); });
  id('qaAddSub')?.addEventListener('click',     () => { navigateTo('subscriptions'); setTimeout(() => id('subName')?.focus(), 100); });
  id('qaViewChecklist')?.addEventListener('click', () => navigateTo('recovery'));
  id('qaViewRisk')?.addEventListener('click',      () => navigateTo('risk'));

  // Account form & filters
  id('accountForm')?.addEventListener('submit', addAccount);
  id('accCancelEditBtn')?.addEventListener('click', cancelAccountEdit);
  id('accSearch')?.addEventListener('input', renderAccounts);
  id('accCatFilter')?.addEventListener('change', renderAccounts);
  id('accTfaFilter')?.addEventListener('change', renderAccounts);

  // Subscription form & filters
  id('subForm')?.addEventListener('submit', addSubscription);
  id('subSearch')?.addEventListener('input', renderSubscriptions);
  id('subCatFilter')?.addEventListener('change', renderSubscriptions);

  // Risk severity filter
  id('riskSeverityFilter')?.addEventListener('change', renderRisk);

  // Recovery tabs
  document.querySelectorAll('.recovery-tab').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.recovery-tab').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      state.recoveryFilter = pill.dataset.tab || 'all';
      renderRecovery();
    });
  });
  id('recoveryChecklist')?.addEventListener('change', handleRecoveryToggle);
  id('customItemForm')?.addEventListener('submit', addCustomChecklistItem);
  id('resetChecklistBtn')?.addEventListener('click', resetChecklist);

  // Settings — profile
  id('saveProfileBtn')?.addEventListener('click', saveProfile);
  id('saveWorkspaceBtn')?.addEventListener('click', saveWorkspace);

  // Settings — theme swatches
  document.querySelectorAll('.theme-swatch').forEach(swatch => {
    swatch.addEventListener('click', () => switchTheme(swatch.dataset.theme));
  });

  // Settings — reduce motion
  id('reduceMotionToggle')?.addEventListener('change', toggleReduceMotion);

  // Settings — data
  id('exportBtn')?.addEventListener('click', exportData);
  id('resetBtn')?.addEventListener('click', resetData);
  id('clearAllBtn')?.addEventListener('click', clearAllData);
  id('importFileInput')?.addEventListener('change', e => {
    const file = e.target.files && e.target.files[0];
    if (file) importData(file);
  });

  // Modal
  id('modalCancel')?.addEventListener('click', closeModal);
  id('modalOverlay')?.addEventListener('click', e => { if (e.target === id('modalOverlay')) closeModal(); });

  // Clear error classes on input
  document.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => el.classList.remove('error'));
  });

  // Allow saving profile with Enter key
  id('settingDisplayName')?.addEventListener('keydown', e => { if (e.key === 'Enter') saveProfile(); });
  id('settingWorkspaceName')?.addEventListener('keydown', e => { if (e.key === 'Enter') saveWorkspace(); });
}

// ─── Initialization ───────────────────────────────────────────────────────────
function init() {
  initState();
  attachEvents();
  lucide.createIcons();
  navigateTo('dashboard');
}

if (typeof lucide !== 'undefined') {
  init();
} else {
  const s = document.querySelector('script[src*="lucide"]');
  if (s) s.addEventListener('load', init);
  window.addEventListener('load', () => { if (typeof lucide !== 'undefined') init(); });
}

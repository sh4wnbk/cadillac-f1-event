/* ==============================================
   F1 LIVE TELEMETRY DASHBOARD
   OpenF1 REST API — real-time polling
   ============================================== */

const OPENF1_BASE = 'https://api.openf1.org/v1';
const STALE_MS = 30_000;
const POLL_INTERVAL_MS = 5_000;
const RACE_DURATION_MS = 2 * 60 * 60 * 1000;

/* --- Team color map --- */
const TEAM_COLORS = {
  'Red Bull Racing': '#3671C6',
  'Ferrari': '#E8002D',
  'Mercedes': '#27F4D2',
  'McLaren': '#FF8000',
  'Aston Martin': '#229971',
  'Alpine': '#FF87BC',
  'Williams': '#64C4FF',
  'RB': '#6692FF',
  'Kick Sauber': '#52E252',
  'Haas F1 Team': '#B6BABD',
  'Cadillac': '#DC2626',
};
const DEFAULT_COLOR = '#888';

/* --- State --- */
let sessionKey = null;
let drivers = [];            // [{driverNumber, abbreviation, teamName, teamColor}]
let selectedDrivers = new Set(); // selected driver numbers (multi-select)
let latestCarData = {};      // driverNumber → array of recent car_data entries
let gapData = {};            // driverNumber → latest interval entry
let pollTimer = null;
let lastDataTime = null;

/* ==============================================
   SAFE STORAGE
   ============================================== */
const safeStorage = {
  get: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
  set: (key, val) => { try { localStorage.setItem(key, val); } catch { /* silent */ } }
};

/* ==============================================
   DARK MODE / REDUCE MOTION (preserved from original)
   ============================================== */
const themeButton  = document.getElementById('theme-button');
const motionButton = document.getElementById('motion-button');

const toggleDarkMode = () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  if (themeButton) themeButton.textContent = isDark ? 'Toggle Light Mode' : 'Toggle Dark Mode';
};
if (themeButton) themeButton.addEventListener('click', toggleDarkMode);

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const savedMotion = safeStorage.get('reduce-motion');
let motionReduced = savedMotion !== null ? savedMotion === 'true' : prefersReducedMotion;

if (motionReduced) {
  document.body.classList.add('reduce-motion');
  if (motionButton) motionButton.textContent = 'Enable Motion';
}

const toggleReduceMotion = () => {
  document.body.classList.toggle('reduce-motion');
  motionReduced = document.body.classList.contains('reduce-motion');
  safeStorage.set('reduce-motion', motionReduced);
  if (motionButton) motionButton.textContent = motionReduced ? 'Enable Motion' : 'Reduce Motion';
};
if (motionButton) motionButton.addEventListener('click', toggleReduceMotion);

/* --- Back to top --- */
const backToTopButton = document.getElementById('back-to-top');
let scrollTicking = false;

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      if (backToTopButton) {
        backToTopButton.classList.toggle('show',
          document.body.scrollTop > 400 || document.documentElement.scrollTop > 400);
      }
      scrollTicking = false;
    });
    scrollTicking = true;
  }
});

if (backToTopButton) backToTopButton.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ==============================================
   DARK PLOTLY LAYOUT DEFAULTS
   ============================================== */
const darkLayout = {
  paper_bgcolor: '#1a1a1a',
  plot_bgcolor: '#111',
  font: { color: '#ccc', family: 'Oswald, sans-serif', size: 11 },
  margin: { t: 10, r: 10, b: 40, l: 50 },
  xaxis: { gridcolor: '#333', zerolinecolor: '#333' },
  yaxis: { gridcolor: '#333', zerolinecolor: '#333' },
  legend: { bgcolor: 'transparent', font: { color: '#ccc', size: 10 } },
  showlegend: true,
};

const plotConfig = { responsive: true, displayModeBar: false };

/* ==============================================
   INIT DASHBOARD
   ============================================== */
async function initDashboard() {
  document.body.classList.add('dashboard-mode');

  setupSourceSelector();
  setupFullscreen();

  // Render empty placeholder charts immediately so the grid looks populated
  renderEmptyCharts();

  try {
    const res = await fetch(`${OPENF1_BASE}/sessions?session_key=latest`);
    if (!res.ok) throw new Error(`Sessions fetch failed: ${res.status}`);
    const sessions = await res.json();

    if (!sessions || sessions.length === 0) {
      console.warn('No sessions returned from OpenF1');
      updateSessionBarStatic('No active session', '—');
      return;
    }

    // Use the last item in the array as the latest session
    const session = sessions[sessions.length - 1];
    sessionKey = session.session_key;

    const raceName = session.meeting_name || session.circuit_short_name || 'Unknown Race';
    const sessionType = session.session_name || session.session_type || '—';

    updateSessionBarStatic(raceName, sessionType);

    await loadDrivers();
    startPolling();

  } catch (err) {
    console.error('initDashboard error:', err);
    showStaleBar();
    updateSessionBarStatic('Connection error', '—');
  }
}

/* ==============================================
   SESSION BAR HELPERS
   ============================================== */
function updateSessionBarStatic(raceName, sessionType) {
  const raceEl = document.getElementById('session-race');
  const typeEl = document.getElementById('session-type');
  if (raceEl) raceEl.textContent = raceName;
  if (typeEl) typeEl.textContent = sessionType;
}

async function updateSessionBar() {
  if (!sessionKey) return;
  try {
    const res = await fetch(`${OPENF1_BASE}/laps?session_key=${sessionKey}&driver_number=1`);
    if (!res.ok) return;
    const laps = await res.json();
    if (laps && laps.length > 0) {
      const latestLap = laps[laps.length - 1];
      const lapEl = document.getElementById('session-lap');
      if (lapEl) lapEl.textContent = latestLap.lap_number ?? '—';
    }
  } catch (err) {
    console.error('updateSessionBar error:', err);
  }
}

/* ==============================================
   LOAD DRIVERS
   ============================================== */
async function loadDrivers() {
  if (!sessionKey) return;

  try {
    const res = await fetch(`${OPENF1_BASE}/drivers?session_key=${sessionKey}`);
    if (!res.ok) throw new Error(`Drivers fetch failed: ${res.status}`);
    const data = await res.json();

    drivers = data.map(d => ({
      driverNumber: String(d.driver_number),
      abbreviation: d.name_acronym || String(d.driver_number),
      teamName: d.team_name || '',
      teamColor: TEAM_COLORS[d.team_name] || (d.team_colour ? `#${d.team_colour}` : DEFAULT_COLOR),
    }));

    // Sort by driver number
    drivers.sort((a, b) => Number(a.driverNumber) - Number(b.driverNumber));

    // Pre-select all drivers
    selectedDrivers = new Set(drivers.map(d => d.driverNumber));

    buildDriverPills();

  } catch (err) {
    console.error('loadDrivers error:', err);
    showStaleBar();
  }
}

/* ==============================================
   BUILD DRIVER PILL BUTTONS
   ============================================== */
function buildDriverPills() {
  const strip = document.getElementById('driver-selector');
  if (!strip) return;
  strip.innerHTML = '';

  drivers.forEach(driver => {
    const btn = document.createElement('button');
    btn.className = 'driver-pill active';
    btn.setAttribute('data-driver-number', driver.driverNumber);

    const dot = document.createElement('span');
    dot.className = 'color-dot';
    dot.style.background = driver.teamColor;

    btn.textContent = driver.abbreviation;
    btn.appendChild(dot);

    strip.appendChild(btn);
  });

  setupDriverPills();
}

/* ==============================================
   DRIVER PILL CLICK HANDLER
   ============================================== */
function setupDriverPills() {
  const strip = document.getElementById('driver-selector');
  if (!strip) return;

  strip.addEventListener('click', (e) => {
    const pill = e.target.closest('.driver-pill');
    if (!pill) return;

    const driverNum = pill.getAttribute('data-driver-number');
    if (selectedDrivers.has(driverNum)) {
      selectedDrivers.delete(driverNum);
      pill.classList.remove('active');
    } else {
      selectedDrivers.add(driverNum);
      pill.classList.add('active');
    }
    renderCharts();
  });
}

/* ==============================================
   POLLING
   ============================================== */
function startPolling() {
  if (pollTimer) clearInterval(pollTimer);

  // Fetch immediately on start
  fetchAndRender();

  pollTimer = setInterval(fetchAndRender, POLL_INTERVAL_MS);
}

async function fetchAndRender() {
  await Promise.all([
    fetchCarData(),
    fetchIntervals(),
  ]);
  renderCharts();
  updateSessionBar();
  handleStale();
}

/* ==============================================
   FETCH CAR DATA
   ============================================== */
async function fetchCarData() {
  if (!sessionKey) return;

  try {
    // Request data from last 30 seconds
    const isoMinus30s = new Date(Date.now() - 30_000).toISOString();
    const url = `${OPENF1_BASE}/car_data?session_key=${sessionKey}&date>=${encodeURIComponent(isoMinus30s)}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`car_data fetch failed: ${res.status}`);
    const entries = await res.json();

    entries.forEach(entry => {
      const num = String(entry.driver_number);
      if (!latestCarData[num]) {
        latestCarData[num] = [];
      }
      latestCarData[num].push(entry);
      // Keep only the last 200 entries per driver to avoid memory bloat
      if (latestCarData[num].length > 200) {
        latestCarData[num] = latestCarData[num].slice(-200);
      }
    });

    lastDataTime = Date.now();

  } catch (err) {
    console.error('fetchCarData error:', err);
    showStaleBar();
  }
}

/* ==============================================
   FETCH INTERVALS (gap to leader)
   ============================================== */
async function fetchIntervals() {
  if (!sessionKey) return;

  try {
    const url = `${OPENF1_BASE}/intervals?session_key=${sessionKey}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`intervals fetch failed: ${res.status}`);
    const entries = await res.json();

    // Keep only most recent entry per driver
    entries.forEach(entry => {
      const num = String(entry.driver_number);
      const existing = gapData[num];
      if (!existing || entry.date > existing.date) {
        gapData[num] = entry;
      }
    });

  } catch (err) {
    console.error('fetchIntervals error:', err);
  }
}

/* ==============================================
   RENDER ALL CHARTS
   ============================================== */
function renderCharts() {
  renderSpeedChart();
  renderGapChart();
  renderThrottleChart();
  renderDrsChart();
}

/* ==============================================
   EMPTY PLACEHOLDER CHARTS
   ============================================== */
function renderEmptyCharts() {
  const emptyTrace = [];
  const baseLayout = { ...darkLayout };

  Plotly.react('chart-speed',   emptyTrace, { ...baseLayout, yaxis: { ...darkLayout.yaxis, title: 'km/h', range: [0, 380] } }, plotConfig);
  Plotly.react('chart-gap',     emptyTrace, { ...baseLayout, yaxis: { ...darkLayout.yaxis, title: 'Seconds' } }, plotConfig);
  Plotly.react('chart-throttle',emptyTrace, { ...baseLayout, yaxis: { ...darkLayout.yaxis, title: '%', range: [0, 105] } }, plotConfig);
  Plotly.react('chart-drs',     emptyTrace, { ...baseLayout }, plotConfig);
}

/* ==============================================
   CHART 1 — SPEED TRACE
   ============================================== */
function renderSpeedChart() {
  const traces = [];

  selectedDrivers.forEach(driverNum => {
    const driverInfo = drivers.find(d => d.driverNumber === driverNum);
    const entries = latestCarData[driverNum];
    if (!entries || entries.length === 0) return;

    const x = entries.map(e => e.date);
    const y = entries.map(e => e.speed);

    traces.push({
      type: 'scatter',
      mode: 'lines',
      name: driverInfo ? driverInfo.abbreviation : driverNum,
      x,
      y,
      line: {
        color: driverInfo ? driverInfo.teamColor : DEFAULT_COLOR,
        width: 1.5,
      },
    });
  });

  const layout = {
    ...darkLayout,
    yaxis: { ...darkLayout.yaxis, title: 'km/h', range: [0, 380] },
  };

  Plotly.react('chart-speed', traces, layout, plotConfig);
}

/* ==============================================
   CHART 2 — GAP TO LEADER
   ============================================== */
function renderGapChart() {
  const traces = [];

  selectedDrivers.forEach(driverNum => {
    const driverInfo = drivers.find(d => d.driverNumber === driverNum);
    const entry = gapData[driverNum];
    if (!entry) return;

    const gapVal = entry.gap_to_leader;
    if (gapVal === null || gapVal === undefined) return;

    traces.push({
      type: 'scatter',
      mode: 'markers+lines',
      name: driverInfo ? driverInfo.abbreviation : driverNum,
      x: [entry.date],
      y: [typeof gapVal === 'string' ? parseFloat(gapVal) || 0 : gapVal],
      marker: {
        color: driverInfo ? driverInfo.teamColor : DEFAULT_COLOR,
        size: 6,
      },
      line: {
        color: driverInfo ? driverInfo.teamColor : DEFAULT_COLOR,
        width: 1.5,
      },
    });
  });

  const layout = {
    ...darkLayout,
    yaxis: { ...darkLayout.yaxis, title: 'Seconds', autorange: 'reversed' },
  };

  Plotly.react('chart-gap', traces, layout, plotConfig);
}

/* ==============================================
   CHART 3 — THROTTLE / BRAKE
   Uses first selected driver only
   ============================================== */
function renderThrottleChart() {
  const traces = [];

  const firstDriverNum = [...selectedDrivers][0];
  if (firstDriverNum) {
    const driverInfo = drivers.find(d => d.driverNumber === firstDriverNum);
    const entries = latestCarData[firstDriverNum];

    if (entries && entries.length > 0) {
      const x = entries.map(e => e.date);
      const throttle = entries.map(e => e.throttle);
      const brake = entries.map(e => (e.brake ? 100 : 0));

      traces.push({
        type: 'scatter',
        mode: 'lines',
        name: `${driverInfo ? driverInfo.abbreviation : firstDriverNum} Throttle`,
        x,
        y: throttle,
        fill: 'tozeroy',
        fillcolor: 'rgba(34,197,94,0.25)',
        line: { color: '#22c55e', width: 1.5 },
      });

      traces.push({
        type: 'scatter',
        mode: 'lines',
        name: `${driverInfo ? driverInfo.abbreviation : firstDriverNum} Brake`,
        x,
        y: brake,
        fill: 'tozeroy',
        fillcolor: 'rgba(220,38,38,0.25)',
        line: { color: '#dc2626', width: 1.5 },
      });
    }
  }

  const layout = {
    ...darkLayout,
    yaxis: { ...darkLayout.yaxis, title: '%', range: [0, 105] },
  };

  Plotly.react('chart-throttle', traces, layout, plotConfig);
}

/* ==============================================
   CHART 4 — DRS ACTIVATION
   DRS values 12 or 14 = active
   ============================================== */
function renderDrsChart() {
  const traces = [];
  const selectedArr = [...selectedDrivers];

  selectedArr.forEach(driverNum => {
    const driverInfo = drivers.find(d => d.driverNumber === driverNum);
    const entries = latestCarData[driverNum];
    if (!entries || entries.length === 0) return;

    const abbr = driverInfo ? driverInfo.abbreviation : driverNum;
    const x = entries.map(e => e.date);
    const drsActive = entries.map(e => e.drs === 12 || e.drs === 14);
    const colors = drsActive.map(active => active ? '#22c55e' : '#555');

    traces.push({
      type: 'scatter',
      mode: 'markers',
      name: abbr,
      x,
      y: entries.map(() => abbr),
      marker: {
        color: colors,
        size: 6,
        symbol: 'square',
      },
      showlegend: true,
    });
  });

  const layout = {
    ...darkLayout,
    yaxis: { ...darkLayout.yaxis, title: '' },
    xaxis: { ...darkLayout.xaxis },
  };

  Plotly.react('chart-drs', traces, layout, plotConfig);
}

/* ==============================================
   STALE DATA INDICATOR
   ============================================== */
function handleStale() {
  const bar = document.getElementById('stale-bar');
  if (!bar) return;

  if (lastDataTime && (Date.now() - lastDataTime) > STALE_MS) {
    showStaleBar();
  } else if (lastDataTime) {
    hideStaleBar();
  }
}

function showStaleBar() {
  const bar = document.getElementById('stale-bar');
  if (bar) bar.classList.add('visible');
}

function hideStaleBar() {
  const bar = document.getElementById('stale-bar');
  if (bar) bar.classList.remove('visible');
}

/* ==============================================
   SOURCE SELECTOR
   ============================================== */
function setupSourceSelector() {
  const sourceBtns = document.querySelectorAll('.source-btn');
  const fastf1Msg = document.getElementById('fastf1-message');

  sourceBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      sourceBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const source = btn.getAttribute('data-source');

      if (fastf1Msg) {
        if (source === 'FastF1') {
          fastf1Msg.classList.add('visible');
        } else {
          fastf1Msg.classList.remove('visible');
        }
      }

      // For OpenF1, restart polling if we have a session
      if (source === 'OpenF1') {
        if (sessionKey && !pollTimer) {
          startPolling();
        }
      } else {
        // Stop polling when not on OpenF1
        if (pollTimer) {
          clearInterval(pollTimer);
          pollTimer = null;
        }
      }
    });
  });
}

/* ==============================================
   FULLSCREEN
   ============================================== */
function setupFullscreen() {
  const btn = document.getElementById('btn-fullscreen');
  if (!btn) return;

  btn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn('Fullscreen request failed:', err);
      });
    } else {
      document.exitFullscreen().catch(err => {
        console.warn('Exit fullscreen failed:', err);
      });
    }
  });

  document.addEventListener('fullscreenchange', () => {
    if (document.fullscreenElement) {
      btn.textContent = '✕ Exit Fullscreen';
    } else {
      btn.textContent = '⛶ Fullscreen';
    }
  });
}

/* ==============================================
   STALE DATA WATCHDOG (runs every 5s independently)
   ============================================== */
setInterval(handleStale, 5_000);

/* ==============================================
   INIT ON DOM READY
   ============================================== */
document.addEventListener('DOMContentLoaded', initDashboard);

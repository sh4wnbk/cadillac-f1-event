/* ==============================================
   F1 TIMING TOWER + TRACK MAP
   OpenF1 REST API — real-time polling
   Phase 1: Live timing tower + GPS track map
   ============================================== */

const OPENF1_BASE = 'https://api.openf1.org/v1';
const POLL_MS     = 3_000;
const STALE_MS    = 20_000;
const CANVAS_PAD  = 40;

/* --- Team color map --- */
const TEAM_COLORS = {
  'Red Bull Racing': '#3671C6',
  'Ferrari': '#E8002D',
  'Mercedes': '#27F4D2',
  'McLaren': '#FF8000',
  'Aston Martin': '#229971',
  'Alpine': '#FF87BC',
  'Williams': '#64C4FF',
  'Racing Bulls': '#6692FF',
  'Audi': '#999999',
  'Haas F1 Team': '#B6BABD',
  'Cadillac': '#DC2626',
};
const DEFAULT_COLOR = '#888';

/* --- State --- */
let sessionKey      = null;
let sessionType     = '';
let drivers         = {};   // driverNumber → {abbreviation, teamName, teamColor, fullName}
let timingRows      = {};   // driverNumber → {pos, gapToLeader, interval, lastLap, s1, s2, s3, tireCompound, tireAge, pits, personalBestS1, personalBestS2, personalBestS3}
let overallBest     = { s1: Infinity, s2: Infinity, s3: Infinity, lap: Infinity };
let locationHistory = {};   // driverNumber → [{x,y}]  (last N points for trail)
let latestLocation  = {};   // driverNumber → {x, y}
let canvasBounds    = null; // { minX, maxX, minY, maxY } — auto-calibrated
let lastDataTime    = null;
let pollTimer       = null;

/* Canvas context */
let canvas = null;
let ctx    = null;

/* ==============================================
   SAFE STORAGE
   ============================================== */
const safeStorage = {
  get: (key)      => { try { return localStorage.getItem(key); }      catch { return null; } },
  set: (key, val) => { try { localStorage.setItem(key, val); }         catch { /* silent */ } },
};

/* ==============================================
   INIT
   ============================================== */
async function initTiming() {
  document.body.classList.add('timing-mode');

  /* Dark mode */
  const themeButton = document.getElementById('theme-button');
  if (themeButton) {
    const savedTheme = safeStorage.get('dark-mode');
    if (savedTheme === 'true') {
      document.body.classList.add('dark-mode');
      themeButton.textContent = 'Toggle Light Mode';
    }
    themeButton.addEventListener('click', () => {
      document.body.classList.toggle('dark-mode');
      const isDark = document.body.classList.contains('dark-mode');
      safeStorage.set('dark-mode', isDark);
      themeButton.textContent = isDark ? 'Toggle Light Mode' : 'Toggle Dark Mode';
    });
  }

  /* Reduce motion */
  const motionButton = document.getElementById('motion-button');
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const savedMotion = safeStorage.get('reduce-motion');
  let motionReduced = savedMotion !== null ? savedMotion === 'true' : prefersReducedMotion;
  if (motionReduced) {
    document.body.classList.add('reduce-motion');
    if (motionButton) motionButton.textContent = 'Enable Motion';
  }
  if (motionButton) {
    motionButton.addEventListener('click', () => {
      document.body.classList.toggle('reduce-motion');
      motionReduced = document.body.classList.contains('reduce-motion');
      safeStorage.set('reduce-motion', motionReduced);
      motionButton.textContent = motionReduced ? 'Enable Motion' : 'Reduce Motion';
    });
  }

  /* Back to top */
  const backToTopButton = document.getElementById('back-to-top');
  if (backToTopButton) {
    let scrollTicking = false;
    window.addEventListener('scroll', () => {
      if (!scrollTicking) {
        requestAnimationFrame(() => {
          backToTopButton.classList.toggle('show',
            document.body.scrollTop > 400 || document.documentElement.scrollTop > 400);
          scrollTicking = false;
        });
        scrollTicking = true;
      }
    });
    backToTopButton.addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  setupFullscreen();
  initCanvas();

  /* Stale watchdog — runs independently of poll cycle */
  setInterval(handleStale, 5_000);

  try {
    await fetchSession();
    await fetchDrivers();
    startPolling();
  } catch (err) {
    console.error('initTiming error:', err);
    const pill = document.getElementById('session-pill');
    if (pill) pill.textContent = 'ERROR';
  }
}

/* ==============================================
   FETCH SESSION
   ============================================== */
async function fetchSession() {
  const res = await fetch(`${OPENF1_BASE}/sessions?session_key=latest`);
  if (!res.ok) throw new Error(`Sessions fetch failed: ${res.status}`);
  const sessions = await res.json();

  if (!sessions || sessions.length === 0) {
    const pill = document.getElementById('session-pill');
    if (pill) pill.textContent = 'NO SESSION';
    return;
  }

  const session = sessions[sessions.length - 1];
  sessionKey  = session.session_key;
  sessionType = session.session_name || session.session_type || '';

  const pill = document.getElementById('session-pill');
  if (pill) pill.textContent = sessionType.toUpperCase() || 'SESSION';

  const raceName = document.getElementById('session-race-name');
  if (raceName) {
    raceName.textContent = session.meeting_name || session.circuit_short_name || '—';
  }

  /* Show live dot if session date is within the last 4 hours */
  const dot = document.getElementById('session-dot');
  if (dot && session.date_start) {
    const sessionStart = new Date(session.date_start).getTime();
    const fourHoursMs  = 4 * 60 * 60 * 1000;
    if (Date.now() - sessionStart < fourHoursMs) {
      dot.style.display = 'inline-block';
    }
  }
}

/* ==============================================
   FETCH DRIVERS
   ============================================== */
async function fetchDrivers() {
  if (!sessionKey) return;
  const res = await fetch(`${OPENF1_BASE}/drivers?session_key=${sessionKey}`);
  if (!res.ok) throw new Error(`Drivers fetch failed: ${res.status}`);
  const data = await res.json();

  data.forEach(d => {
    const num = String(d.driver_number);
    drivers[num] = {
      abbreviation: d.name_acronym || num,
      teamName:     d.team_name || '',
      teamColor:    TEAM_COLORS[d.team_name] || (d.team_colour ? `#${d.team_colour}` : DEFAULT_COLOR),
      fullName:     d.full_name || d.name_acronym || num,
    };
    /* Seed timing row */
    if (!timingRows[num]) {
      timingRows[num] = {
        pos: 99, gapToLeader: null, interval: null,
        lastLap: null, s1: null, s2: null, s3: null,
        tireCompound: null, tireAge: null, pits: 0,
        personalBestS1: Infinity, personalBestS2: Infinity, personalBestS3: Infinity,
      };
    }
  });
}

/* ==============================================
   POLLING
   ============================================== */
function startPolling() {
  if (pollTimer) clearInterval(pollTimer);
  pollAll();
  pollTimer = setInterval(pollAll, POLL_MS);
}

async function pollAll() {
  await Promise.all([
    fetchTimingData(),
    fetchLocationData(),
  ]);
  renderTower();
  drawCanvas();
}

/* ==============================================
   FETCH TIMING DATA
   ============================================== */
async function fetchTimingData() {
  if (!sessionKey) return;

  try {
    await Promise.all([
      fetchIntervals(),
      fetchLaps(),
      fetchStints(),
      fetchPits(),
      fetchPositions(),
    ]);
    lastDataTime = Date.now();
  } catch (err) {
    console.error('fetchTimingData error:', err);
  }
}

async function fetchIntervals() {
  const res = await fetch(`${OPENF1_BASE}/intervals?session_key=${sessionKey}`);
  if (!res.ok) return;
  const entries = await res.json();

  /* Keep most recent entry per driver */
  const latest = {};
  entries.forEach(e => {
    const num = String(e.driver_number);
    if (!latest[num] || e.date > latest[num].date) latest[num] = e;
  });

  Object.entries(latest).forEach(([num, e]) => {
    if (!timingRows[num]) timingRows[num] = buildEmptyRow();
    timingRows[num].gapToLeader = e.gap_to_leader;
    timingRows[num].interval    = e.interval;
  });
}

async function fetchLaps() {
  const res = await fetch(`${OPENF1_BASE}/laps?session_key=${sessionKey}`);
  if (!res.ok) return;
  const entries = await res.json();

  /* Keep most recent lap per driver */
  const latest = {};
  entries.forEach(e => {
    const num = String(e.driver_number);
    if (!latest[num] || (e.lap_number > (latest[num].lap_number || 0))) latest[num] = e;
  });

  Object.entries(latest).forEach(([num, lap]) => {
    if (!timingRows[num]) timingRows[num] = buildEmptyRow();
    const row = timingRows[num];

    const lapMs = lap.lap_duration != null ? lap.lap_duration * 1000 : null;
    const s1ms  = lap.duration_sector_1 != null ? lap.duration_sector_1 * 1000 : null;
    const s2ms  = lap.duration_sector_2 != null ? lap.duration_sector_2 * 1000 : null;
    const s3ms  = lap.duration_sector_3 != null ? lap.duration_sector_3 * 1000 : null;

    if (lapMs !== null) {
      row.lastLap = lapMs;
      if (lapMs < overallBest.lap) overallBest.lap = lapMs;
    }
    if (s1ms !== null) {
      row.s1 = s1ms;
      if (s1ms < row.personalBestS1) row.personalBestS1 = s1ms;
      if (s1ms < overallBest.s1)     overallBest.s1     = s1ms;
    }
    if (s2ms !== null) {
      row.s2 = s2ms;
      if (s2ms < row.personalBestS2) row.personalBestS2 = s2ms;
      if (s2ms < overallBest.s2)     overallBest.s2     = s2ms;
    }
    if (s3ms !== null) {
      row.s3 = s3ms;
      if (s3ms < row.personalBestS3) row.personalBestS3 = s3ms;
      if (s3ms < overallBest.s3)     overallBest.s3     = s3ms;
    }
  });
}

async function fetchStints() {
  const res = await fetch(`${OPENF1_BASE}/stints?session_key=${sessionKey}`);
  if (!res.ok) return;
  const entries = await res.json();

  /* Keep most recent stint per driver (highest stint_number) */
  const latest = {};
  entries.forEach(e => {
    const num = String(e.driver_number);
    if (!latest[num] || (e.stint_number > (latest[num].stint_number || 0))) latest[num] = e;
  });

  Object.entries(latest).forEach(([num, stint]) => {
    if (!timingRows[num]) timingRows[num] = buildEmptyRow();
    timingRows[num].tireCompound = stint.compound || null;
    timingRows[num].tireAge      = stint.tyre_age_at_start != null
      ? stint.tyre_age_at_start + (stint.lap_end != null && stint.lap_start != null
          ? stint.lap_end - stint.lap_start : 0)
      : null;
  });
}

async function fetchPits() {
  const res = await fetch(`${OPENF1_BASE}/pit?session_key=${sessionKey}`);
  if (!res.ok) return;
  const entries = await res.json();

  /* Count pit stops per driver */
  const counts = {};
  entries.forEach(e => {
    const num = String(e.driver_number);
    counts[num] = (counts[num] || 0) + 1;
  });

  Object.entries(counts).forEach(([num, count]) => {
    if (!timingRows[num]) timingRows[num] = buildEmptyRow();
    timingRows[num].pits = count;
  });
}

async function fetchPositions() {
  const res = await fetch(`${OPENF1_BASE}/position?session_key=${sessionKey}`);
  if (!res.ok) return;
  const entries = await res.json();

  /* Keep most recent position entry per driver */
  const latest = {};
  entries.forEach(e => {
    const num = String(e.driver_number);
    if (!latest[num] || e.date > latest[num].date) latest[num] = e;
  });

  Object.entries(latest).forEach(([num, e]) => {
    if (!timingRows[num]) timingRows[num] = buildEmptyRow();
    timingRows[num].pos = e.position;
  });

  /* Update session lap info from latest data */
  const lapInfoEl = document.getElementById('session-lap-info');
  if (lapInfoEl) {
    const maxLapRow = Object.values(timingRows).reduce((acc, r) => {
      const lp = r.lastLap !== null ? 1 : 0;
      return lp > acc ? lp : acc;
    }, 0);
    if (maxLapRow) lapInfoEl.textContent = '';
  }
}

/* ==============================================
   FETCH LOCATION DATA
   ============================================== */
async function fetchLocationData() {
  if (!sessionKey) return;
  try {
    const iso5sAgo = new Date(Date.now() - 5_000).toISOString();
    const res = await fetch(
      `${OPENF1_BASE}/location?session_key=${sessionKey}&date>=${encodeURIComponent(iso5sAgo)}`
    );
    if (!res.ok) return;
    const entries = await res.json();

    entries.forEach(e => {
      const num = String(e.driver_number);
      const x   = e.x;
      const y   = e.y;
      if (x == null || y == null) return;

      if (!locationHistory[num]) locationHistory[num] = [];
      locationHistory[num].push({ x, y });
      if (locationHistory[num].length > 50) {
        locationHistory[num] = locationHistory[num].slice(-50);
      }

      latestLocation[num] = { x, y };

      /* Auto-calibrate bounds */
      if (!canvasBounds) {
        canvasBounds = { minX: x, maxX: x, minY: y, maxY: y };
      } else {
        if (x < canvasBounds.minX) canvasBounds.minX = x;
        if (x > canvasBounds.maxX) canvasBounds.maxX = x;
        if (y < canvasBounds.minY) canvasBounds.minY = y;
        if (y > canvasBounds.maxY) canvasBounds.maxY = y;
      }
    });
  } catch (err) {
    console.error('fetchLocationData error:', err);
  }
}

/* ==============================================
   RENDER TOWER
   ============================================== */
function renderTower() {
  const tbody = document.getElementById('tower-body');
  if (!tbody) return;

  const sorted = Object.entries(timingRows).sort((a, b) => a[1].pos - b[1].pos);
  if (sorted.length === 0) return;

  const rows = sorted.map(([num, row]) => {
    const driver     = drivers[num] || { abbreviation: num, teamColor: DEFAULT_COLOR, fullName: num };
    const teamColor  = driver.teamColor;
    const abbr       = driver.abbreviation;

    /* Position class */
    const posClass = row.pos === 1 ? 'p1' : row.pos === 2 ? 'p2' : row.pos === 3 ? 'p3' : '';

    /* Gap to leader */
    let gapHtml = '';
    if (row.pos === 1) {
      gapHtml = `<span class="gap-leader">LEADER</span>`;
    } else {
      const g = row.gapToLeader;
      if (g == null) {
        gapHtml = `<span class="gap-leader" style="color:#444">—</span>`;
      } else if (typeof g === 'string' && g.startsWith('+')) {
        gapHtml = `<span class="gap-leader">+${parseFloat(g).toFixed(3)}</span>`;
      } else {
        const gNum = parseFloat(g);
        gapHtml = `<span class="gap-leader">${isNaN(gNum) ? g : '+' + gNum.toFixed(3)}</span>`;
      }
    }

    /* Interval */
    let intHtml = '';
    const iv = row.interval;
    if (iv == null) {
      intHtml = `<span class="gap-ahead" style="color:#333">—</span>`;
    } else {
      const ivNum = parseFloat(iv);
      intHtml = `<span class="gap-ahead interval-delta">${isNaN(ivNum) ? iv : '+' + ivNum.toFixed(3)}</span>`;
    }

    /* Last lap */
    const lastLapHtml = row.lastLap != null
      ? `<span style="font-family:'Inter',monospace;font-size:0.78rem">${formatLapTime(row.lastLap)}</span>`
      : `<span style="color:#333">—</span>`;

    /* Sector chips */
    const s1Html = buildSectorChip(row.s1, row.personalBestS1, overallBest.s1);
    const s2Html = buildSectorChip(row.s2, row.personalBestS2, overallBest.s2);
    const s3Html = buildSectorChip(row.s3, row.personalBestS3, overallBest.s3);

    /* Tire badge */
    let tireHtml = '<span style="color:#333">—</span>';
    if (row.tireCompound) {
      const compound = row.tireCompound.charAt(0).toUpperCase();
      const cls = `tire-${compound}`;
      tireHtml = `<span class="tire-badge ${cls}" title="${row.tireCompound}">${compound}</span>`;
    }

    /* Pit count */
    const pitsHtml = `<span style="font-family:'Inter',monospace;font-size:0.75rem;color:#888">${row.pits || 0}</span>`;

    return `<tr>
      <td><span class="pos-num ${posClass}">${row.pos < 99 ? row.pos : '—'}</span></td>
      <td><span class="driver-name-pill" style="--team-color:${teamColor}">${abbr}</span></td>
      <td>${gapHtml}</td>
      <td>${intHtml}</td>
      <td>${lastLapHtml}</td>
      <td>${s1Html}</td>
      <td>${s2Html}</td>
      <td>${s3Html}</td>
      <td>${tireHtml}</td>
      <td>${pitsHtml}</td>
    </tr>`;
  });

  tbody.innerHTML = rows.join('');
}

function buildSectorChip(val, personalBest, overallBestVal) {
  if (val == null) return `<span class="sector-time" style="color:#333">—</span>`;
  let cls = 'sector-time';
  if (val <= overallBestVal && overallBestVal !== Infinity) {
    cls += ' overall-best';
  } else if (val <= personalBest && personalBest !== Infinity) {
    cls += ' personal-best';
  }
  return `<span class="${cls}">${formatSector(val)}</span>`;
}

/* ==============================================
   CANVAS INIT
   ============================================== */
function initCanvas() {
  canvas = document.getElementById('track-canvas');
  if (!canvas) return;
  ctx = canvas.getContext('2d');

  /* Keep canvas pixel dimensions in sync with its CSS size */
  const ro = new ResizeObserver(() => {
    canvas.width  = canvas.clientWidth;
    canvas.height = canvas.clientHeight;
    drawCanvas();
  });
  ro.observe(canvas);

  /* Initial size */
  canvas.width  = canvas.clientWidth  || canvas.offsetWidth;
  canvas.height = canvas.clientHeight || canvas.offsetHeight;
}

/* ==============================================
   DRAW CANVAS — TRACK MAP
   ============================================== */
function drawCanvas() {
  if (!canvas || !ctx) return;
  if (!canvasBounds) return;

  const allDrivers = Object.keys(latestLocation);
  if (allDrivers.length === 0) return;

  /* Hide the "Awaiting position data" message */
  const mapStatus = document.getElementById('map-status');
  if (mapStatus) mapStatus.style.display = 'none';

  const W = canvas.width;
  const H = canvas.height;
  ctx.clearRect(0, 0, W, H);

  /* Compute uniform scale */
  const rangeX = canvasBounds.maxX - canvasBounds.minX || 1;
  const rangeY = canvasBounds.maxY - canvasBounds.minY || 1;
  const scaleX = (W - 2 * CANVAS_PAD) / rangeX;
  const scaleY = (H - 2 * CANVAS_PAD) / rangeY;
  const scale  = Math.min(scaleX, scaleY);

  /* Center the circuit */
  const offsetX = (W - scale * rangeX) / 2;
  const offsetY = (H - scale * rangeY) / 2;

  function toCanvas(x, y) {
    return {
      cx: offsetX + (x - canvasBounds.minX) * scale,
      cy: offsetY + (canvasBounds.maxY - y) * scale,
    };
  }

  /* Draw circuit ghost trail — collect all history points across all drivers */
  const allPoints = [];
  Object.values(locationHistory).forEach(history => {
    history.forEach(pt => allPoints.push(pt));
  });

  if (allPoints.length > 1) {
    ctx.save();
    ctx.strokeStyle = '#2a2a2a';
    ctx.lineWidth   = 8;
    ctx.lineCap     = 'round';
    ctx.lineJoin    = 'round';
    ctx.beginPath();
    const first = toCanvas(allPoints[0].x, allPoints[0].y);
    ctx.moveTo(first.cx, first.cy);
    for (let i = 1; i < allPoints.length; i++) {
      const pt = toCanvas(allPoints[i].x, allPoints[i].y);
      ctx.lineTo(pt.cx, pt.cy);
    }
    ctx.stroke();
    ctx.restore();
  }

  /* Sort drivers by position — P1 drawn last (on top) */
  const sortedDriverNums = allDrivers.slice().sort((a, b) => {
    const posA = timingRows[a] ? timingRows[a].pos : 99;
    const posB = timingRows[b] ? timingRows[b].pos : 99;
    return posB - posA; // higher pos drawn first, P1 last
  });

  sortedDriverNums.forEach(num => {
    const loc    = latestLocation[num];
    if (!loc) return;
    const driver = drivers[num] || { teamColor: DEFAULT_COLOR, abbreviation: num };
    const color  = driver.teamColor;
    const pos    = timingRows[num] ? timingRows[num].pos : 99;
    const isP1   = pos === 1;

    const history = locationHistory[num] || [];

    /* Draw trail — fading polyline using last 30 points */
    if (history.length > 1) {
      const trailPoints = history.slice(-30);
      ctx.save();
      ctx.lineCap  = 'round';
      ctx.lineJoin = 'round';
      for (let i = 1; i < trailPoints.length; i++) {
        const progress = i / (trailPoints.length - 1);
        const alpha    = 0.15 + progress * (0.6 - 0.15);
        const from     = toCanvas(trailPoints[i - 1].x, trailPoints[i - 1].y);
        const to       = toCanvas(trailPoints[i].x, trailPoints[i].y);
        ctx.beginPath();
        ctx.strokeStyle = color;
        ctx.globalAlpha = alpha;
        ctx.lineWidth   = 2;
        ctx.moveTo(from.cx, from.cy);
        ctx.lineTo(to.cx, to.cy);
        ctx.stroke();
      }
      ctx.restore();
    }

    /* Draw driver circle */
    const { cx, cy } = toCanvas(loc.x, loc.y);
    const rOuter = isP1 ? 13 : 10;
    const rInner = isP1 ? 9  : 7;

    ctx.save();

    /* P1 gold ring */
    if (isP1) {
      ctx.beginPath();
      ctx.arc(cx, cy, rOuter + 3, 0, Math.PI * 2);
      ctx.strokeStyle = '#eab308';
      ctx.lineWidth   = 2;
      ctx.globalAlpha = 0.85;
      ctx.stroke();
    }

    /* Outer glow + filled circle */
    ctx.globalAlpha = 1;
    ctx.shadowColor = color;
    ctx.shadowBlur  = 12;
    ctx.beginPath();
    ctx.arc(cx, cy, rOuter, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();

    /* Inner white circle */
    ctx.shadowBlur  = 0;
    ctx.shadowColor = 'transparent';
    ctx.beginPath();
    ctx.arc(cx, cy, rInner, 0, Math.PI * 2);
    ctx.fillStyle = '#fff';
    ctx.fill();

    /* Driver number text */
    ctx.fillStyle  = '#000';
    ctx.font       = `700 ${isP1 ? 9 : 8}px Oswald, sans-serif`;
    ctx.textAlign  = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(driver.abbreviation.substring(0, 3), cx, cy);

    ctx.restore();
  });
}

/* ==============================================
   FORMAT HELPERS
   ============================================== */
function formatLapTime(ms) {
  if (ms == null || isNaN(ms)) return '—';
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = (totalSeconds % 60).toFixed(3).padStart(6, '0');
  return `${minutes}:${seconds}`;
}

function formatSector(ms) {
  if (ms == null || isNaN(ms)) return '—';
  return (ms / 1000).toFixed(3);
}

/* ==============================================
   HELPER — EMPTY TIMING ROW
   ============================================== */
function buildEmptyRow() {
  return {
    pos: 99, gapToLeader: null, interval: null,
    lastLap: null, s1: null, s2: null, s3: null,
    tireCompound: null, tireAge: null, pits: 0,
    personalBestS1: Infinity, personalBestS2: Infinity, personalBestS3: Infinity,
  };
}

/* ==============================================
   FULLSCREEN
   ============================================== */
function setupFullscreen() {
  const btn = document.getElementById('btn-fullscreen-timing');
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
      btn.textContent = '✕ EXIT FULLSCREEN';
    } else {
      btn.textContent = '⛶ FULLSCREEN';
    }
  });
}

/* ==============================================
   STALE DATA INDICATOR
   ============================================== */
function handleStale() {
  const bar = document.getElementById('stale-bar');
  if (!bar) return;
  if (lastDataTime && (Date.now() - lastDataTime) > STALE_MS) {
    bar.classList.add('visible');
  } else if (lastDataTime) {
    bar.classList.remove('visible');
  }
}

/* ==============================================
   INIT ON DOM READY
   ============================================== */
document.addEventListener('DOMContentLoaded', initTiming);

/* ==============================================
   LIVE TELEMETRY PAGE
   Visualization boundary (per mission_interfaces.ts):
     - OpenF1 REST / F1-Telemetry-Client UDP → Plotly.js (browser-native)
     - FastF1 post-session                   → HoloViz/Panel (Python server)
   Stale data threshold: 30 seconds (ITelemetryService.isDataStale)
   ============================================== */

const STALE_THRESHOLD_MS = 30_000;

/* --- Safe storage --- */
const safeStorage = {
  get: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
  set: (key, val) => { try { localStorage.setItem(key, val); } catch { /* silent */ } }
};

/* --- Dark mode / reduce motion --- */
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
   TELEMETRY SERVICE STUB
   Implements ITelemetryService from mission_interfaces.ts.
   Replace the stub methods with real API calls per source.
   ============================================== */
class TelemetryService {
  constructor(provider) {
    this.provider   = provider;  // TelemetryProvider literal
    this.lastUpdate = null;
  }

  /** ITelemetryService.isDataStale — 30s threshold */
  isDataStale(lastUpdate) {
    if (!lastUpdate) return true;
    return (Date.now() - lastUpdate.getTime()) > STALE_THRESHOLD_MS;
  }

  /** ITelemetryService.handleConnectionGuard — defensive programming */
  handleConnectionGuard() {
    const staleEl = document.getElementById('stale-indicator');
    if (!staleEl) return;

    if (this.isDataStale(this.lastUpdate)) {
      staleEl.classList.remove('stale-indicator--hidden');
    } else {
      staleEl.classList.add('stale-indicator--hidden');
    }
  }

  /** Update the source provenance badge */
  updateSourceBadge() {
    const badge = document.getElementById('telemetry-source-badge');
    if (badge) badge.textContent = `Source: ${this.provider}`;
  }
}

/* --- Active service instance (defaults to OpenF1) --- */
let activeService = new TelemetryService('OpenF1');
activeService.updateSourceBadge();

/* ==============================================
   SOURCE SELECTOR
   ============================================== */
document.querySelectorAll('.source-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.source-btn').forEach(b => b.classList.remove('source-btn--active'));
    btn.classList.add('source-btn--active');

    const source = btn.getAttribute('data-source');
    activeService = new TelemetryService(source);
    activeService.updateSourceBadge();

    // HoloViz section: show only when FastF1 is selected
    const holovizSection = document.querySelector('.holoviz-section');
    if (holovizSection) {
      holovizSection.style.display = (source === 'FastF1') ? 'block' : 'none';
    }
  });
});

// Hide HoloViz section by default (OpenF1 is active)
const holovizSection = document.querySelector('.holoviz-section');
if (holovizSection) holovizSection.style.display = 'none';

/* ==============================================
   STALE DATA WATCHDOG
   Checks every 5 seconds whether the last update
   exceeds the 30s threshold and updates the indicator.
   ============================================== */
setInterval(() => {
  activeService.handleConnectionGuard();
}, 5000);

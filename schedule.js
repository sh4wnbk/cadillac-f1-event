/* ==============================================
   2026 F1 RACE SCHEDULE
   Shared data — mirrors RACE_SCHEDULE_2026 in index.js.
   All raceStart values in UTC.
   Dates are plausible placeholders pending official FIA confirmation.
   ============================================== */
// Source: formula1.com/en/racing/2026 (fetched 2026-03-12)
// Race times are estimated UTC from typical local session times.
// Round 16 listed as "Spain" on official site — likely the new Madrid GP (circuit TBC).
const RACE_SCHEDULE_2026 = [
  { round:  1, name: "Australian GP",    circuit: "Albert Park",                   city: "Melbourne",    country: "Australia",    flag: "🇦🇺", raceStart: new Date("2026-03-08T04:00:00Z"), practiceDates: "Mar 6–7" },
  { round:  2, name: "Chinese GP",       circuit: "Shanghai International Circuit", city: "Shanghai",    country: "China",        flag: "🇨🇳", raceStart: new Date("2026-03-15T07:00:00Z"), practiceDates: "Mar 13–14", hasSprint: true },
  { round:  3, name: "Japanese GP",      circuit: "Suzuka",                        city: "Suzuka",       country: "Japan",        flag: "🇯🇵", raceStart: new Date("2026-03-29T05:00:00Z"), practiceDates: "Mar 27–28" },
  { round:  4, name: "Bahrain GP",       circuit: "Bahrain International Circuit", city: "Sakhir",       country: "Bahrain",      flag: "🇧🇭", raceStart: new Date("2026-04-12T15:00:00Z"), practiceDates: "Apr 10–11" },
  { round:  5, name: "Saudi Arabian GP", circuit: "Jeddah Corniche Circuit",       city: "Jeddah",       country: "Saudi Arabia", flag: "🇸🇦", raceStart: new Date("2026-04-19T17:00:00Z"), practiceDates: "Apr 17–18" },
  { round:  6, name: "Miami GP",         circuit: "Miami International Autodrome", city: "Miami",        country: "USA",          flag: "🇺🇸", raceStart: new Date("2026-05-03T20:00:00Z"), practiceDates: "May 1–2",   hasSprint: true },
  { round:  7, name: "Canadian GP",      circuit: "Circuit Gilles Villeneuve",     city: "Montreal",     country: "Canada",       flag: "🇨🇦", raceStart: new Date("2026-05-24T20:00:00Z"), practiceDates: "May 22–23", hasSprint: true },
  { round:  8, name: "Monaco GP",        circuit: "Circuit de Monaco",             city: "Monte Carlo",  country: "Monaco",       flag: "🇲🇨", raceStart: new Date("2026-06-07T13:00:00Z"), practiceDates: "Jun 5–6" },
  { round:  9, name: "Spanish GP",       circuit: "Circuit de Barcelona-Catalunya",city: "Barcelona",    country: "Spain",        flag: "🇪🇸", raceStart: new Date("2026-06-14T13:00:00Z"), practiceDates: "Jun 12–13" },
  { round: 10, name: "Austrian GP",      circuit: "Red Bull Ring",                 city: "Spielberg",    country: "Austria",      flag: "🇦🇹", raceStart: new Date("2026-06-28T13:00:00Z"), practiceDates: "Jun 26–27" },
  { round: 11, name: "British GP",       circuit: "Silverstone",                   city: "Silverstone",  country: "UK",           flag: "🇬🇧", raceStart: new Date("2026-07-05T14:00:00Z"), practiceDates: "Jul 3–4",   hasSprint: true },
  { round: 12, name: "Belgian GP",       circuit: "Circuit de Spa-Francorchamps",  city: "Spa",          country: "Belgium",      flag: "🇧🇪", raceStart: new Date("2026-07-19T13:00:00Z"), practiceDates: "Jul 17–18" },
  { round: 13, name: "Hungarian GP",     circuit: "Hungaroring",                   city: "Budapest",     country: "Hungary",      flag: "🇭🇺", raceStart: new Date("2026-07-26T13:00:00Z"), practiceDates: "Jul 24–25" },
  { round: 14, name: "Dutch GP",         circuit: "Circuit Zandvoort",             city: "Zandvoort",    country: "Netherlands",  flag: "🇳🇱", raceStart: new Date("2026-08-23T13:00:00Z"), practiceDates: "Aug 21–22", hasSprint: true },
  { round: 15, name: "Italian GP",       circuit: "Autodromo Nazionale Monza",     city: "Monza",        country: "Italy",        flag: "🇮🇹", raceStart: new Date("2026-09-06T13:00:00Z"), practiceDates: "Sep 4–5" },
  { round: 16, name: "Madrid GP",        circuit: "Circuit TBC",                   city: "Madrid",       country: "Spain",        flag: "🇪🇸", raceStart: new Date("2026-09-13T13:00:00Z"), practiceDates: "Sep 11–12" },
  { round: 17, name: "Azerbaijan GP",    circuit: "Baku City Circuit",             city: "Baku",         country: "Azerbaijan",   flag: "🇦🇿", raceStart: new Date("2026-09-26T11:00:00Z"), practiceDates: "Sep 24–25" },
  { round: 18, name: "Singapore GP",     circuit: "Marina Bay Street Circuit",     city: "Singapore",    country: "Singapore",    flag: "🇸🇬", raceStart: new Date("2026-10-11T12:00:00Z"), practiceDates: "Oct 9–10", hasSprint: true },
  { round: 19, name: "United States GP", circuit: "Circuit of the Americas",       city: "Austin",       country: "USA",          flag: "🇺🇸", raceStart: new Date("2026-10-25T20:00:00Z"), practiceDates: "Oct 23–24" },
  { round: 20, name: "Mexico City GP",   circuit: "Autodromo Hermanos Rodriguez",  city: "Mexico City",  country: "Mexico",       flag: "🇲🇽", raceStart: new Date("2026-11-01T20:00:00Z"), practiceDates: "Oct 30–31" },
  { round: 21, name: "São Paulo GP",     circuit: "Autodromo Jose Carlos Pace",    city: "São Paulo",    country: "Brazil",       flag: "🇧🇷", raceStart: new Date("2026-11-08T17:00:00Z"), practiceDates: "Nov 6–7" },
  { round: 22, name: "Las Vegas GP",     circuit: "Las Vegas Strip Circuit",       city: "Las Vegas",    country: "USA",          flag: "🇺🇸", raceStart: new Date("2026-11-22T04:00:00Z"), practiceDates: "Nov 19–20" },
  { round: 23, name: "Qatar GP",         circuit: "Lusail International Circuit",  city: "Lusail",       country: "Qatar",        flag: "🇶🇦", raceStart: new Date("2026-11-29T16:00:00Z"), practiceDates: "Nov 27–28" },
  { round: 24, name: "Abu Dhabi GP",     circuit: "Yas Marina Circuit",            city: "Abu Dhabi",    country: "UAE",          flag: "🇦🇪", raceStart: new Date("2026-12-06T13:00:00Z"), practiceDates: "Dec 4–5" },
];

const RACE_DURATION_MS = 2 * 60 * 60 * 1000;

/* ==============================================
   SAFE STORAGE
   ============================================== */
const safeStorage = {
  get: (key) => { try { return localStorage.getItem(key); } catch { return null; } },
  set: (key, val) => { try { localStorage.setItem(key, val); } catch { /* silent */ } }
};

/* ==============================================
   DARK MODE / REDUCE MOTION (shared behaviour)
   ============================================== */
const themeButton = document.getElementById('theme-button');
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

/* ==============================================
   BACK TO TOP
   ============================================== */
const backToTopButton = document.getElementById('back-to-top');
let scrollTicking = false;

const scrollFunction = () => {
  if (!backToTopButton) return;
  backToTopButton.classList.toggle('show',
    document.body.scrollTop > 400 || document.documentElement.scrollTop > 400);
};

window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => { scrollFunction(); scrollTicking = false; });
    scrollTicking = true;
  }
});

if (backToTopButton) backToTopButton.addEventListener('click', (e) => {
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ==============================================
   RACE STATUS HELPERS
   ============================================== */
const getRaceStatus = (race) => {
  const now   = Date.now();
  const start = race.raceStart.getTime();
  if (now >= start && now < start + RACE_DURATION_MS) return 'live';
  if (now >= start + RACE_DURATION_MS) return 'completed';
  return 'upcoming';
};

const formatRaceDate = (date) =>
  date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

/* ==============================================
   BUILD RACE GRID
   ============================================== */
const buildRaceGrid = () => {
  const grid = document.getElementById('race-grid');
  if (!grid) return;

  const now = Date.now();
  const nextRace = RACE_SCHEDULE_2026.find(r => r.raceStart.getTime() > now) ||
                   RACE_SCHEDULE_2026.find(r => {
                     const s = r.raceStart.getTime();
                     return now >= s && now < s + RACE_DURATION_MS;
                   });

  grid.innerHTML = RACE_SCHEDULE_2026.map(race => {
    const status    = getRaceStatus(race);
    const isNext    = nextRace && race.round === nextRace.round;
    const raceDate  = formatRaceDate(race.raceStart);

    const statusLabel = status === 'live'      ? 'LIVE NOW'  :
                        status === 'completed' ? 'COMPLETED' : 'UPCOMING';

    return `
      <div class="race-card race-card--${status}${isNext ? ' race-card--next' : ''}" data-round="${race.round}">
        <div class="race-card-header">
          <span class="race-round">R${String(race.round).padStart(2, '0')}</span>
          <div class="race-card-badges">
            ${race.hasSprint ? `<span class="race-sprint-badge">SPRINT</span>` : ''}
            <span class="race-status-badge race-status--${status}">${statusLabel}</span>
          </div>
        </div>
        <div class="race-flag">${race.flag}</div>
        <h3 class="race-name">${race.name}</h3>
        <p class="race-circuit">${race.circuit}</p>
        <p class="race-location">${race.city}, ${race.country}</p>
        <div class="race-dates">
          <span class="race-date-item"><span class="race-date-label">Practice:</span> ${race.practiceDates}</span>
          <span class="race-date-item"><span class="race-date-label">Race:</span> ${raceDate}</span>
        </div>
        ${isNext && status !== 'live' ? `<div id="card-countdown-${race.round}" class="race-card-countdown"></div>` : ''}
        ${status === 'live' ? `<div class="race-card-live-pulse"><span class="live-dot"></span> IN PROGRESS</div>` : ''}
      </div>
    `;
  }).join('');
};

buildRaceGrid();

/* ==============================================
   NEXT RACE STRIP + CARD COUNTDOWN
   ============================================== */
let stripInterval = null;

const updateStrip = () => {
  const now       = Date.now();
  const nameEl    = document.getElementById('schedule-next-race-name');
  const countEl   = document.getElementById('schedule-countdown');

  const liveRace = RACE_SCHEDULE_2026.find(r => {
    const s = r.raceStart.getTime();
    return now >= s && now < s + RACE_DURATION_MS;
  });

  if (liveRace) {
    if (nameEl)  nameEl.textContent  = liveRace.name;
    if (countEl) countEl.textContent = 'RACE IS LIVE!';
    // Also update the next-race card countdown if present
    const cardEl = document.getElementById(`card-countdown-${liveRace.round}`);
    if (cardEl) cardEl.textContent = 'RACE IS LIVE!';
    return;
  }

  const nextRace = RACE_SCHEDULE_2026.find(r => r.raceStart.getTime() > now);

  if (!nextRace) {
    if (nameEl)  nameEl.textContent  = 'Season Complete';
    if (countEl) countEl.textContent = '';
    clearInterval(stripInterval);
    return;
  }

  const distance = nextRace.raceStart.getTime() - now;
  const days    = Math.floor(distance / (1000 * 60 * 60 * 24));
  const hours   = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((distance % (1000 * 60)) / 1000);

  const formatted = `${days}d ${String(hours).padStart(2,'0')}h ${String(minutes).padStart(2,'0')}m ${String(seconds).padStart(2,'0')}s`;

  if (nameEl)  nameEl.textContent  = `${nextRace.flag} ${nextRace.name}`;
  if (countEl) countEl.textContent = formatted;

  const cardEl = document.getElementById(`card-countdown-${nextRace.round}`);
  if (cardEl) cardEl.textContent = formatted;
};

updateStrip();
stripInterval = setInterval(updateStrip, 1000);

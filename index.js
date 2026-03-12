/* ==============================================
   CONSTANTS
   ============================================== */
const SCROLL_THRESHOLD    = 400;
const MODAL_AUTOCLOSE_MS  = 10_000;
const STAGE_TRANSITION_MS = 700;
const HIGHLIGHT_DELAY_NEAR = 1000;
const HIGHLIGHT_DELAY_FAR  = 1700;
const HIGHLIGHT_DURATION   = 1700;
const RACE_DURATION_MS    = 2 * 60 * 60 * 1000; // 2-hour live window

/* ==============================================
   2026 F1 RACE SCHEDULE
   Source: formula1.com/en/racing/2026 (fetched 2026-03-12)
   Race start times are estimated UTC from typical local session times.
   Exact times TBC until official FIA session schedule is published.
   Round 16 listed as "Spain" on the official site — likely the new Madrid GP.
   ============================================== */
const RACE_SCHEDULE_2026 = [
  { round:  1, name: "Australian GP",    circuit: "Albert Park",                   city: "Melbourne",    country: "Australia",    flag: "🇦🇺", raceStart: new Date("2026-03-08T04:00:00Z") },
  { round:  2, name: "Chinese GP",       circuit: "Shanghai International Circuit", city: "Shanghai",    country: "China",        flag: "🇨🇳", raceStart: new Date("2026-03-15T07:00:00Z") },
  { round:  3, name: "Japanese GP",      circuit: "Suzuka",                        city: "Suzuka",       country: "Japan",        flag: "🇯🇵", raceStart: new Date("2026-03-29T05:00:00Z") },
  { round:  4, name: "Bahrain GP",       circuit: "Bahrain International Circuit", city: "Sakhir",       country: "Bahrain",      flag: "🇧🇭", raceStart: new Date("2026-04-12T15:00:00Z") },
  { round:  5, name: "Saudi Arabian GP", circuit: "Jeddah Corniche Circuit",       city: "Jeddah",       country: "Saudi Arabia", flag: "🇸🇦", raceStart: new Date("2026-04-19T17:00:00Z") },
  { round:  6, name: "Miami GP",         circuit: "Miami International Autodrome", city: "Miami",        country: "USA",          flag: "🇺🇸", raceStart: new Date("2026-05-03T20:00:00Z") },
  { round:  7, name: "Canadian GP",      circuit: "Circuit Gilles Villeneuve",     city: "Montreal",     country: "Canada",       flag: "🇨🇦", raceStart: new Date("2026-05-24T18:00:00Z") },
  { round:  8, name: "Monaco GP",        circuit: "Circuit de Monaco",             city: "Monte Carlo",  country: "Monaco",       flag: "🇲🇨", raceStart: new Date("2026-06-07T13:00:00Z") },
  { round:  9, name: "Spanish GP",       circuit: "Circuit de Barcelona-Catalunya",city: "Barcelona",    country: "Spain",        flag: "🇪🇸", raceStart: new Date("2026-06-14T13:00:00Z") },
  { round: 10, name: "Austrian GP",      circuit: "Red Bull Ring",                 city: "Spielberg",    country: "Austria",      flag: "🇦🇹", raceStart: new Date("2026-06-28T13:00:00Z") },
  { round: 11, name: "British GP",       circuit: "Silverstone",                   city: "Silverstone",  country: "UK",           flag: "🇬🇧", raceStart: new Date("2026-07-05T14:00:00Z") },
  { round: 12, name: "Belgian GP",       circuit: "Circuit de Spa-Francorchamps",  city: "Spa",          country: "Belgium",      flag: "🇧🇪", raceStart: new Date("2026-07-19T13:00:00Z") },
  { round: 13, name: "Hungarian GP",     circuit: "Hungaroring",                   city: "Budapest",     country: "Hungary",      flag: "🇭🇺", raceStart: new Date("2026-07-26T13:00:00Z") },
  { round: 14, name: "Dutch GP",         circuit: "Circuit Zandvoort",             city: "Zandvoort",    country: "Netherlands",  flag: "🇳🇱", raceStart: new Date("2026-08-23T13:00:00Z") },
  { round: 15, name: "Italian GP",       circuit: "Autodromo Nazionale Monza",     city: "Monza",        country: "Italy",        flag: "🇮🇹", raceStart: new Date("2026-09-06T13:00:00Z") },
  { round: 16, name: "Madrid GP",        circuit: "Circuit TBC",                   city: "Madrid",       country: "Spain",        flag: "🇪🇸", raceStart: new Date("2026-09-13T13:00:00Z") },
  { round: 17, name: "Azerbaijan GP",    circuit: "Baku City Circuit",             city: "Baku",         country: "Azerbaijan",   flag: "🇦🇿", raceStart: new Date("2026-09-26T11:00:00Z") },
  { round: 18, name: "Singapore GP",     circuit: "Marina Bay Street Circuit",     city: "Singapore",    country: "Singapore",    flag: "🇸🇬", raceStart: new Date("2026-10-11T12:00:00Z") },
  { round: 19, name: "United States GP", circuit: "Circuit of the Americas",       city: "Austin",       country: "USA",          flag: "🇺🇸", raceStart: new Date("2026-10-25T20:00:00Z") },
  { round: 20, name: "Mexico City GP",   circuit: "Autodromo Hermanos Rodriguez",  city: "Mexico City",  country: "Mexico",       flag: "🇲🇽", raceStart: new Date("2026-11-01T20:00:00Z") },
  { round: 21, name: "São Paulo GP",     circuit: "Autodromo Jose Carlos Pace",    city: "São Paulo",    country: "Brazil",       flag: "🇧🇷", raceStart: new Date("2026-11-08T17:00:00Z") },
  { round: 22, name: "Las Vegas GP",     circuit: "Las Vegas Strip Circuit",       city: "Las Vegas",    country: "USA",          flag: "🇺🇸", raceStart: new Date("2026-11-22T06:00:00Z") },
  { round: 23, name: "Qatar GP",         circuit: "Lusail International Circuit",  city: "Lusail",       country: "Qatar",        flag: "🇶🇦", raceStart: new Date("2026-11-29T17:00:00Z") },
  { round: 24, name: "Abu Dhabi GP",     circuit: "Yas Marina Circuit",            city: "Abu Dhabi",    country: "UAE",          flag: "🇦🇪", raceStart: new Date("2026-12-06T13:00:00Z") },
];


/* ==============================================
   SAFE STORAGE UTILITY
   Wraps localStorage so private browsing
   (Safari/Firefox) doesn't crash the page.
   ============================================== */
const safeStorage = {
  get: (key) => {
    try { return localStorage.getItem(key); } catch { return null; }
  },
  set: (key, val) => {
    try { localStorage.setItem(key, val); } catch { /* fail silently */ }
  }
};


/* ==============================================
   DARK MODE
   ============================================== */
const themeButton = document.getElementById('theme-button');

const toggleDarkMode = () => {
  document.body.classList.toggle('dark-mode');
  const isDark = document.body.classList.contains('dark-mode');
  if (themeButton) themeButton.textContent = isDark ? 'Toggle Light Mode' : 'Toggle Dark Mode';
};

if (themeButton) themeButton.addEventListener('click', toggleDarkMode);


/* ==============================================
   REDUCE MOTION TOGGLE
   ============================================== */
const motionButton = document.getElementById('motion-button');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const savedMotionPreference = safeStorage.get('reduce-motion');
let motionReduced = savedMotionPreference !== null
  ? savedMotionPreference === 'true'
  : prefersReducedMotion;

if (motionReduced) {
  document.body.classList.add('reduce-motion');
  if (motionButton) motionButton.textContent = 'Enable Motion';
} else {
  document.body.classList.remove('reduce-motion');
  if (motionButton) motionButton.textContent = 'Reduce Motion';
}

const toggleReduceMotion = () => {
  document.body.classList.toggle('reduce-motion');
  motionReduced = document.body.classList.contains('reduce-motion');
  safeStorage.set('reduce-motion', motionReduced);
  if (motionButton) motionButton.textContent = motionReduced ? 'Enable Motion' : 'Reduce Motion';
};

if (motionButton) motionButton.addEventListener('click', toggleReduceMotion);


/* ==============================================
   RSVP COUNTER
   Volatile — resets on refresh. Persistence deferred.
   ============================================== */
let count = 3;
let participants = [];


/* ==============================================
   HERO COUNTDOWN — FULL SEASON AWARE
   - Finds the next upcoming race in RACE_SCHEDULE_2026
   - Shows "RACE IS LIVE!" during a 2-hour window after race start
   - Reverts to countdown + "UPCOMING: [Race Name]" after the window
   - Shows "2026 Season Complete" after the final race
   ============================================== */
let countdownInterval = null;

const startCountdown = () => {
  if (countdownInterval) clearInterval(countdownInterval);

  const display = document.getElementById("hero-countdown-display");
  if (!display) return;

  const createSegment = (value, label) => `
    <div class="hero-countdown-segment">
      <span class="hero-countdown-value">${String(value).padStart(2, '0')}</span>
      <span class="hero-countdown-label">${label}</span>
    </div>
  `;

  const tick = () => {
    const now = Date.now();

    // 1. Check if a race is currently live (within 2-hour window)
    const liveRace = RACE_SCHEDULE_2026.find(r => {
      const start = r.raceStart.getTime();
      return now >= start && now < start + RACE_DURATION_MS;
    });

    if (liveRace) {
      display.innerHTML = `<div class="countdown-live">RACE IS LIVE!</div>`;
      return;
    }

    // 2. Find the next upcoming race
    const nextRace = RACE_SCHEDULE_2026.find(r => r.raceStart.getTime() > now);

    if (!nextRace) {
      clearInterval(countdownInterval);
      countdownInterval = null;
      display.innerHTML = `<div class="countdown-complete">2026 Season Complete. See you next year.</div>`;
      return;
    }

    // 3. Render countdown to next race
    const distance = nextRace.raceStart.getTime() - now;

    const MS_DAY  = 1000 * 60 * 60 * 24;
    const MS_HOUR = 1000 * 60 * 60;
    const MS_MIN  = 1000 * 60;

    const days    = Math.floor(distance / MS_DAY);
    const hours   = Math.floor((distance % MS_DAY)  / MS_HOUR);
    const minutes = Math.floor((distance % MS_HOUR) / MS_MIN);
    const seconds = Math.floor((distance % MS_MIN)  / 1000);

    display.innerHTML =
      createSegment(days,    "DAYS")  +
      createSegment(hours,   "HOURS") +
      createSegment(minutes, "MINS")  +
      createSegment(seconds, "SECS")  +
      `<div class="countdown-subtitle">
        UPCOMING &mdash; ${nextRace.flag} ${nextRace.name}
        <span class="countdown-round">Round ${nextRace.round} of 24</span>
      </div>`;
  };

  tick(); // run immediately so there's no 1-second blank
  countdownInterval = setInterval(tick, 1000);
};

startCountdown();


/* ==============================================
   STRETCH: COLORIZE LINK CARDS (Fisher-Yates)
   ============================================== */
const colorizeLinks = () => {
  const colors    = ['f1-color-1', 'f1-color-2', 'f1-color-3', 'f1-color-4', 'f1-color-5'];
  const linkCards = document.querySelectorAll('.link-item-card');

  const shuffleArray = (arr) => {
    const s = [...arr];
    for (let i = s.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [s[i], s[j]] = [s[j], s[i]];
    }
    return s;
  };

  const shuffled = shuffleArray(colors);
  linkCards.forEach((card, i) => {
    if (shuffled[i]) card.classList.add(shuffled[i]);
  });
};

colorizeLinks();


/* ==============================================
   STRETCH: BACK TO TOP (null-guarded, throttled)
   ============================================== */
const backToTopButton = document.getElementById('back-to-top');

const scrollFunction = () => {
  if (!backToTopButton) return;
  const scrolled = document.body.scrollTop > SCROLL_THRESHOLD ||
                   document.documentElement.scrollTop > SCROLL_THRESHOLD;
  backToTopButton.classList.toggle("show", scrolled);
};

const scrollToTop = (event) => {
  event.preventDefault();
  window.scrollTo({ top: 0, behavior: 'smooth' });
};

let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => { scrollFunction(); scrollTicking = false; });
    scrollTicking = true;
  }
});

if (backToTopButton) backToTopButton.addEventListener('click', scrollToTop);


/* ==============================================
   CALENDAR CARD: Scroll to Hero Countdown
   ============================================== */
const heroCountdownTarget = document.querySelector('.hero');
const scrollToHeroButton  = document.querySelector('.scroll-to-hero');

if (scrollToHeroButton && heroCountdownTarget) {
  scrollToHeroButton.addEventListener('click', () => {
    window.scrollTo({ top: heroCountdownTarget.offsetTop, behavior: 'smooth' });
  });
}


/* ==============================================
   ANIMATIONS: Driver highlight on anchor click
   ============================================== */
document.addEventListener("DOMContentLoaded", () => {
  const highlightTargets = ["max-verstappen", "valtteri-bottas", "lando-norris"];

  highlightTargets.forEach(id => {
    const anchor = document.querySelector(`a[href="#${id}"]`);
    if (!anchor) return;

    anchor.addEventListener("click", () => {
      const delay = (id === "valtteri-bottas") ? HIGHLIGHT_DELAY_NEAR : HIGHLIGHT_DELAY_FAR;
      setTimeout(() => {
        const target = document.getElementById(id);
        if (!target) return;
        target.classList.add("driver-highlight");
        setTimeout(() => target.classList.remove("driver-highlight"), HIGHLIGHT_DURATION);
      }, delay);
    });
  });
});


/* ==============================================
   SUCCESS MODAL — TWO-STAGE SEQUENCE
   ============================================== */
const stage1Modal   = document.getElementById('success-modal-stage1');
const stage1Img     = document.getElementById('modal-stage1-img');
const stage2Modal   = document.getElementById('success-modal-stage2');
const stage2Text    = document.getElementById('modal-stage2-text');
const stage2Sub     = document.getElementById('modal-stage2-sub');
const stage2Img     = document.getElementById('modal-stage2-img');
const modalCloseBtn = document.getElementById('modal-close-btn');

let _stage1TimeoutId     = null;
let _stage2TimeoutId     = null;
let _stageTransitionId   = null;
let _stage2AnimateInterval = null;

function _showStage(el) {
  if (!el) return;
  el.style.display = 'flex';
  el.offsetHeight;
  el.classList.add('show');
  el.setAttribute('aria-hidden', 'false');
  if (el === stage2Modal && modalCloseBtn) modalCloseBtn.focus();
}

function _hideStage(el) {
  if (!el) return;
  el.classList.remove('show');
  el.setAttribute('aria-hidden', 'true');
  setTimeout(() => {
    if (!el.classList.contains('show')) el.style.display = 'none';
  }, 600);
}

function _getStage1Duration() {
  if (!stage1Img) return 5000;
  const parsed = parseInt(stage1Img.getAttribute('data-duration'), 10);
  return (!isNaN(parsed) && parsed > 0) ? parsed : 5000;
}

function _startStage2ImagePulse() {
  if (!stage2Img) return;
  let scaleUp = true;
  _stage2AnimateInterval = setInterval(() => {
    stage2Img.style.transform = scaleUp ? 'scale(1.04)' : 'scale(1.0)';
    scaleUp = !scaleUp;
  }, 1000);
}

function _stopStage2ImagePulse() {
  if (_stage2AnimateInterval) {
    clearInterval(_stage2AnimateInterval);
    _stage2AnimateInterval = null;
    if (stage2Img) stage2Img.style.transform = 'scale(1)';
  }
}

const _cleanupModal = () => {
  if (_stage1TimeoutId)   { clearTimeout(_stage1TimeoutId);   _stage1TimeoutId   = null; }
  if (_stage2TimeoutId)   { clearTimeout(_stage2TimeoutId);   _stage2TimeoutId   = null; }
  if (_stageTransitionId) { clearTimeout(_stageTransitionId); _stageTransitionId = null; }
  _stopStage2ImagePulse();
};

const toggleModal = (person) => {
  if (!stage1Modal || !stage2Modal) { console.warn('Modal elements not found.'); return; }

  const displayName = (person && person.name) ? person.name : 'Friend';
  if (stage2Text) stage2Text.textContent = `Thanks for RSVPing, ${displayName}!`;
  if (stage2Sub)  stage2Sub.textContent  = "Lights out and away we go! You're on the list — we'll see you at the watch-along.";

  _cleanupModal();
  _showStage(stage1Modal);

  const isMotionReduced = document.body.classList.contains('reduce-motion');
  const duration = isMotionReduced ? 0 : _getStage1Duration();

  _stage1TimeoutId = setTimeout(() => {
    _hideStage(stage1Modal);
    _stageTransitionId = setTimeout(() => {
      _stageTransitionId = null;
      _showStage(stage2Modal);
      if (!isMotionReduced) _startStage2ImagePulse();
      _stage2TimeoutId = setTimeout(() => {
        _hideStage(stage2Modal);
        _stopStage2ImagePulse();
      }, MODAL_AUTOCLOSE_MS);
    }, STAGE_TRANSITION_MS);
  }, duration);
};

if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', () => {
    _hideStage(stage1Modal);
    _hideStage(stage2Modal);
    _cleanupModal();
    const rsvpBtn = document.getElementById('rsvp-button');
    if (rsvpBtn) rsvpBtn.focus();
  });
}

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    _hideStage(stage1Modal);
    _hideStage(stage2Modal);
    _cleanupModal();
  }
});


/* ==============================================
   RSVP FORM HANDLING
   ============================================== */
const form       = document.getElementById('rsvp-form');
const rsvpButton = document.getElementById('rsvp-button');

const addParticipant = (person) => {
  const list = document.getElementById("rsvp-list");
  if (!list) { console.warn('rsvp-list element not found.'); return; }

  const newP = document.createElement("p");
  newP.textContent = `🏁 ${person.name} from ${person.state} has RSVP'd.`;
  list.appendChild(newP);

  document.getElementById('rsvp-count')?.remove();

  count = (typeof count === 'number') ? count + 1 : 1;
  const newCounter = document.createElement('p');
  newCounter.id = 'rsvp-count';
  newCounter.textContent = `⭐ ${count} people have RSVP'd to this event!`;
  list.appendChild(newCounter);
};

const validateForm = (event) => {
  if (event && typeof event.preventDefault === 'function') event.preventDefault();
  if (!form) { console.warn('rsvp-form not found.'); return false; }

  let containsErrors = false;
  const elements = Array.from(form.elements || []);
  const validNameChars = /^[a-zA-Z\s'-]+$/;
  const blockedLocationTerms = ['state', 'country', 'location', 'state or country', 'city'];

  elements.forEach((el) => {
    if (!el || !el.type) return;
    if (el.tagName.toLowerCase() === 'button' || el.type === 'submit') return;

    const value = (el.value || '').trim();
    let isInvalid = false;

    if (el.id === 'name') {
      const nameParts = value.split(/\s+/).filter(p => p.length > 0);
      if (nameParts.length < 2)             isInvalid = true;
      else if (!validNameChars.test(value)) isInvalid = true;
    } else if (el.id === 'state') {
      const locationLower = value.toLowerCase();
      if (value.length < 4)                              isInvalid = true;
      else if (!validNameChars.test(value))              isInvalid = true;
      else if (blockedLocationTerms.includes(locationLower)) isInvalid = true;
    } else if (el.id !== 'email') {
      if (value.length < 2)                              isInvalid = true;
      if (value.length > 0 && !validNameChars.test(value)) isInvalid = true;
    }

    if (isInvalid) {
      containsErrors = true;
      el.classList.add('error');
      el.classList.remove('success');
    } else if (el.id !== 'email') {
      el.classList.remove('error');
      el.classList.add('success');
    }
  });

  const emailInput = document.getElementById('email');
  if (emailInput) {
    const emailVal   = (emailInput.value || '').trim();
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(emailVal)) {
      containsErrors = true;
      emailInput.classList.add('error');
      emailInput.classList.remove('success');
    } else {
      emailInput.classList.remove('error');
      emailInput.classList.add('success');
    }
  } else {
    console.warn('email input not found for validation.');
  }

  if (!containsErrors) {
    const person = {
      name:  (document.getElementById('name')?.value  || '').trim(),
      state: (document.getElementById('state')?.value || '').trim(),
      email: (document.getElementById('email')?.value || '').trim()
    };
    addParticipant(person);
    elements.forEach((el) => {
      if (!el || !el.type) return;
      if (el.tagName.toLowerCase() === 'button' || el.type === 'submit') return;
      el.value = '';
      el.classList.remove('success', 'error');
    });
    toggleModal(person);
    return true;
  }

  return false;
};

if (form)       form.addEventListener('submit', validateForm);
if (rsvpButton) rsvpButton.addEventListener('click', (e) => {
  e.preventDefault();
  form.requestSubmit();
});

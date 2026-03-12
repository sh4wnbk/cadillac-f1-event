/* ==============================================
   CONSTANTS
   Centralised magic numbers — change here, not inline.
   ============================================== */
const RACE_DATE            = "March 8, 2026 17:00:00 EST";
const SCROLL_THRESHOLD     = 400;   // px before back-to-top appears
const MODAL_AUTOCLOSE_MS   = 10_000; // stage 2 auto-close delay
const STAGE_TRANSITION_MS  = 700;   // gap between stage 1 fade-out and stage 2 fade-in
const HIGHLIGHT_DELAY_NEAR = 1000;  // ms scroll delay for Valtteri (near top)
const HIGHLIGHT_DELAY_FAR  = 1700;  // ms scroll delay for Max / Lando (further down)
const HIGHLIGHT_DURATION   = 1700;  // ms before driver-highlight class is removed


/* ==============================================
   SAFE STORAGE UTILITY (JS-4)
   Wraps localStorage in try/catch so private
   browsing (Safari/Firefox) doesn't crash the page.
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

// Restore saved preference or fall back to system preference
const savedMotionPreference = safeStorage.get('reduce-motion');
let motionReduced = savedMotionPreference !== null
  ? savedMotionPreference === 'true'
  : prefersReducedMotion;

// Apply initial state without triggering the toggle function
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
   NOTE: Volatile — resets on page refresh.
   Persistence via localStorage is deferred.
   ============================================== */
let count = 3;
let participants = [];


/* ==============================================
   STRETCH: HERO LIVE COUNTDOWN TIMER (JS-5)
   Interval ID hoisted to module scope so it can
   be cleared if startCountdown() is called again.
   ============================================== */
let countdownInterval = null;

const startCountdown = () => {
  if (countdownInterval) clearInterval(countdownInterval); // prevent interval stacking

  const targetDate = new Date(RACE_DATE).getTime();
  const display = document.getElementById("hero-countdown-display");
  if (!display) return;

  const createSegment = (value, label) => `
    <div class="hero-countdown-segment">
      <span class="hero-countdown-value">${value}</span>
      <span class="hero-countdown-label">${label}</span>
    </div>
  `;

  countdownInterval = setInterval(() => {
    const now      = Date.now();
    const distance = targetDate - now;

    if (distance <= 0) {
      clearInterval(countdownInterval);
      countdownInterval = null;
      display.textContent = "RACE IS LIVE!";
      return;
    }

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
      createSegment(seconds, "SECS");
  }, 1000);
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
   STRETCH: BACK TO TOP BUTTON (JS-1, JS-7)
   - Null-guarded before every access
   - Scroll listener throttled via requestAnimationFrame
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

// Throttled scroll handler — requestAnimationFrame ensures scrollFunction
// fires at most once per animation frame (~16ms), not 60+ times per second.
// Critical pre-condition for telemetry: DOM updates from live data will
// compound with an unthrottled scroll listener and cause visible jank.
let scrollTicking = false;
window.addEventListener('scroll', () => {
  if (!scrollTicking) {
    requestAnimationFrame(() => {
      scrollFunction();
      scrollTicking = false;
    });
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
   [Added in Unit 8]
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
   Stage 1: fullscreen GIF (F1 red lights)
   Stage 2: split-panel personalised message
   ============================================== */

/* --- Element references --- */
const stage1Modal   = document.getElementById('success-modal-stage1');
const stage1Img     = document.getElementById('modal-stage1-img');
const stage2Modal   = document.getElementById('success-modal-stage2');
const stage2Text    = document.getElementById('modal-stage2-text');
const stage2Sub     = document.getElementById('modal-stage2-sub');
const stage2Img     = document.getElementById('modal-stage2-img');
const modalCloseBtn = document.getElementById('modal-close-btn');

/* --- Timer / animation handles --- */
let _stage1TimeoutId     = null;
let _stage2TimeoutId     = null;
let _stageTransitionId   = null; // (JS-6) tracks the 700ms gap between stages
let _stage2AnimateInterval = null;

/* --- Utility: show a modal stage --- */
function _showStage(el) {
  if (!el) return;
  el.style.display = 'flex';
  el.offsetHeight; // force reflow so CSS transition fires from display:none
  el.classList.add('show');
  el.setAttribute('aria-hidden', 'false');
  if (el === stage2Modal && modalCloseBtn) modalCloseBtn.focus();
}

/* --- Utility: hide a modal stage --- */
function _hideStage(el) {
  if (!el) return;
  el.classList.remove('show');
  el.setAttribute('aria-hidden', 'true');
  setTimeout(() => {
    if (!el.classList.contains('show')) el.style.display = 'none';
  }, 600); // matches CSS transition duration
}

/* --- Utility: read GIF duration from data attribute --- */
function _getStage1Duration() {
  if (!stage1Img) return 5000;
  const parsed = parseInt(stage1Img.getAttribute('data-duration'), 10);
  return (!isNaN(parsed) && parsed > 0) ? parsed : 5000;
}

/* --- Utility: stage 2 image pulse animation --- */
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

/* --- Utility: cancel all modal timers (JS-8 DRY extraction) --- */
const _cleanupModal = () => {
  if (_stage1TimeoutId)   { clearTimeout(_stage1TimeoutId);   _stage1TimeoutId   = null; }
  if (_stage2TimeoutId)   { clearTimeout(_stage2TimeoutId);   _stage2TimeoutId   = null; }
  if (_stageTransitionId) { clearTimeout(_stageTransitionId); _stageTransitionId = null; }
  _stopStage2ImagePulse();
};

/* --- Main sequence --- */
const toggleModal = (person) => {
  if (!stage1Modal || !stage2Modal) {
    console.warn('Modal elements not found.');
    return;
  }

  // Personalise stage 2 text — null-guarded (JS-2)
  const displayName = (person && person.name) ? person.name : 'Friend';
  if (stage2Text) stage2Text.textContent = `Thanks for RSVPing, ${displayName}!`;
  if (stage2Sub)  stage2Sub.textContent  = "Lights out and away we go! You're on the list — we'll see you at the watch-along.";

  _cleanupModal(); // cancel any in-flight sequence before starting a new one
  _showStage(stage1Modal);

  const isMotionReduced = document.body.classList.contains('reduce-motion');
  const duration = isMotionReduced ? 0 : _getStage1Duration();

  _stage1TimeoutId = setTimeout(() => {
    _hideStage(stage1Modal);

    // (JS-6) Tracked so closing during this gap cancels stage 2 from appearing
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

/* --- Close button --- */
if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', () => {
    _hideStage(stage1Modal);
    _hideStage(stage2Modal);
    _cleanupModal();
    const rsvpBtn = document.getElementById('rsvp-button');
    if (rsvpBtn) rsvpBtn.focus();
  });
}

/* --- ESC key closes modal --- */
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

  // (JS-3) Safe remove via optional chaining
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
      if (nameParts.length < 2)          isInvalid = true;
      else if (!validNameChars.test(value)) isInvalid = true;

    } else if (el.id === 'state') {
      const locationLower = value.toLowerCase();
      if (value.length < 4)                          isInvalid = true;
      else if (!validNameChars.test(value))          isInvalid = true;
      else if (blockedLocationTerms.includes(locationLower)) isInvalid = true;

    } else if (el.id !== 'email') {
      if (value.length < 2)                          isInvalid = true;
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

  // Email validation (handled separately — different regex)
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

    // Clear inputs
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

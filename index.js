/*** Dark Mode ***/

// I am a list, but I can hold anything. I like to keep my variables close, 
// * but if you look up, you might find something new. I'm a good listener, 
// * especially to clicks and scrolls. What am I?

  
// Step 1: Select the theme button
let themeButton = document.getElementById('theme-button');

// Step 2: Write the callback function
const toggleDarkMode = () => {
    // 1. Toggle the 'dark-mode' class on the body
    document.body.classList.toggle('dark-mode');
    
    // 2. Check the new state and update the button text
    if (document.body.classList.contains('dark-mode')) {
        // If dark mode is ON
        themeButton.textContent = 'Toggle Light Mode';
    } else {
        // If dark mode is OFF (Light Mode is active)
        themeButton.textContent = 'Toggle Dark Mode';
    }
}

// Step 3: Register a 'click' event listener for the theme button
themeButton.addEventListener('click', toggleDarkMode);

/*** Reduce Motion Toggle ***/

// Select the reduce motion button
let motionButton = document.getElementById('motion-button');

// Check for system preference on page load
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Check localStorage for saved preference, or use system preference
const savedMotionPreference = localStorage.getItem('reduce-motion');
let motionReduced = savedMotionPreference ? savedMotionPreference === 'true' : prefersReducedMotion;

// Apply the initial state
if (motionReduced) {
    document.body.classList.add('reduce-motion');
    motionButton.textContent = 'Enable Motion';
} else {
    document.body.classList.remove('reduce-motion');
    motionButton.textContent = 'Reduce Motion';
}

// Toggle function
const toggleReduceMotion = () => {
    document.body.classList.toggle('reduce-motion');
    motionReduced = document.body.classList.contains('reduce-motion');
    
    // Save preference to localStorage
    localStorage.setItem('reduce-motion', motionReduced);
    
    // Update button text
    if (motionReduced) {
        motionButton.textContent = 'Enable Motion';
    } else {
        motionButton.textContent = 'Reduce Motion';
    }
}

// Register click event listener
motionButton.addEventListener('click', toggleReduceMotion);

// RSVP Counter
let count = 3;

// This array's data is VOLATILE, meaning its contents are
// reset every time the page is refreshed. For now, the feature is limited
// to the current session only. Data persistence (via localStorage) is understood but
// not yet implemented.
let participants = [];

// -----------------------------------------------------

/*** STRETCH FEATURE: Hero Live Countdown Timer (Flip Clock Style) ***/

const startCountdown = () => {
    // Set the exact target date (Australian GP March 8, 2026, 5 PM EST)
    // NOTE: This date is pulled from context/previous instructions
    const targetDate = new Date("March 8, 2026 17:00:00 EST").getTime();
    const display = document.getElementById("hero-countdown-display");

    // Exit if the element is not found
    if (!display) return; 

    // Helper function to format the number segment
    const createSegment = (value, label) => `
        <div class="hero-countdown-segment">
            <span class="hero-countdown-value">${value}</span>
            <span class="hero-countdown-label">${label}</span>
        </div>
    `;

    // Update the countdown every 1 second
    const interval = setInterval(function() {
        const now = new Date().getTime();
        const distance = targetDate - now;

        // Calculations for time units
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);

        // Display the result using the flip clock segment format
        if (distance > 0) {
            display.innerHTML = 
                createSegment(days, "DAYS") + 
                createSegment(hours, "HOURS") + 
                createSegment(minutes, "MINS") + 
                createSegment(seconds, "SECS");
        } else {
            clearInterval(interval);
            display.innerHTML = "🏁 **RACE IS LIVE!** 🏎️";
        }
    }, 1000);
}

// Start the timer when the script loads
startCountdown();

// -----------------------------------------------------

/*** STRETCH FEATURE: Colorize Link Cards ***/
const colorizeLinks = () => {
    // F1-style colors defined in styles.css
    const colors = [
        'f1-color-1', 
        'f1-color-2', 
        'f1-color-3', 
        'f1-color-4', 
        'f1-color-5'
    ];

    const linkCards = document.querySelectorAll('.link-item-card');
    
    // Helper function to shuffle the array (Fisher-Yates)
    const shuffleArray = (array) => {
        // Create a copy to avoid modifying the original colors array
        const shuffled = [...array]; 
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    };
    
    // Shuffle the colors array
    const shuffledColors = shuffleArray(colors);

    linkCards.forEach((card, index) => {
        // Apply the shuffled colors to the cards
        const colorClass = shuffledColors[index];
        card.classList.add(colorClass);
    });
}

// Call the function when the script runs
colorizeLinks();

// -----------------------------------------------------

/*** STRETCH FEATURE: Back to Top Button ***/

const backToTopButton = document.getElementById('back-to-top');

// Logic to show/hide the button
const scrollFunction = () => {
    // Show the button after scrolling 400 pixels down
    if (document.body.scrollTop > 400 || document.documentElement.scrollTop > 400) {
        backToTopButton.classList.add("show");
    } else {
        backToTopButton.classList.remove("show");
    }
}

// Logic to handle the click event
const scrollToTop = (event) => {
    // Prevent the default anchor jump
    event.preventDefault(); 
    
    // Smooth scroll to the top of the page
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// Add event listener for scrolling
window.addEventListener('scroll', scrollFunction);

// Add event listener for button click
backToTopButton.addEventListener('click', scrollToTop);

// -----------------------------------------------------

/*** CALENDAR CARD: Scroll to Hero Countdown ***/

const heroCountdownTarget = document.querySelector('.hero');
const scrollToHeroButton = document.querySelector('.scroll-to-hero');

if (scrollToHeroButton && heroCountdownTarget) {
    scrollToHeroButton.addEventListener('click', () => {
        window.scrollTo({
            // Scroll to the top edge of the hero section
            top: heroCountdownTarget.offsetTop, 
            behavior: 'smooth'
        });
    });
}
// -----------------------------------------------------

/*** Animations [PLACEHOLDER] [ADDED IN UNIT 8] ***/

document.addEventListener("DOMContentLoaded", () => {
  const highlightTargets = ["max-verstappen", "valtteri-bottas", "lando-norris"];

  highlightTargets.forEach(id => {
    const anchor = document.querySelector(`a[href="#${id}"]`);
    if (anchor) {
      anchor.addEventListener("click", () => {
        // Different delays based on how far down the page the driver is
        // Valtteri is near the top (1000ms), Max and Lando are further down (1700ms)
        const scrollDelay = (id === "valtteri-bottas") ? 1000 : 1700;
        
        // Delay to allow scroll to complete and eyes to settle
        setTimeout(() => {
          const target = document.getElementById(id);
          if (target) {
            target.classList.add("driver-highlight");
            // Remove the class after animation ends so it can be re-triggered
            setTimeout(() => {
              target.classList.remove("driver-highlight");
            }, 1700);
          }
        }, scrollDelay);
      });
    }
  });
});


/* ==========================
   SUCCESS MODAL - TWO STAGE SEQUENCE
   ========================== */

// This modal has TWO stages:
// Stage 1: Shows a fullscreen GIF (F1 red lights countdown)
// Stage 2: Shows a split-panel message (text on left, image on right)
// The transition between stages happens automatically based on the GIF duration.

/* ==========================
   MODAL ELEMENTS (selected after DOM ready)
   ========================== */
const stage1Modal = document.getElementById('success-modal-stage1');
const stage1Img = document.getElementById('modal-stage1-img');

const stage2Modal = document.getElementById('success-modal-stage2');
const stage2Text = document.getElementById('modal-stage2-text');
const stage2Sub = document.getElementById('modal-stage2-sub');
const stage2Img = document.getElementById('modal-stage2-img');
const modalCloseBtn = document.getElementById('modal-close-btn');

// _showStage makes a modal stage visible with smooth transitions
// We set display: flex first, trigger a reflow, then add the 'show' class
// This ensures CSS transitions work properly from display: none
function _showStage(el) {
  if (!el) return;
  // Force reflow to ensure transition applies from display: none
  el.style.display = 'flex';
  el.offsetHeight; // trigger reflow (this forces the browser to recalculate styles)
  el.classList.add('show');
  el.setAttribute('aria-hidden', 'false');
  // focus management for accessibility
  if (el === stage2Modal && modalCloseBtn) modalCloseBtn.focus();
}

// _hideStage removes the 'show' class and waits for the CSS transition
// to finish before setting display: none. This creates a smooth fade-out effect.
function _hideStage(el) {
  if (!el) return;
  el.classList.remove('show');
  el.setAttribute('aria-hidden', 'true');
  // Wait for transition to complete before hiding (increased to 600ms for smoother fade)
  setTimeout(() => {
    if (!el.classList.contains('show')) {
      el.style.display = 'none';
    }
  }, 600); // matches transition duration in CSS
}

// Reads the data-duration attribute from the stage1 GIF
// This tells us how long to show stage 1 before transitioning to stage 2
// Default is 5000ms (5 seconds) if no duration is specified
function _getStage1Duration() {
  if (!stage1Img) return 5000;
  const raw = stage1Img.getAttribute('data-duration');
  const parsed = parseInt(raw, 10);
  if (!isNaN(parsed) && parsed > 0) return parsed;
  return 5000;
}

// These variables keep track of our timers and animations
// We need to track them so we can cancel them if the user closes the modal early
let _stage1TimeoutId = null;
let _stage2TimeoutId = null;
let _stage2AnimateInterval = null;

// Creates a subtle pulsing effect on the stage 2 image
// The image gently scales up and down to add visual interest
function _startStage2ImagePulse() {
  if (!stage2Img) return;
  let scaleUp = true;
  _stage2AnimateInterval = setInterval(() => {
    stage2Img.style.transform = scaleUp ? 'scale(1.04)' : 'scale(1.0)';
    scaleUp = !scaleUp;
  }, 1000);
}

// Stops the pulsing animation and resets the image to normal size
function _stopStage2ImagePulse() {
  if (_stage2AnimateInterval) {
    clearInterval(_stage2AnimateInterval);
    _stage2AnimateInterval = null;
    if (stage2Img) stage2Img.style.transform = 'scale(1)';
  }
}

// Main modal sequence - this is called when someone submits the RSVP form
// It coordinates showing stage 1, waiting, then showing stage 2, then auto-closing
// Main modal sequence (two-stage)
const toggleModal = (person) => {
  if (!stage1Modal || !stage2Modal) {
    console.warn('Modal elements not found.');
    return;
  }

  // Personalize the stage 2 message with the user's name
  const displayName = (person && person.name) ? person.name : 'Friend';
  stage2Text.textContent = `Thanks for RSVPing, ${displayName}!`;
  stage2Sub.textContent = "Lights out and away we go! You're on the list — we'll see you at the watch-along.";

  // Check if motion is reduced
  const isMotionReduced = document.body.classList.contains('reduce-motion');

  // show stage 1
  _showStage(stage1Modal);

  // Clear any previous timers to avoid conflicts if modal was triggered multiple times
  if (_stage1TimeoutId) { clearTimeout(_stage1TimeoutId); _stage1TimeoutId = null; }
  if (_stage2TimeoutId) { clearTimeout(_stage2TimeoutId); _stage2TimeoutId = null; }
  _stopStage2ImagePulse();

  // Get the GIF duration (how long to show stage 1)
  // If motion is reduced, skip stage 1 entirely
  const duration = isMotionReduced ? 0 : _getStage1Duration();

  // After the GIF plays, hide stage 1 and show stage 2
  // transition after duration
  _stage1TimeoutId = setTimeout(() => {
    _hideStage(stage1Modal);
    
    // Wait for stage 1 to fully fade out before showing stage 2
    setTimeout(() => {
      _showStage(stage2Modal);
      
      // Only pulse the image if motion is NOT reduced
      if (!isMotionReduced) {
        _startStage2ImagePulse();
      }

      // Auto-close stage 2 after 10 seconds so users don't have to click close
      // auto-close stage2 after 10s
      _stage2TimeoutId = setTimeout(() => {
        _hideStage(stage2Modal);
        _stopStage2ImagePulse();
      }, 10000);
    }, 700); // Wait 700ms for stage 1 to fully fade out
  }, duration);
};

// Close button handler - lets users manually close the modal
// Cleans up all timers and animations, then returns focus to the RSVP button
// close button
if (modalCloseBtn) {
  modalCloseBtn.addEventListener('click', () => {
    _hideStage(stage1Modal);
    _hideStage(stage2Modal);
    if (_stage1TimeoutId) { clearTimeout(_stage1TimeoutId); _stage1TimeoutId = null; }
    if (_stage2TimeoutId) { clearTimeout(_stage2TimeoutId); _stage2TimeoutId = null; }
    _stopStage2ImagePulse();
    // Return focus to the RSVP button for good accessibility
    const rsvpBtn = document.getElementById('rsvp-button');
    if (rsvpBtn) rsvpBtn.focus();
  });
}

// ESC key handler - another way for users to close the modal
// This is a standard UX pattern that users expect
// ESC closes
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    _hideStage(stage1Modal);
    _hideStage(stage2Modal);
    if (_stage1TimeoutId) { clearTimeout(_stage1TimeoutId); _stage1TimeoutId = null; }
    if (_stage2TimeoutId) { clearTimeout(_stage2TimeoutId); _stage2TimeoutId = null; }
    _stopStage2ImagePulse();
  }
});


/* ==========================
   RSVP FORM HANDLING (robust)
   ========================== */

const form = document.getElementById('rsvp-form');
const rsvpButton = document.getElementById('rsvp-button');

const addParticipant = (person) => {
  const list = document.getElementById("rsvp-list");
  if (!list) {
    console.warn('rsvp-list element not found.');
    return;
  }
  const newP = document.createElement("p");
  newP.textContent = `🏁 ${person.name} from ${person.state} has RSVP'd.`;
  list.appendChild(newP);

  const oldCounter = document.getElementById('rsvp-count');
  if (oldCounter) oldCounter.remove();

  count = (typeof count === 'number') ? (count + 1) : 1;
  const newCounter = document.createElement('p');
  newCounter.id = 'rsvp-count';
  newCounter.textContent = '⭐ ' + count + ' people have RSVP\'d to this event!';
  list.appendChild(newCounter);
};

const validateForm = (event) => {
  // if called from a submit event, prevent default navigation
  if (event && typeof event.preventDefault === 'function') event.preventDefault();

  let containsErrors = false;

  if (!form) {
    console.warn('rsvp-form not found.');
    return false;
  }

  const elements = Array.from(form.elements || []);
  const validNameChars = /^[a-zA-Z\s'-]+$/;
  
  // Block common placeholder/generic text
  const blockedLocationTerms = ['state', 'country', 'location', 'state or country', 'city'];

  elements.forEach((el) => {
    // only validate inputs/textareas/selects
    if (!el || !el.type) return;

    // ignore buttons
    if (el.tagName.toLowerCase() === 'button' || el.type === 'submit') return;

    const value = (el.value || '').trim();
    let isInvalid = false;

    // Special validation for name field (must have at least 2 words)
    if (el.id === 'name') {
      const nameParts = value.split(/\s+/).filter(part => part.length > 0);
      if (nameParts.length < 2) {
        isInvalid = true; // Must have at least First and Last name
      } else if (!validNameChars.test(value)) {
        isInvalid = true; // Invalid characters
      }
    }
    // Special validation for location field (state/country - must be at least 4 characters)
    else if (el.id === 'state') {
      const locationLower = value.toLowerCase().trim();
      
      // Check length first
      if (value.length < 4) {
        isInvalid = true; // No abbreviations like "CA", "NY", "UK"
      } 
      // Check for invalid characters
      else if (!validNameChars.test(value)) {
        isInvalid = true; // Invalid characters
      } 
      // Check for blocked placeholder terms
      else if (blockedLocationTerms.includes(locationLower)) {
        isInvalid = true; // Block placeholder text like "State" or "Country"
        console.log('Blocked location term detected:', value);
      }
    }
    // General validation for other fields (skip email, handled separately)
    else if (el.id !== 'email') {
      if (value.length < 2) isInvalid = true;
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

  // More robust email validation
  const emailInput = document.getElementById('email');
  if (emailInput) {
    const emailVal = (emailInput.value || '').trim();
    // Regex for proper email format: something@domain.extension
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

  // Debug: Log validation result
  console.log('Form validation - containsErrors:', containsErrors);

  if (!containsErrors) {
    const person = {
      name: (document.getElementById('name')?.value || '').trim(),
      state: (document.getElementById('state')?.value || '').trim(),
      email: (document.getElementById('email')?.value || '').trim()
    };

    addParticipant(person);

    // clear inputs and classes
    elements.forEach((el) => {
      if (!el || !el.type) return;
      if (el.tagName.toLowerCase() === 'button' || el.type === 'submit') return;
      el.value = '';
      el.classList.remove('success', 'error');
    });

    // show modal sequence
    toggleModal(person);
    return true;
  }

  // if containsErrors, do nothing (fields show red)
  return false;
};

// Attach submit handler to form (this handles both Enter key and button clicks)
if (form) {
  form.addEventListener('submit', validateForm);
}

// Prevent default button behavior to ensure form submission is handled by the form listener above
if (rsvpButton) {
  rsvpButton.addEventListener('click', (e) => {
    e.preventDefault();
    // Trigger the form's submit event (which will call validateForm)
    form.requestSubmit();
  });
}
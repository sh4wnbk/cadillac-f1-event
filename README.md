# Cadillac Formula 1® Watch-Along 2026

## CodePath WEB101 Final Project

Welcome to the **Cadillac F1 Watch-Along Event Hub**, a responsive landing page designed to celebrate Cadillac's fictional debut at the 2026 Australian Grand Prix. This project demonstrates proficiency in HTML5, CSS3, and modern JavaScript, featuring interactive DOM manipulation, complex animations, and accessibility controls.

## 🚀 Features

### Core Functionality

* **Responsive Design:** Fully responsive layout using CSS Grid and Flexbox for mobile, tablet, and desktop views.
* **Interactive RSVP Form:** Robust client-side validation for names, locations, and emails, including error states and dynamic success messages.
* **Dynamic Modal System:** A two-stage success modal sequence (GIF intro → Split-panel message) upon form submission.

### Stretch Features (Advanced)

* **🌓 Dark Mode / Light Mode:** A fully functional theme toggle that persists user preference and updates specific DOM elements (colors, shadows, borders).
* **♿ Reduced Motion Toggle:** Accessible toggle that disables complex animations (like the driver highlight wiggle) and skips the modal GIF sequence for users with motion sensitivity.
* **⏳ Live Countdown Timer:** A "Flip Clock" style JavaScript countdown targeting the March 8, 2026 race date.
* **🏎️ Interactive Predictions:** A driver selection grid allowing users to choose their winner from the 2026 grid.
* **🎨 Dynamic Coloring:** Link cards are randomly assigned F1-themed colors on every page load using a Fisher-Yates shuffle algorithm.

## 🛠️ Technologies Used

* **HTML5:** Semantic structure and accessibility attributes (`aria-hidden`, `role`).
* **CSS3:** CSS Variables (`:root`), Flexbox, Grid, Keyframe Animations, and Media Queries.
* **JavaScript (ES6+):** `addEventListener`, DOM manipulation, `localStorage` for preferences, and `setInterval` for timing events.

## 📂 Project Structure

```cadillac-f1-event
├── index.html       # Main content and structure
├── styles.css       # Global styles, themes, and animations
├── index.js         # Logic for themes, modal, and validation
└── img/             # Project assets (logos, car images, etc.)

## 👥 Credits & Disclaimer

* **Developer:** Shawn Blackman
* **Course:** [CodePath WEB101: Intro to Web Development](https://courses.codepath.org/courses/web101)

* **Disclaimer:** This is an unofficial fan project created for educational purposes as part of the CodePath curriculum. It is not affiliated with, endorsed by, or connected to Cadillac, General Motors, Formula 1, the FIA, or any F1 teams. All logos and trademarks are the property of their respective owners.

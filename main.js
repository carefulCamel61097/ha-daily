import "./style.css";
import words from "./words.json";

// --- State Management ---
let currentPage = 1;
// const wordsPerPage = 5;
const wordsPerNormalPage = 5;
const wordsPerRecapPage = 25;
const totalWords = words.length;
// 200 normal pages + 40 recap pages = 240 total
const totalPages = 240;

// Toggles
let showThai = localStorage.getItem("showThai") !== "false"; // Defaults to true
let showEnglish = localStorage.getItem("showEnglish") !== "false";
let useRomanized = localStorage.getItem("useRomanized") === "true"; // Defaults to false
let showExamples = localStorage.getItem("showExamples") !== "false"; // Defaults to true

// --- DOM Elements ---
const wordListContainer = document.getElementById("wordList");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const pageInput = document.getElementById("pageInput");
const totalPagesSpan = document.getElementById("totalPages");

const toggleThaiBtn = document.getElementById("toggleThai");
const toggleEnBtn = document.getElementById("toggleEn");
const toggleScriptBtn = document.getElementById("toggleScript");
const toggleExampleBtn = document.getElementById("toggleExample");
const settingsBtn = document.getElementById("settingsBtn");
const settingsPanel = document.getElementById("settingsPanel");

function init() {
  let userStartDateStr = localStorage.getItem("ha_daily_start_date");

  if (!userStartDateStr) {
    // Set start date to TODAY at 00:00:00
    const now = new Date();
    const startOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
    );
    userStartDateStr = startOfToday.toISOString();
    localStorage.setItem("ha_daily_start_date", userStartDateStr);
  }

  const startDate = new Date(userStartDateStr);
  const today = new Date();
  // Strip time from today to compare day-by-day
  const todayReset = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );

  const diffTime = Math.abs(todayReset - startDate);
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  currentPage = (diffDays % totalPages) + 1;

  totalPagesSpan.textContent = `/ ${totalPages}`;
  render();
  syncToggleLabels();
  setupEventListeners();
  prefetchTodaysAudio();
}

// Keep the toggle button labels in sync with the current (persisted) state,
// so on load they reflect what's actually stored — not the hard-coded HTML.
function syncToggleLabels() {
  toggleThaiBtn.textContent = showThai ? "Hide Thai" : "Show Thai";
  toggleEnBtn.textContent = showEnglish ? "Hide English" : "Show English";
  toggleScriptBtn.textContent = useRomanized ? "Use Script" : "Use Romanized";
  if (toggleExampleBtn) {
    toggleExampleBtn.textContent = showExamples ? "Hide Examples" : "Show Examples";
  }
}

function getWordsForPage(page) {
  const isRecap = page % 6 === 0;
  const recapCount = Math.floor(page / 6);

  if (isRecap) {
    // Recap page shows previous 25 words
    const end = recapCount * 25;
    const start = end - 25;
    return words.slice(start, end);
  } else {
    // Normal page shows 5 words
    // We subtract the number of recaps passed to find the correct index
    const normalPagesPassed = page - recapCount;
    const start = (normalPagesPassed - 1) * 5;
    return words.slice(start, start + 5);
  }
}

// --- Core Render Function ---
function render() {
  wordListContainer.innerHTML = "";
  const currentWords = getWordsForPage(currentPage);
  const isRecap = currentPage % 6 === 0;

  const pagination = document.querySelector(".pagination");
  if (isRecap) {
    pagination.style.marginBottom = "0px";
  } else {
    pagination.style.marginBottom = "60px";
  }

  // Add a Recap Header if applicable
  if (isRecap) {
    const header = document.createElement("h2");
    header.textContent = "Recap (25 Words)";
    header.style.textAlign = "center";
    header.style.color = "#4ade80";
    wordListContainer.appendChild(header);
  }

  // 3. Create elements for each word
  currentWords.forEach((word) => {
    // Thai/Romanization Row (Left)
    if (showThai) {
      const thaiRow = document.createElement("div");
      thaiRow.className = "row thai-row";
      thaiRow.innerHTML = `<span>${useRomanized ? word.romanization : word.thai}</span> <small style="margin-left:10px; opacity:0.5;">🔊</small>`;
      thaiRow.onclick = () => playAudio(word.thai);
      wordListContainer.appendChild(thaiRow);
    }

    // English Row (Right)
    if (showEnglish) {
      const enRow = document.createElement("div");
      enRow.className = "row english-row";
      enRow.textContent = word.english.toLowerCase();
      wordListContainer.appendChild(enRow);
    }

    // Example sentence (optional, dimmed) — shown only when present + enabled
    if (showExamples && word.example) {
      const ex = document.createElement("div");
      ex.className = "example";
      const exThai = document.createElement("span");
      exThai.className = "ex-thai";
      exThai.textContent = word.example.thai;
      const exRom = document.createElement("span");
      exRom.className = "ex-rom";
      exRom.textContent = word.example.rom;
      const exEn = document.createElement("span");
      exEn.className = "ex-en";
      exEn.textContent = word.example.en;
      ex.append(exThai, exRom, exEn);
      wordListContainer.appendChild(ex);
    }

    // Divider
    const spacer = document.createElement("div");
    spacer.className = "spacer";
    wordListContainer.appendChild(spacer);
  });

  // 4. Update Pagination UI
  pageInput.value = currentPage;
  prevBtn.disabled = currentPage === 1;
  nextBtn.disabled = currentPage === totalPages;
}

// --- Audio ---
// Audio files are cached by the service worker: Workbox runtimeCaching,
// CacheFirst with expiration (see vite.config.js). That replaces the old
// hand-rolled daily cache flush — expiration handles cleanup automatically.
// Here we just warm the cache with the current page's words so they're
// available offline; already-cached files serve from cache with no network.
function prefetchTodaysAudio() {
  if (!("caches" in window)) return;
  // one-time cleanup of the pre-Workbox cache for existing users
  caches.delete("ha-daily-audio-cache").catch(() => {});
  for (const word of getWordsForPage(currentPage)) {
    fetch(`audio/${word.thai}.mp3`).catch(() => {});
  }
}

async function playAudio(thaiText) {
  if (navigator.vibrate) navigator.vibrate(10);

  const url = `audio/${thaiText}.mp3`;

  // iPhone/Safari friendly approach:
  // We check the cache, but we play from the URL.
  // The Service Worker will automatically serve the cached version if offline.
  const audio = new Audio(url);
  audio.play().catch((err) => {
    console.error(
      "Safari might require a user gesture or the file is missing:",
      err,
    );
  });
}

// --- Events ---
function setupEventListeners() {
  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      render();
    }
  };
  nextBtn.onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      render();
    }
  };

  pageInput.onkeydown = (e) => {
    if (e.key === "Enter") {
      pageInput.blur(); // This hides the keyboard
    }
  };

  pageInput.onchange = (e) => {
    const val = parseInt(e.target.value);
    if (val >= 1 && val <= totalPages) {
      currentPage = val;
      render();
    } else {
      pageInput.value = currentPage;
    }
  };

  toggleThaiBtn.onclick = () => {
    showThai = !showThai;
    localStorage.setItem("showThai", showThai);
    render();
    syncToggleLabels();
  };
  toggleEnBtn.onclick = () => {
    showEnglish = !showEnglish;
    localStorage.setItem("showEnglish", showEnglish);
    render();
    syncToggleLabels();
  };
  toggleScriptBtn.onclick = () => {
    useRomanized = !useRomanized;
    localStorage.setItem("useRomanized", useRomanized);
    render();
    syncToggleLabels();
  };
  toggleExampleBtn.onclick = () => {
    showExamples = !showExamples;
    localStorage.setItem("showExamples", showExamples);
    render();
    syncToggleLabels();
  };

  // Settings panel: open/close via the gear, close on outside click or Escape.
  const setPanelOpen = (open) => {
    settingsPanel.hidden = !open;
    settingsBtn.setAttribute("aria-expanded", String(open));
  };
  settingsBtn.onclick = (e) => {
    e.stopPropagation();
    setPanelOpen(settingsPanel.hidden);
  };
  document.addEventListener("click", (e) => {
    if (!settingsPanel.hidden && !settingsPanel.contains(e.target)) {
      setPanelOpen(false);
    }
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") setPanelOpen(false);
  });
}

init();

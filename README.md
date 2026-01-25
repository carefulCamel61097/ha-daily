# ๕ Ha-Daily Thai

**Ha-Daily** (from the Thai word Ha meaning Five) is a minimalist, installable Progressive Web App (PWA) built for the "slow and steady" language learner. It focuses on mastering the 1,000 most common Thai words (based on movie subtitles) by unlocking exactly 5 words per day with built-in review cycles.

## 🎯 The Philosophy
Most language apps overwhelm users with infinite scrolling. Ha-Daily enforces a "drip-feed" methodology:
* **Constraint:** You cannot binge-learn. You get 5 words today, and 5 new words at midnight.
* **Retention:** Every 6th day is a dedicated Recap Page (25 words) to reinforce the previous week's vocabulary.
* **Simplicity:** No gamification, no ads, no distraction. Just you and the words.

## 🛠️ Tech Stack
This project intentionally avoids heavy frameworks to ensure maximum performance on mobile devices and low-power hardware (like a Raspberry Pi 5).
* **Runtime:** Vanilla JavaScript (ES6+)
* **Build Tool:** Vite
* **PWA Engine:** vite-plugin-pwa
* **Storage:** LocalStorage: Persists user settings and the personalized start_date.
Cache Storage API: Manages a self-cleaning audio cache for offline playback.
* **Theme:** Midnight Blue (#0B1221) & Brushed Silver (#E2E8F0).
* **Deployment:** GitHub Actions & GitHub Pages

## ✨ Key Features
# 📅 Smart Progression
* **Midnight Reset:** The app calculates your progress based on the calendar day. New words unlock exactly at 00:00 local time.
* **Recap Logic:** The 240-page timeline automatically inserts a 25-word "Weekly Recap" after every 5 days of study.

# 🔊 Intelligent Audio Caching
* **Offline Ready:** The app functions entirely without internet once the PWA is installed.
* **Self-Cleaning:** To save device storage, the app flushes the audio cache every 24 hours and only downloads the 5 words needed for the current day.
* **Cross-Platform:** Optimized Audio() handling to ensure compatibility with Safari's strict media policies on iPhone.

# 🌗 Customizable Active Recall
* **Toggle Thai:** Hide the script to test your reading.
* **Toggle Romanization:** Switch between phonetic guides and actual Thai script.
* **Toggle English:** Hide translations to test your memory.

## 🚀 Installation & Setup
1.  **Clone the Repo:** git clone https://github.com/yourusername/ha-daily.git
2.  **Install Dependencies:** npm install
3.  **Run Development Server:** npm run dev
4.  **Build for Production (GitHub Pages / Pi):** npm run build

---
*Created by carefulCamel61097*
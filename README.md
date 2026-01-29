# WeightTrack - Weight Tracker PWA 📊

A modern, offline-first Progressive Web App for tracking your weight loss journey with beautiful visualizations and persistent local storage.

## 🌐 Live Demo
[https://weight-tracking-app-rose.vercel.app/](https://weight-tracking-app-rose.vercel.app/)

## ✨ Features

### Core Functionality
- 📝 **Daily Weight Entry** - Record your weight with date picker
- 📊 **Progress Chart** - Beautiful area chart showing your weight journey
- 📈 **Statistics Dashboard** - Track current weight, total change, and distance to target
- 📜 **Weight History** - Chronological list of all entries with change indicators
- 🎯 **Target Weight** - Set and track progress towards your goal
- 🗑️ **Delete Entries** - Remove incorrect or unwanted entries

### PWA Features
- 💾 **Offline Storage** - All data stored locally using IndexedDB
- 📱 **Installable** - Add to home screen on mobile and desktop
- 🔄 **Works Offline** - Full functionality without internet connection
- ⚡ **Fast Loading** - Service worker caching for instant load times
- 🎨 **Responsive Design** - Beautiful UI on all screen sizes

### UI/UX Highlights
- 🎨 Modern gradient background (blue to indigo)
- 📊 Interactive charts with Recharts
- 🎯 Color-coded feedback (green for weight loss, orange for gain)
- 💫 Smooth transitions and hover effects
- 📱 Mobile-first responsive design
- 🎭 Empty states for first-time users
- ⚠️ Input validation (no negative/unrealistic weights)

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone or navigate to the project directory**
   ```bash
   cd weight-tracking-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   - Navigate to `http://localhost:5173`
   - The app will be running locally!

### Building for Production

```bash
npm run build
```

The production-ready files will be in the `dist` folder.

### Preview Production Build

```bash
npm run preview
```

## 📱 Installing as PWA

### On Desktop (Chrome/Edge)
1. Open the app in your browser
2. Look for the install icon in the address bar
3. Click "Install" to add to your desktop

### On Mobile (iOS)
1. Open the app in Safari
2. Tap the Share button
3. Select "Add to Home Screen"

### On Mobile (Android)
1. Open the app in Chrome
2. Tap the menu (three dots)
3. Select "Add to Home Screen"

## 🛠️ Technology Stack

- **Frontend Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Icons**: Lucide React
- **Storage**: IndexedDB (native browser API)
- **PWA**: Service Workers, Web App Manifest

## 📂 Project Structure

```
weight-tracking-app/
├── public/
│   ├── icon-192.png          # PWA icon (192x192)
│   ├── icon-512.png          # PWA icon (512x512)
│   ├── manifest.json         # PWA manifest
│   └── sw.js                 # Service worker
├── src/
│   ├── App.jsx               # Main app component
│   ├── ErrorBoundary.jsx     # Error handling wrapper
│   ├── main.jsx              # Entry point
│   └── index.css             # Global styles
├── index.html                # HTML template
├── tailwind.config.js        # Tailwind configuration
├── postcss.config.js         # PostCSS configuration
├── vite.config.js            # Vite configuration
└── package.json              # Dependencies
```

## 💡 Usage Guide

### Adding Your First Weight Entry
1. Click the "Add First Entry" button or the "+" icon in the header
2. Select the date (defaults to today)
3. Enter your weight in kilograms
4. Click "Save Entry"

### Viewing Your Progress
- **Dashboard**: See your current weight, total change, and distance to target
- **Chart**: Visual representation of your weight over time
- **History**: Detailed list of all entries with change indicators

### Setting Your Target Weight
1. Click the Settings icon (gear) in the header
2. Enter your target weight
3. Click "Save Settings"
4. Your dashboard will now show how far you are from your goal

### Deleting an Entry
1. Go to the History page
2. Click the trash icon next to the entry you want to delete
3. The entry will be removed immediately

### 📅 Calendar View & Daily Details
1. Click the Calendar icon in the navigation
2. Select any date to view or edit details
3. Track additional metrics like Water 💧, Calories 🍎, and Activity 🏃‍♂️
4. See "Day Quality" tags based on your inputs

## 🎯 Features in Detail
 
### 🧠 Smart Statistics & Analytics
- **Weekly & Monthly Averages**: Smooths out daily fluctuations to show true progress.
- **Trend Line**: Visualizes your long-term directory on the chart.
- **Healthy Rate Indicator**: Smart analysis of your weight loss pace (Healthy vs. Aggressive).
- **BMI Calculation**: Automatic BMI tracking with color-coded categories based on your height.

### 🎮 Gamification & Motivation
- **🔥 Streak Counter**: Tracks consecutive days of logging to keep you consistent.
- **💬 Daily Motivation**: Context-aware messages that cheer you on based on your progress.
- **🏆 Milestones**: Visual feedback when you hit your targets.

### 📝 Extended Tracking
- **Contextual Notes**: Add notes to your weight entries (e.g., "Post-workout", "Cheat meal").
- **Height Setting**: Customizable height for accurate BMI calculation.
- **History View**: detailed list with notes and daily changes.

### 💾 Data Management
- **IndexedDB Storage**: Secure, offline-first local storage.
- **📤 Import/Export**: Backup and restore your data via JSON.
- **⚠️ Reset Option**: "Danger zone" to clear data if needed.

### 🥗 Nutrition & Activity (New)
- **Water Tracking**: Log daily water intake 💧.
- **Calorie Logging**: Track daily calorie consumption 🍎.
- **Activity Notes**: Keep track of your workouts 🏃‍♂️.
- **BMR & TDEE**: Automatic calculation of your metabolic rates based on stats 🧮.

### 📱 PWA & UX
- **Installable**: Works like a native app on iOS and Android.
- **Offline Capable**: Full functionality without internet.
- **Dark Mode**: Beautiful, battery-saving dark theme.
- **Responsive**: Adapts to any screen size.

## 🗺️ Roadmap (Completed Items ✅)

### ✅ Smart Weight Loss Features
- [x] Weekly & Monthly Averages
- [x] Healthy Rate Indicator
- [x] Trend Line Overlay

### ✅ Motivation & Gamification
- [x] Streak Tracking
- [x] Motivational Messages

### ✅ Extended Tracking
- [x] BMI Calculation & Categories
- [x] Optional Notes for Entries

### ✅ Data Features
- [x] Export/Import (JSON)
- [x] Manual Backup & Restore

### ✅ Advanced Tracking (V2 Implemented)
- [x] Water Intake Tracking 💧
- [x] Calorie Logging 🍎
- [x] Activity Type Tracking 🏃‍♂️
- [x] BMR & TDEE Calculator 🧮
- [x] Unified Calendar View 📅

### 🗺️ PLANNED FEATURES ROADMAP

#### 🧱 PHASE 1 — Data Nerd Foundation (Data & Visualization)
**🎯 Goal**: "See everything clearly and measurably"

- **📈 Advanced Weight Analytics**
    - Weight Trend Line (EMA / Moving Average)
    - Weekly & Monthly Rolling Averages
    - Weight Volatility Indicator (high/low fluctuation)
- **🧮 Energy Balance Dashboard**
    - TDEE vs Intake Bar (daily & weekly)
    - Calorie Deficit / Surplus Gauge
    - Estimated Fat Loss Projection (7000 kcal ≈ 1 kg rule)
- **💧 Hydration Heatmap**
    - 30-day water intake heatmap
    - Consistency score
    - Correlation view: Water vs Weight change
- **📊 Weekly Comparison View**
    - This week vs last week comparisons (Avg weight, calories, activity, sleep)
    - Percentage delta indicators (+ / −)
- **🔎 Filters & Toggles**
    - Date range selector
    - Metric toggles (weight / calories / water / sleep)
    - Smoothing on/off
- **📤 Export & Data Access**
    - Export CSV / JSON
    - Screenshot-ready chart mode
    - Read-only "report view"

#### 🧠 PHASE 2 — Health Insight Engine (Analysis & Reasoning)
**🎯 Goal**: Answer "Why isn't it working?"

- **⚠️ Insight Cards (Rule-based v1)**
    - Plateau Detection
    - Over-Deficit Warning
    - Inconsistent Logging Risk
    - Sleep Deprivation Flag
    - *Example Insight*: "Last 10 days avg sleep < 6h" → *Impact*: "Weight trend flattened" → *Suggestion*: "Sleep > 7h for 5 days"
- **🔍 Cause → Effect Mapping**
    - Correlation analysis: Weight vs Calories / Sleep / Water
    - Highlight strongest factors: "Among tracked factors, sleep shows the strongest impact."
- **📉 Risk Scoring System**
    - Overall Progress Risk Score (0–100)
    - Factors: Logging consistency, Sleep, Deficit size, Weight volatility
    - UI: Green / Yellow / Red risk bands
- **🧪 Experiment Suggestions**
    - Auto-generated experiments: "Increase protein for 7 days", "Reduce calories by 150", "Sleep challenge: 7h+"
    - Pre vs Post comparison

#### 🔥 PHASE 3 — Habit System (Behavior & Consistency)
**🎯 Goal**: "Keep going"

- **✅ Daily Habit Checklist**
    - Log weight, Hit water goal, Stay within calorie range, Move (steps/activity)
- **🔥 Streak Engine**
    - Per-habit streaks
    - Longest streak
    - Streak freeze (limited)
- **📅 Habit Heatmap**
    - Calendar-based habit completion
    - Color-coded consistency
- **🎯 Micro Goals**
    - Auto-generated weekly goals with adaptive difficulty
    - Completion celebrations 🎉

#### 🧩 PHASE 4 — Unified Dashboard Experience
**🎯 Goal**: Control, not clutter

- **🧭 Dashboard Modes**
    - **Default View**: Habit + Key Insights
    - **Data Nerd Mode**: Full analytics
    - **Insight Mode**: Risks & causes
    - Toggle between modes
- **🧠 Smart Prioritization**
    - Top 1–2 most important insights shown at the top
    - Lower priority items collapsed

#### 🚀 PHASE 5 — Advanced / CV-Killer Features
*(Optional but powerful)*

- **Personal Baseline Learning**: User-specific healthy loss rate
- **Adaptive TDEE Recalculation**: Adjusts based on actual progress
- **Cloud Sync**: Opt-in backup
- **Premium Insight Unlocks**: Advanced data analysis

#### 🔮 PHASE 6 — Advanced Concepts & Future Vision (The "Behavior-Aware" System)
**🎯 Goal**: Transform from a tracker to an intelligent "Personal Health System"

> *These features transform the project into a comprehensive behavior-aware, data-driven system—ideal for distinguishing high-level engineering and product thinking.*

- **🧬 1. Personal Metabolism Learning (Mini-AI)**
    - "How does *this* user's body react?"
    - Analyzes same calorie intake vs. different weight outcomes
    - **Real-time Deficit Estimation**: Updates TDEE based on actual data
    - *Insight*: "Your body responds slower than average. Effective deficit ≈ 420 kcal/day"

- **🧠 2. Failure Analysis Mode**
    - "When and why do I fall off track?"
    - Detects patterns in high-calorie or skipped-logging days (e.g., "70% of overeating happens on Saturdays")
    - Correlates with: Sleep? Dining out? Low water?

- **🧩 3. Habit Dependency Graph**
    - "Which habit drives the others?"
    - Visual connection: Water ↑ → Calories ↓ → Weight ↓
    - Simple graph visualization of habit inter-dependencies

- **⏱️ 4. Time-to-Goal Predictor**
    - "When will I reach my goal at this pace?"
    - Trends based on **current actual pace** vs. **theoretical pace**
    - Toggles: "Aggressive" mode vs. "Sustainable" mode projections

- **🔄 5. Recovery / Damage Control Mode**
    - "I messed up, now what?" (Panic button)
    - **No crash dieting**: Recommends water, protein, and movement
    - *Plan*: "+1L water, Light walk, Normal calories" to reset psychological state

- **📊 6. Data Confidence Indicator**
    - "How reliable is this advice?"
    - Scores insights based on data density (e.g., "Data Quality: 82% — Insights reliable")
    - Softens claims if data is missing (e.g., "3 missing logs this week")

- **🧪 7. A/B Habit Experiments**
    - "Self-Experimentation Platform"
    - Compare weeks: "High Protein Week" vs. "High Fiber Week"
    - *Result*: "Avg hunger ↓, Weight loss ↑"

- **🧘 8. Psychological Load Indicator**
    - "Are you pushing too hard?"
    - Detects burnout risk: Aggressive deficit + Low sleep + Long streak pressure
    - Suggests: "Maintenance Day" to prevent quitting

- **🌍 9. Lifestyle Context Tags**
    - Adds context to data spikes
    - Tags: Period, Travel, Sickness, Exams
    - Overlays on charts to explain "abnormal" fluctuations without breaking trends

- **🔐 10. Privacy & Trust Features**
    - **Fake Mode**: For screen sharing/public demos (hides actual weight)
    - **Private Days**: Hidden entries
    - App Lock / PIN protection

- **🧠 11. Explainable Insights (XAI Lite)**
    - "Why did you say that?"
    - Shows the math/data behind every suggestion
    - *Reason*: "Because Avg calories ↑ 18% and Sleep ↓ 22%"

- **🧭 12. Personal Philosophy Mode**
    - Aligns app tone with user personality
    - Modes: **Slow & Sustainable**, **Aggressive**, **Habit-First**
    - Adjusts UI colors, notification tone, and insight aggressiveness accordingly

## 🐛 Troubleshooting

### App not loading?
- Clear your browser cache
- Make sure JavaScript is enabled
- Try a different browser (Chrome, Firefox, Edge recommended)

### Data not saving?
- Check if IndexedDB is enabled in your browser
- Make sure you're not in private/incognito mode
- Check browser console for errors

### PWA not installing?
- Make sure you're using HTTPS (or localhost)
- Check if your browser supports PWAs
- Try clearing cache and reloading

## 📄 License

This project is open source and available for personal use.

## 🤝 Contributing

Feel free to fork this project and customize it for your needs!

## 📞 Support

If you encounter any issues or have questions, please check the troubleshooting section above.

---

**Made with ❤️ using React, Vite, and Tailwind CSS**

🎯 Start tracking your weight journey today!

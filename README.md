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

## 🎯 Features in Detail

### IndexedDB Storage
All your data is stored locally in your browser using IndexedDB. This means:
- ✅ No backend server required
- ✅ Data persists across sessions
- ✅ Works completely offline
- ✅ Fast read/write operations
- ✅ Your data stays private on your device

### Smart Statistics
- **Current Weight**: Your most recent entry
- **Total Change**: Difference between first and latest entry
- **To Target**: How much weight to lose/gain to reach your goal
- **Change Indicators**: See weight changes between consecutive entries

### Responsive Design
The app is fully responsive and works beautifully on:
- 📱 Mobile phones (320px+)
- 📱 Tablets (768px+)
- 💻 Desktops (1024px+)

## 🔒 Privacy

- All data is stored locally on your device
- No data is sent to any server
- No tracking or analytics
- No account required
- Your weight data is completely private

## �️ Roadmap & Planned Features

### 🧠 Smart Weight Loss Features
- **📉 Weekly & Monthly Averages**: Weight fluctuations are smoothed using weekly/monthly average views.
- **🔮 Goal Date Estimation**: Predicts the estimated date to reach target weight based on current trend.
- **⚖️ Healthy Rate Indicator**: Warns if weight loss is too fast or too slow compared to healthy ranges.
- **📊 Trend Line Overlay**: Displays a trend line on the chart to visualize long-term progress.

### 🔔 Motivation & Habit Support
- **⏰ Weigh-in Reminders**: Customizable daily/weekly notifications to remind users to log weight.
- **🏆 Milestones & Achievements**: Celebrate milestones (e.g., first 2kg lost, consistency streaks).
- **🔥 Streak Tracking**: Track consecutive days/weeks of weight logging.
- **💬 Motivational Messages**: Context-aware encouragement based on recent progress.

### 📝 Extended Tracking
- **🧮 BMI & Compliance**: Automatic BMI calculation with visual category indicators.
- **🥗 Optional Notes**: Add context tags like "cheat day", "workout day", or "felt bloated".
- **💧 Water Intake**: Lightweight daily water consumption tracker.
- **🏃 Activity Tagging**: Tag days with workout, rest, or high-activity markers.

### 📊 Advanced Analytics
- **📅 Calendar View**: Visual calendar showing days with weight entries.
- **📤 Export/Import**: CSV/JSON support for manual backup and analysis.
- **📊 Comparison Mode**: Compare two time ranges (e.g., last month vs this month).

### 🔐 Data & Device Features
- **☁️ Cloud Sync (V2)**: Optional sync across devices using Firebase/Supabase.
- **🔑 App Lock**: PIN / Face ID protection for privacy.
- **🧹 Data Management**: Manual backup and restore options.

### 🎨 UI / UX Improvements
- **🌙 Dark Mode**: Complete dark theme support.
- **🎨 Theming**: Custom color themes.
- **🧭 Onboarding**: Tutorial flow for first-time users.
- **🪄 Animations**: Smooth chart transitions and haptic feedback on mobile.

### 🤖 AI-Powered Capabilities (Experimental)
- **🤖 AI Weight Loss Coach**: Simple advice based on trends (local logic).
- **📅 Adaptive Goals**: Suggests realistic target updates based on progress.
- **🧠 Pattern Detection**: Identifies plateaus or rebound patterns automatically.

### 🧬 Metabolism & Body Insights
- **🔥 BMR & TDEE Calculator**: Estimates daily calorie needs.
- **🍽️ Calorie Deficit Estimator**: Shows deficit needed for target goal.
- **⚠️ Plateau Detection**: Smart alerts when progress stalls.

### 🔮 Long-term Vision
- **Nutrition**: Lightweight macro tracking and meal photo attachments.
- **Fitness**: Simple workout logging and recovery indicators.
- **Psychology**: Mood tracking and habit consistency scores.
- **Visualization**: Heatmaps, zoomable timelines, and correlation engines.
- **Gamification**: Healthy badges and process-oriented levels.

### ✨ Why This Roadmap Is Strong
- ✅ **Real-world Impact**: Designed to genuinely help users with sustainable weight loss.
- ✅ **Scalable Tech**: Backend-less MVP that is ready for future cloud integration.
- ✅ **Product Thinking**: Demonstrates a focus on user needs and feature prioritization.
- ✅ **Modern Stack**: A powerful combination of AI, Data Visualization, and PWA technologies.

### 🔥 What Makes This App Different
- **Not just tracking**: It understands patterns, habits, and sustainability.
- **Privacy-first**: Offline-first architecture ensures data stays on your device.
- **Human-centric**: Built for real humans, avoiding obsession and focusing on health.

## �🐛 Troubleshooting

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

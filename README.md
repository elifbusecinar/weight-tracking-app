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

### �️ Data Management
- **IndexedDB Storage**: Secure, offline-first local storage.
- **📤 Export Data**: Download your full history as a JSON backup.
- **� Import Data**: Restore your data on any device.
- **�️ Reset Option**: "Danger zone" to clear data if needed.

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

### 🚀 Upcoming Features (V2)
- **☁️ Cloud Sync**: Optional sync across devices.
- **🔔 Reminders**: Daily notifications to log weight.
- **💧 Water Tracking**: Daily water intake logger.
- **📸 Photo Progress**: Attach photos to weight entries.
- **🔐 App Lock**: PIN protection for privacy.
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

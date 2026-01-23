import React, { useState, useEffect, createContext, useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Scale, TrendingDown, Plus, History, Settings, Target, Calendar, Trash2, Award, Activity, Moon, Sun, Sparkles, Download, Upload, Flame, Droplets, Utensils, ChevronLeft, ChevronRight, X } from 'lucide-react';

// Theme Context
const ThemeContext = createContext();

const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within ThemeProvider');
    }
    return context;
};

const ThemeProvider = ({ children }) => {
    const [isDark, setIsDark] = useState(() => {
        const saved = localStorage.getItem('theme');
        return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    });

    useEffect(() => {
        if (isDark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }, [isDark]);

    const toggleTheme = () => setIsDark(!isDark);

    return (
        <ThemeContext.Provider value={{ isDark, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

// Animated Background Component
const AnimatedBackground = ({ isDark }) => {
    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Large particle 1 */}
            <div
                className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 float"
                style={{
                    background: isDark
                        ? 'radial-gradient(circle, #73986f 0%, transparent 70%)'
                        : 'radial-gradient(circle, #cb748e 0%, transparent 70%)',
                    top: '10%',
                    left: '20%',
                    animationDuration: '6s'
                }}
            />
            {/* Large particle 2 */}
            <div
                className="absolute w-96 h-96 rounded-full blur-3xl opacity-20 float"
                style={{
                    background: isDark
                        ? 'radial-gradient(circle, #426e55 0%, transparent 70%)'
                        : 'radial-gradient(circle, #d698ab 0%, transparent 70%)',
                    bottom: '10%',
                    right: '20%',
                    animationDuration: '8s',
                    animationDelay: '2s'
                }}
            />
            {/* Medium particle */}
            <div
                className="absolute w-64 h-64 rounded-full blur-3xl opacity-15 float"
                style={{
                    background: isDark
                        ? 'radial-gradient(circle, #2d4839 0%, transparent 70%)'
                        : 'radial-gradient(circle, #eed4db 0%, transparent 70%)',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    animationDuration: '7s',
                    animationDelay: '1s'
                }}
            />
            {/* Small particles */}
            <div
                className="absolute w-32 h-32 rounded-full blur-2xl opacity-10 float"
                style={{
                    background: isDark
                        ? 'radial-gradient(circle, #d698ab 0%, transparent 70%)'
                        : 'radial-gradient(circle, #73986f 0%, transparent 70%)',
                    top: '30%',
                    right: '30%',
                    animationDuration: '5s'
                }}
            />
            <div
                className="absolute w-32 h-32 rounded-full blur-2xl opacity-10 float"
                style={{
                    background: isDark
                        ? 'radial-gradient(circle, #cb748e 0%, transparent 70%)'
                        : 'radial-gradient(circle, #426e55 0%, transparent 70%)',
                    bottom: '30%',
                    left: '30%',
                    animationDuration: '6s',
                    animationDelay: '3s'
                }}
            />
        </div>
    );
};

// IndexedDB utility functions
const DB_NAME = 'WeightTrackDB';
const DB_VERSION = 2;

const initDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            if (!db.objectStoreNames.contains('weights')) {
                const weightStore = db.createObjectStore('weights', { keyPath: 'id', autoIncrement: true });
                weightStore.createIndex('date', 'date', { unique: false });
            }
            if (!db.objectStoreNames.contains('settings')) {
                db.createObjectStore('settings', { keyPath: 'id' });
            }
            // V2: Unified Daily Entries
            if (!db.objectStoreNames.contains('daily_entries')) {
                // Key is YYYY-MM-DD string
                const entryStore = db.createObjectStore('daily_entries', { keyPath: 'date' });
                entryStore.createIndex('date', 'date', { unique: true });
            }
        };
    });
};

// Data Migration Service
const migrateWeightsToEntries = async () => {
    const db = await initDB();
    const tx = db.transaction(['weights', 'daily_entries'], 'readwrite');
    const weightStore = tx.objectStore('weights');
    const entryStore = tx.objectStore('daily_entries');

    const entryCountReq = entryStore.count();

    return new Promise((resolve, reject) => {
        entryCountReq.onsuccess = () => {
            if (entryCountReq.result === 0) {
                // Migration needed if entries empty
                const weightReq = weightStore.getAll();
                weightReq.onsuccess = () => {
                    const weights = weightReq.result;
                    if (weights && weights.length > 0) {
                        console.log("Migrating " + weights.length + " entries...");
                        weights.forEach(w => {
                            if (!w.date) return;
                            try {
                                const dateKey = new Date(w.date).toISOString().split('T')[0];
                                const entry = {
                                    date: dateKey,
                                    weight: w.weight,
                                    note: w.note || '',
                                    createdAt: w.date,
                                    updatedAt: new Date().toISOString()
                                };
                                entryStore.put(entry);
                            } catch (e) {
                                console.warn("Skipping invalid date entry during migration", w);
                            }
                        });
                    }
                    resolve(true);
                };
                weightReq.onerror = () => reject(weightReq.error);
            } else {
                resolve(false);
            }
        };
        entryCountReq.onerror = () => reject(entryCountReq.error);
    });
};

const saveDailyEntry = async (entry) => {
    const db = await initDB();
    if (!entry.date) throw new Error("Entry must have a date (YYYY-MM-DD)");
    return new Promise((resolve, reject) => {
        const tx = db.transaction('daily_entries', 'readwrite');
        const store = tx.objectStore('daily_entries');
        const request = store.put({ ...entry, updatedAt: new Date().toISOString() });
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const getDailyEntries = async () => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const tx = db.transaction('daily_entries', 'readonly');
        const store = tx.objectStore('daily_entries');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const addWeight = async (entry) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['weights'], 'readwrite');
        const store = transaction.objectStore('weights');
        const request = store.add(entry);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const getAllWeights = async () => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['weights'], 'readonly');
        const store = transaction.objectStore('weights');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
};

const deleteWeight = async (id) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['weights'], 'readwrite');
        const store = transaction.objectStore('weights');
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

const saveSettings = async (settings) => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['settings'], 'readwrite');
        const store = transaction.objectStore('settings');
        const request = store.put({ id: 'userSettings', ...settings });
        request.onsuccess = () => resolve();
        request.onerror = () => reject(request.error);
    });
};

const getSettings = async () => {
    const db = await initDB();
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(['settings'], 'readonly');
        const store = transaction.objectStore('settings');
        const request = store.get('userSettings');
        request.onsuccess = () => resolve(request.result || { targetWeight: 70, unit: 'kg' });
        request.onerror = () => reject(request.error);
    });
};

// Statistical Helper Functions
const getDateRange = (date, days) => {
    const result = new Date(date);
    result.setDate(result.getDate() - days);
    return result;
};

const calculateAverage = (weights, days) => {
    if (!weights || weights.length === 0) return 0;
    const now = new Date();
    const startDate = getDateRange(now, days);

    // Filters weights within the time range
    const filteredWeights = weights.filter(w => new Date(w.date) >= startDate);

    if (filteredWeights.length === 0) return 0;

    const sum = filteredWeights.reduce((acc, curr) => acc + curr.weight, 0);
    return Number((sum / filteredWeights.length).toFixed(1));
};

const calculateTrendLine = (weights) => {
    if (weights.length < 2) return [];

    // Simple Linear Regression
    const data = weights.map((w, i) => ({
        x: i,
        y: w.weight,
        date: w.date
    })).reverse(); // Oldest to newest for calculation

    const n = data.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    data.forEach(p => {
        sumX += p.x;
        sumY += p.y;
        sumXY += p.x * p.y;
        sumXX += p.x * p.x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    return data.map(p => ({
        date: p.date,
        trend: parseFloat((slope * p.x + intercept).toFixed(1))
    })).reverse(); // Return to newest to oldest for display match
};

const analyzeHealthyRate = (weights) => {
    if (weights.length < 2) return { status: 'insufficient', rate: 0, message: 'Keep logging!' };

    const latest = weights[0];
    const weekAgo = weights.find(w => new Date(w.date) <= getDateRange(new Date(latest.date), 7));

    if (!weekAgo) return { status: 'insufficient', rate: 0, message: 'Need 7 days data' };

    const daysDiff = (new Date(latest.date) - new Date(weekAgo.date)) / (1000 * 60 * 60 * 24);
    const weightDiff = weekAgo.weight - latest.weight; // Positive means lost weight
    const ratePerWeek = (weightDiff / daysDiff) * 7;

    if (ratePerWeek > 1.5) return { status: 'aggressive', rate: ratePerWeek, message: 'Too fast! careful.' };
    if (ratePerWeek > 0.5) return { status: 'healthy', rate: ratePerWeek, message: 'Healthy pace! 🔥' };
    if (ratePerWeek > 0) return { status: 'slow', rate: ratePerWeek, message: 'Steady progress.' };
    return { status: 'gain', rate: ratePerWeek, message: 'Gained weight.' };
};

const calculateBMI = (weight, heightCm) => {
    if (!weight || !heightCm) return 0;
    const heightM = heightCm / 100;
    return Number((weight / (heightM * heightM)).toFixed(1));
};

const getBMICategory = (bmi) => {
    if (bmi < 18.5) return { name: 'Underweight', color: 'text-blue-500', bg: 'bg-blue-500/20' };
    if (bmi < 25) return { name: 'Normal', color: 'text-green-500', bg: 'bg-green-500/20' };
    if (bmi < 30) return { name: 'Overweight', color: 'text-orange-500', bg: 'bg-orange-500/20' };
    return { name: 'Obese', color: 'text-red-500', bg: 'bg-red-500/20' };
};



const calculateStreak = (weights) => {
    if (!weights || weights.length === 0) return 0;

    // Sort by date descending (should already be sorted but safe to ensure)
    const sorted = [...weights].sort((a, b) => new Date(b.date) - new Date(a.date));
    const today = new Date().toISOString().split('T')[0];
    const latestDate = sorted[0].date;

    // If latest entry is not today or yesterday, streak is broken (0)
    // Check if latest is today or yesterday
    const d1 = new Date(today);
    const d2 = new Date(latestDate);
    const diffTime = Math.abs(d1 - d2);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 1) return 0;

    let streak = 1;
    for (let i = 0; i < sorted.length - 1; i++) {
        const curr = new Date(sorted[i].date);
        const next = new Date(sorted[i + 1].date);
        const diff = (curr - next) / (1000 * 60 * 60 * 24);

        if (diff === 1) {
            streak++;
        } else if (diff > 1) {
            break; // Gap found, streak ends
        }
        // If diff === 0 (same day entries), continue (don't increment, don't break)
    }
    return streak;
};

const getMotivationalMessage = (streak, totalChange) => {
    if (streak > 7) return "🔥 You're on fire! Unstoppable!";
    if (streak > 3) return "⚡ Consistency is key! Keep it up!";
    if (totalChange < -5) return "🎉 Amazing progress! You're doing great!";
    if (totalChange < -1) return "💪 Nice work! Every gram counts.";
    if (totalChange > 0) return "🛤️ It's a journey. Keep going!";
    return "✨ Believe in yourself!";
};

const calculateBMR = (weight, height, age, gender) => {
    // Mifflin-St Jeor Equation
    if (!weight || !height || !age) return 0;
    const s = gender === 'male' ? 5 : -161;
    return (10 * weight) + (6.25 * height) + (5 * age) + s;
};

const calculateTDEE = (bmr, activityLevel) => {
    const multipliers = {
        sedentary: 1.2,
        light: 1.375,
        moderate: 1.55,
        active: 1.725,
        veryActive: 1.9
    };
    return Math.round(bmr * (multipliers[activityLevel] || 1.2));
};

// Main App Component
function WeightTrackPWA() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [weights, setWeights] = useState([]);
    const [settings, setSettings] = useState({ targetWeight: 70, unit: 'kg', height: 170 });
    const [loading, setLoading] = useState(true);
    const [selectedDate, setSelectedDate] = useState(null); // For Calendar Modal
    const { isDark, toggleTheme } = useTheme();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            setLoading(true);

            // 1. Run Migration (idempotent, checks if needed)
            await migrateWeightsToEntries();

            // 2. Load from new unified store
            const entries = await getDailyEntries();
            const settingsData = await getSettings();

            // 3. Transform to compatible list
            // We now load ALL entries for Calendar, but UI components might need filtering
            const weightsList = entries.map(e => ({
                id: e.date,
                date: e.date,
                weight: e.weight,
                note: e.note,
                water: e.water || 0,
                calories: e.calories || 0,
                activity: e.activity
            }));

            // Dashboard/Chart expects sorted by date desc
            setWeights(weightsList.sort((a, b) => new Date(b.date) - new Date(a.date)));
            setSettings({ height: 170, ...settingsData });
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddWeight = async (entry) => {
        try {
            await addWeight(entry);
            await loadData();
            setCurrentPage('dashboard');
        } catch (error) {
            console.error('Error adding weight:', error);
        }
    };

    const handleDeleteWeight = async (id) => {
        try {
            await deleteWeight(id);
            await loadData();
        } catch (error) {
            console.error('Error deleting weight:', error);
        }
    };

    const handleEntrySave = async (entry) => {
        try {
            await saveDailyEntry(entry);
            await loadData();
            setSelectedDate(null);
        } catch (error) {
            console.error('Error saving entry:', error);
            alert('Failed to save entry');
        }
    };

    const handleUpdateSettings = async (newSettings) => {
        try {
            await saveSettings(newSettings);
            setSettings(newSettings);
        } catch (error) {
            console.error('Error updating settings:', error);
        }
    };

    const handleResetData = async () => {
        if (window.confirm('Are you sure you want to delete ALL data? This action cannot be undone.')) {
            try {
                setLoading(true);
                // We need to delete all from both stores
                const db = await initDB();
                const tx = db.transaction(['weights', 'settings'], 'readwrite');
                tx.objectStore('weights').clear();
                tx.objectStore('settings').clear();

                // Wait for transaction complete
                tx.oncomplete = async () => {
                    setWeights([]);
                    setSettings({
                        targetWeight: 70,
                        unit: 'kg',
                        height: 170,
                        age: 30,
                        gender: 'female',
                        activityLevel: 'sedentary'
                    });
                    await loadData();
                    alert('All data has been reset.');
                    setLoading(false);
                };
            } catch (error) {
                console.error('Reset error:', error);
                setLoading(false);
            }
        }
    };

    const handleImportData = async (data) => {
        try {
            setLoading(true);
            if (data.settings) {
                await saveSettings(data.settings);
                setSettings(data.settings);
            }
            if (Array.isArray(data.weights)) {
                // Merge logic: Add weights one by one. addWeight handles ID generation.
                // If we want to avoid duplicates precisely, we might check date/weight.
                // For simplicity/safety, we'll just add them. 
                // A better approach for "restore" is to clear and add, but "merge" is safer.
                // Let's iterate and add if date doesn't exist?
                // IndexedDB 'add' fails if key exists. 'put' overwrites.
                // Our IDs are auto-increment.

                // Strategy: Use 'put' to save imported entries. 
                // We'll strip IDs from import to let DB generate new ones to avoid collision? 
                // Or keep original IDs? If we keep original, we might overwrite.
                // Let's strip IDs and check for duplicates by date.

                const existingDates = new Set(weights.map(w => w.date));

                for (const entry of data.weights) {
                    if (!existingDates.has(entry.date)) {
                        const { id, ...entryWithoutId } = entry; // Remove ID to auto-gen new one
                        await addWeight(entryWithoutId);
                    }
                }
            }
            await loadData();
            alert('Data imported successfully!');
        } catch (error) {
            console.error('Import error:', error);
            alert('Error importing data');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark flex items-center justify-center theme-transition relative overflow-hidden">
                <AnimatedBackground isDark={isDark} />
                <div className="text-center relative z-10 scale-in">
                    <Scale className="w-16 h-16 text-rose dark:text-sage mx-auto mb-4 spinner" />
                    <p className="text-dark-bg dark:text-dark-text font-medium">Loading WeightTrack...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-light dark:bg-gradient-dark theme-transition relative overflow-hidden">
            <AnimatedBackground isDark={isDark} />

            {/* Header */}
            <header className="glass sticky top-0 z-20 shadow-glass dark:shadow-glass-dark slide-in-top">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative p-3 rounded-2xl shadow-lg hover-lift bg-gradient-rose dark:bg-gradient-sage">
                                <Scale className="w-6 h-6 text-white" />
                                <div className="absolute -top-1 -right-1 w-3 h-3 rounded-full bg-rose-light dark:bg-sage pulse-glow" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-dark-bg dark:text-dark-text tracking-tight">
                                    WeightTrack v2.1
                                </h1>
                                <div className="flex items-center gap-2">
                                    <Sparkles className="w-3 h-3 text-rose dark:text-sage" />
                                    <p className="text-sm text-sage-dark dark:text-dark-muted">
                                        Your Health Journey
                                    </p>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={toggleTheme}
                                className="p-2.5 rounded-xl glass hover-lift hover-glow transform hover:scale-110 theme-transition shadow-lg"
                            >
                                {isDark ? <Sun className="w-5 h-5 text-rose-light" /> : <Moon className="w-5 h-5 text-sage" />}
                            </button>

                            {/* Desktop Navigation */}
                            <div className="hidden md:flex items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage('dashboard')}
                                    className={`p-2.5 rounded-xl theme-transition hover-lift ${currentPage === 'dashboard'
                                        ? 'bg-gradient-rose dark:bg-gradient-sage text-white shadow-lg'
                                        : 'glass text-dark-bg dark:text-dark-text hover-glow'
                                        }`}
                                >
                                    <Activity className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage('calendar')}
                                    className={`p-2.5 rounded-xl theme-transition hover-lift ${currentPage === 'calendar'
                                        ? 'bg-gradient-rose dark:bg-gradient-sage text-white shadow-lg'
                                        : 'glass text-dark-bg dark:text-dark-text hover-glow'
                                        }`}
                                >
                                    <Calendar className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage('add')}
                                    className={`p-2.5 rounded-xl theme-transition hover-lift ${currentPage === 'add'
                                        ? 'bg-gradient-rose dark:bg-gradient-sage text-white shadow-lg'
                                        : 'glass text-dark-bg dark:text-dark-text hover-glow'
                                        }`}
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage('history')}
                                    className={`p-2.5 rounded-xl theme-transition hover-lift ${currentPage === 'history'
                                        ? 'bg-gradient-rose dark:bg-gradient-sage text-white shadow-lg'
                                        : 'glass text-dark-bg dark:text-dark-text hover-glow'
                                        }`}
                                >
                                    <History className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => setCurrentPage('settings')}
                                    className={`p-2.5 rounded-xl theme-transition hover-lift ${currentPage === 'settings'
                                        ? 'bg-gradient-rose dark:bg-gradient-sage text-white shadow-lg'
                                        : 'glass text-dark-bg dark:text-dark-text hover-glow'
                                        }`}
                                >
                                    <Settings className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-6 relative z-10 pb-24 md:pb-6">
                {currentPage === 'dashboard' && (
                    <Dashboard weights={weights} settings={settings} onNavigate={setCurrentPage} />
                )}
                {currentPage === 'calendar' && (
                    <CalendarView entries={weights} onDateSelect={setSelectedDate} />
                )}
                {currentPage === 'add' && (
                    <AddWeight onAdd={handleAddWeight} onCancel={() => setCurrentPage('dashboard')} />
                )}
                {currentPage === 'history' && (
                    <HistoryPage weights={weights} onDelete={handleDeleteWeight} unit={settings.unit} />
                )}
                {currentPage === 'settings' && (
                    <SettingsPage settings={settings} onUpdate={handleUpdateSettings} weights={weights} onImport={async (data) => {
                        // Simple reload for now, improving import later if needed
                        await loadData();
                    }} onReset={handleResetData} />
                )}

                {/* Calendar Detail Modal */}
                {selectedDate && (
                    <DayDetailModal
                        date={selectedDate}
                        entry={weights.find(w => w.date === selectedDate)}
                        onClose={() => setSelectedDate(null)}
                        onSave={handleEntrySave}
                    />
                )}
            </main>

            {/* Mobile Bottom Navigation */}
            <nav className="fixed bottom-0 left-0 right-0 glass shadow-glass-dark md:hidden z-50 pb-safe">
                <div className="flex justify-around items-center p-4">
                    <button
                        onClick={() => setCurrentPage('dashboard')}
                        className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all duration-300 ${currentPage === 'dashboard'
                            ? 'text-rose dark:text-sage scale-110'
                            : 'text-sage-dark dark:text-dark-muted opacity-70'
                            }`}
                    >
                        <Activity className="w-6 h-6" />
                        <span className="text-xs font-medium">Dash</span>
                    </button>
                    <button
                        onClick={() => setCurrentPage('calendar')}
                        className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all duration-300 ${currentPage === 'calendar'
                            ? 'text-rose dark:text-sage scale-110'
                            : 'text-sage-dark dark:text-dark-muted opacity-70'
                            }`}
                    >
                        <Calendar className="w-6 h-6" />
                        <span className="text-xs font-medium">Calendar</span>
                    </button>
                    <button
                        onClick={() => setCurrentPage('add')}
                        className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all duration-300 ${currentPage === 'add'
                            ? 'text-rose dark:text-sage scale-110'
                            : 'text-sage-dark dark:text-dark-muted opacity-70'
                            }`}
                    >
                        <Plus className="w-6 h-6" />
                        <span className="text-xs font-medium">Add</span>
                    </button>
                    <button
                        onClick={() => setCurrentPage('history')}
                        className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all duration-300 ${currentPage === 'history'
                            ? 'text-rose dark:text-sage scale-110'
                            : 'text-sage-dark dark:text-dark-muted opacity-70'
                            }`}
                    >
                        <History className="w-6 h-6" />
                        <span className="text-xs font-medium">History</span>
                    </button>
                    <button
                        onClick={() => setCurrentPage('settings')}
                        className={`p-2 rounded-xl flex flex-col items-center gap-1 transition-all duration-300 ${currentPage === 'settings'
                            ? 'text-rose dark:text-sage scale-110'
                            : 'text-sage-dark dark:text-dark-muted opacity-70'
                            }`}
                    >
                        <Settings className="w-6 h-6" />
                        <span className="text-xs font-medium">Settings</span>
                    </button>
                </div>
            </nav>
        </div>
    );
}

// Day Detail Modal Component (Bottom Sheet / Modal)
function DayDetailModal({ date, entry, onClose, onSave }) {
    const [weight, setWeight] = useState(entry?.weight || '');
    const [water, setWater] = useState(entry?.water || 0);
    const [calories, setCalories] = useState(entry?.calories || '');
    const [note, setNote] = useState(entry?.note || '');
    const [activity, setActivity] = useState(entry?.activity || '');

    // "Smart Tags" Logic based on inputs
    const getTags = () => {
        const tags = [];
        if (weight && water >= 8 && calories) tags.push({ text: 'Perfect Day', color: 'bg-green-100 text-green-700' });
        else if (weight || water > 4 || calories) tags.push({ text: 'On Track', color: 'bg-orange-100 text-orange-700' });
        if (water >= 8) tags.push({ text: 'Hydrated', color: 'bg-blue-100 text-blue-700' });
        return tags;
    };

    const handleSave = () => {
        onSave({
            date,
            weight: weight ? parseFloat(weight) : null,
            water: parseInt(water),
            calories: calories ? parseInt(calories) : null,
            note,
            activity
        });
        onClose();
    };

    const displayDate = new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

    return (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-4 sm:p-6">
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm fade-in" onClick={onClose} />
            <div className="relative w-full max-w-md bg-white dark:bg-dark-bg rounded-2xl shadow-2xl p-6 slide-in-bottom theme-transition">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-white/10 text-sage-dark dark:text-dark-text transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <h2 className="text-xl font-bold text-dark-bg dark:text-dark-text mb-1">{displayDate}</h2>
                <div className="flex flex-wrap gap-2 mb-6">
                    {getTags().map((tag, i) => (
                        <span key={i} className={`text-xs font-bold px-2 py-1 rounded-full ${tag.color}`}>
                            {tag.text}
                        </span>
                    ))}
                    {!entry && getTags().length === 0 && (
                        <span className="text-xs font-bold px-2 py-1 rounded-full bg-gray-100 text-gray-500">No Data Yet</span>
                    )}
                </div>

                <div className="space-y-4">
                    {/* Weight Input */}
                    <div className="p-4 bg-rose/5 dark:bg-sage/5 rounded-xl border border-rose/10 dark:border-sage/10">
                        <label className="block text-sm font-semibold text-rose dark:text-sage mb-2 flex items-center gap-2">
                            <Scale className="w-4 h-4" /> Weight (kg)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            placeholder="Enter weight..."
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            className="w-full px-4 py-2 bg-white dark:bg-dark-surface rounded-lg border-2 border-transparent focus:border-rose dark:focus:border-sage focus:ring-0 text-dark-bg dark:text-dark-text font-bold text-lg"
                        />
                    </div>

                    {/* Water Tracker */}
                    <div className="p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-100 dark:border-blue-800/30">
                        <label className="block text-sm font-semibold text-blue-600 dark:text-blue-400 mb-3 flex items-center justify-between">
                            <span className="flex items-center gap-2"><Droplets className="w-4 h-4" /> Water (Glasses)</span>
                            <span className="text-2xl font-bold">{water}</span>
                        </label>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setWater(Math.max(0, water - 1))}
                                className="flex-1 py-2 bg-white dark:bg-dark-surface rounded-lg font-bold text-blue-500 shadow-sm hover:shadow-md transition-all active:scale-95"
                            >
                                -
                            </button>
                            <button
                                onClick={() => setWater(water + 1)}
                                className="flex-1 py-2 bg-blue-500 text-white rounded-lg font-bold shadow-sm hover:shadow-md transition-all active:scale-95 hover:bg-blue-600"
                            >
                                +
                            </button>
                        </div>
                    </div>

                    {/* Calories Input */}
                    <div className="p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-100 dark:border-orange-800/30">
                        <label className="block text-sm font-semibold text-orange-600 dark:text-orange-400 mb-2 flex items-center gap-2">
                            <Utensils className="w-4 h-4" /> Calories (kcal)
                        </label>
                        <input
                            type="number"
                            placeholder="e.g. 2000"
                            value={calories}
                            onChange={(e) => setCalories(e.target.value)}
                            className="w-full px-4 py-2 bg-white dark:bg-dark-surface rounded-lg border-2 border-transparent focus:border-orange-500 focus:ring-0 text-dark-bg dark:text-dark-text font-bold text-lg"
                        />
                    </div>

                    {/* Notes Input */}
                    <div>
                        <textarea
                            placeholder="Add notes about your day..."
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            className="w-full px-4 py-3 bg-gray-50 dark:bg-dark-surface rounded-xl border-2 border-transparent focus:border-sage focus:ring-0 text-dark-bg dark:text-dark-text min-h-[80px]"
                        />
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full py-4 bg-gradient-primary-light dark:bg-gradient-primary-dark text-white rounded-xl font-bold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all text-lg"
                    >
                        Save Entry
                    </button>
                </div>
            </div>
        </div>
    );
}

// Calendar View Component
function CalendarView({ entries, onDateSelect }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const days = new Date(year, month + 1, 0).getDate();
        const firstDay = new Date(year, month, 1).getDay(); // 0 = Sun
        return { days, firstDay: firstDay === 0 ? 6 : firstDay - 1 }; // Adjust for Mon start
    };

    const { days, firstDay } = getDaysInMonth(currentDate);
    const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDayClick = (day) => {
        const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day + 1).toISOString().split('T')[0];
        onDateSelect(dateStr);
    };

    // lookup map for O(1) access
    const entriesMap = entries.reduce((acc, e) => {
        acc[e.date] = e;
        return acc;
    }, {});

    const renderCalendarGrid = () => {
        const grid = [];
        // Empty cells for shift
        for (let i = 0; i < firstDay; i++) {
            grid.push(<div key={`empty-${i}`} className="h-24 md:h-32 bg-transparent" />);
        }

        for (let day = 1; day <= days; day++) {
            const dateStr = new Date(currentDate.getFullYear(), currentDate.getMonth(), day + 1).toISOString().split('T')[0];
            const entry = entriesMap[dateStr];
            const isToday = dateStr === new Date().toISOString().split('T')[0];

            // Status Logic
            let statusColor = 'bg-white/50 dark:bg-dark-surface/50 border-transparent';
            if (entry) {
                if (entry.weight && entry.water >= 8 && entry.calories) statusColor = 'bg-green-100 dark:bg-green-900/20 border-green-200 dark:border-green-800'; // Perfect
                else if (entry.weight || entry.water > 4 || entry.calories) statusColor = 'bg-orange-50 dark:bg-orange-900/10 border-orange-100 dark:border-orange-800/30'; // Good/Partial
            }
            if (isToday) statusColor += ' ring-2 ring-rose dark:ring-sage ring-offset-2 dark:ring-offset-dark-bg';

            grid.push(
                <div
                    key={day}
                    onClick={() => handleDayClick(day)}
                    className={`h-24 md:h-32 rounded-xl p-2 relative theme-transition hover-lift cursor-pointer border ${statusColor}`}
                >
                    <span className={`text-sm font-bold ${isToday ? 'text-rose dark:text-sage' : 'text-dark-bg dark:text-dark-text'}`}>
                        {day}
                    </span>

                    {entry && (
                        <div className="flex flex-col gap-1 mt-1">
                            {entry.weight && (
                                <div className="flex items-center gap-1">
                                    <Scale className="w-3 h-3 text-rose dark:text-sage" />
                                    <span className="text-xs font-medium text-dark-bg dark:text-dark-text">{entry.weight}</span>
                                </div>
                            )}
                            {entry.water > 0 && (
                                <div className="flex items-center gap-1">
                                    <Droplets className="w-3 h-3 text-blue-500" />
                                    {/* <span className="text-xs text-blue-500">{entry.water}</span> */}
                                </div>
                            )}
                            {entry.calories > 0 && (
                                <div className="flex items-center gap-1">
                                    <Flame className="w-3 h-3 text-orange-500" />
                                    {/* <span className="text-xs text-orange-500">{entry.calories}</span> */}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        }
        return grid;
    };

    return (
        <div className="fade-in">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-dark-bg dark:text-dark-text">{monthName}</h2>
                <div className="flex gap-2">
                    <button onClick={prevMonth} className="p-2 glass rounded-lg hover:bg-rose/10"><ChevronLeft className="w-5 h-5 text-dark-bg dark:text-dark-text" /></button>
                    <button onClick={nextMonth} className="p-2 glass rounded-lg hover:bg-rose/10"><ChevronRight className="w-5 h-5 text-dark-bg dark:text-dark-text" /></button>
                </div>
            </div>

            <div className="grid grid-cols-7 gap-2 md:gap-4 mb-2">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                    <div key={d} className="text-center text-xs font-bold text-sage-dark dark:text-dark-muted py-2">
                        {d}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-2 md:gap-4">
                {renderCalendarGrid()}
            </div>
        </div>
    );
}

// Dashboard Component
function Dashboard({ weights, settings, onNavigate }) {
    // Filter for weight stats
    const validWeights = weights.filter(w => w.weight > 0);
    const latestWeight = validWeights[0];
    const oldestWeight = validWeights[validWeights.length - 1];
    const totalChange = latestWeight && oldestWeight ? latestWeight.weight - oldestWeight.weight : 0;
    const targetDiff = latestWeight ? latestWeight.weight - settings.targetWeight : 0;

    // Smart Stats Calculations
    const weeklyAvg = calculateAverage(validWeights, 7);
    const monthlyAvg = calculateAverage(validWeights, 30);
    const healthStatus = analyzeHealthRate(validWeights);
    const trendData = calculateTrendLine(validWeights);
    const streak = calculateStreak(weights); // Streak uses ALL activity
    const motivation = getMotivationalMessage(streak, totalChange);

    // Calorie targets
    const bmr = calculateBMR(latestWeight?.weight, settings.height, settings.age, settings.gender);
    const tdee = calculateTDEE(bmr, settings.activityLevel);
    const calorieTarget = tdee - 500; // Deficit for weight loss

    // Water Tracker State (Simple local state for MVP, normally would be persisted)
    const [water, setWater] = useState(() => {
        const saved = localStorage.getItem('waterTracker');
        if (saved) {
            const { date, count } = JSON.parse(saved);
            if (date === new Date().toLocaleDateString()) return count;
        }
        return 0;
    });

    const addWater = () => {
        const newCount = water + 1;
        setWater(newCount);
        localStorage.setItem('waterTracker', JSON.stringify({
            date: new Date().toLocaleDateString(),
            count: newCount
        }));
    };

    // BMI Calculation
    const bmi = calculateBMI(latestWeight?.weight, settings.height);
    const bmiCategory = getBMICategory(bmi);

    // Merge trend data with chart data
    const chartData = [...validWeights].reverse().map(w => {
        const trendPoint = trendData.find(t => t.date === w.date);
        return {
            date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            weight: w.weight,
            trend: trendPoint ? trendPoint.trend : null
        };
    });

    if (validWeights.length === 0 && weights.length === 0) {
        return (
            <div className="text-center py-16 fade-in">
                <Scale className="w-24 h-24 text-rose-light dark:text-sage mx-auto mb-4 opacity-50 float" />
                <h2 className="text-2xl font-bold text-dark-bg dark:text-dark-text mb-2">Start Your Journey</h2>
                <p className="text-sage-dark dark:text-dark-muted mb-6">Record your first weight entry to begin tracking your progress</p>
                <button
                    onClick={() => onNavigate('add')}
                    className="bg-gradient-primary-light dark:bg-gradient-primary-dark hover:opacity-90 text-white px-6 py-3 rounded-xl font-medium theme-transition flex items-center gap-2 mx-auto shadow-glass hover-lift hover-glow"
                >
                    <Plus className="w-5 h-5" />
                    Add First Entry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Motivation Banner */}
            <div className={`p-4 rounded-2xl shadow-glass dark:shadow-glass-dark theme-transition slide-in-top flex items-center gap-3
                ${streak > 2 ? 'bg-gradient-to-r from-orange-100 to-rose-100 dark:from-orange-900/20 dark:to-rose-900/20' : 'glass'}`}>
                <div className={`p-2 rounded-xl ${streak > 2 ? 'bg-orange-500 text-white' : 'bg-sage/20 text-sage'}`}>
                    {streak > 2 ? <Flame className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
                </div>
                <div>
                    <h3 className="font-bold text-dark-bg dark:text-dark-text text-sm">{motivation}</h3>
                    {streak > 0 && <p className="text-xs text-sage-dark dark:text-dark-muted">You're on a {streak}-day streak!</p>}
                </div>
            </div>

            {/* Daily Goals & Water Tracker */}
            <div className="grid grid-cols-2 gap-4 stagger-children slide-in-bottom" style={{ animationDelay: '0.1s' }}>
                <div className="glass rounded-2xl p-5 shadow-glass dark:shadow-glass-dark theme-transition hover-lift hover-glow">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sage-dark dark:text-rose-light text-sm font-semibold">Calorie Target</span>
                        <Utensils className="w-5 h-5 text-sage dark:text-rose-light" />
                    </div>
                    <p className="text-2xl font-bold text-dark-bg dark:text-dark-text mb-1">
                        {calorieTarget > 0 ? calorieTarget : '-'} <span className="text-xs font-medium opacity-60">kcal</span>
                    </p>
                    <p className="text-xs text-sage-dark dark:text-dark-muted font-medium">To lose 0.5kg/week</p>
                </div>

                <div className="glass rounded-2xl p-5 shadow-glass dark:shadow-glass-dark theme-transition hover-lift hover-glow cursor-pointer" onClick={addWater}>
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sage-dark dark:text-blue-400 text-sm font-semibold">Water</span>
                        <Droplets className="w-5 h-5 text-blue-500" />
                    </div>
                    <div className="flex items-end gap-2 mb-1">
                        <p className="text-3xl font-bold text-dark-bg dark:text-dark-text">{water}</p>
                        <p className="text-sm font-medium text-sage-dark dark:text-dark-muted mb-1.5">/ 8</p>
                    </div>
                    <div className="w-full bg-sage/10 dark:bg-dark-surface rounded-full h-2 mt-2 overflow-hidden">
                        <div
                            className="bg-blue-500 h-full rounded-full transition-all duration-500 ease-out"
                            style={{ width: `${Math.min((water / 8) * 100, 100)}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 stagger-children">
                <div className="glass rounded-2xl p-5 shadow-glass dark:shadow-glass-dark theme-transition hover-lift hover-glow col-span-2 md:col-span-1">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sage-dark dark:text-rose-light text-sm font-semibold">Current</span>
                        <Scale className="w-5 h-5 text-sage dark:text-rose-light" />
                    </div>
                    <p className="text-3xl font-bold text-dark-bg dark:text-dark-text mb-1">{latestWeight.weight} <span className="text-xs font-medium opacity-60">{settings.unit}</span></p>
                    <p className="text-xs text-sage-dark dark:text-dark-muted font-medium trunc">{new Date(latestWeight.date).toLocaleDateString()}</p>
                </div>

                <div className="glass rounded-2xl p-5 shadow-glass dark:shadow-glass-dark theme-transition hover-lift hover-glow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sage-dark dark:text-rose-light text-sm font-semibold">Streak</span>
                        <Flame className={`w-5 h-5 ${streak > 0 ? 'text-orange-500' : 'text-sage dark:text-sage'}`} />
                    </div>
                    <p className="text-2xl font-bold text-dark-bg dark:text-dark-text mb-1">{streak} <span className="text-xs font-medium opacity-60">days</span></p>
                    <p className="text-xs text-sage-dark dark:text-dark-muted font-medium">Keep it up!</p>
                </div>

                <div className="glass rounded-2xl p-5 shadow-glass dark:shadow-glass-dark theme-transition hover-lift hover-glow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sage-dark dark:text-rose-light text-sm font-semibold">BMI</span>
                        <Activity className="w-5 h-5 text-sage dark:text-sage" />
                    </div>
                    <p className="text-2xl font-bold text-dark-bg dark:text-dark-text mb-1">{bmi}</p>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${bmiCategory.bg} ${bmiCategory.color}`}>
                        {bmiCategory.name}
                    </span>
                </div>

                <div className="glass rounded-2xl p-5 shadow-glass dark:shadow-glass-dark theme-transition hover-lift hover-glow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sage-dark dark:text-rose-light text-sm font-semibold">Weekly Avg</span>
                        <Activity className="w-5 h-5 text-sage dark:text-sage" />
                    </div>
                    <p className="text-2xl font-bold text-dark-bg dark:text-dark-text mb-1">{weeklyAvg || '-'} <span className="text-xs font-medium opacity-60">{settings.unit}</span></p>
                    <p className="text-xs text-sage-dark dark:text-dark-muted font-medium">Last 7 Days</p>
                </div>

                <div className="glass rounded-2xl p-5 shadow-glass dark:shadow-glass-dark theme-transition hover-lift hover-glow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sage-dark dark:text-rose-light text-sm font-semibold">Monthly Avg</span>
                        <Calendar className="w-5 h-5 text-sage dark:text-sage" />
                    </div>
                    <p className="text-2xl font-bold text-dark-bg dark:text-dark-text mb-1">{monthlyAvg || '-'} <span className="text-xs font-medium opacity-60">{settings.unit}</span></p>
                    <p className="text-xs text-sage-dark dark:text-dark-muted font-medium">Last 30 Days</p>
                </div>

                <div className="glass rounded-2xl p-5 shadow-glass dark:shadow-glass-dark theme-transition hover-lift hover-glow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sage-dark dark:text-rose-light text-sm font-semibold">To Target</span>
                        <Target className="w-5 h-5 text-sage dark:text-rose-light" />
                    </div>
                    <p className={`text-2xl font-bold mb-1 ${targetDiff <= 0 ? 'text-sage dark:text-sage' : 'text-rose dark:text-rose-light'}`}>
                        {Math.abs(targetDiff).toFixed(1)} <span className="text-xs font-medium opacity-60">{settings.unit}</span>
                    </p>
                    <p className="text-xs text-sage-dark dark:text-dark-muted font-medium">Goal: {settings.targetWeight}</p>
                </div>
            </div>

            {/* Health & Trends Section */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="glass rounded-2xl p-6 shadow-glass dark:shadow-glass-dark theme-transition hover-lift flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className="text-sage-dark dark:text-rose-light text-sm font-semibold">Total Change</span>
                            {totalChange < 0 && <TrendingDown className="w-4 h-4 text-sage" />}
                        </div>
                        <p className={`text-3xl font-bold ${totalChange <= 0 ? 'text-sage dark:text-sage' : 'text-rose dark:text-rose-light'}`}>
                            {totalChange > 0 ? '+' : ''}{totalChange.toFixed(1)} {settings.unit}
                        </p>
                        <p className="text-xs text-sage-dark dark:text-dark-muted font-medium mt-1">Since start</p>
                    </div>
                    <div className="text-right">
                        <div className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-1 
                            ${healthStatus.status === 'healthy' ? 'bg-sage/20 text-sage' :
                                healthStatus.status === 'aggressive' ? 'bg-rose/20 text-rose' :
                                    'bg-gray-100 dark:bg-gray-700 text-gray-500'}`}>
                            {healthStatus.status.toUpperCase()}
                        </div>
                        <p className="text-xs font-medium text-sage-dark dark:text-dark-muted max-w-[120px]">{healthStatus.message}</p>
                    </div>
                </div>
            </div>

            {/* Progress Chart */}
            {chartData.length > 1 && (
                <div className="glass rounded-2xl p-6 shadow-glass dark:shadow-glass-dark theme-transition fade-in hover-lift">
                    <h3 className="text-lg font-bold text-dark-bg dark:text-dark-text mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-sage dark:text-rose-light" />
                        Progress & Trend
                    </h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#cb748e" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#cb748e" stopOpacity={0} />
                                </linearGradient>
                                <linearGradient id="colorWeightDark" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#73986f" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#73986f" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="currentColor" opacity={0.1} />
                            <XAxis dataKey="date" stroke="currentColor" style={{ fontSize: '12px', fontWeight: '500' }} opacity={0.7} />
                            <YAxis stroke="currentColor" style={{ fontSize: '12px', fontWeight: '500' }} domain={['dataMin - 2', 'dataMax + 2']} opacity={0.7} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'rgba(255, 255, 255, 0.95)',
                                    border: '1px solid #cb748e',
                                    borderRadius: '12px',
                                    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)',
                                    fontWeight: '600'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="weight"
                                stroke="#cb748e"
                                strokeWidth={3}
                                fill="url(#colorWeight)"
                            />
                            <Line
                                type="monotone"
                                dataKey="trend"
                                stroke="#94a3b8" // Slate-400 for a subtle trend line
                                strokeWidth={2}
                                strokeDasharray="5 5"
                                dot={false}
                                activeDot={false}
                                name="Trend"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-4 fade-in">
                <button
                    onClick={() => onNavigate('add')}
                    className="flex-1 bg-gradient-primary-light dark:bg-gradient-primary-dark hover:opacity-90 text-white py-4 rounded-2xl font-semibold theme-transition flex items-center justify-center gap-2 shadow-glass hover-lift hover-glow"
                >
                    <Plus className="w-5 h-5" />
                    Add Weight Entry
                </button>
                <button
                    onClick={() => onNavigate('history')}
                    className="flex-1 glass text-dark-bg dark:text-dark-text py-4 rounded-2xl font-semibold hover:bg-rose/10 dark:hover:bg-sage/10 theme-transition flex items-center justify-center gap-2 shadow-glass dark:shadow-glass-dark hover-lift hover-glow"
                >
                    <History className="w-5 h-5" />
                    View History
                </button>
            </div>
        </div>
    );
}

// Add Weight Component
function AddWeight({ onAdd, onCancel }) {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [weight, setWeight] = useState('');
    const [note, setNote] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = () => {
        setError('');
        const weightNum = parseFloat(weight);

        if (!weight || isNaN(weightNum) || weightNum <= 0) {
            setError('Please enter a valid weight');
            return;
        }

        if (weightNum > 500) {
            setError('Weight seems unrealistic');
            return;
        }

        onAdd({ date, weight: weightNum, note });
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSubmit();
        }
    };

    return (
        <div className="max-w-md mx-auto fade-in">
            <div className="glass rounded-2xl p-6 shadow-glass dark:shadow-glass-dark theme-transition hover-lift">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-rose/20 dark:bg-sage/20 p-3 rounded-2xl hover-glow">
                        <Plus className="w-6 h-6 text-sage dark:text-rose-light" />
                    </div>
                    <h2 className="text-2xl font-bold text-dark-bg dark:text-dark-text">Add Weight Entry</h2>
                </div>

                <div className="space-y-4">
                    <div className="slide-in-bottom" style={{ animationDelay: '0.1s' }}>
                        <label className="block text-sm font-semibold text-sage-dark dark:text-dark-muted mb-2">
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Date
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 bg-white/50 dark:bg-dark-surface/50 border-2 border-rose/30 dark:border-sage/30 rounded-xl focus:ring-2 focus:ring-rose dark:focus:ring-sage focus:border-transparent theme-transition text-dark-bg dark:text-dark-text font-medium"
                        />
                    </div>

                    <div className="slide-in-bottom" style={{ animationDelay: '0.2s' }}>
                        <label className="block text-sm font-semibold text-sage-dark dark:text-dark-muted mb-2">
                            <Scale className="w-4 h-4 inline mr-2" />
                            Weight (kg)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={weight}
                            onChange={(e) => setWeight(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Enter your weight"
                            className="w-full px-4 py-3 bg-white/50 dark:bg-dark-surface/50 border-2 border-rose/30 dark:border-sage/30 rounded-xl focus:ring-2 focus:ring-rose dark:focus:ring-sage focus:border-transparent theme-transition text-dark-bg dark:text-dark-text placeholder:text-sage-dark/50 dark:placeholder:text-dark-muted/50 font-medium"
                        />
                    </div>

                    <div className="slide-in-bottom" style={{ animationDelay: '0.3s' }}>
                        <label className="block text-sm font-semibold text-sage-dark dark:text-dark-muted mb-2">
                            <Activity className="w-4 h-4 inline mr-2" />
                            Note (Optional)
                        </label>
                        <textarea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="e.g. Ate heavy dinner, Post workout..."
                            className="w-full px-4 py-3 bg-white/50 dark:bg-dark-surface/50 border-2 border-rose/30 dark:border-sage/30 rounded-xl focus:ring-2 focus:ring-rose dark:focus:ring-sage focus:border-transparent theme-transition text-dark-bg dark:text-dark-text placeholder:text-sage-dark/50 dark:placeholder:text-dark-muted/50 font-medium resize-none h-24"
                        />
                    </div>

                    {error && (
                        <div className="bg-rose/20 dark:bg-rose/30 text-rose dark:text-rose-light px-4 py-3 rounded-xl text-sm font-medium scale-in">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4 slide-in-bottom" style={{ animationDelay: '0.4s' }}>
                        <button
                            onClick={handleSubmit}
                            className="flex-1 bg-gradient-primary-light dark:bg-gradient-primary-dark hover:opacity-90 text-white py-3 rounded-xl font-semibold theme-transition shadow-glass hover-lift hover-glow"
                        >
                            Save Entry
                        </button>
                        <button
                            onClick={onCancel}
                            className="flex-1 glass text-dark-bg dark:text-dark-text py-3 rounded-xl font-semibold hover:bg-rose/10 dark:hover:bg-sage/10 theme-transition hover-lift"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// History Component
function HistoryPage({ weights, onDelete, unit }) {
    if (weights.length === 0) {
        return (
            <div className="text-center py-16 fade-in">
                <History className="w-24 h-24 text-rose-light dark:text-sage mx-auto mb-4 opacity-50 float" />
                <h2 className="text-2xl font-bold text-dark-bg dark:text-dark-text mb-2">No History Yet</h2>
                <p className="text-sage-dark dark:text-dark-muted">Your weight entries will appear here</p>
            </div>
        );
    }

    return (
        <div>
            <div className="glass rounded-2xl p-6 shadow-glass dark:shadow-glass-dark mb-4 theme-transition fade-in hover-lift">
                <h2 className="text-2xl font-bold text-dark-bg dark:text-dark-text mb-2">Weight History</h2>
                <p className="text-sage-dark dark:text-dark-muted font-medium">{weights.length} entries recorded</p>
            </div>

            <div className="space-y-3">
                {weights.map((entry, index) => {
                    const prevEntry = weights[index + 1];
                    const change = prevEntry ? entry.weight - prevEntry.weight : null;

                    return (
                        <div
                            key={entry.id}
                            className="glass rounded-2xl p-4 shadow-glass dark:shadow-glass-dark flex items-center justify-between theme-transition hover:bg-rose/5 dark:hover:bg-sage/5 hover-lift slide-in-bottom"
                            style={{ animationDelay: `${index * 0.05}s` }}
                        >
                            <div className="flex-1">
                                <p className="font-bold text-dark-bg dark:text-dark-text text-lg">{entry.weight} {unit}</p>
                                <p className="text-sm text-sage-dark dark:text-dark-muted font-medium">{new Date(entry.date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}</p>
                                {entry.note && (
                                    <p className="text-xs text-sage mt-1 italic opacity-80 flex items-center gap-1">
                                        <Activity className="w-3 h-3" />
                                        {entry.note}
                                    </p>
                                )}
                            </div>

                            {change !== null && (
                                <div className={`px-3 py-1 rounded-xl text-sm font-bold mr-3 ${change < 0 ? 'bg-sage/20 dark:bg-sage/30 text-sage-dark dark:text-sage' :
                                    change > 0 ? 'bg-rose/20 dark:bg-rose/30 text-rose dark:text-rose-light' :
                                        'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                                    }`}>
                                    {change > 0 ? '+' : ''}{change.toFixed(1)} {unit}
                                </div>
                            )}

                            <button
                                onClick={() => onDelete(entry.id)}
                                className="p-2 text-rose dark:text-rose-light hover:bg-rose/20 dark:hover:bg-rose/30 rounded-xl theme-transition hover-lift"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

// Settings Component
function SettingsPage({ settings, onUpdate, weights, onImport, onReset }) {
    const [targetWeight, setTargetWeight] = useState(settings.targetWeight);
    const [height, setHeight] = useState(settings.height || 170);
    const [age, setAge] = useState(settings.age || 30);
    const [gender, setGender] = useState(settings.gender || 'female');
    const [activityLevel, setActivityLevel] = useState(settings.activityLevel || 'sedentary');
    const fileInputRef = React.useRef(null);
    const { isDark } = useTheme();

    const handleSave = () => {
        if (targetWeight > 0 && targetWeight < 500 && height > 50 && height < 300) {
            onUpdate({ ...settings, targetWeight, height, age, gender, activityLevel });
        }
    };

    const handleExport = () => {
        const data = {
            weights,
            settings: { ...settings, targetWeight, height, age, gender, activityLevel },
            exportDate: new Date().toISOString()
        };
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `weight-track-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = JSON.parse(event.target.result);
                onImport(data);
                if (data.settings) {
                    setTargetWeight(data.settings.targetWeight);
                    setHeight(data.settings.height || 170);
                    setAge(data.settings.age || 30);
                    setGender(data.settings.gender || 'female');
                    setActivityLevel(data.settings.activityLevel || 'sedentary');
                }
            } catch (error) {
                console.error('Import failed:', error);
                alert('Invalid backup file');
            }
        };
        reader.readAsText(file);
    };

    return (
        <div className="max-w-md mx-auto fade-in">
            <div className="glass rounded-2xl p-6 shadow-glass dark:shadow-glass-dark theme-transition hover-lift">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-rose/20 dark:bg-sage/20 p-3 rounded-2xl hover-glow">
                        <Settings className="w-6 h-6 text-sage dark:text-rose-light" />
                    </div>
                    <h2 className="text-2xl font-bold text-dark-bg dark:text-dark-text">Settings</h2>
                </div>

                <div className="space-y-6">
                    <div className="slide-in-bottom" style={{ animationDelay: '0.1s' }}>
                        <h3 className="text-sm font-bold text-sage-dark dark:text-rose-light mb-4 flex items-center gap-2">
                            <Target className="w-4 h-4" />
                            Goals & Body Metrics
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-semibold text-sage-dark dark:text-dark-muted mb-2">
                                    Target Weight (kg)
                                </label>
                                <input
                                    type="number"
                                    step="0.1"
                                    value={targetWeight}
                                    onChange={(e) => setTargetWeight(parseFloat(e.target.value))}
                                    className="w-full px-4 py-3 bg-white/50 dark:bg-dark-surface/50 border-2 border-rose/30 dark:border-sage/30 rounded-xl focus:ring-2 focus:ring-rose dark:focus:ring-sage focus:border-transparent theme-transition text-dark-bg dark:text-dark-text font-medium"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-sage-dark dark:text-dark-muted mb-2">
                                        Height (cm)
                                    </label>
                                    <input
                                        type="number"
                                        value={height}
                                        onChange={(e) => setHeight(parseFloat(e.target.value))}
                                        className="w-full px-4 py-3 bg-white/50 dark:bg-dark-surface/50 border-2 border-rose/30 dark:border-sage/30 rounded-xl focus:ring-2 focus:ring-rose dark:focus:ring-sage focus:border-transparent theme-transition text-dark-bg dark:text-dark-text font-medium"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-sage-dark dark:text-dark-muted mb-2">
                                        Age
                                    </label>
                                    <input
                                        type="number"
                                        value={age}
                                        onChange={(e) => setAge(parseFloat(e.target.value))}
                                        className="w-full px-4 py-3 bg-white/50 dark:bg-dark-surface/50 border-2 border-rose/30 dark:border-sage/30 rounded-xl focus:ring-2 focus:ring-rose dark:focus:ring-sage focus:border-transparent theme-transition text-dark-bg dark:text-dark-text font-medium"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-sage-dark dark:text-dark-muted mb-2">
                                        Gender
                                    </label>
                                    <select
                                        value={gender}
                                        onChange={(e) => setGender(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/50 dark:bg-dark-surface/50 border-2 border-rose/30 dark:border-sage/30 rounded-xl focus:ring-2 focus:ring-rose dark:focus:ring-sage focus:border-transparent theme-transition text-dark-bg dark:text-dark-text font-medium"
                                    >
                                        <option value="female">Female</option>
                                        <option value="male">Male</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-sage-dark dark:text-dark-muted mb-2">
                                        Activity Level
                                    </label>
                                    <select
                                        value={activityLevel}
                                        onChange={(e) => setActivityLevel(e.target.value)}
                                        className="w-full px-4 py-3 bg-white/50 dark:bg-dark-surface/50 border-2 border-rose/30 dark:border-sage/30 rounded-xl focus:ring-2 focus:ring-rose dark:focus:ring-sage focus:border-transparent theme-transition text-dark-bg dark:text-dark-text font-medium text-sm"
                                    >
                                        <option value="sedentary">Sedentary (Little exercise)</option>
                                        <option value="light">Light (1-3 days/week)</option>
                                        <option value="moderate">Moderate (3-5 days/week)</option>
                                        <option value="active">Active (6-7 days/week)</option>
                                        <option value="veryActive">Very Active (Physical job)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="slide-in-bottom pt-4 border-t border-rose/20 dark:border-sage/20" style={{ animationDelay: '0.2s' }}>
                        <h3 className="text-sm font-semibold text-sage-dark dark:text-dark-muted mb-3 flex items-center gap-2">
                            Data Management
                        </h3>
                        <div className="flex gap-3">
                            <button
                                onClick={handleExport}
                                className="flex-1 glass text-dark-bg dark:text-dark-text py-3 rounded-xl font-medium hover:bg-rose/10 dark:hover:bg-sage/10 theme-transition flex items-center justify-center gap-2 hover-lift"
                            >
                                <Download className="w-4 h-4" />
                                Export
                            </button>
                            <button
                                onClick={handleImportClick}
                                className="flex-1 glass text-dark-bg dark:text-dark-text py-3 rounded-xl font-medium hover:bg-rose/10 dark:hover:bg-sage/10 theme-transition flex items-center justify-center gap-2 hover-lift"
                            >
                                <Upload className="w-4 h-4" />
                                Import
                            </button>
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileChange}
                                className="hidden"
                                accept=".json"
                            />
                        </div>
                    </div>

                    <div className="slide-in-bottom pt-4 border-t border-rose/20 dark:border-sage/20" style={{ animationDelay: '0.3s' }}>
                        <h3 className="text-sm font-semibold text-rose dark:text-rose-light mb-3 flex items-center gap-2">
                            Danger Zone
                        </h3>
                        <button
                            onClick={onReset}
                            className="w-full glass bg-rose/10 text-rose dark:text-rose-light py-3 rounded-xl font-medium hover:bg-rose/20 theme-transition flex items-center justify-center gap-2 hover-lift"
                        >
                            <Trash2 className="w-4 h-4" />
                            Reset All Data
                        </button>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full bg-gradient-primary-light dark:bg-gradient-primary-dark hover:opacity-90 text-white py-3 rounded-xl font-semibold theme-transition shadow-glass hover-lift hover-glow slide-in-bottom"
                        style={{ animationDelay: '0.35s' }}
                    >
                        Save Settings
                    </button>

                    <div className="pt-6 border-t border-rose/20 dark:border-sage/20 slide-in-bottom" style={{ animationDelay: '0.4s' }}>
                        <h3 className="font-bold text-dark-bg dark:text-dark-text mb-3 flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-sage dark:text-rose-light" />
                            About WeightTrack
                        </h3>
                        <div className="space-y-2 text-sm text-sage-dark dark:text-dark-muted font-medium">
                            <p>📱 Progressive Web App</p>
                            <p>💾 Works offline with IndexedDB</p>
                            <p>📊 Visual progress tracking</p>
                            <p>🎯 Goal-oriented design</p>
                            <p>🌓 Dark & Light mode</p>
                            <p>✨ Premium animations</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Export with Theme Provider
export default function App() {
    return (
        <ThemeProvider>
            <WeightTrackPWA />
        </ThemeProvider>
    );
}

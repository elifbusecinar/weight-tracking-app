import React, { useState, useEffect, createContext, useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Scale, TrendingDown, Plus, History, Settings, Target, Calendar, Trash2, Award, Activity, Moon, Sun, Sparkles } from 'lucide-react';

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
const DB_VERSION = 1;

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
        };
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

// Main App Component
function WeightTrackPWA() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [weights, setWeights] = useState([]);
    const [settings, setSettings] = useState({ targetWeight: 70, unit: 'kg' });
    const [loading, setLoading] = useState(true);
    const { isDark, toggleTheme } = useTheme();

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [weightsData, settingsData] = await Promise.all([
                getAllWeights(),
                getSettings()
            ]);
            setWeights(weightsData.sort((a, b) => new Date(b.date) - new Date(a.date)));
            setSettings(settingsData);
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

    const handleUpdateSettings = async (newSettings) => {
        try {
            await saveSettings(newSettings);
            setSettings(newSettings);
        } catch (error) {
            console.error('Error updating settings:', error);
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
                                    WeightTrack
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
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-6 relative z-10">
                {currentPage === 'dashboard' && (
                    <Dashboard weights={weights} settings={settings} onNavigate={setCurrentPage} />
                )}
                {currentPage === 'add' && (
                    <AddWeight onAdd={handleAddWeight} onCancel={() => setCurrentPage('dashboard')} />
                )}
                {currentPage === 'history' && (
                    <HistoryPage weights={weights} onDelete={handleDeleteWeight} unit={settings.unit} />
                )}
                {currentPage === 'settings' && (
                    <SettingsPage settings={settings} onUpdate={handleUpdateSettings} />
                )}
            </main>
        </div>
    );
}

// Dashboard Component
function Dashboard({ weights, settings, onNavigate }) {
    const latestWeight = weights[0];
    const oldestWeight = weights[weights.length - 1];
    const totalChange = latestWeight && oldestWeight ? latestWeight.weight - oldestWeight.weight : 0;
    const targetDiff = latestWeight ? latestWeight.weight - settings.targetWeight : 0;

    const chartData = [...weights].reverse().map(w => ({
        date: new Date(w.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        weight: w.weight
    }));

    if (weights.length === 0) {
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
            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 stagger-children">
                <div className="glass rounded-2xl p-6 shadow-glass dark:shadow-glass-dark theme-transition hover-lift hover-glow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sage-dark dark:text-rose-light text-sm font-semibold">Current Weight</span>
                        <Scale className="w-5 h-5 text-sage dark:text-rose-light" />
                    </div>
                    <p className="text-4xl font-bold text-dark-bg dark:text-dark-text mb-1">{latestWeight.weight} {settings.unit}</p>
                    <p className="text-xs text-sage-dark dark:text-dark-muted font-medium">{new Date(latestWeight.date).toLocaleDateString()}</p>
                </div>

                <div className="glass rounded-2xl p-6 shadow-glass dark:shadow-glass-dark theme-transition hover-lift hover-glow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sage-dark dark:text-rose-light text-sm font-semibold">Total Change</span>
                        <TrendingDown className="w-5 h-5 text-sage dark:text-sage" />
                    </div>
                    <p className={`text-4xl font-bold mb-1 ${totalChange <= 0 ? 'text-sage dark:text-sage' : 'text-rose dark:text-rose-light'}`}>
                        {totalChange > 0 ? '+' : ''}{totalChange.toFixed(1)} {settings.unit}
                    </p>
                    <p className="text-xs text-sage-dark dark:text-dark-muted font-medium">Since {new Date(oldestWeight.date).toLocaleDateString()}</p>
                </div>

                <div className="glass rounded-2xl p-6 shadow-glass dark:shadow-glass-dark theme-transition hover-lift hover-glow">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sage-dark dark:text-rose-light text-sm font-semibold">To Target</span>
                        <Target className="w-5 h-5 text-sage dark:text-rose-light" />
                    </div>
                    <p className={`text-4xl font-bold mb-1 ${targetDiff <= 0 ? 'text-sage dark:text-sage' : 'text-rose dark:text-rose-light'}`}>
                        {Math.abs(targetDiff).toFixed(1)} {settings.unit}
                    </p>
                    <p className="text-xs text-sage-dark dark:text-dark-muted font-medium">Target: {settings.targetWeight} {settings.unit}</p>
                </div>
            </div>

            {/* Progress Chart */}
            {chartData.length > 1 && (
                <div className="glass rounded-2xl p-6 shadow-glass dark:shadow-glass-dark theme-transition fade-in hover-lift">
                    <h3 className="text-lg font-bold text-dark-bg dark:text-dark-text mb-4 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-sage dark:text-rose-light" />
                        Progress Chart
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

        onAdd({ date, weight: weightNum });
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

                    {error && (
                        <div className="bg-rose/20 dark:bg-rose/30 text-rose dark:text-rose-light px-4 py-3 rounded-xl text-sm font-medium scale-in">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4 slide-in-bottom" style={{ animationDelay: '0.3s' }}>
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
function SettingsPage({ settings, onUpdate }) {
    const [targetWeight, setTargetWeight] = useState(settings.targetWeight);
    const { isDark } = useTheme();

    const handleSave = () => {
        if (targetWeight > 0 && targetWeight < 500) {
            onUpdate({ ...settings, targetWeight });
        }
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
                        <label className="block text-sm font-semibold text-sage-dark dark:text-dark-muted mb-2">
                            <Target className="w-4 h-4 inline mr-2" />
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

                    <div className="slide-in-bottom" style={{ animationDelay: '0.2s' }}>
                        <label className="block text-sm font-semibold text-sage-dark dark:text-dark-muted mb-2">Unit</label>
                        <div className="bg-rose/10 dark:bg-sage/10 px-4 py-3 rounded-xl">
                            <p className="text-dark-bg dark:text-dark-text font-medium">Kilograms (kg)</p>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full bg-gradient-primary-light dark:bg-gradient-primary-dark hover:opacity-90 text-white py-3 rounded-xl font-semibold theme-transition shadow-glass hover-lift hover-glow slide-in-bottom"
                        style={{ animationDelay: '0.3s' }}
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

import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts';
import { Scale, TrendingDown, Plus, History, Settings, Target, Calendar, Trash2, Award, Activity } from 'lucide-react';

// IndexedDB utility
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
export default function WeightTrackPWA() {
    const [currentPage, setCurrentPage] = useState('dashboard');
    const [weights, setWeights] = useState([]);
    const [settings, setSettings] = useState({ targetWeight: 70, unit: 'kg' });
    const [loading, setLoading] = useState(true);

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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
                <div className="text-center">
                    <Scale className="w-16 h-16 text-indigo-600 mx-auto mb-4 animate-pulse" />
                    <p className="text-gray-600">Loading WeightTrack...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            {/* Header */}
            <header className="bg-white shadow-sm sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Scale className="w-8 h-8 text-indigo-600" />
                            <h1 className="text-2xl font-bold text-gray-800">WeightTrack</h1>
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCurrentPage('dashboard')}
                                className={`p-2 rounded-lg transition ${currentPage === 'dashboard' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <Activity className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setCurrentPage('add')}
                                className={`p-2 rounded-lg transition ${currentPage === 'add' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <Plus className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setCurrentPage('history')}
                                className={`p-2 rounded-lg transition ${currentPage === 'history' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <History className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setCurrentPage('settings')}
                                className={`p-2 rounded-lg transition ${currentPage === 'settings' ? 'bg-indigo-100 text-indigo-600' : 'text-gray-600 hover:bg-gray-100'}`}
                            >
                                <Settings className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-4xl mx-auto px-4 py-6">
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
            <div className="text-center py-16">
                <Scale className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">Start Your Journey</h2>
                <p className="text-gray-500 mb-6">Record your first weight entry to begin tracking your progress</p>
                <button
                    onClick={() => onNavigate('add')}
                    className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-indigo-700 transition flex items-center gap-2 mx-auto"
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 text-sm font-medium">Current Weight</span>
                        <Scale className="w-5 h-5 text-indigo-600" />
                    </div>
                    <p className="text-3xl font-bold text-gray-800">{latestWeight.weight} {settings.unit}</p>
                    <p className="text-xs text-gray-500 mt-1">{new Date(latestWeight.date).toLocaleDateString()}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 text-sm font-medium">Total Change</span>
                        <TrendingDown className="w-5 h-5 text-green-600" />
                    </div>
                    <p className={`text-3xl font-bold ${totalChange <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                        {totalChange > 0 ? '+' : ''}{totalChange.toFixed(1)} {settings.unit}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Since {new Date(oldestWeight.date).toLocaleDateString()}</p>
                </div>

                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-600 text-sm font-medium">To Target</span>
                        <Target className="w-5 h-5 text-purple-600" />
                    </div>
                    <p className={`text-3xl font-bold ${targetDiff <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                        {Math.abs(targetDiff).toFixed(1)} {settings.unit}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">Target: {settings.targetWeight} {settings.unit}</p>
                </div>
            </div>

            {/* Progress Chart */}
            {chartData.length > 1 && (
                <div className="bg-white rounded-xl p-6 shadow-sm">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Progress Chart</h3>
                    <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={chartData}>
                            <defs>
                                <linearGradient id="colorWeight" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                            <XAxis dataKey="date" stroke="#6b7280" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} domain={['dataMin - 2', 'dataMax + 2']} />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: 'white',
                                    border: '1px solid #e5e7eb',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                }}
                            />
                            <Area type="monotone" dataKey="weight" stroke="#6366f1" strokeWidth={2} fill="url(#colorWeight)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            )}

            {/* Quick Actions */}
            <div className="flex gap-4">
                <button
                    onClick={() => onNavigate('add')}
                    className="flex-1 bg-indigo-600 text-white py-4 rounded-xl font-medium hover:bg-indigo-700 transition flex items-center justify-center gap-2 shadow-sm"
                >
                    <Plus className="w-5 h-5" />
                    Add Weight Entry
                </button>
                <button
                    onClick={() => onNavigate('history')}
                    className="flex-1 bg-white text-gray-700 py-4 rounded-xl font-medium hover:bg-gray-50 transition flex items-center justify-center gap-2 shadow-sm border border-gray-200"
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
        <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-indigo-100 p-3 rounded-lg">
                        <Plus className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Add Weight Entry</h2>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="w-4 h-4 inline mr-2" />
                            Date
                        </label>
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            max={new Date().toISOString().split('T')[0]}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
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
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    {error && (
                        <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            onClick={handleSubmit}
                            className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
                        >
                            Save Entry
                        </button>
                        <button
                            onClick={onCancel}
                            className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-200 transition"
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
            <div className="text-center py-16">
                <History className="w-24 h-24 text-gray-300 mx-auto mb-4" />
                <h2 className="text-2xl font-semibold text-gray-700 mb-2">No History Yet</h2>
                <p className="text-gray-500">Your weight entries will appear here</p>
            </div>
        );
    }

    return (
        <div>
            <div className="bg-white rounded-xl p-6 shadow-sm mb-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-2">Weight History</h2>
                <p className="text-gray-600">{weights.length} entries recorded</p>
            </div>

            <div className="space-y-3">
                {weights.map((entry, index) => {
                    const prevEntry = weights[index + 1];
                    const change = prevEntry ? entry.weight - prevEntry.weight : null;

                    return (
                        <div key={entry.id} className="bg-white rounded-xl p-4 shadow-sm flex items-center justify-between">
                            <div className="flex-1">
                                <p className="font-semibold text-gray-800 text-lg">{entry.weight} {unit}</p>
                                <p className="text-sm text-gray-500">{new Date(entry.date).toLocaleDateString('en-US', {
                                    weekday: 'short',
                                    year: 'numeric',
                                    month: 'short',
                                    day: 'numeric'
                                })}</p>
                            </div>

                            {change !== null && (
                                <div className={`px-3 py-1 rounded-lg text-sm font-medium mr-3 ${change < 0 ? 'bg-green-100 text-green-700' :
                                        change > 0 ? 'bg-orange-100 text-orange-700' :
                                            'bg-gray-100 text-gray-700'
                                    }`}>
                                    {change > 0 ? '+' : ''}{change.toFixed(1)} {unit}
                                </div>
                            )}

                            <button
                                onClick={() => onDelete(entry.id)}
                                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
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

    const handleSave = () => {
        if (targetWeight > 0 && targetWeight < 500) {
            onUpdate({ ...settings, targetWeight });
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                    <div className="bg-indigo-100 p-3 rounded-lg">
                        <Settings className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-800">Settings</h2>
                </div>

                <div className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            <Target className="w-4 h-4 inline mr-2" />
                            Target Weight (kg)
                        </label>
                        <input
                            type="number"
                            step="0.1"
                            value={targetWeight}
                            onChange={(e) => setTargetWeight(parseFloat(e.target.value))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Unit</label>
                        <div className="bg-gray-50 px-4 py-3 rounded-lg">
                            <p className="text-gray-600">Kilograms (kg)</p>
                        </div>
                    </div>

                    <button
                        onClick={handleSave}
                        className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
                    >
                        Save Settings
                    </button>

                    <div className="pt-6 border-t border-gray-200">
                        <h3 className="font-semibold text-gray-800 mb-3">About WeightTrack</h3>
                        <div className="space-y-2 text-sm text-gray-600">
                            <p>📱 Progressive Web App</p>
                            <p>💾 Works offline with IndexedDB</p>
                            <p>📊 Visual progress tracking</p>
                            <p>🎯 Goal-oriented design</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

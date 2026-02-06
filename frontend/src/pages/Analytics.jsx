import React, { useEffect, useState } from 'react';
import api from '../services/api';
import Navbar from '../components/Navbar';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
    BarChart,
    Bar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from 'recharts';

const Analytics = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));

    useEffect(() => {
        const fetchData = async () => {
            try {
                const analyticsData = await api.getAnalytics();
                // Transform topic mastery for chart
                const radarData = Object.entries(analyticsData.topicMastery || {}).map(([subject, A]) => ({
                    subject,
                    A: Math.round(A * 100) / 100,
                    fullMark: 100,
                }));

                // Transform recent submissions for line chart
                const lineData = analyticsData.recentSubmissions?.map((sub, index) => ({
                    name: `Quiz ${index + 1}`,
                    score: sub.score,
                    accuracy: sub.accuracy,
                    speed: sub.typingSpeed
                })).reverse() || [];

                setData({ ...analyticsData, radarData, lineData });
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-primary">
                <Navbar user={user} />
                <div className="flex-center" style={{ height: '80vh' }}>
                    <div className="text-xl">Loading analytics...</div>
                </div>
            </div>
        );
    }

    if (!data) {
        return (
            <div className="min-h-screen bg-primary">
                <Navbar user={user} />
                <div className="flex-center" style={{ height: '80vh' }}>
                    <div className="text-xl">No analytics data available yet. Take some quizzes!</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-primary">
            <Navbar user={user} />

            <div className="container-fluid" style={{ padding: '2rem 2rem' }}>
                <h1 className="text-3xl font-bold mb-8">Performance Analytics</h1>

                {/* Overview Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="card">
                        <h3 className="text-gray-400 text-sm font-medium mb-2">Average Score</h3>
                        <div className="text-2xl font-bold text-accent">{Math.round(data.averageScore)}%</div>
                    </div>
                    <div className="card">
                        <h3 className="text-gray-400 text-sm font-medium mb-2">Average Accuracy</h3>
                        <div className="text-2xl font-bold text-green-400">{Math.round(data.averageAccuracy)}%</div>
                    </div>
                    <div className="card">
                        <h3 className="text-gray-400 text-sm font-medium mb-2">Avg Speed</h3>
                        <div className="text-2xl font-bold text-blue-400">{Math.round(data.averageTypingSpeed)} WPM</div>
                    </div>
                    <div className="card">
                        <h3 className="text-gray-400 text-sm font-medium mb-2">Total Quizzes</h3>
                        <div className="text-2xl font-bold text-purple-400">{data.totalQuizzes}</div>
                    </div>
                    <div className="card" style={{ borderColor: 'var(--accent)', borderWidth: '1px' }}>
                        <h3 className="text-gray-400 text-sm font-medium mb-2">Current Streak</h3>
                        <div className="text-2xl font-bold text-accent flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                            {data.currentStreak || 0} Days 🔥
                        </div>
                    </div>
                </div>

                <div className="analytics-grid">
                    {/* Performance Trend */}
                    <div className="card">
                        <h3 className="text-xl font-bold mb-6">Performance Trend</h3>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.lineData}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                                    <XAxis dataKey="name" stroke="#9ca3af" />
                                    <YAxis stroke="#9ca3af" />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Legend />
                                    <Line type="monotone" dataKey="score" stroke="#8b5cf6" strokeWidth={2} activeDot={{ r: 8 }} />
                                    <Line type="monotone" dataKey="accuracy" stroke="#10b981" strokeWidth={2} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Topic Mastery */}
                    <div className="card">
                        <h3 className="text-xl font-bold mb-6">Topic Mastery</h3>
                        <div style={{ height: '300px' }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data.radarData}>
                                    <PolarGrid stroke="#374151" />
                                    <PolarAngleAxis dataKey="subject" stroke="#9ca3af" />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} stroke="#374151" />
                                    <Radar
                                        name="Mastery"
                                        dataKey="A"
                                        stroke="#8b5cf6"
                                        fill="#8b5cf6"
                                        fillOpacity={0.6}
                                    />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#1f2937', border: 'none' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                </RadarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Analytics;

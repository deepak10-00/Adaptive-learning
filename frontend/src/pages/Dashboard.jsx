import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import ProfessorDashboard from './ProfessorDashboard';
import HODDashboard from './HODDashboard';
import { BookOpen, TrendingUp, Award, Clock } from 'lucide-react';

const Dashboard = () => {
    const [recommendation, setRecommendation] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(true);

    const user = JSON.parse(localStorage.getItem('user') || '{}');

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [recRes, analyticsRes] = await Promise.all([
                    api.getRecommendation(user.id),
                    api.getAnalytics()
                ]);
                setRecommendation(recRes);

                // Transform Backend DTO to Dashboard format
                const transformedAnalytics = {
                    average_speed: Math.round(analyticsRes.averageTypingSpeed || 0),
                    accuracy: Math.round(analyticsRes.averageAccuracy || 0),
                    currentStreak: analyticsRes.currentStreak || 0,
                    // Transform topic mastery map to array
                    skills_mastery: Object.entries(analyticsRes.topicMastery || {}).map(([name, level]) => ({
                        name,
                        level: Math.round(level)
                    })),
                    // Transform recent submissions
                    recent_activity: analyticsRes.recentSubmissions?.map(sub => ({
                        type: 'Quiz',
                        subject: 'General Quiz', // or parse from mastery
                        score: sub.score,
                        date: new Date(sub.submittedAt).toLocaleDateString()
                    })) || [],
                    // Module progress is not yet in backend, keep empty or mock
                    module_progress: []
                };
                setAnalytics(transformedAnalytics);
            } catch (err) {
                console.error("Failed to load dashboard data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [user.id]);

    if (loading) {
        return <div className="flex-center" style={{ height: '100vh', flexDirection: 'column', gap: '1rem' }}>
            <div className="loader"></div>
            <div>Loading insights...</div>
        </div>;
    }

    if (!analytics) {
        return (
            <div className="flex-center" style={{ height: '100vh', flexDirection: 'column', gap: '1rem' }}>
                <h2 className="text-xl font-bold text-error">Unable to load dashboard</h2>
                <p className="text-secondary">We couldn't fetch your progress data. Please try refreshing.</p>
                <button onClick={() => window.location.reload()} className="btn btn-primary">Refresh Page</button>
            </div>
        );
    }

    // Role-based Switching
    if (user.role === 'PROFESSOR') {
        return <ProfessorDashboard user={user} />;
    }
    if (user.role === 'HOD') {
        return <HODDashboard user={user} />;
    }

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar user={user} />

            <div className="container-fluid" style={{ flex: 1, paddingBottom: '2rem' }}>
                <header className="mb-8">
                    <div className="flex-center" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 className="text-2xl font-bold mb-1">Welcome back, {user.name || user.email?.split('@')[0]}</h1>
                            <p className="text-secondary">Track your progress and mastery.</p>
                        </div>
                        <span className="badge badge-success">
                            {user.role || 'STUDENT'}
                        </span>
                    </div>
                </header>

                <div className="analytics-grid">
                    {/* Left Column: Progress & Modules */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Core Stats Row */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                            <div className="card">
                                <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span className="stat-label">Avg Speed</span>
                                    <Clock size={18} className="text-accent" />
                                </div>
                                <div className="stat-value">{analytics?.average_speed || 0} <span className="text-sm font-normal text-secondary">WPM</span></div>
                            </div>
                            <div className="card">
                                <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span className="stat-label">Accuracy</span>
                                    <Award size={18} className="text-success" />
                                </div>
                                <div className="stat-value">{analytics?.accuracy || 0}%</div>
                            </div>
                            <div className="card" style={{ borderColor: 'var(--accent)', borderWidth: '1px' }}>
                                <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span className="stat-label">Streak</span>
                                    <TrendingUp size={18} className="text-accent" />
                                </div>
                                <div className="stat-value text-accent">{analytics?.currentStreak || 0} <span className="text-sm font-normal text-secondary">Days</span></div>
                            </div>
                        </div>

                        {/* Recommendation Card */}
                        <div className="card" style={{ background: 'linear-gradient(135deg, var(--bg-secondary), rgba(56, 189, 248, 0.15))', borderColor: 'var(--accent)' }}>
                            <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '1rem', marginBottom: '1rem' }}>
                                <div style={{ padding: '0.75rem', background: 'rgba(56,189,248,0.2)', borderRadius: '0.5rem' }}>
                                    <BookOpen className="text-accent" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold" style={{ margin: 0 }}>Recommended Path</h3>
                                    <span className="text-sm text-secondary">Prioritized for your growth</span>
                                </div>
                            </div>

                            <div className="mb-4">
                                {recommendation?.recommended_subjects && recommendation.recommended_subjects.length > 0 ? (
                                    <ul style={{ listStyle: 'none', padding: 0 }}>
                                        {recommendation.recommended_subjects.map((course, idx) => (
                                            <li key={idx} className="flex-center mb-2" style={{ justifyContent: 'flex-start', gap: '0.75rem', padding: '0.5rem', background: 'var(--bg-primary)', borderRadius: '0.5rem' }}>
                                                <div style={{ width: '8px', height: '8px', background: 'var(--accent)', borderRadius: '50%' }}></div>
                                                <span className="text-md font-bold">{course}</span>
                                            </li>
                                        ))}
                                    </ul>
                                ) : (
                                    <div className="text-xl font-bold text-accent mb-2">
                                        {recommendation?.recommended_subject || "General Assessment"}
                                    </div>
                                )}
                            </div>
                            <button className="btn btn-primary w-full">Continue Learning</button>
                        </div>

                        {/* Module Progress */}
                        <div className="card">
                            <h3 className="text-lg font-bold mb-4 flex-center" style={{ justifyContent: 'space-between' }}>
                                Module Progress <span className="text-sm text-secondary font-normal">Current Term</span>
                            </h3>
                            <div className="activity-list">
                                {analytics?.module_progress?.map((mod) => (
                                    <div key={mod.id} style={{ marginBottom: '1rem' }}>
                                        <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                            <span className="font-bold">{mod.name}</span>
                                            <span className={`badge ${mod.status === 'Completed' ? 'badge-success' : 'badge-warning'}`}>{mod.status}</span>
                                        </div>
                                        <div className="progress-container">
                                            <div className="progress-bar" style={{ width: `${mod.progress}%`, background: mod.status === 'Completed' ? 'var(--success)' : 'var(--accent)' }}></div>
                                        </div>
                                        <div className="text-right text-xs text-secondary mt-1">{mod.progress}% Completed</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Right Column: Mastery & History */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>

                        {/* Skill Mastery */}
                        <div className="card">
                            <h3 className="text-lg font-bold mb-4 flex-center" style={{ gap: '0.5rem' }}>
                                <TrendingUp size={20} className="text-accent" /> Skill Mastery
                            </h3>
                            {analytics?.skills_mastery?.map((skill, idx) => (
                                <div key={idx} className="skill-item">
                                    <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.25rem' }}>
                                        <span>{skill.name}</span>
                                        <span className="text-sm font-bold text-accent">{skill.level}/100</span>
                                    </div>
                                    <div className="progress-container" style={{ height: '0.5rem' }}>
                                        <div className="progress-bar" style={{ width: `${skill.level}%`, background: `hsl(${skill.level * 1.2}, 70%, 50%)` }}></div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activity */}
                        <div className="card">
                            <h3 className="text-lg font-bold mb-4">Recent Activity</h3>
                            <div className="activity-list">
                                {analytics?.recent_activity?.map((act, idx) => (
                                    <div key={idx} className={`activity-item ${act.progress === 'Completed' ? 'completed' : ''}`}>
                                        <div className="flex-center" style={{ justifyContent: 'space-between' }}>
                                            <span className="text-sm text-secondary">{act.type}</span>
                                            <span className="text-xs text-secondary">{act.date}</span>
                                        </div>
                                        <div className="text-md font-bold mt-1">{act.subject}</div>
                                        {act.score && <div className="text-sm text-success mt-1">Score: {act.score}%</div>}
                                        {act.progress && <div className="text-sm text-accent mt-1">{act.progress}</div>}
                                    </div>
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;

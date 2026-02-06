import React from 'react';
import Navbar from '../components/Navbar';
import { api } from '../services/api'; // Import api to use updateProfile
import { User, Mail, Shield, BookOpen, Clock, Award } from 'lucide-react';

const Profile = () => {
    // Initialize state from local storage or defaults
    const [user, setUser] = React.useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [isEditing, setIsEditing] = React.useState(false);
    const [formData, setFormData] = React.useState({
        name: user.name || '',
        email: user.email || '',
        password: '' // Only for updates
    });
    const [message, setMessage] = React.useState({ text: '', type: '' });
    const [stats, setStats] = React.useState(null);

    // Fetch stats on mount
    React.useEffect(() => {
        const fetchStats = async () => {
            try {
                const data = await api.getAnalytics();
                setStats(data);
            } catch (error) {
                console.error("Failed to load profile stats", error);
            }
        };
        fetchStats();
    }, []);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
        // Reset form to current user data on cancel, clear password
        if (!isEditing) {
            setFormData({ ...formData, name: user.name, password: '' });
            setMessage({ text: '', type: '' });
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage({ text: 'Updating...', type: 'info' });

        try {
            const updatedUser = await api.updateProfile({
                email: user.email,
                name: formData.name,
                password: formData.password
            });

            // Update local storage and state
            const newUserState = { ...user, name: updatedUser.name };
            localStorage.setItem('user', JSON.stringify(newUserState));
            setUser(newUserState);
            setIsEditing(false);
            setMessage({ text: 'Profile updated successfully!', type: 'success' });

            // Clear success message after 3 seconds
            setTimeout(() => setMessage({ text: '', type: '' }), 3000);
        } catch (err) {
            console.error("Failed to update profile", err);
            setMessage({ text: 'Failed to update profile. Please try again.', type: 'error' });
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar user={user} />
            <div className="container-fluid" style={{ padding: '2rem', flex: 1 }}>
                <h1 className="text-2xl font-bold mb-6">User Profile</h1>

                <div className="profile-grid">
                    {/* Left Column: Profile Details */}
                    <div className="card">
                        <div className="flex-center" style={{ flexDirection: 'column', marginBottom: '2rem' }}>
                            <div style={{
                                width: '100px',
                                height: '100px',
                                borderRadius: '50%',
                                background: 'var(--primary)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                marginBottom: '1rem',
                                border: '4px solid var(--bg-secondary)'
                            }}>
                                <User size={50} color="white" />
                            </div>
                            <h2 className="text-2xl font-bold">{user.name || 'Student Name'}</h2>
                            <span className="badge mt-2" style={{
                                background: 'var(--accent)',
                                color: 'white',
                                padding: '0.25rem 1rem',
                                borderRadius: '999px',
                                fontSize: '0.875rem'
                            }}>
                                {user.role || 'STUDENT'}
                            </span>
                        </div>

                        {message.text && (
                            <div className={`alert mb-4 ${message.type === 'error' ? 'alert-error' : message.type === 'success' ? 'alert-success' : 'alert-info'}`}
                                style={{ textAlign: 'center', color: message.type === 'success' ? 'var(--success)' : message.type === 'error' ? '#ef4444' : 'inherit' }}>
                                {message.text}
                            </div>
                        )}

                        {isEditing ? (
                            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">Full Name</label>
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="input-field w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-400 mb-1">New Password (Optional)</label>
                                    <input
                                        type="password"
                                        name="password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="input-field w-full"
                                        placeholder="Leave blank to keep current"
                                    />
                                </div>
                                <div className="flex gap-4 mt-2">
                                    <button type="submit" className="btn btn-primary flex-1">Save Changes</button>
                                    <button type="button" onClick={handleEditToggle} className="btn btn-secondary flex-1">Cancel</button>
                                </div>
                            </form>
                        ) : (
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
                                    <Mail className="text-secondary" />
                                    <div>
                                        <div className="text-xs text-secondary uppercase tracking-wider">Email Address</div>
                                        <div className="font-medium">{user.email || 'No email found'}</div>
                                    </div>
                                </div>

                                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem' }}>
                                    <Shield className="text-secondary" />
                                    <div>
                                        <div className="text-xs text-secondary uppercase tracking-wider">Account Status</div>
                                        <div className="font-bold text-success">Active</div>
                                    </div>
                                </div>

                                <button onClick={handleEditToggle} className="btn btn-outline w-full mt-4">Edit Profile</button>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Dynamic Stats based on Role */}
                    <div className="flex flex-col gap-6">
                        {user.role === 'HOD' ? (
                            /* HOD View */
                            <>
                                <div className="card">
                                    <h3 className="text-lg font-bold mb-4 flex-center gap-2">
                                        <Shield className="text-accent" size={20} /> Department Overview
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="p-4 bg-gray-800 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem' }}>
                                            <div className="text-3xl font-bold text-purple-400" style={{ fontSize: '1.875rem', color: '#c084fc' }}>12</div>
                                            <div className="text-sm text-gray-400" style={{ color: '#9ca3af' }}>Total Faculty</div>
                                        </div>
                                        <div className="p-4 bg-gray-800 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem' }}>
                                            <div className="text-3xl font-bold text-blue-400" style={{ fontSize: '1.875rem', color: '#60a5fa' }}>450</div>
                                            <div className="text-sm text-gray-400" style={{ color: '#9ca3af' }}>Total Students</div>
                                        </div>
                                        <div className="p-4 bg-gray-800 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem' }}>
                                            <div className="text-3xl font-bold text-green-400" style={{ fontSize: '1.875rem', color: '#4ade80' }}>82%</div>
                                            <div className="text-sm text-gray-400" style={{ color: '#9ca3af' }}>Dept Avg Score</div>
                                        </div>
                                        <div className="p-4 bg-gray-800 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem' }}>
                                            <div className="text-3xl font-bold text-red-400" style={{ fontSize: '1.875rem', color: '#f87171' }}>2</div>
                                            <div className="text-sm text-gray-400" style={{ color: '#9ca3af' }}>Critical Alerts</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card bg-gradient-to-br from-gray-900 to-black border-none" style={{ border: '1px solid var(--border)' }}>
                                    <h3 className="text-lg font-bold mb-4">Administration</h3>
                                    <div className="flex flex-col gap-3">
                                        <button className="btn btn-outline w-full flex-center justify-start gap-2">
                                            <User size={16} /> Manage Professors
                                        </button>
                                        <button className="btn btn-outline w-full flex-center justify-start gap-2">
                                            <Clock size={16} /> Audit Logs
                                        </button>
                                        <button className="btn btn-outline w-full flex-center justify-start gap-2" style={{ borderColor: 'var(--accent)', color: 'var(--accent)' }}>
                                            <Shield size={16} /> System Settings
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : user.role === 'PROFESSOR' ? (
                            /* Professor View */
                            <>
                                <div className="card">
                                    <h3 className="text-lg font-bold mb-4 flex-center gap-2">
                                        <BookOpen className="text-accent" size={20} /> Teaching Overview
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="p-4 bg-gray-800 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem' }}>
                                            <div className="text-3xl font-bold text-purple-400" style={{ fontSize: '1.875rem', color: '#c084fc' }}>3</div>
                                            <div className="text-sm text-gray-400" style={{ color: '#9ca3af' }}>Classes Managed</div>
                                        </div>
                                        <div className="p-4 bg-gray-800 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem' }}>
                                            <div className="text-3xl font-bold text-blue-400" style={{ fontSize: '1.875rem', color: '#60a5fa' }}>120</div>
                                            <div className="text-sm text-gray-400" style={{ color: '#9ca3af' }}>Total Students</div>
                                        </div>
                                        <div className="p-4 bg-gray-800 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem' }}>
                                            <div className="text-3xl font-bold text-green-400" style={{ fontSize: '1.875rem', color: '#4ade80' }}>78%</div>
                                            <div className="text-sm text-gray-400" style={{ color: '#9ca3af' }}>Avg Class Score</div>
                                        </div>
                                        <div className="p-4 bg-gray-800 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem' }}>
                                            <div className="text-3xl font-bold text-yellow-400" style={{ fontSize: '1.875rem', color: '#facc15' }}>5</div>
                                            <div className="text-sm text-gray-400" style={{ color: '#9ca3af' }}>Pending Actions</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card bg-gradient-to-br from-gray-800 to-gray-900 border-none">
                                    <h3 className="text-lg font-bold mb-4">Quick Actions</h3>
                                    <div className="flex flex-col gap-3">
                                        <button className="btn btn-outline w-full flex-center justify-start gap-2">
                                            <BookOpen size={16} /> View Class Reports
                                        </button>
                                        <button className="btn btn-outline w-full flex-center justify-start gap-2">
                                            <User size={16} /> Manage Students
                                        </button>
                                    </div>
                                </div>
                            </>
                        ) : (
                            /* Student View */
                            <>
                                <div className="card">
                                    <h3 className="text-lg font-bold mb-4 flex-center gap-2">
                                        <Award className="text-accent" size={20} /> Performance Summary
                                    </h3>
                                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                        <div className="p-4 bg-gray-800 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem' }}>
                                            <div className="text-3xl font-bold text-purple-400" style={{ fontSize: '1.875rem', color: '#c084fc' }}>{stats?.totalQuizzes || 0}</div>
                                            <div className="text-sm text-gray-400" style={{ color: '#9ca3af' }}>Total Quizzes</div>
                                        </div>
                                        <div className="p-4 bg-gray-800 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem' }}>
                                            <div className="text-3xl font-bold text-blue-400" style={{ fontSize: '1.875rem', color: '#60a5fa' }}>{Math.round(stats?.averageScore || 0)}%</div>
                                            <div className="text-sm text-gray-400" style={{ color: '#9ca3af' }}>Avg Score</div>
                                        </div>
                                        <div className="p-4 bg-gray-800 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem' }}>
                                            <div className="text-3xl font-bold text-green-400" style={{ fontSize: '1.875rem', color: '#4ade80' }}>{Math.round(stats?.averageAccuracy || 0)}%</div>
                                            <div className="text-sm text-gray-400" style={{ color: '#9ca3af' }}>Avg Accuracy</div>
                                        </div>
                                        <div className="p-4 bg-gray-800 rounded-lg text-center" style={{ background: 'rgba(255,255,255,0.05)', padding: '1rem', borderRadius: '0.5rem' }}>
                                            <div className="text-3xl font-bold text-yellow-400" style={{ fontSize: '1.875rem', color: '#facc15' }}>{stats?.currentStreak || 0}</div>
                                            <div className="text-sm text-gray-400" style={{ color: '#9ca3af' }}>Day Streak</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="card bg-gradient-to-br from-gray-800 to-gray-900 border-none">
                                    <h3 className="text-lg font-bold mb-2">Learning Journey</h3>
                                    <p className="text-gray-400 text-sm mb-4">
                                        Keep up the momentum! You represent the top tier of learners in your class.
                                    </p>
                                    <div className="w-full bg-gray-700 h-2 rounded-full overflow-hidden">
                                        <div className="bg-accent h-full" style={{ width: '75%' }}></div>
                                    </div>
                                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                                        <span>Beginner</span>
                                        <span>Expert</span>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Profile;

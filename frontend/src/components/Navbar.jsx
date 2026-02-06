import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Home, BookOpen, LogOut, User, Users } from 'lucide-react';

const Navbar = ({ user }) => {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    return (
        <nav className="navbar" style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '1rem 2rem',
            backgroundColor: 'var(--bg-secondary)',
            borderBottom: '1px solid var(--border)',
            marginBottom: '2rem'
        }}>
            <Link to="/dashboard" className="flex-center" style={{ gap: '0.5rem', textDecoration: 'none', color: 'inherit' }}>
                <BookOpen className="text-accent" size={24} />
                <span style={{ fontSize: '1.25rem', fontWeight: 'bold' }}>AdaptiveLearn</span>
            </Link>

            <div className="flex-center" style={{ gap: '2rem' }}>
                {(user?.role !== 'PROFESSOR' && user?.role !== 'HOD') && (
                    <Link to="/quiz" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        fontWeight: '500'
                    }}>
                        <BookOpen size={18} /> Assessment
                    </Link>
                )}

                {(user?.role !== 'PROFESSOR' && user?.role !== 'HOD') && (
                    <Link to="/analytics" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        fontWeight: '500'
                    }}>
                        <Home size={18} /> Analytics
                    </Link>
                )}

                {(user?.role !== 'PROFESSOR' && user?.role !== 'HOD') && (
                    <Link to="/ai-interview" style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        color: 'var(--text-primary)',
                        textDecoration: 'none',
                        fontWeight: '500'
                    }}>
                        <User size={18} /> AI Interview
                    </Link>
                )}

                {/* Class Display for Students */}
                {user?.role === 'STUDENT' && (
                    <Link to="/class" style={{ textDecoration: 'none' }}>
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            padding: '0.25rem 0.75rem',
                            background: 'rgba(59, 130, 246, 0.1)',
                            color: '#60a5fa',
                            borderRadius: '999px',
                            fontSize: '0.875rem',
                            fontWeight: '600',
                            border: '1px solid rgba(59, 130, 246, 0.2)',
                            cursor: 'pointer'
                        }}>
                            <Users size={14} />
                            <span>Class: {user.classId || 'Not Assigned'}</span>
                        </div>
                    </Link>
                )}

                <Link to="/profile" style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    color: 'var(--text-primary)',
                    textDecoration: 'none',
                    fontWeight: '500'
                }}>
                    <User size={18} /> Profile
                </Link>

                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
                    <div className="flex-center" style={{ gap: '0.5rem' }}>
                        <div style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: 'var(--primary)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontWeight: 'bold'
                        }}>
                            <User size={16} />
                        </div>
                        <span className="text-sm hidden-mobile">
                            {user?.name || user?.email?.split('@')[0]}
                        </span>
                    </div>

                    <button
                        onClick={handleLogout}
                        className="btn-ghost"
                        style={{ padding: '0.5rem', color: '#ef4444' }}
                        title="Logout"
                    >
                        <LogOut size={20} />
                    </button>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;

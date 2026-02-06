import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { LogIn, User, GraduationCap, Shield } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            // Role is handled by backend now, assumed null or determined by email if needed, 
            // but actually api.js login function signature was: login: async (email, password, role)
            // We need to update api.js login() to not send role too, or just send null.
            const response = await api.login(email, password, null);

            if (response.success) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));

                // Redirect based on returned user role
                const userRole = response.user.role ? response.user.role.toUpperCase() : '';
                console.log("Login Success. Role:", userRole); // DEBUG LOG

                if (userRole === 'HOD') {
                    console.log("Redirecting to HOD Dashboard");
                    navigate('/hod-dashboard');
                } else if (userRole === 'PROFESSOR') {
                    navigate('/dashboard'); // Prof dashboard
                } else {
                    navigate('/quiz'); // Student dashboard
                }
            } else {
                setError('Login failed');
            }
        } catch (err) {
            setError('Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '100vh' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="text-center mb-4 text-2xl font-bold flex-center" style={{ gap: '0.5rem' }}>
                    <LogIn size={24} className="text-accent" />
                    Welcome Back
                </h2>

                {error && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleLogin}>
                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <input
                            type="email"
                            className="input-field"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="user@university.edu"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <input
                            type="password"
                            className="input-field"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center mt-4 text-sm text-secondary">
                    Don't have an account? <Link to="/register" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Sign Up</Link>
                </p>

                <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: '#666', textAlign: 'center' }}>
                    <p>Default HOD: hod@university.edu / admin123</p>
                </div>
            </div>
        </div>
    );
};

export default Login;

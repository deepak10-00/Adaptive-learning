import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { api } from '../services/api';
import { UserPlus, BookOpen } from 'lucide-react';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        role: 'STUDENT'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();

        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (formData.password.length < 6) {
            setError("Password must be at least 6 characters");
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            // Remove confirmPassword from payload
            const { confirmPassword, ...payload } = formData;
            const response = await api.register(payload);

            // Auto login on success
            if (response.token) {
                localStorage.setItem('token', response.token);
                localStorage.setItem('user', JSON.stringify(response.user));
                if (response.user.role === 'PROFESSOR' || response.user.role === 'HOD') {
                    navigate('/dashboard');
                } else {
                    navigate('/quiz');
                }
            } else {
                navigate('/login');
            }
        } catch (err) {
            setError('Registration failed. Email may already be in use.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-center" style={{ minHeight: '100vh' }}>
            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 className="text-center mb-4 text-2xl font-bold flex-center" style={{ gap: '0.5rem' }}>
                    <UserPlus size={24} className="text-accent" />
                    Create Account
                </h2>

                {error && (
                    <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.2)', color: '#fca5a5', padding: '0.75rem', borderRadius: '0.5rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                        {error}
                    </div>
                )}

                <form onSubmit={handleRegister}>
                    <div className="input-group">
                        <label className="input-label">Full Name</label>
                        <input
                            type="text"
                            name="name"
                            className="input-field"
                            value={formData.name}
                            onChange={handleChange}
                            placeholder="John Doe"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Email Address</label>
                        <input
                            type="email"
                            name="email"
                            className="input-field"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="student@example.com"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Password</label>
                        <input
                            type="password"
                            name="password"
                            className="input-field"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            className="input-field"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                    </div>

                    <div className="input-group">
                        <label className="input-label">Role</label>
                        <select
                            name="role"
                            className="input-field"
                            value={formData.role}
                            onChange={handleChange}
                        >
                            <option value="STUDENT">Student</option>
                            <option value="PROFESSOR">Professor</option>
                        </select>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="text-center mt-4 text-sm text-secondary">
                    Already have an account? <Link to="/login" style={{ color: 'var(--accent)', textDecoration: 'none' }}>Log In</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;

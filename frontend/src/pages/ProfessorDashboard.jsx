import React, { useEffect, useState } from 'react';
import { api } from '../services/api';
import Navbar from '../components/Navbar';
import { Users, BookOpen, AlertCircle, CheckCircle, BarChart2 } from 'lucide-react';

const ProfessorDashboard = ({ user }) => {
    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClassData = async () => {
            try {
                const data = await api.getClassAnalytics('class-101');
                setClassData(data);
            } catch (err) {
                console.error("Failed to load class data", err);
            } finally {
                setLoading(false);
            }
        };
        fetchClassData();
    }, []);

    if (loading) return <div className="flex-center" style={{ height: '100vh' }}>Loading class insights...</div>;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar user={user} />
            <div className="container-fluid" style={{ flex: 1 }}>
                <header className="mb-8">
                    <div className="flex-center" style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <h1 className="text-2xl font-bold mb-1">Professor Dashboard</h1>
                            <p className="text-secondary">Overview of class performance and student progress.</p>
                        </div>
                        <span style={{
                            background: 'var(--primary)',
                            color: '#fff',
                            padding: '0.25rem 0.75rem',
                            borderRadius: '999px',
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            textTransform: 'uppercase'
                        }}>
                            {user.role}
                        </span>
                    </div>
                </header>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="card">
                        <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span className="text-secondary">Class Average</span>
                            <BarChart2 size={20} className="text-accent" />
                        </div>
                        <div className="text-3xl font-bold">{classData?.average_score}%</div>
                    </div>
                    <div className="card">
                        <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span className="text-secondary">Active Students</span>
                            <Users size={20} className="text-success" />
                        </div>
                        <div className="text-3xl font-bold">{classData?.total_students}</div>
                    </div>
                    <div className="card">
                        <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span className="text-secondary">Pending Reviews</span>
                            <AlertCircle size={20} className="text-danger" />
                        </div>
                        <div className="text-3xl font-bold">{classData?.pending_reviews}</div>
                    </div>
                </div>

                <div className="card">
                    <h3 className="text-xl font-bold mb-4">Student Progress</h3>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                    <th style={{ padding: '1rem' }}>Student Name</th>
                                    <th style={{ padding: '1rem' }}>Score</th>
                                    <th style={{ padding: '1rem' }}>Status</th>
                                    <th style={{ padding: '1rem' }}>Last Active</th>
                                    <th style={{ padding: '1rem' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {classData?.students?.map((student) => (
                                    <tr key={student.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                        <td style={{ padding: '1rem', fontWeight: '500' }}>{student.name}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                fontWeight: 'bold',
                                                color: student.score < 50 ? 'var(--danger)' : 'var(--success)'
                                            }}>
                                                {student.score}%
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem' }}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '4px',
                                                fontSize: '0.75rem',
                                                background: student.status === 'At Risk' ? 'rgba(239, 68, 68, 0.2)' :
                                                    student.status === 'Needs Attention' ? 'rgba(234, 179, 8, 0.2)' : 'rgba(34, 197, 94, 0.2)',
                                                color: student.status === 'At Risk' ? '#fca5a5' :
                                                    student.status === 'Needs Attention' ? '#fde047' : '#86efac'
                                            }}>
                                                {student.status}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{student.last_active}</td>
                                        <td style={{ padding: '1rem' }}>
                                            <button className="btn-ghost" style={{ fontSize: '0.875rem', color: 'var(--accent)' }}>View Profile</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfessorDashboard;

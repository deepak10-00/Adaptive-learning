import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import { Users, GraduationCap, TrendingUp, AlertTriangle, BookOpen, User } from 'lucide-react';

const HODDashboard = () => {
    // Determine user from localStorage since it's not passed as a prop
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('overview'); // overview, professors, students

    const [editingProf, setEditingProf] = useState(null);
    const [newClassId, setNewClassId] = useState('');

    useEffect(() => {
        const loadData = async () => {
            try {
                const result = await api.getDepartmentAnalytics();
                if (!result || !result.overview) throw new Error("Invalid data format");
                setData(result);
            } catch (err) {
                console.error("HOD Dashboard load failed", err);
                setError("Failed to load dashboard data. Ensure backend is running.");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, []);

    const handleAssignClick = (prof) => {
        setEditingProf(prof);
        setNewClassId(prof.assigned_class || '');
    };

    const handleConfirmAssign = async () => {
        if (!editingProf || !newClassId) return;
        try {
            await api.assignClass(editingProf.id, newClassId);
            // Optimistic update or reload
            setData(prev => ({
                ...prev,
                professors: prev.professors.map(p =>
                    p.id === editingProf.id ? { ...p, assigned_class: newClassId } : p
                ),
                students: prev.students.map(s =>
                    s.id === editingProf.id ? { ...s, assigned_class: newClassId } : s
                )
            }));
            setEditingProf(null);
        } catch (err) {
            alert("Failed to assign class: " + err.message);
        }
    };

    if (loading) return <div className="flex-center" style={{ height: '100vh' }}>Loading department data...</div>;
    if (error) return <div className="flex-center" style={{ height: '100vh', color: 'red' }}>{error}</div>;

    const { overview, professors, students } = data;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar user={user} />
            <div className="container-fluid" style={{ flex: 1 }}>

                {/* Header */}
                <header className="mb-8">
                    <div className="flex-center" style={{ justifyContent: 'space-between' }}>
                        <div>
                            <h1 className="text-2xl font-bold mb-1">Department Admin Dashboard</h1>
                            <p className="text-secondary">Overview of all professors and students.</p>
                        </div>
                        <span className="badge" style={{ background: '#7c3aed', color: 'white' }}>
                            {user.role}
                        </span>
                    </div>
                </header>

                {/* KPI Cards */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                    <div className="card">
                        <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span className="text-secondary">Total Professors</span>
                            <GraduationCap className="text-accent" size={20} />
                        </div>
                        <div className="text-3xl font-bold">{overview.total_professors}</div>
                        <div className="text-xs text-secondary mt-1">Active Faculty</div>
                    </div>
                    <div className="card">
                        <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span className="text-secondary">Total Students</span>
                            <Users className="text-success" size={20} />
                        </div>
                        <div className="text-3xl font-bold">{overview.total_students}</div>
                        <div className="text-xs text-secondary mt-1">Enrolled Across All Classes</div>
                    </div>
                    <div className="card">
                        <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span className="text-secondary">Avg Dept Score</span>
                            <TrendingUp className="text-warning" size={20} />
                        </div>
                        <div className="text-3xl font-bold">{overview.avg_dept_score}%</div>
                        <div className="text-xs text-success mt-1">+2% vs last term</div>
                    </div>
                </div>

                {/* Tabs */}
                <div style={{ borderBottom: '1px solid var(--border)', marginBottom: '2rem', display: 'flex', gap: '1rem' }}>
                    <button
                        className={`btn btn-ghost ${activeTab === 'overview' ? 'text-accent' : ''}`}
                        onClick={() => setActiveTab('overview')}
                        style={{ borderBottom: activeTab === 'overview' ? '2px solid var(--accent)' : 'none', borderRadius: 0 }}
                    >
                        Overview
                    </button>
                    <button
                        className={`btn btn-ghost ${activeTab === 'professors' ? 'text-accent' : ''}`}
                        onClick={() => setActiveTab('professors')}
                        style={{ borderBottom: activeTab === 'professors' ? '2px solid var(--accent)' : 'none', borderRadius: 0 }}
                    >
                        Professors
                    </button>
                    <button
                        className={`btn btn-ghost ${activeTab === 'students' ? 'text-accent' : ''}`}
                        onClick={() => setActiveTab('students')}
                        style={{ borderBottom: activeTab === 'students' ? '2px solid var(--accent)' : 'none', borderRadius: 0 }}
                    >
                        Students
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'overview' && (
                    <div className="card">
                        <h3 className="text-lg font-bold mb-4">System Status</h3>
                        <p className="text-secondary">All systems operational. No critical alerts reported by faculty.</p>
                        {/* Placeholder for charts */}
                        <div style={{ height: '200px', background: 'var(--bg-secondary)', borderRadius: '0.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1rem' }}>
                            <span className="text-secondary">Department Performance Chart Placeholder</span>
                        </div>
                    </div>
                )}

                {activeTab === 'professors' && (
                    <div className="card">
                        <h3 className="text-lg font-bold mb-4">Faculty Directory & Performance</h3>
                        <div className="table-container">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)' }}>Professor Name</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)' }}>Assigned Class</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)' }}>Students</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)' }}>Avg Score</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)' }}>Status</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {professors.map((prof) => (
                                        <tr key={prof.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                <div className="flex-center" style={{ justifyContent: 'flex-start', gap: '0.5rem' }}>
                                                    <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'var(--bg-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                        <User size={16} />
                                                    </div>
                                                    {prof.name}
                                                </div>
                                            </td>
                                            <td style={{ padding: '1rem' }}>{prof.assigned_class}</td>
                                            <td style={{ padding: '1rem' }}>{prof.students_count}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    color: prof.avg_class_score < 70 ? 'var(--error)' : 'var(--success)',
                                                    fontWeight: 'bold'
                                                }}>
                                                    {prof.avg_class_score}%
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '999px',
                                                    fontSize: '0.75rem',
                                                    background: prof.status === 'Warning' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                                    color: prof.status === 'Warning' ? 'var(--error)' : 'var(--success)'
                                                }}>
                                                    {prof.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem' }}>
                                                <button
                                                    onClick={() => handleAssignClick(prof)}
                                                    className="btn btn-outline"
                                                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                                                >
                                                    Assign
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'students' && (
                    <div className="card">
                        <h3 className="text-lg font-bold mb-4">Global Student List</h3>
                        <div className="table-container">
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ borderBottom: '1px solid var(--border)' }}>
                                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)' }}>Note</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)' }}>Student Name</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)' }}>Overall Score</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)' }}>Status</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)' }}>Last Active</th>
                                        <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--text-secondary)' }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {students.map((student) => (
                                        <tr key={student.id} style={{ borderBottom: '1px solid var(--border)' }}>
                                            <td style={{ padding: '1rem' }}>
                                                {student.status === 'At Risk' && <AlertTriangle size={16} className="text-error" />}
                                            </td>
                                            <td style={{ padding: '1rem', fontWeight: '500' }}>{student.name}</td>
                                            <td style={{ padding: '1rem' }}>{student.score}%</td>
                                            <td style={{ padding: '1rem' }}>
                                                <span style={{
                                                    padding: '0.25rem 0.5rem',
                                                    borderRadius: '999px',
                                                    fontSize: '0.75rem',
                                                    background: student.status === 'At Risk' || student.status === 'Needs Attention' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
                                                    color: student.status === 'At Risk' || student.status === 'Needs Attention' ? 'var(--error)' : 'var(--success)'
                                                }}>
                                                    {student.status}
                                                </span>
                                            </td>
                                            <td style={{ padding: '1rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>{student.last_active}</td>
                                            <td style={{ padding: '1rem' }}>
                                                <button
                                                    onClick={() => handleAssignClick(student)}
                                                    className="btn btn-outline"
                                                    style={{ padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}
                                                >
                                                    Assign Class
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Assignment Modal */}
                {editingProf && (
                    <div style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        background: 'rgba(0,0,0,0.7)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
                    }}>
                        <div className="card" style={{ width: '400px', maxWidth: '90%' }}>
                            <h3 className="text-xl font-bold mb-4">Assign Class</h3>
                            <p className="text-secondary mb-4">Assign a new class ID to <strong>{editingProf.name}</strong>.</p>

                            <label className="block text-sm font-medium text-gray-400 mb-1">Class ID</label>
                            <input
                                type="text"
                                value={newClassId}
                                onChange={(e) => setNewClassId(e.target.value)}
                                className="input-field w-full mb-6"
                                placeholder="e.g. class-101"
                            />

                            <div className="flex gap-4">
                                <button
                                    onClick={handleConfirmAssign}
                                    className="btn btn-primary flex-1"
                                >
                                    Save Assignment
                                </button>
                                <button
                                    onClick={() => setEditingProf(null)}
                                    className="btn btn-secondary flex-1"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
};

export default HODDashboard;

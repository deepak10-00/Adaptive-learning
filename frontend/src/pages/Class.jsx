import React, { useEffect, useState } from 'react';
import Navbar from '../components/Navbar';
import { api } from '../services/api';
import { BookOpen, User, Mail, Users, Info } from 'lucide-react';

const Class = () => {
    // Initialize state
    const [user] = useState(JSON.parse(localStorage.getItem('user') || '{}'));
    const [classData, setClassData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchClassDetails = async () => {
            if (!user.classId) {
                setLoading(false);
                return;
            }
            try {
                const data = await api.getClassDetails(user.classId);
                setClassData(data);
            } catch (err) {
                console.error("Failed to load class details", err);
                setError("Failed to load class info.");
            } finally {
                setLoading(false);
            }
        };
        fetchClassDetails();
    }, [user.classId]);

    if (!user.classId) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
                <Navbar user={user} />
                <div className="container-fluid flex-center" style={{ flex: 1, flexDirection: 'column' }}>
                    <Info size={48} className="text-secondary mb-4" />
                    <h2 className="text-2xl font-bold mb-2">No Class Assigned</h2>
                    <p className="text-secondary">Please contact your administrator to be assigned to a class.</p>
                </div>
            </div>
        );
    }

    if (loading) return <div className="flex-center" style={{ height: '100vh' }}>Loading class details...</div>;
    if (error) return <div className="flex-center" style={{ height: '100vh', color: 'red' }}>{error}</div>;

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar user={user} />
            <div className="container-fluid" style={{ flex: 1, padding: '2rem' }}>

                {/* Header */}
                <header className="mb-8 border-b border-gray-800 pb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-3 rounded-lg bg-blue-500/10 text-blue-400">
                            <BookOpen size={24} />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold">{classData?.className || user.classId}</h1>
                            <p className="text-gray-400">Class Dashboard</p>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content - Classmates List */}
                    <div className="col-span-2">
                        <div className="card">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold flex items-center gap-2">
                                    <Users className="text-accent" size={20} /> Classmates
                                </h3>
                                <span className="text-sm text-gray-400 bg-gray-800 px-3 py-1 rounded-full">
                                    {classData?.students?.length || 0} Students
                                </span>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {classData?.students?.map((student, index) => (
                                    <div key={index} className="p-4 rounded-lg bg-gray-800/50 border border-gray-700/50 flex items-center justify-between group hover:border-accent/50 transition-colors">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-800 flex items-center justify-center text-gray-300 font-medium">
                                                {student.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-medium text-gray-200">{student.name}</div>
                                                <div className="text-xs text-gray-500 flex items-center gap-1">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${student.status === 'Active' ? 'bg-green-500' : 'bg-gray-500'}`}></span>
                                                    {student.status}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Professor Info */}
                    <div className="flex flex-col gap-6">
                        <div className="card bg-gradient-to-br from-gray-900 to-black border border-gray-800">
                            <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-100">
                                <User className="text-purple-400" size={20} /> Instructor
                            </h3>

                            {classData?.professor ? (
                                <div className="flex flex-col items-center text-center p-4">
                                    <div className="w-24 h-24 rounded-full bg-gray-800 flex items-center justify-center mb-4 border-2 border-purple-500/30">
                                        <User size={40} className="text-gray-400" />
                                    </div>
                                    <h4 className="text-xl font-bold text-white mb-1">{classData.professor.name}</h4>
                                    <p className="text-sm text-gray-400 mb-6 flex items-center gap-2 bg-gray-800/50 px-3 py-1 rounded-full">
                                        <Mail size={14} /> {classData.professor.email}
                                    </p>

                                    <button className="btn btn-outline w-full flex items-center justify-center gap-2 group hover:bg-purple-500 hover:text-white hover:border-purple-500 transition-all">
                                        <Mail size={18} /> Contact Professor
                                    </button>
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No professor assigned yet.</p>
                                </div>
                            )}
                        </div>

                        {/* Announcements Placeholder */}
                        <div className="card bg-blue-500/5 border-blue-500/20">
                            <h3 className="text-lg font-bold mb-3 flex items-center gap-2 text-blue-400">
                                <Info size={20} /> Latest News
                            </h3>
                            <div className="space-y-4">
                                <div className="p-3 rounded bg-blue-500/10 border border-blue-500/10">
                                    <div className="text-sm font-medium text-blue-300 mb-1">Mid-term Project</div>
                                    <p className="text-xs text-blue-200/70">Don't forget to submit your project proposals by Friday.</p>
                                </div>
                                <div className="p-3 rounded bg-blue-500/10 border border-blue-500/10">
                                    <div className="text-sm font-medium text-blue-300 mb-1">Guest Lecture</div>
                                    <p className="text-xs text-blue-200/70">Dr. Smith will be visiting next Tuesday at 10 AM.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Class;

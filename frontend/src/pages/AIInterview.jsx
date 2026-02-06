import React from 'react';
import Navbar from '../components/Navbar';

const AIInterview = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const [selectedSubject, setSelectedSubject] = React.useState(null);
    const [messages, setMessages] = React.useState([]);
    const [loading, setLoading] = React.useState(false);
    const [isRecording, setIsRecording] = React.useState(false);

    const videoRef = React.useRef(null);
    const mediaRecorderRef = React.useRef(null);
    const chunksRef = React.useRef([]);
    const messagesEndRef = React.useRef(null);

    const streamRef = React.useRef(null);

    React.useEffect(() => {
        if (selectedSubject) {
            startCamera();
        } else {
            stopCamera();
        }
        return () => {
            stopCamera();
            stopRecording();
        };
    }, [selectedSubject]);

    const startCamera = async () => {
        try {
            stopCamera(); // Ensure previous stream is stopped
            const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            streamRef.current = stream;
            if (videoRef.current) videoRef.current.srcObject = stream;
        } catch (err) {
            console.error("Camera error:", err);
            alert("Please enable camera/microphone permissions.");
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
        if (videoRef.current) {
            videoRef.current.srcObject = null;
        }
    };

    const captureFrame = () => {
        if (!videoRef.current) return null;
        const canvas = document.createElement('canvas');
        canvas.width = 640;
        canvas.height = 480;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
        return canvas.toDataURL('image/jpeg', 0.7); // Low quality for speed
    };

    const startRecording = () => {
        if (!videoRef.current?.srcObject) return;

        setIsRecording(true);
        chunksRef.current = [];

        const stream = videoRef.current.srcObject;
        const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : 'audio/mp4';
        const recorder = new MediaRecorder(stream, { mimeType });

        recorder.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
        };

        recorder.onstop = async () => {
            const blob = new Blob(chunksRef.current, { type: mimeType });
            await processSubmission(blob);
        };

        recorder.start();
        mediaRecorderRef.current = recorder;
    };

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop();
            setIsRecording(false);
        }
    };

    const processSubmission = async (audioBlob) => {
        setLoading(true);
        try {
            // Capture a frame representing the session
            const screenshot = captureFrame();

            const formData = new FormData();
            formData.append('audio', audioBlob, 'response.webm');
            formData.append('subject', selectedSubject.name);
            if (screenshot) formData.append('images', screenshot); // Sending as string for this impl, or could be blob

            // Import api dynamically
            const { api } = await import('../services/api');
            const data = await api.analyzeInterview(formData);

            // Expected response: { response: "{ feedback: ..., next_question: ... }" }
            const aiMsg = { id: Date.now() + 1, sender: 'ai', text: parseAIResponse(data.response) };
            setMessages(prev => [...prev, aiMsg]);
        } catch (err) {
            const errorMsg = { id: Date.now() + 1, sender: 'ai', text: "Analysis failed. Please try again." };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setLoading(false);
        }
    };

    const parseAIResponse = (text) => {
        try {
            // Simple parsing if it's JSON, otherwise return text
            const clean = text.replace(/```json/g, '').replace(/```/g, '').trim();
            const json = JSON.parse(clean);
            return `Feedback: ${json.feedback}\n\nNext Question: ${json.next_question}`;
        } catch (e) {
            return text;
        }
    };

    const subjects = [
        { id: 'ds', name: 'Data Structures', icon: '🌳', desc: 'Arrays, Trees, Graphs, HashMaps' },
        { id: 'algo', name: 'Algorithms', icon: '⚡', desc: 'Sorting, Searching, Greedy, DP' },
        { id: 'os', name: 'Operating Systems', icon: '💻', desc: 'Processes, Threads, Deadlocks, Memory' },
        { id: 'networks', name: 'Computer Networks', icon: '🌐', desc: 'OSI Model, TCP/IP, DNS, HTTP' },
        { id: 'dbms', name: 'DBMS & SQL', icon: '💾', desc: 'Normalization, ACID, Indexing, SQL' },
        { id: 'oops', name: 'OOPs', icon: '🧩', desc: 'Inheritance, Polymorphism, Encapsulation' },
        { id: 'system', name: 'System Design', icon: '🏗️', desc: 'Scalability, Load Balancing, Caching' },
        { id: 'java', name: 'Java', icon: '☕', desc: 'Core Java, Collections, Multithreading' },
        { id: 'web', name: 'Web Development', icon: '🕸️', desc: 'HTML, CSS, JS, React, Node.js' },
        { id: 'ai', name: 'Artificial Intelligence', icon: '🤖', desc: 'Neural Networks, NLP, ML Algorithms' },
        { id: 'cloud', name: 'Cloud Computing', icon: '☁️', desc: 'AWS, Docker, Kubernetes, Microservices' },
        { id: 'security', name: 'Cybersecurity', icon: '🔒', desc: 'Encryption, Auth, Vulnerabilities' },
        { id: 'architecture', name: 'Computer Architecture', icon: '⚙️', desc: 'CPU, Cache, Pipelining, Assembly' },
        { id: 'compiler', name: 'Compiler Design', icon: '📝', desc: 'Parsing, Lexical Analysis, Optimization' },
        { id: 'discrete', name: 'Discrete Math', icon: '🔢', desc: 'Logic, Sets, Graph Theory' }
    ];

    const startInterview = async (subject) => {
        setSelectedSubject(subject);
        setLoading(true);
        try {
            const { api } = await import('../services/api');
            const data = await api.startInterview(subject.name);
            setMessages([
                { id: 1, sender: 'ai', text: data.message }
            ]);
        } catch (e) {
            setMessages([
                { id: 1, sender: 'ai', text: `Hello! I'm ready to interview you about ${subject.name}.` }
            ]);
        } finally {
            setLoading(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    React.useEffect(() => {
        scrollToBottom();
    }, [messages]);

    return (
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Navbar user={user} />

            {!selectedSubject ? (
                /* Subject Selection View */
                <div className="container-fluid" style={{ padding: '2rem', flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <div className="text-center mb-8">
                        <h1 className="text-3xl font-bold mb-2">Select Interview Topic</h1>
                        <p className="text-secondary">Choose a subject to practice your technical skills.</p>
                    </div>

                    <div className="subject-grid">
                        {subjects.map((subj) => (
                            <div key={subj.id} className="card subject-card" onClick={() => startInterview(subj)}>
                                <div className="text-4xl mb-4">{subj.icon}</div>
                                <h3 className="text-xl font-bold mb-2">{subj.name}</h3>
                                <p className="text-sm text-secondary">{subj.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                /* A/V Interview Interface */
                <div className="container-fluid" style={{ flex: 1, display: 'flex', gap: '2rem', padding: '2rem', height: 'calc(100vh - 80px)' }}>

                    {/* Video / Feedback Area */}
                    <div className="card" style={{ flex: 2, display: 'flex', flexDirection: 'column', padding: '1rem', position: 'relative', overflow: 'hidden' }}>
                        <div style={{ flex: 1, background: '#000', borderRadius: '0.5rem', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <video ref={videoRef} autoPlay muted playsInline style={{ width: '100%', height: '100%', objectFit: 'cover', transform: 'scaleX(-1)' }} />
                            {!isRecording && !loading && messages.length === 0 && (
                                <div style={{ position: 'absolute', color: 'white', textAlign: 'center', background: 'rgba(0,0,0,0.6)', padding: '1rem', borderRadius: '0.5rem' }}>
                                    <p>Ready to start? Click "Start Answer"</p>
                                </div>
                            )}
                            {loading && (
                                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.8)', color: 'white', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
                                    <div className="text-4xl mb-4">🤖</div>
                                    <p className="text-xl">Analyzing your response...</p>
                                    <p className="text-sm text-secondary">Checking body language, tone, and content</p>
                                </div>
                            )}
                        </div>

                        {/* Current Question / AI Feedback Overlay */}
                        <div style={{ marginTop: '1rem', padding: '1rem', background: 'var(--bg-secondary)', borderRadius: '0.5rem', border: '1px solid var(--border)' }}>
                            {messages.length > 0 ? (
                                <div>
                                    <div className="flex-center" style={{ justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                        <span className="badge badge-success">AI Interviewer</span>
                                        <span className="text-xs text-secondary">Feedback & Next Question</span>
                                    </div>
                                    <div style={{ whiteSpace: 'pre-line' }}>{messages[messages.length - 1].text}</div>
                                </div>
                            ) : (
                                <p className="text-center text-secondary">System ready. Topic: {selectedSubject.name}</p>
                            )}
                        </div>
                    </div>

                    {/* Controls & Stats Side Panel */}
                    <div style={{ flex: 1, maxWidth: '350px', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        <div className="card">
                            <h2 className="text-xl font-bold mb-4">{selectedSubject.name}</h2>
                            <div className="flex-center" style={{ gap: '0.5rem', marginBottom: '1rem' }}>
                                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: isRecording ? 'red' : 'gray', boxShadow: isRecording ? '0 0 10px red' : 'none' }}></div>
                                <span>{isRecording ? "Recording..." : "Standby"}</span>
                                {isRecording && <span className="ml-auto text-red-500 font-mono">00:15</span>}
                            </div>

                            {!isRecording ? (
                                <button className="btn btn-primary w-full" onClick={startRecording} disabled={loading}>
                                    {messages.length === 0 ? "Start Interview" : "Start Answer"}
                                </button>
                            ) : (
                                <button className="btn w-full" style={{ background: '#ef4444', color: 'white', border: 'none' }} onClick={stopRecording}>
                                    Stop & Submit
                                </button>
                            )}

                            <div className="mt-4 text-xs text-secondary">
                                This will capture audio and video snapshots for AI analysis.
                            </div>
                        </div>

                        {/* Analysis Stats (Mock UI for now, populated by AI later) */}
                        {messages.length > 0 && (
                            <div className="card" style={{ flex: 1 }}>
                                <h3 className="font-bold mb-3">Last Answer Analysis</h3>
                                <div className="space-y-4">
                                    <div>
                                        <div className="flex-center justify-between text-sm mb-1">
                                            <span>Technical Accuracy</span>
                                            <span className="text-success">85%</span>
                                        </div>
                                        <div className="progress-container"><div className="progress-bar" style={{ width: '85%', background: 'var(--success)' }}></div></div>
                                    </div>
                                    <div>
                                        <div className="flex-center justify-between text-sm mb-1">
                                            <span>Communication</span>
                                            <span className="text-accent">70%</span>
                                        </div>
                                        <div className="progress-container"><div className="progress-bar" style={{ width: '70%', background: 'var(--accent)' }}></div></div>
                                    </div>
                                    <div>
                                        <div className="flex-center justify-between text-sm mb-1">
                                            <span>Body Language</span>
                                            <span className="text-warning">60%</span>
                                        </div>
                                        <div className="progress-container"><div className="progress-bar" style={{ width: '60%', background: '#eab308' }}></div></div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AIInterview;

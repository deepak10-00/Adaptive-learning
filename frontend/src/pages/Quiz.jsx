import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { Keyboard, Activity, CheckCircle } from 'lucide-react';

const QUESTIONS = [
    {
        id: 1,
        question: "What is the time complexity of binary search?",
        options: ["O(n)", "O(log n)", "O(n^2)", "O(1)"],
        correct: 1 // Index
    },
    {
        id: 2,
        question: "Which data structure uses LIFO principle?",
        options: ["Queue", "Linked List", "Stack", "Tree"],
        correct: 2
    },
    {
        id: 3,
        question: "What does HTML stand for?",
        options: ["Hyper Text Markup Language", "High Text Machine Learning", "Hyper Tool Multi Language", "None of above"],
        correct: 0
    },
    {
        id: 4,
        question: "What is the purpose of DNS?",
        options: ["encrypt data", "map domain names to IP", "compress files", "route packets"],
        correct: 1
    },
    {
        id: 5,
        question: "Which port is used for HTTPS?",
        options: ["80", "21", "443", "25"],
        correct: 2
    }
];

const Quiz = () => {
    const [questions, setQuestions] = useState([]);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [answers, setAnswers] = useState({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // Typing Metrics State
    const metricsRef = useRef({
        keystrokes: 0,
        backspaces: 0,
        startTime: Date.now(),
        endTime: null
    });

    useEffect(() => {
        // Fetch dynamic questions
        const loadQuiz = async () => {
            const fetchedQuestions = await api.generateQuiz();
            setQuestions(fetchedQuestions);
            setLoading(false);
            metricsRef.current.startTime = Date.now(); // Reset timer on load
        };
        loadQuiz();

        const handleKeyDown = (e) => {
            metricsRef.current.keystrokes++;
            if (e.key === 'Backspace') {
                metricsRef.current.backspaces++;
            }
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const handleOptionSelect = (optionIndex) => {
        // Map index to the option string for the answer if needed, 
        // but here we just store the index to match the UI state.
        // The backend expectation might need to be checked.
        // For simplicity, we compare (questions[cq].answer === questions[cq].options[idx])
        setAnswers(prev => ({
            ...prev,
            [questions[currentQuestion].id]: optionIndex
        }));
    };

    const handleNext = () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(prev => prev + 1);
        } else {
            submitQuiz();
        }
    };

    const submitQuiz = async () => {
        setIsSubmitting(true);
        metricsRef.current.endTime = Date.now();

        // Calculate Score and Wrong Answers
        let score = 0;
        const wrongAnswers = [];

        questions.forEach(q => {
            const selectedIdx = answers[q.id];
            if (selectedIdx !== undefined) {
                const selectedOption = q.options[selectedIdx];
                if (selectedOption === q.answer) {
                    score += 1;
                } else {
                    wrongAnswers.push(q.question);
                }
            } else {
                // Treat unanswered as wrong/gap? Let's include them for recommendation coverage
                wrongAnswers.push(q.question);
            }
        });

        // Normalize score to 10 for consistency
        const finalScore = Math.round((score / questions.length) * 10);

        // Prepare Payload
        const durationSec = (metricsRef.current.endTime - metricsRef.current.startTime) / 1000;
        const typingMetrics = {
            total_keystrokes: metricsRef.current.keystrokes,
            backspaces: metricsRef.current.backspaces,
            duration_seconds: durationSec,
            cpm: (metricsRef.current.keystrokes / durationSec) * 60
        };

        try {
            const user = JSON.parse(localStorage.getItem('user') || '{}');
            const response = await api.submitQuiz({
                student_id: user.id,
                score: finalScore,
                typing_metrics: typingMetrics,
                wrong_answers: wrongAnswers
            });

            if (response.success) {
                navigate('/dashboard');
            }
        } catch (err) {
            console.error("Submission failed", err);
            navigate('/dashboard');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex-center" style={{ height: '80vh', flexDirection: 'column', gap: '1rem' }}>
                <Activity className="text-accent spin" size={48} />
                <p>Generating unique questions...</p>
            </div>
        );
    }

    if (questions.length === 0) {
        return <div className="text-center pt-8">Failed to load questions. Please refresh.</div>;
    }

    const progress = ((currentQuestion + 1) / questions.length) * 100;
    const currentQ = questions[currentQuestion];

    return (
        <div className="container-fluid" style={{ paddingTop: '2rem', paddingBottom: '2rem' }}>
            <header className="flex-center mb-4" style={{ justifyContent: 'space-between' }}>
                <h2 className="flex-center" style={{ gap: '0.5rem', margin: 0 }}>
                    <Activity className="text-accent" />
                    Skill Assessment
                </h2>
                <span className="text-secondary text-sm">
                    Question {currentQuestion + 1} of {questions.length}
                </span>
            </header>

            {/* Progress Bar */}
            <div style={{ background: 'var(--bg-secondary)', height: '8px', borderRadius: '4px', marginBottom: '2rem', overflow: 'hidden' }}>
                <div style={{ width: `${progress}%`, background: 'var(--accent)', height: '100%', transition: 'width 0.3s ease' }}></div>
            </div>

            <div className="card">
                <h3 className="text-xl mb-4">{currentQ.question}</h3>

                <div style={{ display: 'grid', gap: '1rem' }}>
                    {currentQ.options.map((opt, idx) => (
                        <button
                            key={idx}
                            onClick={() => handleOptionSelect(idx)}
                            style={{
                                textAlign: 'left',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                background: answers[currentQ.id] === idx ? 'rgba(56, 189, 248, 0.1)' : 'var(--bg-primary)',
                                border: `1px solid ${answers[currentQ.id] === idx ? 'var(--accent)' : 'var(--border)'}`,
                                color: answers[currentQ.id] === idx ? 'var(--accent)' : 'var(--text-primary)',
                                transition: 'all 0.2s'
                            }}
                        >
                            <span style={{ marginRight: '0.5rem', fontWeight: 'bold' }}>{String.fromCharCode(65 + idx)}.</span>
                            {opt}
                        </button>
                    ))}
                </div>

                <div className="mt-4" style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                        className="btn btn-primary"
                        onClick={handleNext}
                        disabled={answers[currentQ.id] === undefined || isSubmitting}
                    >
                        {isSubmitting ? 'Submitting...' : (currentQuestion === questions.length - 1 ? 'Finish Quiz' : 'Next Question')}
                    </button>
                </div>
            </div>

            <div className="text-center mt-4 text-secondary text-sm flex-center" style={{ gap: '0.5rem' }}>
                <Keyboard size={16} />
                Typing patterns are being analyzed for adaptive insights
            </div>
        </div>
    );
};

export default Quiz;

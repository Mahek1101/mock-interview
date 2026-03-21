import { useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './Results.css';

const TOPIC_LABELS = {
  frontend: '🎨 Frontend',
  backend: '⚙️ Backend',
  behavioral: '🧠 Behavioral',
  dsa: '📊 Data Structures'
};

export default function Results() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // 1. Get sessionId from state (from navigate) OR from the URL if refreshed
    const queryParams = new URLSearchParams(window.location.search);
    const sessionId = state?.sessionId || queryParams.get('sessionId');

    if (!sessionId) {
      console.error("No sessionId found");
      // If we really don't have an ID, we can't show results
      const timeout = setTimeout(() => navigate('/dashboard'), 3000);
      setError("No session ID found. Redirecting to dashboard...");
      return () => clearTimeout(timeout);
    }

    const fetchResults = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`https://mock-interview-backend-d0i9.onrender.com/interview/results/${sessionId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`Server returned ${response.status}`);
        }

        const data = await response.json();
        setResult(data);
      } catch (err) {
        console.error("Fetch results error:", err);
        setError("Failed to load your interview results. The AI might still be processing them.");
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [state, navigate]);

  if (loading) return <div className="loading-screen">⌛ Calculating your final score...</div>;
  if (error) return <div className="error-screen">{error}</div>;
  if (!result) return null;

  const scoreColor = (score) => {
    if (score >= 8) return '#059669';
    if (score >= 5) return '#d97706';
    return '#dc2626';
  };

  return (
    <div className="results-page">
      <header className="results-header">
        <h1 className="results-logo">🤖 AI Mock Interview</h1>
      </header>
      <main className="results-main">
        <div className="results-hero">
          <h2>Interview Complete!</h2>
          <p>{TOPIC_LABELS[result.topic] || 'Interview'} — {result.total_questions} Questions</p>
        </div>

        <div className="final-score-card">
          <div className="final-score-circle" style={{ borderColor: scoreColor(result.total_score) }}>
            <span className="final-score-number" style={{ color: scoreColor(result.total_score) }}>
              {result.total_score}
            </span>
            <span className="final-score-label">/10</span>
          </div>
          <p className="score-desc">Overall Performance Score</p>
        </div>

        <h2 className="section-title">Detailed Feedback</h2>
        <div className="feedback-container">
          {result.questions?.map((q, i) => (
            <div key={i} className="question-result-card">
              <div className="qr-header">
                <span className="qr-number">Question {i + 1}</span>
                <span className="qr-score" style={{ color: scoreColor(q.score) }}>{q.score}/10</span>
              </div>
              <p className="qr-text"><strong>Q:</strong> {q.question}</p>
              <p className="qr-feedback"><strong>AI Feedback:</strong> {q.feedback}</p>
            </div>
          ))}
        </div>

        <button className="back-btn" onClick={() => navigate('/dashboard')}>
          Back to Dashboard
        </button>
      </main>
    </div>
  );
}

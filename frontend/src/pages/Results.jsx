import { useLocation, useNavigate } from 'react-router-dom';
import './Results.css';

const TOPIC_LABELS = {
  frontend: '🎨 Frontend',
  backend: '⚙️ Backend',
  behavioral: '🧠 Behavioral',
  dsa: '📊 Data Structures'
};

export default function Results() {
  const { state }  = useLocation();
  const navigate   = useNavigate();
  const result     = state?.result;

  if (!result) { navigate('/dashboard'); return null; }

  const scoreColor = (score) => {
    if (score >= 8) return '#059669';
    if (score >= 5) return '#d97706';
    return '#dc2626';
  };

  const scoreLabel = (score) => {
    if (score >= 8) return 'Excellent! 🎉';
    if (score >= 5) return 'Good job! 👍';
    return 'Keep practicing! 💪';
  };

  return (
    <div className="results-page">
      <header className="results-header">
        <h1 className="results-logo">🤖 AI Mock Interview</h1>
      </header>

      <main className="results-main">
        <div className="results-hero">
          <h2>Interview Complete!</h2>
          <p>{TOPIC_LABELS[result.topic]} — {result.total_questions} questions</p>
        </div>

        <div className="final-score-card">
          <div className="final-score-circle" style={{ borderColor: scoreColor(result.total_score) }}>
            <span className="final-score-number" style={{ color: scoreColor(result.total_score) }}>
              {result.total_score}
            </span>
            <span className="final-score-label">/10</span>
          </div>
          <h3 className="score-verdict">{scoreLabel(result.total_score)}</h3>
          <p className="score-desc">Average score across {result.total_questions} questions</p>
        </div>

        <h2 className="section-title">Question Breakdown</h2>

        {result.questions?.map((q, i) => (
          <div key={i} className="question-result-card">
            <div className="qr-header">
              <span className="qr-number">Q{i + 1}</span>
              <span className="qr-score" style={{ color: scoreColor(q.score), borderColor: scoreColor(q.score) }}>
                {q.score}/10
              </span>
            </div>
            <p className="qr-question">{q.question}</p>
            <div className="qr-answer">
              <span className="qr-label">Your answer</span>
              <p>{q.answer}</p>
            </div>
            <div className="qr-feedback">
              <span className="qr-label">AI feedback</span>
              <p>{q.feedback}</p>
            </div>
          </div>
        ))}

        <div className="results-actions">
          <button className="retry-btn" onClick={() => navigate(`/interview/${result.topic}`)}>
            Try Again
          </button>
          <button className="home-btn" onClick={() => navigate('/dashboard')}>
            Back to Dashboard
          </button>
        </div>
      </main>
    </div>
  );
}

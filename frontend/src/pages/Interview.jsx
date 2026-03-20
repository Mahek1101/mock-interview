import { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import './Interview.css';

const MAX_QUESTIONS = 5;

const TOPIC_LABELS = {
  frontend: '🎨 Frontend', backend: '⚙️ Backend',
  behavioral: '🧠 Behavioral', dsa: '📊 Data Structures'
};

const DIFF_COLORS = { easy: '#059669', medium: '#d97706', hard: '#dc2626' };

export default function Interview() {
  const { topic } = useParams();
  const [searchParams] = useSearchParams();
  const difficulty = searchParams.get('difficulty') || 'medium';
  const navigate = useNavigate();

  const [sessionId, setSessionId] = useState(null);
  const [questionId, setQuestionId] = useState(null);
  const [question, setQuestion] = useState('');
  const [questionNum, setQuestionNum] = useState(1);
  const [answer, setAnswer] = useState('');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [phase, setPhase] = useState('answering');

  useEffect(() => {
    const initSession = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        
        const response = await fetch('https://mock-interview-backend-d0i9.onrender.com/interview/start', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ topic, difficulty })
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("Backend Error:", errorData);
          throw new Error('Failed to start session');
        }

        const res = await response.json();
        console.log("DEBUG: Backend Response Data:", res);
        
        // This ensures the page shows SOMETHING even if the backend is slow or the name is different
        setSessionId(res.session_id || res.id);
        setQuestionId(res.question_id || (res.questions && res.questions[0]?.id));
        
        // Try every possible name the backend might use for the question
        const incomingQuestion = res.question || res.initial_question || (res.questions && res.questions[0]?.text);
        setQuestion(incomingQuestion || "AI is warming up... Please click 'Exit' and try one more time in 30 seconds.");
        
        setQuestionNum(1);
      } catch (err) {
        console.error("Interview Init Error:", err);
        // We removed the navigate to dashboard so the page doesn't bounce!
      } finally {
        setLoading(false);
      }
    };

    if (topic) initSession();
  }, [topic, difficulty, navigate]);
  
  const handleSubmit = async () => {
    if (!answer.trim()) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://mock-interview-backend-d0i9.onrender.com/interview/answer', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          session_id: sessionId,
          question_id: questionId,
          answer: answer
        })
      });

      if (!response.ok) throw new Error('Failed to submit answer');
      
      const resData = await response.json();
      setFeedback(resData);
      setPhase('feedback');
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleNext = async () => {
    const token = localStorage.getItem('token');
    
    // 1. Check if we reached the limit
    if (questionNum >= MAX_QUESTIONS) {
      try {
        setLoading(true);
        await fetch(`https://mock-interview-backend-d0i9.onrender.com/interview/complete/${sessionId}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        navigate('/results', { state: { sessionId: sessionId } });
      } catch (err) {
        console.error("Complete error:", err);
      } finally {
        setLoading(false);
      }
      return;
    }

    // 2. Reset UI for the new question
    setLoading(true);
    setAnswer('');
    setFeedback(null);
    setPhase('answering');

    try {
      // 3. The Fetch - Added a trailing slash and ensured the ID is correct
      const response = await fetch(`https://mock-interview-backend-d0i9.onrender.com/interview/next/${sessionId}/?difficulty=${difficulty}&t=${Date.now()}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`);
      }
      
      const resData = await response.json();
      console.log("DEBUG: Next Question Received:", resData);

      // 4. Map the new question text
      const nextText = resData.next_question || resData.question || resData.initial_question;
      const nextId = resData.question_id || resData.id;

      if (nextText) {
        setQuestionId(nextId);
        setQuestion(nextText);
        setQuestionNum(prev => prev + 1);
      } else {
        throw new Error('Response was successful but question text was missing');
      }
      
    } catch (err) {
      console.error("HandleNext Error:", err);
      // If it fails, we show a more helpful message
      alert("The AI is taking a moment to generate a unique question. Please wait 5 seconds and click 'Next Question' again.");
    } finally {
      setLoading(false);
    }
  };
  
  const scoreColor = (score) => {
    if (score >= 8) return '#059669';
    if (score >= 5) return '#d97706';
    return '#dc2626';
  };

  return (
    <div className="interview-page">
      <header className="interview-header">
        <button className="back-btn" onClick={() => navigate('/dashboard')}>← Exit</button>
        <div className="interview-meta">
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <span className="topic-label">{TOPIC_LABELS[topic]}</span>
            <span className="diff-badge" style={{ background: `${DIFF_COLORS[difficulty]}15`, color: DIFF_COLORS[difficulty] }}>
              {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
            </span>
          </div>
          <span className="question-counter">Question {questionNum} of {MAX_QUESTIONS}</span>
        </div>
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(questionNum / MAX_QUESTIONS) * 100}%` }} />
        </div>
      </header>

      <main className="interview-main">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner" />
            <p>AI is generating your {difficulty} question...</p>
          </div>
        ) : (
          <>
            <div className="question-card">
              <div className="question-number">Question {questionNum}</div>
              <p className="question-text">{question}</p>
            </div>

            {phase === 'answering' && (
              <div className="answer-section">
                <label className="answer-label">Your Answer</label>
                <textarea
                  className="answer-input"
                  value={answer}
                  onChange={e => setAnswer(e.target.value)}
                  placeholder="Type your answer here... Be as detailed as you can."
                  rows={8}
                />
                <button className="submit-btn" onClick={handleSubmit} disabled={submitting || !answer.trim()}>
                  {submitting ? 'AI is evaluating...' : 'Submit Answer →'}
                </button>
              </div>
            )}

            {phase === 'feedback' && feedback && (
              <div className="feedback-section">
                <div className="score-display">
                  <div className="score-circle" style={{ borderColor: scoreColor(feedback.score) }}>
                    <span className="score-number" style={{ color: scoreColor(feedback.score) }}>{feedback.score}</span>
                    <span className="score-out-of">/10</span>
                  </div>
                </div>

                <div className="feedback-card">
                  <h3>Overall Feedback</h3>
                  <p>{feedback.feedback}</p>
                </div>

                {feedback.strengths?.length > 0 && (
                  <div className="feedback-card strengths">
                    <h3>✅ Strengths</h3>
                    <ul>{feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}</ul>
                  </div>
                )}

                {feedback.improvements?.length > 0 && (
                  <div className="feedback-card improvements">
                    <h3>💡 Areas to Improve</h3>
                    <ul>{feedback.improvements.map((s, i) => <li key={i}>{s}</li>)}</ul>
                  </div>
                )}

                {feedback.resources?.length > 0 && (
                  <div className="feedback-card resources">
                    <h3>📚 Suggested Resources</h3>
                    <div className="resources-list">
                      {feedback.resources.map((r, i) => (
                        <a key={i} href={r.url} target="_blank" rel="noreferrer" className="resource-link">
                          <div className="resource-type">{r.type}</div>
                          <div className="resource-title">{r.title}</div>
                          <span className="resource-arrow">→</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <button className="next-btn" onClick={handleNext}>
                  {questionNum >= MAX_QUESTIONS ? 'See Final Results →' : 'Next Question →'}
                </button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

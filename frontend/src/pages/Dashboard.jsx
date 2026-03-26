import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const TOPICS = [
  { id: 'frontend',   icon: '🎨', name: 'Frontend',        desc: 'React, CSS, JS, HTML' },
  { id: 'backend',    icon: '⚙️',  name: 'Backend',         desc: 'APIs, databases, Python' },
  { id: 'behavioral', icon: '🧠', name: 'Behavioral',      desc: 'Soft skills, teamwork' },
  { id: 'dsa',        icon: '📊', name: 'Data Structures', desc: 'Arrays, trees, sorting' },
];

const DIFFICULTIES = [
  { id: 'easy',   label: 'Easy',   color: '#059669', desc: 'Great for warming up' },
  { id: 'medium', label: 'Medium', color: '#d97706', desc: 'Intermediate level' },
  { id: 'hard',   label: 'Hard',   color: '#dc2626', desc: 'Senior developer level' },
];

const TOPIC_LABELS = {
  frontend: '🎨 Frontend', backend: '⚙️ Backend',
  behavioral: '🧠 Behavioral', dsa: '📊 Data Structures'
};

const scoreColor = (score) => {
  if (score >= 8) return '#059669';
  if (score >= 5) return '#d97706';
  return '#dc2626';
};

function LineChart({ data }) {
  const W = 500, H = 120;
  const padL = 32, padR = 16, padT = 16, padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const scores = data.map(s => s.total_score);
  const minS   = Math.max(0, Math.min(...scores) - 1);
  const maxS   = Math.min(10, Math.max(...scores) + 1);
  const xPos   = (i) => padL + (i / (data.length - 1)) * innerW;
  const yPos   = (v) => padT + innerH - ((v - minS) / (maxS - minS)) * innerH;
  const points = data.map((s, i) => [xPos(i), yPos(s.total_score)]);

  let path = `M ${points[0][0]} ${points[0][1]}`;
  for (let i = 1; i < points.length; i++) {
    const cp1x = (points[i-1][0] + points[i][0]) / 2;
    path += ` C ${cp1x} ${points[i-1][1]}, ${cp1x} ${points[i][1]}, ${points[i][0]} ${points[i][1]}`;
  }
  const areaPath = path + ` L ${points[points.length-1][0]} ${padT+innerH} L ${points[0][0]} ${padT+innerH} Z`;
  const yLabels  = [minS, Math.round((minS+maxS)/2), maxS];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id="lineGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.15" />
          <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
        </linearGradient>
      </defs>
      {yLabels.map((label, i) => (
        <g key={i}>
          <line x1={padL} y1={yPos(label)} x2={W-padR} y2={yPos(label)} stroke="#e8eaf0" strokeWidth="1" strokeDasharray="4 3" />
          <text x={padL-6} y={yPos(label)+4} textAnchor="end" fontSize="10" fill="#9ca3af">{label}</text>
        </g>
      ))}
      <path d={areaPath} fill="url(#lineGrad)" />
      <path d={path} fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" />
      {points.map(([x, y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r={5} fill="#fff" stroke={scoreColor(scores[i])} strokeWidth="2.5" />
          <text x={x} y={padT+innerH+18} textAnchor="middle" fontSize="9" fill="#9ca3af">
            {new Date(data[i].created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
          </text>
        </g>
      ))}
    </svg>
  );
}

function BarChart({ data }) {
  const W = 500, H = 120;
  const padL = 32, padR = 16, padT = 16, padB = 28;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const gap    = 6;
  const barW   = (innerW / data.length) - gap;
  const yLabels = [0, 5, 10];

  return (
    <svg width="100%" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="xMidYMid meet" style={{ overflow: 'visible' }}>
      {yLabels.map((label, i) => {
        const y = padT + innerH - (label / 10) * innerH;
        return (
          <g key={i}>
            <line x1={padL} y1={y} x2={W-padR} y2={y} stroke="#e8eaf0" strokeWidth="1" strokeDasharray="4 3" />
            <text x={padL-6} y={y+4} textAnchor="end" fontSize="10" fill="#9ca3af">{label}</text>
          </g>
        );
      })}
      {data.map((s, i) => {
        const barH = (s.total_score / 10) * innerH;
        const x    = padL + i * (barW + gap);
        const y    = padT + innerH - barH;
        const color = scoreColor(s.total_score);
        return (
          <g key={s.id}>
            <rect x={x} y={y} width={barW} height={barH} rx="4" fill={color} opacity="0.85" />
            <text x={x + barW/2} y={y - 4} textAnchor="middle" fontSize="9" fill={color} fontWeight="600">
              {s.total_score}
            </text>
            <text x={x + barW/2} y={padT+innerH+18} textAnchor="middle" fontSize="9" fill="#9ca3af">
              {new Date(s.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function Dashboard({ user, logout }) {
  const navigate = useNavigate();
  const [selected, setSelected]     = useState(null);
  const [difficulty, setDifficulty] = useState('medium');
  const [history, setHistory]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [adminStats, setAdminStats] = useState(null); 
  const [chartType, setChartType]   = useState('line');

  useEffect(() => {
    // 1. Recovery Logic: If state is lost on refresh, get user from localStorage
    if (!user) {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        // This ensures your "user?.username" calls don't break
        // Note: You may need to call a setUser function if it's passed as a prop
      }
    }

    const fetchHistory = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await fetch('https://mock-interview-backend-d0i9.onrender.com/interview/history', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        if (!response.ok) throw new Error('Failed to fetch history');
        const data = await response.json();
        setHistory(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    const fetchAdminStats = async () => {
      // ⚠️ Use the user object to check for admin access
      if (user?.email?.toLowerCase() !== 'admin@gmail.com') return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://mock-interview-backend-d0i9.onrender.com/interview/admin/stats', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          setAdminStats(data);
        }
      } catch (err) {
        console.error("Admin stats fetch failed", err);
      }
    };

    fetchHistory();
    fetchAdminStats();
  }, [user]); // Added 'user' as a dependency so it runs when user is loaded

  const handleLogout = () => { logout(); navigate('/login'); };

  const avgScore  = history.length ? (history.reduce((sum, s) => sum + s.total_score, 0) / history.length).toFixed(1) : '-';
  const bestScore = history.length ? Math.max(...history.map(s => s.total_score)).toFixed(1) : '-';
  const chartData = [...history].reverse().slice(-8);

  return (
    <div className="dashboard">
      <header className="dash-header">
        <h1 className="dash-logo">🤖 AI Mock Interview</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
    
          {/* ADD THE ADMIN LINK HERE */}
          {user && user.email === 'admin@gmail.com' && (
            <button 
              onClick={() => navigate('/admin')} 
              className="dash-logout" 
              style={{ background: '#f59e0b', color: 'white' }}
            >
              🛡️ Admin
            </button>
          )}

          <span className="dash-username">
            {user?.username || user?.email?.split('@')[0]}
          </span>
          <button className="dash-logout" onClick={handleLogout}>Log out</button>
        </div>
      </header>
      <main className="dash-main">

        {user?.email === 'admin@gmail.com' && adminStats && (
          <div style={{ 
            background: '#1e293b', 
            padding: '20px', 
            borderRadius: '12px', 
            marginBottom: '2rem',
            border: '1px solid #f59e0b',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
          }}>
            <h3 style={{ color: '#f59e0b', marginTop: 0, fontSize: '1rem' }}>📊 Admin Insights</h3>
            <div style={{ display: 'flex', gap: '2rem' }}>
              <div>
                <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.8rem' }}>Total Users</p>
                <h2 style={{ color: 'white', margin: '5px 0 0 0' }}>{adminStats.total_users}</h2>
              </div>
              <div>
                <p style={{ color: '#9ca3af', margin: 0, fontSize: '0.8rem' }}>Interviews Completed</p>
                <h2 style={{ color: 'white', margin: '5px 0 0 0' }}>{adminStats.total_interviews}</h2>
              </div>
            </div>
          </div>
        )}

        {history.length > 0 && (
          <div className="stats-row">
            <div className="stat-box">
              <span className="stat-value">{history.length}</span>
              <span className="stat-label">Sessions</span>
            </div>
            <div className="stat-box">
              <span className="stat-value" style={{ color: scoreColor(parseFloat(avgScore)) }}>{avgScore}</span>
              <span className="stat-label">Avg Score</span>
            </div>
            <div className="stat-box">
              <span className="stat-value" style={{ color: scoreColor(parseFloat(bestScore)) }}>{bestScore}</span>
              <span className="stat-label">Best Score</span>
            </div>
          </div>
        )}

        {chartData.length >= 2 && (
          <div className="chart-card">
            <div className="chart-header">
              <p className="section-title" style={{ margin: 0 }}>Score progress</p>
              <div className="chart-toggle">
                <button
                  className={`toggle-btn ${chartType === 'line' ? 'active' : ''}`}
                  onClick={() => setChartType('line')}
                >
                  Line
                </button>
                <button
                  className={`toggle-btn ${chartType === 'bar' ? 'active' : ''}`}
                  onClick={() => setChartType('bar')}
                >
                  Bar
                </button>
              </div>
            </div>
            <div className="chart-wrapper">
              {chartType === 'line' ? <LineChart data={chartData} /> : <BarChart data={chartData} />}
            </div>
            <p style={{ fontSize: '0.75rem', color: '#9ca3af', textAlign: 'right', marginTop: '4px' }}>
              Last {chartData.length} sessions
            </p>
          </div>
        )}

        <div className="dash-welcome">
          <h2>Ready to practice {user?.username}? 💪</h2>
          <p>Pick a topic and difficulty level to start your AI-powered mock interview.</p>
        </div>

        <p className="section-title">Choose a topic</p>
        <div className="topic-grid">
          {TOPICS.map(topic => (
            <div
              key={topic.id}
              className={`topic-card ${selected === topic.id ? 'selected' : ''}`}
              onClick={() => setSelected(topic.id)}
            >
              <div className="topic-icon">{topic.icon}</div>
              <div className="topic-name">{topic.name}</div>
              <div className="topic-desc">{topic.desc}</div>
            </div>
          ))}
        </div>

        <p className="section-title" style={{ marginTop: '1.5rem' }}>Choose difficulty</p>
        <div className="difficulty-row">
          {DIFFICULTIES.map(d => (
            <div
              key={d.id}
              className={`difficulty-card ${difficulty === d.id ? 'selected' : ''}`}
              style={{ '--diff-color': d.color }}
              onClick={() => setDifficulty(d.id)}
            >
              <span className="diff-label">{d.label}</span>
              <span className="diff-desc">{d.desc}</span>
            </div>
          ))}
        </div>

        <button 
          type="button" 
          className="start-btn" 
          onClick={() => {
            if (selected) {
              navigate(`/interview/${selected}?difficulty=${difficulty}`);
            } else {
              alert("Please select a topic first!");
            }
          }}
        >
          Start Interview →
        </button>

        <div style={{ marginTop: '3rem' }}>
          <p className="section-title">Past interviews</p>
          {loading && <p style={{ color: '#6b7280', fontSize: '0.9rem' }}>Loading history...</p>}
          {!loading && history.length === 0 && (
            <div className="empty-state">
              <p>No interviews yet.</p>
              <p>Complete your first session to see your history here!</p>
            </div>
          )}
          {history.map(session => (
            <div key={session.id} className="history-card">
              <div>
                <div className="history-topic">{TOPIC_LABELS[session.topic] || session.topic}</div>
                <div className="history-date">
                  {new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })} · {session.total_questions} questions
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span className="score-badge" style={{ background: `${scoreColor(session.total_score)}15`, color: scoreColor(session.total_score) }}>
                  {session.total_score}/10
                </span>
                <button 
                  className="view-results-btn" 
                  onClick={() => navigate(`/results?sessionId=${session.id}`, { state: { sessionId: session.id } })}
                >
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}

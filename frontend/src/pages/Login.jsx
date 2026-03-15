import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { loginUser, getMe } from '../api/auth';
import './Auth.css';

export default function Login({ setUser }) {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await loginUser(form);
      localStorage.setItem('token', res.data.access_token);
      const me = await getMe();
      setUser(me.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Invalid email or password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <div className="auth-left-content">
          <span className="auth-left-icon">🤖</span>
          <h2 className="auth-left-title">Practice makes perfect</h2>
          <p className="auth-left-subtitle">Sharpen your interview skills with AI-powered mock interviews and real-time feedback.</p>
          <div className="auth-left-features">
            <div className="auth-feature"><div className="auth-feature-dot"></div>AI-generated interview questions</div>
            <div className="auth-feature"><div className="auth-feature-dot"></div>Instant feedback and scoring</div>
            <div className="auth-feature"><div className="auth-feature-dot"></div>Track your progress over time</div>
            <div className="auth-feature"><div className="auth-feature-dot"></div>Frontend, backend, behavioral topics</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h1 className="auth-card-title">Welcome back 👋</h1>
          <p className="auth-card-subtitle">Log in to continue practicing</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>
            <div className="field">
              <label>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in →'}
            </button>
          </form>

          <p className="auth-switch">No account yet? <Link to="/register">Sign up for free</Link></p>
        </div>
      </div>
    </div>
  );
}

import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

export default function Login({ setUser }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);

  try {
    const formData = new URLSearchParams();
    // Ensure these keys are exactly "username" and "password"
    formData.append('username', form.email.trim().toLowerCase());
    formData.append('password', form.password);

    const response = await fetch('https://mock-interview-backend-d0i9.onrender.com/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Accept': 'application/json', // Added this to help FastAPI
      },
      body: formData.toString(), // Added .toString() here
    });

    const resData = await response.json();

    if (!response.ok) {
      // Improved error handling for the [object Object] issue
      const message = resData.detail && typeof resData.detail === 'string' 
        ? resData.detail 
        : "Invalid email or password";
      throw new Error(message);
    }

    if (resData.access_token) {
      localStorage.setItem('token', resData.access_token);
      // ... rest of your logic
      navigate('/dashboard');
    }
  } catch (err) {
    setError(err.message);
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

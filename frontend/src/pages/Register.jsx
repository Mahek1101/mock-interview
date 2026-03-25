import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { registerUser } from '../api/auth';
import './Auth.css';

export default function Register({ setUser }) {
  const navigate = useNavigate();
  const [form, setForm]       = useState({ username: '', email: '', password: '' });
  const [error, setError]     = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const response = await fetch('https://mock-interview-backend-d0i9.onrender.com/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          email: form.email.trim().toLowerCase() 
        }),
      });

      // FIX: You must define resData before using it!
      const resData = await response.json();

      if (!response.ok) {
        const message = typeof resData.detail === 'string' 
          ? resData.detail 
          : (resData.detail?.[0]?.msg || JSON.stringify(resData.detail));
        throw new Error(message);
      }

      // Move navigate inside the try block
      navigate('/login');
    }
    } catch (err) {
      setError(err.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-left">
        <div className="auth-left-content">
          <span className="auth-left-icon">🚀</span>
          <h2 className="auth-left-title">Start your interview prep today</h2>
          <p className="auth-left-subtitle">Join developers who use AI to practice and land their dream jobs.</p>
          <div className="auth-left-features">
            <div className="auth-feature"><div className="auth-feature-dot"></div>Free to get started</div>
            <div className="auth-feature"><div className="auth-feature-dot"></div>Powered by GPT-4o AI</div>
            <div className="auth-feature"><div className="auth-feature-dot"></div>Detailed answer feedback</div>
            <div className="auth-feature"><div className="auth-feature-dot"></div>Session history & scores</div>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h1 className="auth-card-title">Create your account ✨</h1>
          <p className="auth-card-subtitle">Get started with your free account</p>

          {error && <div className="auth-error">{error}</div>}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label>Username</label>
              <input name="username" value={form.username} onChange={handleChange} placeholder="yourname" required />
            </div>
            <div className="field">
              <label>Email</label>
              <input name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" required />
            </div>
            <div className="field">
              <label>Password</label>
              <input name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" required />
            </div>
            <button type="submit" className="auth-btn" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account →'}
            </button>
          </form>

          <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
        </div>
      </div>
    </div>
  );
}

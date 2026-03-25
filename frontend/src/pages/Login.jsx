import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('https://mock-interview-backend-d0i9.onrender.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Sending as a JSON object to satisfy the Pydantic validator
        body: JSON.stringify({
          email: form.email.trim().toLowerCase(),
          password: form.password
        }),
      });

      const resData = await response.json();

      if (!response.ok) {
        // Handle FastAPI detail objects to avoid [object Object]
        let msg = 'Invalid email or password';
        if (typeof resData.detail === 'string') {
          msg = resData.detail;
        } else if (Array.isArray(resData.detail)) {
          msg = resData.detail[0].msg;
        }
        throw new Error(msg);
      }

      if (resData.access_token) {
        localStorage.setItem('token', resData.access_token);
        window.location.href = '/dashboard';
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
          <p className="auth-left-subtitle">Sharpen your interview skills with AI-powered mock interviews.</p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h1 className="auth-card-title">Welcome back 👋</h1>
          {error && <div className="auth-error" style={{color: '#721c24', backgroundColor: '#f8d7da', padding: '10px', borderRadius: '4px', marginBottom: '15px', border: '1px solid #f5c6cb'}}>{error}</div>}
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
          <p className="auth-switch">No account? <Link to="/register">Sign up</Link></p>
        </div>
      </div>
    </div>
  );
}

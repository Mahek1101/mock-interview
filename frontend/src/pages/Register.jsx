import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Auth.css';

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
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

      const resData = await response.json();
      if (!response.ok) throw new Error(resData.detail || 'Registration failed');
      
      navigate('/login');
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
          <span className="auth-left-icon">🚀</span>
          <h2 className="auth-left-title">Join us today</h2>
          <p className="auth-left-subtitle">Start your journey to becoming a better interviewer.</p>
        </div>
      </div>
      <div className="auth-right">
        <div className="auth-card">
          <h1 className="auth-card-title">Create Account</h1>
          {error && <div className="auth-error">{error}</div>}
          <form onSubmit={handleSubmit} className="auth-form">
            <div className="field">
              <label>Username</label>
              <input name="username" type="text" value={form.username} onChange={handleChange} placeholder="johndoe" required />
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
              {loading ? 'Creating...' : 'Register →'}
            </button>
          </form>
          <p className="auth-switch">Already have an account? <Link to="/login">Log in</Link></p>
        </div>
      </div>
    </div>
  );
}

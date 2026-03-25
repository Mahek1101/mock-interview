import React, { useState } from 'react';
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
      const params = new URLSearchParams();
      params.append('username', form.email.trim().toLowerCase());
      params.append('password', form.password);

      const response = await fetch('https://mock-interview-backend-d0i9.onrender.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      const resData = await response.json();

      if (!response.ok) {
        const message = typeof resData.detail === 'string' ? resData.detail : 'Invalid email or password';
        throw new Error(message);
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
      <div className="auth-card">
        <h1>Welcome back 👋</h1>
        {error && <div className="auth-error" style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
        <form onSubmit={handleSubmit} className="auth-form">
          <div className="field">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in →'}
          </button>
        </form>
        <p className="auth-switch" style={{marginTop: '15px'}}>
          No account? <Link to="/register">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

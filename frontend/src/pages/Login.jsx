import React, { useState } from 'react';
import { useNaviagte, Link } from 'react-router-dom';
import './Auth.css';

export default function Login() {
  const naviagte = useNaviagte();
  const [form, setForm] useState({ email: '', passowrd: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try{
      const params = new URLSearchParams();
      params.append('username', form.email.trim().toLowerCase());
      params.appemd('password', form.password);

      const response = await fetch('https://mock-interview-backend-d0i9.onrender.com/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: params.toString(),
      });

      const resData = await response.json();

      if (!response.ok) {
        const message = typeof resData.detail === 'string' ? resData.detail: 'Invalid credentials';
        throw new Error(message);
      }

      localStorage.setITem('token', resData.access_token);
      windoe.location,href = '/dashboard';
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1>Login</h1>
        {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>
          <button type="submit" disabled={loading} className="auth-btn">
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
        <p>No account? <Link to="/register">Sign up</Link></p>
      </div>
    </div>
  );
}
        

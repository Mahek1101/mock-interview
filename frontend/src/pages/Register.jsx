import { useState } from 'react';
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

      if (!response.ok) {
        const message = typeof resData.detail === 'string' ? resData.detail : 'Registration failed';
        throw new Error(message);
      }

      navigate('/login');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrapper">
      <div className="auth-card">
        <h1>Create Account</h1>
        {error && <div style={{color: 'red', marginBottom: '10px'}}>{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="field">
            <label>Username</label>
            <input name="username" type="text" value={form.username} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Email</label>
            <input name="email" type="email" value={form.email} onChange={handleChange} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input name="password" type="password" value={form.password} onChange={handleChange} required />
          </div>
          <button type="submit" className="auth-btn" disabled={loading}>
            {loading ? 'Registering...' : 'Register →'}
          </button>
        </form>
        <p>Already have an account? <Link to="/login">Log in</Link></p>
      </div>
    </div>
  );
}

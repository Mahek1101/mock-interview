import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getMe } from './api/auth';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Interview from './pages/Interview';
import Results from './pages/Results';
import AdminDashboard from './pages/AdminDashboard';
import './styles/global.css';

function App() {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) { setLoading(false); return; }
    getMe()
      .then(res => setUser(res.data))
      .catch(() => localStorage.removeItem('token'))
      .finally(() => setLoading(false));
  }, []);

  const logout = () => { localStorage.removeItem('token'); setUser(null); };

  if (loading) return <div style={{padding:'2rem',color:'#6b7280'}}>Loading...</div>;

  return (
    <Router>
      <Routes>
        <Route path="/"                   element={<Navigate to={user ? '/dashboard' : '/login'} />} />
        <Route path="/login"              element={!user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />} />
        <Route path="/register"           element={!user ? <Register setUser={setUser} /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard"          element={user ? <Dashboard user={user} logout={logout} /> : <Navigate to="/login" />} />
        <Route path="/interview/:topic"   element={user ? <Interview user={user} /> : <Navigate to="/login" />} />
        <Route path="/results"            element={user ? <Results /> : <Navigate to="/login" />} />
        <Route
          path="/admin" 
          element={
            user && user.email === 'patel@gmail.com' 
              ? <AdminDashboard /> 
              : <Navigate to="/dashboard" />
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;

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
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await getMe();
        // Check if data exists directly or inside res.data
        const userData = res.data || res;
        if (userData) {
          setUser(userData);
        } else {
          localStorage.removeItem('token');
        }
      } catch (err) {
        console.error("Auth check failed:", err);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', color: '#6b7280' }}>
        <div className="loader">Loading...</div>
      </div>
    );
  }

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
        
        <Route path="/login" element={
          !user ? <Login setUser={setUser} /> : <Navigate to="/dashboard" />
        } />
        
        <Route path="/register" element={
          !user ? <Register /> : <Navigate to="/dashboard" />
        } />

        <Route path="/dashboard" element={
          user ? <Dashboard user={user} logout={logout} /> : <Navigate to="/login" />
        } />

        <Route path="/interview/:topic" element={
          user ? <Interview user={user} /> : <Navigate to="/login" />
        } />

        <Route path="/results" element={
          user ? <Results /> : <Navigate to="/login" />
        } />

        <Route path="/admin" element={
          user && user.email === 'admin@gmail.com' ? <AdminDashboard /> : <Navigate to="/dashboard" />
        } />
        
        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css'; // Reusing your dashboard styles for consistency

export default function AdminDashboard() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      
      // Fixed URL: Combined prefix "/auth" + path "/admin/users"
      const response = await fetch('https://mock-interview-backend-d0i9.onrender.com/auth/admin/users/', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Access Denied: Admin privileges required.');
      }

      const data = await response.json();
      
      // Look specifically for the 'users' key in the backend response
      if (data && data.users) {
        setUsers(data.users);
      } else if (Array.isArray(data)) {
        // Fallback in case your backend sends a straight array
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };
    fetchUsers();
  }, [navigate]);

  if (loading) return <div className="dashboard-container"><p>Loading admin data...</p></div>;

  return (
    <div className="dashboard-container" style={{ padding: '2rem' }}>
      <div className="dashboard-header">
        <h1 className="dashboard-title">Admin Control Panel 🛡️</h1>
        <p className="dashboard-subtitle">Total Registered Users: {users.length}</p>
      </div>

      {error && <div className="auth-error" style={{ marginBottom: '1rem' }}>{error}</div>}

      <div className="history-section">
        <div className="history-card">
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
                <th style={{ padding: '12px' }}>ID</th>
                <th style={{ padding: '12px' }}>Username</th>
                <th style={{ padding: '12px' }}>Email</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  <td style={{ padding: '12px' }}>{u.id}</td>
                  <td style={{ padding: '12px' }}>{u.username}</td>
                  <td style={{ padding: '12px' }}>{u.email}</td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="3" style={{ padding: '20px', textAlign: 'center', color: '#6b7280' }}>
                    No users found in database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      <button 
        onClick={() => navigate('/dashboard')} 
        className="auth-btn" 
        style={{ marginTop: '2rem', width: 'auto' }}
      >
        ← Back to Dashboard
      </button>
    </div>
  );
}

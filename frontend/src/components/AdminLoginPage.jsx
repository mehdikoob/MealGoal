import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Admin Login Page
const AdminLoginPage = ({ onAdminLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    // Temporary check — will be replaced by JWT auth in a later step
    if (password === 'admin') {
      onAdminLogin();
      navigate('/admin');
    } else {
      setError('Mot de passe incorrect.');
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: 360, padding: '2rem' }}>
        <h2 style={{ marginBottom: '1.5rem', textAlign: 'center' }}>Administration</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group" style={{ marginBottom: '1rem' }}>
            <label className="form-label">Mot de passe</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={e => setPassword(e.target.value)}
              autoFocus
            />
          </div>
          {error && <p style={{ color: 'var(--color-error, #ef4444)', marginBottom: '1rem', fontSize: '0.875rem' }}>{error}</p>}
          <button type="submit" className="btn-primary" style={{ width: '100%' }}>
            Connexion
          </button>
        </form>
      </div>
    </div>
  );
};

export default AdminLoginPage;

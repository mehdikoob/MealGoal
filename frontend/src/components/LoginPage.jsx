import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { API_URL, TOKEN_KEY } from '../lib/api';
import Icons from '../constants/icons';

const LoginPage = ({ onLogin }) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      localStorage.setItem(TOKEN_KEY, res.data.access_token);
      localStorage.setItem('mealgoal_user', JSON.stringify(res.data.user));
      toast.success('Connexion réussie !');
      onLogin(res.data.user);
    } catch (err) {
      // Global interceptor shows toast; nothing more needed here
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon">
          <Icons.User />
        </div>
        <h1 className="auth-title">Connexion</h1>
        <p className="auth-subtitle">Ravi de vous revoir !</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              autoFocus
            />
          </div>

          <div className="form-group">
            <label>Mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Votre mot de passe"
              required
            />
          </div>

          <div className="auth-forgot">
            <button type="button" className="link-btn" onClick={() => navigate('/forgot-password')}>
              Mot de passe oublié ?
            </button>
          </div>

          <button className="btn-primary auth-submit" type="submit" disabled={loading}>
            {loading ? 'Connexion…' : 'Se connecter'}
          </button>
        </form>

        <p className="auth-switch">
          Pas encore de compte ?{' '}
          <button className="link-btn" onClick={() => navigate('/')}>
            Créer un compte
          </button>
        </p>
        <p className="legal-links">
          <button className="link-btn" onClick={() => navigate('/privacy')}>Confidentialité</button>
          {' · '}
          <button className="link-btn" onClick={() => navigate('/terms')}>CGU</button>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;

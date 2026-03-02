import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { API_URL } from '../lib/api';
import Icons from '../constants/icons';

const ResetPasswordPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!token) {
      toast.error('Lien invalide.');
      navigate('/forgot-password');
    }
  }, [token, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (password !== confirm) {
      toast.error('Les mots de passe ne correspondent pas.');
      return;
    }
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/reset-password`, {
        token,
        new_password: password,
      });
      setDone(true);
    } catch (err) {
      // Global interceptor shows toast for non-2xx; show specific detail if available
      const detail = err.response?.data?.detail;
      if (detail) toast.error(detail);
    } finally {
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-icon auth-icon--success">
            <Icons.Check />
          </div>
          <h1 className="auth-title">Mot de passe mis à jour !</h1>
          <p className="auth-subtitle">Vous pouvez maintenant vous connecter avec votre nouveau mot de passe.</p>
          <button
            className="btn-primary auth-submit"
            style={{ marginTop: 24 }}
            onClick={() => navigate('/login')}
          >
            Se connecter
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon">
          <Icons.Settings />
        </div>
        <h1 className="auth-title">Nouveau mot de passe</h1>
        <p className="auth-subtitle">Choisissez un mot de passe d'au moins 8 caractères.</p>

        <form className="auth-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nouveau mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="8 caractères minimum"
              minLength={8}
              required
              autoFocus
            />
            {password.length > 0 && password.length < 8 && (
              <span style={{ color: '#e53e3e', fontSize: '0.8rem' }}>
                {password.length}/8 caractères minimum
              </span>
            )}
          </div>

          <div className="form-group">
            <label>Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirm}
              onChange={e => setConfirm(e.target.value)}
              placeholder="Répétez le mot de passe"
              required
            />
            {confirm.length > 0 && password !== confirm && (
              <span style={{ color: '#e53e3e', fontSize: '0.8rem' }}>
                Les mots de passe ne correspondent pas
              </span>
            )}
          </div>

          <button
            className="btn-primary auth-submit"
            type="submit"
            disabled={loading || password !== confirm || password.length < 8}
          >
            {loading ? 'Mise à jour…' : 'Mettre à jour le mot de passe'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

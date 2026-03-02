import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../lib/api';
import Icons from '../constants/icons';

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
      setSent(true);
    } catch {
      // Always show success to prevent email enumeration
      setSent(true);
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-icon auth-icon--success">
            <Icons.Check />
          </div>
          <h1 className="auth-title">Email envoyé !</h1>
          <p className="auth-subtitle">
            Si <strong>{email}</strong> est enregistré, vous recevrez un lien de réinitialisation
            valable <strong>1 heure</strong>.
          </p>
          <p className="auth-subtitle" style={{ marginTop: 8, fontSize: 13 }}>
            Pensez à vérifier vos spams.
          </p>
          <button
            className="btn-primary auth-submit"
            style={{ marginTop: 24 }}
            onClick={() => navigate('/login')}
          >
            Retour à la connexion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-icon">
          <Icons.Info />
        </div>
        <h1 className="auth-title">Mot de passe oublié</h1>
        <p className="auth-subtitle">
          Entrez votre email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
        </p>

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

          <button className="btn-primary auth-submit" type="submit" disabled={loading}>
            {loading ? 'Envoi…' : 'Envoyer le lien'}
          </button>
        </form>

        <p className="auth-switch">
          <button className="link-btn" onClick={() => navigate('/login')}>
            ← Retour à la connexion
          </button>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;

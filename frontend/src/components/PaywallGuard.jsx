import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icons from '../constants/icons';

const PaywallGuard = ({ user, children }) => {
  const navigate = useNavigate();

  const isPro = user?.plan === 'pro' || user?.plan === 'coach';

  const trialActive = (() => {
    if (!user?.trial_ends_at) return false;
    try {
      return new Date(user.trial_ends_at) > new Date();
    } catch {
      return false;
    }
  })();

  const daysLeft = (() => {
    if (!user?.trial_ends_at) return 0;
    try {
      const diff = new Date(user.trial_ends_at) - new Date();
      return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    } catch {
      return 0;
    }
  })();

  if (isPro || trialActive) {
    return (
      <>
        {trialActive && !isPro && (
          <div className="trial-banner">
            <Icons.Info />
            <span>Période d'essai : encore <strong>{daysLeft} jour{daysLeft > 1 ? 's' : ''}</strong> gratuit{daysLeft > 1 ? 's' : ''}.</span>
            <button className="trial-upgrade-btn" onClick={() => navigate('/pricing')}>
              Passer à Pro
            </button>
          </div>
        )}
        {children}
      </>
    );
  }

  return (
    <div className="paywall-container">
      <div className="paywall-card">
        <div className="paywall-icon">
          <Icons.Target />
        </div>
        <h2>Fonctionnalité Pro</h2>
        <p>Votre période d'essai est terminée. Passez à Pro pour continuer à accéder à cette fonctionnalité.</p>
        <ul className="paywall-features">
          <li><Icons.Target /> Plans alimentaires illimités</li>
          <li><Icons.Scale /> Suivi du poids & statistiques</li>
          <li><Icons.Info /> Règles nutritionnelles d'or</li>
          <li><Icons.BarChart /> Historique complet</li>
        </ul>
        <button className="btn-primary paywall-cta" onClick={() => navigate('/pricing')}>
          Voir les offres
        </button>
        <p className="paywall-note">À partir de 9,90 € / mois · Sans engagement</p>
      </div>
    </div>
  );
};

export default PaywallGuard;

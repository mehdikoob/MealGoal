import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { API_URL } from '../lib/api';
import Icons from '../constants/icons';

const PLANS = [
  {
    id: 'free',
    name: 'Gratuit',
    price: '0€',
    period: '',
    description: 'Pour découvrir MealGoal',
    features: [
      'Questionnaire nutritionnel',
      'Plan alimentaire (7 jours)',
      'Tableau de bord basique',
      "14 jours d'essai Pro inclus",
    ],
    cta: 'Plan actuel',
    highlight: false,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: '9,90€',
    period: '/ mois',
    description: 'Pour atteindre vos objectifs',
    features: [
      'Tout ce qui est inclus dans Gratuit',
      'Plans alimentaires illimités',
      'Suivi du poids & statistiques',
      "Règles nutritionnelles d'or",
      'Historique complet',
      'Support prioritaire',
    ],
    cta: 'Passer à Pro',
    highlight: true,
  },
  {
    id: 'coach',
    name: 'Coach',
    price: '29€',
    period: '/ mois',
    description: 'Pour les professionnels',
    features: [
      'Tout ce qui est inclus dans Pro',
      'Accès multi-clients',
      'Dashboard coach',
      'Rapports personnalisés',
      'Support dédié',
    ],
    cta: 'Passer à Coach',
    highlight: false,
  },
];

const PricingPage = ({ user }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null);

  const currentPlan = user?.plan || 'free';

  const handleCheckout = async (planId) => {
    if (!user) {
      toast.error('Connectez-vous pour souscrire à un abonnement.');
      navigate('/');
      return;
    }
    if (planId === 'free') return;

    setLoading(planId);
    try {
      const res = await axios.post(`${API_URL}/api/billing/checkout`, {
        plan_type: planId,
      });
      window.location.href = res.data.checkout_url;
    } catch (err) {
      const msg = err.response?.data?.detail || 'Erreur lors de la création du paiement.';
      toast.error(msg);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="pricing-page">
      <div className="pricing-header">
        <h1>Choisissez votre forfait</h1>
        <p>Commencez gratuitement, upgradez quand vous voulez.</p>
      </div>

      <div className="pricing-grid">
        {PLANS.map((plan) => {
          const isCurrent = currentPlan === plan.id;

          return (
            <div
              key={plan.id}
              className={`pricing-card${plan.highlight ? ' pricing-card--featured' : ''}${isCurrent ? ' pricing-card--current' : ''}`}
            >
              {plan.highlight && (
                <div className="pricing-badge">Populaire</div>
              )}
              {isCurrent && !plan.highlight && (
                <div className="pricing-badge pricing-badge--muted">Plan actuel</div>
              )}

              <div className="pricing-card-header">
                <h2 className="pricing-plan-name">{plan.name}</h2>
                <div className="pricing-price">
                  <span className="pricing-amount">{plan.price}</span>
                  {plan.period && <span className="pricing-period">{plan.period}</span>}
                </div>
                <p className="pricing-description">{plan.description}</p>
              </div>

              <ul className="pricing-features">
                {plan.features.map((feature, i) => (
                  <li key={i}>
                    <Icons.Check />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                className={`pricing-cta${plan.highlight ? ' btn-primary' : ' btn-outline'}`}
                onClick={() => handleCheckout(plan.id)}
                disabled={plan.id === 'free' || isCurrent || loading === plan.id}
              >
                {loading === plan.id
                  ? 'Chargement…'
                  : isCurrent
                  ? 'Plan actuel'
                  : plan.cta}
              </button>
            </div>
          );
        })}
      </div>

      <p className="pricing-footer-note">
        Sans engagement · Annulable à tout moment · Paiement sécurisé par Stripe
      </p>
      <p className="pricing-footer-note" style={{ marginTop: 12 }}>
        <button className="link-btn" onClick={() => navigate('/privacy')}>Confidentialité</button>
        {' · '}
        <button className="link-btn" onClick={() => navigate('/terms')}>CGU</button>
      </p>
    </div>
  );
};

export default PricingPage;

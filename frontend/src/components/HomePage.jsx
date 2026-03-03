import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icons from '../constants/icons';
import ParticleCanvas from './ParticleCanvas';
import useScrollReveal from '../hooks/useScrollReveal';

// ─── Sections data ────────────────────────────────────────────────────────────

const STEPS = [
  {
    number: '01',
    icon: <Icons.User />,
    title: 'Remplis ton profil',
    desc: 'Âge, objectif, préférences alimentaires, rythme de vie — 5 minutes suffisent.',
  },
  {
    number: '02',
    icon: <Icons.Target />,
    title: 'On calcule ton plan',
    desc: 'Notre algorithme génère un plan sur-mesure respectant tes macros et tes goûts.',
  },
  {
    number: '03',
    icon: <Icons.TrendingUp />,
    title: 'Tu progresses',
    desc: 'Suis ton évolution semaine après semaine et ajuste ton plan en temps réel.',
  },
];

const FEATURES = [
  {
    icon: <Icons.Utensils />,
    title: 'Plans alimentaires sur mesure',
    desc: 'Générés chaque jour en fonction de tes objectifs, tes préférences et ton mode de vie.',
  },
  {
    icon: <Icons.Target />,
    title: 'Macros précis',
    desc: 'Protéines, glucides, lipides calculés au gramme près selon la méthode de référence.',
  },
  {
    icon: <Icons.TrendingUp />,
    title: 'Suivi du poids',
    desc: "Courbes d'évolution, tendances, et alertes si tu t'écartes de ta trajectoire.",
  },
  {
    icon: <Icons.Calendar />,
    title: 'Historique complet',
    desc: 'Tous tes plans archivés, consultables et comparables à tout moment.',
  },
];

const GOALS = [
  {
    emoji: '🔥',
    title: 'Perte de gras',
    desc: 'Déficit calorique intelligent, protéines hautes pour préserver la masse musculaire.',
  },
  {
    emoji: '💪',
    title: 'Prise de muscle',
    desc: 'Surplus contrôlé, fenêtres anaboliques respectées, sources de qualité.',
  },
  {
    emoji: '⚖️',
    title: 'Maintien',
    desc: 'Équilibre durable, variété alimentaire, plaisir sans culpabilité.',
  },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

const StepCard = ({ step, delay }) => {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`reveal reveal-delay-${delay} step-card`}>
      <div className="step-number">{step.number}</div>
      <div className="step-icon">{step.icon}</div>
      <h3>{step.title}</h3>
      <p>{step.desc}</p>
    </div>
  );
};

const FeatureCard = ({ feature, delay }) => {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`reveal reveal-delay-${delay} feature-card`}>
      <div className="feature-icon">{feature.icon}</div>
      <h3>{feature.title}</h3>
      <p>{feature.desc}</p>
    </div>
  );
};

const GoalCard = ({ goal, side }) => {
  const ref = useScrollReveal();
  return (
    <div ref={ref} className={`reveal ${side === 'left' ? 'reveal-left' : 'reveal-right'} goal-card`}>
      <span className="goal-emoji">{goal.emoji}</span>
      <div>
        <h3>{goal.title}</h3>
        <p>{goal.desc}</p>
      </div>
    </div>
  );
};

// ─── Main component ───────────────────────────────────────────────────────────

const HomePage = ({ onStartQuestionnaire }) => {
  const navigate = useNavigate();
  const ctaRef = useScrollReveal();

  return (
    <div className="home-page">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="home-hero">
        <ParticleCanvas />
        <div className="home-hero-content">
          <div className="home-hero-badge">Nutrition personnalisée · 100% gratuit pour commencer</div>
          <h1 className="home-hero-title">
            Votre plan alimentaire<br />
            <span className="home-hero-highlight">taillé pour vous</span>
          </h1>
          <p className="home-hero-subtitle">
            Protéines, glucides, lipides — calculés au gramme près
            selon votre profil, vos objectifs et vos préférences.
          </p>
          <div className="home-hero-actions">
            <button className="btn-primary home-hero-cta" onClick={onStartQuestionnaire}>
              Commencer gratuitement <Icons.ArrowRight />
            </button>
            <button className="btn-ghost" onClick={() => navigate('/login')}>
              J'ai déjà un compte
            </button>
          </div>
          <div className="home-hero-stats">
            <div className="hero-stat">
              <strong>14 j</strong>
              <span>d'essai offerts</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <strong>100%</strong>
              <span>personnalisé</span>
            </div>
            <div className="hero-stat-divider" />
            <div className="hero-stat">
              <strong>0</strong>
              <span>carte requise</span>
            </div>
          </div>
        </div>
        <div className="home-scroll-hint">
          <span>Découvrir</span>
          <div className="scroll-arrow" />
        </div>
      </section>

      {/* ── COMMENT ÇA MARCHE ────────────────────────────────────────────── */}
      <section className="home-section home-steps">
        <div className="home-section-inner">
          <div className="home-section-label">Simple &amp; rapide</div>
          <h2 className="home-section-title">Comment ça marche ?</h2>
          <div className="steps-grid">
            {STEPS.map((step, i) => (
              <StepCard key={step.number} step={step} delay={i + 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── FONCTIONNALITÉS ──────────────────────────────────────────────── */}
      <section className="home-section home-features">
        <div className="home-section-inner">
          <div className="home-section-label">Ce qui est inclus</div>
          <h2 className="home-section-title">Tout ce dont vous avez besoin</h2>
          <div className="features-grid">
            {FEATURES.map((f, i) => (
              <FeatureCard key={f.title} feature={f} delay={(i % 3) + 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── POUR QUI ─────────────────────────────────────────────────────── */}
      <section className="home-section home-goals">
        <div className="home-section-inner">
          <div className="home-section-label">Votre objectif</div>
          <h2 className="home-section-title">MealGoal s'adapte à vous</h2>
          <div className="goals-list">
            {GOALS.map((g, i) => (
              <GoalCard key={g.title} goal={g} side={i % 2 === 0 ? 'left' : 'right'} />
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA FINAL ────────────────────────────────────────────────────── */}
      <section className="home-section home-cta-section">
        <div ref={ctaRef} className="reveal home-cta-box">
          <h2>Prêt à transformer votre alimentation ?</h2>
          <p>Rejoignez MealGoal aujourd'hui — 14 jours gratuits, sans carte bancaire.</p>
          <button className="btn-primary home-hero-cta" onClick={onStartQuestionnaire}>
            Créer mon plan maintenant <Icons.ArrowRight />
          </button>
        </div>
      </section>

    </div>
  );
};

export default HomePage;

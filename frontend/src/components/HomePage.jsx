import React from 'react';
import Icons from '../constants/icons';

// Home Page Component
const HomePage = ({ onStartQuestionnaire }) => {
  return (
    <div className="hero-section">
      <div className="hero-content">
        <h1 className="hero-title">
          Votre plan alimentaire <br />
          <span className="highlight">personnalisé</span>
        </h1>
        <p className="hero-subtitle">
          Atteignez vos objectifs physiques grâce à un programme nutritionnel
          adapté à votre profil, vos préférences et votre mode de vie.
        </p>
        <div className="hero-buttons">
          <button className="btn-primary" onClick={onStartQuestionnaire}>
            Commencer maintenant <Icons.ArrowRight />
          </button>
        </div>
        <div className="hero-features">
          <div className="hero-feature">
            <Icons.Target />
            <span>Objectifs personnalisés</span>
          </div>
          <div className="hero-feature">
            <Icons.Utensils />
            <span>Plans sur mesure</span>
          </div>
          <div className="hero-feature">
            <Icons.TrendingUp />
            <span>Suivi d'évolution</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;

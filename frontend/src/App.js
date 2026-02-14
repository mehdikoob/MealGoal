import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import './App.css';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Icons as SVG components
const Icons = {
  User: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  ),
  Scale: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/>
    </svg>
  ),
  Target: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  ),
  Utensils: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/>
      <path d="M7 2v20"/>
      <path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/>
    </svg>
  ),
  TrendingUp: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/>
      <polyline points="16 7 22 7 22 13"/>
    </svg>
  ),
  TrendingDown: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/>
      <polyline points="16 17 22 17 22 11"/>
    </svg>
  ),
  ArrowRight: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"/>
      <polyline points="12 5 19 12 12 19"/>
    </svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  ),
  Settings: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  ),
  Calendar: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  ),
  Info: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="16" x2="12" y2="12"/>
      <line x1="12" y1="8" x2="12.01" y2="8"/>
    </svg>
  ),
  ChevronDown: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  ),
  Droplet: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/>
    </svg>
  ),
  Home: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  ),
  Plus: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19"/>
      <line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  Edit: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  ),
  Trash: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6"/>
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
    </svg>
  ),
  Users: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  BarChart: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="20" x2="12" y2="10"/>
      <line x1="18" y1="20" x2="18" y2="4"/>
      <line x1="6" y1="20" x2="6" y2="16"/>
    </svg>
  ),
  LogOut: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
      <polyline points="16 17 21 12 16 7"/>
      <line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  Sun: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  ),
  Moon: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
};

// Food preferences options
const FOOD_OPTIONS = {
  carbs: [
    { value: 'pates', label: 'Pâtes' },
    { value: 'riz', label: 'Riz' },
    { value: 'flocons_avoine', label: "Flocons d'avoine" },
    { value: 'pommes_de_terre', label: 'Pommes de terre' },
    { value: 'patates_douces', label: 'Patates douces' },
    { value: 'pain_complet', label: 'Pain complet' }
  ],
  proteins: [
    { value: 'poulet', label: 'Poulet' },
    { value: 'boeuf_hache', label: 'Boeuf haché' },
    { value: 'oeufs', label: 'Oeufs' },
    { value: 'poisson_blanc', label: 'Poisson blanc (cabillaud, colin)' },
    { value: 'whey', label: 'Whey' },
    { value: 'skyr', label: 'Skyr' }
  ],
  fats: [
    { value: 'amandes', label: 'Amandes' },
    { value: 'noix', label: 'Noix' },
    { value: 'huile_olive', label: "Huile d'olive" },
    { value: 'beurre_cacahuete', label: 'Beurre de cacahuète' }
  ]
};

// Loading Animation Component
const LoadingAnimation = ({ text }) => (
  <div className="loading-container">
    <div className="loading-spinner">
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
    </div>
    <p className="loading-text">{text}</p>
  </div>
);

// Navigation Component
const Navigation = ({ currentUser, onLogout, isAdmin, theme, onToggleTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="nav-header">
      <div className="nav-brand" onClick={() => navigate('/')}>
        <span className="brand-icon"><Icons.Target /></span>
        <span className="brand-text">MealGoal</span>
      </div>
      <div className="nav-right">
        <div className="nav-links">
          {currentUser && !isAdmin && (
            <>
              <button 
                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                onClick={() => navigate('/dashboard')}
              >
                <Icons.Home /> Dashboard
              </button>
              <button 
                className={`nav-link ${location.pathname === '/meal-plan' ? 'active' : ''}`}
                onClick={() => navigate('/meal-plan')}
              >
                <Icons.Utensils /> Plan alimentaire
              </button>
              <button 
                className={`nav-link ${location.pathname === '/weight-tracking' ? 'active' : ''}`}
                onClick={() => navigate('/weight-tracking')}
              >
                <Icons.Scale /> Suivi poids
              </button>
              <button 
                className={`nav-link ${location.pathname === '/rules' ? 'active' : ''}`}
                onClick={() => navigate('/rules')}
              >
                <Icons.Info /> Règles d'or
              </button>
            </>
          )}
          {isAdmin && (
            <>
              <button 
                className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                onClick={() => navigate('/admin')}
              >
                <Icons.BarChart /> Dashboard
              </button>
              <button 
                className={`nav-link ${location.pathname === '/admin/users' ? 'active' : ''}`}
                onClick={() => navigate('/admin/users')}
              >
                <Icons.Users /> Clients
              </button>
              <button 
                className={`nav-link ${location.pathname === '/admin/meal-plans' ? 'active' : ''}`}
                onClick={() => navigate('/admin/meal-plans')}
              >
                <Icons.Calendar /> Plans
              </button>
              <button 
                className={`nav-link ${location.pathname === '/admin/foods' ? 'active' : ''}`}
                onClick={() => navigate('/admin/foods')}
              >
                <Icons.Utensils /> Aliments
              </button>
            </>
          )}
          {(currentUser || isAdmin) && (
            <button className="nav-link logout" onClick={onLogout}>
              <Icons.LogOut /> Déconnexion
            </button>
          )}
        </div>
        <button className="theme-toggle" onClick={onToggleTheme} title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}>
          {theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
        </button>
      </div>
    </nav>
  );
};

// Home Page Component
const HomePage = ({ onStartQuestionnaire, onAdminLogin }) => {
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
          <button className="btn-secondary" onClick={onAdminLogin}>
            Accès Admin
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

// Questionnaire Component
const Questionnaire = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [isCalculating, setIsCalculating] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    nom: '',
    prenom: '',
    age: '',
    sexe: '',
    taille_cm: '',
    poids_initial_kg: '',
    date_demarrage: new Date().toISOString().split('T')[0],
    nombre_repas: 3,
    mode_alimentaire: 'classique',
    fenetre_alimentaire_debut: '12:00',
    fenetre_alimentaire_fin: '20:00',
    niveau_activite: '',
    objectif: '',
    preferences: {
      carbs: [],
      proteins: [],
      fats: []
    },
    heure_reveil: '07:00',
    heure_entrainement: '18:00',
    heure_coucher: '23:00',
    appetit_reveil: 'oui',
    preference_repas_copieux: 'soir'
  });

  const updateFormData = (field, value) => {
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const togglePreference = (category, value) => {
    setFormData(prev => {
      const current = prev.preferences[category];
      const updated = current.includes(value)
        ? current.filter(v => v !== value)
        : [...current, value];
      return {
        ...prev,
        preferences: {
          ...prev.preferences,
          [category]: updated
        }
      };
    });
  };

  const handleSubmit = async () => {
    setIsCalculating(true);
    try {
      const response = await axios.post(`${API_URL}/api/users`, formData);
      setTimeout(() => {
        setIsCalculating(false);
        onComplete(response.data);
      }, 2500);
    } catch (error) {
      setIsCalculating(false);
      alert(error.response?.data?.detail || 'Erreur lors de la création du profil');
    }
  };

  const totalSteps = 6;

  if (isCalculating) {
    return (
      <div className="questionnaire-container">
        <LoadingAnimation text="Calcul de votre plan personnalisé en cours..." />
      </div>
    );
  }

  return (
    <div className="questionnaire-container">
      <div className="questionnaire-card">
        <div className="progress-bar">
          <div className="progress-fill" style={{ width: `${(step / totalSteps) * 100}%` }}></div>
        </div>
        <div className="step-indicator">Étape {step} sur {totalSteps}</div>

        {step === 1 && (
          <div className="form-step">
            <h2>Identité et morphologie</h2>
            <p className="step-description">Commençons par faire connaissance</p>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Email *</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={e => updateFormData('email', e.target.value)}
                  placeholder="votre@email.com"
                />
              </div>
              <div className="form-group">
                <label>Nom *</label>
                <input 
                  type="text" 
                  value={formData.nom}
                  onChange={e => updateFormData('nom', e.target.value)}
                  placeholder="Votre nom"
                />
              </div>
              <div className="form-group">
                <label>Prénom *</label>
                <input 
                  type="text" 
                  value={formData.prenom}
                  onChange={e => updateFormData('prenom', e.target.value)}
                  placeholder="Votre prénom"
                />
              </div>
              <div className="form-group">
                <label>Âge *</label>
                <input 
                  type="number" 
                  value={formData.age}
                  onChange={e => updateFormData('age', parseInt(e.target.value) || '')}
                  placeholder="25"
                  min="16"
                  max="100"
                />
              </div>
              <div className="form-group">
                <label>Sexe *</label>
                <div className="radio-group">
                  <label className={`radio-option ${formData.sexe === 'homme' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="sexe" 
                      value="homme"
                      checked={formData.sexe === 'homme'}
                      onChange={e => updateFormData('sexe', e.target.value)}
                    />
                    Homme
                  </label>
                  <label className={`radio-option ${formData.sexe === 'femme' ? 'selected' : ''}`}>
                    <input 
                      type="radio" 
                      name="sexe" 
                      value="femme"
                      checked={formData.sexe === 'femme'}
                      onChange={e => updateFormData('sexe', e.target.value)}
                    />
                    Femme
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label>Taille (cm) *</label>
                <input 
                  type="number" 
                  value={formData.taille_cm}
                  onChange={e => updateFormData('taille_cm', parseInt(e.target.value) || '')}
                  placeholder="175"
                  min="100"
                  max="250"
                />
              </div>
              <div className="form-group">
                <label>Poids actuel (kg) *</label>
                <input 
                  type="number" 
                  value={formData.poids_initial_kg}
                  onChange={e => updateFormData('poids_initial_kg', parseFloat(e.target.value) || '')}
                  placeholder="75"
                  step="0.1"
                  min="30"
                  max="300"
                />
              </div>
              <div className="form-group">
                <label>Date de démarrage *</label>
                <input 
                  type="date" 
                  value={formData.date_demarrage}
                  onChange={e => updateFormData('date_demarrage', e.target.value)}
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="form-step">
            <h2>Mode alimentaire</h2>
            <p className="step-description">Définissez votre rythme alimentaire</p>
            
            <div className="form-group">
              <label>Nombre de repas par jour *</label>
              <div className="number-selector">
                {[1, 2, 3, 4, 5].map(num => (
                  <button 
                    key={num}
                    className={`number-option ${formData.nombre_repas === num ? 'selected' : ''}`}
                    onClick={() => updateFormData('nombre_repas', num)}
                  >
                    {num}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Mode alimentaire *</label>
              <div className="radio-group vertical">
                <label className={`radio-option ${formData.mode_alimentaire === 'classique' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="mode" 
                    value="classique"
                    checked={formData.mode_alimentaire === 'classique'}
                    onChange={e => updateFormData('mode_alimentaire', e.target.value)}
                  />
                  <div className="radio-content">
                    <span className="radio-title">Alimentation classique</span>
                    <span className="radio-desc">Repas répartis sur la journée</span>
                  </div>
                </label>
                <label className={`radio-option ${formData.mode_alimentaire === 'jeune_intermittent' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="mode" 
                    value="jeune_intermittent"
                    checked={formData.mode_alimentaire === 'jeune_intermittent'}
                    onChange={e => updateFormData('mode_alimentaire', e.target.value)}
                  />
                  <div className="radio-content">
                    <span className="radio-title">Jeûne intermittent</span>
                    <span className="radio-desc">Repas concentrés sur une fenêtre horaire</span>
                  </div>
                </label>
              </div>
            </div>

            {formData.mode_alimentaire === 'jeune_intermittent' && (
              <div className="form-group fasting-window">
                <label>Fenêtre alimentaire</label>
                <div className="time-range">
                  <input 
                    type="time" 
                    value={formData.fenetre_alimentaire_debut}
                    onChange={e => updateFormData('fenetre_alimentaire_debut', e.target.value)}
                  />
                  <span>à</span>
                  <input 
                    type="time" 
                    value={formData.fenetre_alimentaire_fin}
                    onChange={e => updateFormData('fenetre_alimentaire_fin', e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="form-step">
            <h2>Activité et objectif</h2>
            <p className="step-description">Définissez votre niveau d'activité et votre objectif</p>
            
            <div className="form-group">
              <label>Niveau d'activité *</label>
              <div className="radio-group vertical">
                <label className={`radio-option ${formData.niveau_activite === 'sedentaire' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="activite" 
                    value="sedentaire"
                    checked={formData.niveau_activite === 'sedentaire'}
                    onChange={e => updateFormData('niveau_activite', e.target.value)}
                  />
                  <div className="radio-content">
                    <span className="radio-title">Sédentaire</span>
                    <span className="radio-desc">Peu ou pas d'exercice</span>
                  </div>
                </label>
                <label className={`radio-option ${formData.niveau_activite === 'modere' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="activite" 
                    value="modere"
                    checked={formData.niveau_activite === 'modere'}
                    onChange={e => updateFormData('niveau_activite', e.target.value)}
                  />
                  <div className="radio-content">
                    <span className="radio-title">Modéré</span>
                    <span className="radio-desc">1 à 3 entraînements / semaine</span>
                  </div>
                </label>
                <label className={`radio-option ${formData.niveau_activite === 'actif' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="activite" 
                    value="actif"
                    checked={formData.niveau_activite === 'actif'}
                    onChange={e => updateFormData('niveau_activite', e.target.value)}
                  />
                  <div className="radio-content">
                    <span className="radio-title">Actif</span>
                    <span className="radio-desc">2 à 4 entraînements / semaine</span>
                  </div>
                </label>
                <label className={`radio-option ${formData.niveau_activite === 'tres_actif' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="activite" 
                    value="tres_actif"
                    checked={formData.niveau_activite === 'tres_actif'}
                    onChange={e => updateFormData('niveau_activite', e.target.value)}
                  />
                  <div className="radio-content">
                    <span className="radio-title">Très actif</span>
                    <span className="radio-desc">5 à 6 entraînements / semaine</span>
                  </div>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Objectif principal *</label>
              <div className="radio-group vertical">
                <label className={`radio-option ${formData.objectif === 'perte_de_gras' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="objectif" 
                    value="perte_de_gras"
                    checked={formData.objectif === 'perte_de_gras'}
                    onChange={e => updateFormData('objectif', e.target.value)}
                  />
                  <div className="radio-content">
                    <span className="radio-title">Perte de gras</span>
                    <span className="radio-desc">Réduire le pourcentage de masse grasse</span>
                  </div>
                </label>
                <label className={`radio-option ${formData.objectif === 'maintien' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="objectif" 
                    value="maintien"
                    checked={formData.objectif === 'maintien'}
                    onChange={e => updateFormData('objectif', e.target.value)}
                  />
                  <div className="radio-content">
                    <span className="radio-title">Maintien / Remise en forme</span>
                    <span className="radio-desc">Stabiliser votre poids actuel</span>
                  </div>
                </label>
                <label className={`radio-option ${formData.objectif === 'prise_de_muscle' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="objectif" 
                    value="prise_de_muscle"
                    checked={formData.objectif === 'prise_de_muscle'}
                    onChange={e => updateFormData('objectif', e.target.value)}
                  />
                  <div className="radio-content">
                    <span className="radio-title">Prise de muscle</span>
                    <span className="radio-desc">Augmenter votre masse musculaire</span>
                  </div>
                </label>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="form-step">
            <h2>Préférences alimentaires</h2>
            <p className="step-description">Sélectionnez les aliments que vous souhaitez inclure</p>
            
            <div className="preferences-section">
              <h3>Sources de glucides</h3>
              <div className="checkbox-grid">
                {FOOD_OPTIONS.carbs.map(option => (
                  <label 
                    key={option.value}
                    className={`checkbox-option ${formData.preferences.carbs.includes(option.value) ? 'selected' : ''}`}
                  >
                    <input 
                      type="checkbox"
                      checked={formData.preferences.carbs.includes(option.value)}
                      onChange={() => togglePreference('carbs', option.value)}
                    />
                    <span className="checkbox-label">{option.label}</span>
                    {formData.preferences.carbs.includes(option.value) && <Icons.Check />}
                  </label>
                ))}
              </div>
            </div>

            <div className="preferences-section">
              <h3>Sources de protéines</h3>
              <div className="checkbox-grid">
                {FOOD_OPTIONS.proteins.map(option => (
                  <label 
                    key={option.value}
                    className={`checkbox-option ${formData.preferences.proteins.includes(option.value) ? 'selected' : ''}`}
                  >
                    <input 
                      type="checkbox"
                      checked={formData.preferences.proteins.includes(option.value)}
                      onChange={() => togglePreference('proteins', option.value)}
                    />
                    <span className="checkbox-label">{option.label}</span>
                    {formData.preferences.proteins.includes(option.value) && <Icons.Check />}
                  </label>
                ))}
              </div>
            </div>

            <div className="preferences-section">
              <h3>Sources de lipides</h3>
              <div className="checkbox-grid">
                {FOOD_OPTIONS.fats.map(option => (
                  <label 
                    key={option.value}
                    className={`checkbox-option ${formData.preferences.fats.includes(option.value) ? 'selected' : ''}`}
                  >
                    <input 
                      type="checkbox"
                      checked={formData.preferences.fats.includes(option.value)}
                      onChange={() => togglePreference('fats', option.value)}
                    />
                    <span className="checkbox-label">{option.label}</span>
                    {formData.preferences.fats.includes(option.value) && <Icons.Check />}
                  </label>
                ))}
              </div>
            </div>
          </div>
        )}

        {step === 5 && (
          <div className="form-step">
            <h2>Rythme de vie</h2>
            <p className="step-description">Indiquez vos horaires habituels</p>
            
            <div className="form-grid">
              <div className="form-group">
                <label><Icons.Clock /> Heure de réveil *</label>
                <input 
                  type="time" 
                  value={formData.heure_reveil}
                  onChange={e => updateFormData('heure_reveil', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label><Icons.Target /> Heure d'entraînement *</label>
                <input 
                  type="time" 
                  value={formData.heure_entrainement}
                  onChange={e => updateFormData('heure_entrainement', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label><Icons.Clock /> Heure de coucher *</label>
                <input 
                  type="time" 
                  value={formData.heure_coucher}
                  onChange={e => updateFormData('heure_coucher', e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label>Appétit au réveil *</label>
              <div className="radio-group">
                <label className={`radio-option ${formData.appetit_reveil === 'oui' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="appetit" 
                    value="oui"
                    checked={formData.appetit_reveil === 'oui'}
                    onChange={e => updateFormData('appetit_reveil', e.target.value)}
                  />
                  Oui
                </label>
                <label className={`radio-option ${formData.appetit_reveil === 'non' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="appetit" 
                    value="non"
                    checked={formData.appetit_reveil === 'non'}
                    onChange={e => updateFormData('appetit_reveil', e.target.value)}
                  />
                  Non
                </label>
                <label className={`radio-option ${formData.appetit_reveil === 'variable' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="appetit" 
                    value="variable"
                    checked={formData.appetit_reveil === 'variable'}
                    onChange={e => updateFormData('appetit_reveil', e.target.value)}
                  />
                  Variable
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>Préférence repas copieux *</label>
              <div className="radio-group">
                <label className={`radio-option ${formData.preference_repas_copieux === 'midi' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="copieux" 
                    value="midi"
                    checked={formData.preference_repas_copieux === 'midi'}
                    onChange={e => updateFormData('preference_repas_copieux', e.target.value)}
                  />
                  Midi
                </label>
                <label className={`radio-option ${formData.preference_repas_copieux === 'soir' ? 'selected' : ''}`}>
                  <input 
                    type="radio" 
                    name="copieux" 
                    value="soir"
                    checked={formData.preference_repas_copieux === 'soir'}
                    onChange={e => updateFormData('preference_repas_copieux', e.target.value)}
                  />
                  Soir
                </label>
              </div>
            </div>
          </div>
        )}

        {step === 6 && (
          <div className="form-step">
            <h2>Récapitulatif</h2>
            <p className="step-description">Vérifiez vos informations avant de valider</p>
            
            <div className="summary-grid">
              <div className="summary-section">
                <h4>Profil</h4>
                <p><strong>{formData.prenom} {formData.nom}</strong></p>
                <p>{formData.age} ans, {formData.sexe === 'homme' ? 'Homme' : 'Femme'}</p>
                <p>{formData.taille_cm} cm, {formData.poids_initial_kg} kg</p>
              </div>
              <div className="summary-section">
                <h4>Objectif</h4>
                <p>{formData.objectif === 'perte_de_gras' ? 'Perte de gras' : 
                   formData.objectif === 'maintien' ? 'Maintien' : 'Prise de muscle'}</p>
                <p>Activité: {formData.niveau_activite === 'sedentaire' ? 'Sédentaire' :
                            formData.niveau_activite === 'modere' ? 'Modéré' :
                            formData.niveau_activite === 'actif' ? 'Actif' : 'Très actif'}</p>
              </div>
              <div className="summary-section">
                <h4>Alimentation</h4>
                <p>{formData.nombre_repas} repas/jour</p>
                <p>{formData.mode_alimentaire === 'classique' ? 'Mode classique' : 'Jeûne intermittent'}</p>
              </div>
              <div className="summary-section">
                <h4>Rythme</h4>
                <p>Réveil: {formData.heure_reveil}</p>
                <p>Entraînement: {formData.heure_entrainement}</p>
                <p>Coucher: {formData.heure_coucher}</p>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions">
          {step > 1 && (
            <button className="btn-secondary" onClick={() => setStep(step - 1)}>
              Précédent
            </button>
          )}
          {step < totalSteps && (
            <button className="btn-primary" onClick={() => setStep(step + 1)}>
              Suivant <Icons.ArrowRight />
            </button>
          )}
          {step === totalSteps && (
            <button className="btn-primary" onClick={handleSubmit}>
              Générer mon plan <Icons.Check />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = ({ user }) => {
  const COLORS = ['#4CAF50', '#2196F3', '#FF9800'];
  
  const macrosData = [
    { name: 'Protéines', value: user.proteines_g, color: '#4CAF50' },
    { name: 'Glucides', value: user.glucides_g, color: '#2196F3' },
    { name: 'Lipides', value: user.lipides_g, color: '#FF9800' }
  ];

  const getObjectifLabel = (objectif) => {
    switch(objectif) {
      case 'perte_de_gras': return 'Perte de gras';
      case 'maintien': return 'Maintien';
      case 'prise_de_muscle': return 'Prise de muscle';
      default: return objectif;
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div>
          <h1>Bonjour {user.prenom} !</h1>
          <p className="subtitle">Voici votre programme personnalisé</p>
        </div>
        <div className="objective-badge">
          <Icons.Target />
          {getObjectifLabel(user.objectif)}
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card primary">
          <div className="stat-icon"><Icons.Scale /></div>
          <div className="stat-content">
            <span className="stat-value">{user.calories_journalieres}</span>
            <span className="stat-label">Calories / jour</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon protein"><Icons.Target /></div>
          <div className="stat-content">
            <span className="stat-value">{user.proteines_g}g</span>
            <span className="stat-label">Protéines</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon carbs"><Icons.Droplet /></div>
          <div className="stat-content">
            <span className="stat-value">{user.glucides_g}g</span>
            <span className="stat-label">Glucides</span>
          </div>
        </div>
        
        <div className="stat-card">
          <div className="stat-icon fats"><Icons.Scale /></div>
          <div className="stat-content">
            <span className="stat-value">{user.lipides_g}g</span>
            <span className="stat-label">Lipides</span>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="chart-card">
          <h3>Répartition des macronutriments</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={macrosData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {macrosData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => `${value}g`} />
              </PieChart>
            </ResponsiveContainer>
            <div className="chart-legend">
              {macrosData.map((item, index) => (
                <div key={index} className="legend-item">
                  <span className="legend-color" style={{ backgroundColor: item.color }}></span>
                  <span>{item.name}: {item.value}g</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="info-card">
          <h3>Votre profil</h3>
          <div className="profile-details">
            <div className="detail-row">
              <span className="detail-label">Âge</span>
              <span className="detail-value">{user.age} ans</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Taille</span>
              <span className="detail-value">{user.taille_cm} cm</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Poids initial</span>
              <span className="detail-value">{user.poids_initial_kg} kg</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Nombre de repas</span>
              <span className="detail-value">{user.nombre_repas} / jour</span>
            </div>
            <div className="detail-row">
              <span className="detail-label">Mode</span>
              <span className="detail-value">
                {user.mode_alimentaire === 'classique' ? 'Classique' : 'Jeûne intermittent'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Meal Plan Component
const MealPlan = ({ user }) => {
  const [mealPlan, setMealPlan] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMealPlan();
  }, [user.id]);

  const fetchMealPlan = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/meal-plans/${user.id}/today`);
      setMealPlan(response.data);
    } catch (error) {
      console.error('Error fetching meal plan:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingAnimation text="Chargement du plan alimentaire..." />;
  }

  if (!mealPlan) {
    return (
      <div className="error-container">
        <p>Impossible de charger le plan alimentaire.</p>
        <button className="btn-primary" onClick={fetchMealPlan}>Réessayer</button>
      </div>
    );
  }

  return (
    <div className="meal-plan-container">
      <div className="meal-plan-header">
        <h1>Plan alimentaire du jour</h1>
        <p className="date-display">
          <Icons.Calendar />
          {new Date(mealPlan.date).toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </p>
      </div>

      <div className="meal-plan-summary">
        <div className="summary-item">
          <span className="summary-label">Objectif</span>
          <span className="summary-value">{mealPlan.objectif_calories} kcal</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Total prévu</span>
          <span className="summary-value">{Math.round(mealPlan.total_calories)} kcal</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Protéines</span>
          <span className="summary-value">{Math.round(mealPlan.total_proteines)}g / {mealPlan.objectif_proteines}g</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Glucides</span>
          <span className="summary-value">{Math.round(mealPlan.total_glucides)}g / {mealPlan.objectif_glucides}g</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Lipides</span>
          <span className="summary-value">{Math.round(mealPlan.total_lipides)}g / {mealPlan.objectif_lipides}g</span>
        </div>
      </div>

      <div className="meals-list">
        {mealPlan.meals.map((meal, index) => (
          <div key={index} className="meal-card">
            <div className="meal-header">
              <div className="meal-title">
                <Icons.Clock />
                <span className="meal-time">{meal.heure}</span>
                <span className="meal-name">{meal.nom}</span>
              </div>
              <div className="meal-calories">{Math.round(meal.total_calories)} kcal</div>
            </div>
            
            <div className="meal-items">
              {meal.items.map((item, itemIndex) => (
                <div key={itemIndex} className="meal-item">
                  <span className="item-name">{item.food_name}</span>
                  <span className="item-quantity">{item.quantity_g}g</span>
                  <div className="item-macros">
                    <span className="macro protein">P: {Math.round(item.proteines)}g</span>
                    <span className="macro carbs">G: {Math.round(item.glucides)}g</span>
                    <span className="macro fats">L: {Math.round(item.lipides)}g</span>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="meal-footer">
              <span>P: {Math.round(meal.total_proteines)}g</span>
              <span>G: {Math.round(meal.total_glucides)}g</span>
              <span>L: {Math.round(meal.total_lipides)}g</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Weight Tracking Component
const WeightTracking = ({ user }) => {
  const [weightStats, setWeightStats] = useState(null);
  const [newWeight, setNewWeight] = useState('');
  const [loading, setLoading] = useState(true);
  const [showReminder, setShowReminder] = useState(false);

  useEffect(() => {
    fetchWeightStats();
    checkWeighInReminder();
  }, [user.id]);

  const fetchWeightStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/weight-logs/${user.id}/stats`);
      setWeightStats(response.data);
    } catch (error) {
      console.error('Error fetching weight stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkWeighInReminder = () => {
    // Check if it's been 2 weeks since last weigh-in
    if (weightStats && weightStats.historique.length > 0) {
      const lastWeighIn = new Date(weightStats.historique[weightStats.historique.length - 1].date);
      const daysSinceLastWeighIn = Math.floor((new Date() - lastWeighIn) / (1000 * 60 * 60 * 24));
      setShowReminder(daysSinceLastWeighIn >= 14);
    }
  };

  const handleSubmitWeight = async () => {
    if (!newWeight) return;
    
    try {
      await axios.post(`${API_URL}/api/weight-logs`, {
        user_id: user.id,
        poids_kg: parseFloat(newWeight),
        date: new Date().toISOString().split('T')[0]
      });
      setNewWeight('');
      fetchWeightStats();
    } catch (error) {
      alert('Erreur lors de l\'enregistrement du poids');
    }
  };

  if (loading) {
    return <LoadingAnimation text="Chargement du suivi..." />;
  }

  const getTrendIcon = () => {
    if (!weightStats) return <Icons.ArrowRight />;
    switch (weightStats.tendance) {
      case 'baisse': return <Icons.TrendingDown />;
      case 'hausse': return <Icons.TrendingUp />;
      default: return <Icons.ArrowRight />;
    }
  };

  const chartData = weightStats?.historique.map(log => ({
    date: new Date(log.date).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' }),
    poids: log.poids_kg
  })) || [];

  return (
    <div className="weight-tracking-container">
      <div className="weight-header">
        <h1>Suivi du poids</h1>
        <p className="weight-reminder">
          <Icons.Info />
          Pesée à jeun le matin pour une fiabilité optimale des données
        </p>
      </div>

      {showReminder && (
        <div className="weight-reminder-banner">
          <Icons.Scale />
          <span>Il est temps de vous peser ! Votre dernière pesée date de plus de 2 semaines.</span>
        </div>
      )}

      <div className="weight-input-card">
        <h3>Enregistrer votre poids</h3>
        <div className="weight-input-group">
          <input
            type="number"
            value={newWeight}
            onChange={e => setNewWeight(e.target.value)}
            placeholder="Votre poids en kg"
            step="0.1"
          />
          <button className="btn-primary" onClick={handleSubmitWeight}>
            Enregistrer
          </button>
        </div>
      </div>

      {weightStats && (
        <>
          <div className="weight-stats-grid">
            <div className="weight-stat-card">
              <span className="stat-label">Poids initial</span>
              <span className="stat-value">{weightStats.poids_initial} kg</span>
            </div>
            <div className="weight-stat-card">
              <span className="stat-label">Poids actuel</span>
              <span className="stat-value">{weightStats.poids_actuel} kg</span>
            </div>
            <div className="weight-stat-card">
              <span className="stat-label">Évolution</span>
              <span className={`stat-value ${weightStats.evolution < 0 ? 'negative' : weightStats.evolution > 0 ? 'positive' : ''}`}>
                {weightStats.evolution > 0 ? '+' : ''}{weightStats.evolution} kg
              </span>
            </div>
            <div className="weight-stat-card">
              <span className="stat-label">Tendance</span>
              <span className="stat-value trend">
                {getTrendIcon()}
                {weightStats.tendance === 'baisse' ? 'Baisse' : 
                 weightStats.tendance === 'hausse' ? 'Hausse' : 'Stable'}
              </span>
            </div>
          </div>

          {chartData.length > 1 && (
            <div className="weight-chart-card">
              <h3>Évolution du poids</h3>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(24, 24, 24, 0.1)" />
                  <XAxis dataKey="date" stroke="rgb(112, 112, 112)" />
                  <YAxis domain={['auto', 'auto']} stroke="rgb(112, 112, 112)" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'white', 
                      border: '1px solid rgba(24, 24, 24, 0.1)',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="poids" 
                    stroke="rgb(0, 128, 255)" 
                    strokeWidth={2}
                    dot={{ fill: 'rgb(0, 128, 255)', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
};

// Nutritional Rules Component
const NutritionalRules = () => {
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRules();
  }, []);

  const fetchRules = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/nutritional-rules`);
      setRules(response.data.regles);
    } catch (error) {
      console.error('Error fetching rules:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingAnimation text="Chargement des règles..." />;
  }

  return (
    <div className="rules-container">
      <div className="rules-header">
        <h1>Règles d'or nutritionnelles</h1>
        <p className="rules-subtitle">
          Ces règles sont à respecter pour optimiser vos résultats
        </p>
      </div>

      <div className="rules-grid">
        {rules.map((rule, index) => (
          <div key={index} className="rule-card">
            <div className="rule-number">{index + 1}</div>
            <h3>{rule.titre}</h3>
            <p>{rule.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

// Admin Dashboard Component
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/stats`);
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingAnimation text="Chargement des statistiques..." />;
  }

  return (
    <div className="admin-dashboard">
      <h1>Dashboard Admin</h1>
      
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon"><Icons.Users /></div>
          <div className="admin-stat-content">
            <span className="admin-stat-value">{stats?.total_clients || 0}</span>
            <span className="admin-stat-label">Clients actifs</span>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-icon loss"><Icons.TrendingDown /></div>
          <div className="admin-stat-content">
            <span className="admin-stat-value">{stats?.poids_moyen_perdu || 0} kg</span>
            <span className="admin-stat-label">Poids moyen perdu</span>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-icon gain"><Icons.TrendingUp /></div>
          <div className="admin-stat-content">
            <span className="admin-stat-value">{stats?.poids_moyen_gagne || 0} kg</span>
            <span className="admin-stat-label">Poids moyen gagné</span>
          </div>
        </div>
        
        <div className="admin-stat-card">
          <div className="admin-stat-icon"><Icons.Target /></div>
          <div className="admin-stat-content">
            <span className="admin-stat-value">{stats?.clients_en_perte || 0}</span>
            <span className="admin-stat-label">Clients en perte</span>
          </div>
        </div>
      </div>

      {stats?.distribution_objectifs && (
        <div className="admin-chart-card">
          <h3>Distribution des objectifs</h3>
          <div className="objectives-list">
            {Object.entries(stats.distribution_objectifs).map(([objectif, count]) => (
              <div key={objectif} className="objective-item">
                <span className="objective-name">
                  {objectif === 'perte_de_gras' ? 'Perte de gras' :
                   objectif === 'maintien' ? 'Maintien' : 'Prise de muscle'}
                </span>
                <span className="objective-count">{count} clients</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Admin Users Component
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer ${userName} et toutes ses données (plans, pesées) ?`)) {
      return;
    }
    
    try {
      await axios.delete(`${API_URL}/api/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      if (selectedUser?.id === userId) {
        setShowDetailModal(false);
        setSelectedUser(null);
      }
    } catch (error) {
      alert('Erreur lors de la suppression');
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const getActivityLabel = (niveau) => {
    switch(niveau) {
      case 'sedentaire': return 'Sédentaire (peu ou pas d\'exercice)';
      case 'modere': return 'Modéré (1-3 entraînements/sem)';
      case 'actif': return 'Actif (2-4 entraînements/sem)';
      case 'tres_actif': return 'Très actif (5-6 entraînements/sem)';
      default: return niveau;
    }
  };

  const getModeLabel = (mode) => {
    return mode === 'jeune_intermittent' ? 'Jeûne intermittent' : 'Classique';
  };

  const getAppetitLabel = (appetit) => {
    switch(appetit) {
      case 'oui': return 'Oui';
      case 'non': return 'Non';
      case 'variable': return 'Variable';
      default: return appetit;
    }
  };

  if (loading) {
    return <LoadingAnimation text="Chargement des utilisateurs..." />;
  }

  return (
    <div className="admin-users">
      <h1>Gestion des clients</h1>
      
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Activité</th>
              <th>Objectif</th>
              <th>Calories</th>
              <th>Poids</th>
              <th>Évolution</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>
                  <div className="user-cell">
                    <span className="user-fullname">{user.prenom} {user.nom}</span>
                    <span className="user-meta">{user.age} ans, {user.taille_cm} cm</span>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`activity-badge ${user.niveau_activite}`}>
                    {user.niveau_activite === 'sedentaire' ? 'Sédentaire' :
                     user.niveau_activite === 'modere' ? '1-3x/sem' :
                     user.niveau_activite === 'actif' ? '2-4x/sem' : '5-6x/sem'}
                  </span>
                </td>
                <td>
                  <span className={`objective-badge-small ${user.objectif}`}>
                    {user.objectif === 'perte_de_gras' ? 'Perte' :
                     user.objectif === 'maintien' ? 'Maintien' : 'Prise'}
                  </span>
                </td>
                <td>{user.calories_journalieres} kcal</td>
                <td>
                  <div className="weight-cell">
                    <span>{user.poids_actuel || user.poids_initial_kg} kg</span>
                    <span className="weight-initial">Initial: {user.poids_initial_kg} kg</span>
                  </div>
                </td>
                <td className={user.evolution_poids < 0 ? 'negative' : user.evolution_poids > 0 ? 'positive' : ''}>
                  {user.evolution_poids > 0 ? '+' : ''}{user.evolution_poids} kg
                  <span className="pesees-count">({user.nombre_pesees} pesées)</span>
                </td>
                <td className="actions-cell">
                  <button className="action-btn view" onClick={() => handleViewDetails(user)} title="Voir détails">
                    <Icons.Info />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDeleteUser(user.id, `${user.prenom} ${user.nom}`)} title="Supprimer">
                    <Icons.Trash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* User Detail Modal */}
      {showDetailModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowDetailModal(false)}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
            <h2>Fiche client : {selectedUser.prenom} {selectedUser.nom}</h2>
            
            <div className="user-detail-grid">
              <div className="detail-section">
                <h4>Identité</h4>
                <div className="detail-list">
                  <div className="detail-item">
                    <span className="label">Email</span>
                    <span className="value">{selectedUser.email}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Âge</span>
                    <span className="value">{selectedUser.age} ans</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Sexe</span>
                    <span className="value">{selectedUser.sexe === 'homme' ? 'Homme' : 'Femme'}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Taille</span>
                    <span className="value">{selectedUser.taille_cm} cm</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Objectifs & Activité</h4>
                <div className="detail-list">
                  <div className="detail-item">
                    <span className="label">Objectif</span>
                    <span className="value highlight">
                      {selectedUser.objectif === 'perte_de_gras' ? 'Perte de gras' :
                       selectedUser.objectif === 'maintien' ? 'Maintien / Remise en forme' : 'Prise de muscle'}
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Niveau d'activité</span>
                    <span className="value highlight">{getActivityLabel(selectedUser.niveau_activite)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Date de démarrage</span>
                    <span className="value">{new Date(selectedUser.date_demarrage).toLocaleDateString('fr-FR')}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Plan nutritionnel</h4>
                <div className="detail-list">
                  <div className="detail-item">
                    <span className="label">Calories/jour</span>
                    <span className="value calories">{selectedUser.calories_journalieres} kcal</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Protéines</span>
                    <span className="value">{selectedUser.proteines_g}g</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Glucides</span>
                    <span className="value">{selectedUser.glucides_g}g</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Lipides</span>
                    <span className="value">{selectedUser.lipides_g}g</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Mode alimentaire</h4>
                <div className="detail-list">
                  <div className="detail-item">
                    <span className="label">Mode</span>
                    <span className="value">{getModeLabel(selectedUser.mode_alimentaire)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Nombre de repas</span>
                    <span className="value">{selectedUser.nombre_repas} repas/jour</span>
                  </div>
                  {selectedUser.mode_alimentaire === 'jeune_intermittent' && (
                    <div className="detail-item">
                      <span className="label">Fenêtre alimentaire</span>
                      <span className="value">{selectedUser.fenetre_alimentaire_debut} - {selectedUser.fenetre_alimentaire_fin}</span>
                    </div>
                  )}
                  <div className="detail-item">
                    <span className="label">Appétit au réveil</span>
                    <span className="value">{getAppetitLabel(selectedUser.appetit_reveil)}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Repas copieux préféré</span>
                    <span className="value">{selectedUser.preference_repas_copieux === 'midi' ? 'Midi' : 'Soir'}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Rythme de vie</h4>
                <div className="detail-list">
                  <div className="detail-item">
                    <span className="label">Heure de réveil</span>
                    <span className="value">{selectedUser.heure_reveil}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Heure d'entraînement</span>
                    <span className="value highlight">{selectedUser.heure_entrainement}</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Heure de coucher</span>
                    <span className="value">{selectedUser.heure_coucher}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section">
                <h4>Évolution du poids</h4>
                <div className="detail-list">
                  <div className="detail-item">
                    <span className="label">Poids initial</span>
                    <span className="value">{selectedUser.poids_initial_kg} kg</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Poids actuel</span>
                    <span className="value">{selectedUser.poids_actuel || selectedUser.poids_initial_kg} kg</span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Évolution</span>
                    <span className={`value ${selectedUser.evolution_poids < 0 ? 'negative' : selectedUser.evolution_poids > 0 ? 'positive' : ''}`}>
                      {selectedUser.evolution_poids > 0 ? '+' : ''}{selectedUser.evolution_poids || 0} kg
                    </span>
                  </div>
                  <div className="detail-item">
                    <span className="label">Nombre de pesées</span>
                    <span className="value">{selectedUser.nombre_pesees || 0}</span>
                  </div>
                </div>
              </div>

              <div className="detail-section full-width">
                <h4>Préférences alimentaires</h4>
                <div className="preferences-display">
                  <div className="pref-group">
                    <span className="pref-label">Glucides:</span>
                    <div className="pref-tags">
                      {selectedUser.preferences?.carbs?.length > 0 ? 
                        selectedUser.preferences.carbs.map((c, i) => (
                          <span key={i} className="pref-tag carbs">{c}</span>
                        )) : <span className="no-pref">Aucune préférence</span>
                      }
                    </div>
                  </div>
                  <div className="pref-group">
                    <span className="pref-label">Protéines:</span>
                    <div className="pref-tags">
                      {selectedUser.preferences?.proteins?.length > 0 ? 
                        selectedUser.preferences.proteins.map((p, i) => (
                          <span key={i} className="pref-tag proteins">{p}</span>
                        )) : <span className="no-pref">Aucune préférence</span>
                      }
                    </div>
                  </div>
                  <div className="pref-group">
                    <span className="pref-label">Lipides:</span>
                    <div className="pref-tags">
                      {selectedUser.preferences?.fats?.length > 0 ? 
                        selectedUser.preferences.fats.map((f, i) => (
                          <span key={i} className="pref-tag fats">{f}</span>
                        )) : <span className="no-pref">Aucune préférence</span>
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="btn-danger" 
                onClick={() => handleDeleteUser(selectedUser.id, `${selectedUser.prenom} ${selectedUser.nom}`)}
              >
                <Icons.Trash /> Supprimer ce client
              </button>
              <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Admin Foods Component
const AdminFoods = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);
  const [formData, setFormData] = useState({
    nom: '',
    categorie: 'proteines',
    calories_100g: '',
    proteines_100g: '',
    glucides_100g: '',
    lipides_100g: '',
    petit_dejeuner: true,
    dejeuner: true,
    diner: true,
    collation: true
  });

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/foods`);
      setFoods(response.data);
    } catch (error) {
      console.error('Error fetching foods:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        calories_100g: parseFloat(formData.calories_100g),
        proteines_100g: parseFloat(formData.proteines_100g),
        glucides_100g: parseFloat(formData.glucides_100g),
        lipides_100g: parseFloat(formData.lipides_100g)
      };

      if (editingFood) {
        await axios.put(`${API_URL}/api/foods/${editingFood.id}`, data);
      } else {
        await axios.post(`${API_URL}/api/foods`, data);
      }
      
      setShowModal(false);
      setEditingFood(null);
      setFormData({
        nom: '',
        categorie: 'proteines',
        calories_100g: '',
        proteines_100g: '',
        glucides_100g: '',
        lipides_100g: '',
        petit_dejeuner: true,
        dejeuner: true,
        diner: true,
        collation: true
      });
      fetchFoods();
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleEdit = (food) => {
    setEditingFood(food);
    setFormData({
      nom: food.nom,
      categorie: food.categorie,
      calories_100g: food.calories_100g,
      proteines_100g: food.proteines_100g,
      glucides_100g: food.glucides_100g,
      lipides_100g: food.lipides_100g,
      petit_dejeuner: food.petit_dejeuner !== false,
      dejeuner: food.dejeuner !== false,
      diner: food.diner !== false,
      collation: food.collation !== false
    });
    setShowModal(true);
  };

  const handleDelete = async (foodId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet aliment ?')) {
      try {
        await axios.delete(`${API_URL}/api/foods/${foodId}`);
        fetchFoods();
      } catch (error) {
        alert('Erreur lors de la suppression');
      }
    }
  };

  if (loading) {
    return <LoadingAnimation text="Chargement des aliments..." />;
  }

  return (
    <div className="admin-foods">
      <div className="admin-foods-header">
        <h1>Banque d'aliments</h1>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Icons.Plus /> Ajouter un aliment
        </button>
      </div>

      <div className="foods-table-container">
        <table className="foods-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Catégorie</th>
              <th>Calories/100g</th>
              <th>Protéines</th>
              <th>Glucides</th>
              <th>Lipides</th>
              <th>Repas</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {foods.map(food => (
              <tr key={food.id}>
                <td>{food.nom}</td>
                <td className="category-cell">
                  <span className={`category-badge ${food.categorie}`}>
                    {food.categorie}
                  </span>
                </td>
                <td>{food.calories_100g}</td>
                <td>{food.proteines_100g}g</td>
                <td>{food.glucides_100g}g</td>
                <td>{food.lipides_100g}g</td>
                <td className="meal-tags">
                  {food.petit_dejeuner !== false && <span className="meal-tag">PD</span>}
                  {food.dejeuner !== false && <span className="meal-tag">Déj</span>}
                  {food.diner !== false && <span className="meal-tag">Dîn</span>}
                  {food.collation !== false && <span className="meal-tag">Col</span>}
                </td>
                <td className="actions-cell">
                  <button className="action-btn edit" onClick={() => handleEdit(food)}>
                    <Icons.Edit />
                  </button>
                  <button className="action-btn delete" onClick={() => handleDelete(food.id)}>
                    <Icons.Trash />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <h2>{editingFood ? 'Modifier l\'aliment' : 'Ajouter un aliment'}</h2>
            
            <div className="form-group">
              <label>Nom de l'aliment</label>
              <input
                type="text"
                value={formData.nom}
                onChange={e => setFormData({...formData, nom: e.target.value})}
                placeholder="Ex: Banane, Quinoa, Saumon..."
              />
            </div>
            
            <div className="form-group">
              <label>Catégorie</label>
              <select
                value={formData.categorie}
                onChange={e => setFormData({...formData, categorie: e.target.value})}
              >
                <option value="proteines">Protéines</option>
                <option value="glucides">Glucides</option>
                <option value="lipides">Lipides</option>
              </select>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label>Calories/100g</label>
                <input
                  type="number"
                  value={formData.calories_100g}
                  onChange={e => setFormData({...formData, calories_100g: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Protéines/100g</label>
                <input
                  type="number"
                  value={formData.proteines_100g}
                  onChange={e => setFormData({...formData, proteines_100g: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Glucides/100g</label>
                <input
                  type="number"
                  value={formData.glucides_100g}
                  onChange={e => setFormData({...formData, glucides_100g: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label>Lipides/100g</label>
                <input
                  type="number"
                  value={formData.lipides_100g}
                  onChange={e => setFormData({...formData, lipides_100g: e.target.value})}
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Repas autorisés</label>
              <div className="checkbox-row">
                <label className={`checkbox-pill ${formData.petit_dejeuner ? 'active' : ''}`}>
                  <input 
                    type="checkbox" 
                    checked={formData.petit_dejeuner}
                    onChange={e => setFormData({...formData, petit_dejeuner: e.target.checked})}
                  />
                  Petit-déjeuner
                </label>
                <label className={`checkbox-pill ${formData.dejeuner ? 'active' : ''}`}>
                  <input 
                    type="checkbox" 
                    checked={formData.dejeuner}
                    onChange={e => setFormData({...formData, dejeuner: e.target.checked})}
                  />
                  Déjeuner
                </label>
                <label className={`checkbox-pill ${formData.diner ? 'active' : ''}`}>
                  <input 
                    type="checkbox" 
                    checked={formData.diner}
                    onChange={e => setFormData({...formData, diner: e.target.checked})}
                  />
                  Dîner
                </label>
                <label className={`checkbox-pill ${formData.collation ? 'active' : ''}`}>
                  <input 
                    type="checkbox" 
                    checked={formData.collation}
                    onChange={e => setFormData({...formData, collation: e.target.checked})}
                  />
                  Collation
                </label>
              </div>
            </div>
            
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>
                Annuler
              </button>
              <button className="btn-primary" onClick={handleSubmit}>
                {editingFood ? 'Modifier' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Admin Meal Plans Component
const AdminMealPlans = () => {
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [mealPlans, setMealPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [editingMealIndex, setEditingMealIndex] = useState(null);

  useEffect(() => {
    fetchUsers();
    fetchFoods();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFoods = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/foods`);
      setFoods(response.data);
    } catch (error) {
      console.error('Error fetching foods:', error);
    }
  };

  const fetchUserPlans = async (userId) => {
    try {
      const response = await axios.get(`${API_URL}/api/meal-plans/${userId}?limit=30`);
      setMealPlans(response.data);
    } catch (error) {
      console.error('Error fetching meal plans:', error);
    }
  };

  const handleUserSelect = (user) => {
    setSelectedUser(user);
    setSelectedPlan(null);
    fetchUserPlans(user.id);
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
  };

  const handleEditMeal = (meal, mealIndex) => {
    setEditingMeal({...meal, items: [...meal.items]});
    setEditingMealIndex(mealIndex);
    setShowEditModal(true);
  };

  const handleUpdateMealItem = (itemIndex, field, value) => {
    const updatedItems = [...editingMeal.items];
    updatedItems[itemIndex] = {...updatedItems[itemIndex], [field]: value};
    
    // Recalculate macros if quantity changed
    if (field === 'quantity_g') {
      const food = foods.find(f => f.id === updatedItems[itemIndex].food_id);
      if (food) {
        const qty = parseFloat(value) || 0;
        updatedItems[itemIndex].calories = (food.calories_100g / 100) * qty;
        updatedItems[itemIndex].proteines = (food.proteines_100g / 100) * qty;
        updatedItems[itemIndex].glucides = (food.glucides_100g / 100) * qty;
        updatedItems[itemIndex].lipides = (food.lipides_100g / 100) * qty;
      }
    }
    
    setEditingMeal({...editingMeal, items: updatedItems});
  };

  const handleRemoveMealItem = (itemIndex) => {
    const updatedItems = editingMeal.items.filter((_, idx) => idx !== itemIndex);
    setEditingMeal({...editingMeal, items: updatedItems});
  };

  const handleAddMealItem = (foodId) => {
    const food = foods.find(f => f.id === foodId);
    if (food) {
      const newItem = {
        food_id: food.id,
        food_name: food.nom,
        quantity_g: 100,
        calories: food.calories_100g,
        proteines: food.proteines_100g,
        glucides: food.glucides_100g,
        lipides: food.lipides_100g
      };
      setEditingMeal({...editingMeal, items: [...editingMeal.items, newItem]});
    }
  };

  const handleSaveMeal = async () => {
    const updatedPlan = {...selectedPlan};
    updatedPlan.meals[editingMealIndex] = editingMeal;
    
    try {
      const response = await axios.put(`${API_URL}/api/meal-plans/${selectedPlan.id}`, updatedPlan);
      setSelectedPlan(response.data);
      setMealPlans(mealPlans.map(p => p.id === response.data.id ? response.data : p));
      setShowEditModal(false);
      setEditingMeal(null);
    } catch (error) {
      alert('Erreur lors de la sauvegarde');
    }
  };

  const handleRegeneratePlan = async () => {
    if (!selectedUser || !selectedPlan) return;
    if (!window.confirm('Régénérer ce plan ? Les modifications seront perdues.')) return;
    
    try {
      const response = await axios.post(
        `${API_URL}/api/meal-plans/${selectedUser.id}/regenerate?target_date=${selectedPlan.date}`
      );
      setSelectedPlan(response.data);
      fetchUserPlans(selectedUser.id);
    } catch (error) {
      alert('Erreur lors de la régénération');
    }
  };

  if (loading) {
    return <LoadingAnimation text="Chargement..." />;
  }

  return (
    <div className="admin-meal-plans">
      <h1>Gestion des plans alimentaires</h1>
      
      <div className="meal-plans-layout">
        {/* Users List */}
        <div className="users-sidebar">
          <h3>Clients</h3>
          <div className="users-list">
            {users.map(user => (
              <div 
                key={user.id} 
                className={`user-item ${selectedUser?.id === user.id ? 'selected' : ''}`}
                onClick={() => handleUserSelect(user)}
              >
                <span className="user-name">{user.prenom} {user.nom}</span>
                <span className="user-objective">
                  {user.objectif === 'perte_de_gras' ? 'Perte' : 
                   user.objectif === 'maintien' ? 'Maintien' : 'Prise'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Plans List */}
        <div className="plans-sidebar">
          <h3>Historique des plans</h3>
          {selectedUser ? (
            <div className="plans-list">
              {mealPlans.length === 0 ? (
                <p className="no-plans">Aucun plan généré</p>
              ) : (
                mealPlans.map(plan => (
                  <div 
                    key={plan.id}
                    className={`plan-item ${selectedPlan?.id === plan.id ? 'selected' : ''}`}
                    onClick={() => handlePlanSelect(plan)}
                  >
                    <span className="plan-date">
                      {new Date(plan.date).toLocaleDateString('fr-FR', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })}
                    </span>
                    <span className="plan-calories">{Math.round(plan.total_calories)} kcal</span>
                    {plan.modified_by_admin && <span className="modified-badge">Modifié</span>}
                  </div>
                ))
              )}
            </div>
          ) : (
            <p className="select-user">Sélectionnez un client</p>
          )}
        </div>

        {/* Plan Detail */}
        <div className="plan-detail">
          {selectedPlan ? (
            <>
              <div className="plan-detail-header">
                <h3>
                  Plan du {new Date(selectedPlan.date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </h3>
                <button className="btn-secondary" onClick={handleRegeneratePlan}>
                  Régénérer
                </button>
              </div>
              
              <div className="plan-summary-admin">
                <div className="summary-stat">
                  <span className="label">Objectif</span>
                  <span className="value">{selectedPlan.objectif_calories} kcal</span>
                </div>
                <div className="summary-stat">
                  <span className="label">Total</span>
                  <span className="value">{Math.round(selectedPlan.total_calories)} kcal</span>
                </div>
                <div className="summary-stat">
                  <span className="label">P</span>
                  <span className="value">{Math.round(selectedPlan.total_proteines)}g</span>
                </div>
                <div className="summary-stat">
                  <span className="label">G</span>
                  <span className="value">{Math.round(selectedPlan.total_glucides)}g</span>
                </div>
                <div className="summary-stat">
                  <span className="label">L</span>
                  <span className="value">{Math.round(selectedPlan.total_lipides)}g</span>
                </div>
              </div>

              <div className="meals-edit-list">
                {selectedPlan.meals.map((meal, idx) => (
                  <div key={idx} className="meal-edit-card">
                    <div className="meal-edit-header">
                      <div className="meal-info">
                        <span className="meal-time">{meal.heure}</span>
                        <span className="meal-name">{meal.nom}</span>
                      </div>
                      <button 
                        className="btn-edit-meal"
                        onClick={() => handleEditMeal(meal, idx)}
                      >
                        <Icons.Edit /> Modifier
                      </button>
                    </div>
                    <div className="meal-items-preview">
                      {meal.items.map((item, itemIdx) => (
                        <div key={itemIdx} className="item-preview">
                          <span className="item-name">{item.food_name}</span>
                          <span className="item-qty">{item.quantity_g}g</span>
                        </div>
                      ))}
                    </div>
                    <div className="meal-totals">
                      <span>{Math.round(meal.total_calories)} kcal</span>
                      <span>P: {Math.round(meal.total_proteines)}g</span>
                      <span>G: {Math.round(meal.total_glucides)}g</span>
                      <span>L: {Math.round(meal.total_lipides)}g</span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="no-plan-selected">
              <Icons.Calendar />
              <p>Sélectionnez un plan pour le visualiser et le modifier</p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Meal Modal */}
      {showEditModal && editingMeal && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content modal-large" onClick={e => e.stopPropagation()}>
            <h2>Modifier {editingMeal.nom} ({editingMeal.heure})</h2>
            
            <div className="edit-meal-items">
              {editingMeal.items.map((item, idx) => (
                <div key={idx} className="edit-item-row">
                  <span className="item-name">{item.food_name}</span>
                  <div className="item-quantity-input">
                    <input
                      type="number"
                      value={item.quantity_g}
                      onChange={e => handleUpdateMealItem(idx, 'quantity_g', e.target.value)}
                      min="0"
                      step="10"
                    />
                    <span>g</span>
                  </div>
                  <div className="item-macros-preview">
                    <span>{Math.round(item.calories)} kcal</span>
                    <span>P: {Math.round(item.proteines)}g</span>
                    <span>G: {Math.round(item.glucides)}g</span>
                    <span>L: {Math.round(item.lipides)}g</span>
                  </div>
                  <button 
                    className="btn-remove-item"
                    onClick={() => handleRemoveMealItem(idx)}
                  >
                    <Icons.Trash />
                  </button>
                </div>
              ))}
            </div>
            
            <div className="add-food-section">
              <h4>Ajouter un aliment</h4>
              <select 
                onChange={e => {
                  if (e.target.value) {
                    handleAddMealItem(e.target.value);
                    e.target.value = '';
                  }
                }}
                defaultValue=""
              >
                <option value="">Sélectionner un aliment...</option>
                <optgroup label="Protéines">
                  {foods.filter(f => f.categorie === 'proteines').map(f => (
                    <option key={f.id} value={f.id}>{f.nom}</option>
                  ))}
                </optgroup>
                <optgroup label="Glucides">
                  {foods.filter(f => f.categorie === 'glucides').map(f => (
                    <option key={f.id} value={f.id}>{f.nom}</option>
                  ))}
                </optgroup>
                <optgroup label="Lipides">
                  {foods.filter(f => f.categorie === 'lipides').map(f => (
                    <option key={f.id} value={f.id}>{f.nom}</option>
                  ))}
                </optgroup>
              </select>
            </div>
            
            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
                Annuler
              </button>
              <button className="btn-primary" onClick={handleSaveMeal}>
                Enregistrer les modifications
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Main App Component
function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    // Check for saved user in localStorage
    const savedUser = localStorage.getItem('mealgoal_user');
    const savedAdmin = localStorage.getItem('mealgoal_admin');
    const savedTheme = localStorage.getItem('mealgoal_theme');
    
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    if (savedAdmin === 'true') {
      setIsAdmin(true);
    }
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const handleQuestionnaireComplete = (user) => {
    setCurrentUser(user);
    localStorage.setItem('mealgoal_user', JSON.stringify(user));
    setShowQuestionnaire(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem('mealgoal_user');
    localStorage.removeItem('mealgoal_admin');
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
    localStorage.setItem('mealgoal_admin', 'true');
  };

  const handleToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('mealgoal_theme', newTheme);
  };

  return (
    <Router>
      <div className="app">
        <Navigation 
          currentUser={currentUser} 
          onLogout={handleLogout}
          isAdmin={isAdmin}
          theme={theme}
          onToggleTheme={handleToggleTheme}
        />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={
              !currentUser && !isAdmin ? (
                showQuestionnaire ? (
                  <Questionnaire onComplete={handleQuestionnaireComplete} />
                ) : (
                  <HomePage 
                    onStartQuestionnaire={() => setShowQuestionnaire(true)}
                    onAdminLogin={handleAdminLogin}
                  />
                )
              ) : isAdmin ? (
                <AdminDashboard />
              ) : (
                <Dashboard user={currentUser} />
              )
            } />
            
            {currentUser && !isAdmin && (
              <>
                <Route path="/dashboard" element={<Dashboard user={currentUser} />} />
                <Route path="/meal-plan" element={<MealPlan user={currentUser} />} />
                <Route path="/weight-tracking" element={<WeightTracking user={currentUser} />} />
                <Route path="/rules" element={<NutritionalRules />} />
              </>
            )}
            
            {isAdmin && (
              <>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/meal-plans" element={<AdminMealPlans />} />
                <Route path="/admin/foods" element={<AdminFoods />} />
              </>
            )}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

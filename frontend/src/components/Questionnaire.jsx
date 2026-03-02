import React, { useState } from 'react';
import axios from 'axios';
import { API_URL } from '../lib/api';
import Icons from '../constants/icons';
import FOOD_OPTIONS from '../constants/foodOptions';
import LoadingAnimation from './LoadingAnimation';

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

export default Questionnaire;

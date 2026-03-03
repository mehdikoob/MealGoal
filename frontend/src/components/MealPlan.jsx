import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../lib/api';
import Icons from '../constants/icons';
import { Skeleton } from './ui/skeleton';
import { toast } from 'sonner';

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
      const status = error.response?.status;
      if (status !== 404) {
        toast.error('Impossible de charger votre plan du jour. Vérifiez votre connexion.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="meal-plan-container">
        <div className="meal-plan-header">
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-5 w-48" />
        </div>
        <div className="meal-plan-summary" style={{ display: 'flex', gap: '1rem', margin: '1.5rem 0' }}>
          {[...Array(5)].map((_, i) => (
            <Skeleton key={i} className="h-16 flex-1" style={{ borderRadius: 8 }} />
          ))}
        </div>
        <div className="meals-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 w-full" style={{ borderRadius: 12 }} />
          ))}
        </div>
      </div>
    );
  }

  if (!mealPlan) {
    return (
      <div className="error-container">
        <p>Votre plan alimentaire n'a pas pu être chargé.</p>
        <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '8px' }}>
          Cela peut survenir si votre plan n'a pas encore été généré, ou si une erreur réseau s'est produite.
        </p>
        <button className="btn-primary" onClick={fetchMealPlan} style={{ marginTop: '16px' }}>Réessayer</button>
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
          <span className="summary-label">Calories</span>
          <span className="summary-value">{mealPlan.objectif_calories} kcal</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Protéines</span>
          <span className="summary-value">{mealPlan.objectif_proteines}g</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Glucides</span>
          <span className="summary-value">{mealPlan.objectif_glucides}g</span>
        </div>
        <div className="summary-item">
          <span className="summary-label">Lipides</span>
          <span className="summary-value">{mealPlan.objectif_lipides}g</span>
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
                <div key={itemIndex} className="meal-item-with-equivalents">
                  <div className="meal-item">
                    <div className="item-main">
                      <span className="item-name">
                        {item.food_name}
                        {item.food_name === 'Oeufs entiers' && (
                          <span className="lipids-included-badge">(lipides inclus)</span>
                        )}
                      </span>
                      <span className="item-quantity">{item.quantity_g}g</span>
                    </div>
                    {item.equivalents && item.equivalents.length > 0 && (
                      <div className="item-equivalents">
                        <span className="equivalents-label">Alternatives :</span>
                        {item.equivalents.map((eq, eqIndex) => (
                          <span key={eqIndex} className="equivalent">
                            ↔ {eq.quantity} {eq.food_name}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="item-macros">
                      <span className="macro protein">P: {Math.round(item.proteines)}g</span>
                      <span className="macro carbs">G: {Math.round(item.glucides)}g</span>
                      <span className="macro fats">L: {Math.round(item.lipides)}g</span>
                    </div>
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

export default MealPlan;

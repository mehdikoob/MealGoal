import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../lib/api';
import Icons from '../../constants/icons';
import { Skeleton } from '../ui/skeleton';

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
    return (
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <Skeleton className="h-10 w-64 mb-2" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24 w-full" style={{ borderRadius: 12 }} />
        ))}
      </div>
    );
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
                        <div key={itemIdx} className="item-preview-with-equivs">
                          <div className="item-preview-main">
                            <span className="item-name">
                              {item.food_name}
                              {item.food_name === 'Oeufs entiers' && (
                                <span className="lipids-included-badge">(lipides inclus)</span>
                              )}
                            </span>
                            <span className="item-qty">{item.quantity_g}g</span>
                          </div>
                          {item.equivalents && item.equivalents.length > 0 && (
                            <div className="item-equivalents-preview">
                              {item.equivalents.map((eq, eqIdx) => (
                                <span key={eqIdx} className="equiv-badge">
                                  ou {eq.quantity} {eq.food_name}
                                </span>
                              ))}
                            </div>
                          )}
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
                  <span className="item-name">
                    {item.food_name}
                    {item.food_name === 'Oeufs entiers' && (
                      <span className="lipids-included-badge">(lipides inclus)</span>
                    )}
                  </span>
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

export default AdminMealPlans;

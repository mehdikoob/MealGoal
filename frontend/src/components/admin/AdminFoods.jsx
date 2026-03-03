import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../lib/api';
import Icons from '../../constants/icons';
import { Skeleton } from '../ui/skeleton';
import { toast } from 'sonner';

// Admin Foods Component
const AdminFoods = () => {
  const [foods, setFoods] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingFood, setEditingFood] = useState(null);

  // Search and filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [mealFilter, setMealFilter] = useState('all');
  const [sortBy, setSortBy] = useState('nom');

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
    collation: true,
    unite_personnalisee: '',
    food_type: 'main',
    default_portion_g: ''
  });

  useEffect(() => {
    fetchFoods();
  }, []);

  const fetchFoods = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/foods`);
      setFoods(response.data);
    } catch (error) {
      toast.error('Impossible de charger la banque d\'aliments. Rechargez la page.');
    } finally {
      setLoading(false);
    }
  };

  // Filter and sort foods
  const filteredFoods = foods
    .filter(food => {
      // Search filter
      if (searchQuery && !food.nom.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      // Category filter
      if (categoryFilter !== 'all' && food.categorie !== categoryFilter) {
        return false;
      }
      // Meal filter
      if (mealFilter !== 'all') {
        if (mealFilter === 'petit_dejeuner' && !food.petit_dejeuner) return false;
        if (mealFilter === 'dejeuner' && !food.dejeuner) return false;
        if (mealFilter === 'diner' && !food.diner) return false;
        if (mealFilter === 'collation' && !food.collation) return false;
      }
      return true;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'nom':
          return a.nom.localeCompare(b.nom);
        case 'calories':
          return b.calories_100g - a.calories_100g;
        case 'proteines':
          return b.proteines_100g - a.proteines_100g;
        case 'categorie':
          return a.categorie.localeCompare(b.categorie);
        default:
          return 0;
      }
    });

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        calories_100g: parseFloat(formData.calories_100g),
        proteines_100g: parseFloat(formData.proteines_100g),
        glucides_100g: parseFloat(formData.glucides_100g),
        lipides_100g: parseFloat(formData.lipides_100g),
        unite_personnalisee: formData.unite_personnalisee || null,
        food_type: formData.food_type || 'main',
        default_portion_g: formData.food_type === 'companion' && formData.default_portion_g
          ? parseFloat(formData.default_portion_g)
          : null,
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
        collation: true,
        unite_personnalisee: '',
        food_type: 'main',
        default_portion_g: ''
      });
      fetchFoods();
    } catch (error) {
      const detail = error.response?.data?.detail;
      const name = formData.nom || 'cet aliment';
      toast.error(detail ?? `Impossible de sauvegarder "${name}" — vérifiez les valeurs nutritionnelles.`);
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
      collation: food.collation !== false,
      unite_personnalisee: food.unite_personnalisee || '',
      food_type: food.food_type || 'main',
      default_portion_g: food.default_portion_g || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (foodId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet aliment ?')) {
      try {
        await axios.delete(`${API_URL}/api/foods/${foodId}`);
        fetchFoods();
      } catch (error) {
        const detail = error.response?.data?.detail;
        toast.error(detail ?? 'Impossible de supprimer cet aliment — il est peut-être utilisé dans des plans existants.');
      }
    }
  };

  const clearFilters = () => {
    setSearchQuery('');
    setCategoryFilter('all');
    setMealFilter('all');
    setSortBy('nom');
  };

  const hasActiveFilters = searchQuery || categoryFilter !== 'all' || mealFilter !== 'all';

  if (loading) {
    return (
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
          <Skeleton className="h-10 flex-1" style={{ borderRadius: 8 }} />
          <Skeleton className="h-10 w-40" style={{ borderRadius: 8 }} />
        </div>
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-14 w-full" style={{ borderRadius: 8 }} />
        ))}
      </div>
    );
  }

  return (
    <div className="admin-foods">
      <div className="admin-foods-header">
        <div>
          <h1>Banque d'aliments</h1>
          <p className="foods-count">{filteredFoods.length} aliment{filteredFoods.length > 1 ? 's' : ''} {hasActiveFilters ? `(sur ${foods.length})` : ''}</p>
        </div>
        <button className="btn-primary" onClick={() => setShowModal(true)}>
          <Icons.Plus /> Ajouter un aliment
        </button>
      </div>

      {/* Search and Filters Bar */}
      <div className="foods-filters-bar">
        <div className="search-box">
          <Icons.Target />
          <input
            type="text"
            placeholder="Rechercher un aliment..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              <Icons.Trash />
            </button>
          )}
        </div>

        <div className="filters-group">
          <div className="filter-item">
            <label>Catégorie</label>
            <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
              <option value="all">Toutes</option>
              <option value="proteines">Protéines</option>
              <option value="glucides">Glucides</option>
              <option value="lipides">Lipides</option>
            </select>
          </div>

          <div className="filter-item">
            <label>Repas</label>
            <select value={mealFilter} onChange={e => setMealFilter(e.target.value)}>
              <option value="all">Tous</option>
              <option value="petit_dejeuner">Petit-déjeuner</option>
              <option value="dejeuner">Déjeuner</option>
              <option value="diner">Dîner</option>
              <option value="collation">Collation</option>
            </select>
          </div>

          <div className="filter-item">
            <label>Trier par</label>
            <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
              <option value="nom">Nom (A-Z)</option>
              <option value="calories">Calories</option>
              <option value="proteines">Protéines</option>
              <option value="categorie">Catégorie</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button className="btn-clear-filters" onClick={clearFilters}>
              Effacer les filtres
            </button>
          )}
        </div>
      </div>

      {/* Quick Category Stats */}
      <div className="category-stats">
        <div
          className={`category-stat ${categoryFilter === 'proteines' ? 'active' : ''}`}
          onClick={() => setCategoryFilter(categoryFilter === 'proteines' ? 'all' : 'proteines')}
        >
          <span className="stat-dot proteines"></span>
          <span className="stat-label">Protéines</span>
          <span className="stat-count">{foods.filter(f => f.categorie === 'proteines').length}</span>
        </div>
        <div
          className={`category-stat ${categoryFilter === 'glucides' ? 'active' : ''}`}
          onClick={() => setCategoryFilter(categoryFilter === 'glucides' ? 'all' : 'glucides')}
        >
          <span className="stat-dot glucides"></span>
          <span className="stat-label">Glucides</span>
          <span className="stat-count">{foods.filter(f => f.categorie === 'glucides').length}</span>
        </div>
        <div
          className={`category-stat ${categoryFilter === 'lipides' ? 'active' : ''}`}
          onClick={() => setCategoryFilter(categoryFilter === 'lipides' ? 'all' : 'lipides')}
        >
          <span className="stat-dot lipides"></span>
          <span className="stat-label">Lipides</span>
          <span className="stat-count">{foods.filter(f => f.categorie === 'lipides').length}</span>
        </div>
      </div>

      {/* Foods Grid/List */}
      {filteredFoods.length === 0 ? (
        <div className="no-results">
          <Icons.Target />
          <p>Aucun aliment trouvé</p>
          {hasActiveFilters && (
            <button className="btn-secondary" onClick={clearFilters}>
              Effacer les filtres
            </button>
          )}
        </div>
      ) : (
        <div className="foods-grid">
          {filteredFoods.map(food => (
            <div key={food.id} className={`food-card ${food.categorie}`}>
              <div className="food-card-header">
                <span className={`food-category-dot ${food.categorie}`}></span>
                <h4>{food.nom}</h4>
                <div className="food-card-actions">
                  <button className="action-btn-small edit" onClick={() => handleEdit(food)}>
                    <Icons.Edit />
                  </button>
                  <button className="action-btn-small delete" onClick={() => handleDelete(food.id)}>
                    <Icons.Trash />
                  </button>
                </div>
              </div>

              <div className="food-card-macros">
                <div className="macros-header">
                  {food.unite_personnalisee ? `Valeurs pour ${food.unite_personnalisee}` : 'Valeurs pour 100g'}
                </div>
                <div className="macros-row">
                  <div className="macro-item">
                    <span className="macro-value">{food.calories_100g}</span>
                    <span className="macro-label">kcal</span>
                  </div>
                  <div className="macro-item protein">
                    <span className="macro-value">{food.proteines_100g}g</span>
                    <span className="macro-label">Prot</span>
                  </div>
                  <div className="macro-item carbs">
                    <span className="macro-value">{food.glucides_100g}g</span>
                    <span className="macro-label">Gluc</span>
                  </div>
                  <div className="macro-item fats">
                    <span className="macro-value">{food.lipides_100g}g</span>
                    <span className="macro-label">Lip</span>
                  </div>
                </div>
              </div>

              <div className="food-card-meals">
                {food.petit_dejeuner !== false && <span className="meal-badge">Petit-déj</span>}
                {food.dejeuner !== false && <span className="meal-badge">Déj</span>}
                {food.diner !== false && <span className="meal-badge">Dîner</span>}
                {food.collation !== false && <span className="meal-badge">Collation</span>}
              </div>
            </div>
          ))}
        </div>
      )}

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
              <label>Unité personnalisée (optionnel)</label>
              <input
                type="text"
                value={formData.unite_personnalisee}
                onChange={e => setFormData({...formData, unite_personnalisee: e.target.value})}
                placeholder="Ex: 1 oeuf, 1 tranche, 1 cuillère..."
              />
              <span className="form-hint">Laissez vide pour "100g". Si rempli, les valeurs nutritionnelles seront pour cette unité.</span>
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

            <div className="form-group">
              <label>Type d'aliment</label>
              <div className="checkbox-row">
                <label className={`checkbox-pill ${formData.food_type === 'main' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="food_type"
                    value="main"
                    checked={formData.food_type === 'main'}
                    onChange={() => setFormData({ ...formData, food_type: 'main', default_portion_g: '' })}
                  />
                  Aliment principal
                </label>
                <label className={`checkbox-pill ${formData.food_type === 'companion' ? 'active' : ''}`}>
                  <input
                    type="radio"
                    name="food_type"
                    value="companion"
                    checked={formData.food_type === 'companion'}
                    onChange={() => setFormData({ ...formData, food_type: 'companion' })}
                  />
                  Companion (condiment / saveur)
                </label>
              </div>
              <span className="form-hint">
                Un companion s'ajoute automatiquement aux repas compatibles (ex: miel dans le skyr).
              </span>
            </div>

            {formData.food_type === 'companion' && (
              <div className="form-group">
                <label>Portion par défaut (g)</label>
                <input
                  type="number"
                  value={formData.default_portion_g}
                  onChange={e => setFormData({ ...formData, default_portion_g: e.target.value })}
                  placeholder="Ex: 15"
                  min="1"
                  max="100"
                />
                <span className="form-hint">Quantité fixe ajoutée à chaque repas compatible.</span>
              </div>
            )}

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

export default AdminFoods;

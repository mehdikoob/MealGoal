import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../../lib/api';
import Icons from '../../constants/icons';
import { Skeleton } from '../ui/skeleton';
import { toast } from 'sonner';

// Admin Users Component
const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    objectif: '',
    niveau_activite: '',
    poids_actuel: ''
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/users`);
      setUsers(response.data);
    } catch (error) {
      toast.error('Impossible de charger la liste des clients. Rechargez la page.');
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
      const detail = error.response?.data?.detail;
      toast.error(detail ?? `Impossible de supprimer le compte de ${userName}. Réessayez.`);
    }
  };

  const handleViewDetails = (user) => {
    setSelectedUser(user);
    setShowDetailModal(true);
  };

  const handleEditProgram = (user) => {
    setEditForm({
      objectif: user.objectif,
      niveau_activite: user.niveau_activite,
      poids_actuel: user.poids_actuel || user.poids_initial_kg
    });
    setShowEditModal(true);
  };

  const handleSaveProgram = async () => {
    if (!selectedUser) return;

    setSaving(true);
    try {
      // Update user profile with new values
      const updatedUser = {
        ...selectedUser,
        objectif: editForm.objectif,
        niveau_activite: editForm.niveau_activite,
        poids_initial_kg: parseFloat(editForm.poids_actuel) // Use current weight for recalculation
      };

      const response = await axios.put(`${API_URL}/api/users/${selectedUser.id}`, updatedUser);

      // Log the new weight
      await axios.post(`${API_URL}/api/weight-logs`, {
        user_id: selectedUser.id,
        poids_kg: parseFloat(editForm.poids_actuel),
        date: new Date().toISOString().split('T')[0]
      });

      // Update local state
      const updatedUserData = {
        ...response.data,
        poids_actuel: parseFloat(editForm.poids_actuel),
        evolution_poids: selectedUser.evolution_poids,
        nombre_pesees: (selectedUser.nombre_pesees || 0) + 1
      };

      setSelectedUser(updatedUserData);
      setUsers(users.map(u => u.id === selectedUser.id ? updatedUserData : u));
      setShowEditModal(false);
    } catch (error) {
      const detail = error.response?.data?.detail;
      toast.error(detail ?? 'Modifications non sauvegardées — vérifiez les données saisies.');
    } finally {
      setSaving(false);
    }
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

  const getObjectifIcon = (objectif) => {
    switch(objectif) {
      case 'perte_de_gras': return <Icons.TrendingDown />;
      case 'prise_de_muscle': return <Icons.TrendingUp />;
      default: return <Icons.Target />;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Skeleton className="h-10 w-72 mb-2" />
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-16 w-full" style={{ borderRadius: 8 }} />
        ))}
      </div>
    );
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
                <Icons.Trash /> Supprimer
              </button>
              <button className="btn-primary" onClick={() => handleEditProgram(selectedUser)}>
                <Icons.Edit /> Modifier le programme
              </button>
              <button className="btn-secondary" onClick={() => setShowDetailModal(false)}>
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Program Modal */}
      {showEditModal && selectedUser && (
        <div className="modal-overlay" onClick={() => setShowEditModal(false)}>
          <div className="modal-content modal-edit-program" onClick={e => e.stopPropagation()}>
            <h2>Modifier le programme</h2>
            <p className="modal-subtitle">
              Client : <strong>{selectedUser.prenom} {selectedUser.nom}</strong>
            </p>

            <div className="program-evolution-card">
              <div className="current-program">
                <span className="program-label">Programme actuel</span>
                <div className="program-info">
                  <span className={`objective-badge-large ${selectedUser.objectif}`}>
                    {getObjectifIcon(selectedUser.objectif)}
                    {selectedUser.objectif === 'perte_de_gras' ? 'Perte de gras' :
                     selectedUser.objectif === 'maintien' ? 'Maintien' : 'Prise de muscle'}
                  </span>
                  <span className="calories-current">{selectedUser.calories_journalieres} kcal/jour</span>
                </div>
              </div>
            </div>

            <div className="edit-program-form">
              <div className="form-group">
                <label>Nouvel objectif</label>
                <div className="objective-selector">
                  <label className={`objective-option ${editForm.objectif === 'perte_de_gras' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="objectif"
                      value="perte_de_gras"
                      checked={editForm.objectif === 'perte_de_gras'}
                      onChange={e => setEditForm({...editForm, objectif: e.target.value})}
                    />
                    <Icons.TrendingDown />
                    <div className="option-content">
                      <span className="option-title">Perte de gras</span>
                      <span className="option-desc">Déficit calorique -20%</span>
                    </div>
                  </label>
                  <label className={`objective-option ${editForm.objectif === 'maintien' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="objectif"
                      value="maintien"
                      checked={editForm.objectif === 'maintien'}
                      onChange={e => setEditForm({...editForm, objectif: e.target.value})}
                    />
                    <Icons.Target />
                    <div className="option-content">
                      <span className="option-title">Maintien</span>
                      <span className="option-desc">Calories d'équilibre</span>
                    </div>
                  </label>
                  <label className={`objective-option ${editForm.objectif === 'prise_de_muscle' ? 'selected' : ''}`}>
                    <input
                      type="radio"
                      name="objectif"
                      value="prise_de_muscle"
                      checked={editForm.objectif === 'prise_de_muscle'}
                      onChange={e => setEditForm({...editForm, objectif: e.target.value})}
                    />
                    <Icons.TrendingUp />
                    <div className="option-content">
                      <span className="option-title">Prise de muscle</span>
                      <span className="option-desc">Surplus calorique +15%</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="form-group">
                <label>Niveau d'activité</label>
                <select
                  value={editForm.niveau_activite}
                  onChange={e => setEditForm({...editForm, niveau_activite: e.target.value})}
                >
                  <option value="sedentaire">Sédentaire (peu ou pas d'exercice)</option>
                  <option value="modere">Modéré (1-3 entraînements/sem)</option>
                  <option value="actif">Actif (2-4 entraînements/sem)</option>
                  <option value="tres_actif">Très actif (5-6 entraînements/sem)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Poids actuel (kg)</label>
                <input
                  type="number"
                  value={editForm.poids_actuel}
                  onChange={e => setEditForm({...editForm, poids_actuel: e.target.value})}
                  step="0.1"
                  min="30"
                  max="300"
                />
                <span className="form-hint">
                  Ce poids sera utilisé pour recalculer les macros et enregistré dans le suivi
                </span>
              </div>
            </div>

            <div className="modal-info-box">
              <Icons.Info />
              <p>
                Les calories et macros seront automatiquement recalculés selon le nouveau programme.
                Le nouveau plan alimentaire devra être régénéré depuis l'onglet "Plans".
              </p>
            </div>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowEditModal(false)}>
                Annuler
              </button>
              <button
                className="btn-primary"
                onClick={handleSaveProgram}
                disabled={saving}
              >
                {saving ? 'Enregistrement...' : 'Appliquer les modifications'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;

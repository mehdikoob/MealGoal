import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../../lib/api';
import Icons from '../../constants/icons';
import { Skeleton } from '../ui/skeleton';

// Admin Dashboard Component
const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

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

  const getObjectifLabel = (objectif) => {
    switch(objectif) {
      case 'perte_de_gras': return 'Perte';
      case 'maintien': return 'Maintien';
      case 'prise_de_muscle': return 'Prise';
      default: return objectif;
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short'
    });
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28 flex-1" style={{ borderRadius: 12 }} />
          ))}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <Skeleton className="h-64" style={{ borderRadius: 12 }} />
          <Skeleton className="h-64" style={{ borderRadius: 12 }} />
          <Skeleton className="h-48 col-span-2" style={{ borderRadius: 12 }} />
        </div>
      </div>
    );
  }

  const overview = stats?.overview || {};
  const alertes = stats?.alertes || {};
  const progression = stats?.progression || {};
  const activite = stats?.activite_recente || {};

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header-admin">
        <h1>Dashboard</h1>
        <p className="dashboard-date">
          {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Overview Stats */}
      <div className="admin-stats-grid">
        <div className="admin-stat-card">
          <div className="admin-stat-icon"><Icons.Users /></div>
          <div className="admin-stat-content">
            <span className="admin-stat-value">{overview.total_clients || 0}</span>
            <span className="admin-stat-label">Clients actifs</span>
          </div>
        </div>

        <div className="admin-stat-card highlight-new">
          <div className="admin-stat-icon new"><Icons.Plus /></div>
          <div className="admin-stat-content">
            <span className="admin-stat-value">{overview.nouveaux_ce_mois || 0}</span>
            <span className="admin-stat-label">Nouveaux ce mois</span>
          </div>
        </div>

        <div className="admin-stat-card highlight-warning">
          <div className="admin-stat-icon warning"><Icons.Clock /></div>
          <div className="admin-stat-content">
            <span className="admin-stat-value">{overview.en_attente_pesee || 0}</span>
            <span className="admin-stat-label">En attente de pesée</span>
          </div>
        </div>

        <div className="admin-stat-card highlight-success">
          <div className="admin-stat-icon success"><Icons.Check /></div>
          <div className="admin-stat-content">
            <span className="admin-stat-value">{overview.en_bonne_voie || 0}</span>
            <span className="admin-stat-label">En bonne voie</span>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="dashboard-main-grid">

        {/* Alerts Section */}
        <div className="dashboard-section alerts-section">
          <div className="section-header">
            <h3><Icons.Clock /> Clients à relancer</h3>
            <span className="section-count">{alertes.clients_a_relancer?.length || 0}</span>
          </div>
          <div className="section-content">
            {alertes.clients_a_relancer?.length > 0 ? (
              <div className="client-list">
                {alertes.clients_a_relancer.map((client, idx) => (
                  <div key={idx} className="client-row alert-row" onClick={() => navigate('/admin/users')}>
                    <div className="client-info">
                      <span className="client-name">{client.prenom} {client.nom}</span>
                      <span className={`client-objective ${client.objectif}`}>{getObjectifLabel(client.objectif)}</span>
                    </div>
                    <div className="client-alert-info">
                      <span className="days-count">{client.jours_sans_pesee}j</span>
                      <span className="days-label">sans pesée</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <Icons.Check />
                <p>Tous les clients sont à jour !</p>
              </div>
            )}
          </div>
        </div>

        {/* Struggling Clients */}
        <div className="dashboard-section warning-section">
          <div className="section-header">
            <h3><Icons.TrendingDown /> En difficulté</h3>
            <span className="section-count warning">{overview.en_difficulte || 0}</span>
          </div>
          <div className="section-content">
            {alertes.clients_en_difficulte?.length > 0 ? (
              <div className="client-list">
                {alertes.clients_en_difficulte.map((client, idx) => (
                  <div key={idx} className="client-row warning-row" onClick={() => navigate('/admin/users')}>
                    <div className="client-info">
                      <span className="client-name">{client.prenom} {client.nom}</span>
                      <span className={`client-objective ${client.objectif}`}>{getObjectifLabel(client.objectif)}</span>
                    </div>
                    <div className="client-evolution">
                      <span className={`evolution-value ${client.evolution > 0 ? 'positive' : client.evolution < 0 ? 'negative' : ''}`}>
                        {client.evolution > 0 ? '+' : ''}{client.evolution} kg
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state success">
                <Icons.Check />
                <p>Aucun client en difficulté</p>
              </div>
            )}
          </div>
        </div>

        {/* On Track Clients */}
        <div className="dashboard-section success-section">
          <div className="section-header">
            <h3><Icons.TrendingUp /> En bonne voie</h3>
            <span className="section-count success">{overview.en_bonne_voie || 0}</span>
          </div>
          <div className="section-content">
            {progression.en_bonne_voie?.length > 0 ? (
              <div className="client-list">
                {progression.en_bonne_voie.map((client, idx) => (
                  <div key={idx} className="client-row success-row">
                    <div className="client-info">
                      <span className="client-name">{client.prenom} {client.nom}</span>
                      <span className={`client-objective ${client.objectif}`}>{getObjectifLabel(client.objectif)}</span>
                    </div>
                    <div className="client-evolution">
                      <span className={`evolution-value ${client.evolution > 0 ? 'positive' : client.evolution < 0 ? 'negative' : ''}`}>
                        {client.evolution > 0 ? '+' : ''}{client.evolution} kg
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Pas encore de données</p>
              </div>
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="dashboard-section activity-section">
          <div className="section-header">
            <h3><Icons.Scale /> Dernières pesées</h3>
          </div>
          <div className="section-content">
            {activite.dernieres_pesees?.length > 0 ? (
              <div className="activity-list">
                {activite.dernieres_pesees.map((item, idx) => (
                  <div key={idx} className="activity-row">
                    <div className="activity-date">{formatDate(item.date_pesee)}</div>
                    <div className="activity-info">
                      <span className="client-name">{item.prenom} {item.nom}</span>
                    </div>
                    <div className="activity-value">
                      <span className="weight-value">{item.poids} kg</span>
                      <span className={`evolution-small ${item.evolution > 0 ? 'positive' : item.evolution < 0 ? 'negative' : ''}`}>
                        ({item.evolution > 0 ? '+' : ''}{item.evolution})
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <p>Aucune pesée récente</p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Distribution */}
      {stats?.distribution_objectifs && Object.keys(stats.distribution_objectifs).length > 0 && (
        <div className="distribution-section">
          <h3>Répartition des objectifs</h3>
          <div className="distribution-bars">
            {Object.entries(stats.distribution_objectifs).map(([objectif, count]) => {
              const total = overview.total_clients || 1;
              const percentage = Math.round((count / total) * 100);
              return (
                <div key={objectif} className="distribution-item">
                  <div className="distribution-label">
                    <span className={`objective-dot ${objectif}`}></span>
                    <span>{objectif === 'perte_de_gras' ? 'Perte de gras' :
                           objectif === 'maintien' ? 'Maintien' : 'Prise de muscle'}</span>
                  </div>
                  <div className="distribution-bar-container">
                    <div className={`distribution-bar ${objectif}`} style={{width: `${percentage}%`}}></div>
                  </div>
                  <div className="distribution-value">{count} ({percentage}%)</div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Success Stories */}
      {progression.succes?.length > 0 && (
        <div className="success-stories-section">
          <h3><Icons.Target /> Objectifs atteints</h3>
          <div className="success-cards">
            {progression.succes.map((client, idx) => (
              <div key={idx} className="success-card">
                <div className="success-icon"><Icons.Check /></div>
                <div className="success-content">
                  <span className="success-name">{client.prenom} {client.nom}</span>
                  <span className="success-achievement">
                    {client.evolution > 0 ? '+' : ''}{client.evolution} kg
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;

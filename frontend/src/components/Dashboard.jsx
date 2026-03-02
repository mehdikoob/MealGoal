import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';
import Icons from '../constants/icons';

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

export default Dashboard;

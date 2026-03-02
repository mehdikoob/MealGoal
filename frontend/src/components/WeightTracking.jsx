import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../lib/api';
import Icons from '../constants/icons';
import { Skeleton } from './ui/skeleton';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

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
    return (
      <div className="weight-tracking-container">
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 flex-1" style={{ borderRadius: 12 }} />
          ))}
        </div>
        <Skeleton className="h-64 w-full" style={{ borderRadius: 12, marginBottom: '1.5rem' }} />
        <Skeleton className="h-40 w-full" style={{ borderRadius: 12 }} />
      </div>
    );
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

export default WeightTracking;

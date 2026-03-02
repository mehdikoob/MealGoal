import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../lib/api';
import { Skeleton } from './ui/skeleton';

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
    return (
      <div className="rules-container">
        <div className="rules-header">
          <Skeleton className="h-8 w-72 mb-2" />
          <Skeleton className="h-5 w-96" />
        </div>
        <div className="rules-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem', marginTop: '1.5rem' }}>
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-36" style={{ borderRadius: 12 }} />
          ))}
        </div>
      </div>
    );
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

export default NutritionalRules;

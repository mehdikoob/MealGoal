import React from 'react';
import { useNavigate } from 'react-router-dom';

// 404 Page
const NotFoundPage = () => {
  const navigate = useNavigate();
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '1rem', textAlign: 'center' }}>
      <h1 style={{ fontSize: '4rem', fontWeight: 700, margin: 0 }}>404</h1>
      <p style={{ fontSize: '1.125rem', opacity: 0.7 }}>Cette page n'existe pas.</p>
      <button className="btn-primary" onClick={() => navigate('/')}>
        Retour à l'accueil
      </button>
    </div>
  );
};

export default NotFoundPage;

import React from 'react';

// Loading Animation Component
const LoadingAnimation = ({ text }) => (
  <div className="loading-container">
    <div className="loading-spinner">
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
      <div className="spinner-ring"></div>
    </div>
    <p className="loading-text">{text}</p>
  </div>
);

export default LoadingAnimation;

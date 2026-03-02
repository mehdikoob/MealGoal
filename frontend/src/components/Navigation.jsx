import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icons from '../constants/icons';

// Navigation Component
const Navigation = ({ currentUser, onLogout, isAdmin, theme, onToggleTheme }) => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav className="nav-header">
      <div className="nav-brand" onClick={() => navigate('/')}>
        <span className="brand-icon"><Icons.Target /></span>
        <span className="brand-text">MealGoal</span>
      </div>
      <div className="nav-right">
        <div className="nav-links">
          {currentUser && !isAdmin && (
            <>
              <button
                className={`nav-link ${location.pathname === '/dashboard' ? 'active' : ''}`}
                onClick={() => navigate('/dashboard')}
              >
                <Icons.Home /> Dashboard
              </button>
              <button
                className={`nav-link ${location.pathname === '/meal-plan' ? 'active' : ''}`}
                onClick={() => navigate('/meal-plan')}
              >
                <Icons.Utensils /> Plan alimentaire
              </button>
              <button
                className={`nav-link ${location.pathname === '/weight-tracking' ? 'active' : ''}`}
                onClick={() => navigate('/weight-tracking')}
              >
                <Icons.Scale /> Suivi poids
              </button>
              <button
                className={`nav-link ${location.pathname === '/rules' ? 'active' : ''}`}
                onClick={() => navigate('/rules')}
              >
                <Icons.Info /> Règles d'or
              </button>
            </>
          )}
          {isAdmin && (
            <>
              <button
                className={`nav-link ${location.pathname === '/admin' ? 'active' : ''}`}
                onClick={() => navigate('/admin')}
              >
                <Icons.BarChart /> Dashboard
              </button>
              <button
                className={`nav-link ${location.pathname === '/admin/users' ? 'active' : ''}`}
                onClick={() => navigate('/admin/users')}
              >
                <Icons.Users /> Clients
              </button>
              <button
                className={`nav-link ${location.pathname === '/admin/meal-plans' ? 'active' : ''}`}
                onClick={() => navigate('/admin/meal-plans')}
              >
                <Icons.Calendar /> Plans
              </button>
              <button
                className={`nav-link ${location.pathname === '/admin/foods' ? 'active' : ''}`}
                onClick={() => navigate('/admin/foods')}
              >
                <Icons.Utensils /> Aliments
              </button>
            </>
          )}
          {(currentUser || isAdmin) && (
            <button className="nav-link logout" onClick={onLogout}>
              <Icons.LogOut /> Déconnexion
            </button>
          )}
        </div>
        <button className="theme-toggle" onClick={onToggleTheme} title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}>
          {theme === 'dark' ? <Icons.Sun /> : <Icons.Moon />}
        </button>
      </div>
    </nav>
  );
};

export default Navigation;

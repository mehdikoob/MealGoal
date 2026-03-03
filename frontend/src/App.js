import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';
import axios from 'axios';
import './lib/api'; // side-effect: sets up axios interceptors
import { API_URL, TOKEN_KEY, ADMIN_TOKEN_KEY } from './lib/api';

import Navigation from './components/Navigation';
import HomePage from './components/HomePage';
import Questionnaire from './components/Questionnaire';
import Dashboard from './components/Dashboard';
import MealPlan from './components/MealPlan';
import WeightTracking from './components/WeightTracking';
import NutritionalRules from './components/NutritionalRules';
import NotFoundPage from './components/NotFoundPage';
import AdminLoginPage from './components/AdminLoginPage';
import AdminDashboard from './components/admin/AdminDashboard';
import AdminUsers from './components/admin/AdminUsers';
import AdminFoods from './components/admin/AdminFoods';
import AdminMealPlans from './components/admin/AdminMealPlans';
import PricingPage from './components/PricingPage';
import PaywallGuard from './components/PaywallGuard';
import LoginPage from './components/LoginPage';
import ForgotPasswordPage from './components/ForgotPasswordPage';
import ResetPasswordPage from './components/ResetPasswordPage';
import PrivacyPage from './components/PrivacyPage';
import TermsPage from './components/TermsPage';

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('mealgoal_theme');
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }

    // Restore user session from token
    const userToken = localStorage.getItem(TOKEN_KEY);
    if (userToken) {
      axios.get(`${API_URL}/api/auth/me`)
        .then(res => {
          setCurrentUser(res.data);
          localStorage.setItem('mealgoal_user', JSON.stringify(res.data));
        })
        .catch(() => {
          // Token expired or invalid — clear it
          localStorage.removeItem(TOKEN_KEY);
          localStorage.removeItem('mealgoal_user');
        });
    }

    // Restore admin session from token
    const adminToken = localStorage.getItem(ADMIN_TOKEN_KEY);
    if (adminToken) {
      setIsAdmin(true);
    }
  }, []);

  const handleQuestionnaireComplete = (user) => {
    setCurrentUser(user);
    localStorage.setItem('mealgoal_user', JSON.stringify(user));
    setShowQuestionnaire(false);
  };

  const handleLogin = (user) => {
    setCurrentUser(user);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem('mealgoal_user');
    localStorage.removeItem('mealgoal_admin');
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  };

  const handleAdminLogin = (token) => {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
    localStorage.setItem('mealgoal_admin', 'true');
    setIsAdmin(true);
  };

  const handleToggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('mealgoal_theme', newTheme);
  };

  return (
    <Router>
      <Toaster position="top-right" richColors />
      <div className="app">
        <Navigation
          currentUser={currentUser}
          onLogout={handleLogout}
          isAdmin={isAdmin}
          theme={theme}
          onToggleTheme={handleToggleTheme}
          onGoHome={() => setShowQuestionnaire(false)}
        />

        <main className="main-content">
          <Routes>
            <Route path="/" element={
              !currentUser && !isAdmin ? (
                showQuestionnaire ? (
                  <Questionnaire onComplete={handleQuestionnaireComplete} />
                ) : (
                  <HomePage
                    onStartQuestionnaire={() => setShowQuestionnaire(true)}
                  />
                )
              ) : isAdmin ? (
                <AdminDashboard />
              ) : (
                <Dashboard user={currentUser} />
              )
            } />

            {currentUser && !isAdmin && (
              <>
                <Route path="/dashboard" element={<Dashboard user={currentUser} />} />
                <Route path="/meal-plan" element={<MealPlan user={currentUser} />} />
                <Route path="/weight-tracking" element={
                  <PaywallGuard user={currentUser}>
                    <WeightTracking user={currentUser} />
                  </PaywallGuard>
                } />
                <Route path="/rules" element={
                  <PaywallGuard user={currentUser}>
                    <NutritionalRules />
                  </PaywallGuard>
                } />
              </>
            )}
            <Route path="/pricing" element={<PricingPage user={currentUser} />} />
            <Route path="/login" element={
              currentUser ? <Dashboard user={currentUser} /> : <LoginPage onLogin={handleLogin} />
            } />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            <Route path="/admin/login" element={
              isAdmin ? <AdminDashboard /> : <AdminLoginPage onAdminLogin={handleAdminLogin} />
            } />
            {isAdmin && (
              <>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/meal-plans" element={<AdminMealPlans />} />
                <Route path="/admin/foods" element={<AdminFoods />} />
              </>
            )}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;

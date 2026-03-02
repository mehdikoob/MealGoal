import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'sonner';
import './App.css';
import './lib/api'; // side-effect: sets up axios interceptor

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

function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedUser = localStorage.getItem('mealgoal_user');
    const savedAdmin = localStorage.getItem('mealgoal_admin');
    const savedTheme = localStorage.getItem('mealgoal_theme');

    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    }
    if (savedAdmin === 'true') {
      setIsAdmin(true);
    }
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.setAttribute('data-theme', savedTheme);
    }
  }, []);

  const handleQuestionnaireComplete = (user) => {
    setCurrentUser(user);
    localStorage.setItem('mealgoal_user', JSON.stringify(user));
    setShowQuestionnaire(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsAdmin(false);
    localStorage.removeItem('mealgoal_user');
    localStorage.removeItem('mealgoal_admin');
  };

  const handleAdminLogin = () => {
    setIsAdmin(true);
    localStorage.setItem('mealgoal_admin', 'true');
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
                <Route path="/weight-tracking" element={<WeightTracking user={currentUser} />} />
                <Route path="/rules" element={<NutritionalRules />} />
              </>
            )}

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

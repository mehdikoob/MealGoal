# MealGoal - Plan alimentaire personnalisé

## Description du projet
Application de génération et suivi de plans alimentaires personnalisés. L'application permet aux utilisateurs de remplir un questionnaire détaillé pour générer un plan nutritionnel adapté à leurs objectifs (perte de gras, maintien, prise de muscle).

## Fonctionnalités principales

### Côté Utilisateur
- **Questionnaire complet** : Collecte des données d'identité, morphologie, mode alimentaire, activité, objectifs et préférences alimentaires
- **Calcul automatique** : Calories journalières et répartition des macronutriments basés sur le profil
- **Plan alimentaire** : Génération d'un plan journalier avec les repas et les quantités
- **Suivi du poids** : Enregistrement des pesées et visualisation de l'évolution
- **Règles d'or** : Affichage des conseils nutritionnels à respecter

### Côté Admin
- **Dashboard** : KPIs avec alertes clients (pesées en retard), progression, dernières activités
- **Gestion clients** : Liste complète, profil détaillé, modification du programme, suppression
- **Banque d'aliments** : 
  - Recherche par nom
  - Filtrage par catégorie (protéines, glucides, lipides)
  - Filtrage par type de repas (petit-déjeuner, déjeuner, dîner, collation)
  - Tri (nom, calories, protéines, catégorie)
  - CRUD complet (ajout, modification, suppression)
  - **Unité personnalisée** : possibilité de définir une unité alternative (ex: "1 oeuf", "1 banane", "1 portion (30g)", "1 cuillère à soupe")
- **Équivalences alimentaires** : Affichage automatique des alternatives pour chaque aliment du plan ("ou X ou Y"), basées sur les aliments autorisés pour le repas
- **Plans alimentaires** : Historique par client, édition manuelle des repas

### UX/UI
- Mode sombre/clair
- Interface entièrement en français
- Design moderne et responsive

## Architecture technique

### Frontend
- **Framework** : React (Create React App)
- **Routing** : React Router
- **Graphiques** : Recharts
- **HTTP Client** : Axios
- **Fichier principal** : `/app/frontend/src/App.js` (monolithique)
- **Styles** : `/app/frontend/src/App.css`

### Backend
- **Framework** : FastAPI
- **Base de données** : MongoDB avec Motor (async)
- **Fichier principal** : `/app/backend/server.py` (monolithique)

### Base de données (MongoDB)
- **users** : Profils utilisateurs avec objectifs et macros calculés
- **foods** : Aliments avec valeurs nutritionnelles et repas autorisés
- **meal_plans** : Plans alimentaires générés
- **weight_logs** : Historique des pesées

## Implémenté (14 février 2026)

### Phase 1 - MVP ✅
- Questionnaire utilisateur complet
- Calcul des calories et macros
- Génération de plan alimentaire
- Suivi du poids avec graphique
- Règles nutritionnelles

### Phase 2 - Admin Dashboard ✅
- Dashboard avec KPIs et alertes
- Gestion des clients (liste, profil, modification programme, suppression)
- Mode sombre/clair

### Phase 3 - Banque d'aliments améliorée ✅
- Interface en cartes avec macros visuels
- Recherche et filtrage avancés
- Statistiques par catégorie cliquables
- CRUD complet

### Phase 4 - Plans alimentaires admin ✅
- Historique des plans par client
- Édition manuelle des repas

## Backlog (Non implémenté)

### P1 - Export PDF
- Permettre l'export du plan alimentaire en PDF

### P2 - Règles nutritionnelles avancées
- Appliquer strictement les règles (ex: viande rouge max 2x/semaine) dans l'algorithme

### P3 - Refactoring
- Découper App.js en composants séparés (src/components/, src/pages/)
- Découper server.py en routers FastAPI (routers/admin.py, routers/user.py)

## API Endpoints

### Utilisateurs
- `POST /api/users` - Créer un utilisateur
- `GET /api/users/{email}` - Récupérer un utilisateur par email

### Admin
- `GET /api/admin/stats` - Statistiques dashboard
- `GET /api/admin/users` - Liste des clients
- `DELETE /api/admin/user/{user_id}` - Supprimer un client
- `POST /api/admin/user/{user_id}/update-program` - Modifier le programme

### Aliments
- `GET /api/foods` - Liste des aliments
- `POST /api/foods` - Ajouter un aliment
- `PUT /api/foods/{food_id}` - Modifier un aliment
- `DELETE /api/foods/{food_id}` - Supprimer un aliment

### Plans alimentaires
- `GET /api/meal-plans/{user_id}` - Historique des plans
- `GET /api/meal-plans/{user_id}/today` - Plan du jour
- `PUT /api/admin/meal-plan/{plan_id}` - Modifier un plan

### Suivi poids
- `POST /api/weight-logs` - Enregistrer une pesée
- `GET /api/weight-logs/{user_id}/stats` - Statistiques de poids

## URL de preview
https://macro-planner-5.preview.emergentagent.com

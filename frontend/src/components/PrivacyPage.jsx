import React from 'react';
import { useNavigate } from 'react-router-dom';

const PrivacyPage = () => {
  const navigate = useNavigate();

  return (
    <div className="legal-page">
      <button className="link-btn legal-back" onClick={() => navigate(-1)}>
        ← Retour
      </button>

      <h1>Politique de confidentialité</h1>
      <p className="legal-date">Dernière mise à jour : mars 2026</p>

      <section>
        <h2>1. Responsable du traitement</h2>
        <p>
          MealGoal est responsable du traitement de vos données personnelles.
          Pour toute question relative à la protection de vos données, contactez-nous à :
          <strong> contact@mealgoal.fr</strong>
        </p>
      </section>

      <section>
        <h2>2. Données collectées</h2>
        <p>Nous collectons les données suivantes lors de votre inscription et utilisation :</p>
        <ul>
          <li>Informations de profil : nom, prénom, email, âge, sexe, taille, poids</li>
          <li>Données nutritionnelles : objectifs, préférences alimentaires, horaires</li>
          <li>Données de suivi : logs de poids, plans alimentaires générés</li>
          <li>Données de paiement : géré directement par Stripe (nous ne stockons pas vos coordonnées bancaires)</li>
        </ul>
      </section>

      <section>
        <h2>3. Finalité du traitement</h2>
        <p>Vos données sont utilisées pour :</p>
        <ul>
          <li>Générer et personnaliser votre plan alimentaire</li>
          <li>Assurer le suivi de votre progression</li>
          <li>Gérer votre compte et abonnement</li>
          <li>Améliorer nos services (données anonymisées)</li>
        </ul>
      </section>

      <section>
        <h2>4. Conservation des données</h2>
        <p>
          Vos données sont conservées pendant la durée de votre utilisation du service et jusqu'à
          3 ans après la clôture de votre compte, conformément aux obligations légales.
        </p>
      </section>

      <section>
        <h2>5. Vos droits</h2>
        <p>Conformément au RGPD, vous disposez des droits suivants :</p>
        <ul>
          <li><strong>Accès</strong> — vous pouvez demander une copie de vos données</li>
          <li><strong>Rectification</strong> — vous pouvez corriger vos données depuis votre profil</li>
          <li><strong>Suppression</strong> — vous pouvez supprimer votre compte depuis les paramètres</li>
          <li><strong>Portabilité</strong> — vous pouvez exporter vos données via l'API</li>
          <li><strong>Opposition</strong> — vous pouvez vous opposer à certains traitements</li>
        </ul>
        <p>Pour exercer ces droits, contactez-nous à <strong>contact@mealgoal.fr</strong>.</p>
      </section>

      <section>
        <h2>6. Cookies</h2>
        <p>
          MealGoal utilise uniquement des cookies techniques indispensables au fonctionnement
          de l'application (authentification). Aucun cookie de tracking ou publicitaire n'est utilisé.
        </p>
      </section>

      <section>
        <h2>7. Sécurité</h2>
        <p>
          Vos données sont protégées par chiffrement (HTTPS), les mots de passe sont hashés
          avec bcrypt et les tokens JWT sont signés.
        </p>
      </section>
    </div>
  );
};

export default PrivacyPage;

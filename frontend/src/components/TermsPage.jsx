import React from 'react';
import { useNavigate } from 'react-router-dom';

const TermsPage = () => {
  const navigate = useNavigate();

  return (
    <div className="legal-page">
      <button className="link-btn legal-back" onClick={() => navigate(-1)}>
        ← Retour
      </button>

      <h1>Conditions Générales d'Utilisation</h1>
      <p className="legal-date">Dernière mise à jour : mars 2026</p>

      <section>
        <h2>1. Objet</h2>
        <p>
          Les présentes CGU régissent l'utilisation de MealGoal, application de génération
          de plans alimentaires personnalisés. En utilisant MealGoal, vous acceptez ces conditions.
        </p>
      </section>

      <section>
        <h2>2. Description du service</h2>
        <p>MealGoal est un outil d'aide à la planification nutritionnelle. Il ne se substitue
        pas à un professionnel de santé ou à un diététicien. Les plans générés sont basés sur
        des calculs algorithmiques et doivent être adaptés à votre situation personnelle.</p>
      </section>

      <section>
        <h2>3. Inscription et compte</h2>
        <ul>
          <li>Vous devez fournir des informations exactes lors de l'inscription</li>
          <li>Vous êtes responsable de la confidentialité de votre mot de passe</li>
          <li>Un seul compte par personne est autorisé</li>
          <li>Vous devez avoir au moins 16 ans pour utiliser MealGoal</li>
        </ul>
      </section>

      <section>
        <h2>4. Abonnements et paiement</h2>
        <ul>
          <li>L'offre gratuite inclut un essai de 14 jours des fonctionnalités Pro</li>
          <li>Les abonnements payants sont mensuels et sans engagement</li>
          <li>Les paiements sont traités via Stripe de manière sécurisée</li>
          <li>Vous pouvez annuler à tout moment depuis votre espace client</li>
          <li>Aucun remboursement pour la période en cours</li>
        </ul>
      </section>

      <section>
        <h2>5. Propriété intellectuelle</h2>
        <p>
          Le contenu de MealGoal (interface, algorithmes, données nutritionnelles) est protégé
          par le droit de la propriété intellectuelle. Toute reproduction est interdite sans
          autorisation écrite.
        </p>
      </section>

      <section>
        <h2>6. Responsabilité</h2>
        <p>
          MealGoal est fourni "en l'état". Nous ne garantissons pas que les plans générés
          conviennent à votre situation médicale spécifique. Consultez un professionnel de
          santé avant de modifier significativement votre alimentation.
        </p>
      </section>

      <section>
        <h2>7. Suppression du compte</h2>
        <p>
          Vous pouvez supprimer votre compte à tout moment depuis les paramètres de votre profil.
          La suppression entraîne l'effacement de toutes vos données personnelles.
        </p>
      </section>

      <section>
        <h2>8. Contact</h2>
        <p>Pour toute question : <strong>contact@mealgoal.fr</strong></p>
      </section>
    </div>
  );
};

export default TermsPage;

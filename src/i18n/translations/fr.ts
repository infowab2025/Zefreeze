import { Translation } from '../../types/i18n';

export const fr: Translation = {
  common: {
    welcome: 'Bienvenue',
    loading: 'Chargement...',
    error: 'Une erreur est survenue',
    save: 'Enregistrer',
    saved: 'Enregistré',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    view: 'Voir',
    search: 'Rechercher',
    filter: 'Filtrer',
    export: 'Exporter',
    previous: 'Précédent',
    next: 'Suivant',
  },
  auth: {
    login: 'Connexion',
    logout: 'Déconnexion',
    email: 'Email',
    password: 'Mot de passe',
    forgotPassword: 'Mot de passe oublié ?',
    register: 'S\'inscrire',
    rememberMe: 'Se souvenir de moi',
  },
  dashboard: {
    title: 'Tableau de bord',
    welcome: 'Bienvenue sur votre tableau de bord',
    stats: {
      users: 'Utilisateurs',
      equipment: 'Équipements',
      interventions: 'Interventions',
      reports: 'Rapports',
    },
  },
  settings: {
    title: 'Paramètres',
    description: 'Gérez vos préférences et paramètres système',
    tabs: {
      general: 'Général',
      notifications: 'Notifications',
      company: 'Entreprise',
      security: 'Sécurité'
    },
    general: {
      title: 'Paramètres généraux',
      language: 'Langue',
      timezone: 'Fuseau horaire'
    },
    company: {
      title: 'Informations entreprise',
      name: 'Nom de l\'entreprise',
      address: 'Adresse',
      phone: 'Téléphone',
      email: 'Email'
    },
    security: {
      title: 'Sécurité',
      password: {
        title: 'Changer le mot de passe',
        current: 'Mot de passe actuel',
        new: 'Nouveau mot de passe',
        confirm: 'Confirmer le mot de passe',
        update: 'Mettre à jour le mot de passe'
      },
      sessions: {
        title: 'Sessions actives',
        current: 'Session actuelle',
        active: 'Actif maintenant'
      },
      '2fa': {
        title: 'Authentification à deux facteurs',
        enable: 'Activer l\'authentification à deux facteurs'
      }
    }
  },
  equipment: {
    title: 'Équipements',
    new: 'Nouvel équipement',
    type: {
      cold_storage: 'Froid commercial',
      vmc: 'VMC',
      other: 'Autre',
    },
    status: {
      operational: 'Opérationnel',
      maintenance_needed: 'Maintenance requise',
      out_of_service: 'Hors service',
    },
  },
  interventions: {
    title: 'Interventions',
    new: 'Nouvelle intervention',
    type: {
      repair: 'Réparation',
      maintenance: 'Maintenance',
      installation: 'Installation',
      audit: 'Audit',
    },
    status: {
      pending: 'En attente',
      scheduled: 'Planifiée',
      in_progress: 'En cours',
      completed: 'Terminée',
      cancelled: 'Annulée',
    },
    priority: {
      low: 'Basse',
      medium: 'Moyenne',
      high: 'Haute',
    },
  },
};
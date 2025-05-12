import { Translation } from '../../types/i18n';

export const en: Translation = {
  common: {
    welcome: 'Welcome',
    loading: 'Loading...',
    error: 'An error occurred',
    save: 'Save',
    saved: 'Saved',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    search: 'Search',
    filter: 'Filter',
    export: 'Export',
    previous: 'Previous',
    next: 'Next',
  },
  auth: {
    login: 'Login',
    logout: 'Logout',
    email: 'Email',
    password: 'Password',
    forgotPassword: 'Forgot password?',
    register: 'Register',
    rememberMe: 'Remember me',
  },
  dashboard: {
    title: 'Dashboard',
    welcome: 'Welcome to your dashboard',
    stats: {
      users: 'Users',
      equipment: 'Equipment',
      interventions: 'Interventions',
      reports: 'Reports',
    },
  },
  settings: {
    title: 'Settings',
    description: 'Manage your preferences and system settings',
    tabs: {
      general: 'General',
      notifications: 'Notifications',
      company: 'Company',
      security: 'Security'
    },
    general: {
      title: 'General Settings',
      language: 'Language',
      timezone: 'Timezone'
    },
    company: {
      title: 'Company Information',
      name: 'Company name',
      address: 'Address',
      phone: 'Phone',
      email: 'Email'
    },
    security: {
      title: 'Security',
      password: {
        title: 'Change Password',
        current: 'Current password',
        new: 'New password',
        confirm: 'Confirm password',
        update: 'Update password'
      },
      sessions: {
        title: 'Active Sessions',
        current: 'Current session',
        active: 'Active now'
      },
      '2fa': {
        title: 'Two-factor authentication',
        enable: 'Enable two-factor authentication'
      }
    }
  },
  equipment: {
    title: 'Equipment',
    new: 'New Equipment',
    type: {
      cold_storage: 'Cold Storage',
      vmc: 'VMC',
      other: 'Other',
    },
    status: {
      operational: 'Operational',
      maintenance_needed: 'Maintenance Needed',
      out_of_service: 'Out of Service',
    },
  },
  interventions: {
    title: 'Interventions',
    new: 'New Intervention',
    type: {
      repair: 'Repair',
      maintenance: 'Maintenance',
      installation: 'Installation',
      audit: 'Audit',
    },
    status: {
      pending: 'Pending',
      scheduled: 'Scheduled',
      in_progress: 'In Progress',
      completed: 'Completed',
      cancelled: 'Cancelled',
    },
    priority: {
      low: 'Low',
      medium: 'Medium',
      high: 'High',
    },
  },
};
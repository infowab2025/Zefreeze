import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useUsers } from '../../hooks/useUsers';
import { format } from 'date-fns';
import { 
  ArrowLeft, Edit, Trash2, Mail, Phone, 
  Building, Calendar, Shield, Globe, Bell,
  Key, CheckCircle, XCircle
} from 'lucide-react';

const UserDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getUser, deleteUser, updateUserStatus, resetPassword } = useUsers();
  const { data: user, isLoading } = getUser(id || '');

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      try {
        await deleteUser.mutateAsync(id!);
        navigate('/dashboard/users');
      } catch (error) {
        console.error('Failed to delete user:', error);
      }
    }
  };

  const handleStatusChange = async () => {
    try {
      await updateUserStatus.mutateAsync({ id: id!, active: !user?.active });
    } catch (error) {
      console.error('Failed to update user status:', error);
    }
  };

  const handleResetPassword = async () => {
    try {
      await resetPassword.mutateAsync(id!);
    } catch (error) {
      console.error('Failed to reset password:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Utilisateur non trouvé</h2>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              to="/dashboard/users"
              className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
              <p className="text-gray-600">ID: {user.id}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={handleStatusChange}
              className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium ${
                user.active
                  ? 'border-red-300 text-red-700 bg-white hover:bg-red-50'
                  : 'border-green-300 text-green-700 bg-white hover:bg-green-50'
              }`}
            >
              {user.active ? 'Désactiver' : 'Activer'}
            </button>
            <Link
              to={`/dashboard/users/${id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Modifier
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Supprimer
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Informations générales</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Nom complet</label>
                  <p className="mt-1 text-gray-900">{user.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Rôle</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.role === 'admin' ? 'bg-purple-100 text-purple-800' :
                      user.role === 'technician' ? 'bg-blue-100 text-blue-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      <Shield className="h-4 w-4 mr-1" />
                      {user.role === 'admin' ? 'Administrateur' :
                       user.role === 'technician' ? 'Technicien' : 'Client'}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Email</label>
                  <div className="mt-1 flex items-center">
                    <Mail className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">{user.email}</p>
                  </div>
                </div>
                {user.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Téléphone</label>
                    <div className="mt-1 flex items-center">
                      <Phone className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{user.phone}</p>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-500">Statut</label>
                  <div className="mt-1">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.active ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Actif
                        </>
                      ) : (
                        <>
                          <XCircle className="h-4 w-4 mr-1" />
                          Inactif
                        </>
                      )}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Date de création</label>
                  <div className="mt-1 flex items-center">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">
                      {format(new Date(user.createdAt), 'dd/MM/yyyy HH:mm')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Company Information */}
          {user.company && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Informations entreprise</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Nom de l'entreprise</label>
                    <div className="mt-1 flex items-center">
                      <Building className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{user.company.name}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Adresse</label>
                    <p className="mt-1 text-gray-900">{user.company.address}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Preferences */}
          {user.preferences && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Préférences</h2>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Notifications</label>
                    <div className="mt-2 space-y-2">
                      <div className="flex items-center">
                        <Bell className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">Email:</span>
                        <span className={`ml-2 text-sm ${
                          user.preferences.notifications.email ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {user.preferences.notifications.email ? 'Activé' : 'Désactivé'}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Bell className="h-4 w-4 text-gray-400 mr-2" />
                        <span className="text-sm text-gray-900">Push:</span>
                        <span className={`ml-2 text-sm ${
                          user.preferences.notifications.push ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {user.preferences.notifications.push ? 'Activé' : 'Désactivé'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Langue</label>
                    <div className="mt-1 flex items-center">
                      <Globe className="h-4 w-4 text-gray-400 mr-2" />
                      <p className="text-gray-900">{user.preferences.language}</p>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Fuseau horaire</label>
                    <p className="mt-1 text-gray-900">{user.preferences.timezone}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Security */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Sécurité</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Dernière connexion</label>
                  <p className="mt-1 text-gray-900">
                    {user.lastLoginAt
                      ? format(new Date(user.lastLoginAt), 'dd/MM/yyyy HH:mm')
                      : 'Jamais connecté'}
                  </p>
                </div>
                <button
                  onClick={handleResetPassword}
                  className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Key className="h-4 w-4 mr-2" />
                  Réinitialiser le mot de passe
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserDetailsPage;
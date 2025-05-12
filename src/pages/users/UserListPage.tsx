import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  UserPlus, Download, Filter, Search,
  Shield, Settings, Mail, Phone, User as UserIcon
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import CsvImportButton from '../../components/common/CsvImportButton';
import CsvImportModal from '../../components/common/CsvImportModal';
import CsvImportGuide from '../../components/crm/CsvImportGuide';
import { useCsvImport } from '../../hooks/useCsvImport';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

const UserListPage = () => {
  const [showImportGuide, setShowImportGuide] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const { user: currentUser } = useAuth();

  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        return data;
      } catch (error) {
        console.error('Error fetching users:', error);
        toast.error('Erreur lors du chargement des utilisateurs');
        return [];
      }
    },
  });

  const filteredUsers = users?.filter(user => {
    const matchesSearch = 
      user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesRole = filterRole === 'all' || user.role === filterRole;
    
    return matchesSearch && matchesRole;
  });

  const roleColors = {
    admin: 'bg-purple-100 text-purple-800',
    technician: 'bg-blue-100 text-blue-800',
    client: 'bg-green-100 text-green-800'
  };

  const roleIcons = {
    admin: <Shield size={16} />,
    technician: <Settings size={16} />,
    client: <UserPlus size={16} />
  };

  const { handleImport, isImporting } = useCsvImport({
    requiredHeaders: ['name', 'email', 'phone', 'role', 'company_name'],
    validateRow: (row) => {
      return ['admin', 'technician', 'client'].includes(row.role);
    },
    async onImport(data) {
      for (const user of data) {
        // Get company ID from name if provided
        let company_id = null;
        if (user.company_name) {
          const { data: company } = await supabase
            .from('companies')
            .select('id')
            .eq('name', user.company_name)
            .single();
          company_id = company?.id;
        }

        try {
          // Remove company_name and add company_id
          const { company_name, ...userData } = user;
          
          // Create user through edge function
          const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
            },
            body: JSON.stringify({
              ...userData,
              company_id,
              preferences: {
                language: 'fr',
                timezone: 'Europe/Paris',
                notifications: { email: true, push: true }
              }
            }),
          });
          
          if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create user');
          }
        } catch (error) {
          console.error('Error creating user:', error);
          toast.error(`Erreur lors de la création de l'utilisateur ${user.email}`);
        }
      }
      
      // Refresh the user list
      refetch();
    }
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Utilisateurs</h1>
        <p className="text-gray-600">Gérez les utilisateurs de la plateforme</p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {currentUser?.role === 'admin' && (
                <>
                  <Link
                    to="/dashboard/users/new"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Nouvel utilisateur
                  </Link>
                  <CsvImportButton 
                    onImport={handleImport}
                    disabled={isImporting}
                  >
                    Importer CSV
                  </CsvImportButton>
                  <button
                    onClick={() => setShowImportGuide(true)}
                    className="text-sm text-blue-600 hover:text-blue-800"
                  >
                    Guide d'importation
                  </button>
                </>
              )}
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="all">Tous les rôles</option>
                <option value="admin">Administrateurs</option>
                <option value="technician">Techniciens</option>
                <option value="client">Clients</option>
              </select>
              <div className="relative w-full sm:w-64">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Search className="h-4 w-4 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher..."
                  className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Utilisateur
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rôle
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière connexion
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center">
                    <div className="flex justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                  </td>
                </tr>
              ) : filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          {user.avatar ? (
                            <img
                              src={user.avatar}
                              alt={user.name}
                              className="h-10 w-10 rounded-full"
                            />
                          ) : (
                            <span className="text-xl font-medium text-gray-600">
                              {user.name?.charAt(0) || <UserIcon className="h-6 w-6 text-gray-500" />}
                            </span>
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500">ID: {user.id?.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <div className="flex items-center text-sm text-gray-900">
                          <Mail className="h-4 w-4 mr-2 text-gray-400" />
                          {user.email}
                        </div>
                        {user.phone && (
                          <div className="flex items-center text-sm text-gray-500">
                            <Phone className="h-4 w-4 mr-2 text-gray-400" />
                            {user.phone}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role] || 'bg-gray-100 text-gray-800'}`}>
                        {roleIcons[user.role] || null}
                        <span className="ml-1.5">
                          {user.role === 'admin' ? 'Administrateur' :
                           user.role === 'technician' ? 'Technicien' : 'Client'}
                        </span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {user.active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.last_login_at ? format(new Date(user.last_login_at), 'dd/MM/yyyy HH:mm') : 'Jamais'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <Link
                        to={`/dashboard/users/${user.id}`}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Voir détails
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                    Aucun utilisateur trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Affichage de <span className="font-medium">1</span> à{' '}
              <span className="font-medium">{filteredUsers?.length || 0}</span> sur{' '}
              <span className="font-medium">{users?.length || 0}</span> utilisateurs
            </div>
            <div className="flex-1 flex justify-end">
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Précédent
                </button>
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50">
                  1
                </button>
                <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                  Suivant
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>

      <CsvImportModal
        isOpen={showImportGuide}
        onClose={() => setShowImportGuide(false)}
        title="Guide d'importation CSV"
      >
        <CsvImportGuide type="users" />
      </CsvImportModal>
    </div>
  );
};

export default UserListPage;
import React from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Building, Mail, Phone, MapPin,
  Users, Settings, Calendar, ArrowLeft,
  Edit, Trash2, Download, Clock,
  CheckCircle, AlertTriangle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface Company {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
  stats?: {
    equipmentCount: number;
    userCount: number;
    interventionCount: number;
  };
  equipment?: Array<{
    id: string;
    name: string;
    type: string;
    status: string;
    lastMaintenance: string;
  }>;
  users?: Array<{
    id: string;
    name: string;
    role: string;
    email: string;
  }>;
  interventions?: Array<{
    id: string;
    type: string;
    status: string;
    date: string;
    technician: string;
  }>;
}

const CompanyDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: company, isLoading } = useQuery({
    queryKey: ['companies', id],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .eq('id', id)
          .single();
        
        if (error) throw error;
        
        // Fetch related data
        const [equipmentResult, usersResult, interventionsResult] = await Promise.all([
          supabase.from('equipment').select('*').eq('company_id', id),
          supabase.from('users').select('*').eq('company_id', id),
          supabase.from('interventions').select('*').eq('company_id', id)
        ]);
        
        // Calculate stats
        const stats = {
          equipmentCount: equipmentResult.data?.length || 0,
          userCount: usersResult.data?.length || 0,
          interventionCount: interventionsResult.data?.length || 0
        };
        
        // Format equipment data
        const equipment = equipmentResult.data?.map(item => ({
          id: item.id,
          name: item.name,
          type: item.type,
          status: item.status,
          lastMaintenance: item.last_maintenance_date || new Date().toISOString()
        })) || [];
        
        // Format users data
        const users = usersResult.data?.map(user => ({
          id: user.id,
          name: user.name,
          role: user.role,
          email: user.email
        })) || [];
        
        // Format interventions data
        const interventions = interventionsResult.data?.map(intervention => ({
          id: intervention.id,
          type: intervention.type,
          status: intervention.status,
          date: intervention.created_at,
          technician: 'Technicien' // In a real app, you would fetch the technician name
        })) || [];
        
        return {
          ...data,
          stats,
          equipment,
          users,
          interventions
        } as Company;
      } catch (error) {
        console.error('Error fetching company details:', error);
        throw error;
      }
    }
  });

  const deleteCompany = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['companies'] });
      toast.success('Entreprise supprimée avec succès');
      navigate('/dashboard/companies');
    },
    onError: (error: any) => {
      console.error('Failed to delete company:', error);
      toast.error(`Échec de la suppression: ${error.message}`);
    }
  });

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette entreprise ?')) {
      deleteCompany.mutate();
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Entreprise non trouvée</h2>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Link
              to="/dashboard/companies"
              className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{company.name}</h1>
              <p className="text-gray-600">ID: {company.id}</p>
            </div>
          </div>
          <div className="flex space-x-3">
            <Link
              to={`/dashboard/companies/${id}/edit`}
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
          {/* Company Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Informations générales</h2>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Nom</label>
                  <div className="mt-1 flex items-center">
                    <Building className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-gray-900">{company.name}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Adresse</label>
                  <div className="mt-1 flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-gray-900">{company.address}</p>
                  </div>
                </div>
                {company.email && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Email</label>
                    <div className="mt-1 flex items-center">
                      <Mail className="h-5 w-5 text-gray-400 mr-2" />
                      <p className="text-gray-900">{company.email}</p>
                    </div>
                  </div>
                )}
                {company.phone && (
                  <div>
                    <label className="block text-sm font-medium text-gray-500">Téléphone</label>
                    <div className="mt-1 flex items-center">
                      <Phone className="h-5 w-5 text-gray-400 mr-2" />
                      <p className="text-gray-900">{company.phone}</p>
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-sm font-medium text-gray-500">Date de création</label>
                  <div className="mt-1 flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-gray-900">
                      {format(new Date(company.created_at), 'dd/MM/yyyy')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Equipment List */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Équipements</h2>
              <Link
                to={`/dashboard/equipment/new?company=${company.id}`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Ajouter un équipement
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nom
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dernière maintenance
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {company.equipment?.map((equipment) => (
                    <tr key={equipment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link
                          to={`/dashboard/equipment/${equipment.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {equipment.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {equipment.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          equipment.status === 'operational' ? 'bg-green-100 text-green-800' :
                          equipment.status === 'maintenance_needed' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {equipment.status === 'operational' ? (
                            <CheckCircle className="h-4 w-4 mr-1" />
                          ) : equipment.status === 'maintenance_needed' ? (
                            <Clock className="h-4 w-4 mr-1" />
                          ) : (
                            <AlertTriangle className="h-4 w-4 mr-1" />
                          )}
                          {equipment.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(equipment.lastMaintenance), 'dd/MM/yyyy')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Interventions */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Interventions récentes</h2>
              <Link
                to={`/dashboard/interventions/new?company=${company.id}`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Nouvelle intervention
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Type
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Technicien
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {company.interventions?.map((intervention) => (
                    <tr key={intervention.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(intervention.date), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {intervention.type}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {intervention.technician}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          intervention.status === 'completed' ? 'bg-green-100 text-green-800' :
                          intervention.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                          {intervention.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Stats */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Statistiques</h2>
            </div>
            <div className="p-6 space-y-6">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Settings className="h-6 w-6 text-blue-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Équipements</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {company.stats?.equipmentCount || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Utilisateurs</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {company.stats?.userCount || 0}
                  </p>
                </div>
              </div>
              <div className="flex items-center">
                <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-purple-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500">Interventions</p>
                  <p className="text-2xl font-semibold text-gray-900">
                    {company.stats?.interventionCount || 0}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Users */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-lg font-medium text-gray-900">Utilisateurs</h2>
              <Link
                to={`/dashboard/users/new?company=${company.id}`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Ajouter
              </Link>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {company.users?.map((user) => (
                  <div key={user.id} className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                      {user.name.charAt(0)}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                    <div className="ml-auto">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {user.role}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Documents */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Documents</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <button className="w-full flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Download className="h-5 w-5 mr-2 text-gray-500" />
                  Fiche entreprise
                </button>
                <button className="w-full flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Download className="h-5 w-5 mr-2 text-gray-500" />
                  Historique interventions
                </button>
                <button className="w-full flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                  <Download className="h-5 w-5 mr-2 text-gray-500" />
                  Rapport HACCP
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompanyDetailsPage;
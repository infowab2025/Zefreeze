import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  User, Settings, Calendar, Phone, Mail, 
  CheckCircle, XCircle, Edit, Trash2, Plus,
  Search, Filter, Download, Eye
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';

interface Technician {
  id: string;
  name: string;
  email: string;
  phone: string;
  active: boolean;
  department: string;
  specialties: string[];
  lastLoginAt?: string;
  createdAt: string;
}

const TechnicianManagementPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedTechnicianId, setSelectedTechnicianId] = useState<string | null>(null);

  const { data: technicians, isLoading, refetch } = useQuery({
    queryKey: ['technicians'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('role', 'technician')
          .order('name');
        
        if (error) throw error;
        
        // Format data for display
        return data.map(tech => ({
          ...tech,
          department: tech.metadata?.department || 'Non assigné',
          specialties: tech.metadata?.specialties || []
        })) as Technician[];
      } catch (error) {
        console.error('Error fetching technicians:', error);
        toast.error('Erreur lors du chargement des techniciens');
        return [];
      }
    }
  });

  const handleDeleteClick = (id: string) => {
    setSelectedTechnicianId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedTechnicianId) return;
    
    try {
      const { error } = await supabase
        .from('users')
        .update({ active: false })
        .eq('id', selectedTechnicianId);
      
      if (error) throw error;
      
      toast.success('Technicien désactivé avec succès');
      refetch();
    } catch (error) {
      console.error('Error disabling technician:', error);
      toast.error('Erreur lors de la désactivation du technicien');
    } finally {
      setShowDeleteModal(false);
      setSelectedTechnicianId(null);
    }
  };

  const handleStatusToggle = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({ active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      
      toast.success(`Technicien ${currentStatus ? 'désactivé' : 'activé'} avec succès`);
      refetch();
    } catch (error) {
      console.error('Error toggling technician status:', error);
      toast.error('Erreur lors de la modification du statut');
    }
  };

  const filteredTechnicians = technicians?.filter(tech => {
    const matchesSearch = 
      tech.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      tech.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      filterStatus === 'all' || 
      (filterStatus === 'active' && tech.active) || 
      (filterStatus === 'inactive' && !tech.active);
    
    const matchesDepartment = 
      filterDepartment === 'all' || 
      tech.department === filterDepartment;
    
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  // Get unique departments for filter
  const departments = technicians 
    ? [...new Set(technicians.map(tech => tech.department))]
    : [];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Techniciens</h1>
        <p className="text-gray-600">Gérez l'équipe technique, les disponibilités et les compétences</p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <Link
                to="/dashboard/users/new?role=technician"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau technicien
              </Link>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="active">Actifs</option>
                  <option value="inactive">Inactifs</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={filterDepartment}
                  onChange={(e) => setFilterDepartment(e.target.value)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <option value="all">Tous les départements</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </button>
            </div>
            <div className="w-full sm:w-64">
              <div className="relative">
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
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredTechnicians && filteredTechnicians.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Technicien
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Département
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Spécialités
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTechnicians.map((technician) => (
                  <tr key={technician.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                          <User className="h-6 w-6 text-gray-500" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{technician.name}</div>
                          <div className="text-sm text-gray-500">ID: {technician.id.substring(0, 8)}...</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center">
                        <Mail className="h-4 w-4 text-gray-400 mr-2" />
                        {technician.email}
                      </div>
                      {technician.phone && (
                        <div className="text-sm text-gray-500 flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-2" />
                          {technician.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{technician.department}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-wrap gap-1">
                        {Array.isArray(technician.specialties) && technician.specialties.length > 0 ? (
                          technician.specialties.map((specialty, index) => (
                            <span 
                              key={index}
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {specialty}
                            </span>
                          ))
                        ) : (
                          <span className="text-sm text-gray-500">Non spécifié</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        technician.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {technician.active ? (
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
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <Link
                          to={`/dashboard/users/${technician.id}`}
                          className="text-blue-600 hover:text-blue-900"
                          title="Voir détails"
                        >
                          <Eye className="h-5 w-5" />
                        </Link>
                        <Link
                          to={`/dashboard/users/${technician.id}/edit`}
                          className="text-gray-600 hover:text-gray-900"
                          title="Modifier"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                        <Link
                          to={`/dashboard/technician/schedule/${technician.id}`}
                          className="text-purple-600 hover:text-purple-900"
                          title="Planning"
                        >
                          <Calendar className="h-5 w-5" />
                        </Link>
                        <button
                          onClick={() => handleStatusToggle(technician.id, technician.active)}
                          className={`${
                            technician.active ? 'text-red-600 hover:text-red-900' : 'text-green-600 hover:text-green-900'
                          }`}
                          title={technician.active ? 'Désactiver' : 'Activer'}
                        >
                          {technician.active ? (
                            <XCircle className="h-5 w-5" />
                          ) : (
                            <CheckCircle className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-6 text-center text-gray-500">
              {searchTerm || filterStatus !== 'all' || filterDepartment !== 'all' ? 
                'Aucun technicien ne correspond aux critères de recherche' : 
                'Aucun technicien trouvé'}
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen px-4">
            <div className="fixed inset-0 bg-black opacity-30"></div>
            
            <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Confirmer la désactivation</h3>
                <p className="text-sm text-gray-500 mb-6">
                  Êtes-vous sûr de vouloir désactiver ce technicien ? Il ne pourra plus se connecter ni être assigné à des interventions.
                </p>
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => setShowDeleteModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleConfirmDelete}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                  >
                    Désactiver
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TechnicianManagementPage;
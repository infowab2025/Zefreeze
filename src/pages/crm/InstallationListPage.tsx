import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  ThermometerSnowflake, Fan, Settings, 
  Plus, Filter, Download, Search,
  MapPin, User
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/axios';
import InstallationStatusBadge from '../../components/installation/InstallationStatusBadge';
import InstallationRequestCard from '../../components/installation/InstallationRequestCard';
import { useInstallationRequests } from '../../hooks/useInstallationRequests';
import { installationService } from '../../services/installationService';

interface Installation {
  id: string;
  type: 'cold_storage' | 'vmc' | 'other';
  client: {
    name: string;
    address: string;
  };
  installationDate: string;
  status: 'pending' | 'assigned' | 'scheduled' | 'completed' | 'cancelled';
  technician?: {
    name: string;
  };
}

const InstallationListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  const { data: installations, isLoading } = useQuery({
    queryKey: ['installations'],
    queryFn: installationService.getAllInstallations,
  });

  const { requests, isLoading: isLoadingRequests } = useInstallationRequests();

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cold_storage':
        return <ThermometerSnowflake className="h-5 w-5 text-blue-500" />;
      case 'vmc':
        return <Fan className="h-5 w-5 text-green-500" />;
      default:
        return <Settings className="h-5 w-5 text-purple-500" />;
    }
  };

  const filteredInstallations = installations?.filter(installation => {
    const matchesSearch = 
      installation.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      installation.client.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && installation.status === filterStatus;
  });

  if (isLoading || isLoadingRequests) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Installations</h1>
        <p className="text-gray-600">Gérez les demandes d'installation et le planning des techniciens</p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <Link
                to="/dashboard/installations/request"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle installation
              </Link>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">En attente</option>
                  <option value="assigned">Assignée</option>
                  <option value="scheduled">Planifiée</option>
                  <option value="completed">Terminée</option>
                  <option value="cancelled">Annulée</option>
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

        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Demandes d'installation en attente</h2>
        </div>

        {requests.data && requests.data.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
            {requests.data.map((request) => (
              <InstallationRequestCard key={request.id} request={request} />
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-gray-500">
            Aucune demande d'installation en attente
          </div>
        )}
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Installations planifiées</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Installation
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Technicien
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
              {filteredInstallations?.map((installation) => (
                <tr key={installation.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getTypeIcon(installation.type)}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {installation.type === 'cold_storage' ? 'Froid commercial' :
                           installation.type === 'vmc' ? 'VMC' : 'Autre'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {installation.id}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{installation.client.name}</div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <MapPin className="h-4 w-4 mr-1" />
                      {installation.client.address}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(installation.installationDate), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {installation.technician ? (
                      <div className="flex items-center">
                        <User className="h-4 w-4 text-gray-400 mr-2" />
                        {installation.technician.name}
                      </div>
                    ) : (
                      <span className="text-gray-500">Non assigné</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <InstallationStatusBadge status={installation.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link
                      to={`/dashboard/installations/${installation.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Voir détails
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Affichage de <span className="font-medium">1</span> à{' '}
              <span className="font-medium">{filteredInstallations?.length || 0}</span> sur{' '}
              <span className="font-medium">{installations?.length || 0}</span> installations
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
    </div>
  );
};

export default InstallationListPage;
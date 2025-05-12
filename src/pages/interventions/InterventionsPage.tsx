import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { 
  Clock, CheckCircle, AlertTriangle, 
  ThermometerSnowflake, Fan, ClipboardCheck,
  FileText, Download, Eye
} from 'lucide-react';
import { api } from '../../lib/axios';
import { Intervention } from '../../types/intervention';

const InterventionsPage = () => {
  const { data: interventions, isLoading } = useQuery({
    queryKey: ['interventions'],
    queryFn: async () => {
      const response = await api.get<Intervention[]>('/interventions');
      return response.data;
    },
  });

  const statusColors = {
    pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock size={16} /> },
    scheduled: { bg: 'bg-blue-100', text: 'text-blue-800', icon: <Clock size={16} /> },
    in_progress: { bg: 'bg-purple-100', text: 'text-purple-800', icon: <Clock size={16} /> },
    completed: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle size={16} /> },
    cancelled: { bg: 'bg-red-100', text: 'text-red-800', icon: <AlertTriangle size={16} /> },
  };

  const categoryIcons = {
    cold_storage: <ThermometerSnowflake className="h-5 w-5 text-blue-500" />,
    vmc: <Fan className="h-5 w-5 text-green-500" />,
    haccp: <ClipboardCheck className="h-5 w-5 text-purple-500" />,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Interventions</h1>
        <p className="text-gray-600">Gérez vos interventions techniques</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div className="flex space-x-4">
            <button className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
              Nouvelle intervention
            </button>
            <button className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              Filtrer
            </button>
          </div>
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span>Total: {interventions?.length || 0} interventions</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Référence
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Technicien
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {interventions?.map((intervention) => (
                <tr key={intervention.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {intervention.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {categoryIcons[intervention.category]}
                      <span className="ml-2 text-sm text-gray-900">
                        {intervention.type === 'repair' ? 'Réparation' :
                         intervention.type === 'maintenance' ? 'Maintenance' :
                         intervention.type === 'installation' ? 'Installation' : 'Audit'}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{intervention.client.name}</div>
                    <div className="text-sm text-gray-500">{intervention.client.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {intervention.scheduledDate ? 
                      format(new Date(intervention.scheduledDate), 'dd/MM/yyyy HH:mm') : 
                      'Non planifiée'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusColors[intervention.status].bg
                    } ${statusColors[intervention.status].text}`}>
                      {statusColors[intervention.status].icon}
                      <span className="ml-1">
                        {intervention.status === 'pending' ? 'En attente' :
                         intervention.status === 'scheduled' ? 'Planifiée' :
                         intervention.status === 'in_progress' ? 'En cours' :
                         intervention.status === 'completed' ? 'Terminée' : 'Annulée'}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {intervention.technician?.name || 'Non assigné'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex space-x-2">
                      <button className="text-blue-600 hover:text-blue-900">
                        <Eye size={18} />
                      </button>
                      {intervention.report && (
                        <button className="text-green-600 hover:text-green-900">
                          <FileText size={18} />
                        </button>
                      )}
                      <button className="text-gray-600 hover:text-gray-900">
                        <Download size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default InterventionsPage;
import React, { useEffect, useState } from 'react';
import { Card } from '../../components/ui/card';
import { useI18n } from '../../contexts/I18nContext';
import { 
  BarChart, Users, Wrench, FileText, Database, 
  CheckCircle, Clock, AlertTriangle, TrendingUp, 
  Calendar, ThermometerSnowflake, Fan, Clipboard
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Link } from 'react-router-dom';

const AdminDashboard: React.FC = () => {
  const { t } = useI18n();
  const [stats, setStats] = useState({
    users: 0,
    equipment: 0,
    interventions: 0,
    reports: 0,
    pendingInterventions: 0,
    completedInterventions: 0,
    successRate: 0,
    avgResponseTime: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentInterventions, setRecentInterventions] = useState<any[]>([]);
  const [equipmentByType, setEquipmentByType] = useState({
    cold_storage: 0,
    vmc: 0,
    other: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        // Fetch counts from each table
        const [usersResult, equipmentResult, interventionsResult, reportsResult] = await Promise.all([
          supabase.from('users').select('id', { count: 'exact', head: true }),
          supabase.from('equipment').select('id, type', { count: 'exact' }),
          supabase.from('interventions').select('id, status', { count: 'exact' }),
          supabase.from('reports').select('id', { count: 'exact', head: true })
        ]);

        // Get equipment by type
        const equipmentData = equipmentResult.data || [];
        const equipmentTypes = {
          cold_storage: equipmentData.filter(e => e.type === 'cold_storage').length,
          vmc: equipmentData.filter(e => e.type === 'vmc').length,
          other: equipmentData.filter(e => e.type === 'other').length
        };
        setEquipmentByType(equipmentTypes);

        // Get intervention stats
        const interventionData = interventionsResult.data || [];
        const pendingCount = interventionData.filter(i => ['pending', 'scheduled'].includes(i.status)).length;
        const completedCount = interventionData.filter(i => i.status === 'completed').length;
        const successRate = interventionData.length > 0 
          ? Math.round((completedCount / interventionData.length) * 100) 
          : 0;

        // Fetch recent interventions
        const { data: recentData } = await supabase
          .from('interventions')
          .select(`
            id, type, status, scheduled_date, description,
            company:company_id(name),
            technician:technician_id(name)
          `)
          .order('created_at', { ascending: false })
          .limit(5);
        
        setRecentInterventions(recentData || []);
        
        setStats({
          users: usersResult.count || 0,
          equipment: equipmentResult.count || 0,
          interventions: interventionsResult.count || 0,
          reports: reportsResult.count || 0,
          pendingInterventions: pendingCount,
          completedInterventions: completedCount,
          successRate: successRate,
          avgResponseTime: 24 // Mock data: 24 hours average response time
        });
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'scheduled':
        return 'bg-purple-100 text-purple-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'in_progress':
        return <Wrench className="h-4 w-4 mr-1" />;
      case 'scheduled':
        return <Calendar className="h-4 w-4 mr-1" />;
      case 'pending':
        return <Clock className="h-4 w-4 mr-1" />;
      case 'cancelled':
        return <AlertTriangle className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cold_storage':
        return <ThermometerSnowflake className="h-5 w-5 text-blue-500" />;
      case 'vmc':
        return <Fan className="h-5 w-5 text-green-500" />;
      case 'repair':
        return <Wrench className="h-5 w-5 text-orange-500" />;
      case 'maintenance':
        return <Clipboard className="h-5 w-5 text-purple-500" />;
      default:
        return <Wrench className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('dashboard.title')}</h1>
      
      {/* Key Indicators */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('dashboard.stats.users')}</p>
              <p className="text-2xl font-semibold mt-2">{isLoading ? '...' : stats.users}</p>
            </div>
            <Users className="w-8 h-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('dashboard.stats.equipment')}</p>
              <p className="text-2xl font-semibold mt-2">{isLoading ? '...' : stats.equipment}</p>
            </div>
            <Wrench className="w-8 h-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('dashboard.stats.interventions')}</p>
              <p className="text-2xl font-semibold mt-2">{isLoading ? '...' : stats.interventions}</p>
            </div>
            <BarChart className="w-8 h-8 text-purple-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">{t('dashboard.stats.reports')}</p>
              <p className="text-2xl font-semibold mt-2">{isLoading ? '...' : stats.reports}</p>
            </div>
            <FileText className="w-8 h-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Statut des interventions</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-700">En attente</span>
                </div>
                <span className="text-sm font-medium">{stats.pendingInterventions}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-500 h-2 rounded-full" 
                  style={{ 
                    width: `${stats.interventions > 0 ? (stats.pendingInterventions / stats.interventions) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm text-gray-700">Terminées</span>
                </div>
                <span className="text-sm font-medium">{stats.completedInterventions}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ 
                    width: `${stats.interventions > 0 ? (stats.completedInterventions / stats.interventions) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-200">
              <div className="flex justify-between items-center">
                <div className="flex items-center">
                  <TrendingUp className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm font-medium text-gray-700">Taux de réussite</span>
                </div>
                <span className="text-sm font-medium text-blue-600">{stats.successRate}%</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Équipements par type</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <ThermometerSnowflake className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-700">Froid commercial</span>
                </div>
                <span className="text-sm font-medium">{equipmentByType.cold_storage}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ 
                    width: `${stats.equipment > 0 ? (equipmentByType.cold_storage / stats.equipment) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <Fan className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm text-gray-700">VMC</span>
                </div>
                <span className="text-sm font-medium">{equipmentByType.vmc}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full" 
                  style={{ 
                    width: `${stats.equipment > 0 ? (equipmentByType.vmc / stats.equipment) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <Wrench className="h-4 w-4 text-purple-500 mr-2" />
                  <span className="text-sm text-gray-700">Autres</span>
                </div>
                <span className="text-sm font-medium">{equipmentByType.other}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full" 
                  style={{ 
                    width: `${stats.equipment > 0 ? (equipmentByType.other / stats.equipment) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Performance</h2>
          <div className="space-y-6">
            <div className="flex items-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Délai moyen d'intervention</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.avgResponseTime}h</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mr-4">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Interventions réussies dès la 1ère visite</p>
                <p className="text-2xl font-semibold text-gray-900">{stats.successRate}%</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Interventions */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Interventions récentes</h2>
          <Link to="/dashboard/interventions" className="text-sm text-blue-600 hover:text-blue-800">
            Voir toutes les interventions
          </Link>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Client
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Technicien
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Statut
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {recentInterventions.length > 0 ? (
                recentInterventions.map((intervention) => (
                  <tr key={intervention.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {getTypeIcon(intervention.type)}
                        <span className="ml-2 text-sm font-medium text-gray-900">
                          {intervention.type === 'repair' ? 'Réparation' :
                           intervention.type === 'maintenance' ? 'Maintenance' :
                           intervention.type === 'installation' ? 'Installation' : 'Audit'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {intervention.company?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {intervention.technician?.name || 'Non assigné'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {intervention.scheduled_date ? 
                        new Date(intervention.scheduled_date).toLocaleDateString('fr-FR') : 
                        'Non planifiée'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(intervention.status)}`}>
                        {getStatusIcon(intervention.status)}
                        {intervention.status === 'pending' ? 'En attente' :
                         intervention.status === 'scheduled' ? 'Planifiée' :
                         intervention.status === 'in_progress' ? 'En cours' :
                         intervention.status === 'completed' ? 'Terminée' : 'Annulée'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                    Aucune intervention récente
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
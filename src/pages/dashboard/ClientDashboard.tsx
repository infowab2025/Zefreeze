import React, { useState, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { useI18n } from '../../contexts/I18nContext';
import { 
  BarChart3, Calendar, ClipboardList, Settings, Users, ThermometerSnowflake, Fan, CheckCircle, AlertTriangle, Clock, FileText, ArrowRight, MapPin, PenTool as Tool, Phone, CreditCard
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

const ClientDashboard = () => {
  const { t } = useI18n();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    equipmentCount: 0,
    interventionsCount: 0,
    pendingInterventions: 0,
    completedInterventions: 0,
    upcomingMaintenances: 0
  });
  const [equipment, setEquipment] = useState<any[]>([]);
  const [upcomingInterventions, setUpcomingInterventions] = useState<any[]>([]);
  const [recentReports, setRecentReports] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompany, setHasCompany] = useState(true);

  useEffect(() => {
    const fetchClientData = async () => {
      if (!user?.id) return;
      
      setIsLoading(true);
      try {
        // Get client's company ID using maybeSingle() to handle no results
        const { data: userData, error: userError } = await supabase
          .from('users')
          .select('company_id')
          .eq('id', user.id)
          .maybeSingle();
        
        if (userError) throw userError;
        
        // Check if userData exists and has company_id
        if (!userData?.company_id) {
          console.warn('User has no associated company');
          setHasCompany(false);
          setIsLoading(false);
          return;
        }
        
        const companyId = userData.company_id;
        
        // Fetch equipment
        const { data: equipmentData, error: equipmentError } = await supabase
          .from('equipment')
          .select('*')
          .eq('company_id', companyId)
          .order('name');
        
        if (equipmentError) throw equipmentError;
        setEquipment(equipmentData || []);
        
        // Fetch interventions
        const { data: interventions, error: interventionsError } = await supabase
          .from('interventions')
          .select(`
            id, type, status, priority, scheduled_date, description, created_at,
            technician:technician_id(name, phone),
            equipment:equipment_id(name, type)
          `)
          .eq('company_id', companyId)
          .order('scheduled_date', { ascending: true });
        
        if (interventionsError) throw interventionsError;
        
        // Get today's date at midnight
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        // Filter upcoming interventions
        const upcoming = interventions?.filter(i => {
          if (!i.scheduled_date) return false;
          const scheduledDate = new Date(i.scheduled_date);
          return scheduledDate >= today && ['scheduled', 'pending'].includes(i.status);
        }).slice(0, 3) || [];
        
        setUpcomingInterventions(upcoming);
        
        // Fetch recent reports
        const { data: reports, error: reportsError } = await supabase
          .from('reports')
          .select(`
            id, type, created_at, status,
            intervention:intervention_id(
              id, type, equipment_id,
              equipment:equipment_id(name, type)
            )
          `)
          .order('created_at', { ascending: false })
          .limit(3);
        
        if (reportsError) throw reportsError;
        setRecentReports(reports || []);
        
        // Calculate stats
        const pendingCount = interventions?.filter(i => ['pending', 'scheduled'].includes(i.status)).length || 0;
        const completedCount = interventions?.filter(i => i.status === 'completed').length || 0;
        
        // Count equipment needing maintenance
        const maintenanceNeeded = equipmentData?.filter(e => e.status === 'maintenance_needed').length || 0;
        
        setStats({
          equipmentCount: equipmentData?.length || 0,
          interventionsCount: interventions?.length || 0,
          pendingInterventions: pendingCount,
          completedInterventions: completedCount,
          upcomingMaintenances: maintenanceNeeded
        });
      } catch (error) {
        console.error('Error fetching client data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, [user?.id]);

  // If user has no company, show a message
  if (!hasCompany) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md">
          <div className="flex">
            <div className="flex-shrink-0">
              <AlertTriangle className="h-5 w-5 text-yellow-400" aria-hidden="true" />
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Compte non configuré
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  Votre compte n'est pas encore associé à une entreprise. Veuillez contacter votre administrateur pour configurer votre compte.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const getEquipmentStatusColor = (status: string) => {
    switch (status) {
      case 'operational':
        return 'bg-green-100 text-green-800';
      case 'maintenance_needed':
        return 'bg-yellow-100 text-yellow-800';
      case 'out_of_service':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getEquipmentStatusIcon = (status: string) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="h-4 w-4 mr-1" />;
      case 'maintenance_needed':
        return <Clock className="h-4 w-4 mr-1" />;
      case 'out_of_service':
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
      default:
        return <Settings className="h-5 w-5 text-purple-500" />;
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">{t('dashboard.title')}</h1>
      
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <ThermometerSnowflake className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold">Équipements</h3>
              <p className="text-2xl font-bold mt-1">{isLoading ? '...' : stats.equipmentCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <Tool className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold">Interventions</h3>
              <p className="text-2xl font-bold mt-1">{isLoading ? '...' : stats.interventionsCount}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="font-semibold">En attente</h3>
              <p className="text-2xl font-bold mt-1">{isLoading ? '...' : stats.pendingInterventions}</p>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Calendar className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold">Maintenances à venir</h3>
              <p className="text-2xl font-bold mt-1">{isLoading ? '...' : stats.upcomingMaintenances}</p>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Equipment Status */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">État des équipements</h2>
            <Link to="/dashboard/equipment" className="text-sm text-blue-600 hover:text-blue-800">
              Voir tous les équipements
            </Link>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : equipment.length > 0 ? (
              <div className="space-y-4">
                {equipment.slice(0, 4).map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center">
                      {getTypeIcon(item.type)}
                      <div className="ml-3">
                        <p className="text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500">
                          {item.type === 'cold_storage' ? 'Froid commercial' :
                           item.type === 'vmc' ? 'VMC' : 'Autre'}
                        </p>
                      </div>
                    </div>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getEquipmentStatusColor(item.status)}`}>
                      {getEquipmentStatusIcon(item.status)}
                      {item.status === 'operational' ? 'Opérationnel' :
                       item.status === 'maintenance_needed' ? 'Maintenance requise' : 'Hors service'}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucun équipement trouvé
              </div>
            )}
            
            {equipment.length > 4 && (
              <div className="mt-4 text-center">
                <Link 
                  to="/dashboard/equipment"
                  className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-800"
                >
                  Voir {equipment.length - 4} équipements supplémentaires
                  <ArrowRight className="h-4 w-4 ml-1" />
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Interventions */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Interventions à venir</h2>
            <Link to="/dashboard/interventions" className="text-sm text-blue-600 hover:text-blue-800">
              Voir toutes les interventions
            </Link>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : upcomingInterventions.length > 0 ? (
              <div className="space-y-4">
                {upcomingInterventions.map((intervention) => (
                  <div key={intervention.id} className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <div className="flex items-start">
                      <div className="mt-1 mr-3">
                        {getTypeIcon(intervention.equipment?.type || 'other')}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-medium text-gray-900">
                            {intervention.type === 'repair' ? 'Réparation' :
                             intervention.type === 'maintenance' ? 'Maintenance' :
                             intervention.type === 'installation' ? 'Installation' : 'Audit'}
                            {intervention.equipment && ` - ${intervention.equipment.name}`}
                          </h4>
                        </div>
                        <div className="mt-1 flex items-center text-xs text-gray-500">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>
                            {intervention.scheduled_date 
                              ? format(new Date(intervention.scheduled_date), 'EEEE dd MMMM yyyy', { locale: fr })
                              : 'Date non planifiée'}
                          </span>
                        </div>
                        {intervention.technician && (
                          <div className="mt-1 flex items-center text-xs text-gray-500">
                            <User className="h-3 w-3 mr-1" />
                            <span>Technicien: {intervention.technician.name}</span>
                            {intervention.technician.phone && (
                              <a 
                                href={`tel:${intervention.technician.phone}`}
                                className="ml-2 inline-flex items-center text-blue-600"
                              >
                                <Phone className="h-3 w-3 mr-1" />
                                Appeler
                              </a>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucune intervention planifiée
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Reports & Request Service */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Rapports récents</h2>
            <Link to="/dashboard/reports" className="text-sm text-blue-600 hover:text-blue-800">
              Voir tous les rapports
            </Link>
          </div>
          
          <div className="p-6">
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : recentReports.length > 0 ? (
              <div className="space-y-4">
                {recentReports.map((report) => (
                  <div key={report.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-start">
                      <FileText className="h-5 w-5 text-gray-400 mr-3 mt-1" />
                      <div>
                        <div className="flex items-center">
                          <h4 className="text-sm font-medium text-gray-900">
                            {report.type === 'intervention' ? 'Rapport d\'intervention' :
                             report.type === 'haccp' ? 'Rapport HACCP' : 'Rapport de maintenance'}
                          </h4>
                          <span className={`ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            report.status === 'approved' ? 'bg-green-100 text-green-800' :
                            report.status === 'pending_review' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {report.status === 'approved' ? 'Approuvé' :
                             report.status === 'pending_review' ? 'En attente' :
                             report.status === 'rejected' ? 'Rejeté' : 'Brouillon'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {format(new Date(report.created_at), 'dd MMMM yyyy', { locale: fr })}
                        </p>
                        {report.intervention?.equipment && (
                          <p className="text-xs text-gray-600 mt-1">
                            Équipement: {report.intervention.equipment.name}
                          </p>
                        )}
                        <Link 
                          to={`/dashboard/reports/${report.id}`}
                          className="text-xs text-blue-600 hover:text-blue-800 mt-2 inline-flex items-center"
                        >
                          Voir le rapport
                          <ArrowRight className="h-3 w-3 ml-1" />
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                Aucun rapport récent
              </div>
            )}
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Demander un service</h2>
          </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <Link 
                to="/dashboard/interventions/new"
                className="block p-4 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Tool className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-blue-900">Demander une intervention</h3>
                    <p className="text-sm text-blue-700">Réparation, dépannage, urgence</p>
                  </div>
                </div>
              </Link>
              
              <Link 
                to="/dashboard/installations/request"
                className="block p-4 bg-green-50 rounded-lg border border-green-100 hover:bg-green-100 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                    <Settings className="h-5 w-5 text-green-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-green-900">Demander une installation</h3>
                    <p className="text-sm text-green-700">Nouvel équipement, remplacement</p>
                  </div>
                </div>
              </Link>
              
              <Link 
                to="/dashboard/payments"
                className="block p-4 bg-indigo-50 rounded-lg border border-indigo-100 hover:bg-indigo-100 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <CreditCard className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-indigo-900">Gérer mes paiements</h3>
                    <p className="text-sm text-indigo-700">Factures, historique, paiements</p>
                  </div>
                </div>
              </Link>
              
              <Link 
                to="/dashboard/messages"
                className="block p-4 bg-purple-50 rounded-lg border border-purple-100 hover:bg-purple-100 transition-colors"
              >
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div className="ml-3">
                    <h3 className="font-medium text-purple-900">Contacter l'équipe</h3>
                    <p className="text-sm text-purple-700">Questions, devis, assistance</p>
                  </div>
                </div>
              </Link>
            </div>
            
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-gray-900 mb-2">Besoin d'assistance urgente ?</h3>
              <p className="text-sm text-gray-600 mb-3">
                Notre équipe technique est disponible 24h/24 et 7j/7 pour les urgences.
              </p>
              <a 
                href="tel:+33123456789"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                <Phone className="h-4 w-4 mr-2" />
                Appeler le service d'urgence
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const User = (props: any) => (
  <svg
    {...props}
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);

export default ClientDashboard;
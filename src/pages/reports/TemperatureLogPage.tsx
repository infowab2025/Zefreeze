import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Thermometer, 
  Calendar, Clock, Download, Plus,
  Filter, Search, ThermometerSnowflake,
  CheckCircle, AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'react-hot-toast';
import { useReports } from '../../hooks/useReports';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';

interface TemperatureLog {
  id: string;
  equipmentId: string;
  equipmentName: string;
  date: string;
  time: string;
  temperature: number;
  minThreshold: number;
  maxThreshold: number;
  isCompliant: boolean;
  notes?: string;
  technicianId: string;
  technicianName: string;
}

const TemperatureLogPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { getTemperatureLogs, addTemperatureLog } = useReports();
  const { data: logs, isLoading } = getTemperatureLogs;
  
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCompliance, setFilterCompliance] = useState('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [equipment, setEquipment] = useState<any[]>([]);
  const [newLog, setNewLog] = useState({
    equipmentId: '',
    temperature: 0,
    notes: ''
  });

  useEffect(() => {
    const fetchEquipment = async () => {
      try {
        const { data } = await supabase
          .from('equipment')
          .select('*');
        
        if (data) {
          setEquipment(data);
        }
      } catch (error) {
        console.error('Error fetching equipment:', error);
        toast.error('Erreur lors du chargement des équipements');
      }
    };

    fetchEquipment();
  }, []);

  const handleAddLog = async () => {
    if (!newLog.equipmentId) {
      toast.error('Veuillez sélectionner un équipement');
      return;
    }

    try {
      await addTemperatureLog.mutateAsync({
        equipmentId: newLog.equipmentId,
        temperature: newLog.temperature,
        notes: newLog.notes || undefined
      });

      setNewLog({
        equipmentId: '',
        temperature: 0,
        notes: ''
      });
      setShowAddForm(false);
      toast.success('Relevé de température ajouté avec succès');
    } catch (error) {
      console.error('Error adding temperature log:', error);
      toast.error('Erreur lors de l\'ajout du relevé de température');
    }
  };

  const filteredLogs = logs?.filter(log => {
    const matchesSearch = 
      log.equipmentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.technicianName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.notes && log.notes.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCompliance = 
      filterCompliance === 'all' || 
      (filterCompliance === 'compliant' && log.isCompliant) || 
      (filterCompliance === 'non-compliant' && !log.isCompliant);
    
    return matchesSearch && matchesCompliance;
  });

  const downloadLogs = () => {
    // In a real app, this would generate a CSV file
    const headers = ['Équipement', 'Date', 'Heure', 'Température (°C)', 'Conforme', 'Notes', 'Technicien'];
    const csvContent = [
      headers.join(','),
      ...filteredLogs!.map(log => [
        log.equipmentName,
        log.date,
        log.time,
        log.temperature,
        log.isCompliant ? 'Oui' : 'Non',
        log.notes || '',
        log.technicianName
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `temperature_logs_${format(new Date(), 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate(-1)}
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="text-2xl font-bold text-gray-900">Relevés de température</h1>
        </div>
      </div>

      {/* Add Form */}
      {showAddForm ? (
        <div className="bg-white rounded-lg shadow mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Nouveau relevé de température</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Équipement</label>
                <select
                  value={newLog.equipmentId}
                  onChange={(e) => setNewLog({...newLog, equipmentId: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                >
                  <option value="">Sélectionnez un équipement</option>
                  {equipment.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} - {item.type === 'cold_storage' ? 'Froid' : item.type === 'vmc' ? 'VMC' : 'Autre'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  <Thermometer className="inline-block h-4 w-4 mr-1" />
                  Température (°C)
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <input
                    type="number"
                    step="0.1"
                    value={newLog.temperature}
                    onChange={(e) => setNewLog({...newLog, temperature: parseFloat(e.target.value)})}
                    className="block w-full rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 sm:text-sm">°C</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Notes (optionnel)</label>
                <input
                  type="text"
                  value={newLog.notes}
                  onChange={(e) => setNewLog({...newLog, notes: e.target.value})}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Observations, anomalies..."
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleAddLog}
                disabled={!newLog.equipmentId || addTemperatureLog.isPending}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {addTemperatureLog.isPending ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6">
          <button
            onClick={() => setShowAddForm(true)}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau relevé
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-4 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex flex-wrap gap-2">
            <div className="relative">
              <select
                value={filterCompliance}
                onChange={(e) => setFilterCompliance(e.target.value)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <option value="all">Tous les relevés</option>
                <option value="compliant">Conformes</option>
                <option value="non-compliant">Non conformes</option>
              </select>
              <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <button 
              onClick={downloadLogs}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter CSV
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

      {/* Temperature Logs Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Équipement
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Heure
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Température
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Seuils
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Conformité
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Technicien
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Notes
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLogs?.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <ThermometerSnowflake className="h-5 w-5 text-blue-500 mr-2" />
                        <span className="text-sm font-medium text-gray-900">{log.equipmentName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="h-4 w-4 text-gray-400 mr-1" />
                          {format(new Date(log.date), 'dd/MM/yyyy')}
                        </div>
                        <div className="flex items-center text-sm text-gray-500">
                          <Clock className="h-4 w-4 text-gray-400 mr-1" />
                          {log.time}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Thermometer className="h-5 w-5 text-gray-400 mr-1" />
                        <span className={`text-sm font-medium ${
                          log.isCompliant ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {log.temperature} °C
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.minThreshold} °C à {log.maxThreshold} °C
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {log.isCompliant ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <CheckCircle className="h-4 w-4 mr-1" />
                          Conforme
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <AlertTriangle className="h-4 w-4 mr-1" />
                          Non conforme
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {log.technicianName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {log.notes || '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default TemperatureLogPage;
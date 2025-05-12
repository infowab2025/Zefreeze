import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useEquipment } from '../../hooks/useEquipment';
import { 
  ThermometerSnowflake, Fan, Settings, 
  AlertTriangle, CheckCircle, Clock,
  Plus, Filter, Download
} from 'lucide-react';
import { format } from 'date-fns';
import CsvImportButton from '../../components/common/CsvImportButton';
import CsvImportModal from '../../components/common/CsvImportModal';
import CsvImportGuide from '../../components/crm/CsvImportGuide';
import { useCsvImport } from '../../hooks/useCsvImport';

const EquipmentListPage = () => {
  const { equipment } = useEquipment();
  const [showImportGuide, setShowImportGuide] = useState(false);

  const statusColors = {
    operational: { bg: 'bg-green-100', text: 'text-green-800', icon: <CheckCircle size={16} /> },
    maintenance_needed: { bg: 'bg-yellow-100', text: 'text-yellow-800', icon: <Clock size={16} /> },
    out_of_service: { bg: 'bg-red-100', text: 'text-red-800', icon: <AlertTriangle size={16} /> },
  };

  const typeIcons = {
    cold_storage: <ThermometerSnowflake className="h-5 w-5 text-blue-500" />,
    vmc: <Fan className="h-5 w-5 text-green-500" />,
    other: <Settings className="h-5 w-5 text-purple-500" />,
  };

  const { handleImport, isImporting } = useCsvImport({
    requiredHeaders: ['name', 'type', 'brand', 'model', 'serial_number', 'installation_date', 'company_name'],
    async onImport(data) {
      for (const equipment of data) {
        // Get company ID from name
        const { data: company } = await supabase
          .from('companies')
          .select('id')
          .eq('name', equipment.company_name)
          .single();

        if (company) {
          // Remove company_name and add company_id
          const { company_name, ...equipmentData } = equipment;
          await supabase.from('equipment').insert([{
            ...equipmentData,
            company_id: company.id,
            specifications: {
              temperature: { min: 2, max: 8 },
              power: 0,
              dimensions: { width: 0, height: 0, depth: 0 }
            }
          }]);
        }
      }
    }
  });

  if (equipment.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Équipements</h1>
        <p className="text-gray-600">Gérez vos équipements et leur maintenance</p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <div className="flex justify-between items-center">
            <div className="flex flex-wrap gap-2">
              <Link
                to="/dashboard/equipment/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvel équipement
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
            </div>
            <div className="text-sm text-gray-600">
              Total: {equipment.data?.length || 0} équipements
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Équipement
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Localisation
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière maintenance
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Prochaine maintenance
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
              {equipment.data?.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {typeIcons[item.type]}
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{item.name}</div>
                        <div className="text-sm text-gray-500">
                          {item.brand} - {item.model}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{item.location.name}</div>
                    <div className="text-sm text-gray-500">{item.location.address}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(item.lastMaintenanceDate), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(new Date(item.nextMaintenanceDate), 'dd/MM/yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      statusColors[item.status].bg
                    } ${statusColors[item.status].text}`}>
                      {statusColors[item.status].icon}
                      <span className="ml-1.5">
                        {item.status === 'operational' ? 'Opérationnel' :
                         item.status === 'maintenance_needed' ? 'Maintenance requise' : 'Hors service'}
                      </span>
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link
                      to={`/dashboard/equipment/${item.id}`}
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
      </div>

      <CsvImportModal
        isOpen={showImportGuide}
        onClose={() => setShowImportGuide(false)}
        title="Guide d'importation CSV"
      >
        <CsvImportGuide type="equipment" />
      </CsvImportModal>
    </div>
  );
};

export default EquipmentListPage;
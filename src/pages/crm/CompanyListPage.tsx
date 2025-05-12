import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Building, Phone, Mail, MapPin, 
  Plus, Filter, Download, Search,
  Users, Settings, Calendar
} from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '../../lib/supabase';
import { useQuery } from '@tanstack/react-query';
import CsvImportButton from '../../components/common/CsvImportButton';
import CsvImportModal from '../../components/common/CsvImportModal';
import CsvImportGuide from '../../components/crm/CsvImportGuide';
import { useCsvImport } from '../../hooks/useCsvImport';
import { toast } from 'react-hot-toast';

interface Company {
  id: string;
  name: string;
  address: string;
  phone: string | null;
  email: string | null;
  created_at: string;
  updated_at: string;
  equipmentCount?: number;
  userCount?: number;
  lastIntervention?: string;
}

const CompanyListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showImportGuide, setShowImportGuide] = useState(false);

  const { data: companies, isLoading, refetch } = useQuery({
    queryKey: ['companies'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .order('name');
        
        if (error) throw error;
        return data as Company[];
      } catch (error) {
        console.error('Error fetching companies:', error);
        toast.error('Erreur lors du chargement des entreprises');
        return [];
      }
    },
  });

  const { handleImport, isImporting } = useCsvImport({
    requiredHeaders: ['name', 'address', 'phone', 'email'],
    async onImport(data) {
      try {
        const { error } = await supabase
          .from('companies')
          .insert(data);
        
        if (error) throw error;
        
        refetch();
        toast.success(`${data.length} entreprise(s) importée(s) avec succès`);
      } catch (error: any) {
        console.error('Error importing companies:', error);
        toast.error(`Erreur lors de l'importation: ${error.message}`);
      }
    }
  });

  const filteredCompanies = companies?.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (company.email?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
                         company.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    // Add more filter conditions as needed
    return matchesSearch;
  });

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
        <h1 className="text-2xl font-bold text-gray-900">Entreprises</h1>
        <p className="text-gray-600">Gérez vos relations clients et leurs installations</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-4 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <Link
                to="/dashboard/companies/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle entreprise
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

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 p-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <Building className="h-6 w-6 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total entreprises</p>
                <p className="text-xl font-semibold text-gray-900">{companies?.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <Settings className="h-6 w-6 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Équipements actifs</p>
                <p className="text-xl font-semibold text-gray-900">142</p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <Users className="h-6 w-6 text-purple-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Utilisateurs</p>
                <p className="text-xl font-semibold text-gray-900">89</p>
              </div>
            </div>
          </div>
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-orange-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Interventions (mois)</p>
                <p className="text-xl font-semibold text-gray-900">24</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Companies List */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Entreprise
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Équipements
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Dernière intervention
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredCompanies?.map((company) => (
                <tr key={company.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <Building className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{company.name}</div>
                        <div className="flex items-center text-sm text-gray-500">
                          <MapPin className="h-4 w-4 mr-1" />
                          {company.address}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {company.email && (
                        <div className="flex items-center mb-1">
                          <Mail className="h-4 w-4 text-gray-400 mr-1" />
                          {company.email}
                        </div>
                      )}
                      {company.phone && (
                        <div className="flex items-center">
                          <Phone className="h-4 w-4 text-gray-400 mr-1" />
                          {company.phone}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Settings className="h-4 w-4 text-gray-400 mr-1" />
                      <span className="text-sm text-gray-900">{company.equipmentCount || 0}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {company.lastIntervention ? 
                      format(new Date(company.lastIntervention), 'dd/MM/yyyy') : 
                      'Aucune intervention'
                    }
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <Link
                      to={`/dashboard/companies/${company.id}`}
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

        {/* Pagination */}
        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Affichage de <span className="font-medium">1</span> à{' '}
              <span className="font-medium">{filteredCompanies?.length || 0}</span> sur{' '}
              <span className="font-medium">{companies?.length || 0}</span> entreprises
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

      {/* Add import guide modal */}
      <CsvImportModal
        isOpen={showImportGuide}
        onClose={() => setShowImportGuide(false)}
        title="Guide d'importation CSV"
      >
        <CsvImportGuide type="companies" />
      </CsvImportModal>
    </div>
  );
};

export default CompanyListPage;
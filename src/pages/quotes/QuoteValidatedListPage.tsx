import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Filter, Search, Download, FileText, Building, Calendar, CheckCircle, PenTool as Tool } from 'lucide-react';
import { useQuotes } from '../../hooks/useQuotes';
import QuoteCard from '../../components/quotes/QuoteCard';

const QuoteValidatedListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { validatedQuotes, createInstallation } = useQuotes();
  const [creatingInstallationId, setCreatingInstallationId] = useState<string | null>(null);

  const handleCreateInstallation = async (id: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir créer une installation à partir de ce devis ?')) {
      setCreatingInstallationId(id);
      try {
        await createInstallation.mutateAsync(id);
      } finally {
        setCreatingInstallationId(null);
      }
    }
  };

  const filteredQuotes = validatedQuotes.data?.filter(quote => {
    const matchesSearch = 
      quote.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.contactName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quote.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === 'all' || quote.type === filterType;
    const matchesStatus = filterStatus === 'all' || quote.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Devis - Validés</h1>
        <p className="text-gray-600">Suivez l'état des devis envoyés et validés</p>
      </div>

      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <Link
                to="/dashboard/quotes/create"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau devis
              </Link>
              <div className="relative">
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <option value="all">Tous les types</option>
                  <option value="cold_storage">Froid commercial</option>
                  <option value="vmc">VMC</option>
                  <option value="other">Autre</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="sent">Envoyés</option>
                  <option value="accepted">Acceptés</option>
                  <option value="paid">Payés</option>
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

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Total devis</p>
                <p className="text-xl font-semibold text-gray-900">{validatedQuotes.data?.length || 0}</p>
              </div>
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="flex items-center">
              <CheckCircle className="h-6 w-6 text-green-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Devis payés</p>
                <p className="text-xl font-semibold text-gray-900">
                  {validatedQuotes.data?.filter(q => q.status === 'paid').length || 0}
                </p>
              </div>
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4">
            <div className="flex items-center">
              <Calendar className="h-6 w-6 text-purple-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-gray-600">Ce mois-ci</p>
                <p className="text-xl font-semibold text-gray-900">
                  {validatedQuotes.data?.filter(r => {
                    const date = new Date(r.createdAt);
                    const now = new Date();
                    return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
                  }).length || 0}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {validatedQuotes.isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      ) : filteredQuotes && filteredQuotes.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredQuotes.map((quote) => (
            <div key={quote.id} className="relative">
              <QuoteCard quote={quote} />
              {quote.status === 'paid' && (
                <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white to-transparent">
                  <button
                    onClick={() => handleCreateInstallation(quote.id)}
                    disabled={creatingInstallationId === quote.id}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
                  >
                    <Tool className="h-4 w-4 mr-2" />
                    {creatingInstallationId === quote.id ? 'Création en cours...' : 'Créer une installation'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun devis validé</h3>
          <p className="text-gray-500 mb-6">
            Il n'y a actuellement aucun devis validé ou envoyé.
          </p>
          <Link
            to="/dashboard/quotes/prepared"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Voir les devis préparés
          </Link>
        </div>
      )}
    </div>
  );
};

export default QuoteValidatedListPage;
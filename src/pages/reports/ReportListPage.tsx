import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  FileText, Download, Filter, Search,
  CheckCircle, XCircle, Clock, Plus,
  ThermometerSnowflake, Fan, ClipboardCheck,
  ArrowRight
} from 'lucide-react';
import { useReports } from '../../hooks/useReports';

const ReportListPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const { reports, downloadReportPdf } = useReports();

  const filteredReports = reports.data?.filter(report => {
    const matchesSearch = 
      (report.technician.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (report.client.name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (report.notes?.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    const matchesType = filterType === 'all' || report.type === filterType;
    const matchesStatus = filterStatus === 'all' || report.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleDownload = (id: string) => {
    downloadReportPdf.mutate(id);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'intervention':
        return <FileText className="h-5 w-5 text-blue-500" />;
      case 'haccp':
        return <ClipboardCheck className="h-5 w-5 text-purple-500" />;
      case 'maintenance':
        return <ThermometerSnowflake className="h-5 w-5 text-green-500" />;
      default:
        return <FileText className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-1" />
            Approuvé
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="h-4 w-4 mr-1" />
            Rejeté
          </span>
        );
      case 'pending_review':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-4 w-4 mr-1" />
            En attente
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <FileText className="h-4 w-4 mr-1" />
            Brouillon
          </span>
        );
    }
  };

  if (reports.isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Rapports</h1>
        <p className="text-gray-600">Gérez les rapports d'intervention et de conformité</p>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <div className="dropdown">
                <Link
                  to="/dashboard/reports/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouveau rapport
                </Link>
              </div>
              <div className="dropdown">
                <Link
                  to="/dashboard/reports/haccp"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700"
                >
                  <ClipboardCheck className="h-4 w-4 mr-2" />
                  Rapport HACCP
                </Link>
              </div>
              <div className="dropdown">
                <Link
                  to="/dashboard/reports/temperature"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                >
                  <ThermometerSnowflake className="h-4 w-4 mr-2" />
                  Relevé température
                </Link>
              </div>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="all">Tous les types</option>
                <option value="intervention">Intervention</option>
                <option value="haccp">HACCP</option>
                <option value="maintenance">Maintenance</option>
              </select>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
              >
                <option value="all">Tous les statuts</option>
                <option value="draft">Brouillon</option>
                <option value="pending_review">En attente</option>
                <option value="approved">Approuvé</option>
                <option value="rejected">Rejeté</option>
              </select>
              <div className="relative w-full sm:w-64">
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

        {/* Reports Grid View */}
        <div className="p-6">
          {filteredReports && filteredReports.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredReports.map((report) => (
                <div key={report.id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center">
                        {getTypeIcon(report.type)}
                        <span className="ml-2 font-medium text-gray-900">
                          {report.type === 'intervention' ? 'Intervention' :
                           report.type === 'haccp' ? 'HACCP' : 'Maintenance'}
                        </span>
                      </div>
                      {getStatusBadge(report.status || 'draft')}
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Client: {report.client.name}</p>
                      <p className="text-sm text-gray-500">Technicien: {report.technician.name}</p>
                      <p className="text-sm text-gray-500">
                        Date: {format(new Date(report.createdAt), 'dd/MM/yyyy')}
                      </p>
                    </div>
                    
                    <p className="text-sm text-gray-700 line-clamp-2 mb-4">{report.notes}</p>
                    
                    {report.photos && report.photos.length > 0 && (
                      <div className="flex -space-x-2 overflow-hidden mb-4">
                        {report.photos.slice(0, 3).map((photo, index) => (
                          <img 
                            key={index}
                            src={photo} 
                            alt={`Photo ${index + 1}`}
                            className="inline-block h-10 w-10 rounded-full ring-2 ring-white object-cover"
                          />
                        ))}
                        {report.photos.length > 3 && (
                          <div className="flex items-center justify-center h-10 w-10 rounded-full bg-gray-200 ring-2 ring-white text-xs font-medium text-gray-500">
                            +{report.photos.length - 3}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <Link
                        to={`/dashboard/reports/${report.id}`}
                        className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center"
                      >
                        Voir détails
                        <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                      <button
                        onClick={() => handleDownload(report.id)}
                        className="text-gray-600 hover:text-gray-800"
                        title="Télécharger PDF"
                      >
                        <Download className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun rapport trouvé</h3>
              <p className="text-gray-500 mb-6">
                {searchTerm || filterType !== 'all' || filterStatus !== 'all' 
                  ? 'Aucun rapport ne correspond à vos critères de recherche.' 
                  : 'Commencez par créer un nouveau rapport.'}
              </p>
              <Link
                to="/dashboard/reports/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau rapport
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportListPage;
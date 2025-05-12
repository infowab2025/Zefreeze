import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  FileText, Download, CreditCard, CheckCircle, AlertTriangle, 
  Search, Filter, Plus, ArrowRight, Receipt, Euro
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface Invoice {
  id: string;
  number: string;
  amount: number;
  currency: string;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  customer: {
    id: string;
    name: string;
    email: string;
  };
  intervention?: {
    id: string;
    reference: string;
    type: string;
  };
  created_at: string;
  due_date: string;
  paid_at?: string;
  pdf_url?: string;
}

const InvoicesPage = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    paid: 0,
    pending: 0,
    overdue: 0,
    totalAmount: 0,
    paidAmount: 0,
    pendingAmount: 0
  });

  useEffect(() => {
    const fetchInvoices = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch from the database
        // For now, we'll use mock data
        const mockInvoices: Invoice[] = [
          {
            id: '1',
            number: 'INV-2025-001',
            amount: 45000, // 450.00 €
            currency: 'EUR',
            status: 'paid',
            customer: {
              id: '1',
              name: 'Restaurant Le Provençal',
              email: 'contact@leprovencal.fr'
            },
            intervention: {
              id: '1',
              reference: 'INT-2025-001',
              type: 'maintenance'
            },
            created_at: '2025-04-01T10:00:00Z',
            due_date: '2025-04-15T10:00:00Z',
            paid_at: '2025-04-10T14:30:00Z',
            pdf_url: '#'
          },
          {
            id: '2',
            number: 'INV-2025-002',
            amount: 85000, // 850.00 €
            currency: 'EUR',
            status: 'pending',
            customer: {
              id: '2',
              name: 'Supermarché FraisMart',
              email: 'contact@fraismart.fr'
            },
            intervention: {
              id: '2',
              reference: 'INT-2025-002',
              type: 'repair'
            },
            created_at: '2025-04-05T11:30:00Z',
            due_date: '2025-04-20T11:30:00Z'
          },
          {
            id: '3',
            number: 'INV-2025-003',
            amount: 120000, // 1,200.00 €
            currency: 'EUR',
            status: 'overdue',
            customer: {
              id: '3',
              name: 'Hôtel Le Méridien',
              email: 'contact@lemeridien.fr'
            },
            intervention: {
              id: '3',
              reference: 'INT-2025-003',
              type: 'installation'
            },
            created_at: '2025-03-15T09:45:00Z',
            due_date: '2025-03-30T09:45:00Z'
          },
          {
            id: '4',
            number: 'INV-2025-004',
            amount: 35000, // 350.00 €
            currency: 'EUR',
            status: 'draft',
            customer: {
              id: '1',
              name: 'Restaurant Le Provençal',
              email: 'contact@leprovencal.fr'
            },
            intervention: {
              id: '4',
              reference: 'INT-2025-004',
              type: 'audit'
            },
            created_at: '2025-04-10T15:20:00Z',
            due_date: '2025-04-25T15:20:00Z'
          },
          {
            id: '5',
            number: 'INV-2025-005',
            amount: 75000, // 750.00 €
            currency: 'EUR',
            status: 'paid',
            customer: {
              id: '2',
              name: 'Supermarché FraisMart',
              email: 'contact@fraismart.fr'
            },
            intervention: {
              id: '5',
              reference: 'INT-2025-005',
              type: 'maintenance'
            },
            created_at: '2025-03-20T13:15:00Z',
            due_date: '2025-04-05T13:15:00Z',
            paid_at: '2025-04-02T10:45:00Z',
            pdf_url: '#'
          }
        ];

        setInvoices(mockInvoices);

        // Calculate statistics
        const total = mockInvoices.length;
        const paid = mockInvoices.filter(inv => inv.status === 'paid').length;
        const pending = mockInvoices.filter(inv => inv.status === 'pending').length;
        const overdue = mockInvoices.filter(inv => inv.status === 'overdue').length;
        
        const totalAmount = mockInvoices.reduce((sum, inv) => sum + inv.amount, 0);
        const paidAmount = mockInvoices
          .filter(inv => inv.status === 'paid')
          .reduce((sum, inv) => sum + inv.amount, 0);
        const pendingAmount = mockInvoices
          .filter(inv => ['pending', 'overdue'].includes(inv.status))
          .reduce((sum, inv) => sum + inv.amount, 0);

        setStats({
          total,
          paid,
          pending,
          overdue,
          totalAmount,
          paidAmount,
          pendingAmount
        });
      } catch (error) {
        console.error('Error fetching invoices:', error);
        toast.error('Erreur lors du chargement des factures');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, []);

  const filteredInvoices = invoices.filter(invoice => {
    // Filter by search term
    const matchesSearch = 
      invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (invoice.intervention?.reference.toLowerCase().includes(searchTerm.toLowerCase()) || false);
    
    // Filter by status
    const matchesStatus = filterStatus === 'all' || invoice.status === filterStatus;
    
    // Filter by date range
    let matchesDateRange = true;
    const invoiceDate = new Date(invoice.created_at);
    const now = new Date();
    
    if (dateRange === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchesDateRange = invoiceDate >= monthAgo;
    } else if (dateRange === 'quarter') {
      const quarterAgo = new Date();
      quarterAgo.setMonth(quarterAgo.getMonth() - 3);
      matchesDateRange = invoiceDate >= quarterAgo;
    } else if (dateRange === 'year') {
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      matchesDateRange = invoiceDate >= yearAgo;
    }
    
    return matchesSearch && matchesStatus && matchesDateRange;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'paid':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-1" />
            Payée
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-4 w-4 mr-1" />
            En attente
          </span>
        );
      case 'overdue':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="h-4 w-4 mr-1" />
            En retard
          </span>
        );
      case 'draft':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            <FileText className="h-4 w-4 mr-1" />
            Brouillon
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount / 100);
  };

  const Clock = (props: any) => (
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
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Factures</h1>
        <p className="text-gray-600">Gérez vos factures et suivez les paiements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Total facturé</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalAmount)}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <Euro className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {stats.total} factures au total
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Montant payé</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.paidAmount)}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {stats.paid} factures payées
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pendingAmount)}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {stats.pending} factures en attente
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">En retard</p>
              <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {stats.overdue} factures en retard
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-2">
              {user?.role === 'admin' && (
                <Link
                  to="/dashboard/invoices/new"
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Nouvelle facture
                </Link>
              )}
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="draft">Brouillons</option>
                  <option value="pending">En attente</option>
                  <option value="paid">Payées</option>
                  <option value="overdue">En retard</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <option value="all">Toutes les dates</option>
                  <option value="month">Dernier mois</option>
                  <option value="quarter">Dernier trimestre</option>
                  <option value="year">Dernière année</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </button>
            </div>
            <div className="w-full md:w-64">
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
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Numéro
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Échéance
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
                {filteredInvoices.length > 0 ? (
                  filteredInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Receipt className="h-5 w-5 text-gray-400 mr-2" />
                          <span className="text-sm font-medium text-gray-900">
                            {invoice.number}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{invoice.customer.name}</div>
                        <div className="text-sm text-gray-500">{invoice.customer.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {formatCurrency(invoice.amount)}
                        </div>
                        {invoice.intervention && (
                          <div className="text-xs text-gray-500">
                            Réf: {invoice.intervention.reference}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(invoice.created_at), 'dd/MM/yyyy', { locale: fr })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(invoice.due_date), 'dd/MM/yyyy', { locale: fr })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(invoice.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          {invoice.status === 'pending' || invoice.status === 'overdue' ? (
                            <Link
                              to={`/dashboard/payments/${invoice.id}`}
                              className="text-blue-600 hover:text-blue-900"
                              title="Payer"
                            >
                              <CreditCard className="h-5 w-5" />
                            </Link>
                          ) : null}
                          {invoice.pdf_url && (
                            <a
                              href={invoice.pdf_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-gray-600 hover:text-gray-900"
                              title="Télécharger"
                            >
                              <Download className="h-5 w-5" />
                            </a>
                          )}
                          {user?.role === 'admin' && (
                            <Link
                              to={`/dashboard/invoices/${invoice.id}/edit`}
                              className="text-gray-600 hover:text-gray-900"
                              title="Modifier"
                            >
                              <Edit className="h-5 w-5" />
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Aucune facture trouvée
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>

        <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-700">
              Affichage de <span className="font-medium">1</span> à{' '}
              <span className="font-medium">{filteredInvoices.length}</span> sur{' '}
              <span className="font-medium">{invoices.length}</span> factures
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

const Edit = (props: any) => (
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
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

export default InvoicesPage;
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  CreditCard, Download, Filter, Search,
  CheckCircle, AlertTriangle, Clock, Plus,
  Receipt, Building, Calendar, Euro, Landmark,
  ArrowRight, BarChart3
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import InvoiceStatusBadge from '../../components/payments/InvoiceStatusBadge';

interface Payment {
  id: string;
  invoice_id: string;
  invoice_number: string;
  amount: number;
  method: 'card' | 'transfer' | 'cash';
  status: 'completed' | 'pending' | 'failed';
  transaction_id?: string;
  created_at: string;
  customer: {
    id: string;
    name: string;
  };
}

const PaymentListPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [dateRange, setDateRange] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    pending: 0,
    failed: 0,
    totalAmount: 0,
    cardAmount: 0,
    transferAmount: 0,
    cashAmount: 0
  });

  useEffect(() => {
    const fetchPayments = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch from the database
        // For now, we'll use mock data
        const mockPayments: Payment[] = [
          {
            id: '1',
            invoice_id: '1',
            invoice_number: 'INV-2025-001',
            amount: 45000, // 450.00 €
            method: 'card',
            status: 'completed',
            transaction_id: 'ch_1234567890',
            created_at: '2025-04-10T14:30:00Z',
            customer: {
              id: '1',
              name: 'Restaurant Le Provençal'
            }
          },
          {
            id: '2',
            invoice_id: '5',
            invoice_number: 'INV-2025-005',
            amount: 75000, // 750.00 €
            method: 'transfer',
            status: 'completed',
            transaction_id: 'tr_0987654321',
            created_at: '2025-04-02T10:45:00Z',
            customer: {
              id: '2',
              name: 'Supermarché FraisMart'
            }
          },
          {
            id: '3',
            invoice_id: '6',
            invoice_number: 'INV-2025-006',
            amount: 25000, // 250.00 €
            method: 'cash',
            status: 'completed',
            created_at: '2025-03-15T16:20:00Z',
            customer: {
              id: '1',
              name: 'Restaurant Le Provençal'
            }
          },
          {
            id: '4',
            invoice_id: '2',
            invoice_number: 'INV-2025-002',
            amount: 85000, // 850.00 €
            method: 'card',
            status: 'pending',
            transaction_id: 'ch_pending123',
            created_at: '2025-04-15T09:20:00Z',
            customer: {
              id: '2',
              name: 'Supermarché FraisMart'
            }
          },
          {
            id: '5',
            invoice_id: '7',
            invoice_number: 'INV-2025-007',
            amount: 15000, // 150.00 €
            method: 'card',
            status: 'failed',
            transaction_id: 'ch_failed456',
            created_at: '2025-04-12T11:15:00Z',
            customer: {
              id: '3',
              name: 'Hôtel Le Méridien'
            }
          }
        ];

        setPayments(mockPayments);

        // Calculate statistics
        const total = mockPayments.length;
        const completed = mockPayments.filter(p => p.status === 'completed').length;
        const pending = mockPayments.filter(p => p.status === 'pending').length;
        const failed = mockPayments.filter(p => p.status === 'failed').length;
        
        const totalAmount = mockPayments
          .filter(p => p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0);
        
        const cardAmount = mockPayments
          .filter(p => p.status === 'completed' && p.method === 'card')
          .reduce((sum, p) => sum + p.amount, 0);
        
        const transferAmount = mockPayments
          .filter(p => p.status === 'completed' && p.method === 'transfer')
          .reduce((sum, p) => sum + p.amount, 0);
        
        const cashAmount = mockPayments
          .filter(p => p.status === 'completed' && p.method === 'cash')
          .reduce((sum, p) => sum + p.amount, 0);

        setStats({
          total,
          completed,
          pending,
          failed,
          totalAmount,
          cardAmount,
          transferAmount,
          cashAmount
        });
      } catch (error) {
        console.error('Error fetching payments:', error);
        toast.error('Erreur lors du chargement des paiements');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  const filteredPayments = payments.filter(payment => {
    // Filter by search term
    const matchesSearch = 
      payment.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.transaction_id && payment.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Filter by status
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    
    // Filter by payment method
    const matchesMethod = filterMethod === 'all' || payment.method === filterMethod;
    
    // Filter by date range
    let matchesDateRange = true;
    const paymentDate = new Date(payment.created_at);
    const now = new Date();
    
    if (dateRange === 'month') {
      const monthAgo = new Date();
      monthAgo.setMonth(monthAgo.getMonth() - 1);
      matchesDateRange = paymentDate >= monthAgo;
    } else if (dateRange === 'quarter') {
      const quarterAgo = new Date();
      quarterAgo.setMonth(quarterAgo.getMonth() - 3);
      matchesDateRange = paymentDate >= quarterAgo;
    } else if (dateRange === 'year') {
      const yearAgo = new Date();
      yearAgo.setFullYear(yearAgo.getFullYear() - 1);
      matchesDateRange = paymentDate >= yearAgo;
    }
    
    return matchesSearch && matchesStatus && matchesMethod && matchesDateRange;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount / 100);
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'card':
        return <CreditCard className="h-5 w-5 text-blue-500" />;
      case 'transfer':
        return <Landmark className="h-5 w-5 text-green-500" />;
      case 'cash':
        return <Euro className="h-5 w-5 text-yellow-500" />;
      default:
        return <CreditCard className="h-5 w-5 text-gray-500" />;
    }
  };

  const getMethodName = (method: string) => {
    switch (method) {
      case 'card':
        return 'Carte bancaire';
      case 'transfer':
        return 'Virement bancaire';
      case 'cash':
        return 'Espèces/Chèque';
      default:
        return method;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="h-4 w-4 mr-1" />
            Complété
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="h-4 w-4 mr-1" />
            En attente
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <AlertTriangle className="h-4 w-4 mr-1" />
            Échoué
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

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Paiements</h1>
        <p className="text-gray-600">Gérez et suivez tous les paiements clients</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Total encaissé</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalAmount)}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {stats.completed} paiements réussis
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Carte bancaire</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.cardAmount)}</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {Math.round((stats.cardAmount / stats.totalAmount) * 100)}% des paiements
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Virement</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.transferAmount)}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <Landmark className="h-6 w-6 text-green-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {Math.round((stats.transferAmount / stats.totalAmount) * 100)}% des paiements
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Espèces/Chèque</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.cashAmount)}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Euro className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {Math.round((stats.cashAmount / stats.totalAmount) * 100)}% des paiements
          </div>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-wrap gap-2">
              <Link
                to="/dashboard/invoices/new"
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle facture
              </Link>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <option value="all">Tous les statuts</option>
                  <option value="completed">Complétés</option>
                  <option value="pending">En attente</option>
                  <option value="failed">Échoués</option>
                </select>
                <Filter className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
              <div className="relative">
                <select
                  value={filterMethod}
                  onChange={(e) => setFilterMethod(e.target.value)}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <option value="all">Toutes les méthodes</option>
                  <option value="card">Carte bancaire</option>
                  <option value="transfer">Virement</option>
                  <option value="cash">Espèces/Chèque</option>
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
                    Date
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Facture
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Client
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Méthode
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
                {filteredPayments.length > 0 ? (
                  filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(payment.created_at), 'dd/MM/yyyy HH:mm', { locale: fr })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/dashboard/invoices/${payment.invoice_id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          {payment.invoice_number}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/dashboard/invoices/client/${payment.customer.id}`}
                          className="text-sm text-gray-900 hover:text-blue-600"
                        >
                          {payment.customer.name}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(payment.amount)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {getMethodIcon(payment.method)}
                          <span className="ml-2 text-sm text-gray-900">{getMethodName(payment.method)}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(payment.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-2">
                          <Link
                            to={`/dashboard/payments/${payment.id}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Voir détails"
                          >
                            <Eye className="h-5 w-5" />
                          </Link>
                          <Link
                            to={`/dashboard/invoices/${payment.invoice_id}`}
                            className="text-gray-600 hover:text-gray-900"
                            title="Voir facture"
                          >
                            <Receipt className="h-5 w-5" />
                          </Link>
                          <button
                            className="text-gray-600 hover:text-gray-900"
                            title="Télécharger reçu"
                          >
                            <Download className="h-5 w-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-4 text-center text-gray-500">
                      Aucun paiement trouvé
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
              <span className="font-medium">{filteredPayments.length}</span> sur{' '}
              <span className="font-medium">{payments.length}</span> paiements
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

const Eye = (props: any) => (
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
    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const Landmark = (props: any) => (
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
    <line x1="3" x2="21" y1="22" y2="22" />
    <line x1="6" x2="6" y1="18" y2="11" />
    <line x1="10" x2="10" y1="18" y2="11" />
    <line x1="14" x2="14" y1="18" y2="11" />
    <line x1="18" x2="18" y1="18" y2="11" />
    <polygon points="12 2 20 7 4 7" />
  </svg>
);

const Receipt = (props: any) => (
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
    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
    <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8" />
    <path d="M12 17.5v-11" />
  </svg>
);

export default PaymentListPage;
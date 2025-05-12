import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  CreditCard, Download, Filter, Search,
  CheckCircle, AlertTriangle, Clock, Plus,
  Receipt, Building, Calendar, Euro, Landmark,
  ArrowRight, BarChart3, PieChart, TrendingUp
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import PaymentSummaryCard from '../../components/common/PaymentSummaryCard';
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

interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  customer: {
    id: string;
    name: string;
  };
  created_at: string;
  due_date: string;
}

const AdminPaymentListPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [dateRange, setDateRange] = useState('month');
  const [stats, setStats] = useState({
    totalRevenue: 0,
    pendingAmount: 0,
    overdueAmount: 0,
    cardPayments: 0,
    transferPayments: 0,
    cashPayments: 0,
    successRate: 0
  });

  useEffect(() => {
    const fetchPaymentData = async () => {
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
          },
          {
            id: '5',
            invoice_id: '8',
            invoice_number: 'INV-2025-008',
            amount: 35000, // 350.00 €
            method: 'card',
            status: 'pending',
            transaction_id: 'ch_pending123',
            created_at: '2025-04-15T09:20:00Z',
            customer: {
              id: '2',
              name: 'Supermarché FraisMart'
            }
          }
        ];

        const mockInvoices: Invoice[] = [
          {
            id: '2',
            number: 'INV-2025-002',
            amount: 85000, // 850.00 €
            status: 'pending',
            customer: {
              id: '2',
              name: 'Supermarché FraisMart'
            },
            created_at: '2025-04-05T11:30:00Z',
            due_date: '2025-04-20T11:30:00Z'
          },
          {
            id: '3',
            number: 'INV-2025-003',
            amount: 120000, // 1,200.00 €
            status: 'overdue',
            customer: {
              id: '3',
              name: 'Hôtel Le Méridien'
            },
            created_at: '2025-03-15T09:45:00Z',
            due_date: '2025-03-30T09:45:00Z'
          },
          {
            id: '4',
            number: 'INV-2025-004',
            amount: 35000, // 350.00 €
            status: 'draft',
            customer: {
              id: '1',
              name: 'Restaurant Le Provençal'
            },
            created_at: '2025-04-10T15:20:00Z',
            due_date: '2025-04-25T15:20:00Z'
          }
        ];

        setPayments(mockPayments);
        setInvoices(mockInvoices);

        // Calculate statistics
        const completedPayments = mockPayments.filter(p => p.status === 'completed');
        const totalRevenue = completedPayments.reduce((sum, p) => sum + p.amount, 0);
        const cardPayments = completedPayments.filter(p => p.method === 'card').reduce((sum, p) => sum + p.amount, 0);
        const transferPayments = completedPayments.filter(p => p.method === 'transfer').reduce((sum, p) => sum + p.amount, 0);
        const cashPayments = completedPayments.filter(p => p.method === 'cash').reduce((sum, p) => sum + p.amount, 0);
        
        const pendingAmount = mockInvoices
          .filter(i => i.status === 'pending')
          .reduce((sum, i) => sum + i.amount, 0);
        
        const overdueAmount = mockInvoices
          .filter(i => i.status === 'overdue')
          .reduce((sum, i) => sum + i.amount, 0);
        
        const successRate = mockPayments.length > 0 
          ? (completedPayments.length / mockPayments.length) * 100 
          : 0;

        setStats({
          totalRevenue,
          pendingAmount,
          overdueAmount,
          cardPayments,
          transferPayments,
          cashPayments,
          successRate
        });
      } catch (error) {
        console.error('Error fetching payment data:', error);
        toast.error('Erreur lors du chargement des données de paiement');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentData();
  }, []);

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = 
      payment.invoice_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (payment.transaction_id && payment.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    const matchesMethod = filterMethod === 'all' || payment.method === filterMethod;
    
    return matchesSearch && matchesStatus && matchesMethod;
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
        <h1 className="text-2xl font-bold text-gray-900">Gestion des paiements</h1>
        <p className="text-gray-600">Suivez et gérez tous les paiements et factures des clients</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <PaymentSummaryCard
          title="Revenus totaux"
          amount={stats.totalRevenue}
          count={payments.filter(p => p.status === 'completed').length}
          icon={<Euro className="h-6 w-6 text-blue-600" />}
          color="text-blue-600"
        />

        <PaymentSummaryCard
          title="En attente"
          amount={stats.pendingAmount}
          count={invoices.filter(i => i.status === 'pending').length}
          icon={<Clock className="h-6 w-6 text-yellow-600" />}
          color="text-yellow-600"
        />

        <PaymentSummaryCard
          title="En retard"
          amount={stats.overdueAmount}
          count={invoices.filter(i => i.status === 'overdue').length}
          icon={<AlertTriangle className="h-6 w-6 text-red-600" />}
          color="text-red-600"
        />

        <PaymentSummaryCard
          title="Taux de réussite"
          amount={stats.totalRevenue}
          count={payments.filter(p => p.status === 'completed').length}
          icon={<TrendingUp className="h-6 w-6 text-green-600" />}
          color="text-green-600"
          percentage={Math.round(stats.successRate)}
        />
      </div>

      {/* Payment Methods Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Méthodes de paiement</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <CreditCard className="h-4 w-4 text-blue-500 mr-2" />
                  <span className="text-sm text-gray-700">Carte bancaire</span>
                </div>
                <span className="text-sm font-medium">{formatCurrency(stats.cardPayments)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ 
                    width: `${stats.totalRevenue > 0 ? (stats.cardPayments / stats.totalRevenue) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <Landmark className="h-4 w-4 text-green-500 mr-2" />
                  <span className="text-sm text-gray-700">Virement bancaire</span>
                </div>
                <span className="text-sm font-medium">{formatCurrency(stats.transferPayments)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ 
                    width: `${stats.totalRevenue > 0 ? (stats.transferPayments / stats.totalRevenue) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center">
                  <Euro className="h-4 w-4 text-yellow-500 mr-2" />
                  <span className="text-sm text-gray-700">Espèces/Chèque</span>
                </div>
                <span className="text-sm font-medium">{formatCurrency(stats.cashPayments)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{ 
                    width: `${stats.totalRevenue > 0 ? (stats.cashPayments / stats.totalRevenue) * 100 : 0}%` 
                  }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-medium text-gray-900">Évolution des paiements</h2>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="quarter">3 derniers mois</option>
              <option value="year">12 derniers mois</option>
            </select>
          </div>
          
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart3 className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p>Graphique d'évolution des paiements</p>
              <p className="text-sm">(Données de démonstration)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices */}
      <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Factures récentes</h2>
          <Link to="/dashboard/invoices" className="text-sm text-blue-600 hover:text-blue-800">
            Voir toutes les factures
          </Link>
        </div>
        
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {invoices.map((invoice) => (
              <div key={invoice.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <Receipt className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-medium">{invoice.number}</span>
                  </div>
                  <InvoiceStatusBadge status={invoice.status} />
                </div>
                
                <div className="mb-3">
                  <div className="flex items-center text-sm text-gray-500 mb-1">
                    <Building className="h-4 w-4 mr-1 text-gray-400" />
                    {invoice.customer.name}
                  </div>
                  <div className="text-sm text-gray-500">
                    Émise le {format(new Date(invoice.created_at), 'dd/MM/yyyy', { locale: fr })}
                  </div>
                  <div className="text-sm text-gray-500">
                    Échéance le {format(new Date(invoice.due_date), 'dd/MM/yyyy', { locale: fr })}
                  </div>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-lg font-bold">{formatCurrency(invoice.amount)}</span>
                  <Link
                    to={`/dashboard/invoices/${invoice.id}`}
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
                  >
                    Détails
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
          <h2 className="text-lg font-medium text-gray-900">Historique des paiements</h2>
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
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </button>
            <div className="relative w-full sm:w-auto">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..."
                className="block w-full sm:w-auto pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              />
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

export default AdminPaymentListPage;
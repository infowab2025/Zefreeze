import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  ArrowLeft, CreditCard, Building, Calendar, 
  Download, BarChart, DollarSign, TrendingUp, 
  CheckCircle, AlertTriangle
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import PaymentHistoryTable, { Clock } from '../../components/payments/PaymentHistoryTable';

interface Client {
  id: string;
  name: string;
  address: string;
  email: string;
  phone?: string;
}

interface Payment {
  id: string;
  invoice_id: string;
  invoice_number: string;
  amount: number;
  method: 'card' | 'transfer' | 'cash';
  status: 'completed' | 'pending' | 'failed';
  transaction_id?: string;
  created_at: string;
}

interface PaymentStats {
  total_paid: number;
  total_pending: number;
  total_overdue: number;
  average_payment_time: number; // in days
  payment_methods: {
    card: number;
    transfer: number;
    cash: number;
  };
}

const ClientPaymentHistoryPage = () => {
  const { id } = useParams<{ id: string }>();
  const [client, setClient] = useState<Client | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('all');

  useEffect(() => {
    const fetchClientData = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch from the database
        // For now, we'll use mock data
        const mockClient: Client = {
          id: id || '1',
          name: 'Restaurant Le Provençal',
          address: '123 Rue de Paris, 75001 Paris',
          email: 'contact@leprovencal.fr',
          phone: '+33 1 23 45 67 89'
        };

        const mockPayments: Payment[] = [
          {
            id: '1',
            invoice_id: '1',
            invoice_number: 'INV-2025-001',
            amount: 45000, // 450.00 €
            method: 'card',
            status: 'completed',
            transaction_id: 'ch_1234567890',
            created_at: '2025-04-10T14:30:00Z'
          },
          {
            id: '2',
            invoice_id: '5',
            invoice_number: 'INV-2025-005',
            amount: 75000, // 750.00 €
            method: 'transfer',
            status: 'completed',
            transaction_id: 'tr_0987654321',
            created_at: '2025-04-02T10:45:00Z'
          },
          {
            id: '3',
            invoice_id: '6',
            invoice_number: 'INV-2025-006',
            amount: 25000, // 250.00 €
            method: 'cash',
            status: 'completed',
            created_at: '2025-03-15T16:20:00Z'
          }
        ];

        const mockStats: PaymentStats = {
          total_paid: 145000, // 1,450.00 €
          total_pending: 85000, // 850.00 €
          total_overdue: 120000, // 1,200.00 €
          average_payment_time: 8.5, // 8.5 days
          payment_methods: {
            card: 45000, // 450.00 €
            transfer: 75000, // 750.00 €
            cash: 25000 // 250.00 €
          }
        };

        setClient(mockClient);
        setPayments(mockPayments);
        setStats(mockStats);
      } catch (error) {
        console.error('Error fetching client data:', error);
        toast.error('Erreur lors du chargement des données client');
      } finally {
        setIsLoading(false);
      }
    };

    fetchClientData();
  }, [id]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount / 100);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!client || !stats) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Client non trouvé</h2>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center">
          <Link
            to="/dashboard/invoices"
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Historique de paiement</h1>
            <p className="text-gray-600">{client.name}</p>
          </div>
        </div>
      </div>

      {/* Client Info Card */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="flex items-start mb-4 md:mb-0">
            <Building className="h-6 w-6 text-gray-400 mr-3 mt-1" />
            <div>
              <h2 className="text-lg font-medium text-gray-900">{client.name}</h2>
              <p className="text-gray-600">{client.address}</p>
              <div className="mt-1 text-sm text-gray-500">
                <p>{client.email}</p>
                {client.phone && <p>{client.phone}</p>}
              </div>
            </div>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to={`/dashboard/invoices/new?client=${client.id}`}
              className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Receipt className="h-4 w-4 mr-2" />
              Nouvelle facture
            </Link>
            <button
              className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Exporter historique
            </button>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Total payé</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.total_paid)}</p>
            </div>
            <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">En attente</p>
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.total_pending)}</p>
            </div>
            <div className="h-12 w-12 bg-yellow-100 rounded-full flex items-center justify-center">
              <Clock className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">En retard</p>
              <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.total_overdue)}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Délai moyen</p>
              <p className="text-2xl font-bold text-blue-600">{stats.average_payment_time} jours</p>
            </div>
            <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
              <TrendingUp className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Payment Methods Chart */}
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
                <span className="text-sm font-medium">{formatCurrency(stats.payment_methods.card)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ 
                    width: `${(stats.payment_methods.card / stats.total_paid) * 100}%` 
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
                <span className="text-sm font-medium">{formatCurrency(stats.payment_methods.transfer)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-600 h-2 rounded-full" 
                  style={{ 
                    width: `${(stats.payment_methods.transfer / stats.total_paid) * 100}%` 
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
                <span className="text-sm font-medium">{formatCurrency(stats.payment_methods.cash)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-yellow-600 h-2 rounded-full" 
                  style={{ 
                    width: `${(stats.payment_methods.cash / stats.total_paid) * 100}%` 
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
              <option value="all">Toutes les périodes</option>
              <option value="month">Dernier mois</option>
              <option value="quarter">Dernier trimestre</option>
              <option value="year">Dernière année</option>
            </select>
          </div>
          
          <div className="h-64 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <BarChart className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p>Graphique d'évolution des paiements</p>
              <p className="text-sm">(Données de démonstration)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-medium text-gray-900">Historique des paiements</h2>
        </div>
        
        <PaymentHistoryTable payments={payments} />
      </div>
    </div>
  );
};

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

const Euro = (props: any) => (
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
    <path d="M4 10h12" />
    <path d="M4 14h9" />
    <path d="M19 6a7.7 7.7 0 0 0-5.2-2A7.9 7.9 0 0 0 6 12c0 4.4 3.5 8 7.8 8 2 0 3.8-.8 5.2-2" />
  </svg>
);

export default ClientPaymentHistoryPage;
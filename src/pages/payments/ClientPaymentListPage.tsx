import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  CreditCard, Download, Filter, Search,
  CheckCircle, AlertTriangle, Clock, Plus,
  Receipt, Building, Calendar, Euro, Landmark,
  ArrowRight
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../../contexts/AuthContext';
import PaymentHistoryTable from '../../components/payments/PaymentHistoryTable';

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

interface Invoice {
  id: string;
  number: string;
  amount: number;
  status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
  created_at: string;
  due_date: string;
}

const ClientPaymentListPage = () => {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [pendingInvoices, setPendingInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({
    totalPaid: 0,
    pendingAmount: 0,
    overdueAmount: 0
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

        const mockPendingInvoices: Invoice[] = [
          {
            id: '2',
            number: 'INV-2025-002',
            amount: 85000, // 850.00 €
            status: 'pending',
            created_at: '2025-04-05T11:30:00Z',
            due_date: '2025-04-20T11:30:00Z'
          },
          {
            id: '3',
            number: 'INV-2025-003',
            amount: 120000, // 1,200.00 €
            status: 'overdue',
            created_at: '2025-03-15T09:45:00Z',
            due_date: '2025-03-30T09:45:00Z'
          }
        ];

        setPayments(mockPayments);
        setPendingInvoices(mockPendingInvoices);

        // Calculate statistics
        const totalPaid = mockPayments.reduce((sum, payment) => sum + payment.amount, 0);
        const pendingAmount = mockPendingInvoices
          .filter(invoice => invoice.status === 'pending')
          .reduce((sum, invoice) => sum + invoice.amount, 0);
        const overdueAmount = mockPendingInvoices
          .filter(invoice => invoice.status === 'overdue')
          .reduce((sum, invoice) => sum + invoice.amount, 0);

        setStats({
          totalPaid,
          pendingAmount,
          overdueAmount
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
      (payment.transaction_id && payment.transaction_id.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = filterStatus === 'all' || payment.status === filterStatus;
    
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount / 100);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Mes paiements</h1>
        <p className="text-gray-600">Gérez vos factures et suivez vos paiements</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Total payé</p>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalPaid)}</p>
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
              <p className="text-2xl font-bold text-yellow-600">{formatCurrency(stats.pendingAmount)}</p>
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
              <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.overdueAmount)}</p>
            </div>
            <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Pending Invoices */}
      {pendingInvoices.length > 0 && (
        <div className="bg-white shadow rounded-lg overflow-hidden mb-6">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Factures à payer</h2>
          </div>
          
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingInvoices.map((invoice) => (
              <div key={invoice.id} className="border rounded-lg p-4 bg-white shadow-sm">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center">
                    <Receipt className="h-5 w-5 text-gray-400 mr-2" />
                    <span className="font-medium">{invoice.number}</span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                    invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {invoice.status === 'pending' ? (
                      <>
                        <Clock className="h-3 w-3 mr-1" />
                        En attente
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        En retard
                      </>
                    )}
                  </span>
                </div>
                
                <div className="mb-3">
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
                    to={`/dashboard/client-payments/${invoice.id}`}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <CreditCard className="h-4 w-4 mr-1" />
                    Payer
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Payment History */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Historique des paiements</h2>
          <div className="flex items-center space-x-2">
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-3 pr-8 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous</option>
                <option value="completed">Complétés</option>
                <option value="pending">En attente</option>
                <option value="failed">Échoués</option>
              </select>
              <Filter className="absolute right-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Rechercher..."
                className="pl-10 pr-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : (
          <PaymentHistoryTable payments={filteredPayments} />
        )}
      </div>
    </div>
  );
};

export default ClientPaymentListPage;
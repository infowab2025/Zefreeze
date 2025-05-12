import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  ArrowLeft, Download, Mail, Printer, 
  Receipt, Building, Calendar, CreditCard, 
  CheckCircle, Clock, AlertTriangle, FileText
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import PaymentDetailCard from '../../components/payments/PaymentDetailCard';

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
    email: string;
    address?: string;
  };
  invoice?: {
    id: string;
    number: string;
    created_at: string;
    due_date: string;
    items: Array<{
      description: string;
      quantity: number;
      unit_price: number;
      total: number;
    }>;
  };
}

const PaymentDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayment = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch from the database
        // For now, we'll use mock data
        const mockPayment: Payment = {
          id: id || '1',
          invoice_id: '1',
          invoice_number: 'INV-2025-001',
          amount: 45000, // 450.00 €
          method: 'card',
          status: 'completed',
          transaction_id: 'ch_1234567890',
          created_at: '2025-04-10T14:30:00Z',
          customer: {
            id: '1',
            name: 'Restaurant Le Provençal',
            email: 'contact@leprovencal.fr',
            address: '123 Rue de Paris, 75001 Paris'
          },
          invoice: {
            id: '1',
            number: 'INV-2025-001',
            created_at: '2025-04-01T10:00:00Z',
            due_date: '2025-04-15T10:00:00Z',
            items: [
              {
                description: 'Maintenance préventive',
                quantity: 1,
                unit_price: 35000, // 350.00 €
                total: 35000 // 350.00 €
              },
              {
                description: 'Remplacement filtre',
                quantity: 1,
                unit_price: 3000, // 30.00 €
                total: 3000 // 30.00 €
              },
              {
                description: 'Frais de déplacement',
                quantity: 1,
                unit_price: 7000, // 70.00 €
                total: 7000 // 70.00 €
              }
            ]
          }
        };

        setPayment(mockPayment);
      } catch (error) {
        console.error('Error fetching payment:', error);
        toast.error('Erreur lors du chargement du paiement');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayment();
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

  if (!payment) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Paiement non trouvé</h2>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/dashboard/payments')}
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Détails du paiement</h1>
            <p className="text-gray-600">
              Transaction du {format(new Date(payment.created_at), 'dd MMMM yyyy', { locale: fr })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Payment Details */}
          <PaymentDetailCard payment={payment} />

          {/* Invoice Items */}
          {payment.invoice && (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Détails de la facture</h2>
              </div>
              
              <div className="p-6">
                <div className="mb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Receipt className="h-5 w-5 text-gray-400 mr-2" />
                      <Link 
                        to={`/dashboard/invoices/${payment.invoice_id}`}
                        className="text-blue-600 hover:text-blue-900 font-medium"
                      >
                        {payment.invoice_number}
                      </Link>
                    </div>
                    <div className="text-sm text-gray-500">
                      Émise le {format(new Date(payment.invoice.created_at), 'dd/MM/yyyy', { locale: fr })}
                    </div>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Description
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Quantité
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Prix unitaire
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {payment.invoice.items.map((item, index) => (
                        <tr key={index}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                            {item.description}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {item.quantity}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatCurrency(item.unit_price)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {formatCurrency(item.total)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot className="bg-gray-50">
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                          Total HT
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount * 0.8)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                          TVA (20%)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(payment.amount * 0.2)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                          Total TTC
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          {formatCurrency(payment.amount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Status */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Statut du paiement</h2>
            </div>
            
            <div className="p-6">
              {payment.status === 'completed' ? (
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Paiement réussi</p>
                      <p className="text-xs text-green-700">
                        Traité le {format(new Date(payment.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                </div>
              ) : payment.status === 'pending' ? (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">Paiement en attente</p>
                      <p className="text-xs text-yellow-700">
                        Initié le {format(new Date(payment.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Paiement échoué</p>
                      <p className="text-xs text-red-700">
                        Tentative le {format(new Date(payment.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="mt-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Sous-total HT</span>
                  <span className="text-sm font-medium">{formatCurrency(payment.amount * 0.8)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">TVA (20%)</span>
                  <span className="text-sm font-medium">{formatCurrency(payment.amount * 0.2)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-bold text-gray-900">Total TTC</span>
                  <span className="text-sm font-bold text-blue-600">{formatCurrency(payment.amount)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Actions</h2>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                <button
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Télécharger reçu
                </button>
                
                <button
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer reçu
                </button>
                
                <button
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Envoyer par email
                </button>
                
                <Link
                  to={`/dashboard/invoices/${payment.invoice_id}`}
                  className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Voir la facture
                </Link>
              </div>
            </div>
          </div>

          {/* Customer Info */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Informations client</h2>
            </div>
            
            <div className="p-6">
              <div className="flex items-start mb-4">
                <Building className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-gray-900">{payment.customer.name}</p>
                  <p className="text-sm text-gray-600">{payment.customer.email}</p>
                  {payment.customer.address && (
                    <p className="text-sm text-gray-600">{payment.customer.address}</p>
                  )}
                </div>
              </div>
              
              <Link
                to={`/dashboard/invoices/client/${payment.customer.id}`}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Voir l'historique client
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentDetailPage;
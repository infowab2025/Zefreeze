import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { 
  CreditCard, CheckCircle, AlertTriangle, 
  ArrowLeft, Receipt, Building, Calendar, 
  Clock, Euro, CreditCard as CreditCardIcon,
  Shield, Lock
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import PaymentMethodSelector from '../../components/payments/PaymentMethodSelector';

// Initialize Stripe
const stripePromise = loadStripe('pk_test_TYooMQauvdEDq54NiTphI7jx');

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
    address?: string;
  };
  created_at: string;
  due_date: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
}

const ClientPaymentPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    const fetchInvoice = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch from the database
        // For now, we'll use mock data
        const mockInvoice: Invoice = {
          id: id || '2',
          number: 'INV-2025-002',
          amount: 85000, // 850.00 €
          currency: 'EUR',
          status: 'pending',
          customer: {
            id: '2',
            name: 'Client User',
            email: 'client@zefreeze.com',
            address: '45 Avenue des Champs, 75008 Paris'
          },
          created_at: '2025-04-05T11:30:00Z',
          due_date: '2025-04-20T11:30:00Z',
          items: [
            {
              id: '1',
              description: 'Main d\'œuvre technicien (4h)',
              quantity: 4,
              unit_price: 9000, // 90.00 €
              total: 36000 // 360.00 €
            },
            {
              id: '2',
              description: 'Remplacement compresseur',
              quantity: 1,
              unit_price: 42000, // 420.00 €
              total: 42000 // 420.00 €
            },
            {
              id: '3',
              description: 'Frais de déplacement',
              quantity: 1,
              unit_price: 7000, // 70.00 €
              total: 7000 // 70.00 €
            }
          ]
        };

        setInvoice(mockInvoice);
      } catch (error) {
        console.error('Error fetching invoice:', error);
        toast.error('Erreur lors du chargement de la facture');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoice();
  }, [id]);

  const handlePayment = async () => {
    if (!invoice) return;
    
    setIsProcessing(true);
    try {
      if (paymentMethod === 'card') {
        // In a real app, this would create a payment intent with Stripe
        // and redirect to the Stripe checkout page
        
        // Simulate Stripe checkout
        const stripe = await stripePromise;
        if (!stripe) {
          throw new Error('Stripe failed to load');
        }
        
        // Simulate successful payment after 2 seconds
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        // Simulate successful payment
        setPaymentSuccess(true);
        toast.success('Paiement effectué avec succès');
      } else if (paymentMethod === 'transfer') {
        // Show bank transfer instructions
        toast.success('Instructions de virement bancaire affichées');
        setPaymentSuccess(true);
      } else {
        // Cash/check payment
        toast.success('Paiement enregistré, à régler lors de la prochaine intervention');
        setPaymentSuccess(true);
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      toast.error('Erreur lors du traitement du paiement');
    } finally {
      setIsProcessing(false);
    }
  };

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

  if (!invoice) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900">Facture non trouvée</h2>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center">
          <button
            onClick={() => navigate('/dashboard/invoices')}
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Paiement de facture</h1>
            <p className="text-gray-600">Facture #{invoice.number}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Details */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Détails de la facture</h2>
            </div>
            
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Client</h3>
                  <div className="flex items-start">
                    <Building className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">{invoice.customer.name}</p>
                      <p className="text-sm text-gray-600">{invoice.customer.email}</p>
                      {invoice.customer.address && (
                        <p className="text-sm text-gray-600">{invoice.customer.address}</p>
                      )}
                    </div>
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Dates</h3>
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <span className="text-sm text-gray-600">Date d'émission: </span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(invoice.created_at).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <span className="text-sm text-gray-600">Date d'échéance: </span>
                        <span className="text-sm font-medium text-gray-900">
                          {new Date(invoice.due_date).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Invoice Items */}
              <div className="mt-6">
                <h3 className="text-sm font-medium text-gray-500 mb-3">Détail des prestations</h3>
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
                      {invoice.items.map((item) => (
                        <tr key={item.id}>
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
                          {formatCurrency(invoice.amount * 0.8)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-sm font-medium text-gray-900 text-right">
                          TVA (20%)
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(invoice.amount * 0.2)}
                        </td>
                      </tr>
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-sm font-bold text-gray-900 text-right">
                          Total TTC
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                          {formatCurrency(invoice.amount)}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Summary */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Récapitulatif</h2>
            </div>
            <div className="p-6">
              {paymentSuccess ? (
                <div className="bg-green-50 p-6 rounded-lg text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-green-800 mb-2">Paiement réussi</h3>
                  <p className="text-green-700 mb-4">
                    Votre paiement a été traité avec succès. Un reçu a été envoyé à votre adresse email.
                  </p>
                  <button
                    onClick={() => navigate('/dashboard/client')}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700"
                  >
                    Retour au tableau de bord
                  </button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">Sous-total</span>
                      <span className="font-medium">{formatCurrency(invoice.amount * 0.8)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600">TVA (20%)</span>
                      <span className="font-medium">{formatCurrency(invoice.amount * 0.2)}</span>
                    </div>
                    <div className="border-t border-gray-200 pt-4 flex justify-between items-center">
                      <span className="text-lg font-bold">Total</span>
                      <span className="text-lg font-bold text-blue-600">{formatCurrency(invoice.amount)}</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Méthode de paiement</h3>
                    
                    <PaymentMethodSelector
                      selectedMethod={paymentMethod}
                      onChange={setPaymentMethod}
                    />
                    
                    <button
                      onClick={handlePayment}
                      disabled={isProcessing}
                      className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 flex items-center justify-center"
                    >
                      {isProcessing ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Traitement en cours...
                        </>
                      ) : (
                        <>
                          <CreditCard className="h-4 w-4 mr-2" />
                          Payer {formatCurrency(invoice.amount)}
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Security Info */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Paiement sécurisé</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-700">Paiement 100% sécurisé</span>
                </div>
                <div className="flex items-center">
                  <Lock className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-700">Cryptage SSL 256 bits</span>
                </div>
                <div className="flex items-center">
                  <CreditCardIcon className="h-5 w-5 text-green-500 mr-2" />
                  <span className="text-sm text-gray-700">Cartes acceptées: Visa, Mastercard, CB</span>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  En procédant au paiement, vous acceptez nos conditions générales de vente et notre politique de confidentialité.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ClientPaymentPage;
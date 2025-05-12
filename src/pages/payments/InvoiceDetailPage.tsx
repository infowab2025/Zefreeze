import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  ArrowLeft, Download, CreditCard, CheckCircle, 
  AlertTriangle, Receipt, Building, Calendar, 
  FileText, Clock, Mail, Printer
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import Edit from '../../components/ui/icons/Edit';

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
  intervention?: {
    id: string;
    reference: string;
    type: string;
    description: string;
  };
  created_at: string;
  due_date: string;
  paid_at?: string;
  pdf_url?: string;
  items: Array<{
    id: string;
    description: string;
    quantity: number;
    unit_price: number;
    total: number;
  }>;
  notes?: string;
}

const InvoiceDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvoice = async () => {
      setIsLoading(true);
      try {
        // In a real app, this would fetch from the database
        // For now, we'll use mock data
        const mockInvoice: Invoice = {
          id: id || '1',
          number: 'INV-2025-001',
          amount: 45000, // 450.00 €
          currency: 'EUR',
          status: 'paid',
          customer: {
            id: '1',
            name: 'Restaurant Le Provençal',
            email: 'contact@leprovencal.fr',
            address: '123 Rue de Paris, 75001 Paris'
          },
          intervention: {
            id: '1',
            reference: 'INT-2025-001',
            type: 'maintenance',
            description: 'Maintenance trimestrielle du système de réfrigération'
          },
          created_at: '2025-04-01T10:00:00Z',
          due_date: '2025-04-15T10:00:00Z',
          paid_at: '2025-04-10T14:30:00Z',
          pdf_url: '#',
          items: [
            {
              id: '1',
              description: 'Maintenance préventive',
              quantity: 1,
              unit_price: 35000, // 350.00 €
              total: 35000 // 350.00 €
            },
            {
              id: '2',
              description: 'Remplacement filtre',
              quantity: 1,
              unit_price: 3000, // 30.00 €
              total: 3000 // 30.00 €
            },
            {
              id: '3',
              description: 'Frais de déplacement',
              quantity: 1,
              unit_price: 7000, // 70.00 €
              total: 7000 // 70.00 €
            }
          ],
          notes: 'Prochaine maintenance prévue dans 3 mois.'
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
            <h1 className="text-2xl font-bold text-gray-900">Facture #{invoice.number}</h1>
            <p className="text-gray-600">
              Émise le {format(new Date(invoice.created_at), 'dd MMMM yyyy', { locale: fr })}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Invoice Header */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
              <div className="flex items-center">
                <Receipt className="h-5 w-5 text-blue-600 mr-2" />
                <h2 className="text-lg font-medium text-gray-900">Détails de la facture</h2>
              </div>
              <div>
                {getStatusBadge(invoice.status)}
              </div>
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
                          {format(new Date(invoice.created_at), 'dd MMMM yyyy', { locale: fr })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 text-gray-400 mr-2" />
                      <div>
                        <span className="text-sm text-gray-600">Date d'échéance: </span>
                        <span className="text-sm font-medium text-gray-900">
                          {format(new Date(invoice.due_date), 'dd MMMM yyyy', { locale: fr })}
                        </span>
                      </div>
                    </div>
                    {invoice.paid_at && (
                      <div className="flex items-center">
                        <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                        <div>
                          <span className="text-sm text-gray-600">Date de paiement: </span>
                          <span className="text-sm font-medium text-green-600">
                            {format(new Date(invoice.paid_at), 'dd MMMM yyyy', { locale: fr })}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {invoice.intervention && (
                <div className="mb-6">
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Intervention associée</h3>
                  <div className="flex items-start">
                    <FileText className="h-5 w-5 text-gray-400 mr-2 mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {invoice.intervention.reference} - {getInterventionType(invoice.intervention.type)}
                      </p>
                      <p className="text-sm text-gray-600">{invoice.intervention.description}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Invoice Items */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Éléments facturés</h2>
            </div>
            
            <div className="p-6">
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
              
              {invoice.notes && (
                <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-700 mb-2">Notes</h3>
                  <p className="text-sm text-gray-600">{invoice.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Payment Status */}
          <div className="bg-white shadow rounded-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Statut du paiement</h2>
            </div>
            
            <div className="p-6">
              {invoice.status === 'paid' ? (
                <div className="bg-green-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-green-800">Facture payée</p>
                      {invoice.paid_at && (
                        <p className="text-xs text-green-700">
                          Payée le {format(new Date(invoice.paid_at), 'dd/MM/yyyy', { locale: fr })}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ) : invoice.status === 'pending' ? (
                <div className="bg-yellow-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-yellow-800">En attente de paiement</p>
                      <p className="text-xs text-yellow-700">
                        Échéance: {format(new Date(invoice.due_date), 'dd/MM/yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  
                  <Link
                    to={`/dashboard/payments/${invoice.id}`}
                    className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payer maintenant
                  </Link>
                </div>
              ) : invoice.status === 'overdue' ? (
                <div className="bg-red-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-red-800">Paiement en retard</p>
                      <p className="text-xs text-red-700">
                        Échéance dépassée: {format(new Date(invoice.due_date), 'dd/MM/yyyy', { locale: fr })}
                      </p>
                    </div>
                  </div>
                  
                  <Link
                    to={`/dashboard/payments/${invoice.id}`}
                    className="mt-3 w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <CreditCard className="h-4 w-4 mr-2" />
                    Payer maintenant
                  </Link>
                </div>
              ) : invoice.status === 'draft' ? (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-gray-500 mr-2" />
                    <div>
                      <p className="text-sm font-medium text-gray-800">Brouillon</p>
                      <p className="text-xs text-gray-700">
                        Cette facture n'a pas encore été finalisée
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
              
              <div className="mt-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">Sous-total HT</span>
                  <span className="text-sm font-medium">{formatCurrency(invoice.amount * 0.8)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-200">
                  <span className="text-sm text-gray-600">TVA (20%)</span>
                  <span className="text-sm font-medium">{formatCurrency(invoice.amount * 0.2)}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm font-bold text-gray-900">Total TTC</span>
                  <span className="text-sm font-bold text-blue-600">{formatCurrency(invoice.amount)}</span>
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
                {invoice.pdf_url && (
                  <a
                    href={invoice.pdf_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Télécharger PDF
                  </a>
                )}
                
                <button
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Printer className="h-4 w-4 mr-2" />
                  Imprimer
                </button>
                
                <button
                  className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Envoyer par email
                </button>
                
                {invoice.status === 'draft' && (
                  <Link
                    to={`/dashboard/invoices/${invoice.id}/edit`}
                    className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Modifier
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* Payment Info */}
          {invoice.status === 'pending' || invoice.status === 'overdue' ? (
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Informations de paiement</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Virement bancaire</h3>
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">IBAN: FR76 1234 5678 9012 3456 7890 123</p>
                      <p className="text-sm text-gray-600 mb-1">BIC: ABCDEFGHIJK</p>
                      <p className="text-sm text-gray-600">Référence: {invoice.number}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-700 mb-1">Paiement en ligne</h3>
                    <Link
                      to={`/dashboard/payments/${invoice.id}`}
                      className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Payer en ligne
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

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

const getInterventionType = (type: string) => {
  switch (type) {
    case 'repair':
      return 'Réparation';
    case 'maintenance':
      return 'Maintenance';
    case 'installation':
      return 'Installation';
    case 'audit':
      return 'Audit';
    default:
      return type;
  }
};

export default InvoiceDetailPage;
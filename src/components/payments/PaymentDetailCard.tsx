import React from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { Receipt, Building, Calendar, CreditCard, Landmark, Euro, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { formatCurrency } from '../../utils/formatters';

interface PaymentDetailCardProps {
  payment: {
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
  };
}

const PaymentDetailCard: React.FC<PaymentDetailCardProps> = ({ payment }) => {
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
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center">
          <Receipt className="h-5 w-5 text-blue-600 mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Détails du paiement</h3>
        </div>
        {getStatusBadge(payment.status)}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
        <div>
          <p className="text-sm text-gray-500 mb-1">Facture</p>
          <Link 
            to={`/dashboard/invoices/${payment.invoice_id}`}
            className="text-blue-600 hover:text-blue-900 font-medium"
          >
            {payment.invoice_number}
          </Link>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-1">Montant</p>
          <p className="text-lg font-semibold text-gray-900">{formatCurrency(payment.amount)}</p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-1">Client</p>
          <Link 
            to={`/dashboard/invoices/client/${payment.customer.id}`}
            className="text-blue-600 hover:text-blue-900"
          >
            {payment.customer.name}
          </Link>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-1">Date</p>
          <p className="text-gray-900">
            {format(new Date(payment.created_at), 'dd MMMM yyyy à HH:mm', { locale: fr })}
          </p>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-1">Méthode de paiement</p>
          <div className="flex items-center">
            {getMethodIcon(payment.method)}
            <span className="ml-2">{getMethodName(payment.method)}</span>
          </div>
        </div>
        
        <div>
          <p className="text-sm text-gray-500 mb-1">ID de transaction</p>
          <p className="text-gray-900 font-mono text-sm">
            {payment.transaction_id || '-'}
          </p>
        </div>
      </div>
      
      {payment.method === 'card' && payment.status === 'completed' && (
        <div className="mt-4 p-4 bg-green-50 rounded-lg border border-green-100">
          <div className="flex items-center">
            <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
            <p className="text-green-700">
              Paiement par carte traité avec succès. Un reçu a été envoyé par email au client.
            </p>
          </div>
        </div>
      )}
      
      {payment.status === 'failed' && (
        <div className="mt-4 p-4 bg-red-50 rounded-lg border border-red-100">
          <div className="flex items-center">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <p className="text-red-700">
              Le paiement a échoué. Raison: Fonds insuffisants. Veuillez contacter le client.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentDetailCard;
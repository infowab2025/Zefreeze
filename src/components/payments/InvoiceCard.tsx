import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Receipt, Building, Calendar, ArrowRight } from 'lucide-react';
import InvoiceStatusBadge from './InvoiceStatusBadge';

interface InvoiceCardProps {
  invoice: {
    id: string;
    number: string;
    amount: number;
    status: 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled';
    customer: {
      name: string;
    };
    created_at: string;
    due_date: string;
  };
}

const InvoiceCard: React.FC<InvoiceCardProps> = ({ invoice }) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount / 100);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Receipt className="h-5 w-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-gray-900">{invoice.number}</span>
          </div>
          <InvoiceStatusBadge status={invoice.status} />
        </div>
        
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <Building className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-700">{invoice.customer.name}</span>
          </div>
          <div className="flex items-center">
            <Calendar className="h-4 w-4 text-gray-400 mr-2" />
            <span className="text-sm text-gray-600">
              Émise le {format(new Date(invoice.created_at), 'dd/MM/yyyy', { locale: fr })}
            </span>
          </div>
        </div>
        
        <div className="flex items-center justify-between pt-4 border-t border-gray-200">
          <span className="text-lg font-bold text-gray-900">{formatCurrency(invoice.amount)}</span>
          <Link
            to={`/dashboard/invoices/${invoice.id}`}
            className="inline-flex items-center text-sm text-blue-600 hover:text-blue-800"
          >
            Voir détails
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default InvoiceCard;
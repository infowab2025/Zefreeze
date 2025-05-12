import React from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  Building, Calendar, FileText, ArrowRight,
  ThermometerSnowflake, Fan, Settings, Euro
} from 'lucide-react';
import { Quote } from '../../types/quote';

interface QuoteCardProps {
  quote: Quote;
}

const QuoteCard: React.FC<QuoteCardProps> = ({ quote }) => {
  const getTypeIcon = () => {
    switch (quote.type) {
      case 'cold_storage':
        return <ThermometerSnowflake className="h-5 w-5 text-blue-500" />;
      case 'vmc':
        return <Fan className="h-5 w-5 text-green-500" />;
      default:
        return <Settings className="h-5 w-5 text-purple-500" />;
    }
  };

  const getTypeName = () => {
    switch (quote.type) {
      case 'cold_storage':
        return 'Froid commercial';
      case 'vmc':
        return 'VMC';
      default:
        return 'Autre';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Building className="h-5 w-5 text-gray-500 mr-2" />
            <span className="text-lg font-medium text-gray-900">{quote.companyName}</span>
          </div>
          <div className="flex items-center text-sm text-gray-500">
            <Calendar className="h-4 w-4 mr-1" />
            {format(new Date(quote.createdAt), 'dd/MM/yyyy', { locale: fr })}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex items-center text-sm text-gray-500 mb-1">
              {getTypeIcon()}
              <span className="ml-2">{getTypeName()}</span>
            </div>
            <p className="text-gray-900 line-clamp-2">{quote.description}</p>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center text-sm text-gray-500">
              <FileText className="h-4 w-4 mr-1" />
              <span>Devis #{quote.id.substring(0, 8)}</span>
            </div>
            <div className="flex items-center text-lg font-bold text-green-600">
              <Euro className="h-5 w-5 mr-1" />
              <span>{formatCurrency(quote.total || 0)}</span>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <Link
            to={`/dashboard/quotes/${quote.id}`}
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

export default QuoteCard;
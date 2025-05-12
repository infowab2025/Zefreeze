import React from 'react';
import { formatCurrency } from '../../utils/formatters';

interface PaymentSummaryCardProps {
  title: string;
  amount: number;
  count: number;
  icon: React.ReactNode;
  color: string;
  percentage?: number;
}

const PaymentSummaryCard: React.FC<PaymentSummaryCardProps> = ({
  title,
  amount,
  count,
  icon,
  color,
  percentage
}) => {
  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>{formatCurrency(amount)}</p>
        </div>
        <div className={`h-12 w-12 ${color.replace('text', 'bg').replace('600', '100')} rounded-full flex items-center justify-center`}>
          {icon}
        </div>
      </div>
      <div className="mt-2 text-sm text-gray-500">
        {count} paiement{count !== 1 ? 's' : ''}
        {percentage !== undefined && ` (${percentage}%)`}
      </div>
    </div>
  );
};

export default PaymentSummaryCard;
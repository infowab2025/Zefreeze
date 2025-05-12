import React from 'react';
import { Euro } from 'lucide-react';

interface QuoteSummaryProps {
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'amount';
  tax: number;
  total: number;
  onDiscountChange?: (value: number) => void;
  onDiscountTypeChange?: (type: 'percentage' | 'amount') => void;
  readOnly?: boolean;
}

const QuoteSummary: React.FC<QuoteSummaryProps> = ({
  subtotal,
  discount,
  discountType,
  tax,
  total,
  onDiscountChange,
  onDiscountTypeChange,
  readOnly = false
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const discountAmount = discountType === 'percentage' 
    ? subtotal * (discount / 100) 
    : discount;

  return (
    <div className="bg-gray-50 p-6 rounded-lg">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Récapitulatif</h3>
      
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <span className="text-gray-600">Sous-total HT</span>
          <span className="font-medium">{formatCurrency(subtotal)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-gray-600 mr-2">Remise</span>
            {!readOnly && (
              <div className="flex items-center space-x-2">
                <input
                  type="number"
                  min="0"
                  value={discount}
                  onChange={(e) => onDiscountChange && onDiscountChange(parseFloat(e.target.value))}
                  className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                />
                <select
                  value={discountType}
                  onChange={(e) => onDiscountTypeChange && onDiscountTypeChange(e.target.value as 'percentage' | 'amount')}
                  className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="percentage">%</option>
                  <option value="amount">€</option>
                </select>
              </div>
            )}
            {readOnly && (
              <span className="text-gray-600">
                {discountType === 'percentage' ? `${discount}%` : formatCurrency(discount)}
              </span>
            )}
          </div>
          <span className="font-medium text-red-600">-{formatCurrency(discountAmount)}</span>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="text-gray-600">Total HT</span>
          <span className="font-medium">{formatCurrency(subtotal - discountAmount)}</span>
        </div>
        
        <div className="flex justify-between items-center">
          <span className="text-gray-600">TVA (20%)</span>
          <span className="font-medium">{formatCurrency(tax)}</span>
        </div>
        
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="text-lg font-bold text-gray-900">Total TTC</span>
          <span className="text-lg font-bold text-green-600 flex items-center">
            <Euro className="h-5 w-5 mr-1" />
            {formatCurrency(total)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default QuoteSummary;
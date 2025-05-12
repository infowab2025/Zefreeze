import React from 'react';
import { Trash2, Plus } from 'lucide-react';

interface QuoteItem {
  name: string;
  description: string;
  quantity: number;
  unitPrice: number;
}

interface QuoteItemsTableProps {
  items: QuoteItem[];
  onItemChange: (index: number, field: keyof QuoteItem, value: any) => void;
  onItemAdd: () => void;
  onItemRemove: (index: number) => void;
  readOnly?: boolean;
}

const QuoteItemsTable: React.FC<QuoteItemsTableProps> = ({
  items,
  onItemChange,
  onItemAdd,
  onItemRemove,
  readOnly = false
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Désignation
            </th>
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
            {!readOnly && (
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {items.map((item, index) => (
            <tr key={index}>
              <td className="px-6 py-4 whitespace-nowrap">
                {readOnly ? (
                  <span className="text-sm text-gray-900">{item.name}</span>
                ) : (
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => onItemChange(index, 'name', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {readOnly ? (
                  <span className="text-sm text-gray-900">{item.description}</span>
                ) : (
                  <input
                    type="text"
                    value={item.description}
                    onChange={(e) => onItemChange(index, 'description', e.target.value)}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {readOnly ? (
                  <span className="text-sm text-gray-900">{item.quantity}</span>
                ) : (
                  <input
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(e) => onItemChange(index, 'quantity', parseInt(e.target.value))}
                    className="block w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                {readOnly ? (
                  <span className="text-sm text-gray-900">{formatCurrency(item.unitPrice)}</span>
                ) : (
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.unitPrice}
                    onChange={(e) => onItemChange(index, 'unitPrice', parseFloat(e.target.value))}
                    className="block w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  />
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {formatCurrency(item.quantity * item.unitPrice)}
              </td>
              {!readOnly && (
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    type="button"
                    onClick={() => onItemRemove(index)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-5 w-5" />
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
        {!readOnly && (
          <tfoot>
            <tr>
              <td colSpan={6} className="px-6 py-4">
                <button
                  type="button"
                  onClick={onItemAdd}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter un élément
                </button>
              </td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
};

export default QuoteItemsTable;
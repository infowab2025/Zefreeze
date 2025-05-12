import React from 'react';
import { CreditCard, Euro, Landmark } from 'lucide-react';

interface PaymentMethodSelectorProps {
  selectedMethod: string;
  onChange: (method: string) => void;
}

const PaymentMethodSelector: React.FC<PaymentMethodSelectorProps> = ({
  selectedMethod,
  onChange
}) => {
  return (
    <div className="space-y-3">
      <div 
        className={`border rounded-lg p-3 flex items-center cursor-pointer ${
          selectedMethod === 'card' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onClick={() => onChange('card')}
      >
        <input
          type="radio"
          id="card"
          name="payment_method"
          value="card"
          checked={selectedMethod === 'card'}
          onChange={() => onChange('card')}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
        />
        <label htmlFor="card" className="ml-3 flex items-center cursor-pointer flex-grow">
          <CreditCard className="h-5 w-5 text-gray-400 mr-2" />
          <div>
            <span className="font-medium">Carte bancaire</span>
            <p className="text-xs text-gray-500 mt-1">Paiement sécurisé par Stripe</p>
          </div>
        </label>
      </div>
      
      <div 
        className={`border rounded-lg p-3 flex items-center cursor-pointer ${
          selectedMethod === 'transfer' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onClick={() => onChange('transfer')}
      >
        <input
          type="radio"
          id="transfer"
          name="payment_method"
          value="transfer"
          checked={selectedMethod === 'transfer'}
          onChange={() => onChange('transfer')}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
        />
        <label htmlFor="transfer" className="ml-3 flex items-center cursor-pointer flex-grow">
          <Landmark className="h-5 w-5 text-gray-400 mr-2" />
          <div>
            <span className="font-medium">Virement bancaire</span>
            <p className="text-xs text-gray-500 mt-1">Paiement manuel par virement</p>
          </div>
        </label>
      </div>
      
      <div 
        className={`border rounded-lg p-3 flex items-center cursor-pointer ${
          selectedMethod === 'cash' ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onClick={() => onChange('cash')}
      >
        <input
          type="radio"
          id="cash"
          name="payment_method"
          value="cash"
          checked={selectedMethod === 'cash'}
          onChange={() => onChange('cash')}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
        />
        <label htmlFor="cash" className="ml-3 flex items-center cursor-pointer flex-grow">
          <Euro className="h-5 w-5 text-gray-400 mr-2" />
          <div>
            <span className="font-medium">Espèces ou chèque</span>
            <p className="text-xs text-gray-500 mt-1">Paiement lors de l'intervention</p>
          </div>
        </label>
      </div>
    </div>
  );
};

export default PaymentMethodSelector;
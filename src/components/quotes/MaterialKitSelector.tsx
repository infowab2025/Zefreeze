import React from 'react';
import { ThermometerSnowflake, Fan, Settings, Check } from 'lucide-react';
import { MaterialKit } from '../../types/quote';

interface MaterialKitSelectorProps {
  kits: MaterialKit[];
  selectedKitId: string | undefined;
  onSelect: (kit: MaterialKit) => void;
  isLoading?: boolean;
}

const MaterialKitSelector: React.FC<MaterialKitSelectorProps> = ({
  kits,
  selectedKitId,
  onSelect,
  isLoading = false
}) => {
  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'cold_storage':
        return <ThermometerSnowflake className="h-5 w-5 text-blue-500" />;
      case 'vmc':
        return <Fan className="h-5 w-5 text-green-500" />;
      default:
        return <Settings className="h-5 w-5 text-purple-500" />;
    }
  };

  const getTypeName = (type: string) => {
    switch (type) {
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

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (kits.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Aucun kit matériel disponible
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {kits.map((kit) => (
        <div
          key={kit.id}
          onClick={() => onSelect(kit)}
          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
            selectedKitId === kit.id
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-50/50'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              {getTypeIcon(kit.type)}
              <span className="ml-2 font-medium text-gray-900">{kit.name}</span>
            </div>
            <div className="flex items-center">
              <span className="font-bold text-green-600 mr-2">{formatCurrency(kit.basePrice)}</span>
              {selectedKitId === kit.id && (
                <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                  <Check className="h-4 w-4 text-white" />
                </div>
              )}
            </div>
          </div>
          <div className="text-sm text-gray-500 mb-2">
            {getTypeName(kit.type)}
          </div>
          <p className="text-sm text-gray-600">{kit.description}</p>
          <div className="mt-2 text-xs text-gray-500">
            {kit.items.length} éléments inclus
          </div>
        </div>
      ))}
    </div>
  );
};

export default MaterialKitSelector;
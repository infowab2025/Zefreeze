import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Save, Trash2, Plus,
  Building, Calendar, Mail, Phone, MapPin
} from 'lucide-react';
import { useQuotes } from '../../hooks/useQuotes';
import { useCompanies } from '../../hooks/useCompanies';
import QuoteItemsTable from '../../components/quotes/QuoteItemsTable';
import QuoteSummary from '../../components/quotes/QuoteSummary';
import { MaterialKit } from '../../types/quote';
import MaterialKitSelector from '../../components/quotes/MaterialKitSelector';

const QuoteEditPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getQuote, updateQuote, materialKits } = useQuotes();
  const { companies } = useCompanies();
  const { data: quote, isLoading: isQuoteLoading } = getQuote(id || '');
  
  const [formData, setFormData] = useState({
    companyId: '',
    contactName: '',
    contactEmail: '',
    contactPhone: '',
    type: 'cold_storage' as 'cold_storage' | 'vmc' | 'other',
    description: '',
    location: {
      address: '',
      additionalInfo: ''
    },
    kitId: '',
    items: [] as {
      name: string;
      description: string;
      quantity: number;
      unitPrice: number;
    }[],
    discount: 0,
    discountType: 'percentage' as 'percentage' | 'amount',
    notes: '',
    expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0]
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedKit, setSelectedKit] = useState<MaterialKit | null>(null);
  
  // Calculate totals
  const subtotal = formData.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  let discountAmount = 0;
  
  if (formData.discountType === 'percentage') {
    discountAmount = subtotal * (formData.discount / 100);
  } else {
    discountAmount = formData.discount;
  }
  
  const taxableAmount = subtotal - discountAmount;
  const taxAmount = taxableAmount * 0.2; // 20% TVA
  const total = taxableAmount + taxAmount;

  // Load quote data
  useEffect(() => {
    if (quote) {
      setFormData({
        companyId: quote.companyId,
        contactName: quote.contactName,
        contactEmail: quote.contactEmail,
        contactPhone: quote.contactPhone,
        type: quote.type,
        description: quote.description,
        location: quote.location,
        kitId: quote.kitId || '',
        items: quote.items,
        discount: quote.discount,
        discountType: quote.discountType,
        notes: quote.notes || '',
        expiryDate: new Date(quote.expiryDate).toISOString().split('T')[0]
      });
    }
  }, [quote]);

  // Load selected kit
  useEffect(() => {
    if (formData.kitId && materialKits.data) {
      const kit = materialKits.data.find(k => k.id === formData.kitId);
      if (kit) {
        setSelectedKit(kit);
      }
    }
  }, [formData.kitId, materialKits.data]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent as keyof typeof prev],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleKitSelect = (kit: MaterialKit) => {
    setSelectedKit(kit);
    setFormData(prev => ({
      ...prev,
      kitId: kit.id,
      items: kit.items.map(item => ({
        name: item.name,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice
      }))
    }));
  };

  const handleItemChange = (index: number, field: string, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        [field]: value
      };
      return { ...prev, items: newItems };
    });
  };

  const handleItemAdd = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        { name: '', description: '', quantity: 1, unitPrice: 0 }
      ]
    }));
  };

  const handleItemRemove = (index: number) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems.splice(index, 1);
      return { ...prev, items: newItems };
    });
  };

  const handleDiscountChange = (value: number) => {
    setFormData(prev => ({ ...prev, discount: value }));
  };

  const handleDiscountTypeChange = (type: 'percentage' | 'amount') => {
    setFormData(prev => ({ ...prev, discountType: type }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setIsSubmitting(true);
    try {
      await updateQuote.mutateAsync({
        id,
        data: formData
      });
      navigate(`/dashboard/quotes/${id}`);
    } catch (error) {
      console.error('Failed to update quote:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isQuoteLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900">Devis non trouvé</h2>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <button
              onClick={() => navigate(`/dashboard/quotes/${id}`)}
              className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">Modifier le devis</h1>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client Information */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Informations client</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Entreprise</label>
                    <select
                      name="companyId"
                      value={formData.companyId}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      <option value="">Sélectionnez une entreprise</option>
                      {companies.data?.map(company => (
                        <option key={company.id} value={company.id}>
                          {company.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Type d'installation</label>
                    <select
                      name="type"
                      value={formData.type}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    >
                      <option value="cold_storage">Froid commercial</option>
                      <option value="vmc">VMC</option>
                      <option value="other">Autre</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nom du contact</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        name="contactName"
                        value={formData.contactName}
                        onChange={handleInputChange}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email du contact</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="email"
                        name="contactEmail"
                        value={formData.contactEmail}
                        onChange={handleInputChange}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Téléphone du contact</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="tel"
                        name="contactPhone"
                        value={formData.contactPhone}
                        onChange={handleInputChange}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Date d'expiration</label>
                    <div className="mt-1 relative rounded-md shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleInputChange}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        required
                      />
                    </div>
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700">Adresse d'installation</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      name="location.address"
                      value={formData.location.address}
                      onChange={handleInputChange}
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Material Kit Selection */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Sélection du kit matériel</h2>
              </div>
              <div className="p-6">
                <MaterialKitSelector
                  kits={materialKits.data || []}
                  selectedKitId={formData.kitId}
                  onSelect={handleKitSelect}
                  isLoading={materialKits.isLoading}
                />
              </div>
            </div>

            {/* Quote Items */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Éléments du devis</h2>
              </div>
              <div className="p-6">
                <QuoteItemsTable
                  items={formData.items}
                  onItemChange={handleItemChange}
                  onItemAdd={handleItemAdd}
                  onItemRemove={handleItemRemove}
                />
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Notes</h2>
              </div>
              <div className="p-6">
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleInputChange}
                  rows={4}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Notes ou informations supplémentaires pour le client..."
                />
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quote Summary */}
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Récapitulatif</h2>
              </div>
              <div className="p-6">
                <QuoteSummary
                  subtotal={subtotal}
                  discount={formData.discount}
                  discountType={formData.discountType}
                  tax={taxAmount}
                  total={total}
                  onDiscountChange={handleDiscountChange}
                  onDiscountTypeChange={handleDiscountTypeChange}
                />
                
                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => navigate(`/dashboard/quotes/${id}`)}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>
              </div>
            </div>

            {/* Help */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-sm font-medium text-blue-800 mb-3">Informations</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li>
                  Sélectionnez un kit matériel pour pré-remplir les éléments du devis.
                </li>
                <li>
                  Vous pouvez ajouter, modifier ou supprimer des éléments manuellement.
                </li>
                <li>
                  La remise peut être appliquée en pourcentage ou en montant fixe.
                </li>
                <li>
                  La TVA est automatiquement calculée à 20%.
                </li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default QuoteEditPage;
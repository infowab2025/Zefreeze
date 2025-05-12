import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { 
  ArrowLeft, Save, Plus, Minus, Building, 
  Calendar, FileText, Receipt, Trash2 
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

interface Company {
  id: string;
  name: string;
  address: string;
  email?: string;
}

interface Intervention {
  id: string;
  reference: string;
  type: string;
  description: string;
  company_id: string;
  company?: {
    name: string;
  };
}

interface InvoiceFormData {
  customer_id: string;
  intervention_id?: string;
  due_date: string;
  items: Array<{
    description: string;
    quantity: number;
    unit_price: number;
  }>;
  notes?: string;
}

const InvoiceNewPage = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [filteredInterventions, setFilteredInterventions] = useState<Intervention[]>([]);
  const [selectedCompany, setSelectedCompany] = useState<string | null>(null);
  
  const { register, control, handleSubmit, watch, setValue, formState: { errors } } = useForm<InvoiceFormData>({
    defaultValues: {
      due_date: format(new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'), // 15 days from now
      items: [{ description: '', quantity: 1, unit_price: 0 }]
    }
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "items"
  });

  const watchedItems = watch('items');
  const watchedCustomerId = watch('customer_id');
  const watchedInterventionId = watch('intervention_id');
  
  // Calculate total
  const total = watchedItems.reduce((sum, item) => {
    return sum + (item.quantity * item.unit_price);
  }, 0);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        const { data, error } = await supabase
          .from('companies')
          .select('*')
          .order('name');
        
        if (error) throw error;
        setCompanies(data || []);
      } catch (error) {
        console.error('Error fetching companies:', error);
        toast.error('Erreur lors du chargement des entreprises');
      }
    };

    const fetchInterventions = async () => {
      try {
        const { data, error } = await supabase
          .from('interventions')
          .select(`
            id,
            type,
            description,
            company_id,
            company:company_id(name)
          `)
          .eq('status', 'completed')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setInterventions(data || []);
      } catch (error) {
        console.error('Error fetching interventions:', error);
        toast.error('Erreur lors du chargement des interventions');
      }
    };

    fetchCompanies();
    fetchInterventions();
  }, []);

  // Filter interventions when company changes
  useEffect(() => {
    if (watchedCustomerId) {
      setSelectedCompany(watchedCustomerId);
      const filtered = interventions.filter(
        intervention => intervention.company_id === watchedCustomerId
      );
      setFilteredInterventions(filtered);
      
      // Clear intervention selection if company changes
      if (watchedInterventionId) {
        const interventionExists = filtered.some(
          intervention => intervention.id === watchedInterventionId
        );
        if (!interventionExists) {
          setValue('intervention_id', '');
        }
      }
    } else {
      setFilteredInterventions([]);
    }
  }, [watchedCustomerId, interventions, watchedInterventionId, setValue]);

  // Pre-fill items when intervention is selected
  useEffect(() => {
    if (watchedInterventionId) {
      const intervention = interventions.find(i => i.id === watchedInterventionId);
      if (intervention) {
        // For demo purposes, we'll add some default items based on intervention type
        if (intervention.type === 'repair') {
          setValue('items', [
            { description: 'Main d\'œuvre technicien (4h)', quantity: 4, unit_price: 9000 },
            { description: 'Pièces de rechange', quantity: 1, unit_price: 42000 },
            { description: 'Frais de déplacement', quantity: 1, unit_price: 7000 }
          ]);
        } else if (intervention.type === 'maintenance') {
          setValue('items', [
            { description: 'Maintenance préventive', quantity: 1, unit_price: 35000 },
            { description: 'Frais de déplacement', quantity: 1, unit_price: 7000 }
          ]);
        } else if (intervention.type === 'installation') {
          setValue('items', [
            { description: 'Installation équipement', quantity: 1, unit_price: 85000 },
            { description: 'Main d\'œuvre technicien (8h)', quantity: 8, unit_price: 9000 },
            { description: 'Frais de déplacement', quantity: 1, unit_price: 7000 }
          ]);
        } else {
          setValue('items', [
            { description: 'Prestation standard', quantity: 1, unit_price: 35000 }
          ]);
        }
      }
    }
  }, [watchedInterventionId, interventions, setValue]);

  const onSubmit = async (data: InvoiceFormData) => {
    setIsSubmitting(true);
    try {
      // In a real app, this would create an invoice in the database
      console.log('Creating invoice:', data);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success('Facture créée avec succès');
      navigate('/dashboard/invoices');
    } catch (error) {
      console.error('Error creating invoice:', error);
      toast.error('Erreur lors de la création de la facture');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount / 100);
  };

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
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle facture</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Client and Intervention */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Informations générales</h2>
              </div>
              
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Client <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <select
                        {...register('customer_id', { required: 'Le client est requis' })}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      >
                        <option value="">Sélectionner un client</option>
                        {companies.map(company => (
                          <option key={company.id} value={company.id}>
                            {company.name}
                          </option>
                        ))}
                      </select>
                    </div>
                    {errors.customer_id && (
                      <p className="mt-1 text-sm text-red-600">{errors.customer_id.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Date d'échéance <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Calendar className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        type="date"
                        {...register('due_date', { required: 'La date d\'échéance est requise' })}
                        className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                      />
                    </div>
                    {errors.due_date && (
                      <p className="mt-1 text-sm text-red-600">{errors.due_date.message}</p>
                    )}
                  </div>
                </div>
                
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Intervention associée
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FileText className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      {...register('intervention_id')}
                      disabled={!selectedCompany}
                      className="pl-10 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:bg-gray-100 disabled:text-gray-500"
                    >
                      <option value="">Sélectionner une intervention (optionnel)</option>
                      {filteredInterventions.map(intervention => (
                        <option key={intervention.id} value={intervention.id}>
                          {intervention.id.substring(0, 8)} - {getInterventionType(intervention.type)} - {intervention.description.substring(0, 50)}...
                        </option>
                      ))}
                    </select>
                  </div>
                  {!selectedCompany && (
                    <p className="mt-1 text-sm text-gray-500">Sélectionnez d'abord un client</p>
                  )}
                </div>
              </div>
            </div>

            {/* Invoice Items */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Éléments de la facture</h2>
                <button
                  type="button"
                  onClick={() => append({ description: '', quantity: 1, unit_price: 0 })}
                  className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Ajouter un élément
                </button>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex items-start space-x-4">
                      <div className="flex-grow">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description
                        </label>
                        <input
                          type="text"
                          {...register(`items.${index}.description` as const, { 
                            required: 'La description est requise' 
                          })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                          placeholder="Description de l'élément"
                        />
                        {errors.items?.[index]?.description && (
                          <p className="mt-1 text-sm text-red-600">{errors.items[index]?.description?.message}</p>
                        )}
                      </div>
                      
                      <div className="w-24">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantité
                        </label>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          {...register(`items.${index}.quantity` as const, { 
                            required: 'Requis',
                            min: { value: 1, message: 'Min 1' },
                            valueAsNumber: true
                          })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.items?.[index]?.quantity && (
                          <p className="mt-1 text-sm text-red-600">{errors.items[index]?.quantity?.message}</p>
                        )}
                      </div>
                      
                      <div className="w-36">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prix unitaire (€)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          {...register(`items.${index}.unit_price` as const, { 
                            required: 'Requis',
                            min: { value: 0, message: 'Min 0' },
                            valueAsNumber: true
                          })}
                          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        />
                        {errors.items?.[index]?.unit_price && (
                          <p className="mt-1 text-sm text-red-600">{errors.items[index]?.unit_price?.message}</p>
                        )}
                      </div>
                      
                      <div className="w-36">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Total
                        </label>
                        <div className="h-10 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 flex items-center">
                          {formatCurrency((watchedItems[index]?.quantity || 0) * (watchedItems[index]?.unit_price || 0))}
                        </div>
                      </div>
                      
                      <div className="pt-8">
                        {fields.length > 1 && (
                          <button
                            type="button"
                            onClick={() => remove(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 flex justify-end">
                  <div className="w-64">
                    <div className="flex justify-between py-2 border-t border-gray-200">
                      <span className="text-sm font-medium text-gray-700">Sous-total HT</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(total)}</span>
                    </div>
                    <div className="flex justify-between py-2">
                      <span className="text-sm font-medium text-gray-700">TVA (20%)</span>
                      <span className="text-sm font-medium text-gray-900">{formatCurrency(total * 0.2)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-t border-gray-200">
                      <span className="text-base font-bold text-gray-900">Total TTC</span>
                      <span className="text-base font-bold text-blue-600">{formatCurrency(total * 1.2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Notes</h2>
              </div>
              
              <div className="p-6">
                <textarea
                  {...register('notes')}
                  rows={4}
                  className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  placeholder="Notes ou informations supplémentaires pour le client..."
                ></textarea>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Actions */}
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Actions</h2>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {isSubmitting ? 'Enregistrement...' : 'Enregistrer la facture'}
                  </button>
                  
                  <button
                    type="button"
                    onClick={() => navigate('/dashboard/invoices')}
                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Annuler
                  </button>
                </div>
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-sm font-medium text-blue-800 mb-3">Informations</h3>
              <ul className="space-y-2 text-sm text-blue-700">
                <li className="flex items-start">
                  <Receipt className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                  <span>Les factures sont automatiquement numérotées selon le format INV-YYYY-XXX.</span>
                </li>
                <li className="flex items-start">
                  <Calendar className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                  <span>La date d'échéance par défaut est fixée à 15 jours après la création.</span>
                </li>
                <li className="flex items-start">
                  <FileText className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                  <span>Vous pouvez associer une intervention existante pour pré-remplir les éléments de la facture.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
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

export default InvoiceNewPage;
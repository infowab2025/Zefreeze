import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ArrowLeft, Download, Edit, Send, Building, Calendar, FileText, Mail, Phone, MapPin, ThermometerSnowflake, Fan, Settings, CheckCircle, PenTool as Tool } from 'lucide-react';
import { useQuotes } from '../../hooks/useQuotes';
import QuoteItemsTable from '../../components/quotes/QuoteItemsTable';
import QuoteSummary from '../../components/quotes/QuoteSummary';

const QuoteDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getQuote, prepareQuote, sendQuote, createInstallation } = useQuotes();
  const { data: quote, isLoading } = getQuote(id || '');
  
  const [isPreparingQuote, setIsPreparingQuote] = useState(false);
  const [isSendingQuote, setIsSendingQuote] = useState(false);
  const [isCreatingInstallation, setIsCreatingInstallation] = useState(false);

  const handlePrepareQuote = async () => {
    if (!id) return;
    
    setIsPreparingQuote(true);
    try {
      await prepareQuote.mutateAsync(id);
      navigate('/dashboard/quotes/prepared');
    } catch (error) {
      console.error('Failed to prepare quote:', error);
    } finally {
      setIsPreparingQuote(false);
    }
  };

  const handleSendQuote = async () => {
    if (!id) return;
    
    if (window.confirm('Êtes-vous sûr de vouloir envoyer ce devis au client ?')) {
      setIsSendingQuote(true);
      try {
        await sendQuote.mutateAsync(id);
        navigate('/dashboard/quotes/validated');
      } catch (error) {
        console.error('Failed to send quote:', error);
      } finally {
        setIsSendingQuote(false);
      }
    }
  };

  const handleCreateInstallation = async () => {
    if (!id) return;
    
    if (window.confirm('Êtes-vous sûr de vouloir créer une installation à partir de ce devis ?')) {
      setIsCreatingInstallation(true);
      try {
        await createInstallation.mutateAsync(id);
        navigate('/dashboard/installations');
      } catch (error) {
        console.error('Failed to create installation:', error);
      } finally {
        setIsCreatingInstallation(false);
      }
    }
  };

  const getTypeIcon = () => {
    if (!quote) return null;
    
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
    if (!quote) return '';
    
    switch (quote.type) {
      case 'cold_storage':
        return 'Froid commercial';
      case 'vmc':
        return 'VMC';
      default:
        return 'Autre';
    }
  };

  const getStatusBadge = () => {
    if (!quote) return null;
    
    switch (quote.status) {
      case 'draft':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Brouillon</span>;
      case 'prepared':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Préparé</span>;
      case 'sent':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Envoyé</span>;
      case 'accepted':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Accepté</span>;
      case 'paid':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Payé</span>;
      case 'rejected':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Refusé</span>;
      case 'expired':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Expiré</span>;
      default:
        return null;
    }
  };

  if (isLoading) {
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
              onClick={() => navigate(-1)}
              className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Devis #{id?.substring(0, 8)}</h1>
              <p className="text-gray-600">
                Créé le {format(new Date(quote.createdAt), 'dd MMMM yyyy', { locale: fr })}
              </p>
            </div>
          </div>
          <div className="flex space-x-3">
            {quote.status === 'draft' && (
              <button
                onClick={handlePrepareQuote}
                disabled={isPreparingQuote}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
              >
                <FileText className="h-4 w-4 mr-2" />
                {isPreparingQuote ? 'Préparation...' : 'Préparer le devis'}
              </button>
            )}
            
            {quote.status === 'prepared' && (
              <button
                onClick={handleSendQuote}
                disabled={isSendingQuote}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                <Send className="h-4 w-4 mr-2" />
                {isSendingQuote ? 'Envoi en cours...' : 'Valider et envoyer'}
              </button>
            )}
            
            {quote.status === 'paid' && (
              <button
                onClick={handleCreateInstallation}
                disabled={isCreatingInstallation}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50"
              >
                <Tool className="h-4 w-4 mr-2" />
                {isCreatingInstallation ? 'Création...' : 'Créer une installation'}
              </button>
            )}
            
            {quote.status === 'draft' && (
              <Link
                to={`/dashboard/quotes/${id}/edit`}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Edit className="h-4 w-4 mr-2" />
                Modifier
              </Link>
            )}
            
            {quote.pdfUrl && (
              <a
                href={quote.pdfUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                <Download className="h-4 w-4 mr-2" />
                Télécharger PDF
              </a>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Quote Information */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-medium text-gray-900">Informations du devis</h2>
                {getStatusBadge()}
              </div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-500">Client</label>
                  <div className="mt-1 flex items-center">
                    <Building className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-gray-900">{quote.companyName}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Type</label>
                  <div className="mt-1 flex items-center">
                    {getTypeIcon()}
                    <p className="text-gray-900 ml-2">{getTypeName()}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Contact</label>
                  <div className="mt-1 flex items-center">
                    <Mail className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-gray-900">{quote.contactName} - {quote.contactEmail}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Téléphone</label>
                  <div className="mt-1 flex items-center">
                    <Phone className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-gray-900">{quote.contactPhone}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Adresse</label>
                  <div className="mt-1 flex items-center">
                    <MapPin className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-gray-900">{quote.location.address}</p>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-500">Date d'expiration</label>
                  <div className="mt-1 flex items-center">
                    <Calendar className="h-5 w-5 text-gray-400 mr-2" />
                    <p className="text-gray-900">
                      {format(new Date(quote.expiryDate), 'dd/MM/yyyy', { locale: fr })}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-500">Description</label>
                <p className="mt-1 text-gray-900">{quote.description}</p>
              </div>
              
              {quote.kitName && (
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-500">Kit matériel</label>
                  <p className="mt-1 text-gray-900">{quote.kitName}</p>
                </div>
              )}
            </div>
          </div>

          {/* Quote Items */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Éléments du devis</h2>
            </div>
            <div className="p-6">
              <QuoteItemsTable
                items={quote.items}
                onItemChange={() => {}}
                onItemAdd={() => {}}
                onItemRemove={() => {}}
                readOnly={true}
              />
            </div>
          </div>

          {/* Notes */}
          {quote.notes && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Notes</h2>
              </div>
              <div className="p-6">
                <p className="text-gray-900 whitespace-pre-line">{quote.notes}</p>
              </div>
            </div>
          )}
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
                subtotal={quote.subtotal}
                discount={quote.discount}
                discountType={quote.discountType}
                tax={quote.tax}
                total={quote.total}
                readOnly={true}
              />
            </div>
          </div>

          {/* Payment Status */}
          {quote.status === 'paid' && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-medium text-gray-900">Statut du paiement</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center mb-4">
                  <CheckCircle className="h-5 w-5 text-green-500 mr-2" />
                  <span className="font-medium text-green-700">Payé intégralement</span>
                </div>
                {quote.paidAt && (
                  <div className="text-sm text-gray-600">
                    Date de paiement: {format(new Date(quote.paidAt), 'dd/MM/yyyy', { locale: fr })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Quote Timeline */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-medium text-gray-900">Historique</h2>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                <div className="flex">
                  <div className="flex flex-col items-center mr-4">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="h-full border-l border-gray-200 ml-4"></div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Devis créé</p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(quote.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                    </p>
                  </div>
                </div>

                {quote.status !== 'draft' && (
                  <div className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div className="h-full border-l border-gray-200 ml-4"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Devis préparé</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(quote.updatedAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                )}

                {quote.sentAt && (
                  <div className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white">
                        <Send className="h-4 w-4" />
                      </div>
                      <div className="h-full border-l border-gray-200 ml-4"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Devis envoyé</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(quote.sentAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                )}

                {quote.acceptedAt && (
                  <div className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                      <div className="h-full border-l border-gray-200 ml-4"></div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Devis accepté</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(quote.acceptedAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                )}

                {quote.paidAt && (
                  <div className="flex">
                    <div className="flex flex-col items-center mr-4">
                      <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white">
                        <CheckCircle className="h-4 w-4" />
                      </div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">Devis payé</p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(quote.paidAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteDetailPage;
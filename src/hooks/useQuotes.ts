import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quoteService } from '../services/quoteService';
import { QuoteFormData } from '../types/quote';
import { toast } from 'react-hot-toast';

export const useQuotes = () => {
  const queryClient = useQueryClient();

  // Quote Requests
  const newRequests = useQuery({
    queryKey: ['quote-requests', 'new'],
    queryFn: quoteService.getNewRequests,
  });

  const getRequest = (id: string) => useQuery({
    queryKey: ['quote-requests', id],
    queryFn: () => quoteService.getRequestById(id),
    enabled: !!id,
  });

  const createRequest = useMutation({
    mutationFn: (data: Omit<any, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => 
      quoteService.createRequest(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-requests'] });
      toast.success('Demande de devis créée avec succès');
    },
    onError: (error) => {
      console.error('Failed to create quote request:', error);
      toast.error('Erreur lors de la création de la demande de devis');
    },
  });

  const confirmRequest = useMutation({
    mutationFn: (id: string) => quoteService.confirmRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-requests'] });
      queryClient.invalidateQueries({ queryKey: ['quotes', 'confirmed'] });
      toast.success('Demande de devis confirmée');
    },
    onError: (error) => {
      console.error('Failed to confirm quote request:', error);
      toast.error('Erreur lors de la confirmation de la demande');
    },
  });

  const rejectRequest = useMutation({
    mutationFn: (id: string) => quoteService.rejectRequest(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quote-requests'] });
      toast.success('Demande de devis refusée');
    },
    onError: (error) => {
      console.error('Failed to reject quote request:', error);
      toast.error('Erreur lors du refus de la demande');
    },
  });

  // Material Kits
  const materialKits = useQuery({
    queryKey: ['material-kits'],
    queryFn: quoteService.getMaterialKits,
  });

  const getMaterialKit = (id: string) => useQuery({
    queryKey: ['material-kits', id],
    queryFn: () => quoteService.getMaterialKitById(id),
    enabled: !!id,
  });

  // Quotes
  const confirmedQuotes = useQuery({
    queryKey: ['quotes', 'confirmed'],
    queryFn: quoteService.getConfirmedQuotes,
  });

  const preparedQuotes = useQuery({
    queryKey: ['quotes', 'prepared'],
    queryFn: quoteService.getPreparedQuotes,
  });

  const validatedQuotes = useQuery({
    queryKey: ['quotes', 'validated'],
    queryFn: quoteService.getValidatedQuotes,
  });

  const getQuote = (id: string) => useQuery({
    queryKey: ['quotes', id],
    queryFn: () => quoteService.getQuoteById(id),
    enabled: !!id,
  });

  const createQuote = useMutation({
    mutationFn: (data: QuoteFormData) => quoteService.createQuote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Devis créé avec succès');
    },
    onError: (error) => {
      console.error('Failed to create quote:', error);
      toast.error('Erreur lors de la création du devis');
    },
  });

  const updateQuote = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<QuoteFormData> }) => 
      quoteService.updateQuote(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Devis mis à jour avec succès');
    },
    onError: (error) => {
      console.error('Failed to update quote:', error);
      toast.error('Erreur lors de la mise à jour du devis');
    },
  });

  const prepareQuote = useMutation({
    mutationFn: (id: string) => quoteService.prepareQuote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Devis préparé avec succès');
    },
    onError: (error) => {
      console.error('Failed to prepare quote:', error);
      toast.error('Erreur lors de la préparation du devis');
    },
  });

  const sendQuote = useMutation({
    mutationFn: (id: string) => quoteService.sendQuote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      toast.success('Devis envoyé avec succès');
    },
    onError: (error) => {
      console.error('Failed to send quote:', error);
      toast.error('Erreur lors de l\'envoi du devis');
    },
  });

  const createInstallation = useMutation({
    mutationFn: (quoteId: string) => quoteService.createInstallation(quoteId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotes'] });
      queryClient.invalidateQueries({ queryKey: ['installations'] });
      toast.success('Installation créée avec succès');
    },
    onError: (error) => {
      console.error('Failed to create installation:', error);
      toast.error('Erreur lors de la création de l\'installation');
    },
  });

  return {
    // Quote Requests
    newRequests,
    getRequest,
    createRequest,
    confirmRequest,
    rejectRequest,
    
    // Material Kits
    materialKits,
    getMaterialKit,
    
    // Quotes
    confirmedQuotes,
    preparedQuotes,
    validatedQuotes,
    getQuote,
    createQuote,
    updateQuote,
    prepareQuote,
    sendQuote,
    createInstallation,
  };
};
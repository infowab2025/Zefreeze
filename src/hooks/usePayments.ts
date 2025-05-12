import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paymentService } from '../services/paymentService';
import { toast } from 'react-hot-toast';

export const usePayments = () => {
  const queryClient = useQueryClient();

  const invoices = useQuery({
    queryKey: ['invoices'],
    queryFn: paymentService.getAllInvoices,
  });

  const getInvoice = (id: string) => useQuery({
    queryKey: ['invoices', id],
    queryFn: () => paymentService.getInvoiceById(id),
    enabled: !!id,
  });

  const createPaymentIntent = useMutation({
    mutationFn: (invoiceId: string) => paymentService.createPaymentIntent(invoiceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: () => {
      toast.error('Erreur lors de la création du paiement');
    },
  });

  const downloadInvoicePdf = useMutation({
    mutationFn: (id: string) => paymentService.downloadInvoicePdf(id),
    onSuccess: (data) => {
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `invoice-${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
    onError: () => {
      toast.error('Erreur lors du téléchargement de la facture');
    },
  });

  return {
    invoices,
    getInvoice,
    createPaymentIntent,
    downloadInvoicePdf,
  };
};
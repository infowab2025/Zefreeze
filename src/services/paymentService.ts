import { api } from '../lib/axios';
import { PaymentIntent, Invoice } from '../types/payment';
import { supabase } from '../lib/supabase';

export const paymentService = {
  createPaymentIntent: async (invoiceId: string) => {
    try {
      // In a real app, this would call a Stripe endpoint
      // For now, we'll simulate the API call
      const { data, error } = await supabase.functions.invoke('create-payment-intent', {
        body: { invoiceId }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw error;
    }
  },

  getAllInvoices: async () => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:company_id(id, name, email)
        `)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      // Return mock data for demo
      return [
        {
          id: '1',
          number: 'INV-2025-001',
          amount: 45000, // 450.00 €
          currency: 'EUR',
          status: 'paid',
          customer: {
            id: '1',
            name: 'Restaurant Le Provençal',
            email: 'contact@leprovencal.fr'
          },
          created_at: '2025-04-01T10:00:00Z',
          due_date: '2025-04-15T10:00:00Z',
          paid_at: '2025-04-10T14:30:00Z'
        },
        {
          id: '2',
          number: 'INV-2025-002',
          amount: 85000, // 850.00 €
          currency: 'EUR',
          status: 'pending',
          customer: {
            id: '2',
            name: 'Supermarché FraisMart',
            email: 'contact@fraismart.fr'
          },
          created_at: '2025-04-05T11:30:00Z',
          due_date: '2025-04-20T11:30:00Z'
        }
      ];
    }
  },

  getInvoiceById: async (id: string) => {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customer:company_id(id, name, email, address),
          intervention:intervention_id(id, reference, type, description)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      // Return mock data for demo
      return {
        id,
        number: `INV-2025-00${id}`,
        amount: 45000, // 450.00 €
        currency: 'EUR',
        status: 'pending',
        customer: {
          id: '1',
          name: 'Restaurant Le Provençal',
          email: 'contact@leprovencal.fr',
          address: '123 Rue de Paris, 75001 Paris'
        },
        intervention: {
          id: '1',
          reference: 'INT-2025-001',
          type: 'maintenance',
          description: 'Maintenance trimestrielle du système de réfrigération'
        },
        created_at: '2025-04-01T10:00:00Z',
        due_date: '2025-04-15T10:00:00Z',
        items: [
          {
            id: '1',
            description: 'Maintenance préventive',
            quantity: 1,
            unit_price: 35000, // 350.00 €
            total: 35000 // 350.00 €
          },
          {
            id: '2',
            description: 'Remplacement filtre',
            quantity: 1,
            unit_price: 3000, // 30.00 €
            total: 3000 // 30.00 €
          },
          {
            id: '3',
            description: 'Frais de déplacement',
            quantity: 1,
            unit_price: 7000, // 70.00 €
            total: 7000 // 70.00 €
          }
        ]
      };
    }
  },

  downloadInvoicePdf: async (id: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('generate-invoice-pdf', {
        body: { invoiceId: id }
      });
      
      if (error) throw error;
      
      // In a real app, this would return a blob
      // For now, we'll simulate it
      const content = `Invoice ID: ${id}\nGenerated on: ${new Date().toISOString()}\n\nThis is a simulated PDF invoice.`;
      return new Blob([content], { type: 'application/pdf' });
    } catch (error) {
      console.error('Error downloading invoice PDF:', error);
      // Simulate a PDF for demo
      const content = `Invoice ID: ${id}\nGenerated on: ${new Date().toISOString()}\n\nThis is a simulated PDF invoice.`;
      return new Blob([content], { type: 'application/pdf' });
    }
  },
  
  processPayment: async (invoiceId: string, paymentMethod: string) => {
    try {
      // In a real app, this would call a Stripe endpoint
      // For now, we'll simulate the API call
      const { data, error } = await supabase.functions.invoke('process-payment', {
        body: { 
          invoiceId,
          paymentMethod
        }
      });
      
      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error processing payment:', error);
      // Return mock data for demo
      return {
        success: true,
        transaction_id: `tx_${Math.random().toString(36).substring(2, 10)}`,
        amount: 45000,
        status: 'completed'
      };
    }
  }
};
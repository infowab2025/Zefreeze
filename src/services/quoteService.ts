import { supabase } from '../lib/supabase';
import { QuoteRequest, Quote, QuoteFormData, MaterialKit } from '../types/quote';
import { toast } from 'react-hot-toast';

export const quoteService = {
  // Quote Requests
  getNewRequests: async (): Promise<QuoteRequest[]> => {
    try {
      const { data, error } = await supabase
        .from('quote_requests')
        .select(`
          *,
          company:company_id(id, name)
        `)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      // Transform data to match the expected format
      return data.map(request => ({
        id: request.id,
        companyId: request.company_id,
        companyName: request.company?.name || 'Entreprise inconnue',
        contactName: request.contact_name,
        contactEmail: request.contact_email,
        contactPhone: request.contact_phone,
        type: request.type,
        description: request.description,
        location: request.location,
        preferredDate: request.preferred_date,
        status: request.status,
        createdAt: request.created_at,
        updatedAt: request.updated_at
      }));
    } catch (error) {
      console.error('Error fetching new quote requests:', error);
      return [];
    }
  },

  getRequestById: async (id: string): Promise<QuoteRequest | null> => {
    try {
      const { data, error } = await supabase
        .from('quote_requests')
        .select(`
          *,
          company:company_id(id, name)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        companyId: data.company_id,
        companyName: data.company?.name || 'Entreprise inconnue',
        contactName: data.contact_name,
        contactEmail: data.contact_email,
        contactPhone: data.contact_phone,
        type: data.type,
        description: data.description,
        location: data.location,
        preferredDate: data.preferred_date,
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error(`Error fetching quote request with id ${id}:`, error);
      return null;
    }
  },

  createRequest: async (data: Omit<QuoteRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>): Promise<QuoteRequest> => {
    try {
      const { data: result, error } = await supabase
        .from('quote_requests')
        .insert({
          company_id: data.companyId,
          contact_name: data.contactName,
          contact_email: data.contactEmail,
          contact_phone: data.contactPhone,
          type: data.type,
          description: data.description,
          location: data.location,
          preferred_date: data.preferredDate,
          status: 'pending'
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: result.id,
        companyId: result.company_id,
        companyName: '', // This will be filled by the frontend
        contactName: result.contact_name,
        contactEmail: result.contact_email,
        contactPhone: result.contact_phone,
        type: result.type,
        description: result.description,
        location: result.location,
        preferredDate: result.preferred_date,
        status: result.status,
        createdAt: result.created_at,
        updatedAt: result.updated_at
      };
    } catch (error) {
      console.error('Error creating quote request:', error);
      throw error;
    }
  },

  confirmRequest: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('quote_requests')
        .update({ status: 'confirmed', updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error(`Error confirming quote request with id ${id}:`, error);
      throw error;
    }
  },

  rejectRequest: async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('quote_requests')
        .update({ status: 'rejected', updated_at: new Date().toISOString() })
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error(`Error rejecting quote request with id ${id}:`, error);
      throw error;
    }
  },

  // Material Kits
  getMaterialKits: async (): Promise<MaterialKit[]> => {
    try {
      const { data, error } = await supabase
        .from('material_kits')
        .select('*')
        .order('name');
      
      if (error) throw error;
      
      return data as MaterialKit[];
    } catch (error) {
      console.error('Error fetching material kits:', error);
      return [];
    }
  },

  getMaterialKitById: async (id: string): Promise<MaterialKit | null> => {
    try {
      const { data, error } = await supabase
        .from('material_kits')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return data as MaterialKit;
    } catch (error) {
      console.error(`Error fetching material kit with id ${id}:`, error);
      return null;
    }
  },

  // Quotes
  getConfirmedQuotes: async (): Promise<Quote[]> => {
    try {
      // Get confirmed requests that don't have quotes yet
      const { data: requests, error: requestsError } = await supabase
        .from('quote_requests')
        .select(`
          *,
          company:company_id(id, name)
        `)
        .eq('status', 'confirmed')
        .order('updated_at', { ascending: false });
      
      if (requestsError) throw requestsError;
      
      // Get quotes in draft status
      const { data: quotes, error: quotesError } = await supabase
        .from('quotes')
        .select(`
          *,
          company:company_id(id, name)
        `)
        .eq('status', 'draft')
        .order('updated_at', { ascending: false });
      
      if (quotesError) throw quotesError;
      
      // Combine and transform data
      const confirmedRequests = requests.map(request => ({
        id: request.id,
        requestId: request.id,
        companyId: request.company_id,
        companyName: request.company?.name || 'Entreprise inconnue',
        contactName: request.contact_name,
        contactEmail: request.contact_email,
        contactPhone: request.contact_phone,
        type: request.type,
        description: request.description,
        location: request.location,
        items: [],
        subtotal: 0,
        discount: 0,
        discountType: 'percentage' as const,
        tax: 0,
        total: 0,
        status: 'draft' as const,
        expiryDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
        createdAt: request.created_at,
        updatedAt: request.updated_at
      }));
      
      const draftQuotes = quotes.map(quote => ({
        id: quote.id,
        requestId: quote.request_id,
        companyId: quote.company_id,
        companyName: quote.company?.name || 'Entreprise inconnue',
        contactName: quote.contact_name,
        contactEmail: quote.contact_email,
        contactPhone: quote.contact_phone,
        type: quote.type,
        description: quote.description,
        location: quote.location,
        kitId: quote.kit_id,
        kitName: quote.kit_name,
        items: quote.items,
        subtotal: quote.subtotal,
        discount: quote.discount,
        discountType: quote.discount_type,
        tax: quote.tax,
        total: quote.total,
        status: quote.status,
        paymentStatus: quote.payment_status,
        depositAmount: quote.deposit_amount,
        depositPaid: quote.deposit_paid,
        expiryDate: quote.expiry_date,
        notes: quote.notes,
        termsAccepted: quote.terms_accepted,
        pdfUrl: quote.pdf_url,
        createdAt: quote.created_at,
        updatedAt: quote.updated_at,
        sentAt: quote.sent_at,
        acceptedAt: quote.accepted_at,
        paidAt: quote.paid_at
      }));
      
      return [...confirmedRequests, ...draftQuotes];
    } catch (error) {
      console.error('Error fetching confirmed quotes:', error);
      return [];
    }
  },

  getPreparedQuotes: async (): Promise<Quote[]> => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          company:company_id(id, name)
        `)
        .eq('status', 'prepared')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(quote => ({
        id: quote.id,
        requestId: quote.request_id,
        companyId: quote.company_id,
        companyName: quote.company?.name || 'Entreprise inconnue',
        contactName: quote.contact_name,
        contactEmail: quote.contact_email,
        contactPhone: quote.contact_phone,
        type: quote.type,
        description: quote.description,
        location: quote.location,
        kitId: quote.kit_id,
        kitName: quote.kit_name,
        items: quote.items,
        subtotal: quote.subtotal,
        discount: quote.discount,
        discountType: quote.discount_type,
        tax: quote.tax,
        total: quote.total,
        status: quote.status,
        paymentStatus: quote.payment_status,
        depositAmount: quote.deposit_amount,
        depositPaid: quote.deposit_paid,
        expiryDate: quote.expiry_date,
        notes: quote.notes,
        termsAccepted: quote.terms_accepted,
        pdfUrl: quote.pdf_url,
        createdAt: quote.created_at,
        updatedAt: quote.updated_at,
        sentAt: quote.sent_at,
        acceptedAt: quote.accepted_at,
        paidAt: quote.paid_at
      }));
    } catch (error) {
      console.error('Error fetching prepared quotes:', error);
      return [];
    }
  },

  getValidatedQuotes: async (): Promise<Quote[]> => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          company:company_id(id, name)
        `)
        .in('status', ['sent', 'accepted', 'paid'])
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      return data.map(quote => ({
        id: quote.id,
        requestId: quote.request_id,
        companyId: quote.company_id,
        companyName: quote.company?.name || 'Entreprise inconnue',
        contactName: quote.contact_name,
        contactEmail: quote.contact_email,
        contactPhone: quote.contact_phone,
        type: quote.type,
        description: quote.description,
        location: quote.location,
        kitId: quote.kit_id,
        kitName: quote.kit_name,
        items: quote.items,
        subtotal: quote.subtotal,
        discount: quote.discount,
        discountType: quote.discount_type,
        tax: quote.tax,
        total: quote.total,
        status: quote.status,
        paymentStatus: quote.payment_status,
        depositAmount: quote.deposit_amount,
        depositPaid: quote.deposit_paid,
        expiryDate: quote.expiry_date,
        notes: quote.notes,
        termsAccepted: quote.terms_accepted,
        pdfUrl: quote.pdf_url,
        createdAt: quote.created_at,
        updatedAt: quote.updated_at,
        sentAt: quote.sent_at,
        acceptedAt: quote.accepted_at,
        paidAt: quote.paid_at
      }));
    } catch (error) {
      console.error('Error fetching validated quotes:', error);
      return [];
    }
  },

  getQuoteById: async (id: string): Promise<Quote | null> => {
    try {
      const { data, error } = await supabase
        .from('quotes')
        .select(`
          *,
          company:company_id(id, name)
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      return {
        id: data.id,
        requestId: data.request_id,
        companyId: data.company_id,
        companyName: data.company?.name || 'Entreprise inconnue',
        contactName: data.contact_name,
        contactEmail: data.contact_email,
        contactPhone: data.contact_phone,
        type: data.type,
        description: data.description,
        location: data.location,
        kitId: data.kit_id,
        kitName: data.kit_name,
        items: data.items,
        subtotal: data.subtotal,
        discount: data.discount,
        discountType: data.discount_type,
        tax: data.tax,
        total: data.total,
        status: data.status,
        paymentStatus: data.payment_status,
        depositAmount: data.deposit_amount,
        depositPaid: data.deposit_paid,
        expiryDate: data.expiry_date,
        notes: data.notes,
        termsAccepted: data.terms_accepted,
        pdfUrl: data.pdf_url,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        sentAt: data.sent_at,
        acceptedAt: data.accepted_at,
        paidAt: data.paid_at
      };
    } catch (error) {
      console.error(`Error fetching quote with id ${id}:`, error);
      return null;
    }
  },

  createQuote: async (data: QuoteFormData): Promise<Quote> => {
    try {
      // Calculate totals
      const subtotal = data.items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
      let discountAmount = 0;
      
      if (data.discountType === 'percentage') {
        discountAmount = subtotal * (data.discount / 100);
      } else {
        discountAmount = data.discount;
      }
      
      const taxableAmount = subtotal - discountAmount;
      const taxAmount = taxableAmount * 0.2; // 20% TVA
      const total = taxableAmount + taxAmount;

      const { data: result, error } = await supabase
        .from('quotes')
        .insert({
          request_id: data.requestId,
          company_id: data.companyId,
          contact_name: data.contactName,
          contact_email: data.contactEmail,
          contact_phone: data.contactPhone,
          type: data.type,
          description: data.description,
          location: data.location,
          kit_id: data.kitId,
          items: data.items,
          subtotal,
          discount: data.discount,
          discount_type: data.discountType,
          tax: taxAmount,
          total,
          status: 'draft',
          expiry_date: data.expiryDate,
          notes: data.notes
        })
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: result.id,
        requestId: result.request_id,
        companyId: result.company_id,
        companyName: '', // This will be filled by the frontend
        contactName: result.contact_name,
        contactEmail: result.contact_email,
        contactPhone: result.contact_phone,
        type: result.type,
        description: result.description,
        location: result.location,
        kitId: result.kit_id,
        items: result.items,
        subtotal: result.subtotal,
        discount: result.discount,
        discountType: result.discount_type,
        tax: result.tax,
        total: result.total,
        status: result.status,
        expiryDate: result.expiry_date,
        notes: result.notes,
        createdAt: result.created_at,
        updatedAt: result.updated_at
      };
    } catch (error) {
      console.error('Error creating quote:', error);
      throw error;
    }
  },

  updateQuote: async (id: string, data: Partial<QuoteFormData>): Promise<Quote> => {
    try {
      // Get current quote
      const { data: currentQuote, error: fetchError } = await supabase
        .from('quotes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (fetchError) throw fetchError;
      
      // Calculate new totals if items or discount changed
      let updateData: any = { ...data };
      
      if (data.items || data.discount !== undefined || data.discountType) {
        const items = data.items || currentQuote.items;
        const discount = data.discount !== undefined ? data.discount : currentQuote.discount;
        const discountType = data.discountType || currentQuote.discount_type;
        
        const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
        let discountAmount = 0;
        
        if (discountType === 'percentage') {
          discountAmount = subtotal * (discount / 100);
        } else {
          discountAmount = discount;
        }
        
        const taxableAmount = subtotal - discountAmount;
        const taxAmount = taxableAmount * 0.2; // 20% TVA
        const total = taxableAmount + taxAmount;
        
        updateData = {
          ...updateData,
          subtotal,
          tax: taxAmount,
          total
        };
      }
      
      // Update quote
      const { data: result, error } = await supabase
        .from('quotes')
        .update({
          ...updateData,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      return {
        id: result.id,
        requestId: result.request_id,
        companyId: result.company_id,
        companyName: '', // This will be filled by the frontend
        contactName: result.contact_name,
        contactEmail: result.contact_email,
        contactPhone: result.contact_phone,
        type: result.type,
        description: result.description,
        location: result.location,
        kitId: result.kit_id,
        kitName: result.kit_name,
        items: result.items,
        subtotal: result.subtotal,
        discount: result.discount,
        discountType: result.discount_type,
        tax: result.tax,
        total: result.total,
        status: result.status,
        paymentStatus: result.payment_status,
        depositAmount: result.deposit_amount,
        depositPaid: result.deposit_paid,
        expiryDate: result.expiry_date,
        notes: result.notes,
        termsAccepted: result.terms_accepted,
        pdfUrl: result.pdf_url,
        createdAt: result.created_at,
        updatedAt: result.updated_at,
        sentAt: result.sent_at,
        acceptedAt: result.accepted_at,
        paidAt: result.paid_at
      };
    } catch (error) {
      console.error(`Error updating quote with id ${id}:`, error);
      throw error;
    }
  },

  prepareQuote: async (id: string): Promise<void> => {
    try {
      // Update quote status to prepared
      const { error } = await supabase
        .from('quotes')
        .update({ 
          status: 'prepared', 
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Generate PDF (in a real app, this would call a serverless function)
      await generateQuotePdf(id);
    } catch (error) {
      console.error(`Error preparing quote with id ${id}:`, error);
      throw error;
    }
  },

  sendQuote: async (id: string): Promise<void> => {
    try {
      // Update quote status to sent
      const { error } = await supabase
        .from('quotes')
        .update({ 
          status: 'sent', 
          sent_at: new Date().toISOString(),
          updated_at: new Date().toISOString() 
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // In a real app, this would send an email with the quote PDF
      toast.success('Devis envoyé avec succès');
    } catch (error) {
      console.error(`Error sending quote with id ${id}:`, error);
      throw error;
    }
  },

  createInstallation: async (quoteId: string): Promise<string> => {
    try {
      // In a real app, this would create an installation record
      // For now, we'll just return a mock installation ID
      return `INST-${Date.now()}`;
    } catch (error) {
      console.error(`Error creating installation from quote ${quoteId}:`, error);
      throw error;
    }
  }
};

// Helper function to generate PDF
const generateQuotePdf = async (id: string): Promise<void> => {
  try {
    // In a real app, this would generate a PDF using a library
    // For now, we'll just update the quote with a mock PDF URL
    const pdfUrl = `https://example.com/quotes/${id}.pdf`;
    
    const { error } = await supabase
      .from('quotes')
      .update({ pdf_url: pdfUrl })
      .eq('id', id);
    
    if (error) throw error;
  } catch (error) {
    console.error(`Error generating PDF for quote ${id}:`, error);
    throw error;
  }
};
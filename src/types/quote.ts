export interface QuoteRequest {
  id: string;
  companyId: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  type: 'cold_storage' | 'vmc' | 'other';
  description: string;
  location: {
    address: string;
    additionalInfo?: string;
  };
  preferredDate?: string;
  status: 'pending' | 'confirmed' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface MaterialKit {
  id: string;
  name: string;
  type: 'cold_storage' | 'vmc' | 'other';
  description: string;
  basePrice: number;
  items: {
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
}

export interface Quote {
  id: string;
  requestId: string;
  companyId: string;
  companyName: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  type: 'cold_storage' | 'vmc' | 'other';
  description: string;
  location: {
    address: string;
    additionalInfo?: string;
  };
  kitId?: string;
  kitName?: string;
  items: {
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  }[];
  subtotal: number;
  discount: number;
  discountType: 'percentage' | 'amount';
  tax: number;
  total: number;
  status: 'draft' | 'prepared' | 'sent' | 'accepted' | 'paid' | 'rejected' | 'expired';
  paymentStatus?: 'unpaid' | 'partial' | 'paid';
  depositAmount?: number;
  depositPaid?: boolean;
  expiryDate: string;
  notes?: string;
  termsAccepted?: boolean;
  pdfUrl?: string;
  createdAt: string;
  updatedAt: string;
  sentAt?: string;
  acceptedAt?: string;
  paidAt?: string;
}

export interface QuoteFormData {
  requestId?: string;
  companyId: string;
  contactName: string;
  contactEmail: string;
  contactPhone: string;
  type: 'cold_storage' | 'vmc' | 'other';
  description: string;
  location: {
    address: string;
    additionalInfo?: string;
  };
  kitId?: string;
  items: {
    name: string;
    description: string;
    quantity: number;
    unitPrice: number;
  }[];
  discount: number;
  discountType: 'percentage' | 'amount';
  notes?: string;
  expiryDate: string;
}
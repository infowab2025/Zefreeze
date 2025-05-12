import axios from 'axios';
import { toast } from 'react-hot-toast';
import { supabase } from './supabase';

// Create axios instance with the correct API base URL
export const api = axios.create({
  baseURL: `${import.meta.env.VITE_SUPABASE_URL}/rest/v1`,
  headers: {
    'Content-Type': 'application/json',
    'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
    'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
  },
});

// Request interceptor for adding auth token
api.interceptors.request.use(async (config) => {
  // Get the current session
  const { data: { session } } = await supabase.auth.getSession();
  
  // If we have a session, use the session's access token instead of the anon key
  if (session) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  
  return config;
});

// Response interceptor - handle errors with toast notifications
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || 
                    error?.message || 
                    'An unexpected error occurred';
    
    // Log detailed error information for debugging
    console.error('API Error:', {
      message,
      status: error?.response?.status,
      data: error?.response?.data,
      config: error?.config
    });

    // Show user-friendly error message
    toast.error(message);

    return Promise.reject(error);
  }
);
import { supabase } from '../lib/supabase';
import { User, UserFormData } from '../types/user';

export const userService = {
  getAll: async () => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data;
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw error;
    }

    return data;
  },

  create: async (data: UserFormData) => {
    // Create the user through the edge function
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-user`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`,
      },
      body: JSON.stringify(data),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to create user');
    }

    return response.json();
  },

  update: async (id: string, data: Partial<UserFormData>) => {
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(data)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return updatedUser;
  },

  delete: async (id: string) => {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  },

  updateStatus: async (id: string, active: boolean) => {
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({ active })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return updatedUser;
  },

  resetPassword: async (email: string) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);

    if (error) {
      throw error;
    }

    return { success: true };
  }
};
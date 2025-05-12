import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { Mail, Send, User, Search, Plus, ArrowLeft, Paperclip, Trash2, RefreshCw } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface Message {
  id: string;
  sender_id: string;
  recipient_id: string;
  subject: string;
  content: string;
  intervention_id?: string;
  read: boolean;
  created_at: string;
  sender?: {
    name: string;
    email: string;
  };
  recipient?: {
    name: string;
    email: string;
  };
}

interface MessageFormData {
  recipientId: string;
  subject: string;
  content: string;
  interventionId?: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const MessagingPage = () => {
  const { user: currentUser } = useAuth();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [showNewMessage, setShowNewMessage] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<'inbox' | 'sent' | 'all'>('inbox');
  const queryClient = useQueryClient();
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<MessageFormData>();

  // Fetch messages
  const { data: messages, isLoading, refetch } = useQuery({
    queryKey: ['messages'],
    queryFn: async () => {
      try {
        let query = supabase
          .from('messages')
          .select(`
            *,
            sender:sender_id(name, email),
            recipient:recipient_id(name, email)
          `);

        if (selectedFolder === 'inbox') {
          query = query.eq('recipient_id', currentUser?.id);
        } else if (selectedFolder === 'sent') {
          query = query.eq('sender_id', currentUser?.id);
        } else {
          query = query.or(`sender_id.eq.${currentUser?.id},recipient_id.eq.${currentUser?.id}`);
        }

        const { data, error } = await query.order('created_at', { ascending: false });
        
        if (error) throw error;
        return data as Message[];
      } catch (error) {
        console.error('Error fetching messages:', error);
        toast.error('Erreur lors du chargement des messages');
        return [];
      }
    },
    enabled: !!currentUser?.id,
  });

  // Fetch users for recipient dropdown
  const { data: users } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('users')
          .select('id, name, email, role')
          .neq('id', currentUser?.id)
          .eq('active', true);
        
        if (error) throw error;
        return data as User[];
      } catch (error) {
        console.error('Error fetching users:', error);
        return [];
      }
    },
    enabled: !!currentUser?.id,
  });

  // Mark message as read
  const markAsRead = useMutation({
    mutationFn: async (messageId: string) => {
      const { error } = await supabase
        .from('messages')
        .update({ read: true })
        .eq('id', messageId);
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
    },
  });

  // Send message
  const sendMessage = useMutation({
    mutationFn: async (data: MessageFormData) => {
      const { error } = await supabase
        .from('messages')
        .insert({
          sender_id: currentUser?.id,
          recipient_id: data.recipientId,
          subject: data.subject,
          content: data.content,
          intervention_id: data.interventionId,
          read: false,
        });
      
      if (error) throw error;
      return { success: true };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['messages'] });
      toast.success('Message envoyé avec succès');
      reset();
      setShowNewMessage(false);
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error('Erreur lors de l\'envoi du message');
    },
  });

  // Handle message selection
  const handleMessageClick = async (message: Message) => {
    setSelectedMessage(message);
    setShowNewMessage(false);
    
    // Mark as read if it's an incoming message and not read yet
    if (message.recipient_id === currentUser?.id && !message.read) {
      markAsRead.mutate(message.id);
    }
  };

  // Handle new message
  const handleNewMessage = () => {
    setSelectedMessage(null);
    setShowNewMessage(true);
  };

  // Handle message submission
  const onSubmit = (data: MessageFormData) => {
    sendMessage.mutate(data);
  };

  // Handle reply to message
  const handleReply = () => {
    if (!selectedMessage) return;
    
    setShowNewMessage(true);
    setSelectedMessage(null);
    
    // Pre-fill the form with reply information
    reset({
      recipientId: selectedMessage.sender_id,
      subject: `Re: ${selectedMessage.subject}`,
      content: `\n\n-------- Message original --------\nDe: ${selectedMessage.sender?.name}\nDate: ${format(new Date(selectedMessage.created_at), 'dd/MM/yyyy HH:mm')}\nObjet: ${selectedMessage.subject}\n\n${selectedMessage.content}`
    });
  };

  // Filter messages based on search term
  const filteredMessages = messages?.filter(message => {
    const searchLower = searchTerm.toLowerCase();
    return (
      message.subject.toLowerCase().includes(searchLower) ||
      message.content.toLowerCase().includes(searchLower) ||
      message.sender?.name.toLowerCase().includes(searchLower) ||
      message.sender?.email.toLowerCase().includes(searchLower) ||
      message.recipient?.name.toLowerCase().includes(searchLower) ||
      message.recipient?.email.toLowerCase().includes(searchLower)
    );
  });

  // Count unread messages
  const unreadCount = messages?.filter(m => m.recipient_id === currentUser?.id && !m.read).length || 0;

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Sidebar */}
      <div className="w-64 border-r bg-white flex flex-col">
        <div className="p-4 border-b">
          <button
            onClick={handleNewMessage}
            className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nouveau message
          </button>
        </div>
        
        <div className="p-4 space-y-2">
          <button
            onClick={() => setSelectedFolder('inbox')}
            className={`w-full flex items-center justify-between px-3 py-2 text-sm rounded-md ${
              selectedFolder === 'inbox' ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <div className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              <span>Boîte de réception</span>
            </div>
            {unreadCount > 0 && (
              <span className="bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>
          
          <button
            onClick={() => setSelectedFolder('sent')}
            className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
              selectedFolder === 'sent' ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Send className="h-4 w-4 mr-2" />
            <span>Messages envoyés</span>
          </button>
          
          <button
            onClick={() => setSelectedFolder('all')}
            className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
              selectedFolder === 'all' ? 'bg-blue-100 text-blue-800' : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <Mail className="h-4 w-4 mr-2" />
            <span>Tous les messages</span>
          </button>
        </div>
        
        <div className="mt-auto p-4 border-t">
          <button
            onClick={() => refetch()}
            className="w-full flex items-center justify-center px-3 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </button>
        </div>
      </div>

      {/* Messages List */}
      <div className="w-1/3 border-r bg-white overflow-hidden flex flex-col">
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher des messages..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
        
        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredMessages && filteredMessages.length > 0 ? (
            filteredMessages.map((message) => (
              <div
                key={message.id}
                onClick={() => handleMessageClick(message)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${
                  selectedMessage?.id === message.id ? 'bg-blue-50' : ''
                } ${message.recipient_id === currentUser?.id && !message.read ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-gray-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">
                        {message.sender_id === currentUser?.id ? message.recipient?.name : message.sender?.name}
                      </p>
                      <p className="text-xs text-gray-500">{format(new Date(message.created_at), 'dd/MM/yyyy HH:mm')}</p>
                    </div>
                  </div>
                  {message.recipient_id === currentUser?.id && !message.read && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Nouveau
                    </span>
                  )}
                </div>
                <h3 className="text-sm font-medium text-gray-900 mb-1">{message.subject}</h3>
                <p className="text-sm text-gray-600 truncate">{message.content}</p>
              </div>
            ))
          ) : (
            <div className="p-4 text-center text-gray-500">
              {searchTerm ? 'Aucun message ne correspond à votre recherche' : 'Aucun message dans ce dossier'}
            </div>
          )}
        </div>
      </div>

      {/* Message Content / New Message Form */}
      <div className="flex-1 bg-gray-50 flex flex-col">
        {selectedMessage ? (
          <div className="flex flex-col h-full">
            <div className="bg-white border-b p-4 flex items-center justify-between">
              <div className="flex items-center">
                <button
                  onClick={() => setSelectedMessage(null)}
                  className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
                >
                  <ArrowLeft className="h-5 w-5" />
                </button>
                <h2 className="text-xl font-bold text-gray-900">{selectedMessage.subject}</h2>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={handleReply}
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Répondre
                </button>
                <button
                  className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50"
                >
                  Transférer
                </button>
                <button
                  className="px-3 py-1 border border-red-300 rounded-md text-sm text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="mb-6">
                  <div className="flex items-center mb-4">
                    <div className="h-10 w-10 bg-gray-200 rounded-full flex items-center justify-center">
                      <User className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-900">
                        De: {selectedMessage.sender?.name} ({selectedMessage.sender?.email})
                      </p>
                      <p className="text-sm text-gray-600">
                        À: {selectedMessage.recipient?.name} ({selectedMessage.recipient?.email})
                      </p>
                      <p className="text-sm text-gray-500">
                        {format(new Date(selectedMessage.created_at), 'dd/MM/yyyy HH:mm')}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="prose max-w-none whitespace-pre-wrap">
                  {selectedMessage.content}
                </div>
              </div>
            </div>
          </div>
        ) : showNewMessage ? (
          <div className="flex flex-col h-full">
            <div className="bg-white border-b p-4 flex items-center">
              <button
                onClick={() => setShowNewMessage(false)}
                className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <h2 className="text-xl font-bold text-gray-900">Nouveau message</h2>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto">
              <div className="bg-white rounded-lg shadow p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Destinataire</label>
                    <select
                      {...register('recipientId', { required: 'Ce champ est requis' })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    >
                      <option value="">Sélectionnez un destinataire</option>
                      {users?.map(user => (
                        <option key={user.id} value={user.id}>
                          {user.name} ({user.role === 'admin' ? 'Admin' : user.role === 'technician' ? 'Technicien' : 'Client'})
                        </option>
                      ))}
                    </select>
                    {errors.recipientId && (
                      <p className="mt-1 text-sm text-red-600">{errors.recipientId.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Sujet</label>
                    <input
                      type="text"
                      {...register('subject', { required: 'Ce champ est requis' })}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {errors.subject && (
                      <p className="mt-1 text-sm text-red-600">{errors.subject.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Message</label>
                    <textarea
                      {...register('content', { required: 'Ce champ est requis' })}
                      rows={12}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                    {errors.content && (
                      <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                    )}
                  </div>

                  <div className="flex justify-between items-center">
                    <button
                      type="button"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <Paperclip className="h-4 w-4 mr-2" />
                      Joindre un fichier
                    </button>
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      {isSubmitting ? 'Envoi...' : 'Envoyer'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun message sélectionné</h3>
              <p className="text-gray-500 mb-4">Sélectionnez un message pour le consulter ou créez-en un nouveau</p>
              <button
                onClick={handleNewMessage}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Nouveau message
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagingPage;
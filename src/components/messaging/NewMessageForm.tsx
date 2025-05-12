import React from 'react';
import { useForm } from 'react-hook-form';
import { ArrowLeft, Send, Paperclip } from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface MessageFormData {
  recipientId: string;
  subject: string;
  content: string;
  interventionId?: string;
}

interface NewMessageFormProps {
  onSubmit: (data: MessageFormData) => void;
  onCancel: () => void;
  users: User[];
  isSubmitting: boolean;
  defaultValues?: Partial<MessageFormData>;
}

const NewMessageForm: React.FC<NewMessageFormProps> = ({
  onSubmit,
  onCancel,
  users,
  isSubmitting,
  defaultValues
}) => {
  const { register, handleSubmit, formState: { errors } } = useForm<MessageFormData>({
    defaultValues
  });

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b p-4 flex items-center">
        <button
          onClick={onCancel}
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
  );
};

export default NewMessageForm;
import React from 'react';
import { format } from 'date-fns';
import { ArrowLeft, User, Trash2, Reply, Forward } from 'lucide-react';
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

interface MessageDetailProps {
  message: Message;
  onBack: () => void;
  onReply: () => void;
  onDelete: (id: string) => void;
  onForward: () => void;
}

const MessageDetail: React.FC<MessageDetailProps> = ({
  message,
  onBack,
  onReply,
  onDelete,
  onForward
}) => {
  const { user: currentUser } = useAuth();

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b p-4 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h2 className="text-xl font-bold text-gray-900">{message.subject}</h2>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={onReply}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <Reply className="h-4 w-4 mr-1" />
            Répondre
          </button>
          <button
            onClick={onForward}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 flex items-center"
          >
            <Forward className="h-4 w-4 mr-1" />
            Transférer
          </button>
          <button
            onClick={() => onDelete(message.id)}
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
                  De: {message.sender?.name} ({message.sender?.email})
                </p>
                <p className="text-sm text-gray-600">
                  À: {message.recipient?.name} ({message.recipient?.email})
                </p>
                <p className="text-sm text-gray-500">
                  {format(new Date(message.created_at), 'dd/MM/yyyy HH:mm')}
                </p>
              </div>
            </div>
          </div>
          <div className="prose max-w-none whitespace-pre-wrap">
            {message.content}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MessageDetail;
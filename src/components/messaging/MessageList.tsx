import React from 'react';
import { format } from 'date-fns';
import { User, Mail } from 'lucide-react';
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

interface MessageListProps {
  messages: Message[];
  selectedMessage: Message | null;
  onMessageClick: (message: Message) => void;
  isLoading: boolean;
  searchTerm: string;
}

const MessageList: React.FC<MessageListProps> = ({
  messages,
  selectedMessage,
  onMessageClick,
  isLoading,
  searchTerm
}) => {
  const { user: currentUser } = useAuth();

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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!filteredMessages || filteredMessages.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        {searchTerm ? 'Aucun message ne correspond à votre recherche' : 'Aucun message dans ce dossier'}
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {filteredMessages.map((message) => (
        <div
          key={message.id}
          onClick={() => onMessageClick(message)}
          className={`p-4 cursor-pointer hover:bg-gray-50 ${
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
      ))}
    </div>
  );
};

export default MessageList;
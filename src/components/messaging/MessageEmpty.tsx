import React from 'react';
import { Mail, Plus } from 'lucide-react';

interface MessageEmptyProps {
  onNewMessage: () => void;
}

const MessageEmpty: React.FC<MessageEmptyProps> = ({ onNewMessage }) => {
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <Mail className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun message sélectionné</h3>
        <p className="text-gray-500 mb-4">Sélectionnez un message pour le consulter ou créez-en un nouveau</p>
        <button
          onClick={onNewMessage}
          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouveau message
        </button>
      </div>
    </div>
  );
};

export default MessageEmpty;
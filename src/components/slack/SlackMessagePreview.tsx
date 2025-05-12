import React from 'react';
import { Slack, User, Clock, MessageSquare } from 'lucide-react';

interface SlackMessagePreviewProps {
  message: {
    id: string;
    sender: {
      name: string;
      email: string;
    };
    subject: string;
    content: string;
    created_at: string;
  };
}

const SlackMessagePreview: React.FC<SlackMessagePreviewProps> = ({ message }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-[#4A154B]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center">
          <Slack className="h-5 w-5 text-[#4A154B] mr-2" />
          <span className="font-medium text-[#4A154B]">Aperçu Slack</span>
        </div>
        <span className="text-xs text-gray-500">Canal: #inbox</span>
      </div>
      
      <div className="bg-[#F8F8F8] p-4 rounded-lg border border-gray-200">
        <div className="flex items-start mb-3">
          <div className="h-10 w-10 bg-[#4A154B] rounded flex items-center justify-center text-white">
            <User className="h-5 w-5" />
          </div>
          <div className="ml-3">
            <div className="flex items-center">
              <span className="font-bold text-gray-900">ZEFREEZE Bot</span>
              <span className="ml-2 text-xs text-gray-500 flex items-center">
                <Clock className="h-3 w-3 mr-1" />
                Maintenant
              </span>
            </div>
            <div className="mt-1 p-2 bg-white rounded border border-gray-200">
              <div className="flex items-center mb-2">
                <MessageSquare className="h-4 w-4 text-blue-600 mr-2" />
                <span className="font-medium text-blue-600">Nouveau message</span>
              </div>
              <div className="mb-2">
                <span className="text-xs text-gray-500">De:</span>
                <span className="ml-1 font-medium">{message.sender.name}</span>
                <span className="ml-1 text-xs text-gray-500">({message.sender.email})</span>
              </div>
              <div className="mb-2">
                <span className="text-xs text-gray-500">Sujet:</span>
                <span className="ml-1 font-medium">{message.subject}</span>
              </div>
              <div className="text-sm text-gray-700 border-t border-gray-200 pt-2 mt-2">
                {message.content.length > 100 
                  ? `${message.content.substring(0, 100)}...` 
                  : message.content}
              </div>
              <div className="mt-3 flex space-x-2">
                <button className="px-3 py-1 bg-[#4A154B] text-white text-xs rounded">
                  Voir détails
                </button>
                <button className="px-3 py-1 bg-green-600 text-white text-xs rounded">
                  Répondre
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlackMessagePreview;
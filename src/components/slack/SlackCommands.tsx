import React from 'react';
import { Code, MessageSquare, History, Send } from 'lucide-react';

const SlackCommands = () => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold mb-4 flex items-center">
        <Code className="h-5 w-5 mr-2 text-blue-600" />
        Commandes Slack disponibles
      </h2>
      
      <div className="space-y-6">
        <div className="border-l-4 border-blue-500 pl-4 py-2">
          <div className="flex items-center mb-2">
            <MessageSquare className="h-5 w-5 mr-2 text-blue-600" />
            <h3 className="font-medium text-gray-900">Consulter les nouveaux messages</h3>
          </div>
          <div className="bg-gray-100 p-3 rounded font-mono text-sm">
            /inbox
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Affiche les derniers messages non lus dans le canal Slack dédié.
          </p>
        </div>
        
        <div className="border-l-4 border-green-500 pl-4 py-2">
          <div className="flex items-center mb-2">
            <History className="h-5 w-5 mr-2 text-green-600" />
            <h3 className="font-medium text-gray-900">Consulter l'historique des messages</h3>
          </div>
          <div className="bg-gray-100 p-3 rounded font-mono text-sm">
            /historique @client
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Affiche l'historique des échanges avec un client spécifique.
          </p>
        </div>
        
        <div className="border-l-4 border-purple-500 pl-4 py-2">
          <div className="flex items-center mb-2">
            <Send className="h-5 w-5 mr-2 text-purple-600" />
            <h3 className="font-medium text-gray-900">Envoyer un message</h3>
          </div>
          <div className="bg-gray-100 p-3 rounded font-mono text-sm">
            /repondre @client Votre message ici
          </div>
          <p className="mt-2 text-sm text-gray-600">
            Envoie un message directement à un client depuis Slack.
          </p>
        </div>
      </div>
      
      <div className="mt-6 p-4 bg-blue-50 rounded-lg">
        <h3 className="font-medium text-blue-800 mb-2">Intégration Slack</h3>
        <p className="text-sm text-blue-700">
          Ces commandes permettent de gérer efficacement les communications client directement depuis Slack, 
          sans avoir à basculer entre différentes plateformes.
        </p>
      </div>
    </div>
  );
};

export default SlackCommands;
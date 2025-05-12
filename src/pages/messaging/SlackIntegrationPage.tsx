import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Slack, MessageSquare, History, Send, CheckCircle, Settings, ArrowRight } from 'lucide-react';
import SlackCommands from '../../components/slack/SlackCommands';

const SlackIntegrationPage = () => {
  return (
    <div className="p-6">
      <div className="mb-6">
        <div className="flex items-center">
          <Link
            to="/dashboard/messages"
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Intégration Slack</h1>
        </div>
        <p className="text-gray-600 mt-1">
          Configurez l'intégration Slack pour gérer vos messages directement depuis votre espace de travail Slack.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Slack Connection Status */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Slack className="h-8 w-8 text-[#4A154B] mr-3" />
                <h2 className="text-xl font-semibold">Connexion Slack</h2>
              </div>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                <CheckCircle className="h-4 w-4 mr-1" />
                Connecté
              </span>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-lg mb-4">
              <div className="flex items-center mb-2">
                <div className="w-10 h-10 bg-[#4A154B] rounded flex items-center justify-center">
                  <Slack className="h-6 w-6 text-white" />
                </div>
                <div className="ml-3">
                  <p className="font-medium">Espace de travail ZEFREEZE</p>
                  <p className="text-sm text-gray-500">Connecté le 15/05/2025</p>
                </div>
              </div>
              
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  Canal #inbox
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                  Commandes activées
                </span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Notifications activées
                </span>
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
                <Settings className="h-4 w-4 mr-2" />
                Configurer
              </button>
              <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#4A154B] hover:bg-opacity-90">
                <Slack className="h-4 w-4 mr-2" />
                Ouvrir Slack
              </button>
            </div>
          </div>

          {/* Slack Commands */}
          <SlackCommands />

          {/* Workflow Diagram */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Flux de travail des messages</h2>
            
            <div className="relative">
              <div className="absolute left-8 top-0 h-full w-0.5 bg-gray-200"></div>
              
              <div className="relative flex items-start mb-8">
                <div className="flex-shrink-0 h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center z-10">
                  <MessageSquare className="h-8 w-8 text-blue-600" />
                </div>
                <div className="ml-6 mt-2">
                  <h3 className="text-lg font-medium text-gray-900">Réception des messages</h3>
                  <p className="mt-1 text-gray-600">
                    Les messages entrants sont automatiquement affichés dans le canal Slack #inbox.
                    Vous recevez une notification en temps réel pour chaque nouveau message.
                  </p>
                </div>
              </div>
              
              <div className="relative flex items-start mb-8">
                <div className="flex-shrink-0 h-16 w-16 rounded-full bg-green-100 flex items-center justify-center z-10">
                  <History className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-6 mt-2">
                  <h3 className="text-lg font-medium text-gray-900">Historique des conversations</h3>
                  <p className="mt-1 text-gray-600">
                    Consultez l'historique complet des échanges avec chaque client grâce à la commande
                    <code className="mx-1 px-1 py-0.5 bg-gray-100 rounded text-sm">/historique @client</code>.
                    Toutes les conversations sont centralisées.
                  </p>
                </div>
              </div>
              
              <div className="relative flex items-start">
                <div className="flex-shrink-0 h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center z-10">
                  <Send className="h-8 w-8 text-purple-600" />
                </div>
                <div className="ml-6 mt-2">
                  <h3 className="text-lg font-medium text-gray-900">Réponse aux clients</h3>
                  <p className="mt-1 text-gray-600">
                    Répondez directement depuis Slack avec la commande
                    <code className="mx-1 px-1 py-0.5 bg-gray-100 rounded text-sm">/repondre @client message</code>.
                    Les réponses sont envoyées par email et enregistrées dans l'historique.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Actions rapides</h2>
            
            <div className="space-y-3">
              <button className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <MessageSquare className="h-5 w-5 text-blue-600 mr-3" />
                  <span>Voir les messages non lus</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </button>
              
              <button className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <Send className="h-5 w-5 text-green-600 mr-3" />
                  <span>Envoyer un message groupé</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </button>
              
              <button className="w-full flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50">
                <div className="flex items-center">
                  <Settings className="h-5 w-5 text-purple-600 mr-3" />
                  <span>Configurer les réponses auto</span>
                </div>
                <ArrowRight className="h-4 w-4 text-gray-400" />
              </button>
            </div>
          </div>
          
          {/* Statistics */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-lg font-semibold mb-4">Statistiques de messagerie</h2>
            
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500">Messages reçus (mois)</span>
                  <span className="text-sm font-medium">124</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500">Temps de réponse moyen</span>
                  <span className="text-sm font-medium">2h 15min</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-green-600 h-2 rounded-full" style={{ width: '60%' }}></div>
                </div>
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-sm text-gray-500">Taux de résolution</span>
                  <span className="text-sm font-medium">92%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div className="bg-purple-600 h-2 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Help */}
          <div className="bg-blue-50 rounded-lg p-6">
            <h2 className="text-lg font-semibold text-blue-800 mb-3">Besoin d'aide ?</h2>
            <p className="text-blue-700 text-sm mb-4">
              Consultez notre documentation complète sur l'intégration Slack pour tirer le meilleur parti de cette fonctionnalité.
            </p>
            <button className="w-full flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              Voir la documentation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SlackIntegrationPage;
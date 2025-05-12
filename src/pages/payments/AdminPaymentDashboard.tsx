import React, { useState } from 'react';
import { format, subDays, subMonths } from 'date-fns';
import { fr } from 'date-fns/locale';
import { 
  BarChart, LineChart, PieChart, 
  Calendar, Download, Filter, 
  CreditCard, ArrowUpRight, ArrowDownRight,
  DollarSign, Users, Building, Receipt
} from 'lucide-react';
import { Link } from 'react-router-dom';

// Mock data for charts
const revenueData = [
  { month: 'Jan', amount: 120000 },
  { month: 'Fév', amount: 150000 },
  { month: 'Mar', amount: 180000 },
  { month: 'Avr', amount: 220000 },
  { month: 'Mai', amount: 250000 },
  { month: 'Juin', amount: 280000 },
];

const paymentMethodsData = [
  { name: 'Carte bancaire', value: 65 },
  { name: 'Virement', value: 25 },
  { name: 'Espèces/Chèque', value: 10 },
];

const topClientsData = [
  { id: '1', name: 'Restaurant Le Provençal', amount: 450000, invoices: 12 },
  { id: '2', name: 'Supermarché FraisMart', amount: 380000, invoices: 8 },
  { id: '3', name: 'Hôtel Le Méridien', amount: 320000, invoices: 6 },
  { id: '4', name: 'Boucherie Moderne', amount: 180000, invoices: 4 },
  { id: '5', name: 'Boulangerie Artisanale', amount: 120000, invoices: 3 },
];

const recentTransactionsData = [
  { 
    id: '1', 
    customer: 'Restaurant Le Provençal', 
    amount: 45000, 
    date: subDays(new Date(), 2).toISOString(),
    method: 'card',
    status: 'completed'
  },
  { 
    id: '2', 
    customer: 'Supermarché FraisMart', 
    amount: 75000, 
    date: subDays(new Date(), 5).toISOString(),
    method: 'transfer',
    status: 'completed'
  },
  { 
    id: '3', 
    customer: 'Hôtel Le Méridien', 
    amount: 15000, 
    date: subDays(new Date(), 7).toISOString(),
    method: 'card',
    status: 'failed'
  },
  { 
    id: '4', 
    customer: 'Boucherie Moderne', 
    amount: 35000, 
    date: subDays(new Date(), 10).toISOString(),
    method: 'cash',
    status: 'completed'
  },
];

const AdminPaymentDashboard = () => {
  const [timeframe, setTimeframe] = useState('month');
  
  // Calculate summary stats
  const totalRevenue = revenueData.reduce((sum, item) => sum + item.amount, 0);
  const currentMonthRevenue = revenueData[revenueData.length - 1].amount;
  const previousMonthRevenue = revenueData[revenueData.length - 2].amount;
  const percentageChange = ((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100;
  
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount / 100);
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Tableau de bord des paiements</h1>
        <p className="text-gray-600">Analyse des revenus et des tendances de paiement</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Revenus totaux</p>
              <p className="text-2xl font-bold mt-1">{formatCurrency(totalRevenue)}</p>
              <div className="flex items-center mt-2">
                <span className={`text-xs font-medium ${percentageChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {percentageChange >= 0 ? (
                    <ArrowUpRight className="inline h-3 w-3 mr-1" />
                  ) : (
                    <ArrowDownRight className="inline h-3 w-3 mr-1" />
                  )}
                  {Math.abs(percentageChange).toFixed(1)}%
                </span>
                <span className="text-xs text-gray-500 ml-1">vs mois précédent</span>
              </div>
            </div>
            <div className="p-3 bg-blue-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Clients actifs</p>
              <p className="text-2xl font-bold mt-1">42</p>
              <div className="flex items-center mt-2">
                <span className="text-xs font-medium text-green-600">
                  <ArrowUpRight className="inline h-3 w-3 mr-1" />
                  8.3%
                </span>
                <span className="text-xs text-gray-500 ml-1">vs mois précédent</span>
              </div>
            </div>
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Factures émises</p>
              <p className="text-2xl font-bold mt-1">156</p>
              <div className="flex items-center mt-2">
                <span className="text-xs font-medium text-green-600">
                  <ArrowUpRight className="inline h-3 w-3 mr-1" />
                  12.5%
                </span>
                <span className="text-xs text-gray-500 ml-1">vs mois précédent</span>
              </div>
            </div>
            <div className="p-3 bg-purple-100 rounded-lg">
              <Receipt className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">Taux de paiement</p>
              <p className="text-2xl font-bold mt-1">92%</p>
              <div className="flex items-center mt-2">
                <span className="text-xs font-medium text-red-600">
                  <ArrowDownRight className="inline h-3 w-3 mr-1" />
                  2.1%
                </span>
                <span className="text-xs text-gray-500 ml-1">vs mois précédent</span>
              </div>
            </div>
            <div className="p-3 bg-yellow-100 rounded-lg">
              <CreditCard className="h-6 w-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Revenue Chart */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-medium text-gray-900">Évolution des revenus</h2>
          <div className="flex items-center space-x-2">
            <select
              value={timeframe}
              onChange={(e) => setTimeframe(e.target.value)}
              className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 text-sm"
            >
              <option value="week">7 derniers jours</option>
              <option value="month">30 derniers jours</option>
              <option value="quarter">3 derniers mois</option>
              <option value="year">12 derniers mois</option>
            </select>
            <button className="p-1 rounded-md hover:bg-gray-100">
              <Download className="h-5 w-5 text-gray-500" />
            </button>
          </div>
        </div>
        <div className="p-6">
          <div className="h-80 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <LineChart className="h-12 w-12 mx-auto text-gray-400 mb-2" />
              <p>Graphique d'évolution des revenus</p>
              <p className="text-sm">(Données de démonstration)</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Payment Methods */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-medium text-gray-900">Méthodes de paiement</h2>
          </div>
          <div className="p-6">
            <div className="h-64 flex items-center justify-center">
              <div className="text-center text-gray-500">
                <PieChart className="h-12 w-12 mx-auto text-gray-400 mb-2" />
                <p>Répartition des méthodes de paiement</p>
                <p className="text-sm">(Données de démonstration)</p>
              </div>
            </div>
            <div className="mt-4 space-y-2">
              {paymentMethodsData.map((method, index) => (
                <div key={index} className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{method.name}</span>
                  <span className="text-sm font-medium">{method.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top Clients */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Meilleurs clients</h2>
            <Link to="/dashboard/companies" className="text-sm text-blue-600 hover:text-blue-800">
              Voir tous
            </Link>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {topClientsData.map((client) => (
                <div key={client.id} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                      <Building className="h-5 w-5 text-gray-500" />
                    </div>
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{client.name}</p>
                      <p className="text-xs text-gray-500">{client.invoices} factures</p>
                    </div>
                  </div>
                  <span className="text-sm font-medium">{formatCurrency(client.amount)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
            <h2 className="text-lg font-medium text-gray-900">Transactions récentes</h2>
            <Link to="/dashboard/admin-payments" className="text-sm text-blue-600 hover:text-blue-800">
              Voir toutes
            </Link>
          </div>
          <div className="p-6">
            <div className="space-y-4">
              {recentTransactionsData.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{transaction.customer}</p>
                    <p className="text-xs text-gray-500">
                      {format(new Date(transaction.date), 'dd MMM yyyy', { locale: fr })}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mr-2 ${
                      transaction.status === 'completed' ? 'bg-green-100 text-green-800' :
                      transaction.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {transaction.status === 'completed' ? 'Payé' :
                       transaction.status === 'pending' ? 'En attente' : 'Échoué'}
                    </span>
                    <span className="text-sm font-medium">{formatCurrency(transaction.amount)}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Actions rapides</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Link
            to="/dashboard/invoices/new"
            className="inline-flex flex-col items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Receipt className="h-6 w-6 text-blue-600 mb-2" />
            <span className="text-sm font-medium">Créer une facture</span>
          </Link>
          <Link
            to="/dashboard/admin-payments"
            className="inline-flex flex-col items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <CreditCard className="h-6 w-6 text-green-600 mb-2" />
            <span className="text-sm font-medium">Gérer les paiements</span>
          </Link>
          <Link
            to="/dashboard/reports"
            className="inline-flex flex-col items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <BarChart className="h-6 w-6 text-purple-600 mb-2" />
            <span className="text-sm font-medium">Voir les rapports</span>
          </Link>
          <Link
            to="/dashboard/companies"
            className="inline-flex flex-col items-center justify-center p-4 border border-gray-300 rounded-lg hover:bg-gray-50"
          >
            <Building className="h-6 w-6 text-orange-600 mb-2" />
            <span className="text-sm font-medium">Gérer les clients</span>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentDashboard;
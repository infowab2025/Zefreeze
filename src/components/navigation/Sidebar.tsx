import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Home, Users, FileText, Clipboard, MessageSquare, 
  Settings, LogOut, X, Search, User, PieChart,
  ThermometerSnowflake, Bell, Building, PenTool as Tool,
  BarChart3, Calendar, UserCog, CreditCard, Receipt,
  FileCheck
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Logo from '@/components/common/Logo';

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const location = useLocation();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Determine which menu items to show based on user role
  const getMenuItems = () => {
    // Admin-specific items
    if (user?.role === 'admin') {
      return [
        {
          name: 'Tableau de bord',
          path: '/dashboard/admin',
          icon: <Home size={20} />,
        },
        {
          name: 'Utilisateurs',
          path: '/dashboard/users',
          icon: <Users size={20} />,
        },
        {
          name: 'Entreprises',
          path: '/dashboard/companies',
          icon: <Building size={20} />,
        },
        {
          name: 'Techniciens',
          path: '/dashboard/technicians',
          icon: <UserCog size={20} />,
        },
        {
          name: 'Équipements',
          path: '/dashboard/equipment',
          icon: <ThermometerSnowflake size={20} />,
        },
        {
          name: 'Interventions',
          path: '/dashboard/interventions',
          icon: <Clipboard size={20} />,
        },
        {
          name: 'Installations',
          path: '/dashboard/installations',
          icon: <Tool size={20} />,
        },
        {
          name: 'Devis - Nouveaux',
          path: '/dashboard/quotes/new',
          icon: <FileText size={20} />,
        },
        {
          name: 'Devis - Confirmés',
          path: '/dashboard/quotes/confirmed',
          icon: <FileCheck size={20} />,
        },
        {
          name: 'Devis - Préparés',
          path: '/dashboard/quotes/prepared',
          icon: <FileCheck size={20} />,
        },
        {
          name: 'Devis - Validés',
          path: '/dashboard/quotes/validated',
          icon: <FileCheck size={20} />,
        },
        {
          name: 'Rapports',
          path: '/dashboard/reports',
          icon: <FileText size={20} />,
        },
        {
          name: 'Factures',
          path: '/dashboard/invoices',
          icon: <Receipt size={20} />,
        },
        {
          name: 'Tableau de bord paiements',
          path: '/dashboard/admin-payment-dashboard',
          icon: <BarChart3 size={20} />,
        },
        {
          name: 'Gestion des paiements',
          path: '/dashboard/admin-payments',
          icon: <CreditCard size={20} />,
        },
        {
          name: 'Statistiques',
          path: '/dashboard/statistics',
          icon: <BarChart3 size={20} />,
        },
        {
          name: 'Messages',
          path: '/dashboard/messages',
          icon: <MessageSquare size={20} />,
        },
        {
          name: 'Notifications',
          path: '/dashboard/notifications',
          icon: <Bell size={20} />,
        },
        {
          name: 'Profil',
          path: '/dashboard/profile',
          icon: <User size={20} />,
        },
        {
          name: 'Paramètres',
          path: '/dashboard/settings',
          icon: <Settings size={20} />,
        },
      ];
    }

    // Technician-specific items
    if (user?.role === 'technician') {
      return [
        {
          name: 'Dashboard',
          path: `/dashboard/technician`,
          icon: <Home size={20} />,
        },
        {
          name: 'Disponibilités',
          path: '/dashboard/availability',
          icon: <Calendar size={20} />,
        },
        {
          name: 'Équipements',
          path: '/dashboard/equipment',
          icon: <ThermometerSnowflake size={20} />,
        },
        {
          name: 'Interventions',
          path: '/dashboard/interventions',
          icon: <Clipboard size={20} />,
        },
        {
          name: 'Rapports',
          path: '/dashboard/reports',
          icon: <FileText size={20} />,
        },
        {
          name: 'Messages',
          path: '/dashboard/messages',
          icon: <MessageSquare size={20} />,
        },
        {
          name: 'Profil',
          path: '/dashboard/profile',
          icon: <User size={20} />,
        },
      ];
    }

    // Client-specific items
    return [
      {
        name: 'Dashboard',
        path: `/dashboard/client`,
        icon: <Home size={20} />,
      },
      {
        name: 'Équipements',
        path: '/dashboard/equipment',
        icon: <ThermometerSnowflake size={20} />,
      },
      {
        name: 'Interventions',
        path: '/dashboard/interventions',
        icon: <Clipboard size={20} />,
        badge: 2,
      },
      {
        name: 'Factures',
        path: '/dashboard/invoices',
        icon: <Receipt size={20} />,
      },
      {
        name: 'Paiements',
        path: '/dashboard/client-payments',
        icon: <CreditCard size={20} />,
      },
      {
        name: 'Messages',
        path: '/dashboard/messages',
        icon: <MessageSquare size={20} />,
      },
      {
        name: 'Profil',
        path: '/dashboard/profile',
        icon: <User size={20} />,
      },
    ];
  };

  const menuItems = getMenuItems();

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div 
        className={`fixed md:sticky top-0 z-50 h-full w-64 bg-white shadow-lg transition-transform duration-300 ease-in-out md:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <Logo size="md" />
            <button 
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-md text-gray-500 hover:text-gray-700 md:hidden"
            >
              <X size={20} />
            </button>
          </div>

          {/* User info */}
          <div className="p-4 border-b">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <div className="ml-3">
                <p className="font-medium text-gray-900 truncate">
                  {user?.name || 'Utilisateur'}
                </p>
                <p className="text-sm text-gray-500 truncate">
                  {user?.email || 'user@example.com'}
                </p>
              </div>
            </div>
          </div>

          {/* Search */}
          <div className="px-4 py-3">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={16} className="text-gray-400" />
              </div>
              <input
                type="search"
                className="w-full py-2 pl-10 pr-3 text-sm rounded-md border border-gray-300 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Rechercher..."
              />
            </div>
          </div>

          {/* Menu items */}
          <nav className="flex-1 px-3 py-4 overflow-y-auto">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.path}>
                  <Link
                    to={item.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive(item.path)
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <span className="mr-3">{item.icon}</span>
                    {item.name}
                    {'badge' in item && (
                      <span className="ml-auto bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {item.badge}
                      </span>
                    )}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout */}
          <div className="px-3 py-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-700 rounded-md hover:bg-gray-100 transition-colors"
            >
              <LogOut size={20} className="mr-3" />
              Déconnexion
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/navigation/Sidebar';
import DashboardHeader from '../components/navigation/DashboardHeader';
import { useAuth } from '../contexts/AuthContext';

const DashboardLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Redirect based on user role
  useEffect(() => {
    if (user) {
      // If we're at the dashboard root, redirect based on role
      if (window.location.pathname === '/dashboard') {
        if (user.role === 'admin') {
          navigate('/dashboard/users');
        } else if (user.role === 'technician') {
          navigate('/dashboard/technician');
        } else if (user.role === 'client') {
          navigate('/dashboard/client');
        }
      }
    }
  }, [user, navigate]);

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
      
      <div className="flex flex-col flex-1 overflow-hidden">
        <DashboardHeader 
          openSidebar={() => setSidebarOpen(true)} 
          user={user} 
        />
        
        <main className="flex-1 overflow-y-auto px-4 py-8 bg-gray-50 md:px-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
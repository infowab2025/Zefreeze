import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Contexts
import { AuthProvider } from './contexts/AuthContext';
import { I18nProvider } from './contexts/I18nContext';

// Public Pages
import HomePage from './pages/public/HomePage';
import ServicesPage from './pages/public/ServicesPage';
import AboutPage from './pages/public/AboutPage';
import ContactPage from './pages/public/ContactPage';

// Auth Pages
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';

// Dashboard Pages
import AdminDashboard from './pages/dashboard/AdminDashboard';
import ClientDashboard from './pages/dashboard/ClientDashboard';
import TechnicianDashboard from './pages/dashboard/TechnicianDashboard';

// CRM Pages
import CompanyListPage from './pages/crm/CompanyListPage';
import CompanyDetailsPage from './pages/crm/CompanyDetailsPage';
import CompanyNewPage from './pages/crm/CompanyNewPage';
import CompanyEditPage from './pages/crm/CompanyEditPage';
import InstallationListPage from './pages/crm/InstallationListPage';
import InstallationRequestPage from './pages/crm/InstallationRequestPage';
import TechnicianAssignmentPage from './pages/crm/TechnicianAssignmentPage';
import StatisticsPage from './pages/crm/StatisticsPage';

// User Management Pages
import UserListPage from './pages/users/UserListPage';
import UserDetailsPage from './pages/users/UserDetailsPage';
import UserNewPage from './pages/users/UserNewPage';
import UserEditPage from './pages/users/UserEditPage';
import TechnicianManagementPage from './pages/users/TechnicianManagementPage';

// Equipment Pages
import EquipmentListPage from './pages/equipment/EquipmentListPage';
import EquipmentDetailsPage from './pages/equipment/EquipmentDetailsPage';
import EquipmentNewPage from './pages/equipment/EquipmentNewPage';
import EquipmentEditPage from './pages/equipment/EquipmentEditPage';

// Intervention Pages
import InterventionsPage from './pages/interventions/InterventionsPage';
import NewInterventionPage from './pages/interventions/NewInterventionPage';

// Report Pages
import ReportListPage from './pages/reports/ReportListPage';
import ReportPage from './pages/reports/ReportPage';
import ReportNewPage from './pages/reports/ReportNewPage';
import ReportEditPage from './pages/reports/ReportEditPage';
import HaccpReportPage from './pages/reports/HaccpReportPage';
import HaccpFormPage from './pages/reports/HaccpFormPage';
import TemperatureLogPage from './pages/reports/TemperatureLogPage';
import FeasibilityReportPage from './pages/reports/FeasibilityReportPage';
import InstallationReportPage from './pages/reports/InstallationReportPage';

// Messaging Pages
import MessagingPage from './pages/messaging/MessagingPage';
import SlackIntegrationPage from './pages/messaging/SlackIntegrationPage';

// Payment Pages
import PaymentPage from './pages/payments/PaymentPage';
import InvoicesPage from './pages/payments/InvoicesPage';
import InvoiceNewPage from './pages/payments/InvoiceNewPage';
import InvoiceDetailPage from './pages/payments/InvoiceDetailPage';
import ClientPaymentHistoryPage from './pages/payments/ClientPaymentHistoryPage';
import ClientPaymentListPage from './pages/payments/ClientPaymentListPage';
import ClientPaymentPage from './pages/payments/ClientPaymentPage';
import AdminPaymentListPage from './pages/payments/AdminPaymentListPage';
import AdminPaymentDashboard from './pages/payments/AdminPaymentDashboard';

// Quote Pages
import QuoteNewListPage from './pages/quotes/QuoteNewListPage';
import QuoteConfirmedListPage from './pages/quotes/QuoteConfirmedListPage';
import QuotePreparedListPage from './pages/quotes/QuotePreparedListPage';
import QuoteValidatedListPage from './pages/quotes/QuoteValidatedListPage';
import QuoteDetailPage from './pages/quotes/QuoteDetailPage';
import QuoteEditPage from './pages/quotes/QuoteEditPage';
import QuoteCreatePage from './pages/quotes/QuoteCreatePage';

// Profile & Settings Pages
import ProfilePage from './pages/profile/ProfilePage';
import SettingsPage from './pages/settings/SettingsPage';
import NotificationsPage from './pages/notifications/NotificationsPage';

// Technician Pages
import TechnicianAvailabilityPage from './pages/technician/TechnicianAvailabilityPage';
import TechnicianSchedulePage from './pages/technician/TechnicianSchedulePage';
import MobileChecklistPage from './pages/technician/MobileChecklistPage';

// Other Pages
import NotFoundPage from './pages/NotFoundPage';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicLayout from './layouts/PublicLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Create a client
const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <I18nProvider>
        <AuthProvider>
          <Router>
            <Toaster position="top-center" />
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<PublicLayout />}>
                <Route index element={<HomePage />} />
                <Route path="services" element={<ServicesPage />} />
                <Route path="about" element={<AboutPage />} />
                <Route path="contact" element={<ContactPage />} />
              </Route>

              {/* Auth Routes */}
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
              <Route path="reset-password" element={<ResetPasswordPage />} />

              {/* Dashboard Routes */}
              <Route path="dashboard" element={
                <ProtectedRoute>
                  <DashboardLayout />
                </ProtectedRoute>
              }>
                {/* Default redirect to users page for admin */}
                <Route index element={<Navigate to="/dashboard/users" replace />} />
                
                {/* Admin Routes */}
                <Route path="admin" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                } />

                {/* Client Routes */}
                <Route path="client" element={
                  <ProtectedRoute requiredRole="client">
                    <ClientDashboard />
                  </ProtectedRoute>
                } />

                {/* Technician Routes */}
                <Route path="technician" element={
                  <ProtectedRoute requiredRole="technician">
                    <TechnicianDashboard />
                  </ProtectedRoute>
                } />
                
                {/* CRM - Admin Only */}
                <Route path="companies" element={
                  <ProtectedRoute requiredRole="admin">
                    <CompanyListPage />
                  </ProtectedRoute>
                } />
                <Route path="companies/new" element={
                  <ProtectedRoute requiredRole="admin">
                    <CompanyNewPage />
                  </ProtectedRoute>
                } />
                <Route path="companies/:id" element={<CompanyDetailsPage />} />
                <Route path="companies/:id/edit" element={
                  <ProtectedRoute requiredRole="admin">
                    <CompanyEditPage />
                  </ProtectedRoute>
                } />
                <Route path="installations" element={<InstallationListPage />} />
                <Route path="installations/request" element={<InstallationRequestPage />} />
                <Route path="installations/assign/:requestId" element={
                  <ProtectedRoute requiredRole="admin">
                    <TechnicianAssignmentPage />
                  </ProtectedRoute>
                } />
                <Route path="statistics" element={
                  <ProtectedRoute requiredRole="admin">
                    <StatisticsPage />
                  </ProtectedRoute>
                } />

                {/* User Management - Admin Only */}
                <Route path="users" element={
                  <ProtectedRoute requiredRole="admin">
                    <UserListPage />
                  </ProtectedRoute>
                } />
                <Route path="users/new" element={
                  <ProtectedRoute requiredRole="admin">
                    <UserNewPage />
                  </ProtectedRoute>
                } />
                <Route path="users/:id" element={
                  <ProtectedRoute requiredRole="admin">
                    <UserDetailsPage />
                  </ProtectedRoute>
                } />
                <Route path="users/:id/edit" element={
                  <ProtectedRoute requiredRole="admin">
                    <UserEditPage />
                  </ProtectedRoute>
                } />
                <Route path="technicians" element={
                  <ProtectedRoute requiredRole="admin">
                    <TechnicianManagementPage />
                  </ProtectedRoute>
                } />

                {/* Equipment Management */}
                <Route path="equipment" element={<EquipmentListPage />} />
                <Route path="equipment/new" element={<EquipmentNewPage />} />
                <Route path="equipment/:id" element={<EquipmentDetailsPage />} />
                <Route path="equipment/:id/edit" element={<EquipmentEditPage />} />
                
                {/* Interventions */}
                <Route path="interventions" element={<InterventionsPage />} />
                <Route path="interventions/new" element={<NewInterventionPage />} />
                <Route path="interventions/:id/checklist" element={<MobileChecklistPage />} />
                
                {/* Reports */}
                <Route path="reports" element={<ReportListPage />} />
                <Route path="reports/new" element={<ReportNewPage />} />
                <Route path="reports/haccp" element={<HaccpFormPage />} />
                <Route path="reports/temperature" element={<TemperatureLogPage />} />
                <Route path="reports/feasibility" element={<FeasibilityReportPage />} />
                <Route path="reports/installation" element={<InstallationReportPage />} />
                <Route path="reports/:id" element={<ReportPage />} />
                <Route path="reports/:id/edit" element={<ReportEditPage />} />
                
                {/* Quotes - Admin Only */}
                <Route path="quotes/new" element={
                  <ProtectedRoute requiredRole="admin">
                    <QuoteNewListPage />
                  </ProtectedRoute>
                } />
                <Route path="quotes/confirmed" element={
                  <ProtectedRoute requiredRole="admin">
                    <QuoteConfirmedListPage />
                  </ProtectedRoute>
                } />
                <Route path="quotes/prepared" element={
                  <ProtectedRoute requiredRole="admin">
                    <QuotePreparedListPage />
                  </ProtectedRoute>
                } />
                <Route path="quotes/validated" element={
                  <ProtectedRoute requiredRole="admin">
                    <QuoteValidatedListPage />
                  </ProtectedRoute>
                } />
                <Route path="quotes/create" element={
                  <ProtectedRoute requiredRole="admin">
                    <QuoteCreatePage />
                  </ProtectedRoute>
                } />
                <Route path="quotes/:id" element={
                  <ProtectedRoute requiredRole="admin">
                    <QuoteDetailPage />
                  </ProtectedRoute>
                } />
                <Route path="quotes/:id/edit" element={
                  <ProtectedRoute requiredRole="admin">
                    <QuoteEditPage />
                  </ProtectedRoute>
                } />
                
                {/* Messaging */}
                <Route path="messages" element={<MessagingPage />} />
                <Route path="messages/slack" element={<SlackIntegrationPage />} />
                
                {/* Payments */}
                <Route path="payments/:id" element={<PaymentPage />} />
                <Route path="invoices" element={<InvoicesPage />} />
                <Route path="invoices/new" element={<InvoiceNewPage />} />
                <Route path="invoices/:id" element={<InvoiceDetailPage />} />
                <Route path="invoices/client/:id" element={<ClientPaymentHistoryPage />} />
                
                {/* Client Payments */}
                <Route path="client-payments" element={
                  <ProtectedRoute requiredRole="client">
                    <ClientPaymentListPage />
                  </ProtectedRoute>
                } />
                <Route path="client-payments/:id" element={
                  <ProtectedRoute requiredRole="client">
                    <ClientPaymentPage />
                  </ProtectedRoute>
                } />
                
                {/* Admin Payments */}
                <Route path="admin-payments" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPaymentListPage />
                  </ProtectedRoute>
                } />
                <Route path="admin-payment-dashboard" element={
                  <ProtectedRoute requiredRole="admin">
                    <AdminPaymentDashboard />
                  </ProtectedRoute>
                } />
                
                {/* Profile & Settings */}
                <Route path="profile" element={<ProfilePage />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="notifications" element={<NotificationsPage />} />
                
                {/* Technician Routes */}
                <Route path="availability" element={
                  <ProtectedRoute requiredRole="technician">
                    <TechnicianAvailabilityPage />
                  </ProtectedRoute>
                } />
                <Route path="technician/schedule/:id" element={
                  <ProtectedRoute requiredRole="technician">
                    <TechnicianSchedulePage />
                  </ProtectedRoute>
                } />
              </Route>

              {/* 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Router>
        </AuthProvider>
      </I18nProvider>
    </QueryClientProvider>
  );
}

export default App;
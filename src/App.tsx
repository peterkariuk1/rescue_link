import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { type ReactNode } from 'react';
import { AuthProvider, useAuth, getDashboardPath } from '@/context/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { AppShell } from '@/components/layout/AppShell';
import { Logo } from '@/components/ui/Logo';

import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage, PendingApprovalPage } from '@/pages/auth/RegisterPage';
import { AccessDeniedPage } from '@/pages/auth/AccessDeniedPage';

import { SuperAdminDashboard } from '@/pages/admin/SuperAdminDashboard';
import { HealthPartnersPage, AddHealthPartnerPage } from '@/pages/admin/HealthPartnersPage';
import { HospitalDetailsPage, EditHospitalPage } from '@/pages/admin/HospitalDetailsPage';
import { ParamedicApprovalsPage } from '@/pages/admin/ParamedicApprovalsPage';
import { UserManagementPage } from '@/pages/admin/UserManagementPage';
import { ActivityLogsPage } from '@/pages/admin/ActivityLogsPage';

import { HospitalDashboard } from '@/pages/hospital/HospitalDashboard';
import { HospitalProfilePage } from '@/pages/hospital/HospitalProfilePage';
import { ServicesPage } from '@/pages/hospital/ServicesPage';
import { BedAvailabilityPage } from '@/pages/hospital/BedAvailabilityPage';
import { AmbulancesPage } from '@/pages/hospital/AmbulancesPage';

import { DispatchDashboard } from '@/pages/dispatch/DispatchDashboard';
import { EmergencyCasesPage } from '@/pages/dispatch/EmergencyCasesPage';
import { NewEmergencyCasePage } from '@/pages/dispatch/NewEmergencyCasePage';
import { HospitalMatchingPage } from '@/pages/dispatch/HospitalMatchingPage';
import { HospitalComparisonPage } from '@/pages/dispatch/HospitalComparisonPage';
import { HospitalConfirmationPage } from '@/pages/dispatch/HospitalConfirmationPage';
import { AmbulanceAssignmentPage } from '@/pages/dispatch/AmbulanceAssignmentPage';
import { ActiveDispatchesPage } from '@/pages/dispatch/ActiveDispatchesPage';
import { DispatchDetailsPage } from '@/pages/dispatch/DispatchDetailsPage';
import { DispatchHistoryPage } from '@/pages/dispatch/DispatchHistoryPage';

import type { UserRole } from '@/types';

function ProtectedRoute({ children, roles }: { children: ReactNode; roles?: UserRole[] }) {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center gap-4">
          <Logo size="md" />
          <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.includes(user.role)) {
    return <AccessDeniedPage />;
  }

  return <>{children}</>;
}

function RoleRedirect() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <Navigate to={getDashboardPath(user.role)} replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/pending-approval" element={<PendingApprovalPage />} />

      {/* Super Admin routes */}
      <Route path="/admin" element={<ProtectedRoute roles={['super_admin']}><AppShell /></ProtectedRoute>}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<SuperAdminDashboard />} />
        <Route path="hospitals" element={<HealthPartnersPage />} />
        <Route path="hospitals/new" element={<AddHealthPartnerPage />} />
        <Route path="hospitals/:id" element={<HospitalDetailsPage />} />
        <Route path="hospitals/:id/edit" element={<EditHospitalPage />} />
        <Route path="approvals" element={<ParamedicApprovalsPage />} />
        <Route path="users" element={<UserManagementPage />} />
        <Route path="activity" element={<ActivityLogsPage />} />
      </Route>

      {/* Health Partner routes */}
      <Route path="/hospital" element={<ProtectedRoute roles={['health_partner']}><AppShell /></ProtectedRoute>}>
        <Route index element={<Navigate to="/hospital/dashboard" replace />} />
        <Route path="dashboard" element={<HospitalDashboard />} />
        <Route path="profile" element={<HospitalProfilePage />} />
        <Route path="services" element={<ServicesPage />} />
        <Route path="beds" element={<BedAvailabilityPage />} />
        <Route path="ambulances" element={<AmbulancesPage />} />
      </Route>

      {/* Paramedic Dispatch routes */}
      <Route path="/dispatch" element={<ProtectedRoute roles={['paramedic']}><AppShell /></ProtectedRoute>}>
        <Route index element={<Navigate to="/dispatch/dashboard" replace />} />
        <Route path="dashboard" element={<DispatchDashboard />} />
        <Route path="cases" element={<EmergencyCasesPage />} />
        <Route path="cases/:caseId" element={<DispatchDetailsPage />} />
        <Route path="new-case" element={<NewEmergencyCasePage />} />
        <Route path="matching/:caseId" element={<HospitalMatchingPage />} />
        <Route path="compare/:caseId" element={<HospitalComparisonPage />} />
        <Route path="confirm/:caseId" element={<HospitalConfirmationPage />} />
        <Route path="ambulance/:caseId" element={<AmbulanceAssignmentPage />} />
        <Route path="active" element={<ActiveDispatchesPage />} />
        <Route path="history" element={<DispatchHistoryPage />} />
      </Route>

      {/* Default redirect */}
      <Route path="/" element={<RoleRedirect />} />
      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <ToastProvider>
          <AppRoutes />
        </ToastProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

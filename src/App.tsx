/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import AdminUsers from './pages/AdminUsers';
import PatientRegistration from './pages/PatientRegistration';
import DentalReport from './pages/DentalReport';
import ValidateReport from './pages/ValidateReport';
import MedicalRecord from './pages/MedicalRecord';
import PatientsList from './pages/PatientsList';
import MedicationManagement from './pages/MedicationManagement';
import DentistsManagement from './pages/DentistsManagement';
import { AuthProvider, useAuth } from './lib/AuthContext';

function ProtectedRoute({ children, allowedRoles }: { children: React.ReactNode, allowedRoles?: string[] }) {
  const { user, profile, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  // Master admin bypasses profile check for basic access
  const isMasterAdmin = user.email === 'romulochaves77@gmail.com';

  if (!isMasterAdmin && (!profile || profile.status !== 'active')) {
    return <Login />;
  }

  if (allowedRoles) {
    const userRole = isMasterAdmin ? 'admin' : (profile?.role || '');
    if (!allowedRoles.includes(userRole)) {
      return <Navigate to="/" replace />;
    }
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Layout>
          <Routes>
            <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/admin/usuarios" element={<ProtectedRoute allowedRoles={['admin']}><AdminUsers /></ProtectedRoute>} />
            
            <Route path="/cadastro" element={<ProtectedRoute allowedRoles={['admin', 'professional']}><PatientRegistration /></ProtectedRoute>} />
            <Route path="/pacientes" element={<ProtectedRoute><PatientsList /></ProtectedRoute>} />
            <Route path="/prontuario/:id" element={<ProtectedRoute><MedicalRecord /></ProtectedRoute>} />
            <Route path="/dentistas" element={<ProtectedRoute allowedRoles={['admin', 'professional']}><DentistsManagement /></ProtectedRoute>} />
            <Route path="/medicamentos" element={<ProtectedRoute><MedicationManagement /></ProtectedRoute>} />
            
            <Route path="/relatorio" element={<ProtectedRoute><DentalReport /></ProtectedRoute>} />
            <Route path="/validar-relatorio" element={<ValidateReport />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Layout>
      </BrowserRouter>
    </AuthProvider>
  );
}


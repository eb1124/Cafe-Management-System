/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { BranchManagementPage } from './pages/BranchManagementPage';
import { CustomerManagementPage } from './pages/CustomerManagementPage';
import { EmployeeManagementPage } from './pages/EmployeeManagementPage';
import { MenuManagementPage } from './pages/MenuManagementPage';
import { OrderManagementPage } from './pages/OrderManagementPage';
import { PaymentManagementPage } from './pages/PaymentManagementPage';
import { FeedbackManagementPage } from './pages/FeedbackManagementPage';
import { InventoryManagementPage } from './pages/InventoryManagementPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { DashboardLayout } from './layouts/DashboardLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { getStoredUser } from './services/auth';

export default function App() {
  const user = getStoredUser();

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} />
        
        {/* Protected Routes (Dashboard Layout) */}
        <Route element={<ProtectedRoute />}>
          <Route element={<DashboardLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/branches" element={<BranchManagementPage />} />
            <Route path="/customers" element={<CustomerManagementPage />} />
            <Route path="/employees" element={<EmployeeManagementPage />} />
            <Route path="/menu" element={<MenuManagementPage />} />
            <Route path="/orders" element={<OrderManagementPage />} />
            <Route path="/payments" element={<PaymentManagementPage />} />
            <Route path="/feedback" element={<FeedbackManagementPage />} />
            <Route path="/inventory" element={<InventoryManagementPage />} />
          </Route>
        </Route>

        {/* Redirects */}
        <Route path="/" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
        
        {/* 404 Page */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}

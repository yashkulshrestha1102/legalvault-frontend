import { Routes, Route } from 'react-router-dom';
import Dashboard from "../pages/Dashboard";
import Clients from "../pages/Clients";
import Users from "../pages/Users";
import Login from "../pages/Login";
import ClientDetails from "../pages/ClientDetails";
import ProtectedRoute from "../components/ProtectedRoute";
import ProtectedFolder from "../components/ProtectedFolder";
import SearchResults from "../pages/SearchResults";
import Profile from "../pages/Profile";
import RegistrationDetails from "../pages/RegistrationDetails";
import ContractDetails from "../pages/ContractDetails";
import AuditLog from '../pages/AuditLog';
import Settings from "../pages/Settings";


// ✅ Import actual folder pages
import RegistrationsPage from "../pages/folders/RegistrationsPage";
import ContractsPage from "../pages/folders/ContractsPage";
import PoliciesPage from "../pages/folders/PoliciesPage";
import CorporateSecretariatPage from "../pages/folders/CorporateSecretariatPage";
import HRPage from "../pages/folders/HRPage";
import GSTPage from "../pages/folders/GSTPage";
import IncomeTaxPage from "../pages/folders/IncomeTaxPage";
import FinancialsPage from "../pages/folders/FinancialsPage";

const AppRoutes = () => {
  return (
    <Routes>
      {/* ✅ Public Routes */}
      <Route path="/login" element={<Login />} />

      {/* ✅ Protected Routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />

      <Route path="/clients" element={
        <ProtectedRoute>
          <Clients />
        </ProtectedRoute>
      } />

      {/* ✅ Users - Admin only */}
      <Route path="/users" element={
        <ProtectedRoute requiredRole="admin">
          <Users />
        </ProtectedRoute>
      } />

      {/* ✅ Audit Log - Admin only */}
      <Route path="/audit" element={
        <ProtectedRoute requiredRole="admin">
          <AuditLog />
        </ProtectedRoute>
      } />

      <Route path="/profile" element={
        <ProtectedRoute>
          <Profile />
        </ProtectedRoute>
      } />

      <Route path="/search" element={
        <ProtectedRoute>
          <SearchResults />
        </ProtectedRoute>
      } />

      <Route path="/client/:id" element={
        <ProtectedRoute>
          <ClientDetails />
        </ProtectedRoute>
      } />

      <Route path="/clients/:id/registration/:registrationId" element={
        <ProtectedRoute>
          <RegistrationDetails />
        </ProtectedRoute>
      } />

      <Route path="/clients/:id/contract/:contractId" element={
        <ProtectedRoute>
          <ContractDetails />
        </ProtectedRoute>
      } />

      {/* ✅ 8 Folder Routes with Permission Check */}
      <Route path="/registrations" element={
        <ProtectedRoute>
          <ProtectedFolder folderId="registrations">
            <RegistrationsPage />
          </ProtectedFolder>
        </ProtectedRoute>
      } />

      <Route path="/contracts" element={
        <ProtectedRoute>
          <ProtectedFolder folderId="contracts">
            <ContractsPage />
          </ProtectedFolder>
        </ProtectedRoute>
      } />

      <Route path="/policies" element={
        <ProtectedRoute>
          <ProtectedFolder folderId="policies">
            <PoliciesPage />
          </ProtectedFolder>
        </ProtectedRoute>
      } />

      <Route path="/corporate-secretariat" element={
        <ProtectedRoute>
          <ProtectedFolder folderId="corporate-secretariat">
            <CorporateSecretariatPage />
          </ProtectedFolder>
        </ProtectedRoute>
      } />

      <Route path="/hr" element={
        <ProtectedRoute>
          <ProtectedFolder folderId="hr">
            <HRPage />
          </ProtectedFolder>
        </ProtectedRoute>
      } />

      <Route path="/gst" element={
        <ProtectedRoute>
          <ProtectedFolder folderId="gst">
            <GSTPage />
          </ProtectedFolder>
        </ProtectedRoute>
      } />

      <Route path="/income-tax" element={
        <ProtectedRoute>
          <ProtectedFolder folderId="income-tax">
            <IncomeTaxPage />
          </ProtectedFolder>
        </ProtectedRoute>
      } />

      <Route path="/financials" element={
        <ProtectedRoute>
          <ProtectedFolder folderId="financials">
            <FinancialsPage />
          </ProtectedFolder>
        </ProtectedRoute>
      } />
     <Route path="/settings" element={
  <ProtectedRoute>
    <Settings />
  </ProtectedRoute>
} />

    </Routes>
  );
};

export default AppRoutes;
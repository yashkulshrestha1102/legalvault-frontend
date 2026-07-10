import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from "../components/ProtectedRoute";
import ProtectedFolder from "../components/ProtectedFolder";

// ✅ Lazy load pages
const Dashboard = lazy(() => import("../pages/Dashboard"));
const Clients = lazy(() => import("../pages/Clients"));
const Users = lazy(() => import("../pages/Users"));
const Login = lazy(() => import("../pages/Login"));
const ClientDetails = lazy(() => import("../pages/ClientDetails"));
const SearchResults = lazy(() => import("../pages/SearchResults"));
const Profile = lazy(() => import("../pages/Profile"));
const RegistrationDetails = lazy(() => import("../pages/RegistrationDetails"));
const ContractDetails = lazy(() => import("../pages/ContractDetails"));
const AuditLog = lazy(() => import("../pages/AuditLog"));
const Settings = lazy(() => import("../pages/Settings"));

// ✅ Lazy load folder pages
const RegistrationsPage = lazy(() => import("../pages/folders/RegistrationsPage"));
const ContractsPage = lazy(() => import("../pages/folders/ContractsPage"));
const PoliciesPage = lazy(() => import("../pages/folders/PoliciesPage"));
const CorporateSecretariatPage = lazy(() => import("../pages/folders/CorporateSecretariatPage"));
const HRPage = lazy(() => import("../pages/folders/HRPage"));
const GSTPage = lazy(() => import("../pages/folders/GSTPage"));
const IncomeTaxPage = lazy(() => import("../pages/folders/IncomeTaxPage"));
const FinancialsPage = lazy(() => import("../pages/folders/FinancialsPage"));

// ✅ Loading component
const PageLoader = () => (
  <div className="flex justify-center items-center h-screen">
    <div className="text-xl text-white">Loading...</div>
  </div>
);

const AppRoutes = () => {
  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        <Route path="/dashboard" element={
          <ProtectedRoute><Dashboard /></ProtectedRoute>
        } />

        <Route path="/clients" element={
          <ProtectedRoute><Clients /></ProtectedRoute>
        } />

        <Route path="/users" element={
          <ProtectedRoute requiredRole="admin"><Users /></ProtectedRoute>
        } />

        <Route path="/audit" element={
          <ProtectedRoute requiredRole="admin"><AuditLog /></ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute><Profile /></ProtectedRoute>
        } />

        <Route path="/search" element={
          <ProtectedRoute><SearchResults /></ProtectedRoute>
        } />

        <Route path="/client/:id" element={
          <ProtectedRoute><ClientDetails /></ProtectedRoute>
        } />

        <Route path="/clients/:id/registration/:registrationId" element={
          <ProtectedRoute><RegistrationDetails /></ProtectedRoute>
        } />

        <Route path="/clients/:id/contract/:contractId" element={
          <ProtectedRoute><ContractDetails /></ProtectedRoute>
        } />

        <Route path="/registrations" element={
          <ProtectedRoute><ProtectedFolder folderId="registrations"><RegistrationsPage /></ProtectedFolder></ProtectedRoute>
        } />

        <Route path="/contracts" element={
          <ProtectedRoute><ProtectedFolder folderId="contracts"><ContractsPage /></ProtectedFolder></ProtectedRoute>
        } />

        <Route path="/policies" element={
          <ProtectedRoute><ProtectedFolder folderId="policies"><PoliciesPage /></ProtectedFolder></ProtectedRoute>
        } />

        <Route path="/corporate-secretariat" element={
          <ProtectedRoute><ProtectedFolder folderId="corporate-secretariat"><CorporateSecretariatPage /></ProtectedFolder></ProtectedRoute>
        } />

        <Route path="/hr" element={
          <ProtectedRoute><ProtectedFolder folderId="hr"><HRPage /></ProtectedFolder></ProtectedRoute>
        } />

        <Route path="/gst" element={
          <ProtectedRoute><ProtectedFolder folderId="gst"><GSTPage /></ProtectedFolder></ProtectedRoute>
        } />

        <Route path="/income-tax" element={
          <ProtectedRoute><ProtectedFolder folderId="income-tax"><IncomeTaxPage /></ProtectedFolder></ProtectedRoute>
        } />

        <Route path="/financials" element={
          <ProtectedRoute><ProtectedFolder folderId="financials"><FinancialsPage /></ProtectedFolder></ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute><Settings /></ProtectedRoute>
        } />
      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
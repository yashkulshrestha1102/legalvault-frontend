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
const PolicyDetails = lazy(() => import("../pages/folders/PolicyDetails"));
const GSTDetails = lazy(() => import("../pages/folders/GSTDetails"));
const IncomeTaxDetails = lazy(() => import("../pages/folders/IncomeTaxDetails"));
const HRDetails = lazy(() => import("../pages/folders/HRDetails"));
const CorporateSecretariatDetails = lazy(() => import("../pages/folders/CorporateSecretariatDetails"));




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

        <Route path="/client/:clientId" element={
          <ProtectedRoute><ClientDetails /></ProtectedRoute>
        } />

        <Route path="/clients/:id/registration/:registrationId" element={
          <ProtectedRoute><RegistrationDetails /></ProtectedRoute>
        } />

        <Route path="/clients/:id/contract/:contractId" element={
          <ProtectedRoute><ContractDetails /></ProtectedRoute>
        } />

        <Route path="/client/:clientId/policy/:policyId" element={
          <ProtectedRoute><PolicyDetails /></ProtectedRoute>
        } />

        <Route path="/settings" element={
          <ProtectedRoute><Settings /></ProtectedRoute>
        } />


        <Route path="/client/:clientId/gst/:gstId" element={
  <ProtectedRoute><GSTDetails /></ProtectedRoute>
} />


<Route path="/client/:clientId/income-tax/:id" element={
  <ProtectedRoute><IncomeTaxDetails /></ProtectedRoute>
} />

<Route path="/client/:clientId/hr/:id" element={
  <ProtectedRoute><HRDetails /></ProtectedRoute>
} />

<Route path="/client/:clientId/corporate-secretariat/:id" element={
  <ProtectedRoute><CorporateSecretariatDetails /></ProtectedRoute>
} />


      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
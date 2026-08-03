import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import ProtectedRoute from "../components/ProtectedRoute";
import ProtectedFolder from "../components/ProtectedFolder";
import GSTDashboard from "../pages/gst/Dashboard";
import GSTCollection from "../pages/gst/StageCollection";
import GSTSorting from "../pages/gst/StageSorting";
import GSTDataEntry from "../pages/gst/StageDataEntry";
import GSTFiling from "../pages/gst/StageFiling";

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

        <Route path="/settings" element={
          <ProtectedRoute><Settings /></ProtectedRoute>
        } />

        {/* ✅ GST Automation Routes */}
        <Route path="/gst" element={
          <ProtectedRoute><GSTDashboard /></ProtectedRoute>
        } />
        <Route path="/gst/collection/:id" element={
          <ProtectedRoute><GSTCollection /></ProtectedRoute>
        } />
        <Route path="/gst/sorting/:id" element={
          <ProtectedRoute><GSTSorting /></ProtectedRoute>
        } />
        <Route path="/gst/dataentry/:id" element={
          <ProtectedRoute><GSTDataEntry /></ProtectedRoute>
        } />
        <Route path="/gst/filing/:id" element={
          <ProtectedRoute><GSTFiling /></ProtectedRoute>
        } />

      </Routes>
    </Suspense>
  );
};

export default AppRoutes;
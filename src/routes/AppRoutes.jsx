import { Routes, Route } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Clients from "../pages/Clients";
import Users from "../pages/Users";
import Login from "../pages/Login";
import ClientDetails from "../pages/ClientDetails";
import ProtectedRoute from "../components/ProtectedRoute";
import SearchResults from "../pages/SearchResults";
import Profile from "../pages/Profile";
import RegistrationDetails from "../pages/RegistrationDetails";
import ContractDetails from "../pages/ContractDetails";

const AppRoutes = () => {
  return (
    <Routes>

      <Route path="/" element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  }
/>

      <Route
        path="/clients"
        element={<ProtectedRoute>
      <Clients />
    </ProtectedRoute>}
      />

      <Route
        path="/users"
        element={<ProtectedRoute>
      <Users />
    </ProtectedRoute>}
      />   
       <Route path="/login" element={<Login />}/>

      <Route path="/client/:id" element={<ClientDetails />}/>
     

    <Route path="/search" element={<ProtectedRoute>
      <SearchResults/>
    </ProtectedRoute>}
/>

<Route
  path="/profile"
  element={<ProtectedRoute>
      <Profile/>
    </ProtectedRoute>}
/>

<Route
  path="/clients/:id/registration/:registrationId"
  element={<RegistrationDetails />}
/>

<Route
  path="/clients/:id/contract/:contractId"
  element={<ContractDetails />}
/>


    </Routes>
  );
};

export default AppRoutes;
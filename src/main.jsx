import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import AuthProvider from "./context/AuthContext";
import {ThemeProvider} from "./context/ThemeContext";
import { SidebarProvider } from "./context/SidebarContext";
import "./styles/glass.css";


ReactDOM.createRoot(
  document.getElementById("root")
).render(
  <AuthProvider>
  <BrowserRouter>
<ThemeProvider>
<SidebarProvider>
  <App />
</SidebarProvider>
</ThemeProvider>
  </BrowserRouter>
</AuthProvider>
);
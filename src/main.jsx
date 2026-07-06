import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";  // ✅ Named import (curly braces)
import { ThemeProvider } from "./context/ThemeContext";
import { SidebarProvider } from "./context/SidebarContext";

import "./styles/glass.css";

ReactDOM.createRoot(document.getElementById("root")).render(
    <React.StrictMode>

  <AuthProvider>

    <ThemeProvider>   {/* ✅ BrowserRouter hatao, sirf providers rakho */}
      <SidebarProvider>
        <App />
      </SidebarProvider>
    </ThemeProvider>
  </AuthProvider>
    </React.StrictMode>

);
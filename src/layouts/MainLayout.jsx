import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import FloatingActions from "../components/FloatingActions";

import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { SidebarContext } from "../context/SidebarContext";

const MainLayout = ({ children }) => {
  const { theme } = useContext(ThemeContext);
  const { collapsed } = useContext(SidebarContext);

  return (
    <div
      className={`
        min-h-screen
        flex
        relative
        overflow-x-hidden
        transition-all
        duration-300
        ${
          theme === "dark"
            ? "bg-[#020617] text-white"
            : "bg-slate-100 text-slate-900"
        }
      `}
    >
      {/* Background Glow */}

      <div
        className="
          absolute
          top-0
          left-0
          w-[500px]
          h-[500px]
          bg-cyan-500/10
          blur-[150px]
          rounded-full
          pointer-events-none
        "
      />

      <div
        className="
          absolute
          top-20
          right-0
          w-[500px]
          h-[500px]
          bg-purple-500/10
          blur-[150px]
          rounded-full
          pointer-events-none
        "
      />

      <div
        className="
          absolute
          bottom-0
          left-1/2
          -translate-x-1/2
          w-[600px]
          h-[300px]
          bg-blue-500/10
          blur-[150px]
          rounded-full
          pointer-events-none
        "
      />

      {/* Sidebar */}

      <Sidebar />

      {/* Main Section */}

      <main
        className={`
          flex-1
          relative
          z-10
          transition-all
          duration-300
          p-3
          sm:p-4
          md:p-5
          lg:p-6
          overflow-x-hidden
        `}
      >
        {/* Navbar */}

        <Navbar />

        {/* Floating Button */}

        <FloatingActions />

        {/* Page */}

        <div
          className="
            glass
            mt-4
            rounded-[28px]
            min-h-[calc(100vh-120px)]
            p-4
            sm:p-5
            md:p-6
            lg:p-8
            overflow-x-auto
          "
        >
          {children}
        </div>
      </main>
    </div>
  );
};

export default MainLayout;
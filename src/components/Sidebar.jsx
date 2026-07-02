import {
  FaTachometerAlt,
  FaUsers,
  FaSignOutAlt,
  FaBars,
  FaUserCircle,
} from "react-icons/fa";

import { FaHistory } from "react-icons/fa";


import {
  NavLink,
  useNavigate,
  useLocation,
} from "react-router-dom";

import { useContext, useEffect, useState } from "react";
import AuthContext from '../context/AuthContext';
import { SidebarContext } from "../context/SidebarContext";

const ALL_FOLDERS = [
  { id: 'registrations', label: 'Registrations / Certifications', path: '/registrations' },
  { id: 'contracts', label: 'Contracts', path: '/contracts' },
  { id: 'policies', label: 'Policies', path: '/policies' },
  { id: 'corporate-secretariat', label: 'Corporate Secretariat', path: '/corporate-secretariat' },
  { id: 'hr', label: 'HR', path: '/hr' },
  { id: 'gst', label: 'GST', path: '/gst' },
  { id: 'income-tax', label: 'Income Tax', path: '/income-tax' },
  { id: 'financials', label: 'Financials', path: '/financials' }
];

function Sidebar() {
  const { user: contextUser, logout } = useContext(AuthContext);
  const { collapsed, toggleSidebar, mobileOpen, setMobileOpen } = useContext(SidebarContext);

  const [user, setUser] = useState(contextUser);

  useEffect(() => {
    if (contextUser) {
      setUser(contextUser);
    } else {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          console.error('Error parsing user from localStorage:', e);
        }
      }
    }
  }, [contextUser]);

  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const closeMobileSidebar = () => {
    setMobileOpen(false);
  };

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const role = user?.role || 'user';
  const permissions = user?.folderPermissions || [];

  const accessibleFolders = ALL_FOLDERS.filter(f => 
    role === 'admin' || permissions.includes(f.id)
  );

  const menuItems = [
    { path: "/", label: "Dashboard", icon: <FaTachometerAlt /> },
    { path: "/clients", label: "Clients", icon: <FaUsers /> },
  ];

  if (role === 'admin') {
    menuItems.push({ path: "/users", label: "Users", icon: <FaUsers /> });
  }

  menuItems.push({ path: "/profile", label: "Profile", icon: <FaUserCircle /> });

// ✅ Add this in menuItems array (after Users)
if (role === 'admin') {
  menuItems.push({ path: "/users", label: "Users", icon: <FaUsers /> });
  // ✅ Add Audit Log (Admin only)
  menuItems.push({ path: "/audit", label: "Audit Log", icon: <FaHistory /> }); // ✅ Add this
}


  return (
    <>
      <div className={`
        fixed md:relative top-0 left-0
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        z-50 glass m-4 p-5 min-h-[calc(100vh-32px)] flex flex-col transition-all duration-500 ease-in-out
        ${collapsed ? "w-24" : "w-80"}
      `}>
        <div className="flex items-center justify-between mb-10">
          {!collapsed && (
            <div>
              <h1 className="text-4xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-500 bg-clip-text text-transparent">
                LegalVault
              </h1>
              <p className="text-xs text-white/50">Premium Legal Suite</p>
            </div>
          )}
          <button onClick={toggleSidebar} className="glass-card w-12 h-12 flex items-center justify-center">
            <FaBars />
          </button>
        </div>

        <div className="absolute top-0 right-0 w-40 h-40 bg-cyan-500/10 blur-[90px] rounded-full pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-40 h-40 bg-purple-500/10 blur-[90px] rounded-full pointer-events-none" />

        <div className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMobileSidebar}
              className={({ isActive }) => `
                flex items-center ${collapsed ? "justify-center" : ""} gap-3 px-4 py-3 rounded-2xl transition-all duration-300
                ${isActive ? "glass-card border border-cyan-400/20 shadow-[0_0_25px_rgba(34,211,238,0.2)] text-white shadow-lg shadow-blue-600/30" : "hover:bg-slate-800 text-gray-300"}
              `}
            >
              <div className="w-10 h-10 rounded-xl glass-card flex items-center justify-center">
                {item.icon}
              </div>
              {!collapsed && <span className="font-medium">{item.label}</span>}
            </NavLink>
          ))}

          {accessibleFolders.length > 0 && !collapsed && (
            <div className="mt-4 pt-4 border-t border-white/10">
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-2">Folders</p>
              {accessibleFolders.map((folder) => (
                <NavLink
                  key={folder.id}
                  to={folder.path}
                  onClick={closeMobileSidebar}
                  className={({ isActive }) => `
                    flex items-center gap-3 px-4 py-2 rounded-xl transition-all duration-300 text-sm
                    ${isActive ? "glass-card border border-cyan-400/20 text-white" : "hover:bg-slate-800 text-gray-400"}
                  `}
                >
                  <span>{folder.label}</span>
                </NavLink>
              ))}
            </div>
          )}
        </div>

        <div className="mt-auto">
          {!collapsed && (
            <div className="glass-card mb-5 p-4">
              <div className="flex items-center gap-3">
                <img src="https://i.pravatar.cc/50" alt="User" className="w-14 h-14 rounded-full border-2 border-cyan-400" />
                <div>
                  <h3 className="font-bold">{user?.name || 'Admin User'}</h3>
                  <p className="text-xs text-white/50">{user?.role || 'Legal Manager'}</p>
                </div>
              </div>
            </div>
          )}

          <button onClick={handleLogout} className="glass-card w-full p-4 flex items-center justify-center gap-3 text-red-400 hover:text-red-300 transition-all duration-300">
            <FaSignOutAlt />
            {!collapsed && "Logout"}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div onClick={closeMobileSidebar} className="fixed inset-0 bg-black/50 z-40 md:hidden" />
      )}
    </>
  );
}

export default Sidebar;
import { useEffect, useState, useContext } from "react";
import {
  FaBell,
  FaSearch,
  FaBars,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import { SidebarContext } from "../context/SidebarContext";

function Navbar() {
  const navigate = useNavigate();
  const { toggleMobileSidebar } = useContext(SidebarContext);

  const [searchTerm, setSearchTerm] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const [notificationCount, setNotificationCount] = useState(0);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [user, setUser] = useState(null);

  // ✅ Load user from localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('👤 Navbar - User loaded:', parsedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('Error parsing user:', e);
      }
    }
  }, []);

  useEffect(() => {
    const notifications = JSON.parse(
      localStorage.getItem("notifications")
    ) || [];
    setNotificationCount(notifications.length);

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // ✅ Role display
  const getRoleDisplay = (role) => {
    if (!role) return 'User';
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div className="glass px-3 md:px-8 py-3 md:py-5 mb-4 md:mb-6 flex justify-between items-center sticky top-2 md:top-4 z-40 gap-2">
      {/* LEFT */}
      <div className="flex items-center gap-2 md:gap-4">
        <button
          onClick={toggleMobileSidebar}
          className="glass-icon md:hidden"
        >
          <FaBars />
        </button>

        <div className="glass-card flex items-center gap-3 px-5 py-3 w-full md:w-[400px]">
          <FaSearch className="text-slate-400" />
          <input
            type="text"
            placeholder="Search clients, cases, documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                navigate(`/search?q=${searchTerm}`);
              }
            }}
            className="bg-transparent outline-none w-full placeholder:text-slate-400"
          />
        </div>
      </div>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        {/* Date & Time */}
        <div className="hidden md:block text-right">
          <p className="text-xs text-slate-400">
            {currentTime.toLocaleDateString()}
          </p>
          <p className="font-semibold">
            {currentTime.toLocaleTimeString()}
          </p>
        </div>

        {/* Notification Bell */}
        <div className="relative cursor-pointer">
          <div className="glass-card p-2 relative">
            <FaBell className="text-slate-400 hover:text-cyan-400 transition" />
            {notificationCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {notificationCount}
              </span>
            )}
          </div>
        </div>

        {/* Profile */}
        <div className="relative">
          <div
            onClick={() => setShowMenu(!showMenu)}
            className="glass-card px-3 py-2 flex items-center gap-3 cursor-pointer"
          >
            <img
              src={`https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=0D9488&color=fff&size=100`}
              alt=""
              className="w-10 h-10 rounded-full border-2 border-cyan-500 object-cover"
            />
            <div className="hidden md:block">
              <h4 className="font-semibold">{user?.name || 'User'}</h4>
              <p className="text-xs text-slate-400">
                {getRoleDisplay(user?.role)}
              </p>
            </div>
          </div>

          {showMenu && (
            <div className="glass-dropdown absolute right-0 top-16 w-56 rounded-2xl overflow-hidden z-50">
              <button
                onClick={() => {
                  setShowMenu(false);
                  navigate("/profile");
                }}
                className="w-full text-left px-5 py-4 hover:bg-white/10 transition"
              >
                My Profile
              </button>
              <button
                onClick={() => {
                  setShowMenu(false);
                  navigate("/settings");
                }}
                className="w-full text-left px-5 py-4 hover:bg-white/10 transition"
              >
                Settings
              </button>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('user');
                  navigate("/login");
                }}
                className="w-full text-left px-5 py-4 text-red-400 hover:bg-white/10 transition"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Navbar;
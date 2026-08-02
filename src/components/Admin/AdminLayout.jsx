import NotificationBell from '../components/Admin/NotificationBell';

// Navbar/Header section mein add karo:
<div className="flex items-center space-x-4">
  <NotificationBell />
  {/* Existing user name, logout etc. */}
  <span className="text-sm font-medium text-gray-700">{user?.name}</span>
</div>
import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Bell, Check, X, BellRing } from 'lucide-react';

const NotificationBell = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ Get token from localStorage
  const getToken = () => localStorage.getItem('token');

  // ✅ Fetch notifications
  const fetchNotifications = async () => {
    try {
      const token = getToken();
      if (!token) return;

      const res = await axios.get(`${import.meta.env.VITE_API_URL || 'https://legalvault-jm2n.onrender.com'}/api/notifications`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setNotifications(res.data);
      setUnreadCount(res.data.filter(n => !n.isRead).length);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  // ✅ Mark single notification as read
  const markAsRead = async (id) => {
    try {
      const token = getToken();
      await axios.put(
        `${import.meta.env.VITE_API_URL || 'https://legalvault-jm2n.onrender.com'}/api/notifications/${id}/read`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  // ✅ Mark all as read
  const markAllAsRead = async () => {
    try {
      const token = getToken();
      await axios.put(
        `${import.meta.env.VITE_API_URL || 'https://legalvault-jm2n.onrender.com'}/api/notifications/read-all`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  // ✅ Delete notification
  const deleteNotification = async (id, e) => {
    e.stopPropagation();
    try {
      const token = getToken();
      await axios.delete(
        `${import.meta.env.VITE_API_URL || 'https://legalvault-jm2n.onrender.com'}/api/notifications/${id}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchNotifications();
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  // ✅ Auto-refresh every 30 seconds
  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // ✅ Format time
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000 / 60); // minutes
    
    if (diff < 1) return 'Just now';
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* ✅ Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-teal-500"
        aria-label="Notifications"
      >
        {unreadCount > 0 ? (
          <BellRing className="w-6 h-6 text-teal-600" />
        ) : (
          <Bell className="w-6 h-6" />
        )}
        
        {/* ✅ Badge */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex items-center justify-center min-w-[20px] h-5 px-1.5 text-xs font-bold text-white bg-red-500 rounded-full shadow-lg">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* ✅ Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-[380px] max-h-[480px] bg-white rounded-xl shadow-2xl border border-gray-100 z-50 flex flex-col overflow-hidden">
          {/* ✅ Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 bg-gray-50/50">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-gray-800">Notifications</h3>
              {unreadCount > 0 && (
                <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-xs text-teal-600 hover:text-teal-800 hover:bg-teal-50 px-2 py-1 rounded transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>

          {/* ✅ Notification List */}
          <div className="overflow-y-auto flex-1">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-teal-600 border-t-transparent"></div>
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <Bell className="w-12 h-12 mb-3 text-gray-300" />
                <p className="text-sm font-medium">No notifications yet</p>
                <p className="text-xs">New notifications will appear here</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif._id}
                  className={`group flex items-start gap-3 px-4 py-3 border-b border-gray-50 hover:bg-gray-50/50 transition-colors cursor-pointer ${
                    !notif.isRead ? 'bg-teal-50/50 hover:bg-teal-50' : ''
                  }`}
                  onClick={() => markAsRead(notif._id)}
                >
                  {/* ✅ Indicator */}
                  {!notif.isRead && (
                    <span className="flex-shrink-0 w-2 h-2 mt-2 bg-teal-600 rounded-full"></span>
                  )}
                  
                  {/* ✅ Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm ${!notif.isRead ? 'font-semibold text-gray-800' : 'text-gray-600'}`}>
                      {notif.message}
                    </p>
                    <div className="flex items-center gap-3 mt-1">
                      <span className="text-xs text-gray-400">{formatTime(notif.createdAt)}</span>
                      {notif.type === 'user_created' && (
                        <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">
                          New User
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ✅ Delete Button */}
                  <button
                    onClick={(e) => deleteNotification(notif._id, e)}
                    className="flex-shrink-0 opacity-0 group-hover:opacity-100 p-1 hover:bg-red-50 rounded transition-all"
                  >
                    <X className="w-3.5 h-3.5 text-red-400 hover:text-red-600" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* ✅ Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2 border-t border-gray-100 bg-gray-50/50 text-center">
              <span className="text-xs text-gray-400">
                Showing last {notifications.length} notifications
              </span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MainLayout from '../layouts/MainLayout';
import AuthContext from '../context/AuthContext';
import { FaUser, FaEnvelope, FaPhone, FaBriefcase, FaCalendar, FaSave, FaEdit, FaUsers, FaFileAlt, FaFileContract } from 'react-icons/fa';

const API_URL = 'https://legalvault-jm2n.onrender.com';

function Profile() {
  const { user, setUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [stats, setStats] = useState({ clients: 0, registrations: 0, contracts: 0 });
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    role: '',
    department: '',
    status: ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        role: user.role || '',
        department: user.department || '',
        status: user.status || ''
      });
      fetchUserStats();
    }
  }, [user]);

  const fetchUserStats = async () => {
    try {
      const token = localStorage.getItem('token');
      // Fetch user's clients count
      const clientsRes = await axios.get(`${API_URL}/api/clients`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userClients = clientsRes.data.filter(c => c.createdBy === user?.id);
      setStats(prev => ({ ...prev, clients: userClients.length }));
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ text: '', type: '' });

    try {
      const token = localStorage.getItem('token');
      const response = await axios.put(`${API_URL}/api/users/${user.id}`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });

      // Update localStorage and context
      const updatedUser = { ...user, ...formData };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      setMessage({ text: 'Profile updated successfully!', type: 'success' });
      setEditMode(false);
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Failed to update profile', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ text: 'Passwords do not match!', type: 'error' });
      return;
    }
    if (passwordData.newPassword.length < 6) {
      setMessage({ text: 'Password must be at least 6 characters', type: 'error' });
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/users/${user.id}`, {
        ...formData,
        password: passwordData.newPassword
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      setMessage({ text: 'Password changed successfully!', type: 'success' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error) {
      setMessage({ text: error.response?.data?.message || 'Failed to change password', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Please login to view profile</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="p-6 max-w-6xl mx-auto">
        {/* Page Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
            My Profile
          </h1>
          <button
            onClick={() => setEditMode(!editMode)}
            className="glass-card px-4 py-2 flex items-center gap-2 hover:scale-105 transition"
          >
            <FaEdit />
            {editMode ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {/* Message */}
        {message.text && (
          <div className={`glass-card p-4 mb-6 ${message.type === 'success' ? 'text-green-400 border-green-400/20' : 'text-red-400 border-red-400/20'}`}>
            {message.text}
          </div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1">
            <div className="glass-card p-6 text-center">
              {/* Profile Image */}
              <div className="relative inline-block">
                <img
                  src={profileImage || `https://ui-avatars.com/api/?name=${user.name}&background=0D9488&color=fff&size=128`}
                  alt="Profile"
                  className="w-32 h-32 rounded-full mx-auto border-4 border-cyan-400/50 object-cover"
                />
                <button className="absolute bottom-0 right-0 glass-card p-2 rounded-full hover:scale-105 transition">
                  <FaEdit className="text-cyan-400" />
                </button>
              </div>

              <h2 className="text-2xl font-bold mt-4">{user.name}</h2>
              <p className="text-sm text-gray-400">{user.role || 'User'}</p>
              <p className="text-sm text-gray-500 mt-1">{user.department || 'General'}</p>

              <div className="mt-4 pt-4 border-t border-white/10">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs ${user.status === 'Active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                    {user.status || 'Active'}
                  </span>
                </div>
                <div className="flex justify-between text-sm mt-2">
                  <span className="text-gray-400">Member Since</span>
                  <span className="text-white">{user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="glass-card p-6 mt-6">
              <h3 className="text-lg font-semibold mb-4">Activity Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FaUsers className="text-cyan-400" />
                    <span>Clients</span>
                  </div>
                  <span className="text-xl font-bold">{stats.clients}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FaFileAlt className="text-yellow-400" />
                    <span>Registrations</span>
                  </div>
                  <span className="text-xl font-bold">{stats.registrations}</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl">
                  <div className="flex items-center gap-3">
                    <FaFileContract className="text-purple-400" />
                    <span>Contracts</span>
                  </div>
                  <span className="text-xl font-bold">{stats.contracts}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Edit Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile Info Form */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-4">Personal Information</h3>
              <form onSubmit={handleUpdateProfile}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                    <div className="flex items-center glass-card px-4 py-3">
                      <FaUser className="text-gray-400 mr-3" />
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        disabled={!editMode}
                        className="bg-transparent outline-none w-full disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Email</label>
                    <div className="flex items-center glass-card px-4 py-3">
                      <FaEnvelope className="text-gray-400 mr-3" />
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="bg-transparent outline-none w-full opacity-50 cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Phone</label>
                    <div className="flex items-center glass-card px-4 py-3">
                      <FaPhone className="text-gray-400 mr-3" />
                      <input
                        type="text"
                        value={formData.phone || ''}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        disabled={!editMode}
                        className="bg-transparent outline-none w-full disabled:opacity-50"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Department</label>
                    <div className="flex items-center glass-card px-4 py-3">
                      <FaBriefcase className="text-gray-400 mr-3" />
                      <input
                        type="text"
                        value={formData.department || ''}
                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                        disabled={!editMode}
                        className="bg-transparent outline-none w-full disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>

                {editMode && (
                  <div className="mt-4 flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="glass-card px-6 py-3 blue-glow flex items-center gap-2 hover:scale-105 transition disabled:opacity-50"
                    >
                      <FaSave />
                      {loading ? 'Saving...' : 'Save Changes'}
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Change Password */}
            <div className="glass-card p-6">
              <h3 className="text-xl font-semibold mb-4">Change Password</h3>
              <form onSubmit={handleChangePassword}>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">New Password</label>
                    <input
                      type="password"
                      placeholder="New password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="glass-card w-full px-4 py-3 bg-transparent outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-gray-400 mb-1">Confirm Password</label>
                    <input
                      type="password"
                      placeholder="Confirm password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="glass-card w-full px-4 py-3 bg-transparent outline-none"
                    />
                  </div>
                  <div className="flex items-end">
                    <button
                      type="submit"
                      disabled={loading || !passwordData.newPassword}
                      className="glass-card w-full py-3 text-yellow-400 hover:scale-105 transition disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default Profile;
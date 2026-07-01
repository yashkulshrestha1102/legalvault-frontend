import MainLayout from "../layouts/MainLayout";
import StatsCard from "../components/dashboard/StatsCard";
import AddUserModal from "../components/modals/AddUserModal";
import EditUserModal from "../components/modals/EditUserModal";
import ViewUserModal from "../components/modals/ViewUserModal";
import DeleteConfirmModal from "../components/modals/DeleteConfirmModal";
import {
  FaUsers,
  FaUserShield,
  FaUserTie,
  FaEye,
  FaEdit,
  FaTrash,
  FaUserCheck,
} from "react-icons/fa";
import { useState, useEffect, useContext } from "react";
import axios from 'axios';
import AuthContext from '../context/AuthContext';

const API_URL = 'https://legalvault-jm2n.onrender.com';

function Users() {
  const { user: currentUser, setUser, refreshUser } = useContext(AuthContext);
  const [openModal, setOpenModal] = useState(false);
  const [editModal, setEditModal] = useState(false);
  const [viewModal, setViewModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('👥 Fetching users from:', `${API_URL}/api/users`);
      const response = await axios.get(`${API_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUsers(response.data);
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      const savedUsers = JSON.parse(localStorage.getItem("users")) || [];
      if (savedUsers.length > 0) {
        setUsers(savedUsers);
      } else {
        setUsers([
          {
            id: 1,
            name: "Yash Kulshrestha",
            email: "admin@legalvault.com",
            phone: "9876543210",
            department: "Management",
            role: "Admin",
            status: "Active",
            createdAt: "01/01/2026",
          },
          {
            id: 2,
            name: "Rahul Sharma",
            email: "rahul@gmail.com",
            phone: "9876543211",
            department: "Legal",
            role: "Consultant",
            status: "Active",
            createdAt: "01/01/2026",
          },
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const addUser = async (newUser) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${API_URL}/api/users`, newUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('❌ Error adding user:', error);
      const updatedUsers = [...users, { ...newUser, id: Date.now() }];
      setUsers(updatedUsers);
      localStorage.setItem("users", JSON.stringify(updatedUsers));
    }
  };

  // ✅ Update User - with proper ID handling
  const updateUser = async (updatedUser) => {
    // ✅ Ensure user ID is present
    const userId = updatedUser._id || updatedUser.id;
    if (!userId) {
      console.error('❌ Cannot update user: No ID found', updatedUser);
      alert('Error: User ID not found');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      console.log('📤 Updating user with ID:', userId);
      
      const response = await axios.put(`${API_URL}/api/users/${userId}`, updatedUser, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('✅ User updated:', response.data);
      fetchUsers();

      // ✅ Check if the updated user is the currently logged-in user
      const currentUserData = JSON.parse(localStorage.getItem('user'));
      if (currentUserData && (currentUserData.id === userId || currentUserData._id === userId)) {
        console.log('🔄 Current user updated, refreshing...');
        
        // Update localStorage
        localStorage.setItem('user', JSON.stringify(response.data));
        
        // Update AuthContext
        if (refreshUser) {
          await refreshUser();
        } else if (setUser) {
          setUser(response.data);
        }
        
        alert('Your permissions have been updated. Please refresh the page for changes to take effect.');
      }
      
    } catch (error) {
      console.error('❌ Error updating user:', error);
      // Fallback: Local storage mein update karo
      const updatedUsers = users.map((user) =>
        user.id === updatedUser.id || user._id === updatedUser._id ? updatedUser : user
      );
      setUsers(updatedUsers);
      localStorage.setItem("users", JSON.stringify(updatedUsers));
      
      // Fallback for current user
      const currentUserData = JSON.parse(localStorage.getItem('user'));
      if (currentUserData && (currentUserData.id === userId || currentUserData._id === userId)) {
        localStorage.setItem('user', JSON.stringify(updatedUser));
        if (setUser) setUser(updatedUser);
      }
    }
  };

  const deleteUser = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = users[selectedIndex];
      const userId = user?._id || user?.id;
      
      if (!userId) {
        console.error('❌ Cannot delete user: No ID found');
        alert('Error: User ID not found');
        return;
      }
      
      await axios.delete(`${API_URL}/api/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchUsers();
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      const updatedUsers = users.filter((_, index) => index !== selectedIndex);
      setUsers(updatedUsers);
      localStorage.setItem("users", JSON.stringify(updatedUsers));
    } finally {
      setDeleteModal(false);
      setSelectedUser(null);
      setSelectedIndex(null);
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const adminUsers = users.filter((u) => u.role === "Admin").length;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading Users...</div>
        </div>
      </MainLayout>
    );
  }

  // ✅ Get unique key for table rows
  const getRowKey = (user, index) => {
    return user._id || user.id || `user-${index}`;
  };

  return (
    <MainLayout>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black">User Management</h1>
        <button
          onClick={() => setOpenModal(true)}
          className="glass-card px-6 py-3 blue-glow"
        >
          Add User
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
        <StatsCard
          title="Total Users"
          value={totalUsers}
          growth={100}
          icon={<FaUsers />}
        />
        <StatsCard
          title="Active Users"
          value={activeUsers}
          growth={95}
          icon={<FaUserCheck />}
        />
        <StatsCard
          title="Admins"
          value={adminUsers}
          growth={80}
          icon={<FaUserShield />}
        />
      </div>

      <div className="glass p-6">
        <input
          type="text"
          placeholder="Search User..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="glass-card w-full p-4 mb-6 bg-transparent outline-none"
        />

        <div className="w-full overflow-x-auto rounded-3xl">
          <table className="min-w-[900px] w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4">User</th>
                <th className="text-left p-4">Email</th>
                <th className="text-left p-4">Department</th>
                <th className="text-left p-4">Role</th>
                <th className="text-left p-4">Status</th>
                <th className="text-left p-4">Joined</th>
                <th className="text-left p-4">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-12 text-gray-400">
                    No Users Found
                  </td>
                </tr>
              ) : (
                users
                  .filter((user) =>
                    user.name?.toLowerCase().includes(searchTerm.toLowerCase())
                  )
                  .map((user, index) => (
                    <tr key={getRowKey(user, index)} className="border-b border-white/5 hover:bg-white/5 transition-all duration-300">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full glass-card flex items-center justify-center">
                            {user.role === "Admin" ? <FaUserShield /> : <FaUserTie />}
                          </div>
                          <div>
                            <h4 className="font-semibold">{user.name}</h4>
                            <p className="text-xs text-slate-400">{user.phone || 'N/A'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">{user.department || 'General'}</td>
                      <td className="p-4">{user.role || 'User'}</td>
                      <td className="p-4">
                        <span
                          className={`
                            px-4 py-2 rounded-full text-sm
                            ${user.status === "Active"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                            }
                          `}
                        >
                          {user.status || 'Active'}
                        </span>
                      </td>
                      <td className="p-4">{user.createdAt || new Date().toLocaleDateString()}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setViewModal(true);
                            }}
                            className="glass-card p-3 text-cyan-400"
                          >
                            <FaEye />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setEditModal(true);
                            }}
                            className="glass-card p-3 text-yellow-400"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedUser(user);
                              setSelectedIndex(index);
                              setDeleteModal(true);
                            }}
                            className="glass-card p-3 text-red-400"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AddUserModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={addUser}
      />

      <EditUserModal
        open={editModal}
        onClose={() => setEditModal(false)}
        onSave={updateUser}
        user={selectedUser}
      />

      <ViewUserModal
        open={viewModal}
        onClose={() => setViewModal(false)}
        user={selectedUser}
      />

      <DeleteConfirmModal
        open={deleteModal}
        onClose={() => {
          setDeleteModal(false);
          setSelectedUser(null);
          setSelectedIndex(null);
        }}
        onConfirm={deleteUser}
      />
    </MainLayout>
  );
}

export default Users;
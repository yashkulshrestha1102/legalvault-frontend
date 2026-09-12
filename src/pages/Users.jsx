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
import AuthContext from '../context/AuthContext';
import api from '../utils/api';

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
      const response = await api.get('/api/users');
      console.log('👥 Users fetched:', response.data.length);
      setUsers(response.data);
    } catch (error) {
      console.error('❌ Error fetching users:', error);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const addUser = async (newUser) => {
    try {
      await api.post('/api/users', newUser);
      fetchUsers();
    } catch (error) {
      console.error('❌ Error adding user:', error);
      alert('Failed to add user: ' + (error.response?.data?.message || error.message));
    }
  };

  const updateUser = async (updatedUser) => {
    const userId = updatedUser._id || updatedUser.id;
    if (!userId) {
      console.error('❌ Cannot update user: No ID found', updatedUser);
      alert('Error: User ID not found');
      return;
    }

    try {
      console.log('📤 Updating user with ID:', userId);
      
      const response = await api.put(`/api/users/${userId}`, updatedUser);
      
      console.log('✅ User updated:', response.data);
      fetchUsers();

      // Check if the updated user is the currently logged-in user
      const currentUserData = JSON.parse(localStorage.getItem('user'));
      if (currentUserData && (currentUserData.id === userId || currentUserData._id === userId)) {
        console.log('🔄 Current user updated, refreshing...');
        
        localStorage.setItem('user', JSON.stringify(response.data));
        
        if (refreshUser) {
          await refreshUser();
        } else if (setUser) {
          setUser(response.data);
        }
        
        alert('Your permissions have been updated. Please refresh the page for changes to take effect.');
      }
      
    } catch (error) {
      console.error('❌ Error updating user:', error);
      alert('Failed to update user: ' + (error.response?.data?.message || error.message));
    }
  };

  const deleteUser = async () => {
    try {
      const user = users[selectedIndex];
      const userId = user?._id || user?.id;
      
      if (!userId) {
        console.error('❌ Cannot delete user: No ID found');
        alert('Error: User ID not found');
        return;
      }
      
      await api.delete(`/api/users/${userId}`);
      fetchUsers();
    } catch (error) {
      console.error('❌ Error deleting user:', error);
      alert('Failed to delete user: ' + (error.response?.data?.message || error.message));
    } finally {
      setDeleteModal(false);
      setSelectedUser(null);
      setSelectedIndex(null);
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.status === "Active").length;
  const adminUsers = users.filter((u) => u.role === "Admin" || u.role === "admin").length;

  if (loading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="text-xl">Loading Users...</div>
        </div>
      </MainLayout>
    );
  }

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
                            {user.role === "Admin" || user.role === "admin" ? <FaUserShield /> : <FaUserTie />}
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
                      <td className="p-4">
                        {user.createdAt 
                          ? new Date(user.createdAt).toLocaleDateString() 
                          : 'N/A'}
                      </td>
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
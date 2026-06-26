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

import { useState, useEffect } from "react";

function Users() {
  const [openModal, setOpenModal] =
    useState(false);

  const [editModal, setEditModal] =
    useState(false);

  const [viewModal, setViewModal] =
    useState(false);

  const [deleteModal, setDeleteModal] =
    useState(false);

  const [selectedUser, setSelectedUser] =
    useState(null);

  const [selectedIndex, setSelectedIndex] =
    useState(null);

  const [users, setUsers] = useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  useEffect(() => {
    const savedUsers =
      JSON.parse(
        localStorage.getItem("users")
      ) || [];

    if (savedUsers.length > 0) {
      setUsers(savedUsers);
    } else {
      const defaultUsers = [
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
      ];

      setUsers(defaultUsers);

      localStorage.setItem(
        "users",
        JSON.stringify(defaultUsers)
      );
    }
  }, []);

  const saveUsers = (data) => {
    setUsers(data);

    localStorage.setItem(
      "users",
      JSON.stringify(data)
    );
  };

  const addUser = (newUser) => {
    const updatedUsers = [
      ...users,
      {
        ...newUser,
        id: Date.now(),
      },
    ];

    saveUsers(updatedUsers);
  };

  const updateUser = (updatedUser) => {
    const updatedUsers =
      users.map((user) =>
        user.id === updatedUser.id
          ? updatedUser
          : user
      );

    saveUsers(updatedUsers);
  };

  const deleteUser = () => {
    const updatedUsers =
      users.filter(
        (_, index) =>
          index !== selectedIndex
      );

    saveUsers(updatedUsers);

    setDeleteModal(false);

    setSelectedUser(null);

    setSelectedIndex(null);
  };

  const totalUsers = users.length;

  const activeUsers =
    users.filter(
      (u) => u.status === "Active"
    ).length;

  const adminUsers =
    users.filter(
      (u) => u.role === "Admin"
    ).length;

  return (
    <MainLayout>
      {/* HEADER */}

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black">
          User Management
        </h1>

        <button
          onClick={() =>
            setOpenModal(true)
          }
          className="
          glass-card
          px-6
          py-3
          blue-glow
        "
        >
          Add User
        </button>
      </div>

      {/* STATS */}

      <div
className="
grid
grid-cols-1
sm:grid-cols-2
xl:grid-cols-3
gap-6
mb-8
"
>
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

      {/* TABLE */}

      <div className="glass p-6">
        <input
          type="text"
          placeholder="Search User..."
          value={searchTerm}
          onChange={(e) =>
            setSearchTerm(
              e.target.value
            )
          }
          className="
          glass-card
          w-full
          p-4
          mb-6
          bg-transparent
          outline-none
        "
        />

        <div
className="
w-full
overflow-x-auto
rounded-3xl
"
>
          <table className="min-w-[900px] w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left p-4">
                  User
                </th>

                <th className="text-left p-4">
                  Email
                </th>

                <th className="text-left p-4">
                  Department
                </th>

                <th className="text-left p-4">
                  Role
                </th>

                <th className="text-left p-4">
                  Status
                </th>

                <th className="text-left p-4">
                  Joined
                </th>

                <th className="text-left p-4">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {users
                .filter((user) =>
                  user.name
                    .toLowerCase()
                    .includes(
                      searchTerm.toLowerCase()
                    )
                )
                .map(
                  (
                    user,
                    index
                  ) => (
                    <tr
                      key={user.id}
                      className="
                      border-b
                      border-white/5
                    "
                    >
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div
                            className="
                            w-12
                            h-12
                            rounded-full
                            glass-card
                            flex
                            items-center
                            justify-center
                          "
                          >
                            {user.role ===
                            "Admin" ? (
                              <FaUserShield />
                            ) : (
                              <FaUserTie />
                            )}
                          </div>

                          <div>
                            <h4 className="font-semibold">
                              {
                                user.name
                              }
                            </h4>

                            <p className="text-xs text-slate-400">
                              {
                                user.phone
                              }
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        {user.email}
                      </td>

                      <td className="p-4">
                        {
                          user.department
                        }
                      </td>

                      <td className="p-4">
                        {user.role}
                      </td>

                      <td className="p-4">
                        <span
                          className={`
                          px-4
                          py-2
                          rounded-full
                          text-sm
                          ${
                            user.status ===
                            "Active"
                              ? "bg-green-500/20 text-green-400"
                              : "bg-red-500/20 text-red-400"
                          }
                        `}
                        >
                          {
                            user.status
                          }
                        </span>
                      </td>

                      <td className="p-4">
                        {
                          user.createdAt
                        }
                      </td>

                      <td className="p-4">
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setSelectedUser(
                                user
                              );

                              setViewModal(
                                true
                              );
                            }}
                            className="
                            glass-card
                            p-3
                            text-cyan-400
                          "
                          >
                            <FaEye />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedUser(
                                user
                              );

                              setEditModal(
                                true
                              );
                            }}
                            className="
                            glass-card
                            p-3
                            text-yellow-400
                          "
                          >
                            <FaEdit />
                          </button>

                          <button
                            onClick={() => {
                              setSelectedUser(
                                user
                              );

                              setSelectedIndex(
                                index
                              );

                              setDeleteModal(
                                true
                              );
                            }}
                            className="
                            glass-card
                            p-3
                            text-red-400
                          "
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                )}







                
            </tbody>
          </table>
        </div>
      </div>

      <AddUserModal
        open={openModal}
        onClose={() =>
          setOpenModal(false)
        }
        onSave={addUser}
      />

      <EditUserModal
        open={editModal}
        onClose={() =>
          setEditModal(false)
        }
        onSave={updateUser}
        user={selectedUser}
      />

      <ViewUserModal
        open={viewModal}
        onClose={() =>
          setViewModal(false)
        }
        user={selectedUser}
      />

      <DeleteConfirmModal
        open={deleteModal}
        onClose={() =>
          setDeleteModal(false)
        }
        onConfirm={deleteUser}
      />
    </MainLayout>
  );
}

export default Users;


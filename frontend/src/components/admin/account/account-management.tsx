"use client";

import React, { useEffect, useState } from "react";
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  RefreshCw,
  User,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { Account, NewAccountInput } from "../../../types/account";
import { notify } from "../../../lib/toast";
import {
  getAllMembers,
  addAccount,
  updateAccount,
  deleteAccount,
} from "../../../services/admin_api/memberService";
import { authService } from "../../../services/api/authService";
import AddAccountModal from "./add-account-modal";
import EditAccountModal from "./edit-account";

const mapApiAccountToAccount = (item: any, idx: number): Account => ({
  id: item._id || String(idx + 1),
  memberId: item.member?.memberId || "",
  fullName: item.fullName,
  email: item.email,
  status: item.status === 1 ? "Active" : "Locked",
  phoneNumber: item.phoneNumber,
  address: item.address,
  image: item.image,
  registerDate: item.registerDate,
  member: item.member,
  role: item.role || "Customer",
  username: item.username,
  dateOfBirth: item.dateOfBirth,
  gender: item.gender,
  _id: item._id,
  roleId: item.roleId || "", // Thêm roleId vào Account để lọc, fallback nếu không có
});

const mapStatusToApi = (status: "Active" | "Locked"): number =>
  status === "Active" ? 1 : 0;

const AccountManagement: React.FC = () => {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All Status");
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchAccounts = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");

      const res = await getAllMembers(token);
      if (!res.data || !res.data.data) {
        throw new Error("No data returned from API");
      }
      const apiAccounts = (res.data.data || []).map(mapApiAccountToAccount);
      // Sort accounts by registerDate in descending order (newest first)
      apiAccounts.sort(
        (a, b) =>
          new Date(b.registerDate || "").getTime() -
          new Date(a.registerDate || "").getTime()
      );
      setAccounts(apiAccounts);
      setCurrentPage(1); // Reset to first page when fetching new data
    } catch (err: unknown) {
      const error = err as Error;
      setError(error.message || "Failed to fetch accounts");
      notify.error(`Failed to fetch members: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const filteredAccounts = accounts.filter((account) => {
    // Chỉ nhận account có roleId là Member
    const isMember = account.roleId === "507f1f77bcf86cd799439028";
    const matchesSearch =
      account.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.memberId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All Status" || account.status === statusFilter;
    return isMember && matchesSearch && matchesStatus;
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredAccounts.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentAccounts = filteredAccounts.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setShowDropdown(null); // Close any open dropdown when changing pages
    }
  };

  const getAccountStats = () => {
    // Đếm từ filteredAccounts (đã lọc chỉ members) thay vì accounts gốc
    const total = filteredAccounts.length;
    const active = filteredAccounts.filter((acc) => acc.status === "Active").length;
    const locked = filteredAccounts.filter((acc) => acc.status === "Locked").length;

    return { total, active, locked };
  };

  const stats = getAccountStats();

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "Active":
        return "bg-green-100 text-green-800";
      case "Locked":
        return "bg-red-100 text-red-800"; // Đổi sang màu đỏ
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Status");
    setCurrentPage(1); // Reset to first page when resetting filters
    notify.info("Filters have been reset");
  };

  const handleDeleteAccount = (id: string) => {
    const account = accounts.find((acc) => acc.id === id);
    if (account) {
      setAccountToDelete(account);
      setShowDeleteModal(true);
      setShowDropdown(null);
    }
  };

  const confirmDeleteAccount = async () => {
    if (!accountToDelete) return;

    try {
      const token = authService.getToken();
      if (!token) throw new Error("No auth token");

      const loadingToast = notify.loading(
        `Deleting ${accountToDelete.fullName}'s account...`
      );

      await deleteAccount(accountToDelete.id, token);

      setAccounts((prev) =>
        prev.filter((account) => account.id !== accountToDelete.id)
      );

      notify.dismiss(loadingToast);
      notify.success(
        `${accountToDelete.fullName}'s account deleted successfully`
      );

      setShowDeleteModal(false);
      setAccountToDelete(null);

      // Adjust current page if necessary
      if (currentAccounts.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error deleting account:", error);
      notify.error(`Failed to delete account: ${error.message}`);
    }
  };

  const cancelDeleteAccount = () => {
    setShowDeleteModal(false);
    setAccountToDelete(null);
  };

  const handleAddAccount = async (newAccountData: NewAccountInput) => {
    try {
      const token = authService.getToken();
      if (!token) throw new Error("No auth token");

      const loadingToast = notify.loading(
        `Creating account for ${newAccountData.fullName}...`
      );

      const apiData = {
        ...newAccountData,
        status: mapStatusToApi(
          newAccountData.status === 1 ? "Active" : "Locked"
        ),
        registerDate: new Date().toISOString(), // Add registerDate
      };

      await addAccount(apiData, token);
      await fetchAccounts();

      notify.dismiss(loadingToast);
      notify.success(
        `Account created successfully for ${newAccountData.fullName}`
      );
      setIsAddModalOpen(false);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error adding account:", error);
      notify.error(`Failed to create account: ${error.message}`);
    }
  };

  const handleEditAccount = async (updatedAccount: Account) => {
    try {
      const token = authService.getToken();
      if (!token) throw new Error("No auth token");

      const loadingToast = notify.loading(
        `Updating ${updatedAccount.fullName}'s account...`
      );

      const apiData = {
        fullName: updatedAccount.fullName,
        email: updatedAccount.email,
        phoneNumber: updatedAccount.phoneNumber,
        address: updatedAccount.address,
        status: mapStatusToApi(updatedAccount.status),
        dateOfBirth: updatedAccount.dateOfBirth,
        gender: updatedAccount.gender,
      };

      await updateAccount(updatedAccount._id || "", apiData, token);

      setAccounts((prev) =>
        prev.map((account) =>
          account.id === updatedAccount.id ? updatedAccount : account
        )
      );

      notify.dismiss(loadingToast);
      notify.success(
        `Account updated successfully for ${updatedAccount.fullName}`
      );

      setIsEditModalOpen(false);
      setSelectedAccount(null);
    } catch (err: unknown) {
      const error = err as Error;
      console.error("Error editing account:", error);
      notify.error(`Failed to update account: ${error.message}`);
    }
  };

  const handleEditClick = (account: Account) => {
    setSelectedAccount(account);
    setIsEditModalOpen(true);
    setShowDropdown(null);
  };

  const handleClickOutside = () => {
    setShowDropdown(null);
  };

  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading members...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <User className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to load members
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAccounts}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen p-4 sm:p-6 relative"
      onClick={handleClickOutside}
    >
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Member Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage member accounts across your organization
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Member</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">
                All members registered
              </p>
            </div>
            <User className="w-8 h-8 text-gray-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Members</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.active}
              </p>
              <p className="text-xs text-gray-500 mt-1">Currently active</p>
            </div>
            <User className="w-8 h-8 text-green-400" />
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Locked Members</p>
              <p className="text-3xl font-bold text-red-600">{stats.locked}</p>
              <p className="text-xs text-gray-500 mt-1">Currently locked</p>
            </div>
            <User className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Member List
            </h2>
            <button
              onClick={fetchAccounts}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="relative sm:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, email, or member ID..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1); // Reset to first page on search
                }}
              />
            </div>

            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1); // Reset to first page on filter change
              }}
            >
              <option value="All Status">All Status</option>
              <option value="Active">Active</option>
              <option value="Locked">Locked</option>
            </select>

            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <div className="min-w-[800px] sm:min-w-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Member ID
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Account
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Phone Number
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Address
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentAccounts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500 text-sm sm:text-base"
                    >
                      No members found matching your filters.
                    </td>
                  </tr>
                ) : (
                  currentAccounts.map((account) => (
                    <tr key={account.id} className="hover:bg-gray-50 relative">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {account.memberId}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {account.fullName}
                          </div>
                          <div className="text-xs sm:text-sm text-gray-500">
                            {account.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                            account.status
                          )}`}
                        >
                          {account.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {account.phoneNumber}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {account.address}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="relative">
                          <button
                            data-account-id={account.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDropdown(
                                showDropdown === account.id ? null : account.id
                              );
                            }}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                          >
                            <MoreHorizontal className="w-4 h-4" />
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

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="p-4 sm:p-6 flex justify-between items-center border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredAccounts.length)} of{" "}
              {filteredAccounts.length} members
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${
                  currentPage === 1
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-1 rounded-lg text-sm ${
                      currentPage === page
                        ? "bg-blue-500 text-white"
                        : "text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg ${
                  currentPage === totalPages
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Dropdown Menu Portal - Positioned outside table */}
      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(null)}
        >
          <div
            className="fixed bg-white rounded-md shadow-lg border border-gray-200 z-50 min-w-[160px]"
            style={(() => {
              const buttonElement = document.querySelector(
                `[data-account-id="${showDropdown}"]`
              );
              if (!buttonElement) return {};

              const buttonRect = buttonElement.getBoundingClientRect();
              const dropdownHeight = 80; // Approximate height of dropdown with 2 items
              const viewportHeight = window.innerHeight;
              const spaceBelow = viewportHeight - buttonRect.bottom;
              const spaceAbove = buttonRect.top;

              // Check if dropdown should appear above or below
              const shouldAppearAbove =
                spaceBelow < dropdownHeight + 10 && spaceAbove > dropdownHeight;

              const left = Math.min(
                window.innerWidth - 170, // dropdown width + padding
                Math.max(10, buttonRect.right - 160)
              );

              const top = shouldAppearAbove
                ? buttonRect.top - dropdownHeight - 5
                : buttonRect.bottom + 5;

              return {
                left: `${left}px`,
                top: `${Math.max(
                  10,
                  Math.min(top, viewportHeight - dropdownHeight - 10)
                )}px`,
              };
            })()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              <button
                onClick={() => {
                  const account = accounts.find(
                    (acc) => acc.id === showDropdown
                  );
                  if (account) handleEditClick(account);
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Member
              </button>
              <button
                onClick={() => {
                  handleDeleteAccount(showDropdown);
                }}
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Member
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && accountToDelete && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={cancelDeleteAccount}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5-4h4a2 2 0 012 2v2H8V5a2 2 0 012-2z"
                  />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Member
                </h3>
              </div>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Are you sure you want to delete this member?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">
                    {accountToDelete.fullName}
                  </p>
                  <p className="text-gray-600">
                    {accountToDelete.email || "-"}
                  </p>
                  <p className="text-gray-600">
                    Status: {accountToDelete.status || "Active"}
                  </p>
                </div>
              </div>
              <p className="text-red-600 text-sm mt-3 font-medium">
                ⚠️ This action cannot be undone. All related data will also be
                affected.
              </p>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteAccount}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteAccount}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
              >
                Delete Member
              </button>
            </div>
          </div>
        </div>
      )}

      <AddAccountModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAddAccount={handleAddAccount}
      />

      <EditAccountModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onEditAccount={handleEditAccount}
        account={selectedAccount}
      />
    </div>
  );
};

export default AccountManagement;

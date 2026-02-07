/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { userService } from "../../../services/admin_api/userService";
import EditEmployee from "./edit-employee";
import { notify } from "../../../lib/toast";
import AddEmployeeModal from "./add-emloyee-modal";

const STAFF_ROLE_ID = "684f84c7a2c60b9b2be5e315";

// Types for employee data
export interface EmployeeData {
  id: string;
  _id?: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other";
  image?: string;
  roleId: string;
  status: number;
  createdAt?: string; // Added for sorting
  member: {
    memberId?: string;
    score: number;
  };
}

export type NewEmployeeData = Omit<
  EmployeeData,
  "id" | "status" | "createdAt"
> & {
  password?: string;
  status?: number;
  id?: string;
  createdAt?: string;
};

const mapApiEmployeeToAccount = (item: any, idx: number): EmployeeData => ({
  id: item._id || String(idx + 1),
  _id: item._id,
  username: item.username,
  email: item.email,
  fullName: item.fullName,
  phoneNumber: item.phoneNumber,
  address: item.address,
  dateOfBirth: item.dateOfBirth,
  gender: item.gender,
  image: item.image,
  roleId: item.roleId,
  status: item.status,
  createdAt: item.createdAt || new Date().toISOString(), // Fallback to current date
  member: {
    // Check multiple possible locations for memberId to ensure it's captured
    memberId: item.memberId || (item.member && item.member.memberId) || "",
    score: (item.member && item.member.score) || 0,
  },
});

const mapStatusToApi = (status: "Active" | "Locked"): number =>
  status === "Active" ? 1 : 0;

const getStatusBadgeColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800";
    case "Locked":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const EmployeeManagement: React.FC = () => {
  const [employees, setEmployees] = useState<EmployeeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All Status");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [staffToDelete, setStaffToDelete] = useState<EmployeeData | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<EmployeeData | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const fetchEmployees = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");

      const res = await userService.getUsersByRoleId(STAFF_ROLE_ID);
      const allUsers = res.data || res;

      const staffMembers = allUsers
        .filter((user: any) => user.roleId === STAFF_ROLE_ID)
        .map(mapApiEmployeeToAccount);
      // Sort by createdAt in descending order (newest first)
      staffMembers.sort(
        (a: EmployeeData, b: EmployeeData) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
      setEmployees(staffMembers);
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.message || "Failed to fetch employees");
      notify.error(`Failed to fetch employees: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  const filteredEmployees = employees.filter((emp) => {
    const matchesSearch =
      emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.phoneNumber.includes(searchTerm.toLowerCase()) ||
      (emp.member.memberId &&
        emp.member.memberId.toLowerCase().includes(searchTerm.toLowerCase())); // Include memberId in search
    const empStatus = emp.status === 1 ? "Active" : "Locked";
    const matchesStatus =
      statusFilter === "All Status" || empStatus === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredEmployees.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentEmployees = filteredEmployees.slice(startIndex, endIndex);

  const getEmployeeStats = () => {
    const total = employees.length;
    const active = employees.filter((emp) => emp.status === 1).length;
    const locked = employees.filter((emp) => emp.status === 0).length;
    return { total, active, locked };
  };

  const stats = getEmployeeStats();

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setShowDropdown(null);
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Status");
    setCurrentPage(1);
    notify.info("Filters have been reset");
  };

  const handleAddEmployee = async (newEmployee: NewEmployeeData) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");

      // Kiểm tra và đảm bảo có StaffId
      if (
        !newEmployee.member?.memberId ||
        !newEmployee.member.memberId.trim()
      ) {
        notify.error("Staff ID is required to create an employee");
        return;
      }

      const loadingToast = notify.loading(
        `Creating account for ${newEmployee.fullName}...`
      );

      // Đảm bảo memberId từ đối tượng member được sử dụng đúng cách
      const staffId = newEmployee.member?.memberId.trim();
      console.log("Using Staff ID:", staffId);

      const apiData: any = {
        ...newEmployee,
        memberId: staffId, // Đặt ID nhân viên ở đây để gửi đến API
        roleId: STAFF_ROLE_ID,
        status: mapStatusToApi(newEmployee.status === 1 ? "Active" : "Locked"),
        createdAt: new Date().toISOString(),
        member: {
          memberId: staffId, // Đảm bảo member.memberId không null
          score: newEmployee.member?.score || 0,
        },
      };

      console.log("🚀 API Payload for addUser:", apiData); // Debug payload

      const response = await userService.addUser(apiData);
      const addedEmployee = response.data || response;

      console.log("📥 API Response from addUser:", addedEmployee); // Debug response

      // Make sure to include the memberId in the employee data that's added to state
      setEmployees((prev) => [
        mapApiEmployeeToAccount(
          {
            ...addedEmployee,
            createdAt: apiData.createdAt,
            memberId: staffId, // Đảm bảo ID được bảo tồn
            member: {
              memberId: staffId, // Lưu ID trong đối tượng member
              score: newEmployee.member?.score || 0,
            },
          },
          0
        ),
        ...prev,
      ]);

      notify.dismiss(loadingToast);
      notify.success(
        `Account created successfully for ${newEmployee.fullName}`
      );
      setIsAddModalOpen(false);
      setCurrentPage(1);
    } catch (err: any) {
      console.error("❌ Error in handleAddEmployee:", err); // Debug error
      notify.error(`Failed to add employee: ${err.message}`);
    }
  };

  const handleUpdateEmployee = async (updatedEmployee: NewEmployeeData) => {
    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");
      // Đảm bảo id là string
      const id = (updatedEmployee.id || updatedEmployee._id) as string;
      if (!id) throw new Error("No employee id");
      const loadingToast = notify.loading(
        `Updating account for ${updatedEmployee.fullName}...`
      );
      const apiData = {
        ...updatedEmployee,
        status: mapStatusToApi(
          updatedEmployee.status === 1 ? "Active" : "Locked"
        ),
      };
      await userService.updateUserById(id, apiData as any);
      setEmployees((prev) =>
        prev.map((emp) =>
          (emp._id || emp.id) === id ? { ...emp, ...updatedEmployee } : emp
        )
      );
      notify.dismiss(loadingToast);
      notify.success(
        `Account updated successfully for ${updatedEmployee.fullName}`
      );
      setIsEditModalOpen(false);
    } catch (err: any) {
      notify.error(`Failed to update employee: ${err.message}`);
    }
  };

  const handleDeleteEmployee = (id: string) => {
    const employee = employees.find((emp) => (emp._id || emp.id) === id);
    if (employee) {
      setStaffToDelete(employee);
      setShowDeleteModal(true);
      setShowDropdown(null);
    }
  };

  const handleConfirmDeleteEmployee = async () => {
    if (!staffToDelete) return;

    try {
      const token = localStorage.getItem("authToken");
      if (!token) throw new Error("No auth token");

      const loadingToast = notify.loading(
        `Deleting ${staffToDelete.fullName}'s account...`
      );

      await userService.deleteUserById(staffToDelete._id || staffToDelete.id);

      setEmployees((prev) =>
        prev.filter(
          (emp) =>
            (emp._id || emp.id) !== (staffToDelete._id || staffToDelete.id)
        )
      );

      notify.dismiss(loadingToast);
      notify.success(
        `${staffToDelete.fullName}'s account deleted successfully`
      );
      setShowDeleteModal(false);
      setStaffToDelete(null);

      if (currentEmployees.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err: any) {
      notify.error(`Failed to delete employee: ${err.message}`);
    }
  };

  const cancelDeleteEmployee = () => {
    setShowDeleteModal(false);
    setStaffToDelete(null);
  };

  const handleEditClick = (staff: EmployeeData) => {
    setSelectedStaff(staff);
    setIsEditModalOpen(true);
    setShowDropdown(null);
  };

  const handleClickOutside = () => {
    setShowDropdown(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading staff...</p>
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
            Failed to load staff
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchEmployees}
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
              Staff Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage staff accounts across your organization
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Staff</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Staff</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">All staff registered</p>
            </div>
            <User className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Staff</p>
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
              <p className="text-sm text-gray-600">Locked Staff</p>
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
              Staff List
            </h2>
            <button
              onClick={fetchEmployees}
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
                placeholder="Search by name, email, or phone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
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
          <div className="min-w-[900px] sm:min-w-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    STAFF ID
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Name
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Email
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Phone
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentEmployees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500 text-sm sm:text-base"
                    >
                      No staff found matching your filters.
                    </td>
                  </tr>
                ) : (
                  currentEmployees.map((emp) => (
                    <tr
                      key={emp._id || emp.id}
                      className="hover:bg-gray-50 relative"
                    >
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {emp.member.memberId || "N/A"}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {emp.fullName}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {emp.email}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {emp.phoneNumber}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                            emp.status === 1 ? "Active" : "Locked"
                          )}`}
                        >
                          {emp.status === 1 ? "Active" : "Locked"}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="relative">
                          <button
                            data-employee-id={emp._id || emp.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDropdown(
                                showDropdown === (emp._id || emp.id)
                                  ? null
                                  : emp._id || emp.id
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

        {totalPages > 1 && (
          <div className="p-4 sm:p-6 flex justify-between items-center border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, filteredEmployees.length)} of{" "}
              {filteredEmployees.length} staff
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

      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(null)}
        >
          <div
            className="fixed bg-white rounded-md shadow-lg border border-gray-200 z-50 min-w-[160px]"
            style={(() => {
              const buttonElement = document.querySelector(
                `[data-employee-id="${showDropdown}"]`
              );
              if (!buttonElement) return {};

              const buttonRect = buttonElement.getBoundingClientRect();
              const dropdownHeight = 120;
              const viewportHeight = window.innerHeight;
              const spaceBelow = viewportHeight - buttonRect.bottom;
              const spaceAbove = buttonRect.top;

              const shouldAppearAbove =
                spaceBelow < dropdownHeight + 10 && spaceAbove > dropdownHeight;

              const left = Math.min(
                window.innerWidth - 170,
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
                  const emp = employees.find(
                    (emp) => (emp._id || emp.id) === showDropdown
                  );
                  if (emp) handleEditClick(emp);
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Staff
              </button>
              <button
                onClick={() => {
                  handleDeleteEmployee(showDropdown);
                }}
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && staffToDelete && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={cancelDeleteEmployee}
        >
          <div
            className="bg-white rounded-lg p-6 max-w-md w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0 w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Delete Staff
                </h3>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Are you sure you want to delete this staff member?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">
                    {staffToDelete.fullName}
                  </p>
                  <p className="text-gray-600">{staffToDelete.email || "-"}</p>
                  <p className="text-gray-600">
                    Status: {staffToDelete.status === 1 ? "Active" : "Locked"}
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
                onClick={cancelDeleteEmployee}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDeleteEmployee}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
              >
                Delete Staff
              </button>
            </div>
          </div>
        </div>
      )}

      {isEditModalOpen && selectedStaff && (
        <EditEmployee
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          employee={selectedStaff}
          onUpdateEmployee={handleUpdateEmployee}
        />
      )}

      {isAddModalOpen && (
        <AddEmployeeModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAddEmployee={handleAddEmployee}
          token={localStorage.getItem("authToken") || ""}
        />
      )}
    </div>
  );
};

export default EmployeeManagement;

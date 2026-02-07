"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  MoreHorizontal,
  Star,
  Phone,
  Mail,
  Gift,
  Users,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { notify, MESSAGES } from "../../../lib/toast";
import {
  getAllMembers,
  updateMemberPoints,
} from "../../../services/admin_api/memberService";
import { authService } from "../../../services/api/authService";

// Type Definitions
export interface MemberData {
  id: string;
  name: string;
  phone: string;
  email: string;
  points: number;
  // level: "Gold" | "Silver" | "Bronze" | "Regular"; // Removed level field
  joinDate: string;
  status: "Active" | "Locked";
  address: string;
  totalSpent: number; // Kept in type for existing data compatibility, but unused
  lastVisit: string;
  birthDate: string;
  roleId?: string;
}

export interface MemberStats {
  total: number;
  active: number;
  locked: number;
  totalPoints: number;
}

// Utility functions
// Removed getLevelBadgeColor function as level field is no longer used

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

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
};

const getMemberStats = (members: MemberData[]): MemberStats => {
  // Đếm trực tiếp từ mảng members đã được truyền vào (đã lọc)
  const total = members.length;
  const active = members.filter((m) => m.status === "Active").length;
  const locked = members.filter((m) => m.status === "Locked").length;
  const totalPoints = members.reduce((sum, m) => sum + m.points, 0);
  return { total, active, locked, totalPoints };
};

const filterMembers = (
  members: MemberData[],
  searchTerm: string
) => {
  return members.filter((member) => {
    // Chỉ hiển thị members có roleId là Member (giống admin account management)
    const isMember = member.roleId === "507f1f77bcf86cd799439028";
    const matchesSearch =
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm) ||
      member.id.toLowerCase().includes(searchTerm.toLowerCase());
    return isMember && matchesSearch;
  });
};

const sortMembers = (members: MemberData[], sortField: string, sortDirection: "asc" | "desc") => {
  return [...members].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case "name":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case "totalPoints":
        aValue = a.points;
        bValue = b.points;
        break;
      case "lastActivity":
        aValue = new Date(a.lastVisit).getTime();
        bValue = new Date(b.lastVisit).getTime();
        break;
      case "joinDate":
        aValue = new Date(a.joinDate).getTime();
        bValue = new Date(b.joinDate).getTime();
        break;
      default:
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
    }

    if (sortDirection === "asc") {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
};

// Points Management Modal
const PointsModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  member: MemberData | null;
  onUpdatePoints: (
    memberId: string,
    points: number,
    operation: "add" | "deduct"
  ) => void;
}> = ({ isOpen, onClose, member, onUpdatePoints }) => {
  const [points, setPoints] = useState("");
  const [operation, setOperation] = useState<"add" | "deduct">("add");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen && member) {
      setPoints("");
      setOperation("add");
    }
  }, [isOpen, member]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleSubmit = async () => {
    if (!member || !points || parseInt(points) <= 0) {
      notify.warning("Please enter a valid point amount");
      return;
    }
    if (operation === "deduct" && parseInt(points) > member.points) {
      notify.warning("Cannot deduct more points than the member has");
      return;
    }
    setIsSubmitting(true);
    try {
      const loadingToast = notify.loading(
        `${operation === "add" ? "Adding" : "Deducting"} points...`
      );
      await new Promise((resolve) => setTimeout(resolve, 1000));
      onUpdatePoints(member.id, parseInt(points), operation);
      notify.dismiss(loadingToast);
      notify.success(
        `Successfully ${operation === "add" ? "added" : "deducted"} ${points} points`
      );
      setPoints("");
      onClose();
    } catch (error) {
      console.error("Points update error:", error);
      notify.error(MESSAGES.POINT.POINTS_ERROR);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-md w-full max-w-lg mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gray-50 px-6 py-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Manage Member Points</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-6">
          <div className="mb-6 pb-4 border-b border-gray-200">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <h3 className="font-medium text-gray-900">{member.name}</h3>
                <p className="text-sm text-gray-600">ID: {member.id}</p>
              </div>
              <div className="ml-auto text-right">
                <span className="text-sm text-gray-600">Current points</span>
                <p className="text-lg font-semibold text-orange-600">
                  {member.points.toLocaleString()}
                </p>
              </div>
            </div>
            {/* Removed level display from modal */}
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Operation</label>
              <div className="grid grid-cols-2 gap-3">
                <div
                  className={`border rounded-md px-4 py-3 flex items-center cursor-pointer ${
                    operation === "add" ? "border-orange-500 bg-orange-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setOperation("add")}
                >
                  <input
                    type="radio"
                    id="add"
                    name="operation"
                    checked={operation === "add"}
                    onChange={() => setOperation("add")}
                    className="mr-2"
                  />
                  <label htmlFor="add" className="cursor-pointer flex-1">
                    <span className="font-medium">Add Points</span>
                    <p className="text-xs text-gray-500 mt-1">Increase member points</p>
                  </label>
                </div>
                <div
                  className={`border rounded-md px-4 py-3 flex items-center cursor-pointer ${
                    operation === "deduct" ? "border-red-500 bg-red-50" : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => setOperation("deduct")}
                >
                  <input
                    type="radio"
                    id="deduct"
                    name="operation"
                    checked={operation === "deduct"}
                    onChange={() => setOperation("deduct")}
                    className="mr-2"
                  />
                  <label htmlFor="deduct" className="cursor-pointer flex-1">
                    <span className="font-medium">Deduct Points</span>
                    <p className="text-xs text-gray-500 mt-1">Decrease member points</p>
                  </label>
                </div>
              </div>
            </div>
            <div>
              <label htmlFor="points" className="block text-sm font-medium text-gray-700 mb-1">Points Amount</label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <input
                  type="number"
                  id="points"
                  value={points}
                  min="1"
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val === "" || parseInt(val) >= 0) setPoints(val);
                  }}
                  className="block w-full pr-10 sm:text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-2 px-3 border"
                  placeholder="Enter points amount"
                  disabled={isSubmitting}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <Star className="h-4 w-4 text-gray-400" />
                </div>
              </div>
              {operation === "deduct" && member && points && parseInt(points) > member.points && (
                <p className="mt-1 text-sm text-red-600">Cannot deduct more points than available ({member.points})</p>
              )}
            </div>
            {points && parseInt(points) > 0 && (
              <div className="mt-4 bg-gray-50 border border-gray-200 rounded-md p-4">
                <h4 className="text-sm font-medium text-gray-700 mb-2">After Update Preview</h4>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Current Points:</span>
                  <span className="font-medium">{member.points.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center mt-1">
                  <span className="text-sm text-gray-600">{operation === "add" ? "Points to Add:" : "Points to Deduct:"}</span>
                  <span className={operation === "add" ? "font-medium text-green-600" : "font-medium text-red-600"}>
                    {operation === "add" ? "+" : "-"}{parseInt(points).toLocaleString()}
                  </span>
                </div>
                <div className="border-t border-gray-200 mt-2 pt-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-700">New Total:</span>
                    <span className="font-bold">
                      {(operation === "add" ? member.points + parseInt(points) : Math.max(0, member.points - parseInt(points))).toLocaleString()}
                    </span>
                  </div>
                </div>
                {/* Removed level upgrade/downgrade notification */}
              </div>
            )}
          </div>
        </div>
        <div className="bg-gray-50 px-6 py-4 flex items-center justify-end gap-2 border-t">
          <button
            type="button"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none ${operation === "add" ? "bg-orange-600 hover:bg-orange-700" : "bg-red-600 hover:bg-red-700"} ${
              isSubmitting || !points || parseInt(points) <= 0 || (operation === "deduct" && member && parseInt(points) > member.points) ? "opacity-50 cursor-not-allowed" : ""
            }`}
            onClick={handleSubmit}
            disabled={
              isSubmitting ||
              !points ||
              parseInt(points) <= 0 ||
              (operation === "deduct" && member && parseInt(points) > member.points)
            }
          >
            {isSubmitting ? (
              <span className="flex items-center">
                <RefreshCw className="animate-spin -ml-1 mr-2 h-4 w-4" />
                Processing...
              </span>
            ) : (
              `${operation === "add" ? "Add" : "Deduct"} Points`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// API Types
interface ApiMember {
  _id: string;
  fullName: string;
  phoneNumber: string;
  email: string;
  address: string;
  registerDate?: string;
  updatedAt?: string;
  dateOfBirth?: string;
  status: number;
  roleId?: string;
  member?: {
    memberId?: string;
    score: number;
  };
  totalSpending?: number;
}

interface ApiResponse {
  data: {
    success: boolean;
    message?: string;
    data?: ApiMember[];
  };
}

const MemberManagement: React.FC = () => {
  const [members, setMembers] = useState<MemberData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  // const [levelFilter, setLevelFilter] = useState<string>("All Levels"); // Removed level filter
  const [customerSortField, setCustomerSortField] = useState<"name" | "totalPoints" | "lastActivity" | "joinDate">("name");
  const [customerSortDirection, setCustomerSortDirection] = useState<"asc" | "desc">("asc");
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [showPointsModal, setShowPointsModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<MemberData | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Removed getLevelByScore function as level field is no longer used

  const fetchMembers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken") || authService.getToken();
      if (!token) {
        notify.error("You are not logged in or the token is invalid!");
        setLoading(false);
        return;
      }
      const res = (await getAllMembers(token)) as ApiResponse;
      const apiMembers = (res.data.data || []).map((item: ApiMember) => {
        const score = item.member && typeof item.member.score === "number" ? item.member.score : 0;
        return {
          id: item._id || "",
          name: item.fullName || "",
          phone: item.phoneNumber || "",
          email: item.email || "",
          points: score,
          // level: getLevelByScore(score), // Removed level assignment
          joinDate: item.registerDate ? new Date(item.registerDate).toLocaleDateString() : "",
          status: item.status === 1 ? "Active" : "Locked",
          address: item.address || "",
          totalSpent: typeof item.totalSpending === "number" ? item.totalSpending : 0,
          lastVisit: item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : "",
          birthDate: item.dateOfBirth ? new Date(item.dateOfBirth).toLocaleDateString() : "",
          roleId: item.roleId || "",
        };
      });
      setMembers(apiMembers);
    } catch (err: unknown) {
      const error = err as { response?: { status: number } };
      if (error?.response?.status === 403) {
        setError("You do not have permission to access the member list (403 Forbidden)");
      } else {
        setError("Error loading member list");
      }
      setMembers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  const filteredMembers = filterMembers(members, searchTerm);
  const sortedMembers = sortMembers(filteredMembers, customerSortField, customerSortDirection);
  const stats = getMemberStats(sortedMembers);
  // const uniqueLevels = [...new Set(members.map((m) => m.level))]; // Removed level filtering

  const indexOfFirstMember = (currentPage - 1) * itemsPerPage;
  const indexOfLastMember = indexOfFirstMember + itemsPerPage;
  const currentMembers = sortedMembers.slice(indexOfFirstMember, indexOfLastMember);
  const totalPages = Math.ceil(sortedMembers.length / itemsPerPage);

  const handleUpdatePoints = async (memberId: string, points: number, operation: "add" | "deduct") => {
    try {
      const token = localStorage.getItem("authToken") || authService.getToken();
      if (!token) {
        notify.error("You are not logged in or the token is invalid!");
        return;
      }
      await updateMemberPoints(memberId, points, operation, token);
      setMembers((prev) =>
        prev.map((member) => {
          if (member.id === memberId) {
            const newPoints = operation === "add" ? member.points + points : Math.max(0, member.points - points);
            return { ...member, points: newPoints };
          }
          return member;
        })
      );
    } catch (error) {
      console.error("Error updating points:", error);
      notify.error("Error updating member points");
    }
  };

  const handlePointsClick = (member: MemberData) => {
    setSelectedMember({
      id: member.id,
      name: member.name,
      phone: member.phone,
      email: member.email,
      points: member.points,
      // level: member.level, // Removed level field
      joinDate: member.joinDate,
      status: member.status,
      address: member.address,
      totalSpent: member.totalSpent,
      lastVisit: member.lastVisit,
      birthDate: member.birthDate,
    });
    setShowPointsModal(true);
    setShowDropdown(null);
  };

  const handleResetFilters = () => {
    setSearchTerm("");
    setCustomerSortField("name");
    setCustomerSortDirection("asc");
    setCurrentPage(1);
    notify.success("Filters and sort have been reset");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const timer = setTimeout(() => {
        notify.info(
          `Found ${filteredMembers.length} member${filteredMembers.length !== 1 ? "s" : ""} matching your criteria`
        );
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [filteredMembers.length, searchTerm]);

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
            <Users className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Failed to load members</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              fetchMembers();
            }}
            className="bg-black text-white px-4 py-2 rounded-lg hover:bg-gray-900 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-4 sm:p-6 relative">
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Member Management</h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">View customer memberships and manage loyalty points</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Members</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
              <p className="text-xs text-gray-500 mt-1">All members registered</p>
            </div>
            <Users className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Members</p>
              <p className="text-3xl font-bold text-green-600">{stats.active}</p>
              <p className="text-xs text-gray-500 mt-1">Currently active</p>
            </div>
            <Users className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Locked Members</p>
              <p className="text-3xl font-bold text-red-600">{stats.locked}</p>
              <p className="text-xs text-gray-500 mt-1">Currently locked</p>
            </div>
            <Users className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">Member Directory</h2>
            <button
              onClick={() => {
                setLoading(true);
                setError(null);
                fetchMembers();
              }}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-5 gap-3 sm:gap-4">
            <div className="relative sm:col-span-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search members..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="relative sm:col-span-1">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                value={`${customerSortField}-${customerSortDirection}`}
                onChange={(e) => {
                  const [field, direction] = e.target.value.split('-') as [typeof customerSortField, typeof customerSortDirection];
                  setCustomerSortField(field);
                  setCustomerSortDirection(direction);
                  setCurrentPage(1);
                }}
              >
                <option value="totalPoints-desc">Points (High to Low)</option>
                <option value="totalPoints-asc">Points (Low to High)</option>
              </select>
            </div>
            <button
              onClick={handleResetFilters}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Reset</span>
            </button>
          </div>
        </div>
        <div className="overflow-x-auto">
          <div className="min-w-[600px] sm:min-w-0">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Member</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Contact</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Points</th>
                  {/* Removed Level column */}
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentMembers.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500 text-sm sm:text-base">
                      No members found matching your filters.
                    </td>
                  </tr>
                ) : (
                  currentMembers.map((member) => (
                    <tr key={member.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600 mr-3">
                            <Users className="h-5 w-5" />
                          </div>
                          <div>
                            <div className="text-sm font-medium text-gray-900">{member.name}</div>
                            <div className="text-sm text-gray-500">{member.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="space-y-1">
                          <div className="flex items-center text-sm text-gray-900">
                            <Phone className="w-4 h-4 mr-1 text-gray-400" />
                            {member.phone}
                          </div>
                          <div className="flex items-center text-sm text-gray-500">
                            <Mail className="w-4 h-4 mr-1 text-gray-400" />
                            {member.email}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 mr-2" />
                          <span className="text-sm font-semibold text-gray-900">{member.points.toLocaleString()}</span>
                        </div>
                      </td>
                      {/* Removed Level column data */}
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(member.status)}`}
                        >
                          {member.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <button
                          data-member-id={member.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowDropdown(showDropdown === member.id ? null : member.id);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
        {currentMembers.length > 0 && (
          <div className="p-4 sm:p-6 flex justify-between items-center border-t border-gray-200">
            <div className="text-sm text-gray-600">
              Showing {currentMembers.length} members
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className={`p-2 rounded-lg ${currentPage === 1 ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  className={`px-3 py-1 rounded-lg text-sm ${currentPage === i + 1 ? "bg-blue-500 text-white" : "text-gray-600 hover:bg-gray-100"}`}
                >
                  {i + 1}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className={`p-2 rounded-lg ${currentPage === totalPages ? "text-gray-300 cursor-not-allowed" : "text-gray-600 hover:bg-gray-100"}`}
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {showDropdown && (
        <div className="fixed inset-0 z-40" onClick={() => setShowDropdown(null)}>
          <div
            ref={dropdownRef}
            className="fixed bg-white rounded-md shadow-lg border border-gray-200 z-50 min-w-[160px]"
            style={(() => {
              const buttonElement = document.querySelector(`[data-member-id="${showDropdown}"]`);
              if (!buttonElement) return {};
              const buttonRect = buttonElement.getBoundingClientRect();
              const dropdownHeight = 120;
              const viewportHeight = window.innerHeight;
              const spaceBelow = viewportHeight - buttonRect.bottom;
              const spaceAbove = buttonRect.top;
              const shouldAppearAbove = spaceBelow < dropdownHeight + 10 && spaceAbove > dropdownHeight;
              const left = Math.min(window.innerWidth - 170, Math.max(10, buttonRect.right - 160));
              const top = shouldAppearAbove ? buttonRect.top - dropdownHeight - 5 : buttonRect.bottom + 5;
              return {
                left: `${left}px`,
                top: `${Math.max(10, Math.min(top, viewportHeight - dropdownHeight - 10))}px`,
              };
            })()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="py-1">
              <button
                onClick={() => {
                  const member = members.find((m) => m.id === showDropdown);
                  if (member) handlePointsClick(member);
                }}
                className="flex items-center px-4 py-2 text-sm text-orange-600 hover:bg-gray-100 w-full text-left transition-colors"
              >
                <Gift className="w-4 h-4 mr-2 text-orange-400" />
                Manage Points
              </button>
            </div>
          </div>
        </div>
      )}

      <PointsModal
        isOpen={showPointsModal}
        onClose={() => setShowPointsModal(false)}
        member={selectedMember}
        onUpdatePoints={handleUpdatePoints}
      />
    </div>
  );
};

export default MemberManagement;
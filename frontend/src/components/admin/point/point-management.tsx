"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Eye,
  Users,
  Coins,
  Gift,
  Award,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import ViewPointsModal from "./view-point";
import EditRewardModal from "./edit-reward";
import AddRewardModal from "./add-reward-modal";
import ViewRewardModal from "./view-reward";
import { notify } from "../../../lib/toast";
import { getAllMembers } from "../../../services/admin_api/memberService";
import { authService } from "../../../services/api/authService";
import axios from "axios";

// Types
export interface Customer {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  totalPoints: number;
  availablePoints: number;
  usedPoints: number;
  tier: "Bronze" | "Silver" | "Gold" | "Platinum";
  lastActivity: string;
  joinDate: string;
}

export interface Reward {
  id: string;
  name: string;
  description: string;
  pointsCost: number;
  category: "Food" | "Beverage" | "Ticket" | "Merchandise" | "Experience";
  image: string;
  stock: number;
  redeemed: number;
  status: "Active" | "Inactive" | "Out of Stock";
  expiryDate?: string;
  price?: number;
  material?: string;
  size?: string;
  design?: string;
}

export interface Transaction {
  id: string;
  customerId: string;
  customerName: string;
  type: "Earned" | "Redeemed" | "Expired" | "Adjusted";
  points: number;
  description: string;
  date: string;
  status: "Completed" | "Pending" | "Failed";
}

export interface PointsStats {
  totalCustomers: number;
  pointsIssued: number;
  pointsRedeemed: number;
  activeRewards: number;
  redemptionRate: number;
}

// Sample Data
const sampleTransactions: Transaction[] = [
  {
    id: "1",
    customerId: "1",
    customerName: "John Smith",
    type: "Earned",
    points: 150,
    description: "Movie ticket purchase",
    date: "2024-01-15",
    status: "Completed",
  },
  {
    id: "2",
    customerId: "2",
    customerName: "Sarah Johnson",
    type: "Redeemed",
    points: -200,
    description: "Free Popcorn reward",
    date: "2024-01-14",
    status: "Completed",
  },
  {
    id: "3",
    customerId: "3",
    customerName: "Mike Wilson",
    type: "Earned",
    points: 300,
    description: "Concession purchase",
    date: "2024-01-16",
    status: "Completed",
  },
  {
    id: "4",
    customerId: "1",
    customerName: "John Smith",
    type: "Redeemed",
    points: -500,
    description: "Movie Ticket Discount",
    date: "2024-01-13",
    status: "Completed",
  },
];

// Utility Functions
// const getCategoryColor = (category: string) => {
//   switch (category) {
//     case "Food":
//       return "bg-orange-100 text-orange-800";
//     case "Beverage":
//       return "bg-blue-100 text-blue-800";
//     case "Ticket":
//       return "bg-green-100 text-green-800";
//     case "Merchandise":
//       return "bg-purple-100 text-purple-800";
//     case "Experience":
//       return "bg-pink-100 text-pink-800";
//     default:
//       return "bg-gray-100 text-gray-800";
//   }
// };

const getStatusColor = (status: string) => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800";
    case "Inactive":
      return "bg-gray-100 text-gray-800";
    case "Out of Stock":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString("vi-VN");
};

const getPointsStats = (
  customers: Customer[],
  rewards: Reward[],
  transactions: Transaction[]
): PointsStats => {
  const totalCustomers = customers.length;
  const pointsIssued = transactions
    .filter((t) => t.type === "Earned")
    .reduce((sum, t) => sum + t.points, 0);
  const pointsRedeemed = Math.abs(
    transactions
      .filter((t) => t.type === "Redeemed")
      .reduce((sum, t) => sum + t.points, 0)
  );
  const activeRewards = rewards.filter((r) => r.status === "Active").length;
  const redemptionRate =
    pointsIssued > 0 ? (pointsRedeemed / pointsIssued) * 100 : 0;
  return {
    totalCustomers,
    pointsIssued,
    pointsRedeemed,
    activeRewards,
    redemptionRate,
  };
};

const filterCustomers = (customers: Customer[], searchTerm: string) => {
  return customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.id.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

const sortCustomers = (customers: Customer[], sortField: string, sortDirection: "asc" | "desc") => {
  return [...customers].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case "name":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case "totalPoints":
        aValue = a.totalPoints;
        bValue = b.totalPoints;
        break;
      case "lastActivity":
        aValue = new Date(a.lastActivity).getTime();
        bValue = new Date(b.lastActivity).getTime();
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

const filterRewards = (
  rewards: Reward[],
  searchTerm: string,
  statusFilter: string,
  // categoryFilter: string
) => {
  return rewards.filter(
    (reward) =>
      (reward.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (statusFilter === "All Status" || reward.status === statusFilter)
      // Category filter commented out - always show all categories
      // && (categoryFilter === "All Categories" ||
      //   reward.category === categoryFilter)
  );
};

const sortRewards = (rewards: Reward[], sortField: string, sortDirection: "asc" | "desc") => {
  return [...rewards].sort((a, b) => {
    let aValue: any;
    let bValue: any;

    switch (sortField) {
      case "name":
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case "pointsCost":
        aValue = a.pointsCost;
        bValue = b.pointsCost;
        break;
      case "stock":
        aValue = a.stock;
        bValue = b.stock;
        break;
      case "redeemed":
        aValue = a.redeemed;
        bValue = b.redeemed;
        break;
      case "status":
        aValue = a.status.toLowerCase();
        bValue = b.status.toLowerCase();
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

const getPaginatedItems = (
  items: Customer[],
  currentPage: number,
  itemsPerPage: number
) => {
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return items.slice(startIndex, endIndex);
};

const PointsManagement: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All Status");
  // Category filter removed - always show all categories
  const [activeTab, setActiveTab] = useState<"customers" | "rewards">(
    "customers"
  );
  
  // Sort states
  const [customerSortField, setCustomerSortField] = useState<"name" | "totalPoints" | "lastActivity" | "joinDate">("name");
  const [customerSortDirection, setCustomerSortDirection] = useState<"asc" | "desc">("asc");
  const [rewardSortField, setRewardSortField] = useState<"name" | "pointsCost" | "stock">("name");
  const [rewardSortDirection, setRewardSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null
  );
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);
  const [isAddRewardOpen, setIsAddRewardOpen] = useState(false);
  const [isViewPointsOpen, setIsViewPointsOpen] = useState(false);
  const [isEditRewardOpen, setIsEditRewardOpen] = useState(false);
  const [isViewRewardOpen, setIsViewRewardOpen] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [rewardToDelete, setRewardToDelete] = useState<Reward | null>(null);

  // Pagination state for Customers only
  const [currentCustomerPage, setCurrentCustomerPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchCustomers = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken") || authService.getToken();
      if (!token) {
        throw new Error("No auth token");
      }
      const res = await getAllMembers(token);
      const apiCustomers: Customer[] = (res.data.data || [])
        .filter((item: any) => {
          // Chỉ lấy members có roleId là Member (loại bỏ staff và admin)
          return item.roleId === "507f1f77bcf86cd799439028";
        })
        .map((item: any) => {
          const score =
            item.member && typeof item.member.score === "number"
              ? item.member.score
              : 0;
          let tier: "Bronze" | "Silver" | "Gold" | "Platinum" = "Bronze";
          if (score >= 2000) tier = "Gold";
          else if (score >= 1000) tier = "Silver";
          else if (score >= 500) tier = "Bronze";
          return {
            id: item._id || "",
            name: item.fullName || "",
            email: item.email || "",
            avatar: item.image || undefined,
            totalPoints: score,
            availablePoints: score,
            usedPoints: 0,
            tier,
            lastActivity: item.updatedAt
              ? new Date(item.updatedAt).toLocaleDateString()
              : "",
            joinDate: item.registerDate
              ? new Date(item.registerDate).toLocaleDateString()
              : "",
          };
        });
      setCustomers(apiCustomers);
      setCurrentCustomerPage(1); // Reset to first page on fetch
    } catch (err: any) {
      setError(err.message || "Failed to fetch customers");
      notify.error("Lỗi khi tải danh sách khách hàng");
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchRewards = async () => {
    try {
      const token = localStorage.getItem("authToken");
      const res = await axios.get("http://localhost:3000/api/egifts/admin/all", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const apiRewards: Reward[] = (res.data.data || []).map((egift: any) => ({
        id: egift._id,
        name: egift.title,
        description: egift.description,
        pointsCost: egift.points,
        category: egift.category,
        image: egift.image || "",
        stock: egift.stock ?? 0,
        redeemed: egift.redeemed ?? 0,
        status: egift.isActive
          ? "Active"
          : egift.stock === 0
          ? "Out of Stock"
          : "Inactive",
        expiryDate: egift.expiryDate,
        price: egift.price,
        material: egift.material,
        size: egift.size,
        design: egift.design,
      }));
      setRewards(apiRewards);
    } catch (err) {
      notify.error("Lỗi khi tải danh sách rewards");
      setRewards([]);
    }
  };

  const fetchAllData = async () => {
    setLoading(true);
    setError(null);
    try {
      await Promise.all([fetchCustomers(), fetchRewards()]);
    } catch (err: any) {
      setError(err.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  useEffect(() => {
    setCurrentCustomerPage(1); // Reset page on search
  }, [searchTerm]);

  // Pagination logic for Customers
  const filteredCustomers = filterCustomers(customers, searchTerm);
  const sortedCustomers = sortCustomers(filteredCustomers, customerSortField, customerSortDirection);
  const totalCustomerPages = Math.ceil(sortedCustomers.length / itemsPerPage);
  const currentCustomers = getPaginatedItems(
    sortedCustomers,
    currentCustomerPage,
    itemsPerPage
  );

  // Calculate pagination display values
  const customerStartIndex = (currentCustomerPage - 1) * itemsPerPage;
  const customerEndIndex = Math.min(
    customerStartIndex + itemsPerPage,
    filteredCustomers.length
  );

  // Filter rewards based on search and filters
  const filteredRewards = filterRewards(
    rewards,
    searchTerm,
    statusFilter,
    // "All Categories" // Always show all categories
  );
  const sortedRewards = sortRewards(filteredRewards, rewardSortField, rewardSortDirection);

  const handleCustomerPageChange = (page: number) => {
    if (page >= 1 && page <= totalCustomerPages) {
      setCurrentCustomerPage(page);
    }
  };

  const stats = getPointsStats(customers, rewards, sampleTransactions);

  const handleAddReward = async (newRewardData: Reward) => {
    try {
      console.log("handleAddReward called with:", newRewardData);
      
      // Check if reward already exists to avoid duplicates
      const exists = rewards.some(reward => reward.id === newRewardData.id);
      if (exists) {
        console.log("Reward already exists, skipping...");
        return;
      }
      
      // Add the new reward to state (API call was already done in modal)
      setRewards((prev) => [...prev, newRewardData]);
      notify.success(`🎁 New reward "${newRewardData.name}" created successfully!`);
    } catch (error) {
      console.error("Error adding reward to state:", error);
      notify.error("Failed to add reward to list!");
    }
  };

  const handleUpdateReward = async (updatedReward: Reward) => {
    try {
      const loadingToast = notify.loading("Updating reward...");
      const egiftData = {
        title: updatedReward.name,
        description: updatedReward.description,
        points: updatedReward.pointsCost,
        category: updatedReward.category,
        image: updatedReward.image || "",
        stock: updatedReward.stock || 0,
        price: updatedReward.price,
        material: updatedReward.material,
        size: updatedReward.size,
        design: updatedReward.design,
        isActive: updatedReward.status === "Active",
      };
      const token = localStorage.getItem("authToken");
      const res = await fetch(
        `http://localhost:3000/api/egifts/${updatedReward.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(egiftData),
        }
      );
      const response = await res.json();
      const egift = response.data || response;
      console.log('Updated egift response:', egift); // Debug log
      setRewards((prev) =>
        prev.map((reward) =>
          reward.id === updatedReward.id
            ? {
                id: egift._id,
                name: egift.title,
                description: egift.description,
                pointsCost: egift.points,
                category: egift.category,
                image: egift.image || "",
                stock: egift.stock ?? 0,
                redeemed: egift.redeemed ?? 0,
                status: egift.isActive
                  ? "Active"
                  : egift.stock === 0
                  ? "Out of Stock"
                  : "Inactive",
                expiryDate: egift.expiryDate,
                price: egift.price,
                material: egift.material,
                size: egift.size,
                design: egift.design,
              }
            : reward
        )
      );
      notify.dismiss(loadingToast);
      notify.success("✅ Reward updated successfully!");
      setIsEditRewardOpen(false);
      setSelectedReward(null);
      
      // Refresh rewards data to ensure UI is up to date
      await fetchRewards();
    } catch (error) {
      console.error("Error updating reward:", error);
      notify.error("Failed to update reward!");
    }
  };

  const handleDeleteReward = (rewardId: string) => {
    const reward = rewards.find((r) => r.id === rewardId);
    if (reward) {
      setRewardToDelete(reward);
      setShowDeleteModal(true);
    }
  };

  const confirmDeleteReward = async () => {
    if (!rewardToDelete) return;

    let loadingToast: any;
    try {
      loadingToast = notify.loading("Deleting reward...");
      const token = localStorage.getItem("authToken");
      
      const response = await axios.delete(
        `http://localhost:3000/api/egifts/${rewardToDelete.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Check if deletion was successful
      if (response.status === 200 || response.status === 204) {
        setRewards((prev) =>
          prev.filter((reward) => reward.id !== rewardToDelete.id)
        );
        notify.dismiss(loadingToast);
        notify.success(`🗑️ Reward "${rewardToDelete.name}" deleted successfully!`);
        setShowDeleteModal(false);
        setRewardToDelete(null);
      } else {
        throw new Error("Failed to delete reward");
      }
    } catch (error: any) {
      console.error("Error deleting reward:", error);
      if (loadingToast) {
        notify.dismiss(loadingToast);
      }
      
      // Handle specific error cases
      if (error.response?.status === 404) {
        notify.error("Reward not found or already deleted!");
      } else if (error.response?.status === 403) {
        notify.error("You don't have permission to delete this reward!");
      } else if (error.response?.status === 409) {
        notify.error("Cannot delete reward that has been redeemed by users!");
      } else {
        notify.error(error.response?.data?.message || "Failed to delete reward!");
      }
    }
  };

  const cancelDeleteReward = () => {
    setShowDeleteModal(false);
    setRewardToDelete(null);
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Status");
    // setCategoryFilter("All Categories"); // Category filter commented out
    setCurrentCustomerPage(1);
    // Reset sort to default
    setCustomerSortField("name");
    setCustomerSortDirection("asc");
    setRewardSortField("name");
    setRewardSortDirection("asc");
    notify.info("Filters and sort have been reset");
  };

  const handleViewCustomerPoints = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsViewPointsOpen(true);
    notify.info(`Viewing points for ${customer.name}`);
  };

  const handleEditReward = (reward: Reward) => {
    setSelectedReward(reward);
    setIsEditRewardOpen(true);
  };

  const handleViewReward = (reward: Reward) => {
    setSelectedReward(reward);
    setIsViewRewardOpen(true);
  };

  // Sort handlers
  const handleCustomerSort = (field: "name" | "totalPoints" | "lastActivity" | "joinDate") => {
    if (customerSortField === field) {
      setCustomerSortDirection(customerSortDirection === "asc" ? "desc" : "asc");
    } else {
      setCustomerSortField(field);
      setCustomerSortDirection("asc");
    }
    setCurrentCustomerPage(1); // Reset to first page when sorting
  };

  const handleRewardSort = (field: "name" | "pointsCost" | "stock") => {
    if (rewardSortField === field) {
      setRewardSortDirection(rewardSortDirection === "asc" ? "desc" : "asc");
    } else {
      setRewardSortField(field);
      setRewardSortDirection("asc");
    }
  };

  const getSortIcon = (field: string, currentField: string, direction: "asc" | "desc") => {
    if (currentField !== field) {
      return <ArrowUpDown className="w-4 h-4" />;
    }
    return direction === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading points management...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <AlertCircle className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to load data
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchAllData}
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
      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Points Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage customer loyalty points and rewards
            </p>
          </div>
          <button
            onClick={() => setIsAddRewardOpen(true)}
            className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors space-x-2"
          >
            <Plus className="w-4 h-4" />
            <span>Add Reward</span>
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Customers</p>
              <p className="text-3xl font-bold text-gray-900">
                {customers.length.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Active members</p>
            </div>
            <Users className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Points Issued</p>
              <p className="text-3xl font-bold text-green-600">
                {stats.pointsIssued.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">Total earned points</p>
            </div>
            <Coins className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Points Redeemed</p>
              <p className="text-3xl font-bold text-blue-600">
                {stats.pointsRedeemed.toLocaleString()}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {stats.redemptionRate.toFixed(1)}% redemption rate
              </p>
            </div>
            <Gift className="w-8 h-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Rewards</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats.activeRewards}
              </p>
              <p className="text-xs text-gray-500 mt-1">Available rewards</p>
            </div>
            <Award className="w-8 h-8 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setActiveTab("customers")}
            className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "customers"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Users className="w-4 h-4 inline mr-2" />
            Customers
          </button>
          <button
            onClick={() => setActiveTab("rewards")}
            className={`flex-1 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === "rewards"
                ? "border-gray-900 text-gray-900"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            <Gift className="w-4 h-4 inline mr-2" />
            Rewards
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              {activeTab === "customers" && "Customer Points"}
              {activeTab === "rewards" && "Rewards Catalog"}
            </h2>
            <button
              onClick={fetchAllData}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

                     {/* Filters */}
           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
               <input
                 type="text"
                 placeholder={`Search ${activeTab}...`}
                 className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                 value={searchTerm}
                 onChange={(e) => {
                   setSearchTerm(e.target.value);
                   setCurrentCustomerPage(1); // Reset to first page on search
                 }}
               />
             </div>
             
             {/* Sort Filter for Customers */}
             {activeTab === "customers" && (
               <select
                 className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                 value={`${customerSortField}-${customerSortDirection}`}
                 onChange={(e) => {
                   const [field, direction] = e.target.value.split('-') as [typeof customerSortField, typeof customerSortDirection];
                   setCustomerSortField(field);
                   setCustomerSortDirection(direction);
                   setCurrentCustomerPage(1);
                 }}
               >
                 <option value="totalPoints-desc">Points (High to Low)</option>
                 <option value="totalPoints-asc">Points (Low to High)</option>
               </select>
             )}
             
             {activeTab === "rewards" && (
               <select
                 className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm sm:text-base"
                 value={statusFilter}
                 onChange={(e) => setStatusFilter(e.target.value)}
               >
                 <option>All Status</option>
                 <option>Active</option>
                 <option>Inactive</option>
                 <option>Out of Stock</option>
               </select>
             )}
             <button
               onClick={resetFilters}
               className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center space-x-2"
             >
               <RefreshCw className="w-4 h-4" />
               <span>Reset</span>
             </button>
           </div>
        </div>

        {/* Content Area */}
        <div className="p-4 sm:p-6">
          {/* Customers Tab */}
          {activeTab === "customers" && (
            <div className="overflow-x-auto">
              <div className="min-w-[800px] sm:min-w-0">
                <table className="w-full">
                                     <thead className="bg-gray-50 border-b border-gray-200">
                     <tr>
                       <th 
                         className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors"
                         onClick={() => handleCustomerSort("name")}
                       >
                         <div className="flex items-center gap-1">
                           Customer
                           {getSortIcon("name", customerSortField, customerSortDirection)}
                         </div>
                       </th>
                       <th 
                         className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors"
                         onClick={() => handleCustomerSort("totalPoints")}
                       >
                         <div className="flex items-center gap-1">
                           Total Points
                           {getSortIcon("totalPoints", customerSortField, customerSortDirection)}
                         </div>
                       </th>
                       <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                         Available
                       </th>
                       <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                         Used
                       </th>
                       <th 
                         className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap cursor-pointer hover:bg-gray-100 transition-colors"
                         onClick={() => handleCustomerSort("lastActivity")}
                       >
                         <div className="flex items-center gap-1">
                           Last Activity
                           {getSortIcon("lastActivity", customerSortField, customerSortDirection)}
                         </div>
                       </th>
                       <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                         Actions
                       </th>
                     </tr>
                   </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {currentCustomers.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6}
                          className="px-6 py-12 text-center text-gray-500 text-sm sm:text-base"
                        >
                          No customers found matching your filters.
                        </td>
                      </tr>
                    ) : (
                      currentCustomers.map((customer) => (
                        <tr key={customer.id} className="hover:bg-gray-50">
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 text-gray-600 mr-3">
                                {customer.avatar ? (
                                  <img
                                    src={customer.avatar}
                                    alt={customer.name}
                                    className="w-full h-full rounded-full"
                                  />
                                ) : (
                                  <span className="text-sm font-medium">
                                    {customer.name
                                      .split(" ")
                                      .map((n) => n[0])
                                      .join("")}
                                  </span>
                                )}
                              </div>
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {customer.name}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {customer.email}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {customer.totalPoints.toLocaleString()}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                            {customer.availablePoints.toLocaleString()}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                            {customer.usedPoints.toLocaleString()}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(customer.lastActivity)}
                          </td>
                          <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            <button
                              onClick={() => handleViewCustomerPoints(customer)}
                              className="inline-flex items-center px-3 py-1 border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors"
                            >
                              <Eye className="w-4 h-4 mr-1" />
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
              {/* Customer Pagination */}
              {totalCustomerPages > 1 && (
                <div className="p-4 sm:p-6 flex justify-between items-center border-t border-gray-200">
                  <div className="text-sm text-gray-600">
                    Showing{" "}
                    {currentCustomers.length > 0 ? customerStartIndex + 1 : 0}{" "}
                    to {customerEndIndex} of {filteredCustomers.length}{" "}
                    customers
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() =>
                        handleCustomerPageChange(currentCustomerPage - 1)
                      }
                      disabled={currentCustomerPage === 1}
                      aria-label="Previous page"
                      className={`p-2 rounded-lg ${
                        currentCustomerPage === 1
                          ? "text-gray-300 cursor-not-allowed"
                          : "text-gray-600 hover:bg-gray-100"
                      }`}
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    {Array.from(
                      { length: totalCustomerPages },
                      (_, index) => index + 1
                    ).map((page) => (
                      <button
                        key={page}
                        onClick={() => handleCustomerPageChange(page)}
                        aria-label={`Page ${page}`}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          currentCustomerPage === page
                            ? "bg-blue-500 text-white"
                            : "text-gray-600 hover:bg-gray-100"
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      onClick={() =>
                        handleCustomerPageChange(currentCustomerPage + 1)
                      }
                      disabled={currentCustomerPage === totalCustomerPages}
                      aria-label="Next page"
                      className={`p-2 rounded-lg ${
                        currentCustomerPage === totalCustomerPages
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
          )}

                     {/* Rewards Tab */}
           {activeTab === "rewards" && (
             <>
               {/* Sort Controls for Rewards */}
               <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                 <div className="flex flex-wrap items-center gap-3">
                   <span className="text-sm font-medium text-gray-700">Sort by:</span>
                   <button
                     onClick={() => handleRewardSort("name")}
                     className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-1 ${
                       rewardSortField === "name"
                         ? "bg-blue-100 text-blue-700 border border-blue-200"
                         : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                     }`}
                   >
                     Name
                     {getSortIcon("name", rewardSortField, rewardSortDirection)}
                   </button>
                   <button
                     onClick={() => handleRewardSort("pointsCost")}
                     className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-1 ${
                       rewardSortField === "pointsCost"
                         ? "bg-blue-100 text-blue-700 border border-blue-200"
                         : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                     }`}
                   >
                     Points Cost
                     {getSortIcon("pointsCost", rewardSortField, rewardSortDirection)}
                   </button>
                   <button
                     onClick={() => handleRewardSort("stock")}
                     className={`px-3 py-1 text-sm rounded-md transition-colors flex items-center gap-1 ${
                       rewardSortField === "stock"
                         ? "bg-blue-100 text-blue-700 border border-blue-200"
                         : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                     }`}
                   >
                     Stock
                     {getSortIcon("stock", rewardSortField, rewardSortDirection)}
                   </button>
                   
                 </div>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                 {sortedRewards.map((reward) => (
                <div
                  key={reward.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square bg-gray-100 overflow-hidden">
                    {reward.image ? (
                      <img
                        src={reward.image}
                        alt={reward.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallbackDiv = target.nextElementSibling as HTMLDivElement;
                          if (fallbackDiv) {
                            fallbackDiv.classList.remove('hidden');
                          }
                        }}
                      />
                    ) : null}
                    <div className={`w-full h-full flex items-center justify-center ${reward.image ? 'hidden' : ''}`}>
                      <div className="text-center">
                        <div className="text-gray-400 text-4xl mb-2">🖼️</div>
                        <div className="text-gray-500 text-xs">{reward.name}</div>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 space-y-3">
                    <div className="flex items-start justify-between">
                      <h3 className="font-medium text-gray-900 text-sm">
                        {reward.name}
                      </h3>
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                          reward.status
                        )}`}
                      >
                        {reward.status}
                      </span>
                    </div>
                    <p className="text-gray-600 text-xs line-clamp-2">
                      {reward.description}
                    </p>
                                         <div className="flex items-center justify-between">
                       {/* Category display commented out
                       <span
                         className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getCategoryColor(
                           reward.category
                         )}`}
                       >
                         {reward.category}
                       </span>
                       */}
                       <div className="text-right">
                         <div className="font-bold text-gray-900 text-sm">
                           {reward.pointsCost} pts
                         </div>
                       </div>
                     </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>Stock: {reward.stock}</span>
                      <span>Redeemed: {reward.redeemed}</span>
                    </div>
                    <div className="flex gap-2 pt-2">
                      <button
                        onClick={() => handleViewReward(reward)}
                        className="flex-1 px-2 py-1 text-xs border border-blue-300 text-blue-600 hover:bg-blue-50 rounded flex items-center justify-center"
                      >
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </button>
                      <button
                        onClick={() => handleEditReward(reward)}
                        className="flex-1 px-2 py-1 text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 rounded flex items-center justify-center"
                      >
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteReward(reward.id)}
                        className="px-2 py-1 text-xs border border-red-300 text-red-600 hover:bg-red-50 rounded flex items-center transition-colors"
                        title="Delete reward"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              {sortedRewards.length === 0 && (
                <div className="col-span-full text-center py-12">
                  <AlertCircle className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900">
                    No rewards found
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Try adjusting your search criteria or filters.
                  </p>
                </div>
              )}
            </div>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && rewardToDelete && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={cancelDeleteReward}
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
                  Delete Reward
                </h3>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Are you sure you want to delete this reward?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">
                    {rewardToDelete.name}
                  </p>
                  <p className="text-gray-600">{rewardToDelete.description}</p>
                  <p className="text-gray-600">
                    Cost: {rewardToDelete.pointsCost} points • Category:{" "}
                    {rewardToDelete.category}
                  </p>
                  <p className="text-gray-600">
                    Stock: {rewardToDelete.stock} • Redeemed:{" "}
                    {rewardToDelete.redeemed}
                  </p>
                </div>
              </div>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mt-3">
                <div className="flex items-start">
                  <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="text-red-800 font-medium mb-1">⚠️ This action cannot be undone</p>
                    <p className="text-red-700">
                      The reward will be permanently removed from the system. 
                      {rewardToDelete.redeemed > 0 && (
                        <span className="block mt-1">
                          <strong>Note:</strong> This reward has been redeemed {rewardToDelete.redeemed} times.
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteReward}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteReward}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
              >
                Delete Reward
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddRewardModal
        isOpen={isAddRewardOpen}
        onClose={() => setIsAddRewardOpen(false)}
        onSave={handleAddReward}
      />
      <ViewPointsModal
        isOpen={isViewPointsOpen}
        onClose={() => setIsViewPointsOpen(false)}
        customer={selectedCustomer}
      />
      <EditRewardModal
        isOpen={isEditRewardOpen}
        onClose={() => setIsEditRewardOpen(false)}
        reward={selectedReward}
        onSave={handleUpdateReward}
      />
      <ViewRewardModal
        isOpen={isViewRewardOpen}
        onClose={() => setIsViewRewardOpen(false)}
        reward={selectedReward}
      />
    </div>
  );
};

export { PointsManagement };
export default PointsManagement;

import { useEffect, useState, useRef } from "react";
import {
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Package,
  MoreHorizontal,
  Eye,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { notify} from "../../../lib/toast";
import {
  getAllWatercorns,
  createWatercorn,
  updateWatercorn,
  deleteWatercorn,
} from "../../../services/api";
import { AddConcessionModal } from "./add-concession-modal";
import { EditConcessionModal } from "./edit-concession";
import { ViewConcessionModal } from "./view-concession";

interface ConcessionItem {
  id: string;
  name: string;
  price: number;
  image: string;
  description: string;
  category: "popcorn" | "drinks" | "snacks" | "combos";
  status: "active" | "inactive";
  stockQuantity: number;
  createdAt: string;
  updatedAt: string;
}

const mapApiConcessionToConcession = (
  item: any,
  idx: number
): ConcessionItem => ({
  id: item._id || String(idx + 1),
  name: item.name,
  price: item.price,
  image: item.image,
  description: item.description,
  category: item.category,
  status: item.status,
  stockQuantity: item.stockQuantity,
  createdAt: item.createdAt,
  updatedAt: item.updatedAt,
});

export type { ConcessionItem };
export function ConcessionManagement() {
  const [concessions, setConcessions] = useState<ConcessionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [addLoading, setAddLoading] = useState(false); // New state for add operation
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("All Status");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [selectedConcession, setSelectedConcession] =
    useState<ConcessionItem | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [concessionToDelete, setConcessionToDelete] =
    useState<ConcessionItem | null>(null);
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const actionBtnRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  const fetchConcessions = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllWatercorns();
      const apiConcessions = (res.data || res).map(
        mapApiConcessionToConcession
      );

      // Sort by createdAt in descending order (newest first)
      apiConcessions.sort((a: ConcessionItem, b: ConcessionItem) => {
        const dateA = new Date(a.createdAt || "1970-01-01").getTime();
        const dateB = new Date(b.createdAt || "1970-01-01").getTime();
        return dateB - dateA; // Descending order - newest items first
      });

      setConcessions(apiConcessions);
      setCurrentPage(1);
    } catch (err: any) {
      setError(err.message || "Failed to fetch concessions");
      notify.error("Failed to fetch concessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchConcessions();
  }, []);

  useEffect(() => {
    const closeDropdown = () => setShowDropdown(null);
    if (showDropdown) {
      window.addEventListener("scroll", closeDropdown, true);
      window.addEventListener("resize", closeDropdown);
    }
    return () => {
      window.removeEventListener("scroll", closeDropdown, true);
      window.removeEventListener("resize", closeDropdown);
    };
  }, [showDropdown]);

  const filteredConcessions = concessions.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "All Status" ||
      item.status === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const totalPages = Math.ceil(filteredConcessions.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentConcessions = filteredConcessions.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      setShowDropdown(null);
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("All Status");
    setCurrentPage(1);
    notify.info("Filters have been reset");
  };

  const handleDeleteConcession = (id: string) => {
    const concession = concessions.find((c) => c.id === id);
    if (concession) {
      setConcessionToDelete(concession);
      setShowDeleteModal(true);
      setShowDropdown(null);
    }
  };

  const confirmDeleteConcession = async () => {
    if (!concessionToDelete) return;
    try {
      const loadingToast = notify.loading(
        `Deleting ${concessionToDelete.name}...`
      );
      await deleteWatercorn(concessionToDelete.id);
      
      // Remove the item from local state instead of fetching all data
      setConcessions(prev => prev.filter(item => item.id !== concessionToDelete.id));
      
      notify.dismiss(loadingToast);
      notify.success(`🗑️ ${concessionToDelete.name} deleted successfully`);
      setShowDeleteModal(false);
      setConcessionToDelete(null);
      
      // Handle pagination when deleting the last item on a page
      if (currentConcessions.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
      }
    } catch (err: any) {
      notify.error("Failed to delete concession");
    }
  };

  const cancelDeleteConcession = () => {
    setShowDeleteModal(false);
    setConcessionToDelete(null);
  };

  const handleAddConcession = async (
    newConcession: Omit<ConcessionItem, "id" | "createdAt" | "updatedAt">
  ) => {
    setAddLoading(true); // Set loading state for add operation
    try {
      const loadingToast = notify.loading(`Adding ${newConcession.name}...`);
      const currentTime = new Date().toISOString();

      const response = await createWatercorn({
        ...newConcession,
        createdAt: currentTime,
        updatedAt: currentTime,
      });

      // Create the new concession item with the response data
      const newConcessionItem: ConcessionItem = {
        id: response.data?._id || response._id || `temp-${Date.now()}`,
        name: newConcession.name,
        price: newConcession.price,
        image: newConcession.image,
        description: newConcession.description,
        category: newConcession.category,
        status: newConcession.status,
        stockQuantity: newConcession.stockQuantity,
        createdAt: currentTime,
        updatedAt: currentTime,
      };

      // Add the new item to the beginning of the list
      setConcessions(prev => [newConcessionItem, ...prev]);
      
      // Reset to first page to show the new item
      setCurrentPage(1);

      notify.dismiss(loadingToast);
      notify.success(`Concession ${newConcession.name} created successfully!`);
      setIsAddModalOpen(false);
    } catch (err: any) {
      notify.error("Failed to create concession");
    } finally {
      setAddLoading(false); // Clear loading state
    }
  };

  const handleEditConcession = async (updatedConcession: ConcessionItem) => {
    try {
      const loadingToast = notify.loading(
        `Updating ${updatedConcession.name}...`
      );
      await updateWatercorn(updatedConcession.id, {
        ...updatedConcession,
        updatedAt: new Date().toISOString(),
      });
      
      // Update the item in the local state instead of fetching all data
      setConcessions(prev => 
        prev.map(item => 
          item.id === updatedConcession.id 
            ? { ...updatedConcession, updatedAt: new Date().toISOString() }
            : item
        )
      );
      
      notify.dismiss(loadingToast);
      notify.success(`✏️ ${updatedConcession.name} updated successfully!`);
      setIsEditModalOpen(false);
      setSelectedConcession(null);
    } catch (err: any) {
      notify.error("Failed to update concession");
    }
  };

  const handleEditClick = (concession: ConcessionItem) => {
    setSelectedConcession(concession);
    setIsEditModalOpen(true);
    setShowDropdown(null);
  };

  const handleViewClick = (concession: ConcessionItem) => {
    setSelectedConcession(concession);
    setIsViewModalOpen(true);
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
          <p className="mt-4 text-gray-600">Loading concessions...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <Package className="w-12 h-12 mx-auto" />
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Failed to load concessions
          </h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchConcessions}
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
              Concession Management
            </h1>
            <p className="text-gray-600 mt-1 text-sm sm:text-base">
              Manage food & beverage products
            </p>
          </div>
          <button
            onClick={handleOpenAddModal}
            disabled={addLoading} // Disable button during add operation
            className={`flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-900 transition-colors space-x-2 ${
              addLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>{addLoading ? "Adding..." : "Add Product"}</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Products</p>
              <p className="text-3xl font-bold text-gray-900">
                {concessions.length}
              </p>
              <p className="text-xs text-gray-500 mt-1">All products</p>
            </div>
            <Package className="w-8 h-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-3xl font-bold text-green-600">
                {concessions.filter((c) => c.status === "active").length}
              </p>
              <p className="text-xs text-gray-500 mt-1">Currently active</p>
            </div>
            <Package className="w-8 h-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Inactive</p>
              <p className="text-3xl font-bold text-red-600">
                {concessions.filter((c) => c.status === "inactive").length}
              </p>
              <p className="text-xs text-gray-500 mt-1">Currently inactive</p>
            </div>
            <Package className="w-8 h-8 text-red-400" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex justify-between items-center mb-3 sm:mb-4">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900">
              Product List
            </h2>
            <button
              onClick={fetchConcessions}
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
                placeholder="Search by name or description..."
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
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
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
                    Name
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Category
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Status
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Price
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Stock
                  </th>
                  <th className="px-4 sm:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentConcessions.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-12 text-center text-gray-500 text-sm sm:text-base"
                    >
                      No products found matching your filters.
                    </td>
                  </tr>
                ) : (
                  currentConcessions.map((concession) => (
                    <tr key={concession.id} className="hover:bg-gray-50">
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                        {concession.name}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">
                        {concession.category}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadgeColor(
                            concession.status
                          )}`}
                        >
                          {concession.status}
                        </span>
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-green-700 font-semibold">
                        {new Intl.NumberFormat('vi-VN').format(concession.price)} ₫
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {concession.stockQuantity}
                      </td>
                      <td className="px-4 sm:px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="relative">
                          <button
                            ref={(el) => {
                              actionBtnRefs.current[concession.id] = el;
                            }}
                            data-concession-id={concession.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setShowDropdown(
                                showDropdown === concession.id
                                  ? null
                                  : concession.id
                              );
                            }}
                            className="p-2 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            title="Actions"
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
              {Math.min(endIndex, filteredConcessions.length)} of{" "}
              {filteredConcessions.length} products
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

      {showDeleteModal && concessionToDelete && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
          onClick={cancelDeleteConcession}
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
                  Delete Product
                </h3>
              </div>
            </div>
            <div className="mb-6">
              <p className="text-gray-600 mb-3">
                Are you sure you want to delete this product?
              </p>
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm">
                  <p className="font-semibold text-gray-900">
                    {concessionToDelete.name}
                  </p>
                  <p className="text-gray-600">
                    Category: {concessionToDelete.category}
                  </p>
                  <p className="text-gray-600">
                    Status: {concessionToDelete.status}
                  </p>
                </div>
              </div>
              <p className="text-red-600 text-sm mt-3 font-medium">
                ⚠️ This action cannot be undone. All product data and history
                will be permanently removed.
              </p>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={cancelDeleteConcession}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteConcession}
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white font-medium rounded-lg transition-colors"
              >
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      {showDropdown && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowDropdown(null)}
        >
          <div
            className="fixed bg-white rounded-md shadow-lg border border-gray-200 z-50 min-w-[160px]"
            style={(() => {
              const buttonElement = document.querySelector(
                `[data-concession-id="${showDropdown}"]`
              );
              if (!buttonElement) return {};

              const buttonRect = buttonElement.getBoundingClientRect();
              const dropdownHeight = 120; // Approximate height of dropdown with 3 items
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
                  const item = concessions.find((c) => c.id === showDropdown);
                  if (item) handleViewClick(item);
                  setShowDropdown(null);
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
              >
                <Eye className="w-4 h-4 mr-2" />
                View Product
              </button>
              <button
                onClick={() => {
                  const item = concessions.find((c) => c.id === showDropdown);
                  if (item) handleEditClick(item);
                  setShowDropdown(null);
                }}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left transition-colors"
              >
                <Edit className="w-4 h-4 mr-2" />
                Edit Product
              </button>
              <button
                onClick={() => {
                  if (showDropdown) handleDeleteConcession(showDropdown);
                  setShowDropdown(null);
                }}
                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left transition-colors"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Product
              </button>
            </div>
          </div>
        </div>
      )}

      <AddConcessionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSuccess={handleAddConcession}
        isLoading={addLoading} // Pass loading state to modal
      />
      {selectedConcession && (
        <>
          <EditConcessionModal
            isOpen={isEditModalOpen}
            onClose={() => {
              setIsEditModalOpen(false);
              setSelectedConcession(null);
            }}
            concession={selectedConcession}
            onEdit={handleEditConcession}
          />
          <ViewConcessionModal
            isOpen={isViewModalOpen}
            onClose={() => {
              setIsViewModalOpen(false);
              setSelectedConcession(null);
            }}
            concession={selectedConcession}
          />
        </>
      )}
    </div>
  );
}

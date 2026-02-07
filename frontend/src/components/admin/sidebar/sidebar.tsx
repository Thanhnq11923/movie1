"use client";

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Home,
  Users,
  Ticket,
  Calendar,
  UserCheck,
  Gift,
  Building,
  Film,
  Tag,
  User,
  LogOut,
  MessageSquare,
  Popcorn,
} from "lucide-react";
import { ConfirmationModal } from "../../ui/confirmation-modal";
import ReactDOM from "react-dom";

interface SidebarProps {
  activeItem?: string;
  onItemClick?: (itemId: string) => void;
  isOpen?: boolean;
}

const menuItems = [
  { id: "dashboard", label: "Dashboard Management", icon: Home },
  { id: "member", label: "Member Management", icon: Users },
  { id: "staff", label: "Staff Management", icon: UserCheck },
  { id: "ticket", label: "Ticket Management", icon: Ticket },
  { id: "booking", label: "Booking Management", icon: Calendar },
  { id: "staff-booking", label: "Staff Booking Management", icon: Users },
  { id: "room", label: "Room Management", icon: Building },
  { id: "movie", label: "Movie Management", icon: Film },
  { id: "schedule", label: "Schedule Management", icon: Calendar },
  { id: "promotion", label: "Promotion Management", icon: Tag },
  { id: "feedback", label: "Feedback Management", icon: MessageSquare },
  { id: "concession", label: "Concession Management", icon: Popcorn },
  { id: "point", label: "Point Management", icon: Gift },
];

const otherItems = [{ id: "logout", label: "Logout", icon: LogOut }];

const Sidebar: React.FC<SidebarProps> = ({
  activeItem = "dashboard",
  onItemClick,
  isOpen = true,
}) => {
  const [currentActive, setCurrentActive] = useState(activeItem);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    try {
      navigate("/login", { replace: true });
    } catch (error) {
      console.error("logout error:", error);
    }
  };

  const handleItemClick = (itemId: string) => {
    setCurrentActive(itemId);
    if (onItemClick) {
      onItemClick(itemId);
    }

    switch (itemId) {
      case "dashboard":
        navigate("/admin/home");
        break;
      case "member":
        navigate("/admin/member");
        break;
      case "ticket":
        navigate("/admin/ticket");
        break;
      case "booking":
        navigate("/admin/booking");
        break;
      case "staff-booking":
        navigate("/admin/staff-booking-management");
        break;
      case "staff":
        navigate("/admin/staff");
        break;
      case "room":
        navigate("/admin/room");
        break;
      case "movie":
        navigate("/admin/movie");
        break;
      case "schedule":
        navigate("/admin/schedule");
        break;
      case "promotion":
        navigate("/admin/promotion");
        break;
      case "feedback":
        navigate("/admin/feedback");
        break;
      case "concession":
        navigate("/admin/concession");
        break;
      case "point":
        navigate("/admin/point");
        break;
      case "calendarCheck":
        navigate("/admin/movieshowtime");
        break;
      case "logout":
        handleLogout();
        break;
      default:
        break;
    }
  };

  return (
    <div
      className={`bg-white dark:bg-gray-900 h-screen flex-shrink-0 flex flex-col border-r border-gray-200 dark:border-gray-700 fixed top-0 left-0 z-50 transition-all duration-300 ease-in-out ${
        isOpen ? "translate-x-0 w-64" : "-translate-x-full w-64"
      }`}
    >
      {/* Header */}
      <div className="h-16 px-4 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center">
        <div className="flex items-center justify-start space-x-3 w-full">
          <div
            className="w-8 h-8 rounded overflow-hidden cursor-pointer flex-shrink-0"
            onClick={() => navigate("/admin/home")}
          >
            <img
              src="/assets/images/logo/logo.png"
              alt="Cinema Admin Logo"
              className="w-full h-full object-contain"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = "none";
                target.parentElement!.innerHTML =
                  '<div class="w-full h-full bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">CA</div>';
              }}
            />
          </div>
          <div className="transition-all duration-300">
            <h1 className="text-gray-900 dark:text-white font-semibold text-sm truncate">
              Cinema Admin
            </h1>
            <p className="text-gray-500 dark:text-gray-400 text-xs truncate">
              Management System
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-4 overflow-y-auto">
        {/* Main Management */}
        <div className="px-4 mb-6">
          <h3 className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Main Management
          </h3>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentActive === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center px-3 py-2.5 text-left transition-all duration-200 rounded-lg group relative ${
                    isActive
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-l-4 border-blue-600"
                      : "text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                  }`}
                  title={item.label}
                >
                  <Icon
                    size={18}
                    className={`flex-shrink-0 transition-colors duration-200 ${
                      isActive
                        ? "text-blue-600 dark:text-blue-400"
                        : "text-gray-500 group-hover:text-blue-600 dark:group-hover:text-blue-400"
                    } mr-3`}
                  />
                  <span className="text-sm font-medium truncate">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Others */}
        <div className="px-4">
          <h3 className="text-gray-500 dark:text-gray-400 text-xs font-semibold uppercase tracking-wider mb-3">
            Others
          </h3>
          <nav className="space-y-1">
            {otherItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentActive === item.id;

              return (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center px-3 py-2.5 text-left transition-all duration-200 rounded-lg group ${
                    isActive
                      ? "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"
                      : "text-gray-700 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                  }`}
                  title={item.label}
                >
                  <Icon
                    size={18}
                    className={`flex-shrink-0 transition-colors duration-200 ${
                      isActive
                        ? "text-red-600 dark:text-red-400"
                        : "text-gray-500 group-hover:text-red-600 dark:group-hover:text-red-400"
                    } mr-3`}
                  />
                  <span className="text-sm font-medium truncate">
                    {item.label}
                  </span>
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* User Profile */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <div className="flex items-center space-x-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900 flex-shrink-0">
            <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
              Admin User
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              admin@cinema.com
            </p>
          </div>
        </div>
      </div>
      {typeof window !== "undefined" &&
        ReactDOM.createPortal(
          <ConfirmationModal
            isOpen={showLogoutModal}
            onClose={() => setShowLogoutModal(false)}
            onConfirm={confirmLogout}
            title="Logout Confirmation"
            message="Are you sure you want to logout?"
            type="warning"
            confirmText="Logout"
            cancelText="Cancel"
          />,
          document.body
        )}
    </div>
  );
};

export default Sidebar;

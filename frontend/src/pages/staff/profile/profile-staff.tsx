"use client";

import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import HeaderStaff from "../../../components/Staff/header/header";
import SidebarStaff from "../../../components/Staff/sidebar/sidebar";
import StaffProfile from "../../../components/Staff/profile/profile-modal";

const ProfileStaff: React.FC = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Tự động ẩn sidebar trên mobile, mặc định mở trên desktop
      if (mobile) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }

      console.log(
        `Profile Staff - Screen width: ${
          window.innerWidth
        }, isMobile: ${mobile}, isOpen: ${mobile ? false : true}`
      );
    };

    // Set initial state
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Cleanup
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const toggleSidebar = () => {
    console.log(`Profile Staff - Toggling sidebar: ${isOpen} -> ${!isOpen}`);
    setIsOpen(!isOpen);
  };

  const getActiveItem = () => {
    const path = location.pathname.split("/").pop() || "profile";
    console.log(
      `Profile Staff - Current path: ${location.pathname}, activeItem: ${path}`
    );
    return path;
  };

  const getPageTitle = () => {
    const path = location.pathname.split("/").pop() || "profile";
    const titles: Record<string, string> = {
      profile: "Staff Profile",
      dashboard: "Dashboard",
      ticket: "Ticket Selling",
      members: "Members Management",
      booking: "Booking Management",
      promotion: "Promotion Management",
      schedule: "Schedule Management",
    };
    return titles[path] || "Staff Profile";
  };

  const handleItemClick = (itemId: string) => {
    console.log(
      `Profile Staff - Clicked on: ${itemId}, current path: ${location.pathname}`
    );

    // Tự động đóng sidebar trên mobile sau khi navigate
    if (isMobile) {
      setIsOpen(false);
    }

    // ✅ IMPROVED: Use navigate instead of window.location.href
    if (itemId === "profile") {
      navigate("/staff/profile");
    } else {
      navigate(`/staff/${itemId}`);
    }
  };

  const renderContent = () => {
    console.log(
      `Profile Staff - Rendering content for path: ${location.pathname}`
    );

    switch (location.pathname) {
      case "/staff/profile":
        return <StaffProfile />;
      // ✅ ADDED: Handle other navigation cases
      case "/staff/dashboard":
        return (
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Redirecting to Dashboard...
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Please wait while we redirect you.
            </p>
          </div>
        );
      case "/staff/ticket":
        return (
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Redirecting to Ticket Selling...
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Please wait while we redirect you.
            </p>
          </div>
        );
      case "/staff/booking":
        return (
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Redirecting to Booking Management...
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Please wait while we redirect you.
            </p>
          </div>
        );
      case "/staff/members":
        return (
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Redirecting to Members Management...
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Please wait while we redirect you.
            </p>
          </div>
        );
      default:
        // ✅ ADDED: Fallback for unknown paths
        return (
          <div className="p-6 text-center">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              Staff Profile
            </h2>
            <p className="text-gray-500 dark:text-gray-400">
              Welcome to your profile page.
              {location.pathname !== "/staff/profile" && (
                <span className="block mt-2 text-sm">
                  Current path: {location.pathname}
                </span>
              )}
            </p>
          </div>
        );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 w-full">
      {/* Sidebar */}
      <SidebarStaff
        activeItem={getActiveItem()}
        onItemClick={handleItemClick}
        isOpen={isOpen}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col w-full transition-all duration-300 ${
          isOpen ? "ml-64" : "ml-0"
        }`}
      >
        {/* Header */}
        <HeaderStaff
          title={getPageTitle()}
          toggleSidebar={toggleSidebar}
          userName="Cinema Staff"
          userRole="Staff"
          isSidebarOpen={isOpen}
        />

        {/* Main Content */}
        <main className="flex-1 w-full p-4 sm:p-6 pt-4 sm:pt-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>

      {/* Mobile Overlay - hiển thị khi sidebar mở trên mobile */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => {
            console.log("Profile Staff - Overlay clicked - closing sidebar");
            setIsOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default ProfileStaff;

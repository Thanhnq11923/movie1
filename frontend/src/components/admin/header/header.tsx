"use client";

import React, { useState, useEffect } from "react";
import {
  User,
  ChevronDown,
  Home,
  ChevronRight,
  Menu,
} from "lucide-react";

interface HeaderProps {
  title?: string;
  userName?: string;
  userRole?: string;
  toggleSidebar: () => void;
  isSidebarOpen: boolean;
}

const Header: React.FC<HeaderProps> = ({
  title = "Dashboard",
  userName = "Admin",
  userRole = "Administrator",
  toggleSidebar,
  isSidebarOpen,
}) => {
  const [currentTime, setCurrentTime] = useState("");

  const getCurrentDateTime = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: "short",
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
      timeZone: "Asia/Ho_Chi_Minh",
    };
    return now.toLocaleDateString("en-US", options);
  };

  useEffect(() => {
    setCurrentTime(getCurrentDateTime());
    const timer = setInterval(() => {
      setCurrentTime(getCurrentDateTime());
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16 w-full flex-shrink-0 sticky top-0 z-30 transition-all duration-300">
      <div className="flex items-center justify-between w-full h-full px-4 lg:px-6">
        {/* Left section */}
        <div className="flex items-center space-x-2 lg:space-x-4 min-w-0 flex-1">
          <button
            onClick={toggleSidebar}
            className="p-2 text-gray-600 dark:text-gray-300 hover:text-blue-600 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-200 flex-shrink-0"
            aria-label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
          >
            <Menu size={20} />
          </button>

          {/* Breadcrumb */}
          <div className="hidden sm:flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300 min-w-0">
            <Home className="w-4 h-4 flex-shrink-0" />
            <span className="hidden md:inline">Dashboard</span>
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
            <span className="text-gray-900 dark:text-white font-medium truncate">
              {title}
            </span>
          </div>
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2 lg:space-x-4 flex-shrink-0">

          {/* Time */}
          <div className="hidden lg:block text-sm text-gray-600 dark:text-gray-300 whitespace-nowrap bg-gray-50 dark:bg-gray-800 px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-700">
            {currentTime}
          </div>

          {/* User profile dropdown */}
          <div className="relative">
            <button className="flex items-center space-x-2 lg:space-x-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg p-2 transition-all duration-200 group">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white flex-shrink-0">
                <User className="h-4 w-4" />
              </div>
              <div className="hidden md:block text-right min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {userName}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-300 truncate">
                  {userRole}
                </p>
              </div>
              <ChevronDown className="hidden lg:block h-4 w-4 text-gray-400 flex-shrink-0 group-hover:text-blue-600 transition-colors duration-200" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;

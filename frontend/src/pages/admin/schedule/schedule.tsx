import React, { useState, useEffect } from "react";
import Sidebar from "../../../components/admin/sidebar/sidebar";
import Header from "../../../components/admin/header/header";
import { Toaster } from "react-hot-toast";
import ScheduleManagement from "../../../components/admin/schedule/schedule-management";

const SchedulePage: React.FC = () => {
  const [activeItem, setActiveItem] = useState("schedule");
  const [isOpen, setIsOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile) {
        setIsOpen(false);
      } else {
        setIsOpen(true);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    if (isMobile) setIsOpen(false);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-100 dark:bg-gray-900 w-full">
      {/* Sidebar */}
      <Sidebar
        activeItem={activeItem}
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
        <Header
          title="Schedule Management"
          toggleSidebar={toggleSidebar}
          userName="Cinema Admin"
          userRole="Admin"
          isSidebarOpen={isOpen}
        />
        {/* Main Content */}
        <main className="flex-1 w-full p-4 sm:p-6 pt-4 sm:pt-6 overflow-y-auto">
          <ScheduleManagement />
        </main>
      </div>
      {/* Mobile Overlay */}
      {isOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
      <Toaster position="top-right" />
    </div>
  );
};

export default SchedulePage; 
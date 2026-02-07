"use client";

import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import SidebarStaff from "../../../components/Staff/sidebar/sidebar";
import HeaderStaff from "../../../components/Staff/header/header";
import MovieSchedule from "../../../components/Staff/schedule/movie-schedule";

const MovieSchedulePage: React.FC = () => {
  const [activeItem, setActiveItem] = useState("schedule");
  const [isOpen, setIsOpen] = useState(true);

  const handleItemClick = (itemId: string) => {
    setActiveItem(itemId);
    console.log(`Clicked on: ${itemId}`);
  };

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const getPageTitle = () => {
    const titles: Record<string, string> = {
      schedule: "Movie Schedule",
    };
    return titles[activeItem] || "Movie Schedule"; 
  };

  const renderContent = () => {
    switch (activeItem) {
      case "schedule":
        return <MovieSchedule/>;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 w-full">
      <div className="flex-shrink-0">
        <SidebarStaff
          activeItem={activeItem}
          onItemClick={handleItemClick}
          isOpen={isOpen}
        />
      </div>
      <div
        className={`flex-1 flex flex-col w-full ${
          isOpen ? "ml-64" : "ml-0"
        } transition-all duration-300`}
      >
        <HeaderStaff
          title={getPageTitle()}
          toggleSidebar={toggleSidebar}
          userName="Cinema Admin"
          userRole="Admin"
          isSidebarOpen={isOpen}
        />
        <main className="flex-1 w-full p-6 pt-6 overflow-y-auto">
          {renderContent()}
        </main>
      </div>
      <Toaster position="top-right" />
    </div>
  );
};

export default MovieSchedulePage;

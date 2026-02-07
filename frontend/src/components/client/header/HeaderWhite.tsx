import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

export const HeaderWhite = () => {
  const [showDropdown, setShowDropdown] = useState<string | null>(null);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  // Reset dropdown mỗi khi route thay đổi
  useEffect(() => {
    setShowDropdown(null);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems = [
    { path: "/", label: "Home" },
    {
      path: "#",
      label: "Movies",
      dropdown: [
        { path: "/showtime", label: "Showtime Movie" },
        { path: "/comingsoon", label: "Comingsoon" },
      ],
    },
    { path: "/members", label: "Members" },
    {
      path: "#",
      label: "Cultureplex",
      dropdown: [
        { path: "/RulePage", label: "Rules" },
        { path: "/EgiftPage", label: "Egift" },
      ],
    },
    { path: "/promotion", label: "Promotion" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white shadow-md">
      <div className="container mx-auto px-3 sm:px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="text-2xl sm:text-4xl font-bold">
            <div className="relative flex items-center">
              <img
                src={"/public/assets/images/logo/logo.png"}
                alt="Logo"
                className="w-5 h-6 sm:w-6 sm:h-8 transition duration-300"
              />

              <span className={"text-black font-sans text-sm sm:text-base"}>
                UMIERE
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 justify-center items-center space-x-4 lg:space-x-6">
          {navItems.map((item) => (
            <div
              key={item.path || item.label}
              className="relative"
              onMouseEnter={() => item.dropdown && setShowDropdown(item.label)}
              onMouseLeave={() => setShowDropdown(null)}
            >
              {item.path && item.path !== "#" ? (
                <Link
                  to={item.path}
                  className={`text-black hover:text-gray-600 px-2 sm:px-3 py-2 rounded-sm text-xs sm:text-sm font-medium transition-colors${
                    location.pathname === item.path ? "font-bold" : ""
                  }`}
                >
                  {item.label}
                </Link>
              ) : (
                <span className="cursor-pointer text-black hover:text-gray-600 px-2 sm:px-3 py-2 text-xs sm:text-sm">
                  {item.label}
                </span>
              )}

              {item.dropdown && showDropdown === item.label && (
                <div className="absolute top-full left-0 mt-1 w-40 sm:w-48 bg-[#E0E0E0] bg-opacity-80 text-black shadow-lg z-50 rounded-sm">
                  {item.dropdown.map((subItem) => (
                    <Link
                      key={subItem.path}
                      to={subItem.path}
                      className={`block px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm hover:bg-[#BDBDBD] ${
                        location.pathname === subItem.path
                          ? "bg-orange-300 text-black rounded-sm"
                          : "hover:rounded-sm"
                      }`}
                    >
                      {subItem.label}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>

        {/* User Menu & Mobile Menu Button */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center space-x-1 sm:space-x-2 text-xs sm:text-sm"
                >
                  <img
                    src={user.image}
                    alt=""
                    className="w-8 h-8 sm:w-10 sm:h-10 object-cover rounded-full overflow-hidden border-2 border-white/20 shadow-sm hover:shadow-md transition-shadow duration-200"
                  />
                  <span className="text-black">
                    {user.fullName || user.name}
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      isUserMenuOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-white shadow-lg rounded-sm z-50">
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-sm"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:rounded-sm hover:bg-orange-400"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                to="/login"
                className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors text-black hover:text-gray-600"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors bg-black text-white hover:bg-gray-800"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md text-black"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMobileMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow-lg border-t">
          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <div key={item.path || item.label}>
                {item.path && item.path !== "#" ? (
                  <Link
                    to={item.path}
                    className={`block px-3 py-2 text-sm font-medium rounded-md ${
                      location.pathname === item.path
                        ? "bg-orange-100 text-orange-700"
                        : "text-gray-700 hover:bg-gray-100"
                    }`}
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span className="block px-3 py-2 text-sm font-medium text-gray-700">
                    {item.label}
                  </span>
                )}
                {item.dropdown && (
                  <div className="ml-4 space-y-1">
                    {item.dropdown.map((subItem) => (
                      <Link
                        key={subItem.path}
                        to={subItem.path}
                        className={`block px-3 py-2 text-sm rounded-md ${
                          location.pathname === subItem.path
                            ? "bg-orange-100 text-orange-700"
                            : "text-gray-600 hover:bg-gray-50"
                        }`}
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {subItem.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </header>
  );
};

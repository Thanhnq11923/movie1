import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";

export const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showDropdown, setShowDropdown] = useState<string | null>("");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();

  useEffect(() => {
    setShowDropdown(null);
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setIsScrolled(scrollPosition > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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
      path: "",
      label: "Cultureplex",
      dropdown: [
        { path: "/RulePage", label: "Rules" },
        { path: "/EgiftPage", label: "Egift" },
      ],
    },
    { path: "/Promotion", label: "Promotion" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? "bg-white shadow-md" : "text-white bg-transparent"
      }`}
    >
      <div className="container mx-auto px-3 sm:px-4 py-2 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="text-2xl sm:text-4xl font-bold">
            <div className="relative flex items-center">
              <img
                src={
                  isScrolled
                    ? "/public/assets/images/logo/logo.png"
                    : "/public/assets/images/logo/logo1.png"
                }
                alt="Logo"
                className="w-5 h-6 sm:w-6 sm:h-8 transition duration-300"
              />

              <span
                className={`${
                  isScrolled ? "text-black font-sans" : "text-white font-sans"
                } text-sm sm:text-base`}
              >
                UMIERE
              </span>
            </div>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex flex-1 justify-center items-center space-x-4 lg:space-x-6">
          {navItems.map((item) => (
            <div
              key={item.path}
              className="relative"
              onMouseEnter={() => item.dropdown && setShowDropdown(item.path)}
              onMouseLeave={() => setShowDropdown(null)}
            >
              <Link
                to={item.path}
                className={`px-2 sm:px-3 py-2 rounded-sm text-xs sm:text-sm font-medium transition-colors ${
                  isScrolled
                    ? "text-gray-700 hover:text-black"
                    : "text-white hover:bg-white/30 hover:rounded-sm"
                } ${location.pathname === item.path ? "font-bold" : ""}`}
              >
                {item.label}
              </Link>
              {item.dropdown && showDropdown === item.path && (
                <div className="absolute top-full left-0 mt-1 w-40 sm:w-48 bg-white text-black shadow-lg rounded-sm">
                  {item.dropdown.map((subItem) => (
                    <Link
                      key={subItem.path}
                      to={subItem.path}
                      className={`block px-3 sm:px-4 py-2 sm:py-3 text-xs sm:text-sm hover:bg-gray-100 hover:rounded-sm ${
                        location.pathname === subItem.path
                          ? "bg-orange-400 text-black hover:rounded-sm"
                          : ""
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
                  className="flex items-center space-x-2 sm:space-x-3 text-xs sm:text-sm"
                >
                  {/* User Avatar */}
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-white/20 shadow-sm hover:shadow-md transition-shadow duration-200">
                    {user.image ? (
                      <img
                        src={user.image}
                        alt={`${user.fullName || user.username} avatar`}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to default avatar if image fails to load
                          const target = e.target as HTMLImageElement;
                          target.style.display = "none";
                          target.nextElementSibling?.classList.remove("hidden");
                        }}
                      />
                    ) : null}
                    {/* Default Avatar Fallback */}
                    <div
                      className={`w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm ${
                        user.image ? "hidden" : ""
                      }`}
                    >
                      {(user.fullName || user.username || "U")
                        .charAt(0)
                        .toUpperCase()}
                    </div>
                  </div>

                  {/* User Name */}
                  <span className={isScrolled ? "text-black" : "text-white"}>
                    {user.fullName || user.username}
                  </span>

                  {/* Dropdown Arrow */}
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
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-200 hover:rounded-sm"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-orange-400 hover:rounded-sm"
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
                className={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  isScrolled
                    ? "text-gray-700 hover:text-black"
                    : "text-white hover:bg-white/10"
                }`}
              >
                Login
              </Link>
              <Link
                to="/register"
                className={`px-2 sm:px-3 py-1 sm:py-2 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  isScrolled
                    ? "bg-black text-white hover:bg-gray-800"
                    : "bg-white text-black hover:bg-gray-100"
                }`}
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 rounded-md"
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
          {/* User Info in Mobile Menu */}
          {isAuthenticated && user && (
            <div className="px-4 py-3 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                {/* User Avatar */}
                <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-gray-200 shadow-sm">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={`${user.fullName || user.username} avatar`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none";
                        target.nextElementSibling?.classList.remove("hidden");
                      }}
                    />
                  ) : null}
                  {/* Default Avatar Fallback */}
                  <div
                    className={`w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold text-sm ${
                      user.image ? "hidden" : ""
                    }`}
                  >
                    {(user.fullName || user.username || "U")
                      .charAt(0)
                      .toUpperCase()}
                  </div>
                </div>

                {/* User Name */}
                <div>
                  <div className="font-medium text-gray-900">
                    {user.fullName || user.username}
                  </div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>

              {/* User Menu Items */}
              <div className="mt-3 space-y-1">
                <Link
                  to="/profile"
                  className="block px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Profile
                </Link>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="block w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md"
                >
                  Logout
                </button>
              </div>
            </div>
          )}

          <div className="px-4 py-2 space-y-1">
            {navItems.map((item) => (
              <div key={item.path}>
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

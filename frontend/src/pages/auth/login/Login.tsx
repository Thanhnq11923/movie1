import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { useAuth } from "../../../hooks";
import { useDispatch } from "react-redux";
import { setBookingMeta } from "../../../store/bookingSlice";


export default function Login() {
  // Image is imported from public folder directly
  const loginBgImage = "/assets/images/login_Page.png";

  const navigate = useNavigate();
  const { login, isLoading } = useAuth();
  const dispatch = useDispatch();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, boolean>>({});

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFieldErrors({});

    let hasError = false;

    if (formData.username.trim() === "") {
      setFieldErrors((prev) => ({ ...prev, username: true }));
      hasError = true;
    }

    if (formData.password.trim() === "") {
      setFieldErrors((prev) => ({ ...prev, password: true }));
      hasError = true;
    }

    if (hasError) {
      setTimeout(() => setFieldErrors({}), 2000);
      return;
    }

    try {
      const result = await login({
        username: formData.username,
        password: formData.password,
      });

      if (result.success) {
        // Lưu user vào localStorage
        if (result.data?.user) {
          localStorage.setItem("user", JSON.stringify(result.data.user));
          // Lưu userId vào Redux booking
          const userId = result.data.user._id || result.data.user.id;
          dispatch(setBookingMeta({ userId, scheduleId: null, cinemaRoomId: null }));
        }
        if (result.data?.user?.roleId === "6864af6bdd24a9f129d73d93") {
          navigate("/admin/home");
          toast.success("Admin login successful!");
        } else if (result.data?.user?.roleId === "684f84c7a2c60b9b2be5e315") {
          navigate("/staff/dashboard");
          toast.success("Staff login successful!");
        } else {
          navigate("/");
          toast.success("Login successful!");
        }
      } else {
        toast.error(result.error || "Login failed");
      }
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast.error("An unexpected error occurred");
    }
  };

  const getErrorClass = (fieldName: string) => {
    return fieldErrors[fieldName] ? "border-2 border-red-500" : "";
  };

  return (
    <div className="min-h-screen min-w-screen flex w-full">
      {/* Error Popup is now handled by sonner Toaster */}

      {/* Left side - Movie collage background */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src={loginBgImage}
          alt="Movie and TV show collage"
          className="absolute w-full h-full object-cover"
        />
      </div>

      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center">
        <div className="w-full max-w-md space-y-8">
          {/* Decorative stars */}
          <div className="relative">
            <div className="absolute -top-8 right-8 text-white text-2xl">✦</div>
            <div className="absolute -top-4 right-16 text-white text-lg">✧</div>
          </div>

          {/* Login heading */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-black mb-8">Login</h1>
          </div>

          {/* Login form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Username field */}
            <div className="space-y-2">
              <label
                htmlFor="username"
                className="block text-black-300 text-sm"
              >
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Enter your username"
                value={formData.username}
                onChange={handleInputChange}
                className={`w-full bg-gray-200 rounded-md p-2 text-black placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${getErrorClass(
                  "username"
                )}`}
              />
            </div>

            {/* Password field */}
            <div className="space-y-2">
              <label
                htmlFor="password"
                className="block text-black-300 text-sm"
              >
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full bg-gray-200 rounded-md p-2 text-black placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${getErrorClass(
                  "password"
                )}`}
              />
            </div>

            {/* Remember me and Forgot password */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
              </div>
              <Link
                to="/forgot-password"
                className="text-gray-500 hover:text-red-600 text-sm transition-colors"
              >
                Forget Password?
              </Link>
            </div>

            {/* Login button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white font-medium py-3 rounded-lg transition-colors"
            >
              {isLoading ? "Logging in..." : "Login"}
            </button>

            {/* Register link */}
            <div className="text-center">
              <span className="text-black-600 text-sm">
                {"Don't have an account yet? "}
                <Link
                  to="/register"
                  className="text-red-500 hover:text-red-500 font-bold transition-colors"
                >
                  Register
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

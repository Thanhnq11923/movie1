import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { useAuth } from "../../../hooks";

const passwordRegex =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const registerSchema = z
  .object({
    fullName: z.string().min(1, "Full name is required"),
    dateOfBirth: z
      .string()
      .min(1, "Date of birth is required")
      .refine((date) => {
        // Check if date is valid
        const selectedDate = new Date(date);
        if (isNaN(selectedDate.getTime())) {
          return false;
        }
        
        const today = new Date();
        
        // Check if date is not in the future
        if (selectedDate > today) {
          return false;
        }
        
        // Calculate age
        const age = today.getFullYear() - selectedDate.getFullYear();
        const monthDiff = today.getMonth() - selectedDate.getMonth();
        
        // Adjust age if birthday hasn't occurred this year
        const actualAge = monthDiff < 0 || (monthDiff === 0 && today.getDate() < selectedDate.getDate()) 
          ? age - 1 
          : age;
        
        // Check minimum age (13 years old)
        if (actualAge < 13) {
          return false;
        }
        
        // Check maximum age (120 years old)
        if (actualAge > 120) {
          return false;
        }
        
        return true;
      }, {
        message: "Date of birth must be valid. You must be at least 13 years old and not older than 120 years. Future dates are not allowed."
      }),
    phoneNumber: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^\d{10}$/, "Phone number must be 10 digits"),
    username: z.string().min(1, "Username is required"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters long")
      .regex(
        passwordRegex,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string().min(1, "Confirm password is required"),
    address: z.string().min(1, "Address is required"),
    gender: z.enum(["Male", "Female", "Other"]),
    image: z
      .string()
      .url("Please enter a valid URL")
      .or(z.literal(""))
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

// Add a new type for server-side errors
type FormErrors = z.ZodError<RegisterFormData>["formErrors"]["fieldErrors"] & {
  _server?: string[];
};

export default function Register() {
  // Image is imported from public folder directly
  const registerBgImage = "/assets/images/login_Page.png";

  const navigate = useNavigate();
  const { register, isLoading } = useAuth();

  const [formData, setFormData] = useState<RegisterFormData>({
    fullName: "",
    dateOfBirth: "",
    phoneNumber: "",
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    address: "",
    gender: "Male",
    image: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name as keyof RegisterFormData]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof RegisterFormData];
        return newErrors;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const validationResult = registerSchema.safeParse(formData);

    if (!validationResult.success) {
      setErrors(validationResult.error.flatten().fieldErrors);
      return;
    }

    try {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { confirmPassword, ...registerData } = validationResult.data;

      const result = await register({
        ...registerData,
        roleId: "507f1f77bcf86cd799439028", // Default user role
      });

      if (result.success) {
        navigate("/");
        toast.success("Registration successful! Please log in.");
      } else {
        // Handle server-side errors
        const serverError = result.error || "Registration failed";
        setErrors({ _server: [serverError] });
        toast.error(serverError);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      // For debugging purposes
      console.error("Registration failed:", err);
      const unexpectedError =
        "An unexpected error occurred during registration.";
      setErrors({
        _server: [unexpectedError],
      });
      toast.error(unexpectedError);
    }
  };

  const getErrorClass = (fieldName: keyof RegisterFormData) => {
    return errors[fieldName] ? "border-2 border-red-500" : "";
  };

  // Helper function to calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number | null => {
    if (!dateOfBirth) return null;
    
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    // Adjust age if birthday hasn't occurred this year
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    
    return age;
  };

  return (
    <div className="min-h-screen min-w-screen flex w-full">
      {/* Left side - Registration form */}
      <div className="w-full lg:w-1/2 bg-white flex items-center justify-center">
        <div className="w-full max-w-[650px] space-y-8 p-8">
          {/* Login heading */}
          <div className="text-center">
            <h1 className="text-4xl font-bold text-black mb-8">Register</h1>
          </div>

          {errors._server && (
            <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-center">
              {errors._server[0]}
            </div>
          )}

          {/* Registration form */}
          <form onSubmit={handleSubmit} noValidate>
            {/* Two column layout */}
            <div className="grid grid-cols-2 gap-4">
              {/* Left column */}
              <div className="space-y-4">
                {/* Full name field */}
                <div className="space-y-1">
                  <label
                    htmlFor="fullName"
                    className="block text-black-300 text-sm"
                  >
                    Full Name
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    placeholder="Enter your full name"
                    onChange={handleInputChange}
                    value={formData.fullName}
                    className={`w-full bg-gray-200 rounded-md p-3 text-black text-base placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 h-12 ${getErrorClass(
                      "fullName"
                    )}`}
                  />
                  {errors.fullName && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.fullName[0]}
                    </p>
                  )}
                </div>

                {/* Birthday field */}
                <div className="space-y-1">
                  <label
                    htmlFor="dateOfBirth"
                    className="block text-black-300 text-sm"
                  >
                    Birthday *
                  </label>
                  <input
                    id="dateOfBirth"
                    name="dateOfBirth"
                    type="date"
                    onChange={handleInputChange}
                    value={formData.dateOfBirth}
                    max={new Date().toISOString().split('T')[0]}
                    className={`w-full bg-gray-200 rounded-md p-3 text-black text-base placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 h-12 ${getErrorClass(
                      "dateOfBirth"
                    )}`}
                  />
                  {errors.dateOfBirth && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.dateOfBirth[0]}
                    </p>
                  )}
                  {formData.dateOfBirth && calculateAge(formData.dateOfBirth) !== null && (
                    <p className="text-blue-600 text-xs mt-1">
                      Age: {calculateAge(formData.dateOfBirth)} years old
                    </p>
                  )}
                  <p className="text-gray-500 text-xs">
                    You must be at least 13 years old to register
                  </p>
                </div>

                {/* Phone number field */}
                <div className="space-y-1">
                  <label
                    htmlFor="phoneNumber"
                    className="block text-black-300 text-sm"
                  >
                    Phone Number
                  </label>
                  <input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    placeholder="Enter your phone number"
                    onChange={handleInputChange}
                    value={formData.phoneNumber}
                    className={`w-full bg-gray-200 rounded-md p-3 text-black text-base placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 h-12 ${getErrorClass(
                      "phoneNumber"
                    )}`}
                  />
                  {errors.phoneNumber && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.phoneNumber[0]}
                    </p>
                  )}
                </div>

                {/* Username field */}
                <div className="space-y-1">
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
                    placeholder="Choose a username"
                    onChange={handleInputChange}
                    value={formData.username}
                    className={`w-full bg-gray-200 rounded-md p-3 text-black text-base placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 h-12 ${getErrorClass(
                      "username"
                    )}`}
                  />
                  {errors.username && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.username[0]}
                    </p>
                  )}
                </div>

                {/* Address field */}
                <div className="space-y-1">
                  <label
                    htmlFor="address"
                    className="block text-black-300 text-sm"
                  >
                    Address
                  </label>
                  <input
                    id="address"
                    name="address"
                    type="text"
                    placeholder="Enter your address"
                    onChange={handleInputChange}
                    value={formData.address}
                    className={`w-full bg-gray-200 rounded-md p-3 text-black text-base placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 h-12 ${getErrorClass(
                      "address"
                    )}`}
                  />
                  {errors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.address[0]}
                    </p>
                  )}
                </div>
              </div>

              {/* Right column */}
              <div className="space-y-4">
                {/* Email field */}
                <div className="space-y-1">
                  <label
                    htmlFor="email"
                    className="block text-black-300 text-sm"
                  >
                    Email
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="Enter your email"
                    onChange={handleInputChange}
                    value={formData.email}
                    className={`w-full bg-gray-200 rounded-md p-3 text-black text-base placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 h-12 ${getErrorClass(
                      "email"
                    )}`}
                  />
                  {errors.email && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.email[0]}
                    </p>
                  )}
                </div>

                {/* Password field */}
                <div className="space-y-1">
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
                    onChange={handleInputChange}
                    value={formData.password}
                    className={`w-full bg-gray-200 rounded-md p-3 text-black text-base placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 h-12 ${getErrorClass(
                      "password"
                    )}`}
                  />
                  {errors.password && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.password[0]}
                    </p>
                  )}
                </div>

                {/* Confirm password field */}
                <div className="space-y-1">
                  <label
                    htmlFor="confirmPassword"
                    className="block text-black-300 text-sm"
                  >
                    Confirm Password
                  </label>
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    onChange={handleInputChange}
                    value={formData.confirmPassword}
                    className={`w-full bg-gray-200 rounded-md p-3 text-black text-base placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 h-12 ${getErrorClass(
                      "confirmPassword"
                    )}`}
                  />
                  {errors.confirmPassword && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.confirmPassword[0]}
                    </p>
                  )}
                </div>

                {/* Gender field */}
                <div className="space-y-1">
                  <label
                    htmlFor="gender"
                    className="block text-black-300 text-sm"
                  >
                    Gender
                  </label>
                  <select
                    id="gender"
                    name="gender"
                    onChange={handleInputChange}
                    value={formData.gender}
                    className={`w-full bg-gray-200 rounded-md p-3 text-black text-base placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 h-12 ${getErrorClass(
                      "gender"
                    )}`}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Image upload */}
                <div className="space-y-1">
                  <label
                    htmlFor="image"
                    className="block text-black-300 text-sm"
                  >
                    Image URL (Optional)
                  </label>
                  <input
                    id="image"
                    name="image"
                    type="text"
                    placeholder="Enter image URL"
                    onChange={handleInputChange}
                    className={`w-full bg-gray-200 rounded-md p-3 text-black text-base placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 h-12 ${getErrorClass(
                      "image"
                    )}`}
                  />
                  {errors.image && (
                    <p className="text-red-500 text-xs mt-1">
                      {errors.image[0]}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Submit button */}
            <div className="mt-6 ">
              <button
                type="submit"
                className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 rounded-lg transition-colors disabled:bg-gray-400"
                disabled={isLoading}
              >
                {isLoading ? "Registering..." : "Register"}
              </button>
            </div>
            <div className="text-center mt-4">
              <span className="text-black-600 text-sm">
                {"Already have an account? "}
                <Link
                  to="/login"
                  className="text-red-500 hover:text-red-500 font-bold transition-colors"
                >
                  Login
                </Link>
              </span>
            </div>
          </form>
        </div>
      </div>

      {/* Right side - Image */}
      <div className="hidden lg:flex lg:w-1/2 relative">
        <img
          src={registerBgImage}
          alt="Movie and TV show collage"
          className="absolute w-full h-full object-cover"
        />
      </div>
    </div>
  );
}

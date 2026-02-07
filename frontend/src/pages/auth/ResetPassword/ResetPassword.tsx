import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../../../services/api/authService";

interface LocationState {
  email: string;
  otp: string;
  verified: boolean;
}

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState(false);
  const [confirmPasswordError, setConfirmPasswordError] = useState(false);
  const [passwordMismatch, setPasswordMismatch] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  // Get email and OTP from navigation state or localStorage
  useEffect(() => {
    const state = location.state as { email?: string };
    if (state?.email) {
      setEmail(state.email);
    } else {
      const savedEmail = localStorage.getItem('resetEmail');
      if (savedEmail) {
        setEmail(savedEmail);
      } else {
        navigate('/forgot-password');
        return;
      }
    }
  }, [location.state, navigate]);

  const validatePassword = (password: string): string | null => {
    if (password.length < 8) {
      return "Password must be at least 8 characters long";
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character";
    }

    return null;
  };

  const showError = (message: string): void => {
    setErrorMessage(message);
    setShowErrorMessage(true);
    setTimeout(() => setShowErrorMessage(false), 5000);
  };

  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    // Reset all error states
    setPasswordError(false);
    setConfirmPasswordError(false);
    setPasswordMismatch(false);
    setShowErrorMessage(false);
    
    let hasError = false;
    
    // Validate password field
    if (password.trim() === '') {
      setPasswordError(true);
      setTimeout(() => setPasswordError(false), 500);
      hasError = true;
    }
    
    // Validate confirm password field
    if (confirmPassword.trim() === '') {
      setConfirmPasswordError(true);
      setTimeout(() => setConfirmPasswordError(false), 500);
      hasError = true;
    }
    
    if (hasError) return;

    // Check password match
    if (password !== confirmPassword) {
      setPasswordMismatch(true);
      setTimeout(() => setPasswordMismatch(false), 2000);
      return;
    }

    // Validate password strength
    const passwordValidationError = validatePassword(password);
    if (passwordValidationError) {
      showError(passwordValidationError);
      return;
    }
    
    setIsLoading(true);
    
    try {
      let response;
      if (authService && typeof authService.resetPassword === 'function') {
        response = await authService.resetPassword(email, password);
      } else {
        const fetchResponse = await fetch('http://localhost:3000/api/auth/reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, newPassword: password })
        });
        response = await fetchResponse.json();
      }
      if (response.success) {
        setShowSuccessMessage(true);
        // Clear localStorage
        localStorage.removeItem('resetEmail');
        localStorage.removeItem('verifiedEmail');
        localStorage.removeItem('verifiedOtp');
        setTimeout(() => {
          setShowSuccessMessage(false);
          navigate('/login');
        }, 3000);
      } else {
        showError(response.message || "Failed to reset password");
      }
    } catch (error: any) {
      console.error('Reset password error:', error);
      const errorMsg = error?.message || error?.data?.message || "Failed to reset password. Please try again.";
      showError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center relative text-black">
      {/* Success message popup */}
      {showSuccessMessage && (
        <div className="fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-md shadow-lg z-50 animate-fade-in-down">
          <div className="flex items-center">
            <div className="mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Success!</p>
              <p className="text-sm">Your password has been reset successfully</p>
            </div>
            <button 
              className="ml-6 text-white" 
              onClick={() => setShowSuccessMessage(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Error message popup */}
      {showErrorMessage && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-md shadow-lg z-50 animate-fade-in-down">
          <div className="flex items-center">
            <div className="mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Error!</p>
              <p className="text-sm">{errorMessage}</p>
            </div>
            <button 
              className="ml-6 text-white" 
              onClick={() => setShowErrorMessage(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Password mismatch error popup */}
      {passwordMismatch && (
        <div className="fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-md shadow-lg z-50 animate-fade-in-down">
          <div className="flex items-center">
            <div className="mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-medium">Error!</p>
              <p className="text-sm">Passwords do not match</p>
            </div>
            <button 
              className="ml-6 text-white" 
              onClick={() => setPasswordMismatch(false)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Decorative stars */}
      <div className="absolute top-10 right-10">
        <span className="text-red-500 text-2xl">✦</span>
      </div>
      <div className="absolute bottom-10 left-10">
        <span className="text-red-500 text-2xl">✦</span>
        <span className="text-red-500 text-lg ml-4 mt-2">✧</span>
      </div>

      <div className="w-full max-w-md p-8 space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-6">Reset Password</h1>
          <p className="text-gray-600 italic">
            Please enter your new password
          </p>
          {email && (
            <p className="text-sm text-gray-500 mt-2">
              Resetting password for: {email}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* New Password */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-sm font-medium">
              New Password <span className="text-red-500">*</span>
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full bg-gray-100 rounded-md p-3 text-black placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${passwordError ? 'border-2 border-red-500' : ''}`}
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500">
              Must be at least 8 characters with uppercase, lowercase, number, and special character
            </p>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label htmlFor="confirmPassword" className="block text-sm font-medium">
              Confirm Password <span className="text-red-500">*</span>
            </label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className={`w-full bg-gray-100 rounded-md p-3 text-black placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${confirmPasswordError ? 'border-2 border-red-500' : ''}`}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-md transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'RESETTING...' : 'RESET PASSWORD'}
          </button>

          <div className="text-center mt-4">
            <span className="text-gray-600">
              Remember your password?{" "}
              <Link to="/login" className="text-red-600 hover:text-red-800 font-bold">
                Login
              </Link>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../../services/api/authService";

export default function ForgetPassword() {
  const [email, setEmail] = useState("");
  const [emailError, setEmailError] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (email.trim() === '') {
      setEmailError(true);
      setTimeout(() => setEmailError(false), 500);
      return;
    }
    
    setIsLoading(true);
    setShowErrorMessage(false);
    
    try {
      let response;
      try {
        if (typeof authService.forgotPassword === 'function') {
          response = await authService.forgotPassword(email.trim());
        } else {
          // Fallback to direct fetch
          const fetchResponse = await fetch('http://localhost:3000/api/auth/forgot-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email.trim() })
          });
          response = await fetchResponse.json();
        }
      } catch (serviceError) {
        console.error('Auth service error:', serviceError);
        // Fallback to direct fetch
        const fetchResponse = await fetch('http://localhost:3000/api/auth/forgot-password', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email.trim() })
        });
        response = await fetchResponse.json();
      }

      if (response.success) {
        // Lưu email vào localStorage để sử dụng ở trang verify-code
        localStorage.setItem('resetEmail', email.trim());
        
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          navigate('/verify-code');
        }, 2000);
      } else {
        setErrorMessage(response.message || 'Something went wrong');
        setShowErrorMessage(true);
        setTimeout(() => setShowErrorMessage(false), 5000);
      }
    } catch (error: any) {
      console.error('Forgot password error:', error);
      const errorMsg = error?.message || error?.data?.message || 'Network error. Please try again.';
      setErrorMessage(errorMsg);
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 5000);
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
              <p className="font-medium">Email Sent!</p>
              <p className="text-sm">A verification code has been sent to your email</p>
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
          <h1 className="text-4xl font-bold mb-6">Forget Password</h1>
          <p className="text-gray-600 italic">
            Please Enter Your Email Address And We'll Send You Verification Code To Reset Your Password
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-2">
            <label htmlFor="email" className="block text-sm font-medium">
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="example@gmail.com"
              className={`w-full bg-gray-100 rounded-md p-3 text-black placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${emailError ? 'border-2 border-red-500' : ''}`}
              disabled={isLoading}
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-md transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'SENDING...' : 'SUBMIT VERIFICATION CODE'}
          </button>

          <div className="text-center mt-4">
            <span className="text-gray-600">
              Already have an account?{" "}
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
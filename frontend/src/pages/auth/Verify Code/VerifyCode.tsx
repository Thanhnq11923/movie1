import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authService } from "../../../services/api/authService";

export default function VerifyCode() {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [codeError, setCodeError] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  // Lấy email từ localStorage khi component mount
  useEffect(() => {
    const savedEmail = localStorage.getItem('resetEmail');
    if (!savedEmail) {
      // Nếu không có email, redirect về trang forgot password
      navigate('/forgot-password');
      return;
    }
    setEmail(savedEmail);
    
    // Development helper: Log the email for debugging
    console.log('Reset email from localStorage:', savedEmail);
  }, [navigate]);

  // Development helper: Log OTP changes
  useEffect(() => {
    const currentOtp = code.join('');
    if (currentOtp.length === 6) {
      console.log('Current OTP entered:', currentOtp);
    }
  }, [code]);

  // Handle digit change in verification code
  const handleCodeChange = (index: number, value: string) => {
    // Only allow numbers
    if (value && !/^\d*$/.test(value)) return;
    
    // Create a new array with the updated value
    const newCode = [...code];
    newCode[index] = value;
    setCode(newCode);
    
    // Auto focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`code-${index + 1}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  // Handle backspace keydown
  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      // Focus previous input when backspace is pressed on an empty input
      const prevInput = document.getElementById(`code-${index - 1}`);
      if (prevInput) {
        prevInput.focus();
      }
    }
  };

  // Handle paste functionality
  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text/plain");
    // Only process if paste data is all digits and has correct length
    if (/^\d+$/.test(pasteData) && pasteData.length <= 6) {
      const newCode = [...code];
      for (let i = 0; i < pasteData.length; i++) {
        if (i < 6) {
          newCode[i] = pasteData[i];
        }
      }
      setCode(newCode);
      
      // Focus the next empty input or the last input
      const lastIndex = Math.min(pasteData.length, 5);
      const nextInput = document.getElementById(`code-${lastIndex}`);
      if (nextInput) {
        nextInput.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (code.some(digit => !digit)) {
      setCodeError(true);
      setTimeout(() => setCodeError(false), 500);
      return;
    }
    setIsLoading(true);
    setShowErrorMessage(false);

    try {
      const otp = code.join('');
      // Gọi API verify-otp
      const response = await fetch('http://localhost:3000/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });
      const data = await response.json();
      if (data.success) {
        setShowSuccessMessage(true);
        setTimeout(() => {
          setShowSuccessMessage(false);
          // Chuyển sang trang reset password
          navigate('/reset-password', { state: { email } });
        }, 2000);
      } else {
        setErrorMessage(data.message || 'OTP is invalid or has expired');
        setShowErrorMessage(true);
        setTimeout(() => setShowErrorMessage(false), 5000);
      }
    } catch (error) {
      setErrorMessage('Network error. Please try again.');
      setShowErrorMessage(true);
      setTimeout(() => setShowErrorMessage(false), 5000);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendCode = async () => {
    if (!email) return;
    
    setIsLoading(true);
    setShowErrorMessage(false);
    
    try {
      let response;
      try {
        if (typeof authService.forgotPassword === 'function') {
          response = await authService.forgotPassword(email);
        } else {
          // Fallback to direct fetch
          const fetchResponse = await fetch('http://localhost:3000/api/auth/forgot-password', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email: email })
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
          body: JSON.stringify({ email: email })
        });
        response = await fetchResponse.json();
      }

      if (response.success) {
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 3000);
      } else {
        setErrorMessage(response.message || 'Error resending code');
        setShowErrorMessage(true);
        setTimeout(() => setShowErrorMessage(false), 5000);
      }
    } catch (error: any) {
      console.error('Resend OTP error:', error);
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
              <p className="font-medium">Verification Successful!</p>
              <p className="text-sm">Redirecting to reset password...</p>
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
          <h1 className="text-4xl font-bold mb-6">Verification Code</h1>
          <p className="text-gray-600 italic">
            Please enter the 6-digit verification code sent to your email
          </p>
          {email && (
            <p className="text-sm text-gray-500 mt-2">
              Code sent to: {email}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="space-y-4">
            <label htmlFor="code-0" className="block text-sm font-medium">
              Enter Verification Code <span className="text-red-500">*</span>
            </label>
            
            {/* Verification Code Input */}
            <div className={`flex justify-between ${codeError ? 'shake' : ''}`}>
              {code.map((digit, index) => (
                <input
                  key={index}
                  id={`code-${index}`}
                  type="text"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleCodeChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  onPaste={index === 0 ? handlePaste : undefined}
                  className={`w-12 h-12 text-center text-xl font-bold bg-gray-100 rounded-md p-2 text-black focus:outline-none focus:ring-1 focus:ring-blue-500 ${codeError ? 'border-2 border-red-500' : ''}`}
                  disabled={isLoading}
                />
              ))}
            </div>
            
            {/* Resend code link */}
            <div className="text-center mt-4">
              <button 
                type="button" 
                onClick={handleResendCode}
                disabled={isLoading}
                className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
              >
                {isLoading ? 'Sending...' : "Didn't receive a code? Resend"}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className={`w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-md transition-colors ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {isLoading ? 'VERIFYING...' : 'VERIFY CODE'}
          </button>

          <div className="text-center mt-4">
            <span className="text-gray-600">
              Back to{" "}
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
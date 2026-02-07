import React, { useEffect } from "react";
import { X, AlertTriangle, CheckCircle, Info, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  type?: "warning" | "success" | "info" | "error";
  confirmText?: string;
  cancelText?: string;
  showCancelButton?: boolean;
}

const icons = {
  warning: AlertTriangle,
  success: CheckCircle,
  info: Info,
  error: AlertCircle,
};

const colors = {
  warning: {
    bg: "bg-white",
    border: "border-gray-200",
    icon: "text-amber-600",
    button: "bg-red-100 hover:bg-red-200",
    buttonText: "text-red-700",
    shadow: "",
  },
  success: {
    bg: "bg-white",
    border: "border-gray-200",
    icon: "text-emerald-600",
    button: "bg-green-100 hover:bg-green-200",
    buttonText: "text-green-700",
    shadow: "",
  },
  info: {
    bg: "bg-white",
    border: "border-gray-200",
    icon: "text-blue-600",
    button: "bg-blue-100 hover:bg-blue-200",
    buttonText: "text-blue-700",
    shadow: "",
  },
  error: {
    bg: "bg-white",
    border: "border-gray-200",
    icon: "text-red-600",
    button: "bg-red-100 hover:bg-red-200",
    buttonText: "text-red-700",
    shadow: "",
  },
};

export function ConfirmationModal({
  isOpen,
  onClose,
  title,
  message,
  type = "warning",
  confirmText = "Confirm",
  cancelText = "Cancel",
  showCancelButton = true,
}: ConfirmationModalProps) {
  const IconComponent = icons[type];
  const colorScheme = colors[type];
  const navigate = useNavigate();

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handLogout = () => {
    localStorage.removeItem("authToken");
    navigate("/login", { replace: true });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div
        className={`
          relative ${colorScheme.bg} ${colorScheme.border}
          border-2 rounded-2xl max-w-md w-full
          transform transition-all duration-500 ease-out
          animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-4
          ${colorScheme.shadow}
        `}
      >
        {/* Header */}
        <div className="relative flex items-center justify-between p-6 border-b border-gray-200/70">
          <div className="flex items-center space-x-4">
            <div
              className={`p-3 rounded-2xl bg-white/80 shadow ${colorScheme.icon}`}
            >
              <IconComponent className="w-7 h-7" />
            </div>
            <h3 className="text-xl font-bold text-gray-900">{title}</h3>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-all duration-200 p-2 rounded-full hover:bg-gray-100 hover:scale-110"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        {/* Content */}
        <div className="relative p-6">
          <p className="text-gray-700 leading-relaxed mb-8 text-base">
            {message}
          </p>
          {/* Actions */}
          <div className="flex space-x-4">
            {showCancelButton && (
              <button
                onClick={onClose}
                className="flex-1 px-6 py-3 text-gray-700 bg-white border-2 border-gray-300 rounded-2xl hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 font-semibold shadow-sm hover:shadow-md"
              >
                {cancelText}
              </button>
            )}
            <button
              onClick={() => handLogout()}
              className={`
                flex-1 px-6 py-3 ${colorScheme.button} ${colorScheme.buttonText}
                rounded-2xl font-semibold transition-all duration-200
                hover:shadow-lg transform hover:scale-105 active:scale-95
                shadow-md
              `}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

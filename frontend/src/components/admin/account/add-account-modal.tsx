"use client";

import React, { useState } from "react";
import { X, RefreshCw, Check, AlertCircle } from "lucide-react";
import { notify, MESSAGES } from "../../../lib/toast";
import {
  generateMemberIdForMember,
  checkMemberIdExists,
} from "../../../services/admin_api/memberService";
import { authService } from "../../../services/api/authService";

interface NewAccountInput {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  gender: "Male" | "Female" | "Other";
  image?: string;
  roleId: string;
  status: 1; // 1 for Active, 0 for Locked
  member: {
    memberId?: string;
    score: number;
  };
  registerDate?: string; // Add registerDate to NewAccountInput
}

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddAccount: (account: NewAccountInput) => void;
}

const AddAccountModal: React.FC<AddAccountModalProps> = ({
  isOpen,
  onClose,
  onAddAccount,
}) => {
  const [formData, setFormData] = useState<NewAccountInput>({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    address: "",
    dateOfBirth: "",
    gender: "Male",
    image: "",
    roleId: "507f1f77bcf86cd799439028", // Member role ID chuẩn
    status: 1,
    member: {
      memberId: "",
      score: 0,
    },
    registerDate: new Date().toISOString(), // Initialize with current date
  });

  const [errors, setErrors] = useState<Partial<NewAccountInput>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingMemberId, setIsCheckingMemberId] = useState(false);
  const [isGeneratingMemberId, setIsGeneratingMemberId] = useState(false);
  const [memberIdStatus, setMemberIdStatus] = useState<
    "available" | "taken" | "invalid" | null
  >(null);

  // Helper function to get status text
  const getStatusText = (statusValue: number): string => {
    return statusValue === 1 ? "Active" : "Locked";
  };

  const validateForm = (): boolean => {
    const newErrors: Partial<NewAccountInput> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Invalid email format";
    }

    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = "Phone number is required";
    } else if (!/^\+?\d{10,15}$/.test(formData.phoneNumber)) {
      newErrors.phoneNumber = "Invalid phone number (10-15 digits, optional +)";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password =
        "Password must contain uppercase, lowercase, and number";
    }

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    }

    if (!formData.dateOfBirth) {
      newErrors.dateOfBirth = "Date of birth is required";
    }

    if (!formData.roleId) {
      newErrors.roleId = "Role ID is required";
    }

    // Validate Member ID format (MEM format for members)
    if (formData.member.memberId && formData.member.memberId.trim()) {
      if (!/^MEM\d{6}$/i.test(formData.member.memberId)) {
        newErrors.member = {
          ...newErrors.member,
          memberId:
            "Member ID must start with 'MEM' followed by exactly 6 digits",
        };
      } else if (memberIdStatus === "taken") {
        newErrors.member = {
          ...newErrors.member,
          memberId: "This Member ID is already taken",
        };
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      notify.warning(
        MESSAGES?.ACCOUNT?.VALIDATION || "Please fix validation errors!"
      );
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateMemberId = async () => {
    setIsGeneratingMemberId(true);
    try {
      const token = authService.getToken();
      if (!token) throw new Error("No authentication token found");

      // Use generateMemberIdForMember for MEM ID generation
      const newMemberId = await generateMemberIdForMember(token);
      setFormData({
        ...formData,
        status: 1, // Reset status to Active (1)
        member: {
          memberId: newMemberId,
          score:
            typeof formData.member.score === "number"
              ? formData.member.score
              : 0,
        },
        registerDate: new Date().toISOString(), // Update registerDate
      });
      setMemberIdStatus("available");
      setErrors((prev) => ({ ...prev, member: undefined }));
      notify.success(`Generated Member ID: ${newMemberId}`);
    } catch (error) {
      console.error("Error generating Member ID:", error);
      notify.error("Failed to generate unique Member ID");
      setMemberIdStatus(null);
    } finally {
      setIsGeneratingMemberId(false);
    }
  };

  const checkMemberIdAvailability = async (memberId: string) => {
    if (!memberId.trim() || !/^MEM\d{6}$/i.test(memberId)) {
      setMemberIdStatus("invalid");
      return;
    }

    setIsCheckingMemberId(true);
    try {
      const token = authService.getToken();
      if (!token) throw new Error("No authentication token found");
      const exists = await checkMemberIdExists(memberId, token);
      setMemberIdStatus(exists ? "taken" : "available");
    } catch (error) {
      console.error("Error checking member ID:", error);
      setMemberIdStatus(null);
      notify.error("Failed to check Member ID availability");
    } finally {
      setIsCheckingMemberId(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      const submissionData = {
        ...formData,
        member: {
          memberId: formData.member.memberId || undefined, // Convert empty string to undefined
          score: formData.member.score, // Always include score
        },
        registerDate: new Date().toISOString(), // Ensure registerDate is included
      };

      notify.dismiss();
      await onAddAccount(submissionData);

      // Reset form
      setFormData({
        username: "",
        email: "",
        password: "",
        fullName: "",
        phoneNumber: "",
        address: "",
        dateOfBirth: "",
        gender: "Male",
        image: "",
        roleId: "507f1f77bcf86cd799439028", // Member role ID chuẩn
        status: 1, // Reset to Active (1)
        member: {
          memberId: "",
          score: 0,
        },
        registerDate: new Date().toISOString(),
      });
      setErrors({});
      setMemberIdStatus(null);
      onClose();
    } catch (error) {
      console.error("Error adding member:", error);
      notify.dismiss();
      notify.error(MESSAGES?.ACCOUNT?.ERROR || "Failed to create account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting || isGeneratingMemberId) {
      notify.warning("Please wait for the current operation to complete");
      return;
    }
    onClose();
  };

  const handleInputChange = (
    field: keyof NewAccountInput | "memberId",
    value: string
  ) => {
    if (field === "memberId") {
      setFormData({
        ...formData,
        status: 1, // Reset status to Active (1)
        member: {
          ...formData.member,
          memberId: value.toUpperCase(),
          score:
            typeof formData.member.score === "number"
              ? formData.member.score
              : 0,
        },
        registerDate: new Date().toISOString(), // Update registerDate
      });
      setMemberIdStatus(null);
      setErrors((prev) => ({ ...prev, member: undefined }));
    } else {
      setFormData({
        ...formData,
        status: 1,
        [field]: value,
        registerDate: new Date().toISOString(),
      });
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleMemberIdBlur = () => {
    if (formData.member.memberId && formData.member.memberId.trim()) {
      checkMemberIdAvailability(formData.member.memberId);
    }
  };

  const getMemberIdStatusIcon = () => {
    if (isCheckingMemberId || isGeneratingMemberId) {
      return <RefreshCw className="w-4 h-4 animate-spin text-gray-500" />;
    }
    switch (memberIdStatus) {
      case "available":
        return <Check className="w-4 h-4 text-green-500" />;
      case "taken":
        return <X className="w-4 h-4 text-red-500" />;
      case "invalid":
        return <AlertCircle className="w-4 h-4 text-orange-500" />;
      default:
        return null;
    }
  };

  const getMemberIdStatusMessage = () => {
    switch (memberIdStatus) {
      case "available":
        return (
          <span className="text-green-600 text-xs">Member ID is available</span>
        );
      case "taken":
        return (
          <span className="text-red-600 text-xs">
            Member ID is already taken
          </span>
        );
      case "invalid":
        return (
          <span className="text-orange-600 text-xs">
            Invalid Member ID format
          </span>
        );
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">Add New Member</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Create new member account with MEM ID
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting || isGeneratingMemberId}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
                className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.fullName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter full name"
                disabled={isSubmitting || isGeneratingMemberId}
              />
              {errors.fullName && (
                <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Username *
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
                className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.username ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter username"
                disabled={isSubmitting || isGeneratingMemberId}
              />
              {errors.username && (
                <p className="text-red-500 text-xs mt-1">{errors.username}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Member ID (MEM Format)
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.member.memberId || ""}
                  onChange={(e) =>
                    handleInputChange("memberId", e.target.value)
                  }
                  onBlur={handleMemberIdBlur}
                  className={`w-full px-3 py-2 pr-10 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    errors.member?.memberId
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder="e.g., MEM123456 or click Generate ID"
                  disabled={isSubmitting || isGeneratingMemberId}
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  {getMemberIdStatusIcon()}
                </div>
              </div>
              <div className="flex justify-between items-center mt-1">
                <div>
                  {errors.member?.memberId && (
                    <p className="text-red-500 text-xs">
                      {errors.member.memberId}
                    </p>
                  )}
                  {!errors.member?.memberId && getMemberIdStatusMessage()}
                </div>
                <button
                  type="button"
                  onClick={handleGenerateMemberId}
                  className="text-xs text-blue-600 hover:text-blue-800 underline"
                  disabled={isSubmitting || isGeneratingMemberId}
                >
                  {isGeneratingMemberId ? "Generating..." : "Generate ID"}
                </button>
              </div>
              <p className="text-gray-500 text-xs mt-1">
                Format: MEM + 6 numeric characters (e.g., MEM123456)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.email ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter email address"
                disabled={isSubmitting || isGeneratingMemberId}
              />
              {errors.email && (
                <p className="text-red-500 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phoneNumber}
                onChange={(e) =>
                  handleInputChange("phoneNumber", e.target.value)
                }
                className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.phoneNumber ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter phone number (e.g., +84123456789)"
                disabled={isSubmitting || isGeneratingMemberId}
              />
              {errors.phoneNumber && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.phoneNumber}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Address *
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.address ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter address"
                disabled={isSubmitting || isGeneratingMemberId}
              />
              {errors.address && (
                <p className="text-red-500 text-xs mt-1">{errors.address}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Date of Birth *
              </label>
              <input
                type="date"
                value={formData.dateOfBirth}
                onChange={(e) =>
                  handleInputChange("dateOfBirth", e.target.value)
                }
                className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.dateOfBirth ? "border-red-500" : "border-gray-300"
                }`}
                max={new Date().toISOString().split("T")[0]}
                disabled={isSubmitting || isGeneratingMemberId}
              />
              {errors.dateOfBirth && (
                <p className="text-red-500 text-xs mt-1">
                  {errors.dateOfBirth}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Gender *
              </label>
              <select
                value={formData.gender}
                onChange={(e) => handleInputChange("gender", e.target.value)}
                className="w-full px-3 py-2 text-sm sm:text-base border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                disabled={isSubmitting || isGeneratingMemberId}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Password *
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.password ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Enter secure password"
                disabled={isSubmitting || isGeneratingMemberId}
              />
              {errors.password && (
                <p className="text-red-500 text-xs mt-1">{errors.password}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Must be 8+ characters with uppercase, lowercase, and number
              </p>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="flex items-center">
                <Check className="w-4 h-4 text-green-600 mr-2" />
                <div>
                  <p className="text-sm font-medium text-green-800">
                    Account Status
                  </p>
                  <p className="text-xs text-green-700">
                    New members are automatically created with{" "}
                    <strong>Active</strong> status and <strong>MEM</strong> ID
                    format
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                disabled={isSubmitting || isGeneratingMemberId}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting || isGeneratingMemberId}
                className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors ${
                  isSubmitting || isGeneratingMemberId
                    ? "opacity-70 cursor-not-allowed"
                    : ""
                }`}
              >
                {isSubmitting ? "Creating Active Member..." : "Create Member"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AddAccountModal;

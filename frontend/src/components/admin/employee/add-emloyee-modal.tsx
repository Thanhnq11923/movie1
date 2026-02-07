/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import type React from "react";
import { useState, useRef } from "react";
import type { NewEmployeeData } from "./employee-management";
import { notify, MESSAGES } from "./../../../lib/toast";
import { generateStaffIdForEmployee } from "../../../services/admin_api/memberService";
import { X, RefreshCw, Check } from "lucide-react";

interface AddEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddEmployee: (employee: NewEmployeeData) => void;
  token: string; // Added token prop for async ID generation
}

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({
  isOpen,
  onClose,
  onAddEmployee,
  token,
}) => {
  const [formData, setFormData] = useState<NewEmployeeData>({
    username: "",
    email: "",
    password: "",
    fullName: "",
    phoneNumber: "",
    address: "",
    dateOfBirth: "",
    gender: "Male",
    image: "",
    roleId: "684f84c7a2c60b9b2be5e315", // Employee role ID
    status: 1,
    member: { score: 0 },
  });
  const [errors, setErrors] = useState<Partial<NewEmployeeData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const [isCheckingStaffId] = useState(false);
  const [isGeneratingStaffId, setIsGeneratingStaffId] = useState(false);

  const validateForm = () => {
    const newErrors: Partial<NewEmployeeData> = {};
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

    // Kiểm tra bắt buộc phải có Staff ID
    if (!formData.member?.memberId || !formData.member.memberId.trim()) {
      newErrors.member = {
        ...(newErrors.member || {}),
        memberId:
          "Staff ID is required. Please generate or enter a valid Staff ID",
      } as any;
    } else if (!/^STA\d{6}$/i.test(formData.member.memberId)) {
      // Kiểm tra định dạng ID nhân viên nếu đã nhập
      newErrors.member = {
        ...(newErrors.member || {}),
        memberId: "Staff ID must start with 'STA' followed by exactly 6 digits",
      } as any;
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      notify.warning(
        (MESSAGES?.EMPLOYEE && (MESSAGES.EMPLOYEE as any).VALIDATION) ||
          "Please fix validation errors!"
      );
    }
    return Object.keys(newErrors).length === 0;
  };

  const handleGenerateMemberId = async () => {
    setIsGeneratingStaffId(true);
    try {
      const newStaffId = await generateStaffIdForEmployee(token);

      // Cập nhật ID trong state
      setFormData((prev) => ({
        ...prev,
        member: {
          ...prev.member,
          memberId: newStaffId,
        },
      }));

      setHasChanges(true);
      console.log("✅ Generated Staff ID:", newStaffId);
      notify.success(`Generated Staff ID: ${newStaffId}`);
    } catch (error) {
      notify.error("Failed to generate unique Staff ID");
      console.error("❌ Error generating Staff ID:", error);
    } finally {
      setIsGeneratingStaffId(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Kiểm tra đảm bảo có memberId trước khi validate form
    if (!formData.member?.memberId || !formData.member.memberId.trim()) {
      notify.error("Staff ID is required. Please generate or enter a Staff ID");
      return;
    }

    if (!validateForm()) return;
    setIsSubmitting(true);
    try {
      await onAddEmployee({
        ...formData,
        member: {
          ...formData.member,
          memberId: formData.member?.memberId.trim(), // Đảm bảo memberId không null
          score: formData.member?.score || 0,
        },
      });

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
        roleId: "684f84c7a2c60b9b2be5e315", // Employee role ID
        status: 1,
        member: { score: 0 },
      });
      setErrors({});
      setHasChanges(false);
      onClose();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      notify.error(MESSAGES?.EMPLOYEE?.ERROR || "Failed to create employee");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: keyof NewEmployeeData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setHasChanges(true);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleStaffIdChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      member: {
        ...prev.member,
        memberId: value.toUpperCase(),
      },
    }));
    setErrors((prev) => ({ ...prev, member: undefined }));
    setHasChanges(true);
  };

  const handleStaffIdBlur = () => {
    if (formData.member?.memberId && formData.member.memberId.trim()) {
      // Kiểm tra định dạng STA
      if (!/^STA\d{6}$/i.test(formData.member.memberId)) {
        setErrors((prev) => ({
          ...prev,
          member: {
            ...(prev.member || {}),
            memberId:
              "Staff ID must start with 'STA' followed by exactly 6 digits",
          } as any,
        }));
      } else {
        setErrors((prev) => ({
          ...prev,
          member: undefined,
        }));
        console.log("✅ Valid Staff ID format:", formData.member.memberId);
      }
    }
  };

  const getMemberIdStatusIcon = () => {
    if (isCheckingStaffId || isGeneratingStaffId) {
      return <RefreshCw className="w-4 h-4 animate-spin text-gray-500" />;
    }
    // Removed memberIdStatus logic
    return null;
  };

  const getMemberIdStatusMessage = () => {
    // Removed memberIdStatus logic
    return null;
  };

  const handleClose = () => {
    if (isSubmitting || isGeneratingStaffId) {
      notify.warning("Please wait for staff creation to complete");
      return;
    }
    if (hasChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to close?"
      );
      if (!confirmed) {
        notify.info("Continue adding the employee");
        return;
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        ref={modalRef}
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-auto max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">Add New Staff</h2>
            <p className="text-xs sm:text-sm text-gray-600 mt-1">
              Create new staff account with STA ID
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            disabled={isSubmitting || isGeneratingStaffId}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="space-y-3 sm:space-y-4 p-4 sm:p-6"
        >
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
              disabled={isSubmitting || isGeneratingStaffId}
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
              disabled={isSubmitting || isGeneratingStaffId}
            />
            {errors.username && (
              <p className="text-red-500 text-xs mt-1">{errors.username}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Staff ID (STA Format)
            </label>
            <div className="relative">
              <input
                type="text"
                value={formData.member?.memberId || ""}
                onChange={(e) => handleStaffIdChange(e.target.value)}
                onBlur={handleStaffIdBlur}
                className={`w-full px-3 py-2 pr-10 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                  errors.member?.memberId ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="e.g., STA123456 or click Generate ID"
                disabled={isSubmitting || isGeneratingStaffId}
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
                disabled={isSubmitting || isGeneratingStaffId}
              >
                {isGeneratingStaffId ? "Generating..." : "Generate ID"}
              </button>
            </div>
            <p className="text-gray-500 text-xs mt-1">
              Format: STA + 6 numeric characters (e.g., STA123456)
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
              disabled={isSubmitting || isGeneratingStaffId}
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
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.phoneNumber ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Enter phone number (e.g., +84123456789)"
              disabled={isSubmitting || isGeneratingStaffId}
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
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
              disabled={isSubmitting || isGeneratingStaffId}
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
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              className={`w-full px-3 py-2 text-sm sm:text-base border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.dateOfBirth ? "border-red-500" : "border-gray-300"
              }`}
              max={new Date().toISOString().split("T")[0]}
              disabled={isSubmitting || isGeneratingStaffId}
            />
            {errors.dateOfBirth && (
              <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>
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
              disabled={isSubmitting || isGeneratingStaffId}
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
              disabled={isSubmitting || isGeneratingStaffId}
            />
            {errors.password && (
              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Must be 8+ characters with uppercase, lowercase, and number
            </p>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-center">
              <Check className="w-4 h-4 text-blue-600 mr-2" />
              <div>
                <p className="text-sm font-medium text-blue-800">
                  Staff Account
                </p>
                <p className="text-xs text-blue-700">
                  New staff are automatically created with{" "}
                  <strong>Active</strong> status and <strong>STA</strong> ID
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
              disabled={isSubmitting || isGeneratingStaffId}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || isGeneratingStaffId}
              className={`px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors ${
                isSubmitting || isGeneratingStaffId
                  ? "opacity-70 cursor-not-allowed"
                  : ""
              }`}
            >
              {isSubmitting ? "Creating Staff..." : "Add Staff"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddEmployeeModal;

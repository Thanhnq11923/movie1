/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { notify, MESSAGES } from "../../../lib/toast";
import type { Account } from "../../../types/account";

interface EditAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEditAccount: (updatedAccount: Account) => void;
  account: Account | null;
}

// Helper function to format date for input type="date"
const formatDateForInput = (dateString: string | undefined | null): string => {
  if (!dateString) return "";

  // If already in YYYY-MM-DD format
  if (dateString.match(/^\d{4}-\d{2}-\d{2}$/)) {
    return dateString;
  }

  // Convert from DD/MM/YYYY to YYYY-MM-DD
  if (dateString.match(/^\d{2}\/\d{2}\/\d{4}$/)) {
    const [day, month, year] = dateString.split("/");
    return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
  }

  // Convert from MM/DD/YYYY to YYYY-MM-DD
  if (dateString.match(/^\d{1,2}\/\d{1,2}\/\d{4}$/)) {
    try {
      const date = new Date(dateString);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split("T")[0];
      }
    } catch (e) {
      console.error("Error parsing date:", dateString);
    }
  }

  // Try to parse with Date constructor
  try {
    const date = new Date(dateString);
    if (!isNaN(date.getTime())) {
      return date.toISOString().split("T")[0];
    }
  } catch (e) {
    console.error("Error parsing date:", dateString);
  }

  return "";
};

const EditAccountModal: React.FC<EditAccountModalProps> = ({
  isOpen,
  onClose,
  onEditAccount,
  account,
}) => {
  const [formData, setFormData] = useState<Account>({
    id: "",
    memberId: "",
    fullName: "",
    email: "",
    status: "Active",
    phoneNumber: "",
    address: "",
    username: "",
    dateOfBirth: "",
    gender: "",
    role: "Customer",
    roleId: "",
  });
  const [errors, setErrors] = useState<Partial<Account>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (account) {
      console.log("Original account dateOfBirth:", account.dateOfBirth);
      const formattedDate = formatDateForInput(account.dateOfBirth);
      console.log("Formatted dateOfBirth:", formattedDate);

      setFormData({
        ...account,
        dateOfBirth: formattedDate,
        gender: account.gender || "Male",
        username: account.username || "",
        roleId: account.roleId || "",
      });
      setHasChanges(false);
    }
  }, [account]);

  useEffect(() => {
    if (account) {
      const originalFormattedDate = formatDateForInput(account.dateOfBirth);
      const hasChanges =
        formData.fullName !== account.fullName ||
        formData.email !== account.email ||
        formData.status !== account.status ||
        formData.phoneNumber !== account.phoneNumber ||
        formData.address !== account.address ||
        formData.dateOfBirth !== originalFormattedDate ||
        formData.gender !== (account.gender || "Male");
      setHasChanges(hasChanges);
    }
  }, [formData, account]);

  const validateForm = () => {
    const newErrors: Partial<Account> = {};

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

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (
      formData.dateOfBirth &&
      !/^\d{4}-\d{2}-\d{2}$/.test(formData.dateOfBirth)
    ) {
      newErrors.dateOfBirth = "Invalid date format";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      notify.warning(
        MESSAGES?.ACCOUNT?.VALIDATION || "Please fix validation errors!"
      );
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm() || !account) return;

    setIsSubmitting(true);

    try {
      notify.dismiss();
      await onEditAccount(formData);
      setErrors({});
      setHasChanges(false);
    } catch (error) {
      console.error("Error updating member:", error);
      notify.dismiss();
      notify.error(MESSAGES?.ACCOUNT?.ERROR || "Failed to update account");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    if (isSubmitting) {
      notify.warning("Please wait for the current operation to complete");
      return;
    }

    if (hasChanges) {
      const confirmed = window.confirm(
        "You have unsaved changes. Are you sure you want to close?"
      );
      if (!confirmed) {
        notify.info("Continue editing the member");
        return;
      }
    }

    onClose();
  };

  const handleStatusChange = (newStatus: "Active" | "Locked") => {
    const previousStatus = formData.status;
    setFormData({ ...formData, status: newStatus });

    if (newStatus !== previousStatus) {
      if (newStatus === "Locked") {
        notify.warning("Member will be locked");
      } else {
        notify.info("Member will be activated");
      }
    }
  };

  const handleInputChange = (field: keyof Account, value: string) => {
    setFormData({ ...formData, [field]: value });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (!isOpen || !account) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
      onClick={handleClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 sm:mx-0 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between p-4 sm:p-6 border-b sticky top-0 bg-white z-10">
          <div>
            <h2 className="text-lg sm:text-xl font-semibold">Edit Member</h2>
            <p className="text-sm text-gray-600 mt-1">
              Modify member details for {account.fullName}
            </p>
          </div>
          <button
            onClick={handleClose}
            className="text-gray-600 hover:text-gray-800 transition-colors"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-4">
          {hasChanges && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="text-yellow-700 text-sm">
                💾 You have unsaved changes. Make sure to save before closing.
              </div>
            </div>
          )}

          <div>
            <label className="block mb-1 text-sm font-medium">Member ID</label>
            <input
              type="text"
              value={formData.memberId}
              className="w-full border px-3 py-2 text-sm rounded bg-gray-100 cursor-not-allowed"
              disabled
            />
            <p className="text-gray-500 text-xs mt-1">
              Member ID is system-generated and cannot be changed
            </p>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Username</label>
            <input
              type="text"
              value={formData.username || ""}
              className="w-full border px-3 py-2 text-sm rounded bg-gray-100 cursor-not-allowed"
              disabled
            />
            <p className="text-gray-500 text-xs mt-1">
              Username cannot be changed
            </p>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              className={`w-full border px-3 py-2 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.fullName ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isSubmitting}
              placeholder="Enter full name"
            />
            {errors.fullName && (
              <p className="text-red-500 text-sm mt-1">{errors.fullName}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Email *</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              className={`w-full border px-3 py-2 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.email ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isSubmitting}
              placeholder="Enter email address"
            />
            {errors.email && (
              <p className="text-red-500 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Phone Number *
            </label>
            <input
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => handleInputChange("phoneNumber", e.target.value)}
              className={`w-full border px-3 py-2 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.phoneNumber ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isSubmitting}
              placeholder="Enter phone number (e.g., +84123456789)"
            />
            {errors.phoneNumber && (
              <p className="text-red-500 text-sm mt-1">{errors.phoneNumber}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Address *</label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => handleInputChange("address", e.target.value)}
              className={`w-full border px-3 py-2 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.address ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isSubmitting}
              placeholder="Enter address"
            />
            {errors.address && (
              <p className="text-red-500 text-sm mt-1">{errors.address}</p>
            )}
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Date of Birth
            </label>
            <input
              type="date"
              value={formData.dateOfBirth || ""}
              onChange={(e) => handleInputChange("dateOfBirth", e.target.value)}
              className={`w-full border px-3 py-2 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.dateOfBirth ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isSubmitting}
              max={new Date().toISOString().split("T")[0]} // Prevent future dates
            />
            {errors.dateOfBirth && (
              <p className="text-red-500 text-sm mt-1">{errors.dateOfBirth}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Current value: {formData.dateOfBirth || "Not set"}
            </p>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Gender</label>
            <select
              value={formData.gender || "Male"}
              onChange={(e) => handleInputChange("gender", e.target.value)}
              className="w-full border border-gray-300 px-3 py-2 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              disabled={isSubmitting}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">Status *</label>
            <div className="flex space-x-4 flex-wrap">
              {["Active", "Locked"].map((status) => (
                <label key={status} className="flex items-center mb-2">
                  <input
                    type="radio"
                    value={status}
                    checked={formData.status === status}
                    onChange={() =>
                      handleStatusChange(status as "Active" | "Locked")
                    }
                    className="mr-2 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <span className="text-sm">{status}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="px-3 py-2 border rounded text-sm hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className="px-3 py-2 bg-black text-white rounded text-sm hover:bg-gray-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !hasChanges}
            >
              {isSubmitting ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EditAccountModal;
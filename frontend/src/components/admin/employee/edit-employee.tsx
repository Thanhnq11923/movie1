/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { notify, MESSAGES } from "./../../../lib/toast";
import type { EmployeeData, NewEmployeeData } from "./employee-management";

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

interface EditEmployeeProps {
  isOpen: boolean;
  onClose: () => void;
  employee: EmployeeData | null;
  onUpdateEmployee: (updatedEmployee: NewEmployeeData) => Promise<void>;
}

const EditEmployee: React.FC<EditEmployeeProps> = ({
  isOpen,
  onClose,
  employee,
  onUpdateEmployee,
}) => {
  const [formData, setFormData] = useState<NewEmployeeData>({
    fullName: "",
    email: "",
    phoneNumber: "",
    address: "",
    dateOfBirth: "",
    gender: "Male",
    status: 1,
    password: "",
    username: "",
    image: "",
    roleId: "",
    member: { score: 0 },
  });
  const [errors, setErrors] = useState<Partial<NewEmployeeData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (employee) {
      console.log("Original employee:", employee);
      console.log("Original employee STAID:", employee.member?.memberId);
      console.log("Original employee dateOfBirth:", employee.dateOfBirth);

      const formattedDate = formatDateForInput(employee.dateOfBirth);
      console.log("Formatted dateOfBirth:", formattedDate);

      setFormData({
        fullName: employee.fullName || "",
        email: employee.email || "",
        phoneNumber: employee.phoneNumber || "",
        address: employee.address || "",
        dateOfBirth: formattedDate,
        gender: employee.gender || "Male",
        status: employee.status,
        password: "",
        username: employee.username || "",
        image: employee.image || "",
        roleId: employee.roleId || "",
        member: employee.member || { score: 0 },
      });
      setHasChanges(false);
    }
  }, [employee]);

  useEffect(() => {
    if (employee) {
      const originalFormattedDate = formatDateForInput(employee.dateOfBirth);
      const hasChanges =
        formData.fullName !== (employee.fullName || "") ||
        formData.email !== (employee.email || "") ||
        formData.phoneNumber !== (employee.phoneNumber || "") ||
        formData.address !== (employee.address || "") ||
        formData.dateOfBirth !== originalFormattedDate ||
        formData.gender !== (employee.gender || "Male") ||
        formData.status !== employee.status ||
        Boolean(formData.password && formData.password.trim() !== "");
      setHasChanges(hasChanges);
    }
  }, [formData, employee]);

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

    if (!formData.address.trim()) {
      newErrors.address = "Address is required";
    }

    if (
      formData.dateOfBirth &&
      !/^\d{4}-\d{2}-\d{2}$/.test(formData.dateOfBirth)
    ) {
      newErrors.dateOfBirth = "Invalid date format";
    }

    // Validate password if provided
    if (formData.password && formData.password.length < 6) {
      newErrors.password = "Password must be at least 6 characters long";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      notify.warning("Please fix validation errors!");
    }

    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    const employeeId = employee?.id || employee?._id;
    if (!validateForm() || !employee || !employeeId) return;

    setIsSubmitting(true);

    try {
      notify.dismiss();

      // Separate password change from other updates
      const { password, ...updateData } = formData;

      // Include the original member data to preserve STAID
      const finalUpdateData = {
        ...updateData,
        id: employeeId,
        member: {
          ...employee.member, // Preserve existing member data including memberId (STAID)
          score: updateData.member?.score || employee.member?.score || 0,
        },
      };

      console.log("Submitting updated data:", finalUpdateData);

      // Update user data (excluding password)
      await onUpdateEmployee(finalUpdateData);

 

      setErrors({});
      setHasChanges(false);
    } catch (error: any) {
      console.error("Error updating employee:", error);
      notify.dismiss();
      if (error?.status === 403 || error?.message?.includes("permission")) {
        notify.error("You do not have permission to update this employee.");
      } else {
        notify.error(MESSAGES?.EMPLOYEE?.ERROR || "Failed to update employee");
      }
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
        notify.info("Continue editing the employee");
        return;
      }
    }

    onClose();
  };

  const handleStatusChange = (newStatus: number) => {
    const previousStatus = formData.status;
    setFormData({ ...formData, status: newStatus });

    if (newStatus !== previousStatus) {
      if (newStatus === 0) {
        notify.warning("Employee will be locked");
      } else {
        notify.info("Employee will be activated");
      }
    }
  };

  const handleInputChange = (field: keyof NewEmployeeData, value: string) => {
    setFormData({ ...formData, [field]: value });

    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  // Get STAID from employee data
  const getSTAID = (employee: EmployeeData | null): string => {
    if (!employee) return "";

    // Check multiple possible locations for STAID
    const staid =
      employee.member?.memberId ||
      (employee as any).STAID ||
      (employee as any).staid ||
      "";

    console.log("Getting STAID:", staid, "from employee:", employee);
    return staid;
  };

  if (!isOpen || !employee) return null;

  const currentSTAID = getSTAID(employee);

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
            <h2 className="text-lg sm:text-xl font-semibold">Edit Employee</h2>
            <p className="text-sm text-gray-600 mt-1">
              Modify employee details for {employee.fullName}
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
            <label className="block mb-1 text-sm font-medium">STAFF ID</label>
            <input
              type="text"
              value={currentSTAID || "Not assigned"}
              className="w-full border px-3 py-2 text-sm rounded bg-gray-100 cursor-not-allowed"
              disabled
              placeholder="STAID will be generated automatically"
            />
            <p className="text-gray-500 text-xs mt-1">
              STAFF ID cannot be changed
            </p>
            {!currentSTAID && (
              <p className="text-orange-500 text-xs mt-1">
                ⚠️ STAID not found. This may indicate a data issue.
              </p>
            )}
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
              max={new Date().toISOString().split("T")[0]}
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
              {[
                { value: 1, label: "Active" },
                { value: 0, label: "Locked" },
              ].map((status) => (
                <label key={status.value} className="flex items-center mb-2">
                  <input
                    type="radio"
                    value={status.value}
                    checked={formData.status === status.value}
                    onChange={() => handleStatusChange(status.value)}
                    className="mr-2 rounded-full border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={isSubmitting}
                  />
                  <span className="text-sm">{status.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              New Password
            </label>
            <input
              type="password"
              value={formData.password || ""}
              onChange={(e) => handleInputChange("password", e.target.value)}
              className={`w-full border px-3 py-2 text-sm rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                errors.password ? "border-red-500" : "border-gray-300"
              }`}
              disabled={isSubmitting}
              placeholder="Enter new password (leave blank to keep current)"
            />
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
            <p className="text-gray-500 text-xs mt-1">
              Leave blank if you do not want to change the password. Minimum 6
              characters.
            </p>
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

export default EditEmployee;

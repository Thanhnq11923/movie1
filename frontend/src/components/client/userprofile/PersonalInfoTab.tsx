import { useState } from "react";
import type { ChangeEvent, FC, ReactNode } from "react";
import type { UserAccount } from "../../../types/account";
import { format } from "date-fns";
import { User, Calendar, Mail, Phone, Lock } from "lucide-react";
import { authService } from "../../../services/api/authService";
import { AxiosError } from "axios";

interface PersonalInfoTabProps {
  user: UserAccount;
}

// Editable input field for edit mode
interface InputFieldProps {
  label: string;
  icon: ReactNode;
  value: string;
  onChange?: (e: ChangeEvent<HTMLInputElement>) => void;
  name?: string;
  type?: string;
  disabled?: boolean;
  actionText?: string;
  onActionClick?: () => void;
}

const InputField: FC<InputFieldProps> = ({
  label,
  icon,
  value,
  onChange,
  name,
  type = "text",
  disabled = false,
  actionText,
  onActionClick,
}) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label}
    </label>
    <div className="relative">
      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        {icon}
      </span>
      <input
        type={type}
        value={value}
        onChange={onChange}
        name={name}
        disabled={disabled}
        className={`w-full pl-10 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-orange-500 focus:border-orange-500 sm:text-sm bg-white disabled:bg-gray-100 disabled:text-gray-500 ${
          actionText ? "pr-24" : "pr-3"
        }`}
      />
      {actionText && (
        <button
          type="button"
          onClick={onActionClick}
          disabled={disabled}
          className="absolute inset-y-0 right-0 flex items-center px-4 text-sm font-medium text-orange-500 hover:text-orange-600 disabled:text-gray-400 disabled:cursor-not-allowed"
        >
          {actionText}
        </button>
      )}
    </div>
  </div>
);

export const PersonalInfoTab: FC<PersonalInfoTabProps> = ({ user }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user.fullName,
    dateOfBirth: user.dateOfBirth
      ? format(new Date(user.dateOfBirth), "yyyy-MM-dd")
      : "",
    email: user.email,
    phoneNumber: user.phoneNumber,
    gender: user.gender,
    password: "••••••••",
  });
  const [originalFormData] = useState(formData);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCancel = () => {
    setFormData(originalFormData);
    setIsEditing(false);
  };

  const handleUpdate = async () => {
    setMessage("");
    setError("");
    try {
      const updateData = {
        fullName: formData.fullName,
        dateOfBirth: formData.dateOfBirth,
        phoneNumber: formData.phoneNumber,
        gender: formData.gender,
      };
      const res = await authService.updateProfile(updateData);
      if (res && res.success) {
        setMessage("Cập nhật thành công!");
        setIsEditing(false);
      } else {
        setError("Cập nhật thất bại.");
      }
    } catch (err) {
      const error = err as AxiosError;
      let msg = "Lỗi khi cập nhật thông tin.";
      const data = error.response?.data;
      if (
        data &&
        typeof data === "object" &&
        "message" in data &&
        typeof (data as { message?: unknown }).message === "string"
      ) {
        msg = (data as { message: string }).message;
      }
      setError(msg);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4">
      {message && <div className="text-green-600 mb-2">{message}</div>}
      {error && <div className="text-red-600 mb-2">{error}</div>}
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-end">
          <InputField
            label="Full Name"
            icon={<User size={16} className="text-gray-400" />}
            value={formData.fullName}
            onChange={handleInputChange}
            name="fullName"
            disabled={!isEditing}
          />
          <InputField
            label="Date of Birth"
            icon={<Calendar size={16} className="text-gray-400" />}
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            name="dateOfBirth"
            type="date"
            disabled={!isEditing}
          />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <InputField
              label="Email"
              icon={<Mail size={16} className="text-gray-400" />}
              value={formData.email}
              disabled
              actionText="Change"
              onActionClick={() =>
                alert("Change email functionality needs to be implemented.")
              }
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gender
              </label>
              <div className="flex items-center space-x-6">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="Male"
                    checked={formData.gender === "Male"}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="form-radio h-4 w-4 text-orange-500 border-gray-300 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <span className="ml-2 text-sm text-gray-700">Male</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="gender"
                    value="Female"
                    checked={formData.gender === "Female"}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="form-radio h-4 w-4 text-orange-500 border-gray-300 focus:ring-orange-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
                  />
                  <span className="ml-2 text-sm text-gray-700">Female</span>
                </label>
              </div>
            </div>
          </div>
          <div className="space-y-6">
            <InputField
              label="Phone Number"
              icon={<Phone size={16} className="text-gray-400" />}
              value={formData.phoneNumber}
              onChange={handleInputChange}
              name="phoneNumber"
              disabled={!isEditing}
            />
            <InputField
              label="Password"
              icon={<Lock size={16} className="text-gray-400" />}
              value={formData.password}
              disabled
              type="password"
              actionText="Change"
              onActionClick={() =>
                alert("Change password functionality needs to be implemented.")
              }
            />
          </div>
        </div>

        <div className="flex justify-end pt-4 gap-4">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-10 py-2.5 bg-orange-400 text-white rounded-md text-sm font-medium hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="px-10 py-2.5 bg-gray-200 text-gray-800 rounded-md text-sm font-medium hover:bg-gray-300 focus:outline-none"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdate}
                className="px-10 py-2.5 bg-orange-400 text-white rounded-md text-sm font-medium hover:bg-orange-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                Update
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import axios from "axios";
import type { NewAccountInput, UpdateAccountInput } from "../../types/account";

const BASE_URL = "http://localhost:3000/api/users";

interface ApiNewAccountInput {
  fullName: string;
  email: string;
  phoneNumber: string;
  password: string;
  status: number;
  address: string;
  username: string;
  dateOfBirth: string;
  gender: string;
  image?: string;
  roleId?: string;
  memberId?: string;
}

interface ApiUpdateAccountInput {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  status?: number;
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  memberId?: string;
}

interface ApiResponse<T> {
  data: {
    success: boolean;
    message?: string;
    data?: T;
  };
}

interface ApiMember {
  member: {
    memberId: string;
    score: number;
  };
  otpVerified: boolean;
  _id: string;
  username: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  image: string;
  roleId: string;
  status: number;
  otpEnabled: boolean;
  registerDate: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
  egifts: any[];
}

const handleApiError = (error: any) => {
  console.error("API Error:", error);

  if (error.response) {
    const message =
      error.response.data?.message ||
      error.response.data?.error ||
      `Server error: ${error.response.status}`;
    throw new Error(message);
  } else if (error.request) {
    throw new Error("No response from server. Please check your connection.");
  } else {
    throw new Error(error.message || "An unexpected error occurred");
  }
};

const mapNewAccountInputToApi = (
  input: NewAccountInput
): ApiNewAccountInput => {
  console.log("🔄 Mapping NewAccountInput to API format:", input);

  let statusValue: number;
  if (typeof input.status === "string") {
    statusValue = input.status === "Active" ? 1 : 0;
  } else {
    statusValue = input.status;
  }

  const apiData: ApiNewAccountInput = {
    fullName: input.fullName?.trim() || "",
    email: input.email?.trim() || "",
    password: input.password || "",
    phoneNumber: input.phoneNumber?.trim() || "",
    address: input.address?.trim() || "",
    username: input.username?.trim() || "",
    dateOfBirth: input.dateOfBirth || "",
    gender: input.gender || "Male",
    image: input.image?.trim() || "",
    status: statusValue,
    roleId: mapRoleToRoleId(input.role || "Customer"),
    memberId: input.memberId?.trim() || undefined,
  };

  console.log("✅ Mapped API data:", JSON.stringify(apiData, null, 2));
  console.log(
    "📊 Status mapping:",
    `"${input.status}" -> ${apiData.status} (${apiData.status === 1 ? "Active" : "Locked"
    })`
  );

  return apiData;
};

const mapUpdateAccountInputToApi = (
  input: UpdateAccountInput
): ApiUpdateAccountInput => {
  console.log("🔄 Mapping UpdateAccountInput to API format:", input);

  let statusValue: number | undefined;
  if (input.status !== undefined) {
    if (typeof input.status === "string") {
      statusValue = input.status === "Active" ? 1 : 0;
    } else {
      statusValue = input.status;
    }
  }

  const apiData: ApiUpdateAccountInput = {
    fullName: input.fullName,
    email: input.email,
    phoneNumber: input.phoneNumber,
    address: input.address,
    dateOfBirth: input.dateOfBirth,
    gender: input.gender,
    status: statusValue,
    memberId: input.memberId,
  };

  console.log("✅ Mapped update API data:", JSON.stringify(apiData, null, 2));
  return apiData;
};

const mapRoleToRoleId = (role: string): string => {
  switch (role) {
    case "Admin":
      return "6864af6bdd24a9f129d73d93";
    case "Employee":
      return "684f84c7a2c60b9b2be5e315";
    case "Customer":
      return "507f1f77bcf86cd799439028";
    default:
      return "507f1f77bcf86cd799439028";
  }
};

const getAuthConfig = (token: string) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

export const getAllMembers = async (
  token: string
): Promise<ApiResponse<ApiMember[]>> => {
  try {
    console.log("Fetching all members...");
    const response = await axios.get(
      "http://localhost:3000/api/users",
      getAuthConfig(token)
    );
    console.log("Members fetched successfully:", response.data.data);
    return response;
  } catch (error) {
    console.error("Error fetching members:", error);
    handleApiError(error);
    throw error;
  }
};

export const addAccount = async (
  data: NewAccountInput | ApiNewAccountInput,
  token: string
): Promise<ApiResponse<ApiMember>> => {
  try {
    console.log("🚀 Adding new account...");
    console.log("📥 Input data:", JSON.stringify(data, null, 2));

    const apiData = "role" in data ? mapNewAccountInputToApi(data) : data;

    console.log(
      "📤 Final API data being sent:",
      JSON.stringify(apiData, null, 2)
    );

    if (apiData.status !== 1 && apiData.status !== 0) {
      console.error("❌ INVALID STATUS VALUE:", apiData.status);
      throw new Error(
        `Invalid status value: ${apiData.status}. Must be 1 (Active) or 0 (Locked)`
      );
    }

    console.log("🔍 Status validation:", {
      statusValue: apiData.status,
      statusType: typeof apiData.status,
      meaning: apiData.status === 1 ? "Active" : "Locked",
    });

    const response = await axios.post(`${BASE_URL}`, apiData, {
      ...getAuthConfig(token),
      timeout: 10000,
      validateStatus: function (status) {
        return status < 500;
      },
    });

    console.log("📨 Response received:");
    console.log("Status:", response.status);
    console.log("Data:", JSON.stringify(response.data, null, 2));

    if (response.status >= 400) {
      const errorMessage =
        response.data?.message ||
        response.data?.error ||
        `Server returned ${response.status}`;
      throw new Error(errorMessage);
    }

    console.log("✅ Account added successfully!");
    return response;
  } catch (error: any) {
    console.error("❌ Error in addAccount:");

    if (axios.isAxiosError(error)) {
      console.error("🌐 Axios Error Details:");
      console.error("- Message:", error.message);
      console.error("- Status:", error.response?.status);
      console.error("- Response Data:", error.response?.data);

      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else {
        throw new Error(`Server error: ${error.response?.status || "Unknown"}`);
      }
    } else {
      throw new Error(error.message || "An unexpected error occurred");
    }
  }
};

export const updateAccount = async (
  id: string,
  data: UpdateAccountInput | ApiUpdateAccountInput,
  token: string
): Promise<ApiResponse<ApiMember>> => {
  try {
    console.log(`🔄 Updating account ${id}...`, data);
    const apiData =
      "status" in data && typeof data.status === "string"
        ? mapUpdateAccountInputToApi(data)
        : data;

    console.log("📤 Sending update API data:", apiData);

    const response = await axios.put(
      `${BASE_URL}/${id}`,
      apiData,
      getAuthConfig(token)
    );
    console.log("✅ Account updated successfully:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error updating account:", error);
    handleApiError(error);
    throw error;
  }
};

export const deleteAccount = async (
  id: string,
  token: string
): Promise<ApiResponse<null>> => {
  try {
    console.log(`🗑️ Deleting account with id: ${id}`);
    const response = await axios.delete(
      `${BASE_URL}/${id}`,
      getAuthConfig(token)
    );
    console.log("✅ Account deleted successfully");
    return response;
  } catch (error) {
    console.error("❌ Error deleting account:", error);
    handleApiError(error);
    throw error;
  }
};

export const updateAccountStatus = async (
  username: string,
  status: "Active" | "Locked",
  token: string
): Promise<ApiResponse<null>> => {
  try {
    console.log(`🔄 Updating account status for ${username} to ${status}`);
    const statusValue = status === "Active" ? 1 : 0;

    const response = await axios.put(
      `${BASE_URL}/${username}`,
      { status: statusValue },
      getAuthConfig(token)
    );
    console.log("✅ Account status updated successfully");
    return response;
  } catch (error) {
    console.error("❌ Error updating account status:", error);
    handleApiError(error);
    throw error;
  }
};

export const getMemberById = async (
  id: string,
  token: string
): Promise<ApiResponse<ApiMember>> => {
  try {
    console.log(`🔍 Fetching member by ID: ${id}`);
    const response = await axios.get(`${BASE_URL}/${id}`, getAuthConfig(token));
    console.log("✅ Member fetched successfully by ID");
    return response;
  } catch (error) {
    console.error("❌ Error fetching member by ID:", error);
    handleApiError(error);
    throw error;
  }
};

export const getMemberByUsername = async (
  username: string,
  token: string
): Promise<ApiResponse<ApiMember>> => {
  try {
    console.log(`🔍 Fetching member by username: ${username}`);
    const response = await axios.get(
      `${BASE_URL}/username/${username}`,
      getAuthConfig(token)
    );
    console.log("✅ Member fetched successfully by username");
    return response;
  } catch (error) {
    console.error("❌ Error fetching member by username:", error);
    handleApiError(error);
    throw error;
  }
};

export const searchMembers = async (
  query: string,
  token: string
): Promise<ApiResponse<ApiMember[]>> => {
  try {
    console.log(`🔍 Searching members with query: ${query}`);
    const response = await axios.get(
      `${BASE_URL}/search?q=${encodeURIComponent(query)}`,
      getAuthConfig(token)
    );
    console.log("✅ Members search completed successfully");
    return response;
  } catch (error) {
    console.error("❌ Error searching members:", error);
    handleApiError(error);
    throw error;
  }
};

export const getMembersByStatus = async (
  status: number,
  token: string
): Promise<ApiResponse<ApiMember[]>> => {
  try {
    console.log(
      `🔍 Fetching members with status: ${status} (${status === 1 ? "Active" : "Locked"
      })`
    );
    const response = await axios.get(
      `${BASE_URL}/status/${status}`,
      getAuthConfig(token)
    );
    console.log("✅ Members fetched successfully by status");
    return response;
  } catch (error) {
    console.error("❌ Error fetching members by status:", error);
    handleApiError(error);
    throw error;
  }
};

export const bulkUpdateMembersStatus = async (
  memberIds: string[],
  status: number,
  token: string
): Promise<ApiResponse<null>> => {
  try {
    console.log(
      `🔄 Bulk updating ${memberIds.length} members to status: ${status} (${status === 1 ? "Active" : "Locked"
      })`
    );
    const response = await axios.put(
      `${BASE_URL}/bulk-status`,
      { memberIds, status },
      getAuthConfig(token)
    );
    console.log("✅ Bulk status update completed successfully");
    return response;
  } catch (error) {
    console.error("❌ Error bulk updating members status:", error);
    handleApiError(error);
    throw error;
  }
};

// Function để cập nhật điểm thành viên
export const updateMemberPoints = async (
  memberId: string,
  points: number,
  operation: "add" | "deduct",
  token: string
): Promise<ApiResponse<ApiMember>> => {
  try {
    console.log(`🔄 Updating points for member ${memberId}: ${operation === "add" ? "+" : "-"}${points} points`);

    // Lấy thông tin member hiện tại
    const member = await getMemberById(memberId, token);
    const currentMember = member.data.data;

    if (!currentMember || !currentMember.member) {
      throw new Error("Member not found or member data is missing");
    }

    // Tính toán điểm mới
    const currentPoints = currentMember.member.score || 0;
    const newPoints = operation === "add"
      ? currentPoints + points
      : Math.max(0, currentPoints - points);

    // Chuẩn bị dữ liệu cập nhật
    const updateData = {
      member: {
        ...currentMember.member,
        score: newPoints
      }
    };

    console.log("📤 Sending points update data:", updateData);

    // Gọi API cập nhật
    const response = await axios.put(
      `${BASE_URL}/${memberId}`,
      updateData,
      getAuthConfig(token)
    );

    console.log("✅ Member points updated successfully:", response.data);
    return response;
  } catch (error) {
    console.error("❌ Error updating member points:", error);
    handleApiError(error);
    throw error;
  }
};

// Generate Staff ID for Employee (STA format)
export const generateStaffId = (): string => {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `STA${randomDigits}`;
};

export const generateStaffIdForEmployee = async (
  token: string
): Promise<string> => {
  const newId = generateStaffId();
  console.log("✅ Generated Staff ID:", newId);
  return newId;
};

// Generate Member ID for Customer/Member (MEM format)
export const generateMemberId = (): string => {
  const randomDigits = Math.floor(100000 + Math.random() * 900000);
  return `MEM${randomDigits}`;
};

export const generateMemberIdForCustomer = async (
  token: string
): Promise<string> => {
  const newId = generateMemberId();
  console.log("✅ Generated Member ID for Customer:", newId);
  return newId;
};

export const generateMemberIdForMember = async (
  token: string
): Promise<string> => {
  const newId = generateMemberId();
  console.log("✅ Generated Member ID for Member:", newId);
  return newId;
};

export const checkMemberIdExists = async (
  memberId: string,
  token: string
): Promise<boolean> => {
  try {
    console.log("🔍 Checking if Member ID exists:", memberId);
    const response = await searchMembers(memberId, token);
    const members = response.data.data || [];
    const exists = members.some(
      (member) => member.member.memberId === memberId
    );
    console.log(`✅ Member ID ${memberId} exists:`, exists);
    return exists;
  } catch (error) {
    console.error("❌ Error checking member ID:", error);
    return false;
  }
};

export const validateAccountData = (
  data: NewAccountInput
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (!data.fullName?.trim()) errors.push("Full name is required");
  if (!data.email?.trim()) errors.push("Email is required");
  if (!data.phoneNumber?.trim()) errors.push("Phone number is required");
  if (!data.password?.trim()) errors.push("Password is required");
  if (!data.address?.trim()) errors.push("Address is required");
  if (!data.username?.trim()) errors.push("Username is required");
  if (!data.dateOfBirth) errors.push("Date of birth is required");
  if (!data.gender?.trim()) errors.push("Gender is required");

  if (data.memberId && data.memberId.trim()) {
    if (data.role === "Employee") {
      if (!/^STA\d{6}$/i.test(data.memberId)) {
        errors.push(
          "Staff ID must start with 'STA' followed by exactly 6 digits"
        );
      }
    } else if (data.role === "Customer") {
      if (!/^MEM\d{6}$/i.test(data.memberId)) {
        errors.push(
          "Customer ID must start with 'MEM' followed by exactly 6 digits"
        );
      }
    } else {
      if (!/^(MEM|STA)\d{6}$/i.test(data.memberId)) {
        errors.push(
          "Member ID must start with 'MEM' or 'STA' followed by exactly 6 digits"
        );
      }
    }
  }

  if (data.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.push("Invalid email format");
  }

  if (data.phoneNumber && !/^\+?\d{10,15}$/.test(data.phoneNumber)) {
    errors.push("Invalid phone number format");
  }

  if (data.password && data.password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  console.log("🔍 Validation result:", {
    isValid: errors.length === 0,
    errors,
  });

  return {
    isValid: errors.length === 0,
    errors,
  };
};

export type {
  NewAccountInput,
  UpdateAccountInput,
  ApiMember,
  ApiResponse,
  ApiNewAccountInput,
  ApiUpdateAccountInput,
};

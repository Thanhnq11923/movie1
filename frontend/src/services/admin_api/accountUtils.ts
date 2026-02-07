import type {
  Account,
  UserAccount,
  NewAccountInput,
  Role,
} from "../../types/account";

// Mapping functions between API and UI data structures

/**
 * Map API user account data to Account interface for UI
 */
export const mapUserAccountToAccount = (user: UserAccount): Account => ({
  id: user._id,
  memberId: user.member?.memberId || "",
  fullName: user.fullName,
  email: user.email,
  phoneNumber: user.phoneNumber,
  address: user.address,
  role: "Customer" as Role, // Default role, map based on roleId if needed
  status: user.status === 1 ? "Active" : "Locked",
  dateOfBirth: user.dateOfBirth,
  gender: user.gender,
  image: user.image,
  registerDate: user.registerDate,
  member: user.member,
  username: user.username,
  _id: user._id,
});

export const mapNewAccountToApi = (input: NewAccountInput) => ({
  fullName: input.fullName,
  email: input.email,
  password: input.password,
  phoneNumber: input.phoneNumber,
  address: input.address,
  dateOfBirth: input.dateOfBirth,
  gender: input.gender,
  image: input.image || "",
  username: input.username,
  roleId: mapRoleToRoleId(input.role || "Customer"),
  status: input.status === "Active" ? 1 : 0,
});

/**
 * Map EditAccountInput to API format
 */
export const mapEditAccountToApi = (input: Account) => ({
  fullName: input.fullName,
  email: input.email,
  phoneNumber: input.phoneNumber,
  status: input.status === "Active" ? 1 : 0,
  address: input.address,
  dateOfBirth: input.dateOfBirth || "",
  gender: input.gender || "",
});

// Role mapping helpers
export const mapRoleToRoleId = (role: Role): string => {
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

export const mapRoleIdToRole = (roleId: string): Role => {
  switch (roleId) {
    case "6864af6bdd24a9f129d73d93":
      return "Admin";
    case "684f84c7a2c60b9b2be5e315":
      return "Employee";
    case "507f1f77bcf86cd799439028":
      return "Customer";
    default:
      return "Customer";
  }
};

// Status mapping helpers
export const mapStatusToApi = (status: "Active" | "Locked"): number =>
  status === "Active" ? 1 : 0;

export const mapStatusFromApi = (status: number): "Active" | "Locked" =>
  status === 1 ? "Active" : "Locked";

// Statistics calculation
export const calculateAccountStats = (accounts: Account[]) => ({
  total: accounts.length,
  active: accounts.filter((acc) => acc.status === "Active").length,
  locked: accounts.filter((acc) => acc.status === "Locked").length,
});

// Filtering and searching
export const filterAccounts = (
  accounts: Account[],
  searchTerm: string,
  statusFilter: string
): Account[] => {
  return accounts.filter((account) => {
    const matchesSearch =
      searchTerm === "" ||
      [
        account.fullName || "",
        account.email || "",
        account.phoneNumber || "",
        account.memberId || "",
        account.username || "",
      ].some((field) => field.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      statusFilter === "All Status" || account.status === statusFilter;

    return matchesSearch && matchesStatus;
  });
};

export const sortAccounts = (
  accounts: Account[],
  field: keyof Account,
  direction: "asc" | "desc"
): Account[] => {
  return [...accounts].sort((a, b) => {
    const aValue = a[field] ?? "";
    const bValue = b[field] ?? "";

    if (aValue < bValue) return direction === "asc" ? -1 : 1;
    if (aValue > bValue) return direction === "asc" ? 1 : -1;
    return 0;
  });
};

// Validation
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const isValidPhoneNumber = (phone: string): boolean => {
  const phoneRegex = /^\+?\d{10,15}$/;
  return phoneRegex.test(phone);
};

export const validatePassword = (
  password: string
): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }
  if (!/(?=.*[a-z])/.test(password)) {
    errors.push("Password must contain at least one lowercase letter");
  }
  if (!/(?=.*[A-Z])/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }
  if (!/(?=.*\d)/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  return { isValid: errors.length === 0, errors };
};

export const validateNewAccount = (
  data: NewAccountInput
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!data.fullName?.trim()) {
    errors.fullName = "Full name is required";
  }

  if (!data.email?.trim()) {
    errors.email = "Email is required";
  } else if (!isValidEmail(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!data.phoneNumber?.trim()) {
    errors.phoneNumber = "Phone number is required";
  } else if (!isValidPhoneNumber(data.phoneNumber)) {
    errors.phoneNumber = "Please enter a valid phone number";
  }

  if (!data.password) {
    errors.password = "Password is required";
  } else {
    const passwordValidation = validatePassword(data.password);
    if (!passwordValidation.isValid) {
      errors.password = passwordValidation.errors[0];
    }
  }

  if (!data.address?.trim()) {
    errors.address = "Address is required";
  }

  if (!data.username?.trim()) {
    errors.username = "Username is required";
  }

  if (!data.dateOfBirth) {
    errors.dateOfBirth = "Date of birth is required";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

export const validateEditAccount = (
  data: Account
): { isValid: boolean; errors: Record<string, string> } => {
  const errors: Record<string, string> = {};

  if (!data.fullName?.trim()) {
    errors.fullName = "Full name is required";
  }

  if (!data.email?.trim()) {
    errors.email = "Email is required";
  } else if (!isValidEmail(data.email)) {
    errors.email = "Please enter a valid email address";
  }

  if (!data.phoneNumber?.trim()) {
    errors.phoneNumber = "Phone number is required";
  } else if (!isValidPhoneNumber(data.phoneNumber)) {
    errors.phoneNumber = "Please enter a valid phone number";
  }

  if (!data.address?.trim()) {
    errors.address = "Address is required";
  }

  return { isValid: Object.keys(errors).length === 0, errors };
};

// UI helpers
export const getStatusBadgeColor = (status: Account["status"]): string => {
  switch (status) {
    case "Active":
      return "bg-green-100 text-green-800";
    case "Locked":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

/**
 * Generate member ID (for new accounts)
 */
export const generateMemberId = (existingAccounts: Account[]): string => {
  const existingIds = existingAccounts
    .map((acc) => {
      const match = acc.memberId?.match(/MEM(\d+)/);
      return match ? parseInt(match[1]) : 0;
    })
    .filter((id) => !isNaN(id) && id > 0);

  const maxId = Math.max(0, ...existingIds);
  return `MEM${(maxId + 1).toString().padStart(6, "0")}`;
};

// Date formatting utilities
export const formatDate = (dateString?: string): string => {
  if (!dateString) return "N/A";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid Date";

    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return "Invalid Date";
  }
};

export const formatDateForInput = (dateString?: string): string => {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "";

    return date.toISOString().split("T")[0];
  } catch {
    return "";
  }
};

export const calculateAge = (dateOfBirth?: string): number => {
  if (!dateOfBirth) return 0;

  try {
    const birth = new Date(dateOfBirth);
    if (isNaN(birth.getTime())) return 0;

    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();

    if (
      monthDiff < 0 ||
      (monthDiff === 0 && today.getDate() < birth.getDate())
    ) {
      age--;
    }

    return age >= 0 ? age : 0;
  } catch {
    return 0;
  }
};

// Utility for debouncing search input
export const debounce = <T extends unknown[]>(
  func: (...args: T) => void,
  delay: number
): ((...args: T) => void) => {
  let timeoutId: NodeJS.Timeout;

  return (...args: T) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// Search and filter utilities
export const createSearchFilter = (searchTerm: string) => {
  const normalizedSearch = searchTerm.toLowerCase().trim();

  return (account: Account): boolean => {
    if (!normalizedSearch) return true;

    const searchableFields = [
      account.fullName,
      account.email,
      account.phoneNumber,
      account.memberId,
      account.username,
      account.address,
    ]
      .filter(Boolean)
      .map((field) => field?.toLowerCase() || "");

    return searchableFields.some((field) => field.includes(normalizedSearch));
  };
};

export const createStatusFilter = (statusFilter: string) => {
  return (account: Account): boolean => {
    return statusFilter === "All Status" || account.status === statusFilter;
  };
};

// Export all utility functions as a single object
export const AccountUtils = {
  mapUserAccountToAccount,
  mapNewAccountToApi,
  mapEditAccountToApi,
  mapRoleToRoleId,
  mapRoleIdToRole,
  mapStatusToApi,
  mapStatusFromApi,
  calculateAccountStats,
  filterAccounts,
  sortAccounts,
  isValidEmail,
  isValidPhoneNumber,
  validatePassword,
  validateNewAccount,
  validateEditAccount,
  getStatusBadgeColor,
  generateMemberId,
  formatDate,
  formatDateForInput,
  calculateAge,
  debounce,
  createSearchFilter,
  createStatusFilter,
};

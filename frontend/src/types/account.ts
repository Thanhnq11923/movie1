// src/types/account.ts

export const ROLES = ["Admin", "Employee", "Customer"] as const;
export type Role = (typeof ROLES)[number];

export interface Member {
  memberId: string;
  score: number;
}

export interface UserAccount {
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
  status: number; // 1: Active, 0: Locked
  registerDate: string;
  member: Member;
  updatedAt: string;
  otpEnabled: boolean;
  totalSpending?: number;
}

// Unified Account interface - using string for id consistently
export interface Account {
  id: string; // Always string for consistency
  memberId: string;
  username?: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  address: string;
  role?: Role;
  roleId: string;
  status: "Active" | "Locked";
  dateOfBirth?: string;
  gender?: string;
  image?: string;
  registerDate?: string;
  member?: Member;
  password?: string;
  _id?: string;
}

// ✅ FIXED: Added memberId field to NewAccountInput
export interface NewAccountInput {
  fullName: string;
  email: string;
  password: string;
  phoneNumber: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  image?: string;
  role?: Role;
  status: 1;
  username: string;
  memberId?: string; // ✅ Added memberId field (optional)
}

// ✅ FIXED: Added memberId field to UpdateAccountInput
export interface UpdateAccountInput {
  fullName?: string;
  email?: string;
  phoneNumber?: string;
  status?: "Active" | "Locked";
  address?: string;
  dateOfBirth?: string;
  gender?: string;
  memberId?: string; // ✅ Added memberId field
  password?: string; // Thêm trường password (tùy chọn)
}

export interface TicketTransaction {
  bookedAt: string;
  _id: string;
  accountId: string;
  movieId: string | { _id: string; versionMovieEnglish: string };
  movieName: string;
  scheduleId: string;
  scheduleShowTime: string;
  cinemaId?: string;
  cinemaRoomId: string | { _id: string; roomName: string };
  cinemaRoomName?: string;
  promotion?: string;
  date?: string;
  time?: string;
  theater?: string;
  format?: string;
  seats?: Array<{ row: string; col?: number; number?: string }>;
  concessions?: Array<{ name: string; quantity: number; price: number }>;
  tickets: {
    ticketId: string;
    priceTypeId: string;
    seatId: string;
    price: number;
  }[];
  promotionId?: string;
  totalMoney: number;
  addScore: number;
  useScore: number;
  paymentMethod: string;
  status: "confirmed" | "cancelled" | "pending";
  bookingDate: string;
}

// Utility functions for status mapping
export const mapStatus = (status: number | string): "Active" | "Locked" => {
  if (typeof status === "number") return status === 1 ? "Active" : "Locked";
  return status as "Active" | "Locked";
};

export const mapStatusToNumber = (status: "Active" | "Locked"): number => {
  return status === "Active" ? 1 : 0;
};

// Utility functions for role mapping
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

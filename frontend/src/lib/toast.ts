import toast from "react-hot-toast";

export const notify = {
  success: (message: string) => {
    return toast.success(message, {
      duration: 5000,
      style: {
        background: "#FFFFFF",
        color: "#16A34A",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "500",
        padding: "12px 16px",
        minWidth: "300px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        border: "1px solid #E5E7EB",
        borderLeft: "4px solid #16A34A",
        lineHeight: "1.4",
      },
      iconTheme: {
        primary: "#16A34A",
        secondary: "#FFFFFF",
      },
      position: "top-right",
    });
  },

  error: (message: string) => {
    return toast.error(message, {
      duration: 6000,
      style: {
        background: "#FFFFFF",
        color: "#DC2626",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "500",
        padding: "12px 16px",
        minWidth: "300px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        border: "1px solid #E5E7EB",
        borderLeft: "4px solid #DC2626",
        lineHeight: "1.4",
      },
      iconTheme: {
        primary: "#DC2626",
        secondary: "#FFFFFF",
      },
    });
  },

  warning: (message: string) => {
    return toast(message, {
      icon: "⚠️",
      duration: 5000,
      style: {
        background: "#FFFFFF",
        color: "#D97706",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "500",
        padding: "12px 16px",
        minWidth: "300px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        border: "1px solid #E5E7EB",
        borderLeft: "4px solid #D97706",
        lineHeight: "1.4",
      },
    });
  },

  info: (message: string) => {
    return toast(message, {
      icon: "ℹ️",
      duration: 4000,
      style: {
        background: "#FFFFFF",
        color: "#2563EB",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "500",
        padding: "12px 16px",
        minWidth: "300px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        border: "1px solid #E5E7EB",
        borderLeft: "4px solid #2563EB",
        lineHeight: "1.4",
      },
    });
  },

  loading: (message: string) => {
    return toast.loading(message, {
      style: {
        background: "#FFFFFF",
        color: "#6B7280",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "500",
        padding: "12px 16px",
        minWidth: "300px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        border: "1px solid #E5E7EB",
        borderLeft: "4px solid #6B7280",
        lineHeight: "1.4",
      },
    });
  },

  dismiss: (toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  },

  remove: (toastId: string) => {
    toast.remove(toastId);
  },

  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string;
      error: string;
    }
  ) => {
    return toast.promise(promise, messages, {
      style: {
        background: "#FFFFFF",
        color: "#374151",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "500",
        padding: "12px 16px",
        minWidth: "300px",
        boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
        border: "1px solid #E5E7EB",
        lineHeight: "1.4",
      },
    });
  },
};

// ✨ XL SIZE VERSION - Cho những notification quan trọng
export const notifyXL = {
  success: (message: string) => {
    return toast.success(message, {
      duration: 7000,
      style: {
        background: "#FFFFFF",
        color: "#16A34A",
        borderRadius: "12px",
        fontSize: "16px",
        fontWeight: "600",
        padding: "16px 20px",
        minWidth: "400px",
        minHeight: "60px",
        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
        border: "2px solid #E5E7EB",
        borderLeft: "6px solid #16A34A",
        lineHeight: "1.5",
      },
      iconTheme: {
        primary: "#16A34A",
        secondary: "#FFFFFF",
      },
    });
  },

  error: (message: string) => {
    return toast.error(message, {
      duration: 8000,
      style: {
        background: "#FFFFFF",
        color: "#DC2626",
        borderRadius: "12px",
        fontSize: "16px",
        fontWeight: "600",
        padding: "16px 20px",
        minWidth: "400px",
        minHeight: "60px",
        boxShadow: "0 8px 25px rgba(0, 0, 0, 0.15)",
        border: "2px solid #E5E7EB",
        borderLeft: "6px solid #DC2626",
        lineHeight: "1.5",
      },
      iconTheme: {
        primary: "#DC2626",
        secondary: "#FFFFFF",
      },
    });
  },
};

// 📱 MESSAGES - Tái cấu trúc theo chức năng chính
export const MESSAGES = {
  // 👤 Quản lý tài khoản
  ACCOUNT: {
    CREATED: "Account created successfully!",
    UPDATED: "Account updated successfully!",
    DELETED: "Account deleted successfully!",
    LOCKED: "Account locked successfully!",
    UNLOCKED: "Account unlocked successfully!",
    ERROR: "Failed to process account!",
    VALIDATION: "Please check account information!",
    DELETE_CONFIRM: "Are you sure you want to delete this account?",
    DELETE_CANCELLED: "Account deletion cancelled",
    FILTERS_RESET: "Filters have been reset",
  },

  // 📋 Quản lý đặt vé
  BOOKING: {
    CREATED: "Booking created successfully!",
    UPDATED: "Booking updated successfully!",
    CANCELLED: "Booking cancelled successfully!",
    CONFIRMED: "Booking confirmed!",
    ERROR: "Failed to process booking!",
    NO_SEATS: "No available seats!",
  },

  // 🎬 Quản lý phim
  MOVIE: {
    ADDED: "Movie added successfully!",
    UPDATED: "Movie updated successfully!",
    DELETED: "Movie removed successfully!",
    ERROR: "Failed to process movie!",
    UPLOAD_SUCCESS: "Movie poster uploaded!",
  },

  // 👥 Quản lý nhân viên
  EMPLOYEE: {
    ADDED: "Employee added successfully!",
    UPDATED: "Employee information updated!",
    DELETED: "Employee removed successfully!",
    ERROR: "Failed to process employee!",
  },

  // 🏢 Quản lý phòng chiếu
  ROOM: {
    CREATED: "Room created successfully!",
    UPDATED: "Room updated successfully!",
    DELETED: "Room deleted successfully!",
    SCHEDULED: "Room scheduled successfully!",
    ERROR: "Failed to process room!",
  },

  TICKET: {
    ISSUED: "Ticket issued successfully!",
    UPDATED: "Ticket updated successfully!",
    CANCELLED: "Ticket cancelled successfully!",
    CONFIRMED: "Ticket confirmed successfully!",
    USED: "Ticket marked as used!",
    DELETED: "Ticket deleted successfully!",
    REFUNDED: "Ticket refunded successfully!",
    STATUS_CHANGED: "Ticket status updated!",
    ERROR: "Failed to process ticket!",
    VALIDATION_ERROR: "Please fix validation errors!",
  },

  // 🎁 Hệ thống khuyến mãi
  PROMOTION: {
    CREATED: "Promotion created successfully!",
    UPDATED: "Promotion updated successfully!",
    DELETED: "Promotion deleted successfully!",
    ACTIVATED: "Promotion activated!",
    DEACTIVATED: "Promotion deactivated!",
    ERROR: "Failed to process promotion!",
  },

  // 🍿 Quản lý đồ ăn
  CONCESSION: {
    ADDED: "Concession item added!",
    UPDATED: "Concession item updated!",
    DELETED: "Concession item removed!",
    OUT_OF_STOCK: "Item is out of stock!",
    ERROR: "Failed to process concession!",
  },

  // 💰 Hệ thống điểm thưởng
  POINT: {
    // 🎁 Quản lý phần thưởng
    REWARD_ADDED: "Reward added successfully!",
    REWARD_UPDATED: "Reward updated successfully!",
    REWARD_DELETED: "Reward deleted successfully!",
    REWARD_ERROR: "Failed to process reward!",
    OUT_OF_STOCK: "Reward is out of stock!",
    NO_REWARDS: "No rewards available!",

    // 💰 Quản lý điểm khách hàng
    POINTS_ADJUSTED: "Customer points adjusted successfully!",
    POINTS_ERROR: "Failed to adjust customer points!",
    CUSTOMER_POINTS_VIEWED: "Customer points details viewed successfully!",

    // 🔄 Đổi điểm thưởng
    REDEEM_SUCCESS: "Points redeemed successfully!",
    REDEEM_ERROR:
      "Failed to redeem points! Insufficient points or reward unavailable.",

    // 📊 Xuất dữ liệu & Giao dịch
    EXPORT_SUCCESS: "Data exported successfully!",
    EXPORT_ERROR: "Failed to export data!",
    TRANSACTION_LOGGED: "Transaction logged successfully!",
    TRANSACTION_ERROR: "Failed to log transaction!",

    // ⚠️ Validation
    VALIDATION_ERROR: "Please check the input data!",
  },

  // 💬 Phản hồi khách hàng
  FEEDBACK: {
    SUBMITTED: "Feedback submitted successfully!",
    RESPONDED: "Response sent successfully!",
    DELETED: "Feedback deleted!",
    ERROR: "Failed to process feedback!",
  },

  // ⚙️ Hệ thống chung
  GENERAL: {
    SAVE_SUCCESS: "Changes saved successfully!",
    SAVE_ERROR: "Failed to save changes!",
    DELETE_CONFIRM: "Item deleted successfully!",
    VALIDATION_ERROR: "Please check your input!",
    NETWORK_ERROR: "Network error! Please try again.",
    UNAUTHORIZED: "You are not authorized!",
    LOADING: "Processing...",
  },
};

// Backward compatibility - Export ACCOUNT_MESSAGES riêng
export const ACCOUNT_MESSAGES = MESSAGES.ACCOUNT;

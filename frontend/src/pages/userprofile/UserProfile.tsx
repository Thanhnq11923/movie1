import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { authService } from "../../services/api/authService";
import { AxiosError } from "axios";
import { ProfileLayout } from "../../layouts/ProfileLayout";
import { PersonalInfoTab } from "../../components/client/userprofile/PersonalInfoTab";
import { TransactionHistoryTab } from "../../components/client/userprofile/TransactionHistoryTab";
import RedeemPoint from "../../components/client/userprofile/RedeemPoint";
import { ProfileNav } from "../../components/client/userprofile/ProfileNav";
import type { UserAccount } from "../../types/account";

export default function UserProfile() {
  const location = useLocation();
  const [user, setUser] = useState<UserAccount | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState(
    () => location.state?.tab || "info"
  );

  useEffect(() => {
    const fetchProfile = async () => {
      const token = authService.getToken();
      if (!token) {
        setError("Bạn chưa đăng nhập.");
        setLoading(false);
        return;
      }
      try {
        const res = await authService.getProfile();
        if (res && res.success && res.data) {
          setUser(res.data.user || res.data);
          // TODO: Fetch real transactions later and use setTransactions
        } else {
          setError("Không lấy được dữ liệu user.");
        }
      } catch (err) {
        const error = err as AxiosError;
        if (error.response && error.response.status === 401) {
          setError("Token hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại.");
        } else {
          setError("Lỗi khi lấy dữ liệu user.");
        }
      }
      setLoading(false);
    };
    fetchProfile();
  }, []);

  // Nếu state.tab thay đổi (ví dụ khi navigate từ trang khác), cập nhật activeTab
  useEffect(() => {
    if (location.state?.tab && location.state.tab !== activeTab) {
      setActiveTab(location.state.tab);
    }
  }, [location.state?.tab]);

  const renderTabContent = () => {
    switch (activeTab) {
      case "history":
        return <TransactionHistoryTab />;
      case "redeem":
        return <RedeemPoint />;
      case "info":
      default:
        return user ? <PersonalInfoTab user={user} /> : <div>Loading...</div>;
    }
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-4 sm:p-8">
          <div className="inline-flex items-center space-x-3">
            <div className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2 border-orange-500"></div>
            <span className="text-sm sm:text-base lg:text-lg text-gray-600">
              Đang tải thông tin...
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-4 sm:p-8 max-w-md mx-auto">
          <div className="inline-flex items-center space-x-3 text-red-500 mb-4">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-sm sm:text-base lg:text-lg font-medium">
              Lỗi
            </span>
          </div>
          <p className="text-sm sm:text-base text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm sm:text-base"
          >
            Thử lại
          </button>
        </div>
      </div>
    );
  }

  // No User Data State
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-4 sm:p-8 max-w-md mx-auto">
          <div className="inline-flex items-center space-x-3 text-gray-500 mb-4">
            <svg
              className="w-5 h-5 sm:w-6 sm:h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="text-sm sm:text-base lg:text-lg font-medium">
              Không có dữ liệu
            </span>
          </div>
          <p className="text-sm sm:text-base text-gray-600">
            Không có dữ liệu user.
          </p>
        </div>
      </div>
    );
  }

  return (
    <ProfileLayout user={user}>
      <div className="bg-white p-3 sm:p-4 md:p-6 rounded-lg shadow-xl">
        <ProfileNav activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-4 sm:mt-6">{renderTabContent()}</div>
      </div>
    </ProfileLayout>
  );
}

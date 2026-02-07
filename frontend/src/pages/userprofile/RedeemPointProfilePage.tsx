import { useState } from "react";
import { ProfileNav } from '../../components/client/userprofile/ProfileNav';
import RedeemPoint from '../../components/client/userprofile/RedeemPoint';
// Giả sử bạn có các tab khác, có thể import thêm nếu muốn
// import TransactionHistoryTab from '../../components/client/userprofile/TransactionHistoryTab';
// import PersonalInfoTab from '../../components/client/userprofile/PersonalInfoTab';

export default function RedeemPointProfilePage() {
  const [activeTab, setActiveTab] = useState('redeem'); // Mặc định vào tab Redeem Point

  return (
    <div className="max-w-5xl mx-auto p-4">
      <ProfileNav activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="mt-6">
        {/* Có thể thêm các tab khác nếu muốn */}
        {/* {activeTab === 'info' && <PersonalInfoTab />} */}
        {/* {activeTab === 'history' && <TransactionHistoryTab />} */}
        {activeTab === 'redeem' && <RedeemPoint />}
      </div>
    </div>
  );
} 
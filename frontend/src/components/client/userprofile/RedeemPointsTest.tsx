// import { useState } from 'react';
// import { RedeemPointTab } from './RedeemPointTab';
// import { RedeemPointsModal } from './RedeemPointsModal';
// import { Gift, History, Plus, Coins } from 'lucide-react';

// export const RedeemPointsTest = () => {
//   const [activeTab, setActiveTab] = useState<'rewards' | 'history'>('rewards');
//   const [showModal, setShowModal] = useState(false);

//   return (
//     <div className="max-w-6xl mx-auto p-6">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">Redeem Points Test</h1>
//         <p className="text-gray-600">
//           Test hệ thống đổi điểm với fallback mechanism cho admin-only endpoints
//         </p>
//         <div className="mt-4 p-4 bg-blue-50 rounded-lg">
//           <p className="text-sm text-blue-800">
//             <strong>Note:</strong> Nếu API trả về "Admin access required", hệ thống sẽ tự động sử dụng mock data.
//             Kiểm tra Console để xem warning messages.
//           </p>
//         </div>
//       </div>

//       {/* Quick Actions */}
//       <div className="mb-6 flex flex-wrap gap-4">
//         <button
//           onClick={() => setShowModal(true)}
//           className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//         >
//           <Plus className="w-4 h-4" />
//           <span>Quick Redeem Modal</span>
//         </button>

//         <button
//           onClick={() => setActiveTab('rewards')}
//           className="flex items-center space-x-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
//         >
//           <Gift className="w-4 h-4" />
//           <span>View Rewards</span>
//         </button>

//         <button
//           onClick={() => setActiveTab('history')}
//           className="flex items-center space-x-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
//         >
//           <History className="w-4 h-4" />
//           <span>View History</span>
//         </button>
//       </div>

//       {/* Tab Navigation */}
//       <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg mb-6">
//         <button
//           onClick={() => setActiveTab('rewards')}
//           className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
//             activeTab === 'rewards'
//               ? 'bg-white text-blue-600 shadow-sm'
//               : 'text-gray-600 hover:text-gray-900'
//           }`}
//         >
//           <Gift className="w-4 h-4" />
//           <span>Available Rewards</span>
//         </button>
//         <button
//           onClick={() => setActiveTab('history')}
//           className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors ${
//             activeTab === 'history'
//               ? 'bg-white text-blue-600 shadow-sm'
//               : 'text-gray-600 hover:text-gray-900'
//           }`}
//         >
//           <History className="w-4 h-4" />
//           <span>Redemption History</span>
//         </button>
//       </div>

//       {/* Tab Content */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//         {activeTab === 'rewards' ? (
//           <div className="p-6">
//             <div className="mb-4">
//               <h2 className="text-xl font-semibold text-gray-900 mb-2">Available Rewards</h2>
//               <p className="text-gray-600">Danh sách các phần thưởng có thể đổi bằng điểm</p>
//             </div>
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//               {[
//                 { name: 'Movie Ticket 2D', points: 500, category: 'Entertainment' },
//                 { name: 'Popcorn Large', points: 200, category: 'Food & Beverage' },
//                 { name: 'Soft Drink', points: 150, category: 'Food & Beverage' },
//                 { name: '20% Discount Voucher', points: 1000, category: 'Discount' },
//                 { name: 'Premium Seat Upgrade', points: 300, category: 'Upgrade' }
//               ].map((item, index) => (
//                 <div key={index} className="border border-gray-200 rounded-lg p-4">
//                   <div className="flex items-center justify-between mb-2">
//                     <h3 className="font-semibold text-gray-900">{item.name}</h3>
//                     <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
//                       {item.category}
//                     </span>
//                   </div>
//                   <div className="flex items-center space-x-1">
//                     <Coins className="w-4 h-4 text-yellow-500" />
//                     <span className="font-semibold text-gray-900">{item.points.toLocaleString()}</span>
//                     <span className="text-sm text-gray-500">points</span>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ) : (
//           <div className="p-6">
//             <div className="mb-4">
//               <h2 className="text-xl font-semibold text-gray-900 mb-2">Redemption History</h2>
//               <p className="text-gray-600">Lịch sử đổi điểm của bạn</p>
//             </div>
//             <RedeemPointTab />
//           </div>
//         )}
//       </div>

//       {/* Modal */}
//       {showModal && (
//         <RedeemPointsModal onClose={() => setShowModal(false)} />
//       )}
//     </div>
//   );
// };

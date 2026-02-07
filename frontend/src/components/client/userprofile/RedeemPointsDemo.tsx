// import { useState } from 'react';
// import { EgiftList } from './EgiftList';
// import { RedeemPointTab } from './RedeemPointTab';
// import { RedeemPointsModal } from './RedeemPointsModal';
// import { Gift, History, Plus } from 'lucide-react';

// export const RedeemPointsDemo = () => {
//   const [activeTab, setActiveTab] = useState<'rewards' | 'history'>('rewards');
//   const [showModal, setShowModal] = useState(false);

//   return (
//     <div className="max-w-6xl mx-auto p-6">
//       <div className="mb-8">
//         <h1 className="text-3xl font-bold text-gray-900 mb-2">Redeem Points</h1>
//         <p className="text-gray-600">Exchange your points for exciting rewards</p>
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

//       {/* Quick Redeem Button */}
//       <div className="mb-6">
//         <button
//           onClick={() => setShowModal(true)}
//           className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
//         >
//           <Plus className="w-4 h-4" />
//           <span>Quick Redeem</span>
//         </button>
//       </div>

//       {/* Tab Content */}
//       <div className="bg-white rounded-lg shadow-sm border border-gray-200">
//         {activeTab === 'rewards' ? (
//           <div className="p-6">
//             <EgiftList />
//           </div>
//         ) : (
//           <div className="p-6">
//             <h2 className="text-xl font-semibold text-gray-900 mb-4">Redemption History</h2>
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

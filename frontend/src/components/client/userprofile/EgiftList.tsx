import { useState } from 'react';
import { Gift, Coins, Star } from 'lucide-react';
import { useRedeemPoints } from '../../../hooks/useRedeemPoints';
import type { EgiftItem } from '../../../hooks/useRedeemPoints';

export const EgiftList = () => {
  const { egiftItems, userPoints, loading, error, redeemEgift } = useRedeemPoints();
  const [redeeming, setRedeeming] = useState<string | null>(null);

  const handleRedeem = async (item: EgiftItem) => {
    if (userPoints < item.points) return;

    setRedeeming(item._id);
    try {
      const result = await redeemEgift(item._id, item.points);
      if (result.success) {
        // Show success message or notification
        console.log('Successfully redeemed:', item.name);
      }
    } finally {
      setRedeeming(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-16">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-16">
        <p className="text-red-500">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* User Points Display */}
      <div className="bg-gradient-to-r from-yellow-400 to-yellow-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold mb-1">Your Points</h3>
            <p className="text-yellow-100">Available for redemption</p>
          </div>
          <div className="text-right">
            <div className="flex items-center space-x-2">
              <Coins className="w-6 h-6" />
              <span className="text-3xl font-bold">{userPoints.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Egift Items Grid */}
      <div>
        <h3 className="text-xl font-semibold text-gray-900 mb-4">Available Rewards</h3>
        {egiftItems.length === 0 ? (
          <div className="text-center py-16">
            <Gift className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No rewards available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {egiftItems.map((item) => {
              const canAfford = userPoints >= item.points;
              const isRedeeming = redeeming === item._id;

              return (
                <div
                  key={item._id}
                  className={`border-2 rounded-lg p-6 transition-all hover:shadow-lg ${
                    canAfford 
                      ? 'border-gray-200 hover:border-blue-300' 
                      : 'border-gray-200 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div className="p-3 rounded-lg bg-blue-100">
                      <Gift className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                      {item.category}
                    </span>
                  </div>

                  <h4 className="font-semibold text-gray-900 mb-2">{item.name}</h4>
                  <p className="text-gray-600 text-sm mb-4">{item.description}</p>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-500" />
                      <span className="font-semibold text-gray-900">{item.points.toLocaleString()}</span>
                      <span className="text-sm text-gray-500">points</span>
                    </div>
                    <button
                      onClick={() => handleRedeem(item)}
                      disabled={!canAfford || isRedeeming}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        canAfford && !isRedeeming
                          ? 'bg-blue-600 text-white hover:bg-blue-700'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isRedeeming ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Redeeming...</span>
                        </div>
                      ) : canAfford ? (
                        'Redeem'
                      ) : (
                        'Not Enough Points'
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}; 
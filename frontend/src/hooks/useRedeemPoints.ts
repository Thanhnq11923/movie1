import { useState, useEffect } from 'react';
import axios from 'axios';

export interface EgiftItem {
  _id: string;
  name: string;
  description: string;
  points: number;
  category: string;
  status: 'active' | 'inactive';
}

export interface PointHistoryItem {
  _id: string;
  itemName: string;
  pointsUsed: number;
  redeemDate: string;
  status: 'completed' | 'pending' | 'cancelled';
}

export const useRedeemPoints = () => {
  const [egiftItems, setEgiftItems] = useState<EgiftItem[]>([]);
  const [userPoints, setUserPoints] = useState(0);
  const [pointHistory, setPointHistory] = useState<PointHistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Fetch user points
      const userResponse = await axios.get('http://localhost:3000/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const userData = userResponse.data.data || userResponse.data;
      setUserPoints(userData.member?.score || 0);

      // Fetch egift items - will use fallback if API fails
      try {
        const egiftResponse = await axios.get('http://localhost:3000/api/users/egifts', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const egiftData = egiftResponse.data.data || egiftResponse.data;
        setEgiftItems(egiftData);
      } catch (egiftError) {
        console.warn('Egifts API failed, using mock data:', egiftError);
        // Mock data will be set by userService
        const { userService } = await import('../services/api/userService');
        const mockEgifts = await userService.getEgifts();
        setEgiftItems(mockEgifts);
      }

      // Fetch point history - will use fallback if API fails
      try {
        const historyResponse = await axios.get('http://localhost:3000/api/users/point-history', {
          headers: { Authorization: `Bearer ${token}` }
        });
        const historyData = historyResponse.data.data || historyResponse.data;
        setPointHistory(historyData);
      } catch (historyError) {
        console.warn('Point history API failed, using mock data:', historyError);
        // Mock data will be set by userService
        const { userService } = await import('../services/api/userService');
        const mockHistory = await userService.getPointHistory();
        setPointHistory(mockHistory);
      }

      setError(null);
    } catch (err: unknown) {
      console.error('Error fetching user data:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load data';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const redeemEgift = async (egiftId: string, points: number) => {
    try {
      const token = localStorage.getItem('authToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      await axios.post('http://localhost:3000/api/users/exchange-egift', 
        { points, egiftType: egiftId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Refresh user data after successful redemption
      await fetchUserData();
      
      return { success: true };
    } catch (err: unknown) {
      console.error('Error redeeming egift:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to redeem egift';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  return {
    egiftItems,
    userPoints,
    pointHistory,
    loading,
    error,
    redeemEgift,
    refreshData: fetchUserData,
  };
}; 
export { movieService } from './movieService';
export { authService } from './authService';
export { promotionService } from './promotionService';
export { default as PromotionDetail } from '../../pages/client/Event/PromotionDetail/PromotionDetail';
export { userService } from './userService';
export { cinemaService } from './cinemaService';
export { movieScheduleService } from './movieScheduleService';
export { watercornService } from './watercornService';
export { getTransactionHistoryByUser } from './bookingService';
export { feedbackService } from './feedbackService';
export { egiftService } from './egiftService';

import { authService } from './authService';

// API cho watercorn (đổi từ concession sang watercorn)
export async function getAllWatercorns() {
  return fetch("/api/watercorn/all").then(res => res.json());
}

export async function getWatercornById(id: string) {
  return fetch(`/api/watercorn/${id}`).then(res => res.json());
}

export async function createWatercorn(data: any) {
  const token = authService.getToken?.() || localStorage.getItem('token');
  if (!token) throw new Error("No token provided");
  const res = await fetch("/api/watercorn", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    let err = await res.json().catch(() => ({}));
    throw new Error(err?.error || err?.message || res.statusText || 'Failed to create');
  }
  return res.json();
}

export async function updateWatercorn(id: string, data: any) {
  try {
    const token = authService.getToken?.() || localStorage.getItem('token');

    if (!token) {
      throw new Error("Authentication required. Please log in again.");
    }

    console.log(`Making PUT request to /api/watercorn/${id}`);
    console.log("Request data:", data);
    console.log("Token present:", !!token);

    const res = await fetch(`/api/watercorn/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data)
    });

    console.log("Response status:", res.status);
    console.log("Response ok:", res.ok);

    // Get response text first to handle both JSON and non-JSON responses
    const responseText = await res.text();
    console.log("Raw response:", responseText);

    let responseData;
    try {
      responseData = responseText ? JSON.parse(responseText) : {};
    } catch (parseError) {
      console.error("Failed to parse response as JSON:", parseError);
      responseData = { message: responseText || "Invalid response format" };
    }

    if (!res.ok) {
      const errorMessage = responseData?.error ||
        responseData?.message ||
        `HTTP ${res.status}: ${res.statusText}`;

      console.error("API Error Response:", {
        status: res.status,
        statusText: res.statusText,
        data: responseData
      });

      throw new Error(errorMessage);
    }

    console.log("Parsed response data:", responseData);
    return responseData;

  } catch (error) {
    console.error("updateWatercorn error:", error);

    // Re-throw with more context if it's a network error
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new Error("Network error: Unable to connect to server. Please check your connection.");
    }

    // Re-throw the original error if it already has a message
    throw error;
  }
}

export async function deleteWatercorn(id: string) {
  const token = authService.getToken?.() || localStorage.getItem('token');
  if (!token) throw new Error("No token provided");
  const res = await fetch(`/api/watercorn/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    }
  });
  if (!res.ok) {
    let err = await res.json().catch(() => ({}));
    throw new Error(err?.error || err?.message || res.statusText || 'Failed to delete');
  }
  return res.json();
} 
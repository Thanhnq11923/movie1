const axios = require("axios");

// Đặt endpoint API thực tế tại đây
const BASE_URL = "https://api.movietheater.com/egift";

// Hàm trả về dữ liệu giả lập E-gift để test backend
async function exchangePoints(userId, points, egiftType) {
  return {
    data: {
      code: "EGIFT123456",
      type: egiftType,
      expiredAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 ngày sau
    },
  };
}

module.exports = {
  exchangePoints,
};

const axios = require("axios");

// Đặt endpoint API thực tế tại đây
const BASE_URL = "https://api.movietheater.com/egift";

// Tạo E-gift
async function createEgift(data) {
  return axios.post(`${BASE_URL}`, data);
}

// Lấy thông tin E-gift
async function getEgift(id) {
  return axios.get(`${BASE_URL}/${id}`);
}

// Cập nhật E-gift
async function updateEgift(id, data) {
  return axios.put(`${BASE_URL}/${id}`, data);
}

// Xóa E-gift
async function deleteEgift(id) {
  return axios.delete(`${BASE_URL}/${id}`);
}

// Đổi điểm lấy E-gift
async function exchangePoints(userId, points) {
  return axios.post(`${BASE_URL}/exchange`, { userId, points });
}

module.exports = {
  createEgift,
  getEgift,
  updateEgift,
  deleteEgift,
  exchangePoints,
};

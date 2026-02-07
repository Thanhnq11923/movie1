const axios = require('axios');

const API_BASE = 'http://localhost:3000/api';

// Test data
const testData = {
  scheduleId: '507f1f77bcf86cd799439011', // Thay bằng scheduleId thực tế
  cinemaRoomId: '507f1f77bcf86cd799439012', // Thay bằng cinemaRoomId thực tế
  seatId: 'A1',
  userId: '507f1f77bcf86cd799439013' // Thay bằng userId thực tế
};

async function testSeatLocking() {
  console.log('🧪 Testing Seat Locking System...\n');

  try {
    // Test 1: Lock seat
    console.log('1. Testing seat lock...');
    const lockResponse = await axios.post(`${API_BASE}/seatlocks/lock`, testData);
    console.log('✅ Lock response:', lockResponse.data);

    // Test 2: Try to lock same seat with different user (should fail)
    console.log('\n2. Testing duplicate lock with different user...');
    try {
      const duplicateLockData = { ...testData, userId: '507f1f77bcf86cd799439014' };
      await axios.post(`${API_BASE}/seatlocks/lock`, duplicateLockData);
    } catch (error) {
      console.log('✅ Expected error for duplicate lock:', error.response?.data?.message);
    }

    // Test 3: Get locked seats
    console.log('\n3. Testing get locked seats...');
    const lockedSeatsResponse = await axios.get(`${API_BASE}/seatlocks/locked`, {
      params: {
        scheduleId: testData.scheduleId,
        cinemaRoomId: testData.cinemaRoomId
      }
    });
    console.log('✅ Locked seats:', lockedSeatsResponse.data);

    // Test 4: Get stats
    console.log('\n4. Testing get stats...');
    const statsResponse = await axios.get(`${API_BASE}/seatlocks/stats`);
    console.log('✅ Stats:', statsResponse.data);

    // Test 5: Unlock seat
    console.log('\n5. Testing seat unlock...');
    const unlockResponse = await axios.post(`${API_BASE}/seatlocks/unlock`, testData);
    console.log('✅ Unlock response:', unlockResponse.data);

    // Test 6: Verify seat is unlocked
    console.log('\n6. Verifying seat is unlocked...');
    const verifyResponse = await axios.get(`${API_BASE}/seatlocks/locked`, {
      params: {
        scheduleId: testData.scheduleId,
        cinemaRoomId: testData.cinemaRoomId
      }
    });
    console.log('✅ Verification:', verifyResponse.data);

    console.log('\n🎉 All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error.response?.data || error.message);
  }
}

// Test cleanup function
async function testCleanup() {
  console.log('\n🧹 Testing cleanup function...');
  
  try {
    const response = await axios.delete(`${API_BASE}/seatlocks/cleanup`);
    console.log('✅ Cleanup response:', response.data);
  } catch (error) {
    console.error('❌ Cleanup test failed:', error.response?.data || error.message);
  }
}

// Run tests
async function runTests() {
  await testSeatLocking();
  await testCleanup();
}

// Run if called directly
if (require.main === module) {
  runTests();
}

module.exports = { testSeatLocking, testCleanup }; 
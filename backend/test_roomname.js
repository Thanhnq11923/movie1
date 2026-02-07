const axios = require('axios');

// Test script để kiểm tra việc lưu roomName
async function testRoomNameSave() {
    try {
        console.log('=== TESTING ROOM NAME SAVE ===');

        const testData = {
            cinemaRoomId: "ROOM_001",
            roomName: "Phòng chiếu số 1"
        };

        console.log('Sending test data:', testData);

        const response = await axios.post('http://localhost:3000/api/staff-bookings/test/roomname', testData);

        console.log('Response:', response.data);

        if (response.data.success) {
            console.log('\n=== RESULTS ===');
            console.log('Before save:', response.data.data.beforeSave);
            console.log('After save:', response.data.data.afterSave);
            console.log('Queried from DB:', response.data.data.queriedFromDB);

            if (response.data.data.queriedFromDB === "Phòng chiếu số 1") {
                console.log('✅ SUCCESS: roomName saved correctly!');
            } else {
                console.log('❌ FAILED: roomName not saved correctly!');
                console.log('Expected: "Phòng chiếu số 1"');
                console.log('Got:', response.data.data.queriedFromDB);
            }
        }

    } catch (error) {
        console.error('Test failed:', error.response?.data || error.message);
    }
}

// Test với các trường hợp khác nhau
async function runAllTests() {
    console.log('Testing normal case...');
    await testRoomNameSave();

    console.log('\n' + '='.repeat(50) + '\n');

    // Test với roomName rỗng
    try {
        console.log('Testing empty roomName...');
        const response = await axios.post('http://localhost:3000/api/staff-bookings/test/roomname', {
            cinemaRoomId: "ROOM_001",
            roomName: ""
        });
        console.log('Empty roomName response:', response.data);
    } catch (error) {
        console.log('Empty roomName error (expected):', error.response?.data?.message);
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test với roomName undefined
    try {
        console.log('Testing undefined roomName...');
        const response = await axios.post('http://localhost:3000/api/staff-bookings/test/roomname', {
            cinemaRoomId: "ROOM_001"
            // roomName không được gửi
        });
        console.log('Undefined roomName response:', response.data);
    } catch (error) {
        console.log('Undefined roomName error (expected):', error.response?.data?.message);
    }
}

// Chạy test
runAllTests(); 
const crypto = require('crypto');
const axios = require('axios');

// Configuration for MoMo
const config = {
    partnerCode: process.env.MOMO_PARTNER_CODE || "MOMO",
    accessKey: process.env.MOMO_ACCESS_KEY || "F8BBA842ECF85",
    secretKey: process.env.MOMO_SECRET_KEY || "K951B6PE1waDMi640xX08PD3vg6EkVlz",
    endpoint: process.env.MOMO_ENDPOINT || "https://test-payment.momo.vn/v2/gateway/api/create",
    redirectUrl: process.env.MOMO_REDIRECT_URL || "http://localhost:3000/api/bookings/momo-return",
    ipnUrl: process.env.MOMO_IPN_URL || "http://localhost:3000/api/bookings/momo-ipn"
};

/**
 * Tạo URL thanh toán MoMo
 * @param {Object} payment - Thông tin thanh toán
 * @param {string} payment.bookingId - ID booking
 * @param {number} payment.amount - Số tiền (VND)
 * @param {string} payment.orderInfo - Thông tin đơn hàng
 * @returns {Promise<string>} URL thanh toán MoMo
 */
exports.createPaymentUrl = async (payment) => {
    try {
        const { bookingId, amount, orderInfo } = payment;

        // Tạo orderId và requestId duy nhất
        const orderId = `BOOKING_${bookingId}_${Date.now()}`;
        const requestId = orderId;

        // Tham số cho MoMo
        const requestBody = {
            partnerCode: config.partnerCode,
            partnerName: "Movie Theater",
            storeId: "MomoTestStore",
            requestId: requestId,
            amount: Math.round(amount),
            orderId: orderId,
            orderInfo: orderInfo || `Thanh toan dat ve phim ${bookingId}`,
            redirectUrl: config.redirectUrl,
            ipnUrl: config.ipnUrl,
            lang: 'vi',
            requestType: "payWithATM",
            autoCapture: true,
            extraData: JSON.stringify({ bookingId: bookingId })
        };

        // Tạo chữ ký
        const rawSignature = `accessKey=${config.accessKey}&amount=${requestBody.amount}&extraData=${requestBody.extraData}&ipnUrl=${requestBody.ipnUrl}&orderId=${requestBody.orderId}&orderInfo=${requestBody.orderInfo}&partnerCode=${requestBody.partnerCode}&redirectUrl=${requestBody.redirectUrl}&requestId=${requestBody.requestId}&requestType=${requestBody.requestType}`;

        const signature = crypto
            .createHmac('sha256', config.secretKey)
            .update(rawSignature)
            .digest('hex');

        requestBody.signature = signature;

        console.log('[MoMo] Request body:', requestBody);
        console.log('[MoMo] Raw signature:', rawSignature);
        console.log('[MoMo] Signature:', signature);

        // Gửi request đến MoMo
        const response = await axios.post(config.endpoint, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('[MoMo] Response:', response.data);

        if (response.data.resultCode === 0) {
            return {
                success: true,
                payUrl: response.data.payUrl,
                orderId: orderId,
                requestId: requestId
            };
        } else {
            throw new Error(`MoMo Error: ${response.data.message}`);
        }

    } catch (error) {
        console.error('[MoMo] Error creating payment URL:', error);
        throw error;
    }
};

/**
 * Xác thực callback từ MoMo
 * @param {Object} momoParams - Tham số từ MoMo
 * @returns {boolean} Kết quả xác thực
 */
exports.verifyCallback = (momoParams) => {
    try {
        const {
            partnerCode,
            orderId,
            requestId,
            amount,
            orderInfo,
            orderType,
            transId,
            resultCode,
            message,
            payType,
            responseTime,
            extraData,
            signature
        } = momoParams;

        // Tạo raw signature để verify
        const rawSignature = `accessKey=${config.accessKey}&amount=${amount}&extraData=${extraData}&message=${message}&orderId=${orderId}&orderInfo=${orderInfo}&orderType=${orderType}&partnerCode=${partnerCode}&payType=${payType}&requestId=${requestId}&responseTime=${responseTime}&resultCode=${resultCode}&transId=${transId}`;

        const expectedSignature = crypto
            .createHmac('sha256', config.secretKey)
            .update(rawSignature)
            .digest('hex');

        console.log('[MoMo Verify] Raw signature:', rawSignature);
        console.log('[MoMo Verify] Expected signature:', expectedSignature);
        console.log('[MoMo Verify] Received signature:', signature);
        console.log('[MoMo Verify] Signature match:', expectedSignature === signature);

        return expectedSignature === signature;
    } catch (error) {
        console.error('[MoMo] Error verifying callback:', error);
        return false;
    }
};

/**
 * Parse booking ID từ orderId hoặc extraData
 * @param {string} orderId - Order ID từ MoMo
 * @param {string} extraData - Extra data từ MoMo
 * @returns {string|null} Booking ID
 */
exports.parseBookingId = (orderId, extraData) => {
    try {
        // Thử parse từ extraData trước
        if (extraData) {
            const parsed = JSON.parse(extraData);
            if (parsed.bookingId) {
                return parsed.bookingId;
            }
        }

        // Nếu không có, parse từ orderId
        // Format: BOOKING_{bookingId}_{timestamp}
        const match = orderId.match(/^BOOKING_([^_]+)_/);
        return match ? match[1] : null;
    } catch (error) {
        console.error('[MoMo] Error parsing booking ID:', error);
        return null;
    }
};

/**
 * Kiểm tra trạng thái giao dịch MoMo
 * @param {Object} params - Tham số kiểm tra
 * @returns {Promise<Object>} Kết quả kiểm tra
 */
exports.queryTransaction = async (params) => {
    try {
        const { orderId, requestId } = params;

        const requestBody = {
            partnerCode: config.partnerCode,
            requestId: requestId,
            orderId: orderId,
            lang: 'vi'
        };

        // Tạo chữ ký cho query
        const rawSignature = `accessKey=${config.accessKey}&orderId=${orderId}&partnerCode=${config.partnerCode}&requestId=${requestId}`;

        const signature = crypto
            .createHmac('sha256', config.secretKey)
            .update(rawSignature)
            .digest('hex');

        requestBody.signature = signature;

        const queryEndpoint = "https://test-payment.momo.vn/v2/gateway/api/query";
        const response = await axios.post(queryEndpoint, requestBody, {
            headers: {
                'Content-Type': 'application/json'
            }
        });

        return response.data;
    } catch (error) {
        console.error('[MoMo] Error querying transaction:', error);
        throw error;
    }
}; 
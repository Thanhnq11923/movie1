const crypto = require('crypto');
const moment = require('moment');

// Configuration for VNPay
const config = {
    vnp_TmnCode: process.env.VNP_TMN_CODE || "4LCL7FRS",
    vnp_HashSecret: process.env.VNP_HASH_SECRET || "F64VDQDFAPB4NHRFNSFTMJTZDIZS59NZ",
    vnp_Url: process.env.VNP_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
    vnp_ReturnUrl: process.env.VNP_RETURN_URL || "http://localhost:3000/api/bookings/vnpay-return"
};

exports.createPaymentUrl = (payment) => {
    const { bookingId, amount, orderInfo, ipAddr, txnRef } = payment;

    const createDate = moment().format('YYYYMMDDHHmmss');
    const amountInt = Math.round(amount * 100);

    console.log('[VNPay] TxnRef used:', txnRef);

    const vnpParams = {};
    vnpParams['vnp_Version'] = '2.1.0';
    vnpParams['vnp_Command'] = 'pay';
    vnpParams['vnp_TmnCode'] = config.vnp_TmnCode;
    vnpParams['vnp_Locale'] = 'vn';
    vnpParams['vnp_CurrCode'] = 'VND';
    vnpParams['vnp_TxnRef'] = txnRef; // Sử dụng txnRef được truyền vào
    vnpParams['vnp_OrderInfo'] = orderInfo || 'Thanh_toan_don_hang';
    vnpParams['vnp_OrderType'] = 'billpayment';
    vnpParams['vnp_Amount'] = amountInt;
    vnpParams['vnp_ReturnUrl'] = config.vnp_ReturnUrl; // Đảm bảo trỏ về backend
    vnpParams['vnp_IpAddr'] = ipAddr || '127.0.0.1';
    vnpParams['vnp_CreateDate'] = createDate;

    const sortedParams = sortObject(vnpParams);

    const signData = [];
    for (const key in sortedParams) {
        signData.push(`${key}=${encodeURIComponent(sortedParams[key])}`);
    }

    const stringToSign = signData.join('&');
    const secureHash = hmacSHA512(stringToSign, config.vnp_HashSecret);

    console.log('[VNPay] Sign data:', stringToSign);
    console.log('[VNPay] Secure hash:', secureHash);

    sortedParams['vnp_SecureHash'] = secureHash;

    const vnpUrl = `${config.vnp_Url}?${stringifyParams(sortedParams)}`;
    console.log('[VNPay] Payment URL:', vnpUrl);

    return vnpUrl;
};

exports.verifyReturnUrl = (vnpParams) => {
    const secureHash = vnpParams['vnp_SecureHash'];

    const params = { ...vnpParams };
    delete params['vnp_SecureHash'];
    if (params['vnp_SecureHashType']) {
        delete params['vnp_SecureHashType'];
    }

    const sortedParams = sortObject(params);

    console.log('[VNPay Verify] Query params:', sortedParams);

    const signData = [];
    for (const key in sortedParams) {
        signData.push(`${key}=${encodeURIComponent(sortedParams[key])}`);
    }

    const stringToVerify = signData.join('&');
    const calculatedHash = hmacSHA512(stringToVerify, config.vnp_HashSecret);

    console.log('[VNPay Verify] Sign data:', stringToVerify);
    console.log('[VNPay Verify] Calculated hash:', calculatedHash);
    console.log('[VNPay Verify] Received hash:', secureHash);

    return calculatedHash === secureHash;
};

exports.parseBookingId = (txnRef, bankTranNo, transDate) => {
    console.log(`Transaction reference: ${txnRef}, Bank transaction: ${bankTranNo}, Date: ${transDate}`);
    return txnRef;
};

function sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();

    for (const key of keys) {
        if (obj[key] !== null && obj[key] !== undefined && obj[key] !== '') {
            sorted[key] = obj[key];
        }
    }

    return sorted;
}

function hmacSHA512(data, secret) {
    const hmac = crypto.createHmac('sha512', secret);
    return hmac.update(Buffer.from(data, 'utf-8')).digest('hex');
}

function stringifyParams(params) {
    const result = [];
    for (const key in params) {
        result.push(`${key}=${encodeURIComponent(params[key])}`);
    }
    return result.join('&');
}
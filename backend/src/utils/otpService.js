const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

// Generate OTP secret
const generateOTPSecret = () => {
    return speakeasy.generateSecret({
        length: 20,
        name: 'Your App Name'
    });
};

// Generate QR code for OTP setup
const generateQRCode = async (otpauth_url) => {
    try {
        return await QRCode.toDataURL(otpauth_url);
    } catch (error) {
        console.error('Error generating QR code:', error);
        throw error;
    }
};

// Verify OTP token
const verifyOTPToken = (secret, token) => {
    return speakeasy.totp.verify({
        secret: secret,
        encoding: 'base32',
        token: token,
        window: 1 // Allow 30 seconds clock skew
    });
};

// Generate temporary OTP for password reset
const generateTemporaryOTP = () => {
    return speakeasy.totp({
        secret: speakeasy.generateSecret().base32,
        digits: 6,
        step: 300 // 5 minutes
    });
};

module.exports = {
    generateOTPSecret,
    generateQRCode,
    verifyOTPToken,
    generateTemporaryOTP
}; 
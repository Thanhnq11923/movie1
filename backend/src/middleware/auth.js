const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware: verify JWT
exports.authenticate = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }
    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ success: false, message: 'Invalid token' });
    }
};

// Middleware: check admin role
exports.isAdmin = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user || user.roleId.toString() !== process.env.ADMIN_ROLE_ID) {
            return res.status(403).json({ success: false, message: 'Admin access required' });
        }
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error checking admin role', error: error.message });
    }
};

exports.isStaff = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user || user.roleId.toString() !== process.env.STAFF_ROLE_ID) {
            return res.status(403).json({ success: false, message: 'Staff access required' });
        }
        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error checking staff role', error: error.message });
    }
};

exports.isAdminOrStaff = async (req, res, next) => {
    try {
        const user = await User.findById(req.user.userId);
        const roleId = user?.roleId?.toString();

        if (!user || (roleId !== process.env.ADMIN_ROLE_ID && roleId !== process.env.STAFF_ROLE_ID)) {
            return res.status(403).json({ success: false, message: 'Admin or Staff access required' });
        }

        next();
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Error checking roles', error: error.message });
    }
};


// Middleware: check specific permission
exports.hasPermission = (permission) => {
    return async (req, res, next) => {
        try {
            const user = await User.findById(req.user.userId).populate('roleId');
            if (!user || !user.roleId.permissions.includes(permission)) {
                return res.status(403).json({ success: false, message: `Required permission: ${permission}` });
            }
            next();
        } catch (error) {
            return res.status(500).json({ success: false, message: 'Error checking permission', error: error.message });
        }
    };
};
const Role = require('../models/Role');
const mongoose = require('mongoose');

// Get all roles
exports.getAllRoles = async (req, res) => {
    try {
        const roles = await Role.find();
        res.status(200).json({
            success: true,
            count: roles.length,
            data: roles
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting roles',
            error: error.message
        });
    }
};

// Get single role
exports.getRole = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role ID format'
            });
        }

        const role = await Role.findById(req.params.id);

        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }

        res.status(200).json({
            success: true,
            data: role
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error getting role',
            error: error.message
        });
    }
};

// Create role
exports.createRole = async (req, res) => {
    try {
        const role = await Role.create(req.body);
        
        res.status(201).json({
            success: true,
            data: role
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error creating role',
                error: error.message
            });
        }
    }
};

// Update role
exports.updateRole = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role ID format'
            });
        }

        const role = await Role.findByIdAndUpdate(
            req.params.id, 
            req.body, 
            { new: true, runValidators: true }
        );

        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }

        res.status(200).json({
            success: true,
            data: role
        });
    } catch (error) {
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map(val => val.message);
            return res.status(400).json({
                success: false,
                message: messages
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Error updating role',
                error: error.message
            });
        }
    }
};

// Delete role
exports.deleteRole = async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role ID format'
            });
        }

        const role = await Role.findById(req.params.id);

        if (!role) {
            return res.status(404).json({
                success: false,
                message: 'Role not found'
            });
        }

        await role.remove();

        res.status(200).json({
            success: true,
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting role',
            error: error.message
        });
    }
};
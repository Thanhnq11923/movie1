const express = require("express");
const router = express.Router();
const { 
    getAllRoles, 
    getRole, 
    createRole, 
    updateRole, 
    deleteRole 
} = require("../controllers/roleController");
const { authenticate, hasPermission } = require("../middleware/auth");

// Tất cả các routes đều yêu cầu quyền Account Management
router.route("/")
    .get(authenticate, hasPermission("Account Management"), getAllRoles)
    .post(authenticate, hasPermission("Account Management"), createRole);

router.route("/:id")
    .get(authenticate, hasPermission("Account Management"), getRole)
    .put(authenticate, hasPermission("Account Management"), updateRole)
    .delete(authenticate, hasPermission("Account Management"), deleteRole);

module.exports = router;
const express = require("express");
const router = express.Router();
const promotionController = require("../controllers/promotionController");
const { authenticate, isAdmin } = require("../middleware/auth");

// Public routes
router.get("/", promotionController.getAllPromotions);
router.get("/code/:code", promotionController.getPromotionByCode);
router.post("/validate-code", promotionController.validatePromotionCode);
router.post("/:slug/share", promotionController.incrementShareCount);
router.get("/id/:id", promotionController.getPromotionById);
router.get("/:slug", promotionController.getPromotionBySlug);

// Admin routes (require authentication and admin role)
router.post("/", authenticate, isAdmin, promotionController.createPromotion);
router.put(
  "/:slug",
  authenticate,
  isAdmin,
  promotionController.updatePromotion
);
router.delete(
  "/:slug",
  authenticate,
  isAdmin,
  promotionController.deletePromotion
);

module.exports = router;

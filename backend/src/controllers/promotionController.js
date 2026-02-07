const Promotion = require("../models/Promotion");

// Get all promotions
exports.getAllPromotions = async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = "-createdAt" } = req.query;

    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: sort,
    };

    const promotions = await Promotion.find()
      .sort(options.sort)
      .limit(options.limit * 1)
      .skip((options.page - 1) * options.limit)
      .exec();

    const count = await Promotion.countDocuments();

    res.status(200).json({
      success: true,
      data: promotions,
      pagination: {
        currentPage: options.page,
        totalPages: Math.ceil(count / options.limit),
        totalItems: count,
        itemsPerPage: options.limit,
      },
    });
  } catch (error) {
    console.error("Get all promotions error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching promotions",
      error: error.message,
    });
  }
};

// Get promotion by slug
exports.getPromotionBySlug = async (req, res) => {
  try {
    const { slug } = req.params;

    const promotion = await Promotion.findOne({ slug });

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found",
      });
    }

    res.status(200).json({
      success: true,
      data: promotion,
    });
  } catch (error) {
    console.error("Get promotion by slug error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching promotion",
      error: error.message,
    });
  }
};

// Create new promotion
exports.createPromotion = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const {
      title,
      slug,
      image,
      description,
      content,
      code,
      discountType,
      discountValue,
      minAmount,
      maxDiscount,
      startDate,
      endDate,
      maxUsage,
      status = "active",
      category,
      applicableMovies = [],
      applicableProducts = [],
      userGroups = ["general"],
      related = [],
      shareCount = 0,
    } = req.body;

    // Check if promotion with same slug already exists
    const existingPromotion = await Promotion.findOne({
      $or: [{ slug }, { code }],
    });
    if (existingPromotion) {
      return res.status(400).json({
        success: false,
        message: "Promotion with this slug or code already exists",
      });
    }

    const promotion = new Promotion({
      title,
      slug,
      image,
      description,
      content,
      code,
      discountType,
      discountValue,
      minAmount,
      maxDiscount,
      startDate,
      endDate,
      maxUsage,
      status,
      category,
      applicableMovies,
      applicableProducts,
      userGroups,
      related,
      shareCount,
      createdBy: req.user.userId,
      updatedBy: req.user.userId,
    });

    await promotion.save();

    res.status(201).json({
      success: true,
      message: "Promotion created successfully",
      data: promotion,
    });
  } catch (error) {
    console.error("Create promotion error:", error);
    res.status(500).json({
      success: false,
      message: "Error creating promotion",
      error: error.message,
    });
  }
};

// Update promotion
exports.updatePromotion = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const { slug } = req.params;
    const updateData = req.body;

    // Find the current promotion first
    const currentPromotion = await Promotion.findOne({ slug });
    if (!currentPromotion) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found",
      });
    }

    // If slug or code is being updated, check if new value already exists in other promotions
    if ((updateData.slug && updateData.slug !== slug) || updateData.code) {
      const query = {};
      if (updateData.slug && updateData.slug !== slug) {
        query.slug = updateData.slug;
      }
      if (updateData.code) {
        query.code = updateData.code;
      }

      // Exclude current promotion from duplicate check
      const existingPromotion = await Promotion.findOne({
        $and: [
          { $or: Object.keys(query).map((key) => ({ [key]: query[key] })) },
          { _id: { $ne: currentPromotion._id } },
        ],
      });

      if (existingPromotion) {
        return res.status(400).json({
          success: false,
          message: "Promotion with this slug or code already exists",
        });
      }
    }

    // Add updatedBy field from authenticated user
    updateData.updatedBy = req.user.userId;

    const promotion = await Promotion.findOneAndUpdate({ slug }, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Promotion updated successfully",
      data: promotion,
    });
  } catch (error) {
    console.error("Update promotion error:", error);
    res.status(500).json({
      success: false,
      message: "Error updating promotion",
      error: error.message,
    });
  }
};

// Delete promotion
exports.deletePromotion = async (req, res) => {
  try {
    const { slug } = req.params;

    const promotion = await Promotion.findOneAndDelete({ slug });

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Promotion deleted successfully",
    });
  } catch (error) {
    console.error("Delete promotion error:", error);
    res.status(500).json({
      success: false,
      message: "Error deleting promotion",
      error: error.message,
    });
  }
};

// Increment share count
exports.incrementShareCount = async (req, res) => {
  try {
    const { slug } = req.params;

    const promotion = await Promotion.findOneAndUpdate(
      { slug },
      { $inc: { shareCount: 1 } },
      { new: true }
    );

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Share count incremented successfully",
      data: { shareCount: promotion.shareCount },
    });
  } catch (error) {
    console.error("Increment share count error:", error);
    res.status(500).json({
      success: false,
      message: "Error incrementing share count",
      error: error.message,
    });
  }
};

// Get promotion by code
exports.getPromotionByCode = async (req, res) => {
  try {
    const { code } = req.params;

    const promotion = await Promotion.findOne({ code });

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found",
      });
    }

    // Check if promotion is active and not expired
    const now = new Date();
    if (
      promotion.status !== "active" ||
      promotion.startDate > now ||
      promotion.endDate < now
    ) {
      return res.status(400).json({
        success: false,
        message: "Promotion is not available",
      });
    }

    res.status(200).json({
      success: true,
      data: promotion,
    });
  } catch (error) {
    console.error("Get promotion by code error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching promotion",
      error: error.message,
    });
  }
};

// Validate promotion code
exports.validatePromotionCode = async (req, res) => {
  try {
    const { code, amount, userId } = req.body;

    const promotion = await Promotion.findOne({ code });

    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "Invalid promotion code",
      });
    }

    // Check if promotion is active
    if (promotion.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Promotion is not active",
      });
    }

    // Check if promotion is within date range
    const now = new Date();
    const startDate = new Date(promotion.startDate);
    const endDate = new Date(promotion.endDate);

    console.log("Current time:", now);
    console.log("Promotion start date:", startDate);
    console.log("Promotion end date:", endDate);
    console.log("Is promotion active:", promotion.status);

    if (promotion.status !== "active") {
      return res.status(400).json({
        success: false,
        message: "Promotion is not active",
      });
    }

    if (startDate > now) {
      return res.status(400).json({
        success: false,
        message: "Promotion has not started yet",
      });
    }

    if (endDate < now) {
      return res.status(400).json({
        success: false,
        message: "Promotion has expired",
      });
    }

    // Check if usage limit exceeded
    if (promotion.currentUsage >= promotion.maxUsage) {
      return res.status(400).json({
        success: false,
        message: "Promotion usage limit exceeded",
      });
    }

    // Check minimum amount
    if (amount < promotion.minAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum amount required: ${promotion.minAmount}`,
      });
    }

    // Calculate discount
    let discount = 0;
    if (promotion.discountType === "percentage") {
      discount = (amount * promotion.discountValue) / 100;
      if (
        promotion.maxDiscount &&
        promotion.maxDiscount > 0 &&
        discount > promotion.maxDiscount
      ) {
        discount = promotion.maxDiscount;
      }
    } else {
      discount = promotion.discountValue;
    }

    res.status(200).json({
      success: true,
      message: "Promotion code is valid",
      data: {
        promotion: {
          _id: promotion._id,
          title: promotion.title,
          code: promotion.code,
          discountType: promotion.discountType,
          discountValue: promotion.discountValue,
          maxDiscount: promotion.maxDiscount,
        },
        discount,
        finalAmount: amount - discount,
      },
    });
  } catch (error) {
    console.error("Validate promotion code error:", error);
    res.status(500).json({
      success: false,
      message: "Error validating promotion code",
      error: error.message,
    });
  }
};

// Get promotion by id
exports.getPromotionById = async (req, res) => {
  try {
    const { id } = req.params;
    const promotion = await Promotion.findById(id);
    if (!promotion) {
      return res.status(404).json({
        success: false,
        message: "Promotion not found",
      });
    }
    res.status(200).json({
      success: true,
      data: promotion,
    });
  } catch (error) {
    console.error("Get promotion by id error:", error);
    res.status(500).json({
      success: false,
      message: "Error fetching promotion",
      error: error.message,
    });
  }
};

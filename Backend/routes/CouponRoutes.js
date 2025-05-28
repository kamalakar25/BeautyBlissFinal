const express = require("express");
const router = express.Router();
const { default: mongoose } = require("mongoose");
const User = require("../models/user");
const Coupon = require("../models/Coupon");

// Get all coupons
router.get("/", async (req, res) => {
  try {
    const coupons = await Coupon.find()
      .select("userId couponCode discount isUsed createdAt expiresAt")
      .lean();
    // console.log("Fetched coupons:", coupons.map((coupon) => coupon._id.toString()));
    res.status(200).json(coupons);
  } catch (error) {
    // console.error("Error fetching coupons:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Check coupon status for a user
router.post("/status", async (req, res) => {
    try {
      const { userId } = req.body;
  
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
  
      const orderCount = user.bookings.length; // Check embedded bookings array
      const coupon = await Coupon.findOne({ userId });
  
      res.status(200).json({
        isNewUser: orderCount === 0,
        couponClaimed: !!coupon,
        orderCount,
        coupon: coupon
          ? { code: coupon.couponCode, discount: coupon.discount }
          : null,
      });
    } catch (error) {
      // console.error("Error checking coupon status:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

// Create/Claim a coupon for a user
router.post("/claim", async (req, res) => {
    try {
      const { userId, couponCode, phone } = req.body;
  
      // Validate inputs
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        // console.error("Invalid userId format:", userId);
        return res.status(400).json({ message: "Invalid user ID format" });
      }
  
      if (!couponCode || typeof couponCode !== "string" || couponCode.trim() === "") {
        // console.error("Invalid couponCode:", couponCode);
        return res.status(400).json({ message: "Invalid coupon code" });
      }
  
      if (phone && !/^\+?\d{10,15}$/.test(phone)) {
        // console.error("Invalid phone number:", phone);
        return res.status(400).json({ message: "Invalid phone number format" });
      }
  
      // Check database connection
      if (mongoose.connection.readyState !== 1) {
        // console.error("MongoDB not connected:", mongoose.connection.readyState);
        return res.status(500).json({ message: "Database connection error" });
      }
  
      // Find user
      const user = await User.findById(userId);
      if (!user) {
        // console.error("User not found for userId:", userId);
        return res.status(404).json({ message: "User not found" });
      }
  
      // Check if user has bookings
      const orderCount = user.bookings.length;
      if (orderCount > 0) {
        // console.error("User is not new, has bookings:", orderCount);
        return res.status(400).json({ message: "Coupon only available for new users" });
      }
  
      // Check for existing coupon
      const existingCoupon = await Coupon.findOne({ userId });
      if (existingCoupon) {
        // console.error("Coupon already claimed for userId:", userId, existingCoupon);
        return res.status(400).json({ message: "Coupon already claimed" });
      }
  
      // Check for duplicate coupon code across all users
      const duplicateCoupon = await Coupon.findOne({ couponCode });
      if (duplicateCoupon) {
        // console.error("Coupon code already exists:", couponCode);
        return res.status(400).json({ message: "Coupon code already in use" });
      }
  
      // Create new coupon
      const newCoupon = new Coupon({
        userId,
        couponCode: couponCode.trim(),
        discount: 0.1, // Fixed 10% discount
        expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
      });
  
      await newCoupon.save();
      // console.log("Coupon created successfully:", {
      //   userId,
      //   couponCode,
      //   discount: newCoupon.discount,
      //   expiresAt: newCoupon.expiresAt,
      // });
  
      // Update user's phone if provided
      if (phone) {
        user.phone = phone;
        await user.save();
        // console.log("User phone updated:", { userId, phone });
      }
  
      res.status(201).json({
        message: "Coupon claimed successfully",
        coupon: {
          code: newCoupon.couponCode,
          discount: newCoupon.discount,
          expiresAt: newCoupon.expiresAt,
        },
      });
    } catch (error) {
      // console.error("Error claiming coupon:", {
      //   message: error.message,
      //   stack: error.stack,
      //   requestBody: req.body,
      // });
      res.status(500).json({
        message: "Server error",
        error: error.message,
        details: error.stack,
      });
    }
  });

// Validate a coupon
router.post("/validate", async (req, res) => {
  try {
    const { couponCode, userId } = req.body;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    if (!couponCode || typeof couponCode !== "string") {
      return res.status(400).json({ message: "Invalid coupon code" });
    }

    const coupon = await Coupon.findOne({
      couponCode,
      userId,
      isUsed: false,
    });

    if (!coupon) {
      return res.status(400).json({ message: "Invalid or expired coupon" });
    }

    if (new Date() > coupon.expiresAt) {
      return res.status(400).json({ message: "Coupon has expired" });
    }

    // console.log("Coupon validated:", coupon);
    res.status(200).json({
      message: "Coupon is valid",
      valid: true,
      discount: coupon.discount,
    });
  } catch (error) {
    // console.error("Error validating coupon:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Delete a coupon by ID
router.delete("/:id", async (req, res) => {
  try {
    const couponId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(couponId)) {
      return res.status(400).json({ message: "Invalid coupon ID format" });
    }

    const coupon = await Coupon.findByIdAndDelete(couponId);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    // console.log("Coupon deleted:", coupon);
    res.status(200).json({ message: "Coupon deleted successfully" });
  } catch (error) {
    // console.error("Error deleting coupon:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// Mark coupon as used after successful payment
router.post("/mark-used", async (req, res) => {
    try {
      const { couponCode, userId } = req.body;
  
      if (!mongoose.Types.ObjectId.isValid(userId)) {
        return res.status(400).json({ message: "Invalid user ID format" });
      }
  
      if (!couponCode || typeof couponCode !== "string") {
        return res.status(400).json({ message: "Invalid coupon code" });
      }
  
      const coupon = await Coupon.findOne({ couponCode, userId, isUsed: false });
      if (!coupon) {
        return res.status(400).json({ message: "Coupon not found or already used" });
      }
  
      coupon.isUsed = true;
      await coupon.save();
  
      // console.log("Coupon marked as used:", coupon);
      res.status(200).json({ message: "Coupon marked as used successfully" });
    } catch (error) {
      // console.error("Error marking coupon as used:", error);
      res.status(500).json({ message: "Server error" });
    }
  });

module.exports = router;

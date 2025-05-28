const mongoose = require('mongoose');

// Coupon Schema
const couponSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  couponCode: { type: String, required: true, unique: true },
  discount: { type: Number, default: 10 },
  isUsed: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  expiresAt: {
    type: Date,
    default: () => Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days expiry
  },
});

const Coupon = mongoose.model("Coupon", couponSchema);
module.exports = Coupon;

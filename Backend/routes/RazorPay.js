// const express = require('express');
// const Razorpay = require('razorpay');
// const crypto = require('crypto');
// const User = require('../models/user'); // Adjust path to your User model
// require('dotenv').config();

// const router = express.Router();

// // Initialize Razorpay instance
// const razorpay = new Razorpay({
//   key_id: process.env.RAZORPAY_KEY_ID,
//   key_secret: process.env.RAZORPAY_SECRET,
// });

// // // Create a new booking and Razorpay order
// router.post('/order', async (req, res) => {
//   try {
//     const {
//       parlorEmail,
//       parlorName,
//       name,
//       date,
//       time,
//       service,
//       amount,
//       total_amount,
//       favoriteEmployee,
//       relatedServices,
//       userEmail,
//     } = req.body;

//     // Validate required fields
//     if (
//       !userEmail ||
//       !parlorEmail ||
//       !parlorName ||
//       !name ||
//       !date ||
//       !time ||
//       !service ||
//       !amount ||
//       !total_amount
//     ) {
//       // console.error('Missing required fields:', req.body);
//       return res
//         .status(400)
//         .json({ error: 'Missing required fields', missing: req.body });
//     }

//     // Validate numeric fields
//     if (
//       isNaN(amount) ||
//       isNaN(total_amount) ||
//       amount <= 0 ||
//       total_amount <= 0
//     ) {
//       // console.error('Invalid amount or total_amount:', {
//       //   amount,
//       //   total_amount,
//       // });
//       return res.status(400).json({ error: 'Invalid amount or total_amount' });
//     }

//     // Calculate duration: 60 minutes base + 30 minutes per additional service
//     const baseDuration = 60; // Base service duration in minutes
//     const additionalDuration = (relatedServices || []).length * 30; // 30 minutes per service
//     const totalDuration = baseDuration + additionalDuration;

//     // Validate date
//   if (!date || isNaN(new Date(date).getTime())) {
//     // console.error('Invalid date:', date);
//     return res.status(400).json({ error: 'Invalid date format' });
//   }

//     // Validate time slot availability
//     const user = await User.findOne({ email: userEmail });
//     if (!user) {
//       // console.error('User not found:', userEmail);
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const existingBookings = user.bookings.filter((booking) => {
//       // Check if booking.date is a valid Date object
//       if (
//         !booking.date ||
//         !(booking.date instanceof Date) ||
//         isNaN(booking.date.getTime())
//       ) {
//         // console.warn('Invalid booking date found:', booking);
//         return false; // Skip bookings with invalid dates
//       }

//       return (
//         booking.favoriteEmployee === favoriteEmployee &&
//         booking.date.toISOString().split('T')[0] ===
//           new Date(date).toISOString().split('T')[0]
//       );
//     });

//     // Convert time to minutes for overlap checking
//     const timeToMinutes = (timeStr) => {
//       const [start] = timeStr.split('-');
//       const [hours, minutes] = start.split(':').map(Number);
//       return hours * 60 + minutes;
//     };

//     const slotStart = timeToMinutes(time);
//     const slotEnd = slotStart + totalDuration;

//     // Check for overlaps
//     for (const booking of existingBookings) {
//       const bookedStart = timeToMinutes(booking.time);
//       const bookedEnd = bookedStart + (booking.duration || 60); // Default to 60 if duration is missing

//       if (!(slotEnd <= bookedStart || slotStart >= bookedEnd)) {
//         // console.error('Time slot overlap detected:', {
//         //   time,
//         //   duration: totalDuration,
//         //   existingBooking: booking,
//         // });
//         return res
//           .status(400)
//           .json({
//             error:
//               'Selected time slot is not available for the required duration',
//           });
//       }
//     }

//     // Create booking object
//     const bookingData = {
//       parlorEmail,
//       parlorName,
//       name,
//       date: new Date(date),
//       time,
//       service,
//       amount: Number(amount),
//       total_amount: Number(total_amount),
//       Payment_Mode: 'PENDING',
//       favoriteEmployee,
//       relatedServices: relatedServices || [],
//       paymentStatus: 'PENDING',
//       duration: totalDuration, // Add duration to booking
//     };

//     // console.log('Booking data to save:', bookingData);

//     // Add booking to user
//     user.bookings.push(bookingData);
//     const savedUser = await user.save();

//     // Get the newly created booking ID
//     const bookingId = savedUser.bookings[savedUser.bookings.length - 1]._id;

//     // Verify the saved booking in MongoDB
//     const savedBooking = savedUser.bookings.find(
//       (b) => b._id.toString() === bookingId.toString()
//     );
//     // console.log('Saved booking in MongoDB:', savedBooking);

//     // Create Razorpay order
//     const options = {
//       amount: Math.round(amount * 100), // Use amount instead of total_amount
//       currency: 'INR',
//       receipt: `booking_${bookingId}`,
//       notes: { bookingId, userEmail },
//     };

//     const order = await razorpay.orders.create(options);
//     if (!order) {
//       // console.error('Failed to create Razorpay order');
//       return res.status(500).json({ error: 'Failed to create order' });
//     }

//     // Update booking with orderId
//     savedUser.bookings.id(bookingId).orderId = order.id;
//     await savedUser.save();

//     // Verify the updated booking
//     const updatedUser = await User.findOne({ email: userEmail });
//     const updatedBooking = updatedUser.bookings.find(
//       (b) => b._id.toString() === bookingId.toString()
//     );
//     // console.log('Booking after adding orderId:', updatedBooking);

//     res.json({ order, bookingId, booking: updatedBooking });
//   } catch (err) {
//     // console.error('Error in /order:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// router.post('/order/validate', async (req, res) => {
//   try {
//     const {
//       pin,
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       userEmail,
//       bookingId,
//     } = req.body;

//     // Validate required fields
//     if (
//       !pin ||
//       !razorpay_order_id ||
//       !razorpay_payment_id ||
//       !userEmail ||
//       !bookingId
//     ) {
//       // console.error('Missing required fields:', {
//       //   pin,
//       //   razorpay_order_id,
//       //   razorpay_payment_id,
//       //   razorpay_signature,
//       //   userEmail,
//       //   bookingId,
//       // });
//       return res.status(400).json({
//         error: 'Missing required fields',
//         missing: {
//           pin,
//           razorpay_order_id,
//           razorpay_payment_id,
//           razorpay_signature,
//           userEmail,
//           bookingId,
//         },
//       });
//     }

//     // For failed payments, signature may be empty
//     let paymentStatus = 'PAID';
//     let failureReason = null;
//     let paymentMethod = null;

//     // Verify signature for successful payments
//     if (razorpay_signature) {
//       const sha = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);
//       sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
//       const digest = sha.digest('hex');

//       // console.log('Generated digest:', digest);
//       // console.log('Provided signature:', razorpay_signature);

//       if (digest !== razorpay_signature) {
//         // console.error('Signature verification failed');
//         paymentStatus = 'FAILED';
//         failureReason = 'Invalid signature';
//       }
//     } else {
//       paymentStatus = 'FAILED';
//       failureReason =
//         req.body.failureReason || 'Payment failed (no signature provided)';
//     }

//     // Fetch payment details from Razorpay
//     let payment;
//     try {
//       payment = await razorpay.payments.fetch(razorpay_payment_id);
//       paymentMethod = payment.method; // e.g., 'upi', 'card', 'netbanking', 'wallet'
//     } catch (err) {
//       // console.error('Error fetching payment details:', err);
//       paymentStatus = 'FAILED';
//       failureReason =
//         err.error?.description || 'Failed to fetch payment details';
//     }

//     // Update booking with payment details
//     const user = await User.findOneAndUpdate(
//       { email: userEmail, 'bookings._id': bookingId },
//       {
//         $set: {
//           'bookings.$.pin': pin,
//           'bookings.$.paymentStatus':
//             paymentStatus === 'PAID' && payment?.status === 'captured'
//               ? 'PAID'
//               : 'FAILED',
//           'bookings.$.transactionId': razorpay_payment_id,
//           'bookings.$.orderId': razorpay_order_id,
//           'bookings.$.Payment_Mode': paymentMethod || 'UNKNOWN',
//           'bookings.$.failureReason':
//             failureReason ||
//             (payment?.status !== 'captured'
//               ? payment?.error_description || 'Payment failed'
//               : null),
//         },
//       },
//       { new: true }
//     );

//     if (!user) {
//       // console.error('User or booking not found:', { userEmail, bookingId });
//       return res.status(404).json({ error: 'User or booking not found' });
//     }

//     // Log the updated booking to verify fields
//     const updatedBooking = user.bookings.find(
//       (b) => b._id.toString() === bookingId
//     );
//     // console.log('Updated booking in MongoDB:', updatedBooking);

//     res.json({
//       message:
//         paymentStatus === 'PAID'
//           ? 'Payment verified successfully'
//           : 'Payment failed',
//       orderId: razorpay_order_id,
//       paymentId: razorpay_payment_id,
//       bookingId,
//       paymentStatus,
//       paymentMethod: paymentMethod || 'UNKNOWN',
//       failureReason,
//     });
//   } catch (err) {
//     // console.error('Error in /order/validate:', err);
//     res.status(500).json({ error: err.message, details: err.stack });
//   }
// });

// router.get('/verify', async (req, res) => {
//   try {
//     const { order_id } = req.query;
//     if (!order_id) {
//       return res.status(400).json({ error: 'Order ID is required' });
//     }

//     // Find booking by orderId
//     const user = await User.findOne({ 'bookings.orderId': order_id });
//     if (!user) {
//       // console.error('Booking not found for order_id:', order_id);
//       return res.status(404).json({ error: 'Booking not found' });
//     }

//     const booking = user.bookings.find((b) => b.orderId === order_id);
//     if (!booking) {
//       // console.error(
//       //   'Booking not found in user bookings for order_id:',
//       //   order_id
//       // );
//       return res.status(404).json({ error: 'Booking not found' });
//     }

//     // Fetch order details from Razorpay
//     let order;
//     let paymentDetails = {};
//     try {
//       order = await razorpay.orders.fetch(order_id);
//       if (booking.transactionId) {
//         paymentDetails = await razorpay.payments.fetch(booking.transactionId);
//       }
//     } catch (err) {
//       // console.error('Error fetching Razorpay details:', err);
//     }

//     // Log the booking data being returned
//     // console.log('Booking data for order_id:', order_id, booking);

//     const response = {
//       data: {
//         paymentStatus: booking.paymentStatus,
//         transactionId: booking.transactionId || null,
//         orderId: booking.orderId,
//         amount: booking.amount,
//         total_amount: booking.total_amount,
//         Payment_Mode: booking.Payment_Mode || 'UNKNOWN',
//         createdAt: booking.createdAt,
//         parlorName: booking.parlorName,
//         service: booking.service,
//         date: booking.date,
//         time: booking.time,
//         name: booking.name,
//         favoriteEmployee: booking.favoriteEmployee,
//         relatedServices: booking.relatedServices || [],
//         failureReason: booking.failureReason || null,
//         currency: order?.currency || 'INR',
//       },
//     };

//     res.json(response);
//   } catch (err) {
//     // console.error('Error in /verify:', err);
//     res.status(500).json({ error: err.message });
//   }
// });

// // New route for remaining amount payment
// router.post('/remaining-order', async (req, res) => {
//   try {
//     const { userEmail, bookingId, amount } = req.body;

//     // Minimal validation: ensure required fields exist
//     if (!userEmail || !bookingId || !amount) {
//       return res.status(400).json({ error: 'userEmail, bookingId, and amount are required' });
//     }

//     // Validate amount is a positive number
//     if (isNaN(amount) || amount <= 0) {
//       return res.status(400).json({ error: 'Invalid amount' });
//     }

//     // Find user and booking
//     const user = await User.findOne({ email: userEmail });
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const booking = user.bookings.id(bookingId);
//     if (!booking) {
//       return res.status(404).json({ error: 'Booking not found' });
//     }

//     // Create Razorpay order
//     const options = {
//       amount: Math.round(amount * 100), // Convert to paise
//       currency: 'INR',
//       receipt: `remaining_${bookingId}`,
//       notes: { bookingId, userEmail },
//     };

//     const order = await razorpay.orders.create(options);
//     if (!order) {
//       return res.status(500).json({ error: 'Failed to create order' });
//     }

//     // Update booking with new orderId
//     booking.orderId = order.id;
//     await user.save();

//     // Return order and booking details
//     res.json({ order, bookingId, booking });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// // Existing routes continued...
// router.post('/order', async (req, res) => {
//   try {
//     const {
//       parlorEmail,
//       parlorName,
//       name,
//       date,
//       time,
//       service,
//       amount,
//       total_amount,
//       favoriteEmployee,
//       relatedServices,
//       userEmail,
//     } = req.body;

//     if (
//       !userEmail ||
//       !parlorEmail ||
//       !parlorName ||
//       !name ||
//       !date ||
//       !time ||
//       !service ||
//       !amount ||
//       !total_amount
//     ) {
//       return res
//         .status(400)
//         .json({ error: 'Missing required fields', missing: req.body });
//     }

//     if (
//       isNaN(amount) ||
//       isNaN(total_amount) ||
//       amount <= 0 ||
//       total_amount <= 0
//     ) {
//       return res.status(400).json({ error: 'Invalid amount or total_amount' });
//     }

//     const baseDuration = 60;
//     const additionalDuration = (relatedServices || []).length * 30;
//     const totalDuration = baseDuration + additionalDuration;

//     if (!date || isNaN(new Date(date).getTime())) {
//       return res.status(400).json({ error: 'Invalid date format' });
//     }

//     const user = await User.findOne({ email: userEmail });
//     if (!user) {
//       return res.status(404).json({ error: 'User not found' });
//     }

//     const existingBookings = user.bookings.filter((booking) => {
//       if (
//         !booking.date ||
//         !(booking.date instanceof Date) ||
//         isNaN(booking.date.getTime())
//       ) {
//         return false;
//       }

//       return (
//         booking.favoriteEmployee === favoriteEmployee &&
//         booking.date.toISOString().split('T')[0] ===
//           new Date(date).toISOString().split('T')[0]
//       );
//     });

//     const timeToMinutes = (timeStr) => {
//       const [start] = timeStr.split('-');
//       const [hours, minutes] = start.split(':').map(Number);
//       return hours * 60 + minutes;
//     };

//     const slotStart = timeToMinutes(time);
//     const slotEnd = slotStart + totalDuration;

//     for (const booking of existingBookings) {
//       const bookedStart = timeToMinutes(booking.time);
//       const bookedEnd = bookedStart + (booking.duration || 60);

//       if (!(slotEnd <= bookedStart || slotStart >= bookedEnd)) {
//         return res
//           .status(400)
//           .json({
//             error:
//               'Selected time slot is not available for the required duration',
//           });
//       }
//     }

//     const bookingData = {
//       parlorEmail,
//       parlorName,
//       name,
//       date: new Date(date),
//       time,
//       service,
//       amount: Number(amount),
//       total_amount: Number(total_amount),
//       Payment_Mode: 'PENDING',
//       favoriteEmployee,
//       relatedServices: relatedServices || [],
//       paymentStatus: 'PENDING',
//       duration: totalDuration,
//     };

//     user.bookings.push(bookingData);
//     const savedUser = await user.save();

//     const bookingId = savedUser.bookings[savedUser.bookings.length - 1]._id;

//     const savedBooking = savedUser.bookings.find(
//       (b) => b._id.toString() === bookingId.toString()
//     );

//     const options = {
//       amount: Math.round(amount * 100),
//       currency: 'INR',
//       receipt: `booking_${bookingId}`,
//       notes: { bookingId, userEmail },
//     };

//     const order = await razorpay.orders.create(options);
//     if (!order) {
//       return res.status(500).json({ error: 'Failed to create order' });
//     }

//     savedUser.bookings.id(bookingId).orderId = order.id;
//     await savedUser.save();

//     const updatedUser = await User.findOne({ email: userEmail });
//     const updatedBooking = updatedUser.bookings.find(
//       (b) => b._id.toString() === bookingId.toString()
//     );

//     res.json({ order, bookingId, booking: updatedBooking });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// router.post('/order/validate', async (req, res) => {
//   try {
//     const {
//       pin,
//       razorpay_order_id,
//       razorpay_payment_id,
//       razorpay_signature,
//       userEmail,
//       bookingId,
//     } = req.body;

//     // Validate required fields
//     if (
//       !pin ||
//       !razorpay_order_id ||
//       !razorpay_payment_id ||
//       !userEmail ||
//       !bookingId
//     ) {
//       // console.error('Missing required fields:', {
//       //   pin,
//       //   razorpay_order_id,
//       //   razorpay_payment_id,
//       //   razorpay_signature,
//       //   userEmail,
//       //   bookingId,
//       // });
//       return res.status(400).json({
//         error: 'Missing required fields',
//         missing: {
//           pin,
//           razorpay_order_id,
//           razorpay_payment_id,
//           razorpay_signature,
//           userEmail,
//           bookingId,
//         },
//       });
//     }

//     // For failed payments, signature may be empty
//     let paymentStatus = 'PAID';
//     let failureReason = null;
//     let paymentMethod = null;

//     // Verify signature for successful payments
//     if (razorpay_signature) {
//       const sha = crypto.createHmac('sha256', process.env.RAZORPAY_SECRET);
//       sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
//       const digest = sha.digest('hex');

//       // console.log('Generated digest:', digest);
//       // console.log('Provided signature:', razorpay_signature);

//       if (digest !== razorpay_signature) {
//         // console.error('Signature verification failed');
//         paymentStatus = 'FAILED';
//         failureReason = 'Invalid signature';
//       }
//     } else {
//       paymentStatus = 'FAILED';
//       failureReason =
//         req.body.failureReason || 'Payment failed (no signature provided)';
//     }

//     // Fetch payment details from Razorpay
//     let payment;
//     try {
//       payment = await razorpay.payments.fetch(razorpay_payment_id);
//       paymentMethod = payment.method; // e.g., 'upi', 'card', 'netbanking', 'wallet'
//     } catch (err) {
//       // console.error('Error fetching payment details:', err);
//       paymentStatus = 'FAILED';
//       failureReason =
//         err.error?.description || 'Failed to fetch payment details';
//     }

//     // Update booking with payment details
//     const user = await User.findOneAndUpdate(
//       { email: userEmail, 'bookings._id': bookingId },
//       {
//         $set: {
//           'bookings.$.pin': pin,
//           'bookings.$.paymentStatus':
//             paymentStatus === 'PAID' && payment?.status === 'captured'
//               ? 'PAID'
//               : 'FAILED',
//           'bookings.$.transactionId': razorpay_payment_id,
//           'bookings.$.orderId': razorpay_order_id,
//           'bookings.$.Payment_Mode': paymentMethod || 'UNKNOWN',
//           'bookings.$.failureReason':
//             failureReason ||
//             (payment?.status !== 'captured'
//               ? payment?.error_description || 'Payment failed'
//               : null),
//         },
//       },
//       { new: true }
//     );

//     if (!user) {
//       // console.error('User or booking not found:', { userEmail, bookingId });
//       return res.status(404).json({ error: 'User or booking not found' });
//     }

//     // Log the updated booking to verify fields
//     const updatedBooking = user.bookings.find(
//       (b) => b._id.toString() === bookingId
//     );
//     // console.log('Updated booking in MongoDB:', updatedBooking);

//     res.json({
//       message:
//         paymentStatus === 'PAID'
//           ? 'Payment verified successfully'
//           : 'Payment failed',
//       orderId: razorpay_order_id,
//       paymentId: razorpay_payment_id,
//       bookingId,
//       paymentStatus,
//       paymentMethod: paymentMethod || 'UNKNOWN',
//       failureReason,
//     });
//   } catch (err) {
//     // console.error('Error in /order/validate:', err);
//     res.status(500).json({ error: err.message, details: err.stack });
//   }
// });

// router.get('/verify', async (req, res) => {
//   try {
//     const { order_id } = req.query;
//     if (!order_id) {
//       return res.status(400).json({ error: 'Order ID is required' });
//     }

//     const user = await User.findOne({ 'bookings.orderId': order_id });
//     if (!user) {
//       return res.status(404).json({ error: 'Booking not found' });
//     }

//     const booking = user.bookings.find((b) => b.orderId === order_id);
//     if (!booking) {
//       return res.status(404).json({ error: 'Booking not found' });
//     }

//     let order;
//     let paymentDetails = {};
//     try {
//       order = await razorpay.orders.fetch(order_id);
//       if (booking.transactionId) {
//         paymentDetails = await razorpay.payments.fetch(booking.transactionId);
//       }
//     } catch (err) {
//     }

//     const response = {
//       data: {
//         paymentStatus: booking.paymentStatus,
//         transactionId: booking.transactionId || null,
//         orderId: booking.orderId,
//         amount: booking.amount,
//         total_amount: booking.total_amount,
//         Payment_Mode: booking.Payment_Mode || 'UNKNOWN',
//         createdAt: booking.createdAt,
//         parlorName: booking.parlorName,
//         service: booking.service,
//         date: booking.date,
//         time: booking.time,
//         name: booking.name,
//         favoriteEmployee: booking.favoriteEmployee,
//         relatedServices: booking.relatedServices || [],
//         failureReason: booking.failureReason || null,
//         currency: order?.currency || 'INR',
//       },
//     };

//     res.json(response);
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

// module.exports = router;

const express = require("express");
const Razorpay = require("razorpay");
const crypto = require("crypto");
const User = require("../models/user");
const Coupon = require("../models/Coupon");
require("dotenv").config();

const router = express.Router();

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_SECRET,
});

// Route: Create order for initial booking
router.post("/order", async (req, res) => {
  try {
    const {
      parlorEmail,
      parlorName,
      name,
      date,
      time,
      service,
      amount,
      total_amount,
      favoriteEmployee,
      relatedServices,
      userEmail,
      couponCode, // New: Coupon code
      discountAmount, // New: Discount amount
    } = req.body;

    // Validate required fields
    if (
      !userEmail ||
      !parlorEmail ||
      !parlorName ||
      !name ||
      !date ||
      !time ||
      !service ||
      !amount ||
      !total_amount
    ) {
      // console.error("Missing required fields:", req.body);
      return res
        .status(400)
        .json({ error: "Missing required fields", missing: req.body });
    }

    // Validate numeric fields
    if (
      isNaN(amount) ||
      isNaN(total_amount) ||
      amount <= 0 ||
      total_amount <= 0
    ) {
      // console.error("Invalid amount or total_amount:", {
      //   amount,
      //   total_amount,
      // });
      return res.status(400).json({ error: "Invalid amount or total_amount" });
    }

    // Validate coupon if provided
    if (couponCode) {
      if (!discountAmount || isNaN(discountAmount) || discountAmount < 0) {
        // console.error("Invalid discountAmount:", discountAmount);
        return res.status(400).json({ error: "Invalid discount amount" });
      }

      // Validate coupon with Coupon model
      const coupon = await Coupon.findOne({
        couponCode,
        userId: (await User.findOne({ email: userEmail }))?._id,
        isUsed: false,
        expiresAt: { $gt: new Date() },
      });

      

      // Verify discountAmount matches coupon (e.g., 10% of total_amount)
      const expectedDiscount = total_amount * coupon.discount;
      if (Math.abs(discountAmount - expectedDiscount) > 0.01) {
        // console.error("Discount amount mismatch:", {
        //   provided: discountAmount,
        //   expected: expectedDiscount,
        // });
        return res.status(400).json({ error: "Discount amount mismatch" });
      }

      // Ensure amount is total_amount - discountAmount
      // if (Math.abs(amount - (total_amount - discountAmount)) > 0.01) {
      //   console.error("Amount does not match total after discount:", {
      //     amount,
      //     total_amount,
      //     discountAmount,
      //   });
      //   return res.status(400).json({ error: "Invalid amount after discount" });
      // }
    } else if (discountAmount) {
      // If discountAmount is provided without couponCode, reject
      // console.error("Discount amount provided without coupon:", discountAmount);
      return res
        .status(400)
        .json({ error: "Discount amount provided without coupon" });
    }

    // Calculate duration: 60 minutes base + 30 minutes per additional service
    const baseDuration = 60; // Base service duration in minutes
    const additionalDuration = (relatedServices || []).length * 30; // 30 minutes per service
    const totalDuration = baseDuration + additionalDuration;

    // Validate date
    if (!date || isNaN(new Date(date).getTime())) {
      // console.error("Invalid date:", date);
      return res.status(400).json({ error: "Invalid date format" });
    }

    // Validate time slot availability
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      // console.error("User not found:", userEmail);
      return res.status(404).json({ error: "User not found" });
    }

    const existingBookings = user.bookings.filter((booking) => {
      if (
        !booking.date ||
        !(booking.date instanceof Date) ||
        isNaN(booking.date.getTime())
      ) {
        // console.warn("Invalid booking date found:", booking);
        return false;
      }

      return (
        booking.favoriteEmployee === favoriteEmployee &&
        booking.date.toISOString().split("T")[0] ===
          new Date(date).toISOString().split("T")[0]
      );
    });

    // Convert time to minutes for overlap checking
    const timeToMinutes = (timeStr) => {
      const [start] = timeStr.split("-");
      const [hours, minutes] = start.split(":").map(Number);
      return hours * 60 + minutes;
    };

    const slotStart = timeToMinutes(time);
    const slotEnd = slotStart + totalDuration;

    // Check for overlaps
    for (const booking of existingBookings) {
      const bookedStart = timeToMinutes(booking.time);
      const bookedEnd = bookedStart + (booking.duration || 60);

      if (!(slotEnd <= bookedStart || slotStart >= bookedEnd)) {
        // console.error("Time slot overlap detected:", {
        //   time,
        //   duration: totalDuration,
        //   existingBooking: booking,
        // });
        return res.status(400).json({
          error:
            "Selected time slot is not available for the required duration",
        });
      }
    }

    // Create booking object
    const bookingData = {
      parlorEmail,
      parlorName,
      name,
      date: new Date(date),
      time,
      service,
      amount: Number(amount), // Discounted amount
      total_amount: Number(total_amount), // Original amount
      Payment_Mode: "PENDING",
      favoriteEmployee,
      relatedServices: relatedServices || [],
      paymentStatus: "PENDING",
      duration: totalDuration,
      couponCode: couponCode || null, // Store couponCode
      discountAmount: discountAmount || 0, // Store discountAmount
    };

    // console.log("Booking data to save:", bookingData);

    // Add booking to user
    user.bookings.push(bookingData);
    const savedUser = await user.save();

    // Get the newly created booking ID
    const bookingId = savedUser.bookings[savedUser.bookings.length - 1]._id;

    // Verify the saved booking
    const savedBooking = savedUser.bookings.find(
      (b) => b._id.toString() === bookingId.toString()
    );
    // console.log("Saved booking in MongoDB:", savedBooking);

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Use discounted amount in paise
      currency: "INR",
      receipt: `booking_${bookingId}`,
      notes: {
        bookingId,
        userEmail,
        paymentType: "initial",
        couponCode: couponCode || null,
      },
    };

    const order = await razorpay.orders.create(options);
    if (!order) {
      // console.error("Failed to create Razorpay order");
      return res.status(500).json({ error: "Failed to create order" });
    }

    // Update booking with orderId
    savedUser.bookings.id(bookingId).orderId = order.id;
    await savedUser.save();

    // Verify the updated booking
    const updatedUser = await User.findOne({ email: userEmail });
    const updatedBooking = updatedUser.bookings.find(
      (b) => b._id.toString() === bookingId.toString()
    );
    // console.log("Booking after adding orderId:", updatedBooking);

    res.json({ order, bookingId, booking: updatedBooking });
  } catch (err) {
    // console.error("Error in /order:", err);
    res.status(500).json({ error: err.message });
  }
});

// Route: Validate payment (mandatory, updated to handle partial payments)
router.post("/order/validate", async (req, res) => {
  try {
    const {
      pin,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      userEmail,
      bookingId,
      paymentType, // 'initial' or 'remaining'
      couponCode, // New: Coupon code
    } = req.body;

    // Validate required fields
    if (
      !pin ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !userEmail ||
      !bookingId
    ) {
      return res.status(400).json({
        error: "Missing required fields",
        missing: {
          pin,
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          userEmail,
          bookingId,
          paymentType,
          couponCode,
        },
      });
    }

    // For failed payments, signature may be empty
    let paymentStatus = "PAID";
    let failureReason = null;
    let paymentMethod = null;

    // Verify signature for successful payments
    if (razorpay_signature) {
      const sha = crypto.createHmac("sha256", process.env.RAZORPAY_SECRET);
      sha.update(`${razorpay_order_id}|${razorpay_payment_id}`);
      const digest = sha.digest("hex");

      if (digest !== razorpay_signature) {
        paymentStatus = "FAILED";
        failureReason = "Invalid signature";
      }
    } else {
      paymentStatus = "FAILED";
      failureReason =
        req.body.failureReason || "Payment failed (no signature provided)";
    }

    // Fetch payment details from Razorpay
    let payment;
    try {
      payment = await razorpay.payments.fetch(razorpay_payment_id);
      paymentMethod = payment.method;
      // console.log("Razorpay payment amount (in paise):", payment.amount);
    } catch (err) {
      paymentStatus = "FAILED";
      failureReason =
        err.error?.description || "Failed to fetch payment details";
    }

    // Prepare update data
    const updateData = {
      "bookings.$.pin": pin,
      "bookings.$.paymentStatus":
        paymentStatus === "PAID" && payment?.status === "captured"
          ? "PAID"
          : "FAILED",
      "bookings.$.transactionId": razorpay_payment_id,
      "bookings.$.orderId": razorpay_order_id,
      "bookings.$.Payment_Mode": paymentMethod || "UNKNOWN",
      "bookings.$.failureReason":
        failureReason ||
        (payment?.status !== "captured"
          ? payment?.error_description || "Payment failed"
          : null),
    };

    // Update amount based on payment type
    if (paymentStatus === "PAID" && payment?.status === "captured") {
      const user = await User.findOne({
        email: userEmail,
        "bookings._id": bookingId,
      });
      if (user) {
        const booking = user.bookings.id(bookingId);
        if (booking) {
          const paymentAmount = payment.amount / 100; // Convert paise to rupees
          if (paymentType === "initial") {
            updateData["bookings.$.amount"] = paymentAmount;
          } else if (paymentType === "remaining") {
            updateData["bookings.$.amount"] =
              (booking.amount || 0) + paymentAmount;
          }

          // Mark coupon as used if provided and payment is successful
          if (couponCode) {
            const coupon = await Coupon.findOne({
              couponCode,
              userId: user._id,
              isUsed: false,
            });
            if (coupon) {
              coupon.isUsed = true;
              await coupon.save();
              // console.log("Coupon marked as used:", couponCode);
            } else {
              console.warn("Coupon not found or already used:", couponCode);
            }
          }
        }
      }
    }

    // Update booking
    const user = await User.findOneAndUpdate(
      { email: userEmail, "bookings._id": bookingId },
      { $set: updateData },
      { new: true }
    );

    if (!user) {
      return res.status(404).json({ error: "User or booking not found" });
    }

    // Log the updated booking
    const updatedBooking = user.bookings.find(
      (b) => b._id.toString() === bookingId
    );
    // console.log("Updated booking in MongoDB:", updatedBooking);

    res.json({
      message:
        paymentStatus === "PAID"
          ? "Payment verified successfully"
          : "Payment failed",
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      bookingId,
      paymentStatus,
      paymentMethod: paymentMethod || "UNKNOWN",
      failureReason,
    });
  } catch (err) {
    // console.error("Error in /order/validate:", err);
    res.status(500).json({ error: err.message, details: err.stack });
  }
});

// Route: Verify order (mandatory, unchanged)
router.get("/verify", async (req, res) => {
  try {
    const { order_id } = req.query;
    if (!order_id) {
      return res.status(400).json({ error: "Order ID is required" });
    }

    // Find booking by orderId
    const user = await User.findOne({ "bookings.orderId": order_id });
    if (!user) {
      // console.error('Booking not found for order_id:', order_id);
      return res.status(404).json({ error: "Booking not found" });
    }

    const booking = user.bookings.find((b) => b.orderId === order_id);
    if (!booking) {
      // console.error(
      //   'Booking not found in user bookings for order_id:',
      //   order_id
      // );
      return res.status(404).json({ error: "Booking not found" });
    }

    // Fetch order details from Razorpay
    let order;
    let paymentDetails = {};
    try {
      order = await razorpay.orders.fetch(order_id);
      if (booking.transactionId) {
        paymentDetails = await razorpay.payments.fetch(booking.transactionId);
      }
    } catch (err) {
      // console.error('Error fetching Razorpay details:', err);
    }

    // Log the booking data being returned
    // console.log('Booking data for order_id:', order_id, booking);

    const response = {
      data: {
        paymentStatus: booking.paymentStatus,
        transactionId: booking.transactionId || null,
        orderId: booking.orderId,
        amount: booking.amount,
        total_amount: booking.total_amount,
        Payment_Mode: booking.Payment_Mode || "UNKNOWN",
        createdAt: booking.createdAt,
        parlorName: booking.parlorName,
        service: booking.service,
        date: booking.date,
        time: booking.time,
        name: booking.name,
        favoriteEmployee: booking.favoriteEmployee,
        relatedServices: booking.relatedServices || [],
        failureReason: booking.failureReason || null,
        currency: order?.currency || "INR",
      },
    };

    res.json(response);
  } catch (err) {
    // console.error('Error in /verify:', err);
    res.status(500).json({ error: err.message });
  }
});

// Route: Create order for remaining amount payment (updated)
router.post("/remaining-order", async (req, res) => {
  try {
    const { userEmail, bookingId, amount, discountAmount = 0 } = req.body; // Include discountAmount with default 0

    // Validate required fields
    if (!userEmail || !bookingId || !amount) {
      return res
        .status(400)
        .json({ error: "userEmail, bookingId, and amount are required" });
    }

    // Validate amount is a positive number
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ error: "Invalid amount" });
    }

    // Find user and booking
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const booking = user.bookings.id(bookingId);
    if (!booking) {
      return res.status(404).json({ error: "Booking not found" });
    }

    // Validate amount matches remaining amount
    const remainingAmount =
      booking.total_amount -
      (booking.amount || 0) -
      (booking.discountAmount || discountAmount || 0); // Use booking.discountAmount or req.body.discountAmount
    if (amount !== remainingAmount) {
      return res.status(400).json({
        error: `Amount does not match remaining amount. Expected: ${remainingAmount}, Received: ${amount}`,
      });
    }

    // Create Razorpay order
    const options = {
      amount: Math.round(amount * 100), // Convert to paise
      currency: "INR",
      receipt: `remaining_${bookingId}`,
      notes: { bookingId, userEmail, paymentType: "remaining" },
    };

    const order = await razorpay.orders.create(options);
    if (!order) {
      return res.status(500).json({ error: "Failed to create order" });
    }

    // Update booking with new orderId
    booking.orderId = order.id;
    await user.save();

    // Return order and booking details
    res.json({ order, bookingId, booking });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

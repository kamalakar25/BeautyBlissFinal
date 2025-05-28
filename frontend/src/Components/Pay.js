import CloseIcon from "@mui/icons-material/Close";
import {
  Alert,
  Box,
  Button,
  FormControlLabel,
  IconButton,
  Modal,
  Radio,
  RadioGroup,
  TextField,
  Typography,
  CircularProgress,
} from "@mui/material";
import axios from "axios";
import { motion } from "framer-motion";
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const Pay = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const {
    parlor,
    totalAmount,
    service,
    relatedServices,
    name,
    date,
    time,
    favoriteEmployee,
  } = location.state || {};

  const [paymentAmountOption, setPaymentAmountOption] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState("");
  const [openModal, setOpenModal] = useState(false);
  const [terms, setTerms] = useState([]);
  const [coupon, setCoupon] = useState(null); // { code, discount } or null
  const [couponCode, setCouponCode] = useState(""); // User-entered coupon code
  const [couponError, setCouponError] = useState("");
  const [applyCoupon, setApplyCoupon] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(totalAmount || 0);
  const [loading, setLoading] = useState(false); // Loading state for payment processing

  // Validate booking details on mount
  useEffect(() => {
    if (
      !totalAmount ||
      !name ||
      !service ||
      !date ||
      !time ||
      !favoriteEmployee ||
      !parlor?.email ||
      !parlor?.name
    ) {
      setError(
        "Missing booking details. Please start the booking process again."
      );
      setTimeout(() => navigate("/bookslot"), 3000);
    }
  }, [
    totalAmount,
    name,
    service,
    date,
    time,
    favoriteEmployee,
    parlor,
    navigate,
  ]);

  // Fetch terms and first-user coupon status
  useEffect(() => {
    const fetchTermsAndCoupon = async () => {
      try {
        // Fetch terms
        const termsResponse = await axios.get(`${BASE_URL}/api/terms/terms`);
        const uniqueTerms = Array.from(
          new Set(termsResponse.data.map((item) => item.term))
        ).map((term) => termsResponse.data.find((item) => item.term === term));
        setTerms(uniqueTerms);

        // Fetch first-user coupon status
        const userId = localStorage.getItem("userId");
        const token = localStorage.getItem("token");
        if (!userId || !token) {
          // console.warn("Pay: Missing userId or token in localStorage");
          setError("Please log in to check coupon eligibility.");
          return;
        }

        if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
          // console.warn("Pay: Invalid userId format:", userId);
          setError("Invalid user ID. Please login again.");
          return;
        }

        // console.log("Pay: Fetching coupon status for userId:", userId);
        const couponResponse = await axios.post(
          `${BASE_URL}/api/coupons/status`,
          { userId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        // console.log("Pay: Coupon status response:", couponResponse.data);

        if (
          couponResponse.data.couponClaimed &&
          couponResponse.data.coupon?.code
        ) {
          // console.log(
          //   "Pay: Validating first-user coupon:",
          //   couponResponse.data.coupon.code
          // );
          const validateResponse = await axios.post(
            `${BASE_URL}/api/coupons/validate`,
            { userId, couponCode: couponResponse.data.coupon.code },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          // console.log(
          //   "Pay: Coupon validation response:",
          //   validateResponse.data
          // );

          if (validateResponse.data.valid) {
            setCoupon({
              code: couponResponse.data.coupon.code,
              discount: validateResponse.data.discount,
            });
            setCouponCode(couponResponse.data.coupon.code); // Pre-fill coupon code
            setApplyCoupon(true);
          } else {
            // console.warn(
            //   "Pay: First-user coupon is invalid or expired:",
            //   validateResponse.data.message
            // );
            setCoupon(null);
            setApplyCoupon(false);
          }
        } else {
          // console.log(
          //   "Pay: No first-user coupon claimed or coupon code missing"
          // );
          setCoupon(null);
          setApplyCoupon(false);
        }
      } catch (error) {
        // console.error(
        //   "Pay: Failed to fetch terms or coupon:",
        //   error.message,
        //   error.response?.data
        // );
        setTerms([]);
        setCoupon(null);
        setApplyCoupon(false);
      }
    };
    fetchTermsAndCoupon();
  }, []);

  // Redeem a coupon if none is assigned
  const redeemCoupon = async () => {
    try {
      const userEmail = localStorage.getItem("email");
      if (!userEmail) {
        setCouponError("Please log in to redeem a coupon.");
        return;
      }
      const newCouponCode = `DISC${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;
      // console.log(
      //   "Pay: Redeeming coupon for email:",
      //   userEmail,
      //   "with code:",
      //   newCouponCode
      // );
      const response = await axios.post(`${BASE_URL}/api/users/redeem-coupon`, {
        email: userEmail,
        couponCode: newCouponCode,
      });
      // console.log("Pay: Coupon redemption response:", response.data);
      setCoupon({
        code: response.data.coupon.code,
        discount: response.data.coupon.discount,
      });
      setCouponCode(response.data.coupon.code);
      setApplyCoupon(true);
      setCouponError("");
    } catch (error) {
      // console.error(
      //   "Pay: Coupon redemption failed:",
      //   error.message,
      //   error.response?.data
      // );
      setCouponError(
        error.response?.data?.message || "Failed to redeem coupon"
      );
    }
  };

  // Validate user-entered coupon
  const validateCoupon = async (code) => {
    try {
      const userEmail = localStorage.getItem("email");
      if (!userEmail) {
        setCouponError("Please log in to validate coupon.");
      }
      
      const response = await axios.post(
        `${BASE_URL}/api/users/validate-coupon`,
        {
          couponCode: code,
          email: userEmail,
        }
      );

      if (response.data.valid) {
        setCoupon({ code, discount: response.data.discount || 0.1 });
        setCouponError("");
        setApplyCoupon(true);
      } else {
        setCoupon(null);
        setCouponError(
          response.data.message || "Invalid or expired coupon code"
        );
        setApplyCoupon(false);
      }
    } catch (error) {
      // console.error(
      //   "Pay: Coupon validation failed:",
      //   error.message,
      //   error.response?.data
      // );
      setCoupon(null);
      const errorMessage =
        error.response?.data?.message || "Failed to validate coupon";
      setCouponError(errorMessage);
      setApplyCoupon(false);
      if (errorMessage === "No coupon assigned to this user") {
        setCouponError(
          `${errorMessage}. Would you like to redeem a new coupon?`
        );
      }
    }
  };

  // Handle coupon code input change
  const handleCouponChange = (e) => {
    const { value } = e.target;
    setCouponCode(value);
    if (value.trim()) {
      validateCoupon(value.trim());
    } else {
      setCoupon(null);
      setApplyCoupon(false);
    }
  };

  // Calculate final amount based on coupon
  useEffect(() => {
    if (applyCoupon && coupon && totalAmount) {
      const discount = totalAmount * coupon.discount;
      setDiscountAmount(discount);
      setFinalAmount(totalAmount - discount);
    } else {
      setDiscountAmount(0);
      setFinalAmount(totalAmount || 0);
    }
  }, [applyCoupon, coupon, totalAmount]);

  const handlePaymentAmountChange = (e) => {
    setPaymentAmountOption(e.target.value);
    setError("");
  };

  const handleApplyCoupon = () => {
    if (!coupon) {
      setError("No valid coupon available to apply.");
      return;
    }
     if (applyCoupon) {
    // Removing coupon: clear coupon code, reset states
    setCouponCode("");
    setCoupon(null);
    setApplyCoupon(false);
    setCouponError("");
  } else {
    // Applying coupon
    setApplyCoupon(true);
  }
    
    setError("");
  };

  const calculatePaymentAmount = () => {
    if (!finalAmount || finalAmount <= 0) return 0;
    return paymentAmountOption === "25%" ? finalAmount * 0.25 : finalAmount;
  };

  const createNotifications = async (
    bookingId,
    userEmail,
    parlorEmail,
    paymentStatus
  ) => {
    try {
      await axios.post(
        `${BASE_URL}/api/notifications/create-booking-notification`,
        {
          userEmail,
          parlorEmail,
          bookingId,
        }
      );
      // console.log("Pay: Notifications created successfully");
    } catch (error) {
      // console.error("Pay: Failed to create notifications:", error.message);
      setError(
        "Failed to create booking notifications. Booking is still confirmed."
      );
    }
  };

  const handleConfirm = async () => {
    if (!paymentAmountOption) {
      setError("Please select a payment amount (25% or Full).");
      return;
    }

    if (!finalAmount || finalAmount <= 0) {
      setError("Invalid total amount. Please try again.");
      return;
    }

    if (!window.Razorpay) {
      setError("Razorpay SDK not loaded. Please refresh the page.");
      return;
    }

    setLoading(true); // Start loading
    try {
      const userEmail = localStorage.getItem("email");
      if (!userEmail) {
        setError("User email not found. Please log in again.");
        setLoading(false); // Stop loading on error
        return;
      }

      const bookingData = {
        parlorEmail: parlor?.email,
        parlorName: parlor?.name,
        name,
        date,
        time,
        service,
        amount: calculatePaymentAmount(),
        total_amount: totalAmount,
        relatedServices: relatedServices || [],
        favoriteEmployee,
        userEmail,
        couponCode: applyCoupon && coupon ? coupon.code : null,
        discountAmount: applyCoupon && coupon ? discountAmount : 0,
      };

      // console.log("Pay: Creating order with bookingData:", bookingData);
      const response = await axios.post(
        `${BASE_URL}/api/razorpay/order`,
        bookingData
      );
      const { order, bookingId } = response.data;

      if (!order || !bookingId) {
        throw new Error("Failed to create order or booking");
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY || "rzp_test_UlCC6Rw2IJrhyh",
        amount: order.amount,
        currency: order.currency,
        name: "Parlor Booking",
        description: `Payment for booking ${bookingId}`,
        order_id: order.id,
        handler: async function (response) {
          const pin = Math.floor(Math.random() * 90000) + 10000;
          try {
            // console.log("Pay: Validating payment with response:", response);
            const validationResponse = await axios.post(
              `${BASE_URL}/api/razorpay/order/validate`,
              {
                pin,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userEmail,
                bookingId,
                paymentType: paymentAmountOption === "25%" ? "initial" : "full",
                couponCode: applyCoupon && coupon ? coupon.code : null,
              }
            );
            // console.log(
            //   "Pay: Payment validation response:",
            //   validationResponse.data
            // );

            // Update coupon in backend after successful payment
            if (applyCoupon && coupon && coupon.code) {
              try {
                // console.log(
                //   "Pay: Updating coupon status for email:",
                //   userEmail,
                //   "with code:",
                //   coupon.code
                // );
                await axios.put(
                  `${BASE_URL}/api/users/update/coupon`,
                  {
                    couponCode: coupon.code,
                    email: userEmail,
                  }
                );
                // console.log("Pay: Coupon updated successfully");
              } catch (couponError) {
                // console.error(
                //   "Pay: Failed to update coupon:",
                //   couponError.message,
                //   couponError.response?.data
                // );
                setError(
                  "Payment successful, but failed to update coupon status. Please contact support."
                );
              }
            }

            await createNotifications(
              bookingId,
              userEmail,
              parlor.email,
              "PAID"
            );

            // Delay navigation slightly to ensure loading state is visible
            setTimeout(() => {
              setLoading(false); // Stop loading before navigation
              navigate(
                `/payment/callback?order_id=${response.razorpay_order_id}`,
                {
                  state: {
                    ...location.state,
                    bookingId,
                    paymentStatus: "PAID",
                    transactionId: response.razorpay_payment_id,
                    orderId: response.razorpay_order_id,
                    currency: order.currency,
                    amount: bookingData.amount,
                    total_amount: bookingData.total_amount,
                    Payment_Mode:
                      validationResponse.data.paymentMethod || "UNKNOWN",
                    createdAt: new Date().toISOString(),
                    couponCode: applyCoupon && coupon ? coupon.code : null,
                    discountAmount: applyCoupon && coupon ? discountAmount : 0,
                  },
                }
              );
            }, 500); // Small delay for UX
          } catch (err) {
            // console.error("Pay: Payment verification failed:", err.message);
            setError(
              `Payment verification failed: ${
                err.response?.data?.error || err.message
              }`
            );
            await createNotifications(
              bookingId,
              userEmail,
              parlor.email,
              "FAILED"
            );
            setLoading(false); // Stop loading on error
            navigate(
              `/payment/callback?order_id=${response.razorpay_order_id}`,
              {
                state: {
                  ...location.state,
                  bookingId,
                  paymentStatus: "FAILED",
                  transactionId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  failureReason:
                    err.response?.data?.reason || "Validation failed",
                  currency: order.currency,
                  amount: bookingData.amount,
                  total_amount: bookingData.total_amount,
                  Payment_Mode: "UNKNOWN",
                  createdAt: new Date().toISOString(),
                  couponCode: applyCoupon && coupon ? coupon.code : null,
                  discountAmount: applyCoupon && coupon ? discountAmount : 0,
                },
              }
            );
          }
        },
        prefill: {
          name,
          email: userEmail,
          contact: "9234567890",
        },
        notes: {
          bookingId,
          userEmail,
          couponCode: applyCoupon && coupon ? coupon.code : null,
        },
        theme: { color: "#4a3f8c" },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async function (response) {
        const failureReason = response.error.description || "Payment failed";
        // console.error("Pay: Payment failed:", response.error);
        setError(`Payment failed: ${failureReason}`);
        try {
          await axios.post(`${BASE_URL}/api/razorpay/order/validate`, {
            razorpay_order_id: response.error.metadata.order_id,
            razorpay_payment_id: response.error.metadata.payment_id,
            razorpay_signature: "",
            userEmail,
            bookingId,
            paymentType: paymentAmountOption === "25%" ? "initial" : "full",
            failureReason,
            couponCode: applyCoupon && coupon ? coupon.code : null,
          });
          await createNotifications(
            bookingId,
            userEmail,
            parlor.email,
            "FAILED"
          );
        } catch (err) {
          // console.error("Pay: Failed to validate failed payment:", err.message);
        }
        setLoading(false); // Stop loading on failure
        navigate(
          `/payment/callback?order_id=${response.error.metadata.order_id}`,
          {
            state: {
              ...location.state,
              bookingId,
              paymentStatus: "FAILED",
              transactionId: response.error.metadata.payment_id,
              orderId: response.error.metadata.order_id,
              failureReason,
              currency: order.currency,
              amount: bookingData.amount,
              total_amount: bookingData.total_amount,
              Payment_Mode: "UNKNOWN",
              createdAt: new Date().toISOString(),
              couponCode: applyCoupon && coupon ? coupon.code : null,
              discountAmount: applyCoupon && coupon ? discountAmount : 0,
            },
          }
        );
      });
      rzp.open();

      setShowSuccess(true);
      setError("");
    } catch (err) {
      // console.error("Pay: Error processing request:", err.message);
      const errorMessage = err.response?.data?.error || err.message;
      setError(`Error processing request: ${errorMessage}`);
      setLoading(false); // Stop loading on error
    }
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  return (
    <Box
      sx={{
        p: 4,
        maxWidth: 1000,
        mx: "auto",
        backgroundColor: "#ffffff",
        borderRadius: 4,
        boxShadow: "0 8px 16px rgba(0, 0, 0, 0.1)",
        transition: "all 0.3s ease",
        "&:hover": { boxShadow: "0 10px 20px rgba(0, 0, 0, 0.15)" },
        display: "flex",
        flexDirection: "column",
        gap: 3,
        marginTop: "120px",
        position: "relative", // For positioning loading overlay
      }}
    >
      {/* Loading Overlay */}
      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            borderRadius: 4,
          }}
        >
          <CircularProgress sx={{ color: "#4a3f8c" }} />
          <Typography sx={{ ml: 2, color: "#4a3f8c" }}>
            Processing Payment...
          </Typography>
        </Box>
      )}

      <h2
        className="fw-bold mb-4 animate_animated animate_fadeInDown"
        style={{
          animationDuration: "0.8s",
          fontSize: "2rem",
          letterSpacing: "1.2px",
          fontWeight: 600,
          color: "#6683a8",
          textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
          fontFamily: "'Montserrat', sans-serif",
        }}
      >
        Payment for Booking
      </h2>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          gap: 3,
          flexWrap: "wrap",
        }}
      >
        {/* Booking Summary Section */}
        <Box
          sx={{
            flex: 1,
            minWidth: "48%",
            p: 4,
            borderRadius: 2,
            backgroundColor: "#f9f9f9",
            color: "#333333",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.3s ease",
            "&:hover": { transform: "scale(1.05)" },
            border: "1px solid #4a3f8c",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#4a3f8c",
              mb: 2,
              textDecoration: "underline",
            }}
          >
            Booking Summary
          </Typography>
          <Typography sx={{ mb: 1, color: "#333333" }}>
            <strong>Parlor:</strong> {parlor?.name || "N/A"}
          </Typography>
          <Typography sx={{ mb: 1, color: "#333333" }}>
            <strong>Service:</strong> {service || "N/A"}
          </Typography>
          <Typography sx={{ mb: 1, color: "#333333" }}>
            <strong>Date:</strong> {date || "N/A"}
          </Typography>
          <Typography sx={{ mb: 1, color: "#333333" }}>
            <strong>Time:</strong> {time || "N/A"}
          </Typography>
          <Typography sx={{ mb: 1, color: "#333333" }}>
            <strong>Employee:</strong> {favoriteEmployee || "N/A"}
          </Typography>
          <Typography sx={{ mb: 1, color: "#333333" }}>
            <strong>Total Amount:</strong> ₹{totalAmount || "0.00"}
          </Typography>
          {applyCoupon && coupon && (
            <>
              <Typography sx={{ mb: 1, color: "#333333" }}>
                <strong>Coupon Applied:</strong> {coupon.code} (
                {(coupon.discount * 100).toFixed(0)}% off)
              </Typography>
              <Typography sx={{ mb: 1, color: "#333333" }}>
                <strong>Discount:</strong> ₹{discountAmount.toFixed(2)}
              </Typography>
              <Typography sx={{ mb: 1, color: "#333333" }}>
                <strong>Final Amount:</strong> ₹{finalAmount}
              </Typography>
            </>
          )}
        </Box>

        {/* Select Payment Amount Section */}
        <Box
          sx={{
            flex: 1,
            minWidth: "48%",
            p: 4,
            borderRadius: 2,
            backgroundColor: "white",
            color: "black",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
            transition: "transform 0.3s ease",
            "&:hover": { transform: "scale(1.05)" },
            border: "1px solid #4a3f8c",
          }}
        >
          <Typography
            variant="h6"
            sx={{
              color: "#4a3f8c",
              mb: 2,
              textDecoration: "underline",
            }}
          >
            Select Payment Amount
          </Typography>
          <RadioGroup
            value={paymentAmountOption}
            onChange={handlePaymentAmountChange}
            disabled={loading} // Disable radio buttons during loading
          >
            <FormControlLabel
              style={{ color: "black" }}
              value="25%"
              control={<Radio />}
              label={`Pay 25% Now (₹${(finalAmount * 0.25).toFixed(
                2
              )}) + Cash on Delivery`}
              disabled={loading}
            />
            <FormControlLabel
              style={{ color: "black" }}
              value="full"
              control={<Radio />}
              label={`Pay Full Amount (₹${finalAmount})`}
              disabled={loading}
            />
          </RadioGroup>

          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Coupon Code"
              name="couponCode"
              value={couponCode}
              onChange={handleCouponChange}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 2,
                  "&:hover fieldset": { borderColor: "#4a3f8c" },
                  "&.Mui-focused fieldset": { borderColor: "#4a3f8c" },
                  backgroundColor: "#ffffff",
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#4a3f8c" },
                "& .MuiInputBase-input": {
                  fontSize: "0.9rem",
                  color: "#0e0f0f",
                },
              }}
              error={!!couponError}
              helperText={couponError}
              disabled={loading} // Disable coupon input during loading
            />
          </Box>

          {coupon && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="outlined"
                onClick={handleApplyCoupon}
                sx={{
                  color: "#4a3f8c",
                  borderColor: "#4a3f8c",
                  "&:hover": { backgroundColor: "rgba(74, 63, 140, 0.5)" },
                }}
                disabled={loading} // Disable button during loading
              >
                {applyCoupon
                  ? "Remove Coupon"
                  : `Apply Coupon (${coupon.code})`}
              </Button>
            </Box>
          )}

          {couponError.includes("Would you like to redeem a new coupon?") && (
            <Box sx={{ mt: 2 }}>
              <Button
                variant="contained"
                onClick={redeemCoupon}
                sx={{
                  backgroundColor: "#4a3f8c",
                  color: "#ffffff",
                  "&:hover": { backgroundColor: "#6683a8" },
                }}
                disabled={loading} // Disable button during loading
              >
                Redeem New Coupon
              </Button>
            </Box>
          )}

          {paymentAmountOption && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Typography
                sx={{
                  mt: 2,
                  color: "#4a3f8c",
                  fontWeight: 500,
                  fontSize: "0.9rem",
                  textDecoration: "underline",
                  cursor: "pointer",
                  "&:hover": { color: "#6683a8" },
                }}
                onClick={handleOpenModal}
              >
                View Terms and Conditions
              </Typography>
            </motion.div>
          )}

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}

          {couponError &&
            !couponError.includes("Would you like to redeem a new coupon?") && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {couponError}
              </Alert>
            )}

          {showSuccess && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Payment option selected successfully!
            </Alert>
          )}

          <motion.button
            onClick={handleConfirm}
            style={{
              background: "rgba(74, 63, 140, 0.1)",
              color: "#4a3f8c",
              padding: "0.6rem 1rem",
              borderRadius: "8px",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              border: "1px solid rgba(74, 63, 140, 0.3)",
              fontSize: "1rem",
              fontWeight: 500,
              width: "fit-content",
              marginTop: "20px",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "background-color 0.3s ease, border-color 0.3s ease",
              opacity: loading ? 0.6 : 1, // Dim button when loading
            }}
            whileHover={{
              background: loading
                ? "rgba(74, 63, 140, 0.1)"
                : "rgba(74, 63, 140, 0.2)",
              borderColor: "#4a3f8c",
            }}
            transition={{ duration: 0.3 }}
            disabled={loading} // Disable button during loading
          >
            Confirm Payment
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4a3f8c"
              style={{ marginLeft: "8px" }}
            >
              <path d="M5 12h14M12 5l7 7-7 7" strokeWidth="2" />
            </svg>
          </motion.button>
        </Box>
      </Box>

      {/* Terms and Conditions Modal */}
      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="terms-modal-title"
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.3 }}
        >
          <Box
            sx={{
              bgcolor: "#ffffff",
              borderRadius: 4,
              boxShadow: "0 8px 16px rgba(0, 0, 0, 0.2)",
              p: 4,
              maxWidth: 500,
              width: "90%",
              position: "relative",
              fontFamily: "'Montserrat', sans-serif",
            }}
          >
            <IconButton
              onClick={handleCloseModal}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                color: "#4a3f8c",
              }}
            >
              <CloseIcon />
            </IconButton>
            <Typography
              id="terms-modal-title"
              variant="h6"
              sx={{
                color: "#4a3f8c",
                mb: 3,
                fontWeight: 600,
                textAlign: "center",
              }}
            >
              Terms & Conditions
            </Typography>
            <Box sx={{ color: "#333333", fontSize: "0.9rem" }}>
              <Typography sx={{ mb: 2 }}>
                By proceeding with the payment, you agree to the following
                terms:
              </Typography>
              {terms.length > 0 ? (
                <ul>
                  {terms.map((term, index) => (
                    <li key={index} style={{ marginBottom: "10px" }}>
                      {term.description || term.term}
                    </li>
                  ))}
                </ul>
              ) : (
                <Typography sx={{ mb: 2 }}>
                  No terms and conditions available.
                </Typography>
              )}
            </Box>
            <Button
              onClick={handleCloseModal}
              sx={{
                mt: 3,
                bgcolor: "#4a3f8c",
                color: "#ffffff",
                borderRadius: 4,
                px: 4,
                py: 1,
                fontWeight: 500,
                "&:hover": { bgcolor: "#6683a8" },
                display: "block",
                mx: "auto",
              }}
            >
              Close
            </Button>
          </Box>
        </motion.div>
      </Modal>

      <style>
        {`
          h2.text-primary {
            font-family: 'Montserrat', sans-serif;
            font-weight: 600;
            font-size: 2rem;
            color: #333333;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
            position: relative;
            margin-bottom: 1.5rem;
          }
          h2.text-primary::after {
            content: '';
            position: absolute;
            bottom: -6px;
            left: 50%;
            transform: translateX(-50%);
            width: 60px;
            height: 3px;
            background: #4a3f8c;
            borderRadius: 2px;
          }
        `}
      </style>
    </Box>
  );
};

export default Pay;
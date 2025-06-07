import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControlLabel,
  IconButton,
  Modal,
  Radio,
  RadioGroup,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import image from './Assets/bro.png';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

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

  const [paymentAmountOption, setPaymentAmountOption] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [error, setError] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [terms, setTerms] = useState([]);
  const [coupon, setCoupon] = useState(null);
  const [couponCode, setCouponCode] = useState('');
  const [couponError, setCouponError] = useState('');
  const [applyCoupon, setApplyCoupon] = useState(false);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [finalAmount, setFinalAmount] = useState(totalAmount || 0);
  const [loading, setLoading] = useState(false);

  const steps = ['Booking Slot', 'Billing', 'Confirmation'];

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
        'Missing booking details. Please start the booking process again.'
      );
      setTimeout(() => navigate('/bookslot'), 3000);
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

  useEffect(() => {
    const fetchTermsAndCoupon = async () => {
      try {
        const termsResponse = await axios.get(`${BASE_URL}/api/terms/terms`);
        const uniqueTerms = Array.from(
          new Set(termsResponse.data.map((item) => item.term))
        ).map((term) => termsResponse.data.find((item) => item.term === term));
        setTerms(uniqueTerms);

        const userId = localStorage.getItem('userId');
        const token = localStorage.getItem('token');
        if (!userId || !token) {
          setError('Please log in to check coupon eligibility.');
          return;
        }

        if (!/^[0-9a-fA-F]{24}$/.test(userId)) {
          setError('Invalid user ID. Please login again.');
          return;
        }

        const couponResponse = await axios.post(
          `${BASE_URL}/api/coupons/status`,
          { userId },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (
          couponResponse.data.couponClaimed &&
          couponResponse.data.coupon?.code
        ) {
          const validateResponse = await axios.post(
            `${BASE_URL}/api/coupons/validate`,
            { userId, couponCode: couponResponse.data.coupon.code },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (validateResponse.data.valid) {
            setCoupon({
              code: couponResponse.data.coupon.code,
              discount: validateResponse.data.discount,
            });
            setCouponCode(couponResponse.data.coupon.code);
            setApplyCoupon(true);
          } else {
            setCoupon(null);
            setApplyCoupon(false);
          }
        } else {
          setCoupon(null);
          setApplyCoupon(false);
        }
      } catch (error) {
        setTerms([]);
        setCoupon(null);
        setApplyCoupon(false);
      }
    };
    fetchTermsAndCoupon();
  }, []);

  const redeemCoupon = async () => {
    try {
      const userEmail = localStorage.getItem('email');
      if (!userEmail) {
        setCouponError('Please log in to redeem a coupon.');
        return;
      }
      const newCouponCode = `DISC${Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase()}`;
      const response = await axios.post(`${BASE_URL}/api/users/redeem-coupon`, {
        email: userEmail,
        couponCode: newCouponCode,
      });
      setCoupon({
        code: response.data.coupon.code,
        discount: response.data.coupon.discount,
      });
      setCouponCode(response.data.coupon.code);
      setApplyCoupon(true);
      setCouponError('');
    } catch (error) {
      setCouponError(
        error.response?.data?.message || 'Failed to redeem coupon'
      );
    }
  };

  const validateCoupon = async (code) => {
    try {
      const userEmail = localStorage.getItem('email');
      if (!userEmail) {
        setCouponError('Please log in to validate coupon.');
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
        setCouponError('');
        setApplyCoupon(true);
      } else {
        setCoupon(null);
        setCouponError(
          response.data.message || 'Invalid or expired coupon code'
        );
        setApplyCoupon(false);
      }
    } catch (error) {
      setCoupon(null);
      const errorMessage =
        error.response?.data?.message || 'Failed to validate coupon';
      setCouponError(errorMessage);
      setApplyCoupon(false);
      if (errorMessage === 'No coupon assigned to this user') {
        setCouponError(
          `${errorMessage}. Would you like to redeem a new coupon?`
        );
      }
    }
  };

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
    setError('');
  };

  const handleApplyCoupon = () => {
    if (!coupon) {
      setError('No valid coupon available to apply.');
      return;
    }
    if (applyCoupon) {
      setCouponCode('');
      setCoupon(null);
      setApplyCoupon(false);
      setCouponError('');
    } else {
      setApplyCoupon(true);
    }

    setError('');
  };

  const calculatePaymentAmount = () => {
    if (!finalAmount || finalAmount <= 0) return 0;
    return paymentAmountOption === '25%' ? finalAmount * 0.25 : finalAmount;
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
    } catch (error) {
      setError(
        'Failed to create booking notifications. Booking is still confirmed.'
      );
    }
  };

  const handleConfirm = async () => {
    if (!paymentAmountOption) {
      setError('Please select a payment amount (25% or Full).');
      return;
    }

    if (!finalAmount || finalAmount <= 0) {
      setError('Invalid total amount. Please try again.');
      return;
    }

    if (!window.Razorpay) {
      setError('Razorpay SDK not loaded. Please refresh the page.');
      return;
    }

    setLoading(true);
    try {
      const userEmail = localStorage.getItem('email');
      if (!userEmail) {
        setError('User email not found. Please log in again.');
        setLoading(false);
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

      const response = await axios.post(
        `${BASE_URL}/api/razorpay/order`,
        bookingData
      );
      const { order, bookingId } = response.data;

      if (!order || !bookingId) {
        throw new Error('Failed to create order or booking');
      }

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY || 'rzp_test_UlCC6Rw2IJrhyh',
        amount: order.amount,
        currency: order.currency,
        name: 'Parlor Booking',
        description: `Payment for booking ${bookingId}`,
        order_id: order.id,
        handler: async function (response) {
          const pin = Math.floor(Math.random() * 90000) + 10000;
          try {
            const validationResponse = await axios.post(
              `${BASE_URL}/api/razorpay/order/validate`,
              {
                pin,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                userEmail,
                bookingId,
                paymentType: paymentAmountOption === '25%' ? 'initial' : 'full',
                couponCode: applyCoupon && coupon ? coupon.code : null,
              }
            );

            if (applyCoupon && coupon && coupon.code) {
              try {
                await axios.put(`${BASE_URL}/api/users/update/coupon`, {
                  couponCode: coupon.code,
                  email: userEmail,
                });
              } catch (couponError) {
                setError(
                  'Payment successful, but failed to update coupon status. Please contact support.'
                );
              }
            }

            await createNotifications(
              bookingId,
              userEmail,
              parlor.email,
              'PAID'
            );

            setTimeout(() => {
              setLoading(false);
              navigate(
                `/payment/callback?order_id=${response.razorpay_order_id}`,
                {
                  state: {
                    ...location.state,
                    bookingId,
                    paymentStatus: 'PAID',
                    transactionId: response.razorpay_payment_id,
                    orderId: response.razorpay_order_id,
                    currency: order.currency,
                    amount: bookingData.amount,
                    total_amount: bookingData.total_amount,
                    Payment_Mode:
                      validationResponse.data.paymentMethod || 'UNKNOWN',
                    createdAt: new Date().toISOString(),
                    couponCode: applyCoupon && coupon ? coupon.code : null,
                    discountAmount: applyCoupon && coupon ? discountAmount : 0,
                  },
                }
              );
            }, 500);
          } catch (err) {
            setError(
              `Payment verification failed: ${
                err.response?.data?.error || err.message
              }`
            );
            await createNotifications(
              bookingId,
              userEmail,
              parlor.email,
              'FAILED'
            );
            setLoading(false);
            navigate(
              `/payment/callback?order_id=${response.razorpay_order_id}`,
              {
                state: {
                  ...location.state,
                  bookingId,
                  paymentStatus: 'FAILED',
                  transactionId: response.razorpay_payment_id,
                  orderId: response.razorpay_order_id,
                  failureReason:
                    err.response?.data?.reason || 'Validation failed',
                  currency: order.currency,
                  amount: bookingData.amount,
                  total_amount: bookingData.total_amount,
                  Payment_Mode: 'UNKNOWN',
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
          contact: '9234567890',
        },
        notes: {
          bookingId,
          userEmail,
          couponCode: applyCoupon && coupon ? coupon.code : null,
        },
        theme: { color: '#f06292' },
        modal: {
          ondismiss: function () {
            setLoading(false);
            setError('Payment was canceled by the user.');
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async function (response) {
        const failureReason = response.error.description || 'Payment failed';
        setError(`Payment failed: ${failureReason}`);
        try {
          await axios.post(`${BASE_URL}/api/razorpay/order/validate`, {
            razorpay_order_id: response.error.metadata.order_id,
            razorpay_payment_id: response.error.metadata.payment_id,
            razorpay_signature: '',
            userEmail,
            bookingId,
            paymentType: paymentAmountOption === '25%' ? 'initial' : 'full',
            failureReason,
            couponCode: applyCoupon && coupon ? coupon.code : null,
          });
          await createNotifications(
            bookingId,
            userEmail,
            parlor.email,
            'FAILED'
          );
        } catch (err) {
          // Handle any errors during failure validation
        }
        setLoading(false);
        navigate(
          `/payment/callback?order_id=${response.error.metadata.order_id}`,
          {
            state: {
              ...location.state,
              bookingId,
              paymentStatus: 'FAILED',
              transactionId: response.error.metadata.payment_id,
              orderId: response.error.metadata.order_id,
              failureReason,
              currency: order.currency,
              amount: bookingData.amount,
              total_amount: bookingData.total_amount,
              Payment_Mode: 'UNKNOWN',
              createdAt: new Date().toISOString(),
              couponCode: applyCoupon && coupon ? coupon.code : null,
              discountAmount: applyCoupon && coupon ? discountAmount : 0,
            },
          }
        );
      });
      rzp.open();

      setShowSuccess(true);
      setError('');
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message;
      setError(`Error processing request: ${errorMessage}`);
      setLoading(false);
    }
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => setOpenModal(false);

  return (
    <Box
      sx={{
        p: { xs: 2, sm: 4 },
        width: "100%",
        backgroundColor: "#fad9e3",
        display: "flex",
        flexDirection: "column",
        gap: 3,
        minHeight: "100vh",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {/* Loading Overlay */}
      {loading && (
        <Box
          sx={{
            position: "fixed", // Fixed to cover the entire viewport
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.8)", // Semi-transparent white background
            display: "flex",
            alignItems: "center", // Center vertically
            justifyContent: "center", // Center horizontally
            zIndex: 2000, // Ensure it overlays everything
            flexDirection: "column", // Stack elements vertically
            gap: 3, // Increased spacing between elements
          }}
        >
          {/* Beauty Bliss Title */}
          <Typography
            sx={{
              color: "#f06292", // Pink text
              fontSize: "2.5rem", // Larger font size for the title
              fontWeight: 700, // Extra bold
              fontFamily: "'Montserrat', sans-serif",
              textAlign: "center",
            }}
          >
            Beauty Bliss
          </Typography>

          {/* Loading Spinner */}
          <CircularProgress
            sx={{
              color: "#f06292", // Pink spinner
              width: "50px !important", // Match the size in the image
              height: "50px !important",
              thickness: 5, // Thicker spinner to match the image
            }}
          />

          {/* Hold On Message */}
          <Typography
            sx={{
              color: "#f06292", // Pink text
              fontSize: "1.2rem", // Slightly smaller than the title
              fontWeight: 500, // Medium weight
              fontFamily: "'Montserrat', sans-serif",
              textAlign: "center",
              maxWidth: "300px", // Limit width for better readability
            }}
          >
            Hold on, your payment will complete soon
          </Typography>
        </Box>
      )}

      {/* Title */}
      <Box sx={{ textAlign: "center", mb: 2 }}>
        <h2
          className="fw-bold animate_animated animate_fadeInDown"
          style={{
            animationDuration: "0.8s",
            fontSize: { xs: "1.5rem", sm: "2rem" },
            letterSpacing: "1.2px",
            fontWeight: 600,
            color: "#000000",
            fontFamily: "'Montserrat', sans-serif",
          }}
        >
          Payment for Booking
        </h2>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: 3,
          flexWrap: "wrap",
          maxWidth: "1200px",
          mx: "auto",
          width: "100%",
        }}
      >
        {/* Left Column: Progress Navigation, Booking Summary, and Payment Options */}
        {/* Ticket Style Container */}
        <Box
          sx={{
            maxWidth: "380px",
            mx: "auto",
            width: "90%",
            background: "#ffffff",
            borderRadius: "16px",
            // border: "1px solid #f06292",
            p: 2.5,
            position: "relative",
            overflow: "hidden",
            "&:before, &:after": {
              content: '""',
              position: "absolute",
              width: "24px",
              height: "24px",
              backgroundColor: "#fad9e3",
              borderRadius: "50%",
              border: "1px solid #f06292",
              zIndex: 1,
            },
            "&:before": { top: "-12px", left: "20px" },
            "&:after": { top: "-12px", right: "20px" },
            "&:hover": {
              transform: "translateY(-2px)",
              transition: "transform 0.3s ease",
            },
          }}
          component={motion.div}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          {/* Stepper */}
          <Stepper
            activeStep={1}
            alternativeLabel
            sx={{
              mb: 2,
              "& .MuiStepLabel-label": {
                fontFamily: "'Poppins', sans-serif",
                fontSize: { xs: "0.65rem", sm: "0.85rem" },
                color: "#4a2c6b",
              },
              "& .MuiStepIcon-root": {
                color: "#f06292",
                "&.Mui-completed": { color: "#f06292" },
                "&.Mui-active": { color: "#f06292" },
              },
              "& .MuiStepIcon-text": { fill: "#ffffff" },
            }}
          >
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {/* Booking Summary */}
          <Box sx={{ mb: 2.5 }}>
            <Typography
              sx={{
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "#4a2c6b",
                mb: 1.5,
                textAlign: "center",
              }}
            >
              Booking Details
            </Typography>
            <Box
              sx={{
                background: "#f9e6eb",
                borderRadius: "10px",
                p: 1.5,
                fontSize: "0.8rem",
                color: "#4a2c6b",
              }}
            >
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography sx={{ fontWeight: 500 }}>Parlor:</Typography>
                <Typography>{parlor?.name || "N/A"}</Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography sx={{ fontWeight: 500 }}>Service:</Typography>
                <Typography>{service || "N/A"}</Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography sx={{ fontWeight: 500 }}>Date:</Typography>
                <Typography>{date || "N/A"}</Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography sx={{ fontWeight: 500 }}>Time:</Typography>
                <Typography>{time || "N/A"}</Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography sx={{ fontWeight: 500 }}>Employee:</Typography>
                <Typography>{favoriteEmployee || "N/A"}</Typography>
              </Box>
              <Box
                sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}
              >
                <Typography sx={{ fontWeight: 500 }}>Total Amount:</Typography>
                <Typography>₹{totalAmount || "0.00"}</Typography>
              </Box>
              {applyCoupon && coupon && (
                <>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography sx={{ fontWeight: 500 }}>Coupon:</Typography>
                    <Typography>
                      {coupon.code} ({(coupon.discount * 100).toFixed(0)}% off)
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography sx={{ fontWeight: 500 }}>Discount:</Typography>
                    <Typography>₹{discountAmount.toFixed(2)}</Typography>
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      mb: 1,
                    }}
                  >
                    <Typography sx={{ fontWeight: 500 }}>
                      Final Amount:
                    </Typography>
                    <Typography>₹{finalAmount.toFixed(2)}</Typography>
                  </Box>
                </>
              )}
              {paymentAmountOption && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 1,
                  }}
                >
                  <Typography sx={{ fontWeight: 500 }}>
                    Payment Amount:
                  </Typography>
                  <Typography>
                    ₹{calculatePaymentAmount().toFixed(2)}
                    {paymentAmountOption === "25%" && " (25% Now + COD)"}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>

          {/* Payment Options */}
          <Box>
            <Typography
              sx={{
                fontSize: "1.1rem",
                fontWeight: 600,
                color: "#4a2c6b",
                mb: 1.5,
                textAlign: "center",
              }}
            >
              Payment Options
            </Typography>
            <RadioGroup
              value={paymentAmountOption}
              onChange={handlePaymentAmountChange}
              sx={{ mb: 2, px: 1 }}
            >
              <FormControlLabel
                value="25%"
                control={
                  <Radio
                    sx={{
                      color: "#f06292",
                      "&.Mui-checked": { color: "#f06292" },
                    }}
                  />
                }
                label={`Pay 25% Now (₹${(finalAmount * 0.25).toFixed(
                  2
                )}) + COD`}
                disabled={loading}
                sx={{ color: "#4a2c6b", fontSize: "0.8rem" }}
              />
              <FormControlLabel
                value="full"
                control={
                  <Radio
                    sx={{
                      color: "#f06292",
                      "&.Mui-checked": { color: "#f06292" },
                    }}
                  />
                }
                label={`Pay Full Amount (₹${finalAmount.toFixed(2)})`}
                disabled={loading}
                sx={{ color: "#4a2c6b", fontSize: "0.8rem" }}
              />
            </RadioGroup>

            {/* Coupon Input */}
            <TextField
              fullWidth
              label="Enter Coupon Code"
              value={couponCode}
              onChange={handleCouponChange}
              sx={{
                mb: 2,
                background: "#ffffff",
                borderRadius: "10px",
                // border: "1px solid #f06292",
                "& .MuiOutlinedInput-root": {
                  "&:hover fieldset": { borderColor: "#f06292" },
                  "&.Mui-focused fieldset": { borderColor: "#f06292" },
                },
                "& .MuiInputLabel-root.Mui-focused": { color: "#f06292" },
                "& .MuiInputBase-input": {
                  fontSize: "0.8rem",
                  color: "#4a2c6b",
                },
              }}
              error={!!couponError}
              helperText={couponError}
              disabled={loading}
            />

            {coupon && (
              <Button
                variant="outlined"
                onClick={handleApplyCoupon}
                sx={{
                  mb: 2,
                  borderRadius: "10px",
                  color: "#4a2c6b",
                  borderColor: "#f06292",
                  "&:hover": {
                    borderColor: "#ec407a",
                    color: "#ec407a",
                    background: "#f9e6eb",
                  },
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "0.8rem",
                  px: 3,
                }}
                disabled={loading}
              >
                {applyCoupon
                  ? "Remove Coupon"
                  : `Apply Coupon (${coupon.code})`}
              </Button>
            )}

            {couponError.includes("Would you like to redeem a new coupon?") && (
              <Button
                variant="contained"
                onClick={redeemCoupon}
                sx={{
                  mb: 2,
                  borderRadius: "10px",
                  background: "#f06292",
                  color: "#ffffff",
                  "&:hover": { background: "#ec407a" },
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "0.8rem",
                  px: 3,
                }}
                disabled={loading}
              >
                Redeem New Coupon
              </Button>
            )}

            {paymentAmountOption && (
              <Typography
                sx={{
                  mb: 2,
                  color: "#4a2c6b",
                  fontSize: "0.75rem",
                  textAlign: "center",
                  cursor: "pointer",
                  "&:hover": { color: "#f06292" },
                }}
                onClick={handleOpenModal}
              >
                I agree to the Terms & Conditions
              </Typography>
            )}

            {error && (
              <Alert
                severity="error"
                sx={{ mb: 2, borderRadius: "10px", fontSize: "0.75rem" }}
              >
                {error}
              </Alert>
            )}

            {couponError &&
              !couponError.includes(
                "Would you like to redeem a new coupon?"
              ) && (
                <Alert
                  severity="error"
                  sx={{ mb: 2, borderRadius: "10px", fontSize: "0.75rem" }}
                >
                  {couponError}
                </Alert>
              )}

            {showSuccess && (
              <Alert
                severity="success"
                sx={{ mb: 2, borderRadius: "10px", fontSize: "0.75rem" }}
              >
                Payment option selected successfully!
              </Alert>
            )}

            {/* Serrated/Torn Edge Divider */}
            <Box
              sx={{
                borderTop: "2px dashed #ccc",
                width: "100%",
                my: 2,
              }}
            />
            {/* Buttons */}
            <Box sx={{ display: "flex", gap: 2, justifyContent: "center" }}>
              <Button
                variant="outlined"
                onClick={() => navigate(-1)}
                sx={{
                  borderRadius: "10px",
                  color: "#4a2c6b",
                  borderColor: "#f06292",
                  "&:hover": {
                    borderColor: "#ec407a",
                    color: "#ec407a",
                    background: "#f9e6eb",
                  },
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "0.8rem",
                  px: 3,
                }}
                disabled={loading}
              >
                Back
              </Button>
              <Button
                variant="contained"
                onClick={handleConfirm}
                sx={{
                  borderRadius: "10px",
                  background: "#f06292",
                  color: "#ffffff",
                  "&:hover": { background: "#ec407a" },
                  fontFamily: "'Poppins', sans-serif",
                  fontSize: "0.8rem",
                  px: 3,
                }}
                disabled={loading}
              >
                Confirm Payment
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Right Column: Image */}
        <Box
          sx={{
            flex: 1,
            minWidth: { xs: "100%", sm: "45%" },
            p: { xs: 2, sm: 4 },
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <img
            src={image}
            alt="Parlor Booking"
            style={{
              maxWidth: "100%",
              height: "70vh",
            }}
          />
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
              p: 4,
              maxWidth: 500,
              width: "90%",
              position: "relative",
              fontFamily: "'Montserrat', sans-serif",
              boxShadow: 3,
              borderRadius: 2,
            }}
          >
            <IconButton
              onClick={handleCloseModal}
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                color: "#f06292",
              }}
            >
              <CloseIcon />
            </IconButton>
            <Typography
              id="terms-modal-title"
              variant="h6"
              sx={{
                color: "#000000",
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
                bgcolor: "#f06292",
                color: "#ffffff",
                px: 4,
                py: 1,
                fontWeight: 500,
                "&:hover": { bgcolor: "#ec407a" },
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
            color: #000000;
          }
        `}
      </style>
    </Box>
  );
};

export default Pay;

import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Paper,
  Alert,
  useTheme,
  useMediaQuery,
  CircularProgress,
  IconButton,
  Tooltip,
} from "@mui/material";
import { motion, AnimatePresence } from "framer-motion";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const LeadCaptureForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [copySuccess, setCopySuccess] = useState(false);
  const [userStatus, setUserStatus] = useState(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Validation patterns
  const patterns = {
    name: /^[a-zA-Z\s]{2,50}$/,
    phone: /^[6-9]\d{9}$/,
  };

  const titleStyles = {
    fontSize: {
      xs: "1.5rem",
      sm: "1.75rem",
      md: "2rem",
      lg: "2.25rem",
      xl: "2.5rem",
      xxl: "3rem",
    },
    fontWeight: 700,
    textAlign: "center",
    marginBottom: {
      xs: "1.5rem",
      sm: "2rem",
      md: "2.5rem",
    },
    background: "#FB646B",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
    color: "#FB646B",
  };

  // Error messages
  const errorMessages = {
    name: {
      required: "Name is required",
      pattern: "Name should only contain letters and spaces (2-50 characters)",
    },
    phone: {
      required: "Phone number is required",
      pattern:
        "Phone number must start with 6, 7, 8, or 9 and be 10 digits long",
    },
  };

  const validateField = (name, value) => {
    if (!value) return errorMessages[name].required;
    if (patterns[name] && !patterns[name].test(value)) {
      return errorMessages[name].pattern;
    }
    return "";
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const error = validateField(field, formData[field]);
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({ ...prev, [name]: error }));
    }
  };

  const generateCouponCode = () => {
    return `FIRST10-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  };

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(couponCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const newErrors = {};
    Object.keys(formData).forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    setTouched({ name: true, phone: true });

    if (Object.keys(newErrors).length === 0) {
      setIsSubmitting(true);

      try {
        const token = localStorage.getItem("token");

        const userId = localStorage.getItem("userId");

        if (!userId) {
          setErrors({ submit: "Please log in to claim your coupon" });
          setIsSubmitting(false);
          return;
        }

        // Check user status
        const statusResponse = await fetch(`${BASE_URL}/api/coupons/status`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        });

        const statusResult = await statusResponse.json();

        if (!statusResponse.ok) {
          throw new Error(
            statusResult.message || "Failed to check user status"
          );
        }

        if (statusResult.isNewUser && !statusResult.couponClaimed) {
          // Only new users get the coupon
          const newCoupon = generateCouponCode();
          const claimResponse = await fetch(`${BASE_URL}/api/coupons/claim`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              userId,
              couponCode: newCoupon,
              phone: formData.phone,
            }),
          });

          const claimResult = await claimResponse.json();

          if (!claimResponse.ok) {
            throw new Error(claimResult.message || "Failed to claim coupon");
          }

          setCouponCode(claimResult.coupon.code);
          setUserStatus("new");
          setSubmitted(true);
        } else {
          // Existing users or users with a claimed coupon
          setUserStatus("existing");
          setSubmitted(true);
        }
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          submit: error.message || "Something went wrong. Please try again.",
        }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  const containerStyles = {
    // minHeight: "100vh",
    width: "100%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    padding: "2rem",
  };

  return (
    <div style={{ backgroundColor: "#fad9e3", }}>
      <Container maxWidth={false} disableGutters sx={containerStyles}>
        <Paper
          elevation={8}
          sx={{ padding: "2rem", maxWidth: "480px", width: "100%" }}
        >
          <Typography
            variant="h1"
            sx={titleStyles}
            style={{ color: "#FB646B" }}
          >
            Get 10% Off Your First Booking!
          </Typography>
          <AnimatePresence>
            {submitted ? (
              couponCode ? (
                <Box textAlign="center">
                  <Alert severity="success">
                    {userStatus === "new"
                      ? "Welcome! Here's your 10% off coupon for your first booking:"
                      : "Coupon claimed successfully!"}
                  </Alert>
                  <Box
                    sx={{
                      mt: 2,
                      p: 2,
                      bgcolor: "grey.800",
                      borderRadius: 1,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: 1,
                    }}
                  >
                    <Typography variant="h6">{couponCode}</Typography>
                    <Tooltip title={copySuccess ? "Copied!" : "Copy Coupon"}>
                      <IconButton
                        onClick={handleCopyCoupon}
                        color={copySuccess ? "success" : "primary"}
                      >
                        <ContentCopyIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                  <Typography sx={{ mt: 2 }}>
                    Use this code at checkout to get 10% off your first booking!
                  </Typography>
                </Box>
              ) : (
                <Alert severity="info">
                  {userStatus === "existing"
                    ? "Thank you! As an existing user, check our current promotions for other great offers!"
                    : "You have already claimed a coupon. Check your account for details!"}
                </Alert>
              )
            ) : (
              <form onSubmit={handleSubmit}>
                <Box display="flex" flexDirection="column" gap="1.5rem">
                  <TextField
                    label="Name"
                    name="name"
                    value={formData.name}
                    onChange={(e) => {
                      let value = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                      if (value.length === 0 || value[0] !== " ") {
                        handleChange({ target: { name: "name", value } });
                      }
                    }}
                    onBlur={() => handleBlur("name")}
                    error={touched.name && !!errors.name}
                    helperText={touched.name && errors.name}
                    fullWidth
                  />
                  <TextField
                    label="Phone Number"
                    name="phone"
                    inputProps={{ maxLength: 10 }}
                    value={formData.phone}
                    onChange={(e) => {
                      const numericValue = e.target.value.replace(
                        /[^0-9]/g,
                        ""
                      );
                      handleChange({
                        target: { name: "phone", value: numericValue },
                      });
                    }}
                    onBlur={() => handleBlur("phone")}
                    error={touched.phone && !!errors.phone}
                    helperText={touched.phone && errors.phone}
                    fullWidth
                  />
                  {errors.submit && (
                    <Alert severity="error">{errors.submit}</Alert>
                  )}
                  <style>
                    {`
                    .btn-content {
                      display: flex;
                      align-items: center;
                      padding: 12px 30px;
                      text-decoration: none;
                      font-family: 'Poppins', sans-serif;
                      font-weight: 600;
                      font-size: 18px;
                      color: rgb(244,245,247);
                      background: #FB646B;
                      transition: all 0.5s ease;
                      border-radius: 50px;
                      box-shadow: 0 5px 15px rgba(32, 21, 72, 0.5);
                      border: none;
                      position: relative;
                      overflow: hidden;
                      z-index: 1;
                    }
                  `}
                  </style>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                    className="btn-content"
                  >
                    {isSubmitting ? (
                      <CircularProgress size={24} />
                    ) : (
                      "Claim Your 10% Off"
                    )}
                  </Button>
                </Box>
              </form>
            )}
          </AnimatePresence>
        </Paper>
      </Container>
    </div>
  );
};

export default LeadCaptureForm;
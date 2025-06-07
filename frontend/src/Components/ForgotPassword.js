import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Typography, TextField, Button, InputAdornment, IconButton, useMediaQuery, useTheme } from '@mui/material';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';
import { motion } from 'framer-motion';
import axios from 'axios';
import Ravi1 from './Assets/ForgotPasswordImage.jpeg'; // Adjust the path based on your project structure

const BASE_URL = process.env.REACT_APP_API_URL;

const ForgotPassword = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    designation: '',
    otp: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({
    otp: '',
    password: '',
    confirmPassword: '',
  });
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  useEffect(() => {
    if (location.state) {
      setFormData((prev) => ({
        ...prev,
        email: location.state.email || '',
        designation: location.state.designation || '',
      }));
    }
  }, [location.state]);

  const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
  };

  const handleSendOTP = async () => {
    if (!formData.email || !formData.designation) {
      alert('Email and role are required to send OTP');
      return;
    }

    const otp = generateOTP();
    setIsLoading(true);

    try {
      const response = await axios.post(`${BASE_URL}/api/users/ForgotPassword/SendOTP`, {
        email: formData.email,
        OTP: otp,
        designation: formData.designation,
      });

      alert(response.data.message); // Notify user that OTP was sent
      setIsOtpSent(true);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!formData.otp) {
      setErrors((prev) => ({ ...prev, otp: 'OTP is required' }));
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/users/get/otp`, {
        email: formData.email,
        designation: formData.designation,
      });

      const { otp } = response.data;
      if (otp == formData.otp) {
        alert('OTP verified successfully');
        setIsOtpVerified(true);
        setErrors((prev) => ({ ...prev, otp: '' }));
        setFormData((prev) => ({ ...prev, otp: '' })); // Clear OTP field
      } else {
        setErrors((prev) => ({ ...prev, otp: 'Invalid OTP' }));
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to verify OTP');
      setErrors((prev) => ({ ...prev, otp: error.response?.data?.message || 'Server error' }));
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === 'otp') {
      setErrors((prev) => ({ ...prev, otp: value ? '' : 'OTP is required' }));
    }

    if (name === 'password') {
      let error = '';
      if (!value) {
        error = 'Password is required';
      } else if (!passwordRegex.test(value)) {
        error =
          'Password must contain at least 8 characters, one uppercase letter, one number, and one special character';
      }
      setErrors((prev) => ({ ...prev, password: error }));
    }

    if (name === 'confirmPassword') {
      let error = '';
      if (!value) {
        error = 'Confirm password is required';
      } else if (value !== formData.password) {
        error = 'Passwords do not match';
      }
      setErrors((prev) => ({ ...prev, confirmPassword: error }));
    }
  };

  const handleResetPassword = async () => {
    if (errors.password || errors.confirmPassword || !formData.password || !formData.confirmPassword) {
      alert('Please correct the errors in the form');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.put(`${BASE_URL}/api/users/update/password`, {
        email: formData.email,
        designation: formData.designation,
        password: formData.password,
      });

      alert(response.data.message); // Show success message
      navigate('/login'); // Redirect to login page
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update password');
    } finally {
      setIsLoading(false);
    }
  };

  const inputSx = {
    mb: 2,
    '& .MuiInputBase-root': {
      borderRadius: '8px',
      backgroundColor: '#f5f5f5',
      color: 'black',
      border: 'none',
      '&:hover, &.Mui-focused': {
        borderColor: '#ff6f91',
        transform: 'scale(1.02)',
      },
    },
    '& .MuiInputBase-input': { color: 'black' },
    '& .MuiInputLabel-root': { color: '#555', '&.Mui-focused': { color: '#ff6f91' } },
    '& .MuiFormHelperText-root': { color: '#ff6f91' },
  };

  const buttonSx = {
    height: 50,
    borderRadius: '25px',
    background: 'linear-gradient(135deg, #ff6f91 0%, #ff8aa5 100%)',
    color: '#ffffff',
    fontSize: { xs: '16px', sm: '18px' },
    fontWeight: 'bold',
    textTransform: 'none',
    '&:hover': {
      background: 'linear-gradient(135deg, #ff8aa5 0%, #ff6f91 100%)',
    },
    '&:disabled': {
      backgroundColor: '#d3d3d3',
      color: '#a9a9a9',
    },
  };

  // Animation variants for Framer Motion (same as Login component)
  const childVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  };

  const imageVariants = {
    hover: { scale: 1.1, transition: { duration: 0.5 } },
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #ffe6e6 0%, #fff5f5 100%)',
        position: 'relative',
        px: { xs: 2, sm: 0 },
      }}
    >
      
      
      {/* Content Container */}
      <Box
        sx={{
          padding: { xs: '20px', sm: '30px' },
          width: { xs: '90vw', sm: '400px' },
          maxWidth: '450px',
          textAlign: 'center',
        }}
      >
        <Typography
          variant="h5"
          sx={{
            mb: 1,
            color: '#333',
            fontWeight: 'bold',
          }}
        >
          Forgot Password
        </Typography>

        {/* Add Image After "Forgot Password" Title - Visible on Mobile Only */}
        {isMobile && (
          <motion.div variants={childVariants} whileHover='hover'>
            <motion.img
              src={Ravi1}
              alt='Login illustration'
              variants={imageVariants}
              style={{
                width: '160px',
                height: '160px',
                borderRadius: '20px',
                objectFit: 'cover',
                marginBottom: '16px',
              }}
            />
          </motion.div>
        )}

        <Typography
          variant="body1"
          sx={{
            mb: 1,
            color: '#666',
          }}
        >
          <strong>Email:</strong> {formData.email || 'Not provided'}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            mb: 3,
            color: '#666',
          }}
        >
          <strong>Role:</strong> {formData.designation || 'Not provided'}
        </Typography>

        {!isOtpSent ? (
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="contained"
              onClick={handleSendOTP}
              disabled={isLoading || !formData.email || !formData.designation}
              fullWidth
              sx={buttonSx}
            >
              {isLoading ? 'Sending OTP...' : 'SEND OTP'}
            </Button>
          </motion.div>
        ) : !isOtpVerified ? (
          <>
            <TextField
              label="Enter OTP"
              name="otp"
              value={formData.otp}
              onChange={handleChange}
              fullWidth
              error={!!errors.otp}
              helperText={errors.otp}
              disabled={isLoading}
              sx={inputSx}
              inputProps={{ maxLength: 6, pattern: '[0-9]*', type: 'text' }}
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                onClick={handleVerifyOTP}
                disabled={isLoading || !formData.otp}
                fullWidth
                sx={buttonSx}
              >
                {isLoading ? 'Verifying OTP...' : 'Verify OTP'}
              </Button>
            </motion.div>
          </>
        ) : (
          <>
            <TextField
              label="New Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              value={formData.password}
              onChange={handleChange}
              fullWidth
              error={!!errors.password}
              helperText={errors.password}
              disabled={isLoading}
              sx={inputSx}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      disabled={isLoading}
                      sx={{ color: '#666' }}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm Password"
              type={showConfirmPassword ? 'text' : 'password'}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              fullWidth
              error={!!errors.confirmPassword}
              helperText={errors.confirmPassword}
              disabled={isLoading}
              sx={inputSx}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      disabled={isLoading}
                      sx={{ color: '#666' }}
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                onClick={handleResetPassword}
                disabled={isLoading || errors.password || errors.confirmPassword || !formData.password}
                fullWidth
                sx={buttonSx}
              >
                {isLoading ? 'Updating Password...' : 'Update Password'}
              </Button>
            </motion.div>
          </>
        )}
      </Box>
    </Box>
  );
};

export default ForgotPassword;
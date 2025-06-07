import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grow,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import axios from 'axios';
import React, { useEffect, useRef, useState } from 'react';

// Error Boundary to catch rendering errors
class ErrorBoundary extends React.Component {
  state = { hasError: false, error: null };

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <Typography color='error'>
          Something went wrong: {this.state.error?.message || 'Unknown error'}
        </Typography>
      );
    }
    return this.props.children;
  }
}

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000'; // Fallback for development

const CouponContainer = styled(Box)(({ theme }) => ({
  marginTop: '12px',
  padding: { xs: '8px', sm: '12px' },
  background: 'linear-gradient(135deg, #FF6F91, #D85CFF)',
  borderRadius: '8px',
  textAlign: 'center',
  color: '#FFF',
  fontWeight: 'bold',
  fontSize: { xs: '0.85rem', sm: '1rem' },
  boxShadow: '0px 4px 15px rgba(0,0,0,0.2), 0 0 10px rgba(255, 111, 145, 0.7)',
  backdropFilter: 'blur(5px)',
  WebkitBackdropFilter: 'blur(5px)',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  position: 'relative',
  overflow: 'hidden',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  animation: 'couponPop 0.5s ease-in-out',
  '@keyframes couponPop': {
    '0%': {
      transform: 'scale(0.9)',
      opacity: 0,
    },
    '100%': {
      transform: 'scale(1)',
      opacity: 1,
    },
  },
  '&:hover': {
    transform: 'scale(1.02)',
    boxShadow:
      '0px 6px 20px rgba(0,0,0,0.3), 0 0 15px rgba(255, 111, 145, 0.9)',
  },
}));

const CouponCode = styled(Typography)(({ theme }) => ({
  fontSize: { xs: '0.9rem', sm: '1.1rem' },
  letterSpacing: { xs: '1px', sm: '3px' },
  wordBreak: 'break-all',
  marginTop: '6px',
  color: '#FFF',
  fontFamily: '"Roboto Mono", monospace',
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  padding: '4px 8px',
  borderRadius: '4px',
}));

const UserProfile = () => {
  const userEmail = localStorage.getItem('email') || '';
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false); // Controls edit form visibility
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    dob: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);
  const [copied, setCopied] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const editFormRef = useRef(null); // Reference to the edit form Card
  // Fallback for mobile detection using window.innerWidth
  const [isMobile, setIsMobile] = useState(window.innerWidth < 900); // 900px is Material-UI's default 'md' breakpoint

  // Update isMobile on window resize
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 900);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!userEmail) {
      console.error('No user email found in localStorage');
      alert('User email not found. Please log in again.');
      return;
    }

    const fetchUser = async () => {
      try {
        const res = await axios.get(
          `${BASE_URL}/api/users/userProfile/${encodeURIComponent(userEmail)}`
        );
        console.log('User data fetched:', res.data);
        const userData = res.data || {};
        setUser(userData);
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          phone: userData.phone || '',
          dob: userData.dob || '',
          password: '',
          confirmPassword: '',
        });
        setLoyaltyPoints(userData.loyaltyPoints || 0);
        if (userData.couponCode && userData.couponCode !== 'NONE') {
          setCoupon({ code: userData.couponCode, discount: '10%' });
        } else {
          setCoupon(null);
        }
      } catch (err) {
        console.error('Failed to fetch user:', err);
        alert(
          err.response?.data?.message ||
            'Failed to load profile. Please check your connection and try again.'
        );
      }
    };

    fetchUser();
  }, [userEmail]);

  const validateField = (name, value) => {
    let error = '';

    if (name === 'name') {
      const isValid =
        /^[a-zA-Z]+[a-zA-Z\s]*[a-zA-Z]$/.test(value) &&
        value.length >= 2 &&
        value.length <= 50;
      error = value
        ? isValid
          ? ''
          : 'Name must be 2-50 characters, letters only, spaces allowed in middle but not at start or end'
        : 'Name is required';
    }

    if (name === 'email') {
      const isValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z]{2,}\.[a-zA-Z]{2,}$/.test(
        value
      );
      error = value
        ? isValid
          ? ''
          : 'Enter a valid email address'
        : 'Email is required';
    }

    if (name === 'phone') {
      const cleanedValue = value.replace(/\s/g, '');
      if (cleanedValue === '') {
        error = 'Phone number is required';
      } else if (!/^[6-9]\d{9}$/.test(cleanedValue)) {
        error =
          cleanedValue.length !== 10
            ? 'Invalid phone number (must be 10 digits)'
            : 'Phone number must start with 6, 7, 8, or 9';
      }
    }

    if (name === 'dob') {
      if (!value) {
        error = 'Date of birth is required';
      } else {
        const selectedDate = new Date(value);
        const today = new Date();
        const minDate = new Date();
        minDate.setFullYear(today.getFullYear() - 18);

        if (isNaN(selectedDate.getTime())) {
          error = 'Invalid date format';
        } else if (selectedDate > today) {
          error = 'Date of birth cannot be in the future';
        } else if (selectedDate > minDate) {
          error = 'You must be at least 18 years old';
        }
      }
    }

    if (name === 'password' && value) {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      error = passwordRegex.test(value)
        ? ''
        : 'Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character';
    }

    if (name === 'confirmPassword' && value) {
      error = value === formData.password ? '' : 'Passwords do not match';
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === 'name') {
      newValue = value.replace(/[^a-zA-Z\s]/g, '');
      if (newValue.startsWith(' ')) {
        newValue = newValue.trimStart();
      }
    }

    if (name === 'phone') {
      newValue = value.replace(/\D/g, '').slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    const error = validateField(name, newValue);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleEdit = () => {
    console.log('Edit button clicked, showing edit form');
    setEditMode(true);
    setFormData((prev) => {
      console.log('Form data reset:', {
        ...prev,
        password: '',
        confirmPassword: '',
      });
      return { ...prev, password: '', confirmPassword: '' };
    });
    setErrors({});
    // Scroll to edit form immediately after rendering
    if (editFormRef.current) {
      setTimeout(() => {
        try {
          editFormRef.current.scrollIntoView({
            behavior: 'smooth',
            block: 'start',
          });
          console.log('Scrolled to edit form');
        } catch (err) {
          console.error('Failed to scroll to edit form:', err);
        }
      }, 150); // Delay for rendering
    } else {
      console.log('No scroll: editFormRef not available');
    }
  };

  const handleSave = () => {
    const newErrors = {};
    ['name', 'email', 'phone', 'dob'].forEach((key) => {
      const error = validateField(key, formData[key] || '');
      if (error) newErrors[key] = error;
    });

    if (formData.password) {
      const passwordError = validateField('password', formData.password);
      const confirmPasswordError = validateField(
        'confirmPassword',
        formData.confirmPassword
      );
      if (passwordError) newErrors.password = passwordError;
      if (confirmPasswordError)
        newErrors.confirmPassword = confirmPasswordError;
      if (!formData.confirmPassword)
        newErrors.confirmPassword = 'Confirm password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert('Please fix the errors in the form.');
      return;
    }

    if (!userEmail) {
      alert('User email not found. Please log in again.');
      return;
    }

    const updateData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      dob: formData.dob,
      // address: formData.address,
    };

    if (formData.password) {
      updateData.password = formData.password;
    }

    axios
      .put(
        `${BASE_URL}/api/users/updateProfile/${encodeURIComponent(userEmail)}`,
        updateData
      )
      .then((res) => {
        setUser(res.data.user || {});
        setLoyaltyPoints(res.data.user?.loyaltyPoints || 0);
        alert('Profile updated successfully!');
        setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
        setErrors({});
        setEditMode(false); // Hide edit form after saving
      })
      .catch((err) => {
        console.error('Failed to update profile:', err);
        alert(
          err.response?.data?.message ||
            'Failed to update profile. Please check your connection and try again.'
        );
      });
  };

  const handleRedeem = async () => {
    if (isRedeeming) return;
    console.log('handleRedeem called with:', {
      loyaltyPoints,
      userEmail,
      couponCode: user?.couponCode,
    });
    if (!user) {
      alert('User data not loaded. Please try again.');
      return;
    }
    if (loyaltyPoints < 100) {
      alert('You need at least 100 loyalty points to redeem a coupon.');
      return;
    }

    if (user.couponCode && user.couponCode !== 'NONE') {
      alert(
        'You already have an active coupon. Please use it before redeeming a new one.'
      );
      return;
    }

    if (!userEmail) {
      alert('User email not found. Please log in again.');
      return;
    }

    setIsRedeeming(true);
    const couponCode = `DISCMF10${Math.random()
      .toString(36)
      .substr(2, 6)
      .toUpperCase()}`;
    const newLoyaltyPoints = loyaltyPoints - 100;

    try {
      const res = await axios.put(
        `${BASE_URL}/api/users/updateProfile/${encodeURIComponent(userEmail)}`,
        {
          loyaltyPoints: newLoyaltyPoints,
          couponCode: couponCode,
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('Redeem response:', res.data);
      if (!res.data.user) {
        throw new Error('Invalid response: user data not found');
      }

      setUser({ ...res.data.user, couponCode });
      setLoyaltyPoints(newLoyaltyPoints);
      setCoupon({ code: couponCode, discount: '10%' });
      alert('Coupon redeemed successfully! 100 loyalty points deducted.');
    } catch (err) {
      console.error('Failed to redeem coupon:', err);
      let errorMessage = 'Failed to redeem coupon. Please try again.';
      if (err.response) {
        console.log('Error response:', err.response.data);
        if (err.response.status === 400) {
          errorMessage =
            err.response.data.message ||
            'Invalid request. Please check your input.';
        } else if (err.response.status === 401) {
          errorMessage = 'Unauthorized. Please log in again.';
        } else if (err.response.status === 404) {
          errorMessage = 'User not found. Please check your account.';
        } else if (err.response.status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        }
      } else if (err.request) {
        errorMessage = 'Network error. Please check your connection.';
      }
      alert(errorMessage);
    } finally {
      setIsRedeeming(false);
    }
  };

  const handleCopy = () => {
    if (coupon?.code) {
      navigator.clipboard
        .writeText(coupon.code)
        .then(() => {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        })
        .catch((err) => {
          console.error('Failed to copy coupon code:', err);
          alert('Failed to copy coupon code. Please try again.');
        });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Not specified';
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (!user) return <Typography>Loading profile...</Typography>;

  const isRedeemDisabled =
    !user ||
    loyaltyPoints < 100 ||
    (user.couponCode && user.couponCode !== 'NONE') ||
    isRedeeming;
  console.log('isRedeemDisabled:', isRedeemDisabled, {
    user: !!user,
    loyaltyPoints,
    couponCode: user?.couponCode,
    isRedeeming,
  });

  return (
    <ErrorBoundary>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          padding: { xs: '10px', sm: '20px' },
          // bgcolor: "#d3d3d3",
          width: '100%',
          // minHeight: "100vh",
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'column', md: 'row' },
            gap: { xs: 2, sm: 3 },
            justifyContent: 'center',
            alignItems: { xs: 'center', md: 'flex-start' },
            width: '100%',
            maxWidth: { xs: '100%', sm: '600px', md: '900px' }, // Limit container width
          }}
        >
          <Card
            sx={{
              width: { xs: '100%', sm: '400px' }, // Equal width for both cards
              maxWidth: '400px',
              boxShadow: '0px 6px 20px rgba(0,0,0,0.15)',
              borderRadius: 6,
              bgcolor: '#FFEBF1',
              transition: '0.3s ease',
              '&:hover': {
                transform: 'scale(1.01)',
              },
            }}
          >
            <CardContent sx={{ textAlign: 'center', p: 3 }}>
              {' '}
              {/* Changed textAlign to center */}
              <Typography variant='h5' gutterBottom fontWeight='bold'>
                Your Profile
              </Typography>
              <Typography
                variant='subtitle2'
                color='text.secondary'
                gutterBottom
              >
                Manage your personal information
              </Typography>
              <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                <Box
                  component='img'
                  src='https://static.vecteezy.com/system/resources/thumbnails/020/911/732/small/profile-icon-avatar-icon-user-icon-person-icon-free-png.png'
                  srcSet='https://static.vecteezy.com/system/resources/thumbnails/020/911/732/small/profile-icon-avatar-icon-user-icon-person-icon-free-png.png'
                  alt='Profile'
                  loading='lazy'
                  sx={{
                    width: { xs: '80px', sm: '100px' },
                    height: { xs: '80px', sm: '100px' },
                    borderRadius: '50%',
                    border: '2px solid #FF99CC',
                  }}
                />
              </Box>
              <Typography variant='h6' fontWeight='bold' sx={{ mt: 2 }}>
                {user.name || 'Unknown'}
              </Typography>
              <Typography
                variant='subtitle1'
                color='text.secondary'
                gutterBottom
              >
                {user.designation || 'Premium Member'}
              </Typography>
              <Box sx={{ mt: 2 }}>
                <Typography
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%',
                  }}
                >
                  <span role='img' aria-label='email'>
                    ✉️
                  </span>
                  {user.email || 'Not specified'}
                </Typography>
                <Typography
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    mt: 1,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    maxWidth: '100%',
                  }}
                >
                  <span role='img' aria-label='phone'>
                    📞
                  </span>
                  {user.phone || 'Not specified'}
                </Typography>
                <Typography
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    mt: 1,
                  }}
                >
                  <span role='img' aria-label='calendar'>
                    📅
                  </span>
                  Member since {formatDate(user.createdAt)}
                </Typography>
                <Typography
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 1,
                    mt: 1,
                  }}
                >
                  <span role='img' aria-label='points'>
                    ⭐
                  </span>
                  Loyalty Points: {loyaltyPoints}
                </Typography>
              </Box>
              <Box
                sx={{
                  mt: 3,
                  display: 'flex',
                  justifyContent: 'center',
                  gap: { xs: 1, sm: 2 },
                  flexWrap: 'wrap',
                }}
              >
                <Button
                  id='edit-profile-button'
                  variant='contained'
                  sx={{
                    px: 3,
                    py: 0.5,
                    borderRadius: 6,
                    background: 'linear-gradient(90deg, #FF99CC, #CC66CC)',
                    color: '#FFFFFF',
                    fontWeight: 'bold',
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.2)',
                    textTransform: 'uppercase',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #FF80BF, #B34FB3)',
                    },
                  }}
                  onClick={handleEdit}
                  aria-label='Edit Profile'
                >
                  Edit
                </Button>
                <Button
                  variant='contained'
                  sx={{
                    px: 3,
                    py: 0.5,
                    borderRadius: 6,
                    background: 'linear-gradient(90deg, #FF99CC, #CC66CC)',
                    color: '#FFFFFF',
                    fontWeight: 'bold',
                    boxShadow: '0px 2px 8px rgba(0,0,0,0.2)',
                    textTransform: 'uppercase',
                    '&:hover': {
                      background: 'linear-gradient(90deg, #FF80BF, #B34FB3)',
                    },
                    '&:disabled': {
                      background: '#E8E8E8',
                      color: '#A0A0A0',
                      boxShadow: 'none',
                    },
                  }}
                  onClick={handleRedeem}
                  disabled={isRedeemDisabled}
                  aria-label='Redeem Points'
                >
                  {isRedeeming ? (
                    <CircularProgress size={24} color='inherit' />
                  ) : (
                    'Redeem Points'
                  )}
                </Button>
              </Box>
              {coupon && (
                <Box sx={{ mt: 3 }}>
                  <Grow in={true} timeout={500}>
                    <CouponContainer>
                      <Typography
                        sx={{
                          py: 1,
                          fontSize: { xs: '1rem', sm: '1.2rem' },
                          fontWeight: 'bold',
                        }}
                      >
                        Congratulations! You've received a {coupon.discount}{' '}
                        discount!
                      </Typography>
                      <Box
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 1,
                          m: 2,
                        }}
                      >
                        <CouponCode aria-live='polite'>
                          Coupon Code: {coupon.code}
                        </CouponCode>
                        <IconButton
                          onClick={handleCopy}
                          sx={{
                            color: '#FFF',
                            bgcolor: 'rgba(255, 255, 255, 0.2)',
                            '&:hover': {
                              bgcolor: 'rgba(255, 255, 255, 0.3)',
                            },
                            p: 0.5,
                          }}
                          aria-label='Copy coupon code'
                        >
                          {copied ? (
                            <Typography
                              variant='caption'
                              sx={{ color: '#FFF', fontSize: '0.8rem' }}
                            >
                              Copied!
                            </Typography>
                          ) : (
                            <ContentCopyIcon fontSize='small' />
                          )}
                        </IconButton>
                      </Box>
                    </CouponContainer>
                  </Grow>
                </Box>
              )}
            </CardContent>
          </Card>

          {editMode && (
            <Card
              ref={editFormRef} // Attach ref to the edit form Card
              sx={{
                width: { xs: '100%', sm: '400px' }, // Equal width for both cards
                maxWidth: '400px',
                boxShadow: '0px 6px 20px rgba(0,0,0,0.15)',
                borderRadius: '6px',
                bgcolor: '#FFFFFF',
                mt: { xs: 2, sm: 2, md: 0 }, // Ensure spacing in mobile views
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant='h6' gutterBottom fontWeight='bold'>
                  Edit Profile Information
                </Typography>
                {[
                  { label: 'Full Name', key: 'name', icon: '👤' },
                  { label: 'Email', key: 'email', icon: '✉️' },
                  { label: 'Phone Number', key: 'phone', icon: '📞' },
                  // { label: "Address", key: "address", icon: "📍" },
                  {
                    label: 'Date of Birth',
                    key: 'dob',
                    icon: '📅',
                    isDateInput: true,
                  },
                  {
                    label: 'Password',
                    key: 'password',
                    icon: '🔒',
                    isPassword: true,
                  },
                  {
                    label: 'Confirm Password',
                    key: 'confirmPassword',
                    icon: '🔒',
                    isPassword: true,
                  },
                ].map((item) => (
                  <Box key={item.key} sx={{ mt: { xs: 1.5, sm: 2 } }}>
                    <TextField
                      label={item.label}
                      variant='outlined'
                      size='small'
                      type={
                        item.isPassword
                          ? item.key === 'password' && showPassword
                            ? 'text'
                            : item.key === 'confirmPassword' &&
                              showConfirmPassword
                            ? 'text'
                            : 'password'
                          : item.isDateInput
                          ? 'date'
                          : 'text'
                      }
                      name={item.key}
                      value={formData[item.key] || ''}
                      onChange={handleChange}
                      fullWidth
                      error={!!errors[item.key]}
                      helperText={errors[item.key]}
                      InputLabelProps={item.isDateInput ? { shrink: true } : {}}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment
                            position='start'
                            sx={{ fontSize: { xs: '1.2rem', sm: '1.5rem' } }}
                          >
                            <span role='img' aria-label={item.label}>
                              {item.icon}
                            </span>
                          </InputAdornment>
                        ),
                        endAdornment: item.isPassword ? (
                          <InputAdornment position='end'>
                            <IconButton
                              onClick={() =>
                                item.key === 'password'
                                  ? setShowPassword(!showPassword)
                                  : setShowConfirmPassword(!showConfirmPassword)
                              }
                              edge='end'
                            >
                              {item.key === 'password' ? (
                                showPassword ? (
                                  <VisibilityOffIcon />
                                ) : (
                                  <VisibilityIcon />
                                )
                              ) : showConfirmPassword ? (
                                <VisibilityOffIcon />
                              ) : (
                                <VisibilityIcon />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ) : null,
                      }}
                      inputProps={
                        item.isDateInput
                          ? {
                              max: new Date().toISOString().split('T')[0],
                              min: new Date(
                                new Date().setFullYear(
                                  new Date().getFullYear() - 100
                                )
                              )
                                .toISOString()
                                .split('T')[0],
                            }
                          : {}
                      }
                    />
                  </Box>
                ))}
                <Box
                  sx={{
                    mt: 3,
                    display: 'flex',
                    justifyContent: { xs: 'center', sm: 'flex-end' },
                  }}
                >
                  <Button
                    variant='contained'
                    sx={{
                      px: 3,
                      py: 0.5,
                      borderRadius: 6,
                      background: 'linear-gradient(90deg, #FF99CC, #CC66CC)',
                      color: '#FFFFFF',
                      fontWeight: 'bold',
                      boxShadow: '0px 2px 8px rgba(0,0,0,0.2)',
                      textTransform: 'uppercase',
                      '&:hover': {
                        background: 'linear-gradient(90deg, #FF80BF, #B34FB3)',
                      },
                      '&:disabled': {
                        background: '#E8E8E8',
                        color: '#A0A0A0',
                        boxShadow: 'none',
                      },
                    }}
                    onClick={handleSave}
                    disabled={Object.values(errors).some((error) => error)}
                    aria-label='Save Changes'
                  >
                    Save Changes
                  </Button>
                </Box>
              </CardContent>
            </Card>
          )}
        </Box>
      </Box>
    </ErrorBoundary>
  );
};

export default UserProfile;

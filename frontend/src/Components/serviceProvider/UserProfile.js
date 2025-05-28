import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  IconButton,
  MenuItem,
  InputAdornment,
  Grow,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff';
import { styled } from '@mui/system';

const BASE_URL = process.env.REACT_APP_API_URL;

// Styled component for the coupon
const CouponContainer = styled(Box)(({ theme }) => ({
  marginTop: '20px',
  padding: '20px',
  background: 'linear-gradient(135deg, #ff6f61, #ffb88c)',
  borderRadius: '12px',
  textAlign: 'center',
  color: '#fff',
  fontWeight: 'bold',
  fontSize: '1.2rem',
  boxShadow: '0px 8px 20px rgba(0,0,0,0.2)',
  position: 'relative',
  overflow: 'hidden',
  animation: 'couponPop 0.5s ease-in-out',
  '@keyframes couponPop': {
    '0%': {
      transform: 'scale(0.8)',
      opacity: 0,
    },
    '100%': {
      transform: 'scale(1)',
      opacity: 1,
    },
  },
  [theme.breakpoints.down('sm')]: {
    fontSize: '1rem',
    padding: '15px',
  },
}));

const CouponCode = styled(Typography)(({ theme }) => ({
  fontSize: '1.5rem',
  letterSpacing: '2px',
  marginTop: '10px',
  [theme.breakpoints.down('sm')]: {
    fontSize: '1.2rem',
  },
}));

const UserProfile = () => {
  const userEmail = localStorage.getItem('email');
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [coupon, setCoupon] = useState(null);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  useEffect(() => {
    if (userEmail) {
      axios
        .get(`${BASE_URL}/api/users/userProfile/${encodeURIComponent(userEmail)}`)
        .then((res) => {
          setUser(res.data);
          setFormData({ ...res.data, password: '', confirmPassword: '' });
          setLoyaltyPoints(res.data.loyaltyPoints || 0);
          // Set existing coupon if available
          if (res.data.couponCode && res.data.couponCode !== 'NONE') {
            setCoupon({ code: res.data.couponCode, discount: '10%' });
          }else {
            setCoupon(null);
          }
        })
        .catch((err) => {
          // console.error('Failed to fetch user:', err);
          alert('Failed to load profile. Please try again.');
        });
    }
  }, [userEmail]);

  const validateField = (name, value) => {
    let error = '';

    if (name === 'name') {
      const isValid = /^[a-zA-Z]+[a-zA-Z\s]*[a-zA-Z]$/.test(value) && value.length >= 2 && value.length <= 50;
      error = value
        ? isValid
          ? ''
          : 'Name must be 2-50 characters, letters only, spaces allowed in middle but not at start or end'
        : 'Name is required';
    }

    if (name === 'email') {
      const isValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z]{2,}\.[a-zA-Z]{2,}$/.test(value);
      error = value ? (isValid ? '' : 'Enter a valid email address') : 'Email is required';
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
      const selectedDate = new Date(value);
      const today = new Date();
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 18);

      if (!value) {
        error = 'Date of birth is required';
      } else if (selectedDate > today) {
        error = 'Date of birth cannot be in the future';
      } else if (selectedDate > minDate) {
        error = 'You must be at least 18 years old';
      }
    }

    if (name === 'gender') {
      error = value ? '' : 'Gender is required';
    }

    if (name === 'password' && value) {
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
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
    setEditMode(true);
    setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
    setErrors({});
  };

  const handleSave = () => {
    const newErrors = {};
    ['name', 'email', 'phone', 'dob', 'gender'].forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (formData.password) {
      const passwordError = validateField('password', formData.password);
      const confirmPasswordError = validateField('confirmPassword', formData.confirmPassword);
      if (passwordError) newErrors.password = passwordError;
      if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;
      if (!formData.confirmPassword) newErrors.confirmPassword = 'Confirm password is required';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert('Please fix the errors in the form.');
      return;
    }

    const updateData = { ...formData };
    if (!updateData.password) {
      delete updateData.password;
    }
    delete updateData.confirmPassword;

    axios
      .put(`${BASE_URL}/api/users/updateProfile/${encodeURIComponent(userEmail)}`, updateData)
      .then((res) => {
        setUser(res.data.user);
        setLoyaltyPoints(res.data.user.loyaltyPoints || 0);
        alert('Profile updated successfully!');
        setFormData((prev) => ({ ...prev, password: '', confirmPassword: '' }));
        setErrors({});
        setEditMode(false);
      })
      .catch((err) => {
        alert(err.response?.data?.message || 'Update failed');
      });
  };

  const handleRedeem = () => {
    // Check if user has enough points
    if (loyaltyPoints < 100) {
      alert('You need at least 100 loyalty points to redeem a coupon.');
      return;
    }

    // Check if an existing coupon is present
    if (user.couponCode !== 'NONE') {
      alert('You already have an active coupon. Please use it before redeeming a new one.');
      return;
    }

    // Generate a random coupon code
    const couponCode = `DISC${Math.random().toString(36).substr(2, 8).toUpperCase()}`;
    setCoupon({ code: couponCode, discount: '10%' });

    // Deduct 100 loyalty points and update backend
    const newLoyaltyPoints = loyaltyPoints - 100;
    axios
      .put(`${BASE_URL}/api/users/updateProfile/${userEmail}`, {
        ...formData,
        loyaltyPoints: newLoyaltyPoints,
        couponCode: couponCode,
      })
      .then((res) => {
        setUser(res.data.user);
        setLoyaltyPoints(newLoyaltyPoints);
        alert('Coupon redeemed successfully! 100 loyalty points deducted.');
      })
      .catch((err) => {
        // console.error('Failed to update loyalty points:', err);
        alert(err.response?.data?.message || 'Failed to redeem coupon.');
        setCoupon(null); // Revert coupon if update fails
      });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return 'Not specified';
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (!user) return <p>Loading profile...</p>;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 10 }}>
      <Card
        sx={{
          width: { xs: '95%', sm: '90%' },
          maxWidth: 600,
          boxShadow: '0px 10px 30px rgba(0,0,0,0.3)',
          borderRadius: 4,
          transform: 'rotateX(3deg)',
          transition: '0.3s ease',
          '&:hover': {
            transform: 'rotateX(0deg) scale(1.02)',
          },
        }}
      >
        <CardContent sx={{ textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom fontWeight="bold">
            User Profile
          </Typography>

          {[
            { label: 'Name', key: 'name' },
            { label: 'Email', key: 'email' },
            { label: 'Gender', key: 'gender', isSelect: true },
            { label: 'Phone', key: 'phone' },
            { label: 'Date of Birth', key: 'dob', isDateInput: true },
            { label: 'Designation', key: 'designation', disabled: true },
            { label: 'Joined At', key: 'createdAt', disabled: true, isDate: true },
            { label: 'Loyalty Points', key: 'loyaltyPoints', disabled: true },
            { label: 'Password', key: 'password', isPassword: true },
            ...(editMode
              ? [{ label: 'Confirm Password', key: 'confirmPassword', isPassword: true, isConfirmPassword: true }]
              : []),
          ].map((item) => (
            <Box key={item.key} sx={{ mt: 2 }}>
            <Box
              
              sx={{
          
                display: { xs: 'block', md: 'flex' },
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 2,
              }}
            >
              <Typography
                fontWeight="600"
                sx={{ flex: { md: '0 0 150px' }, textAlign: { md: 'left' } }}
              >
                {item.label}:
              </Typography>
              {editMode && !item.disabled ? (
                item.isPassword ? (
                  <Box sx={{ position: 'relative', display: 'inline-block', flex: 1 }}>
                    <TextField
                      variant="outlined"
                      size="small"
                      type={item.isConfirmPassword ? (showConfirmPassword ? 'text' : 'password') : (showPassword ? 'text' : 'password')}
                      name={item.key}
                      value={formData[item.key] || ''}
                      onChange={handleChange}
                      placeholder={item.isConfirmPassword ? 'Confirm new password' : 'Enter new password'}
                      fullWidth
                      error={!!errors[item.key]}
                      helperText={errors[item.key]}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                item.isConfirmPassword
                                  ? setShowConfirmPassword(!showConfirmPassword)
                                  : setShowPassword(!showPassword)
                              }
                              sx={{ position: 'absolute', right: 0, top: 0 }}
                            >
                              {(item.isConfirmPassword ? showConfirmPassword : showPassword) ? (
                                <VisibilityOffIcon />
                              ) : (
                                <VisibilityIcon />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Box>
                ) : item.isSelect ? (
                  <TextField
                    select
                    variant="outlined"
                    size="small"
                    name={item.key}
                    value={formData[item.key] || ''}
                    onChange={handleChange}
                    fullWidth
                    sx={{ flex: 1 }}
                    error={!!errors[item.key]}
                    helperText={errors[item.key]}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Others">Others</MenuItem>
                  </TextField>
                ) : (
                  <TextField
                    variant="outlined"
                    size="small"
                    type={item.isDateInput ? 'date' : 'text'}
                    name={item.key}
                    value={formData[item.key] || ''}
                    onChange={handleChange}
                    fullWidth
                    sx={{ flex: 1 }}
                    error={!!errors[item.key]}
                    helperText={errors[item.key]}
                    InputLabelProps={item.isDateInput ? { shrink: true } : {}}
                    inputProps={
                      item.isDateInput
                        ? {
                            max: new Date().toISOString().split('T')[0],
                            min: new Date(new Date().setFullYear(new Date().getFullYear() - 100))
                              .toISOString()
                              .split('T')[0],
                          }
                        : {}
                    }
                  />
                )
              ) : (
                <Typography sx={{ flex: 1, textAlign: { md: 'left' } }}>
                  {item.isPassword
                    ? '********'
                    : item.key === 'loyaltyPoints'
                    ? loyaltyPoints
                    : item.isDate
                    ? formatDate(user[item.key])
                    : user[item.key] || 'Not specified'}
                </Typography>
              )}
            </Box>
            {item.key === 'loyaltyPoints' && (
      <Box sx={{ mt: 1, textAlign: { xs: 'center', md: 'left' } }}>
        <Typography variant="caption" sx={{ color: 'text.secondary' }}>
          For every 100 points, you can redeem them and use the coupon code to avail a 10% discount.
        </Typography>
      </Box>
    )}
    </Box>
          ))}

          <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            {editMode ? (
              <Button
                variant="contained"
                color="success"
                onClick={handleSave}
                sx={{ px: 4, borderRadius: 3, minWidth: { xs: '100px', sm: '120px' } }}
                disabled={Object.values(errors).some((error) => error)}
              >
                Save
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleEdit}
                sx={{ px: 4, borderRadius: 3, minWidth: { xs: '100px', sm: '120px' } }}
              >
                Edit
              </Button>
            )}
            <Button
              variant="contained"
              color="secondary"
              onClick={handleRedeem}
              sx={{ px: 4, borderRadius: 3, minWidth: { xs: '100px', sm: '120px' } }}
              disabled={loyaltyPoints < 100 || coupon !== null} // Disable if insufficient points or active coupon exists
            >
              Redeem
            </Button>
          </Box>

          {coupon && (
            <Grow in={true} timeout={500}>
              <CouponContainer>
                <Typography>Congratulations! You've received a {coupon.discount} discount!</Typography>
                <CouponCode>Coupon Code: {coupon.code}</CouponCode>
              </CouponContainer>
            </Grow>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default UserProfile;
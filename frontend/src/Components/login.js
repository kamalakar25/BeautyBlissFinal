import React, { useState, useRef } from 'react';
import Ravi from './Assets/loginimag.jpeg';
import { motion } from 'framer-motion';
import Tooltip from '@mui/material/Tooltip';
import {
  Box,
  Button,
  TextField,
  Typography,
  Link,
  Stack,
  InputAdornment,
  useMediaQuery,
  useTheme,
  keyframes,
} from '@mui/material';
import EmailOutlined from '@mui/icons-material/EmailOutlined';
import LockOutlined from '@mui/icons-material/LockOutlined';
import { useNavigate } from 'react-router-dom';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Define keyframes for form and input animations
const formAnimation = keyframes`
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
`;

const glowAnimation = keyframes`
  0% { box-shadow: 0 0 5px rgba(255, 111, 145, 0.3); }
  50% { box-shadow: 0 0 15px rgba(255, 111, 145, 0.6); }
  100% { box-shadow: 0 0 5px rgba(255, 111, 145, 0.3); }
`;

// Animation variants for Framer Motion
const containerVariants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: 'easeOut', staggerChildren: 0.2 },
  },
};

const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const buttonVariants = {
  hover: { scale: 1.05 },
  tap: { scale: 0.95 },
};

const imageVariants = {
  hover: { scale: 1.1, transition: { duration: 0.5 } },
};

const Login = () => {
  const [form, setForm] = useState({ identifier: '', password: '' });
  const [errors, setErrors] = useState({ identifier: '', password: '' });
  const [selectedRole, setSelectedRole] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isFocused, setIsFocused] = useState({ identifier: false, password: false });

  // Add refs for the TextFields
  const identifierInputRef = useRef(null);
  const passwordInputRef = useRef(null);


  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();

  const mobileRegex = /^[6-9]\d{9}$/;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z]{2,}\.[a-zA-Z]{2,}$/;
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  // Handle input change with debouncing for smoother validation
  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value.trimStart();

    if (name === 'identifier' && /^[0-9]/.test(value)) {
      newValue = value.replace(/\D/g, '').slice(0, 10);
    }

    setForm({ ...form, [name]: newValue });
    validateField(name, newValue);
  };

  // Validate field with immediate feedback
  const validateField = (name, value) => {
    if (name === 'identifier') {
      let error = '';
      if (!value) {
        error = 'Email or Phone is required';
      } else if (/^[0-9]/.test(value)) {
        if (!mobileRegex.test(value)) {
          error = 'Invalid mobile number. Must be 10 digits starting with 6-9.';
        }
      } else {
        if (!emailRegex.test(value)) {
          error = 'Invalid email format.';
        }
      }
      setErrors((prev) => ({ ...prev, identifier: error }));
    }

    if (name === 'password') {
      let error = '';
      if (!value) {
        error = 'Password is required';
      } else if (value.length < 8) {
        error = 'Password must be at least 8 characters';
      } else if (!passwordRegex.test(value)) {
        error =
          'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character';
      }
      setErrors((prev) => ({ ...prev, password: error }));
    }
  };

  // Handle input focus
  const handleFocus = (field) => {
    setIsFocused((prev) => ({ ...prev, [field]: true }));
  };

  // Handle input blur
  const handleBlur = (e) => {
    const { name, value } = e.target;
    setIsFocused((prev) => ({ ...prev, [name]: false }));
    validateField(name, value);
  };

  // Handle role selection
  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setForm({ identifier: '', password: '' });
    setErrors({ identifier: '', password: '' });
    setIsFocused({ identifier: false, password: false });
  };

  // Handle login with improved error handling
  const handleLogin = async (e) => {
    e.preventDefault();
    const { identifier, password } = form;

    if (errors.identifier || errors.password || !identifier || !password) {
      alert('Please correct the errors in the form');
      return;
    }

    if (!selectedRole) {
      alert('Please select a role: User, Admin, or ServiceProvider');
      return;
    }

    if (selectedRole === 'Admin') {
      if (identifier === 'admin@gmail.com' && password === 'Admin@123') {
        alert('Admin login successful');
        localStorage.setItem('token', 'admin-token-placeholder');
        localStorage.setItem('email', identifier);
        localStorage.setItem('userRole', selectedRole);
        navigate('/approvals');
        window.location.reload();
        return;
      } else {
        alert('Invalid Admin credentials');
        return;
      }
    }

    try {
      setIsLoading(true);
      const response = await fetch(`${BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier, password, role: selectedRole }),
      });

      const data = await response.json();

      if (response.ok) {
        alert(data.message || 'Login successful');
        localStorage.setItem('token', data.token);
        localStorage.setItem('email', identifier);
        localStorage.setItem('userRole', selectedRole);
        localStorage.setItem('userId', data._id);

        if (selectedRole === 'User') {
          navigate('/');
          window.location.reload();
        } else if (selectedRole === 'ServiceProvider') {
          navigate('/services');
          window.location.reload();
        }
      } else {
        alert(data.message || 'Login failed');
      }
    } catch (err) {
      alert('Server error. Please try again later.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle forgot password with email validation
  const handleForgotPassword = () => {
    if (!form.identifier) {
      alert('Please enter registered email or phone');
      return;
    }
    if (!selectedRole) {
      alert('Please select a role');
      return;
    }
    if (!emailRegex.test(form.identifier)) {
      alert('Please provide a valid email address');
      return;
    }
    navigate('/ForgotPassword', {
      state: { email: form.identifier, designation: selectedRole === 'ServiceProvider' ? 'Shop' : 'User' },
    });
  };

  const inputSx = {
    width: '100%',
    mb: 2,
    '& .MuiFilledInput-root': {
      borderRadius: '25px',
      backgroundColor: '#ffffff',
      transition: 'all 0.3s ease-in-out',
      color: '#333333',
      boxShadow: '0px 3px 8px rgba(0, 0, 0, 0.2)',
      border: '2px solid #f35271',
      height: '48px',
      display: 'flex',
      alignItems: 'center',
      animation: isFocused.identifier || isFocused.password ? `${glowAnimation} 2s infinite` : 'none',
      '&:hover, &.Mui-focused': {
        borderColor: '#ff6f91',
        transform: 'scale(1.01)',
        boxShadow: '0px 5px 15px rgba(255, 111, 145, 0.4)',
      },
      '&:before, &:after': {
        borderBottom: 'none',
      },
    },
    '& .MuiFilledInput-input': {
      color: '#333333',
      padding: '14px 16px 14px 48px', // Adjusted for left-aligned adornment
      fontSize: '16px',
      height: '100%',
      boxSizing: 'border-box',
    },
    '& .MuiInputLabel-root': {
      color: '#666666',
      transform: 'translate(48px, 18px) scale(1)',
      '&.Mui-focused, &.MuiFormLabel-filled': {
        transform: 'translate(14px, -9px) scale(0.75)',
        color: '#ff6f91',
      },
    },
    '& .MuiFormHelperText-root': {
      color: '#ff4444',
      fontSize: '12px',
      mt: 0.5,
      ml: 2,
    },
  };

  const adornmentSx = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center', // Vertically center (top and bottom)
    gap: '8px',
    color: '#666666',
    fontSize: '14px',
    fontWeight: 500,
    position: 'absolute',
    left: '16px', // Left-aligned (not centered in width)
    marginTop: '0px !important',
    // height: '100%', // Ensure it takes full height of the input for vertical centering
  };

  const buttonSx = {
    height: 50,
    borderRadius: '25px',
    border: 'none',
    color: '#ffffff',
    background: 'linear-gradient(135deg, #ff6f91 0%, #ff8aa5 100%)',
    fontSize: { xs: '14px', sm: '16px' },
    fontWeight: 600,
    textTransform: 'none',
    transition: 'all 0.3s ease-in-out',
    boxShadow: '0px 4px 12px rgba(255, 111, 145, 0.3)',
    '&:hover': {
      background: 'linear-gradient(135deg, #ff8aa5 0%, #ff6f91 100%)',
      transform: 'scale(1.05)',
      boxShadow: '0px 6px 18px rgba(255, 111, 145, 0.5)',
    },
    '&:disabled': {
      background: '#666666',
      color: '#999999',
      boxShadow: 'none',
    },
  };

  const roleButtonSx = {
    borderRadius: '15px',
    borderWidth: '2px',
    borderColor: '#f35271',
    padding: '6px 20px',
    fontSize: '14px',
    fontWeight: 500,
    textTransform: 'none',
    transition: 'all 0.3s ease-in-out',
    boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.1)',
    '&:hover': {
      transform: 'scale(1.05)',
      boxShadow: '0px 4px 10px rgba(255, 111, 145, 0.3)',
    },
  };

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        // background: 'linear-gradient(135deg, #ffe6e9 0%, #ffd1d6 100%)',
        position: 'relative',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        overflowY: 'auto',
        px: { xs: 2, sm: 3 },
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          // background: 'rgba(255, 255, 255, 0.1)',
          zIndex: 1,
        },
      }}
    >
      <motion.div
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        style={{ zIndex: 2, width: '100%', maxWidth: '450px' }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            // gap: '20px',
            animation: `${formAnimation} 0.5s ease-in-out`,
            // py: 4,
          }}
        >
          <motion.div variants={childVariants}>
            <Box>
              <Typography
                variant='h6'
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 600,
                  fontSize: { xs: '1.3rem', sm: '1.5rem' },
                  color: '#333333',
                }}
              >
                Glad to meet you again!
              </Typography>
              <Typography
                variant='body1'
                sx={{
                  fontFamily: 'Poppins, sans-serif',
                  fontWeight: 400,
                  fontSize: { xs: '1.1rem', sm: '1.2rem' },
                  color: '#666666',
                  mt: '4px',
                  textAlign: 'center',
                }}
              >
                Please login
              </Typography>
            </Box>
          </motion.div>

          {isMobile && (
            <motion.div variants={childVariants} whileHover='hover'>
              <motion.img
                src={Ravi}
                alt='Login illustration'
                variants={imageVariants}
                style={{
                  width: '140px',
                  height: '140px',
                  borderRadius: '20px',
                  objectFit: 'cover',
                  marginBottom: '10px',
                }}
              />
            </motion.div>
          )}

          <motion.div variants={childVariants}>
            <Stack direction='row' spacing={2} justifyContent='center' mb={3}>
              {['User', 'ServiceProvider', 'Admin'].map((role) => (
                <Tooltip title={role === 'ServiceProvider' ? 'Service Provider' : role} arrow key={role}>
                  <motion.div variants={buttonVariants} whileHover='hover' whileTap='tap'>
                    <Button
                      variant={selectedRole === role ? 'contained' : 'outlined'}
                      onClick={() => handleRoleSelect(role)}
                      sx={{
                        ...roleButtonSx,
                        backgroundColor: selectedRole === role ? '#ff6f91' : '#ffffff',
                        color: selectedRole === role ? '#ffffff' : '#ff6f91',
                        '&:hover': {
                          backgroundColor: selectedRole === role ? '#ff8aa5' : '#fff5f7',
                          color: '#ff6f91',
                          borderColor: selectedRole === role ? '#ff8aa5' : '#f35271',
                        },
                      }}
                    >
                      {role === 'ServiceProvider' ? 'SP' : role}
                    </Button>
                  </motion.div>
                </Tooltip>
              ))}
            </Stack>
          </motion.div>

          <motion.div variants={childVariants} style={{ width: '100%', maxWidth: '350px' }}>
            <TextField
              id='identifier-input'
              variant='filled'
              name='identifier'
              value={form.identifier}
              onChange={handleChange}
              onFocus={() => handleFocus('identifier')}
              onBlur={handleBlur}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  const passwordInput = document.getElementById('password-input');
                  if (passwordInput) passwordInput.focus();
                }
                if (e.key === ' ') {
                  e.preventDefault();
                }
              }}
              error={!!errors.identifier}
              helperText={errors.identifier}
              required
              disabled={isLoading}
              autoComplete='email'
              sx={inputSx}
              inputRef={identifierInputRef} // Attach ref to TextField
              InputProps={{
                startAdornment: !isFocused.identifier && !form.identifier ? (
                  <InputAdornment position='start' sx={adornmentSx} onClick={() => identifierInputRef.current?.focus()}>
                    <EmailOutlined />
                    <Typography variant='body2'>Email/Phone</Typography>
                  </InputAdornment>
                ) : null,
                disableUnderline: true,
              }}
              label=''
            />
          </motion.div>

          <motion.div variants={childVariants} style={{ width: '100%', maxWidth: '350px' }}>
            <TextField
              id='password-input'
              type='password'
              variant='filled'
              name='password'
              value={form.password}
              onChange={handleChange}
              onFocus={() => handleFocus('password')}
              onBlur={handleBlur}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  handleLogin(e);
                }
              }}
              error={!!errors.password}
              helperText={errors.password}
              required
              disabled={isLoading}
              autoComplete='current-password'
              sx={inputSx}
              inputRef={passwordInputRef} // Attach ref to TextField
              InputProps={{
                startAdornment: !isFocused.password && !form.password ? (
                  <InputAdornment position='start' sx={adornmentSx} onClick={() => passwordInputRef.current?.focus()}>
                    <LockOutlined />
                    <Typography variant='body2'>Password</Typography>
                  </InputAdornment>
                ) : null,
                disableUnderline: true,
              }}
              label=''
            />
          </motion.div>

          <motion.div variants={childVariants}>
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                alignItems: 'center',
                width: '100%',
                maxWidth: '350px',
              }}
            >
              <Link
                href='#'
                onClick={handleForgotPassword}
                underline='hover'
                sx={{
                  fontSize: { xs: '13px', sm: '14px' },
                  color: '#666666',
                  fontWeight: 500,
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    color: '#ff6f91',
                    transform: 'translateX(3px)',
                  },
                }}
              >
                Forgot password?
              </Link>
            </Box>
          </motion.div>

          <motion.div
            variants={childVariants}
            whileHover='hover'
            whileTap='tap'
            style={{ width: '100%', maxWidth: '350px' }}
          >
            <Button
              variant='contained'
              onClick={handleLogin}
              disabled={isLoading}
              fullWidth
              sx={{
                ...buttonSx,
                padding: { xs: '12px 16px', sm: '14px 20px' },
              }}
            >
              {isLoading ? 'Logging In...' : 'Login'}
            </Button>
          </motion.div>

          <motion.div variants={childVariants}>
            <Link
              href='/signup'
              underline='none'
              sx={{
                fontSize: { xs: '14px', sm: '16px' },
                fontWeight: 500,
                color: '#666666',
                textAlign: 'center',
                display: 'block',
                transition: 'all 0.3s ease-out',
                '&:hover': {
                  color: '#ff6f91',
                  transform: 'translateX(5px)',
                },
              }}
            >
              Don’t have an account? Register
            </Link>
          </motion.div>
        </Box>
      </motion.div>
    </Box>
  );
};

export default Login;
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import FaceIcon from '@mui/icons-material/Face';
import {
  Alert,
  Box,
  Button,
  Card,
  CircularProgress,
  Container,
  IconButton,
  Paper,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import axios from 'axios';
import 'bootstrap/dist/css/bootstrap.min.css';
import { formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import { useContext, useEffect, useState } from 'react';
import {
  Accordion,
  Button as BootstrapButton,
  Card as BootstrapCard,
  Container as BootstrapContainer,
  Col,
  Form,
  Pagination,
  Row,
} from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick-theme.css';
import 'slick-carousel/slick/slick.css';
import beautyImage from '../Assets/beatyyyy.png';
import doctorImage from '../Assets/doctorrr.png';
import haircut1 from '../Assets/haircut1.jpg';
import massageImage from '../Assets/massage.png';
import salonImage from '../Assets/salonnn.webp';
import shaving1 from '../Assets/shaving.webp';
import spaImage from '../Assets/spaaa.png';
import { NotificationContext } from '../NotificationContext.js';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const cardImages = [
  'https://images.pexels.com/photos/853427/pexels-photo-853427.jpeg',
  'https://images.pexels.com/photos/3993460/pexels-photo-3993460.jpeg',
  'https://www.salonhaircrush.com/wp-content/uploads/2021/03/nails_blog_haircrush_salon.jpg',
  'https://images.pexels.com/photos/3757954/pexels-photo-3757954.jpeg',
  'https://images.pexels.com/photos/3737672/pexels-photo-3737672.jpeg',
  'https://skinkraft.com/cdn/shop/articles/Deep-conditioning_1024x400.jpg?v=1589451010',
  'https://images.pexels.com/photos/853427/pexels-photo-853427.jpeg',
  'https://images.pexels.com/photos/457701/pexels-photo-457701.jpeg',
  'https://images.pexels.com/photos/3993448/pexels-photo-3993448.jpeg',
];

const settings = {
  dots: true,
  infinite: true,
  speed: 600,
  slidesToShow: 1,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 2000,
  arrows: false,
  swipeToSlide: true,
  touchThreshold: 10,
  cssEase: 'linear',
  centerMode: true,
  centerPadding: '0px',
  appendDots: (dots) => (
    <div style={{ padding: '30px 0 10px', marginTop: '20px' }}>
      <ul
        style={{
          margin: 0,
          padding: 0,
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          listStyle: 'none',
        }}
      >
        {dots.map((dot, index) => (
          <li
            key={index}
            style={{
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: dot.props.className.includes('slick-active')
                ? '#fb646b'
                : '#d3d3d3',
              cursor: 'pointer',
              transition: 'background-color 0.3s ease, transform 0.2s ease',
              transform: dot.props.className.includes('slick-active')
                ? 'scale(1.2)'
                : 'scale(1)',
            }}
          />
        ))}
      </ul>
    </div>
  ),
};

const services = [
  {
    title: 'Keratin Treatment',
    description: 'Smooth, shiny hair with long-lasting results.',
    image: cardImages[0],
  },
  {
    title: 'Hair Coloring',
    description: 'Bold, vibrant colors to your style.',
    image: cardImages[1],
  },
  {
    title: 'Manicure',
    description: 'Perfect nails with vibrant gel colors.',
    image: cardImages[2],
  },

  {
    title: 'Deep Conditioning',
    description: 'Nourish your shiny hair.',
    image: cardImages[5],
  },
  {
    title: 'Makeup Application',
    description: 'Flawless makeup for any occasion.',
    image: cardImages[7],
  },
];

// Utility function to format time ago with error handling
const formatTimeAgo = (date) => {
  try {
    if (!date || isNaN(new Date(date).getTime())) {
      return 'Unknown time';
    }
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch (error) {
    return 'Unknown time';
  }
};

// Styles
const styles = {
  categoriesContainer: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    overflowX: 'auto',
    paddingBottom: '10px',
    scrollbarWidth: 'none',
  },
  categoryCard: {
    minWidth: '100px',
    height: '100px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '12px',
    borderRadius: '50px',
    backgroundColor: '#fff',
    boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
    cursor: 'pointer',
    transition: 'transform 0.2s',
    ':hover': {
      transform: 'scale(1.05)',
    },
  },
  imageContainer: {
    width: '60px',
    height: '60px',
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f5f5f5',
  },
  categoryImage: {
    width: '50px',
    height: '50px',
    objectFit: 'cover',
  },
  categoryName: {
    fontSize: '14px',
    color: '#201548',
    fontWeight: '500',
    textAlign: 'center',
  },
  containerStyles: {
    width: '100%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '2rem',
  },
  titleStyles: {
    fontSize: {
      xs: '1.5rem',
      sm: '1.75rem',
      md: '2rem',
      lg: '2.25rem',
      xl: '2.5rem',
      xxl: '3rem',
    },
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: {
      xs: '1.5rem',
      sm: '2rem',
      md: '2.5rem',
    },
    background: '#FB646B',
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    color: '#FB646B',
  },
};

const allCategories = [
  {
    name: 'Salon',
    image: <img src={salonImage} alt='Salon' style={styles.categoryImage} />,
    route: '/salon',
  },
  {
    name: 'Beauty',
    image: <img src={beautyImage} alt='Beauty' style={styles.categoryImage} />,
    route: '/beauty',
  },
  {
    name: 'Doctor',
    image: <img src={doctorImage} alt='Doctor' style={styles.categoryImage} />,
    route: '/skincare',
  },
  {
    name: 'Spa',
    image: <img src={spaImage} alt='Spa' style={styles.categoryImage} />,
    route: '/beauty',
  },
  {
    name: 'Massage',
    image: (
      <img src={massageImage} alt='Massage' style={styles.categoryImage} />
    ),
    route: '/salon',
  },
];

// Sample data for cards
const SalonCards = [
  {
    id: 1,
    title: 'Hair Cut',
    service: 'Hair Cut',
    name: 'Ankur',
    price: 'From RS.299',
    description:
      'Get a fresh and stylish haircut that suits your personality and enhances your look!',
    image: haircut1,
    smallIcon: <i className='fa-solid fa-paintbrush'></i>,
  },
  {
    id: 2,
    title: 'Shaving',
    service: 'Shaving',
    name: 'Mahesh',
    price: 'From RS.350',
    description:
      'Experience a smooth and clean shave with our professional shaving services.',
    image: shaving1,
    smallIcon: <FaceIcon fontSize='small' />,
  },
];

const Home1 = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [username, setUsername] = useState('');
  // const [notifications, setNotifications] = useState(3);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNavOpen, setIsNavOpen] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState(allCategories);
  const [formData, setFormData] = useState({ name: '', phone: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [copySuccess, setCopySuccess] = useState(false);
  const [userStatus, setUserStatus] = useState(null);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [faqs, setFaqs] = useState([]);
  const [question, setQuestion] = useState('');
  const [faqError, setFaqError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const faqsPerPage = 5;

  const context = useContext(NotificationContext);
  const { notifications = 0, fetchNotificationCount = () => {} } =
    context || {};

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role || '');

    if (role === 'User' || role === 'ServiceProvider') {
      fetchNotificationCount();
    }
  }, [fetchNotificationCount]);

  // Validation patterns for coupon form
  const patterns = {
    name: /^[a-zA-Z\s]{2,50}$/,
    phone: /^[6-9]\d{9}$/,
  };

  // Error messages for coupon form
  const errorMessages = {
    name: {
      required: 'Name is required',
      pattern: 'Name should only contain letters and spaces (2-50 characters)',
    },
    phone: {
      required: 'Phone number is required',
      pattern: 'Phone number must start with 6, 78, or 9 and be 10 digits long',
    },
  };

  // Animation variants for cards
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: 'easeOut' },
    },
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const cardItem = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 80, damping: 12 },
    },
  };

  // Fetch username and FAQs
  useEffect(() => {
    const email = localStorage.getItem('email');
    if (email) {
      setUsername(email.split('@')[0]);
    }

    axios
      .get(`${BASE_URL}/api/terms/faqs`)
      .then((res) => setFaqs(res.data))
      .catch((err) => console.error(err));
  }, []);

  // Handle search for categories
  const handleSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setSearchQuery(query);
    if (query === '') {
      setFilteredCategories(allCategories);
    } else {
      const filtered = allCategories.filter((category) =>
        category.name.toLowerCase().includes(query)
      );
      setFilteredCategories(filtered);
    }
  };

  // Toggle navigation for mobile
  const toggleNav = () => {
    setIsNavOpen(!isNavOpen);
  };

  // ... (other imports and code remain unchanged)

  // Coupon form validation and handling
  const validateField = (name, value) => {
    if (!value) return errorMessages[name].required;
    if (patterns[name] && !patterns[name].test(value)) {
      return errorMessages[name].pattern;
    }
    return '';
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
      setErrors((prev) => ({ ...prev, [name]: error })); // Fixed: changed [field] to [name]
    }
  };

  // ... (rest of the code remains unchanged)

  const generateCouponCode = () => {
    return `FIRST10-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  };

  const handleCopyCoupon = () => {
    navigator.clipboard.writeText(couponCode);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  };

  const handleCouponSubmit = async (e) => {
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
        const token = localStorage.getItem('token');
        const userId = localStorage.getItem('userId');
        if (!userId) {
          setErrors({ submit: 'Please log in to claim your coupon' });
          setIsSubmitting(false);
          return;
        }

        const statusResponse = await fetch(`${BASE_URL}/api/coupons/status`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ userId }),
        });

        const statusResult = await statusResponse.json();
        if (!statusResponse.ok) {
          throw new Error(
            statusResult.message || 'Failed to check user status'
          );
        }

        if (statusResult.isNewUser && !statusResult.couponClaimed) {
          const newCoupon = generateCouponCode();
          const claimResponse = await fetch(`${BASE_URL}/api/coupons/claim`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
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
            throw new Error(claimResult.message || 'Failed to claim coupon');
          }

          setCouponCode(claimResult.coupon.code);
          setUserStatus('new');
          setSubmitted(true);
        } else {
          setUserStatus('existing');
          setSubmitted(true);
        }
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          submit: error.message || 'Something went wrong. Please try again.',
        }));
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // FAQ handling
  const isLoggedIn = !!localStorage.getItem('email');
  const handleFaqSubmit = async (e) => {
    e.preventDefault();
    if (!isLoggedIn) {
      navigate('/login');
      return;
    }
    if (!question.trim()) {
      setFaqError('Question is required');
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/terms/faqs`,
        { question },
        { headers: { 'user-email': localStorage.getItem('email') } }
      );
      setFaqs([...faqs, response.data]);
      setQuestion('');
      setFaqError('');
      alert('Question submitted successfully!');
      setCurrentPage(1);
    } catch (err) {
      setFaqError(err.response?.data?.message || 'Error submitting question');
    }
  };

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  // Pagination logic
  const indexOfLastFaq = currentPage * faqsPerPage;
  const indexOfFirstFaq = indexOfLastFaq - faqsPerPage;
  const currentFaqs = faqs.slice(indexOfFirstFaq, indexOfLastFaq);
  const totalPages = Math.ceil(faqs.length / faqsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item
        key={number}
        active={number === currentPage}
        onClick={() => handlePageChange(number)}
      >
        {number}
      </Pagination.Item>
    );
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: '#fad9e3',
        minHeight: '100vh',
        color: 'rgb(244,245,247)',
      }}
    >
      {/* Header with Username, Notifications, Search Bar, and Toggle Button */}
      <header
        style={{
          backgroundColor: 'pink',
          padding: '40px 30px',
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          position: 'sticky',
          top: 0,
          // zIndex: 1000,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <h2
              style={{
                color: '#201548',
                fontSize: '15px',
                margin: 3,
                marginTop: 4,
              }}
            >
              Welcome
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {/* {username && (
              <span style={{ color: "#201548", fontSize: "14px" }}>
                Hi, {username}
              </span>
            )} */}
            <div style={{ position: 'relative' }}>
              <i
                className='bi bi-bell'
                style={{
                  color: '#201548',
                  fontSize: '20px',
                  cursor: 'pointer',
                }}
                onClick={() => navigate('/UserNotifications')}
                // onClick={() => alert("Notifications clicked!")}
              ></i>
              {notifications > 0 && (
                <span
                  style={{
                    position: 'absolute',
                    top: '-5px',
                    right: '-5px',
                    backgroundColor: '#fb646b',
                    color: '#fff',
                    borderRadius: '50%',
                    padding: '2px 6px',
                    fontSize: '10px',
                  }}
                >
                  {notifications}
                </span>
              )}
            </div>
          </div>
        </div>
        <h2
          style={{
            color: '#201548',
            fontSize: '20px',
            margin: 3,
            marginTop: 4,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          Hello, {username ? <span>{username}</span> : <span>Guest</span>}{' '}
          <span style={{ fontSize: '24px' }}>👋</span>
        </h2>

        {/* Search Bar */}
        <div>
          <input
            className='mt-3'
            type='text'
            placeholder='Search services...'
            value={searchQuery}
            onChange={handleSearch}
            style={{
              width: '100%',
              padding: '8px 8px 8px 35px',
              borderRadius: '10px',
              border: '1px solid #201548',
              fontSize: '14px',
              color: '#201548',
              backgroundColor: '#fff',
              backgroundImage:
                'url(\'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="%23201548" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>\')',
              backgroundRepeat: 'no-repeat',
              backgroundPosition: '10px center',
              backgroundSize: '16px 16px',
            }}
          />
        </div>

        {/* Navigation */}
        <nav
          style={{
            display: isNavOpen ? 'flex' : 'none',
            flexDirection: 'column',
            gap: '10px',
            padding: '10px 0',
            '@media (min-width: 769px)': {
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'space-around',
            },
          }}
        >
          <button
            onClick={() => navigate('/services')}
            style={{
              background: 'none',
              border: 'none',
              color: '#201548',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '5px 10px',
              ':hover': { backgroundColor: '#f0f0f0', borderRadius: '5px' },
            }}
          >
            Services
          </button>
          <button
            onClick={() => navigate('/appointments')}
            style={{
              background: 'none',
              border: 'none',
              color: '#201548',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '5px 10px',
              ':hover': { backgroundColor: '#f0f0f0', borderRadius: '5px' },
            }}
          >
            Appointments
          </button>
          <button
            onClick={() => navigate('/profile')}
            style={{
              background: 'none',
              border: 'none',
              color: '#201548',
              fontSize: '16px',
              cursor: 'pointer',
              padding: '5px 10px',
              ':hover': { backgroundColor: '#f0f0f0', borderRadius: '5px' },
            }}
          >
            Profile
          </button>
        </nav>
      </header>

      {/* Categories Section */}
      <div style={{ padding: '20px', overflowX: 'hidden' }}>
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          style={{
            color: '#0e0f0f',
            fontWeight: '600',
            fontSize: '1.8rem',
            textTransform: 'uppercase',
            marginBottom: '25px',
            fontFamily: "'Playfair Display SC', serif",
            letterSpacing: '0.02em',
          }}
        >
          Categories
        </motion.h2>
        <div
          style={{
            display: 'flex',
            gap: '10px',
            paddingBottom: '10px',
            overflowX: 'auto',
            scrollbarWidth: 'none',
            '&::-webkit-scrollbar': { display: 'none' },
            '@media (min-width: 768px) and (max-width: 1024px)': {
              display: 'flex',
              justifyContent: 'center',
              flexWrap: 'wrap',
            },
            '@media (min-width: 1025px)': {
              display: 'flex',
              textAlign: 'center',
              justifyContent: 'center',
            },
          }}
        >
          {filteredCategories.length > 0 ? (
            filteredCategories.map((category, index) => (
              <div
                key={index}
                onClick={() => navigate(category.route)}
                style={{
                  flex: '0 0 auto',
                  width: '100px',
                  height: '100px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px',
                  borderRadius: '50px',
                  backgroundColor: '#fff',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.1)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  ':hover': { transform: 'scale(1.05)' },
                }}
              >
                <div
                  style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                  }}
                >
                  {category.image}
                </div>
                <span
                  style={{
                    fontSize: '12px',
                    color: '#201548',
                    fontWeight: '500',
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {category.name}
                </span>
              </div>
            ))
          ) : (
            <div
              style={{
                width: '100%',
                textAlign: 'center',
                padding: '20px',
                color: '#201548',
              }}
            >
              No categories found matching your search.
            </div>
          )}
        </div>
      </div>

      {/* Services Section */}
      <Box
        sx={{
          width: '100%',
          backgroundColor: '#ffffff',
          display: { xs: 'flex', lg: 'none' },
          ['@media (min-width: 1024px)']: { display: 'none' }, // Hide at 1024px and above
          justifyContent: 'center',
        }}
      >
        <Container
          maxWidth='xl'
          sx={{
            py: { xs: 4, sm: 5, md: 6 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            px: { xs: 2, sm: 3, md: 4 },
          }}
        >
          <motion.div
            initial='hidden'
            animate='visible'
            variants={staggerContainer}
            style={{
              textAlign: 'center',
              marginBottom: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            }}
          >
            <motion.h2
              variants={fadeInUp}
              initial={{ opacity: 0, y: -20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8 }}
              style={{
                color: '#0e0f0f',
                fontWeight: '600',
                fontSize: '1.8rem',
                textTransform: 'uppercase',
                marginBottom: '25px',
                fontFamily: "'Playfair Display SC', serif",
                letterSpacing: '0.02em',
              }}
            >
              Trending Services
            </motion.h2>
          </motion.div>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              gap: { xs: 3, sm: 4, md: 5 },
              width: '100%',
              px: { xs: 1, sm: 2, md: 0 },
            }}
          >
            {SalonCards.map((card, index) => (
              <motion.div
                key={card.id}
                variants={cardItem}
                whileHover={{ y: -5, scale: 1.02 }}
                onMouseEnter={() => setHoveredCard(card.id)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{ position: 'relative', width: '100%' }}
              >
                <Box
                  sx={{
                    position: 'absolute',
                    top: { xs: '10%', sm: '8%' },
                    right:
                      index === 0
                        ? { xs: '10%', sm: '3%' }
                        : { xs: '10%', sm: '53%' },
                    width: { xs: '40px', sm: '50px' },
                    height: { xs: '40px', sm: '50px' },
                    zIndex: 2,
                    display: { xs: 'none', sm: 'block' }, // Hide star on xs screens
                  }}
                >
                  <svg
                    width='100%'
                    height='100%'
                    viewBox='0 0 24 24'
                    fill={index === 0 ? '#FF69B4' : '#FFA500'}
                    xmlns='http://www.w3.org/2000/svg'
                  >
                    <path d='M12 0L14.69 6.29L21.46 6.54L16.23 10.96L18.92 17.46L12 13.77L5.08 17.46L7.77 10.96L2.54 6.54L9.31 6.29L12 0Z' />
                  </svg>
                </Box>
                <Card
                  sx={{
                    display: 'flex',
                    flexDirection: {
                      xs: index === 0 ? 'row' : 'row-reverse',
                      sm: index === 0 ? 'row' : 'row-reverse',
                    },
                    borderRadius: '20px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                    backgroundColor: '#ffffff',
                    width: '100%',
                    height: { xs: '200px', sm: '240px', md: '260px' }, // Fixed height for consistency
                    overflow: 'hidden',
                    alignItems: 'center',
                    transition: 'box-shadow 0.3s ease, transform 0.3s ease',
                    '&:hover': { boxShadow: '0 8px 20px rgba(0,0,0,0.1)' },
                  }}
                >
                  <Box
                    sx={{
                      position: 'relative',
                      width: { xs: '50%', sm: '50%' },
                      height: '100%', // Match card height
                      borderTopLeftRadius: index === 0 ? '20px' : '0',
                      borderTopRightRadius: index === 0 ? '0' : '20px',
                      borderBottomLeftRadius: index === 0 ? '20px' : '0',
                      borderBottomRightRadius: index === 0 ? '0' : '20px',
                      overflow: 'hidden',
                    }}
                  >
                    <img
                      src={card.image}
                      alt={card.title}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        transition: 'transform 0.3s ease',
                        transform:
                          hoveredCard === card.id ? 'scale(1.05)' : 'scale(1)',
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      width: { xs: '50%', sm: '50%' },
                      height: '100%', // Match card height
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center', // Vertically center content
                      alignItems: 'flex-start',
                      p: { xs: 2, sm: 2.5, md: 3 },
                      gap: { xs: 0.5, sm: 1, md: 1.5 },
                    }}
                  >
                    <Typography
                      variant='h6'
                      sx={{
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        color: '#000000',
                        fontSize: { xs: '0.9rem', sm: '1rem', md: '1.125rem' },
                        fontFamily: "'Inter', sans-serif",
                        lineHeight: 1.3,
                        letterSpacing: '0.02em',
                      }}
                    >
                      {card.title}
                    </Typography>
                    <Typography
                      variant='subtitle2'
                      sx={{
                        color: '#666666',
                        fontSize: {
                          xs: '0.7rem',
                          sm: '0.8rem',
                          md: '0.875rem',
                        },
                        fontFamily: "'Inter', sans-serif",
                        lineHeight: 1.5,
                        fontWeight: 400,
                      }}
                    >
                      {card.name}
                    </Typography>
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        mt: { xs: 0.5, sm: 1 },
                        border: '1px solid #000000',
                        borderRadius: '8px',
                        px: { xs: 1, sm: 1.5 },
                        py: { xs: 0.25, sm: 0.5 },
                        width: 'fit-content',
                        transition: 'background-color 0.3s ease',
                        '&:hover': { backgroundColor: 'rgba(0,0,0,0.03)' },
                      }}
                    >
                      <Typography
                        variant='body2'
                        sx={{
                          color: '#000000',
                          fontSize: {
                            xs: '0.65rem',
                            sm: '0.75rem',
                            md: '0.8rem',
                          },
                          fontFamily: "'Inter', sans-serif",
                          lineHeight: 1.2,
                          fontWeight: 500,
                        }}
                      >
                        {card.price}
                      </Typography>
                      <Box
                        sx={{
                          width: '6px',
                          height: '6px',
                          backgroundColor: '#FF0000',
                          borderRadius: '50%',
                          ml: 1,
                        }}
                      />
                    </Box>
                  </Box>
                </Card>
              </motion.div>
            ))}
          </Box>
        </Container>
      </Box>

      <div
        className='mobile-carousel-container'
        style={{
          backgroundColor: '#fad9e3',
          padding: '30px 15px',
          margin: '0 auto',
          maxWidth: '100%',
          textAlign: 'center',
        }}
      >
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.3 }}
          transition={{ duration: 0.8 }}
          style={{
            color: '#0e0f0f',
            fontWeight: '600',
            fontSize: '1.8rem',
            textTransform: 'uppercase',
            marginBottom: '25px',
            fontFamily: "'Playfair Display SC', serif",
            letterSpacing: '0.02em',
          }}
        >
          More Salon Services
        </motion.h2>

        <Slider {...settings}>
          {services.map((service, index) => (
            <div key={index}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                style={{
                  backgroundColor: '#fff',
                  borderRadius: '15px',
                  textAlign: 'center',
                  boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
                  overflow: 'hidden',
                  width: '90%',
                  margin: '0 auto',
                  height: '320px',
                  maxWidth: '300px',
                  border: '2px solid #fb646b',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    height: '190px',
                    position: 'relative',
                  }}
                >
                  <img
                    src={service.image}
                    alt={service.title}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                      borderRadius: '12px 12px 0 0',
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      transition: 'transform 0.3s ease',
                    }}
                    onTouchStart={(e) => {
                      e.currentTarget.style.transform = 'scale(1.05)';
                    }}
                    onTouchEnd={(e) => {
                      e.currentTarget.style.transform = 'scale(1)';
                    }}
                  />
                </div>
                <div
                  style={{
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    background:
                      'linear-gradient(180deg, #fff 0%, #f8e1e7 100%)',
                  }}
                >
                  <h4
                    style={{
                      color: '#201548',
                      fontWeight: '700',
                      fontSize: '1.2rem',
                      margin: '0 0 10px 0',
                      textTransform: 'uppercase',
                      fontFamily: "'Playfair Display SC', serif",
                      letterSpacing: '0.02em',
                    }}
                  >
                    {service.title}
                  </h4>
                  <p
                    style={{
                      color: '#0e0f0f',
                      fontSize: '0.9rem',
                      textTransform: 'uppercase',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      margin: 0,
                      fontFamily: "'Arial', sans-serif",
                      lineHeight: '1.4',
                    }}
                  >
                    {service.description}
                  </p>
                </div>
              </motion.div>
            </div>
          ))}
        </Slider>

        <style>
          {`
          @media (min-width: 769px) {
            .mobile-carousel-container {
              display: none !important;
            }
          }

          @media (max-width: 768px) {
            .slick-slide {
              display: flex !important;
              justify-content: center;
            }

            .slick-dots {
              bottom: -40px;
              padding: 0;
            }

            .slick-dots li button:before {
              content: none;
            }
          }

          @media (max-width: 400px) {
            .mobile-carousel-container h2 {
              font-size: 1.6rem;
              margin-bottom: 20px;
            }

            .slick-slide > div > div {
              max-width: 260px;
              height: 280px;
            }

            .slick-slide img {
              height: 160px;
            }

            .slick-slide h4 {
              font-size: 1.1rem;
            }

            .slick-slide p {
              font-size: 0.85rem;
              line-height: 1.3;
            }

            .slick-dots {
              bottom: -35px;
            }
          }

          @media (max-width: 320px) {
            .mobile-carousel-container h2 {
              font-size: 1.4rem;
              margin-bottom: 15px;
            }

            .slick-slide > div > div {
              max-width: 220px;
              height: 260px;
            }

            .slick-slide img {
              height: 140px;
            }

            .slick-slide h4 {
              font-size: 1rem;
            }

            .slick-slide p {
              font-size: 0.8rem;
              line-height: 1.2;
            }

            .slick-dots {
              bottom: -30px;
            }
          }
        `}
        </style>
      </div>

      {/* Coupon Form Section */}
      <div style={{ backgroundColor: '#fad9e3' }}>
        <Container maxWidth={false} disableGutters sx={styles.containerStyles}>
          <Paper
            elevation={8}
            sx={{ padding: '2rem', maxWidth: '480px', width: '100%' }}
          >
            <Typography
              variant='h1'
              sx={styles.titleStyles}
              style={{ color: '#FB646B' }}
            >
              Get 10% Off Your First Booking!
            </Typography>
            <AnimatePresence>
              {submitted ? (
                couponCode ? (
                  <Box textAlign='center'>
                    <Alert severity='success'>
                      {userStatus === 'new'
                        ? "Welcome! Here's your 10% off coupon for your first booking:"
                        : 'Coupon claimed successfully!'}
                    </Alert>
                    <Box
                      sx={{
                        mt: 2,
                        p: 2,
                        bgcolor: 'grey.800',
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 1,
                      }}
                    >
                      <Typography variant='h6'>{couponCode}</Typography>
                      <Tooltip title={copySuccess ? 'Copied!' : 'Copy Coupon'}>
                        <IconButton
                          onClick={handleCopyCoupon}
                          color={copySuccess ? 'success' : 'primary'}
                        >
                          <ContentCopyIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                    <Typography sx={{ mt: 2 }}>
                      Use this code at checkout to get 10% off your first
                      booking!
                    </Typography>
                  </Box>
                ) : (
                  <Alert severity='info'>
                    {userStatus === 'existing'
                      ? 'Thank you! As an existing user, check our current promotions for other great offers!'
                      : 'You have already claimed a coupon. Check your account for details!'}
                  </Alert>
                )
              ) : (
                <form onSubmit={handleCouponSubmit}>
                  <Box display='flex' flexDirection='column' gap='1.5rem'>
                    <TextField
                      label='Name'
                      name='name'
                      value={formData.name}
                      onChange={(e) => {
                        let value = e.target.value.replace(/[^a-zA-Z\s]/g, '');
                        if (value.length === 0 || value[0] !== ' ') {
                          handleChange({ target: { name: 'name', value } });
                        }
                      }}
                      onBlur={() => handleBlur('name')}
                      error={touched.name && !!errors.name}
                      helperText={touched.name && errors.name}
                      fullWidth
                    />
                    <TextField
                      label='Phone Number'
                      name='phone'
                      inputProps={{ maxLength: 10 }}
                      value={formData.phone}
                      onChange={(e) => {
                        const numericValue = e.target.value.replace(
                          /[^0-9]/g,
                          ''
                        );
                        handleChange({
                          target: { name: 'phone', value: numericValue },
                        });
                      }}
                      onBlur={() => handleBlur('phone')}
                      error={touched.phone && !!errors.phone}
                      helperText={touched.phone && errors.phone}
                      fullWidth
                    />
                    {errors.submit && (
                      <Alert severity='error'>{errors.submit}</Alert>
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
                      type='submit'
                      variant='contained'
                      disabled={isSubmitting}
                      className='btn-content'
                    >
                      {isSubmitting ? (
                        <CircularProgress size={24} />
                      ) : (
                        'Claim Your 10% Off'
                      )}
                    </Button>
                  </Box>
                </form>
              )}
            </AnimatePresence>
          </Paper>
        </Container>
      </div>

      {/* FAQ Section */}
      <div style={{ backgroundColor: '#fad9e3' }}>
        <BootstrapContainer fluid className='my-5'>
          <h2 className='text-center mb-4' style={{ color: '#FB646B' }}>
            Frequently Asked Questions
          </h2>
          <Row>
            <Col md={8} className='mx-auto'>
              {faqs.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#201548' }}>
                  No FAQs available.
                </p>
              ) : (
                <>
                  <Accordion>
                    {currentFaqs.map((faq, index) => (
                      <Accordion.Item eventKey={index.toString()} key={faq._id}>
                        <Accordion.Header>
                          {faq.question}{' '}
                          <small className='text-muted ms-2'>
                            ({formatTimeAgo(faq.createdAt)})
                          </small>
                        </Accordion.Header>
                        <Accordion.Body>
                          {faq.answer}{' '}
                          <small className='text-muted'>
                            (Answered {formatTimeAgo(faq.updatedAt)})
                          </small>
                        </Accordion.Body>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                  {totalPages > 1 && (
                    <div className='d-flex justify-content-center mt-4 flex-column flex-md-row align-items-center gap-2'>
                      <Pagination>
                        <Pagination.Prev
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage === 1}
                        />
                        <span className='text-muted'>
                          {currentPage} of {totalPages}
                        </span>
                        <Pagination.Next
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage === totalPages}
                        />
                      </Pagination>
                    </div>
                  )}
                </>
              )}
              <BootstrapCard className='mt-4'>
                <BootstrapCard.Body>
                  <h5 style={{ color: '#FB646B' }}>Ask a Question</h5>
                  {!isLoggedIn ? (
                    <div>
                      <p className='text-muted'>
                        To post a question, please log in.
                      </p>
                      <BootstrapButton
                        variant='primary'
                        onClick={handleLoginRedirect}
                      >
                        Log In
                      </BootstrapButton>
                    </div>
                  ) : (
                    <Form onSubmit={handleFaqSubmit}>
                      <Form.Group controlId='question'>
                        <Form.Label>Your Question</Form.Label>
                        <Form.Control
                          as='textarea'
                          rows={3}
                          value={question}
                          onChange={(e) => setQuestion(e.target.value)}
                          placeholder='Enter your question here'
                          disabled={!isLoggedIn}
                        />
                      </Form.Group>
                      {faqError && (
                        <p className='text-danger mt-2'>{faqError}</p>
                      )}
                      <BootstrapButton
                        type='submit'
                        className='mt-3'
                        style={{
                          backgroundColor: '#FB646B',
                          border: '1px solid white',
                        }}
                      >
                        Submit Question
                      </BootstrapButton>
                    </Form>
                  )}
                </BootstrapCard.Body>
              </BootstrapCard>
            </Col>
          </Row>
        </BootstrapContainer>
      </div>
      <footer
        className='py-5'
        style={{
          background: '#FFEBF1',
          borderTop: '5px solid rgb(103 131 170)',
        }}
      >
        <div className='container'>
          <div className='row g-4'>
            {/* Contact Info */}
            <motion.div
              className='col-md-4 text-center text-md-start'
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8 }}
            >
              <h4
                className='fw-bold mb-4'
                style={{
                  color: '#54A3C1',
                  position: 'relative',
                  fontFamily: 'Playfair Display SC',
                }}
              >
                Contact Us
              </h4>
              <p
                className='mb-2'
                style={{
                  color: '#0E0F0F',
                  fontFamily: 'font family/Font 2',
                  fontWeight: 'font weight/400',
                }}
              >
                <i className='bi bi-geo-alt me-2'></i>ABC
              </p>
              <p
                className='mb-2'
                style={{
                  color: '#0E0F0F',
                  fontFamily: 'font family/Font 2',
                  fontWeight: 'font weight/400',
                }}
              >
                <i className='bi bi-telephone me-2'></i> 9876543211
              </p>
              <p
                className='mb-2'
                style={{
                  color: '#0E0F0F',
                  fontFamily: 'font family/Font 2',
                  fontWeight: 'font weight/400',
                }}
              >
                <i className='bi bi-envelope me-2'></i> abc@gmail.com
              </p>
            </motion.div>

            {/* Quick Links */}
            <motion.div
              className='col-md-4 text-center'
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h4
                className='fw-bold mb-4'
                style={{
                  color: '#54A3C1',
                  position: 'relative',
                  fontFamily: 'Playfair Display SC',
                }}
              >
                Quick Links
              </h4>
              <div className='d-flex flex-column'>
                <a
                  href='/salon'
                  className='mb-2 text-decoration-none'
                  style={{
                    color: '#54A3C1',
                    transition: 'all 0.3s ease',
                    fontWeight: 'font weight/400',
                    fontFamily: 'font family/Font 2',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(5px)';
                    // e.currentTarget.style.color = "#0e0f0f";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    // e.currentTarget.style.color = "#201548";
                  }}
                >
                  Salon Services
                </a>
                <a
                  href='/beauty'
                  className='mb-2 text-decoration-none'
                  style={{
                    color: '#54A3C1',
                    transition: 'all 0.3s ease',
                    fontWeight: 'font weight/400',
                    fontFamily: 'font family/Font 2',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(5px)';
                    // e.currentTarget.style.color = "#0e0f0f";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    // e.currentTarget.style.color = "#201548";
                  }}
                >
                  Beauty Treatments
                </a>
                <a
                  href='/skincare'
                  className='mb-2 text-decoration-none'
                  style={{
                    color: '#54A3C1',
                    transition: 'all 0.3s ease',
                    fontWeight: 'font weight/400',
                    fontFamily: 'font family/Font 2',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateX(5px)';
                    // e.currentTarget.style.color = "#0e0f0f";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateX(0)';
                    // e.currentTarget.style.color = "#201548";
                  }}
                >
                  Skincare Solutions
                </a>
              </div>
            </motion.div>

            {/* Social Media */}
            <motion.div
              className='col-md-4 text-center text-md-end'
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.3 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <h4
                className='fw-bold mb-4'
                style={{
                  color: '#54A3C1',
                  position: 'relative',
                  fontFamily: 'Playfair Display SC',
                }}
              >
                Follow Us
              </h4>
              <div className='d-flex justify-content-center justify-content-md-end gap-3'>
                <a
                  href='https://facebook.com'
                  style={{
                    color: '#54A3C1',
                    transition: 'all 0.3s ease',
                  }}
                  target='_blank'
                  rel='noopener noreferrer'
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <i className='bi bi-facebook fs-3'></i>
                </a>
                <a
                  href='https://twitter.com'
                  style={{
                    color: '#54A3C1',
                    transition: 'all 0.3s ease',
                  }}
                  target='_blank'
                  rel='noopener noreferrer'
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <i className='bi bi-twitter fs-3'></i>
                </a>
                <a
                  href='https://instagram.com'
                  style={{
                    color: '#54A3C1',
                    transition: 'all 0.3s ease',
                  }}
                  target='_blank'
                  rel='noopener noreferrer'
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'scale(1.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <i className='bi bi-instagram fs-3'></i>
                </a>
              </div>
            </motion.div>
          </div>

          {/* Copyright */}
          <div
            className='text-center mt-5'
            style={{
              color: '#0E0F0F',
              fontFamily: 'font family/Font 2',
              fontWeight: 'font weight/400',
            }}
          >
            <p className='mb-0'>
              ©️ {new Date().getFullYear()} BeautyBliss. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home1;

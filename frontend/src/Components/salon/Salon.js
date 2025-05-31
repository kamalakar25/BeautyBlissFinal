import BookOnlineIcon from '@mui/icons-material/BookOnline';
import FaceIcon from '@mui/icons-material/Face';
import {
  Box,
  Button,
  Card,
  Container,
  Typography,
  useMediaQuery,
  useScrollTrigger,
  useTheme,
  Zoom,
} from '@mui/material';
import { motion } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import 'react-responsive-carousel/lib/styles/carousel.min.css';
import { useNavigate } from 'react-router-dom';
import './salon.css';

// Import images
import portfolio2 from '../Assets/12.jpeg';
import portfolio1 from '../Assets/13.jpeg';
import portfolio3 from '../Assets/14.jpeg';
import facial1 from '../Assets/facial1.webp';
import haircolor1 from '../Assets/hair color1.webp';
import haircut1 from '../Assets/haircut1.jpg';
import hero from '../Assets/hero salon.png';
import Salon1 from '../Assets/salon1.jpg';
import About from '../Assets/salon13.png';
import facial from '../Assets/salon5.png';
import shaving1 from '../Assets/shaving.webp';

const BookNowButton = () => {
  const isMobile = useMediaQuery('(max-width:600px)');
  const navigate = useNavigate();

  return (
    <Zoom in={true} timeout={1500} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'fixed',
          bottom: { xs: 20, sm: 40 },
          right: { xs: 20, sm: 40 },
          zIndex: 1000,
        }}
      >
        <Button
          variant='contained'
          size={isMobile ? 'small' : 'medium'}
          sx={{
            background: 'linear-gradient(135deg, #201548 0%, #3a2a6b 100%)',
            color: '#ffffff',
            fontSize: {
              xs: '0.75rem',
              sm: '0.9rem',
              md: '1rem',
            },
            px: { xs: 2.5, sm: 3 },
            py: { xs: 1, sm: 1.25 },
            borderRadius: '50px',
            textTransform: 'uppercase',
            fontWeight: '600',
            letterSpacing: '1px',
            boxShadow: '0 6px 20px rgba(32, 21, 72, 0.3)',
            transition: 'all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
            position: 'relative',
            overflow: 'hidden',
            minWidth: 'auto',
            border: '2px solid rgba(255,255,255,0.2)',
            '&:hover': {
              transform: 'translateY(-3px) scale(1.03)',
              boxShadow: '0 10px 25px rgba(32, 21, 72, 0.5)',
              background: 'linear-gradient(135deg, #3a2a6b 0%, #201548 100%)',
            },
            '&:after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)',
              transform: 'translateX(-100%)',
              transition: '0.6s',
            },
            '&:hover:after': {
              transform: 'translateX(100%)',
            },
          }}
          onClick={() =>
            navigate('/products', { state: { designation: 'Salon' } })
          }
        >
          <BookOnlineIcon
            sx={{ mr: 1, fontSize: { xs: '1rem', sm: '1.2rem' } }}
          />
          Book Now
        </Button>
      </Box>
    </Zoom>
  );
};

const SalonPage = () => {
  const carouselRef = useRef(null);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeIndex, setActiveIndex] = useState(0);
  const [hoveredCard, setHoveredCard] = useState(null);

  // Color scheme
  const colors = {
    background: '#ffffff',
    text: '#0e0f0f',
    primary: '#201548',
    secondary: '#3a2a6d',
    accent: '#5e43ba',
    lightAccent: 'rgb(228, 205, 231)',
  };

  const descriptions = [
    'Revitalize your skin with our rejuvenating facial treatments, tailored to refresh and hydrate your complexion.',
    "Get the perfect look with our expert men's haircut services, designed to match your style and personality.",
    "Enhance your hair's natural beauty with our stunning balayage and highlights, creating seamless, sun-kissed looks.",
    "Transform your style with our professional women's hair coloring services, offering vibrant and lasting results.",
    'Add volume and movement to your hair with our trendy layer cuts, customized to suit your face shape and style.',
  ];

  // Animation variants
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
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const cardItem = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring',
        stiffness: 80,
        damping: 12,
      },
    },
  };

  // Sample data for cards (replace image URLs with your actual images)
  const SalonCards = [
    {
      id: 1,
      title: 'HAIRCUT',
      description:
        'Get a fresh and stylish haircut that suits your personality and enhances your look!',
      image: haircut1, // Replace with actual image URL
      smallIcon: <i class='fa-solid fa-scissors'></i>, // Replace with actual small icon URL
    },
    {
      id: 2,
      title: 'SHAVING',
      description:
        'Experience a smooth and clean shave with our professional shaving services.',
      image: shaving1, // Replace with actual image URL
      smallIcon: <i class='fa-solid fa-scissors'></i>, // Replace with actual small icon URL
    },
    {
      id: 3,
      title: 'FACIAL',
      description:
        "Enhance your skin's natural glow with our expert facial treatments.",
      image: facial1, // Replace with actual image URL
      smallIcon: <FaceIcon fontSize='small' />,
    },
    {
      id: 4,
      title: 'HAIR COLOUR',
      description:
        'Transform your hair with our expert hair coloring services.',
      image: haircolor1, // Replace with actual image URL
      smallIcon: <i class='fa-solid fa-palette'></i>, // Replace with actual small icon URL
    },
  ];

  const portfolioItems = [
    {
      id: 1,
      // title: "Rejuvenating Facial",
      // description: "Special treatment for glowing skin",
      image: portfolio1,
      name: 'Niharika',
      tagline: 'Revitalize your skin with our facial treatments',
      icon: portfolio1, // Single icon per card
    },
    {
      id: 2,
      // title: "Anti-Aging Therapy",
      // description: "Reduce wrinkles and fine lines",
      image: portfolio2,
      name: 'Priya',
      tagline: 'Turn back time with our anti-aging solutions',
      icon: portfolio2, // Different icon
    },
    {
      id: 3,
      // title: "Deep Cleansing",
      // description: "Purify your skin completely",
      image: portfolio3,
      name: 'Ananya',
      tagline: 'Deep pore cleansing for fresh skin',
      icon: portfolio3, // Different icon
    },
  ];

  const handleServiceClick = (service) => {
    navigate('/products', {
      state: { designation: 'Salon', service: service },
    });
  };

  const handlePrev = () => {
    if (carouselRef.current) {
      const cardWidth =
        carouselRef.current.firstChild.getBoundingClientRect().width + 16;
      carouselRef.current.scrollBy({ left: -cardWidth, behavior: 'smooth' });
    }
  };

  const handleNext = () => {
    if (carouselRef.current) {
      const cardWidth =
        carouselRef.current.firstChild.getBoundingClientRect().width + 16;
      carouselRef.current.scrollBy({ left: cardWidth, behavior: 'smooth' });
    }
  };

  // Scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  // Scroll reveal animation for floating button
  function ScrollTop({ children }) {
    const trigger = useScrollTrigger({
      threshold: 100,
    });

    const handleClick = (event) => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    };

    return (
      <Zoom in={trigger}>
        <Box
          onClick={handleClick}
          role='presentation'
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
        >
          {children}
        </Box>
      </Zoom>
    );
  }

  return (
    <Box
      sx={{
        backgroundColor: colors.background,
        color: colors.text,
        fontFamily: "'Poppins', sans-serif",
        overflowX: 'hidden',
      }}
    >
      {/* Hero Carousel */}
      <div
        style={{
          backgroundColor: 'rgb(248,202,215)', // Soft pink background
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '16px',
          flexWrap: 'wrap',
          gap: '24px',
          fontFamily: "'Inter', sans-serif", // Clean, modern font
        }}
      >
        {/* Text Section (Left Side) */}
        <div
          style={{
            flex: 1,
            textAlign: 'left',
            minWidth: '300px',
            paddingRight: '16px',
            marginLeft: '56px',
            maxWidth: '600px', // Prevents text section from becoming too wide
          }}
        >
          <h1
            style={{
              fontSize: 'clamp(32px, 10vw, 36px)', // Responsive font size
              fontWeight: 'bold',
              color: '#1F2937',
              lineHeight: '1.2',
              '@media (min-width: 640px)': {
                fontSize: 'clamp(36px, 8vw, 48px)',
              },
              '@media (min-width: 1024px)': {
                fontSize: 'clamp(48px, 6vw, 64px)',
              },
            }}
          >
            DISC
            <span
              style={{
                display: 'inline-block',
                width: 'clamp(60px, 12vw, 80px)',
                height: 'clamp(30px, 6vw, 35px)',
                margin: '0 4px',
                marginTop: '-25px',
                verticalAlign: 'middle',
                '@media (min-width: 640px)': {
                  width: 'clamp(40px, 8vw, 48px)',
                  height: 'clamp(40px, 8vw, 48px)',
                },
                '@media (min-width: 1024px)': {
                  width: 'clamp(48px, 6vw, 56px)',
                  height: 'clamp(48px, 6vw, 56px)',
                },
              }}
            >
              <img
                src={facial}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px double #3B82F6', // Double border for the image
                  transition: 'transform 0.3s ease', // Smooth hover effect
                }}
                onMouseEnter={(e) => (e.target.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                alt='Facial Treatment'
              />
            </span>
            VER YOUR
            <br />
            SIGNATURE GL
            <span
              style={{
                display: 'inline-block',
                width: 'clamp(60px, 12vw, 80px)',
                height: 'clamp(30px, 6vw, 35px)',
                margin: '0 4px',
                marginTop: '-25px',
                verticalAlign: 'middle',
                '@media (min-width: 640px)': {
                  width: 'clamp(40px, 8vw, 48px)',
                  height: 'clamp(40px, 8vw, 48px)',
                },
                '@media (min-width: 1024px)': {
                  width: 'clamp(48px, 6vw, 56px)',
                  height: 'clamp(48px, 6vw, 56px)',
                },
              }}
            >
              <img
                src={Salon1}
                style={{
                  width: '100%',
                  height: '100%',
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '4px double #3B82F6', // Double border for the image
                  transition: 'transform 0.3s ease',
                }}
                onMouseEnter={(e) => (e.target.style.transform = 'scale(1.1)')}
                onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
                alt='Salon'
              />
            </span>
            W
          </h1>
          <p
            style={{
              fontSize: 'clamp(14px, 4vw, 16px)',
              color: '#4B5563',
              marginTop: '12px',
              lineHeight: '1.5',
              '@media (min-width: 640px)': {
                fontSize: 'clamp(16px, 3vw, 18px)',
              },
              '@media (min-width: 1024px)': {
                fontSize: 'clamp(18px, 2vw, 20px)',
                marginTop: '16px',
              },
            }}
          >
            Experience the transformative power of GlowGenics and unveil your
            signature glow.
          </p>
          <button
            style={{
              marginTop: '16px',
              padding: '8px 20px',
              backgroundColor: '#FFFFFF',
              color: '#1F2937',
              fontWeight: '600',
              borderRadius: '9999px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              border: 'none',
              cursor: 'pointer',
              transition: 'background-color 0.3s, transform 0.2s',
              '@media (min-width: 1024px)': {
                marginTop: '24px',
                padding: '12px 24px',
              },
            }}
            onMouseEnter={(e) => {
              e.target.style.backgroundColor = '#F3F4F6';
              e.target.style.transform = 'translateY(-2px)';
            }}
            onMouseLeave={(e) => {
              e.target.style.backgroundColor = '#FFFFFF';
              e.target.style.transform = 'translateY(0)';
            }}
            onClick={() =>
              navigate('/products', { state: { designation: 'Salon' } })
            }
          >
            Explore now
          </button>
        </div>

        {/* Image Placeholder Section (Right Side) */}
        <div
          style={{
            flex: 1,
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            position: 'relative',
            minWidth: '300px',
          }}
        >
          {/* Main Image */}
          <div
            style={{
              // width: 'clamp(200px, 80vw, 400px)',
              // height: 'clamp(250px, 100vw, 500px)',
              width: '60%',
              height: '60%',
              // maxWidth: '400px',
              // maxHeight: '500px',
              // borderTopLeftRadius: '9999px',
              // borderTopRightRadius: '9999px',
              overflow: 'hidden',
              zIndex: 1,
              // boxShadow: '0 8px 16px rgba(0, 0, 0, 0.15)', // Subtle shadow for depth
              '@media (min-width: 320px)': {
                width: 'clamp(180px, 70vw, 280px)',
                height: 'clamp(225px, 87.5vw, 350px)',
              },
              '@media (min-width: 640px)': {
                width: 'clamp(200px, 50vw, 320px)',
                height: 'clamp(250px, 62.5vw, 400px)',
              },
              '@media (min-width: 1024px)': {
                width: 'clamp(240px, 30vw, 360px)',
                height: 'clamp(300px, 37.5vw, 450px)',
              },
              '@media (min-width: 1440px)': {
                width: 'clamp(280px, 25vw, 400px)',
                height: 'clamp(350px, 31.25vw, 500px)',
              },
            }}
          >
            <img
              src={hero}
              alt='Hero'
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                transition: 'transform 0.3s ease',
              }}
              // onMouseEnter={(e) => (e.target.style.transform = 'scale(1.05)')}
              // onMouseLeave={(e) => (e.target.style.transform = 'scale(1)')}
            />
          </div>
        </div>
      </div>

      {/* Services Section */}
 <Box
  sx={{
    width: '100%',
    backgroundColor: 'rgb(248,202,215)',
    display: 'flex',
    justifyContent: 'center'
  }}
>
  <Container
    maxWidth='xl'
    sx={{
      py: { xs: 3, sm: 4, md: 5, lg: 6, xl: 6 },
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      px: { xs: 2, sm: 3, md: 4, lg: 4, xl: 4 },
    }}
  >
    <motion.div
      initial='hidden'
      animate='visible'
      variants={staggerContainer}
      style={{
        textAlign: 'center',
        marginBottom: {
          xs: '0.75rem',
          sm: '1rem',
          md: '1.5rem',
          lg: '2rem',
          xl: '2rem',
        },
      }}
    >
      <motion.div variants={fadeInUp}>
        <Typography
          variant='h3'
          sx={{
            fontWeight: 700,
            color: '#6A1B9A',
            textTransform: 'uppercase',
            fontSize: {
              xs: '1rem',
              sm: '1.25rem',
              md: '1.5rem',
              lg: '2rem',
              xl: '2.25rem',
            },
            lineHeight: 1.2,
            width: '100%',
            fontFamily: 'Playfair Display, serif',
          }}
        >
          Our <span style={{ color: 'rgb(216, 56, 163)' }}>Premium</span>{' '}
          Services
        </Typography>
      </motion.div>
      <motion.div variants={fadeInUp}>
        <Typography
          variant='subtitle1'
          sx={{
            color: 'black',
            width: '100%',
            lineHeight: 1.5,
            textTransform: 'uppercase',
            fontSize: {
              xs: '0.625rem',
              sm: '0.75rem',
              md: '0.875rem',
              lg: '1rem',
              xl: '1.125rem',
            },
            opacity: 0.9,
            mt: { xs: 0.5, sm: 0.75, md: 1, lg: 1, xl: 1 },
          }}
        >
          Experience luxury and precision with our expertly crafted services
        </Typography>
      </motion.div>
    </motion.div>

    {/* Images and Cards */}
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        width: '100%',
      }}
    >
      {/* Images Row for Larger Screens */}
      <Box
        sx={{
          display: { xs: 'none', sm: 'flex' },
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: { xs: 10, sm: 8, md: 12, lg: 24, xl: 32 },
          mb: { sm: 4, md: 5, lg: 6, xl: 6 },
          width: '100%',
          marginTop: { sm: '1rem', md: '2rem', lg: '2.5rem', xl: '3rem' },
          px: { sm: 2, md: 0 },
        }}
      >
        {SalonCards.map((card, index) => (
          <Box
            key={index}
            sx={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box
              sx={{
                width: { sm: '5rem', md: '6rem', lg: '8rem', xl: '9rem' },
                height: { sm: '5rem', md: '6rem', lg: '8rem', xl: '9rem' },
                backgroundColor: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: '1px solid rgb(249, 245, 250)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
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
                }}
              />
            </Box>
            {/* Small Icon on Right Side, Slightly Below Midpoint */}
            <Box
              sx={{
                width: {
                  sm: '1.75rem',
                  md: '2rem',
                  lg: '2.5rem',
                  xl: '2.75rem',
                },
                height: {
                  sm: '1.75rem',
                  md: '2rem',
                  lg: '2.5rem',
                  xl: '2.75rem',
                },
                borderRadius: '50%',
                backgroundColor: 'rgb(241,149,174)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                position: 'absolute',
                right: {
                  sm: '-0.6rem',
                  md: '-0.7rem',
                  lg: '-0.9rem',
                  xl: '-1rem',
                },
                top: { sm: '2.5rem', md: '3rem', lg: '4rem', xl: '4.5rem' },
                border: '1px solid rgb(249, 245, 250)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                overflow: 'hidden',
              }}
            >
              {card.smallIcon}
            </Box>
          </Box>
        ))}
      </Box>

      {/* Cards with Images for Small Screens */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            sm: 'repeat(auto-fit, minmax(250px, 1fr))',
            md: 'repeat(2, 1fr)',
            lg: 'repeat(4, 1fr)',
            xl: 'repeat(4, 1fr)',
          },
          gap: { xs: 2, sm: 2.5, md: 3, lg: 4, xl: 4 },
          width: '100%',
          px: { xs: 1, sm: 2, md: 0 },
        }}
      >
        {SalonCards.map((card, index) => (
          <motion.div
            key={card.id}
            variants={cardItem}
            whileHover={{ y: -5 }}
            onMouseEnter={() => setHoveredCard(card.id)}
            onMouseLeave={() => setHoveredCard(null)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
            }}
          >
            {/* Image for Small Screens */}
            <Box
              sx={{
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Box
                sx={{
                  display: { xs: 'flex', sm: 'none' },
                  width: { xs: '6rem' },
                  height: { xs: '6rem' },
                  backgroundColor: 'white',
                  borderRadius: '50%',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgb(249, 245, 250)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  mb: 1,
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
                  }}
                />
              </Box>
              {/* Small Icon on Right Side for Small Screens, Slightly Below Midpoint */}
              <Box
                sx={{
                  display: { xs: 'flex', sm: 'none' },
                  width: { xs: '2rem' },
                  height: { xs: '2rem' },
                  borderRadius: '50%',
                  backgroundColor: 'rgb(241,149,174)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'absolute',
                  right: { xs: '-0.6rem' },
                  top: { xs: '2.8rem' },
                  border: '1px solid rgb(249, 245, 250)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  overflow: 'hidden',
                }}
              >
                {card.smallIcon}
              </Box>
            </Box>
            <Card
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                borderRadius: '0px 0px 30px 30px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                border: '1px solid rgb(214, 196, 216)',
                backgroundColor: 'rgb(241,149,174)',
                width: '100%',
              }}
            >
              <Box
                sx={{
                  p: { xs: 1.5, sm: 2, md: 3, lg: 4, xl: 4 },
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <Box>
                  <Typography
                    variant='h6'
                    sx={{
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      color: 'black',
                      fontSize: {
                        xs: '0.75rem',
                        sm: '0.875rem',
                        md: '1rem',
                        lg: '1.125rem',
                        xl: '1.125rem',
                      },
                      mb: 1,
                    }}
                  >
                    {card.title}
                  </Typography>
                  <Typography
                    variant='body2'
                    sx={{
                      color: 'black',
                      fontSize: {
                        xs: '0.625rem',
                        sm: '0.75rem',
                        md: '0.875rem',
                        lg: '0.875rem',
                        xl: '0.875rem',
                      },
                      lineHeight: 1.4,
                      mb: 2,
                    }}
                  >
                    {card.description}
                  </Typography>
                </Box>
                <Button
                  variant='contained'
                  sx={{
                    backgroundColor: 'black',
                    color: 'white',
                    borderRadius: '9999px',
                    px: { xs: 1.5, sm: 2, md: 3, lg: 4, xl: 4 },
                    py: 1,
                    fontSize: {
                      xs: '0.625rem',
                      sm: '0.75rem',
                      md: '0.875rem',
                      lg: '0.875rem',
                      xl: '0.875rem',
                    },
                    '&:hover': {
                      backgroundColor: '#333',
                    },
                  }}
                  onClick={() =>
                    navigate('/products', {
                      state: { designation: 'Salon' },
                    })
                  }
                >
                  View More
                </Button>
              </Box>
            </Card>
          </motion.div>
        ))}
      </Box>
    </Box>
  </Container>
</Box>
      {/* About Us Section */}

      <Box
        sx={{
          backgroundColor: 'rgb(248,202,215)', // BeautyBliss background color
          py: { xs: 5, sm: 6, md: 8 },
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <Container
          maxWidth='lg'
          sx={{
            position: 'relative',
            zIndex: 1,
            // backgroundColor: "rgb(240, 192, 206)", // BeautyBliss container color
            borderRadius: '12px',
            py: { xs: 2, sm: 3, md: 4 },
          }}
        >
          {/* Section Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true, margin: '-50px' }}
            style={{ textAlign: 'center', marginBottom: '2.5rem' }}
          >
            <Typography
              variant='h3'
              sx={{
                fontWeight: 800,
                mb: 1.5,
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' },
                background: '#56BBF1',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block',
                position: 'relative',
                '&:after': {
                  content: '""',
                  position: 'absolute',
                  bottom: '-8px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  width: '70px',
                  height: '3px',
                  // background: "linear-gradient(90deg, rgba(246, 16, 185, 1.00) 0%, rgba(151, 71, 255, 1.00) 100%)",
                  borderRadius: '2px',
                },
              }}
            >
              About Our Salon
            </Typography>
            <Typography
              variant='subtitle1'
              sx={{
                color: '#2D2828',
                maxWidth: '650px',
                margin: '0 auto',
                lineHeight: 1.5,
                fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
              }}
            >
              Where beauty meets perfection and every visit is a transformation
            </Typography>
          </motion.div>

          {/* Content */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              alignItems: 'center',
              gap: { xs: 3.5, sm: 4.5, md: 6 },
            }}
          >
            {/* Image with Oval Frame and Decorative Lines */}
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              style={{ flex: 1, position: 'relative' }}
            >
              <Box
                component='img'
                src={About}
                alt='Salon Interior'
                sx={{
                  width: '100%',
                  borderRadius: '50% / 40%', // Oval shape
                  // boxShadow: "0 10px 20px rgba(0,0,0,0.1)",
                  transition: 'all 0.4s ease',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                  zIndex: 2,
                  position: 'relative',
                  maxWidth: {
                    xs: '280px',
                    sm: '330px',
                    md: '380px',
                    lg: '700px',
                  },
                  margin: '0 auto',
                }}
              />
            </motion.div>

            {/* Text Content */}
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              whileInView={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
              style={{ flex: 1 }}
            >
              <Typography
                variant='h4'
                sx={{
                  fontWeight: 700,
                  mb: 2.5,
                  color: '#56BBF1',
                  fontSize: { xs: '1.4rem', sm: '1.75rem', md: '2rem' },
                }}
              >
                Your Personal Beauty Haven
              </Typography>

              <Typography
                variant='body1'
                sx={{
                  mb: 2.5,
                  lineHeight: 1.6,
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                  color: '#2D2828',
                }}
              >
                Since 2010, <strong>Beauty Haven Salon</strong> has been the
                premier destination for those seeking exceptional beauty
                services in a luxurious environment. Our passion for perfection
                drives us to deliver outstanding results every time.
              </Typography>

              <Typography
                variant='body1'
                sx={{
                  mb: 3.5,
                  lineHeight: 1.6,
                  fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
                  color: '#2D2828',
                }}
              >
                Our team of <strong>award-winning stylists</strong> and{' '}
                <strong>skincare specialists</strong>
                continuously train in the latest techniques to bring you
                cutting-edge services with timeless elegance.
              </Typography>

              {/* Features Grid */}
              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
                  gap: { xs: 2.5, sm: 3 },
                  mt: 3.5,
                }}
              >
                {[
                  {
                    title: 'Certified Experts',
                    text: 'All our professionals are fully certified and regularly trained',
                  },
                  {
                    title: 'Premium Products',
                    text: 'We use only the highest quality professional products',
                  },
                  {
                    title: 'Sanitized Tools',
                    text: 'All equipment is sterilized after each use for your safety',
                  },
                  {
                    title: 'Personalized Care',
                    text: 'Tailored services to match your unique style and needs',
                  },
                ].map((feature, index) => (
                  <motion.div
                    key={index}
                    whileHover={{ y: -5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <Box
                      sx={{
                        p: { xs: 1.75, sm: 2.25 },
                        background:
                          'linear-gradient(rgb(241, 149, 174) 0%, rgb(241, 149, 174) 61.5385%)',
                        borderRadius: '8px',
                        // border: "1px solid #FB646B",
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background:
                            'linear-gradient(rgb(241, 149, 174) 0%, rgb(241, 149, 174) 80%)',
                          boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
                        },
                      }}
                    >
                      <Typography
                        variant='subtitle1'
                        sx={{
                          fontWeight: 600,
                          mb: 0.75,
                          color: '#fff',
                          fontSize: { xs: '0.95rem', sm: '1.05rem' },
                        }}
                      >
                        {feature.title}
                      </Typography>
                      <Typography
                        variant='body2'
                        sx={{
                          color: '#E3F6FF',
                          opacity: 0.9,
                          fontSize: { xs: '0.8rem', sm: '0.9rem' },
                        }}
                      >
                        {feature.text}
                      </Typography>
                    </Box>
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </Box>
        </Container>
      </Box>
      {/* Our Work Section */}
      <div className='kportfolio-app'>
        <header className='kportfolio-header'>
          <h1>Our Portfolio</h1>
          <p className='kportfolio-subtitle'>
            Browse through our gallery to see the transformations we've created.
          </p>
        </header>

        <div className='kportfolio-grid'>
          {portfolioItems.map((item) => (
            <div className='kportfolio-card' key={item.id}>
              <div className='kcard-image-container'>
                <img
                  src={item.image}
                  alt={item.title}
                  className='kcard-image'
                />
                {/* <div className="kcard-content"> */}
                {/* <span className="kcard-number">{item.id}</span> */}
                <h2 className='kcard-title'>{item.title}</h2>
                <p className='kcard-description'>{item.description}</p>
                {/* </div> */}
              </div>
              <div className='kwave-container'>
                <svg viewBox='0 0 500 60' preserveAspectRatio='none'>
                  <path
                    d='M0,25 C150,40 350,0 500,5 L795,90 L0,60 Z'
                    fill='#f195ae'
                  ></path>
                </svg>
                <div className='kwave-content'>
                  <div className='kwave-text'>
                    <div className='kwave-name'>
                      <img src={item.icon} alt='icon' className='kwave-icon' />
                      {item.name}
                    </div>
                    <div className='kwave-tagline'>
                      Revitalize your skin with our rejuvenating facial
                      treatments, tailored to rates.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      {/* <Box
        sx={{
          backgroundColor: colors.primary,
          color: "white",
          py: 8,
          textAlign: "center",
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Container maxWidth="md">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >
            <Typography
              variant="h3"
              sx={{
                fontWeight: 700,
                mb: 3,
              }}
            >
              Ready for Your Transformation?
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 4,
                opacity: 0.9,
              }}
            >
              Book your appointment today and experience luxury beauty care
            </Typography>
            <Button
              variant="contained"
              size="large"
              endIcon={<BookOnlineIcon />}
              sx={{
                backgroundColor: "white",
                color: colors.primary,
                px: 5,
                py: 1.5,
                borderRadius: "50px",
                fontSize: "1.1rem",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: colors.lightAccent,
                },
              }}
              onClick={() => navigate("/products")}
            >
              Book Now
            </Button>
          </motion.div>
        </Container>
      </Box> */}

      {/* Book Now Floating Button */}

      <BookNowButton />
    </Box>
  );
};

export default SalonPage;
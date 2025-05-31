import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { Fade, Zoom } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

// Import images with fallback
import DermatologyBanner from "../Assets/dermatology-banner.jpg";
import DermatologyBanner1 from "../Assets/banner.jpg";

import BookOnlineIcon from "@mui/icons-material/BookOnline";

// Fallback image
const fallbackImage = "https://placehold.co/1200x600?text=Fallback+Image";

// Slider content array (image + text)
const sliderContent = [
  {
    image: DermatologyBanner,
    title: "SKIN CARE",
    description: "Professional skin care treatments for all skin types",
  },
  {
    image: DermatologyBanner1,
    title: "Hair Grafting",
    description: "Advanced hair restoration techniques for natural results",
  },
];

// Custom Previous Arrow
const PrevArrow = ({ onClick }) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  return (
    <IconButton
      onClick={onClick}
      sx={{
        position: "absolute",
        left: { xs: 2, sm: 4, md: 6 },
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 2,
        color: "rgba(0, 0, 0, 0.5)",
        "&:hover": {
          color: "rgba(0, 0, 0, 0.7)",
        },
        p: isMobile ? 0.5 : 1,
        transition: "color 0.3s",
      }}
      aria-label="Previous slide"
    >
      <ArrowBackIosIcon sx={{ fontSize: isMobile ? "1rem" : "1.5rem" }} />
    </IconButton>
  );
};

// Custom Next Arrow
const NextArrow = ({ onClick }) => {
  const isMobile = useMediaQuery("(max-width:600px)");
  return (
    <IconButton
      onClick={onClick}
      sx={{
        position: "absolute",
        right: { xs: 2, sm: 4, md: 6 },
        top: "50%",
        transform: "translateY(-50%)",
        zIndex: 2,
        color: "rgba(0, 0, 0, 0.5)",
        "&:hover": {
          color: "rgba(0, 0, 0, 0.7)",
        },
        p: isMobile ? 0.5 : 1,
        transition: "color 0.3s",
      }}
      aria-label="Next slide"
    >
      <ArrowForwardIosIcon sx={{ fontSize: isMobile ? "1rem" : "1.5rem" }} />
    </IconButton>
  );
};

const Doctor = () => {
  const [validContent, setValidContent] = useState([
    { image: fallbackImage, title: "Service", description: "" },
  ]);
  const [activeIndex, setActiveIndex] = useState(0);
  const isMobile = useMediaQuery("(max-width:600px)");
  const isTablet = useMediaQuery("(max-width:900px)");
  const isLargeScreen = useMediaQuery("(min-width:1800px)");

  useEffect(() => {
    const loadImages = async () => {
      const loadedContent = [];
      for (const content of sliderContent) {
        try {
          await new Promise((resolve, reject) => {
            const img = new Image();
            img.src = content.image;
            img.onload = () => resolve(content);
            img.onerror = () =>
              reject(new Error(`Failed to load ${content.image}`));
          });
          loadedContent.push(content);
        } catch (error) {
          loadedContent.push({
            ...content,
            image: fallbackImage,
          });
        }
      }
      setValidContent(
        loadedContent.length > 0
          ? loadedContent
          : [{ image: fallbackImage, title: "Service", description: "" }]
      );
    };
    loadImages();
  }, []);

  const handlePrev = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === 0 ? validContent.length - 1 : prevIndex - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((prevIndex) =>
      prevIndex === validContent.length - 1 ? 0 : prevIndex + 1
    );
  };

  // Calculate dynamic height based on screen size
  const getSliderHeight = () => {
    if (isMobile) return "30vh";
    if (isTablet) return "40vh";
    if (isLargeScreen) return "50vh";
    return "45vh";
  };

  // Dynamic border width for responsiveness
  const getBorderWidth = () => {
    if (isMobile) return "8px";
    if (isTablet) return "12px";
    return "16px";
  };

  
    const navigate = useNavigate();
   const handleServiceClick = (service) => {
    navigate("/products", { state: { designation: "Doctor", service } });
  };

// Book Now Button Component
const BookNowButton = () => {
  const isMobile = useMediaQuery("(max-width:600px)");
  const navigate = useNavigate();


  return (
    <Zoom in={true} timeout={1500} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: "fixed",
          bottom: { xs: 20, sm: 55 },
          right: { xs: 12, sm: 24 },
          zIndex: 1000,
        }}
      >
        <Button
          variant="contained"
          size={isMobile ? "small" : "medium"}
          sx={{
            background: "#36257d", // Initial background
            color: "#fff", // Text color
            fontSize: {
              xs: "0.7rem",
              sm: "0.85rem",
              md: "0.9rem",
              lg: "0.95rem",
            },
            px: { xs: 2, sm: 2.5, md: 3 },
            py: { xs: 0.75, sm: 1 },
            borderRadius: "25px",
            textTransform: "uppercase",
            fontWeight: "bold", // Matching with the Fab style
            letterSpacing: "0.5px",
            boxShadow: "0 4px 12px rgba(50, 26, 188, 0.4)", // Subtle shadow effect
            transition: "all 0.3s ease",
            position: "relative",
            overflow: "hidden",
            minWidth: "auto",
            border: "1px solid #fff", // Border to match the Fab
            "&:hover": {
              background: "#36257d", // Light teal color on hover
              color: "#fff", // Keep text color teal
              transform: "translateY(-2px)", // Slight lift effect
              boxShadow: "0 6px 16px rgba(50, 26, 188, 0.6)", // Enhanced shadow on hover
            },
            "&:before": {
              content: '""',
              position: "absolute",
              top: 0,
              left: "-100%",
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent)", // Glowing effect
              transition: "0.4s",
            },
            "&:hover:before": {
              left: "100%",
            },
          }}
          onClick={() =>
            navigate("/products", { state: { designation: "Doctor" } })
          }
        >
          <BookOnlineIcon sx={{ mr: 1 }} />
          Book Now
        </Button>
      </Box>
    </Zoom>
  );
};


  return (
    <div id="home">
      <Fade in={true} timeout={2000}>
        <Box
          sx={{
            position: "relative",
            height: getSliderHeight(),
            width: "100vw",
            maxWidth: "100%",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            overflow: "hidden",
            boxSizing: "border-box",
            border: `${getBorderWidth()} solid #f8e1e7`,
            borderRadius: "20px",
          }}
        >
          {validContent.length > 0 && (
            <Box
              sx={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                zIndex: 0,
              }}
            >
              {/* Navigation Arrows */}
              <PrevArrow onClick={handlePrev} />
              <NextArrow onClick={handleNext} />

              {/* Slides */}
              {validContent.map((content, index) => (
                <Box
                  key={index}
                  sx={{
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: "100%",
                    height: "100%",
                    opacity: activeIndex === index ? 1 : 0,
                    transition: "opacity 0.5s ease-in-out",
                    zIndex: 1,
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "center",
                    alignItems: "flex-start",
                    paddingLeft: { xs: 2, sm: 3, md: 5, lg: 6 },
                    paddingRight: { xs: 2, sm: 3, md: 5, lg: 6 },
                  }}
                >
                  <img
                    src={content.image}
                    alt={`Slide ${index + 1}`}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center center",
                      display: "block",
                      position: "absolute",
                      top: 0,
                      left: 0,
                    }}
                    onError={(e) => {
                      e.target.src = fallbackImage;
                    }}
                  />
                  <Box
                    sx={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      height: "100%",
                      background: "rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  {/* Text Content */}
                  <Box
                    sx={{
                      position: "relative",
                      zIndex: 2,
                      textAlign: "left",
                      maxWidth: "500px",
                    }}
                  >
                    <Typography
                      variant="h4"
                      sx={{
                        fontSize: {
                          xs: "1.4rem",
                          sm: "2rem",
                          md: "2.5rem",
                          lg: "3rem",
                        },
                        fontWeight: 700,
                        textTransform: "uppercase",
                        color: "white",
                        mb: { xs: 1, sm: 1.5, md: 2 },
                        letterSpacing: "2px",
                      }}
                    >
                      {content.title}
                    </Typography>

                    <Typography
                      variant={isMobile ? "body2" : "body1"}
                      component="p"
                      sx={{
                        mb: { xs: 1.5, sm: 2, md: 2.5 },
                        color: "white",
                        fontSize: {
                          xs: "0.75rem",
                          sm: "0.9rem",
                          md: "1rem",
                          lg: "1.1rem",
                        },
                        lineHeight: 1.8,
                        fontWeight: 400,
                        maxWidth: "90%",
                      }}
                    >
                      {content.description}
                    </Typography>

                    {/* Explore Services Button */}
                    <Button
                      variant="contained"
                      size={isMobile ? "small" : "medium"}
                      onClick={() => handleServiceClick()}
                      sx={{
                        backgroundColor: "#ff69b4",
                        color: "white",
                        fontSize: {
                          xs: "0.65rem",
                          sm: "0.8rem",
                          md: "0.85rem",
                          lg: "0.9rem",
                        },
                        px: { xs: 2.5, sm: 3.5, md: 4 },
                        py: { xs: 0.5, sm: 0.75, md: 1 },
                        borderRadius: "50px",
                        textTransform: "uppercase",
                        fontWeight: "bold",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          backgroundColor: "#ff85c1",
                          boxShadow: "0 6px 15px rgba(0, 0, 0, 0.2)",
                        },
                      }}
                    >
                      Explore Services
                    </Button>
                  </Box>
                </Box>
              ))}
            </Box>
          )}

            {/* Book Now Button */}
          <BookNowButton />
        </Box>
      </Fade>
    </div>
  );
};

export default Doctor;
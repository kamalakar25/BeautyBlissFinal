"use client";

import { IconButton } from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

// Import images (you'll need to add your own images for the collage)
// Placeholder images for the collage (replace with your actual images)
import collageImage5 from "../Assets/bridal.jpg"; // Bottom row, third image
import collageImage1 from "../Assets/collageimg1.jpg"; // Top row, first image
import collageImage2 from "../Assets/collageimg2.avif"; // Top row, second image
import collageImage3 from "../Assets/collageimg3.avif"; // Bottom row, first image
import collageImage4 from "../Assets/collageimg4.webp"; // Bottom row, second image

import svg3 from "../Assets/group_1.svg";
import svg1 from "../Assets/vector.svg";
import svg2 from "../Assets/vector_1.svg";

import card1 from "../Assets/rectangle_1.png";
import card2 from "../Assets/rectangle_1_1.png";
import card3 from "../Assets/rectangle_1_2.png";
import card4 from "../Assets/rectangle_1_3.png";

import Girlhair from "../../assets/female-hairdresser.png";
import Girlhair1 from "../../assets/female-hairdresser1.png";
import Faq from "./Faqs";
import Footer from "./Footer";
import LeadCaptureForm from "./LeadCaptureForm";

const Home = () => {
  const navigate = useNavigate();
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [serviceProviders, setServiceProviders] = useState([]);
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [selectedProvider, setSelectedProvider] = useState("");
  const modalRef = useRef(null);
  const [filteredProviders, setFilteredProviders] = useState([]);
  const [error, setError] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [startDateFilter, setStartDateFilter] = useState("");
  const [endDateFilter, setEndDateFilter] = useState("");
  const [addresses, setAddresses] = useState({});
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const itemsPerPage = 5;

  const handleClick = () => {
    navigate("/salon");
    window.scrollTo(0, 0);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const BASE_URL = process.env.REACT_APP_API_URL;

  useEffect(() => {
    const fetchServiceProviders = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/main/admin/get/all/service-providers`
        );
        const providers = response.data;
        setServiceProviders(providers.reverse());
        setFilteredProviders(providers);
      } catch (error) {
        setError("Failed to load service providers. Please try again.");
      }
    };
    fetchServiceProviders();
  }, []);

  useEffect(() => {
    let filtered = serviceProviders;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((provider) => {
        const fieldsToSearch = [
          provider.name || "",
          provider.email || "",
          provider.phone || "",
          provider.shopName || "",
          provider.designation || "",
          provider.location || "",
          formatDate(provider.createdAt) || "",
          formatDate(provider.dob) || "",
        ];
        return fieldsToSearch.some((field) =>
          field.toLowerCase().includes(query)
        );
      });
    }

    if (startDateFilter || endDateFilter) {
      filtered = filtered.filter((provider) => {
        if (!provider.createdAt) return false;
        try {
          const joinDate = new Date(provider.createdAt);
          if (isNaN(joinDate.getTime())) return false;
          const startDate = startDateFilter ? new Date(startDateFilter) : null;
          const endDate = endDateFilter ? new Date(endDateFilter) : null;
          if (endDate) endDate.setHours(23, 59, 59, 999);
          if (startDate && endDate) {
            return joinDate >= startDate && joinDate <= endDate;
          } else if (startDate) {
            return joinDate >= startDate;
          } else if (endDate) {
            return joinDate <= endDate;
          }
          return true;
        } catch (error) {
          return false;
        }
      });
    }

    setFilteredProviders(filtered);
    setCurrentPage(1);
  }, [searchQuery, startDateFilter, endDateFilter, serviceProviders]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";
      const day = String(date.getDate()).padStart(2, "0");
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return "Invalid Date";
    }
  };

  const clearAllFilters = () => {
    setStartDateFilter("");
    setEndDateFilter("");
    setSearchQuery("");
    setShowFilters(false);
  };

  const parseCoordinates = (location) => {
    if (!location || typeof location !== "string") {
      return { latitude: null, longitude: null };
    }
    try {
      const latMatch = location.match(/Lat: ([\d.-]+)/);
      const lonMatch = location.match(/Lon: ([\d.-]+)/);
      const latitude = latMatch ? Number.parseFloat(latMatch[1]) : null;
      const longitude = lonMatch ? Number.parseFloat(lonMatch[1]) : null;
      return { latitude, longitude };
    } catch (error) {
      return { latitude: null, longitude: null };
    }
  };

  const handleToggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  const totalPages = Math.ceil(filteredProviders.length / itemsPerPage);
  const paginatedProviders = filteredProviders.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleBackdropClick = (event) => {
    if (event.target === event.currentTarget) {
    }
  };

  const handleServiceClick = (service) => {
    navigate("/products", {
      state: { designation: "Salon", service: service },
    });
  };

  const handleBeautyClick = (service) => {
    navigate("/products", {
      state: { designation: "Beauty_Parler", service: service },
    });
  };

  const getMapLink = (location) => {
    const { latitude, longitude } = parseCoordinates(location);
    const lat = latitude !== null ? latitude : 17.359699;
    const lon = longitude !== null ? longitude : 78.534277;
    return `https://www.google.com/maps?q=${lat},${lon}`;
  };

  useEffect(() => {
    if (enquiryModalOpen) {
      const fetchServiceProviders = async () => {
        try {
          const response = await axios.get(
            `${BASE_URL}/api/main/admin/get/all/service-providers`
          );
          setServiceProviders(response.data);
        } catch (error) {
          console.error("Failed to fetch service providers:", error);
        }
      };
      fetchServiceProviders();
    }
  }, [enquiryModalOpen, BASE_URL]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setEnquiryModalOpen(false);
      }
    };

    if (enquiryModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [enquiryModalOpen]);

  const FilterToggleButton = styled(IconButton)(({ theme }) => ({
    display: "none",
    [theme.breakpoints.down("lg")]: {
      display: "block",
      color: "#201548",
      backgroundColor: "transparent",
      "&:hover": {
        backgroundColor: "rgba(32, 21, 72, 0.1)",
      },
    },
  }));

  const handleSubmitEnquiry = async () => {
    const email = localStorage.getItem("email");
    if (!email) {
      alert("Please login to submit an enquiry.");
      window.location.href = "/login";
      return;
    }
    if (!selectedProvider || !enquiryMessage) {
      alert("Please select a service provider and enter a message.");
      return;
    }

    try {
      const response = await axios.post(`${BASE_URL}/api/users/enquiries`, {
        parlorEmail: selectedProvider,
        message: enquiryMessage,
        email,
      });

      if (response.status === 201) {
        alert("Enquiry submitted successfully!");
        setEnquiryModalOpen(false);
        setEnquiryMessage("");
        setSelectedProvider("");
      }
    } catch (error) {
      // console.error("Error submitting enquiry:", error);
      alert("Failed to submit enquiry. Please try again.");
    }
  };

  const handleEnquiryClick = () => {
    navigate("/products", { state: { openEnquiryModal: true } });
    alert("Please set your location to proceed with the enquiry.");
  };

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        backgroundColor: "#fad9e3",
        minHeight: "100vh",
        color: "rgb(244,245,247)",
      }}
    >
      {/* Main Content Section */}
      <main
        style={{
          backgroundColor: "#fad9e3",
          padding: "20px",
          borderRadius: "20px",
          margin: "10px",
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          justifyContent: "space-between",
          alignItems: "center",
          // maxHeight: "calc(100vh - 40px)", // Prevents it from growing too large
          overflow: "hidden", // Contains content
        }}
      >
        {/* Left Section: Text and Button */}
        <div
          style={{
            flex: "1 1 50%",
            minWidth: "250px", // Reduced minWidth to allow shrinking at 320px
            paddingRight: "10px",
            textAlign: "center", // Center text on small screens
          }}
          className="text-left md:text-left" // Left align on medium and larger screens
        >
          <h1
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "#000",
              fontFamily: "Arial, sans-serif",
              lineHeight: "1.2",
              marginBottom: "15px",
            }}
            className="text-center md:text-left"
          >
            BUILD YOUR DREAM <br /> BODY LIFESTYLE
          </h1>
          <p
            style={{
              fontSize: "18px",
              color: "#000",
              fontFamily: "Arial, sans-serif",
              marginBottom: "20px",
            }}
            className="text-center md:text-left"
          >
            Discover your natural glow with our premium beauty treatments and
            personalized skincare solutions.
          </p>
          <button
            style={{
              backgroundColor: "#fff",
              border: "1px solid #000",
              borderRadius: "20px",
              padding: "10px 30px",
              fontSize: "16px",
              fontFamily: "Arial, sans-serif",
              cursor: "pointer",
              color: "#000",
              display: "flex",
              alignItems: "center",
              gap: "10px",
              margin: "0 auto", // Center button on small screens
            }}
            onClick={() => {
              navigate("/salon");
            }}
          >
            Get started
            <span>→</span>
          </button>

          {/* Icons and Text Section */}
          <div
            style={{
              display: "flex",
              gap: "10px",
              marginTop: "20px",
              flexWrap: "wrap",
              justifyContent: "center", // Center items on small screens
            }}
            className="md:justify-start" // Left align items on medium and larger screens
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <img
                src={svg1}
                alt="Premium Services Icon"
                style={{
                  width: "30px",
                  height: "30px",
                }}
              />
              <span
                style={{
                  fontSize: "14px",
                  color: "#000",
                  fontFamily: "Arial, sans-serif",
                }}
                className="text-center md:text-left"
              >
                PREMIUM SERVICES <br /> beauty professionals
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <img
                src={svg2}
                alt="Premium Services Icon"
                style={{
                  width: "30px",
                  height: "30px",
                }}
              />
              <span
                style={{
                  fontSize: "14px",
                  color: "#000",
                  fontFamily: "Arial, sans-serif",
                }}
                className="text-center md:text-left"
              >
                INSTANT BOOKING <br /> no waiting for confirmation
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
              }}
            >
              <img
                src={svg3}
                alt="Premium Services Icon"
                style={{
                  width: "30px",
                  height: "30px",
                }}
              />
              <span
                style={{
                  fontSize: "14px",
                  color: "#000",
                  fontFamily: "Arial, sans-serif",
                }}
                className="text-center md:text-left"
              >
                VERIFIED REVIEWS <br /> from clients
              </span>
            </div>
          </div>
        </div>

        {/* Right Section: Image Collage (2 images on top, 3 images on bottom) */}
        <div
          style={{
            flex: "1 1 40%",
            minWidth: "250px", // Reduced minWidth to allow shrinking at 320px
            display: "grid",
            gridTemplateRows: "1fr 1fr",
            gap: "5px",
            height: "450px",
          }}
        >
          {/* Top Row: 2 Images */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "5px",
            }}
          >
            <div
              style={{
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <img
                src={collageImage1}
                alt="Collage Image 1"
                style={{
                  width: "100%",
                  height: "190px",
                  objectFit: "cover",
                }}
              />
            </div>
            <div
              style={{
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <img
                src={collageImage2}
                alt="Collage Image 2"
                style={{
                  width: "100%",
                  height: "190px",
                  objectFit: "cover",
                }}
              />
            </div>
          </div>

          {/* Bottom Row: 3 Images */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr 1fr",
              gap: "5px",
            }}
          >
            <div
              style={{
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <img
                src={collageImage3}
                alt="Collage Image 3"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            <div
              style={{
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <img
                src={collageImage4}
                alt="Collage Image 4"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
            <div
              style={{
                borderRadius: "8px",
                overflow: "hidden",
              }}
            >
              <img
                src={collageImage5}
                alt="Collage Image 5"
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                }}
              />
            </div>
          </div>
        </div>
      </main>
      <style>
        {`
    /* Main container */
    .main-container {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      justify-content: space-between;
      align-items: center;
    }

    /* Left section */
    .left-section {
      flex: 1 1 50%;
      min-width: 250px;
      padding-right: 10px;
    }

    .hero-title {
      font-size: 48px;
      font-weight: bold;
      color: #000;
      font-family: Arial, sans-serif;
      line-height: 1.2;
      margin-bottom: 15px;
    }

    .hero-subtitle {
      font-size: 18px;
      color: #000;
      font-family: Arial, sans-serif;
      margin-bottom: 20px;
    }

    .cta-button {
      background-color: #fff;
      border: 1px solid #000;
      border-radius: 20px;
      padding: 10px 30px;
      font-size: 16px;
      font-family: Arial, sans-serif;
      cursor: pointer;
      color: #000;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .icons-section {
      display: flex;
      gap: 10px;
      margin-top: 20px;
      flex-wrap: wrap;
    }

    .icon-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .icon-image {
      width: 30px;
      height: 30px;
    }

    .icon-text {
      font-size: 14px;
      color: #000;
      font-family: Arial, sans-serif;
    }

    /* Right section: Image collage */
    .right-section {
      flex: 1 1 40%;
      min-width: 250px;
      display: grid;
      grid-template-rows: 1fr 1fr;
      gap: 5px;
      height: 450px;
    }

    .top-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 5px;
    }

    .bottom-row {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 5px;
    }

    .image-container {
      border-radius: 8px;
      overflow: hidden;
    }

    .collage-image {
      width: 100%;
      height: 190px;
      object-fit: cover;
    }

    .collage-image-bottom {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    /* Responsive adjustments */
    @media (max-width: 1400px) {
      .main-container {
        padding: 15px;
        gap: 15px;
      }

      .hero-title {
        font-size: 42px;
        line-height: 1.2;
      }

      .right-section {
        height: 400px;
      }

      .collage-image {
        height: 170px;
      }
    }

    @media (max-width: 1200px) {
      .main-container {
        padding: 12px;
        gap: 12px;
      }

      .hero-title {
        font-size: 38px;
      }

      .hero-subtitle {
        font-size: 16px;
      }

      .right-section {
        height: 360px;
      }

      .collage-image {
        height: 150px;
      }
    }

    @media (max-width: 1024px) {
      .main-container {
        padding: 10px;
        gap: 10px;
      }

      .hero-title {
        font-size: 34px;
      }

      .hero-subtitle {
        font-size: 15px;
      }

      .cta-button {
        padding: 8px 25px;
        font-size: 15px;
      }

      .right-section {
        height: 340px;
      }

      .collage-image {
        height: 140px;
      }
    }

    @media (max-width: 992px) {
      .main-container {
        flex-direction: column;
        padding: 10px;
        gap: 15px;
        max-height: none; /* Remove max-height for better content fit */
        overflow: visible; /* Allow content to expand */
      }

      .left-section {
        flex: 1;
        padding-right: 0;
        text-align: center;
        width: 100%;
      }

      .right-section {
        flex: 1;
        height: auto; /* Dynamic height for images */
        width: 100%;
      }

      .hero-title {
        font-size: 32px;
      }

      .icons-section {
        justify-content: center;
        gap: 12px;
      }

      .collage-image {
        height: 160px;
      }

      .collage-image-bottom {
        height: 160px; /* Consistent height for bottom row */
      }
    }

    @media (max-width: 768px) {
      .main-container {
        padding: 8px;
        gap: 12px;
      }

      .left-section {
        padding: 0.5rem;
      }

      .hero-title {
        font-size: 28px;
        line-height: 1.2;
      }

      .hero-subtitle {
        font-size: 14px;
        padding: 0 0.5rem;
      }

      .cta-button {
        padding: 8px 20px;
        font-size: 14px;
        margin: 0 auto;
      }

      .icon-text {
        font-size: 13px;
      }

      .right-section {
        height: auto;
        display: block; /* Ensure visibility */
        overflow: visible;
      }

      .collage-image {
        width: 100%;
        max-width: 450px;
        height: auto;
        max-height: 200px;
        display: block;
      }

      .collage-image-bottom {
        width: 100%;
        max-width: 450px;
        height: auto;
        max-height: 200px;
        display: block;
      }

      .top-row, .bottom-row {
        display: flex;
        flex-direction: column;
        gap: 8px;
        align-items: center;
      }
    }

    @media (max-width: 576px) {
      .main-container {
        padding: 6px;
        gap: 10px;
      }

      .left-section {
        padding: 0.4rem;
      }

      .hero-title {
        font-size: 24px;
        line-height: 1.2;
      }

      .hero-subtitle {
        font-size: 13px;
        padding: 0 0.4rem;
      }

      .cta-button {
        padding: 6px 18px;
        font-size: 13px;
      }

      .icon-image {
        width: 25px;
        height: 25px;
      }

      .icon-text {
        font-size: 12px;
      }

      .collage-image {
        max-width: 340px;
        max-height: 180px;
      }

      .collage-image-bottom {
        max-width: 340px;
        max-height: 180px;
      }
    }

    @media (max-width: 400px) {
      .main-container {
        padding: 5px;
        gap: 8px;
      }

      .left-section {
        padding: 0.3rem;
      }

      .hero-title {
        font-size: 20px;
        line-height: 1.2;
      }

      .hero-subtitle {
        font-size: 12px;
        padding: 0 0.3rem;
      }

      .cta-button {
        padding: 5px 15px;
        font-size: 12px;
      }

      .icon-image {
        width: 22px;
        height: 22px;
      }

      .icon-text {
        font-size: 11px;
      }

      .collage-image {
        max-width: 280px;
        max-height: 160px;
      }

      .collage-image-bottom {
        max-width: 280px;
        max-height: 160px;
      }
    }

    @media (max-width: 320px) {
      .main-container {
        padding: 4px;
        gap: 6px;
      }

      .left-section {
        padding: 0.2rem;
      }

      .hero-title {
        font-size: 18px;
        line-height: 1.2;
      }

      .hero-subtitle {
        font-size: 11px;
        padding: 0 0.2rem;
      }

      .cta-button {
        padding: 4px 12px;
        font-size: 11px;
      }

      .icon-image {
        width: 20px;
        height: 20px;
      }

      .icon-text {
        font-size: 10px;
      }

      .collage-image {
        max-width: 240px;
        max-height: 140px;
      }

      .collage-image-bottom {
        max-width: 240px;
        max-height: 140px;
      }
    }
  `}
      </style>
      <div
        className="container-fluid"
        style={{
          backgroundColor: "#fad9e3",
          // minHeight: '100vh',
          padding: "2rem 0",
          overflow: "hidden",
        }}
      >
        <style>
          {`
          
          /* Button styles */
.btn-conteiner {
  display: flex;
  justify-content: center;
  --color-text: rgb(244,245,247);
  --color-background: #fb646b;
  --color-outline: #fb646b;
  --color-shadow: #fb646b;
} 

.btn-content {
  display: flex;
  align-items: center;
  padding: 6px 15px !important;
  text-decoration: none;
  font-family: 'Playfair Display SC', serif !important;
  font-weight: 100 !important;
  font-size: 14px !imporatnt;
  color: var(--color-text);
  background: #fb646b !important;
  transition: all 0.5s ease;
  border-radius: 50px;
  box-shadow: 0 5px 15px var(--color-shadow);
  border: none;
  position: relative;
  overflow: hidden;
  z-index: 1;
}

/* Main layout */
.hero-container {
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-wrap: wrap;
  align-items: flex-start;
  gap: 0;
  height: 100%;
  padding: 1rem;
}

.left-section {
  flex: 0 0 55%;
  display: flex;
  flex-direction: column;
  padding: 1rem;
}

.right-section {
  flex: 0 0 45%;
  position: relative;
  height: 500px;
}

.text-content {
  padding-right: 1.5rem;
  padding-top: 1rem;
  font-family: 'Playfair Display SC', serif !important;
}

.hero-title {
  font-size: 2.5rem;
  font-weight: 800;
  line-height: 1.1;
  color: #201548;
  margin-bottom: 0.5rem;
  text-transform: uppercase;
}

.hero-subtitle {
  font-size: 1.1rem;
  color: #201548;
  margin-bottom: 1rem;
  max-width: 380px;
  line-height: 1.4;
}

.primary-image {
  width: 100%;
  height: 80%;
  object-fit: cover;
  border-radius: 5px 5px 5px 180px;
  position: absolute;
  left: -55px;
  background-size: cover;
  border: 2px transparent solid;
}

.secondary-image {
  width: 100%;
  height: 300px;
  object-fit: cover;
  border-radius: 5px 180px 5px 5px;
  margin-top: 3rem;
  border: 2px transparent solid;
}

.button-group {
  display: flex;
  gap: 0.8rem;
  margin-top: 1rem;
  flex-wrap: wrap;
  justify-content: flex-start;
}

/* Responsive adjustments */
@media (max-width: 1400px) {
  .hero-container {
    max-width: 1200px;
    padding: 1rem;
    gap: 0.5rem;
  }

  .hero-title {
    font-size: 2.4rem;
    line-height: 1.2;
  }

  .hero-subtitle {
    max-width: 360px;
  }

  .primary-image {
    width: 98%;
    height: 80%;
    left: -20px;
    border-radius: 5px 5px 5px 100px;
  }

  .secondary-image {
    width: 98%;
    height: 280px;
    margin-top: 2rem;
    border-radius: 5px 100px 5px 5px;
  }
}

@media (max-width: 1200px) {
  .hero-container {
    max-width: 1000px;
    padding: 0.8rem;
    gap: 0.5rem;
  }

  .hero-title {
    font-size: 2.2rem;
    line-height: 1.2;
  }
  
  .hero-subtitle {
    font-size: 1.05rem;
    max-width: 340px;
  }

  .primary-image {
    width: 98%;
    height: 75%;
    left: -10px;
    border-radius: 5px 5px 5px 80px;
  }
  
  .secondary-image {
    width: 98%;
    height: 250px;
    margin-top: 1.5rem;
    border-radius: 5px 80px 5px 5px;
  }

  .button-group {
    gap: 0.7rem;
  }
}

@media (max-width: 1024px) {
  .hero-container {
    max-width: 900px;
    padding: 0.8rem;
    gap: 0.8rem;
  }

  .left-section {
    padding: 0.8rem;
  }

  .hero-title {
    font-size: 2rem;
    line-height: 1.2;
  }

  .hero-subtitle {
    font-size: 1rem;
    max-width: 320px;
  }

  .primary-image {
    width: 100%;
    height: auto;
    max-height: 400px;
    position: relative;
    left: 0;
    margin: 0 auto;
    border-radius: 10px;
    object-fit: cover;
    display: block;
  }
  
  .secondary-image {
    width: 100%;
    height: auto;
    max-height: 300px;
    margin: 1.2rem auto;
    border-radius: 10px;
    object-fit: cover;
    display: block;
  }

  .button-group {
    gap: 0.6rem;
    justify-content: flex-start;
  }
}

@media (max-width: 992px) {
  .hero-container {
    flex-direction: column;
    padding: 0.6rem;
    gap: 1rem;
    max-width: 100%;
  }
  
  .left-section {
    flex: 1;
    padding: 0.6rem;
    width: 100%;
    align-items: center;
  }
  
  .right-section {
    flex: 1;
    height: auto;
    width: 100%;
    padding: 0.6rem;
  }
  
  .text-content {
    padding: 0;
    margin-bottom: 1rem;
    text-align: center;
    width: 100%;
  }
  
  .hero-title {
    font-size: 1.9rem;
    line-height: 1.2;
  }
  
  .hero-subtitle {
    font-size: 0.95rem;
    max-width: 100%;
    padding: 0 0.5rem;
  }
  
  .primary-image {
    width: 100%;
    max-width: 600px;
    height: auto;
    max-height: 350px;
    margin: 0 auto;
    border-radius: 10px;
    display: block;
    object-fit: cover;
  }
  
  .secondary-image {
    width: 100%;
    max-width: 600px;
    height: auto;
    max-height: 300px;
    margin: 1rem auto;
    border-radius: 10px;
    display: block;
    object-fit: cover;
  }
  
  .button-group {
    justify-content: center;
    gap: 0.6rem;
    padding: 0 0.5rem;
    width: 100%;
  }
}

@media (max-width: 768px) {
  .hero-container {
    padding: 0.5rem;
    gap: 0.8rem;
  }

  .left-section {
    padding: 0.5rem;
    align-items: center;
  }

  .right-section {
    padding: 0.5rem;
    height: auto;
    display: block; /* Ensure container is visible */
    position: relative;
    overflow: visible; /* Prevent clipping of images */
  }

  .hero-title {
    font-size: 1.7rem;
    line-height: 1.2;
  }
  
  .hero-subtitle {
    font-size: 0.9rem;
    padding: 0 0.5rem;
  }
  
  .btn-content {
    padding: 6px 14px;
    font-size: 12px;
  }
  
  .primary-image {
    width: 100%;
    max-width: 450px;
    height: auto;
    max-height: 280px;
    margin: 0 auto;
    border-radius: 8px;
    display: block !important; /* Override any hiding classes */
    object-fit: cover;
    position: relative;
    visibility: visible; /* Ensure visibility */
  }
  
  .secondary-image {
    width: 100%;
    max-width: 450px;
    height: auto;
    max-height: 250px;
    margin: 0.8rem auto;
    border-radius: 8px;
    display: block !important; /* Override any hiding classes */
    object-fit: cover;
    position: relative;
    visibility: visible; /* Ensure visibility */
  }
  
  .button-group {
    gap: 0.5rem;
    justify-content: center;
    padding: 0 0.5rem;
  }

  .text-content {
    text-align: center;
  }
}

@media (max-width: 576px) {
  .hero-container {
    padding: 0.4rem;
  }

  .left-section {
    padding: 0.4rem;
  }

  .right-section {
    padding: 0.4rem;
  }

  .hero-title {
    font-size: 1.4rem;
    line-height: 1.2;
  }
  
  .hero-subtitle {
    font-size: 0.85rem;
    padding: 0 0.4rem;
  }
  
  .btn-content {
    padding: 5px 12px;
    font-size: 11px;
  }
  
  .primary-image {
    width: 100%;
    max-width: 340px;
    height: auto;
    max-height: 220px;
    margin: 0 auto;
    border-radius: 8px;
    display: block !important;
    object-fit: cover;
    position: relative;
    visibility: visible;
  }
  
  .secondary-image {
    width: 100%;
    max-width: 340px;
    height: auto;
    max-height: 200px;
    margin: 0.6rem auto;
    border-radius: 8px;
    display: block !important;
    object-fit: cover;
    position: relative;
    visibility: visible;
  }
  
  .button-group {
    gap: 0.4rem;
    flex-wrap: wrap;
    justify-content: center;
    padding: 0 0.4rem;
  }
}

@media (max-width: 400px) {
  .hero-container {
    padding: 0.3rem;
  }

  .left-section {
    padding: 0.3rem;
  }

  .right-section {
    padding: 0.3rem;
  }

  .hero-title {
    font-size: 1.2rem;
    line-height: 1.2;
  }
  
  .hero-subtitle {
    font-size: 0.8rem;
    padding: 0 0.3rem;
  }
  
  .btn-content {
    padding: 4px 10px;
    font-size: 10px;
  }
  
  .primary-image {
    width: 100%;
    max-width: 280px;
    height: auto;
    max-height: 180px;
    margin: 0 auto;
    border-radius: 8px;
    display: block !important;
    object-fit: cover;
    position: relative;
    visibility: visible;
  }
  
  .secondary-image {
    width: 100%;
    max-width: 280px;
    height: auto;
    max-height: 160px;
    margin: 0.5rem auto;
    border-radius: 8px;
    display: block !important;
    object-fit: cover;
    position: relative;
    visibility: visible;
  }
  
  .button-group {
    gap: 0.3rem;
    padding: 0 0.3rem;
  }
}

@media (max-width: 320px) {
  .hero-container {
    padding: 0.2rem;
  }

  .left-section {
    padding: 0.2rem;
  }

  .right-section {
    padding: 0.2rem;
  }

  .hero-title {
    font-size: 1rem;
    line-height: 1.2;
  }
  
  .hero-subtitle {
    font-size: 0.75rem;
    padding: 0 0.2rem;
  }
  
  .btn-content {
    padding: 3px 8px;
    font-size: 9px;
  }
  
  .primary-image {
    width: 100%;
    max-width: 240px;
    height: auto;
    max-height: 150px;
    margin: 0 auto;
    border-radius: 6px;
    display: block !important;
    object-fit: cover;
    position: relative;
    visibility: visible;
  }
  
  .secondary-image {
    width: 100%;
    max-width: 240px;
    height: auto;
    max-height: 140px;
    margin: 0.4rem auto;
    border-radius: 6px;
    display: block !important;
    object-fit: cover;
    position: relative;
    visibility: visible;
  }
  
  .button-group {
    gap: 0.2rem;
    padding: 0 0.2rem;
  }
}

      /* Button styles */
      .btn-conteiner {
        display: flex;
        justify-content: center;
        --color-text: rgb(244,245,247);
        --color-background: #fb646b;
        --color-outline: #fb646b;
        --color-shadow: #fb646b;
      } 

      .btn-content {
        display: flex;
        align-items: center;
        padding: 6px 15px !important ; /* Reduced padding from 10px 25px */
        text-decoration: none;
        font-family: 'Playfair Display SC', serif !important;
        font-weight: 100 !important;
        font-size: 14px !imporatnt; /* Reduced font size from 16px */
        color: var(--color-text);
        background: #fb646b !important;
        transition: all 0.5s ease;
        border-radius: 50px;
        box-shadow: 0 5px 15px var(--color-shadow);
        border: none;
        position: relative;
        overflow: hidden;
        z-index: 1;
      }

      /* Main layout */
      .hero-container {
        max-width: 1400px;
        margin: 0 auto;
        display: flex;
        flex-wrap: wrap;
        align-items: flex-start;
        gap: 0;
        height: 100%;
        padding: 1rem;
      }

      .left-section {
        flex: 0 0 55%;
        display: flex;
        flex-direction: column;
        padding: 1rem;
      }

      .right-section {
        flex: 0 0 45%;
        position: relative;
        height: 500px;
      }

      .text-content {
        padding-right: 1.5rem;
        padding-top: 1rem;
        font-family: 'Playfair Display SC', serif !important;
      }

      .hero-title {
        font-size: 2.5rem;
        font-weight: 800;
        line-height: 1.1;
        color: #201548;
        margin-bottom: 0.5rem;
        text-transform: uppercase;
      }

      .hero-subtitle {
        font-size: 1.1rem;
        color: #201548;
        margin-bottom: 1rem;
        max-width: 380px;
        line-height: 1.4;
      }

      .primary-image {
        width: 100%;
        height: 80%;
        object-fit: cover;
        border-radius: 5px 5px 5px 180px;
        position: absolute;
        left: -55px;
        background-size: cover;
        border: 2px transparent solid;
      }

      .secondary-image {
        width: 100%;
        height: 300px;
        object-fit: cover;
        border-radius: 5px 180px 5px 5px;
        margin-top: 3rem;
        border: 2px transparent solid;
      }

      .button-group {
        display: flex;
        gap: 0.8rem;
        margin-top: 1rem;
        flex-wrap: wrap;
        justify-content: flex-start;
      }

      /* Responsive adjustments */
      @media (max-width: 1400px) {
        .hero-container {
          max-width: 1200px;
        }

        .hero-title {
          font-size: 2.3rem;
        }

        .primary-image {
          width: 90%;
          height: 75%;
        }

        .secondary-image {
          width: 90%;
          height: 280px;
        }
      }

      @media (max-width: 1200px) {
        .hero-title {
          font-size: 2.2rem;
        }
        
        .primary-image {
          width: 85%;
          height: 70%;
        }
        
        .secondary-image {
          width: 85%;
          height: 260px;
        }
      }

      @media (max-width: 1024px) {
        .primary-image {
          width: 90%;
          height: 65%;
          left: -40px;
          border-radius: 5px 5px 5px 140px;
        }
        
        .secondary-image {
          width: 90%;
          height: 240px;
          border-radius: 5px 140px 5px 5px;
          margin-left: auto;
          margin-right: 0;
        }
      }

      @media (max-width: 992px) {
        .hero-container {
          flex-direction: column;
          padding: 0.5rem;
        }
        
        .left-section {
          flex: 1;
          padding: 0.5rem;
        }
        
        .right-section {
          flex: 1;
          height: 400px;
          margin-top: 1rem;
        }
        
        .text-content {
          padding: 0;
          margin-bottom: 1rem;
          text-align: center;
        }
        
        .primary-image {
          position: relative;
          width: 100%;
          max-width: 380px;
          height: 300px;
          left: 0;
          margin: 0 auto;
          border-radius: 10px;
        }
        
        .secondary-image {
          width: 100%;
          max-width: 380px;
          height: 250px;
          margin: 1rem auto;
          border-radius: 10px;
        }
        
        .button-group {
          justify-content: center;
        }
      }

      @media (max-width: 768px) {
        .hero-title {
          font-size: 2rem;
        }
        
        .hero-subtitle {
          font-size: 1rem;
          max-width: 100%;
          margin: 0 auto;
        }
        
        .btn-content {
          padding: 6px 16px; /* Further reduced padding */
          font-size: 12px; /* Further reduced font size */
        }
        
        .primary-image {
          height: 280px;
        }
        
        .secondary-image {
          height: 220px;
        }
        
        .button-group {
          gap: 0.6rem;
          justify-content: center;
        }

        .text-content {
          text-align: center;
        }
      }

      @media (max-width: 576px) {
        .hero-title {
          font-size: 1.6rem;
        }
        
        .hero-subtitle {
          font-size: 0.9rem;
        }
        
        .btn-content {
          padding: 5px 14px; /* Further reduced padding */
          font-size: 11px; /* Further reduced font size */
        }
        
        .primary-image {
          height: 250px;
        }
        
        .secondary-image {
          height: 200px;
        }
        
        .button-group {
          gap: 0.4rem;
        }
      }

      @media (max-width: 400px) {
        .hero-title {
          font-size: 1.4rem;
        }
        
        .hero-subtitle {
          font-size: 0.8rem;
        }
        
        .btn-content {
          padding: 4px 12px; /* Further reduced padding */
          font-size: 10px; /* Further reduced font size */
        }
        
        .primary-image {
          height: 200px;
        }
        
        .secondary-image {
          height: 180px;
        }
      }
    `}
        </style>

        <div className="hero-container">
          {/* Left Section (Text and Secondary Image) */}
          <div className="left-section d-flex flex-column">
            <div className="text-content">
              <h1 className="hero-title">
                YOUR ONE-STOP
                <span style={{ color: "#54a3c1" }}>
                  {" "}
                  BEAUTY <br /> DESTINATION
                </span>
              </h1>

              <p className="hero-subtitle">
                Discover expert services from salon to skincare in one elegant
                space.
              </p>

              <div className="button-group">
                <div className="btn-conteiner">
                  <a href="/salon" className="btn-content">
                    <span>SALON</span>
                  </a>
                </div>

                <div className="btn-conteiner">
                  <a href="/beauty" className="btn-content">
                    <span>BEAUTY</span>
                  </a>
                </div>

                <div className="btn-conteiner">
                  <a href="/skincare" className="btn-content">
                    <span>DOCTOR</span>
                  </a>
                </div>

                <div className="btn-conteiner">
                  <button onClick={handleEnquiryClick} className="btn-content">
                    <span>ENQUIRY</span>
                  </button>
                </div>
              </div>
            </div>

            <div className="image-container d-flex flex-row justify-content-end">
              <img
                src={Girlhair1}
                alt="Salon Interior"
                className="secondary-image img-fluid"
              />
            </div>
          </div>

          {/* Right Section (Primary Image Only) */}
          <div className="right-section">
            <img
              src={Girlhair}
              alt="Beauty Services"
              className="primary-image d-none d-lg-block img-fluid"
            />
          </div>
        </div>
      </div>
      <div className="container-fluid px-0">
        <div
          className="container-fluid"
          style={{
            backgroundColor: "#fad9e3", // Light pink background matching the image

            // minHeight: '100vh',
          }}
        >
          <div className="row align-items-center">
            <div className="col-12 text-center">
              <motion.h2
                className="section-title mb-3"
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.8 }}
                style={{
                  color: "#0e0f0f",
                  fontWeight: "600",
                  fontSize: "2rem",
                  textTransform: "uppercase",
                }}
              >
                PREMIUM SALON SERVICES
              </motion.h2>
              <motion.p
                className="mb-5"
                style={{
                  color: "#0e0f0f",
                  margin: "0 auto 40px",
                  fontSize: "1rem",
                  textTransform: "uppercase",
                }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                EXPERIENCE LUXURY HAIR CARE WITH OUR EXPERT STYLISTS USING TOP
                QUALITY PRODUCTS FOR YOUR PERFECT LOOK.
              </motion.p>

              <div className="row justify-content-center">
                {[
                  {
                    title: "Precision Haircuts",
                    description:
                      "Tailored cuts to suit your style and face shape, crafted by master stylists.",
                    image: card1, // Replace with actual image path
                  },
                  {
                    title: "Balayage & Highlights",
                    description:
                      "Vibrant, hand-painted color for a natural, glowing finish.",
                    image: card2, // Replace with actual image path
                  },
                  {
                    title: "Facial",
                    description:
                      "Rejuvenate your skin with customized facials for a radiant, glowing complexion.",
                    image: card3, // Replace with actual image path
                  },
                  {
                    title: "Precision Haircuts",
                    description:
                      "Tailored cuts to suit your style and face shape, crafted by our master stylists.",
                    image: card4, // Replace with actual image path
                  },
                ].map((service, i) => (
                  <div key={i} className="col-md-3 col-sm-12 mb-4">
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: false, amount: 0.3 }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                      style={{
                        backgroundColor: "#f0afc1", // Light pink card background
                        borderRadius: "15px",
                        textAlign: "center",
                        boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
                        overflow: "hidden", // Ensure image doesn't overflow the card
                        height: "350px", // Fixed height for the entire card
                        display: "flex", // Use flexbox to control internal layout
                        flexDirection: "column", // Stack image and content vertically
                      }}
                    >
                      <div
                        style={{
                          width: "100%",
                          height: "220px", // Fixed height for image section
                          position: "relative",
                        }}
                      >
                        <img
                          src={service.image}
                          alt={service.title}
                          style={{
                            width: "100%",
                            height: "100%", // Ensure the image takes the full height of the container
                            objectFit: "cover", // Cover the entire area, cropping if needed
                            borderRadius: "10px 10px 0 0", // Round only the top corners
                            position: "absolute",
                            top: 0,
                            left: 0,
                          }}
                        />
                      </div>
                      <div
                        style={{
                          padding: "15px",
                          flex: "1 1 auto", // Allow content to grow and fill remaining space
                          display: "flex", // Use flexbox to manage title and description
                          flexDirection: "column", // Stack title and description
                          justifyContent: "space-between", // Distribute space evenly
                          overflow: "hidden", // Prevent content from overflowing
                        }}
                      >
                        <h4
                          style={{
                            color: "#0e0f0f",
                            fontWeight: "600",
                            fontSize: "1.2rem",
                            marginBottom: "10px",
                            textTransform: "uppercase",
                          }}
                        >
                          {service.title}
                        </h4>
                        <p
                          style={{
                            color: "#0e0f0f",
                            fontSize: "0.9rem",
                            textTransform: "uppercase",
                            overflow: "hidden", // Hide excess text
                            textOverflow: "ellipsis", // Add ellipsis for truncated text
                            display: "-webkit-box",
                            WebkitLineClamp: 3, // Limit to 3 lines of text
                            WebkitBoxOrient: "vertical", // Required for line clamping
                            margin: 0, // Remove default margin for consistency
                          }}
                        >
                          {service.description}
                        </p>
                      </div>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <section
          id="beauty"
          style={{
            background: "#fad9e3",
            backgroundSize: "cover",
            backgroundPosition: "center",
            overflowX: "hidden",
            padding: "60px 0",
          }}
        >
          <div
            className="container-fluid py-4"
            style={{
              background: "#fad9e3",
              padding: "0px",
            }}
          >
            {/* Heading and Subheading */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                padding: "40px 0",
                textAlign: "center",
              }}
            >
              <motion.h2
                className="section-title mb-2"
                initial={{ opacity: 0, y: -20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.8 }}
                style={{
                  fontSize: "2.8rem",
                  fontWeight: "800",
                  color: "#000000", // Black color as in the image
                  letterSpacing: "-0.01em",
                  marginBottom: "8px",
                }}
              >
                Luxury Beauty Treatments
              </motion.h2>

              <motion.p
                className="lead mb-5"
                style={{
                  fontSize: "1.1rem",
                  color: "#000000", // Black color as in the image
                  maxWidth: "550px",
                  margin: "0 auto",
                  fontWeight: "400",
                  lineHeight: "1.4",
                  opacity: "0.9",
                }}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                Discover the best beauty treatments to indulge yourself.
              </motion.p>
            </div>

            {/* Cards Section */}
            <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 p-3 justify-content-center">
              {[
                {
                  name: "Bridal",
                  title: "Bridal Makeup",
                  text: "Flawless makeup for your big day.",
                  img: "https://queensinstyle.com/assets/images/logo-3.png",
                  delay: 0.1,
                },
                {
                  name: "HairCut",
                  title: "Haircut",
                  text: "Perfect nails with vibrant gel colors.",
                  img: "https://cdn.pixabay.com/photo/2012/04/13/18/16/haircut-33130_640.png",
                  delay: 0.2,
                },
                {
                  name: "Waxing",
                  title: "Waxing",
                  text: "Creative designs to showcase your style.",
                  img: "https://images.vexels.com/media/users/3/321110/isolated/preview/c221075ca31010635bca0be5654ae2f1-wax-jar-with-spatula.png",
                  delay: 0.3,
                },
                {
                  name: "Pedicure",
                  title: "Spa Pedicures",
                  text: "Relaxing treatments for soft, pampered feet.",
                  img: "https://png.pngtree.com/png-vector/20230924/ourmid/pngtree-pedicure-and-manicure-toe-png-image_9990440.png",
                  delay: 0.4,
                },
              ].map((card, idx) => (
                <motion.div
                  className="col"
                  key={idx}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: false, amount: 0.3 }}
                  onClick={() => handleBeautyClick(card.name)}
                  transition={{ delay: card.delay, duration: 0.8 }}
                  style={{ maxWidth: "250px" }} // Adjusted card width to match image
                >
                  <div
                    className="card shadow-sm rounded-3 border-0"
                    style={{
                      backgroundColor: "#ffffff",
                      padding: "20px",
                      textAlign: "center",
                    }}
                  >
                    <div className="text-center pt-3">
                      <img
                        src={card.img || "/placeholder.svg"}
                        alt={card.title}
                        className="mx-auto"
                        style={{
                          width: "80px",
                          height: "80px",
                          objectFit: "contain",
                          transition: "all 0.5s ease",
                        }}
                      />
                    </div>
                    <div className="card-body text-center">
                      <h5
                        className="card-title fw-bold"
                        style={{ fontSize: "1.1rem", color: "#1e90ff" }} // Blue color for titles as in the image
                      >
                        {card.title}
                      </h5>
                      <p
                        className="card-text"
                        style={{ fontSize: "0.9rem", color: "#000000" }} // Black text for descriptions
                      >
                        {card.text}
                      </p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section
          className=""
          id="skincare"
          style={{ background: "#fad9e3", padding: "60px 0" }}
        >
          <div className="container" style={{ backgroundColor: "#fad9e3" }}>
            <div className="row align-items-center py-5">
              <motion.div
                className="col-md-6 text-center mb-4 mb-md-0"
                initial={{ opacity: 0, x: -50 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.8 }}
              >
                <div
                  className="position-relative d-flex justify-content-center"
                  style={{ height: "400px", marginLeft: "20px" }}
                >
                  <motion.div
                    className="position-absolute img-wrapper"
                    style={{ top: "0", left: "0" }}
                    whileHover={{ scale: 1.05, zIndex: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src="https://plus.unsplash.com/premium_photo-1674739375749-7efe56fc8bbb?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8c2tpbiUyMGNhcmV8ZW58MHx8MHx8fDA%3D"
                      alt="Skincare Services 1"
                      className="img-fluid rounded shadow custom-img"
                      style={{
                        width: "300px",
                        height: "362px",
                        objectFit: "cover",
                        borderRadius: "15px",
                        border: "2px solid #201548",
                        boxShadow: "0 10px 20px rgba(32, 21, 72, 0.2)",
                      }}
                    />
                  </motion.div>
                  <motion.div
                    className="position-absolute img-wrapper"
                    style={{ top: "40px", left: "80px" }}
                    whileHover={{ scale: 1.05, zIndex: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src="https://healthwire.pk/wp-content/uploads/2022/06/skin-care-tips-for-summer.jpg"
                      alt="Skincare Services 2"
                      className="img-fluid rounded shadow custom-img"
                      style={{
                        width: "300px",
                        height: "362px",
                        objectFit: "cover",
                        borderRadius: "15px",
                        border: "2px solid #201548",
                        boxShadow: "0 10px 20px rgba(32, 21, 72, 0.2)",
                      }}
                    />
                  </motion.div>
                  <motion.div
                    className="position-absolute img-wrapper"
                    style={{ top: "80px", left: "160px" }}
                    whileHover={{ scale: 1.05, zIndex: 10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <img
                      src="https://images.pexels.com/photos/3757657/pexels-photo-3757657.jpeg?auto=compress&cs=tinysrgb&w=600"
                      alt="Skincare Services 3"
                      className="img-fluid rounded shadow custom-img"
                      style={{
                        width: "300px",
                        height: "362px",
                        objectFit: "cover",
                        borderRadius: "15px",
                        border: "2px solid #201548",
                        boxShadow: "0 10px 20px rgba(32, 21, 72, 0.2)",
                      }}
                    />
                  </motion.div>
                </div>
              </motion.div>

              <motion.div
                className="col-md-6 text-center text-md-start mt-3"
                initial={{ opacity: 0, x: 0 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: false, amount: 0.3 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <h2
                  className="section-title text-center text-md-start"
                  style={{ color: "#FB646B" }}
                >
                  Radiant Skincare
                </h2>
                <h3
                  className="fw-bold mb-4 text-center text-md-start"
                  style={{ color: "#0e0f0f" }}
                >
                  Transform your skin with Beauty Bliss
                </h3>
                <p
                  className="lead mb-4 text-center text-md-start"
                  style={{ color: "#0e0f0f" }}
                >
                  At Beauty Bliss, our expert skincare treatments rejuvenate and
                  nourish your skin, helping you achieve a flawless, glowing
                  complexion with personalized care.
                </p>
                <ul className="list-unstyled">
                  <motion.li
                    className="d-flex align-items-start mb-3 justify-content-center justify-content-md-start"
                    initial={{ opacity: 0, x: 0 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    style={{
                      color: "black",
                      padding: "12px 15px",
                      borderRadius: "8px",
                      border: "1px solid rgba(32, 21, 72, 0.1)",
                      transition: "all 0.3s ease",
                    }}
                    whileHover={{
                      boxShadow: "0 5px 15px rgba(32, 21, 72, 0.1)",
                      translateY: -3,
                    }}
                  >
                    <span
                      style={{
                        color: "#201548",
                        marginRight: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      ✔️
                    </span>
                    Customized facials tailored to your skin type
                  </motion.li>
                  <motion.li
                    className="d-flex align-items-start mb-3 justify-content-center justify-content-md-start"
                    initial={{ opacity: 0, x: 0 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    style={{
                      color: "black",
                      padding: "12px 15px",
                      borderRadius: "8px",
                      border: "1px solid rgba(32, 21, 72, 0.1)",
                      transition: "all 0.3s ease",
                    }}
                    whileHover={{
                      boxShadow: "0 5px 15px rgba(32, 21, 72, 0.1)",
                      translateY: -3,
                    }}
                  >
                    <span
                      style={{
                        color: "#201548",
                        marginRight: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      ✔️
                    </span>
                    Advanced treatments for lasting hydration
                  </motion.li>
                  <motion.li
                    className="d-flex align-items-start mb-3 justify-content-center justify-content-md-start"
                    initial={{ opacity: 0, x: 0 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: false, amount: 0.3 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    style={{
                      color: "black",
                      padding: "12px 15px",
                      borderRadius: "8px",
                      border: "1px solid rgba(32, 21, 72, 0.1)",
                      transition: "all 0.3s ease",
                    }}
                    whileHover={{
                      boxShadow: "0 5px 15px rgba(32, 21, 72, 0.1)",
                      translateY: -3,
                    }}
                  >
                    <span
                      style={{
                        color: "#201548",
                        marginRight: "10px",
                        fontWeight: "bold",
                      }}
                    >
                      ✔️
                    </span>
                    Natural products for a healthy, radiant glow
                  </motion.li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>
      </div>
      {enquiryModalOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1050,
          }}
        >
          <motion.div
            ref={modalRef}
            className="bg-white rounded-4 shadow-lg p-4 mx-3"
            style={{
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="m-0" style={{ color: "#201548" }}>
                Service Enquiry
              </h3>
              <button
                className="btn border-0"
                onClick={() => setEnquiryModalOpen(false)}
                style={{ color: "#201548" }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="mb-4">
              <label
                htmlFor="serviceProvider"
                className="form-label fw-semibold text-dark"
              >
                Select Service Provider
              </label>
              <select
                id="serviceProvider"
                className="form-select"
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
              >
                <option value="" disabled>
                  -- Select a service provider --
                </option>
                {serviceProviders.map((provider) => (
                  <option key={provider._id} value={provider.email}>
                    {provider.shopName} - {provider.designation} (Rating:{" "}
                    {provider.spRating})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label
                htmlFor="enquiryMessage"
                className="form-label fw-semibold text-dark"
              >
                Your Message
              </label>
              <textarea
                id="enquiryMessage"
                className="form-control"
                rows="5"
                placeholder="Please describe what services you're interested in..."
                value={enquiryMessage}
                onChange={(e) => setEnquiryMessage(e.target.value)}
              ></textarea>
            </div>

            <div className="d-flex gap-3 justify-content-end">
              <button
                className="btn btn-outline-secondary"
                onClick={() => setEnquiryModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="btn"
                style={{
                  backgroundColor: "#201548",
                  color: "white",
                  transition: "all 0.3s ease",
                }}
                onClick={handleSubmitEnquiry}
              >
                Submit Enquiry
              </button>
            </div>
          </motion.div>
        </div>
      )}
      {/* Inline styles for responsiveness */}
      <style>
        {`
          @media (max-width: 768px) {
            main {
              flex-direction: column;
              padding: 15px;
              margin: 5px;
              gap: 15px;
            }
            main > div:first-child {
              padding-right: 0;
            }
            h1 {
              font-size: 36px;
              margin-bottom: 10px;
            }
            p {
              font-size: 16px;
              margin-bottom: 15px;
            }
            button {
              padding: 8px 20px;
              font-size: 14px;
            }
            div[style*="gridTemplateRows"] {
              height: 300px;
            }
          }
          @media (max-width: 480px) {
            h1 {
              font-size: 28px;
            }
            p {
              font-size: 14px;
            }
            div[style*="gridTemplateRows"] {
              height: 250px;
            }
            div[style*="gridTemplateRows"] > div:nth-child(1) {
              grid-template-columns: 1fr;
              height: 50%;
            }
            div[style*="gridTemplateRows"] > div:nth-child(2) {
              grid-template-columns: 1fr;
              height: 50%;
            }
          }
          @media (max-width: 320px) {
            main {
              padding: 10px; /* Reduced padding to fit content */
              margin: 5px; /* Reduced margin */
              gap: 10px; /* Reduced gap between sections */
            }
            main > div:first-child, main > div:last-child {
              min-width: 0; /* Remove minWidth to allow full shrinking */
              width: 100%; /* Ensure it takes full width of container */
            }
            h1 {
              font-size: 24px; /* Further reduced font size */
              margin-bottom: 8px;
            }
            p {
              font-size: 12px; /* Further reduced font size */
              margin-bottom: 10px;
            }
            button {
              padding: 6px 15px; /* Reduced button size */
              font-size: 12px;
            }
            div[style*="gridTemplateRows"] {
              height: 200px; /* Further reduced height to prevent overflow */
            }
            div[style*="flex"] > div {
              gap: 5px; /* Reduced gap in icons section */
            }
            div[style*="flex"] > div > div {
              flex-direction: column; /* Stack icon and text vertically */
              align-items: flex-start;
              gap: 5px;
            }
            div[style*="flex"] > div > div > span {
              font-size: 12px; /* Reduced font size for icon text */
            }
          }
        `}
      </style>
      <LeadCaptureForm /> <Faq /> <Footer />
    </div>
  );
};

export default Home;

"use client";

import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameDay,
  addDays,
} from "date-fns";

const BASE_URL = process.env.REACT_APP_API_URL;

const BookSlot = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const parlor = location.state?.parlor || {};

  const [currentDate, setCurrentDate] = useState(new Date());
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 1024);

  // Update screen size state on resize
  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Sample generateDateOptions function (replace with your own if needed)
  const generateDateOptions = () => {
    const today = new Date();
    return Array.from({ length: 7 }, (_, i) => {
      const date = addDays(today, i);
      return {
        value: format(date, "yyyy-MM-dd"),
        label: format(date, "MMM d"),
      };
    });
  };

  // Get days for the current month
  const getMonthDays = () => {
    const start = startOfWeek(startOfMonth(currentDate), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(currentDate), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  };

  // Handle date selection
  const handleDateSelect = (date) => {
    setFormData((prev) => ({
      ...prev,
      date: format(date, "yyyy-MM-dd"),
      time: "",
    }));
  };

  // Navigate to previous/next month (for small screens)
  const goToPreviousMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const goToNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

  // Determine if a day is in the current month
  const isInCurrentMonth = (day) => {
    return day.getMonth() === currentDate.getMonth();
  };

  // Initialize form data
  const [formData, setFormData] = useState({
    name: "",
    date: "",
    time: "",
    service: parlor.service || "",
    amount: parlor.price || "",
    relatedServices: [],
    favoriteEmployee: "",
    duration: 0,
  });

  // State for service details from backend
  const [serviceDetails, setServiceDetails] = useState([]);
  const [serviceAll, setServiceAll] = useState([]);
  const [openModals, setOpenModals] = useState({});

  // State for terms agreement
  const [termsAgreed, setTermsAgreed] = useState(false);
  const [termsModalOpen, setTermsModalOpen] = useState(false);

  // State for terms and conditions from backend
  const [terms, setTerms] = useState([]);

  // State for form validation errors
  const [errors, setErrors] = useState({});

  // State for manPower (employees)
  const [manPower, setManPower] = useState([]);

  // State for booked time slots
  const [bookedSlots, setBookedSlots] = useState([]);

  // State for username
  const [username, setUsername] = useState("");

  // State for parlor timings
  const [availableTimeSlots, setAvailableTimeSlots] = useState([]);

  // State for window width to handle responsiveness
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  );

  // Refs for form fields
  const nameRef = useRef(null);
  const dateRef = useRef(null);
  const timeRef = useRef(null);
  const serviceRef = useRef(null);
  const amountRef = useRef(null);
  const favoriteEmployeeRef = useRef(null);
  const termsRef = useRef(null);

  // Handle window resize for responsiveness
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Handle Escape key for modals
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") {
        setTermsModalOpen(false);
        setOpenModals({});
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Fetch service details
  useEffect(() => {
    const serviceId = parlor.serviceId;
    const fetchServiceDetails = async () => {
      try {
        const response = await axios.get(
          `${BASE_URL}/api/users/shop/by-service/${serviceId}`
        );
        setServiceAll(response.data.services);
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          api: "Failed to fetch service details. Please try again.",
        }));
      }
    };

    if (serviceId) {
      fetchServiceDetails();
    }
  }, [parlor.serviceId]);

  // Fetch parlor services
  useEffect(() => {
    const fetchServiceDetails = async () => {
      if (!parlor.email) return;
      try {
        const response = await axios.get(
          `${BASE_URL}/api/admin/get-services/${parlor.email}`
        );
        setServiceDetails(response.data);
      } catch (error) {
        setErrors((prev) => ({
          ...prev,
          api: "Failed to fetch service details. Please try again.",
        }));
        setServiceDetails([]);
      }
    };

    fetchServiceDetails();
  }, [parlor.email]);

  // Fetch username
  const fetchUsername = async () => {
    const userEmail = localStorage.getItem("email");
    if (!userEmail) {
      setErrors((prev) => ({
        ...prev,
        api: "User email not found. Please log in.",
      }));
      return;
    }
    try {
      const response = await axios.get(
        `${BASE_URL}/api/users/bookings/${userEmail}`
      );
      setUsername(response.data.username);
      setFormData((prev) => ({ ...prev, name: response.data.username }));
    } catch (error) {
      setUsername("");
      setFormData((prev) => ({ ...prev, name: "" }));
      setErrors((prev) => ({
        ...prev,
        api: "Failed to fetch username. Please try again.",
      }));
    }
  };

  // Fetch parlor timings
  const fetchParlorTimings = async () => {
    if (!parlor.email) return;
    try {
      const response = await axios.get(
        `${BASE_URL}/api/admin/parlor/${parlor.email}`
      );
      const parlorData = response.data;
      if (
        parlorData.availableTime &&
        parlorData.availableTime.fromTime &&
        parlorData.availableTime.toTime
      ) {
        const { fromTime, toTime } = parlorData.availableTime;
        const slots = generateTimeSlots(fromTime, toTime, 60);
        setAvailableTimeSlots(slots);
      } else {
        setErrors((prev) => ({
          ...prev,
          api: "Parlor timings not available.",
        }));
        setAvailableTimeSlots([]);
      }
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        api: "Failed to fetch parlor timings. Please try again.",
      }));
      setAvailableTimeSlots([]);
    }
  };

  // Fetch manPower
  const fetchManPower = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/api/admin/get-manpower/${parlor.email}`
      );
      setManPower(response.data);
    } catch (error) {
      setManPower([]);
    }
  };

  // Fetch booked time slots
  const fetchBookedSlots = async (employeeName, date) => {
    const userEmail = localStorage.getItem("email");
    try {
      const response = await axios.get(
        `${BASE_URL}/api/users/bookings/${userEmail}`
      );
      const filteredBookings = response.data.bookings
        .filter(
          (booking) =>
            booking.favoriteEmployee === employeeName &&
            booking.date &&
            typeof booking.date === "string" &&
            booking.date.split("T")[0] === date
        )
        .map((booking) => ({
          time: booking.time,
          duration: booking.duration || 60,
        }));
      setBookedSlots(filteredBookings);
    } catch (error) {
      setBookedSlots([]);
    }
  };

  // Fetch terms and conditions
  const fetchTerms = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/terms/terms`);
      const uniqueTerms = Array.from(
        new Set(response.data.map((item) => item.term))
      ).map((term) => response.data.find((item) => item.term === term));
      setTerms(uniqueTerms);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        api: "Failed to fetch terms and conditions. Please try again.",
      }));
      setTerms([]);
    }
  };

  // Generate time slots in "HH:MM - HH:MM" format
  const generateTimeSlots = (startTime, endTime, interval = 60) => {
    const slots = [];
    const start = parseTime(startTime);
    const end = parseTime(endTime);

    for (let time = start; time + interval <= end; time += interval) {
      const slotStart = formatTime(time);
      const slotEnd = formatTime(time + interval);
      slots.push(`${slotStart} - ${slotEnd}`);
    }
    return slots;
  };

  const parseTime = (timeStr) => {
    const [hours, minutes] = timeStr.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins
      .toString()
      .padStart(2, "0")}`;
  };

  // Calculate total duration
  const calculateTotalDuration = () => {
    if (!serviceDetails.length) return 0;

    const primaryService = serviceDetails.find(
      (svc) =>
        svc.serviceName === formData.service &&
        (!parlor.style || svc.style === parlor.style)
    );
    let totalDuration = primaryService?.duration || 0;

    formData.relatedServices.forEach((relatedService) => {
      const relatedServiceDetail = serviceDetails.find(
        (svc) =>
          svc.serviceName === relatedService || svc.style === relatedService
      );
      if (relatedServiceDetail) {
        totalDuration += relatedServiceDetail.duration || 0;
      }
    });

    return totalDuration;
  };

  // Update duration
  useEffect(() => {
    const totalDuration = calculateTotalDuration();
    setFormData((prev) => ({
      ...prev,
      duration: totalDuration,
    }));
  }, [serviceDetails, formData.service, formData.relatedServices]);

  // Fetch data on component mount
  useEffect(() => {
    fetchUsername();
    fetchParlorTimings();
    fetchTerms();
    fetchManPower();
  }, [parlor.email]);

  // Fetch booked slots
  useEffect(() => {
    if (formData.favoriteEmployee && formData.date) {
      fetchBookedSlots(formData.favoriteEmployee, formData.date);
    } else {
      setBookedSlots([]);
    }
  }, [formData.favoriteEmployee, formData.date]);

  // Calculate total amount
  const calculateTotalAmount = () => {
    const baseAmount = Number.parseFloat(formData.amount) || 0;
    let totalAmount = baseAmount;

    formData.relatedServices.forEach((relatedService) => {
      const relatedServiceDetail = serviceDetails.find(
        (svc) =>
          svc.serviceName === relatedService || svc.style === relatedService
      );
      if (relatedServiceDetail) {
        totalAmount += Number.parseFloat(relatedServiceDetail.price) || 0;
      }
    });

    return totalAmount;
  };

  // Time slot utilities
  const timeToMinutes = (time) => {
    const [start] = time.split(" - ");
    const [hours, minutes] = start.split(":").map(Number);
    return hours * 60 + minutes;
  };

  const isSlotAvailable = (slot, duration) => {
    const slotStart = timeToMinutes(slot);
    const slotEnd = slotStart + duration;

    for (const booked of bookedSlots) {
      const bookedStart = timeToMinutes(booked.time);
      const bookedEnd = bookedStart + booked.duration;

      if (!(slotEnd <= bookedStart || slotStart >= bookedEnd)) {
        return false;
      }
    }
    return true;
  };

  const isSlotAvailableWithDuration = (selectedTime, duration) => {
    if (!selectedTime) return true;
    const slotStart = timeToMinutes(selectedTime);
    const slotEnd = slotStart + duration;

    for (const booked of bookedSlots) {
      const bookedStart = timeToMinutes(booked.time);
      const bookedEnd = bookedStart + booked.duration;

      if (!(slotEnd <= bookedStart || slotStart >= bookedEnd)) {
        return false;
      }
    }
    return true;
  };

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: "" }));

    if (name === "favoriteEmployee" || name === "date") {
      setFormData((prev) => ({ ...prev, time: "" }));
    }
  };

  const handleTermsChange = (e) => {
    setTermsAgreed(e.target.checked);
    setErrors((prev) => ({ ...prev, terms: "" }));
  };

  const handleTermsModalToggle = () => {
    setTermsModalOpen(!termsModalOpen);
  };

  // Handle related service changes
  const handleRelatedServiceChange = (e) => {
    const { value, checked } = e.target;

    if (checked) {
      const newRelatedServices = [...formData.relatedServices, value];
      const totalDuration = calculateTotalDurationForServices([
        ...newRelatedServices,
        formData.service,
      ]);

      if (!isSlotAvailableWithDuration(formData.time, totalDuration)) {
        setErrors((prev) => ({
          ...prev,
          relatedServices:
            "Cannot add this service: Selected time is busy. Please select another slot.",
        }));
        return;
      }

      setErrors((prev) => ({ ...prev, relatedServices: "" }));
      setFormData((prev) => ({
        ...prev,
        relatedServices: newRelatedServices,
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        relatedServices: prev.relatedServices.filter(
          (service) => service !== value
        ),
      }));
      setErrors((prev) => ({ ...prev, relatedServices: "" }));
    }
  };

  const calculateTotalDurationForServices = (services) => {
    let totalDuration = 0;
    services.forEach((service) => {
      const serviceDetail = serviceDetails.find(
        (svc) =>
          svc.serviceName === service ||
          svc.style === service ||
          (svc.serviceName === formData.service &&
            (!parlor.style || svc.style === parlor.style))
      );
      if (serviceDetail) {
        totalDuration += serviceDetail.duration || 0;
      }
    });
    return totalDuration;
  };

  const handleRemoveService = (serviceToRemove) => {
    setFormData((prev) => ({
      ...prev,
      relatedServices: prev.relatedServices.filter(
        (service) => service !== serviceToRemove
      ),
    }));
    setErrors((prev) => ({ ...prev, relatedServices: "" }));
  };

  const handleToggleModal = (category) => {
    setOpenModals((prev) => ({
      ...prev,
      [category]: !prev[category],
    }));
    setErrors((prev) => ({ ...prev, relatedServices: "" }));
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.date) newErrors.date = "Date is required";
    if (!formData.time) newErrors.time = "Time slot is required";
    if (!formData.service) newErrors.service = "Service is required";
    if (!formData.amount || isNaN(formData.amount) || formData.amount <= 0)
      newErrors.amount = "Valid amount is required";
    if (!formData.favoriteEmployee && manPower.length > 0)
      newErrors.favoriteEmployee = "Please select an employee";
    if (formData.time && !isSlotAvailable(formData.time, formData.duration))
      newErrors.time =
        "Selected time slot is not available for the required duration";
    if (!termsAgreed)
      newErrors.terms = "You must agree to the terms and conditions";
    if (formData.duration === 0)
      newErrors.duration = "Service duration not available";

    if (Object.keys(newErrors).length > 0) {
      const firstErrorField = Object.keys(newErrors)[0];
      const fieldRefs = {
        name: nameRef,
        date: dateRef,
        time: timeRef,
        service: serviceRef,
        amount: amountRef,
        favoriteEmployee: favoriteEmployeeRef,
        terms: termsRef,
      };
      const targetRef = fieldRefs[firstErrorField];
      if (targetRef.current) {
        targetRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
        const inputElement = targetRef.current.querySelector("input, select");
        if (inputElement) inputElement.focus();
      }
    }

    return newErrors;
  };

  // Handle booking
  const handleBookSlot = async () => {
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      navigate("/pay", {
        state: {
          ...formData,
          parlor,
          totalAmount: calculateTotalAmount(),
          duration: formData.duration,
        },
      });
    } catch (error) {
      setErrors({
        ...errors,
        api: "Failed to proceed to payment. Please try again.",
      });
    }
  };

  // Parse location for Google Maps
  const parseLocation = (location) => {
    if (!location || typeof location !== "string") return null;
    const match = location.match(/Lat:\s*([\d.-]+),\s*Lon:\s*([\d.-]+)/i);
    if (!match) return null;
    const lat = Number.parseFloat(match[1]);
    const lon = Number.parseFloat(match[2]);
    if (isNaN(lat) || isNaN(lon)) return null;
    return { lat, lon };
  };

  const getGoogleMapsUrl = (location) => {
    const coords = parseLocation(location);
    if (!coords) return "#";
    return `https://www.google.com/maps?q=${coords.lat},${coords.lon}`;
  };

  // Group services by serviceName
  const groupedServices = serviceAll.reduce((acc, service) => {
    const category = service.serviceName || "Unnamed Service";
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(service);
    return acc;
  }, {});

  // Generate date options for the next 7 days


  // Render service checkboxes
  const renderServiceCheckboxes = () => {
    const categories = Object.keys(groupedServices);

    if (categories.length === 0) {
      return (
        <div
          style={{
            color: "#666",
            fontStyle: "italic",
            marginTop: "16px",
            fontSize: "14px",
          }}
        >
          No Additional Services Available
        </div>
      );
    }

    return (
      <div style={{ marginTop: "16px" }}>
        {categories.map((category) => (
          <div key={category} style={{ marginBottom: "8px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
                padding: "8px",
                borderRadius: "4px",
                transition: "background 0.2s",
                background: openModals[category]
                  ? "rgba(0,0,0,0.04)"
                  : "transparent",
              }}
              onClick={() => handleToggleModal(category)}
            >
              <span
                style={{
                  flexGrow: 1,
                  fontWeight: 500,
                  fontSize: "16px",
                }}
              >
                {category}
              </span>
              <span style={{ fontSize: "20px" }}>
                {openModals[category] ? "−" : "+"}
              </span>
            </div>

            {openModals[category] && (
              <div
                style={{
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: "rgba(0,0,0,0.5)",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  zIndex: 1000,
                }}
                onClick={() => handleToggleModal(category)}
              >
                <div
                  style={{
                    background: "#fff",
                    borderRadius: "8px",
                    padding: "16px",
                    width: "90%",
                    maxWidth: "400px",
                    maxHeight: "80vh",
                    overflowY: "auto",
                  }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 style={{ fontSize: "20px", marginBottom: "16px" }}>
                    {category}
                  </h3>
                  <div>
                    {groupedServices[category].map((service, index) => (
                      <label
                        key={index}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={formData.relatedServices.includes(
                            service.style || service.serviceName
                          )}
                          onChange={handleRelatedServiceChange}
                          value={service.style || service.serviceName}
                          style={{ marginRight: "8px", accentColor: "#E91E63" }}
                        />
                        <div>
                          <div style={{ fontSize: "14px" }}>
                            {service.style || service.serviceName}
                          </div>
                          <div style={{ fontSize: "12px", color: "#666" }}>
                            ₹{service.price} • {service.duration} min
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  <button
                    style={{
                      width: "100%",
                      padding: "10px",
                      background: "linear-gradient(135deg, #E91E63, #F06292)",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      marginTop: "16px",
                      fontSize: "14px",
                    }}
                    onClick={() => handleToggleModal(category)}
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // Handle image load error
  const handleImageError = (e) => {
    e.target.src = "/placeholder-image.jpg"; // Fallback image
  };

  // Dynamic styles based on window width
  const isMediumScreen = windowWidth >= 768;
  const isLargeScreen = windowWidth >= 1024;
  const isSmallScreen = windowWidth < 640;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fad9e3",
        padding: isSmallScreen ? "12px" : "16px",
        fontFamily: "Arial, sans-serif",
        boxSizing: "border-box",
        paddingTop: isSmallScreen ? "20px" : "60px",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "flex",
          flexDirection: "column",
          gap: isMediumScreen ? "24px" : "16px",
        }}
      >
        {Object.keys(parlor).length === 0 ? (
          <div
            style={{
              background: "#fff3cd",
              padding: "12px",
              borderRadius: "8px",
              color: "#856404",
              width: "100%",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            No parlor data available. Please select a parlor.
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              flexDirection: isMediumScreen ? "row" : "column",
              gap: isMediumScreen ? "24px" : "16px",
            }}
          >
            {/* Left Section - Service Details */}
            <div
              style={{
                borderRadius: "8px",
                overflow: "hidden",
                background: "rgba(255,255,255,0.95)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                width: "100%",
                flex: isMediumScreen ? "1" : "none",
                minWidth: 0,
              }}
            >
              {/* Hero Image */}
              <div
                style={{
                  height: isLargeScreen
                    ? "260px"
                    : isSmallScreen
                    ? "180px"
                    : "220px",
                  width: "100%",
                }}
              >
                <img
                  src={`${BASE_URL}/${parlor.image}`}
                  alt={parlor.name || "Parlor Image"}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  onError={handleImageError}
                />
              </div>

              <div style={{ padding: isSmallScreen ? "12px" : "16px" }}>
                {/* Service Title */}
                <div
                  style={{
                    position: "relative",
                    marginBottom: "12px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <h2
                    style={{
                      fontSize: isLargeScreen
                        ? "28px"
                        : isSmallScreen
                        ? "20px"
                        : "24px",
                      fontWeight: "bold",
                      background: "linear-gradient(135deg, #E91E63, #9C27B0)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    {formData.service || parlor.name || "Service"}
                  </h2>

                  <div
                    style={{
                      position: "absolute",
                      top: "4px",
                      right: "4px",
                      background: "rgba(233, 30, 99, 0.9)",
                      color: "#fff",
                      padding: "3px 6px",
                      borderRadius: "4px",
                      display: "flex",
                      alignItems: "center",
                      gap: "3px",
                    }}
                  >
                    <span style={{ fontSize: "12px" }}>★</span>
                    <span style={{ fontSize: "12px", fontWeight: "bold" }}>
                      {parlor.spRating}
                    </span>
                  </div>
                </div>

                {/* Salon Info */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "6px",
                    marginBottom: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  {parlor.designation && (
                    <span
                      style={{
                        background: "linear-gradient(135deg, #E91E63, #F06292)",
                        color: "#fff",
                        padding: "3px 6px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "bold",
                      }}
                    >
                      {parlor.designation}
                    </span>
                  )}
                  {formData.duration > 0 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                      }}
                    >
                      <span style={{ fontSize: "12px", color: "#666" }}>
                        ⏰
                      </span>
                      <span style={{ fontSize: "12px", color: "#666" }}>
                        {formData.duration} min
                      </span>
                    </div>
                  )}
                </div>

                {/* Style */}
                {parlor.style && (
                  <p
                    style={{
                      marginBottom: "12px",
                      color: "#666",
                      fontSize: "14px",
                    }}
                  >
                    {parlor.style}
                  </p>
                )}

                {/* Location */}
                {parlor.name && (
                  <>
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                        marginBottom: "6px",
                      }}
                    >
                      Location
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                        marginBottom: "12px",
                      }}
                    >
                      <span style={{ fontSize: "16px", color: "#E91E63" }}>
                        📍
                      </span>
                      <span style={{ fontSize: "14px" }}>{parlor.name}</span>
                    </div>
                  </>
                )}

                {/* Additional Services */}
                {Object.keys(groupedServices).length > 0 && (
                  <>
                    <hr style={{ margin: "12px 0", borderColor: "#e0e0e0" }} />
                    <h3
                      style={{
                        fontSize: "18px",
                        fontWeight: "bold",
                        marginBottom: "6px",
                      }}
                    >
                      Additional Services
                    </h3>
                    <p
                      style={{
                        fontSize: "14px",
                        color: "#666",
                        marginBottom: "12px",
                      }}
                    >
                      (Additional charges may apply)
                    </p>
                    {renderServiceCheckboxes()}
                  </>
                )}

                {/* Selected Services */}
                {formData.relatedServices.length > 0 && (
                  <div
                    style={{
                      marginTop: "12px",
                      display: "flex",
                      flexWrap: "wrap",
                      gap: "6px",
                    }}
                  >
                    {formData.relatedServices.map((service) => (
                      <div
                        key={service}
                        style={{
                          background:
                            "linear-gradient(135deg, #E91E63, #F06292)",
                          color: "#fff",
                          padding: "3px 6px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          display: "flex",
                          alignItems: "center",
                          gap: "3px",
                        }}
                      >
                        {service}
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            color: "#fff",
                            cursor: "pointer",
                            fontSize: "12px",
                          }}
                          onClick={() => handleRemoveService(service)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Section - Booking Panel */}
            <div
              style={{
                borderRadius: "8px",
                background: "rgba(255,255,255,0.95)",
                boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
                padding: isSmallScreen ? "12px" : "16px",
                width: "100%",
                flex: isMediumScreen ? "2" : "none",
                minWidth: 0,
                position: isMediumScreen ? "sticky" : "static",
                top: isMediumScreen ? "16px" : "auto",
                alignSelf: isMediumScreen ? "flex-start" : "auto",
              }}
            >
              {/* Map Placeholder */}
              {parlor.location && (
                <div
                  style={{
                    borderRadius: "8px",
                    marginBottom: "12px",
                    height: isLargeScreen
                      ? "160px"
                      : isSmallScreen
                      ? "120px"
                      : "140px",
                    background: "linear-gradient(135deg, #E3F2FD, #BBDEFB)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    window.open(getGoogleMapsUrl(parlor.location), "_blank")
                  }
                >
                  <div style={{ textAlign: "center" }}>
                    <span style={{ fontSize: "32px", color: "#1976D2" }}>
                      🗺️
                    </span>
                    <p style={{ fontSize: "12px", color: "#666" }}>
                      Click to view location
                    </p>
                  </div>
                </div>
              )}
              {/* Booking Card */}
              <div>
                <h2
                  style={{
                    fontSize: isSmallScreen ? "20px" : "24px",
                    fontWeight: "bold",
                    marginBottom: "8px",
                  }}
                >
                  Book This Service
                </h2>

                {/* Price */}
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    marginBottom: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <span
                    style={{
                      fontSize: isLargeScreen
                        ? "28px"
                        : isSmallScreen
                        ? "20px"
                        : "24px",
                      fontWeight: "bold",
                      background: "linear-gradient(135deg, #E91E63, #9C27B0)",
                      WebkitBackgroundClip: "text",
                      WebkitTextFillColor: "transparent",
                    }}
                  >
                    ₹{calculateTotalAmount()}
                  </span>
                  {formData.duration > 0 && (
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "3px",
                      }}
                    >
                      <span style={{ fontSize: "12px", color: "#666" }}>
                        ⏰
                      </span>
                      <span style={{ fontSize: "12px", color: "#666" }}>
                        {formData.duration} min
                      </span>
                    </div>
                  )}
                </div>

                {/* Employee Selection */}
                {manPower.length > 0 && (
                  <>
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        marginBottom: "6px",
                      }}
                      ref={favoriteEmployeeRef}
                    >
                      Select Employee
                    </h3>
                    <select
                      value={formData.favoriteEmployee}
                      onChange={handleInputChange}
                      name="favoriteEmployee"
                      style={{
                        width: "100%",
                        padding: "8px",
                        borderRadius: "4px",
                        border: "1px solid #E91E63",
                        fontSize: "14px",
                        marginBottom: "12px",
                      }}
                    >
                      <option value="" disabled>
                        Choose your preferred stylist
                      </option>
                      {manPower.map((employee) => (
                        <option key={employee._id} value={employee.name}>
                          {employee.name} ({employee.experience} years exp)
                        </option>
                      ))}
                    </select>
                    {errors.favoriteEmployee && (
                      <p
                        style={{
                          color: "red",
                          fontSize: "12px",
                          marginBottom: "6px",
                        }}
                      >
                        {errors.favoriteEmployee}
                      </p>
                    )}
                  </>
                )}

                {/* Date Selection */}
                <div>
                  <h3
                    style={{
                      fontSize: "16px",
                      fontWeight: "bold",
                      marginBottom: "6px",
                    }}
                    ref={dateRef}
                  >
                    Select Date
                  </h3>
                  {isDesktop ? (
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "6px",
                        marginBottom: "12px",
                      }}
                    >
                      {generateDateOptions().map((dateOption) => (
                        <button
                          key={dateOption.value}
                          style={{
                            padding: "8px",
                            borderRadius: "4px",
                            border:
                              formData.date === dateOption.value
                                ? "none"
                                : "1px solid #E91E63",
                            background:
                              formData.date === dateOption.value
                                ? "linear-gradient(135deg, #E91E63, #F06292)"
                                : "transparent",
                            color:
                              formData.date === dateOption.value
                                ? "#fff"
                                : "#E91E63",
                            cursor: "pointer",
                            fontSize: "12px",
                            fontWeight: "bold",
                            textAlign: "center",
                            flex: "1 1 80px",
                            maxWidth: "100px",
                          }}
                          onClick={() =>
                            setFormData((prev) => ({
                              ...prev,
                              date: dateOption.value,
                              time: "",
                            }))
                          }
                        >
                          {dateOption.label}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        marginBottom: "12px",
                        background: "#fff",
                        padding: "12px",
                        borderRadius: "8px",
                        boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                        maxWidth: "300px",
                        width: "100%",
                      }}
                    >
                      {/* Navigation for Month View */}
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: "8px",
                        }}
                      >
                        <button
                          onClick={goToPreviousMonth}
                          style={{
                            padding: "6px 10px",
                            border: "1px solid #E91E63",
                            borderRadius: "4px",
                            background: "transparent",
                            color: "#E91E63",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "12px",
                          }}
                        >
                          Prev
                        </button>
                        <span style={{ fontSize: "14px", fontWeight: "bold" }}>
                          {format(currentDate, "MMMM yyyy")}
                        </span>
                        <button
                          onClick={goToNextMonth}
                          style={{
                            padding: "6px 10px",
                            border: "1px solid #E91E63",
                            borderRadius: "4px",
                            background: "transparent",
                            color: "#E91E63",
                            cursor: "pointer",
                            fontWeight: "bold",
                            fontSize: "12px",
                          }}
                        >
                          Next
                        </button>
                      </div>
                      {/* Weekday Headers */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(7, 1fr)",
                          gap: "2px",
                          textAlign: "center",
                          fontSize: "10px",
                          fontWeight: "bold",
                          color: "#333",
                        }}
                      >
                        {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(
                          (day) => (
                            <div key={day}>{day}</div>
                          )
                        )}
                      </div>
                      {/* Calendar Days */}
                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "repeat(7, 1fr)",
                          gap: "2px",
                        }}
                      >
                        {getMonthDays().map((day) => (
                          <button
                            key={day.toString()}
                            onClick={() => handleDateSelect(day)}
                            disabled={!isInCurrentMonth(day)}
                            style={{
                              padding: "6px",
                              borderRadius: "4px",
                              border: isSameDay(new Date(formData.date), day)
                                ? "none"
                                : "1px solid #E91E63",
                              background: isSameDay(
                                new Date(formData.date),
                                day
                              )
                                ? "linear-gradient(135deg, #E91E63, #F06292)"
                                : isInCurrentMonth(day)
                                ? "transparent"
                                : "#f0f0f0",
                              color: isSameDay(new Date(formData.date), day)
                                ? "#fff"
                                : isInCurrentMonth(day)
                                ? "#E91E63"
                                : "#aaa",
                              cursor: isInCurrentMonth(day)
                                ? "pointer"
                                : "not-allowed",
                              fontSize: "10px",
                              fontWeight: "bold",
                              textAlign: "center",
                              aspectRatio: "1 / 1",
                            }}
                          >
                            {format(day, "d")}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {errors.date && (
                    <p
                      style={{
                        color: "red",
                        fontSize: "12px",
                        marginBottom: "6px",
                      }}
                    >
                      {errors.date}
                    </p>
                  )}
                </div>

                {/* Time Selection */}
                {availableTimeSlots.length > 0 && (
                  <>
                    <h3
                      style={{
                        fontSize: "16px",
                        fontWeight: "bold",
                        marginBottom: "6px",
                      }}
                      ref={timeRef}
                    >
                      Select Time
                    </h3>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: "6px",
                        marginBottom: "12px",
                      }}
                    >
                      {availableTimeSlots.map((slot) => {
                        const isAvailable = isSlotAvailable(
                          slot,
                          formData.duration
                        );
                        const isSelected = formData.time === slot;

                        return (
                          <button
                            key={slot}
                            disabled={
                              !isAvailable ||
                              !formData.date ||
                              (!formData.favoriteEmployee &&
                                manPower.length > 0)
                            }
                            style={{
                              padding: "8px",
                              borderRadius: "4px",
                              border: isAvailable
                                ? "1px solid #E91E63"
                                : "1px solid #ccc",
                              background: isSelected
                                ? "linear-gradient(135deg, #E91E63, #F06292)"
                                : isAvailable
                                ? "transparent"
                                : "#f5f5f5",
                              color: isSelected
                                ? "#fff"
                                : isAvailable
                                ? "#E91E63"
                                : "#ccc",
                              cursor: isAvailable ? "pointer" : "not-allowed",
                              fontSize: "12px",
                              fontWeight: "bold",
                              textAlign: "center",
                              flex: "1 1 80px",
                              maxWidth: "100px",
                            }}
                            onClick={() =>
                              setFormData((prev) => ({
                                ...prev,
                                time: slot,
                              }))
                            }
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                    {errors.time && (
                      <p
                        style={{
                          color: "red",
                          fontSize: "12px",
                          marginBottom: "6px",
                        }}
                      >
                        {errors.time}
                      </p>
                    )}
                  </>
                )}

                {/* Terms and Conditions */}
                {terms.length > 0 && (
                  <div style={{ marginTop: "12px" }} ref={termsRef}>
                    <label
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "6px",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={termsAgreed}
                        onChange={handleTermsChange}
                        style={{ accentColor: "#E91E63" }}
                      />
                      <span style={{ fontSize: "14px" }}>
                        I agree to the{" "}
                        <button
                          style={{
                            background: "none",
                            border: "none",
                            color: "#E91E63",
                            textDecoration: "underline",
                            cursor: "pointer",
                            fontSize: "14px",
                          }}
                          onClick={handleTermsModalToggle}
                        >
                          Terms & Conditions
                        </button>
                      </span>
                    </label>
                    {errors.terms && (
                      <p
                        style={{
                          color: "red",
                          fontSize: "12px",
                          marginTop: "4px",
                        }}
                      >
                        {errors.terms}
                      </p>
                    )}
                  </div>
                )}

                {/* Book Now Button */}
                <button
                  style={{
                    width: "100%",
                    padding: "10px",
                    borderRadius: "4px",
                    border: "none",
                    background:
                      Object.keys(parlor).length === 0 ||
                      formData.duration === 0
                        ? "#ccc"
                        : "linear-gradient(135deg, #E91E63, #F06292)",
                    color: "#fff",
                    fontSize: "14px",
                    fontWeight: "bold",
                    cursor:
                      Object.keys(parlor).length === 0 ||
                      formData.duration === 0
                        ? "not-allowed"
                        : "pointer",
                    marginTop: "12px",
                    transition: "all 0.3s",
                  }}
                  disabled={
                    Object.keys(parlor).length === 0 || formData.duration === 0
                  }
                  onClick={handleBookSlot}
                >
                  Book Now
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Error Messages */}
        {errors.api && (
          <div
            style={{
              background: "#f8d7da",
              color: "#721c24",
              padding: "12px",
              borderRadius: "8px",
              marginTop: "16px",
              width: "100%",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {errors.api}
          </div>
        )}

        {errors.relatedServices && (
          <div
            style={{
              background: "#f8d7da",
              color: "#721c24",
              padding: "12px",
              borderRadius: "8px",
              marginTop: "16px",
              width: "100%",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {errors.relatedServices}
          </div>
        )}

        {/* Terms Modal */}
        {termsModalOpen && (
          <div
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
            onClick={handleTermsModalToggle}
          >
            <div
              style={{
                background: "#fff",
                borderRadius: "8px",
                padding: "16px",
                width: "90%",
                maxWidth: "500px",
                maxHeight: "80vh",
                overflowY: "auto",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h2
                style={{
                  fontSize: "20px",
                  fontWeight: "bold",
                  marginBottom: "12px",
                }}
              >
                Terms & Conditions
              </h2>
              {terms.length > 0 ? (
                terms.map((term, index) => (
                  <p
                    key={index}
                    style={{ fontSize: "14px", marginBottom: "6px" }}
                  >
                    {index + 1}. {term.term}
                  </p>
                ))
              ) : (
                <p style={{ fontSize: "14px", color: "#666" }}>
                  No terms and conditions available.
                </p>
              )}
              <button
                style={{
                  width: "100%",
                  padding: "10px",
                  background: "linear-gradient(135deg, #E91E63, #F06292)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  marginTop: "12px",
                  fontSize: "14px",
                }}
                onClick={handleTermsModalToggle}
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BookSlot;

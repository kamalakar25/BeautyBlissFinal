import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import axios from "axios";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import Edit from "@mui/icons-material/Edit";
import Delete from "@mui/icons-material/Delete";
import { styled, useTheme } from "@mui/material/styles";
import "./serviceProvide.css";

const BASE_URL = process.env.REACT_APP_API_URL;

const StyledAccordion = styled(Accordion)(({ theme }) => ({
  backgroundColor: "rgba(255, 255, 255, 0.95)",
  borderRadius: "10px",
  border: "1px solid #e2e8f0",
  marginBottom: "16px",
  boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
  transition: "all 0.3s ease",
  "&:hover": {
    transform: "translateY(-2px)",
    boxShadow: "0 6px 15px rgba(0, 0, 0, 0.15)",
  },
  "&:before": {
    display: "none",
  },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  background: "#fb646b",
  color: "#ffffff",
  borderRadius: "8px",
  padding: "10px 16px",
  "& .MuiAccordionSummary-content": {
    alignItems: "flex-start",
    justifyContent: "space-between",
  },
  "&:hover": {
    backgroundColor: "#e65a60",
    boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
  },
  "& .MuiAccordionSummary-expandIconWrapper": {
    color: "#ffffff",
  },
}));

const SuccessMessage = ({ message, onClose, screenWidth }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const isAddService = message.toLowerCase().includes("added");

  return createPortal(
    <>
      <div className="success-backdrop" />
      <div
        className={`success-modal ${
          isAddService ? "add-animation" : "update-animation"
        }`}
        style={{
          width: screenWidth <= 768 ? "85%" : "20rem",
          maxWidth: "22rem",
        }}
      >
        <div className="success-content">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className={`particle ${
                isAddService ? "particle-add" : "particle-update"
              }`}
              style={{ animationDelay: `${i * 0.04}s` }}
            />
          ))}
          <div
            className={`success-icon ${
              isAddService ? "pulse-add" : "pulse-update"
            }`}
          >
            <div className="success-inner-circle" />
            <div className="success-tick-container">
              <div className="tick-short" />
              <div className="tick-long" />
            </div>
          </div>
          <h4 className="success-title">{message}</h4>
          <p className="success-subtitle">Success!</p>
        </div>
        <div className="success-footer">
          <button className="success-close-btn" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </>,
    document.body
  );
};

const ServicePage = () => {
  const [services, setServices] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [showTooltip, setShowTooltip] = useState({});
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [role, setRole] = useState("");
  const [deletingServiceId, setDeletingServiceId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const [showDustbin, setShowDustbin] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [formErrors, setFormErrors] = useState({});
  const [expandedService, setExpandedService] = useState(null);
  const servicesPerPage = 4;
  const itemRefs = useRef({});
  const svgIconRef = useRef(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("lg"));

  const [formData, setFormData] = useState({
    serviceName: "",
    style: "",
    price: "",
    duration: "",
    imageFile: null,
    imagePreview: "",
  });

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const getRole = async () => {
      try {
        const email = localStorage.getItem("email");
        const response = await axios.get(`${BASE_URL}/api/users/role/${email}`);
        setRole(response.data.role);
      } catch (error) {
        console.error("ServicePage: Error fetching role:", error.message);
      }
    };
    getRole();
  }, []);

  const fetchServices = async () => {
    const userEmail = localStorage.getItem("email");
    try {
      const response = await axios.get(
        `${BASE_URL}/api/admin/get-services/${userEmail}`
      );
      setServices(response.data.reverse());
    } catch (error) {
      console.error("ServicePage: Error fetching services:", error.message);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value.trim() }));

    if (name === "serviceName") {
      if (!value) {
        setFormErrors((prev) => ({
          ...prev,
          serviceName: "Service name is required",
        }));
      } else {
        setFormErrors((prev) => ({ ...prev, serviceName: "" }));
      }
    } else if (name === "price") {
      if (!value || parseFloat(value) <= 0) {
        setFormErrors((prev) => ({
          ...prev,
          price: "Price must be a positive number",
        }));
      } else {
        setFormErrors((prev) => ({ ...prev, price: "" }));
      }
    } else if (name === "duration") {
      if (!value || parseInt(value) < 20) {
        setFormErrors((prev) => ({
          ...prev,
          duration: "Duration must be at least 20 minutes",
        }));
      } else {
        setFormErrors((prev) => ({ ...prev, duration: "" }));
      }
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const validImageTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validImageTypes.includes(file.type)) {
        setFormErrors((prev) => ({
          ...prev,
          imageFile: "Please upload a valid image (JPEG, PNG, GIF)",
        }));
        return;
      }
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        imagePreview: URL.createObjectURL(file),
      }));
      setFormErrors((prev) => ({ ...prev, imageFile: "" }));
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.serviceName) {
      errors.serviceName = "Service name is required";
    }
    if (!formData.price || parseFloat(formData.price) <= 0) {
      errors.price = "Price must be a positive number";
    }
    if (!formData.duration || parseInt(formData.duration) < 20) {
      errors.duration = "Duration must be at least 20 minutes";
    }
    if (!isEditing && !formData.imageFile) {
      errors.imageFile = "Image is required for new services";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleEdit = (index) => {
    setFormData({
      serviceName: services[index].serviceName,
      style: services[index].style || "",
      price: services[index].price,
      duration: services[index].duration || "",
      imageFile: null,
      imagePreview: services[index].shopImage
        ? getImageUrl(services[index].shopImage)
        : "",
    });
    setIsEditing(true);
    setEditIndex(index);
    setShowForm(true);
    setFormErrors({});
    if (screenWidth <= 768) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const createNotifications = async (service, parlorName, action) => {
    try {
      const userEmail = localStorage.getItem("email");
      const serviceName = `${service.serviceName}${
        service.style ? ` (${service.style})` : ""
      }`;
      const serviceId = service._id;

      await axios.post(
        `${BASE_URL}/api/notifications/create-service-notification`,
        {
          parlorEmail: userEmail,
          serviceId,
          serviceName,
        }
      );
    } catch (error) {
      setSuccessMessage((prev) => `${prev} (Notifications failed to send)`);
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    if (isEditing) {
      await handleUpdate();
    } else {
      await handleCreate();
    }
  };

  const handleCreate = async () => {
    const form = new FormData();
    form.append("serviceName", formData.serviceName);
    form.append("style", formData.style);
    form.append("price", formData.price);
    form.append("duration", formData.duration);
    if (formData.imageFile) {
      form.append("shopImage", formData.imageFile);
    }

    const userEmail = localStorage.getItem("email");

    try {
      const response = await axios.post(
        `${BASE_URL}/api/admin/add-service/${userEmail}`,
        form,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      if (response.status === 200) {
        const { services: updatedServices, parlorName } = response.data;
        setServices(updatedServices);
        setShowForm(false);
        setFormData({
          serviceName: "",
          style: "",
          price: "",
          duration: "",
          imageFile: null,
          imagePreview: "",
        });
        setFormErrors({});
        setSuccessMessage("Service added successfully!");
        setShowSuccess(true);
        setCurrentPage(1);

        const newService = updatedServices[0];
        await createNotifications(newService, parlorName, "added");
      }
    } catch (error) {
      setFormErrors((prev) => ({
        ...prev,
        submit:
          error.response?.data?.message ||
          "Failed to add service. Please try again.",
      }));
    }
  };

  const handleUpdate = async () => {
    const form = new FormData();
    form.append("serviceName", formData.serviceName);
    form.append("style", formData.style);
    form.append("price", formData.price);
    form.append("duration", formData.duration);
    if (formData.imageFile) {
      form.append("shopImage", formData.imageFile);
    }

    const serviceId = services[editIndex]._id;

    try {
      const response = await axios.put(
        `${BASE_URL}/api/admin/update-service/${serviceId}`,
        form,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      if (response.status === 200) {
        const { updatedService, parlorName } = response.data;
        const updatedServices = [...services];
        updatedServices[editIndex] = updatedService;
        setServices(updatedServices);
        setShowForm(false);
        setIsEditing(false);
        setFormData({
          serviceName: "",
          style: "",
          price: "",
          duration: "",
          imageFile: null,
          imagePreview: "",
        });
        setFormErrors({});
        setSuccessMessage("Service updated successfully!");
        setShowSuccess(true);

        await createNotifications(updatedService, parlorName, "updated");
      }
    } catch (error) {
      setFormErrors((prev) => ({
        ...prev,
        submit:
          error.response?.data?.message ||
          "Failed to update service. Please try again.",
      }));
    }
  };

  const handleDeleteClick = (_id) => {
    setShowDeleteModal(true);
    setPendingDeleteId(_id);
  };

  const triggerDeleteAnimation = async (_id) => {
    setDeletingServiceId(_id);
    setShowDustbin(true);

    setTimeout(async () => {
      setShowDustbin(false);
      setShowDeleteModal(false);
      setDeletingServiceId(null);
      try {
        await axios.delete(`${BASE_URL}/api/admin/deleteService/${_id}`);
        fetchServices();
        const totalPages = Math.ceil(services.length / servicesPerPage);
        if (currentPage > totalPages && currentPage > 1) {
          setCurrentPage(currentPage - 1);
        }
      } catch (error) {
        console.error("ServicePage: Error deleting service:", error.message);
      }
    }, 1000);
  };

  const handleConfirmDelete = () => {
    if (pendingDeleteId) {
      triggerDeleteAnimation(pendingDeleteId);
      setPendingDeleteId(null);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteModal(false);
    setPendingDeleteId(null);
    setShowDustbin(false);
  };

  const handleAddService = async () => {
    const email = localStorage.getItem("email");
    try {
      const response = await axios.get(
        `${BASE_URL}/api/admin/check-employees/${email}`
      );
      const { hasEmployees } = response.data;

      if (hasEmployees) {
        setFormData({
          serviceName: "",
          style: "",
          price: "",
          duration: "",
          imageFile: null,
          imagePreview: "",
        });
        setShowForm(true);
        setIsEditing(false);
        setFormErrors({});
      } else {
        alert("Please add employee first.");
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
    }
  };

  useEffect(() => {
    if (showDeleteModal || showSuccess) {
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = "auto";
      };
    } else {
      document.body.style.overflow = "auto";
    }
  }, [showDeleteModal, showSuccess]);

  const toggleAccordion = (serviceId) => {
    setExpandedService(expandedService === serviceId ? null : serviceId);
  };

  const indexOfLastService = currentPage * servicesPerPage;
  const indexOfFirstService = indexOfLastService - servicesPerPage;
  const currentServices = services.slice(
    indexOfFirstService,
    indexOfLastService
  );

  const getImageUrl = (shopImage) => {
    if (!shopImage) return "/images/placeholder.jpg";
    const normalizedPath = shopImage.replace(/\\/g, "/");
    return `${BASE_URL.replace(/\/$/, "")}/${normalizedPath}`;
  };

  const totalPages = Math.ceil(services.length / servicesPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      setExpandedService(null);
    }
  };

  const getPaginationRange = () => {
    const rangeSize = 5;
    const halfRange = Math.floor(rangeSize / 2);
    let start = Math.max(1, currentPage - halfRange);
    let end = Math.min(totalPages, start + rangeSize - 1);

    if (end === totalPages) {
      start = Math.max(1, end - rangeSize + 1);
    }

    const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index);
    const showLeftEllipsis = start > 1;
    const showRightEllipsis = end < totalPages;

    return { pages, showLeftEllipsis, showRightEllipsis };
  };

  const { pages, showLeftEllipsis, showRightEllipsis } = getPaginationRange();

  // Common styles for table cells
  const tableCellSx = {
    p: "10px",
    fontSize: "0.85rem",
    textAlign: "center",
    border: "1px solid #e0e0e0",
    color: "#0e0f0f",
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    transition: "all 0.3s ease",
    "&:hover": {
      backgroundColor: "#e8f4f8",
      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
    },
  };

  return (
    <Box
      className="service-page"
      sx={{
        minHeight: "100vh",
        p: { xs: "15px 10px", sm: "40px 20px" },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: "transparent",
        width: "100%",
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: "1000px",
          backgroundColor: "#ffffff",
          borderRadius: "12px",
          p: "20px",
          boxShadow: "0 8px 25px rgba(0, 0, 0, 0.1)",
          border: "1px solid #e0e0e0",
          margin: "0 auto",
          transition: "all 0.3s ease",
          animation: "slideInUp 0.5s ease-out",
          "&:hover": {
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        {showSuccess && (
          <SuccessMessage
            message={successMessage}
            onClose={() => setShowSuccess(false)}
            screenWidth={screenWidth}
          />
        )}

        <Box
          component="h2"
          className="service-title"
          sx={{
            fontSize: { xs: "1.5rem", sm: "2.5rem" },
            color: "#54A3C1",
            fontWeight: 700,
            m: 0,
            mb: { xs: "15px", sm: "2rem" },
            textAlign: "center",
          }}
        >
          Service Management
        </Box>

        <Box
          sx={{
            mt: 2,
            display: "flex",
            justifyContent: "center",
          }}
        >
          <Box
            component="button"
            onClick={handleAddService}
            className="add-service-btn"
            sx={{
              p: { xs: "10px 20px", sm: "12px 24px" },
              fontSize: { xs: "0.9rem", sm: "0.95rem" },
              mb: { xs: "15px", sm: "25px" },
            }}
          >
            + Add Service
          </Box>
        </Box>

        {showForm &&
          (() => {
            const roleOptions = {
              Salon: ["HairCut", "Facial", "HairColor", "Shaving"],
              Beauty_Parler: ["HairCut", "Bridal", "Waxing", "Pedicure"],
              Doctor: ["Hair Treatment", "Skin Treatment"],
            };
            const options = roleOptions[role] || [];

            return (
              <Box
                className="service-form"
                sx={{
                  mt: 3,
                  p: { xs: "15px", sm: "20px" },
                  maxWidth: { xs: "85%", sm: "400px" },
                  mx: "auto",
                }}
              >
                <Box className="form-field">
                  <select
                    name="serviceName"
                    value={formData.serviceName}
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  >
                    <option value="" disabled>
                      Select Service
                    </option>
                    {options.map((option, index) => (
                      <option key={index} value={option}>
                        {option}
                      </option>
                    ))}
                  </select>
                  {formErrors.serviceName && (
                    <Typography
                      color="error"
                      sx={{ mt: 1, fontSize: "0.85rem" }}
                    >
                      {formErrors.serviceName}
                    </Typography>
                  )}
                </Box>

                <Box className="form-field" sx={{ mt: 2 }}>
                  <input
                    type="text"
                    name="style"
                    placeholder="Style (e.g. Layer Cut, Balayage)"
                    value={formData.style}
                    onChange={handleInputChange}
                    className="form-input"
                  />
                </Box>

                <Box className="form-field" sx={{ mt: 2 }}>
                  <input
                    type="number"
                    name="price"
                    placeholder="Price"
                    value={formData.price}
                    min="0.01"
                    step="0.01"
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                  {formErrors.price && (
                    <Typography
                      color="error"
                      sx={{ mt: 1, fontSize: "0.85rem" }}
                    >
                      {formErrors.price}
                    </Typography>
                  )}
                </Box>

                <Box className="form-field" sx={{ mt: 2 }}>
                  <input
                    type="number"
                    name="duration"
                    placeholder="Duration (minutes)"
                    value={formData.duration}
                    min="20"
                    step="1"
                    onChange={handleInputChange}
                    className="form-input"
                    required
                  />
                  {formErrors.duration && (
                    <Typography
                      color="error"
                      sx={{ mt: 1, fontSize: "0.85rem" }}
                    >
                      {formErrors.duration}
                    </Typography>
                  )}
                </Box>

                <Box className="form-field" sx={{ mt: 2 }}>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/gif"
                    onChange={handleImageChange}
                    className="form-file-input"
                    required={!isEditing}
                  />
                  {formErrors.imageFile && (
                    <Typography
                      color="error"
                      sx={{ mt: 1, fontSize: "0.85rem" }}
                    >
                      {formErrors.imageFile}
                    </Typography>
                  )}
                </Box>

                {formData.imagePreview && (
                  <img
                    src={formData.imagePreview}
                    alt="Preview"
                    className="image-preview"
                  />
                )}

                {formErrors.submit && (
                  <Typography color="error" sx={{ mt: 2, fontSize: "0.85rem" }}>
                    {formErrors.submit}
                  </Typography>
                )}

                <Box
                  className="form-actions"
                  sx={{ mt: 3, display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}
                >
                  <Box
                    component="button"
                    onClick={handleSubmit}
                    className={`submit-btn ${isEditing ? "update-btn" : ""}`}
                    disabled={Object.values(formErrors).some((error) => error)}
                  >
                    {isEditing ? "Update" : "Submit"}
                  </Box>
                  <Box
                    component="button"
                    onClick={() => {
                      setShowForm(false);
                      setIsEditing(false);
                      setFormErrors({});
                    }}
                    className="cancel-btn"
                  >
                    Cancel
                  </Box>
                </Box>
              </Box>
            );
          })()}

        {showDeleteModal &&
          createPortal(
            <>
              <div className="delete-backdrop" />
              <div
                className="delete-modal"
                style={{
                  top: screenWidth <= 768 ? "45%" : "50%",
                  left: "50%",
                  width:
                    screenWidth <= 480
                      ? "90%"
                      : screenWidth <= 768
                      ? "85%"
                      : screenWidth <= 1024
                      ? "80%"
                      : "350px",
                  maxWidth:
                    screenWidth <= 480
                      ? "260px"
                      : screenWidth <= 768
                      ? "300px"
                      : screenWidth <= 1024
                      ? "340px"
                      : "350px",
                }}
                onMouseEnter={() => {
                  if (svgIconRef.current && !showDustbin) {
                    svgIconRef.current.style.animation =
                      "bounce 0.6s ease infinite";
                  }
                }}
                onMouseLeave={() => {
                  if (svgIconRef.current && !showDustbin) {
                    svgIconRef.current.style.animation = "none";
                  }
                }}
              >
                {!showDustbin ? (
                  <div className="delete-content">
                    <svg
                      ref={svgIconRef}
                      className="delete-icon"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        clipRule="evenodd"
                        fillRule="evenodd"
                        d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      />
                    </svg>
                    <h2 className="delete-title">Are you sure?</h2>
                    <p className="delete-text">
                      Do you really want to delete this service? This process
                      cannot be undone.
                    </p>
                  </div>
                ) : (
                  <div className="dustbin-animation">
                    <svg
                      className="dustbin-icon"
                      viewBox="0 0 16 16"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="4"
                        y="4"
                        width="8"
                        height="10"
                        rx="1"
                        fill="white"
                      />
                      <rect
                        className="lid"
                        x="4"
                        y="2"
                        width="8"
                        height="2"
                        rx="0.5"
                        fill="white"
                        style={{ transformOrigin: "4 2" }}
                      />
                      <path
                        d="M6 6H7V12H6V6Z"
                        fill="black"
                        style={{
                          opacity: showDustbin ? "0.5" : "1",
                          transition: "opacity 0.4s ease-out 0.3s",
                        }}
                      />
                      <path
                        d="M9 6H10V12H9V6Z"
                        fill="black"
                        style={{
                          opacity: showDustbin ? "0.5" : "1",
                          transition: "opacity 0.4s ease-out 0.3s",
                        }}
                      />
                    </svg>
                    {[...Array(4)].map((_, i) => (
                      <div
                        key={i}
                        className="trash-particle"
                        style={{ animationDelay: `${0.3 + i * 0.05}s` }}
                      />
                    ))}
                  </div>
                )}

                {!showDustbin && (
                  <div className="delete-actions">
                    <button
                      className="delete-cancel-btn"
                      onClick={handleCancelDelete}
                    >
                      Cancel
                    </button>
                    <button
                      className="delete-confirm-btn"
                      onClick={handleConfirmDelete}
                    >
                      Confirm
                    </button>
                  </div>
                )}
              </div>
            </>,
            document.body
          )}

        <Box className="services-container1" sx={{ mt: 3, width: "100%", maxWidth: "1000px", mx: "auto" }}>
          {isMobile ? (
            <Box
              className="mobile-services"
              sx={{
                width: "100%",
                display: "flex",
                flexDirection: "column",
                gap: 2,
                p: "12px",
              }}
            >
              {currentServices.length > 0 ? (
                currentServices.map((svc, index) => (
                  <StyledAccordion
                    key={svc._id}
                    ref={(el) => (itemRefs.current[svc._id] = el)}
                    className={`service-card ${
                      deletingServiceId === svc._id ? "deleting" : ""
                    }`}
                    style={{
                      animationDelay: `${indexOfFirstService + index * 0.1}s`,
                    }}
                  >
                    <StyledAccordionSummary
                      expandIcon={<ExpandMoreIcon className="accordion-icon" />}
                      aria-controls={`panel${svc._id}-content`}
                      id={`panel${svc._id}-header`}
                      onClick={() => toggleAccordion(svc._id)}
                      className="accordion-header1"
                    >
                      <Typography
                        className="accordion-title"
                        sx={{
                          fontWeight: 600,
                          fontSize: "1rem",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {svc.serviceName}
                      </Typography>
                    </StyledAccordionSummary>
                    <AccordionDetails
                      className={`accordion-content ${expandedService === svc._id ? "expanded" : ""}`}
                      sx={{
                        p: 2,
                        backgroundColor: "rgba(255, 255, 255, 0.95)",
                      }}
                    >
                      <Box
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 0.5,
                        }}
                      >
                        <Box className="service-field">
                          <Typography className="field-label">
                            Style:
                          </Typography>
                          <Typography className="field-value">
                            {svc.style || "-"}
                          </Typography>
                        </Box>
                        <Box className="service-field">
                          <Typography className="field-label">
                            Price:
                          </Typography>
                          <Typography className="field-value">
                            ₹{svc.price.toFixed(2)}
                          </Typography>
                        </Box>
                        <Box className="service-field">
                          <Typography className="field-label">
                            Duration:
                          </Typography>
                          <Typography className="field-value">
                            {svc.duration ? `${svc.duration} min` : "-"}
                          </Typography>
                        </Box>
                        <Box className="service-field service-image-field">
                          <Typography className="field-label">
                            Image:
                          </Typography>
                          {svc.shopImage ? (
                            <img
                              src={getImageUrl(svc.shopImage)}
                              alt={svc.serviceName}
                              className="service-image"
                            />
                          ) : (
                            <span className="no-image">No Image</span>
                          )}
                        </Box>
                        <Box className="service-field service-actions">
                          <Typography className="field-label">
                            Actions:
                          </Typography>
                          <Box
                            className="action-buttons"
                            sx={{ display: "flex", gap: 1, mt: 1 }}
                          >
                            <Box className="action-wrapper">
                              <button
                                onClick={() =>
                                  handleEdit(indexOfFirstService + index)
                                }
                                className="edit-btn"
                                onMouseEnter={() =>
                                  setShowTooltip((prev) => ({
                                    ...prev,
                                    [`edit_${svc._id}`]: true,
                                  }))
                                }
                                onMouseLeave={() =>
                                  setShowTooltip((prev) => ({
                                    ...prev,
                                    [`edit_${svc._id}`]: false,
                                  }))
                                }
                                onTouchStart={() =>
                                  setShowTooltip((prev) => ({
                                    ...prev,
                                    [`edit_${svc._id}`]: true,
                                  }))
                                }
                                onTouchEnd={() =>
                                  setShowTooltip((prev) => ({
                                    ...prev,
                                    [`edit_${svc._id}`]: false,
                                  }))
                                }
                              >
                                <Edit className="edit-icon" />
                                {/* <span className="edit-btn-text">Edit</span> */}
                              </button>
                              <span
                                className="tooltip"
                                style={{
                                  opacity: showTooltip[`edit_${svc._id}`] ? 1 : 0,
                                  transform: `translateX(-50%) translateY(${
                                    showTooltip[`edit_${svc._id}`]
                                      ? "0"
                                      : "10px"
                                  })`,
                                }}
                              >
                                Edit Service
                              </span>
                            </Box>
                            <Box className="action-wrapper">
                              <button
                                onClick={() => handleDeleteClick(svc._id)}
                                className="edit-btn"
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = "#8B0000";
                                  e.target.style.boxShadow =
                                    "0 0 12px #FFA500";
                                  setShowTooltip((prev) => ({
                                    ...prev,
                                    [`delete_${svc._id}`]: true,
                                  }));
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = "#0e0f0f";
                                  e.target.style.boxShadow =
                                    "0px 0px 15px rgba(0, 0, 0, 0.164)";
                                  setShowTooltip((prev) => ({
                                    ...prev,
                                    [`delete_${svc._id}`]: false,
                                  }));
                                }}
                                onTouchStart={(e) => {
                                  e.target.style.backgroundColor = "#8B0000";
                                  e.target.style.boxShadow =
                                    "0 0 12px #FFA500";
                                  setShowTooltip((prev) => ({
                                    ...prev,
                                    [`delete_${svc._id}`]: true,
                                  }));
                                }}
                                onTouchEnd={(e) => {
                                  e.target.style.backgroundColor = "#0e0f0f";
                                  e.target.style.boxShadow =
                                    "0px 0px 15px rgba(0, 0, 0, 0.164)";
                                  setShowTooltip((prev) => ({
                                    ...prev,
                                    [`delete_${svc._id}`]: false,
                                  }));
                                }}
                              >
                                <Delete className="edit-icon" />
                                {/* <span className="edit-btn-text">Delete</span> */}
                              </button>
                              <span
                                className="tooltip"
                                style={{
                                  opacity: showTooltip[`delete_${svc._id}`]
                                    ? 1
                                    : 0,
                                  transform: `translateX(-50%) translateY(${
                                    showTooltip[`delete_${svc._id}`]
                                      ? "0"
                                      : "10px"
                                  })`,
                                }}
                              >
                                Delete Service
                              </span>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    </AccordionDetails>
                  </StyledAccordion>
                ))
              ) : (
                <Box
                  className="no-services"
                  sx={{
                    maxWidth: { xs: "80%", sm: "50%" },
                    p: { xs: "12px", sm: "15px" },
                  }}
                >
                  <Typography
                    variant="body1"
                    sx={{
                      color: "#7f8c8d",
                      fontSize: { xs: "0.85rem", sm: "0.9rem" },
                    }}
                  >
                    No Services Found
                  </Typography>
                </Box>
              )}
            </Box>
          ) : (
            <Box className="desktop-services" sx={{ overflowX: "hidden", width: "100%" }}>
              <Box
                component="table"
                className="services-table"
                sx={{
                  width: "100%",
                  minWidth: "800px",
                  borderCollapse: "collapse",
                }}
              >
                <Box
                  component="thead"
                  sx={{
                    background: "#fb646b",
                    color: "#ffffff",
                  }}
                >
                  <tr>
                    {[
                      "Service Name",
                      "Style",
                      "Price",
                      "Duration",
                      "Image",
                      "Actions",
                    ].map((header, idx) => (
                      <Box
                        component="th"
                        key={idx}
                        sx={{
                          p: { xs: "8px", sm: "10px" },
                          textAlign: "left",
                        }}
                      >
                        {header}
                      </Box>
                    ))}
                  </tr>
                </Box>
                <Box component="tbody">
                  {currentServices.length > 0 ? (
                    currentServices.map((svc, index) => (
                      <Box
                        component="tr"
                        key={svc._id}
                        ref={(el) => (itemRefs.current[svc._id] = el)}
                        className={`service-row ${
                          deletingServiceId === svc._id ? "deleting" : ""
                        }`}
                        style={{
                          animationDelay: `${(indexOfFirstService + index) * 0.1}s`,
                          backgroundColor:
                            (indexOfFirstService + index) % 2 === 0
                              ? "#f9f9f9"
                              : "#ffffff",
                        }}
                      >
                        <Box component="td" sx={tableCellSx}>
                          {svc.serviceName}
                        </Box>
                        <Box component="td" sx={tableCellSx}>
                          {svc.style || "-"}
                        </Box>
                        <Box component="td" sx={tableCellSx}>
                          ₹{svc.price.toFixed(2)}
                        </Box>
                        <Box component="td" sx={tableCellSx}>
                          {svc.duration ? `${svc.duration} min` : "-"}
                        </Box>
                        <Box component="td" sx={tableCellSx}>
                          {svc.shopImage ? (
                            <img
                              src={getImageUrl(svc.shopImage)}
                              alt={svc.serviceName}
                              className="service-image"
                            />
                          ) : (
                            <span className="no-image">No Image</span>
                          )}
                        </Box>
                        <Box component="td" sx={tableCellSx}>
                          <Box
                            className="action-buttons"
                            sx={{ display: "flex", gap: 1, justifyContent: "center" }}
                          >
                            <Box className="action-wrapper">
                              <button
                                onClick={() =>
                                  handleEdit(indexOfFirstService + index)
                                }
                                className="edit-btn"
                                onMouseEnter={() =>
                                  setShowTooltip((prev) => ({
                                    ...prev,
                                    [`edit_${svc._id}`]: true,
                                  }))
                                }
                                onMouseLeave={() =>
                                  setShowTooltip((prev) => ({
                                    ...prev,
                                    [`edit_${svc._id}`]: false,
                                  }))
                                }
                              >
                                <Edit className="edit-icon" />
                                {/* <span className="edit-btn-text">Edit</span> */}
                              </button>
                              <span
                                className="tooltip"
                                style={{
                                  opacity: showTooltip[`edit_${svc._id}`] ? 1 : 0,
                                  transform: `translateX(-50%) translateY(${
                                    showTooltip[`edit_${svc._id}`]
                                      ? "0"
                                      : "-10px"
                                  })`,
                                }}
                              >
                                Edit Service
                              </span>
                            </Box>
                            <Box className="action-wrapper">
                              <button
                                onClick={() => handleDeleteClick(svc._id)}
                                className="edit-btn"
                                onMouseEnter={(e) => {
                                  e.target.style.backgroundColor = "#8B0000";
                                  e.target.style.boxShadow =
                                    "0 0 12px #FFA500";
                                  setShowTooltip((prev) => ({
                                    ...prev,
                                    [`delete_${svc._id}`]: true,
                                  }));
                                }}
                                onMouseLeave={(e) => {
                                  e.target.style.backgroundColor = "#0e0f0f";
                                  e.target.style.boxShadow =
                                    "0px 0px 15px rgba(0, 0, 0, 0.25)";
                                  setShowTooltip((prev) => ({
                                    ...prev,
                                    [`delete_${svc._id}`]: false,
                                  }));
                                }}
                              >
                                <Delete className="edit-icon" />
                                {/* <span className="edit-btn-text">Delete</span> */}
                              </button>
                              <span
                                className="tooltip"
                                style={{
                                  opacity: showTooltip[`delete_${svc._id}`]
                                    ? 1
                                    : 0,
                                  transform: `translateX(-50%) translateY(${
                                    showTooltip[`delete_${svc._id}`]
                                      ? "0"
                                      : "-10px"
                                  })`,
                                }}
                              >
                                Delete Service
                              </span>
                            </Box>
                          </Box>
                        </Box>
                      </Box>
                    ))
                  ) : (
                    <Box component="tr">
                      <Box
                        component="td"
                        colSpan="6"
                        sx={tableCellSx}
                      >
                        No Services Found
                      </Box>
                    </Box>
                  )}
                </Box>
              </Box>
            </Box>
          )}
          {services.length > servicesPerPage && (
            <Box
              className="pagination"
              sx={{
                mt: 3,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: "8px",
                p: "12px",
              }}
            >
              <Box className="pagination-pages" sx={{ display: "flex", gap: "4px" }}>
                {showLeftEllipsis && <span className="pagination-ellipsis">...</span>}
                {pages.map((page) => (
                  <button
                    key={page}
                    className={`pagination-page ${page === currentPage ? "active" : ""}`}
                    onClick={() => paginate(page)}
                    style={{
                      padding: "8px",
                      minWidth: "40px",
                      height: "40px",
                      fontSize: "1rem",
                    }}
                  >
                    {page}
                  </button>
                ))}
                {showRightEllipsis && <span className="pagination-ellipsis">...</span>}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default ServicePage;
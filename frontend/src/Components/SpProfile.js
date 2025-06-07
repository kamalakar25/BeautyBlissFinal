import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  styled,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

// Define custom marker icon for Leaflet
const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Styled component for the search input
const StyledTextField = styled(TextField)(({ theme }) => ({
  minWidth: { xs: 200, sm: 300 },
  backgroundColor: "#ffffff",
  borderRadius: theme.shape.borderRadius * 2,
  transition: "all 0.3s ease",
  "& .MuiInputBase-input": {
    fontSize: { xs: "0.875rem", sm: "1rem" },
    color: "#0e0f0f",
    padding: "12px",
  },
  "& .MuiInputLabel-root": {
    fontSize: { xs: "0.875rem", sm: "1rem" },
    color: "#0e0f0f",
    "&.Mui-focused": { color: "#FF80DD" },
  },
  "& .MuiOutlinedInput-root": {
    "&:hover fieldset": { borderColor: "#FF80DD" },
    "&.Mui-focused fieldset": { borderColor: "#FF80DD", borderWidth: 2 },
  },
  "&:hover": {
    "& .MuiInputBase-root": {
      backgroundColor: "#fff5f8",
    },
  },
}));

const BASE_URL = process.env.REACT_APP_API_URL;

const SpProfile = () => {
  const spEmail = localStorage.getItem("email");
  const [serviceProvider, setServiceProvider] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [openMapModal, setOpenMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const searchInputRef = useRef(null);
  const editFormRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (spEmail) {
      axios
        .get(`${BASE_URL}/api/admin/SpProfile/${encodeURIComponent(spEmail)}`)
        .then((res) => {
          setServiceProvider(res.data);
          setFormData({
            ...res.data,
            password: "",
            confirmPassword: "",
            fromTime: res.data.availableTime?.fromTime || "",
            toTime: res.data.availableTime?.toTime || "",
          });
        })
        .catch((err) => {
          // console.error('Failed to fetch service provider:', err);
        });
    }
  }, [spEmail]);

  const initializeMap = () => {
    if (mapRef.current && !mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current).setView(
        [40.7128, -74.006],
        10
      );
      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {}
      ).addTo(mapInstanceRef.current);

      const { coordinates } = formData;
      if (coordinates?.latitude && coordinates?.longitude) {
        mapInstanceRef.current.setView(
          [coordinates.latitude, coordinates.longitude],
          15
        );
        setSelectedLocation({
          lat: coordinates.latitude,
          lng: coordinates.longitude,
        });
        markerRef.current = L.marker(
          [coordinates.latitude, coordinates.longitude],
          { icon: customIcon }
        ).addTo(mapInstanceRef.current);
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            mapInstanceRef.current.setView([latitude, longitude], 15);
            setSelectedLocation({ lat: latitude, lng: longitude });
            markerRef.current = L.marker([latitude, longitude], {
              icon: customIcon,
            }).addTo(mapInstanceRef.current);
          },
          () => {
            mapInstanceRef.current.setView([40.7128, -74.006], 10);
          },
          { enableHighAccuracy: true }
        );
      }

      mapInstanceRef.current.on("click", (e) => {
        const { lat, lng } = e.latlng;
        setSelectedLocation({ lat, lng });
        if (markerRef.current) {
          markerRef.current.setLatLng([lat, lng]);
        } else {
          markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(
            mapInstanceRef.current
          );
        }
      });
    }
  };

  const fetchSearchResults = async (query) => {
    if (!query) {
      setSearchResults([]);
      return;
    }
    try {
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/search",
        {
          params: { q: query, format: "json", addressdetails: 1, limit: 5 },
        }
      );
      setSearchResults(response.data);
    } catch (error) {
      // console.error('Error fetching search results:', error);
      setSearchResults([]);
    }
  };

  const handleSearchChange = (e) => {
    const query = e.target.value;
    fetchSearchResults(query);
  };

  const handleSearchSelect = (place) => {
    const lat = parseFloat(place.lat);
    const lng = parseFloat(place.lon);
    setSelectedLocation({ lat, lng, address: place.display_name });
    mapInstanceRef.current.setView([lat, lng], 15);
    if (markerRef.current) {
      markerRef.current.setLatLng([lat, lng]);
    } else {
      markerRef.current = L.marker([lat, lng], { icon: customIcon }).addTo(
        mapInstanceRef.current
      );
    }
    setSearchResults([]);
    if (searchInputRef.current) {
      searchInputRef.current.value = place.display_name;
    }
  };

  const handleGetLocation = () => {
    setOpenMapModal(true);
    setTimeout(initializeMap, 0);
  };

  const handleConfirmLocation = async () => {
    if (!selectedLocation) {
      alert("Please select a location on the map or via search.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.get(
        "https://nominatim.openstreetmap.org/reverse",
        {
          params: {
            lat: selectedLocation.lat,
            lon: selectedLocation.lng,
            format: "json",
            addressdetails: 1,
          },
        }
      );
      const address = response.data.display_name || "Unknown address";
      setFormData((prev) => ({
        ...prev,
        location: `Lat: ${selectedLocation.lat.toFixed(
          6
        )}, Lon: ${selectedLocation.lng.toFixed(6)}`,
        spAddress: selectedLocation.address || address,
      }));
      setErrors((prev) => ({ ...prev, location: "", spAddress: "" }));
    } catch (error) {
      // console.error('Reverse geocoding error:', error);
      alert("Error fetching address. Please try again.");
    } finally {
      setIsLoading(false);
      setOpenMapModal(false);
    }
  };

  const handleCloseModal = () => {
    setOpenMapModal(false);
    setSelectedLocation(null);
    setSearchResults([]);
    if (markerRef.current) {
      markerRef.current.remove();
      markerRef.current = null;
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current.remove();
      mapInstanceRef.current = null;
    }
  };

  const validateField = (name, value) => {
    let error = "";

    if (name === "name" || name === "shopName") {
      const isValid =
        /^[a-zA-Z]+[a-zA-Z\s]*[a-zA-Z]$/.test(value) &&
        value.length >= 2 &&
        value.length <= 50;
      error = value
        ? isValid
          ? ""
          : "Must be 2-50 characters, letters only, spaces allowed in middle but not at start or end"
        : `${name === "name" ? "Name" : "Shop Name"} is required`;
    }

    if (name === "email") {
      const isValid = /^[a-zA-Z0-9._%+-]+@[a-zA-Z]{2,}\.[a-zA-Z]{2,}$/.test(
        value
      );
      error = value
        ? isValid
          ? ""
          : "Enter a valid email address"
        : "Email is required";
    }

    if (name === "phone") {
      const cleanedValue = value.replace(/\s/g, "");
      if (cleanedValue === "") {
        error = "Phone number is required";
      } else if (!/^[6-9]\d{9}$/.test(cleanedValue)) {
        error =
          cleanedValue.length !== 10
            ? "Invalid phone number (must be 10 digits)"
            : "Phone number must start with 6, 7, 8, or 9";
      }
    }

    if (name === "dob") {
      const selectedDate = new Date(value);
      const today = new Date();
      const minDate = new Date();
      minDate.setFullYear(today.getFullYear() - 18);

      if (!value) {
        error = "Date of birth is required";
      } else if (selectedDate > today) {
        error = "Date of birth cannot be in the future";
      } else if (selectedDate > minDate) {
        error = "You must be at least 18 years old";
      }
    }

    if (name === "location") {
      error = value ? "" : "Location is required";
    }

    if (name === "spAddress") {
      error = value ? "" : "Shop address is required";
    }

    if (name === "fromTime") {
      error = value ? "" : "Shop opening time is required";
    }

    if (name === "toTime") {
      error = value ? "" : "Shop closing time is required";
    }

    if (name === "password" && value) {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      error = passwordRegex.test(value)
        ? ""
        : "Password must contain at least 8 characters, one uppercase letter, one lowercase letter, one number, and one special character";
    }

    if (name === "confirmPassword" && value) {
      error = value === formData.password ? "" : "Passwords do not match";
    }

    return error;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "name" || name === "shopName") {
      newValue = value.replace(/[^a-zA-Z\s]/g, "");
      if (newValue.startsWith(" ")) {
        newValue = newValue.trimStart();
      }
    }

    if (name === "phone") {
      newValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setFormData((prev) => ({ ...prev, [name]: newValue }));
    const error = validateField(name, newValue);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleEdit = () => {
    setEditMode(true);
    setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
    setErrors({});

    // Scroll to edit form in mobile view (xs breakpoint, <= 600px)
    if (window.innerWidth <= 600 && editFormRef.current) {
      setTimeout(() => {
        editFormRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100); // Delay to ensure edit form is rendered
    }
  };

  const handleSave = () => {
    const newErrors = {};
    [
      "name",
      "email",
      "phone",
      "dob",
      "gender",
      "shopName",
      "location",
      "spAddress",
      "fromTime",
      "toTime",
    ].forEach((key) => {
      const error = validateField(key, formData[key]);
      if (error) newErrors[key] = error;
    });

    if (formData.password) {
      const passwordError = validateField("password", formData.password);
      const confirmPasswordError = validateField(
        "confirmPassword",
        formData.confirmPassword
      );
      if (passwordError) newErrors.password = passwordError;
      if (confirmPasswordError)
        newErrors.confirmPassword = confirmPasswordError;
      if (!formData.confirmPassword)
        newErrors.confirmPassword = "Confirm password is required";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("Please fix the errors in the form.");
      return;
    }

    const updateData = {
      ...formData,
      availableTime: { fromTime: formData.fromTime, toTime: formData.toTime },
    };
    if (!updateData.password) {
      delete updateData.password;
    }
    delete updateData.confirmPassword;

    axios
      .put(
        `${BASE_URL}/api/admin/updateSpProfile/${encodeURIComponent(spEmail)}`,
        updateData
      )
      .then((res) => {
        setServiceProvider(res.data.serviceProvider);
        alert("Profile updated successfully!");
        setFormData((prev) => ({ ...prev, password: "", confirmPassword: "" }));
        setErrors({});
        setEditMode(false);
      })
      .catch((err) => {
        // console.error('Failed to update profile:', err);
        alert(err.response?.data?.message || "Update failed");
      });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Not specified";
    }
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  if (!serviceProvider) return <p>Loading profile...</p>;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" }, // Stack on mobile, side by side on desktop
        justifyContent: "center",
        alignItems: { xs: "center", md: "flex-start" }, // Align top on desktop
        background: "#fad9e3",
        minHeight: "100vh",
        padding: { xs: 2, md: 4 },
        gap: { xs: 2, md: 4 }, // Space between profile and edit form
      }}
    >
      {/* Profile Card */}
      <Card
        sx={{
          width: { xs: "100%", md: "350px" }, // Fixed width on desktop
          maxWidth: { xs: 300, md: 350 },
          backgroundColor: "#FFEBF1",
          boxShadow: "0px 12px 40px rgba(0,0,0,0.15)",
          borderRadius: 6,
          border: "1px solid rgba(255, 128, 221, 0.3)",
        }}
      >
        <CardContent
          sx={{
            p: { xs: 3, md: 4 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              textAlign: "center",
              mb: 2,
            }}
          >
            <Typography
              variant="h5"
              fontWeight="bold"
              sx={{ color: "#0e0f0f", mb: 2 }}
            >
              {serviceProvider.name || "Not specified"}
            </Typography>
            <Box
              component="img"
              src="https://static.vecteezy.com/system/resources/thumbnails/020/911/732/small/profile-icon-avatar-icon-user-icon-person-icon-free-png.png"
              alt="Profile Picture"
              sx={{
                width: 100,
                height: 100,
                borderRadius: "50%",
                mb: 2,
                border: "2px solid #FF80DD",
              }}
            />
            <Typography
              variant="subtitle2"
              sx={{ color: "#FF80DD", fontWeight: "600", mb: 2 }}
            >
              {serviceProvider.designation || "Not specified"}
            </Typography>
            <Typography sx={{ color: "#0e0f0f", mb: 1, display: "flex", alignItems: "center", fontSize: { xs: "0.875rem", md: "1rem" } }}>
              <Box component="span" sx={{ mr: 1 }}>📧</Box>
              {serviceProvider.email || "Not specified"}
            </Typography>
            <Typography sx={{ color: "#0e0f0f", mb: 1, display: "flex", alignItems: "center", fontSize: { xs: "0.875rem", md: "1rem" } }}>
              <Box component="span" sx={{ mr: 1 }}>📞</Box>
              {serviceProvider.phone || "Not specified"}
            </Typography>
            <Typography sx={{ color: "#0e0f0f", mb: 1, display: "flex", alignItems: "center", fontSize: { xs: "0.875rem", md: "1rem" } }}>
              <Box component="span" sx={{ mr: 1 }}>📍</Box>
              {serviceProvider.spAddress || "Not specified"}
            </Typography>
            <Typography sx={{ color: "#0e0f0f", mb: 2, display: "flex", alignItems: "center", fontSize: { xs: "0.875rem", md: "1rem" } }}>
              <Box component="span" sx={{ mr: 1 }}>📅</Box>
              Member since {formatDate(serviceProvider.createdAt) || "Not specified"}
            </Typography>
            <Button
              variant="contained"
              onClick={handleEdit}
              sx={{
                backgroundColor: "#FF80DD",
                color: "#ffffff",
                borderRadius: 2,
                px: 3,
                py: 0.5,
                boxShadow: "0px 4px 12px rgba(255, 128, 221, 0.4)",
                "&:hover": {
                  backgroundColor: "#ff66cc",
                  boxShadow: "0px 6px 16px rgba(255, 128, 221, 0.5)",
                },
                fontSize: { xs: "0.875rem", md: "1rem" },
              }}
            >
              Edit
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Edit Profile Form Section */}
      {editMode && (
        <Box
          ref={editFormRef}
          sx={{
            backgroundColor: "#fff",
            borderRadius: 2,
            p: { xs: 2, md: 3 },
            border: "1px solid rgba(255, 128, 221, 0.3)",
            width: { xs: "100%", md: "350px" }, // Fixed width on desktop
            maxWidth: { xs: 300, md: 350 },
          }}
        >
          <Typography
            variant="h6"
            fontWeight="bold"
            sx={{ color: "#0e0f0f", mb: 2 }}
          >
            Edit Profile Information
          </Typography>

          {[
            { label: "Full Name", key: "name" },
            { label: "Email", key: "email" },
            { label: "Phone Number", key: "phone" },
            { label: "Address", key: "spAddress", isLocation: true },
            { label: "Date of Birth", key: "dob", isDateInput: true },
          ].map((item) => (
            <Box key={item.key} sx={{ mb: 1.5 }}>
              <Typography sx={{ color: "#0e0f0f", mb: 0.5, fontWeight: "500", fontSize: { xs: "0.875rem", md: "1rem" } }}>
                {item.label}
              </Typography>
              {item.isLocation ? (
                <Box sx={{ display: "flex", gap: 1 }}>
                  <TextField
                    variant="outlined"
                    size="small"
                    name={item.key}
                    value={formData[item.key] || ""}
                    onChange={handleChange}
                    fullWidth
                    disabled={true}
                    error={!!errors[item.key]}
                    helperText={errors[item.key]}
                    sx={{
                      backgroundColor: "#fff",
                      borderRadius: 2,
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": { borderColor: "#FF80DD" },
                        "&.Mui-focused fieldset": {
                          borderColor: "#FF80DD",
                          borderWidth: 2,
                        },
                      },
                      "& .MuiInputBase-input": {
                        fontSize: { xs: "0.875rem", md: "1rem" },
                      },
                    }}
                  />
                  <motion.div
                    variants={{ hover: { scale: 1.1 }, tap: { scale: 0.95 } }}
                    whileHover="hover"
                    whileTap="tap"
                  >
                    <Button
                      variant="contained"
                      onClick={handleGetLocation}
                      disabled={isLoading}
                      sx={{
                        backgroundColor: "#FF80DD",
                        color: "#ffffff",
                        borderRadius: 2,
                        px: 2,
                        py: 0.5,
                        boxShadow: "0px 4px 12px rgba(255, 128, 221, 0.4)",
                        "&:hover": {
                          backgroundColor: "#ff66cc",
                          boxShadow: "0px 6px 16px rgba(255, 128, 221, 0.5)",
                        },
                        "&:disabled": {
                          backgroundColor: "#ffb3e6",
                          color: "#ffffff",
                        },
                        fontSize: { xs: "0.75rem", md: "0.875rem" },
                      }}
                    >
                      Get Location
                    </Button>
                  </motion.div>
                </Box>
              ) : (
                <TextField
                  variant="outlined"
                  size="small"
                  type={item.isDateInput ? "date" : "text"}
                  name={item.key}
                  value={formData[item.key] || ""}
                  onChange={handleChange}
                  fullWidth
                  sx={{
                    backgroundColor: "#fff",
                    borderRadius: 2,
                    "& .MuiOutlinedInput-root": {
                      "&:hover fieldset": { borderColor: "#FF80DD" },
                      "&.Mui-focused fieldset": {
                        borderColor: "#FF80DD",
                        borderWidth: 2,
                      },
                    },
                    "& .MuiInputBase-input": {
                      fontSize: { xs: "0.875rem", md: "1rem" },
                    },
                  }}
                  error={!!errors[item.key]}
                  helperText={errors[item.key]}
                  InputLabelProps={item.isDateInput ? { shrink: true } : {}}
                  inputProps={
                    item.isDateInput
                      ? {
                          max: new Date().toISOString().split("T")[0],
                          min: new Date(
                            new Date().setFullYear(
                              new Date().getFullYear() - 100
                            )
                          )
                            .toISOString()
                            .split("T")[0],
                        }
                      : {}
                  }
                />
              )}
            </Box>
          ))}

          <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
            <Button
              variant="contained"
              onClick={handleSave}
              sx={{
                backgroundColor: "#FF80DD",
                color: "#ffffff",
                borderRadius: 2,
                px: 3,
                py: 0.5,
                boxShadow: "0px 4px 12px rgba(255, 128, 221, 0.4)",
                "&:hover": {
                  backgroundColor: "#ff66cc",
                  boxShadow: "0px 6px 16px rgba(255, 128, 221, 0.5)",
                },
                "&:disabled": {
                  backgroundColor: "#ffb3e6",
                  color: "#ffffff",
                },
                fontSize: { xs: "0.875rem", md: "1rem" },
              }}
              disabled={Object.values(errors).some((error) => error)}
            >
              Save Changes
            </Button>
          </Box>
        </Box>
      )}

      {/* Map Dialog */}
      <Dialog
        open={openMapModal}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
        sx={{
          "& .MuiDialog-paper": {
            backgroundColor: "#FFEBF1",
            borderRadius: 4,
            boxShadow: "0px 12px 40px rgba(0,0,0,0.15)",
          },
        }}
      >
        <DialogTitle sx={{ color: "#0e0f0f", fontWeight: "bold" }}>
          Select Location
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <StyledTextField
            inputRef={searchInputRef}
            label="Your Location"
            variant="outlined"
            fullWidth
            placeholder="Search for any place (e.g., college, shop, park)"
            onChange={handleSearchChange}
            sx={{ mb: 2 }}
          />
          {searchResults.length > 0 && (
            <Box
              sx={{
                maxHeight: "150px",
                overflowY: "auto",
                mb: 2,
                backgroundColor: "#fff5f8",
                borderRadius: 2,
                p: 1,
              }}
            >
              {searchResults.map((place) => (
                <Box
                  key={place.place_id}
                  sx={{
                    p: 1,
                    borderBottom: "1px solid #ffe6f0",
                    cursor: "pointer",
                    color: "#0e0f0f",
                    borderRadius: 1,
                    "&:hover": { backgroundColor: "#ffe6f0" },
                  }}
                  onClick={() => handleSearchSelect(place)}
                >
                  <Typography variant="body2">{place.display_name}</Typography>
                </Box>
              ))}
            </Box>
          )}
          <Box
            sx={{
              height: "400px",
              width: "100%",
              mb: 2,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={handleCloseModal}
            disabled={isLoading}
            sx={{
              color: "#FF80DD",
              borderRadius: 2,
              "&:hover": { backgroundColor: "#ffe6f0" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmLocation}
            disabled={isLoading || !selectedLocation}
            sx={{
              backgroundColor: "#FF80DD",
              color: "#ffffff",
              borderRadius: 2,
              px: 3,
              py: 1,
              boxShadow: "0px 4px 12px rgba(255, 128, 221, 0.4)",
              "&:hover": {
                backgroundColor: "#ff66cc",
                boxShadow: "0px 6px 16px rgba(255, 128, 221, 0.5)",
              },
              "&:disabled": {
                backgroundColor: "#ffb3e6",
                color: "#ffffff",
              },
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SpProfile;
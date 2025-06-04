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
      ); // Default to New York
      L.tileLayer(
        "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
        {}
      ).addTo(mapInstanceRef.current);

      // Try to get current location or use existing coordinates
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

    if (name === "gender") {
      error = value ? "" : "Gender is required";
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

    // Prepare update data
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
        justifyContent: "center",
        alignItems: "center", // Center vertically
        background: "#fad9e3",
        height: "auto", // Your existing height setting
        width: { xs: "100%", 2560: "fit-content" }, // Your existing width
        maxWidth: { 2560: 700 }, // Your existing maxWidth
        minHeight: { xs: "100vh", 2560: "100vh" }, // Full viewport height for centering
        paddingBottom: "30px",
        paddingTop: "30px",
      }}
    >
      <Card
        sx={{
          width: "90%",
          maxWidth: 600,
          backgroundColor: "#FFEBF1",
          boxShadow: "0px 12px 40px rgba(0,0,0,0.15)",
          borderRadius: 6,
          transform: "rotateX(3deg)",
          transition: "transform 0.3s ease, box-shadow 0.3s ease",
          "&:hover": {
            transform: "rotateX(0deg) scale(1.02)",
            boxShadow: "0px 16px 48px rgba(0,0,0,0.2)",
          },
          border: "1px solid rgba(255, 128, 221, 0.3)",
        }}
      >
        <CardContent sx={{ textAlign: "center", p: 4 }}>
          <Typography
            variant="h5"
            gutterBottom
            fontWeight="bold"
            sx={{ color: "#0e0f0f", mb: 3 }}
          >
            Service Provider Profile
          </Typography>

          {[
            { label: "Name", key: "name" },
            { label: "Email", key: "email" },
            { label: "Gender", key: "gender", isSelect: true },
            { label: "Phone", key: "phone" },
            { label: "Date of Birth", key: "dob", isDateInput: true },
            { label: "Shop Name", key: "shopName" },
            { label: "Location", key: "location", isLocation: true },
            { label: "Shop Address", key: "spAddress" },
            { label: "Opening Time", key: "fromTime", isTime: true },
            { label: "Closing Time", key: "toTime", isTime: true },
            { label: "Designation", key: "designation", disabled: true },
            { label: "Rating", key: "spRating", disabled: true },
            { label: "Password", key: "password", isPassword: true },
            ...(editMode
              ? [
                  {
                    label: "Confirm Password",
                    key: "confirmPassword",
                    isPassword: true,
                    isConfirmPassword: true,
                  },
                ]
              : []),
          ].map((item) => (
            <Box
              key={item.key}
              sx={{
                display: { xs: "block", md: "flex" },
                alignItems: "center",
                justifyContent: "space-between",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                p: 1,
                borderRadius: 2,
                transition: "background-color 0.3s ease",
                "&:hover": {
                  backgroundColor: "rgba(255, 255, 255, 0.2)",
                },
              }}
            >
              <Typography
                fontWeight="600"
                sx={{
                  flex: { md: "0 0 150px" },
                  textAlign: { md: "left" },
                  color: "#0e0f0f",
                }}
              >
                {item.label}:
              </Typography>
              {editMode && !item.disabled ? (
                item.isPassword ? (
                  <Box
                    sx={{
                      position: "relative",
                      display: "inline-block",
                      flex: 1,
                    }}
                  >
                    <TextField
                      variant="outlined"
                      size="small"
                      type={
                        item.isConfirmPassword
                          ? showConfirmPassword
                            ? "text"
                            : "password"
                          : showPassword
                          ? "text"
                          : "password"
                      }
                      name={item.key}
                      value={formData[item.key] || ""}
                      onChange={handleChange}
                      placeholder={
                        item.isConfirmPassword
                          ? "Confirm new password"
                          : "Enter new password"
                      }
                      fullWidth
                      error={!!errors[item.key]}
                      helperText={errors[item.key]}
                      sx={{
                        backgroundColor: "#fff5f8",
                        borderRadius: 2,
                        "& .MuiOutlinedInput-root": {
                          "&:hover fieldset": { borderColor: "#FF80DD" },
                          "&.Mui-focused fieldset": {
                            borderColor: "#FF80DD",
                            borderWidth: 2,
                          },
                        },
                      }}
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() =>
                                item.isConfirmPassword
                                  ? setShowConfirmPassword(!showConfirmPassword)
                                  : setShowPassword(!showPassword)
                              }
                              sx={{ color: "#FF80DD" }}
                            >
                              {(
                                item.isConfirmPassword
                                  ? showConfirmPassword
                                  : showPassword
                              ) ? (
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
                    value={formData[item.key] || ""}
                    onChange={handleChange}
                    fullWidth
                    sx={{
                      flex: 1,
                      backgroundColor: "#fff5f8",
                      borderRadius: 2,
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": { borderColor: "#FF80DD" },
                        "&.Mui-focused fieldset": {
                          borderColor: "#FF80DD",
                          borderWidth: 2,
                        },
                      },
                    }}
                    error={!!errors[item.key]}
                    helperText={errors[item.key]}
                  >
                    <MenuItem value="Male">Male</MenuItem>
                    <MenuItem value="Female">Female</MenuItem>
                    <MenuItem value="Others">Others</MenuItem>
                  </TextField>
                ) : item.isTime ? (
                  <TextField
                    variant="outlined"
                    size="small"
                    type="time"
                    name={item.key}
                    value={formData[item.key] || ""}
                    onChange={handleChange}
                    fullWidth
                    sx={{
                      flex: 1,
                      backgroundColor: "#fff5f8",
                      borderRadius: 2,
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": { borderColor: "#FF80DD" },
                        "&.Mui-focused fieldset": {
                          borderColor: "#FF80DD",
                          borderWidth: 2,
                        },
                      },
                    }}
                    error={!!errors[item.key]}
                    helperText={errors[item.key]}
                    InputLabelProps={{ shrink: true }}
                  />
                ) : item.isLocation ? (
                  <Box sx={{ display: "flex", gap: 1, flex: 1 }}>
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
                        backgroundColor: "#fff5f8",
                        borderRadius: 2,
                        "& .MuiOutlinedInput-root": {
                          "&:hover fieldset": { borderColor: "#FF80DD" },
                          "&.Mui-focused fieldset": {
                            borderColor: "#FF80DD",
                            borderWidth: 2,
                          },
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
                      flex: 1,
                      backgroundColor: "#fff5f8",
                      borderRadius: 2,
                      "& .MuiOutlinedInput-root": {
                        "&:hover fieldset": { borderColor: "#FF80DD" },
                        "&.Mui-focused fieldset": {
                          borderColor: "#FF80DD",
                          borderWidth: 2,
                        },
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
                )
              ) : (
                <Typography
                  sx={{ flex: 1, textAlign: { md: "left" }, color: "#0e0f0f" }}
                >
                  {item.isPassword
                    ? "********"
                    : item.key === "dob"
                    ? formatDate(serviceProvider[item.key])
                    : item.key === "fromTime" || item.key === "toTime"
                    ? serviceProvider.availableTime?.[item.key] ||
                      "Not specified"
                    : serviceProvider[item.key] || "Not specified"}
                </Typography>
              )}
            </Box>
          ))}

          <Box
            sx={{ mt: 4, display: "flex", justifyContent: "center", gap: 2 }}
          >
            {editMode ? (
              <Button
                variant="contained"
                color="success"
                onClick={handleSave}
                sx={{
                  px: 4,
                  py: 1,
                  borderRadius: 2,
                  backgroundColor: "#FF80DD",
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
                disabled={Object.values(errors).some((error) => error)}
              >
                Save
              </Button>
            ) : (
              <Button
                variant="contained"
                color="primary"
                onClick={handleEdit}
                sx={{
                  px: 4,
                  py: 1,
                  borderRadius: 2,
                  backgroundColor: "#FF80DD",
                  boxShadow: "0px 4px 12px rgba(255, 128, 221, 0.4)",
                  "&:hover": {
                    backgroundColor: "#ff66cc",
                    boxShadow: "0px 6px 16px rgba(255, 128, 221, 0.5)",
                  },
                }}
              >
                Edit
              </Button>
            )}
          </Box>
        </CardContent>
      </Card>

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

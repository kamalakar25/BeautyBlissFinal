import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  TextField,
  MenuItem,
  Button,
  Box,
  Typography,
  Link as MuiLink,
  IconButton,
  InputAdornment,
  useMediaQuery,
  useTheme,
  keyframes,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  styled,
} from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import PhoneOutlinedIcon from "@mui/icons-material/PhoneOutlined";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import StoreOutlinedIcon from "@mui/icons-material/StoreOutlined";
import LocationOnOutlinedIcon from "@mui/icons-material/LocationOnOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import MedicalInformationOutlinedIcon from "@mui/icons-material/MedicalInformationOutlined";
import TransgenderOutlinedIcon from "@mui/icons-material/TransgenderOutlined";
import WorkOutlineIcon from "@mui/icons-material/WorkOutline";
import L from "leaflet";
import axios from "axios";

const BASE_URL = "https://api.example.com"; // Replace with actual API URL

const customIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const containerVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: "easeOut" },
  },
};

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.3 } },
  tap: { scale: 0.95 },
};

const StyledTextField = styled(TextField)(({ theme }) => ({
  "& .MuiInputBase-root": {
    borderRadius: "25px",
    border: "1px solid #f35271",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    transition: "all 0.3s ease",
    boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
    "&:hover": {
      backgroundColor: "rgba(255, 255, 255, 1)",
    },
  },
  "& .MuiInputBase-input": {
    color: "#1a202c",
    padding: "14px 16px",
  },
  "& .MuiInputLabel-root": {
    color: "#4a5568",
    "&.Mui-focused": { color: "#d53f8c" },
    "&.MuiFormLabel-filled": { color: "#4a5568" },
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#f35271",
      borderWidth: "1px",
    },
    "&:hover fieldset": {
      borderColor: "#d53f8c",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#d53f8c",
      borderWidth: "1px",
    },
  },
}));

function SignupForm() {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const isSmallScreen = useMediaQuery("(max-width:600px)");
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [openMapModal, setOpenMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [nearbyPlaces, setNearbyPlaces] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);

  const [form, setForm] = useState({
    name: "",
    email: "",
    gender: "",
    phone: "",
    dob: "",
    designation: "",
    password: "",
    confirmPassword: "",
    shopName: "",
    location: "",
    coordinates: { latitude: null, longitude: null },
    displayAddress: "",
    spAddress: "",
    manPower: [],
    services: [],
    fromTime: "",
    toTime: "",
    emergencyContact: "",
    allergies: "",
  });

  const [errors, setErrors] = useState({});
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    setIsAdvanced(form.designation !== "User");
  }, [form.designation]);

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

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            mapInstanceRef.current.setView([latitude, longitude], 15);
            setSelectedLocation({ lat: latitude, lng: longitude });
            if (markerRef.current) {
              markerRef.current.setLatLng([latitude, longitude]);
            } else {
              markerRef.current = L.marker([latitude, longitude], {
                icon: customIcon,
              }).addTo(mapInstanceRef.current);
            }
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
      setSearchResults([]);
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
      setForm((prev) => ({
        ...prev,
        location: `Lat: ${selectedLocation.lat.toFixed(
          6
        )}, Lon: ${selectedLocation.lng.toFixed(6)}`,
        coordinates: {
          latitude: selectedLocation.lat,
          longitude: selectedLocation.lng,
        },
        displayAddress: selectedLocation.address || address,
        spAddress: selectedLocation.address || address,
      }));
      setErrors((prev) => ({ ...prev, location: "", spAddress: "" }));
    } catch (error) {
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
      ...(name === "fromTime" && form.toTime
        ? { toTime: validateField("toTime", form.toTime) }
        : name === "toTime" && form.fromTime
        ? { fromTime: validateField("fromTime", form.fromTime) }
        : {}),
    }));
  };

  const handleSubmit = async () => {
    const newErrors = {};
    Object.keys(form).forEach((key) => {
      const error = validateField(key, form[key]);
      if (error) newErrors[key] = error;
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      alert("Please fill in all the fields.");
      return;
    }

    const payload =
      form.designation.toLowerCase() === "user"
        ? {
            name: form.name,
            email: form.email,
            gender: form.gender,
            phone: form.phone,
            dob: form.dob,
            designation: form.designation,
            password: form.password,
            emergencyContact: form.emergencyContact,
            allergies: form.allergies,
            bookings: [],
          }
        : {
            name: form.name,
            email: form.email,
            password: form.password,
            gender: form.gender,
            dob: form.dob,
            phone: form.phone,
            designation: form.designation,
            shopName: form.shopName,
            location: form.location,
            spAddress: form.spAddress,
            coordinates: form.coordinates,
            manPower: form.manPower || [],
            services: form.services || [],
            availableTime: { fromTime: form.fromTime, toTime: form.toTime },
          };

    const endpoint =
      form.designation.toLowerCase() === "user"
        ? `${BASE_URL}/api/users/register`
        : `${BASE_URL}/api/admin/register-admin`;

    try {
      setIsLoading(true);
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        alert(`${form.designation} ${data.message}`);
        navigate("/login");
      } else {
        alert(data.error || "Registration failed");
      }
    } catch (error) {
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateField = (name, value) => {
    let error = "";

    if (name === "name") {
      const isValid =
        /^[a-zA-Z]+[a-zA-Z\s]*[a-zA-Z]$/.test(value) &&
        value.length >= 2 &&
        value.length <= 50;
      error = value
        ? isValid
          ? ""
          : "Name must be 2-50 characters, letters only, spaces allowed in middle but not at start or end"
        : "Name is required";
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
            ? "Phone number must be 10 digits"
            : "Phone number must start with 6, 7, 8, or 9";
      }
    }

    if (
      name === "emergencyContact" &&
      form.designation.toLowerCase() === "user"
    ) {
      const cleanedValue = value.replace(/\s/g, "");
      if (cleanedValue === "") {
        error = "Emergency contact number is required";
      } else if (!/^[6-9]\d{9}$/.test(cleanedValue)) {
        error =
          cleanedValue.length !== 10
            ? "Emergency contact number must be 10 digits"
            : "Emergency contact number must start with 6, 7, 8, or 9";
      } else if (cleanedValue === form.phone.replace(/\s/g, "")) {
        error =
          "Emergency contact number cannot be the same as your phone number";
      }
    }

    if (name === "allergies" && form.designation.toLowerCase() === "user") {
      const trimmedValue = value.trim();
      if (trimmedValue === "") {
        error = 'Allergies are required. If none, please enter "No"';
      } else if (trimmedValue.length > 200) {
        error = "Allergies description must not exceed 200 characters";
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

    if (name === "password") {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      error = value
        ? passwordRegex.test(value)
          ? ""
          : "Password must be at least 8 characters, with an uppercase letter, lowercase letter, number, and special character (@$!%*?&)"
        : "Password is required";
    }

    if (name === "confirmPassword") {
      const passwordRegex =
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      if (!value) {
        error = "Confirm password is required";
      } else if (!passwordRegex.test(value)) {
        error =
          "Password must be at least 8 characters, with an uppercase letter, lowercase letter, number, and special character (@$!%*?&)";
      } else if (value !== form.password) {
        error = "Passwords do not match";
      }
    }

    if (name === "shopName" && isAdvanced) {
      const isValid =
        /^[a-zA-Z]+[a-zAZ\s]*[a-zA-Z]$/.test(value) &&
        value.length >= 2 &&
        value.length <= 50;
      error = value
        ? isValid
          ? ""
          : "Shop Name must be 2-50 characters, letters only, spaces allowed in middle but not at start or end"
        : "Shop Name is required";
    }

    if (name === "location" && isAdvanced) {
      error = value ? "" : "Location is required";
    }

    if (name === "spAddress" && isAdvanced) {
      error = value ? "" : "Shop address is required";
    }

    if (name === "fromTime" && isAdvanced) {
      if (!value) {
        error = "Shop opening time is required";
      } else if (form.toTime) {
        const [fromHours, fromMinutes] = value.split(":").map(Number);
        const [toHours, toMinutes] = form.toTime.split(":").map(Number);
        const fromTimeInMinutes = fromHours * 60 + fromMinutes;
        const toTimeInMinutes = toHours * 60 + toMinutes;
        if (toTimeInMinutes <= fromTimeInMinutes + 60) {
          error = "Closing time must be at least 1 hour after opening time";
        }
      }
    }

    if (name === "toTime" && isAdvanced) {
      if (!value) {
        error = "Shop closing time is required";
      } else if (form.fromTime) {
        const [fromHours, fromMinutes] = form.fromTime.split(":").map(Number);
        const [toHours, toMinutes] = value.split(":").map(Number);
        const fromTimeInMinutes = fromHours * 60 + fromMinutes;
        const toTimeInMinutes = toHours * 60 + toMinutes;
        if (toTimeInMinutes <= fromTimeInMinutes + 60) {
          error = "Shop must be open for at least 1 hour";
        }
      }
    }

    return error;
  };

  const handleFieldChange = (e) => {
    const { name, value } = e.target;
    let newValue = value;

    if (name === "name" || name === "shopName") {
      newValue = value.replace(/[^a-zA-Z\s]/g, "");
      if (newValue.startsWith(" ")) {
        newValue = newValue.trimStart();
      }
    }

    if (name === "phone" || name === "emergencyContact") {
      newValue = value.replace(/\D/g, "").slice(0, 10);
    }

    setForm((prev) => ({ ...prev, [name]: newValue }));
    const error = validateField(name, newValue);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    const error = validateField(name, value);
    setErrors((prev) => ({ ...prev, [name]: error }));
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  const inputSx = {
    mb: 1.5,
    "& .MuiInputBase-root": {
      borderRadius: "25px",
      backgroundColor: "rgba(255, 255, 255, 0.9)",
      color: "#1a202c",
      height: "52px",
      fontSize: "1rem",
      padding: "0 16px",
      paddingLeft: "40px",
      transition: "all 0.3s ease",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
      "&:hover": {
        backgroundColor: "rgba(255, 255, 255, 1)",
      },
    },
    "& .MuiInputBase-input": {
      color: "#1a202c",
      fontWeight: 500,
    },
    "& .MuiInputBase-input.Mui-disabled": {
      color: "#4a5568",
      WebkitTextFillColor: "#4a5568",
      opacity: 0.7,
    },
    "& .MuiInputBase-input::placeholder": {
      color: "#718096",
      opacity: 1,
    },
    "& .MuiInputLabel-root": {
      color: "#4a5568",
      fontSize: "1.1rem",
      fontWeight: 600,
      transform: "translate(40px, 16px) scale(1)",
      "&.Mui-focused": {
        color: "#d53f8c",
        transform: "translate(14px, -9px) scale(0.75)",
      },
      "&.MuiFormLabel-filled": {
        transform: "translate(14px, -9px) scale(0.75)",
      },
      "&.MuiInputLabel-shrink": {
        transform: "translate(14px, -9px) scale(0.75)",
      },
    },
    "& .MuiOutlinedInput-root": {
      "& fieldset": {
        borderColor: "#f35271",
        borderWidth: "1px",
        borderRadius: "25px",
      },
      "&:hover fieldset": {
        borderColor: "#d53f8c",
      },
      "&.Mui-focused fieldset": {
        borderColor: "#d53f8c",
        borderWidth: "1px",
      },
    },
    "& .MuiFormHelperText-root": {
      color: "#e53e3e",
      marginLeft: "16px",
      fontWeight: 600,
      fontSize: "0.9rem",
    },
    "& .MuiInputAdornment-root": {
      position: "absolute",
      left: "12px",
    },
  };

  const childVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

  const buttonSx = {
    height: 52,
    borderRadius: "25px",
    background: "linear-gradient(90deg, #ec4899 0%, #f56565 100%)",
    color: "#ffffff",
    fontSize: "1.1rem",
    fontWeight: 700,
    textTransform: "none",
    transition: "all 0.3s ease",
    boxShadow: "0 4px 12px rgba(236, 72, 153, 0.3)",
    "&:hover": {
      background: "linear-gradient(90deg, #d53f8c 0%, #e53e3e 100%)",
      boxShadow: "0 6px 16px rgba(236, 72, 153, 0.5)",
      transform: "scale(1.02)",
    },
    "&:disabled": {
      background: "#e2e8f0",
      color: "#a0aec0",
      boxShadow: "none",
    },
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "linear-gradient(135deg, #ffe6e9 0%, #ffd1d6 100%)",
        padding: { xs: 3, sm: 4 },
        pt: { xs: "80px", sm: "100px" },
        overflow: "auto",
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <Box
          component="form"
          sx={{
            display: "flex",
            flexDirection: "column",
            gap: 1,
            width: { xs: "100%", sm: "480px" },
            maxWidth: "520px",
            animation: `${fadeIn} 0.6s ease-out`,
          }}
        >
          <motion.div variants={childVariants}>
            <Box>
              <Typography
                variant="h6"
                sx={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 600,
                  fontSize: { xs: "1.3rem", sm: "1.5rem" },
                  color: "#333333",
                }}
              >
                Create an Account
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  fontFamily: "Poppins, sans-serif",
                  fontWeight: 300,
                  fontSize: { xs: "1.1rem", sm: "1.2rem" },
                  color: "#666666",
                  mt: "4px",
                  mb: "5px"
                }}
              >
                Signup Here
              </Typography>
            </Box>
          </motion.div>

          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            name="name"
            value={form.name}
            onChange={handleFieldChange}
            onBlur={handleBlur}
            error={!!errors.name}
            helperText={errors.name}
            disabled={isLoading}
            autoComplete="off"
            sx={inputSx}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonOutlineIcon sx={{ color: "#4a5568" }} />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              shrink: true,
            }}
          />

          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            name="email"
            value={form.email}
            onChange={handleFieldChange}
            onBlur={handleBlur}
            error={!!errors.email}
            helperText={errors.email}
            disabled={isLoading}
            autoComplete="off"
            sx={inputSx}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailOutlinedIcon sx={{ color: "#4a5568" }} />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              shrink: true,
            }}
          />

          <TextField
            select
            variant="outlined"
            fullWidth
            label="Gender"
            name="gender"
            value={form.gender}
            onChange={handleChange}
            disabled={isLoading}
            sx={inputSx}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <TransgenderOutlinedIcon sx={{ color: "#4a5568" }} />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              shrink: true,
            }}
          >
            <MenuItem value="Male">Male</MenuItem>
            <MenuItem value="Female">Female</MenuItem>
            <MenuItem value="Other">Other</MenuItem>
          </TextField>

          <TextField
            label="Phone Number"
            variant="outlined"
            fullWidth
            name="phone"
            value={form.phone}
            onChange={handleFieldChange}
            onBlur={handleBlur}
            error={!!errors.phone}
            helperText={errors.phone}
            disabled={isLoading}
            inputProps={{ maxLength: 10 }}
            autoComplete="off"
            sx={inputSx}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PhoneOutlinedIcon sx={{ color: "#4a5568" }} />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              shrink: true,
            }}
          />

          <TextField
            label="Date of Birth"
            type="date"
            variant="outlined"
            fullWidth
            name="dob"
            value={form.dob}
            onChange={handleFieldChange}
            onBlur={handleBlur}
            error={!!errors.dob}
            helperText={errors.dob}
            disabled={isLoading}
            InputLabelProps={{
              shrink: true,
              style: { color: form.dob ? "#4a5568" : "#4a5568" },
            }}
            inputProps={{
              max: new Date().toISOString().split("T")[0],
              min: new Date(
                new Date().setFullYear(new Date().getFullYear() - 100)
              )
                .toISOString()
                .split("T")[0],
            }}
            autoComplete="off"
            sx={{
              ...inputSx,
              "& .MuiInputLabel-root": {
                transform: "translate(40px, 16px) scale(1)",
                "&.Mui-focused": {
                  transform: "translate(14px, -9px) scale(0.75)",
                },
                "&.MuiInputLabel-shrink": {
                  transform: "translate(14px, -9px) scale(0.75)",
                },
              },
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CalendarTodayOutlinedIcon sx={{ color: "#4a5568" }} />
                </InputAdornment>
              ),
            }}
          />

          <TextField
            select
            variant="outlined"
            fullWidth
            label="Designation"
            name="designation"
            value={form.designation}
            onChange={handleChange}
            disabled={isLoading}
            sx={inputSx}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <WorkOutlineIcon sx={{ color: "#4a5568" }} />
                </InputAdornment>
              ),
            }}
            InputLabelProps={{
              shrink: true,
            }}
          >
            <MenuItem value="User">User</MenuItem>
            <MenuItem value="Salon">Salon</MenuItem>
            <MenuItem value="Beauty_Parler">Beauty Parlor</MenuItem>
            <MenuItem value="Doctor">Doctor</MenuItem>
          </TextField>

          {form.designation.toLowerCase() === "user" && (
            <>
              <TextField
                label="Emergency Contact Number"
                variant="outlined"
                fullWidth
                name="emergencyContact"
                value={form.emergencyContact}
                onChange={handleFieldChange}
                onBlur={handleBlur}
                error={!!errors.emergencyContact}
                helperText={errors.emergencyContact}
                disabled={isLoading}
                inputProps={{ maxLength: 10 }}
                autoComplete="off"
                sx={inputSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PhoneOutlinedIcon sx={{ color: "#4a5568" }} />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <TextField
                label="Allergies (Enter 'No' if none)"
                variant="outlined"
                fullWidth
                name="allergies"
                value={form.allergies}
                onChange={handleFieldChange}
                onBlur={handleBlur}
                error={!!errors.allergies}
                helperText={errors.allergies}
                disabled={isLoading}
                autoComplete="off"
                sx={inputSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <MedicalInformationOutlinedIcon
                        sx={{ color: "#4a5568" }}
                      />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </>
          )}

          {isAdvanced && (
            <>
              <TextField
                label="Shop Name"
                variant="outlined"
                fullWidth
                name="shopName"
                value={form.shopName}
                onChange={handleFieldChange}
                onBlur={handleBlur}
                error={!!errors.shopName}
                helperText={errors.shopName}
                disabled={isLoading}
                autoComplete="off"
                sx={inputSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <StoreOutlinedIcon sx={{ color: "#4a5568" }} />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <Box
                sx={{
                  display: "flex",
                  gap: 1,
                  mb: 1,
                  alignItems: "center",
                  flexDirection: { xs: "column", sm: "row" },
                }}
              >
                <TextField
                  label="Shop Address"
                  variant="outlined"
                  fullWidth
                  name="spAddress"
                  value={form.spAddress}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.spAddress}
                  helperText={errors.spAddress}
                  disabled={true}
                  autoComplete="off"
                  sx={inputSx}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationOnOutlinedIcon sx={{ color: "#4a5568" }} />
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <motion.div
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <Button
                    variant="outlined"
                    onClick={handleGetLocation}
                    disabled={isLoading}
                    sx={{
                      height: 52,
                      borderRadius: "25px",
                      borderColor: "#d53f8c",
                      color: "#d53f8c",
                      fontSize: "0.9rem",
                      fontWeight: 600,
                      textTransform: "none",
                      transition: "all 0.3s ease",
                      width: { xs: "100%", sm: "auto" },
                      "&:hover": {
                        borderColor: "#b83280",
                        backgroundColor: "rgba(213, 63, 140, 0.1)",
                        color: "#b83280",
                      },
                    }}
                  >
                    Select Location
                  </Button>
                </motion.div>
              </Box>

              {form.coordinates.latitude && form.coordinates.longitude && (
                <Box sx={{ mb: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#4a5568",
                      mb: 1,
                      fontWeight: 600,
                      fontSize: "0.95rem",
                    }}
                  >
                    Coordinates: {form.location}
                  </Typography>
                  <MuiLink
                    href={`https://www.openstreetmap.org/?mlat=${form.coordinates.latitude}&mlon=${form.coordinates.longitude}`}
                    target="_blank"
                    rel="noopener"
                    underline="hover"
                    sx={{
                      color: "#d53f8c",
                      fontWeight: 600,
                      fontSize: "0.95rem",
                      "&:hover": { color: "#b83280" },
                    }}
                  >
                    View on OpenStreetMap
                  </MuiLink>
                </Box>
              )}

              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  gap: 1,
                  mb: 1,
                }}
              >
                <TextField
                  label="Opening Time"
                  type="time"
                  variant="outlined"
                  fullWidth
                  name="fromTime"
                  value={form.fromTime}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.fromTime}
                  helperText={errors.fromTime}
                  disabled={isLoading}
                  InputLabelProps={{
                    shrink: true,
                    style: { color: form.fromTime ? "#4a5568" : "#4a5568" },
                  }}
                  autoComplete="off"
                  sx={{
                    ...inputSx,
                    "& .MuiInputLabel-root": {
                      transform: "translate(40px, 16px) scale(1)",
                      "&.Mui-focused": {
                        transform: "translate(14px, -9px) scale(0.75)",
                      },
                      "&.MuiInputLabel-shrink": {
                        transform: "translate(14px, -9px) scale(0.75)",
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeOutlinedIcon sx={{ color: "#4a5568" }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  label="Closing Time"
                  type="time"
                  variant="outlined"
                  fullWidth
                  name="toTime"
                  value={form.toTime}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={!!errors.toTime}
                  helperText={errors.toTime}
                  disabled={isLoading}
                  InputLabelProps={{
                    shrink: true,
                    style: { color: form.toTime ? "#4a5568" : "#4a5568" },
                  }}
                  autoComplete="off"
                  sx={{
                    ...inputSx,
                    "& .MuiInputLabel-root": {
                      transform: "translate(40px, 16px) scale(1)",
                      "&.Mui-focused": {
                        transform: "translate(14px, -9px) scale(0.75)",
                      },
                      "&.MuiInputLabel-shrink": {
                        transform: "translate(14px, -9px) scale(0.75)",
                      },
                    },
                  }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <AccessTimeOutlinedIcon sx={{ color: "#4a5568" }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
            </>
          )}

          {(form.designation === "User" || isAdvanced) && (
            <>
              <TextField
                label="Password"
                type={showPassword ? "text" : "password"}
                variant="outlined"
                fullWidth
                name="password"
                value={form.password}
                onChange={handleFieldChange}
                onBlur={handleBlur}
                error={!!errors.password}
                helperText={errors.password}
                disabled={isLoading}
                autoComplete="new-password"
                sx={inputSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Visibility sx={{ color: "#4a5568" }} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      {/* <IconButton
                        onClick={togglePasswordVisibility}
                        edge="end"
                        disabled={isLoading}
                        sx={{ color: "#4a5568" }}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton> */}
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />

              <TextField
                label="Confirm Password"
                type="password"
                variant="outlined"
                fullWidth
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleFieldChange}
                onBlur={handleBlur}
                error={!!errors.confirmPassword}
                helperText={errors.confirmPassword}
                disabled={isLoading}
                autoComplete="new-password"
                sx={inputSx}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Visibility sx={{ color: "#4a5568" }} />
                    </InputAdornment>
                  ),
                }}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </>
          )}

          <motion.div
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={isLoading}
              fullWidth
              sx={buttonSx}
            >
              {isLoading ? "Joining..." : "Sign In"}
            </Button>
          </motion.div>

          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <MuiLink
              component={Link}
              to="/login"
              underline="none"
              sx={{
                fontSize: "1rem",
                color: "#4a5568",
                fontWeight: 600,
                "&:hover": { color: "#d53f8c" },
                textShadow: "0 1px 2px rgba(0, 0, 0, 0.05)",
              }}
            >
              Already have an account? <strong>Log In</strong>
            </MuiLink>
          </Box>
        </Box>
      </motion.div>

      <Dialog
        open={openMapModal}
        onClose={handleCloseModal}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle
          sx={{ color: "#1a202c", fontWeight: 700, fontSize: "1.25rem" }}
        >
          Select Location
        </DialogTitle>
        <DialogContent>
          <StyledTextField
            inputRef={searchInputRef}
            label="Search Location"
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
                border: "1px solid #e2e8f0",
                borderRadius: "12px",
              }}
            >
              {searchResults.map((place) => (
                <Box
                  key={place.place_id}
                  sx={{
                    p: 1.5,
                    borderBottom: "1px solid #e2e8f0",
                    cursor: "pointer",
                    color: "#1a202c",
                    "&:hover": { backgroundColor: "rgba(213, 63, 140, 0.1)" },
                  }}
                  onClick={() => handleSearchSelect(place)}
                >
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 500, fontSize: "0.95rem" }}
                  >
                    {place.display_name}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
          <Box
            sx={{
              height: "400px",
              width: "100%",
              mb: 2,
              borderRadius: "12px",
              overflow: "hidden",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
            }}
          >
            <div ref={mapRef} style={{ height: "100%", width: "100%" }} />
          </Box>
        </DialogContent>
        <DialogActions>
          at FlowParserMixin.parseBlock
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:12961:10)
          at FlowParserMixin.parseStatementContent
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:12522:21)
          at FlowParserMixin.parseStatementLike
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:12432:17)
          at FlowParserMixin.parseStatementLike
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:5153:24)
          at FlowParserMixin.parseStatementOrSloppyAnnexBFunctionDeclaration
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:12422:17)
          at FlowParserMixin.parseIfStatement
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:12794:28)
          at FlowParserMixin.parseStatementContent
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:12461:21)
          at FlowParserMixin.parseStatementLike
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:12432:17)
          at FlowParserMixin.parseStatementLike
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:5153:24)
          at FlowParserMixin.parseStatementListItem
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:12412:17)
          at FlowParserMixin.parseBlockOrModuleBlockBody
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:12980:61)
          at FlowParserMixin.parseBlockBody
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:12973:10)
          at FlowParserMixin.parseBlock
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:12961:10)
          at FlowParserMixin.parseStatementContent
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:12522:21)
          at FlowParserMixin.parseStatementLike
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:12432:17)
          at FlowParserMixin.parseStatementLike
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:5153:24)
          at FlowParserMixin.parseStatementOrSloppyAnnexBFunctionDeclaration
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:12422:17)
          at FlowParserMixin.parseIfStatement
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:12794:28)
          at FlowParserMixin.parseStatementContent
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:12461:21)
          at FlowParserMixin.parseStatementLike
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:12432:17)
          at FlowParserMixin.parseStatementLike
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:5153:24)
          at FlowParserMixin.parseStatementListItem
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:12412:17)
          at FlowParserMixin.parseBlockOrModuleBlockBody
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:12980:61)
          at FlowParserMixin.parseBlockBody
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:12973:10)
          at FlowParserMixin.parseBlock
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:12961:10)
          at FlowParserMixin.parseFunctionBody
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:11810:24)
          at
          D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:5127:63
          at FlowParserMixin.forwardNoArrowParamsConversionAt
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:5303:16)
          at FlowParserMixin.parseFunctionBody
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:5127:12)
          at FlowParserMixin.parseArrowExpression
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:11785:10)
          at FlowParserMixin.parseParenAndDistinguishExpression
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:11398:12)
          at FlowParserMixin.parseParenAndDistinguishExpression
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:5828:18)
          at FlowParserMixin.parseExprAtom
          (D:\beauti\BeautyBliss-project-main\frontend\node_modules\@babel\parser\lib\index.js:11033:23)
          ERROR in [eslint] src\Components\signup.js Line 437:21: Parsing error:
          Unexpected token, expected ")" (437:21) webpack compiled with 2 errors
          and 1 warning
          <Button
            onClick={handleCloseModal}
            disabled={isLoading}
            sx={{
              color: "#4a5568",
              fontWeight: 600,
              fontSize: "0.95rem",
              "&:hover": { color: "#e53e3e" },
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmLocation}
            disabled={isLoading || !selectedLocation}
            sx={{
              color: "#d53f8c",
              fontWeight: 600,
              fontSize: "0.95rem",
              "&:hover": { color: "#b83280" },
            }}
          >
            Confirm
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default SignupForm;

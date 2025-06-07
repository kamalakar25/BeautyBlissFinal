import React, { useState, useEffect, useRef } from "react";
import {
  Container,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  IconButton,
  Modal,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
  Typography,
  Button,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import axios from "axios";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import FilterListIcon from "@mui/icons-material/FilterList";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import { motion } from "framer-motion";

const BASE_URL = process.env.REACT_APP_API_URL;
const PLACEHOLDER_IMAGE = "https://via.placeholder.com/70?text=No+Image";

// Styled components with updated color scheme
const StyledListItem = styled(ListItem)(({ theme }) => ({
  background: "#ffffff",
  borderRadius: "16px",
  marginBottom: theme.spacing(2),
  padding: theme.spacing(2),
  height: "auto",
  maxHeight: "140px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  transition: "transform 0.3s ease, box-shadow 0.3s ease",
  borderLeft: `4px solid #FB646B`,
  "&:hover": {
    transform: "translateY(-6px)",
    boxShadow: "0 8px 24px rgba(0, 0, 0, 0.12)",
  },
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1.5),
  },
  [`@media (max-width: 360px)`]: {
    padding: theme.spacing(1.2),
  },
  [`@media (max-width: 320px)`]: {
    padding: theme.spacing(1),
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: "12px",
  objectFit: "cover",
  border: "2px solid #FB646B",
  [theme.breakpoints.down("sm")]: {
    width: 60,
    height: 60,
  },
  [`@media (max-width: 360px)`]: {
    width: 50,
    height: 50,
  },
  [`@media (max-width: 320px)`]: {
    width: 45,
    height: 45,
  },
}));

const ActionButton = styled(IconButton)(({ theme }) => ({
  color: "#FB646B",
  "&:hover": {
    backgroundColor: "#FFEBF1",
  },
  padding: theme.spacing(1.2),
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(1),
  },
  [`@media (max-width: 360px)`]: {
    padding: theme.spacing(0.8),
  },
  [`@media (max-width: 320px)`]: {
    padding: theme.spacing(0.6),
  },
}));

const ModalContent = styled(Box)(({ theme }) => ({
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: "90%",
  maxWidth: 420,
  backgroundColor: "#ffffff",
  color: "#2D2828",
  boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
  padding: theme.spacing(4),
  borderRadius: "20px",
  display: "flex",
  flexDirection: "column",
  gap: theme.spacing(2.5),
  [theme.breakpoints.down("sm")]: {
    width: "95%",
    maxWidth: 360,
    padding: theme.spacing(3),
  },
  [`@media (max-width: 360px)`]: {
    width: "98%",
    maxWidth: 320,
    padding: theme.spacing(2.5),
  },
  [`@media (max-width: 320px)`]: {
    width: "98%",
    maxWidth: 300,
    padding: theme.spacing(2),
  },
}));

const FilterContainer = styled(Box)(({ theme }) => ({
  background: "#FFEBF1",
  borderRadius: "16px",
  boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
  padding: theme.spacing(3),
  marginBottom: theme.spacing(4),
  display: "flex",
  flexWrap: "wrap",
  gap: theme.spacing(2.5),
  justifyContent: "center",
  alignItems: "center",
  position: "relative",
  [theme.breakpoints.down("sm")]: {
    padding: theme.spacing(2),
    gap: theme.spacing(2),
  },
  [`@media (max-width: 360px)`]: {
    padding: theme.spacing(1.5),
    gap: theme.spacing(1.5),
  },
  [`@media (max-width: 320px)`]: {
    padding: theme.spacing(1.2),
    gap: theme.spacing(1),
  },
}));

const StyledFormControl = styled(FormControl)(({ theme }) => ({
  minWidth: 120,
  backgroundColor: "#ffffff",
  borderRadius: "10px",
  "& .MuiInputBase-root": {
    backgroundColor: "#ffffff",
    borderRadius: "10px",
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.95rem",
    color: "#FB646B",
    fontFamily: "'Play', sans-serif",
    paddingLeft: theme.spacing(0),
    marginLeft: theme.spacing(0),
  },
  "& .MuiSelect-icon": {
    color: "#FB646B",
  },
  "&:hover": {
    "& .MuiInputBase-root": {
      backgroundColor: "#FFEBF1",
    },
  },
  [theme.breakpoints.down("sm")]: {
    minWidth: 140,
  },
  [`@media (max-width: 360px)`]: {
    minWidth: 120,
  },
  [`@media (max-width: 320px)`]: {
    minWidth: 110,
  },
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  minWidth: { xs: 220, sm: 320 },
  backgroundColor: "#ffffff",
  borderRadius: "10px",
  "& .MuiInputBase-input": {
    fontSize: "0.95rem",
    color: "#2D2828",
    padding: theme.spacing(1.5),
    fontFamily: "'Lora', serif",
  },
  "& .MuiInputLabel-root": {
    fontSize: "0.95rem",
    color: "#FB646B",
    fontFamily: "'Play', sans-serif",
    paddingLeft: theme.spacing(0),
  },
  "& .MuiOutlinedInput-root": {
    "& fieldset": {
      borderColor: "#FB646B",
    },
    "&:hover fieldset": {
      borderColor: "#F710B9",
    },
    "&.Mui-focused fieldset": {
      borderColor: "#FB646B",
    },
  },
  [theme.breakpoints.down("sm")]: {
    minWidth: 200,
  },
  [`@media (max-width: 360px)`]: {
    minWidth: 180,
  },
  [`@media (max-width: 320px)`]: {
    minWidth: 160,
  },
}));

const StyledResetButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#FB646B",
  color: "#ffffff",
  "&:hover": {
    backgroundColor: "#C71585",
  },
  fontSize: "0.9rem",
  fontFamily: "'Lora', serif",
  padding: theme.spacing(1.2, 3),
  borderRadius: "10px",
  textTransform: "none",
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.85rem",
    padding: theme.spacing(1, 2.5),
  },
  [`@media (max-width: 360px)`]: {
    fontSize: "0.8rem",
    padding: theme.spacing(0.8, 2),
  },
  [`@media (max-width: 320px)`]: {
    fontSize: "0.75rem",
    padding: theme.spacing(0.7, 1.5),
  },
}));

const FilterToggleButton = styled(IconButton)(({ theme }) => ({
  display: "none",
  width: "50px",
  height: "50px",
  [theme.breakpoints.down("sm")]: {
    display: "block",
    color: "#FB646B",
    backgroundColor: "#ffffff",
    "&:hover": {
      backgroundColor: "#FFEBF1",
    },
    padding: theme.spacing(1.2),
    borderRadius: "50%",
  },
  [`@media (max-width: 360px)`]: {
    padding: theme.spacing(1),
  },
  [`@media (max-width: 320px)`]: {
    padding: theme.spacing(0.8),
  },
}));

const EnquiryButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#FB646B",
  color: "#ffffff",
  "&:hover": {
    backgroundColor: "#C71585",
  },
  fontSize: "0.9rem",
  fontFamily: "'Lora', serif",
  padding: theme.spacing(1.2, 3),
  borderRadius: "10px",
  textTransform: "none",
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.85rem",
    padding: theme.spacing(1, 2.5),
  },
  [`@media (max-width: 360px)`]: {
    fontSize: "0.8rem",
    padding: theme.spacing(0.8, 2),
  },
  [`@media (max-width: 320px)`]: {
    fontSize: "0.75rem",
    padding: theme.spacing(0.7, 1.5),
  },
}));

const SendEnquiryButton = styled(Button)(({ theme }) => ({
  backgroundColor: "#D946EF",
  color: "#ffffff",
  "&:hover": {
    backgroundColor: "#C71585",
  },
  "&.Mui-disabled": {
    backgroundColor: "#D1D5DB",
    color: "#6B7280",
  },
  fontSize: "0.9rem",
  fontFamily: "'Lora', serif",
  padding: theme.spacing(1.2, 3),
  borderRadius: "10px",
  textTransform: "none",
  [theme.breakpoints.down("sm")]: {
    fontSize: "0.85rem",
    padding: theme.spacing(1, 2.5),
  },
  [`@media (max-width: 360px)`]: {
    fontSize: "0.8rem",
    padding: theme.spacing(0.8, 2),
  },
  [`@media (max-width: 320px)`]: {
    fontSize: "0.75rem",
    padding: theme.spacing(0.7, 1.5),
  },
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: "absolute",
  top: theme.spacing(1),
  right: theme.spacing(2),
  color: "#ffffff",
  backgroundColor: "#FB646B",
  "&:hover": {
    backgroundColor: "#C71585",
  },
  padding: "10px",
  [theme.breakpoints.down("sm")]: {
    padding: "8px",
  },
  [`@media (max-width: 360px)`]: {
    padding: "7px",
  },
  [`@media (max-width: 320px)`]: {
    padding: "6px",
  },
}));

// Haversine formula and parseParlorLocation
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (
    !lat1 ||
    !lon1 ||
    !lat2 ||
    !lon2 ||
    isNaN(lat1) ||
    isNaN(lon1) ||
    isNaN(lat2) ||
    isNaN(lon2)
  ) {
    return null;
  }
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  return parseFloat(distance.toFixed(1));
};

const parseParlorLocation = (location) => {
  if (!location || typeof location !== "string") {
    return null;
  }
  const match = location.match(/Lat:\s*([\d.-]+),\s*Lon:\s*([\d.-]+)/i);
  if (!match) {
    return null;
  }
  const lat = parseFloat(match[1]);
  const lon = parseFloat(match[2]);
  if (isNaN(lat) || isNaN(lon)) {
    return null;
  }
  return { lat, lon };
};

// Fisher-Yates shuffle function
const shuffleArray = (array) => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// ParlorListItem component with enhanced image handling
const ParlorListItem = ({ parlor, onImageClick, userLocation }) => {
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const [credentials, setCredentials] = useState({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const getGoogleMapsUrl = (location) => {
    const coords = parseParlorLocation(location);
    if (!coords) return "#";
    return `https://www.google.com/maps?q=${coords.lat},${coords.lon}`;
  };

  const getDistanceDisplay = () => {
    if (!userLocation) {
      return "Set your location";
    }
    if (!parlor.location) {
      return "Unknown";
    }
    const parlorCoords = parseParlorLocation(parlor.location);
    if (!parlorCoords) return "Invalid location";
    const distance = calculateDistance(
      userLocation.lat,
      userLocation.lon,
      parlorCoords.lat,
      parlorCoords.lon
    );
    if (distance === null) {
      return "Unknown";
    }
    return `${distance} km`;
  };

  const handleOpenModal = () => setOpenModal(true);
  const handleCloseModal = () => {
    setOpenModal(false);
    setCredentials({ identifier: "", password: "" });
    setError("");
  };

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleTogglePassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    const { identifier, password } = credentials;

    if (!identifier || !password) {
      setError("Please fill in all fields");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/users/login`,
        {
          identifier,
          password,
          role: "User",
        },
        {
          headers: { "Content-Type": "application/json" },
        }
      );

      const data = response.data;

      if (response.status === 200) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("email", identifier);
        localStorage.setItem("userRole", "User");
        handleCloseModal();
        navigate("/bookslot", { state: { parlor } });
        window.location.reload();
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError(err.response?.data?.message || "Server error");
    }
  };

  const handleBooking = async () => {
    try {
      const email1 = localStorage.getItem("email");

      if (!email1) {
        alert("Please login to proceed.");
        handleOpenModal();
        return;
      }

      const response = await axios.get(
        `${BASE_URL}/api/users/check/login/${email1}`
      );

      if (response.status === 200 && response.data.loginData) {
        navigate("/bookslot", { state: { parlor } });
      } else {
        alert("Please login to proceed.");
        handleOpenModal();
      }
    } catch (error) {
      alert(`Something went wrong: ${error.message || error}`);
      handleOpenModal();
    }
  };

  return (
    <>
      <StyledListItem onClick={handleBooking} sx={{ cursor: "pointer" }}>
        <ListItemAvatar>
          <StyledAvatar
            src={`${BASE_URL}/${parlor.image?.replace(/\\/g, "/")}`}
            alt={parlor.name}
          />
        </ListItemAvatar>
        <ListItemText
          primary={
            <Typography
              variant="subtitle1"
              sx={{
                fontWeight: "bold",
                color: "#2D2828",
                fontSize: { xs: "0.95rem", sm: "1.1rem", md: "1.2rem" },
                fontFamily: "'Play', sans-serif",
                paddingLeft: "14px",
                [`@media (max-width: 360px)`]: {
                  fontSize: "0.9rem",
                },
                [`@media (max-width: 320px)`]: {
                  fontSize: "0.85rem",
                },
              }}
            >
              {parlor.name}
            </Typography>
          }
          secondary={
            <Box sx={{ paddingLeft: "14px" }}>
              <Typography
                variant="body2"
                sx={{
                  color: "#2D2828",
                  fontSize: { xs: "0.85rem", sm: "0.9rem", md: "0.95rem" },
                  fontFamily: "'Lora', serif",
                  lineHeight: 1.5,
                  [`@media (max-width: 360px)`]: {
                    fontSize: "0.8rem",
                  },
                  [`@media (max-width: 320px)`]: {
                    fontSize: "0.75rem",
                  },
                }}
              >
                {parlor.designation} | {parlor.service}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: "#F710B9",
                  fontWeight: "bold",
                  fontSize: { xs: "0.85rem", sm: "0.9rem", md: "0.95rem" },
                  fontFamily: "'Lora', serif",
                  lineHeight: 1.5,
                  [`@media (max-width: 360px)`]: {
                    fontSize: "0.8rem",
                  },
                  [`@media (max-width: 320px)`]: {
                    fontSize: "0.75rem",
                  },
                }}
              >
                ₹{parlor.price} | {parlor.style}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: { xs: "0.85rem", sm: "0.9rem", md: "0.95rem" },
                    color: "#FF80DD",
                    fontFamily: "'Lora', serif",
                    lineHeight: 1.5,
                    [`@media (max-width: 360px)`]: {
                      fontSize: "0.8rem",
                    },
                    [`@media (max-width: 320px)`]: {
                      fontSize: "0.75rem",
                    },
                  }}
                >
                  {parlor.spRating}
                </Typography>
                <i
                  className="fa fa-star"
                  style={{
                    marginLeft: "6px",
                    color: "#FF80DD",
                    fontSize: "0.95rem",
                    [`@media (max-width: 360px)`]: {
                      fontSize: "0.8rem",
                    },
                    [`@media (max-width: 320px)`]: {
                      fontSize: "0.75rem",
                    },
                  }}
                ></i>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: { xs: "0.85rem", sm: "0.9rem", md: "0.95rem" },
                    ml: 1,
                    color: "#2D2828",
                    fontFamily: "'Lora', serif",
                    lineHeight: 1.5,
                    [`@media (max-width: 360px)`]: {
                      fontSize: "0.8rem",
                    },
                    [`@media (max-width: 320px)`]: {
                      fontSize: "0.75rem",
                    },
                  }}
                >
                  ({parlor.countPeople} Ratings)
                </Typography>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  fontSize: { xs: "0.85rem", sm: "0.9rem", md: "0.95rem" },
                  color: "#2D2828",
                  fontFamily: "'Lora', serif",
                  lineHeight: 1.5,
                  [`@media (max-width: 360px)`]: {
                    fontSize: "0.8rem",
                  },
                  [`@media (max-width: 320px)`]: {
                    fontSize: "0.75rem",
                  },
                }}
              >
                Distance: {getDistanceDisplay()}
              </Typography>
            </Box>
          }
        />
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <ActionButton
            onClick={(e) => {
              e.stopPropagation();
              window.open(getGoogleMapsUrl(parlor.location), "_blank");
            }}
            size="small"
          >
            <LocationOnIcon
              sx={{
                fontSize: { xs: "1.3rem", sm: "1.4rem", md: "1.5rem" },
                [`@media (max-width: 320px)`]: { fontSize: "1.2rem" },
              }}
            />
          </ActionButton>
        </Box>
      </StyledListItem>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        aria-labelledby="login-modal-title"
        sx={{
          backdropFilter: "blur(5px)",
        }}
      >
        <ModalContent>
          <Typography
            id="login-modal-title"
            variant="h5"
            component="h2"
            textAlign="center"
            sx={{
              fontSize: { xs: "1.4rem", sm: "1.5rem", md: "1.6rem" },
              color: "#F710B9",
              fontWeight: "bold",
              fontFamily: "'Play', sans-serif",
              paddingBottom: "10px",
              [`@media (max-width: 360px)`]: {
                fontSize: "1.3rem",
              },
              [`@media (max-width: 320px)`]: {
                fontSize: "1.2rem",
              },
            }}
          >
            Sign In
          </Typography>
          <form onSubmit={handleLogin}>
            <TextField
              label="Email or Phone"
              variant="outlined"
              name="identifier"
              value={credentials.identifier}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              sx={{
                "& .MuiInputBase-input": {
                  padding: "14px",
                  fontSize: { xs: "0.9rem", sm: "0.95rem" },
                  fontFamily: "'Lora', serif",
                  [`@media (max-width: 320px)`]: { fontSize: "0.85rem" },
                },
                "& .MuiInputLabel-root": {
                  fontSize: { xs: "0.9rem", sm: "0.95rem" },
                  fontFamily: "'Play', sans-serif",
                  [`@media (max-width: 320px)`]: { fontSize: "0.85rem" },
                },
              }}
            />
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              variant="outlined"
              name="password"
              value={credentials.password}
              onChange={handleChange}
              fullWidth
              margin="normal"
              required
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={handleTogglePassword} edge="end">
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiInputBase-input": {
                  padding: "14px",
                  fontSize: { xs: "0.9rem", sm: "0.95rem" },
                  fontFamily: "'Lora', serif",
                  [`@media (max-width: 320px)`]: { fontSize: "0.85rem" },
                },
                "& .MuiInputLabel-root": {
                  fontSize: { xs: "0.9rem", sm: "0.95rem" },
                  fontFamily: "'Play', sans-serif",
                  [`@media (max-width: 320px)`]: { fontSize: "0.85rem" },
                },
              }}
            />
            {error && (
              <Typography
                color="error"
                variant="body2"
                sx={{
                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                  fontFamily: "'Lora', serif",
                  padding: "10px 14px",
                  [`@media (max-width: 320px)`]: { fontSize: "0.8rem" },
                }}
              >
                {error}
              </Typography>
            )}
            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 1.5 }}>
              <Link
                to="/login"
                style={{
                  textDecoration: "none",
                  color: "#FB646B",
                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                  fontFamily: "'Lora', serif",
                  padding: "6px 14px",
                  [`@media (max-width: 320px)`]: { fontSize: "0.8rem" },
                }}
              >
                Forgot Password?
              </Link>
            </Box>
            <Box
              sx={{
                display: "flex",
                gap: 2.5,
                mt: 2.5,
                justifyContent: "center",
                flexWrap: "wrap",
              }}
            >
              <Button
                type="submit"
                variant="contained"
                sx={{
                  backgroundColor: "#D946EF",
                  color: "#ffffff",
                  "&:hover": { backgroundColor: "#C71585" },
                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                  fontFamily: "'Lora', serif",
                  padding: { xs: "10px 24px", sm: "12px 28px" },
                  borderRadius: "10px",
                  textTransform: "none",
                  [`@media (max-width: 320px)`]: {
                    fontSize: "0.8rem",
                    padding: "8px 20px",
                  },
                }}
              >
                Sign In
              </Button>
              <Button
                variant="outlined"
                onClick={handleCloseModal}
                sx={{
                  borderColor: "#FB646B",
                  color: "#FB646B",
                  "&:hover": { borderColor: "#F710B9", color: "#F710B9" },
                  fontSize: { xs: "0.85rem", sm: "0.9rem" },
                  fontFamily: "'Lora', serif",
                  padding: { xs: "10px 24px", sm: "12px 28px" },
                  borderRadius: "10px",
                  textTransform: "none",
                  [`@media (max-width: 320px)`]: {
                    fontSize: "0.8rem",
                    padding: "8px 20px",
                  },
                }}
              >
                Cancel
              </Button>
            </Box>
            <Typography
              textAlign="center"
              sx={{
                fontSize: { xs: "0.85rem", sm: "0.9rem" },
                fontFamily: "'Lora', serif",
                mt: 2.5,
                color: "#2D2828",
                padding: "10px 14px",
                [`@media (max-width: 320px)`]: { fontSize: "0.8rem" },
              }}
            >
              Don't have an account?{" "}
              <Link
                to="/signup"
                style={{ textDecoration: "none", color: "#FB646B" }}
              >
                Sign up
              </Link>
            </Typography>
          </form>
        </ModalContent>
      </Modal>
    </>
  );
};

// Google Maps Autocomplete hook
const useGoogleMapsAutocomplete = (
  inputRef,
  setLocationInput,
  setUserLocation
) => {
  const autocompleteRef = useRef(null);

  useEffect(() => {
    const initializeAutocomplete = () => {
      if (
        window.google &&
        window.google.maps &&
        window.google.maps.places &&
        inputRef.current
      ) {
        autocompleteRef.current = new window.google.maps.places.Autocomplete(
          inputRef.current,
          {
            fields: ["formatted_address", "geometry", "name"],
            types: [],
          }
        );

        const listener = autocompleteRef.current.addListener(
          "place_changed",
          () => {
            const place = autocompleteRef.current.getPlace();
            if (!place.geometry || !place.geometry.location) {
              alert(`No details available for input: '${place.name}'`);
              setLocationInput("");
              setUserLocation(null);
              return;
            }
            setLocationInput(place.formatted_address);
            setUserLocation({
              lat: place.geometry.location.lat(),
              lon: place.geometry.location.lng(),
            });
          }
        );

        return () => {
          if (window.google && window.google.maps) {
            window.google.maps.event.removeListener(listener);
          }
        };
      } else {
        return setTimeout(initializeAutocomplete, 100);
      }
    };

    const timeoutId = initializeAutocomplete();

    return () => {
      clearTimeout(timeoutId);
      if (autocompleteRef.current && window.google && window.google.maps) {
        window.google.maps.event.clearInstanceListeners(
          autocompleteRef.current
        );
      }
    };
  }, [inputRef, setLocationInput, setUserLocation]);
};

const Product = () => {
  const [selectedParlor, setSelectedParlor] = useState(null);
  const [detailedParlor, setDetailedParlor] = useState(null);
  const [beautyParlors, setBeautyParlors] = useState([]);
  const [filteredParlors, setFilteredParlors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState("all");
  const [distanceFilter, setDistanceFilter] = useState("all");
  const [serviceFilter, setServiceFilter] = useState("");
  const [designationFilter, setDesignationFilter] = useState("");
  const [userLocation, setUserLocation] = useState(null);
  const [locationInput, setLocationInput] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [enquiryModalOpen, setEnquiryModalOpen] = useState(false);
  const [enquiryMessage, setEnquiryMessage] = useState("");
  const [serviceProviders, setServiceProviders] = useState([]);
  const [selectedDesignation, setSelectedDesignation] = useState("");
  const [successDialogOpen, setSuccessDialogOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const autocompleteInputRef = useRef(null);
  const modalRef = useRef(null);

  useGoogleMapsAutocomplete(
    autocompleteInputRef,
    setLocationInput,
    setUserLocation
  );

  // Fetch service providers for enquiry modal
  useEffect(() => {
    if (enquiryModalOpen && userLocation) {
      const fetchServiceProviders = async () => {
        try {
          const response = await axios.get(
            `${BASE_URL}/api/main/admin/get/all/service-providers`
          );
          const parsedProviders = response.data.map((provider) => ({
            _id: provider._id || "",
            shopName: provider.shopName || "No Name",
            designation: provider.designation || "Salon",
            location: provider.location || null,
            spRating: parseFloat(provider.spRating) || 0,
            email: provider.email || "No Email",
          }));
          const filteredProviders = parsedProviders.filter((provider) => {
            const providerCoords = parseParlorLocation(provider.location);
            if (!providerCoords) return false;
            const distance = calculateDistance(
              userLocation.lat,
              userLocation.lon,
              providerCoords.lat,
              providerCoords.lon
            );
            return distance !== null && distance <= 20;
          });
          setServiceProviders(filteredProviders);
        } catch (error) {
          setServiceProviders([]);
        }
      };
      fetchServiceProviders();
    } else if (enquiryModalOpen && !userLocation) {
      setServiceProviders([]);
    }
  }, [enquiryModalOpen, userLocation]);

  // Handle enquiry submission
  const handleSubmitEnquiry = async () => {
    const email = localStorage.getItem("email");
    if (!email) {
      alert("Please login to submit an enquiry.");
      navigate("/login");
      return;
    }
    if (!enquiryMessage) {
      alert("Please enter a message to send the enquiry.");
      return;
    }
    if (!selectedDesignation) {
      alert("Please select a designation to send the enquiry.");
      return;
    }

    const filteredProviders = serviceProviders.filter(
      (provider) => provider.designation === selectedDesignation
    );

    if (filteredProviders.length === 0) {
      alert(
        `No service providers available in your area for ${selectedDesignation}.`
      );
      return;
    }

    try {
      const promises = filteredProviders.map((provider) =>
        axios.post(`${BASE_URL}/api/users/enquiries`, {
          parlorEmail: provider.email,
          message: enquiryMessage,
          email,
        })
      );

      const responses = await Promise.all(promises);

      const allSuccessful = responses.every(
        (response) => response.status === 201
      );

      if (allSuccessful) {
        setSuccessDialogOpen(true);
      } else {
        alert("Some enquiries failed to send. Please try again.");
      }
    } catch (error) {
      alert("Failed to send enquiries. Please try again.");
    }
  };

  const handleSuccessDialogClose = () => {
    setSuccessDialogOpen(false);
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setEnquiryModalOpen(false);
    setEnquiryMessage("");
    setSelectedDesignation("");
  };

  const handleEnquiryButtonClick = () => {
    if (!userLocation) {
      alert("Please set your location to proceed with the enquiry.");
      return;
    }
    setEnquiryModalOpen(true);
  };

  const roleOptions = {
    Salon: ["HairCut", "Facial", "HairColor", "Shaving"],
    Beauty_Parler: ["HairCut", "Bridal", "Waxing", "Pedicure"],
    Doctor: ["Hair Treatment", "Skin Treatment"],
  };

  const allServices = Array.from(
    new Set([
      ...roleOptions.Salon,
      ...roleOptions.Beauty_Parler,
      ...roleOptions.Doctor,
    ])
  );

  const ratingOptions = [
    { value: "all", label: "All Ratings", range: [0, 5] },
    { value: "1-1.9", label: "1+", stars: "★", range: [1, 1.9] },
    { value: "2-2.9", label: "2+", stars: "★★", range: [2, 2.9] },
    { value: "3-3.9", label: "3+", stars: "★★★", range: [3, 3.9] },
    { value: "4-4.9", label: "4+", stars: "★★★★", range: [4, 4.9] },
    { value: "5", label: "5", stars: "★★★★★", range: [5, 5] },
  ];

  const getActiveDesignation = () => {
    if (location.state?.designation) {
      return location.state.designation;
    }
    const path = location.pathname.toLowerCase();
    if (path.includes("salon")) return "Salon";
    if (path.includes("beauty")) return "Beauty_Parler";
    if (path.includes("skincare")) return "Doctor";
    return "";
  };

  const getGoogleMapsUrlFromCoords = (lat, lon) => {
    if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
      return "#";
    }
    return `https://www.google.com/maps?q=${lat},${lon}`;
  };

  const handleToggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  // Fetch service providers
  useEffect(() => {
    setLoading(true);
    axios
      .get(`${BASE_URL}/api/users/cards/services`)
      .then((response) => {
        const parsed = response.data.map((item, index) => ({
          id: index + 1,
          name: item.shopName || "No Name",
          image: item.shopImage || null,
          location: item.location || null,
          service: item.serviceName || "Service",
          style: item.style || "No Style",
          email: item.email || "No Email",
          serviceId: item.serviceId || "No Service ID",
          price: item.price || 0,
          designation: item.designation || "Salon",
          countPeople: item.countPeople || 0,
          spRating: parseFloat(item.spRating) || 0,
          priority: parseInt(item.priority) || 0,
        }));
        setBeautyParlors(parsed);
        setFilteredParlors(parsed);
        setLoading(false);
      })
      .catch((error) => {
        alert("Failed to load services. Please try again later.");
        setLoading(false);
      });
  }, []);

  const getActiveService = () => {
    if (location.state?.service) {
      return location.state.service;
    }
    const path = location.pathname.toLowerCase();
    if (path.includes("shaving")) return "Shaving";
    if (path.includes("facial")) return "Facial";
    if (path.includes("haircolor")) return "HairColor";
    if (path.includes("haircut")) return "HairCut";

    return "";
  };

  useEffect(() => {
    const newDesignation = getActiveDesignation();
    const newService = getActiveService();
    setDesignationFilter(newDesignation);
    setServiceFilter(newService);
  }, [location.pathname, location.state]);

  // Apply filters and sort
  useEffect(() => {
    let filtered = beautyParlors;

    if (designationFilter && designationFilter !== "All Products") {
      filtered = filtered.filter(
        (parlor) => parlor.designation === designationFilter
      );
    }

    if (ratingFilter !== "all") {
      const selectedRange = ratingOptions.find(
        (option) => option.value === ratingFilter
      )?.range;
      if (selectedRange) {
        filtered = filtered.filter(
          (parlor) =>
            parlor.spRating >= selectedRange[0] &&
            parlor.spRating <= selectedRange[1]
        );
      }
    }

    if (distanceFilter !== "all" && userLocation) {
      filtered = filtered.filter((parlor) => {
        const parlorCoords = parseParlorLocation(parlor.location);
        if (!parlorCoords) {
          return false;
        }
        const dist = calculateDistance(
          userLocation.lat,
          userLocation.lon,
          parlorCoords.lat,
          parlorCoords.lon
        );
        if (dist === null) return false;
        if (distanceFilter === "0-1") return dist <= 1;
        if (distanceFilter === "0-3") return dist > 0 && dist <= 3;
        if (distanceFilter === "0-5") return dist > 0 && dist <= 5;
        if (distanceFilter === "more") return dist > 5;
        return true;
      });
    }

    if (serviceFilter) {
      filtered = filtered.filter((parlor) => parlor.service === serviceFilter);
    }

    const prioritized = filtered
      .filter((parlor) => parlor.priority > 0)
      .sort((a, b) => b.priority - a.priority);
    const nonPrioritized = filtered.filter((parlor) => parlor.priority === 0);
    const shuffledNonPrioritized = shuffleArray(nonPrioritized);
    const finalOrder = [...prioritized, ...shuffledNonPrioritized];

    setFilteredParlors(finalOrder);
  }, [
    beautyParlors,
    designationFilter,
    ratingFilter,
    distanceFilter,
    serviceFilter,
    userLocation,
  ]);

  const handleRatingChange = (e) => {
    setRatingFilter(e.target.value);
  };

  const handleDistanceChange = (e) => {
    setDistanceFilter(e.target.value);
  };

  const handleServiceChange = (e) => {
    setServiceFilter(e.target.value);
  };

  const handleDesignationChange = (e) => {
    setDesignationFilter(e.target.value);
    setServiceFilter("");
  };

  const handleResetFilters = () => {
    setRatingFilter("all");
    setDistanceFilter("all");
    setServiceFilter("");
    setDesignationFilter("");
    setLocationInput("");
    setUserLocation(null);
    setShowFilters(false);
  };

  // Animation variants for the FilterContainer in mobile view
  const filterVariants = {
    hidden: {
      y: "100vh",
      opacity: 0,
    },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        duration: 0.5,
      },
    },
    exit: {
      y: "100vh",
      opacity: 0,
      transition: {
        duration: 0.6,
      },
    },
  };

  return (
    <Box
      sx={{
        backgroundColor: "#fad9e3",
        minHeight: "100vh",
        py: { xs: 5, sm: 6 },
      }}
    >
      <Container
        maxWidth="xl"
        sx={{
          backgroundColor: "#fad9e3",
          px: { xs: 2.5, sm: 3.5 },
          py: { xs: 3, sm: 4 },
          borderRadius: "16px",
          maxWidth: {
            xs: "100%",
            sm: "95%",
            md: "1200px",
            lg: "1400px",
          },
        }}
      >
        <style>
          {`
          h2.text-primary {
            font-family: 'Play', sans-serif;
            font-weight: 700;
            font-size: 2.5rem;
            color: #F710B9;
            position: relative;
            margin-bottom: 2.5rem;
            text-align: center;
            letter-spacing: 1px;
          }

          h2.text-primary::after {
            content: '';
            position: absolute;
            bottom: -12px;
            left: 50%;
            transform: translateX(-50%);
            width: 120px;
            height: 4px;
            background: #FB646B;
            borderRadius: 2px;
          }

          @media (max-width: 600px) {
            h2.text-primary {
              font-size: 2rem;
            }
            h2.text-primary::after {
              width: 80px;
              bottom: -10px;
            }
          }

          @media (max-width: 360px) {
            h2.text-primary {
              font-size: 1.8rem;
            }
            h2.text-primary::after {
              width: 70px;
            }
          }

          @media (max-width: 320px) {
            h2.text-primary {
              font-size: 1.6rem;
            }
            h2.text-primary::after {
              width: 60px;
            }
          }
          `}
        </style>
        <h2
          className="text-center fw-bold mb-4 animate__animated animate__fadeInDown"
          style={{
            animationDuration: "1s",
            fontSize: { xs: "1.6rem", sm: "2rem", md: "2.5rem" },
            textTransform: "uppercase",
            color: "#FB646B",
          }}
        >
          Our Services
        </h2>
        <Box sx={{ display: "flex", justifyContent: "flex-end", mb: 4 }}>
          <FilterToggleButton onClick={handleToggleFilters}>
            <FilterListIcon
              sx={{
                fontSize: { xs: "1.4rem", sm: "1.5rem", md: "1.6rem" },
                [`@media (max-width: 320px)`]: { fontSize: "1.3rem" },
              }}
            />
          </FilterToggleButton>
        </Box>
        {(showFilters || window.innerWidth >= 600) && (
        <motion.div
  variants={filterVariants}
  initial={window.innerWidth < 600 ? "hidden" : false}
  animate={window.innerWidth < 600 && showFilters ? "visible" : false}
  exit={window.innerWidth < 600 ? "exit" : false}
  style={{
    position: window.innerWidth < 600 ? "fixed" : "relative",
    bottom: window.innerWidth < 600 ? 0 : "auto",
    left: window.innerWidth < 600 ? 0 : "auto",
    right: window.innerWidth < 600 ? 0 : "auto",
    zIndex: window.innerWidth < 600 ? 1000 : "auto",
    backgroundColor: window.innerWidth < 600 ? "#fad9e3" : "transparent",
    padding: window.innerWidth < 600 ? "16px" : 0,
    boxShadow:
      window.innerWidth < 600 ? "0 -4px 20px rgba(0, 0, 0, 0.08)" : "none",
    borderTopLeftRadius: window.innerWidth < 600 ? "16px" : 0,
    borderTopRightRadius: window.innerWidth < 600 ? "16px" : 0,
  }}
>
  <FilterContainer>
    {window.innerWidth < 600 && showFilters && (
   <div
  style={{
    width: "100%",
    display: "flex",
    justifyContent: "center",
    marginBottom: "12px",
    position: "relative",
  }}
>
  <CloseButton
    onClick={handleToggleFilters}
    style={{
      width: "28px",
      height: "25px",        // 1 px is almost invisible; adjust as needed
      backgroundColor: "red",// “#red” isn’t a valid colour
      borderRadius: "5px",
      fontSize: "10px",
      padding: "6px",
      boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
      zIndex: 1001,
      position: "absolute",
      top: "-5px",           // keeps the button nudged upward
      left: "92%",           // ⬅ centre point of parent
      transform: "translateX(-50%)", // pull it back by half its own width
    }}
  >
    ✕
  </CloseButton>
</div>


    )}

    <Box sx={{ display: "flex", gap: 2, alignItems: "center" }}>
      <StyledTextField
        label="Your Location"
        value={locationInput}
        onChange={(e) => setLocationInput(e.target.value)}
        inputRef={autocompleteInputRef}
        placeholder="Search for any place (e.g., salon, spa)"
        className="mt-2"
      />
      <IconButton
        onClick={() =>
          window.open(
            getGoogleMapsUrlFromCoords(userLocation?.lat, userLocation?.lon),
            "_blank"
          )
        }
        disabled={!userLocation}
        sx={{
          color: "#FB646B",
          "&:hover": { backgroundColor: "#FFEBF1" },
          p: { xs: 1.2, sm: 1.5 },
          [`@media (max-width: 320px)`]: { p: 1 },
        }}
      >
        <i
          className="fa fa-map"
          style={{
            fontSize: "1.3rem",
          }}
        ></i>
      </IconButton>
    </Box>

    <StyledFormControl className="mt-2">
      <InputLabel>Category</InputLabel>
      <Select
        value={designationFilter}
        onChange={handleDesignationChange}
        label="Category"
        sx={{
          fontSize: { xs: "0.9rem", sm: "0.95rem" },
          fontFamily: "'Lora', serif",
          [`@media (max-width: 320px)`]: { fontSize: "0.85rem" },
        }}
      >
        <MenuItem value="All Products">All Services</MenuItem>
        <MenuItem value="Salon">Salon</MenuItem>
        <MenuItem value="Beauty_Parler">Beauty Parlor</MenuItem>
        <MenuItem value="Doctor">Skincare Specialist</MenuItem>
      </Select>
    </StyledFormControl>

    <StyledFormControl className="mt-2">
      <InputLabel>Rating</InputLabel>
      <Select
        value={ratingFilter}
        onChange={handleRatingChange}
        label="Rating"
        sx={{
          fontSize: { xs: "0.9rem", sm: "0.95rem" },
          fontFamily: "'Lora', serif",
          [`@media (max-width: 320px)`]: { fontSize: "0.85rem" },
        }}
      >
        {ratingOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Typography
                sx={{
                  color: "#FF80DD",
                  mr: 1,
                  fontSize: { xs: "0.9rem", sm: "0.95rem" },
                  [`@media (max-width: 320px)`]: {
                    fontSize: "0.85rem",
                  },
                }}
              >
                {option.stars}
              </Typography>
              <Typography
                sx={{
                  fontSize: { xs: "0.9rem", sm: "0.95rem" },
                  fontFamily: "'Lora', serif",
                  [`@media (max-width: 320px)`]: {
                    fontSize: "0.85rem",
                  },
                }}
              >
                {option.label}
              </Typography>
            </Box>
          </MenuItem>
        ))}
      </Select>
    </StyledFormControl>

    <StyledFormControl className="mt-2">
      <InputLabel>Distance</InputLabel>
      <Select
        value={distanceFilter}
        onChange={handleDistanceChange}
        label="Distance"
        sx={{
          fontSize: { xs: "0.9rem", sm: "0.95rem" },
          fontFamily: "'Lora', serif",
          [`@media (max-width: 320px)`]: { fontSize: "0.85rem" },
        }}
      >
        <MenuItem value="all">All Distances</MenuItem>
        <MenuItem value="0-1">0-1 km</MenuItem>
        <MenuItem value="0-3">0-3 km</MenuItem>
        <MenuItem value="0-5">0-5 km</MenuItem>
        <MenuItem value="more">More than 5 km</MenuItem>
      </Select>
    </StyledFormControl>

    <StyledFormControl className="mt-2">
      <InputLabel>Service</InputLabel>
      <Select
        value={serviceFilter}
        onChange={handleServiceChange}
        label="Service"
        sx={{
          fontSize: { xs: "0.9rem", sm: "0.95rem" },
          fontFamily: "'Lora', serif",
          [`@media (max-width: 320px)`]: { fontSize: "0.85rem" },
        }}
      >
        <MenuItem value="">All Services</MenuItem>
        {(designationFilter === "All Products"
          ? allServices
          : roleOptions[designationFilter] || []
        ).map((service) => (
          <MenuItem key={service} value={service}>
            {service}
          </MenuItem>
        ))}
      </Select>
    </StyledFormControl>

    <StyledResetButton
      variant="contained"
      onClick={handleResetFilters}
      className="mt-2"
    >
      Clear Filters
    </StyledResetButton>
    <EnquiryButton
      variant="contained"
      onClick={handleEnquiryButtonClick}
      className="mt-2"
    >
      Send Enquiry
    </EnquiryButton>
  </FilterContainer>
</motion.div>

        )}
        <List
          sx={{
            width: "100%",
            bgcolor: "transparent",
            borderRadius: "16px",
            p: { xs: 2.5, sm: 3 },
            [`@media (max-width: 320px)`]: { p: 2 },
          }}
        >
          {loading ? (
            <Typography
              variant="h6"
              align="center"
              sx={{
                fontSize: { xs: "1rem", sm: "1.1rem", md: "1.3rem" },
                color: "#2D2828",
                fontFamily: "'Lora', serif",
                padding: "20px",
                [`@media (max-width: 360px)`]: { fontSize: "0.95rem" },
                [`@media (max-width: 320px)`]: { fontSize: "0.9rem" },
              }}
            >
              Loading Services...
            </Typography>
          ) : filteredParlors.length === 0 ? (
            <Typography
              variant="h6"
              align="center"
              sx={{
                fontSize: { xs: "1rem", sm: "1.1rem", md: "1.3rem" },
                color: "#2D2828",
                fontFamily: "'Lora', serif",
                padding: "20px",
                [`@media (max-width: 360px)`]: { fontSize: "0.95rem" },
                [`@media (max-width: 320px)`]: { fontSize: "0.9rem" },
              }}
            >
              No Services Found
            </Typography>
          ) : (
            filteredParlors.map((parlor) => (
              <ParlorListItem
                key={parlor.id}
                parlor={parlor}
                onImageClick={setDetailedParlor}
                userLocation={userLocation}
              />
            ))
          )}
        </List>

        {/* Enquiry Modal */}
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
                maxWidth: "620px",
                width: "100%",
                maxHeight: "90vh",
                overflowY: "auto",
                backgroundColor: "#ffffff",
              }}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3
                  className="m-0"
                  style={{
                    color: "#F710B9",
                    fontFamily: "'Play', sans-serif",
                    fontSize: { xs: "1.4rem", sm: "1.5rem", md: "1.6rem" },
                    [`@media (max-width: 360px)`]: { fontSize: "1.3rem" },
                    [`@media (max-width: 320px)`]: { fontSize: "1.2rem" },
                  }}
                >
                  Service Enquiry
                </h3>
                <button
                  className="btn border-0"
                  onClick={handleCloseModal}
                  style={{ color: "#FB646B" }}
                >
                  <i
                    className="bi bi-x-lg"
                    style={{
                      fontSize: { xs: "1.2rem", sm: "1.3rem" },
                      [`@media (max-width: 320px)`]: { fontSize: "1.1rem" },
                    }}
                  ></i>
                </button>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-dark">
                  Select Category
                </label>
                <StyledFormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select
                    value={selectedDesignation}
                    onChange={(e) => setSelectedDesignation(e.target.value)}
                    label="Category"
                    sx={{
                      fontSize: { xs: "0.9rem", sm: "0.95rem" },
                      fontFamily: "'Lora', serif",
                      [`@media (max-width: 320px)`]: { fontSize: "0.85rem" },
                    }}
                  >
                    <MenuItem value="">Select Category</MenuItem>
                    <MenuItem value="Salon">Salon</MenuItem>
                    <MenuItem value="Beauty_Parler">Beauty Parlor</MenuItem>
                    <MenuItem value="Doctor">Skincare Specialist</MenuItem>
                  </Select>
                </StyledFormControl>
              </div>

              <div className="mb-4">
                <label className="form-label fw-semibold text-dark">
                  Service Providers
                </label>
                {selectedDesignation &&
                serviceProviders.filter(
                  (provider) => provider.designation === selectedDesignation
                ).length === 0 ? (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#2D2828",
                      fontStyle: "italic",
                      fontFamily: "'Lora', serif",
                      fontSize: { xs: "0.85rem", sm: "0.9rem" },
                      padding: "10px 14px",
                      [`@media (max-width: 320px)`]: { fontSize: "0.8rem" },
                    }}
                  >
                    No providers found for {selectedDesignation}
                  </Typography>
                ) : !selectedDesignation ? (
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#2D2828",
                      fontStyle: "italic",
                      fontFamily: "'Lora', serif",
                      fontSize: { xs: "0.85rem", sm: "0.9rem" },
                      padding: "10px 14px",
                      [`@media (max-width: 320px)`]: { fontSize: "0.8rem" },
                    }}
                  >
                    Please select a category
                  </Typography>
                ) : (
                  <Box
                    sx={{
                      maxHeight: "220px",
                      overflowY: "auto",
                      border: "1px solid #FB646B",
                      borderRadius: "10px",
                      p: 2,
                      bgcolor: "#FFEBF1",
                      [`@media (max-width: 320px)`]: {
                        maxHeight: "200px",
                        p: 1.5,
                      },
                    }}
                  >
                    {serviceProviders
                      .filter(
                        (provider) => provider.designation === selectedDesignation
                      )
                      .map((provider) => {
                        const providerCoords = parseParlorLocation(
                          provider.location
                        );
                        const distance = providerCoords
                          ? calculateDistance(
                              userLocation.lat,
                              userLocation.lon,
                              providerCoords.lat,
                              providerCoords.lon
                            )
                          : null;
                        return (
                          <Box
                            key={provider._id}
                            sx={{
                              p: 1.5,
                              borderBottom: "1px solid #FB646B",
                              "&:last-child": { borderBottom: "none" },
                              bgcolor: "#ffffff",
                              borderRadius: "8px",
                              mb: 0.5,
                              [`@media (max-width: 320px)`]: { p: 1 },
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                fontWeight: "bold",
                                color: "#F710B9",
                                fontFamily: "'Play', sans-serif",
                                fontSize: {
                                  xs: "0.9rem",
                                  sm: "0.95rem",
                                  md: "1rem",
                                },
                                [`@media (max-width: 320px)`]: {
                                  fontSize: "0.85rem",
                                },
                              }}
                            >
                              {provider.shopName}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#2D2828",
                                fontFamily: "'Lora', serif",
                                fontSize: { xs: "0.85rem", sm: "0.9rem" },
                                [`@media (max-width: 320px)`]: {
                                  fontSize: "0.8rem",
                                },
                              }}
                            >
                              {provider.designation} | Rating: {provider.spRating}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#2D2828",
                                fontFamily: "'Lora', serif",
                                fontSize: { xs: "0.85rem", sm: "0.9rem" },
                                [`@media (max-width: 320px)`]: {
                                  fontSize: "0.8rem",
                                },
                              }}
                            >
                              Distance: {distance || "Unknown"} km
                            </Typography>
                          </Box>
                        );
                      })}
                  </Box>
                )}
              </div>

              <div className="mb-4">
                <label
                  htmlFor="enquiryMessage"
                  className="form-label fw-semibold text-dark"
                  style={{
                    fontSize: { xs: "0.9rem", sm: "0.95rem" },
                    fontFamily: "'Play', sans-serif",
                    color: "#2D2828",
                    [`@media (max-width: 320px)`]: { fontSize: "0.85rem" },
                  }}
                >
                  Your Message
                </label>
                <textarea
                  id="enquiryMessage"
                  className="form-control"
                  rows="5"
                  placeholder="Describe the services you're interested in..."
                  value={enquiryMessage}
                  onChange={(e) => setEnquiryMessage(e.target.value)}
                  style={{
                    fontSize: { xs: "0.9rem", sm: "0.95rem" },
                    fontFamily: "'Lora', serif",
                    padding: "14px",
                    borderRadius: "10px",
                    borderColor: "#FB646B",
                    [`@media (max-width: 320px)`]: {
                      fontSize: "0.85rem",
                      padding: "12px",
                    },
                  }}
                ></textarea>
              </div>

              <div className="d-flex gap-3 justify-content-end flex-wrap">
                <SendEnquiryButton
                  onClick={handleSubmitEnquiry}
                  disabled={
                    !enquiryMessage ||
                    !selectedDesignation ||
                    serviceProviders.filter(
                      (provider) => provider.designation === selectedDesignation
                    ).length === 0
                  }
                >
                  Send Enquiry
                </SendEnquiryButton>
                <Button
                  variant="outlined"
                  onClick={handleCloseModal}
                  sx={{
                    borderColor: "#FB646B",
                    color: "#FB646B",
                    "&:hover": { borderColor: "#F710B9", color: "#F710B9" },
                    fontSize: { xs: "0.85rem", sm: "0.9rem" },
                    fontFamily: "'Lora', serif",
                    padding: { xs: "10px 24px", sm: "12px 28px" },
                    borderRadius: "10px",
                    textTransform: "none",
                    [`@media (max-width: 320px)`]: {
                      fontSize: "0.8rem",
                      padding: "8px 20px",
                    },
                  }}
                >
                  Close
                </Button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Success Dialog */}
        <Dialog
          open={successDialogOpen}
          onClose={handleSuccessDialogClose}
          aria-labelledby="success-dialog-title"
          PaperProps={{
            sx: {
              borderRadius: "12px",
              padding: { xs: "14px", sm: "18px" },
              backgroundColor: "#ffffff",
              [`@media (max-width: 320px)`]: { padding: "12px" },
            },
          }}
        >
          <DialogTitle
            id="success-dialog-title"
            sx={{
              fontSize: { xs: "1.2rem", sm: "1.3rem", md: "1.5rem" },
              color: "#F710B9",
              fontFamily: "'Play', sans-serif",
              padding: "14px 18px",
              [`@media (max-width: 320px)`]: { fontSize: "1.1rem" },
            }}
          >
            Success
          </DialogTitle>
          <DialogContent>
            <Typography
              sx={{
                fontSize: { xs: "0.9rem", sm: "0.95rem", md: "1rem" },
                color: "#2D2828",
                fontFamily: "'Lora', serif",
                padding: "10px 14px",
                [`@media (max-width: 320px)`]: { fontSize: "0.85rem" },
              }}
            >
              Enquiry sent successfully to all {selectedDesignation} providers!
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={handleSuccessDialogClose}
              sx={{
                backgroundColor: "#D946EF",
                color: "#ffffff",
                "&:hover": { backgroundColor: "#C71585" },
                fontSize: { xs: "0.85rem", sm: "0.9rem" },
                fontFamily: "'Lora', serif",
                padding: { xs: "10px 24px", sm: "12px 28px" },
                borderRadius: "10px",
                textTransform: "none",
                [`@media (max-width: 320px)`]: {
                  fontSize: "0.8rem",
                  padding: "8px 20px",
                },
              }}
            >
              OK
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
};

export default Product;
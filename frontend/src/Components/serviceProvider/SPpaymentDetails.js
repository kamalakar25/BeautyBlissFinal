import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowBackIos from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Typography,

} from '@mui/material';
import { styled } from '@mui/material/styles';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from 'chart.js';
import debounce from 'lodash/debounce';
import { useCallback, useEffect, useState } from 'react';
import { Bar, Doughnut, Line, Pie } from 'react-chartjs-2';
import './SPpaymentDetails.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const BASE_URL = process.env.REACT_APP_API_URL;

// Styled FilterToggleButton to match RevenuePage
const FilterToggleButton = styled(IconButton)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('lg')]: {
    display: 'block',
    color: '##e42b5f',
    backgroundColor: 'transparent',
    border: '2px solid ##e42b5f',
    borderRadius: '50%',
    padding: '8px',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '##e42b5f',
      color: '#ffffff',
      transform: 'scale(1.1)',
      boxShadow: '0 4px 12px rgba(32, 21, 72, 0.4)',
    },
  },
}));

const BookingPage = () => {
  const [bookings, setBookings] = useState([]);
  const [searchInput, setSearchInput] = useState('');
  const [filterText, setFilterText] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [screenWidth, setScreenWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1024
  );
  const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [graphType, setGraphType] = useState('Bar');
  const [graphCategory, setGraphCategory] = useState('Service');
  const [graphMinDate, setGraphMinDate] = useState('');
  const [graphMaxDate, setGraphMaxDate] = useState('');
  const [dateError, setDateError] = useState('');
  const [aggregateBy, setAggregateBy] = useState({
    weekly: false,
    monthly: false,
    yearly: false,
  });
  // New state for tracking expanded cards
  const [expandedCards, setExpandedCards] = useState(new Set());
  const itemsPerPage = 5;
  const isMobile = screenWidth <= 768;

  // Update screenWidth on window resize
  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch bookings and set default graph date range
  useEffect(() => {
    const fetchBookings = async () => {
      setIsLoading(true);
      try {
        const email = localStorage.getItem('email');
        const response = await fetch(
          `${BASE_URL}/api/users/sp/bookings/${email}`
        );
        const data = await response.json();
        setBookings(data);

        // Set default min and max dates for graph
        if (data.length > 0) {
          const validDates = data
            .filter(
              (booking) =>
                booking.date && !isNaN(new Date(booking.date).getTime())
            )
            .map((booking) => new Date(booking.date));
          if (validDates.length > 0) {
            const minDate = new Date(Math.min(...validDates));
            const maxDate = new Date(Math.max(...validDates));
            setGraphMinDate(minDate.toISOString().split('T')[0]);
            setGraphMaxDate(maxDate.toISOString().split('T')[0]);
          }
        }
      } catch (err) {
        // console.error("Failed to fetch bookings:", err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchBookings();
  }, []);

  // Debounced search handler
  const debouncedSearch = useCallback(
    debounce((value) => {
      setFilterText(value);
      setCurrentPage(1);
    }, 300),
    []
  );

  // Handle input change
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchInput(value);
    debouncedSearch(value);
  };

  // Filter bookings based on specific fields and date range
  const filteredBookings = [...bookings].reverse().filter((booking) => {
    const matchesSearch = [
      booking.transactionId,
      booking.customerName,
      booking.customerEmail,
      booking.service,
      booking.favoriteEmployee,
      booking.paymentStatus,
      booking.upiId,
      booking.date ? new Date(booking.date).toLocaleDateString() : '',
      booking.amount?.toString(),
      booking.refundedAmount?.toString(),
      booking.refundStatus,
    ].some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(filterText.toLowerCase())
    );

    let matchesDate = true;
    if (fromDate || toDate) {
      if (!booking.date) return false;
      try {
        const bookingDate = new Date(booking.date);
        if (isNaN(bookingDate.getTime())) return false;
        const from = fromDate ? new Date(fromDate) : null;
        const to = toDate ? new Date(toDate) : null;
        if (to) to.setHours(23, 59, 59, 999);
        if (from && to) {
          matchesDate = bookingDate >= from && bookingDate <= to;
        } else if (from) {
          matchesDate = bookingDate >= from;
        } else if (to) {
          matchesDate = bookingDate <= to;
        }
      } catch (error) {
        matchesDate = false;
      }
    }

    return matchesSearch && matchesDate;
  });

  // Calculate total revenue (subtract refunded amounts for approved refunds)
  const totalAmount = filteredBookings.reduce(
    (sum, booking) =>
      sum +
      (booking.amount || 0) -
      (booking.refundedAmount && booking.refundStatus === 'APPROVED'
        ? booking.refundedAmount
        : 0),
    0
  );

  // Pagination logic
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredBookings.slice(
    indexOfFirstItem,
    indexOfLastItem
  );

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  // Handle refund action
  const openRefundModal = (booking) => {
    setSelectedBooking(booking);
    setIsRefundModalOpen(true);
  };

  const closeRefundModal = () => {
    setIsRefundModalOpen(false);
    setSelectedBooking(null);
  };

  const handleRefundAction = async (action) => {
    if (!selectedBooking) return;

    try {
      const response = await fetch(`${BASE_URL}/api/users/sp/refund/action`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: localStorage.getItem('email'),
          orderId: selectedBooking.orderId,
          action,
        }),
      });

      if (response.ok) {
        setBookings((prevBookings) =>
          prevBookings.map((booking) =>
            booking.orderId === selectedBooking.orderId
              ? {
                  ...booking,
                  refundStatus: action === 'accept' ? 'APPROVED' : 'REJECTED',
                }
              : booking
          )
        );
        alert(`Refund ${action}ed successfully`);
        closeRefundModal();
      } else {
        alert('Failed to process refund action');
      }
    } catch (error) {
      alert('Error processing refund action');
    }
  };

  // Format date safely
  const formatDate = (date) => {
    if (!date) return 'N/A';
    try {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate)) {
        return parsedDate.toLocaleDateString();
      }
      return 'N/A';
    } catch (e) {
      return 'N/A';
    }
  };

  // Clear all filters for table
  const clearFilter = () => {
    setSearchInput('');
    setFilterText('');
    setFromDate('');
    setToDate('');
    debouncedSearch('');
    setCurrentPage(1);
    setShowFilters(false);
  };

  // Clear filters for graph
  const clearGraphFilters = () => {
    if (bookings.length > 0) {
      const validDates = bookings
        .filter(
          (booking) => booking.date && !isNaN(new Date(booking.date).getTime())
        )
        .map((booking) => new Date(booking.date));
      if (validDates.length > 0) {
        const minDate = new Date(Math.min(...validDates));
        const maxDate = new Date(Math.max(...validDates));
        setGraphMinDate(minDate.toISOString().split('T')[0]);
        setGraphMaxDate(maxDate.toISOString().split('T')[0]);
      } else {
        setGraphMinDate('');
        setGraphMaxDate('');
      }
    } else {
      setGraphMinDate('');
      setGraphMaxDate('');
    }
    setAggregateBy({
      weekly: false,
      monthly: false,
      yearly: false,
    });
    setDateError('');
  };

  // Toggle filters visibility
  const handleToggleFilters = () => {
    setShowFilters((prev) => !prev);
  };

  // Handle date input changes and validation
  const handleGraphDateChange = (type, value) => {
    if (type === 'min') {
      setGraphMinDate(value);
    } else {
      setGraphMaxDate(value);
    }

    const min = type === 'min' ? new Date(value) : new Date(graphMinDate);
    const max = type === 'max' ? new Date(value) : new Date(graphMaxDate);
    if (min && max && !isNaN(min.getTime()) && !isNaN(max.getTime())) {
      if (min > max) {
        setDateError('Min date must be less than or equal to Max date');
      } else {
        setDateError('');
      }
    }
  };

  // Handle checkbox changes for aggregation
  const handleAggregateChange = (type) => {
    setAggregateBy((prev) => ({
      weekly: type === 'weekly' ? !prev.weekly : prev.weekly,
      monthly: type === 'monthly' ? !prev.monthly : prev.monthly,
      yearly: type === 'yearly' ? !prev.yearly : prev.yearly,
    }));
  };

  // Prepare data for the graph
  const prepareGraphData = () => {
    let labels = [];
    let data = [];

    if (graphCategory === 'Service') {
      const serviceMap = filteredBookings.reduce((acc, booking) => {
        const service = booking.service || 'Unknown';
        acc[service] =
          (acc[service] || 0) +
          (booking.amount || 0) -
          (booking.refundedAmount && booking.refundStatus === 'APPROVED'
            ? booking.refundedAmount
            : 0);
        return acc;
      }, {});

      labels = Object.keys(serviceMap);
      data = Object.values(serviceMap);
    } else if (graphCategory === 'Payment Date') {
      const dateFilteredBookings = filteredBookings.filter((booking) => {
        if (!booking.date) return false;
        const bookingDate = new Date(booking.date);
        const minDate = graphMinDate ? new Date(graphMinDate) : null;
        const maxDate = graphMaxDate ? new Date(graphMaxDate) : null;
        if (maxDate) maxDate.setHours(23, 59, 59, 999);
        return (
          (!minDate || bookingDate >= minDate) &&
          (!maxDate || bookingDate <= maxDate)
        );
      });

      const dateMap = dateFilteredBookings.reduce((acc, booking) => {
        if (!booking.date) return acc;
        const date = new Date(booking.date);
        let key = formatDate(booking.date);

        if (aggregateBy.yearly) {
          key = date.getFullYear().toString();
        } else if (aggregateBy.monthly) {
          key = `${date.getFullYear()}-${(date.getMonth() + 1)
            .toString()
            .padStart(2, '0')}`;
        } else if (aggregateBy.weekly) {
          const startOfWeek = new Date(date);
          startOfWeek.setDate(date.getDate() - date.getDay());
          key = startOfWeek.toLocaleDateString();
        }

        acc[key] =
          (acc[key] || 0) +
          (booking.amount || 0) -
          (booking.refundedAmount && booking.refundStatus === 'APPROVED'
            ? booking.refundedAmount
            : 0);
        return acc;
      }, {});

      labels = Object.keys(dateMap).sort((a, b) => new Date(a) - new Date(b));
      data = labels.map((key) => dateMap[key]);
    }

    return {
      labels,
      datasets: [
        {
          label: `Total Amount by ${graphCategory}`,
          data,
          backgroundColor: [
            'rgba(255, 99, 132, 0.6)',
            'rgba(54, 162, 235, 0.6)',
            'rgba(255, 206, 86, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(153, 102, 255, 0.6)',
            'rgba(255, 159, 64, 0.6)',
          ],
          borderColor: [
            'rgba(255, 99, 132, 1)',
            'rgba(54, 162, 235, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(75, 192, 192, 1)',
            'rgba(153, 102, 255, 1)',
            'rgba(255, 159, 64, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };
  };

  // Chart options
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: `Total Amount by ${graphCategory} ${
          graphCategory === 'Payment Date'
            ? `(${
                aggregateBy.yearly
                  ? 'Yearly'
                  : aggregateBy.monthly
                  ? 'Monthly'
                  : aggregateBy.weekly
                  ? 'Weekly'
                  : 'Daily'
              })`
            : ''
        }`,
        font: {
          size: 18,
        },
      },
    },
    scales:
      graphType === 'Bar' || graphType === 'Line'
        ? {
            x: {
              title: {
                display: true,
                text: graphCategory,
              },
            },
            y: {
              title: {
                display: true,
                text: 'Total Amount (₹)',
              },
              beginAtZero: true,
            },
          }
        : {},
  };

  // Render the appropriate chart based on graphType
  const renderChart = () => {
    const data = prepareGraphData();
    if (dateError) {
      return (
        <Typography color='error' sx={{ textAlign: 'center', mt: 2 }}>
          {dateError}
        </Typography>
      );
    }
    switch (graphType) {
      case 'Bar':
        return <Bar data={data} options={chartOptions} />;
      case 'Line':
        return <Line data={data} options={chartOptions} />;
      case 'Pie':
        return <Pie data={data} options={chartOptions} />;
      case 'Doughnut':
        return <Doughnut data={data} options={chartOptions} />;
      default:
        return <Bar data={data} options={chartOptions} />;
    }
  };

  // Calculate pagination range (max 5 pages)
  const getPaginationRange = () => {
    const rangeSize = 5;
    const halfRange = Math.floor(rangeSize / 2);
    let start = Math.max(1, currentPage - halfRange);
    let end = Math.min(totalPages, start + rangeSize - 1);

    // Adjust start if end is at totalPages
    if (end === totalPages) {
      start = Math.max(1, end - rangeSize + 1);
    }

    const pages = Array.from({ length: end - start + 1 }, (_, index) => start + index);
    const showLeftEllipsis = start > 1;
    const showRightEllipsis = end < totalPages;

    return { pages, showLeftEllipsis, showRightEllipsis };
  };

  const { pages, showLeftEllipsis, showRightEllipsis } = getPaginationRange();

  return (
    <Box
      sx={{
        minHeight: "100vh",
        width: "100vw",
        // p: { xs: "20px 10px", sm: "0px" },
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        backgroundColor: "#fad9e3",
      }}
    >
      <Box
        sx={{
          width: "100%",
          // backgroundColor: "#fad9e3",
          borderRadius: "12px",
          p: "12px",
          // boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
          // border: "1px solid #e2e8f0",
          margin: "0 auto",
          transition: "all 0.3s ease",
          animation: "fadeIn 0.5s ease-out",
          "@keyframes fadeIn": {
            from: { opacity: 0 },
            to: { opacity: 1 },
          },
          "&:hover": {
            boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            mb: "24px",
            gap: "16px",
          }}
        >
          <Box
            component="h2"
            sx={{
              fontSize: { xs: "1.75rem", sm: "2rem" },
              color: "#fb646b",
              fontWeight: "bold",
              m: 0,
              textAlign: "center",
              transition: "all 0.3s ease",
              "&:hover": {
                color: "##e42b5f",
                textShadow: "0 2px 8px rgba(32, 21, 72, 0.2)",
              },
            }}
          >
            All Payments
          </Box>
          <Box
            component="h5"
            sx={{
              fontSize: "1.1rem",
              color: "#0e0f0f",
              m: 0,
              textAlign: "center",
              fontWeight: "medium",
              transition: "all 0.3s ease",
              "&:hover": {
                color: "##e42b5f",
                transform: "scale(1.05)",
              },
            }}
          >
            Total Revenue: ₹ {totalAmount.toFixed(2)}
          </Box>
          <Box
            sx={{
              width: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                flexDirection: { xs: "column", sm: "row", lg: "row" },
                flexWrap: { sm: "wrap" },
                justifyContent: "center",
                alignItems: "center",
                gap: { xs: 2, sm: 3 },
                width: "100%",
              }}
            >
              <Box
                sx={{
                  display: { xs: "flex", lg: "none" },
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 1,
                  width: "100%",
                  maxWidth: { xs: "100%", sm: "400px" },
                }}
              >
                <Box
                  component="input"
                  type="text"
                  placeholder="Search by customer, email, service, transaction ID, UPI, date, amount, refund..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  sx={{
                    p: "10px",
                    borderRadius: "8px",
                    border: "2px solid ##e42b5f",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(4px)",
                    fontSize: "0.95rem",
                    width: "100%",
                    maxWidth: { xs: "100%", sm: "200px" },
                    color: "#0e0f0f",
                    textAlign: "center",
                    transition: "all 0.3s ease",
                    marginTop: "40px !important",
                    "&:focus": {
                      borderColor: "##e42b5f",
                      boxShadow: "0 0 10px rgba(32, 21, 72, 0.3)",
                      backgroundColor: "#ffffff",
                    },
                    "&:hover": {
                      transform: "scale(1.02)",
                      boxShadow: "0 2px 8px rgba(32, 21, 72, 0.2)",
                    },
                  }}
                />
                <FilterToggleButton
                  onClick={handleToggleFilters}
                  style={{ borderRadius: "20px", marginTop: "40px" }}
                >
                  <FilterListIcon />
                </FilterToggleButton>
              </Box>
              <Box
                component="span"
                sx={{
                  fontSize: "1.1rem",
                  color: "#0e0f0f",
                  mt: { xs: 0, sm: "20px" },
                  textAlign: "center",
                  fontWeight: "medium",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    color: "##e42b5f",
                    transform: "scale(1.05)",
                  },
                }}
              >
                Total Records: <strong>{filteredBookings.length}</strong>
              </Box>
              <Box
                sx={{
                  display: { xs: showFilters ? "flex" : "none", lg: "flex" },
                  flexDirection: { xs: "column", sm: "row" },
                  flexWrap: { sm: "wrap" },
                  justifyContent: "center",
                  alignItems: "end",
                  gap: { xs: 2, sm: 3 },
                  width: "100%",
                }}
              >
                <Box
                  component="input"
                  type="text"
                  placeholder="Search by customer, email, service, transaction ID, UPI, date, amount, refund..."
                  value={searchInput}
                  onChange={handleSearchChange}
                  sx={{
                    p: "10px",
                    mt: "0px",
                    borderRadius: "8px",
                    border: "1px solid #cbbcc0",
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(4px)",
                    fontSize: "0.95rem",
                    width: { xs: "100%", sm: "200px" },
                    maxWidth: "200px",
                    color: "#0e0f0f",
                    textAlign: "center",
                    display: { xs: "none", lg: "block" },
                    transition: "all 0.3s ease",
                    "&:focus": {
                      borderColor: "##e42b5f",
                      boxShadow: "0 0 10px rgba(32, 21, 72, 0.3)",
                      backgroundColor: "#ffffff",
                    },
                    "&:hover": {
                      transform: "scale(1.02)",
                      boxShadow: "0 2px 8px rgba(32, 21, 72, 0.2)",
                    },
                  }}
                />
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    width: { xs: "100%", sm: "auto" },
                    gap: 2,
                    justifyContent: "center",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      width: { xs: "50%", sm: "auto" },
                    }}
                  >
                    <Box
                      component="label"
                      htmlFor="fromDate"
                      sx={{
                        fontSize: "0.95rem",
                        color: "#0e0f0f",
                        mb: "6px",
                        zIndex: 3,
                        fontWeight: "medium",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          color: "##e42b5f",
                        },
                      }}
                    >
                      From Date
                    </Box>
                    <Box
                      component="input"
                      id="fromDate"
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      min={fromDate || undefined}
                      max={new Date().toISOString().split("T")[0]}
                      sx={{
                        p: "10px",
                        borderRadius: "8px",
                        border: "1px solid #cbbcc0",
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        backdropFilter: "blur(4px)",
                        fontSize: "0.95rem",
                        width: "100%",
                        maxWidth: { xs: "150px", sm: "200px" },
                        textAlign: "center",
                        color: "#0e0f0f",
                        transition: "all 0.3s ease",
                        "&:focus": {
                          borderColor: "##e42b5f",
                          boxShadow: "0 0 10px rgba(32, 21, 72, 0.3)",
                          backgroundColor: "#ffffff",
                        },
                        "&:hover": {
                          transform: "scale(1.02)",
                          boxShadow: "0 2px 8px rgba(32, 21, 72, 0.2)",
                        },
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      width: { xs: "50%", sm: "auto" },
                    }}
                  >
                    <Box
                      component="label"
                      htmlFor="toDate"
                      sx={{
                        fontSize: "0.95rem",
                        color: "#0e0f0f",
                        mb: "6px",
                        zIndex: 3,
                        fontWeight: "medium",
                        transition: "all 0.3s ease",
                        "&:hover": {
                          color: "##e42b5f",
                        },
                      }}
                    >
                      To Date
                    </Box>
                    <Box
                      component="input"
                      id="toDate"
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      min={fromDate || undefined}
                      max={new Date().toISOString().split("T")[0]}
                      sx={{
                        p: "10px",
                        borderRadius: "8px",
                        border: "1px solid #cbbcc0",
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        backdropFilter: "blur(4px)",
                        fontSize: "0.95rem",
                        width: "100%",
                        maxWidth: { xs: "150px", sm: "200px" },
                        textAlign: "center",
                        color: "#0e0f0f",
                        transition: "all 0.3s ease",
                        "&:focus": {
                          borderColor: "##e42b5f",
                          boxShadow: "0 0 10px rgba(32, 21, 72, 0.3)",
                          backgroundColor: "#ffffff",
                        },
                        "&:hover": {
                          transform: "scale(1.02)",
                          boxShadow: "0 2px 8px rgba(32, 21, 72, 0.2)",
                        },
                      }}
                    />
                  </Box>
                </Box>
                <Box
                  component="button"
                  onClick={clearFilter}
                  disabled={!searchInput && !fromDate && !toDate}
                  sx={{
                    p: "10px 20px",
                    borderRadius: "8px",
                    border: "2px solid transparent",
                    background: "#fb646b",
                    fontSize: "0.95rem",
                    fontWeight: "medium",
                    color: "#ffff",
                    marginTop: "27px !important",
                    cursor:
                      !searchInput && !fromDate && !toDate
                        ? "not-allowed"
                        : "pointer",
                    mt: { xs: 0, sm: "20px" },
                    transition: "all 0.3s ease",
                    "&:hover": {
                      ...(searchInput || fromDate || toDate
                        ? {
                            background:
                              "linear-gradient(90deg, ##e42b5f, ##e42b5f)",
                            color: "#ffffff",
                            transform: "scale(1.05)",
                            boxShadow: "0 4px 12px rgba(32, 21, 72, 0.3)",
                          }
                        : {}),
                    },
                  }}
                >
                  Clear Filters
                </Box>
              </Box>
            </Box>
          </Box>
        </Box>

        {isLoading ? (
          <div style={{ textAlign: 'center', color: '#fb646b', fontSize: '1.2rem', padding: '20px' }}>
            Loading bookings...
          </div>
        ) : (
          <>
            <div className="bookings-table">
              {isMobile ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', padding: '10px 10px' }}>
                  {currentItems.length > 0 ? (
                    currentItems.map((booking, index) => {
                      const isExpanded = expandedCards.has(indexOfFirstItem + index);
                      const toggleExpand = () => {
                        setExpandedCards((prev) => {
                          const newSet = new Set(prev);
                          if (newSet.has(indexOfFirstItem + index)) {
                            newSet.delete(indexOfFirstItem + index);
                          } else {
                            newSet.add(indexOfFirstItem + index);
                          }
                          return newSet;
                        });
                      };

                      return (
                        <div
                          key={index}
                          onClick={toggleExpand}
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            borderRadius: '8px',
                            padding: '12px',
                            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                            cursor: 'pointer',
                            transition: 'all 0.3s ease',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          <div
                            style={{
                              display: 'flex',
                              flexWrap: 'wrap',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              gap: '8px',
                              padding: '8px 0',
                            }}
                          >
                            
                            <p
                              style={{
                                flex: '1 1 45%',
                                margin: '4px 0',
                                fontSize: '0.9rem',
                                color: '#0e0f0f',
                                
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={booking.customerEmail || 'N/A'}
                            >
                              <strong style={{ color: '#fb646b' }}>Email:</strong> {booking.customerEmail || 'N/A'}
                            </p>
                            <p
                              style={{
                                flex: '1 1 45%',
                                margin: '4px 0',
                                fontSize: '0.9rem',
                                color: '#0e0f0f',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={booking.customerName || 'N/A'}
                            >
                              <strong style={{ color: '#fb646b' }}>Customer:</strong> {booking.customerName || 'N/A'}
                            </p>
                            <p
                              style={{
                                flex: '1 1 45%',
                                margin: '4px 0',
                                fontSize: '0.9rem',
                                color: '#0e0f0f',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                              title={booking.service || 'N/A'}
                            >
                              <strong style={{ color: '#fb646b' }}>Service:</strong> {booking.service || 'N/A'}
                            </p>
                            <p
                              style={{
                                flex: '1 1 45%',
                                margin: '4px 0',
                                fontSize: '0.9rem',
                                color: '#0e0f0f',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              <strong style={{ color: '#fb646b' }}>Amount:</strong> {booking.amount || 'N/A'}
                            </p>
                          </div>
                          {isExpanded && (
                            <div
                              style={{
                                padding: '8px 0',
                                borderTop: '1px solid #e2e8f0',
                                marginTop: '8px',
                                backgroundColor: 'rgba(255, 255, 255, 0.1)',
                              }}
                            >
                              <p
                                style={{
                                  margin: '4px 0',
                                  fontSize: '0.9rem',
                                  color: '#0e0f0f',
                                }}
                              >
                                <strong style={{ color: '#fb646b' }}>S.No:</strong> {indexOfFirstItem + index + 1}
                              </p>
                              <p
                                style={{
                                  margin: '4px 0',
                                  fontSize: '0.9rem',
                                  color: '#0e0f0f',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                                title={booking.transactionId || 'N/A'}
                              >
                                <strong style={{ color: '#fb646b' }}>Transaction ID:</strong> {booking.transactionId || 'N/A'}
                              </p>
                              <p
                                style={{
                                  margin: '4px 0',
                                  fontSize: '0.9rem',
                                  color: '#0e0f0f',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                                title={booking.favoriteEmployee || 'N/A'}
                              >
                                <strong style={{ color: '#fb646b' }}>Selected Employee:</strong> {booking.favoriteEmployee || 'N/A'}
                              </p>
                              <p
                                style={{
                                  margin: '4px 0',
                                  fontSize: '0.9rem',
                                  color: '#0e0f0f',
                                }}
                              >
                                <strong style={{ color: '#fb646b' }}>Payment Date:</strong> {formatDate(booking.date)}
                              </p>
                              <p
                                style={{
                                  margin: '4px 0',
                                  fontSize: '0.9rem',
                                  color: '#0e0f0f',
                                }}
                              >
                                <strong style={{ color: '#fb646b' }}>Payment Status:</strong> {booking.paymentStatus || 'N/A'}
                              </p>
                              <p
                                style={{
                                  margin: '4px 0',
                                  fontSize: '0.9rem',
                                  color: '#0e0f0f',
                                }}
                              >
                                <strong style={{ color: '#fb646b' }}>Refund Amount:</strong> {booking.refundedAmount || 'N/A'}
                              </p>
                              <p
                                style={{
                                  margin: '4px 0',
                                  fontSize: '0.9rem',
                                  color: '#0e0f0f',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                }}
                                title={booking.upiId || 'N/A'}
                              >
                                <strong style={{ color: '#fb646b' }}>UPI ID:</strong> {booking.upiId || 'N/A'}
                              </p>
                              <div
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  marginTop: '8px',
                                      height: '95px',
                                }}
                              >
                                <p
                                  style={{
                                    margin: '4px 0',
                                    fontSize: '0.9rem',
                                    color: '#0e0f0f',
                                  }}
                                >
                                  <strong style={{ color: '#fb646b' }}>REFUND:</strong>
                                </p>
                                {booking.paymentStatus === 'CANCELLED' &&
                                booking.refundedAmount > 0 &&
                                booking.refundStatus === 'PENDING' ? (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openRefundModal(booking);
                                    }}
                                    style={{
                                      padding: '6px 12px',
                                      borderRadius: '4px',
                                      backgroundColor: '#fb646b',
                                      color: '#ffffff',
                                      border: 'none',
                                      cursor: 'pointer',
                                      fontSize: '0.9rem',
                                      transition: 'all 0.3s ease',
                                    }}
                                    onMouseOver={(e) => (e.target.style.backgroundColor = '#e42b5f')}
                                    onMouseOut={(e) => (e.target.style.backgroundColor = '#fb646b')}
                                  >
                                    Process Refund
                                  </button>
                                ) : (
                                  <span
                                    style={{
                                      fontSize: '0.9rem',
                                      color:
                                        booking.refundStatus === 'APPROVED'
                                          ? 'green'
                                          : booking.refundStatus === 'REJECTED'
                                          ? 'red'
                                          : '#0e0f0f',
                                      fontWeight: booking.refundStatus ? 'bold' : 'normal',
                                    }}
                                  >
                                    {booking.refundStatus || 'N/A'}
                                  </span>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })
                  ) : (
                    <div
                      style={{
                        textAlign: 'center',
                        color: '#fb646b',
                        fontSize: '1.2rem',
                        padding: '20px',
                      }}
                    >
                      {filterText
                        ? `No bookings found for "${filterText}"`
                        : 'No bookings available'}
                    </div>
                  )}
                </div>
              ) : (
                <div className="table-container">
                  <table className="bookings-table-desktop">
                    <thead>
                      <tr>
                        <th className="table-header">S.No</th>
                        <th className="table-header">Transaction ID</th>
                        <th className="table-header customer-header">
                          Customer
                        </th>
                        <th className="table-header">Customer Email</th>
                        <th className="table-header">Selected Employee</th>
                        <th className="table-header">Service</th>
                        <th className="table-header">Payment Date</th>
                        <th className="table-header">Payment Status</th>
                        <th className="table-header">Amount</th>
                        <th className="table-header">Refund Amount</th>
                        <th className="table-header">UPI ID</th>
                        <th className="table-header">Refund Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {currentItems.length > 0 ? (
                        currentItems.map((booking, index) => (
                          <tr key={index} className="table-row">
                            <td className="table-cell">
                              {indexOfFirstItem + index + 1}
                            </td>
                            <td
                              className="table-cell transaction-id"
                              title={booking.transactionId || "N/A"}
                            >
                              {booking.transactionId || "N/A"}
                            </td>
                            <td
                              className="table-cell"
                              title={booking.customerName || "N/A"}
                            >
                              {booking.customerName || "N/A"}
                            </td>
                            <td
                              className="table-cell customer-email"
                              title={booking.customerEmail || "N/A"}
                            >
                              {booking.customerEmail || "N/A"}
                            </td>
                            <td
                              className="table-cell"
                              title={booking.favoriteEmployee || "N/A"}
                            >
                              {booking.favoriteEmployee || "N/A"}
                            </td>
                            <td
                              className="table-cell"
                              title={booking.service || "N/A"}
                            >
                              {booking.service || "N/A"}
                            </td>
                            <td className="table-cell">
                              {formatDate(booking.date)}
                            </td>
                            <td className="table-cell">
                              {booking.paymentStatus || "N/A"}
                            </td>
                            <td className="table-cell">
                              {booking.amount || "N/A"}
                            </td>
                            <td className="table-cell">
                              {booking.refundedAmount || "N/A"}
                            </td>
                            <td
                              className="table-cell upi-id"
                              title={booking.upiId || "N/A"}
                            >
                              {booking.upiId || "N/A"}
                            </td>
                            <td className="table-cell refund-action">
                              {booking.paymentStatus === "CANCELLED" &&
                              booking.refundedAmount > 0 &&
                              booking.refundStatus === "PENDING" ? (
                                <button
                                  onClick={() => openRefundModal(booking)}
                                  className="action-btn refund-btn"
                                >
                                  Process Refund
                                </button>
                              ) : (
                                <span
                                  className={`refund-status ${
                                    booking.refundStatus === "APPROVED"
                                      ? "approved"
                                      : booking.refundStatus === "REJECTED"
                                      ? "rejected"
                                      : ""
                                  }`}
                                >
                                  {booking.refundStatus || "N/A"}
                                </span>
                              )}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="12" className="no-bookings">
                            {filterText
                              ? `No bookings found for "${filterText}"`
                              : "No bookings available"}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Pagination Controls */}
            {filteredBookings.length > itemsPerPage && (
          
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: { xs: 1, sm: 2 },
              mt: 3,
              flexWrap: 'nowrap',
            }}
          >
            <Box
              component="button"
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              sx={{
                p: { xs: '8px', sm: '10px 24px' },
                borderRadius: '30px',
                border: 'none',
                background: '#fb646b',
                color: '#ffffff',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                fontWeight: '600',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                minWidth: { xs: '40px', sm: '100px' },
                height: { xs: '40px', sm: 'auto' },
                '&:hover': {
                  ...(currentPage !== 1
                    ? {
                        background: '#ffffff',
                        color: '#0e0f0f',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.25)',
                      }
                    : {}),
                },
                '&:disabled': {
                  opacity: 0.5,
                  boxShadow: 'none',
                },
              }}
            >
              {isMobile ? <ArrowBackIos sx={{ fontSize: '1rem' }} /> : 'Previous'}
            </Box>
            <Box
              sx={{
                display: 'flex',
                gap: { xs: 0.5, sm: 1 },
                alignItems: 'center',
                flexWrap: 'nowrap',
                // Removed overflowX: 'auto' to prevent scrollbars
              }}
            >
              {showLeftEllipsis && (
                <Box
                  sx={{
                    fontSize: { xs: '0.85rem', sm: '1rem' },
                    color: '#0e0f0f',
                    p: { xs: '6px', sm: '8px' },
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  ...
                </Box>
              )}
              {pages.map((page) => (
                <Box
                  key={page}
                  component="button"
                  onClick={() => paginate(page)}
                  sx={{
                    p: { xs: '6px', sm: '8px' },
                    borderRadius: '50%',
                    border: 'none',
                    background: page === currentPage ? '#fb646b' : 'transparent',
                    color: page === currentPage ? '#ffffff' : '#0e0f0f',
                    fontSize: { xs: '0.85rem', sm: '1rem' },
                    fontWeight: '600',
                    cursor: 'pointer',
                    minWidth: { xs: '30px', sm: '40px' },
                    height: { xs: '30px', sm: '40px' },
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      background: page === currentPage ? '#e65a60' : '#f1f5f9',
                      transform: 'scale(1.1)',
                    },
                  }}
                >
                  {page}
                </Box>
              ))}
              {showRightEllipsis && (
                <Box
                  sx={{
                    fontSize: { xs: '0.85rem', sm: '1rem' },
                    color: '#0e0f0f',
                    p: { xs: '6px', sm: '8px' },
                    display: 'flex',
                    alignItems: 'center',
                  }}
                >
                  ...
                </Box>
              )}
            </Box>
            <Box
              component="button"
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              sx={{
                p: { xs: '8px', sm: '10px 24px' },
                borderRadius: '30px',
                border: 'none',
                background: '#fb646b',
                color: '#ffffff',
                fontSize: { xs: '0.85rem', sm: '0.9rem' },
                fontWeight: '600',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
                minWidth: { xs: '40px', sm: '100px' },
                height: { xs: '40px', sm: 'auto' },
                '&:hover': {
                  ...(currentPage !== totalPages
                    ? {
                        background: '#ffffff',
                        color: '#0e0f0f',
                        transform: 'translateY(-2px)',
                        boxShadow: '0 6px 15px rgba(0, 0, 0, 0.25)',
                      }
                    : {}),
                },
                '&:disabled': {
                  opacity: 0.5,
                  boxShadow: 'none',
                },
              }}
            >
              {isMobile ? <ArrowForwardIos sx={{ fontSize: '1rem' }} /> : 'Next'}
            </Box>
          </Box>
       
            )}

            {/* Graph Section */}
            <Box
              sx={{
                mt: "40px",
                width: "100%",
                backgroundColor: "#ffebf1",
                borderRadius: "12px",
                p: "24px",
                boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
                border: "1px solid #e2e8f0",
                transition: "all 0.3s ease",
                "&:hover": {
                  boxShadow: "0 6px 20px rgba(0, 0, 0, 0.15)",
                },
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: { xs: "column", sm: "row" },
                  justifyContent: "space-between",
                  alignItems: "center",
                  mb: "20px",
                  gap: "16px",
                }}
              >
                <Box
                  component="h3"
                  sx={{
                    fontSize: "1.5rem",
                    color: "#fb646b",
                    fontWeight: "bold",
                    m: 0,
                  }}
                >
                  Booking Analytics
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: "16px",
                    width: { xs: "100%", sm: "auto" },
                  }}
                >
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel sx={{ color: "#fb646b" }}>
                      Graph Type
                    </InputLabel>
                    <Select
                      value={graphType}
                      onChange={(e) => setGraphType(e.target.value)}
                      label="Graph Type"
                    >
                      <MenuItem value="Bar">Bar</MenuItem>
                      <MenuItem value="Line">Line</MenuItem>
                      <MenuItem value="Pie">Pie</MenuItem>
                      <MenuItem value="Doughnut">Doughnut</MenuItem>
                    </Select>
                  </FormControl>
                  <FormControl sx={{ minWidth: 120 }}>
                    <InputLabel sx={{ color: "#fb646b" }}>Category</InputLabel>
                    <Select
                      value={graphCategory}
                      onChange={(e) => setGraphCategory(e.target.value)}
                      label="Category"
                    >
                      <MenuItem value="Service">Service</MenuItem>
                      <MenuItem value="Payment Date">Payment Date</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              </Box>

              {graphCategory === "Payment Date" && (
                <Box
                  className="booking-analytics-filters"
                  sx={{
                    display: "flex",
                    flexDirection: { xs: "column", sm: "row" },
                    gap: "16px",
                    mb: "20px",
                    alignItems: "center",
                    flexWrap: "wrap",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                    className="date-input-container"
                  >
                    <Box
                      component="label"
                      htmlFor="graphMinDate"
                      sx={{
                        fontSize: "0.95rem",
                        color: "#0e0f0f",
                        mb: "6px",
                        fontWeight: "medium",
                      }}
                    >
                      Min Date
                    </Box>
                    <Box
                      component="input"
                      id="graphMinDate"
                      type="date"
                      value={graphMinDate}
                      onChange={(e) =>
                        handleGraphDateChange("min", e.target.value)
                      }
                      sx={{
                        p: "10px",
                        borderRadius: "8px",
                        border: "1px solid #cbbcc0",
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        fontSize: "0.95rem",
                        width: { xs: "100%", sm: "150px" },
                        textAlign: "center",
                        color: "#0e0f0f",
                        transition: "all 0.3s ease",
                        "&:focus": {
                          borderColor: "##e42b5f",
                          boxShadow: "0 0 10px rgba(32, 21, 72, 0.3)",
                          backgroundColor: "#ffffff",
                        },
                        "&:hover": {
                          transform: "scale(1.02)",
                          boxShadow: "0 2px 8px rgba(32, 21, 72, 0.2)",
                        },
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                    }}
                    className="date-input-container"
                  >
                    <Box
                      component="label"
                      htmlFor="graphMaxDate"
                      sx={{
                        fontSize: "0.95rem",
                        color: "#0e0f0f",
                        mb: "6px",
                        fontWeight: "medium",
                      }}
                    >
                      Max Date
                    </Box>
                    <Box
                      component="input"
                      id="graphMaxDate"
                      type="date"
                      value={graphMaxDate}
                      onChange={(e) =>
                        handleGraphDateChange("max", e.target.value)
                      }
                      sx={{
                        p: "10px",
                        borderRadius: "8px",
                        border: "1px solid #cbbcc0",
                        backgroundColor: "rgba(255, 255, 255, 0.9)",
                        fontSize: "0.95rem",
                        width: { xs: "100%", sm: "150px" },
                        textAlign: "center",
                        color: "#0e0f0f",
                        transition: "all 0.3s ease",
                        "&:focus": {
                          borderColor: "##e42b5f",
                          boxShadow: "0 0 10px rgba(32, 21, 72, 0.3)",
                          backgroundColor: "#ffffff",
                        },
                        "&:hover": {
                          transform: "scale(1.02)",
                          boxShadow: "0 2px 8px rgba(32, 21, 72, 0.2)",
                        },
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "row",
                      gap: "16px",
                      alignItems: "center",
                    }}
                    className="checkbox-group"
                  >
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={aggregateBy.weekly}
                          onChange={() => handleAggregateChange("weekly")}
                          color="primary"
                        />
                      }
                      label="Weekly"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={aggregateBy.monthly}
                          onChange={() => handleAggregateChange("monthly")}
                          color="primary"
                        />
                      }
                      label="Monthly"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={aggregateBy.yearly}
                          onChange={() => handleAggregateChange("yearly")}
                          color="primary"
                        />
                      }
                      label="Yearly"
                    />
                  </Box>
                  <Box
                    component="button"
                    onClick={clearGraphFilters}
                    disabled={
                      !graphMinDate &&
                      !graphMaxDate &&
                      !aggregateBy.weekly &&
                      !aggregateBy.monthly &&
                      !aggregateBy.yearly
                    }
                    className="clear-filters-button"
                    sx={{
                      p: "10px 20px",
                      borderRadius: "8px",
                      border: "2px solid transparent",
                      background: "#fb646b",
                      fontSize: "0.95rem",
                      fontWeight: "medium",
                      color: "#ffff",
                      cursor:
                        !graphMinDate &&
                        !graphMaxDate &&
                        !aggregateBy.weekly &&
                        !aggregateBy.monthly &&
                        !aggregateBy.yearly
                          ? "not-allowed"
                          : "pointer",
                      transition: "all 0.3s ease",
                      "&:hover": {
                        ...(graphMinDate ||
                        graphMaxDate ||
                        aggregateBy.weekly ||
                        aggregateBy.monthly ||
                        aggregateBy.yearly
                          ? {
                              background:
                                "linear-gradient(90deg, ##e42b5f, ##e42b5f)",
                              color: "#ffffff",
                              transform: "scale(1.05)",
                              boxShadow: "0 4px 12px rgba(32, 21, 72, 0.3)",
                            }
                          : {}),
                      },
                    }}
                  >
                    Clear Filters
                  </Box>
                </Box>
              )}

              <Box
                sx={{
                  height: { xs: "300px", sm: "400px" },
                  position: "relative",
                }}
              >
                {filteredBookings.length > 0 ? (
                  renderChart()
                ) : (
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      height: "100%",
                      fontSize: "1.2rem",
                      color: "#0e0f0f",
                    }}
                  >
                    No data available for the selected filters
                  </Box>
                )}
              </Box>
            </Box>
          </>
        )}

        {/* Refund Modal */}
        {isRefundModalOpen && selectedBooking && (
          <div className="modal-backdrop" onClick={closeRefundModal}>
            <div className="refund-modal" onClick={(e) => e.stopPropagation()}>
              <h3 className="modal-title">Process Refund</h3>
              <p className="modal-text">
                <strong>Customer:</strong>{" "}
                {selectedBooking.customerName || "N/A"}
              </p>
              <p className="modal-text">
                <strong>Service:</strong> {selectedBooking.service || "N/A"}
              </p>
              <p className="modal-text">
                <strong>Refund Amount:</strong>{" "}
                {selectedBooking.refundedAmount || "N/A"}
              </p>
              <p className="modal-text">
                <strong>UPI ID:</strong> {selectedBooking.upiId || "N/A"}
              </p>
              <div className="modal-actions">
                <button
                  onClick={() => handleRefundAction("accept")}
                  className="action-btn accept-btn"
                >
                  Accept Refund
                </button>
                <button
                  onClick={() => handleRefundAction("reject")}
                  className="action-btn reject-btn"
                >
                  Reject Refund
                </button>
              </div>
              <button onClick={closeRefundModal} className="close-btn">
                Close
              </button>
            </div>
          </div>
        )}
      </Box>
    </Box>
  );
};

export default BookingPage;
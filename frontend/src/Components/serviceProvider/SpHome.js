import React, { useState, useEffect } from "react";
import axios from "axios";
import { FaMoneyBillWave, FaCalendarAlt, FaTools, FaChartLine } from "react-icons/fa";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar, Line, Doughnut } from "react-chartjs-2";

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

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

function SpHome() {
  const [animateSections, setAnimateSections] = useState(false);
  const [servicesData, setServicesData] = useState([]);
  const [employeesData, setEmployeesData] = useState([]);
  const [bookingsData, setBookingsData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [retryCount, setRetryCount] = useState(0);
  const [selectedBookingsMonth, setSelectedBookingsMonth] = useState(null);
  const [chartMode, setChartMode] = useState("count");
  const [bookingsViewMode, setBookingsViewMode] = useState("month");
  const [role, setRole] = useState(null);
  const maxRetries = 3;

  // Fetch role
  useEffect(() => {
    const getRole = async () => {
      try {
        const email = localStorage.getItem("email");
        if (!email) {
          console.error("No email found in localStorage");
          setErrors({ general: "User email not found. Please login." });
          return;
        }
        const response = await axios.get(`${BASE_URL}/api/users/role/${email}`);
        setRole(response.data.role);
        console.log("Role fetched:", response.data.role);
      } catch (error) {
        console.error("SpHome: Error fetching role:", error.message);
        setErrors({ general: `Error fetching role: ${error.message}` });
      }
    };
    getRole();
  }, []);

  // Fetch services
  const fetchServices = async () => {
    const userEmail = localStorage.getItem("email");
    if (!userEmail) {
      setErrors({ services: "User email not found in localStorage. Please login." });
      console.error("No email found in localStorage");
      return;
    }
    try {
      const response = await axios.get(`${BASE_URL}/api/admin/get-services/${userEmail}`);
      const services = Array.isArray(response.data) ? response.data : [];
      setServicesData(services.reverse());
      console.log("Services data:", services);
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        services: `Services API failed: ${error.message} (Status: ${error.response?.status || "N/A"})`,
      }));
      console.error("SpHome: Error fetching services:", error.message, error.response?.data || error);
    }
  };

  // Fetch all data
  const fetchData = async () => {
    const email = localStorage.getItem("email");
    if (!email) {
      setErrors({ general: "User email not found in localStorage. Please login." });
      console.error("No email found in localStorage");
      return;
    }
    console.log("Fetching data for email:", email);
    console.log("BASE_URL:", BASE_URL);

    setIsLoading(true);
    setErrors({});
    const newErrors = {};

    try {
      await fetchServices();
      try {
        const employeesResponse = await axios.get(`${BASE_URL}/api/admin/get-manpower/${email}`, {
          timeout: 5000,
        });
        const employees = Array.isArray(employeesResponse.data) ? employeesResponse.data : [];
        setEmployeesData(employees.reverse());
        console.log("Employees data:", employees);
      } catch (err) {
        newErrors.employees = `Employees API failed: ${err.message} (Status: ${err.response?.status || "N/A"})`;
        console.error("Employees error:", err.response?.data || err);
      }
      try {
        const bookingsResponse = await axios.get(`${BASE_URL}/api/users/sp/bookings/${email}`, {
          timeout: 5000,
          headers: { "Content-Type": "application/json" },
        });
        const bookings = Array.isArray(bookingsResponse.data) ? bookingsResponse.data : [];
        const formattedBookings = bookings.map((booking) => ({
          ...booking,
          discountAmount: booking.discountAmount || 0,
          remainingAmount: Math.max(
            0,
            (booking.total_amount || 0) - (booking.amount || 0) - (booking.discountAmount || 0)
          ),
        }));
        setBookingsData(formattedBookings);
        console.log("Bookings data:", formattedBookings);
      } catch (err) {
        newErrors.bookings = `Bookings API failed: ${err.message} (Status: ${err.response?.status || "N/A"})`;
        console.error("Bookings error:", err.response?.data || err);
      }
      if (Object.keys(newErrors).length > 0) {
        if (retryCount < maxRetries) {
          setRetryCount(retryCount + 1);
          setTimeout(fetchData, 2000 * (retryCount + 1));
          setErrors({
            ...newErrors,
            general: `Retrying (${retryCount + 1}/${maxRetries})...`,
          });
        } else {
          setErrors({
            ...newErrors,
            general: "Failed to fetch some data after retries.",
          });
        }
      } else {
        setRetryCount(0);
      }
    } catch (err) {
      setErrors({ general: `Unexpected error: ${err.message}` });
      console.error("Unexpected fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (role) {
      fetchData();
    }
  }, [role]);

  // Stats for Dashboard
  const stats = [
    {
      title: "Total Earnings",
      value: bookingsData.length
        ? `₹${bookingsData
            .reduce(
              (sum, booking) =>
                sum +
                (booking.amount || 0) -
                (booking.refundedAmount && booking.refundStatus === "APPROVED"
                  ? booking.refundedAmount
                  : 0),
              0
            )
            .toFixed(2)}`
        : "₹0.00",
      icon: <FaMoneyBillWave />,
    },
    {
      title: "Pending Bookings",
      value: bookingsData.length
        ? bookingsData.filter((b) => b.confirmed !== "Confirmed").length
        : 0,
      icon: <FaCalendarAlt />,
    },
    {
      title: "Completed Services",
      value: bookingsData.length
        ? bookingsData.filter((b) => b.confirmed === "Confirmed").length
        : 0,
      icon: <FaTools />,
    },
    {
      title: "Performance",
      value: employeesData.length > 0 ? "92%" : "N/A",
      icon: <FaChartLine />,
    },
  ];

  // Services Chart Data
  const getServicesChartData = () => {
    const roleOptions = {
      Salon: ["HairCut", "Facial", "HairColor", "Shaving"],
      Beauty_Parler: ["HairCut", "Bridal", "Waxing", "Pedicure"],
      Doctor: ["Hair Treatment", "Skin Treatment"],
    };
    const validServices = role ? (roleOptions[role] || []) : [];
    const uniqueServices = servicesData.length
      ? [...new Set(servicesData.map((s) => s.serviceName || "Unknown"))].filter(
          (service) => validServices.length === 0 || validServices.includes(service)
        )
      : ["No Services"];
    const colors = [
      "#3498DB",
      "#E67E22",
      "#2ECC71",
      "#9B59B6",
      "#E74C3C",
      "#1ABC9C",
      "#F1C40F",
      "#8E44AD",
      "#34495E",
      "#27AE60",
    ];
    return {
      labels: uniqueServices,
      datasets: [
        {
          label: chartMode === "count" ? "Service Count" : "Payments (₹)",
          data: uniqueServices.map((service) => {
            if (chartMode === "count") {
              return servicesData.filter((s) => (s.serviceName || "Unknown") === service).length;
            } else {
              return bookingsData
                .filter((b) => (b.service || "Unknown") === service)
                .reduce(
                  (sum, b) =>
                    sum +
                    (b.amount || 0) -
                    (b.refundedAmount && b.refundStatus === "APPROVED" ? b.refundedAmount : 0),
                  0
                );
            }
          }),
          backgroundColor: uniqueServices.map((_, idx) => colors[idx % colors.length]),
          borderColor: "#FFFFFF",
          borderWidth: 1,
        },
      ],
    };
  };

  // Services Chart
  const servicesChart = {
    type: "doughnut",
    data: getServicesChartData(),
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "top",
          labels: { color: "#2C3E50", font: { size: window.innerWidth < 768 ? 12 : 14 } },
        },
        title: {
          display: true,
          text: "Service Distribution by Type",
          color: "#2C3E50",
          font: { size: window.innerWidth < 768 ? 14 : 16 },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.label || "";
              const value = context.raw || 0;
              return `${label}: ${chartMode === "count" ? value : `₹${value.toFixed(2)}`}`;
            },
          },
        },
      },
    },
  };

  // Bookings Chart
  const bookingsChart = {
    type: "bar",
    data: (() => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const year = new Date().getFullYear();

      if (bookingsViewMode === "day" && selectedBookingsMonth !== null) {
        const monthIndex = selectedBookingsMonth;
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        const dates = Array.from({ length: daysInMonth }, (_, i) => {
          const date = new Date(year, monthIndex, i + 1);
          return {
            formatted: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
            iso: `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`,
          };
        });

        const datasets = [
          {
            label: chartMode === "count" ? "Bookings" : "Payments (₹)",
            data: dates.map(({ iso }) => {
              if (chartMode === "count") {
                return bookingsData.filter((b) => {
                  if (!b.date || isNaN(new Date(b.date).getTime())) {
                    console.warn("Invalid booking date:", b);
                    return false;
                  }
                  const bookingDate = new Date(b.date);
                  const dateStr = bookingDate.toISOString().split("T")[0];
                  return dateStr === iso;
                }).length;
              } else {
                return bookingsData
                  .filter((b) => {
                    if (!b.date || isNaN(new Date(b.date).getTime())) {
                      console.warn("Invalid booking date:", b);
                      return false;
                    }
                    const bookingDate = new Date(b.date);
                    const dateStr = bookingDate.toISOString().split("T")[0];
                    return dateStr === iso;
                  })
                  .reduce(
                    (sum, b) =>
                      sum +
                      (b.amount || 0) -
                      (b.refundedAmount && b.refundStatus === "APPROVED" ? b.refundedAmount : 0),
                    0
                  );
              }
            }),
            backgroundColor: "#3498DB",
            borderColor: "#FFFFFF",
            borderWidth: 1,
          },
        ];

        return {
          labels: dates.map(({ formatted }) => formatted),
          datasets,
        };
      } else if (bookingsViewMode === "week" && selectedBookingsMonth !== null) {
        const monthIndex = selectedBookingsMonth;
        const daysInMonth = new Date(year, monthIndex + 1, 0).getDate();
        const weeks = [];
        for (let day = 1; day <= daysInMonth; day += 7) {
          const startDate = new Date(year, monthIndex, day);
          const endDay = Math.min(day + 6, daysInMonth);
          const endDate = new Date(year, monthIndex, endDay);
          weeks.push({
            start: startDate,
            end: endDate,
            label: `Week ${Math.ceil(day / 7)} (${startDate.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })} - ${endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })})`,
            startIso: `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
            endIso: `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(endDay).padStart(2, "0")}`,
          });
        }

        const datasets = [
          {
            label: chartMode === "count" ? "Bookings" : "Payments (₹)",
            data: weeks.map(({ startIso, endIso }) => {
              if (chartMode === "count") {
                return bookingsData.filter((b) => {
                  if (!b.date || isNaN(new Date(b.date).getTime())) {
                    console.warn("Invalid booking date:", b);
                    return false;
                  }
                  const bookingDate = new Date(b.date);
                  const dateStr = bookingDate.toISOString().split("T")[0];
                  return dateStr >= startIso && dateStr <= endIso;
                }).length;
              } else {
                return bookingsData
                  .filter((b) => {
                    if (!b.date || isNaN(new Date(b.date).getTime())) {
                      console.warn("Invalid booking date:", b);
                      return false;
                    }
                    const bookingDate = new Date(b.date);
                    const dateStr = bookingDate.toISOString().split("T")[0];
                    return dateStr >= startIso && dateStr <= endIso;
                  })
                  .reduce(
                    (sum, b) =>
                      sum +
                      (b.amount || 0) -
                      (b.refundedAmount && b.refundStatus === "APPROVED" ? b.refundedAmount : 0),
                    0
                  );
              }
            }),
            backgroundColor: "#3498DB",
            borderColor: "#FFFFFF",
            borderWidth: 1,
          },
        ];

        return {
          labels: weeks.map(({ label }) => label),
          datasets,
        };
      } else {
        const datasets = [
          {
            label: chartMode === "count" ? "Bookings" : "Payments (₹)",
            data: months.map((_, monthIdx) => {
              if (chartMode === "count") {
                return bookingsData.filter((b) => {
                  if (!b.date || isNaN(new Date(b.date).getTime())) {
                    console.warn("Invalid booking date:", b);
                    return false;
                  }
                  const date = new Date(b.date);
                  return date.getMonth() === monthIdx;
                }).length;
              } else {
                return bookingsData
                  .filter((b) => {
                    if (!b.date || isNaN(new Date(b.date).getTime())) {
                      console.warn("Invalid booking date:", b);
                      return false;
                    }
                    const date = new Date(b.date);
                    return date.getMonth() === monthIdx;
                  })
                  .reduce(
                    (sum, b) =>
                      sum +
                      (b.amount || 0) -
                      (b.refundedAmount && b.refundStatus === "APPROVED" ? b.refundedAmount : 0),
                    0
                  );
              }
            }),
            backgroundColor: "#3498DB",
            borderColor: "#FFFFFF",
            borderWidth: 1,
          },
        ];

        return {
          labels: months,
          datasets,
        };
      }
    })(),
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: chartMode === "count" ? "Number of Bookings" : "Payments (₹)",
            color: "#2C3E50",
            font: { size: window.innerWidth < 768 ? 12 : 14 },
          },
          ticks: { color: "#2C3E50", font: { size: window.innerWidth < 768 ? 10 : 12 } },
        },
        x: {
          title: {
            display: true,
            text:
              bookingsViewMode === "day" ? "Date" : bookingsViewMode === "week" ? "Week" : "Month",
            color: "#2C3E50",
            font: { size: window.innerWidth < 768 ? 12 : 14 },
          },
          ticks: {
            color: "#2C3E50",
            font: { size: window.innerWidth < 768 ? 10 : 12 },
            autoSkip: bookingsViewMode === "day",
            maxRotation: bookingsViewMode === "day" ? 45 : 0,
            minRotation: bookingsViewMode === "day" ? 45 : 0,
          },
        },
      },
      plugins: {
        legend: { position: "top", labels: { color: "#2C3E50", font: { size: window.innerWidth < 768 ? 12 : 14 } } },
        title: {
          display: true,
          text:
            bookingsViewMode === "day" && selectedBookingsMonth !== null
              ? `Bookings - ${new Date(0, selectedBookingsMonth).toLocaleString("default", { month: "long" })}`
              : bookingsViewMode === "week" && selectedBookingsMonth !== null
              ? `Bookings by Week - ${new Date(0, selectedBookingsMonth).toLocaleString("default", { month: "long" })}`
              : "Bookings by Month",
          color: "#2C3E50",
          font: { size: window.innerWidth < 768 ? 14 : 16 },
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              const label = context.dataset.label || "";
              const value = context.raw || 0;
              return `${label}: ${chartMode === "count" ? value : `₹${value.toFixed(2)}`}`;
            },
          },
        },
      },
      onClick: (event, elements) => {
        if (elements.length > 0 && bookingsViewMode === "month") {
          const monthIndex = elements[0].index;
          setSelectedBookingsMonth(monthIndex);
          setBookingsViewMode("week");
        }
      },
    },
  };

  // Payments Chart
  const paymentsChart = {
    type: "line",
    data: {
      labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
      datasets: [
        {
          label: "Payments (₹)",
          data: bookingsData.length
            ? Array(12)
                .fill(0)
                .map((_, i) =>
                  bookingsData
                    .filter((b) => {
                      if (!b.date || isNaN(new Date(b.date).getTime())) {
                        console.warn("Invalid booking date:", b);
                        return false;
                      }
                      const date = new Date(b.date);
                      return date.getMonth() === i;
                    })
                    .reduce(
                      (sum, b) =>
                        sum +
                        (b.amount || 0) -
                        (b.refundedAmount && b.refundStatus === "APPROVED" ? b.refundedAmount : 0),
                      0
                    )
                )
            : [0],
          borderColor: "#3498DB",
          backgroundColor: "rgba(52, 152, 219, 0.2)",
          fill: true,
          tension: 0.4,
          borderWidth: window.innerWidth < 768 ? 2 : 3,
          pointRadius: window.innerWidth < 768 ? 3 : 4,
          pointBackgroundColor: "#FFFFFF",
          pointBorderColor: "#3498DB",
          pointBorderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 1000,
        easing: "easeInOutQuad",
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Amount (₹)",
            color: "#2C3E50",
            font: { size: window.innerWidth < 768 ? 12 : 14, weight: "600" },
          },
          ticks: {
            color: "#2C3E50",
            font: { size: window.innerWidth < 768 ? 10 : 12 },
            callback: (value) => `₹${value.toFixed(0)}`,
          },
          grid: { color: "rgba(44, 62, 80, 0.1)" },
        },
        x: {
          title: {
            display: true,
            text: "Month",
            color: "#2C3E50",
            font: { size: window.innerWidth < 768 ? 12 : 14, weight: "600" },
          },
          ticks: { color: "#2C3E50", font: { size: window.innerWidth < 768 ? 10 : 12 } },
          grid: { display: false },
        },
      },
      plugins: {
        legend: {
          position: "top",
          labels: { color: "#2C3E50", font: { size: window.innerWidth < 768 ? 12 : 14 } },
        },
        title: {
          display: true,
          text: "Monthly Payment Trends",
          color: "#2C3E50",
          font: { size: window.innerWidth < 768 ? 16 : 20, weight: "600" },
          padding: { top: 10, bottom: 20 },
        },
        tooltip: {
          backgroundColor: "rgba(44, 62, 80, 0.9)",
          titleColor: "#FFFFFF",
          bodyColor: "#FFFFFF",
          callbacks: {
            label: (context) => {
              const value = context.raw || 0;
              return `Payments: ₹${value.toFixed(2)}`;
            },
          },
        },
      },
    },
  };

  // Admin Chart
  const adminChart = {
    type: "bar",
    data: {
      labels: employeesData.length ? employeesData.map((e) => e.name || "Unknown") : ["No Employees"],
      datasets: [
        {
          label: "Employee Salaries",
          data: employeesData.length ? employeesData.map((e) => e.salary || 0) : [0],
          backgroundColor: "#9B59B6",
          borderColor: "#FFFFFF",
          borderWidth: 1,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: "Salary (₹)",
            color: "#2C3E50",
            font: { size: window.innerWidth < 768 ? 12 : 14 },
          },
          ticks: { color: "#2C3E50", font: { size: window.innerWidth < 768 ? 10 : 12 } },
        },
        x: {
          title: {
            display: true,
            text: "Employee",
            color: "#2C3E50",
            font: { size: window.innerWidth < 768 ? 12 : 14 },
          },
          ticks: { color: "#2C3E50", font: { size: window.innerWidth < 768 ? 10 : 12 } },
        },
      },
      plugins: {
        legend: { position: "top", labels: { color: "#2C3E50", font: { size: window.innerWidth < 768 ? 12 : 14 } } },
        title: {
          display: true,
          text: "Employee Salaries",
          color: "#2C3E50",
          font: { size: window.innerWidth < 768 ? 14 : 16 },
        },
      },
    },
  };

  useEffect(() => {
    setAnimateSections(false);
    setTimeout(() => setAnimateSections(true), 10);
  }, [selectedBookingsMonth, chartMode, bookingsViewMode]);

  const renderContent = () => {
    if (isLoading) {
      return <div style={{ textAlign: "center", color: "#2C3E50" }}>Loading data...</div>;
    }
    if (errors.general && !servicesData.length && !employeesData.length && !bookingsData.length) {
      return (
        <div style={{ textAlign: "center", color: "#E74C3C" }}>
          {errors.general}
          <button
            onClick={() => {
              setRetryCount(0);
              fetchData();
            }}
            style={{
              marginLeft: "10px",
              padding: "8px 16px",
              cursor: "pointer",
              border: "none",
              borderRadius: "5px",
              fontSize: "clamp(12px, 2vw, 14px)",
            }}
          >
            Retry
          </button>
        </div>
      );
    }

    const totalPayments = bookingsData.length
      ? bookingsData
          .reduce(
            (sum, b) =>
              sum +
              (b.amount || 0) -
              (b.refundedAmount && b.refundStatus === "APPROVED" ? b.refundedAmount : 0),
            0
          )
          .toFixed(2)
      : "0.00";

    return (
      <>
        <div className="row mb-4">
          {stats.map((stat, index) => (
            <div key={index} className="col-12 col-sm-6 col-md-4 col-lg-3 mb-3">
              <div
                className="card h-100 shadow-sm"
                style={{
                  borderRadius: "10px",
                }}
              >
                <div className="card-body d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="text-muted">{stat.title}</h6>
                    <h4>{stat.value}</h4>
                  </div>
                  <div style={{ fontSize: "24px" }}>{stat.icon}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="row mb-4">
          <div
            className={`col-12 col-md-6 mb-4 ${animateSections ? "animate-section" : ""}`}
            style={{ animationDelay: "0s" }}
          >
            <div
              className="card h-100 shadow-sm"
              style={{ borderRadius: "10px" }}
            >
              <div className="card-body">
  <h5 className="card-title">
    Booking Details{" "}
    {errors.bookings && <span style={{ color: "#E74C3C" }}>(Error: {errors.bookings})</span>}
  </h5>
  <div style={{ marginBottom: "1rem", display: "flex", gap: "10px", flexWrap: "wrap" }}>
    <select
      value={chartMode}
      onChange={(e) => setChartMode(e.target.value)}
      style={{ padding: "5px", borderRadius: "5px", color: "#2C3E50", minWidth: "120px" }}
      aria-label="Select chart mode for bookings"
    >
      <option value="count">Booking Count</option>
      <option value="payments">Payments</option>
    </select>
  </div>
  {bookingsData.length === 0 && !errors.bookings ? (
    <div style={{ textAlign: "center", color: "#E74C3C" }}>
      No bookings data available.
    </div>
  ) : (
    <div
      style={{ height: window.innerWidth < 768 ? "250px" : "300px", width: "100%" }}
      role="img"
      aria-label="Bar chart showing bookings by month"
    >
      <Bar data={bookingsChart.data} options={bookingsChart.options} />
    </div>
  )}
</div>
            </div>
          </div>
          <div
            className={`col-12 col-md-6 mb-4 ${animateSections ? "animate-section" : ""}`}
            style={{ animationDelay: "0.1s" }}
          >
            <div
              className="card h-100 shadow-sm"
              style={{
                borderRadius: "12px",
                border: "1px solid rgba(44, 62, 80, 0.1)",
                transition: "transform 0.3s ease, box-shadow 0.3s ease",
              }}
            >
              <div className="card-body" style={{ padding: window.innerWidth < 768 ? "15px" : "20px" }}>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h2
                    className="card-title"
                    style={{
                      fontSize: window.innerWidth < 768 ? "1.25rem" : "1.5rem",
                      fontWeight: "600",
                      color: "#2C3E50",
                      margin: 0,
                    }}
                  >
                    Payment Details
                  </h2>
                  {errors.bookings && (
                    <span
                      style={{
                        color: "#E74C3C",
                        fontSize: window.innerWidth < 768 ? "0.9rem" : "1rem",
                        padding: "4px 8px",
                        borderRadius: "4px",
                      }}
                    >
                      Error: {errors.bookings}
                    </span>
                  )}
                </div>
                <div
                  style={{
                    fontSize: window.innerWidth < 768 ? "1.1rem" : "1.25rem",
                    fontWeight: "600",
                    marginBottom: "15px",
                  }}
                >
                  Total Payments: ₹{totalPayments}
                </div>
                <div
                  style={{
                    height: window.innerWidth < 768 ? "250px" : "300px",
                    width: "100%",
                  }}
                  role="img"
                  aria-label="Line chart showing monthly payment trends"
                >
                  <Line data={paymentsChart.data} options={paymentsChart.options} />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="row">
          <div
            className={`col-12 col-md-6 mb-4 ${animateSections ? "animate-section" : ""}`}
            style={{ animationDelay: "0.2s" }}
          >
            <div
              className="card h-100 shadow-sm"
              style={{ borderRadius: "10px" }}
            >
              <div className="card-body">
                <h5 className="card-title">
                  Services {errors.services && <span style={{ color: "#E74C3C" }}>(Error: {errors.services})</span>}
                </h5>
                <div style={{ marginBottom: "1rem", display: "flex", gap: "10px", flexWrap: "wrap" }}>
                  <select
                    value={chartMode}
                    onChange={(e) => setChartMode(e.target.value)}
                    style={{ padding: "5px", borderRadius: "5px", color: "#2C3E50", minWidth: "120px" }}
                    aria-label="Select chart mode for services"
                  >
                    <option value="count">Service Count</option>
                    <option value="payments">Payments</option>
                  </select>
                </div>
                {servicesData.length === 0 && !errors.services ? (
                  <div style={{ textAlign: "center", color: "#E74C3C" }}>
                    No services data available.
                  </div>
                ) : (
                  <div style={{ maxWidth: window.innerWidth < 768 ? "100%" : "400px", margin: "0 auto" }}>
                    <div
                      style={{ height: window.innerWidth < 768 ? "300px" : "400px" }}
                      role="img"
                      aria-label="Doughnut chart showing service distribution"
                    >
                      <Doughnut data={servicesChart.data} options={servicesChart.options} />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div
            className={`col-12 col-md-6 mb-4 ${animateSections ? "animate-section" : ""}`}
            style={{ animationDelay: "0.3s" }}
          >
            <div
              className="card h-100 shadow-sm"
              style={{ borderRadius: "10px" }}
            >
              <div className="card-body">
                <h5 className="card-title">
                  Admin Panel {errors.employees && <span style={{ color: "#E74C3C" }}>(Error: {errors.employees})</span>}
                </h5>
                <div
                  style={{ height: window.innerWidth < 768 ? "300px" : "400px", width: "100%" }}
                  role="img"
                  aria-label="Bar chart showing employee salaries"
                >
                  <Bar data={adminChart.data} options={adminChart.options} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div style={{ minHeight: "100vh" }}>
      <div className="container-fluid p-2 p-md-4">
        <div className="d-flex justify-content-center align-items-center">
          <h2 className="service-title"
            style={{
              fontWeight: "bold",
              fontSize: window.innerWidth < 768 ? "1.5rem" : "2rem",
            }}
          >
            Dashboard
          </h2>
        </div>
      </div>
      <div className="content-container container-fluid p-2 p-md-4">{renderContent()}</div>
      <style>{`
        .animate-section {
          animation: slideInUp 0.6s ease-in-out forwards;
        }
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        select, button {
          padding: 8px;
          border-radius: 5px;
          border: 1px solid #cccccc;
          color: #2C3E50;
          cursor: pointer;
          font-size: clamp(12px, 2vw, 14px);
          transition: border-color 0.3s;
          min-width: 100px;
        }
        select:focus, button:focus {
          outline: none;
          border-color: #3498DB;
          box-shadow: 0 0 6px rgba(52, 152, 219, 0.3);
        }
        select:hover, button:hover {
          border-color: #3498DB;
        }
        button {
          border: none;
        }
        button:hover {
          transform: translateY(-1px);
        }
        .card {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .card:hover {
          transform: translateY(-3px);
          box-shadow: 0 6px 12px rgba(0, 0, 0, 0.1);
        }
        .content-container {
          padding: 0 clamp(10px, 5%, 20px);
        }
        @media (max-width: 767px) {
          .card {
            margin-bottom: 15px;
          }
          .card-body {
            padding: 15px;
          }
          h5.card-title {
            font-size: 1.1rem;
          }
          h6.text-muted {
            font-size: 0.85rem;
          }
          h4 {
            font-size: 1.1rem;
          }
        }
        @media (min-width: 768px) and (max-width: 991px) {
          .card-body {
            padding: 20px;
          }
          h5.card-title {
            font-size: 1.3rem;
          }
        }
        @media (max-width: 575px) {
          select, button {
            width: 100%;
            margin-bottom: 8px;
          }
          .d-flex.gap-10 {
            flex-direction: column;
            align-items: stretch;
          }
        }
      `}</style>
    </div>
  );
}

export default SpHome;
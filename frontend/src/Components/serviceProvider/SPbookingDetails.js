import axios from "axios";
import ArrowBackIos from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import React, { useEffect, useRef, useState } from "react";
import "./SpBookingDetails.css";
import {Box} from '@mui/material';

const BASE_URL = process.env.REACT_APP_API_URL;

const ConfirmationModal = ({
  isOpen,
  onClose,
  booking,
  inputId,
  setInputId,
  isConfirmed,
  setIsConfirmed,
  error,
  setError,
  onConfirm,
}) => {
  if (!isOpen || !booking) return null;

  const handleSubmit = async () => {
    const userEmail = localStorage.getItem("email");

    if (!inputId || inputId.trim() === "") {
      setError("Please enter a PIN.");
      return;
    }

    if (String(inputId) === String(booking.pin)) {
      try {
        const response = await axios.put(
          `${BASE_URL}/api/users/update-confirmation`,
          {
            email: userEmail,
            bookingId: booking._id,
          }
        );

        setIsConfirmed(true);
        setError("");
        onConfirm(booking._id);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Failed to confirm booking. Please try again later."
        );
      }
    } else {
      setError("Invalid PIN. Please try again.");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="confirmation-modal">
        {!isConfirmed ? (
          <>
            <h3 className="modal-title">Verify PIN</h3>
            <input
              type="text"
              placeholder="Enter Secret PIN"
              value={inputId}
              onChange={(e) => setInputId(e.target.value)}
              className={`modal-input ${error ? "error" : ""}`}
            />
            {error && <p className="error-message">{error}</p>}
            <div className="modal-actions">
              <button className="submit-btn" onClick={handleSubmit}>
                Submit
              </button>
              <button className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="success-icon">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h3 className="modal-title">Booking Confirmed!</h3>
            <p className="modal-text">
              PIN: {booking.pin} verified successfully.
            </p>
            <button className="close-btn" onClick={onClose}>
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const ComplaintModal = ({
  isOpen,
  onClose,
  booking,
  complaintText,
  setComplaintText,
  isSubmitted,
  setIsSubmitted,
  error,
  setError,
  onSubmit,
}) => {
  if (!isOpen || !booking) return null;

  const handleSubmit = async () => {
    const userEmail = localStorage.getItem("email");

    if (complaintText.trim() === "") {
      setError("Please enter a complaint.");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/users/submit-complaint`,
        {
          email: userEmail,
          bookingId: booking._id,
          complaint: complaintText,
        }
      );

      setIsSubmitted(true);
      setError("");
      onSubmit(booking._id);
    } catch (err) {
      setError("Failed to submit complaint. Please try again later.");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="complaint-modal">
        {!isSubmitted ? (
          <>
            <h3 className="modal-title">Submit Complaint</h3>
            <textarea
              placeholder="Describe your complaint..."
              value={complaintText}
              onChange={(e) => setComplaintText(e.target.value)}
              className={`modal-textarea ${error ? "error" : ""}`}
            />
            {error && <p className="error-message">{error}</p>}
            <div className="modal-actions">
              <button className="submit-btn" onClick={handleSubmit}>
                Submit
              </button>
              <button className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="success-icon">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h3 className="modal-title">Complaint Submitted!</h3>
            <button className="close-btn" onClick={onClose}>
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const ComplaintViewModal = ({ isOpen, onClose, booking }) => {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !booking) return null;

  return (
    <div className="modal-backdrop">
      <div className="complaint-view-modal" ref={modalRef}>
        <button className="modal-close-btn" onClick={onClose}>
          ✕
        </button>
        <h3 className="modal-title">Complaint Details</h3>
        <p className="modal-text">
          <strong>Booking ID:</strong> {booking._id}
        </p>
        <p className="modal-text">
          <strong>Service Provider Complaint:</strong>{" "}
          {booking.spComplaint || "No complaint provided."}
        </p>
      </div>
    </div>
  );
};

const PaymentModal = ({
  isOpen,
  onClose,
  booking,
  paymentAmount,
  setPaymentAmount,
  isPaid,
  setIsPaid,
  error,
  setError,
  onPayment,
}) => {
  if (!isOpen || !booking) return null;

  const remainingAmount =
    booking.total_amount -
    (booking.amount || 0) -
    (booking.discountAmount || 0);

  const handleSubmit = async () => {
    const amountToPay = parseFloat(paymentAmount);

    if (!amountToPay || amountToPay <= 0) {
      setError("Please enter a valid payment amount.");
      return;
    }

    if (amountToPay > remainingAmount) {
      setError(
        `Payment amount cannot exceed remaining amount of ₹${remainingAmount.toFixed(
          2
        )}.`
      );
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/users/collect/payment`,
        {
          bookingId: booking._id,
          paymentAmount: amountToPay,
        }
      );

      setIsPaid(true);
      setError("");
      onPayment(booking._id, amountToPay, response.data.paymentStatus);
    } catch (err) {
      setError("Failed to process payment. Please try again later.");
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="payment-modal">
        {!isPaid ? (
          <>
            <h3 className="modal-title">Collect Payment</h3>
            <p className="modal-text">
              Total Amount: ₹{booking.total_amount.toFixed(2)}
            </p>
            <p className="modal-text">
              Paid Amount: ₹{(booking.amount || 0).toFixed(2)}
            </p>
            {booking.discountAmount > 0 && (
              <p className="modal-text">
                Discount: ₹{booking.discountAmount.toFixed(2)}
              </p>
            )}
            <p className="modal-text">
              Remaining Amount: ₹
              {remainingAmount > 0 ? remainingAmount.toFixed(2) : 0}
            </p>
            <input
              type="number"
              placeholder="Enter Payment Amount"
              value={paymentAmount}
              onChange={(e) => setPaymentAmount(e.target.value)}
              className={`modal-input ${error ? "error" : ""}`}
            />
            {error && <p className="error-message">{error}</p>}
            <div className="modal-actions">
              <button className="submit-btn" onClick={handleSubmit}>
                Submit
              </button>
              <button className="cancel-btn" onClick={onClose}>
                Cancel
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="success-icon">
              <svg
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M20 6L9 17l-5-5" />
              </svg>
            </div>
            <h3 className="modal-title">Payment Collected!</h3>
            <p className="modal-text">Amount ₹{paymentAmount} collected</p>
            <button className="close-btn" onClick={onClose}>
              Close
            </button>
          </>
        )}
      </div>
    </div>
  );
};

const SpBookingDetails = () => {
  const [bookings, setBookings] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [screenWidth, setScreenWidth] = useState(window.innerWidth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isComplaintViewModalOpen, setIsComplaintViewModalOpen] =
    useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [inputId, setInputId] = useState("");
  const [complaintText, setComplaintText] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isComplaintSubmitted, setIsComplaintSubmitted] = useState(false);
  const [isPaid, setIsPaid] = useState(false);
  const [error, setError] = useState("");
  const [complaintError, setComplaintError] = useState("");
  const [paymentError, setPaymentError] = useState("");
  const [expandedBookingId, setExpandedBookingId] = useState(null); // New state for tracking expanded booking
  const itemsPerPage = 5;



  useEffect(() => {
    const email = localStorage.getItem("email");
    fetch(`${BASE_URL}/api/users/sp/bookings/${email}`)
      .then((res) => res.json())
      .then((data) => {
        const formattedBookings = data.map((booking) => ({
          ...booking,
          discountAmount: booking.discountAmount,
          remainingAmount: Math.max(
            0,
            booking.total_amount -
              (booking.amount || 0) -
              booking.discountAmount
          ),
        }));
        setBookings(formattedBookings);
      })
      .catch((err) => console.error("Failed to fetch bookings:", err));
  }, []);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const filteredBookings = [...bookings]
    .reverse()
    .filter((booking) =>
      Object.values(booking).some(
        (value) =>
          value &&
          value.toString().toLowerCase().includes(filterText.toLowerCase())
      )
    );

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

  const handleConfirmBooking = (bookingId) => {
    setSelectedBookingId(bookingId);
    setInputId("");
    setIsConfirmed(false);
    setError("");
    setIsModalOpen(true);
  };

  const handleComplaintBooking = (bookingId) => {
    setSelectedBookingId(bookingId);
    setComplaintText("");
    setIsComplaintSubmitted(false);
    setComplaintError("");
    setIsComplaintModalOpen(true);
  };

  const handleViewComplaint = (bookingId) => {
    setSelectedBookingId(bookingId);
    setIsComplaintViewModalOpen(true);
  };

  const handleCollectPayment = (bookingId) => {
    setSelectedBookingId(bookingId);
    setPaymentAmount("");
    setIsPaid(false);
    setPaymentError("");
    setIsPaymentModalOpen(true);
  };

  const handleConfirmSuccess = (bookingId) => {
    setBookings(
      bookings.map((booking) =>
        booking._id === bookingId
          ? { ...booking, confirmed: "Confirmed" }
          : booking
      )
    );
    setIsConfirmed(true);
  };

  const handleComplaintSuccess = (bookingId) => {
    setBookings(
      bookings.map((booking) =>
        booking._id === bookingId
          ? { ...booking, spComplaint: complaintText }
          : booking
      )
    );
    setIsComplaintSubmitted(true);
  };

  const handlePaymentSuccess = (bookingId, amountPaid, paymentStatus) => {
    setBookings(
      bookings.map((booking) =>
        booking._id === bookingId
          ? {
              ...booking,
              amount: (booking.amount || 0) + amountPaid,
              paymentStatus: paymentStatus,
              remainingAmount: Math.max(
                0,
                booking.total_amount -
                  ((booking.amount || 0) + amountPaid) -
                  booking.discountAmount
              ),
            }
          : booking
      )
    );
    setIsPaid(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedBookingId(null);
    setInputId("");
    setIsConfirmed(false);
    setError("");
  };

  const closeComplaintModal = () => {
    setIsComplaintModalOpen(false);
    setSelectedBookingId(null);
    setComplaintText("");
    setIsComplaintSubmitted(false);
    setComplaintError("");
  };

  const closeComplaintViewModal = () => {
    setIsComplaintViewModalOpen(false);
    setSelectedBookingId(null);
  };

  const closePaymentModal = () => {
    setIsPaymentModalOpen(false);
    setSelectedBookingId(null);
    setPaymentAmount("");
    setIsPaid(false);
    setPaymentError("");
  };

  const toggleExpandBooking = (bookingId) => {
    setExpandedBookingId(expandedBookingId === bookingId ? null : bookingId);
  };

  const isMobile = screenWidth <= 768;
  const isVerySmallScreen = screenWidth <= 400;

  const visibleColumns = [
    "S.No",
    "Booking ID",
    "User Mail",
    "emergencyContact",
    "allergies",
    "Staffed",
    "Service",
    "Date & Time",
    "Receipt",
    "Discount",
    "Balance",
    "Report",
    "Claim",
    "Confirm",
  ];

  const formatDateTime = (date, time) => {
    let dateStr = "N/A";
    let timeStr = time || "N/A";

    if (date) {
      try {
        const parsedDate = new Date(date);
        if (!isNaN(parsedDate)) {
          dateStr = parsedDate.toLocaleDateString();
        }
      } catch (e) {
        // console.error('Invalid date format:', date);
      }
    }

    return (
      <span
        dangerouslySetInnerHTML={{
          __html: `${dateStr}${timeStr !== "N/A" ? `<br>${timeStr}` : ""}`,
        }}
      />
    );
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
    <div className="sp-booking-details">
      <h2 className="page-title" style={{ color: "#fb646b" }}>All Bookings</h2>

      <div className="search-container">
        <input
          type="text"
          placeholder="Search by any field in bookings..."
          value={filterText}
          onChange={(e) => {
            setFilterText(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />
      </div>

      <div className="bookings-table">
        {isMobile ? (
          <div className="mobile-bookings-list">
            {currentItems.length > 0 ? (
              currentItems.map((booking, index) => (
                <div
                  key={booking._id}
                  className="booking-card"
                  onClick={() => toggleExpandBooking(booking._id)}
                  style={{ cursor: "pointer" }}
                >
                  <p className="booking-field">
                    <strong>User Email:</strong>{" "}
                    {booking.customerEmail || "N/A"}
                  </p>
                  <p className="booking-field">
                    <strong>Date:</strong>{" "}
                    {formatDateTime(booking.date, booking.time)}
                  </p>
                  {expandedBookingId === booking._id && (
                    <>
                      <p className="booking-field">
                        <strong>S.No:</strong> {indexOfFirstItem + index + 1}
                      </p>
                      <p className="booking-field">
                        <strong>Booking ID:</strong> {booking._id}
                      </p>
                      <p className="booking-field">
                        <strong>Emergency Contact:</strong>{" "}
                        {booking.customerEmergencyContact || "N/A"}
                      </p>
                      <p className="booking-field">
                        <strong>Allergies:</strong>{" "}
                        {booking.customerAllergies || "N/A"}
                      </p>
                      <p className="booking-field">
                        <strong>Staffed:</strong>{" "}
                        {booking.favoriteEmployee || "N/A"}
                      </p>
                      <p className="booking-field">
                        <strong>Service:</strong> {booking.service || "N/A"}
                      </p>
                      <p className="booking-field">
                        <strong>Receipt:</strong> ₹
                        {(booking.amount || 0).toFixed(2)}
                      </p>
                      <p className="booking-field">
                        <strong>Discount:</strong> ₹
                        {(booking.discountAmount || 0).toFixed(2)}
                      </p>
                      <p className="booking-field">
                        <strong>Balance:</strong> ₹
                        {(booking.remainingAmount || 0).toFixed(2)}
                      </p>
                      <div className="booking-actions">
                        <p className="booking-field">
                          <strong>Report:</strong>{" "}
                          {booking.spComplaint ? (
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent card toggle on button click
                                handleViewComplaint(booking._id);
                              }}
                              className="action-btn view-btn"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#fff"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              View
                            </button>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent card toggle on button click
                                handleComplaintBooking(booking._id);
                              }}
                              className="action-btn complain-btn"
                            >
                              Complain
                            </button>
                          )}
                        </p>
                        <p className="booking-field">
                          <strong>Claim:</strong>{" "}
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent card toggle on button click
                              handleCollectPayment(booking._id);
                            }}
                            disabled={booking.remainingAmount <= 0}
                            className={`action-btn collect-btn ${
                              booking.remainingAmount <= 0 ? "disabled" : ""
                            }`}
                          >
                            {booking.remainingAmount <= 0 ? "Paid" : "Collect"}
                          </button>
                        </p>
                        <p className="booking-field">
                          <strong>Confirm:</strong>{" "}
                          {booking.confirmed === "Confirmed" ? (
                            <span className="confirmed-text">Confirmed</span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent card toggle on button click
                                handleConfirmBooking(booking._id);
                              }}
                              disabled={booking.confirmed === "Confirmed"}
                              className={`action-btn confirm-btn ${
                                booking.confirmed === "Confirmed" ? "disabled" : ""
                              }`}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#fff"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                              Verify
                            </button>
                          )}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              ))
            ) : (
              <div className="no-bookings">No Bookings Found</div>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="bookings-table-desktop">
              <thead>
                <tr>
                  {visibleColumns.map((col) => (
                    <th key={col} className="table-header">
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {currentItems.length > 0 ? (
                  currentItems.map((booking, index) => (
                    <tr key={booking._id} className="table-row">
                      {visibleColumns.includes("S.No") && (
                        <td className="table-cell">
                          {indexOfFirstItem + index + 1}
                        </td>
                      )}
                      {visibleColumns.includes("Booking ID") && (
                        <td className="table-cell">{booking._id}</td>
                      )}
                      {visibleColumns.includes("User Mail") && (
                        <td className="table-cell">
                          {booking.customerEmail || "N/A"}
                        </td>
                      )}
                      {visibleColumns.includes("emergencyContact") && (
                        <td className="table-cell">
                          {booking.customerEmergencyContact || "N/A"}
                        </td>
                      )}
                      {visibleColumns.includes("allergies") && (
                        <td className="table-cell">
                          {booking.customerAllergies || "N/A"}
                        </td>
                      )}
                      {visibleColumns.includes("Staffed") && (
                        <td className="table-cell">
                          {booking.favoriteEmployee || "N/A"}
                        </td>
                      )}
                      {visibleColumns.includes("Service") && (
                        <td className="table-cell">
                          {booking.service || "N/A"}
                        </td>
                      )}
                      {visibleColumns.includes("Date & Time") && (
                        <td className="table-cell">
                          {formatDateTime(booking.date, booking.time)}
                        </td>
                      )}
                      {visibleColumns.includes("Receipt") && (
                        <td className="table-cell">
                          ₹{(booking.amount || 0).toFixed(2)}
                        </td>
                      )}
                      {visibleColumns.includes("Discount") && (
                        <td className="table-cell">
                          ₹{(booking.discountAmount || 0).toFixed(2)}
                        </td>
                      )}
                      {visibleColumns.includes("Balance") && (
                        <td className="table-cell">
                          ₹{(booking.remainingAmount || 0).toFixed(2)}
                        </td>
                      )}
                      {visibleColumns.includes("Report") && (
                        <td className="table-cell">
                          {booking.spComplaint ? (
                            <button
                              onClick={() => handleViewComplaint(booking._id)}
                              className="action-btn view-btn"
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#fff"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                <circle cx="12" cy="12" r="3" />
                              </svg>
                              View
                            </button>
                          ) : (
                            <button
                              onClick={() =>
                                handleComplaintBooking(booking._id)
                              }
                              className="action-btn complain-btn"
                            >
                              Complain
                            </button>
                          )}
                        </td>
                      )}
                      {visibleColumns.includes("Claim") && (
                        <td className="table-cell">
                          <button
                            onClick={() => handleCollectPayment(booking._id)}
                            disabled={booking.remainingAmount <= 0}
                            className={`action-btn collect-btn ${
                              booking.remainingAmount <= 0 ? "disabled" : ""
                            }`}
                          >
                            {booking.remainingAmount <= 0 ? "Paid" : "Collect"}
                          </button>
                        </td>
                      )}
                      {visibleColumns.includes("Confirm") && (
                        <td className="table-cell">
                          {booking.confirmed === "Confirmed" ? (
                            <span className="confirmed-text">Confirmed</span>
                          ) : (
                            <button
                              onClick={() => handleConfirmBooking(booking._id)}
                              disabled={booking.confirmed === "Confirmed"}
                              className={`action-btn confirm-btn ${
                                booking.confirmed === "Confirmed"
                                  ? "disabled"
                                  : ""
                              }`}
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="#fff"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M20 6L9 17l-5-5" />
                              </svg>
                              Verify
                            </button>
                          )}
                        </td>
                      )}
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={visibleColumns.length} className="no-bookings">
                      No Bookings Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

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

      <ConfirmationModal
        isOpen={isModalOpen}
        onClose={closeModal}
        booking={bookings.find((booking) => booking._id === selectedBookingId)}
        inputId={inputId}
        setInputId={setInputId}
        isConfirmed={isConfirmed}
        setIsConfirmed={setIsConfirmed}
        error={error}
        setError={setError}
        onConfirm={handleConfirmSuccess}
      />

      <ComplaintModal
        isOpen={isComplaintModalOpen}
        onClose={closeComplaintModal}
        booking={bookings.find((booking) => booking._id === selectedBookingId)}
        complaintText={complaintText}
        setComplaintText={setComplaintText}
        isSubmitted={isComplaintSubmitted}
        setIsSubmitted={setIsComplaintSubmitted}
        error={complaintError}
        setError={setComplaintError}
        onSubmit={handleComplaintSuccess}
      />

      <ComplaintViewModal
        isOpen={isComplaintViewModalOpen}
        onClose={closeComplaintViewModal}
        booking={bookings.find((booking) => booking._id === selectedBookingId)}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={closePaymentModal}
        booking={bookings.find((booking) => booking._id === selectedBookingId)}
        paymentAmount={paymentAmount}
        setPaymentAmount={setPaymentAmount}
        isPaid={isPaid}
        setIsPaid={setIsPaid}
        error={paymentError}
        setError={setPaymentError}
        onPayment={handlePaymentSuccess}
      />
    </div>
  );
};

export default SpBookingDetails;
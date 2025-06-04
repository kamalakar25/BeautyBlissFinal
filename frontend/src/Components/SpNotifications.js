import axios from "axios";
import React, { useEffect, useState } from "react";

const BASE_URL = process.env.REACT_APP_API_URL;

const SpNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [notificationCount, setNotificationCount] = useState(0);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [error, setError] = useState(null);

  const fetchNotifications = async (retryCount = 3) => {
    const email = localStorage.getItem("email");
    if (!email) {
      setError("Please log in to view notifications");
      return;
    }
    try {
      const res = await axios.get(
        `${BASE_URL}/api/notifications/notifications/${email}`
      );
      const spNotifications = res.data
        .filter((notif) => notif.recipientType === "ServiceProvider")
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setNotifications(spNotifications);
      setNotificationCount(spNotifications.filter((n) => !n.isRead).length);
      setError(null);
    } catch (error) {
      if (error.response?.status === 404) {
        setError(
          "Notification endpoint not found. Please check backend configuration."
        );
      } else if (error.request && retryCount > 0) {
        setTimeout(() => fetchNotifications(retryCount - 1), 1000);
        return;
      } else {
        setError("Failed to load notifications. Please try again later.");
      }
    }
  };

  const fetchNotificationCount = async () => {
    const email = localStorage.getItem("email");
    if (!email) {
      setNotificationCount(0);
      return;
    }
    try {
      const res = await axios.get(
        `${BASE_URL}/api/notifications/notification-count/${email}`
      );
      setNotificationCount(res.data.unreadCount || 0);
    } catch (error) {
      if (error.response?.status === 404) {
        setError(
          "Notification count endpoint not found. Please check backend configuration."
        );
      } else {
        setError("Failed to load notification count.");
      }
      setNotificationCount(0);
    }
  };

  useEffect(() => {
    fetchNotifications();
    fetchNotificationCount();

    const intervalId = setInterval(() => {
      fetchNotifications();
      fetchNotificationCount();
    }, 10000);

    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => {
      clearInterval(intervalId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleNotificationClick = async (notification) => {
    setSelectedNotification(notification);
    setIsModalOpen(true);

    if (!notification.isRead) {
      try {
        const response = await axios.post(
          `${BASE_URL}/api/notifications/mark-notification-read`,
          {
            email: localStorage.getItem("email"),
            notificationId: notification._id,
          }
        );

        setNotifications((prev) =>
          prev.map((notif) =>
            notif._id === notification._id ? { ...notif, isRead: true } : notif
          )
        );

        setNotificationCount(response.data.unreadCount || 0);
      } catch (error) {
        if (error.response?.status === 404) {
          setError(
            "Mark notification endpoint not found. Please check backend configuration."
          );
        } else {
          setError("Failed to mark notification as read.");
        }
      }
    }
  };

  const handleConfirmBooking = async (notification) => {
    if (
      notification.type !== "Booking" ||
      notification.title.includes("Confirmed")
    ) {
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/notifications/sp/mark-booking-confirmed`,
        {
          email: localStorage.getItem("email"),
          bookingId: notification.bookingId,
        }
      );

      setNotifications((prev) =>
        prev.map((notif) =>
          notif._id === notification._id
            ? {
                ...notif,
                title: "Booking Confirmed",
                message: notif.message.replace(
                  "New booking",
                  "You confirmed the booking"
                ),
              }
            : notif
        )
      );

      setSelectedNotification((prev) =>
        prev && prev._id === notification._id
          ? {
              ...prev,
              title: "Booking Confirmed",
              message: prev.message.replace(
                "New booking",
                "You confirmed the booking"
              ),
            }
          : prev
      );

      setNotificationCount(response.data.unreadCount || 0);
    } catch (error) {
      if (error.response?.status === 404) {
        setError(
          "Booking confirmation endpoint not found. Please check backend configuration."
        );
      } else {
        setError("Failed to confirm booking. Please try again.");
      }
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedNotification(null);
  };

  const handleBackdropClick = (e) => {
    if (e.target.className.includes("modal")) {
      closeModal();
    }
  };

  const formatDateTime = (createdAt) => {
    try {
      const date = new Date(createdAt);
      return date.toLocaleString();
    } catch (e) {
      return "N/A";
    }
  };

  return (
    <div
      style={{
        padding: "2rem",
        minHeight: "100vh",
        backgroundColor: "#fad9e3",
      }}
    >
      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .notification-container {
            max-width: 800px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          .notification-box {
            border-radius: 10px;
            padding: 1rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            animation: fadeIn 0.5s ease-out;
            border-left: 4px solid rgb(245 100 169);
            position: relative;
            display: flex;
            justify-content: space-between;
            align-items: center;
            background-color: #fff;
          }
          .notification-box.unread {
            border-left: 4px solid rgb(252, 98, 84);
            background-color: rgb(226, 120, 110) !important;
          }
          .notification-box:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          }
          .notification-content {
            flex: 1;
            color: #0e0f0f;
            font-size: 0.9rem;
          }
          .notification-content h4 {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 600;
          }
          .notification-content p {
            margin: 0.5rem 0 0;
            color: #555;
          }
          .notification-time {
            font-size: 0.8rem;
            color: #888;
            text-align: right;
          }
          .modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.6);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
          }
          .modal-content {
            padding: 2rem;
            border-radius: 12px;
            width: 90%;
            max-width: 600px;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
            animation: fadeIn 0.3s ease-out;
          }
          .close-btn {
            position: absolute;
            top: 1rem;
            right: 1rem;
            font-size: 1.5rem;
            cursor: pointer;
            transition: color 0.3s ease;
          }
          .close-btn:hover {
            color: #201548;
          }
          .modal-content p {
            margin: 0.5rem 0;
            font-size: 0.95rem;
            color: #0e0f0f;
          }
          .modal-content p strong {
            color: #201548;
            margin-right: 0.5rem;
          }
          .confirm-btn {
            color: #fff;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 1rem;
            transition: background 0.3s ease;
          }
          .confirm-btn:hover {
            background: #36257d;
          }
          .confirm-btn:disabled {
            background: #888;
            cursor: not-allowed;
          }
          .no-notifications {
            text-align: center;
            font-size: 1.2rem;
            color: #555;
            margin-top: 2rem;
          }
          .error-message {
            text-align: center;
            color: #ff6f61;
            font-size: 1rem;
            margin-top: 1rem;
          }
          @media (max-width: 768px) {
            .notification-container {
              padding: 0 1rem;
            }
            .notification-box {
              flex-direction: column;
              align-items: flex-start;
              gap: 0.5rem;
            }
            .notification-content h4 {
              font-size: 1rem;
            }
            .notification-content p {
              font-size: 0.85rem;
            }
            .notification-time {
              font-size: 0.75rem;
            }
            .modal-content {
              padding: 1.5rem;
              width: 95%;
            }
            .modal-content p {
              font-size: 0.9rem;
            }
          }
          @media (max-width: 600px) {
            .notification-box {
              padding: 0.8rem;
            }
            .notification-content h4 {
              font-size: 0.9rem;
            }
            .notification-content p {
              font-size: 0.8rem;
            }
            .modal-content {
              padding: 1rem;
            }
            .modal-content p {
              font-size: 0.85rem;
            }
          }
        `}
      </style>

      <div className="notification-container">
        <h1
          style={{
            textAlign: "center",
            color: "rgb(216, 79, 164)",
            marginBottom: "2rem",
            fontSize: "1.8rem",
          }}
        >
          Service Provider Notifications ({notificationCount} unread)
        </h1>
        {error && <p className="error-message">{error}</p>}
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-box ${
                notification.isRead ? "" : "unread"
              }`}
              onClick={() => handleNotificationClick(notification)}
              style={{
                backgroundColor: "rgb(235, 217, 222)",
              }}
            >
              <div className="notification-content">
                <h4 style={{ color: "rgb(24, 4, 20)" }}>
                  {notification.title}
                </h4>
                <p>{notification.message}</p>
                {notification.type === "Booking" && (
                  <p>
                    <strong style={{ color: "rgb(24, 4, 20)" }}>
                      Booking ID:
                    </strong>{" "}
                    {notification.bookingId}
                  </p>
                )}
                {notification.type === "NewService" && (
                  <p>
                    <strong style={{ color: "rgb(24, 4, 20)" }}>
                      Service ID:
                    </strong>{" "}
                    {notification.serviceId}
                  </p>
                )}
              </div>
              <div className="notification-time">
                {formatDateTime(notification.createdAt)}
              </div>
            </div>
          ))
        ) : (
          <p className="no-notifications">No notifications found</p>
        )}
      </div>

      {isModalOpen && selectedNotification && (
        <div
          className="modal show d-flex align-items-center justify-content-center"
          style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}
          onClick={handleBackdropClick}
          tabIndex="-1"
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content shadow p-3 rounded"
              style={{ backgroundColor: "rgb(247, 222, 229)" }}
            >
              <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                <h5
                  className="modal-title mb-0"
                  style={{ color: "rgb(223, 82, 119)" }}
                >
                  {selectedNotification.title}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  aria-label="Close"
                  onClick={closeModal}
                  style={{
                    backgroundColor: "#fb646b",
                    color: "white",
                    padding: "5px",
                    borderRadius: "4px",
                  }}
                ></button>
              </div>

              <div className="modal-body">
                <p>
                  <strong style={{ color: "rgb(213 11 139)" }}>Message:</strong>{" "}
                  {selectedNotification.message}
                </p>
                <p>
                  <strong style={{ color: "rgb(213 11 139)" }}>Time:</strong>{" "}
                  {formatDateTime(selectedNotification.createdAt)}
                </p>

                {selectedNotification.type === "Booking" && (
                  <>
                    <p>
                      <strong style={{ color: "rgb(213 11 139)" }}>
                        Booking ID:
                      </strong>{" "}
                      {selectedNotification.bookingId}
                    </p>
                    <p>
                      <strong style={{ color: "rgb(213 11 139)" }}>
                        Customer Name:
                      </strong>{" "}
                      {selectedNotification.userDetails?.name || "N/A"}
                    </p>
                    <p>
                      <strong style={{ color: "rgb(213 11 139)" }}>
                        Customer Email:
                      </strong>{" "}
                      {selectedNotification.userDetails?.email || "N/A"}
                    </p>
                    <p>
                      <strong style={{ color: "rgb(213 11 139)" }}>
                        Customer Phone:
                      </strong>{" "}
                      {selectedNotification.userDetails?.phone || "N/A"}
                    </p>
                    <p>
                      <strong style={{ color: "rgb(213 11 139)" }}>
                        Service:
                      </strong>{" "}
                      {selectedNotification.message.match(
                        /for (.*?)(?: by|$)/
                      )?.[1] || "N/A"}
                    </p>
                    {/* <button
                      className='confirm-btn'
                      onClick={() => handleConfirmBooking(selectedNotification)}
                      disabled={selectedNotification.title.includes('Confirmed')}
                      style={{
                        backgroundColor: '#fb646b',
                        color: '#fff',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '5px',
                        cursor: selectedNotification.title.includes('Confirmed') ? 'not-allowed' : 'pointer',
                        marginTop: '1rem',
                      }}
                    >
                      Confirm Booking
                    </button> */}
                  </>
                )}

                {selectedNotification.type === "NewService" && (
                  <p>
                    <strong style={{ color: "rgb(213 11 139)" }}>
                      Service ID:
                    </strong>{" "}
                    {selectedNotification.serviceId}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpNotifications;

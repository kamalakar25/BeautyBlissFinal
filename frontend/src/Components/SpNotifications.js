import axios from "axios";
import React, { useEffect, useState } from "react";
import { FaBell, FaCalendarAlt, FaCheckCircle, FaTimes } from "react-icons/fa";

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

  const getNotificationIcon = (type) => {
    switch (type) {
      case "Booking":
        return <FaCalendarAlt />;
      case "NewService":
        return <FaCheckCircle />;
      default:
        return <FaBell />;
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
            max-width: 1200px;
            margin: 0 auto;
            display: flex;
            flex-direction: column;
            gap: 1rem;
            padding: 0 1rem;
          }
          .notification-box {
            border-radius: 10px;
            padding: 1rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            cursor: pointer;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            animation: fadeIn 0.5s ease-out;
            position: relative;
            display: flex;
            align-items: center;
            background-color:rgb(175, 114, 149);
            color: #fff;
            gap: 1.5rem;
          }
          .notification-box.unread {
            background-color: #f25d9c;
            border-left: 4px solid #ffeb3b;
          }
          .notification-box:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          }
          .notification-icon {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background-color: rgba(255, 255, 255, 0.2);
            flex-shrink: 0;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 1.5rem;
          }
          .notification-content {
            flex: 1;
            font-size: 1rem;
          }
          .notification-content h4 {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 600;
            color: #fff;
          }
          .notification-content p {
            margin: 0.5rem 0 0;
            font-size: 0.9rem;
            color: rgba(255, 255, 255, 0.9);
          }
          .notification-time {
            font-size: 0.8rem;
            color: rgba(255, 255, 255, 0.7);
            margin-top: 0.3rem;
          }
          .unread-dot {
            width: 12px;
            height: 12px;
            background-color: #fff;
            border-radius: 50%;
            position: absolute;
            right: 15px;
            top: 15px;
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
            background: white;
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
          .modal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 1.5rem;
            padding-bottom: 1rem;
            border-bottom: 1px solid #eee;
          }
          .modal-title {
            margin: 0;
            color: #fff;
            font-size: 1.5rem;
          }
          .close-btn {
            background: none;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            color: #fefefe;
            transition: color 0.3s ease;
                // margin-left: 382px;
          }
          .close-btn:hover {
            color: #f25d9c;
          }
          .modal-body {
            margin-bottom: 1.5rem;
          }
          .modal-body p {
            margin: 0.8rem 0;
            font-size: 1rem;
            color: #555;
          }
          .modal-body strong {
            color: #f25d9c;
            margin-right: 0.5rem;
          }
          .confirm-btn {
            background-color: #f25d9c;
            color: white;
            border: none;
            padding: 0.8rem 1.5rem;
            border-radius: 5px;
            cursor: pointer;
            margin-top: 1rem;
            font-size: 1rem;
            transition: background 0.3s ease;
            display: block;
            width: 100%;
          }
          .confirm-btn:hover {
            background-color: #e04b8a;
          }
          .confirm-btn:disabled {
            background: #ccc;
            cursor: not-allowed;
          }
          .no-notifications {
            text-align: center;
            font-size: 1.2rem;
            color: #888;
            margin-top: 2rem;
            padding: 2rem;
            background: white;
            border-radius: 10px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
          }
          .error-message {
            text-align: center;
            color: #ff6f61;
            font-size: 1rem;
            margin-top: 1rem;
            padding: 1rem;
            background: white;
            border-radius: 5px;
          }
          @media (max-width: 768px) {
            .notification-box {
              padding: 0.8rem;
              gap: 1rem;
            }
            .notification-icon {
              width: 40px;
              height: 40px;
              font-size: 1.2rem;
            }
            .notification-content h4 {
              font-size: 1rem;
            }
            .notification-content p {
              font-size: 0.85rem;
            }
            .modal-content {
              padding: 1.5rem;
              width: 95%;
            }
          }
          @media (max-width: 480px) {
            .notification-box {
              padding: 0.7rem;
              gap: 0.8rem;
            }
            .notification-icon {
              width: 36px;
              height: 36px;
              font-size: 1.1rem;
            }
            .modal-content {
              padding: 1.2rem;
            }
            .modal-title {
              font-size: 1.3rem;
            }
          }
        `}
      </style>

      <div className="notification-container">
        <h1
          style={{
            textAlign: "center",
            color: "#f25d9c",
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
            >
              <div className="notification-icon">
                {getNotificationIcon(notification.type)}
              </div>
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
                <div className="notification-time">
                  {formatDateTime(notification.createdAt)}
                </div>
              </div>
              {!notification.isRead && <div className="unread-dot"></div>}
            </div>
          ))
        ) : (
          <p className="no-notifications">No notifications found</p>
        )}
      </div>

      {isModalOpen && selectedNotification && (
        <div className="modal" onClick={handleBackdropClick}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{selectedNotification.title}</h2>
              <button className="close-btn" onClick={closeModal}>
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <p>
                <strong>Message:</strong> {selectedNotification.message}
              </p>
              <p>
                <strong>Time:</strong> {formatDateTime(selectedNotification.createdAt)}
              </p>

              {selectedNotification.type === "Booking" && (
                <>
                  <p>
                    <strong>Booking ID:</strong> {selectedNotification.bookingId}
                  </p>
                  <p>
                    <strong>Customer Name:</strong>{" "}
                    {selectedNotification.userDetails?.name || "N/A"}
                  </p>
                  <p>
                    <strong>Customer Email:</strong>{" "}
                    {selectedNotification.userDetails?.email || "N/A"}
                  </p>
                  <p>
                    <strong>Customer Phone:</strong>{" "}
                    {selectedNotification.userDetails?.phone || "N/A"}
                  </p>
                  <p>
                    <strong>Service:</strong>{" "}
                    {selectedNotification.message.match(/for (.*?)(?: by|$)/)?.[1] || "N/A"}
                  </p>
                 
                </>
              )}

              {selectedNotification.type === "NewService" && (
                <p>
                  <strong>Service ID:</strong> {selectedNotification.serviceId}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpNotifications;
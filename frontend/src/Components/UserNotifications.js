import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { NotificationContext } from "./NotificationContext.js";

const BASE_URL = process.env.REACT_APP_API_URL;

const UserNotifications = () => {
  const context = useContext(NotificationContext);
  const {
    notificationCount = 0,
    setNotificationCount = () => {},
    fetchNotificationCount = () => {},
  } = context || {};
  const [notifications, setNotifications] = useState([]);
  const [selectedNotification, setSelectedNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const fetchNotifications = async () => {
      const email = localStorage.getItem("email");
      try {
        const res = await axios.get(
          `${BASE_URL}/api/notifications/notifications/${email}`
        );
        const userNotifications = res.data
          .filter((notif) => notif.recipientType === "User")
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(userNotifications);
      } catch (error) {}
    };

    fetchNotifications();
    fetchNotificationCount();

    const intervalId = setInterval(() => {
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
  }, [fetchNotificationCount]);

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

        setNotificationCount(response.data.unreadCount);
      } catch (error) {}
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
            position: relative;
            display: flex;
            align-items: center;
            background-color: #f6c4d2;
            color: #fff;
            gap: 1.5rem;
          }
         .notification-box.unread[data-type="Booking"] {
    background-color: rgb(255, 105, 180) !important;
    color: white !important; /* Or any other readable color */
}

          .notification-box:hover {
            transform: translateY(-5px);
            box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
          }
          .notification-content {
            flex: 1;
            color: #000;
            font-size: 0.9rem;
          }
          .notification-content h4 {
            margin: 0;
            font-size: 1.1rem;
            font-weight: 600;
            color: #000;
          }
          .notification-content p {
            margin: 0.2rem 0 0;
            color: #000;
            font-size: 0.9rem;
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
          .no-notifications {
            text-align: center;
            font-size: 1.2rem;
            color: #555;
            margin-top: 2rem;
          }
          @media (max-width: 768px) {
            .notification-container {
              padding: 0 1rem;
            }
            .notification-box {
              flex-direction: row;
              align-items: flex-start;
              gap: 1rem;
            }
            .notification-content {
              display: flex;
              flex-direction: column;
            }
            .notification-content h4 {
              font-size: 1rem;
            }
            .notification-content p {
              font-size: 0.85rem;
              margin: 0;
            }
            .modal-content {
              padding: 1.5rem;
          
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
          Your Notifications
        </h1>
        {notifications.length > 0 ? (
          notifications.map((notification) => (
            <div
              key={notification._id}
              className={`notification-box ${
                notification.isRead ? "" : "unread"
              }`}
              onClick={() => handleNotificationClick(notification)}
              style={{
                backgroundColor: "#f6c4d2",
              }}
              data-type={notification.type}
            >
              <div
                style={{
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  background: "linear-gradient(135deg, #f5c1cc 0%, #e89fb3 100%)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#fff"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                  <line x1="16" y1="2" x2="16" y2="6"></line>
                  <line x1="8" y1="2" x2="8" y2="6"></line>
                  <line x1="3" y1="10" x2="21" y2="10"></line>
                </svg>
              </div>
              <div className="notification-content">
                <h4>{notification.title}</h4>
                <p>{notification.message}</p>
              </div>
            </div>
          ))
        ) : (
          <p className="no-notifications">No notifications found</p>
        )}
      </div>

      {isModalOpen && selectedNotification && (
        <div
          className="modal show d-block"
          onClick={handleBackdropClick}
          tabIndex="-1"
          role="dialog"
        >
          <div
            className="modal-dialog modal-dialog-centered"
            role="document"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="modal-content p-3"
              style={{ backgroundColor: "rgb(247, 222, 229)" }}
            >
              <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                <h5
                  className="modal-title mb-0 text-center"
                  style={{ color: "rgb(223, 82, 119)" }}
                >
                  {selectedNotification.title}
                </h5>
                <button
                  type-button
                  className="btn-close"
                  aria-label="Close"
                  onClick={closeModal}
                  style={{
                    backgroundColor: "rgb(241, 149, 174)",
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
                        User Name:
                      </strong>{" "}
                      {selectedNotification.userDetails?.name || "N/A"}
                    </p>
                    <p>
                      <strong style={{ color: "rgb(213 11 139)" }}>
                        User Email:
                      </strong>{" "}
                      {selectedNotification.userDetails?.email || "N/A"}
                    </p>
                    <p>
                      <strong style={{ color: "rgb(213 11 139)" }}>
                        User Phone:
                      </strong>{" "}
                      {selectedNotification.userDetails?.phone || "N/A"}
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserNotifications;
"use client";

import { useState, useEffect } from "react";
import { Tooltip, Badge } from "@mui/material";
import FilterListIcon from "@mui/icons-material/FilterList";
import SearchIcon from "@mui/icons-material/Search";
import MarkEmailReadIcon from "@mui/icons-material/MarkEmailRead";
import DeleteIcon from "@mui/icons-material/Delete";
import ReplyIcon from "@mui/icons-material/Reply";
import { motion } from "framer-motion";
import axios from "axios";
import "./Enquiries.css";

const Enquiries = () => {
  const [enquiries, setEnquiries] = useState([]);
  const [filteredEnquiries, setFilteredEnquiries] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEnquiry, setSelectedEnquiry] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [showReplyModal, setShowReplyModal] = useState(false);
  const itemsPerPage = 5;

  const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchEnquiries = async () => {
      const parlorEmail = localStorage.getItem("email");
      try {
        const response = await axios.get(`${API_BASE_URL}/api/users/enquiries/${parlorEmail}`);
        setEnquiries(response.data);
        setFilteredEnquiries(response.data);
      } catch (error) {
        alert("Failed to load enquiries. Please try again later.");
      }
    };

    fetchEnquiries();
  }, []);

  useEffect(() => {
    let filtered = enquiries;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((enquiry) => {
        const fieldsToSearch = [
          enquiry.customerName || "",
          enquiry.customerEmail || "",
          enquiry.customerPhone || "",
          enquiry.userMessage || "",
          enquiry.serviceRequested || "",
          enquiry.shopName || "",
        ];
        return fieldsToSearch.some((field) =>
          field.toLowerCase().includes(query)
        );
      });
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((enquiry) => enquiry.status === statusFilter);
    }

    if (dateFilter) {
      const filterDate = new Date(dateFilter);
      filtered = filtered.filter((enquiry) => {
        const enquiryDate = new Date(enquiry.dateSubmitted);
        return (
          enquiryDate.getFullYear() === filterDate.getFullYear() &&
          enquiryDate.getMonth() === filterDate.getMonth() &&
          enquiryDate.getDate() === filterDate.getDate()
        );
      });
    }

    setFilteredEnquiries(filtered);
    setCurrentPage(1);
  }, [searchQuery, statusFilter, dateFilter, enquiries]);

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return "Invalid Date";

      const options = {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      };

      return new Intl.DateTimeFormat("en-IN", options).format(date);
    } catch (error) {
      return "Invalid Date";
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case "new":
        return (
          <span className="badge px-3 py-2 rounded-pill" style={{ backgroundColor: "#fb646b", color: "#fff" }}>
            New
          </span>
        );
      case "approved":
        return (
          <span className="badge px-3 py-2 rounded-pill" style={{ backgroundColor: "#FF80DD", color: "#2D2828" }}>
            Approved
          </span>
        );
      default:
        return (
          <span className="badge bg-secondary px-3 py-2 rounded-pill">
            Unknown
          </span>
        );
    }
  };

  const handleReply = (enquiry) => {
    setSelectedEnquiry(enquiry);
    setShowReplyModal(true);
  };

  const handleSendReply = async () => {
    try {
      await axios.put(`${API_BASE_URL}/api/users/enquiries/${selectedEnquiry.id}`, {
        status: "approved",
        spMessage: replyText,
      });

      const updatedEnquiries = enquiries.map((enq) =>
        enq.id === selectedEnquiry.id
          ? { ...enq, status: "approved" }
          : enq
      );

      setEnquiries(updatedEnquiries);
      setFilteredEnquiries(updatedEnquiries);
      setShowReplyModal(false);
      setReplyText("");
      setSelectedEnquiry(null);

      alert("Reply sent successfully!");
    } catch (error) {
      alert("Failed to send reply. Please try again.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this enquiry?")) {
      try {
        await axios.delete(`${API_BASE_URL}/api/users/enquiries/${id}`);

        const updatedEnquiries = enquiries.filter((enq) => enq.id !== id);
        setEnquiries(updatedEnquiries);
        setFilteredEnquiries(updatedEnquiries);
      } catch (error) {
        alert("Failed to delete enquiry. Please try again.");
      }
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setStatusFilter("all");
    setDateFilter("");
    setShowFilters(false);
  };

  const totalPages = Math.ceil(filteredEnquiries.length / itemsPerPage);
  const paginatedEnquiries = filteredEnquiries.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePageChange = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div
      style={{
        backgroundColor: "#fad9e3",
        minHeight: "100vh",
        color: "#2D2828",
      }}
    >
      {/* Header Section */}
      <div
        className="container-fluid py-4 mb-4"
        style={{
          borderBottom: `5px solid ${"#FFEBF1"}`,
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6 text-center text-md-start">
              <h1 className="fw-bold" style={{ color: "rgb(244, 61, 70)" }}>
                Service Enquiries
              </h1>
              <p className="mt-2 mb-0" style={{ color: "#2D2828" }}>
                Manage and respond to customer enquiries
              </p>
            </div>
            <div className="col-md-6 d-flex justify-content-center justify-content-md-end mt-3 mt-md-0">
              <div className="d-flex gap-4">
                <Badge
                  badgeContent={
                    filteredEnquiries.filter((e) => e.status === "new").length
                  }
                  color="error"
                >
                  <button
                    className={`btn ${
                      statusFilter === "new"
                        ? "btn-custom"
                        : "btn-outline-custom"
                    }`}
                    onClick={() =>
                      setStatusFilter(statusFilter === "new" ? "all" : "new")
                    }
                    style={{
                      backgroundColor:
                        statusFilter === "new" ? "#fb646b" : "transparent",
                      color: statusFilter === "new" ? "#fff" : "#fb646b",
                      borderColor: "#fb646b",
                    }}
                  >
                    New
                  </button>
                </Badge>
                <Badge
                  badgeContent={
                    filteredEnquiries.filter((e) => e.status === "approved")
                      .length
                  }
                  color="warning"
                >
                  <button
                    className={`btn ${
                      statusFilter === "approved"
                        ? "btn-custom"
                        : "btn-outline-custom"
                    }`}
                    onClick={() =>
                      setStatusFilter(
                        statusFilter === "approved" ? "all" : "approved"
                      )
                    }
                    style={{
                      backgroundColor:
                        statusFilter === "approved" ? "#fb646b" : "transparent",
                      color: statusFilter === "approved" ? "#fff" : "#fb646b",
                      borderColor: "#fb646b",
                    }}
                  >
                    Approved
                  </button>
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mb-5">
        {/* Search and Filter Section */}
        <div className="row mb-4">
          <div className="col-md-6 mb-3 mb-md-0">
            <div className="input-group">
              <span
                className="input-group-text"
                style={{ backgroundColor: "#FFEBF1", borderColor: "#FB646B" }}
              >
                <SearchIcon style={{ color: "#fb646b" }} />
              </span>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, email, enquiry..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ borderColor: "#FB646B", color: "#2D2828" }}
              />
            </div>
          </div>
          <div className="col-md-6 d-flex justify-content-md-end">
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-custom d-flex align-items-center"
                onClick={() => setShowFilters(!showFilters)}
                style={{ borderColor: "#fb646b", color: "#fb646b" }}
              >
                <FilterListIcon className="me-1" />
                {showFilters ? "Hide Filters" : "Show Filters"}
              </button>
              {(searchQuery || statusFilter !== "all" || dateFilter) && (
                <button
                  className="btn btn-outline-custom"
                  onClick={clearAllFilters}
                  style={{ borderColor: "#fb646b", color: "#fb646b" }}
                >
                  Clear Filters
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Additional Filters */}
        {showFilters && (
          <motion.div
            className="row mb-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <div className="col-md-4 mb-3 mb-md-0">
              <label className="form-label" style={{ color: "#2D2828" }}>
                Filter by Date
              </label>
              <input
                type="date"
                className="form-control"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                style={{ borderColor: "#FB646B", color: "#2D2828" }}
              />
            </div>
            <div className="col-md-4 mb-3 mb-md-0">
              <label className="form-label" style={{ color: "#2D2828" }}>
                Filter by Status
              </label>
              <select
                className="form-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                style={{ borderColor: "#FB646B", color: "#2D2828" }}
              >
                <option value="all">All Statuses</option>
                <option value="new">New</option>
                <option value="approved">Approved</option>
              </select>
            </div>
          </motion.div>
        )}

        {/* Enquiries List */}
        <div className="row">
          <div className="col-12">
            {paginatedEnquiries.length === 0 ? (
              <div className="text-center py-5">
                <div className="mb-3">
                  <img
                    src="/placeholder.svg?height=120&width=120"
                    alt="No enquiries"
                    style={{ opacity: 0.5 }}
                  />
                </div>
                <h4 style={{ color: "#2D2828" }}>No enquiries found</h4>
                <p style={{ color: "#2D2828" }}>
                  Try adjusting your search or filter criteria
                </p>
                {(searchQuery || statusFilter !== "all" || dateFilter) && (
                  <button
                    className="btn btn-custom"
                    onClick={clearAllFilters}
                    style={{ backgroundColor: "#fb646b", color: "#fff" }}
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover border">
                  <thead style={{ backgroundColor: "#f1f5f9" }}>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Customer</th>
                      <th scope="col">Enquiry</th>
                      <th scope="col">Date</th>
                      <th scope="col">Status</th>
                      <th scope="col" className="text-end">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedEnquiries.map((enquiry) => (
                      <tr
                        key={enquiry.id}
                        style={{ backgroundColor: "#FFEBF1" }}
                      >
                        <td className="align-middle">{enquiry.id}</td>
                        <td className="align-middle">
                          <div className="d-flex flex-column">
                            <span
                              className="fw-semibold"
                              style={{ color: "#2D2828" }}
                            >
                              {enquiry.customerName}
                            </span>
                            <small style={{ color: "#2D2828" }}>
                              {enquiry.customerEmail}
                            </small>
                            <small style={{ color: "#2D2828" }}>
                              {enquiry.customerPhone}
                            </small>
                          </div>
                        </td>
                        <td className="align-middle">
                          <div
                            className="d-flex flex-column"
                            style={{
                              maxWidth: "200px",
                              whiteSpace: "normal",
                              wordBreak: "break-word",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              color: "#2D2828",
                            }}
                          >
                            <span>{enquiry.message}</span>
                          </div>
                        </td>
                        <td
                          className="align-middle"
                          style={{ color: "#2D2828" }}
                        >
                          {formatDate(enquiry.dateSubmitted)}
                        </td>
                        <td className="align-middle">
                          {getStatusBadge(enquiry.status)}
                        </td>
                        <td className="align-middle text-end">
                          <div className="btn-group">
                            {enquiry.status === "new" && (
                              <Tooltip title="Reply">
                                <button
                                  className="btn btn-sm btn-outline-custom"
                                  onClick={() => handleReply(enquiry)}
                                  style={{
                                    borderColor: "#fb646b",
                                    color: "#fb646b",
                                  }}
                                >
                                  <ReplyIcon fontSize="small" />
                                </button>
                              </Tooltip>
                            )}
                            <Tooltip title="Delete">
                              <button
                                className="btn btn-sm btn-outline-custom"
                                onClick={() => handleDelete(enquiry.id)}
                                style={{
                                  borderColor: "#fb646b",
                                  color: "#fb646b",
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="row mt-4">
            <div className="col-12">
              <div className="pagination d-flex justify-content-center align-items-center">
                <button
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="pagination-btn"
                  style={{
                    backgroundColor: currentPage === 1 ? "#e5e7eb" : "#fb646b",
                    color: "#fff",
                    borderColor: "#fb646b",
                  }}
                >
                  Previous
                </button>
                <span
                  className="pagination-info mx-3"
                  style={{ color: "#2D2828" }}
                >
                  Page {currentPage} of {totalPages}
                </span>
                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="pagination-btn"
                  style={{
                    backgroundColor:
                      currentPage === totalPages ? "#e5e7eb" : "#fb646b",
                    color: "#fff",
                    borderColor: "#fb646b",
                  }}
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Reply Modal */}
      {showReplyModal && selectedEnquiry && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1050,
          }}
        >
          <motion.div
            className="rounded-4 shadow-lg p-4 mx-3"
            style={{
              maxWidth: "600px",
              width: "100%",
              maxHeight: "90vh",
              overflowY: "auto",
              backgroundColor: "#FFEBF1",
            }}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3 className="m-0" style={{ color: "#F710B9" }}>
                Reply to Enquiry
              </h3>
              <button
                className="btn border-0"
                onClick={() => setShowReplyModal(false)}
                style={{ color: "#fb646b" }}
              >
                <i className="bi bi-x-lg"></i>
              </button>
            </div>

            <div className="mb-4">
              <h5 style={{ color: "#2D2828" }}>Customer Information</h5>
              <p className="mb-1" style={{ color: "#2D2828" }}>
                <strong>Name:</strong> {selectedEnquiry.customerName}
              </p>
              <p className="mb-1" style={{ color: "#2D2828" }}>
                <strong>Email:</strong> {selectedEnquiry.customerEmail}
              </p>
              <p className="mb-1" style={{ color: "#2D2828" }}>
                <strong>Phone:</strong> {selectedEnquiry.customerPhone}
              </p>
            </div>

            <div className="mb-4">
              <h5 style={{ color: "#2D2828" }}>Original Message</h5>
              <div
                className="p-3 rounded mb-3"
                style={{ backgroundColor: "#f1f5f9", color: "#2D2828" }}
              >
                {selectedEnquiry.message}
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="replyMessage"
                className="form-label fw-semibold"
                style={{ color: "#2D2828" }}
              >
                Your Reply
              </label>
              <textarea
                id="replyMessage"
                className="form-control"
                rows="5"
                placeholder="Type your response here..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                style={{ borderColor: "#FB646B", color: "#2D2828" }}
              ></textarea>
            </div>

            <div className="d-flex gap-3 justify-content-end">
              <button
                className="btn btn-outline-custom"
                onClick={() => setShowReplyModal(false)}
                style={{ borderColor: "#fb646b", color: "#fb646b" }}
              >
                Cancel
              </button>
              <button
                className="btn"
                style={{
                  backgroundColor: "#D946EF",
                  color: "#fff",
                }}
                onClick={handleSendReply}
                disabled={!replyText.trim()}
              >
                <MarkEmailReadIcon className="me-1" /> Send Reply
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Enquiries;
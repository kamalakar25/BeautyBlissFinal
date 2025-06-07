import axios from "axios";
import "bootstrap/dist/css/bootstrap.min.css";
import { formatDistanceToNow } from "date-fns";
import { useEffect, useState, useRef } from "react";
import {
  Button,
  Card,
  Container,
  Form,
  Modal,
  Nav,
  ProgressBar,
  Overlay,
} from "react-bootstrap";

// Custom CSS for enhanced responsiveness, visibility, and UX
const customStyles = `
.custom-tab-nav {
  border: none;
  border-bottom: 2px solid #dee2e6;
  padding: 8px 0;
  margin-bottom: 1.5rem;
  background: #f8f9fa;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}

.custom-tab-nav .nav-item {
  margin: 0 5px;
}

.custom-tab-nav .nav-link {
      color: #a509ff;
  padding: 8px 12px;
  font-weight: 500;
  border-radius: 8px;
  transition: all 0.3s ease;
  // background-color: #f8f9fa;
  font-size: 0.9rem;
}

.custom-tab-nav .nav-link.active {
  background: linear-gradient(to right, #fb646b, #fb646b);
  color: white !important;
  font-weight: 400;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.custom-tab-nav .nav-link:hover {
  background-color: #fb646b;
  color: white !important;
  border-radius: 8px;
}

body {
  margin: 0;
  min-height: 100vh;
  background: #fad9e3;
  font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
  color: #0e0f0f;
}

/* Container styling */
.admin-container {
  padding: 1rem 0.5rem;
  max-width: 100%;
  margin: 0 auto;
  background: #fad9e3;
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Sticky sidebar */
.desktop-sidebar {
  position: sticky;
  top: 1rem;
  width: 220px;
  background: #ffffff;
  border-radius: 8px;
  padding: 1rem;
  box-shadow: 0 2px 6px rgba(0,0,0,0.1);
  margin-right: 1.5rem;
  height: fit-content;
}

.desktop-nav-link {
  display: block;
  padding: 0.75rem;
  color: #0e0f0f;
  border-radius: 6px;
  margin-bottom: 0.5rem;
  font-size: 0.95rem;
  transition: all 0.2s ease;
  cursor: pointer;
  text-align: left;
}

.desktop-nav-link.active {
  background: linear-gradient(135deg, #fb646b, #fb646b);
  // color: #ffffff;
  font-weight: 600;
}

.desktop-nav-link:hover {
  background: #fad9e3;
}

/* Floating Action Button */


.fab:active {
  transform: scale(0.95);
}

.fab-menu {
  position: fixed;
  bottom: 110px;
  right: 10px;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  padding: 0.5rem;
  z-index: 1000;
  transform: scale(0);
  transform-origin: bottom right;
  transition: transform 0.2s ease;
}

.fab-menu.show {
  transform: scale(1);
}

.fab-menu-item {
  padding: 0.5rem 1rem;
  color: #0e0f0f;
  border-radius: 6px;
  margin-bottom: 0.25rem;
  cursor: pointer;
  font-size: 0.9rem;
}

.fab-menu-item:hover {
  background: #fad9e3;
}

/* Card styling */
.card {
  border: none;
  border-radius: 8px;
  background: #ffffff;
  margin-bottom: 1rem;
  box-shadow: 0 1px 4px rgba(0,0,0,0.1);
  width: 100%;
  max-width: 100%;
  border-left: solid 4px #fb646b;
  
}

.card-content {
  padding: 0.75rem;
  word-wrap: break-word;
}

.faq-question {
  padding: 0.75rem;
  font-weight: 500;
  font-size: 0.9rem;
  cursor: pointer;
  background: #ffffff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: background 0.2s ease;
}

.faq-question.active {
  background: linear-gradient(135deg, #fb646b, #fb646b);
  color: #ffffff;
}

.faq-question:focus {
  outline: none;
  box-shadow: 0 0 0 3px rgba(251,100,107,0.2);
}

.faq-answer {
  padding: 0;
  font-size: 0.85rem;
  max-height: 0;
  overflow: hidden;
  transition: max-height 0.3s ease, padding 0.3s ease;
}

.faq-answer.open {
  max-height: 400px;
  padding: 0.75rem;
  overflow-y: auto;
}

.faq-answer-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 0.5rem;
}

.faq-answer-text {
  flex: 1;
}

.faq-answer-actions {
  display: flex;
  gap: 0.75rem;
}

.faq-action-btn {
  padding: 0.4rem;
  border-radius: 50%;
  cursor: pointer;
  font-size: 0.9rem;
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.2s ease;
}

.faq-action-btn:active {
  transform: scale(0.95);
}

.edit-icon {
  background: linear-gradient(135deg, #fb646b, #fb646b);
  color: #ffffff;
}

.delete-icon {
  background: #0e0f0f;
  color: #ffffff;
}

/* Modal styling */
.modal-content {
  border-radius: 12px;
  background: #ffffff;
  color: #0e0f0f;
}

.modal-header {
  background: linear-gradient(135deg, #fb646b, #fb646b);
  color: #ffffff;
  border-radius: 12px 12px 0 0;
}

.modal-dialog {
  margin: 0.5rem;
}

/* Action buttons */
.action-btn {
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 0.85rem;
  width: 100%;
  margin-bottom: 0.5rem;
  transition: all 0.2s ease;
}

.save-btn {
  background: linear-gradient(135deg, #28a745, #28a745) !important;
  border: none !important;
  color: #ffffff !important;
}

.cancel-btn {
  background: linear-gradient(135deg, #6c757d, #6c757d) !important;
  border: none !important;
  color: #ffffff !important;
}

.action-btn:active {
  transform: scale(0.98);
}

/* Form elements */
.form-control {
  border-radius: 6px;
  border: 1px solid #0e0f0f;
  color: #0e0f0f;
  background: #ffffff;
  font-size: 0.85rem;
  max-height: 200px;
  overflow-y: auto;
}

.form-control:focus {
  border-color: #fb646b;
  box-shadow: 0 0 0 0 3px rgba(251,100,107,0.2);
}

/* Time text */
.time-text {
  color: #0e0f0f;
  font-size: 0.75rem;
  opacity: 0.7;
}

/* Progress bar */
.progress-bar {
  background: linear-gradient(135deg, #fb646b, #fb646b);
}

/* Toast notification */
.toast {
  position: fixed;
  top: 15px;
  right: 15px;
  background: #ffffff;
  border-radius: 8px;
  padding: 0.75rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.2);
  z-index: 1002;
  animation: slideIn 0.3s ease, slideOut 0.3s ease 2.7s;
}

.no-data {
  color: #0e0f0f;
  background: #ffffff;
  padding: 10px;
  border-radius: 5px;
  text-align: center;
  width: 100%;
}

@keyframes slideIn {
  from { transform: translateX(100%); opacity: 0; }
  to { transform: translateX(0); opacity: 1; }
}

@keyframes slideOut {
  from { transform: translateX(0); opacity: 1; }
  to { transform: translateX(100%); opacity: 0; }
}

/* Responsive design */
@media (min-width: 768px) {
  .admin-container {
    padding: 2rem;
    flex-direction: row;
    justify-content: center;
    max-width: 1600px;
  }

  .content-area {
    flex: 1;
    max-width: 900px;
    padding: 0 1.5rem;
  }

 

  .custom-tab-nav {
    padding: 10px 0;
  }

  .custom-tab-nav .nav-link {
    padding: 12px 20px;
    font-size: 1.1rem;
    margin: 0 10px;
  }

  .faq-question {
    font-size: 1.1rem;
    padding: 1.25rem;
  }

  .faq-answer {
    font-size: 1rem;
  }

  .faq-answer.open {
    padding: 1.25rem;
  }

  .card-content {
    padding: 1.25rem;
  }

  .card {
    margin-bottom: 1.5rem;
  }

  .modal-dialog {
    max-width: 600px;
    margin: 2rem auto;
  }

  .action-btn, .form-control {
    font-size: 1rem;
  }
}

@media (min-width: 992px) {
  .desktop-sidebar {
    width: 280px;
  }

  .content-area {
    max-width: 1000px;
  }

  .desktop-nav-link {
    font-size: 1rem;
    padding: 1rem;
  }

  .custom-tab-nav .nav-link {
    font-size: 1.15rem;
  }

  .faq-question {
    font-size: 1.15rem;
  }

  .faq-answer {
    font-size: 1.05rem;
  }
}

@media (min-width: 1200px) {
  .admin-container {
    padding: 2.5rem;
  }

  .content-area {
    max-width: 1100px;
  }
}

@media (min-width: 1920px) {
  .admin-container {
    max-width: 1800px;
  }

  .desktop-sidebar {
    width: 300px;
  }
}




/* Base FAB style (visible on all screens) */
.fab {
  position: fixed;
  bottom: 70px;
  right: 15px;
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #fb646b, #fb646b);
  color: #ffffff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 1001;
  transition: transform 0.2s ease;
  font-size: 1.5rem;
}

/* ⬇️ Style for small screens only (<768px) */
@media (max-width: 767px) {
  .fab {
    bottom: 60px;
    right: 10px;
    width: 44px;
    height: 44px;
    font-size: 1.2rem;
  }
}

/* ⬆️ Style override for large screens (≥768px) */
@media (min-width: 768px) {
  .fab {
    bottom: 80px;
    right: 25px;
    width: 56px;
    height: 56px;
    font-size: 1.8rem;
    background: linear-gradient(135deg, #fb646b, #f9869d); /* Optional enhancement */
  }
}

`;

// Inject custom styles
const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = customStyles;
document.head.appendChild(styleSheet);

// Utility function to format time ago
const formatTimeAgo = (date) => {
  try {
    if (!date || isNaN(new Date(date).getTime())) {
      return "Unknown time";
    }
    return formatDistanceToNow(new Date(date), { addSuffix: true });
  } catch (error) {
    return "Unknown time";
  }
};

const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:5000";

const AdminFaqs = () => {
  const [faqs, setFaqs] = useState([]);
  const [pendingFaqs, setPendingFaqs] = useState([]);
  const [terms, setTerms] = useState([]);
  const [newTerm, setNewTerm] = useState("");
  const [editTermId, setEditTermId] = useState(null);
  const [editTermText, setEditTermText] = useState("");
  const [answers, setAnswers] = useState({});
  const [activeSection, setActiveSection] = useState("pending");
  const [editFaqId, setEditFaqId] = useState(null);
  const [editFaqText, setEditFaqText] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showFabMenu, setShowFabMenu] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [modalData, setModalData] = useState({});
  const [toast, setToast] = useState({ show: false, message: "", type: "success" });
  const [openFaqId, setOpenFaqId] = useState(null);
  const fabRef = useRef(null);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [faqsRes, pendingFaqsRes, termsRes] = await Promise.all([
          axios.get(`${BASE_URL}/api/terms/faqs`, { timeout: 5000 }),
          axios.get(`${BASE_URL}/api/terms/pending-faqs`, { timeout: 5000 }),
          axios.get(`${BASE_URL}/api/terms/terms`, { timeout: 5000 }),
        ]);
        setFaqs(faqsRes.data || []);
        setPendingFaqs(pendingFaqsRes.data || []);
        setTerms(termsRes.data || []);
      } catch (err) {
        console.error("Error fetching data:", err.message);
        showToast("Failed to fetch data.", "error");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const showToast = (message, type) => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: "", type: "" }), 3000);
  };

  const handleAnswerSubmit = async () => {
    const answer = answers[modalData.id]?.trim();
    if (!answer) {
      showToast("Answer cannot be empty.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.put(
        `${BASE_URL}/api/terms/faqs/${modalData.id}`,
        { answer },
        { headers: { "user-email": localStorage.getItem("email") || "" }, timeout: 5000 }
      );
      const updatedFaq = response.data;
      setPendingFaqs(pendingFaqs.filter((faq) => faq._id !== modalData.id));
      setFaqs([...faqs, updatedFaq]);
      setAnswers((prev) => ({ ...prev, [modalData.id]: "" }));
      setShowModal(false);
      showToast("Answer submitted successfully!", "success");
    } catch (err) {
      console.error("Error submitting answer:", err.message);
      showToast("Failed to submit answer.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTerm = async () => {
    const term = newTerm.trim();
    if (!term) {
      showToast("Term cannot be empty.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${BASE_URL}/api/terms/terms`,
        { term },
        { headers: { "user-email": localStorage.getItem("email") || "" }, timeout: 5000 }
      );
      setTerms([...terms, res.data]);
      setNewTerm("");
      setShowModal(false);
      showToast("Term added successfully!", "success");
    } catch (err) {
      console.error("Error adding term:", err.message);
      showToast("Failed to add term.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditTerm = async () => {
    const term = editTermText.trim();
    if (!term) {
      showToast("Term cannot be empty.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.put(
        `${BASE_URL}/api/terms/terms/${editTermId}`,
        { term },
        { headers: { "user-email": localStorage.getItem("email") || "" }, timeout: 5000 }
      );
      setTerms(terms.map((t) => (t._id === editTermId ? res.data : t)));
      setEditTermId(null);
      setEditTermText("");
      setShowModal(false);
      showToast("Term updated successfully!", "success");
    } catch (err) {
      console.error("Error editing term:", err.message);
      showToast("Failed to edit term.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteTerm = async (termId) => {
    setIsLoading(true);
    try {
      await axios.delete(`${BASE_URL}/api/terms/terms/${termId}`, {
        headers: { "user-email": localStorage.getItem("email") || "" },
        timeout: 5000,
      });
      setTerms(terms.filter((t) => t._id !== termId));
      setOpenFaqId(null);
      showToast("Term deleted successfully!", "success");
    } catch (err) {
      console.error("Error deleting term:", err.message);
      showToast("Failed to delete term.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditFaq = async () => {
    const answer = editFaqText.trim();
    if (!answer) {
      showToast("Answer cannot be empty.", "error");
      return;
    }
    setIsLoading(true);
    try {
      const res = await axios.put(
        `${BASE_URL}/api/terms/faqs/${editFaqId}`,
        { answer },
        { headers: { "user-email": localStorage.getItem("email") || "" }, timeout: 5000 }
      );
      setFaqs(faqs.map((f) => (f._id === editFaqId ? res.data : f)));
      setEditFaqId(null);
      setEditFaqText("");
      setShowModal(false);
      showToast("FAQ updated successfully!", "success");
    } catch (err) {
      console.error("Error editing FAQ:", err.message);
      showToast("Failed to edit FAQ.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteFaq = async (faqId, isPending = false) => {
    setIsLoading(true);
    try {
      await axios.delete(`${BASE_URL}/api/terms/faqs/${faqId}`, {
        headers: { "user-email": localStorage.getItem("email") || "" },
        timeout: 5000,
      });
      if (isPending) {
        setPendingFaqs(pendingFaqs.filter((f) => f._id !== faqId));
      } else {
        setFaqs(faqs.filter((f) => f._id !== faqId));
      }
      setOpenFaqId(null);
      showToast("FAQ deleted successfully!", "success");
    } catch (err) {
      console.error("Error deleting FAQ:", err.message);
      showToast("Failed to delete FAQ.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (type, data = {}) => {
    setModalType(type);
    setModalData(data);
    setShowModal(true);
    setShowFabMenu(false);
    if (type === "editFaq") {
      setEditFaqId(data.id);
      setEditFaqText(data.answer || "");
    } else if (type === "answerFaq") {
      setAnswers((prev) => ({ ...prev, [data.id]: data.answer || "" }));
    } else if (type === "editTerm") {
      setEditTermId(data.id);
      setEditTermText(data.term || "");
    } else if (type === "addTerm") {
      setNewTerm("");
    }
  };

  const toggleFaq = (id) => {
    setOpenFaqId(openFaqId === id ? null : id);
  };

  const handleKeyPress = (e, id) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleFaq(id);
    }
  };

  return (
    <Container fluid className="admin-container">
      {toast.show && (
        <div className="toast" style={{ background: toast.type === "success" ? "#d4edda" : "#f8d7da" }}>
          {toast.message}
        </div>
      )}
      <div className="content-area">
        <Nav variant="tabs" className="custom-tab-nav justify-content-center">
          <Nav.Item>
            <Nav.Link
              eventKey="answered"
              active={activeSection === "answered"}
              onClick={() => setActiveSection("answered")}
              aria-label="View answered FAQs"
            >
              Answered FAQs
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="pending"
              active={activeSection === "pending"}
              onClick={() => setActiveSection("pending")}
              aria-label="View pending user questions"
            >
              User Questions
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link
              eventKey="terms"
              active={activeSection === "terms"}
              onClick={() => setActiveSection("terms")}
              aria-label="View terms and conditions"
            >
              Terms
            </Nav.Link>
          </Nav.Item>
        </Nav>
        <h2 className="mb-4 text-center" style={{ color: "#0e0f0f", fontWeight: 600 }}>
          FAQ & Terms Management
        </h2>
        {isLoading && <ProgressBar now={100} animated className="mb-3" />}
        {!isLoading && (
          <>
            {activeSection === "answered" && (
              <>
                {faqs.length === 0 ? (
                  <p className="no-data">No answered FAQs.</p>
                ) : (
                  faqs.slice().reverse().map((faq) => (
                    <Card key={faq._id}>
                      <div
                        className={`faq-question ${openFaqId === faq._id ? 'active' : ''}`}
                        onClick={() => toggleFaq(faq._id)}
                        onKeyDown={(e) => handleKeyPress(e, faq._id)}
                        role="button"
                        tabIndex={0}
                        aria-expanded={openFaqId === faq._id}
                        aria-controls={`faq-answer-${faq._id}`}
                      >
                        <span>{faq.question}</span>
                        <span>{openFaqId === faq._id ? '−' : '+'}</span>
                      </div>
                      <div
                        id={`faq-answer-${faq._id}`}
                        className={`faq-answer ${openFaqId === faq._id ? 'open' : ''}`}
                      >
                        <div className="faq-answer-content">
                          <div className="faq-answer-text">
                            <p className="mb-1">{faq.answer}</p>
                            <p className="time-text">
                              Created: {formatTimeAgo(faq.createdAt)} | Updated: {formatTimeAgo(faq.updatedAt)}
                            </p>
                          </div>
                          <div className="faq-answer-actions">
                            <div
                              className="faq-action-btn edit-icon"
                              onClick={() => openModal("editFaq", { id: faq._id, answer: faq.answer })}
                              role="button"
                              aria-label="Edit FAQ"
                            >
                              ✏️
                            </div>
                            <div
                              className="faq-action-btn delete-icon"
                              onClick={() => handleDeleteFaq(faq._id)}
                              role="button"
                              aria-label="Delete FAQ"
                            >
                              🗑️
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </>
            )}
            {activeSection === "pending" && (
              <>
                {pendingFaqs.length === 0 ? (
                  <p className="no-data">No pending questions.</p>
                ) : (
                  pendingFaqs.map((faq) => (
                    <Card key={faq._id}>
                      <div
                        className={`faq-question ${openFaqId === faq._id ? 'active' : ''}`}
                        onClick={() => toggleFaq(faq._id)}
                        onKeyDown={(e) => handleKeyPress(e, faq._id)}
                        role="button"
                        tabIndex={0}
                        aria-expanded={openFaqId === faq._id}
                        aria-controls={`faq-answer-${faq._id}`}
                      >
                        <span>{faq.question}</span>
                        <span>{openFaqId === faq._id ? '−' : '+'}</span>
                      </div>
                      <div
                        id={`faq-answer-${faq._id}`}
                        className={`faq-answer ${openFaqId === faq._id ? 'open' : ''}`}
                      >
                        <div className="faq-answer-content">
                          <div className="faq-answer-text">
                            <p className="mb-1">{faq.answer || 'No answer provided yet.'}</p>
                            <p className="time-text">
                              Created: {formatTimeAgo(faq.createdAt)}
                            </p>
                          </div>
                          <div className="faq-answer-actions">
                            <div
                              className="faq-action-btn edit-icon"
                              onClick={() => openModal("answerFaq", { id: faq._id, answer: faq.answer })}
                              role="button"
                              aria-label="Answer FAQ"
                            >
                              💬
                            </div>
                            <div
                              className="faq-action-btn delete-icon"
                              onClick={() => handleDeleteFaq(faq._id, true)}
                              role="button"
                              aria-label="Delete question"
                            >
                              🗑️
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </>
            )}
            {activeSection === "terms" && (
              <>
                {terms.length === 0 ? (
                  <p className="no-data">No terms available.</p>
                ) : (
                  terms.map((term) => (
                    <Card
                      key={term._id}
                      onClick={() => toggleFaq(term._id)}
                      onKeyDown={(e) => handleKeyPress(e, term._id)}
                      role="button"
                      tabIndex={0}
                      aria-expanded={openFaqId === term._id}
                    >
                      <div className="card-content">
                        <p className="mb-0">{term.term}</p>
                        <p className="time-text mb-0">{formatTimeAgo(term.createdAt)}</p>
                      </div>
                      <div className={`faq-answer ${openFaqId === term._id ? 'open' : ''}`}>
                        <div className="faq-answer-content">
                          <div className="faq-answer-actions">
                            <div
                              className="faq-action-btn edit-icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                openModal("editTerm", { id: term._id, term: term.term });
                              }}
                              role="button"
                              aria-label="Edit term"
                            >
                              ✏️
                            </div>
                            <div
                              className="faq-action-btn delete-icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteTerm(term._id);
                              }}
                              role="button"
                              aria-label="Delete term"
                            >
                              🗑️
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))
                )}
              </>
            )}
          </>
        )}
      </div>
      <div 
  className="fab"  // <-- removed d-md-none
  ref={fabRef}
  onClick={() => setShowFabMenu(!showFabMenu)}
  role="button"
  aria-label="Open action menu"
>
  +
</div>

      <Overlay target={fabRef.current} show={showFabMenu} placement="top">
        {({ placement, ...props }) => (
          <div {...props} className={`fab-menu ${showFabMenu ? 'show' : ''}`}>
            {activeSection === "terms" && (
              <div
                className="fab-menu-item"
                onClick={() => openModal("addTerm")}
                role="button"
                aria-label="Add new term"
              >
                Add Term
              </div>
            )}
            {activeSection === "pending" && pendingFaqs.length > 0 && (
              <div
                className="fab-menu-item"
                onClick={() => openModal("answerFaq", { id: pendingFaqs[0]._id, answer: pendingFaqs[0].answer })}
                role="button"
                aria-label="Answer first pending FAQ"
              >
                Answer
              </div>
            )}
          </div>
        )}
      </Overlay>
      <Modal show={showModal} onHide={() => setShowModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalType === "addTerm"
              ? "Add Term"
              : modalType === "editTerm"
              ? "Edit Term"
              : modalType === "answerFaq"
              ? "Answer FAQ"
              : "Edit FAQ"}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {isLoading && <ProgressBar now={100} animated className="mb-3" />}
          {(modalType === "addTerm" || modalType === "editTerm") && (
            <Form.Group>
              <Form.Label>Term</Form.Label>
              <Form.Control
                type="text"
                value={modalType === "addTerm" ? newTerm : editTermText}
                onChange={(e) =>
                  modalType === "addTerm"
                    ? setNewTerm(e.target.value)
                    : setEditTermText(e.target.value)
                }
                disabled={isLoading}
                aria-label={modalType === "addTerm" ? "New term" : "Edit term"}
              />
            </Form.Group>
          )}
          {(modalType === "answerFaq" || modalType === "editFaq") && (
            <Form.Group>
              <Form.Label>{modalType === "answerFaq" ? "Answer" : "Edit Answer"}</Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                value={modalType === "answerFaq" ? answers[modalData.id] || "" : editFaqText}
                onChange={(e) =>
                  modalType === "answerFaq"
                    ? setAnswers((prev) => ({ ...prev, [modalData.id]: e.target.value }))
                    : setEditFaqText(e.target.value)
                }
                disabled={isLoading}
                aria-label={modalType === "answerFaq" ? "FAQ answer" : "Edit FAQ answer"}
              />
            </Form.Group>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            className="cancel-btn action-btn"
            onClick={() => setShowModal(false)}
            disabled={isLoading}
            aria-label="Close modal"
          >
            Cancel
          </Button>
          <Button
            className="save-btn action-btn"
            onClick={() =>
              modalType === "addTerm"
                ? handleAddTerm()
                : modalType === "editTerm"
                ? handleEditTerm()
                : modalType === "answerFaq"
                ? handleAnswerSubmit()
                : handleEditFaq()
            }
            disabled={isLoading}
            aria-label="Save changes"
          >
            Save
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminFaqs;

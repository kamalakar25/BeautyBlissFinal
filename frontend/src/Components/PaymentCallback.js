"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation, useSearchParams } from "react-router-dom"
import {
  Loader2,
  Download,
  RefreshCw,
  Home,
  CheckCircle,
  XCircle,
  Clock,
  Receipt,
  Calendar,
  CreditCard,
  Hash,
  MapPin,
  Phone,
  Mail,
  ArrowLeft,
  Share2,
  Copy,
  Check,
} from "lucide-react"
import axios from "axios"
import { jsPDF } from "jspdf"
import "./PaymentCallback.css"

// Define BASE_URL for API calls
const BASE_URL = process.env.REACT_APP_API_URL

const PaymentCallback = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()
  const orderId = searchParams.get("order_id")

  const [paymentStatus, setPaymentStatus] = useState(location.state || null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [retryCount, setRetryCount] = useState(0)
  const [terms, setTerms] = useState([])
  const [copied, setCopied] = useState(false)
  const maxRetries = 5
  const retryDelay = 3000

  // Define steps for progress navigation
  const steps = ["Booking", "Payment", "Confirmation"]

  const verifyPayment = async (orderId) => {
    try {
      const response = await axios.get(`${BASE_URL}/api/razorpay/verify?order_id=${orderId}`)
      return response.data.data
    } catch (err) {
      throw err
    }
  }

  // Fetch terms and conditions
  useEffect(() => {
    const fetchTerms = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/terms/terms`)
        const uniqueTerms = Array.from(new Set(response.data.map((item) => item.term))).map((term) =>
          response.data.find((item) => item.term === term),
        )
        setTerms(uniqueTerms)
      } catch (error) {
        setError("Failed to fetch terms and conditions.")
        setTerms([])
      }
    }
    fetchTerms()
  }, [])

  // Payment verification logic
  useEffect(() => {
    const attemptVerification = async () => {
      if (!orderId) {
        setError("No order ID provided. Please try initiating the payment again.")
        setLoading(false)
        return
      }

      try {
        const statusData = await verifyPayment(orderId)

        if (statusData.paymentStatus === "PENDING" && retryCount < maxRetries) {
          setTimeout(() => {
            setRetryCount(retryCount + 1)
          }, retryDelay)
          return
        }

        setPaymentStatus(statusData)
        setLoading(false)
        if (statusData.paymentStatus === "FAILED") {
          setError(`Payment failed: ${statusData.failureReason || "Unknown reason"}`)
        }
      } catch (err) {
        const errorMessage = err.response?.data?.error || err.message
        setError(`Failed to verify payment: ${errorMessage}`)
        setLoading(false)
      }
    }

    if (!paymentStatus || paymentStatus.paymentStatus === "PENDING") {
      attemptVerification()
    } else {
      setLoading(false)
      if (paymentStatus.paymentStatus === "FAILED") {
        setError(`Payment failed: ${paymentStatus.failureReason || "Unknown reason"}`)
      }
    }
  }, [orderId, retryCount, paymentStatus])

  const handleTryAgain = () => {
    navigate("/pay", { state: location.state })
  }

  const handleRefreshStatus = async () => {
    setLoading(true)
    setError("")
    setRetryCount(0)
    try {
      const statusData = await verifyPayment(orderId)
      setPaymentStatus(statusData)
      setLoading(false)
      if (statusData.paymentStatus === "FAILED") {
        setError(`Payment failed: ${statusData.failureReason || "Unknown reason"}`)
      }
    } catch (err) {
      const errorMessage = err.response?.data?.error || err.message
      setError(`Failed to refresh payment status: ${errorMessage}`)
      setLoading(false)
    }
  }

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  // Enhanced PDF Receipt Generation
  const generateReceiptPDF = () => {
    const doc = new jsPDF({
      orientation: "portrait",
      unit: "mm",
      format: "a4",
    })

    const pageWidth = doc.internal.pageSize.width
    const pageHeight = doc.internal.pageSize.height
    const margin = 20
    let yPosition = margin

    // Modern Header with Gradient Effect
    doc.setFillColor(139, 69, 19) // Brown
    doc.rect(0, 0, pageWidth, 40, "F")

    // Add a subtle pattern
    doc.setFillColor(160, 82, 45, 0.3)
    for (let i = 0; i < pageWidth; i += 10) {
      doc.rect(i, 0, 5, 40, "F")
    }

    // Company Logo Area (placeholder)
    // doc.setFillColor(255, 255, 255)
    // doc.circle(margin + 15, 20, 12, "F")
    // doc.setFillColor(139, 69, 19)
    // doc.setFontSize(16)
    // doc.setFont("helvetica", "bold")
    // doc.text("SP", margin + 10, 23)

    // Header Text
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(24)
    doc.setFont("helvetica", "bold")
    doc.text("PAYMENT RECEIPT", pageWidth / 2, 18, { align: "center" })

    doc.setFontSize(12)
    doc.setFont("helvetica", "normal")
    doc.text(paymentStatus?.parlor?.name || "Beauty Salon", pageWidth / 2, 28, { align: "center" })

    yPosition = 50

    // Receipt Info Bar
    doc.setFillColor(245, 245, 245)
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 15, "F")
    doc.setTextColor(60, 60, 60)
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text(`Receipt #: ${paymentStatus?.orderId || "N/A"}`, margin + 5, yPosition + 8)
    doc.text(`Date: ${new Date().toLocaleDateString()}`, pageWidth - margin - 40, yPosition + 8)
    doc.text(`Time: ${new Date().toLocaleTimeString()}`, pageWidth - margin - 40, yPosition + 12)

    yPosition += 25

    // Customer Information Section
    doc.setFillColor(139, 69, 19)
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("CUSTOMER INFORMATION", margin + 5, yPosition + 6)

    yPosition += 15
    doc.setTextColor(60, 60, 60)
    doc.setFontSize(10)
    doc.setFont("helvetica", "normal")

    const customerInfo = [
      { label: "Customer Name", value: paymentStatus?.name || "N/A" },
      {
        label: "Appointment Date",
        value: paymentStatus?.date ? new Date(paymentStatus.date).toLocaleDateString() : "N/A",
      },
      { label: "Appointment Time", value: paymentStatus?.time || "N/A" },
      { label: "Preferred Staff", value: paymentStatus?.favoriteEmployee || "N/A" },
    ]

    customerInfo.forEach((item) => {
      doc.setFont("helvetica", "bold")
      doc.text(`${item.label}:`, margin + 5, yPosition)
      doc.setFont("helvetica", "normal")
      doc.text(item.value, margin + 50, yPosition)
      yPosition += 6
    })

    yPosition += 10

    // Service Details Section
    doc.setFillColor(139, 69, 19)
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("SERVICE DETAILS", margin + 5, yPosition + 6)

    yPosition += 15

    // Service Table Header
    doc.setFillColor(250, 250, 250)
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 10, "F")
    doc.setDrawColor(200, 200, 200)
    doc.setLineWidth(0.5)
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 10)

    doc.setTextColor(60, 60, 60)
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text("Service Description", margin + 5, yPosition + 7)
    doc.text("Qty", pageWidth - margin - 60, yPosition + 7)
    doc.text("Amount", pageWidth - margin - 30, yPosition + 7)

    yPosition += 10

    // Service Items
    const services = [
      {
        name: paymentStatus?.service || "Beauty Service",
        qty: "1",
        amount: paymentStatus?.total_amount || 0,
      },
    ]

    if (paymentStatus?.relatedServices?.length > 0) {
      paymentStatus.relatedServices.forEach((service) => {
        services.push({
          name: service,
          qty: "1",
          amount: "Included",
        })
      })
    }

    services.forEach((service, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(248, 248, 248)
        doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, "F")
      }

      doc.setTextColor(60, 60, 60)
      doc.setFont("helvetica", "normal")
      doc.text(service.name, margin + 5, yPosition + 6)
      doc.text(service.qty, pageWidth - margin - 60, yPosition + 6)
      doc.text(String(service.amount), pageWidth - margin - 30, yPosition + 6)
      yPosition += 8
    })

    yPosition += 10

    // Payment Summary
    doc.setFillColor(139, 69, 19)
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("PAYMENT SUMMARY", margin + 5, yPosition + 6)

    yPosition += 15

    const summaryItems = [
      { label: "Subtotal", value: `${paymentStatus?.currency || "INR"} ${paymentStatus?.total_amount || 0}` },
      { label: "Discount", value: `${paymentStatus?.currency || "INR"} ${paymentStatus?.discountAmount || 0}` },
      { label: "Total Paid", value: `${paymentStatus?.currency || "INR"} ${paymentStatus?.amount || 0}`, bold: true },
    ]

    if (paymentStatus?.couponCode) {
      summaryItems.splice(1, 0, {
        label: `Coupon (${paymentStatus.couponCode})`,
        value: `-${paymentStatus?.currency || "INR"} ${paymentStatus?.discountAmount || 0}`,
      })
    }

    summaryItems.forEach((item) => {
      if (item.bold) {
        doc.setFillColor(240, 240, 240)
        doc.rect(margin, yPosition - 2, pageWidth - 2 * margin, 8, "F")
        doc.setFont("helvetica", "bold")
        doc.setFontSize(12)
      } else {
        doc.setFont("helvetica", "normal")
        doc.setFontSize(10)
      }

      doc.setTextColor(60, 60, 60)
      doc.text(item.label, margin + 5, yPosition + 4)
      doc.text(item.value, pageWidth - margin - 5, yPosition + 4, { align: "right" })
      yPosition += item.bold ? 12 : 8
    })

    yPosition += 10

    // Payment Information
    doc.setFillColor(139, 69, 19)
    doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, "F")
    doc.setTextColor(255, 255, 255)
    doc.setFontSize(12)
    doc.setFont("helvetica", "bold")
    doc.text("PAYMENT INFORMATION", margin + 5, yPosition + 6)

    yPosition += 15

    const paymentInfo = [
      { label: "Payment Method", value: paymentStatus?.Payment_Mode || "N/A" },
      { label: "Transaction ID", value: paymentStatus?.transactionId || "N/A" },
      { label: "Payment Status", value: paymentStatus?.paymentStatus || "N/A" },
      {
        label: "Payment Date",
        value: paymentStatus?.createdAt ? new Date(paymentStatus.createdAt).toLocaleString() : "N/A",
      },
    ]

    doc.setTextColor(60, 60, 60)
    doc.setFontSize(10)
    paymentInfo.forEach((item) => {
      doc.setFont("helvetica", "bold")
      doc.text(`${item.label}:`, margin + 5, yPosition)
      doc.setFont("helvetica", "normal")
      doc.text(item.value, margin + 50, yPosition)
      yPosition += 6
    })

    yPosition += 15

    // Terms & Conditions
    if (terms.length > 0) {
      doc.setFillColor(139, 69, 19)
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, "F")
      doc.setTextColor(255, 255, 255)
      doc.setFontSize(12)
      doc.setFont("helvetica", "bold")
      doc.text("TERMS & CONDITIONS", margin + 5, yPosition + 6)

      yPosition += 15
      doc.setTextColor(60, 60, 60)
      doc.setFontSize(9)
      doc.setFont("helvetica", "normal")

      terms.slice(0, 5).forEach((term, index) => {
        const text = `${index + 1}. ${term.term}`
        const splitText = doc.splitTextToSize(text, pageWidth - 2 * margin - 10)
        splitText.forEach((line) => {
          if (yPosition > pageHeight - 40) return
          doc.text(line, margin + 5, yPosition)
          yPosition += 4
        })
      })
    }

    // Footer
    yPosition = pageHeight - 30
    doc.setFillColor(139, 69, 19)
    doc.rect(0, yPosition, pageWidth, 30, "F")

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.setFont("helvetica", "bold")
    doc.text(`Thank you for choosing ${paymentStatus?.parlor?.name || "our salon"}!`, pageWidth / 2, yPosition + 10, {
      align: "center",
    })

    doc.setFont("helvetica", "normal")
    doc.setFontSize(9)
    doc.text("For support: support@salon.com | +1-234-567-8900", pageWidth / 2, yPosition + 18, { align: "center" })
    doc.text("Visit us: www.salon.com", pageWidth / 2, yPosition + 24, { align: "center" })

    doc.save(`receipt_${paymentStatus?.orderId || "unknown"}.pdf`)
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "PAID":
        return <CheckCircle className="payment-callback-status-icon payment-callback-success" />
      case "FAILED":
        return <XCircle className="payment-callback-status-icon payment-callback-error" />
      default:
        return <Clock className="payment-callback-status-icon payment-callback-warning" />
    }
  }

  const formatCurrency = (amount, currency = "INR") => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: currency,
      minimumFractionDigits: 2,
    }).format(amount || 0)
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timeString) => {
    if (!timeString) return "N/A"
    return timeString
  }

  return (
    <div className="payment-callback-app-container">
      <div className="payment-callback-app-content">
        {/* App Header */}
        <div className="payment-callback-app-header">
          <button className="payment-callback-back-button" onClick={() => navigate("/")}>
            <ArrowLeft className="payment-callback-back-icon" />
          </button>
          <h1 className="payment-callback-app-title">Payment Status</h1>
          <div className="payment-callback-header-actions">
            {paymentStatus?.paymentStatus === "PAID" && (
              <button className="payment-callback-share-button" onClick={() => window.navigator.share?.({ title: "Payment Receipt" })}>
                <Share2 className="payment-callback-share-icon" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Steps */}
        <div className="payment-callback-progress-container">
          <div className="payment-callback-progress-track">
            {steps.map((step, index) => (
              <div key={step} className={`payment-callback-progress-step ${index <= 2 ? "payment-callback-completed" : ""}`}>
                <div className="payment-callback-step-circle">
                  <span className="payment-callback-step-number">{index + 1}</span>
                </div>
                <span className="payment-callback-step-label">{step}</span>
              </div>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="payment-callback-loading-screen">
            <div className="payment-callback-loading-content">
              <div className="payment-callback-loading-spinner-container">
                <Loader2 className="payment-callback-loading-spinner" />
                <div className="payment-callback-loading-pulse"></div>
              </div>
              <h3 className="payment-callback-loading-title">Verifying Payment</h3>
              <p className="payment-callback-loading-text">Please wait while we confirm your transaction...</p>
              <div className="payment-callback-loading-bar">
                <div className="payment-callback-loading-progress"></div>
              </div>
            </div>
          </div>
        ) : error ? (
          <div className="payment-callback-error-screen">
            <div className="payment-callback-error-content">
              <div className="payment-callback-error-icon-container">
                <XCircle className="payment-callback-error-icon" />
              </div>
              <h3 className="payment-callback-error-title">Payment Failed</h3>
              <p className="payment-callback-error-message">{error}</p>
              <div className="payment-callback-error-actions">
                <button onClick={handleTryAgain} className="payment-callback-primary-button">
                  <RefreshCw className="payment-callback-button-icon" />
                  Try Again
                </button>
                <button onClick={() => navigate("/")} className="payment-callback-secondary-button">
                  <Home className="payment-callback-button-icon" />
                  Go Home
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="payment-callback-main-content">
            {/* Status Card */}
            <div className={`payment-callback-status-card ${paymentStatus?.paymentStatus?.toLowerCase()}`}>
              <div className="payment-callback-status-header">
                <div className="payment-callback-status-icon-container">{getStatusIcon(paymentStatus?.paymentStatus)}</div>
                <div className="payment-callback-status-info">
                  <h2 className="payment-callback-status-title">
                    {paymentStatus?.paymentStatus === "PAID"
                      ? "Payment Successful!"
                      : paymentStatus?.paymentStatus === "FAILED"
                        ? "Payment Failed"
                        : "Payment Processing"}
                  </h2>
                  <p className="payment-callback-status-subtitle">
                    {paymentStatus?.paymentStatus === "PAID"
                      ? "Your payment has been processed successfully"
                      : paymentStatus?.paymentStatus === "FAILED"
                        ? "There was an issue with your payment"
                        : "Your payment is being processed"}
                  </p>
                </div>
              </div>
              <div className="payment-callback-status-amount">
                <span className="payment-callback-amount-label">Amount Paid</span>
                <span className="payment-callback-amount-value">{formatCurrency(paymentStatus?.amount, paymentStatus?.currency)}</span>
              </div>
            </div>

            {/* Receipt Card */}
            <div className="payment-callback-receipt-card">
              <div className="payment-callback-receipt-header">
                <div className="payment-callback-receipt-title-section">
                  <Receipt className="payment-callback-receipt-icon" />
                  <div>
                    <h3 className="payment-callback-receipt-title">Digital Receipt</h3>
                    <p className="payment-callback-receipt-subtitle">Order #{paymentStatus?.orderId}</p>
                  </div>
                </div>
                <button
                  className="payment-callback-copy-button"
                  onClick={() => copyToClipboard(paymentStatus?.orderId)}
                  title="Copy Order ID"
                >
                  {copied ? <Check className="payment-callback-copy-icon" /> : <Copy className="payment-callback-copy-icon" />}
                </button>
              </div>

              {/* Business Info */}
              <div className="payment-callback-business-section">
                <div className="payment-callback-business-header">
                  <MapPin className="payment-callback-business-icon" />
                  <h4 className="payment-callback-business-name">{paymentStatus?.parlor?.name || "Beauty Salon"}</h4>
                </div>
                {/* <div className="payment-callback-business-contacts">
                  <div className="payment-callback-contact-item">
                    <Phone className="payment-callback-contact-icon" />
                    <span>+1 (555) 123-4567</span>
                  </div>
                  <div className="payment-callback-contact-item">
                    <Mail className="payment-callback-contact-icon" />
                    <span>info@beautysalon.com</span>
                  </div>
                </div> */}
              </div>

              {/* Appointment Details */}
              <div className="payment-callback-details-section">
                <h4 className="payment-callback-section-title">
                  <Calendar className="payment-callback-section-icon" />
                  Appointment Details
                </h4>
                <div className="payment-callback-details-grid">
                  <div className="payment-callback-detail-item">
                    <span className="payment-callback-detail-label">Customer</span>
                    <span className="payment-callback-detail-value">{paymentStatus?.name || "N/A"}</span>
                  </div>
                  <div className="payment-callback-detail-item">
                    <span className="payment-callback-detail-label">Date</span>
                    <span className="payment-callback-detail-value">{formatDate(paymentStatus?.date)}</span>
                  </div>
                  <div className="payment-callback-detail-item">
                    <span className="payment-callback-detail-label">Time</span>
                    <span className="payment-callback-detail-value">{formatTime(paymentStatus?.time)}</span>
                  </div>
                  <div className="payment-callback-detail-item">
                    <span className="payment-callback-detail-label">Staff</span>
                    <span className="payment-callback-detail-value">{paymentStatus?.favoriteEmployee || "Any Available"}</span>
                  </div>
                </div>
              </div>

              {/* Service Details */}
              <div className="payment-callback-service-section">
                <h4 className="payment-callback-section-title">
                  <Receipt className="payment-callback-section-icon" />
                  Services
                </h4>
                <div className="payment-callback-service-list">
                  <div className="payment-callback-service-item payment-callback-primary-service">
                    <div className="payment-callback-service-info">
                      <span className="payment-callback-service-name">{paymentStatus?.service || "Beauty Service"}</span>
                      <span className="payment-callback-service-type">Primary Service</span>
                    </div>
                    <span className="payment-callback-service-price">
                      {formatCurrency(paymentStatus?.total_amount, paymentStatus?.currency)}
                    </span>
                  </div>

                  {paymentStatus?.relatedServices?.length > 0 && (
                    <>
                      <div className="payment-callback-service-divider">Additional Services</div>
                      {paymentStatus.relatedServices.map((service, index) => (
                        <div key={index} className="payment-callback-service-item payment-callback-additional-service">
                          <div className="payment-callback-service-info">
                            <span className="payment-callback-service-name">{service}</span>
                            <span className="payment-callback-service-type">Complementary</span>
                          </div>
                          <span className="payment-callback-service-included">Included</span>
                        </div>
                      ))}
                    </>
                  )}
                </div>
              </div>

              {/* Payment Summary */}
              <div className="payment-callback-summary-section">
                <h4 className="payment-callback-section-title">
                  <CreditCard className="payment-callback-section-icon" />
                  Payment Summary
                </h4>
                <div className="payment-callback-summary-list">
                  <div className="payment-callback-summary-item">
                    <span className="payment-callback-summary-label">Subtotal</span>
                    <span className="payment-callback-summary-value">
                      {formatCurrency(paymentStatus?.total_amount, paymentStatus?.currency)}
                    </span>
                  </div>

                  {paymentStatus?.couponCode && (
                    <div className="payment-callback-summary-item payment-callback-discount">
                      <span className="payment-callback-summary-label">Discount ({paymentStatus.couponCode})</span>
                      <span className="payment-callback-summary-value">
                        -{formatCurrency(paymentStatus?.discountAmount, paymentStatus?.currency)}
                      </span>
                    </div>
                  )}

                  <div className="payment-callback-summary-divider"></div>
                  <div className="payment-callback-summary-item payment-callback-total">
                    <span className="payment-callback-summary-label">Total Paid</span>
                    <span className="payment-callback-summary-value">
                      {formatCurrency(paymentStatus?.amount, paymentStatus?.currency)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Transaction Details */}
              <div className="payment-callback-transaction-section">
                <h4 className="payment-callback-section-title">
                  <Hash className="payment-callback-section-icon" />
                  Transaction Details
                </h4>
                <div className="payment-callback-transaction-list">
                  <div className="payment-callback-transaction-item">
                    <span className="payment-callback-transaction-label">Payment Method</span>
                    <span className="payment-callback-transaction-value">{paymentStatus?.Payment_Mode || "N/A"}</span>
                  </div>
                  <div className="payment-callback-transaction-item">
                    <span className="payment-callback-transaction-label">Transaction ID</span>
                    <span className="payment-callback-transaction-value payment-callback-transaction-id">{paymentStatus?.transactionId || "N/A"}</span>
                  </div>
                  <div className="payment-callback-transaction-item">
                    <span className="payment-callback-transaction-label">Payment Date</span>
                    <span className="payment-callback-transaction-value">
                      {paymentStatus?.createdAt ? new Date(paymentStatus.createdAt).toLocaleString() : "N/A"}
                    </span>
                  </div>
                  {paymentStatus?.paymentStatus === "FAILED" && (
                    <div className="payment-callback-transaction-item payment-callback-error">
                      <span className="payment-callback-transaction-label">Failure Reason</span>
                      <span className="payment-callback-transaction-value">{paymentStatus?.failureReason || "Unknown"}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="payment-callback-action-buttons">
              {paymentStatus?.paymentStatus === "PAID" && (
                <button onClick={generateReceiptPDF} className="payment-callback-primary-button payment-callback-large">
                  <Download className="payment-callback-button-icon" />
                  Download Receipt
                </button>
              )}
              {paymentStatus?.paymentStatus === "PENDING" && (
                <button onClick={handleRefreshStatus} className="payment-callback-primary-button payment-callback-large">
                  <RefreshCw className="payment-callback-button-icon" />
                  Refresh Status
                </button>
              )}
              {paymentStatus?.paymentStatus === "FAILED" && (
                <button onClick={handleTryAgain} className="payment-callback-primary-button payment-callback-large">
                  <RefreshCw className="payment-callback-button-icon" />
                  Try Again
                </button>
              )}

              <div className="payment-callback-secondary-actions">
                <button onClick={() => navigate("/")} className="payment-callback-secondary-button">
                  <Home className="payment-callback-button-icon" />
                  Back to Home
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentCallback
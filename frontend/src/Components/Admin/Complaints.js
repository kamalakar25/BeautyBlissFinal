import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  IconButton,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useMediaQuery,
} from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ArrowBackIos from '@mui/icons-material/ArrowBackIos';
import ArrowForwardIos from '@mui/icons-material/ArrowForwardIos';
import { styled, useTheme } from '@mui/material/styles';

const BASE_URL = process.env.REACT_APP_API_URL;

// Styled FilterToggleButton
const FilterToggleButton = styled(IconButton)(({ theme }) => ({
  display: 'none',
  [theme.breakpoints.down('lg')]: {
    display: 'block',
    color: '#fb646b',
    backgroundColor: 'transparent',
    border: '2px solid #fb646b',
    borderRadius: '50%',
    padding: '8px',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: '#fb646b',
      color: '#ffffff',
      transform: 'scale(1.1)',
      boxShadow: '0 4px 12px rgba(32, 21, 72, 0.4)',
    },
  },
}));

// Styled Badge
const StyledBadge = styled(Box)(({ theme, color }) => ({
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '4px 12px',
  borderRadius: '12px',
  fontSize: '0.75rem',
  fontWeight: 'bold',
  color: '#ffffff',
  backgroundColor: color === 'danger' ? '#dc2626' : '#d97706',
  marginLeft: '8px',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'scale(1.1)',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)',
  },
}));

// Styled Accordion
const StyledAccordion = styled(Accordion)(({ theme }) => ({
  backgroundColor: 'rgba(255, 255, 255, 0.95)',
  borderRadius: '10px',
  border: '1px solid #e2e8f0',
  marginBottom: '16px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  transition: 'all 0.3s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 15px rgba(0, 0, 0, 0.15)',
  },
  '&:before': {
    display: 'none',
  },
}));

const StyledAccordionSummary = styled(AccordionSummary)(({ theme }) => ({
  background: '#fb646b',
  color: '#ffffff',
  borderRadius: '8px',
  padding: '10px 16px',
  '& .MuiAccordionSummary-content': {
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  '&:hover': {
    backgroundColor: '#e65a60',
    boxShadow: '0 2px 6px rgba(0, 0, 0, 0.2)',
  },
  '& .MuiAccordionSummary-expandIconWrapper': {
    color: '#ffffff',
  },
}));

const Complaints = () => {
  const [userComplaints, setUserComplaints] = useState([]);
  const [spComplaints, setSpComplaints] = useState([]);
  const [activeView, setActiveView] = useState('user');
  const [filteredData, setFilteredData] = useState([]);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [error, setError] = useState('');
  const itemsPerPage = 5;

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg')); // Detect mobile view

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        const res = await axios.get(`${BASE_URL}/api/users/get/all/complaints`);
        setUserComplaints(res.data.userComplaints || []);
        setSpComplaints(res.data.spComplaints || []);
        setFilteredData(res.data.userComplaints || []);
      } catch (err) {
        setError('Failed to load complaints data. Please try again.');
      }
    };
    fetchComplaints();
  }, []);

  useEffect(() => {
    const dataToDisplay = activeView === 'user' ? userComplaints : spComplaints;
    let filtered = dataToDisplay;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter((complaint) =>
        [
          complaint.email || '',
          complaint.parlorEmail || complaint.userEmail || 'n/a',
          complaint.parlorName || 'n/a',
          complaint.complaint || 'n/a',
          formatDate(complaint.date) || '',
          complaint.service || 'n/a',
        ].some((field) => field.toLowerCase().includes(query))
      );
    }

    if (fromDate || toDate) {
      filtered = filtered.filter((complaint) => {
        if (!complaint.date) return false;
        try {
          const complaintDate = new Date(complaint.date);
          if (isNaN(complaintDate.getTime())) return false;
          const from = fromDate ? new Date(fromDate) : null;
          const to = toDate ? new Date(toDate) : null;
          if (to) to.setHours(23, 59, 59, 999);
          if (from && to) {
            return complaintDate >= from && complaintDate <= to;
          } else if (from) {
            return complaintDate >= from;
          } else if (to) {
            return complaintDate <= to;
          }
          return true;
        } catch (error) {
          return false;
        }
      });
    }

    setFilteredData(filtered);
    setCurrentPage(1);
  }, [searchQuery, userComplaints, spComplaints, activeView, fromDate, toDate]);

  const clearFilter = () => {
    setFromDate('');
    setToDate('');
    setSearchQuery('');
    setFilteredData(activeView === 'user' ? userComplaints : spComplaints);
    setCurrentPage(1);
    setShowFilters(false);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Invalid Date';
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (error) {
      return 'Invalid Date';
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage) || 1;

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  const handleToggleFilters = () => {
    setShowFilters((prev) => !prev);
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
        minHeight: '100vh',
        p: { xs: '20px 10px', sm: '30px' },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        mt: '100px',
      }}
    >
      <Box
        sx={{
          width: '100%',
          maxWidth: '1200px',
          backgroundColor: '#fad9e3',
          borderRadius: '12px',
          p: '24px',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
          border: '1px solid #e2e8f0',
          margin: '0 auto',
          transition: 'all 0.3s ease',
          animation: 'fadeIn 0.5s ease-out',
          '@keyframes fadeIn': {
            from: { opacity: 0 },
            to: { opacity: 1 },
          },
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0, 0, 0, 0.15)',
          },
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            mb: '24px',
            gap: '16px',
          }}
        >
          <Box
            component="h2"
            sx={{
              fontSize: { xs: '1.75rem', sm: '2rem' },
              color: '#0e0f0f',
              fontWeight: 'bold',
              m: 0,
              textAlign: 'center',
              transition: 'all 0.3s ease',
              '&:hover': {
                color: '#fb646b',
                transform: 'scale(1.03)',
              },
            }}
          >
            Complaints Overview
          </Box>
          <Box
            sx={{
              width: '100%',
            }}
          >
            <Box
              sx={{
                display: 'flex',
                flexDirection: { xs: 'column', sm: 'row', lg: 'row' },
                flexWrap: { sm: 'wrap' },
                justifyContent: 'center',
                alignItems: 'center',
                gap: { xs: 2, sm: 3 },
                width: '100%',
                mb: '20px',
              }}
            >
              <Box
                sx={{
                  display: { xs: 'flex', lg: 'none' },
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 1,
                  width: '100%',
                  maxWidth: { xs: '100%', sm: '400px' },
                }}
              >
                <Box
                  component="input"
                  type="text"
                  placeholder="Search by email, complaint, date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    p: '10px',
                    borderRadius: '8px',
                    border: '2px solid #fb646b',
                    backgroundColor: '#ffffff',
                    fontSize: '0.95rem',
                    width: '100%',
                    maxWidth: { xs: '100%', sm: '200px' },
                    color: '#0e0f0f',
                    textAlign: 'center',
                    transition: 'all 0.3s ease',
                    '&:focus': {
                      borderColor: '#fb646b',
                      boxShadow: '0 0 10px rgba(32, 21, 72, 0.3)',
                      backgroundColor: '#ffffff',
                    },
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 2px 8px rgba(32, 21, 72, 0.2)',
                    },
                  }}
                />
                <FilterToggleButton onClick={handleToggleFilters} style={{ borderRadius: '20px' }}>
                  <FilterListIcon />
                </FilterToggleButton>
              </Box>
              <Box
                sx={{
                  display: { xs: showFilters ? 'flex' : 'none', lg: 'flex' },
                  flexDirection: { xs: 'column', sm: 'row' },
                  justifyContent: 'center',
                  alignItems: { xs: 'center', sm: 'flex-end' }, // Align bottom at sm and above
                  gap: { xs: 2, sm: 3 },
                  width: '100%',
                  flexWrap: 'wrap',
                }}
              >
                <Box
                  component="input"
                  type="text"
                  placeholder="Search by email, complaint, date..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  sx={{
                    p: '10px',
                    borderRadius: '8px',
                    border: '2px solid #fb646b',
                    backgroundColor: '#ffffff',
                    fontSize: '0.95rem',
                    width: { xs: '100%', sm: '180px' },
                    maxWidth: '180px',
                    color: '#0e0f0f',
                    textAlign: 'left',
                    display: { xs: 'none', lg: 'block' },
                    transition: 'all 0.3s ease',
                    '&:focus': {
                      borderColor: '#fb646b',
                      boxShadow: '0 0 10px rgba(32, 21, 72, 0.3)',
                      backgroundColor: '#ffffff',
                    },
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: '0 2px 8px rgba(32, 21, 72, 0.2)',
                    },
                  }}
                />
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'row',
                    alignItems: 'center',
                    width: { xs: '100%', sm: 'auto' },
                    gap: 2,
                    justifyContent: 'center',
                  }}
                >
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: { xs: '50%', sm: 'auto' },
                    }}
                  >
                    <Box
                      component="label"
                      htmlFor="fromDate"
                      sx={{
                        fontSize: '0.95rem',
                        color: '#0e0f0f',
                        mb: 1,
                        fontWeight: 'medium',
                        transition: 'all 0.3s ease',
                        '&:hover': { color: '#fb646b' },
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
                      sx={{
                        p: '10px',
                        borderRadius: '8px',
                        border: '2px solid #fb646b',
                        backgroundColor: '#ffffff',
                        fontSize: '0.95rem',
                        width: '100%',
                        maxWidth: { xs: '150px', sm: '150px' },
                        textAlign: 'center',
                        color: '#0e0f0f',
                        transition: 'all 0.3s ease',
                        '&:focus': {
                          borderColor: '#fb646b',
                          boxShadow: '0 0 10px rgba(32, 21, 72, 0.3)',
                        },
                        '&:hover': {
                          transform: 'scale(1.02)',
                          boxShadow: '0 2px 8px rgba(32, 21, 72, 0.2)',
                        },
                      }}
                    />
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      width: { xs: '50%', sm: 'auto' },
                    }}
                  >
                    <Box
                      component="label"
                      htmlFor="toDate"
                      sx={{
                        fontSize: '0.95rem',
                        color: '#0e0f0f',
                        mb: 1,
                        fontWeight: 'medium',
                        transition: 'all 0.3s ease',
                        '&:hover': { color: '#fb646b' },
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
                      max={new Date().toISOString().split('T')[0]}
                      sx={{
                        p: '10px',
                        borderRadius: '8px',
                        border: '2px solid #fb646b',
                        backgroundColor: '#ffffff',
                        fontSize: '0.95rem',
                        width: '100%',
                        maxWidth: { xs: '150px', sm: '150px' },
                        textAlign: 'center',
                        color: '#0e0f0f',
                        transition: 'all 0.3s ease',
                        '&:focus': {
                          borderColor: '#fb646b',
                          boxShadow: '0 0 10px rgba(32, 21, 72, 0.3)',
                        },
                        '&:hover': {
                          transform: 'scale(1.02)',
                          boxShadow: '0 2px 8px rgba(32, 21, 72, 0.2)',
                        },
                      }}
                    />
                  </Box>
                </Box>
                <Box
                  component="button"
                  onClick={clearFilter}
                  disabled={!searchQuery && !fromDate && !toDate}
                  sx={{
                    p: '10px 20px',
                    borderRadius: '8px',
                    border: '2px solid #fb646b',
                    background: '#fb646b',
                    fontSize: '0.95rem',
                    fontWeight: '600',
                    color: '#fff',
                    cursor: !searchQuery && !fromDate && !toDate ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    height: '40px',
                    width: { xs: '100%', sm: 'auto' },
                    maxWidth: { xs: '200px', sm: '180px' },
                    margin: { xs: '0 auto', sm: '0' },
                    '&:hover': {
                      ...(searchQuery || fromDate || toDate
                        ? {
                            background: '#ffffff',
                            color: '#0e0f0f',
                            transform: 'scale(1.05)',
                            boxShadow: '0 4px 12px rgba(32, 0, 0, 0.3)',
                          }
                        : {}),
                    },
                    '&:disabled': {
                      opacity: 0.6,
                    },
                  }}
                >
                  Clear Filters
                </Box>
              </Box>
            </Box>
            <Box
              sx={{
                mb: '20px',
                display: 'flex',
                flexDirection: { xs: 'row', sm: 'row' },
                gap: '10px',
                justifyContent: 'center',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <Box
                component="button"
                onClick={() => {
                  setActiveView('user');
                  setCurrentPage(1);
                  setFilteredData(userComplaints);
                }}
                sx={{
                  p: '10px 20px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  minWidth: '120px',
                  borderRadius: '8px',
                  border: activeView === 'user' ? 'none' : '2px solid #fb646b',
                  background: activeView === 'user' ? '#fb646b' : '#ffffff',
                  color: activeView === 'user' ? '#ffffff' : '#0e0f0f',
                  cursor: 'pointer',
                  width: { xs: '50%', sm: 'auto' },
                  maxWidth: '200px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    background: '#fb646b',
                    color: '#ffffff',
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 12px rgba(32, 0, 0)',
                  },
                }}
              >
                User Complaints
                {activeView !== 'user' && <StyledBadge color="danger">{userComplaints.length}</StyledBadge>}
              </Box>
              <Box
                component="button"
                onClick={() => {
                  setActiveView('sp');
                  setCurrentPage(1);
                  setFilteredData(spComplaints);
                }}
                sx={{
                  p: '10px 20px',
                  fontSize: '0.95rem',
                  fontWeight: '600',
                  minWidth: '120px',
                  borderRadius: '8px',
                  border: activeView === 'sp' ? 'none' : '2px solid #fb646b',
                  background: activeView === 'sp' ? '#fb646b' : '#ffffff',
                  color: activeView === 'sp' ? '#ffffff' : '#0e0f0f',
                  cursor: 'pointer',
                  width: { xs: '50%', sm: 'auto' },
                  maxWidth: '200px',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
                  '&:hover': {
                    background: '#fb646b',
                    color: '#ffffff',
                    transform: 'scale(1.05)',
                    boxShadow: '0 4px 12px rgba(32, 0, 0)',
                  },
                }}
              >
                SP Complaints
                {activeView !== 'sp' && <StyledBadge color="warning">{spComplaints.length}</StyledBadge>}
              </Box>
            </Box>
          </Box>
        </Box>

        {error && (
          <Box
            sx={{
              color: '#dc2626',
              fontSize: '0.95rem',
              textAlign: 'center',
              mb: '16px',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              '&:hover': {
                color: '#b91c1c',
              },
            }}
          >
            {error}
          </Box>
        )}

        {isMobile ? (
          <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
            {currentItems.length > 0 ? (
              currentItems.map((c, index) => (
                <StyledAccordion key={c._id || index}>
                  <StyledAccordionSummary
                    expandIcon={<ExpandMoreIcon />}
                    aria-controls={`panel${index}-content`}
                    id={`panel${index}-header`}
                  >
                    <Box sx={{ display: 'flex', flexDirection: 'column', maxWidth: '80%' }}>
                      <Typography
                        sx={{
                          fontWeight: 'bold',
                          fontSize: '0.95rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {activeView === 'user' ? c.email || 'N/A' : c.email || 'N/A'}
                      </Typography>
                      <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                        {formatDate(c.date)}
                      </Typography>
                    </Box>
                  </StyledAccordionSummary>
                  <AccordionDetails sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                      {activeView === 'user' ? (
                        <>
                          <Typography variant="body2" sx={{ color: '#0e0f0f', fontSize: '0.95rem' }}>
                            <strong>Customer Email:</strong> {c.email || 'N/A'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#0e0f0f', fontSize: '0.95rem' }}>
                            <strong>SP Email:</strong> {c.parlorEmail || 'N/A'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#0e0f0f', fontSize: '0.95rem' }}>
                            <strong>Shop/Clinic Name:</strong> {c.parlorName || 'N/A'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#0e0f0f', fontSize: '0.95rem' }}>
                            <strong>Complaint:</strong> {c.complaint || 'N/A'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#0e0f0f', fontSize: '0.95rem' }}>
                            <strong>Date:</strong> {formatDate(c.date)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#0e0f0f', fontSize: '0.95rem' }}>
                            <strong>Service:</strong> {c.service || 'N/A'}
                          </Typography>
                        </>
                      ) : (
                        <>
                          <Typography variant="body2" sx={{ color: '#0e0f0f', fontSize: '0.95rem' }}>
                            <strong>SP Email:</strong> {c.email || 'N/A'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#0e0f0f', fontSize: '0.95rem' }}>
                            <strong>Customer Email:</strong> {c.userEmail || 'N/A'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#0e0f0f', fontSize: '0.95rem' }}>
                            <strong>Complaint:</strong> {c.complaint || 'N/A'}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#0e0f0f', fontSize: '0.95rem' }}>
                            <strong>Date:</strong> {formatDate(c.date)}
                          </Typography>
                          <Typography variant="body2" sx={{ color: '#0e0f0f', fontSize: '0.95rem' }}>
                            <strong>Service:</strong> {c.service || 'N/A'}
                          </Typography>
                        </>
                      )}
                    </Box>
                  </AccordionDetails>
                </StyledAccordion>
              ))
            ) : (
              <Box
                sx={{
                  textAlign: 'center',
                  p: '20px',
                  color: '#0e0f0f',
                  fontSize: '1rem',
                  fontWeight: '500',
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                }}
              >
                No {activeView === 'user' ? 'user' : 'service provider'} complaints available
              </Box>
            )}
          </Box>
        ) : (
          <Box sx={{ overflowX: 'auto', width: '100%' }}>
            <Box
              component="table"
              sx={{
                width: '100%',
                borderCollapse: 'collapse',
                background: 'rgba(255, 255, 255, 0.95)',
                borderRadius: '10px',
                overflow: 'hidden',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              }}
            >
              <Box
                component="thead"
                sx={{
                  background: '#fb646b',
                  color: '#ffffff',
                }}
              >
                <tr>
                  {activeView === 'user'
                    ? [
                        '#',
                        'Customer Email',
                        'SP Email',
                        'Shop/Clinic Name',
                        'Complaint',
                        'Date',
                        'Service',
                      ].map((header, idx) => (
                        <Box
                          component="th"
                          key={idx}
                          sx={{
                            p: '14px',
                            textAlign: 'center',
                            fontSize: '1rem',
                            fontWeight: '600',
                            border: '1px solid #e2e8f0',
                            transition: 'background 0.3s ease',
                            '&:hover': {
                              background: '#e65a60',
                            },
                          }}
                        >
                          {header}
                        </Box>
                      ))
                    : ['#', 'SP Email', 'Customer Email', 'Complaint', 'Date', 'Service'].map(
                        (header, idx) => (
                          <Box
                            component="th"
                            key={idx}
                            sx={{
                              p: '14px',
                              textAlign: 'center',
                              fontSize: '1rem',
                              fontWeight: '600',
                              border: '1px solid #e2e8f0',
                              transition: 'background 0.3s ease',
                              '&:hover': {
                                background: '#e65a60',
                              },
                            }}
                          >
                            {header}
                        </Box>
                      ))}
                </tr>
              </Box>
              <Box component="tbody">
                {currentItems.length > 0 ? (
                  currentItems.map((c, index) => (
                    <Box
                      component="tr"
                      key={c._id || index}
                      sx={{
                        background: index % 2 === 0 ? '#ffffff' : 'rgba(240, 244, 255, 0.5)',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          background: '#f1f5f9',
                          transform: 'scale(1.01)',
                        },
                      }}
                    >
                      <Box
                        component="td"
                        sx={{
                          p: '14px',
                          fontSize: '0.95rem',
                          textAlign: 'center',
                          border: '1px solid #e2e8f0',
                          color: '#0e0f0f',
                        }}
                      >
                        {indexOfFirstItem + index + 1}
                      </Box>
                      {activeView === 'user' ? (
                        <>
                          <Box
                            component="td"
                            sx={{
                              p: '14px',
                              fontSize: '0.95rem',
                              textAlign: 'center',
                              border: '1px solid #e2e8f0',
                              color: '#0e0f0f',
                            }}
                          >
                            {c.email || 'N/A'}
                          </Box>
                          <Box
                            component="td"
                            sx={{
                              p: '14px',
                              fontSize: '0.95rem',
                              textAlign: 'center',
                              border: '1px solid #e2e8f0',
                              color: '#0e0f0f',
                            }}
                          >
                            {c.parlorEmail || 'N/A'}
                          </Box>
                          <Box
                            component="td"
                            sx={{
                              p: '14px',
                              fontSize: '0.95rem',
                              textAlign: 'center',
                              border: '1px solid #e2e8f0',
                              color: '#0e0f0f',
                            }}
                          >
                            {c.parlorName || 'N/A'}
                          </Box>
                          <Box
                            component="td"
                            sx={{
                              p: '14px',
                              fontSize: '0.95rem',
                              textAlign: 'center',
                              border: '1px solid #e2e8f0',
                              color: 'red',
                            }}
                          >
                            {c.complaint || 'N/A'}
                          </Box>
                          <Box
                            component="td"
                            sx={{
                              p: '14px',
                              fontSize: '0.95rem',
                              textAlign: 'center',
                              border: '1px solid #e2e8f0',
                              color: '#0e0f0f',
                            }}
                          >
                            {formatDate(c.date)}
                          </Box>
                          <Box
                            component="td"
                            sx={{
                              p: '14px',
                              fontSize: '0.95rem',
                              textAlign: 'center',
                              border: '1px solid #e2e8f0',
                              color: '#0e0f0f',
                            }}
                          >
                            {c.service || 'N/A'}
                          </Box>
                        </>
                      ) : (
                        <>
                          <Box
                            component="td"
                            sx={{
                              p: '14px',
                              fontSize: '0.95rem',
                              textAlign: 'center',
                              border: '1px solid #e2e8f0',
                              color: '#0e0f0f',
                            }}
                          >
                            {c.email || 'N/A'}
                          </Box>
                          <Box
                            component="td"
                            sx={{
                              p: '14px',
                              fontSize: '0.95rem',
                              textAlign: 'center',
                              border: '1px solid #e2e8f0',
                              color: '#0e0f0f',
                            }}
                          >
                            {c.userEmail || 'N/A'}
                          </Box>
                          <Box
                            component="td"
                            sx={{
                              p: '14px',
                              fontSize: '0.95rem',
                              textAlign: 'center',
                              border: '1px solid #e2e8f0',
                              color: '#0e0f0f',
                            }}
                          >
                            {c.complaint || 'N/A'}
                          </Box>
                          <Box
                            component="td"
                            sx={{
                              p: '14px',
                              fontSize: '0.95rem',
                              textAlign: 'center',
                              border: '1px solid #e2e8f0',
                              color: '#0e0f0f',
                            }}
                          >
                            {formatDate(c.date)}
                          </Box>
                          <Box
                            component="td"
                            sx={{
                              p: '14px',
                              fontSize: '0.95rem',
                              textAlign: 'center',
                              border: '1px solid #e2e8f0',
                              color: '#0e0f0f',
                            }}
                          >
                            {c.service || 'N/A'}
                          </Box>
                        </>
                      )}
                    </Box>
                  ))
                ) : (
                  <Box component="tr">
                    <Box
                      component="td"
                      colSpan={activeView === 'user' ? 7 : 6}
                      sx={{
                        textAlign: 'center',
                        p: '20px',
                        color: '#0e0f0f',
                        fontSize: '1rem',
                        fontWeight: '500',
                        border: '1px solid #e2e8f0',
                        backgroundColor: 'rgba(255, 255, 255, 0.95)',
                      }}
                    >
                      No {activeView === 'user' ? 'user' : 'service provider'} complaints available
                    </Box>
                  </Box>
                )}
              </Box>
            </Box>
          </Box>
        )}

        {filteredData.length > itemsPerPage && (
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
      </Box>
    </Box>
  );
};

export default Complaints;
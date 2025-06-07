import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Box, Button, Typography, Accordion, AccordionSummary, AccordionDetails, useMediaQuery } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { styled, useTheme } from '@mui/material/styles';

const BASE_URL = process.env.REACT_APP_API_URL;

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

const Approvals = () => {
  const [providers, setProviders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [providersPerPage] = useState(5);
  const [loadingStates, setLoadingStates] = useState({}); // Track loading state for each provider

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('lg')); // Detect mobile view

  useEffect(() => {
    axios
      .get(`${BASE_URL}/api/main/admin/service-providers/pending`)
      .then((res) => {
        setProviders(res.data.reverse());
        setLoading(false);
      })
      .catch((err) => {
        setLoading(false);
      });
  }, []);

  const handleApprove = (id) => {
    const isConfirmed = window.confirm('Are you sure you want to approve this service provider?');
    if (isConfirmed) {
      setLoadingStates((prev) => ({ ...prev, [id]: true }));
      axios
        .post(`${BASE_URL}/api/main/admin/service-providers/approve/${id}`)
        .then((res) => {
          setProviders((prev) => prev.filter((provider) => provider._id !== id));
          setLoadingStates((prev) => ({ ...prev, [id]: false }));
        })
        .catch((err) => {
          setLoadingStates((prev) => ({ ...prev, [id]: false }));
        });
    }
  };

  const handleReject = (id) => {
    const isConfirmed = window.confirm('Are you sure you want to reject this service provider?');
    if (isConfirmed) {
      axios
        .post(`${BASE_URL}/api/main/admin/service-providers/reject/${id}`)
        .then((res) => {
          setProviders((prev) => prev.filter((provider) => provider._id !== id));
        })
        .catch((err) => {});
    }
  };

  const indexOfLastProvider = currentPage * providersPerPage;
  const indexOfFirstProvider = indexOfLastProvider - providersPerPage;
  const currentProviders = providers.slice(indexOfFirstProvider, indexOfLastProvider);
  const totalPages = Math.ceil(providers.length / providersPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
      {/* Dot Spinner CSS */}
      <style>
        {`
          .dot-spinner {
            --uib-size: 2.8rem;
            --uib-speed: .9s;
            --uib-color: #183153;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            height: var(--uib-size);
            width: var(--uib-size);
          }

          .dot-spinner__dot {
            position: absolute;
            top: 0;
            left: 0;
            display: flex;
            align-items: center;
            justify-content: flex-start;
            height: 100%;
            width: 100%;
          }

          .dot-spinner__dot::before {
            content: '';
            height: 20%;
            width: 20%;
            border-radius: 50%;
            background-color: var(--uib-color);
            transform: scale(0);
            opacity: 0.5;
            animation: pulse0112 calc(var(--uib-speed) * 1.111) ease-in-out infinite;
            box-shadow: 0 0 20px rgba(18, 31, 53, 0.3);
          }

          .dot-spinner__dot:nth-child(2) {
            transform: rotate(45deg);
          }

          .dot-spinner__dot:nth-child(2)::before {
            animation-delay: calc(var(--uib-speed) * -0.875);
          }

          .dot-spinner__dot:nth-child(3) {
            transform: rotate(90deg);
          }

          .dot-spinner__dot:nth-child(3)::before {
            animation-delay: calc(var(--uib-speed) * -0.75);
          }

          .dot-spinner__dot:nth-child(4) {
            transform: rotate(135deg);
          }

          .dot-spinner__dot:nth-child(4)::before {
            animation-delay: calc(var(--uib-speed) * -0.625);
          }

          .dot-spinner__dot:nth-child(5) {
            transform: rotate(180deg);
          }

          .dot-spinner__dot:nth-child(5)::before {
            animation-delay: calc(var(--uib-speed) * -0.5);
          }

          .dot-spinner__dot:nth-child(6) {
            transform: rotate(225deg);
          }

          .dot-spinner__dot:nth-child(6)::before {
            animation-delay: calc(var(--uib-speed) * -0.375);
          }

          .dot-spinner__dot:nth-child(7) {
            transform: rotate(270deg);
          }

          .dot-spinner__dot:nth-child(7)::before {
            animation-delay: calc(var(--uib-speed) * -0.25);
          }

          .dot-spinner__dot:nth-child(8) {
            transform: rotate(315deg);
          }

          .dot-spinner__dot:nth-child(8)::before {
            animation-delay: calc(var(--uib-speed) * -0.125);
          }

          @keyframes pulse0112 {
            0%, 100% {
              transform: scale(0);
              opacity: 0.5;
            }
            50% {
              transform: scale(1);
              opacity: 1;
            }
          }
        `}
      </style>

      <Box
        sx={{
          width: '100%',
          maxWidth: '1200px',
          backgroundColor: '#fad9e3',
          borderRadius: '12px',
          p: '24px',
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          border: '1px solid #e2e8f0',
          margin: '0 auto',
          transition: 'all 0.3s ease',
          animation: 'fadeIn 0.5s ease-out',
          '@keyframes fadeIn': {
            from: { opacity: 0 },
            to: { opacity: 1 },
          },
          '&:hover': {
            boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
          },
        }}
      >
        <Box
          component="h2"
          sx={{
            fontSize: { xs: '1.75rem', sm: '2rem' },
            color: '#0e0f0f',
            m: 0,
            textAlign: 'center',
            mb: '24px',
            fontWeight: '700',
            transition: 'transform 0.3s ease, color 0.3s ease',
            '&:hover': {
              transform: 'scale(1.03)',
              color: '#fb646b',
            },
          }}
        >
          Pending Service Provider Approvals
        </Box>

        {loading ? (
          <Box
            sx={{
              fontSize: '1.2rem',
              textAlign: 'center',
              color: '#0e0f0f',
              fontWeight: '500',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              animation: 'fadeIn 0.8s ease',
              '@keyframes fadeIn': {
                from: { opacity: 0 },
                to: { opacity: 1 },
              },
            }}
          >
            <Box
              sx={{
                width: '30px',
                height: '30px',
                border: '4px solid #0e0f0f',
                borderTop: '4px solid transparent',
                borderRadius: '50%',
                animation: 'spin 1.2s cubic-bezier(0.68, -0.55, 0.27, 1.55) infinite',
                '@keyframes spin': {
                  '0%': { transform: 'rotate(0deg)' },
                  '100%': { transform: 'rotate(360deg)' },
                },
              }}
            />
            Loading Providers...
          </Box>
        ) : providers.length === 0 ? (
          <Box
            sx={{
              textAlign: 'center',
              mt: '50px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              animation: 'fadeIn 1s ease',
              '@keyframes fadeIn': {
                from: { opacity: 0, transform: 'scale(0.9)' },
                to: { opacity: 1, transform: 'scale(1)' },
              },
            }}
          >
            <Box
              component="img"
              src="https://t4.ftcdn.net/jpg/10/94/69/29/360_F_1094692957_4FCjgR355Mwl9Oosvpz67f9Kplgzy9Gr.jpg"
              alt="All approved"
              sx={{
                width: '140px',
                opacity: 0.8,
                transition: 'opacity 0.3s ease, transform 0.3s ease',
                '&:hover': { opacity: 1, transform: 'scale(1.15) rotate(5deg)' },
              }}
            />
            <Box
              component="h5"
              sx={{
                mt: '20px',
                fontSize: '1.4rem',
                color: '#0e0f0f',
                fontWeight: '500',
              }}
            >
              All service providers are approved!
            </Box>
          </Box>
        ) : (
          <>
            {isMobile ? (
              <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2 }}>
                {currentProviders.map((provider, index) => (
                  <StyledAccordion key={provider._id}>
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
                          {provider.name || 'N/A'}
                        </Typography>
                        <Typography sx={{ fontSize: '0.85rem', color: 'rgba(255, 255, 255, 0.8)' }}>
                          {provider.email || 'N/A'}
                        </Typography>
                      </Box>
                    </StyledAccordionSummary>
                    <AccordionDetails sx={{ p: 2, backgroundColor: 'rgba(255, 255, 255, 0.95)' }}>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                        <Typography variant="body2" sx={{ color: '#0e0f0f', fontSize: '0.95rem' }}>
                          <strong>Name:</strong> {provider.name || 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#0e0f0f', fontSize: '0.95rem' }}>
                          <strong>Email:</strong> {provider.email || 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#0e0f0f', fontSize: '0.95rem' }}>
                          <strong>Phone:</strong> {provider.phone || 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#0e0f0f', fontSize: '0.95rem' }}>
                          <strong>Designation:</strong> {provider.designation || 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#0e0f0f', fontSize: '0.95rem' }}>
                          <strong>Shop Name:</strong> {provider.shopName || 'N/A'}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#0e0f0f', fontSize: '0.95rem' }}>
                          <strong>Address:</strong> {provider.spAddress || 'N/A'}
                        </Typography>
                        <Box sx={{ display: 'flex', justifyContent: 'center', gap: '12px', mt: 2 }}>
                          <Button
                            onClick={() => handleApprove(provider._id)}
                            disabled={loadingStates[provider._id]}
                            sx={{
                              p: '10px 20px',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              borderRadius: '12px',
                              border: 'none',
                              background: '#fb646b',
                              color: '#ffffff',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: '#ffffff',
                                color: '#0e0f0f',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                              },
                              '&:disabled': {
                                opacity: 0.6,
                                cursor: 'not-allowed',
                              },
                            }}
                          >
                            {loadingStates[provider._id] ? (
                              <div className="dot-spinner">
                                <div className="dot-spinner__dot"></div>
                                <div className="dot-spinner__dot"></div>
                                <div className="dot-spinner__dot"></div>
                                <div className="dot-spinner__dot"></div>
                                <div className="dot-spinner__dot"></div>
                                <div className="dot-spinner__dot"></div>
                                <div className="dot-spinner__dot"></div>
                                <div className="dot-spinner__dot"></div>
                              </div>
                            ) : (
                              'Approve'
                            )}
                          </Button>
                          <Button
                            onClick={() => handleReject(provider._id)}
                            sx={{
                              p: '10px 20px',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              borderRadius: '12px',
                              border: 'none',
                              background: '#ffffff',
                              color: '#0e0f0f',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: '#fb646b',
                                color: '#ffffff',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                              },
                            }}
                          >
                            Reject
                          </Button>
                        </Box>
                      </Box>
                    </AccordionDetails>
                  </StyledAccordion>
                ))}
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
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
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
                      {[
                        'Sl. No',
                        'Name',
                        'Email',
                        'Phone',
                        'Designation',
                        'Shop Name',
                        'Address',
                        'Actions',
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
                      ))}
                    </tr>
                  </Box>
                  <Box component="tbody">
                    {currentProviders.map((provider, index) => (
                      <Box
                        component="tr"
                        key={provider._id}
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
                          {indexOfFirstProvider + index + 1}
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
                          {provider.name || 'N/A'}
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
                          {provider.email || 'N/A'}
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
                          {provider.phone || 'N/A'}
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
                          {provider.designation || 'N/A'}
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
                          {provider.shopName || 'N/A'}
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
                          {provider.spAddress || 'N/A'}
                        </Box>
                        <Box
                          component="td"
                          sx={{
                            p: '14px',
                            fontSize: '0.95rem',
                            textAlign: 'center',
                            display: 'flex',
                            justifyContent: 'center',
                            gap: '12px',
                            border: '1px solid #e2e8f0',
                          }}
                        >
                          <Button
                            onClick={() => handleApprove(provider._id)}
                            disabled={loadingStates[provider._id]}
                            sx={{
                              p: '10px 20px',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              borderRadius: '12px',
                              border: 'none',
                              background: '#fb646b',
                              color: '#ffffff',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: '#ffffff',
                                color: '#0e0f0f',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                              },
                              '&:disabled': {
                                opacity: 0.6,
                                cursor: 'not-allowed',
                              },
                            }}
                          >
                            {loadingStates[provider._id] ? (
                              <div className="dot-spinner">
                                <div className="dot-spinner__dot"></div>
                                <div className="dot-spinner__dot"></div>
                                <div className="dot-spinner__dot"></div>
                                <div className="dot-spinner__dot"></div>
                                <div className="dot-spinner__dot"></div>
                                <div className="dot-spinner__dot"></div>
                                <div className="dot-spinner__dot"></div>
                                <div className="dot-spinner__dot"></div>
                              </div>
                            ) : (
                              'Approve'
                            )}
                          </Button>
                          <Button
                            onClick={() => handleReject(provider._id)}
                            sx={{
                              p: '10px 20px',
                              fontSize: '0.9rem',
                              fontWeight: '600',
                              borderRadius: '12px',
                              border: 'none',
                              background: '#ffffff',
                              color: '#0e0f0f',
                              transition: 'all 0.3s ease',
                              '&:hover': {
                                background: '#fb646b',
                                color: '#ffffff',
                                transform: 'translateY(-2px)',
                                boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                              },
                            }}
                          >
                            Reject
                          </Button>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            )}
            {providers.length > providersPerPage && (
              <Box
                sx={{
                  mt: '30px',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: '16px',
                }}
              >
                <Box
                  component="button"
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  sx={{
                    p: '10px 24px',
                    borderRadius: '30px',
                    border: 'none',
                    background: '#fb646b',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                    '&:hover': {
                      ...(currentPage !== 1
                        ? {
                            background: '#ffffff',
                            color: '#0e0f0f',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 15px rgba(0,0,0,0.25)',
                          }
                        : {}),
                    },
                    '&:disabled': {
                      opacity: 0.5,
                      boxShadow: 'none',
                    },
                  }}
                >
                  Previous
                </Box>
                <Box
                  component="span"
                  sx={{
                    fontSize: '1.1rem',
                    fontWeight: '600',
                    color: '#0e0f0f',
                    transition: 'transform 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      color: '#fb646b',
                    },
                  }}
                >
                  Page {currentPage} of {totalPages}
                </Box>
                <Box
                  component="button"
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  sx={{
                    p: '10px 24px',
                    borderRadius: '30px',
                    border: 'none',
                    background: '#fb646b',
                    color: '#ffffff',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 10px rgba(0,0,0,0.2)',
                    '&:hover': {
                      ...(currentPage !== totalPages
                        ? {
                            background: '#ffffff',
                            color: '#0e0f0f',
                            transform: 'translateY(-2px)',
                            boxShadow: '0 6px 15px rgba(0,0,0,0.25)',
                          }
                        : {}),
                    },
                    '&:disabled': {
                      opacity: 0.5,
                      boxShadow: 'none',
                    },
                  }}
                >
                  Next
                </Box>
              </Box>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default Approvals;
import {
  faBell,
  faBook,
  faCalendarCheck,
  faCog,
  faCut,
  faFileInvoiceDollar,
  faHome,
  faMoneyBill,
  faQuestionCircle,
  faSignOutAlt,
  faSpa,
  faStethoscope,
  faUser,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import 'bootstrap/dist/css/bootstrap.min.css';
import { useContext, useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NotificationContext } from '../NotificationContext.js';
import './Navbar.css';

const Navbar = () => {
  const context = useContext(NotificationContext);
  const { notificationCount = 0, fetchNotificationCount = () => {} } =
    context || {};
  const [isNavActive, setIsNavActive] = useState(false);
  const [userRole, setUserRole] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const [isMobileView, setIsMobileView] = useState(window.innerWidth <= 767);
  const navbarRef = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const scriptId = 'google-translate-script';
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script');
      script.id = scriptId;
      script.type = 'text/javascript';
      script.src =
        '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
      document.body.appendChild(script);
    }

    window.googleTranslateElementInit = () => {
      new window.google.translate.TranslateElement(
        { pageLanguage: 'en' },
        'google_translate_element'
      );
    };
  }, []);

  useEffect(() => {
    const role = localStorage.getItem('userRole');
    setUserRole(role || '');

    if (role === 'User' || role === 'ServiceProvider') {
      fetchNotificationCount();
    }
  }, [fetchNotificationCount]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsNavActive(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth <= 767);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const toggleNav = () => {
    setIsNavActive(!isNavActive);
  };

  const handleLinkClick = () => {
    setIsNavActive(false);
  };

  const handleLogout = () => {
    localStorage.clear();
    setUserRole('');
    window.location.href = '/login';
  };

  const toggleLanguageModal = () => {
    setShowLanguageModal(!showLanguageModal);
  };

  const isActiveLink = (path) => (location.pathname === path ? 'active' : '');

  const renderNavLinks = () => {
    if (!userRole) {
      return (
        <>
          <li style={{ '--i': 1 }}>
            <Link
              to='/'
              className={isActiveLink('/')}
              onClick={handleLinkClick}
            >
              <FontAwesomeIcon icon={faHome} className='nav-icon' />
              <span className='nav-text'>Home</span>
            </Link>
          </li>
          <li style={{ '--i': 2 }}>
            <Link
              to='/salon'
              className={isActiveLink('/salon')}
              onClick={handleLinkClick}
            >
              <FontAwesomeIcon icon={faCut} className='nav-icon' />
              <span className='nav-text'>Salon</span>
            </Link>
          </li>
          <li style={{ '--i': 3 }}>
            <Link
              to='/beauty'
              className={isActiveLink('/beauty')}
              onClick={handleLinkClick}
            >
              <FontAwesomeIcon icon={faSpa} className='nav-icon' />
              <span className='nav-text'>Beauty</span>
            </Link>
          </li>
          <li style={{ '--i': 4 }}>
            <Link
              to='/skincare'
              className={isActiveLink('/skincare')}
              onClick={handleLinkClick}
            >
              <FontAwesomeIcon icon={faStethoscope} className='nav-icon' />
              <span className='nav-text'>Doctor</span>
            </Link>
          </li>
          <li style={{ "--i": 5 }}>
            <Link to="/login" className={isActiveLink("/login")} onClick={handleLinkClick}>
              <FontAwesomeIcon icon={faUser} className="nav-icon" />
              <span className="nav-text">Login</span>
            </Link>
          </li>
        </>
      );
    }

    switch (userRole) {
      case 'Admin':
        return (
          <>
            <li style={{ '--i': 1 }}>
              <Link
                to='/users'
                className={isActiveLink('/users')}
                onClick={handleLinkClick}
              >
                <FontAwesomeIcon icon={faUsers} className='nav-icon' />
                <span className='nav-text'>Users</span>
              </Link>
            </li>

            <li style={{ '--i': 3 }}>
              <Link
                to='/bookingDetails'
                className={isActiveLink('/bookingDetails')}
                onClick={handleLinkClick}
              >
                <FontAwesomeIcon icon={faCalendarCheck} className='nav-icon' />
                <span className='nav-text'>Bookings</span>
              </Link>
            </li>
            <li style={{ '--i': 4 }}>
              <Link
                to='/revenue'
                className={isActiveLink('/revenue')}
                onClick={handleLinkClick}
              >
                <FontAwesomeIcon
                  icon={faFileInvoiceDollar}
                  className='nav-icon'
                />
                <span className='nav-text'>Revenue</span>
              </Link>
            </li>
            <li style={{ '--i': 2 }}>
              <Link
                to='/serviceProviders'
                className={isActiveLink('/serviceProviders')}
                onClick={handleLinkClick}
              >
                <FontAwesomeIcon icon={faUsers} className='nav-icon' />
                <span className='nav-text'>Providers</span>
              </Link>
            </li>
            <li style={{ '--i': 5 }}>
              <Link
                to='/approvals'
                className={isActiveLink('/approvals')}
                onClick={handleLinkClick}
              >
                <FontAwesomeIcon icon={faCog} className='nav-icon' />
                <span className='nav-text'>Approvals</span>
              </Link>
            </li>
            <li style={{ '--i': 6 }}>
              <Link
                to='/complaints'
                className={isActiveLink('/complaints')}
                onClick={handleLinkClick}
              >
                <FontAwesomeIcon icon={faQuestionCircle} className='nav-icon' />
                <span className='nav-text'>Complaints</span>
              </Link>
            </li>
            <li style={{ '--i': 7 }}>
              <Link
                to='/adminFaqs'
                className={isActiveLink('/adminFaqs')}
                onClick={handleLinkClick}
              >
                <FontAwesomeIcon icon={faBook} className='nav-icon' />
                <span className='nav-text'>Faqs</span>
              </Link>
            </li>
            <li style={{ '--i': 8 }} className='logout-item'>
              <Link
                to='/login'
                onClick={() => {
                  handleLogout();
                  handleLinkClick();
                }}
              >
                <FontAwesomeIcon icon={faSignOutAlt} className='nav-icon' />
                <span className='nav-text'>Logout</span>
              </Link>
            </li>
          </>
        );

      case 'ServiceProvider':
        return (
          <>
            <li style={{ '--i': 1 }}>
              <Link
                to='/spHome'
                className={isActiveLink('/spHome')}
                onClick={handleLinkClick}
              >
                <FontAwesomeIcon icon={faHome} className='nav-icon' />
                <span className='nav-text'>Home</span>
              </Link>
            </li>
            <li style={{ '--i': 2 }}>
              <Link
                to='/services'
                className={isActiveLink('/services')}
                onClick={handleLinkClick}
              >
                <FontAwesomeIcon icon={faCog} className='nav-icon' />
                <span className='nav-text'>Add Service</span>
              </Link>
            </li>
            <li style={{ '--i': 3 }}>
              <Link
                to='/addEmployee'
                className={isActiveLink('/addEmployee')}
                onClick={handleLinkClick}
              >
                <FontAwesomeIcon icon={faUsers} className='nav-icon' />
                <span className='nav-text'>Emp Management</span>
              </Link>
            </li>
            <li style={{ '--i': 4 }}>
              <Link
                to='/spBookingDetails'
                className={isActiveLink('/spBookingDetails')}
                onClick={handleLinkClick}
              >
                <FontAwesomeIcon icon={faCalendarCheck} className='nav-icon' />
                <span className='nav-text'>Bookings</span>
              </Link>
            </li>
            <li style={{ '--i': 5 }}>
              <Link
                to='/spPaymentDetails'
                className={isActiveLink('/spPaymentDetails')}
                onClick={handleLinkClick}
              >
                <FontAwesomeIcon icon={faMoneyBill} className='nav-icon' />
                <span className='nav-text'>Payments</span>
              </Link>
            </li>
            <li style={{ '--i': 6 }}>
              <Link
                to='/enquiries'
                className={isActiveLink('/enquiries')}
                onClick={handleLinkClick}
              >
                <FontAwesomeIcon icon={faQuestionCircle} className='nav-icon' />
                <span className='nav-text'>Enquiries</span>
              </Link>
            </li>
            <li style={{ '--i': 7 }}>
              <Link
                to='/spNotifications'
                className={isActiveLink('/spNotifications')}
                onClick={handleLinkClick}
              >
                <span className='notification-wrapper'>
                  <FontAwesomeIcon icon={faBell} className='nav-icon' />
                  {notificationCount > 0 && (
                    <span className='notification-badge'>
                      {notificationCount}
                    </span>
                  )}
                </span>
                <span className='nav-text'>Notifications</span>
              </Link>
            </li>
            <li style={{ '--i': 8 }}>
              <Link
                to='/spProfile'
                className={isActiveLink('/spProfile')}
                onClick={handleLinkClick}
              >
                <FontAwesomeIcon icon={faUser} className='nav-icon' />
                <span className='nav-text'>Profile</span>
              </Link>
            </li>
            <li style={{ '--i': 9 }} className='logout-item'>
              <Link
                to='/login'
                onClick={() => {
                  handleLogout();
                  handleLinkClick();
                }}
              >
                <FontAwesomeIcon icon={faSignOutAlt} className='nav-icon' />
                <span className='nav-text'>Logout</span>
              </Link>
            </li>
          </>
        );

      case 'User':
        // Mobile (320px to 767px) and Tablet (768px to 1024px): Hide Salon, Beauty, Doctor, Notifications
        if (window.innerWidth < 1024) {
          return (
            <>
              <li style={{ '--i': 1 }}>
                <Link
                  to='/'
                  className={isActiveLink('/')}
                  onClick={handleLinkClick}
                >
                  <FontAwesomeIcon icon={faHome} className='nav-icon' />
                  <span className='nav-text'>Home</span>
                </Link>
              </li>
              <li style={{ '--i': 2 }}>
                <Link
                  to='/bookings'
                  className={isActiveLink('/bookings')}
                  onClick={handleLinkClick}
                >
                  <FontAwesomeIcon
                    icon={faCalendarCheck}
                    className='nav-icon'
                  />
                  <span className='nav-text'>Bookings</span>
                </Link>
              </li>
              <li style={{ '--i': 3 }}>
                <Link
                  to='/userEnquiries'
                  className={isActiveLink('/userEnquiries')}
                  onClick={handleLinkClick}
                >
                  <FontAwesomeIcon
                    icon={faQuestionCircle}
                    className='nav-icon'
                  />
                  <span className='nav-text'>Enquiries</span>
                </Link>
              </li>
              <li style={{ '--i': 4 }}>
                <Link
                  to='/userProfile'
                  className={isActiveLink('/userProfile')}
                  onClick={handleLinkClick}
                >
                  <FontAwesomeIcon icon={faUser} className='nav-icon' />
                  <span className='nav-text'>Profile</span>
                </Link>
              </li>
              <li style={{ '--i': 5 }} className='logout-item'>
                <Link
                  to='/login'
                  onClick={() => {
                    handleLogout();
                    handleLinkClick();
                  }}
                >
                  <FontAwesomeIcon icon={faSignOutAlt} className='nav-icon' />
                  <span className='nav-text'>Logout</span>
                </Link>
              </li>
            </>
          );
        }
        // Desktop (>1024px): Show all items
        return (
          <>
            <li style={{ '--i': 1 }}>
              <Link
                to='/'
                className={isActiveLink('/')}
                onClick={handleLinkClick}
              >
                <FontAwesomeIcon icon={faHome} className='nav-icon' />
                <span className='nav-text'>Home</span>
              </Link>
            </li>
            <li style={{ '--i': 2 }}>
              <Link
                to='/salon'
                className={isActiveLink('/salon')}
                onClick={handleLinkClick}
              >
                <FontAwesomeIcon icon={faCut} className='nav-icon' />
                <span className='nav-text'>Salon</span>
              </Link>
            </li>
            <li style={{ '--i': 3 }}>
              <Link
                to='/beauty'
                className={isActiveLink('/beauty')}
                onClick={handleLinkClick}
              >
                <FontAwesomeIcon icon={faSpa} className='nav-icon' />
                <span className='nav-text'>Beauty</span>
              </Link>
            </li>
            <li style={{ '--i': 4 }}>
              <Link
                to='/skincare'
                className={isActiveLink('/skincare')}
                onClick={handleLinkClick}
              >
                <FontAwesomeIcon icon={faStethoscope} className='nav-icon' />
                <span className='nav-text'>Doctor</span>
              </Link>
            </li>
            <li style={{ '--i': 5 }}>
              <Link
                to='/bookings'
                className={isActiveLink('/bookings')}
                onClick={handleLinkClick}
              >
                <FontAwesomeIcon icon={faCalendarCheck} className='nav-icon' />
                <span className='nav-text'>Bookings</span>
              </Link>
            </li>
            <li style={{ '--i': 6 }}>
              <Link
                to='/userEnquiries'
                className={isActiveLink('/userEnquiries')}
                onClick={handleLinkClick}
              >
                <FontAwesomeIcon icon={faQuestionCircle} className='nav-icon' />
                <span className='nav-text'>Enquiries</span>
              </Link>
            </li>
            <li style={{ '--i': 7 }}>
              <Link
                to='/userNotifications'
                className={isActiveLink('/userNotifications')}
                onClick={handleLinkClick}
              >
                <span className='notification-wrapper'>
                  <FontAwesomeIcon icon={faBell} className='nav-icon' />
                  {notificationCount > 0 && (
                    <span className='notification-badge'>
                      {notificationCount}
                    </span>
                  )}
                </span>
                <span className='nav-text'>Notifications</span>
              </Link>
            </li>
            <li style={{ '--i': 8 }}>
              <Link
                to='/userProfile'
                className={isActiveLink('/userProfile')}
                onClick={handleLinkClick}
              >
                <FontAwesomeIcon icon={faUser} className='nav-icon' />
                <span className='nav-text'>Profile</span>
              </Link>
            </li>
            <li style={{ '--i': 9 }} className='logout-item'>
              <Link
                to='/login'
                onClick={() => {
                  handleLogout();
                  handleLinkClick();
                }}
              >
                <FontAwesomeIcon icon={faSignOutAlt} className='nav-icon' />
                <span className='nav-text'>Logout</span>
              </Link>
            </li>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <nav
        className={`navbar desktop-navbar ${isScrolled ? 'scrolled' : ''}`}
        style={{
          position: 'fixed',
          top: 0,
          width: '100%',
          zIndex: 10,
        }}
        ref={navbarRef}
      >
        <div className='navbar-container'>
          <div className='navbar-logo'>
            <Link to='/' style={{ textDecoration: 'none' }}>
              <h1
                style={{
                  background:
                    'linear-gradient(to right, rgb(171 19 130), rgb(91 24 68))',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  fontFamily: 'times new roman',
                  fontStyle: 'cursive',
                  fontWeight: '550',
                  fontSize: '1.5rem',
                }}
              >
                BeautyBliss
              </h1>
            </Link>
          </div>
          <button className='navbar-toggle' onClick={toggleNav}>
            ☰
          </button>
          <ul className={`navbar-links ${isNavActive ? 'active' : ''}`}>
            {renderNavLinks()}
          </ul>
        </div>
      </nav>

      <nav className='tablet-sidebar'>
        <ul className='sidebar-links'>{renderNavLinks()}</ul>
      </nav>

      <nav className='mobile-bottom-nav'>
        <ul className='bottom-nav-links'>{renderNavLinks()}</ul>
      </nav>
    </>
  );
};

export default Navbar;

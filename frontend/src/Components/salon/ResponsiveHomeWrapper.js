import React, { useState, useEffect } from "react";
import Home from "./Home";
import Home1 from "./Home1";

const ResponsiveHomeWrapper = () => {
  const [isMobileScreen, setIsMobileScreen] = useState(
    window.innerWidth >= 320 && window.innerWidth <= 1020
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobileScreen(window.innerWidth >= 320 && window.innerWidth <= 1024);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return isMobileScreen ? <Home1 /> : <Home />;
};

export default ResponsiveHomeWrapper;
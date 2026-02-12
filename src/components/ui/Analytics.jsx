import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import ReactGA from 'react-ga4';

// Measurement ID from user's screenshot
const TRACKING_ID = "G-G8DQGTB479";

const Analytics = () => {
  const location = useLocation();

  useEffect(() => {
    // Initialize GA4
    ReactGA.initialize(TRACKING_ID);
    console.log('Google Analytics 4 Initialized');
  }, []);

  useEffect(() => {
    // Track page view on route change
    const path = location.pathname + location.hash;
    ReactGA.send({ hitType: "pageview", page: path });
    // console.log('GA4 PageView tracked:', path);
  }, [location]);

  return null;
};

export default Analytics;

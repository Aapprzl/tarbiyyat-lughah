import React from 'react';

/**
 * ErrorTest Component
 * TEMPORARY TEST COMPONENT - DELETE AFTER TESTING
 * 
 * This component intentionally throws an error to test the ErrorBoundary.
 * 
 * Usage:
 * 1. Import this component in App.jsx
 * 2. Add a route: { path: '/error-test', element: <ErrorTest /> }
 * 3. Navigate to /#/error-test
 * 4. Verify ErrorBoundary catches the error and shows fallback UI
 * 5. DELETE this file after testing
 */
const ErrorTest = () => {
  // This will throw an error during render
  throw new Error('🧪 Test error: ErrorBoundary is working correctly!');
  
  // This code will never execute
  return (
    <div>
      <h1>This should never render</h1>
    </div>
  );
};

export default ErrorTest;

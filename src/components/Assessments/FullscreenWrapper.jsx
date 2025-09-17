// src/components/Assessments/FullscreenWrapper.jsx
import React, { useEffect, useState } from 'react';

const FullscreenWrapper = ({ children, onExit, testName }) => {
  const [isFullscreen, setIsFullscreen] = useState(document.fullscreenElement != null);

  const enterFullscreen = () => {
    const element = document.documentElement;
    if (element.requestFullscreen) {
      element.requestFullscreen().catch(err => {
        alert(`Could not enter fullscreen mode: ${err.message}. Please enable fullscreen permissions for this site.`);
      });
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isCurrentlyFullscreen = document.fullscreenElement != null;
      if (!isCurrentlyFullscreen && isFullscreen) {
        // This means the user was in fullscreen and has now exited.
        if (typeof onExit === 'function') {
          onExit(); 
        }
      }
      setIsFullscreen(isCurrentlyFullscreen);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, [isFullscreen, onExit]);

  // If we are not in fullscreen, show a prompt to enter it.
  if (!isFullscreen) {
    return (
      <div className="test-intro">
        <div className="test-intro-card">
          <h2 className="text-2xl font-bold">Fullscreen Required</h2>
          <p className="my-4 text-gray-600">
            This assessment must be taken in fullscreen mode to ensure a fair testing environment.
          </p>
          <button className="btn btn-primary" onClick={enterFullscreen}>
            <i className="fas fa-expand"></i>
            Enter Fullscreen & Start {testName}
          </button>
        </div>
      </div>
    );
  }

  // If in fullscreen, render the actual test component.
  return <>{children}</>;
};

export default FullscreenWrapper;
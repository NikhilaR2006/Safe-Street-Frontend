import React, { useState, useEffect, useRef } from 'react';
import './NotificationBell.css';

const NotificationBell = ({ userEmail, onNavigateToHistory }) => {
  const [resolvedReports, setResolvedReports] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const notificationRef = useRef(null);

  // Fetch resolved reports when component mounts or userEmail changes
  useEffect(() => {
    if (userEmail) {
      fetchResolvedReports();
      // Set up polling to check for new resolved reports every minute
      const intervalId = setInterval(fetchResolvedReports, 60000);
      return () => clearInterval(intervalId);
    }
  }, [userEmail]);

  // Handle clicks outside notification panel to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchResolvedReports = async () => {
    try {
      // Get the last time notifications were checked from localStorage
      const lastChecked = localStorage.getItem('lastNotificationCheck') || '2000-01-01T00:00:00.000Z';
      
      // Fetch user's uploads
      const response = await fetch(`http://localhost:5000/api/uploads?email=${userEmail}`);
      const data = await response.json();
      
      if (data.success) {
        // Find reports that have been resolved since the last check
        const lastCheckedDate = new Date(lastChecked);
        const resolved = data.uploads.filter(upload => {
          return upload.progress === 'Resolved';
        });
        
        // Update resolved reports
        setResolvedReports(resolved);
        
        // Count unread notifications
        setUnreadCount(resolved.length);
        
        // Update last checked time
        localStorage.setItem('lastNotificationCheck', new Date().toISOString());
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const clearAllNotifications = () => {
    // Mark all as seen by updating the last check time
    localStorage.setItem('lastNotificationCheck', new Date().toISOString());
    setUnreadCount(0);
    setShowNotifications(false);
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <div className="notification-bell-container" ref={notificationRef}>
      <div className="notification-bell" onClick={toggleNotifications}>
        <span role="img" aria-label="notification bell" style={{ fontSize: '1.5rem' }}>🔔</span>
        {unreadCount > 0 && (
          <span className="notification-badge">{unreadCount}</span>
        )}
      </div>
      
      <div className="info-button-container">
        <div className="info-button">
          <span role="img" aria-label="information">i</span>
          <div className="status-tooltips">
            <div className="tooltip-item">
              <span className="status-label seen">Seen</span>
              <span className="tooltip-desc">Authority viewed your report</span>
            </div>
            <div className="tooltip-item">
              <span className="status-label unseen">Unseen</span>
              <span className="tooltip-desc">Report not yet viewed</span>
            </div>
            <div className="tooltip-item">
              <span className="progress-label resolved">Resolved</span>
              <span className="tooltip-desc">Issue fixed by authorities</span>
            </div>
            <div className="tooltip-item">
              <span className="progress-label unresolved">Unresolved</span>
              <span className="tooltip-desc">Issue pending resolution</span>
            </div>
          </div>
        </div>
      </div>
      
      {showNotifications && (
        <div className="notification-panel">
          <div className="notification-header">
            <h3>Notifications</h3>
            {resolvedReports.length > 0 && (
              <button 
                className="mark-all-read"
                onClick={clearAllNotifications}
              >
                Clear all
              </button>
            )}
          </div>
          
          <div className="notification-list">
            {resolvedReports.length === 0 ? (
              <div className="no-notifications">No new notifications</div>
            ) : (
              <>
                <div className="notification-summary">
                  <span role="img" aria-label="resolved" style={{ fontSize: '1.25rem', marginRight: '8px' }}>✅</span>
                  <span>
                    {resolvedReports.length === 1 
                      ? 'Your report has been resolved!' 
                      : `${resolvedReports.length} of your reports have been resolved!`
                    }
                  </span>
                </div>
                
                {resolvedReports.map((report, index) => (
                  <div 
                    key={index} 
                    className="notification-item"
                    onClick={() => {
                      // Navigate to history tab and show this report's details
                      if (onNavigateToHistory) {
                        onNavigateToHistory(report);
                        setShowNotifications(false);
                      }
                    }}
                  >
                    <div className="notification-icon">
                      <span role="img" aria-label="location" style={{ fontSize: '1.25rem' }}>📍</span>
                    </div>
                    <div className="notification-content">
                      <p>Your report for <strong>{report.roadLocation?.address || 'Unknown location'}</strong> has been resolved. Thank you for your contribution!</p>
                      <span className="notification-time">
                        {new Date(report.uploadedAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;

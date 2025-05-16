import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ReportsTable from '../components/ReportsTable';
import ReportDetailCard from '../components/ReportDetailCard';
import StatusCircles from '../components/StatusCircles';
import AreaWiseUploads from './AreaWiseReports';
import ProfileSettings from '../components/ProfileSettings';
import WeeklyUploadsChart from '../components/WeeklyUploadsChart';
import StatusPieChart from '../components/StatusPieChart';
import './Authority.css';

const Authority = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState(null);
  const [reports, setReports] = useState([]);
  const [filteredReports, setFilteredReports] = useState([]);
  const [dateFilter, setDateFilter] = useState('all');
  const [seenFilter, setSeenFilter] = useState('all'); // 'all', 'seen', 'unseen'
  const [resolvedFilter, setResolvedFilter] = useState(''); // '' or 'resolved'
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showNotification, setShowNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [stats, setStats] = useState({
    seen: 0,
    unseen: 0,

    resolved: 0
  });

  // Separate function for initial loading without animations or notifications
  const initialLoadReports = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/images');
      const data = await response.json();
      if (data.success) {
        console.log('API Response Images:', data.images);
        
        // Process the data (same as in fetchReports)
        const processedReports = data.images.map(img => {
          let status = img.status || 'Unseen';
          let progress = img.progress || 'Unresolved';
          const uploadedAt = new Date(img.uploadedAt);
          return {
            id: img._id,
            imageName: img.imageName,
            imageUrl: img.imageUrl,
            predictedImageUrl: img.predictedImageUrl,
            userEmail: img.userEmail,
            uploadedAt: uploadedAt,
            roadLocation: img.roadLocation,
            damageDescription: img.damageDescription || '',
            status: status,
            progress: progress,
            seen: status === 'Seen',
            resolved: progress === 'Resolved',
            frequency: 1
          };
        });
        
        // Calculate frequency based on reports at the same address
        const addressFrequencyMap = {};
        
        // First pass: count reports for each address
        processedReports.forEach(report => {
          const address = typeof report.roadLocation === 'object' ? 
            (report.roadLocation.address || 'Unknown Location') : 
            (report.roadLocation || 'Unknown Location');
          
          if (!addressFrequencyMap[address]) {
            addressFrequencyMap[address] = 1;
          } else {
            addressFrequencyMap[address]++;
          }
        });
        
        // Second pass: update each report with its address frequency
        const reportsWithFrequency = processedReports.map(report => {
          const address = typeof report.roadLocation === 'object' ? 
            (report.roadLocation.address || 'Unknown Location') : 
            (report.roadLocation || 'Unknown Location');
          
          return {
            ...report,
            frequency: addressFrequencyMap[address] || 1
          };
        });
        
        // Sort reports by upload date (most recent first)
        const sortedReports = reportsWithFrequency.sort((a, b) => {
          return new Date(b.uploadedAt) - new Date(a.uploadedAt);
        });
        
        setReports(sortedReports);
        setFilteredReports(sortedReports);
        
        // Calculate stats (same as in fetchReports)
        const resolvedCount = processedReports.filter(report => report.progress === 'Resolved').length;
        const seenNotResolvedCount = processedReports.filter(report => 
          report.status === 'Seen' && report.progress !== 'Resolved'
        ).length;
        const unseenNotResolvedCount = processedReports.filter(report => 
          report.status !== 'Seen' && report.progress !== 'Resolved'
        ).length;
        const totalSeenCount = processedReports.filter(report => report.status === 'Seen').length;
        const reviewedCount = processedReports.filter(report => report.status === 'Reviewed').length;
        const pendingCount = processedReports.filter(report => report.progress !== 'Resolved').length;
        const total = processedReports.length || 1;

        setStats({
          seen: Math.round((seenNotResolvedCount / total) * 100),
          unseen: Math.round((unseenNotResolvedCount / total) * 100),
          reviewed: Math.round((reviewedCount / total) * 100),
          pending: Math.round((pendingCount / total) * 100),
          resolved: Math.round((resolvedCount / total) * 100),
          unresolved: Math.round((pendingCount / total) * 100),
          seenCount: seenNotResolvedCount,
          unseenCount: unseenNotResolvedCount,
          reviewedCount: reviewedCount,
          pendingCount: pendingCount,
          resolvedCount: resolvedCount,
          unresolvedCount: pendingCount,
          totalSeenCount: totalSeenCount
        });
      }
    } catch (error) {
      console.error('Error during initial loading of reports:', error);
    }
  };

  useEffect(() => {
    const userType = localStorage.getItem('userType');
    console.log('[Authority useEffect] Running check. Path:', location.pathname, 'Stored userType:', userType);

    if (userType !== 'authority') {
      console.log('[Authority useEffect] Auth check FAILED. Redirecting to /login...');
      navigate('/login');
      return;
    }
    console.log('[Authority useEffect] Auth check PASSED.');

    // Initial data load when first visiting the page (without animation or notification)
    initialLoadReports();
  }, [navigate, location.pathname]);
  
  // Apply filters whenever reports, seenFilter, or resolvedFilter changes
  useEffect(() => {
    if (!reports || reports.length === 0) {
      setFilteredReports([]);
      return;
    }
    
    console.log('Starting filtering process with filters:', { dateFilter, seenFilter, resolvedFilter });
    console.log('Total reports before filtering:', reports.length);
    
    // Create a fresh copy of reports to work with
    let filtered = [...reports];
    
    // STEP 1: Apply date filter if active
    if (dateFilter !== 'all') {
      const today = new Date();
      const todayString = today.toDateString();
      
      filtered = filtered.filter(report => {
        const reportDate = new Date(report.uploadedAt);
        
        switch(dateFilter) {
          case 'today':
            return reportDate.toDateString() === todayString;
          case 'week':
            const weekAgo = new Date(today);
            weekAgo.setDate(today.getDate() - 7);
            return reportDate >= weekAgo;
          case 'month':
            const monthAgo = new Date(today);
            monthAgo.setMonth(today.getMonth() - 1);
            return reportDate >= monthAgo;
          default:
            return true;
        }
      });
      
      console.log('After date filter:', filtered.length, 'reports remaining');
    }
    
    // STEP 2: Apply the appropriate status filter (simplified approach)
    if (resolvedFilter === 'resolved') {
      filtered = filtered.filter(report => report.progress === 'Resolved');
      console.log(`Authority: Showing ${filtered.length} resolved reports`);
    } 
    else if (seenFilter === 'seen') {
      filtered = filtered.filter(report => 
        report.status === 'Seen' && report.progress !== 'Resolved'
      );
      console.log(`Authority: Showing ${filtered.length} seen (not resolved) reports`);
    } 
    else if (seenFilter === 'unseen') {
      filtered = filtered.filter(report => 
        report.status !== 'Seen' && report.progress !== 'Resolved'
      );
      console.log(`Authority: Showing ${filtered.length} unseen (not resolved) reports`);
    }
    
    console.log('Final filtered reports:', filtered.length);
    setFilteredReports(filtered);
  }, [reports, dateFilter, seenFilter, resolvedFilter]);

  const fetchReports = async () => {
    setIsRefreshing(true);
    let hasError = false;
    
    try {
      const response = await fetch('http://localhost:5000/api/images');
      const data = await response.json();
      if (data.success) {
        console.log('API Response Images:', data.images);
        
        // Store original upload dates for filtering
        const processedReports = data.images.map(img => {
          // Use backend fields for status and progress
          let status = img.status || 'Unseen'; // Unseen/Seen
          let progress = img.progress || 'Unresolved'; // Unresolved/Resolved
          const uploadedAt = new Date(img.uploadedAt);
          return {
            id: img._id,
            imageName: img.imageName,
            imageUrl: img.imageUrl,
            predictedImageUrl: img.predictedImageUrl,
            userEmail: img.userEmail,
            uploadedAt: uploadedAt,
            roadLocation: img.roadLocation,
            damageDescription: img.damageDescription || '',
            status: status,
            progress: progress,
            seen: status === 'Seen', // For backwards compatibility
            resolved: progress === 'Resolved', // For backwards compatibility
            frequency: 1 // Default frequency, will be updated below
          };
        });
        
        // Calculate frequency based on reports at the same address
        const addressFrequencyMap = {};
        
        // First pass: count reports for each address
        processedReports.forEach(report => {
          const address = typeof report.roadLocation === 'object' ? 
            (report.roadLocation.address || 'Unknown Location') : 
            (report.roadLocation || 'Unknown Location');
          
          if (!addressFrequencyMap[address]) {
            addressFrequencyMap[address] = 1;
          } else {
            addressFrequencyMap[address]++;
          }
        });
        
        // Second pass: update each report with its address frequency
        const reportsWithFrequency = processedReports.map(report => {
          const address = typeof report.roadLocation === 'object' ? 
            (report.roadLocation.address || 'Unknown Location') : 
            (report.roadLocation || 'Unknown Location');
          
          return {
            ...report,
            frequency: addressFrequencyMap[address] || 1
          };
        });
        
        // Sort reports by upload date (most recent first)
        const sortedReports = reportsWithFrequency.sort((a, b) => {
          return new Date(b.uploadedAt) - new Date(a.uploadedAt);
        });
        
        setReports(sortedReports);
        setFilteredReports(sortedReports);
        
        // Calculate mutually exclusive stats to avoid double counting
        const resolvedCount = processedReports.filter(report => report.progress === 'Resolved').length;
        
        // Count seen reports that are NOT resolved
        const seenNotResolvedCount = processedReports.filter(report => 
          report.status === 'Seen' && report.progress !== 'Resolved'
        ).length;
        
        // Count unseen reports that are NOT resolved
        const unseenNotResolvedCount = processedReports.filter(report => 
          report.status !== 'Seen' && report.progress !== 'Resolved'
        ).length;
        
        // For display purposes, also track total seen regardless of resolution
        const totalSeenCount = processedReports.filter(report => report.status === 'Seen').length;
        
        // Calculate other stats
        const reviewedCount = processedReports.filter(report => report.status === 'Reviewed').length;
        const pendingCount = processedReports.filter(report => report.progress !== 'Resolved').length;
        
        // The actual total should be the sum of our mutually exclusive categories
        const total = processedReports.length || 1; // Avoid division by zero

        setStats({
          // Percentages
          seen: Math.round((seenNotResolvedCount / total) * 100),
          unseen: Math.round((unseenNotResolvedCount / total) * 100),
          reviewed: Math.round((reviewedCount / total) * 100),
          pending: Math.round((pendingCount / total) * 100),
          resolved: Math.round((resolvedCount / total) * 100),
          unresolved: Math.round((pendingCount / total) * 100),
          
          // Counts - using our mutually exclusive counts
          seenCount: seenNotResolvedCount,
          unseenCount: unseenNotResolvedCount,
          reviewedCount: reviewedCount,
          pendingCount: pendingCount,
          resolvedCount: resolvedCount,
          unresolvedCount: pendingCount,
          
          // For debugging - total seen count including resolved
          totalSeenCount: totalSeenCount
        });
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      hasError = true;
      setNotificationMessage('Error refreshing reports. Please try again.');
    } finally {
      // Set refreshing state to false after completion
      setIsRefreshing(false);
      
      // Show success notification if no error occurred
      if (!hasError) {
        setNotificationMessage('Reports refreshed successfully!');
      }
      
      // Show notification
      setShowNotification(true);
      
      // Hide notification after 1.5 seconds for a faster experience
      setTimeout(() => {
        setShowNotification(false);
      }, 1500);
    }
  };

  // Handle date filter changes
  const handleFilterChange = (filter) => {
    setDateFilter(filter);
  };
  
  // Filter reports based on date and seen/resolved status
  useEffect(() => {
    if (!reports.length) return;
    
    console.log('Filtering reports with date filter:', dateFilter, 'and seen filter:', seenFilter);
    
    const now = new Date();
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    
    // First apply date filter
    let filtered;
    switch (dateFilter) {
      case 'today':
        filtered = reports.filter(report => report.uploadedAt >= todayStart);
        break;
      case 'week':
        filtered = reports.filter(report => report.uploadedAt >= weekStart);
        break;
      case 'month':
        filtered = reports.filter(report => report.uploadedAt >= monthStart);
        break;
      default:
        filtered = [...reports]; // Use spread to create a new array reference
    }
    
    // Then apply seen/unseen filter
    if (seenFilter !== 'all') {
      filtered = filtered.filter(report => 
        seenFilter === 'seen' ? report.status === 'Seen' : report.status !== 'Seen'
      );
    }

    // Apply resolved filter if set
    if (resolvedFilter === 'resolved') {
      filtered = filtered.filter(report => report.progress === 'Resolved');
    }
    
    console.log('Filtered reports after filtering:', filtered.length);
    setFilteredReports(filtered);
  }, [reports, dateFilter, seenFilter, resolvedFilter]);

  const handleView = (id) => {
    // Only set the selected report without marking it as seen
    const report = reports.find(r => r.id === id);
    setSelectedReport(report);
  };

  const handleClose = () => {
    setSelectedReport(null);
  };

  const markAsSeen = async (id) => {
    // Mark report as seen (status: 'Seen') in backend and update frontend state
    try {
      const response = await fetch(`http://localhost:5000/api/images/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'Seen' })
      });
      if (!response.ok) {
        console.error('Failed to update status to Seen in backend:', response.statusText);
      } else {
        const updatedReports = reports.map(report =>
          report.id === id ? { ...report, status: 'Seen', seen: true } : report
        );
        setReports(updatedReports);
        setFilteredReports(updatedReports);
        const seenCount = updatedReports.filter(report => report.status === 'Seen').length;
        const unseenCount = updatedReports.length - seenCount;
        const total = updatedReports.length || 1; // Avoid division by zero
        setStats(prevStats => ({
          ...prevStats,
          seen: Math.round((seenCount / total) * 100),
          unseen: Math.round((unseenCount / total) * 100),
          seenCount: seenCount,
          unseenCount: unseenCount
        }));
      }
    } catch (error) {
      console.error('Error updating status to Seen:', error);
    }
    setSelectedReport(prev => prev && prev.id === id ? { ...prev, status: 'Seen', seen: true } : prev);
  };

  const markAsResolved = async (id) => {
    // Mark report as resolved (progress: 'Resolved') in backend and update frontend state
    try {
      const response = await fetch(`http://localhost:5000/api/images/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: 'Resolved' })
      });
      if (!response.ok) {
        console.error('Failed to update progress to Resolved in backend:', response.statusText);
      } else {
        const updatedReports = reports.map(report =>
          report.id === id ? { ...report, progress: 'Resolved', resolved: true } : report
        );
        setReports(updatedReports);
        setFilteredReports(updatedReports);
        
        // Calculate new percentages
        const resolvedCount = updatedReports.filter(report => report.progress === 'Resolved').length;
        const pendingCount = updatedReports.filter(report => report.progress !== 'Resolved').length;
        const total = updatedReports.length || 1; // Avoid division by zero
        
        setStats(prevStats => ({
          ...prevStats,
          resolved: Math.round((resolvedCount / total) * 100),
          pending: Math.round((pendingCount / total) * 100),
          unresolved: Math.round((pendingCount / total) * 100),
          resolvedCount: resolvedCount,
          pendingCount: pendingCount,
          unresolvedCount: pendingCount
        }));
        handleClose();
      }
    } catch (error) {
      console.error('Error updating progress to Resolved:', error);
    }
  };

  const handleSeenFilterChange = (filter) => {
    setSeenFilter(filter);
    setResolvedFilter(''); // Reset resolved filter when changing seen filter
    // Filtering is now handled by the useEffect hook
  };

  const handleResolvedFilterChange = (filter) => {
    setResolvedFilter(filter);
    setSeenFilter('all'); // Reset seen filter when using resolved filter
    // Filtering is now handled by the useEffect hook
  };

  const renderContent = () => {
    console.log('[Authority renderContent] Rendering for path:', location.pathname);
    switch (location.pathname) {
      case '/authority':
        return (
          <>
            <div className="dashboard">
              <h2>Welcome to Authority Dashboard</h2>
              <div className="stats-overview">
                <StatusCircles stats={{
                  // Percentages
                  seen: stats.seen,
                  unseen: stats.unseen,
                  resolved: stats.resolved,
                  unresolved: stats.unresolved,
                  // Counts
                  seenCount: stats.seenCount,
                  unseenCount: stats.unseenCount,
                  resolvedCount: stats.resolvedCount,
                  unresolvedCount: stats.unresolvedCount
                }} />
              </div>
            </div>
            <div className="reports-section">
              <div className="reports-header">
                <div className="header-left">
                  <h2>Recent Reports</h2>
                  <button 
                    className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
                    onClick={fetchReports} 
                    title="Refresh Reports"
                    disabled={isRefreshing}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4.01 7.58 4.01 12C4.01 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="currentColor"/>
                    </svg>
                    {isRefreshing ? 'Refreshing...' : 'Refresh'}
                  </button>
                </div>
              </div>
              {/* Display ReportsTable without filter buttons on home page */}
              <ReportsTable 
                reports={filteredReports.slice(0, 5)} 
                onView={handleView} 
                // Filter props removed to hide filter buttons
              />
            </div>
          </>
        );
      case '/authority/ReportsPage':
        return (
          <div className="reports-section">
            <div className="reports-header">
            <div className="header-left">
              <h2>All Reports</h2>
              <button 
                className={`refresh-button ${isRefreshing ? 'refreshing' : ''}`}
                onClick={fetchReports} 
                title="Refresh Reports"
                disabled={isRefreshing}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4C7.58 4 4.01 7.58 4.01 12C4.01 16.42 7.58 20 12 20C15.73 20 18.84 17.45 19.73 14H17.65C16.83 16.33 14.61 18 12 18C8.69 18 6 15.31 6 12C6 8.69 8.69 6 12 6C13.66 6 15.14 6.69 16.22 7.78L13 11H20V4L17.65 6.35Z" fill="currentColor"/>
                </svg>
                {isRefreshing ? 'Refreshing...' : 'Refresh'}
              </button>
            </div>
            <div className="filter-controls">
                <button 
                  className={`filter-button ${dateFilter === 'all' ? 'active' : ''}`} 
                  onClick={() => handleFilterChange('all')}
                >
                  All Time
                </button>
                <button 
                  className={`filter-button ${dateFilter === 'today' ? 'active' : ''}`} 
                  onClick={() => handleFilterChange('today')}
                >
                  Today
                </button>
                <button 
                  className={`filter-button ${dateFilter === 'week' ? 'active' : ''}`} 
                  onClick={() => handleFilterChange('week')}
                >
                  This Week
                </button>
                <button 
                  className={`filter-button ${dateFilter === 'month' ? 'active' : ''}`} 
                  onClick={() => handleFilterChange('month')}
                >
                  This Month
                </button>
              </div>
            </div>
            <div className="total-reports">
              {(() => {
                // Count reports based on current filter
                let displayCount = 0;
                if (resolvedFilter === 'resolved') {
                  displayCount = filteredReports.filter(r => r.progress === 'Resolved').length;
                } else if (seenFilter === 'seen') {
                  displayCount = filteredReports.filter(r => r.status === 'Seen' && r.progress !== 'Resolved').length;
                } else if (seenFilter === 'unseen') {
                  displayCount = filteredReports.filter(r => r.status !== 'Seen' && r.progress !== 'Resolved').length;
                } else {
                  displayCount = filteredReports.length;
                }
                console.log(`Displaying count: ${displayCount} reports`);
                return `${displayCount} ${displayCount === 1 ? 'Report' : 'Reports'} Found`;
              })()}
            </div>
            <ReportsTable 
              reports={filteredReports} 
              onView={handleView} 
              onSeenFilterChange={handleSeenFilterChange}
              seenFilter={seenFilter}
              onResolvedFilterChange={handleResolvedFilterChange}
              resolvedFilter={resolvedFilter}
            />
          </div>
        );
      case '/authority/Status':
        return (
          <div className="stats-page">
            <h2 className="status-title">Status Overview</h2>
            <div className="charts-container">
              <div className="chart-item">
                <StatusPieChart stats={{
                  // Percentages
                  seen: stats.seen,
                  unseen: stats.unseen,
                  resolved: stats.resolved,
                  unresolved: stats.unresolved,
                  // Counts
                  seenCount: stats.seenCount,
                  unseenCount: stats.unseenCount,
                  resolvedCount: stats.resolvedCount,
                  unresolvedCount: stats.unresolvedCount
                }} />
              </div>
              <div className="chart-item">
                <WeeklyUploadsChart reports={reports} />
              </div>
            </div>
          </div>
        );
      case '/authority/Settings':
        return (
          <div className="settings-section">
            <h2>Settings</h2>
            <ProfileSettings />
          </div>
        );
      case '/authority/areawise-uploads':
        return <AreaWiseUploads />;
      default:
        console.log(`Unknown authority path: ${location.pathname}, redirecting to /authority`);
        navigate('/authority');
        return null;
    }
  };

  return (
    <div className="authority-container">
      <Navbar />
      <main className="main-content">
        {renderContent()}
        {selectedReport && (
          <div className="report-detail-wrapper">
            <ReportDetailCard
              report={selectedReport}
              onClose={handleClose}
              markAsSeen={() => markAsSeen(selectedReport.id)}
              markAsResolved={() => markAsResolved(selectedReport.id)}
            />
          </div>
        )}
        
        {/* Notification */}
        {showNotification && (
          <div className={`notification ${notificationMessage.includes('Error') ? 'error' : 'success'}`}>
            {notificationMessage}
          </div>
        )}
      </main>
    </div>
  );
};

export default Authority;

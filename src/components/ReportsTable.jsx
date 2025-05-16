import React, { useState, useEffect } from 'react';
import './ReportsTable.css';

const ReportsTable = ({ reports, onView, onSeenFilterChange, seenFilter, onResolvedFilterChange, resolvedFilter }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [paginatedReports, setPaginatedReports] = useState([]);
  const reportsPerPage = 15;
  
  // Calculate total pages
  const totalPages = Math.ceil((reports?.length || 0) / reportsPerPage);
  
  // Track filtered reports count for pagination
  const [filteredCount, setFilteredCount] = useState(0);
  
  // Filter and paginate reports
  useEffect(() => {
    if (!reports || reports.length === 0) {
      setPaginatedReports([]);
      setFilteredCount(0);
      return;
    }
    
    // COMPLETELY SIMPLIFIED FILTERING APPROACH
    let filteredReports = [...reports];
    
    // First, apply the appropriate filter based on which one is active
    if (resolvedFilter === 'resolved') {
      // If resolved filter is active, ONLY show resolved reports
      filteredReports = filteredReports.filter(report => report.progress === 'Resolved');
      console.log(`Showing ${filteredReports.length} resolved reports`);
    } 
    else if (seenFilter === 'seen') {
      // If seen filter is active, show ONLY reports that are seen but NOT resolved
      filteredReports = reports.filter(report => 
        report.status === 'Seen' && report.progress !== 'Resolved'
      );
      console.log(`Showing ${filteredReports.length} seen (not resolved) reports`);
    } 
    else if (seenFilter === 'unseen') {
      // If unseen filter is active, show ONLY reports that are not seen and NOT resolved
      filteredReports = reports.filter(report => 
        report.status !== 'Seen' && report.progress !== 'Resolved'
      );
      console.log(`Showing ${filteredReports.length} unseen (not resolved) reports`);
    }
    // If no filter is active, show all reports except for page with limited view
    
    // Store the filtered count for pagination controls
    setFilteredCount(filteredReports.length);
    console.log('Filtered reports count:', filteredReports.length);
    
    // Apply pagination
    const startIndex = (currentPage - 1) * reportsPerPage;
    const endIndex = startIndex + reportsPerPage;
    setPaginatedReports(filteredReports.slice(startIndex, endIndex));
    
  }, [reports, currentPage, seenFilter, resolvedFilter]);
  
  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  // Format date and time from uploadedAt
  const formatDate = (dateObj) => {
    if (!dateObj) return 'N/A';
    const date = new Date(dateObj);
    return date.toLocaleDateString();
  };

  const formatTime = (dateObj) => {
    if (!dateObj) return 'N/A';
    const date = new Date(dateObj);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="table-container">
      <div className="reports-header">
        <h2>Damage Reports</h2>
        {(onSeenFilterChange || onResolvedFilterChange) && (
          <div className="filter-controls">
            {onSeenFilterChange && (
              <>
                <button 
                  className={`filter-button ${seenFilter === 'all' ? 'active' : ''}`}
                  onClick={() => onSeenFilterChange('all')}
                > 
                  All
                </button>
                <button 
                  className={`filter-button ${seenFilter === 'seen' ? 'active' : ''}`}
                  onClick={() => onSeenFilterChange('seen')}
                >
                  Seen
                </button>
                <button 
                  className={`filter-button ${seenFilter === 'unseen' ? 'active' : ''}`}
                  onClick={() => onSeenFilterChange('unseen')}
                >
                  Unseen
                </button>
              </>
            )}
            
            {onResolvedFilterChange && (
              <button 
                className={`filter-button ${resolvedFilter === 'resolved' ? 'active' : ''}`}
                onClick={() => onResolvedFilterChange('resolved')}
              >
                Resolved
              </button>
            )}
          </div>
        )}  
      </div>
      
      <table className="table">
        <thead>
          <tr>
            <th>PROFILE</th>
            <th>GMAIL</th>
            <th>LOCATION</th>
            <th>FREQUENCY</th>
            <th>DATE</th>
            <th>TIME</th>
            <th>STATUS</th>
            <th>ACTION</th>
          </tr>
        </thead>
        <tbody>
          {paginatedReports && paginatedReports.length > 0 ? (
            paginatedReports.map((r) => (
              <tr key={r.id} className="table-row">
                <td>
                  <div className="profile-circle">
                    <div className="profile-icon">
                      <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#1a73e8"/>
                      </svg>
                    </div>
                  </div>
                </td>
                <td>{r.userEmail}</td>
                <td>
                  {typeof r.roadLocation === 'object' ? 
                    (r.roadLocation.address ? 
                      `${r.roadLocation.address}, ${r.roadLocation.district || ''} ${r.roadLocation.pincode || ''}` : 
                      '10-6-38/2 road no:-10, vijaynagar colony, Mahabubnagar') : 
                    (r.roadLocation || '10-6-38/2 road no:-10, vijaynagar colony, Mahabubnagar')}
                </td>
                <td>
                  <span className="frequency-badge">{r.frequency || 1}{r.frequency === 1 ? ' report' : ' reports'}</span>
                </td>
                <td>{formatDate(r.uploadedAt)}</td>
                <td>{formatTime(r.uploadedAt)}</td>
                <td>
                  {r.progress === 'Resolved' ? (
                    <span className="status-label resolved">Resolved</span>
                  ) : r.status === 'Seen' ? (
                    <span className="status-label seen">Seen</span>
                  ) : (
                    <span className="status-label unseen">Unseen</span>
                  )}
                </td>
                <td>
                  <button
                    onClick={() => onView(r.id)}
                    className="view-button"
                  >
                    View
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr className="empty-row">
              <td colSpan="8" className="no-reports">No reports found</td>
            </tr>
          )}
        </tbody>
      </table>
      
      {/* Pagination controls - only show if there are more than 15 filtered reports */}
      {filteredCount > reportsPerPage && (
        <div className="pagination-controls">
          <button 
            className="pagination-button" 
            onClick={() => handlePageChange(1)} 
            disabled={currentPage === 1}
          >
            &laquo;
          </button>
          <button 
            className="pagination-button" 
            onClick={() => handlePageChange(currentPage - 1)} 
            disabled={currentPage === 1}
          >
            &lt;
          </button>
          
          <div className="page-indicator">
            Page {currentPage} of {Math.ceil(filteredCount / reportsPerPage)}
          </div>
          
          {/* Only show Next buttons if there are enough filtered reports */}
          {filteredCount > currentPage * reportsPerPage && (
            <>
              <button 
                className="pagination-button" 
                onClick={() => handlePageChange(currentPage + 1)}
              >
                &gt;
              </button>
              <button 
                className="pagination-button" 
                onClick={() => handlePageChange(Math.ceil(filteredCount / reportsPerPage))}
              >
                &raquo;
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default ReportsTable;

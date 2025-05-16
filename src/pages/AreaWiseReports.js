import React, { useEffect, useState } from 'react';
import './AreaWiseUploads.css';

const AreaWiseUploads = () => {
  const [groupedUploads, setGroupedUploads] = useState({});
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterType, setFilterType] = useState('pincode');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [uniqueFilters, setUniqueFilters] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add effect to control body scrolling when modal is open
  useEffect(() => {
    if (selectedReport) {
      // Save current scroll position
      const scrollY = window.scrollY;
      
      // Add modal-open class and set the current scroll position as a style property
      document.body.style.top = `-${scrollY}px`;
      document.body.classList.add('modal-open');
      
      return () => {
        // Restore scroll position when component unmounts or selectedReport changes to null
        document.body.classList.remove('modal-open');
        document.body.style.top = '';
        window.scrollTo(0, scrollY);
      };
    }
  }, [selectedReport]);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:5000/api/images');
        const data = await response.json();
        
        if (data.success) {
          // Group images by pincode or district
          const grouped = data.images.reduce((acc, img) => {
            const location = img.roadLocation || {
              address: 'Not available',
              district: 'Not available',
              pincode: 'Not available'
            };
            
            const filterKey = filterType === 'pincode' ? location.pincode : location.district;
            const key = filterKey || 'Unknown';
            
            if (!acc[key]) {
              acc[key] = [];
            }
            
            acc[key].push({
              id: img._id,
              userEmail: img.userEmail,
              date: new Date(img.uploadedAt).toLocaleDateString(),
              time: new Date(img.uploadedAt).toLocaleTimeString(),
              description: img.imageName,
              roadLocation: location,
              image: img.imageUrl,
              classification: img.classification
            });
            return acc;
          }, {});
          
          setGroupedUploads(grouped);
          setUniqueFilters(['all', ...Object.keys(grouped).sort()]);
        }
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [filterType]);

  const handleView = (report) => {
    // Just set the selected report without marking as seen
    setSelectedReport(report);
  };

  const handleClose = () => {
    setSelectedReport(null);
  };

  const handleFilterChange = (e) => {
    setSelectedFilter(e.target.value);
  };

  const handleFilterTypeChange = (e) => {
    setFilterType(e.target.value);
    setSelectedFilter('all');
  };

  const filteredUploads = selectedFilter === 'all' 
    ? groupedUploads 
    : { [selectedFilter]: groupedUploads[selectedFilter] };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="area-uploads-container">
      <div className="header-section">
        <h2>Area-wise Reports</h2>
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="filterType">Filter By:</label>
            <select 
              id="filterType" 
              value={filterType} 
              onChange={handleFilterTypeChange}
              className="filter-select"
            >
              <option value="pincode">Pincode</option>
              <option value="district">District</option>
            </select>
          </div>
          <div className="filter-group">
            <label htmlFor="filterValue">Select {filterType === 'pincode' ? 'Pincode' : 'District'}:</label>
            <select 
              id="filterValue" 
              value={selectedFilter} 
              onChange={handleFilterChange}
              className="filter-select"
            >
              {uniqueFilters.map(filter => (
                <option key={filter} value={filter}>
                  {filter === 'all' ? `All ${filterType === 'pincode' ? 'Pincodes' : 'Districts'}` : filter}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="reports-grid">
        {Object.entries(filteredUploads).map(([key, uploads]) => (
          <div key={key} className="location-section">
            <div className="location-header">
              <h3>{filterType === 'pincode' ? 'Pincode' : 'District'}: {key}</h3>
              <span className="report-count">{uploads.length} Reports</span>
            </div>
            <div className="uploads-grid">
              {uploads.map((upload) => (
                <div key={upload.id} className="upload-card" onClick={() => handleView(upload)}>
                  <div className="image-wrapper">
                    <img
                      src={upload.image}
                      alt="Road Issue"
                      className="upload-image"
                    />
                  </div>
                  <div className="upload-details">
                    <p className="user-info">
                      <i className="fas fa-user"></i>
                      {upload.userEmail}
                    </p>
                    <p className="date-info">
                      <i className="fas fa-calendar"></i>
                      {upload.date} at {upload.time}
                    </p>
                    <p className="classification-info">
                      <i className="fas fa-tag"></i>
                      {upload.classification}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selectedReport && (
        <div className="report-detail-modal">
          <div className="modal-content">
            <button className="close-button" onClick={handleClose}>×</button>
            <div className="modal-header">
              <h3>Report Details</h3>
            </div>
            <div className="modal-body">
              <div className="report-image-section">
                <img src={selectedReport.image} alt="Road Issue" className="modal-image" />
              </div>
              <div className="report-info">
                <div className="info-section">
                  <h4>User Information</h4>
                  <p><i className="fas fa-user"></i> <strong>User:</strong> {selectedReport.userEmail}</p>
                  <p><i className="fas fa-calendar"></i> <strong>Date:</strong> {selectedReport.date}</p>
                  <p><i className="fas fa-clock"></i> <strong>Time:</strong> {selectedReport.time}</p>
                </div>
                <div className="info-section">
                  <h4>Location Details</h4>
                  <p><i className="fas fa-map-marker-alt"></i> <strong>Address:</strong> {selectedReport.roadLocation.address}</p>
                  <p><i className="fas fa-city"></i> <strong>District:</strong> {selectedReport.roadLocation.district}</p>
                  <p><i className="fas fa-map-pin"></i> <strong>Pincode:</strong> {selectedReport.roadLocation.pincode}</p>
                </div>
                <div className="info-section">
                  <h4>Report Status</h4>
                  <p><i className="fas fa-tag"></i> <strong>Classification:</strong> {selectedReport.classification}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AreaWiseUploads;

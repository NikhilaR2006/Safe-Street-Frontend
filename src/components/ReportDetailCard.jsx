import React, { useState, useEffect } from 'react';
import './ReportDetailCard.css';

// List of all districts in Telangana
const TELANGANA_DISTRICTS = [
  'Adilabad',
  'Bhadradri Kothagudem',
  'Hyderabad',
  'Jagtial',
  'Jangaon',
  'Jayashankar Bhupalpally',
  'Jogulamba Gadwal',
  'Kamareddy',
  'Karimnagar',
  'Khammam',
  'Komaram Bheem Asifabad',
  'Mahabubabad',
  'Mahabubnagar',
  'Mancherial',
  'Medak',
  'Medchal-Malkajgiri',
  'Mulugu',
  'Nagarkurnool',
  'Nalgonda',
  'Narayanpet',
  'Nirmal',
  'Nizamabad',
  'Peddapalli',
  'Rajanna Sircilla',
  'Rangareddy',
  'Sangareddy',
  'Siddipet',
  'Suryapet',
  'Vikarabad',
  'Wanaparthy',
  'Warangal Rural',
  'Warangal Urban',
  'Yadadri Bhuvanagiri'
];

const ReportDetailCard = ({ report, onClose, markAsSeen, markAsResolved }) => {
  const [hasPredicted, setHasPredicted] = useState(false);
  const [prediction, setPrediction] = useState(null);
  const [yoloImage, setYoloImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [activeTab, setActiveTab] = useState('original'); // 'original' or 'analyzed'
  const [selectedDistrict, setSelectedDistrict] = useState(report.roadLocation?.district || '');

  // Add class to body when component mounts to prevent scrolling
  useEffect(() => {
    // Save current scroll position
    const scrollY = window.scrollY;
    
    // Add modal-open class and set the current scroll position as a style property
    document.body.style.top = `-${scrollY}px`;
    document.body.classList.add('modal-open');
    
    // Clean up when component unmounts
    return () => {
      document.body.classList.remove('modal-open');
      // Restore scroll position
      document.body.style.top = '';
      window.scrollTo(0, scrollY);
    };
  }, []);

  const handlePredict = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      // Use the correct image URL property from the report object
      const response = await fetch(report.imageUrl);
      const blob = await response.blob();

      const formData = new FormData();
      formData.append('image', blob, 'upload.jpg');

      const predictResponse = await fetch('http://localhost:5002/predict', {
        method: 'POST',
        body: formData,
      });

      const data = await predictResponse.json();

      if (!predictResponse.ok) {
        throw new Error(data.message || 'Prediction failed.');
      }

      if (!data.labels || data.labels.length === 0) {
        setErrorMsg('No damages detected in this image.');
      }

      setPrediction({
        labels: data.labels || [],
        boxes: data.boxes || [],
        severity: data.severity || 'Not specified',
        action: data.action || 'No action available',
        solution: data.solution || 'No solution provided',
      });

      if (data.image) {
        setYoloImage(data.image);
      }

      setHasPredicted(true);
      setActiveTab('analyzed');
      
      // Mark the report as seen after successful prediction
      if (markAsSeen) {
        markAsSeen();
      }
    } catch (error) {
      console.error('Prediction error:', error);
      setErrorMsg(error.message || 'An error occurred during prediction.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="report-detail-wrapper">
      <div className="report-card">
        <div className="card-header">
          <div className="header-content">
            <div className="user-info">
              <div className="profile-circle">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.21 12 16 10.21 16 8C16 5.79 14.21 4 12 4C9.79 4 8 5.79 8 8C8 10.21 9.79 12 12 12ZM12 14C9.33 14 4 15.34 4 18V20H20V18C20 15.34 14.67 14 12 14Z" fill="#1a73e8"/>
                </svg>
              </div>
              <div className="user-details">
                <span className="username">{report.userEmail}</span>
                <span className="report-date">
                  {report.uploadedAt ? new Date(report.uploadedAt).toLocaleDateString() : 'N/A'} at {report.uploadedAt ? new Date(report.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}
                </span>
              </div>
            </div>
            <button className="close-button" onClick={onClose}>✕</button>
          </div>
        </div>

        <div className="card-content">
          <div className="image-section">
            <div className="image-tabs">
              <button 
                className={`tab-button ${activeTab === 'original' ? 'active' : ''}`}
                onClick={() => setActiveTab('original')}
              >
                Original Image
              </button>
              {hasPredicted && (
                <button 
                  className={`tab-button ${activeTab === 'analyzed' ? 'active' : ''}`}
                  onClick={() => setActiveTab('analyzed')}
                >
                  Analyzed Image
                </button>
              )}
            </div>

            <div className="image-container">
              {activeTab === 'original' ? (
                <img src={report.imageUrl} alt="Original report" className="report-image" />
              ) : (
                <img src={`data:image/jpeg;base64,${yoloImage}`} alt="Analyzed report" className="report-image" />
              )}
            </div>
          </div>

          <div className="details-section">
            {activeTab === 'analyzed' && hasPredicted && prediction && (
              <div className="analysis-card">
                <h3>Analysis Results</h3>
                {prediction.labels.length > 0 ? (
                  <div className="analysis-grid">
                    <div className="analysis-item">
                      <span className="label">Damage Type</span>
                      <span className="value">{prediction.labels.join(', ')}</span>
                    </div>
                    <div className="analysis-item">
                      <span className="label">Severity</span>
                      <span className="value">{prediction.severity}</span>
                    </div>
                    <div className="analysis-item">
                      <span className="label">Recommended Action</span>
                      <span className="value">{prediction.action}</span>
                    </div>
                    <div className="analysis-item">
                      <span className="label">Repair Solution</span>
                      <span className="value">{prediction.solution}</span>
                    </div>
                  </div>
                ) : (
                  <div className="no-damage-message">
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
                    </svg>
                    <span>No damages detected in this image.</span>
                  </div>
                )}
              </div>
            )}

            <div className="location-card">
              <h3>Location Details</h3>
              <div className="location-info">
                <div className="info-item">
                  <span className="label">Address</span>
                  <span className="value">{report.roadLocation?.address || 'Not available'}</span>
                </div>
                <div className="info-item">
                  <span className="label">District</span>
                  <span className="value">{report.roadLocation?.district || 'Not available'}</span>
                </div>
                <div className="info-item">
                  <span className="label">Pincode</span>
                  <span className="value">{report.roadLocation?.pincode || 'Not available'}</span>
                </div>
                {report.latitude && report.longitude && (
                  <a
                    href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="map-link"
                  >
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" fill="currentColor"/>
                    </svg>
                    View on Map
                  </a>
                )}
              </div>
            </div>

            <div className="damage-description-card">
              <h3>Damage Description</h3>
              <div className="damage-description-content">
                {report.damageDescription ? (
                  <p>{report.damageDescription}</p>
                ) : (
                  <p className="no-description">No damage description provided</p>
                )}
              </div>
            </div>

            {!hasPredicted && (
              <button className="analyze-button" onClick={handlePredict} disabled={isLoading}>
                {isLoading ? (
                  <div className="loading-indicator">
                    <div className="spinner"></div>
                    <span>Analyzing Image...</span>
                  </div>
                ) : (
                  <>
                    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0l4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4z" fill="currentColor"/>
                    </svg>
                    Analyze Image
                  </>
                )}
              </button>
            )}

            {hasPredicted && (
              <div className="resolved-section">
                <button className="resolve-button" onClick={markAsResolved}>
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                  </svg>
                  <span>Mark as Resolved</span>
                </button>
              </div>
            )}

            {errorMsg && (
              <div className="error-card">
                <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" fill="currentColor"/>
                </svg>
                <span>{errorMsg}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-content">
            <div className="loading-spinner"></div>
            <p>Analyzing image, please wait...</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportDetailCard;




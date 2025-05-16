import React, { useState, useEffect, useCallback } from 'react';
import { Upload, History, User, LogOut, FileText } from 'lucide-react';
import './UploadPage.css';
import NotificationBell from '../components/NotificationBell';

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

function UploadPage() {
  const userEmail = localStorage.getItem("email");
  const userType = localStorage.getItem("userType");
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!userEmail || !userType) {
      window.location.href = "/login";
      return;
    }
  }, [userEmail, userType]);

  console.log('[UploadPage] Email from localStorage:', userEmail);
  
  const [activeTab, setActiveTab] = useState('upload');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [detailsComplete, setDetailsComplete] = useState(false);

  const handleLogout = async () => {
    try {
      // Clear address-related fields from the database
      const response = await fetch('http://localhost:5000/api/user/details', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ 
          email: userEmail,
          address: '',
          district: '',
          pincode: '',
          damageDescription: ''
        })
      });

      if (!response.ok) {
        console.error('Failed to clear address data');
      }
    } catch (error) {
      console.error('Error clearing address data:', error);
    } finally {
      // Clear local storage and redirect
      localStorage.clear();
      window.location.href = "/login";
    }
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const updateDetailsStatus = useCallback((isComplete) => {
    setDetailsComplete(isComplete);
  }, []);

  return (
    <div className="app-container">
      <nav className="sidebar">
        <div className="sidebar-header">
          <img src="/Logo.png" alt="SafeStreet Logo" className="logo" />
        </div>
        <div className="nav-links">
          <button 
            className={`nav-item ${activeTab === 'details' ? 'active' : ''}`} 
            onClick={() => handleTabChange('details')}
            data-tab="details"
          >
            <FileText size={20} /><span>Damage Details</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'upload' ? 'active' : ''}`} 
            onClick={() => handleTabChange('upload')} 
            data-tab="upload"
          >
            <Upload size={20} /><span>Upload</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'history' ? 'active' : ''}`} 
            onClick={() => handleTabChange('history')}
            data-tab="history"
          >
            <History size={20} /><span>History</span>
          </button>
          <button 
            className={`nav-item ${activeTab === 'profile' ? 'active' : ''}`} 
            onClick={() => handleTabChange('profile')}
            data-tab="profile"
          >
            <User size={20} /><span>Profile</span>
          </button>
        </div>
        <button className="logout-btn" onClick={() => setShowLogoutConfirm(true)}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </nav>

      {showLogoutConfirm && (
        <div className="logout-confirm-overlay">
          <div className="logout-confirm-dialog">
            <h3>Confirm Logout</h3>
            <p>Are you sure you want to logout?</p>
            <div className="logout-confirm-buttons">
              <button className="logout-confirm-cancel" onClick={() => setShowLogoutConfirm(false)}>
                Cancel
              </button>
              <button className="logout-confirm-proceed" onClick={handleLogout}>
                Logout
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="main-content">
        <header className="dashboard-header">
          <h1>Welcome, {userEmail || "Guest"}!</h1>
          <div className="header-actions">
            <NotificationBell 
              userEmail={userEmail} 
              onNavigateToHistory={(report) => {
                // Navigate to history tab
                setActiveTab('history');
                // Set a timeout to allow the tab to render before showing the image details
                setTimeout(() => {
                  // Find the report in the PreviousUploads component and show its details
                  const event = new CustomEvent('showReportDetails', { detail: report });
                  window.dispatchEvent(event);
                }, 100);
              }}
            />
          </div>
        </header>

        {activeTab === 'details' && 
          <UserDetailsForm 
            userEmail={userEmail} 
            onDetailsUpdate={updateDetailsStatus}
          />}
          
        {activeTab === 'upload' && 
          <UploadComponent 
            userEmail={userEmail} 
            detailsComplete={detailsComplete}
            setActiveTab={setActiveTab}
          />}
        
        {activeTab === 'history' && <PreviousUploads userEmail={userEmail} />}
        
        {activeTab === 'profile' && <ProfileDisplay userEmail={userEmail} />}
      </main>
    </div>
  );
}

function UserDetailsForm({ userEmail, onDetailsUpdate }) {
  const [formData, setFormData] = useState({
    address: '',
    district: '',
    pincode: '',
    damageDescription: ''
  });

  // Save damage description to localStorage whenever it changes
  useEffect(() => {
    if (formData.damageDescription) {
      localStorage.setItem('damageDescription', formData.damageDescription);
    }
  }, [formData.damageDescription]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const checkDetailsCompleteness = useCallback((data) => {
    const requiredFields = [data?.address, data?.district, data?.pincode];
    const isComplete = requiredFields.every(field => field && field.trim() !== '');
    console.log("Details completeness check:", isComplete, data);
    onDetailsUpdate(isComplete);
  }, [onDetailsUpdate]);

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!userEmail) {
        setError("User email not found. Cannot fetch profile.");
        setLoading(false);
        onDetailsUpdate(false);
        return;
      }
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/user?email=${encodeURIComponent(userEmail)}`);
        const data = await response.json();

        if (response.ok && data.success && data.user) {
          const userData = data.user;
          setFormData({
            address: userData.address || '',
            district: userData.district || '',
            pincode: userData.pincode || '',
            damageDescription: userData.damageDescription || ''
          });
          setError('');
          checkDetailsCompleteness(userData);
        } else {
          setError(data.error || "Failed to fetch profile data.");
          onDetailsUpdate(false);
        }
      } catch (err) {
        console.error("Fetch profile error:", err);
        setError("Failed to connect to server to fetch profile.");
        onDetailsUpdate(false);
      } finally {
        setLoading(false);
      }
    };

    fetchProfileData();
  }, [userEmail, onDetailsUpdate, checkDetailsCompleteness]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
    setSuccessMessage('');
  };

  const handleSaveDetails = async (e) => {
    e.preventDefault();
    if (!userEmail) {
        setError("User email not found. Cannot save details.");
        return;
    }
    setSaving(true);
    setError('');
    setSuccessMessage('');

    try {
      console.log('Saving details for user:', userEmail);
      console.log('Form data:', formData);

      const response = await fetch('http://localhost:5000/api/user/details', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: userEmail, ...formData })
      });

      console.log('Response status:', response.status);
      const data = await response.json();
      console.log('Response data:', data);

      if (response.ok && data.success && data.user) {
        setSuccessMessage("Profile details saved successfully!");
        const updatedUserData = data.user;
        setFormData({
          address: updatedUserData.address || '',
          district: updatedUserData.district || '',
          pincode: updatedUserData.pincode || '',
          damageDescription: updatedUserData.damageDescription || ''
        });
        checkDetailsCompleteness(updatedUserData);
      } else {
        setError(data.error || "Failed to save details.");
        onDetailsUpdate(false);
      }
    } catch (err) {
      console.error("Save details error:", err);
      setError("Failed to connect to server to save details. Please check if the server is running.");
      onDetailsUpdate(false);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="profile-container"><p>Loading details...</p></div>;
  }

  return (
    <div className="details-container">
      <div className="details-card">
        <h2 className="details-header">Damage Details</h2>
        <p className="details-subheader">
Please keep your information up to date. Address details are required for image uploads.
        </p>

        <form onSubmit={handleSaveDetails} className="details-form">
          {error && <p className="error-message form-message">{error}</p>}
          {successMessage && <p className="success-message form-message">{successMessage}</p>}

          <div className="form-section">
             <h3 className="section-title">Address Information</h3>
             <div className="input-group address-input-group">
                <label htmlFor="address">Street Address *</label>
                <input 
                  type="text" 
                  id="address" 
                  name="address" 
                  value={formData.address}
                  onChange={handleChange} 
                  placeholder="Enter the address of damaged road!"
                  required 
                />
             </div>
            <div className="form-grid two-columns">
              <div className="input-group">
                <label htmlFor="district">District *</label>
                <select
                  id="district"
                  name="district"
                  value={formData.district}
                  onChange={handleChange}
                  className="form-select"
                  required
                >
                  <option value="">Select a district</option>
                  {TELANGANA_DISTRICTS.map((district, index) => (
                    <option key={index} value={district}>{district}</option>
                  ))}
                </select>
              </div>
              <div className="input-group">
                <label htmlFor="pincode">Pincode *</label>
                <input 
                  type="text" 
                  id="pincode" 
                  name="pincode" 
                  value={formData.pincode}
                  onChange={handleChange} 
                  placeholder="Enter your pincode" 
                  required 
                  pattern="[0-9]{6}"
                  title="Pincode should be 6 digits"
                />
              </div>
            </div>
            
            <div style={{ marginTop: '30px' }}></div>
            <h3 className="section-title">Damage Description</h3>
            <div className="input-group">
              <label htmlFor="damageDescription">Describe the damage of road (Optional)</label>
              <textarea
                id="damageDescription"
                name="damageDescription"
                value={formData.damageDescription}
                onChange={handleChange}
                placeholder="Please describe the road damage in detail "
                rows="4"
              />
            </div>
          </div>
          
          <div className="form-actions" style={{ marginTop: '-30px' }}>
            <button type="submit" className="save-details-button" disabled={saving}>
              {saving ? 'Saving...' : 'Save Details'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

function UploadComponent({ userEmail, detailsComplete, setActiveTab }) {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [result, setResult] = useState(null);
  const [showResult, setShowResult] = useState(false);
  const [statusMessage, setStatusMessage] = useState({ message: '', type: 'info' });
  const [formError, setFormError] = useState('');
  const [showLoadingPopup, setShowLoadingPopup] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [hasExistingUploads, setHasExistingUploads] = useState(false);
  const [showAddressWarning, setShowAddressWarning] = useState(false);

  // Check if user has existing uploads when component mounts
  useEffect(() => {
    if (userEmail) {
      const checkExistingUploads = async () => {
        try {
          const response = await fetch(`http://localhost:5000/api/images/user/${encodeURIComponent(userEmail)}`);
          const data = await response.json();
          
          if (response.ok && data.success) {
            const hasUploads = data.images && data.images.length > 0;
            console.log('User has existing uploads:', hasUploads);
            setHasExistingUploads(hasUploads);
            
            // Show warning immediately if they have uploads
            if (hasUploads) {
              console.log('Setting showAddressWarning to true');
              setTimeout(() => setShowAddressWarning(true), 500);
            }
          }
        } catch (error) {
          console.error('Error checking existing uploads:', error);
        }
      };
      
      checkExistingUploads();
    }
  }, [userEmail]);

  if (!detailsComplete) {
    return (
      <div className="upload-container" style={{ textAlign: 'center', padding: '40px' }}>
        <h2>Upload Road Image</h2>
        <p style={{ color: 'red', marginTop: '20px' }}>
          Please complete your address details in the 'Damage Details' section before uploading images.
        </p>
        <button 
          className="details-nav-button" 
          onClick={() => setActiveTab('details')}
          style={{
            padding: '10px 20px',
            backgroundColor: '#1976D2',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            fontSize: '16px',
            cursor: 'pointer',
            marginTop: '20px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
            transition: 'all 0.3s ease'
          }}
        >
          Go to Damage Details
        </button>
      </div>
    );
  }

  const handleImageChange = (e) => {
    // If user has existing uploads, show warning popup and prevent selection
    if (hasExistingUploads) {
      e.preventDefault();
      console.log('Showing address warning popup from handleImageChange');
      setShowAddressWarning(true);
      return;
    }
    
    const file = e.target.files[0];
    if (file) {
      const validTypes = ['image/jpeg', 'image/jpg', 'image/png'];
      if (!validTypes.includes(file.type)) {
        setFormError('Please upload only JPEG, JPG, or PNG images');
        setImage(null);
        setPreview('');
        return;
      }
      setFormError('');
      setImage(file);
      setPreview(URL.createObjectURL(file));
      setStatusMessage({ message: '', type: 'info' });
      setResult(null);
      setShowResult(false);
    }
  };

  const handleAnalyzeImage = async () => {
    if (!image) {
      setStatusMessage({ message: "Please select an image first!", type: 'error' });
      return; 
    }
    
    // If user has existing uploads, show warning popup
    if (hasExistingUploads) {
      console.log('Showing address warning popup from handleAnalyzeImage');
      setShowAddressWarning(true);
      return;
    }

    setLoading(true);
    setShowLoadingPopup(true);
    setStatusMessage({ message: 'Analyzing image...', type: 'info' });
    setResult(null);
    setShowResult(false);
    const formData = new FormData();
    formData.append("image", image);

    try {
      const pythonServiceUrl = "http://localhost:5001/predict"; // Road classification service
      const response = await fetch(pythonServiceUrl, { 
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Classification service error (${response.status}): ${errorText}`);
      }
      const data = await response.json();
      console.log("Received classification from Python:", data);
      
      // Create a blob URL for the image
      const imageBlob = new Blob([await image.arrayBuffer()], { type: image.type });
      const imageUrl = URL.createObjectURL(imageBlob);
      
      setResult({
        ...data,
        imageUrl: imageUrl
      });
      setShowResult(true);
      setStatusMessage({ message: 'Analysis complete.', type: 'info' });
           
    } catch (error) {
      console.error("Analysis error:", error);
      setStatusMessage({ message: `Analysis failed: ${error.message}`, type: 'error' });
      setResult({ error: error.message });
      setShowResult(true);
    } finally {
      setLoading(false);
      setShowLoadingPopup(false);
    }
  };

  const handleSaveResult = async () => {
     if (!result || result.class?.toLowerCase() !== 'road' || !userEmail) {
        setStatusMessage({ message: 'Cannot save result. Ensure image is classified as Road and you are logged in.', type: 'error' });
        return;
     }

     setSaving(true);
     setShowLoadingPopup(true);
     setStatusMessage({ message: 'Image saved!', type: 'info' });

     // Create a canvas to compress the image
     const canvas = document.createElement('canvas');
     const ctx = canvas.getContext('2d');
     const img = new Image();
     
     img.onload = async () => {
       // Set maximum dimensions
       const MAX_WIDTH = 800;
       const MAX_HEIGHT = 600;
       
       // Calculate new dimensions
       let width = img.width;
       let height = img.height;
       
       if (width > height) {
         if (width > MAX_WIDTH) {
           height *= MAX_WIDTH / width;
           width = MAX_WIDTH;
         }
       } else {
         if (height > MAX_HEIGHT) {
           width *= MAX_HEIGHT / height;
           height = MAX_HEIGHT;
         }
       }
       
       // Set canvas dimensions
       canvas.width = width;
       canvas.height = height;
       
       // Draw and compress image
       ctx.drawImage(img, 0, 0, width, height);
       
       
       const base64data = canvas.toDataURL('image/jpeg', 0.7);

        // Get the damage description from localStorage instead of trying to access the form directly
        // This works because we're storing it in localStorage when the user enters it in the details form
        const damageDescription = localStorage.getItem('damageDescription') || '';
       
       const payload = {
          imageName: image.name,
          imageUrl: base64data,
          classification: result.class,
          confidence: result.confidence,
          userEmail: userEmail,
          predictedImageUrl: result.predictedImageUrl,
          damageDescription: damageDescription
       };

       try {
           const response = await fetch("http://localhost:5000/api/upload", { 
               method: "POST",
               headers: { "Content-Type": "application/json" },
               body: JSON.stringify(payload),
           });
           const data = await response.json();

           if (response.ok && data.success) {
               setSuccessMessage(data.message || "Image uploaded successfully!");
               setShowSuccessPopup(true);
               setImage(null);
               setPreview('');
               setResult(null);
               setShowResult(false);
               // Set hasExistingUploads to true so they can't upload again
               setHasExistingUploads(true);
           } else {
               throw new Error(data.error || 'Failed to save the result');
           }
       } catch (error) {
           console.error("Save Result error:", error);
           setStatusMessage({ message: `Save failed: ${error.message}`, type: 'error' });
       } finally {
           setSaving(false);
           setShowLoadingPopup(false);
       }
     };

     // Set the image source to the preview URL
     img.src = preview;
  };

  return (
    <div className="upload-container">
      <div className="upload-box">
        <h2>Upload Road Image</h2>
        <div className="upload-area" onClick={() => {
          // If user has existing uploads, show warning popup instead of opening file dialog
          if (hasExistingUploads) {
            console.log('Showing address warning popup from upload area click');
            setShowAddressWarning(true);
          } else {
            document.getElementById('fileInput').click();
          }
        }}>
          {preview ? (
            <img src={preview} alt="Preview" className="image-preview" />
          ) : (
            <div className="upload-placeholder">
              <Upload size={48} />
              <p>Click to select or drag an image here</p>
               <p className="file-types">(JPEG, JPG, PNG only)</p>
            </div>
          )}
           <input id="fileInput" type="file" accept=".jpg,.jpeg,.png" onChange={handleImageChange} style={{ display: 'none' }} />
        </div>
         {formError && <p className="error-message">{formError}</p>}

         {statusMessage.message && !showResult && (
             <p 
                className={`${statusMessage.type}-message`} 
                style={{ textAlign: 'center', marginBottom: '15px' }}
             >
                {statusMessage.message}
            </p>
         )}

         <button 
            className={`upload-button ${loading ? 'loading' : ''}`} 
            onClick={handleAnalyzeImage}
            disabled={!image || loading || saving}
          >
          {loading ? <div className="spinner"></div> : 'Analyze Image'}
        </button>

         {showResult && result && (
           <div className={`result-box ${result.error ? 'error' : 'info'} ${showResult ? 'show' : ''}`}>
            <h3>Analysis Result</h3>
            {result.error ? (
              <p className="error-message">{result.error}</p>
            ) : (
              <>
                <div className="result-content">
                  <div className="classification-badge">
                      <span className="badge-text">{result.class || 'N/A'}</span>
                    <div className="confidence-indicator">
                         <div 
                           className="confidence-circle" 
                           style={{ 
                             '--target-width': `${(result.confidence || 0) * 100}%`
                           }}
                         >
                        <div className="confidence-inner">
                             <span>{Math.round((result.confidence || 0) * 100)}%</span>
                           </div>
                        </div>
                      </div>
                    </div>
                  </div>
                 
                {result.class?.toLowerCase() === 'road' ? (
                     <button 
                        className={`upload-button ${saving ? 'loading' : ''}`} 
                        onClick={handleSaveResult} 
                        disabled={saving || loading}
                        style={{marginTop: '15px'}}
                     >
                        {saving ? <div className="spinner"></div> : 'Submit Report'}
                  </button>
                ) : (
                     <p className="error-message" style={{textAlign: 'center', marginTop: '15px'}}>
                        Cannot save: Please upload an image classified as 'Road'.
                     </p>
                )}
              </>
            )}
          </div>
        )}

        {/* Loading Popup */}
        {showLoadingPopup && (
          <div className="loading-popup">
            <div className="loading-popup-content">
              <div className="loading-spinner"></div>
              <p>{loading ? 'Analyzing image...' : 'Saving result...'}</p>
              <p className="loading-subtext">Please wait while we process your request</p>
            </div>
          </div>
        )}

        {/* Success Popup */}
        {showSuccessPopup && (
          <div className="loading-popup">
            <div className="loading-popup-content success-popup">
              <div className="success-icon">✓</div>
              <p>{successMessage}</p>
              <button 
                className="close-popup-button"
                onClick={() => setShowSuccessPopup(false)}
              >
                Close
              </button>
            </div>
          </div>
        )}
        
        {/* Address Warning Popup */}
        {showAddressWarning && (
          <div className="loading-popup">
            <div className="loading-popup-content warning-popup">
              <div className="warning-icon">⚠️</div>
              <h3>Address Already Used</h3>
              <p>You have already submitted a report with your current address.</p>
              <p>Please update your address in the Image Details section if you want to upload an image for a different location.</p>
              <div className="popup-buttons">
                <button 
                  className="close-popup-button secondary-button"
                  onClick={() => setShowAddressWarning(false)}
                >
                  Cancel
                </button>
                <button 
                  className="close-popup-button"
                  onClick={() => {
                    setShowAddressWarning(false);
                    setActiveTab('details');
                  }}
                >
                  Go to Image Details
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function PreviousUploads() {
  const userEmail = localStorage.getItem("email");
  const [uploads, setUploads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9; // Show 9 reports per page

  useEffect(() => {
    const fetchUploads = async () => {
      try {
        setLoading(true);
        const response = await fetch(`http://localhost:5000/api/uploads?email=${userEmail}`);
        const data = await response.json();
        
        if (data.success) {
          // Update the last time the user checked their reports
          localStorage.setItem('lastReportCheck', new Date().toISOString());
          
          const sortedUploads = data.uploads.map(upload => {
            // Use the status and progress fields from the backend
            // If they don't exist, use default values
            return {
              ...upload,
              imageUrl: upload.imageUrl,
              status: upload.status || 'Unseen',
              progress: upload.progress ||  'Unresolved'
            };
          }).sort((a, b) => 
            new Date(b.uploadedAt) - new Date(a.uploadedAt)
          );
          
          // Update the last checked time
          localStorage.setItem('lastReportCheck', new Date().toISOString());
          
          // Set the uploads
          setUploads(sortedUploads);
        } else {
          setError(data.error || "Failed to fetch uploads");
        }
      } catch (error) {
        console.error('Failed to fetch uploads:', error);
        setError("Failed to connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchUploads();
    
    // Listen for the custom event to show report details
    const handleShowReportDetails = (event) => {
      const report = event.detail;
      if (report && report._id) {
        setSelectedImage(report);
      }
    };
    
    window.addEventListener('showReportDetails', handleShowReportDetails);
    
    return () => {
      window.removeEventListener('showReportDetails', handleShowReportDetails);
    };
  }, [userEmail]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your upload history...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (uploads.length === 0) {
    return (
      <div className="empty-state">
        <h3>No Uploads Yet</h3>
        <p>You haven't uploaded any images yet. Start by uploading your first road image!</p>
      </div>
    );
  }

  // Calculate pagination variables
  const totalPages = Math.ceil(uploads.length / itemsPerPage);
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = uploads.slice(indexOfFirstItem, indexOfLastItem);
  
  // Handle page navigation
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const nextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages));
  const prevPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));

  // Calculate statistics
  const totalReports = uploads.length;
  const resolvedReports = uploads.filter(upload => upload.progress === 'Resolved').length;

  return (
    <div className="history-container">
      <h2>Your Upload History</h2>
      
      {/* User Statistics */}
      <div className="user-stats-container">
        <div className="user-stat-card">
          <div className="stat-value">{totalReports}</div>
          <div className="stat-label">Total Reports</div>
        </div>
        <div className="user-stat-card">
          <div className="stat-value">{resolvedReports}</div>
          <div className="stat-label">Resolved Reports</div>
        </div>
        <div className="user-stat-card">
          <div className="stat-value">{totalReports > 0 ? ((resolvedReports / totalReports) * 100).toFixed(0) : 0}%</div>
          <div className="stat-label">Resolution Rate</div>
        </div>
      </div>
      
      <div className="history-table-wrapper">
        <table className="history-table">
          <thead>
            <tr>
              <th>Image</th>
              <th>Location</th>
              <th>Status</th>
              <th>Progress</th>
              <th>Uploaded Date</th>
              <th>Uploaded Time</th>
            </tr>
          </thead>
          <tbody>
        {currentItems.map((upload, index) => (
              <tr key={index}>
                <td>
                  <div className="history-thumbnail-container">
                    <img 
                      src={upload.imageUrl} 
                      alt={upload.imageName}
                      className="history-thumbnail"
                      onClick={() => setSelectedImage(upload)}
                    />
                    <div className="hover-preview">
                      <img src={upload.imageUrl} alt={upload.imageName} />
                    </div>
                  </div>
                </td>
                <td>
                  <div className="location-details">
                    <p><strong>Address:</strong> {upload.roadLocation?.address || 'N/A'}</p>
                    <p><strong>District:</strong> {upload.roadLocation?.district || 'N/A'}</p>
                    <p><strong>Pincode:</strong> {upload.roadLocation?.pincode || 'N/A'}</p>
                  </div>
                </td>
                <td>
                  <span className={`status-label ${upload.status === 'Seen' ? 'seen' : 'unseen'}`}>
                    {upload.status === 'Seen' ? 'Seen' : 'Unseen'}
                  </span>
                </td>
                <td>
                  <span className={`progress-label ${upload.progress === 'Resolved' ? 'resolved' : 'unresolved'}`}>
                    {upload.progress || 'Unresolved'}
                  </span>
                </td>
                <td>{new Date(upload.uploadedAt).toLocaleDateString()}</td>
                <td>{new Date(upload.uploadedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Pagination Controls */}
      {uploads.length > itemsPerPage && (
        <div className="pagination-controls">
          <button 
            onClick={prevPage} 
            disabled={currentPage === 1}
            className="pagination-button"
          >
            &laquo; Prev
          </button>
          
          <div className="pagination-numbers">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
              <button
                key={number}
                onClick={() => paginate(number)}
                className={`pagination-number ${currentPage === number ? 'active' : ''}`}
              >
                {number}
              </button>
            ))}
          </div>
          
          <button 
            onClick={nextPage} 
            disabled={currentPage === totalPages}
            className="pagination-button"
          >
            Next &raquo;
          </button>
        </div>
      )}

      {/* Image Preview Modal */}
      {selectedImage && (
        <div className="image-preview-modal" onClick={() => setSelectedImage(null)}>
          <div className="image-preview-content image-preview-flex" onClick={e => e.stopPropagation()}>
            <button className="close-button" onClick={() => setSelectedImage(null)}>×</button>
            
            <div className="image-container">
              <img src={selectedImage.imageUrl} alt={selectedImage.imageName} />
            </div>
            
            <div className="image-details">
              <div className="status-indicator">
                <div className={`status-badge-large ${selectedImage.progress === 'Resolved' ? 'resolved' : 'unresolved'}`}>
                  <span className="status-icon">{selectedImage.progress === 'Resolved' ? '✓' : '⟳'}</span>
                  <span className="status-text">{selectedImage.progress === 'Resolved' ? 'Resolved' : 'Not Resolved'}</span>
                </div>
              </div>
              
              <h3>Location Details</h3>
              <div className="location-info">
                <div className="info-row">
                  <span className="info-label">Address:</span>
                  <span className="info-value">{selectedImage.roadLocation?.address || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">District:</span>
                  <span className="info-value">{selectedImage.roadLocation?.district || 'N/A'}</span>
                </div>
                <div className="info-row">
                  <span className="info-label">Pincode:</span>
                  <span className="info-value">{selectedImage.roadLocation?.pincode || 'N/A'}</span>
                </div>
              </div>
              
              <h3>Damage Description</h3>
              <div className="damage-description-info">
                <div className="description-content">
                  {selectedImage.damageDescription || 'No description provided'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileDisplay({ userEmail }) {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/user?email=${encodeURIComponent(userEmail)}`);
        const data = await response.json();

        if (data.success && data.user) {
          setUserData(data.user);
        } else {
          setError(data.error || "Failed to fetch profile data");
        }
      } catch (error) {
        console.error('Failed to fetch profile:', error);
        setError("Failed to connect to the server");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userEmail]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading profile data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="empty-state">
        <h3>No Profile Data</h3>
        <p>Unable to load profile information.</p>
      </div>
    );
  }

  return (
    <div className="profile-display-card">
      <h2>My Profile</h2>
      <div className="profile-field">
        <span className="profile-label">First Name:</span>
        <span className="profile-value">{userData.firstName || 'N/A'}</span>
      </div>
      <div className="profile-field">
        <span className="profile-label">Last Name:</span>
        <span className="profile-value">{userData.lastName || 'N/A'}</span>
      </div>
      <div className="profile-field">
        <span className="profile-label">Email:</span>
        <span className="profile-value">{userData.email || 'N/A'}</span>
      </div>
      <div className="profile-field">
        <span className="profile-label">Phone Number:</span>
        <span className="profile-value">{userData.phoneNumber || 'N/A'}</span>
      </div>
    </div>
  );
}

export default UploadPage;
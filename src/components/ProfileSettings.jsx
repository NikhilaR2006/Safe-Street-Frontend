import React, { useState, useEffect } from "react";
import "./ProfileSettings.css";

const ProfileSettings = () => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const email = localStorage.getItem('email');
        if (!email) {
          setError('No user email found');
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:5000/api/user?email=${encodeURIComponent(email)}`);
        const data = await response.json();

        if (data.success && data.user) {
          setUserData(data.user);
        } else {
          setError(data.error || 'Failed to fetch user data');
        }
      } catch (err) {
        console.error('Error fetching user data:', err);
        setError('Failed to connect to server');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  if (loading) {
    return (
      <div className="profile-settings-container">
        <div className="loading-message">Loading profile data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-settings-container">
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="profile-settings-container">
        <div className="error-message">No user data found</div>
      </div>
    );
  }

  const profileInitials = `${userData.firstName.charAt(0)}${userData.lastName.charAt(0)}`.toUpperCase();

  return (
    <div className="profile-settings-container">
      <div className="profile-card">
        <h2 className="profile-title">Profile Information</h2>
        <div className="profile-pic-circle">
          <div className="profile-placeholder">{profileInitials}</div>
        </div>
        <div className="user-info">
          <div className="info-item">
            <div className="info-label">First name</div>
            <div className="info-value">{userData.firstName}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Last name</div>
            <div className="info-value">{userData.lastName}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Email</div>
            <div className="info-value">{userData.email}</div>
          </div>
          <div className="info-item">
            <div className="info-label">Phone number</div>
            <div className="info-value">{userData.phoneNumber}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSettings;

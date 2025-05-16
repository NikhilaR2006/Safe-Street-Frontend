import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Home, Eye, EyeOff, Loader2, ArrowRight, AlertCircle, User, Mail, Lock, Shield } from 'lucide-react';
import './LoginRegister.css';

const LoginRegister = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [userType, setUserType] = useState('user');
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    email: '',
    password: '',
    confirmPassword: '',
    authorityCode: ''
  });
  const [formValid, setFormValid] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  const VALID_AUTHORITY_CODE = 'AUTH123';

  const validateForm = useCallback(() => {
    const { email, password, firstName, lastName, phoneNumber, confirmPassword, authorityCode } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    let isValid = false;

    if (isRegistering) {
      if (userType === 'authority') {
        // For authority users, only validate basic fields and authority code
        isValid = emailRegex.test(email) && 
                 password.length >= 4 && 
                 firstName.trim() && 
                 lastName.trim() && 
                 phoneNumber.trim() &&
                 authorityCode === VALID_AUTHORITY_CODE;
      } else {
        // For regular users, validate all fields including address
        isValid = emailRegex.test(email) && 
                 password.length >= 4 && 
                 firstName.trim() && 
                 lastName.trim() && 
                 phoneNumber.trim() &&
                 password === confirmPassword;
      }
    } else {
      // For login, only validate email, password, and authority code if authority
      if (userType === 'authority') {
        isValid = emailRegex.test(email) && 
                 password.length >= 4 && 
                 authorityCode === VALID_AUTHORITY_CODE;
      } else {
        isValid = emailRegex.test(email) && 
                 password.length >= 4;
      }
    }
    setFormValid(isValid);
  }, [formData, isRegistering, userType, VALID_AUTHORITY_CODE]);

  useEffect(() => {
    validateForm();
  }, [validateForm]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate authority code for both login and registration
    if (userType === 'authority' && formData.authorityCode !== VALID_AUTHORITY_CODE) {
      setError('Invalid authority code! Please check and try again.');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isRegistering 
        ? 'http://localhost:5000/api/auth/register' 
        : 'http://localhost:5000/api/auth/login';
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userType
        })
      });

      const data = await response.json();
      console.log('Response:', data);

      if (!response.ok) {
        // Handle specific error cases
        if (response.status === 401) {
          throw new Error('Invalid email or password. Please check your credentials and try again.');
        } else if (response.status === 404) {
          throw new Error('User not found. Please check your email or sign up if you don\'t have an account.');
        } else if (response.status === 409) {
          throw new Error('An account with this email already exists. Please log in instead.');
        } else if (response.status === 400) {
          throw new Error(data.error || 'Please check your input and try again.');
        } else {
          throw new Error(data.error || 'Something went wrong. Please try again later.');
        }
      }

      if (isRegistering) {
        // Handle registration success
        setSuccessMessage('Registration successful! Please log in.');
        setIsRegistering(false);
        // Keep the email and userType, clear other fields
        setFormData({
          firstName: '',
          lastName: '',
          phoneNumber: '',
          email: formData.email, // Keep the email
          password: '',
          confirmPassword: '',
          authorityCode: ''
        });
        // If registered as authority, keep the authority type
        if (userType === 'authority') {
          setUserType('authority');
        } else {
          setUserType('user');
        }
      } else {
        // Handle login success
        console.log('Login response data:', data);

        // Validate that the user type matches the login attempt
        if (data.userType !== userType) {
          throw new Error(`Invalid credentials for ${userType} login. Please use the correct account type.`);
        }

        // Store user information
        localStorage.setItem('email', data.email);
        localStorage.setItem('userType', data.userType);
        if (data.firstName) localStorage.setItem('firstName', data.firstName);
        if (data.lastName) localStorage.setItem('lastName', data.lastName);
        if (data.phoneNumber) localStorage.setItem('phoneNumber', data.phoneNumber);

        console.log('Stored user type:', data.userType);
        
        // Navigate based on user type
        if (data.userType === 'authority') {
          console.log('Navigating to authority page');
          window.location.href = '/authority';
        } else {
          console.log('Navigating to upload page');
          window.location.href = '/upload';
        }
      }
    } catch (err) {
      console.error('Error:', err);
      setError(err.message || 'Failed to connect to the server. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <Link to="/" className="home-button">
          <Home size={20} />
        </Link>

        <div className="auth-header">
          <div className="auth-icon">
            {isRegistering ? <User size={80} /> : <img src="/Logo.png" alt="SafeStreet Logo" style={{ width: '150px', height: '150px' }} />}
          </div>
          <h1 className="auth-title">SafeStreet</h1>
          <h2 className="auth-subtitle">Road Damage Detection</h2>
        </div>

        {error && (
          <div className="error-message">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}

        {successMessage && (
          <div className="success-message">
            <span>{successMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <div>
              <label className="input-label">Account Type</label>
              <div className="input-wrapper">
                <User className="input-icon" />
                <select
                  name="userType"
                  value={userType}
                  onChange={(e) => {
                    setUserType(e.target.value);
                    // Clear form when switching user types
                    setFormData({
                      firstName: '',
                      lastName: '',
                      phoneNumber: '',
                      email: '',
                      password: '',
                      confirmPassword: '',
                      authorityCode: ''
                    });
                  }}
                  className="form-input"
                >
                  <option value="user">User</option>
                  <option value="authority">Authority</option>
                </select>
              </div>
            </div>

            {isRegistering && (
              <>
                <div>
                  <label className="input-label">First Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon" />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter your first name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Last Name</label>
                  <div className="input-wrapper">
                    <User className="input-icon" />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter your last name"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="input-label">Phone Number</label>
                  <div className="input-wrapper">
                    <User className="input-icon" />
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleChange}
                      className="form-input"
                      placeholder="Enter your phone number"
                      required
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="input-label">Email Address</label>
              <div className="input-wrapper">
                <Mail className="input-icon" />
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your email"
                  required
                />
              </div>
            </div>

            <div>
              <label className="input-label">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="form-input"
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="password-toggle"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {isRegistering && (
              <div>
                <label className="input-label">Confirm Password</label>
                <div className="input-wrapper">
                  <Lock className="input-icon" />
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Confirm your password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="password-toggle"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            )}

            {userType === 'authority' && (
              <div>
                <label className="input-label">Authority Code</label>
                <div className="input-wrapper">
                  <Shield className="input-icon" />
                  <input
                    type="text"
                    name="authorityCode"
                    value={formData.authorityCode}
                    onChange={handleChange}
                    className="form-input"
                    placeholder="Enter authority code"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!formValid || loading}
            className="auth-button"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              <>
                {isRegistering ? 'Sign Up' : 'Log In'}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        <div className="toggle-account">
          {isRegistering ? (
            <>
              Already have an account?{' '}
              <button
                onClick={() => setIsRegistering(false)}
                className="toggle-button"
              >
                Log in
              </button>
            </>
          ) : (
            <>
              Don't have an account?{' '}
              <button
                onClick={() => setIsRegistering(true)}
                className="toggle-button"
              >
                Sign up
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default LoginRegister;
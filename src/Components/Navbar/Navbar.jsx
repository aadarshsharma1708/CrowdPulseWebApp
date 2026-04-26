import React, { useState, useContext } from "react";
import "./Navbar.css";
import { AuthContext } from "../../context/AuthContext";

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [authMode, setAuthMode] = useState(null); // 'signup' or 'login'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [verificationStep, setVerificationStep] = useState(false);
  const [tempEmail, setTempEmail] = useState("");

  const { isAuthenticated, user, logout, signUp, verifyEmail, login } =
    useContext(AuthContext);

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!email || !password || !confirmPassword) {
        setError("Please fill in all fields");
        return;
      }

      if (password !== confirmPassword) {
        setError("Passwords do not match");
        return;
      }

      if (password.length < 8) {
        setError("Password must be at least 8 characters");
        return;
      }

      await signUp(email, password);
      setTempEmail(email);
      setVerificationStep(true);
      setError("");
    } catch (err) {
      setError(err.message || "Sign up failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!otp) {
        setError("Please enter the OTP");
        return;
      }

      await verifyEmail(tempEmail, otp);
      setVerificationStep(false);
      setAuthMode(null);
      setEmail("");
      setPassword("");
      setConfirmPassword("");
      setOtp("");
      alert("Email verified! You can now log in.");
    } catch (err) {
      setError(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (!email || !password) {
        setError("Please fill in all fields");
        return;
      }

      await login(email, password);
      setAuthMode(null);
      setEmail("");
      setPassword("");
      setIsMenuOpen(false);
    } catch (err) {
      setError(err.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="navbar">
      <div className="logo">
        <span className="logo-icon">📊</span>
        CrowdPulse
      </div>

      <button
        className="menu-toggle"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
      >
        <span className={`hamburger ${isMenuOpen ? "active" : ""}`}></span>
      </button>

      <div className={`nav-links ${isMenuOpen ? "active" : ""}`}>
        <a href="/" className="nav-link">
          Home
        </a>
        <a href="/createPoll" className="nav-link">
          Create Poll
        </a>
        <a href="#" className="nav-link">
          My Polls
        </a>

        {isAuthenticated ? (
          <div className="auth-section">
            <span className="user-email">{user?.email}</span>
            <button
              className="logout-btn"
              onClick={() => {
                logout();
                setIsMenuOpen(false);
              }}
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <button
              className="signup-btn"
              onClick={() => {
                setAuthMode("signup");
                setVerificationStep(false);
              }}
            >
              Sign Up
            </button>
            <button
              className="login-btn"
              onClick={() => {
                setAuthMode("login");
                setVerificationStep(false);
              }}
            >
              Login
            </button>
          </>
        )}
      </div>

      {/* AUTH MODAL */}
      {authMode && (
        <div
          className="modal-overlay"
          onClick={() => {
            setAuthMode(null);
            setVerificationStep(false);
          }}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-modal"
              onClick={() => {
                setAuthMode(null);
                setVerificationStep(false);
              }}
            >
              ×
            </button>

            {authMode === "signup" && !verificationStep ? (
              <>
                <h3>Create Account</h3>
                <form onSubmit={handleSignupSubmit}>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                  <input
                    type="password"
                    placeholder="Password (min. 8 characters)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  <input
                    type="password"
                    placeholder="Confirm Password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                  />
                  {error && <p className="error">{error}</p>}
                  <button type="submit" disabled={loading}>
                    {loading ? "Creating Account..." : "Sign Up"}
                  </button>
                </form>
              </>
            ) : authMode === "signup" && verificationStep ? (
              <>
                <h3>Verify Email</h3>
                <p>We've sent an OTP to {tempEmail}</p>
                <form onSubmit={handleVerifySubmit}>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    disabled={loading}
                  />
                  {error && <p className="error">{error}</p>}
                  <button type="submit" disabled={loading}>
                    {loading ? "Verifying..." : "Verify"}
                  </button>
                </form>
              </>
            ) : authMode === "login" ? (
              <>
                <h3>Login</h3>
                <form onSubmit={handleLoginSubmit}>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                  />
                  {error && <p className="error">{error}</p>}
                  <button type="submit" disabled={loading}>
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>
              </>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}

export default Navbar;

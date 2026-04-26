import React from "react";
import "./create_poll.css";
import { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { createPoll } from "../../services/apiService";
import { AuthContext } from "../../context/AuthContext";
import { savePollLocally } from "../../utils/storageUtil";

function Create_poll() {
  const navigate = useNavigate();
  const { isAuthenticated, idToken, login } = useContext(AuthContext);
  const [question, setQuestion] = useState("");
  const [choices, setChoices] = useState(["", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  // handle option change
  const handleChoiceChange = (value, index) => {
    const updated = [...choices];
    updated[index] = value;
    setChoices(updated);
  };

  // add new option
  const addChoice = () => {
    setChoices([...choices, ""]);
  };

  // Handle quick login for poll creation
  const handleQuickLogin = async () => {
    setLoading(true);
    setError("");

    try {
      if (!authEmail || !authPassword) {
        setError("Please enter email and password");
        return;
      }

      await login(authEmail, authPassword);
      setShowAuthModal(false);
      setAuthEmail("");
      setAuthPassword("");
      // Will proceed to create poll after auth
    } catch (err) {
      setError(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // create poll button
  const handleCreatePoll = async () => {
    const trimmedQuestion = question.trim();
    const validChoices = choices.map((choice) => choice.trim()).filter(Boolean);

    if (!trimmedQuestion || validChoices.length < 2) {
      setError("Please enter a question and at least two choices.");
      return;
    }

    // Check if authenticated
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }

    setLoading(true);
    setError("");

    try {
      const pollData = {
        title: trimmedQuestion, // question
        choices: validChoices, // options
      };
      console.log("Creating poll with data:", pollData);

      const response = await createPoll(pollData, idToken);
      const { poll } = response;
      console.log("Poll created with ID:", poll.pollId);

      // Save poll to local storage as backup
      savePollLocally(poll);

      // Navigate to LivePoll with the poll ID
      navigate(`/LivePoll/${poll.pollId}`);
    } catch (err) {
      setError(err.message || "Failed to create poll. Please try again.");
      console.error("Error creating poll:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-page">
      {/* AUTH MODAL */}
      {showAuthModal && (
        <div className="modal-overlay" onClick={() => setShowAuthModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Sign In to Create a Poll</h3>
            <p>You need to be logged in to create polls.</p>

            <input
              type="email"
              placeholder="Email"
              value={authEmail}
              onChange={(e) => setAuthEmail(e.target.value)}
              disabled={loading}
            />
            <input
              type="password"
              placeholder="Password"
              value={authPassword}
              onChange={(e) => setAuthPassword(e.target.value)}
              disabled={loading}
            />

            {error && <p className="error-message">{error}</p>}

            <div className="modal-buttons">
              <button
                className="login-btn"
                onClick={handleQuickLogin}
                disabled={loading}
              >
                {loading ? "Logging in..." : "Login"}
              </button>
              <button
                className="cancel-btn"
                onClick={() => setShowAuthModal(false)}
                disabled={loading}
              >
                Cancel
              </button>
            </div>

            <p className="signup-note">
              Don't have an account? Sign up first using the navbar.
            </p>
          </div>
        </div>
      )}

      {/* FORM CARD */}
      <div className="create-container">
        <h2>Create a New Poll</h2>

        {error && <p className="error-message">{error}</p>}

        {/* QUESTION */}
        <label>Enter your question</label>
        <input
          type="text"
          placeholder="Enter your question"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={loading}
        />

        {/* OPTIONS */}
        {choices.map((choice, index) => (
          <input
            key={index}
            type="text"
            placeholder={`Choice ${index + 1}`}
            value={choice}
            onChange={(e) => handleChoiceChange(e.target.value, index)}
            disabled={loading}
          />
        ))}

        {/* ADD CHOICE */}
        <button className="add-btn" onClick={addChoice} disabled={loading}>
          + Add Choice
        </button>

        {/* CREATE POLL */}
        <button
          className="create-btn"
          onClick={handleCreatePoll}
          disabled={loading}
        >
          {loading ? "Creating..." : "Create Poll & Get Link"}
        </button>

        <p className="info-text">
          Your poll will be live instantly for sharing.
        </p>
      </div>
    </div>
  );
}

export default Create_poll;

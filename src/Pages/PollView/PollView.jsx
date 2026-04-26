import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./PollView.css";
import { getPollDetails, castVote } from "../../services/apiService";
import { getOrCreateFingerprint } from "../../utils/fingerprintService";
import {
  savePollLocally,
  getPollLocally,
  saveVoterDetailsLocally,
  hasUserVoted,
  markAsVoted,
} from "../../utils/storageUtil";

function PollView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(false);
  const [votingLoading, setVotingLoading] = useState(false);
  const [name, setName] = useState("");
  const [rollNumber, setRollNumber] = useState("");
  const [detailsSubmitted, setDetailsSubmitted] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [message, setMessage] = useState("");
  const [fingerprint, setFingerprint] = useState(null);

  // Fetch poll details
  useEffect(() => {
    const fetchPoll = async () => {
      setLoading(true);
      try {
        const pollData = await getPollDetails(id);
        setPoll(pollData.poll || pollData);
        savePollLocally(pollData.poll || pollData);

        // Check if user has already voted
        const fp = getOrCreateFingerprint();
        setFingerprint(fp);

        if (hasUserVoted(id, fp)) {
          setHasVoted(true);
          setDetailsSubmitted(true);
        }
      } catch (err) {
        console.error("Error fetching poll:", err);
        // Try to load from localStorage as fallback
        const localPoll = getPollLocally(id);
        if (localPoll) {
          setPoll(localPoll);
          setMessage("Loaded poll from cache");
        } else {
          setMessage("Poll not found or network error");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchPoll();
  }, [id]);

  const handleSubmitDetails = (e) => {
    e.preventDefault();

    if (!name.trim() || !rollNumber.trim()) {
      setMessage("Please enter both name and roll number.");
      return;
    }

    const voterDetails = {
      name: name.trim(),
      rollNumber: rollNumber.trim(),
    };

    saveVoterDetailsLocally(id, voterDetails);
    setDetailsSubmitted(true);
    setMessage("");
  };

  const handleVote = async () => {
    if (selectedOption === null) {
      setMessage("Please select an option before voting.");
      return;
    }

    setVotingLoading(true);
    setMessage("");

    try {
      const optionId =
        poll.options[selectedOption]?.id || `option_${selectedOption}`;

      // Call API to cast vote
      await castVote(id, optionId, fingerprint);

      // Mark as voted locally
      markAsVoted(id, fingerprint);

      setHasVoted(true);
      setMessage("✅ Thanks! Your vote has been recorded successfully.");
    } catch (err) {
      console.error("Error casting vote:", err);

      // Check if it's a duplicate vote error
      if (err.message.includes("already voted")) {
        setHasVoted(true);
        setMessage("⚠️ You have already voted on this poll.");
      } else {
        setMessage("❌ Failed to record your vote. Please try again.");
      }
    } finally {
      setVotingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="poll-view-page">
        <div className="poll-view-card">
          <p>Loading poll...</p>
        </div>
      </div>
    );
  }

  if (!poll) {
    return (
      <div className="poll-view-page">
        <div className="poll-view-card">
          <h2>Poll not found</h2>
          <p>
            We could not load the poll for this link. Make sure the link is
            correct or create a poll again.
          </p>
          <button onClick={() => navigate("/")}>Go to Home</button>
        </div>
      </div>
    );
  }

  return (
    <div className="poll-view-page">
      <div className="poll-view-card">
        {!detailsSubmitted ? (
          <form className="details-form" onSubmit={handleSubmitDetails}>
            <h3>Verify Your Details</h3>
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your name"
              disabled={loading}
            />

            <label>Roll Number</label>
            <input
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value)}
              placeholder="Enter your roll number"
              disabled={loading}
            />

            {message && <p className="message">{message}</p>}

            <button type="submit" className="submit-btn" disabled={loading}>
              Continue to Vote
            </button>
          </form>
        ) : (
          <div className="poll-details">
            <h3>{poll.title}</h3>
            <div className="options-list">
              {poll.options &&
                poll.options.map((option, index) => (
                  <label
                    key={index}
                    className={`option-item ${selectedOption === index ? "selected" : ""}`}
                  >
                    <input
                      type="radio"
                      name="poll-option"
                      checked={selectedOption === index}
                      onChange={() => setSelectedOption(index)}
                      disabled={hasVoted || votingLoading}
                    />
                    <span>{option.label}</span>
                    <span className="vote-count">
                      ({option.votes || 0} votes)
                    </span>
                  </label>
                ))}
            </div>

            {message && (
              <p
                className={`message ${message.includes("✅") ? "success" : message.includes("❌") ? "error" : ""}`}
              >
                {message}
              </p>
            )}

            {!hasVoted ? (
              <button
                className="vote-btn"
                onClick={handleVote}
                disabled={votingLoading}
              >
                {votingLoading ? "Recording vote..." : "Cast Vote"}
              </button>
            ) : (
              <div className="vote-success">✓ Your vote has been recorded.</div>
            )}

            <button className="back-btn" onClick={() => navigate("/")}>
              
              Back to Home
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default PollView;

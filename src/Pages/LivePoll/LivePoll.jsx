import React, { useState, useEffect } from "react";
import "./LivePoll.css";
import { QRCodeCanvas } from "qrcode.react";
import { useNavigate, useParams } from "react-router-dom";
import { getPollDetails } from "../../services/apiService";
import { getPollLocally, savePollLocally } from "../../utils/storageUtil";

function LivePoll() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [pollLink, setPollLink] = useState("");
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const pollId = id || Math.random().toString(36).substring(2, 10);
    const link = `${window.location.origin}/poll/${pollId}`;
    setPollLink(link);

    // Fetch poll details from API
    if (id) {
      fetchPollDetails(pollId);
    }
  }, [id]);

  const fetchPollDetails = async (pollId) => {
    setLoading(true);
    try {
      const pollData = await getPollDetails(pollId);
      const poll = pollData.poll || pollData;
      setPoll(poll);
      savePollLocally(poll);
    } catch (err) {
      console.error("Error fetching poll details:", err);
      // Try to load from localStorage
      const localPoll = getPollLocally(pollId);
      if (localPoll) {
        setPoll(localPoll);
      }
    } finally {
      setLoading(false);
    }
  };

  // copy link
  const copyLink = () => {
    navigator.clipboard.writeText(pollLink);
    alert("Link copied!");
  };

  return (
    <div className="live-page">
      {/* CARD */}
      <div className="live-container">
        <div className="success-icon">✅</div>

        <h2>Your Poll is Live!</h2>
        <p className="subtitle">
          Share your poll with others to gather responses.
        </p>

        {/* LINK + COPY */}
        <div className="link-box">
          <input value={pollLink} readOnly />
          <button onClick={copyLink}>Copy Link</button>
        </div>

        {/* QR CODE */}
        <div className="qr-box">
          {pollLink && <QRCodeCanvas value={pollLink} size={150} />}
        </div>

        {loading ? (
          <p className="loading">Loading poll details...</p>
        ) : poll ? (
          <div className="poll-summary">
            <p className="poll-preview-label">Poll preview</p>
            <h4>{poll.title}</h4>
            <div className="preview-options">
              {poll.options &&
                poll.options.map((option, index) => (
                  <div key={index} className="preview-option">
                    • {option.label}
                  </div>
                ))}
            </div>
          </div>
        ) : null}

        {/* ACTION BUTTONS */}
        <div className="action-buttons">
          <button
            className="primary"
            onClick={() =>
              navigate(`/Results?pollId=${pollLink.split("/").pop()}`)
            }
          >
            Go to Results
          </button>

          <button className="secondary" onClick={() => navigate("/createPoll")}>
            Create Another Poll
          </button>
        </div>
      </div>
    </div>
  );
}

export default LivePoll;

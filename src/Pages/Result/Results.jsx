import React, { useEffect, useState, useCallback, useRef } from "react";
import "./Result.css";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Bar, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { getPollDetails } from "../../services/apiService";
import {
  connectWebSocket,
  disconnectWebSocket,
  addWebSocketListener,
} from "../../services/websocketService";
import { getPollLocally } from "../../utils/storageUtil";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend
);

const PALETTE = [
  "#6366f1",
  "#22d3ee",
  "#f59e0b",
  "#10b981",
  "#f43f5e",
  "#a78bfa",
  "#fb923c",
  "#34d399",
];

function Results() {
  const [searchParams] = useSearchParams();
  const pollId = searchParams.get("pollId");
  const navigate = useNavigate();

  const [pollData, setPollData] = useState({
    labels: [],
    votes: [],
    question: "Loading poll...",
  });
  const [error, setError] = useState("");
  const [wsConnected, setWsConnected] = useState(false);
  const [copied, setCopied] = useState(false);
  const unsubscribeRef = useRef(null);

  const buildState = (poll) => ({
  labels: poll.options ? poll.options.map((o) => o.label) : [],
  votes: poll.options ? poll.options.map((o) => o.votes || 0) : [],
  question: poll.title || "Untitled Poll", // Fallback added here
  pollId: poll.pollId,
});

  const handleWebSocketUpdate = useCallback((data) => {
    if (data.options) {
      setPollData((prev) => ({
        ...prev,
        question: prev.question,
        labels: data.options.map((o) => o.text),
        votes: data.options.map((o) => o.votes || 0),
      }));
    }
  }, []);

  const connectToWebSocket = useCallback(async () => {
    try {
      await connectWebSocket(pollId, handleWebSocketUpdate);
      setWsConnected(true);
      const unsub = addWebSocketListener(handleWebSocketUpdate);
      unsubscribeRef.current = unsub;
    } catch {
      // non-fatal
    }
  }, [pollId, handleWebSocketUpdate]);

  const fetchPollData = useCallback(async () => {
    setError("");
    try {
      const response = await getPollDetails(pollId);
      const poll = response.poll || response;
      setPollData(buildState(poll));
      connectToWebSocket();
    } catch {
      const local = getPollLocally(pollId);
      if (local) {
        setPollData(buildState(local));
        setError("Loaded from cache — live updates may be delayed.");
      } else {
        setError("Failed to load poll. Please try again.");
      }
    }
  }, [pollId, connectToWebSocket]);

  useEffect(() => {
    if (!pollId) {
      setError("No poll ID provided.");
      return;
    }
    fetchPollData();
  }, [pollId, fetchPollData]);

  useEffect(() => {
    return () => {
      disconnectWebSocket();
      if (unsubscribeRef.current) unsubscribeRef.current();
    };
  }, []);
  console.log("PollData : ",pollData)
  const totalVotes = pollData.votes.reduce((a, b) => a + b, 0);

  const pct = (v) =>
    totalVotes === 0 ? 0 : Math.round((v / totalVotes) * 100);

  /* ── Horizontal Bar ── */
  const barData = {
    labels: pollData.labels,
    datasets: [
      {
        label: "Votes",
        data: pollData.votes,
        backgroundColor: PALETTE.slice(0, pollData.labels.length),
        borderRadius: 6,
        borderSkipped: false,
      },
    ],
  };

  const barOptions = {
    indexAxis: "y",
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx) =>
            ` ${ctx.raw} vote${ctx.raw !== 1 ? "s" : ""} (${pct(ctx.raw)}%)`,
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { color: "var(--muted)", stepSize: 1 },
        grid: { color: "var(--grid-line)" },
      },
      y: {
        ticks: { color: "var(--text)", font: { size: 13 } },
        grid: { display: false },
      },
    },
  };

  /* ── Pie ── */
  const pieData = {
    labels: pollData.labels,
    datasets: [
      {
        data: totalVotes === 0 ? pollData.labels.map(() => 1) : pollData.votes,
        backgroundColor: PALETTE.slice(0, pollData.labels.length),
        borderWidth: 2,
        borderColor: "var(--card-bg)",
      },
    ],
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          color: "var(--text)",
          padding: 16,
          font: { size: 12 },
          usePointStyle: true,
          pointStyleWidth: 10,
        },
      },
      tooltip: {
        callbacks: {
          label: (ctx) => {
            const v = totalVotes === 0 ? 0 : ctx.raw;
            return ` ${ctx.label}: ${v} vote${v !== 1 ? "s" : ""} (${pct(v)}%)`;
          },
        },
      },
    },
  };
  
  if (error && !pollData.labels.length) {
    return (
      <div className="rp-page">
        <div className="rp-card rp-error-state">
          <div className="rp-error-icon">⚠</div>
          <p>{error}</p>
          <button className="rp-btn rp-btn-primary" onClick={() => navigate("/")}>
            Go Home
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rp-page">
      <div className="rp-card">

        {/* ── Header ── */}
        <div className="rp-header">
          <div className="rp-header-left">
            <span className="rp-eyebrow">Poll Results</span>
            <h1 className="rp-question">{pollData.question}</h1>
          </div>
          {wsConnected && (
            <span className="rp-live-badge">
              <span className="rp-live-dot" />
              Live
            </span>
          )}
        </div>

        {error && <div className="rp-warning">{error}</div>}

        {/* ── Summary row ── */}
        <div className="rp-summary-row">
          <div className="rp-stat">
            <span className="rp-stat-value">{totalVotes}</span>
            <span className="rp-stat-label">Total Votes</span>
          </div>
          <div className="rp-stat">
            <span className="rp-stat-value">{pollData.labels.length}</span>
            <span className="rp-stat-label">Options</span>
          </div>
          <div className="rp-stat">
            <span className="rp-stat-value">
              {totalVotes === 0
                ? "—"
                : `${pct(Math.max(...pollData.votes))}%`}
            </span>
            <span className="rp-stat-label">Leading Share</span>
          </div>
        </div>

        {/* ── Per-option breakdown ── */}
        <div className="rp-breakdown">
          {pollData.labels.map((label, i) => (
            <div className="rp-option-row" key={`${pollData.pollId}-option-${i}`}>
              <div className="rp-option-meta">
                <span
                  className="rp-option-dot"
                  style={{ background: PALETTE[i % PALETTE.length] }}
                />
                <span className="rp-option-label">{label}</span>
                <span className="rp-option-count">
                  {pollData.votes[i]} vote{pollData.votes[i] !== 1 ? "s" : ""}
                </span>
                <span className="rp-option-pct">{pct(pollData.votes[i])}%</span>
              </div>
              <div className="rp-progress-track">
                <div
                  className="rp-progress-fill"
                  style={{
                    width: `${pct(pollData.votes[i])}%`,
                    background: PALETTE[i % PALETTE.length],
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {/* ── Charts ── */}
        <div className="rp-charts-grid">
          <div className="rp-chart-block">
            <h2 className="rp-chart-title">Vote Distribution</h2>
            <div className="rp-bar-wrap">
              <Bar data={barData} options={barOptions} />
            </div>
          </div>

          <div className="rp-chart-block">
            <h2 className="rp-chart-title">Share Breakdown</h2>
            <div className="rp-pie-wrap">
              <Pie data={pieData} options={pieOptions} />
            </div>
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="rp-actions">
          <button className="rp-btn rp-btn-primary" 
            onClick={() => navigate(`/LivePoll/${pollId}`)}>
            Back to LivePoll
          </button>
          
          <button
            className="rp-btn rp-btn-ghost"
            onClick={() => navigate("/")}
          >
            Create New Poll
          </button>
        </div>

      </div>
    </div>
  );
}

export default Results;
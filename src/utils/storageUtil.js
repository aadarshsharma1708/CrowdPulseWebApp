/**
 * Local Storage Utility - Manages poll data in localStorage
 * These are fallback/cache functions when offline
 */

/**
 * Save poll to local storage (for offline support)
 */
export const savePollLocally = (poll) => {
  try {
    localStorage.setItem(`poll_${poll.pollId}`, JSON.stringify(poll));
  } catch (error) {
    console.error("Error saving poll locally:", error);
  }
};

/**
 * Get poll from local storage
 */
export const getPollLocally = (pollId) => {
  try {
    const poll = localStorage.getItem(`poll_${pollId}`);
    return poll ? JSON.parse(poll) : null;
  } catch (error) {
    console.error("Error getting poll from local storage:", error);
    return null;
  }
};

/**
 * Remove poll from local storage
 */
export const removePollLocally = (pollId) => {
  try {
    localStorage.removeItem(`poll_${pollId}`);
  } catch (error) {
    console.error("Error removing poll from local storage:", error);
  }
};

/**
 * Save voter details locally (for tracking)
 */
export const saveVoterDetailsLocally = (pollId, voterDetails) => {
  try {
    const voters = JSON.parse(localStorage.getItem(`voters_${pollId}`) || "[]");
    voters.push({
      ...voterDetails,
      submittedAt: new Date().toISOString(),
    });
    localStorage.setItem(`voters_${pollId}`, JSON.stringify(voters));
  } catch (error) {
    console.error("Error saving voter details:", error);
  }
};

/**
 * Get voter details from local storage
 */
export const getVoterDetailsLocally = (pollId) => {
  try {
    return JSON.parse(localStorage.getItem(`voters_${pollId}`) || "[]");
  } catch (error) {
    console.error("Error getting voter details:", error);
    return [];
  }
};

/**
 * Check if user has voted in a specific poll (using fingerprint)
 */
export const hasUserVoted = (pollId, fingerprintHash) => {
  try {
    const votedPolls = JSON.parse(
      localStorage.getItem("crowdpulse_voted_polls") || "{}",
    );
    return votedPolls[pollId] === fingerprintHash;
  } catch (error) {
    console.error("Error checking vote status:", error);
    return false;
  }
};

/**
 * Mark user as voted in a poll
 */
export const markAsVoted = (pollId, fingerprintHash) => {
  try {
    const votedPolls = JSON.parse(
      localStorage.getItem("crowdpulse_voted_polls") || "{}",
    );
    votedPolls[pollId] = fingerprintHash;
    localStorage.setItem("crowdpulse_voted_polls", JSON.stringify(votedPolls));
  } catch (error) {
    console.error("Error marking as voted:", error);
  }
};

/**
 * Clear all local poll data (for testing)
 */
export const clearAllLocalPolls = () => {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith("poll_") || key.startsWith("voters_")) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error("Error clearing local polls:", error);
  }
};

export default {
  savePollLocally,
  getPollLocally,
  removePollLocally,
  saveVoterDetailsLocally,
  getVoterDetailsLocally,
  hasUserVoted,
  markAsVoted,
  clearAllLocalPolls,
};

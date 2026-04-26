/**
 * API Service - Handles all HTTP requests to the CrowdPulse backend
 */

const BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://dpqsn2632f.execute-api.ap-south-1.amazonaws.com/Prod";

/**
 * Generic fetch wrapper with error handling
 */
const fetchWithErrorHandling = async (url, options = {}) => {
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
    });

    let data;
    try {
      data = await response.json();
    } catch {
      data = { message: response.statusText };
    }

    if (!response.ok) {
      throw new Error(data.message || `HTTP Error: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("API Error:", error);
    throw error;
  }
};

// ============= AUTHENTICATION APIs =============

/**
 * Sign up a new user
 */
export const signUp = async (email, password) => {
  return fetchWithErrorHandling(`${BASE_URL}/signup`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

/**
 * Verify email with OTP
 */
export const verifyEmail = async (email, code) => {
  return fetchWithErrorHandling(`${BASE_URL}/verify`, {
    method: "POST",
    body: JSON.stringify({ email, code }),
  });
};

/**
 * Login user
 */
export const login = async (email, password) => {
  return fetchWithErrorHandling(`${BASE_URL}/login`, {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

// ============= POLL APIs =============

/**
 * Create a new poll (requires authentication)
 */
export const createPoll = async (pollData, idToken) => {
  return fetchWithErrorHandling(`${BASE_URL}/polls`, {
    method: "POST",
    headers: {
      Authorization: idToken,
    },
    body: JSON.stringify(pollData),
  });
};

/**
 * Get poll details by ID
 */
export const getPollDetails = async (pollId) => {
  return fetchWithErrorHandling(`${BASE_URL}/polls/${pollId}`, {
    method: "GET",
  });
};

/**
 * Cast a vote on a poll
 */
export const castVote = async (pollId, choiceId, fingerprintHash) => {
  return fetchWithErrorHandling(`${BASE_URL}/polls/${pollId}/vote`, {
    method: "POST",
    body: JSON.stringify({ choiceId, fingerprintHash }),
  });
};

/**
 * Get all polls (optional - for listing polls)
 */
export const getAllPolls = async () => {
  return fetchWithErrorHandling(`${BASE_URL}/polls`, {
    method: "GET",
  });
};

/**
 * Delete a poll (requires authentication and ownership)
 */
export const deletePoll = async (pollId, idToken) => {
  return fetchWithErrorHandling(`${BASE_URL}/polls/${pollId}`, {
    method: "DELETE",
    headers: {
      Authorization: idToken,
    },
  });
};

export default {
  // Auth
  signUp,
  verifyEmail,
  login,

  // Polls
  createPoll,
  getPollDetails,
  castVote,
  getAllPolls,
  deletePoll,
};

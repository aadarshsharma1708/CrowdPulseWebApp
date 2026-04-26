/**
 * WebSocket Service - Handles real-time poll updates
 */

let ws = null;
let listeners = [];

/**
 * Connect to WebSocket for real-time poll updates
 */
export const connectWebSocket = (pollId, onMessageCallback) => {
  return new Promise((resolve, reject) => {
    try {
      const WS_URL =
        import.meta.env.VITE_WS_URL;

      // Using pollId in the URL as per API documentation
      const wsUrl = `${WS_URL}?pollId=${pollId}`;

      ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("WebSocket connected for poll:", pollId);
        resolve(ws);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          console.log("WebSocket received:", data);

          // Call the provided callback with the update
          if (onMessageCallback) {
            onMessageCallback(data);
          }

          // Notify all registered listeners
          listeners.forEach((listener) => listener(data));
        } catch (error) {
          console.error("Error parsing WebSocket message:", error);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        reject(error);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        ws = null;
      };
    } catch (error) {
      console.error("Error connecting to WebSocket:", error);
      reject(error);
    }
  });
};

/**
 * Disconnect from WebSocket
 */
export const disconnectWebSocket = () => {
  if (ws) {
    ws.close();
    ws = null;
    listeners = [];
  }
};

/**
 * Send message through WebSocket
 */
export const sendWebSocketMessage = (data) => {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(data));
  } else {
    console.warn("WebSocket is not connected");
  }
};

/**
 * Register a listener for WebSocket messages
 */
export const addWebSocketListener = (callback) => {
  listeners.push(callback);

  // Return unsubscribe function
  return () => {
    listeners = listeners.filter((l) => l !== callback);
  };
};

/**
 * Check if WebSocket is connected
 */
export const isWebSocketConnected = () => {
  return ws && ws.readyState === WebSocket.OPEN;
};

/**
 * Get current WebSocket instance (read-only)
 */
export const getWebSocketInstance = () => {
  return ws;
};

export default {
  connectWebSocket,
  disconnectWebSocket,
  sendWebSocketMessage,
  addWebSocketListener,
  isWebSocketConnected,
  getWebSocketInstance,
};

/**
 * Fingerprint Service - Generates unique browser fingerprints to prevent double voting
 */

export const generateFingerprint = () => {
  try {
    // Collect browser/device information
    const fingerprint = {
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      hardwareConcurrency: navigator.hardwareConcurrency || "unknown",
      deviceMemory: navigator.deviceMemory || "unknown",
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvas: getCanvasFingerprint(),
      screen: {
        width: window.screen.width,
        height: window.screen.height,
        colorDepth: window.screen.colorDepth,
        pixelDepth: window.screen.pixelDepth,
      },
      plugins: getPluginsString(),
    };

    // Create a hash from the fingerprint
    return hashObject(fingerprint);
  } catch (error) {
    console.error("Error generating fingerprint:", error);
    // Fallback to random ID if fingerprint fails
    return `fallback_${Math.random().toString(36).substring(2, 15)}`;
  }
};

/**
 * Get stored fingerprint or create a new one
 */
export const getOrCreateFingerprint = () => {
  const storedFingerprint = localStorage.getItem("crowdpulse_fingerprint");
  if (storedFingerprint) {
    return storedFingerprint;
  }

  const newFingerprint = generateFingerprint();
  localStorage.setItem("crowdpulse_fingerprint", newFingerprint);
  return newFingerprint;
};

/**
 * Get canvas fingerprint using HTML5 canvas
 */
const getCanvasFingerprint = () => {
  try {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const text = "CrowdPulse";
    ctx.textBaseline = "top";
    ctx.font = "14px Arial";
    ctx.textBaseline = "alphabetic";
    ctx.fillStyle = "#f60";
    ctx.fillRect(125, 1, 62, 20);
    ctx.fillStyle = "#069";
    ctx.fillText(text, 2, 15);
    ctx.fillStyle = "rgba(102, 204, 0, 0.7)";
    ctx.fillText(text, 4, 17);
    return canvas.toDataURL();
  } catch {
    return "canvas_not_available";
  }
};

/**
 * Get plugins string
 */
const getPluginsString = () => {
  try {
    const plugins = Array.from(navigator.plugins)
      .map((p) => p.name)
      .join(",");
    return plugins || "no_plugins";
  } catch {
    return "plugins_not_available";
  }
};

/**
 * Simple hash function for fingerprint object
 */
const hashObject = (obj) => {
  let str = JSON.stringify(obj);
  let hash = 0;
  let i, chr;

  for (i = 0; i < str.length; i++) {
    chr = str.charCodeAt(i);
    hash = (hash << 5) - hash + chr;
    hash = hash & hash; // Convert to 32bit integer
  }

  return Math.abs(hash).toString(16);
};

/**
 * Clear stored fingerprint (for testing)
 */
export const clearFingerprint = () => {
  localStorage.removeItem("crowdpulse_fingerprint");
};

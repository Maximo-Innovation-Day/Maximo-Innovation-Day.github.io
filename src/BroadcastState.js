// BroadcastState.js
// Utility for synchronizing state across tabs using BroadcastChannel API

const CHANNEL_NAME = "puzzle-state-sync";
let broadcastChannel = null;

// Initialize the broadcast channel
const initChannel = () => {
  if (!broadcastChannel && window.BroadcastChannel) {
    try {
      broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
    } catch (error) {
      console.error("Failed to create BroadcastChannel:", error);
    }
  }
  return broadcastChannel;
};

// Close the broadcast channel
const closeChannel = () => {
  if (broadcastChannel) {
    broadcastChannel.close();
    broadcastChannel = null;
  }
};

// Send a state update to all tabs
const broadcastUpdate = (key, value) => {
  if (!broadcastChannel) {
    initChannel();
  }
  
  if (broadcastChannel) {
    broadcastChannel.postMessage({
      type: "state-update",
      key,
      value,
      timestamp: Date.now()
    });
    
    // Also update localStorage for persistence
    localStorage.setItem(key, typeof value === 'object' ? JSON.stringify(value) : value);
  }
};

// Subscribe to state updates
const subscribeToUpdates = (callback) => {
  if (!broadcastChannel) {
    initChannel();
  }
  
  if (broadcastChannel) {
    broadcastChannel.onmessage = (event) => {
      if (event.data && event.data.type === "state-update") {
        callback(event.data.key, event.data.value);
      }
    };
  }
  
  return () => {
    if (broadcastChannel) {
      broadcastChannel.onmessage = null;
    }
  };
};

// Custom event for specific actions
const broadcastEvent = (eventName, data = {}) => {
  if (!broadcastChannel) {
    initChannel();
  }
  
  if (broadcastChannel) {
    broadcastChannel.postMessage({
      type: "event",
      eventName,
      data,
      timestamp: Date.now()
    });
    
    // Also dispatch a DOM event for components in the same tab
    window.dispatchEvent(new CustomEvent(eventName, { detail: data }));
  }
};

// Subscribe to custom events
const subscribeToEvent = (eventName, callback) => {
  if (!broadcastChannel) {
    initChannel();
  }
  
  // Handler for broadcast channel messages
  const messageHandler = (event) => {
    if (event.data && event.data.type === "event" && event.data.eventName === eventName) {
      callback(event.data.data);
    }
  };
  
  // Handler for DOM events
  const domEventHandler = (event) => {
    callback(event.detail);
  };
  
  if (broadcastChannel) {
    broadcastChannel.addEventListener("message", messageHandler);
  }
  
  window.addEventListener(eventName, domEventHandler);
  
  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener("message", messageHandler);
    }
    window.removeEventListener(eventName, domEventHandler);
  };
};

// Clear all session data from localStorage
const clearSessionData = () => {
  // Clear specific keys rather than all localStorage
  localStorage.removeItem("teamName");
  localStorage.removeItem("timeLeft");
  
  // Broadcast a special event to notify all tabs that session was reset
  broadcastEvent('sessionReset');
  
  console.log("Session data cleared");
};

export {
  broadcastUpdate,
  subscribeToUpdates,
  broadcastEvent,
  subscribeToEvent,
  closeChannel,
  clearSessionData
};
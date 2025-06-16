import React, { useState, useEffect } from "react";
import "./Intermission.css";
import { subscribeToUpdates, subscribeToEvent } from "./BroadcastState";

function Intermission() {
  const [teamName, setTeamName] = useState("");
  const [countdown, setCountdown] = useState(10);

  useEffect(() => {
    // Retrieve team name from localStorage when component mounts
    const storedTeamName = localStorage.getItem("teamName");
    if (storedTeamName) {
      setTeamName(storedTeamName);
    }
    
    // Subscribe to teamName updates from other tabs
    const unsubscribeFromUpdates = subscribeToUpdates((key, value) => {
      if (key === "teamName") {
        setTeamName(value);
      }
    });
    
    // Listen for sessionReset event
    const unsubscribeFromReset = subscribeToEvent('sessionReset', () => {
      console.log("Received sessionReset event in Intermission component");
      setTeamName("");
      // Return to hub
      window.location.hash = "";
    });
    
    // Start the countdown
    const timer = setInterval(() => {
      setCountdown((prevTime) => {
        const newTime = prevTime - 1;
        
        // When countdown reaches 0, navigate to scoreboard
        if (newTime <= 0) {
          clearInterval(timer);
          window.location.hash = "#scoreboard";
        }
        
        return newTime;
      });
    }, 1000);
    
    // Clean up timer and subscription on unmount
    return () => {
      clearInterval(timer);
      unsubscribeFromUpdates();
      unsubscribeFromReset();
    };
  }, []);

  return (
    <div className="Intermission">
      <div className="title">
        <p>So, how did {teamName} do?</p>
      </div>
      <div className="countdown">
        <p>Scoreboard in:</p>
        <div className="countdown-number">{countdown}</div>
      </div>
    </div>
  );
}

export default Intermission;
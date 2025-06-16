import './puzzles/caesar/caesar.css';
import React, { useState, useEffect } from 'react';
import { broadcastUpdate, subscribeToUpdates, subscribeToEvent } from './BroadcastState';

const GAME_TIME = 30;

function Countdown() {
  const [isRunning, setIsRunning] = useState(true);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME * 60 * 1000);
  const [teamName, setTeamName] = useState('');

  useEffect(() => {
    // Retrieve team name from localStorage when component mounts
    const storedTeamName = localStorage.getItem('teamName');
    if (storedTeamName) {
      setTeamName(storedTeamName);
    }

    // Subscribe to teamName updates from other tabs
    const unsubscribeFromUpdates = subscribeToUpdates((key, value) => {
      if (key === 'teamName') {
        setTeamName(value);
      }
    });

    // Listen for stopTimer event through BroadcastChannel
    const unsubscribeFromStopTimer = subscribeToEvent('stopTimer', () => {
      console.log('Received stopTimer event in Countdown component');
      setIsRunning(false);
      // Update timeLeft in localStorage and broadcast to other tabs
      const timeLeftSeconds = timeLeft / 1000;
      localStorage.setItem('timeLeft', timeLeftSeconds.toString());
      broadcastUpdate('timeLeft', timeLeftSeconds.toString());
    });

    // Listen for sessionReset event
    const unsubscribeFromReset = subscribeToEvent('sessionReset', () => {
      console.log('Received sessionReset event in Countdown component');
      setIsRunning(false);
      setTimeLeft(GAME_TIME * 60 * 1000);
      setTeamName('');
    });

    // Clean up event listeners
    return () => {
      unsubscribeFromUpdates();
      unsubscribeFromStopTimer();
      unsubscribeFromReset();
    };
  }, [timeLeft]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(prevTime => {
        let newTime = prevTime;
        if (isRunning) {
          if (prevTime <= 0) {
            clearInterval(interval);

            // If the timer hits zero redirect to failure video
            window.location.hash = '#failure';
            window.location.reload();

            newTime = prevTime;
          } else {
            newTime = prevTime - 10;
          }
        }
        // Update timeLeft in localStorage and broadcast to other tabs
        // Only broadcast changes every second to reduce message frequency
        if (prevTime % 1000 === 0 || prevTime - newTime >= 1000) {
          const timeLeftSeconds = (newTime / 1000).toString();
          localStorage.setItem('timeLeft', timeLeftSeconds);
          broadcastUpdate('timeLeft', timeLeftSeconds);
        } else {
          // Always update localStorage
          localStorage.setItem('timeLeft', (newTime / 1000).toString());
        }
        return newTime;
      });
    }, 10);

    // Subscribe to timeLeft updates from other tabs
    const unsubscribeFromTimeUpdates = subscribeToUpdates((key, value) => {
      if (key === 'timeLeft' && !isRunning) {
        // Only update if this tab isn't controlling the timer
        setTimeLeft(parseFloat(value) * 1000);
      }
    });

    return () => {
      clearInterval(interval);
      unsubscribeFromTimeUpdates();
    };
  }, [isRunning]);

  useEffect(() => {
    const handleKeyUp = e => {
      if (e.key) {
        if (e.key === ' ') {
          setIsRunning(!isRunning);
        } else if (e.key === 's') {
          window.location.hash = '#success';
          window.location.reload();
        } else if (e.key.toLowerCase && e.key.toLowerCase() === 'r') {
          setTimeLeft(GAME_TIME * 60 * 1000);
        }
      }
    };

    window.document.addEventListener('keyup', handleKeyUp);
    return () => {
      window.document.removeEventListener('keyup', handleKeyUp);
    };
  }, [isRunning]);

  const minutes = Math.floor(timeLeft / 60000);
  const seconds = Math.floor((timeLeft % 60000) / 1000);
  const ms = ((timeLeft % 60000) / 1000 - seconds).toFixed(2) * 100;

  return (
    <div className='caesar'>
      <video
        id='bgVideo'
        className='videoContent'
        autoPlay
        loop
        muted
        onLoadStart={() => {
          const videoElm = document.getElementById('bgVideo');
          videoElm.playbackRate = 0.5;
          if (window.location.search === '?static') {
            videoElm.pause();
          }
        }}
      >
        <source src='globe.mp4' type='video/mp4' />
      </video>
      <div id='bgVideoOverlay' className='videoContent' />
      {teamName && (
        <div className='teamNameDisplay' style={{ padding: '1.5rem 0' }}>
          Team: {teamName}
        </div>
      )}
      <div className='msgLine input countdown'>
        <div className={`encChar `}>{`${minutes}`.padStart(2, '0')[0]}</div>
        <div className={`encChar `}>{`${minutes}`.padStart(2, '0')[1]}</div>
        <div className={`encChar `}>:</div>
        <div className={`encChar `}>{`${seconds}`.padStart(2, '0')[0]}</div>
        <div className={`encChar `}>{`${seconds}`.padStart(2, '0')[1]}</div>
        <div className={`encChar `}>:</div>
        <div className={`encChar `}>{`${ms}`.padStart(2, '0')[0]}</div>
        <div className={`encChar `}>{`${ms}`.padStart(2, '0')[1]}</div>
      </div>
    </div>
  );
}

export default Countdown;
export { GAME_TIME };

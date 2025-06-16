import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import Countdown from './Countdown';
import Video from './video';
import Caesar from './puzzles/caesar/caesar';
import SideChannel from './puzzles/side-channel/side-channel';
import TeamRegistration from './TeamRegistration';
import Scoreboard from './Scoreboard';
import Intermission from './Intermission';
import { closeChannel, clearSessionData } from './BroadcastState';

const root = ReactDOM.createRoot(document.getElementById('root'));

function renderComponent() {
  if (window.location.hash === '#intro') {
    root.render(<Video videoHref='intro' destination='countdown' />);
  } else if (window.location.hash === '#success') {
    root.render(<Video videoHref='success' destination='scoreboard' />);
  } else if (window.location.hash === '#failure') {
    root.render(<Video videoHref='failure' destination='scoreboard' />);
  } else if (window.location.hash === '#countdown') {
    root.render(<Countdown key={Date.now()} />);
  } else if (window.location.hash === '#sidechannel') {
    root.render(<SideChannel key={Date.now()} />);
  } else if (window.location.hash === '#caesar') {
    root.render(<Caesar key={Date.now()} />);
  } else if (window.location.hash === '#team-registration') {
    root.render(<TeamRegistration key={Date.now()} />);
  } else if (window.location.hash === '#scoreboard') {
    root.render(<Scoreboard key={Date.now()} />);
  } else if (window.location.hash === '#intermission') {
    root.render(<Intermission key={Date.now()} />);
  } else {
    // TODO: Refactor into it's own page. Maybe implement React-Router
    let hubContent = (
      <>
        <div className='hub'>
          <div>
            <a
              href='#team-registration'
              target='_new'
              onClick={() => {
                // Sometimes the page fails to re-render so force a reload
                window.location.hash = '#team-registration';
                window.location.reload();
              }}
            >
              Team Registration
            </a>
          </div>
          <div>
            <a href='#countdown'>Countdown</a>
          </div>
          <div>
            <a href='#sidechannel'>Side Channel</a>
          </div>
          <div>
            <a href='#caesar'>Caesar Cipher</a>
          </div>
          <div>
            <a href='#scoreboard'>Scoreboard</a>
          </div>
          <div className='session-reset'>
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to start a new session? This will reset all game data.')) {
                  clearSessionData();
                  // Reload the page to ensure all components start fresh
                  window.location.reload();
                }
              }}
              className='reset-button'
            >
              Start New Session
            </button>
          </div>
        </div>
      </>
    );
    root.render(hubContent);
  }
}

// Initial render
renderComponent();

// Listen for hash changes
window.addEventListener('hashchange', renderComponent);

// Clean up BroadcastChannel when window is unloaded
window.addEventListener('beforeunload', closeChannel);

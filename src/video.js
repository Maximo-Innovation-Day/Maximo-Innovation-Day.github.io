import './puzzles/caesar/caesar.css';
import React, { useEffect } from 'react';

function Video({ videoHref, destination }) {
  useEffect(() => {
    setTimeout(() => document.getElementById('bgVideo').play(), 200);

    const handleKeyUp = e => {
      if (e.key) {
        if (e.key === ' ') {
          if (destination) {
            // Redirect to countdown page and force reload to render the component
            window.location.hash = '#' + destination;
            window.location.reload();
          }
        }
      }
    };

    window.document.addEventListener('keyup', handleKeyUp);
    return () => {
      window.document.removeEventListener('keyup', handleKeyUp);
    };
  }, [destination]);

  return (
    <div className='caesar'>
      <video
        id='bgVideo'
        className='videoContent'
        onEnded={() => {
          if (destination) {
            // Redirect to countdown page and force reload to render the component
            window.location.hash = '#' + destination;
            window.location.reload();
          }
        }}
      >
        <source src={`${videoHref}.mp4`} type='video/mp4' />
      </video>
    </div>
  );
}

export default Video;

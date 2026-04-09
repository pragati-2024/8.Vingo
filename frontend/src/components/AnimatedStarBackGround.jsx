
import React from 'react';
import './AnimatedStarBackground.css';

const AnimatedStarBackground = () => {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      zIndex: -10,
      overflow: 'hidden',
      pointerEvents: 'none'
    }}>
      <div className="stars"></div>
      <div className="twinkling"></div>
      <div className="clouds"></div>
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        width: '800px',
        height: '800px',
        background: 'radial-gradient(circle, rgba(138, 43, 226, 0.25) 0%, rgba(138, 43, 226, 0) 70%)',
        transform: 'translate(-50%, -50%)',
        zIndex: 1,
      }}></div>
       <div style={{
        position: 'absolute',
        top: '20%',
        left: '80%',
        width: '600px',
        height: '600px',
        background: 'radial-gradient(circle, rgba(255, 105, 180, 0.15) 0%, rgba(255, 105, 180, 0) 65%)',
        transform: 'translate(-50%, -50%)',
        zIndex: 1,
      }}></div>
    </div>
  );
};

export default AnimatedStarBackground;

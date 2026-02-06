import React from 'react';

const ScreenFrame = ({ title, children }) => {
  return (
    <div style={{
      minHeight: '100vh',
      width: '100%',
      background: '#000000',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    }}>
      {/* Main container with purple border */}
      <div style={{
        width: '100%',
        maxWidth: '700px',
        minHeight: '90vh',
        background: '#000000',
        border: '6px solid #802EC6',
        borderRadius: '20px',
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        padding: '0'
      }}>
        
        {/* Top space above logo/banner */}
        <div style={{ height: '40px', background: '#000000' }} />

        {/* Purple banner with logo */}
        <div style={{
          position: 'relative',
          width: '100%',
          background: '#802EC6',
          height: '50px',
          display: 'flex',
          alignItems: 'center',
          paddingLeft: '30px'
        }}>
          {/* Logo positioned at left edge of game area */}
          <img 
            src="/small_logo.jpg" 
            alt="Link Logic"
            style={{
              width: '80px',
              height: '80px',
              position: 'absolute',
              left: '30px',
              top: '50%',
              transform: 'translateY(-50%)',
              borderRadius: '8px',
              border: '3px solid #ffffff',
              backgroundColor: '#ffffff'
            }}
          />
          
          {/* Title */}
          <div style={{
            color: '#ffffff',
            fontSize: '32px',
            fontWeight: 'bold',
            marginLeft: '100px',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)'
          }}>
            {title}
          </div>
        </div>

        {/* Space between banner and blue border */}
        <div style={{ height: '40px', background: '#000000' }} />

        {/* Blue-bordered game play area */}
        <div style={{
          flex: 1,
          margin: '0 20px 20px 20px',
          border: '6px solid #0066FF',
          borderRadius: '12px',
          background: '#000000',
          padding: '30px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'flex-start',
          color: '#ffffff',
          minHeight: '500px',
          overflowY: 'auto'
        }}>
          {children}
        </div>

      </div>
    </div>
  );
};

export default ScreenFrame;

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
      padding: '10px'
    }}>
      {/* Outer black border */}
      <div style={{
        border: '10px solid #000000',
        background: '#000000',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '600px'
      }}>
        {/* Purple border */}
        <div style={{
          background: '#000000',
          border: '8px solid #802EC6',
          borderRadius: '12px',
          minHeight: 'calc(100vh - 40px)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden'
        }}>
          
          {/* Purple banner with logo and title */}
          <div style={{
            width: '100%',
            background: '#802EC6',
            padding: '6px 20px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px',
            minHeight: '40px',
            position: 'relative'
          }}>
            {/* Logo */}
            <div style={{
              position: 'absolute',
              left: '20px',
              width: '60px',
              height: '60px',
              background: '#ffffff',
              borderRadius: '8px',
              padding: '3px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 10
            }}>
              <img 
                src="/small_logo.jpg" 
                alt="Link Logic"
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  borderRadius: '4px'
                }}
              />
            </div>
            
            {/* Title */}
            <div style={{
              color: '#ffffff',
              fontSize: '28px',
              fontWeight: 'bold',
              textShadow: '2px 2px 4px rgba(0, 0, 0, 0.5)',
              marginLeft: '70px'
            }}>
              {title}
            </div>
          </div>

          {/* Black space below banner */}
          <div style={{
            height: '30px',
            background: '#000000'
          }} />

          {/* Blue-bordered gameplay area */}
          <div style={{
            flex: 1,
            margin: '0 25px 0 25px',
            border: '5px solid #0066FF',
            borderRadius: '8px',
            background: '#000000',
            padding: '20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'flex-start',
            color: '#ffffff',
            minHeight: '400px',
            overflowY: 'auto'
          }}>
            {children}
          </div>

        </div>
      </div>
    </div>
  );
};

export default ScreenFrame;

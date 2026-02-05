import React, { useState } from 'react';

function WelcomeScreen({ onNavigate }) {
  const [roomNumber, setRoomNumber] = useState('');

  const handleHost = () => {
    onNavigate('register', { role: 'host' });
  };

  const handlePlay = () => {
    if (roomNumber.trim()) {
      onNavigate('register', { role: 'player', roomNumber: roomNumber.trim() });
    } else {
      alert('Please enter a Room Number');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Purple Banner */}
        {/* Large Logo */}
        <div style={styles.logoContainer}>
          <img src="/LargeLogo.png" alt="Link Logic" style={styles.largeLogo} />
        </div>

        {/* Tagline */}
        <h2 style={styles.tagline}>
          A Multiplayer<br />
          Word Connection Game
        </h2>

        {/* Room Number Input */}
        <div style={styles.inputGroup}>
          <label style={styles.label}>Enter Room #</label>
          <input
            type="text"
            value={roomNumber}
            onChange={(e) => setRoomNumber(e.target.value)}
            placeholder="Room #"
            style={styles.input}
          />
        </div>

        {/* Buttons */}
        <div style={styles.buttonRow}>
          <button 
            onClick={handleHost} 
            disabled={roomNumber.trim() !== ''}
            style={{
              ...styles.hostButton,
              ...(roomNumber.trim() !== '' ? styles.disabledButton : {})
            }}
          >
            Host
          </button>
          <button onClick={handlePlay} style={styles.playButton}>
            Play
          </button>
        </div>

        {/* Instructions Button */}
        <button onClick={() => onNavigate('instructions')} style={styles.instructionsButton}>
          Instructions
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a2332 0%, #2c3e50 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    background: 'linear-gradient(180deg, #4a7ba7 0%, #2c5a7d 100%)',
    borderRadius: '25px',
    padding: '8px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
    width: '450px',
  },
  logoContainer: {
    display: 'flex',
    justifyContent: 'center',
    marginBottom: '20px',
  },
  largeLogo: {
    width: '100%',
    maxWidth: '400px',
    height: 'auto',
  },
  tagline: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: '30px',
    lineHeight: '1.4',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
  },
  inputGroup: {
    marginBottom: '25px',
    padding: '0 20px',
  },
  label: {
    color: '#ffffff',
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '10px',
    display: 'block',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: '15px',
    fontSize: '18px',
    borderRadius: '10px',
    border: '2px solid #00bcd4',
    backgroundColor: '#1e3a52',
    color: '#ffffff',
    boxSizing: 'border-box',
    textAlign: 'center',
    fontWeight: '500',
  },
  buttonRow: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
    padding: '0 20px',
  },
  hostButton: {
    flex: 1,
    padding: '18px',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#ff6600',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(255, 102, 0, 0.4)',
    transition: 'all 0.2s',
  },
  playButton: {
    flex: 1,
    padding: '18px',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#00ff00',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0, 255, 0, 0.4)',
    transition: 'all 0.2s',
  },
  instructionsButton: {
    width: 'calc(100% - 40px)',
    margin: '0 20px',
    padding: '15px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#0066ff',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0, 102, 255, 0.4)',
  },
  disabledButton: {
    backgroundColor: '#555555',
    cursor: 'not-allowed',
    opacity: 0.5,
    boxShadow: 'none',
  },
};

export default WelcomeScreen;

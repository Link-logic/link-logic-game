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
        {/* Logo Section */}
        <div style={styles.logoBox}>
          <img 
            src="/LargeLogo.png" 
            alt="Link Logic" 
            style={styles.logo}
          />
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
          <button onClick={handleHost} style={styles.hostButton}>
            Host
          </button>
          <button onClick={handlePlay} style={styles.playerButton}>
            Player
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: '100vh',
    background: '#1a2332',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  card: {
    backgroundColor: '#2c4a6d',
    borderRadius: '20px',
    border: '3px solid #4a7ba7',
    padding: '40px',
    maxWidth: '420px',
    width: '100%',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
  },
  logoBox: {
    backgroundColor: '#8b2d8b',
    padding: '20px',
    borderRadius: '12px',
    textAlign: 'center',
    marginBottom: '30px',
  },
  logo: {
    maxWidth: '220px',
    width: '100%',
    height: 'auto',
  },
  tagline: {
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: '0 0 35px 0',
    lineHeight: '1.4',
  },
  inputGroup: {
    marginBottom: '25px',
  },
  label: {
    display: 'block',
    color: '#ffffff',
    fontSize: '16px',
    marginBottom: '10px',
    fontWeight: '500',
  },
  input: {
    width: '100%',
    padding: '14px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '2px solid #4a7ba7',
    backgroundColor: '#1a3a52',
    color: '#ffffff',
    boxSizing: 'border-box',
  },
  buttonRow: {
    display: 'flex',
    gap: '15px',
  },
  hostButton: {
    flex: 1,
    padding: '16px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#8b2d8b',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
  playerButton: {
    flex: 1,
    padding: '16px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#4a7ba7',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
    transition: 'transform 0.2s',
  },
};

export default WelcomeScreen;
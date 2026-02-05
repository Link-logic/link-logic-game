import React, { useState } from 'react';
import { ref, get, set } from 'firebase/database';
import { database } from '../config/firebase';
import ScreenFrame from '../components/ScreenFrame';

function RegisterScreen({ onNavigate, role, roomNumber }) {
  const [realName, setRealName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [cellPhone, setCellPhone] = useState('');
  const [email, setEmail] = useState('');
  const [availability, setAvailability] = useState('');
  const [isChecking, setIsChecking] = useState(false);

  const checkAvailability = async () => {
    if (!playerName.trim()) {
      alert('Please enter a Player Name');
      return;
    }

    setIsChecking(true);
    const playersRef = ref(database, 'players');
    const snapshot = await get(playersRef);
    
    if (snapshot.exists()) {
      const players = snapshot.val();
      const exists = Object.values(players).some(
        player => player.playerName.toLowerCase() === playerName.toLowerCase()
      );
      setAvailability(exists ? 'Not Available – Try Again' : 'Available');
    } else {
      setAvailability('Available');
    }
    setIsChecking(false);
  };

  const handleRegister = async (destination) => {
    if (!realName.trim() || !playerName.trim() || !cellPhone.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    if (availability !== 'Available') {
      alert('Please check player name availability first');
      return;
    }

    const playerId = Date.now().toString();
    const playerData = {
      playerId,
      realName: realName.trim(),
      playerName: playerName.trim(),
      cellPhone: cellPhone.trim(),
      email: email.trim(),
    };

    try {
      await set(ref(database, `players/${playerId}`), playerData);

      if (destination === 'host') {
        onNavigate('hostroom', { playerId, playerName: playerName.trim(), role, roomNumber });
      } else if (destination === 'play') {
        onNavigate('waitingroom', { playerId, playerName: playerName.trim(), role, roomNumber });
      } else {
        onNavigate('instructions', { playerId, playerName: playerName.trim(), role, roomNumber });
      }
    } catch (error) {
      alert('Registration failed. Please try again.');
    }
  };

  return (
    <ScreenFrame title="Register">
      <div style={styles.content}>
        {/* Your Name */}
        <div style={styles.fieldGroup}>
          <div style={styles.labelRow}>
            <span style={styles.label}>Your Name</span>
            <span style={styles.required}>Required</span>
          </div>
          <div style={styles.inputWrapper}>
            <input
              type="text"
              value={realName}
              onChange={(e) => setRealName(e.target.value)}
              placeholder=""
              style={styles.input}
            />
            <span style={realName.trim() ? styles.checkmark : styles.circle}>
              {realName.trim() ? '✓' : '○'}
            </span>
          </div>
        </div>

        {/* Your Cell */}
        <div style={styles.fieldGroup}>
          <div style={styles.labelRow}>
            <span style={styles.label}>Your Cell</span>
            <span style={styles.required}>Required</span>
          </div>
          <div style={styles.inputWrapper}>
            <input
              type="tel"
              value={cellPhone}
              onChange={(e) => setCellPhone(e.target.value)}
              style={styles.input}
            />
            <span style={cellPhone.trim() ? styles.checkmark : styles.circle}>
              {cellPhone.trim() ? '✓' : '○'}
            </span>
          </div>
        </div>

        {/* Your Email */}
        <div style={styles.fieldGroup}>
          <div style={styles.labelRow}>
            <span style={styles.label}>Your Email</span>
            <span style={styles.optional}>Optional</span>
          </div>
          <div style={styles.inputWrapper}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={styles.input}
            />
            <span style={email.trim() ? styles.checkmark : styles.circle}>
              {email.trim() ? '✓' : '○'}
            </span>
          </div>
        </div>

        {/* Player Name */}
        <div style={styles.fieldGroup}>
          <div style={styles.labelRow}>
            <span style={styles.label}>Player Name</span>
            <span style={styles.required}>Required</span>
          </div>
          <div style={styles.inputWrapper}>
            <input
              type="text"
              value={playerName}
              onChange={(e) => {
                setPlayerName(e.target.value);
                setAvailability('');
              }}
              style={styles.input}
            />
            <span style={playerName.trim() ? styles.checkmark : styles.circle}>
              {playerName.trim() ? '✓' : '○'}
            </span>
          </div>
          <button 
            onClick={checkAvailability}
            disabled={isChecking}
            style={styles.checkButton}
          >
            {isChecking ? 'Checking...' : 'Check for Availability'}
          </button>
          {availability && (
            <div style={availability === 'Available' ? styles.available : styles.notAvailable}>
              {availability}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div style={styles.buttonRow}>
          <button 
            onClick={() => handleRegister('instructions')}
            style={styles.instructionsButton}
          >
            Instructions
          </button>
          <button 
            onClick={() => handleRegister('host')}
            style={styles.hostButton}
          >
            Host
          </button>
          <button 
            onClick={() => handleRegister('play')}
            style={styles.playButton}
          >
            Play
          </button>
        </div>
      </div>
    </ScreenFrame>
  );
}

const styles = {
  content: {
    width: '100%',
    maxWidth: '480px',
  },
  fieldGroup: {
    marginBottom: '20px',
  },
  labelRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '8px',
  },
  label: {
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: '500',
  },
  required: {
    color: '#ff6b6b',
    fontSize: '13px',
  },
  optional: {
    color: '#7dd3c0',
    fontSize: '13px',
  },
  inputWrapper: {
    position: 'relative',
  },
  input: {
    width: '100%',
    padding: '12px 45px 12px 12px',
    fontSize: '15px',
    borderRadius: '8px',
    border: '2px solid #4a7ba7',
    backgroundColor: '#1a3a52',
    color: '#ffffff',
    boxSizing: 'border-box',
  },
  circle: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#6b8caf',
    fontSize: '22px',
  },
  checkmark: {
    position: 'absolute',
    right: '14px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#7dd3c0',
    fontSize: '22px',
    fontWeight: 'bold',
  },
  checkButton: {
    marginTop: '10px',
    width: '100%',
    padding: '12px',
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#e67e22',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  available: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#7dd3c0',
    color: '#1a2332',
    textAlign: 'center',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  notAvailable: {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#ff6b6b',
    color: '#ffffff',
    textAlign: 'center',
    borderRadius: '6px',
    fontWeight: 'bold',
    fontSize: '14px',
  },
  buttonRow: {
    display: 'flex',
    gap: '10px',
    marginTop: '30px',
  },
  instructionsButton: {
    flex: 1,
    padding: '14px 8px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#7dd3c0',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  hostButton: {
    flex: 1,
    padding: '14px 8px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#8b2d8b',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  playButton: {
    flex: 1,
    padding: '14px 8px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#4a7ba7',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
  },
};

export default RegisterScreen;

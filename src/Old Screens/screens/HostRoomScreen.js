import React, { useState } from 'react';
import { ref, set, get } from 'firebase/database';
import { database } from '../config/firebase';
import { presets } from '../data/presets';
import ScreenFrame from '../components/ScreenFrame';

function HostRoomScreen({ onNavigate, playerId, playerName }) {
  const [roomNumber, setRoomNumber] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [presetSettings, setPresetSettings] = useState({
    words: 20,
    timer: 100,
    rounds: 5,
    bonusWords: 3
  });
  const [invitationMessage, setInvitationMessage] = useState('');

  const generateRoomNumber = () => {
    const newRoomNumber = Math.floor(100000 + Math.random() * 900000).toString();
    setRoomNumber(newRoomNumber);
    updateInvitation(newRoomNumber);
  };

  const updateInvitation = (room) => {
    const message = `You're invited to play Link Logic!\n\nRoom Number: ${room}\n\nClick to Join: [Game Address]`;
    setInvitationMessage(message);
  };

  const handlePresetSelect = (level) => {
    const preset = presets[level];
    setSelectedPreset(level);
    setPresetSettings({
      words: preset.words,
      timer: preset.seconds,
      rounds: preset.rounds,
      bonusWords: preset.bonusWords
    });
    setEditMode(false);
  };

  const handleSave = async () => {
    if (!roomNumber) {
      alert('Please generate a room number first');
      return;
    }
    
    const roomRef = ref(database, `rooms/${roomNumber}`);
    await set(roomRef, {
      hostId: playerId,
      hostName: playerName,
      status: 'waiting',
      settings: presetSettings,
      players: {
        [playerId]: {
          playerName,
          points: 0,
          isHost: true
        }
      },
      currentRound: 0,
      createdAt: new Date().toISOString()
    });
    
    setEditMode(false);
    alert('Settings saved!');
  };

  const handleReset = () => {
    if (selectedPreset) {
      const preset = presets[selectedPreset];
      setPresetSettings({
        words: preset.words,
        timer: preset.seconds,
        rounds: preset.rounds,
        bonusWords: preset.bonusWords
      });
    }
    setEditMode(false);
  };

  const copyInvitation = () => {
    navigator.clipboard.writeText(invitationMessage);
    alert('Invitation copied! Paste into your text app.');
  };

  const goToWaitingRoom = async () => {
    if (!roomNumber || !selectedPreset) {
      alert('Please generate a room number and select a preset');
      return;
    }

    const roomRef = ref(database, `rooms/${roomNumber}`);
    const snapshot = await get(roomRef);
    
    if (!snapshot.exists()) {
      await handleSave();
    }

    onNavigate('waiting', { playerId, playerName, roomNumber, isHost: true });
  };

  return (
    <ScreenFrame title="Host Room">
      <div style={styles.content}>
        {/* Game Setup Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Game Setup:</h3>
          
          {/* Generate Room Number */}
          <div style={styles.row}>
            <button onClick={generateRoomNumber} style={styles.generateButton}>
              Generate Room #:
            </button>
            <span style={styles.roomNumber}>{roomNumber || 'Self Populates'}</span>
          </div>

          {/* Invitation */}
          <div style={styles.inviteSection}>
            <h4 style={styles.inviteTitle}>Send an Invitation</h4>
            <textarea
              value={invitationMessage}
              onChange={(e) => setInvitationMessage(e.target.value)}
              placeholder="Type your message here:"
              style={styles.textarea}
              rows="3"
            />
            <div style={styles.inviteDetails}>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Room Number:</span>
                <span style={styles.detailValue}>{roomNumber || 'Room # Populates'}</span>
              </div>
              <div style={styles.detailRow}>
                <span style={styles.detailLabel}>Click to Join:</span>
                <span style={styles.detailValue}>Game Address Populates</span>
              </div>
            </div>
            <button onClick={copyInvitation} style={styles.copyButton}>
              Copy & Text
            </button>
          </div>
        </div>

        {/* Preset Selection */}
        <div style={styles.section}>
          <div style={styles.presetHeader}>
            <h3 style={styles.sectionTitle}>Select Difficulty Level</h3>
            <div style={styles.controlButtons}>
              <button onClick={() => setEditMode(!editMode)} style={styles.smallButton}>Edit</button>
              <button onClick={handleSave} style={styles.smallButton}>Save</button>
              <button onClick={handleReset} style={styles.smallButton}>Reset</button>
            </div>
          </div>

          {selectedPreset && (
            <div style={styles.presetInfo}>
              Level {selectedPreset} - Preset Settings:<br />
              Words: {presetSettings.words} | Timer: {presetSettings.timer}s<br />
              Rounds: {presetSettings.rounds} | Bonus Words: {presetSettings.bonusWords}
            </div>
          )}

          {/* Preset Grid */}
          <div style={styles.presetGrid}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(level => (
              <button
                key={level}
                onClick={() => handlePresetSelect(level)}
                style={{
                  ...styles.presetButton,
                  ...(selectedPreset === level ? styles.presetSelected : {})
                }}
              >
                Preset {level}
              </button>
            ))}
          </div>

          {/* Edit Panel */}
          {editMode && (
            <div style={styles.editPanel}>
              <div style={styles.editRow}>
                <label>Words:</label>
                <input
                  type="number"
                  value={presetSettings.words}
                  onChange={(e) => setPresetSettings({...presetSettings, words: parseInt(e.target.value)})}
                  style={styles.editInput}
                />
              </div>
              <div style={styles.editRow}>
                <label>Timer:</label>
                <input
                  type="number"
                  value={presetSettings.timer}
                  onChange={(e) => setPresetSettings({...presetSettings, timer: parseInt(e.target.value)})}
                  style={styles.editInput}
                />
              </div>
              <div style={styles.editRow}>
                <label>Rounds:</label>
                <input
                  type="number"
                  value={presetSettings.rounds}
                  onChange={(e) => setPresetSettings({...presetSettings, rounds: parseInt(e.target.value)})}
                  style={styles.editInput}
                />
              </div>
              <div style={styles.editRow}>
                <label>Bonus Words:</label>
                <input
                  type="number"
                  value={presetSettings.bonusWords}
                  onChange={(e) => setPresetSettings({...presetSettings, bonusWords: parseInt(e.target.value)})}
                  style={styles.editInput}
                />
              </div>
            </div>
          )}
        </div>

        {/* Waiting Room Button */}
        <button onClick={goToWaitingRoom} style={styles.waitingButton}>
          Waiting Room
        </button>
      </div>
    </ScreenFrame>
  );
}

const styles = {
  content: {
    width: '100%',
    maxWidth: '480px',
  },
  section: {
    marginBottom: '25px',
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: '18px',
    marginBottom: '15px',
    fontWeight: 'bold',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '15px',
  },
  generateButton: {
    padding: '10px 15px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#e67e22',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  roomNumber: {
    color: '#7dd3c0',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  inviteSection: {
    backgroundColor: '#1a3a52',
    padding: '15px',
    borderRadius: '10px',
    border: '2px solid #4a7ba7',
  },
  inviteTitle: {
    color: '#ffffff',
    fontSize: '15px',
    marginBottom: '10px',
    fontWeight: 'bold',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    borderRadius: '6px',
    border: '1px solid #4a7ba7',
    backgroundColor: '#2c4a6d',
    color: '#ffffff',
    marginBottom: '10px',
    boxSizing: 'border-box',
    resize: 'vertical',
  },
  inviteDetails: {
    backgroundColor: '#2c4a6d',
    padding: '10px',
    borderRadius: '6px',
    marginBottom: '10px',
  },
  detailRow: {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: '5px',
    color: '#ffffff',
    fontSize: '13px',
  },
  detailLabel: {
    fontWeight: 'bold',
  },
  detailValue: {
    color: '#7dd3c0',
  },
  copyButton: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#8b2d8b',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  presetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
  },
  controlButtons: {
    display: 'flex',
    gap: '8px',
  },
  smallButton: {
    padding: '6px 12px',
    fontSize: '12px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#4a7ba7',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  presetInfo: {
    backgroundColor: '#1a3a52',
    padding: '12px',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '13px',
    marginBottom: '15px',
    border: '2px solid #7dd3c0',
  },
  presetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    marginBottom: '15px',
  },
  presetButton: {
    padding: '15px 8px',
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#2c4a6d',
    border: '2px solid #4a7ba7',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  presetSelected: {
    backgroundColor: '#7dd3c0',
    color: '#1a2332',
    border: '2px solid #7dd3c0',
  },
  editPanel: {
    backgroundColor: '#1a3a52',
    padding: '15px',
    borderRadius: '8px',
    border: '2px solid #4a7ba7',
  },
  editRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '10px',
    color: '#ffffff',
  },
  editInput: {
    width: '80px',
    padding: '6px',
    fontSize: '14px',
    borderRadius: '4px',
    border: '1px solid #4a7ba7',
    backgroundColor: '#2c4a6d',
    color: '#ffffff',
  },
  waitingButton: {
    width: '100%',
    padding: '16px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#7dd3c0',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
  },
};

export default HostRoomScreen;

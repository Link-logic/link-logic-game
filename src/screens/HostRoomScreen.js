import React, { useState } from 'react';
import { ref, set, get, update } from 'firebase/database';
import { database } from '../config/firebase';
import { presets } from '../data/presets';

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
  const [settingsSaved, setSettingsSaved] = useState(false);

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
    setSettingsSaved(false);
  };

  const handleSave = async () => {
    if (!roomNumber) {
      alert('Please generate a room number first');
      return;
    }
    
    const roomRef = ref(database, `rooms/${roomNumber}`);
    
    // Check if room exists
    const snapshot = await get(roomRef);
    
    if (snapshot.exists()) {
      // Update existing room settings
      await update(roomRef, {
        settings: presetSettings
      });
    } else {
      // Create new room with settings
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
    }
    
    setEditMode(false);
    setSettingsSaved(true);
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
    setSettingsSaved(false);
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

    // Save settings before going to waiting room
    const roomRef = ref(database, `rooms/${roomNumber}`);
    const snapshot = await get(roomRef);
    
    if (!snapshot.exists()) {
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
    } else if (!settingsSaved) {
      // Update settings if they were changed but not saved
      await update(roomRef, {
        settings: presetSettings
      });
    }

    onNavigate('waiting', { playerId, playerName, roomNumber, isHost: true });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Small Logo Banner */}
        <div style={styles.banner}>
          <img src="/smalllogo.png" alt="Link Logic" style={styles.logo} />
        </div>

        <h2 style={styles.title}>Host</h2>

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
            <h3 style={styles.sectionTitle}>Select Preset Level</h3>
            <div style={styles.controlButtons}>
              <button onClick={() => setEditMode(!editMode)} style={styles.smallButton}>
                {editMode ? 'Cancel' : 'Edit'}
              </button>
              <button onClick={handleSave} style={styles.smallButton}>Save</button>
              <button onClick={handleReset} style={styles.smallButton}>Reset</button>
            </div>
          </div>

          {selectedPreset && (
            <div style={styles.presetInfo}>
              <strong>Level {selectedPreset}</strong><br />
              Words: {presetSettings.words} | Timer: {presetSettings.timer}s<br />
              Rounds: {presetSettings.rounds} | Bonus Words: {presetSettings.bonusWords}
              {settingsSaved && <div style={styles.savedIndicator}>✓ Saved</div>}
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
                Level {level}
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
                  onChange={(e) => {
                    setPresetSettings({...presetSettings, words: parseInt(e.target.value) || 0});
                    setSettingsSaved(false);
                  }}
                  style={styles.editInput}
                />
              </div>
              <div style={styles.editRow}>
                <label>Timer (seconds):</label>
                <input
                  type="number"
                  value={presetSettings.timer}
                  onChange={(e) => {
                    setPresetSettings({...presetSettings, timer: parseInt(e.target.value) || 0});
                    setSettingsSaved(false);
                  }}
                  style={styles.editInput}
                />
              </div>
              <div style={styles.editRow}>
                <label>Rounds:</label>
                <input
                  type="number"
                  value={presetSettings.rounds}
                  onChange={(e) => {
                    setPresetSettings({...presetSettings, rounds: parseInt(e.target.value) || 0});
                    setSettingsSaved(false);
                  }}
                  style={styles.editInput}
                />
              </div>
              <div style={styles.editRow}>
                <label>Bonus Words:</label>
                <input
                  type="number"
                  value={presetSettings.bonusWords}
                  onChange={(e) => {
                    setPresetSettings({...presetSettings, bonusWords: parseInt(e.target.value) || 0});
                    setSettingsSaved(false);
                  }}
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
    padding: '35px',
    maxWidth: '650px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
  },
  banner: {
    backgroundColor: '#8b2d8b',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '25px',
    textAlign: 'center',
  },
  logo: {
    maxWidth: '110px',
    height: 'auto',
  },
  title: {
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: 'bold',
    textAlign: 'center',
    margin: '0 0 30px 0',
  },
  section: {
    marginBottom: '30px',
  },
  sectionTitle: {
    color: '#e67e22',
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    marginBottom: '20px',
  },
  generateButton: {
    padding: '12px 18px',
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#7dd3c0',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  roomNumber: {
    color: '#7dd3c0',
    fontSize: '20px',
    fontWeight: 'bold',
  },
  inviteSection: {
    marginTop: '20px',
  },
  inviteTitle: {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  textarea: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '2px solid #4a7ba7',
    backgroundColor: '#1a3a52',
    color: '#ffffff',
    boxSizing: 'border-box',
    marginBottom: '15px',
    resize: 'vertical',
  },
  inviteDetails: {
    marginBottom: '15px',
  },
  detailRow: {
    display: 'flex',
    gap: '10px',
    marginBottom: '8px',
  },
  detailLabel: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  detailValue: {
    color: '#7dd3c0',
    fontSize: '14px',
  },
  copyButton: {
    padding: '10px 20px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#e67e22',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  presetHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    flexWrap: 'wrap',
    gap: '10px',
  },
  controlButtons: {
    display: 'flex',
    gap: '8px',
  },
  smallButton: {
    padding: '8px 14px',
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#8b2d8b',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  presetInfo: {
    backgroundColor: '#1a3a52',
    padding: '12px',
    borderRadius: '8px',
    color: '#ffffff',
    fontSize: '14px',
    marginBottom: '15px',
    lineHeight: '1.6',
    position: 'relative',
  },
  savedIndicator: {
    color: '#7dd3c0',
    fontWeight: 'bold',
    marginTop: '5px',
  },
  presetGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    marginBottom: '15px',
  },
  presetButton: {
    padding: '14px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#4a7ba7',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  presetSelected: {
    backgroundColor: '#e67e22',
  },
  editPanel: {
    backgroundColor: '#1a3a52',
    padding: '20px',
    borderRadius: '8px',
    marginTop: '15px',
  },
  editRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '15px',
    color: '#ffffff',
    fontSize: '14px',
  },
  editInput: {
    width: '80px',
    padding: '8px',
    fontSize: '14px',
    borderRadius: '6px',
    border: '2px solid #4a7ba7',
    backgroundColor: '#2c4a6d',
    color: '#ffffff',
    textAlign: 'center',
  },
  waitingButton: {
    width: '100%',
    padding: '16px',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#7dd3c0',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
  },
};

export default HostRoomScreen;

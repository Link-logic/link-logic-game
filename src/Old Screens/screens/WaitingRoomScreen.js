import React, { useState, useEffect } from 'react';
import { ref, onValue, set, update } from 'firebase/database';
import { database } from '../config/firebase';

function WaitingRoomScreen({ onNavigate, playerId, playerName, roomNumber, isHost }) {
  const [players, setPlayers] = useState([]);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [countdown, setCountdown] = useState(null);

  useEffect(() => {
    const roomRef = ref(database, `rooms/${roomNumber}`);
    
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        if (data.players) {
          const playersList = Object.entries(data.players).map(([id, player]) => ({
            id,
            ...player
          }));
          setPlayers(playersList);
        }

        if (data.chat) {
          const messages = Object.values(data.chat);
          setChatMessages(messages);
        }

        if (data.countdown) {
          setCountdown(data.countdown);
        }

        if (data.status === 'playing') {
          onNavigate('game', { playerId, playerName, roomNumber, isHost });
        }
      }
    });

    if (!isHost) {
      const playerRef = ref(database, `rooms/${roomNumber}/players/${playerId}`);
      set(playerRef, {
        playerName,
        points: 0,
        isHost: false
      });
    }

    return () => unsubscribe();
  }, [roomNumber, playerId, playerName, isHost, onNavigate]);

  const sendMessage = async () => {
    if (newMessage.trim()) {
      const chatRef = ref(database, `rooms/${roomNumber}/chat`);
      const messageId = Date.now().toString();
      await update(chatRef, {
        [messageId]: {
          playerName,
          message: newMessage.trim(),
          timestamp: new Date().toISOString()
        }
      });
      setNewMessage('');
    }
  };

  const startCountdown = async () => {
    if (!isHost) return;

    const roomRef = ref(database, `rooms/${roomNumber}`);
    
    await update(roomRef, { countdown: 'ready' });
    setTimeout(async () => {
      await update(roomRef, { countdown: 'set' });
      setTimeout(async () => {
        await update(roomRef, { countdown: 'go' });
        setTimeout(async () => {
          await update(roomRef, { 
            countdown: null,
            status: 'playing',
            currentRound: 1
          });
        }, 1000);
      }, 1000);
    }, 1000);
  };

  const changeHost = () => {
    // Simplified for now
    alert('Select new host from player list');
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Small Logo Banner */}
        <div style={styles.banner}>
          <img src="/smalllogo.png" alt="Link Logic" style={styles.logo} />
        </div>

        <h2 style={styles.title}>Waiting Room</h2>

        {/* Room Number */}
        <div style={styles.roomInfo}>
          Room #: <span style={styles.roomNumber}>{roomNumber}</span>
        </div>

        {/* Players Ready Grid */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Players Ready</h3>
          <div style={styles.playersGrid}>
            {players.map((player) => (
              <div 
                key={player.id}
                style={player.isHost ? styles.hostBox : styles.playerBox}
              >
                {player.playerName}
              </div>
            ))}
            {/* Empty slots */}
            {[...Array(Math.max(0, 8 - players.length))].map((_, i) => (
              <div key={`empty-${i}`} style={styles.emptyBox}>
                Player Name
              </div>
            ))}
          </div>
        </div>

        {/* Chat Section */}
        <div style={styles.section}>
          <h3 style={styles.sectionTitle}>Chat: Room #{roomNumber}</h3>
          <div style={styles.chatBox}>
            {chatMessages.map((msg, index) => (
              <div key={index} style={styles.chatMessage}>
                <strong>{msg.playerName}:</strong> {msg.message}
              </div>
            ))}
          </div>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Type your Message Here:"
            style={styles.chatInput}
          />
        </div>

        {/* Countdown Lights */}
        {countdown && (
          <div style={styles.countdownSection}>
            <div style={{
              ...styles.light,
              ...(countdown === 'ready' ? styles.redLight : styles.lightOff)
            }}>
              Ready
            </div>
            <div style={{
              ...styles.light,
              ...(countdown === 'set' ? styles.yellowLight : styles.lightOff)
            }}>
              Set
            </div>
            <div style={{
              ...styles.light,
              ...(countdown === 'go' ? styles.greenLight : styles.lightOff)
            }}>
              Go
            </div>
          </div>
        )}

        {/* Host Controls */}
        {isHost && !countdown && (
          <div style={styles.buttonRow}>
            <button onClick={changeHost} style={styles.newHostButton}>
              New Host
            </button>
            <button onClick={startCountdown} style={styles.tapToPlayButton}>
              Tap to Play
            </button>
          </div>
        )}
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
    margin: '0 0 20px 0',
  },
  roomInfo: {
    color: '#ffffff',
    fontSize: '18px',
    textAlign: 'center',
    marginBottom: '30px',
  },
  roomNumber: {
    color: '#7dd3c0',
    fontWeight: 'bold',
    fontSize: '20px',
  },
  section: {
    marginBottom: '25px',
  },
  sectionTitle: {
    color: '#e67e22',
    fontSize: '18px',
    fontWeight: 'bold',
    marginBottom: '12px',
  },
  playersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)',
    gap: '10px',
  },
  hostBox: {
    backgroundColor: '#8b2d8b',
    padding: '12px',
    borderRadius: '8px',
    color: '#ffffff',
    fontWeight: 'bold',
    textAlign: 'center',
    fontSize: '14px',
  },
  playerBox: {
    backgroundColor: '#4a7ba7',
    padding: '12px',
    borderRadius: '8px',
    color: '#ffffff',
    textAlign: 'center',
    fontSize: '14px',
  },
  emptyBox: {
    backgroundColor: '#1a3a52',
    padding: '12px',
    borderRadius: '8px',
    color: '#6b8caf',
    textAlign: 'center',
    fontSize: '14px',
  },
  chatBox: {
    backgroundColor: '#1a3a52',
    padding: '15px',
    borderRadius: '8px',
    maxHeight: '150px',
    overflowY: 'auto',
    marginBottom: '10px',
  },
  chatMessage: {
    color: '#ffffff',
    fontSize: '14px',
    marginBottom: '8px',
    lineHeight: '1.4',
  },
  chatInput: {
    width: '100%',
    padding: '12px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '2px solid #4a7ba7',
    backgroundColor: '#1a3a52',
    color: '#ffffff',
    boxSizing: 'border-box',
  },
  countdownSection: {
    display: 'flex',
    justifyContent: 'center',
    gap: '15px',
    marginBottom: '25px',
  },
  light: {
    padding: '15px 25px',
    borderRadius: '10px',
    fontSize: '18px',
    fontWeight: 'bold',
    textAlign: 'center',
    minWidth: '80px',
  },
  lightOff: {
    backgroundColor: '#1a3a52',
    color: '#6b8caf',
  },
  redLight: {
    backgroundColor: '#ff4444',
    color: '#ffffff',
    boxShadow: '0 0 20px rgba(255, 68, 68, 0.8)',
  },
  yellowLight: {
    backgroundColor: '#ffaa00',
    color: '#ffffff',
    boxShadow: '0 0 20px rgba(255, 170, 0, 0.8)',
  },
  greenLight: {
    backgroundColor: '#7dd3c0',
    color: '#ffffff',
    boxShadow: '0 0 20px rgba(125, 211, 192, 0.8)',
  },
  buttonRow: {
    display: 'flex',
    gap: '15px',
  },
  newHostButton: {
    flex: 1,
    padding: '16px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#e67e22',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  tapToPlayButton: {
    flex: 2,
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

export default WaitingRoomScreen;
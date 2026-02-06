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
        
        console.log('=== WAITING ROOM DATA ===');
        console.log('Players in Firebase:', data.players);
        
        if (data.players) {
          const playersList = Object.entries(data.players).map(([id, player]) => ({
            id,
            ...player
          }));
          console.log('Players list:', playersList);
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

    // Register player in Firebase (both host and non-host)
    const registerPlayer = async () => {
      const playerRef = ref(database, `rooms/${roomNumber}/players/${playerId}`);
      const hostStatus = isHost === true; // Convert undefined to false
      await set(playerRef, {
        playerName,
        points: 0,
        isHost: hostStatus
      });
      console.log(`Player ${playerName} (${playerId}) registered. isHost: ${hostStatus}`);
    };

    registerPlayer();

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
            status: 'playing'
            // Don't modify currentRound - it's already set by LeaderBoard
          });
        }, 1000);
      }, 1000);
    }, 1000);
  };

  return (
    <div style={styles.outerContainer}>
      <div style={styles.container}>
        <div style={styles.card}>
          {/* Purple Banner */}
          <div style={styles.banner}>
            <img src="/smalllogo.png" alt="Link Logic" style={styles.logo} />
            <div style={styles.bannerText}>Link Logic</div>
          </div>

          <h2 style={styles.title}>Waiting Room</h2>

          {/* Countdown Overlay */}
          {countdown && (
            <div style={styles.countdownOverlay}>
              <div style={{
                ...styles.countdownText,
                color: countdown === 'ready' ? '#ff0000' : countdown === 'set' ? '#ffff00' : '#00ff00'
              }}>
                {countdown === 'ready' && 'READY'}
                {countdown === 'set' && 'SET'}
                {countdown === 'go' && 'GO!'}
              </div>
            </div>
          )}

          {/* Players Grid */}
          <div style={styles.playersSection}>
            <h3 style={styles.sectionTitle}>Players Ready:</h3>
            <div style={styles.playersGrid}>
              {players.map((player) => (
                <div key={player.id} style={styles.playerBox}>
                  <div style={styles.playerName}>{player.playerName}</div>
                  {player.isHost && <div style={styles.hostBadge}>HOST</div>}
                </div>
              ))}
            </div>
          </div>

          {/* Chat */}
          <div style={styles.chatSection}>
            <h3 style={styles.sectionTitle}>Chat:</h3>
            <div style={styles.chatMessages}>
              {chatMessages.map((msg, index) => (
                <div key={index} style={styles.chatMessage}>
                  <strong style={styles.chatName}>{msg.playerName}:</strong> {msg.message}
                </div>
              ))}
            </div>
            <div style={styles.chatInputArea}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                placeholder="Type a message..."
                style={styles.chatInput}
              />
              <button onClick={sendMessage} style={styles.sendButton}>
                Send
              </button>
            </div>
          </div>

          {/* Start/Wait Button */}
          {isHost ? (
            <button onClick={startCountdown} style={styles.startButton}>
              Start Game
            </button>
          ) : (
            <div style={styles.waitingMessage}>
              Waiting for host to start the game...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  outerContainer: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #1a2332 0%, #2c3e50 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  container: {
    background: 'linear-gradient(180deg, #4a7ba7 0%, #2c5a7d 100%)',
    borderRadius: '25px',
    padding: '8px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  },
  card: {
    backgroundColor: '#1e3a52',
    borderRadius: '20px',
    padding: '30px',
    maxWidth: '600px',
    width: '100%',
    border: '3px solid #00bcd4',
    position: 'relative',
  },
  banner: {
    backgroundColor: '#8b2d8b',
    padding: '15px',
    borderRadius: '12px',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
  },
  logo: {
    width: '60px',
    height: '60px',
  },
  bannerText: {
    color: '#ffffff',
    fontSize: '36px',
    fontWeight: 'bold',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
  },
  title: {
    color: '#ffffff',
    fontSize: '32px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '25px',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
  },
  countdownOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: '20px',
    zIndex: 1000,
  },
  countdownText: {
    fontSize: '80px',
    fontWeight: 'bold',
    textShadow: '0 0 40px rgba(255, 255, 255, 0.8)',
  },
  playersSection: {
    marginBottom: '25px',
    backgroundColor: '#0a1929',
    padding: '20px',
    borderRadius: '12px',
    border: '2px solid #2c4a6d',
  },
  sectionTitle: {
    color: '#00bcd4',
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  playersGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
  },
  playerBox: {
    backgroundColor: '#2c4a6d',
    padding: '12px',
    borderRadius: '8px',
    textAlign: 'center',
    border: '2px solid #4a7ba7',
  },
  playerName: {
    color: '#ffffff',
    fontSize: '15px',
    fontWeight: 'bold',
    marginBottom: '5px',
  },
  hostBadge: {
    color: '#ff6600',
    fontSize: '11px',
    fontWeight: 'bold',
  },
  chatSection: {
    marginBottom: '25px',
    backgroundColor: '#0a1929',
    padding: '20px',
    borderRadius: '12px',
    border: '2px solid #2c4a6d',
  },
  chatMessages: {
    backgroundColor: '#1e3a52',
    padding: '15px',
    borderRadius: '8px',
    minHeight: '120px',
    maxHeight: '180px',
    overflowY: 'auto',
    marginBottom: '15px',
    border: '1px solid #2c4a6d',
  },
  chatMessage: {
    color: '#ffffff',
    fontSize: '14px',
    marginBottom: '8px',
    lineHeight: '1.4',
  },
  chatName: {
    color: '#00bcd4',
  },
  chatInputArea: {
    display: 'flex',
    gap: '10px',
  },
  chatInput: {
    flex: 1,
    padding: '12px',
    fontSize: '14px',
    borderRadius: '8px',
    border: '2px solid #00bcd4',
    backgroundColor: '#1e3a52',
    color: '#ffffff',
    boxSizing: 'border-box',
  },
  sendButton: {
    padding: '12px 24px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#00bcd4',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
  },
  startButton: {
    width: '100%',
    padding: '18px',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#00ff00',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0, 255, 0, 0.4)',
  },
  waitingMessage: {
    textAlign: 'center',
    color: '#00bcd4',
    fontSize: '18px',
    fontWeight: '500',
    padding: '18px',
    backgroundColor: '#0a1929',
    borderRadius: '10px',
    border: '2px solid #2c4a6d',
  },
};

export default WaitingRoomScreen;

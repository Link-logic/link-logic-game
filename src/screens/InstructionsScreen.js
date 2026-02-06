import React from 'react';

function InstructionsScreen({ onNavigate, playerId, playerName, role, roomNumber }) {
  const handleJoinGame = () => {
    // Check if user has registered
    if (!playerId || !playerName) {
      alert('Please register first before joining a game');
      onNavigate('welcome');
      return;
    }
    
    if (role === 'host') {
      onNavigate('hostroom', { playerId, playerName });
    } else {
      // Non-host needs room number
      if (!roomNumber) {
        alert('Please enter a room number first');
        onNavigate('welcome');
        return;
      }
      onNavigate('waiting', { playerId, playerName, roomNumber });
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Small Logo Banner */}
        <div style={styles.banner}>
          <img src="/smalllogo.png" alt="Link Logic" style={styles.logo} />
        </div>

        <h2 style={styles.title}>Instructions</h2>

        <div style={styles.content}>
          {/* Objective */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Objective</h3>
            <p style={styles.text}>
              Find creative connections between random words using a "link" word.
            </p>
          </div>

          {/* Game Setup */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>Game Setup (Host)</h3>
            <ol style={styles.list}>
              <li style={styles.listItem}>The Host texts invitations to registered players.</li>
              <li style={styles.listItem}>The Host then choses a "Preset" to set up the game parameters (# of rounds, # off words, # of bonus Words, and the time limit for each round).</li>
              <li style={styles.listItem}>The Host can play the game as formatted or can edit the Presets and save the adjustments made. Presets can always be reset to the origin settings by pushing the Reset button.</li>
              <li style={styles.listItem}>Players enter the game through the texted invitation and their Room # and Players Name self populate. They then click "Join a Game to enter the active game room.</li>
            </ol>
          </div>

          {/* How to Play */}
          <div style={styles.section}>
            <h3 style={styles.sectionTitle}>How to Play</h3>
            <ol style={styles.list}>
              <li style={styles.listItem}>The Host then starts the game, the count down begins, and the game screen appears.</li>
              <li style={styles.listItem}>Each player see's the number of preselect random words in a table at the top of the page, with random "Bonus" words highlighted.</li>
            </ol>
          </div>
        </div>

        {/* Join Button */}
        <button onClick={handleJoinGame} style={styles.joinButton}>
          Join the Game
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
  content: {
    marginBottom: '30px',
  },
  section: {
    marginBottom: '25px',
  },
  sectionTitle: {
    color: '#e67e22',
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '12px',
  },
  text: {
    color: '#ffffff',
    fontSize: '16px',
    lineHeight: '1.7',
    margin: 0,
  },
  list: {
    color: '#ffffff',
    fontSize: '16px',
    lineHeight: '1.8',
    paddingLeft: '25px',
    margin: 0,
  },
  listItem: {
    marginBottom: '12px',
  },
  joinButton: {
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

export default InstructionsScreen;
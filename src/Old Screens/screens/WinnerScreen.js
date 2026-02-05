import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../config/firebase';
import ScreenFrame from '../components/ScreenFrame';

function WinnerScreen({ onNavigate, playerId, playerName, roomNumber, isHost }) {
  const [standings, setStandings] = useState([]);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const roomRef = ref(database, `rooms/${roomNumber}`);
    
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        if (data.players) {
          const playersList = Object.entries(data.players).map(([id, player]) => ({
            id,
            playerName: player.playerName,
            totalPoints: player.points || 0
          }));
          
          const sortedPlayers = playersList.sort((a, b) => b.totalPoints - a.totalPoints);
          setStandings(sortedPlayers);
          
          if (sortedPlayers.length > 0) {
            setWinner(sortedPlayers[0]);
          }
        }

        if (data.status === 'waiting') {
          onNavigate('waiting', { playerId, playerName, roomNumber, isHost });
        }
      }
    });

    return () => unsubscribe();
  }, [roomNumber, onNavigate, playerId, playerName, isHost]);

  const newGame = async () => {
    if (!isHost) return;
    
    const roomRef = ref(database, `rooms/${roomNumber}`);
    await update(roomRef, {
      status: 'waiting',
      currentRound: 0,
      rounds: {},
      words: null,
      bonusIndices: null,
      challenges: null,
      defenses: null,
      votes: null
    });
  };

  const playAgain = async () => {
    if (!isHost) return;
    
    const roomRef = ref(database, `rooms/${roomNumber}`);
    
    const snapshot = await get(roomRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const resetPlayers = {};
      Object.entries(data.players || {}).forEach(([pId, player]) => {
        resetPlayers[pId] = {
          ...player,
          points: 0
        };
      });
      
      await update(roomRef, {
        players: resetPlayers,
        status: 'waiting',
        currentRound: 0,
        rounds: {},
        words: null,
        bonusIndices: null,
        challenges: null,
        defenses: null,
        votes: null
      });
    }
  };

  return (
    <ScreenFrame title="Winner">
      <div style={styles.content}>
        {/* Winner Section */}
        {winner && (
          <div style={styles.winnerSection}>
            <div style={styles.trophyIcon}>🏆</div>
            <h1 style={styles.winnerTitle}>Winner</h1>
            <div style={styles.winnerName}>{winner.playerName}</div>
            <div style={styles.winnerPoints}>{winner.totalPoints} Points</div>
          </div>
        )}

        {/* Final Standings */}
        <div style={styles.standingsSection}>
          <h2 style={styles.standingsTitle}>Final Standings</h2>
          <table style={styles.table}>
            <thead>
              <tr style={styles.headerRow}>
                <th style={styles.th}>Player Name</th>
                <th style={styles.thPoints}>Total Points</th>
              </tr>
            </thead>
            <tbody>
              {standings.map((player, index) => (
                <tr key={index} style={styles.row}>
                  <td style={styles.td}>{player.playerName}</td>
                  <td style={styles.tdPoints}>{player.totalPoints}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Action Buttons */}
        {isHost && (
          <div style={styles.buttonRow}>
            <button onClick={newGame} style={styles.newGameButton}>
              New Game
            </button>
            <button onClick={playAgain} style={styles.playAgainButton}>
              Play Again
            </button>
          </div>
        )}
      </div>
    </ScreenFrame>
  );
}

const styles = {
  content: {
    width: '100%',
    maxWidth: '600px',
  },
  winnerSection: {
    textAlign: 'center',
    marginBottom: '40px',
    padding: '30px',
    backgroundColor: '#1a3a52',
    borderRadius: '15px',
    border: '3px solid #e67e22',
  },
  trophyIcon: {
    fontSize: '80px',
    marginBottom: '15px',
  },
  winnerTitle: {
    color: '#e67e22',
    fontSize: '32px',
    fontWeight: 'bold',
    margin: '10px 0',
  },
  winnerName: {
    color: '#7dd3c0',
    fontSize: '28px',
    fontWeight: 'bold',
    margin: '15px 0',
  },
  winnerPoints: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  standingsSection: {
    marginBottom: '30px',
  },
  standingsTitle: {
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: 'bold',
    marginBottom: '15px',
    textAlign: 'center',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#1a3a52',
    borderRadius: '8px',
    overflow: 'hidden',
  },
  headerRow: {
    backgroundColor: '#4a7ba7',
  },
  th: {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    padding: '12px',
    textAlign: 'left',
  },
  thPoints: {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    padding: '12px',
    textAlign: 'center',
    width: '140px',
  },
  row: {
    borderBottom: '1px solid #2c4a6d',
  },
  td: {
    color: '#ffffff',
    fontSize: '15px',
    padding: '12px',
  },
  tdPoints: {
    color: '#7dd3c0',
    fontSize: '15px',
    padding: '12px',
    textAlign: 'center',
    fontWeight: 'bold',
  },
  buttonRow: {
    display: 'flex',
    gap: '15px',
  },
  newGameButton: {
    flex: 1,
    padding: '14px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#e67e22',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  playAgainButton: {
    flex: 1,
    padding: '14px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#7dd3c0',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
  },
};

export default WinnerScreen;

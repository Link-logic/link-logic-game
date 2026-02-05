import React, { useState, useEffect } from 'react';
import { ref, onValue, update, remove } from 'firebase/database';
import { database } from '../config/firebase';

function WinnerScreen({ onNavigate, playerId, playerName, roomNumber, isHost }) {
  const [standings, setStandings] = useState([]);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const roomRef = ref(database, `rooms/${roomNumber}`);
    
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        if (data.players && data.rounds) {
          const playerScores = {};
          
          Object.keys(data.players).forEach(pId => {
            const player = data.players[pId];
            playerScores[pId] = {
              playerName: player.playerName,
              totalPoints: 0
            };
          });

          Object.keys(data.rounds).forEach(roundKey => {
            const round = data.rounds[roundKey];
            if (round.submissions) {
              Object.entries(round.submissions).forEach(([pId, playerData]) => {
                if (playerScores[pId]) {
                  let roundPoints = playerData.totalPoints || 0;
                  
                  if (round.results) {
                    Object.entries(round.results).forEach(([resultKey, result]) => {
                      const [challengedPlayerId] = resultKey.split('-');
                      if (challengedPlayerId === pId && result === 'rejected') {
                        const submissionIndex = parseInt(resultKey.split('-')[1]);
                        const rejectedSubmission = playerData.submissions[submissionIndex];
                        if (rejectedSubmission) {
                          roundPoints -= rejectedSubmission.points;
                        }
                      }
                    });
                  }
                  
                  playerScores[pId].totalPoints += roundPoints;
                }
              });
            }
          });

          const sortedStandings = Object.values(playerScores).sort((a, b) => b.totalPoints - a.totalPoints);
          setStandings(sortedStandings);
          
          if (sortedStandings.length > 0) {
            setWinner(sortedStandings[0]);
          }
        }

        if (data.status === 'waiting') {
          onNavigate('waiting', { playerId, playerName, roomNumber, isHost });
        }
      }
    });

    return () => unsubscribe();
  }, [roomNumber, playerId, playerName, isHost, onNavigate]);

  const playAgain = async () => {
    if (!isHost) return;

    const roomRef = ref(database, `rooms/${roomNumber}`);
    
    await update(roomRef, {
      status: 'waiting',
      currentRound: 0,
      words: null,
      bonusIndices: null,
      rounds: null,
      chat: null
    });

    const snapshot = await onValue(ref(database, `rooms/${roomNumber}/players`), (snap) => {
      if (snap.exists()) {
        const players = snap.val();
        Object.keys(players).forEach(async (pId) => {
          await update(ref(database, `rooms/${roomNumber}/players/${pId}`), {
            points: 0
          });
        });
      }
    }, { onlyOnce: true });
  };

  const newGame = async () => {
    if (!isHost) return;

    const roomRef = ref(database, `rooms/${roomNumber}`);
    await remove(roomRef);
    
    onNavigate('hostroom', { playerId, playerName });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Small Logo Banner */}
        <div style={styles.banner}>
          <img src="/smalllogo.png" alt="Link Logic" style={styles.logo} />
        </div>

        {/* Winner Section */}
        {winner && (
          <div style={styles.winnerSection}>
            <img src="/trophy.png" alt="Trophy" style={styles.trophy} />
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
    maxWidth: '600px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.5)',
  },
  banner: {
    backgroundColor: '#8b2d8b',
    padding: '12px',
    borderRadius: '10px',
    marginBottom: '30px',
    textAlign: 'center',
  },
  logo: {
    maxWidth: '110px',
    height: 'auto',
  },
  winnerSection: {
    textAlign: 'center',
    marginBottom: '40px',
    padding: '30px',
    backgroundColor: '#1a3a52',
    borderRadius: '15px',
    border: '3px solid #e67e22',
  },
  trophy: {
    width: '100px',
    height: 'auto',
    marginBottom: '20px',
  },
  winnerTitle: {
    color: '#e67e22',
    fontSize: '36px',
    fontWeight: 'bold',
    marginBottom: '15px',
    margin: '0 0 15px 0',
  },
  winnerName: {
    color: '#7dd3c0',
    fontSize: '32px',
    fontWeight: 'bold',
    marginBottom: '10px',
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
    color: '#e67e22',
    fontSize: '24px',
    fontWeight: 'bold',
    marginBottom: '20px',
    textAlign: 'center',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    backgroundColor: '#1a3a52',
    borderRadius: '10px',
    overflow: 'hidden',
  },
  headerRow: {
    backgroundColor: '#2c4a6d',
    borderBottom: '2px solid #4a7ba7',
  },
  th: {
    color: '#ffffff',
    padding: '15px',
    textAlign: 'left',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  thPoints: {
    color: '#ffffff',
    padding: '15px',
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  row: {
    borderBottom: '1px solid #2c4a6d',
  },
  td: {
    color: '#ffffff',
    padding: '15px',
    fontSize: '16px',
  },
  tdPoints: {
    color: '#7dd3c0',
    padding: '15px',
    fontSize: '18px',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  buttonRow: {
    display: 'flex',
    gap: '15px',
  },
  newGameButton: {
    flex: 1,
    padding: '16px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#8b2d8b',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
  },
  playAgainButton: {
    flex: 1,
    padding: '16px',
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#7dd3c0',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
  },
};

export default WinnerScreen;
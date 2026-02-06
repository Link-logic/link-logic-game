import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ref, onValue, update, get } from 'firebase/database';
import { database } from '../config/firebase';

function LeaderBoardScreen({ onNavigate, playerId, playerName, roomNumber, isHost }) {
  const [standings, setStandings] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(5);
  const [playerReady, setPlayerReady] = useState({});
  const [allPlayers, setAllPlayers] = useState([]);
  const advanceTriggered = useRef(false);

  const advanceRound = useCallback(async () => {
    const roomRef = ref(database, `rooms/${roomNumber}`);
    
    // Get fresh data from Firebase to check rounds
    const snapshot = await get(roomRef);
    if (!snapshot.exists()) return;
    
    const data = snapshot.val();
    const maxRounds = data.settings?.rounds || 5;
    const round = data.currentRound || 1;
    
    console.log(`[ADVANCE] Current round: ${round}, Max rounds: ${maxRounds}`);
    
    if (round < maxRounds) {
      const nextRound = round + 1;
      console.log(`[ADVANCE] Advancing to round ${nextRound}`);
      await update(roomRef, {
        status: 'waiting',
        currentRound: nextRound,
        words: null,
        bonusIndices: null
      });
    } else {
      console.log('[ADVANCE] Game finished!');
      await update(roomRef, {
        status: 'finished'
      });
    }
  }, [roomNumber]);

  useEffect(() => {
    const roomRef = ref(database, `rooms/${roomNumber}`);
    
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        console.log('=== LEADER BOARD ===');
        console.log('[LEADERBOARD] Firebase update received');
        console.log('[LEADERBOARD] Current round:', data.currentRound);
        console.log('[LEADERBOARD] Status:', data.status);
        console.log('Players:', data.players);
        console.log('Rounds:', data.rounds);
        
        if (data.currentRound) {
          setCurrentRound(data.currentRound);
        }
        
        if (data.settings) {
          setTotalRounds(data.settings.rounds);
          console.log('[LEADERBOARD] Total rounds from settings:', data.settings.rounds);
        }

        if (data.players) {
          const playerIds = Object.keys(data.players);
          console.log('[LEADERBOARD] All player IDs:', playerIds);
          setAllPlayers(playerIds);
        }

        if (data.rounds) {
          const leaderboardReady = data.rounds[`round${data.currentRound}`]?.leaderboardReady || {};
          console.log(`[LEADERBOARD] Ready data for round${data.currentRound}:`, leaderboardReady);
          console.log(`[LEADERBOARD] Am I (${playerId}) ready?`, leaderboardReady[playerId]);
          setPlayerReady(leaderboardReady);
          
          // AUTO-ADVANCE: If all players are ready and I'm host, advance (only once)
          if (isHost && data.players && !advanceTriggered.current) {
            const playerIds = Object.keys(data.players);
            const allReady = playerIds.every(id => leaderboardReady[id] === true);
            
            console.log('[LEADERBOARD AUTO-ADVANCE] Checking...', {
              isHost,
              advanceTriggered: advanceTriggered.current,
              playersReady: Object.keys(leaderboardReady).filter(id => leaderboardReady[id]),
              allPlayers: playerIds,
              allReady
            });
            
            if (allReady && playerIds.length > 0) {
              console.log('[LEADERBOARD AUTO-ADVANCE] ✅ All players ready! Advancing...');
              advanceTriggered.current = true;
              advanceRound();
            }
          }
        }

        if (data.players && data.rounds) {
          const playerScores = {};
          
          // Initialize ALL players first with 0 points
          Object.keys(data.players).forEach(pId => {
            const player = data.players[pId];
            playerScores[pId] = {
              playerName: player.playerName,
              totalPoints: 0
            };
          });

          console.log('All players initialized:', playerScores);

          // Calculate scores from submissions
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

          console.log('Calculated standings:', playerScores);
          const sortedStandings = Object.values(playerScores).sort((a, b) => b.totalPoints - a.totalPoints);
          console.log('Sorted standings:', sortedStandings);
          setStandings(sortedStandings);
        }

        if (data.status === 'waiting') {
          console.log('[LEADERBOARD] Status changed to WAITING - navigating and resetting flag');
          advanceTriggered.current = false; // Reset for next round
          onNavigate('waiting', { playerId, playerName, roomNumber, isHost });
        } else if (data.status === 'finished') {
          console.log('[LEADERBOARD] Status changed to FINISHED - navigating to winner');
          onNavigate('winner', { playerId, playerName, roomNumber, isHost });
        }
      }
    });

    return () => unsubscribe();
  }, [roomNumber, playerId, playerName, isHost, onNavigate, advanceRound]);

  const markReady = async () => {
    console.log('');
    console.log('============================================');
    console.log('[BUTTON CLICK] Round button clicked!');
    console.log('[BUTTON CLICK] playerId:', playerId);
    console.log('[BUTTON CLICK] currentRound:', currentRound);
    console.log('[BUTTON CLICK] Current playerReady state:', playerReady);
    console.log('[BUTTON CLICK] Is button disabled?', playerReady[playerId]);
    console.log('============================================');
    
    const roomRef = ref(database, `rooms/${roomNumber}`);
    const readyPath = `rounds/round${currentRound}/leaderboardReady/${playerId}`;
    
    console.log('[BUTTON CLICK] Setting Firebase path:', readyPath);
    
    try {
      await update(roomRef, {
        [readyPath]: true
      });
      console.log('[BUTTON CLICK] ✅ Successfully marked ready in Firebase');
    } catch (error) {
      console.error('[BUTTON CLICK] ❌ Error marking ready:', error);
    }
  };

  const getNextRoundBonus = () => {
    const nextRound = currentRound + 1;
    if (nextRound === 2) return { 
      description: 'Link the words in the corners of the word grid.', 
      label: 'Corner',
      tiers: [[2, 30], [3, 50], [4, 100]] 
    };
    if (nextRound === 3) return { 
      description: 'Link words that are touching each other.', 
      label: 'Touching',
      tiers: [[2, 30], [3, 50], [4, 100]] 
    };
    if (nextRound === 4) return { 
      description: 'Link words on the outer edge of the grid.', 
      label: 'Edge',
      tiers: [[2, 30], [3, 50], [4, 100]] 
    };
    if (nextRound === 5) return { 
      description: 'Link words in the same row or column.', 
      label: 'Line',
      tiers: [[2, 30], [3, 50], [4, 100]] 
    };
    return null;
  };

  const bonusInfo = currentRound < totalRounds ? getNextRoundBonus() : null;

  console.log('[RENDER] LeaderBoard rendering. currentRound:', currentRound, 'totalRounds:', totalRounds, 'playerReady:', playerReady);

  return (
    <div style={styles.outerContainer}>
      <div style={styles.container}>
        <div style={styles.card}>
          {/* Purple Banner */}
          <div style={styles.banner}>
            <img src="/smalllogo.png" alt="Link Logic" style={styles.logo} />
            <div style={styles.bannerText}>Link Logic</div>
          </div>

          <h2 style={styles.title}>Leader Board</h2>
          <h3 style={styles.subtitle}>Current Standings</h3>

          {/* Standings Table */}
          {standings.length > 0 && (
            <div style={styles.tableContainer}>
              <table style={styles.table}>
                <thead>
                  <tr style={styles.headerRow}>
                    <th style={styles.thPlayer}>Player</th>
                    <th style={styles.thPoints}>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {standings.map((player, index) => (
                    <tr key={index} style={index % 2 === 0 ? styles.evenRow : styles.oddRow}>
                      <td style={styles.tdPlayer}>{player.playerName}</td>
                      <td style={styles.tdPoints}>{player.totalPoints}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Bonus Info */}
          {bonusInfo && (
            <div style={styles.bonusContainer}>
              <div style={styles.bonusTitle}>Round {currentRound + 1} Bonus</div>
              <div style={styles.bonusDescription}>{bonusInfo.description}</div>
              <div style={styles.bonusTiers}>
                {bonusInfo.tiers.map(([count, points], index) => (
                  <div key={index} style={styles.bonusTier}>
                    <span style={styles.tierLabel}>Link {count} {bonusInfo.label} words</span>
                    <span style={styles.tierPoints}>{points} Bonus Pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Round Button */}
          <button 
            onClick={markReady}
            disabled={playerReady[playerId]}
            style={{
              ...styles.roundButton,
              ...(playerReady[playerId] ? styles.disabledButton : {})
            }}
          >
            {playerReady[playerId] 
              ? 'Waiting for others...' 
              : (currentRound < totalRounds ? `Round ${currentRound + 1}` : 'Final Round')
            }
          </button>
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
    width: '100%',
    maxWidth: '600px',
  },
  card: {
    background: 'linear-gradient(180deg, #4a7ba7 0%, #2c5a7d 100%)',
    borderRadius: '25px',
    padding: '8px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
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
    marginBottom: '10px',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
  },
  subtitle: {
    color: '#ff6600',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '20px',
    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.3)',
  },
  tableContainer: {
    backgroundColor: '#000000',
    borderRadius: '15px',
    padding: '15px',
    marginBottom: '25px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  headerRow: {
    backgroundColor: '#8b2d8b',
  },
  thPlayer: {
    color: '#ffffff',
    padding: '12px',
    textAlign: 'left',
    fontSize: '18px',
    fontWeight: 'bold',
    borderTopLeftRadius: '8px',
  },
  thPoints: {
    color: '#ffffff',
    padding: '12px',
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
    borderTopRightRadius: '8px',
  },
  evenRow: {
    backgroundColor: '#ffffff',
  },
  oddRow: {
    backgroundColor: '#f0f0f0',
  },
  tdPlayer: {
    padding: '12px',
    fontSize: '16px',
    color: '#000000',
  },
  tdPoints: {
    padding: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#000000',
  },
  bonusContainer: {
    backgroundColor: '#000000',
    border: '3px solid #ff0000',
    borderRadius: '15px',
    padding: '20px',
    marginBottom: '25px',
  },
  bonusTitle: {
    backgroundColor: '#ff0000',
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: '10px',
    borderRadius: '8px',
    marginBottom: '15px',
  },
  bonusDescription: {
    color: '#ffffff',
    fontSize: '16px',
    textAlign: 'center',
    marginBottom: '15px',
    lineHeight: '1.4',
  },
  bonusTiers: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  },
  bonusTier: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 15px',
    backgroundColor: '#1a1a1a',
    borderRadius: '8px',
  },
  tierLabel: {
    color: '#ffffff',
    fontSize: '16px',
  },
  tierPoints: {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  roundButton: {
    width: '100%',
    padding: '18px',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#8b2d8b',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(139, 45, 139, 0.4)',
    transition: 'all 0.2s',
  },
  disabledButton: {
    backgroundColor: '#555555',
    cursor: 'not-allowed',
    opacity: 0.6,
  },
};

export default LeaderBoardScreen;

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../config/firebase';

function ScoringScreen({ onNavigate, playerId, playerName, roomNumber, isHost }) {
  const [roundData, setRoundData] = useState({});
  const [challenges, setChallenges] = useState({});
  const [playerReady, setPlayerReady] = useState({});
  const [currentRound, setCurrentRound] = useState(1);
  const advanceTriggered = useRef(false);

  const advanceToChallenge = useCallback(async () => {
    const roomRef = ref(database, `rooms/${roomNumber}`);
    console.log('Advancing to challenge screen...');
    await update(roomRef, {
      status: 'challenge'
    });
  }, [roomNumber]);

  useEffect(() => {
    const roomRef = ref(database, `rooms/${roomNumber}`);
    
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        if (data.currentRound) {
          setCurrentRound(data.currentRound);
        }

        if (data.rounds && data.rounds[`round${data.currentRound}`]) {
          const roundInfo = data.rounds[`round${data.currentRound}`];
          setRoundData(roundInfo.submissions || {});
          setChallenges(roundInfo.challenges || {});
          setPlayerReady(roundInfo.playersReady || {});
          
          // AUTO-ADVANCE: If all players ready and I'm host, advance (only once)
          if (isHost && roundInfo.submissions && !advanceTriggered.current) {
            const allPlayerIds = Object.keys(roundInfo.submissions);
            const readyData = roundInfo.playersReady || {};
            const allReady = allPlayerIds.every(id => readyData[id] === true);
            
            if (allReady && allPlayerIds.length > 0) {
              console.log('All players ready on scoring! Advancing to challenge...');
              advanceTriggered.current = true;
              advanceToChallenge();
            }
          }
        }

        if (data.status === 'challenge') {
          advanceTriggered.current = false; // Reset for next screen
          onNavigate('challenge', { playerId, playerName, roomNumber, isHost });
        }
      }
    });

    return () => unsubscribe();
  }, [roomNumber, playerId, playerName, isHost, onNavigate, currentRound, advanceToChallenge]);

  const toggleChallenge = async (targetPlayerId, submissionIndex) => {
    const roomRef = ref(database, `rooms/${roomNumber}`);
    const challengePath = `rounds/round${currentRound}/challenges/${targetPlayerId}`;
    
    const currentChallenges = challenges[targetPlayerId] || [];
    let newChallenges;
    
    if (currentChallenges.includes(submissionIndex)) {
      newChallenges = currentChallenges.filter(i => i !== submissionIndex);
    } else {
      newChallenges = [...currentChallenges, submissionIndex];
    }
    
    if (newChallenges.length === 0) {
      await update(roomRef, {
        [challengePath]: null
      });
    } else {
      await update(roomRef, {
        [challengePath]: newChallenges
      });
    }
  };

  const markReady = async () => {
    const roomRef = ref(database, `rooms/${roomNumber}`);
    console.log('Marking player ready on scoring:', playerId);
    await update(roomRef, {
      [`rounds/round${currentRound}/playersReady/${playerId}`]: true
    });
    // The onValue listener above will detect when all players are ready
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

          <h2 style={styles.title}>Scoring - Round {currentRound}</h2>

          <div style={styles.scoringSection}>
            {Object.entries(roundData).map(([pId, playerData]) => (
              <div key={pId} style={styles.playerSection}>
                <h3 style={styles.playerName}>{playerData.playerName}</h3>
                
                {playerData.submissions && playerData.submissions.map((submission, index) => {
                  const isChallenged = challenges[pId] && challenges[pId].includes(index);
                  
                  return (
                    <div key={index} style={styles.submissionRow}>
                      <div style={styles.wordsColumn}>
                        <strong>Words:</strong> {submission.words.join(' - ')}
                      </div>
                      <div style={styles.linkColumn}>
                        <strong>Link:</strong> {submission.linkWord}
                      </div>
                      <div style={styles.pointsColumn}>
                        <strong>Pts:</strong> {submission.points}
                      </div>
                      <div style={styles.challengeColumn}>
                        {pId !== playerId && (
                          <button
                            onClick={() => toggleChallenge(pId, index)}
                            style={{
                              ...styles.challengeButton,
                              ...(isChallenged ? styles.challengedButton : {})
                            }}
                          >
                            ?
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
                
                <div style={styles.totalRow}>
                  Total Points: {playerData.totalPoints || 0}
                </div>
              </div>
            ))}
          </div>

          <button 
            onClick={markReady} 
            disabled={playerReady[playerId]}
            style={{
              ...styles.challengeBottomButton,
              ...(playerReady[playerId] ? styles.disabledButton : {})
            }}
          >
            {playerReady[playerId] ? 'Waiting for others...' : 'Challenge'}
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
    background: 'linear-gradient(180deg, #4a7ba7 0%, #2c5a7d 100%)',
    borderRadius: '25px',
    padding: '8px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5)',
  },
  card: {
    backgroundColor: '#1e3a52',
    borderRadius: '20px',
    padding: '30px',
    maxWidth: '900px',
    width: '100%',
    maxHeight: '90vh',
    overflowY: 'auto',
    border: '3px solid #00bcd4',
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
    fontSize: '28px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '25px',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
  },
  scoringSection: {
    marginBottom: '25px',
  },
  playerSection: {
    backgroundColor: '#0a1929',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    border: '2px solid #2c4a6d',
  },
  playerName: {
    color: '#00bcd4',
    fontSize: '22px',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  submissionRow: {
    backgroundColor: '#1e3a52',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '10px',
    display: 'flex',
    alignItems: 'center',
    gap: '15px',
    border: '1px solid #2c4a6d',
  },
  wordsColumn: {
    flex: 2,
    color: '#ffffff',
    fontSize: '14px',
  },
  linkColumn: {
    flex: 1,
    color: '#ffffff',
    fontSize: '14px',
  },
  pointsColumn: {
    flex: 0.5,
    color: '#ffffff',
    fontSize: '14px',
  },
  challengeColumn: {
    flex: 0.3,
  },
  challengeButton: {
    width: '45px',
    height: '45px',
    borderRadius: '50%',
    backgroundColor: '#ff6600',
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: 'bold',
    border: 'none',
    cursor: 'pointer',
  },
  challengedButton: {
    backgroundColor: '#ff0000',
    boxShadow: '0 0 20px rgba(255, 0, 0, 0.8)',
  },
  totalRow: {
    color: '#00ff00',
    fontSize: '18px',
    fontWeight: 'bold',
    marginTop: '15px',
    textAlign: 'right',
  },
  challengeBottomButton: {
    width: '100%',
    padding: '18px',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#ff6600',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(255, 102, 0, 0.4)',
  },
  disabledButton: {
    backgroundColor: '#555555',
    cursor: 'not-allowed',
    opacity: 0.6,
    boxShadow: 'none',
  },
};

export default ScoringScreen;

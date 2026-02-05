import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../config/firebase';

function ChallengeScreen({ onNavigate, playerId, playerName, roomNumber, isHost }) {
  const [challenges, setChallenges] = useState({});
  const [defenses, setDefenses] = useState({});
  const [votes, setVotes] = useState({});
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(5);
  const [roundData, setRoundData] = useState({});
  const [playerCount, setPlayerCount] = useState(0);

  useEffect(() => {
    const roomRef = ref(database, `rooms/${roomNumber}`);
    
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        if (data.currentRound) {
          setCurrentRound(data.currentRound);
        }
        
        if (data.settings) {
          setTotalRounds(data.settings.rounds);
        }

        if (data.players) {
          setPlayerCount(Object.keys(data.players).length);
        }

        if (data.rounds && data.rounds[`round${data.currentRound}`]) {
          const roundInfo = data.rounds[`round${data.currentRound}`];
          setRoundData(roundInfo.submissions || {});
          setChallenges(roundInfo.challenges || {});
          
          if (roundInfo.defenses) {
            setDefenses(roundInfo.defenses);
          }
          
          if (roundInfo.votes) {
            setVotes(roundInfo.votes);
          }
        }

        if (data.status === 'waiting') {
          onNavigate('waiting', { playerId, playerName, roomNumber, isHost });
        } else if (data.status === 'finished') {
          onNavigate('winner', { playerId, playerName, roomNumber, isHost });
        }
      }
    });

    return () => unsubscribe();
  }, [roomNumber, playerId, playerName, isHost, onNavigate]);

  const submitDefense = async (targetPlayerId, submissionIndex, defense) => {
    const roomRef = ref(database, `rooms/${roomNumber}`);
    await update(roomRef, {
      [`rounds/round${currentRound}/defenses/${targetPlayerId}-${submissionIndex}`]: defense
    });
  };

  const submitVote = async (targetPlayerId, submissionIndex, voteValue) => {
    const roomRef = ref(database, `rooms/${roomNumber}`);
    const voteKey = `${targetPlayerId}-${submissionIndex}`;
    
    await update(roomRef, {
      [`rounds/round${currentRound}/votes/${voteKey}/${playerId}`]: voteValue
    });
  };

  const processNextRound = async () => {
    if (!isHost) return;

    const roomRef = ref(database, `rooms/${roomNumber}`);
    
    const results = {};
    Object.keys(challenges).forEach(challengedPlayerId => {
      challenges[challengedPlayerId].forEach(submissionIndex => {
        const voteKey = `${challengedPlayerId}-${submissionIndex}`;
        const voteData = votes[voteKey] || {};
        
        const acceptVotes = Object.values(voteData).filter(v => v === 'accept').length;
        const totalVotes = Object.keys(voteData).length;
        
        const isAccepted = playerCount === 2 || (acceptVotes / totalVotes) >= 0.5;
        
        results[voteKey] = isAccepted ? 'accepted' : 'rejected';
      });
    });

    if (currentRound < totalRounds) {
      await update(roomRef, {
        [`rounds/round${currentRound}/results`]: results,
        status: 'waiting',
        words: null,
        bonusIndices: null
      });
    } else {
      await update(roomRef, {
        [`rounds/round${currentRound}/results`]: results,
        status: 'finished'
      });
    }
  };

  const hasChallenges = Object.keys(challenges).length > 0;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Small Logo Banner */}
        <div style={styles.banner}>
          <img src="/smalllogo.png" alt="Link Logic" style={styles.logo} />
        </div>

        <h2 style={styles.title}>LINK DEFENSE</h2>

        {!hasChallenges ? (
          <div style={styles.noChallenges}>
            No challenges this round!
          </div>
        ) : (
          <div style={styles.challengeSection}>
            {Object.entries(challenges).map(([challengedPlayerId, submissionIndices]) => {
              const playerData = roundData[challengedPlayerId];
              if (!playerData) return null;

              return (
                <div key={challengedPlayerId} style={styles.playerSection}>
                  <h3 style={styles.playerName}>{playerData.playerName}</h3>
                  
                  {submissionIndices.map(submissionIndex => {
                    const submission = playerData.submissions[submissionIndex];
                    const defenseKey = `${challengedPlayerId}-${submissionIndex}`;
                    const voteKey = `${challengedPlayerId}-${submissionIndex}`;
                    const currentVotes = votes[voteKey] || {};
                    
                    const acceptCount = Object.values(currentVotes).filter(v => v === 'accept').length;
                    const rejectCount = Object.values(currentVotes).filter(v => v === 'reject').length;
                    
                    return (
                      <div key={submissionIndex} style={styles.challengeItem}>
                        <table style={styles.table}>
                          <tbody>
                            <tr>
                              <td style={styles.tdLabel}># Words Selected</td>
                              <td style={styles.tdValue}>{submission.words.join(' - ')}</td>
                              <td style={styles.tdButtons} rowSpan="2">
                                {challengedPlayerId !== playerId && (
                                  <div style={styles.voteButtons}>
                                    <button
                                      onClick={() => submitVote(challengedPlayerId, submissionIndex, 'accept')}
                                      style={{
                                        ...styles.voteButton,
                                        ...styles.acceptButton,
                                        ...(currentVotes[playerId] === 'accept' ? styles.voteActive : {})
                                      }}
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => submitVote(challengedPlayerId, submissionIndex, 'reject')}
                                      style={{
                                        ...styles.voteButton,
                                        ...styles.rejectButton,
                                        ...(currentVotes[playerId] === 'reject' ? styles.voteActive : {})
                                      }}
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </td>
                            </tr>
                            <tr>
                              <td style={styles.tdLabel}>Link Word</td>
                              <td style={styles.tdValue}>{submission.linkWord}</td>
                            </tr>
                          </tbody>
                        </table>
                        
                        {challengedPlayerId === playerId && (
                          <div style={styles.defenseSection}>
                            <label style={styles.defenseLabel}>Defense:</label>
                            <textarea
                              placeholder="Explain your link..."
                              onChange={(e) => submitDefense(challengedPlayerId, submissionIndex, e.target.value)}
                              defaultValue={defenses[defenseKey] || ''}
                              style={styles.textarea}
                              rows="2"
                            />
                          </div>
                        )}
                        
                        <div style={styles.resultRow}>
                          {playerCount === 2 ? (
                            <span style={styles.accepted}>✓ Accept</span>
                          ) : (
                            acceptCount + rejectCount > 0 && (
                              <span style={(acceptCount / (acceptCount + rejectCount)) >= 0.5 ? styles.accepted : styles.rejected}>
                                {(acceptCount / (acceptCount + rejectCount)) >= 0.5 ? '✓ Accept' : '✗ Reject'}
                              </span>
                            )
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {/* Host Control */}
        {isHost && (
          <button onClick={processNextRound} style={styles.nextButton}>
            {currentRound < totalRounds ? 'Next Round' : 'Game Over'}
          </button>
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
    maxWidth: '850px',
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
    color: '#e67e22',
    fontSize: '28px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '30px',
  },
  noChallenges: {
    color: '#ffffff',
    fontSize: '20px',
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#1a3a52',
    borderRadius: '10px',
    marginBottom: '30px',
  },
  challengeSection: {
    marginBottom: '30px',
  },
  playerSection: {
    backgroundColor: '#1a3a52',
    padding: '20px',
    borderRadius: '10px',
    marginBottom: '20px',
  },
  playerName: {
    color: '#e67e22',
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '15px',
  },
  challengeItem: {
    backgroundColor: '#2c4a6d',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '15px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  tdLabel: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold',
    padding: '8px',
    width: '30%',
  },
  tdValue: {
    color: '#ffffff',
    fontSize: '14px',
    padding: '8px',
  },
  tdButtons: {
    padding: '8px',
    textAlign: 'center',
    verticalAlign: 'middle',
    width: '25%',
  },
  voteButtons: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  voteButton: {
    padding: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#ffffff',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  acceptButton: {
    backgroundColor: '#7dd3c0',
  },
  rejectButton: {
    backgroundColor: '#ff6b6b',
  },
  voteActive: {
    boxShadow: '0 0 15px rgba(255, 255, 255, 0.6)',
  },
  defenseSection: {
    marginTop: '15px',
  },
  defenseLabel: {
    display: 'block',
    color: '#ffffff',
    fontSize: '14px',
    marginBottom: '8px',
    fontWeight: 'bold',
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
    resize: 'vertical',
  },
  resultRow: {
    marginTop: '15px',
    textAlign: 'center',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  accepted: {
    color: '#7dd3c0',
  },
  rejected: {
    color: '#ff6b6b',
  },
  nextButton: {
    width: '100%',
    padding: '18px',
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#7dd3c0',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
  },
};

export default ChallengeScreen;
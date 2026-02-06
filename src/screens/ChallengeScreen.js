import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../config/firebase';

function ChallengeScreen({ onNavigate, playerId, playerName, roomNumber, isHost }) {
  const [challenges, setChallenges] = useState({});
  const [defenses, setDefenses] = useState({});
  const [votes, setVotes] = useState({});
  const [playerReady, setPlayerReady] = useState({});
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(5);
  const [roundData, setRoundData] = useState({});
  const [playerCount, setPlayerCount] = useState(0);
  const advanceTriggered = useRef(false);

  const finishChallenge = useCallback(async (challengesData, votesData) => {
    const roomRef = ref(database, `rooms/${roomNumber}`);
    
    const results = {};
    Object.keys(challengesData).forEach(challengedPlayerId => {
      challengesData[challengedPlayerId].forEach(submissionIndex => {
        const voteKey = `${challengedPlayerId}-${submissionIndex}`;
        const voteData = votesData[voteKey] || {};
        
        const acceptVotes = Object.values(voteData).filter(v => v === 'accept').length;
        const totalVotes = Object.keys(voteData).length;
        
        const isAccepted = totalVotes > 0 && (acceptVotes / totalVotes) >= 0.5;
        
        results[voteKey] = isAccepted ? 'accepted' : 'rejected';
      });
    });

    if (currentRound < totalRounds) {
      console.log('Advancing to leaderboard with results...');
      await update(roomRef, {
        [`rounds/round${currentRound}/results`]: results,
        status: 'leaderboard'
      });
    } else {
      console.log('Game finished!');
      await update(roomRef, {
        [`rounds/round${currentRound}/results`]: results,
        status: 'finished'
      });
    }
  }, [roomNumber, currentRound, totalRounds]);

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
          setDefenses(roundInfo.defenses || {});
          setVotes(roundInfo.votes || {});
          setPlayerReady(roundInfo.challengeReady || {});
          
          // AUTO-ADVANCE: If all players ready and I'm host, advance (only once)
          if (isHost && roundInfo.submissions && !advanceTriggered.current) {
            const allPlayerIds = Object.keys(roundInfo.submissions);
            const readyData = roundInfo.challengeReady || {};
            const allReady = allPlayerIds.every(id => readyData[id] === true);
            
            if (allReady && allPlayerIds.length > 0) {
              console.log('All players ready on challenge! Advancing...');
              advanceTriggered.current = true;
              finishChallenge(roundInfo.challenges || {}, roundInfo.votes || {});
            }
          }
        }

        if (data.status === 'leaderboard') {
          advanceTriggered.current = false; // Reset for next round
          onNavigate('leaderboard', { playerId, playerName, roomNumber, isHost });
        } else if (data.status === 'finished') {
          onNavigate('winner', { playerId, playerName, roomNumber, isHost });
        }
      }
    });

    return () => unsubscribe();
  }, [roomNumber, playerId, playerName, isHost, onNavigate, finishChallenge]);

  const updateDefense = async (targetPlayerId, submissionIndex, defense) => {
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

  const markReady = async () => {
    const roomRef = ref(database, `rooms/${roomNumber}`);
    console.log('Marking player ready on challenge:', playerId);
    await update(roomRef, {
      [`rounds/round${currentRound}/challengeReady/${playerId}`]: true
    });
    // The onValue listener above will detect when all players are ready
  };

  const hasChallenges = Object.keys(challenges).length > 0;

  return (
    <div style={styles.outerContainer}>
      <div style={styles.container}>
        <div style={styles.card}>
          {/* Purple Banner */}
          <div style={styles.banner}>
            <img src="/smalllogo.png" alt="Link Logic" style={styles.logo} />
            <div style={styles.bannerText}>Link Logic</div>
          </div>

          <h2 style={styles.title}>Challenge</h2>
          <h3 style={styles.subtitle}>Link Defense</h3>

          {!hasChallenges ? (
            <div style={styles.noChallenges}>No challenges this round!</div>
          ) : (
            <div style={styles.challengeContainer}>
              {Object.entries(challenges).map(([challengedPlayerId, submissionIndices]) => {
                const playerData = roundData[challengedPlayerId];
                if (!playerData) return null;

                const isMyChallenge = challengedPlayerId === playerId;

                return (
                  <div key={challengedPlayerId} style={styles.playerBlock}>
                    <div style={styles.playerHeader}>{playerData.playerName}</div>

                    <table style={styles.table}>
                      <thead>
                        <tr style={styles.headerRow}>
                          <th style={styles.thWords}>Words</th>
                          <th style={styles.thLink}>Link</th>
                          <th style={styles.thAccept}>Accept</th>
                          <th style={styles.thReject}>Reject</th>
                          <th style={styles.thVerdict}>Verdict</th>
                        </tr>
                      </thead>
                      <tbody>
                        {submissionIndices.map(submissionIndex => {
                          const submission = playerData.submissions[submissionIndex];
                          const defenseKey = `${challengedPlayerId}-${submissionIndex}`;
                          const voteKey = `${challengedPlayerId}-${submissionIndex}`;
                          const currentVotes = votes[voteKey] || {};
                          const currentDefense = defenses[defenseKey] || '';
                          
                          const acceptCount = Object.values(currentVotes).filter(v => v === 'accept').length;
                          const rejectCount = Object.values(currentVotes).filter(v => v === 'reject').length;
                          const totalVotes = acceptCount + rejectCount;
                          
                          let verdict = '';
                          let verdictColor = '#ffffff';
                          if (totalVotes > 0) {
                            const isAccepted = (acceptCount / totalVotes) >= 0.5;
                            verdict = isAccepted ? 'Accept' : 'Reject';
                            verdictColor = isAccepted ? '#00ff00' : '#ff0000';
                          }
                          
                          return (
                            <React.Fragment key={submissionIndex}>
                              <tr style={styles.dataRow}>
                                <td style={styles.tdWords}>{submission.words.join(' - ')}</td>
                                <td style={styles.tdLink}>{submission.linkWord}</td>
                                <td style={styles.tdButton}>
                                  {!isMyChallenge && (
                                    <button
                                      onClick={() => submitVote(challengedPlayerId, submissionIndex, 'accept')}
                                      style={{
                                        ...styles.voteButton,
                                        ...styles.acceptButton,
                                        ...(currentVotes[playerId] === 'accept' ? styles.voteActive : {})
                                      }}
                                    >
                                      👍
                                    </button>
                                  )}
                                </td>
                                <td style={styles.tdButton}>
                                  {!isMyChallenge && (
                                    <button
                                      onClick={() => submitVote(challengedPlayerId, submissionIndex, 'reject')}
                                      style={{
                                        ...styles.voteButton,
                                        ...styles.rejectButton,
                                        ...(currentVotes[playerId] === 'reject' ? styles.voteActive : {})
                                      }}
                                    >
                                      👎
                                    </button>
                                  )}
                                </td>
                                <td style={{ ...styles.tdVerdict, color: verdictColor }}>
                                  {verdict}
                                </td>
                              </tr>
                              
                              <tr style={styles.defenseRow}>
                                <td colSpan="5" style={styles.defenseCell}>
                                  {isMyChallenge ? (
                                    <input
                                      type="text"
                                      value={currentDefense}
                                      onChange={(e) => updateDefense(challengedPlayerId, submissionIndex, e.target.value)}
                                      placeholder="Type your defense..."
                                      style={styles.defenseInput}
                                    />
                                  ) : (
                                    <div style={styles.defenseDisplay}>
                                      <em>{currentDefense || 'Defense'}</em>
                                    </div>
                                  )}
                                </td>
                              </tr>
                            </React.Fragment>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>
          )}

          <button 
            onClick={markReady}
            disabled={playerReady[playerId]}
            style={{
              ...styles.leaderBoardButton,
              ...(playerReady[playerId] ? styles.disabledButton : {})
            }}
          >
            {playerReady[playerId] ? 'Waiting for others...' : 'Leader Board'}
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
    color: '#ff6600',
    fontSize: '32px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '5px',
    textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
  },
  subtitle: {
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '25px',
  },
  noChallenges: {
    color: '#ffffff',
    fontSize: '20px',
    textAlign: 'center',
    padding: '40px',
    backgroundColor: '#0a1929',
    borderRadius: '12px',
    marginBottom: '25px',
    border: '2px solid #2c4a6d',
  },
  challengeContainer: {
    marginBottom: '25px',
  },
  playerBlock: {
    backgroundColor: '#000000',
    padding: '20px',
    borderRadius: '12px',
    marginBottom: '20px',
    border: '2px solid #2c4a6d',
  },
  playerHeader: {
    color: '#ff0000',
    fontSize: '22px',
    fontWeight: 'bold',
    marginBottom: '15px',
    textAlign: 'left',
    paddingLeft: '10px',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  headerRow: {
    backgroundColor: '#8b2d8b',
  },
  thWords: {
    color: '#ffffff',
    padding: '12px 8px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  thLink: {
    color: '#ffffff',
    padding: '12px 8px',
    textAlign: 'left',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  thAccept: {
    color: '#ffffff',
    padding: '12px 8px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    width: '80px',
  },
  thReject: {
    color: '#ffffff',
    padding: '12px 8px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    width: '80px',
  },
  thVerdict: {
    color: '#ffffff',
    padding: '12px 8px',
    textAlign: 'center',
    fontSize: '14px',
    fontWeight: 'bold',
    width: '100px',
  },
  dataRow: {
    backgroundColor: '#2c4a6d',
  },
  tdWords: {
    color: '#00bcd4',
    padding: '12px 8px',
    fontSize: '14px',
  },
  tdLink: {
    color: '#ffffff',
    padding: '12px 8px',
    fontSize: '14px',
    fontWeight: 'bold',
  },
  tdButton: {
    padding: '8px',
    textAlign: 'center',
  },
  tdVerdict: {
    padding: '12px 8px',
    textAlign: 'center',
    fontSize: '16px',
    fontWeight: 'bold',
  },
  voteButton: {
    padding: '8px 16px',
    fontSize: '20px',
    border: 'none',
    borderRadius: '50%',
    cursor: 'pointer',
    width: '45px',
    height: '45px',
  },
  acceptButton: {
    backgroundColor: '#00ff00',
  },
  rejectButton: {
    backgroundColor: '#ff0000',
  },
  voteActive: {
    boxShadow: '0 0 20px rgba(255, 255, 255, 0.9)',
    transform: 'scale(1.15)',
  },
  defenseRow: {
    backgroundColor: '#000000',
    borderBottom: '2px solid #1a3a52',
  },
  defenseCell: {
    padding: '12px 10px',
  },
  defenseInput: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    borderRadius: '6px',
    border: '2px solid #00bcd4',
    backgroundColor: '#1e3a52',
    color: '#ffffff',
    boxSizing: 'border-box',
    fontStyle: 'italic',
  },
  defenseDisplay: {
    color: '#ffffff',
    fontSize: '14px',
    fontStyle: 'italic',
    padding: '8px',
  },
  leaderBoardButton: {
    width: '100%',
    padding: '18px',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#ff0000',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(255, 0, 0, 0.4)',
  },
  disabledButton: {
    backgroundColor: '#555555',
    cursor: 'not-allowed',
    opacity: 0.6,
    boxShadow: 'none',
  },
};

export default ChallengeScreen;

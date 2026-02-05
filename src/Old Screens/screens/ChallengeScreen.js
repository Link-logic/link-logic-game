import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../config/firebase';
import ScreenFrame from '../components/ScreenFrame';

function ChallengeScreen({ onNavigate, playerId, playerName, roomNumber, isHost }) {
  const [challenges, setChallenges] = useState({});
  const [roundData, setRoundData] = useState({});
  const [defenses, setDefenses] = useState({});
  const [votes, setVotes] = useState({});
  const [currentRound, setCurrentRound] = useState(1);
  const [playerCount, setPlayerCount] = useState(0);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const roomRef = ref(database, `rooms/${roomNumber}`);
    
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        if (data.currentRound) {
          setCurrentRound(data.currentRound);
        }

        if (data.challenges) {
          setChallenges(data.challenges);
        }

        if (data.settings) {
          setSettings(data.settings);
        }

        if (data.players) {
          setPlayerCount(Object.keys(data.players).length);
        }

        if (data.rounds && data.rounds[data.currentRound]) {
          const round = data.rounds[data.currentRound];
          const formattedData = {};
          Object.entries(round.submissions || {}).forEach(([pId, submissions]) => {
            formattedData[pId] = {
              playerName: submissions[0]?.playerName || 'Unknown',
              submissions: Object.values(submissions).map(sub => ({
                words: [sub.word1, sub.word2],
                linkWord: sub.linkWord,
                points: sub.points || 10
              }))
            };
          });
          setRoundData(formattedData);
        }

        if (data.defenses) {
          setDefenses(data.defenses);
        }

        if (data.votes) {
          setVotes(data.votes);
        }

        if (data.status === 'leaderboard' || data.status === 'finished') {
          onNavigate('leaderboard', { playerId, playerName, roomNumber, isHost });
        }
      }
    });

    return () => unsubscribe();
  }, [roomNumber, onNavigate, playerId, playerName, isHost]);

  const submitDefense = async (challengedPlayerId, submissionIndex, defense) => {
    const defenseKey = `${challengedPlayerId}-${submissionIndex}`;
    const roomRef = ref(database, `rooms/${roomNumber}`);
    await update(roomRef, {
      [`defenses/${defenseKey}`]: defense
    });
  };

  const submitVote = async (challengedPlayerId, submissionIndex, voteType) => {
    const voteKey = `${challengedPlayerId}-${submissionIndex}`;
    const roomRef = ref(database, `rooms/${roomNumber}`);
    await update(roomRef, {
      [`votes/${voteKey}/${playerId}`]: voteType
    });
  };

  const finalizeChallenges = async () => {
    if (!isHost) return;
    
    const results = {};
    Object.entries(challenges).forEach(([pId, indices]) => {
      indices.forEach(index => {
        const voteKey = `${pId}-${index}`;
        const voteData = votes[voteKey] || {};
        const accepts = Object.values(voteData).filter(v => v === 'accept').length;
        const rejects = Object.values(voteData).filter(v => v === 'reject').length;
        
        results[voteKey] = accepts > rejects ? 'accepted' : 'rejected';
      });
    });

    const roomRef = ref(database, `rooms/${roomNumber}`);
    
    if (currentRound < (settings?.rounds || 5)) {
      await update(roomRef, {
        [`rounds/${currentRound}/results`]: results,
        status: 'waiting',
        currentRound: currentRound + 1
      });
    } else {
      await update(roomRef, {
        [`rounds/${currentRound}/results`]: results,
        status: 'finished'
      });
    }
  };

  const hasChallenges = Object.keys(challenges).length > 0;

  return (
    <ScreenFrame title="Link Defense">
      <div style={styles.content}>
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
                    
                    return (
                      <div key={submissionIndex} style={styles.challengeItem}>
                        <table style={styles.table}>
                          <tbody>
                            <tr>
                              <td style={styles.tdLabel}>Words Selected</td>
                              <td style={styles.tdValue}>{submission.words.join(' - ')}</td>
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
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        )}

        {isHost && (
          <button onClick={finalizeChallenges} style={styles.finalizeButton}>
            {currentRound < (settings?.rounds || 5) ? 'Next Round' : 'Show Winner'}
          </button>
        )}
      </div>
    </ScreenFrame>
  );
}

const styles = {
  content: {
    width: '100%',
    maxWidth: '850px',
  },
  noChallenges: {
    color: '#7dd3c0',
    fontSize: '20px',
    textAlign: 'center',
    padding: '40px',
  },
  challengeSection: {
    marginBottom: '25px',
  },
  playerSection: {
    marginBottom: '30px',
  },
  playerName: {
    color: '#7dd3c0',
    fontSize: '20px',
    fontWeight: 'bold',
    marginBottom: '12px',
  },
  challengeItem: {
    backgroundColor: '#1a3a52',
    padding: '15px',
    borderRadius: '8px',
    marginBottom: '15px',
  },
  table: {
    width: '100%',
    marginBottom: '10px',
  },
  tdLabel: {
    color: '#e67e22',
    fontSize: '14px',
    fontWeight: 'bold',
    padding: '8px',
    width: '140px',
  },
  tdValue: {
    color: '#ffffff',
    fontSize: '14px',
    padding: '8px',
  },
  defenseSection: {
    marginTop: '10px',
  },
  defenseLabel: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'block',
    marginBottom: '8px',
  },
  textarea: {
    width: '100%',
    padding: '10px',
    fontSize: '14px',
    borderRadius: '6px',
    border: '2px solid #4a7ba7',
    backgroundColor: '#2c4a6d',
    color: '#ffffff',
    resize: 'vertical',
    boxSizing: 'border-box',
  },
  voteButtons: {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  },
  voteButton: {
    flex: 1,
    padding: '10px',
    fontSize: '14px',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  acceptButton: {
    backgroundColor: '#7dd3c0',
    color: '#1a2332',
  },
  rejectButton: {
    backgroundColor: '#ff6b6b',
    color: '#ffffff',
  },
  voteActive: {
    transform: 'scale(0.95)',
    opacity: 0.8,
  },
  finalizeButton: {
    width: '100%',
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

export default ChallengeScreen;

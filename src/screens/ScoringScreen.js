import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../config/firebase';
import ScreenFrame from '../components/ScreenFrame';

function ScoringScreen({ onNavigate, playerId, playerName, roomNumber, isHost }) {
  const [roundData, setRoundData] = useState({});
  const [challenges, setChallenges] = useState({});
  const [currentRound, setCurrentRound] = useState(1);

  useEffect(() => {
    const roomRef = ref(database, `rooms/${roomNumber}`);
    
    const unsubscribe = onValue(roomRef, (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        if (data.currentRound) {
          setCurrentRound(data.currentRound);
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

        if (data.status === 'challenge') {
          onNavigate('challenge', { playerId, playerName, roomNumber, isHost });
        }
      }
    });

    return () => unsubscribe();
  }, [roomNumber, onNavigate, playerId, playerName, isHost]);

  const toggleChallenge = (targetPlayerId, submissionIndex) => {
    if (targetPlayerId === playerId) return;
    
    const key = `${targetPlayerId}-${submissionIndex}`;
    setChallenges(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const goToChallengeScreen = async () => {
    const roomRef = ref(database, `rooms/${roomNumber}`);
    await update(roomRef, {
      status: 'challenge',
      challenges: challenges
    });
  };

  return (
    <ScreenFrame title={`Round ${currentRound} Complete`}>
      <div style={styles.content}>
        {/* Scoring Section */}
        <div style={styles.scoringSection}>
          {Object.entries(roundData).map(([pId, playerData]) => (
            <div key={pId} style={styles.playerSection}>
              <h3 style={styles.playerName}>{playerData.playerName}</h3>
              
              <table style={styles.table}>
                <thead>
                  <tr style={styles.headerRow}>
                    <th style={styles.thNum}>#</th>
                    <th style={styles.th}>Words</th>
                    <th style={styles.th}>Link</th>
                    <th style={styles.thPts}>Pts</th>
                    <th style={styles.thChallenge}>Challenge</th>
                  </tr>
                </thead>
                <tbody>
                  {playerData.submissions && playerData.submissions.map((submission, index) => (
                    <tr key={index} style={styles.row}>
                      <td style={styles.td}>{index + 1}.</td>
                      <td style={styles.td}>{submission.words.join(' - ')}</td>
                      <td style={styles.td}>{submission.linkWord}</td>
                      <td style={styles.td}>{submission.points}pt</td>
                      <td style={styles.tdChallenge}>
                        <button
                          onClick={() => toggleChallenge(pId, index)}
                          style={{
                            ...styles.challengeButton,
                            ...(challenges[`${pId}-${index}`] ? styles.challengeActive : {})
                          }}
                          disabled={pId === playerId}
                        >
                          ?
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}
        </div>

        {/* Host Control */}
        {isHost && (
          <button onClick={goToChallengeScreen} style={styles.challengeScreenButton}>
            Challenge Screen
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
  scoringSection: {
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
    fontSize: '14px',
    fontWeight: 'bold',
    padding: '10px',
    textAlign: 'left',
  },
  thNum: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold',
    padding: '10px',
    textAlign: 'center',
    width: '40px',
  },
  thPts: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold',
    padding: '10px',
    textAlign: 'center',
    width: '60px',
  },
  thChallenge: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold',
    padding: '10px',
    textAlign: 'center',
    width: '80px',
  },
  row: {
    borderBottom: '1px solid #2c4a6d',
  },
  td: {
    color: '#ffffff',
    fontSize: '13px',
    padding: '10px',
  },
  tdChallenge: {
    padding: '10px',
    textAlign: 'center',
  },
  challengeButton: {
    width: '30px',
    height: '30px',
    borderRadius: '50%',
    border: '2px solid #e67e22',
    backgroundColor: '#1a3a52',
    color: '#e67e22',
    fontSize: '16px',
    fontWeight: 'bold',
    cursor: 'pointer',
  },
  challengeActive: {
    backgroundColor: '#e67e22',
    color: '#ffffff',
  },
  challengeScreenButton: {
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

export default ScoringScreen;

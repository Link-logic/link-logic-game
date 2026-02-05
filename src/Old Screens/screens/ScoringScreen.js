import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../config/firebase';

function ScoringScreen({ onNavigate, playerId, playerName, roomNumber, isHost }) {
  const [roundData, setRoundData] = useState({});
  const [challenges, setChallenges] = useState({});
  const [currentRound, setCurrentRound] = useState(1);
  const [totalRounds, setTotalRounds] = useState(5);

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

        if (data.rounds && data.rounds[`round${data.currentRound}`]) {
          setRoundData(data.rounds[`round${data.currentRound}`].submissions || {});
        }

        if (data.status === 'challenging') {
          onNavigate('challenge', { playerId, playerName, roomNumber, isHost });
        }
      }
    });

    return () => unsubscribe();
  }, [roomNumber, playerId, playerName, isHost, onNavigate]);

  const toggleChallenge = (targetPlayerId, submissionIndex) => {
    const key = `${targetPlayerId}-${submissionIndex}`;
    setChallenges(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const goToChallengeScreen = async () => {
    if (!isHost) return;

    const roomRef = ref(database, `rooms/${roomNumber}`);
    
    const challengeData = {};
    Object.keys(challenges).forEach(key => {
      if (challenges[key]) {
        const [targetPlayerId, submissionIndex] = key.split('-');
        if (!challengeData[targetPlayerId]) {
          challengeData[targetPlayerId] = [];
        }
        challengeData[targetPlayerId].push(parseInt(submissionIndex));
      }
    });

    await update(roomRef, {
      [`rounds/round${currentRound}/challenges`]: challengeData,
      status: 'challenging'
    });
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Small Logo Banner */}
        <div style={styles.banner}>
          <img src="/smalllogo.png" alt="Link Logic" style={styles.logo} />
        </div>

        <h2 style={styles.title}>ROUND {currentRound} COMPLETE</h2>

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
    color: '#7dd3c0',
    fontSize: '28px',
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: '30px',
  },
  scoringSection: {
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
  table: {
    width: '100%',
    borderCollapse: 'collapse',
  },
  headerRow: {
    borderBottom: '2px solid #4a7ba7',
  },
  th: {
    color: '#ffffff',
    padding: '10px 8px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: 'bold',
  },
  thNum: {
    color: '#ffffff',
    padding: '10px 8px',
    textAlign: 'left',
    fontSize: '13px',
    fontWeight: 'bold',
    width: '40px',
  },
  thPts: {
    color: '#ffffff',
    padding: '10px 8px',
    textAlign: 'center',
    fontSize: '13px',
    fontWeight: 'bold',
    width: '60px',
  },
  thChallenge: {
    color: '#ffffff',
    padding: '10px 8px',
    textAlign: 'center',
    fontSize: '13px',
    fontWeight: 'bold',
    width: '90px',
  },
  row: {
    borderBottom: '1px solid #2c4a6d',
  },
  td: {
    color: '#ffffff',
    padding: '10px 8px',
    fontSize: '14px',
  },
  tdChallenge: {
    color: '#ffffff',
    padding: '10px 8px',
    fontSize: '14px',
    textAlign: 'center',
  },
  challengeButton: {
    padding: '6px 14px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#4a7ba7',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
  },
  challengeActive: {
    backgroundColor: '#ff6b6b',
  },
  challengeScreenButton: {
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

export default ScoringScreen;
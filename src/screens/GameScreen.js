import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ref, onValue, update, get } from 'firebase/database';
import { database } from '../config/firebase';
import { generateRandomWords, selectBonusWords } from '../utils/gameUtils';

function GameScreen({ onNavigate, playerId, playerName, roomNumber, isHost }) {
  const [words, setWords] = useState([]);
  const [bonusIndices, setBonusIndices] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [linkWord, setLinkWord] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submissions, setSubmissions] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [settings, setSettings] = useState(null);
  
  const timerInitialized = useRef(false);
  const wordsGenerated = useRef(false);
  const endRoundTriggered = useRef(false);

  useEffect(() => {
    const roomRef = ref(database, `rooms/${roomNumber}`);
    
    const unsubscribe = onValue(roomRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        if (data.settings && !timerInitialized.current) {
          setSettings(data.settings);
          setTimeRemaining(data.settings.timer);
          timerInitialized.current = true;
        }

        if (data.currentRound) {
          setCurrentRound(data.currentRound);
          // Reset flag for new rounds
          endRoundTriggered.current = false;
        }

        if (!wordsGenerated.current && isHost && data.settings && !data.words) {
          wordsGenerated.current = true;
          
          const generatedWords = generateRandomWords(data.settings.words, 'easy');
          const numBonus = data.settings.bonusWords || 3;
          const bonusWordIndices = selectBonusWords(generatedWords.length, numBonus);
          
          await update(roomRef, {
            words: generatedWords,
            bonusIndices: bonusWordIndices
          });
        }

        if (data.words) {
          const wordsArray = Array.isArray(data.words) 
            ? data.words 
            : Object.values(data.words);
          setWords(wordsArray);
        }
        
        if (data.bonusIndices !== undefined && data.bonusIndices !== null) {
          let bonusArray = [];
          
          if (Array.isArray(data.bonusIndices)) {
            bonusArray = data.bonusIndices;
          } else if (typeof data.bonusIndices === 'object') {
            bonusArray = Object.values(data.bonusIndices).map(v => Number(v));
          }
          
          setBonusIndices(bonusArray);
        }

        if (data.status === 'scoring') {
          console.log('Status changed to SCORING - navigating...');
          endRoundTriggered.current = false; // Reset for next round
          onNavigate('scoring', { playerId, playerName, roomNumber, isHost });
        }
        
        if (data.status === 'leaderboard') {
          console.log('Status changed to LEADERBOARD - navigating...');
          endRoundTriggered.current = false; // Reset for next round
          onNavigate('leaderboard', { playerId, playerName, roomNumber, isHost });
        }
      }
    });

    return () => {
      unsubscribe();
      wordsGenerated.current = false;
    };
  }, [roomNumber, playerId, playerName, isHost, onNavigate]);

  const endRound = useCallback(async () => {
    console.log('endRound called! isHost:', isHost);
    const roomRef = ref(database, `rooms/${roomNumber}`);
    
    const snapshot = await get(roomRef);
    if (snapshot.exists()) {
      const data = snapshot.val();
      const playerCount = data.players ? Object.keys(data.players).length : 0;
      const round = data.currentRound || 1; // Get current round
      
      console.log('Player count:', playerCount);
      console.log('Current round:', round);
      
      if (playerCount === 2) {
        console.log('2 players - going to leaderboard');
        await update(roomRef, {
          status: 'leaderboard',
          currentRound: round
        });
      } else {
        console.log('3+ players - going to scoring');
        await update(roomRef, {
          status: 'scoring',
          currentRound: round
        });
      }
    }
  }, [isHost, roomNumber]);

  useEffect(() => {
    if (timerInitialized.current && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && timerInitialized.current && isHost && !endRoundTriggered.current) {
      console.log('Timer hit 0! Ending round...');
      endRoundTriggered.current = true;
      endRound();
    }
  }, [timeRemaining, isHost, endRound]);

  const toggleWordSelection = (word) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const submitLink = async () => {
    if (timeRemaining === 0) return;
    
    if (selectedWords.length < 2) {
      alert('Please select at least 2 words');
      return;
    }
    if (!linkWord.trim()) {
      alert('Please enter a link word');
      return;
    }

    const hasBonus = selectedWords.some(word => {
      const index = words.indexOf(word);
      return bonusIndices.includes(index);
    });

    const points = selectedWords.length + (hasBonus ? 1 : 0);

    const submission = {
      words: [...selectedWords],
      linkWord: linkWord.trim(),
      points,
      timestamp: Date.now()
    };

    const newSubmissions = [...submissions, submission];
    setSubmissions(newSubmissions);

    const submissionRef = ref(database, `rooms/${roomNumber}/rounds/round${currentRound}/submissions/${playerId}`);
    
    await update(submissionRef, {
      playerName,
      submissions: newSubmissions,
      totalPoints: newSubmissions.reduce((sum, s) => sum + s.points, 0)
    });

    setSelectedWords([]);
    setLinkWord('');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getRoundTitle = () => {
    switch(currentRound) {
      case 2: return "Round 2 - Corner Bonus";
      case 3: return "Round 3 - Touch Bonus";
      case 4: return "Round 4 - Edge Bonus";
      case 5: return "Round 5 - Line Bonus";
      default: return `Round ${currentRound}`;
    }
  };

  return (
    <div style={styles.outerContainer}>
      <div style={styles.container}>
        <div style={styles.card}>
          {/* Purple Banner with Logo */}
          <div style={styles.banner}>
            <img src="/smalllogo.png" alt="Link Logic" style={styles.logo} />
            <div style={styles.bannerText}>Link Logic</div>
          </div>

          {/* Round Title (if not round 1) */}
          {currentRound > 1 && (
            <div style={styles.roundHeader}>
              {getRoundTitle()}
            </div>
          )}

          {/* Timer */}
          <div style={styles.timerSection}>
            <div style={styles.timerLabel}>Timer</div>
            <div style={styles.timerValue}>{formatTime(timeRemaining)}</div>
          </div>

          {/* Word Grid */}
          <div style={styles.wordGrid}>
            {words.map((word, index) => {
              const isBonus = bonusIndices.includes(index);
              const isSelected = selectedWords.includes(word);
              
              return (
                <button
                  key={index}
                  onClick={() => toggleWordSelection(word)}
                  style={{
                    ...styles.wordButton,
                    ...(isBonus ? styles.bonusWord : styles.regularWord),
                    ...(isSelected ? styles.selectedWord : {})
                  }}
                >
                  {word}
                </button>
              );
            })}
          </div>

          {/* Selected Words and Link Word Row */}
          <div style={styles.inputRow}>
            <div style={styles.inputGroup}>
              <div style={styles.inputLabel}>Selected Words</div>
              <div style={styles.displayBox}>
                {selectedWords.length > 0 ? selectedWords.join(' - ') : 'Self Propagates'}
              </div>
            </div>

            <div style={styles.inputGroup}>
              <div style={styles.inputLabel}>Link Word</div>
              <input
                type="text"
                value={linkWord}
                onChange={(e) => setLinkWord(e.target.value)}
                placeholder="Enter"
                style={styles.linkInput}
                disabled={timeRemaining === 0}
              />
            </div>
          </div>

          {/* Submit Button */}
          <button 
            onClick={submitLink} 
            disabled={timeRemaining === 0}
            style={{
              ...styles.submitButton,
              ...(timeRemaining === 0 ? styles.disabledButton : {})
            }}
          >
            {timeRemaining === 0 ? 'Time Up!' : 'Submit'}
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
    padding: '25px',
    maxWidth: '550px',
    width: '100%',
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
  roundHeader: {
    backgroundColor: '#2c4a6d',
    color: '#ffffff',
    fontSize: '22px',
    fontWeight: 'bold',
    textAlign: 'center',
    padding: '15px',
    borderRadius: '10px',
    marginBottom: '20px',
    border: '2px solid #4a7ba7',
  },
  timerSection: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  timerLabel: {
    color: '#ffffff',
    fontSize: '18px',
    marginBottom: '8px',
    fontWeight: '500',
  },
  timerValue: {
    color: '#ff3b3b',
    fontSize: '48px',
    fontWeight: 'bold',
    textShadow: '0 0 20px rgba(255, 59, 59, 0.5)',
  },
  wordGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '10px',
    marginBottom: '25px',
    padding: '15px',
    backgroundColor: '#000000',
    borderRadius: '10px',
  },
  wordButton: {
    padding: '18px 12px',
    fontSize: '14px',
    fontWeight: 'bold',
    color: '#ffffff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    textAlign: 'center',
    minHeight: '60px',
  },
  regularWord: {
    backgroundColor: '#8b2d8b',
    boxShadow: '0 2px 8px rgba(139, 45, 139, 0.4)',
  },
  bonusWord: {
    backgroundColor: '#ff6600',
    boxShadow: '0 0 20px rgba(255, 102, 0, 0.8)',
  },
  selectedWord: {
    transform: 'scale(1.05)',
    boxShadow: '0 0 25px rgba(0, 255, 255, 0.8)',
    border: '3px solid #00ffff',
  },
  inputRow: {
    display: 'flex',
    gap: '15px',
    marginBottom: '20px',
  },
  inputGroup: {
    flex: 1,
  },
  inputLabel: {
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: 'bold',
    marginBottom: '8px',
    textAlign: 'center',
  },
  displayBox: {
    backgroundColor: '#0a1929',
    color: '#00bcd4',
    padding: '15px',
    borderRadius: '8px',
    border: '2px solid #00bcd4',
    textAlign: 'center',
    fontSize: '15px',
    fontWeight: '500',
    minHeight: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  linkInput: {
    width: '100%',
    padding: '15px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '2px solid #00bcd4',
    backgroundColor: '#0a1929',
    color: '#ffffff',
    boxSizing: 'border-box',
    textAlign: 'center',
    fontWeight: '500',
  },
  submitButton: {
    width: '100%',
    padding: '18px',
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#0066ff',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    boxShadow: '0 4px 15px rgba(0, 102, 255, 0.4)',
    transition: 'all 0.2s',
  },
  disabledButton: {
    backgroundColor: '#555555',
    cursor: 'not-allowed',
    opacity: 0.5,
    boxShadow: 'none',
  },
  endRoundButton: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#ff6600',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    marginTop: '10px',
  },
};

export default GameScreen;

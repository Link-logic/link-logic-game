import React, { useState, useEffect } from 'react';
import { ref, onValue, update } from 'firebase/database';
import { database } from '../config/firebase';
import { generateRandomWords, selectBonusWords } from '../utils/gameUtils';

function GameScreen({ onNavigate, playerId, playerName, roomNumber, isHost }) {
  const [words, setWords] = useState([]);
  const [bonusWords, setBonusWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [linkWord, setLinkWord] = useState('');
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [submissions, setSubmissions] = useState([]);
  const [currentRound, setCurrentRound] = useState(1);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const roomRef = ref(database, `rooms/${roomNumber}`);
    
    const unsubscribe = onValue(roomRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        if (data.settings) {
          setSettings(data.settings);
          setTimeRemaining(data.settings.timer);
        }

        if (data.currentRound) {
          setCurrentRound(data.currentRound);
        }

        if (!data.words && isHost) {
          const generatedWords = generateRandomWords(data.settings.words, 'easy');
          const bonusIndices = selectBonusWords(generatedWords.length, data.settings.bonusWords);
          
          await update(roomRef, {
            words: generatedWords,
            bonusIndices
          });
        }

        if (data.words) {
          setWords(data.words);
          if (data.bonusIndices) {
            setBonusWords(data.bonusIndices);
          }
        }

        if (data.status === 'scoring') {
          onNavigate('scoring', { playerId, playerName, roomNumber, isHost });
        }
      }
    });

    return () => unsubscribe();
  }, [roomNumber, playerId, playerName, isHost, onNavigate]);

  useEffect(() => {
    if (timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(timeRemaining - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && settings && isHost) {
      endRound();
    }
  }, [timeRemaining, settings, isHost]);

  const toggleWordSelection = (word) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const submitLink = async () => {
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
      return bonusWords.includes(index);
    });

    const points = selectedWords.length + (hasBonus ? 1 : 0);

    const submission = {
      words: [...selectedWords],
      linkWord: linkWord.trim(),
      points,
      timestamp: Date.now()
    };

    setSubmissions([...submissions, submission]);

    const submissionRef = ref(database, `rooms/${roomNumber}/rounds/round${currentRound}/submissions/${playerId}`);
    const currentSubmissions = [...submissions, submission];
    
    await update(submissionRef, {
      playerName,
      submissions: currentSubmissions,
      totalPoints: currentSubmissions.reduce((sum, s) => sum + s.points, 0)
    });

    setSelectedWords([]);
    setLinkWord('');
  };

  const endRound = async () => {
    const roomRef = ref(database, `rooms/${roomNumber}`);
    await update(roomRef, {
      status: 'scoring'
    });
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        {/* Small Logo Banner */}
        <div style={styles.banner}>
          <img src="/smalllogo.png" alt="Link Logic" style={styles.logo} />
        </div>

        {/* Header with Round and Timer */}
        <div style={styles.header}>
          <div style={styles.roundInfo}>ROUND {currentRound}</div>
          <div style={styles.timer}>Timer<br />{formatTime(timeRemaining)}</div>
        </div>

        {/* Word Grid */}
        <div style={styles.wordGrid}>
          {words.map((word, index) => (
            <button
              key={index}
              onClick={() => toggleWordSelection(word)}
              style={{
                ...styles.wordButton,
                ...(bonusWords.includes(index) ? styles.bonusWord : {}),
                ...(selectedWords.includes(word) ? styles.selectedWord : {})
              }}
            >
              {word}
            </button>
          ))}
        </div>

        {/* Selected Words Display */}
        <div style={styles.selectedSection}>
          <div style={styles.selectedBox}>
            {selectedWords.length > 0 ? selectedWords.join(' - ') : 'Self Propagates'}
          </div>
          <label style={styles.selectedLabel}>Selected Words</label>
        </div>

        {/* Link Word Input */}
        <div style={styles.linkSection}>
          <input
            type="text"
            value={linkWord}
            onChange={(e) => setLinkWord(e.target.value)}
            placeholder="Enter"
            style={styles.linkInput}
          />
          <label style={styles.linkLabel}>Link Word</label>
        </div>

        {/* Submit Button */}
        <button onClick={submitLink} style={styles.submitButton}>
          Submit
        </button>
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
    maxWidth: '750px',
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '25px',
  },
  roundInfo: {
    color: '#7dd3c0',
    fontSize: '24px',
    fontWeight: 'bold',
  },
  timer: {
    color: '#ff6b6b',
    fontSize: '18px',
    fontWeight: 'bold',
    textAlign: 'right',
    lineHeight: '1.3',
  },
  wordGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '12px',
    marginBottom: '25px',
  },
  wordButton: {
    padding: '16px',
    fontSize: '15px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#4a7ba7',
    border: '2px solid transparent',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'all 0.2s',
  },
  bonusWord: {
    backgroundColor: '#e67e22',
  },
  selectedWord: {
    borderColor: '#7dd3c0',
    backgroundColor: '#2d5a4d',
    transform: 'scale(1.05)',
  },
  selectedSection: {
    marginBottom: '20px',
    textAlign: 'center',
  },
  selectedBox: {
    backgroundColor: '#1a3a52',
    padding: '16px',
    borderRadius: '8px',
    color: '#7dd3c0',
    fontSize: '16px',
    fontWeight: 'bold',
    minHeight: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
  },
  selectedLabel: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
  },
  linkSection: {
    marginBottom: '20px',
    textAlign: 'center',
  },
  linkInput: {
    width: '100%',
    padding: '16px',
    fontSize: '18px',
    borderRadius: '8px',
    border: '2px solid #4a7ba7',
    backgroundColor: '#1a3a52',
    color: '#ffffff',
    boxSizing: 'border-box',
    textAlign: 'center',
    marginBottom: '8px',
  },
  linkLabel: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: '500',
  },
  submitButton: {
    width: '100%',
    padding: '18px',
    fontSize: '22px',
    fontWeight: 'bold',
    color: '#ffffff',
    backgroundColor: '#7dd3c0',
    border: 'none',
    borderRadius: '10px',
    cursor: 'pointer',
  },
};

export default GameScreen;
import React, { useState, useEffect } from 'react';
import { ref, onValue, update, get } from 'firebase/database';
import { database } from '../config/firebase';
import ScreenFrame from '../components/ScreenFrame';

function GameScreen({ onNavigate, playerId, playerName, roomNumber, isHost }) {
  const [words, setWords] = useState([]);
  const [bonusWords, setBonusWords] = useState([]);
  const [selectedWords, setSelectedWords] = useState([]);
  const [linkWord, setLinkWord] = useState('');
  const [currentRound, setCurrentRound] = useState(1);
  const [timeRemaining, setTimeRemaining] = useState(100);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const roomRef = ref(database, `rooms/${roomNumber}`);
    
    const unsubscribe = onValue(roomRef, async (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        
        if (!settings) {
          setSettings(data.settings);
        }

        if (data.currentRound) {
          setCurrentRound(data.currentRound);
        }

        if (data.words) {
          setWords(data.words);
        }

        if (data.bonusWords) {
          setBonusWords(data.bonusWords);
        }

        if (data.status === 'scoring') {
          onNavigate('scoring', { playerId, playerName, roomNumber, isHost });
        }
      }
    });

    return () => unsubscribe();
  }, [roomNumber, onNavigate, playerId, playerName, isHost, settings]);

  useEffect(() => {
    if (!settings) return;

    setTimeRemaining(settings.timer);
    const timer = setTimeout(() => {
      endRound();
    }, settings.timer * 1000);

    const interval = setInterval(() => {
      setTimeRemaining(prev => Math.max(0, prev - 1));
    }, 1000);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, [currentRound, settings]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const toggleWordSelection = (word) => {
    if (selectedWords.includes(word)) {
      setSelectedWords(selectedWords.filter(w => w !== word));
    } else if (selectedWords.length < 2) {
      setSelectedWords([...selectedWords, word]);
    }
  };

  const submitLink = async () => {
    if (selectedWords.length === 2 && linkWord.trim()) {
      const roundRef = ref(database, `rooms/${roomNumber}/rounds/${currentRound}/submissions/${playerId}`);
      await update(roundRef, {
        playerName,
        word1: selectedWords[0],
        word2: selectedWords[1],
        linkWord: linkWord.trim(),
        timestamp: new Date().toISOString()
      });
      
      setSelectedWords([]);
      setLinkWord('');
    }
  };

  const endRound = async () => {
    if (!isHost) return;
    
    const roomRef = ref(database, `rooms/${roomNumber}`);
    await update(roomRef, {
      status: 'scoring'
    });
  };

  return (
    <ScreenFrame title={`Round ${currentRound}`}>
      <div style={styles.content}>
        {/* Timer */}
        <div style={styles.timerSection}>
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
    </ScreenFrame>
  );
}

const styles = {
  content: {
    width: '100%',
    maxWidth: '750px',
  },
  timerSection: {
    display: 'flex',
    justifyContent: 'flex-end',
    marginBottom: '20px',
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
  },
  bonusWord: {
    backgroundColor: '#e67e22',
    border: '2px solid #d35400',
  },
  selectedWord: {
    backgroundColor: '#7dd3c0',
    color: '#1a2332',
    border: '2px solid #5fb8a6',
  },
  selectedSection: {
    marginBottom: '20px',
  },
  selectedBox: {
    backgroundColor: '#1a3a52',
    padding: '15px',
    borderRadius: '8px',
    border: '2px solid #4a7ba7',
    color: '#7dd3c0',
    fontSize: '16px',
    textAlign: 'center',
    marginBottom: '8px',
    minHeight: '50px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedLabel: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'block',
    textAlign: 'center',
  },
  linkSection: {
    marginBottom: '20px',
  },
  linkInput: {
    width: '100%',
    padding: '15px',
    fontSize: '16px',
    borderRadius: '8px',
    border: '2px solid #4a7ba7',
    backgroundColor: '#1a3a52',
    color: '#ffffff',
    boxSizing: 'border-box',
    marginBottom: '8px',
  },
  linkLabel: {
    color: '#ffffff',
    fontSize: '14px',
    fontWeight: 'bold',
    display: 'block',
    textAlign: 'center',
  },
  submitButton: {
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

export default GameScreen;

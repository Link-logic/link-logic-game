import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

// Import screens
import WelcomeScreen from './screens/WelcomeScreen';
import RegisterScreen from './screens/RegisterScreen';
import InstructionsScreen from './screens/InstructionsScreen';
import HostRoomScreen from './screens/HostRoomScreen';
import WaitingRoomScreen from './screens/WaitingRoomScreen';
import GameScreen from './screens/GameScreen';
import ScoringScreen from './screens/ScoringScreen';
import ChallengeScreen from './screens/ChallengeScreen';
import WinnerScreen from './screens/WinnerScreen';

function App() {
  const [user, setUser] = useState(null);
  const [roomNumber, setRoomNumber] = useState('');const [hasHosted, setHasHosted] = useState(false);
  const [gameSettings, setGameSettings] = useState(null);

  // Load user from localStorage on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('linkLogicUser');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
  }, []);

  // Save user to localStorage when it changes
  useEffect(() => {
    if (user) {
      localStorage.setItem('linkLogicUser', JSON.stringify(user));
    } else {
      localStorage.removeItem('linkLogicUser');
    }
  }, [user]);

  return (
    <Router>
      <div className="app">
        <Route 
     path="/" 
     element={<WelcomeScreen user={user} setRoomNumber={setRoomNumber} hasHosted={hasHosted} setHasHosted={setHasHosted} />} 
   />
          <Route 
            path="/register" 
            element={<RegisterScreen setUser={setUser} />} 
          />
          <Route 
            path="/instructions" 
            element={<InstructionsScreen />} 
          />
          <Route 
            path="/host" 
            element={
              user ? (
                <HostRoomScreen 
                  user={user} 
                  roomNumber={roomNumber}
                  setRoomNumber={setRoomNumber}
                  gameSettings={gameSettings}
                  setGameSettings={setGameSettings}
                />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/waiting-room" 
            element={
              user ? (
                <WaitingRoomScreen 
                  user={user} 
                  roomNumber={roomNumber}
                  gameSettings={gameSettings}
                />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/game" 
            element={
              user ? (
                <GameScreen 
                  user={user} 
                  roomNumber={roomNumber}
                  gameSettings={gameSettings}
                />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/scoring" 
            element={
              user ? (
                <ScoringScreen 
                  user={user} 
                  roomNumber={roomNumber}
                  gameSettings={gameSettings}
                />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/challenge" 
            element={
              user ? (
                <ChallengeScreen 
                  user={user} 
                  roomNumber={roomNumber}
                  gameSettings={gameSettings}
                />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
          <Route 
            path="/winner" 
            element={
              user ? (
                <WinnerScreen 
                  user={user} 
                  roomNumber={roomNumber}
                />
              ) : (
                <Navigate to="/" />
              )
            } 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

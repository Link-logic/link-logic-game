import React, { useState, useEffect } from 'react';
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
import LeaderBoardScreen from './screens/LeaderBoardScreen';
import WinnerScreen from './screens/WinnerScreen';

function App() {
  const [currentScreen, setCurrentScreen] = useState('welcome');
  const [screenProps, setScreenProps] = useState({});
  const [hasHosted, setHasHosted] = useState(false);

  const navigate = (screen, props = {}) => {
    // Track if user has hosted
    if (screen === 'hostroom') {
      setHasHosted(true);
    }
    
    setCurrentScreen(screen);
    setScreenProps(props);
  };

  const renderScreen = () => {
    const commonProps = {
      onNavigate: navigate,
      ...screenProps
    };

    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen {...commonProps} hasHosted={hasHosted} />;
      
      case 'register':
        return <RegisterScreen {...commonProps} />;
      
      case 'instructions':
        return <InstructionsScreen {...commonProps} />;
      
      case 'hostroom':
        return <HostRoomScreen {...commonProps} />;
      
      case 'waiting':
        return <WaitingRoomScreen {...commonProps} />;
      
      case 'game':
        return <GameScreen {...commonProps} />;
      
      case 'scoring':
        return <ScoringScreen {...commonProps} />;
      
      case 'challenge':
        return <ChallengeScreen {...commonProps} />;
      
      case 'leaderboard':
        return <LeaderBoardScreen {...commonProps} />;
      
      case 'winner':
        return <WinnerScreen {...commonProps} />;
      
      default:
        return <WelcomeScreen {...commonProps} hasHosted={hasHosted} />;
    }
  };

  return (
    <div className="App">
      {renderScreen()}
    </div>
  );
}

export default App;

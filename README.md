# Link Logic - Multiplayer Word Connection Game

A real-time multiplayer word game where players connect random words using creative "link" words.

## Features

✅ **Complete Game Flow**
- Welcome Screen with room code entry
- User Registration with name availability checking
- Host Room with preset configuration
- Waiting Room with real-time player updates
- Game Screen with timer and word selection
- Scoring Screen with challenge system
- Challenge/Defense mechanism with voting
- Winner Screen with final standings

✅ **Technical Features**
- Real-time multiplayer using Firebase
- Spell checking on link words and defenses
- 3 difficulty levels (Easy, Medium, Hard)
- 9 preset configurations
- Responsive mobile-first design
- Player persistence across sessions

## Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase account (free tier works perfectly)

## Setup Instructions

### Step 1: Install Dependencies

```bash
cd link-logic-game
npm install
```

### Step 2: Set Up Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project" or select existing project
3. Give your project a name (e.g., "link-logic-game")
4. Enable Google Analytics (optional)
5. Click "Create project"

### Step 3: Enable Realtime Database

1. In Firebase Console, click on "Realtime Database" in the left sidebar
2. Click "Create Database"
3. Choose a location (closest to your users)
4. Start in "Test mode" for development (you'll secure this later)
5. Click "Enable"

### Step 4: Get Firebase Configuration

1. In Firebase Console, click the gear icon ⚙️ → "Project settings"
2. Scroll down to "Your apps" section
3. Click the web icon `</>` to add a web app
4. Register your app with a nickname (e.g., "Link Logic Web")
5. Copy the `firebaseConfig` object

### Step 5: Configure Your App

1. Open `src/config/firebase.js`
2. Replace the placeholder values with your Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  databaseURL: "https://your-project.firebaseio.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### Step 6: Configure Firebase Database Rules (Important!)

For development/testing, use these rules (in Firebase Console → Realtime Database → Rules):

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true
      }
    },
    "players": {
      "$playerId": {
        ".read": true,
        ".write": true
      }
    }
  }
}
```

**⚠️ For production, you'll want to add proper authentication and security rules.**

### Step 7: Run the App

```bash
npm start
```

The app will open at `http://localhost:3000`

## How to Test Multiplayer

1. Open the app in your main browser
2. Click "Host" and register
3. Generate a room number
4. Copy the room number
5. Open the same URL in another browser/tab (or incognito mode)
6. Enter the room number
7. Click "Play" and register with a different name
8. You should see both players in the waiting room!

## Project Structure

```
link-logic-game/
├── public/
│   ├── index.html
│   ├── logo.png
│   └── banner.png
├── src/
│   ├── config/
│   │   └── firebase.js         # Firebase configuration
│   ├── data/
│   │   ├── easyWords.js        # 200 easy words
│   │   ├── mediumWords.js      # 200 medium words
│   │   ├── hardWords.js        # 200 hard words
│   │   └── presets.js          # 9 game presets
│   ├── screens/
│   │   ├── WelcomeScreen.js
│   │   ├── RegisterScreen.js
│   │   ├── InstructionsScreen.js
│   │   ├── HostRoomScreen.js
│   │   ├── WaitingRoomScreen.js
│   │   ├── GameScreen.js
│   │   ├── ScoringScreen.js
│   │   ├── ChallengeScreen.js
│   │   └── WinnerScreen.js
│   ├── utils/
│   │   └── gameUtils.js        # Helper functions
│   ├── App.js                  # Main app component
│   ├── App.css                 # All styling
│   └── index.js                # Entry point
├── package.json
└── README.md
```

## Game Flow

1. **Welcome** → Players enter or are directed via link
2. **Register** → First-time players create account
3. **Host Room** → Host sets up game parameters
4. **Waiting Room** → Players gather and chat
5. **Game** → Players select words and create links
6. **Scoring** → Review submissions and challenge
7. **Challenge** → Defend links and vote
8. **Winner** → View final standings

## Deployment

### Deploy to Firebase Hosting (Recommended)

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project:
```bash
firebase init
```
- Select "Hosting"
- Choose your Firebase project
- Set public directory to: `build`
- Configure as single-page app: `Yes`
- Set up automatic builds: `No`

4. Build your app:
```bash
npm run build
```

5. Deploy:
```bash
firebase deploy
```

Your app will be live at: `https://your-project-id.web.app`

### Alternative: Deploy to Vercel

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts

## Customization

### Adding More Words

Edit the word databases in `src/data/`:
- `easyWords.js` - Simple everyday words
- `mediumWords.js` - Moderate difficulty
- `hardWords.js` - Challenging words

### Modifying Presets

Edit `src/data/presets.js` to change:
- Number of words per round
- Time limits
- Number of rounds
- Bonus word counts

### Styling

All styles are in `src/App.css`. The design uses:
- Purple/blue gradient backgrounds
- Neon-style buttons
- Mobile-first responsive design

## Troubleshooting

### "Cannot connect to Firebase"
- Check that you've replaced the Firebase config in `src/config/firebase.js`
- Verify your Firebase project is active
- Check that Realtime Database is enabled

### "Player name not available" error
- This means the name already exists in the database
- Try a different player name
- Or clear the database in Firebase Console

### Players not seeing each other
- Make sure both players are using the same room number
- Check Firebase Database rules allow read/write
- Check browser console for errors

### Timer not syncing
- This is a known issue with realtime sync
- Refresh the page if timer gets stuck
- Ensure stable internet connection

## Known Issues / Future Improvements

- [ ] Add sound effects
- [ ] Add animations for word selection
- [ ] Improve spell checker (currently basic dictionary check)
- [ ] Add proper authentication
- [ ] Add player avatars
- [ ] Add game history/statistics
- [ ] Add native mobile apps
- [ ] Add tutorial/walkthrough for first-time players

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Firebase Console for database errors
3. Check browser console for JavaScript errors

## License

This is a personal project. All rights reserved.

---

**Built with React + Firebase | Mobile-First Design | Real-Time Multiplayer**

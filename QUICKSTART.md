# QUICKSTART GUIDE
## Get Link Logic Running in 10 Minutes

### 1. Install Node.js
If you don't have it: https://nodejs.org/ (download the LTS version)

### 2. Set Up Firebase (5 minutes)

1. Go to https://console.firebase.google.com/
2. Click "Add project"
3. Name it "link-logic" → Click Continue
4. Disable Google Analytics (optional) → Create project
5. Wait for project creation

6. In the left sidebar, click "Realtime Database"
7. Click "Create Database"
8. Choose your location → Next
9. Select "Start in test mode" → Enable

10. Click the gear icon ⚙️ (Project Settings)
11. Scroll to "Your apps" → Click the web icon `</>`
12. Nickname: "Link Logic" → Register app
13. **COPY** the firebaseConfig code (you'll need this!)

### 3. Configure Your App (2 minutes)

1. Open the `link-logic-game` folder
2. Open `src/config/firebase.js` in a text editor
3. Replace the placeholder values with YOUR config from step 2
4. Save the file

### 4. Run the App (3 minutes)

Open Terminal/Command Prompt in the `link-logic-game` folder:

```bash
# Install dependencies (first time only)
npm install

# Start the app
npm start
```

The app opens automatically at http://localhost:3000

### 5. Test Multiplayer

1. In your main browser: Host a game
2. Copy the room number
3. Open a new incognito/private window
4. Enter the room number and join
5. You should see both players!

---

## First Time Hosting a Game

1. Click "Host"
2. Register (name, phone, email optional, player name)
3. Click "Generate Room #"
4. Copy the invitation text
5. Text to friends OR open another browser window
6. Select a Preset (or use default Preset 3)
7. Click "Waiting Room"
8. Wait for players to join
9. Click "Tap to Play" when ready

---

## Troubleshooting

**Problem**: Can't connect / Firebase errors
- Make sure you completed Step 3 (firebase config)
- Check that Realtime Database is enabled

**Problem**: npm install fails
- Make sure Node.js is installed
- Try: `npm install --legacy-peer-deps`

**Problem**: Players can't see each other
- Both must use the SAME room number
- Check Firebase Console → Realtime Database to see if data is being written

**Problem**: Port 3000 already in use
- Another app is running on port 3000
- Kill that app or use: `PORT=3001 npm start`

---

## Next Steps

1. Test with friends/family
2. Gather feedback
3. Review README.md for deployment options
4. Consider deploying to Firebase Hosting (free!)

---

**Need Help?**
- Check the full README.md
- Look at Firebase Console for errors
- Check browser console (F12 → Console tab)

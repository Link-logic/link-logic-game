# SETUP CHECKLIST ✓
## Follow these steps in order

### ☐ Step 1: Install Node.js (5 minutes)
- [ ] Go to https://nodejs.org/
- [ ] Download the LTS version (left side, green button)
- [ ] Run the installer
- [ ] Accept all defaults (keep clicking Next)
- [ ] Verify: Open Terminal/Command Prompt, type `node --version`
- [ ] Should see something like: v18.17.0 or higher

---

### ☐ Step 2: Set Up Firebase (10 minutes)
- [ ] Go to https://console.firebase.google.com/
- [ ] Click "Add project"
- [ ] Name it: "link-logic-game" → Continue
- [ ] Disable Google Analytics (optional) → Create project
- [ ] Wait for "Your project is ready" → Continue

#### Enable Realtime Database:
- [ ] In left sidebar, click "Realtime Database"
- [ ] Click "Create Database" button
- [ ] Choose location (closest to you) → Next
- [ ] Select "Start in test mode" → Enable
- [ ] Wait for database to be created

#### Get Your Config:
- [ ] Click the gear icon ⚙️ → "Project settings"
- [ ] Scroll to "Your apps" section (bottom)
- [ ] Click the web icon `</>` ("Add app")
- [ ] Nickname: "Link Logic Web" → Register app
- [ ] **COPY the firebaseConfig code** (you'll need this!)
- [ ] Should look like:
```javascript
const firebaseConfig = {
  apiKey: "AIza...",
  authDomain: "link-logic-game.firebaseapp.com",
  databaseURL: "https://link-logic-game.firebaseio.com",
  // etc...
};
```

---

### ☐ Step 3: Configure Your App (5 minutes)
- [ ] Locate the `link-logic-game` folder (should be in Downloads)
- [ ] Open the folder
- [ ] Navigate to: `src` → `config` → `firebase.js`
- [ ] Open `firebase.js` in any text editor (Notepad, TextEdit, etc.)
- [ ] Find this section:
```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  // ...
};
```
- [ ] Replace ALL the placeholder values with YOUR config from Step 2
- [ ] Make sure to keep the quotes around each value
- [ ] Save the file (Ctrl+S or Cmd+S)

---

### ☐ Step 4: Install Dependencies (5 minutes)
**Windows:**
- [ ] Open Command Prompt (search for "cmd")
- [ ] Type: `cd Downloads\link-logic-game` (adjust path if different)
- [ ] Press Enter
- [ ] Type: `npm install`
- [ ] Press Enter
- [ ] Wait 2-3 minutes (you'll see lots of text scrolling)
- [ ] Should end with "added XXX packages"

**Mac:**
- [ ] Open Terminal (search for "Terminal")
- [ ] Type: `cd ~/Downloads/link-logic-game` (adjust path if different)
- [ ] Press Enter
- [ ] Type: `npm install`
- [ ] Press Enter
- [ ] Wait 2-3 minutes
- [ ] Should end with "added XXX packages"

---

### ☐ Step 5: Run the App! (2 minutes)
- [ ] In the same Terminal/Command Prompt window
- [ ] Type: `npm start`
- [ ] Press Enter
- [ ] Wait 30 seconds
- [ ] Browser should open automatically to http://localhost:3000
- [ ] You should see the Link Logic Welcome screen!

---

### ☐ Step 6: Test Multiplayer (5 minutes)

**Be the Host:**
- [ ] Click "Host" button
- [ ] Fill in registration form
- [ ] Check player name availability
- [ ] Click "Host" again
- [ ] Click "Generate Room #"
- [ ] Write down the room number (or copy the invitation)

**Be a Player:**
- [ ] Open a new browser window (or incognito/private mode)
- [ ] Go to http://localhost:3000
- [ ] Enter the room number
- [ ] Click "Play"
- [ ] Register with a different name
- [ ] You should see both players in the waiting room!

**Start a Game:**
- [ ] In the host window, click "Waiting Room"
- [ ] You should see both players
- [ ] Click "Tap to Play"
- [ ] Watch the countdown (Red → Yellow → Green)
- [ ] Game should start!

---

### ☐ Step 7: Play a Full Game (10 minutes)
- [ ] Select 2-3 words by clicking them
- [ ] Type a link word
- [ ] Click Submit
- [ ] Keep linking words until timer runs out
- [ ] Review scores
- [ ] Try challenging a link (click ?)
- [ ] Vote on challenges
- [ ] See the winner screen

---

## ✅ SETUP COMPLETE!

If you got here, congratulations! Your game is working.

---

## 🐛 Troubleshooting

### Problem: "node: command not found"
**Solution**: Node.js didn't install correctly
- Restart your computer
- Try installing Node.js again
- Make sure to use the LTS version

### Problem: "Cannot find module 'react'"
**Solution**: Dependencies didn't install
- Make sure you're in the right folder (`cd link-logic-game`)
- Try: `npm install --legacy-peer-deps`

### Problem: "Cannot read property 'apiKey' of undefined"
**Solution**: Firebase config not set correctly
- Double-check `src/config/firebase.js`
- Make sure you copied ALL the values from Firebase
- Each value should be in quotes

### Problem: "Port 3000 already in use"
**Solution**: Another app is using that port
- Close any other apps
- Or use: `PORT=3001 npm start`

### Problem: Players can't see each other
**Solution**: Check Firebase
- Go to Firebase Console
- Click Realtime Database
- You should see data appearing as you play
- If not, check your firebase.js config

### Problem: "npm: command not found"
**Solution**: Node.js/npm not installed
- Install Node.js (Step 1)
- Restart Terminal/Command Prompt

---

## 📱 Next Steps

Once everything works locally:

1. **Test with friends**: Share your screen or deploy it
2. **Deploy online**: Follow DEPLOYMENT.md
3. **Gather feedback**: Make a list of improvements
4. **Iterate**: Make changes and redeploy

---

## 🎉 You Did It!

You now have a working multiplayer game. That's impressive!

**What to do next:**
- Read PROJECT_SUMMARY.md for the big picture
- Read DEPLOYMENT.md when ready to go live
- Play with family and friends
- Have fun! 🎮

---

## 📞 Need Help?

If you get stuck:
1. ✅ Check this checklist again
2. ✅ Read the error message carefully
3. ✅ Google the error message
4. ✅ Check Firebase Console for errors
5. ✅ Look in browser console (F12 → Console tab)

Most issues are:
- Wrong Firebase config
- Not in the right folder
- Missing Node.js installation

Take it step by step. You've got this! 💪

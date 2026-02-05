# DEPLOYMENT GUIDE
## How to Put Link Logic Online

Once you've tested the game locally and you're ready to share it with the world, here's how to deploy it.

## Option 1: Firebase Hosting (Recommended - FREE)

Firebase Hosting is perfect because you're already using Firebase for the database!

### Setup (One Time)

1. Install Firebase CLI:
```bash
npm install -g firebase-tools
```

2. Login to Firebase:
```bash
firebase login
```

3. Initialize Firebase in your project folder:
```bash
firebase init
```

When prompted:
- ✅ Select: **Hosting**
- ✅ Use existing project: Select your link-logic project
- ✅ Public directory: `build`
- ✅ Single-page app: `Yes`
- ❌ Automatic builds: `No`
- ❌ Overwrite index.html: `No`

### Deploy

Every time you want to deploy:

```bash
# Build the production version
npm run build

# Deploy to Firebase
firebase deploy
```

Your app will be live at:
- `https://your-project-id.web.app`
- `https://your-project-id.firebaseapp.com`

### Update Your App

To update after making changes:
```bash
npm run build
firebase deploy
```

---

## Option 2: Vercel (Also FREE)

Vercel is great for React apps and very easy to use.

### Setup

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy:
```bash
vercel
```

3. Follow the prompts:
- Link to existing project? `No`
- Project name: `link-logic-game`
- Directory: `./` (current directory)
- Build command: `npm run build`
- Output directory: `build`

Your app will be live at a vercel.app URL.

### Update Your App

```bash
vercel --prod
```

---

## Option 3: Netlify (Also FREE)

### Via Netlify CLI

1. Install:
```bash
npm install -g netlify-cli
```

2. Deploy:
```bash
npm run build
netlify deploy --prod
```

### Via Drag & Drop (Easiest!)

1. Run: `npm run build`
2. Go to https://app.netlify.com/drop
3. Drag the `build` folder to the page
4. Done!

---

## Custom Domain (Optional)

### Firebase Hosting

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow the instructions to verify and connect

### Vercel/Netlify

1. Go to your project dashboard
2. Click "Domains"
3. Add your domain and follow DNS instructions

Most domain providers (GoDaddy, Namecheap, etc.) have guides for this.

---

## Security: Updating Firebase Rules

⚠️ **IMPORTANT**: Before going live, secure your database!

Right now, anyone can read/write to your database. That's fine for testing but NOT for production.

### Step 1: Go to Firebase Console → Realtime Database → Rules

### Step 2: Replace with these rules:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": "auth != null || data.exists()",
        "players": {
          "$playerId": {
            ".write": "$playerId === newData.child('name').val()"
          }
        }
      }
    },
    "players": {
      "$playerId": {
        ".read": true,
        ".write": "!data.exists()"
      }
    }
  }
}
```

These rules:
- ✅ Allow anyone to read rooms (needed for game play)
- ✅ Allow room creation but limit updates
- ✅ Prevent player name theft
- ✅ Allow player registration

### Step 3: Test thoroughly after updating rules!

---

## Performance Tips

### 1. Enable Firebase Persistence

In `src/config/firebase.js`, add:
```javascript
import { enableDatabase Persistence } from 'firebase/database';

// After initializing database
enableDatabasePersistence(database);
```

### 2. Optimize Images

Your logo and banner images could be optimized:
- Use https://tinypng.com/ to compress them
- Consider using WebP format

### 3. Add Service Worker (PWA)

Make your app installable on phones!
- Create React App includes service worker support
- Uncomment the service worker code in `src/index.js`

---

## Monitoring Your Deployed App

### Firebase Console

- **Realtime Database**: See active games and players
- **Hosting**: See traffic and bandwidth
- **Usage**: Monitor free tier limits

### Free Tier Limits (More than enough for testing)

- **Realtime Database**: 1GB storage, 10GB/month download
- **Hosting**: 10GB storage, 360MB/day bandwidth
- **These limits support ~1000-5000 concurrent users**

---

## Sharing Your Game

Once deployed, share with:
1. **Direct Link**: Send the URL via text/email
2. **QR Code**: Generate at https://www.qr-code-generator.com/
3. **Social Media**: Share the link on Facebook, Twitter, etc.

---

## Troubleshooting Deployment

### Build Errors

```bash
# Clear cache and rebuild
rm -rf node_modules build
npm install
npm run build
```

### Firebase Deployment Fails

```bash
# Re-login
firebase logout
firebase login

# Try again
firebase deploy
```

### App Loads But Doesn't Work

- Check browser console (F12 → Console)
- Verify Firebase config is correct
- Check Firebase Database rules
- Make sure Realtime Database is enabled

---

## Cost Estimate (If You Get Popular!)

Firebase pricing is pay-as-you-go after free tier:

- **Up to 100 concurrent players**: FREE
- **1000 concurrent players**: ~$5/month
- **10,000 concurrent players**: ~$25/month

You'll get warnings before hitting limits!

---

## Next Steps After Deployment

1. ✅ Share with friends and family
2. ✅ Gather feedback
3. ✅ Monitor Firebase Console
4. ✅ Update security rules
5. ✅ Consider custom domain
6. ✅ Add Google Analytics (optional)

---

**Questions?**
- Firebase docs: https://firebase.google.com/docs
- Vercel docs: https://vercel.com/docs
- Netlify docs: https://docs.netlify.com

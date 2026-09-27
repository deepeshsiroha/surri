# Surri (सुर्री) - Indian Card Game

A dealer-centric, trick-taking Indian variant of Spades built with **React**, **TypeScript**, **Tailwind CSS**, and **Vite**, featuring full authentic game mechanics, smart AI bots, Web Audio API sound synthesis, and real-time TRAM calculations.

---

## 🎴 Key Surri Rules & Features

- **4 Players in 2 Partnerships**:
  - **Team US**: You (South) & Partner Arjun (North)
  - **Team THEM**: Vikram (West) & Kabir (East)
- **Pre-Bid Signals**:
  - Communicate hand strength before placing bids: `Major` (♠/♥ strength), `Minor` (♣/♦ strength), or `Pass` (low support).
  - Interact with AI partner to ask for recommendations.
- **Bidding Phase**:
  - Bids start at **10** tricks (range 10–13), with **8** available in forced dealer situations if all other players pass.
  - The winning bidder chooses any suit as **Trump** (♠, ♥, ♦, or ♣).
- **The Bid 10+ Dummy Hand Rule**:
  - When a player bids 10 or more and wins the contract, their partner's hand is laid face-up on the table as a **Dummy Hand**, and the bidder controls both their own and their partner's cards!
- **Bid 13 (Slam)**:
  - High-stakes all-or-nothing bid: Win all 13 tricks to claim an instant victory, or lose even 1 trick to face instant defeat.
- **TRAM (The Rest Are Mine)**:
  - If a player holds unbeatable master cards during the round, they can click the **Claim TRAM** button to immediately sweep all remaining tricks.
- **Dealer-Centric 52-Point Knockout Scoring**:
  - Only the dealer's team tracks accumulated penalty points.
  - Reaching **52 or more penalty points** results in that player being knocked out (Loss).
  - The match concludes when one team forces **3 unique player knockouts** on the opposing team!
- **Built-in Web Audio API**:
  - 100% self-contained synthesized audio effects for card deals, snaps, trick wins, trump fanfares, TRAM sweeps, and match celebrations.

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Development Server
```bash
npm run dev
```
Open your browser at `http://localhost:3000` to start playing!

### 3. Run Automated Tests
```bash
npm test
```

### 4. Build for Production & Sync Android
```bash
npm run cap:build
```
The optimized bundle will be created in `dist/` and synced into the `android/` native project.

---

## 📱 Building Android APK via GitHub Actions

This repository is pre-configured with **Capacitor** and a **GitHub Actions CI/CD workflow** (`.github/workflows/build-apk.yml`) to automatically build an Android `.apk` whenever you push to GitHub!

### How to push and get your APK:

1. **Initialize Git and commit**:
   ```bash
   git init
   git add .
   git commit -m "Surri Card Game with Android APK workflow"
   ```

2. **Add your GitHub remote repository**:
   ```bash
   git remote add origin https://github.com/<your-username>/<your-repo-name>.git
   git branch -M main
   git push -u origin main
   ```

3. **Download the APK**:
   - Go to your repository on GitHub.
   - Click the **Actions** tab at the top.
   - Click on the latest **Build Android APK** workflow run.
   - Under **Artifacts** at the bottom of the page, click **`surri-apk`** to download `app-debug.apk`.
   - Install the APK directly on any Android phone!

---

## 🎮 How to Play

1. **Signals**: Start the round by reviewing your 13 cards. Ask your partner Arjun for a signal or send your own signal (`Major`, `Minor`, or `Pass`).
2. **Bidding**: Bid how many tricks (10 to 13) your team can win. If everyone passes to the dealer, the dealer is forced to bid at least 8.
3. **Choose Trump**: If you win the bid, choose the trump suit.
4. **Tricks**: The bidder leads the first trick. Follow suit if you have cards in the led suit; otherwise, trump in or discard.
5. **Dummy Play**: If you bid 10+, click on valid cards in Arjun's dummy hand when it is his turn.
6. **Claim TRAM**: Whenever your remaining cards are guaranteed winners, click **Claim TRAM** to sweep the rest of the tricks.
7. **Scorebook**: Track the dealer's score toward 52 and work to survive while pushing opponents over 52!

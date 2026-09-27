import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  Card,
  Contract,
  GamePhase,
  GameSettings,
  PlayedCard,
  Player,
  PlayerId,
  RoundScore,
  SignalType,
  Suit,
  TeamId,
  Trick,
} from './game/types';
import { dealDeck, sortHand, SUIT_SYMBOLS } from './game/deck';
import {
  canClaimTRAM,
  determineTrickWinner,
  getAvailableBids,
  getNextPlayer,
  getPartner,
  getTeam,
  getValidPlays,
} from './game/rules';
import { chooseBid, chooseCardToPlay, chooseTrump, getBotChat } from './game/ai';
import { calculateRoundScore, KNOCKOUT_THRESHOLD } from './game/scoring';
import { sounds } from './game/sound';
import { CardView } from './components/CardView';
import { PlayerSeat } from './components/PlayerSeat';
import { TrickArea } from './components/TrickArea';
import { InlineControls } from './components/InlineControls';
import { Scoreboard } from './components/Scoreboard';
import { TRAMModal } from './components/TRAMModal';
import { RulesModal } from './components/RulesModal';
import { SettingsModal } from './components/SettingsModal';
import {
  Award,
  HelpCircle,
  Play,
  RotateCcw,
  Settings,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';

const INITIAL_PLAYERS: Record<PlayerId, Player> = {
  south: {
    id: 'south',
    name: 'You',
    avatar: '😎',
    team: 'us',
    isHuman: true,
    hand: [],
    tricksWon: 0,
    currentBid: null,
    signal: null,
    score: 0,
  },
  west: {
    id: 'west',
    name: 'Vikram',
    avatar: '🦁',
    team: 'them',
    isHuman: false,
    hand: [],
    tricksWon: 0,
    currentBid: null,
    signal: null,
    score: 0,
  },
  north: {
    id: 'north',
    name: 'Arjun',
    avatar: '🎯',
    team: 'us',
    isHuman: false,
    hand: [],
    tricksWon: 0,
    currentBid: null,
    signal: null,
    score: 0,
  },
  east: {
    id: 'east',
    name: 'Kabir',
    avatar: '🦊',
    team: 'them',
    isHuman: false,
    hand: [],
    tricksWon: 0,
    currentBid: null,
    signal: null,
    score: 0,
  },
};

export const App: React.FC = () => {
  // Game Settings
  const [settings, setSettings] = useState<GameSettings>({
    speed: 'normal',
    soundEnabled: true,
    botCommentary: true,
    fourColorDeck: true,
  });

  // Modals
  const [isScoreboardOpen, setIsScoreboardOpen] = useState(false);
  const [isRulesOpen, setIsRulesOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTRAMModalOpen, setIsTRAMModalOpen] = useState(false);
  const [tramValidation, setTramValidation] = useState({ valid: false, reason: '' });

  // Core Game State
  const [phase, setPhase] = useState<GamePhase>('WAITING_TO_START');
  const [roundNumber, setRoundNumber] = useState(1);
  const [dealer, setDealer] = useState<PlayerId>('south');
  const [pendingNextDealer, setPendingNextDealer] = useState<PlayerId>('south');
  const [currentTurn, setCurrentTurn] = useState<PlayerId>('south');
  const [players, setPlayers] = useState<Record<PlayerId, Player>>(INITIAL_PLAYERS);
  const [currentTrick, setCurrentTrick] = useState<Trick>({
    leadSuit: null,
    cards: [],
    winner: null,
  });
  const [trickHistory, setTrickHistory] = useState<Trick[]>([]);
  const [contract, setContract] = useState<Contract | null>(null);
  const [trumpSuit, setTrumpSuit] = useState<Suit | null>(null);
  const [biddingHistory, setBiddingHistory] = useState<
    { playerId: PlayerId; bid: number | 'pass' }[]
  >([]);
  const [consecutivePasses, setConsecutivePasses] = useState(0);
  const [highestBid, setHighestBid] = useState(0);
  const [highestBidder, setHighestBidder] = useState<PlayerId | null>(null);
  const [lastTrickWinner, setLastTrickWinner] = useState<PlayerId | null>(null);
  const [roundScores, setRoundScores] = useState<RoundScore[]>([]);
  const [teamScores, setTeamScores] = useState<Record<TeamId, number>>({ us: 0, them: 0 });
  const [matchWinner, setMatchWinner] = useState<TeamId | null>(null);
  const [chatBubbles, setChatBubbles] = useState<Record<PlayerId, string | null>>({
    south: null,
    west: null,
    north: null,
    east: null,
  });
  const [roundSummaryNote, setRoundSummaryNote] = useState('');

  // Audio synch
  useEffect(() => {
    sounds.enabled = settings.soundEnabled;
  }, [settings.soundEnabled]);

  // Delay helper based on speed
  const getDelay = (type: 'bot_play' | 'trick_resolve' | 'deal'): number => {
    if (settings.speed === 'instant') return 50;
    if (settings.speed === 'fast') {
      return type === 'trick_resolve' ? 800 : 350;
    }
    // Normal speed
    return type === 'trick_resolve' ? 1500 : 800;
  };

  // Chat bubble helper
  const showBubble = (player: PlayerId, text: string, duration = 3000) => {
    if (!settings.botCommentary && !players[player].isHuman) return;
    setChatBubbles((prev) => ({ ...prev, [player]: text }));
    setTimeout(() => {
      setChatBubbles((prev) => ({ ...prev, [player]: null }));
    }, duration);
  };

  // Start a fresh round
  const startNewRound = (overrideDealer?: PlayerId) => {
    const activeDealer = overrideDealer || dealer;
    if (overrideDealer && overrideDealer !== dealer) {
      setDealer(overrideDealer);
    }
    const hands = dealDeck();
    sounds.playDeal();

    setPlayers((prev) => ({
      south: { ...prev.south, hand: hands.south, tricksWon: 0, currentBid: null, signal: null },
      west: { ...prev.west, hand: hands.west, tricksWon: 0, currentBid: null, signal: null },
      north: { ...prev.north, hand: hands.north, tricksWon: 0, currentBid: null, signal: null },
      east: { ...prev.east, hand: hands.east, tricksWon: 0, currentBid: null, signal: null },
    }));

    setCurrentTrick({ leadSuit: null, cards: [], winner: null });
    setTrickHistory([]);
    setContract(null);
    setTrumpSuit(null);
    setBiddingHistory([]);
    setConsecutivePasses(0);
    setHighestBid(0);
    setHighestBidder(null);
    setLastTrickWinner(null);
    setRoundSummaryNote('');

    const firstBidder = getNextPlayer(activeDealer);
    setCurrentTurn(firstBidder);
    setPhase('BIDDING');
  };

  // Reset entire match
  const resetMatch = () => {
    setPlayers(INITIAL_PLAYERS);
    setRoundNumber(1);
    setDealer('south');
    setPendingNextDealer('south');
    setTeamScores({ us: 0, them: 0 });
    setRoundScores([]);
    setMatchWinner(null);
    startNewRound('south');
  };

  // --- BIDDING PHASE ---
  // If bot's turn during bidding, trigger automated bid
  useEffect(() => {
    if (phase !== 'BIDDING') return;

    const currentPlayer = players[currentTurn];
    if (currentPlayer.isHuman) return; // Wait for South

    const timer = setTimeout(() => {
      processBotBid(currentTurn);
    }, getDelay('bot_play'));

    return () => clearTimeout(timer);
  }, [phase, currentTurn, consecutivePasses, highestBid, players]);

  const processBotBid = (botId: PlayerId) => {
    const botHand = players[botId].hand;
    const partnerId = getPartner(botId);
    const partnerSig = players[partnerId].signal;
    const availableBids = getAvailableBids(botId, dealer, highestBid, biddingHistory.length);

    const bidResult = chooseBid(botHand, partnerSig, highestBid, availableBids);

    if (bidResult === 'pass') {
      handleBidAction(botId, 'pass');
      showBubble(botId, getBotChat('bid_pass'));
    } else {
      handleBidAction(botId, bidResult);
      if (bidResult === 13) {
        showBubble(botId, getBotChat('bid_13'));
      } else {
        showBubble(botId, getBotChat('bid_made'));
      }
    }
  };

  const handleBidAction = (playerId: PlayerId, bid: number | 'pass') => {
    sounds.playBid();

    setPlayers((prev) => ({
      ...prev,
      [playerId]: { ...prev[playerId], currentBid: bid },
    }));

    setBiddingHistory((prev) => [...prev, { playerId, bid }]);

    if (bid === 'pass') {
      const nextPasses = consecutivePasses + 1;
      setConsecutivePasses(nextPasses);

      // Case 1: All 4 players passed from the start without any bid -> Redeal fresh round
      if (highestBidder === null && nextPasses >= 4) {
        showBubble(dealer, 'All 4 players passed! Redealing hands...');
        setTimeout(() => {
          startNewRound();
        }, 1500);
        return;
      }

      // Case 2: A bid exists on the table and 3 subsequent players passed -> highest bidder wins!
      if (highestBidder !== null && nextPasses >= 3) {
        finalizeBidding(highestBidder, highestBid);
        return;
      }

      // Turn moves to next player
      setCurrentTurn(getNextPlayer(playerId));
    } else {
      // Player placed a bid (8, 10, 11, 12, 13)
      setHighestBid(bid);
      setHighestBidder(playerId);
      setConsecutivePasses(0); // Reset consecutive passes

      // Turn ALWAYS moves to the next player so they get an option to raise higher!
      setCurrentTurn(getNextPlayer(playerId));
    }
  };

  const finalizeBidding = (winner: PlayerId, winningBid: number) => {
    const partner = getPartner(winner);
    const bidderTeam = getTeam(winner);
    const isDummy = winningBid >= 10;
    const is13 = winningBid === 13;

    const newContract: Contract = {
      bidder: winner,
      partner,
      bid: winningBid,
      trump: null,
      team: bidderTeam,
      isDummyActive: isDummy,
      isBid13: is13,
    };

    setContract(newContract);

    if (winner === 'south') {
      // South picks trump!
      setPhase('TRUMP_SELECTION');
    } else {
      // Bot picks trump
      const botTrump = chooseTrump(players[winner].hand, players[partner].signal);
      applyTrumpChoice(botTrump, newContract);
    }
  };

  const applyTrumpChoice = (suit: Suit, currentContract: Contract) => {
    sounds.playTrumpFanfare();
    setTrumpSuit(suit);
    setContract({ ...currentContract, trump: suit });

    // Winning bidder leads the first trick!
    setCurrentTurn(currentContract.bidder);
    setPhase('PLAYING');
  };

  // --- TRICK PLAYING PHASE ---
  // Determine if it's currently human turn (either South, or North if South controls dummy)
  const isSouthDummyController =
    contract?.isDummyActive && contract?.bidder === 'south';

  const isHumanTurn =
    (currentTurn === 'south') ||
    (currentTurn === 'north' && isSouthDummyController);

  // Bot plays their turn automatically
  useEffect(() => {
    if (phase !== 'PLAYING') return;
    if (isHumanTurn) return; // Waiting for human click

    const timer = setTimeout(() => {
      processBotPlay(currentTurn);
    }, getDelay('bot_play'));

    return () => clearTimeout(timer);
  }, [phase, currentTurn, currentTrick, trumpSuit, players]);

  const processBotPlay = (botId: PlayerId) => {
    const botHand = players[botId].hand;
    const cardToPlay = chooseCardToPlay(botHand, currentTrick, trumpSuit, botId);
    executePlayCard(botId, cardToPlay);
  };

  const executePlayCard = (playerId: PlayerId, card: Card) => {
    sounds.playCard();

    // Remove card from player hand
    setPlayers((prev) => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        hand: prev[playerId].hand.filter((c) => c.id !== card.id),
      },
    }));

    const newPlayedCards: PlayedCard[] = [
      ...currentTrick.cards,
      { playerId, card },
    ];

    const leadSuit = currentTrick.leadSuit || card.suit;

    if (newPlayedCards.length === 4) {
      // Trick is complete!
      const { winner } = determineTrickWinner(newPlayedCards, trumpSuit);
      setCurrentTrick({
        leadSuit,
        cards: newPlayedCards,
        winner,
      });

      setPhase('TRICK_RESOLVING');
      setLastTrickWinner(winner);

      setTimeout(() => {
        resolveCompletedTrick(winner, {
          leadSuit,
          cards: newPlayedCards,
          winner,
        });
      }, getDelay('trick_resolve'));
    } else {
      // Advance to next player
      setCurrentTrick({
        leadSuit,
        cards: newPlayedCards,
        winner: null,
      });
      setCurrentTurn(getNextPlayer(playerId));
    }
  };

  const resolveCompletedTrick = (winner: PlayerId, completedTrick: Trick) => {
    sounds.playTrickWon();

    // Award trick to winner
    setPlayers((prev) => ({
      ...prev,
      [winner]: {
        ...prev[winner],
        tricksWon: prev[winner].tricksWon + 1,
      },
    }));

    setTrickHistory((prev) => [...prev, completedTrick]);
    setCurrentTrick({ leadSuit: null, cards: [], winner: null });

    // Check if round is over (13 tricks completed)
    const totalTricksPlayed = trickHistory.length + 1;

    if (totalTricksPlayed >= 13) {
      finalizeRound(winner);
    } else {
      // Winner of previous trick leads next trick
      setCurrentTurn(winner);
      setPhase('PLAYING');
    }
  };

  // --- TRAM (The Rest Are Mine) ---
  const handleCheckTRAM = () => {
    if (!trumpSuit) return;
    const allRemainingHands: Record<PlayerId, Card[]> = {
      south: players.south.hand,
      west: players.west.hand,
      north: players.north.hand,
      east: players.east.hand,
    };

    const claimant = currentTurn === 'north' && isSouthDummyController ? 'north' : 'south';
    const validation = canClaimTRAM(
      players[claimant].hand,
      allRemainingHands,
      claimant,
      trumpSuit
    );

    setTramValidation(validation);
    setIsTRAMModalOpen(true);
  };

  const handleExecuteTRAM = () => {
    setIsTRAMModalOpen(false);
    sounds.playTram();
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    // Award all remaining cards as tricks to Team US
    const remainingTricks = players.south.hand.length;

    setPlayers((prev) => ({
      ...prev,
      south: { ...prev.south, tricksWon: prev.south.tricksWon + remainingTricks, hand: [] },
      north: { ...prev.north, hand: [] },
      west: { ...prev.west, hand: [] },
      east: { ...prev.east, hand: [] },
    }));

    showBubble('south', 'The Rest Are Mine! TRAM Claimed!');

    setTimeout(() => {
      finalizeRound('south');
    }, 1200);
  };

  // --- FINALIZE ROUND & SCORING ---
  const finalizeRound = (finalTrickWinner: PlayerId) => {
    setPhase('ROUND_OVER');

    // Calculate tricks
    const tricksUs =
      players.south.tricksWon +
      players.north.tricksWon +
      (finalTrickWinner === 'south' || finalTrickWinner === 'north' ? 1 : 0);
    const tricksThem =
      players.west.tricksWon +
      players.east.tricksWon +
      (finalTrickWinner === 'west' || finalTrickWinner === 'east' ? 1 : 0);

    const { roundScore, result } = calculateRoundScore(
      roundNumber,
      dealer,
      contract!,
      tricksUs,
      tricksThem,
      teamScores.us,
      teamScores.them
    );

    setRoundScores((prev) => [...prev, roundScore]);
    setRoundSummaryNote(result.notes);
    setTeamScores({ us: result.newTotalScoreUs, them: result.newTotalScoreThem });
    setPendingNextDealer(result.nextDealer);

    // Update cumulative player scores
    setPlayers((prev) => ({
      south: { ...prev.south, score: result.newTotalScoreUs },
      north: { ...prev.north, score: result.newTotalScoreUs },
      west: { ...prev.west, score: result.newTotalScoreThem },
      east: { ...prev.east, score: result.newTotalScoreThem },
    }));

    // Match Winner check
    if (result.isMatchOver) {
      setMatchWinner(result.matchWinner);
      setPhase('MATCH_OVER');
      if (result.matchWinner === 'us') {
        sounds.playVictory();
        confetti({ particleCount: 200, spread: 100, origin: { y: 0.5 } });
      } else {
        sounds.playDefeat();
      }
    } else {
      // Normal round conclusion sound
      if (result.bidMade && contract?.team === 'us') {
        sounds.playVictory();
        confetti({ particleCount: 70, spread: 60, origin: { y: 0.7 } });
      } else if (!result.bidMade && contract?.team === 'them') {
        sounds.playTrickWon();
      } else {
        sounds.playDefeat();
      }
    }
  };

  const handleNextRound = () => {
    setRoundNumber((r) => r + 1);
    setDealer(pendingNextDealer);
    startNewRound(pendingNextDealer);
  };

  // Check valid cards for human player and partner dummy
  const isDummyRevealed = phase === 'PLAYING' && !!contract?.isDummyActive && trumpSuit !== null;
  const humanHand = sortHand(players.south.hand);
  const playableSouthCards =
    phase === 'PLAYING' && currentTurn === 'south'
      ? getValidPlays(humanHand, currentTrick.leadSuit)
      : [];

  const dummyHand = sortHand(players.north.hand);
  const playableDummyCards =
    phase === 'PLAYING' && currentTurn === 'north' && isSouthDummyController
      ? getValidPlays(dummyHand, currentTrick.leadSuit)
      : [];

  const canAttemptTRAM =
    phase === 'PLAYING' &&
    trumpSuit !== null &&
    (currentTurn === 'south' || (currentTurn === 'north' && isSouthDummyController)) &&
    players.south.hand.length >= 2;

  // Initial deal trigger on component mount
  useEffect(() => {
    if (phase === 'WAITING_TO_START') {
      startNewRound();
    }
  }, []);

  const totalUsTricks = players.south.tricksWon + players.north.tricksWon;
  const totalThemTricks = players.west.tricksWon + players.east.tricksWon;

  return (
    <div className="min-h-screen flex flex-col justify-between p-2 sm:p-4 relative overflow-hidden select-none">
      {/* Top App Bar */}
      <header className="flex items-center justify-between px-3 py-2 rounded-2xl bg-black/50 backdrop-blur-md border border-gold-500/30 shadow-lg z-20">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-felt-700 border border-gold-400 flex items-center justify-center font-serif font-black text-gold-300 text-sm shadow">
            ♠
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-bold font-serif text-gold-300 tracking-wide flex items-center gap-1.5">
              SURRI
              <span className="text-[10px] font-sans bg-gold-400/20 text-gold-300 px-1.5 py-0.5 rounded border border-gold-400/40">
                Round {roundNumber}
              </span>
              <span className="hidden sm:inline-flex text-[10px] font-sans bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded border border-amber-400/40 font-semibold items-center gap-1">
                <span>Dealer:</span>
                <strong className="text-white">{players[dealer].name}</strong>
                <span className="text-amber-200">
                  (Dealing at {getTeam(dealer) === 'us' ? teamScores.us : teamScores.them})
                </span>
              </span>
            </h1>
          </div>
        </div>

        {/* Live Contract & Score Ticker */}
        <div className="hidden sm:flex items-center gap-4 text-xs">
          {contract && (
            <div className="flex items-center gap-2 bg-felt-900/80 px-3 py-1 rounded-xl border border-felt-600">
              <span className="text-slate-300">Contract:</span>
              <strong className="text-gold-300 font-bold">
                {contract.bid} {contract.trump && SUIT_SYMBOLS[contract.trump]}
              </strong>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                  contract.team === 'us'
                    ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                    : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                }`}
              >
                {contract.team === 'us' ? 'Team US' : 'Team THEM'}
              </span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-xl border border-slate-700 font-mono text-xs">
              <span
                className={`font-bold ${
                  teamScores.us >= 40 ? 'text-amber-400 animate-pulse' : 'text-emerald-400'
                }`}
                title="Knockout limit is 52. Crossing 52 loses the match!"
              >
                US {teamScores.us}/52
              </span>
              <span className="text-slate-500">:</span>
              <span
                className={`font-bold ${
                  teamScores.them >= 40 ? 'text-amber-400 animate-pulse' : 'text-rose-400'
                }`}
                title="Knockout limit is 52. Crossing 52 loses the match!"
              >
                {teamScores.them}/52 THEM
              </span>
            </div>
            {phase === 'PLAYING' && (
              <div className="hidden md:flex items-center gap-1.5 bg-felt-900/80 px-2.5 py-1 rounded-xl border border-felt-600 font-mono text-[11px] text-slate-300">
                <span>Tricks:</span>
                <strong className="text-emerald-400">{totalUsTricks}</strong>
                <span className="text-slate-500">-</span>
                <strong className="text-rose-400">{totalThemTricks}</strong>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1.5">
          {/* Quick 4-Color Deck Toggle */}
          <button
            onClick={() => setSettings((s) => ({ ...s, fourColorDeck: !s.fourColorDeck }))}
            className={`px-2.5 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 text-xs font-bold shadow ${
              settings.fourColorDeck
                ? 'bg-amber-950/70 border-amber-400 text-amber-300 ring-1 ring-amber-400/40'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-400 border-slate-700'
            }`}
            title="Toggle 4-Color High Visibility Deck"
          >
            <span className="font-mono text-sm leading-none">♠♥♣♦</span>
            <span className="hidden lg:inline text-[11px]">
              {settings.fourColorDeck ? '4-Color' : '2-Color'}
            </span>
          </button>

          <button
            onClick={() => setIsScoreboardOpen(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-gold-300 border border-slate-700 transition-colors flex items-center gap-1 text-xs font-semibold shadow"
            title="Scorebook"
          >
            <Trophy className="w-4 h-4 text-gold-400" />
            <span className="hidden md:inline">Scorebook</span>
          </button>

          <button
            onClick={() => setIsRulesOpen(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors flex items-center gap-1 text-xs font-semibold shadow"
            title="How to Play"
          >
            <HelpCircle className="w-4 h-4 text-sky-400" />
            <span className="hidden md:inline">Rules</span>
          </button>

          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors shadow"
            title="Settings"
          >
            <Settings className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </header>

      {/* Main Game Arena / Table */}
      <main className="flex-1 flex items-center justify-center my-2 relative">
        <div className="w-full max-w-5xl md:max-w-6xl h-[84vh] min-h-[660px] max-h-[780px] rounded-[40px] felt-table wood-rail relative flex items-center justify-center p-3 sm:p-6 overflow-hidden">
          {/* North Seat (Partner Arjun) */}
          <div
            className={`absolute z-30 transition-all duration-300 ${
              isDummyRevealed
                ? 'top-2 left-2 sm:top-4 sm:left-6'
                : 'top-2 sm:top-4 left-1/2 -translate-x-1/2'
            }`}
          >
            <PlayerSeat
              player={players.north}
              isCurrentTurn={currentTurn === 'north'}
              isDealer={dealer === 'north'}
              isDummyRevealed={isDummyRevealed}
              position="north"
              chatBubble={chatBubbles.north}
              trumpSuit={trumpSuit}
              fourColor={settings.fourColorDeck}
            />
          </div>

          {/* North Partner Revealed Dummy Hand (Top Fan - Shown in Similar Manner as Mine) */}
          {isDummyRevealed && (
            <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 z-20 w-full max-w-5xl px-2 sm:px-4 flex flex-col items-center">
              {/* Dummy Hand Status Header Badge */}
              <div className="flex items-center gap-1.5 mb-1 px-3 py-0.5 rounded-full bg-black/80 border border-gold-400/50 text-gold-300 text-xs font-semibold shadow backdrop-blur-sm">
                <Sparkles className="w-3.5 h-3.5 text-gold-400" />
                <span>Partner Arjun's Hand (Dummy)</span>
                {isSouthDummyController && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded border transition-all ${
                      currentTurn === 'north'
                        ? 'bg-amber-500 text-slate-950 border-amber-300 animate-pulse font-black'
                        : 'bg-emerald-950/70 text-emerald-400 border-emerald-500/40'
                    }`}
                  >
                    {currentTurn === 'north' ? '👉 Your Turn to Play Card' : 'Controlled by You'}
                  </span>
                )}
              </div>

              {/* Dynamic Spaced Cards - Identical to South's Hand */}
              <div
                className={`flex items-center overflow-visible py-2 transition-all duration-300 ${
                  dummyHand.length <= 3
                    ? 'gap-3 sm:gap-4 md:gap-5'
                    : dummyHand.length <= 6
                    ? 'gap-1.5 sm:gap-2.5 md:gap-3'
                    : dummyHand.length <= 9
                    ? '-space-x-3 sm:-space-x-4 md:-space-x-5 hover:-space-x-1'
                    : dummyHand.length <= 11
                    ? '-space-x-5 sm:-space-x-6 md:-space-x-7 hover:-space-x-2'
                    : '-space-x-6 sm:-space-x-7 md:-space-x-8 hover:-space-x-2'
                }`}
              >
                {dummyHand.map((card, idx) => {
                  const isPlayable =
                    isSouthDummyController &&
                    phase === 'PLAYING' &&
                    currentTurn === 'north' &&
                    playableDummyCards.some((c) => c.id === card.id);
                  const isTrump = trumpSuit === card.suit;
                  const isNewSuit = idx > 0 && card.suit !== dummyHand[idx - 1].suit;
                  const isNorthTurn = phase === 'PLAYING' && currentTurn === 'north';

                  return (
                    <div
                      key={card.id}
                      className={`transition-all duration-200 ${
                        isNewSuit && dummyHand.length > 6 ? 'ml-2.5 sm:ml-3.5 md:ml-4' : ''
                      }`}
                    >
                      <CardView
                        card={card}
                        size="md"
                        isPlayable={isPlayable}
                        isTrump={isTrump}
                        fourColor={settings.fourColorDeck}
                        isDimmed={isNorthTurn && isSouthDummyController && !isPlayable}
                        onClick={() => isPlayable && executePlayCard('north', card)}
                        className={`transition-all duration-200 ${
                          isPlayable
                            ? 'translate-y-2 ring-2 ring-amber-400 shadow-card-glow cursor-pointer'
                            : ''
                        }`}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* West Seat (Opponent Vikram) */}
          <div className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-10">
            <PlayerSeat
              player={players.west}
              isCurrentTurn={currentTurn === 'west'}
              isDealer={dealer === 'west'}
              position="west"
              chatBubble={chatBubbles.west}
            />
          </div>

          {/* East Seat (Opponent Kabir) */}
          <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-10">
            <PlayerSeat
              player={players.east}
              isCurrentTurn={currentTurn === 'east'}
              isDealer={dealer === 'east'}
              position="east"
              chatBubble={chatBubbles.east}
            />
          </div>

          {/* Center Felt Trick Area */}
          <div className="z-0">
            <TrickArea
              trick={currentTrick}
              trumpSuit={trumpSuit}
              lastWinner={lastTrickWinner}
              isResolving={phase === 'TRICK_RESOLVING'}
              canClaimTRAM={canAttemptTRAM}
              onTRAMClick={handleCheckTRAM}
              contract={contract}
              tricksUs={totalUsTricks}
              tricksThem={totalThemTricks}
              fourColor={settings.fourColorDeck}
            />
          </div>

          {/* Callbreak-Style Inline Controls for Bidding (8, 10, 11, 12, 13) and Trump Selection */}
          {((phase === 'BIDDING' && currentTurn === 'south') ||
            phase === 'TRUMP_SELECTION') && (
            <div className="absolute bottom-36 sm:bottom-44 left-1/2 -translate-x-1/2 z-30 w-full max-w-lg px-2">
              <InlineControls
                phase={phase}
                currentTurn={currentTurn}
                dealer={dealer}
                highestBid={highestBid}
                highestBidder={highestBidder}
                consecutivePasses={consecutivePasses}
                biddingHistoryLength={biddingHistory.length}
                onPlaceBid={(bid) => handleBidAction('south', bid)}
                onPass={() => handleBidAction('south', 'pass')}
                onSelectTrump={(suit) => applyTrumpChoice(suit, contract!)}
              />
            </div>
          )}

          {/* South Seat Info Badge (Bottom-Left Corner so cards have maximum room) */}
          <div className="absolute bottom-3 left-3 sm:bottom-5 sm:left-6 z-30">
            <PlayerSeat
              player={players.south}
              isCurrentTurn={currentTurn === 'south'}
              isDealer={dealer === 'south'}
              position="south"
              chatBubble={chatBubbles.south}
            />
          </div>

          {/* South Human Player Hand (Bottom Fan - Dynamic Spacing & Suit Separation) */}
          <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 z-20 w-full max-w-5xl px-2 sm:px-4 flex justify-center">
            <div
              className={`flex items-center overflow-visible py-3 transition-all duration-300 ${
                humanHand.length <= 3
                  ? 'gap-3 sm:gap-4 md:gap-5'
                  : humanHand.length <= 6
                  ? 'gap-1.5 sm:gap-2.5 md:gap-3'
                  : humanHand.length <= 9
                  ? '-space-x-3 sm:-space-x-4 md:-space-x-5 hover:-space-x-1'
                  : humanHand.length <= 11
                  ? '-space-x-5 sm:-space-x-6 md:-space-x-7 hover:-space-x-2'
                  : '-space-x-6 sm:-space-x-7 md:-space-x-8 hover:-space-x-2'
              }`}
            >
              {humanHand.map((card, idx) => {
                const isPlayable =
                  phase === 'PLAYING' &&
                  currentTurn === 'south' &&
                  playableSouthCards.some((c) => c.id === card.id);
                const isTrump = trumpSuit === card.suit;
                const isNewSuit = idx > 0 && card.suit !== humanHand[idx - 1].suit;
                const isSouthTurn = phase === 'PLAYING' && currentTurn === 'south';

                return (
                  <div
                    key={card.id}
                    className={`transition-all duration-200 ${
                      isNewSuit && humanHand.length > 6 ? 'ml-2 sm:ml-3 md:ml-4' : ''
                    }`}
                  >
                    <CardView
                      card={card}
                      size="md"
                      isPlayable={isPlayable}
                      isTrump={isTrump}
                      fourColor={settings.fourColorDeck}
                      isDimmed={isSouthTurn && !isPlayable}
                      onClick={() => isPlayable && executePlayCard('south', card)}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </main>

      {/* Footer Status Bar */}
      <footer className="px-4 py-2 bg-black/60 backdrop-blur-md rounded-2xl border border-slate-800 text-xs flex items-center justify-between z-20">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <span>
            {phase === 'BIDDING' &&
              (currentTurn === 'south'
                ? 'Your turn! Select 8, 10, 11, 12, 13 or Pass.'
                : `${players[currentTurn].name} is bidding...`)}
            {phase === 'TRUMP_SELECTION' && 'Select the Trump Suit for this round.'}
            {phase === 'PLAYING' &&
              (currentTurn === 'south'
                ? 'Your turn! Play a card to the trick.'
                : currentTurn === 'north' && isSouthDummyController
                ? "Your turn! Play from Partner Arjun's Dummy hand."
                : `${players[currentTurn].name}'s turn to play.`)}
            {phase === 'TRICK_RESOLVING' && 'Resolving trick for US vs THEM...'}
            {phase === 'ROUND_OVER' && 'Round complete! Review scores below.'}
            {phase === 'MATCH_OVER' && 'Match finished!'}
          </span>
        </div>

        {canAttemptTRAM && (
          <button
            onClick={handleCheckTRAM}
            className="bg-gold-500 hover:bg-gold-400 text-slate-950 font-black text-xs px-3 py-1 rounded-lg flex items-center gap-1 shadow-card-glow transition-all"
          >
            <Zap className="w-3.5 h-3.5 fill-slate-950" />
            TRAM
          </button>
        )}
      </footer>

      {/* --- MODALS & OVERLAYS --- */}
      {/* 1. Scoreboard Modal */}
      <Scoreboard
        isOpen={isScoreboardOpen}
        onClose={() => setIsScoreboardOpen(false)}
        dealer={dealer}
        players={players}
        roundScores={roundScores}
        teamScores={teamScores}
        currentRound={roundNumber}
      />

      {/* 5. TRAM Modal */}
      <TRAMModal
        isOpen={isTRAMModalOpen}
        onClose={() => setIsTRAMModalOpen(false)}
        onConfirmClaim={handleExecuteTRAM}
        isValid={tramValidation.valid}
        reason={tramValidation.reason}
      />

      {/* 6. Rules Modal */}
      <RulesModal isOpen={isRulesOpen} onClose={() => setIsRulesOpen(false)} />

      {/* 7. Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={(newSt) => setSettings((s) => ({ ...s, ...newSt }))}
        onResetMatch={resetMatch}
      />

      {/* 8. Round Over Overlay */}
      {phase === 'ROUND_OVER' && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-gold-500 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award className="w-6 h-6 text-gold-400" />
              <h2 className="text-xl font-bold font-serif text-gold-300">
                Round {roundNumber} Summary
              </h2>
            </div>

            <div className="bg-black/50 border border-slate-800 rounded-xl p-4 my-4 space-y-2 text-xs">
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Dealer (Score x):</span>
                <span className="font-bold text-amber-300">
                  {players[dealer].name} ({getTeam(dealer) === 'us' ? 'Team US' : 'Team THEM'}, Dealt at {getTeam(dealer) === 'us' ? teamScores.us : teamScores.them})
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Contract:</span>
                <span className="font-bold text-white flex items-center gap-1.5">
                  {contract?.bid} {contract?.trump && SUIT_SYMBOLS[contract.trump]} by{' '}
                  <span
                    className={`px-1.5 py-0.5 rounded text-xs font-bold ${
                      contract?.team === 'us'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40'
                        : 'bg-rose-950 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    {contract?.team === 'us' ? 'Team US' : 'Team THEM'}
                  </span>
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Tricks Won:</span>
                <span>
                  <strong className="text-emerald-400">{totalUsTricks}</strong> (US) vs{' '}
                  <strong className="text-rose-400">{totalThemTricks}</strong> (THEM)
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Match Score (Knockout at 52):</span>
                <span>
                  <strong className={teamScores.us >= 40 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                    {teamScores.us}/52
                  </strong>{' '}
                  (US) vs{' '}
                  <strong className={teamScores.them >= 40 ? 'text-amber-400 font-bold' : 'text-rose-400 font-bold'}>
                    {teamScores.them}/52
                  </strong>{' '}
                  (THEM)
                </span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-2">
                <span className="text-slate-400">Next Deal:</span>
                <span className="text-gold-300 font-semibold">
                  {players[pendingNextDealer].name} ({getTeam(pendingNextDealer) === 'us' ? 'Team US' : 'Team THEM'})
                </span>
              </div>
              <div className="text-left text-gold-300 pt-1 leading-relaxed">
                {roundSummaryNote}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsScoreboardOpen(true)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-2.5 rounded-xl transition-colors"
              >
                View Scorebook
              </button>
              <button
                onClick={handleNextRound}
                className="flex-1 bg-gold-500 hover:bg-gold-400 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
              >
                <Play className="w-4 h-4 fill-slate-950" />
                Next Round
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 9. Match Over Championship Overlay */}
      {phase === 'MATCH_OVER' && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-lg flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-gold-400 rounded-3xl max-w-lg w-full p-8 shadow-2xl text-center">
            <div className="w-16 h-16 rounded-full bg-gold-500/20 border-2 border-gold-400 flex items-center justify-center mx-auto mb-3 shadow-card-glow">
              <Trophy className="w-8 h-8 text-gold-400" />
            </div>

            <h2 className="text-2xl font-black font-serif text-gold-300 mb-1">
              {matchWinner === 'us'
                ? 'VICTORY! SURRI CHAMPIONS!'
                : matchWinner === 'them'
                ? 'MATCH DEFEAT!'
                : 'MATCH DRAW!'}
            </h2>

            <p className="text-xs text-slate-300 mb-6">
              {matchWinner === 'us'
                ? `Outstanding play! Opponents crossed the 52-point limit (${teamScores.them} > ${KNOCKOUT_THRESHOLD} pts). Your partnership wins Surri!`
                : matchWinner === 'them'
                ? `Match ended! Your partnership crossed the 52-point limit (${teamScores.us} > ${KNOCKOUT_THRESHOLD} pts). Opponents win Surri.`
                : `A thrilling tie! Both partnerships crossed 52 pts simultaneously.`}
            </p>

            <div className="grid grid-cols-2 gap-3 mb-6 text-xs">
              <div
                className={`p-3 border rounded-xl ${
                  teamScores.us > KNOCKOUT_THRESHOLD
                    ? 'bg-rose-950/60 border-rose-500/50'
                    : 'bg-felt-900/60 border-felt-600'
                }`}
              >
                <div className="text-emerald-400 font-bold mb-1">Team You & Arjun</div>
                <div className="text-lg font-black text-white font-mono">
                  {teamScores.us} / {KNOCKOUT_THRESHOLD} pts
                </div>
                <div
                  className={`text-[10px] font-bold ${
                    teamScores.us > KNOCKOUT_THRESHOLD ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {teamScores.us > KNOCKOUT_THRESHOLD ? 'Knocked Out (> 52)' : 'Survived'}
                </div>
              </div>
              <div
                className={`p-3 border rounded-xl ${
                  teamScores.them > KNOCKOUT_THRESHOLD
                    ? 'bg-rose-950/60 border-rose-500/50'
                    : 'bg-felt-900/60 border-felt-600'
                }`}
              >
                <div className="text-rose-400 font-bold mb-1">Team Vikram & Kabir</div>
                <div className="text-lg font-black text-white font-mono">
                  {teamScores.them} / {KNOCKOUT_THRESHOLD} pts
                </div>
                <div
                  className={`text-[10px] font-bold ${
                    teamScores.them > KNOCKOUT_THRESHOLD ? 'text-rose-400' : 'text-emerald-400'
                  }`}
                >
                  {teamScores.them > KNOCKOUT_THRESHOLD ? 'Knocked Out (> 52)' : 'Survived'}
                </div>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setIsScoreboardOpen(true)}
                className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs py-3 rounded-xl transition-colors"
              >
                Match Scores
              </button>
              <button
                onClick={resetMatch}
                className="flex-1 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-slate-950 font-black text-xs py-3 rounded-xl shadow-card-glow flex items-center justify-center gap-1.5 transition-all"
              >
                <RotateCcw className="w-4 h-4" />
                Play Again
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default App;

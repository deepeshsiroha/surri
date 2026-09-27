export type Suit = 'spades' | 'hearts' | 'diamonds' | 'clubs';

export type Rank = '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K' | 'A';

export interface Card {
  id: string; // e.g. "S-A", "H-10"
  suit: Suit;
  rank: Rank;
  value: number; // 2..14 for ranking comparisons
}

export type PlayerId = 'south' | 'west' | 'north' | 'east';

export type TeamId = 'us' | 'them'; // 'us' = South & North; 'them' = West & East

export type SignalType = 'major' | 'minor' | 'pass';

export interface Player {
  id: PlayerId;
  name: string;
  avatar: string;
  team: TeamId;
  isHuman: boolean;
  hand: Card[];
  tricksWon: number;
  currentBid: number | 'pass' | null;
  signal: SignalType | null;
  score: number;
  penaltyPoints?: number;
  losses?: number;
}

export interface PlayedCard {
  playerId: PlayerId;
  card: Card;
}

export interface Trick {
  leadSuit: Suit | null;
  cards: PlayedCard[];
  winner: PlayerId | null;
}

export type GamePhase =
  | 'WAITING_TO_START'
  | 'DEALING'
  | 'SIGNALS'
  | 'BIDDING'
  | 'TRUMP_SELECTION'
  | 'PLAYING'
  | 'TRICK_RESOLVING'
  | 'ROUND_OVER'
  | 'MATCH_OVER';

export interface Contract {
  bidder: PlayerId;
  partner: PlayerId;
  bid: number; // 8, 10, 11, 12, 13
  trump: Suit | null;
  team: TeamId;
  isDummyActive: boolean; // true if bid >= 10
  isBid13: boolean; // instant win/loss mode
}

export interface RoundScore {
  roundNumber: number;
  dealer: PlayerId;
  dealerTeam: TeamId;
  dealerScoreBefore: number; // x: current score when dealer dealt
  bidder: PlayerId;
  bidderTeam: TeamId;
  bid: number;
  trump: Suit;
  tricksUs: number;
  tricksThem: number;
  bidderTricks: number;
  bidMade: boolean;
  dealerRetained: boolean; // true if dealer deals again; false if deal rotates clockwise
  nextDealer: PlayerId;
  nextDealerScore: number;
  outcomeType: 'dealer_made' | 'dealer_failed' | 'opponent_made' | 'opponent_failed';
  pointsUs: number;
  pointsThem: number;
  totalScoreUs: number;
  totalScoreThem: number;
  notes: string;
}

export interface GameSettings {
  speed: 'normal' | 'fast' | 'instant';
  soundEnabled: boolean;
  botCommentary: boolean;
  fourColorDeck: boolean;
}

export interface GameState {
  phase: GamePhase;
  roundNumber: number;
  dealer: PlayerId;
  currentTurn: PlayerId;
  players: Record<PlayerId, Player>;
  currentTrick: Trick;
  trickHistory: Trick[];
  contract: Contract | null;
  trumpSuit: Suit | null;
  biddingHistory: { playerId: PlayerId; bid: number | 'pass' }[];
  roundScores: RoundScore[];
  teamScores: Record<TeamId, number>;
  lastTrickWinner: PlayerId | null;
  message: string;
  chatBubbles: Record<PlayerId, string | null>;
  tramClaimedBy: PlayerId | null;
  matchWinner: TeamId | null;
}

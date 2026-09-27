import { Card, PlayedCard, PlayerId, Rank, SignalType, Suit, Trick } from './types';
import { determineTrickWinner, getPartner, getTeam, getValidPlays, isSameTeam, getNextValidBid } from './rules';
import { SUITS } from './deck';

/**
 * Evaluates the hand and generates a support signal: 'major', 'minor', or 'pass'.
 * Major suits: Spades and Hearts.
 * Minor suits: Clubs and Diamonds.
 */
export function generateSignal(hand: Card[]): SignalType {
  let majorPoints = 0;
  let minorPoints = 0;

  hand.forEach((card) => {
    let weight = 0;
    if (card.rank === 'A') weight = 4;
    else if (card.rank === 'K') weight = 3;
    else if (card.rank === 'Q') weight = 2;
    else if (card.rank === 'J') weight = 1;

    if (card.suit === 'spades' || card.suit === 'hearts') {
      majorPoints += weight;
    } else {
      minorPoints += weight;
    }
  });

  // Count distribution
  const spades = hand.filter((c) => c.suit === 'spades').length;
  const hearts = hand.filter((c) => c.suit === 'hearts').length;
  const diamonds = hand.filter((c) => c.suit === 'diamonds').length;
  const clubs = hand.filter((c) => c.suit === 'clubs').length;

  const majorLength = Math.max(spades, hearts);
  const minorLength = Math.max(diamonds, clubs);

  if (majorPoints >= 6 || (majorPoints >= 4 && majorLength >= 5)) {
    return 'major';
  }
  if (minorPoints >= 6 || (minorPoints >= 4 && minorLength >= 5)) {
    return 'minor';
  }
  return 'pass';
}

/**
 * Determines the best trump suit for the hand based on length and honors.
 */
export function chooseTrump(hand: Card[], partnerSignal: SignalType | null = null): Suit {
  const suitScores: Record<Suit, number> = {
    spades: 0,
    hearts: 0,
    diamonds: 0,
    clubs: 0,
  };

  SUITS.forEach((suit) => {
    const cards = hand.filter((c) => c.suit === suit);
    let score = cards.length * 3; // 3 points per card

    cards.forEach((c) => {
      if (c.rank === 'A') score += 4;
      else if (c.rank === 'K') score += 3;
      else if (c.rank === 'Q') score += 2;
      else if (c.rank === 'J') score += 1;
    });

    if (partnerSignal === 'major' && (suit === 'spades' || suit === 'hearts')) {
      score += 4;
    } else if (partnerSignal === 'minor' && (suit === 'diamonds' || suit === 'clubs')) {
      score += 4;
    }

    suitScores[suit] = score;
  });

  let bestSuit: Suit = 'spades';
  let maxScore = -1;

  for (const suit of SUITS) {
    if (suitScores[suit] > maxScore) {
      maxScore = suitScores[suit];
      bestSuit = suit;
    }
  }

  return bestSuit;
}

/**
 * Calculates estimated tricks for bidding.
 */
export function estimateTricks(
  hand: Card[],
  trumpSuit: Suit,
  partnerSignal: SignalType | null
): number {
  let tricks = 0;

  // 1. High card points in all suits
  const suitCards: Record<Suit, Card[]> = {
    spades: hand.filter((c) => c.suit === 'spades'),
    hearts: hand.filter((c) => c.suit === 'hearts'),
    diamonds: hand.filter((c) => c.suit === 'diamonds'),
    clubs: hand.filter((c) => c.suit === 'clubs'),
  };

  SUITS.forEach((suit) => {
    const cards = suitCards[suit];
    const hasAce = cards.some((c) => c.rank === 'A');
    const hasKing = cards.some((c) => c.rank === 'K');
    const hasQueen = cards.some((c) => c.rank === 'Q');

    if (hasAce) tricks += 1.0;
    if (hasKing && cards.length >= 2) tricks += 0.7;
    if (hasQueen && cards.length >= 3) tricks += 0.4;

    // Extra length tricks in trump suit
    if (suit === trumpSuit) {
      if (cards.length >= 5) {
        tricks += (cards.length - 4) * 0.8;
      }
    } else {
      // Short suit ruffing value if holding trumps
      if (suitCards[trumpSuit].length >= 3) {
        if (cards.length === 0) tricks += 1.2;
        else if (cards.length === 1) tricks += 0.6;
      }
    }
  });

  // Partner support signal bonus
  if (partnerSignal === 'major' && (trumpSuit === 'spades' || trumpSuit === 'hearts')) {
    tricks += 3.0;
  } else if (partnerSignal === 'minor' && (trumpSuit === 'diamonds' || trumpSuit === 'clubs')) {
    tricks += 3.0;
  } else if (partnerSignal) {
    tricks += 1.5;
  } else {
    tricks += 1.0; // Baseline partner expectation
  }

  return Math.min(13, Math.round(tricks));
}

/**
 * AI Bidding decision based on Surri ladder: 8, 10, 11, 12, 13
 * Note: Bid 8 is only present in availableBids for the opening bidder (next to dealer).
 * Returns an allowed number (8, 10, 11, 12, 13) or 'pass'.
 */
export function chooseBid(
  hand: Card[],
  partnerSignal: SignalType | null,
  currentHighestBid: number,
  availableBids: number[]
): number | 'pass' {
  if (availableBids.length === 0) {
    return 'pass';
  }

  const bestTrump = chooseTrump(hand, partnerSignal);
  const estimated = estimateTricks(hand, bestTrump, partnerSignal);

  // Slam 13 consideration if available
  if (estimated >= 13 && availableBids.includes(13) && Math.random() > 0.4) {
    return 13;
  }

  // Filter available bids that the hand can support
  const qualifyingBids = availableBids.filter((b) => estimated >= b);
  if (qualifyingBids.length > 0) {
    // If opening bidder has 10+ tricks, they can open at 10 or 8; otherwise take lowest qualifying bid
    if (availableBids.includes(8) && estimated >= 10 && Math.random() > 0.5) {
      return 10;
    }
    return qualifyingBids[0];
  }

  return 'pass';
}

/**
 * AI Card Play: Selects the best legal card to play from hand.
 */
export function chooseCardToPlay(
  hand: Card[],
  trick: Trick,
  trumpSuit: Suit | null,
  player: PlayerId
): Card {
  const validCards = getValidPlays(hand, trick.leadSuit);

  if (validCards.length === 1) {
    return validCards[0];
  }

  // 1. AI is LEADING the trick
  if (trick.cards.length === 0) {
    // Prefer cashing side Aces
    const sideAces = validCards.filter(
      (c) => c.rank === 'A' && (!trumpSuit || c.suit !== trumpSuit)
    );
    if (sideAces.length > 0) {
      return sideAces[0];
    }

    // Or lead high trump if holds dominant trump
    if (trumpSuit) {
      const trumps = validCards.filter((c) => c.suit === trumpSuit);
      const hasAce = trumps.some((c) => c.rank === 'A');
      if (hasAce && trumps.length >= 4) {
        return trumps.find((c) => c.rank === 'A')!;
      }
    }

    // Lead low from longest suit
    const suitCounts: Record<Suit, Card[]> = {
      spades: validCards.filter((c) => c.suit === 'spades'),
      hearts: validCards.filter((c) => c.suit === 'hearts'),
      diamonds: validCards.filter((c) => c.suit === 'diamonds'),
      clubs: validCards.filter((c) => c.suit === 'clubs'),
    };

    let bestSuitCards: Card[] = validCards;
    let maxLen = -1;
    for (const suit of SUITS) {
      if (suitCounts[suit].length > maxLen) {
        maxLen = suitCounts[suit].length;
        bestSuitCards = suitCounts[suit];
      }
    }

    // Play lowest from this suit
    return bestSuitCards.sort((a, b) => a.value - b.value)[0];
  }

  // 2. AI is FOLLOWING the trick
  const { winner: currentWinner, winningCard: currentWinningCard } = determineTrickWinner(
    trick.cards,
    trumpSuit
  );
  const partnerWins = isSameTeam(player, currentWinner);

  // If partner is currently winning the trick:
  if (partnerWins) {
    // Discard lowest valid card (slough or cheap follow)
    return [...validCards].sort((a, b) => a.value - b.value)[0];
  }

  // Opponent is winning the trick:
  // Find cards that can beat the current winning card
  const winningPlays = validCards.filter((card) => {
    const simulatedTrick: PlayedCard[] = [...trick.cards, { playerId: player, card }];
    const res = determineTrickWinner(simulatedTrick, trumpSuit);
    return res.winner === player;
  });

  if (winningPlays.length > 0) {
    // Play the lowest winning card (don't waste an Ace if Queen beats it)
    return [...winningPlays].sort((a, b) => a.value - b.value)[0];
  }

  // Cannot win the trick: throw away the lowest useless card
  // Prefer throwing off-suit non-trump lowest card
  const nonTrumps = validCards.filter((c) => !trumpSuit || c.suit !== trumpSuit);
  if (nonTrumps.length > 0) {
    return [...nonTrumps].sort((a, b) => a.value - b.value)[0];
  }

  return [...validCards].sort((a, b) => a.value - b.value)[0];
}

/**
 * Generate friendly chat lines for bots during bidding/plays.
 */
export function getBotChat(event: 'bid_pass' | 'bid_made' | 'bid_13' | 'tram' | 'signal_major' | 'signal_minor' | 'signal_pass'): string {
  const dialogues: Record<string, string[]> = {
    bid_pass: ['Passing this one.', 'Cards are looking dry, pass!', 'Pass.'],
    bid_made: ['I will take this!', 'Deal me in!', 'Strong cards here!'],
    bid_13: ['Surri slam call! 13 tricks or bust!', 'Calling the full 13! All in!'],
    tram: ['The Rest Are Mine! TRAM!', 'No need to play out, all winners here!'],
    signal_major: ['Major strength ready, partner!', 'Heavy in Spades/Hearts!'],
    signal_minor: ['Got minor backup for you!', 'Clubs/Diamonds ready.'],
    signal_pass: ['Quiet hand, be careful.', 'Low support here.'],
  };
  const list = dialogues[event] || ['...'];
  return list[Math.floor(Math.random() * list.length)];
}

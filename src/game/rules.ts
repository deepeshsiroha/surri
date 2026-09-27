import { Card, PlayedCard, PlayerId, Suit, TeamId } from './types';

export const PLAYER_ORDER: PlayerId[] = ['south', 'west', 'north', 'east'];

export const SURRI_BIDS = [8, 10, 11, 12, 13] as const;

/**
 * Determines whether bid 8 is available to a player.
 * In Surri, bid 8 is strictly exclusive to the opening bidder (the player immediately next to the dealer),
 * and can only be called on the opening bid (when no prior bid or pass has occurred).
 * All players after the opening bidder can only bid strictly above 8 (minimum 10).
 */
export function isBid8Allowed(
  playerId: PlayerId,
  dealer: PlayerId,
  biddingHistoryLength: number
): boolean {
  const openingBidder = getNextPlayer(dealer);
  return playerId === openingBidder && biddingHistoryLength === 0;
}

/**
 * Returns the list of valid bids available to a player during their turn.
 * - Bid 8 is ONLY allowed for the opening bidder on the initial call.
 * - For all other players / situations, only bids strictly greater than 8 (and > currentHighestBid) are allowed.
 */
export function getAvailableBids(
  playerId: PlayerId,
  dealer: PlayerId,
  currentHighestBid: number,
  biddingHistoryLength: number
): number[] {
  const canBid8 = isBid8Allowed(playerId, dealer, biddingHistoryLength);

  return SURRI_BIDS.filter((bid) => {
    if (bid === 8) {
      return canBid8 && currentHighestBid === 0;
    }
    return bid > currentHighestBid;
  });
}

export function getNextValidBid(currentHighestBid: number): number | null {
  for (const bid of SURRI_BIDS) {
    if (bid > currentHighestBid) {
      return bid;
    }
  }
  return null;
}

export function getNextValidBidForPlayer(
  playerId: PlayerId,
  dealer: PlayerId,
  currentHighestBid: number,
  biddingHistoryLength: number
): number | null {
  const available = getAvailableBids(playerId, dealer, currentHighestBid, biddingHistoryLength);
  return available.length > 0 ? available[0] : null;
}

export function getNextPlayer(current: PlayerId): PlayerId {
  const idx = PLAYER_ORDER.indexOf(current);
  return PLAYER_ORDER[(idx + 1) % 4];
}

export function getPartner(player: PlayerId): PlayerId {
  switch (player) {
    case 'south':
      return 'north';
    case 'north':
      return 'south';
    case 'west':
      return 'east';
    case 'east':
      return 'west';
  }
}

export function getTeam(player: PlayerId): TeamId {
  return player === 'south' || player === 'north' ? 'us' : 'them';
}

export function isSameTeam(p1: PlayerId, p2: PlayerId): boolean {
  return getTeam(p1) === getTeam(p2);
}

/**
 * Returns cards from the hand that are legally playable for this trick.
 */
export function getValidPlays(hand: Card[], leadSuit: Suit | null): Card[] {
  if (hand.length === 0) return [];
  if (!leadSuit) return hand; // First player can lead anything

  const matchingSuitCards = hand.filter((c) => c.suit === leadSuit);
  if (matchingSuitCards.length > 0) {
    return matchingSuitCards; // Must follow suit
  }

  // Void in lead suit: can play any card (trump or discard)
  return hand;
}

/**
 * Evaluates the winner of a completed 4-card trick.
 */
export function determineTrickWinner(
  playedCards: PlayedCard[],
  trumpSuit: Suit | null
): { winner: PlayerId; winningCard: Card } {
  if (playedCards.length === 0) {
    throw new Error('Trick has no cards');
  }

  const leadCard = playedCards[0].card;
  const leadSuit = leadCard.suit;

  let winningCard = leadCard;
  let winner = playedCards[0].playerId;

  for (let i = 1; i < playedCards.length; i++) {
    const candidate = playedCards[i].card;
    const candidatePlayer = playedCards[i].playerId;

    const winningIsTrump = trumpSuit && winningCard.suit === trumpSuit;
    const candidateIsTrump = trumpSuit && candidate.suit === trumpSuit;

    if (candidateIsTrump) {
      if (!winningIsTrump || candidate.value > winningCard.value) {
        winningCard = candidate;
        winner = candidatePlayer;
      }
    } else if (!winningIsTrump) {
      if (candidate.suit === leadSuit && candidate.value > winningCard.value) {
        winningCard = candidate;
        winner = candidatePlayer;
      }
    }
  }

  return { winner, winningCard };
}

/**
 * Evaluates whether a player's remaining cards are mathematically guaranteed to win
 * all remaining tricks (TRAM: The Rest Are Mine).
 */
export function canClaimTRAM(
  claimantHand: Card[],
  allRemainingCards: Record<PlayerId, Card[]>,
  claimant: PlayerId,
  trumpSuit: Suit | null
): { valid: boolean; reason: string } {
  if (claimantHand.length === 0) {
    return { valid: false, reason: 'No cards left in hand' };
  }

  // Get opponent hands
  const opponentCards: Card[] = [];
  PLAYER_ORDER.forEach((p) => {
    if (!isSameTeam(claimant, p)) {
      opponentCards.push(...allRemainingCards[p]);
    }
  });

  if (opponentCards.length === 0) {
    return { valid: true, reason: 'All opponents have exhausted their cards' };
  }

  // Separate trump and non-trump
  const claimantTrumps = trumpSuit ? claimantHand.filter((c) => c.suit === trumpSuit) : [];
  const opponentTrumps = trumpSuit ? opponentCards.filter((c) => c.suit === trumpSuit) : [];

  // 1. If opponents have any trumps higher than claimant's highest trump, TRAM fails
  if (opponentTrumps.length > 0) {
    const highestClaimantTrump = Math.max(...claimantTrumps.map((c) => c.value), -1);
    const highestOpponentTrump = Math.max(...opponentTrumps.map((c) => c.value));
    if (highestOpponentTrump > highestClaimantTrump) {
      return {
        valid: false,
        reason: 'Opponents still hold a higher trump card that could beat you',
      };
    }

    // Also, if opponents have more trumps than claimant, they might ruff later off-suit cards
    if (opponentTrumps.length > claimantTrumps.length) {
      return {
        valid: false,
        reason: 'Opponents have more trumps remaining than you do',
      };
    }
  }

  // 2. If claimant still has off-suit cards, check if opponents have higher cards in those suits
  // or if opponent trumps can ruff them.
  // Group cards by suit
  const suits: Suit[] = ['spades', 'hearts', 'diamonds', 'clubs'];
  for (const suit of suits) {
    if (suit === trumpSuit) continue;

    const claimantSuitCards = claimantHand.filter((c) => c.suit === suit);
    const opponentSuitCards = opponentCards.filter((c) => c.suit === suit);

    if (claimantSuitCards.length > 0) {
      // Check if opponents hold higher rank in this suit
      const highestOpponentCard = opponentSuitCards.length > 0
        ? Math.max(...opponentSuitCards.map((c) => c.value))
        : 0;

      for (const card of claimantSuitCards) {
        if (card.value < highestOpponentCard) {
          return {
            valid: false,
            reason: `Opponents hold higher ${suit.toUpperCase()} than your ${card.rank}`,
          };
        }
      }
    }
  }

  return {
    valid: true,
    reason: 'All remaining cards are dominant master cards! The Rest Are Mine!',
  };
}

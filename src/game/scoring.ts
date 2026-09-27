import { Contract, PlayerId, RoundScore, TeamId } from './types';
import { getNextPlayer, getTeam } from './rules';

export const KNOCKOUT_THRESHOLD = 52;

export interface ScoringResult {
  bidderTeam: TeamId;
  dealerTeam: TeamId;
  bidMade: boolean;
  dealerRetained: boolean;
  nextDealer: PlayerId;
  nextDealerScore: number;
  outcomeType: 'dealer_made' | 'dealer_failed' | 'opponent_made' | 'opponent_failed';
  pointsAddedUs: number;
  pointsAddedThem: number;
  newTotalScoreUs: number;
  newTotalScoreThem: number;
  notes: string;
  isMatchOver: boolean;
  matchWinner: TeamId | null;
}

/**
 * Calculates round outcome and score handoff under authentic Surri rules:
 * 1. Dealer starts at 0 in the initial match.
 * 2. If the dealer bids n and makes it: next player clockwise deals at n - x.
 * 3. If the dealer bids n and fails: same dealer deals again at 2n (current score + 2n).
 * 4. If the non-dealing team bids n and makes it: dealer deals at current score + n.
 * 5. If the non-dealing team bids n and loses: dealer deals at current score - 2n.
 * 6. Match victory occurs when the opposing team crosses 52 points (> 52).
 */
export function calculateRoundScore(
  roundNumber: number,
  dealer: PlayerId,
  contract: Contract,
  tricksUs: number,
  tricksThem: number,
  currentScoreUs: number,
  currentScoreThem: number
): {
  roundScore: RoundScore;
  result: ScoringResult;
} {
  const dealerTeam = getTeam(dealer);
  const bidderTeam = contract.team;
  const isDealerTeamBid = bidderTeam === dealerTeam;

  // x represents the current score of the dealer's team when dealing
  const x = dealerTeam === 'us' ? currentScoreUs : currentScoreThem;
  const n = contract.bid;
  const bidderTricks = bidderTeam === 'us' ? tricksUs : tricksThem;
  const bidMade = bidderTricks >= n;

  let dealerRetained = true;
  let nextDealer: PlayerId = dealer;
  let nextDealerScore = x;
  let outcomeType: 'dealer_made' | 'dealer_failed' | 'opponent_made' | 'opponent_failed';

  let newTotalScoreUs = currentScoreUs;
  let newTotalScoreThem = currentScoreThem;
  let notes = '';
  let instantWinner: TeamId | null = null;

  // Handle Bid 13 Slam instant win/loss
  if (contract.isBid13) {
    if (bidderTricks === 13) {
      instantWinner = bidderTeam;
      notes = `Bid 13 Slam succeeded! Instant victory (+13) for ${
        bidderTeam === 'us' ? 'Team US' : 'Team THEM'
      }!`;
    } else {
      instantWinner = bidderTeam === 'us' ? 'them' : 'us';
      notes = `Bid 13 Slam failed (${bidderTricks}/13 tricks)! Instant defeat for ${
        bidderTeam === 'us' ? 'Team US' : 'Team THEM'
      }!`;
    }
  }

  if (isDealerTeamBid) {
    if (bidMade) {
      // Rule 4: Dealer deals at x and makes n -> next player clockwise deals at n - x
      outcomeType = 'dealer_made';
      dealerRetained = false;
      nextDealer = getNextPlayer(dealer);
      nextDealerScore = n - x;

      // The next dealer's team deals at n - x
      const nextDealerTeam = getTeam(nextDealer);
      if (nextDealerTeam === 'us') {
        newTotalScoreUs = n - x;
      } else {
        newTotalScoreThem = n - x;
      }

      notes = `Dealer (${
        dealerTeam === 'us' ? 'Team US' : 'Team THEM'
      }) made bid ${n} while dealing at ${x}! Deal passes clockwise to ${nextDealer} dealing at ${n - x} (${n} - ${x})!`;
    } else {
      // Rule 2: Dealer bids n and fails -> same dealer deals at 2n (x + 2n)
      outcomeType = 'dealer_failed';
      dealerRetained = true;
      nextDealer = dealer;
      nextDealerScore = x + 2 * n;

      if (dealerTeam === 'us') {
        newTotalScoreUs = x + 2 * n;
      } else {
        newTotalScoreThem = x + 2 * n;
      }

      const deficit = n - bidderTricks;
      notes = `Dealer (${
        dealerTeam === 'us' ? 'Team US' : 'Team THEM'
      }) failed bid ${n} (${bidderTricks}/${n} tricks, short by ${deficit})! Same dealer deals again at ${nextDealerScore} (${x} + ${2 * n})!`;
    }
  } else {
    // Non-dealing team placed the winning bid
    if (bidMade) {
      // Rule 3A: Non-dealing team wins bid of n and makes it -> dealer deals at current score + n
      outcomeType = 'opponent_made';
      dealerRetained = true;
      nextDealer = dealer;
      nextDealerScore = x + n;

      if (dealerTeam === 'us') {
        newTotalScoreUs = x + n;
      } else {
        newTotalScoreThem = x + n;
      }

      notes = `Opponents (${
        bidderTeam === 'us' ? 'Team US' : 'Team THEM'
      }) made bid ${n}! Dealer deals again at ${nextDealerScore} (${x} + ${n})!`;
    } else {
      // Rule 3B: Non-dealing team loses -> dealer deals at current score - 2n
      outcomeType = 'opponent_failed';
      dealerRetained = true;
      nextDealer = dealer;
      nextDealerScore = x - 2 * n;

      if (dealerTeam === 'us') {
        newTotalScoreUs = x - 2 * n;
      } else {
        newTotalScoreThem = x - 2 * n;
      }

      notes = `Opponents (${
        bidderTeam === 'us' ? 'Team US' : 'Team THEM'
      }) failed bid ${n}! Dealer deals again at ${nextDealerScore} (${x} - ${2 * n})!`;
    }
  }

  const pointsAddedUs = newTotalScoreUs - currentScoreUs;
  const pointsAddedThem = newTotalScoreThem - currentScoreThem;

  // Rule 5: The player wins when the opposite team crosses 52 (> 52)
  let isMatchOver = instantWinner !== null;
  let matchWinner: TeamId | null = instantWinner;

  if (!isMatchOver) {
    if (newTotalScoreThem > KNOCKOUT_THRESHOLD && newTotalScoreUs <= KNOCKOUT_THRESHOLD) {
      isMatchOver = true;
      matchWinner = 'us'; // Opponents crossed 52 -> Team US wins!
    } else if (newTotalScoreUs > KNOCKOUT_THRESHOLD && newTotalScoreThem <= KNOCKOUT_THRESHOLD) {
      isMatchOver = true;
      matchWinner = 'them'; // Team US crossed 52 -> Opponents win!
    } else if (newTotalScoreUs > KNOCKOUT_THRESHOLD && newTotalScoreThem > KNOCKOUT_THRESHOLD) {
      // Both crossed 52: the team with fewer points wins (closest to survival)
      isMatchOver = true;
      matchWinner = newTotalScoreUs < newTotalScoreThem ? 'us' : 'them';
    }
  }

  const roundScore: RoundScore = {
    roundNumber,
    dealer,
    dealerTeam,
    dealerScoreBefore: x,
    bidder: contract.bidder,
    bidderTeam,
    bid: n,
    trump: contract.trump!,
    tricksUs,
    tricksThem,
    bidderTricks,
    bidMade,
    dealerRetained,
    nextDealer,
    nextDealerScore,
    outcomeType,
    pointsUs: pointsAddedUs,
    pointsThem: pointsAddedThem,
    totalScoreUs: newTotalScoreUs,
    totalScoreThem: newTotalScoreThem,
    notes,
  };

  const result: ScoringResult = {
    bidderTeam,
    dealerTeam,
    bidMade,
    dealerRetained,
    nextDealer,
    nextDealerScore,
    outcomeType,
    pointsAddedUs,
    pointsAddedThem,
    newTotalScoreUs,
    newTotalScoreThem,
    notes,
    isMatchOver,
    matchWinner,
  };

  return { roundScore, result };
}

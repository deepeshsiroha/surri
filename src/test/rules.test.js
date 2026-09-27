import assert from 'node:assert';
import {
  determineTrickWinner,
  getValidPlays,
  canClaimTRAM,
  getNextPlayer,
  getPartner,
  getTeam,
  SURRI_BIDS,
  getNextValidBid,
  isBid8Allowed,
  getAvailableBids,
  getNextValidBidForPlayer,
} from '../game/rules.js';
import { calculateRoundScore, KNOCKOUT_THRESHOLD } from '../game/scoring.js';
import { createDeck, dealDeck, sortHand } from '../game/deck.js';
import { chooseTrump, estimateTricks } from '../game/ai.js';

console.log('--- Running Surri Game Engine Tests ---');

// 1. Test Deck & Dealing
{
  const deck = createDeck();
  assert.strictEqual(deck.length, 52, 'Deck must contain 52 cards');

  const hands = dealDeck();
  assert.strictEqual(hands.south.length, 13, 'South must have 13 cards');
  assert.strictEqual(hands.west.length, 13, 'West must have 13 cards');
  assert.strictEqual(hands.north.length, 13, 'North must have 13 cards');
  assert.strictEqual(hands.east.length, 13, 'East must have 13 cards');
  console.log('✓ Deck creation and 13-card deal to 4 players passed');
}

// 2. Test Rules: Following Suit
{
  const hand = [
    { id: 'S-A', suit: 'spades', rank: 'A', value: 14 },
    { id: 'S-10', suit: 'spades', rank: '10', value: 10 },
    { id: 'H-K', suit: 'hearts', rank: 'K', value: 13 },
  ];

  // When Spades led, must follow with Spades
  const validSpades = getValidPlays(hand, 'spades');
  assert.strictEqual(validSpades.length, 2, 'Should only return Spades when Spades led');
  assert(validSpades.every(c => c.suit === 'spades'));

  // When Clubs led (void), can play any card
  const validClubs = getValidPlays(hand, 'clubs');
  assert.strictEqual(validClubs.length, 3, 'When void in suit led, can play any card');
  console.log('✓ Follow suit and void sloughing rules passed');
}

// 3. Test Rules: Trick Winner Resolution
{
  // Non-trump trick: Highest card of lead suit wins
  const trick1 = [
    { playerId: 'south', card: { id: 'H-10', suit: 'hearts', rank: '10', value: 10 } },
    { playerId: 'west', card: { id: 'H-K', suit: 'hearts', rank: 'K', value: 13 } },
    { playerId: 'north', card: { id: 'H-A', suit: 'hearts', rank: 'A', value: 14 } },
    { playerId: 'east', card: { id: 'H-2', suit: 'hearts', rank: '2', value: 2 } },
  ];
  const win1 = determineTrickWinner(trick1, 'spades');
  assert.strictEqual(win1.winner, 'north', 'North Ace of Hearts should win non-trump trick');

  // Trump cut: Trump card beats lead suit
  const trick2 = [
    { playerId: 'south', card: { id: 'H-A', suit: 'hearts', rank: 'A', value: 14 } },
    { playerId: 'west', card: { id: 'S-2', suit: 'spades', rank: '2', value: 2 } }, // Trump cut!
    { playerId: 'north', card: { id: 'H-5', suit: 'hearts', rank: '5', value: 5 } },
    { playerId: 'east', card: { id: 'H-9', suit: 'hearts', rank: '9', value: 9 } },
  ];
  const win2 = determineTrickWinner(trick2, 'spades');
  assert.strictEqual(win2.winner, 'west', 'West 2 of Spades (trump) should beat Ace of Hearts');

  // Higher trump overtrump
  const trick3 = [
    { playerId: 'south', card: { id: 'H-A', suit: 'hearts', rank: 'A', value: 14 } },
    { playerId: 'west', card: { id: 'S-2', suit: 'spades', rank: '2', value: 2 } },
    { playerId: 'north', card: { id: 'S-K', suit: 'spades', rank: 'K', value: 13 } }, // Higher trump!
    { playerId: 'east', card: { id: 'H-9', suit: 'hearts', rank: '9', value: 9 } },
  ];
  const win3 = determineTrickWinner(trick3, 'spades');
  assert.strictEqual(win3.winner, 'north', 'North King of Spades should overtrump 2 of Spades');
  console.log('✓ Trick evaluation (lead suit, trump cuts, overtrumps) passed');
}

// 4. Test TRAM (The Rest Are Mine) Validation
{
  const claimantHand = [
    { id: 'S-A', suit: 'spades', rank: 'A', value: 14 },
    { id: 'S-K', suit: 'spades', rank: 'K', value: 13 },
  ];

  // Opponents hold lower cards
  const allHandsValid = {
    south: claimantHand,
    west: [{ id: 'S-3', suit: 'spades', rank: '3', value: 3 }, { id: 'H-4', suit: 'hearts', rank: '4', value: 4 }],
    north: [{ id: 'C-2', suit: 'clubs', rank: '2', value: 2 }, { id: 'D-2', suit: 'diamonds', rank: '2', value: 2 }],
    east: [{ id: 'S-4', suit: 'spades', rank: '4', value: 4 }, { id: 'H-5', suit: 'hearts', rank: '5', value: 5 }],
  };

  const tramResultValid = canClaimTRAM(claimantHand, allHandsValid, 'south', 'spades');
  assert.strictEqual(tramResultValid.valid, true, 'Holding top trumps should allow TRAM');

  // Opponent holds higher trump
  const claimantHandBeatable = [
    { id: 'S-Q', suit: 'spades', rank: 'Q', value: 12 },
  ];
  const allHandsInvalid = {
    south: claimantHandBeatable,
    west: [{ id: 'S-A', suit: 'spades', rank: 'A', value: 14 }], // Opponent has Ace
    north: [],
    east: [],
  };
  const tramResultInvalid = canClaimTRAM(claimantHandBeatable, allHandsInvalid, 'south', 'spades');
  assert.strictEqual(tramResultInvalid.valid, false, 'Opponent holding higher card must prevent TRAM');
  console.log('✓ TRAM validation (valid master claims vs beatable claims) passed');
}

// 5. Test Authentic Surri Dealing-Handoff & 52-Point Knockout Engine
{
  // Rule 1 & 4: Dealer South deals at x = 0, bids n = 10 and makes it
  // -> Deal rotates clockwise to West, who deals at n - x = 10 - 0 = 10
  const contractDealerMake = {
    bidder: 'south',
    partner: 'north',
    bid: 10,
    trump: 'hearts',
    team: 'us',
    isDummyActive: true,
    isBid13: false,
  };

  const score1 = calculateRoundScore(
    1,
    'south', // Dealer South (Team US)
    contractDealerMake,
    10, // US won 10 tricks
    3,  // THEM won 3 tricks
    0,  // current score US (x = 0)
    0   // current score THEM
  );

  assert.strictEqual(score1.result.bidMade, true, 'Dealer bid 10 with 10 tricks is made');
  assert.strictEqual(score1.result.outcomeType, 'dealer_made');
  assert.strictEqual(score1.result.dealerRetained, false, 'Dealer should rotate clockwise when dealer makes bid');
  assert.strictEqual(score1.result.nextDealer, 'west', 'Deal passes clockwise to West');
  assert.strictEqual(score1.result.nextDealerScore, 10, 'Next dealer deals at n - x = 10 - 0 = 10');
  assert.strictEqual(score1.result.newTotalScoreThem, 10, 'Team THEM new score set to 10');
  assert.strictEqual(score1.result.isMatchOver, false);

  // Rule 2: Dealer South deals at x = 0, bids n = 10 and fails (wins 8 tricks)
  // -> Same dealer South deals again at 2n = 20 (x + 2n)
  const score2 = calculateRoundScore(
    1,
    'south',
    contractDealerMake,
    8,  // US won 8 tricks (failed!)
    5,  // THEM won 5 tricks
    0,  // current score US (x = 0)
    0   // current score THEM
  );

  assert.strictEqual(score2.result.bidMade, false, 'Dealer bid 10 with 8 tricks failed');
  assert.strictEqual(score2.result.outcomeType, 'dealer_failed');
  assert.strictEqual(score2.result.dealerRetained, true, 'Dealer is retained when dealer fails');
  assert.strictEqual(score2.result.nextDealer, 'south', 'Same dealer deals again');
  assert.strictEqual(score2.result.nextDealerScore, 20, 'Dealer deals again at 2n = 20');
  assert.strictEqual(score2.result.newTotalScoreUs, 20, 'Team US score becomes 20');
  assert.strictEqual(score2.result.isMatchOver, false);

  // Rule 3A: Dealer South at x = 10, Opponents (THEM) bid n = 10 and make it
  // -> Dealer South deals again at current score + n = 10 + 10 = 20
  const contractOpponentMake = {
    bidder: 'west',
    partner: 'east',
    bid: 10,
    trump: 'spades',
    team: 'them',
    isDummyActive: true,
    isBid13: false,
  };

  const score3A = calculateRoundScore(
    2,
    'south', // Dealer South (Team US, x = 10)
    contractOpponentMake,
    3,  // US won 3 tricks
    10, // THEM won 10 tricks (bid made!)
    10, // current score US (x = 10)
    10  // current score THEM
  );

  assert.strictEqual(score3A.result.bidMade, true, 'Opponent bid 10 with 10 tricks is made');
  assert.strictEqual(score3A.result.outcomeType, 'opponent_made');
  assert.strictEqual(score3A.result.dealerRetained, true, 'Dealer is retained when opponents bid');
  assert.strictEqual(score3A.result.nextDealer, 'south', 'Dealer South retained');
  assert.strictEqual(score3A.result.nextDealerScore, 20, 'Dealer deals at current score + n = 10 + 10 = 20');
  assert.strictEqual(score3A.result.newTotalScoreUs, 20, 'Team US score becomes 20');

  // Rule 3B: Dealer South at x = 20, Opponents (THEM) bid n = 10 and fail (win 7 tricks)
  // -> Dealer South deals again at current score - 2n = 20 - 20 = 0
  const score3B = calculateRoundScore(
    3,
    'south', // Dealer South (Team US, x = 20)
    contractOpponentMake,
    6,  // US won 6 tricks
    7,  // THEM won 7 tricks (bid 10, failed!)
    20, // current score US (x = 20)
    10  // current score THEM
  );

  assert.strictEqual(score3B.result.bidMade, false, 'Opponent bid 10 with 7 tricks failed');
  assert.strictEqual(score3B.result.outcomeType, 'opponent_failed');
  assert.strictEqual(score3B.result.dealerRetained, true, 'Dealer is retained when opponents fail');
  assert.strictEqual(score3B.result.nextDealer, 'south', 'Dealer South retained');
  assert.strictEqual(score3B.result.nextDealerScore, 0, 'Dealer deals at current score - 2n = 20 - 20 = 0');
  assert.strictEqual(score3B.result.newTotalScoreUs, 0, 'Team US score drops to 0');

  // Rule 5: 52-Point Knockout Victory
  // When opposing team score crosses 52 (> 52), the other team wins!
  const contractThemFail = {
    bidder: 'west',
    partner: 'east',
    bid: 10,
    trump: 'spades',
    team: 'them',
    isDummyActive: true,
    isBid13: false,
  };

  const scoreKnockout = calculateRoundScore(
    4,
    'west', // West deals at x = 40 (Team THEM)
    contractThemFail,
    5,  // US won 5 tricks
    8,  // THEM won 8 tricks (bid 10, failed!)
    10, // US score = 10
    40  // THEM score = 40. Dealer West fails bid 10 -> THEM deals at 40 + 20 = 60 (> 52)!
  );

  assert.strictEqual(scoreKnockout.result.newTotalScoreThem, 60, 'Team THEM score reaches 60');
  assert.strictEqual(scoreKnockout.result.isMatchOver, true, 'Crossing 52 threshold ends the match');
  assert.strictEqual(scoreKnockout.result.matchWinner, 'us', 'Team US wins because opponents crossed 52 points');

  // Rule 5B: Slam 13 Instant Win/Loss
  const contract13 = {
    bidder: 'south',
    partner: 'north',
    bid: 13,
    trump: 'spades',
    team: 'us',
    isDummyActive: true,
    isBid13: true,
  };

  const score13Win = calculateRoundScore(5, 'south', contract13, 13, 0, 10, 20);
  assert.strictEqual(score13Win.result.isMatchOver, true);
  assert.strictEqual(score13Win.result.matchWinner, 'us', 'Bid 13 with 13 tricks must trigger instant victory');

  const score13Fail = calculateRoundScore(5, 'south', contract13, 12, 1, 10, 20);
  assert.strictEqual(score13Fail.result.isMatchOver, true);
  assert.strictEqual(score13Fail.result.matchWinner, 'them', 'Bid 13 with <13 tricks must trigger instant defeat');

  console.log('✓ Authentic Surri dealing handoff (clockwise at n-x, 2n, x+n, x-2n) and 52-pt knockout passed');
}

// 6. Test Surri Bidding Ladder: 8, 10, 11, 12, 13 and Opening-Only 8 Rule
{
  assert.deepStrictEqual(Array.from(SURRI_BIDS), [8, 10, 11, 12, 13]);
  assert.strictEqual(getNextValidBid(0), 8, 'Opening bid starts at 8');
  assert.strictEqual(getNextValidBid(8), 10, 'After 8, next valid bid must be 10 (9 is skipped)');
  assert.strictEqual(getNextValidBid(10), 11, 'After 10, next is 11');
  assert.strictEqual(getNextValidBid(11), 12, 'After 11, next is 12');
  assert.strictEqual(getNextValidBid(12), 13, 'After 12, next is 13');
  assert.strictEqual(getNextValidBid(13), null, 'After 13, no higher bid exists');

  // Scenario: South is dealer
  const dealer = 'south';
  const openingBidder = getNextPlayer(dealer); // 'west'

  // Opening bidder (West) on move 0 CAN bid 8
  assert.strictEqual(isBid8Allowed(openingBidder, dealer, 0), true, 'West (next to dealer) can bid 8 on opening move');
  assert.deepStrictEqual(
    getAvailableBids(openingBidder, dealer, 0, 0),
    [8, 10, 11, 12, 13],
    'West has 8 available when no bids yet'
  );

  // If West passes (move 1), North (player 2) CANNOT bid 8 even though highestBid is 0!
  assert.strictEqual(isBid8Allowed('north', dealer, 1), false, 'North cannot bid 8');
  assert.deepStrictEqual(
    getAvailableBids('north', dealer, 0, 1),
    [10, 11, 12, 13],
    'North can only bid above 8 (10, 11, 12, 13)'
  );

  // East (player 3) also CANNOT bid 8
  assert.strictEqual(isBid8Allowed('east', dealer, 2), false, 'East cannot bid 8');
  assert.deepStrictEqual(
    getAvailableBids('east', dealer, 0, 2),
    [10, 11, 12, 13],
    'East can only bid above 8 (10, 11, 12, 13)'
  );

  // South (dealer) also CANNOT bid 8!
  assert.strictEqual(isBid8Allowed('south', dealer, 3), false, 'Dealer (South) cannot bid 8');
  assert.deepStrictEqual(
    getAvailableBids('south', dealer, 0, 3),
    [10, 11, 12, 13],
    'Dealer (South) can only bid above 8 (10, 11, 12, 13)'
  );

  // If West had bid 8, next bids for North must be > 8
  assert.deepStrictEqual(
    getAvailableBids('north', dealer, 8, 1),
    [10, 11, 12, 13],
    'After bid 8, next player can only bid > 8 (10, 11, 12, 13)'
  );

  // If North raised to 10, next bids must be > 10
  assert.deepStrictEqual(
    getAvailableBids('east', dealer, 10, 2),
    [11, 12, 13],
    'After bid 10, next player can only bid > 10 (11, 12, 13)'
  );

  console.log('✓ Surri bidding ladder & exclusive opening-bid-8 rule passed');
}

console.log('--- ALL GAME TESTS PASSED SUCCESSFULLY! ---');

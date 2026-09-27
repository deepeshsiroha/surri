import React from 'react';
import { GamePhase, PlayerId, SignalType, Suit } from '../game/types';
import { SUIT_SYMBOLS } from '../game/deck';
import { Gavel, Crown, Sparkles, MessageSquare, Flame } from 'lucide-react';
import { getAvailableBids, getNextPlayer, SURRI_BIDS } from '../game/rules';

interface InlineControlsProps {
  phase: GamePhase;
  currentTurn: PlayerId;
  dealer: PlayerId;
  highestBid: number;
  highestBidder: PlayerId | null;
  consecutivePasses: number;
  biddingHistoryLength: number;
  onPlaceBid: (bid: number) => void;
  onPass: () => void;
  onSelectTrump: (suit: Suit) => void;
}

export const InlineControls: React.FC<InlineControlsProps> = ({
  phase,
  currentTurn,
  dealer,
  highestBid,
  highestBidder,
  consecutivePasses,
  biddingHistoryLength,
  onPlaceBid,
  onPass,
  onSelectTrump,
}) => {
  // Only show when it's South's turn to make a decision
  const isSouthTurn = currentTurn === 'south';

  if (phase === 'BIDDING' && isSouthTurn) {
    const openingBidder = getNextPlayer(dealer);
    const isOpeningBidder = currentTurn === openingBidder && biddingHistoryLength === 0;
    const availableBids = getAvailableBids('south', dealer, highestBid, biddingHistoryLength);
    const bids = SURRI_BIDS;

    return (
      <div className="bg-slate-950/90 backdrop-blur-md border border-gold-500/70 rounded-2xl p-2.5 sm:p-3 shadow-2xl animate-fade-in flex flex-col items-center gap-2 max-w-lg mx-auto">
        <div className="flex items-center justify-between w-full text-xs px-1">
          <div className="flex items-center gap-1.5 text-gold-300 font-semibold">
            <Gavel className="w-3.5 h-3.5 text-gold-400" />
            <span>Pre-Bid / Call (8, 10, 11, 12, 13):</span>
          </div>

          <div className="text-[11px] text-slate-300">
            {highestBid > 0 ? (
              <span>
                Current High: <strong className="text-gold-300">{highestBid}</strong> by{' '}
                <strong
                  className={
                    highestBidder === 'south' || highestBidder === 'north'
                      ? 'text-emerald-400'
                      : 'text-rose-400'
                  }
                >
                  {highestBidder === 'south' || highestBidder === 'north'
                    ? 'Team US'
                    : 'Team THEM'}
                </strong>
              </span>
            ) : isOpeningBidder ? (
              <span className="text-emerald-400 font-semibold">
                Opening Bid: Call 8, 10, 11, 12, or 13
              </span>
            ) : (
              <span className="text-amber-300 font-medium">
                Only opening bidder can call 8 (Must call 10+)
              </span>
            )}
          </div>
        </div>

        {/* 1-Tap Horizontal Bidding Buttons: 8, 10, 11, 12, 13 */}
        <div className="flex items-start gap-1.5 w-full">
          {bids.map((bid) => {
            const isSelectable = availableBids.includes(bid);
            const is13 = bid === 13;
            const is8 = bid === 8;
            const is8Blocked = is8 && !isSelectable && highestBid === 0;

            return (
              <div key={bid} className="flex-1 flex flex-col items-center">
                <button
                  disabled={!isSelectable}
                  onClick={() => onPlaceBid(bid)}
                  title={
                    is8Blocked
                      ? 'Only the opening bidder (next to dealer) can call 8'
                      : isSelectable
                      ? `Bid ${bid}`
                      : `Must bid higher than ${highestBid}`
                  }
                  className={`
                    w-full py-1.5 sm:py-2 px-1 rounded-xl font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-1
                    ${isSelectable
                      ? is13
                        ? 'bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 text-white hover:scale-105 shadow-card-glow ring-1 ring-gold-300 animate-pulse'
                        : 'bg-slate-900 hover:bg-felt-800 text-gold-300 hover:text-white border border-gold-500/50 hover:border-gold-300 shadow'
                      : 'bg-slate-900/40 text-slate-600 border border-slate-800/80 cursor-not-allowed opacity-40'
                    }
                  `}
                >
                  <span>{bid}</span>
                  {is13 && <Flame className="w-3.5 h-3.5 fill-gold-400 text-gold-400" />}
                </button>
                {is8Blocked && (
                  <span className="text-[8px] sm:text-[9px] text-amber-500/80 font-medium mt-0.5 leading-none text-center">
                    Opening only
                  </span>
                )}
              </div>
            );
          })}

          {/* Pass Button */}
          <div className="flex-1 flex flex-col items-center">
            <button
              onClick={onPass}
              className="w-full py-1.5 sm:py-2 px-2 rounded-xl font-bold text-xs transition-all shadow bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 hover:border-slate-500"
            >
              Pass
            </button>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 text-center">
          💡 Dealer makes bid n → next player deals at n - x. Dealer fails → deals again at 2n. Opponents make → dealer at x + n. 52+ pts loses!
        </div>
      </div>
    );
  }

  if (phase === 'TRUMP_SELECTION') {
    const suits: { suit: Suit; label: string; color: string; isMajor: boolean }[] = [
      { suit: 'spades', label: 'Spades', color: 'text-slate-100', isMajor: true },
      { suit: 'hearts', label: 'Hearts', color: 'text-rose-500', isMajor: true },
      { suit: 'diamonds', label: 'Diamonds', color: 'text-rose-500', isMajor: false },
      { suit: 'clubs', label: 'Clubs', color: 'text-slate-100', isMajor: false },
    ];

    return (
      <div className="bg-slate-950/90 backdrop-blur-md border border-gold-500/70 rounded-2xl p-2.5 sm:p-3 shadow-2xl animate-fade-in flex flex-col items-center gap-2 max-w-lg mx-auto">
        <div className="flex items-center gap-1.5 text-xs text-gold-300 font-semibold">
          <Crown className="w-4 h-4 text-gold-400" />
          <span>You won the bid! Choose Trump Suit (हुक्म):</span>
        </div>

        {/* 1-Tap Suit Selector */}
        <div className="flex items-center gap-2 w-full">
          {suits.map(({ suit, label, color }) => (
            <button
              key={suit}
              onClick={() => onSelectTrump(suit)}
              className="flex-1 py-1.5 sm:py-2.5 px-2 rounded-xl bg-slate-900 hover:bg-felt-800 border-2 border-slate-700 hover:border-gold-400 text-slate-200 transition-all flex flex-col items-center justify-center shadow hover:scale-105"
            >
              <span className={`text-2xl ${color} leading-none mb-0.5`}>
                {SUIT_SYMBOLS[suit]}
              </span>
              <span className="text-[10px] font-bold">{label}</span>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return null;
};

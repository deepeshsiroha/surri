import React from 'react';
import { PlayerId } from '../game/types';
import { Gavel, AlertTriangle, Flame, ShieldAlert } from 'lucide-react';

interface BiddingModalProps {
  isOpen: boolean;
  minBid: number;
  currentHighestBid: number;
  highestBidder: PlayerId | null;
  isForcedDealer: boolean;
  onPlaceBid: (bid: number) => void;
  onPass: () => void;
}

export const BiddingModal: React.FC<BiddingModalProps> = ({
  isOpen,
  minBid,
  currentHighestBid,
  highestBidder,
  isForcedDealer,
  onPlaceBid,
  onPass,
}) => {
  if (!isOpen) return null;

  const bids = [8, 10, 11, 12, 13];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-gold-500 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Gavel className="w-6 h-6 text-gold-400" />
          <h2 className="text-xl font-bold font-serif text-gold-300">
            {isForcedDealer ? 'Forced Dealer Bid' : 'Your Turn to Bid'}
          </h2>
        </div>

        {/* Current Bid Status */}
        <div className="bg-felt-900/60 border border-felt-600 rounded-xl p-3 mb-4">
          <div className="text-xs text-slate-300">
            Current High Bid:{' '}
            <strong className="text-gold-300 text-sm">
              {currentHighestBid > 0 ? `${currentHighestBid} tricks` : 'None'}
            </strong>
            {highestBidder && (
              <span className="text-slate-400 capitalize"> (by {highestBidder})</span>
            )}
          </div>
          {isForcedDealer && (
            <div className="text-xs text-amber-400 font-semibold mt-1 flex items-center justify-center gap-1">
              <ShieldAlert className="w-4 h-4" />
              All players passed! As dealer, you must bid at least 8.
            </div>
          )}
        </div>

        {/* Informative Rule Callouts */}
        <div className="text-[11px] text-slate-300 space-y-1 mb-5 text-left bg-black/40 p-3 rounded-lg border border-slate-800">
          <div className="flex items-start gap-1.5 text-gold-300">
            <span>⭐</span>
            <span>
              <strong>Bid 10+:</strong> Partner’s hand is revealed as <em>Dummy</em>, and you control both hands!
            </span>
          </div>
          <div className="flex items-start gap-1.5 text-rose-300">
            <span>🔥</span>
            <span>
              <strong>Bid 13 (Slam):</strong> Instant Win if made, Instant Defeat if opponents take even 1 trick.
            </span>
          </div>
        </div>

        {/* Bid Selection Buttons */}
        <div className="grid grid-cols-3 gap-2.5 mb-4">
          {bids.map((bid) => {
            const isSelectable = bid > currentHighestBid && (isForcedDealer ? bid >= 8 : bid >= minBid);
            const is13 = bid === 13;

            return (
              <button
                key={bid}
                disabled={!isSelectable}
                onClick={() => onPlaceBid(bid)}
                className={`
                  p-3 rounded-xl flex flex-col items-center justify-center font-bold transition-all
                  ${isSelectable
                    ? is13
                      ? 'bg-gradient-to-r from-amber-600 via-rose-600 to-amber-600 text-white hover:scale-105 shadow-card-glow ring-2 ring-gold-400 animate-pulse'
                      : 'bg-gradient-to-b from-slate-800 to-slate-900 text-gold-300 hover:from-felt-700 hover:to-felt-800 hover:text-white border border-gold-500/50 hover:border-gold-400 shadow'
                    : 'bg-slate-900/50 text-slate-600 border border-slate-800 cursor-not-allowed'
                  }
                `}
              >
                <span className="text-lg">{bid}</span>
                <span className="text-[10px] font-normal uppercase tracking-wider">
                  {is13 ? 'Slam (13)' : `${bid} Tricks`}
                </span>
              </button>
            );
          })}

          {/* Pass Button */}
          <button
            disabled={isForcedDealer}
            onClick={onPass}
            className={`
              p-3 rounded-xl flex flex-col items-center justify-center font-bold transition-all
              ${!isForcedDealer
                ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-500 shadow'
                : 'bg-slate-900/40 text-slate-600 border border-slate-800 cursor-not-allowed opacity-50'
              }
            `}
          >
            <span className="text-lg">Pass</span>
            <span className="text-[10px] font-normal uppercase tracking-wider">
              No Bid
            </span>
          </button>
        </div>
      </div>
    </div>
  );
};

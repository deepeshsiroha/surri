import React from 'react';
import { Card, Contract, PlayedCard, PlayerId, Suit, Trick } from '../game/types';
import { CardView } from './CardView';
import { SUIT_SYMBOLS } from '../game/deck';
import { Award, Zap, CheckCircle2, ShieldAlert } from 'lucide-react';

interface TrickAreaProps {
  trick: Trick;
  trumpSuit: Suit | null;
  lastWinner: PlayerId | null;
  isResolving: boolean;
  onTRAMClick?: () => void;
  canClaimTRAM?: boolean;
  contract?: Contract | null;
  tricksUs?: number;
  tricksThem?: number;
  fourColor?: boolean;
}

export const TrickArea: React.FC<TrickAreaProps> = ({
  trick,
  trumpSuit,
  lastWinner,
  isResolving,
  onTRAMClick,
  canClaimTRAM = false,
  contract = null,
  tricksUs = 0,
  tricksThem = 0,
  fourColor = true,
}) => {
  const getPlayedCard = (playerId: PlayerId): PlayedCard | undefined => {
    return trick.cards.find((c) => c.playerId === playerId);
  };

  const southCard = getPlayedCard('south');
  const westCard = getPlayedCard('west');
  const northCard = getPlayedCard('north');
  const eastCard = getPlayedCard('east');

  // Callbreak-style Contract Progress calculation
  const isUsBidding = contract?.team === 'us';
  const biddingTricksWon = isUsBidding ? tricksUs : tricksThem;
  const isContractMade = contract ? biddingTricksWon >= contract.bid : false;

  return (
    <div className="relative w-72 h-72 sm:w-96 sm:h-96 rounded-full border-2 border-felt-600/40 bg-felt-900/40 shadow-table-inner flex items-center justify-center">
      {/* Central Trump Watermark / Badge */}
      {trumpSuit && (
        <div className="absolute flex flex-col items-center justify-center pointer-events-none opacity-15 select-none">
          <span className="text-7xl sm:text-9xl">
            {SUIT_SYMBOLS[trumpSuit]}
          </span>
          <span className="text-xs uppercase font-bold tracking-widest text-gold-400">
            Trump
          </span>
        </div>
      )}

      {/* Callbreak-Style Live Contract Pill - Positioned on Top Rim so it NEVER covers North's card */}
      {contract && (
        <div className="absolute -top-3.5 sm:-top-4 z-20 pointer-events-none flex flex-col items-center">
          <div
            className={`px-3 py-0.5 sm:py-1 rounded-full text-[11px] sm:text-xs font-bold border shadow-lg flex items-center gap-1.5 transition-all ${
              isContractMade
                ? 'bg-emerald-950/95 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/50'
                : 'bg-black/90 border-gold-400/70 text-gold-300'
            }`}
          >
            {isContractMade ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>
                  {contract.team === 'us' ? 'TEAM US' : 'TEAM THEM'} MADE BID! ({biddingTricksWon}/{contract.bid} tricks)
                </span>
              </>
            ) : (
              <>
                <span>
                  {contract.bid} {contract.trump && SUIT_SYMBOLS[contract.trump]} by{' '}
                  <span className={contract.team === 'us' ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                    {contract.team === 'us' ? 'Team US' : 'Team THEM'}
                  </span>
                </span>
                <span className="text-slate-400 font-mono">
                  ({biddingTricksWon}/{contract.bid} tricks)
                </span>
              </>
            )}
          </div>
        </div>
      )}

      {/* TRAM Button in Trick Area */}
      {canClaimTRAM && (
        <button
          onClick={onTRAMClick}
          className="absolute -bottom-3 sm:-bottom-4 z-30 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-slate-950 font-black text-xs px-3.5 py-1.5 rounded-full shadow-card-glow flex items-center gap-1.5 animate-pulse uppercase tracking-wider transition-all pointer-events-auto"
        >
          <Zap className="w-4 h-4 fill-slate-950" />
          Claim TRAM
        </button>
      )}

      {/* Card Spots on the Table */}
      {/* North Card (Top) */}
      <div className="absolute top-2 sm:top-3 left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-300 z-10">
        {northCard ? (
          <div className="animate-deal-card flex flex-col items-center">
            <span className="text-[10px] text-emerald-300 font-bold bg-black/80 px-2 py-0.5 rounded-full mb-1 border border-emerald-500/50 shadow">
              Arjun
            </span>
            <CardView
              card={northCard.card}
              size="md"
              fourColor={fourColor}
              isTrump={trumpSuit ? northCard.card.suit === trumpSuit : false}
            />
          </div>
        ) : (
          <div className="w-15 h-22 sm:w-19 sm:h-28 md:w-22 md:h-33 border border-dashed border-felt-500/30 rounded-xl" />
        )}
      </div>

      {/* West Card (Left) */}
      <div className="absolute left-2 sm:left-3 top-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-300 z-10">
        {westCard ? (
          <div className="animate-deal-card flex flex-col items-center">
            <span className="text-[10px] text-rose-300 font-bold bg-black/80 px-2 py-0.5 rounded-full mb-1 border border-rose-500/50 shadow">
              Vikram
            </span>
            <CardView
              card={westCard.card}
              size="md"
              fourColor={fourColor}
              isTrump={trumpSuit ? westCard.card.suit === trumpSuit : false}
            />
          </div>
        ) : (
          <div className="w-15 h-22 sm:w-19 sm:h-28 md:w-22 md:h-33 border border-dashed border-felt-500/30 rounded-xl" />
        )}
      </div>

      {/* East Card (Right) */}
      <div className="absolute right-2 sm:right-3 top-1/2 -translate-y-1/2 flex flex-col items-center transition-all duration-300 z-10">
        {eastCard ? (
          <div className="animate-deal-card flex flex-col items-center">
            <span className="text-[10px] text-rose-300 font-bold bg-black/80 px-2 py-0.5 rounded-full mb-1 border border-rose-500/50 shadow">
              Kabir
            </span>
            <CardView
              card={eastCard.card}
              size="md"
              fourColor={fourColor}
              isTrump={trumpSuit ? eastCard.card.suit === trumpSuit : false}
            />
          </div>
        ) : (
          <div className="w-15 h-22 sm:w-19 sm:h-28 md:w-22 md:h-33 border border-dashed border-felt-500/30 rounded-xl" />
        )}
      </div>

      {/* South Card (Bottom) */}
      <div className="absolute bottom-2 sm:bottom-3 left-1/2 -translate-x-1/2 flex flex-col items-center transition-all duration-300 z-10">
        {southCard ? (
          <div className="animate-deal-card flex flex-col items-center">
            <span className="text-[10px] text-emerald-300 font-bold bg-black/80 px-2 py-0.5 rounded-full mb-1 border border-emerald-500/50 shadow">
              You
            </span>
            <CardView
              card={southCard.card}
              size="md"
              fourColor={fourColor}
              isTrump={trumpSuit ? southCard.card.suit === trumpSuit : false}
            />
          </div>
        ) : (
          <div className="w-15 h-22 sm:w-19 sm:h-28 md:w-22 md:h-33 border border-dashed border-felt-500/30 rounded-xl" />
        )}
      </div>

      {/* Trick Resolving Banner */}
      {isResolving && lastWinner && (
        <div
          className={`absolute z-30 px-4 py-2 rounded-xl shadow-2xl flex items-center gap-2 animate-bounce-short border backdrop-blur-md ${
            lastWinner === 'south' || lastWinner === 'north'
              ? 'bg-emerald-950/95 border-emerald-400 text-emerald-300 ring-2 ring-emerald-400/40'
              : 'bg-rose-950/95 border-rose-400 text-rose-300 ring-2 ring-rose-400/40'
          }`}
        >
          <Award className="w-5 h-5 text-gold-400" />
          <span className="text-sm font-bold">
            {lastWinner === 'south' || lastWinner === 'north'
              ? 'Team US won trick!'
              : 'Team THEM won trick!'}
          </span>
        </div>
      )}
    </div>
  );
};

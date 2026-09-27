import { Card, Player, PlayerId, Suit } from '../game/types';
import { CardView } from './CardView';
import { Shield, Sparkles, Award } from 'lucide-react';

interface PlayerSeatProps {
  player: Player;
  isCurrentTurn: boolean;
  isDealer: boolean;
  isDummyRevealed?: boolean;
  dummyHand?: Card[];
  isHumanControllingDummy?: boolean;
  playableDummyCards?: Card[];
  onPlayDummyCard?: (card: Card) => void;
  position: 'south' | 'west' | 'north' | 'east';
  chatBubble: string | null;
  trumpSuit?: Suit | null;
  fourColor?: boolean;
}

export const PlayerSeat: React.FC<PlayerSeatProps> = ({
  player,
  isCurrentTurn,
  isDealer,
  isDummyRevealed = false,
  dummyHand = [],
  isHumanControllingDummy = false,
  playableDummyCards = [],
  onPlayDummyCard,
  position,
  chatBubble,
  trumpSuit = null,
  fourColor = true,
}) => {
  const isSouth = position === 'south';
  const isNorth = position === 'north';
  const isWest = position === 'west';
  const isEast = position === 'east';

  return (
    <div className={`relative flex flex-col items-center ${isSouth ? 'w-full' : ''}`}>
      {/* Chat Speech Bubble */}
      {chatBubble && (
        <div className="absolute -top-12 z-40 bg-slate-900/95 text-amber-300 text-xs px-3 py-1.5 rounded-full border border-amber-400 shadow-lg animate-bounce-short whitespace-nowrap">
          {chatBubble}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-900" />
        </div>
      )}

      {/* Player Profile & Stats Card */}
      <div
        className={`
          flex items-center gap-2 px-3 py-1.5 rounded-2xl backdrop-blur-md transition-all duration-300
          ${isCurrentTurn
            ? 'bg-felt-900/90 ring-2 ring-gold-400 shadow-card-glow scale-105'
            : 'bg-black/60 border border-slate-700/80 shadow-md'
          }
        `}
      >
        {/* Avatar with Turn Ring */}
        <div className="relative">
          <div
            className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-lg sm:text-xl font-bold bg-gradient-to-tr ${
              player.team === 'us'
                ? 'from-emerald-700 to-teal-500 text-white'
                : 'from-amber-700 to-rose-600 text-white'
            } border-2 ${isCurrentTurn ? 'border-gold-300' : 'border-slate-500'}`}
          >
            {player.avatar}
          </div>

          {/* Dealer Button Badge */}
          {isDealer && (
            <div
              title="Dealer (Team tracks score to 52)"
              className="absolute -bottom-1 -right-1 w-5 h-5 bg-gold-400 text-slate-950 font-black text-[10px] rounded-full border-2 border-white flex items-center justify-center shadow"
            >
              D
            </div>
          )}
        </div>

        {/* Player Name and Stats */}
        <div className="flex flex-col text-left">
          <div className="flex items-center gap-1.5">
            <span className="text-xs sm:text-sm font-semibold text-slate-100 flex items-center gap-1">
              {player.name}
              {player.team === 'us' ? (
                <span className="text-[10px] bg-emerald-900/80 text-emerald-300 px-1 rounded">US</span>
              ) : (
                <span className="text-[10px] bg-rose-900/80 text-rose-300 px-1 rounded">THEM</span>
              )}
            </span>

            {/* Dummy Badge if North is Dummy */}
            {isNorth && isDummyRevealed && (
              <span className="text-[9px] bg-amber-500 text-slate-950 font-bold px-1 rounded uppercase">
                Dummy
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-300">
            {/* Bid or Pass display */}
            <span>
              Bid:{' '}
              <strong className="text-gold-300">
                {player.currentBid === null
                  ? '-'
                  : player.currentBid === 'pass'
                  ? 'Pass'
                  : player.currentBid}
              </strong>
            </span>

            {/* Match Score Display */}
            <span
              className={`font-mono text-[10px] px-1.5 py-0.5 rounded border font-bold ${
                player.team === 'us'
                  ? 'text-emerald-400 bg-emerald-950/60 border-emerald-500/40'
                  : 'text-rose-400 bg-rose-950/60 border-rose-500/40'
              }`}
            >
              {player.team === 'us' ? 'US' : 'THEM'}{' '}
              {player.score !== undefined ? (player.score >= 0 ? `+${player.score}` : player.score) : 0} pts
            </span>
          </div>
        </div>

        {/* Signal Tag if present */}
        {player.signal && (
          <div
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
              player.signal === 'major'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/50'
                : player.signal === 'minor'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/50'
                : 'bg-slate-700/50 text-slate-300 border border-slate-600'
            }`}
          >
            {player.signal}
          </div>
        )}
      </div>

      {/* Opponent Card Stack (West & East) */}
      {(isWest || isEast) && (
        <div className="mt-2 flex flex-col items-center">
          <div className="relative w-12 h-16 sm:w-14 sm:h-20 flex items-center justify-center">
            {player.hand.map((_, idx) => (
              <div
                key={idx}
                className="absolute inset-0 transition-transform"
                style={{
                  transform: `translateY(${idx * -1.5}px) rotate(${(idx - player.hand.length / 2) * 2}deg)`,
                }}
              >
                <CardView faceDown size="sm" />
              </div>
            ))}
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1">
            {player.hand.length} cards
          </span>
        </div>
      )}

      {/* North Partner Display: Face-down cards only when Dummy is not revealed */}
      {isNorth && !isDummyRevealed && (
        <div className="mt-2 flex flex-col items-center">
          <div className="flex items-center -space-x-6 sm:-space-x-8">
            {player.hand.map((_, idx) => (
              <CardView key={idx} faceDown size="sm" />
            ))}
          </div>
          <span className="text-[10px] text-slate-400 font-mono mt-1">
            {player.hand.length} cards
          </span>
        </div>
      )}
    </div>
  );
};

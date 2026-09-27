import React from 'react';
import { Card, Suit } from '../game/types';
import { SUIT_SYMBOLS } from '../game/deck';

interface CardViewProps {
  card?: Card;
  faceDown?: boolean;
  isPlayable?: boolean;
  isSelected?: boolean;
  isTrump?: boolean;
  isDimmed?: boolean;
  onClick?: () => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  fourColor?: boolean;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  faceDown = false,
  isPlayable = false,
  isSelected = false,
  isTrump = false,
  isDimmed = false,
  onClick,
  size = 'md',
  className = '',
  fourColor = true,
}) => {
  // Enhanced Card Sizing Classes
  const sizeClasses = {
    sm: 'w-11 h-16 sm:w-13 sm:h-19 rounded-lg',
    md: 'w-15 h-22 sm:w-19 sm:h-28 md:w-22 md:h-33 lg:w-24 lg:h-36 rounded-xl',
    lg: 'w-20 h-28 sm:w-24 sm:h-36 md:w-28 md:h-42 rounded-2xl',
  }[size];

  if (faceDown || !card) {
    // Card back with elegant casino pattern
    return (
      <div
        className={`${sizeClasses} bg-gradient-to-br from-indigo-900 via-blue-950 to-slate-950 border-2 border-amber-400/80 shadow-md flex items-center justify-center relative overflow-hidden select-none transition-transform duration-200 ${className}`}
      >
        <div className="absolute inset-1 border border-amber-400/50 rounded-lg flex items-center justify-center bg-blue-950/40">
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full border-2 border-amber-400/40 flex items-center justify-center rotate-45">
            <span className="text-amber-300 text-xs sm:text-base font-serif">♠</span>
          </div>
        </div>
      </div>
    );
  }

  const { suit, rank } = card;
  const suitSymbol = SUIT_SYMBOLS[suit];

  // High contrast color logic (Four-color or standard two-color)
  const getSuitColor = (s: Suit, isFourColor: boolean): string => {
    if (isFourColor) {
      switch (s) {
        case 'spades':
          return 'text-slate-950';
        case 'hearts':
          return 'text-red-600';
        case 'clubs':
          return 'text-emerald-700';
        case 'diamonds':
          return 'text-blue-600';
      }
    }
    return s === 'hearts' || s === 'diamonds' ? 'text-red-600' : 'text-slate-950';
  };

  const suitColor = getSuitColor(suit, fourColor);

  return (
    <div
      onClick={isPlayable ? onClick : undefined}
      className={`
        ${sizeClasses}
        bg-gradient-to-b from-white via-white to-slate-50 border border-slate-300/90 shadow-md shadow-black/25
        relative overflow-hidden select-none transition-all duration-200
        ${isPlayable ? 'cursor-pointer hover:-translate-y-4 hover:scale-105 hover:shadow-2xl ring-2 ring-amber-400 ring-offset-1 ring-offset-felt-900 z-10' : ''}
        ${isDimmed ? 'opacity-50 brightness-90 saturate-75 cursor-not-allowed' : ''}
        ${isSelected ? '-translate-y-5 ring-4 ring-gold-500 shadow-card-glow z-20' : ''}
        ${className}
      `}
    >
      {/* Top Left Corner: Pinned to corner so horizontal card overlap NEVER covers it */}
      <div
        className={`absolute top-1 left-1.5 sm:top-1.5 sm:left-2 flex flex-col items-center leading-none select-none pointer-events-none z-10 ${suitColor}`}
      >
        <span
          className={`font-black font-sans tracking-tight leading-none ${
            size === 'sm'
              ? 'text-xs sm:text-sm'
              : size === 'md'
              ? 'text-sm sm:text-base md:text-lg lg:text-xl'
              : 'text-base sm:text-lg md:text-xl lg:text-2xl'
          }`}
        >
          {rank}
        </span>
        <span
          className={`leading-none -mt-0.5 ${
            size === 'sm'
              ? 'text-[10px] sm:text-xs'
              : size === 'md'
              ? 'text-xs sm:text-sm md:text-base'
              : 'text-sm sm:text-base md:text-lg'
          }`}
        >
          {suitSymbol}
        </span>
      </div>

      {/* Trump Badge (Golden Star) if this card is of the Trump Suit */}
      {isTrump && (
        <div
          title="Trump Card"
          className="absolute top-1 right-1 sm:top-1.5 sm:right-1.5 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-amber-400 text-slate-950 flex items-center justify-center text-[9px] font-black shadow pointer-events-none select-none z-10"
        >
          ★
        </div>
      )}

      {/* Center Suit Graphic / Royal Crest */}
      <div
        className={`absolute inset-0 flex items-center justify-center pointer-events-none select-none ${suitColor}`}
      >
        {rank === 'A' ? (
          <div className="flex flex-col items-center">
            <span className="text-3xl sm:text-4xl md:text-5xl font-serif opacity-95">
              {suitSymbol}
            </span>
          </div>
        ) : rank === 'K' || rank === 'Q' || rank === 'J' ? (
          <div className="flex flex-col items-center justify-center px-1.5 py-0.5 rounded-lg border border-current/25 bg-current/[0.04]">
            <span className="text-xl sm:text-2xl md:text-3xl font-serif font-black">{rank}</span>
            <span className="text-xs sm:text-sm md:text-base -mt-1 opacity-90">{suitSymbol}</span>
          </div>
        ) : (
          <span className="text-2xl sm:text-3xl md:text-4xl font-serif opacity-80">
            {suitSymbol}
          </span>
        )}
      </div>

      {/* Bottom Right Corner (Inverted): Pinned to bottom-right corner */}
      <div
        className={`absolute bottom-1 right-1.5 sm:bottom-1.5 sm:right-2 flex flex-col items-center leading-none select-none pointer-events-none z-10 rotate-180 ${suitColor}`}
      >
        <span
          className={`font-black font-sans tracking-tight leading-none ${
            size === 'sm'
              ? 'text-xs sm:text-sm'
              : size === 'md'
              ? 'text-sm sm:text-base md:text-lg lg:text-xl'
              : 'text-base sm:text-lg md:text-xl lg:text-2xl'
          }`}
        >
          {rank}
        </span>
        <span
          className={`leading-none -mt-0.5 ${
            size === 'sm'
              ? 'text-[10px] sm:text-xs'
              : size === 'md'
              ? 'text-xs sm:text-sm md:text-base'
              : 'text-sm sm:text-base md:text-lg'
          }`}
        >
          {suitSymbol}
        </span>
      </div>
    </div>
  );
};

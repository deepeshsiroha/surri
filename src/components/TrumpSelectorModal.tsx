import React from 'react';
import { SignalType, Suit } from '../game/types';
import { SUIT_SYMBOLS } from '../game/deck';
import { Crown, Sparkles } from 'lucide-react';

interface TrumpSelectorModalProps {
  isOpen: boolean;
  onSelectTrump: (suit: Suit) => void;
  partnerSignal: SignalType | null;
}

export const TrumpSelectorModal: React.FC<TrumpSelectorModalProps> = ({
  isOpen,
  onSelectTrump,
  partnerSignal,
}) => {
  if (!isOpen) return null;

  const suits: { suit: Suit; label: string; color: string; isMajor: boolean }[] = [
    { suit: 'spades', label: 'Spades', color: 'text-slate-100', isMajor: true },
    { suit: 'hearts', label: 'Hearts', color: 'text-rose-500', isMajor: true },
    { suit: 'diamonds', label: 'Diamonds', color: 'text-rose-500', isMajor: false },
    { suit: 'clubs', label: 'Clubs', color: 'text-slate-100', isMajor: false },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-gold-500 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Crown className="w-6 h-6 text-gold-400" />
          <h2 className="text-xl font-bold font-serif text-gold-300">
            Choose Trump Suit (हुक्म)
          </h2>
        </div>

        <p className="text-xs text-slate-300 mb-4">
          You won the contract! Choose the trump suit for this round.
        </p>

        {partnerSignal && (
          <div className="mb-4 bg-felt-900/60 border border-felt-600 rounded-lg p-2.5 text-xs flex items-center justify-center gap-1.5 text-gold-300">
            <Sparkles className="w-3.5 h-3.5 text-gold-400" />
            Partner suggested:{' '}
            <strong className="uppercase font-bold tracking-wide">
              {partnerSignal} Suits {partnerSignal === 'major' ? '(♠/♥)' : '(♣/♦)'}
            </strong>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {suits.map(({ suit, label, color, isMajor }) => {
            const isRecommended =
              (partnerSignal === 'major' && isMajor) ||
              (partnerSignal === 'minor' && !isMajor);

            return (
              <button
                key={suit}
                onClick={() => onSelectTrump(suit)}
                className={`
                  relative p-4 rounded-xl flex flex-col items-center justify-center transition-all duration-200
                  bg-slate-800/80 hover:bg-felt-800 border-2 hover:scale-105 shadow-md
                  ${isRecommended ? 'border-gold-400 ring-2 ring-gold-400/50' : 'border-slate-700 hover:border-gold-400'}
                `}
              >
                {isRecommended && (
                  <span className="absolute top-1.5 right-1.5 text-[9px] bg-gold-400 text-slate-950 font-black px-1.5 py-0.5 rounded-full uppercase">
                    Suggested
                  </span>
                )}
                <span className={`text-4xl ${color} mb-1`}>
                  {SUIT_SYMBOLS[suit]}
                </span>
                <span className="text-sm font-bold text-slate-100">{label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

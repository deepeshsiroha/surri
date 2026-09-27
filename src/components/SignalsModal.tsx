import React from 'react';
import { SignalType } from '../game/types';
import { MessageSquare, Sparkles, Hand, Heart, Club } from 'lucide-react';

interface SignalsModalProps {
  isOpen: boolean;
  onSendSignal: (signal: SignalType) => void;
  partnerSignal: SignalType | null;
  hasAskedPartner: boolean;
  onAskPartner: () => void;
}

export const SignalsModal: React.FC<SignalsModalProps> = ({
  isOpen,
  onSendSignal,
  partnerSignal,
  hasAskedPartner,
  onAskPartner,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-gold-500/80 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <MessageSquare className="w-6 h-6 text-gold-400" />
          <h2 className="text-xl font-bold font-serif text-gold-300">
            Pre-Bid Partner Signals
          </h2>
        </div>

        <p className="text-xs text-slate-300 mb-4">
          In Surri, partners communicate hand strength before bidding to coordinate trump choices and bids.
        </p>

        {/* Partner's Signal Feedback */}
        <div className="bg-felt-900/60 border border-felt-600 rounded-xl p-3 mb-5 text-left">
          <div className="text-xs text-gold-400 font-semibold mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            Partner Arjun's Signal:
          </div>
          {partnerSignal ? (
            <div className="text-sm font-bold capitalize text-white flex items-center gap-2">
              <span className={`px-2 py-0.5 rounded text-xs uppercase ${
                partnerSignal === 'major'
                  ? 'bg-rose-600/30 text-rose-300 border border-rose-500'
                  : partnerSignal === 'minor'
                  ? 'bg-sky-600/30 text-sky-300 border border-sky-500'
                  : 'bg-slate-700 text-slate-300'
              }`}>
                {partnerSignal}
              </span>
              <span className="text-xs text-slate-300">
                {partnerSignal === 'major' && 'Strong in Spades / Hearts (Aces, Kings, length).'}
                {partnerSignal === 'minor' && 'Strong in Clubs / Diamonds (Honors, depth).'}
                {partnerSignal === 'pass' && 'Quiet hand, low trick support.'}
              </span>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 italic">Waiting for signal...</span>
              {!hasAskedPartner && (
                <button
                  onClick={onAskPartner}
                  className="bg-gold-500 hover:bg-gold-400 text-slate-950 text-xs font-bold px-3 py-1 rounded-lg transition-colors"
                >
                  Ask Partner
                </button>
              )}
            </div>
          )}
        </div>

        <div className="text-xs font-semibold text-slate-200 mb-2">
          Send Your Signal to Arjun:
        </div>

        {/* Signal Action Buttons */}
        <div className="grid grid-cols-3 gap-2.5">
          {/* Major */}
          <button
            onClick={() => onSendSignal('major')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800 hover:bg-rose-950/70 border border-slate-700 hover:border-rose-500 transition-all group"
          >
            <div className="flex gap-1 text-rose-400 mb-1">
              <span className="text-lg">♠</span>
              <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
            </div>
            <span className="text-xs font-bold text-slate-100 group-hover:text-rose-300">
              Major
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">♠ Spades / ♥ Hearts</span>
          </button>

          {/* Minor */}
          <button
            onClick={() => onSendSignal('minor')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800 hover:bg-sky-950/70 border border-slate-700 hover:border-sky-500 transition-all group"
          >
            <div className="flex gap-1 text-sky-400 mb-1">
              <Club className="w-4 h-4 fill-sky-400 text-sky-400" />
              <span className="text-lg">♦</span>
            </div>
            <span className="text-xs font-bold text-slate-100 group-hover:text-sky-300">
              Minor
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">♣ Clubs / ♦ Diamonds</span>
          </button>

          {/* Pass */}
          <button
            onClick={() => onSendSignal('pass')}
            className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-500 transition-all group"
          >
            <Hand className="w-5 h-5 text-slate-400 mb-1" />
            <span className="text-xs font-bold text-slate-100 group-hover:text-slate-300">
              Pass
            </span>
            <span className="text-[10px] text-slate-400 mt-0.5">Low Support</span>
          </button>
        </div>
      </div>
    </div>
  );
};

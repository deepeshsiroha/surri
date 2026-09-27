import React from 'react';
import { Zap, CheckCircle2, XCircle, Sparkles } from 'lucide-react';

interface TRAMModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirmClaim: () => void;
  isValid: boolean;
  reason: string;
}

export const TRAMModal: React.FC<TRAMModalProps> = ({
  isOpen,
  onClose,
  onConfirmClaim,
  isValid,
  reason,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-gold-500 rounded-2xl max-w-md w-full p-6 shadow-2xl text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Zap className="w-6 h-6 text-gold-400 fill-gold-400" />
          <h2 className="text-xl font-bold font-serif text-gold-300">
            TRAM (The Rest Are Mine)
          </h2>
        </div>

        <p className="text-xs text-slate-300 mb-4">
          TRAM allows a player to claim all remaining tricks immediately if their cards are guaranteed unbeatable winners.
        </p>

        {/* Verification Status */}
        <div
          className={`p-4 rounded-xl border mb-5 text-left flex items-start gap-3 ${
            isValid
              ? 'bg-emerald-950/50 border-emerald-500/80 text-emerald-200'
              : 'bg-rose-950/50 border-rose-500/80 text-rose-200'
          }`}
        >
          {isValid ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          )}

          <div>
            <div className="text-xs font-bold uppercase tracking-wider mb-1">
              {isValid ? 'TRAM Verified Valid!' : 'TRAM Claim Invalid'}
            </div>
            <div className="text-xs opacity-90">{reason}</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs py-2.5 rounded-xl transition-colors"
          >
            Cancel
          </button>

          {isValid && (
            <button
              onClick={onConfirmClaim}
              className="flex-1 bg-gradient-to-r from-gold-500 to-amber-600 hover:from-gold-400 hover:to-amber-500 text-slate-950 font-black text-xs py-2.5 rounded-xl shadow-card-glow flex items-center justify-center gap-1.5 transition-all"
            >
              <Sparkles className="w-4 h-4 fill-slate-950" />
              Claim All Tricks
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

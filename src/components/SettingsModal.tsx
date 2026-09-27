import React from 'react';
import { GameSettings } from '../game/types';
import { Settings, Volume2, VolumeX, Gauge, MessageSquare, RotateCcw, X, Eye } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  onResetMatch: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetMatch,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-gold-500 rounded-2xl max-w-md w-full p-6 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-gold-400" />
            <h2 className="text-xl font-bold font-serif text-gold-300">
              Game Settings
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {/* 4-Color Deck Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="flex items-center gap-2.5">
              <Eye className="w-5 h-5 text-amber-400" />
              <div>
                <div className="text-xs font-semibold text-slate-200 flex items-center gap-1.5">
                  High-Visibility 4-Color Deck
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1 rounded font-mono">♠♥♣♦</span>
                </div>
                <div className="text-[10px] text-slate-400">
                  ♠Black, ♥Red, ♣Green, ♦Blue for maximum suit clarity
                </div>
              </div>
            </div>

            <button
              onClick={() => onUpdateSettings({ fourColorDeck: !settings.fourColorDeck })}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.fourColorDeck ? 'bg-gold-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-slate-950 shadow" />
            </button>
          </div>
          {/* Sound Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="flex items-center gap-2.5">
              {settings.soundEnabled ? (
                <Volume2 className="w-5 h-5 text-emerald-400" />
              ) : (
                <VolumeX className="w-5 h-5 text-slate-500" />
              )}
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  Sound Effects
                </div>
                <div className="text-[10px] text-slate-400">
                  Synthesized card snaps & fanfares
                </div>
              </div>
            </div>

            <button
              onClick={() => onUpdateSettings({ soundEnabled: !settings.soundEnabled })}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.soundEnabled ? 'bg-gold-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-slate-950 shadow" />
            </button>
          </div>

          {/* Bot Commentary Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="flex items-center gap-2.5">
              <MessageSquare className="w-5 h-5 text-sky-400" />
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  Bot Chat Bubbles
                </div>
                <div className="text-[10px] text-slate-400">
                  Show AI thoughts & reactions
                </div>
              </div>
            </div>

            <button
              onClick={() => onUpdateSettings({ botCommentary: !settings.botCommentary })}
              className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                settings.botCommentary ? 'bg-gold-500 justify-end' : 'bg-slate-700 justify-start'
              }`}
            >
              <div className="w-4 h-4 rounded-full bg-slate-950 shadow" />
            </button>
          </div>

          {/* Game Speed */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700">
            <div className="flex items-center gap-2 mb-2">
              <Gauge className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-semibold text-slate-200">
                Gameplay Animation Speed
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {(['normal', 'fast', 'instant'] as const).map((spd) => (
                <button
                  key={spd}
                  onClick={() => onUpdateSettings({ speed: spd })}
                  className={`py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                    settings.speed === spd
                      ? 'bg-gold-500 text-slate-950 shadow'
                      : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                  }`}
                >
                  {spd}
                </button>
              ))}
            </div>
          </div>

          {/* Reset Match Button */}
          <div className="pt-2">
            <button
              onClick={() => {
                if (window.confirm('Are you sure you want to reset the entire match?')) {
                  onResetMatch();
                  onClose();
                }
              }}
              className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-600/50 text-rose-300 font-bold text-xs transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Current Match & Scores
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-5 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl transition-colors shadow"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

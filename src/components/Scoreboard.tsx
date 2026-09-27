import React from 'react';
import { Player, PlayerId, RoundScore, TeamId } from '../game/types';
import { KNOCKOUT_THRESHOLD } from '../game/scoring';
import { Award, X, History, Trophy, TrendingUp, AlertTriangle, ShieldAlert } from 'lucide-react';
import { SUIT_SYMBOLS } from '../game/deck';

interface ScoreboardProps {
  isOpen: boolean;
  onClose: () => void;
  dealer: PlayerId;
  players: Record<PlayerId, Player>;
  roundScores: RoundScore[];
  teamScores: Record<TeamId, number>;
  currentRound: number;
}

export const Scoreboard: React.FC<ScoreboardProps> = ({
  isOpen,
  onClose,
  dealer,
  players,
  roundScores,
  teamScores,
  currentRound,
}) => {
  if (!isOpen) return null;

  const scoreDiff = teamScores.us - teamScores.them;

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-slate-900 to-slate-950 border-2 border-gold-500 rounded-2xl max-w-3xl w-full p-6 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="w-6 h-6 text-gold-400" />
            <h2 className="text-xl font-bold font-serif text-gold-300">
              Surri Scorebook (Knockout at 52 Pts)
            </h2>
            <span className="text-xs bg-gold-500/20 text-gold-300 px-2.5 py-0.5 rounded-full border border-gold-400/40 font-mono font-bold">
              Round {currentRound}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-4 pr-1">
          {/* Match Scoreboard Summary Cards: 52-Point Knockout Race */}
          <div className="grid grid-cols-2 gap-4">
            {/* Team US */}
            <div
              className={`bg-gradient-to-br from-emerald-950/50 via-slate-900 to-slate-950 border rounded-xl p-4 text-center shadow relative overflow-hidden ${
                teamScores.us >= 40
                  ? 'border-rose-500 ring-1 ring-rose-500/50'
                  : 'border-emerald-500/50'
              }`}
            >
              <div className="text-xs uppercase font-bold tracking-wider text-emerald-400 mb-1 flex items-center justify-center gap-1">
                <span>Team You & Arjun (US)</span>
                {teamScores.us >= 40 && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
              </div>
              <div className="text-3xl font-black font-mono text-emerald-300 my-1">
                {teamScores.us}
                <span className="text-xs font-sans font-normal text-slate-400 ml-1">/ 52 pts</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-500 ${
                    teamScores.us >= 40 ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(0, (teamScores.us / KNOCKOUT_THRESHOLD) * 100))}%`,
                  }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {52 - teamScores.us > 0
                  ? `${52 - teamScores.us} pts safe from knockout`
                  : 'Knocked out (>52)!'}
              </div>
            </div>

            {/* Team THEM */}
            <div
              className={`bg-gradient-to-br from-rose-950/50 via-slate-900 to-slate-950 border rounded-xl p-4 text-center shadow relative overflow-hidden ${
                teamScores.them >= 40
                  ? 'border-rose-500 ring-1 ring-rose-500/50'
                  : 'border-rose-500/50'
              }`}
            >
              <div className="text-xs uppercase font-bold tracking-wider text-rose-400 mb-1 flex items-center justify-center gap-1">
                <span>Team Vikram & Kabir (THEM)</span>
                {teamScores.them >= 40 && <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />}
              </div>
              <div className="text-3xl font-black font-mono text-rose-300 my-1">
                {teamScores.them}
                <span className="text-xs font-sans font-normal text-slate-400 ml-1">/ 52 pts</span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-2 mt-2 overflow-hidden border border-slate-700">
                <div
                  className={`h-full transition-all duration-500 ${
                    teamScores.them >= 40 ? 'bg-rose-500' : 'bg-rose-600'
                  }`}
                  style={{
                    width: `${Math.min(100, Math.max(0, (teamScores.them / KNOCKOUT_THRESHOLD) * 100))}%`,
                  }}
                />
              </div>
              <div className="text-[10px] text-slate-400 mt-1">
                {52 - teamScores.them > 0
                  ? `${52 - teamScores.them} pts safe from knockout`
                  : 'Knocked out (>52)!'}
              </div>
            </div>
          </div>

          {/* Lead Status & Rule Banner */}
          <div className="flex items-center justify-between px-4 py-2.5 rounded-xl bg-black/60 border border-slate-800 text-xs">
            <div className="flex items-center gap-1.5 font-semibold">
              <ShieldAlert className="w-4 h-4 text-gold-400" />
              <span className="text-slate-300 font-medium">
                Knockout Goal: Drive opponents past 52 points to claim victory!
              </span>
            </div>

            <div className="text-[10px] text-amber-300 font-mono">
              Dealer starts at 0 • Made: deals at (n - x) • Failed: 2n
            </div>
          </div>

          {/* Round-by-Round History Table */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-200 mb-2">
              <History className="w-4 h-4 text-gold-400" />
              Round Breakdown
            </div>

            {roundScores.length === 0 ? (
              <div className="text-xs text-slate-400 text-center py-6 bg-slate-900/40 rounded-xl border border-slate-800">
                No completed rounds yet. Play round 1 to record match scores!
              </div>
            ) : (
              <div className="border border-slate-800 rounded-xl overflow-hidden text-xs shadow">
                <table className="w-full text-left">
                  <thead className="bg-slate-800/90 text-slate-300 font-semibold border-b border-slate-700 text-[11px]">
                    <tr>
                      <th className="p-2 text-center">Rnd</th>
                      <th className="p-2">Dealer (At x)</th>
                      <th className="p-2">Contract</th>
                      <th className="p-2 text-center">Tricks</th>
                      <th className="p-2">Surri Deal Handoff Outcome</th>
                      <th className="p-2 text-right pr-3">Score (US : THEM)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                    {roundScores.map((score) => {
                      const isUsBidder = score.bidderTeam === 'us';
                      const isUsDealer = score.dealerTeam === 'us';

                      return (
                        <tr key={score.roundNumber} className="hover:bg-slate-800/40 transition-colors">
                          <td className="p-2 text-center font-bold text-gold-300">
                            #{score.roundNumber}
                          </td>
                          <td className="p-2">
                            <span className="capitalize font-bold text-white">{score.dealer}</span>
                            <span className="text-[10px] bg-amber-400/20 text-amber-300 px-1 py-0.5 rounded font-mono font-bold ml-1">
                              at {score.dealerScoreBefore}
                            </span>
                          </td>
                          <td className="p-2">
                            <span className="font-bold text-white">{score.bid}</span>
                            <span className="ml-1 text-sm font-sans">{SUIT_SYMBOLS[score.trump]}</span>
                            <span
                              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ml-1.5 ${
                                isUsBidder
                                  ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40'
                                  : 'bg-rose-950/80 text-rose-300 border border-rose-500/40'
                              }`}
                            >
                              by {isUsBidder ? 'Team US' : 'Team THEM'}
                            </span>
                          </td>
                          <td className="p-2 text-center">
                            <span className="text-emerald-300 font-bold">{score.tricksUs}</span>
                            <span className="text-slate-500 mx-1">-</span>
                            <span className="text-rose-300 font-bold">{score.tricksThem}</span>
                          </td>
                          <td className="p-2 text-xs font-sans">
                            {score.outcomeType === 'dealer_made' && (
                              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                                <span>Dealer made {score.bid} • Rotate deal to {score.nextDealer} at {score.nextDealerScore} ({score.bid} - {score.dealerScoreBefore})</span>
                              </span>
                            )}
                            {score.outcomeType === 'dealer_failed' && (
                              <span className="text-rose-400 font-semibold flex items-center gap-1">
                                <span>Dealer failed {score.bid} • Retain deal at {score.nextDealerScore} ({score.dealerScoreBefore} + {score.bid * 2})</span>
                              </span>
                            )}
                            {score.outcomeType === 'opponent_made' && (
                              <span className="text-amber-400 font-semibold flex items-center gap-1">
                                <span>Opponents made {score.bid} • Retain deal at {score.nextDealerScore} ({score.dealerScoreBefore} + {score.bid})</span>
                              </span>
                            )}
                            {score.outcomeType === 'opponent_failed' && (
                              <span className="text-sky-400 font-semibold flex items-center gap-1">
                                <span>Opponents failed {score.bid} • Retain deal at {score.nextDealerScore} ({score.dealerScoreBefore} - {score.bid * 2})</span>
                              </span>
                            )}
                          </td>
                          <td className="p-2 text-right pr-3 font-bold font-mono">
                            <span className={score.totalScoreUs >= 40 ? 'text-rose-400' : 'text-emerald-300'}>
                              {score.totalScoreUs}
                            </span>
                            <span className="text-slate-500 mx-1">:</span>
                            <span className={score.totalScoreThem >= 40 ? 'text-rose-400' : 'text-rose-300'}>
                              {score.totalScoreThem}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl transition-colors shadow"
          >
            Back to Table
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { BookOpen, X, Sparkles, Gavel, ShieldCheck, Flame, Zap, Award } from 'lucide-react';

interface RulesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const RulesModal: React.FC<RulesModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'rules' | 'signals' | 'bidding' | 'scoring' | 'tram'>('rules');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-2 border-gold-500 rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-gold-400" />
            <h2 className="text-xl font-bold font-serif text-gold-300">
              How to Play Surri (सुर्री)
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-1.5 border-b border-slate-800 pb-3 mb-4 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('rules')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'rules'
                ? 'bg-gold-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('signals')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'signals'
                ? 'bg-gold-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Signals
          </button>
          <button
            onClick={() => setActiveTab('bidding')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'bidding'
                ? 'bg-gold-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Bidding & Dummy
          </button>
          <button
            onClick={() => setActiveTab('tram')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'tram'
                ? 'bg-gold-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            TRAM
          </button>
          <button
            onClick={() => setActiveTab('scoring')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-all whitespace-nowrap ${
              activeTab === 'scoring'
                ? 'bg-gold-500 text-slate-950 shadow'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
            }`}
          >
            Scoring (+n / -2n)
          </button>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto space-y-4 pr-1 text-slate-300 text-xs sm:text-sm leading-relaxed">
          {activeTab === 'rules' && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-gold-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-gold-400" />
                The Essence of Surri
              </h3>
              <p>
                <strong>Surri</strong> is a classic Indian trick-taking partnership card game played with high stakes and strategic bidding.
              </p>
              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80 space-y-2">
                <div className="flex items-start gap-2">
                  <span className="font-bold text-emerald-400">4 Players, 2 Teams:</span>
                  <span>You and Partner Arjun (North) compete against Vikram (West) and Kabir (East).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-amber-400">52 Cards:</span>
                  <span>13 cards dealt to each player. Standard rank order: A (highest), K, Q, J, 10 ... 2 (lowest).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-sky-400">Trump Choice:</span>
                  <span>Winning bidder selects any trump suit (♠, ♥, ♦, ♣) or bids 13 (Slam).</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="font-bold text-gold-400">Match Format:</span>
                  <span>Played over 5 high-stakes rounds. The team with the highest cumulative points wins!</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'signals' && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-gold-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-gold-400" />
                Partner Support Signals
              </h3>
              <p>
                Before placing bids, partners can communicate their hand shape through standard signals:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                <div className="bg-rose-950/40 border border-rose-500/50 p-3 rounded-xl">
                  <div className="font-bold text-rose-300 mb-1">♠/♥ MAJOR</div>
                  <p className="text-[11px] text-slate-300">
                    Indicates high cards (Aces/Kings) or great length (5+ cards) in Spades or Hearts.
                  </p>
                </div>
                <div className="bg-sky-950/40 border border-sky-500/50 p-3 rounded-xl">
                  <div className="font-bold text-sky-300 mb-1">♣/♦ MINOR</div>
                  <p className="text-[11px] text-slate-300">
                    Indicates strength in Clubs or Diamonds, guiding partner toward minor trump contracts.
                  </p>
                </div>
                <div className="bg-slate-800 border border-slate-700 p-3 rounded-xl">
                  <div className="font-bold text-slate-300 mb-1">✋ PASS</div>
                  <p className="text-[11px] text-slate-300">
                    Indicates a flat or low-honor hand. Signals partner to be cautious when bidding.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'bidding' && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-gold-300 flex items-center gap-1.5">
                <Gavel className="w-4 h-4 text-gold-400" />
                Auction Ladder & Dummy Hand
              </h3>
              <p>
                Bidding represents the minimum number of tricks your partnership commits to win.
              </p>
              <div className="space-y-2.5 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80">
                <div>
                  <strong className="text-gold-300">Auction Ladder:</strong> The allowed bids are <strong>8, 10, 11, 12, 13</strong>.
                  <ul className="list-disc list-inside mt-1 space-y-1 text-slate-300 text-xs">
                    <li><strong className="text-amber-300">Bid 8:</strong> Strictly exclusive to the opening bidder (the player immediately next to the dealer).</li>
                    <li><strong className="text-slate-200">Bids 10+:</strong> All players following the opening bidder can only call strictly above 8 (10, 11, 12, 13), each higher than the previous highest bid.</li>
                  </ul>
                </div>
                <div className="p-2.5 bg-gold-950/30 border border-gold-500/40 rounded-lg">
                  <strong className="text-amber-300 flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Bid 10+ Dummy Hand Reveal:
                  </strong>
                  <span className="text-[11px] block mt-1">
                    When a bid of 10 or higher wins the auction, the partner’s cards are kept private during bidding and only revealed face-up as a <strong>Dummy hand</strong> once the bidder selects a trump suit. The bidder then controls both hands!
                  </span>
                </div>
                <div className="p-2.5 bg-rose-950/30 border border-rose-500/40 rounded-lg">
                  <strong className="text-rose-400 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5" />
                    Bid 13 (Slam):
                  </strong>
                  <span className="text-[11px] block mt-1">
                    An all-or-nothing bid! Win all 13 tricks to claim an instant match victory (+13 pts), or fail even 1 trick for instant defeat (-26 pts).
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'tram' && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-gold-300 flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-gold-400" />
                TRAM: The Rest Are Mine!
              </h3>
              <p>
                If at any point during trick-play you hold only guaranteed master cards that cannot be beaten by any opponent, you can hit the golden <strong>Claim TRAM</strong> button!
              </p>
              <div className="bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80 space-y-2 text-xs">
                <p>
                  • The engine verifies whether remaining opponent trumps or high cards can stop any of your cards.
                </p>
                <p>
                  • If verified, all remaining tricks in the round are immediately swept and awarded to your team!
                </p>
              </div>
            </div>
          )}

          {activeTab === 'scoring' && (
            <div className="space-y-3">
              <h3 className="text-base font-bold text-gold-300 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-gold-400" />
                Authentic Surri Dealing & 52-Point Knockout
              </h3>
              <p>
                In Surri, the dealer is said to be <strong>dealing at x</strong>, where <strong>x</strong> represents their team's current score:
              </p>
              <div className="space-y-2 bg-slate-800/60 p-3.5 rounded-xl border border-slate-700/80 text-xs">
                <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-lg">
                  <strong className="text-amber-300">1. Initial Deal:</strong>
                  <p className="mt-0.5 text-slate-300">The dealer begins the match dealing at <strong>x = 0</strong>.</p>
                </div>

                <div className="p-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-lg">
                  <strong className="text-emerald-300">2. Dealer Makes Bid n (Dealing at x):</strong>
                  <p className="mt-0.5 text-slate-300">
                    The dealer passes the deal clockwise to the next player! The next player will deal at <strong>(n - x)</strong>.
                  </p>
                </div>

                <div className="p-2.5 bg-rose-950/40 border border-rose-500/40 rounded-lg">
                  <strong className="text-rose-300">3. Dealer Bids n and Fails:</strong>
                  <p className="mt-0.5 text-slate-300">
                    The dealer retains the deal and deals again under penalty at <strong>(current score + 2n)</strong>.
                  </p>
                </div>

                <div className="p-2.5 bg-amber-950/40 border border-amber-500/40 rounded-lg">
                  <strong className="text-amber-300">4. Non-Dealing Team Wins the Bid of n:</strong>
                  <p className="mt-0.5 text-slate-300">
                    • If non-dealing team <strong>makes</strong> n: dealer retains the deal at <strong>(current score + n)</strong>.
                    <br />
                    • If non-dealing team <strong>loses</strong> (fails): dealer retains the deal at <strong>(current score - 2n)</strong>.
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-700 text-gold-300 font-bold flex items-center gap-1">
                  <Award className="w-4 h-4 text-gold-400" />
                  5. Match Victory: A team wins the match as soon as the opposing team crosses 52 points (&gt; 52)!
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gold-500 hover:bg-gold-400 text-slate-950 font-bold text-xs px-5 py-2 rounded-xl transition-colors shadow"
          >
            Got it, Let's Play!
          </button>
        </div>
      </div>
    </div>
  );
};

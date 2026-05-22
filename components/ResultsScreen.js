'use client';
import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import { db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

const FINAL_VERDICTS = [
  { min: 90, max: 100, expr: 'happy', text: '...I suppose you might actually get the job. Do not tell anyone I said that. Seriously, that was unexpectedly impressive.' },
  { min: 75, max: 89, expr: 'encouraging', text: 'Better than I expected. The bar was low, but you cleared it. Keep this up and you might actually be employable.' },
  { min: 60, max: 74, expr: 'encouraging', text: 'Mediocre. But there is something to work with. Barely. Go study the weak areas and come back when you are ready.' },
  { min: 0, max: 59, expr: 'stern', text: 'We have a lot of work to do. Start with the basics. Read, practice, and try again. I will be here — unfortunately.' },
];

export default function ResultsScreen({ results, onRetry, onChangeRole }) {
  const { setMayaExpression, setMayaSpeech } = useStore();
  const [isSaved, setIsSaved] = useState(false);

  const validScores = results.scores.filter(s => s > 0);
  const totalScore = validScores.length > 0 ? Math.round(validScores.reduce((a, b) => a + b, 0) / results.scores.length) : 0;

  useEffect(() => {
    const verdict = FINAL_VERDICTS.find(v => totalScore >= v.min && totalScore <= v.max) || FINAL_VERDICTS[FINAL_VERDICTS.length - 1];
    setMayaExpression(verdict.expr);
    setMayaSpeech(verdict.text);

    // Save to Firestore
    if (!isSaved) {
      addDoc(collection(db, 'InterviewSessions'), {
        config: results.config,
        totalScore,
        createdAt: serverTimestamp(),
        details: results.questions.map((q, i) => ({
          question: q.question,
          category: q.category,
          score: results.scores[i],
          verdict: results.feedbacks[i]?.verdict,
          strengths: results.feedbacks[i]?.strengths || [],
          gaps: results.feedbacks[i]?.gaps || []
        }))
      }).catch(err => console.error("Failed to save to Firestore:", err));
      setIsSaved(true);
    }
  }, []);

  const allStrengths = [...new Set(results.feedbacks.flatMap(f => f?.strengths || []))].slice(0, 3);
  const allGaps = [...new Set(results.feedbacks.flatMap(f => f?.gaps || []))].slice(0, 3);

  return (
    <div className="w-full max-w-5xl mx-auto text-white animate-fade-in pt-8">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
        
        {/* Top Section */}
        <div className="flex flex-col md:flex-row items-center gap-8 mb-12">
          {/* Score Circle */}
          <div className="relative w-48 h-48 flex-shrink-0">
            <svg viewBox="0 0 200 200" className="w-full h-full transform -rotate-90">
              <defs>
                <linearGradient id="score-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7B2FF7"/>
                  <stop offset="100%" stopColor="#FF2E93"/>
                </linearGradient>
              </defs>
              <circle cx="100" cy="100" r="85" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
              <circle 
                cx="100" cy="100" r="85" fill="none" 
                stroke="url(#score-gradient)" strokeWidth="12" strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 85}
                strokeDashoffset={(2 * Math.PI * 85) - (totalScore / 100) * (2 * Math.PI * 85)}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-br from-purple-400 to-pink-400">{totalScore}</span>
              <span className="text-sm text-gray-400 mt-1 uppercase tracking-wider">Final Score</span>
            </div>
          </div>

          {/* Aggregate Feedback */}
          <div className="flex-1 space-y-6">
            <h2 className="text-2xl font-bold">Interview Analysis</h2>
            
            <div className="space-y-3">
              <h3 className="text-sm uppercase tracking-wider text-green-400 font-bold">Top Strengths</h3>
              <div className="flex flex-wrap gap-2">
                {allStrengths.length > 0 ? allStrengths.map((s, i) => (
                  <span key={i} className="px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-300 rounded-full text-sm">{s}</span>
                )) : <span className="text-gray-500 text-sm italic">None identified</span>}
              </div>
            </div>
            
            <div className="space-y-3">
              <h3 className="text-sm uppercase tracking-wider text-red-400 font-bold">Areas to Improve</h3>
              <div className="flex flex-wrap gap-2">
                {allGaps.length > 0 ? allGaps.map((g, i) => (
                  <span key={i} className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-300 rounded-full text-sm">{g}</span>
                )) : <span className="text-gray-500 text-sm italic">None identified</span>}
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-white/5 uppercase text-gray-400 text-xs">
              <tr>
                <th className="px-4 py-3 rounded-tl-lg">Q#</th>
                <th className="px-4 py-3">Question</th>
                <th className="px-4 py-3">Score</th>
                <th className="px-4 py-3 rounded-tr-lg">Verdict</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {results.questions.map((q, i) => (
                <tr key={i} className="hover:bg-white/5 transition-colors">
                  <td className="px-4 py-4 text-gray-400 font-mono">{i + 1}</td>
                  <td className="px-4 py-4 pr-8 text-gray-200">{q.question}</td>
                  <td className="px-4 py-4">
                    <span className={\`font-bold px-2 py-1 rounded \${results.scores[i] >= 80 ? 'bg-green-500/20 text-green-400' : results.scores[i] >= 60 ? 'bg-amber-500/20 text-amber-400' : 'bg-red-500/20 text-red-400'}\`}>
                      {results.scores[i] || 0}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-gray-300">{results.feedbacks[i]?.verdict || 'Skipped'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4 pt-6 border-t border-white/10">
          <button onClick={onRetry} className="flex-1 bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg">Try Same Scenario</button>
          <button onClick={onChangeRole} className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all border border-white/20">Change Role</button>
        </div>
      </div>
    </div>
  );
}

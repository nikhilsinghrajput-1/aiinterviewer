'use client';
import { useState } from 'react';
import Maya from '@/components/Maya';
import SetupScreen from '@/components/SetupScreen';
import InterviewScreen from '@/components/InterviewScreen';
import ResultsScreen from '@/components/ResultsScreen';
import { useStore } from '@/lib/store';

export default function Home() {
  const [screen, setScreen] = useState('setup'); // setup, interview, results
  const [results, setResults] = useState(null);
  const [config, setConfig] = useState(null);
  
  const { mayaExpression, mayaSpeech } = useStore();

  const handleStart = (cfg) => {
    setConfig(cfg);
    setScreen('interview');
  };

  const handleComplete = (res) => {
    setResults(res);
    setScreen('results');
  };

  const handleRetry = () => {
    setScreen('interview');
  };

  const handleChangeRole = () => {
    setScreen('setup');
  };

  return (
    <main className="min-h-screen bg-[#0F0E17] font-sans selection:bg-pink-500/30 overflow-x-hidden pb-12">
      {/* Dynamic Background */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-purple-600/20 blur-[120px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-pink-600/20 blur-[120px] mix-blend-screen" />
      </div>

      {/* Header */}
      <header className="relative z-10 w-full p-6 flex justify-center">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 px-6 py-2 rounded-full shadow-lg flex items-center space-x-3">
          <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.7)]" />
          <h1 className="text-white font-bold tracking-widest uppercase text-sm">AI Interview Coach</h1>
        </div>
      </header>

      {/* Maya Container */}
      <div className="relative z-20 w-full mt-4">
        <Maya expression={mayaExpression} speechText={mayaSpeech} />
      </div>

      {/* Screens */}
      <div className="relative z-10 w-full px-4">
        {screen === 'setup' && <SetupScreen onStart={handleStart} />}
        {screen === 'interview' && <InterviewScreen config={config} onComplete={handleComplete} />}
        {screen === 'results' && <ResultsScreen results={results} onRetry={handleRetry} onChangeRole={handleChangeRole} />}
      </div>
    </main>
  );
}

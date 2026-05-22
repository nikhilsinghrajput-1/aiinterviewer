'use client';
import { useState, useEffect, useRef } from 'react';
import { useStore } from '@/lib/store';

export default function InterviewScreen({ config, onComplete }) {
  const { setMayaExpression, setMayaSpeech } = useStore();
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(90);
  const [answer, setAnswer] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [hintUsed, setHintUsed] = useState(false);
  const [resultsState, setResultsState] = useState({ scores: [], feedbacks: [], answers: [] });
  const [isSpeechReady, setIsSpeechReady] = useState(false);

  useEffect(() => {
    // Initialize speech synthesis
    if ('speechSynthesis' in window) {
      setIsSpeechReady(true);
    }
    
    // Load questions
    setMayaExpression('thinking');
    setMayaSpeech('Generating your questions... do not get comfortable.');
    
    fetch('/api/generate-questions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config)
    })
    .then(r => r.json())
    .then(data => {
      setQuestions(data.questions);
      setMayaExpression('idle');
      presentQuestion(data.questions[0]);
    })
    .catch(err => {
      setMayaExpression('stern');
      setMayaSpeech('Something went wrong. Even the AI could not handle this. Try again.');
    });
  }, []);

  const speak = (text) => {
    if (!isSpeechReady) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    const voices = window.speechSynthesis.getVoices();
    const voice = voices.find(v => v.name.includes('Zira') || v.name.includes('Female')) || voices[0];
    if (voice) utterance.voice = voice;
    utterance.rate = 0.95;
    utterance.pitch = 1.05;
    
    setMayaExpression('talking');
    utterance.onend = () => setMayaExpression('idle');
    window.speechSynthesis.speak(utterance);
  };

  const presentQuestion = (q) => {
    setHintUsed(false);
    setAnswer('');
    setTimeLeft(90);
    setMayaSpeech(q.question);
    speak(q.question);
  };

  useEffect(() => {
    if (questions.length === 0 || isEvaluating || feedback) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          handleSubmit(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [questions, isEvaluating, feedback]);

  const handleSubmit = async (autoSubmit = false) => {
    if (!autoSubmit && answer.length < 5) {
      setMayaExpression('stern');
      setMayaSpeech('That is not an answer. That is barely a thought.');
      setTimeout(() => setMayaExpression('idle'), 2000);
      return;
    }
    
    setIsEvaluating(true);
    setMayaExpression('thinking');
    setMayaSpeech('Evaluating... try not to look nervous.');

    try {
      const q = questions[currentIndex];
      const res = await fetch('/api/evaluate-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: q.question, answer, role: config.role, experienceLevel: config.experienceLevel, category: q.category })
      });
      const data = await res.json();
      
      setResultsState(prev => ({
        scores: [...prev.scores, data.score],
        feedbacks: [...prev.feedbacks, data],
        answers: [...prev.answers, answer]
      }));

      setFeedback(data);
      if (data.score >= 80) setMayaExpression('happy');
      else if (data.score >= 55) setMayaExpression('encouraging');
      else setMayaExpression('stern');
      
      setMayaSpeech(data.mayaReaction);
      speak(data.mayaReaction);
      
    } catch (err) {
      setMayaExpression('stern');
      setMayaSpeech('The evaluation failed. Try submitting again.');
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleNext = () => {
    setFeedback(null);
    if (currentIndex + 1 >= questions.length) {
      onComplete({ ...resultsState, questions, config });
    } else {
      setCurrentIndex(prev => prev + 1);
      presentQuestion(questions[currentIndex + 1]);
    }
  };

  const handleHint = () => {
    setHintUsed(true);
    setMayaExpression('thinking');
    setMayaSpeech('I will give you this one. Just this once.');
    setTimeout(() => setMayaExpression('idle'), 2500);
  };

  if (questions.length === 0) return <div className="text-center text-white mt-20">Loading questions...</div>;

  const currentQ = questions[currentIndex];

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-6 text-white pt-8">
      {/* Question Panel */}
      <div className="md:col-span-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl flex flex-col h-[600px]">
        <div className="flex justify-between items-center mb-6 border-b border-white/10 pb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-purple-400">Question {currentIndex + 1} of {questions.length}</span>
            <div className="mt-1 h-1 w-full bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all" style={{ width: \`\${((currentIndex) / questions.length) * 100}%\` }}></div>
            </div>
          </div>
          <div className={\`flex items-center space-x-2 text-xl font-mono px-4 py-1 rounded-full \${timeLeft <= 15 ? 'bg-red-500/20 text-red-400' : 'bg-white/10 text-gray-300'}\`}>
            <span>{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
          </div>
        </div>
        
        <h2 className="text-2xl font-medium mb-4 text-white leading-relaxed flex-1">
          {currentQ.question}
        </h2>
        
        {hintUsed && !feedback && (
          <div className="mb-4 bg-purple-900/40 border border-purple-500/30 p-4 rounded-xl text-purple-200 text-sm">
            <span className="font-bold mr-2">Hint:</span>{currentQ.hint}
          </div>
        )}

        {/* Answer Area */}
        <div className="relative mt-auto">
          <textarea 
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            disabled={isEvaluating || feedback}
            placeholder="Type your answer here as if you were speaking..." 
            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white h-40 focus:ring-2 focus:ring-purple-500 outline-none transition-all placeholder:text-gray-600 resize-none"
          />
          <div className="absolute bottom-3 right-4 text-xs text-gray-500">{answer.length} chars</div>
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center mt-6">
          <div className="space-x-3">
            <button disabled={hintUsed || isEvaluating || feedback} onClick={handleHint} className="px-4 py-2 rounded-xl text-sm font-medium border border-white/10 text-gray-300 hover:bg-white/10 disabled:opacity-50 transition-colors">Get Hint</button>
            <button disabled={isEvaluating || feedback} onClick={() => handleSubmit(true)} className="px-4 py-2 rounded-xl text-sm font-medium border border-white/10 text-red-400 hover:bg-red-500/10 disabled:opacity-50 transition-colors">Skip</button>
          </div>
          <button disabled={isEvaluating || feedback || answer.length < 5} onClick={() => handleSubmit(false)} className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-bold py-2 px-8 rounded-xl shadow-lg disabled:opacity-50 transition-all">
            {isEvaluating ? 'Evaluating...' : 'Submit Answer'}
          </button>
        </div>
      </div>

      {/* Side Panel (Feedback) */}
      <div className="md:col-span-4 flex flex-col space-y-6">
        {feedback && (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl animate-fade-in flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <div className={\`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold shadow-lg \${feedback.score >= 80 ? 'bg-green-500/20 text-green-400 border border-green-500/30' : feedback.score >= 60 ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'}\`}>
                {feedback.score}
              </div>
              <div>
                <div className="text-sm text-gray-400">Score</div>
                <div className="font-bold text-lg text-white">{feedback.verdict}</div>
              </div>
            </div>
            
            <div className="space-y-4 text-sm mt-6">
              {feedback.strengths?.length > 0 && (
                <div>
                  <h4 className="font-bold text-green-400 mb-2 flex items-center"><span className="mr-2">✓</span> Strengths</h4>
                  <ul className="list-disc pl-5 text-gray-300 space-y-1">
                    {feedback.strengths.map((s, i) => <li key={i}>{s}</li>)}
                  </ul>
                </div>
              )}
              {feedback.gaps?.length > 0 && (
                <div>
                  <h4 className="font-bold text-red-400 mb-2 flex items-center"><span className="mr-2">✗</span> Gaps</h4>
                  <ul className="list-disc pl-5 text-gray-300 space-y-1">
                    {feedback.gaps.map((g, i) => <li key={i}>{g}</li>)}
                  </ul>
                </div>
              )}
            </div>
            
            <button onClick={handleNext} className="w-full mt-8 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all border border-white/20">
              Next Question →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

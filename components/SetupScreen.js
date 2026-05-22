'use client';
import { useState, useEffect } from 'react';
import { useStore } from '@/lib/store';

export default function SetupScreen({ onStart }) {
  const [role, setRole] = useState('');
  const [resume, setResume] = useState('');
  const [type, setType] = useState(null);
  const [level, setLevel] = useState(null);
  
  const { setMayaExpression, setMayaSpeech } = useStore();

  const isFormValid = role.length > 2 && resume.length > 10 && type && level;

  useEffect(() => {
    setMayaSpeech('Are you going to fill that in or just stare at it?');
  }, []);

  const handleRoleChange = (e) => {
    setRole(e.target.value);
    if (e.target.value.length > 3) {
      setMayaExpression('encouraging');
      setMayaSpeech(`Hmm. ${e.target.value}. We will see about that.`);
      setTimeout(() => setMayaExpression('idle'), 2500);
    }
  };

  const handleSubmit = () => {
    if (isFormValid) {
      setMayaExpression('stern');
      setMayaSpeech('Good. Do not embarrass yourself.');
      setTimeout(() => setMayaExpression('idle'), 2000);
      onStart({ role, resume, interviewType: type, experienceLevel: level });
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6 animate-fade-in text-white pt-8">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
        <h1 className="text-3xl font-bold mb-2">Configure Interview</h1>
        <p className="text-gray-400 mb-8">Set up your mock interview scenario.</p>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Target Role</label>
            <input 
              type="text" 
              value={role}
              onChange={handleRoleChange}
              placeholder="e.g. Senior Frontend Engineer" 
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Experience Level</label>
            <div className="flex flex-wrap gap-2">
              {['Intern', 'Junior', 'Mid-Level', 'Senior', 'Lead'].map(l => (
                <button 
                  key={l}
                  onClick={() => setLevel(l)}
                  className={`px-4 py-2 rounded-full border text-sm transition-all ${level === l ? 'bg-purple-600 border-purple-500 text-white shadow-[0_0_15px_rgba(123,47,247,0.4)]' : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Interview Type</label>
            <div className="flex flex-wrap gap-2">
              {['Technical', 'Behavioral', 'System Design', 'Mixed'].map(t => (
                <button 
                  key={t}
                  onClick={() => setType(t)}
                  className={`px-4 py-2 rounded-full border text-sm transition-all ${type === t ? 'bg-pink-600 border-pink-500 text-white shadow-[0_0_15px_rgba(255,46,147,0.4)]' : 'border-white/10 text-gray-400 hover:bg-white/5 hover:text-white'}`}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-gray-300">Paste Resume / Background</label>
            <textarea 
              value={resume}
              onChange={(e) => setResume(e.target.value)}
              placeholder="Paste your resume or list your key skills here..." 
              className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white h-32 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all placeholder:text-gray-600 resize-none"
            ></textarea>
          </div>

          <button 
            disabled={!isFormValid}
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white font-bold py-4 rounded-xl shadow-lg transition-all transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            Start Interview
          </button>
        </div>
      </div>
    </div>
  );
}

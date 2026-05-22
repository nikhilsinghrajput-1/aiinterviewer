'use client';
import { useEffect, useRef, useState } from 'react';

const EXPRESSIONS = ['idle', 'talking', 'thinking', 'happy', 'stern', 'encouraging'];

export default function Maya({ expression = 'idle', speechText = '' }) {
  const containerRef = useRef(null);
  const [blinkActive, setBlinkActive] = useState(false);

  useEffect(() => {
    // Blinking logic
    let blinkTimeout;
    const blink = () => {
      if (expression !== 'talking' && expression !== 'thinking') {
        setBlinkActive(true);
        setTimeout(() => setBlinkActive(false), 200);
      }
      blinkTimeout = setTimeout(blink, 2500 + Math.random() * 3000);
    };
    blinkTimeout = setTimeout(blink, 2000);
    return () => clearTimeout(blinkTimeout);
  }, [expression]);

  return (
    <div className={`relative w-48 md:w-64 mx-auto flex flex-col items-center maya-container maya--${expression} ${expression === 'happy' ? 'maya--happy-bounce' : ''}`} ref={containerRef}>
      
      {/* Speech Bubble */}
      {speechText && (
        <div className="absolute bottom-[80%] left-1/2 md:left-full mb-4 md:mb-0 md:ml-4 bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl rounded-bl-sm w-64 shadow-xl z-10 -translate-x-1/2 md:translate-x-0 transition-opacity duration-300">
          <p className="text-sm font-medium text-white">{speechText}</p>
        </div>
      )}

      {/* SVG Character */}
      <svg viewBox="0 0 300 480" role="img" className="w-full h-auto filter drop-shadow-2xl">
        <title>Maya — Interview Coach</title>
        <g className="maya-body-group">
          <path d="M 90,305 C 65,312 38,345 28,400 L 28,480 L 272,480 L 272,400 C 262,345 235,312 210,305 L 200,300 L 100,300 Z" fill="#3D1F6D"/>
          <ellipse cx="78" cy="350" rx="32" ry="45" fill="#3D1F6D"/>
          <ellipse cx="222" cy="350" rx="32" ry="45" fill="#3D1F6D"/>
          <path d="M 115,298 C 115,288 135,283 150,283 C 165,283 185,288 185,298 L 190,318 C 190,326 172,332 150,332 C 128,332 110,326 110,318 Z" fill="#4A2570"/>
          <line x1="150" y1="332" x2="150" y2="480" stroke="#332066" strokeWidth="2" opacity="0.5"/>
          <line x1="143" y1="318" x2="140" y2="365" stroke="#5B2D8E" strokeWidth="2" strokeLinecap="round"/>
          <line x1="157" y1="318" x2="160" y2="365" stroke="#5B2D8E" strokeWidth="2" strokeLinecap="round"/>
          <circle cx="140" cy="367" r="3" fill="#5B2D8E"/>
          <circle cx="160" cy="367" r="3" fill="#5B2D8E"/>
        </g>
        <rect x="137" y="278" width="26" height="28" rx="8" fill="#FFCCAA"/>
        <g className="maya-hair-back">
          <path d="M 88,175 C 82,140 100,80 150,68 C 200,80 218,140 212,175 L 218,290 L 225,320 L 75,320 L 82,290 Z" fill="#5B2D8E"/>
          <path d="M 82,200 C 72,230 70,270 75,320 L 88,320 L 88,200 Z" fill="#4A2570"/>
          <path d="M 218,200 C 228,230 230,270 225,320 L 212,320 L 212,200 Z" fill="#4A2570"/>
        </g>
        <g id="maya-head">
          <ellipse cx="150" cy="205" rx="62" ry="72" fill="#FFCCAA"/>
          <ellipse cx="90" cy="210" rx="8" ry="14" fill="#F5C099"/>
          <ellipse cx="210" cy="210" rx="8" ry="14" fill="#F5C099"/>
          <circle cx="112" cy="228" r="14" fill="#FFB5A0" opacity="0.25"/>
          <circle cx="188" cy="228" r="14" fill="#FFB5A0" opacity="0.25"/>
          <path d="M 148,222 Q 150,228 152,222" fill="none" stroke="#E8AD8C" strokeWidth="2" strokeLinecap="round"/>
          <g className="maya-eyes" id="maya-eyes">
            <g className="maya-eye maya-eye-left" id="maya-eye-left">
              <ellipse className="eye-white" cx="130" cy="205" rx="17" ry="14" fill="white"/>
              <g className="eye-pupil-group" id="pupil-group-left">
                <circle className="eye-iris" cx="130" cy="207" r="9" fill="#2D1B4E"/>
                <circle className="eye-pupil" cx="130" cy="206" r="4.5" fill="#1A0F2E"/>
                <circle className="eye-highlight" cx="126" cy="202" r="3" fill="white" opacity="0.85"/>
              </g>
              <ellipse className={`eyelid-upper ${blinkActive ? 'blink-active' : ''}`} cx="130" cy="198" rx="19" ry="11" fill="#FFCCAA"/>
            </g>
            <g className="maya-eye maya-eye-right" id="maya-eye-right">
              <ellipse className="eye-white" cx="170" cy="205" rx="17" ry="14" fill="white"/>
              <g className="eye-pupil-group" id="pupil-group-right">
                <circle className="eye-iris" cx="170" cy="207" r="9" fill="#2D1B4E"/>
                <circle className="eye-pupil" cx="170" cy="206" r="4.5" fill="#1A0F2E"/>
                <circle className="eye-highlight" cx="166" cy="202" r="3" fill="white" opacity="0.85"/>
              </g>
              <ellipse className={`eyelid-upper ${blinkActive ? 'blink-active' : ''}`} cx="170" cy="198" rx="19" ry="11" fill="#FFCCAA"/>
            </g>
          </g>
          <g className="maya-eyebrows" id="maya-eyebrows">
            <rect className="maya-brow" id="brow-left" x="114" y="183" width="26" height="5" rx="2.5" fill="#4A2570"/>
            <rect className="maya-brow" id="brow-right" x="160" y="183" width="26" height="5" rx="2.5" fill="#4A2570"/>
          </g>
          <g className="maya-mouths" id="maya-mouths">
            <path className="mouth mouth-neutral" d="M 140,245 Q 150,240 160,245" fill="none" stroke="#CC8877" strokeWidth="2.5" strokeLinecap="round"/>
            <path className="mouth mouth-frown" d="M 136,248 Q 150,238 164,248" fill="none" stroke="#CC8877" strokeWidth="3" strokeLinecap="round"/>
            <path className="mouth mouth-smile" d="M 135,242 Q 150,256 165,242" fill="none" stroke="#CC8877" strokeWidth="2.5" strokeLinecap="round"/>
            <ellipse className="mouth mouth-open" cx="150" cy="245" rx="10" ry="7" fill="#8B4557"/>
            <path className="mouth mouth-small-open" d="M 143,242 Q 150,250 157,242 Z" fill="#8B4557"/>
          </g>
          <g className="maya-hair-front">
            <path d="M 82,178 C 82,135 105,88 150,75 C 175,80 192,100 200,130 L 190,158 L 178,132 L 168,162 L 155,128 L 142,160 L 130,130 L 118,158 L 108,135 L 98,165 Z" fill="#5B2D8E"/>
            <path d="M 190,158 C 198,128 208,120 215,145 L 210,175 L 200,162 Z" fill="#4A2570"/>
            <path d="M 120,110 C 133,95 145,88 155,82 L 152,100 C 143,97 132,102 126,115 Z" fill="#6B3D9E" opacity="0.4"/>
          </g>
        </g>
      </svg>
    </div>
  );
}

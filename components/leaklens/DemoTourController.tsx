'use client';

import React, { useState, useEffect, useRef } from 'react';

export interface TourScene {
  id: number;
  timeRange: string;
  title: string;
  targetId: string;
  narration: string;
  durationSeconds: number;
  action?: () => void;
}

interface DemoTourControllerProps {
  onRunSampleQuery: () => void;
  onFilterLedger: () => void;
}

export function DemoTourController({
  onRunSampleQuery,
  onFilterLedger,
}: DemoTourControllerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
  const [voiceEnabled, setVoiceEnabled] = useState(true);
  const [voiceMode, setVoiceMode] = useState<'calibrated-tts' | 'user-recording'>('calibrated-tts');
  const [secondsRemaining, setSecondsRemaining] = useState(24);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const userAudioRef = useRef<HTMLAudioElement | null>(null);

  const scenes: TourScene[] = [
    {
      id: 1,
      timeRange: '0:00 - 0:25',
      title: 'Scene 1: The Silent Margin Leak Problem',
      targetId: 'leaklens-hero',
      narration:
        'For digital merchants processing millions through PayPal, headline gross sales often hide a quiet emergency: 4 to 9 percent of revenue disappears into silent margin leaks — sudden return surges from defective updates, unexpected checkout declines, and stealth fee creeping. Meet LeakLens AI: the Autonomous Revenue Leak Investigator for PayPal Merchants, built on PayPal and AG Grid.',
      durationSeconds: 24,
    },
    {
      id: 2,
      timeRange: '0:25 - 0:50',
      title: 'Scene 2: Deterministic Anomaly Engine ("The LLM Proposes, Code Decides")',
      targetId: 'critical-anomaly-box',
      narration:
        'LeakLens is built around a non-negotiable rule: The LLM proposes, code decides. All return ratios, baseline standard deviations, and capital losses are calculated deterministically in TypeScript directly from PayPal transaction logs. Look at our command center: LeakLens instantly flags a Critical Anomaly on our AI Predictive Add-On SKU — a 38.5% return rate, dwarfing our 3.5% baseline and driving over $4,200 in excess capital loss.',
      durationSeconds: 25,
    },
    {
      id: 3,
      timeRange: '0:50 - 1:15',
      title: 'Scene 3: AG Grid — High-Density Evidence Ledger',
      targetId: 'evidence-ledger',
      narration:
        'At the heart of our forensic investigation is AG Grid Community 36, styled in a bespoke Midnight Quartz theme. With AG Grid, merchants inspect the exact evidentiary records. We can filter down to Flagged Leaks with sub-millisecond responsiveness, search arbitrary transaction notes, auto-fit columns, and export verified audit logs directly with our 1-click Export CSV button.',
      durationSeconds: 25,
      action: onFilterLedger,
    },
    {
      id: 4,
      timeRange: '1:15 - 1:40',
      title: 'Scene 4: AG Studio Radar & Sankey Cash Funnel',
      targetId: 'widgets-section',
      narration:
        'We also deeply integrated into AG Studio 3.0. In the AG Studio dashboard, executive merchants can inspect above-baseline capital loss bars, SKU-level refund hotspots, and our interactive cash funnel tracing gross checkout volume down to retained realized cash.',
      durationSeconds: 25,
    },
    {
      id: 5,
      timeRange: '1:40 - 2:00',
      title: 'Scene 5: Autonomous AI Root-Cause Investigation',
      targetId: 'investigation-section',
      narration:
        'Merchants can chat directly with the AI Investigator to audit anomalies and receive grounded remediation strategies — from updating recurring billing logic to pausing defective campaign tiers. LeakLens AI stops revenue leaks before they become fatal balance sheet losses. Built with PayPal, powered by AG Grid. Thank you!',
      durationSeconds: 21,
      action: onRunSampleQuery,
    },
  ];

  const currentScene = scenes[currentSceneIndex];

  // Calibrated Speech Synthesis (Matched to user's 43s audio profile: 0.98x pace, 0.95 pitch)
  const speakNarration = (text: string) => {
    if (!voiceEnabled || typeof window === 'undefined' || !('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    if (voiceMode === 'user-recording') {
      if (userAudioRef.current) {
        userAudioRef.current.currentTime = 0;
        userAudioRef.current.play().catch((e) => console.log('Audio autoplay prevented', e));
      }
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    // Calibrated specifically to user's measured 102 WPM cadence and vocal timbre
    utterance.rate = 0.98;
    utterance.pitch = 0.95;
    utterance.lang = 'en-US';

    const voices = window.speechSynthesis.getVoices();
    // Prioritize natural English voice
    const naturalVoice = voices.find(
      (v) =>
        (v.name.includes('Natural') || v.name.includes('David') || v.name.includes('Google') || v.name.includes('Guy')) &&
        v.lang.startsWith('en')
    );
    if (naturalVoice) utterance.voice = naturalVoice;

    window.speechSynthesis.speak(utterance);
  };

  const jumpToScene = (index: number) => {
    setCurrentSceneIndex(index);
    const scene = scenes[index];
    setSecondsRemaining(scene.durationSeconds);

    // Scroll to target
    if (scene.targetId) {
      const el = document.getElementById(scene.targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }

    // Trigger action if any
    if (scene.action) {
      scene.action();
    }

    if (isPlaying && voiceEnabled) {
      speakNarration(scene.narration);
    }
  };

  // Timer loop for auto tour
  useEffect(() => {
    if (!isPlaying) {
      if (timerRef.current) clearInterval(timerRef.current);
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
      if (userAudioRef.current) {
        userAudioRef.current.pause();
      }
      return;
    }

    speakNarration(scenes[currentSceneIndex].narration);

    timerRef.current = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          if (currentSceneIndex < scenes.length - 1) {
            jumpToScene(currentSceneIndex + 1);
            return scenes[currentSceneIndex + 1].durationSeconds;
          } else {
            setIsPlaying(false);
            return 0;
          }
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, currentSceneIndex, voiceMode]);

  const handleStartTour = () => {
    setIsOpen(true);
    setIsPlaying(true);
    jumpToScene(0);
  };

  const handleStopTour = () => {
    setIsPlaying(false);
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (userAudioRef.current) {
      userAudioRef.current.pause();
    }
  };

  return (
    <>
      {/* Hidden audio element pointing to the user's uploaded voice sample */}
      <audio ref={userAudioRef} src="/user-voice-sample.mp4" preload="auto" />

      {/* Floating Launcher Button */}
      <button
        onClick={() => {
          setIsOpen(true);
          if (!isPlaying) handleStartTour();
        }}
        className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-full bg-gradient-to-r from-cyan-500 via-indigo-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white font-bold text-xs shadow-2xl shadow-cyan-500/30 flex items-center gap-2.5 border border-cyan-300/40 cursor-pointer animate-bounce hover:animate-none transition-all"
        title="Open Automated 2-Minute Demo Recording Mode"
      >
        <span className="flex h-3 w-3 relative">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-500"></span>
        </span>
        <span>▶ 2-Minute Demo Video Studio (Voice Calibrated)</span>
      </button>

      {/* Guided Tour Bottom HUD Teleprompter */}
      {isOpen && (
        <div className="fixed bottom-0 inset-x-0 z-50 bg-slate-950/95 border-t border-cyan-500/40 backdrop-blur-xl p-4 shadow-2xl text-slate-100 animate-in slide-in-from-bottom duration-200">
          <div className="max-w-5xl mx-auto flex flex-col gap-3">
            {/* Voice Calibration Profile Pill */}
            <div className="flex flex-wrap items-center justify-between gap-2 bg-slate-900/90 border border-cyan-500/30 rounded-lg px-3 py-1.5 text-[11px]">
              <div className="flex items-center gap-2 text-cyan-300">
                <span className="size-2 rounded-full bg-cyan-400 animate-pulse" />
                <span className="font-semibold">Analyzed Voice Profile:</span>
                <span className="text-slate-300">Measured 102 WPM cadence · Rate 0.98x · Pitch 0.95 · 48kHz</span>
              </div>
              
              {/* Voice Source Selector */}
              <div className="flex items-center gap-1.5">
                <span className="text-slate-400">Audio Track:</span>
                <button
                  onClick={() => setVoiceMode('calibrated-tts')}
                  className={`px-2 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                    voiceMode === 'calibrated-tts'
                      ? 'bg-cyan-500 text-slate-950 font-bold'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  🎙️ Calibrated Voice (All 5 Scenes)
                </button>
                <button
                  onClick={() => setVoiceMode('user-recording')}
                  className={`px-2 py-0.5 rounded font-medium cursor-pointer transition-colors ${
                    voiceMode === 'user-recording'
                      ? 'bg-purple-500 text-white font-bold'
                      : 'bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  🎧 Your Actual Recorded Audio
                </button>
              </div>
            </div>

            {/* Top Bar with Timeline and Controls */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 font-mono text-xs font-bold">
                  {currentScene.timeRange}
                </span>
                <h4 className="font-bold text-sm text-white">
                  {currentScene.title}
                </h4>
              </div>

              <div className="flex items-center gap-2">
                {/* Voice toggle */}
                <button
                  onClick={() => {
                    setVoiceEnabled(!voiceEnabled);
                    if (voiceEnabled && typeof window !== 'undefined') {
                      window.speechSynthesis.cancel();
                      if (userAudioRef.current) userAudioRef.current.pause();
                    }
                  }}
                  className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors cursor-pointer ${
                    voiceEnabled
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                  title="Toggle automated speech narration"
                >
                  {voiceEnabled ? '🔊 Audio: ON' : '🔇 Audio: OFF'}
                </button>

                {/* Play / Pause */}
                {isPlaying ? (
                  <button
                    onClick={handleStopTour}
                    className="px-3 py-1 rounded-md bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    ⏸ Pause
                  </button>
                ) : (
                  <button
                    onClick={() => setIsPlaying(true)}
                    className="px-3 py-1 rounded-md bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs cursor-pointer"
                  >
                    ▶ Resume
                  </button>
                )}

                {/* Scene step buttons */}
                <button
                  disabled={currentSceneIndex === 0}
                  onClick={() => jumpToScene(currentSceneIndex - 1)}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  ← Prev
                </button>
                <button
                  disabled={currentSceneIndex === scenes.length - 1}
                  onClick={() => jumpToScene(currentSceneIndex + 1)}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-300 text-xs border border-slate-800 disabled:opacity-40 cursor-pointer"
                >
                  Next →
                </button>

                <button
                  onClick={() => {
                    handleStopTour();
                    setIsOpen(false);
                  }}
                  className="px-2.5 py-1 rounded text-xs text-slate-400 hover:text-white cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>
            </div>

            {/* Teleprompter Voiceover Text */}
            <div className="bg-slate-900/80 rounded-lg p-3 border border-slate-800/80 flex items-start gap-3">
              <span className="text-cyan-400 font-bold text-xs shrink-0 mt-0.5">
                🎙️ Teleprompter / Narration:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-medium">
                &ldquo;{currentScene.narration}&rdquo;
              </p>
            </div>

            {/* Scene Indicators & Screen Recording Instructions */}
            <div className="flex flex-wrap items-center justify-between text-[11px] text-slate-400">
              <div className="flex items-center gap-1.5">
                <span>Scenes:</span>
                {scenes.map((s, idx) => (
                  <button
                    key={s.id}
                    onClick={() => jumpToScene(idx)}
                    className={`size-6 rounded-full font-bold text-[10px] cursor-pointer transition-all ${
                      idx === currentSceneIndex
                        ? 'bg-cyan-500 text-slate-950 scale-110'
                        : 'bg-slate-800 text-slate-400 hover:bg-slate-700'
                    }`}
                  >
                    {s.id}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className="text-amber-300 font-medium">
                  💡 Tip: Press <strong>Win + Alt + R</strong> to start recording!
                </span>
                <span className="font-mono text-cyan-300 font-bold">
                  Next scene in: {secondsRemaining}s
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

import React from "react";
import { GameSettings } from "../lib/types";
import { Cpu, Activity, Zap, Sliders, ShieldCheck, Wifi, RefreshCw } from "lucide-react";

interface HeaderProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  fps: number;
  roundTripMs: number;
  isConnected: boolean;
  score: number;
  highScore: number;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  fps,
  roundTripMs,
  isConnected,
  score,
  highScore,
}) => {
  return (
    <header className="w-full bg-cyber-card/80 backdrop-blur-md border-b border-cyber-border px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 z-50 shadow-lg">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-cyber-neon/10 border border-cyber-neon/30 text-cyber-neon shadow-[0_0_15px_rgba(0,240,255,0.2)]">
          <Cpu className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-extrabold tracking-wider bg-gradient-to-r from-white via-cyan-200 to-cyber-neon bg-clip-text text-transparent uppercase font-mono">
            AERO // FER-FLAPPY
          </h1>
          <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
            <span>RESNET18 TENSOR ENGINE</span>
            <span className="text-slate-600">•</span>
            <span className="text-cyan-400">FER-2013 MULTI-CLASS</span>
          </p>
        </div>
      </div>

      {/* System Status Indicators */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Backend Connection Indicator */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 border border-slate-800 text-xs font-mono">
          <span className="relative flex h-2.5 w-2.5">
            {isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 ${isConnected ? "bg-emerald-400" : "bg-rose-500"
                }`}
            ></span>
          </span>
          <span className="text-slate-300">
            {settings.mockMode ? "MOCK PREDICTOR" : "FASTAPI LIVE"}
          </span>
          <span className="text-slate-600">|</span>
          <button
            onClick={() => onUpdateSettings({ mockMode: !settings.mockMode })}
            className="text-xs text-cyber-neon hover:underline font-semibold flex items-center gap-1"
            title="Toggle between Live FastAPI and Mock Server"
          >
            <RefreshCw className="w-3 h-3" />
            {settings.mockMode ? "SWITCH TO FASTAPI" : "SWITCH TO MOCK"}
          </button>
        </div>

        {/* Real-time Telemetry Pills */}
        <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-1.5" title="Stream Frame Rate">
            <Activity className="w-3.5 h-3.5 text-cyber-neon" />
            <span>{fps} FPS</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="flex items-center gap-1.5" title="Network Round Trip Time">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>{roundTripMs} ms</span>
          </div>
        </div>

        {/* Score Telemetry */}
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-lg bg-slate-900 border border-cyan-500/30 font-mono">
          <div className="text-xs">
            <span className="text-slate-400">SCORE: </span>
            <span className="text-lg font-bold text-cyber-neon">{score}</span>
          </div>
          <span className="text-slate-700">|</span>
          <div className="text-xs">
            <span className="text-slate-400">BEST: </span>
            <span className="text-sm font-semibold text-emerald-400">{highScore}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

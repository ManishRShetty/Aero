import React from "react";
import { GameSettings } from "@/lib/types";
import { Cpu, Activity, Zap, RefreshCw, Trophy, Gamepad2 } from "lucide-react";

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
    <header className="w-full bg-white border-b-4 border-slate-900 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 z-50 shadow-[0_4px_0_0_#0f172a]">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-amber-400 border-3 border-slate-900 shadow-[3px_3px_0_0_#0f172a] text-slate-950">
          <Gamepad2 className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-sm md:text-base font-pixel font-black tracking-wider text-slate-900 uppercase">
            FLAPPY AI // PIXEL EDITION
          </h1>
          <p className="text-[11px] font-arcade text-sky-700 font-bold uppercase tracking-wider">
            FACIAL EXPRESSION AI 8-BIT GAME ENGINE
          </p>
        </div>
      </div>

      {/* Retro Status Indicators */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Backend Connection Pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-sky-100 border-3 border-slate-900 text-xs font-pixel shadow-[2px_2px_0_0_#0f172a]">
          <span className="relative flex h-3 w-3">
            {isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-3 w-3 border border-slate-900 ${
                isConnected ? "bg-emerald-400" : "bg-rose-500"
              }`}
            ></span>
          </span>
          <span className="text-slate-900 text-[10px]">
            {settings.mockMode ? "MOCK ENGINE" : "FASTAPI LIVE"}
          </span>
          <button
            onClick={() => onUpdateSettings({ mockMode: !settings.mockMode })}
            className="text-[10px] text-amber-600 hover:text-amber-700 underline font-bold flex items-center gap-1 ml-1"
            title="Toggle Live FastAPI vs Mock Predictor"
          >
            <RefreshCw className="w-3 h-3" />
            TOGGLE
          </button>
        </div>

        {/* Real-time Telemetry */}
        <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-lg bg-amber-100 border-3 border-slate-900 text-[11px] font-arcade font-bold text-slate-800 shadow-[2px_2px_0_0_#0f172a]">
          <div className="flex items-center gap-1">
            <Activity className="w-4 h-4 text-sky-600" />
            <span>{fps} FPS</span>
          </div>
          <span className="text-slate-400">|</span>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4 text-amber-600" />
            <span>{roundTripMs} MS</span>
          </div>
        </div>

        {/* Score Display */}
        <div className="flex items-center gap-3 px-4 py-1.5 rounded-xl bg-amber-300 border-3 border-slate-900 shadow-[3px_3px_0_0_#0f172a]">
          <div className="text-[10px] font-pixel text-slate-950">
            <span className="text-slate-700">SCORE: </span>
            <span className="text-sm font-black text-slate-950">{score}</span>
          </div>
          <span className="text-slate-800">|</span>
          <div className="text-[10px] font-pixel text-slate-950 flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5 text-amber-700" />
            <span className="text-slate-950 font-bold">{highScore}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

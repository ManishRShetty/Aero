import React from "react";
import { GameSettings } from "@/lib/types";
import { Gamepad2, Activity, Zap, RefreshCw, Trophy, MousePointer, Camera, PanelRightClose, PanelRightOpen } from "lucide-react";

interface HeaderProps {
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
  fps: number;
  roundTripMs: number;
  isConnected: boolean;
  score: number;
  highScore: number;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  onUpdateSettings,
  fps,
  roundTripMs,
  isConnected,
  score,
  highScore,
  isSidebarOpen,
  onToggleSidebar,
}) => {
  return (
    <header className="w-full bg-white border-b-4 border-slate-900 px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-3 z-50 shadow-[0_4px_0_0_#0f172a]">
      {/* Brand Title */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-amber-400 border-3 border-slate-900 shadow-[3px_3px_0_0_#0f172a] text-slate-950">
          <Gamepad2 className="w-6 h-6 animate-pulse" />
        </div>
        <div>
          <h1 className="text-xs md:text-sm font-pixel font-black tracking-wider text-slate-900 uppercase">
            FLAPPY AI // 8-BIT EDITION
          </h1>
          <p className="text-[10px] font-arcade text-sky-700 font-bold uppercase tracking-wider">
            MANUAL & AI EXPRESSION CONTROLLED
          </p>
        </div>
      </div>

      {/* Center Controls & Status Bar */}
      <div className="flex items-center gap-2 md:gap-3 flex-wrap">
        {/* Mode Selector Pill */}
        <div className="flex items-center p-1 rounded-xl bg-slate-100 border-3 border-slate-900 shadow-[2px_2px_0_0_#0f172a] text-[10px] font-pixel">
          <button
            onClick={() => onUpdateSettings({ controlMode: "MANUAL_ONLY" })}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              settings.controlMode === "MANUAL_ONLY"
                ? "bg-sky-300 text-slate-950 font-bold border-2 border-slate-900 shadow-[1px_1px_0_0_#0f172a]"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="Play purely using Spacebar / Arrow Keys / Canvas Clicks"
          >
            <MousePointer className="w-3 h-3" /> MANUAL
          </button>
          <button
            onClick={() => onUpdateSettings({ controlMode: "HYBRID" })}
            className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1 ${
              settings.controlMode === "HYBRID"
                ? "bg-amber-300 text-slate-950 font-bold border-2 border-slate-900 shadow-[1px_1px_0_0_#0f172a]"
                : "text-slate-600 hover:text-slate-900"
            }`}
            title="Both Keyboard/Mouse Clicks and Webcam Smile trigger Jump"
          >
            <Camera className="w-3 h-3" /> AI HYBRID
          </button>
        </div>

        {/* Backend Predictor Toggle */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-sky-100 border-2.5 border-slate-900 text-[10px] font-pixel shadow-[2px_2px_0_0_#0f172a]">
          <span className="relative flex h-2.5 w-2.5">
            {isConnected && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            )}
            <span
              className={`relative inline-flex rounded-full h-2.5 w-2.5 border border-slate-900 ${
                isConnected ? "bg-emerald-400" : "bg-rose-500"
              }`}
            ></span>
          </span>
          <span className="text-slate-900">
            {settings.mockMode ? "MOCK" : "FASTAPI"}
          </span>
          <button
            onClick={() => onUpdateSettings({ mockMode: !settings.mockMode })}
            className="text-amber-600 hover:text-amber-700 font-bold flex items-center gap-0.5"
            title="Toggle Live FastAPI vs Mock Predictor"
          >
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>

        {/* Telemetry Readout */}
        <div className="hidden lg:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-amber-100 border-2.5 border-slate-900 text-[10px] font-arcade font-bold text-slate-800 shadow-[2px_2px_0_0_#0f172a]">
          <div className="flex items-center gap-1">
            <Activity className="w-3.5 h-3.5 text-sky-600" />
            <span>{fps} FPS</span>
          </div>
          <span className="text-slate-400">|</span>
          <div className="flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>{roundTripMs} MS</span>
          </div>
        </div>

        {/* Score Display */}
        <div className="flex items-center gap-2.5 px-3 py-1 rounded-xl bg-amber-300 border-2.5 border-slate-900 shadow-[2px_2px_0_0_#0f172a]">
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

        {/* Sidebar Toggle Button */}
        <button
          onClick={onToggleSidebar}
          className="pixel-button px-3 py-1.5 rounded-xl text-[10px] font-pixel flex items-center gap-1.5"
          title={isSidebarOpen ? "Minimize Sidebar for Full Screen Game" : "Expand AI Sidebar Panel"}
        >
          {isSidebarOpen ? (
            <>
              <PanelRightClose className="w-4 h-4" /> HIDE SIDEBAR
            </>
          ) : (
            <>
              <PanelRightOpen className="w-4 h-4" /> SHOW AI SIDEBAR
            </>
          )}
        </button>
      </div>
    </header>
  );
};

import React from "react";
import { AITelemetryState, GameSettings } from "@/lib/types";
import { BrainCircuit, Gauge, Cpu, Sliders, Server, AlertCircle } from "lucide-react";

interface AIStatePanelProps {
  telemetry: AITelemetryState;
  settings: GameSettings;
  onUpdateSettings: (newSettings: Partial<GameSettings>) => void;
}

export const AIStatePanel: React.FC<AIStatePanelProps> = ({
  telemetry,
  settings,
  onUpdateSettings,
}) => {
  const { action, confidence, modelLatencyMs, probabilities, error } = telemetry;
  const isJump = action === "JUMP";

  return (
    <div className="lg:col-span-4 flex flex-col rounded-2xl bg-white border-3.5 border-slate-900 p-5 shadow-[5px_5px_0_0_#0f172a] justify-between">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-amber-200 border-2 border-slate-900 text-slate-950">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-pixel font-bold text-slate-950 tracking-wide uppercase">
              AI STATE PANEL
            </h3>
            <p className="text-[10px] font-arcade font-bold text-slate-600">
              RESNET18 SOFTMAX TELEMETRY
            </p>
          </div>
        </div>

        {/* Action Status Pill */}
        <div
          className={`px-3 py-1 rounded-lg border-2 border-slate-900 text-[10px] font-pixel font-bold shadow-[2px_2px_0_0_#0f172a] transition-all duration-200 ${
            isJump
              ? "bg-amber-300 text-slate-950 scale-105"
              : "bg-slate-100 text-slate-600"
          }`}
        >
          {action}
        </div>
      </div>

      {/* Retro Pixel Softmax Probability Bars */}
      <div className="space-y-3 mb-4">
        <span className="text-[9px] font-pixel text-slate-600 block uppercase">
          MODEL PROBABILITIES
        </span>

        {/* 1. Smile (Jump) */}
        <div>
          <div className="flex justify-between text-[10px] font-pixel mb-1">
            <span className="text-amber-700 font-bold">Smile (JUMP)</span>
            <span className="text-slate-950 font-bold">{(probabilities.smile * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full h-3.5 rounded-md bg-slate-100 border-2 border-slate-900 overflow-hidden p-0.5">
            <div
              className="h-full bg-amber-400 border-r-2 border-slate-900 transition-all duration-150"
              style={{ width: `${Math.min(100, probabilities.smile * 100)}%` }}
            />
          </div>
        </div>

        {/* 2. Neutral */}
        <div>
          <div className="flex justify-between text-[10px] font-pixel mb-1">
            <span className="text-sky-700 font-bold">Neutral (GRAVITY)</span>
            <span className="text-slate-700 font-bold">{(probabilities.neutral * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full h-3.5 rounded-md bg-slate-100 border-2 border-slate-900 overflow-hidden p-0.5">
            <div
              className="h-full bg-sky-400 border-r-2 border-slate-900 transition-all duration-150"
              style={{ width: `${Math.min(100, probabilities.neutral * 100)}%` }}
            />
          </div>
        </div>

        {/* 3. Surprise */}
        <div>
          <div className="flex justify-between text-[10px] font-pixel mb-1">
            <span className="text-purple-700 font-bold">Surprise</span>
            <span className="text-slate-700 font-bold">{(probabilities.surprise * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full h-3.5 rounded-md bg-slate-100 border-2 border-slate-900 overflow-hidden p-0.5">
            <div
              className="h-full bg-purple-400 border-r-2 border-slate-900 transition-all duration-150"
              style={{ width: `${Math.min(100, probabilities.surprise * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Metrics Box */}
      <div className="grid grid-cols-2 gap-3 mb-4 font-pixel">
        <div className="p-2.5 rounded-xl bg-sky-100 border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a]">
          <div className="flex items-center gap-1 text-[8px] text-slate-700 mb-1 uppercase">
            <Cpu className="w-3 h-3 text-sky-700" />
            <span>MODEL LATENCY</span>
          </div>
          <div className="text-sm font-black text-slate-950">
            {modelLatencyMs} <span className="text-[10px] text-slate-600 font-normal">MS</span>
          </div>
        </div>

        <div className="p-2.5 rounded-xl bg-emerald-100 border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a]">
          <div className="flex items-center gap-1 text-[8px] text-slate-700 mb-1 uppercase">
            <Gauge className="w-3 h-3 text-emerald-700" />
            <span>CONFIDENCE</span>
          </div>
          <div className="text-sm font-black text-emerald-800">
            {(confidence * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Confidence Slider */}
      <div className="p-3 rounded-xl bg-amber-50 border-2 border-slate-900 shadow-[2px_2px_0_0_#0f172a] mb-3">
        <div className="flex items-center justify-between text-[9px] font-pixel mb-1.5">
          <span className="text-slate-900 flex items-center gap-1">
            <Sliders className="w-3 h-3 text-amber-600" />
            <span>THRESHOLD</span>
          </span>
          <span className="text-amber-700 font-bold">
            {(settings.confidenceThreshold * 100).toFixed(0)}%
          </span>
        </div>
        <input
          type="range"
          min="0.50"
          max="0.95"
          step="0.05"
          value={settings.confidenceThreshold}
          onChange={(e) =>
            onUpdateSettings({ confidenceThreshold: parseFloat(e.target.value) })
          }
          className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 rounded-lg border border-slate-900"
        />
      </div>

      {/* Footer endpoint info */}
      <div className="pt-2 border-t-2 border-slate-200 flex items-center justify-between text-[9px] font-pixel text-slate-600">
        <div className="flex items-center gap-1 truncate max-w-[200px]">
          <Server className="w-3 h-3 text-slate-500 shrink-0" />
          <span className="truncate">{settings.apiUrl}</span>
        </div>

        {error && (
          <span className="text-rose-600 flex items-center gap-1 text-[8px]" title={error}>
            <AlertCircle className="w-3 h-3" /> ERR
          </span>
        )}
      </div>
    </div>
  );
};

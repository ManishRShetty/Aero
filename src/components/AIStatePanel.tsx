import React from "react";
import { AITelemetryState, GameSettings } from "../lib/types";
import { BrainCircuit, Gauge, Cpu, CheckCircle2, Sliders, Server, AlertCircle } from "lucide-react";

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
  const { action, confidence, modelLatencyMs, roundTripLatencyMs, probabilities, isMock, isConnected, error } = telemetry;

  const isJump = action === "JUMP";

  return (
    <div className="lg:col-span-4 flex flex-col rounded-2xl bg-cyber-card border border-cyber-border p-5 shadow-xl justify-between">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyber-purple/10 text-purple-400 border border-purple-500/30">
            <BrainCircuit className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono text-white tracking-wide uppercase">
              AI STATE PANEL
            </h3>
            <p className="text-[10px] font-mono text-slate-400">
              RESNET18 SOFTMAX TELEMETRY
            </p>
          </div>
        </div>

        {/* Action Status Pill */}
        <div
          className={`px-3 py-1 rounded-full border text-xs font-mono font-bold transition-all duration-300 ${isJump
              ? "bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse"
              : "bg-slate-900 border-slate-800 text-slate-400"
            }`}
        >
          {action}
        </div>
      </div>

      {/* Raw Softmax Probability Bars */}
      <div className="space-y-3 mb-5">
        <span className="text-[10px] font-mono text-slate-400 tracking-wider block uppercase">
          CLASSIFICATION PROBABILITIES
        </span>

        {/* 1. Smile (Jump) */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-cyber-neon font-semibold">Smile (JUMP)</span>
            <span className="text-cyber-neon font-bold">{(probabilities.smile * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-cyber-neon transition-all duration-200"
              style={{ width: `${Math.min(100, probabilities.smile * 100)}%` }}
            />
          </div>
        </div>

        {/* 2. Neutral */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-slate-300">Neutral (GRAVITY)</span>
            <span className="text-slate-400">{(probabilities.neutral * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-slate-400 transition-all duration-200"
              style={{ width: `${Math.min(100, probabilities.neutral * 100)}%` }}
            />
          </div>
        </div>

        {/* 3. Surprise */}
        <div>
          <div className="flex justify-between text-xs font-mono mb-1">
            <span className="text-purple-400">Surprise</span>
            <span className="text-slate-400">{(probabilities.surprise * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full h-2 rounded-full bg-slate-950 border border-slate-800 overflow-hidden">
            <div
              className="h-full bg-purple-500 transition-all duration-200"
              style={{ width: `${Math.min(100, probabilities.surprise * 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Latency & Confidence Metrics Grid */}
      <div className="grid grid-cols-2 gap-3 mb-5 font-mono">
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-1 uppercase">
            <Cpu className="w-3 h-3 text-cyan-400" />
            <span>MODEL LATENCY</span>
          </div>
          <div className="text-base font-bold text-white">
            {modelLatencyMs} <span className="text-xs text-slate-400 font-normal">ms</span>
          </div>
        </div>

        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
          <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-1 uppercase">
            <Gauge className="w-3 h-3 text-amber-400" />
            <span>CONFIDENCE</span>
          </div>
          <div className="text-base font-bold text-emerald-400">
            {(confidence * 100).toFixed(1)}%
          </div>
        </div>
      </div>

      {/* Confidence Threshold Tuning Slider */}
      <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 mb-4">
        <div className="flex items-center justify-between text-xs font-mono mb-2">
          <span className="text-slate-300 flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyber-neon" />
            <span>CONFIDENCE THRESHOLD</span>
          </span>
          <span className="text-cyber-neon font-bold font-mono">
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
          className="w-full accent-cyber-neon cursor-pointer h-1.5 bg-slate-800 rounded-lg"
        />
      </div>

      {/* Endpoint Settings & Server Mode */}
      <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
        <div className="flex items-center gap-1.5 text-slate-400 truncate max-w-[200px]">
          <Server className="w-3.5 h-3.5 text-slate-500 shrink-0" />
          <span className="truncate">{settings.apiUrl}</span>
        </div>

        {error && (
          <span className="text-rose-400 flex items-center gap-1 text-[10px]" title={error}>
            <AlertCircle className="w-3 h-3" /> API ERR
          </span>
        )}
      </div>
    </div>
  );
};

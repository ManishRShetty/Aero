import React from "react";
import { Camera, CameraOff, Video, Eye, Radio, Sparkles } from "lucide-react";

interface TelemetryPanelProps {
  videoRef: React.RefObject<HTMLVideoElement>;
  isCameraActive: boolean;
  onStartCamera: () => void;
  onStopCamera: () => void;
  fps: number;
  frameIntervalMs: number;
}

export const TelemetryPanel: React.FC<TelemetryPanelProps> = ({
  videoRef,
  isCameraActive,
  onStartCamera,
  onStopCamera,
  fps,
  frameIntervalMs,
}) => {
  return (
    <div className="lg:col-span-4 flex flex-col rounded-2xl bg-cyber-card border border-cyber-border p-5 shadow-xl justify-between">
      {/* Header Bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-cyber-neon/10 text-cyber-neon border border-cyber-neon/30">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold font-mono text-white tracking-wide uppercase">
              TELEMETRY PANEL
            </h3>
            <p className="text-[10px] font-mono text-slate-400">
              LIVE WEBCAM INPUT STREAM
            </p>
          </div>
        </div>

        {/* Live Broadcast Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-[10px] font-mono">
          <Radio className={`w-3 h-3 ${isCameraActive ? "text-rose-500 animate-pulse" : "text-slate-600"}`} />
          <span className={isCameraActive ? "text-rose-400 font-bold" : "text-slate-500"}>
            {isCameraActive ? "LIVE FEED" : "OFFLINE"}
          </span>
        </div>
      </div>

      {/* Video Viewport Container */}
      <div className="relative w-full aspect-video rounded-xl bg-slate-950 border border-slate-800 overflow-hidden group shadow-inner mb-4 flex items-center justify-center">
        {/* Hidden video element used for webcam capture */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-cover transform -scale-x-100 ${
            isCameraActive ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Futuristic Target Reticle Overlay */}
        {isCameraActive && (
          <div className="absolute inset-0 pointer-events-none border border-cyber-neon/20 rounded-xl flex items-center justify-center">
            {/* Center Reticle */}
            <div className="w-24 h-24 rounded-full border border-dashed border-cyber-neon/40 flex items-center justify-center animate-spin-slow">
              <div className="w-2 h-2 rounded-full bg-cyber-neon" />
            </div>
            {/* Corner Crosshairs */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-cyber-neon" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-cyber-neon" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-cyber-neon" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-cyber-neon" />
          </div>
        )}

        {/* Offline Fallback */}
        {!isCameraActive && (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <CameraOff className="w-10 h-10 text-slate-600 mb-2" />
            <p className="text-xs font-mono text-slate-400 mb-3">
              WEBCAM FEED INACTIVE
            </p>
            <button
              onClick={onStartCamera}
              className="px-3.5 py-1.5 rounded-lg bg-cyber-neon/10 hover:bg-cyber-neon/20 border border-cyber-neon/40 text-cyber-neon text-xs font-mono flex items-center gap-2 transition-all"
            >
              <Camera className="w-3.5 h-3.5" /> ENABLE CAMERA
            </button>
          </div>
        )}

        {/* Floating Stream Info Overlay */}
        <div className="absolute bottom-2 left-2 right-2 px-3 py-1.5 rounded-lg bg-slate-950/80 backdrop-blur-md border border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-300 pointer-events-none">
          <span className="flex items-center gap-1 text-cyan-400">
            <Eye className="w-3 h-3" /> 224x224 JPEG @ 0.6
          </span>
          <span className="text-slate-400">{frameIntervalMs}ms INTERVAL ({fps} FPS)</span>
        </div>
      </div>

      {/* Stream Controls & Specs */}
      <div className="flex items-center justify-between gap-3 text-xs font-mono pt-2 border-t border-slate-800">
        <div className="text-slate-400 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-cyber-neon" />
          <span>FACIAL TENSOR STREAM</span>
        </div>

        <button
          onClick={isCameraActive ? onStopCamera : onStartCamera}
          className="text-xs text-slate-400 hover:text-white underline transition-colors"
        >
          {isCameraActive ? "Turn Off Camera" : "Turn On Camera"}
        </button>
      </div>
    </div>
  );
};

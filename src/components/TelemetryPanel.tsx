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
    <div className="lg:col-span-4 flex flex-col rounded-2xl bg-white border-3.5 border-slate-900 p-5 shadow-[5px_5px_0_0_#0f172a] justify-between">
      {/* Panel Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-sky-200 border-2 border-slate-900 text-slate-950">
            <Video className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-pixel font-bold text-slate-950 tracking-wide uppercase">
              WEBCAM FEED
            </h3>
            <p className="text-[10px] font-arcade font-bold text-slate-600">
              RETRO TELEMETRY MONITOR
            </p>
          </div>
        </div>

        {/* Live Broadcast Pill */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 border-2 border-slate-900 text-[10px] font-pixel">
          <Radio className={`w-3 h-3 ${isCameraActive ? "text-rose-600 animate-pulse" : "text-slate-400"}`} />
          <span className={isCameraActive ? "text-rose-600 font-bold" : "text-slate-500"}>
            {isCameraActive ? "LIVE" : "OFF"}
          </span>
        </div>
      </div>

      {/* Retro Arcade Monitor Viewport */}
      <div className="relative w-full aspect-video rounded-xl bg-slate-950 border-3 border-slate-900 overflow-hidden group shadow-[3px_3px_0_0_#0f172a] mb-3 flex items-center justify-center">
        {/* Hidden video element for webcam frame capturing */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`w-full h-full object-cover transform -scale-x-100 ${
            isCameraActive ? "opacity-100" : "opacity-0"
          }`}
        />

        {/* Pixel Target Reticle Overlay */}
        {isCameraActive && (
          <div className="absolute inset-0 pointer-events-none border-2 border-amber-400/40 rounded-xl flex items-center justify-center">
            {/* Center Pixel Reticle */}
            <div className="w-20 h-20 rounded-full border-2 border-dashed border-amber-300 flex items-center justify-center animate-spin-slow">
              <div className="w-3 h-3 bg-amber-400 border border-slate-900" />
            </div>
            {/* Corner Markers */}
            <div className="absolute top-2 left-2 w-3 h-3 border-t-3 border-l-3 border-amber-400" />
            <div className="absolute top-2 right-2 w-3 h-3 border-t-3 border-r-3 border-amber-400" />
            <div className="absolute bottom-2 left-2 w-3 h-3 border-b-3 border-l-3 border-amber-400" />
            <div className="absolute bottom-2 right-2 w-3 h-3 border-b-3 border-r-3 border-amber-400" />
          </div>
        )}

        {/* Offline State */}
        {!isCameraActive && (
          <div className="flex flex-col items-center justify-center p-4 text-center">
            <CameraOff className="w-8 h-8 text-slate-500 mb-2" />
            <p className="text-[10px] font-pixel text-slate-400 mb-3">
              WEBCAM INACTIVE
            </p>
            <button
              onClick={onStartCamera}
              className="pixel-button px-3.5 py-2 rounded-lg text-[10px] flex items-center gap-1.5"
            >
              <Camera className="w-3.5 h-3.5" /> ENABLE CAMERA
            </button>
          </div>
        )}

        {/* Bottom Stream Info Overlay */}
        <div className="absolute bottom-2 left-2 right-2 px-2.5 py-1 rounded-md bg-slate-950/85 border border-slate-800 flex items-center justify-between text-[9px] font-pixel text-slate-200 pointer-events-none">
          <span className="flex items-center gap-1 text-amber-300">
            <Eye className="w-3 h-3" /> 224x224 JPEG @ 0.6
          </span>
          <span className="text-slate-400">{frameIntervalMs}MS ({fps} FPS)</span>
        </div>
      </div>

      {/* Stream Specs Bar */}
      <div className="flex items-center justify-between gap-3 text-[10px] font-pixel pt-2 border-t-2 border-slate-200">
        <div className="text-slate-600 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>FACIAL TENSOR FEED</span>
        </div>

        <button
          onClick={isCameraActive ? onStopCamera : onStartCamera}
          className="text-sky-700 hover:underline font-bold text-[10px]"
        >
          {isCameraActive ? "Camera Off" : "Camera On"}
        </button>
      </div>
    </div>
  );
};

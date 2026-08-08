"use client";

import React, { useState, useRef, useCallback } from "react";
import { Header } from "@/components/Header";
import { GameCanvas } from "@/components/GameCanvas";
import { TelemetryPanel } from "@/components/TelemetryPanel";
import { AIStatePanel } from "@/components/AIStatePanel";
import { useWebcamFrame } from "@/hooks/useWebcamFrame";
import { useGameEngine } from "@/hooks/useGameEngine";
import { GameSettings } from "@/lib/types";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [settings, setSettings] = useState<GameSettings>({
    confidenceThreshold: 0.80,
    frameIntervalMs: 100,
    mockMode: false,
    controlMode: "HYBRID", // Default to AI HYBRID so smile triggers jump out of the box!
    apiUrl: "http://localhost:8000/api/v1/predict",
    keyboardFallback: true,
    particleEffects: true,
    soundEnabled: true,
  });

  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  const {
    gameStatus,
    score,
    highScore,
    lastJumpTime,
    startGame,
    resetGame,
    triggerJump,
  } = useGameEngine(canvasRef);

  const handleActionReceived = useCallback(
    (action: "JUMP" | "NONE") => {
      if (action === "JUMP") {
        triggerJump();
      }
    },
    [triggerJump]
  );

  const {
    videoRef,
    isCameraActive,
    startCamera,
    stopCamera,
    telemetry,
    triggerManualJump,
  } = useWebcamFrame(settings, handleActionReceived);

  const handleManualJump = () => {
    triggerJump();
    triggerManualJump();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-sky-100 font-pixel selection:bg-amber-300">
      {/* Header */}
      <Header
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        fps={telemetry.fps}
        roundTripMs={telemetry.roundTripLatencyMs}
        isConnected={telemetry.isConnected}
        score={score}
        highScore={highScore}
        isSidebarOpen={isSidebarOpen}
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-[1700px] w-full mx-auto p-3 md:p-5 flex items-stretch">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
          {/* Main 8-Bit Canvas Game Display */}
          <div
            className={`transition-all duration-300 flex flex-col ${
              isSidebarOpen ? "lg:col-span-8" : "lg:col-span-12"
            }`}
          >
            <GameCanvas
              canvasRef={canvasRef}
              gameStatus={gameStatus}
              score={score}
              highScore={highScore}
              lastAction={telemetry.action}
              lastConfidence={telemetry.confidence}
              lastJumpTime={lastJumpTime}
              controlMode={settings.controlMode}
              onStartGame={startGame}
              onResetGame={resetGame}
              onManualJump={handleManualJump}
            />
          </div>

          {/* Minimizable Right Sidebar (Camera & AI Telemetry) */}
          {isSidebarOpen && (
            <div className="lg:col-span-4 flex flex-col gap-5 justify-between animate-fade-in">
              <TelemetryPanel
                videoRef={videoRef}
                isCameraActive={isCameraActive}
                onStartCamera={startCamera}
                onStopCamera={stopCamera}
                fps={telemetry.fps}
                frameIntervalMs={settings.frameIntervalMs}
              />

              <AIStatePanel
                telemetry={telemetry}
                settings={settings}
                onUpdateSettings={handleUpdateSettings}
              />
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-2 px-6 border-t-3 border-slate-900 bg-white text-center text-[10px] font-pixel text-slate-700 flex flex-wrap justify-between items-center gap-2 shadow-[0_-3px_0_0_#0f172a]">
        <div>FLAPPY BIRD 8-BIT // PIXEL AI ENGINE</div>
        <div className="flex items-center gap-3 text-sky-800 font-bold">
          <span>FASTAPI CONTRACT: /api/v1/predict</span>
          <span>•</span>
          <span>224x224 JPEG @ 10 FPS</span>
        </div>
      </footer>
    </div>
  );
}

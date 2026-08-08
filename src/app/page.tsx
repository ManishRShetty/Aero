"use client";

import React, { useState, useRef, useCallback } from "react";
import { Header } from "../components/Header";
import { BentoGrid } from "../components/BentoGrid";
import { GameCanvas } from "../components/GameCanvas";
import { TelemetryPanel } from "../components/TelemetryPanel";
import { AIStatePanel } from "../components/AIStatePanel";
import { useWebcamFrame } from "../hooks/useWebcamFrame";
import { useGameEngine } from "../hooks/useGameEngine";
import { GameSettings } from "../lib/types";

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Global Settings state
  const [settings, setSettings] = useState<GameSettings>({
    confidenceThreshold: 0.80,
    frameIntervalMs: 100, // 100ms interval (10 FPS stream)
    mockMode: true, // Default to Mock Predictor for instant out-of-box testing
    apiUrl: "http://localhost:8000/api/v1/predict",
    keyboardFallback: true,
    particleEffects: true,
    soundEnabled: true,
  });

  const handleUpdateSettings = (newSettings: Partial<GameSettings>) => {
    setSettings((prev) => ({ ...prev, ...newSettings }));
  };

  // Initialize Game Canvas Engine
  const {
    gameStatus,
    score,
    highScore,
    lastJumpTime,
    startGame,
    resetGame,
    triggerJump,
  } = useGameEngine(canvasRef);

  // Callback when AI backend triggers "JUMP"
  const handleActionReceived = useCallback(
    (action: "JUMP" | "NONE") => {
      if (action === "JUMP") {
        triggerJump();
      }
    },
    [triggerJump]
  );

  // Initialize Webcam Capture & AI Telemetry Hook
  const {
    videoRef,
    isCameraActive,
    startCamera,
    stopCamera,
    telemetry,
    triggerManualJump,
  } = useWebcamFrame(settings, handleActionReceived);

  // Combine manual jump trigger with engine jump
  const handleManualJump = () => {
    triggerJump();
    triggerManualJump();
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-cyber-dark">
      {/* Header */}
      <Header
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        fps={telemetry.fps}
        roundTripMs={telemetry.roundTripLatencyMs}
        isConnected={telemetry.isConnected}
        score={score}
        highScore={highScore}
      />

      {/* Main Bento Grid Workspace */}
      <main className="flex-1 flex items-center justify-center py-2">
        <BentoGrid>
          {/* Main Canvas Game Loop (Left 70% Width / Col 8) */}
          <GameCanvas
            gameStatus={gameStatus}
            score={score}
            highScore={highScore}
            lastAction={telemetry.action}
            lastConfidence={telemetry.confidence}
            lastJumpTime={lastJumpTime}
            onStartGame={startGame}
            onResetGame={resetGame}
            onManualJump={handleManualJump}
          />

          {/* Right Column (Col 4) containing Telemetry & AI Panels */}
          <div className="lg:col-span-4 flex flex-col gap-5 justify-between">
            {/* Top Right: Telemetry Panel */}
            <TelemetryPanel
              videoRef={videoRef}
              isCameraActive={isCameraActive}
              onStartCamera={startCamera}
              onStopCamera={stopCamera}
              fps={telemetry.fps}
              frameIntervalMs={settings.frameIntervalMs}
            />

            {/* Bottom Right: AI State Panel */}
            <AIStatePanel
              telemetry={telemetry}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          </div>
        </BentoGrid>
      </main>

      {/* Footer */}
      <footer className="w-full py-2.5 px-6 border-t border-slate-900 bg-slate-950 text-center text-xs font-mono text-slate-400 flex flex-wrap justify-between items-center gap-2">
        <div>AERO AI // DEEP LEARNING FACIAL EXPRESSION ENGINE</div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>FASTAPI CONTRACT: /api/v1/predict</span>
          <span>•</span>
          <span>COMPRESSION: 224x224 JPEG @ 0.6</span>
        </div>
      </footer>
    </div>
  );
}

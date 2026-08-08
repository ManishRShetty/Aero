import React, { useRef, useEffect } from "react";
import { GameStatus, ActionType } from "../lib/types";
import { Play, RotateCcw, Smile, Space, Zap, ShieldAlert, Trophy } from "lucide-react";

interface GameCanvasProps {
  gameStatus: GameStatus;
  score: number;
  highScore: number;
  lastAction: ActionType;
  lastConfidence: number;
  lastJumpTime: number;
  onStartGame: () => void;
  onResetGame: () => void;
  onManualJump: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  gameStatus,
  score,
  highScore,
  lastAction,
  lastConfidence,
  lastJumpTime,
  onStartGame,
  onResetGame,
  onManualJump,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Resize Canvas to fit container dynamically
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        const width = containerRef.current.clientWidth;
        const height = containerRef.current.clientHeight;
        canvasRef.current.width = width;
        canvasRef.current.height = height;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Listen to keyboard space bar for backup jump trigger
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault();
        if (gameStatus === "START" || gameStatus === "GAME_OVER") {
          onStartGame();
        } else if (gameStatus === "PLAYING") {
          onManualJump();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameStatus, onStartGame, onManualJump]);

  const isJumpActive = lastAction === "JUMP" || Date.now() - lastJumpTime < 300;

  return (
    <div
      ref={containerRef}
      className="lg:col-span-8 flex flex-col relative rounded-2xl bg-cyber-card border border-cyber-border overflow-hidden shadow-2xl min-h-[500px] lg:min-h-[640px]"
    >
      {/* Top Overlay Badge & Telemetry Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Expression Jump Pulse Badge */}
        <div
          className={`flex items-center gap-2.5 px-4 py-2 rounded-xl backdrop-blur-md border transition-all duration-300 ${isJumpActive
              ? "bg-cyber-neon/20 border-cyber-neon text-cyber-neon shadow-[0_0_25px_rgba(0,240,255,0.5)] scale-105"
              : "bg-slate-950/70 border-slate-800 text-slate-400"
            }`}
        >
          <Smile
            className={`w-5 h-5 transition-transform duration-300 ${isJumpActive ? "scale-125 rotate-12 text-cyber-neon" : "text-slate-500"
              }`}
          />
          <div className="flex flex-col">
            <span className="text-[10px] font-mono tracking-widest text-slate-400 uppercase">
              EXPRESSION STATE
            </span>
            <span className="text-xs font-mono font-bold">
              {isJumpActive ? "SMILE // JUMP TRIGGERED" : "NEUTRAL // GRAVITY ACTIVE"}
            </span>
          </div>
        </div>

        {/* Live Score Display */}
        <div className="px-4 py-2 rounded-xl bg-slate-950/80 border border-slate-800 text-right backdrop-blur-md">
          <span className="text-[10px] font-mono tracking-widest text-slate-400 block uppercase">
            LIVE SCORE
          </span>
          <span className="text-2xl font-black font-mono text-white tracking-wider">
            {score}
          </span>
        </div>
      </div>

      {/* Main HTML5 Canvas Element */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block flex-1 bg-cyber-dark cursor-pointer"
        onClick={() => {
          if (gameStatus === "PLAYING") onManualJump();
          else if (gameStatus === "START" || gameStatus === "GAME_OVER") onStartGame();
        }}
      />

      {/* Overlay Screens */}

      {/* 1. START SCREEN */}
      {gameStatus === "START" && (
        <div className="absolute inset-0 z-30 bg-cyber-dark/90 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-cyber-neon/10 border border-cyber-neon/40 flex items-center justify-center text-cyber-neon mb-6 shadow-[0_0_30px_rgba(0,240,255,0.3)] animate-bounce">
            <Smile className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-white font-mono tracking-wide mb-2">
            FACE-CONTROLLED FLAPPY BIRD
          </h2>
          <p className="text-slate-400 max-w-md text-sm mb-6 leading-relaxed">
            Smile at the webcam to make the character jump! Neutral expression applies gravity.
            Ensure your webcam is enabled and illuminated.
          </p>

          <div className="flex items-center gap-4 mb-8 text-xs font-mono text-slate-400 bg-slate-900/80 px-4 py-2.5 rounded-lg border border-slate-800">
            <span className="flex items-center gap-1.5 text-cyber-neon">
              <Smile className="w-4 h-4" /> Smile = JUMP
            </span>
            <span className="text-slate-700">|</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Space className="w-4 h-4" /> Spacebar = Manual Jump
            </span>
          </div>

          <button
            onClick={onStartGame}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyber-neon to-cyan-500 text-slate-950 font-mono font-black text-sm tracking-wider uppercase hover:opacity-90 transition-all shadow-[0_0_25px_rgba(0,240,255,0.4)] flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-slate-950" /> INITIALIZE GAME LOOP
          </button>
        </div>
      )}

      {/* 2. GAME OVER SCREEN */}
      {gameStatus === "GAME_OVER" && (
        <div className="absolute inset-0 z-30 bg-cyber-dark/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-500 mb-6 shadow-[0_0_30px_rgba(244,63,94,0.3)]">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-3xl font-extrabold text-rose-500 font-mono tracking-wider mb-2 uppercase">
            COLLISION DETECTED
          </h2>
          <p className="text-slate-400 text-sm mb-6 font-mono">
            NEURAL CONTROL STREAM TERMINATED
          </p>

          {/* Stats Card */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-8">
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">
                FINAL SCORE
              </span>
              <span className="text-3xl font-black font-mono text-cyber-neon">
                {score}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-center">
              <span className="text-[10px] font-mono text-slate-400 block mb-1 uppercase">
                HIGH SCORE
              </span>
              <span className="text-3xl font-black font-mono text-emerald-400 flex items-center justify-center gap-1">
                <Trophy className="w-5 h-5" /> {highScore}
              </span>
            </div>
          </div>

          <div className="flex gap-4">
            <button
              onClick={onStartGame}
              className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-cyber-neon to-cyan-500 text-slate-950 font-mono font-black text-sm tracking-wider uppercase hover:opacity-90 transition-all shadow-[0_0_25px_rgba(0,240,255,0.4)] flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" /> RETRY MISSION
            </button>
          </div>
        </div>
      )}

      {/* Bottom Manual Jump Button Bar */}
      <div className="p-3 bg-slate-950/90 border-t border-cyber-border flex items-center justify-between gap-4 z-20">
        <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
          <Zap className="w-4 h-4 text-cyber-neon" />
          <span>CANVAS GAME ENGINE (60 FPS)</span>
        </div>

        <button
          onClick={onManualJump}
          className="px-4 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-mono text-slate-200 flex items-center gap-2 transition-all active:scale-95"
          title="Manual Jump (or press Spacebar)"
        >
          <Space className="w-4 h-4 text-cyber-neon" />
          <span>MANUAL JUMP (SPACE)</span>
        </button>
      </div>
    </div>
  );
};

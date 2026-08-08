import React, { useRef, useEffect } from "react";
import { GameStatus, ActionType } from "@/lib/types";
import { Play, RotateCcw, Smile, Space, Zap, ShieldAlert, Trophy, Sparkles } from "lucide-react";

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

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
      className="lg:col-span-8 flex flex-col relative rounded-2xl bg-white border-3.5 border-slate-900 overflow-hidden shadow-[6px_6px_0_0_#0f172a] min-h-[500px] lg:min-h-[640px]"
    >
      {/* Top HUD Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Smile Action Badge */}
        <div
          className={`flex items-center gap-2.5 px-4 py-2 rounded-xl border-3 border-slate-900 transition-all duration-200 ${
            isJumpActive
              ? "bg-amber-300 shadow-[3px_3px_0_0_#0f172a] scale-105"
              : "bg-white/90 shadow-[2px_2px_0_0_#0f172a] text-slate-700"
          }`}
        >
          <Smile
            className={`w-5 h-5 transition-transform duration-200 ${
              isJumpActive ? "scale-125 text-slate-950" : "text-slate-500"
            }`}
          />
          <div className="flex flex-col">
            <span className="text-[9px] font-pixel text-slate-600 uppercase">
              EXPRESSION STATE
            </span>
            <span className="text-[11px] font-pixel font-black text-slate-950">
              {isJumpActive ? "SMILE // JUMP!" : "NEUTRAL // GRAVITY"}
            </span>
          </div>
        </div>

        {/* Score Display HUD */}
        <div className="px-4 py-2 rounded-xl bg-amber-300 border-3 border-slate-900 shadow-[3px_3px_0_0_#0f172a] text-right">
          <span className="text-[9px] font-pixel text-slate-800 block uppercase">
            SCORE
          </span>
          <span className="text-xl font-black font-pixel text-slate-950">
            {score}
          </span>
        </div>
      </div>

      {/* HTML5 Canvas Element */}
      <canvas
        ref={canvasRef}
        className="w-full h-full block flex-1 bg-[#70c5ce] cursor-pointer"
        onClick={() => {
          if (gameStatus === "PLAYING") onManualJump();
          else if (gameStatus === "START" || gameStatus === "GAME_OVER") onStartGame();
        }}
      />

      {/* Retro START Screen */}
      {gameStatus === "START" && (
        <div className="absolute inset-0 z-30 bg-sky-200/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-amber-300 border-3.5 border-slate-900 shadow-[4px_4px_0_0_#0f172a] flex items-center justify-center text-slate-950 mb-6 animate-bounce">
            <Smile className="w-8 h-8" />
          </div>
          <h2 className="text-xl md:text-2xl font-black font-pixel text-slate-950 mb-3 tracking-wide">
            PIXEL FLAPPY BIRD
          </h2>
          <p className="text-slate-700 max-w-md text-xs font-pixel leading-relaxed mb-6">
            SMILE AT THE WEBCAM TO JUMP! NEUTRAL EXPRESSION APPLIES GRAVITY.
          </p>

          <div className="flex items-center gap-3 mb-8 text-[11px] font-pixel text-slate-900 bg-white px-4 py-3 rounded-xl border-3 border-slate-900 shadow-[3px_3px_0_0_#0f172a]">
            <span className="text-amber-600 font-bold flex items-center gap-1">
              <Smile className="w-4 h-4" /> Smile = JUMP
            </span>
            <span className="text-slate-400">|</span>
            <span className="text-sky-700 font-bold flex items-center gap-1">
              <Space className="w-4 h-4" /> Spacebar = Jump
            </span>
          </div>

          <button
            onClick={onStartGame}
            className="pixel-button px-8 py-4 rounded-xl font-pixel text-xs font-black uppercase flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-slate-950" /> PRESS START TO PLAY
          </button>
        </div>
      )}

      {/* Retro GAME OVER Screen */}
      {gameStatus === "GAME_OVER" && (
        <div className="absolute inset-0 z-30 bg-rose-100/95 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
          <div className="w-16 h-16 rounded-2xl bg-rose-400 border-3.5 border-slate-900 shadow-[4px_4px_0_0_#0f172a] flex items-center justify-center text-slate-950 mb-6">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-xl md:text-2xl font-black font-pixel text-rose-600 mb-2 uppercase tracking-wide">
            GAME OVER!
          </h2>
          <p className="text-slate-700 text-xs font-pixel mb-6">
            PIPE COLLISION DETECTED
          </p>

          {/* Stats Box */}
          <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-8">
            <div className="p-4 rounded-xl bg-white border-3 border-slate-900 shadow-[3px_3px_0_0_#0f172a] text-center">
              <span className="text-[9px] font-pixel text-slate-600 block mb-1 uppercase">
                SCORE
              </span>
              <span className="text-2xl font-black font-pixel text-amber-500">
                {score}
              </span>
            </div>
            <div className="p-4 rounded-xl bg-white border-3 border-slate-900 shadow-[3px_3px_0_0_#0f172a] text-center">
              <span className="text-[9px] font-pixel text-slate-600 block mb-1 uppercase">
                HIGH SCORE
              </span>
              <span className="text-2xl font-black font-pixel text-emerald-600 flex items-center justify-center gap-1">
                <Trophy className="w-5 h-5 text-amber-500" /> {highScore}
              </span>
            </div>
          </div>

          <button
            onClick={onStartGame}
            className="pixel-button px-8 py-4 rounded-xl font-pixel text-xs font-black uppercase flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> PLAY AGAIN
          </button>
        </div>
      )}

      {/* Bottom Manual Control Bar */}
      <div className="p-3 bg-sky-100 border-t-3 border-slate-900 flex items-center justify-between gap-4 z-20">
        <div className="text-[10px] font-pixel text-slate-700 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>CANVAS RETRO ENGINE</span>
        </div>

        <button
          onClick={onManualJump}
          className="pixel-button px-4 py-2 rounded-lg text-[10px] font-pixel flex items-center gap-2"
          title="Manual Jump (Spacebar)"
        >
          <Space className="w-4 h-4 text-slate-950" />
          <span>SPACEBAR JUMP</span>
        </button>
      </div>
    </div>
  );
};

import React, { useEffect } from "react";
import { GameStatus, ActionType, ControlMode } from "@/lib/types";
import { CANVAS_WIDTH, CANVAS_HEIGHT } from "@/hooks/useGameEngine";
import { Play, RotateCcw, Smile, Space, ShieldAlert, Trophy, Sparkles, MousePointer } from "lucide-react";

interface GameCanvasProps {
  canvasRef: React.RefObject<HTMLCanvasElement>;
  gameStatus: GameStatus;
  score: number;
  highScore: number;
  lastAction: ActionType;
  lastConfidence: number;
  lastJumpTime: number;
  controlMode: ControlMode;
  onStartGame: () => void;
  onResetGame: () => void;
  onManualJump: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  canvasRef,
  gameStatus,
  score,
  highScore,
  lastAction,
  lastConfidence,
  lastJumpTime,
  controlMode,
  onStartGame,
  onResetGame,
  onManualJump,
}) => {
  // Keyboard controls listener (Spacebar, Up Arrow, W key)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") {
        e.preventDefault();
        onManualJump();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onManualJump]);

  const isJumpActive = lastAction === "JUMP" || Date.now() - lastJumpTime < 300;

  return (
    <div className="w-full flex flex-col relative rounded-2xl bg-white border-3.5 border-slate-900 overflow-hidden shadow-[6px_6px_0_0_#0f172a] min-h-[520px] lg:min-h-[620px] flex-1">
      {/* Top HUD Overlay */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Control Mode Badge */}
        <div
          className={`flex items-center gap-2.5 px-3.5 py-2 rounded-xl border-3 border-slate-900 transition-all duration-200 ${
            isJumpActive
              ? "bg-amber-300 shadow-[3px_3px_0_0_#0f172a] scale-105"
              : "bg-white/95 shadow-[2px_2px_0_0_#0f172a] text-slate-800"
          }`}
        >
          {controlMode === "MANUAL_ONLY" ? (
            <MousePointer className="w-4 h-4 text-slate-950" />
          ) : (
            <Smile
              className={`w-4 h-4 transition-transform duration-200 ${
                isJumpActive ? "scale-125 text-slate-950" : "text-slate-500"
              }`}
            />
          )}
          <div className="flex flex-col">
            <span className="text-[8px] font-pixel text-slate-600 uppercase">
              {controlMode} MODE
            </span>
            <span className="text-[10px] font-pixel font-black text-slate-950">
              {isJumpActive ? "JUMP!" : "GRAVITY"}
            </span>
          </div>
        </div>

        {/* Score HUD */}
        <div className="px-4 py-2 rounded-xl bg-amber-300 border-3 border-slate-900 shadow-[3px_3px_0_0_#0f172a] text-right">
          <span className="text-[8px] font-pixel text-slate-800 block uppercase">
            SCORE
          </span>
          <span className="text-lg font-black font-pixel text-slate-950">
            {score}
          </span>
        </div>
      </div>

      {/* HTML5 Canvas Element Attached to Shared CanvasRef */}
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="w-full h-full block flex-1 bg-[#70c5ce] cursor-pointer object-contain"
        onClick={onManualJump}
      />

      {/* START Screen Overlay */}
      {gameStatus === "START" && (
        <div
          className="absolute inset-0 z-30 bg-sky-900/25 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 text-center cursor-pointer"
          onClick={onManualJump}
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-300 border-3.5 border-slate-900 shadow-[4px_4px_0_0_#0f172a] flex items-center justify-center text-slate-950 mb-3 animate-bounce">
            <Play className="w-7 h-7 fill-slate-950" />
          </div>
          <h2 className="text-xl md:text-2xl font-black font-pixel text-white drop-shadow-[2px_2px_0_#0f172a] mb-2 tracking-wide">
            PIXEL FLAPPY BIRD
          </h2>
          <p className="text-amber-300 max-w-md text-xs font-pixel leading-relaxed mb-5 drop-shadow-[1px_1px_0_#0f172a]">
            CLICK CANVAS OR PRESS SPACEBAR TO START & JUMP!
          </p>

          <div className="flex flex-wrap justify-center items-center gap-3 mb-6 text-[10px] font-pixel text-slate-950 bg-white/95 px-4 py-2.5 rounded-xl border-3 border-slate-900 shadow-[3px_3px_0_0_#0f172a]">
            <span className="text-sky-700 font-bold flex items-center gap-1">
              <MousePointer className="w-3.5 h-3.5" /> Click / Spacebar / Up Arrow
            </span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onManualJump();
            }}
            className="pixel-button px-8 py-3.5 rounded-xl font-pixel text-xs font-black uppercase flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-slate-950" /> START GAME NOW
          </button>
        </div>
      )}

      {/* GAME OVER Screen Overlay */}
      {gameStatus === "GAME_OVER" && (
        <div
          className="absolute inset-0 z-30 bg-rose-950/40 backdrop-blur-[1px] flex flex-col items-center justify-center p-6 text-center cursor-pointer"
          onClick={onManualJump}
        >
          <div className="w-14 h-14 rounded-2xl bg-rose-400 border-3.5 border-slate-900 shadow-[4px_4px_0_0_#0f172a] flex items-center justify-center text-slate-950 mb-3">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-xl md:text-2xl font-black font-pixel text-rose-300 drop-shadow-[2px_2px_0_#0f172a] mb-2 uppercase tracking-wide">
            GAME OVER!
          </h2>
          <p className="text-white text-xs font-pixel mb-5 drop-shadow-[1px_1px_0_#0f172a]">
            CLICK OR PRESS SPACE TO RESTART
          </p>

          <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-5">
            <div className="p-3 rounded-xl bg-white border-3 border-slate-900 shadow-[3px_3px_0_0_#0f172a] text-center">
              <span className="text-[8px] font-pixel text-slate-600 block mb-1 uppercase">
                SCORE
              </span>
              <span className="text-xl font-black font-pixel text-amber-500">
                {score}
              </span>
            </div>
            <div className="p-3 rounded-xl bg-white border-3 border-slate-900 shadow-[3px_3px_0_0_#0f172a] text-center">
              <span className="text-[8px] font-pixel text-slate-600 block mb-1 uppercase">
                BEST
              </span>
              <span className="text-xl font-black font-pixel text-emerald-600 flex items-center justify-center gap-1">
                <Trophy className="w-4 h-4 text-amber-500" /> {highScore}
              </span>
            </div>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              onManualJump();
            }}
            className="pixel-button px-8 py-3.5 rounded-xl font-pixel text-xs font-black uppercase flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" /> PLAY AGAIN
          </button>
        </div>
      )}

      {/* Bottom Control Bar */}
      <div className="p-3 bg-sky-100 border-t-3 border-slate-900 flex items-center justify-between gap-4 z-20">
        <div className="text-[10px] font-pixel text-slate-700 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>CLICK CANVAS OR PRESS SPACEBAR / UP ARROW TO JUMP</span>
        </div>

        <button
          onClick={onManualJump}
          className="pixel-button px-5 py-2.5 rounded-xl text-xs font-pixel flex items-center gap-2 active:scale-95"
          title="Manual Jump (Spacebar / Click / Up Arrow)"
        >
          <Space className="w-4 h-4 text-slate-950" />
          <span>MANUAL JUMP</span>
        </button>
      </div>
    </div>
  );
};

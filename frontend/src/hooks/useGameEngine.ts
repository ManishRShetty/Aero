import { useEffect, useRef, useState, useCallback } from "react";
import { BirdState, GameStatus, Obstacle, Particle } from "@/lib/types";

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;
const GROUND_HEIGHT = 65;
const GRAVITY = 0.20;
const JUMP_FORCE = -5.5;
const OBSTACLE_SPEED = 3.2;
const OBSTACLE_SPAWN_INTERVAL = 95; // frames
const GAP_SIZE = 150;

export function useGameEngine(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const [gameStatus, setGameStatus] = useState<GameStatus>("START");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lastJumpTime, setLastJumpTime] = useState<number>(0);

  // Use refs for animation loop state to avoid tearing or re-binding
  const gameStatusRef = useRef<GameStatus>(gameStatus);
  const scoreRef = useRef<number>(score);
  const highScoreRef = useRef<number>(highScore);

  useEffect(() => {
    gameStatusRef.current = gameStatus;
  }, [gameStatus]);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    highScoreRef.current = highScore;
  }, [highScore]);

  const birdRef = useRef<BirdState>({
    x: 120,
    y: 280,
    velocity: 0,
    radius: 18,
    rotation: 0,
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const cloudsRef = useRef<{ x: number; y: number; scale: number; speed: number }[]>([]);
  const frameCountRef = useRef(0);
  const birdImageRef = useRef<HTMLImageElement | null>(null);

  // Load saved high score
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aero_flappy_highscore");
      if (saved) {
        const parsed = parseInt(saved, 10) || 0;
        setHighScore(parsed);
        highScoreRef.current = parsed;
      }
    }
  }, []);

  // Initialize random pixel clouds and load bird image
  useEffect(() => {
    if (typeof window !== "undefined") {
      const img = new Image();
      img.src = "/anush_man.png";
      img.onload = () => {
        birdImageRef.current = img;
      };
    }

    cloudsRef.current = [
      { x: 50, y: 60, scale: 1.3, speed: 0.5 },
      { x: 260, y: 100, scale: 0.9, speed: 0.35 },
      { x: 500, y: 50, scale: 1.5, speed: 0.6 },
      { x: 720, y: 120, scale: 1.1, speed: 0.4 },
    ];
  }, []);

  const startGame = useCallback(() => {
    birdRef.current = {
      x: 120,
      y: 280,
      velocity: 0,
      radius: 18,
      rotation: 0,
    };
    obstaclesRef.current = [];
    particlesRef.current = [];
    frameCountRef.current = 0;
    setScore(0);
    scoreRef.current = 0;
    setGameStatus("PLAYING");
    gameStatusRef.current = "PLAYING";
  }, []);

  const triggerJump = useCallback(() => {
    const status = gameStatusRef.current;

    if (status === "START" || status === "GAME_OVER") {
      startGame();
      return;
    }

    if (status === "PLAYING") {
      birdRef.current.velocity = JUMP_FORCE;
      setLastJumpTime(Date.now());

      // Spawn retro 8-bit star/coin particles
      const b = birdRef.current;
      for (let i = 0; i < 7; i++) {
        particlesRef.current.push({
          x: b.x - 12,
          y: b.y + (Math.random() * 14 - 7),
          vx: -Math.random() * 3 - 1.5,
          vy: (Math.random() - 0.5) * 4,
          life: 0,
          maxLife: 20 + Math.random() * 10,
          size: 4,
          color: i % 2 === 0 ? "#facc15" : "#ffffff",
        });
      }
    }
  }, [startGame]);

  const resetGame = useCallback(() => {
    setGameStatus("START");
    gameStatusRef.current = "START";
  }, []);

  // Continuous 60 FPS Drawing & Physics Loop
  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (canvas) {
        if (canvas.width !== CANVAS_WIDTH) canvas.width = CANVAS_WIDTH;
        if (canvas.height !== CANVAS_HEIGHT) canvas.height = CANVAS_HEIGHT;

        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.imageSmoothingEnabled = false;

          frameCountRef.current++;

          // 1. Clear & Draw Sky (#70c5ce)
          ctx.fillStyle = "#70c5ce";
          ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

          // 2. Draw Pixel Clouds
          ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
          cloudsRef.current.forEach((cloud) => {
            cloud.x -= cloud.speed;
            if (cloud.x < -140) cloud.x = CANVAS_WIDTH + 60;

            const cx = Math.round(cloud.x);
            const cy = Math.round(cloud.y);
            ctx.fillRect(cx, cy, 60 * cloud.scale, 24 * cloud.scale);
            ctx.fillRect(cx + 12 * cloud.scale, cy - 12 * cloud.scale, 36 * cloud.scale, 36 * cloud.scale);
            ctx.fillRect(cx + 30 * cloud.scale, cy - 18 * cloud.scale, 24 * cloud.scale, 30 * cloud.scale);
          });

          const status = gameStatusRef.current;

          // 3. Hover bird on START screen
          if (status === "START") {
            birdRef.current.y = 280 + Math.sin(Date.now() / 200) * 14;
            birdRef.current.velocity = 0;
            birdRef.current.rotation = 0;
          } else if (status === "PLAYING") {
            // 4. Update Physics if PLAYING
            const bird = birdRef.current;
            
            // Standard Flappy Bird gravity
            bird.velocity += GRAVITY;
            
            // Terminal velocity limit (prevents falling too fast)
            if (bird.velocity > 8) {
              bird.velocity = 8;
            }
            
            bird.y += bird.velocity;
            
            // Better rotation mechanics
            const targetRotation = Math.min(Math.PI / 2, Math.max(-Math.PI / 6, (bird.velocity * 0.12)));
            bird.rotation += (targetRotation - bird.rotation) * 0.15;

            // Ground/Ceiling collision
            if (bird.y - bird.radius <= 0 || bird.y + bird.radius >= CANVAS_HEIGHT - GROUND_HEIGHT) {
              setGameStatus("GAME_OVER");
              gameStatusRef.current = "GAME_OVER";
            }

            // Spawn Pipes
            if (frameCountRef.current % OBSTACLE_SPAWN_INTERVAL === 0) {
              const minH = 70;
              const maxH = CANVAS_HEIGHT - GROUND_HEIGHT - GAP_SIZE - minH;
              const topHeight = Math.floor(Math.random() * (maxH - minH + 1)) + minH;

              obstaclesRef.current.push({
                x: CANVAS_WIDTH + 30,
                topHeight,
                bottomHeight: CANVAS_HEIGHT - GROUND_HEIGHT - topHeight - GAP_SIZE,
                width: 64,
                passed: false,
              });
            }

            // Move Pipes & Check Collisions
            for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
              const obs = obstaclesRef.current[i];
              obs.x -= OBSTACLE_SPEED;

              // Score check
              if (!obs.passed && obs.x + obs.width < bird.x) {
                obs.passed = true;
                setScore((prev) => {
                  const newScore = prev + 1;
                  scoreRef.current = newScore;
                  if (newScore > highScoreRef.current) {
                    setHighScore(newScore);
                    highScoreRef.current = newScore;
                    if (typeof window !== "undefined") {
                      localStorage.setItem("aero_flappy_highscore", newScore.toString());
                    }
                  }
                  return newScore;
                });
              }

              // Pipe Collision check
              if (
                bird.x + bird.radius - 4 > obs.x &&
                bird.x - bird.radius + 4 < obs.x + obs.width
              ) {
                if (
                  bird.y - bird.radius + 4 < obs.topHeight ||
                  bird.y + bird.radius - 4 > CANVAS_HEIGHT - GROUND_HEIGHT - obs.bottomHeight
                ) {
                  setGameStatus("GAME_OVER");
                  gameStatusRef.current = "GAME_OVER";
                }
              }

              if (obs.x + obs.width < -70) {
                obstaclesRef.current.splice(i, 1);
              }
            }

            // Update Particles
            for (let i = particlesRef.current.length - 1; i >= 0; i--) {
              const p = particlesRef.current[i];
              p.x += p.vx;
              p.y += p.vy;
              p.life++;
              if (p.life >= p.maxLife) {
                particlesRef.current.splice(i, 1);
              }
            }
          }

          // --- DRAW PIPES ---
          obstaclesRef.current.forEach((obs) => {
            const pipeX = Math.round(obs.x);
            const pipeW = obs.width;
            const capH = 26;

            // Top Pipe
            ctx.fillStyle = "#73bf2e";
            ctx.fillRect(pipeX, 0, pipeW, obs.topHeight);
            ctx.fillStyle = "#9ce659";
            ctx.fillRect(pipeX + 4, 0, 8, obs.topHeight);
            ctx.fillStyle = "#558022";
            ctx.fillRect(pipeX + pipeW - 12, 0, 8, obs.topHeight);

            // Top Rim Cap
            ctx.fillStyle = "#73bf2e";
            ctx.fillRect(pipeX - 5, obs.topHeight - capH, pipeW + 10, capH);
            ctx.fillStyle = "#9ce659";
            ctx.fillRect(pipeX - 1, obs.topHeight - capH, 8, capH);
            ctx.fillStyle = "#558022";
            ctx.fillRect(pipeX + pipeW - 7, obs.topHeight - capH, 8, capH);

            // Pipe Outlines
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 3.5;
            ctx.strokeRect(pipeX, 0, pipeW, obs.topHeight);
            ctx.strokeRect(pipeX - 5, obs.topHeight - capH, pipeW + 10, capH);

            // Bottom Pipe
            const botY = CANVAS_HEIGHT - GROUND_HEIGHT - obs.bottomHeight;
            ctx.fillStyle = "#73bf2e";
            ctx.fillRect(pipeX, botY, pipeW, obs.bottomHeight);
            ctx.fillStyle = "#9ce659";
            ctx.fillRect(pipeX + 4, botY, 8, obs.bottomHeight);
            ctx.fillStyle = "#558022";
            ctx.fillRect(pipeX + pipeW - 12, botY, 8, obs.bottomHeight);

            // Bottom Rim Cap
            ctx.fillStyle = "#73bf2e";
            ctx.fillRect(pipeX - 5, botY, pipeW + 10, capH);
            ctx.fillStyle = "#9ce659";
            ctx.fillRect(pipeX - 1, botY, 8, capH);
            ctx.fillStyle = "#558022";
            ctx.fillRect(pipeX + pipeW - 7, botY, 8, capH);

            // Outlines
            ctx.strokeRect(pipeX, botY, pipeW, obs.bottomHeight);
            ctx.strokeRect(pipeX - 5, botY, pipeW + 10, capH);
          });

          // --- DRAW GROUND ---
          const groundY = CANVAS_HEIGHT - GROUND_HEIGHT;
          ctx.fillStyle = "#ded895";
          ctx.fillRect(0, groundY, CANVAS_WIDTH, GROUND_HEIGHT);

          ctx.fillStyle = "#73bf2e";
          ctx.fillRect(0, groundY, CANVAS_WIDTH, 16);

          ctx.fillStyle = "#558022";
          for (let x = 0; x < CANVAS_WIDTH; x += 20) {
            ctx.fillRect(x, groundY + 16, 10, 5);
          }

          ctx.strokeStyle = "#0f172a";
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.moveTo(0, groundY);
          ctx.lineTo(CANVAS_WIDTH, groundY);
          ctx.stroke();

          // --- DRAW PARTICLES ---
          particlesRef.current.forEach((p) => {
            ctx.fillStyle = p.color;
            ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
          });

          // --- DRAW 8-BIT BIRD ---
          const bird = birdRef.current;
          const bx = Math.round(bird.x);
          const by = Math.round(bird.y);

          ctx.save();
          ctx.translate(bx, by);
          ctx.rotate(bird.rotation);

          if (birdImageRef.current) {
            // Draw anush_man.png
            ctx.drawImage(birdImageRef.current, -24, -24, 48, 48);
          } else {
            const isWingUp = Math.floor(frameCountRef.current / 6) % 2 === 0;

            // Yellow Body
            ctx.fillStyle = "#f8d038";
            ctx.fillRect(-16, -14, 28, 24);

            // Orange Belly
            ctx.fillStyle = "#f8a038";
            ctx.fillRect(-12, 2, 20, 8);

            // Eye
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(2, -12, 10, 10);
            ctx.fillStyle = "#0f172a";
            ctx.fillRect(7, -9, 5, 5);

            // Beak
            ctx.fillStyle = "#f85820";
            ctx.fillRect(12, -2, 14, 10);
            ctx.fillRect(12, 3, 10, 5);

            // Wing
            ctx.fillStyle = "#ffffff";
            if (isWingUp) {
              ctx.fillRect(-18, -16, 14, 10);
            } else {
              ctx.fillRect(-18, -4, 14, 10);
            }

            // Black Outline
            ctx.strokeStyle = "#0f172a";
            ctx.lineWidth = 3;
            ctx.strokeRect(-16, -14, 28, 24);
          }

          ctx.restore();

          // --- DRAW BIG SCORE ON CANVAS ---
          if (status === "PLAYING") {
            ctx.fillStyle = "#0f172a";
            ctx.font = "42px var(--font-pixel), cursive, monospace";
            ctx.textAlign = "center";
            ctx.fillText(`${scoreRef.current}`, CANVAS_WIDTH / 2 + 2, 72);
            ctx.fillStyle = "#ffffff";
            ctx.fillText(`${scoreRef.current}`, CANVAS_WIDTH / 2, 70);
          }
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);

    return () => {
      if (animId) {
        cancelAnimationFrame(animId);
      }
    };
  }, [canvasRef]);

  return {
    gameStatus,
    score,
    highScore,
    lastJumpTime,
    startGame,
    resetGame,
    triggerJump,
  };
}

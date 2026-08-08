import { useEffect, useRef, useState, useCallback } from "react";
import { BirdState, GameStatus, Obstacle, Particle } from "../lib/types";

const GRAVITY = 0.45;
const JUMP_FORCE = -8.5;
const OBSTACLE_SPEED = 2.8;
const OBSTACLE_SPAWN_INTERVAL = 110; // frames
const GAP_SIZE = 140;

export function useGameEngine(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const [gameStatus, setGameStatus] = useState<GameStatus>("START");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lastJumpTime, setLastJumpTime] = useState<number>(0);

  // Mutable refs for high performance 60fps canvas loop
  const birdRef = useRef<BirdState>({
    x: 80,
    y: 200,
    velocity: 0,
    radius: 14,
    rotation: 0,
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const frameCountRef = useRef(0);
  const animationFrameIdRef = useRef<number | null>(null);

  // Load high score
  useEffect(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("aero_flappy_highscore");
      if (saved) {
        setHighScore(parseInt(saved, 10) || 0);
      }
    }
  }, []);

  const triggerJump = useCallback(() => {
    if (gameStatus !== "PLAYING") return;

    birdRef.current.velocity = JUMP_FORCE;
    setLastJumpTime(Date.now());

    // Spawn jump particle burst
    const b = birdRef.current;
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        x: b.x - 5,
        y: b.y + (Math.random() * 10 - 5),
        vx: -Math.random() * 3 - 1,
        vy: (Math.random() - 0.5) * 4,
        life: 0,
        maxLife: 20 + Math.random() * 10,
        size: 2 + Math.random() * 3,
        color: i % 2 === 0 ? "#00f0ff" : "#ffffff",
      });
    }
  }, [gameStatus]);

  const startGame = useCallback(() => {
    birdRef.current = {
      x: 80,
      y: 200,
      velocity: JUMP_FORCE * 0.7,
      radius: 14,
      rotation: 0,
    };
    obstaclesRef.current = [];
    particlesRef.current = [];
    frameCountRef.current = 0;
    setScore(0);
    setGameStatus("PLAYING");
  }, []);

  const resetGame = useCallback(() => {
    setGameStatus("START");
  }, []);

  // Main Canvas Render & Physics Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = canvas.width;
    let height = canvas.height;

    const render = () => {
      width = canvas.width;
      height = canvas.height;

      // Clear Canvas & Draw Cyber Grid Background
      ctx.fillStyle = "#0a0d14";
      ctx.fillRect(0, 0, width, height);

      // Subtle cyber grid lines
      ctx.strokeStyle = "rgba(30, 41, 59, 0.4)";
      ctx.lineWidth = 1;
      const gridSize = 40;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      if (gameStatus === "PLAYING") {
        frameCountRef.current++;

        // 1. Update Bird Physics
        const bird = birdRef.current;
        bird.velocity += GRAVITY;
        bird.y += bird.velocity;
        bird.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 4, bird.velocity * 0.06));

        // Canvas Boundary Collisions
        if (bird.y - bird.radius <= 0 || bird.y + bird.radius >= height) {
          endGame();
        }

        // 2. Spawn Obstacles
        if (frameCountRef.current % OBSTACLE_SPAWN_INTERVAL === 0) {
          const minHeight = 50;
          const maxHeight = height - GAP_SIZE - minHeight;
          const topHeight = Math.floor(Math.random() * (maxHeight - minHeight + 1)) + minHeight;

          obstaclesRef.current.push({
            x: width + 20,
            topHeight,
            bottomHeight: height - topHeight - GAP_SIZE,
            width: 48,
            passed: false,
          });
        }

        // 3. Move & Check Obstacles
        for (let i = obstaclesRef.current.length - 1; i >= 0; i--) {
          const obs = obstaclesRef.current[i];
          obs.x -= OBSTACLE_SPEED;

          // Check Score
          if (!obs.passed && obs.x + obs.width < bird.x) {
            obs.passed = true;
            setScore((prev) => {
              const newScore = prev + 1;
              if (newScore > highScore) {
                setHighScore(newScore);
                if (typeof window !== "undefined") {
                  localStorage.setItem("aero_flappy_highscore", newScore.toString());
                }
              }
              return newScore;
            });
          }

          // Check Collision
          if (
            bird.x + bird.radius > obs.x &&
            bird.x - bird.radius < obs.x + obs.width
          ) {
            if (bird.y - bird.radius < obs.topHeight || bird.y + bird.radius > height - obs.bottomHeight) {
              endGame();
            }
          }

          // Remove off-screen obstacles
          if (obs.x + obs.width < -50) {
            obstaclesRef.current.splice(i, 1);
          }
        }

        // 4. Update Particles
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

      // --- RENDER GAME ELEMENTS ---

      // Render Obstacles (Cyber Gates)
      obstaclesRef.current.forEach((obs) => {
        // Top Gate Pillar
        const gradTop = ctx.createLinearGradient(obs.x, 0, obs.x + obs.width, 0);
        gradTop.addColorStop(0, "#1e293b");
        gradTop.addColorStop(0.5, "#334155");
        gradTop.addColorStop(1, "#0f172a");

        ctx.fillStyle = gradTop;
        ctx.fillRect(obs.x, 0, obs.width, obs.topHeight);
        ctx.strokeStyle = "#00f0ff";
        ctx.lineWidth = 1.5;
        ctx.strokeRect(obs.x, 0, obs.width, obs.topHeight);

        // Neon Glow Cap on Top Gate
        ctx.fillStyle = "#00f0ff";
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = 8;
        ctx.fillRect(obs.x - 2, obs.topHeight - 6, obs.width + 4, 6);
        ctx.shadowBlur = 0;

        // Bottom Gate Pillar
        const bottomY = height - obs.bottomHeight;
        ctx.fillStyle = gradTop;
        ctx.fillRect(obs.x, bottomY, obs.width, obs.bottomHeight);
        ctx.strokeStyle = "#00f0ff";
        ctx.strokeRect(obs.x, bottomY, obs.width, obs.bottomHeight);

        // Neon Glow Cap on Bottom Gate
        ctx.fillStyle = "#00f0ff";
        ctx.shadowColor = "#00f0ff";
        ctx.shadowBlur = 8;
        ctx.fillRect(obs.x - 2, bottomY, obs.width + 4, 6);
        ctx.shadowBlur = 0;
      });

      // Render Particles
      particlesRef.current.forEach((p) => {
        const alpha = 1 - p.life / p.maxLife;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1.0;
      });

      // Render Bird (Minimal Monochrome Cyber Shape)
      const bird = birdRef.current;
      ctx.save();
      ctx.translate(bird.x, bird.y);
      ctx.rotate(bird.rotation);

      // Bird Neon Outer Glow
      ctx.shadowColor = "#00f0ff";
      ctx.shadowBlur = 12;

      // Geometric Diamond / Cyber Bird Body
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.moveTo(bird.radius * 1.3, 0);
      ctx.lineTo(-bird.radius * 0.8, -bird.radius * 0.9);
      ctx.lineTo(-bird.radius * 0.4, 0);
      ctx.lineTo(-bird.radius * 0.8, bird.radius * 0.9);
      ctx.closePath();
      ctx.fill();

      // Cyber Wing Overlay
      ctx.fillStyle = "#00f0ff";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-bird.radius * 0.6, -bird.radius * 1.1);
      ctx.lineTo(-bird.radius * 0.2, 0);
      ctx.closePath();
      ctx.fill();

      ctx.restore();

      animationFrameIdRef.current = requestAnimationFrame(render);
    };

    const endGame = () => {
      setGameStatus("GAME_OVER");
    };

    animationFrameIdRef.current = requestAnimationFrame(render);

    return () => {
      if (animationFrameIdRef.current) {
        cancelAnimationFrame(animationFrameIdRef.current);
      }
    };
  }, [gameStatus, canvasRef, highScore]);

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

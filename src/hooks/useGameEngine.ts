import { useEffect, useRef, useState, useCallback } from "react";
import { BirdState, GameStatus, Obstacle, Particle } from "@/lib/types";

const GRAVITY = 0.42;
const JUMP_FORCE = -8.2;
const OBSTACLE_SPEED = 2.6;
const OBSTACLE_SPAWN_INTERVAL = 115; // frames
const GAP_SIZE = 145;
const GROUND_HEIGHT = 56;

export function useGameEngine(canvasRef: React.RefObject<HTMLCanvasElement>) {
  const [gameStatus, setGameStatus] = useState<GameStatus>("START");
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const [lastJumpTime, setLastJumpTime] = useState<number>(0);

  const birdRef = useRef<BirdState>({
    x: 90,
    y: 200,
    velocity: 0,
    radius: 16,
    rotation: 0,
  });

  const obstaclesRef = useRef<Obstacle[]>([]);
  const particlesRef = useRef<Particle[]>([]);
  const cloudsRef = useRef<{ x: number; y: number; scale: number; speed: number }[]>([]);
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

  // Initialize random pixel clouds
  useEffect(() => {
    cloudsRef.current = [
      { x: 40, y: 50, scale: 1.2, speed: 0.4 },
      { x: 220, y: 90, scale: 0.9, speed: 0.3 },
      { x: 450, y: 40, scale: 1.4, speed: 0.5 },
      { x: 680, y: 110, scale: 1.0, speed: 0.35 },
    ];
  }, []);

  const triggerJump = useCallback(() => {
    if (gameStatus !== "PLAYING") return;

    birdRef.current.velocity = JUMP_FORCE;
    setLastJumpTime(Date.now());

    // Spawn retro 8-bit star/coin particles
    const b = birdRef.current;
    for (let i = 0; i < 6; i++) {
      particlesRef.current.push({
        x: b.x - 10,
        y: b.y + (Math.random() * 12 - 6),
        vx: -Math.random() * 3 - 1,
        vy: (Math.random() - 0.5) * 4,
        life: 0,
        maxLife: 18 + Math.random() * 8,
        size: 4, // Blocky pixel particles
        color: i % 2 === 0 ? "#facc15" : "#ffffff",
      });
    }
  }, [gameStatus]);

  const startGame = useCallback(() => {
    birdRef.current = {
      x: 90,
      y: 200,
      velocity: JUMP_FORCE * 0.7,
      radius: 16,
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

  // Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Enable crisp pixel rendering
    ctx.imageSmoothingEnabled = false;

    let width = canvas.width;
    let height = canvas.height;

    const render = () => {
      width = canvas.width;
      height = canvas.height;

      // 1. Draw Retro Sky Background (#70c5ce)
      ctx.fillStyle = "#70c5ce";
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Moving Pixel Clouds
      ctx.fillStyle = "rgba(255, 255, 255, 0.9)";
      cloudsRef.current.forEach((cloud) => {
        cloud.x -= cloud.speed;
        if (cloud.x < -120) cloud.x = width + 50;

        // Draw 8-bit Cloud Blobs
        const cx = cloud.x;
        const cy = cloud.y;
        ctx.fillRect(cx, cy, 50 * cloud.scale, 20 * cloud.scale);
        ctx.fillRect(cx + 10 * cloud.scale, cy - 10 * cloud.scale, 30 * cloud.scale, 30 * cloud.scale);
        ctx.fillRect(cx + 25 * cloud.scale, cy - 15 * cloud.scale, 20 * cloud.scale, 25 * cloud.scale);
      });

      // 3. Update Physics & Obstacles if PLAYING
      if (gameStatus === "PLAYING") {
        frameCountRef.current++;

        // Update Bird
        const bird = birdRef.current;
        bird.velocity += GRAVITY;
        bird.y += bird.velocity;
        bird.rotation = Math.min(Math.PI / 4, Math.max(-Math.PI / 5, bird.velocity * 0.07));

        // Ground & Ceiling Collisions
        if (bird.y - bird.radius <= 0 || bird.y + bird.radius >= height - GROUND_HEIGHT) {
          endGame();
        }

        // Spawn Obstacles
        if (frameCountRef.current % OBSTACLE_SPAWN_INTERVAL === 0) {
          const minH = 60;
          const maxH = height - GROUND_HEIGHT - GAP_SIZE - minH;
          const topHeight = Math.floor(Math.random() * (maxH - minH + 1)) + minH;

          obstaclesRef.current.push({
            x: width + 20,
            topHeight,
            bottomHeight: height - GROUND_HEIGHT - topHeight - GAP_SIZE,
            width: 58,
            passed: false,
          });
        }

        // Move Obstacles & Check Collisions
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

          // Check Pipe Collision
          if (
            bird.x + bird.radius - 4 > obs.x &&
            bird.x - bird.radius + 4 < obs.x + obs.width
          ) {
            if (
              bird.y - bird.radius + 4 < obs.topHeight ||
              bird.y + bird.radius - 4 > height - GROUND_HEIGHT - obs.bottomHeight
            ) {
              endGame();
            }
          }

          if (obs.x + obs.width < -60) {
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

      // --- RENDER GAME GRAPHICS ---

      // Draw Retro Pixel Green Pipes
      obstaclesRef.current.forEach((obs) => {
        const pipeX = Math.round(obs.x);
        const pipeW = obs.width;
        const capH = 24;

        // --- TOP PIPE ---
        // Body
        ctx.fillStyle = "#73bf2e"; // Classic Flappy Pipe Green
        ctx.fillRect(pipeX, 0, pipeW, obs.topHeight);

        // Highlight & Shadow Lines
        ctx.fillStyle = "#9ce659"; // Highlight
        ctx.fillRect(pipeX + 4, 0, 6, obs.topHeight);
        ctx.fillStyle = "#558022"; // Shadow
        ctx.fillRect(pipeX + pipeW - 10, 0, 6, obs.topHeight);

        // Top Pipe Rim Cap
        ctx.fillStyle = "#73bf2e";
        ctx.fillRect(pipeX - 4, obs.topHeight - capH, pipeW + 8, capH);
        ctx.fillStyle = "#9ce659";
        ctx.fillRect(pipeX, obs.topHeight - capH, 6, capH);
        ctx.fillStyle = "#558022";
        ctx.fillRect(pipeX + pipeW - 6, obs.topHeight - capH, 6, capH);

        // Black Retro Outlines
        ctx.strokeStyle = "#0f172a";
        ctx.lineWidth = 3;
        ctx.strokeRect(pipeX, 0, pipeW, obs.topHeight);
        ctx.strokeRect(pipeX - 4, obs.topHeight - capH, pipeW + 8, capH);

        // --- BOTTOM PIPE ---
        const botY = height - GROUND_HEIGHT - obs.bottomHeight;
        // Body
        ctx.fillStyle = "#73bf2e";
        ctx.fillRect(pipeX, botY, pipeW, obs.bottomHeight);

        // Highlight & Shadow
        ctx.fillStyle = "#9ce659";
        ctx.fillRect(pipeX + 4, botY, 6, obs.bottomHeight);
        ctx.fillStyle = "#558022";
        ctx.fillRect(pipeX + pipeW - 10, botY, 6, obs.bottomHeight);

        // Bottom Pipe Rim Cap
        ctx.fillStyle = "#73bf2e";
        ctx.fillRect(pipeX - 4, botY, pipeW + 8, capH);
        ctx.fillStyle = "#9ce659";
        ctx.fillRect(pipeX, botY, 6, capH);
        ctx.fillStyle = "#558022";
        ctx.fillRect(pipeX + pipeW - 6, botY, 6, capH);

        // Black Outlines
        ctx.strokeRect(pipeX, botY, pipeW, obs.bottomHeight);
        ctx.strokeRect(pipeX - 4, botY, pipeW + 8, capH);
      });

      // Draw Ground Strip (#ded895 & #73bf2e)
      const groundY = height - GROUND_HEIGHT;
      ctx.fillStyle = "#ded895"; // Earth base
      ctx.fillRect(0, groundY, width, GROUND_HEIGHT);

      // Top Green Grass Strip
      ctx.fillStyle = "#73bf2e";
      ctx.fillRect(0, groundY, width, 14);

      // Dark Green Pixel Grass Pattern
      ctx.fillStyle = "#558022";
      for (let x = 0; x < width; x += 16) {
        ctx.fillRect(x, groundY + 14, 8, 4);
      }

      // Ground Border
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(width, groundY);
      ctx.stroke();

      // Render Pixel Particles
      particlesRef.current.forEach((p) => {
        ctx.fillStyle = p.color;
        ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
      });

      // Render 8-Bit Pixel Flappy Bird
      const bird = birdRef.current;
      const bx = Math.round(bird.x);
      const by = Math.round(bird.y);

      ctx.save();
      ctx.translate(bx, by);
      ctx.rotate(bird.rotation);

      // Draw Pixel Bird Body (Yellow #f8d038, Orange #f8a038, White Eye, Red Beak)
      const isWingUp = Math.floor(frameCountRef.current / 6) % 2 === 0;

      // Body yellow box
      ctx.fillStyle = "#f8d038";
      ctx.fillRect(-14, -12, 24, 20);

      // Belly orange
      ctx.fillStyle = "#f8a038";
      ctx.fillRect(-10, 2, 16, 6);

      // Eye (White + Black Pupil)
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(2, -10, 8, 8);
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(6, -8, 4, 4);

      // Beak (Red/Orange #f85820)
      ctx.fillStyle = "#f85820";
      ctx.fillRect(8, -2, 12, 8);
      ctx.fillRect(8, 2, 8, 4);

      // Wing (Animated pixel wing)
      ctx.fillStyle = "#ffffff";
      if (isWingUp) {
        ctx.fillRect(-16, -14, 12, 8);
      } else {
        ctx.fillRect(-16, -4, 12, 8);
      }

      // Black Pixel Outline around bird
      ctx.strokeStyle = "#0f172a";
      ctx.lineWidth = 2.5;
      ctx.strokeRect(-14, -12, 24, 20);

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

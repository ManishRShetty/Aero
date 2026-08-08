export type ActionType = "JUMP" | "NONE";
export type ControlMode = "HYBRID" | "MANUAL_ONLY" | "AI_ONLY";

export interface PredictRequest {
  image_base64: string;
  timestamp: number;
}

export interface PredictResponse {
  action: ActionType;
  confidence: number;
  processing_time_ms: number;
  probabilities?: SoftmaxProbabilities;
}

export interface SoftmaxProbabilities {
  neutral: number;
  smile: number;
  surprise: number;
}

export interface AITelemetryState {
  action: ActionType;
  confidence: number;
  modelLatencyMs: number;
  roundTripLatencyMs: number;
  lastTimestamp: number;
  probabilities: SoftmaxProbabilities;
  fps: number;
  isMock: boolean;
  isConnected: boolean;
  error: string | null;
}

export interface GameSettings {
  confidenceThreshold: number;
  frameIntervalMs: number;
  mockMode: boolean;
  controlMode: ControlMode;
  apiUrl: string;
  keyboardFallback: boolean;
  particleEffects: boolean;
  soundEnabled: boolean;
}

export type GameStatus = "START" | "PLAYING" | "PAUSED" | "GAME_OVER";

export interface BirdState {
  x: number;
  y: number;
  velocity: number;
  radius: number;
  rotation: number;
}

export interface Obstacle {
  x: number;
  topHeight: number;
  bottomHeight: number;
  width: number;
  passed: boolean;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

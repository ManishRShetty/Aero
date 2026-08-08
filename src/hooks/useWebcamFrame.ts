import { useEffect, useRef, useState, useCallback } from "react";
import { AITelemetryState, GameSettings } from "../lib/types";
import { InferenceService } from "../lib/api";

export function useWebcamFrame(
  settings: GameSettings,
  onActionReceived?: (action: "JUMP" | "NONE") => void
) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const offscreenCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [manualJumpRequested, setManualJumpRequested] = useState(false);

  const [telemetry, setTelemetry] = useState<AITelemetryState>({
    action: "NONE",
    confidence: 0,
    modelLatencyMs: 0,
    roundTripLatencyMs: 0,
    lastTimestamp: Date.now(),
    probabilities: { neutral: 0.95, smile: 0.04, surprise: 0.01 },
    fps: 0,
    isMock: settings.mockMode,
    isConnected: true,
    error: null,
  });

  // Track FPS calculation
  const frameTimesRef = useRef<number[]>([]);

  // Initialize camera
  const startCamera = useCallback(async () => {
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("Webcam access not supported in this browser context.");
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setIsCameraActive(true);
        setTelemetry((prev) => ({ ...prev, error: null }));
      }
    } catch (err: any) {
      console.error("Camera startup error:", err);
      setIsCameraActive(false);
      setTelemetry((prev) => ({
        ...prev,
        error: err.message || "Could not access camera",
        isConnected: settings.mockMode,
      }));
    }
  }, [settings.mockMode]);

  const stopCamera = useCallback(() => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Trigger camera startup
  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, [startCamera, stopCamera]);

  // Capture frame & run inference loop
  useEffect(() => {
    let timerId: NodeJS.Timeout;
    let isProcessing = false;

    // Ensure offscreen 224x224 canvas exists
    if (!offscreenCanvasRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = 224;
      canvas.height = 224;
      offscreenCanvasRef.current = canvas;
    }

    const captureAndInfer = async () => {
      if (isProcessing) return;
      isProcessing = true;

      const requestStartTime = performance.now();

      try {
        let base64Image = "";

        // If camera is running, draw video frame onto 224x224 canvas
        if (isCameraActive && videoRef.current && offscreenCanvasRef.current) {
          const ctx = offscreenCanvasRef.current.getContext("2d");
          if (ctx) {
            ctx.drawImage(
              videoRef.current,
              0,
              0,
              offscreenCanvasRef.current.width,
              offscreenCanvasRef.current.height
            );
            base64Image = offscreenCanvasRef.current.toDataURL("image/jpeg", 0.6);
          }
        }

        // Call prediction service (Live FastAPI or Mock)
        const { response, probabilities } = await InferenceService.predict(
          base64Image || "dummy_base64_string",
          settings.apiUrl,
          settings.mockMode,
          settings.confidenceThreshold,
          manualJumpRequested
        );

        // Calculate end to end latency & FPS
        const endTime = performance.now();
        const roundTripMs = endTime - requestStartTime;

        // Calculate smooth FPS over last 10 frames
        const now = Date.now();
        frameTimesRef.current.push(now);
        frameTimesRef.current = frameTimesRef.current.filter((t) => now - t <= 1000);
        const currentFps = frameTimesRef.current.length;

        setTelemetry({
          action: response.action,
          confidence: response.confidence,
          modelLatencyMs: response.processing_time_ms,
          roundTripLatencyMs: Math.round(roundTripMs),
          lastTimestamp: now,
          probabilities,
          fps: currentFps,
          isMock: settings.mockMode,
          isConnected: true,
          error: null,
        });

        if (response.action === "JUMP" && onActionReceived) {
          onActionReceived("JUMP");
        }

        if (manualJumpRequested) {
          setManualJumpRequested(false);
        }
      } catch (err: any) {
        setTelemetry((prev) => ({
          ...prev,
          isConnected: false,
          error: err.message || "Failed to reach inference server",
        }));
      } finally {
        isProcessing = false;
      }
    };

    timerId = setInterval(captureAndInfer, settings.frameIntervalMs);

    return () => {
      clearInterval(timerId);
    };
  }, [
    isCameraActive,
    settings.apiUrl,
    settings.mockMode,
    settings.confidenceThreshold,
    settings.frameIntervalMs,
    manualJumpRequested,
    onActionReceived,
  ]);

  const triggerManualJump = () => {
    setManualJumpRequested(true);
    if (onActionReceived) {
      onActionReceived("JUMP");
    }
  };

  return {
    videoRef,
    isCameraActive,
    startCamera,
    stopCamera,
    telemetry,
    triggerManualJump,
  };
}

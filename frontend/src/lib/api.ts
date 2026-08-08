import { PredictRequest, PredictResponse, SoftmaxProbabilities } from "./types";

export class InferenceService {
  private static mockSmileState = false;
  private static mockTickCount = 0;

  /**
   * Ping FastAPI health endpoint
   */
  public static async checkHealth(apiUrl: string): Promise<boolean> {
    try {
      const baseUrl = apiUrl.replace(/\/api\/v1\/predict\/?$/, "");
      const healthUrl = `${baseUrl}/health`;
      const res = await fetch(healthUrl, { method: "GET", signal: AbortSignal.timeout(3000) });
      return res.ok;
    } catch {
      return false;
    }
  }

  /**
   * Send frame to live FastAPI backend or run mock prediction
   */
  public static async predict(
    imageBase64: string,
    apiUrl: string,
    useMock: boolean,
    confidenceThreshold: number,
    manualTrigger: boolean = false
  ): Promise<{ response: PredictResponse; probabilities: SoftmaxProbabilities }> {
    const startTime = performance.now();

    // Strip prefix if present
    const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

    if (useMock) {
      return this.simulateMockInference(manualTrigger, confidenceThreshold, startTime);
    }

    try {
      const payload: PredictRequest = {
        image_base64: cleanBase64,
        timestamp: Date.now(),
      };

      const res = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }

      const data: PredictResponse = await res.json();
      
      // Calculate softmax representation for visual telemetry dashboard
      const isJump = data.action === "JUMP" && data.confidence >= confidenceThreshold;
      const smileProb = isJump ? data.confidence : Math.max(0.05, 1 - data.confidence);
      const neutralProb = isJump ? Math.max(0.02, (1 - smileProb) * 0.8) : Math.min(0.92, data.confidence);
      const surpriseProb = Math.max(0.01, 1 - (smileProb + neutralProb));

      return {
        response: {
          action: isJump ? "JUMP" : "NONE",
          confidence: data.confidence,
          processing_time_ms: data.processing_time_ms || Math.round(performance.now() - startTime),
        },
        probabilities: {
          neutral: Number(neutralProb.toFixed(3)),
          smile: Number(smileProb.toFixed(3)),
          surprise: Number(surpriseProb.toFixed(3)),
        },
      };
    } catch (err) {
      console.warn("FastAPI prediction failed, falling back to mock indicator:", err);
      // Return error state or fallback mock
      throw err;
    }
  }

  /**
   * Simulated Deep Learning Inference Engine for standalone testing
   */
  private static simulateMockInference(
    manualTrigger: boolean,
    confidenceThreshold: number,
    startTime: number
  ): { response: PredictResponse; probabilities: SoftmaxProbabilities } {
    this.mockTickCount++;

    // Periodic smile simulation or manual trigger
    let isSmile = manualTrigger;
    
    // Auto-pulse smile every ~30 frames if not manually triggering
    if (!manualTrigger && this.mockTickCount % 35 >= 30) {
      isSmile = true;
    }

    const confidence = isSmile
      ? 0.88 + Math.random() * 0.11 // High confidence smile (0.88 - 0.99)
      : 0.85 + Math.random() * 0.12; // High confidence neutral (0.85 - 0.97)

    const smileProb = isSmile ? confidence : Math.max(0.04, (1 - confidence) * 0.7);
    const neutralProb = isSmile ? Math.max(0.03, (1 - smileProb) * 0.8) : confidence;
    const surpriseProb = Math.max(0.01, 1 - (smileProb + neutralProb));

    const action = isSmile && confidence >= confidenceThreshold ? "JUMP" : "NONE";
    const processingTime = Math.floor(10 + Math.random() * 12); // Simulated ResNet18 GPU/CPU inference 10-22ms

    return {
      response: {
        action,
        confidence: Number(confidence.toFixed(3)),
        processing_time_ms: processingTime,
      },
      probabilities: {
        neutral: Number(neutralProb.toFixed(3)),
        smile: Number(smileProb.toFixed(3)),
        surprise: Number(surpriseProb.toFixed(3)),
      },
    };
  }
}

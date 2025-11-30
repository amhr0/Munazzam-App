/**
 * Voice transcription helper using OpenAI Whisper API
 *
 * Frontend implementation guide:
 * 1. Capture audio using MediaRecorder API
 * 2. Upload audio to storage to get URL
 * 3. Call transcription with the URL
 * 
 * Example usage:
 * ```tsx
 * // Frontend component
 * const transcribeMutation = trpc.voice.transcribe.useMutation({
 *   onSuccess: (data) => {
 *     console.log(data.text); // Full transcription
 *     console.log(data.language); // Detected language
 *     console.log(data.segments); // Timestamped segments
 *   }
 * });
 * 
 * // After uploading audio to storage
 * transcribeMutation.mutate({
 *   audioUrl: uploadedAudioUrl,
 *   language: 'en', // optional
 *   prompt: 'Transcribe the meeting' // optional
 * });
 * ```
 */
import { ENV } from "./env";

export type TranscribeOptions = {
  audioUrl: string; // URL to the audio file
  language?: string; // Optional: specify language code (e.g., "en", "es", "zh", "ar")
  prompt?: string; // Optional: custom prompt for the transcription
};

// Native Whisper API segment format
export type WhisperSegment = {
  id: number;
  seek: number;
  start: number;
  end: number;
  text: string;
  tokens: number[];
  temperature: number;
  avg_logprob: number;
  compression_ratio: number;
  no_speech_prob: number;
};

// Native Whisper API response format
export type WhisperResponse = {
  text: string;
  language: string;
  duration: number;
  segments?: WhisperSegment[];
};

type TranscriptionError = {
  error: string;
  code: string;
  details?: string;
};

export type TranscriptionResult = WhisperResponse | TranscriptionError;

function isError(result: TranscriptionResult): result is TranscriptionError {
  return "error" in result;
}

/**
 * Transcribe audio using OpenAI Whisper API
 * @param options - Transcription options
 * @returns Whisper API response or error
 */
export async function transcribeAudio(
  options: TranscribeOptions
): Promise<TranscriptionResult> {
  const { audioUrl, language, prompt } = options;

  try {
    // Step 1: Validate OpenAI API key
    if (!ENV.openaiApiKey) {
      return {
        error: "OpenAI API key not configured",
        code: "MISSING_API_KEY",
        details: "Set OPENAI_API_KEY environment variable"
      };
    }

    // Step 2: Download audio file from URL
    const audioResponse = await fetch(audioUrl);
    if (!audioResponse.ok) {
      return {
        error: "Failed to download audio file",
        code: "DOWNLOAD_FAILED",
        details: `${audioResponse.status} ${audioResponse.statusText}`
      };
    }

    const audioBuffer = await audioResponse.arrayBuffer();
    const audioBlob = new Blob([audioBuffer]);

    // Step 3: Validate file size (max 25MB for Whisper API)
    const maxSize = 25 * 1024 * 1024; // 25MB
    if (audioBlob.size > maxSize) {
      return {
        error: "Audio file too large",
        code: "FILE_TOO_LARGE",
        details: `File size: ${(audioBlob.size / 1024 / 1024).toFixed(2)}MB, max: 25MB`
      };
    }

    // Step 4: Prepare form data
    const formData = new FormData();
    formData.append("file", audioBlob, "audio.webm");
    formData.append("model", "whisper-1");
    formData.append("response_format", "verbose_json");
    
    if (language) {
      formData.append("language", language);
    }
    
    if (prompt) {
      formData.append("prompt", prompt);
    }

    // Step 5: Call OpenAI Whisper API
    const response = await fetch("https://api.openai.com/v1/audio/transcriptions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${ENV.openaiApiKey}`,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return {
        error: "Transcription API request failed",
        code: "TRANSCRIPTION_FAILED",
        details: `${response.status} ${response.statusText}${errorText ? `: ${errorText}` : ""}`
      };
    }

    // Step 6: Parse and return response
    const result = await response.json();
    return result as WhisperResponse;

  } catch (error) {
    return {
      error: "Transcription failed",
      code: "UNKNOWN_ERROR",
      details: error instanceof Error ? error.message : String(error)
    };
  }
}

/**
 * Helper to check if transcription was successful
 */
export function isTranscriptionSuccess(
  result: TranscriptionResult
): result is WhisperResponse {
  return !isError(result);
}

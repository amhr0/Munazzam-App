import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';

interface TranscriptItem {
  speaker: 'interviewer' | 'candidate';
  text: string;
  timestamp: number;
}

interface Suggestion {
  type: 'question' | 'concern' | 'insight';
  content: string;
  timestamp: number;
}

interface RedFlag {
  flag: string;
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
}

interface SessionSummary {
  sessionId: string;
  summary: string;
  duration: number;
}

export function useLiveCopilot() {
  const [isConnected, setIsConnected] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [transcript, setTranscript] = useState<TranscriptItem[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [redFlags, setRedFlags] = useState<RedFlag[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [sessionSummary, setSessionSummary] = useState<SessionSummary | null>(null);

  const socketRef = useRef<Socket | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Initialize Socket.io connection
  useEffect(() => {
    const socket = io('/live-copilot', {
      path: '/socket.io',
      transports: ['websocket', 'polling']
    });

    socket.on('connect', () => {
      console.log('[LiveCopilot] Connected');
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      console.log('[LiveCopilot] Disconnected');
      setIsConnected(false);
    });

    socket.on('session-started', (data: { sessionId: string }) => {
      console.log('[LiveCopilot] Session started:', data.sessionId);
      setSessionId(data.sessionId);
    });

    socket.on('transcription', (data: TranscriptItem) => {
      console.log('[LiveCopilot] Transcription:', data);
      setTranscript(prev => [...prev, data]);
    });

    socket.on('suggestions', (data: { suggestions: Suggestion[] }) => {
      console.log('[LiveCopilot] Suggestions:', data.suggestions);
      setSuggestions(prev => [...prev, ...data.suggestions]);
    });

    socket.on('red-flags', (data: { redFlags: RedFlag[] }) => {
      console.log('[LiveCopilot] Red flags:', data.redFlags);
      setRedFlags(prev => [...prev, ...data.redFlags]);
    });

    socket.on('session-ended', (data: SessionSummary) => {
      console.log('[LiveCopilot] Session ended:', data);
      setSessionSummary(data);
      setIsRecording(false);
    });

    socket.on('error', (data: { message: string }) => {
      console.error('[LiveCopilot] Error:', data.message);
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
    };
  }, []);

  // Start interview session
  const startSession = async (userId: number, candidateName: string, position: string) => {
    if (!socketRef.current) return;

    socketRef.current.emit('start-session', {
      userId,
      candidateName,
      position
    });

    // Reset state
    setTranscript([]);
    setSuggestions([]);
    setRedFlags([]);
    setSessionSummary(null);
  };

  // Start audio recording
  const startRecording = async (speaker: 'interviewer' | 'candidate') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      });

      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const base64Audio = reader.result as string;
          const base64Data = base64Audio.split(',')[1]; // Remove data:audio/webm;base64, prefix

          // Send to server
          if (socketRef.current && sessionId) {
            socketRef.current.emit('audio-chunk', {
              sessionId,
              audioData: base64Data,
              speaker
            });
          }
        };

        // Clear chunks
        audioChunksRef.current = [];

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      // Record in chunks (every 5 seconds for real-time processing)
      mediaRecorder.start();
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 5000);

      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);

      return mediaRecorder;
    } catch (error) {
      console.error('[LiveCopilot] Error starting recording:', error);
      throw error;
    }
  };

  // Stop recording
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  // End session
  const endSession = () => {
    if (!socketRef.current || !sessionId) return;

    stopRecording();
    socketRef.current.emit('end-session', { sessionId });
  };

  return {
    isConnected,
    sessionId,
    transcript,
    suggestions,
    redFlags,
    isRecording,
    sessionSummary,
    startSession,
    startRecording,
    stopRecording,
    endSession
  };
}

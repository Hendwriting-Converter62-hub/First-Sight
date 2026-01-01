
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import { X, Mic, MicOff, Video, VideoOff, Send, MessageSquare, Loader2, Volume2, Sparkles } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// Audio Helpers
function decode(base64: string) {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

function encode(bytes: Uint8Array) {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function decodeAudioData(
  data: Uint8Array,
  ctx: AudioContext,
  sampleRate: number,
  numChannels: number,
): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);

  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}

interface LiveSessionProps {
  onClose: () => void;
}

const LiveSession: React.FC<LiveSessionProps> = ({ onClose }) => {
  const { t } = useLanguage();
  const [isConnected, setIsConnected] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [transcriptions, setTranscriptions] = useState<{role: 'user' | 'model', text: string}[]>([]);
  const [currentInput, setCurrentInput] = useState('');
  const [currentOutput, setCurrentOutput] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sessionRef = useRef<any>(null);
  const audioContextsRef = useRef<{ input: AudioContext; output: AudioContext } | null>(null);
  const nextStartTimeRef = useRef<number>(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const frameIntervalRef = useRef<number | null>(null);

  const cleanup = useCallback(() => {
    if (frameIntervalRef.current) window.clearInterval(frameIntervalRef.current);
    if (sessionRef.current) sessionRef.current.close();
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    if (audioContextsRef.current) {
      audioContextsRef.current.input.close();
      audioContextsRef.current.output.close();
    }
  }, []);

  const startSession = async () => {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      const outputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      audioContextsRef.current = { input: inputAudioContext, output: outputAudioContext };

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        callbacks: {
          onopen: () => {
            setIsConnected(true);
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              if (isMuted) return;
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) {
                int16[i] = inputData[i] * 32768;
              }
              const pcmBlob = {
                data: encode(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };
              sessionPromise.then(session => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);

            // Video Streaming
            frameIntervalRef.current = window.setInterval(() => {
              if (isVideoOff || !videoRef.current || !canvasRef.current) return;
              const ctx = canvasRef.current.getContext('2d');
              if (!ctx) return;
              canvasRef.current.width = videoRef.current.videoWidth;
              canvasRef.current.height = videoRef.current.videoHeight;
              ctx.drawImage(videoRef.current, 0, 0);
              canvasRef.current.toBlob(async (blob) => {
                if (blob) {
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    const base64Data = (reader.result as string).split(',')[1];
                    sessionPromise.then(session => {
                      session.sendRealtimeInput({ media: { data: base64Data, mimeType: 'image/jpeg' } });
                    });
                  };
                  reader.readAsDataURL(blob);
                }
              }, 'image/jpeg', 0.6);
            }, 1000);
          },
          onmessage: async (message: LiveServerMessage) => {
            // Handle Audio
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const ctx = audioContextsRef.current!.output;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const audioBuffer = await decodeAudioData(decode(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += audioBuffer.duration;
              sourcesRef.current.add(source);
              source.onended = () => sourcesRef.current.delete(source);
            }

            // Handle Interruptions
            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }

            // Handle Transcriptions
            if (message.serverContent?.inputAudioTranscription) {
              setCurrentInput(prev => prev + message.serverContent!.inputAudioTranscription!.text);
            }
            if (message.serverContent?.outputAudioTranscription) {
              setCurrentOutput(prev => prev + message.serverContent!.outputAudioTranscription!.text);
            }
            if (message.serverContent?.turnComplete) {
              setTranscriptions(prev => [
                ...prev,
                { role: 'user', text: currentInput },
                { role: 'model', text: currentOutput }
              ]);
              setCurrentInput('');
              setCurrentOutput('');
            }
          },
          onerror: (e) => console.error('Live Error:', e),
          onclose: () => setIsConnected(false),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: 'You are an AI dating assistant for First Sight. You help users find matches, provide relationship advice, and maintain a friendly, encouraging conversation. Keep responses natural and conversational.',
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error('Failed to start live session:', err);
      alert('Could not access camera/microphone or connect to AI.');
      onClose();
    }
  };

  useEffect(() => {
    startSession();
    return cleanup;
  }, []);

  return (
    <div className="fixed inset-0 z-[100] bg-gray-900 flex flex-col items-center justify-center p-4 md:p-8 animate-in fade-in zoom-in duration-300">
      <div className="w-full max-w-5xl h-full flex flex-col bg-gray-800 rounded-3xl shadow-2xl border border-white/10 overflow-hidden relative">
        
        {/* Header */}
        <div className="p-6 border-b border-white/5 flex justify-between items-center bg-gray-800/50 backdrop-blur-md z-10">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Sparkles size={20} className="text-primary" /> AI Live Match Assistant
            </h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all">
            <X size={24} />
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
          
          {/* Visualizer / Video Section */}
          <div className="flex-1 relative bg-black flex flex-col items-center justify-center p-8">
            <video ref={videoRef} autoPlay muted playsInline className={`w-full h-full object-cover absolute inset-0 ${isVideoOff ? 'hidden' : ''}`} />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* AI Avatar / Pulse Visualizer */}
            <div className="relative z-10 flex flex-col items-center">
              <div className={`w-48 h-48 rounded-full bg-primary/20 flex items-center justify-center relative ${isConnected ? 'animate-pulse' : ''}`}>
                <div className="absolute inset-0 rounded-full border-4 border-primary/30 animate-ping"></div>
                <div className="w-32 h-32 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center shadow-2xl">
                  <Volume2 size={64} className="text-white" />
                </div>
              </div>
              <p className="mt-8 text-white text-lg font-medium tracking-wide">
                {!isConnected ? 'Connecting to AI...' : (currentOutput ? 'AI is speaking...' : 'Listening...')}
              </p>
            </div>
            
            {/* User Info Overlay */}
            <div className="absolute bottom-4 left-4 z-10 bg-black/40 backdrop-blur-md px-4 py-2 rounded-xl border border-white/10 text-white text-sm">
              <p className="font-bold">You (Live)</p>
            </div>
          </div>

          {/* Transcription / History Section */}
          <div className="w-full lg:w-96 bg-gray-900/50 border-l border-white/5 flex flex-col">
            <div className="p-4 border-b border-white/5 bg-gray-800/30">
              <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                <MessageSquare size={16} /> Transcription
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {transcriptions.map((t, i) => (
                <div key={i} className={`flex flex-col ${t.role === 'user' ? 'items-end' : 'items-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${t.role === 'user' ? 'bg-primary text-white rounded-tr-none' : 'bg-gray-800 text-gray-200 rounded-tl-none border border-white/5'}`}>
                    {t.text}
                  </div>
                </div>
              ))}
              {(currentInput || currentOutput) && (
                <div className="space-y-2">
                  {currentInput && (
                    <div className="flex flex-col items-end animate-pulse">
                      <div className="max-w-[85%] p-3 rounded-2xl text-sm bg-primary/40 text-white rounded-tr-none">
                        {currentInput}
                      </div>
                    </div>
                  )}
                  {currentOutput && (
                    <div className="flex flex-col items-start animate-pulse">
                      <div className="max-w-[85%] p-3 rounded-2xl text-sm bg-gray-800/40 text-gray-200 rounded-tl-none border border-white/5">
                        {currentOutput}
                      </div>
                    </div>
                  )}
                </div>
              )}
              {!isConnected && (
                <div className="flex justify-center items-center h-full text-gray-500">
                  <Loader2 size={32} className="animate-spin" />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="p-8 bg-gray-800 border-t border-white/5 flex justify-center items-center gap-6">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={`p-4 rounded-full transition-all transform hover:scale-110 ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
          >
            {isMuted ? <MicOff size={28} /> : <Mic size={28} />}
          </button>
          
          <button 
            onClick={onClose}
            className="px-10 py-4 bg-red-600 text-white rounded-full font-bold shadow-xl hover:bg-red-700 transform hover:scale-105 transition-all flex items-center gap-2"
          >
            End Session
          </button>

          <button 
            onClick={() => setIsVideoOff(!isVideoOff)}
            className={`p-4 rounded-full transition-all transform hover:scale-110 ${isVideoOff ? 'bg-red-500/20 text-red-500' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
          >
            {isVideoOff ? <VideoOff size={28} /> : <Video size={28} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LiveSession;

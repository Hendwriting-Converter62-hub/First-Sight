
import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, Video, VideoOff, PhoneOff, User, Monitor, AlertTriangle, UserPlus, Camera, RefreshCw } from 'lucide-react';
import { useChat } from '../contexts/ChatContext';
import { useLanguage } from '../contexts/LanguageContext';

interface Participant {
  id: string;
  name: string;
  photo?: string;
  status: 'connecting' | 'connected';
}

const VideoCall: React.FC = () => {
  const { 
    currentConversation, 
    endCall, 
    toggleMute, 
    toggleVideo, 
    isMuted, 
    isVideoOff, 
    callStatus,
    callType // Get callType
  } = useChat();

  const { t } = useLanguage();

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const [permissionError, setPermissionError] = useState('');
  const [notification, setNotification] = useState('');
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraAvailable, setCameraAvailable] = useState<boolean>(true);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [isRetrying, setIsRetrying] = useState(false);
  
  const MAX_PARTICIPANTS = 4;

  useEffect(() => {
    // Initialize participants with the current conversation partner
    if (currentConversation && callStatus !== 'idle' && participants.length === 0) {
      setParticipants([
        {
          id: currentConversation.partnerId,
          name: currentConversation.partnerName,
          photo: currentConversation.partnerPhoto,
          status: callStatus === 'connected' ? 'connected' : 'connecting'
        }
      ]);
    } else if (callStatus === 'connected') {
        setParticipants(prev => prev.map(p => ({ ...p, status: 'connected' })));
    }
  }, [currentConversation, callStatus]);

  const addParticipant = () => {
    if (participants.length >= MAX_PARTICIPANTS) {
      setNotification(t('videoCall.maxParticipants'));
      setTimeout(() => setNotification(''), 3000);
      return;
    }

    const mockNames = ['Rahim', 'Karim', 'Fatima', 'Ayesha', 'Tanvir'];
    const randomName = mockNames[Math.floor(Math.random() * mockNames.length)];
    const newParticipant: Participant = {
        id: Date.now().toString(),
        name: randomName,
        status: 'connecting'
    };
    
    setParticipants(prev => [...prev, newParticipant]);
    
    // Simulate connection
    setTimeout(() => {
        setParticipants(prev => prev.map(p => p.id === newParticipant.id ? { ...p, status: 'connected' } : p));
    }, 2000);
  };

  const startVideo = async () => {
      setIsRetrying(true);
      setPermissionError('');
      
      try {
        // Stop any existing tracks
        if (stream) {
          stream.getTracks().forEach(track => track.stop());
        }

        try {
            // Check call type. If audio only, don't ask for video.
            const constraints = {
                video: callType === 'video',
                audio: true
            };

            const localStream = await navigator.mediaDevices.getUserMedia(constraints);
            
            setStream(localStream);
            setCameraAvailable(true);
            
            if (localVideoRef.current && callType === 'video') {
              localVideoRef.current.srcObject = localStream;
            }
        } catch (err: any) {
            // Fallback logic mainly for Video calls failing to get Audio
            if (callType === 'video' && (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError' || err.message?.includes('not found'))) {
                console.warn('Primary media access failed, falling back to video only.');
                
                const videoOnlyStream = await navigator.mediaDevices.getUserMedia({ 
                    video: true, 
                    audio: false 
                });

                setStream(videoOnlyStream);
                setCameraAvailable(true);
                
                if (localVideoRef.current) {
                    localVideoRef.current.srcObject = videoOnlyStream;
                }
                
                setNotification(t('videoCall.micFallback'));
                if (!isMuted) toggleMute(); 

            } else {
                throw err;
            }
        }
      } catch (err: any) {
        console.error("Error accessing media devices:", err);
        setCameraAvailable(false);
        
        let errorMessage = callType === 'video' ? t('videoCall.cameraError') : t('videoCall.micError');
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            errorMessage = t('videoCall.permissionDenied');
        } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            errorMessage = t('videoCall.deviceNotFound');
        }
        setPermissionError(errorMessage);
      } finally {
        setIsRetrying(false);
      }
  };

  useEffect(() => {
    if (callStatus === 'calling' || callStatus === 'connected') {
      startVideo();
    }

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [callStatus]);

  // Handle toggling tracks based on state
  useEffect(() => {
    if (stream) {
      stream.getAudioTracks().forEach(track => track.enabled = !isMuted);
      // Only toggle video tracks if we actually have them (video call)
      if (callType === 'video') {
          stream.getVideoTracks().forEach(track => track.enabled = !isVideoOff);
      }
    }
  }, [isMuted, isVideoOff, stream, callType]);

  if (callStatus === 'idle') return null;

  const getGridClass = (count: number) => {
    if (count <= 1) return 'grid-cols-1';
    if (count === 2) return 'grid-cols-1 md:grid-cols-2';
    if (count <= 4) return 'grid-cols-2';
    return 'grid-cols-2 md:grid-cols-3';
  };

  return (
    <div className="fixed inset-0 z-[60] bg-gray-900 flex flex-col overflow-hidden">
      {/* Header / Top Bar */}
      <div className="absolute top-0 left-0 right-0 p-4 z-40 flex justify-between items-start pointer-events-none">
         <div className="pointer-events-auto flex flex-col items-start gap-2">
             {permissionError && (
                <div className="bg-red-600/90 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2">
                <AlertTriangle size={16} />
                <span className="text-xs">{permissionError}</span>
                </div>
            )}
             {notification && (
                <div className="bg-yellow-600/90 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
                <AlertTriangle size={16} />
                <span className="text-xs">{notification}</span>
                </div>
            )}
         </div>
         <div className="pointer-events-auto">
            <button 
                onClick={addParticipant}
                className="bg-gray-800/80 backdrop-blur text-white px-4 py-2 rounded-full flex items-center gap-2 hover:bg-gray-700 transition-colors border border-gray-600 shadow-lg"
            >
                <UserPlus size={18} />
                <span className="text-sm font-medium hidden sm:inline">{t('videoCall.addPerson')}</span>
            </button>
         </div>
      </div>

      {/* Video Grid */}
      <div className={`flex-1 p-4 grid gap-4 ${getGridClass(participants.length)} content-center`}>
        {participants.map((participant) => (
            <div key={participant.id} className="relative bg-gray-800 rounded-xl overflow-hidden shadow-lg border border-gray-700 h-full max-h-[80vh]">
                {/* For audio call, always show avatar background */}
                {(participant.status === 'connected' && callType === 'video') ? (
                <div className="w-full h-full relative group">
                    <img 
                        src={participant.photo || `https://ui-avatars.com/api/?name=${participant.name}&background=random`} 
                        alt={participant.name} 
                        className="w-full h-full object-cover opacity-80"
                    />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                         <div className="text-white/40 animate-pulse">
                            <Monitor size={48} />
                         </div>
                    </div>
                </div>
                ) : (
                // Avatar View for Audio Call or connecting state
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800">
                    <div className={`w-24 h-24 rounded-full border-4 border-gray-700 overflow-hidden mb-4 ${participant.status === 'connecting' ? 'animate-pulse' : ''}`}>
                         {participant.photo ? (
                            <img src={participant.photo} alt={participant.name} className="w-full h-full object-cover" />
                         ) : (
                            <div className="w-full h-full bg-gray-600 flex items-center justify-center text-gray-300">
                                <User size={40} />
                            </div>
                         )}
                    </div>
                    <h3 className="text-xl font-bold text-white">{participant.name}</h3>
                    <p className="text-gray-400 text-sm mt-1">
                        {participant.status === 'connecting' 
                            ? t('videoCall.connecting') 
                            : (callType === 'audio' ? t('chat.audioCall') : t('videoCall.connected'))}
                    </p>
                </div>
                )}
                
                <div className="absolute bottom-4 left-4 text-white drop-shadow-md z-10 bg-black/40 px-3 py-1 rounded-lg backdrop-blur-sm">
                    <h3 className="font-bold text-sm">{participant.name}</h3>
                    {participant.status === 'connected' && (
                       <span className="text-[10px] text-green-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span> Live
                       </span>
                    )}
                </div>
            </div>
        ))}
      </div>

      {/* Controls Bar */}
      <div className="p-6 flex justify-center items-center gap-4 bg-gradient-to-t from-gray-900 to-transparent z-50">
        <div className="flex items-center gap-6 bg-gray-800/80 backdrop-blur-md px-8 py-4 rounded-full shadow-2xl border border-white/10">
            {callType === 'video' && (
                <button 
                onClick={toggleVideo}
                className={`p-4 rounded-full transition-all ${isVideoOff ? 'bg-red-500/20 text-red-500' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
                title="Toggle Camera"
                >
                {isVideoOff ? <VideoOff size={24} /> : <Video size={24} />}
                </button>
            )}
            
            <button 
            onClick={toggleMute}
            className={`p-4 rounded-full transition-all ${isMuted ? 'bg-red-500/20 text-red-500' : 'bg-gray-700 text-white hover:bg-gray-600'}`}
            title="Toggle Microphone"
            >
            {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
            </button>

            <button 
            onClick={endCall}
            className="p-4 rounded-full bg-red-600 text-white hover:bg-red-700 transform hover:scale-110 transition-all shadow-lg"
            title="End Call"
            >
            <PhoneOff size={28} />
            </button>
        </div>
      </div>

      {/* Local Video (Picture in Picture) - Only for Video Call */}
      {callType === 'video' && (
        <div className="absolute top-4 right-4 w-32 md:w-48 aspect-[3/4] bg-black rounded-xl overflow-hidden shadow-2xl border border-gray-700 z-50 transition-all hover:scale-105 hover:z-[60]">
            {isVideoOff ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-white gap-2">
                <VideoOff size={24} />
                <span className="text-xs text-gray-400">{t('videoCall.cameraOff')}</span>
                </div>
            ) : !cameraAvailable ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-800 text-white p-2 text-center">
                <Camera size={24} className="text-gray-500 mb-2" />
                <p className="text-[10px] text-gray-400 mb-2">{t('videoCall.cameraError')}</p>
                <button 
                    onClick={startVideo} 
                    disabled={isRetrying}
                    className="flex items-center gap-1 px-3 py-1 bg-primary text-white text-[10px] rounded hover:bg-primary-dark transition-colors"
                >
                    {isRetrying ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <RefreshCw size={10} />}
                    <span>{t('videoCall.retry')}</span>
                </button>
                </div>
            ) : (
                <video 
                ref={localVideoRef} 
                autoPlay 
                muted 
                playsInline 
                className="w-full h-full object-cover transform scale-x-[-1]" 
                />
            )}
            <div className="absolute bottom-2 left-2 text-xs text-white bg-black/50 px-2 py-0.5 rounded flex items-center gap-1">
                <span>{t('videoCall.you')}</span>
            </div>
        </div>
      )}
    </div>
  );
};

export default VideoCall;

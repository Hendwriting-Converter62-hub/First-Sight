
// ... existing imports
import React, { useState, useRef, useEffect } from 'react';
import { Send, Search, MoreVertical, Phone, Video, Image as ImageIcon, Mic, ArrowLeft, X, StopCircle, Trash2, PhoneMissed, PhoneIncoming, PhoneOutgoing, Clock, Smile, Loader2, Sparkles } from 'lucide-react';
import EmojiPicker from 'emoji-picker-react';
import { useChat } from '../contexts/ChatContext';
import { useLanguage } from '../contexts/LanguageContext';
import VideoCall from './VideoCall';
import LiveSession from './LiveSession';
import { Message } from '../types';

const Chat: React.FC = () => {
  const { 
    conversations, 
    currentConversation, 
    selectConversation, 
    deleteConversation, 
    deleteMessage, 
    sendMessage,
    startCall,
    startAudioCall, 
    isCallActive
  } = useChat();
  
  const { t } = useLanguage();

  const [inputText, setInputText] = useState('');
  const [showMobileList, setShowMobileList] = useState(true);
  const [showLiveSession, setShowLiveSession] = useState(false);
  
  // Search State
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sidebar Search State
  const [convSearchQuery, setConvSearchQuery] = useState('');

  // Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<number | null>(null);

  // Emoji Picker State
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  // Image Processing State
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  // File Input Ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleConversationClick = (id: string) => {
    selectConversation(id);
    setShowMobileList(false);
    // Reset search & input
    setIsSearching(false);
    setSearchQuery('');
    setInputText('');
    setShowEmojiPicker(false);
    cancelRecording();
  };

  const handleBackToList = () => {
    setShowMobileList(true);
    setIsSearching(false);
    setSearchQuery('');
    setShowEmojiPicker(false);
    cancelRecording();
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      sendMessage(inputText, 'text');
      setInputText('');
      setShowEmojiPicker(false);
    }
  };

  // --- Emoji Handling ---
  const onEmojiClick = (emojiData: any) => {
    setInputText((prev) => prev + emojiData.emoji);
  };

  // --- Image Handling & Compression ---
  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const compressAndSendImage = (file: File) => {
    setIsProcessingImage(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        // Resize logic: Max 800px width or height
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        
        ctx?.drawImage(img, 0, 0, width, height);
        
        // Compress to JPEG with 0.7 quality
        const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
        
        // Check size after compression (safeguard for localStorage)
        if (dataUrl.length > 800 * 1024) { // ~800KB roughly
             alert(t('chat.fileSizeError'));
        } else {
             sendMessage('', 'image', dataUrl);
        }
        setIsProcessingImage(false);
      };
      
      img.onerror = () => {
          alert('Error processing image');
          setIsProcessingImage(false);
      };
      
      img.src = e.target?.result as string;
    };
    reader.onerror = () => {
        alert('Error reading file');
        setIsProcessingImage(false);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      compressAndSendImage(file);
    }
    // Reset input to allow selecting same file again
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  // Handle Paste for Images
  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf('image') !== -1) {
        const blob = items[i].getAsFile();
        if (blob) {
            compressAndSendImage(blob);
            e.preventDefault();
        }
      }
    }
  };

  // --- Voice Handling ---
  const startRecording = async () => {
    // Check for browser support
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert(t('chat.browserUnsupported'));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          if (audioChunksRef.current.length > 0) {
             sendMessage('', 'audio', base64String);
          }
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setShowEmojiPicker(false); // Hide emoji if recording
      
      // Start Timer
      setRecordingTime(0);
      timerRef.current = window.setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
      console.error('Error accessing microphone:', err);
      let errorMessage = t('chat.micError');
      if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError' || err.message?.includes('not found') || err.message?.includes('Requested device')) {
        errorMessage = t('videoCall.deviceNotFound');
      } else if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMessage = t('videoCall.permissionDenied');
      }
      alert(errorMessage);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const cancelRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.onstop = null;
      mediaRecorderRef.current.stop();
      if (mediaRecorderRef.current.stream) {
          mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
      setRecordingTime(0);
      audioChunksRef.current = [];
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // --- Display Helpers ---

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatCallDuration = (seconds?: number) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}m ${secs}s`;
    return `${secs}s`;
  };

  const escapeRegExp = (string: string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, 'gi'));
    return (
      <span>
        {parts.map((part, i) => 
          part.toLowerCase() === query.toLowerCase() ? 
            <span key={i} className="bg-yellow-300 text-black px-0.5 rounded shadow-sm">{part}</span> : 
            part
        )}
      </span>
    );
  };

  const displayedMessages = currentConversation
    ? currentConversation.messages.filter(msg => 
        !searchQuery || msg.text.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const renderMessageContent = (msg: Message) => {
    if (msg.type === 'call') {
       const isMissed = msg.callStatus === 'missed';
       const isMe = msg.senderId === 'me';
       return (
          <div className="flex items-center gap-3 py-1 px-1">
             <div className={`p-2 rounded-full ${isMissed ? 'bg-red-100 text-red-500' : 'bg-green-100 text-green-500'}`}>
                {isMissed ? <PhoneMissed size={20} /> : (isMe ? <PhoneOutgoing size={20} /> : <PhoneIncoming size={20} />)}
             </div>
             <div>
                <p className={`font-semibold ${isMissed ? 'text-red-500' : 'text-gray-800'}`}>
                   {msg.text}
                </p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                   <span>{isMissed ? 'Missed' : (isMe ? t('chat.outgoing') : t('chat.incoming'))}</span>
                   {msg.callDuration && msg.callDuration > 0 && (
                      <>
                        <span>•</span>
                        <span>{formatCallDuration(msg.callDuration)}</span>
                      </>
                   )}
                </div>
             </div>
          </div>
       );
    }

    if (msg.type === 'image' && msg.attachment) {
      return (
        <div className="rounded-lg overflow-hidden my-1">
          <img 
            src={msg.attachment} 
            alt="Sent attachment" 
            className="max-w-full max-h-[300px] object-cover" 
          />
        </div>
      );
    }
    
    if (msg.type === 'audio' && msg.attachment) {
      return (
        <div className="flex items-center gap-2 min-w-[200px] py-1">
          <audio controls src={msg.attachment} className="w-full h-10 max-w-[240px]" />
        </div>
      );
    }

    return (
      <p className="text-sm md:text-base whitespace-pre-wrap">
        {isSearching ? highlightText(msg.text, searchQuery) : msg.text}
      </p>
    );
  };

  const filteredConversations = conversations.filter(conv => 
    conv.partnerName.toLowerCase().includes(convSearchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-80px)] bg-gray-100 overflow-hidden relative">
      {/* Video Call Overlay */}
      {isCallActive && <VideoCall />}
      
      {/* Live Session Overlay */}
      {showLiveSession && <LiveSession onClose={() => setShowLiveSession(false)} />}

      {/* Sidebar - Conversation List */}
      <div className={`w-full md:w-80 lg:w-96 bg-white border-r border-gray-200 flex flex-col ${!showMobileList && 'hidden md:flex'}`}>
        <div className="p-4 border-b border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-dark">{t('chat.title')}</h2>
            <button 
              onClick={() => setShowLiveSession(true)}
              className="p-2 bg-primary/10 text-primary rounded-full hover:bg-primary hover:text-white transition-all shadow-sm"
              title="AI Live Assistant"
            >
              <Sparkles size={20} />
            </button>
          </div>
          <div className="relative">
            <input 
              type="text" 
              placeholder={t('chat.searchConv')} 
              value={convSearchQuery}
              onChange={(e) => setConvSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-primary text-sm"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              {t('chat.noConv')}
            </div>
          ) : (
            filteredConversations.map(conv => (
              <div 
                key={conv.id}
                onClick={() => handleConversationClick(conv.id)}
                className={`p-4 flex items-center gap-3 hover:bg-gray-50 cursor-pointer transition-colors group ${currentConversation?.id === conv.id ? 'bg-primary/5' : ''}`}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-full overflow-hidden">
                    {conv.partnerPhoto ? (
                      <img src={conv.partnerPhoto} alt={conv.partnerName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                        {conv.partnerName[0]}
                      </div>
                    )}
                  </div>
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-baseline mb-1">
                    <h3 className={`font-semibold truncate ${conv.unreadCount > 0 ? 'text-dark' : 'text-gray-700'}`}>
                      {conv.partnerName}
                    </h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap ml-2">
                      {formatTime(conv.lastMessageTime)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className={`text-sm truncate pr-2 ${conv.unreadCount > 0 ? 'text-dark font-medium' : 'text-gray-500'}`}>
                      {conv.lastMessage}
                    </p>
                    {conv.unreadCount > 0 && (
                      <div className="w-5 h-5 bg-primary text-white text-xs rounded-full flex items-center justify-center flex-shrink-0">
                        {conv.unreadCount}
                      </div>
                    )}
                  </div>
                </div>
                
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        if (window.confirm(t('common.delete') + '?')) {
                            deleteConversation(conv.id);
                        }
                    }}
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                    title={t('common.delete')}
                >
                    <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-[#e5ddd5] ${showMobileList && 'hidden md:flex'}`}>
        {currentConversation ? (
          <>
            <div className="bg-white p-3 md:p-4 border-b border-gray-200 flex justify-between items-center shadow-sm h-[72px]">
              {isSearching ? (
                 <div className="flex-1 flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
                    <div className="relative flex-1">
                        <input 
                            type="text" 
                            autoFocus
                            placeholder={t('chat.searchInConv')}
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-full focus:ring-2 focus:ring-primary/50 outline-none text-sm"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
                    </div>
                    <button 
                      onClick={() => { setIsSearching(false); setSearchQuery(''); }} 
                      className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
                    >
                        <X size={20} />
                    </button>
                 </div>
              ) : (
                <>
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={handleBackToList}
                      className="md:hidden p-2 hover:bg-gray-100 rounded-full text-gray-600"
                    >
                      <ArrowLeft size={20} />
                    </button>
                    
                    <div className="w-10 h-10 rounded-full overflow-hidden">
                      {currentConversation.partnerPhoto ? (
                        <img src={currentConversation.partnerPhoto} alt="Partner" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
                          {currentConversation.partnerName[0]}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-bold text-dark">{currentConversation.partnerName}</h3>
                      <span className="text-xs text-green-600 flex items-center gap-1">
                        <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                        {t('chat.online')}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 sm:gap-2 text-primary">
                    <button 
                      onClick={() => setIsSearching(true)}
                      className="p-2 hover:bg-primary/10 rounded-full transition-colors"
                      title="Search"
                    >
                      <Search size={20} />
                    </button>
                    <button 
                      onClick={startAudioCall}
                      className="p-2 hover:bg-primary/10 rounded-full transition-colors hidden sm:block"
                      title="Audio Call"
                    >
                      <Phone size={20} />
                    </button>
                    <button 
                      onClick={startCall}
                      className="p-2 hover:bg-primary/10 rounded-full transition-colors"
                      title="Video Call"
                    >
                      <Video size={20} />
                    </button>
                    <button className="p-2 hover:bg-primary/10 rounded-full transition-colors">
                      <MoreVertical size={20} className="text-gray-500" />
                    </button>
                  </div>
                </>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-opacity-50" style={{ backgroundImage: 'url("https://user-images.githubusercontent.com/15075759/28719144-86dc0f70fcded21.png")' }}>
              {displayedMessages.length > 0 ? (
                displayedMessages.map((msg) => {
                  const isMe = msg.senderId === 'me';
                  const isCallLog = msg.type === 'call';
                  
                  if (isCallLog) {
                      return (
                        <div key={msg.id} className="flex justify-center my-4">
                           <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-white/50 px-4 py-2 text-center max-w-[80%]">
                              {renderMessageContent(msg)}
                              <div className="text-[10px] text-gray-400 mt-1">{formatTime(msg.timestamp)}</div>
                           </div>
                        </div>
                      );
                  }

                  return (
                    <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                      <div className={`relative max-w-[75%] md:max-w-[60%] rounded-lg px-3 py-2 shadow-sm ${
                        isMe ? 'bg-primary text-white rounded-tr-none' : 'bg-white text-dark rounded-tl-none'
                      }`}>
                        {renderMessageContent(msg)}
                        <div className={`text-[10px] mt-1 text-right ${isMe ? 'text-white/70' : 'text-gray-400'}`}>
                          {formatTime(msg.timestamp)}
                        </div>
                        
                        <button
                          onClick={() => {
                              if(window.confirm(t('common.delete') + '?')) {
                                  deleteMessage(currentConversation.id, msg.id);
                              }
                          }}
                          className={`absolute top-1/2 -translate-y-1/2 p-1.5 rounded-full text-gray-500 hover:text-red-600 bg-white/80 hover:bg-white shadow opacity-0 group-hover:opacity-100 transition-all z-10 ${isMe ? '-left-10' : '-right-10'}`}
                          title={t('common.delete')}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-500 bg-white/50 backdrop-blur-sm rounded-xl m-4 p-8">
                  <Search size={48} className="mb-4 opacity-50" />
                  <p className="font-medium">{t('chat.noResult')}</p>
                  <p className="text-sm mt-1">{t('chat.tryAgain')}</p>
                  <button onClick={() => setSearchQuery('')} className="mt-4 text-primary hover:underline text-sm">
                    {t('chat.seeAll')}
                  </button>
                </div>
              )}
            </div>

            <form onSubmit={handleSend} className="bg-white p-3 md:p-4 border-t border-gray-200 flex items-center gap-2 md:gap-4 relative">
              <input 
                type="file" 
                ref={fileInputRef} 
                className="hidden" 
                accept="image/*" 
                onChange={handleFileChange}
              />

              {showEmojiPicker && (
                <div className="absolute bottom-20 left-4 z-50 shadow-2xl rounded-xl border border-gray-200">
                   <EmojiPicker onEmojiClick={onEmojiClick} width={300} height={400} />
                </div>
              )}

              {isRecording ? (
                <div className="flex-1 flex items-center justify-between bg-red-50 rounded-full px-4 py-2 border border-red-100 animate-in fade-in">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-red-500 font-mono font-medium">{formatDuration(recordingTime)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                     <button 
                        type="button" 
                        onClick={cancelRecording}
                        className="p-2 text-gray-500 hover:text-red-600 transition-colors"
                        title={t('chat.cancel')}
                     >
                        <Trash2 size={20} />
                     </button>
                     <button 
                        type="button" 
                        onClick={stopRecording}
                        className="p-2 text-red-500 hover:text-red-700 transition-colors"
                        title={t('chat.send')}
                     >
                        <Send size={20} />
                     </button>
                  </div>
                </div>
              ) : (
                <>
                  <button 
                    type="button" 
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={`p-2 transition-colors ${showEmojiPicker ? 'text-primary' : 'text-gray-500 hover:text-primary'}`}
                  >
                    <Smile size={24} />
                  </button>

                  <button 
                    type="button" 
                    onClick={handleImageClick}
                    disabled={isProcessingImage}
                    className={`p-2 transition-colors ${isProcessingImage ? 'text-primary animate-pulse' : 'text-gray-500 hover:text-primary'}`}
                  >
                    {isProcessingImage ? <Loader2 size={20} className="animate-spin" /> : <ImageIcon size={20} />}
                  </button>
                  
                  <div className="flex-1 relative">
                    <input 
                      type="text" 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onPaste={handlePaste}
                      placeholder={t('chat.writeMsg')}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:ring-1 focus:ring-primary focus:bg-white transition-all"
                      onFocus={() => setShowEmojiPicker(false)}
                    />
                  </div>
                  
                  {inputText.trim() ? (
                    <button type="submit" className="p-3 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors shadow-md">
                      <Send size={20} />
                    </button>
                  ) : (
                     <button 
                        type="button" 
                        onClick={startRecording}
                        className="p-3 bg-gray-200 text-gray-500 rounded-full hover:bg-red-500 hover:text-white transition-all hover:shadow-md"
                     >
                      <Mic size={20} />
                    </button>
                  )}
                </>
              )}
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-500 bg-[#f0f2f5]">
            <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm">
              <img src="https://cdn-icons-png.flaticon.com/512/309/309666.png" alt="Chat" className="w-16 opacity-50" />
            </div>
            <h2 className="text-2xl font-light mb-2">{t('chat.firstSightChat')}</h2>
            <p>{t('chat.selectConv')}</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;

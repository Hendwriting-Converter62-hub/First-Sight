
import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { ChatContextType, Conversation, Message, CallStatus, MessageType, CallType } from '../types';
import { useAuth } from './AuthContext';
import { useLanguage } from './LanguageContext';

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};

// Mock Initial Data (Static for demo, ideally would be localized on render)
const MOCK_CONVERSATIONS: Conversation[] = [
  {
    id: '1',
    partnerId: '101',
    partnerName: 'সাদিয়া ইসলাম',
    partnerPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    lastMessage: 'আপনার প্রোফাইলটি খুব সুন্দর!',
    lastMessageTime: Date.now() - 3600000,
    unreadCount: 1,
    messages: [
      { id: 'm1', senderId: '101', text: 'আসসালামু আলাইকুম', type: 'text', timestamp: Date.now() - 86400000, isRead: true },
      { id: 'm2', senderId: 'me', text: 'ওয়ালাইকুম আসসালাম, কেমন আছেন?', type: 'text', timestamp: Date.now() - 86000000, isRead: true },
      { id: 'm3', senderId: '101', text: 'আপনার প্রোফাইলটি খুব সুন্দর!', type: 'text', timestamp: Date.now() - 3600000, isRead: false },
      // Mock Call History
      { id: 'c1', senderId: '101', text: 'Audio Call', type: 'call', timestamp: Date.now() - 90000000, isRead: true, callStatus: 'missed' },
      { id: 'c2', senderId: 'me', text: 'Video Call', type: 'call', timestamp: Date.now() - 88000000, isRead: true, callStatus: 'ended', callDuration: 145 },
    ]
  },
  {
    id: '2',
    partnerId: '102',
    partnerName: 'ফারহানা আহমেদ',
    lastMessage: 'ধন্যবাদ, আমি পরে কথা বলব।',
    lastMessageTime: Date.now() - 7200000,
    unreadCount: 0,
    messages: [
      { id: 'm4', senderId: 'me', text: 'হাই, আপনি কি ফ্রি আছেন?', type: 'text', timestamp: Date.now() - 7300000, isRead: true },
      { id: 'm5', senderId: '102', text: 'ধন্যবাদ, আমি পরে কথা বলব।', type: 'text', timestamp: Date.now() - 7200000, isRead: true },
      { id: 'c3', senderId: '102', text: 'Video Call', type: 'call', timestamp: Date.now() - 7000000, isRead: true, callStatus: 'missed' },
    ]
  }
];

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversation, setCurrentConversation] = useState<Conversation | null>(null);
  
  // Call State
  const [callStatus, setCallStatus] = useState<CallStatus>('idle');
  const [callType, setCallType] = useState<CallType>('video');
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const callStartTimeRef = useRef<number>(0);

  // Helper to safely save to localStorage
  const saveToStorage = (key: string, data: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error: any) {
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        alert('Storage limit reached! Cannot save new messages. Please clear chat history.');
        console.error('LocalStorage quota exceeded in ChatContext');
      } else {
        console.error('Storage error:', error);
      }
    }
  };

  useEffect(() => {
    // Load conversations from local storage or mock
    const storedChats = localStorage.getItem('conversations');
    if (storedChats) {
      setConversations(JSON.parse(storedChats));
    } else {
      setConversations(MOCK_CONVERSATIONS);
      saveToStorage('conversations', MOCK_CONVERSATIONS);
    }
  }, [user]);

  const selectConversation = (id: string) => {
    const conv = conversations.find(c => c.id === id);
    if (conv) {
      // Mark as read
      const updatedConv = {
        ...conv,
        unreadCount: 0,
        messages: conv.messages.map(m => ({ ...m, isRead: true }))
      };
      
      const updatedList = conversations.map(c => c.id === id ? updatedConv : c);
      setConversations(updatedList);
      saveToStorage('conversations', updatedList);
      setCurrentConversation(updatedConv);
    }
  };

  const deleteConversation = (id: string) => {
    const updatedList = conversations.filter(c => c.id !== id);
    setConversations(updatedList);
    saveToStorage('conversations', updatedList);

    // If deleting the active conversation, clear it
    if (currentConversation?.id === id) {
      setCurrentConversation(null);
    }
  };

  const deleteMessage = (conversationId: string, messageId: string) => {
    const conv = conversations.find(c => c.id === conversationId);
    if (!conv) return;

    const updatedMessages = conv.messages.filter(m => m.id !== messageId);
    
    // Update last message info if needed
    let lastMsg = '';
    let lastTime = conv.lastMessageTime;
    
    if (updatedMessages.length > 0) {
        const last = updatedMessages[updatedMessages.length - 1];
        if (last.type === 'text') lastMsg = last.text;
        else if (last.type === 'image') lastMsg = t('chat.imageSent');
        else if (last.type === 'audio') lastMsg = t('chat.voiceSent');
        else if (last.type === 'call') lastMsg = last.callStatus === 'missed' ? (last.text.includes('Video') ? t('chat.missedVideo') : t('chat.missedAudio')) : t('chat.call');
        lastTime = last.timestamp;
    } else {
        lastMsg = '';
    }

    const updatedConv = {
        ...conv,
        messages: updatedMessages,
        lastMessage: lastMsg,
        lastMessageTime: lastTime
    };

    const updatedList = conversations.map(c => c.id === conversationId ? updatedConv : c);
    setConversations(updatedList);
    saveToStorage('conversations', updatedList);

    if (currentConversation?.id === conversationId) {
        setCurrentConversation(updatedConv);
    }
  };

  const sendMessage = (text: string, type: MessageType = 'text', attachment?: string) => {
    if (!currentConversation || !user) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      senderId: 'me', // In real app, use user.id
      text,
      type,
      attachment,
      timestamp: Date.now(),
      isRead: true
    };

    let displayMessage = text;
    if (type === 'image') displayMessage = t('chat.imageSent');
    if (type === 'audio') displayMessage = t('chat.voiceSent');
    if (type === 'call') displayMessage = t('chat.call');

    const updatedConv = {
      ...currentConversation,
      messages: [...currentConversation.messages, newMessage],
      lastMessage: displayMessage,
      lastMessageTime: newMessage.timestamp
    };

    const updatedList = conversations.map(c => c.id === currentConversation.id ? updatedConv : c);
    setConversations(updatedList);
    setCurrentConversation(updatedConv);
    saveToStorage('conversations', updatedList);

    // Simulate Reply
    if (type !== 'call') { // Don't reply to call logs automatically
        setTimeout(() => {
          const replyMessage: Message = {
            id: (Date.now() + 1).toString(),
            senderId: currentConversation.partnerId,
            text: t('chat.replyText'),
            type: 'text',
            timestamp: Date.now(),
            isRead: false
          };

          setConversations(prev => {
            const convToUpdate = prev.find(c => c.id === currentConversation.id);
            if (!convToUpdate) return prev;

            const updatedWithReply = {
              ...convToUpdate,
              messages: [...convToUpdate.messages, newMessage, replyMessage], 
              lastMessage: replyMessage.text,
              lastMessageTime: replyMessage.timestamp,
              unreadCount: convToUpdate.id === currentConversation.id ? 0 : convToUpdate.unreadCount + 1
            };

            // If currently viewing this conversation, update it too
            if (currentConversation.id === updatedWithReply.id) {
               setCurrentConversation(updatedWithReply);
            }

            const newList = prev.map(c => c.id === currentConversation.id ? updatedWithReply : c);
            saveToStorage('conversations', newList);
            return newList;
          });
        }, 3000);
    }
  };

  // --- Video/Audio Call Logic ---

  const startCall = () => {
    if (!currentConversation) return;

    // Premium Plan Enforcement
    if (user?.plan !== 'vip') {
        alert(t('chat.vipVideoAlert'));
        return;
    }

    setCallType('video');
    setCallStatus('calling');
    setIsMuted(false);
    setIsVideoOff(false);
    callStartTimeRef.current = Date.now();

    setTimeout(() => {
      setCallStatus('connected');
    }, 2000);
  };

  const startAudioCall = () => {
    if (!currentConversation) return;

    if (user?.plan !== 'vip') {
        alert(t('chat.vipAudioAlert'));
        return;
    }

    setCallType('audio');
    setCallStatus('calling');
    setIsMuted(false);
    setIsVideoOff(true); // Default video off for audio call
    callStartTimeRef.current = Date.now();

    setTimeout(() => {
        setCallStatus('connected');
    }, 2000);
  };

  const endCall = () => {
    // Log the call before resetting state
    if (currentConversation && user) {
        const duration = Math.floor((Date.now() - callStartTimeRef.current) / 1000);
        const status = callStatus === 'connected' ? 'ended' : 'missed'; // If ended before connect, treat as missed/cancelled
        
        // Only log if it wasn't immediately idle (sanity check)
        if (callStatus !== 'idle') {
             const callMsg: Message = {
                id: Date.now().toString(),
                senderId: 'me', // Always 'me' starting the call in this mock
                text: callType === 'video' ? 'Video Call' : 'Audio Call',
                type: 'call',
                timestamp: Date.now(),
                isRead: true,
                callStatus: status,
                callDuration: status === 'ended' ? duration : 0
             };

             const updatedConv = {
                ...currentConversation,
                messages: [...currentConversation.messages, callMsg],
                lastMessage: status === 'missed' 
                  ? (callType === 'video' ? t('chat.missedVideo') : t('chat.missedAudio')) 
                  : (callType === 'video' ? t('chat.videoCall') : t('chat.audioCall')),
                lastMessageTime: callMsg.timestamp
             };

             const updatedList = conversations.map(c => c.id === currentConversation.id ? updatedConv : c);
             setConversations(updatedList);
             setCurrentConversation(updatedConv);
             saveToStorage('conversations', updatedList);
        }
    }

    setCallStatus('ended');
    setTimeout(() => {
      setCallStatus('idle');
    }, 1000);
  };

  const toggleMute = () => setIsMuted(prev => !prev);
  const toggleVideo = () => setIsVideoOff(prev => !prev);

  return (
    <ChatContext.Provider value={{
      conversations,
      currentConversation,
      selectConversation,
      deleteConversation,
      deleteMessage,
      sendMessage,
      callStatus,
      callType,
      isCallActive: callStatus !== 'idle',
      startCall,
      startAudioCall,
      endCall,
      toggleMute,
      toggleVideo,
      isMuted,
      isVideoOff
    }}>
      {children}
    </ChatContext.Provider>
  );
};

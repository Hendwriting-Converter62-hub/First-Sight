
export interface UserPrivacy {
  showEmail: boolean;
  showPhone: boolean;
  showPhoto: boolean;
  isProfilePublic: boolean;
}

export interface User {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  age: string;
  gender: string;
  religion: string;
  password?: string;
  profilePhoto?: string;
  coverPhoto?: string;
  bio?: string;
  location?: string;
  occupation?: string;
  
  // Role
  role?: 'user' | 'admin';
  
  // Membership Plan
  plan?: 'basic' | 'premium' | 'vip';

  // Verification fields
  isPhoneVerified?: boolean;
  isIdVerified?: boolean;
  isVideoVerified?: boolean;
  idDocument?: string; // base64 string of the ID image
  verificationVideo?: string; // base64 string or mock URL
  
  // Privacy Settings
  privacy?: UserPrivacy;

  // Connections
  connectionRequests?: string[]; // IDs of users who sent request
  sentRequests?: string[]; // IDs of users request was sent to
  connections?: string[]; // IDs of connected users
}

export type MessageType = 'text' | 'image' | 'audio' | 'call';

export interface Message {
  id: string;
  senderId: string;
  text: string; // Used for caption or fallback text
  type: MessageType;
  attachment?: string; // Base64 string for image or audio
  timestamp: number;
  isRead: boolean;
  // Call specific fields
  callStatus?: 'missed' | 'ended' | 'rejected';
  callDuration?: number; // seconds
}

export interface Conversation {
  id: string;
  partnerId: string;
  partnerName: string;
  partnerPhoto?: string;
  lastMessage: string;
  lastMessageTime: number;
  unreadCount: number;
  messages: Message[];
}

export interface MatchSuggestion {
  id: string;
  name: string;
  age: number;
  photo: string;
  occupation: string;
  location: string;
  compatibility: number;
  matchingReasons: string[];
  interests: string[];
}

export type CallStatus = 'idle' | 'calling' | 'ringing' | 'connected' | 'ended';
export type CallType = 'video' | 'audio';

// Community / Post Types
export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  text: string;
  timestamp: number;
}

export interface Post {
  id: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  content: string;
  image?: string; // Base64
  video?: string; // Base64
  likes: string[]; // Array of userIds who liked
  comments: Comment[];
  timestamp: number;
}

export interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id'>) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  upgradePlan: (plan: 'basic' | 'premium' | 'vip') => Promise<boolean>;
  
  // Connection Management
  sendConnectionRequest: (targetUserId: string) => void;
  acceptConnectionRequest: (requesterId: string) => void;
  rejectConnectionRequest: (requesterId: string) => void;
  removeConnection: (partnerId: string) => void;

  isAuthenticated: boolean;
  isAdmin: boolean;
}

export interface ChatContextType {
  conversations: Conversation[];
  currentConversation: Conversation | null;
  selectConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  deleteMessage: (conversationId: string, messageId: string) => void;
  sendMessage: (text: string, type?: MessageType, attachment?: string) => void;
  
  // Video/Audio Call
  callStatus: CallStatus;
  callType: CallType;
  isCallActive: boolean;
  startCall: () => void; // Video Call
  startAudioCall: () => void; // Audio Call
  endCall: () => void;
  toggleMute: () => void;
  toggleVideo: () => void;
  isMuted: boolean;
  isVideoOff: boolean;
}

export interface CommunityContextType {
  posts: Post[];
  createPost: (content: string, image?: string, video?: string) => void;
  deletePost: (postId: string) => void;
  likePost: (postId: string) => void;
  addComment: (postId: string, text: string) => void;
  deleteComment: (postId: string, commentId: string) => void;
}

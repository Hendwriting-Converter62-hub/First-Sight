
import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useCommunity } from '../contexts/CommunityContext';
import { PostCard } from './CommunityFeed';
import { Camera, Edit2, Save, X, MapPin, Briefcase, User as UserIcon, Shield, CheckCircle, Smartphone, FileText, Video, AlertCircle, Lock, Eye, EyeOff, Globe, Sparkles, Heart, MessageCircle, Star, UserPlus, UserMinus, Calculator, Ban, Crown, UploadCloud, Calendar, RefreshCw, Clock, Search, Grid, LayoutList, Users, UserCheck, Loader2, Mail, Hash, BookOpen, Check } from 'lucide-react';
import { User, UserPrivacy, MatchSuggestion } from '../types';

// Numerology Data Mapping
const NUMEROLOGY_DATA: Record<number, { trait: string; color: string; element: string; details: string }> = {
  1: {
    trait: 'নেতৃত্ব ও স্বাধীনতা (Leadership)',
    color: 'সোনালী, লাল',
    element: 'আগুন',
    details: 'সংখ্যা ১ সূর্যের প্রতীক। আপনি একজন জন্মগত নেতা। আপনার মধ্যে প্রবল উচ্চাকাঙ্ক্ষা এবং জেদ কাজ করে। আপনি স্বাধীনচেতা এবং নিজের সিদ্ধান্তে অটল থাকতে পছন্দ করেন। কর্মক্ষেত্রে আপনি সর্বদা শীর্ষস্থান দখল করতে চান এবং অন্যের অধীনে কাজ করা আপনার জন্য কঠিন হতে পারে।'
  },
  2: {
    trait: 'শান্ত ও সংবেদনশীল (Sensitive)',
    color: 'সাদা, রুপালি',
    element: 'পানি',
    details: 'সংখ্যা ২ চাঁদের প্রতীক। আপনি অত্যন্ত কল্পনাপ্রবণ, রোমান্টিক এবং সংবেদনশীল। আপনি ঝগড়া-বিবাদ এড়িয়ে চলতে পছন্দ করেন এবং সবার সাথে মিলেমিশে কাজ করতে ভালোবাসেন। আপনার মন খুব চঞ্চল হতে পারে এবং আপনি অন্যের অনুভূতি দ্রুত বুঝতে পারেন।'
  },
  3: {
    trait: 'সৃজনশীল ও সামাজিক (Creative)',
    color: 'হলুদ',
    element: 'বায়ু',
    details: 'সংখ্যা ৩ বৃহস্পতির প্রতীক। আপনি জ্ঞানী, নীতিবান এবং সৃজনশীল। আপনি মানুষের সাথে মিশতে ভালোবাসেন এবং আপনার রসবোধ খুব ভালো। আপনি জীবনে বড় কিছু করার স্বপ্ন দেখেন এবং তা পূরণে সচেষ্ট থাকেন। শিক্ষকতা বা শিল্পকলায় আপনি ভালো করতে পারেন।'
  },
  4: {
    trait: 'পরিশ্রমী ও বাস্তববাদী (Practical)',
    color: 'নীল, ধূসর',
    element: 'মাটি',
    details: 'সংখ্যা ৪ রাহুর প্রতীক। আপনি অত্যন্ত বাস্তববাদী এবং কঠোর পরিশ্রমী। আপনি হঠকারী সিদ্ধান্ত নেন না, বরং প্রতিটি পদক্ষেপ ভেবেচিন্তে ফেলেন। জীবনে অনেক চড়াই-উতরাই পেরিয়ে আপনি সাফল্য অর্জন করেন। আপনি নিয়মশৃঙ্খলার প্রতি শ্রদ্ধাশীল।'
  },
  5: {
    trait: 'রোমাঞ্চপ্রিয় ও বুদ্ধিমান (Adventurous)',
    color: 'সবুজ',
    element: 'বায়ু',
    details: 'সংখ্যা ৫ বুধের প্রতীক। আপনি অত্যন্ত বুদ্ধিমান এবং চটপটে। একঘেয়েমি আপনার পছন্দ নয়, আপনি সর্বদা নতুন কিছু করতে চান। ভ্রমণ আপনার প্রিয়। ব্যবসা এবং যোগাযোগ দক্ষতায় আপনি অন্যদের চেয়ে এগিয়ে থাকেন এবং দ্রুত সিদ্ধান্ত নিতে পারেন।'
  },
  6: {
    trait: 'দায়িত্বশীল ও পরিবারপ্রেমী (Nurturing)',
    color: 'গোলাপী, নীল',
    element: 'মাটি',
    details: 'সংখ্যা ৬ শুক্রের প্রতীক। আপনি সৌন্দর্যপিপাসু এবং পরিবারকে খুব গুরুত্ব দেন। আপনি অত্যন্ত দায়িত্বশীল এবং অন্যদের যত্ন নিতে পছন্দ করেন। শিল্প, সাহিত্য, ফ্যাশন ও বিনোদন জগতে আপনার আগ্রহ থাকে। আপনি শান্তিপ্রিয় মানুষ।'
  },
  7: {
    trait: 'আধ্যাত্মিক ও বিশ্লেষণধর্মী (Analytical)',
    color: 'বেগুনি, সাদা',
    element: 'পানি',
    details: 'সংখ্যা ৭ কেতুর প্রতীক। আপনি একটু অন্তর্মুখী এবং চিন্তাশীল। আপনি জীবনের গভীর অর্থ খুঁজতে পছন্দ করেন। আপনার ষষ্ঠ ইন্দ্রিয় খুব প্রবল। গবেষণা, বিজ্ঞান বা আধ্যাত্মিক কাজে আপনি ভালো করবেন। আপনি একা থাকতে ভালোবাসেন।'
  },
  8: {
    trait: 'উচ্চাকাঙ্ক্ষী ও নির্বাহী (Ambitious)',
    color: 'কালো, গাঢ় নীল',
    element: 'মাটি',
    details: 'সংখ্যা ৮ শনির প্রতীক। আপনি অত্যন্ত উচ্চাকাঙ্ক্ষী এবং ক্ষমতাশালী। আপনি ধীরে কিন্তু নিশ্চিত সাফল্যে বিশ্বাসী। অর্থ এবং ক্ষমতা পরিচালনায় আপনি দক্ষ। জীবনকে আপনি খুব সিরিয়াসলি নেন এবং আপনি একজন ভালো সংগঠক।'
  },
  9: {
    trait: 'মানবদরদী ও সাহসী (Humanitarian)',
    color: 'লাল',
    element: 'আগুন',
    details: 'সংখ্যা ৯ মঙ্গলের প্রতীক। আপনি সাহসী, শক্তিমান এবং পরোপকারী। অন্যায়ের বিরুদ্ধে প্রতিবাদ করতে আপনি পিছপা হন না। রাগ আপনার প্রধান শত্রু হতে পারে, তবে আপনার মন খুব উদার। আপনি মানুষের সেবায় নিজেকে নিয়োজিত করতে পছন্দ করেন।'
  }
};

const Profile: React.FC = () => {
  const { user, updateProfile, sendConnectionRequest, removeConnection, acceptConnectionRequest, rejectConnectionRequest } = useAuth();
  const { t, language } = useLanguage();
  const { posts, likePost, addComment, deletePost, deleteComment } = useCommunity();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<User>>({});
  const [activeTab, setActiveTab] = useState<'about' | 'posts' | 'connections'>('about');
  
  // Verification States
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState('');
  const [verificationMessage, setVerificationMessage] = useState({ type: '', text: '' });
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isIdUploading, setIsIdUploading] = useState(false);
  const [isVideoUploading, setIsVideoUploading] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState<'profile' | 'cover' | null>(null);

  // Match Suggestions State
  const [matches, setMatches] = useState<MatchSuggestion[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [blockedUsers, setBlockedUsers] = useState<Set<string>>(new Set());

  // Numerology State
  const [showNumerologyModal, setShowNumerologyModal] = useState(false);
  const [numerologyResult, setNumerologyResult] = useState<{ number: number; color: string; trait: string; details: string } | null>(null);
  const [numerologyName, setNumerologyName] = useState('');
  const [numerologyDob, setNumerologyDob] = useState('');

  // Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [selectedUserProfile, setSelectedUserProfile] = useState<User | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  // Connections State
  const [connectedProfiles, setConnectedProfiles] = useState<User[]>([]);

  const profileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const idInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Load matches
  useEffect(() => {
    if (!user) return;

    // Simulate AI Algorithm fetching matches
    const fetchMatches = () => {
      setLoadingMatches(true);
      setTimeout(() => {
        // Use real users from local storage if available for better demo, falling back to static
        const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const potentialMatches = allUsers.filter((u: User) => u.id !== user.id && u.gender !== user.gender);

        let generatedMatches: MatchSuggestion[] = [];

        if (potentialMatches.length > 0) {
             generatedMatches = potentialMatches.map((u: User) => ({
                 id: u.id,
                 name: u.fullName,
                 age: parseInt(u.age) || 25,
                 photo: u.profilePhoto || 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
                 occupation: u.occupation || 'N/A',
                 location: u.location || 'Bangladesh',
                 compatibility: Math.floor(Math.random() * 20) + 80,
                 matchingReasons: ['Age', 'Location'],
                 interests: ['Music', 'Travel']
             }));
        } else {
            // Fallback static matches
            generatedMatches = [
            {
                id: '101',
                name: user.gender === 'female' ? 'রাকিব হাসান' : 'সাদিয়া ইসলাম',
                age: user.gender === 'female' ? 29 : 24,
                photo: user.gender === 'female' 
                ? 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80' 
                : 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=400&q=80',
                occupation: user.gender === 'female' ? 'সফটওয়্যার ইঞ্জিনিয়ার' : 'ডাক্তার',
                location: 'ঢাকা, বাংলাদেশ',
                compatibility: 95,
                matchingReasons: ['ধর্মীয় মিল', 'শিক্ষাগত যোগ্যতা', 'পারিবারিক মূল্যবোধ'],
                interests: ['বই পড়া', 'ভ্রমণ', 'টেকনোলজি']
            }
            ];
        }
        setMatches(generatedMatches);
        setLoadingMatches(false);
      }, 1500);
    };

    fetchMatches();
  }, [user]);

  // Load Connected Profiles
  useEffect(() => {
    if (user && user.connections && activeTab === 'connections') {
      const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
      const friends = allUsers.filter((u: User) => user.connections?.includes(u.id));
      setConnectedProfiles(friends);
    }
  }, [user, activeTab]);

  if (!user) return <div>{t('common.loading')}</div>;

  const userPosts = posts.filter(post => post.userId === user.id);

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit - reset form
      setFormData({});
    } else {
      // Start edit - populate form with ALL current data
      setFormData({
        fullName: user.fullName,
        age: user.age,
        gender: user.gender,
        religion: user.religion,
        phone: user.phone,
        bio: user.bio || '',
        location: user.location || '',
        occupation: user.occupation || ''
      });
    }
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    updateProfile(formData);
    setIsEditing(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, field: 'profilePhoto' | 'coverPhoto') => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 500 * 1024) { // 500KB Limit for storage safety
        alert('File size too large. Please select an image under 500KB.');
        e.target.value = ''; // Reset input
        return;
      }

      setUploadingPhoto(field === 'profilePhoto' ? 'profile' : 'cover');

      const reader = new FileReader();
      reader.onloadend = () => {
        setTimeout(() => {
          updateProfile({ [field]: reader.result as string });
          setUploadingPhoto(null);
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
    // Always reset input value to allow selecting same file again
    e.target.value = '';
  };

  const handleUserSearch = () => {
    if (!searchQuery.trim()) return;
    
    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const results = allUsers.filter((u: User) => 
      u.id !== user.id && 
      (u.fullName.toLowerCase().includes(searchQuery.toLowerCase()) || 
       u.id === searchQuery)
    );
    
    setSearchResults(results);
    setHasSearched(true);
  };

  // --- Match Action Handlers ---
  const handleConnect = (matchName: string) => {
    alert(`${matchName} - ${t('common.success')}`);
  };

  const handleRequestConnection = (matchId: string, matchName: string) => {
    sendConnectionRequest(matchId);
    alert(`${matchName} - ${t('profile.requestSent')}`);
  };

  const handleBlockUser = (matchId: string, matchName: string) => {
    if (window.confirm(`${t('profile.block')} ${matchName}?`)) {
      setBlockedUsers(prev => {
        const newSet = new Set(prev);
        newSet.add(matchId);
        return newSet;
      });
    }
  };

  const handleRemoveConnection = (partnerId: string, partnerName: string) => {
    if (window.confirm(`${t('profile.remove')} ${partnerName}?`)) {
        removeConnection(partnerId);
    }
  };

  const handleMessage = (matchName: string) => {
    alert(`${t('profile.message')} ${matchName}: ${t('chat.selectConv')}`);
  };

  // --- Numerology Logic ---
  const openNumerologyModal = () => {
    setNumerologyName(user.fullName || '');
    setNumerologyDob('');
    setNumerologyResult(null);
    setShowNumerologyModal(true);
  };

  const calculateNumerology = () => {
    let sum = 0;
    if (numerologyName) {
      const name = numerologyName.toUpperCase().replace(/[^A-Z]/g, '');
      for (let i = 0; i < name.length; i++) sum += (name.charCodeAt(i) - 64);
    }
    if (numerologyDob) {
      const dateStr = numerologyDob.replace(/[^0-9]/g, '');
      for (let char of dateStr) sum += parseInt(char);
    }
    let finalNumber = sum;
    while (finalNumber > 9) {
      finalNumber = finalNumber.toString().split('').reduce((acc, curr) => acc + parseInt(curr), 0);
    }
    if (finalNumber === 0) finalNumber = 1;

    // Fetch detailed info
    const info = NUMEROLOGY_DATA[finalNumber] || NUMEROLOGY_DATA[1];

    setNumerologyResult({ 
        number: finalNumber, 
        color: info.color, 
        trait: info.trait, 
        details: info.details 
    });
  };

  // --- Verification Handlers ---
  const handleSendOtp = () => {
    if (!user.phone) {
       setVerificationMessage({ type: 'error', text: 'প্রোফাইলে ফোন নম্বর যোগ করুন' });
       return;
    }
    setIsOtpSending(true);
    // Simulate API Call
    setTimeout(() => {
      setIsOtpSending(false);
      setShowOtpInput(true);
      setVerificationMessage({ type: 'success', text: 'OTP পাঠানো হয়েছে (Demo: 123456)' });
    }, 1500);
  };

  const handleVerifyOtp = () => {
    if (otp === '123456') {
      updateProfile({ isPhoneVerified: true });
      setShowOtpInput(false);
      setVerificationMessage({ type: 'success', text: 'ফোন নম্বর ভেরিফাইড!' });
      setTimeout(() => setVerificationMessage({ type: '', text: '' }), 3000);
    } else {
        setVerificationMessage({ type: 'error', text: 'ভুল OTP' });
    }
  };

  const handleIdUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 500 * 1024) { // 500KB Limit for storage safety
              alert('File size too large. Please select an image under 500KB.');
              e.target.value = ''; 
              return;
          }
          setIsIdUploading(true);
          const reader = new FileReader();
          reader.onloadend = () => {
              // Simulate upload
              setTimeout(() => {
                  updateProfile({ 
                      idDocument: reader.result as string, 
                      isIdVerified: false // Needs admin approval, resets verification if re-uploaded
                  });
                  setIsIdUploading(false);
                  alert('আইডি আপলোড সফল হয়েছে। এডমিন রিভিউ এর জন্য অপেক্ষা করুন।');
              }, 1500);
          };
          reader.readAsDataURL(file);
      }
      e.target.value = '';
  };

  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          if (file.size > 2 * 1024 * 1024) { // 2MB Limit for Video in localStorage
              alert('Storage limitation: Video file must be under 2MB.');
              e.target.value = ''; 
              return;
          }
          setIsVideoUploading(true);
          const reader = new FileReader();
          reader.onloadend = () => {
              // Simulate upload
              setTimeout(() => {
                  updateProfile({ 
                      verificationVideo: reader.result as string, 
                      isVideoVerified: false // Needs admin approval
                  });
                  setIsVideoUploading(false);
                  alert('ভিডিও আপলোড সফল হয়েছে। এডমিন রিভিউ এর জন্য অপেক্ষা করুন।');
              }, 2000);
          };
          reader.readAsDataURL(file);
      }
      e.target.value = '';
  };

  // Calculate Profile Completion
  const calculateCompletion = () => {
    let score = 0;
    if (user.profilePhoto) score += 20;
    if (user.bio) score += 10;
    if (user.location) score += 10;
    if (user.occupation) score += 10;
    if (user.isPhoneVerified) score += 20;
    if (user.isIdVerified) score += 20;
    if (user.isVideoVerified) score += 10;
    return score;
  };
  
  const completionScore = calculateCompletion();
  const privacy = user.privacy || { showEmail: false, showPhone: false, showPhoto: true, isProfilePublic: true };

  // Helper to determine button state for a user
  const getActionButton = (targetUser: User) => {
    if (user.connections?.includes(targetUser.id)) {
        return (
            <button disabled className="flex-1 py-2 bg-green-100 text-green-700 rounded-lg text-sm font-medium flex items-center justify-center gap-1 cursor-default shadow-sm">
                <UserCheck size={16} /> {t('profile.connected')}
            </button>
        );
    }
    if (user.sentRequests?.includes(targetUser.id)) {
        return (
            <button disabled className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg text-sm font-medium flex items-center justify-center gap-1 cursor-default shadow-sm">
                <Clock size={16} /> {t('profile.requestSent')}
            </button>
        );
    }
    if (user.connectionRequests?.includes(targetUser.id)) {
        return (
            <div className="flex-1 flex gap-2">
                <button onClick={() => acceptConnectionRequest(targetUser.id)} className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark shadow-sm">{t('profile.accept')}</button>
                <button onClick={() => rejectConnectionRequest(targetUser.id)} className="flex-1 py-2 bg-gray-200 text-dark rounded-lg text-sm font-medium hover:bg-gray-300 shadow-sm">{t('profile.reject')}</button>
            </div>
        );
    }
    return (
        <button 
            onClick={() => handleRequestConnection(targetUser.id, targetUser.fullName)}
            className="flex-1 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-primary-dark transition-colors flex items-center justify-center gap-1 shadow-md hover:shadow-lg"
        >
            <UserPlus size={16} /> {t('profile.connect')}
        </button>
    );
  };

  return (
    <div className="min-h-screen bg-blue-50 pb-20">
      {/* Cover Photo & Header */}
      <div className="relative h-64 md:h-80 w-full bg-gradient-to-r from-primary to-primary-dark group">
        {user.coverPhoto ? (
          <img src={user.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-white/30">
            <Camera size={48} />
          </div>
        )}
        <button 
          type="button"
          onClick={() => coverInputRef.current?.click()}
          disabled={uploadingPhoto === 'cover'}
          className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-all flex items-center gap-2 px-4 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {uploadingPhoto === 'cover' ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
          <span className="text-sm font-medium">{uploadingPhoto === 'cover' ? t('common.loading') : t('profile.coverPhoto')}</span>
        </button>
        <input type="file" ref={coverInputRef} onChange={(e) => handleImageUpload(e, 'coverPhoto')} className="hidden" accept="image/*" />
      </div>

      <div className="container mx-auto px-4">
        <div className="relative -mt-24 mb-6 flex flex-col md:flex-row items-end md:items-end gap-6">
          <div className="relative group mx-auto md:mx-0">
            <div className="w-40 h-40 md:w-48 md:h-48 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
              {user.profilePhoto ? (
                <img src={user.profilePhoto} alt={user.fullName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-400">
                  <UserIcon size={64} />
                </div>
              )}
            </div>
            <button 
              type="button"
              onClick={() => profileInputRef.current?.click()}
              disabled={uploadingPhoto === 'profile'}
              className="absolute bottom-2 right-2 bg-primary text-white p-2 rounded-full shadow-lg hover:bg-primary-dark transition-colors z-10 disabled:opacity-50"
            >
              {uploadingPhoto === 'profile' ? <Loader2 size={18} className="animate-spin" /> : <Camera size={18} />}
            </button>
            <input type="file" ref={profileInputRef} onChange={(e) => handleImageUpload(e, 'profilePhoto')} className="hidden" accept="image/*" />
          </div>

          <div className="flex-1 text-center md:text-left pb-4">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center justify-center md:justify-start gap-2">
              {user.fullName} {user.isIdVerified && <CheckCircle className="text-blue-500 fill-current" size={24} />}
            </h1>
            <p className="text-gray-600 flex items-center justify-center md:justify-start gap-2 mt-1">
              {user.occupation || t('profile.addOccupation')} • {user.location || t('profile.addLocation')}
            </p>
          </div>

          <div className="mb-4 flex gap-3">
            {!isEditing && (
              <button onClick={handleEditToggle} className="flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-full hover:bg-primary-dark transition-colors shadow-sm">
                  <Edit2 size={18} /> {t('profile.editProfile')}
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-gray-200 mb-6 overflow-x-auto">
           <button onClick={() => setActiveTab('about')} className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'about' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>
             <div className="flex items-center gap-2"><UserIcon size={16} /> {t('profile.personalInfo')}</div>
           </button>
           <button onClick={() => setActiveTab('posts')} className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'posts' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>
             <div className="flex items-center gap-2"><LayoutList size={16} /> {t('profile.myPosts')} <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{userPosts.length}</span></div>
           </button>
           <button onClick={() => setActiveTab('connections')} className={`px-6 py-3 font-medium text-sm transition-colors border-b-2 whitespace-nowrap ${activeTab === 'connections' ? 'border-primary text-primary' : 'border-transparent text-gray-500'}`}>
             <div className="flex items-center gap-2"><Users size={16} /> {t('profile.connections')} <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">{user.connections?.length || 0}</span></div>
           </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-8">
          <div className="lg:col-span-2 space-y-6">

            {activeTab === 'about' && (
                <>
                {/* Personal Info - View or Edit */}
                <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 relative">
                    <h3 className="text-xl font-bold text-gray-800 mb-6 border-b pb-4 flex justify-between items-center">
                      {t('profile.personalInfo')}
                      {isEditing && (
                        <button 
                          onClick={() => setIsEditing(false)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </h3>
                    
                    {isEditing ? (
                      /* --- EDIT FORM --- */
                      <div className="space-y-6 animate-in fade-in">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{t('register.fullName')}</label>
                              <input 
                                type="text" 
                                name="fullName"
                                value={formData.fullName || ''}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{t('register.age')}</label>
                              <input 
                                type="number" 
                                name="age"
                                value={formData.age || ''}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{t('register.gender')}</label>
                              <select 
                                name="gender"
                                value={formData.gender || ''}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-lg bg-white"
                              >
                                <option value="male">{t('register.male')}</option>
                                <option value="female">{t('register.female')}</option>
                                <option value="other">{t('register.other')}</option>
                              </select>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{t('register.religion')}</label>
                              <select 
                                name="religion"
                                value={formData.religion || ''}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-lg bg-white"
                              >
                                <option value="islam">{t('register.islam')}</option>
                                <option value="hinduism">{t('register.hinduism')}</option>
                                <option value="christianity">{t('register.christianity')}</option>
                                <option value="buddhism">{t('register.buddhism')}</option>
                                <option value="other">{t('register.other')}</option>
                              </select>
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.phone')}</label>
                              <input 
                                type="text" 
                                name="phone"
                                value={formData.phone || ''}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.occupation')}</label>
                              <input 
                                type="text" 
                                name="occupation"
                                value={formData.occupation || ''}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                              />
                           </div>
                           <div>
                              <label className="block text-sm font-medium text-gray-700 mb-1">{t('profile.location')}</label>
                              <input 
                                type="text" 
                                name="location"
                                value={formData.location || ''}
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                              />
                           </div>
                        </div>
                        
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
                           <textarea 
                             name="bio"
                             rows={3}
                             value={formData.bio || ''}
                             onChange={handleInputChange}
                             placeholder="Write something about yourself..."
                             className="w-full px-4 py-2 border rounded-lg focus:ring-primary focus:border-primary"
                           />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t">
                           <button 
                             onClick={() => setIsEditing(false)}
                             className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
                           >
                             {t('common.cancel')}
                           </button>
                           <button 
                             onClick={handleSave}
                             className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark shadow-sm"
                           >
                             {t('common.save')}
                           </button>
                        </div>
                      </div>
                    ) : (
                      /* --- VIEW DETAILS --- */
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-8">
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-500 flex items-center gap-2"><UserIcon size={16}/> {t('profile.name')}</span>
                            <span className="font-medium text-gray-900">{user.fullName}</span>
                          </div>
                          
                          <div className="flex flex-col gap-1">
                             <span className="text-sm text-gray-500 flex items-center gap-2"><Calendar size={16}/> {t('register.age')}</span>
                             <span className="font-medium text-gray-900">{user.age} Years</span>
                          </div>

                          <div className="flex flex-col gap-1">
                             <span className="text-sm text-gray-500 flex items-center gap-2"><Users size={16}/> {t('register.gender')}</span>
                             <span className="font-medium text-gray-900 capitalize">{user.gender}</span>
                          </div>

                          <div className="flex flex-col gap-1">
                             <span className="text-sm text-gray-500 flex items-center gap-2"><BookOpen size={16}/> {t('register.religion')}</span>
                             <span className="font-medium text-gray-900 capitalize">{user.religion}</span>
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-500 flex items-center gap-2"><Mail size={16}/> {t('profile.email')}</span>
                            <span className="font-medium text-gray-900">{user.email}</span>
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-500 flex items-center gap-2"><Smartphone size={16}/> {t('profile.phone')}</span>
                            <span className="font-medium text-gray-900">{user.phone || '-'}</span>
                          </div>
                          
                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-500 flex items-center gap-2"><Briefcase size={16}/> {t('profile.occupation')}</span>
                            <span className="font-medium text-gray-900">{user.occupation || '-'}</span>
                          </div>

                          <div className="flex flex-col gap-1">
                            <span className="text-sm text-gray-500 flex items-center gap-2"><MapPin size={16}/> {t('profile.location')}</span>
                            <span className="font-medium text-gray-900">{user.location || '-'}</span>
                          </div>

                          <div className="col-span-1 md:col-span-2 flex flex-col gap-1 mt-2">
                            <span className="text-sm text-gray-500 flex items-center gap-2"><FileText size={16}/> Bio</span>
                            <p className="text-gray-700 leading-relaxed bg-gray-50 p-3 rounded-lg border border-gray-100 min-h-[60px]">
                              {user.bio || <span className="text-gray-400 italic">No bio added yet.</span>}
                            </p>
                          </div>
                      </div>
                    )}
                </div>

                {/* Search & Matches Section (Only visible when not editing) */}
                {!isEditing && (
                  <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 border border-gray-100">
                      <h3 className="text-xl font-bold text-gray-800 mb-4">{t('profile.aiMatchSearch')}</h3>
                      {/* ... Search Input Code ... */}
                      <div className="flex gap-2 mb-6">
                          <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t('profile.searchPlaceholder')} className="flex-1 px-4 py-2 border rounded-lg" />
                          <button onClick={handleUserSearch} className="px-6 py-2 bg-primary text-white rounded-lg">{t('profile.searchBtn')}</button>
                      </div>

                      {hasSearched && (
                          <div className="space-y-4 mb-6">
                              <h4 className="font-bold">{t('profile.results')}</h4>
                              {searchResults.length > 0 ? searchResults.map(result => (
                                  <div key={result.id} className="border p-4 rounded-lg flex items-center justify-between">
                                      <div 
                                        className="flex items-center gap-3 cursor-pointer hover:opacity-80" 
                                        onClick={() => setSelectedUserProfile(result)}
                                      >
                                          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                              {result.profilePhoto ? <img src={result.profilePhoto} className="w-full h-full object-cover" /> : null}
                                          </div>
                                          <div>
                                              <div className="font-semibold">{result.fullName}</div>
                                              <div className="text-xs text-primary font-medium">{t('profile.viewProfile')}</div>
                                          </div>
                                      </div>
                                      {getActionButton(result)}
                                  </div>
                              )) : (
                                  <p className="text-gray-500">{t('profile.noResults')}</p>
                              )}
                          </div>
                      )}

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {matches.map(match => (
                              <div 
                                key={match.id} 
                                className="border rounded-xl p-4 hover:shadow-md transition-all cursor-pointer"
                                onClick={() => {
                                    const allUsers = JSON.parse(localStorage.getItem('users') || '[]');
                                    const fullUser = allUsers.find((u: User) => u.id === match.id);
                                    if(fullUser) setSelectedUserProfile(fullUser);
                                }}
                              >
                                  <div className="flex gap-3 mb-3">
                                      <img src={match.photo} className="w-12 h-12 rounded-full object-cover" />
                                      <div>
                                          <h4 className="font-bold text-gray-800">{match.name}</h4>
                                          <p className="text-xs text-gray-500">{match.age} years • {match.occupation}</p>
                                      </div>
                                  </div>
                                  <div className="flex gap-2">
                                      {user.sentRequests?.includes(match.id) ? (
                                           <button disabled onClick={(e) => e.stopPropagation()} className="flex-1 py-2 bg-gray-200 text-gray-700 rounded-lg text-xs">{t('profile.requestSent')}</button>
                                      ) : (
                                           <button 
                                              onClick={(e) => {
                                                  e.stopPropagation();
                                                  handleRequestConnection(match.id, match.name);
                                              }} 
                                              className="flex-1 py-2 bg-primary text-white rounded-lg text-xs"
                                            >
                                                {t('profile.connect')}
                                            </button>
                                      )}
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
                )}
                </>
            )}

            {activeTab === 'posts' && (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2">{t('profile.myPosts')}</h3>
                    {userPosts.length > 0 ? (
                        userPosts.map(post => (
                            <PostCard 
                                key={post.id} 
                                post={post} 
                                currentUser={user} 
                                onLike={() => likePost(post.id)}
                                onComment={(text) => addComment(post.id, text)}
                                onDelete={() => deletePost(post.id)}
                                onDeleteComment={(commentId) => deleteComment(post.id, commentId)}
                            />
                        ))
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
                            <h4 className="text-lg font-bold text-gray-700">{t('community.noPosts')}</h4>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'connections' && (
                <div className="space-y-6">
                    <h3 className="text-xl font-bold text-gray-800 mb-2 flex items-center gap-2">
                       <Users className="text-primary" size={24} /> {t('profile.connections')}
                    </h3>
                    
                    {connectedProfiles.length > 0 ? (
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {connectedProfiles.map(friend => (
                             <div key={friend.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 flex flex-col items-center text-center hover:shadow-md transition-all">
                                <div 
                                    className="w-20 h-20 rounded-full overflow-hidden bg-gray-200 mb-3 border-2 border-white shadow-sm cursor-pointer hover:opacity-90"
                                    onClick={() => setSelectedUserProfile(friend)}
                                >
                                   {friend.profilePhoto ? (
                                      <img src={friend.profilePhoto} alt={friend.fullName} className="w-full h-full object-cover" />
                                   ) : (
                                      <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-xl">
                                         {friend.fullName[0]}
                                      </div>
                                   )}
                                </div>
                                
                                <h4 className="font-bold text-gray-800 text-lg mb-1">{friend.fullName}</h4>
                                <p className="text-sm text-gray-500 mb-1">{friend.occupation || 'N/A'}</p>
                                
                                <div className="grid grid-cols-2 gap-2 w-full mt-auto">
                                   <button 
                                     onClick={() => handleMessage(friend.fullName)}
                                     className="py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                                   >
                                      <MessageCircle size={16} /> {t('profile.message')}
                                   </button>
                                   <button 
                                     onClick={() => handleRemoveConnection(friend.id, friend.fullName)}
                                     className="py-2 bg-red-50 text-red-500 hover:bg-red-100 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-1"
                                   >
                                      <UserMinus size={16} /> {t('profile.remove')}
                                   </button>
                                </div>
                             </div>
                          ))}
                       </div>
                    ) : (
                       <div className="bg-white rounded-xl shadow-sm p-10 text-center">
                            <h4 className="text-xl font-bold text-gray-700 mb-2">{t('profile.noConnections')}</h4>
                        </div>
                    )}
                </div>
            )}
          </div>

          <div className="space-y-6">
             {/* Sidebar Content (Score, Numerology) */}
             <div className="bg-white rounded-xl shadow-sm p-6">
                <h4 className="font-bold text-gray-800 mb-4">{t('profile.profileScore')}: {completionScore}%</h4>
                <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                   <div className="bg-success h-2.5 rounded-full" style={{ width: `${Math.min(completionScore, 100)}%` }}></div>
                </div>
             </div>

             {/* Verification Center */}
             <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h4 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                   <Shield className="text-primary" size={20} /> ভেরিফিকেশন সেন্টার
                </h4>
                
                <div className="space-y-4">
                    {/* Mobile Verification */}
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Smartphone size={16} /> মোবাইল
                            </div>
                            {user.isPhoneVerified ? (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                                    <CheckCircle size={12} /> Verified
                                </span>
                            ) : (
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                                    Unverified
                                </span>
                            )}
                        </div>
                        {!user.isPhoneVerified && (
                             <div>
                                 {!showOtpInput ? (
                                     <button 
                                         onClick={handleSendOtp} 
                                         disabled={isOtpSending}
                                         className="w-full py-1.5 bg-white border border-gray-300 rounded text-xs font-semibold hover:bg-gray-100 flex items-center justify-center gap-1"
                                     >
                                         {isOtpSending ? <Loader2 size={12} className="animate-spin" /> : 'Send OTP'}
                                     </button>
                                 ) : (
                                     <div className="flex gap-2">
                                         <input 
                                             type="text" 
                                             placeholder="OTP" 
                                             className="w-full border p-1 rounded text-xs text-center"
                                             value={otp}
                                             onChange={(e) => setOtp(e.target.value)}
                                         />
                                         <button 
                                             onClick={handleVerifyOtp}
                                             className="bg-primary text-white px-3 rounded text-xs font-bold"
                                         >
                                             Verify
                                         </button>
                                     </div>
                                 )}
                                 {verificationMessage.text && (
                                     <p className={`text-xs mt-1 ${verificationMessage.type === 'success' ? 'text-green-600' : 'text-red-500'}`}>
                                         {verificationMessage.text}
                                     </p>
                                 )}
                             </div>
                        )}
                    </div>

                    {/* Government ID Verification */}
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <FileText size={16} /> সরকারি আইডি
                            </div>
                            {user.isIdVerified ? (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                                    <CheckCircle size={12} /> Verified
                                </span>
                            ) : user.idDocument ? (
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">
                                    Pending Review
                                </span>
                            ) : (
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                                    Unverified
                                </span>
                            )}
                        </div>
                        {!user.isIdVerified && (
                             <div>
                                 <button 
                                     onClick={() => idInputRef.current?.click()} 
                                     disabled={isIdUploading}
                                     className="w-full py-1.5 bg-white border border-gray-300 rounded text-xs font-semibold hover:bg-gray-100 flex items-center justify-center gap-1"
                                 >
                                     {isIdUploading ? <Loader2 size={12} className="animate-spin" /> : (user.idDocument ? <RefreshCw size={12} /> : <UploadCloud size={12} />)}
                                     {user.idDocument ? 'Re-upload ID' : 'Upload ID Photo'}
                                 </button>
                                 <input type="file" ref={idInputRef} onChange={handleIdUpload} className="hidden" accept="image/*" />
                                 <p className="text-[10px] text-gray-500 mt-1 text-center">JPG/PNG, Max 500KB</p>
                             </div>
                        )}
                    </div>

                    {/* Video Selfie Verification */}
                    <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                        <div className="flex justify-between items-center mb-2">
                            <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                                <Video size={16} /> ভিডিও সেলফি
                            </div>
                            {user.isVideoVerified ? (
                                <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1 font-bold">
                                    <CheckCircle size={12} /> Verified
                                </span>
                            ) : user.verificationVideo ? (
                                <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">
                                    Pending Review
                                </span>
                            ) : (
                                <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full font-bold">
                                    Unverified
                                </span>
                            )}
                        </div>
                        {!user.isVideoVerified && (
                             <div>
                                 <button 
                                     onClick={() => videoInputRef.current?.click()} 
                                     disabled={isVideoUploading}
                                     className="w-full py-1.5 bg-white border border-gray-300 rounded text-xs font-semibold hover:bg-gray-100 flex items-center justify-center gap-1"
                                 >
                                     {isVideoUploading ? <Loader2 size={12} className="animate-spin" /> : (user.verificationVideo ? <RefreshCw size={12} /> : <UploadCloud size={12} />)}
                                     {user.verificationVideo ? 'Re-upload Video' : 'Upload Selfie Video'}
                                 </button>
                                 <input type="file" ref={videoInputRef} onChange={handleVideoUpload} className="hidden" accept="video/*" />
                                 <p className="text-[10px] text-gray-500 mt-1 text-center">MP4/WebM, Max 2MB</p>
                             </div>
                        )}
                    </div>
                </div>
             </div>

             <div className="bg-white rounded-xl shadow-sm p-6 border-t-4 border-purple-500">
               <div className="flex items-center gap-3 mb-4">
                  <div className="bg-purple-100 p-2 rounded-full text-purple-600">
                    <Calculator size={20} />
                  </div>
                  <h4 className="font-bold text-gray-800">{t('profile.numerologyBtn')}</h4>
               </div>
               <button onClick={openNumerologyModal} className="w-full py-2 bg-purple-600 text-white rounded-lg">{t('profile.checkNow')}</button>
            </div>
          </div>
        </div>
      </div>
      
      {/* Numerology Modal */}
      {showNumerologyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative animate-in zoom-in fade-in duration-200">
            <button onClick={() => setShowNumerologyModal(false)} className="absolute top-4 right-4 text-gray-500 hover:text-red-500"><X /></button>
            <h3 className="text-2xl font-bold mb-4 text-center text-gray-800">{t('profile.numerology')}</h3>
            
            {!numerologyResult ? (
                 <div className="space-y-4">
                    <input type="text" placeholder={t('profile.numerologyInputName')} className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-400 outline-none" value={numerologyName} onChange={e => setNumerologyName(e.target.value)} />
                    <input type="date" className="w-full border p-2 rounded focus:ring-2 focus:ring-purple-400 outline-none" value={numerologyDob} onChange={e => setNumerologyDob(e.target.value)} />
                    <button onClick={calculateNumerology} className="w-full bg-purple-600 text-white p-2 rounded hover:bg-purple-700 transition-colors shadow-md">{t('profile.generate')}</button>
                 </div>
            ) : (
                <div className="text-center space-y-4">
                    <div className="w-24 h-24 bg-purple-100 rounded-full flex items-center justify-center mx-auto border-4 border-purple-500 shadow-inner">
                        <span className="text-5xl font-bold text-purple-700">{numerologyResult.number}</span>
                    </div>
                    
                    <div>
                        <h4 className="text-xl font-bold text-gray-800">{numerologyResult.trait}</h4>
                        <div className="flex justify-center gap-2 mt-2">
                            <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold border border-yellow-200">শুভ রং: {numerologyResult.color}</span>
                        </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-xl text-left border border-gray-100">
                        <p className="text-gray-600 leading-relaxed text-sm md:text-base">
                            {numerologyResult.details}
                        </p>
                    </div>
                    
                    <button onClick={() => setNumerologyResult(null)} className="text-purple-600 hover:underline text-sm font-medium">পুনরায় গণনা করুন</button>
                </div>
            )}
          </div>
        </div>
      )}

      {/* Public Profile View Modal */}
      {selectedUserProfile && (
        <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4 animate-in fade-in">
           <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto relative shadow-2xl">
              <button 
                onClick={() => setSelectedUserProfile(null)}
                className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70 text-white p-2 rounded-full transition-colors backdrop-blur-sm"
              >
                <X size={24} />
              </button>

              {/* Cover Photo */}
              <div className="h-48 md:h-64 bg-gray-200 w-full relative">
                 {selectedUserProfile.coverPhoto ? (
                    <img src={selectedUserProfile.coverPhoto} alt="Cover" className="w-full h-full object-cover" />
                 ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                       <FileText size={48} />
                    </div>
                 )}
              </div>

              <div className="px-6 pb-8 md:px-10">
                 <div className="flex flex-col md:flex-row items-end -mt-16 md:-mt-20 mb-6 gap-6">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-lg overflow-hidden bg-white flex-shrink-0">
                       {selectedUserProfile.profilePhoto ? (
                          <img src={selectedUserProfile.profilePhoto} alt="Profile" className="w-full h-full object-cover" />
                       ) : (
                          <div className="w-full h-full flex items-center justify-center text-gray-400">
                             <Users size={40} />
                          </div>
                       )}
                    </div>
                    <div className="flex-1 text-center md:text-left">
                       <h2 className="text-3xl font-bold text-gray-900 flex items-center justify-center md:justify-start gap-2">
                          {selectedUserProfile.fullName}
                          {selectedUserProfile.isIdVerified && <CheckCircle className="text-blue-500 fill-current" size={24} />}
                       </h2>
                       <p className="text-gray-600">{selectedUserProfile.occupation || 'N/A'} • {selectedUserProfile.location || 'N/A'}</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto">
                        {/* Re-use action button logic with slight styling mods for modal context */}
                        <div className="flex-1 md:flex-initial">
                          {getActionButton(selectedUserProfile)}
                        </div>
                    </div>
                 </div>

                 <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                     <div className="lg:col-span-1 space-y-6">
                         {/* Details Card */}
                         <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                            <h3 className="font-bold text-gray-800 mb-4">{t('profile.personalInfo')}</h3>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between py-1 border-b border-gray-200">
                                    <span className="text-gray-500">{t('register.age')}</span>
                                    <span className="font-medium">{selectedUserProfile.age} Years</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-gray-200">
                                    <span className="text-gray-500">{t('register.gender')}</span>
                                    <span className="font-medium capitalize">{selectedUserProfile.gender}</span>
                                </div>
                                <div className="flex justify-between py-1 border-b border-gray-200">
                                    <span className="text-gray-500">{t('register.religion')}</span>
                                    <span className="font-medium capitalize">{selectedUserProfile.religion}</span>
                                </div>
                                <div className="flex justify-between py-1">
                                    <span className="text-gray-500">{t('profile.location')}</span>
                                    <span className="font-medium">{selectedUserProfile.location || '-'}</span>
                                </div>
                            </div>
                         </div>
                         
                         {/* Bio */}
                         <div className="bg-gray-50 p-5 rounded-xl border border-gray-100">
                             <h3 className="font-bold text-gray-800 mb-2">Bio</h3>
                             <p className="text-gray-600 text-sm leading-relaxed">
                                {selectedUserProfile.bio || 'No bio available.'}
                             </p>
                         </div>
                     </div>

                     <div className="lg:col-span-2">
                         <h3 className="font-bold text-gray-800 mb-4 text-xl border-b pb-2">Recent Posts</h3>
                         <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                            {posts.filter(p => p.userId === selectedUserProfile.id).length > 0 ? (
                                posts.filter(p => p.userId === selectedUserProfile.id).map(post => (
                                    <PostCard 
                                        key={post.id} 
                                        post={post} 
                                        currentUser={user} 
                                        onLike={() => likePost(post.id)}
                                        onComment={(text) => addComment(post.id, text)}
                                        onDelete={() => deletePost(post.id)}
                                        onDeleteComment={(commentId) => deleteComment(post.id, commentId)}
                                    />
                                ))
                            ) : (
                                <div className="text-center py-10 bg-gray-50 rounded-xl text-gray-500">
                                    {t('community.noPosts')}
                                </div>
                            )}
                         </div>
                     </div>
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default Profile;


import React, { createContext, useContext, useState, useEffect } from 'react';
import { Post, CommunityContextType, Comment } from '../types';
import { useAuth } from './AuthContext';

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};

// Mock Initial Data
const MOCK_POSTS: Post[] = [
  {
    id: '1',
    userId: '101',
    userName: 'সাদিয়া ইসলাম',
    userPhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    content: 'আজকের দিনটা খুব সুন্দর! 🌸',
    likes: ['102', '103'],
    comments: [],
    timestamp: Date.now() - 3600000,
  },
  {
    id: '2',
    userId: '102',
    userName: 'রাকিব হাসান',
    userPhoto: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?ixlib=rb-1.2.1&auto=format&fit=crop&w=200&q=80',
    content: 'নতুন চাকরি শুরু করলাম। সবাই দোয়া করবেন।',
    image: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80',
    likes: ['101'],
    comments: [
      {
        id: 'c1',
        userId: '101',
        userName: 'সাদিয়া ইসলাম',
        text: 'অভিনন্দন! 🎉',
        timestamp: Date.now() - 1800000
      }
    ],
    timestamp: Date.now() - 7200000,
  }
];

export const CommunityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);

  // Helper to safely save to localStorage
  const saveToStorage = (key: string, data: Post[]) => {
    try {
      // Logic to prevent storing Blob URLs (large videos) in localStorage which causes crash
      const safeData = data.map(post => {
        if (post.video && post.video.startsWith('blob:')) {
           // We cannot persist Blob URLs or huge base64 strings (300MB) in localStorage.
           // In a real app, this would be an S3 URL.
           // Here, we replace it with a mock URL so it doesn't crash, 
           // but keeping the user experience alive for the session.
           return { 
             ...post, 
             video: 'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', // Mock fallback for persistence
             content: post.content + '\n(Note: Large video not persisted in demo storage)' 
           };
        }
        return post;
      });

      localStorage.setItem(key, JSON.stringify(safeData));
    } catch (error: any) {
      if (error.name === 'QuotaExceededError' || error.code === 22) {
        alert('Storage limit reached! Old posts might not be saved.');
        console.error('LocalStorage quota exceeded in CommunityContext');
      } else {
        console.error('Storage error:', error);
      }
    }
  };

  useEffect(() => {
    const storedPosts = localStorage.getItem('community_posts');
    if (storedPosts) {
      setPosts(JSON.parse(storedPosts));
    } else {
      setPosts(MOCK_POSTS);
      saveToStorage('community_posts', MOCK_POSTS);
    }
  }, []);

  const createPost = (content: string, image?: string, video?: string) => {
    if (!user) return;

    const newPost: Post = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.fullName,
      userPhoto: user.profilePhoto,
      content,
      image,
      video, // This might be a Blob URL (huge)
      likes: [],
      comments: [],
      timestamp: Date.now(),
    };

    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts); // Update state immediately (Video works here because it's in memory)
    saveToStorage('community_posts', updatedPosts); // Save safe version to storage
  };

  const deletePost = (postId: string) => {
    if (!user) return;
    const updatedPosts = posts.filter(p => p.id !== postId);
    setPosts(updatedPosts);
    saveToStorage('community_posts', updatedPosts);
  };

  const likePost = (postId: string) => {
    if (!user) return;

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const hasLiked = post.likes.includes(user.id);
        const newLikes = hasLiked 
          ? post.likes.filter(id => id !== user.id)
          : [...post.likes, user.id];
        return { ...post, likes: newLikes };
      }
      return post;
    });

    setPosts(updatedPosts);
    saveToStorage('community_posts', updatedPosts);
  };

  const addComment = (postId: string, text: string) => {
    if (!user) return;

    const newComment: Comment = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.fullName,
      userPhoto: user.profilePhoto,
      text,
      timestamp: Date.now(),
    };

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return { ...post, comments: [...post.comments, newComment] };
      }
      return post;
    });

    setPosts(updatedPosts);
    saveToStorage('community_posts', updatedPosts);
  };

  const deleteComment = (postId: string, commentId: string) => {
    if (!user) return;

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return { 
          ...post, 
          comments: post.comments.filter(c => c.id !== commentId) 
        };
      }
      return post;
    });

    setPosts(updatedPosts);
    saveToStorage('community_posts', updatedPosts);
  };

  return (
    <CommunityContext.Provider value={{
      posts,
      createPost,
      deletePost,
      likePost,
      addComment,
      deleteComment
    }}>
      {children}
    </CommunityContext.Provider>
  );
};

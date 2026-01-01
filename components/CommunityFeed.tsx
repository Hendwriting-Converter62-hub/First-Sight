
import React, { useState, useRef, useEffect } from 'react';
import { useCommunity } from '../contexts/CommunityContext';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { Image, Video, Send, Heart, MessageCircle, MoreVertical, Trash2, User, X, ExternalLink } from 'lucide-react';
import { Post } from '../types';

const CommunityFeed: React.FC = () => {
  const { posts, createPost, likePost, addComment, deletePost, deleteComment } = useCommunity();
  const { user, isAuthenticated } = useAuth();
  const { t } = useLanguage();

  const [newPostText, setNewPostText] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);

  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  // Clean up object URLs to avoid memory leaks
  useEffect(() => {
    return () => {
      if (selectedVideo && selectedVideo.startsWith('blob:')) {
        URL.revokeObjectURL(selectedVideo);
      }
    };
  }, [selectedVideo]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'image' | 'video') => {
    const file = e.target.files?.[0];
    if (file) {
      if (type === 'image') {
        if (file.size > 500 * 1024) { // 500KB limit for Images (Base64 storage)
          alert('Image size too large. Please select a file under 500KB.');
          e.target.value = '';
          return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
          setSelectedImage(reader.result as string);
          setSelectedVideo(null);
        };
        reader.readAsDataURL(file);
      } else {
        // Video Logic - Allow up to 300MB
        if (file.size > 300 * 1024 * 1024) { // 300MB Limit
          alert('Video size must be under 300MB.');
          e.target.value = '';
          return;
        }
        
        // Use createObjectURL for large videos instead of FileReader to prevent memory crash
        const videoUrl = URL.createObjectURL(file);
        setSelectedVideo(videoUrl);
        setSelectedImage(null);
      }
    }
    
    // Reset inputs to allow re-selection
    if (type === 'image' && imageInputRef.current) imageInputRef.current.value = '';
    if (type === 'video' && videoInputRef.current) videoInputRef.current.value = '';
  };

  const clearMedia = () => {
    if (selectedVideo && selectedVideo.startsWith('blob:')) {
        URL.revokeObjectURL(selectedVideo);
    }
    setSelectedImage(null);
    setSelectedVideo(null);
  };

  const handleCreatePost = () => {
    if (!newPostText.trim() && !selectedImage && !selectedVideo) return;
    
    setIsPosting(true);
    // Simulate network delay
    setTimeout(() => {
      createPost(newPostText, selectedImage || undefined, selectedVideo || undefined);
      setNewPostText('');
      // Do not revoke immediately, let the context handle the pass-off
      setSelectedImage(null);
      setSelectedVideo(null);
      setIsPosting(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6">
      <div className="container mx-auto px-4 max-w-2xl">
        
        {/* Create Post Section */}
        {isAuthenticated && user && (
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
            <div className="flex gap-3 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                {user.profilePhoto ? (
                  <img src={user.profilePhoto} alt={user.fullName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                    <User size={20} />
                  </div>
                )}
              </div>
              <textarea
                value={newPostText}
                onChange={(e) => setNewPostText(e.target.value)}
                placeholder={t('community.placeholder')}
                className="flex-1 bg-gray-50 rounded-lg p-3 border-none focus:ring-1 focus:ring-primary outline-none resize-none min-h-[80px]"
              />
            </div>

            {/* Media Previews */}
            {(selectedImage || selectedVideo) && (
              <div className="relative mb-4 rounded-lg overflow-hidden max-h-[400px] bg-black">
                {selectedImage && (
                    <img src={selectedImage} alt="Preview" className="w-full h-full object-contain" />
                )}
                {selectedVideo && (
                    <video src={selectedVideo} controls className="w-full h-full object-contain" />
                )}
                <button 
                  onClick={clearMedia}
                  className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black/80 transition-colors"
                >
                  <X size={16} />
                </button>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-gray-100">
              <div className="flex gap-2">
                <button 
                  onClick={() => imageInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                >
                  <Image size={20} className="text-green-500" />
                  {t('community.photo')}
                </button>
                <input type="file" ref={imageInputRef} onChange={(e) => handleFileChange(e, 'image')} accept="image/*" className="hidden" />

                <button 
                  onClick={() => videoInputRef.current?.click()}
                  className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors text-sm font-medium"
                >
                  <Video size={20} className="text-red-500" />
                  {t('community.video')}
                </button>
                {/* Updated accept attribute for better mobile support */}
                <input type="file" ref={videoInputRef} onChange={(e) => handleFileChange(e, 'video')} accept="video/mp4,video/x-m4v,video/*" className="hidden" />
              </div>

              <button 
                onClick={handleCreatePost}
                disabled={isPosting || (!newPostText.trim() && !selectedImage && !selectedVideo)}
                className={`flex items-center gap-2 px-6 py-2 bg-primary text-white rounded-full font-bold shadow-md transition-all ${isPosting || (!newPostText.trim() && !selectedImage && !selectedVideo) ? 'opacity-50 cursor-not-allowed' : 'hover:bg-primary-dark hover:shadow-lg'}`}
              >
                {isPosting ? t('community.posting') : t('community.postBtn')}
                <Send size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Sponsored Banner for Feed */}
        <a 
          href="https://url-shortener.me/41OT" 
          target="_blank" 
          rel="noopener noreferrer"
          className="block mb-6 bg-gradient-to-r from-primary/10 to-primary/5 rounded-xl p-6 border border-primary/20 hover:border-primary/40 transition-all group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white rounded-full shadow-sm text-primary group-hover:scale-110 transition-transform">
                <ExternalLink size={24} />
              </div>
              <div>
                <span className="text-[10px] font-bold text-primary uppercase bg-primary/10 px-2 py-0.5 rounded-full">Promoted</span>
                <h4 className="font-bold text-gray-800">আপনার জন্য সেরা ডিলটি দেখে নিন!</h4>
                <p className="text-xs text-gray-500">বিশেষ পার্টনার অফার শুধুমাত্র First Sight মেম্বারদের জন্য।</p>
              </div>
            </div>
            <button className="hidden sm:block px-4 py-2 bg-primary text-white text-xs font-bold rounded-full">Learn More</button>
          </div>
        </a>

        {/* Posts Feed */}
        <div className="space-y-6">
          {posts.map(post => (
            <PostCard 
              key={post.id} 
              post={post} 
              currentUser={user} 
              onLike={() => likePost(post.id)}
              onComment={(text) => addComment(post.id, text)}
              onDelete={() => deletePost(post.id)}
              onDeleteComment={(commentId) => deleteComment(post.id, commentId)}
            />
          ))}

          {posts.length === 0 && (
            <div className="text-center py-10 text-gray-500">
               <p>{t('community.noPosts')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const PostCard: React.FC<{ 
  post: Post; 
  currentUser: any; 
  onLike: () => void;
  onComment: (text: string) => void;
  onDelete: () => void;
  onDeleteComment: (commentId: string) => void;
}> = ({ post, currentUser, onLike, onComment, onDelete, onDeleteComment }) => {
  const [commentText, setCommentText] = useState('');
  const [showComments, setShowComments] = useState(false);
  const { t } = useLanguage();
  
  const isLiked = currentUser ? post.likes.includes(currentUser.id) : false;
  const isOwner = currentUser ? post.userId === currentUser.id : false;
  const isAdmin = currentUser?.role === 'admin';

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      onComment(commentText);
      setCommentText('');
    }
  };

  const formatTime = (timestamp: number) => {
    const minutes = Math.floor((Date.now() - timestamp) / 60000);
    if (minutes < 1) return t('community.justNow');
    if (minutes < 60) return `${minutes} ${t('community.minAgo')}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} ${t('community.hourAgo')}`;
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100">
      {/* Post Header */}
      <div className="p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200">
            {post.userPhoto ? (
              <img src={post.userPhoto} alt={post.userName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-500">
                <User size={20} />
              </div>
            )}
          </div>
          <div>
            <h3 className="font-bold text-gray-800">{post.userName}</h3>
            <p className="text-xs text-gray-500">{formatTime(post.timestamp)}</p>
          </div>
        </div>
        {(isOwner || isAdmin) && (
          <button onClick={onDelete} className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Trash2 size={18} />
          </button>
        )}
      </div>

      {/* Post Content */}
      <div className="px-4 pb-3">
        {post.content && <p className="text-gray-800 whitespace-pre-wrap mb-3">{post.content}</p>}
      </div>

      {post.image && (
        <div className="w-full bg-black/5">
          <img src={post.image} alt="Post content" className="w-full max-h-[500px] object-contain" />
        </div>
      )}

      {post.video && (
        <div className="w-full bg-black">
          <video src={post.video} controls className="w-full max-h-[500px]" />
        </div>
      )}

      {/* Post Stats */}
      <div className="px-4 py-2 border-b border-gray-100 flex justify-between text-sm text-gray-500">
        <span>{post.likes.length} {t('community.likes')}</span>
        <span>{post.comments.length} {t('community.comments')}</span>
      </div>

      {/* Actions */}
      <div className="px-2 py-1 flex border-b border-gray-100">
        <button 
          onClick={onLike}
          className={`flex-1 py-2 flex items-center justify-center gap-2 rounded-lg transition-colors ${isLiked ? 'text-red-500' : 'text-gray-600 hover:bg-gray-50'}`}
        >
          <Heart size={20} fill={isLiked ? "currentColor" : "none"} />
          <span className="font-medium">{t('community.like')}</span>
        </button>
        <button 
          onClick={() => setShowComments(!showComments)}
          className="flex-1 py-2 flex items-center justify-center gap-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
        >
          <MessageCircle size={20} />
          <span className="font-medium">{t('community.comment')}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="p-4 bg-gray-50">
          <div className="space-y-4 mb-4">
            {post.comments.map(comment => {
              const isCommentOwner = currentUser?.id === comment.userId;
              const canDeleteComment = isCommentOwner || isAdmin;
              
              return (
                <div key={comment.id} className="flex gap-2 group">
                  <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                    {comment.userPhoto ? (
                      <img src={comment.userPhoto} alt={comment.userName} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        <User size={14} />
                      </div>
                    )}
                  </div>
                  <div className="bg-white p-3 rounded-2xl rounded-tl-none shadow-sm relative pr-8 min-w-[150px]">
                    <h4 className="font-bold text-xs text-gray-800">{comment.userName}</h4>
                    <p className="text-sm text-gray-600">{comment.text}</p>
                    
                    {canDeleteComment && (
                      <button 
                        onClick={() => onDeleteComment(comment.id)}
                        className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        title={t('common.delete')}
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
               {currentUser?.profilePhoto ? (
                 <img src={currentUser.profilePhoto} alt="Me" className="w-full h-full object-cover" />
               ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-500">
                     <User size={14} />
                  </div>
               )}
            </div>
            <div className="flex-1 relative">
              <input 
                type="text" 
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder={t('community.writeComment')}
                className="w-full pl-4 pr-10 py-2 rounded-full border border-gray-300 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
              />
              <button 
                type="submit"
                disabled={!commentText.trim()}
                className="absolute right-2 top-1.5 text-primary disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default CommunityFeed;

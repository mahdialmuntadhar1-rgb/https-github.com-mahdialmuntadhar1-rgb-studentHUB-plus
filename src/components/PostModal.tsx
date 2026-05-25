import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Heart, Send, CheckCircle2, MoreHorizontal } from 'lucide-react';
import { Post, Comment } from '../types';
import { SAMPLE_COMMENTS } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { getComments, addComment } from '../lib/api';

interface PostModalProps {
  post: Post | null;
  onClose: () => void;
}

export default function PostModal({ post, onClose }: PostModalProps) {
  const { user, profile } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [likedComments, setLikedComments] = useState<Set<string>>(new Set());
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!post) return;
    setComments([]);
    // Load mock comments first for instant display
    const mock = SAMPLE_COMMENTS[post.id] || [];
    setComments(mock);
    // Then try to fetch real comments
    getComments(post.id).then(real => {
      if (real.length > 0) setComments(real);
    }).catch(() => {/* keep mock data */});
  }, [post?.id]);

  useEffect(() => {
    if (post) document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, [post]);

  const handleAddComment = async () => {
    if (!newComment.trim() || !post || !user) return;
    setIsPosting(true);
    const optimistic: Comment = {
      id: `temp-${Date.now()}`,
      postId: post.id,
      authorName: profile?.full_name || 'أنت',
      authorAvatar: profile?.avatar_url || `https://picsum.photos/seed/${user.id}/100/100`,
      content: newComment.trim(),
      timestamp: 'الآن',
      likes: 0,
    };
    setComments(prev => [...prev, optimistic]);
    setNewComment('');
    try {
      const saved = await addComment(post.id, newComment.trim());
      setComments(prev => prev.map(c => c.id === optimistic.id ? { ...saved, postId: post.id } : c));
    } catch {
      // keep optimistic comment
    } finally {
      setIsPosting(false);
    }
  };

  const toggleCommentLike = (id: string) => {
    setLikedComments(prev => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  if (!post) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4"
        onClick={onClose}
      >
        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative bg-white w-full sm:max-w-lg rounded-t-[2.5rem] sm:rounded-[2.5rem] overflow-hidden max-h-[90vh] flex flex-col"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-5 border-b border-gray-100 flex-shrink-0">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img
                  src={post.authorAvatar || post.institutionLogo}
                  className="w-10 h-10 rounded-2xl object-cover"
                  alt=""
                  referrerPolicy="no-referrer"
                />
                {post.isVerified && (
                  <div className="absolute -bottom-1 -left-1 bg-white p-0.5 rounded-full">
                    <CheckCircle2 size={12} className="text-primary fill-primary" />
                  </div>
                )}
              </div>
              <div>
                <p className="font-black text-secondary text-sm leading-none mb-0.5">
                  {post.authorName || post.institutionName}
                </p>
                <p className="text-[10px] text-gray-400 font-bold">{post.governorate} · {post.timestamp}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button className="text-gray-300 hover:text-gray-500"><MoreHorizontal size={20} /></button>
              <button
                onClick={onClose}
                className="bg-surface text-gray-500 hover:text-secondary p-2 rounded-full transition-colors"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Scrollable content */}
          <div className="overflow-y-auto flex-1">
            {/* Post media */}
            {post.video ? (
              <video src={post.video} controls className="w-full max-h-72 object-cover" />
            ) : post.image ? (
              <img
                src={post.image}
                className="w-full max-h-72 object-cover"
                alt=""
                referrerPolicy="no-referrer"
              />
            ) : null}

            {/* Post content */}
            <div className="p-5">
              {post.title && <h3 className="font-black text-secondary text-base mb-2">{post.title}</h3>}
              <p className="text-gray-700 text-sm leading-relaxed">{post.content}</p>
              {post.tags && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {post.tags.map(t => (
                    <span key={t} className="text-[9px] font-bold px-2.5 py-1 bg-primary/10 text-primary rounded-full">#{t}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="mx-5 border-t border-gray-100" />

            {/* Comments */}
            <div className="p-5 space-y-4">
              <p className="text-xs font-black text-secondary uppercase tracking-widest">
                التعليقات ({comments.length})
              </p>
              {comments.length === 0 ? (
                <p className="text-center text-gray-400 text-sm py-4">لا توجد تعليقات بعد. كن أول من يعلّق!</p>
              ) : (
                comments.map(comment => (
                  <motion.div
                    key={comment.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-start gap-3"
                  >
                    <img
                      src={comment.authorAvatar}
                      className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                      alt=""
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1 bg-surface rounded-2xl px-4 py-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-xs font-black text-secondary">{comment.authorName}</p>
                        <p className="text-[10px] text-gray-400">{comment.timestamp}</p>
                      </div>
                      <p className="text-sm text-gray-700">{comment.content}</p>
                    </div>
                    <button
                      onClick={() => toggleCommentLike(comment.id)}
                      className={`flex-shrink-0 flex flex-col items-center gap-0.5 pt-1 transition-colors ${
                        likedComments.has(comment.id) ? 'text-red-500' : 'text-gray-400 hover:text-red-400'
                      }`}
                    >
                      <Heart size={14} fill={likedComments.has(comment.id) ? 'currentColor' : 'none'} />
                      <span className="text-[9px] font-bold">
                        {comment.likes + (likedComments.has(comment.id) ? 1 : 0)}
                      </span>
                    </button>
                  </motion.div>
                ))
              )}
            </div>
          </div>

          {/* Comment input */}
          {user ? (
            <div className="flex items-center gap-3 p-4 border-t border-gray-100 flex-shrink-0 bg-white">
              <img
                src={profile?.avatar_url || `https://picsum.photos/seed/${user.id}/100/100`}
                className="w-9 h-9 rounded-full object-cover flex-shrink-0"
                alt=""
                referrerPolicy="no-referrer"
              />
              <div className="flex-1 flex items-center bg-surface rounded-2xl px-4 py-2.5 gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleAddComment()}
                  placeholder="أضف تعليقاً…"
                  className="flex-1 bg-transparent outline-none text-sm font-bold text-secondary placeholder-gray-400"
                  dir="rtl"
                />
                <button
                  onClick={handleAddComment}
                  disabled={!newComment.trim() || isPosting}
                  className="text-primary disabled:text-gray-300 transition-colors active:scale-90"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 border-t border-gray-100 text-center">
              <p className="text-sm text-gray-400 font-bold">سجّل الدخول للتعليق</p>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

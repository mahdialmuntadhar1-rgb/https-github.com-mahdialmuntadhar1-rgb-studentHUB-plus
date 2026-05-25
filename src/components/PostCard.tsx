import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Post } from '../types';
import { Heart, MessageCircle, Share2, Bookmark, CheckCircle2, MoreHorizontal, Eye, Calendar, Clock, MapPin, ExternalLink, BarChart3, TrendingUp, ArrowRight, Link2 } from 'lucide-react';
import {
    BarChart as ReBarChart, Bar, XAxis, YAxis,
    CartesianGrid, Tooltip, ResponsiveContainer, Cell
} from 'recharts';
import { likePost, getToken } from '../lib/api';
import { useLanguage } from '../contexts/LanguageContext';

interface PostCardProps {
  post: Post;
  delay?: number;
  onComment?: (post: Post) => void;
  onImageClick?: (post: Post) => void;
}

export default function PostCard({ post, delay = 0, onComment, onImageClick }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(post.likes || 0);
  const [shareToast, setShareToast] = useState(false);
  const { language } = useLanguage();

  // Detect if post content is Arabic or English
  const isArabicContent = /[\u0600-\u06FF]/.test(post.content);
  const contentDir = isArabicContent ? 'rtl' : 'ltr';

  const handleLike = () => {
    const next = !isLiked;
    setIsLiked(next);
    setLikesCount(c => next ? c + 1 : c - 1);
    if (getToken()) {
      likePost(post.id).then(res => {
        setLikesCount(res.likes_count);
        setIsLiked(res.liked);
      }).catch(() => {
        setIsLiked(isLiked);
        setLikesCount(likesCount);
      });
    }
  };

  const handleShare = async () => {
    const text = post.title || post.content.substring(0, 100);
    try {
      if (navigator.share) {
        await navigator.share({ title: text, text, url: window.location.href });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setShareToast(true);
        setTimeout(() => setShareToast(false), 2500);
      }
    } catch { /* user dismissed */ }
  };

  const LikeButton = ({ size = 20 }: { size?: number }) => (
    <motion.button
      whileTap={{ scale: 1.25 }}
      onClick={handleLike}
      className={`flex items-center gap-2 transition-colors touch-manipulation ${isLiked ? 'text-red-500' : 'text-gray-400 hover:text-red-500'}`}
    >
      <Heart size={size} fill={isLiked ? 'currentColor' : 'none'} />
      <span className="text-xs font-inter font-bold">{likesCount}</span>
    </motion.button>
  );

  const CommentButton = ({ size = 20 }: { size?: number }) => (
    <button
      onClick={() => onComment?.(post)}
      className="flex items-center gap-2 text-gray-400 hover:text-secondary transition-colors touch-manipulation"
    >
      <MessageCircle size={size} />
      <span className="text-xs font-inter font-bold">{post.comments}</span>
    </button>
  );

  const ShareButton = ({ size = 20 }: { size?: number }) => (
    <div className="relative">
      <button onClick={handleShare} className="text-gray-400 hover:text-primary transition-colors touch-manipulation">
        <Share2 size={size} />
      </button>
      <AnimatePresence>
        {shareToast && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.9 }}
            className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-secondary text-white text-[10px] font-black px-3 py-1.5 rounded-xl whitespace-nowrap flex items-center gap-1.5 z-50"
          >
            <Link2 size={10} />
            تم نسخ الرابط
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );


  // 1. Institution Announcement / Urgent Card
  if (post.type === 'announcement' || post.type === 'urgent') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, ease: 'easeOut', delay }}
        className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden mb-6 shadow-sm hover:shadow-md transition-shadow"
      >
        <div className="p-5">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <img src={post.institutionLogo} className="w-12 h-12 rounded-2xl object-cover ring-2 ring-surface" alt="" referrerPolicy="no-referrer" />
                {post.isVerified && (
                  <div className="absolute -bottom-1 -left-1 bg-white p-0.5 rounded-full">
                    <CheckCircle2 className="w-4 h-4 text-primary fill-primary" />
                  </div>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-black text-secondary text-sm">{post.institutionName}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                  <span>{post.governorate}</span>
                  <span>•</span>
                  <span>منشور بواسطة مكتب الإعلام</span>
                </div>
              </div>
            </div>
            <span className={`text-[9px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest ${post.type === 'urgent' ? 'bg-red-500 text-white animate-pulse' : 'bg-primary/10 text-primary'}`}>
              {post.type === 'urgent' ? '🔴 عاجل' : '🔵 إعلان'}
            </span>
          </div>

          <div className="mb-4">
            {post.title && <h3 className="text-lg font-black text-secondary mb-2 leading-snug">{post.title}</h3>}
            <p className="text-gray-600 text-sm leading-relaxed line-clamp-3">{post.content}</p>
            <button className="text-primary text-[10px] font-black mt-2 uppercase tracking-widest hover:underline">Read More</button>
          </div>
        </div>

        {post.image && (
          <div
            className="relative aspect-square md:aspect-video mx-4 rounded-3xl overflow-hidden mb-4 cursor-pointer"
            onClick={() => onImageClick?.(post)}
          >
            <img src={post.image} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" alt="" referrerPolicy="no-referrer" />
          </div>
        )}

        <div className="px-5 pb-5">
          <div className="flex items-center justify-between pt-4 border-t border-gray-50">
            <div className="flex items-center gap-6">
              <LikeButton />
              <CommentButton />
              <ShareButton />
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-[10px] text-gray-300 font-bold">
                <Eye size={12} />
                <span className="font-inter uppercase">{post.views || '1.2k'} views</span>
              </div>
              <button className="text-gray-400 hover:text-secondary">
                <Bookmark size={20} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  // 2. Student Post Card
  if (post.type === 'student') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, ease: 'easeOut', delay }}
        className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden mb-6 shadow-sm"
      >
        <div className="p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <img src={post.authorAvatar} className="w-10 h-10 rounded-full object-cover ring-2 ring-primary/5" alt="" referrerPolicy="no-referrer" />
              <div className="absolute -bottom-1 -left-1 bg-white p-0.5 rounded-full">
                <div className="w-3 h-3 bg-accent rounded-full border border-white" />
              </div>
            </div>
            <div>
              <p className="font-black text-secondary text-sm leading-none mb-1">{post.authorName}</p>
              <p className="text-[10px] text-gray-400 font-bold">طالب في {post.institutionName} • {post.governorate}</p>
            </div>
          </div>
          <button className="text-gray-300"><MoreHorizontal size={20} /></button>
        </div>

        <div className="px-5 pb-4">
          <p className="text-gray-700 text-sm leading-relaxed mb-4" dir={contentDir}>{post.content}</p>
        </div>

        {(post.image || post.video) && (
          <div
            className="px-3 pb-3 cursor-pointer"
            onClick={() => onImageClick?.(post)}
          >
            {post.video ? (
              <video src={post.video} controls className="w-full aspect-square md:max-h-80 object-cover rounded-[2rem]" onClick={e => e.stopPropagation()} />
            ) : (
              <img src={post.image} className="w-full aspect-square md:h-80 object-cover rounded-[2rem] hover:brightness-95 transition-all" alt="" referrerPolicy="no-referrer" />
            )}
          </div>
        )}

        <div className="p-5 flex items-center justify-between border-t border-gray-50">
          <div className="flex items-center gap-6">
            <LikeButton />
            <CommentButton />
          </div>
          <ShareButton />
        </div>
      </motion.div>
    );
  }

  // 3. Opportunity / Job Card
  if (post.type === 'opportunity') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, ease: 'easeOut', delay }}
        className="bg-white rounded-[2rem] border border-gray-100 overflow-hidden mb-6 shadow-sm flex group"
      >
        <div className="w-2 bg-primary group-hover:w-4 transition-all" />
        <div className="flex-1 p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-3">
              <img src={post.institutionLogo} className="w-12 h-12 rounded-xl object-contain border border-gray-50 bg-white" alt="" referrerPolicy="no-referrer" />
              <div>
                <p className="text-xs font-bold text-gray-400 mb-1">{post.institutionName}</p>
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] font-black px-2 py-1 bg-primary/10 text-primary rounded-full uppercase tracking-widest">فرصة مهنية</span>
                </div>
              </div>
            </div>
            <button className="text-gray-300 hover:text-primary transition-colors"><Bookmark size={22} /></button>
          </div>

          <h3 className="text-xl font-black text-secondary mb-4 leading-tight leading-relaxed">{post.title || post.content.substring(0, 40) + '...'}</h3>
          
          <div className="flex items-center gap-6 mb-6">
            <div className="flex items-center gap-2 text-red-500 bg-red-50 px-4 py-2 rounded-2xl border border-red-100 animate-pulse">
              <Clock size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">تنتهي في: {post.deadline || '12 سبتمبر'}</span>
            </div>
            <div className="flex items-center gap-2 text-accent">
              <MapPin size={16} />
              <span className="text-[10px] font-black uppercase tracking-widest">{post.governorate}</span>
            </div>
          </div>

          <div className="bg-surface/50 p-4 rounded-2xl mb-6 border border-gray-100 flex items-center gap-3">
              <div className="flex -space-x-2 space-x-reverse">
                  {[1, 2, 3].map(i => (
                      <img key={i} src={`https://picsum.photos/seed/friend${i}/40/40`} className="w-6 h-6 rounded-full border-2 border-white ring-1 ring-gray-100" />
                  ))}
              </div>
              <p className="text-[9px] font-bold text-gray-400">
                  <span className="text-secondary font-black">أحمد</span> و <span className="text-secondary font-black">12 آخرين</span> من <span className="text-primary font-black">جامعتك</span> مهتمون بهذا
              </p>
          </div>

          <div className="flex flex-wrap gap-2 mb-8">
            {(post.tags || ['تطوير', 'تدريب', 'وظيفة']).map(tag => (
              <span key={tag} className="text-[9px] font-bold px-3 py-1.5 bg-gray-50 text-gray-500 rounded-lg border border-gray-100 uppercase font-inter tracking-wider">
                #{tag}
              </span>
            ))}
          </div>

          <button className="w-full bg-secondary text-white py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-3 hover:bg-primary hover:text-secondary transition-all active:scale-95 shadow-lg shadow-secondary/5">
            <span>View Details</span>
            <ExternalLink size={16} />
          </button>
        </div>
      </motion.div>
    );
  }

  // 4. Event Card
  if (post.type === 'event') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.3, ease: 'easeOut', delay }}
        className="bg-white rounded-[2.5rem] border border-gray-100 overflow-hidden mb-6 shadow-sm"
      >
        <div className="relative h-64 overflow-hidden group">
          <img src={post.image} className="w-full h-full object-cover transition-transform group-hover:scale-105 duration-700" alt="" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          
          {/* Date Badge */}
          <div className="absolute top-6 right-6 bg-white rounded-3xl p-3 shadow-2xl text-center min-w-[70px]">
            <p className="text-primary font-black text-xl leading-none font-inter uppercase">{post.eventDate?.day || '12'}</p>
            <p className="text-[10px] font-black text-secondary tracking-widest uppercase font-inter">{post.eventDate?.month || 'JUL'}</p>
          </div>
          
          <div className="absolute bottom-6 left-6 right-6 text-white text-right">
             <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest mb-2">
                <Calendar size={12} />
                <span>Upcoming Event</span>
             </div>
             <h3 className="text-2xl font-black mb-2 leading-tight">{post.title || post.content.substring(0, 30) + '...'}</h3>
             <div className="flex items-center gap-2 opacity-70">
                <img src={post.institutionLogo} className="w-5 h-5 rounded-md object-contain" alt="" />
                <span className="text-xs font-bold">{post.institutionName}</span>
             </div>
          </div>
        </div>

        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LikeButton />
            <button
              onClick={() => onComment?.(post)}
              className="bg-primary/10 text-primary font-black px-6 py-3 rounded-2xl text-xs hover:bg-primary hover:text-secondary transition-all"
            >
              سأحضر (مهتم)
            </button>
          </div>
          <div className="flex items-center gap-3">
             <div className="relative"><ShareButton /></div>
             <button className="p-3 bg-surface rounded-2xl text-gray-400 hover:text-secondary transition-colors">
                <Bookmark size={20} />
             </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // 5. Insight Card (Career Hub)
  if (post.type === 'insight') {
    return (
      <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.3, ease: 'easeOut', delay }}
          className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm relative overflow-hidden group mb-6"
      >
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
          
          <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-secondary rounded-2xl flex items-center justify-center text-primary shadow-lg ring-4 ring-primary/5">
                      <BarChart3 size={24} />
                  </div>
                  <div>
                      <h4 className="font-black text-secondary text-sm">تحليل سوق العمل</h4>
                      <p className="text-[10px] font-bold text-gray-400">{post.institutionName}</p>
                  </div>
              </div>
              <div className="flex items-center gap-1.5 px-4 py-2 bg-surface rounded-2xl border border-gray-50">
                  <TrendingUp size={14} className="text-primary" />
                  <span className="text-[10px] font-black text-secondary tracking-widest uppercase">MARKET INSIGHT</span>
              </div>
          </div>

          <h3 className="text-xl font-black text-secondary mb-3 leading-tight group-hover:text-primary transition-colors">{post.title}</h3>
          <p className="text-gray-500 text-sm mb-6 leading-relaxed line-clamp-3">{post.content}</p>

          {post.chartData && (
              <div className="h-48 mb-8 w-full bg-surface rounded-[2rem] p-6 border border-gray-100">
                  <ResponsiveContainer width="100%" height="100%">
                      <ReBarChart data={post.chartData}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis 
                              dataKey="name" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 900 }} 
                          />
                          <Tooltip 
                              cursor={{ fill: 'rgba(234, 179, 8, 0.05)' }}
                              contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)', fontWeight: 900, fontSize: '12px' }}
                          />
                          <Bar dataKey="value" radius={[8, 8, 8, 8]} barSize={32}>
                              {post.chartData.map((_entry, index) => (
                                  <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#EAB308' : '#1E293B'} />
                              ))}
                          </Bar>
                      </ReBarChart>
                  </ResponsiveContainer>
              </div>
          )}

          <div className="flex items-center justify-between pt-5 border-t border-gray-50">
              <div className="flex gap-6">
                  <LikeButton />
                  <CommentButton />
                  <ShareButton />
              </div>
              <button className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-widest group-hover:gap-3 transition-all hover:underline">
                  <span>Full Report</span>
                  <ArrowRight size={18} />
              </button>
          </div>
      </motion.div>
    );
  }

  return null;
}

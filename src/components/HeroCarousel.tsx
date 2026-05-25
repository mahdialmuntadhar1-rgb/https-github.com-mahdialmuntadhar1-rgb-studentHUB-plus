import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronLeft, ChevronRight, CheckCircle2 } from 'lucide-react';
import { Post } from '../types';

interface HeroCarouselProps {
  posts: Post[];
}

export default function HeroCarousel({ posts }: HeroCarouselProps) {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);

  const next = useCallback(() => setCurrent(c => (c + 1) % posts.length), [posts.length]);
  const prev = useCallback(() => setCurrent(c => (c - 1 + posts.length) % posts.length), [posts.length]);

  useEffect(() => {
    if (paused || posts.length < 2) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [paused, next, posts.length]);

  if (!posts.length) return null;

  const post = posts[current];

  return (
    <div
      className="relative overflow-hidden rounded-[2.5rem] mb-6 shadow-xl aspect-square md:aspect-[21/9] md:h-[220px]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={() => setPaused(true)}
      onTouchEnd={() => setPaused(false)}
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={post.id}
          initial={{ opacity: 0, scale: 1.04 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          transition={{ duration: 0.45, ease: 'easeInOut' }}
          className="absolute inset-0"
        >
          <img
            src={post.image || `https://picsum.photos/seed/${post.id}/800/400`}
            className="w-full h-full object-cover"
            alt=""
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent" />

          <div className="absolute bottom-0 left-0 right-0 p-5 text-white text-right">
            <div className="flex items-center gap-2 mb-1.5">
              <span className={`text-[9px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest ${
                post.type === 'urgent' ? 'bg-red-500 animate-pulse' :
                post.type === 'event' ? 'bg-primary text-secondary' : 'bg-white/20 backdrop-blur-sm'
              }`}>
                {post.type === 'urgent' ? '🔴 عاجل' : post.type === 'event' ? '📅 فعالية' : '🔵 إعلان'}
              </span>
              {post.isVerified && <CheckCircle2 size={14} className="text-primary" />}
              <span className="text-white/60 text-[10px] font-bold">{post.institutionName}</span>
            </div>
            <h3 className="text-lg font-black leading-tight line-clamp-2 mb-1">
              {post.title || post.content.substring(0, 65) + '…'}
            </h3>
            <p className="text-white/60 text-[10px] font-bold">{post.governorate} · {post.timestamp}</p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Nav arrows */}
      <button
        onClick={prev}
        className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/60 transition-all active:scale-95"
      >
        <ChevronLeft size={18} />
      </button>
      <button
        onClick={next}
        className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/30 backdrop-blur-sm text-white p-2 rounded-full hover:bg-black/60 transition-all active:scale-95"
      >
        <ChevronRight size={18} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {posts.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === current ? 'bg-primary w-5' : 'bg-white/40 w-1.5 hover:bg-white/70'
            }`}
          />
        ))}
      </div>
    </div>
  );
}

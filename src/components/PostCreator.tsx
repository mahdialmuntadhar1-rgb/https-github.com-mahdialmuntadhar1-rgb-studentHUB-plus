import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Image, Video, Smile, Send, Loader2, MapPin } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { createPost, uploadImage } from '../lib/api';
import { SAMPLE_INSTITUTIONS } from '../constants';

interface PostCreatorProps {
  open: boolean;
  onClose: () => void;
  onPosted?: () => void;
}

const EMOJIS = ['😊','🎓','📚','💪','🔥','❤️','👏','🌟','😂','🤔','🎉','💡'];

export default function PostCreator({ open, onClose, onPosted }: PostCreatorProps) {
  const { user, profile } = useAuth();
  const [content, setContent] = useState('');
  const [postType, setPostType] = useState('student');
  const [university, setUniversity] = useState(profile?.institution || '');
  const [city, setCity] = useState(profile?.governorate || '');
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isPosting, setIsPosting] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleMediaSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Validate file size (50MB max)
    if (file.size > 50 * 1024 * 1024) {
      alert('حجم الملف كبير جداً. الحد الأقصى 50 ميجابايت');
      return;
    }
    setMediaFile(file);
    setMediaPreview(URL.createObjectURL(file));
  };

  const insertEmoji = (emoji: string) => {
    const ta = textareaRef.current;
    if (!ta) { setContent(c => c + emoji); return; }
    const start = ta.selectionStart;
    const end = ta.selectionEnd;
    const updated = content.substring(0, start) + emoji + content.substring(end);
    setContent(updated);
    setTimeout(() => { ta.focus(); ta.setSelectionRange(start + emoji.length, start + emoji.length); }, 0);
    setShowEmoji(false);
  };

  const handlePost = async () => {
    if (!content.trim() || !profile) return;
    setIsPosting(true);
    let image_url: string | undefined;
    try {
      if (mediaFile) {
        setIsUploading(true);
        const { url } = await uploadImage(mediaFile);
        image_url = url;
        setIsUploading(false);
      }
      await createPost({
        type: postType,
        content: content.trim(),
        institution: university || profile.institution || '',
        institution_id: profile.institution_id || 'manual',
        governorate: city || profile.governorate || '',
        is_verified: profile.role === 'institution_rep',
        image_url,
      });
      setContent('');
      setMediaFile(null);
      setMediaPreview(null);
      onClose();
      onPosted?.();
    } catch (err: any) {
      alert(err.message || 'خطأ أثناء النشر');
    } finally {
      setIsPosting(false);
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (content.trim() && !window.confirm('هل تريد تجاهل المنشور؟')) return;
    setContent('');
    setMediaFile(null);
    setMediaPreview(null);
    onClose();
  };

  if (!user) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
          onClick={handleClose}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          <motion.div
            initial={{ y: 120, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 120, opacity: 0 }}
            transition={{ type: 'spring', damping: 28, stiffness: 300 }}
            className="relative bg-white w-full sm:max-w-lg rounded-t-[2rem] sm:rounded-[2.5rem] overflow-hidden max-h-[90vh] sm:max-h-[85vh]"
            onClick={e => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 pt-5 sm:pt-6 pb-3 sm:pb-4 border-b border-gray-100">
              <button onClick={handleClose} className="p-2 text-gray-400 hover:text-secondary transition-colors touch-manipulation">
                <X size={20} />
              </button>
              <h2 className="font-black text-secondary text-xs sm:text-sm uppercase tracking-widest">منشور جديد</h2>
              <button
                onClick={handlePost}
                disabled={!content.trim() || isPosting}
                className="bg-secondary text-white text-[11px] sm:text-xs font-black px-4 sm:px-5 py-2 rounded-2xl disabled:opacity-40 hover:bg-primary hover:text-secondary transition-all active:scale-95 flex items-center gap-2 touch-manipulation"
              >
                {isUploading ? <><Loader2 size={12} className="animate-spin" /> رفع...</>
                  : isPosting ? <><Loader2 size={12} className="animate-spin" /> نشر...</>
                  : <><Send size={12} /> نشر</>}
              </button>
            </div>

            <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-3 sm:space-y-4 max-h-[calc(90vh-140px)] sm:max-h-[calc(85vh-140px)] overflow-y-auto">
              {/* Author row */}
              <div className="flex items-center gap-3">
                <img
                  src={profile?.avatar_url || `https://picsum.photos/seed/${user.id}/100/100`}
                  className="w-11 h-11 rounded-full object-cover"
                  alt=""
                  referrerPolicy="no-referrer"
                />
                <div>
                  <p className="font-black text-secondary text-sm">{profile?.full_name || 'أنت'}</p>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold">
                    <MapPin size={10} />
                    <span>{city || profile?.governorate || 'المحافظة'}</span>
                    <span>•</span>
                    <span>{university || profile?.institution || 'الجامعة'}</span>
                  </div>
                </div>
              </div>

              {/* Caption textarea */}
              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={e => setContent(e.target.value)}
                  placeholder="ماذا يدور في ذهنك؟"
                  rows={3}
                  maxLength={500}
                  className="w-full bg-surface rounded-2xl p-3 sm:p-4 text-sm font-bold text-secondary placeholder-gray-400 outline-none resize-none border border-transparent focus:border-primary transition-colors"
                  dir="rtl"
                />
                <span className="absolute bottom-2.5 left-2.5 sm:bottom-3 sm:left-3 text-[9px] sm:text-[10px] font-black text-gray-300">
                  {500 - content.length}
                </span>
              </div>

              {/* Emoji picker */}
              <AnimatePresence>
                {showEmoji && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="flex flex-wrap gap-2 bg-surface rounded-2xl p-3 border border-gray-100"
                  >
                    {EMOJIS.map(e => (
                      <button
                        key={e}
                        onClick={() => insertEmoji(e)}
                        className="text-xl hover:scale-125 active:scale-95 transition-transform"
                      >
                        {e}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Media preview */}
              <AnimatePresence>
                {mediaPreview && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="relative rounded-3xl overflow-hidden aspect-square sm:aspect-auto sm:max-h-52"
                  >
                    {mediaFile?.type.startsWith('video/') ? (
                      <video src={mediaPreview} controls className="w-full h-full object-cover rounded-3xl" />
                    ) : (
                      <img src={mediaPreview} alt="preview" className="w-full h-full object-cover rounded-3xl" />
                    )}
                    <button
                      onClick={() => { setMediaFile(null); setMediaPreview(null); }}
                      className="absolute top-2 right-2 bg-black/60 text-white p-1.5 rounded-full hover:bg-black transition-colors touch-manipulation"
                    >
                      <X size={14} />
                    </button>
                    <div className="absolute bottom-2 left-2 bg-black/50 text-white text-[9px] sm:text-[10px] font-black px-2 py-1 rounded-full">
                      {mediaFile?.type.startsWith('video/') ? '🎬 فيديو' : '🖼 صورة'}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* University & City */}
              <div className="grid grid-cols-2 gap-2 sm:gap-3">
                <div>
                  <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">الجامعة</label>
                  <select
                    value={university}
                    onChange={e => setUniversity(e.target.value)}
                    className="w-full bg-surface rounded-2xl px-3 py-2 text-[11px] sm:text-xs font-bold text-secondary outline-none border border-transparent focus:border-primary transition-colors touch-manipulation"
                    dir="rtl"
                  >
                    <option value="">اختر</option>
                    {SAMPLE_INSTITUTIONS.map(inst => (
                      <option key={inst.id} value={inst.name}>{inst.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 block">المدينة</label>
                  <input
                    type="text"
                    value={city}
                    onChange={e => setCity(e.target.value)}
                    placeholder={profile?.governorate || 'بغداد'}
                    className="w-full bg-surface rounded-2xl px-3 py-2 text-[11px] sm:text-xs font-bold text-secondary outline-none border border-transparent focus:border-primary transition-colors"
                    dir="rtl"
                  />
                </div>
              </div>

              {/* Post type */}
              <div>
                <label className="text-[9px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1.5 block">نوع المنشور</label>
                <div className="flex gap-1.5 sm:gap-2 flex-wrap">
                  {[
                    { value: 'student', label: '🎓 طالب' },
                    { value: 'announcement', label: '📢 إعلان' },
                    { value: 'event', label: '📅 فعالية' },
                    { value: 'opportunity', label: '💼 فرصة' },
                  ].map(opt => (
                    <button
                      key={opt.value}
                      onClick={() => setPostType(opt.value)}
                      className={`text-[9px] sm:text-[10px] font-black px-2.5 sm:px-3 py-1.5 rounded-xl transition-all touch-manipulation ${
                        postType === opt.value
                          ? 'bg-secondary text-white'
                          : 'bg-surface text-gray-500 hover:bg-gray-100'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Action bar */}
              <div className="flex items-center gap-2 sm:gap-3 pt-1 border-t border-gray-100">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  className="hidden"
                  onChange={handleMediaSelect}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 bg-surface rounded-2xl text-gray-400 hover:text-primary transition-colors touch-manipulation"
                  title="صورة"
                >
                  <Image size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="p-2.5 bg-surface rounded-2xl text-gray-400 hover:text-primary transition-colors touch-manipulation"
                  title="فيديو"
                >
                  <Video size={18} />
                </button>
                <button
                  type="button"
                  onClick={() => setShowEmoji(s => !s)}
                  className={`p-2.5 rounded-2xl transition-colors touch-manipulation ${showEmoji ? 'bg-primary text-secondary' : 'bg-surface text-gray-400 hover:text-primary'}`}
                  title="إيموجي"
                >
                  <Smile size={18} />
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

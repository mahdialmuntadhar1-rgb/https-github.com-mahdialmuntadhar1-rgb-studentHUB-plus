import React, { useState } from 'react';
import { Language, FeedItem, Comment } from '../types';
import { getTranslation } from '../data/translations';
import { motion, AnimatePresence } from 'motion/react';
import { IraqiUniversities, IraqiGovernorates } from '../data/mockData';
import { 
  Heart, 
  MessageSquare, 
  Share2, 
  Bookmark, 
  Calendar, 
  Briefcase, 
  GraduationCap, 
  Users, 
  Award, 
  MapPin, 
  ChevronRight, 
  FileText,
  UserCheck,
  Send,
  HelpCircle,
  Hash
} from 'lucide-react';

interface FeedCardProps {
  key?: string | number;
  item: FeedItem;
  language: Language;
  onLike: (id: string) => void;
  onSave: (id: string) => void;
  onVote: (itemId: string, optionId: string) => void;
  onApply: (id: string) => void;
  onRsvp: (id: string) => void;
  onJoinGroup: (id: string) => void;
  onAddComment: (id: string, commentText: string) => void;
  allPostsHighlightDisabled?: boolean;
  onEditFeedItem?: (id: string, updatedFields: Partial<FeedItem>) => void;
  onDeleteFeedItem?: (id: string) => void;
  isAdminMode?: boolean;
}

export default function FeedCard({
  item,
  language,
  onLike,
  onSave,
  onVote,
  onApply,
  onRsvp,
  onJoinGroup,
  onAddComment,
  onEditFeedItem,
  onDeleteFeedItem,
  isAdminMode = false
}: FeedCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [copied, setCopied] = useState(false);

  // Administrative local edit states
  const [isEditingFeed, setIsEditingFeed] = useState(false);
  const [editTitleEN, setEditTitleEN] = useState(item.titleEN);
  const [editTitleAR, setEditTitleAR] = useState(item.titleAR || '');
  const [editTitleKU, setEditTitleKU] = useState(item.titleKU || '');
  const [editContentEN, setEditContentEN] = useState(item.contentEN);
  const [editContentAR, setEditContentAR] = useState(item.contentAR || '');
  const [editContentKU, setEditContentKU] = useState(item.contentKU || '');
  const [editImage, setEditImage] = useState(item.imageUrl || '');

  // Select proper localized strings
  const title = language === 'ar' ? item.titleAR : language === 'ku' ? item.titleKU : item.titleEN;
  const content = language === 'ar' ? item.contentAR : language === 'ku' ? item.contentKU : item.contentEN;

  // Resolve Governorate & University labels
  const matchedUni = IraqiUniversities.find(u => u.id === item.universityId);
  const matchedGov = IraqiGovernorates.find(g => g.id === item.governorateId);

  const resolvedUniLabel = matchedUni 
    ? (language === 'ar' ? matchedUni.nameAR : language === 'ku' ? matchedUni.nameKU : matchedUni.nameEN)
    : item.author.university || '';

  const resolvedGovLabel = matchedGov 
    ? (language === 'ar' ? matchedGov.nameAR : language === 'ku' ? matchedGov.nameKU : matchedGov.nameEN)
    : '';

  // Helper to render high-contrast, youthful Instagram-like galleries and mosaics
  const renderImageGallery = () => {
    if (!item.imageUrl) return null;

    // Create a list of complementary pictures for mosaic based on item ID
    let additionalImages: string[] = [];
    if (item.id === 'story-1') {
      additionalImages = [
        'https://images.unsplash.com/photo-1525921429571-473b9982e219?auto=format&fit=crop&q=80&w=400', // college friends
        'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80&w=400'  // campus grounds
      ];
    } else if (item.id === 'event-1') {
      additionalImages = [
        'https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&q=80&w=400' // hackathon coding
      ];
    } else if (item.id === 'opp-1') {
      additionalImages = [
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80&w=400' // laptop design
      ];
    }

    // Case 1: Single large premium photo
    if (additionalImages.length === 0) {
      return (
        <div className="group relative rounded-2xl overflow-hidden mb-3 border border-slate-200/80 dark:border-[#1F2E4D] bg-slate-50 dark:bg-[#16223F] transition-all duration-300 shadow-md hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] cursor-pointer">
          <img src={item.imageUrl} alt={title} className="w-full h-auto max-h-[380px] object-cover" referrerPolicy="no-referrer" />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent p-3 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-between text-white text-[10px] font-black">
            <span>✨ Campus Highlight</span>
            <span>View Fullscreen 🔎</span>
          </div>
        </div>
      );
    }

    // Case 2: Two-image modern split layout
    if (additionalImages.length === 1) {
      return (
        <div className="grid grid-cols-5 gap-2 rounded-2xl overflow-hidden mb-3 border border-slate-200/80 dark:border-[#1F2E4D] bg-slate-50 dark:bg-[#16223F] h-48 select-none">
          <div className="col-span-3 h-full relative group cursor-pointer overflow-hidden">
            <img src={item.imageUrl} alt={title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors" />
          </div>
          <div className="col-span-2 h-full relative group cursor-pointer overflow-hidden">
            <img src={additionalImages[0]} alt={title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-black/10 hover:bg-transparent transition-colors" />
          </div>
        </div>
      );
    }

    // Case 3: Three-image interactive masonry/mosaic layout
    return (
      <div className="grid grid-cols-3 gap-2 rounded-2xl overflow-hidden mb-3 border border-slate-200/80 dark:border-[#1F2E4D] bg-slate-50 dark:bg-[#16223F] h-52 select-none">
        <div className="col-span-2 h-full relative group cursor-pointer overflow-hidden">
          <img src={item.imageUrl} alt={title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-550" referrerPolicy="no-referrer" />
          <div className="absolute inset-0 bg-black/5 hover:bg-transparent transition-colors" />
        </div>
        <div className="col-span-1 flex flex-col gap-2 h-full">
          <div className="h-1/2 overflow-hidden relative group cursor-pointer rounded-tr-lg">
            <img src={additionalImages[0]} alt={title} className="w-full h-full object-cover hover:scale-108 transition-transform duration-500" referrerPolicy="no-referrer" />
          </div>
          <div className="h-1/2 overflow-hidden relative group cursor-pointer rounded-br-lg">
            <img src={additionalImages[1]} alt={title} className="w-full h-full object-cover hover:scale-108 transition-transform duration-500" referrerPolicy="no-referrer" />
          </div>
        </div>
      </div>
    );
  };

  // Custom visual definitions based on content category
  const getTypeBadge = () => {
    const defaultCategory = item.opportunityCategory || '';
    
    switch (item.type) {
      case 'announcement':
        return { text: language === 'ar' ? 'إعلان رسمي' : language === 'ku' ? 'ڕاگەیاندن' : 'Official', color: 'bg-red-500/10 text-red-400 border-red-500/20' };
      case 'job':
      case 'full_time_job':
        return { text: language === 'ar' ? 'دوام كامل' : language === 'ku' ? 'دەوامی تەواو' : 'Full-Time Job', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
      case 'part_time_job':
        return { text: language === 'ar' ? 'دوام جزئي' : language === 'ku' ? 'دەوامی کاتی' : 'Part-Time Job', color: 'bg-teal-500/10 text-teal-400 border-teal-500/20' };
      case 'internship':
        return { text: language === 'ar' ? 'تدريب عملي' : language === 'ku' ? 'مەشق' : 'Internship', color: 'bg-violet-500/10 text-violet-400 border-violet-500/20' };
      case 'scholarship':
        return { text: language === 'ar' ? 'منحة دراسية' : language === 'ku' ? 'بورس' : 'Scholarship', color: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' };
      case 'training':
        return { text: language === 'ar' ? 'دورة تدريبية' : language === 'ku' ? 'ڕاهێنان' : 'Training Course', color: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };
      case 'volunteering':
        return { text: language === 'ar' ? 'عمل تطوعي' : language === 'ku' ? 'خۆبەخشی' : 'Volunteering', color: 'bg-lime-500/10 text-lime-400 border-lime-500/20' };
      case 'competition':
        return { text: language === 'ar' ? 'مسابقة' : language === 'ku' ? 'کێبڕکێ' : 'Competition', color: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
      case 'graduation_project_support':
        return { text: language === 'ar' ? 'دعم مشاريع' : language === 'ku' ? 'پاڵپشتی پڕۆژە' : 'Project Grant', color: 'bg-pink-500/10 text-pink-400 border-pink-500/20' };
      case 'event':
        return { text: language === 'ar' ? 'فعالية تواصل' : language === 'ku' ? 'چالاکی' : 'Campus Event', color: 'bg-rose-500/10 text-rose-400 border-rose-500/20' };
      case 'study_group':
        return { text: language === 'ar' ? 'غروب مراجعة' : language === 'ku' ? 'گروپی خوێندن' : 'Study Group', color: 'bg-sky-500/10 text-sky-400 border-sky-500/20' };
      case 'poll':
        return { text: language === 'ar' ? 'استطلاع رأي' : language === 'ku' ? 'ڕاپرسی' : 'Campus Poll', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
      case 'anonymous_question':
        return { text: language === 'ar' ? 'سؤال مجهول' : language === 'ku' ? 'بپرسە بێناو' : 'Anon Question', color: 'bg-slate-800 text-slate-300 border-slate-700' };
      case 'video':
        return { text: language === 'ar' ? 'فيديو ترفيهي' : language === 'ku' ? 'ڤیدیۆ' : 'Campus Video', color: 'bg-orange-500/10 text-orange-400 border-orange-500/20' };
      case 'photo':
        return { text: language === 'ar' ? 'صورة الحرم' : language === 'ku' ? 'وێنە' : 'Campus Photo', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
      default:
        // Check fallback by opportunity category
        if (defaultCategory) {
          return { text: defaultCategory, color: 'bg-indigo-500/10 text-indigo-450 border-indigo-550/20' };
        }
        return { text: language === 'ar' ? 'منشور طلابي' : language === 'ku' ? 'بڵاوکراوە' : 'Student Post', color: 'bg-slate-800 text-slate-350 border-slate-700' };
    }
  };

  const badge = getTypeBadge();

  // Helper for role translation
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'student': return getTranslation('roleStudent', language);
      case 'graduate': return getTranslation('roleGraduate', language);
      case 'teacher': return getTranslation('roleTeacher', language);
      case 'staff': return getTranslation('roleStaff', language);
      case 'institution': return getTranslation('roleInstitution', language);
      default: return getTranslation('roleStudent', language);
    }
  };

  // Helper to trigger comment submits
  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    onAddComment(item.id, commentText);
    setCommentText('');
  };

  // Copy link helper
  const handleShareClick = () => {
    setCopied(true);
    navigator.clipboard.writeText(`${window.location.origin}/item/${item.id}`);
    setTimeout(() => setCopied(false), 2000);
  };

  // Calculate percentages for poll
  const totalVotes = item.pollOptions?.reduce((acc, curr) => acc + curr.votes, 0) || 1;

  return (
    <motion.div
      id={`feed-card-${item.id}`}
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.3 }}
      className={`bg-white rounded-3xl transition-all duration-300 p-5 mb-5 relative flex flex-col ${
        item.author.verified 
          ? 'border-3 border-[#6B25C9] shadow-md shadow-[#6B25C9]/5' 
          : 'border-2 border-[#E6E1F5] hover:border-[#6B25C9] shadow-sm'
      }`}
    >
      {isEditingFeed ? (
        <form onSubmit={(e) => {
          e.preventDefault();
          if (onEditFeedItem) {
            onEditFeedItem(item.id, {
              titleEN: editTitleEN,
              titleAR: editTitleAR,
              titleKU: editTitleKU,
              contentEN: editContentEN,
              contentAR: editContentAR,
              contentKU: editContentKU,
              imageUrl: editImage || undefined
            });
          }
          setIsEditingFeed(false);
        }} className="flex flex-col gap-3 font-bold text-xs text-slate-700 text-left p-1" id={`card-edit-form-${item.id}`}>
          <h3 className="text-xs font-black uppercase text-[#6B25C9] mb-1">
            {language === 'ar' ? 'تعديل المنشور كمسؤول' : 'Administrative Post Editor'}
          </h3>

          <div className="flex flex-col gap-1">
            <span className="text-[8px] uppercase tracking-wider text-slate-400">Title EN</span>
            <input 
              type="text" 
              required
              value={editTitleEN} 
              onChange={e => setEditTitleEN(e.target.value)}
              className="p-2 border border-[#161A33] rounded-lg text-xs" 
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[8px] uppercase tracking-wider text-slate-400">Title AR</span>
            <input 
              type="text" 
              value={editTitleAR} 
              onChange={e => setEditTitleAR(e.target.value)}
              className="p-2 border border-[#161A33] rounded-lg text-xs text-right" 
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[8px] uppercase tracking-wider text-slate-400">Title KU</span>
            <input 
              type="text" 
              value={editTitleKU} 
              onChange={e => setEditTitleKU(e.target.value)}
              className="p-2 border border-[#161A33] rounded-lg text-xs text-right" 
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[8px] uppercase tracking-wider text-slate-400">Content EN</span>
            <textarea 
              rows={3}
              required
              value={editContentEN} 
              onChange={e => setEditContentEN(e.target.value)}
              className="p-2 border border-[#161A33] rounded-lg text-xs" 
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[8px] uppercase tracking-wider text-slate-400">Content AR</span>
            <textarea 
              rows={3}
              value={editContentAR} 
              onChange={e => setEditContentAR(e.target.value)}
              className="p-2 border border-[#161A33] rounded-lg text-xs text-right" 
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[8px] uppercase tracking-wider text-slate-400">Content KU</span>
            <textarea 
              rows={3}
              value={editContentKU} 
              onChange={e => setEditContentKU(e.target.value)}
              className="p-2 border border-[#161A33] rounded-lg text-xs text-right" 
            />
          </div>

          <div className="flex flex-col gap-1">
            <span className="text-[8px] uppercase tracking-wider text-slate-400">Image Asset URL</span>
            <input 
              type="text" 
              value={editImage} 
              onChange={e => setEditImage(e.target.value)}
              className="p-2 border border-[#161A33] rounded-lg text-xs" 
            />
          </div>

          <div className="flex gap-2 justify-end mt-2">
            <button
              type="button"
              onClick={() => setIsEditingFeed(false)}
              className="px-3.5 py-2 bg-slate-100 border hover:bg-slate-200 rounded-xl text-[10px] font-black cursor-pointer uppercase select-none"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4.5 py-2 bg-[#6B25C9] text-white rounded-xl text-[10px] font-black cursor-pointer uppercase shadow-md select-none"
            >
              Save Post Edits ✓
            </button>
          </div>
        </form>
      ) : (
        <>
          {/* Top Meta info */}
          <div className="flex items-center justify-between mb-4.5" id={`card-header-${item.id}`}>
            <div className="flex items-center gap-3">
              {/* Avatar with role status ring */}
              <div className="relative shrink-0">
                <img 
                  src={item.author.avatar} 
                  alt={item.author.name}
                  className={`w-11 h-11 rounded-xl object-cover border-2 shadow-md ${
                    item.author.role === 'institution' ? 'border-[#D9272E]' : item.author.role === 'teacher' ? 'border-[#6B25C9]' : 'border-[#2F7CCB]'
                  }`}
                  referrerPolicy="no-referrer"
                />
                {item.author.verified && (
                  <span className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-[#6B25C9] to-[#2F7CCB] text-white rounded-full p-0.5 border-2 border-white flex items-center justify-center">
                    <svg className="w-2.5 h-2.5 fill-current text-white" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="text-xs font-black text-[#161A33] leading-tight">
                    {item.type === 'anonymous_question' ? getTranslation('anonymousLabel', language) : item.author.name}
                  </h3>
                  {item.author.verified && (
                    <span className="text-[8px] font-black uppercase bg-[#FFD21F] text-[#161A33] px-1.5 py-0.5 rounded-md border border-[#161A33]/15 tracking-tight flex items-center gap-0.5 shadow-sm">
                      ✨ {getTranslation('verifiedPartner', language)}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500 mt-1.5" id={`card-author-meta-${item.id}`}>
                  <span className="font-black text-[#6B25C9] bg-[#6B25C9]/10 px-2 py-0.5 rounded-md shrink-0">
                    {getRoleLabel(item.author.role)}
                  </span>
                  {resolvedUniLabel && (
                    <span className="font-black text-[#161A33] flex items-center gap-1 shrink-0 bg-[#F3F7FF] border border-[#E6E1F5] px-2 py-0.5 rounded-md max-w-[150px] truncate">
                      🏫 {resolvedUniLabel}
                    </span>
                  )}
                  {resolvedGovLabel && (
                    <span className="text-slate-600 font-bold flex items-center gap-0.5 shrink-0">
                      📍 {resolvedGovLabel}
                    </span>
                  )}
                  <span className="text-slate-300">•</span>
                  <span className="font-bold text-slate-500 text-[9px]">{item.date}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {isAdminMode && (
                <div className="flex items-center gap-1.5 border border-[#161A33]/10 bg-[#FAF9FF] p-1 rounded-xl shadow-xs" id={`card-admin-row-${item.id}`}>
                  <span className="text-[8.5px] font-black bg-[#6B25C9] text-white px-2 py-0.5 rounded-md leading-none select-none">
                    ADMIN
                  </span>
                  <button
                    onClick={() => setIsEditingFeed(true)}
                    className="p-1 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg text-[9px] font-black border border-indigo-200 cursor-pointer shadow-sm uppercase shrink-0"
                    title="Edit Post"
                  >
                    ✏️
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا المنشور؟' : 'Are you sure you want to delete this post?')) {
                        if (onDeleteFeedItem) onDeleteFeedItem(item.id);
                      }
                    }}
                    className="p-1 px-2.5 bg-red-50 hover:bg-red-100 text-red-650 rounded-lg text-[9px] font-black border border-red-200 cursor-pointer shadow-sm uppercase shrink-0"
                    title="Delete Post"
                  >
                    🗑️
                  </button>
                </div>
              )}

              {/* Content Type Badge */}
              <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-xl border leading-none bg-[#F7F4FF] ${badge.color}`}>
                {badge.text}
              </span>
            </div>
          </div>

      {/* Main Body */}
      <div className="flex-1" id={`card-body-${item.id}`}>
        {/* Localized Title */}
        {title && (
          <h2 className="text-sm font-black text-[#161A33] tracking-tight leading-snug mb-1.5 flex flex-wrap items-center gap-1.5">
            <span>{title}</span>
            {['job', 'internship', 'scholarship', 'training', 'part_time_job', 'full_time_job', 'volunteering', 'competition', 'graduation_project_support', 'fellowship', 'event', 'announcement', 'exam'].includes(item.type) && (
              <>
                {(item.date?.includes('Recently') || item.isNew) && (
                  <span className="text-[8px] font-black uppercase text-emerald-600 bg-emerald-100 border border-emerald-300 px-1.5 py-0.5 rounded shadow-sm leading-none shrink-0 animate-pulse">
                    {language === 'ar' ? 'جديد ✨' : language === 'ku' ? 'نوێ ✨' : 'New ✨'}
                  </span>
                )}
                {item.deadline && (
                  (() => {
                    try {
                      const diffTime = new Date(item.deadline).getTime() - new Date().getTime();
                      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                      if (diffDays >= 0 && diffDays <= 5) {
                        return (
                          <span className="text-[8px] font-black uppercase text-amber-700 bg-amber-100 border border-amber-300 px-1.5 py-0.5 rounded shadow-sm leading-none shrink-0">
                            {language === 'ar' ? 'قريب الإغلاق ⏳' : language === 'ku' ? 'نزیک کۆتایی ⏳' : 'Closing Soon ⏳'}
                          </span>
                        );
                      }
                    } catch (_) {}
                    return null;
                  })()
                )}
              </>
            )}
          </h2>
        )}

        {/* Localized Content Text */}
        <p className="text-xs font-semibold text-slate-700 leading-relaxed break-words whitespace-pre-line mb-3">
          {content}
        </p>

        {/* Media Attachments */}
        {renderImageGallery()}

        {/* Video simulation */}
        {item.type === 'video' && item.videoThumbnail && (
          <div className="rounded-xl overflow-hidden mb-3 border border-[#1F2E4D] h-48 bg-gray-950 relative flex items-center justify-center">
            <img src={item.videoThumbnail} alt={title} className="w-full h-full object-cover opacity-70" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white text-indigo-600 flex items-center justify-center shrink-0 shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all">
                <svg className="w-5 h-5 fill-current ml-1" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            {/* Fake Tik Tok / Reels like telemetry overlays */}
            <div className="absolute bottom-2 left-2 text-[10px] bg-[#0B1020]/80 text-white rounded px-1.5 py-0.5 backdrop-blur-sm flex items-center gap-1 border border-[#1F2E4D]">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span>Campus Reels</span>
            </div>
          </div>
        )}

        {/* SPECIFIC INTERACTIVE STATIONS */}
        
        {/* A. Poll View */}
        {item.type === 'poll' && item.pollOptions && (
          <div className="bg-amber-500/5 p-3 rounded-xl border border-amber-500/20 mb-3 flex flex-col gap-2">
            {item.pollOptions.map((opt) => {
              const optText = language === 'ar' ? opt.textAR : language === 'ku' ? opt.textKU : opt.textEN;
              const hasVoted = !!item.pollVotedId;
              const percentage = Math.round((opt.votes / totalVotes) * 100);
              const isUserSelection = item.pollVotedId === opt.id;

              return (
                <button
                  key={opt.id}
                  disabled={hasVoted}
                  onClick={() => onVote(item.id, opt.id)}
                  className={`w-full relative py-2.5 px-3 rounded-lg border text-left text-xs font-extrabold transition-all overflow-hidden flex justify-between items-center ${
                    isUserSelection
                      ? 'border-amber-400 text-amber-300 bg-amber-500/10 shadow-glow-orange'
                      : hasVoted
                      ? 'border-[#1F2E4D] text-slate-500 bg-[#16223F]'
                      : 'border-[#1F2E4D] bg-[#16223F] hover:border-slate-500 text-slate-100 active:bg-[#1E2E4B]'
                  }`}
                >
                  {/* Dynamic absolute background representing percentage bar */}
                  {hasVoted && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.6 }}
                      className={`absolute top-0 left-0 bottom-0 ${
                        isUserSelection ? 'bg-amber-500/15' : 'bg-slate-700/20'
                      } -z-10`}
                    />
                  )}
                  <span className="relative z-10 break-words max-w-[80%]">{optText}</span>
                  {hasVoted && (
                    <span className="relative z-10 font-mono text-[11px] font-black text-white shrink-0">
                      {percentage}% ({opt.votes})
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* B. Job / Internship / Scholarship Board */}
        {(item.type === 'job' || item.type === 'internship' || item.type === 'scholarship' || item.type === 'training' || 
          item.type === 'part_time_job' || item.type === 'full_time_job' || item.type === 'volunteering' || 
          item.type === 'competition' || item.type === 'graduation_project_support' || !!item.opportunityCategory) && (
          <div className="bg-gradient-to-br from-[#F7F4FF] via-white to-[#F3F7FF] p-4.5 rounded-2xl border-2 border-[#161A33] flex flex-col gap-3.5 mb-4 shadow-[3px_3px_0px_0px_#161A33] relative overflow-hidden transition-all duration-300">
            {/* Soft decorative background spot */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-[#FFD21F]/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-[#6B25C9]/10 rounded-full blur-2xl pointer-events-none" />

            {/* Header: Company Profile Info */}
            <div className="flex items-start justify-between gap-2.5 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-white border-2 border-[#161A33]/80 text-[#6B25C9] shadow-sm font-black flex items-center justify-center text-lg select-none shrink-0 transform hover:scale-105 transition-transform">
                  {item.companyLogo || '💼'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-[12px] font-black text-[#161A33] leading-tight">
                      {item.company || 'Iraq Opportunity Provider'}
                    </h4>
                    {(item.companyVerified || item.author.verified) && (
                      <span className="text-[9px] font-extrabold bg-[#FFD21F]/20 text-[#161A33] px-1.5 py-0.2 rounded border border-[#161A33]/10 flex items-center gap-0.5 leading-none shrink-0">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-500 font-bold mt-1.5">
                    <span className="flex items-center gap-0.5 text-[#2F7CCB]">
                      <MapPin className="w-3 text-[#2F7CCB]" />
                      {item.location || 'All Iraq'}
                    </span>
                    <span>•</span>
                    <span className="bg-[#6B25C9]/10 text-[#6B25C9] border border-[#6B25C9]/15 px-1.5 py-0.2 rounded text-[9px] font-black">
                      {item.workplaceType || 'On-site'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deadline Tag with youthful animation */}
              {item.deadline && (
                <div className="text-right shrink-0">
                  <span className="text-[8px] font-black uppercase tracking-wider text-[#D9272E] block">Deadline</span>
                  <span className="text-[10px] font-extrabold text-[#D9272E] bg-[#D9272E]/10 border border-[#D9272E]/20 px-2 py-0.5 rounded-lg flex items-center gap-0.5 mt-1 animate-pulse">
                    ⏰ {item.deadline}
                  </span>
                </div>
              )}
            </div>

            {/* Who Can Apply Eligibility Alert Section */}
            {item.whoCanApply && (
              <div className="bg-amber-50 p-2.5 rounded-lg border-2 border-[#161A33] text-[10px] text-slate-700 leading-relaxed relative z-10 font-bold flex items-start gap-1.5 shadow-[2px_2px_0px_0px_#161A33]">
                <span className="text-sm shrink-0 leading-none">🎯</span>
                <div>
                  <span className="text-amber-700 font-black text-[9px] uppercase tracking-wider block mb-0.5">Who can apply</span>
                  <span className="text-slate-800 font-extrabold">{item.whoCanApply}</span>
                </div>
              </div>
            )}

            {/* Campus Social Proof Block (Students who applied) */}
            <div className="flex items-center gap-2 mt-0.5 bg-emerald-50 p-2 rounded-lg border-2 border-[#161A33] relative z-10 shadow-[2px_2px_0px_0px_#161A33]">
              <div className="flex -space-x-1.5">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#6B25C9] to-[#2F7CCB] border border-white text-[8px] flex items-center justify-center font-bold shadow-sm">🙋‍♂️</div>
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#FFD21F] to-[#D9272E] border border-white text-[8px] flex items-center justify-center font-bold shadow-sm">🙋‍♀️</div>
                <div className="w-5 h-5 rounded-full bg-white border border-[#161A33] text-[8px] flex items-center justify-center font-bold shadow-sm">✨</div>
              </div>
              <p className="text-[10px] text-emerald-800 font-extrabold leading-tight">
                {item.universityAppliedCount || 6} students from your university applied
              </p>
            </div>

            {/* Saves and Badges Stats tracker */}
            <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold justify-between pt-1">
              <span className="flex items-center gap-1 bg-[#F3F7FF] text-[#161A33] border border-[#E6E1F5] px-2 py-0.5 rounded-md text-[9px] font-black uppercase">
                🏷️ {item.opportunityCategory || 'Career'}
              </span>
              <span className="text-[#6B25C9] flex items-center gap-0.5 bg-[#6B25C9]/10 px-2 py-0.5 rounded-lg text-[9px] font-black">
                ⭐ {item.savedByUser ? (item.savedCount || 12) + 1 : (item.savedCount || 12)} saved by peers
              </span>
            </div>

            {/* Quick Interactive Button Deck */}
            <div className="flex gap-1.5 mt-1 pt-2 border-t border-[#E6E1F5] relative z-10 font-sans">
              <button
                id={`apply-btn-${item.id}`}
                onClick={() => onApply(item.id)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black tracking-tight cursor-pointer transition-all flex items-center justify-center gap-1.5 transform active:scale-95 border-2 border-[#161A33] ${
                  item.applied
                    ? 'bg-emerald-100 text-emerald-900 shadow-[2px_2px_0px_0px_#161A33]'
                    : 'bg-[#FFD21F] text-[#161A33] hover:bg-[#FFE052] shadow-[3px_3px_0px_0px_#161A33]'
                }`}
              >
                {item.applied ? (
                  <>
                    <UserCheck className="w-4 h-4 text-emerald-950" />
                    <span>Applied Successfully!</span>
                  </>
                ) : (
                  <>
                    <Briefcase className="w-4 h-4 text-[#161A33]" />
                    <span>{getTranslation('applyNow', language)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* C. Interactive Event Station */}
        {item.type === 'event' && (
          <div className="bg-rose-50 p-3.5 rounded-2xl border-2 border-[#161A33] mb-3 flex flex-col gap-2.5 shadow-[2px_2px_0px_0px_#161A33]">
            <div className="flex flex-col gap-1.5 text-[11px] font-bold text-slate-700">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#D9272E] shrink-0" />
                <span>{item.eventDate} • {item.eventTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-[#2F7CCB] shrink-0" />
                <span className="text-slate-800 break-words">{item.eventVenue}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-[#E6E1F5] pt-2">
              <span className="text-[10px] text-[#D9272E] font-black bg-[#D9272E]/10 px-1.5 py-0.5 rounded border border-[#D9272E]/20">
                🎯 {item.eventRsvpCount || 0} students listed
              </span>

              <button
                id={`rsvp-btn-${item.id}`}
                onClick={() => onRsvp(item.id)}
                className={`py-1.5 px-3 rounded-xl text-[11px] font-black cursor-pointer transition-all border-2 border-[#161A33] ${
                  item.eventRsvped
                    ? 'bg-[#D9272E] text-white shadow-[2px_2px_0px_0px_#161A33]'
                    : 'bg-white text-slate-800 hover:bg-rose-100 shadow-[2px_2px_0px_0px_#161A33]'
                }`}
              >
                {item.eventRsvped ? getTranslation('rsvped', language) : getTranslation('rsvpBtn', language)}
              </button>
            </div>
          </div>
        )}

        {/* D. Study Group Station */}
        {item.type === 'study_group' && (
          <div className="bg-indigo-50 p-3.5 rounded-2xl border-2 border-[#161A33] mb-3 flex flex-col gap-2 shadow-[2px_2px_0px_0px_#161A33]">
            <div className="flex items-center justify-between text-[11px] font-bold text-slate-700">
              <span className="text-[#6B25C9] uppercase text-[9px] tracking-wider font-extrabold">Subject</span>
              <span className="text-[#161A33] bg-white border border-[#E6E1F5] px-2.5 py-0.5 rounded-md font-black">
                {item.subject}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-[#E6E1F5] pt-2 mt-1">
              <span className="text-[10px] text-slate-700 font-bold flex items-center gap-1">
                <Users className="w-4 h-4 text-[#6B25C9]" />
                {item.memberCount || 1} studying inside
              </span>

              <button
                id={`join-group-btn-${item.id}`}
                onClick={() => onJoinGroup(item.id)}
                className={`py-1.5 px-3 rounded-xl text-[11px] font-black cursor-pointer transition-all border-2 border-[#161A33] ${
                  item.joined
                    ? 'bg-emerald-100 text-emerald-900 shadow-[2px_2px_0px_0px_#161A33]'
                    : 'bg-[#FFD21F] text-[#161A33] hover:bg-[#FFE052] shadow-[2px_2px_0px_0px_#161A33]'
                }`}
              >
                {item.joined ? getTranslation('joined', language) : getTranslation('joinGroup', language)}
              </button>
            </div>
          </div>
        )}

        {/* E. Local Service Card */}
        {item.type === 'local_service' && (
          <div className="bg-[#F3F7FF] p-3 rounded-2xl border-2 border-[#E6E1F5] mb-3 flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[10px] font-bold text-[#161A33]">
              <span className="bg-[#FFD21F] text-[#161A33] px-2 py-0.5 rounded-full uppercase text-[8px] font-black shadow-sm">
                Nearest Campus Asset
              </span>
              <span className="text-yellow-500 font-extrabold">
                ★ {item.serviceRating || '5.0'}
              </span>
            </div>
            <div className="text-[10px] font-semibold text-slate-600 flex items-center gap-1">
              <MapPin className="w-3.5 text-[#6B25C9]" />
              <span>{item.serviceDistance || 'Nearby'}</span>
            </div>
          </div>
        )}

        {/* Tags renderer */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3 bg-[#F7F4FF]/70 p-1.5 rounded-xl border border-[#E6E1F5] shadow-inner">
            {item.tags.map(tag => (
              <span key={tag} className="text-[9px] font-bold bg-white text-[#6B25C9] border border-[#6B25C9]/25 px-2 py-0.5 rounded-md flex items-center gap-0.5 leading-none shadow-sm">
                <Hash className="w-2.5 h-2.5 text-[#6B25C9]" />
                {tag}
              </span>
            ))}
          </div>
        )}

      </div>

      {/* Button Action Bar */}
      <div className="border-t border-[#E6E1F5] pt-3.5 flex items-center justify-between" id={`card-actions-${item.id}`}>
        
        {/* Left item actions */}
        <div className="flex items-center gap-2">
          {/* Like Button */}
          <button
            id={`like-btn-${item.id}`}
            onClick={() => onLike(item.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black cursor-pointer transition-all duration-200 border transform active:scale-90 hover:scale-105 select-none ${
              item.likedByUser 
                ? 'text-[#C9256B] bg-[#C9256B]/10 border-[#C9256B]/30 shadow-sm' 
                : 'text-slate-500 hover:text-[#C9256B] hover:bg-slate-50 border-transparent'
            }`}
          >
            <Heart className={`w-4 h-4 transition-transform duration-300 ${item.likedByUser ? 'fill-current scale-110 text-[#C9256B]' : ''}`} />
            <span>{item.likes}</span>
          </button>

          {/* Comment collapse button */}
          <button
            id={`comments-collapse-btn-${item.id}`}
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl text-xs font-black text-slate-500 hover:text-[#6B25C9] hover:bg-slate-50 border border-transparent hover:border-[#6B25C9]/20 cursor-pointer transition-all duration-200 select-none"
          >
            <MessageSquare className="w-4 h-4 text-[#6B25C9]" />
            <span>{item.commentsCount}</span>
          </button>
        </div>

        {/* Right item actions */}
        <div className="flex items-center gap-2">
          {/* Save / Bookmarks button */}
          <button
            id={`bookmark-btn-${item.id}`}
            onClick={() => onSave(item.id)}
            className={`p-2 rounded-2xl cursor-pointer transition-all duration-200 border transform active:scale-90 hover:scale-105 ${
              item.savedByUser 
                ? 'text-[#2F7CCB] bg-[#2F7CCB]/10 border-[#2F7CCB]/30 shadow-sm' 
                : 'text-slate-500 hover:text-[#2F7CCB] hover:bg-slate-50 border-transparent'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${item.savedByUser ? 'fill-current text-[#2F7CCB]' : ''}`} />
          </button>

          {/* Share link button */}
          <button
            id={`share-btn-${item.id}`}
            onClick={handleShareClick}
            className="p-2 rounded-2xl text-slate-500 hover:text-[#2F7CCB] hover:bg-slate-50 border border-transparent hover:border-[#2F7CCB]/25 cursor-pointer transition-all duration-200 relative"
          >
            <Share2 className="w-4 h-4" />
            <AnimatePresence>
              {copied && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: -25 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 bg-[#161A33] text-white text-[8px] px-2 py-0.5 rounded shadow-xl border border-slate-700 whitespace-nowrap z-30 font-black"
                >
                  Link copied!
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>

      </div>

      {/* Expanded Comment Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            id={`card-expanded-comments-${item.id}`}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden border-t border-[#E6E1F5] mt-2.5 pt-3"
          >
            <h4 className="text-[11px] font-black uppercase text-slate-500 tracking-wider mb-2 flex items-center gap-1">
              {getTranslation('commentsTitle', language)} • {item.commentsList.length} replies
            </h4>

            {/* List of comments */}
            <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-1 mb-3">
              {item.commentsList.length === 0 ? (
                <div className="text-center py-4 text-slate-450 text-[11px] font-bold">
                  {getTranslation('noComments', language)}
                </div>
              ) : (
                item.commentsList.map(comment => (
                  <div key={comment.id} className="flex gap-2 text-xs bg-[#F3F7FF] p-2.5 rounded-xl border border-[#E6E1F5] text-slate-700">
                    <img 
                      src={comment.authorAvatar} 
                      alt={comment.authorName} 
                      className="w-7 h-7 rounded-lg object-cover shrink-0 border border-slate-350"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-[#161A33]">{comment.authorName}</span>
                        <span className="text-[9px] text-slate-500">{comment.date}</span>
                      </div>
                      <span className="text-[9px] text-[#6B25C9] font-extrabold bg-[#6B25C9]/10 border border-[#6B25C9]/25 px-1.5 py-0.2 rounded mt-0.5 block w-max leading-none">
                        {getRoleLabel(comment.authorRole)}
                      </span>
                      <p className="text-slate-700 text-[11px] font-medium mt-1 leading-normal break-words">{comment.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Add Comment Input Form */}
            <form onSubmit={handleCommentSubmit} className="flex items-center gap-1.5" id={`comment-form-${item.id}`}>
              <input
                type="text"
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                placeholder={getTranslation('writeComment', language)}
                className="flex-1 bg-white rounded-xl px-3 py-2 text-xs border border-[#E6E1F5] focus:outline-none focus:border-[#6B25C9] text-[#161A33] focus:bg-[#F3F7FF]"
              />
              <button
                type="submit"
                id={`comment-submit-btn-${item.id}`}
                className="p-2.5 bg-[#FFD21F] hover:bg-[#FFE052] text-[#161A33] border border-[#161A33] rounded-xl shadow cursor-pointer hover:scale-105 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
      </>
      )}

    </motion.div>
  );
}

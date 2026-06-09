import React, { useState } from 'react';
import { FeedItem, Comment, Language } from '../types';
import { getTranslation } from '../data/translations';
import { motion, AnimatePresence } from 'motion/react';
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
  onAddComment
}: FeedCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [copied, setCopied] = useState(false);

  // Select proper localized strings
  const title = language === 'ar' ? item.titleAR : language === 'ku' ? item.titleKU : item.titleEN;
  const content = language === 'ar' ? item.contentAR : language === 'ku' ? item.contentKU : item.contentEN;

  // Custom visual definitions based on content category
  const getTypeBadge = () => {
    const defaultCategory = item.opportunityCategory || '';
    
    switch (item.type) {
      case 'announcement':
        return { text: language === 'ar' ? 'إعلان ففمي' : language === 'ku' ? 'ڕاگەیاندن' : 'Official', color: 'bg-red-50 text-red-600 border-red-100' };
      case 'job':
      case 'full_time_job':
        return { text: language === 'ar' ? 'دوام كامل' : language === 'ku' ? 'دەوامی تەواو' : 'Full-Time Job', color: 'bg-emerald-50 text-emerald-600 border-emerald-100' };
      case 'part_time_job':
        return { text: language === 'ar' ? 'دوام جزئي' : language === 'ku' ? 'دەوامی کاتی' : 'Part-Time Job', color: 'bg-teal-50 text-teal-600 border-teal-100' };
      case 'internship':
        return { text: language === 'ar' ? 'تدريب عملي' : language === 'ku' ? 'مەشق' : 'Internship', color: 'bg-violet-50 text-violet-600 border-violet-100' };
      case 'scholarship':
        return { text: language === 'ar' ? 'منحة دراسية' : language === 'ku' ? 'بورس' : 'Scholarship', color: 'bg-indigo-50 text-indigo-600 border-indigo-100' };
      case 'training':
        return { text: language === 'ar' ? 'دورة تدريبية' : language === 'ku' ? 'ڕاهێنان' : 'Training Course', color: 'bg-cyan-50 text-cyan-600 border-cyan-100' };
      case 'volunteering':
        return { text: language === 'ar' ? 'عمل تطوعي' : language === 'ku' ? 'خۆبەخشی' : 'Volunteering', color: 'bg-lime-50 text-lime-700 border-lime-100' };
      case 'competition':
        return { text: language === 'ar' ? 'مسابقة' : language === 'ku' ? 'کێبڕکێ' : 'Competition', color: 'bg-amber-50 text-amber-600 border-amber-100' };
      case 'graduation_project_support':
        return { text: language === 'ar' ? 'دعم مشاريع' : language === 'ku' ? 'پاڵپشتی پڕۆژە' : 'Project Grant', color: 'bg-pink-50 text-pink-600 border-pink-100' };
      case 'event':
        return { text: language === 'ar' ? 'فعالية تواصل' : language === 'ku' ? 'چالاکی' : 'Campus Event', color: 'bg-rose-50 text-rose-600 border-rose-100' };
      case 'study_group':
        return { text: language === 'ar' ? 'غروب مراجعة' : language === 'ku' ? 'گروپی خوێندن' : 'Study Group', color: 'bg-sky-50 text-sky-600 border-sky-100' };
      case 'poll':
        return { text: language === 'ar' ? 'استطلاع رأي' : language === 'ku' ? 'ڕاپرسی' : 'Campus Poll', color: 'bg-orange-50 text-orange-600 border-orange-100' };
      case 'anonymous_question':
        return { text: language === 'ar' ? 'سؤال مجهول' : language === 'ku' ? 'بپرسە بێناو' : 'Anon Question', color: 'bg-gray-100 text-gray-700 border-gray-200' };
      case 'video':
        return { text: language === 'ar' ? 'فيديو ترفيهي' : language === 'ku' ? 'ڤیدیۆ' : 'Campus Video', color: 'bg-orange-50 text-orange-600 border-orange-100' };
      case 'photo':
        return { text: language === 'ar' ? 'صورة الحرم' : language === 'ku' ? 'وێنە' : 'Campus Photo', color: 'bg-blue-50 text-blue-600 border-blue-100' };
      default:
        // Check fallback by opportunity category
        if (defaultCategory) {
          return { text: defaultCategory, color: 'bg-indigo-50 text-indigo-600 border-indigo-100' };
        }
        return { text: language === 'ar' ? 'منشور طلابي' : language === 'ku' ? 'بڵاوکراوە' : 'Student Post', color: 'bg-gray-50 text-gray-600 border-gray-150' };
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
      className={`bg-white rounded-2xl border border-gray-100/90 shadow-sm hover:shadow-md transition-shadow p-4 mb-4 relative flex flex-col`}
    >
      
      {/* Top Meta info */}
      <div className="flex items-center justify-between mb-3" id={`card-header-${item.id}`}>
        <div className="flex items-center gap-2.5">
          {/* Avatar with role status ring */}
          <div className="relative">
            <img 
              src={item.author.avatar} 
              alt={item.author.name}
              className={`w-10 h-10 rounded-xl object-cover border-2 ${
                item.author.role === 'institution' ? 'border-red-500/60' : item.author.role === 'teacher' ? 'border-indigo-500/60' : 'border-orange-500/40'
              }`}
              referrerPolicy="no-referrer"
            />
            {item.author.verified && (
              <span className="absolute -bottom-1 -right-1 bg-gradient-to-tr from-amber-500 to-orange-500 text-white rounded-full p-0.5 border-2 border-white flex items-center justify-center">
                <svg className="w-2.5 h-2.5 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"></path></svg>
              </span>
            )}
          </div>
          <div>
            <div className="flex items-center gap-1">
              <h3 className="text-xs font-extrabold text-gray-900 leading-tight">
                {item.type === 'anonymous_question' ? getTranslation('anonymousLabel', language) : item.author.name}
              </h3>
              {item.author.verified && (
                <span className="text-[9px] font-bold bg-amber-50 text-amber-600 px-1 py-0.2 rounded-md border border-amber-100">
                  {getTranslation('verifiedPartner', language)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-400 mt-0.5">
              <span className="font-semibold text-orange-500 bg-orange-50 px-1 py-0.2 rounded">
                {getRoleLabel(item.author.role)}
              </span>
              <span>•</span>
              <span>{item.date}</span>
            </div>
          </div>
        </div>

        {/* Content Type Badge */}
        <span className={`text-[10px] font-bold px-2 py-1 rounded-lg border leading-none ${badge.color}`}>
          {badge.text}
        </span>
      </div>

      {/* Main Body */}
      <div className="flex-1" id={`card-body-${item.id}`}>
        {/* Localized Title */}
        {title && (
          <h2 className="text-sm font-black text-gray-900 tracking-tight leading-snug mb-1.5">
            {title}
          </h2>
        )}

        {/* Localized Content Text */}
        <p className="text-xs font-medium text-gray-700 leading-relaxed break-words whitespace-pre-line mb-3">
          {content}
        </p>

        {/* Media Attachments */}
        {item.imageUrl && (
          <div className="rounded-xl overflow-hidden mb-3 border border-gray-100/30 max-h-56 bg-gray-50 flex items-center justify-center">
            <img src={item.imageUrl} alt={title} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
          </div>
        )}

        {/* Video simulation */}
        {item.type === 'video' && item.videoThumbnail && (
          <div className="rounded-xl overflow-hidden mb-3 border border-gray-100/30 h-48 bg-gray-950 relative flex items-center justify-center">
            <img src={item.videoThumbnail} alt={title} className="w-full h-full object-cover opacity-70" referrerPolicy="no-referrer" />
            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-white/95 text-orange-600 flex items-center justify-center shrink-0 shadow-lg cursor-pointer hover:scale-105 active:scale-95 transition-all">
                <svg className="w-5 h-5 fill-current ml-1" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>
            {/* Fake Tik Tok / Reels like telemetry overlays */}
            <div className="absolute bottom-2 left-2 text-[10px] bg-black/60 text-white rounded px-1.5 py-0.5 backdrop-blur-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
              <span>Campus Reels</span>
            </div>
          </div>
        )}

        {/* SPECIFIC INTERACTIVE STATIONS */}
        
        {/* A. Poll View */}
        {item.type === 'poll' && item.pollOptions && (
          <div className="bg-amber-50/50 p-3 rounded-xl border border-amber-100/50 mb-3 flex flex-col gap-2">
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
                  className={`w-full relative py-2.5 px-3 rounded-lg border text-left text-xs font-bold transition-all overflow-hidden flex justify-between items-center ${
                    isUserSelection
                      ? 'border-orange-500 text-orange-950'
                      : hasVoted
                      ? 'border-gray-150 text-gray-500'
                      : 'border-orange-200 bg-white hover:border-orange-400 text-gray-800 active:bg-orange-50/30'
                  }`}
                >
                  {/* Dynamic absolute background representing percentage bar */}
                  {hasVoted && (
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 0.6 }}
                      className={`absolute top-0 left-0 bottom-0 ${
                        isUserSelection ? 'bg-orange-100' : 'bg-gray-100'
                      } -z-10`}
                    />
                  )}
                  <span className="relative z-10 break-words max-w-[80%]">{optText}</span>
                  {hasVoted && (
                    <span className="relative z-10 font-mono text-[11px] font-black text-gray-900 shrink-0">
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
          <div className="bg-gradient-to-br from-indigo-50/40 via-white to-orange-50/10 p-4 rounded-2xl border border-indigo-100/60 flex flex-col gap-3 mb-4 shadow-sm relative overflow-hidden">
            {/* Soft decorative background spot */}
            <div className="absolute -top-12 -right-12 w-24 h-24 bg-orange-200/20 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-indigo-200/20 rounded-full blur-2xl pointer-events-none" />

            {/* Header: Company Profile Info */}
            <div className="flex items-start justify-between gap-2.5 relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-orange-100 border border-orange-200 text-orange-600 shadow-sm font-extrabold flex items-center justify-center text-lg select-none shrink-0">
                  {item.companyLogo || '💼'}
                </div>
                <div>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <h4 className="text-[12px] font-black text-gray-800 leading-tight">
                      {item.company || 'Iraq Opportunity Provider'}
                    </h4>
                    {(item.companyVerified || item.author.verified) && (
                      <span className="text-[9px] font-extrabold bg-green-50 text-green-600 px-1 py-0.2 rounded border border-green-100 flex items-center gap-0.5 leading-none shrink-0" title="Official Partner Verified">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] text-gray-500 font-bold mt-0.5">
                    <span className="flex items-center gap-0.5 text-orange-500">
                      <MapPin className="w-3 h-3 shrink-0" />
                      {item.location || 'All Iraq'}
                    </span>
                    <span>•</span>
                    <span className="bg-indigo-50 text-indigo-600 px-1.5 py-0.2 rounded text-[9px] font-black">
                      {item.workplaceType || 'On-site'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Deadline Tag with youthful animation */}
              {item.deadline && (
                <div className="text-right shrink-0">
                  <span className="text-[8px] font-black uppercase tracking-wider text-red-400 block">Deadline</span>
                  <span className="text-[10px] font-extrabold text-red-500 bg-red-50 border border-red-100 px-2 py-0.5 rounded-lg flex items-center gap-0.5 mt-0.5 animate-pulse">
                    ⏰ {item.deadline}
                  </span>
                </div>
              )}
            </div>

            {/* Who Can Apply Eligibility Alert Section */}
            {item.whoCanApply && (
              <div className="bg-orange-50/30 p-2.5 rounded-xl border border-orange-100/50 text-[10px] text-gray-700 leading-relaxed relative z-10 font-bold flex items-start gap-1.5">
                <span className="text-sm shrink-0 leading-none">🎯</span>
                <div>
                  <span className="text-orange-900 font-black text-[9px] uppercase tracking-wider block mb-0.5">Who can apply</span>
                  <span className="text-gray-800 font-extrabold">{item.whoCanApply}</span>
                </div>
              </div>
            )}

            {/* Campus Social Proof Block (Students who applied) */}
            <div className="flex items-center gap-2 mt-0.5 bg-emerald-50/40 p-2 rounded-xl border border-emerald-100/50 relative z-10">
              <div className="flex -space-x-1.5">
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-orange-400 to-amber-300 border border-white text-[8px] flex items-center justify-center font-bold shadow-sm">🙋‍♂️</div>
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-400 to-sky-300 border border-white text-[8px] flex items-center justify-center font-bold shadow-sm">🙋‍♀️</div>
                <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-pink-400 to-rose-300 border border-white text-[8px] flex items-center justify-center font-bold shadow-sm">✨</div>
              </div>
              <p className="text-[10px] text-emerald-800 font-extrabold leading-tight">
                {item.universityAppliedCount || 6} students from your university applied
              </p>
            </div>

            {/* Saves and Badges Stats tracker */}
            <div className="flex items-center gap-2 text-[10px] text-gray-500 font-bold justify-between pt-1">
              <span className="flex items-center gap-1 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md text-[9px] font-black uppercase">
                🏷️ {item.opportunityCategory || 'Career'}
              </span>
              <span className="text-indigo-600 flex items-center gap-0.5 bg-indigo-50/50 px-2 py-0.5 rounded-lg text-[9px] font-black">
                ⭐ {item.savedByUser ? (item.savedCount || 12) + 1 : (item.savedCount || 12)} saved by peers
              </span>
            </div>

            {/* Quick Interactive Button Deck */}
            <div className="flex gap-1.5 mt-1 pt-2 border-t border-gray-100 relative z-10">
              <button
                id={`apply-btn-${item.id}`}
                onClick={() => onApply(item.id)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-black tracking-tight cursor-pointer transition-all flex items-center justify-center gap-1.5 ${
                  item.applied
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-md shadow-emerald-500/10 hover:shadow-lg'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white hover:-translate-y-0.5 active:translate-y-0 shadow shadow-indigo-600/10'
                }`}
              >
                {item.applied ? (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Applied Successfully!</span>
                  </>
                ) : (
                  <>
                    <Briefcase className="w-4 h-4" />
                    <span>{getTranslation('applyNow', language)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* C. Interactive Event Station */}
        {item.type === 'event' && (
          <div className="bg-pink-50/30 p-3 rounded-xl border border-pink-100/50 mb-3 flex flex-col gap-2.5">
            <div className="flex flex-col gap-1.5 text-[11px] font-bold text-gray-700">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-pink-500 shrink-0" />
                <span>{item.eventDate} • {item.eventTime}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400 shrink-0" />
                <span className="text-gray-600 break-words">{item.eventVenue}</span>
              </div>
            </div>

            <div className="flex items-center justify-between border-t border-pink-100/40 pt-2">
              <span className="text-[10px] text-pink-600 font-extrabold bg-pink-50 px-1.5 py-0.5 rounded">
                🎯 {item.eventRsvpCount || 0} students listed
              </span>

              <button
                id={`rsvp-btn-${item.id}`}
                onClick={() => onRsvp(item.id)}
                className={`py-1.5 px-3 rounded-lg text-[11px] font-black cursor-pointer transition-all ${
                  item.eventRsvped
                    ? 'bg-pink-600 text-white shadow shadow-pink-600/10'
                    : 'bg-white text-pink-600 border border-pink-200 hover:bg-pink-50/40'
                }`}
              >
                {item.eventRsvped ? getTranslation('rsvped', language) : getTranslation('rsvpBtn', language)}
              </button>
            </div>
          </div>
        )}

        {/* D. Study Group Station */}
        {item.type === 'study_group' && (
          <div className="bg-indigo-50/40 p-3 rounded-xl border border-indigo-100/50 mb-3 flex flex-col gap-2">
            <div className="flex items-center justify-between text-[11px] font-bold text-gray-700">
              <span className="text-indigo-600 uppercase text-[9px] tracking-wider">Subject</span>
              <span className="text-gray-800 bg-white border border-gray-100 px-2 py-0.5 rounded-md">
                {item.subject}
              </span>
            </div>

            <div className="flex items-center justify-between border-t border-indigo-150/30 pt-2 mt-1">
              <span className="text-[10px] text-gray-500 font-bold flex items-center gap-1">
                <Users className="w-4 h-4 text-indigo-400" />
                {item.memberCount || 1} studying inside
              </span>

              <button
                id={`join-group-btn-${item.id}`}
                onClick={() => onJoinGroup(item.id)}
                className={`py-1.5 px-3 rounded-lg text-[11px] font-black cursor-pointer transition-all ${
                  item.joined
                    ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                    : 'bg-indigo-600 text-white hover:bg-indigo-700'
                }`}
              >
                {item.joined ? getTranslation('joined', language) : getTranslation('joinGroup', language)}
              </button>
            </div>
          </div>
        )}

        {/* E. Local Service Card */}
        {item.type === 'local_service' && (
          <div className="bg-slate-50 p-2.5 rounded-xl border border-gray-150 mb-3 flex flex-col gap-1.5">
            <div className="flex justify-between items-center text-[10px] font-bold text-gray-600">
              <span className="bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded uppercase text-[8px]">
                Nearest Campus Asset
              </span>
              <span className="text-amber-500">
                ★ {item.serviceRating || '5.0'}
              </span>
            </div>
            <div className="text-[10px] font-semibold text-gray-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-orange-400" />
              <span>{item.serviceDistance || 'Nearby'}</span>
            </div>
          </div>
        )}

        {/* Tags renderer */}
        {item.tags && item.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3 bg-gray-50 p-1.5 rounded-xl">
            {item.tags.map(tag => (
              <span key={tag} className="text-[9px] font-bold bg-white text-gray-500 border border-gray-100 px-2 py-0.6 rounded-md flex items-center gap-0.5 leading-none">
                <Hash className="w-2.5 h-2.5 text-orange-400" />
                {tag}
              </span>
            ))}
          </div>
        )}

      </div>

      {/* Button Action Bar */}
      <div className="border-t border-gray-100 pt-2 flex items-center justify-between" id={`card-actions-${item.id}`}>
        
        {/* Left item actions */}
        <div className="flex items-center gap-1.5">
          {/* Like Button */}
          <button
            id={`like-btn-${item.id}`}
            onClick={() => onLike(item.id)}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-extrabold cursor-pointer transition-all hover:bg-red-50 ${
              item.likedByUser ? 'text-red-500' : 'text-gray-400 hover:text-red-500'
            }`}
          >
            <Heart className={`w-4 h-4 ${item.likedByUser ? 'fill-current scale-110' : ''}`} />
            <span>{item.likes}</span>
          </button>

          {/* Comment collapse button */}
          <button
            id={`comments-collapse-btn-${item.id}`}
            onClick={() => setShowComments(!showComments)}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-extrabold text-gray-400 hover:text-orange-500 hover:bg-orange-50 cursor-pointer transition-colors"
          >
            <MessageSquare className="w-4 h-4" />
            <span>{item.commentsCount}</span>
          </button>
        </div>

        {/* Right item actions */}
        <div className="flex items-center gap-1">
          {/* Save / Bookmarks button */}
          <button
            id={`bookmark-btn-${item.id}`}
            onClick={() => onSave(item.id)}
            className={`p-1.5 rounded-xl cursor-pointer transition-colors ${
              item.savedByUser ? 'text-indigo-600 bg-indigo-50 hover:bg-indigo-100' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'
            }`}
          >
            <Bookmark className={`w-4 h-4 ${item.savedByUser ? 'fill-current' : ''}`} />
          </button>

          {/* Share link button */}
          <button
            id={`share-btn-${item.id}`}
            onClick={handleShareClick}
            className="p-1.5 rounded-xl text-gray-400 hover:text-orange-500 hover:bg-orange-50 cursor-pointer transition-colors relative"
          >
            <Share2 className="w-4 h-4" />
            <AnimatePresence>
              {copied && (
                <motion.span
                  initial={{ opacity: 0, scale: 0.8, y: -20 }}
                  animate={{ opacity: 1, scale: 1, y: -25 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="absolute bottom-full left-1/2 -translate-x-1/2 bg-gray-900 text-white text-[8px] px-1.5 py-0.5 rounded shadow whitespace-nowrap z-30"
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
            className="overflow-hidden border-t border-gray-100 mt-2 pt-3"
          >
            <h4 className="text-[11px] font-black uppercase text-gray-400 tracking-wider mb-2 flex items-center gap-1">
              {getTranslation('commentsTitle', language)} • {item.commentsList.length} replies
            </h4>

            {/* List of comments */}
            <div className="flex flex-col gap-2.5 max-h-48 overflow-y-auto pr-1 mb-3">
              {item.commentsList.length === 0 ? (
                <div className="text-center py-4 text-gray-400 text-[11px]">
                  {getTranslation('noComments', language)}
                </div>
              ) : (
                item.commentsList.map(comment => (
                  <div key={comment.id} className="flex gap-2 text-xs bg-gray-50/70 p-2 rounded-xl border border-gray-100">
                    <img 
                      src={comment.authorAvatar} 
                      alt={comment.authorName} 
                      className="w-7 h-7 rounded-lg object-cover shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-gray-900">{comment.authorName}</span>
                        <span className="text-[9px] text-gray-400">{comment.date}</span>
                      </div>
                      <span className="text-[9px] text-orange-500 font-bold bg-white border border-gray-100 px-1 rounded block w-max mt-0.5">
                        {getRoleLabel(comment.authorRole)}
                      </span>
                      <p className="text-gray-700 text-[11px] font-medium mt-1 leading-normal break-words">{comment.content}</p>
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
                className="flex-1 bg-gray-50 rounded-xl px-3 py-2 text-xs border border-gray-100 focus:outline-none focus:ring-1 focus:ring-orange-500 focus:bg-white text-gray-800"
              />
              <button
                type="submit"
                id={`comment-submit-btn-${item.id}`}
                className="p-2 bg-gradient-to-tr from-orange-500 to-amber-500 text-white rounded-xl shadow cursor-pointer hover:shadow-md transition-shadow shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

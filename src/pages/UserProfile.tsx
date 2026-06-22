import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Edit3, Grid, Bookmark, Save, ArrowLeft, MoreHorizontal, GraduationCap, MapPin, UserPlus, MessageCircle, Check, X } from 'lucide-react';

export default function UserProfile() {
  const [friendStatus, setFriendStatus] = useState<'none' | 'pending' | 'accepted'>('none');
  const [showMessageRequest, setShowMessageRequest] = useState(false);

  const handleFriendRequest = () => {
    if (friendStatus === 'none') {
      setFriendStatus('pending');
    } else if (friendStatus === 'pending') {
      setFriendStatus('none');
    }
  };

  const handleMessageRequest = () => {
    setShowMessageRequest(true);
  };

  return (
    <div className="pb-24 bg-surface min-h-screen">
      {/* Header / Cover */}
      <div className="relative h-48 mb-16">
        <img 
            src="https://picsum.photos/seed/profile_cover/1200/400" 
            alt="Cover" 
            className="w-full h-full object-cover"
            referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Profile Avatar */}
        <div className="absolute -bottom-14 right-6">
            <div className="relative">
                <img 
                    src="https://picsum.photos/seed/iraqi_student/400/400" 
                    alt="Profile" 
                    className="w-32 h-32 rounded-[2.5rem] border-4 border-white object-cover shadow-xl"
                    referrerPolicy="no-referrer"
                />
                <button className="absolute bottom-1 -left-1 bg-primary text-secondary p-2 rounded-xl border-2 border-white shadow-lg active:scale-95 transition-transform">
                    <Edit3 size={18} />
                </button>
            </div>
        </div>

        {/* Back and Settings */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
            <button className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white">
                <ArrowLeft size={20} />
            </button>
            <button className="p-2 bg-white/20 backdrop-blur-md rounded-xl text-white">
                <Settings size={20} />
            </button>
        </div>
      </div>

      {/* User Info */}
      <div className="px-6">
        <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-black text-secondary">عباس علي</h1>
            <div className="flex gap-2">
                 <span className="bg-primary/10 text-primary text-[10px] font-bold px-3 py-1 rounded-full border border-primary/20">طالب</span>
            </div>
        </div>
        <div className="flex flex-col gap-2 mb-6">
            <div className="flex items-center gap-2 text-gray-500 text-sm">
                <GraduationCap size={16} className="text-primary" />
                <span>طالب في جامعة بغداد - هندسة تقنيات المعلومات</span>
            </div>
            <div className="flex items-center gap-2 text-gray-500 text-sm">
                <MapPin size={16} className="text-primary" />
                <span>المحافظة: بغداد</span>
            </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-8 mb-8">
            <div className="flex flex-col">
                <span className="text-2xl font-black text-secondary font-inter">24</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Posts</span>
            </div>
            <div className="flex items-center gap-8 border-r border-gray-100 pr-8">
                <div className="flex flex-col">
                    <span className="text-2xl font-black text-secondary font-inter">1.2k</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Followers</span>
                </div>
                <div className="flex flex-col">
                    <span className="text-2xl font-black text-secondary font-inter">450</span>
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Following</span>
                </div>
            </div>
        </div>

        {/* Action Buttons - Friend Request & Message Request */}
        <div className="flex gap-3 mb-8">
            <AnimatePresence mode="wait">
              {friendStatus === 'none' ? (
                <motion.button
                  key="add-friend"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={handleFriendRequest}
                  className="flex-1 bg-primary text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <UserPlus size={20} />
                  <span>إضافة صديق</span>
                </motion.button>
              ) : friendStatus === 'pending' ? (
                <motion.button
                  key="pending-request"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  onClick={handleFriendRequest}
                  className="flex-1 bg-surface border-2 border-primary text-primary font-bold py-4 rounded-2xl active:scale-95 transition-transform flex items-center justify-center gap-2"
                >
                  <X size={20} />
                  <span>إلغاء الطلب</span>
                </motion.button>
              ) : (
                <motion.button
                  key="already-friends"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex-1 bg-green-500 text-white font-bold py-4 rounded-2xl shadow-xl shadow-green-500/20 flex items-center justify-center gap-2"
                >
                  <Check size={20} />
                  <span>أصدقاء</span>
                </motion.button>
              )}
            </AnimatePresence>
            
            <motion.button
              onClick={handleMessageRequest}
              className="flex-1 bg-secondary text-white font-bold py-4 rounded-2xl shadow-xl shadow-secondary/20 active:scale-95 transition-transform flex items-center justify-center gap-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <MessageCircle size={20} />
              <span>رسالة</span>
            </motion.button>
            
            <button className="w-16 bg-white border border-gray-100 flex items-center justify-center rounded-2xl active:scale-95 transition-all shadow-sm">
                <MoreHorizontal size={24} className="text-secondary" />
            </button>
        </div>

        {/* Message Request Modal */}
        <AnimatePresence>
          {showMessageRequest && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-6"
              onClick={() => setShowMessageRequest(false)}
            >
              <motion.div
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: 20 }}
                className="bg-white rounded-[2.5rem] p-8 max-w-md w-full shadow-2xl"
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-2xl font-black text-secondary mb-4 text-center">إرسال رسالة</h3>
                <textarea
                  placeholder="اكتب رسالتك هنا..."
                  className="w-full h-32 p-4 border-2 border-gray-200 rounded-2xl focus:border-primary outline-none resize-none mb-4 font-bold text-gray-800"
                  dir="rtl"
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowMessageRequest(false)}
                    className="flex-1 py-3 rounded-2xl font-bold border-2 border-gray-200 text-gray-600 hover:bg-gray-50 transition-all"
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={() => {
                      setShowMessageRequest(false);
                      // Handle message sending logic here
                    }}
                    className="flex-1 py-3 rounded-2xl font-bold bg-primary text-white hover:bg-secondary transition-all"
                  >
                    إرسال
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className="border-b border-gray-100 flex items-center justify-start gap-10 mb-6">
            <button className="relative pb-3 text-secondary font-black text-sm transition-all focus:outline-none">
                منشوراتي
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-primary rounded-full" />
            </button>
            <button className="pb-3 text-gray-400 font-bold text-sm transition-all">عني</button>
            <button className="pb-3 text-gray-400 font-bold text-sm transition-all">محفوظات</button>
        </div>

        {/* Posts Grid */}
        <div className="grid grid-cols-3 gap-2">
            {[1,2,3,4,5,6].map(i => (
                <div key={i} className="aspect-square bg-gray-100 rounded-xl overflow-hidden group active:scale-95 transition-transform">
                    <img src={`https://picsum.photos/seed/p${i}/300/300`} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
            ))}
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageCircle, X, Send, Minimize2, Maximize2, Users } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { getChatRooms, createChatRoom, getChatMessages, sendChatMessage } from '../lib/api';

interface Message {
  id: string;
  content: string;
  sender_id: string;
  sender_name: string;
  sender_avatar: string;
  created_at: string;
}

interface ChatRoom {
  id: string;
  other_user_name: string;
  other_user_avatar: string;
  last_message: string;
  last_message_time: string;
}

export default function ChatBox() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [activeRoom, setActiveRoom] = useState<ChatRoom | null>(null);
  const [rooms, setRooms] = useState<ChatRoom[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollingRef = useRef<NodeJS.Timeout>();

  // Fetch chat rooms
  useEffect(() => {
    if (!user || !isOpen) return;
    fetchRooms();
  }, [user, isOpen]);

  // Poll for new messages when room is active
  useEffect(() => {
    if (!activeRoom || isMinimized) {
      if (pollingRef.current) clearInterval(pollingRef.current);
      return;
    }

    fetchMessages();
    pollingRef.current = setInterval(fetchMessages, 3000); // Poll every 3 seconds

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeRoom, isMinimized]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchRooms = async () => {
    try {
      const data = await getChatRooms();
      setRooms(data);
    } catch (err) {
      console.error('Failed to fetch chat rooms:', err);
    }
  };

  const fetchMessages = async () => {
    if (!activeRoom) return;
    try {
      const data = await getChatMessages(activeRoom.id);
      setMessages(data);
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !activeRoom) return;
    setIsLoading(true);
    try {
      await sendChatMessage(activeRoom.id, newMessage.trim());
      setNewMessage('');
      await fetchMessages();
    } catch (err) {
      console.error('Failed to send message:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartChat = async (otherUserId: string) => {
    try {
      const room = await createChatRoom(otherUserId);
      setActiveRoom(room);
      await fetchRooms();
    } catch (err) {
      console.error('Failed to create chat room:', err);
    }
  };

  if (!user) return null;

  return (
    <>
      {/* Floating Chat Button */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-4 z-40 bg-primary text-white p-4 rounded-full shadow-2xl shadow-primary/30 hover:shadow-primary/50 transition-all"
      >
        <MessageCircle size={28} strokeWidth={2.5} />
      </motion.button>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={`fixed bottom-24 right-4 z-50 bg-white rounded-[2rem] shadow-2xl overflow-hidden border border-gray-100 ${
              isMinimized ? 'w-72 h-16' : 'w-96 h-[500px]'
            }`}
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-secondary to-secondary/90 text-white px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/20 rounded-full flex items-center justify-center">
                  <Users size={20} />
                </div>
                <div>
                  <h3 className="font-black text-sm">المحادثات</h3>
                  <p className="text-[10px] text-primary/80 font-bold">Chat</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  {isMinimized ? <Maximize2 size={18} /> : <Minimize2 size={18} />}
                </button>
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setActiveRoom(null);
                  }}
                  className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>

            {!isMinimized && (
              <>
                {/* Room List or Messages */}
                {!activeRoom ? (
                  <div className="h-[calc(100%-60px)] overflow-y-auto">
                    {rooms.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center text-gray-400 p-6 text-center">
                        <MessageCircle size={48} className="mb-3 opacity-30" />
                        <p className="text-sm font-bold">لا توجد محادثات بعد</p>
                        <p className="text-xs mt-1">ابدأ محادثة مع زميلك</p>
                      </div>
                    ) : (
                      <div className="p-2 space-y-1">
                        {rooms.map((room) => (
                          <button
                            key={room.id}
                            onClick={() => setActiveRoom(room)}
                            className="w-full p-3 rounded-2xl hover:bg-surface transition-colors text-right flex items-center gap-3"
                          >
                            <img
                              src={room.other_user_avatar || `https://picsum.photos/seed/${room.id}/50/50`}
                              className="w-12 h-12 rounded-full object-cover"
                              alt=""
                              referrerPolicy="no-referrer"
                            />
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-secondary text-sm truncate">{room.other_user_name}</p>
                              <p className="text-[10px] text-gray-400 truncate">{room.last_message || 'لا توجد رسائل'}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <>
                    {/* Active Room Header */}
                    <div className="px-4 py-3 border-b border-gray-100 flex items-center gap-3 bg-surface/50">
                      <button
                        onClick={() => setActiveRoom(null)}
                        className="p-1.5 hover:bg-gray-200 rounded-lg transition-colors"
                      >
                        <X size={18} />
                      </button>
                      <img
                        src={activeRoom.other_user_avatar || `https://picsum.photos/seed/${activeRoom.id}/50/50`}
                        className="w-10 h-10 rounded-full object-cover"
                        alt=""
                        referrerPolicy="no-referrer"
                      />
                      <div className="flex-1">
                        <p className="font-black text-secondary text-sm">{activeRoom.other_user_name}</p>
                        <p className="text-[10px] text-green-500 font-bold">متصل الآن</p>
                      </div>
                    </div>

                    {/* Messages */}
                    <div className="h-[calc(100%-140px)] overflow-y-auto p-4 space-y-3 bg-surface/30">
                      {messages.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-400 text-sm font-bold">
                          ابدأ المحادثة...
                        </div>
                      ) : (
                        messages.map((msg) => {
                          const isOwn = msg.sender_id === user.id;
                          return (
                            <div
                              key={msg.id}
                              className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                            >
                              <div
                                className={`max-w-[75%] p-3 rounded-2xl ${
                                  isOwn
                                    ? 'bg-primary text-white rounded-br-sm'
                                    : 'bg-white text-secondary border border-gray-100 rounded-bl-sm'
                                }`}
                              >
                                <p className="text-sm font-bold leading-relaxed">{msg.content}</p>
                                <p className={`text-[9px] mt-1 ${isOwn ? 'text-white/70' : 'text-gray-400'}`}>
                                  {new Date(msg.created_at).toLocaleTimeString('ar-IQ', {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </p>
                              </div>
                            </div>
                          );
                        })
                      )}
                      <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="absolute bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                          placeholder="اكتب رسالتك..."
                          className="flex-1 bg-surface rounded-2xl px-4 py-3 text-sm font-bold text-secondary outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                          dir="rtl"
                        />
                        <button
                          onClick={handleSendMessage}
                          disabled={!newMessage.trim() || isLoading}
                          className="bg-primary text-white p-3 rounded-2xl hover:bg-secondary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                        >
                          <Send size={18} />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

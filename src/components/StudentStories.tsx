import React, { useState, useEffect, useRef } from 'react';
import { Language } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { X, ChevronLeft, ChevronRight, Send, Heart, Sparkles, Trophy, MessageCircle } from 'lucide-react';

interface StorySlide {
  textEN: string;
  textAR: string;
  textKU: string;
  emoji: string;
  bgColor: string; // Tailwind gradient classes
  bgImage?: string; // Optional nice background illustration
}

interface StudentStory {
  id: string;
  nameEN: string;
  nameAR: string;
  nameKU: string;
  uniEN: string;
  uniAR: string;
  uniKU: string;
  avatarEmoji: string;
  avatarColor: string; // e.g. bg-purple-500
  avatarUrl?: string; // Optional real photo URL
  slides: StorySlide[];
  isSeen?: boolean;
}

const studentStoriesMockData: StudentStory[] = [
  {
    id: 'story-sara',
    nameEN: 'Sara Ahmed',
    nameAR: 'Ø³Ø§Ø±Ø© Ø£Ø­Ù…Ø¯',
    nameKU: 'Ø³Ø§Ø±Û• Ø¦Û•Ø­Ù…Û•Ø¯',
    uniEN: 'Univ of Baghdad ðŸ©º',
    uniAR: 'Ø¬Ø§Ù…Ø¹Ø© Ø¨ØºØ¯Ø§Ø¯ ðŸ©º',
    uniKU: 'Ø²Ø§Ù†Ú©Û†ÛŒ Ø¨Û•ØºØ¯Ø§ ðŸ©º',
    avatarEmoji: 'ðŸ‘©â€âš•ï¸',
    avatarColor: 'bg-emerald-500',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    slides: [
      {
        textEN: "Morning lab session checking microscopic cells! Midterms are so close ðŸ˜­ðŸ”¬",
        textAR: "Ø¬Ù„Ø³Ø© Ø§Ù„Ù…Ø®ØªØ¨Ø± Ø§Ù„ØµØ¨Ø§Ø­ÙŠØ© Ù„ÙØ­Øµ Ø§Ù„Ø®Ù„Ø§ÙŠØ§ Ø§Ù„Ù…Ø¬Ù‡Ø±ÙŠØ©! Ø§Ù„Ø§Ù…ØªØ­Ø§Ù†Ø§Øª Ø§Ù„Ù†ØµÙÙŠØ© Ø¨Ø§ØªØª Ù‚Ø±ÙŠØ¨Ø© Ø¬Ø¯Ø§Ù‹ ðŸ˜­ðŸ”¬",
        textKU: "Ú©Û†Ø¨ÙˆÙˆÙ†Û•ÙˆÛ•ÛŒ ØªØ§Ù‚ÛŒÚ¯Û•ÛŒ Ø¨Û•ÛŒØ§Ù†ÛŒØ§Ù† Ø¨Û† Ù¾Ø´Ú©Ù†ÛŒÙ†ÛŒ Ø®Ø§Ù†Û• ÙˆØ±Ø¯Ø¨ÛŒÙ†Û•Ú©Ø§Ù†! ØªØ§Ù‚ÛŒÚ©Ù†Ø¯Ø±Û•ÙˆÛ•Ú©Ø§Ù† Ù†Ø²ÛŒÚ©Ù† ðŸ˜­ðŸ”¬",
        emoji: 'ðŸ”¬',
        bgColor: 'from-emerald-700 via-teal-800 to-cyan-900',
        bgImage: 'https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&q=80&w=600'
      },
      {
        textEN: "Kurdistan study escape this weekend is planned! Need that fresh mountain air ðŸ”ï¸âœ¨",
        textAR: "ØªÙ… Ø§Ù„ØªØ®Ø·ÙŠØ· Ù„Ø±Ø­Ù„Ø© Ø¯Ø±Ø§Ø³ÙŠØ© Ø¥Ù„Ù‰ ÙƒÙˆØ±Ø¯Ø³ØªØ§Ù† Ø¹Ø·Ù„Ø© Ù†Ù‡Ø§ÙŠØ© Ù‡Ø°Ø§ Ø§Ù„Ø£Ø³Ø¨ÙˆØ¹! Ø£Ø­ØªØ§Ø¬ Ù‡ÙˆØ§Ø¡ Ø§Ù„Ø¬Ø¨Ù„ Ø§Ù„Ù†Ù‚ÙŠ ðŸ”ï¸âœ¨",
        textKU: "Ú¯Û•Ø´ØªÛŒ Ø®ÙˆÛŽÙ†Ø¯Ù† Ø¨Û† Ú©ÙˆØ±Ø¯Ø³ØªØ§Ù† Ø¨Û† Ú©Û†ØªØ§ÛŒÛŒ Ø¦Û•Ù… Ù‡Û•ÙØªÛ•ÛŒÛ• Ù¾Ù„Ø§Ù† Ø¨Û† Ø¯Ø§Ú•ÛŽÚ˜Ø±Ø§ÙˆÛ•! Ù¾ÛŽÙˆÛŒØ³ØªÙ… Ø¨Û• Ù‡Û•ÙˆØ§ÛŒ Ú†ÛŒØ§ Ù‡Û•ÛŒÛ• ðŸ”ï¸âœ¨",
        emoji: 'ðŸžï¸',
        bgColor: 'from-teal-700 to-indigo-800',
        bgImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&q=80&w=600'
      }
    ]
  },
  {
    id: 'story-mustafa',
    nameEN: 'Mustafa Ali',
    nameAR: 'Ù…ØµØ·ÙÙ‰ Ø¹Ù„ÙŠ',
    nameKU: 'Ù…Ø³ØªÛ•ÙØ§ Ø¹Û•Ù„ÛŒ',
    uniEN: 'Al-Mustansiriya Univ ðŸ’»',
    uniAR: 'Ø§Ù„Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ù…Ø³ØªÙ†ØµØ±ÙŠØ© ðŸ’»',
    uniKU: 'Ø²Ø§Ù†Ú©Û†ÛŒ Ù…ÙˆØ³ØªÛ•Ù†Ø³Ø±ÛŒÛ• ðŸ’»',
    avatarEmoji: 'ðŸ‘¨â€ðŸ’»',
    avatarColor: 'bg-cyan-500',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200',
    slides: [
      {
        textEN: "Building our AI-powered student assistant with Gemini API! App is almost alive! ðŸ¤–ðŸš€",
        textAR: "Ù†Ø¨Ù†ÙŠ Ù…Ø³Ø§Ø¹Ø¯Ù†Ø§ Ø§Ù„Ø·Ù„Ø§Ø¨ÙŠ Ø§Ù„Ù…Ø¯Ø¹ÙˆÙ… Ø¨Ø§Ù„Ø°ÙƒØ§Ø¡ Ø§Ù„Ø§ØµØ·Ù†Ø§Ø¹ÙŠ Ù…Ø¹ Gemini API! Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ Ø¹Ù„Ù‰ ÙˆØ´Ùƒ Ø§Ù„Ù†Ø¬Ø§Ø­ Ø§Ù„Ø¹Ù…Ù„ÙŠ! ðŸ¤–ðŸš€",
        textKU: "Ø¯Ø±ÙˆØ³ØªÚ©Ø±Ø¯Ù†ÛŒ ÛŒØ§Ø±ÛŒØ¯Û•Ø¯Û•Ø±ÛŒ Ù‚ÙˆØªØ§Ø¨ÛŒ Ù„Û•Ø³Û•Ø± Ø¨Ù†Û•Ù…Ø§ÛŒ Ú˜ÛŒØ±ÛŒ Ø¯Û•Ø³ØªÚ©Ø±Ø¯ Ø¨Û• Ø¨Û•Ú©Ø§Ø±Ù‡ÛŽÙ†Ø§Ù†ÛŒ Gemini! Ø¨Û•Ø±Ù†Ø§Ù…Û•Ú©Û• Ù†Ø²ÛŒÚ©Û• Ù„Û• Ø¯Û•Ø±Ú†ÙˆÙˆÙ†! ðŸ¤–ðŸš€",
        emoji: 'ðŸ¤–',
        bgColor: 'from-cyan-700 via-blue-800 to-indigo-900',
        bgImage: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&q=80&w=600'
      }
    ]
  },
  {
    id: 'story-rawan',
    nameEN: 'Rawan Omer',
    nameAR: 'Ø±ÙˆØ§Ù† Ø¹Ù…Ø±',
    nameKU: 'Ú•Û•ÙˆØ§Ù† Ø¹ÙˆÙ…Û•Ø±',
    uniEN: 'Univ of Sulaymaniyah ðŸ”ï¸',
    uniAR: 'Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ø³Ù„ÙŠÙ…Ø§Ù†ÙŠØ© ðŸ”ï¸',
    uniKU: 'Ø²Ø§Ù†Ú©Û†ÛŒ Ø³Ù„ÛŽÙ…Ø§Ù†ÛŒ ðŸ”ï¸',
    avatarEmoji: 'ðŸ‘©â€ðŸŽ¨',
    avatarColor: 'bg-indigo-500',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=200',
    slides: [
      {
        textEN: "Sunset over Mount Goizha from campus was stunning today! Beautiful breezes ðŸŒ„â˜•",
        textAR: "ØºØ±ÙˆØ¨ Ø§Ù„Ø´Ù…Ø³ ÙÙˆÙ‚ Ø¬Ø¨Ù„ ÙƒÙˆÙŠØ¬Ø© Ù…Ù† Ø§Ù„Ø­Ø±Ù… Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠ ÙƒØ§Ù† Ù…Ø°Ù‡Ù„Ø§Ù‹ Ø§Ù„ÙŠÙˆÙ…! Ù†Ø³Ù…Ø§Øª Ù…Ù†Ø¹Ø´Ø© ðŸŒ„â˜•",
        textKU: "Ø¦Ø§ÙˆØ§Ø¨ÙˆÙˆÙ†ÛŒ Ø®Û†Ø± Ø¨Û•Ø³Û•Ø± Ú†ÛŒØ§ÛŒ Ú¯Û†ÛŒÚ˜Û• Ù„Û• Ú©Û•Ù…Ù¾Û•Ø³Û•ÙˆÛ• Ø¦Û•Ù…Ú•Û† Ø³Û•Ø±Ù†Ø¬Ú•Ø§Ú©ÛŽØ´ Ø¨ÙˆÙˆ! Ú©Ø§ØªÛŽÚ©ÛŒ Ø¯ÚµÚ¯ÛŒØ± ðŸŒ„â˜•",
        emoji: 'ðŸŒ…',
        bgColor: 'from-indigo-700 via-purple-800 to-pink-700',
        bgImage: 'https://images.unsplash.com/photo-1501854140801-50d01698950b?auto=format&fit=crop&q=80&w=600'
      },
      {
        textEN: "Midterm study sessions with traditional Kurdish tea! Best fuel ever! ðŸ«–ðŸ“š",
        textAR: "Ø¬Ù„Ø³Ø§Øª Ø¯Ø±Ø§Ø³Ø© Ø§Ù„Ø§Ù…ØªØ­Ø§Ù†Ø§Øª Ø§Ù„Ù†ØµÙÙŠØ© Ù…Ø¹ Ø§Ù„Ø´Ø§ÙŠ Ø§Ù„ÙƒØ±Ø¯ÙŠ Ø§Ù„ØªÙ‚Ù„ÙŠØ¯ÙŠ! Ø£ÙØ¶Ù„ Ø¯Ø§ÙØ¹ Ø¹Ù„Ù‰ Ø§Ù„Ø¥Ø·Ù„Ø§Ù‚! ðŸ«–ðŸ“š",
        textKU: "Ø®ÙˆÛŽÙ†Ø¯Ù†ÛŒ ØªØ§Ù‚ÛŒÚ©Ø±Ø¯Ù†Û•ÙˆÛ•Ú©Ø§Ù† Ù„Û•Ú¯Û•Úµ Ú†Ø§ÛŒ Ú©ÙˆØ±Ø¯ÛŒ Ú•Û•Ø³Û•Ù†! Ø¨Ø§Ø´ØªØ±ÛŒÙ† ÙˆØ²Û• Ø¨Û•Ø®Ø´! ðŸ«–ðŸ“š",
        emoji: 'ðŸ«–',
        bgColor: 'from-purple-700 to-rose-700',
        bgImage: 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&q=80&w=600'
      }
    ]
  },
  {
    id: 'story-ali',
    nameEN: 'Ali Jabbar',
    nameAR: 'Ø¹Ù„ÙŠ Ø¬Ø¨Ø§Ø±',
    nameKU: 'Ø¹Û•Ù„ÛŒ Ø¬Û•Ø¨Ø§Ø±',
    uniEN: 'Univ of Basra ðŸŒ´',
    uniAR: 'Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ø¨ØµØ±Ø© ðŸŒ´',
    uniKU: 'Ø²Ø§Ù†Ú©Û†ÛŒ Ø¨Û•Ø³Ø±Û• ðŸŒ´',
    avatarEmoji: 'ðŸ‘¨â€âš•ï¸',
    avatarColor: 'bg-amber-500',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200',
    slides: [
      {
        textEN: "Long shift in clinical practice! Basra Heat is here but we keep smiling! ðŸ©ºðŸ¥¤",
        textAR: "Ù†ÙˆØ¨Ø© Ø¹Ù…Ù„ Ø·ÙˆÙŠÙ„Ø© ÙÙŠ Ø§Ù„ØªØ¯Ø±ÙŠØ¨ Ø§Ù„Ø³Ø±ÙŠØ±ÙŠ! Ø­Ø±Ø§Ø±Ø© Ø§Ù„Ø¨ØµØ±Ø© Ù…Ø±ØªÙØ¹Ø© ÙˆÙ„ÙƒÙ†Ù†Ø§ Ù…Ø³ØªÙ…Ø±ÙˆÙ† Ø¨Ø§Ù„Ø§Ø¨ØªØ³Ø§Ù…! ðŸ©ºðŸ¥¤",
        textKU: "Ú©Ø§Ø±ÛŽÚ©ÛŒ Ø¯Ø±ÛŽÚ˜Ø®Ø§ÛŒÛ•Ù† Ù„Û• Ù¾Ø±Ø§Ú©ØªÛŒÚ©ÛŒ Ù¾Ø²ÛŒØ´Ú©ÛŒ! Ú¯Û•Ø±Ù…Ø§ÛŒ Ø¨Û•Ø³Ø±Û• Ø²Û†Ø±Û• Ø¨Û•ÚµØ§Ù… Ù¾ÛŽÚ©Û•Ù†ÛŒÙ†Ù…Ø§Ù† Ø¨Û•Ø±Ø¯Û•ÙˆØ§Ù…Û•! ðŸ©ºðŸ¥¤",
        emoji: 'ðŸŒ´',
        bgColor: 'from-amber-650 via-orange-700 to-rose-700',
        bgImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80&w=600'
      }
    ]
  },
  {
    id: 'story-zahid',
    nameEN: 'Noor Al-Huda',
    nameAR: 'Ù†ÙˆØ± Ø§Ù„Ù‡Ø¯Ù‰',
    nameKU: 'Ù†ÙˆÙˆØ± Ø¦Û•Ù„Ù‡ÙˆØ¯Ø§',
    uniEN: 'Al-Nahrain Univ ðŸ”¬',
    uniAR: 'Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ù†Ù‡Ø±ÙŠÙ† ðŸ”¬',
    uniKU: 'Ø²Ø§Ù†Ú©Û†ÛŒ Ù†Û•Ù‡Ø±Û•ÛŒÙ† ðŸ”¬',
    avatarEmoji: 'ðŸ‘©â€ðŸ”¬',
    avatarColor: 'bg-rose-500',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200',
    slides: [
      {
        textEN: "Setting up our chemical reaction samples. They look like glowing gems! ðŸ§ªðŸ’Ž",
        textAR: "Ù†Ù‚ÙˆÙ… Ø¨Ø¥Ø¹Ø¯Ø§Ø¯ Ø¹ÙŠÙ†Ø§Øª Ø§Ù„ØªÙØ§Ø¹Ù„ Ø§Ù„ÙƒÙŠÙ…ÙŠØ§Ø¦ÙŠ. ØªØ¨Ø¯Ùˆ Ù…Ø«Ù„ Ù…Ø¬ÙˆÙ‡Ø±Ø§Øª Ù…ØªÙˆÙ‡Ø¬Ø©! ðŸ§ªðŸ’Ž",
        textKU: "Ø¦Ø§Ù…Ø§Ø¯Û•Ú©Ø±Ø¯Ù†ÛŒ Ù†Ù…ÙˆÙ†Û•ÛŒ Ú©Ø§Ø±Ù„ÛŽÚ©ÛŒ Ú©ÛŒÙ…ÛŒØ§ÛŒÛŒ. ÙˆÛ•Ú© Ú¯Û•ÙˆÙ‡Û•Ø±ÛŒ Ø¯Ø±Û•ÙˆØ´Ø§ÙˆÛ• Ø¯Û•Ø±Ø¯Û•Ú©Û•ÙˆÙ†! ðŸ§ªðŸ’Ž",
        emoji: 'ðŸ§ª',
        bgColor: 'from-rose-500 via-purple-600 to-indigo-700',
        bgImage: 'https://images.unsplash.com/photo-1596524430615-b46475ddff6e?auto=format&fit=crop&q=80&w=600'
      }
    ]
  },
  {
    id: 'story-soran',
    nameEN: 'Soran Dler',
    nameAR: 'Ø³ÙˆØ±Ø§Ù† Ø¯Ù„ÙŠØ±',
    nameKU: 'Ø³Û†Ø±Ø§Ù† Ø¯Ù„ÛŽØ±',
    uniEN: 'Salahaddin Univ ðŸ°',
    uniAR: 'Ø¬Ø§Ù…Ø¹Ø© ØµÙ„Ø§Ø­ Ø§Ù„Ø¯ÙŠÙ† ðŸ°',
    uniKU: 'Ø²Ø§Ù†Ú©Û†ÛŒ Ø³Û•ÚµØ§Ø­Û•Ø¯ÛŒÙ† ðŸ°',
    avatarEmoji: 'ðŸ‘¨â€ðŸŽ“',
    avatarColor: 'bg-violet-500',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200',
    slides: [
      {
        textEN: "Beautiful morning at the historic Erbil Citadel before lectures start ðŸŽ’ðŸ°",
        textAR: "ØµØ¨Ø§Ø­ Ø¬Ù…ÙŠÙ„ ÙÙŠ Ù‚Ù„Ø¹Ø© Ø£Ø±Ø¨ÙŠÙ„ Ø§Ù„ØªØ§Ø±ÙŠØ®ÙŠØ© Ù‚Ø¨Ù„ Ø¨Ø¯Ø¡ Ø§Ù„Ù…Ø­Ø§Ø¶Ø±Ø§Øª Ø§Ù„ÙŠÙˆÙ…ÙŠØ© ðŸŽ’ðŸ°",
        textKU: "Ø¨Û•ÛŒØ§Ù†ÛŒÛŒÛ•Ú©ÛŒ Ø¬ÙˆØ§Ù† Ù„Û• Ù‚Û•ÚµØ§ÛŒ Ù…ÛŽÚ˜ÙˆÙˆÛŒÛŒ Ù‡Û•ÙˆÙ„ÛŽØ± Ù¾ÛŽØ´ Ø¯Û•Ø³ØªÙ¾ÛŽÚ©Ø±Ø¯Ù†ÛŒ ÙˆØ§Ù†Û•Ú©Ø§Ù† ðŸŽ’ðŸ°",
        emoji: 'ðŸ°',
        bgColor: 'from-violet-600 via-indigo-600 to-purple-800',
        bgImage: 'https://images.unsplash.com/photo-1596463059386-4418116ded9c?auto=format&fit=crop&q=80&w=600'
      }
    ]
  }
];

interface StudentStoriesProps {
  language: Language;
  onAwardPoints?: (points: number) => void;
  showToast?: (text: string, type: 'success' | 'error' | 'info') => void;
}

export default function StudentStories({
  language,
  onAwardPoints,
  showToast
}: StudentStoriesProps) {
  // Read/Write active list including user stories
  const [stories, setStories] = useState<StudentStory[]>(() => {
    // Read seen status from local storage
    const savedSeen = localStorage.getItem('jamiaati_seen_stories');
    const seenIds = savedSeen ? JSON.parse(savedSeen) : [];
    
    // Read custom stories contributed by user
    const savedCustom = localStorage.getItem('jamiaati_custom_stories');
    const customStories: StudentStory[] = savedCustom ? JSON.parse(savedCustom) : [];
    
    // Merge administrator story modifications
    const editedDefaultsStr = localStorage.getItem('jamiaati_edited_default_stories');
    const editedDefaults = editedDefaultsStr ? JSON.parse(editedDefaultsStr) : [];
    
    const preparedDefaultStories = studentStoriesMockData.map(defaultStory => {
      const editMatch = editedDefaults.find((e: any) => e.id === defaultStory.id);
      if (editMatch) {
        return {
          ...defaultStory,
          nameEN: editMatch.name,
          nameAR: editMatch.name,
          nameKU: editMatch.name,
          avatarUrl: editMatch.avatar,
          slides: defaultStory.slides.map((s, idx) => idx === 0 ? {
            ...s,
            textEN: editMatch.text,
            textAR: editMatch.text,
            textKU: editMatch.text
          } : s)
        };
      }
      return defaultStory;
    });

    const combined = [...preparedDefaultStories, ...customStories];
    return combined.map(story => ({
      ...story,
      isSeen: seenIds.includes(story.id)
    }));
  });

  // Listen for administrator updates to story photos/text in real-time
  useEffect(() => {
    const handleSync = () => {
      const savedSeen = localStorage.getItem('jamiaati_seen_stories');
      const seenIds = savedSeen ? JSON.parse(savedSeen) : [];
      
      const savedCustom = localStorage.getItem('jamiaati_custom_stories');
      const customStories: StudentStory[] = savedCustom ? JSON.parse(savedCustom) : [];
      
      const editedDefaultsStr = localStorage.getItem('jamiaati_edited_default_stories');
      const editedDefaults = editedDefaultsStr ? JSON.parse(editedDefaultsStr) : [];
      
      const preparedDefaultStories = studentStoriesMockData.map(defaultStory => {
        const editMatch = editedDefaults.find((e: any) => e.id === defaultStory.id);
        if (editMatch) {
          return {
            ...defaultStory,
            nameEN: editMatch.name,
            nameAR: editMatch.name,
            nameKU: editMatch.name,
            avatarUrl: editMatch.avatar,
            slides: defaultStory.slides.map((s, idx) => idx === 0 ? {
              ...s,
              textEN: editMatch.text,
              textAR: editMatch.text,
              textKU: editMatch.text
            } : s)
          };
        }
        return defaultStory;
      });

      const combined = [...preparedDefaultStories, ...customStories];
      setStories(combined.map(story => ({
        ...story,
        isSeen: seenIds.includes(story.id)
      })));
    };

    window.addEventListener('jamiaati_stories_updated', handleSync);
    return () => {
      window.removeEventListener('jamiaati_stories_updated', handleSync);
    };
  }, []);

  const [activeStoryIdx, setActiveStoryIdx] = useState<number | null>(null);
  const [activeSlideIdx, setActiveSlideIdx] = useState<number>(0);
  const [replyText, setReplyText] = useState('');
  const [paused, setPaused] = useState(false);
  
  // Custom Live Story Creation States
  const [isCreatingStory, setIsCreatingStory] = useState(false);
  const [creatorName, setCreatorName] = useState(() => {
    try {
      const p = localStorage.getItem('jamiaati_profile_v2');
      return p ? JSON.parse(p).name : 'Zara Al-Iraqi';
    } catch {
      return 'Zara Al-Iraqi';
    }
  });
  const [selectedTemplate, setSelectedTemplate] = useState<number | 'custom'>(0);
  const [customTextEN, setCustomTextEN] = useState('');
  const [customTextAR, setCustomTextAR] = useState('');
  const [customTextKU, setCustomTextKU] = useState('');
  const [slideEmoji, setSlideEmoji] = useState('ðŸ’»');
  const [slideBg, setSlideBg] = useState('from-[#4F46E5] via-[#8B5CF6] to-[#EC4899]');

  const storyTemplates = [
    {
      id: 0,
      titleEN: 'ðŸ’» Software Coding',
      titleAR: 'ðŸ’» Ø¨Ø±Ù…Ø¬Ø© Ø¨Ø±Ù…Ø¬ÙŠØ§Øª',
      titleKU: 'ðŸ’» Ú©Û†Ø¯Ú©Ø±Ø¯Ù†ÛŒ Ù†Û•Ø±Ù…Û•Ú©Ø§ÚµØ§',
      emoji: 'ðŸ’»',
      bgColor: 'from-blue-600 via-violet-750 to-indigo-900',
      textEN: 'Coding our new graduation prototype using React & Tailwind! Running close database queries ðŸ’»ðŸš€',
      textAR: 'Ù†Ø¨Ø±Ù…Ø¬ Ù†Ù…ÙˆØ°Ø¬ ØªØ®Ø±Ø¬Ù†Ø§ Ø§Ù„Ø£ÙˆÙ„ÙŠ Ø§Ù„Ù…Ø¨ØªÙƒØ± Ø¨Ø§Ù„Ø§Ø¹ØªÙ…Ø§Ø¯ Ø¹Ù„Ù‰ Ù…ÙƒØªØ¨Ø§Øª React & Tailwind! Ù†Ù‚ÙˆÙ… Ø¨Ø¹Ù…Ù„ÙŠØ§Øª ØªØµÙÙŠØ© Ø¨ÙŠØ§Ù†Ø§Øª Ø³Ø±ÙŠØ¹Ø© ðŸ’»ðŸš€',
      textKU: 'Ú©Û†Ø¯Ú©Ø±Ø¯Ù†ÛŒ Ù¾Ú•Û†Ú˜Û•ÛŒ Ø¯Û•Ø±Ú†ÙˆÙˆÙ†Ù…Ø§Ù† Ø¨Û• Ø¨Û•Ú©Ø§Ø±Ù‡ÛŽÙ†Ø§Ù†ÛŒ React & Tailwind! Ø®Û•Ø±ÛŒÚ©Û• ØªÛ•ÙˆØ§Ùˆ Ø¯Û•Ø¨ÛŽØª ðŸ’»ðŸš€'
    },
    {
      id: 1,
      titleEN: 'ðŸ«– Cardamom Tea',
      titleAR: 'ðŸ«– Ø´Ø§ÙŠ Ù‡ÙŠÙ„ Ø¯Ø¨Ù„',
      titleKU: 'ðŸ«– Ú†Ø§ÛŒ Ù‡ÛŽÙ„ÛŒ Ø¯Ø¨Ù„',
      emoji: 'ðŸ«–',
      bgColor: 'from-amber-600 via-orange-600 to-rose-700',
      textEN: 'Cardamom double-fueled tea session near Mosul central library gardens to power through control exams! ðŸ“šâœ¨',
      textAR: 'Ø¬Ù„Ø³Ø© Ø´Ø§ÙŠ Ù…Ù‡ÙŠÙ„ Ø¹Ø±Ø§Ù‚ÙŠ Ù…Ø¶Ø§Ø¹Ù Ù‚Ø±Ø¨ Ø­Ø¯Ø§Ø¦Ù‚ Ù…ÙƒØªØ¨Ø© Ø¬Ø§Ù…Ø¹Ø© Ø§Ù„Ù…ÙˆØµÙ„ Ø§Ù„Ù…Ø±ÙƒØ²ÙŠØ© Ù„Ø§Ø¬ØªÙŠØ§Ø² Ø§Ù…ØªØ­Ø§Ù†Ø§Øª Ø§Ù„ØªØ­ÙƒÙ… Ø§Ù„Ø¹ØµÙŠØ¨Ø©! ðŸ“šâœ¨',
      textKU: 'Ø®ÙˆØ§Ø±Ø¯Ù†Û•ÙˆÛ•ÛŒ Ú†Ø§ÛŒÛ•Ú©ÛŒ Ù‡ÛŽÙ„ÛŒ Ú†Ú• Ù„Û• Ù†Ø²ÛŒÚ© Ú©ØªÛŽØ¨Ø®Ø§Ù†Û•ÛŒ Ù†Ø§ÙˆÛ•Ù†Ø¯ÛŒ Ø²Ø§Ù†Ú©Û†ÛŒ Ù…ÙˆÙˆØ³Úµ Ø¨Û† Ù…Ø±Ø§Ø¬Û•Ø¹Û•ÛŒ ØªØ§Ù‚ÛŒÚ©Ø±Ø¯Ù†Û•ÙˆÛ•Ú©Ø§Ù†! ðŸ“šâœ¨'
    },
    {
      id: 2,
      titleEN: 'ðŸŒ… Golden Hour',
      titleAR: 'ðŸŒ… Ø§Ù„Ø³Ø§Ø¹Ø© Ø§Ù„Ø°Ù‡Ø¨ÙŠØ©',
      titleKU: 'ðŸŒ… Ú©Ø§ØªÛŒ Ø²ÛŽÚ•ÛŒÙ†',
      emoji: 'ðŸŒ…',
      bgColor: 'from-indigo-600 via-purple-700 to-pink-600',
      textEN: 'Unwinding with music near the university fountain. The Kurdish mountains highlight the sunset beautifully ðŸŒ„ðŸ”ï¸',
      textAR: 'ÙØªØ±Ø© Ø§Ø³ØªØ±Ø®Ø§Ø¡ Ù„Ø·ÙŠÙØ© Ù…Ø¹ Ø§Ù„Ù…ÙˆØ³ÙŠÙ‚Ù‰ Ù‚Ø±Ø¨ Ù†Ø§ÙÙˆØ±Ø© Ø§Ù„Ø­Ø±Ù… Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠ. Ø¬Ø¨Ø§Ù„ ÙƒÙˆØ±Ø¯Ø³ØªØ§Ù† ØªØ±Ø³Ù… Ø§Ù„ØºØ±ÙˆØ¨ Ø¨Ø¬Ù…Ø§Ù„ÙŠØ© Ù„Ø§ ØªÙˆØµÙ ðŸŒ„ðŸ”ï¸',
      textKU: 'Ø¦Ø§Ø±Ø§Ù…Ú¯Ø±ØªÙ†Û•ÙˆÛ• Ù¾Ø§Ø´ ØªÛ•ÙˆØ§ÙˆØ¨ÙˆÙˆÙ†ÛŒ ÙˆØ§Ù†Û•Ú©Ø§Ù† Ù„Û• Ù†Ø²ÛŒÚ© Ù†Ø§ÙÙˆØ±Û•ÛŒ Ø²Ø§Ù†Ú©Û†. Ú†ÛŒØ§Ú©Ø§Ù†ÛŒ Ú©ÙˆØ±Ø¯Ø³ØªØ§Ù† Ø¯ÛŒÙ…Û•Ù†ÛŒ Ø¦Ø§ÙˆØ§Ø¨ÙˆÙˆÙ†Û•Ú©Û• Ø¬ÙˆØ§Ù†ØªØ± Ø¯Û•Ú©Û•Ù† ðŸŒ„ðŸ”ï¸'
    },
    {
      id: 3,
      titleEN: 'ðŸ¤ Study Group',
      titleAR: 'ðŸ¤ Ø­Ù„Ù‚Ø© Ø¯Ø±Ø§Ø³Ø©',
      titleKU: 'ðŸ¤ Ú¯Ø±ÙˆÙ¾ÛŒ Ø®ÙˆÛŽÙ†Ø¯Ù†',
      emoji: 'ðŸ¤',
      bgColor: 'from-emerald-600 via-teal-700 to-cyan-800',
      textEN: 'Productive group project session at Al-Mansour Coworking lounge. Tech ecosystem in Iraq is fast! ðŸš€ðŸ’¡',
      textAR: 'Ø¬Ù„Ø³Ø© Ø¹Ù…Ù„ Ù…Ø´ØªØ±ÙƒØ© ÙˆÙ…Ø«Ù…Ø±Ø© Ù„Ù…Ø´Ø±ÙˆØ¹Ù†Ø§ ÙÙŠ Ù‚Ø§Ø¹Ø© Ø§Ù„Ù…Ù†ØµÙˆØ± Ø§Ù„Ø°ÙƒÙŠØ©. Ø¨ÙŠØ¦Ø© Ø±ÙŠØ§Ø¯Ø© Ø§Ù„Ø£Ø¹Ù…Ø§Ù„ ÙÙŠ Ø§Ù„Ø¹Ø±Ø§Ù‚ ØªÙ†Ù…Ùˆ Ø¨Ø³Ø±Ø¹Ø© Ø®Ø§Ø±Ù‚Ø©! ðŸš€ðŸ’¡',
      textKU: 'Ú©Ø§Ø±ÛŽÚ©ÛŒ Ø¨Û•Ú©Û†Ù…Û•Úµ Ø¨Û•Ø±Ù‡Û•Ù…Ø¯Ø§Ø± Ø¨Û† ÛŒÛ•Ú©Û•Ù… Ù¾Ú•Û†Ú˜Û• Ù„Û• Ù‡Û†ÚµÛŒ Ù…Û•Ù†Ø³ÙˆØ±. Ø³ÛŒØ³ØªÛ•Ù…ÛŒ Ú©Û†Ù…Ù¾Ø§Ù†ÛŒØ§ Ø¯Û•Ø³ØªÙ¾ÛŽØ´Ø®Û•Ø±Û•Ú©Ø§Ù† Ù„Û• Ø¹ÛŽØ±Ø§Ù‚Ø¯Ø§ Ø®ÛŽØ±Ø§ÛŒÛ•! ðŸš€ðŸ’¡'
    }
  ];

  const handleCreateStorySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    let resultSlide: StorySlide;

    if (selectedTemplate === 'custom') {
      const txtEN = customTextEN.trim() || 'Excited for next university semester class! ðŸŒŸðŸŽ’';
      const txtAR = customTextAR.trim() || 'Ù…ØªØ­Ù…Ø³ Ù„Ø¨Ø¯Ø¡ Ø§Ù„ÙØµÙ„ Ø§Ù„Ø¯Ø±Ø§Ø³ÙŠ Ø§Ù„Ø¬Ø§Ù…Ø¹ÙŠ Ø§Ù„Ø¬Ø¯ÙŠØ¯ ÙˆÙ…Ù„Ø§Ù‚Ø§Ø© Ø§Ù„Ø£ØµØ¯Ù‚Ø§Ø¡! ðŸŒŸðŸŽ’';
      const txtKU = customTextKU.trim() || 'Ø¨Û•Ù¾Û•Ø±Û†Ø´Ù… Ø¨Û† Ø¯Û•Ø³ØªÙ¾ÛŽÚ©Ø±Ø¯Ù†ÛŒ ÙˆÛ•Ø±Ø²ÛŒ Ù†ÙˆÛŽÛŒ Ø²Ø§Ù†Ú©Û† Ùˆ Ø¨ÛŒÙ†ÛŒÙ†ÛŒ Ù‡Ø§ÙˆÚ•ÛŽÛŒØ§Ù†! ðŸŒŸðŸŽ’';
      resultSlide = {
        textEN: txtEN,
        textAR: txtAR,
        textKU: txtKU,
        emoji: slideEmoji,
        bgColor: slideBg
      };
    } else {
      const template = storyTemplates.find(t => t.id === selectedTemplate) || storyTemplates[0];
      resultSlide = {
        textEN: template.textEN,
        textAR: template.textAR,
        textKU: template.textKU,
        emoji: template.emoji,
        bgColor: template.bgColor
      };
    }

    const newStoryId = `story-user-${Date.now()}`;
    const newStory: StudentStory = {
      id: newStoryId,
      nameEN: creatorName,
      nameAR: creatorName,
      nameKU: creatorName,
      uniEN: language === 'ar' ? 'Ø¬Ø§Ù…Ø¹Ø© Ø¨ØºØ¯Ø§Ø¯ ðŸŽ“' : language === 'ku' ? 'Ø²Ø§Ù†Ú©Û†ÛŒ Ø¨Û•ØºØ¯Ø§ ðŸŽ“' : 'Univ of Baghdad ðŸŽ“',
      uniAR: 'Ø¬Ø§Ù…Ø¹Ø© Ø¨ØºØ¯Ø§Ø¯ ðŸŽ“',
      uniKU: 'Ø²Ø§Ù†Ú©Û†ÛŒ Ø¨Û•ØºØ¯Ø§ ðŸŽ“',
      avatarEmoji: selectedTemplate === 'custom' ? slideEmoji : (storyTemplates.find(t => t.id === selectedTemplate)?.emoji || 'ðŸŽ“'),
      avatarColor: 'bg-violet-600',
      slides: [resultSlide],
      isSeen: false
    };

    // Save to localStorage list of custom stories
    const savedCustom = localStorage.getItem('jamiaati_custom_stories');
    const existingCustom = savedCustom ? JSON.parse(savedCustom) : [];
    const updatedCustom = [...existingCustom, newStory];
    localStorage.setItem('jamiaati_custom_stories', JSON.stringify(updatedCustom));

    // Update state directly
    setStories(prev => [newStory, ...prev]);
    setIsCreatingStory(false);

    // Reset fields
    setCustomTextEN('');
    setCustomTextAR('');
    setCustomTextKU('');
    setSelectedTemplate(0);

    // Award points
    if (onAwardPoints) onAwardPoints(50);
    if (showToast) {
      showToast(
        language === 'ar' ? 'ØªÙ… Ù†Ø´Ø± ÙŠÙˆÙ…ÙŠØ§ØªÙƒ ÙˆÙ‚ØµØªÙƒ Ø¨Ù†Ø¬Ø§Ø­! ðŸŽ¬ +Ù¥Ù  Ù†Ù‚Ø·Ø© ØµÙ†Ø§Ø¹Ø© Ù…Ø­ØªÙˆÙ‰' : language === 'ku' ? 'Ú†ÛŒØ±Û†Ú©Û•Ú©Û•Øª Ø¨Û• Ø³Û•Ø±Ú©Û•ÙˆØªÙˆÙˆÛŒÛŒ Ø¨ÚµØ§ÙˆÚ©Ø±Ø§ÛŒÛ•ÙˆÛ•! ðŸŽ¬ +Ù¥Ù  Ø®Ø§Úµ' : 'Your Live Diary story is now live! ðŸŽ¬ +50 pts creator tier',
        'success'
      );
    }
  };
  
  // Progress bar duration per slide (ms)
  const SLIDE_DURATION = 4000;
  const progressTimer = useRef<NodeJS.Timeout | null>(null);
  const [progress, setProgress] = useState(0);

  // Sync seen stories
  const markStoryAsSeen = (id: string) => {
    setStories(prev => {
      const updated = prev.map(s => s.id === id ? { ...s, isSeen: true } : s);
      const seenIds = updated.filter(s => s.isSeen).map(s => s.id);
      localStorage.setItem('jamiaati_seen_stories', JSON.stringify(seenIds));
      return updated;
    });
  };

  const handleOpenStory = (index: number) => {
    setActiveStoryIdx(index);
    setActiveSlideIdx(0);
    setProgress(0);
    setReplyText('');
    setPaused(false);
    markStoryAsSeen(stories[index].id);
  };

  const handleCloseStory = () => {
    setActiveStoryIdx(null);
    setProgress(0);
  };

  const handleNextSlide = () => {
    if (activeStoryIdx === null) return;
    const currentStory = stories[activeStoryIdx];
    if (activeSlideIdx < currentStory.slides.length - 1) {
      setActiveSlideIdx(prev => prev + 1);
      setProgress(0);
    } else {
      // Go to next student's story if available
      if (activeStoryIdx < stories.length - 1) {
        handleOpenStory(activeStoryIdx + 1);
      } else {
        handleCloseStory();
      }
    }
  };

  const handlePrevSlide = () => {
    if (activeStoryIdx === null) return;
    if (activeSlideIdx > 0) {
      setActiveSlideIdx(prev => prev - 1);
      setProgress(0);
    } else {
      // Go to previous student's story if available
      if (activeStoryIdx > 0) {
        handleOpenStory(activeStoryIdx - 1);
        // Set to last slide of that story
        const prevStory = stories[activeStoryIdx - 1];
        setActiveSlideIdx(prevStory.slides.length - 1);
      }
    }
  };

  // Automated auto-play mechanism
  useEffect(() => {
    if (activeStoryIdx === null || paused) {
      if (progressTimer.current) clearInterval(progressTimer.current);
      return;
    }

    const intervalStep = 50; // Update progress every 50ms
    progressTimer.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimer.current!);
          handleNextSlide();
          return 0;
        }
        return prev + (intervalStep / SLIDE_DURATION) * 100;
      });
    }, intervalStep);

    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
    };
  }, [activeStoryIdx, activeSlideIdx, paused]);

  const handleReactWithEmoji = (emoji: string) => {
    if (onAwardPoints) onAwardPoints(10);
    if (showToast) {
      showToast(
        language === 'ar' ? `ØªÙ… ØªÙØ§Ø¹Ù„Ùƒ Ø¨Ù€ ${emoji}! ðŸ’– +Ù¡Ù  Ù†Ù‚Ø§Ø· ØªÙØ§Ø¹Ù„` : language === 'ku' ? `Ú©Ø§Ø±Ø¯Ø§Ù†Û•ÙˆÛ• Ù¾Û†Ø²Û•ØªÛŒÚ¤ ${emoji}! ðŸ’– +Ù¡Ù  Ø®Ø§Úµ` : `Reacted with ${emoji}! ðŸ’– +10 pts`,
        'success'
      );
    }
    // Briefly celebrate or skip
    handleNextSlide();
  };

  const handleSendReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    
    if (onAwardPoints) onAwardPoints(15);
    if (showToast) {
      showToast(
        language === 'ar' ? 'ØªÙ… Ø¥Ø±Ø³Ø§Ù„ Ø±Ø¯Ù‘Ùƒ Ø§Ù„Ù…Ø¨Ø§Ø´Ø± Ø¨Ù†Ø¬Ø§Ø­! ðŸ’¬ +Ù¡Ù¥ Ù†Ù‚Ø·Ø© ØªÙØ§Ø¹Ù„' : language === 'ku' ? 'ÙˆÛ•ÚµØ§Ù…Û•Ú©Û•Øª Ø¨Û• Ø³Û•Ø±Ú©Û•ÙˆØªÙˆÙˆÛŒÛŒ Ù†ÛŽØ±Ø¯Ø±Ø§! ðŸ’¬ +Ù¡Ù¥ Ø®Ø§Úµ' : 'Direct reply sent to student! ðŸ’¬ +15 pts',
        'success'
      );
    }
    setReplyText('');
    handleNextSlide();
  };

  const currentStory = activeStoryIdx !== null ? stories[activeStoryIdx] : null;
  const currentSlide = currentStory ? currentStory.slides[activeSlideIdx] : null;

  return (
    <div className="w-full mb-4 px-1" id="student-stories-section-container">
      {/* Stories Line Section Label */}
      <div className="flex items-center justify-between mb-3.5 px-1">
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-[#FFD21F] animate-spin" />
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#FFD21F] bg-[#1A0D3D] border border-rgba(139, 92, 246, 0.4) px-3 py-1 rounded-full leading-none shadow-sm">
            {language === 'ar' ? 'ÙŠÙˆÙ…ÙŠØ§Øª Ø·Ù„Ø§Ø¨Ù†Ø§ Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø© ðŸŽ¬' : language === 'ku' ? 'Ú†ÛŒØ±Û†Ú©ÛŒ Ù†Ø§ÛŒØ§Ø¨ÛŒ Ø®ÙˆÛŽÙ†Ø¯Ú©Ø§Ø±Ø§Ù† ðŸŽ¬' : 'LIVE STUDENT STORIES ðŸŽ¬'}
          </span>
        </div>
        <span className="text-[8.5px] font-bold text-violet-300 animate-pulse">
          {language === 'ar' ? 'Ø§Ø¶ØºØ· Ù„Ù„Ù…Ø´Ø§Ù‡Ø¯Ø© ðŸ¿' : language === 'ku' ? 'Ú©Ù„ÛŒÚ© Ø¨Ú©Û• Ø¨Û† Ø¨ÛŒÙ†ÛŒÙ† ðŸ¿' : 'Tap to watch ðŸ¿'}
        </span>
      </div>

      {/* Horizontal List Scroll */}
      <div 
        className="flex gap-4 overflow-x-auto pb-2.5 pt-0.5 scrollbar-none snap-x touch-pan-x" 
        id="student-stories-horizontal-bar"
      >
        {/* Your Story trigger */}
        <div 
          onClick={() => {
            setIsCreatingStory(true);
            if (onAwardPoints) onAwardPoints(5); // positive reinforcement
          }}
          className="flex flex-col items-center gap-1.5 snap-start cursor-pointer shrink-0"
          id="your-story-launch-trigger"
        >
          <div className="relative">
            <div className="flex items-center justify-center w-12.5 h-12.5 rounded-full bg-slate-800 border-2 border-dashed border-violet-500/50 p-[2px] transition-transform duration-200 active:scale-95">
              <span className="flex items-center justify-center w-full h-full bg-[#11052C] rounded-full text-base font-black text-violet-400">
                ï¼‹
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-slate-350 tracking-tight leading-none text-center">
            {language === 'ar' ? 'Ù‚ØµØªÙƒ' : language === 'ku' ? 'Ú†ÛŒØ±Û†Ú©Øª' : 'My Story'}
          </span>
        </div>

        {stories.map((story, idx) => {
          const name = language === 'ar' ? story.nameAR : language === 'ku' ? story.nameKU : story.nameEN;
          // Gradient Ring color depending on seen status
          const ringGradient = story.isSeen 
            ? 'from-slate-700 to-slate-500 opacity-60' 
            : 'from-pink-500 via-[#FFD21F] to-violet-500 animate-pulse';

          return (
            <div 
              key={story.id}
              className="flex flex-col items-center gap-1.5 snap-start cursor-pointer shrink-0 relative"
              onClick={() => handleOpenStory(idx)}
              id={`student-story-${story.id}`}
            >
              {/* Profile Avatar with Dynamic Story Frame */}
              <div className="relative group">
                {/* Visual border ring */}
                <span className={`absolute inset-0 rounded-full p-[2.2px] bg-gradient-to-tr ${ringGradient} shadow-md transition-all duration-300 group-hover:scale-110`} />
                
                {/* Central Inner Circle */}
                <div className="relative flex items-center justify-center w-12.5 h-12.5 bg-slate-900 rounded-full border-2 border-[#070314] overflow-hidden">
                  <span className={`absolute inset-0 ${story.avatarColor} opacity-20`} />
                  <span className="text-xl select-none transition-transform duration-300 group-hover:scale-110">
                    {story.avatarEmoji}
                  </span>
                </div>

                {/* Sparkling Mini Badges */}
                {!story.isSeen && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-rose-500 border border-white rounded-full flex items-center justify-center text-[7px] font-black text-white px-0.5">
                    1
                  </span>
                )}
              </div>

              {/* Story owner metadata */}
              <div className="flex flex-col items-center w-full">
                <span className={`text-[10px] tracking-tight leading-none text-center font-bold max-w-[72px] truncate ${
                  story.isSeen ? 'text-slate-400' : 'text-slate-100 font-extrabold'
                }`}>
                  {name}
                </span>
                <span className="text-[7px] text-[#A99ECA] font-medium scale-90 truncate max-w-[70px] mt-0.5">
                  {language === 'ar' ? story.uniAR : language === 'ku' ? story.uniKU : story.uniEN}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Fullscreen Storytelling Modal Panel */}
      <AnimatePresence>
        {activeStoryIdx !== null && currentStory && currentSlide && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md select-none touch-none p-0 sm:p-4"
            id="fullscreen-story-viewer-modal"
          >
            {/* Click handlers on outer edges to close */}
            <div className="absolute inset-0 cursor-zoom-out" onClick={handleCloseStory} />

            <div className="relative w-full h-full sm:h-[820px] sm:max-w-[460px] bg-slate-950 sm:rounded-3xl shadow-2xl border-0 sm:border-2 sm:border-violet-500/30 overflow-hidden flex flex-col justify-between z-10">
              
              {/* Top Interactive Segments & User Info Header Section */}
              <div className="absolute top-0 inset-x-0 bg-gradient-to-b from-black/80 via-black/40 to-transparent p-4 pt-6 z-20">
                
                {/* Horizontal segment loaders */}
                <div className="flex gap-1.5 mb-3.5 select-none">
                  {currentStory.slides.map((_, idx) => {
                    let fillWidth = '0%';
                    if (idx < activeSlideIdx) fillWidth = '100%';
                    else if (idx === activeSlideIdx) fillWidth = `${progress}%`;

                    return (
                      <div key={idx} className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-gradient-to-r from-[#FFD21F] to-rose-400 transition-all duration-75 ease-linear"
                          style={{ width: fillWidth }}
                        />
                      </div>
                    );
                  })}
                </div>

                {/* Profile Meta & Actions */}
                <div className="flex items-center justify-between">
                  {/* Left Side: Avatar, Name & University */}
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 bg-slate-900 rounded-full border border-yellow-400 flex items-center justify-center text-lg shadow-sm">
                      {currentStory.avatarEmoji}
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-black text-white flex items-center gap-1">
                        {language === 'ar' ? currentStory.nameAR : language === 'ku' ? currentStory.nameKU : currentStory.nameEN}
                        <Trophy className="w-3 h-3 text-[#FFD21F]" />
                      </span>
                      <span className="text-[9px] text-slate-300 font-bold">
                        {language === 'ar' ? currentStory.uniAR : language === 'ku' ? currentStory.uniKU : currentStory.uniEN}
                      </span>
                    </div>
                  </div>

                  {/* Right: Close Actions */}
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={() => setPaused(!paused)}
                      className="px-2 py-1 text-[9px] font-black uppercase text-white bg-white/10 hover:bg-white/20 rounded-full leading-none mr-1"
                    >
                      {paused ? 'â–¶ Play' : 'â¸ Pause'}
                    </button>
                    <button 
                      onClick={handleCloseStory}
                      className="p-1.5 bg-white/10 hover:bg-white/20 transition rounded-full text-white"
                      aria-label="Close Story"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Large Central Content Slide Area */}
              <div className={`flex-1 flex flex-col items-center justify-center p-6 bg-gradient-to-br ${currentSlide.bgColor} relative`}>
                
                {/* Decorative background grid pattern */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

                {/* Click and tap zones to go backwards or forwards directly */}
                <div 
                  className="absolute left-0 inset-y-0 w-1/4 z-10 cursor-w-resize" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevSlide();
                  }}
                  title="Previous Slide"
                />
                
                <div 
                  className="absolute right-0 inset-y-0 w-1/4 z-10 cursor-e-resize"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextSlide();
                  }}
                  title="Next Slide"
                />

                {/* Text and emoji focus */}
                <div className="text-center max-w-sm px-4 z-10 flex flex-col items-center gap-5 relative">
                  {/* Glowing core emoji */}
                  <motion.div 
                    initial={{ scale: 0.6, rotate: -15 }}
                    animate={{ scale: 1.1, rotate: 0 }}
                    transition={{ type: "spring", stiffness: 100 }}
                    className="w-20 h-20 bg-white/10 backdrop-blur-md rounded-full flex items-center justify-center text-4xl shadow-inner border border-white/20 select-none"
                  >
                    {currentSlide.emoji}
                  </motion.div>

                  {/* Slide text box with elegant neon effects */}
                  <motion.p 
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    key={`${activeStoryIdx}-${activeSlideIdx}`}
                    className="text-base sm:text-lg font-black text-white leading-relaxed tracking-tight break-words drop-shadow-md"
                  >
                    {language === 'ar' ? currentSlide.textAR : language === 'ku' ? currentSlide.textKU : currentSlide.textEN}
                  </motion.p>
                </div>
              </div>

              {/* Bottom Quick Messaging Interactive Tray & Reactions */}
              <div className="bg-gradient-to-t from-black via-black/90 to-black/30 p-5 pt-8 pb-7 select-none">
                
                {/* Row of quick interactive click reactions */}
                <div className="flex items-center justify-around gap-2 mb-4">
                  {['â¤ï¸', 'ðŸ‘', 'ðŸ”¥', 'ðŸ˜‚', 'ðŸ’¯', 'ðŸ™Œ'].map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => handleReactWithEmoji(emoji)}
                      className="text-2xl hover:scale-125 transition-transform duration-250 active:scale-90 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-2xl"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>

                {/* Interactive Reply Field */}
                <form onSubmit={handleSendReply} className="flex gap-2 relative">
                  <input 
                    type="text"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    placeholder={language === 'ar' ? 'Ø£Ø±Ø³Ù„ Ø±Ø¯Ø§Ù‹ Ø®Ø§ØµØ§Ù‹ Ù„Ù„ØºØ±ÙØ©... ðŸ’¬' : language === 'ku' ? 'Ù†Ø§Ù…Û•ÛŒÛ•Ú© Ø¨Ù†ÛŽØ±Û•... ðŸ’¬' : 'Send a private reply... ðŸ’¬'}
                    className="flex-1 bg-white/10 text-white placeholder-slate-400 text-xs px-4 py-3 rounded-2xl border border-white/20 focus:outline-none focus:border-yellow-400 focus:ring-1 focus:ring-yellow-450 text-left"
                    onFocus={() => setPaused(true)}
                    onBlur={() => setPaused(false)}
                  />
                  <button 
                    type="submit"
                    className="px-4 py-3 bg-[#6B25C9] hover:bg-gradient-to-r hover:from-[#6B25C9] hover:to-[#FFD21F]/80 text-white rounded-2xl flex items-center justify-center hover:scale-105 active:scale-95 transition"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>

                {/* Direct indicators */}
                <div className="flex justify-between items-center text-[8px] text-slate-400 font-bold mt-3.5 px-0.5">
                  <span>
                    {language === 'ar' ? 'Ø§Ù„Ø±Ø¯ ÙŠÙ…Ù†Ø­ +Ù¡Ù¥ Ù†Ù‚Ø·Ø©!' : 'Replies award +15 pts! ðŸŽ‰'}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="w-2.5 h-2.5 text-yellow-400" />
                    Student Live Diary
                  </span>
                </div>
              </div>

              {/* Manual navigation buttons for wider screens/desktops outside click areas */}
              <button 
                onClick={handlePrevSlide}
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/75 transition-all hidden sm:flex border border-white/10 z-20"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button 
                onClick={handleNextSlide}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-black/40 hover:bg-black/60 rounded-full text-white/75 transition-all hidden sm:flex border border-white/10 z-20"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Modern Trilingual Story Maker Wizard Modal */}
      <AnimatePresence>
        {isCreatingStory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto"
            id="story-maker-modal-overlay"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-[#12192C] border-2 border-[#1F2E4D] w-full max-w-md rounded-3xl p-5 sm:p-6 shadow-[0px_20px_50px_rgba(0,0,0,0.5)] text-left relative"
              id="story-maker-card"
            >
              {/* Close Button */}
              <button
                onClick={() => setIsCreatingStory(false)}
                className="absolute top-4 right-4 p-1.5 bg-white/5 hover:bg-white/10 transition rounded-full text-white cursor-pointer"
                aria-label="Close Story Maker"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-yellow-400 animate-pulse" />
                <h3 className="text-sm sm:text-base font-black text-white">
                  {language === 'ar' ? 'Ø§ØµÙ†Ø¹ ÙŠÙˆÙ…ÙŠØ§ØªÙƒ Ø§Ù„Ù…Ø¨Ø§Ø´Ø±Ø© ðŸŽ¬' : language === 'ku' ? 'Ú†ÛŒØ±Û†Ú©ÛŽÚ©ÛŒ Ú•Ø§Ø³ØªÛ•ÙˆØ®Û† Ø¯Ø±ÙˆØ³Øª Ø¨Ú©Û• ðŸŽ¬' : 'Create Live Student Story ðŸŽ¬'}
                </h3>
              </div>

              <form onSubmit={handleCreateStorySubmit} className="flex flex-col gap-4">
                
                {/* Creator Name Field */}
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-1.5">
                    {language === 'ar' ? 'Ø§Ø³Ù… ØµØ§Ø­Ø¨ Ø§Ù„Ù‚ØµØ© ðŸ‘¤' : language === 'ku' ? 'Ù†Ø§ÙˆÛŒ Ø®Ø§ÙˆÛ•Ù† Ú†ÛŒØ±Û†Ú© ðŸ‘¤' : 'Author Name / Handle ðŸ‘¤'}
                  </label>
                  <input
                    type="text"
                    value={creatorName}
                    onChange={e => setCreatorName(e.target.value)}
                    required
                    maxLength={24}
                    placeholder="Enter name..."
                    className="w-full text-xs font-bold text-white bg-slate-800/80 border border-slate-750 rounded-xl px-3 py-2.5 focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>

                {/* Grid Template Picker */}
                <div>
                  <label className="block text-[10px] uppercase font-black text-slate-400 mb-2">
                    {language === 'ar' ? 'Ø§Ø®ØªØ± Ù‚Ø§Ù„Ø¨ Ù‚ØµØªÙƒ âš¡' : language === 'ku' ? 'Ù‚Ø§Ù„Ø¨ Ø¨Û† Ú†ÛŒØ±Û†Ú©Û•Ú©Û•Øª Ø¯ÛŒØ§Ø±ÛŒØ¨Ú©Û• âš¡' : 'Select Story Template âš¡'}
                  </label>
                  <div className="grid grid-cols-2 gap-2 mb-2">
                    {storyTemplates.map(template => (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => setSelectedTemplate(template.id)}
                        className={`p-3 rounded-xl border-2 text-left transition-all cursor-pointer ${
                          selectedTemplate === template.id
                            ? 'border-yellow-400 bg-slate-800 shadow-[2px_2px_0px_0px_rgba(255,210,31,0.5)]'
                            : 'border-[#1F2E4D] bg-slate-900/40 hover:bg-slate-800/30'
                        }`}
                      >
                        <div className="text-base mb-1">{template.emoji}</div>
                        <div className="text-[10px] font-black text-white leading-tight">
                          {language === 'ar' ? template.titleAR : language === 'ku' ? template.titleKU : template.titleEN}
                        </div>
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setSelectedTemplate('custom')}
                      className={`p-3 rounded-xl border-2 text-left transition-all col-span-2 flex items-center justify-between cursor-pointer ${
                        selectedTemplate === 'custom'
                          ? 'border-yellow-400 bg-slate-800 shadow-[2px_2px_0px_0px_rgba(255,210,31,0.5)]'
                          : 'border-[#1F2E4D] bg-slate-900/40 hover:bg-slate-800/30'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-base">âœï¸</span>
                        <div className="text-[10px] font-black text-white">
                          {language === 'ar' ? 'âœï¸ Ø§ÙƒØªØ¨ Ù‚ØµØªÙƒ Ø§Ù„Ø®Ø§ØµØ© Ø¨Ø§Ù„ÙƒØ§Ù…Ù„' : language === 'ku' ? 'âœï¸ Ù†ÙˆÙˆØ³ÛŒÙ†ÛŒ Ú†ÛŒØ±Û†Ú©ÛŒ Ù…Û•ÛŒÙ„ÛŒ Ø®Û†Øª' : 'âœï¸ Write Custom Trilingual Story'}
                        </div>
                      </div>
                      <span className="text-[9px] font-mono text-violet-400 font-extrabold uppercase">Custom</span>
                    </button>
                  </div>
                </div>

                {/* Custom Editor Fields - Show only if selectedTemplate is 'custom' */}
                {selectedTemplate === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="flex flex-col gap-3.5 border-t border-slate-800 pt-3"
                  >
                    {/* TRILINGUAL TEXT INPUTS */}
                    <div>
                      <label className="block text-[8.5px] font-extrabold uppercase text-slate-400 mb-1 flex justify-between">
                        <span>English Story Caption ðŸ‡¬ðŸ‡§</span>
                        <span className="text-[7.5px] text-slate-500 font-bold">Max 120 chars</span>
                      </label>
                      <input
                        type="text"
                        value={customTextEN}
                        onChange={e => setCustomTextEN(e.target.value)}
                        maxLength={120}
                        placeholder="e.g. Debugging my database models after midnight! ðŸ’»âœ¨"
                        className="w-full text-xs font-semibold text-white bg-slate-800/50 border border-slate-750 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-[8.5px] font-extrabold uppercase text-slate-400 mb-1 flex justify-between">
                        <span>Ù†Øµ Ø§Ù„Ù‚ØµØ© Ø¨Ø§Ù„Ø¹Ø±Ø¨ÙŠØ© ðŸ‡®ðŸ‡¶</span>
                        <span className="text-[7.5px] text-slate-500 font-bold">Ø§Ù„Ø­Ø¯ Ø§Ù„Ø£Ù‚ØµÙ‰ Ù¡Ù¢Ù  Ø­Ø±Ù</span>
                      </label>
                      <input
                        type="text"
                        value={customTextAR}
                        onChange={e => setCustomTextAR(e.target.value)}
                        maxLength={120}
                        placeholder="Ù…Ø«Ø§Ù„: Ù…Ø±Ø§Ø¬Ø¹Ø© ÙƒÙˆØ¯ Ù‚Ø§Ø¹Ø¯Ø© Ø§Ù„Ø¨ÙŠØ§Ù†Ø§Øª Ù…Ø¹ Ø²Ù…Ù„Ø§Ø¦ÙŠ Ø¨Ø¹Ø¯ Ù…Ù†ØªØµÙ Ø§Ù„Ù„ÙŠÙ„! ðŸ’»âœ¨"
                        className="w-full text-xs font-semibold text-white bg-slate-800/50 border border-slate-750 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 transition-colors text-right"
                        dir="rtl"
                      />
                    </div>

                    <div>
                      <label className="block text-[8.5px] font-extrabold uppercase text-[#A99ECA] mb-1 flex justify-between">
                        <span>Ø¯Û•Ù‚ÛŒ Ú†ÛŒØ±Û†Ú© Ø¨Û• Ú©ÙˆØ±Ø¯ÛŒ â˜€ï¸</span>
                        <span className="text-[7.5px] text-slate-500 font-bold">Ø²Û†Ø±ØªØ±ÛŒÙ† Ù¡Ù¢Ù  Ù¾ÛŒØª</span>
                      </label>
                      <input
                        type="text"
                        value={customTextKU}
                        onChange={e => setCustomTextKU(e.target.value)}
                        maxLength={120}
                        placeholder="Ù†Ù…ÙˆÙ†Û•: Ú†Ø§Ú©Ú©Ø±Ø¯Ù†ÛŒ Ø¯Ø§ØªØ§Ø¨Û•ÛŒØ³Û•Ú©Û•Ù… Ù„Û•Ú¯Û•Úµ Ù‡Ø§ÙˆÚ•ÛŽÛŒØ§Ù†Ù… Ù¾Ø§Ø´ Ù†ÛŒÙˆÛ•Ø´Û•Ùˆ! ðŸ’»âœ¨"
                        className="w-full text-xs font-semibold text-white bg-slate-800/50 border border-slate-750 rounded-lg px-3 py-2 focus:outline-none focus:border-violet-500 transition-colors text-right"
                        dir="rtl"
                      />
                    </div>

                    {/* Emoji Select list */}
                    <div>
                      <label className="block text-[8.5px] font-black text-slate-400 uppercase mb-1.5">
                        Select Slide Emoji Key ðŸŽ­
                      </label>
                      <div className="flex gap-2.5 overflow-x-auto py-1 scrollbar-none">
                        {['ðŸ’»', 'ðŸ«–', 'ðŸŒ…', 'ðŸ”¬', 'ðŸŽ“', 'ðŸ¥', 'ðŸ§ ', 'ðŸŽ¨', 'ðŸš€', 'ðŸ’¯'].map(emoji => (
                          <button
                            key={emoji}
                            type="button"
                            onClick={() => setSlideEmoji(emoji)}
                            className={`w-9 h-9 text-lg rounded-full flex items-center justify-center transition-all shrink-0 cursor-pointer ${
                              slideEmoji === emoji
                                ? 'bg-violet-600 border-2 border-yellow-400 scale-110'
                                : 'bg-slate-850 border border-[#161B30]'
                            }`}
                          >
                            {emoji}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Custom bg selector list */}
                    <div>
                      <label className="block text-[8.5px] font-black text-slate-400 uppercase mb-1.5">
                        Choose Gradient Backdrop Theme ðŸŽ¨
                      </label>
                      <div className="flex gap-2.5 overflow-x-auto py-1 scrollbar-none">
                        {[
                          { id: 'grad-1', cls: 'from-blue-600 via-violet-750 to-indigo-900', label: 'Tech Space' },
                          { id: 'grad-2', cls: 'from-emerald-650 via-teal-700 to-cyan-800', label: 'Nature Green' },
                          { id: 'grad-3', cls: 'from-indigo-650 via-purple-700 to-pink-650', label: 'Epic Sunset' },
                          { id: 'grad-4', cls: 'from-amber-600 via-orange-650 to-red-700', label: 'Retro Warmth' },
                          { id: 'grad-5', cls: 'from-[#6B25C9] to-fuchsia-600', label: 'Vibrant Purple' },
                          { id: 'grad-6', cls: 'from-slate-800 via-pink-700 to-indigo-950', label: 'Hot Pink Nebula' }
                        ].map(bg => (
                          <button
                            key={bg.id}
                            type="button"
                            onClick={() => setSlideBg(bg.cls)}
                            title={bg.label}
                            className={`w-8 h-8 rounded-full bg-gradient-to-tr ${bg.cls} shrink-0 transition-all cursor-pointer ${
                              slideBg === bg.cls
                                ? 'border-2 border-white scale-115 ring-2 ring-yellow-405 shadow-inner'
                                : 'border border-black/40'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Submit row */}
                <div className="flex items-center justify-end gap-2.5 mt-2 border-t border-slate-800/80 pt-4">
                  <button
                    type="button"
                    onClick={() => setIsCreatingStory(false)}
                    className="text-[10px] font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-755 px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="text-[10px] font-black bg-[#FFD21F] hover:bg-[#FFE052] text-black px-5 py-2.5 rounded-xl shadow-md border-2 border-slate-950 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    ðŸš€ {language === 'ar' ? 'Ø§Ù†Ø´Ø± Ø§Ù„Ø¢Ù†' : language === 'ku' ? 'Ø¨ÚµØ§ÙˆÚ©Ø±Ø¯Ù†Û•ÙˆÛ•' : 'Publish Story'}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

